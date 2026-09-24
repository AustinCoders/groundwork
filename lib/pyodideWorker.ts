import { PYODIDE_BASE } from "@/lib/wasmAssets";

interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdout: (opts: { batched: (text: string) => void }) => void;
  setStderr: (opts: { batched: (text: string) => void }) => void;
}

let pyodidePromise: Promise<PyodideInterface> | null = null;

const LINE_PRINT = `
import builtins as _b, sys as _s
if not hasattr(_b, "_gw_print"):
    _b._gw_print = _b.print
    def _gw(*args, sep=" ", end="\\n", file=None, flush=False):
        if file is not None and file is not _s.stdout:
            return _b._gw_print(*args, sep=sep, end=end, file=file, flush=flush)
        f = _s._getframe(1)
        while f is not None and f.f_code.co_filename != "<exec>":
            f = f.f_back
        mark = "\\x02%d\\x03" % (f.f_lineno if f is not None else 0)
        _b._gw_print(mark + sep.join(str(a) for a in args), end=end, flush=flush)
    _b.print = _gw
`;

function withLine(text: string): { text: string; line?: number } {
  const m = text.match(/^\x02(\d+)\x03/);
  if (!m) return { text };
  const line = Number(m[1]);
  return { text: text.slice(m[0].length), line: line > 0 ? line : undefined };
}

function errorLine(message: string): number | undefined {
  const all = [...message.matchAll(/File "<exec>", line (\d+)/g)];
  return all.length ? Number(all[all.length - 1][1]) : undefined;
}

async function getPyodide(): Promise<PyodideInterface> {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      const mod = await import(/* webpackIgnore: true */ `${PYODIDE_BASE}pyodide.mjs`);
      const pyodide: PyodideInterface = await mod.loadPyodide({ indexURL: PYODIDE_BASE });
      pyodide.setStdout({
        batched: (text) => postMessage({ type: "console", payload: { kind: "log", ...withLine(text) } }),
      });
      pyodide.setStderr({ batched: (text) => postMessage({ type: "console", payload: { kind: "error", text } }) });
      await pyodide.runPythonAsync(LINE_PRINT);
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
    postMessage({ type: "console", payload: { kind: "error", text, line: errorLine(text) } });
    postMessage({ type: "done", payload: { results: [], crashed: true } });
  }
};
