export function fmt(value: unknown, depth = 0, seen: unknown[] = []): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  const t = typeof value;
  if (t === "string") return depth === 0 ? (value as string) : JSON.stringify(value);
  if (t === "number" || t === "boolean" || t === "bigint") return String(value);
  if (t === "symbol") return (value as symbol).toString();
  if (t === "function") {
    const fn = value as (...args: unknown[]) => unknown;
    return fn.name ? `ƒ ${fn.name}()` : "ƒ ()";
  }
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (seen.indexOf(value) !== -1) return "[circular]";
  if (depth > 3) return Array.isArray(value) ? "[…]" : "{…}";
  const nextSeen = seen.concat([value]);
  if (Array.isArray(value)) {
    return `[${value.map((v) => fmt(v, depth + 1, nextSeen)).join(", ")}]`;
  }
  if (value instanceof Map) {
    const pairs: string[] = [];
    value.forEach((v, k) => pairs.push(`${fmt(k, depth + 1, nextSeen)} => ${fmt(v, depth + 1, nextSeen)}`));
    return `Map(${value.size}) { ${pairs.join(", ")} }`;
  }
  if (value instanceof Set) {
    const items: string[] = [];
    value.forEach((v) => items.push(fmt(v, depth + 1, nextSeen)));
    return `Set(${value.size}) { ${items.join(", ")} }`;
  }
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Promise) return "Promise { … }";
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj);
  if (!keys.length) return "{}";
  return `{ ${keys.map((k) => `${k}: ${fmt(obj[k], depth + 1, nextSeen)}`).join(", ")} }`;
}

function same(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a === "number" && typeof b === "number") return Number.isNaN(a) && Number.isNaN(b);
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (a instanceof Map || b instanceof Map || a instanceof Set || b instanceof Set) {
    return fmt(a, 1) === fmt(b, 1);
  }
  const ka = Object.keys(a as object);
  const kb = Object.keys(b as object);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => same((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
}

export const assert = {
  ok(value: unknown, message?: string) {
    if (!value) throw new Error(message || `expected something truthy, got ${fmt(value, 1)}`);
  },
  equal(actual: unknown, expected: unknown, message?: string) {
    if (actual !== expected) throw new Error(message || `expected ${fmt(expected, 1)} but got ${fmt(actual, 1)}`);
  },
  notEqual(actual: unknown, unexpected: unknown, message?: string) {
    if (actual === unexpected) throw new Error(message || `expected something other than ${fmt(unexpected, 1)}`);
  },
  deepEqual(actual: unknown, expected: unknown, message?: string) {
    if (!same(actual, expected)) throw new Error(message || `expected ${fmt(expected, 1)} but got ${fmt(actual, 1)}`);
  },
  type(value: unknown, expected: string, message?: string) {
    if (typeof value !== expected) throw new Error(message || `expected a ${expected} but got ${typeof value}`);
  },
  throws(fn: () => void, message?: string) {
    try {
      fn();
    } catch {
      return;
    }
    throw new Error(message || "expected that to throw");
  },
};
