import { NodePosition } from '../models';
import { QueryToken } from '../models/parsed-query/query-token';

const getTokenIndex: (
  index: number,
  q: { position: NodePosition }
) => string = (index: number, { position }: { position: NodePosition }) => {
  const positions = Object.keys(position.tokenPositions).sort(
    (a: string, b: string) => +a - +b
  );

  const highestIndex = positions.findIndex((pos) => {
    return +pos > index;
  });

  const el =
    highestIndex === -1
      ? positions[positions.length - 1]
      : positions[highestIndex - 1];

  return el;
};

const checkDeepestContainer: (
  index: number,
  q: { position: NodePosition }
) => QueryToken = (index: number, { position }: { position: NodePosition }) => {
  const el = getTokenIndex(index, { position });

  const token: QueryToken = position.tokenPositions[el];

  if (token && token.type === 'LogicalComponent') {
    return checkDeepestContainer(index, token.node);
  }

  return token;
};

export function getTokenAtIndex(
  index: number,
  { position }: { position: NodePosition }
) {
  index = Math.min(position.end, index);

  if (!(index <= position.end && index >= position.start)) {
    throw Error(
      `index ${index} out of range (${position.start} - ${position.end})`
    );
  }

  return checkDeepestContainer(index, { position });
}

export function getTokenStartAtIndex(
  index: number,
  { position }: { position: NodePosition }
) {
  index = Math.min(position.end, index);

  if (!(index <= position.end && index >= position.start)) {
    throw Error(
      `index ${index} out of range (${position.start} - ${position.end})`
    );
  }

  return getTokenIndex(index, { position });
}
