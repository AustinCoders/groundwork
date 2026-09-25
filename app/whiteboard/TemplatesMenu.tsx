"use client";

import { useEffect, useRef, useState } from "react";
import { TEMPLATES, type Template } from "@/lib/whiteboard/templates";
import { Icon } from "./icons";
import styles from "./whiteboard.module.css";

export function TemplatesMenu({ onPick }: { onPick: (t: Template) => void }) {
  const [open, setOpen] = useState(false);
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

  return (
    <div className={styles.popWrap} ref={wrap}>
      <button
        type="button"
        className={styles.islandBtn}
        aria-label="Templates"
        aria-expanded={open}
        aria-haspopup="menu"
        title="Start from a template"
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name="templates" />
      </button>
      {open && (
        <div className={styles.templatesPop} role="menu" aria-label="Templates">
          <p className={styles.menuH}>Templates</p>
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="menuitem"
              className={styles.templateItem}
              onClick={() => {
                setOpen(false);
                onPick(t);
              }}
            >
              <strong>{t.label}</strong>
              <span>{t.hint}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
