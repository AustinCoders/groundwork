import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { formatSpan, plural } from "@/lib/format";
import { TOPIC_CATEGORIES } from "@/lib/topicCategories";
import type { HomeViewProps, ShelfCard } from "./types";
import { Copy, Note, Scene, Spark, Stage, StageCard, Sticker, Tape } from "./Stage";
import { accent } from "./tone";
import { NARROW, useMedia } from "./useNarrow";
import styles from "./scenes.module.css";

const READY_TAB = "ready";
const FAN_ROTATIONS = [-2.2, 1.6, -1.2, 2, -1.7, 1.3, -1.9, 2.2, -0.9];
const FAN_DEPTHS = [8, -6, 10, -8, 6, -10, 7, -5, 9];
const FEW = 3;

export function TopicsScene({
  head,
  ready,
  soon,
  interview,
  onBrowse,
}: {
  head: ReactNode;
  ready: ShelfCard[];
  soon: ShelfCard[];
  interview: HomeViewProps["interview"];
  onBrowse: () => void;
}) {
  const [active, setActive] = useState<string>(READY_TAB);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const narrow = useMedia(NARROW);
  const all = [...ready, ...soon];
  const categories = TOPIC_CATEGORIES.map((category) => ({
    ...category,
    topics: all.filter((t) => t.category === category.id),
  })).filter((category) => category.topics.length > 0);
  const entries = [
    { id: READY_TAB, label: "Ready now", count: ready.length + 1 },
    ...categories.map((category) => ({ id: category.id, label: category.label, count: category.topics.length })),
  ];
  const index = Math.max(
    0,
    entries.findIndex((entry) => entry.id === active)
  );
  const readyIds = new Set(ready.map((t) => t.id));
  const meta = (t: ShelfCard) => [t.exercises > 0 ? plural(t.exercises, "exercise") : "", formatSpan(t.minutes)];

  function onKey(e: React.KeyboardEvent) {
    const count = entries.length;
    const next =
      e.key === "ArrowDown" || e.key === "ArrowRight"
        ? (index + 1) % count
        : e.key === "ArrowUp" || e.key === "ArrowLeft"
          ? (index - 1 + count) % count
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? count - 1
              : -1;
    if (next < 0) return;
    e.preventDefault();
    setActive(entries[next].id);
    tabs.current[next]?.focus();
  }

  return (
    <Scene>
      <Copy className={styles.topicsCopy}>
        {head}
        <div
          className={styles.catList}
          role="tablist"
          aria-label="Topics"
          aria-orientation={narrow ? "horizontal" : "vertical"}
          onKeyDown={onKey}
        >
          {entries.map((entry, i) => (
            <button
              key={entry.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`shelf-tab-${entry.id}`}
              aria-selected={i === index}
              aria-controls={`shelf-panel-${entry.id}`}
              tabIndex={i === index ? 0 : -1}
              className={styles.catTab}
              onClick={() => setActive(entry.id)}
            >
              <span>{entry.label}</span>
              <span className={styles.catCount} aria-hidden="true">
                {entry.count}
              </span>
            </button>
          ))}
        </div>
        <button type="button" className={styles.browse} onClick={onBrowse}>
          Browse all topics <span aria-hidden="true">→</span>
        </button>
      </Copy>
      <Stage live tone="blue" className={styles.topicsStage}>
        {entries.map((entry, i) => {
          const group = categories.find((category) => category.id === entry.id);
          const topics = group ? group.topics : ready;
          const written = group ? group.topics.filter((t) => readyIds.has(t.id)).length : ready.length + 1;
          const total = group ? group.topics.length : ready.length + 1;
          const cards = topics.length + (group ? 0 : 1);
          const ghosts = Math.max(0, FEW - cards);
          return (
            <div
              key={entry.id}
              className={styles.fanPanel}
              role="tabpanel"
              id={`shelf-panel-${entry.id}`}
              aria-labelledby={`shelf-tab-${entry.id}`}
              hidden={i !== index}
            >
              <p className={styles.panelNote}>
                {written} written
                {total > written ? ` · ${total - written} coming soon` : ""}
              </p>
              <ul className={styles.fan} data-count={Math.min(cards + ghosts, 9)} data-few={cards <= FEW || undefined}>
                {topics.map((t, k) => {
                  const isWritten = readyIds.has(t.id);
                  return (
                    <TopicCard
                      key={t.id}
                      i={k}
                      href={t.href}
                      mark={t.mark}
                      name={t.name}
                      tagline={t.tagline}
                      tone={t.accent}
                      chip={isWritten ? plural(t.chapters, "chapter") : "Coming soon"}
                      meta={isWritten ? meta(t).filter(Boolean).join(" · ") : undefined}
                      soon={!isWritten}
                      taped={k === 0}
                    />
                  );
                })}
                {!group && (
                  <TopicCard
                    i={topics.length}
                    href="/interview"
                    mark="◎"
                    name="Interview book"
                    tagline="Every round, every question, the answer."
                    tone="red"
                    chip={plural(interview.rounds, "round")}
                    meta={`${interview.questions}+ questions`}
                  />
                )}
                {Array.from({ length: ghosts }, (_, g) => (
                  <StageCard
                    as="li"
                    key={`ghost-${g}`}
                    decor
                    i={cards + g}
                    rot={FAN_ROTATIONS[(cards + g) % FAN_ROTATIONS.length]}
                    depth={FAN_DEPTHS[(cards + g) % FAN_DEPTHS.length]}
                    className={`${styles.fanItem} ${styles.ghost}`}
                  >
                    <span className={styles.ghostMark}>+</span>
                    <span className={styles.ghostText}>More land here as they are written</span>
                  </StageCard>
                ))}
              </ul>
            </div>
          );
        })}
        <Sticker rot={-7} depth={20} className={styles.topicsSticker}>
          free to read
        </Sticker>
        <Note arrow="dr" rot={-3} depth={16} className={styles.topicsNote}>
          start anywhere
        </Note>
        <Spark className={styles.topicsSpark} />
      </Stage>
    </Scene>
  );
}

function TopicCard({
  i,
  href,
  mark,
  name,
  tagline,
  tone,
  chip,
  meta,
  soon,
  taped,
}: {
  i: number;
  href: string;
  mark: string;
  name: string;
  tagline: string;
  tone: string;
  chip: string;
  meta?: string;
  soon?: boolean;
  taped?: boolean;
}) {
  return (
    <StageCard
      as="li"
      still
      i={i}
      rot={FAN_ROTATIONS[i % FAN_ROTATIONS.length]}
      depth={FAN_DEPTHS[i % FAN_DEPTHS.length]}
      className={styles.fanItem}
      data-soon={soon || undefined}
      style={accent(tone)}
    >
      {taped && <Tape rot={i % 2 ? 4 : -4} />}
      <Link href={href} prefetch={false} className={styles.topicLink}>
        <span className={styles.cardMark} aria-hidden="true">
          {mark}
        </span>
        <span className={styles.cardName}>{name}</span>
        <span className={styles.cardTag}>{tagline}</span>
        <span className={styles.cardLines} aria-hidden="true">
          <i />
          <i />
        </span>
        {meta && <span className={styles.cardMeta}>{meta}</span>}
        <span className={styles.cardChip} data-soon={soon || undefined}>
          {chip}
        </span>
        <span className={styles.cardGo} aria-hidden="true">
          →
        </span>
      </Link>
    </StageCard>
  );
}
