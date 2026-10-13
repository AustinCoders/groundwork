import { describe, expect, it } from "vitest";
import { LEVEL_STOPS, levelStop, levelTone } from "@/components/placement/levelTone";
import { STAGE_TONES } from "@/components/topic/shell/model";
import type { LevelId } from "@/content/types";

const LEVELS: LevelId[] = ["beginner", "intermediate", "advanced"];

describe("levelTone", () => {
  it("gives each level the colour its stop has on the topic home", () => {
    LEVELS.forEach((level, index) => expect(levelTone(level)).toBe(STAGE_TONES[index]));
  });

  it("uses a different colour for every level", () => {
    expect(new Set(LEVELS.map(levelTone)).size).toBe(LEVELS.length);
  });
});

describe("levelStop", () => {
  it("counts the stop from one and ends at the number of levels", () => {
    expect(LEVELS.map(levelStop)).toEqual([1, 2, 3]);
    expect(levelStop("advanced")).toBe(LEVEL_STOPS);
  });
});
