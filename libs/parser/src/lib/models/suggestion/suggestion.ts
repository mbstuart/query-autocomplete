import { TokenType } from '../parsed-query/token-type';

export interface Suggestion {
  id: string;
  name: string;
  type: TokenType;
}
