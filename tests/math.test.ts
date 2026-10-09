import { describe, expect, it } from "vitest";
import { smooth, unit } from "@/lib/math";

describe("unit", () => {
  it("clamps to 0..1 and reads a non-finite value as 0", () => {
    expect(unit(-3)).toBe(0);
    expect(unit(7)).toBe(1);
    expect(unit(0.4)).toBe(0.4);
    expect(unit(Number.NaN)).toBe(0);
    expect(unit(Infinity)).toBe(0);
  });
});

describe("smooth", () => {
  it("runs from 0 to 1 with a flat start and end and passes through the middle", () => {
    expect(smooth(0)).toBe(0);
    expect(smooth(1)).toBe(1);
    expect(smooth(0.5)).toBe(0.5);
    expect(smooth(0.1)).toBeLessThan(0.1);
    expect(smooth(0.9)).toBeGreaterThan(0.9);
  });
});
