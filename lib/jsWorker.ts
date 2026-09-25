import { assert, fmt } from "@/lib/assertKit";

function send(type: string, payload: unknown) {
  postMessage({ type, payload });
}

let baseLine = 0;
let stdinLines: string[] = [];

function readLine(): string | null {
  return stdinLines.length ? stdinLines.shift()! : null;
}

const inputScope = self as unknown as Record<string, unknown>;
inputScope.__setStdin = (text: string) => {
  stdinLines = text ? text.replace(/\r\n/g, "\n").split("\n") : [];
  if (stdinLines.at(-1) === "") stdinLines.pop();
};
inputScope.readline = readLine;

function formatTime(ms: number): string {
  if (ms >= 1) return `${ms.toFixed(2)} ms`;
  if (ms >= 0.001) return `${(ms * 1000).toFixed(2)} µs`;
  return `${(ms * 1e6).toFixed(0)} ns`;
}

inputScope.compare = (candidates: Record<string, () => unknown>, options: { budgetMs?: number } = {}) => {
  const budget = Math.min(Math.max(options.budgetMs ?? 300, 50), 2000);
  const rows = Object.entries(candidates).map(([name, fn]) => {
    for (let i = 0; i < 5; i++) fn();
    let runs = 0;
    const start = performance.now();
    let elapsed = 0;
    do {
      for (let i = 0; i < 10; i++) fn();
      runs += 10;
      elapsed = performance.now() - start;
    } while (elapsed < budget);
    return { name, perCall: elapsed / runs, runs };
  });
  rows.sort((a, b) => a.perCall - b.perCall);
  const fastest = rows[0]?.perCall ?? 1;
  send("console", {
    kind: "table",
    columns: ["", "per call", "runs/sec", "vs fastest"],
    rows: rows.map((r, i) => [
      `${i === 0 ? "🏆 " : ""}${r.name}`,
      formatTime(r.perCall),
      Math.round(1000 / r.perCall).toLocaleString(),
      i === 0 ? "fastest" : `${(r.perCall / fastest).toFixed(2)}× slower`,
    ]),
  });
  return rows.map((r) => r.name);
};
inputScope.prompt = (message?: unknown) => {
  const line = readLine();
  if (message !== undefined) send("console", { kind: "info", text: `${String(message)} ${line ?? ""}`.trim() });
  return line;
};

function frameLine(stack: string | undefined): number | undefined {
  const m = stack?.match(/<anonymous>:(\d+):\d+/);
  if (!m) return undefined;
  const n = Number(m[1]) - baseLine;
  return n > 0 ? n : undefined;
}

// @ts-expect-error -- called by the generated source on the line above the reader's code
self.__base = () => {
  const m = new Error().stack?.match(/<anonymous>:(\d+):\d+/);
  baseLine = m ? Number(m[1]) + 1 : 0;
};

// @ts-expect-error -- read by the generated source
self.__lineOf = (err: unknown) => frameLine(err instanceof Error ? err.stack : undefined);

function line(kind: string) {
  return (...args: unknown[]) => {
    send("console", { kind, text: args.map((a) => fmt(a, 0)).join(" "), line: frameLine(new Error().stack) });
  };
}

console.log = line("log");
console.info = line("info");
console.debug = line("log");
console.warn = line("warn");
console.error = line("error");

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

async function settle() {
  do {
    await new Promise<void>((resolve) => realSetTimeout(() => resolve(), 0));
  } while (pending.size || intervals.size);
}

// @ts-expect-error -- read by the generated source
self.__settle = settle;

self.onerror = (event) => {
  const error = event instanceof ErrorEvent ? event.error : undefined;
  send("console", {
    kind: "error",
    text: String(event instanceof ErrorEvent ? event.message : event),
    line: frameLine(error instanceof Error ? error.stack : undefined),
  });
  return true;
};
self.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
  const reason = event.reason;
  const text = reason && typeof reason === "object" && "message" in reason ? (reason as Error).message : reason;
  send("console", {
    kind: "error",
    text: `Uncaught (in promise) ${fmt(text, 0)}`,
    line: frameLine(reason instanceof Error ? reason.stack : undefined),
  });
});

// @ts-expect-error -- assert is a global exposed to the Function-constructed tests
self.assert = assert;

self.onmessage = async (event: MessageEvent) => {
  const data = event.data;
  if (!data || data.type !== "run") return;
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
