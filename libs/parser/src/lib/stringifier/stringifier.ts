import { AtomicNode, LogicalNode, Query, QueryNode } from '../models';
import { DefaultOperators, Operator } from '../operators';
import { ParserOptions } from '../parser';

export interface IStringifier {
  stringify(query: Query): string;
}

export class Stringifier implements IStringifier {
  private readonly operators: {
    [key: string]: { operator: Operator; operatorKey: string };
  };

  constructor(opts?: ParserOptions) {
    let operators = {
      ...DefaultOperators,
    };

    if (opts && opts.operators) {
      operators = {
        ...operators,
        ...opts.operators,
      };
    }

    this.operators = this.invertOperatorDictionary(operators);
  }

  stringify(query: Query): string {
    const { root } = query;

    return this.stringifyQuery(root, true);
  }

  private stringifyQuery(node: QueryNode, isRoot?: boolean): string {
    if (this.isLogicalNode(node)) {
      const children = node.children.map((child) => this.stringifyQuery(child));

      return this.stringifyLogicalNode(node, children, isRoot);
    } else {
      const { operator, operatorKey } = this.operators[node.operator];

      if (!operator) {
        throw new Error(`Operator ${node.operator} not recognised`);
      }

      const values = operator.valueStringifer(operatorKey, node);

      return this.stringifyAtomicNode(operatorKey, operator, node);
    }
  }

  private stringifyLogicalNode(
    node: LogicalNode,
    childQueries: string[],
    skipBrackets?: boolean
  ): string {
    if (node.logicalConnector === 'AND' || node.logicalConnector === 'OR') {
      const statement = childQueries.join(` ${node.logicalConnector} `);
      if (skipBrackets) {
        return statement;
      } else {
        return `(${statement})`;
      }
    } else if (node.logicalConnector === 'NOT') {
      return `NOT(${childQueries[0]})`;
    }

    throw new Error(
      `Logical connector ${node.logicalConnector} not recognised`
    );
  }

  private stringifyAtomicNode(
    operatorKey: string,
    operator: Operator,
    node: AtomicNode
  ) {
    return `${
      node.property.includes(' ') ? `"${node.property}"` : node.property
    } ${operatorKey} ${operator.valueStringifer(operatorKey, node)}`;
  }

  private invertOperatorDictionary(operators: { [key: string]: Operator }) {
    const inverted: {
      [key: string]: { operator: Operator; operatorKey: string };
    } = Object.keys(operators)
      .map((key) => ({ key, operator: operators[key] }))
      .reduce(
        (
          invertedMap: {
            [key: string]: { operator: Operator; operatorKey: string };
          },
          currentValue
        ) => {
          return {
            ...invertedMap,
            [currentValue.operator.key]: {
              operator: currentValue.operator,
              operatorKey: currentValue.key,
            },
          };
        },
        {}
      );

    return inverted;
  }

  isLogicalNode(object: QueryNode): object is LogicalNode {
    return 'logicalConnector' in object;
  }
}
