import { TokenType } from '@angular/compiler/src/ml_parser/lexer';
import { Observable, of } from 'rxjs';
import { OperatorType } from '../../parsed-query';
import { Suggestion } from '../../suggestion';
import { Property } from '../property';

export class ListProperty implements Property {
  public readonly options: Suggestion[] = null;

  public readonly operators = ['IN', 'IS'] as OperatorType[];

  constructor(
    public id: string,
    public name: string,
    options: { id: string; name: string }[]
  ) {
    this.options = options.map((opt) => ({ ...opt, type: 'AtomicValue' }));
  }

  public getOptions = (searchString: string) => {
    return of({
      optionType: 'list' as any,
      options: this.options.filter(
        (opt) =>
          opt.id.toUpperCase().includes(searchString) ||
          opt.name.toUpperCase().includes(searchString)
      ),
    });
  };
}
