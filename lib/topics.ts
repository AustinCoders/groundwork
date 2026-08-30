import { topics as topicsData } from "@/content/topics";
import type { Level, Topic } from "@/content/types";

/**
 * Topic and syllabus lookups. This module deliberately imports only
 * content/topics.ts — never the per-topic notes files — so client
 * components can use it without dragging every chapter body into the
 * browser bundle. Anything needing chapter bodies belongs in lib/content.
 */

function byId<T extends { id: string }>(list: T[], id: string | null | undefined): T | null {
  if (!id) return null;
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) return list[i];
  }
  return null;
}

export function topics(): Topic[] {
  return topicsData.topics || [];
}

export function topic(id: string): Topic | null {
  return byId(topics(), id);
}

export function levels(topicId?: string | null): Level[] {
  const t = topicId && byId(topics(), topicId);
  if (t && t.levels) return t.levels;
  return topicsData.levels || [];
}

export function level(id: string, topicId?: string | null): Level | null {
  return byId(levels(topicId), id);
}

export function curriculumNotes(topicId?: string | null): string[] {
  const t = topicId && byId(topics(), topicId);
  if (t && t.curriculumNotes) return t.curriculumNotes;
  return topicsData.curriculumNotes || [];
}

export function syllabusSectionForChapter(
  chapterId: string,
  topicId?: string | null
): { level: Level; section: Level["syllabus"][number] } | null {
  let found: { level: Level; section: Level["syllabus"][number] } | null = null;
  levels(topicId).some((lvl) => {
    const section = (lvl.syllabus || []).find((s) => s.chapter === chapterId);
    if (section) {
      found = { level: lvl, section };
      return true;
    }
    return false;
  });
  return found;
}

/**
 * Route to a topic's reader page. Topics store their notes as a legacy
 * "<name>.html" filename; the app routes are the same name without it.
 */
export function notesHref(topicId?: string | null): string {
  const t = topicId ? byId(topics(), topicId) : null;
  const file = (t && t.notes) || "notes.html";
  return `/${file.replace(/\.html$/, "")}`;
}

/** Canonical URL for one chapter, e.g. /dsa/dsa-tries. */
export function chapterHref(topicId: string | null | undefined, chapterId: string): string {
  return `${notesHref(topicId)}/${chapterId}`;
}

export function topicHref(t: Topic, savedLevel?: string | null): string {
  if (t.status !== "ready") return `/soon?topic=${t.id}`;
  if (!t.levels) return notesHref(t.id);

  const known = savedLevel && byId(levels(t.id), savedLevel);
  return known ? `/path?topic=${t.id}&level=${savedLevel}` : `/level?topic=${t.id}`;
}
