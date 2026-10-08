export type CellState = "in" | "out" | "mid" | "found" | "none";

export type CellMark = "lo" | "hi" | "mid";

export type Cell = {
  value: number;
  state: CellState;
  marks: CellMark[];
};

export type VariableValue = number | string | null;

export type Variable = readonly [name: string, value: VariableValue];

export type Frame = {
  line: string;
  next: string | null;
  narration: string;
  vars: Variable[];
  cells: Cell[];
};

export type TracerLine = {
  id: string;
  text: string;
};

export type ParseResult<Input> = { ok: true; input: Input } | { ok: false; message: string };

export type Tracer<Input = unknown> = {
  id: string;
  title: string;
  mirrors: string;
  lines: TracerLine[];
  defaultInput: Input;
  presets: { name: string; input: Input }[];
  limit: number;
  parse(text: string): ParseResult<Input>;
  run(input: Input): Frame[];
};
