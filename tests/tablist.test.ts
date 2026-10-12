import { describe, expect, it } from "vitest";
import { nextTab } from "@/lib/tablist";

describe("nextTab", () => {
  it("steps forward and back and wraps at both ends", () => {
    expect(nextTab("ArrowDown", 0, 4)).toBe(1);
    expect(nextTab("ArrowRight", 3, 4)).toBe(0);
    expect(nextTab("ArrowUp", 0, 4)).toBe(3);
    expect(nextTab("ArrowLeft", 2, 4)).toBe(1);
  });

  it("jumps to the ends with Home and End", () => {
    expect(nextTab("Home", 2, 4)).toBe(0);
    expect(nextTab("End", 0, 4)).toBe(3);
  });

  it("ignores other keys and an empty list", () => {
    expect(nextTab("Enter", 1, 4)).toBe(-1);
    expect(nextTab("ArrowDown", 0, 0)).toBe(-1);
  });

  it("advances one step per press when each press starts from the last target", () => {
    let target = 0;
    for (let press = 0; press < 3; press++) target = nextTab("ArrowDown", target, 4);
    expect(target).toBe(3);
  });
});
