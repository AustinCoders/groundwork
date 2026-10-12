import { ReaderAside, ReaderLayout, ReadingColumn } from "@/components/chapter/ChapterKit";
import styles from "@/components/chapter/chapterKit.module.css";

const RAIL_PARTS = [0, 1, 2];
const RAIL_ROWS = [88, 76, 92, 70];
const LEAD_WIDTHS = [98, 96, 94, 61];
const TAIL_WIDTHS = [97, 99, 72];

export function ChapterSkeleton() {
  return (
    <ReaderLayout
      role="status"
      aria-live="polite"
      aria-label="Loading chapter"
      rail={
        <div aria-hidden="true">
          <span className="sk sk--btn" style={{ width: 120 }} />
          {RAIL_PARTS.map((part) => (
            <div key={part} className={styles.skRailPart}>
              <span className="sk sk--text" style={{ width: "70%", height: 15 }} />
              {RAIL_ROWS.map((w, i) => (
                <span key={i} className="sk sk--text" style={{ width: `${w}%` }} />
              ))}
            </div>
          ))}
        </div>
      }
      aside={
        <ReaderAside label="Loading contents">
          <span className={`sk ${styles.skAside}`} aria-hidden="true" />
        </ReaderAside>
      }
    >
      <ReadingColumn>
        <div aria-hidden="true">
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
        </div>
      </ReadingColumn>
    </ReaderLayout>
  );
}
