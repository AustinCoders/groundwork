import type { DsaQuestion } from "@/content/system-design/company-questions/dsa-types";
import { make, path, textLine, wrapWords } from "@/lib/whiteboard/build";
import { bounds, textBox, unionBounds, type Box, type El, type Point } from "@/lib/whiteboard/model";
import type { CompanyBoard, Walk } from "@/lib/whiteboard/walk";

export type TraceSource = Pick<DsaQuestion, "id" | "title" | "patternId" | "trace" | "solution">;

export type TraceShape = "array" | "range" | "list" | "tree";

const POINTERS: Record<string, string> = {
  left: "L",
  l: "L",
  right: "R",
  r: "R",
  slow: "slow",
  fast: "fast",
  low: "lo",
  lo: "lo",
  high: "hi",
  hi: "hi",
  mid: "mid",
  i: "i",
  j: "j",
  ahead: "ahead",
  behind: "behind",
  centre: "c",
  center: "c",
};

const CELL = { w: 60, h: 46 };
const LEFT = 96;
const CAPTION_CHARS = 44;
const MAX_CELLS = 26;

interface Mark {
  name: string;
  at: number;
  solid: boolean;
}

interface Strip {
  cells: string[];
  index: boolean;
  chained: boolean;
}

interface Shaped {
  shape: TraceShape;
  strip?: Strip;
  marks: Mark[][];
  tree?: TreeShape;
}

interface TreeShape {
  nodes: { value: number; depth: number; rank: number; parent: number }[];
  current: (number | null)[];
}

const primitive = (value: unknown): value is string | number => typeof value === "string" || typeof value === "number";

function candidates(args: unknown[]): (string | number)[][] {
  const out: (string | number)[][] = [];
  for (const arg of args) {
    let items: (string | number)[] | null = null;
    if (typeof arg === "string" && arg.length >= 3 && arg.length <= MAX_CELLS) items = [...arg];
    else if (Array.isArray(arg) && arg.length >= 3 && arg.length <= MAX_CELLS && arg.every(primitive))
      items = arg as (string | number)[];
    if (!items) continue;
    out.push(items);
    if (items.every((item) => typeof item === "number")) {
      const sorted = [...(items as number[])].sort((a, b) => a - b);
      if (sorted.some((value, at) => value !== items![at])) out.push(sorted);
    }
    break;
  }
  return out;
}

function headName(head: string): string {
  return head
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .trim();
}

function dedupe(marks: Mark[]): Mark[] {
  const seen = new Set<string>();
  return marks.filter((mark) => {
    const key = `${mark.name}@${mark.at}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parseMarks(head: string[], row: string[]): Mark[] | null {
  const marks: Mark[] = [];
  for (let c = 0; c < head.length; c++) {
    const cell = (row[c] ?? "").trim();
    const name = headName(head[c]);
    const word = name.split(/\s+/)[0];
    const solid = !/at end|after/.test(name);
    const window = /^\[(\d+),\s*(\d+)\]$/.exec(cell);
    if (name === "window" && window) {
      marks.push({ name: "L", at: Number(window[1]), solid }, { name: "R", at: Number(window[2]), solid });
      continue;
    }
    const range = /^(\d+)\.\.(\d+)$/.exec(cell);
    if (range) {
      marks.push({ name: "lo", at: Number(range[1]), solid }, { name: "hi", at: Number(range[2]), solid });
      continue;
    }
    const named = !/^pointers?$/.test(name)
      ? []
      : [...cell.matchAll(/\b(left|right|slow|fast|low|high|mid|l|r|i|j)\s*[=:]?\s*(-?\d+)/gi)];
    if (named.length) {
      for (const hit of named) marks.push({ name: POINTERS[hit[1].toLowerCase()], at: Number(hit[2]), solid });
      continue;
    }
    if (!(word in POINTERS)) continue;
    if (cell === "dummy") {
      marks.push({ name: POINTERS[word], at: 0, solid });
      continue;
    }
    const lead = /^(-?\d+)\b/.exec(cell);
    if (lead) marks.push({ name: POINTERS[word], at: Number(lead[1]), solid });
  }
  return dedupe(marks);
}

function checksPass(head: string[], row: string[], items: (string | number)[], marks: Mark[]): boolean {
  for (let c = 0; c < head.length; c++) {
    const cell = (row[c] ?? "").trim();
    const held = /^(\d+)\s*\((-?\w+)\)$/.exec(cell);
    if (held && String(items[Number(held[1])]) !== held[2]) return false;
    if (headName(head[c]) === "char" && cell.length === 1) {
      const right = marks.find((mark) => mark.name === "R");
      if (right && String(items[right.at]) !== cell) return false;
    }
  }
  return true;
}

function arrayShape(source: TraceSource): Shaped | null {
  const { head, rows } = source.trace;
  const parsed = rows.map((row) => parseMarks(head, row));
  if (parsed.every((marks) => !marks || marks.length === 0)) return null;
  for (const entry of source.solution.cases) {
    for (const items of candidates(entry.args)) {
      const ok = rows.every((row, at) => {
        const marks = parsed[at] ?? [];
        return marks.every((mark) => mark.at >= 0 && mark.at < items.length) && checksPass(head, row, items, marks);
      });
      if (ok) {
        return {
          shape: "array",
          strip: { cells: items.map(String), index: true, chained: false },
          marks: parsed.map((marks) => marks ?? []),
        };
      }
    }
  }
  return null;
}

function rangeShape(source: TraceSource): Shaped | null {
  const { head, rows } = source.trace;
  const marks = rows.map((row) => parseMarks(head, row) ?? []);
  const values = marks.flat().map((mark) => mark.at);
  if (!values.length) return null;
  const low = Math.min(...values);
  const high = Math.max(...values);
  if (high - low + 1 < 3 || high - low + 1 > 20) return null;
  const cells = Array.from({ length: high - low + 1 }, (_, i) => String(low + i));
  return {
    shape: "range",
    strip: { cells, index: false, chained: false },
    marks: marks.map((row) => row.map((mark) => ({ ...mark, at: mark.at - low, solid: false }))),
  };
}

function listShape(source: TraceSource): Shaped | null {
  const { head, rows } = source.trace;
  const first = source.solution.cases.find((entry) => Array.isArray(entry.args[0]) && entry.args[0].length >= 3);
  const values = first?.args[0] as unknown[] | undefined;
  if (!values || !values.every((value) => typeof value === "number") || new Set(values).size !== values.length)
    return null;
  const marks: Mark[][] = [];
  for (const row of rows) {
    const found: Mark[] = [];
    for (let c = 0; c < head.length; c++) {
      const name = POINTERS[headName(head[c]).split(/\s+/)[0]];
      const cell = (row[c] ?? "").trim();
      if (!name || (name !== "ahead" && name !== "behind")) continue;
      const at = cell === "dummy" ? 0 : values.indexOf(Number(cell)) + 1;
      if (cell !== "dummy" && (!/^-?\d+$/.test(cell) || at === 0)) return null;
      found.push({ name, at, solid: false });
    }
    marks.push(found);
  }
  if (marks.every((row) => row.length === 0)) return null;
  return {
    shape: "list",
    strip: { cells: ["dummy", ...values.map(String)], index: false, chained: true },
    marks,
  };
}

function buildTree(level: unknown[]): TreeShape["nodes"] | null {
  if (!level.length || level[0] === null || !level.every((value) => value === null || typeof value === "number"))
    return null;
  const nodes: { value: number; depth: number; rank: number; parent: number; left: number; right: number }[] = [];
  const queue: number[] = [];
  let at = 0;
  const take = (parent: number, depth: number, side: "left" | "right") => {
    const value = level[at++];
    if (value === null || value === undefined) return;
    nodes.push({ value: value as number, depth, rank: 0, parent, left: -1, right: -1 });
    const id = nodes.length - 1;
    if (parent >= 0) nodes[parent][side] = id;
    queue.push(id);
  };
  take(-1, 0, "left");
  while (queue.length && at < level.length) {
    const parent = queue.shift()!;
    take(parent, nodes[parent].depth + 1, "left");
    take(parent, nodes[parent].depth + 1, "right");
  }
  let rank = 0;
  const walk = (id: number) => {
    if (id < 0) return;
    walk(nodes[id].left);
    nodes[id].rank = rank++;
    walk(nodes[id].right);
  };
  walk(0);
  return nodes.map(({ value, depth, rank: r, parent }) => ({ value, depth, rank: r, parent }));
}

function treeShape(source: TraceSource): Shaped | null {
  const { head, rows } = source.trace;
  const column = head.findIndex((name) => headName(name) === "node");
  if (column < 0) return null;
  const visited = rows.map((row) => {
    const cell = (row[column] ?? "").trim();
    return /^-?\d+$/.test(cell) ? Number(cell) : null;
  });
  if (visited.every((value) => value === null)) return null;
  for (const entry of source.solution.cases) {
    const level = entry.args[0];
    if (!Array.isArray(level)) continue;
    const nodes = buildTree(level);
    if (!nodes || nodes.length > 15) continue;
    const values = nodes.map((node) => node.value);
    if (new Set(values).size !== values.length) continue;
    if (visited.every((value) => value === null || values.includes(value))) {
      return {
        shape: "tree",
        marks: rows.map(() => []),
        tree: { nodes, current: visited.map((value) => (value === null ? null : values.indexOf(value))) },
      };
    }
  }
  return null;
}

export function traceShape(source: TraceSource): Shaped | null {
  switch (source.patternId) {
    case "tree":
      return treeShape(source);
    case "list":
      return listShape(source);
    case "search":
      return rangeShape(source);
    case "pointers":
    case "window":
      return arrayShape(source);
    default:
      return null;
  }
}

function captionOf(head: string[], row: string[]): string {
  return head
    .map((name, at) => (row[at] && row[at] !== "-" && headName(name) !== "step" ? `${name}: ${row[at]}` : null))
    .filter((part): part is string => part !== null)
    .join(" · ");
}

interface Piece {
  els: El[];
  focus: string[];
  box: Box;
}

function stripPiece(prefix: string, strip: Strip, marks: Mark[], originX: number, originY: number): Piece {
  const els: El[] = [];
  const focus: string[] = [];
  const pitch = strip.chained ? CELL.w + 34 : CELL.w + 4;
  const solid = marks.filter((mark) => mark.solid);
  const left = solid.find((mark) => mark.name === "L");
  const right = solid.find((mark) => mark.name === "R");
  strip.cells.forEach((text, at) => {
    const inside = left && right && at >= left.at && at <= right.at;
    els.push(
      make(`${prefix}c${at}`, "rect", originX + at * pitch, originY, CELL.w, CELL.h, text, {
        fill: inside ? "blue-soft" : "paper",
        fontSize: 18,
      })
    );
    if (strip.chained && at > 0) {
      const x = originX + (at - 1) * pitch + CELL.w;
      els.push({
        ...path(
          `${prefix}k${at}`,
          "arrow",
          [x, originY + CELL.h / 2],
          [
            [x, originY + CELL.h / 2],
            [x + 34, originY + CELL.h / 2],
          ]
        ),
        start: `${prefix}c${at - 1}`,
        end: `${prefix}c${at}`,
      });
    }
    if (strip.index) {
      const size = textBox(String(at), 12);
      els.push(
        textLine(`${prefix}i${at}`, originX + at * pitch + CELL.w / 2 - size.w / 2, originY + CELL.h + 2, String(at), {
          fontSize: 12,
          stroke: "grey",
        })
      );
    }
  });
  const byCell = new Map<number, string[]>();
  for (const mark of marks) byCell.set(mark.at, [...(byCell.get(mark.at) ?? []), mark.name]);
  const labelTop = originY + CELL.h + (strip.index ? 26 : 30);
  for (const [at, names] of byCell) {
    const cx = originX + at * pitch + CELL.w / 2;
    const text = names.join("\n");
    const size = textBox(text, 14);
    const arrowId = `${prefix}p${at}`;
    const textId = `${prefix}q${at}`;
    els.push(
      path(
        arrowId,
        "arrow",
        [cx, labelTop + 6],
        [
          [cx, labelTop + 6],
          [cx, originY + CELL.h + (strip.index ? 20 : 4)],
        ]
      ),
      textLine(textId, cx - size.w / 2, labelTop + 10, text, { fontSize: 14, stroke: "red" })
    );
    focus.push(arrowId, textId);
  }
  const box = unionBounds(els)!;
  return { els, focus, box };
}

function treePiece(prefix: string, tree: TreeShape, current: number | null, originX: number, originY: number): Piece {
  const els: El[] = [];
  const dx = 64;
  const dy = 78;
  const size = 46;
  const at = (i: number): Point => [originX + tree.nodes[i].rank * dx, originY + tree.nodes[i].depth * dy];
  tree.nodes.forEach((node, i) => {
    if (node.parent < 0) return;
    const [px, py] = at(node.parent);
    const [cx, cy] = at(i);
    els.push(
      path(
        `${prefix}l${i}`,
        "line",
        [px + size / 2, py + size],
        [
          [px + size / 2, py + size],
          [cx + size / 2, cy],
        ]
      )
    );
  });
  const focus: string[] = [];
  tree.nodes.forEach((node, i) => {
    const [x, y] = at(i);
    const id = `${prefix}n${i}`;
    els.push(
      make(id, "ellipse", x, y, size, size, String(node.value), {
        fill: i === current ? "yellow-soft" : "paper",
        fontSize: 17,
      })
    );
    if (i === current) focus.push(id);
  });
  return { els, focus, box: unionBounds(els)! };
}

export function traceBoard(source: TraceSource): CompanyBoard | null {
  const shaped = traceShape(source);
  if (!shaped) return null;
  const { head, rows } = source.trace;
  const pieces: { piece: Piece; caption: string; label: El; text: El }[] = [];
  let y = 70;
  rows.forEach((row, at) => {
    const prefix = `s${at}-`;
    const piece = shaped.tree
      ? treePiece(prefix, shaped.tree, shaped.tree.current[at], LEFT, y)
      : stripPiece(prefix, shaped.strip!, shaped.marks[at], LEFT, y);
    const caption = captionOf(head, row);
    const label = textLine(`${prefix}step`, 0, y + 6, `Step ${at + 1}`, { fontSize: 18, stroke: "grey" });
    const captionLines = wrapWords(caption, CAPTION_CHARS).join("\n");
    const text = textLine(`${prefix}note`, piece.box.x + piece.box.w + 56, y, captionLines, { fontSize: 15 });
    const height = Math.max(piece.box.y + piece.box.h - y, bounds(text).h);
    pieces.push({ piece, caption, label, text });
    y += height + 56;
  });
  const heading = textLine("heading", 0, 0, source.title, { fontSize: 28 });
  const els = [heading, ...pieces.flatMap(({ piece, label, text }) => [label, ...piece.els, text])];
  const total = rows.length;
  const walk: Walk = {
    captions: pieces.map(({ caption }) => caption || "No change in this step."),
    spans: {},
    focus: pieces.map(({ piece }) => piece.focus),
    views: pieces.map(({ piece, label, text }) => unionBounds([label, ...piece.els, text])!),
  };
  pieces.forEach(({ piece, label, text }, at) => {
    for (const el of [label, ...piece.els, text]) walk.spans[el.id] = [at + 1, total];
  });
  return { title: source.title, els, walk };
}
