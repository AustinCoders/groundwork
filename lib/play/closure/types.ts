export type Cell =
  { kind: "number" | "string" | "boolean" | "null" | "undefined"; text: string } | { kind: "ref"; id: number };

export type Binding = { name: string; value: Cell; returned: boolean };

export type ScopeView = {
  id: number;
  kind: "function" | "block";
  label: string;
  bindings: Binding[];
  enclosedBy: number | null;
  running: boolean;
  current: boolean;
  keptBy: string[];
};

export type HeapView =
  | { id: number; kind: "function"; name: string; params: string; closesOver: number | null }
  | { id: number; kind: "array"; items: Cell[] }
  | { id: number; kind: "object"; entries: { key: string; value: Cell }[] };

export type StepEvent = "step" | "call" | "return" | "failed" | "limit";

export type Snapshot = {
  event: StepEvent;
  line: number;
  scopeLabel: string;
  globals: Binding[];
  scopes: ScopeView[];
  heap: HeapView[];
  output: string;
  failure: string | null;
};

export type Remark = { text: string; closure: boolean };

export type ClosureFrame = Snapshot & { remarks: Remark[]; finished: boolean };

export type ClosureExample = {
  id: string;
  title: string;
  source: string;
};

export type ClosureTracer = {
  id: string;
  title: string;
  lines: string[];
  frames: ClosureFrame[];
};
