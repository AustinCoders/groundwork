import { REVIEW_GAPS_DAYS } from "@/lib/storage";
import styles from "./stageDots.module.css";

export function StageDots({ reviews }: { reviews: number }) {
  return (
    <span className={styles.dots} role="img" aria-label={`Review ${reviews + 1} of ${REVIEW_GAPS_DAYS.length}`}>
      {REVIEW_GAPS_DAYS.map((days, k) => (
        <i key={days} data-on={k < reviews || undefined} data-now={k === reviews || undefined} />
      ))}
    </span>
  );
}
