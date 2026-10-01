"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { RefObject } from "react";
import type { ChapterSearchMatch } from "./useChapterSearch";
import styles from "@/components/series/chapter.module.css";

export function ChapterSearch({
  value,
  onChange,
  matches,
  otherMatches,
  chapterIds,
  basePath,
  inputRef,
  id = "search",
}: {
  value: string;
  onChange: (value: string) => void;
  matches: Set<string>;
  otherMatches: ChapterSearchMatch[];
  chapterIds: string[];
  basePath: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  id?: string;
}) {
  const router = useRouter();
  const query = value.trim();
  const searching = query.length > 0;
  const clear = () => onChange("");

  return (
    <div className={styles.searchWrap}>
      <input
        id={id}
        ref={inputRef}
        className={styles.searchInput}
        type="search"
        placeholder="Search…"
        aria-label="Search the notes"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") clear();
          if (e.key === "Enter" && matches.size) {
            e.preventDefault();
            const first = chapterIds.find((id) => matches.has(id));
            if (first) {
              clear();
              router.push(`${basePath}/${first}`);
            }
          }
        }}
      />
      <p className={styles.searchCount} id={`${id}-count`} aria-live="polite">
        {searching
          ? matches.size === 0
            ? `Nothing matches "${query}"`
            : `${matches.size} ${matches.size === 1 ? "chapter matches" : "chapters match"} "${query}"`
          : ""}
      </p>
      {otherMatches.length > 0 && (
        <div className={styles.searchOther}>
          <p className={styles.searchOtherTitle}>In other topics</p>
          <ol className={styles.railList}>
            {otherMatches.map((m) => (
              <li key={m.id}>
                <Link href={m.href} className={styles.railLink} onClick={clear}>
                  <span className={styles.railNum}>{m.num}</span>
                  <span className={styles.railTitle}>{m.short}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
