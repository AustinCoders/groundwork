import { isLanguage, type LanguageKey } from "@/lib/codeLanguages";
import { store } from "@/lib/storage";

export interface RunRecord {
  at: number;
  file: string;
  lang: LanguageKey;
  code: string;
  ms: number | null;
  ok: boolean;
  summary: string;
}

const KEY = "groundwork:playground:runs";
const LIMIT = 15;

export function sanitizeRuns(value: unknown): RunRecord[] {
  if (!Array.isArray(value)) return [];
  const runs: RunRecord[] = [];
  for (const entry of value) {
    if (entry === null || typeof entry !== "object") continue;
    const { at, file, lang, code, ms, ok, summary } = entry as Record<string, unknown>;
    if (typeof at !== "number" || !Number.isFinite(at)) continue;
    if (typeof file !== "string" || typeof lang !== "string" || !isLanguage(lang)) continue;
    if (typeof code !== "string" || typeof summary !== "string") continue;
    runs.push({
      at,
      file,
      lang,
      code,
      ms: typeof ms === "number" && Number.isFinite(ms) ? ms : null,
      ok: ok === true,
      summary,
    });
    if (runs.length === LIMIT) break;
  }
  return runs;
}

const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cached: RunRecord[] = [];

export function recordRun(run: RunRecord) {
  const runs = [run, ...sanitizeRuns(store.get<unknown>(KEY, []))].slice(0, LIMIT);
  store.set(KEY, runs);
  listeners.forEach((l) => l());
}

export function clearRuns() {
  store.set(KEY, []);
  listeners.forEach((l) => l());
}

export function subscribeRuns(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function runsSnapshot(): RunRecord[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {}
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cached = sanitizeRuns(store.get<unknown>(KEY, []));
  }
  return cached;
}

const EMPTY: RunRecord[] = [];

export function serverRunsSnapshot(): RunRecord[] {
  return EMPTY;
}
