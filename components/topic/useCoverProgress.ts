"use client";

import { useMemo } from "react";
import { useReadingPlan, type Station } from "@/components/topic/useReadingPlan";
import { countStates } from "@/lib/chapterState";
import { requiresCheck, type Completion } from "@/lib/completion";
import { quizStore } from "@/lib/quizStore";
import { progress } from "@/lib/storage";
import { useChapterStates } from "@/lib/useChapterStates";
import type { SeriesCard } from "@/components/chapter/types";
import type { LevelId } from "@/content/types";

export interface CoverCard extends SeriesCard<LevelId> {
  ready: boolean;
  exercises: number;
}

export function useCoverProgress({
  topicId,
  basePath,
  cards,
  completion,
  checkChapterIds,
}: {
  topicId: string;
  basePath: string;
  cards: CoverCard[];
  completion?: Completion;
  checkChapterIds?: string[];
}) {
  const stations: Station[] = useMemo(
    () =>
      cards.map((c) => ({
        id: c.id,
        num: c.num,
        short: c.short || c.title,
        subtitle: c.subtitle,
        minutes: c.minutes,
        exercises: c.exercises,
        ready: c.ready,
      })),
    [cards]
  );

  const plan = useReadingPlan(stations, topicId, completion);
  const states = useChapterStates(completion, plan.readable, checkChapterIds, plan.done);
  const stateTotals = countStates(
    plan.readable.map((s) => s.id),
    states
  );

  const toggleRead = (id: string) => {
    const read = plan.done.has(id);
    if (read && requiresCheck(completion)) quizStore.unmark(id);
    progress.setChapterDone(id, !read);
  };

  return {
    plan,
    states,
    stateTotals,
    nextState: plan.next ? states.get(plan.next.id) : undefined,
    written: cards.filter((c) => c.ready).length,
    firstReadyId: cards.find((c) => c.ready)?.id,
    totalExercises: cards.reduce((sum, c) => sum + c.exercises, 0),
    totalMinutes: cards.reduce((sum, c) => sum + c.minutes, 0),
    dueCount: plan.mounted ? progress.dueForReview(plan.readable.map((s) => s.id)).length : 0,
    toggleRead,
    continueHref: plan.next ? `${basePath}/${plan.next.id}` : "/review",
    continueLabel: plan.next ? (plan.readCount === 0 ? "Start" : "Continue") : "Review",
  };
}

export type CoverProgress = ReturnType<typeof useCoverProgress>;
