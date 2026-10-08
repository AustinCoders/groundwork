"use client";

import { useSyncExternalStore } from "react";
import { store } from "@/lib/storage";
import { sanitizePlacement, type PlacementRecord } from "@/lib/placementRecord";

export const PLACEMENT_KEY = "groundwork:dsa:placement";
const VERSION = 1;
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cached: PlacementRecord | null = null;
let unsaved: PlacementRecord | null = null;

function parse(): PlacementRecord | null {
  const saved = store.get<{ v?: number; record?: unknown } | null>(PLACEMENT_KEY, null);
  if (!saved || saved.v !== VERSION) return null;
  return sanitizePlacement(saved.record);
}

export function readPlacement(): PlacementRecord | null {
  if (unsaved) return unsaved;
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(PLACEMENT_KEY);
  } catch {
    raw = null;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cached = parse();
  }
  return cached;
}

export function subscribePlacement(fn: () => void): () => void {
  listeners.add(fn);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== null && e.key !== PLACEMENT_KEY) return;
    unsaved = null;
    fn();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

export function savePlacement(record: PlacementRecord) {
  unsaved = store.set(PLACEMENT_KEY, { v: VERSION, record }) ? null : record;
  listeners.forEach((fn) => fn());
}

export function clearPlacement() {
  store.remove(PLACEMENT_KEY);
  unsaved = null;
  listeners.forEach((fn) => fn());
}

export function usePlacement(): PlacementRecord | null {
  return useSyncExternalStore(subscribePlacement, readPlacement, () => null);
}
