import type { ChapterPool, Question } from "@/content/quiz-types";

const pools = new Map<string, () => Promise<{ pool: ChapterPool }>>([
  ["dsa-complexity-analysis", () => import("@/content/dsa/quiz/dsa-complexity-analysis")],
  ["dsa-arrays-strings", () => import("@/content/dsa/quiz/dsa-arrays-strings")],
  ["dsa-hashing", () => import("@/content/dsa/quiz/dsa-hashing")],
  ["dsa-two-pointers", () => import("@/content/dsa/quiz/dsa-two-pointers")],
  ["dsa-sliding-window", () => import("@/content/dsa/quiz/dsa-sliding-window")],
  ["dsa-binary-search", () => import("@/content/dsa/quiz/dsa-binary-search")],
  ["dsa-basic-recursion", () => import("@/content/dsa/quiz/dsa-basic-recursion")],
  ["dsa-sorting-algorithms", () => import("@/content/dsa/quiz/dsa-sorting-algorithms")],
  ["dsa-stacks-queues", () => import("@/content/dsa/quiz/dsa-stacks-queues")],
  ["dsa-linked-lists", () => import("@/content/dsa/quiz/dsa-linked-lists")],
  ["dsa-trees", () => import("@/content/dsa/quiz/dsa-trees")],
  ["dsa-tree-problems", () => import("@/content/dsa/quiz/dsa-tree-problems")],
  ["dsa-heaps-priority-queues", () => import("@/content/dsa/quiz/dsa-heaps-priority-queues")],
  ["dsa-graphs-representation-traversal", () => import("@/content/dsa/quiz/dsa-graphs-representation-traversal")],
  ["dsa-graph-problems", () => import("@/content/dsa/quiz/dsa-graph-problems")],
  ["dsa-topological-patterns", () => import("@/content/dsa/quiz/dsa-topological-patterns")],
  ["dsa-backtracking", () => import("@/content/dsa/quiz/dsa-backtracking")],
  ["dsa-dp-1d", () => import("@/content/dsa/quiz/dsa-dp-1d")],
  ["dsa-dp-2d", () => import("@/content/dsa/quiz/dsa-dp-2d")],
  ["dsa-greedy", () => import("@/content/dsa/quiz/dsa-greedy")],
  ["dsa-intervals", () => import("@/content/dsa/quiz/dsa-intervals")],
  ["dsa-bit-manipulation", () => import("@/content/dsa/quiz/dsa-bit-manipulation")],
  ["dsa-matrix-problems", () => import("@/content/dsa/quiz/dsa-matrix-problems")],
  ["dsa-tries", () => import("@/content/dsa/quiz/dsa-tries")],
  ["dsa-monotonic-stack-queue", () => import("@/content/dsa/quiz/dsa-monotonic-stack-queue")],
  ["dsa-advanced-dp", () => import("@/content/dsa/quiz/dsa-advanced-dp")],
  ["dsa-advanced-backtracking", () => import("@/content/dsa/quiz/dsa-advanced-backtracking")],
  ["dsa-union-find", () => import("@/content/dsa/quiz/dsa-union-find")],
  ["dsa-advanced-graph-algorithms", () => import("@/content/dsa/quiz/dsa-advanced-graph-algorithms")],
  ["dsa-minimum-spanning-tree", () => import("@/content/dsa/quiz/dsa-minimum-spanning-tree")],
  ["dsa-segment-fenwick-trees", () => import("@/content/dsa/quiz/dsa-segment-fenwick-trees")],
  ["dsa-string-algorithms", () => import("@/content/dsa/quiz/dsa-string-algorithms")],
  ["dsa-design-problems", () => import("@/content/dsa/quiz/dsa-design-problems")],
  ["dsa-interview-strategy", () => import("@/content/dsa/quiz/dsa-interview-strategy")],
  ["dsa-js-toolkit", () => import("@/content/dsa/quiz/dsa-js-toolkit")],
  ["dsa-prefix-sums", () => import("@/content/dsa/quiz/dsa-prefix-sums")],
  ["dsa-bst-operations", () => import("@/content/dsa/quiz/dsa-bst-operations")],
  ["dsa-grid-bfs", () => import("@/content/dsa/quiz/dsa-grid-bfs")],
  ["dsa-dp-state-machines", () => import("@/content/dsa/quiz/dsa-dp-state-machines")],
  ["dsa-math", () => import("@/content/dsa/quiz/dsa-math")],
  ["dsa-graph-structure", () => import("@/content/dsa/quiz/dsa-graph-structure")],
  ["dsa-sparse-table", () => import("@/content/dsa/quiz/dsa-sparse-table")],
  ["dsa-design-simulation", () => import("@/content/dsa/quiz/dsa-design-simulation")],
  ["dsa-divide-conquer", () => import("@/content/dsa/quiz/dsa-divide-conquer")],
  ["dsa-randomization-sampling", () => import("@/content/dsa/quiz/dsa-randomization-sampling")],
  ["dsa-games-probability-dp", () => import("@/content/dsa/quiz/dsa-games-probability-dp")],
  ["dsa-ordered-structures", () => import("@/content/dsa/quiz/dsa-ordered-structures")],
  ["dsa-sweep-line-geometry", () => import("@/content/dsa/quiz/dsa-sweep-line-geometry")],
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
