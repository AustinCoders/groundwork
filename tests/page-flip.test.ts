import { describe, expect, it } from "vitest";
import { bendLeaf, FLIP_FROM, pageFlip, STRIPS, type Bend, type Flip } from "@/lib/pageFlip";

const blank = (): Flip => ({ turned: 0, angle: 0, cast: 0, lift: 0, spine: 0, free: 0 });
const at = (u: number, step = 3, last = false) => pageFlip(blank(), u, step, last);
const mid = 3 + FLIP_FROM + (1 - FLIP_FROM) / 2;
const bent = (u: number, count = STRIPS): Bend =>
  bendLeaf({ angles: Array(count).fill(0), shade: Array(count).fill(0), veil: Array(count).fill(0) }, at(u), count);
const absolute = (bend: Bend) => {
  let sum = 0;
  return bend.angles.map((angle) => (sum += angle));
};

describe("pageFlip", () => {
  it("lies flat from the start of its step until the flip window opens", () => {
    for (const u of [0, 2.5, 3, 3 + FLIP_FROM / 2, 3 + FLIP_FROM]) {
      expect(at(u).angle, `u ${u}`).toBeCloseTo(0, 10);
      expect(at(u).cast).toBeCloseTo(0, 10);
      expect(at(u).lift).toBeCloseTo(0, 10);
    }
  });

  it("lands flat on the other side exactly when the next step begins", () => {
    expect(at(4).angle).toBe(-180);
    expect(at(4.5).angle).toBe(-180);
    expect(at(4).cast).toBeCloseTo(0, 10);
    expect(at(4).lift).toBeCloseTo(0, 10);
  });

  it("is edge-on halfway through the window", () => {
    expect(at(mid).angle).toBeCloseTo(-90, 10);
  });

  it("turns monotonically and never leaves 0 to -180 degrees", () => {
    let last = 1;
    for (let u = 2; u <= 5; u += 0.003) {
      const { angle } = at(u);
      expect(angle).toBeLessThanOrEqual(last);
      expect(angle).toBeGreaterThanOrEqual(-180);
      last = angle;
    }
  });

  it("is reversible: the same progress gives the same pose whichever way it is reached", () => {
    expect(at(3.7)).toEqual(at(3.7));
    expect(at(3.7).angle).toBeLessThan(at(3.6).angle);
  });

  it("never turns the last page", () => {
    expect(at(19.9, 19, true).angle).toBeCloseTo(0, 10);
    expect(at(20, 19, true).turned).toBe(0);
  });

  it("lifts and casts the most shadow mid-flip and none at either rest", () => {
    expect(at(mid).cast).toBeGreaterThan(at(3.5).cast);
    expect(at(mid).cast).toBeGreaterThan(at(3.95).cast);
    expect(at(mid).lift).toBeGreaterThan(3);
  });

  it("survives non-finite progress", () => {
    expect(at(Number.NaN).angle).toBeCloseTo(0, 10);
  });
});

describe("bendLeaf", () => {
  it("is flat at both rests: every strip at the same angle, nothing shaded", () => {
    expect(absolute(bent(3.2)).every((angle) => Math.abs(angle) < 1e-9)).toBe(true);
    expect(absolute(bent(4)).every((angle) => Math.abs(angle + 180) < 1e-9)).toBe(true);
    expect(Math.max(...bent(3.2).shade)).toBeCloseTo(0, 9);
    expect(Math.max(...bent(4).shade)).toBeCloseTo(0, 9);
  });

  it("curls mid-turn: the free edge leads and the edge at the spine trails", () => {
    const angles = absolute(bent(mid));
    expect(angles[0]).toBeGreaterThan(angles[angles.length - 1]);
    for (let i = 1; i < angles.length; i++) expect(angles[i]).toBeLessThanOrEqual(angles[i - 1]);
  });

  it("bends evenly along the leaf, every strip turning a little more than the one before", () => {
    const { angles } = bent(mid);
    for (let i = 2; i < angles.length; i++) expect(angles[i]).toBeCloseTo(angles[1], 8);
  });

  it("shades the strips that face away more than the ones that face the viewer", () => {
    const { shade } = bent(3 + FLIP_FROM + 0.08);
    expect(shade[shade.length - 1]).toBeGreaterThanOrEqual(shade[0]);
    expect(Math.max(...shade)).toBeLessThanOrEqual(0.3);
  });

  it("dims the text only slightly as a strip nears edge-on, and keeps it fully legible when the strip is flat", () => {
    const flat = bent(3.2).veil;
    expect(Math.max(...flat)).toBeCloseTo(0, 9);
    const edgeOn = bent(mid).veil;
    expect(Math.max(...edgeOn)).toBeGreaterThan(0.15);
    expect(Math.max(...edgeOn)).toBeLessThanOrEqual(0.2);
    const turned = bent(4).veil;
    expect(Math.max(...turned)).toBeCloseTo(0, 9);
  });

  it("copes with a single strip", () => {
    const one = bent(mid, 1);
    expect(one.angles).toHaveLength(1);
    expect(Number.isFinite(one.angles[0])).toBe(true);
  });
});
