"use client";

import { FILLS, STROKES, type Dash, type Kind, type Style, type Tool } from "@/lib/whiteboard/model";
import styles from "./whiteboard.module.css";

const NAMES: Record<string, string> = {
  ink: "Ink",
  none: "No fill",
  paper: "Paper",
  "#e03131": "Red",
  "#2f9e44": "Green",
  "#1971c2": "Blue",
  "#f08c00": "Orange",
  "#9c36b5": "Purple",
  "#0c8599": "Teal",
  "#868e96": "Grey",
  "#ffc9c9": "Pink",
  "#b2f2bb": "Mint",
  "#a5d8ff": "Sky",
  "#ffec99": "Butter",
  "#eebefa": "Lilac",
  "#99e9f2": "Aqua",
};

function Swatch({
  value,
  active,
  onPick,
  label,
}: {
  value: string;
  active: boolean;
  onPick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      className={styles.swatch}
      data-value={value}
      aria-pressed={active}
      aria-label={`${label}: ${NAMES[value] ?? value}`}
      title={NAMES[value] ?? value}
      style={{
        ["--swatch" as string]: value === "ink" ? "var(--wb-ink)" : value === "paper" ? "var(--wb-paper)" : value,
      }}
      onClick={onPick}
    />
  );
}

export function StylePanel({
  style,
  kinds,
  count,
  onStyle,
  onLayer,
  onDuplicate,
  onDelete,
  onClose,
}: {
  onClose: () => void;
  style: Style;
  kinds: (Kind | Tool)[];
  count: number;
  onStyle: (patch: Partial<Style>) => void;
  onLayer: (to: "front" | "back" | "forward" | "backward") => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const fillable = kinds.some((k) => k === "rect" || k === "ellipse" || k === "diamond" || k === "sticky");
  const hasText = kinds.some(
    (k) => k === "text" || k === "sticky" || k === "rect" || k === "ellipse" || k === "diamond"
  );
  const stroked = kinds.some((k) => k !== "image" && k !== "sticky");

  return (
    <aside className={styles.panel} aria-label="Style">
      <button type="button" className={styles.panelClose} aria-label="Close the style panel" onClick={onClose}>
        ×
      </button>
      {stroked && (
        <fieldset className={styles.group}>
          <legend>Stroke</legend>
          <div className={styles.swatches}>
            {STROKES.map((c) => (
              <Swatch
                key={c}
                value={c}
                label="Stroke"
                active={style.stroke === c}
                onPick={() => onStyle({ stroke: c })}
              />
            ))}
          </div>
        </fieldset>
      )}
      {fillable && (
        <fieldset className={styles.group}>
          <legend>Fill</legend>
          <div className={styles.swatches}>
            {FILLS.map((c) => (
              <Swatch key={c} value={c} label="Fill" active={style.fill === c} onPick={() => onStyle({ fill: c })} />
            ))}
          </div>
        </fieldset>
      )}
      {stroked && (
        <fieldset className={styles.group}>
          <legend>Width</legend>
          <div className={styles.seg}>
            {[1, 2, 4, 6].map((w) => (
              <button
                key={w}
                type="button"
                aria-pressed={style.width === w}
                aria-label={`Width ${w}`}
                onClick={() => onStyle({ width: w })}
              >
                <span className={styles.widthBar} style={{ height: w }} />
              </button>
            ))}
          </div>
        </fieldset>
      )}
      {stroked && (
        <fieldset className={styles.group}>
          <legend>Line</legend>
          <div className={styles.seg}>
            {(["solid", "dashed", "dotted"] as Dash[]).map((d) => (
              <button key={d} type="button" aria-pressed={style.dash === d} onClick={() => onStyle({ dash: d })}>
                {d}
              </button>
            ))}
          </div>
        </fieldset>
      )}
      {hasText && (
        <fieldset className={styles.group}>
          <legend>Text size</legend>
          <div className={styles.seg}>
            {[
              [14, "S"],
              [20, "M"],
              [28, "L"],
              [40, "XL"],
            ].map(([size, label]) => (
              <button
                key={size}
                type="button"
                aria-pressed={style.fontSize === size}
                onClick={() => onStyle({ fontSize: Number(size) })}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
      )}
      <fieldset className={styles.group}>
        <legend>Opacity {Math.round(style.opacity * 100)}%</legend>
        <input
          type="range"
          min={10}
          max={100}
          step={10}
          value={Math.round(style.opacity * 100)}
          aria-label="Opacity"
          onChange={(e) => onStyle({ opacity: Number(e.target.value) / 100 })}
        />
      </fieldset>
      {count > 0 && (
        <fieldset className={styles.group}>
          <legend>{count} selected</legend>
          <div className={styles.actions}>
            <button type="button" title="Bring to front — ⇧]" onClick={() => onLayer("front")}>
              To front
            </button>
            <button type="button" title="Bring forward — ]" onClick={() => onLayer("forward")}>
              Forward
            </button>
            <button type="button" title="Send backward — [" onClick={() => onLayer("backward")}>
              Backward
            </button>
            <button type="button" title="Send to back — ⇧[" onClick={() => onLayer("back")}>
              To back
            </button>
            <button type="button" title="Duplicate — ⌘/Ctrl D" onClick={onDuplicate}>
              Duplicate
            </button>
            <button type="button" className={styles.danger} title="Delete — Del" onClick={onDelete}>
              Delete
            </button>
          </div>
        </fieldset>
      )}
    </aside>
  );
}
