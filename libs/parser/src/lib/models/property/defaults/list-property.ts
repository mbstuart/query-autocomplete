import { of } from 'rxjs';
import { OperatorType } from '../../parsed-query';
import { Suggestion } from '../../suggestion';
import { Property } from '../property';

export class ListProperty implements Property {
  public readonly options = null;

  public readonly operators = ['IN', 'IS'] as OperatorType[];

  constructor(public id: string, public name: string, options: Suggestion[]) {
    this.options = of(options);
  }
}
