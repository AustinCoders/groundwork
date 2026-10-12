"use client";

import { computeStats, type Stats } from "@/lib/gamification";
import { useProgressValue } from "@/lib/hooks";
import { progress } from "@/lib/storage";

export type MenuStats = Stats & { due: number };

export function useMenuStats(): MenuStats | null {
  const key = useProgressValue(() => {
    const due = progress.dueForReview(Object.keys(progress.all().chapters)).length;
    return JSON.stringify({ ...computeStats(), due });
  }, "");
  return key ? (JSON.parse(key) as MenuStats) : null;
}
