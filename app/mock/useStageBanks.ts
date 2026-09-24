"use client";

import { useEffect, useState } from "react";
import type { MockItem, StageId } from "@/lib/mock/types";

const cache = new Map<StageId, Promise<MockItem[]>>();

export function fetchStage(stage: StageId): Promise<MockItem[]> {
  let p = cache.get(stage);
  if (!p) {
    p = fetch(`/mock/bank/${stage}`).then((res) => {
      if (!res.ok) throw new Error(`Could not load the ${stage} questions (HTTP ${res.status}).`);
      return res.json() as Promise<MockItem[]>;
    });
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

export function whenIdle(fn: () => void): void {
  if (typeof window === "undefined") return;
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
  if (w.requestIdleCallback) w.requestIdleCallback(fn, { timeout: 2000 });
  else window.setTimeout(fn, 300);
}

export function prefetchStages(stages: readonly StageId[]): void {
  for (const s of new Set(stages)) fetchStage(s).catch(() => {});
}

export function useNow(running: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [running]);
  return now;
}
