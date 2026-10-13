import type { ShellTone } from "@/components/topic/shell/types";
import type { LevelId } from "@/content/types";
import { levelRank } from "@/lib/placement";

const TONES: Record<LevelId, ShellTone> = {
  beginner: "green",
  intermediate: "orange",
  advanced: "purple",
};

export const LEVEL_STOPS = 3;

export function levelTone(level: LevelId): ShellTone {
  return TONES[level];
}

export function levelStop(level: LevelId): number {
  return levelRank(level) + 1;
}
