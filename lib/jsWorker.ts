/// <reference lib="webworker" />

// The JS/TS runner used to execute inside a sandboxed iframe on the main
// thread. That meant a genuine `while (true) {}` blocked the ONE thread
// everything else needed too — including the setTimeout callback meant to
// time it out — so the "stopped after 5s" safety net could never fire and
// the whole tab froze permanently. Running here, in a dedicated worker,
// fixes that the same way pythonRunner.ts does: a hung run gets
// worker.terminate()'d from the main thread regardless of what the code
// inside is doing.
//
// No exercise in content/practice.ts touches document/window/DOM, so
// losing that (workers can't see the page's DOM) costs nothing real.

function send(type: string, payload: unknown) {
  postMessage({ type, payload });
}

function fmt(value: unknown, depth = 0, seen: unknown[] = []): string {
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

function line(kind: string) {
  return (...args: unknown[]) => {
    send("console", { kind, text: args.map((a) => fmt(a, 0)).join(" ") });
  };
}

// Workers have their own `console` and `self` (the worker's global
// object) — overriding console here shadows it only inside this worker,
// same as BOOT overriding window.console used to, only inside its iframe.
console.log = line("log");
console.info = line("info");
console.debug = line("log");
console.warn = line("warn");
console.error = line("error");

self.onerror = (event) => {
  send("console", { kind: "error", text: String(event instanceof ErrorEvent ? event.message : event) });
  return true;
};
self.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
  const reason = event.reason;
  const text = reason && typeof reason === "object" && "message" in reason ? (reason as Error).message : reason;
  send("console", { kind: "error", text: `Uncaught (in promise) ${fmt(text, 0)}` });
});

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

// @ts-expect-error -- assert is a global exposed to the Function-constructed
// user code below, same trick BOOT used with `window.assert` for the iframe.
self.assert = {
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

self.onmessage = async (event: MessageEvent) => {
  const data = event.data;
  if (!data || data.type !== "run") return;
  try {
    const fn = new Function("__send", `return (async function () {\n${data.source}\n})();`) as (
      sendFn: typeof send
    ) => Promise<void>;
    await fn(send);
  } catch (err) {
    // The generated source already wraps everything in its own try/catch
    // and always ends by posting "done" — this only catches a genuinely
    // unexpected failure to even construct/start it.
    const text = err instanceof Error ? err.message : String(err);
    send("console", { kind: "error", text });
    send("done", { results: [], crashed: true });
  }
};
