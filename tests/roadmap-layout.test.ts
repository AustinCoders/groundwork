import { describe, expect, it } from "vitest";
import {
  LINE_Y,
  RADIUS,
  ROW_H,
  VIEW_W,
  X_LEFT,
  X_RIGHT,
  entryX,
  exitX,
  incomingArc,
  linePath,
  outgoingArc,
  stationPercent,
  stationX,
  travel,
} from "@/app/roadmap/journeyLayout";

describe("the route snakes from row to row", () => {
  it("runs right, then left, then right again", () => {
    expect([0, 1, 2, 3].map(travel)).toEqual(["right", "left", "right", "left"]);
  });

  it("leaves each row where the next row begins", () => {
    for (const row of [0, 1, 2, 3, 4]) expect(exitX(row)).toBe(entryX(row + 1));
  });

  it("keeps the whole drawing, curves included, inside the frame with room for the stroke", () => {
    expect(X_LEFT - RADIUS).toBeGreaterThanOrEqual(10);
    expect(X_RIGHT + RADIUS).toBeLessThanOrEqual(VIEW_W - 10);
    expect(LINE_Y).toBe(ROW_H / 2);
  });
});

describe("stations on a row", () => {
  it("are spread evenly and never touch the ends", () => {
    for (const count of [1, 2, 3, 5]) {
      const xs = Array.from({ length: count }, (_, k) => stationX(0, k, count));
      expect(xs[0]).toBeGreaterThan(X_LEFT);
      expect(xs[count - 1]).toBeLessThan(X_RIGHT);
      const gaps = xs.slice(1).map((x, k) => Math.round((x - xs[k]) * 100) / 100);
      expect(new Set(gaps).size).toBeLessThanOrEqual(1);
    }
  });

  it("put a lone station in the middle of its row", () => {
    expect(stationX(0, 0, 1)).toBe((X_LEFT + X_RIGHT) / 2);
    expect(stationX(1, 0, 1)).toBe((X_LEFT + X_RIGHT) / 2);
  });

  it("come in travel order, so the first station is the first one met", () => {
    expect(stationX(0, 0, 3)).toBeLessThan(stationX(0, 1, 3));
    expect(stationX(1, 0, 3)).toBeGreaterThan(stationX(1, 1, 3));
  });

  it("are given as a share of the width so the page can place them", () => {
    expect(stationPercent(0, 0, 1)).toBeCloseTo(50, 5);
  });
});

describe("the drawn paths", () => {
  it("draws a straight line along each row from where it enters to where it leaves", () => {
    expect(linePath(0)).toBe(`M${X_LEFT} ${LINE_Y} H${X_RIGHT}`);
    expect(linePath(1)).toBe(`M${X_RIGHT} ${LINE_Y} H${X_LEFT}`);
  });

  it("has no curve into the first row or out of the last", () => {
    expect(incomingArc(0)).toBeNull();
    expect(outgoingArc(4, 5)).toBeNull();
    expect(outgoingArc(3, 5)).not.toBeNull();
  });

  it("joins the two halves of each turn at the edge between rows", () => {
    const out = outgoingArc(0, 3)!;
    const incoming = incomingArc(1)!;
    expect(out).toContain(`${X_RIGHT + RADIUS} ${ROW_H}`);
    expect(incoming.startsWith(`M${X_RIGHT + RADIUS} 0`)).toBe(true);
    const left = outgoingArc(1, 3)!;
    expect(left).toContain(`${X_LEFT - RADIUS} ${ROW_H}`);
    expect(incomingArc(2)!.startsWith(`M${X_LEFT - RADIUS} 0`)).toBe(true);
  });
});
