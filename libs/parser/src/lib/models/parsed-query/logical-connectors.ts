export enum LogicalConnectors {
    'AND',
    'OR',
    'NOT'
}

export type LogicalConnector = keyof typeof LogicalConnectors;

