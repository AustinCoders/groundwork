import type { Linter as LinterType } from "eslint";
import type { CompilerHost, CompilerOptions } from "typescript";
import tsLibFileNames from "@/lib/tsLibFiles.json";
import type { EditorProblem, ToolRequest, ToolResponse } from "@/lib/editor/tools";

/**
 * The editor's tools, off the main thread: Prettier formats, ESLint lints and
 * fixes, TypeScript type-checks. Each is loaded the first time it is asked
 * for, so a reader who never formats never downloads Prettier.
 */

/* ------------------------------------------------------------------ */
/* Offsets                                                              */
/* ------------------------------------------------------------------ */

function lineStarts(code: string): number[] {
  const starts = [0];
  for (let i = 0; i < code.length; i++) if (code[i] === "\n") starts.push(i + 1);
  return starts;
}

function offset(starts: number[], line: number, column: number, length: number): number {
  const base = starts[Math.min(Math.max(line, 1), starts.length) - 1] ?? 0;
  return Math.min(base + Math.max(column, 1) - 1, length);
}

/* ------------------------------------------------------------------ */
/* Prettier                                                             */
/* ------------------------------------------------------------------ */

async function format(code: string, lang: string, cursor: number, tabWidth: number) {
  const [prettier, estree, parser] = await Promise.all([
    import("prettier/standalone"),
    import("prettier/plugins/estree"),
    lang === "typescript" ? import("prettier/plugins/typescript") : import("prettier/plugins/babel"),
  ]);
  const result = await prettier.formatWithCursor(code, {
    cursorOffset: Math.min(cursor, code.length),
    parser: lang === "typescript" ? "typescript" : "babel",
    plugins: [estree.default ?? estree, parser.default ?? parser],
    tabWidth,
    printWidth: 100,
  });
  return { code: result.formatted, cursor: result.cursorOffset };
}

/* ------------------------------------------------------------------ */
/* ESLint                                                               */
/* ------------------------------------------------------------------ */

// The rules a reader would want flagged in a scratch file or an exercise:
// ESLint's recommended set for real bugs, plus a few style warnings VS Code
// users are used to. Top-level declarations are left alone by no-unused-vars,
// because an exercise's function is called by the tests, not by the file.
const RULES: LinterType.RulesRecord = {
  "constructor-super": "error",
  "for-direction": "error",
  "getter-return": "error",
  "no-async-promise-executor": "error",
  "no-class-assign": "error",
  "no-compare-neg-zero": "error",
  "no-cond-assign": "error",
  "no-const-assign": "error",
  "no-constant-binary-expression": "error",
  "no-constant-condition": "warn",
  "no-debugger": "warn",
  "no-dupe-args": "error",
  "no-dupe-class-members": "error",
  "no-dupe-else-if": "error",
  "no-dupe-keys": "error",
  "no-duplicate-case": "error",
  "no-empty": "warn",
  "no-empty-pattern": "error",
  "no-ex-assign": "error",
  "no-fallthrough": "warn",
  "no-func-assign": "error",
  "no-import-assign": "error",
  "no-inner-declarations": "off",
  "no-invalid-regexp": "error",
  "no-irregular-whitespace": "error",
  "no-loss-of-precision": "error",
  "no-new-native-nonconstructor": "error",
  "no-obj-calls": "error",
  "no-redeclare": "error",
  "no-self-assign": "error",
  "no-self-compare": "warn",
  "no-setter-return": "error",
  "no-shadow-restricted-names": "error",
  "no-sparse-arrays": "warn",
  "no-this-before-super": "error",
  "no-undef": "error",
  "no-unreachable": "warn",
  "no-unsafe-finally": "error",
  "no-unsafe-negation": "error",
  "no-unsafe-optional-chaining": "error",
  "no-unused-labels": "warn",
  "no-unused-vars": ["warn", { vars: "local", args: "after-used", ignoreRestSiblings: true }],
  "no-useless-escape": "warn",
  "no-var": "warn",
  "prefer-const": "warn",
  "use-isnan": "error",
  "valid-typeof": "error",
  eqeqeq: ["warn", "smart"],
};

let linterPromise: Promise<{ linter: LinterType; config: LinterType.Config[] }> | null = null;

function loadLinter() {
  if (!linterPromise) {
    linterPromise = Promise.all([import("eslint-linter-browserify"), import("globals")]).then(([mod, g]) => {
      const globals = g.default ?? g;
      const linter = new mod.Linter({ configType: "flat" }) as unknown as LinterType;
      const config: LinterType.Config[] = [
        {
          languageOptions: {
            ecmaVersion: "latest",
            sourceType: "script",
            parserOptions: { ecmaFeatures: { jsx: true } },
            globals: {
              ...globals.browser,
              ...globals.worker,
              ...globals.es2021,
              // what the sandbox and the React exercises provide
              assert: "readonly",
              React: "readonly",
              __loopGuard: "readonly",
            },
          },
          rules: RULES,
        },
      ];
      return { linter, config };
    });
  }
  return linterPromise;
}

async function lint(code: string): Promise<EditorProblem[]> {
  const { linter, config } = await loadLinter();
  const starts = lineStarts(code);
  return linter.verify(code, config).map((m) => {
    const from = offset(starts, m.line, m.column, code.length);
    const to = m.endLine ? offset(starts, m.endLine, m.endColumn ?? m.column, code.length) : from;
    return {
      from,
      to: Math.max(to, from),
      line: m.line,
      column: m.column,
      severity: m.severity === 2 ? "error" : "warning",
      message: m.message,
      source: m.ruleId ? `eslint(${m.ruleId})` : "eslint",
      fix: m.fix ? { from: m.fix.range[0], to: m.fix.range[1], insert: m.fix.text } : undefined,
    };
  });
}

async function fixAll(code: string): Promise<string> {
  const { linter, config } = await loadLinter();
  return linter.verifyAndFix(code, config).output;
}

/* ------------------------------------------------------------------ */
/* TypeScript                                                           */
/* ------------------------------------------------------------------ */

let tsPromise: Promise<{ ts: typeof import("typescript"); libs: Map<string, string> }> | null = null;

function loadTs() {
  if (!tsPromise) {
    tsPromise = Promise.all([
      import("typescript"),
      Promise.all(
        tsLibFileNames.map((name) =>
          fetch(`/wasm/typescript-lib/${name}`)
            .then((r) => r.text())
            .then((text) => [name, text] as const)
        )
      ),
    ]).then(([ts, entries]) => ({
      ts: (ts as { default?: typeof import("typescript") }).default ?? ts,
      libs: new Map(entries),
    }));
  }
  return tsPromise;
}

async function typeCheck(code: string): Promise<EditorProblem[]> {
  const { ts, libs } = await loadTs();
  const FILE = "input.ts";
  const options: CompilerOptions = {
    target: ts.ScriptTarget.ES2020,
    lib: ["lib.es2020.d.ts", "lib.webworker.d.ts"],
    module: ts.ModuleKind.None,
    noEmit: true,
    strict: true,
    types: [],
    skipLibCheck: true,
  };
  const source = ts.createSourceFile(FILE, code, ts.ScriptTarget.ES2020, true);
  const lib = (name: string) => libs.get(name.split("/").pop() || name);
  const host: CompilerHost = {
    getSourceFile: (name) =>
      name === FILE
        ? source
        : lib(name) !== undefined
          ? ts.createSourceFile(name, lib(name)!, ts.ScriptTarget.ES2020)
          : undefined,
    getDefaultLibFileName: () => "lib.es2020.d.ts",
    writeFile: () => {},
    getCurrentDirectory: () => "/",
    getCanonicalFileName: (n) => n,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => "\n",
    fileExists: (n) => n === FILE || lib(n) !== undefined,
    readFile: (n) => (n === FILE ? code : lib(n)),
  };
  const program = ts.createProgram([FILE], options, host);
  const diagnostics = [...program.getSyntacticDiagnostics(source), ...program.getSemanticDiagnostics(source)];
  return diagnostics.map((d) => {
    const from = d.start ?? 0;
    const { line, character } = source.getLineAndCharacterOfPosition(from);
    return {
      from,
      to: from + (d.length ?? 0),
      line: line + 1,
      column: character + 1,
      severity: d.category === ts.DiagnosticCategory.Error ? "error" : "warning",
      message: ts.flattenDiagnosticMessageText(d.messageText, "\n"),
      source: `ts(${d.code})`,
    };
  });
}

/* ------------------------------------------------------------------ */

self.onmessage = async (event: MessageEvent<ToolRequest>) => {
  const req = event.data;
  const reply = (r: Omit<ToolResponse, "id">) => postMessage({ id: req.id, ...r });
  try {
    switch (req.type) {
      case "format":
        reply({ ok: true, result: await format(req.code, req.lang, req.cursor ?? 0, req.tabWidth ?? 2) });
        break;
      case "lint":
        reply({ ok: true, result: req.lang === "typescript" ? await typeCheck(req.code) : await lint(req.code) });
        break;
      case "fix":
        reply({ ok: true, result: await fixAll(req.code) });
        break;
    }
  } catch (err) {
    reply({ ok: false, error: err instanceof Error ? err.message : String(err) });
  }
};
