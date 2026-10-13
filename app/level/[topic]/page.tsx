import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { LevelView } from "@/app/level/LevelView";
import { TopicHome } from "@/components/topic/TopicHome";
import type { LevelStat } from "@/components/topic/LevelPicker";
import {
  chapterMetas,
  chaptersForLevel,
  curriculumNotes,
  exercisesForLevel,
  levels as levelsFor,
  topic as findTopic,
  topics,
  totalTime,
} from "@/lib/content";
import { requiresCheck } from "@/lib/completion";
import { byChapterId } from "@/lib/levelRows";
import { pageMetadata } from "@/lib/metadata";
import { coverCards, coverParts } from "@/lib/coverData";
import { placementData } from "@/lib/placementChapters";
import { poolChapterIds } from "@/lib/quizPool";
import { bookRound } from "@/lib/interviewBook";
import { relatedInterviewRound } from "@/lib/topics";
import { topicCoverMetadata } from "@/components/reader/topicPages";
import { topicStats } from "@/lib/topicStats";

export function generateStaticParams() {
  return topics()
    .filter((t) => t.status === "ready" && t.levels)
    .map((t) => ({ topic: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }): Promise<Metadata> {
  const { topic: topicId } = await params;
  const topic = findTopic(topicId);
  if (!topic) return {};
  if (requiresCheck(topic.completion)) return topicCoverMetadata(topic.id, `/level/${topic.id}`);
  const written = chapterMetas(topic.id).filter((ch) => ch.ready).length;
  return pageMetadata({
    title: `${topic.name} — pick your level`,
    description: `Beginner, intermediate or advanced? Pick where you are with ${topic.name} and get a reading path through the ${written} chapters that matter at that level.`,
    path: `/level/${topic.id}`,
    index: written > 0,
  });
}

export default async function LevelPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic: topicId } = await params;
  const topic = findTopic(topicId);

  if (!topic) notFound();
  if (topicStats()[topic.id]?.written === 0) redirect(`/${topic.id}`);

  const levels = levelsFor(topic.id);
  const metas = chapterMetas(topic.id);

  const perLevel: Record<string, LevelStat> = {};
  levels.forEach((level) => {
    const written = chaptersForLevel(level.id, topic.id).filter((c) => c.ready);
    const writtenIds = new Set(written.map((c) => c.id));
    perLevel[level.id] = {
      chapters: written.length,
      minutes: totalTime(written),
      exercises: exercisesForLevel(level.id, topic.id).filter((ex) => writtenIds.has(ex.chapter)).length,
    };
  });

  if (requiresCheck(topic.completion)) {
    const roundId = relatedInterviewRound(topic.id);
    const round = roundId ? bookRound(roundId) : null;
    return (
      <TopicHome
        topic={topic}
        levels={levels}
        perLevel={perLevel}
        chapterById={byChapterId(metas)}
        curriculumNotes={curriculumNotes(topic.id)}
        parts={coverParts(topic.id)}
        cards={coverCards(topic.id)}
        checkChapterIds={poolChapterIds()}
        placementData={placementData(topic.id)}
        relatedRoundHref={round ? `/interview/${roundId}` : null}
        relatedRoundLabel={round ? `${round.code} · ${round.navTitle}` : null}
      />
    );
  }

  return (
    <LevelView
      topic={topic}
      levels={levels}
      perLevel={perLevel}
      chapterById={byChapterId(metas)}
      curriculumNotes={curriculumNotes(topic.id)}
    />
  );
}
