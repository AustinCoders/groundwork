import { poolChapterIds } from "@/lib/quizPool";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TopicPath, type ExerciseLink } from "@/components/topic/TopicPath";
import {
  chapterMetas,
  exercises,
  level as findLevel,
  levels as levelsFor,
  notesHref,
  topic as findTopic,
} from "@/lib/content";
import { byChapterId, levelRows } from "@/lib/levelRows";
import { pageMetadata } from "@/lib/metadata";
import { pathTopicIds } from "@/lib/topicIds";

export const dynamicParams = false;

export function generateStaticParams() {
  return pathTopicIds().flatMap((topicId) => levelsFor(topicId).map((lvl) => ({ topic: topicId, level: lvl.id })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string; level: string }>;
}): Promise<Metadata> {
  const { topic: topicId, level: levelId } = await params;
  const topic = findTopic(topicId);
  const level = topic && findLevel(levelId, topic.id);
  if (!topic || !level) return {};
  return pageMetadata({
    title: `${topic.name} — ${level.name} reading path`,
    description: `The order to read ${topic.name} at ${level.name} level, with the practice for each chapter and progress you can tick off.`,
    path: `/path/${topic.id}/${level.id}`,
    index: false,
  });
}

export default async function TopicPathPage({ params }: { params: Promise<{ topic: string; level: string }> }) {
  const { topic: topicId, level: levelId } = await params;
  const topic = findTopic(topicId);
  if (!topic) notFound();
  const level = findLevel(levelId, topic.id);
  if (!level) notFound();

  const metas = chapterMetas(topic.id);
  const chapterById = byChapterId(metas);
  const entries = levelRows(level, chapterById);

  if (topic.id === "js") {
    const cheat = chapterById["cheat"];
    const alreadyIncluded = entries.some((entry) => entry.ready && entry.chapter.id === "cheat");
    if (cheat && cheat.ready && !alreadyIncluded) entries.push({ ready: true, chapter: cheat });
  }

  const chapters = entries.filter((entry) => entry.ready).map((entry) => entry.chapter);
  const ownIds = new Set(chapters.map((ch) => ch.id));

  const chapterExercises: Record<string, ExerciseLink[]> = {};
  chapters.forEach((ch) => {
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

  const levelExerciseList: ExerciseLink[] = exercises()
    .filter((ex) => ex.level === level.id && ownIds.has(ex.chapter))
    .map((ex) => ({
      id: ex.id,
      title: ex.title,
      testCount: ex.tests.length,
      level: ex.level,
      chapterShort: chapterById[ex.chapter]?.short ?? null,
    }));

  return (
    <TopicPath
      topic={topic}
      level={level}
      basePath={notesHref(topic.id)}
      entries={entries}
      chapterExercises={chapterExercises}
      levelExerciseList={levelExerciseList}
      checkChapterIds={poolChapterIds()}
    />
  );
}
