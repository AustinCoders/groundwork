import type { Topic } from "@/content/types";

export type Completion = NonNullable<Topic["completion"]>;

export function requiresCheck(completion: Completion | undefined): boolean {
  return completion === "quiz";
}

export function tickHref(
  completion: Completion | undefined,
  basePath: string,
  chapterId: string,
  here = false,
  done = false,
  hasCheck = true
): string | null {
  if (!requiresCheck(completion) || done || !hasCheck) return null;
  return here ? "#check" : `${basePath}/${chapterId}#check`;
}

export interface ReadingPlan {
  testedOut: readonly string[];
  allotted: readonly string[];
}

export function nextChapter<T extends { id: string }>(
  completion: Completion | undefined,
  chapters: T[],
  done: Set<string>,
  plan: ReadingPlan | null = null
): T | null {
  if (!requiresCheck(completion) || plan === null) return chapters.find((chapter) => !done.has(chapter.id)) ?? null;
  const skipped = new Set(plan.testedOut);
  const allotted = new Set(plan.allotted);
  const open = chapters.filter((chapter) => !done.has(chapter.id) && !skipped.has(chapter.id));
  return open.find((chapter) => allotted.has(chapter.id)) ?? open[0] ?? null;
}
