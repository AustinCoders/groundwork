import type { ExerciseTest } from "@/content/types";

// Composes the source the sandbox runs: the learner's code, then each test in
// its own try/catch, the same shape lib/runner.ts uses for plain functions.
export function composeReactSource(code: string, tests: ExerciseTest[], options: { mountApp?: boolean } = {}): string {
  const testSource = tests
    .map(
      (test, index) =>
        "__results.push(await (async function () {\n" +
        "  try {\n" +
        test.body +
        "\n    cleanup();\n    return { index: " +
        index +
        ", name: " +
        JSON.stringify(test.name) +
        ", ok: true };\n" +
        "  } catch (err) {\n" +
        "    try { cleanup(); } catch (e) {}\n" +
        "    return { index: " +
        index +
        ", name: " +
        JSON.stringify(test.name) +
        ", ok: false, message: err && err.message ? err.message : String(err) };\n" +
        "  }\n" +
        "})());"
    )
    .join("\n");

  const mount = options.mountApp ? "\nif (typeof App === 'function') { render(React.createElement(App)); }\n" : "";

  return (
    "'use strict';\nvar __results = [];\n" + code + "\n" + mount + testSource + "\nreturn { results: __results };\n"
  );
}

type TypeScript = typeof import("typescript");

// JSX to React.createElement calls, without type-checking: React's types are
// not loaded in the sandbox, and a runtime error tells the learner more.
export function transpileJsx(ts: TypeScript, source: string): { output: string; error?: string } {
  const result = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.React,
      module: ts.ModuleKind.None,
    },
    reportDiagnostics: true,
    fileName: "input.jsx",
  });
  const errors = (result.diagnostics || []).filter((d) => d.category === ts.DiagnosticCategory.Error);
  if (errors.length) {
    return { output: "", error: errors.map((d) => ts.flattenDiagnosticMessageText(d.messageText, " ")).join("; ") };
  }
  return { output: result.outputText };
}
