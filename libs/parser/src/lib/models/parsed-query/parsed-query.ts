import {
  isLogicalNodeWithPosition,
  LogicalNodeWithPosition,
} from './logical-node';
import { Query } from './query';
import { QueryNode, QueryNodeWithPosition } from './query-node';

export interface IParsedQuery {
  root: QueryNodeWithPosition;

  toQuery(): Query;
}

export class ParsedQuery implements IParsedQuery {
  root: QueryNodeWithPosition;

  toQuery(): Query {
    const parseQueryNode: (q: QueryNodeWithPosition) => QueryNode = (
      q: QueryNodeWithPosition
    ) => {
      if (isLogicalNodeWithPosition(q)) {
        const children = q.children.map((child) => parseQueryNode(child));
        return {
          children,
          logicalConnector: q.logicalConnector,
        };
      } else {
        return {
          operator: q.operator,
          property: q.property,
          values: q.values,
        };
      }
    };
    return {
      root: parseQueryNode(this.root),
    };
  }
}
