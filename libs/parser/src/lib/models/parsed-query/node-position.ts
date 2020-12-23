import { QueryToken } from './query-token';

export interface NodePosition {
  start: number;

  end: number;

  getTokenAtPosition(index: number): QueryToken;
}
