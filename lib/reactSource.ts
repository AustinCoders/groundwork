import type { ExerciseTest } from "@/content/types";

// Composes the source the sandbox runs: the learner's code, then each test in
// its own try/catch, the same shape lib/runner.ts uses for plain functions.
export function composeReactSource(code: string, tests: ExerciseTest[], options: { mountApp?: boolean } = {}): string {
  const testSource = tests
    .map(
      (test, index) =>
        "__results.push(await (async function () {\n" +
        "  __resetLoopGuard();\n" +
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

  const mount = options.mountApp
    ? "\n__resetLoopGuard();\nif (typeof App === 'function') { render(React.createElement(App)); }\n"
    : "";

  return (
    "'use strict';\nvar __results = [];\n" + code + "\n" + mount + testSource + "\nreturn { results: __results };\n"
  );
}

type TypeScript = typeof import("typescript");

// Injects a call to __loopGuard() at the top of every loop body, so a
// synchronous infinite loop (while (true) {}) throws after a time budget
// instead of freezing the tab. The sandbox provides __loopGuard/
// __resetLoopGuard as globals; see lib/reactSandbox/runtime.ts.
function loopGuardTransformer(ts: TypeScript) {
  return (context: import("typescript").TransformationContext) => {
    const { factory } = context;
    const guardCall = () =>
      factory.createExpressionStatement(
        factory.createCallExpression(factory.createIdentifier("__loopGuard"), undefined, [])
      );
    const wrapBody = (body: import("typescript").Statement) =>
      ts.isBlock(body)
        ? factory.updateBlock(body, [guardCall(), ...body.statements])
        : factory.createBlock([guardCall(), body], true);

    function visit(node: import("typescript").Node): import("typescript").Node {
      const visited = ts.visitEachChild(node, visit, context);
      if (ts.isWhileStatement(visited))
        return factory.updateWhileStatement(visited, visited.expression, wrapBody(visited.statement));
      if (ts.isDoStatement(visited))
        return factory.updateDoStatement(visited, wrapBody(visited.statement), visited.expression);
      if (ts.isForStatement(visited))
        return factory.updateForStatement(
          visited,
          visited.initializer,
          visited.condition,
          visited.incrementor,
          wrapBody(visited.statement)
        );
      if (ts.isForInStatement(visited))
        return factory.updateForInStatement(
          visited,
          visited.initializer,
          visited.expression,
          wrapBody(visited.statement)
        );
      if (ts.isForOfStatement(visited))
        return factory.updateForOfStatement(
          visited,
          visited.awaitModifier,
          visited.initializer,
          visited.expression,
          wrapBody(visited.statement)
        );
      return visited;
    }

    return (sourceFile: import("typescript").SourceFile) =>
      ts.visitNode(sourceFile, visit) as import("typescript").SourceFile;
  };
}

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
    transformers: { after: [loopGuardTransformer(ts)] },
  });
  const errors = (result.diagnostics || []).filter((d) => d.category === ts.DiagnosticCategory.Error);
  if (errors.length) {
    return { output: "", error: errors.map((d) => ts.flattenDiagnosticMessageText(d.messageText, " ")).join("; ") };
  }
  return { output: result.outputText };
}
