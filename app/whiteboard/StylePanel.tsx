"use client";

import {
  FILLS,
  isBoxKind,
  STROKES,
  type Align,
  type Dash,
  type Head,
  paletteToken,
  type Kind,
  type Style,
  type Tool,
} from "@/lib/whiteboard/model";
import { Icon, type IconName } from "./icons";
import { colour, CSS_PALETTE } from "@/lib/whiteboard/geometry";
import styles from "./whiteboard.module.css";

const NAMES: Record<string, string> = {
  ink: "Ink",
  none: "No fill",
  paper: "Paper",
  red: "Red",
  green: "Green",
  blue: "Blue",
  orange: "Orange",
  purple: "Purple",
  teal: "Teal",
  grey: "Grey",
  "red-soft": "Pink",
  "green-soft": "Mint",
  "blue-soft": "Sky",
  "yellow-soft": "Butter",
  "purple-soft": "Lilac",
  "teal-soft": "Aqua",
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
      aria-label={`${label}: ${NAMES[paletteToken(value)] ?? value}`}
      title={NAMES[paletteToken(value)] ?? value}
      style={{
        ["--swatch" as string]: colour(value, CSS_PALETTE),
      }}
      onClick={onPick}
    />
  );
}

const HEADS: { value: Head; label: string }[] = [
  { value: "none", label: "None" },
  { value: "arrow", label: "Arrow" },
  { value: "triangle", label: "Solid" },
  { value: "dot", label: "Dot" },
  { value: "bar", label: "Bar" },
];

const ALIGNS: { how: Align; icon: IconName; label: string }[] = [
  { how: "left", icon: "alignLeft", label: "Align left" },
  { how: "centre", icon: "alignCentre", label: "Align centres" },
  { how: "right", icon: "alignRight", label: "Align right" },
  { how: "top", icon: "alignTop", label: "Align top" },
  { how: "middle", icon: "alignMiddle", label: "Align middles" },
  { how: "bottom", icon: "alignBottom", label: "Align bottom" },
];

export function StylePanel({
  style,
  kinds,
  count,
  locked,
  grouped,
  onStyle,
  onLayer,
  onAlign,
  onDistribute,
  onGroup,
  onLock,
  onDuplicate,
  onDelete,
  onClose,
}: {
  onClose: () => void;
  style: Style;
  kinds: (Kind | Tool)[];
  count: number;
  locked: boolean;
  grouped: boolean;
  onStyle: (patch: Partial<Style>) => void;
  onLayer: (to: "front" | "back" | "forward" | "backward") => void;
  onAlign: (how: Align) => void;
  onDistribute: (axis: "x" | "y") => void;
  onGroup: (on: boolean) => void;
  onLock: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const fillable = kinds.some((k) => isBoxKind(k) || k === "sticky");
  const hasText = kinds.some((k) => k === "text" || k === "sticky" || isBoxKind(k));
  const stroked = kinds.some((k) => k !== "image" && k !== "sticky" && k !== "highlighter");
  const linear = kinds.some((k) => k === "line" || k === "arrow");
  const arrowDefault = kinds.every((k) => k === "arrow");
  const startHead = style.startHead ?? "none";
  const endHead = style.endHead ?? (arrowDefault ? "arrow" : "none");

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
      {linear && (
        <fieldset className={styles.group}>
          <legend>Ends</legend>
          <div className={styles.headRow}>
            <label>
              <span>Start</span>
              <select value={startHead} onChange={(e) => onStyle({ startHead: e.target.value as Head })}>
                {HEADS.map((h) => (
                  <option key={h.value} value={h.value}>
                    {h.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>End</span>
              <select value={endHead} onChange={(e) => onStyle({ endHead: e.target.value as Head })}>
                {HEADS.map((h) => (
                  <option key={h.value} value={h.value}>
                    {h.label}
                  </option>
                ))}
              </select>
            </label>
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
      {count > 1 && (
        <fieldset className={styles.group}>
          <legend>Align</legend>
          <div className={styles.iconRow}>
            {ALIGNS.map((a) => (
              <button key={a.how} type="button" aria-label={a.label} title={a.label} onClick={() => onAlign(a.how)}>
                <Icon name={a.icon} />
              </button>
            ))}
            <button
              type="button"
              aria-label="Space out horizontally"
              title="Space out horizontally (3 or more)"
              disabled={count < 3}
              onClick={() => onDistribute("x")}
            >
              <Icon name="spreadX" />
            </button>
            <button
              type="button"
              aria-label="Space out vertically"
              title="Space out vertically (3 or more)"
              disabled={count < 3}
              onClick={() => onDistribute("y")}
            >
              <Icon name="spreadY" />
            </button>
          </div>
        </fieldset>
      )}
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
            {count > 1 && !grouped && (
              <button type="button" title="Group — ⌘/Ctrl G" onClick={() => onGroup(true)}>
                Group
              </button>
            )}
            {grouped && (
              <button type="button" title="Ungroup — ⌘/Ctrl ⇧ G" onClick={() => onGroup(false)}>
                Ungroup
              </button>
            )}
            <button type="button" title="Lock or unlock — ⌘/Ctrl ⇧ L" onClick={onLock} aria-pressed={locked}>
              {locked ? "Unlock" : "Lock"}
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
