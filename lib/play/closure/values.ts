import type * as acorn from "acorn";

export type FunctionNode = acorn.FunctionDeclaration | acorn.FunctionExpression | acorn.ArrowFunctionExpression;

export type FunctionValue = { kind: "function"; id: number; node: FunctionNode; env: Env; name: string };
export type ArrayValue = { kind: "array"; id: number; items: Value[] };
export type ObjectValue = { kind: "object"; id: number; props: Map<string, Value> };
export type NativeValue = { kind: "native"; name: string; call: (args: Value[]) => Value };
export type NamespaceValue = { kind: "namespace"; props: Record<string, Value> };
export type HeapValue = FunctionValue | ArrayValue | ObjectValue;
export type Value = undefined | null | number | string | boolean | HeapValue | NativeValue | NamespaceValue;

export type EnvKind = "global" | "function" | "block";

export class Env {
  readonly vars = new Map<string, Value>();
  readonly constants = new Set<string>();

  constructor(
    readonly id: number,
    readonly kind: EnvKind,
    readonly label: string,
    readonly parent: Env | null,
    readonly ownsThis = false,
    readonly thisValue: Value = undefined
  ) {}
}

export class RunError extends Error {
  constructor(
    message: string,
    readonly line: number
  ) {
    super(message);
  }
}

export class UserThrow {
  constructor(
    readonly value: Value,
    readonly line: number
  ) {}
}

export class LimitReached extends Error {}

export function isObjectValue(value: Value): value is Exclude<Value, undefined | null | number | string | boolean> {
  return typeof value === "object" && value !== null;
}

export function isHeapValue(value: Value): value is HeapValue {
  return isObjectValue(value) && (value.kind === "function" || value.kind === "array" || value.kind === "object");
}

export function isCallable(value: Value): value is FunctionValue | NativeValue {
  return isObjectValue(value) && (value.kind === "function" || value.kind === "native");
}

export function sourceOf(code: string, node: acorn.Node): string {
  return code.slice(node.start, node.end);
}

export function toText(code: string, value: Value): string {
  if (isHeapValue(value)) {
    if (value.kind === "array") return value.items.map((item) => toText(code, item)).join(",");
    if (value.kind === "function") return sourceOf(code, value.node);
    return "[object Object]";
  }
  if (isObjectValue(value)) return "[native]";
  return String(value);
}

export function toPrimitive(code: string, value: Value): string | number | boolean | null | undefined {
  return isObjectValue(value) ? toText(code, value) : value;
}

const MAX_PRINT_DEPTH = 3;

export function formatValue(value: Value, nested = false, depth = 0): string {
  if (value === undefined) return "undefined";
  if (value === null) return "null";
  if (typeof value === "string") return nested ? `'${value}'` : value;
  if (typeof value !== "object") return String(value);
  if (value.kind === "function" || value.kind === "native") return `[Function: ${value.name || "anonymous"}]`;
  if (value.kind === "namespace") return "[object]";
  if (depth > MAX_PRINT_DEPTH) return value.kind === "array" ? "[…]" : "{…}";
  if (value.kind === "array") return `[${value.items.map((item) => formatValue(item, true, depth + 1)).join(", ")}]`;
  const parts = [...value.props].map(([key, item]) => `${key}: ${formatValue(item, true, depth + 1)}`);
  return parts.length ? `{ ${parts.join(", ")} }` : "{}";
}
