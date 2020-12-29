import { Observable } from 'rxjs';
import { OperatorType } from '../parsed-query/operators';
import { Suggestion } from '../suggestion';

export interface Property {
  id: string;

  name: string;

  operators: OperatorType[];

  options: Observable<Suggestion[]>;
}
