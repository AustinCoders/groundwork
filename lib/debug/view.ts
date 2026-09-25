export type View =
  | { t: "num" | "str" | "bool" | "null" | "undef" | "big"; v: string }
  | { t: "fn"; v: string }
  | { t: "arr"; items: View[]; len: number }
  | { t: "set"; items: View[]; len: number }
  | { t: "map"; entries: [View, View][]; len: number }
  | { t: "obj"; cls: string; entries: [string, View][] }
  | { t: "list"; items: View[]; cycle: boolean; more: boolean }
  | { t: "tree"; root: TreeView | null }
  | { t: "more" }
  | { t: "tdz" };

export interface TreeView {
  v: View;
  l: TreeView | null;
  r: TreeView | null;
}

const MAX_ITEMS = 40;
const MAX_DEPTH = 3;

function nodeValue(node: Record<string, unknown>): unknown {
  for (const key of ["val", "value", "data", "key"]) if (key in node) return node[key];
  return undefined;
}

function isListNode(v: object): boolean {
  return "next" in v && !Array.isArray(v);
}

function isTreeNode(v: object): boolean {
  return ("left" in v || "right" in v) && !Array.isArray(v);
}

export function toView(value: unknown, depth = 0): View {
  if (value === null) return { t: "null", v: "null" };
  switch (typeof value) {
    case "undefined":
      return { t: "undef", v: "undefined" };
    case "number":
      return { t: "num", v: String(value) };
    case "bigint":
      return { t: "big", v: `${value}n` };
    case "boolean":
      return { t: "bool", v: String(value) };
    case "string":
      return { t: "str", v: value.length > 60 ? `${value.slice(0, 59)}…` : value };
    case "symbol":
      return { t: "str", v: value.toString() };
    case "function":
      return { t: "fn", v: value.name || "anonymous" };
  }
  if (depth > MAX_DEPTH) return { t: "more" };
  const obj = value as object;
  if (Array.isArray(obj))
    return { t: "arr", items: obj.slice(0, MAX_ITEMS).map((x) => toView(x, depth + 1)), len: obj.length };
  if (obj instanceof Set)
    return { t: "set", items: [...obj].slice(0, MAX_ITEMS).map((x) => toView(x, depth + 1)), len: obj.size };
  if (obj instanceof Map)
    return {
      t: "map",
      entries: [...obj]
        .slice(0, MAX_ITEMS)
        .map(([k, v]) => [toView(k, depth + 1), toView(v, depth + 1)] as [View, View]),
      len: obj.size,
    };
  if (isListNode(obj)) {
    const items: View[] = [];
    const seen = new Set<object>();
    let node: unknown = obj;
    let cycle = false;
    while (node && typeof node === "object" && items.length < 30) {
      if (seen.has(node)) {
        cycle = true;
        break;
      }
      seen.add(node);
      items.push(toView(nodeValue(node as Record<string, unknown>), MAX_DEPTH));
      node = (node as Record<string, unknown>).next;
    }
    return { t: "list", items, cycle, more: Boolean(node) && !cycle };
  }
  if (isTreeNode(obj)) {
    const seen = new Set<object>();
    const walk = (node: unknown, level: number): TreeView | null => {
      if (!node || typeof node !== "object" || level > 6 || seen.has(node)) return null;
      seen.add(node);
      const n = node as Record<string, unknown>;
      return { v: toView(nodeValue(n), MAX_DEPTH), l: walk(n.left, level + 1), r: walk(n.right, level + 1) };
    };
    return { t: "tree", root: walk(obj, 0) };
  }
  const cls = obj.constructor && obj.constructor !== Object ? obj.constructor.name : "";
  return {
    t: "obj",
    cls,
    entries: Object.keys(obj)
      .slice(0, 20)
      .map((k) => [k, toView((obj as Record<string, unknown>)[k], depth + 1)] as [string, View]),
  };
}

export interface TraceStep {
  line: number;
  fn: string;
  depth: number;
  vars: Record<string, View>;
}

export interface Trace {
  steps: TraceStep[];
  truncated: boolean;
}
