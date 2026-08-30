"use client";

import { useState } from "react";
import { levelRows } from "@/lib/levelRows";
import type { ChapterMeta, Level, Topic } from "@/content/types";

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

  return (
    <div className="syllabus" id="syllabus">
      {levels.map((level, index) => {
        const rows = levelRows(level, chapterById);
        const written = rows.filter((r) => r.ready).length;

        return (
          <details
            key={level.id}
            className="syllabus-level"
            open={openIndex === index}
            onToggle={(e) => {
              if ((e.target as HTMLDetailsElement).open) setOpenIndex(index);
            }}
          >
            <summary className="syllabus-level__summary">
              <span className="syllabus-level__badge" aria-hidden="true">
                {level.mark}
              </span>
              <span className="syllabus-level__name">{level.name}</span>
              <span className="syllabus-level__count">
                {written} / {rows.length} sections written
              </span>
              <span className="syllabus-level__arrow" aria-hidden="true">
                ›
              </span>
            </summary>
            <div className="syllabus-level__body">
              <ul className="syllabus-list">
                {rows.map((row, i) =>
                  row.ready ? (
                    <li className="syllabus-item is-ready" key={row.chapter.id}>
                      <div className="syllabus-item__head">
                        <span className="syllabus-item__check" aria-hidden="true">
                          ✓
                        </span>
                        <a
                          className="syllabus-item__title"
                          href={`/${(topic.notes || "").replace(/\.html$/, "")}/${row.chapter.id}`}
                          dangerouslySetInnerHTML={raw(row.chapter.title)}
                        />
                      </div>
                      <p className="syllabus-item__sub" dangerouslySetInnerHTML={raw(row.chapter.subtitle)} />
                    </li>
                  ) : (
                    <li className="syllabus-item is-planned" key={row.section.title + i}>
                      <div className="syllabus-item__head">
                        <span className="syllabus-item__check" aria-hidden="true">
                          ○
                        </span>
                        {row.chapter ? (
                          <a
                            className="syllabus-item__title"
                            href={`/${(topic.notes || "").replace(/\.html$/, "")}/${row.chapter.id}`}
                          >
                            {row.section.title}
                          </a>
                        ) : (
                          <span className="syllabus-item__title">{row.section.title}</span>
                        )}
                        <span className="tag tag--soon">coming soon</span>
                      </div>
                      <p className="syllabus-item__sub">{row.section.items.join(" · ")}</p>
                    </li>
                  )
                )}
              </ul>
              {level.checkpoint && (
                <p className="syllabus-checkpoint">
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
