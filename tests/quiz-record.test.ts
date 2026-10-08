import { describe, expect, it } from "vitest";
import {
  applyAttempt,
  applyMarkedAnyway,
  applyPass,
  applyUnmark,
  checkStatus,
  EMPTY_RECORD,
  sanitizeRecord,
  type QuizRecord,
} from "@/lib/quizRecord";

const passed: QuizRecord = {
  attempts: 3,
  best: 5,
  lastAt: 300,
  passedAt: 300,
  markedAnyway: false,
  missed: ["q1"],
};

describe("recording an attempt", () => {
  it("starts from nothing", () => {
    const record = applyAttempt(undefined, { score: 3, missed: ["a", "b"], at: 100 });
    expect(record).toEqual({
      attempts: 1,
      best: 3,
      lastAt: 100,
      passedAt: null,
      markedAnyway: false,
      missed: ["a", "b"],
    });
  });

  it("counts attempts, keeps the best score and replaces the missed ids with the latest", () => {
    const first = applyAttempt(undefined, { score: 4, missed: ["a"], at: 100 });
    const second = applyAttempt(first, { score: 2, missed: ["b", "c"], at: 200 });
    expect(second.attempts).toBe(2);
    expect(second.best).toBe(4);
    expect(second.lastAt).toBe(200);
    expect(second.missed).toEqual(["b", "c"]);
  });

  it("does not change the record it was given", () => {
    const before = structuredClone(passed);
    applyAttempt(passed, { score: 1, missed: [], at: 9 });
    applyPass(passed, 9);
    applyMarkedAnyway(passed);
    applyUnmark(passed);
    expect(passed).toEqual(before);
    expect(EMPTY_RECORD.attempts).toBe(0);
  });
});

describe("passing, marking anyway and unmarking", () => {
  it("a pass sets the time and clears the marked-anyway flag", () => {
    const record = applyPass({ ...passed, passedAt: null, markedAnyway: true }, 500);
    expect(record.passedAt).toBe(500);
    expect(record.markedAnyway).toBe(false);
  });

  it("marking anyway sets the flag and drops an older pass", () => {
    const record = applyMarkedAnyway(passed);
    expect(record.markedAnyway).toBe(true);
    expect(record.passedAt).toBeNull();
    expect(record.attempts).toBe(3);
  });

  it("marking anyway works with no record at all", () => {
    expect(applyMarkedAnyway(undefined)).toMatchObject({ markedAnyway: true, passedAt: null, attempts: 0 });
  });

  it("unmarking clears the pass and the flag but keeps attempts, best and missed", () => {
    expect(applyUnmark(passed)).toEqual({ ...passed, passedAt: null, markedAnyway: false });
    expect(applyUnmark({ ...passed, passedAt: null, markedAnyway: true })).toMatchObject({
      markedAnyway: false,
      attempts: 3,
      best: 5,
      missed: ["q1"],
    });
  });

  it("unmarking nothing leaves nothing", () => {
    expect(applyUnmark(undefined)).toBeUndefined();
  });
});

describe("the check status", () => {
  it("is unread whenever the chapter is not read, whatever the record says", () => {
    expect(checkStatus(false, undefined)).toBe("unread");
    expect(checkStatus(false, passed)).toBe("unread");
    expect(checkStatus(false, applyMarkedAnyway(passed))).toBe("unread");
  });

  it("is read before checks for a read chapter with no record or no pass", () => {
    expect(checkStatus(true, undefined)).toBe("read-before-checks");
    expect(checkStatus(true, applyAttempt(undefined, { score: 2, missed: [], at: 1 }))).toBe("read-before-checks");
  });

  it("is passed after a pass and not checked after marking anyway", () => {
    expect(checkStatus(true, passed)).toBe("passed");
    expect(checkStatus(true, applyMarkedAnyway(undefined))).toBe("not-checked");
  });

  it("cannot show a stale checked after an unmark", () => {
    expect(checkStatus(true, applyUnmark(passed))).toBe("read-before-checks");
  });
});

describe("cleaning a saved record", () => {
  it("keeps a good record as it is", () => {
    expect(sanitizeRecord(passed)).toEqual(passed);
  });

  it("repairs bad fields", () => {
    expect(
      sanitizeRecord({ attempts: -2, best: "x", lastAt: 0, passedAt: NaN, markedAnyway: "yes", missed: ["a", 3, null] })
    ).toEqual({ attempts: 0, best: 0, lastAt: null, passedAt: null, markedAnyway: false, missed: ["a"] });
  });

  it("rejects what is not an object", () => {
    for (const value of [null, undefined, 3, "x", [], true]) expect(sanitizeRecord(value)).toBeNull();
  });
});
