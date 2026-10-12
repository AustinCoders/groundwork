import { afterEach, describe, expect, it, vi } from "vitest";
import {
  BADGE_GOALS,
  badgeStanding,
  badgeWall,
  buildHeat,
  confidenceCounts,
  dayDate,
  heatLevel,
  keepGoingWith,
  nextBadge,
  nextSteps,
  topicRows,
  weekTotal,
  xpPercent,
  xpToGo,
  XP_PER,
  type DayCount,
  type TopicTrack,
} from "@/app/progress/progressModel";
import { BADGES, computeStats, earnedBadges, type Stats } from "@/lib/gamification";

const ZERO: Stats = {
  exercisesSolved: 0,
  chaptersRead: 0,
  totalReviews: 0,
  streak: 0,
  bestStreak: 0,
  activeDays: 0,
  xp: 0,
  level: 1,
  xpIntoLevel: 0,
  xpForNextLevel: 25,
};

const track = (id: string, ids: string[]): TopicTrack => ({
  id,
  name: id.toUpperCase(),
  mark: id,
  accent: "blue",
  href: `/${id}`,
  ids,
});

const days = (counts: number[], start = "2026-10-05"): DayCount[] =>
  counts.map((count, k) => {
    const date = dayDate(start);
    date.setDate(date.getDate() + k);
    const key = [date.getFullYear(), date.getMonth() + 1, date.getDate()]
      .map((n) => String(n).padStart(2, "0"))
      .join("-");
    return { day: key, count };
  });

function storageWith(entries: Record<string, unknown>) {
  const raw = new Map(Object.entries(entries).map(([key, value]) => [key, JSON.stringify(value)]));
  vi.stubGlobal("window", {});
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => raw.get(key) ?? null,
    setItem: (key: string, value: string) => void raw.set(key, value),
    removeItem: (key: string) => void raw.delete(key),
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("the progress model", () => {
  it("states the XP weights the stats really use", () => {
    storageWith({
      "jsnotes:progress": {
        chapters: { a: { at: 1, reviews: 2 }, b: true },
        exercises: { x: true, y: true, z: true },
      },
    });
    const stats = computeStats();
    expect(stats.xp).toBe(3 * XP_PER.exercise + 2 * XP_PER.chapter + 2 * XP_PER.review);
  });

  it("counts XP to go and the meter percentage from the stats", () => {
    expect(xpToGo({ ...ZERO, xpIntoLevel: 62, xpForNextLevel: 75 })).toBe(13);
    expect(xpToGo(ZERO)).toBe(25);
    expect(xpPercent({ ...ZERO, xpIntoLevel: 50, xpForNextLevel: 100 })).toBe(50);
    expect(xpPercent({ ...ZERO, xpIntoLevel: 5, xpForNextLevel: 0 })).toBe(100);
  });

  it("buckets days into five heat levels", () => {
    expect([0, 1, 2, 3, 4, 6, 7, 40].map(heatLevel)).toEqual([0, 1, 2, 2, 3, 3, 4, 4]);
  });

  it("builds weeks that start on the right weekday, pads the first, and names the months", () => {
    const run = days(
      Array.from({ length: 70 }, (_, k) => (k % 3 === 0 ? 2 : 0)),
      "2026-10-07"
    );
    const heat = buildHeat(run);
    expect(dayDate("2026-10-07").getDay()).toBe(3);
    expect(heat.weeks[0].slice(0, 3)).toEqual([null, null, null]);
    expect(heat.weeks[0][3]?.day).toBe("2026-10-07");
    expect(heat.weeks.slice(0, -1).every((week) => week.length === 7)).toBe(true);
    expect(heat.total).toBe(run.reduce((n, d) => n + d.count, 0));
    expect(heat.active).toBe(run.filter((d) => d.count > 0).length);
    expect(heat.months.map((m) => m.label)).toContain("Oct");
    expect(buildHeat([])).toEqual({ weeks: [], months: [], active: 0, total: 0 });
  });

  it("totals the last seven days", () => {
    expect(weekTotal(days([9, 9, 1, 2, 3, 4, 5, 6, 7]))).toBe(1 + 2 + 3 + 4 + 5 + 6 + 7);
  });

  it("counts chapters read per topic and picks the one furthest along that is not finished", () => {
    const tracks = [track("js", ["a", "b", "c", "d"]), track("react", ["r1", "r2"]), track("git", ["g1", "g2"])];
    const rows = topicRows(tracks, new Set(["a", "b", "r1", "r2", "x"]));
    expect(rows.map((r) => [r.n, r.pct])).toEqual([
      [2, 50],
      [2, 100],
      [0, 0],
    ]);
    expect(keepGoingWith(rows)?.id).toBe("js");
    expect(keepGoingWith(topicRows(tracks, new Set()))).toBeUndefined();
  });

  it("counts interview marks by kind", () => {
    expect(confidenceCounts({ a: "knew", b: "shaky", c: "blank", d: "knew", e: "other" })).toEqual({
      knew: 2,
      shaky: 1,
      blank: 1,
    });
  });

  it("offers the review step only when something is due and always the other two", () => {
    const rows = topicRows([track("js", ["a", "b"])], new Set(["a"]));
    const none = nextSteps(0, undefined, { knew: 0, shaky: 0, blank: 0 });
    expect(none.map((s) => s.key)).toEqual(["continue", "interview"]);
    expect(none[0]).toMatchObject({ title: "Start a topic", href: "/", action: "Pick one →" });
    expect(none[1]).toMatchObject({ title: "Drill interview questions", href: "/interview/questions" });

    const all = nextSteps(3, keepGoingWith(rows), { knew: 5, shaky: 2, blank: 1 });
    expect(all.map((s) => s.key)).toEqual(["review", "continue", "interview"]);
    expect(all[0].title).toBe("3 chapters due for review");
    expect(all[1]).toMatchObject({ title: "Keep going with JS", body: "1 of 2 read so far.", href: "/js" });
    expect(all[2]).toMatchObject({ title: "3 weak interview answers", href: "/interview/questions?filter=shaky" });
    expect(nextSteps(1, undefined, { knew: 0, shaky: 1, blank: 0 })[0].title).toBe("1 chapter due for review");
    expect(nextSteps(0, undefined, { knew: 0, shaky: 1, blank: 0 })[1].title).toBe("1 weak interview answer");
  });

  it("knows a goal for every badge and agrees with the badge rules at the threshold", () => {
    expect(Object.keys(BADGE_GOALS).sort()).toEqual(BADGES.map((b) => b.id).sort());
    for (const badge of BADGES) {
      const goal = BADGE_GOALS[badge.id];
      const at: Stats = { ...ZERO, [goal.stat]: goal.need };
      const below: Stats = { ...ZERO, [goal.stat]: goal.need - 1 };
      expect(badge.earned(at), `${badge.id} at ${goal.need}`).toBe(true);
      expect(badge.earned(below), `${badge.id} at ${goal.need - 1}`).toBe(false);
      expect(badgeStanding(badge, at).ratio).toBe(1);
    }
  });

  it("reports how far a badge is, as a label and a ratio", () => {
    const stats = { ...ZERO, exercisesSolved: 7, level: 3, bestStreak: 1 };
    const byId = (id: string) => BADGES.find((b) => b.id === id)!;
    expect(badgeStanding(byId("solve-10"), stats)).toMatchObject({ ratio: 0.7, label: "7 of 10 exercises" });
    expect(badgeStanding(byId("first-solve"), stats).label).toBe("1 of 1 exercise");
    expect(badgeStanding(byId("level-5"), stats)).toMatchObject({ ratio: 0.5, label: "level 3 of 5" });
    expect(badgeStanding(byId("streak-3"), stats).label).toBe("1 of 3 days");
  });

  it("picks the nearest unearned badge, the first one when nothing is started, and none when all are earned", () => {
    expect(nextBadge(ZERO, new Set())?.id).toBe("first-solve");
    const stats = { ...ZERO, exercisesSolved: 9, chaptersRead: 3 };
    const earned = new Set(earnedBadges(stats).map((b) => b.id));
    expect(nextBadge(stats, earned)?.id).toBe("solve-10");
    expect(nextBadge(ZERO, new Set(BADGES.map((b) => b.id)))).toBeNull();
  });

  it("lists earned badges first and keeps the rest in order", () => {
    const wall = badgeWall(new Set(["solve-50", "first-solve"]));
    expect(wall.slice(0, 2).map((b) => b.id)).toEqual(["first-solve", "solve-50"]);
    expect(wall).toHaveLength(BADGES.length);
  });

  it("reads a day key as a local date", () => {
    const date = dayDate("2026-01-31");
    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2026, 0, 31]);
  });
});
