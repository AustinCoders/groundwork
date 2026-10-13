import type { ReactNode } from "react";
import styles from "./shell.module.css";

export function Fold({
  id,
  summaryId,
  name,
  hint,
  children,
}: {
  id: string;
  summaryId?: string;
  name: ReactNode;
  hint?: string | null;
  children: ReactNode;
}) {
  return (
    <details className={styles.fold} id={id}>
      <summary className={styles.foldSummary} id={summaryId}>
        <span className={styles.chevron} aria-hidden="true" />
        <span className={styles.foldName}>{name}</span>
        {hint && <span className={styles.foldHint}>{hint}</span>}
      </summary>
      <div className={styles.foldBody}>{children}</div>
    </details>
  );
}
