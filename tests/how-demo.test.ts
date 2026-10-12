import { describe, expect, it } from "vitest";
import {
  QUESTION,
  TEST_NAMES,
  VARIANTS,
  gradeAnswer,
  reviewSchedule,
  runVariant,
  variantOf,
  type VariantId,
} from "@/lib/howDemo";
import { REVIEW_GAPS_DAYS } from "@/lib/storage";

const FAILING: Record<VariantId, string[]> = {
  shared: ["each counter keeps its own n"],
  closure: [],
  offByOne: ["counts up from 1"],
};

function failed(id: VariantId): string[] {
  return runVariant(id)
    .outcomes.filter((outcome) => !outcome.ok)
    .map((outcome) => outcome.name);
}

describe("the counter variants", () => {
  it("has three variants and three tests", () => {
    expect(VARIANTS.map((variant) => variant.id)).toEqual(["shared", "closure", "offByOne"]);
    expect(TEST_NAMES).toEqual(["counts up from 1", "each counter keeps its own n", "adds exactly one every call"]);
  });

  it("fails exactly the tests each variant is built to fail", () => {
    for (const variant of VARIANTS) expect(failed(variant.id), variant.id).toEqual(FAILING[variant.id]);
  });

  it("passes everything for the closure and counts the passes", () => {
    expect(runVariant("closure")).toMatchObject({ passed: 3, total: 3, ok: true });
    expect(runVariant("shared")).toMatchObject({ passed: 2, total: 3, ok: false });
    expect(runVariant("offByOne")).toMatchObject({ passed: 2, total: 3, ok: false });
  });

  it("reports what a failing test expected and received", () => {
    const shared = runVariant("shared").outcomes[1];
    expect(shared).toEqual({
      name: "each counter keeps its own n",
      ok: false,
      expected: "2",
      received: "4",
    });
    const off = runVariant("offByOne").outcomes[0];
    expect(off).toMatchObject({ ok: false, expected: "1, then 2", received: "0, then 1" });
  });

  it("is deterministic and leaks no state between runs, in any order", () => {
    const first = VARIANTS.map((variant) => runVariant(variant.id));
    const again = VARIANTS.map((variant) => runVariant(variant.id));
    expect(again).toEqual(first);
    const reversed = [...VARIANTS].reverse().map((variant) => runVariant(variant.id));
    expect(reversed.reverse()).toEqual(first);
    for (let i = 0; i < 5; i++) expect(runVariant("shared")).toEqual(first[0]);
  });

  it("gives every variant source that matches what runs", () => {
    for (const variant of VARIANTS) {
      const text = variant.source.join("\n");
      expect(text, variant.id).toContain("function counter()");
      expect(variant.hint.length, variant.id).toBeGreaterThan(10);
    }
    expect(variantOf("shared").source[variantOf("shared").culprit as number]).toBe("let n = 0;");
    expect(variantOf("offByOne").source[variantOf("offByOne").culprit as number]).toContain("n++");
    expect(variantOf("closure").culprit).toBeNull();
  });

  it("falls back to the first variant for an unknown id", () => {
    expect(variantOf("nope" as VariantId).id).toBe("shared");
  });
});

describe("the interview question", () => {
  it("has four options and exactly one correct", () => {
    expect(QUESTION.options).toHaveLength(4);
    expect(QUESTION.options.filter((option) => option.correct)).toHaveLength(1);
  });

  it("marks as correct the value the real closure logs", () => {
    const counter = VARIANTS.find((variant) => variant.id === "closure")!.create();
    const a = counter();
    a();
    a();
    const logged = String(counter()());
    const right = QUESTION.options.find((option) => option.correct)!;
    expect(right.label).toBe(logged);
  });

  it("grades the right answer with its explanation and the right follow-up", () => {
    const grade = gradeAnswer("one")!;
    expect(grade.correct).toBe(true);
    expect(grade.why).toContain("brand-new n");
    expect(grade.ask).toBe(QUESTION.followUp.right.ask);
    expect(grade.testing).toBe(QUESTION.followUp.right.testing);
  });

  it("grades every wrong answer with its own explanation and the other follow-up", () => {
    const reasons = new Set<string>();
    for (const option of QUESTION.options.filter((o) => !o.correct)) {
      const grade = gradeAnswer(option.id)!;
      expect(grade.correct).toBe(false);
      expect(grade.ask).toBe(QUESTION.followUp.wrong.ask);
      reasons.add(grade.why);
    }
    expect(reasons.size).toBe(3);
  });

  it("says checked and never verified, and rejects an unknown option", () => {
    for (const option of QUESTION.options) {
      expect(option.why).toMatch(/^Checked:/);
      expect(option.why.toLowerCase()).not.toContain("verified");
    }
    expect(gradeAnswer("nope")).toBeNull();
  });
});

describe("the review calendar", () => {
  const today = new Date(2026, 9, 9);

  it("lights today and the real gaps one after another", () => {
    const days = reviewSchedule(today);
    expect(days.map((day) => day.offset)).toEqual([0, 3, 10, 31, 91, 271]);
    expect(days.slice(1).map((day) => day.gap)).toEqual(REVIEW_GAPS_DAYS);
    expect(days[0].gap).toBeNull();
  });

  it("dates each review from a fixed today", () => {
    const days = reviewSchedule(today);
    expect(days.map((day) => [day.date.getMonth(), day.date.getDate()])).toEqual([
      [9, 9],
      [9, 12],
      [9, 19],
      [10, 9],
      [0, 8],
      [6, 7],
    ]);
  });

  it("keeps the date right across a daylight-saving change", () => {
    const days = reviewSchedule(new Date(2026, 2, 27));
    expect(days[2].date.getDate()).toBe(6);
    expect(days[2].date.getMonth()).toBe(3);
    expect(days[2].date.getHours()).toBe(0);
  });

  it("labels days relative to today", () => {
    expect(reviewSchedule(today).map((day) => day.label)).toEqual([
      "today",
      "in 3 days",
      "in 10 days",
      "in 31 days",
      "in 91 days",
      "in 271 days",
    ]);
  });
});
