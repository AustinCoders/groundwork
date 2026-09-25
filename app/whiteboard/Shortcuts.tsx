"use client";

import { useEffect, useRef } from "react";
import styles from "./whiteboard.module.css";

const GROUPS: { title: string; rows: [string, string][] }[] = [
  {
    title: "Tools",
    rows: [
      ["V", "Select"],
      ["H or Space + drag", "Pan"],
      ["P", "Pen"],
      ["M", "Highlighter"],
      ["K", "Laser pointer"],
      ["L / A", "Line / arrow"],
      ["R / O / D", "Rectangle / ellipse / diamond"],
      ["S", "More shapes (last used)"],
      ["T / N", "Text / sticky note"],
      ["E", "Eraser"],
      ["I", "Insert an image"],
    ],
  },
  {
    title: "Edit",
    rows: [
      ["⌘/Ctrl Z", "Undo"],
      ["⌘/Ctrl ⇧ Z or Y", "Redo"],
      ["⌘/Ctrl C / X / V", "Copy / cut / paste"],
      ["⌘/Ctrl D", "Duplicate"],
      ["⌘/Ctrl A", "Select all"],
      ["⌘/Ctrl G", "Group"],
      ["⌘/Ctrl ⇧ G", "Ungroup"],
      ["⌘/Ctrl ⇧ L", "Lock or unlock"],
      ["⌘/Ctrl ⇧ C", "Copy as PNG"],
      ["Delete", "Delete"],
      ["Enter", "Edit text"],
      ["Arrows (⇧ for 10)", "Nudge"],
      ["[ ]  (⇧ for all the way)", "Send back / bring forward"],
    ],
  },
  {
    title: "View",
    rows: [
      ["⌘/Ctrl + / −", "Zoom in / out"],
      ["⌘/Ctrl 0", "Reset zoom"],
      ["⇧ 1", "Fit everything"],
      ["⇧ 2", "Zoom to selection"],
      ["G", "Snap to the page"],
      ["F", "Full screen"],
      ["?", "This list"],
    ],
  },
];

export function Shortcuts({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      className={styles.help}
      aria-labelledby="wb-help-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className={styles.helpHead}>
        <h2 id="wb-help-title">Keyboard shortcuts</h2>
        <button type="button" className={styles.panelClose} aria-label="Close" onClick={onClose}>
          ×
        </button>
      </div>
      <div className={styles.helpBody}>
        {GROUPS.map((g) => (
          <section key={g.title}>
            <h3>{g.title}</h3>
            <dl>
              {g.rows.map(([k, v]) => (
                <div key={v}>
                  <dt>
                    <kbd>{k}</kbd>
                  </dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </dialog>
  );
}
