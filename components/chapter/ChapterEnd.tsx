"use client";

import styles from "@/components/series/chapter.module.css";

export function ChapterEnd({
  num,
  read,
  readCount,
  total,
  onToggleRead,
  reviewDays,
  tickHref,
}: {
  num: string;
  read: boolean;
  readCount: number;
  total: number;
  onToggleRead: () => void;
  reviewDays?: number;
  tickHref?: string | null;
}) {
  return (
    <section className={`${styles.end}${read ? ` ${styles.endDone}` : ""}`} aria-label="Finish" data-speech-exclude>
      <div className={styles.endStatus}>
        <span className={styles.endMark} aria-hidden="true">
          {read ? "✓" : num}
        </span>
        <div>
          <p className={styles.endTitle}>{read ? "Chapter read" : "Finished reading?"}</p>
          {read && reviewDays !== undefined && (
            <p className={styles.endReview}>
              Comes back for review in {reviewDays} {reviewDays === 1 ? "day" : "days"}
            </p>
          )}
          <p className={styles.endSub}>
            {readCount} of {total} chapters read in this series
          </p>
          <span className={styles.endBar} aria-hidden="true">
            <span style={{ width: `${(readCount / total) * 100}%` }} />
          </span>
        </div>
      </div>
      {tickHref ? (
        <a className={styles.endBtn} href={tickHref}>
          {read ? "Mark as unread" : "Mark as read"}
        </a>
      ) : (
        <button type="button" className={styles.endBtn} aria-pressed={read} onClick={onToggleRead}>
          {read ? "Mark as unread" : "Mark as read"}
        </button>
      )}
    </section>
  );
}
