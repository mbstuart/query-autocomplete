import { Operator } from '../operator';

export class LTOperator implements Operator {
  name = 'Less than';

  key = 'LT';

  valueParser(text: string): number[] {
    return [parseFloat(text.trim())];
  }
}
