import type { ChapterPool, Question } from "@/content/quiz-types";

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

let placementBank: Promise<Question[]> | null = null;

async function gatherPlacementBank(): Promise<{ questions: Question[]; complete: boolean }> {
  const settled = await Promise.allSettled(poolChapterIds().map((id) => loadPool(id)));
  return {
    questions: settled.flatMap((entry) =>
      entry.status === "fulfilled" && entry.value
        ? entry.value.questions.filter((question) => question.placement === true)
        : []
    ),
    complete: settled.every((entry) => entry.status === "fulfilled"),
  };
}

export function loadPlacementBank(): Promise<Question[]> {
  if (placementBank === null) {
    const gathering = gatherPlacementBank();
    const bank = gathering.then((gathered) => gathered.questions);
    placementBank = bank;
    void gathering.then((gathered) => {
      if (!gathered.complete && placementBank === bank) placementBank = null;
    });
  }
  return placementBank;
}
