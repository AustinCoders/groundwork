import { redirect } from "next/navigation";
import { LevelView, type LevelStat } from "@/app/level/LevelView";
import {
  chapterMetas,
  chaptersForLevel,
  curriculumNotes,
  exercisesForLevel,
  levels as levelsFor,
  notesHref,
  topic as findTopic,
  totalTime,
} from "@/lib/content";
import { byChapterId } from "@/lib/levelRows";

export default async function LevelPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const { topic: topicParam } = await searchParams;
  const topic = findTopic(topicParam || "js");

  if (!topic) redirect("/");
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
