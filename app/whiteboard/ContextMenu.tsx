"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./whiteboard.module.css";

export interface MenuItem {
  label: string;
  keys?: string;
  danger?: boolean;
  disabled?: boolean;
  run: () => void;
}

export function ContextMenu({
  x,
  y,
  items,
  onClose,
}: {
  x: number;
  y: number;
  items: (MenuItem | "sep")[];
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x, y });

  useLayoutEffect(() => {
    const el = ref.current;
    const parent = el?.offsetParent as HTMLElement | null;
    if (!el || !parent) return;
    const nx = Math.max(4, Math.min(x, parent.clientWidth - el.offsetWidth - 4));
    const ny = Math.max(4, Math.min(y, parent.clientHeight - el.offsetHeight - 4));
    if (nx !== x || ny !== y) setPos({ x: nx, y: ny });
    el.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
  }, [x, y]);

  useEffect(() => {
    function onDown(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const buttons = [...(ref.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? [])];
        const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
        const next = buttons[(i + (e.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length];
        next?.focus();
      }
    }
    window.addEventListener("pointerdown", onDown, true);
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("blur", onClose);
    return () => {
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("blur", onClose);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className={styles.ctx}
      role="menu"
      aria-label="Board actions"
      style={{ left: pos.x, top: pos.y }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item, i) =>
        item === "sep" ? (
          <hr key={i} className={styles.ctxSep} />
        ) : (
          <button
            key={item.label}
            type="button"
            role="menuitem"
            className={item.danger ? styles.danger : undefined}
            disabled={item.disabled}
            onClick={() => {
              onClose();
              item.run();
            }}
          >
            <span>{item.label}</span>
            {item.keys && <kbd>{item.keys}</kbd>}
          </button>
        )
      )}
    </div>
  );
}
