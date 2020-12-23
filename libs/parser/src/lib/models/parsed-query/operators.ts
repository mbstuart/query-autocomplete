export enum Operators {
    'IN',
    'LT',
    'GT',
    'LTE',
    'GTE',
    'IS'
    
}

export type OperatorType = keyof typeof Operators;
