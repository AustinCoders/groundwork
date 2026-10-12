import { describe, expect, it } from "vitest";
import {
  CARD_H,
  CARD_W,
  DECOR,
  DOCK,
  HOME_LINE,
  HUB_LINE,
  layoutMetro,
  LINES,
  REF_H,
  REF_W,
  type Box,
  type Metro,
  type Point,
  type StationInput,
} from "@/lib/metro";
import { TOPIC_CATEGORIES } from "@/lib/topicCategories";
import { onShelf } from "@/lib/topicShelf";
import { topicsNavWithStats } from "@/lib/topicStats";

const HALF_LINE = 4.5;

const shelf = topicsNavWithStats().filter((topic) => onShelf(topic.id));
const inputs: StationInput[] = [
  ...shelf.map((topic) => ({ id: topic.id, name: topic.name, category: topic.category, lit: topic.written > 0 })),
  { id: "interview", name: "Interview book", category: null, lit: true },
];
const metro = layoutMetro(inputs, TOPIC_CATEGORIES);

const apart = (a: Box, b: Box, gap = 0) =>
  a.x + a.w + gap <= b.x || b.x + b.w + gap <= a.x || a.y + a.h + gap <= b.y || b.y + b.h + gap <= a.y;
const within = (box: Box, margin = 0) =>
  box.x >= margin && box.y >= margin && box.x + box.w <= REF_W - margin && box.y + box.h <= REF_H - margin;
const disc = (s: { x: number; y: number; radius: number }): Box => ({
  x: s.x - s.radius,
  y: s.y - s.radius,
  w: s.radius * 2,
  h: s.radius * 2,
});

function samplePath(d: string): Point[] {
  const out: Point[] = [];
  const tokens = [...d.matchAll(/([MLA])([^MLA]*)/g)];
  let at: Point = [0, 0];
  for (const [, command, body] of tokens) {
    const n = body
      .trim()
      .split(/[\s,]+/)
      .map(Number);
    if (command === "M") {
      at = [n[0], n[1]];
      out.push(at);
    } else if (command === "L") {
      const to: Point = [n[0], n[1]];
      const steps = Math.max(1, Math.ceil(Math.hypot(to[0] - at[0], to[1] - at[1])));
      for (let k = 1; k <= steps; k++)
        out.push([at[0] + ((to[0] - at[0]) * k) / steps, at[1] + ((to[1] - at[1]) * k) / steps]);
      at = to;
    } else {
      const [r, , , , sweep, x, y] = n;
      const mid: Point = [(at[0] + x) / 2, (at[1] + y) / 2];
      const half = Math.hypot(x - at[0], y - at[1]) / 2;
      const lift = Math.sqrt(Math.max(0, r * r - half * half));
      const nx = -(y - at[1]) / (2 * half);
      const ny = (x - at[0]) / (2 * half);
      const sign = sweep === 1 ? 1 : -1;
      const centre: Point = [mid[0] + nx * lift * sign, mid[1] + ny * lift * sign];
      const a0 = Math.atan2(at[1] - centre[1], at[0] - centre[0]);
      let a1 = Math.atan2(y - centre[1], x - centre[0]);
      if (sweep === 1 && a1 < a0) a1 += Math.PI * 2;
      if (sweep === 0 && a1 > a0) a1 -= Math.PI * 2;
      for (let k = 1; k <= 40; k++) {
        const angle = a0 + ((a1 - a0) * k) / 40;
        out.push([centre[0] + r * Math.cos(angle), centre[1] + r * Math.sin(angle)]);
      }
      at = [x, y];
    }
  }
  return out;
}

function distanceToPath(point: Point, samples: Point[]): number {
  let best = Infinity;
  for (const p of samples) best = Math.min(best, Math.hypot(p[0] - point[0], p[1] - point[1]));
  return best;
}

function boxToSamples(box: Box, samples: Point[]): number {
  let best = Infinity;
  for (const [x, y] of samples) {
    const dx = Math.max(box.x - x, 0, x - (box.x + box.w));
    const dy = Math.max(box.y - y, 0, y - (box.y + box.h));
    best = Math.min(best, Math.hypot(dx, dy));
  }
  return best;
}

function problems(layout: Metro): string[] {
  const found: string[] = [];
  const tracks = layout.lines.map((line) => ({ id: line.id, samples: samplePath(line.d) }));
  for (const s of layout.stations) {
    if (!within(disc(s), 5)) found.push(`${s.id} leaves the canvas`);
    if (s.bare) continue;
    if (!within(s.label, 5)) found.push(`${s.id} label leaves the canvas`);
    for (const line of layout.lines)
      if (!apart(s.label, line.badge)) found.push(`${s.id} label meets the ${line.id} badge`);
    for (const track of tracks)
      if (boxToSamples(s.label, track.samples) < HALF_LINE) found.push(`${s.id} label meets the ${track.id} track`);
    for (const other of layout.stations) {
      if (other.id <= s.id) continue;
      if (!apart(disc(s), disc(other))) found.push(`stations ${s.id} and ${other.id} overlap`);
      if (!other.bare && !apart(s.label, other.label)) found.push(`labels of ${s.id} and ${other.id} collide`);
    }
    for (const other of layout.stations)
      if (other.id !== s.id && !apart(s.label, disc(other))) found.push(`${s.id} label covers station ${other.id}`);
  }
  return found;
}

const shuffled = <T>(list: T[]): T[] => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = (i * 7 + 3) % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

describe("the metro layout of the topic map", () => {
  it("gives every topic exactly one station, inside the canvas, with no overflow", () => {
    expect(metro.stations.map((s) => s.id).sort()).toEqual(inputs.map((i) => i.id).sort());
    expect(new Set(metro.stations.map((s) => s.id)).size).toBe(inputs.length);
    expect(metro.overflow).toEqual([]);
    expect(metro.stations.filter((s) => s.bare)).toEqual([]);
    expect(problems(metro)).toEqual([]);
  });

  it("draws every line with horizontal, vertical or 45 degree legs only", () => {
    for (const line of metro.lines) {
      expect(line.points.length, line.id).toBeGreaterThanOrEqual(2);
      for (let i = 0; i < line.points.length - 1; i++) {
        const dx = Math.abs(line.points[i + 1][0] - line.points[i][0]);
        const dy = Math.abs(line.points[i + 1][1] - line.points[i][1]);
        expect(dx > 0.01 || dy > 0.01, `${line.id} leg ${i} has length`).toBe(true);
        expect(dx < 0.01 || dy < 0.01 || Math.abs(dx - dy) < 0.01, `${line.id} leg ${i}`).toBe(true);
      }
      for (const point of line.points) {
        expect(point[0]).toBeGreaterThanOrEqual(0);
        expect(point[0]).toBeLessThanOrEqual(REF_W);
        expect(point[1]).toBeGreaterThanOrEqual(0);
        expect(point[1]).toBeLessThanOrEqual(REF_H);
      }
      expect(line.d).toMatch(/^M[\d. -]+(L[\d. -]+A[\d. -]+)*L[\d. -]+$/);
      expect(line.d).not.toContain("NaN");
    }
  });

  it("has one line per category and no line for an empty one, each with a badge and a terminus bar", () => {
    expect(metro.lines.map((l) => l.id).sort()).toEqual(TOPIC_CATEGORIES.map((category) => category.id).sort());
    for (const line of metro.lines) {
      expect(line.bar).toMatch(/^M[\d. -]+L[\d. -]+$/);
      expect(within(line.badge, 2), `${line.id} badge`).toBe(true);
      expect(line.label).toBe(TOPIC_CATEGORIES.find((category) => category.id === line.id)!.label);
    }
    const sparse = layoutMetro(
      inputs.filter((i) => i.category !== "ai"),
      TOPIC_CATEGORIES
    );
    expect(sparse.lines.some((l) => l.id === "ai")).toBe(false);
  });

  it("puts each station on its line, including after corners, at the arc length it was placed at", () => {
    const extra: StationInput[] = [
      ...inputs,
      { id: "zig", name: "Zig", category: "languages", lit: false },
      { id: "lua", name: "Lua", category: "languages", lit: false },
      { id: "rails", name: "Rails", category: "backend", lit: false },
    ];
    for (const layout of [metro, layoutMetro(extra, TOPIC_CATEGORIES)]) {
      const tracks = new Map(layout.lines.map((line) => [line.id, samplePath(line.d)]));
      for (const station of layout.stations)
        for (const line of station.lines)
          expect(distanceToPath([station.x, station.y], tracks.get(line)!), `${station.id} on ${line}`).toBeLessThan(
            line === station.line ? 0.6 : 1.6
          );
    }
  });

  it("makes interchanges only between existing lines and topics", () => {
    const lineIds = new Set(LINES.map((line) => line.id));
    const joined = metro.stations.filter((s) => s.lines.length > 1);
    expect(joined.map((s) => s.id).sort()).toEqual(["databases", "docker", "js", "typescript"]);
    for (const station of joined) {
      expect(station.lines[0]).toBe(station.line);
      for (const id of station.lines) expect(lineIds.has(id), `${station.id} on ${id}`).toBe(true);
    }
  });

  it("spaces the stations of a line evenly", () => {
    for (const line of metro.lines) {
      const def = LINES.find((d) => d.id === line.id)!;
      const own = metro.stations
        .filter((s) => s.lines.includes(line.id))
        .sort((a, b) => def.stations.indexOf(a.id) - def.stations.indexOf(b.id));
      for (let i = 1; i < own.length; i++) {
        const slots = def.stations.indexOf(own[i].id) - def.stations.indexOf(own[i - 1].id);
        const gap = Math.hypot(own[i].x - own[i - 1].x, own[i].y - own[i - 1].y);
        expect(gap, `${line.id} ${own[i - 1].id} to ${own[i].id}`).toBeLessThanOrEqual(def.pitch * slots + 0.5);
        expect(gap).toBeGreaterThan(def.pitch * slots * 0.9);
      }
    }
  });

  it("lists the stations line by line for reading and tab order", () => {
    const ids = metro.stations.map((s) => s.id);
    expect(ids.slice(0, 4)).toEqual(["js", "python", "java", "typescript"]);
    expect(ids.indexOf("react")).toBeGreaterThan(ids.indexOf("js"));
    expect(ids.indexOf("dsa")).toBeLessThan(ids.indexOf("interview"));
    expect(ids.indexOf("interview")).toBeLessThan(ids.indexOf("system-design"));
  });

  it("opens every card in free space, never over a label, a station or a badge, with a leader back to its station", () => {
    for (const s of metro.stations) {
      expect(s.card.w).toBe(CARD_W);
      expect(s.card.h).toBe(CARD_H);
      expect(within(s.card), `${s.id} card inside the canvas`).toBe(true);
      expect(apart(s.card, disc(s), 6), `${s.id} card over its own station`).toBe(true);
      for (const other of metro.stations) {
        if (other.id === s.id) continue;
        expect(apart(s.card, other.label), `${s.id} card over ${other.id} label`).toBe(true);
        expect(apart(s.card, disc(other)), `${s.id} card over ${other.id}`).toBe(true);
      }
      for (const line of metro.lines)
        expect(apart(s.card, line.badge), `${s.id} card over ${line.id} badge`).toBe(true);
      expect(s.leader.line).toMatch(/^M[\d. -]+Q[\d. -]+$/);
      expect(s.leader.head).toMatch(/^M[\d. -]+L[\d. -]+L[\d. -]+$/);
    }
  });

  it("keeps the dock clear of tracks and labels, and the decor out of the way of everything but the dock", () => {
    const tracks = metro.lines.map((line) => ({ id: line.id, samples: samplePath(line.d) }));
    for (const track of tracks)
      expect(boxToSamples(DOCK, track.samples), `dock vs ${track.id}`).toBeGreaterThan(HALF_LINE);
    for (const s of metro.stations) expect(apart(DOCK, s.label), `dock vs ${s.id} label`).toBe(true);
    for (const [name, box] of Object.entries(DECOR)) {
      expect(within(box), name).toBe(true);
      for (const s of metro.stations) {
        expect(apart(box, s.label), `${name} vs ${s.id} label`).toBe(true);
        expect(apart(box, disc(s)), `${name} vs ${s.id}`).toBe(true);
      }
      for (const line of metro.lines) expect(apart(box, line.badge), `${name} vs ${line.id} badge`).toBe(true);
      for (const track of tracks)
        expect(boxToSamples(box, track.samples), `${name} vs ${track.id}`).toBeGreaterThan(HALF_LINE);
    }
  });

  it("parks a train that clears the line start and stops short of the first written station", () => {
    const js = metro.stations.find((s) => s.id === "js")!;
    const home = metro.lines.find((l) => l.id === HOME_LINE)!;
    expect(home.stop).toBeGreaterThanOrEqual(54);
    expect(Math.hypot(js.x - home.points[0][0], js.y - home.points[0][1])).toBeGreaterThan(home.stop);
    for (const line of metro.lines) {
      expect(line.stop).toBeGreaterThanOrEqual(54);
    }
  });

  it("keeps every line and station lag below 1 so the reveal always finishes", () => {
    const many = layoutMetro(
      [
        ...inputs,
        ...Array.from({ length: 14 }, (_, k) => ({
          id: `more-${k}`,
          name: `More ${k}`,
          category: "languages",
          lit: false,
        })),
      ],
      TOPIC_CATEGORIES
    );
    for (const line of many.lines) expect(line.lag).toBeLessThanOrEqual(0.9);
    for (const station of many.stations) {
      expect(station.lag).toBeGreaterThanOrEqual(0);
      expect(station.lag).toBeLessThanOrEqual(0.9);
    }
  });

  it("is deterministic, stable under shuffled input and rounds what it emits", () => {
    expect(layoutMetro(inputs, TOPIC_CATEGORIES)).toEqual(metro);
    expect(layoutMetro(shuffled(inputs), TOPIC_CATEGORIES)).toEqual(metro);
    const fresh = layoutMetro(
      inputs.map((i) => ({ ...i, name: `${i.name} ` })),
      TOPIC_CATEGORIES
    );
    expect(fresh.stations.map((s) => s.id)).toEqual(metro.stations.map((s) => s.id));
    for (const s of metro.stations) {
      for (const value of [s.x, s.y, s.label.x, s.label.y, s.card.x, s.card.y, s.lag])
        expect(Math.abs(value * 100 - Math.round(value * 100)), `${s.id}`).toBeLessThan(1e-6);
    }
  });

  it("extends the end of a line for a topic missing from the hand data, and gives unknown categories their own line", () => {
    const extra: StationInput[] = [
      ...inputs,
      { id: "zig", name: "Zig", category: "languages", lit: false },
      { id: "elixir", name: "Elixir", category: "languages", lit: false },
      { id: "rails", name: "Rails", category: "backend", lit: false },
      { id: "wasm", name: "WebAssembly", category: "brand-new", lit: false },
    ];
    const grown = layoutMetro(extra, TOPIC_CATEGORIES);
    expect(grown.stations).toHaveLength(extra.length);
    expect(grown.overflow).toEqual([]);
    expect(problems(grown)).toEqual([]);
    const lines = grown.lines.map((l) => l.id);
    expect(lines).toContain("other");
    expect(grown.stations.find((s) => s.id === "wasm")!.line).toBe("other");
    expect(grown.stations.find((s) => s.id === "zig")!.line).toBe("languages");
    expect(grown.lines.find((l) => l.id === "languages")!.points.length).toBeGreaterThan(
      metro.lines.find((l) => l.id === "languages")!.points.length
    );
    const zig = grown.stations.find((s) => s.id === "zig")!;
    const go = grown.stations.find((s) => s.id === "go")!;
    expect(Math.hypot(zig.x - go.x, zig.y - go.y)).toBeGreaterThan(50);
    for (const s of grown.stations) expect(within(s.card), `${s.id} card`).toBe(true);
  });

  it("does not slot a new topic far down a line whose listed topics are missing", () => {
    const few = layoutMetro(
      [
        { id: "js", name: "JavaScript", category: "languages", lit: true },
        { id: "zig", name: "Zig", category: "languages", lit: false },
      ],
      TOPIC_CATEGORIES
    );
    const js = few.stations.find((s) => s.id === "js")!;
    const zig = few.stations.find((s) => s.id === "zig")!;
    expect(Math.hypot(zig.x - js.x, zig.y - js.y)).toBeLessThan(80);
  });

  it("reports a line that cannot be extended far enough instead of stacking stations silently", () => {
    const crowd = layoutMetro(
      [
        ...inputs,
        ...Array.from({ length: 40 }, (_, k) => ({ id: `x-${k}`, name: `X${k}`, category: "ai", lit: false })),
      ],
      TOPIC_CATEGORIES
    );
    expect(crowd.overflow.length).toBeGreaterThan(0);
    for (const id of crowd.overflow) expect(crowd.stations.some((s) => s.id === id)).toBe(true);
  });

  it("keeps every label, disc, badge and track clear when any one topic becomes written", () => {
    for (const input of inputs) {
      const variant = layoutMetro(
        inputs.map((i) => ({ ...i, lit: i.lit || i.id === input.id })),
        TOPIC_CATEGORIES
      );
      expect(variant.overflow, `${input.id} written`).toEqual([]);
      expect(problems(variant), `${input.id} written`).toEqual([]);
    }
  });
});

describe("the metro hand data", () => {
  it("names only topics that exist, and every category has a line", () => {
    const ids = new Set(inputs.map((i) => i.id));
    for (const line of LINES) for (const id of line.stations) expect(ids.has(id), `${line.id} lists ${id}`).toBe(true);
    for (const category of TOPIC_CATEGORIES)
      expect(
        LINES.some((line) => line.id === category.id),
        `${category.id} has a line`
      ).toBe(true);
    for (const line of LINES) {
      if (line.id === "other") continue;
      expect(
        TOPIC_CATEGORIES.some((category) => category.id === line.id),
        `${line.id} is a category`
      ).toBe(true);
    }
    expect(LINES.some((line) => line.id === HUB_LINE)).toBe(true);
    expect(LINES.some((line) => line.id === HOME_LINE)).toBe(true);
  });

  it("puts every known topic on the line of its own category", () => {
    for (const station of metro.stations) {
      const input = inputs.find((i) => i.id === station.id)!;
      expect(station.line).toBe(input.category ?? HUB_LINE);
    }
  });
});
