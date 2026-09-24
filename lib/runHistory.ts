import type { LanguageKey } from "@/lib/codeLanguages";
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
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cached: RunRecord[] = [];

export function recordRun(run: RunRecord) {
  const runs = [run, ...store.get<RunRecord[]>(KEY, [])].slice(0, LIMIT);
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
    cached = store.get<RunRecord[]>(KEY, []);
  }
  return cached;
}

const EMPTY: RunRecord[] = [];

export function serverRunsSnapshot(): RunRecord[] {
  return EMPTY;
}
