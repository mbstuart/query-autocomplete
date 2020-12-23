import { QueryNode } from './query-node';
import { TokenType } from './token-type';

export interface QueryToken {
  type: TokenType;

  node: QueryNode;
}
