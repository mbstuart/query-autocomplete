import { AtomicNode } from './atomic-node';
import { LogicalNode } from './logical-node';
import { NodePosition } from './node-position';

export type QueryNode = AtomicNode | LogicalNode;

type AtomicNodeWithPosition = AtomicNode & { position: NodePosition };

export type QueryNodeWithPosition =
  | AtomicNodeWithPosition
  | (LogicalNode<QueryNode & { position: NodePosition }> & {
      position: NodePosition;
    });
