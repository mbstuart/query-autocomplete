import { LogicalConnector } from './logical-connectors';
import { NodePosition } from './node-position';
import { QueryNode, QueryNodeWithPosition } from './query-node';

export interface LogicalNode<T extends QueryNode = QueryNode> {
  logicalConnector: LogicalConnector;

  children: T[];
}

export type LogicalNodeWithPosition = LogicalNode<QueryNodeWithPosition> & {
  position: NodePosition;
};

export function isLogicalNodeWithPosition(
  q: QueryNodeWithPosition
): q is LogicalNodeWithPosition {
  return 'logicalConnector' in q;
}
