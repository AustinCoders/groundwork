import { describe, expect, it } from "vitest";
import {
  BADGE_R,
  RADIUS,
  TOP,
  TRAIN_GAP,
  VIEW_W,
  X_LEFT,
  X_RIGHT,
  apex,
  apexLength,
  arcStartLength,
  endX,
  goalPoint,
  percentX,
  percentY,
  railHeight,
  runY,
  sideOf,
  trackLength,
  trackPath,
  trainLength,
  trainPoint,
} from "@/app/roadmap/railLayout";

describe("the rail layout", () => {
  it("snakes: the first stop is on the right, the next on the left, and so on", () => {
    expect([0, 1, 2, 3].map(sideOf)).toEqual(["right", "left", "right", "left"]);
  });

  it("puts each stop at the middle of its own bend, one bend per stop", () => {
    expect(apex(0)).toEqual({ x: X_RIGHT + RADIUS, y: TOP + RADIUS, side: "right" });
    expect(apex(1)).toEqual({ x: X_LEFT - RADIUS, y: TOP + 3 * RADIUS, side: "left" });
    expect(apex(2).y - apex(1).y).toBe(2 * RADIUS);
  });

  it("keeps every badge fully inside the picture", () => {
    for (let i = 0; i < 20; i++) {
      const { x } = apex(i);
      expect(x - BADGE_R).toBeGreaterThan(0);
      expect(x + BADGE_R).toBeLessThan(VIEW_W);
    }
  });

  it("grows by two radii per stop and leaves room above and below", () => {
    expect(railHeight(5) - railHeight(4)).toBe(2 * RADIUS);
    expect(runY(0)).toBe(TOP);
    expect(railHeight(0)).toBeGreaterThan(runY(0));
  });

  it("bulges each bend outward: clockwise on the right edge and anticlockwise on the left", () => {
    const arcs = [...trackPath(4).matchAll(/A\d+ \d+ 0 0 (\d) /g)].map((match) => match[1]);
    expect(arcs).toEqual(["1", "0", "1", "0"]);
  });

  it("draws one path with a bend for every stop and ends on the side the last run reaches", () => {
    const path = trackPath(4);
    expect(path.startsWith(`M56 ${TOP}`)).toBe(true);
    expect(path.match(/ A/g)).toHaveLength(4);
    expect(path.endsWith(`H${endX(4)}`)).toBe(true);
    expect(endX(4)).toBeGreaterThan(VIEW_W / 2);
    expect(endX(5)).toBeLessThan(VIEW_W / 2);
  });
});

describe("distances along the rail", () => {
  it("add up the straight runs and the half circles", () => {
    const run = X_RIGHT - X_LEFT;
    expect(arcStartLength(0)).toBeCloseTo(X_RIGHT - 56, 5);
    expect(arcStartLength(1)).toBeCloseTo(X_RIGHT - 56 + Math.PI * RADIUS + run, 5);
    expect(apexLength(0) - arcStartLength(0)).toBeCloseTo((Math.PI * RADIUS) / 2, 5);
  });

  it("increase from stop to stop and stay inside the whole track", () => {
    const count = 6;
    for (let i = 1; i < count; i++) expect(apexLength(i)).toBeGreaterThan(apexLength(i - 1));
    expect(apexLength(count - 1)).toBeLessThan(trackLength(count));
  });

  it("measure the whole track as every run, every bend and the tail", () => {
    const count = 3;
    const expected = X_RIGHT - 56 + 2 * (X_RIGHT - X_LEFT) + count * Math.PI * RADIUS + (X_RIGHT - endX(count));
    expect(trackLength(count)).toBeCloseTo(expected, 5);
  });
});

describe("the train", () => {
  it("waits on the run just before the stop it is heading for, facing it", () => {
    expect(trainPoint(0)).toEqual({ x: X_RIGHT - TRAIN_GAP, y: runY(0), heading: "right" });
    expect(trainPoint(1)).toEqual({ x: X_LEFT + TRAIN_GAP, y: runY(1), heading: "left" });
  });

  it("lights the rail up to where it stands, never before the start", () => {
    expect(trainLength(0)).toBeCloseTo(X_RIGHT - 56 - TRAIN_GAP, 5);
    expect(trainLength(2)).toBeLessThan(arcStartLength(2));
    expect(trainLength(0)).toBeGreaterThanOrEqual(0);
  });

  it("stops at the goal when everything is read", () => {
    expect(goalPoint(4).heading).toBe("right");
    expect(goalPoint(5).heading).toBe("left");
    expect(goalPoint(4).y).toBe(runY(4));
  });
});

describe("percentages for the page", () => {
  it("turn picture coordinates into shares of the width and height", () => {
    expect(percentX(500)).toBe(50);
    expect(percentY(railHeight(3) / 2, 3)).toBeCloseTo(50, 5);
  });
});
