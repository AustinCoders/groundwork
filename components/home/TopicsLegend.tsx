import Link from "next/link";
import { useId, useRef, type KeyboardEvent, type MutableRefObject } from "react";
import { compactSpan, plural } from "@/lib/format";
import { accent } from "./tone";
import { GLYPH_FRAME, legendCell, legendChipsRow, toneOfCategory, type Glyph, type Topic } from "./topicsModel";
import type { ShelfCard } from "./types";
import styles from "./legend.module.css";

export interface LegendEntry {
  id: string;
  label: string;
  written: number;
  total: number;
  glyph: Glyph | null;
}

interface Props {
  entries: LegendEntry[];
  index: number;
  topics: Topic[];
  mapId: string;
  tabs: MutableRefObject<(HTMLButtonElement | null)[]>;
  query: string;
  cleared: boolean;
  matches: Topic[];
  start: ShelfCard | undefined;
  onQuery: (value: string) => void;
  onSubmit: () => void;
  onSelect: (id: string) => void;
  onKey: (e: KeyboardEvent) => void;
  onPreview: (id: string | null) => void;
  onChipEnter: (id: string) => void;
  onChipLeave: (id: string) => void;
  onBrowse: () => void;
}

function TopicChip({
  topic,
  onEnter,
  onLeave,
}: {
  topic: Topic;
  onEnter: (id: string) => void;
  onLeave: (id: string) => void;
}) {
  return (
    <li>
      <Link
        href={topic.href}
        prefetch={false}
        className={styles.chip}
        data-written={topic.written || undefined}
        aria-label={`Open ${topic.name}`}
        style={accent(topic.tone)}
        onPointerEnter={(e) => e.pointerType === "mouse" && onEnter(topic.id)}
        onPointerLeave={(e) => e.pointerType === "mouse" && onLeave(topic.id)}
        onFocus={() => onEnter(topic.id)}
        onBlur={() => onLeave(topic.id)}
      >
        {topic.name}
      </Link>
    </li>
  );
}

function GlyphArt({ glyph }: { glyph: Glyph | null }) {
  if (!glyph) {
    return (
      <svg className={styles.glyph} viewBox={GLYPH_FRAME} aria-hidden="true" focusable="false">
        <path className={styles.spark} d="M20 3 L22.5 10.5 L30 12 L22.5 13.5 L20 21 L17.5 13.5 L10 12 L17.5 10.5 Z" />
      </svg>
    );
  }
  return (
    <svg className={styles.glyph} viewBox={GLYPH_FRAME} aria-hidden="true" focusable="false">
      <path className={styles.glyphLines} d={glyph.lines} />
      {glyph.dots.map((dot, i) => (
        <circle key={i} cx={dot.x} cy={dot.y} r={dot.lit ? 3.2 : 2} data-lit={dot.lit || undefined} />
      ))}
    </svg>
  );
}

export function TopicsLegend({
  entries,
  index,
  topics,
  mapId,
  tabs,
  query,
  cleared,
  matches,
  start,
  onQuery,
  onSubmit,
  onSelect,
  onKey,
  onPreview,
  onChipEnter,
  onChipLeave,
  onBrowse,
}: Props) {
  const field = useId();
  const input = useRef<HTMLInputElement>(null);
  const results = useRef<HTMLUListElement>(null);
  const active = entries[index];
  const members =
    active.id === "ready" ? topics.filter((t) => t.written) : topics.filter((t) => t.category === active.id);
  const searching = query.trim() !== "";

  return (
    <>
      <div className={styles.top}>
        <form
          className={styles.find}
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <label htmlFor={field} className={styles.findLabel}>
            Find a topic
          </label>
          <div className={styles.findBox}>
            <svg className={styles.findIcon} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
              <circle cx="8.5" cy="8.5" r="5.5" />
              <path d="M12.8 12.8 L17 17" />
            </svg>
            <input
              ref={input}
              id={field}
              className={styles.findInput}
              type="search"
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="go"
              value={query}
              placeholder="Rust, react, kubernetes…"
              onChange={(e) => onQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape" && query !== "") {
                  e.stopPropagation();
                  onQuery("");
                }
                if (e.key === "ArrowDown" && results.current) {
                  const first = results.current.querySelector("a");
                  if (first) {
                    e.preventDefault();
                    first.focus();
                  }
                }
              }}
            />
            {query !== "" && (
              <button
                type="button"
                className={styles.findClear}
                aria-label="Clear search"
                onClick={() => {
                  onQuery("");
                  input.current?.focus();
                }}
              >
                <span aria-hidden="true">×</span>
              </button>
            )}
          </div>
          <p className={styles.findStatus} role="status">
            {searching
              ? matches.length === 0
                ? "No topic matches."
                : matches.length === 1
                  ? `1 match, press Enter to open ${matches[0].name}.`
                  : `${matches.length} matches.`
              : cleared
                ? "Search cleared."
                : ""}
          </p>
        </form>
        <button type="button" className={styles.browse} onClick={onBrowse}>
          Browse all topics <span aria-hidden="true">→</span>
        </button>
      </div>
      {searching && matches.length > 0 && (
        <ul ref={results} className={styles.results} aria-label="Matching topics">
          {matches.map((topic) => (
            <TopicChip key={topic.id} topic={topic} onEnter={onChipEnter} onLeave={onChipLeave} />
          ))}
        </ul>
      )}
      <div className={styles.legend} data-searching={searching || undefined} onPointerLeave={() => onPreview(null)}>
        <div className={styles.rows} role="tablist" aria-label="Topics" aria-orientation="vertical" onKeyDown={onKey}>
          {entries.map((entry, i) => {
            const share = entry.total === 0 ? 0 : entry.written / entry.total;
            const cell = legendCell(i, index, entries.length);
            return (
              <button
                key={entry.id}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`shelf-tab-${entry.id}`}
                aria-label={`${entry.label} ${entry.written} of ${entry.total} written`}
                aria-selected={i === index}
                aria-controls={mapId}
                tabIndex={i === index ? 0 : -1}
                className={styles.tab}
                style={{
                  ...accent(toneOfCategory(entry.id)),
                  ["--row" as string]: cell.row,
                  ["--col" as string]: cell.column,
                  ["--share" as string]: share.toFixed(3),
                }}
                onClick={() => onSelect(entry.id)}
                onPointerEnter={(e) => e.pointerType === "mouse" && onPreview(entry.id)}
              >
                <GlyphArt glyph={entry.glyph} />
                <span className={styles.name}>{entry.label}</span>
                <span className={styles.meta}>
                  <i className={styles.bar} aria-hidden="true" />
                  <span className={styles.tally}>
                    <span className={styles.tallyLong}>
                      {entry.written} of {entry.total} written
                    </span>
                    <span className={styles.tallyShort}>
                      {entry.written}/{entry.total}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <ul
          className={styles.chips}
          aria-label={`${active.label} topics`}
          style={{
            ...accent(toneOfCategory(active.id)),
            ["--row" as string]: legendChipsRow(index, entries.length),
          }}
        >
          {members.map((topic) => (
            <TopicChip key={topic.id} topic={topic} onEnter={onChipEnter} onLeave={onChipLeave} />
          ))}
        </ul>
      </div>
      <div className={styles.foot}>
        {start && (
          <Link href={start.href} prefetch={false} className={styles.start} style={accent(start.accent)}>
            <span className={styles.tape} aria-hidden="true" />
            <span className={styles.startKicker}>
              Start here ·{" "}
              {[
                plural(start.chapters, "chapter"),
                start.exercises > 0 ? plural(start.exercises, "exercise") : "",
                compactSpan(start.minutes),
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
            <span className={styles.startName}>{start.name}</span>
            <svg className={styles.startArrow} viewBox="0 0 120 60" aria-hidden="true" focusable="false">
              <path d="M6 40 C 36 6, 78 8, 108 30" />
              <path d="M92 18 L109 31 L90 40" />
            </svg>
          </Link>
        )}
      </div>
    </>
  );
}
