import { describe, expect, it } from "vitest";
import {
  cardPose,
  edgeDraw,
  notePose,
  reveal,
  scaleFor,
  starPose,
  stepWindow,
  stickerPose,
  wordReveal,
  type CardInput,
  type Pose,
  type StepWindow,
} from "@/lib/pose";

const pose = (): Pose => ({ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 });
const card = (fly: number, extra: Partial<CardInput> = {}): CardInput => ({
  fly,
  still: false,
  rot: -2,
  depth: 10,
  dir: 1,
  outward: 1,
  ...extra,
});
const wide = scaleFor(1440);

describe("scaleFor", () => {
  it("scales the move down on tablets and phones, and drops the tilt on phones", () => {
    expect(scaleFor(1440)).toMatchObject({ move: 1, drift: 1, tilt: 1 });
    expect(scaleFor(900)).toMatchObject({ move: 0.6, tilt: 1 });
    expect(scaleFor(390)).toMatchObject({ move: 0.3, drift: 0.18, tilt: 0 });
  });
});

describe("cardPose", () => {
  it("sits exactly at its rest pose once entered and not yet leaving", () => {
    for (let fly = 0; fly < 6; fly++) {
      const rest = cardPose(pose(), card(fly), wide, 1, 0, 1, 0, 0);
      expect(rest).toEqual({ x: 0, y: 0, rotate: -2, scale: 1, opacity: 1 });
    }
  });

  it("starts displaced, tilted, smaller and partly faded, but the lead card never below 0.6", () => {
    const start = cardPose(pose(), card(0), wide, 0, 0, 1, 0, 0);
    expect(start.y).toBeGreaterThan(40);
    expect(start.scale).toBeLessThan(1);
    expect(start.opacity).toBeGreaterThanOrEqual(0.6);
    expect(cardPose(pose(), card(3), wide, 0, 0, 1, 0, 0).opacity).toBe(0);
  });

  it("comes in from different directions for different cards", () => {
    const starts = [0, 1, 2, 3].map((fly) => cardPose(pose(), card(fly), wide, 0, 0, 1, 0, 0));
    expect(new Set(starts.map((s) => Math.sign(s.y))).size).toBeGreaterThan(1);
    expect(new Set(starts.map((s) => Math.round(s.x))).size).toBeGreaterThan(2);
  });

  it("sends the outward offset away from the copy on either side", () => {
    const right = cardPose(pose(), card(2), wide, 0, 0, 1, 0, 0).x;
    const left = cardPose(pose(), card(2, { outward: -1 }), wide, 0, 0, 1, 0, 0).x;
    expect(right).toBeGreaterThan(0);
    expect(left).toBe(-right);
  });

  it("rises monotonically as the section enters, with no jump between small steps", () => {
    let last = -1;
    let lastY = Infinity;
    for (let enter = 0; enter <= 1.0001; enter += 0.01) {
      const p = cardPose(pose(), card(2), wide, enter, 0, 1, 0, 0);
      expect(p.opacity).toBeGreaterThanOrEqual(last);
      expect(p.y).toBeLessThanOrEqual(lastY + 1e-9);
      expect(Math.abs(p.y - (Number.isFinite(lastY) ? lastY : p.y))).toBeLessThan(2);
      last = p.opacity;
      lastY = p.y;
    }
  });

  it("drifts up and apart on exit by depth, shrinks a little and never fades out", () => {
    const near = cardPose(pose(), card(0, { depth: 20 }), wide, 1, 1, 1, 0, 0);
    const far = cardPose(pose(), card(0, { depth: -10 }), wide, 1, 1, 1, 0, 0);
    expect(near.y).toBeLessThan(far.y);
    expect(near.scale).toBeLessThan(1);
    expect(near.opacity).toBeGreaterThan(0.4);
  });

  it("is limited by the step window as well as the section", () => {
    const section = cardPose(pose(), card(0), wide, 1, 0, 1, 0, 0);
    const stepping = cardPose(pose(), card(0), wide, 1, 0, 0.2, 0, 0);
    expect(stepping.y).toBeGreaterThan(section.y);
  });

  it("adds the pointer parallax by depth, and keeps the phone move under 24px", () => {
    const moved = cardPose(pose(), card(0), wide, 1, 0, 1, 1, -1);
    expect([moved.x, moved.y]).toEqual([10, -10]);
    const phone = scaleFor(390);
    for (let fly = 0; fly < 6; fly++) {
      const p = cardPose(pose(), card(fly), phone, 0, 0, 1, 0, 0);
      expect(Math.abs(p.y)).toBeLessThanOrEqual(34);
      expect(Math.abs(p.x)).toBeLessThanOrEqual(24);
      expect(p.rotate).toBeCloseTo(-0.7, 6);
    }
  });

  it("keeps the card that holds real controls from fading below its floor", () => {
    expect(cardPose(pose(), card(3, { still: true }), wide, 0, 0, 1, 0, 0).opacity).toBe(0.4);
  });
});

describe("stickers, chips and notes", () => {
  const chip = (depth: number, speed: number, p: number) =>
    stickerPose(pose(), depth, wide, 1, 0, 1, 0, 0, (0.5 - p) * speed);

  it("pop in late, growing towards 1, and rest at 1", () => {
    expect(stickerPose(pose(), 20, wide, 1, 0, 1, 0, 0)).toMatchObject({ y: 0, scale: 1, opacity: 1 });
    expect(stickerPose(pose(), 20, wide, 0.3, 0, 1, 0, 0).opacity).toBe(0);
    let last = 0;
    for (let enter = 0.4; enter <= 0.85; enter += 0.01) {
      const grown = stickerPose(pose(), 20, wide, enter, 0, 1, 0, 0).scale;
      expect(grown).toBeGreaterThanOrEqual(last - 0.02);
      expect(grown).toBeLessThanOrEqual(1.05);
      last = grown;
    }
  });

  it("drift with the section progress at their own speed, and are still when centred", () => {
    expect(chip(10, 50, 0.5).y).toBe(0);
    const early = chip(10, 50, 0.2).y;
    const late = chip(10, 50, 0.8).y;
    expect(early).toBeGreaterThan(0);
    expect(late).toBeCloseTo(-early, 9);
    expect(chip(10, -50, 0.2).y).toBeCloseTo(-early, 9);
  });

  it("write their ink in after the cards, and rest settled", () => {
    expect(notePose(pose(), 16, wide, 1, 0, 1, 0, 0)).toMatchObject({ y: 0, opacity: 1 });
    expect(notePose(pose(), 16, wide, 0.5, 0, 1, 0, 0).opacity).toBe(0);
  });
});

describe("wordReveal", () => {
  it("lets a heading of more than twelve words reach full opacity at rest", () => {
    for (let index = 0; index < 40; index++) expect(wordReveal(1, index)).toBe(1);
  });

  it("reveals words in sequence and finishes every word of a long headline by the time the section is entered", () => {
    expect(wordReveal(1, 10)).toBe(1);
    expect(wordReveal(0.4, 0)).toBeGreaterThan(wordReveal(0.4, 8));
    for (let word = 1; word < 12; word++) expect(wordReveal(0.7, word)).toBeLessThanOrEqual(wordReveal(0.7, word - 1));
  });
});

describe("stepWindow", () => {
  const at = (u: number, index: number, lead = false, tail = false): StepWindow =>
    stepWindow({ ei: 0, eo: 0, lt: 0 }, u, index, lead, tail);

  it("has a step fully in while it is the current one, and fully out once the next is current", () => {
    expect(at(2.5, 2)).toMatchObject({ ei: 1, eo: 0 });
    expect(at(3.5, 2)).toMatchObject({ ei: 1, eo: 1 });
    expect(at(1.5, 2).ei).toBe(0);
  });

  it("crosses the two steps over a window around the boundary, so each pair sums to a continuous hand-over", () => {
    let last = 0;
    for (let u = 2.7; u <= 3.3; u += 0.01) {
      const out = at(u, 2).eo;
      const incoming = at(u, 3).ei;
      expect(out).toBeGreaterThanOrEqual(last);
      expect(Math.abs(out - last)).toBeLessThan(0.08);
      expect(incoming).toBeGreaterThanOrEqual(0);
      last = out;
    }
    expect(at(3, 2).eo).toBeCloseTo(0.5, 5);
    expect(at(3, 3).ei).toBeCloseTo(0.5, 5);
  });

  it("holds the first step fully in at the start and the last step fully in through the hold", () => {
    expect(at(0, 0, true)).toMatchObject({ ei: 1, eo: 0, lt: 1 });
    expect(at(4, 3, false, true).eo).toBe(0);
    expect(at(0, 0, true).lt).toBe(1);
  });

  it("gives progress through the step as lt", () => {
    expect(at(2.25, 2).lt).toBeCloseTo(0.25, 6);
    expect(at(1.5, 2).lt).toBe(0);
    expect(at(4, 2).lt).toBe(1);
  });
});

describe("reveal and deck", () => {
  it("reveals a part of the conversation over a short run of the step", () => {
    expect(reveal(0.05, 0.06, 6)).toBe(0);
    expect(reveal(0.1, 0.06, 6)).toBeCloseTo(0.24, 6);
    expect(reveal(0.3, 0.06, 6)).toBe(1);
  });

  it("reads a non-finite value as 0", () => {
    expect(reveal(Number.NaN, 0.06, 6)).toBe(0);
  });
});

describe("stations and lines of the topic map", () => {
  it("rest exactly in place once the section has entered and is not leaving", () => {
    expect(starPose(pose(), 0.4, wide, 1, 0)).toEqual({ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 });
  });

  it("start small and invisible and arrive in order of their lag, without moving sideways", () => {
    const start = starPose(pose(), 0, wide, 0, 0);
    expect([start.x, start.y, start.scale, start.opacity]).toEqual([0, 0, 0.5, 0]);
    const early = starPose(pose(), 0, wide, 0.5, 0);
    const late = starPose(pose(), 1, wide, 0.5, 0);
    expect(early.opacity).toBeGreaterThan(late.opacity);
    expect(early.x).toBe(0);
  });

  it("rise monotonically with the section progress", () => {
    let last = -1;
    for (let enter = 0; enter <= 1.0001; enter += 0.02) {
      const { opacity } = starPose(pose(), 0.5, wide, enter, 0);
      expect(opacity).toBeGreaterThanOrEqual(last);
      last = opacity;
    }
  });

  it("drift up and dim a little on exit, never vanishing", () => {
    const leaving = starPose(pose(), 0, wide, 1, 1);
    expect(leaving.y).toBeLessThan(0);
    expect(leaving.opacity).toBeGreaterThan(0.6);
  });

  it("draw a line after its stations start to arrive and have it fully drawn at rest", () => {
    expect(edgeDraw(0.3, 0)).toBe(0);
    expect(edgeDraw(1, 1)).toBe(1);
    for (let lag = 0; lag <= 1; lag += 0.25) expect(edgeDraw(1, lag)).toBe(1);
    expect(edgeDraw(0.7, 0)).toBeGreaterThan(edgeDraw(0.6, 0));
  });
});
