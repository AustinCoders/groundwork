import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { LevelView, type LevelStat } from "@/app/level/LevelView";
import {
  chapterMetas,
  chaptersForLevel,
  curriculumNotes,
  exercisesForLevel,
  levels as levelsFor,
  notesHref,
  topic as findTopic,
  topics,
  totalTime,
} from "@/lib/content";
import { byChapterId } from "@/lib/levelRows";

// One prerendered page per topic, so choosing a level is a CDN hit rather than
// a server render on every visit.
export function generateStaticParams() {
  return topics()
    .filter((t) => t.status === "ready" && t.levels)
    .map((t) => ({ topic: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }): Promise<Metadata> {
  const { topic: topicId } = await params;
  const topic = findTopic(topicId);
  if (!topic) return {};
  return {
    title: `${topic.name} — pick your level`,
    alternates: { canonical: `/level/${topic.id}` },
  };
}

export default async function LevelPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic: topicId } = await params;
  const topic = findTopic(topicId);

  if (!topic) notFound();
  if (topic.status !== "ready") redirect(`/soon?topic=${topic.id}`);

  const levels = levelsFor(topic.id);
  const metas = chapterMetas(topic.id);

  const perLevel: Record<string, LevelStat> = {};
  levels.forEach((level) => {
    const chapters = chaptersForLevel(level.id, topic.id);
    perLevel[level.id] = {
      chapters: chapters.length,
      minutes: totalTime(chapters),
      exercises: exercisesForLevel(level.id, topic.id).length,
    };
  });

  return (
    <LevelView
      topic={topic}
      levels={levels}
      notesHref={notesHref(topic.id)}
      perLevel={perLevel}
      chapterById={byChapterId(metas)}
      curriculumNotes={curriculumNotes(topic.id)}
      progressChapters={metas}
    />
  );
}
