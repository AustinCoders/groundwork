interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdout: (opts: { batched: (text: string) => void }) => void;
  setStderr: (opts: { batched: (text: string) => void }) => void;
}

let pyodidePromise: Promise<PyodideInterface> | null = null;

async function getPyodide(): Promise<PyodideInterface> {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      // @ts-expect-error -- runtime-only asset served from public/, no module/types to resolve
      const mod = await import(/* webpackIgnore: true */ "/wasm/pyodide/pyodide.mjs");
      const pyodide: PyodideInterface = await mod.loadPyodide({ indexURL: "/wasm/pyodide/" });
      pyodide.setStdout({ batched: (text) => postMessage({ type: "console", payload: { kind: "log", text } }) });
      pyodide.setStderr({ batched: (text) => postMessage({ type: "console", payload: { kind: "error", text } }) });
      return pyodide;
    })();
  }
  return pyodidePromise;
}

self.onmessage = async (event: MessageEvent) => {
  const data = event.data;
  if (!data || data.type !== "run") return;

  const firstLoad = !pyodidePromise;
  if (firstLoad) {
    postMessage({
      type: "console",
      payload: { kind: "system", text: "▶ loading the Python runtime — one-time, cached after this…" },
    });
  }

  try {
    const pyodide = await getPyodide();
    await pyodide.runPythonAsync(data.code);
    postMessage({ type: "done", payload: { results: [] } });
  } catch (err) {
    const text = err instanceof Error ? err.message : String(err);
    postMessage({ type: "console", payload: { kind: "error", text } });
    postMessage({ type: "done", payload: { results: [], crashed: true } });
  }
};
