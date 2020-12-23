import { ParsedQuery, QueryNodeWithPosition } from '../models';
import { QueryToken } from '../models/parsed-query/query-token';

const checkDeepestContainer: (
  index: number,
  q: QueryNodeWithPosition
) => QueryToken = (index: number, q: QueryNodeWithPosition) => {
  const positions = Object.keys(q.position.tokenPositions).sort(
    (a: string, b: string) => +a - +b
  );

  const highestIndex = positions.findIndex((pos) => {
    return +pos >= index;
  });

  const el =
    highestIndex === -1
      ? positions[positions.length - 1]
      : positions[highestIndex - 1];

  const token: QueryToken = q.position.tokenPositions[el];

  if (token.type === 'LogicalComponent') {
    return checkDeepestContainer(index, token.node);
  }

  return token;
};

export function getTokenAtIndex(index: number, q: ParsedQuery) {
  if (!(index < q.root.position.end && index > q.root.position.start)) {
    throw Error(
      `index ${index} out of range (${q.root.position.start} - ${q.root.position.end})`
    );
  }

  return checkDeepestContainer(index, q.root);
}
