import { jsNotes } from "@/content/notes";
import { reactNotes } from "@/content/react-notes";
import { nodeNotes } from "@/content/node-notes";
import { typescriptNotes } from "@/content/typescript-notes";
import { nextjsNotes } from "@/content/nextjs-notes";
import { htmlNotes } from "@/content/html-notes";
import { cssNotes } from "@/content/css-notes";
import { nestjsNotes } from "@/content/nestjs-notes";
import { dockerNotes } from "@/content/docker-notes";
import { databasesNotes } from "@/content/databases-notes";
import { systemDesignNotes } from "@/content/system-design-notes";
import { testingNotes } from "@/content/testing-notes";
import { securityNotes } from "@/content/security-notes";
import { cloudDevopsNotes } from "@/content/cloud-devops-notes";
import { graphqlNotes } from "@/content/graphql-notes";
import { redisNotes } from "@/content/redis-notes";
import { kubernetesNotes } from "@/content/kubernetes-notes";
import { dsaNotes } from "@/content/dsa-notes";
import { architectureNotes } from "@/content/architecture-notes";
import { interviewNotes } from "@/lib/interviewContent";
import { practice as practiceData } from "@/content/practice";
import type { Chapter, ChapterMeta, Exercise, LevelId, NotesFile, Topic } from "@/content/types";

const NOTES_BY_TOPIC: Record<string, NotesFile> = {
  js: jsNotes,
  react: reactNotes,
  node: nodeNotes,
  typescript: typescriptNotes,
  nextjs: nextjsNotes,
  html: htmlNotes,
  css: cssNotes,
  nestjs: nestjsNotes,
  docker: dockerNotes,
  databases: databasesNotes,
  "system-design": systemDesignNotes,
  testing: testingNotes,
  security: securityNotes,
  "cloud-devops": cloudDevopsNotes,
  graphql: graphqlNotes,
  redis: redisNotes,
  kubernetes: kubernetesNotes,
  dsa: dsaNotes,
  architecture: architectureNotes,
  interview: interviewNotes,
};

const EMPTY_NOTES: NotesFile = {
  meta: { title: "", subtitle: "", lead: "", author: "", updated: "" },
  hero: { figure: "" },
  chapters: [],
};

function byId<T extends { id: string }>(list: T[], id: string | null | undefined): T | null {
  if (!id) return null;
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) return list[i];
  }
  return null;
}

export {
  topics,
  topic,
  levels,
  level,
  curriculumNotes,
  syllabusSectionForChapter,
  notesHref,
  chapterHref,
  topicHref,
} from "@/lib/topics";
export { escapeHtml, plural } from "@/lib/format";

export function notesData(topicId?: string | null): NotesFile {
  if (!topicId) return jsNotes;
  return NOTES_BY_TOPIC[topicId] || EMPTY_NOTES;
}

export function hasNotes(topicId?: string | null): boolean {
  return Boolean(topicId && NOTES_BY_TOPIC[topicId]);
}

export function chapters(topicId?: string | null): Chapter[] {
  const data = notesData(topicId);
  return (data && data.chapters) || [];
}

export function chapterMetas(topicId?: string | null): ChapterMeta[] {
  return chapters(topicId).map(({ body, ...meta }) => ({ ...meta, readMinutes: minutesFor(body) }));
}

export function exercises(): Exercise[] {
  return practiceData || [];
}

export function chapter(id: string, topicId?: string | null): Chapter | null {
  return byId(chapters(topicId), id);
}

export function exercise(id: string): Exercise | null {
  return byId(exercises(), id);
}

export function chaptersForLevel(level: LevelId, topicId?: string | null): Chapter[] {
  return chapters(topicId).filter((ch) => (ch.levels || []).indexOf(level) !== -1);
}

export function exercisesForChapter(chapterId: string, topicId?: string | null): Exercise[] {
  const ch = byId(chapters(topicId), chapterId);
  const ids = (ch && ch.practice) || [];
  return ids.map((id) => byId(exercises(), id)).filter((e): e is Exercise => Boolean(e));
}

export function exercisesForLevel(level: LevelId, topicId?: string | null): Exercise[] {
  // Counted by the level of the chapter an exercise belongs to, not by its difficulty tag,
  // so a level's figure matches the "Practice this layer" links inside its chapters.
  const levelChapterIds = chaptersForLevel(level, topicId).map((ch) => ch.id);
  return exercises().filter((ex) => levelChapterIds.indexOf(ex.chapter) !== -1);
}

function minutesFor(body: string): number {
  const words = String(body || "")
    .replace(/<[^>]*>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(2, Math.round(words / 180));
}

export function htmlMinutes(html: string): number {
  return minutesFor(html);
}

export function readTime(chapter: Chapter): number {
  return minutesFor(chapter.body);
}

export function totalTime(chapterList: Chapter[]): number {
  return chapterList.reduce((sum, ch) => sum + readTime(ch), 0);
}

export function topicExerciseCount(t: Topic): number {
  const ownChapterIds = chapters(t.id).map((ch) => ch.id);
  return exercises().filter((ex) => ownChapterIds.indexOf(ex.chapter) !== -1).length;
}
