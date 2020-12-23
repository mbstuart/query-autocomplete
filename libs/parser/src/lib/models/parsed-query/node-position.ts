import { QueryToken } from './query-token';

export interface NodePosition {
  start: number;

  end: number;

  tokenPositions: {
    [start: number]: QueryToken;
  };
}
