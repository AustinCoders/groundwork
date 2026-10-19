export type NodeKind = "client" | "service" | "store" | "queue" | "cache" | "external" | "worker" | "decision";

export type EdgeStyle = "solid" | "dashed" | "async";

export interface FlowNode {
  id: string;
  label: string;
  sub?: string;
  kind: NodeKind;
  col: number;
  row: number;
}

export interface FlowEdge {
  from: string;
  to: string;
  label?: string;
  step?: number;
  style?: EdgeStyle;
  route?: "hv" | "vh";
}

export interface FlowDiagram {
  kind: "flow";
  title: string;
  caption: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  steps?: string[];
}

export interface SequenceActor {
  id: string;
  label: string;
  kind?: NodeKind;
}

export interface SequenceMessage {
  from: string;
  to: string;
  label: string;
  style?: EdgeStyle;
}

export interface SequenceDiagram {
  kind: "sequence";
  title: string;
  caption: string;
  actors: SequenceActor[];
  messages: SequenceMessage[];
}

export type Diagram = FlowDiagram | SequenceDiagram;
