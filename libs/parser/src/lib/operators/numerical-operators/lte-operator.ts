import { Operator } from '../operator';

export class LTEOperator implements Operator {
  name = 'Less than or equal';

  key = 'LTE';

  valueParser(text: string): number[] {
    return [parseFloat(text.trim())];
  }
}
