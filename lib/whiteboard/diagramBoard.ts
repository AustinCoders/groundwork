import { layoutFlow, layoutSequence, NODE_H, NODE_W } from "@/app/company-questions/diagramLayout";
import type {
  Diagram,
  EdgeStyle,
  FlowDiagram,
  NodeKind,
  SequenceDiagram,
} from "@/content/system-design/company-questions/diagram-types";
import { make, meets, path, textLine, wrapWords } from "@/lib/whiteboard/build";
import {
  bounds,
  pathPoint,
  textBox,
  unionBounds,
  type Box,
  type El,
  type Kind,
  type Point,
  type Style,
} from "@/lib/whiteboard/model";
import type { CompanyBoard, Walk } from "@/lib/whiteboard/walk";

export const FLOW_SCALE = { x: 1.25, y: 1.4 };
export const SEQUENCE_SCALE = { x: 1.4, y: 1.3 };
const BLOCK_GAP = 150;
const NODE_FONT = 15;
const LABEL_FONT = 14;
const LABEL_TRIES = Array.from({ length: 33 }, (_, i) => 0.08 + i * 0.0275).sort(
  (a, b) => Math.abs(a - 0.5) - Math.abs(b - 0.5)
);

const SHAPE: Record<NodeKind, { kind: Kind; fill: string }> = {
  client: { kind: "rect", fill: "paper" },
  service: { kind: "rect", fill: "blue-soft" },
  store: { kind: "cylinder", fill: "green-soft" },
  queue: { kind: "parallelogram", fill: "purple-soft" },
  cache: { kind: "cylinder", fill: "orange-soft" },
  external: { kind: "cloud", fill: "grey-soft" },
  worker: { kind: "rect", fill: "teal-soft" },
  decision: { kind: "hexagon", fill: "yellow-soft" },
};

const DASH: Record<EdgeStyle, Style["dash"]> = { solid: "solid", dashed: "dashed", async: "dotted" };

interface Block {
  els: El[];
  box: Box;
  steps: number;
  place: (walk: WalkBuilder, offset: number) => void;
}

export interface WalkBuilder {
  captions: string[];
  spans: Record<string, [number, number]>;
  focus: string[][];
  views: Box[];
}

function titleBlock(prefix: string, diagram: Diagram): El[] {
  const caption = wrapWords(diagram.caption, 90).join("\n");
  return [
    textLine(`${prefix}title`, 0, 0, diagram.title, { fontSize: 26 }),
    { ...textLine(`${prefix}caption`, 0, 54, caption, { fontSize: 16, stroke: "grey" }) },
  ];
}

function flowBlock(diagram: FlowDiagram, prefix: string): Block {
  const laid = layoutFlow(diagram);
  const sx = FLOW_SCALE.x;
  const sy = FLOW_SCALE.y;
  const top = 54 + wrapWords(diagram.caption, 90).length * 20 + 40;
  const scale = ([px, py]: Point): Point => [px * sx, top + py * sy];
  const nodeW = NODE_W * sx;
  const nodeH = NODE_H * sy;
  const nodeId = (id: string) => `${prefix}n-${id}`;
  const nodes = laid.nodes.map((entry) => {
    const shape = SHAPE[entry.node.kind];
    const [x, y] = scale([entry.x, entry.y]);
    const text = entry.node.sub ? `${entry.node.label}\n${entry.node.sub}` : entry.node.label;
    return make(nodeId(entry.node.id), shape.kind, x, y, nodeW, nodeH, text, { fill: shape.fill, fontSize: NODE_FONT });
  });
  const taken: Box[] = nodes.map((node) => bounds(node));
  const arrows = laid.edges.map((entry, index) => {
    const points = entry.points.map(scale);
    const text = entry.edge.step
      ? entry.edge.label
        ? `${entry.edge.step}. ${entry.edge.label}`
        : String(entry.edge.step)
      : (entry.edge.label ?? "");
    const arrow: El = {
      ...path(`${prefix}e${index}`, "arrow", points[0], points, {
        dash: DASH[entry.style],
        fontSize: LABEL_FONT,
        ...(points.length > 2 ? { route: "elbow" as const } : {}),
      }),
      start: nodeId(entry.edge.from),
      end: nodeId(entry.edge.to),
    };
    if (!text) return arrow;
    const size = textBox(text, LABEL_FONT);
    const spot = (t: number): Box => {
      const [cx, cy] = pathPoint(points, t);
      return { x: cx - size.w / 2, y: cy - size.h / 2, w: size.w, h: size.h };
    };
    const at = LABEL_TRIES.find((t) => !taken.some((other) => meets(spot(t), other, 2))) ?? 0.5;
    taken.push(spot(at));
    return { ...arrow, text, labelAt: at };
  });
  const els = [...titleBlock(prefix, diagram), ...nodes, ...arrows];
  const numbered = laid.edges
    .map((entry, index) => ({ step: entry.edge.step, from: entry.edge.from, to: entry.edge.to, id: arrows[index].id }))
    .filter((entry): entry is { step: number; from: string; to: string; id: string } => entry.step !== undefined);
  const box = unionBounds(els)!;
  return {
    els,
    box,
    steps: numbered.length || 1,
    place(walk, offset) {
      const total = walk.captions.length;
      if (!numbered.length) {
        for (const el of els) walk.spans[el.id] = [offset + 1, total];
        walk.captions[offset] = diagram.caption;
        walk.views[offset] = box;
        return;
      }
      const firstSeen = new Map<string, number>();
      for (const entry of numbered)
        for (const id of [entry.from, entry.to])
          firstSeen.set(id, Math.min(firstSeen.get(id) ?? Infinity, offset + entry.step));
      const start = (id: string) => firstSeen.get(id) ?? offset + 1;
      for (const node of laid.nodes) walk.spans[nodeId(node.node.id)] = [start(node.node.id), total];
      for (const id of [`${prefix}title`, `${prefix}caption`]) walk.spans[id] = [offset + 1, total];
      laid.edges.forEach((entry, index) => {
        const step = entry.edge.step;
        walk.spans[arrows[index].id] = [
          step ? offset + step : Math.max(start(entry.edge.from), start(entry.edge.to)),
          total,
        ];
      });
      numbered.forEach((entry) => {
        const at = offset + entry.step;
        const fresh = [entry.from, entry.to].filter((id) => start(id) === at).map(nodeId);
        walk.focus[at - 1] = [entry.id, ...fresh];
        walk.captions[at - 1] = diagram.steps![entry.step - 1];
        walk.views[at - 1] = box;
      });
    },
  };
}

function sequenceBlock(diagram: SequenceDiagram, prefix: string): Block {
  const laid = layoutSequence(diagram);
  const sx = SEQUENCE_SCALE.x;
  const sy = SEQUENCE_SCALE.y;
  const top = 54 + wrapWords(diagram.caption, 90).length * 20 + 30;
  const headW = 190;
  const headH = 56;
  const heads = laid.actors.map((actor) => {
    const shape = SHAPE[actor.kind as NodeKind] ?? SHAPE.service;
    return make(`${prefix}a-${actor.id}`, shape.kind, actor.cx * sx - headW / 2, top, headW, headH, actor.label, {
      fill: shape.fill,
      fontSize: NODE_FONT,
    });
  });
  const firstRow = laid.rows[0].y;
  const lifeEnd = top + headH + (laid.lifeEnd - firstRow) * sy + 70;
  const lines = laid.actors.map((actor) =>
    path(
      `${prefix}life-${actor.id}`,
      "line",
      [actor.cx * sx, top + headH],
      [
        [actor.cx * sx, top + headH],
        [actor.cx * sx, lifeEnd],
      ],
      { dash: "dashed", stroke: "grey", width: 1 }
    )
  );
  const messages: El[][] = laid.rows.map((row, index) => {
    const y = top + headH + 60 + (row.y - firstRow) * sy;
    const x1 = row.x1 * sx;
    const x2 = row.x2 * sx;
    const text = `${row.n}. ${row.label}`;
    const size = textBox(text, LABEL_FONT);
    const style = { dash: DASH[row.style], width: 2 };
    if (row.self) {
      const arrow = path(
        `${prefix}m${index}`,
        "arrow",
        [x1, y],
        [
          [x1, y],
          [x1 + 44, y],
          [x1 + 44, y + 26],
          [x1, y + 26],
        ],
        style
      );
      return [arrow, textLine(`${prefix}t${index}`, x1 + 56, y + 13 - size.h / 2, text, { fontSize: LABEL_FONT })];
    }
    const arrow = path(
      `${prefix}m${index}`,
      "arrow",
      [x1, y],
      [
        [x1, y],
        [x2, y],
      ],
      style
    );
    return [
      arrow,
      textLine(`${prefix}t${index}`, (x1 + x2) / 2 - size.w / 2, y - size.h - 4, text, { fontSize: LABEL_FONT }),
    ];
  });
  const els = [...titleBlock(prefix, diagram), ...heads, ...lines, ...messages.flat()];
  const box = unionBounds(els)!;
  return {
    els,
    box,
    steps: messages.length,
    place(walk, offset) {
      const total = walk.captions.length;
      for (const el of [...titleBlock(prefix, diagram), ...heads, ...lines]) walk.spans[el.id] = [offset + 1, total];
      const name = new Map(diagram.actors.map((actor) => [actor.id, actor.label]));
      messages.forEach((pair, index) => {
        const at = offset + index + 1;
        for (const el of pair) walk.spans[el.id] = [at, total];
        walk.focus[at - 1] = pair.map((el) => el.id);
        const message = diagram.messages[index];
        walk.captions[at - 1] =
          message.from === message.to
            ? `${name.get(message.from)}: ${message.label}`
            : `${name.get(message.from)} to ${name.get(message.to)}: ${message.label}`;
        walk.views[at - 1] = box;
      });
    },
  };
}

export function diagramsBoard(title: string, diagrams: readonly Diagram[]): CompanyBoard {
  const blocks = diagrams.map((diagram, index) =>
    diagram.kind === "flow" ? flowBlock(diagram, `d${index}-`) : sequenceBlock(diagram, `d${index}-`)
  );
  let y = 0;
  const placed: { block: Block; dy: number }[] = [];
  for (const block of blocks) {
    placed.push({ block, dy: y - block.box.y });
    y += block.box.h + BLOCK_GAP;
  }
  const shift = (el: El, dy: number): El => ({ ...el, y: el.y + dy });
  const els = placed.flatMap(({ block, dy }) => block.els.map((el) => shift(el, dy)));
  const total = blocks.reduce((sum, block) => sum + block.steps, 0);
  if (total === 0) return { title, els };

  const walk: WalkBuilder = {
    captions: Array<string>(total).fill(""),
    spans: {},
    focus: Array.from({ length: total }, () => []),
    views: Array<Box>(total),
  };
  let offset = 0;
  for (const { block, dy } of placed) {
    if (block.steps === 0) continue;
    block.place(walk, offset);
    for (let at = offset; at < offset + block.steps; at++) {
      const view = walk.views[at];
      walk.views[at] = { ...view, y: view.y + dy };
    }
    offset += block.steps;
  }
  return { title, els, walk: walk as Walk };
}
