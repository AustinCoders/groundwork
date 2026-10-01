"use client";

import styles from "@/components/series/chapter.module.css";

export function ChapterEnd({
  num,
  read,
  readCount,
  total,
  onToggleRead,
}: {
  num: string;
  read: boolean;
  readCount: number;
  total: number;
  onToggleRead: () => void;
}) {
  return (
    <section className={`${styles.end}${read ? ` ${styles.endDone}` : ""}`} aria-label="Finish">
      <div className={styles.endStatus}>
        <span className={styles.endMark} aria-hidden="true">
          {read ? "✓" : num}
        </span>
        <div>
          <p className={styles.endTitle}>{read ? "Chapter read" : "Finished reading?"}</p>
          <p className={styles.endSub}>
            {readCount} of {total} chapters read in this series
          </p>
          <span className={styles.endBar} aria-hidden="true">
            <span style={{ width: `${(readCount / total) * 100}%` }} />
          </span>
        </div>
      </div>
      <button type="button" className={styles.endBtn} aria-pressed={read} onClick={onToggleRead}>
        {read ? "Mark as unread" : "Mark as read"}
      </button>
    </section>
  );
}
