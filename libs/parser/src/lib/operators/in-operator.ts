import { AtomicNode } from '../models';
import { Operator } from './operator';

export class InOperator implements Operator {
  name = 'IN';

  key = 'IN';

  valueParser(text: string): string[] {
    if (text[0] === '[' && text[text.length - 1] === ']') {
      text = text.substring(1, text.length - 1);
    }

    return text
      .split(',')
      .map((field) => this.removeQuotesIfPresent(field.trim()));
  }

  valueStringifer(operatorKey: string, query: AtomicNode): string {
    return `[${query.values
      .map((val: string) => (val.includes(' ') ? `"${val}"` : val))
      .join(', ')}]`;
  }

  private removeQuotesIfPresent(field: string) {
    if (field[0] === '"' && field[field.length - 1] === '"') {
      return field.substring(1, field.length - 1);
    }

    return field;
  }
}
