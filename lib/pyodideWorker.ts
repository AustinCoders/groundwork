import { PYODIDE_BASE } from "@/lib/wasmAssets";

interface PyodideInterface {
  runPythonAsync: (code: string, options?: { filename?: string }) => Promise<unknown>;
  setStdout: (opts: { batched: (text: string) => void }) => void;
  setStderr: (opts: { batched: (text: string) => void }) => void;
  setStdin: (opts: { stdin: () => string | undefined }) => void;
  globals: { set: (name: string, value: unknown) => void };
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
        line = f.f_lineno if f is not None else 0
        steps = getattr(_b, "_gw_tracing", None)
        mark = "\\x02%d:%d\\x03" % (line, len(steps)) if steps is not None else "\\x02%d\\x03" % line
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

function withLine(text: string): { text: string; line?: number; step?: number } {
  const m = text.match(/^\x02(\d+)(?::(\d+))?\x03/);
  if (!m) return { text };
  const line = Number(m[1]);
  const rest = text.slice(m[0].length);
  if (m[2] !== undefined) return { text: rest, step: Number(m[2]) };
  return { text: rest, line: line > 0 ? line : undefined };
}

const TRACER = String.raw`
import builtins as _b, sys as _s, json as _j

def _gw_node_value(n):
    for k in ("val", "value", "data", "key"):
        if hasattr(n, k):
            return getattr(n, k)
    return None

def _gw_view(v, d=0):
    if v is None:
        return {"t": "null", "v": "None"}
    if isinstance(v, bool):
        return {"t": "bool", "v": str(v)}
    if isinstance(v, (int, float)):
        return {"t": "num", "v": repr(v)}
    if isinstance(v, str):
        return {"t": "str", "v": v if len(v) <= 60 else v[:59] + "…"}
    if callable(v) or type(v).__name__ == "module":
        return {"t": "fn", "v": getattr(v, "__name__", "fn")}
    if d > 3:
        return {"t": "more"}
    if isinstance(v, (list, tuple)):
        return {"t": "arr", "items": [_gw_view(x, d + 1) for x in list(v)[:40]], "len": len(v)}
    if isinstance(v, (set, frozenset)):
        return {"t": "set", "items": [_gw_view(x, d + 1) for x in list(v)[:40]], "len": len(v)}
    if isinstance(v, dict):
        return {"t": "map", "entries": [[_gw_view(k, d + 1), _gw_view(x, d + 1)] for k, x in list(v.items())[:40]], "len": len(v)}
    attrs = getattr(v, "__dict__", None)
    if isinstance(attrs, dict):
        if "next" in attrs:
            items, seen, node, cycle = [], set(), v, False
            while node is not None and hasattr(node, "__dict__") and len(items) < 30:
                if id(node) in seen:
                    cycle = True
                    break
                seen.add(id(node))
                items.append(_gw_view(_gw_node_value(node), 4))
                node = getattr(node, "next", None)
            return {"t": "list", "items": items, "cycle": cycle, "more": node is not None and not cycle}
        if "left" in attrs or "right" in attrs:
            seen = set()
            def walk(n, level):
                if n is None or not hasattr(n, "__dict__") or level > 6 or id(n) in seen:
                    return None
                seen.add(id(n))
                return {"v": _gw_view(_gw_node_value(n), 4), "l": walk(getattr(n, "left", None), level + 1), "r": walk(getattr(n, "right", None), level + 1)}
            return {"t": "tree", "root": walk(v, 0)}
        return {"t": "obj", "cls": type(v).__name__, "entries": [[k, _gw_view(x, d + 1)] for k, x in list(attrs.items())[:20]]}
    return {"t": "str", "v": repr(v)[:60]}

def _gw_trace_run(src, max_steps=2000):
    steps = []
    truncated = [False]
    _b._gw_tracing = steps

    def depth(f):
        n = 0
        while f is not None:
            if f.f_code.co_filename == "<exec>" and f.f_code.co_name != "<module>":
                n += 1
            f = f.f_back
        return n

    def tracer(frame, event, arg):
        if frame.f_code.co_filename != "<exec>":
            return None
        if event == "line":
            if len(steps) >= max_steps:
                truncated[0] = True
            else:
                found = {}
                for k, x in list(frame.f_locals.items()):
                    if k.startswith("_"):
                        continue
                    view = _gw_view(x)
                    if view["t"] != "fn":
                        found[k] = view
                name = frame.f_code.co_name
                steps.append({"line": frame.f_lineno, "fn": "(top level)" if name == "<module>" else name, "depth": depth(frame), "vars": found})
        return tracer

    scope = {"__name__": "__main__"}
    _s.settrace(tracer)
    try:
        exec(compile(src, "<exec>", "exec"), scope)
    finally:
        _s.settrace(None)
        _b._gw_tracing = None
        _b._gw_trace_result = _j.dumps({"steps": steps, "truncated": truncated[0]})
`;

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
      await pyodide.runPythonAsync(LINE_PRINT, { filename: "<groundwork>" });
      await pyodide.runPythonAsync(TRACER, { filename: "<groundwork>" });
      return pyodide;
    })();
  }
  return pyodidePromise;
}

async function traceResult(on: boolean) {
  if (!on || !pyodidePromise) return undefined;
  const pyodide = await pyodidePromise;
  const raw = await pyodide.runPythonAsync("import builtins as _b\n_b.__dict__.get('_gw_trace_result')");
  return typeof raw === "string" ? JSON.parse(raw) : undefined;
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
    if (data.trace) {
      pyodide.globals.set("_gw_src", data.code);
      await pyodide.runPythonAsync("_gw_trace_run(_gw_src)");
    } else await pyodide.runPythonAsync(data.code);
    postMessage({ type: "done", payload: { results: [], trace: await traceResult(data.trace) } });
  } catch (err) {
    const text = err instanceof Error ? err.message : String(err);
    postMessage({ type: "console", payload: { kind: "error", text, line: data.trace ? undefined : errorLine(text) } });
    postMessage({ type: "done", payload: { results: [], crashed: true, trace: await traceResult(data.trace) } });
  }
};
