import { describe, expect, it, vi } from "vitest";
import type { Question, SingleQuestion } from "@/content/quiz-types";
import type { LevelId } from "@/content/types";
import { correctAnswer } from "@/lib/checkDraw";
import { chapters } from "@/lib/content";
import { LOWER_BELOW, RAISE_AT } from "@/lib/adaptiveThresholds";
import { shiftFor } from "@/lib/mock/adaptive";
import {
  answerQuestion,
  currentQuestion,
  MAX_QUESTIONS,
  NOT_SURE,
  outcomeAfter,
  placementDone,
  placementResult,
  startPlacement,
  type PlacementChapter,
  type PlacementContext,
  STAGES,
  type PlacementState,
} from "@/lib/placement";
import { beginningPlacement, placementFromResult, sanitizePlacement, selfPlacement } from "@/lib/placementRecord";
import { loadPlacementBank } from "@/lib/quizPool";

const CURRICULUM: PlacementChapter[] = [
  { id: "b1", level: "beginner", prerequisites: [] },
  { id: "b2", level: "beginner", prerequisites: ["b1"] },
  { id: "b3", level: "beginner", prerequisites: ["b2"] },
  { id: "b4", level: "beginner", prerequisites: ["b3"] },
  { id: "i1", level: "intermediate", prerequisites: ["b2"] },
  { id: "i2", level: "intermediate", prerequisites: ["i1"] },
  { id: "n1", level: "intermediate", prerequisites: ["i1"] },
  { id: "a1", level: "advanced", prerequisites: ["i2"] },
  { id: "a2", level: "advanced", prerequisites: ["a1"] },
];

function question(chapter: string, level: LevelId, at: number, placement = true): SingleQuestion {
  return {
    id: `${chapter}-${at}`,
    chapter,
    level,
    skill: "recognise",
    pattern: "binary-search",
    section: "the-core-idea",
    ...(placement ? { placement: true as const } : {}),
    kind: "single",
    prompt: "<p>Pick one.</p>",
    choices: [
      { id: "a", text: "right", why: "It is right." },
      { id: "b", text: "wrong", why: "It is wrong." },
    ],
    answer: "a",
  };
}

function bankOf(counts: Record<string, number>, chapters: PlacementChapter[] = CURRICULUM): Question[] {
  return chapters.flatMap((chapter) =>
    Array.from({ length: counts[chapter.id] ?? 0 }, (_, at) => question(chapter.id, chapter.level, at + 1))
  );
}

const COUNTS = { b1: 4, b2: 4, b3: 4, i1: 3, i2: 3, a1: 3, a2: 3 };
const ctx: PlacementContext = { chapters: CURRICULUM, bank: bankOf(COUNTS) };

function play(plan: string, context: PlacementContext = ctx, from?: PlacementState) {
  let state = from ?? startPlacement(context);
  const asked: string[] = [];
  for (const mark of plan.replaceAll(" ", "")) {
    const current = currentQuestion(state, context);
    if (!current) break;
    asked.push(current.id);
    state = answerQuestion(state, context, mark === "c" ? "a" : mark === "n" ? NOT_SURE : "b");
  }
  return { state, asked };
}

function levelOf(plan: string) {
  const { state } = play(plan);
  expect(placementDone(state), plan).toBe(true);
  return placementResult(state, ctx).level;
}

describe("the shared thresholds", () => {
  it("keeps the values the mock has always used", () => {
    expect(RAISE_AT).toBe(0.8);
    expect(LOWER_BELOW).toBe(0.45);
    expect(shiftFor(0.8)).toBe("harder");
    expect(shiftFor(0.79)).toBeNull();
    expect(shiftFor(0.45)).toBeNull();
    expect(shiftFor(0.44)).toBe("easier");
  });
});

describe("the routing decisions", () => {
  it("raises at exactly 0.8 and holds at exactly 0.45", () => {
    expect(outcomeAfter("route", 0.8)).toEqual({ next: "intermediate", level: null });
    expect(outcomeAfter("route", 0.79)).toEqual({ next: "beginner-more", level: null });
    expect(outcomeAfter("route", 0.45)).toEqual({ next: "beginner-more", level: null });
    expect(outcomeAfter("route", 0.44)).toEqual({ next: null, level: "beginner" });
    expect(outcomeAfter("intermediate", 0.8)).toEqual({ next: "advanced", level: "intermediate" });
    expect(outcomeAfter("intermediate", 0.79)).toEqual({ next: null, level: "intermediate" });
    expect(outcomeAfter("intermediate", 0.45)).toEqual({ next: null, level: "intermediate" });
    expect(outcomeAfter("intermediate", 0.44)).toEqual({ next: null, level: "beginner" });
    expect(outcomeAfter("advanced", 0.8)).toEqual({ next: null, level: "advanced" });
    expect(outcomeAfter("advanced", 0.79)).toEqual({ next: null, level: "intermediate" });
    expect(outcomeAfter("beginner-more", 1)).toEqual({ next: null, level: "beginner" });
    expect(outcomeAfter("beginner-more", 0)).toEqual({ next: null, level: "beginner" });
  });

  it("raises on four of five when a stage only has five questions", () => {
    const chapters: PlacementChapter[] = [
      { id: "x", level: "beginner", prerequisites: [] },
      { id: "y", level: "intermediate", prerequisites: [] },
    ];
    const small = { chapters, bank: bankOf({ x: 5, y: 2 }, chapters) };
    const { state } = play("c c c c w", small);
    expect(state.stage).toBe("intermediate");
    expect(currentQuestion(state, small)?.chapter).toBe("y");
  });
});

describe("the placement engine", () => {
  it("starts on the first beginner question", () => {
    const state = startPlacement(ctx);
    expect(state.stage).toBe("route");
    expect(currentQuestion(state, ctx)?.id).toBe("b1-1");
  });

  it("orders questions round robin by chapter, then by bank order", () => {
    const { asked } = play("c c c c c c");
    expect(asked).toEqual(["b1-1", "b2-1", "b3-1", "b1-2", "b2-2", "b3-2"]);
  });

  it("takes all correct to advanced in at most 18 questions", () => {
    const { state, asked } = play("c".repeat(30));
    expect(asked).toHaveLength(MAX_QUESTIONS);
    expect(MAX_QUESTIONS).toBe(18);
    expect(placementDone(state)).toBe(true);
    const result = placementResult(state, ctx);
    expect(result.level).toBe("advanced");
    expect(result.stages).toEqual([
      { id: "route", correct: 6, asked: 6 },
      { id: "intermediate", correct: 6, asked: 6 },
      { id: "advanced", correct: 6, asked: 6 },
    ]);
    expect(result.testedOut).toEqual(["b1", "b2", "b3", "i1", "i2", "a1", "a2"]);
    expect(result.allotted).toEqual([]);
    expect(result.reviseEarlier).toEqual(["b4", "n1"]);
  });

  it("stops a weak start after three misses in a row and allots everything", () => {
    const { state, asked } = play("w w w c c c c");
    expect(asked).toHaveLength(3);
    expect(placementDone(state)).toBe(true);
    expect(currentQuestion(state, ctx)).toBeNull();
    const result = placementResult(state, ctx);
    expect(result.level).toBe("beginner");
    expect(result.allotted).toEqual(CURRICULUM.map((chapter) => chapter.id));
    expect(result.testedOut).toEqual([]);
    expect(result.stages).toEqual([{ id: "route", correct: 0, asked: 3 }]);
  });

  it("counts not sure as a miss that extends the streak", () => {
    const sure = play("w w c");
    const unsure = play("w n c");
    expect(unsure.state).toEqual(sure.state);
    expect(placementDone(play("n n n").state)).toBe(true);
    expect(play("n n n").state).toEqual(play("w w w").state);
    expect(placementDone(play("w n n").state)).toBe(true);
    expect(placementDone(play("n w n").state)).toBe(true);
  });

  it("resets the streak on a correct answer", () => {
    const { state, asked } = play("w w c w w");
    expect(asked).toHaveLength(5);
    expect(placementDone(state)).toBe(false);
    expect(placementDone(play("w w w c c").state)).toBe(true);
    expect(play("w w c w c c").state.stage).toBe("beginner-more");
  });

  it("sends a middle route score to four more beginner questions and then ends at beginner", () => {
    const route = play("c c w c w c");
    expect(route.state.stage).toBe("beginner-more");
    const more = play("c c c c", ctx, route.state);
    expect(more.asked).toEqual(["b1-3", "b2-3", "b3-3", "b1-4"]);
    expect(placementDone(more.state)).toBe(true);
    const result = placementResult(more.state, ctx);
    expect(result.level).toBe("beginner");
    expect(result.stages).toEqual([
      { id: "route", correct: 4, asked: 6 },
      { id: "beginner-more", correct: 4, asked: 4 },
    ]);
    expect(play("c c w c w c" + "c c c c").asked).toHaveLength(10);
  });

  it("holds a score of one half at the beginner-more stage", () => {
    expect(play("c w c w c w").state.stage).toBe("beginner-more");
  });

  it("ends a low route score at beginner without more questions", () => {
    const { state, asked } = play("c w w c w w c");
    expect(asked).toHaveLength(6);
    expect(placementDone(state)).toBe(true);
    expect(levelOf("c w w c w w")).toBe("beginner");
  });

  it("ends an intermediate score between the thresholds at intermediate", () => {
    const { state, asked } = play("c c c c c c" + "c c w c w c");
    expect(asked).toHaveLength(12);
    expect(placementDone(state)).toBe(true);
    expect(placementResult(state, ctx).level).toBe("intermediate");
  });

  it("ends a weak intermediate stage at beginner", () => {
    const { state, asked } = play("c c c c c c" + "c w w c w w");
    expect(asked).toHaveLength(12);
    expect(placementResult(state, ctx).level).toBe("beginner");
  });

  it("stops the intermediate stage after three misses in a row", () => {
    const { state, asked } = play("c c c c c c" + "w w w c c c c");
    expect(asked).toHaveLength(9);
    expect(placementResult(state, ctx).level).toBe("beginner");
    expect(placementResult(state, ctx).stages.at(-1)).toEqual({ id: "intermediate", correct: 0, asked: 3 });
  });

  it("gives intermediate when advanced is cleared by less than 0.8", () => {
    const { state, asked } = play("c c c c c c" + "c c c c c c" + "c c w c w c");
    expect(asked).toHaveLength(18);
    expect(placementResult(state, ctx).level).toBe("intermediate");
    expect(levelOf("c c c c c c" + "c c c c c c" + "w w w c c")).toBe("intermediate");
  });

  it("never asks more than the stage sizes allow", () => {
    for (const mark of ["c", "w", "n", "cw", "c w n", "c c w", "c c c w"]) {
      const { state, asked } = play(mark.repeat(40));
      expect(asked.length, mark).toBeLessThanOrEqual(MAX_QUESTIONS);
      expect(new Set(asked).size, mark).toBe(asked.length);
      for (const stage of placementResult(state, ctx).stages) {
        expect(stage.asked, `${mark} ${stage.id}`).toBeLessThanOrEqual(STAGES[stage.id].size);
      }
    }
  });

  it("ignores answers once the placement is done", () => {
    const { state } = play("w w w");
    expect(answerQuestion(state, ctx, "a")).toBe(state);
  });

  it("grades a wrong string, an empty list and a missing answer as a miss", () => {
    const state = startPlacement(ctx);
    expect(answerQuestion(state, ctx, "b").answers[0].correct).toBe(false);
    expect(answerQuestion(state, ctx, []).answers[0].correct).toBe(false);
    expect(answerQuestion(state, ctx, null as unknown as string).answers[0].correct).toBe(false);
    expect(answerQuestion(state, ctx, undefined as unknown as string).answers[0].correct).toBe(false);
    expect(answerQuestion(state, ctx, "a").answers[0].correct).toBe(true);
  });

  it("ignores an answer meant for a question other than the current one", () => {
    const state = startPlacement(ctx);
    const shown = currentQuestion(state, ctx)!;
    expect(answerQuestion(state, ctx, "a", "b2-1")).toBe(state);
    expect(answerQuestion(state, ctx, "a", "nope")).toBe(state);
    const answered = answerQuestion(state, ctx, "a", shown.id);
    expect(answered.answers).toHaveLength(1);
    expect(answered.answers[0].question).toBe(shown.id);
    expect(answerQuestion(answered, ctx, "a", shown.id)).toBe(answered);
    expect(answerQuestion(state, ctx, "a").answers).toEqual(answered.answers);
  });
});

describe("credit", () => {
  it("tests a chapter out with two correct answers", () => {
    const { state } = play("c c c c c c");
    const result = placementResult(state, ctx);
    expect(result.testedOut).toEqual(["b1", "b2", "b3"]);
    expect(result.allotted).not.toContain("b1");
  });

  it("tests a chapter out with two correct answers and one miss", () => {
    const chapters: PlacementChapter[] = [{ id: "x", level: "beginner", prerequisites: [] }];
    const single = { chapters, bank: bankOf({ x: 3 }, chapters) };
    const { state } = play("c w c", single);
    const result = placementResult(state, single);
    expect(result.testedOut).toEqual(["x"]);
    expect(result.allotted).toEqual([]);
    expect(result.reviseEarlier).toEqual([]);
  });

  it("does not test a chapter out with one correct answer", () => {
    const { state } = play("c w c w c w");
    const result = placementResult(state, ctx);
    expect(result.testedOut).toEqual([]);
    expect(result.allotted).toContain("b1");
  });

  it("blocks credit when a direct prerequisite was missed", () => {
    const { state } = play("w c c c c c");
    const result = placementResult(state, ctx);
    expect(result.testedOut).toEqual(["b3"]);
    expect(result.allotted).toContain("b2");
  });

  it("blocks credit when a direct prerequisite was answered not sure", () => {
    const { state } = play("n c c c c c");
    expect(placementResult(state, ctx).testedOut).toEqual(["b3"]);
  });

  it("does not block credit for a prerequisite that was never tested", () => {
    const chapters: PlacementChapter[] = [
      { id: "x", level: "beginner", prerequisites: [] },
      { id: "y", level: "beginner", prerequisites: ["x"] },
    ];
    const small = { chapters, bank: bankOf({ y: 2 }, chapters) };
    const { state } = play("cc", small);
    expect(placementResult(state, small).testedOut).toEqual(["y"]);
    expect(placementResult(state, small).allotted).toEqual(["x"]);
  });

  it("only looks at direct prerequisites", () => {
    const chapters: PlacementChapter[] = [
      { id: "x", level: "beginner", prerequisites: [] },
      { id: "y", level: "beginner", prerequisites: ["x"] },
      { id: "z", level: "beginner", prerequisites: ["y"] },
    ];
    const small = { chapters, bank: bankOf({ x: 2, z: 2 }, chapters) };
    const { state } = play("w c c c", small);
    expect(placementResult(state, small).testedOut).toEqual(["z"]);
  });

  it("never tests a chapter with no questions, and allots it at or above the level", () => {
    const { state } = play("c c c c c c" + "c c w c w c");
    const result = placementResult(state, ctx);
    expect(result.level).toBe("intermediate");
    expect(result.testedOut).not.toContain("n1");
    expect(result.testedOut).not.toContain("b4");
    expect(result.allotted).toContain("n1");
    expect(result.reviseEarlier).toContain("b4");
  });

  it("allots at or above the level plus lower misses, in curriculum order, and lists the rest to revise", () => {
    const { state } = play("c w c c c c" + "c c w c w c");
    const result = placementResult(state, ctx);
    expect(result.level).toBe("intermediate");
    expect(result.testedOut).toEqual(["b1"]);
    expect(result.allotted).toEqual(["b2", "i1", "i2", "n1", "a1", "a2"]);
    expect(result.reviseEarlier).toEqual(["b3", "b4"]);
    const order = CURRICULUM.map((chapter) => chapter.id);
    for (const list of [result.allotted, result.testedOut, result.reviseEarlier]) {
      expect(list).toEqual(order.filter((id) => list.includes(id)));
    }
    const everything = [...result.allotted, ...result.testedOut, ...result.reviseEarlier].sort();
    expect(everything).toEqual([...order].sort());
  });

  it("keeps a prerequisite before the chapters that need it in allotted", () => {
    const { state } = play("w w w c c c c");
    const { allotted } = placementResult(state, ctx);
    for (const chapter of CURRICULUM) {
      for (const prerequisite of chapter.prerequisites) {
        expect(allotted.indexOf(prerequisite)).toBeLessThan(allotted.indexOf(chapter.id));
      }
    }
  });
});

describe("determinism and shape", () => {
  it("gives the same state and result for the same answers", () => {
    const first = play("c w c c w c" + "c c c c w c");
    const second = play("c w c c w c" + "c c c c w c");
    expect(second.asked).toEqual(first.asked);
    expect(second.state).toEqual(first.state);
    expect(placementResult(second.state, ctx)).toEqual(placementResult(first.state, ctx));
  });

  it("keeps a state that survives a JSON round trip mid-run", () => {
    const half = play("c c c w");
    const revived = JSON.parse(JSON.stringify(half.state)) as PlacementState;
    expect(revived).toEqual(half.state);
    const continued = play("c c c" + "c c c c c c", ctx, revived);
    const straight = play("c c c w" + "c c c" + "c c c c c c");
    expect(continued.state).toEqual(straight.state);
    expect(JSON.parse(JSON.stringify(placementResult(straight.state, ctx)))).toEqual(
      placementResult(straight.state, ctx)
    );
  });

  it("does not change the state it is given", () => {
    const state = startPlacement(ctx);
    const snapshot = JSON.stringify(state);
    answerQuestion(state, ctx, "a");
    expect(JSON.stringify(state)).toBe(snapshot);
  });

  it("handles an empty bank without throwing", () => {
    const empty = { chapters: CURRICULUM, bank: [] };
    const state = startPlacement(empty);
    expect(placementDone(state)).toBe(true);
    expect(currentQuestion(state, empty)).toBeNull();
    expect(answerQuestion(state, empty, "a")).toBe(state);
    const result = placementResult(state, empty);
    expect(result.level).toBe("beginner");
    expect(result.testedOut).toEqual([]);
    expect(result.stages).toEqual([]);
    expect(result.allotted).toEqual(CURRICULUM.map((chapter) => chapter.id));
  });

  it("uses only placement-tagged questions", () => {
    const untagged = CURRICULUM.flatMap((chapter) =>
      [1, 2, 3].map((at) => question(chapter.id, chapter.level, at, false))
    );
    expect(placementDone(startPlacement({ chapters: CURRICULUM, bank: untagged }))).toBe(true);
  });

  it("ends at the level reached so far when a stage has no questions", () => {
    const noAdvanced = { chapters: CURRICULUM, bank: bankOf({ b1: 4, b2: 4, b3: 4, i1: 3, i2: 3 }) };
    const reachedIntermediate = play("c".repeat(20), noAdvanced);
    expect(placementDone(reachedIntermediate.state)).toBe(true);
    expect(reachedIntermediate.asked).toHaveLength(12);
    expect(placementResult(reachedIntermediate.state, noAdvanced).level).toBe("intermediate");

    const noIntermediate = { chapters: CURRICULUM, bank: bankOf({ b1: 4, b2: 4, b3: 4 }) };
    const reachedBeginner = play("c".repeat(20), noIntermediate);
    expect(reachedBeginner.asked).toHaveLength(6);
    expect(placementResult(reachedBeginner.state, noIntermediate).level).toBe("beginner");
  });

  it("ends a stage that has been asked everything it can", () => {
    const few = { chapters: CURRICULUM, bank: bankOf({ b1: 2, b2: 1 }) };
    const { state, asked } = play("c".repeat(10), few);
    expect(asked).toHaveLength(3);
    expect(placementDone(state)).toBe(true);
  });
});

describe("the real curriculum and bank", () => {
  const real: PlacementChapter[] = chapters("dsa").map((chapter) => ({
    id: chapter.id,
    level: chapter.levels[0],
    prerequisites: chapter.prerequisites ?? [],
  }));

  it("finishes within the limit and sorts every chapter into one list, whatever is answered", async () => {
    const bank = await loadPlacementBank();
    const realCtx = { chapters: real, bank };
    expect(bank.length).toBeGreaterThan(0);
    const levels: LevelId[] = ["beginner", "intermediate", "advanced"];
    const everyId = real.map((chapter) => chapter.id).sort();

    for (const answerWith of [(question: Question) => correctAnswer(question), () => NOT_SURE]) {
      let state = startPlacement(realCtx);
      let asked = 0;
      while (currentQuestion(state, realCtx)) {
        state = answerQuestion(state, realCtx, answerWith(currentQuestion(state, realCtx)!));
        asked++;
        expect(asked).toBeLessThanOrEqual(MAX_QUESTIONS);
      }
      expect(placementDone(state)).toBe(true);
      const result = placementResult(state, realCtx);
      expect(levels).toContain(result.level);
      const sorted = [...result.allotted, ...result.testedOut, ...result.reviseEarlier].sort();
      expect(sorted).toEqual(everyId);
    }
  });

  it("loads only placement-tagged questions", async () => {
    const bank = await loadPlacementBank();
    expect(bank.every((entry) => entry.placement === true)).toBe(true);
  });
});

describe("the placement record", () => {
  it("builds a record from an engine result", () => {
    const { state } = play("c c c c c c" + "c c w c w c");
    const result = placementResult(state, ctx);
    const record = placementFromResult(result, 1000, 93.6);
    expect(record).toEqual({
      mode: "quiz",
      level: "intermediate",
      stages: result.stages,
      testedOut: result.testedOut,
      allotted: result.allotted,
      takenAt: 1000,
      seconds: 93,
    });
    expect(sanitizePlacement(JSON.parse(JSON.stringify(record)))).toEqual(record);
  });

  it("builds the beginning and self records", () => {
    const beginning = beginningPlacement(CURRICULUM, 5);
    expect(beginning).toMatchObject({ mode: "beginning", level: "beginner", testedOut: [], stages: [], takenAt: 5 });
    expect(beginning.allotted).toEqual(CURRICULUM.map((chapter) => chapter.id));
    const self = selfPlacement("intermediate", CURRICULUM, 7);
    expect(self).toMatchObject({ mode: "self", level: "intermediate", testedOut: [], takenAt: 7 });
    expect(self.allotted).toEqual(["i1", "i2", "n1", "a1", "a2"]);
    expect(selfPlacement("advanced", CURRICULUM, 7).allotted).toEqual(["a1", "a2"]);
    expect(selfPlacement("beginner", CURRICULUM, 7).allotted).toHaveLength(CURRICULUM.length);
  });

  it("returns null for junk and keeps what is valid", () => {
    for (const junk of [
      null,
      undefined,
      3,
      "x",
      [],
      {},
      { mode: "quiz" },
      { mode: "other", level: "beginner", takenAt: 1 },
    ]) {
      expect(sanitizePlacement(junk)).toBeNull();
    }
    expect(sanitizePlacement({ mode: "quiz", level: "expert", takenAt: 1 })).toBeNull();
    expect(sanitizePlacement({ mode: "quiz", level: "beginner", takenAt: 0 })).toBeNull();
    expect(
      sanitizePlacement({
        mode: "self",
        level: "advanced",
        takenAt: 9,
        stages: [{ id: "route", correct: 9, asked: 6 }, { id: "nope", correct: 1, asked: 1 }, 4],
        testedOut: ["a", 1],
        allotted: "x",
        seconds: -3,
      })
    ).toEqual({
      mode: "self",
      level: "advanced",
      stages: [{ id: "route", correct: 6, asked: 6 }],
      testedOut: ["a"],
      allotted: [],
      takenAt: 9,
      seconds: 0,
    });
  });

  it("normalises the time on every builder so a saved record never reads back as not placed", () => {
    const { state } = play("c c c c c c");
    const result = placementResult(state, ctx);
    vi.useFakeTimers();
    vi.setSystemTime(new Date(5_000_000));
    try {
      for (const bad of [0, -4, Number.NaN, Number.POSITIVE_INFINITY, undefined as unknown as number]) {
        expect(placementFromResult(result, bad, 3).takenAt, String(bad)).toBe(5_000_000);
        expect(beginningPlacement(CURRICULUM, bad).takenAt, String(bad)).toBe(5_000_000);
        expect(selfPlacement("beginner", CURRICULUM, bad).takenAt, String(bad)).toBe(5_000_000);
      }
    } finally {
      vi.useRealTimers();
    }
    expect(placementFromResult(result, 1234.9, 3).takenAt).toBe(1234);
    expect(beginningPlacement(CURRICULUM, 99.5).takenAt).toBe(99);
    expect(selfPlacement("advanced", CURRICULUM, 0.4).takenAt).toBe(1);
    for (const record of [
      placementFromResult(result, 0, 3),
      beginningPlacement(CURRICULUM, Number.NaN),
      selfPlacement("intermediate", CURRICULUM, -1),
    ]) {
      expect(sanitizePlacement(JSON.parse(JSON.stringify(record)))).toEqual(record);
    }
  });

  it("keeps the first of a repeated stage id", () => {
    const record = sanitizePlacement({
      mode: "quiz",
      level: "beginner",
      takenAt: 5,
      stages: [
        { id: "route", correct: 2, asked: 6 },
        { id: "route", correct: 6, asked: 6 },
        { id: "advanced", correct: 1, asked: 3 },
      ],
    });
    expect(record?.stages).toEqual([
      { id: "route", correct: 2, asked: 6 },
      { id: "advanced", correct: 1, asked: 3 },
    ]);
  });

  it("removes repeated ids, and an id in both lists stays only in tested out", () => {
    const record = sanitizePlacement({
      mode: "quiz",
      level: "intermediate",
      takenAt: 5,
      testedOut: ["a", "b", "a"],
      allotted: ["b", "c", "c", "d", "a"],
    });
    expect(record?.testedOut).toEqual(["a", "b"]);
    expect(record?.allotted).toEqual(["c", "d"]);
  });

  it("floors the time and the seconds it reads", () => {
    const record = sanitizePlacement({ mode: "self", level: "beginner", takenAt: 77.9, seconds: 12.8 });
    expect(record).toMatchObject({ takenAt: 77, seconds: 12 });
    expect(sanitizePlacement({ mode: "self", level: "beginner", takenAt: 0.5 })?.takenAt).toBe(1);
  });
});
