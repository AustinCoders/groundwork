"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { RefObject } from "react";
import { ClearButton, KeyHint, SearchPill, kit } from "@/components/ui/MenuKit";
import type { ChapterSearchMatch } from "./useChapterSearch";
import styles from "./rail.module.css";

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
    <div className={styles.search}>
      <SearchPill trailing={value ? <ClearButton label="Clear the search" onClear={clear} /> : <KeyHint>/</KeyHint>}>
        <input
          id={id}
          ref={inputRef}
          type="search"
          placeholder="Search this topic"
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
      </SearchPill>
      <p className={styles.searchCount} id={`${id}-count`} aria-live="polite">
        {searching
          ? matches.size === 0
            ? `Nothing matches "${query}"`
            : `${matches.size} ${matches.size === 1 ? "chapter matches" : "chapters match"} "${query}"`
          : ""}
      </p>
      {otherMatches.length > 0 && (
        <div className={styles.searchOther}>
          <p className={styles.partLabel}>In other topics</p>
          <ol className={kit.rows}>
            {otherMatches.map((m) => (
              <li key={m.id}>
                <Link href={m.href} className={kit.row} onClick={clear}>
                  <span className={kit.code}>{m.num}</span>
                  <span className={kit.title}>{m.short}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
