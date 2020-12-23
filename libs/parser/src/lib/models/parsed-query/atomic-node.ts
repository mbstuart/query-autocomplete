import { OperatorType } from './operators';
import { QueryValue } from './query-value';

export interface AtomicNode {
  property: string;

  operator: OperatorType;

  values: QueryValue[];
}
