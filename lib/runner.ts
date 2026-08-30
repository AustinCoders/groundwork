export interface RunnerConsoleEntry {
  kind: "log" | "info" | "warn" | "error" | "system";
  text: string;
}

/** A SQL result set, rendered as a table instead of a text line. */
export interface RunnerTableEntry {
  kind: "table";
  columns: string[];
  rows: (string | number | null)[][];
}

export type RunnerOutputEntry = RunnerConsoleEntry | RunnerTableEntry;

export interface RunnerTestResult {
  index: number;
  name: string;
  ok: boolean;
  message?: string;
}

export interface RunnerDonePayload {
  results: RunnerTestResult[];
  crashed?: boolean;
  syntax?: boolean;
  timedOut?: boolean;
  stopped?: boolean;
}

export interface RunOptions {
  code: string;
  tests?: { name: string; body: string }[];
  timeout?: number;
  extraHead?: string;
  extraBody?: string;
  linger?: number;
  onConsole?: (entry: RunnerOutputEntry) => void;
  onDone?: (payload: RunnerDonePayload) => void;
}

const BOOT = `(function () {
  var send = function (type, payload) {
    parent.postMessage({ __pg: true, type: type, payload: payload }, '*');
  };
  window.__send = send;

  var fmt = function (value, depth, seen) {
    depth = depth || 0;
    seen = seen || [];
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    var t = typeof value;
    if (t === 'string') return depth === 0 ? value : JSON.stringify(value);
    if (t === 'number' || t === 'boolean' || t === 'bigint') return String(value);
    if (t === 'symbol') return value.toString();
    if (t === 'function') return value.name ? 'ƒ ' + value.name + '()' : 'ƒ ()';
    if (value instanceof Error) return value.name + ': ' + value.message;
    if (seen.indexOf(value) !== -1) return '[circular]';
    if (depth > 3) return Array.isArray(value) ? '[…]' : '{…}';
    seen = seen.concat([value]);
    if (Array.isArray(value)) {
      return '[' + value.map(function (v) { return fmt(v, depth + 1, seen); }).join(', ') + ']';
    }
    if (value instanceof Map) {
      var pairs = [];
      value.forEach(function (v, k) { pairs.push(fmt(k, depth + 1, seen) + ' => ' + fmt(v, depth + 1, seen)); });
      return 'Map(' + value.size + ') { ' + pairs.join(', ') + ' }';
    }
    if (value instanceof Set) {
      var items = [];
      value.forEach(function (v) { items.push(fmt(v, depth + 1, seen)); });
      return 'Set(' + value.size + ') { ' + items.join(', ') + ' }';
    }
    if (value instanceof Date) return value.toISOString();
    if (value instanceof Promise) return 'Promise { … }';
    var keys = Object.keys(value);
    if (!keys.length) return '{}';
    return '{ ' + keys.map(function (k) {
      return k + ': ' + fmt(value[k], depth + 1, seen);
    }).join(', ') + ' }';
  };

  var line = function (kind) {
    return function () {
      var parts = Array.prototype.map.call(arguments, function (a) { return fmt(a, 0); });
      send('console', { kind: kind, text: parts.join(' ') });
    };
  };

  console.log = line('log');
  console.info = line('info');
  console.debug = line('log');
  console.warn = line('warn');
  console.error = line('error');
  console.table = line('log');
  console.dir = line('log');

  window.onerror = function (message) {
    send('console', { kind: 'error', text: String(message) });
    return true;
  };
  window.addEventListener('unhandledrejection', function (e) {
    var reason = e.reason;
    send('console', { kind: 'error', text: 'Uncaught (in promise) ' + fmt(reason && reason.message ? reason.message : reason, 0) });
  });

  var same = function (a, b) {
    if (a === b) return true;
    if (typeof a === 'number' && typeof b === 'number') {
      return Number.isNaN(a) && Number.isNaN(b);
    }
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (a instanceof Map || b instanceof Map || a instanceof Set || b instanceof Set) {
      return fmt(a, 1) === fmt(b, 1);
    }
    var ka = Object.keys(a);
    var kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    return ka.every(function (k) { return same(a[k], b[k]); });
  };

  window.assert = {
    ok: function (value, message) {
      if (!value) throw new Error(message || 'expected something truthy, got ' + fmt(value, 1));
    },
    equal: function (actual, expected, message) {
      if (actual !== expected) {
        throw new Error(message || ('expected ' + fmt(expected, 1) + ' but got ' + fmt(actual, 1)));
      }
    },
    notEqual: function (actual, unexpected, message) {
      if (actual === unexpected) {
        throw new Error(message || ('expected something other than ' + fmt(unexpected, 1)));
      }
    },
    deepEqual: function (actual, expected, message) {
      if (!same(actual, expected)) {
        throw new Error(message || ('expected ' + fmt(expected, 1) + ' but got ' + fmt(actual, 1)));
      }
    },
    type: function (value, expected, message) {
      if (typeof value !== expected) {
        throw new Error(message || ('expected a ' + expected + ' but got ' + typeof value));
      }
    },
    throws: function (fn, message) {
      try { fn(); } catch (e) { return; }
      throw new Error(message || 'expected that to throw');
    },
  };
})();`;

function buildTestSource(tests: { name: string; body: string }[]) {
  if (!tests || !tests.length) return "";
  return tests
    .map(
      (test, index) =>
        "__results.push(await (async function () {\n" +
        "  try {\n" +
        test.body +
        "\n    return { index: " +
        index +
        ", name: " +
        JSON.stringify(test.name) +
        ", ok: true };\n" +
        "  } catch (err) {\n" +
        "    return { index: " +
        index +
        ", name: " +
        JSON.stringify(test.name) +
        ", ok: false, message: err && err.message ? err.message : String(err) };\n" +
        "  }\n" +
        "})());"
    )
    .join("\n");
}

export function run(options: RunOptions): { stop: () => void } {
  const code = options.code || "";
  const tests = options.tests || [];
  const timeout = options.timeout || 5000;
  const onConsole = options.onConsole || (() => {});
  const onDone = options.onDone || (() => {});
  const extraHead = options.extraHead || "";
  const extraBody = options.extraBody || "";

  try {
    new Function("return (async function () {\n" + code + "\n});");
  } catch (err) {
    onConsole({ kind: "error", text: "SyntaxError: " + (err instanceof Error ? err.message : String(err)) });
    onDone({ results: [], crashed: true, syntax: true });
    return { stop: () => {} };
  }

  const frame = document.createElement("iframe");
  frame.setAttribute("sandbox", "allow-scripts");
  frame.setAttribute("aria-hidden", "true");

  frame.style.cssText =
    "position:fixed;top:0;left:0;width:1px;height:1px;border:0;" + "opacity:0.01;pointer-events:none;z-index:-1";

  let finished = false;
  let destroyed = false;

  // eslint-disable-next-line prefer-const
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lingerTimer: ReturnType<typeof setTimeout> | undefined;
  const linger = options.linger == null ? 3000 : options.linger;

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    window.removeEventListener("message", onMessage);
    clearTimeout(timer);
    clearTimeout(lingerTimer);
    if (frame.parentNode) frame.parentNode.removeChild(frame);
  }

  function finish(payload?: RunnerDonePayload) {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    onDone(payload || { results: [] });
    lingerTimer = setTimeout(destroy, linger);
  }

  function onMessage(event: MessageEvent) {
    const data = event.data;
    if (!data || data.__pg !== true) return;
    if (frame.contentWindow && event.source !== frame.contentWindow) return;

    if (data.type === "console") onConsole(data.payload);
    if (data.type === "done") finish(data.payload);
  }

  window.addEventListener("message", onMessage);

  const body =
    "<!doctype html><html><head><meta charset='utf-8'>" +
    extraHead +
    "</head><body>" +
    extraBody +
    "<script>" +
    BOOT +
    "<\/script>" +
    "<script>(async function () {\n" +
    "'use strict';\n" +
    "var __results = [];\n" +
    "try {\n" +
    code +
    "\n" +
    buildTestSource(tests) +
    "\n} catch (err) {\n" +
    "  window.__send('console', { kind: 'error', text: (err && err.stack ? String(err.message) : String(err)) });\n" +
    "  window.__send('done', { results: __results, crashed: true });\n" +
    "  return;\n" +
    "}\n" +
    "window.__send('done', { results: __results });\n" +
    "})();<\/script>" +
    "</body></html>";

  frame.srcdoc = body;
  document.body.appendChild(frame);

  timer = setTimeout(() => {
    onConsole({
      kind: "system",
      text: "⏱ stopped after " + timeout / 1000 + "s — an endless loop, or code that never finishes?",
    });
    finish({ results: [], timedOut: true });
    destroy();
  }, timeout);

  return {
    stop: () => {
      finish({ results: [], stopped: true });
      destroy();
    },
  };
}

let tsModulePromise: Promise<typeof import("typescript")> | null = null;
function loadTypeScript() {
  if (!tsModulePromise) {
    tsModulePromise = import("typescript");
  }
  return tsModulePromise;
}

export async function transpileTS(code: string, opts: { jsx?: boolean } = {}): Promise<string> {
  const ts = await loadTypeScript();
  const result = ts.transpileModule(code, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,

      ...(opts.jsx ? { jsx: ts.JsxEmit.React } : {}),
      module: ts.ModuleKind.None,
    },
    reportDiagnostics: true,
  });

  const errors = (result.diagnostics || []).filter((d) => d.category === ts.DiagnosticCategory.Error);

  if (errors.length) {
    const message = errors.map((d) => ts.flattenDiagnosticMessageText(d.messageText, " ")).join("; ");
    throw new Error(message);
  }

  return result.outputText;
}
