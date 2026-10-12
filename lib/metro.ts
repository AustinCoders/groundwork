export const REF_W = 700;
export const REF_H = 680;
export const CARD_W = 232;
export const CARD_H = 124;
export const HUB = "hub";
export const HUB_LINE = "cs";
export const HOME_LINE = "languages";

const STRAY_LINE = "other";
const STRAY_LABEL = "More";
const LINE_WIDTH = 9;
const CORNER = 24;
const BADGE_H = 26;
const TRAIN = 54;
const WINDOW_STEP = 8;
const MARGIN = 6;
const EDGE = 34;
const CROWD_STRIDE = 4;
const LINE_LAG_STEP = 0.08;
const STATION_LAG_STEP = 1 / 12;
const STATION_LAG_JITTER = 0.2;
const LAG_MAX = 0.9;
const MEMO_SIZE = 8;

export type Point = [number, number];
type Side = 1 | -1;

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface StationInput {
  id: string;
  name: string;
  category: string | null;
  lit: boolean;
}

interface CategoryInput {
  id: string;
  label: string;
}

interface Leader {
  line: string;
  head: string;
}

export interface Station {
  id: string;
  line: string;
  lines: string[];
  lit: boolean;
  bare: boolean;
  x: number;
  y: number;
  radius: number;
  align: "left" | "right" | "center";
  label: Box;
  card: Box;
  leader: Leader;
  lag: number;
}

export interface MetroLine {
  id: string;
  label: string;
  d: string;
  points: Point[];
  badge: Box;
  bar: string;
  stop: number;
  lag: number;
}

export interface Metro {
  lines: MetroLine[];
  stations: Station[];
  overflow: string[];
}

interface LineDef {
  id: string;
  badge: { side: "left" | "right" | "above" | "below" };
  path: Point[];
  first?: number;
  pitch: number;
  stations: string[];
}

export const LINES: LineDef[] = [
  {
    id: "languages",
    badge: { side: "left" },
    path: [
      [120, 118],
      [666, 118],
    ],
    first: 86,
    pitch: 60,
    stations: ["js", "python", "java", "typescript", "cpp", "rust", "ruby", "go"],
  },
  {
    id: "web",
    badge: { side: "left" },
    path: [
      [96, 27],
      [206, 27],
      [206, 380],
    ],
    pitch: 60,
    stations: ["js", "react", "html", "css", "nextjs"],
  },
  {
    id: "backend",
    badge: { side: "above" },
    path: [
      [386, 56],
      [386, 458],
    ],
    pitch: 60,
    stations: ["typescript", "node", "nestjs", "databases", "graphql", "docker"],
  },
  {
    id: "data",
    badge: { side: "right" },
    path: [
      [626, 298],
      [346, 298],
    ],
    first: 72,
    pitch: 56,
    stations: ["dbms", "mongodb", "redis", "databases"],
  },
  {
    id: "devops",
    badge: { side: "right" },
    path: [
      [576, 418],
      [346, 418],
    ],
    first: 70,
    pitch: 60,
    stations: ["kubernetes", "cloud-devops", "docker"],
  },
  {
    id: "cs",
    badge: { side: "left" },
    path: [
      [170, 492],
      [690, 492],
    ],
    first: 80,
    pitch: 100,
    stations: ["dsa", "interview", "system-design", "networks", "os"],
  },
  {
    id: "engineering",
    badge: { side: "left" },
    path: [
      [136, 630],
      [428, 630],
    ],
    first: 80,
    pitch: 60,
    stations: ["git", "testing", "security"],
  },
  {
    id: "ai",
    badge: { side: "right" },
    path: [
      [640, 604],
      [480, 604],
    ],
    first: 80,
    pitch: 60,
    stations: ["ai"],
  },
  {
    id: STRAY_LINE,
    badge: { side: "above" },
    path: [
      [56, 214],
      [56, 440],
    ],
    first: 70,
    pitch: 60,
    stations: [],
  },
];

export const DOCK: Box = { x: 404, y: 152, w: 236, h: 134 };

export const DECOR: Record<string, Box> = {
  sticker: { x: 440, y: 10, w: 112, h: 34 },
  note: { x: 580, y: 12, w: 108, h: 30 },
  chipA: { x: 418, y: 164, w: 150, h: 26 },
  chipB: { x: 430, y: 202, w: 100, h: 26 },
  chipC: { x: 450, y: 240, w: 124, h: 26 },
  key: { x: 576, y: 330, w: 112, h: 52 },
};

const LIT = { r: 15, nameChar: 8.2, wrap: 108, line: 20, chipLine: 19, minWidth: 94, gap: 9 };
const SOON = { r: 7, nameChar: 7.6, wrap: 96, line: 17, gap: 8 };
const RING = 4;

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10007) / 10007;
}

const snap = (n: number) => Math.round(n * 1e6) / 1e6;
const two = (n: number) => Math.round(n * 100) / 100;
const roundBox = (box: Box): Box => ({ x: two(box.x), y: two(box.y), w: two(box.w), h: two(box.h) });

interface Sampled {
  d: string;
  length: number;
  xs: number[];
  ys: number[];
  cum: number[];
}

function dedupe(points: Point[]): Point[] {
  const out: Point[] = [];
  for (const point of points) {
    const last = out[out.length - 1];
    if (!last || Math.abs(point[0] - last[0]) > 1e-6 || Math.abs(point[1] - last[1]) > 1e-6) out.push(point);
  }
  return out;
}

function rounded(raw: Point[], radius: number): Sampled {
  const points = dedupe(raw);
  const dirs: Point[] = [];
  const lens: number[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1][0] - points[i][0];
    const dy = points[i + 1][1] - points[i][1];
    const len = Math.sqrt(dx * dx + dy * dy);
    lens.push(len);
    dirs.push([dx / len, dy / len]);
  }
  const parts: string[] = [`M${points[0][0]} ${points[0][1]}`];
  const xs: number[] = [points[0][0]];
  const ys: number[] = [points[0][1]];
  const cum: number[] = [0];
  let cursor: Point = [points[0][0], points[0][1]];
  const push = (x: number, y: number) => {
    const last = xs.length - 1;
    cum.push(cum[last] + Math.sqrt((x - xs[last]) ** 2 + (y - ys[last]) ** 2));
    xs.push(x);
    ys.push(y);
  };
  const lineTo = (x: number, y: number) => {
    const dx = x - cursor[0];
    const dy = y - cursor[1];
    const len = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(1, Math.round(len));
    for (let k = 1; k <= steps; k++) push(cursor[0] + (dx * k) / steps, cursor[1] + (dy * k) / steps);
    cursor = [x, y];
  };
  for (let i = 1; i < points.length - 1; i++) {
    const a = dirs[i - 1];
    const b = dirs[i];
    const turn = Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1])));
    if (turn < 0.01) continue;
    const sign = a[0] * b[1] - a[1] * b[0] > 0 ? 1 : -1;
    const reach = Math.min(radius * Math.tan(turn / 2), lens[i - 1] / 2, lens[i] / 2);
    const r = reach / Math.tan(turn / 2);
    const from: Point = [points[i][0] - a[0] * reach, points[i][1] - a[1] * reach];
    const to: Point = [points[i][0] + b[0] * reach, points[i][1] + b[1] * reach];
    lineTo(from[0], from[1]);
    parts.push(`L${from[0].toFixed(2)} ${from[1].toFixed(2)}`);
    const centre: Point = [from[0] - a[1] * sign * r, from[1] + a[0] * sign * r];
    const start = Math.atan2(from[1] - centre[1], from[0] - centre[0]);
    const steps = Math.max(2, Math.ceil(turn * r));
    for (let k = 1; k <= steps; k++) {
      const angle = start + sign * turn * (k / steps);
      push(centre[0] + r * Math.cos(angle), centre[1] + r * Math.sin(angle));
    }
    parts.push(`A${r.toFixed(2)} ${r.toFixed(2)} 0 0 ${sign > 0 ? 1 : 0} ${to[0].toFixed(2)} ${to[1].toFixed(2)}`);
    cursor = to;
  }
  const last = points[points.length - 1];
  lineTo(last[0], last[1]);
  parts.push(`L${last[0]} ${last[1]}`);
  return { d: parts.join(""), length: cum[cum.length - 1], xs, ys, cum };
}

function at(path: Sampled, s: number): { x: number; y: number; angle: number } {
  const target = Math.max(0, Math.min(path.length, s));
  let low = 0;
  let high = path.cum.length - 2;
  while (low < high) {
    const mid = (low + high + 1) >> 1;
    if (path.cum[mid] <= target) low = mid;
    else high = mid - 1;
  }
  const span = path.cum[low + 1] - path.cum[low];
  const local = span > 0 ? (target - path.cum[low]) / span : 0;
  return {
    x: path.xs[low] + (path.xs[low + 1] - path.xs[low]) * local,
    y: path.ys[low] + (path.ys[low + 1] - path.ys[low]) * local,
    angle: snap(Math.atan2(path.ys[low + 1] - path.ys[low], path.xs[low + 1] - path.xs[low])),
  };
}

function closestArc(path: Sampled, x: number, y: number): number {
  let best = 0;
  let bestDistance = Infinity;
  for (let i = 0; i < path.xs.length; i++) {
    const d = (path.xs[i] - x) ** 2 + (path.ys[i] - y) ** 2;
    if (d < bestDistance) {
      bestDistance = d;
      best = i;
    }
  }
  return path.cum[best];
}

function extend(points: Point[], extra: number): { points: Point[]; short: number } {
  if (extra <= 0) return { points, short: 0 };
  const out = points.map((p) => [p[0], p[1]] as Point);
  const [x1, y1] = out[out.length - 2];
  const [x2, y2] = out[out.length - 1];
  let dx = Math.sign(x2 - x1);
  let dy = Math.sign(y2 - y1);
  let x = x2;
  let y = y2;
  let left = extra;
  for (let guard = 0; guard < 8 && left > 0; guard++) {
    const stepX = dx === 0 ? Infinity : (dx > 0 ? REF_W - EDGE - x : x - EDGE) / Math.abs(dx);
    const stepY = dy === 0 ? Infinity : (dy > 0 ? REF_H - EDGE - y : y - EDGE) / Math.abs(dy);
    const room = Math.max(0, Math.min(stepX, stepY, left));
    if (room > 1e-6) {
      x += dx * room;
      y += dy * room;
      if (guard === 0) out[out.length - 1] = [x, y];
      else out.push([x, y]);
      left -= room;
    }
    if (left > 0) {
      const toward = dx !== 0 ? (y < REF_H / 2 ? 1 : -1) : x < REF_W / 2 ? 1 : -1;
      [dx, dy] = dx !== 0 ? [0, toward] : [toward, 0];
    }
  }
  return { points: out, short: Math.max(0, left) };
}

function badgeLines(label: string): string[] {
  if (label.length <= 13) return [label];
  const words = label.split(" ");
  let best: string[] = [label];
  let widest = Infinity;
  for (let cut = 1; cut < words.length; cut++) {
    const lines = [words.slice(0, cut).join(" "), words.slice(cut).join(" ")];
    const width = Math.max(lines[0].length, lines[1].length);
    if (width < widest) {
      widest = width;
      best = lines;
    }
  }
  return best;
}

function badgeBox(label: string, start: Point, side: "left" | "right" | "above" | "below"): Box {
  const lines = badgeLines(label);
  const w = Math.round(Math.max(...lines.map((line) => line.length)) * 8.6 + 30);
  const h = lines.length > 1 ? 40 : BADGE_H;
  const [x, y] = start;
  if (side === "left") return { x: x - w, y: y - h / 2, w, h };
  if (side === "right") return { x, y: y - h / 2, w, h };
  if (side === "above") return { x: x - w / 2, y: y - h, w, h };
  return { x: x - w / 2, y, w, h };
}

function labelSize(input: StationInput): { w: number; h: number } {
  if (input.lit) {
    const natural = input.name.length * LIT.nameChar;
    const lines = Math.max(1, Math.ceil(natural / LIT.wrap));
    return { w: Math.max(Math.min(natural, LIT.wrap), LIT.minWidth), h: lines * LIT.line + LIT.chipLine };
  }
  const natural = input.name.length * SOON.nameChar * 1.04;
  const lines = Math.max(1, Math.ceil(natural / SOON.wrap));
  return { w: Math.min(natural, SOON.wrap) + (lines === 1 ? 3 : 0), h: lines * SOON.line };
}

function hits(a: Box, b: Box, gap: number): boolean {
  return a.x < b.x + b.w + gap && b.x < a.x + a.w + gap && a.y < b.y + b.h + gap && b.y < a.y + a.h + gap;
}

function crowds(box: Box, xs: number[], ys: number[], gap: number): boolean {
  for (let i = 0; i < xs.length; i += CROWD_STRIDE) {
    if (xs[i] > box.x - gap && xs[i] < box.x + box.w + gap && ys[i] > box.y - gap && ys[i] < box.y + box.h + gap)
      return true;
  }
  return false;
}

function disc(x: number, y: number, r: number): Box {
  return { x: x - r, y: y - r, w: r * 2, h: r * 2 };
}

function outside(box: Box, margin: number): number {
  return box.x < margin || box.y < margin || box.x + box.w > REF_W - margin || box.y + box.h > REF_H - margin ? 1 : 0;
}

type Align = "left" | "right" | "center";

function labelFor(
  spot: Spot,
  angle: number,
  gap: number,
  size: { w: number; h: number },
  side: Side,
  slide: number
): { box: Box; align: Align } {
  const nx = -Math.sin(angle) * side;
  const ny = Math.cos(angle) * side;
  const reach = spot.radius + gap + Math.abs(nx) * (size.w / 2) + Math.abs(ny) * (size.h / 2);
  const cx = spot.x + nx * reach + Math.cos(angle) * slide;
  const cy = spot.y + ny * reach + Math.sin(angle) * slide;
  const align = Math.abs(nx) > 0.5 ? (nx > 0 ? "left" : "right") : "center";
  return { box: { x: cx - size.w / 2, y: cy - size.h / 2, w: size.w, h: size.h }, align };
}

interface Spot {
  x: number;
  y: number;
  angles: number[];
  radius: number;
}

const RINGS = [0, 8, 16, 26, 40, 60, 90];
const SLIDES = [0, 14, -14, 28, -28, 44, -44, 60, -60, 80, -80, 110, -110];
const RASTER_STEP = 6;
const RASTER_REACH = 300;

let rasterOffsets: [number, number][] | null = null;

function rasterOrder(): [number, number][] {
  if (rasterOffsets) return rasterOffsets;
  const list: [number, number][] = [];
  for (let dy = -RASTER_REACH; dy <= RASTER_REACH; dy += RASTER_STEP)
    for (let dx = -RASTER_REACH; dx <= RASTER_REACH; dx += RASTER_STEP) list.push([dx, dy]);
  rasterOffsets = list.sort((a, b) => a[0] ** 2 + a[1] ** 2 - (b[0] ** 2 + b[1] ** 2) || a[0] - b[0] || a[1] - b[1]);
  return rasterOffsets;
}

function bestLabel(
  spot: Spot,
  gap: number,
  size: { w: number; h: number },
  preferred: Side,
  clashes: (box: Box) => number
): { box: Box; align: Align; clear: boolean } {
  let best = { ...labelFor(spot, spot.angles[0], gap, size, preferred, 0), score: Infinity };
  for (const extra of RINGS) {
    for (const slide of SLIDES) {
      for (const [turn, angle] of spot.angles.entries()) {
        for (const side of [preferred, -preferred as Side]) {
          const made = labelFor(spot, angle, gap + extra, size, side, slide);
          const score = snap(
            clashes(made.box) * 100 + Math.abs(slide) * 0.2 + (side === preferred ? 0 : 1.5) + extra * 0.3 + turn * 3
          );
          if (score < best.score) best = { ...made, score };
        }
      }
    }
    if (best.score < 100) return { box: best.box, align: best.align, clear: true };
  }
  const floor = (spot.radius + gap) ** 2;
  for (const [dx, dy] of rasterOrder()) {
    if (dx * dx + dy * dy < floor) continue;
    const box = { x: spot.x + dx - size.w / 2, y: spot.y + dy - size.h / 2, w: size.w, h: size.h };
    if (clashes(box) === 0) return { box, align: "center", clear: true };
  }
  return { box: best.box, align: best.align, clear: false };
}

interface Placement {
  id: string;
  line: string;
  index: number;
}

interface Window {
  box: Box;
  hit: number[];
  keep: boolean;
}

interface Windows {
  all: Window[];
  free: Window[];
  single: Map<number, Window[]>;
}

function windowsOf(blockers: Box[], keep: Box[]): Windows {
  const columns = Math.floor((REF_W - CARD_W - 8) / WINDOW_STEP) + 1;
  const rows = Math.floor((REF_H - CARD_H - 8) / WINDOW_STEP) + 1;
  const all: Window[] = [];
  for (let row = 0; row < rows; row++)
    for (let column = 0; column < columns; column++)
      all.push({
        box: { x: 4 + column * WINDOW_STEP, y: 4 + row * WINDOW_STEP, w: CARD_W, h: CARD_H },
        hit: [],
        keep: false,
      });
  const touch = (other: Box, gap: number, visit: (window: Window) => void) => {
    const c0 = Math.max(0, Math.floor((other.x - gap - CARD_W - 4) / WINDOW_STEP));
    const c1 = Math.min(columns - 1, Math.ceil((other.x + other.w + gap - 4) / WINDOW_STEP));
    const r0 = Math.max(0, Math.floor((other.y - gap - CARD_H - 4) / WINDOW_STEP));
    const r1 = Math.min(rows - 1, Math.ceil((other.y + other.h + gap - 4) / WINDOW_STEP));
    for (let row = r0; row <= r1; row++)
      for (let column = c0; column <= c1; column++) {
        const window = all[row * columns + column];
        if (hits(window.box, other, gap)) visit(window);
      }
  };
  blockers.forEach((other, index) => touch(other, 6, (window) => window.hit.push(index)));
  for (const other of keep) touch(other, 4, (window) => (window.keep = true));
  const free: Window[] = [];
  const single = new Map<number, Window[]>();
  for (const window of all) {
    if (window.keep) continue;
    if (window.hit.length === 0) free.push(window);
    else if (window.hit.length === 1) single.set(window.hit[0], [...(single.get(window.hit[0]) ?? []), window]);
  }
  return { all, free, single };
}

function distanceTo(box: Box, station: { x: number; y: number }): number {
  return snap(
    Math.sqrt(
      Math.max(box.x - station.x, 0, station.x - (box.x + box.w)) ** 2 +
        Math.max(box.y - station.y, 0, station.y - (box.y + box.h)) ** 2
    )
  );
}

function placeCard(station: { x: number; y: number; radius: number }, windows: Windows, own: number): Box {
  const mine = disc(station.x, station.y, station.radius + 8);
  let best: { box: Box; cost: number } | null = null;
  for (const list of [windows.free, windows.single.get(own) ?? []]) {
    for (const window of list) {
      if (hits(window.box, mine, 0)) continue;
      const cost = distanceTo(window.box, station);
      if (!best || cost < best.cost || (cost === best.cost && window.box.y < best.box.y))
        best = { box: window.box, cost };
    }
  }
  if (best) return best.box;
  let spare = windows.all[0].box;
  let near = Infinity;
  for (const window of windows.all) {
    if (hits(window.box, mine, 0)) continue;
    const cost = distanceTo(window.box, station);
    if (cost < near) {
      near = cost;
      spare = window.box;
    }
  }
  return spare;
}

function pointer(station: { id: string; x: number; y: number; radius: number }, card: Box): Leader {
  const from = { x: card.x + card.w / 2, y: card.y + card.h / 2 };
  const dx = station.x - from.x;
  const dy = station.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / length;
  const uy = dy / length;
  const reach = station.radius + 7;
  const tip = { x: station.x - ux * reach, y: station.y - uy * reach };
  const bow = (hash(station.id) - 0.5) * 0.3 + 0.12;
  const control = { x: (from.x + tip.x) / 2 - uy * length * bow, y: (from.y + tip.y) / 2 + ux * length * bow };
  const tx = tip.x - control.x;
  const ty = tip.y - control.y;
  const tl = Math.sqrt(tx * tx + ty * ty) || 1;
  const hx = tx / tl;
  const hy = ty / tl;
  const wing = (turn: number) => ({
    x: tip.x - (hx * Math.cos(turn) - hy * Math.sin(turn)) * 9,
    y: tip.y - (hx * Math.sin(turn) + hy * Math.cos(turn)) * 9,
  });
  const a = wing(0.5);
  const b = wing(-0.5);
  const f = (n: number) => n.toFixed(1);
  return {
    line: `M${f(from.x)} ${f(from.y)} Q${f(control.x)} ${f(control.y)} ${f(tip.x)} ${f(tip.y)}`,
    head: `M${f(a.x)} ${f(a.y)} L${f(tip.x)} ${f(tip.y)} L${f(b.x)} ${f(b.y)}`,
  };
}

const memo = new Map<string, Metro>();

export function layoutMetro(inputs: StationInput[], categories: CategoryInput[]): Metro {
  const signature = JSON.stringify([
    [...inputs].sort((a, b) => (a.id < b.id ? -1 : 1)).map((i) => [i.id, i.name, i.category, i.lit]),
    categories.map((c) => [c.id, c.label]),
  ]);
  const cached = memo.get(signature);
  if (cached) return cached;
  const result = compute(inputs, categories);
  if (memo.size >= MEMO_SIZE) memo.clear();
  memo.set(signature, result);
  return result;
}

function compute(inputs: StationInput[], categories: CategoryInput[]): Metro {
  const byId = new Map(inputs.map((input) => [input.id, input]));
  const names = new Map(categories.map((category) => [category.id, category.label]));
  const lineIds = new Set(LINES.map((def) => def.id));
  const lineOf = (input: StationInput): string => {
    const category = input.category === null ? HUB_LINE : input.category;
    return lineIds.has(category) && category !== STRAY_LINE ? category : STRAY_LINE;
  };
  const known = new Set(LINES.flatMap((def) => def.stations));
  const extras = new Map<string, string[]>();
  for (const input of [...inputs].sort((a, b) => (a.id < b.id ? -1 : 1))) {
    if (known.has(input.id)) continue;
    const line = lineOf(input);
    extras.set(line, [...(extras.get(line) ?? []), input.id]);
  }

  const slotsOf = new Map<string, string[]>();
  for (const def of LINES) {
    const present = def.stations.map((id, index) => (byId.has(id) ? index : -1));
    const last = Math.max(...present);
    const slots: string[] = def.stations.slice(0, last + 1);
    for (const id of extras.get(def.id) ?? []) slots.push(id);
    slotsOf.set(def.id, slots);
  }
  const active = LINES.filter((def) => slotsOf.get(def.id)!.some((id) => byId.has(id)));
  const defs = new Map(active.map((def) => [def.id, def]));

  const bases = new Map(active.map((def) => [def.id, rounded(def.path, CORNER)]));
  const firsts = new Map<string, number>();
  for (const def of active) if (def.first !== undefined) firsts.set(def.id, def.first);
  for (let pass = 0; pass < active.length; pass++) {
    let progress = false;
    for (const def of active) {
      if (firsts.has(def.id)) continue;
      const slots = slotsOf.get(def.id)!;
      for (let index = 0; index < slots.length; index++) {
        const input = byId.get(slots[index]);
        if (!input) continue;
        const home = defs.get(lineOf(input));
        if (!home || home.id === def.id || !firsts.has(home.id)) continue;
        const homeSlot = slotsOf.get(home.id)!.indexOf(slots[index]);
        if (homeSlot < 0) continue;
        const where = at(bases.get(home.id)!, firsts.get(home.id)! + homeSlot * home.pitch);
        firsts.set(def.id, closestArc(bases.get(def.id)!, where.x, where.y) - index * def.pitch);
        progress = true;
        break;
      }
    }
    if (!progress) break;
  }
  for (const def of active) if (!firsts.has(def.id)) firsts.set(def.id, 80);

  const paths = new Map<string, Sampled>();
  const waypoints = new Map<string, Point[]>();
  const overflow: string[] = [];
  const arcOf = (line: string, index: number) => firsts.get(line)! + index * defs.get(line)!.pitch;
  for (const def of active) {
    const needed = arcOf(def.id, slotsOf.get(def.id)!.length - 1) + 40;
    const base = bases.get(def.id)!;
    const grown = needed > base.length ? extend(def.path, needed - base.length) : { points: def.path, short: 0 };
    waypoints.set(
      def.id,
      grown.points.map((p) => [two(p[0]), two(p[1])] as Point)
    );
    paths.set(def.id, needed > base.length ? rounded(grown.points, CORNER) : base);
  }

  const placements: Placement[] = [];
  for (const def of active)
    slotsOf.get(def.id)!.forEach((id, index) => {
      if (!byId.has(id)) return;
      placements.push({ id, line: def.id, index });
      if (arcOf(def.id, index) > paths.get(def.id)!.length - 1) overflow.push(id);
    });
  const home = new Map<string, Placement>();
  const joined = new Map<string, string[]>();
  for (const item of placements) {
    if (!home.has(item.id) || item.line === lineOf(byId.get(item.id)!)) home.set(item.id, item);
    joined.set(item.id, [...(joined.get(item.id) ?? []), item.line]);
  }

  const lines: MetroLine[] = active.map((def, index) => {
    const path = paths.get(def.id)!;
    const label = names.get(def.id) ?? STRAY_LABEL;
    const end = at(path, path.length);
    const bx = Math.cos(end.angle + Math.PI / 2) * 11;
    const by = Math.sin(end.angle + Math.PI / 2) * 11;
    const list = slotsOf.get(def.id)!;
    const present = list.filter((id) => byId.has(id));
    const target = present.find((id) => byId.get(id)!.lit) ?? present[0];
    return {
      id: def.id,
      label,
      d: path.d,
      points: waypoints.get(def.id)!,
      badge: roundBox(badgeBox(label, def.path[0], def.badge.side)),
      bar: `M${(end.x - bx).toFixed(1)} ${(end.y - by).toFixed(1)}L${(end.x + bx).toFixed(1)} ${(end.y + by).toFixed(1)}`,
      stop: two(Math.max(TRAIN, arcOf(def.id, list.indexOf(target)) - 20)),
      lag: Math.min(LAG_MAX, two(index * LINE_LAG_STEP)),
    };
  });

  const discs: Box[] = [];
  const spots = new Map<string, Spot & { line: string; index: number }>();
  for (const item of home.values()) {
    const where = at(paths.get(item.line)!, Math.min(arcOf(item.line, item.index), paths.get(item.line)!.length));
    const input = byId.get(item.id)!;
    const others = (joined.get(item.id) ?? []).filter((line) => line !== item.line);
    const radius = (input.lit ? LIT.r : SOON.r) + (others.length > 0 ? RING : 0) + 3;
    const angles = [where.angle];
    for (const other of others) {
      const slot = slotsOf.get(other)!.indexOf(item.id);
      angles.push(at(paths.get(other)!, arcOf(other, slot)).angle);
    }
    spots.set(item.id, { x: where.x, y: where.y, angles, radius, line: item.line, index: item.index });
    discs.push(disc(where.x, where.y, radius));
  }

  const fixed: Box[] = [...lines.map((line) => line.badge), ...Object.values(DECOR), DOCK];
  const lineXs: number[] = [];
  const lineYs: number[] = [];
  for (const path of paths.values()) {
    lineXs.push(...path.xs);
    lineYs.push(...path.ys);
  }
  const queue = [...home.values()].sort(
    (a, b) => Number(byId.get(b.id)!.lit) - Number(byId.get(a.id)!.lit) || a.index - b.index
  );
  const taken: { id: string; box: Box }[] = [];
  const picked = new Map<string, { box: Box; align: Align; clear: boolean }>();
  for (const item of queue) {
    const input = byId.get(item.id)!;
    const spot = spots.get(item.id)!;
    const pick = bestLabel(
      spot,
      input.lit ? LIT.gap : SOON.gap,
      labelSize(input),
      item.index % 2 === 0 ? -1 : 1,
      (box) => {
        return (
          outside(box, MARGIN) +
          taken.filter((other) => hits(box, other.box, 3)).length +
          fixed.filter((other) => hits(box, other, 3)).length +
          discs.filter((d) => hits(box, d, 2)).length +
          (crowds(box, lineXs, lineYs, LINE_WIDTH / 2 + 5) ? 1 : 0)
        );
      }
    );
    if (pick.clear) taken.push({ id: item.id, box: pick.box });
    else overflow.push(item.id);
    picked.set(item.id, pick);
  }

  const blockers: Box[] = [...taken.map((item) => item.box), ...discs, ...lines.map((line) => line.badge)];
  const windows = windowsOf(blockers, [DECOR.key]);
  const order: string[] = [];
  for (const def of active)
    for (const id of slotsOf.get(def.id)!) if (home.has(id) && !order.includes(id)) order.push(id);
  const stations: Station[] = order.map((id) => {
    const spot = spots.get(id)!;
    const pick = picked.get(id)!;
    const card = placeCard(
      spot,
      windows,
      taken.findIndex((item) => item.id === id)
    );
    const lag = Math.min(LAG_MAX, two(hash(id) * STATION_LAG_JITTER + spot.index * STATION_LAG_STEP));
    const sorted = [...(joined.get(id) ?? [spot.line])].sort();
    return {
      id,
      line: spot.line,
      lines: [spot.line, ...sorted.filter((line) => line !== spot.line)],
      lit: byId.get(id)!.lit,
      bare: !pick.clear,
      x: two(spot.x),
      y: two(spot.y),
      radius: spot.radius,
      align: pick.align,
      label: roundBox(pick.box),
      card: roundBox(card),
      leader: pointer({ id, x: spot.x, y: spot.y, radius: spot.radius }, card),
      lag,
    };
  });
  return { lines, stations, overflow: [...new Set(overflow)] };
}
