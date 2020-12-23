import { AtomicNode } from '../models';
import { QueryValue } from '../models/parsed-query/query-value';

export interface Operator {
  name: string;

  key: string;

  valueParser(text: string): QueryValue[];

  valueStringifer(operatorKey: string, query: AtomicNode): string;
}
