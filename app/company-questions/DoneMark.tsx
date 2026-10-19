"use client";

import { useDoneIds } from "@/lib/companyQuestionsProgress";
import styles from "./company.module.css";

export function DoneMark({ id, exercise }: { id: string; exercise?: string }) {
  const done = useDoneIds([{ id, exercise }]).has(id);
  if (!done) return null;
  return (
    <span className={styles.done} title="Practised or solved">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12.500l4.500 4.500L19 7.5" />
      </svg>
      <span className={styles.visuallyHidden}>Practised</span>
    </span>
  );
}

export function CompanyRing({ items }: { items: { id: string; exercise?: string }[] }) {
  const done = useDoneIds(items).size;
  const total = items.length;
  const share = total === 0 ? 0 : done / total;
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className={styles.ring} role="img" aria-label={`${done} of ${total} practised`}>
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r={radius} className={styles.ringTrack} />
        <circle
          cx="32"
          cy="32"
          r={radius}
          className={styles.ringFill}
          strokeDasharray={`${circumference * share} ${circumference}`}
          transform="rotate(-90 32 32)"
        />
      </svg>
      <b>
        {done}/{total}
      </b>
      <span>practised</span>
    </div>
  );
}

export function CardProgress({ items }: { items: { id: string; exercise?: string }[] }) {
  const done = useDoneIds(items).size;
  if (items.length === 0) return <span className={styles.cardProgress}>No answers yet</span>;
  return (
    <span className={styles.cardProgress} data-started={done > 0 ? "" : undefined}>
      <i style={{ width: `${(done / items.length) * 100}%` }} aria-hidden="true" />
      {done}/{items.length} done
    </span>
  );
}
