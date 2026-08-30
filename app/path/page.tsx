import type { Metadata } from "next";
import PathClient, { type ExerciseLink } from "@/app/path/PathClient";
import { chapterMetas, chapter as findChapter, exercises, levels as levelsFor, topics } from "@/lib/content";
import { byChapterId } from "@/lib/levelRows";
import type { ChapterMeta } from "@/content/types";

export const metadata: Metadata = {
  title: "Your reading path — notes",
  description: "The order to read a topic in, with progress you can tick off.",
};

export default function PathPage() {
  // The page picks its topic from the query string on the client, so every
  // topic's metadata is prepared here — metadata only, never bodies.
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
