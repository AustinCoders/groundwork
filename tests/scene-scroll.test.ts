import { describe, expect, it } from "vitest";
import {
  pinOffset,
  pinStep,
  readScene,
  REST_BELOW,
  virtualScroll,
  type PinState,
  type SceneState,
} from "@/lib/sceneScroll";

const VIEWPORT = 900;
const HEADER = 64;
const HEIGHT = VIEWPORT - HEADER;

function at(top: number, height = HEIGHT, viewport = VIEWPORT, header = HEADER): SceneState {
  return readScene({ p: 0, enter: 0, exit: 0 }, top, height, viewport, header);
}

describe("readScene progress", () => {
  it("is 0 when the top reaches the bottom of the viewport and 1 when the bottom leaves the top", () => {
    expect(at(VIEWPORT).p).toBe(0);
    expect(at(-HEIGHT).p).toBe(1);
  });

  it("clamps outside those two positions", () => {
    expect(at(VIEWPORT + 500).p).toBe(0);
    expect(at(-HEIGHT - 500).p).toBe(1);
  });

  it("is monotonic as the section scrolls up", () => {
    let last = -1;
    for (let top = VIEWPORT; top >= -HEIGHT; top -= 7) {
      const p = at(top).p;
      expect(p).toBeGreaterThanOrEqual(last);
      last = p;
    }
  });
});

describe("readScene enter and exit", () => {
  it("starts the section undone: enter 0 while its top is at or below the viewport bottom", () => {
    expect(at(VIEWPORT).enter).toBe(0);
    expect(at(VIEWPORT + 40).enter).toBe(0);
  });

  it("finishes entering exactly where the rest range starts, a quarter of the viewport below the header", () => {
    const edge = HEADER + REST_BELOW * VIEWPORT;
    expect(at(edge).enter).toBe(1);
    expect(at(edge + 1).enter).toBeLessThan(1);
    expect(at(edge - 200).enter).toBe(1);
  });

  it("keeps exit at 0 until the section starts leaving, then rises to 1 when its bottom meets the header", () => {
    expect(at(HEADER).exit).toBe(0);
    expect(at(HEADER - 1).exit).toBeGreaterThan(0);
    expect(at(HEADER - (VIEWPORT - HEADER)).exit).toBe(1);
    expect(at(-5000).exit).toBe(1);
  });

  it("eases: both values rise monotonically and stay inside 0 to 1", () => {
    let enter = -1;
    let exit = -1;
    for (let top = VIEWPORT + 10; top >= -2000; top -= 5) {
      const state = at(top);
      expect(state.enter).toBeGreaterThanOrEqual(enter);
      expect(state.exit).toBeGreaterThanOrEqual(exit);
      for (const value of [state.enter, state.exit]) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
      enter = state.enter;
      exit = state.exit;
    }
  });

  it("starts and ends each ramp gently: the first and last steps move less than the middle", () => {
    const step = 4;
    const edge = HEADER + REST_BELOW * VIEWPORT;
    const first = at(VIEWPORT - step).enter - at(VIEWPORT).enter;
    const middle = at((VIEWPORT + edge) / 2 - step / 2).enter - at((VIEWPORT + edge) / 2 + step / 2).enter;
    const last = at(edge).enter - at(edge + step).enter;
    expect(first).toBeLessThan(middle);
    expect(last).toBeLessThan(middle);
  });
});

describe("readScene at rest", () => {
  it("is exactly 1 for every top from the header offset up to a quarter of the viewport below it", () => {
    for (let top = HEADER; top <= HEADER + REST_BELOW * VIEWPORT; top += 3) {
      const state = at(top);
      expect(state.enter, `top ${top}`).toBe(1);
      expect(state.exit, `top ${top}`).toBe(0);
    }
  });

  it("lands exactly at rest by an anchor on any viewport that fits the one-view rule", () => {
    for (const [viewport, header] of [
      [720, 64],
      [900, 64],
      [1080, 64],
      [1100, 72],
    ]) {
      const state = at(header, viewport - header, viewport, header);
      expect([state.enter, state.exit]).toEqual([1, 0]);
    }
  });

  it("also rests while a section taller than the view is scrolled through its middle", () => {
    const state = at(HEADER - 300, 2.2 * VIEWPORT);
    expect([state.enter, state.exit]).toEqual([1, 0]);
  });

  it("does not drift apart a short section that is anchored under the header", () => {
    const state = at(HEADER, 400);
    expect([state.enter, state.exit]).toEqual([1, 0]);
  });

  it("is off rest on the way in and on the way out", () => {
    expect(at(VIEWPORT * 0.6).enter).toBeLessThan(1);
    expect(at(-VIEWPORT * 0.3).exit).toBeGreaterThan(0);
  });
});

describe("readScene guards", () => {
  it("returns the same object it was given, so a caller can reuse one per frame", () => {
    const out: SceneState = { p: 0, enter: 0, exit: 0 };
    expect(readScene(out, 100, HEIGHT, VIEWPORT, HEADER)).toBe(out);
  });

  it("survives a zero-size section and a viewport shorter than the header", () => {
    for (const state of [at(100, 0), at(10, 50, 40, 64)]) {
      for (const value of Object.values(state)) {
        expect(Number.isFinite(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    }
  });
});

const pinAt = (s: number, length: number, hold: number, groups: number[]): PinState =>
  pinStep({ group: 0, item: 0, t: 0, step: 0 }, s, length, hold, groups);

describe("pinStep", () => {
  const groups = [1, 1, 1, 1];

  it("starts on the first step with no progress and clamps before the pin", () => {
    expect(pinAt(0, 1000, 200, groups)).toEqual({ group: 0, item: 0, t: 0, step: 0 });
    expect(pinAt(-300, 1000, 200, groups)).toEqual({ group: 0, item: 0, t: 0, step: 0 });
  });

  it("gives each group an equal share of the pinned length, hold excluded", () => {
    expect(pinAt(199, 1000, 200, groups).group).toBe(0);
    expect(pinAt(200, 1000, 200, groups).group).toBe(1);
    expect(pinAt(399, 1000, 200, groups).group).toBe(1);
    expect(pinAt(600, 1000, 200, groups).group).toBe(3);
  });

  it("walks the steps in order, never skipping or going back", () => {
    let last = -1;
    for (let s = 0; s <= 1000; s += 7) {
      const { step } = pinAt(s, 1000, 200, groups);
      expect(step).toBeGreaterThanOrEqual(last);
      expect(step - last).toBeLessThanOrEqual(1);
      last = step;
    }
    expect(last).toBe(3);
  });

  it("holds the last step through the extra length with progress clamped at 1", () => {
    const end = pinAt(1000, 1000, 200, groups);
    expect(end).toMatchObject({ group: 3, item: 0, step: 3 });
    expect(end.t).toBe(1);
    expect(pinAt(900, 1000, 200, groups).t).toBe(1);
  });

  it("splits a group into its items and counts steps across groups", () => {
    const rounds = [4, 6, 4, 6];
    const second = pinAt(250 + 10, 1000, 0, rounds);
    expect(second).toMatchObject({ group: 1, item: 0, step: 4 });
    const middle = pinAt(250 + 125, 1000, 0, rounds);
    expect(middle).toMatchObject({ group: 1, item: 3, step: 7 });
    expect(pinAt(1000, 1000, 0, rounds).step).toBe(19);
  });

  it("reports progress through the current item between 0 and 1", () => {
    const state = pinAt(125, 1000, 0, [4, 6, 4, 6]);
    expect(state.item).toBe(2);
    expect(state.t).toBeCloseTo(0, 5);
    const half = pinAt(125 + 250 / 4 / 2, 1000, 0, [4, 6, 4, 6]);
    expect(half.t).toBeCloseTo(0.5, 5);
  });

  it("survives a pin with no length and non-finite input", () => {
    expect(pinAt(5, 0, 0, groups).step).toBe(0);
    expect(pinAt(Number.NaN, 1000, 0, groups).step).toBe(0);
  });
});

describe("pinOffset", () => {
  it("lands inside the item it names, and pinStep reads it back", () => {
    const groups = [4, 6, 4, 6];
    for (let group = 0; group < groups.length; group++)
      for (let item = 0; item < groups[group]; item++) {
        const s = pinOffset(2000, 300, groups, group, item, 0.85);
        const state = pinAt(s, 2000, 300, groups);
        expect([state.group, state.item], `${group}.${item}`).toEqual([group, item]);
        expect(state.t).toBeCloseTo(0.85, 5);
      }
  });

  it("puts the first step at the very start and later groups further on", () => {
    expect(pinOffset(1000, 0, [1, 1], 0, 0, 0)).toBe(0);
    expect(pinOffset(1000, 0, [1, 1], 1, 0, 0)).toBe(500);
  });
});

describe("virtual scroll", () => {
  const pins = [
    { start: 1000, length: 400 },
    { start: 3000, length: 600 },
  ];

  it("equals the real scroll until the first pin", () => {
    expect(virtualScroll(0, pins)).toBe(0);
    expect(virtualScroll(1000, pins)).toBe(1000);
  });

  it("stands still while a pin runs, then moves on from where it stopped", () => {
    expect(virtualScroll(1200, pins)).toBe(1000);
    expect(virtualScroll(1400, pins)).toBe(1000);
    expect(virtualScroll(1500, pins)).toBe(1100);
    expect(virtualScroll(3300, pins)).toBe(2600);
    expect(virtualScroll(4000, pins)).toBe(4000 - 1000);
  });

  it("never runs backwards as the real scroll grows", () => {
    let last = -1;
    for (let y = 0; y < 5000; y += 13) {
      const value = virtualScroll(y, pins);
      expect(value).toBeGreaterThanOrEqual(last);
      last = value;
    }
  });
});
