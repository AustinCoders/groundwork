import type { LevelId } from "@/content/types";
import {
  levelRank,
  STAGE_ORDER,
  type PlacementChapter,
  type PlacementResult,
  type StageId,
  type StageScore,
} from "@/lib/placement";

export type PlacementMode = "quiz" | "beginning" | "self";

export interface PlacementRecord {
  mode: PlacementMode;
  level: LevelId;
  stages: StageScore[];
  testedOut: string[];
  allotted: string[];
  takenAt: number;
  seconds: number;
}

const MODES: PlacementMode[] = ["quiz", "beginning", "self"];
const LEVELS: LevelId[] = ["beginner", "intermediate", "advanced"];

const count = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;

const strings = (value: unknown): string[] =>
  Array.isArray(value) ? [...new Set(value.filter((entry): entry is string => typeof entry === "string"))] : [];

const validTime = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && value > 0;

const floored = (value: number): number => Math.max(1, Math.floor(value));

const stamp = (value: number): number => (validTime(value) ? floored(value) : Date.now());

function firstOfEachStage(scores: StageScore[]): StageScore[] {
  const seen = new Set<StageId>();
  return scores.filter((score) => {
    if (seen.has(score.id)) return false;
    seen.add(score.id);
    return true;
  });
}

function stageScore(value: unknown): StageScore | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return null;
  const loose = value as Record<string, unknown>;
  if (!STAGE_ORDER.includes(loose.id as StageId)) return null;
  const asked = count(loose.asked);
  return { id: loose.id as StageId, correct: Math.min(count(loose.correct), asked), asked };
}

export function sanitizePlacement(value: unknown): PlacementRecord | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return null;
  const loose = value as Record<string, unknown>;
  if (!MODES.includes(loose.mode as PlacementMode) || !LEVELS.includes(loose.level as LevelId)) return null;
  if (!validTime(loose.takenAt)) return null;
  const testedOut = strings(loose.testedOut);
  const tested = new Set(testedOut);
  return {
    mode: loose.mode as PlacementMode,
    level: loose.level as LevelId,
    stages: Array.isArray(loose.stages)
      ? firstOfEachStage(loose.stages.map(stageScore).filter((score): score is StageScore => score !== null))
      : [],
    testedOut,
    allotted: strings(loose.allotted).filter((id) => !tested.has(id)),
    takenAt: floored(loose.takenAt),
    seconds: count(loose.seconds),
  };
}

export function placementFromResult(result: PlacementResult, takenAt: number, seconds: number): PlacementRecord {
  return {
    mode: "quiz",
    level: result.level,
    stages: result.stages.map((score) => ({ ...score })),
    testedOut: [...result.testedOut],
    allotted: [...result.allotted],
    takenAt: stamp(takenAt),
    seconds: count(seconds),
  };
}

export function beginningPlacement(chapters: readonly PlacementChapter[], takenAt: number): PlacementRecord {
  return {
    mode: "beginning",
    level: "beginner",
    stages: [],
    testedOut: [],
    allotted: chapters.map((chapter) => chapter.id),
    takenAt: stamp(takenAt),
    seconds: 0,
  };
}

export function selfPlacement(level: LevelId, chapters: readonly PlacementChapter[], takenAt: number): PlacementRecord {
  return {
    mode: "self",
    level,
    stages: [],
    testedOut: [],
    allotted: chapters.filter((chapter) => levelRank(chapter.level) >= levelRank(level)).map((chapter) => chapter.id),
    takenAt: stamp(takenAt),
    seconds: 0,
  };
}
