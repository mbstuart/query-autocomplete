import { AtomicNode } from '../../models';
import { Operator } from '../operator';

export abstract class NumericalOperator implements Operator {
  abstract name;

  abstract key;

  valueParser(text: string): number[] {
    return [parseFloat(text.trim())];
  }

  valueStringifer(operatorKey: string, node: AtomicNode) {
    return `${node.values[0]}`;
  }
}
