"use client";

import { useSyncExternalStore } from "react";
import { store } from "@/lib/storage";

export type Confidence = "knew" | "shaky" | "blank";

const KEY = "groundwork:interview:confidence";
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cached: Record<string, Confidence> = {};
const EMPTY: Record<string, Confidence> = {};

function read(): Record<string, Confidence> {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    raw = null;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cached = store.get<Record<string, Confidence>>(KEY, {});
  }
  return cached;
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) fn();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

export const confidence = {
  all: read,
  set(id: string, value: Confidence | null) {
    const next = { ...read() };
    if (value) next[id] = value;
    else delete next[id];
    store.set(KEY, next);
    listeners.forEach((fn) => fn());
  },
  clear(ids: string[]) {
    const next = { ...read() };
    ids.forEach((id) => delete next[id]);
    store.set(KEY, next);
    listeners.forEach((fn) => fn());
  },
};

export function useConfidence(): Record<string, Confidence> {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  knew: "Knew it",
  shaky: "Shaky",
  blank: "Blank",
};
