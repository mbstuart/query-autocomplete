import { InOperator } from './in-operator';
import {
  GTEOperator,
  GTOperator,
  LTEOperator,
  LTOperator,
} from './numerical-operators';
import { Operator } from './operator';

export const DefaultOperators: { [key: string]: Operator } = {
  IN: new InOperator(),
  IS: new InOperator(),
  '<=': new LTEOperator(),
  '<': new LTOperator(),
  '>=': new GTEOperator(),
  '>': new GTOperator(),
};
