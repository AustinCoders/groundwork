import { dsaSources } from "./dsa";
import { gitSources } from "./git";
import { jsSources } from "./js";
import { reactSources } from "./react";
import { systemDesignSources } from "./system-design";
import type { ChapterSource, TopicSources } from "./types";

export const SOURCES_BY_TOPIC: Record<string, TopicSources> = {
  js: jsSources,
  react: reactSources,
  dsa: dsaSources,
  "system-design": systemDesignSources,
  git: gitSources,
};

export function chapterSources(topicId: string, chapterId: string): ChapterSource[] {
  return SOURCES_BY_TOPIC[topicId]?.[chapterId] ?? [];
}
