import styles from "@/components/series/chapter.module.css";
import readerStyles from "@/components/topic/reader.module.css";

const RAIL_PARTS = [0, 1, 2];
const RAIL_ROWS = [88, 76, 92, 70];
const LEAD_WIDTHS = [98, 96, 94, 61];
const TAIL_WIDTHS = [97, 99, 72];

export function ChapterSkeleton() {
  return (
    <div
      className={`${styles.page} ${readerStyles.page}`}
      role="status"
      aria-live="polite"
      aria-label="Loading chapter"
    >
      <div className={styles.body}>
        <aside className={styles.left} aria-hidden="true">
          <span className="sk sk--btn" style={{ width: 120 }} />
          {RAIL_PARTS.map((part) => (
            <div key={part} className={styles.skRailPart}>
              <span className="sk sk--text" style={{ width: "70%", height: 15 }} />
              {RAIL_ROWS.map((w, i) => (
                <span key={i} className="sk sk--text" style={{ width: `${w}%` }} />
              ))}
            </div>
          ))}
        </aside>

        <main className={styles.main} aria-hidden="true">
          <article className={`${styles.article} ${readerStyles.article}`}>
            <div className={styles.skHead}>
              <span className="sk" style={{ width: 52, height: 52, borderRadius: "50%" }} />
              <span className="sk sk--text" style={{ width: 240, height: 26 }} />
            </div>
            <span className="sk sk--text" style={{ width: "62%", height: 14 }} />

            <div className={styles.skBlock}>
              <span className="sk sk--text" style={{ width: 300, height: 20 }} />
              {LEAD_WIDTHS.map((w, i) => (
                <span key={i} className="sk sk--text" style={{ width: `${w}%` }} />
              ))}
            </div>

            <span className={`sk ${styles.skFigure}`} />

            <div className={styles.skBlock}>
              {TAIL_WIDTHS.map((w, i) => (
                <span key={i} className="sk sk--text" style={{ width: `${w}%` }} />
              ))}
            </div>
          </article>
        </main>

        <aside className={styles.right} aria-hidden="true">
          <div className={styles.rightInner}>
            <span className={`sk ${styles.skAside}`} />
          </div>
        </aside>
      </div>
    </div>
  );
}
