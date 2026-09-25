"use client";

import { useFontChoice, useThemeChoice } from "@/components/ThemeFontPicker";
import { FONT_ITEMS, THEME_ITEMS, type FontValue, type ThemeValue } from "@/lib/storage";
import styles from "./AppearancePicker.module.css";

const THEME_COLOURS: Record<ThemeValue, [string, string, string]> = {
  light: ["#fffdf6", "#1f3a73", "#1f7a55"],
  dark: ["#191d25", "#d9e5fb", "#64dfa6"],
  kraft: ["#ecdfc0", "#3b2a14", "#2f6b4a"],
  blueprint: ["#1c3c5e", "#eaf4ff", "#7fe0b8"],
  sepia: ["#faf1dc", "#4a3221", "#4c7a52"],
  forest: ["#f8fbf2", "#2c4a24", "#2f7d4f"],
  rose: ["#241823", "#f7dbe8", "#7fe0b8"],
  mono: ["#ffffff", "#111111", "#276b38"],
  lavender: ["#faf7fe", "#402a63", "#2f8a6f"],
};

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
      {THEME_ITEMS.map((t) => {
        const [sheet, ink, accent] = THEME_COLOURS[t.value];
        return (
          <button
            key={t.value}
            type="button"
            role="radio"
            aria-checked={theme === t.value}
            className={styles.opt}
            onClick={() => chooseTheme(t.value)}
          >
            <span className={styles.swatch} style={{ background: sheet }} aria-hidden="true">
              <span style={{ background: ink }} />
              <span style={{ background: accent }} />
            </span>
            <span>{plain(t.label)}</span>
          </button>
        );
      })}
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
