import { PYODIDE_BASE } from "@/lib/wasmAssets";

interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdout: (opts: { batched: (text: string) => void }) => void;
  setStderr: (opts: { batched: (text: string) => void }) => void;
  setStdin: (opts: { stdin: () => string | undefined }) => void;
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

    def compare(candidates, budget_ms=300):
        import time as _t
        rows = []
        for name, fn in candidates.items():
            for _ in range(3):
                fn()
            runs, start = 0, _t.perf_counter()
            while True:
                for _ in range(10):
                    fn()
                runs += 10
                elapsed = (_t.perf_counter() - start) * 1000
                if elapsed >= budget_ms:
                    break
            rows.append((name, elapsed / runs))
        rows.sort(key=lambda r: r[1])
        best = rows[0][1]
        width = max(len(n) for n, _ in rows) + 3
        for i, (name, per) in enumerate(rows):
            label = ("* " if i == 0 else "  ") + name
            speed = "fastest" if i == 0 else "%.2fx slower" % (per / best)
            _b._gw_print("%s  %10.4f ms/call  %s" % (label.ljust(width), per, speed))
        return [n for n, _ in rows]

    _b.compare = compare
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
    const lines: string[] = String(data.stdin ?? "")
      .replace(/\r\n/g, "\n")
      .split("\n");
    if (lines.at(-1) === "") lines.pop();
    pyodide.setStdin({ stdin: () => (lines.length ? `${lines.shift()}\n` : undefined) });
    await pyodide.runPythonAsync(data.code);
    postMessage({ type: "done", payload: { results: [] } });
  } catch (err) {
    const text = err instanceof Error ? err.message : String(err);
    postMessage({ type: "console", payload: { kind: "error", text, line: errorLine(text) } });
    postMessage({ type: "done", payload: { results: [], crashed: true } });
  }
};
