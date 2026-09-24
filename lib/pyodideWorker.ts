import { PYODIDE_BASE } from "@/lib/wasmAssets";

interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdout: (opts: { batched: (text: string) => void }) => void;
  setStderr: (opts: { batched: (text: string) => void }) => void;
}

let pyodidePromise: Promise<PyodideInterface> | null = null;

async function getPyodide(): Promise<PyodideInterface> {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      // Fetched at runtime from the CDN, so there is no module for the bundler
      // to resolve and no types to import.
      const mod = await import(/* webpackIgnore: true */ `${PYODIDE_BASE}pyodide.mjs`);
      const pyodide: PyodideInterface = await mod.loadPyodide({ indexURL: PYODIDE_BASE });
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
