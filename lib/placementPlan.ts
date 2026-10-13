import type { LevelId } from "@/content/types";
import type { ReadingPlan } from "@/lib/completion";
import { levelRank, type PlacementChapter } from "@/lib/placement";
import type { PlacementMode, PlacementRecord } from "@/lib/placementRecord";

export interface PlanChapter extends PlacementChapter {
  num: string;
  short: string;
  minutes: number;
  ready: boolean;
}

export interface PlanData {
  topicId: string;
  chapters: PlanChapter[];
  levelNames: Record<LevelId, string>;
}

export interface PlanView {
  mode: PlacementMode;
  level: LevelId;
  allotted: PlanChapter[];
  testedOut: PlanChapter[];
  reviseEarlier: PlanChapter[];
}

export function planView(record: PlacementRecord, chapters: readonly PlanChapter[]): PlanView {
  const tested = new Set(record.testedOut);
  const named = new Set(record.allotted);
  const reached = levelRank(record.level);
  const view: PlanView = { mode: record.mode, level: record.level, allotted: [], testedOut: [], reviseEarlier: [] };
  for (const chapter of chapters) {
    if (!chapter.ready) continue;
    if (tested.has(chapter.id)) view.testedOut.push(chapter);
    else if (named.has(chapter.id) || levelRank(chapter.level) >= reached) view.allotted.push(chapter);
    else view.reviseEarlier.push(chapter);
  }
  return view;
}

export function readingPlan(record: PlacementRecord | null): ReadingPlan | null {
  return record ? { testedOut: record.testedOut, allotted: record.allotted } : null;
}

export function planSummary(view: PlanView): string {
  const parts = [`${view.allotted.length} to read`];
  if (view.testedOut.length > 0) parts.push(`${view.testedOut.length} tested out`);
  if (view.reviseEarlier.length > 0) parts.push(`${view.reviseEarlier.length} to revise earlier`);
  return parts.join(" · ");
}

export function levelWords(level: LevelId, names: Record<LevelId, string>): string {
  return names[level] ?? level;
}

export function isFirstTime(placement: PlacementRecord | null, marks: boolean): boolean {
  return placement === null && !marks;
}

export function placementPath(topicId: string, retake = false): string {
  return `/${topicId}/placement${retake ? "?retake=1" : ""}`;
}

export const PICK_LEVEL_ID = "pick-level";

export function pickLevelPath(topicId: string): string {
  return `/level/${topicId}#${PICK_LEVEL_ID}`;
}
