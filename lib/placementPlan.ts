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

export interface PlannedChapter {
  id: string;
  level: LevelId;
  ready: boolean;
}

export interface PlanSplit<T> {
  allotted: T[];
  testedOut: T[];
  reviseEarlier: T[];
}

export function splitPlan<T extends PlannedChapter>(record: PlacementRecord, chapters: readonly T[]): PlanSplit<T> {
  const tested = new Set(record.testedOut);
  const named = new Set(record.allotted);
  const reached = levelRank(record.level);
  const view: PlanSplit<T> = { allotted: [], testedOut: [], reviseEarlier: [] };
  for (const chapter of chapters) {
    if (!chapter.ready) continue;
    if (tested.has(chapter.id)) view.testedOut.push(chapter);
    else if (named.has(chapter.id) || levelRank(chapter.level) >= reached) view.allotted.push(chapter);
    else view.reviseEarlier.push(chapter);
  }
  return view;
}

export function planView(record: PlacementRecord, chapters: readonly PlanChapter[]): PlanView {
  return { mode: record.mode, level: record.level, ...splitPlan(record, chapters) };
}

export function readingPlan(record: PlacementRecord | null, chapters: readonly PlannedChapter[]): ReadingPlan | null {
  if (!record) return null;
  const view = splitPlan(record, chapters);
  return {
    testedOut: view.testedOut.map((chapter) => chapter.id),
    allotted: view.allotted.map((chapter) => chapter.id),
  };
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
