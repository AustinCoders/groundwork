import { topics as topicsData } from "@/content/topics";
import type { Level, Topic } from "@/content/types";

export const INTERVIEW_TOPIC_ID = "interview";

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

export function notesHref(topicId?: string | null): string {
  const t = topicId ? byId(topics(), topicId) : null;
  const file = (t && t.notes) || "notes.html";
  return `/${file.replace(/\.html$/, "")}`;
}

export function chapterHref(topicId: string | null | undefined, chapterId: string): string {
  return `${notesHref(topicId)}/${chapterId}`;
}

export function topicHref(t: Topic, savedLevel?: string | null): string {
  if (t.status !== "ready") return `/soon?topic=${t.id}`;
  if (!t.levels) return notesHref(t.id);

  const known = savedLevel && byId(levels(t.id), savedLevel);
  return known ? `/path?topic=${t.id}&level=${savedLevel}` : `/level/${t.id}`;
}

export function topicOfDay(candidates: Topic[]): Topic | null {
  if (!candidates.length) return null;
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
  return candidates[dayOfYear % candidates.length];
}
