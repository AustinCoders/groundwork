"use client";

import { useRef } from "react";
import { useFontChoice, useThemeChoice } from "@/components/ThemeFontPicker";
import { FONT_FAMILIES } from "@/components/AppearancePicker";
import { Fold } from "@/components/menu/Fold";
import { Shortcuts } from "@/components/menu/Shortcuts";
import { NarrationSettings } from "@/components/reader/NarrationSettings";
import { EyebrowToggle } from "@/components/ui/MenuKit";
import { ZOOM_STEPS, useReaderZoom } from "@/lib/readerZoom";
import { FONT_ITEMS, THEME_ITEMS, type FontValue, type ThemeValue } from "@/lib/storage";
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

function ThemeSwatches({ theme, onChoose }: { theme: ThemeValue; onChoose: (next: ThemeValue) => void }) {
  return (
    <Choice
      label="Theme"
      className={styles.swatches}
      values={THEME_ITEMS.map((t) => t.value)}
      value={theme}
      onChange={onChoose}
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

function FontTiles({ font, onChoose }: { font: FontValue; onChoose: (next: FontValue) => void }) {
  return (
    <Choice
      label="Handwriting"
      className={styles.fonts}
      values={FONT_ITEMS.map((f) => f.value)}
      value={font}
      onChange={onChoose}
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

export function Appearance({
  reading,
  open,
  onToggle,
}: {
  reading: boolean;
  open: Set<string>;
  onToggle: (id: string, open: boolean) => void;
}) {
  const [theme, chooseTheme] = useThemeChoice();
  const [font, chooseFont] = useFontChoice();
  const expanded = open.has("appearance");
  const summary = `${plain(THEME_ITEMS.find((t) => t.value === theme)?.label ?? theme)} · ${plain(FONT_ITEMS.find((f) => f.value === font)?.label ?? font)}`;

  return (
    <section className={styles.block}>
      <EyebrowToggle
        no="04"
        summary={summary}
        open={expanded}
        controls="menu-appearance"
        onToggle={() => onToggle("appearance", !expanded)}
      >
        Appearance
      </EyebrowToggle>
      <div className={styles.foldPanel} data-open={expanded || undefined}>
        <div className={styles.foldInner} id="menu-appearance" role="region" aria-label="Appearance" inert={!expanded}>
          <div className={styles.appearanceBody}>
            <div className={styles.setting}>
              <p className={styles.settingLabel}>Theme</p>
              <ThemeSwatches theme={theme} onChoose={chooseTheme} />
            </div>
            <div className={styles.setting}>
              <p className={styles.settingLabel}>Handwriting</p>
              <FontTiles font={font} onChoose={chooseFont} />
            </div>
            {reading && (
              <>
                <div className={styles.setting}>
                  <TextSize />
                </div>
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
                  </Fold>
                  <Shortcuts open={open.has("shortcuts")} onToggle={onToggle} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
