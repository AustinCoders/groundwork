import { describe, expect, it } from "vitest";
import { hopFacts } from "@/lib/homeFacts";

const counts = { topics: 6, chapters: 227, steps: 4, paths: 3, stages: 4, answers: 8 };

describe("hopFacts", () => {
  it("names one fact per connector in the order of the sections", () => {
    expect(hopFacts(counts)).toEqual([
      "6 topics written",
      "227 chapters",
      "4 steps",
      "3 paths",
      "4 stages",
      "8 answers",
    ]);
  });

  it("uses the singular for exactly one", () => {
    expect(hopFacts({ topics: 1, chapters: 1, steps: 1, paths: 1, stages: 1, answers: 1 })).toEqual([
      "1 topic written",
      "1 chapter",
      "1 step",
      "1 path",
      "1 stage",
      "1 answer",
    ]);
  });
});
