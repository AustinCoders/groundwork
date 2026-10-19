import type {
  Diagram,
  EdgeStyle,
  FlowDiagram,
  FlowEdge,
  FlowNode,
  SequenceDiagram,
} from "@/content/system-design/company-questions/diagram-types";

export const NODE_W = 196;
export const NODE_H = 64;
const GAP_X = 80;
const GAP_Y = 64;
const PAD = 30;
const LABEL_CHARS = 20;
const SUB_CHARS = 24;

export type Point = [number, number];

export interface LaidNode {
  node: FlowNode;
  x: number;
  y: number;
  lines: string[];
}

export interface LaidEdge {
  edge: FlowEdge;
  points: Point[];
  label?: { x: number; y: number; width: number; shift: number };
  badge?: Point;
  style: EdgeStyle;
}

export interface FlowLayout {
  width: number;
  height: number;
  nodes: LaidNode[];
  edges: LaidEdge[];
}

export function wrapLabel(text: string, limit = LABEL_CHARS): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    if (line && `${line} ${word}`.length > limit) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function labelProblems(node: FlowNode): string[] {
  const problems: string[] = [];
  const lines = wrapLabel(node.label);
  if (lines.some((line) => line.length > LABEL_CHARS)) problems.push(`${node.id}: a label word is too long`);
  if (lines.length > 2) problems.push(`${node.id}: label needs more than two lines`);
  if (node.sub && lines.length > 1) problems.push(`${node.id}: a node with a sub line needs a one-line label`);
  if (node.sub && node.sub.length > SUB_CHARS) problems.push(`${node.id}: sub line is longer than ${SUB_CHARS}`);
  return problems;
}

function segmentMid(points: Point[]): Point {
  let best = 0;
  let at: Point = points[0];
  for (let i = 0; i < points.length - 1; i++) {
    const [ax, ay] = points[i];
    const [bx, by] = points[i + 1];
    const length = Math.abs(bx - ax) + Math.abs(by - ay);
    if (length > best) {
      best = length;
      at = [(ax + bx) / 2, (ay + by) / 2];
    }
  }
  return at;
}

function along(points: Point[], distance: number): Point {
  const [ax, ay] = points[0];
  const [bx, by] = points[1];
  const length = Math.hypot(bx - ax, by - ay) || 1;
  const d = Math.min(distance, length / 2);
  return [ax + ((bx - ax) / length) * d, ay + ((by - ay) / length) * d];
}

export function layoutFlow(diagram: FlowDiagram): FlowLayout {
  const pillWidth = (edge: FlowEdge) => (edge.label ? edge.label.length * 6.4 + 18 + (edge.step ? 24 : 0) : 0);
  const columns = Math.max(...diagram.nodes.map((node) => Math.ceil(node.col))) + 1;
  const gaps: number[] = Array.from({ length: columns }, () => GAP_X);
  const byNode = new Map(diagram.nodes.map((node) => [node.id, node]));
  for (const edge of diagram.edges) {
    const from = byNode.get(edge.from);
    const to = byNode.get(edge.to);
    if (!from || !to || !edge.label) continue;
    if (Math.abs(from.row - to.row) < 0.01 && Math.abs(from.col - to.col) === 1) {
      const at = Math.min(from.col, to.col);
      gaps[at] = Math.max(gaps[at], pillWidth(edge) + 26);
    }
  }
  const colX: number[] = [PAD];
  for (let c = 0; c < columns; c++) colX.push(colX[c] + NODE_W + gaps[c]);
  const xOf = (col: number) => {
    const base = Math.floor(col);
    return colX[base] + (col - base) * (NODE_W + (gaps[base] ?? GAP_X));
  };
  const place = (node: FlowNode): LaidNode => ({
    node,
    x: xOf(node.col),
    y: PAD + node.row * (NODE_H + GAP_Y),
    lines: wrapLabel(node.label),
  });
  const nodes = diagram.nodes.map(place);
  const byId = new Map(nodes.map((entry) => [entry.node.id, entry]));
  const pairs = new Set(diagram.edges.map((edge) => `${edge.from}>${edge.to}`));

  const edges: LaidEdge[] = diagram.edges.map((edge) => {
    const from = byId.get(edge.from)!;
    const to = byId.get(edge.to)!;
    const sc: Point = [from.x + NODE_W / 2, from.y + NODE_H / 2];
    const tc: Point = [to.x + NODE_W / 2, to.y + NODE_H / 2];
    const dx = tc[0] - sc[0];
    const dy = tc[1] - sc[1];
    const reverse = pairs.has(`${edge.to}>${edge.from}`);
    const shift = reverse ? (edge.from < edge.to ? -13 : 13) : 0;
    let points: Point[];
    if (Math.abs(dy) < 1) {
      const y = sc[1] + shift;
      points =
        dx > 0
          ? [
              [from.x + NODE_W, y],
              [to.x, y],
            ]
          : [
              [from.x, y],
              [to.x + NODE_W, y],
            ];
    } else if (Math.abs(dx) < 1) {
      const x = sc[0] + shift;
      points =
        dy > 0
          ? [
              [x, from.y + NODE_H],
              [x, to.y],
            ]
          : [
              [x, from.y],
              [x, to.y + NODE_H],
            ];
    } else if (edge.route === "vh") {
      points = [
        [sc[0], dy > 0 ? from.y + NODE_H : from.y],
        [sc[0], tc[1]],
        [dx > 0 ? to.x : to.x + NODE_W, tc[1]],
      ];
    } else {
      points = [
        [dx > 0 ? from.x + NODE_W : from.x, sc[1]],
        [tc[0], sc[1]],
        [tc[0], dy > 0 ? to.y : to.y + NODE_H],
      ];
    }
    const label = edge.label
      ? (() => {
          const [x, y] = segmentMid(points);
          return { x, y, width: pillWidth(edge), shift: edge.step ? 12 : 0 };
        })()
      : undefined;
    const badge: Point | undefined = edge.step
      ? label
        ? [label.x - label.width / 2 + 15, label.y]
        : along(points, 20)
      : undefined;
    return {
      edge,
      points,
      label,
      badge,
      style: edge.style ?? "solid",
    };
  });

  const taken: { x1: number; x2: number; y1: number; y2: number }[] = [];
  const clear = (x: number, y: number, width: number) => {
    const box = { x1: x - width / 2, x2: x + width / 2, y1: y - 11, y2: y + 11 };
    const hitsPill = taken.some(
      (other) => box.x2 > other.x1 && box.x1 < other.x2 && box.y2 > other.y1 && box.y1 < other.y2
    );
    const hitsNode = nodes.some(
      (entry) => box.x2 > entry.x && box.x1 < entry.x + NODE_W && box.y2 > entry.y && box.y1 < entry.y + NODE_H
    );
    return { box, ok: !hitsPill && !hitsNode };
  };
  for (const laid of edges) {
    if (!laid.label) continue;
    let chosen: { x: number; y: number } | null = null;
    const segments = laid.points
      .slice(0, -1)
      .map((start, index) => ({ start, end: laid.points[index + 1] }))
      .sort(
        (a, b) =>
          Math.abs(b.end[0] - b.start[0]) +
          Math.abs(b.end[1] - b.start[1]) -
          (Math.abs(a.end[0] - a.start[0]) + Math.abs(a.end[1] - a.start[1]))
      );
    const vertical = laid.points.length === 2 && laid.points[0][0] === laid.points[1][0];
    const partner = edges.some(
      (other) => other !== laid && other.edge.from === laid.edge.to && other.edge.to === laid.edge.from
    );
    if (vertical && partner) {
      const top = Math.min(laid.points[0][1], laid.points[1][1]);
      const length = Math.abs(laid.points[1][1] - laid.points[0][1]);
      const y = top + length * (laid.edge.from < laid.edge.to ? 0.3 : 0.7);
      if (clear(laid.points[0][0], y, laid.label.width).ok) chosen = { x: laid.points[0][0], y };
    }
    const tries: [number, number][] = [];
    for (const dy of [0, -15, 15]) for (const t of [0.5, 0.3, 0.7, 0.18, 0.82]) tries.push([t, dy]);
    outer: for (const [t, dy] of chosen ? [] : tries) {
      for (const seg of segments) {
        const x = seg.start[0] + (seg.end[0] - seg.start[0]) * t;
        const y = seg.start[1] + (seg.end[1] - seg.start[1]) * t + (seg.start[1] === seg.end[1] ? dy : 0);
        if (clear(x, y, laid.label.width).ok) {
          chosen = { x, y };
          break outer;
        }
      }
    }
    const final = chosen ?? { x: laid.label.x, y: laid.label.y };
    laid.label = { ...laid.label, x: final.x, y: final.y };
    if (laid.edge.step) laid.badge = [final.x - laid.label.width / 2 + 15, final.y];
    taken.push(clear(final.x, final.y, laid.label.width).box);
  }

  const width = Math.max(...nodes.map((entry) => entry.x + NODE_W)) + PAD;
  const height = Math.max(...nodes.map((entry) => entry.y + NODE_H)) + PAD;
  return { width, height, nodes, edges };
}

export function roundedPath(points: Point[], radius = 12): string {
  if (points.length === 2) return `M${points[0][0]} ${points[0][1]} L${points[1][0]} ${points[1][1]}`;
  let d = `M${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i - 1];
    const [cx, cy] = points[i];
    const [nx, ny] = points[i + 1];
    const before = Math.hypot(cx - px, cy - py);
    const after = Math.hypot(nx - cx, ny - cy);
    const r = Math.min(radius, before / 2, after / 2);
    const ax = cx + ((px - cx) / before) * r;
    const ay = cy + ((py - cy) / before) * r;
    const bx = cx + ((nx - cx) / after) * r;
    const by = cy + ((ny - cy) / after) * r;
    d += ` L${ax} ${ay} Q${cx} ${cy} ${bx} ${by}`;
  }
  const last = points[points.length - 1];
  return `${d} L${last[0]} ${last[1]}`;
}

export function crossings(layout: FlowLayout): string[] {
  const found: string[] = [];
  const margin = 3;
  for (const laid of layout.edges) {
    for (let i = 0; i < laid.points.length - 1; i++) {
      const [ax, ay] = laid.points[i];
      const [bx, by] = laid.points[i + 1];
      const x1 = Math.min(ax, bx);
      const x2 = Math.max(ax, bx);
      const y1 = Math.min(ay, by);
      const y2 = Math.max(ay, by);
      for (const entry of layout.nodes) {
        if (entry.node.id === laid.edge.from || entry.node.id === laid.edge.to) continue;
        const hits =
          x2 > entry.x + margin &&
          x1 < entry.x + NODE_W - margin &&
          y2 > entry.y + margin &&
          y1 < entry.y + NODE_H - margin;
        if (hits) found.push(`${laid.edge.from}>${laid.edge.to} passes through ${entry.node.id}`);
      }
    }
  }
  return found;
}

export function pillOverlaps(layout: FlowLayout): string[] {
  const found: string[] = [];
  const pills = layout.edges.filter((laid) => laid.label);
  const rect = (laid: LaidEdge) => ({
    x1: laid.label!.x - laid.label!.width / 2,
    x2: laid.label!.x + laid.label!.width / 2,
    y1: laid.label!.y - 11,
    y2: laid.label!.y + 11,
    name: `${laid.edge.from}>${laid.edge.to}`,
  });
  for (const laid of pills) {
    const r = rect(laid);
    for (const entry of layout.nodes) {
      if (r.x2 > entry.x && r.x1 < entry.x + NODE_W && r.y2 > entry.y && r.y1 < entry.y + NODE_H)
        found.push(`label of ${r.name} covers node ${entry.node.id}`);
    }
  }
  for (let i = 0; i < pills.length; i++) {
    for (let j = i + 1; j < pills.length; j++) {
      const a = rect(pills[i]);
      const b = rect(pills[j]);
      if (a.x2 > b.x1 && a.x1 < b.x2 && a.y2 > b.y1 && a.y1 < b.y2)
        found.push(`labels ${a.name} and ${b.name} overlap`);
    }
  }
  return found;
}

export const SEQ = {
  colW: 170,
  head: 46,
  rowH: 50,
  pad: 24,
  top: 16,
};

export interface SequenceLayout {
  width: number;
  height: number;
  actors: { id: string; label: string; kind: string; cx: number }[];
  rows: { y: number; x1: number; x2: number; self: boolean; label: string; style: EdgeStyle; n: number }[];
  lifeEnd: number;
}

export function layoutSequence(diagram: SequenceDiagram): SequenceLayout {
  const actors = diagram.actors.map((actor, i) => ({
    id: actor.id,
    label: actor.label,
    kind: actor.kind ?? "service",
    cx: SEQ.pad + i * SEQ.colW + SEQ.colW / 2,
  }));
  const at = new Map(actors.map((actor) => [actor.id, actor.cx]));
  const start = SEQ.top + SEQ.head + 34;
  const rows = diagram.messages.map((message, i) => ({
    y: start + i * SEQ.rowH,
    x1: at.get(message.from)!,
    x2: at.get(message.to)!,
    self: message.from === message.to,
    label: message.label,
    style: message.style ?? "solid",
    n: i + 1,
  }));
  const lifeEnd = start + diagram.messages.length * SEQ.rowH - 8;
  return {
    width: SEQ.pad * 2 + actors.length * SEQ.colW,
    height: lifeEnd + 20,
    actors,
    rows,
    lifeEnd,
  };
}

const LIMITS = { nodes: 10, messages: 12, cols: 4, rows: 4, edgeLabel: 20, seqLabel: 34 };

export function diagramProblems(diagram: Diagram): string[] {
  const out: string[] = [];
  if (!diagram.title || diagram.title.length > 48) out.push("title is empty or longer than 48 characters");
  if (!diagram.caption || diagram.caption.length > 170) out.push("caption is empty or longer than 170 characters");
  if (diagram.kind === "flow") {
    const ids = diagram.nodes.map((node) => node.id);
    if (new Set(ids).size !== ids.length) out.push("duplicate node ids");
    if (diagram.nodes.length < 3 || diagram.nodes.length > LIMITS.nodes) out.push(`needs 3 to ${LIMITS.nodes} nodes`);
    const cells = new Set<string>();
    for (const node of diagram.nodes) {
      out.push(...labelProblems(node));
      if (node.col < 0 || node.row < 0 || node.col > LIMITS.cols - 1 || node.row > LIMITS.rows - 1)
        out.push(`${node.id}: outside the ${LIMITS.cols} by ${LIMITS.rows} grid`);
      const cell = `${node.col},${node.row}`;
      if (cells.has(cell)) out.push(`${node.id}: shares a grid cell`);
      cells.add(cell);
    }
    const known = new Set(ids);
    for (const edge of diagram.edges) {
      if (!known.has(edge.from) || !known.has(edge.to)) {
        out.push(`edge ${edge.from}>${edge.to} names an unknown node`);
        continue;
      }
      if (edge.from === edge.to) out.push(`edge ${edge.from} loops to itself`);
      if (edge.label && edge.label.length > LIMITS.edgeLabel) out.push(`edge label too long: ${edge.label}`);
    }
    const steps = diagram.edges.map((edge) => edge.step).filter((n): n is number => typeof n === "number");
    if (new Set(steps).size !== steps.length) out.push("repeated step numbers");
    if (diagram.steps) {
      if (diagram.steps.length !== steps.length) out.push("steps list must have one entry per numbered edge");
      if (steps.some((n) => n < 1 || n > diagram.steps!.length)) out.push("step numbers must run 1..n");
    } else if (steps.length > 0) out.push("numbered edges need a steps list");
    if (out.length === 0) {
      const laid = layoutFlow(diagram);
      out.push(...crossings(laid), ...pillOverlaps(laid));
    }
  } else {
    const ids = diagram.actors.map((actor) => actor.id);
    if (new Set(ids).size !== ids.length) out.push("duplicate actor ids");
    if (diagram.actors.length < 2 || diagram.actors.length > 6) out.push("needs 2 to 6 actors");
    if (diagram.messages.length < 3 || diagram.messages.length > LIMITS.messages)
      out.push(`needs 3 to ${LIMITS.messages} messages`);
    const known = new Set(ids);
    for (const message of diagram.messages) {
      if (!known.has(message.from) || !known.has(message.to))
        out.push(`message "${message.label}" names an unknown actor`);
      if (message.label.length > LIMITS.seqLabel) out.push(`message label too long: ${message.label}`);
    }
    for (const actor of diagram.actors) if (actor.label.length > 16) out.push(`actor label too long: ${actor.label}`);
  }
  return out;
}
