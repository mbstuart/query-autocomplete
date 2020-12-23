import { AtomicNode } from "./atomic-node";
import { LogicalConnector } from "./logical-connectors";
import { LogicalNode } from "./logical-node";

export type QueryNode = AtomicNode | LogicalNode;
