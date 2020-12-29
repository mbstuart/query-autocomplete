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
  isLogicalNodeWithPosition,
} from '../models';
import { QueryToken } from '../models/parsed-query/query-token';
import { DefaultOperators } from '../operators/default-operators';
import { Operator } from '../operators/operator';

function trimLeft(string) {
  const trimmed = (string + '$').trim();

  return trimmed.substring(0, trimmed.length - 1);
}

function randomString(len: number, charSet?: string) {
  charSet =
    charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let output = '';
  for (let i = 0; i < len; i++) {
    const randomPoz = Math.floor(Math.random() * charSet.length);
    output += charSet.substring(randomPoz, randomPoz + 1);
  }
  return output;
}

const REGEX_PATTERNS = {
  BRACKETED: /\((.+)\)/,
  QUOTED_SUBSTRINGS: /"[^"]*"/gm,
};

const LOGICAL_OPERATORS = {
  AND: ' AND',
  OR: ' OR',
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
    // queryString = this.prepareString(queryString);

    const { replacedString, substitutes } = this.replaceQuotedStringsWithTokens(
      queryString
    );

    const parsed: IParsedQuery = new ParsedQuery();

    parsed.root = this.splitByBrackets(replacedString, {}, 0);

    this.replaceSubstitutedValues(parsed.root, substitutes);

    return parsed;
  }
  private prepareString(queryString: string) {
    let preppedString = queryString.trim();

    preppedString = `(${preppedString})`;

    return preppedString;
  }

  private replaceSubstitutedValues(
    queryNode: QueryNodeWithPosition,
    substitutes: { [substituted: string]: string }
  ) {
    const replaceSubstitutedValueRecursively = (
      node: QueryNodeWithPosition
    ) => {
      if (isLogicalNodeWithPosition(node)) {
        node.children.forEach(replaceSubstitutedValueRecursively);
      } else {
        node.property =
          (substitutes[node.property] &&
            substitutes[node.property].substr(1, node.property.length - 2)) ||
          node.property;
        node.values = (node.values || []).map(
          (value) =>
            (substitutes[value] &&
              substitutes[value].substr(1, value.toString().length - 2)) ||
            value
        );
      }
    };

    replaceSubstitutedValueRecursively(queryNode);
  }

  private replaceQuotedStringsWithTokens(queryString: string) {
    const substitutes: { [substituted: string]: string } = {};

    const res = queryString.match(REGEX_PATTERNS.QUOTED_SUBSTRINGS) || [];

    let replacedString = queryString;

    res.forEach((matchedString) => {
      const substituteId = this.createPlaceholderId(matchedString.length, '');
      substitutes[substituteId] = matchedString;
      replacedString = replacedString.replace(matchedString, substituteId);
    });

    return {
      replacedString,
      substitutes,
    };
  }

  private splitByBrackets(
    queryString: string,
    queryCache: { [placeholder: string]: QueryNodeWithPosition },
    start,
    bracketed?: boolean
  ) {
    let res = REGEX_PATTERNS.BRACKETED.exec(queryString);

    let found: string;

    while ((found = res && res[1])) {
      const parsed = this.splitByBrackets(
        found,
        queryCache,
        res.index + 1,
        true
      );
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

    if (bracketed) {
      this.amendWithBracketsPositioning(statementParsed);
    }

    // statementParsed.position.end;

    return statementParsed;
  }

  private createPlaceholderId(length: number, prefix = 'pr-') {
    const placeholder = `${prefix}${randomString(length)}`.substring(0, length);

    if (placeholder.length !== length) {
      throw Error(
        `Placeholder created incorrectly! length: ${length}, placeholder: ${placeholder}`
      );
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

    const unpacked: QueryNodeWithPosition[][] = andSplit.map((subs, j) => {
      const andStatement = subs.map((subString, i) => {
        let val: QueryNodeWithPosition;
        if (queryCache[subString]) {
          val = queryCache[subString];
          // position += 1;
        } else {
          val = this.parseAtomicStatement(subString, position);
        }
        position += subString.length;
        if (i !== subs.length - 1) {
          position += LOGICAL_OPERATORS.AND.length;
        }
        return val;
      });

      if (j !== andSplit.length - 1) {
        position += LOGICAL_OPERATORS.OR.length;
      }

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

  private amendWithBracketsPositioning(qn: QueryNodeWithPosition) {
    qn.position.start = qn.position.start - 1;
    qn.position.end = qn.position.end + 1;
  }

  private parseAtomicStatement(
    atomicFragment: string,
    start: number
  ): AtomicNodeWithPosition {
    const trimmed = trimLeft(atomicFragment);
    const delta = atomicFragment.length - trimmed.length;
    const split = trimmed.split(' ');

    const [property, operatorKey, ...values] = split;

    const lastValueIndex =
      values && values[0] && values[0][0] === '['
        ? values.findIndex((val) => val[val.length - 1] === ']')
        : 0;

    const lastValue =
      lastValueIndex === -1
        ? values[values.length - 1]
        : values[lastValueIndex];

    const end = Math.max(
      lastValue
        ? start + atomicFragment.indexOf(lastValue) + lastValue.length - 1
        : start + atomicFragment.length,
      start
    );

    if (operatorKey === undefined) {
      const node: AtomicNodeWithPosition = {
        property,
        values: null,
        operator: null,
        position: null,
      };

      node.position = {
        start,
        end: end,
        tokenPositions: {
          [start]: {
            type: 'AtomicProperty',
            node,
          },
        },
      };

      return node;
    }

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
        end: end,
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
      end,
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
      // [end]: {
      //   type: 'LogicalEnd',
      //   node: parentNode,
      // },
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
