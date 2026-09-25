"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./icons";
import styles from "./whiteboard.module.css";

export type Category = "dots" | "grid" | "lines" | "technical";

interface PaperDef {
  id: string;
  label: string;
  cat: Category | "blank";
  w: number;
  h: number;
  step: number;
  minZoom: number;
  margin?: number;
  body: (sw: number) => React.ReactNode;
}

const S3 = Math.sqrt(3);
const HEX = 12;
const HEX_W = S3 * HEX;

const faint = styles.paperFaint;
const line = styles.paperLine;
const dot = styles.paperDot;

export const PAPERS: PaperDef[] = [
  { id: "blank", label: "Blank", cat: "blank", w: 20, h: 20, step: 20, minZoom: 0, body: () => null },
  {
    id: "dots",
    label: "Dots",
    cat: "dots",
    w: 20,
    h: 20,
    step: 20,
    minZoom: 0.35,
    body: (sw) => <circle cx={1} cy={1} r={sw} className={dot} />,
  },
  {
    id: "dots-wide",
    label: "Wide dots",
    cat: "dots",
    w: 40,
    h: 40,
    step: 40,
    minZoom: 0.2,
    body: (sw) => <circle cx={1} cy={1} r={sw * 1.2} className={dot} />,
  },
  {
    id: "dots-bold",
    label: "Bold dots",
    cat: "dots",
    w: 24,
    h: 24,
    step: 24,
    minZoom: 0.3,
    body: (sw) => <circle cx={2} cy={2} r={sw * 2} className={dot} />,
  },
  {
    id: "crosses",
    label: "Crosses",
    cat: "dots",
    w: 24,
    h: 24,
    step: 24,
    minZoom: 0.3,
    body: (sw) => (
      <path d="M0 -3V3M-3 0H3M24 21V27M21 24H27M0 21V27M-3 24H3M24 -3V3M21 0H27" strokeWidth={sw} className={line} />
    ),
  },
  {
    id: "dots-iso",
    label: "Triangle dots",
    cat: "dots",
    w: HEX_W * 2,
    h: 24,
    step: 12,
    minZoom: 0.35,
    body: (sw) => (
      <>
        <circle cx={0} cy={0} r={sw} className={dot} />
        <circle cx={HEX_W} cy={12} r={sw} className={dot} />
        <circle cx={HEX_W * 2} cy={0} r={sw} className={dot} />
        <circle cx={0} cy={24} r={sw} className={dot} />
        <circle cx={HEX_W * 2} cy={24} r={sw} className={dot} />
      </>
    ),
  },
  {
    id: "grid",
    label: "Grid",
    cat: "grid",
    w: 20,
    h: 20,
    step: 20,
    minZoom: 0.35,
    body: (sw) => <path d="M20 0H0V20" fill="none" strokeWidth={sw} className={line} />,
  },
  {
    id: "grid-large",
    label: "Large grid",
    cat: "grid",
    w: 40,
    h: 40,
    step: 40,
    minZoom: 0.2,
    body: (sw) => <path d="M40 0H0V40" fill="none" strokeWidth={sw} className={line} />,
  },
  {
    id: "graph",
    label: "Graph",
    cat: "grid",
    w: 100,
    h: 100,
    step: 20,
    minZoom: 0.15,
    body: (sw) => (
      <>
        <path
          d="M20 0V100M40 0V100M60 0V100M80 0V100M0 20H100M0 40H100M0 60H100M0 80H100"
          fill="none"
          strokeWidth={sw}
          className={faint}
        />
        <path d="M100 0H0V100" fill="none" strokeWidth={sw * 1.5} className={line} />
      </>
    ),
  },
  {
    id: "grid-dashed",
    label: "Dashed grid",
    cat: "grid",
    w: 24,
    h: 24,
    step: 24,
    minZoom: 0.35,
    body: (sw) => (
      <path d="M24 0H0V24" fill="none" strokeWidth={sw} strokeDasharray={`${sw * 3} ${sw * 3}`} className={line} />
    ),
  },
  {
    id: "ruled",
    label: "Ruled",
    cat: "lines",
    w: 100,
    h: 32,
    step: 16,
    minZoom: 0.15,
    body: (sw) => <path d="M0 0H100" fill="none" strokeWidth={sw} className={line} />,
  },
  {
    id: "ruled-narrow",
    label: "Narrow ruled",
    cat: "lines",
    w: 100,
    h: 24,
    step: 12,
    minZoom: 0.2,
    body: (sw) => <path d="M0 0H100" fill="none" strokeWidth={sw} className={line} />,
  },
  {
    id: "ruled-margin",
    label: "Ruled + margin",
    cat: "lines",
    w: 100,
    h: 32,
    step: 16,
    minZoom: 0.15,
    margin: 64,
    body: (sw) => <path d="M0 0H100" fill="none" strokeWidth={sw} className={line} />,
  },
  {
    id: "handwriting",
    label: "Handwriting",
    cat: "lines",
    w: 100,
    h: 48,
    step: 12,
    minZoom: 0.2,
    body: (sw) => (
      <>
        <path d="M0 0H100M0 24H100" fill="none" strokeWidth={sw} className={line} />
        <path d="M0 12H100" fill="none" strokeWidth={sw} strokeDasharray={`${sw * 4} ${sw * 4}`} className={faint} />
      </>
    ),
  },
  {
    id: "music",
    label: "Music staff",
    cat: "lines",
    w: 100,
    h: 80,
    step: 8,
    minZoom: 0.2,
    body: (sw) => (
      <path d="M0 0H100M0 8H100M0 16H100M0 24H100M0 32H100" fill="none" strokeWidth={sw} className={line} />
    ),
  },
  {
    id: "isometric",
    label: "Isometric",
    cat: "technical",
    w: HEX_W * 2,
    h: 24,
    step: 12,
    minZoom: 0.35,
    body: (sw) => (
      <path
        d={`M0 0L${HEX_W * 2} 24M0 24L${HEX_W * 2} 0M0 0V24M${HEX_W} 0V24`}
        fill="none"
        strokeWidth={sw}
        className={faint}
      />
    ),
  },
  {
    id: "hex",
    label: "Hexagons",
    cat: "technical",
    w: HEX_W,
    h: HEX * 3,
    step: 12,
    minZoom: 0.35,
    body: (sw) => (
      <path
        d={`M${HEX_W / 2} 0V${HEX / 2}L${HEX_W} ${HEX}V${HEX * 2}L${HEX_W / 2} ${HEX * 2.5}V${HEX * 3}M${HEX_W / 2} ${HEX / 2}L0 ${HEX}V${HEX * 2}L${HEX_W / 2} ${HEX * 2.5}`}
        fill="none"
        strokeWidth={sw}
        className={faint}
      />
    ),
  },
  {
    id: "engineering",
    label: "Engineering",
    cat: "technical",
    w: 50,
    h: 50,
    step: 10,
    minZoom: 0.3,
    body: (sw) => (
      <>
        <path
          d="M10 0V50M20 0V50M30 0V50M40 0V50M0 10H50M0 20H50M0 30H50M0 40H50"
          fill="none"
          strokeWidth={sw * 0.8}
          className={faint}
        />
        <path d="M50 0H0V50" fill="none" strokeWidth={sw * 1.3} className={line} />
      </>
    ),
  },
  {
    id: "storyboard",
    label: "Storyboard",
    cat: "technical",
    w: 360,
    h: 260,
    step: 20,
    minZoom: 0.1,
    body: (sw) => (
      <>
        <rect x={20} y={20} width={320} height={180} rx={6} fill="none" strokeWidth={sw * 1.5} className={line} />
        <path d="M20 222H340M20 242H260" fill="none" strokeWidth={sw} className={faint} />
      </>
    ),
  },
];

const ALIASES: Record<string, string> = { lines: "ruled" };

export function paperOf(id: string | undefined): PaperDef {
  const key = id ? (ALIASES[id] ?? id) : "dots";
  return PAPERS.find((p) => p.id === key) ?? PAPERS[1];
}

export interface Tint {
  id: string;
  label: string;
  paper?: string;
  ink?: string;
  line?: string;
}

export const TINTS: Tint[] = [
  { id: "auto", label: "Theme" },
  { id: "white", label: "White", paper: "#ffffff", ink: "#1e1e1e", line: "#d7dbe0" },
  { id: "cream", label: "Cream", paper: "#fbf5e6", ink: "#2b2620", line: "#e4d8b8" },
  { id: "kraft", label: "Kraft", paper: "#d9c09a", ink: "#2a2017", line: "#b89d74" },
  { id: "mint", label: "Mint", paper: "#e9f7ef", ink: "#1d3327", line: "#bfe0cc" },
  { id: "blueprint", label: "Blueprint", paper: "#1d4f8f", ink: "#f2f6ff", line: "#4f7fc0" },
  { id: "chalk", label: "Chalkboard", paper: "#27433a", ink: "#f3f0e6", line: "#46665b" },
  { id: "night", label: "Night", paper: "#14161b", ink: "#e8e8ea", line: "#30343c" },
];

export function tintOf(id: string | undefined): Tint {
  return TINTS.find((t) => t.id === id) ?? TINTS[0];
}

export function tintVars(t: Tint): React.CSSProperties | undefined {
  if (!t.paper) return undefined;
  return {
    ["--wb-paper" as string]: t.paper,
    ["--wb-ink" as string]: t.ink,
    ["--wb-line" as string]: t.line,
    ["--wb-muted" as string]: t.ink,
  };
}

export function PaperPattern({
  id,
  paper,
  zoom,
  scale = 1,
}: {
  id: string;
  paper: PaperDef;
  zoom: number;
  scale?: number;
}) {
  if (paper.cat === "blank") return null;
  return (
    <pattern
      id={id}
      width={paper.w}
      height={paper.h}
      patternUnits="userSpaceOnUse"
      patternTransform={scale === 1 ? undefined : `scale(${scale})`}
    >
      {paper.body(1 / zoom / scale)}
    </pattern>
  );
}

export function paperVisible(paper: PaperDef, zoom: number): boolean {
  return paper.cat !== "blank" && zoom > paper.minZoom;
}

function Preview({ paper, tint }: { paper: PaperDef; tint: Tint }) {
  const id = `wb-preview-${paper.id}`;
  const scale = Math.min(1, 36 / Math.max(paper.h, paper.w / 2));
  return (
    <svg viewBox="0 0 60 40" className={styles.paperPreview} aria-hidden="true" style={tintVars(tint)}>
      <defs>
        <PaperPattern id={id} paper={paper} zoom={1} scale={scale} />
      </defs>
      <rect width="60" height="40" fill={paper.cat === "blank" ? "none" : `url(#${id})`} />
      {paper.margin !== undefined && <path d="M12 0V40" className={styles.paperMargin} strokeWidth={1} />}
    </svg>
  );
}

const TABS: { id: Category | "colour"; label: string }[] = [
  { id: "dots", label: "Dots" },
  { id: "grid", label: "Grid" },
  { id: "lines", label: "Lines" },
  { id: "technical", label: "Technical" },
  { id: "colour", label: "Colour" },
];

export function PagePicker({
  paper,
  tint,
  onPaper,
  onTint,
  snap,
  onSnap,
}: {
  paper: PaperDef;
  tint: Tint;
  onPaper: (id: string) => void;
  onTint: (id: string) => void;
  snap: boolean;
  onSnap: (v: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Category | "colour">(paper.cat === "blank" ? "dots" : paper.cat);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: PointerEvent) {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      setOpen(false);
    }
    window.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const options = PAPERS.filter((p) => p.cat === tab);

  return (
    <div className={styles.pageWrap} ref={wrap}>
      <button
        type="button"
        className={styles.islandBtn}
        aria-label="Page layout"
        aria-expanded={open}
        aria-haspopup="dialog"
        title="Page layout, colour and snapping"
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name="grid" />
      </button>
      {open && (
        <div className={styles.pagePop} role="dialog" aria-label="Page layout">
          <div className={styles.pageHead}>
            <p className={styles.menuH}>Page</p>
            <button
              type="button"
              className={styles.blankBtn}
              aria-pressed={paper.cat === "blank"}
              onClick={() => onPaper("blank")}
            >
              Blank page
            </button>
          </div>
          <div className={styles.tabs} role="tablist" aria-label="Page categories">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`wb-tab-${t.id}`}
                aria-selected={tab === t.id}
                aria-controls="wb-page-panel"
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className={styles.paperGrid} role="tabpanel" id="wb-page-panel" aria-labelledby={`wb-tab-${tab}`}>
            {tab === "colour"
              ? TINTS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={styles.paperOpt}
                    aria-pressed={tint.id === t.id}
                    onClick={() => onTint(t.id)}
                  >
                    <span
                      className={styles.tintChip}
                      style={{ background: t.paper ?? "var(--sheet)", color: t.ink ?? "var(--ink)" }}
                      aria-hidden="true"
                    >
                      Aa
                    </span>
                    <span>{t.label}</span>
                  </button>
                ))
              : options.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={styles.paperOpt}
                    aria-pressed={paper.id === p.id}
                    onClick={() => onPaper(p.id)}
                  >
                    <Preview paper={p} tint={tint} />
                    <span>{p.label}</span>
                  </button>
                ))}
          </div>
          <label className={styles.snapRow}>
            <input type="checkbox" checked={snap} onChange={(e) => onSnap(e.target.checked)} />
            <span>Snap to the page ({paper.step}px)</span>
            <kbd>G</kbd>
          </label>
        </div>
      )}
    </div>
  );
}
