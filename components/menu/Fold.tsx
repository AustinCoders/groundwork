"use client";

import { MenuIcon, type MenuIconName } from "@/components/menu/MenuIcon";
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
          <span className={styles.foldIcon} aria-hidden="true">
            <MenuIcon name={icon} size={17} />
          </span>
          <span className={styles.foldTitle}>{title}</span>
          {summary && <span className={styles.foldSummary}>{summary}</span>}
          <span className={styles.chevron} aria-hidden="true" />
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
