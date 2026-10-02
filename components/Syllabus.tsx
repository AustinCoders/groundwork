"use client";

import { useState } from "react";
import { levelRows } from "@/lib/levelRows";
import { notesHref } from "@/lib/content";
import type { ChapterMeta, Level, Topic } from "@/content/types";
import styles from "@/components/topic/level.module.css";

function raw(html: string) {
  return { __html: html };
}

export function Syllabus({
  topic,
  levels,
  chapterById,
}: {
  topic: Topic;
  levels: Level[];
  chapterById: Record<string, ChapterMeta>;
}) {
  const [openIndex, setOpenIndex] = useState(0);
  const basePath = notesHref(topic.id);

  return (
    <div className={styles.syllabus} id="syllabus" data-fx="stagger">
      {levels.map((level, index) => {
        const rows = levelRows(level, chapterById);
        const written = rows.filter((r) => r.ready).length;

        return (
          <details
            key={level.id}
            className={styles.syllabusLevel}
            open={openIndex === index}
            onToggle={(e) => {
              if ((e.target as HTMLDetailsElement).open) setOpenIndex(index);
            }}
          >
            <summary className={styles.syllabusSummary}>
              <span className={styles.syllabusBadge} aria-hidden="true">
                {level.mark}
              </span>
              <span className={styles.syllabusName}>{level.name}</span>
              <span className={styles.syllabusCount}>
                {written} / {rows.length} sections written
              </span>
              <span className={styles.syllabusArrow} aria-hidden="true">
                ›
              </span>
              <span className={styles.syllabusProgress} aria-hidden="true">
                <span
                  className={styles.syllabusProgressFill}
                  style={{ width: `${rows.length ? (written / rows.length) * 100 : 0}%` }}
                />
              </span>
            </summary>
            <div className={styles.syllabusBody}>
              <ul className={styles.syllabusList}>
                {rows.map((row, i) =>
                  row.ready ? (
                    <li className={`${styles.item} ${styles.itemReady}`} key={row.chapter.id}>
                      <div className={styles.itemHead}>
                        <span className={styles.itemCheck} aria-hidden="true">
                          ✓
                        </span>
                        <a
                          className={styles.itemTitle}
                          href={`${basePath}/${row.chapter.id}`}
                          dangerouslySetInnerHTML={raw(row.chapter.title)}
                        />
                      </div>
                      <p className={styles.itemSub} dangerouslySetInnerHTML={raw(row.chapter.subtitle)} />
                    </li>
                  ) : (
                    <li className={`${styles.item} ${styles.itemPlanned}`} key={row.section.title + i}>
                      <div className={styles.itemHead}>
                        <span className={styles.itemCheck} aria-hidden="true">
                          ○
                        </span>
                        {row.chapter ? (
                          <a className={styles.itemTitle} href={`${basePath}/${row.chapter.id}`}>
                            {row.section.title}
                          </a>
                        ) : (
                          <span className={styles.itemTitle}>{row.section.title}</span>
                        )}
                        <span className="tag tag--soon">coming soon</span>
                      </div>
                      <p className={styles.itemSub}>{row.section.items.join(" · ")}</p>
                    </li>
                  )
                )}
              </ul>
              {level.checkpoint && (
                <p className={styles.checkpoint}>
                  ✅ <b>Checkpoint:</b> {level.checkpoint}
                </p>
              )}
            </div>
          </details>
        );
      })}
    </div>
  );
}
