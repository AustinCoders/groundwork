import Link from "next/link";
import type { SeriesCard } from "./types";
import { openCheckOnClick } from "@/lib/checkOpen";
import { plural } from "@/lib/format";
import styles from "@/components/series/landing.module.css";

export function ChapterCard({
  chapter,
  href,
  read,
  exercises,
  onToggleRead,
  tickHref,
}: {
  chapter: SeriesCard<string>;
  href: string;
  read: boolean;
  exercises?: number;
  onToggleRead?: () => void;
  tickHref?: string | null;
}) {
  const name = chapter.short || chapter.title;
  const minLabel = exercises ? `${chapter.minutes} min · ${plural(exercises, "exercise")}` : `${chapter.minutes} min`;
  const tickLabel = read ? `Mark ${name} unread` : `Mark ${name} read`;

  return (
    <li className={onToggleRead || tickHref ? styles.cardRow : undefined}>
      <Link className={styles.card} href={href} prefetch={false}>
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
      {tickHref ? (
        <Link
          className={styles.cardTick}
          href={tickHref}
          prefetch={false}
          aria-label={tickLabel}
          title={tickLabel}
          onClick={openCheckOnClick}
        >
          ✓
        </Link>
      ) : (
        onToggleRead && (
          <button
            type="button"
            className={styles.cardTick}
            aria-pressed={read}
            aria-label={tickLabel}
            title={tickLabel}
            onClick={onToggleRead}
          >
            ✓
          </button>
        )
      )}
    </li>
  );
}
