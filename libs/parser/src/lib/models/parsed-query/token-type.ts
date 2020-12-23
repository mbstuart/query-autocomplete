export enum TokenTypes {
  AtomicProperty,
  AtomicOperator,
  AtomicValue,
  AtomicEnd,
  AtomicStart,
  LogicalStart,
  LogicalOperator,
  LogicalEnd,
  LogicalComponent,
}

export type TokenType = keyof typeof TokenTypes;
