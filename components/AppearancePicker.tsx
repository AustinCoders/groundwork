"use client";

import { useFontChoice, useThemeChoice } from "@/components/ThemeFontPicker";
import { FONT_ITEMS, THEME_ITEMS, type FontValue } from "@/lib/storage";
import styles from "./AppearancePicker.module.css";

const FONT_FAMILIES: Record<FontValue, string> = {
  classic: "var(--font-caveat), cursive",
  marker: "var(--font-patrick-hand), cursive",
  sketch: "var(--font-architects-daughter), cursive",
  pen: "var(--font-gochi-hand), cursive",
  script: "var(--font-dancing-script), cursive",
  serif: "var(--font-literata), Georgia, serif",
  roboto: "var(--font-roboto), system-ui, sans-serif",
};

const plain = (label: string) => label.replace(/^\S+\s/, "");

export function AppearancePicker({
  idPrefix,
  headingClass,
  only,
}: {
  idPrefix: string;
  headingClass?: string;
  only?: "theme" | "font";
}) {
  const [theme, chooseTheme] = useThemeChoice();
  const [font, chooseFont] = useFontChoice();
  const heading = headingClass ?? styles.heading;
  const themes = (
    <div className={styles.themeGrid} role="radiogroup" aria-label="Theme">
      {THEME_ITEMS.map((t) => (
        <button
          key={t.value}
          type="button"
          role="radio"
          aria-checked={theme === t.value}
          className={styles.opt}
          onClick={() => chooseTheme(t.value)}
        >
          <span className={styles.swatch} data-theme={t.value} aria-hidden="true">
            <span className={styles.swatchInk} />
            <span className={styles.swatchDots}>
              {["red", "orange", "yellow", "green", "blue", "purple"].map((c) => (
                <span key={c} style={{ background: `var(--c-${c})` }} />
              ))}
            </span>
          </span>
          <span>{plain(t.label)}</span>
        </button>
      ))}
    </div>
  );
  const fonts = (
    <div className={styles.fontGrid} role="radiogroup" aria-label="Handwriting">
      {FONT_ITEMS.map((f) => (
        <button
          key={f.value}
          type="button"
          role="radio"
          aria-checked={font === f.value}
          className={styles.opt}
          onClick={() => chooseFont(f.value)}
        >
          <span className={styles.sample} style={{ fontFamily: FONT_FAMILIES[f.value] }} aria-hidden="true">
            Aa
          </span>
          <span>{plain(f.label)}</span>
        </button>
      ))}
    </div>
  );
  if (only === "theme") return themes;
  if (only === "font") return fonts;
  return (
    <>
      <h2 id={`${idPrefix}-theme`} className={heading}>
        Theme
      </h2>
      {themes}
      <h2 id={`${idPrefix}-font`} className={heading}>
        Handwriting
      </h2>
      {fonts}
    </>
  );
}
