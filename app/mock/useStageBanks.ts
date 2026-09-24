"use client";

import { useEffect, useState } from "react";
import type { MockItem, StageId } from "@/lib/mock/types";

const cache = new Map<StageId, Promise<MockItem[]>>();

/** One stage's questions, from the static JSON the build wrote for it. Cached
 *  for the life of the page, so planning a second loop costs nothing. */
export function fetchStage(stage: StageId): Promise<MockItem[]> {
  let p = cache.get(stage);
  if (!p) {
    p = fetch(`/mock/bank/${stage}`).then((res) => {
      if (!res.ok) throw new Error(`Could not load the ${stage} questions (HTTP ${res.status}).`);
      return res.json() as Promise<MockItem[]>;
    });
    // A failed fetch should be retried next time, not remembered.
    p.catch(() => cache.delete(stage));
    cache.set(stage, p);
  }
  return p;
}

export async function fetchStages(stages: readonly StageId[]): Promise<Partial<Record<StageId, MockItem[]>>> {
  const unique = [...new Set(stages)];
  const lists = await Promise.all(unique.map(fetchStage));
  return Object.fromEntries(unique.map((s, i) => [s, lists[i]]));
}

/** Run something when the browser has nothing better to do. */
export function whenIdle(fn: () => void): void {
  if (typeof window === "undefined") return;
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
  if (w.requestIdleCallback) w.requestIdleCallback(fn, { timeout: 2000 });
  else window.setTimeout(fn, 300);
}

/**
 * Warm the cache for a loop's stages. Called when the reader shows they mean
 * to start — hovering or focusing Start — rather than when the lobby opens:
 * fetching every stage up front cost 460 KB for someone only looking.
 */
export function prefetchStages(stages: readonly StageId[]): void {
  for (const s of new Set(stages)) fetchStage(s).catch(() => {});
}

/** Tick once a second while `running`, for clocks that have to re-render. */
export function useNow(running: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [running]);
  return now;
}
