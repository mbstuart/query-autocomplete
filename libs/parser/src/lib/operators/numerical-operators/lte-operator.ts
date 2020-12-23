import { Operator } from '../operator';
import { NumericalOperator } from './numerical-operator';

export class LTEOperator extends NumericalOperator implements Operator {
  name = 'Less than or equal';

  key = 'LTE';
}
