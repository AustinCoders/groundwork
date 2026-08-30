import type { Extension } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { sql } from "@codemirror/lang-sql";

export type RunnableKind = "js" | "ts" | null;

export interface LanguageMeta {
  label: string;
  ext: string;
  runnable: RunnableKind;
  support: () => Extension;
}

// The languages an interview-problem editor actually needs — the ones you'd
// solve a DSA problem in, not web-page languages like HTML/CSS/JSON/Markdown.
// JS/TS run in the in-browser sandbox; the rest get full syntax highlighting
// for writing and reading, same as any other editor's language list.
export const LANG_ORDER = ["javascript", "typescript", "python", "c", "cpp", "java", "sql"] as const;

export type LanguageKey = (typeof LANG_ORDER)[number];

export const LANGUAGES: Record<LanguageKey, LanguageMeta> = {
  javascript: { label: "JavaScript", ext: "js", runnable: "js", support: () => javascript() },
  typescript: { label: "TypeScript", ext: "ts", runnable: "ts", support: () => javascript({ typescript: true }) },
  python: { label: "Python", ext: "py", runnable: null, support: () => python() },
  c: { label: "C", ext: "c", runnable: null, support: () => cpp() },
  cpp: { label: "C++", ext: "cpp", runnable: null, support: () => cpp() },
  java: { label: "Java", ext: "java", runnable: null, support: () => java() },
  sql: { label: "SQL", ext: "sql", runnable: null, support: () => sql() },
};

export const HINTS: Record<string, string> = {
  js: "⌘/Ctrl + Enter to run",
  ts: "⌘/Ctrl + Enter to compile & run",
  none: "✎ editing only — no in-browser runner for this language",
};
