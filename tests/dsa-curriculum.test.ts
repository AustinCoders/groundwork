import { describe, expect, it } from "vitest";
import { chapters, exercises } from "@/lib/content";
import { levels } from "@/lib/topics";
import type { LevelId } from "@/content/types";

interface Target {
  id: string;
  num: string;
  level: LevelId;
  prerequisites: string[];
}

const target: Target[] = [
  { id: "dsa-complexity-analysis", num: "B1", level: "beginner", prerequisites: [] },
  { id: "dsa-js-toolkit", num: "B2", level: "beginner", prerequisites: ["dsa-complexity-analysis"] },
  {
    id: "dsa-arrays-strings",
    num: "B3",
    level: "beginner",
    prerequisites: ["dsa-complexity-analysis", "dsa-js-toolkit"],
  },
  { id: "dsa-prefix-sums", num: "B4", level: "beginner", prerequisites: ["dsa-arrays-strings"] },
  { id: "dsa-hashing", num: "B5", level: "beginner", prerequisites: ["dsa-arrays-strings"] },
  { id: "dsa-two-pointers", num: "B6", level: "beginner", prerequisites: ["dsa-arrays-strings"] },
  { id: "dsa-sliding-window", num: "B7", level: "beginner", prerequisites: ["dsa-hashing", "dsa-two-pointers"] },
  { id: "dsa-binary-search", num: "B8", level: "beginner", prerequisites: ["dsa-arrays-strings"] },
  { id: "dsa-basic-recursion", num: "B9", level: "beginner", prerequisites: ["dsa-complexity-analysis"] },
  { id: "dsa-sorting-algorithms", num: "B10", level: "beginner", prerequisites: ["dsa-basic-recursion"] },
  { id: "dsa-stacks-queues", num: "B11", level: "beginner", prerequisites: ["dsa-js-toolkit"] },
  { id: "dsa-linked-lists", num: "B12", level: "beginner", prerequisites: ["dsa-js-toolkit"] },
  { id: "dsa-trees", num: "I1", level: "intermediate", prerequisites: ["dsa-basic-recursion", "dsa-stacks-queues"] },
  { id: "dsa-bst-operations", num: "I2", level: "intermediate", prerequisites: ["dsa-trees", "dsa-binary-search"] },
  { id: "dsa-tree-problems", num: "I3", level: "intermediate", prerequisites: ["dsa-trees"] },
  { id: "dsa-heaps-priority-queues", num: "I4", level: "intermediate", prerequisites: ["dsa-trees"] },
  {
    id: "dsa-graphs-representation-traversal",
    num: "I5",
    level: "intermediate",
    prerequisites: ["dsa-stacks-queues", "dsa-basic-recursion"],
  },
  { id: "dsa-grid-bfs", num: "I6", level: "intermediate", prerequisites: ["dsa-graphs-representation-traversal"] },
  {
    id: "dsa-graph-problems",
    num: "I7",
    level: "intermediate",
    prerequisites: ["dsa-graphs-representation-traversal", "dsa-grid-bfs"],
  },
  { id: "dsa-topological-patterns", num: "I8", level: "intermediate", prerequisites: ["dsa-graph-problems"] },
  { id: "dsa-backtracking", num: "I9", level: "intermediate", prerequisites: ["dsa-basic-recursion"] },
  { id: "dsa-dp-1d", num: "I10", level: "intermediate", prerequisites: ["dsa-basic-recursion", "dsa-binary-search"] },
  { id: "dsa-dp-2d", num: "I11", level: "intermediate", prerequisites: ["dsa-dp-1d"] },
  { id: "dsa-dp-state-machines", num: "I12", level: "intermediate", prerequisites: ["dsa-dp-1d"] },
  { id: "dsa-greedy", num: "I13", level: "intermediate", prerequisites: ["dsa-sorting-algorithms"] },
  {
    id: "dsa-intervals",
    num: "I14",
    level: "intermediate",
    prerequisites: ["dsa-sorting-algorithms", "dsa-heaps-priority-queues"],
  },
  { id: "dsa-bit-manipulation", num: "I15", level: "intermediate", prerequisites: ["dsa-complexity-analysis"] },
  { id: "dsa-matrix-problems", num: "I16", level: "intermediate", prerequisites: ["dsa-prefix-sums"] },
  { id: "dsa-tries", num: "I17", level: "intermediate", prerequisites: ["dsa-trees", "dsa-hashing"] },
  {
    id: "dsa-monotonic-stack-queue",
    num: "I18",
    level: "intermediate",
    prerequisites: ["dsa-stacks-queues", "dsa-sliding-window"],
  },
  { id: "dsa-math", num: "I19", level: "intermediate", prerequisites: ["dsa-basic-recursion"] },
  { id: "dsa-advanced-dp", num: "A1", level: "advanced", prerequisites: ["dsa-dp-2d", "dsa-dp-state-machines"] },
  { id: "dsa-union-find", num: "A2", level: "advanced", prerequisites: ["dsa-graphs-representation-traversal"] },
  {
    id: "dsa-advanced-graph-algorithms",
    num: "A3",
    level: "advanced",
    prerequisites: ["dsa-heaps-priority-queues", "dsa-grid-bfs", "dsa-topological-patterns"],
  },
  {
    id: "dsa-minimum-spanning-tree",
    num: "A4",
    level: "advanced",
    prerequisites: ["dsa-union-find", "dsa-heaps-priority-queues"],
  },
  {
    id: "dsa-graph-structure",
    num: "A5",
    level: "advanced",
    prerequisites: ["dsa-topological-patterns", "dsa-advanced-graph-algorithms"],
  },
  { id: "dsa-segment-fenwick-trees", num: "A6", level: "advanced", prerequisites: ["dsa-trees", "dsa-prefix-sums"] },
  { id: "dsa-sparse-table", num: "A7", level: "advanced", prerequisites: ["dsa-segment-fenwick-trees"] },
  { id: "dsa-string-algorithms", num: "A8", level: "advanced", prerequisites: ["dsa-hashing", "dsa-prefix-sums"] },
  {
    id: "dsa-design-problems",
    num: "A9",
    level: "advanced",
    prerequisites: ["dsa-hashing", "dsa-linked-lists", "dsa-heaps-priority-queues"],
  },
  { id: "dsa-advanced-backtracking", num: "A10", level: "advanced", prerequisites: ["dsa-backtracking"] },
  { id: "dsa-interview-strategy", num: "A11", level: "advanced", prerequisites: ["dsa-complexity-analysis"] },
];

const DEPTH_ALLOW: string[] = [
  "dsa-arrays-strings",
  "dsa-hashing",
  "dsa-two-pointers",
  "dsa-sliding-window",
  "dsa-binary-search",
  "dsa-basic-recursion",
  "dsa-stacks-queues",
  "dsa-linked-lists",
  "dsa-trees",
  "dsa-tree-problems",
  "dsa-heaps-priority-queues",
  "dsa-graphs-representation-traversal",
  "dsa-graph-problems",
  "dsa-backtracking",
  "dsa-dp-1d",
  "dsa-dp-2d",
  "dsa-greedy",
  "dsa-intervals",
  "dsa-bit-manipulation",
  "dsa-matrix-problems",
];
const EXERCISE_ALLOW: string[] = ["dsa-sliding-window"];

const DEPTH_BAR_WORDS = 1200;
const levelRank: Record<LevelId, number> = { beginner: 0, intermediate: 1, advanced: 2 };

const dsa = chapters("dsa");
const byId = new Map(dsa.map((ch) => [ch.id, ch]));
const written = dsa.filter((ch) => ch.ready);

function proseWords(body: string): number {
  return body
    .replace(/<pre[\s\S]*?<\/pre>/g, " ")
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<svg[\s\S]*?<\/svg>/g, " ")
    .replace(/<[^>]*>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

function exercisesFitting(chapterId: string): { level: LevelId }[] {
  const ch = byId.get(chapterId)!;
  const linked = new Set(ch.practice);
  return exercises().filter((ex) => ex.chapter === chapterId || linked.has(ex.id));
}

describe("DSA curriculum", () => {
  it("lists the 42 chapters in curriculum order with their num and level", () => {
    expect(dsa.map((ch) => ({ id: ch.id, num: ch.num, level: ch.levels[0], count: ch.levels.length }))).toEqual(
      target.map((t) => ({ id: t.id, num: t.num, level: t.level, count: 1 }))
    );
  });

  it("declares the prerequisites of every chapter", () => {
    for (const t of target) {
      expect(byId.get(t.id)?.prerequisites, `${t.id} prerequisites`).toEqual(t.prerequisites);
    }
  });

  it("only names prerequisites that exist and come earlier", () => {
    const position = new Map(dsa.map((ch, i) => [ch.id, i]));
    for (const ch of dsa) {
      for (const pre of ch.prerequisites ?? []) {
        expect(position.has(pre), `${ch.id} names missing prerequisite "${pre}"`).toBe(true);
        expect(pre, `${ch.id} names itself as a prerequisite`).not.toBe(ch.id);
        expect(
          position.get(pre)! < position.get(ch.id)!,
          `${ch.id} names "${pre}", which comes later in the order`
        ).toBe(true);
      }
    }
  });

  it("has no prerequisite cycles", () => {
    const state = new Map<string, "visiting" | "done">();
    const visit = (id: string, trail: string[]) => {
      expect(state.get(id), `prerequisite cycle: ${[...trail, id].join(" -> ")}`).not.toBe("visiting");
      if (state.get(id) === "done") return;
      state.set(id, "visiting");
      for (const pre of byId.get(id)?.prerequisites ?? []) visit(pre, [...trail, id]);
      state.set(id, "done");
    };
    for (const ch of dsa) visit(ch.id, []);
  });

  it("orders each level's syllabus like the chapter array", () => {
    for (const level of levels("dsa")) {
      const syllabusIds = level.syllabus.map((s) => s.chapter);
      const arrayIds = dsa.filter((ch) => ch.levels.includes(level.id)).map((ch) => ch.id);
      expect(syllabusIds, `${level.id} syllabus`).toEqual(arrayIds);
    }
  });

  it("lists each chapter once across the syllabus and gives every outline chapter bullets", () => {
    const sections = levels("dsa").flatMap((level) => level.syllabus);
    const ids = sections.map((section) => section.chapter);
    expect(new Set(ids).size, "a chapter appears in two syllabus sections").toBe(ids.length);
    for (const ch of dsa.filter((c) => !c.ready)) {
      const section = sections.find((s) => s.chapter === ch.id);
      expect(section?.items.length ?? 0, `${ch.id} outline has no syllabus bullets`).toBeGreaterThan(0);
    }
  });

  it("keeps the unwritten chapters as outlines", () => {
    expect(
      dsa
        .filter((ch) => !ch.ready)
        .map((ch) => ch.id)
        .sort()
    ).toEqual(
      [
        "dsa-bst-operations",
        "dsa-dp-state-machines",
        "dsa-graph-structure",
        "dsa-grid-bfs",
        "dsa-js-toolkit",
        "dsa-math",
        "dsa-prefix-sums",
        "dsa-sparse-table",
      ].sort()
    );
  });

  it("meets the depth bar in every written chapter not on the allow-list", () => {
    for (const ch of written) {
      const words = proseWords(ch.body);
      if (DEPTH_ALLOW.includes(ch.id)) {
        expect(words, `${ch.id} now meets the ${DEPTH_BAR_WORDS}-word bar; remove it from DEPTH_ALLOW`).toBeLessThan(
          DEPTH_BAR_WORDS
        );
      } else {
        expect(words, `${ch.id} has ${words} words of prose`).toBeGreaterThanOrEqual(DEPTH_BAR_WORDS);
      }
    }
  });

  it("gives every written chapter an exercise at or below its level unless on the allow-list", () => {
    for (const ch of written) {
      const rank = levelRank[ch.levels[0]];
      const fits = exercisesFitting(ch.id).some((ex) => levelRank[ex.level] <= rank);
      if (EXERCISE_ALLOW.includes(ch.id)) {
        expect(fits, `${ch.id} now has a fitting exercise; remove it from EXERCISE_ALLOW`).toBe(false);
      } else {
        expect(fits, `${ch.id} has no exercise at or below ${ch.levels[0]}`).toBe(true);
      }
    }
  });

  it("keeps the allow-lists naming only written chapters", () => {
    for (const id of [...DEPTH_ALLOW, ...EXERCISE_ALLOW]) {
      expect(byId.get(id)?.ready, `${id} is allow-listed but not a written chapter`).toBe(true);
    }
  });
});
