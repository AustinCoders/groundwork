import Link from "next/link";
import type { SeriesCard } from "./types";
import styles from "@/components/series/landing.module.css";

export function ChapterCard({ chapter, href, read }: { chapter: SeriesCard<string>; href: string; read: boolean }) {
  return (
    <li>
      <Link className={styles.card} href={href}>
        <span className={styles.cardTop}>
          <span className={styles.cardNum}>{chapter.num}</span>
          <span className={styles.cardMin}>{chapter.minutes} min</span>
          {read && (
            <span className={styles.cardDone} aria-label="read">
              ✓
            </span>
          )}
        </span>
        <span className={styles.cardTitle}>{chapter.title}</span>
        {chapter.subtitle && <span className={styles.cardSub}>{chapter.subtitle}</span>}
      </Link>
    </li>
  );
}
