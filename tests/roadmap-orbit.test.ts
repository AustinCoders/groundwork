import { describe, expect, it } from "vitest";
import {
  CIRCLE_R,
  DOT_ARC,
  HUB,
  RING_R,
  RX,
  STAGE_ARC,
  VIEW_H,
  VIEW_W,
  circleEdge,
  arcPath,
  connectorPath,
  dotAngles,
  middle,
  percentX,
  percentY,
  ringPoint,
  spokePath,
  stageAngle,
  stageCenter,
} from "@/app/roadmap/orbitLayout";

describe("the stage circles", () => {
  it("sit in an arc to the right of the hub, from top to bottom", () => {
    for (const count of [1, 2, 4, 5, 6]) {
      const ys = Array.from({ length: count }, (_, i) => stageCenter(i, count).y);
      expect([...ys].sort((a, b) => a - b)).toEqual(ys);
      for (let i = 0; i < count; i++) expect(stageCenter(i, count).x).toBeGreaterThan(HUB.x);
    }
  });

  it("put one stage straight out from the hub", () => {
    expect(stageAngle(0, 1)).toBe(0);
    expect(stageCenter(0, 1)).toEqual({ x: HUB.x + RX, y: HUB.y });
  });

  it("spread the first and last stage to the edges of the arc", () => {
    expect(stageAngle(0, 5)).toBeCloseTo(-STAGE_ARC / 2, 8);
    expect(stageAngle(4, 5)).toBeCloseTo(STAGE_ARC / 2, 8);
  });

  it("are the same distance apart from top to bottom, so each label has the same room", () => {
    for (const count of [3, 4, 5]) {
      const ys = Array.from({ length: count }, (_, i) => stageCenter(i, count).y);
      const gaps = ys.slice(1).map((y, i) => Math.round((y - ys[i]) * 1000) / 1000);
      expect(new Set(gaps).size).toBe(1);
      expect(gaps[0]).toBeGreaterThan(CIRCLE_R * 2 + 12);
    }
  });

  it("never overlap, and stay inside the picture, for up to five stages", () => {
    for (const count of [2, 3, 4, 5]) {
      for (let i = 0; i < count; i++) {
        const c = stageCenter(i, count);
        expect(c.y - CIRCLE_R).toBeGreaterThan(0);
        expect(c.y + CIRCLE_R).toBeLessThan(VIEW_H);
        expect(c.x + CIRCLE_R).toBeLessThan(VIEW_W - 220);
        if (i > 0) {
          const before = stageCenter(i - 1, count);
          expect(Math.hypot(c.x - before.x, c.y - before.y)).toBeGreaterThan(CIRCLE_R * 2);
        }
      }
    }
  });
});

describe("the ring of step dots", () => {
  it("gives every step its own angle, in order, inside the arc", () => {
    const groups = dotAngles([3, 1, 4]);
    const flat = groups.flat();
    expect(flat).toHaveLength(8);
    expect([...flat].sort((a, b) => a - b)).toEqual(flat);
    expect(flat[0]).toBeGreaterThan(-DOT_ARC / 2);
    expect(flat[7]).toBeLessThan(DOT_ARC / 2);
  });

  it("keeps the gap between neighbouring dots equal", () => {
    const flat = dotAngles([2, 2, 3]).flat();
    const gaps = flat.slice(1).map((angle, i) => Math.round((angle - flat[i]) * 1000) / 1000);
    expect(new Set(gaps).size).toBe(1);
  });

  it("puts a group's middle between its first and last dot", () => {
    const [first] = dotAngles([4, 2]);
    expect(middle(first)).toBeGreaterThan(first[0]);
    expect(middle(first)).toBeLessThan(first[3]);
  });

  it("places dots on the ring around the hub", () => {
    const p = ringPoint(0);
    expect(p).toEqual({ x: HUB.x + RING_R, y: HUB.y });
    expect(Math.hypot(ringPoint(37).x - HUB.x, ringPoint(37).y - HUB.y)).toBeCloseTo(RING_R, 5);
  });
});

describe("the dotted links", () => {
  it("run from the ring to the left edge of a circle in one smooth curve", () => {
    const from = ringPoint(10, RING_R + 14);
    const to = circleEdge(2, 5);
    const d = connectorPath(from, to);
    expect(d.startsWith("M")).toBe(true);
    expect(d.match(/C/g)).toHaveLength(1);
    expect(d.endsWith(`${to.x.toFixed(1)} ${to.y.toFixed(1)}`)).toBe(true);
    expect(to.x).toBeLessThan(stageCenter(2, 5).x - CIRCLE_R);
  });
});

describe("the chain that joins a stage's dots", () => {
  it("is an arc on the ring from the first dot to the last", () => {
    const [first] = dotAngles([3, 2]);
    const d = arcPath(first[0], first[2]);
    const start = ringPoint(first[0]);
    const end = ringPoint(first[2]);
    expect(d.startsWith(`M${start.x.toFixed(1)} ${start.y.toFixed(1)} A${RING_R} ${RING_R}`)).toBe(true);
    expect(d.endsWith(`${end.x.toFixed(1)} ${end.y.toFixed(1)}`)).toBe(true);
  });

  it("has a spoke that leaves the ring in a straight line", () => {
    const d = spokePath(20);
    const out = ringPoint(20, RING_R + 22);
    expect(d).toContain(" L");
    expect(d.endsWith(`${out.x.toFixed(1)} ${out.y.toFixed(1)}`)).toBe(true);
  });
});

describe("percentages for the page", () => {
  it("turn picture coordinates into shares of the width and height", () => {
    expect(percentX(500)).toBe(50);
    expect(percentY(VIEW_H / 2)).toBe(50);
  });
});
