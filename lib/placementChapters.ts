import { chapterMetas, levels } from "@/lib/content";
import type { LevelId } from "@/content/types";
import type { PlanData } from "@/lib/placementPlan";

const LEVEL_IDS: LevelId[] = ["beginner", "intermediate", "advanced"];

export function placementData(topicId: string): PlanData {
  const names = Object.fromEntries(LEVEL_IDS.map((id) => [id, id])) as Record<LevelId, string>;
  for (const level of levels(topicId)) names[level.id] = level.name;
  return {
    topicId,
    levelNames: names,
    chapters: chapterMetas(topicId).map((chapter) => ({
      id: chapter.id,
      num: chapter.num,
      short: chapter.short || chapter.title,
      level: chapter.levels[0] ?? "beginner",
      prerequisites: chapter.prerequisites ?? [],
      minutes: chapter.readMinutes,
      ready: chapter.ready,
    })),
  };
}
