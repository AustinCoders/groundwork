"use client";

import { TopIcon } from "@/components/practice/TopIcon";
import { Eyebrow, kit } from "@/components/ui/MenuKit";
import { prefersMotion } from "@/lib/dom";
import type { TocItem } from "./types";
import chapterStyles from "@/components/series/chapter.module.css";
import styles from "./rail.module.css";

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
  const at = toc.findIndex((t) => t.id === active);
  return (
    <aside className={chapterStyles.right} aria-label="On this page">
      <div className={chapterStyles.rightInner}>
        {toc.length > 0 && (
          <section className={styles.tocCard} aria-label="Sections">
            <Eyebrow as="p" no={String(Math.max(at, 0) + 1).padStart(2, "0")}>
              On this page
            </Eyebrow>
            <span className={styles.trail} aria-hidden="true">
              <span style={{ width: `${pct}%` }} />
            </span>
            <p className={styles.tocMeta}>
              {active ? `Section ${at + 1} of ${toc.length}` : `${toc.length} sections`} · {pct}%
            </p>
            <ol className={styles.toc}>
              {toc.map((t, i) => {
                const state = i === at ? "now" : i < at ? "past" : "next";
                return (
                  <li key={t.id} data-state={state}>
                    <a href={`#${t.id}`} aria-current={state === "now" ? "location" : undefined}>
                      <span className={kit.code}>{String(i + 1).padStart(2, "0")}</span>
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
