export type ShapeKind = "box" | "db" | "queue" | "text";

export interface BoardShape {
  id: string;
  kind: ShapeKind;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
}

export interface BoardArrow {
  id: string;
  from: string;
  to: string;
}

export interface Board {
  shapes: BoardShape[];
  arrows: BoardArrow[];
}

export const EMPTY_BOARD: Board = { shapes: [], arrows: [] };

export const STENCILS: { label: string; kind: ShapeKind }[] = [
  { label: "Client", kind: "box" },
  { label: "Load balancer", kind: "box" },
  { label: "Service", kind: "box" },
  { label: "Database", kind: "db" },
  { label: "Cache", kind: "box" },
  { label: "Queue", kind: "queue" },
];

const SIZE: Record<ShapeKind, { w: number; h: number }> = {
  box: { w: 120, h: 56 },
  db: { w: 110, h: 70 },
  queue: { w: 130, h: 40 },
  text: { w: 120, h: 30 },
};

function nextId(board: Board): string {
  let n = board.shapes.length + board.arrows.length + 1;
  const used = new Set([...board.shapes.map((s) => s.id), ...board.arrows.map((a) => a.id)]);
  while (used.has(`s${n}`)) n++;
  return `s${n}`;
}

export function addShape(board: Board, kind: ShapeKind, x: number, y: number, label: string): Board {
  const { w, h } = SIZE[kind];
  const shape = { id: nextId(board), kind, x: Math.round(x - w / 2), y: Math.round(y - h / 2), w, h, label };
  return { ...board, shapes: [...board.shapes, shape] };
}

export function moveShape(board: Board, id: string, x: number, y: number, maxW = 800, maxH = 420): Board {
  return {
    ...board,
    shapes: board.shapes.map((s) =>
      s.id === id
        ? {
            ...s,
            x: Math.round(Math.max(0, Math.min(maxW - s.w, x))),
            y: Math.round(Math.max(0, Math.min(maxH - s.h, y))),
          }
        : s
    ),
  };
}

export function relabel(board: Board, id: string, label: string): Board {
  return { ...board, shapes: board.shapes.map((s) => (s.id === id ? { ...s, label: label.slice(0, 40) } : s)) };
}

export function removeShape(board: Board, id: string): Board {
  return {
    shapes: board.shapes.filter((s) => s.id !== id),
    arrows: board.arrows.filter((a) => a.from !== id && a.to !== id),
  };
}

export function connect(board: Board, from: string, to: string): Board {
  if (from === to || board.arrows.some((a) => a.from === from && a.to === to)) return board;
  return { ...board, arrows: [...board.arrows, { id: nextId(board), from, to }] };
}
