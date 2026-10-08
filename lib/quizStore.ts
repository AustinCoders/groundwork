"use client";

import { useSyncExternalStore } from "react";
import { store } from "@/lib/storage";
import {
  applyAttempt,
  applyMarkedAnyway,
  applyPass,
  applyUnmark,
  sanitizeRecord,
  type QuizRecord,
} from "@/lib/quizRecord";

export type QuizRecords = Record<string, QuizRecord>;

export const QUIZ_KEY = "groundwork:quiz";
const VERSION = 1;
const EMPTY: QuizRecords = Object.freeze({}) as QuizRecords;
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cached: QuizRecords = EMPTY;
let unsaved: QuizRecords | null = null;

function parse(): QuizRecords {
  const saved = store.get<{ v?: number; chapters?: unknown } | null>(QUIZ_KEY, null);
  if (!saved || saved.v !== VERSION || saved.chapters === null || typeof saved.chapters !== "object") return EMPTY;
  const records: QuizRecords = {};
  for (const [id, value] of Object.entries(saved.chapters as Record<string, unknown>)) {
    const record = sanitizeRecord(value);
    if (record) records[id] = record;
  }
  return Object.keys(records).length > 0 ? records : EMPTY;
}

function read(): QuizRecords {
  if (unsaved) return unsaved;
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(QUIZ_KEY);
  } catch {
    raw = null;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cached = parse();
  }
  return cached;
}

export function subscribeQuiz(fn: () => void): () => void {
  listeners.add(fn);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== null && e.key !== QUIZ_KEY) return;
    unsaved = null;
    fn();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

function commit(next: QuizRecords) {
  unsaved = store.set(QUIZ_KEY, { v: VERSION, chapters: next }) ? null : next;
  listeners.forEach((fn) => fn());
}

function change(chapterId: string, update: (record: QuizRecord | undefined) => QuizRecord | undefined) {
  const all = read();
  const next = { ...all };
  const record = update(all[chapterId]);
  if (record) next[chapterId] = record;
  else delete next[chapterId];
  commit(next);
}

export const quizStore = {
  all: read,
  get(chapterId: string): QuizRecord | undefined {
    return read()[chapterId];
  },
  recordAttempt(chapterId: string, result: { score: number; missed: string[]; passed: boolean }) {
    const at = Date.now();
    change(chapterId, (record) => {
      const attempted = applyAttempt(record, { score: result.score, missed: result.missed, at });
      return result.passed ? applyPass(attempted, at) : attempted;
    });
  },
  recordMarkedAnyway(chapterId: string) {
    change(chapterId, (record) => applyMarkedAnyway(record));
  },
  clear() {
    store.remove(QUIZ_KEY);
    unsaved = null;
    listeners.forEach((fn) => fn());
  },
  unmark(chapterId: string) {
    if (!read()[chapterId]) return;
    change(chapterId, (record) => applyUnmark(record));
  },
};

export function useQuizRecord(chapterId: string): QuizRecord | undefined {
  return useSyncExternalStore(
    subscribeQuiz,
    () => read()[chapterId],
    () => undefined
  );
}
