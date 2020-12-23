import {
  AtomicNode,
  LogicalNode,
  OperatorType,
  IParsedQuery,
  QueryNode,
  QueryNodeWithPosition,
  NodePosition,
  ParsedQuery,
  LogicalNodeWithPosition,
  AtomicNodeWithPosition,
} from '../models';
import { QueryToken } from '../models/parsed-query/query-token';
import { DefaultOperators } from '../operators/default-operators';
import { Operator } from '../operators/operator';

const REGEX_PATTERNS = {
  BRACKETED: /\((.+)\)/,
};

const LOGICAL_OPERATORS = {
  AND: ' AND ',
  OR: ' OR ',
  NOT: 'NOT',
};

export interface IParser {
  parse(queryString: string): IParsedQuery;
}

export interface ParserOptions {
  operators: { [key: string]: Operator };
}

export class Parser implements IParser {
  private readonly operators: { [key: string]: Operator } = {
    ...DefaultOperators,
  };

  constructor(options?: Partial<ParserOptions>) {
    if (options) {
      if (options.operators) {
        this.operators = {
          ...this.operators,
          ...options.operators,
        };
      }
    }
  }

  parse(queryString: string): IParsedQuery {
    const preppedString = this.prepareString(queryString);

    const parsed: IParsedQuery = new ParsedQuery();

    parsed.root = this.splitByBrackets(queryString, {}, 0);

    return parsed;
  }

  private prepareString(queryString: string) {
    let preppedString = queryString.trim();

    preppedString = `(${preppedString})`;

    return preppedString;
  }

  private splitByBrackets(
    queryString: string,
    queryCache: { [placeholder: string]: QueryNodeWithPosition },
    start
  ) {
    let res = REGEX_PATTERNS.BRACKETED.exec(queryString);

    let found: string;

    while ((found = res && res[1])) {
      const parsed = this.splitByBrackets(found, queryCache, res.index);
      const placeholder = this.createPlaceholderId(res[0].length);
      queryCache[placeholder] = parsed;
      queryString = queryString.replace(res[0], placeholder);
      res = REGEX_PATTERNS.BRACKETED.exec(queryString);
    }

    const statementParsed = this.parseLogicalStatement(
      queryString,
      queryCache,
      start
    );
    statementParsed.position.end += 2;

    return statementParsed;
  }

  private createPlaceholderId(length: number) {
    const placeholder = `placeholder-${(
      Math.random() * Math.pow(10, length)
    ).toString(16)}`.substring(0, length);

    if (placeholder.length !== length) {
      throw Error('Placeholder created incorrectly!');
    }

    return placeholder;
  }

  private parseLogicalStatement(
    queryFragment: string,
    queryCache: { [placeholder: string]: QueryNodeWithPosition },
    start: number
  ): QueryNodeWithPosition {
    const orSplit = queryFragment.split(LOGICAL_OPERATORS.OR);

    const andSplit = orSplit.map((frag) => frag.split(LOGICAL_OPERATORS.AND));

    let position = start;

    const unpacked: QueryNodeWithPosition[][] = andSplit.map((subs) => {
      const andStatement = subs.map((subString) => {
        let val: QueryNodeWithPosition;
        if (queryCache[subString]) {
          val = queryCache[subString];
          position += 2;
        } else {
          val = this.parseAtomicStatement(subString, position);
        }
        position += subString.length;
        return val;
      });

      position += LOGICAL_OPERATORS.AND.length;

      return andStatement;
    });

    if (unpacked.length === 1 && unpacked[0].length === 1) {
      return unpacked[0][0];
    } else {
      const andsCollected: QueryNodeWithPosition[] = unpacked.reduce(
        (nodes: QueryNodeWithPosition[], ands) => {
          let val: QueryNodeWithPosition;

          if (ands.length === 1) {
            val = ands[0];
          } else {
            val = {
              logicalConnector: 'AND',
              children: ands,
              position: null,
            };

            val.position = this.getPositionsFromChildElements(ands, val);
          }

          nodes.push(val);

          return nodes;
        },
        []
      );

      if (andsCollected.length === 1) {
        return andsCollected[0];
      }

      const orNode: LogicalNodeWithPosition = {
        logicalConnector: 'OR',
        children: [],
        position: null,
      };

      const orsCollected: QueryNodeWithPosition = andsCollected.reduce(
        (agg: LogicalNodeWithPosition, ands) => {
          agg.children.push(ands);

          return agg;
        },
        orNode
      );

      orNode.position = this.getPositionsFromChildElements(
        orNode.children,
        orNode
      );

      return orsCollected;
    }
  }

  private parseAtomicStatement(
    atomicFragment: string,
    start: number
  ): AtomicNodeWithPosition {
    const split = atomicFragment.split(' ');

    const [property, operatorKey, ...values] = split;

    const operator = this.operators[operatorKey && operatorKey.toUpperCase()];

    if (!operator) {
      const node: AtomicNodeWithPosition = {
        property,
        values: null,
        operator: null,
        position: null,
      };

      node.position = {
        start,
        end: start + atomicFragment.length,
        tokenPositions: {
          [start]: {
            type: 'AtomicProperty',
            node,
          },
          [start + property.length + 1]: {
            type: 'AtomicOperator',
            node,
          },
        },
      };

      return node;
    }

    const parsedValues = operator.valueParser(values.join(' '));

    const node: AtomicNodeWithPosition = {
      operator: operator.key as OperatorType,
      values: parsedValues,
      property,
      position: null,
    };

    node.position = {
      start,
      end: start + atomicFragment.length,
      tokenPositions: {
        [start]: {
          type: 'AtomicProperty',
          node,
        },
        [start + property.length + 1]: {
          type: 'AtomicOperator',
          node,
        },
        [start + property.length + 1 + operatorKey.length + 1]: {
          type: 'AtomicValue',
          node,
        },
      },
    };

    return node;
  }

  private getPositionsFromChildElements(
    children: QueryNodeWithPosition[],
    parentNode: QueryNodeWithPosition
  ) {
    const start = children[0].position.start;
    const end = children[children.length - 1].position.end;

    let positions: { [index: number]: QueryToken } = {
      [start]: {
        type: 'LogicalStart',
        node: parentNode,
      },
      [end]: {
        type: 'LogicalEnd',
        node: parentNode,
      },
    };

    positions = children.reduce((pos, child, i, arr) => {
      const updated: { [index: number]: QueryToken } = {
        ...pos,
        [child.position.start]: {
          type: 'LogicalComponent',
          node: child,
        },
      };

      if (arr.length - 1 !== i) {
        updated[child.position.end] = {
          type: 'LogicalOperator',
          node: parentNode,
        };
      }

      return updated;
    }, positions);

    return {
      start,
      end,
      tokenPositions: positions,
    };
  }
}
