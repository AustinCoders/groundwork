"use client";

import dynamic from "next/dynamic";

// Same lazy-load reasoning as Shell.tsx's mobile drawer trap — dead weight
// on every playground load until someone actually opens the cheatsheet.
const FocusScope = dynamic(() => import("@radix-ui/react-focus-scope").then((m) => m.FocusScope));

const SHORTCUTS: { keys: string; desc: string }[] = [
  { keys: "⌘/Ctrl + Enter", desc: "Run the code" },
  { keys: "⌘/Ctrl + S", desc: "Save" },
  { keys: "⌘/Ctrl + /", desc: "Toggle line comment" },
  { keys: "⌘/Ctrl + F", desc: "Find / replace" },
  { keys: "⌘/Ctrl + D", desc: "Select next occurrence" },
  { keys: "Alt + click", desc: "Multi-cursor" },
  { keys: "Tab / ⇧Tab", desc: "Indent / outdent" },
  { keys: "Esc", desc: "Exit fullscreen" },
  { keys: "?", desc: "Show this cheatsheet" },
];

/** Opened by the toolbar's ⌨ button or the "?" key (outside the editor
 * itself, so it doesn't hijack a literal "?" typed into code). */
export function ShortcutHelp({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <FocusScope asChild trapped loop>
      <div className="shortcut-help" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
        <button className="shortcut-help__backdrop" type="button" onClick={onClose} aria-label="Close" />
        <div className="shortcut-help__panel">
          <div className="shortcut-help__head">
            <h2>Keyboard shortcuts</h2>
            <button className="btn btn--icon" type="button" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
          <dl className="shortcut-help__list">
            {SHORTCUTS.map((s) => (
              <div className="shortcut-help__row" key={s.keys}>
                <dt>
                  <kbd>{s.keys}</kbd>
                </dt>
                <dd>{s.desc}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </FocusScope>
  );
}
