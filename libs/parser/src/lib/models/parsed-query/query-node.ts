import { AtomicNode, AtomicNodeWithPosition } from './atomic-node';
import { LogicalNode, LogicalNodeWithPosition } from './logical-node';

export type QueryNode = AtomicNode | LogicalNode;

export type QueryNodeWithPosition =
  | AtomicNodeWithPosition
  | LogicalNodeWithPosition;
