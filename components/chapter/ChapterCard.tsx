import Link from "next/link";
import type { SeriesCard } from "./types";
import { plural } from "@/lib/format";
import styles from "@/components/series/landing.module.css";

export function ChapterCard({
  chapter,
  href,
  read,
  exercises,
  onToggleRead,
}: {
  chapter: SeriesCard<string>;
  href: string;
  read: boolean;
  exercises?: number;
  onToggleRead?: () => void;
}) {
  const name = chapter.short || chapter.title;
  const minLabel = exercises ? `${chapter.minutes} min · ${plural(exercises, "exercise")}` : `${chapter.minutes} min`;

  return (
    <li className={onToggleRead ? styles.cardRow : undefined}>
      <Link className={styles.card} href={href}>
        <span className={styles.cardTop}>
          <span className={styles.cardNum}>{chapter.num}</span>
          <span className={styles.cardMin}>{minLabel}</span>
          {read && (
            <span className={styles.cardDone} aria-label="read">
              ✓
            </span>
          )}
        </span>
        <span className={styles.cardTitle}>{chapter.title}</span>
        {chapter.subtitle && <span className={styles.cardSub}>{chapter.subtitle}</span>}
      </Link>
      {onToggleRead && (
        <button
          type="button"
          className={styles.cardTick}
          aria-pressed={read}
          aria-label={read ? `Mark ${name} unread` : `Mark ${name} read`}
          title={read ? `Mark ${name} unread` : `Mark ${name} read`}
          onClick={onToggleRead}
        >
          ✓
        </button>
      )}
    </li>
  );
}
