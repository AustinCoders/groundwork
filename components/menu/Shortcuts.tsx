"use client";

import { Fold } from "@/components/menu/Fold";
import { useClientValue } from "@/lib/hooks";
import { menuShortcutLabel } from "@/lib/menuShortcut";
import styles from "../SiteDrawer.module.css";

export function useShortcutLabel(): string {
  return useClientValue(() => menuShortcutLabel(navigator.platform), "Ctrl K");
}

export function Shortcuts({
  reading,
  open,
  onToggle,
}: {
  reading: boolean;
  open: boolean;
  onToggle: (id: string, open: boolean) => void;
}) {
  const label = useShortcutLabel();
  const rows: { keys: string[]; does: string }[] = [
    { keys: [label], does: "Open this menu and search, from any page" },
    { keys: ["Esc"], does: "Close the menu" },
    ...(reading
      ? [
          { keys: ["/"], does: "Search inside this topic" },
          { keys: ["["], does: "Previous chapter" },
          { keys: ["]"], does: "Next chapter" },
          { keys: ["t"], does: "Back to the top" },
        ]
      : []),
  ];
  return (
    <div className={styles.folds}>
      <Fold id="shortcuts" icon="shortcuts" title="Keyboard shortcuts" open={open} onToggle={onToggle}>
        <dl className={styles.keys}>
          {rows.map((row) => (
            <div key={row.does}>
              <dt>
                {row.keys.map((key) => (
                  <kbd key={key}>{key}</kbd>
                ))}
              </dt>
              <dd>{row.does}</dd>
            </div>
          ))}
        </dl>
        <p className={styles.note}>Shortcuts step aside while you type in a field or the editor.</p>
      </Fold>
    </div>
  );
}
