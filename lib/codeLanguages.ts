import type { Extension } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { sql } from "@codemirror/lang-sql";

export type RunnableKind = "js" | "ts" | "python" | "sql";

export interface LanguageMeta {
  label: string;
  ext: string;
  runnable: RunnableKind;
  support: () => Extension;
}

// Only languages that actually run here — C/C++/Java were dropped: there's
// no free, no-signup way to execute them in-browser (Piston's public API
// went whitelist-only, Judge0 is pay-per-use, and a WASM compiler is a
// 50MB+, fragile install for what this site needs). An editor you can't
// run code in isn't worth the confusion of listing it.
export const LANG_ORDER = ["javascript", "typescript", "python", "sql"] as const;

export type LanguageKey = (typeof LANG_ORDER)[number];

export const LANGUAGES: Record<LanguageKey, LanguageMeta> = {
  javascript: { label: "JavaScript", ext: "js", runnable: "js", support: () => javascript() },
  typescript: { label: "TypeScript", ext: "ts", runnable: "ts", support: () => javascript({ typescript: true }) },
  python: { label: "Python", ext: "py", runnable: "python", support: () => python() },
  sql: { label: "SQL", ext: "sql", runnable: "sql", support: () => sql() },
};

export const HINTS: Record<RunnableKind, string> = {
  js: "⌘/Ctrl + Enter to run",
  ts: "⌘/Ctrl + Enter to compile & run",
  python: "⌘/Ctrl + Enter to run — first run downloads the Python runtime (~13MB, cached after)",
  sql: "⌘/Ctrl + Enter to run against an in-memory SQLite database",
};
