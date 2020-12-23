import { LogicalConnector } from './logical-connectors';
import { QueryNode } from './query-node';

export interface LogicalNode<T extends QueryNode = QueryNode> {
  logicalConnector: LogicalConnector;

  children: T[];
}
