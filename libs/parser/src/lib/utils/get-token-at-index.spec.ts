import { getTokenAtIndex } from './get-token-at-index';
import { Parser } from '../parser';
import { TokenType } from '../models/parsed-query/token-type';
import { isLogicalNodeWithPosition, QueryNodeWithPosition } from '../models';

describe('get-token-at-index', () => {
  let parser: Parser;

  beforeEach(() => {
    parser = new Parser();
  });

  it('should be able to correctly determine token at position 2', () => {
    const input = '(region IS Europe OR value < 30) AND sector IS Pharma';
    const parsedQuery = parser.parse(input);

    const token = getTokenAtIndex(2, parsedQuery.root);

    const expectedType: TokenType = 'AtomicProperty';

    expect(token.type).toBe(expectedType);
  });

  it('should be able to correctly determine token at position 9', () => {
    const input = '(region IS Europe OR value < 30) AND sector IS Pharma';
    const parsedQuery = parser.parse(input);

    const token = getTokenAtIndex(9, parsedQuery.root);

    const getPositions = (q: QueryNodeWithPosition) => {
      if (isLogicalNodeWithPosition(q)) {
        q.children.forEach(getPositions);
      }

      console.log(q.position);
    };

    // getPositions(parsedQuery.root);

    const expectedType: TokenType = 'AtomicOperator';

    expect(token.type).toBe(expectedType);
  });

  it('should be able to correctly determine token at position 13', () => {
    const input = '(region IS Europe OR value < 30) AND sector IS Pharma';
    const parsedQuery = parser.parse(input);

    const token = getTokenAtIndex(13, parsedQuery.root);

    const expectedType: TokenType = 'AtomicValue';

    expect(token.type).toBe(expectedType);
  });

  it('should be able to correctly determine token at position 0', () => {
    const input = 'region IS Europe OR value < 30';
    const parsedQuery = parser.parse(input);

    const token = getTokenAtIndex(0, parsedQuery.root);

    const expectedType: TokenType = 'AtomicProperty';

    const getPositions = (q: QueryNodeWithPosition) => {
      if (isLogicalNodeWithPosition(q)) {
        q.children = q.children.map(getPositions) as any;
      }

      Object.values(q.position.tokenPositions).forEach((tokenPos) => {
        tokenPos.node = null;
      });

      return q;
    };

    const res = getPositions(parsedQuery.root);
    // console.log(JSON.stringify(res, null, 2));

    expect(token.type).toBe(expectedType);
  });
});
