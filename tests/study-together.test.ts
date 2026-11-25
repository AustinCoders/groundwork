import { describe, expect, it } from "vitest";
import {
  callLinkProblem,
  noteHref,
  noteText,
  readGroups,
  readNotes,
  readPeer,
  readPreview,
  readScore,
} from "@/lib/account/social";
import { heatOn, pairStreak } from "@/lib/profile/buddy";
import { dailyDone, dailyFor, readPick, readSavedDaily, type DailyPick } from "@/lib/profile/daily";
import { sanitizeSolvedOn } from "@/lib/storage";
import {
  CHALLENGES,
  challengeCount,
  challengeFor,
  challengeState,
  readCardChallenge,
  sanitizeWins,
  weekDays,
  weekEnds,
  weekStart,
} from "@/lib/profile/weekly";

const UUID = "0b5f7a52-3c1e-4a8e-9d2f-6f1b2c3d4e5f";
const face = { username: "ravi-k", name: "Ravi", level: 3, streak: 4, heat: [1, 0, 2], heatEnd: "2026-11-25" };

describe("weeks and challenges", () => {
  it("starts weeks on Monday", () => {
    expect(weekStart("2026-11-25")).toBe("2026-11-23");
    expect(weekStart("2026-11-23")).toBe("2026-11-23");
    expect(weekStart("2026-11-29")).toBe("2026-11-23");
    expect(weekStart("2026-11-30")).toBe("2026-11-30");
    expect(weekDays("2026-11-23")).toHaveLength(7);
    expect(weekDays("2026-11-23")[6]).toBe("2026-11-29");
    expect(weekEnds("2026-11-23", "2026-11-29")).toBe(1);
  });

  it("gives everyone the same challenge in a week and changes it next week", () => {
    expect(challengeFor("2026-11-23").id).toBe(challengeFor("2026-11-23").id);
    const ids = new Set(
      Array.from(
        { length: CHALLENGES.length },
        (_, i) =>
          challengeFor(
            weekStart(
              `2026-${String(1 + Math.floor((i * 7) / 28)).padStart(2, "0")}-${String(1 + ((i * 7) % 28)).padStart(2, "0")}`
            )
          ).id
      )
    );
    expect(ids.size).toBeGreaterThan(1);
  });

  it("counts each kind of challenge from this week only", () => {
    const input = {
      activity: { "2026-11-22": 9, "2026-11-23": 2, "2026-11-24": 0, "2026-11-25": 3 },
      chapterTimes: [new Date(2026, 10, 24, 10).getTime(), new Date(2026, 10, 20, 10).getTime()],
      solvedOn: { a: "2026-11-23", b: "2026-11-25", c: "2026-11-01" },
    };
    const byMetric = (metric: string) => CHALLENGES.find((c) => c.metric === metric)!;
    expect(challengeCount(byMetric("days"), "2026-11-23", input)).toBe(2);
    expect(challengeCount(byMetric("total"), "2026-11-23", input)).toBe(5);
    expect(challengeCount(byMetric("exercises"), "2026-11-23", input)).toBe(2);
    expect(challengeCount(byMetric("chapters"), "2026-11-23", input)).toBe(1);
    const state = challengeState("2026-11-25", input);
    expect(state.week).toBe("2026-11-23");
    expect(state.done).toBe(state.count >= state.challenge.target);
  });

  it("keeps only real wins and reads friends' cards for this week only", () => {
    expect(sanitizeWins({ "2026-11-23": "read-10", "2026-11-16": "nope", bad: "read-10" })).toEqual({
      "2026-11-23": "read-10",
    });
    expect(readCardChallenge({ week: "2026-11-23", id: "read-10", count: 4 }, "2026-11-23")?.target).toBe(10);
    expect(readCardChallenge({ week: "2026-11-16", id: "read-10", count: 4 }, "2026-11-23")).toBeNull();
    expect(readCardChallenge({ week: "2026-11-23", id: "hack", count: 4 }, "2026-11-23")).toBeNull();
  });
});

describe("the daily problem", () => {
  const pool: DailyPick[] = ["b", "a", "c", "d"].map((id) => ({
    id,
    title: id.toUpperCase(),
    level: "beginner",
    href: `/problems/${id}`,
  }));

  it("picks the same problem for a day whatever order the pool is in", () => {
    expect(dailyFor("2026-11-25", pool)?.id).toBe(dailyFor("2026-11-25", [...pool].reverse())?.id);
    expect(dailyFor("2026-11-25", [])).toBeNull();
    const days = Array.from({ length: 20 }, (_, i) => dailyFor(`2026-12-${String(i + 1).padStart(2, "0")}`, pool)?.id);
    expect(new Set(days).size).toBeGreaterThan(1);
  });

  it("is done only when solved on that day", () => {
    const pick = pool[0];
    expect(dailyDone(pick, { b: "2026-11-25" }, "2026-11-25")).toBe(true);
    expect(dailyDone(pick, { b: "2026-11-24" }, "2026-11-25")).toBe(false);
    expect(dailyDone(null, {}, "2026-11-25")).toBe(false);
  });

  it("only trusts a pick that points at its own problem page", () => {
    expect(readPick({ id: "two-sum", title: "Two sum", level: "beginner", href: "/problems/two-sum" })).not.toBeNull();
    expect(readPick({ id: "two-sum", title: "Two sum", level: "beginner", href: "https://evil.test" })).toBeNull();
    expect(readPick({ id: "../x", title: "x", level: "beginner", href: "/problems/../x" })).toBeNull();
    expect(
      readSavedDaily({ day: "2026-11-24", id: "a", title: "A", level: "beginner", href: "/problems/a" }, "2026-11-25")
    ).toBeNull();
  });

  it("keeps the solved-on log small and clean", () => {
    const many = Object.fromEntries(Array.from({ length: 500 }, (_, i) => [`ex-${i}`, "2026-11-25"]));
    expect(Object.keys(sanitizeSolvedOn(many))).toHaveLength(400);
    expect(sanitizeSolvedOn({ a: "yesterday", b: "2026-11-25", ["__proto__"]: "2026-11-25" })).toEqual({
      b: "2026-11-25",
    });
  });
});

describe("study buddies", () => {
  it("reads a friend's day from the end of their calendar", () => {
    expect(heatOn(face, "2026-11-25")).toBe(2);
    expect(heatOn(face, "2026-11-24")).toBe(0);
    expect(heatOn(face, "2026-11-23")).toBe(1);
    expect(heatOn(face, "2026-11-26")).toBe(0);
    expect(heatOn({ heat: [5], heatEnd: "" }, "2026-11-25")).toBe(0);
  });

  it("counts days in a row you both studied, today or up to yesterday", () => {
    const theirs = { heat: [1, 1, 1, 0], heatEnd: "2026-11-25" };
    expect(pairStreak({ "2026-11-22": 1, "2026-11-23": 1, "2026-11-24": 1 }, theirs, "2026-11-25")).toBe(3);
    expect(pairStreak({ "2026-11-23": 1, "2026-11-24": 1 }, theirs, "2026-11-25")).toBe(2);
    expect(pairStreak({ "2026-11-24": 1, "2026-11-25": 4 }, theirs, "2026-11-25")).toBe(1);
    expect(pairStreak({}, theirs, "2026-11-25")).toBe(0);
  });
});

describe("notifications", () => {
  it("keeps known kinds, links to the right place and drops the rest", () => {
    const list = readNotes({
      unread: 300,
      items: [
        {
          id: 1,
          kind: "request",
          at: "2026-11-25T10:00:00Z",
          read: false,
          actor: { username: "ravi-k", name: "Ravi" },
        },
        {
          id: 2,
          kind: "mock_invite",
          ref: UUID,
          at: "2026-11-25T09:00:00Z",
          actor: { username: "meera", name: "Meera" },
        },
        { id: 3, kind: "group_joined", ref: "not-a-uuid", at: "2026-11-25T08:00:00Z", actor: null },
        { id: 4, kind: "hack", at: "2026-11-25T08:00:00Z" },
        { id: "5", kind: "request", at: "2026-11-25T08:00:00Z" },
      ],
    });
    expect(list.unread).toBe(99);
    expect(list.items.map((n) => n.id)).toEqual([1, 2, 3]);
    expect(noteText(list.items[0])).toBe("Ravi wants to connect");
    expect(noteHref(list.items[1])).toBe(`/mock/peer/${UUID}`);
    expect(noteHref(list.items[2])).toBe("/groups");
    expect(noteText(list.items[2])).toMatch(/^Someone /);
  });
});

describe("groups and mock interviews", () => {
  it("reads groups and previews defensively", () => {
    const groups = readGroups([
      {
        id: UUID,
        name: "React prep",
        role: "owner",
        code: "abcdefgh23",
        count: 3,
        members: [{ ...face, me: true }],
        pending: [],
      },
      { id: "bad", name: "x", role: "owner" },
      { id: UUID, name: "y", role: "king" },
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].members[0].me).toBe(true);
    expect(readGroups([{ id: UUID, name: "z", role: "member", code: "<script>" }])[0].code).toBeNull();
    expect(readPreview({ status: "found", id: UUID, name: "G", mine: "boss", count: 99 })).toMatchObject({
      mine: "none",
      count: 20,
    });
  });

  it("accepts only call links from known meeting services", () => {
    expect(callLinkProblem("https://meet.google.com/abc-defg-hij")).toBeNull();
    expect(callLinkProblem("https://us02web.zoom.us/j/123")).toBeNull();
    expect(callLinkProblem("https://meet.jit.si/groundwork-mock")).toBeNull();
    expect(callLinkProblem("http://meet.google.com/abc")).not.toBeNull();
    expect(callLinkProblem("https://meet.google.com.evil.test/abc")).not.toBeNull();
    expect(callLinkProblem("https://evil.test/?u=https://meet.google.com/")).not.toBeNull();
    expect(callLinkProblem("")).toMatch(/Paste/);
  });

  it("reads a mock and its scorecard, and refuses a broken scorecard", () => {
    const score = {
      ratings: { understanding: 4, technical: 3, problem: 5, communication: 2 },
      verdict: "yes",
      strengths: "Clear",
      improve: "Slow down",
    };
    const mock = readPeer({
      id: UUID,
      at: "2026-11-26T10:00:00Z",
      minutes: 45,
      topic: "react",
      link: "https://meet.google.com/abc-defg-hij",
      status: "accepted",
      interviewer: false,
      score,
      scored: true,
      other: face,
    });
    expect(mock?.score?.verdict).toBe("yes");
    expect(mock?.other?.username).toBe("ravi-k");
    expect(readPeer({ id: UUID, at: "x", topic: "react", status: "accepted" })).toBeNull();
    expect(
      readPeer({
        id: UUID,
        at: "2026-11-26T10:00:00Z",
        topic: "react",
        status: "accepted",
        link: "javascript:alert(1)",
      })?.link
    ).toBeNull();
    expect(readScore({ ...score, ratings: { ...score.ratings, technical: 9 } })).toBeNull();
    expect(readScore({ ...score, verdict: "hire them now" })).toBeNull();
  });
});
