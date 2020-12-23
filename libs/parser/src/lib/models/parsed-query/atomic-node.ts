import { NodePosition } from './node-position';
import { OperatorType } from './operators';
import { QueryValue } from './query-value';

export interface AtomicNode {
  property: string;

  operator: OperatorType;

  values: QueryValue[];
}

export type AtomicNodeWithPosition = AtomicNode & { position: NodePosition };
