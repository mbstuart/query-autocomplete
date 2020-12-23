import { AtomicNode } from './atomic-node';
import { LogicalConnector } from './logical-connectors';
import { QueryNode } from './query-node';

export interface LogicalNode {
  logicalConnector: LogicalConnector;

  children: QueryNode[];
}
