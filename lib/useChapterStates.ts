"use client";

import { useMemo } from "react";
import { buildChapterStates, type ChapterState } from "@/lib/chapterState";
import { requiresCheck, type Completion } from "@/lib/completion";
import { usePlacement } from "@/lib/placementStore";
import { useQuizRecords } from "@/lib/quizStore";

const NONE: ReadonlyMap<string, ChapterState> = new Map();

export function useChapterStates(
  completion: Completion | undefined,
  chapters: readonly { id: string }[],
  checkChapterIds: readonly string[] | undefined,
  done: ReadonlySet<string>
): ReadonlyMap<string, ChapterState> {
  const records = useQuizRecords();
  const placement = usePlacement();
  return useMemo(
    () =>
      requiresCheck(completion)
        ? buildChapterStates({
            chapterIds: chapters.map((chapter) => chapter.id),
            checkChapterIds: checkChapterIds ?? [],
            done,
            records,
            testedOut: placement?.testedOut ?? [],
          })
        : NONE,
    [completion, chapters, checkChapterIds, done, records, placement]
  );
}
