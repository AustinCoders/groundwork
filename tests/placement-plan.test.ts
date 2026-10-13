import { describe, expect, it } from "vitest";
import {
  isFirstTime,
  levelWords,
  pickLevelPath,
  planMeaning,
  planSummary,
  planView,
  readingPlan,
  type PlanChapter,
} from "@/lib/placementPlan";
import { topicHome } from "@/lib/topics";
import { nextChapter } from "@/lib/completion";
import type { PlacementRecord } from "@/lib/placementRecord";

function chapter(id: string, level: PlanChapter["level"], ready = true): PlanChapter {
  return { id, num: id, short: id, level, prerequisites: [], minutes: 5, ready };
}

const chapters = [
  chapter("a", "beginner"),
  chapter("b", "beginner"),
  chapter("c", "beginner", false),
  chapter("d", "intermediate"),
  chapter("e", "intermediate"),
  chapter("f", "advanced"),
];

function record(overrides: Partial<PlacementRecord> = {}): PlacementRecord {
  return {
    mode: "quiz",
    level: "intermediate",
    stages: [],
    testedOut: [],
    allotted: ["d", "e", "f"],
    takenAt: 1,
    seconds: 0,
    ...overrides,
  };
}

const ids = (list: PlanChapter[]) => list.map((entry) => entry.id);

describe("planView", () => {
  it("lists chapters below the level under reviseEarlier and keeps them out of the plan", () => {
    const view = planView(record(), chapters);
    expect(ids(view.allotted)).toEqual(["d", "e", "f"]);
    expect(ids(view.reviseEarlier)).toEqual(["a", "b"]);
    expect(view.testedOut).toEqual([]);
  });

  it("puts tested-out chapters apart and out of the other lists", () => {
    const view = planView(record({ testedOut: ["a", "d"], allotted: ["e", "f"] }), chapters);
    expect(ids(view.testedOut)).toEqual(["a", "d"]);
    expect(ids(view.allotted)).toEqual(["e", "f"]);
    expect(ids(view.reviseEarlier)).toEqual(["b"]);
  });

  it("allots a lower chapter the reader missed", () => {
    const view = planView(record({ allotted: ["b", "d", "e", "f"] }), chapters);
    expect(ids(view.allotted)).toEqual(["b", "d", "e", "f"]);
    expect(ids(view.reviseEarlier)).toEqual(["a"]);
  });

  it("leaves out outlines and ids the curriculum no longer has", () => {
    const view = planView(record({ allotted: ["ghost", "d"], testedOut: ["gone"] }), chapters);
    const every = [...view.allotted, ...view.testedOut, ...view.reviseEarlier];
    expect(ids(every)).not.toContain("c");
    expect(ids(every)).not.toContain("ghost");
    expect(ids(every)).not.toContain("gone");
  });

  it("allots a chapter at or above the level that the record does not mention", () => {
    const view = planView(record({ allotted: ["d"] }), chapters);
    expect(ids(view.allotted)).toEqual(["d", "e", "f"]);
  });

  it("allots everything when the reader starts from the beginning", () => {
    const view = planView(record({ mode: "beginning", level: "beginner", allotted: [] }), chapters);
    expect(ids(view.allotted)).toEqual(["a", "b", "d", "e", "f"]);
    expect(view.reviseEarlier).toEqual([]);
  });

  it("covers every ready chapter exactly once", () => {
    const view = planView(record({ testedOut: ["b"], allotted: ["a", "e"] }), chapters);
    const all = [...view.allotted, ...view.testedOut, ...view.reviseEarlier];
    expect(ids(all).sort()).toEqual(["a", "b", "d", "e", "f"]);
  });
});

describe("readingPlan", () => {
  it("is null with no placement", () => {
    expect(readingPlan(null, chapters)).toBeNull();
  });

  it("carries the tested-out and allotted ids of the written chapters", () => {
    expect(readingPlan(record({ testedOut: ["a"], allotted: ["d"] }), chapters)).toEqual({
      testedOut: ["a"],
      allotted: ["d", "e", "f"],
    });
  });

  it("allots by level when the record names no chapters, as the plan page does", () => {
    const plan = readingPlan(record({ mode: "self", allotted: [] }), chapters);
    expect(plan?.allotted).toEqual(["d", "e", "f"]);
    expect(plan?.testedOut).toEqual([]);
  });
});

describe("the chapter a reader is sent to", () => {
  const written = chapters.filter((entry) => entry.ready);
  const first = (rec: PlacementRecord | null, done: string[] = []) =>
    nextChapter("quiz", written, new Set(done), readingPlan(rec, chapters), true)?.id ?? null;

  it("starts a self placement at its level for every level", () => {
    expect(first(record({ mode: "self", level: "beginner", allotted: [] }))).toBe("a");
    expect(first(record({ mode: "self", level: "intermediate", allotted: [] }))).toBe("d");
    expect(first(record({ mode: "self", level: "advanced", allotted: [] }))).toBe("f");
  });

  it("agrees with the first chapter of the plan list", () => {
    for (const level of ["beginner", "intermediate", "advanced"] as const) {
      const rec = record({ mode: "self", level, allotted: [] });
      expect(first(rec)).toBe(planView(rec, chapters).allotted[0].id);
    }
  });

  it("skips tested-out chapters and chapters to revise earlier", () => {
    const rec = record({ testedOut: ["d"], allotted: ["e", "f"] });
    expect(first(rec)).toBe("e");
    expect(first(rec, ["e"])).toBe("f");
  });

  it("starts a reader who began from the beginning at the first chapter", () => {
    expect(first(record({ mode: "beginning", level: "beginner", allotted: [] }))).toBe("a");
  });

  it("walks the plain order with no placement", () => {
    expect(first(null)).toBe("a");
    expect(first(null, ["a"])).toBe("b");
  });

  it("returns nothing once every chapter in the plan is read, even with chapters to revise left", () => {
    expect(first(record({ mode: "self", allotted: [] }), ["d", "e", "f"])).toBeNull();
    expect(first(null, ["a", "b", "d", "e", "f"])).toBeNull();
  });
});

describe("planSummary", () => {
  it("names only the groups that have chapters", () => {
    expect(planSummary(planView(record(), chapters))).toBe("3 to read · 2 to revise earlier");
    expect(planSummary(planView(record({ testedOut: ["d"], allotted: ["e", "f"] }), chapters))).toBe(
      "2 to read · 1 tested out · 2 to revise earlier"
    );
    expect(planSummary(planView(record({ mode: "beginning", level: "beginner" }), chapters))).toBe("5 to read");
  });
});

describe("levelWords and isFirstTime", () => {
  it("names a level from the topic's names", () => {
    expect(levelWords("advanced", { beginner: "Basics", intermediate: "Middle", advanced: "Deep" })).toBe("Deep");
  });

  it("is first time only with no placement and no marks", () => {
    expect(isFirstTime(null, false)).toBe(true);
    expect(isFirstTime(null, true)).toBe(false);
    expect(isFirstTime(record(), false)).toBe(false);
  });
});

describe("where a topic lives", () => {
  it("puts a quiz topic's home on its level page and every other topic on its cover", () => {
    expect(topicHome("dsa")).toBe("/level/dsa");
    expect(topicHome("js")).toBe("/notes");
    expect(topicHome("react")).toBe("/react");
  });

  it("points the pick-a-level door at the picker on that page", () => {
    expect(pickLevelPath("dsa")).toBe("/level/dsa#pick-level");
  });
});

describe("planMeaning", () => {
  it("says in one sentence what a quiz level means and mentions Revise earlier only when it has chapters", () => {
    const placed = record({ level: "intermediate" });
    const withRevise = planMeaning(placed, planView(placed, chapters), "Intermediate");
    expect(withRevise).toContain("middle stop");
    expect(withRevise).toContain("Revise earlier");
    const first = record({ level: "beginner", allotted: [] });
    const without = planMeaning(first, planView(first, chapters), "Beginner");
    expect(without).toContain("first chapters");
    expect(without).not.toContain("Revise earlier");
  });

  it("names the chosen level for a reader who picked one and the first chapter for one who started from the beginning", () => {
    const picked = record({ mode: "self", level: "advanced", allotted: [] });
    expect(planMeaning(picked, planView(picked, chapters), "Advanced")).toContain("from Advanced on");
    const beginning = record({ mode: "beginning", level: "beginner", allotted: ["a", "b", "d", "e", "f"] });
    expect(planMeaning(beginning, planView(beginning, chapters), "Beginner")).toContain("from a");
  });

  it("never mentions a score", () => {
    const placed = record();
    expect(planMeaning(placed, planView(placed, chapters), "Intermediate")).not.toMatch(/score|correct|\d+ of \d+/i);
  });
});
