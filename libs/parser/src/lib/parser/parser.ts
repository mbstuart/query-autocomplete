import {
  AtomicNode,
  LogicalNode,
  OperatorType,
  ParsedQuery,
  QueryNode,
} from '../models';
import { DefaultOperators } from '../operators/default-operators';
import { Operator } from '../operators/operator';

const REGEX_PATTERNS = {
  BRACKETED: /\((.+)\)/,
};

export interface IParser {
  parse(queryString: string): ParsedQuery;
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

  parse(queryString: string): ParsedQuery {
    const preppedString = this.prepareString(queryString);

    const parsed: ParsedQuery = {
      root: this.splitByBrackets(preppedString),
    };

    return parsed;
  }

  private prepareString(queryString: string) {
    let preppedString = queryString.trim();

    preppedString = `(${preppedString})`;

    return preppedString;
  }

  private splitByBrackets(
    queryString: string,
    queryCache?: { [placeholder: string]: QueryNode }
  ) {
    if (!queryCache) {
      queryCache = {};
    }

    let res = REGEX_PATTERNS.BRACKETED.exec(queryString);

    let found: string;

    while ((found = res && res[1])) {
      const parsed = this.splitByBrackets(found);
      const placeholder = this.createPlaceholderId();
      queryCache[placeholder] = parsed;
      queryString = queryString.replace(res[0], placeholder);
      res = REGEX_PATTERNS.BRACKETED.exec(queryString);
    }

    return this.parseLogicalStatement(queryString, queryCache);
  }

  private createPlaceholderId() {
    return `placeholder-${Math.random().toString(36).slice(-5)}`;
  }

  private parseLogicalStatement(
    queryFragment: string,
    queryCache: { [placeholder: string]: QueryNode }
  ): QueryNode {
    const orSplit = queryFragment.split(' OR ');

    const andSplit = orSplit.map((frag) => frag.split(' AND '));

    const unpacked = andSplit.map((subs) =>
      subs.map((subString) => {
        if (queryCache[subString]) {
          return queryCache[subString];
        } else {
          return this.parseAtomicStatement(subString);
        }
      })
    );

    if (unpacked.length === 1 && unpacked[0].length === 1) {
      return unpacked[0][0];
    } else {
      const andsCollected: QueryNode[] = unpacked.reduce(
        (nodes: QueryNode[], ands) => {
          let val: QueryNode;

          if (ands.length === 1) {
            val = ands[0];
          } else {
            val = {
              logicalConnector: 'AND',
              children: ands,
            };
          }

          nodes.push(val);

          return nodes;
        },
        []
      );

      if (andsCollected.length === 1) {
        return andsCollected[0];
      }

      const orNode: LogicalNode = {
        logicalConnector: 'OR',
        children: [],
      };

      const orsCollected: QueryNode = andsCollected.reduce(
        (agg: LogicalNode, ands) => {
          agg.children.push(ands);

          return agg;
        },
        orNode
      );

      return orsCollected;
    }
  }

  private parseAtomicStatement(atomicFragment: string): AtomicNode {
    const split = atomicFragment.split(' ');

    const [property, operatorKey, ...values] = split;

    const operator = this.operators[operatorKey];

    if (!operator) {
      console.log(atomicFragment);
      throw Error(`No operator found for key '${operatorKey}'`);
    }

    const parsedValues = operator.valueParser(values.join(' '));

    return {
      operator: operator.key as OperatorType,
      values: parsedValues,
      property,
    };
  }
}
