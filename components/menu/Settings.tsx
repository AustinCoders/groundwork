"use client";

import { useRef } from "react";
import { useFontChoice, useThemeChoice } from "@/components/ThemeFontPicker";
import { FONT_FAMILIES } from "@/components/AppearancePicker";
import { Eyebrow } from "@/components/menu/Eyebrow";
import { Fold } from "@/components/menu/Fold";
import { NarrationSettings } from "@/components/reader/NarrationSettings";
import { ZOOM_STEPS, useReaderZoom } from "@/lib/readerZoom";
import { FONT_ITEMS, THEME_ITEMS } from "@/lib/storage";
import styles from "../SiteDrawer.module.css";

const plain = (label: string) => label.replace(/^\S+\s/, "");

const STEPS: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

function Choice<T extends string>({
  label,
  className,
  values,
  value,
  onChange,
  children,
}: {
  label: string;
  className: string;
  values: readonly T[];
  value: T;
  onChange: (next: T) => void;
  children: (value: T, checked: boolean) => React.ReactNode;
}) {
  const group = useRef<HTMLDivElement>(null);

  function onKeyDown(e: React.KeyboardEvent) {
    const step = STEPS[e.key];
    if (!step) return;
    e.preventDefault();
    const at = values.indexOf(value);
    onChange(values[(at + step + values.length) % values.length]);
    requestAnimationFrame(() => group.current?.querySelector<HTMLElement>("[aria-checked=true]")?.focus());
  }

  return (
    <div ref={group} className={className} role="radiogroup" aria-label={label} onKeyDown={onKeyDown}>
      {values.map((v) => {
        const checked = v === value;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            className={styles.choice}
            onClick={() => onChange(v)}
          >
            {children(v, checked)}
          </button>
        );
      })}
    </div>
  );
}

export function ThemeSwatches() {
  const [theme, choose] = useThemeChoice();
  return (
    <Choice
      label="Theme"
      className={styles.swatches}
      values={THEME_ITEMS.map((t) => t.value)}
      value={theme}
      onChange={choose}
    >
      {(value, checked) => (
        <>
          <span className={styles.swatch} data-theme={value} aria-hidden="true">
            <span className={styles.swatchLine}>
              <span className={styles.swatchInk} />
              <span className={styles.swatchPrimary} />
            </span>
            <span className={styles.swatchDots}>
              {["red", "orange", "yellow", "green", "blue", "purple"].map((c) => (
                <span key={c} style={{ background: `var(--c-${c})` }} />
              ))}
            </span>
          </span>
          <span className={styles.choiceName}>
            {plain(THEME_ITEMS.find((t) => t.value === value)?.label ?? value)}
            {checked && (
              <span className={styles.check} aria-hidden="true">
                {" "}
                ✓
              </span>
            )}
          </span>
        </>
      )}
    </Choice>
  );
}

export function FontChoice() {
  const [font, choose] = useFontChoice();
  return (
    <Choice
      label="Handwriting"
      className={styles.fonts}
      values={FONT_ITEMS.map((f) => f.value)}
      value={font}
      onChange={choose}
    >
      {(value) => (
        <>
          <span className={styles.sample} style={{ fontFamily: FONT_FAMILIES[value] }} aria-hidden="true">
            Aa
          </span>
          <span className={styles.choiceName}>{plain(FONT_ITEMS.find((f) => f.value === value)?.label ?? value)}</span>
        </>
      )}
    </Choice>
  );
}

function TextSize() {
  const [zoom, stepZoom] = useReaderZoom();
  return (
    <div className={styles.sizeRow} role="group" aria-label="Text size">
      <span className={styles.rowLabel}>Text size</span>
      <div className={styles.stepper}>
        <button type="button" aria-label="Smaller text" disabled={zoom === 0} onClick={() => stepZoom(-1)}>
          A−
        </button>
        <output aria-live="polite">{ZOOM_STEPS[zoom]}%</output>
        <button
          type="button"
          aria-label="Larger text"
          disabled={zoom === ZOOM_STEPS.length - 1}
          onClick={() => stepZoom(1)}
        >
          A+
        </button>
      </div>
    </div>
  );
}

export function Settings({
  reading,
  open,
  onToggle,
}: {
  reading: boolean;
  open: Set<string>;
  onToggle: (id: string, open: boolean) => void;
}) {
  return (
    <section className={styles.block} aria-labelledby="menu-settings">
      <Eyebrow no="05">Look and feel</Eyebrow>
      <h2 className={styles.h2} id="menu-settings">
        Make it yours.
      </h2>
      <div className={styles.setting}>
        <p className={styles.settingLabel}>Theme</p>
        <ThemeSwatches />
      </div>
      <div className={styles.setting}>
        <p className={styles.settingLabel}>Handwriting</p>
        <FontChoice />
      </div>
      {reading && (
        <div className={styles.setting}>
          <TextSize />
          <p className={styles.note}>Changes the size of chapter text across the site.</p>
        </div>
      )}
      {reading && (
        <div className={styles.folds}>
          <Fold
            id="narrator"
            icon="narrator"
            title="Narrator"
            summary="Listen"
            open={open.has("narrator")}
            onToggle={onToggle}
          >
            <div className={styles.narrator}>
              <NarrationSettings />
            </div>
            <p className={styles.note}>Used by the Listen button on every chapter.</p>
          </Fold>
        </div>
      )}
    </section>
  );
}
