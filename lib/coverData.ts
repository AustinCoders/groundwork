import { chapterMetas, levels } from "@/lib/content";
import type { CoverCard } from "@/components/topic/useCoverProgress";
import type { SeriesPart } from "@/components/chapter/types";
import type { LevelId } from "@/content/types";

export function coverCards(topicId: string): CoverCard[] {
  return chapterMetas(topicId).map((c) => ({
    id: c.id,
    num: c.num,
    title: c.title,
    short: c.short,
    subtitle: c.subtitle,
    levels: c.levels.length ? c.levels : (["beginner"] as LevelId[]),
    minutes: c.readMinutes,
    ready: c.ready,
    exercises: c.practice.length,
  }));
}

export function coverParts(topicId: string): SeriesPart<LevelId>[] {
  return levels(topicId).map((l) => ({ level: l.id, title: l.name, blurb: l.blurb }));
}
