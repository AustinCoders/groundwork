"use client";

import { MenuIcon, type MenuIconName } from "@/components/menu/MenuIcon";
import { kit } from "@/components/ui/MenuKit";
import styles from "../SiteDrawer.module.css";

export function Fold({
  id,
  icon,
  title,
  summary,
  open,
  onToggle,
  children,
}: {
  id: string;
  icon: MenuIconName;
  title: string;
  summary?: string;
  open: boolean;
  onToggle: (id: string, open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.fold} data-open={open || undefined}>
      <h3 className={styles.foldH}>
        <button
          type="button"
          className={styles.foldHead}
          aria-expanded={open}
          aria-controls={`fold-${id}`}
          onClick={() => onToggle(id, !open)}
        >
          <span className={styles.rowIcon} aria-hidden="true">
            <MenuIcon name={icon} size={20} />
          </span>
          <span className={kit.title}>{title}</span>
          {summary && (
            <span className={kit.meta} aria-hidden="true">
              {summary}
            </span>
          )}
          <span className={kit.chevron} aria-hidden="true" />
        </button>
      </h3>
      <div className={styles.foldPanel} id={`fold-${id}`} role="region" aria-label={title} inert={!open}>
        <div className={styles.foldInner}>
          <div className={styles.foldBody}>{children}</div>
        </div>
      </div>
    </div>
  );
}
