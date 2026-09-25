import { describe, expect, it } from "vitest";
import { bandFor, heatmap, nextUp, readiness, streak, trends } from "@/lib/mock/readiness";
import type { HistoryEntry } from "@/lib/mock/storage";
import type { StageId } from "@/lib/mock/types";

const DAY = 86_400_000;
const NOW = new Date(2026, 8, 25, 18).getTime();

function entry(daysAgo: number, stages: [StageId, number[]][], id = String(daysAgo)): HistoryEntry {
  return {
    id,
    mode: "loop",
    config: { role: "fullstack", seniority: "mid", company: "product", intensity: "quick" },
    startedAt: NOW - daysAgo * DAY - 3_600_000,
    finishedAt: NOW - daysAgo * DAY,
    stages: stages.map(([stage, scores]) => ({ stage, core: false, scores })),
    verdict: "hire",
    headline: "",
    level: "at",
    score: 0.7,
    questions: 3,
    timedOut: 0,
    skipped: 0,
  };
}

describe("readiness", () => {
  it("weights recent sessions more than old ones", () => {
    const r = readiness([entry(60, [["javascript", [0.2]]]), entry(0, [["javascript", [0.9]]])], NOW)!;
    expect(r.competencies[0].score).toBeGreaterThan(0.8);
    expect(r.band).toBe("strong");
  });

  it("puts the weakest competency first", () => {
    const r = readiness(
      [
        entry(1, [
          ["javascript", [0.9]],
          ["design", [0.3]],
        ]),
      ],
      NOW
    )!;
    expect(r.competencies[0].competency).toBe("design");
    expect(bandFor(r.score)).toBe("getting-there");
  });

  it("returns nothing before the first session", () => {
    expect(readiness([], NOW)).toBeNull();
  });
});

describe("the dashboard's charts", () => {
  const history = [
    entry(
      2,
      [
        ["javascript", [0.5]],
        ["coding", [0.4]],
      ],
      "a"
    ),
    entry(0, [["javascript", [0.8]]], "b"),
  ];

  it("tracks each competency over sessions, oldest first", () => {
    expect(trends(history).javascript?.map((p) => p.score)).toEqual([0.5, 0.8]);
  });

  it("lays stages against sessions, leaving gaps where a stage was not run", () => {
    const h = heatmap(history);
    expect(h.sessions.map((s) => s.id)).toEqual(["a", "b"]);
    expect(h.rows.find((r) => r.stage === "coding")?.cells).toEqual([0.4, null]);
  });
});

describe("streaks", () => {
  it("counts consecutive days up to today or yesterday", () => {
    const s = streak([entry(0, []), entry(1, []), entry(2, []), entry(5, [])], NOW);
    expect(s.current).toBe(3);
    expect(s.best).toBe(3);
    expect(s.lastFortnight.filter(Boolean)).toHaveLength(4);
    expect(streak([entry(3, [])], NOW).current).toBe(0);
  });
});

describe("what to practise next", () => {
  it("points at the weakest stage of the weakest competency", () => {
    const pick = nextUp(
      [
        entry(1, [
          ["javascript", [0.9]],
          ["design", [0.3]],
        ]),
      ],
      NOW,
      ["javascript", "design", "coding"]
    );
    expect(pick?.stage).toBe("design");
  });

  it("suggests an untried round once everything tried is strong", () => {
    const pick = nextUp([entry(1, [["javascript", [0.9]]])], NOW, ["javascript", "coding"]);
    expect(pick?.stage).toBe("coding");
  });
});
