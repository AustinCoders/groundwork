import { assert, fmt } from "@/lib/assertKit";

function send(type: string, payload: unknown) {
  postMessage({ type, payload });
}

function line(kind: string) {
  return (...args: unknown[]) => {
    send("console", { kind, text: args.map((a) => fmt(a, 0)).join(" ") });
  };
}

console.log = line("log");
console.info = line("info");
console.debug = line("log");
console.warn = line("warn");
console.error = line("error");

// The rest of the console, so examples copied from anywhere print something.
const timers = new Map<string, number>();
const counts = new Map<string, number>();
console.time = (label = "default") => void timers.set(label, performance.now());
console.timeEnd = (label = "default") => {
  const start = timers.get(label);
  if (start === undefined) return;
  timers.delete(label);
  send("console", { kind: "info", text: `${label}: ${(performance.now() - start).toFixed(1)} ms` });
};
console.count = (label = "default") => {
  const n = (counts.get(label) ?? 0) + 1;
  counts.set(label, n);
  send("console", { kind: "log", text: `${label}: ${n}` });
};
console.assert = (ok?: boolean, ...args: unknown[]) => {
  if (!ok)
    send("console", {
      kind: "error",
      text: `Assertion failed${args.length ? ": " + args.map((a) => fmt(a, 0)).join(" ") : ""}`,
    });
};
console.table = (data: unknown) => {
  if (!data || typeof data !== "object") return line("log")(data);
  const rows = Object.entries(data as Record<string, unknown>);
  const columns = [
    ...new Set(rows.flatMap(([, v]) => (v && typeof v === "object" ? Object.keys(v as object) : ["Value"]))),
  ];
  send("console", {
    kind: "table",
    columns: ["(index)", ...columns],
    rows: rows.map(([k, v]) => [
      k,
      ...columns.map((c) => {
        const cell = v && typeof v === "object" ? (v as Record<string, unknown>)[c] : c === "Value" ? v : undefined;
        return cell === undefined ? null : typeof cell === "number" ? cell : fmt(cell, 1);
      }),
    ]),
  });
};

// Timers are counted, so a run is over when its code has returned AND every
// timeout it set has fired — not the moment the synchronous part ends, which
// dropped everything a setTimeout or a promise chain printed afterwards.
// In a worker, timer ids are plain numbers; the global typings here also know
// Node's, so the wrappers go through an untyped view of the global.
type Timer = (fn: () => void, ms?: number) => number;
const scope = self as unknown as Record<"setTimeout" | "clearTimeout" | "setInterval" | "clearInterval", unknown>;
const realSetTimeout = (scope.setTimeout as Timer).bind(self);
const realClearTimeout = (scope.clearTimeout as (id?: number) => void).bind(self);
const realSetInterval = (scope.setInterval as Timer).bind(self);
const realClearInterval = (scope.clearInterval as (id?: number) => void).bind(self);
const pending = new Set<number>();
const intervals = new Set<number>();

scope.setTimeout = (fn: (...a: unknown[]) => void, ms?: number, ...args: unknown[]) => {
  const id = realSetTimeout(() => {
    pending.delete(id);
    fn(...args);
  }, ms);
  pending.add(id);
  return id;
};
scope.clearTimeout = (id?: number) => {
  if (id !== undefined) pending.delete(id);
  realClearTimeout(id);
};
scope.setInterval = (fn: (...a: unknown[]) => void, ms?: number, ...args: unknown[]) => {
  const id = realSetInterval(() => fn(...args), ms);
  intervals.add(id);
  return id;
};
scope.clearInterval = (id?: number) => {
  if (id !== undefined) intervals.delete(id);
  realClearInterval(id);
};

/** Wait for queued microtasks and outstanding timers. An interval never
 *  settles on its own; the runner's time limit ends that run. */
async function settle() {
  do {
    await new Promise<void>((resolve) => realSetTimeout(() => resolve(), 0));
  } while (pending.size || intervals.size);
}

// @ts-expect-error -- read by the generated source
self.__settle = settle;

self.onerror = (event) => {
  send("console", { kind: "error", text: String(event instanceof ErrorEvent ? event.message : event) });
  return true;
};
self.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
  const reason = event.reason;
  const text = reason && typeof reason === "object" && "message" in reason ? (reason as Error).message : reason;
  send("console", { kind: "error", text: `Uncaught (in promise) ${fmt(text, 0)}` });
});

// @ts-expect-error -- assert is a global exposed to the Function-constructed tests
self.assert = assert;

self.onmessage = async (event: MessageEvent) => {
  const data = event.data;
  if (!data || data.type !== "run") return;
  // A worker is reused between runs: nothing from the last one may print into this one.
  pending.forEach((id) => realClearTimeout(id));
  pending.clear();
  intervals.forEach((id) => realClearInterval(id));
  intervals.clear();
  timers.clear();
  counts.clear();
  try {
    const fn = new Function("__send", `return (async function () {\n${data.source}\n})();`) as (
      sendFn: typeof send
    ) => Promise<void>;
    await fn(send);
  } catch (err) {
    const text = err instanceof Error ? err.message : String(err);
    send("console", { kind: "error", text });
    send("done", { results: [], crashed: true });
  }
};
