import type { RunnerDonePayload, RunnerOutputEntry } from "@/lib/runner";

export interface ScriptRunOptions {
  lang: "lua" | "ruby" | "php" | "c" | "cpp";
  code: string;
  stdin?: string;
  timeout?: number;
  onConsole?: (entry: RunnerOutputEntry) => void;
  onDone?: (payload: RunnerDonePayload) => void;
}

let sharedWorker: Worker | null = null;

function getWorker(): Worker {
  if (!sharedWorker) {
    sharedWorker = new Worker(new URL("./scriptWorker.ts", import.meta.url), { type: "module" });
  }
  return sharedWorker;
}

function discardWorker() {
  sharedWorker?.terminate();
  sharedWorker = null;
}

export function runScript(options: ScriptRunOptions): { stop: () => void } {
  const onConsole = options.onConsole || (() => {});
  const onDone = options.onDone || (() => {});
  const timeout = options.timeout ?? 20000;
  const loadTimeout = 180000;

  const worker = getWorker();
  let finished = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  function cleanup() {
    worker.removeEventListener("message", onMessage);
    clearTimeout(timer);
  }

  function onMessage(event: MessageEvent) {
    const data = event.data;
    if (!data) return;
    if (data.type === "started") {
      clearTimeout(timer);
      timer = setTimeout(stopForTime, timeout);
      return;
    }
    if (data.type === "console") {
      onConsole(data.payload as RunnerOutputEntry);
      return;
    }
    if (data.type === "done") {
      finished = true;
      cleanup();
      onDone(data.payload as RunnerDonePayload);
    }
  }

  worker.addEventListener("message", onMessage);
  worker.postMessage({ type: "run", lang: options.lang, code: options.code, stdin: options.stdin ?? "" });

  function stopForTime() {
    if (finished) return;
    onConsole({
      kind: "system",
      text: `⏱ stopped after ${timeout / 1000}s — an endless loop, or code that never finishes?`,
    });
    cleanup();
    discardWorker();
    onDone({ results: [], timedOut: true });
  }

  timer = setTimeout(stopForTime, loadTimeout);

  return {
    stop: () => {
      if (finished) return;
      finished = true;
      cleanup();
      discardWorker();
      onDone({ results: [], stopped: true });
    },
  };
}

export function warmScript(lang: ScriptRunOptions["lang"]) {
  getWorker().postMessage({ type: "warm", lang });
}
