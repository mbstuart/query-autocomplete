export enum TokenTypes {
  AtomicProperty,
  AtomicOperator,
  AtomicValue,
  AtomicEnd,
  AtomicStart,
  LogicalStart,
  LogicalOperator,
  LogicalEnd,
}

export type TokenType = keyof typeof TokenTypes;
