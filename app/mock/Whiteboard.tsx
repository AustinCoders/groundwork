"use client";

import { useRef, useState } from "react";
import type { Board, BoardShape } from "@/lib/mock/board";
import { addShape, connect, moveShape, relabel, removeShape, STENCILS } from "@/lib/mock/board";
import styles from "./mock.module.css";

type Tool = "select" | "box" | "text" | "arrow";

const W = 800;
const H = 420;

function centre(s: BoardShape) {
  return { x: s.x + s.w / 2, y: s.y + s.h / 2 };
}

function edgePoint(from: BoardShape, to: BoardShape) {
  const a = centre(from);
  const b = centre(to);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (!dx && !dy) return a;
  const sx = dx ? from.w / 2 / Math.abs(dx) : Infinity;
  const sy = dy ? from.h / 2 / Math.abs(dy) : Infinity;
  const k = Math.min(sx, sy);
  return { x: a.x + dx * k, y: a.y + dy * k };
}

export function BoardView({
  board,
  selected,
  onShapeDown,
  onCanvasDown,
  onMove,
  onUp,
  svgRef,
}: {
  board: Board;
  selected?: string | null;
  onShapeDown?: (id: string, e: React.PointerEvent) => void;
  onCanvasDown?: (e: React.PointerEvent<SVGSVGElement>) => void;
  onMove?: (e: React.PointerEvent<SVGSVGElement>) => void;
  onUp?: () => void;
  svgRef?: React.Ref<SVGSVGElement>;
}) {
  const byId = new Map(board.shapes.map((s) => [s.id, s]));
  return (
    <svg
      ref={svgRef}
      className={styles.board}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Whiteboard with ${board.shapes.length} shapes and ${board.arrows.length} arrows`}
      onPointerDown={onCanvasDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
    >
      <defs>
        <marker id="board-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0L10 5L0 10z" className={styles.boardHead} />
        </marker>
      </defs>
      {board.arrows.map((a) => {
        const from = byId.get(a.from);
        const to = byId.get(a.to);
        if (!from || !to) return null;
        const p = edgePoint(from, to);
        const q = edgePoint(to, from);
        return (
          <line
            key={a.id}
            x1={p.x}
            y1={p.y}
            x2={q.x}
            y2={q.y}
            className={styles.boardArrow}
            markerEnd="url(#board-arrow)"
          />
        );
      })}
      {board.shapes.map((s) => (
        <g
          key={s.id}
          className={styles.boardShape}
          data-kind={s.kind}
          data-selected={selected === s.id || undefined}
          onPointerDown={onShapeDown ? (e) => onShapeDown(s.id, e) : undefined}
        >
          <rect className={styles.boardHit} x={s.x} y={s.y} width={s.w} height={s.h} />
          {s.kind === "text" ? null : s.kind === "db" ? (
            <path
              d={`M${s.x} ${s.y + 10} a${s.w / 2} 10 0 0 0 ${s.w} 0 v${s.h - 20} a${s.w / 2} 10 0 0 1 ${-s.w} 0 z M${s.x} ${s.y + 10} a${s.w / 2} 10 0 0 1 ${s.w} 0`}
            />
          ) : (
            <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={s.kind === "queue" ? 4 : 12} />
          )}
          <text x={s.x + s.w / 2} y={s.y + s.h / 2} dominantBaseline="middle" textAnchor="middle">
            {s.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function Whiteboard({ board, onChange }: { board: Board; onChange: (b: Board) => void }) {
  const [tool, setTool] = useState<Tool>("select");
  const [selected, setSelected] = useState<string | null>(null);
  const [arrowFrom, setArrowFrom] = useState<string | null>(null);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  function toBoard(e: React.PointerEvent) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const r = svg.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  }

  function onShapeDown(id: string, e: React.PointerEvent) {
    e.stopPropagation();
    if (tool === "arrow") {
      if (!arrowFrom) setArrowFrom(id);
      else {
        if (arrowFrom !== id) onChange(connect(board, arrowFrom, id));
        setArrowFrom(null);
      }
      return;
    }
    setSelected(id);
    const s = board.shapes.find((x) => x.id === id);
    const p = toBoard(e);
    if (s) drag.current = { id, dx: p.x - s.x, dy: p.y - s.y };
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  }

  function onCanvasDown(e: React.PointerEvent<SVGSVGElement>) {
    const p = toBoard(e);
    if (tool === "box" || tool === "text") {
      const next = addShape(board, tool === "box" ? "box" : "text", p.x, p.y, tool === "box" ? "Service" : "Note");
      onChange(next);
      setSelected(next.shapes.at(-1)!.id);
      setTool("select");
      return;
    }
    setSelected(null);
    setArrowFrom(null);
  }

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!drag.current) return;
    const p = toBoard(e);
    onChange(moveShape(board, drag.current.id, p.x - drag.current.dx, p.y - drag.current.dy, W, H));
  }

  const current = board.shapes.find((s) => s.id === selected) ?? null;

  return (
    <div
      className={styles.boardWrap}
      onKeyDown={(e) => {
        if ((e.key === "Delete" || e.key === "Backspace") && current && !(e.target instanceof HTMLInputElement)) {
          onChange(removeShape(board, current.id));
          setSelected(null);
        }
      }}
    >
      <div className={styles.boardTools} role="toolbar" aria-label="Whiteboard tools">
        {(
          [
            ["select", "Select / move"],
            ["box", "Box"],
            ["arrow", "Arrow"],
            ["text", "Text"],
          ] as const
        ).map(([t, label]) => (
          <button
            key={t}
            type="button"
            className={styles.boardTool}
            aria-pressed={tool === t}
            onClick={() => {
              setTool(t);
              setArrowFrom(null);
            }}
          >
            {label}
          </button>
        ))}
        <span className={styles.boardSep} aria-hidden="true" />
        {STENCILS.map((st) => (
          <button
            key={st.label}
            type="button"
            className={styles.boardStencil}
            onClick={() => {
              const n = board.shapes.length;
              const next = addShape(board, st.kind, 90 + (n % 5) * 140, 70 + Math.floor(n / 5) * 110, st.label);
              onChange(next);
              setSelected(next.shapes.at(-1)!.id);
            }}
          >
            + {st.label}
          </button>
        ))}
      </div>
      <BoardView
        board={board}
        selected={selected ?? arrowFrom}
        onShapeDown={onShapeDown}
        onCanvasDown={onCanvasDown}
        onMove={onMove}
        onUp={() => {
          drag.current = null;
        }}
        svgRef={svgRef}
      />
      <div className={styles.boardFoot}>
        {current ? (
          <>
            <label className={styles.boardLabel}>
              Label
              <input value={current.label} onChange={(e) => onChange(relabel(board, current.id, e.target.value))} />
            </label>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                onChange(removeShape(board, current.id));
                setSelected(null);
              }}
            >
              Delete
            </button>
          </>
        ) : (
          <span className={styles.hint}>
            {tool === "arrow"
              ? arrowFrom
                ? "Now pick where it goes."
                : "Pick the box the arrow starts from."
              : tool === "select"
                ? "Drag to move. Pick a shape to rename or delete it."
                : "Click the board to place it."}
          </span>
        )}
        <span className={styles.spacer} />
        {board.shapes.length > 0 && (
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              if (window.confirm("Clear the whole whiteboard?")) onChange({ shapes: [], arrows: [] });
            }}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
