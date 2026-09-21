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
