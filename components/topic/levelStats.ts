import type { Level } from "@/content/types";

export interface LevelStat {
  chapters: number;
  minutes: number;
  exercises: number;
}

export const NO_STAT: LevelStat = { chapters: 0, minutes: 0, exercises: 0 };

export function levelTotals(levels: Level[], perLevel: Record<string, LevelStat>): LevelStat {
  return levels.reduce(
    (sum, level) => {
      const stat = perLevel[level.id] ?? NO_STAT;
      return {
        chapters: sum.chapters + stat.chapters,
        minutes: sum.minutes + stat.minutes,
        exercises: sum.exercises + stat.exercises,
      };
    },
    { ...NO_STAT }
  );
}
