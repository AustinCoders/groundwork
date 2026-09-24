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

/** Warm the cache for the stages a loop would run, while the reader is still
 *  choosing — so pressing Start does not wait on the network. */
export function usePrefetchStages(stages: readonly StageId[]): void {
  const key = stages.join(",");
  useEffect(() => {
    if (!key) return;
    for (const s of key.split(",") as StageId[]) fetchStage(s).catch(() => {});
  }, [key]);
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
