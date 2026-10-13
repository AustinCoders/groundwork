import type { ReactNode } from "react";
import styles from "./shell.module.css";

export function Fold({
  id,
  summaryId,
  open,
  variant,
  name,
  aside,
  hint,
  children,
}: {
  id: string;
  summaryId?: string;
  open?: boolean;
  variant: "level" | "panel";
  name: ReactNode;
  aside?: ReactNode;
  hint?: string | null;
  children: ReactNode;
}) {
  return (
    <details className={styles.fold} data-variant={variant} id={id} open={open}>
      <summary className={styles.foldSummary} id={summaryId}>
        <span className={styles.chevron} aria-hidden="true" />
        <span className={styles.foldName}>{name}</span>
        {aside}
        {hint && <span className={styles.foldHint}>{hint}</span>}
      </summary>
      <div className={styles.foldBody}>{children}</div>
    </details>
  );
}
