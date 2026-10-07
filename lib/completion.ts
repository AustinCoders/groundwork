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
  done = false
): string | null {
  if (!requiresCheck(completion) || done) return null;
  return here ? "#check" : `${basePath}/${chapterId}#check`;
}

export function nextChapter<T extends { id: string }>(
  completion: Completion | undefined,
  chapters: T[],
  done: Set<string>
): T | null {
  return chapters.find((chapter) => !done.has(chapter.id)) ?? null;
}
