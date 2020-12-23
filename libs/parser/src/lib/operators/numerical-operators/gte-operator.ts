import { Operator } from '../operator';

export class GTEOperator implements Operator {
  name = 'Greater than or equal';

  key = 'GTE';

  valueParser(text: string): number[] {
    return [parseFloat(text.trim())];
  }
}
