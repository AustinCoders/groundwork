"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./icons";
import styles from "./whiteboard.module.css";

export type Paper = "blank" | "dots" | "grid" | "graph" | "lines" | "isometric";

export const PAPERS: { value: Paper; label: string }[] = [
  { value: "blank", label: "Blank" },
  { value: "dots", label: "Dots" },
  { value: "grid", label: "Grid" },
  { value: "graph", label: "Graph" },
  { value: "lines", label: "Ruled" },
  { value: "isometric", label: "Isometric" },
];

export function isPaper(v: unknown): v is Paper {
  return PAPERS.some((p) => p.value === v);
}

const ISO_W = 20 * Math.sqrt(3);

function PatternBody({ paper, w }: { paper: Paper; w: number }) {
  switch (paper) {
    case "dots":
      return <circle cx={1} cy={1} r={w} className={styles.paperDot} />;
    case "grid":
      return <path d="M20 0H0V20" fill="none" strokeWidth={w} className={styles.paperLine} />;
    case "graph":
      return (
        <>
          <path
            d="M20 0V100M40 0V100M60 0V100M80 0V100M0 20H100M0 40H100M0 60H100M0 80H100"
            fill="none"
            strokeWidth={w}
            className={styles.paperFaint}
          />
          <path d="M100 0H0V100" fill="none" strokeWidth={w * 1.5} className={styles.paperLine} />
        </>
      );
    case "lines":
      return <path d="M0 0H100" fill="none" strokeWidth={w} className={styles.paperLine} />;
    case "isometric":
      return (
        <path
          d={`M0 0L${ISO_W} 20M0 20L${ISO_W} 0M0 0V20M${ISO_W / 2} 0V20`}
          fill="none"
          strokeWidth={w}
          className={styles.paperFaint}
        />
      );
    default:
      return null;
  }
}

function tile(paper: Paper): { w: number; h: number } {
  if (paper === "graph") return { w: 100, h: 100 };
  if (paper === "lines") return { w: 100, h: 32 };
  if (paper === "isometric") return { w: ISO_W, h: 20 };
  return { w: 20, h: 20 };
}

export function PaperPattern({ id, paper, zoom }: { id: string; paper: Paper; zoom: number }) {
  if (paper === "blank") return null;
  const { w, h } = tile(paper);
  return (
    <pattern id={id} width={w} height={h} patternUnits="userSpaceOnUse">
      <PatternBody paper={paper} w={1 / zoom} />
    </pattern>
  );
}

export function paperVisible(paper: Paper, zoom: number): boolean {
  if (paper === "blank") return false;
  if (paper === "graph" || paper === "lines") return zoom > 0.15;
  return zoom > 0.35;
}

function Preview({ paper }: { paper: Paper }) {
  const id = `wb-preview-${paper}`;
  return (
    <svg viewBox="0 0 60 40" className={styles.paperPreview} aria-hidden="true">
      <defs>
        <PaperPattern id={id} paper={paper} zoom={1} />
      </defs>
      <rect width="60" height="40" fill={paper === "blank" ? "none" : `url(#${id})`} />
    </svg>
  );
}

export function PagePicker({
  paper,
  onPaper,
  snap,
  onSnap,
}: {
  paper: Paper;
  onPaper: (p: Paper) => void;
  snap: boolean;
  onSnap: (v: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: PointerEvent) {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={styles.pageWrap} ref={wrap}>
      <button
        type="button"
        aria-label="Page layout"
        aria-expanded={open}
        aria-haspopup="dialog"
        title="Page layout and snapping"
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name="grid" />
      </button>
      {open && (
        <div className={styles.pagePop} role="dialog" aria-label="Page layout">
          <p className={styles.menuH}>Page</p>
          <div className={styles.paperGrid}>
            {PAPERS.map((p) => (
              <button
                key={p.value}
                type="button"
                className={styles.paperOpt}
                aria-pressed={paper === p.value}
                onClick={() => onPaper(p.value)}
              >
                <Preview paper={p.value} />
                <span>{p.label}</span>
              </button>
            ))}
          </div>
          <label className={styles.snapRow}>
            <input type="checkbox" checked={snap} onChange={(e) => onSnap(e.target.checked)} />
            <span>Snap to grid</span>
            <kbd>G</kbd>
          </label>
        </div>
      )}
    </div>
  );
}
