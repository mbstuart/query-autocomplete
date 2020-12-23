import { Operator } from '../operator';

export class GTOperator implements Operator {
  name = 'Greater than';

  key = 'GT';

  valueParser(text: string): number[] {
    return [parseFloat(text.trim())];
  }
}
