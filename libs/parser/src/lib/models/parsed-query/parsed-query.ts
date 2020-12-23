import {
  QueryNode,
  QueryNodeWithPlacement as QueryNodeWithPosition,
} from './query-node';

export interface Query {
  root: QueryNode;
}

export interface ParsedQuery {
  root: QueryNodeWithPosition;
}
