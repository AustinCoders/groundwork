export type ExtraShape = "triangle" | "hexagon" | "star" | "cylinder" | "parallelogram" | "cloud";

export const EXTRA_SHAPES: ExtraShape[] = ["triangle", "hexagon", "star", "cylinder", "parallelogram", "cloud"];

export type BoxKind = "rect" | "ellipse" | "diamond" | ExtraShape;

export type Tool =
  "select" | "hand" | "pen" | "highlighter" | "laser" | "line" | "arrow" | BoxKind | "text" | "sticky" | "eraser";

export type Kind = "pen" | "line" | "arrow" | BoxKind | "text" | "sticky" | "image";

export type Head = "none" | "arrow" | "triangle" | "dot" | "bar";

export type Dash = "solid" | "dashed" | "dotted";

export interface Style {
  stroke: string;
  fill: string;
  width: number;
  dash: Dash;
  opacity: number;
  fontSize: number;
  startHead?: Head;
  endHead?: Head;
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
  locked?: boolean;
  group?: string;
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

export const STROKES = ["ink", "red", "green", "blue", "orange", "purple", "teal", "grey"];
export const FILLS = [
  "none",
  "paper",
  "red-soft",
  "green-soft",
  "blue-soft",
  "yellow-soft",
  "purple-soft",
  "teal-soft",
];

export const STICKY_FILL = "yellow-soft";

export const PALETTE_TOKENS = ["red", "orange", "yellow", "green", "teal", "blue", "purple", "grey"].flatMap((c) => [
  c,
  `${c}-soft`,
]);

export const LEGACY_COLOURS: Record<string, string> = {
  "#e03131": "red",
  "#2f9e44": "green",
  "#1971c2": "blue",
  "#f08c00": "orange",
  "#9c36b5": "purple",
  "#0c8599": "teal",
  "#868e96": "grey",
  "#ffc9c9": "red-soft",
  "#b2f2bb": "green-soft",
  "#a5d8ff": "blue-soft",
  "#ffec99": "yellow-soft",
  "#eebefa": "purple-soft",
  "#99e9f2": "teal-soft",
  "#e9ecef": "grey-soft",
  "#fab005": "yellow",
};

export function paletteToken(value: string): string {
  return LEGACY_COLOURS[value.toLowerCase()] ?? value;
}

let counter = 0;

export function newId(): string {
  counter = (counter + 1) % 1_000_000;
  return `${Date.now().toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function textBox(text: string, fontSize: number): { w: number; h: number } {
  const lines = text.split("\n");
  const longest = Math.max(1, ...lines.map((l) => l.length));
  return { w: Math.ceil(longest * fontSize * 0.58) + 8, h: Math.ceil(lines.length * fontSize * 1.25) + 8 };
}

export function sameEls(a: readonly El[], b: readonly El[]): boolean {
  return a.length === b.length && a.every((el, i) => el === b[i]);
}

export function isBoxKind(kind: string): kind is BoxKind {
  return kind === "rect" || kind === "ellipse" || kind === "diamond" || (EXTRA_SHAPES as string[]).includes(kind);
}

export function holdsText(el: El): boolean {
  return el.kind === "text" || el.kind === "sticky" || isBoxKind(el.kind);
}

export function heads(el: El): { start: Head; end: Head } {
  if (el.kind !== "arrow" && el.kind !== "line") return { start: "none", end: "none" };
  return {
    start: el.style.startHead ?? "none",
    end: el.style.endHead ?? (el.kind === "arrow" ? "arrow" : "none"),
  };
}

export function polygonPoints(kind: Kind, b: Box): Point[] | null {
  const { x, y, w, h } = b;
  const cx = x + w / 2;
  const cy = y + h / 2;
  switch (kind) {
    case "diamond":
      return [
        [cx, y],
        [x + w, cy],
        [cx, y + h],
        [x, cy],
      ];
    case "triangle":
      return [
        [cx, y],
        [x + w, y + h],
        [x, y + h],
      ];
    case "hexagon":
      return [
        [x + w * 0.25, y],
        [x + w * 0.75, y],
        [x + w, cy],
        [x + w * 0.75, y + h],
        [x + w * 0.25, y + h],
        [x, cy],
      ];
    case "parallelogram":
      return [
        [x + w * 0.2, y],
        [x + w, y],
        [x + w * 0.8, y + h],
        [x, y + h],
      ];
    case "star": {
      const pts: Point[] = [];
      for (let i = 0; i < 10; i++) {
        const r = i % 2 ? 0.42 : 1;
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        pts.push([cx + (Math.cos(a) * r * w) / 2, cy + (Math.sin(a) * r * h) / 2 + h * 0.06]);
      }
      return pts;
    }
    default:
      return null;
  }
}

function insidePolygon(p: Point, poly: Point[]): boolean {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

function nearPolygon(p: Point, poly: Point[], t: number): boolean {
  for (let i = 0; i < poly.length; i++) if (distToSegment(p, poly[i], poly[(i + 1) % poly.length]) <= t) return true;
  return false;
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
  const poly = polygonPoints(el.kind, b);
  if (poly) return insidePolygon(p, poly) || nearPolygon(p, poly, t);
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
  const poly = polygonPoints(el.kind, b);
  if (poly) {
    let best = Infinity;
    for (let i = 0; i < poly.length; i++) {
      const [ax, ay] = poly[i];
      const [bx, by] = poly[(i + 1) % poly.length];
      const ex = bx - ax;
      const ey = by - ay;
      const den = dx * ey - dy * ex;
      if (!den) continue;
      const u = ((ax - cx) * ey - (ay - cy) * ex) / den;
      const v = ((ax - cx) * dy - (ay - cy) * dx) / den;
      if (u > 0 && v >= 0 && v <= 1) best = Math.min(best, u);
    }
    if (best !== Infinity) {
      const len = Math.hypot(dx, dy);
      const k = Math.min(1, best + gap / len);
      return [cx + dx * k, cy + dy * k];
    }
  }
  let k: number;
  if (el.kind === "ellipse" || el.kind === "cloud") k = 1 / Math.sqrt((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry));
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
    if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 2) return el;
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
  const moved = els.map((el) => {
    if (!ids.has(el.id) || el.locked) return el;
    const next = { ...el, x: el.x + dx, y: el.y + dy };
    if (el.kind === "arrow") {
      if (el.start && !ids.has(el.start)) next.start = null;
      if (el.end && !ids.has(el.end)) next.end = null;
    }
    return next;
  });
  return routeArrows(moved, ids);
}

export function movableIds(els: El[], ids: ReadonlySet<string>): Set<string> {
  return new Set(els.filter((e) => ids.has(e.id) && !e.locked).map((e) => e.id));
}

export function expandGroups(els: El[], ids: ReadonlySet<string>): Set<string> {
  const groups = new Set(els.filter((e) => ids.has(e.id) && e.group).map((e) => e.group));
  if (!groups.size) return new Set(ids);
  return new Set(els.filter((e) => ids.has(e.id) || (e.group && groups.has(e.group))).map((e) => e.id));
}

export function groupEls(els: El[], ids: ReadonlySet<string>): El[] {
  const group = newId();
  return els.map((e) => (ids.has(e.id) ? { ...e, group } : e));
}

export function ungroupEls(els: El[], ids: ReadonlySet<string>): El[] {
  return els.map((e) => (ids.has(e.id) && e.group ? { ...e, group: undefined } : e));
}

export function setLocked(els: El[], ids: ReadonlySet<string>, locked: boolean): El[] {
  return els.map((e) => (ids.has(e.id) ? { ...e, locked: locked || undefined } : e));
}

export type Align = "left" | "centre" | "right" | "top" | "middle" | "bottom";

export function alignEls(els: El[], ids: ReadonlySet<string>, how: Align): El[] {
  const chosen = els.filter((e) => ids.has(e.id) && !e.locked);
  const all = unionBounds(els.filter((e) => ids.has(e.id)));
  if (!all || chosen.length < 2) return els;
  const shift = new Map<string, Point>();
  for (const el of chosen) {
    const b = bounds(el);
    const dx =
      how === "left"
        ? all.x - b.x
        : how === "right"
          ? all.x + all.w - b.x - b.w
          : how === "centre"
            ? all.x + all.w / 2 - b.x - b.w / 2
            : 0;
    const dy =
      how === "top"
        ? all.y - b.y
        : how === "bottom"
          ? all.y + all.h - b.y - b.h
          : how === "middle"
            ? all.y + all.h / 2 - b.y - b.h / 2
            : 0;
    shift.set(el.id, [dx, dy]);
  }
  return shiftEls(els, shift);
}

export function distributeEls(els: El[], ids: ReadonlySet<string>, axis: "x" | "y"): El[] {
  const chosen = els.filter((e) => ids.has(e.id) && !e.locked && !(e.kind === "arrow" && (e.start || e.end)));
  if (chosen.length < 3) return els;
  const boxes = chosen.map((el) => ({ el, b: bounds(el) }));
  boxes.sort((a, b) => (axis === "x" ? a.b.x - b.b.x : a.b.y - b.b.y));
  const first = boxes[0].b;
  const last = boxes[boxes.length - 1].b;
  const span = axis === "x" ? last.x + last.w - first.x : last.y + last.h - first.y;
  const used = boxes.reduce((sum, { b }) => sum + (axis === "x" ? b.w : b.h), 0);
  const gap = (span - used) / (boxes.length - 1);
  const shift = new Map<string, Point>();
  let at = axis === "x" ? first.x : first.y;
  for (const { el, b } of boxes) {
    const d = at - (axis === "x" ? b.x : b.y);
    shift.set(el.id, axis === "x" ? [d, 0] : [0, d]);
    at += (axis === "x" ? b.w : b.h) + gap;
  }
  return shiftEls(els, shift);
}

function shiftEls(els: El[], shift: Map<string, Point>): El[] {
  const moved = els.map((el) => {
    const d = shift.get(el.id);
    return d ? { ...el, x: el.x + d[0], y: el.y + d[1] } : el;
  });
  return routeArrows(moved, new Set(shift.keys()));
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
  const x = to.x + (b.x - from.x) * sx;
  const y = to.y + (b.y - from.y) * sy;
  if (el.kind === "text") {
    const fontSize = Math.min(240, Math.max(8, Math.round(el.style.fontSize * Math.min(sx, sy))));
    return { ...el, x, y, ...textBox(el.text ?? "", fontSize), style: { ...el.style, fontSize } };
  }
  return { ...el, x, y, w: Math.max(1, b.w * sx), h: Math.max(1, b.h * sy) };
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
  const groups = new Map<string, string>();
  const copies = els
    .filter((e) => ids.has(e.id))
    .map((e) => {
      const id = newId();
      map.set(e.id, id);
      let group = e.group;
      if (group) {
        if (!groups.has(group)) groups.set(group, newId());
        group = groups.get(group);
      }
      return { ...e, id, x: e.x + offset, y: e.y + offset, group, locked: undefined };
    })
    .map((e) => ({
      ...e,
      start: e.start ? (map.get(e.start) ?? null) : e.start,
      end: e.end ? (map.get(e.end) ?? null) : e.end,
    }));
  return { els: [...els, ...copies], created: copies.map((c) => c.id) };
}

export function removeEls(els: El[], chosen: ReadonlySet<string>): El[] {
  const ids = new Set(els.filter((e) => chosen.has(e.id) && !e.locked).map((e) => e.id));
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

const KINDS: Kind[] = [
  "pen",
  "line",
  "arrow",
  "rect",
  "ellipse",
  "diamond",
  "text",
  "sticky",
  "image",
  ...EXTRA_SHAPES,
];
const HEAD_KINDS: Head[] = ["none", "arrow", "triangle", "dot", "bar"];
const DASHES: Dash[] = ["solid", "dashed", "dotted"];

function num(v: unknown, fallback: number, min = -1e7, max = 1e7): number {
  return typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
}

function str(v: unknown, max = 200): string | undefined {
  return typeof v === "string" ? v.slice(0, max) : undefined;
}

function cleanStyle(v: unknown): Style {
  const s = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const style: Style = {
    stroke: str(s.stroke, 40) ?? DEFAULT_STYLE.stroke,
    fill: str(s.fill, 40) ?? DEFAULT_STYLE.fill,
    width: num(s.width, DEFAULT_STYLE.width, 0.5, 60),
    dash: DASHES.includes(s.dash as Dash) ? (s.dash as Dash) : "solid",
    opacity: num(s.opacity, 1, 0.05, 1),
    fontSize: num(s.fontSize, DEFAULT_STYLE.fontSize, 6, 400),
  };
  if (HEAD_KINDS.includes(s.startHead as Head)) style.startHead = s.startHead as Head;
  if (HEAD_KINDS.includes(s.endHead as Head)) style.endHead = s.endHead as Head;
  return style;
}

export function sanitizeEls(list: unknown, limit = 5000): El[] {
  if (!Array.isArray(list)) return [];
  const out: El[] = [];
  const seen = new Set<string>();
  for (const raw of list.slice(0, limit)) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    const id = str(r.id, 64);
    if (!id || seen.has(id) || !KINDS.includes(r.kind as Kind)) continue;
    const kind = r.kind as Kind;
    const el: El = {
      id,
      kind,
      x: num(r.x, 0),
      y: num(r.y, 0),
      w: num(r.w, 0),
      h: num(r.h, 0),
      style: cleanStyle(r.style),
    };
    if (kind === "pen" || kind === "line" || kind === "arrow") {
      const pts = Array.isArray(r.points)
        ? r.points
            .filter((p): p is [number, number] => Array.isArray(p) && Number.isFinite(p[0]) && Number.isFinite(p[1]))
            .slice(0, 20000)
            .map(([px, py]) => [px, py] as Point)
        : [];
      el.points = pts.length ? pts : [[0, 0]];
      if (kind !== "pen" && el.points.length < 2) el.points = [el.points[0], el.points[0]];
    }
    const text = str(r.text, 20000);
    if (text !== undefined) el.text = text;
    if (kind === "image") {
      const src = str(r.src, 20_000_000);
      if (!src || !src.startsWith("data:image/")) continue;
      el.src = src;
    }
    if (kind === "arrow") {
      el.start = str(r.start, 64) ?? null;
      el.end = str(r.end, 64) ?? null;
    }
    if (r.locked === true) el.locked = true;
    const group = str(r.group, 64);
    if (group) el.group = group;
    seen.add(id);
    out.push(el);
  }
  const ids = new Set(out.map((e) => e.id));
  return out.map((e) =>
    e.kind === "arrow" && ((e.start && !ids.has(e.start)) || (e.end && !ids.has(e.end)))
      ? { ...e, start: e.start && ids.has(e.start) ? e.start : null, end: e.end && ids.has(e.end) ? e.end : null }
      : e
  );
}
