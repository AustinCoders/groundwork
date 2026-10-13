import { describe, expect, it } from "vitest";
import {
  isFirstTime,
  levelWords,
  pickLevelPath,
  planSummary,
  planView,
  readingPlan,
  type PlanChapter,
} from "@/lib/placementPlan";
import { topicHome } from "@/lib/topics";
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
    expect(readingPlan(null)).toBeNull();
  });

  it("carries the tested-out and allotted ids", () => {
    expect(readingPlan(record({ testedOut: ["a"], allotted: ["d"] }))).toEqual({ testedOut: ["a"], allotted: ["d"] });
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
