"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { AppearancePicker, FONT_FAMILIES } from "@/components/AppearancePicker";
import { FocusTrap } from "@/components/FocusTrap";
import { useFontChoice, useThemeChoice } from "@/components/ThemeFontPicker";
import { FONT_ITEMS, THEME_ITEMS, type FontValue, type ThemeValue } from "@/lib/storage";
import styles from "./tour.module.css";

const BODY_FAMILIES: Record<FontValue, string> = {
  classic: "var(--font-kalam), cursive",
  marker: "var(--font-shadows-into-light), cursive",
  sketch: "var(--font-reenie-beanie), cursive",
  pen: "var(--font-neucha), cursive",
  chalk: "var(--font-indie-flower), cursive",
  script: "var(--font-handlee), cursive",
  serif: "var(--font-literata), Georgia, serif",
  roboto: "var(--font-roboto), system-ui, sans-serif",
};

const plain = (label: string) => label.replace(/^\S+\s/, "");

function themeName(value: ThemeValue): string {
  return plain(THEME_ITEMS.find((item) => item.value === value)?.label ?? value);
}

function fontName(value: FontValue): string {
  return plain(FONT_ITEMS.find((item) => item.value === value)?.label ?? value);
}

export function LookDialog({ onClose }: { onClose: () => void }) {
  const titleId = useId();
  const done = useRef<HTMLButtonElement>(null);
  const [theme] = useThemeChoice();
  const [font] = useFontChoice();
  const [hoverTheme, setHoverTheme] = useState<ThemeValue | null>(null);
  const [hoverFont, setHoverFont] = useState<FontValue | null>(null);
  const shownTheme = hoverTheme ?? theme;
  const shownFont = hoverFont ?? font;
  const trying = hoverTheme !== null || hoverFont !== null;

  useEffect(() => {
    const opener = document.activeElement;
    done.current?.focus({ preventScroll: true });
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      onClose();
    }
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = overflow;
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus({ preventScroll: true });
    };
  }, [onClose]);

  const previewFonts = {
    "--font-heading": FONT_FAMILIES[shownFont],
    "--font-body": BODY_FAMILIES[shownFont],
  } as CSSProperties;

  return createPortal(
    <div className={styles.root}>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <FocusTrap>
        <div
          className={`${styles.dialog} ${styles.lookDialog}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <header className={styles.head}>
            <p className={styles.headTitle} id={titleId}>
              Make it yours
            </p>
            <button type="button" className={styles.skip} onClick={onClose}>
              Close
            </button>
          </header>
          <div className={`${styles.body} ${styles.lookBody}`}>
            <div className={styles.lookPicker}>
              <AppearancePicker
                idPrefix="look"
                headingClass={styles.lookHeading}
                onPreviewTheme={setHoverTheme}
                onPreviewFont={setHoverFont}
              />
            </div>
            <div className={styles.lookSide}>
              <div className={styles.preview} data-theme={shownTheme} style={previewFonts} aria-hidden="true">
                <span className={styles.previewTape} />
                <p className={styles.previewKicker}>JavaScript · Beginner · B13</p>
                <p className={styles.previewTitle}>A closure is a function plus the scope it was born in.</p>
                <p className={styles.previewText}>
                  Each call to counter() makes a fresh n, and the function it returns keeps that n alive.
                </p>
                <div className={`${styles.code} ${styles.previewCode}`}>
                  {"function counter() {\n  let n = 0;\n  return () => ++n;\n}"}
                </div>
                <div className={styles.previewRow}>
                  <span className={styles.previewButton}>Run tests</span>
                  <span className={styles.previewSticky}>+25 XP</span>
                </div>
              </div>
              <p className={styles.previewCaption} role="status" aria-live="polite">
                {trying ? "Trying " : "Your look: "}
                <b>{themeName(shownTheme)}</b> with <b>{fontName(shownFont)}</b> handwriting
                {trying ? ". Click to keep it." : "."}
              </p>
            </div>
          </div>
          <footer className={styles.foot}>
            <p className={styles.lookNote}>Change it any time from the Menu, under Appearance.</p>
            <button type="button" className={styles.primary} ref={done} onClick={onClose}>
              Done
            </button>
          </footer>
        </div>
      </FocusTrap>
    </div>,
    document.body
  );
}
