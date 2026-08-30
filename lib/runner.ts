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
  onConsole?: (entry: RunnerOutputEntry) => void;
  onDone?: (payload: RunnerDonePayload) => void;
}

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

// Reused across runs so a normal Run doesn't pay worker-spin-up cost every
// time. Only discarded when a run has to be force-terminated (timeout or
// stop) — see lib/jsWorker.ts for why this needs to be a worker at all.
let sharedWorker: Worker | null = null;

function getWorker(): Worker {
  if (!sharedWorker) {
    sharedWorker = new Worker(new URL("./jsWorker.ts", import.meta.url), { type: "module" });
  }
  return sharedWorker;
}

function discardWorker() {
  sharedWorker?.terminate();
  sharedWorker = null;
}

export function run(options: RunOptions): { stop: () => void } {
  const code = options.code || "";
  const tests = options.tests || [];
  const timeout = options.timeout || 5000;
  const onConsole = options.onConsole || (() => {});
  const onDone = options.onDone || (() => {});

  try {
    new Function("return (async function () {\n" + code + "\n});");
  } catch (err) {
    onConsole({ kind: "error", text: "SyntaxError: " + (err instanceof Error ? err.message : String(err)) });
    onDone({ results: [], crashed: true, syntax: true });
    return { stop: () => {} };
  }

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
    if (data.type === "console") onConsole(data.payload as RunnerOutputEntry);
    if (data.type === "done") {
      finished = true;
      cleanup();
      onDone(data.payload as RunnerDonePayload);
    }
  }

  worker.addEventListener("message", onMessage);

  const source =
    "'use strict';\n" +
    "var __results = [];\n" +
    "try {\n" +
    code +
    "\n" +
    buildTestSource(tests) +
    "\n} catch (err) {\n" +
    "  __send('console', { kind: 'error', text: (err && err.stack ? String(err.message) : String(err)) });\n" +
    "  __send('done', { results: __results, crashed: true });\n" +
    "  return;\n" +
    "}\n" +
    "__send('done', { results: __results });\n";

  worker.postMessage({ type: "run", source });

  timer = setTimeout(() => {
    if (finished) return;
    onConsole({
      kind: "system",
      text: "⏱ stopped after " + timeout / 1000 + "s — an endless loop, or code that never finishes?",
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

let tsModulePromise: Promise<typeof import("typescript")> | null = null;
function loadTypeScript() {
  if (!tsModulePromise) {
    tsModulePromise = import("typescript");
  }
  return tsModulePromise;
}

// `ts.transpileModule` below only does per-file syntax transformation — it
// has no Program/TypeChecker behind it, so it silently accepts genuinely
// type-incorrect code (`const x: number = "oops"` transpiles and runs
// with zero complaint). Real type errors need a full ts.createProgram,
// which needs the standard lib declarations to check against. This is
// the exact file set TypeScript resolves for `lib: ["ES2020", "WebWorker"]`
// (WebWorker, not DOM, because that's what the code actually runs in —
// see lib/jsWorker.ts) — derived by instrumenting a real compile and
// recording every lib.*.d.ts it asked for. Self-hosted under
// public/wasm/typescript-lib/ by scripts/copy-wasm-assets.mjs, and kept
// in lib/tsLibFiles.json so the script and this file share one list.
import tsLibFileNames from "@/lib/tsLibFiles.json";

const TS_DEFAULT_LIB = "lib.es2020.d.ts";
const TS_INPUT_FILE = "input.ts";

let tsLibPromise: Promise<Map<string, string>> | null = null;
function loadTsLib(): Promise<Map<string, string>> {
  if (!tsLibPromise) {
    tsLibPromise = Promise.all(
      tsLibFileNames.map((name) =>
        fetch(`/wasm/typescript-lib/${name}`)
          .then((r) => r.text())
          .then((text) => [name, text] as const)
      )
    ).then((entries) => new Map(entries));
  }
  return tsLibPromise;
}

export async function transpileTS(code: string, opts: { jsx?: boolean } = {}): Promise<string> {
  const ts = await loadTypeScript();

  // Fast, always-available syntax check + the JS that actually runs.
  const result = ts.transpileModule(code, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,

      ...(opts.jsx ? { jsx: ts.JsxEmit.React } : {}),
      module: ts.ModuleKind.None,
    },
    reportDiagnostics: true,
  });

  const syntaxErrors = (result.diagnostics || []).filter((d) => d.category === ts.DiagnosticCategory.Error);
  if (syntaxErrors.length) {
    const message = syntaxErrors.map((d) => ts.flattenDiagnosticMessageText(d.messageText, " ")).join("; ");
    throw new Error(message);
  }

  // Separate full type-check pass, purely for diagnostics — its emit is
  // discarded, transpileModule's output above is what actually runs.
  const libFiles = await loadTsLib();
  const compilerOptions: import("typescript").CompilerOptions = {
    target: ts.ScriptTarget.ES2020,
    lib: [TS_DEFAULT_LIB, "lib.webworker.d.ts"],
    module: ts.ModuleKind.None,
    noEmit: true,
    types: [],
    skipLibCheck: true,
    ...(opts.jsx ? { jsx: ts.JsxEmit.React } : {}),
  };
  const sourceFile = ts.createSourceFile(TS_INPUT_FILE, code, ts.ScriptTarget.ES2020, false);
  const getLib = (fileName: string) => libFiles.get(fileName.split("/").pop() || fileName);
  const host: import("typescript").CompilerHost = {
    getSourceFile: (fileName) => {
      if (fileName === TS_INPUT_FILE) return sourceFile;
      const text = getLib(fileName);
      return text ? ts.createSourceFile(fileName, text, ts.ScriptTarget.ES2020, false) : undefined;
    },
    getDefaultLibFileName: () => TS_DEFAULT_LIB,
    writeFile: () => {},
    getCurrentDirectory: () => "/",
    getCanonicalFileName: (fileName) => fileName,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => "\n",
    fileExists: (fileName) => fileName === TS_INPUT_FILE || getLib(fileName) !== undefined,
    readFile: (fileName) => (fileName === TS_INPUT_FILE ? code : getLib(fileName)),
  };

  const program = ts.createProgram([TS_INPUT_FILE], compilerOptions, host);
  const typeDiagnostics = program.getSemanticDiagnostics(sourceFile);
  if (typeDiagnostics.length) {
    const message = typeDiagnostics.map((d) => ts.flattenDiagnosticMessageText(d.messageText, " ")).join("; ");
    throw new Error(message);
  }

  return result.outputText;
}
