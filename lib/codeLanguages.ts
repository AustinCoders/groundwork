import type { Extension } from "@codemirror/state";
import type { StreamParser } from "@codemirror/language";

export type RunnableKind = "js" | "ts" | "python" | "sql" | "web";

export interface LanguageMeta {
  label: string;
  ext: string;
  runnable: RunnableKind | null;
  comment: string;
  support: () => Promise<Extension>;
}

export const LANG_ORDER = [
  "javascript",
  "typescript",
  "python",
  "sql",
  "html",
  "css",
  "cpp",
  "c",
  "java",
  "go",
  "rust",
  "kotlin",
  "swift",
  "csharp",
  "ruby",
  "php",
  "lua",
] as const;

export type LanguageKey = (typeof LANG_ORDER)[number];

async function legacy(load: () => Promise<StreamParser<unknown>>): Promise<Extension> {
  const [{ StreamLanguage }, parser] = await Promise.all([import("@codemirror/language"), load()]);
  return StreamLanguage.define(parser);
}

export const LANGUAGES: Record<LanguageKey, LanguageMeta> = {
  javascript: {
    label: "JavaScript",
    ext: "js",
    runnable: "js",
    comment: "//",
    support: async () => (await import("@codemirror/lang-javascript")).javascript({ jsx: true }),
  },
  typescript: {
    label: "TypeScript",
    ext: "ts",
    runnable: "ts",
    comment: "//",
    support: async () => (await import("@codemirror/lang-javascript")).javascript({ typescript: true }),
  },
  python: {
    label: "Python",
    ext: "py",
    runnable: "python",
    comment: "#",
    support: async () => (await import("@codemirror/lang-python")).python(),
  },
  sql: {
    label: "SQL",
    ext: "sql",
    runnable: "sql",
    comment: "--",
    support: async () => (await import("@codemirror/lang-sql")).sql(),
  },
  html: {
    label: "HTML",
    ext: "html",
    runnable: "web",
    comment: "<!--",
    support: async () => (await import("@codemirror/lang-html")).html(),
  },
  css: {
    label: "CSS",
    ext: "css",
    runnable: "web",
    comment: "/*",
    support: async () => (await import("@codemirror/lang-css")).css(),
  },
  cpp: {
    label: "C++",
    ext: "cpp",
    runnable: null,
    comment: "//",
    support: async () => (await import("@codemirror/lang-cpp")).cpp(),
  },
  c: {
    label: "C",
    ext: "c",
    runnable: null,
    comment: "//",
    support: async () => (await import("@codemirror/lang-cpp")).cpp(),
  },
  java: {
    label: "Java",
    ext: "java",
    runnable: null,
    comment: "//",
    support: async () => (await import("@codemirror/lang-java")).java(),
  },
  go: {
    label: "Go",
    ext: "go",
    runnable: null,
    comment: "//",
    support: async () => (await import("@codemirror/lang-go")).go(),
  },
  rust: {
    label: "Rust",
    ext: "rs",
    runnable: null,
    comment: "//",
    support: async () => (await import("@codemirror/lang-rust")).rust(),
  },
  kotlin: {
    label: "Kotlin",
    ext: "kt",
    runnable: null,
    comment: "//",
    support: () => legacy(async () => (await import("@codemirror/legacy-modes/mode/clike")).kotlin),
  },
  swift: {
    label: "Swift",
    ext: "swift",
    runnable: null,
    comment: "//",
    support: () => legacy(async () => (await import("@codemirror/legacy-modes/mode/swift")).swift),
  },
  csharp: {
    label: "C#",
    ext: "cs",
    runnable: null,
    comment: "//",
    support: () => legacy(async () => (await import("@codemirror/legacy-modes/mode/clike")).csharp),
  },
  ruby: {
    label: "Ruby",
    ext: "rb",
    runnable: null,
    comment: "#",
    support: () => legacy(async () => (await import("@codemirror/legacy-modes/mode/ruby")).ruby),
  },
  php: {
    label: "PHP",
    ext: "php",
    runnable: null,
    comment: "//",
    support: async () => (await import("@codemirror/lang-php")).php(),
  },
  lua: {
    label: "Lua",
    ext: "lua",
    runnable: null,
    comment: "--",
    support: () => legacy(async () => (await import("@codemirror/legacy-modes/mode/lua")).lua),
  },
};

export function isLanguage(key: string): key is LanguageKey {
  return (LANG_ORDER as readonly string[]).includes(key);
}

export const HINTS: Record<RunnableKind, string> = {
  js: "⌘/Ctrl + Enter to run",
  ts: "⌘/Ctrl + Enter to compile & run",
  python: "⌘/Ctrl + Enter to run — first run downloads the Python runtime (~13MB, cached after)",
  sql: "⌘/Ctrl + Enter to run against an in-memory SQLite database",
  web: "⌘/Ctrl + Enter to render the page in Preview",
};

export const WEB_LANGUAGES: readonly LanguageKey[] = ["html", "css"];

export const WRITE_ONLY_HINT =
  "No compiler for this language runs in a browser — write it here, then run it in your own toolchain.";
