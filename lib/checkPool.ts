import type { CheckQuestion } from "@/content/quiz-types";
import { designPoolChapterIds, loadDesignPool } from "@/lib/designPool";
import { loadPool, poolChapterIds } from "@/lib/quizPool";

export function checkChapterIds(): string[] {
  return [...poolChapterIds(), ...designPoolChapterIds()];
}

export async function loadCheckQuestions(chapterId: string): Promise<CheckQuestion[] | null> {
  const dsa = await loadPool(chapterId);
  if (dsa) return dsa.questions;
  const design = await loadDesignPool(chapterId);
  return design ? design.questions : null;
}
