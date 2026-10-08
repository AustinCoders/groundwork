"use client";

import { useSyncExternalStore } from "react";
import { store } from "@/lib/storage";

export type CodeLanguage = "javascript" | "python" | "java" | "cpp";

export const CODE_LANGUAGES: { id: CodeLanguage; label: string }[] = [
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" },
];

export const DEFAULT_CODE_LANGUAGE: CodeLanguage = "javascript";

const KEY = "groundwork:dsa:lang";
const VERSION = 1;
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cached: CodeLanguage = DEFAULT_CODE_LANGUAGE;
let unsaved: CodeLanguage | null = null;

function isCodeLanguage(value: unknown): value is CodeLanguage {
  return CODE_LANGUAGES.some((language) => language.id === value);
}

function read(): CodeLanguage {
  if (unsaved) return unsaved;
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    raw = null;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    const saved = store.get<{ v?: number; language?: unknown } | null>(KEY, null);
    cached = saved && saved.v === VERSION && isCodeLanguage(saved.language) ? saved.language : DEFAULT_CODE_LANGUAGE;
  }
  return cached;
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    unsaved = null;
    fn();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

function write(language: CodeLanguage) {
  unsaved = store.set(KEY, { v: VERSION, language }) ? null : language;
  listeners.forEach((fn) => fn());
}

export function codeLanguageLabel(language: CodeLanguage): string {
  return CODE_LANGUAGES.find((entry) => entry.id === language)?.label ?? "JavaScript";
}

export function useCodeLanguage(): [CodeLanguage, (language: CodeLanguage) => void] {
  const language = useSyncExternalStore(subscribe, read, () => DEFAULT_CODE_LANGUAGE);
  return [language, write];
}
