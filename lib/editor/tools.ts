/**
 * The main-thread side of the editor's tools worker: one worker, started on
 * first use, answering format / lint / fix requests by id.
 */

export interface EditorProblem {
  from: number;
  to: number;
  line: number;
  column: number;
  severity: "error" | "warning";
  message: string;
  /** Which tool said so, VS Code style: "eslint(no-undef)", "ts(2322)". */
  source: string;
  fix?: { from: number; to: number; insert: string };
}

export type ToolRequest =
  | { id: number; type: "format"; code: string; lang: string; cursor?: number; tabWidth?: number }
  | { id: number; type: "lint"; code: string; lang: string }
  | { id: number; type: "fix"; code: string; lang: string };

export interface ToolResponse {
  id: number;
  ok: boolean;
  result?: unknown;
  error?: string;
}

/** Languages the tools understand. */
export const FORMATS = new Set(["javascript", "typescript"]);
export const LINTS = new Set(["javascript", "typescript"]);

let worker: Worker | null = null;
let nextId = 1;
const waiting = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("./toolsWorker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (event: MessageEvent<ToolResponse>) => {
      const call = waiting.get(event.data.id);
      if (!call) return;
      waiting.delete(event.data.id);
      if (event.data.ok) call.resolve(event.data.result);
      else call.reject(new Error(event.data.error));
    };
  }
  return worker;
}

type Without<T> = T extends unknown ? Omit<T, "id"> : never;

function ask<T>(req: Without<ToolRequest>): Promise<T> {
  const id = nextId++;
  return new Promise<T>((resolve, reject) => {
    waiting.set(id, { resolve: resolve as (v: unknown) => void, reject });
    getWorker().postMessage({ ...req, id });
  });
}

export function formatCode(code: string, lang: string, cursor: number, tabWidth: number) {
  return ask<{ code: string; cursor: number }>({ type: "format", code, lang, cursor, tabWidth });
}

export function lintCode(code: string, lang: string) {
  return ask<EditorProblem[]>({ type: "lint", code, lang });
}

export function fixAll(code: string, lang: string) {
  return ask<string>({ type: "fix", code, lang });
}
