"use client";

import { useMounted, useProgressValue } from "@/lib/hooks";
import { isFirstTime } from "@/lib/placementPlan";
import { usePlacement } from "@/lib/placementStore";
import type { PlacementRecord } from "@/lib/placementRecord";
import { progress } from "@/lib/storage";

export interface PlacementStatus {
  mounted: boolean;
  placement: PlacementRecord | null;
  marks: boolean;
  firstTime: boolean;
}

export function usePlacementState(chapterIds: readonly string[]): PlacementStatus {
  const mounted = useMounted();
  const placement = usePlacement();
  const marks = useProgressValue(() => chapterIds.some((id) => progress.isChapterDone(id)), false);
  return { mounted, placement, marks, firstTime: mounted && isFirstTime(placement, marks) };
}
