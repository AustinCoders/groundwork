import { describe, expect, it } from "vitest";
import type { ChapterPool, PredictQuestion, Question, SingleQuestion } from "@/content/quiz-types";
import {
  CHECK_SIZE,
  correctAnswer,
  drawCheck,
  gradeAnswer,
  passMark,
  passes,
  shuffled,
  startingOrder,
} from "@/lib/checkDraw";
import { loadPool } from "@/lib/quizPool";

const pool = (await loadPool("dsa-binary-search")) as ChapterPool;
const all = pool.questions;
const byKind = <K extends Question["kind"]>(kind: K) =>
  all.find((question): question is Extract<Question, { kind: K }> => question.kind === kind)!;

function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEEDS = Array.from({ length: 200 }, (_, i) => i + 1);
const ids = (questions: Question[]) => questions.map((question) => question.id);

function filler(id: string, skill: Question["skill"]): SingleQuestion {
  return { ...(byKind("single") as SingleQuestion), id, skill };
}

describe("drawing a check", () => {
  it("has a pool big enough to draw from", () => {
    expect(all.length).toBeGreaterThan(CHECK_SIZE);
  });

  it("draws 5 different questions with a trace and a recognise or complexity question", () => {
    for (const seed of SEEDS) {
      const drawn = drawCheck(all, seeded(seed));
      expect(drawn, `seed ${seed}`).toHaveLength(CHECK_SIZE);
      expect(new Set(ids(drawn)).size, `seed ${seed}`).toBe(CHECK_SIZE);
      expect(
        drawn.some((question) => question.skill === "trace"),
        `a trace question, seed ${seed}`
      ).toBe(true);
      expect(
        drawn.some((question) => question.skill === "recognise" || question.skill === "complexity"),
        `a recognise or complexity question, seed ${seed}`
      ).toBe(true);
    }
  });

  it("draws only questions from the pool", () => {
    const known = new Set(ids(all));
    for (const seed of SEEDS) {
      for (const question of drawCheck(all, seeded(seed))) expect(known.has(question.id)).toBe(true);
    }
  });

  it("shuffles the order of the five", () => {
    const poolOrder = ids(all);
    const orders = new Set<string>();
    const firsts = new Set<string>();
    let inPoolOrder = 0;
    for (const seed of SEEDS) {
      const drawn = ids(drawCheck(all, seeded(seed)));
      orders.add(drawn.join(","));
      firsts.add(drawn[0]);
      const positions = drawn.map((id) => poolOrder.indexOf(id));
      if (positions.every((at, i) => i === 0 || positions[i - 1] < at)) inPoolOrder++;
    }
    expect(orders.size).toBeGreaterThan(100);
    expect(firsts.size).toBeGreaterThan(3);
    expect(inPoolOrder).toBeLessThan(SEEDS.length / 4);
  });

  it("draws a different set on a retry whenever the pool allows", () => {
    for (const seed of SEEDS) {
      const random = seeded(seed);
      const first = drawCheck(all, random);
      const second = drawCheck(all, random, ids(first));
      expect(new Set(ids(second)), `seed ${seed}`).not.toEqual(new Set(ids(first)));
      expect(second.filter((question) => !ids(first).includes(question.id)).length).toBeGreaterThanOrEqual(3);
    }
  });

  it("still differs from the last draw when only one fresh question is left", () => {
    const six = all.slice(0, 6);
    for (const seed of SEEDS) {
      const first = drawCheck(six, seeded(seed));
      const second = drawCheck(six, seeded(seed + 1000), ids(first));
      expect(new Set(ids(second))).not.toEqual(new Set(ids(first)));
    }
  });

  it("returns what exists when the pool is thin", () => {
    const three = all.slice(0, 3);
    expect(ids(drawCheck(three, seeded(1))).sort()).toEqual(ids(three).sort());
    expect(drawCheck([], seeded(1))).toEqual([]);
    expect(drawCheck(all.slice(0, CHECK_SIZE), seeded(1), ids(all.slice(0, CHECK_SIZE)))).toHaveLength(CHECK_SIZE);
  });

  it("does not fail when the pool has no trace question", () => {
    const noTrace = [
      ...Array.from({ length: 3 }, (_, i) => filler(`r${i}`, "recognise")),
      ...Array.from({ length: 4 }, (_, i) => filler(`e${i}`, "edge-case")),
    ];
    const drawn = drawCheck(noTrace, seeded(3));
    expect(drawn).toHaveLength(CHECK_SIZE);
    expect(drawn.some((question) => question.skill === "recognise")).toBe(true);
  });

  it("keeps a trace question even when the only trace was in the last draw", () => {
    const only = [
      filler("t", "trace"),
      ...Array.from({ length: 3 }, (_, i) => filler(`r${i}`, "recognise")),
      ...Array.from({ length: 4 }, (_, i) => filler(`e${i}`, "edge-case")),
    ];
    for (const seed of SEEDS) {
      const drawn = drawCheck(only, seeded(seed), ["t", "r0", "r1", "e0", "e1"]);
      expect(drawn.some((question) => question.id === "t")).toBe(true);
    }
  });

  it("does not change the pool it is given", () => {
    const before = ids(all);
    drawCheck(all, seeded(9));
    expect(ids(all)).toEqual(before);
  });
});

describe("shuffling", () => {
  it("keeps every item and leaves the input alone", () => {
    const input = [1, 2, 3, 4, 5, 6];
    const out = shuffled(input, seeded(4));
    expect([...out].sort()).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5, 6]);
  });
});

describe("the starting order of an order question", () => {
  const items = ["a", "b", "c", "d", "e"];

  it("is a permutation that is never the right order", () => {
    for (const seed of SEEDS) {
      const order = startingOrder(items, seeded(seed));
      expect([...order].sort()).toEqual(items);
      expect(order, `seed ${seed}`).not.toEqual(items);
    }
  });

  it("is moved off the right order even when the shuffle returns it", () => {
    const keepsOrder = () => 0.999999;
    expect(startingOrder(items, keepsOrder)).not.toEqual(items);
    expect(startingOrder(["a", "b"], keepsOrder)).toEqual(["b", "a"]);
  });

  it("leaves a single item alone", () => {
    expect(startingOrder(["a"], seeded(1))).toEqual(["a"]);
  });
});

describe("grading", () => {
  const single = byKind("single");
  const wrongSingle = single.choices.find((choice) => choice.id !== single.answer)!.id;
  const multi = byKind("multi");
  const order = byKind("order");
  const orderIds = order.items.map((item) => item.id);
  const predict: PredictQuestion = {
    ...single,
    id: "predict-fixture",
    kind: "predict",
    tracer: "binary-search",
    step: 2,
  };

  it("grades a single choice by its id", () => {
    expect(gradeAnswer(single, single.answer)).toBe(true);
    expect(gradeAnswer(single, wrongSingle)).toBe(false);
    expect(gradeAnswer(single, "")).toBe(false);
    expect(gradeAnswer(single, null)).toBe(false);
    expect(gradeAnswer(single, undefined)).toBe(false);
    expect(gradeAnswer(single, [single.answer])).toBe(false);
  });

  it("grades a predict question as a single choice", () => {
    expect(gradeAnswer(predict, predict.answer)).toBe(true);
    expect(gradeAnswer(predict, wrongSingle)).toBe(false);
  });

  it("grades a multi question by the exact set, in any order", () => {
    expect(gradeAnswer(multi, [...multi.answers])).toBe(true);
    expect(gradeAnswer(multi, [...multi.answers].reverse())).toBe(true);
  });

  it("gives no credit for part of a multi answer, an extra choice, a repeat or the wrong shape", () => {
    const [first] = multi.answers;
    const extra = multi.choices.find((choice) => !multi.answers.includes(choice.id))!.id;
    expect(multi.answers.length).toBeGreaterThan(1);
    expect(gradeAnswer(multi, [first])).toBe(false);
    expect(gradeAnswer(multi, [...multi.answers, extra])).toBe(false);
    expect(gradeAnswer(multi, [first, first])).toBe(false);
    expect(gradeAnswer(multi, [extra])).toBe(false);
    expect(gradeAnswer(multi, [])).toBe(false);
    expect(gradeAnswer(multi, first)).toBe(false);
  });

  it("grades an order question by the exact sequence", () => {
    expect(gradeAnswer(order, orderIds)).toBe(true);
  });

  it("gives no credit for an order that is nearly right, short, long or the wrong shape", () => {
    const swapped = [...orderIds];
    [swapped[0], swapped[1]] = [swapped[1], swapped[0]];
    expect(gradeAnswer(order, swapped)).toBe(false);
    expect(gradeAnswer(order, [...orderIds].reverse())).toBe(false);
    expect(gradeAnswer(order, orderIds.slice(0, -1))).toBe(false);
    expect(gradeAnswer(order, [...orderIds, orderIds[0]])).toBe(false);
    expect(gradeAnswer(order, orderIds.join(","))).toBe(false);
    expect(gradeAnswer(order, null)).toBe(false);
  });

  it("reports the right answer in the shape it grades", () => {
    expect(correctAnswer(single)).toBe(single.answer);
    expect(correctAnswer(multi)).toEqual(multi.answers);
    expect(correctAnswer(order)).toEqual(orderIds);
    for (const question of all) expect(gradeAnswer(question, correctAnswer(question))).toBe(true);
  });
});

describe("the pass mark", () => {
  it("passes at 4 of 5 and not below", () => {
    expect(passes(5)).toBe(true);
    expect(passes(4)).toBe(true);
    expect(passes(3)).toBe(false);
    expect(passes(0)).toBe(false);
  });

  it("asks for at most the pass mark and never more than the questions asked", () => {
    expect(passMark(5)).toBe(4);
    expect(passMark(30)).toBe(4);
    expect(passMark(3)).toBe(3);
    expect(passMark(1)).toBe(1);
  });

  it("lets a thin pool pass by getting all of it right and no less", () => {
    expect(passes(3, 3)).toBe(true);
    expect(passes(2, 3)).toBe(false);
    expect(passes(1, 1)).toBe(true);
    expect(passes(3, 5)).toBe(false);
  });
});
