import type { RunnerDonePayload, RunnerOutputEntry } from "@/lib/runner";

export interface PythonRunOptions {
  code: string;
  timeout?: number;
  onConsole?: (entry: RunnerOutputEntry) => void;
  onDone?: (payload: RunnerDonePayload) => void;
}

// Reused across runs — spinning up a fresh worker (and re-downloading/
// re-initializing Pyodide) every keystroke-to-run cycle would be slow.
// Only replaced if a run has to be force-terminated (timeout or stop).
let sharedWorker: Worker | null = null;

function getWorker(): Worker {
  if (!sharedWorker) {
    sharedWorker = new Worker(new URL("./pyodideWorker.ts", import.meta.url), { type: "module" });
  }
  return sharedWorker;
}

function discardWorker() {
  sharedWorker?.terminate();
  sharedWorker = null;
}

export function runPython(options: PythonRunOptions): { stop: () => void } {
  const onConsole = options.onConsole || (() => {});
  const onDone = options.onDone || (() => {});
  // Pyodide's first load downloads and instantiates ~13MB of WASM — give
  // it real headroom before assuming the code itself is hung.
  const timeout = options.timeout ?? 20000;

  const worker = getWorker();
  let finished = false;
  // eslint-disable-next-line prefer-const -- assigned once, right after the listener below is wired up
  let timer: ReturnType<typeof setTimeout> | undefined;

  function cleanup() {
    worker.removeEventListener("message", onMessage);
    clearTimeout(timer);
  }

  function onMessage(event: MessageEvent) {
    const data = event.data;
    if (!data) return;
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
  worker.postMessage({ type: "run", code: options.code });

  timer = setTimeout(() => {
    if (finished) return;
    onConsole({
      kind: "system",
      text: `⏱ stopped after ${timeout / 1000}s — an endless loop, or code that never finishes?`,
    });
    cleanup();
    discardWorker();
    onDone({ results: [], timedOut: true });
  }, timeout);

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
