"use client";

import { TopIcon } from "@/components/practice/TopIcon";
import { prefersMotion } from "@/lib/dom";
import type { TocItem } from "./types";
import styles from "@/components/series/chapter.module.css";

export function TocCard({
  toc,
  active,
  pct,
  read,
  onToggleRead,
}: {
  toc: TocItem[];
  active: string | null;
  pct: number;
  read: boolean;
  onToggleRead: () => void;
}) {
  return (
    <aside className={styles.right} aria-label="On this page">
      <div className={styles.rightInner}>
        {toc.length > 0 && (
          <section className={styles.tocCard} aria-label="Sections">
            <div className={styles.tocTop}>
              <svg className={styles.ring} viewBox="0 0 36 36" aria-hidden="true">
                <circle cx="18" cy="18" r="15" className={styles.ringTrack} />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  className={styles.ringFill}
                  strokeDasharray={`${(pct / 100) * 94.25} 94.25`}
                  transform="rotate(-90 18 18)"
                />
              </svg>
              <div>
                <p className={styles.tocHead}>On this page</p>
                <p className={styles.tocMeta}>
                  {active
                    ? `Section ${toc.findIndex((t) => t.id === active) + 1} of ${toc.length}`
                    : `${toc.length} sections`}{" "}
                  · {pct}%
                </p>
              </div>
            </div>
            <ol className={styles.toc}>
              {toc.map((t, i) => {
                const at = toc.findIndex((x) => x.id === active);
                const state = i === at ? "now" : i < at ? "past" : "next";
                return (
                  <li key={t.id} data-state={state}>
                    <a href={`#${t.id}`} aria-current={state === "now" ? "location" : undefined}>
                      <span className={styles.tocNum}>{String(i + 1).padStart(2, "0")}</span>
                      <span className={styles.tocText}>{t.text}</span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </section>
        )}
        <button
          type="button"
          className={`${styles.readBtn}${read ? ` ${styles.readBtnOn}` : ""}`}
          aria-pressed={read}
          onClick={onToggleRead}
        >
          <span className={styles.readTick} aria-hidden="true">
            {read ? "✓" : ""}
          </span>
          {read ? "Read" : "Mark as read"}
        </button>
        <div className={styles.sideFoot}>
          <button
            type="button"
            className={styles.topBtn}
            onClick={() => window.scrollTo({ top: 0, behavior: prefersMotion() ? "smooth" : "auto" })}
            disabled={pct === 0}
          >
            <TopIcon name="prev" size={14} />
            Back to top
          </button>
          <p className={styles.keys}>
            <kbd>[</kbd>
            <kbd>]</kbd> chapters · <kbd>t</kbd> top
          </p>
        </div>
      </div>
    </aside>
  );
}
