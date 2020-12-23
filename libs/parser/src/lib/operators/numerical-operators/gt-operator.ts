import { Operator } from '../operator';
import { NumericalOperator } from './numerical-operator';

export class GTOperator extends NumericalOperator implements Operator {
  name = 'Greater than';

  key = 'GT';
}
