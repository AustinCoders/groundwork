import type { Metadata } from "next";
import PathClient, { type ExerciseLink } from "@/app/path/PathClient";
import { chapterMetas, chapter as findChapter, exercises, levels as levelsFor, topics } from "@/lib/content";
import { byChapterId } from "@/lib/levelRows";
import { pageMetadata } from "@/lib/metadata";
import type { ChapterMeta } from "@/content/types";

// The path itself comes from ?topic= and ?level= on the client, so there is one
// page here and nothing for a search result to land on usefully.
export const metadata: Metadata = pageMetadata({
  title: "Your reading path",
  description:
    "The order to read a topic in, at your level, with the practice for each chapter and progress you can tick off.",
  path: "/path",
  index: false,
});

export default function PathPage() {
  const chapterById: Record<string, ChapterMeta> = {};
  const chapterExercises: Record<string, ExerciseLink[]> = {};
  const levelExercises: Record<string, ExerciseLink[]> = {};

  topics().forEach((t) => {
    if (!t.levels) return;
    const metas = chapterMetas(t.id);
    Object.assign(chapterById, byChapterId(metas));
    metas.forEach((ch) => {
      chapterExercises[ch.id] = ch.practice
        .map((id) => exercises().find((ex) => ex.id === id))
        .filter((ex): ex is NonNullable<typeof ex> => Boolean(ex))
        .map((ex) => ({
          id: ex.id,
          title: ex.title,
          testCount: ex.tests.length,
          level: ex.level,
          chapterShort: ch.short,
        }));
    });

    const ownIds = new Set(metas.map((ch) => ch.id));
    levelsFor(t.id).forEach((level) => {
      levelExercises[`${t.id}:${level.id}`] = exercises()
        .filter((ex) => ex.level === level.id && ownIds.has(ex.chapter))
        .map((ex) => ({
          id: ex.id,
          title: ex.title,
          testCount: ex.tests.length,
          level: ex.level,
          chapterShort: findChapter(ex.chapter, t.id)?.short ?? null,
        }));
    });
  });

  return <PathClient chapterById={chapterById} chapterExercises={chapterExercises} levelExercises={levelExercises} />;
}
