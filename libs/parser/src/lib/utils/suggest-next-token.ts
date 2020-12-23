import { QueryToken } from '../models/parsed-query/query-token';
import { TokenType } from '../models/parsed-query/token-type';

export function suggestNextTokenType(token: QueryToken): TokenType[] {
  switch (token.type) {
    case 'AtomicEnd':
    case 'LogicalEnd':
    case 'AtomicValue':
      return ['LogicalOperator'];

    case 'LogicalStart':
    case 'AtomicStart':
    case 'LogicalOperator':
      return ['AtomicProperty'];

    case 'AtomicProperty':
      return ['AtomicOperator'];

    case 'AtomicOperator':
      return ['AtomicValue'];

    case 'LogicalOperator':
      return ['LogicalComponent', 'AtomicProperty'];
    default:
      throw new Error(`No suggestion defined for ${token.type}`);
  }
}
