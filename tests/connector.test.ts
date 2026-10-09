import { describe, expect, it } from "vitest";
import { buildConnector, connectorLook, connectorProgress, DOCK_AT, type ConnectorLook } from "@/lib/connector";

const geometry = { from: { x: 900, y: 1000 }, to: { x: 120, y: 1260 }, gapTop: 1000, gapBottom: 1230 };

describe("buildConnector", () => {
  it("boxes the curve between its two ends with a margin on both sides", () => {
    const built = buildConnector(geometry);
    expect(built.top).toBe(1000);
    expect(built.height).toBe(260);
    expect(built.left).toBeLessThan(120);
    expect(built.left + built.width).toBeGreaterThan(900);
  });

  it("starts at the departing point and ends exactly on the target, in the box's own coordinates", () => {
    const built = buildConnector(geometry);
    expect(built.start).toEqual({ x: 900 - built.left, y: 0 });
    expect(built.end).toEqual({ x: 120 - built.left, y: 260 });
    expect(built.d.startsWith(`M${built.start.x} 0`)).toBe(true);
    expect(built.d.endsWith(`L${built.end.x} ${built.end.y}`)).toBe(true);
  });

  it("makes its sideways swing inside the empty gap between the two sections", () => {
    const built = buildConnector(geometry);
    const swing = /C\S+ (\d+(?:\.\d+)?) \S+ \1 /.exec(built.d);
    expect(swing).not.toBeNull();
    const at = built.top + Number(swing![1]);
    expect(at).toBeGreaterThanOrEqual(geometry.gapTop);
    expect(at).toBeLessThanOrEqual(geometry.gapBottom);
    expect(built.top + built.swing.y).toBeGreaterThanOrEqual(geometry.gapTop);
    expect(built.top + built.swing.y).toBeLessThanOrEqual(geometry.gapBottom);
  });

  it("drops straight down when both ends are in line", () => {
    const built = buildConnector({ ...geometry, to: { x: 900, y: 1260 } });
    expect(built.d).toBe(`M${built.start.x} 0 L${built.end.x} 260`);
  });

  it("copes with a very tight gap and with a target at the same height", () => {
    const tight = buildConnector({ from: { x: 50, y: 500 }, to: { x: 600, y: 540 }, gapTop: 500, gapBottom: 520 });
    expect(tight.d).toMatch(/^M/);
    expect(Number.isFinite(tight.swing.y)).toBe(true);
    const flat = buildConnector({ from: { x: 50, y: 500 }, to: { x: 600, y: 500 }, gapTop: 500, gapBottom: 500 });
    expect(flat.height).toBeGreaterThan(0);
    expect(Number.isFinite(flat.swing.y)).toBe(true);
  });
});

describe("connectorProgress", () => {
  const draw = (scroll: number) => connectorProgress(scroll, 900, 5000, 5260);

  it("is 0 until the start comes into the lower part of the view", () => {
    expect(draw(5000 - 900)).toBe(0);
    expect(draw(0)).toBe(0);
  });

  it("is 1 once the end has reached the upper middle of the view", () => {
    expect(draw(5260 - 900 * 0.45)).toBe(1);
    expect(draw(99999)).toBe(1);
  });

  it("rises smoothly and monotonically between the two", () => {
    let last = -1;
    for (let scroll = 4000; scroll < 6000; scroll += 9) {
      const value = draw(scroll);
      expect(value).toBeGreaterThanOrEqual(last);
      last = value;
    }
  });

  it("reaches the docking threshold before the end leaves the view, and not before the curve is drawn", () => {
    const docked = (scroll: number) => draw(scroll) >= DOCK_AT;
    expect(docked(5260 - 900 * 0.45)).toBe(true);
    expect(docked(5000 - 900 + 300)).toBe(false);
  });

  it("survives a non-finite scroll", () => {
    expect(draw(Number.NaN)).toBe(0);
  });
});

describe("connectorLook", () => {
  const look: ConnectorLook = { dash: 0, label: 0, sparkle: 0, turn: 0, along: 0, fact: 0, rider: 0 };

  it("starts undrawn with nothing travelling and ends fully drawn with everything docked", () => {
    expect(connectorLook(look, 0)).toMatchObject({ dash: 1, label: 0, sparkle: 0, fact: 0, rider: 0 });
    expect(connectorLook(look, 1)).toMatchObject({ dash: 0, label: 1, fact: 0, rider: 0 });
    expect(connectorLook(look, 1).sparkle).toBeCloseTo(0, 6);
  });

  it("rides the traveller along the whole curve and hides it once it docks", () => {
    expect(connectorLook(look, 0.5)).toMatchObject({ along: 50, fact: 1, rider: 1 });
    expect(connectorLook(look, DOCK_AT).rider).toBe(0);
    expect(connectorLook(look, 0.99).rider).toBe(0);
  });

  it("shows the sparkle in the middle of the ride only", () => {
    expect(connectorLook(look, 0.5).sparkle).toBe(1);
    expect(connectorLook(look, 0.5).turn).toBe(270);
  });

  it("clamps out of range and non-finite progress", () => {
    expect(connectorLook(look, -3).dash).toBe(1);
    expect(connectorLook(look, 7).dash).toBe(0);
    expect(connectorLook(look, Number.NaN).dash).toBe(1);
  });
});
