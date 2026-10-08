import { describe, expect, it } from "vitest";
import { pointerUnit } from "@/lib/stageMotion";

describe("pointerUnit", () => {
  it("maps the left edge to -1, the middle to 0 and the right edge to 1", () => {
    expect(pointerUnit(100, 100, 400)).toBe(-1);
    expect(pointerUnit(300, 100, 400)).toBe(0);
    expect(pointerUnit(500, 100, 400)).toBe(1);
  });

  it("clamps a pointer that has left the box", () => {
    expect(pointerUnit(-50, 100, 400)).toBe(-1);
    expect(pointerUnit(900, 100, 400)).toBe(1);
  });

  it("returns 0 for a box with no size", () => {
    expect(pointerUnit(10, 0, 0)).toBe(0);
    expect(pointerUnit(10, 0, -5)).toBe(0);
  });
});
