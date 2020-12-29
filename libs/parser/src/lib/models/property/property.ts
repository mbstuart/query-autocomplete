import { Observable } from 'rxjs';
import { OperatorType } from '../parsed-query/operators';
import { SuggestionOptionResponse } from '../suggestion';

export interface Property {
  id: string;

  name: string;

  operators: OperatorType[];

  getOptions: (searchText: string) => Observable<SuggestionOptionResponse>;
}
