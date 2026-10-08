import { describe, expect, it } from "vitest";
import { PIN_HOLD_VH, PIN_STEP_CAP_VH, PIN_STEP_VH, PIN_TOTAL_CAP_VH, pinLengthVh } from "@/lib/pinLengths";

const STEPS = { how: 4, paths: 3, loop: 4 } as const;
const CAPS = { how: 160, paths: 140, loop: PIN_TOTAL_CAP_VH } as const;

describe("pinned section lengths", () => {
  it("holds the last step for no longer than 15 viewport heights per hundred, and never more", () => {
    expect(PIN_HOLD_VH).toBeLessThanOrEqual(15);
  });

  it("gives every step at most about 40vh, and the single-step sections 30vh", () => {
    for (const [name, vh] of Object.entries(PIN_STEP_VH)) expect(vh, name).toBeLessThanOrEqual(PIN_STEP_CAP_VH);
    expect(PIN_STEP_VH.how).toBeLessThanOrEqual(30);
    expect(PIN_STEP_VH.paths).toBeLessThanOrEqual(30);
  });

  it("keeps each pinned section within its own cap, and none over 2.5 viewport heights", () => {
    for (const name of Object.keys(STEPS) as (keyof typeof STEPS)[]) {
      const vh = pinLengthVh(name, STEPS[name]);
      expect(vh, name).toBeLessThanOrEqual(CAPS[name]);
      expect(vh, name).toBeLessThanOrEqual(PIN_TOTAL_CAP_VH);
    }
  });

  it("adds up as steps times the step length plus the hold", () => {
    expect(pinLengthVh("how", 4)).toBe(4 * PIN_STEP_VH.how + PIN_HOLD_VH);
    expect(pinLengthVh("paths", 0)).toBe(PIN_HOLD_VH);
  });

  it("keeps the whole set of pinned sections under about five viewport heights", () => {
    const total = (Object.keys(STEPS) as (keyof typeof STEPS)[]).reduce(
      (sum, name) => sum + pinLengthVh(name, STEPS[name]),
      0
    );
    expect(total).toBeLessThanOrEqual(500);
  });
});
