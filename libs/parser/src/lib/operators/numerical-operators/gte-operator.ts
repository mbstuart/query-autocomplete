import { Operator } from '../operator';
import { NumericalOperator } from './numerical-operator';

export class GTEOperator extends NumericalOperator implements Operator {
  name = 'Greater than or equal';

  key = 'GTE';
}
