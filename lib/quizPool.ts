import type { ChapterPool } from "@/content/quiz-types";

const pools = new Map<string, () => Promise<{ pool: ChapterPool }>>([
  ["dsa-binary-search", () => import("@/content/dsa/quiz/dsa-binary-search")],
]);

export function poolChapterIds(): string[] {
  return [...pools.keys()];
}

export async function loadPool(chapterId: string): Promise<ChapterPool | null> {
  const load = pools.get(chapterId);
  return load ? (await load()).pool : null;
}
