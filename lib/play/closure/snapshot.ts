import type { Binding, Cell, HeapView, ScopeView, Snapshot, StepEvent } from "./types";
import { isHeapValue, type Env, type HeapValue, type Value } from "./values";

const MAX_TEXT = 40;

function shorten(text: string): string {
  return text.length > MAX_TEXT ? `${text.slice(0, MAX_TEXT - 1)}…` : text;
}

export function cellOf(value: Value): Cell {
  if (value === undefined) return { kind: "undefined", text: "undefined" };
  if (value === null) return { kind: "null", text: "null" };
  if (typeof value === "number") return { kind: "number", text: String(value) };
  if (typeof value === "boolean") return { kind: "boolean", text: String(value) };
  if (typeof value === "string") return { kind: "string", text: shorten(JSON.stringify(value)) };
  if (isHeapValue(value)) return { kind: "ref", id: value.id };
  return { kind: "undefined", text: "native function" };
}

function bindingsOf(env: Env): Binding[] {
  return [...env.vars].map(([name, value]) => ({ name, value: cellOf(value), returned: name === RETURN_SLOT }));
}

export const RETURN_SLOT = "__return__";

export type SnapshotInput = {
  global: Env;
  active: Env[];
  event: StepEvent;
  line: number;
  output: string;
  failure: string | null;
};

export function takeSnapshot({ global, active, event, line, output, failure }: SnapshotInput): Snapshot {
  const reachableEnvs = new Set<Env>();
  const reachableObjects = new Map<number, HeapValue>();

  const visitValue = (value: Value) => {
    if (!isHeapValue(value) || reachableObjects.has(value.id)) return;
    reachableObjects.set(value.id, value);
    if (value.kind === "function") visitEnv(value.env);
    else if (value.kind === "array") value.items.forEach(visitValue);
    else value.props.forEach(visitValue);
  };

  const visitEnv = (env: Env | null) => {
    if (!env || reachableEnvs.has(env)) return;
    reachableEnvs.add(env);
    env.vars.forEach(visitValue);
    visitEnv(env.parent);
  };

  visitEnv(global);
  active.forEach(visitEnv);

  const running = new Set(active);
  const top = active.at(-1);
  const innermostFunction = active.findLast((env) => env.kind === "function");

  const heap: HeapView[] = [...reachableObjects.values()]
    .sort((a, b) => a.id - b.id)
    .map((value): HeapView => {
      if (value.kind === "function") {
        return {
          id: value.id,
          kind: "function",
          name: value.name || "anonymous",
          params: value.node.params.map((param) => (param.type === "Identifier" ? param.name : "…")).join(", "),
          closesOver: value.env === global ? null : value.env.id,
        };
      }
      if (value.kind === "array") return { id: value.id, kind: "array", items: value.items.map(cellOf) };
      return {
        id: value.id,
        kind: "object",
        entries: [...value.props].map(([key, item]) => ({ key, value: cellOf(item) })),
      };
    });

  const scopes: ScopeView[] = [...reachableEnvs]
    .filter((env) => env !== global)
    .sort((a, b) => a.id - b.id)
    .map((env) => ({
      id: env.id,
      kind: env.kind === "function" ? "function" : "block",
      label: env.label,
      bindings: bindingsOf(env),
      enclosedBy: env.parent && env.parent !== global ? env.parent.id : null,
      running: running.has(env),
      current: env === top,
      keptBy: heap.flatMap((entry) => (entry.kind === "function" && entry.closesOver === env.id ? [entry.name] : [])),
    }));

  return {
    event,
    line,
    scopeLabel: innermostFunction?.label ?? "",
    globals: bindingsOf(global),
    scopes,
    heap,
    output,
    failure,
  };
}
