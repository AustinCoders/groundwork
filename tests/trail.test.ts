import { describe, expect, it } from "vitest";
import {
  buildTrail,
  stageRatio,
  drawProgress,
  trailPoint,
  TRAIL_FINISH,
  TRAIL_SPOTS,
  TRAIL_START,
  walkerProgress,
} from "@/lib/trail";

describe("buildTrail", () => {
  const trail = buildTrail(5);

  it("starts at the start marker, passes every spot in order and ends at the finish", () => {
    expect(trail.d.startsWith(`M${TRAIL_START.x} ${TRAIL_START.y}`)).toBe(true);
    expect(trail.d.endsWith(`${TRAIL_FINISH.x} ${TRAIL_FINISH.y}`)).toBe(true);
    for (const spot of TRAIL_SPOTS) expect(trail.d).toContain(`${spot.x} ${spot.y}`);
    expect(trail.spots).toEqual(TRAIL_SPOTS);
  });

  it("puts each milestone at a rising share of the path between 0 and 1", () => {
    expect(trail.at).toHaveLength(5);
    expect(trail.at.every((share) => share > 0 && share < 1)).toBe(true);
    expect([...trail.at].sort((a, b) => a - b)).toEqual(trail.at);
  });

  it("snakes: neighbouring spots sit on opposite sides of the centre line", () => {
    for (let i = 1; i < trail.spots.length; i++)
      expect(Math.sign(trail.spots[i].x - 50)).toBe(-Math.sign(trail.spots[i - 1].x - 50));
  });

  it("keeps every spot inside the box with room for a card on its outer side", () => {
    for (const spot of trail.spots) {
      expect(spot.x).toBeGreaterThan(30);
      expect(spot.x).toBeLessThan(70);
      expect(spot.y).toBeGreaterThan(5);
      expect(spot.y).toBeLessThan(95);
    }
  });

  it("uses only as many spots as there are stops, and handles none and too many", () => {
    expect(buildTrail(3).spots).toHaveLength(3);
    expect(buildTrail(3).at).toHaveLength(3);
    expect(buildTrail(0).at).toEqual([]);
    expect(buildTrail(99).spots).toHaveLength(5);
  });
});

describe("trailPoint", () => {
  const trail = buildTrail(5);

  it("is at the start for 0, at each milestone at its share, and at the finish for 1", () => {
    expect(trailPoint(trail, 0, 1)).toMatchObject({ x: TRAIL_START.x, y: TRAIL_START.y });
    const end = trailPoint(trail, 1, 1);
    expect(end.x).toBeCloseTo(TRAIL_FINISH.x, 1);
    expect(end.y).toBeCloseTo(TRAIL_FINISH.y, 1);
    trail.at.forEach((share, i) => {
      const point = trailPoint(trail, share, 1);
      expect(point.x).toBeCloseTo(TRAIL_SPOTS[i].x, 0);
      expect(point.y).toBeCloseTo(TRAIL_SPOTS[i].y, 0);
    });
  });

  it("moves down the box without jumping as the fraction grows", () => {
    let last = trailPoint(trail, 0, 1);
    for (let f = 0.005; f <= 1; f += 0.005) {
      const point = trailPoint(trail, f, 1);
      expect(point.y).toBeGreaterThanOrEqual(last.y - 0.05);
      expect(Math.hypot(point.x - last.x, point.y - last.y)).toBeLessThan(3);
      last = point;
    }
  });

  it("faces down at a milestone, where the path is vertical, and sideways mid-swing", () => {
    const stop = trailPoint(trail, trail.at[0], 1);
    expect(Math.abs(Math.abs(stop.angle) - 90)).toBeLessThan(8);
    const swing = trailPoint(trail, (trail.at[0] + trail.at[1]) / 2, 1);
    expect(Math.abs(swing.angle)).toBeLessThan(80);
  });

  it("accounts for a box that is taller than it is wide when finding the on-screen angle", () => {
    const square = trailPoint(trail, (trail.at[0] + trail.at[1]) / 2, 1).angle;
    const wide = trailPoint(trail, (trail.at[0] + trail.at[1]) / 2, 0.6).angle;
    expect(Math.abs(wide)).toBeLessThan(Math.abs(square));
  });

  it("clamps outside 0 to 1 and survives a non-finite fraction", () => {
    expect(trailPoint(trail, -2, 1).y).toBe(TRAIL_START.y);
    expect(trailPoint(trail, Number.NaN, 1).y).toBe(TRAIL_START.y);
    expect(trailPoint(trail, 9, 1).y).toBeCloseTo(TRAIL_FINISH.y, 1);
  });
});

describe("walker and draw progress", () => {
  it("draws the path over the first part of a step, then walks it", () => {
    expect(drawProgress(0)).toBe(0);
    expect(drawProgress(0.3)).toBe(1);
    expect(walkerProgress(0.05)).toBe(0);
    expect(walkerProgress(0.7)).toBe(1);
  });

  it("has the walker at the finish by the point a step is landed on, and the path drawn ahead of it", () => {
    expect(walkerProgress(0.8)).toBe(1);
    for (let lt = 0; lt <= 1; lt += 0.05) expect(drawProgress(lt)).toBeGreaterThanOrEqual(walkerProgress(lt));
  });
});

describe("stageRatio", () => {
  it("is the height over the width, and 0 (unknown) while the stage has no box, as in a hidden panel", () => {
    expect(stageRatio(800, 600)).toBe(0.75);
    expect(stageRatio(0, 600)).toBe(0);
    expect(stageRatio(800, 0)).toBe(0);
    expect(stageRatio(-1, 5)).toBe(0);
  });
});

describe("trailPoint with a cached length", () => {
  it("keeps one length per curve that adds up to the whole trail", () => {
    const trail = buildTrail(5);
    expect(trail.lengths).toHaveLength(trail.curves.length);
    expect(trail.lengths.reduce((a, b) => a + b, 0)).toBeCloseTo(trail.length, 9);
  });
});
