export type Tool =
  "select" | "hand" | "pen" | "line" | "arrow" | "rect" | "ellipse" | "diamond" | "text" | "sticky" | "eraser";

export type Kind = "pen" | "line" | "arrow" | "rect" | "ellipse" | "diamond" | "text" | "sticky" | "image";

export type Dash = "solid" | "dashed" | "dotted";

export interface Style {
  stroke: string;
  fill: string;
  width: number;
  dash: Dash;
  opacity: number;
  fontSize: number;
}

export type Point = [number, number];

export interface El {
  id: string;
  kind: Kind;
  x: number;
  y: number;
  w: number;
  h: number;
  points?: Point[];
  text?: string;
  src?: string;
  style: Style;
  start?: string | null;
  end?: string | null;
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type Handle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

export const DEFAULT_STYLE: Style = {
  stroke: "ink",
  fill: "none",
  width: 2,
  dash: "solid",
  opacity: 1,
  fontSize: 20,
};

export const STROKES = ["ink", "#e03131", "#2f9e44", "#1971c2", "#f08c00", "#9c36b5", "#0c8599", "#868e96"];
export const FILLS = ["none", "paper", "#ffc9c9", "#b2f2bb", "#a5d8ff", "#ffec99", "#eebefa", "#99e9f2"];

export const STICKY_FILL = "#ffec99";

let counter = 0;

export function newId(): string {
  counter = (counter + 1) % 1_000_000;
  return `${Date.now().toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function isLinear(el: El): boolean {
  return el.kind === "pen" || el.kind === "line" || el.kind === "arrow";
}

export function normalize(box: Box): Box {
  return {
    x: box.w < 0 ? box.x + box.w : box.x,
    y: box.h < 0 ? box.y + box.h : box.y,
    w: Math.abs(box.w),
    h: Math.abs(box.h),
  };
}

export function bounds(el: El): Box {
  if (isLinear(el) && el.points?.length) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const [px, py] of el.points) {
      minX = Math.min(minX, px);
      minY = Math.min(minY, py);
      maxX = Math.max(maxX, px);
      maxY = Math.max(maxY, py);
    }
    return { x: el.x + minX, y: el.y + minY, w: maxX - minX, h: maxY - minY };
  }
  return normalize({ x: el.x, y: el.y, w: el.w, h: el.h });
}

export function unionBounds(els: readonly El[]): Box | null {
  if (!els.length) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const el of els) {
    const b = bounds(el);
    minX = Math.min(minX, b.x);
    minY = Math.min(minY, b.y);
    maxX = Math.max(maxX, b.x + b.w);
    maxY = Math.max(maxY, b.y + b.h);
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

function distToSegment(p: Point, a: Point, b: Point): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = dx * dx + dy * dy;
  const t = len ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len)) : 0;
  const x = a[0] + t * dx;
  const y = a[1] + t * dy;
  return Math.hypot(p[0] - x, p[1] - y);
}

export function hitTest(el: El, p: Point, tolerance: number): boolean {
  if (isLinear(el)) {
    const pts = el.points ?? [];
    const reach = tolerance + el.style.width / 2;
    if (pts.length === 1) return Math.hypot(p[0] - el.x - pts[0][0], p[1] - el.y - pts[0][1]) <= reach;
    for (let i = 1; i < pts.length; i++) {
      const a: Point = [el.x + pts[i - 1][0], el.y + pts[i - 1][1]];
      const b: Point = [el.x + pts[i][0], el.y + pts[i][1]];
      if (distToSegment(p, a, b) <= reach) return true;
    }
    return false;
  }
  const b = bounds(el);
  const t = tolerance;
  if (p[0] < b.x - t || p[0] > b.x + b.w + t || p[1] < b.y - t || p[1] > b.y + b.h + t) return false;
  if (el.kind === "ellipse") {
    const rx = b.w / 2 + t;
    const ry = b.h / 2 + t;
    const dx = p[0] - (b.x + b.w / 2);
    const dy = p[1] - (b.y + b.h / 2);
    return rx > 0 && ry > 0 && (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1;
  }
  if (el.kind === "diamond") {
    const cx = b.x + b.w / 2;
    const cy = b.y + b.h / 2;
    return Math.abs(p[0] - cx) / (b.w / 2 + t) + Math.abs(p[1] - cy) / (b.h / 2 + t) <= 1;
  }
  return true;
}

export function elementAt(els: readonly El[], p: Point, tolerance: number): El | null {
  for (let i = els.length - 1; i >= 0; i--) if (hitTest(els[i], p, tolerance)) return els[i];
  return null;
}

export function inside(outer: Box, el: El): boolean {
  const o = normalize(outer);
  const b = bounds(el);
  return b.x >= o.x && b.y >= o.y && b.x + b.w <= o.x + o.w && b.y + b.h <= o.y + o.h;
}

function centre(b: Box): Point {
  return [b.x + b.w / 2, b.y + b.h / 2];
}

export function edgeToward(el: El, toward: Point, gap = 6): Point {
  const b = bounds(el);
  const [cx, cy] = centre(b);
  const dx = toward[0] - cx;
  const dy = toward[1] - cy;
  if (!dx && !dy) return [cx, cy];
  const rx = b.w / 2 + gap;
  const ry = b.h / 2 + gap;
  let k: number;
  if (el.kind === "ellipse") k = 1 / Math.sqrt((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry));
  else if (el.kind === "diamond") k = 1 / (Math.abs(dx) / rx + Math.abs(dy) / ry);
  else k = Math.min(dx ? rx / Math.abs(dx) : Infinity, dy ? ry / Math.abs(dy) : Infinity);
  return [cx + dx * Math.min(k, 1), cy + dy * Math.min(k, 1)];
}

export function routeArrows(els: El[], changed?: ReadonlySet<string>): El[] {
  const byId = new Map(els.map((e) => [e.id, e]));
  return els.map((el) => {
    if (el.kind !== "arrow" || (!el.start && !el.end)) return el;
    if (changed && !changed.has(el.id) && !(el.start && changed.has(el.start)) && !(el.end && changed.has(el.end)))
      return el;
    const pts = el.points ?? [
      [0, 0],
      [0, 0],
    ];
    const absStart: Point = [el.x + pts[0][0], el.y + pts[0][1]];
    const absEnd: Point = [el.x + pts[pts.length - 1][0], el.y + pts[pts.length - 1][1]];
    const from = el.start ? byId.get(el.start) : undefined;
    const to = el.end ? byId.get(el.end) : undefined;
    const target: Point = to ? centre(bounds(to)) : absEnd;
    const source: Point = from ? centre(bounds(from)) : absStart;
    const a = from ? edgeToward(from, target) : absStart;
    const b = to ? edgeToward(to, source) : absEnd;
    return {
      ...el,
      x: a[0],
      y: a[1],
      points: [
        [0, 0],
        [b[0] - a[0], b[1] - a[1]],
      ],
    };
  });
}

export function moveEls(els: El[], ids: ReadonlySet<string>, dx: number, dy: number): El[] {
  const moved = els.map((el) => (ids.has(el.id) ? { ...el, x: el.x + dx, y: el.y + dy } : el));
  return routeArrows(moved, ids);
}

export function resizeBox(start: Box, handle: Handle, p: Point, keepRatio: boolean): Box {
  let { x, y, w, h } = start;
  const right = start.x + start.w;
  const bottom = start.y + start.h;
  if (handle.includes("w")) {
    x = p[0];
    w = right - p[0];
  }
  if (handle.includes("e")) w = p[0] - start.x;
  if (handle.includes("n")) {
    y = p[1];
    h = bottom - p[1];
  }
  if (handle.includes("s")) h = p[1] - start.y;
  if (keepRatio && start.w && start.h && handle.length === 2) {
    const ratio = start.w / start.h;
    if (Math.abs(w) / ratio > Math.abs(h)) h = (Math.sign(h) || 1) * (Math.abs(w) / ratio);
    else w = (Math.sign(w) || 1) * Math.abs(h) * ratio;
    if (handle.includes("n")) y = bottom - h;
    if (handle.includes("w")) x = right - w;
  }
  return normalize({ x, y, w, h });
}

export function resizeEl(el: El, from: Box, to: Box): El {
  if (isLinear(el) && el.points) {
    const sx = from.w ? to.w / from.w : 1;
    const sy = from.h ? to.h / from.h : 1;
    const abs = el.points.map(
      ([px, py]) => [to.x + (el.x + px - from.x) * sx, to.y + (el.y + py - from.y) * sy] as Point
    );
    return { ...el, x: abs[0][0], y: abs[0][1], points: abs.map(([ax, ay]) => [ax - abs[0][0], ay - abs[0][1]]) };
  }
  const b = bounds(el);
  const sx = from.w ? to.w / from.w : 1;
  const sy = from.h ? to.h / from.h : 1;
  return {
    ...el,
    x: to.x + (b.x - from.x) * sx,
    y: to.y + (b.y - from.y) * sy,
    w: Math.max(1, b.w * sx),
    h: Math.max(1, b.h * sy),
  };
}

export function simplify(points: Point[], epsilon: number): Point[] {
  if (points.length < 3) return points;
  let maxDist = 0;
  let index = 0;
  const first = points[0];
  const last = points[points.length - 1];
  for (let i = 1; i < points.length - 1; i++) {
    const d = distToSegment(points[i], first, last);
    if (d > maxDist) {
      maxDist = d;
      index = i;
    }
  }
  if (maxDist <= epsilon) return [first, last];
  const left = simplify(points.slice(0, index + 1), epsilon);
  const right = simplify(points.slice(index), epsilon);
  return [...left.slice(0, -1), ...right];
}

export function snap(v: number, grid: number, on: boolean): number {
  return on ? Math.round(v / grid) * grid : v;
}

export function duplicate(els: El[], ids: ReadonlySet<string>, offset = 20): { els: El[]; created: string[] } {
  const map = new Map<string, string>();
  const copies = els
    .filter((e) => ids.has(e.id))
    .map((e) => {
      const id = newId();
      map.set(e.id, id);
      return { ...e, id, x: e.x + offset, y: e.y + offset };
    })
    .map((e) => ({
      ...e,
      start: e.start ? (map.get(e.start) ?? null) : e.start,
      end: e.end ? (map.get(e.end) ?? null) : e.end,
    }));
  return { els: [...els, ...copies], created: copies.map((c) => c.id) };
}

export function removeEls(els: El[], ids: ReadonlySet<string>): El[] {
  return els
    .filter((e) => !ids.has(e.id))
    .map((e) =>
      e.kind === "arrow" && ((e.start && ids.has(e.start)) || (e.end && ids.has(e.end)))
        ? { ...e, start: e.start && ids.has(e.start) ? null : e.start, end: e.end && ids.has(e.end) ? null : e.end }
        : e
    );
}

export function reorder(els: El[], ids: ReadonlySet<string>, to: "front" | "back" | "forward" | "backward"): El[] {
  if (to === "front") return [...els.filter((e) => !ids.has(e.id)), ...els.filter((e) => ids.has(e.id))];
  if (to === "back") return [...els.filter((e) => ids.has(e.id)), ...els.filter((e) => !ids.has(e.id))];
  const out = els.slice();
  if (to === "forward") {
    for (let i = out.length - 2; i >= 0; i--)
      if (ids.has(out[i].id) && !ids.has(out[i + 1].id)) [out[i], out[i + 1]] = [out[i + 1], out[i]];
  } else {
    for (let i = 1; i < out.length; i++)
      if (ids.has(out[i].id) && !ids.has(out[i - 1].id)) [out[i], out[i - 1]] = [out[i - 1], out[i]];
  }
  return out;
}

export function restyle(els: El[], ids: ReadonlySet<string>, patch: Partial<Style>): El[] {
  return els.map((e) => (ids.has(e.id) ? { ...e, style: { ...e.style, ...patch } } : e));
}

export interface History {
  past: El[][];
  present: El[];
  future: El[][];
}

const HISTORY_LIMIT = 100;

export function historyOf(present: El[]): History {
  return { past: [], present, future: [] };
}

export function commit(h: History, next: El[]): History {
  if (next === h.present) return h;
  return { past: [...h.past, h.present].slice(-HISTORY_LIMIT), present: next, future: [] };
}

export function undo(h: History): History {
  if (!h.past.length) return h;
  return { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future] };
}

export function redo(h: History): History {
  if (!h.future.length) return h;
  return { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) };
}
