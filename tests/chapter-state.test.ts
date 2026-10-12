import { describe, expect, it } from "vitest";
import {
  buildChapterStates,
  chapterState,
  countStates,
  STATE_TEXT,
  summarizeStates,
  type ChapterState,
} from "@/lib/chapterState";
import { EMPTY_RECORD, type QuizRecord } from "@/lib/quizRecord";

const passed: QuizRecord = { ...EMPTY_RECORD, attempts: 1, best: 5, lastAt: 9, passedAt: 9 };
const anyway: QuizRecord = { ...EMPTY_RECORD, markedAnyway: true };
const missedOnly: QuizRecord = { ...EMPTY_RECORD, attempts: 2, best: 2, lastAt: 9, missed: ["q"] };

describe("one chapter's state", () => {
  it("is checked only while the read mark exists", () => {
    expect(chapterState({ done: true, hasCheck: true, record: passed, testedOut: false })).toBe("checked");
    expect(chapterState({ done: false, hasCheck: true, record: passed, testedOut: false })).toBeNull();
  });

  it("is not checked for a chapter marked read anyway", () => {
    expect(chapterState({ done: true, hasCheck: true, record: anyway, testedOut: false })).toBe("not-checked");
  });

  it("is read before checks for a read chapter with no pass and no anyway flag", () => {
    expect(chapterState({ done: true, hasCheck: true, record: undefined, testedOut: false })).toBe(
      "read-before-checks"
    );
    expect(chapterState({ done: true, hasCheck: true, record: missedOnly, testedOut: false })).toBe(
      "read-before-checks"
    );
  });

  it("says nothing about a read chapter that has no check written", () => {
    expect(chapterState({ done: true, hasCheck: false, record: undefined, testedOut: false })).toBeNull();
  });

  it("is tested out only until the chapter is read", () => {
    expect(chapterState({ done: false, hasCheck: true, record: undefined, testedOut: true })).toBe("tested-out");
    expect(chapterState({ done: false, hasCheck: false, record: undefined, testedOut: true })).toBe("tested-out");
    expect(chapterState({ done: true, hasCheck: true, record: passed, testedOut: true })).toBe("checked");
  });

  it("is nothing for an unread chapter that was not tested out", () => {
    expect(chapterState({ done: false, hasCheck: true, record: undefined, testedOut: false })).toBeNull();
  });
});

describe("a seeded mix of chapters", () => {
  const states = buildChapterStates({
    chapterIds: ["a", "b", "c", "d", "e", "f", "g"],
    checkChapterIds: ["a", "b", "c", "d", "e", "g"],
    done: new Set(["a", "b", "c", "f"]),
    records: { a: passed, b: anyway, e: passed },
    testedOut: ["d", "ghost"],
  });

  it("tells every state apart", () => {
    expect(Object.fromEntries(states)).toEqual({
      a: "checked",
      b: "not-checked",
      c: "read-before-checks",
      d: "tested-out",
    });
  });

  it("ignores a stale pass on an unread chapter and a chapter without a check", () => {
    expect(states.has("e")).toBe(false);
    expect(states.has("f")).toBe(false);
    expect(states.has("g")).toBe(false);
    expect(states.has("ghost")).toBe(false);
  });

  it("counts the states over any set of chapters", () => {
    expect(countStates(["a", "b", "c", "d", "e"], states)).toEqual({
      checked: 1,
      "not-checked": 1,
      "read-before-checks": 1,
      "tested-out": 1,
    });
    expect(countStates(["a", "e"], states).checked).toBe(1);
    expect(countStates([], states)).toEqual({
      checked: 0,
      "not-checked": 0,
      "read-before-checks": 0,
      "tested-out": 0,
    });
  });

  it("summarises only the states that occur, in a fixed order", () => {
    expect(summarizeStates(countStates(["d", "c", "a", "a"], states))).toBe(
      "2 checked · 1 read before checks · 1 tested out"
    );
    expect(summarizeStates(countStates(["e", "f"], states))).toBe("");
  });
});

describe("the words", () => {
  it("never claim verification", () => {
    const all = Object.values(STATE_TEXT).join(" ");
    expect(all).not.toMatch(/verified|certified/);
    const names: ChapterState[] = ["checked", "not-checked", "read-before-checks", "tested-out"];
    expect(names.map((name) => STATE_TEXT[name])).toEqual([
      "checked",
      "not checked",
      "read before checks",
      "tested out",
    ]);
  });
});
