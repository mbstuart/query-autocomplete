import {
  isLogicalNodeWithPosition,
  LogicalNodeWithPosition,
} from './logical-node';
import { Query } from './query';
import { QueryNode, QueryNodeWithPosition } from './query-node';
import { QueryToken } from './query-token';

const cleanseTokenPositions: (tokenPositions: {
  [start: number]: QueryToken;
}) => {
  [start: number]: QueryToken;
} = (tokenPositions) => {
  return Object.keys(tokenPositions).reduce(
    (
      agg: {
        [start: number]: QueryToken;
      },
      current: string
    ) => {
      const token: QueryToken = tokenPositions[current];

      return {
        ...agg,
        [current]: {
          type: token.type,
          node: null,
        },
      };
    },
    {}
  );
};
export interface IParsedQuery {
  root: QueryNodeWithPosition;

  toQuery(): Query;

  toPrintable(): Query;
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

  toPrintable(): Query {
    const parseQueryNode: (
      q: QueryNodeWithPosition
    ) => QueryNodeWithPosition = (q: QueryNodeWithPosition) => {
      if (isLogicalNodeWithPosition(q)) {
        const children = q.children.map((child) => parseQueryNode(child));
        return {
          children,
          logicalConnector: q.logicalConnector,
          position: {
            end: q.position.end,
            start: q.position.start,
            tokenPositions: cleanseTokenPositions(q.position.tokenPositions),
          },
        };
      } else {
        return {
          operator: q.operator,
          property: q.property,
          values: q.values,
          position: {
            end: q.position.end,
            start: q.position.start,
            tokenPositions: cleanseTokenPositions(q.position.tokenPositions),
          },
        };
      }
    };
    return {
      root: parseQueryNode(this.root),
    };
  }
}
