"use client";

import { useSyncExternalStore } from "react";
import { store } from "@/lib/storage";

const KEY = "groundwork:company-questions:practised";
const MAX_ENTRIES = 500;
const EMPTY: Record<string, true> = {};
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cached: Record<string, true> = EMPTY;

export function sanitizePractised(value: unknown): Record<string, true> {
  const out: Record<string, true> = {};
  if (value === null || typeof value !== "object" || Array.isArray(value)) return out;
  for (const [id, flag] of Object.entries(value).slice(0, MAX_ENTRIES)) {
    if (id !== "__proto__" && flag === true) out[id] = true;
  }
  return out;
}

function read(): Record<string, true> {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    raw = null;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cached = sanitizePractised(store.get<unknown>(KEY, null));
  }
  return cached;
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) fn();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

export const practised = {
  set(id: string, done: boolean) {
    const next = { ...read() };
    if (done) next[id] = true;
    else delete next[id];
    store.set(KEY, next);
    listeners.forEach((fn) => fn());
  },
};

export function usePractised(): Record<string, true> {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}
