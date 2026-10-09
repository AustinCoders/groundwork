import { describe, expect, it } from "vitest";
import { HOW_STEPS } from "@/lib/homeHow";
import { PATH_COUNT } from "@/lib/homePaths";
import { bookStages, homeRounds } from "@/lib/homeRounds";
import { bankQuestions, bookRounds } from "@/lib/interviewBook";
import { PIN_HOLD_VH, PIN_STEP_VH, PIN_TURN_CAP, pinLengthVh } from "@/lib/pinLengths";

const REAL = {
  how: HOW_STEPS,
  paths: PATH_COUNT,
  loop: bookStages(homeRounds(bookRounds(), bankQuestions())).length,
} as const;
const NAMES = Object.keys(REAL) as (keyof typeof REAL)[];
const STEP_CAP = 40;
const TOTAL_CAP = 250;

describe("pinned section lengths with the real step counts", () => {
  it("holds the last step for no longer than 15 viewport heights per hundred", () => {
    expect(PIN_HOLD_VH).toBeLessThanOrEqual(15);
  });

  it("gives every step at most about 40vh, and the single-step sections 30vh", () => {
    for (const [name, vh] of Object.entries(PIN_STEP_VH)) expect(vh, name).toBeLessThanOrEqual(STEP_CAP);
    expect(PIN_STEP_VH.how).toBeLessThanOrEqual(30);
    expect(PIN_STEP_VH.paths).toBeLessThanOrEqual(30);
  });

  it("adds up as real steps times the step length plus the hold, without the caps biting", () => {
    for (const name of NAMES)
      expect(pinLengthVh(name, REAL[name]), name).toBe(REAL[name] * PIN_STEP_VH[name] + PIN_HOLD_VH);
  });

  it("keeps each pinned section within 2.5 viewport heights and the set under about five", () => {
    for (const name of NAMES) expect(pinLengthVh(name, REAL[name]), name).toBeLessThanOrEqual(TOTAL_CAP);
    const total = NAMES.reduce((sum, name) => sum + pinLengthVh(name, REAL[name]), 0);
    expect(total).toBeLessThanOrEqual(500);
  });

  it("enforces the total cap when a step is added, so a section can never grow past it", () => {
    for (const name of NAMES) expect(pinLengthVh(name, 100), name).toBe(TOTAL_CAP);
    expect(pinLengthVh("paths", 0)).toBe(PIN_HOLD_VH);
  });
});

describe("page turn pace", () => {
  it("lets a flick advance at most a quarter of a round per frame, so it never skips a leaf", () => {
    expect(PIN_TURN_CAP).toBeGreaterThan(0);
    expect(PIN_TURN_CAP).toBeLessThanOrEqual(0.25);
  });
});
