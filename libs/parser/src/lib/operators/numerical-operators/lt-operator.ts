import { Operator } from '../operator';
import { NumericalOperator } from './numerical-operator';

export class LTOperator extends NumericalOperator implements Operator {
  name = 'Less than';

  key = 'LT';
}
