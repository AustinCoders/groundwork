import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { plural } from "@/lib/format";
import {
  CARD_H,
  CARD_W,
  DECOR,
  DOCK,
  HOME_LINE,
  HUB,
  layoutMetro,
  REF_H,
  REF_W,
  type MetroLine,
  type Station,
} from "@/lib/metro";
import { TOPIC_CATEGORIES } from "@/lib/topicCategories";
import type { HomeViewProps, ShelfCard } from "./types";
import { Chip, Copy, Note, Scene, Stage, Sticker, Tape } from "./Stage";
import { TopicsLegend, type LegendEntry } from "./TopicsLegend";
import { accent, vars } from "./tone";
import { buildTopics, exactTopic, findTopics, lineGlyph, startTopic, toneOfCategory, type Topic } from "./topicsModel";
import styles from "./topics.module.css";

const READY_TAB = "ready";
const MAP_ID = "shelf-map";
const TILT_SPREAD = 9;
const TILT_STEP = 37;

type Tone = "bright" | "base" | "dim";
type Engaged = { id: string; kind: "pointer" | "focus" | "chip" } | null;

const percent = (value: number, of: number) => `${((value / of) * 100).toFixed(3)}%`;
const ofWidth = (value: number) => percent(value, REF_W);
const ofHeight = (value: number) => percent(value, REF_H);
const placed = (box: { x: number; y: number }): CSSProperties => vars({ x: ofWidth(box.x), y: ofHeight(box.y) });

function Train({ line, on }: { line: MetroLine; on: boolean }) {
  return (
    <g
      className={styles.train}
      data-train={line.id}
      data-on={on ? "" : undefined}
      style={
        {
          offsetPath: `path("${line.d}")`,
          ...accent(toneOfCategory(line.id)),
          ...vars({ stop: Math.round(line.stop) }),
        } as CSSProperties
      }
    >
      <g className={styles.rolling}>
        <rect className={styles.car} x="-54" y="-5.5" width="15" height="11" rx="3" />
        <rect className={styles.car} x="-37" y="-5.5" width="15" height="11" rx="3" />
        <rect className={styles.engine} x="-20" y="-6.5" width="20" height="13" rx="4" />
        <rect className={styles.chimney} x="-16" y="-10" width="5" height="4" rx="1" />
        <rect className={styles.window} x="-8" y="-4" width="5" height="5" rx="1.2" />
        <rect className={styles.window} x="-51" y="-3" width="8" height="4" rx="1" />
        <rect className={styles.window} x="-34" y="-3" width="8" height="4" rx="1" />
        <circle className={styles.wheel} cx="-46" cy="5.5" r="2" />
        <circle className={styles.wheel} cx="-30" cy="5.5" r="2" />
        <circle className={styles.wheel} cx="-13" cy="6.5" r="2.4" />
        <circle className={styles.wheel} cx="-5" cy="6.5" r="2.4" />
      </g>
    </g>
  );
}

export function TopicsScene({
  head,
  ready,
  soon,
  interview,
  exercises,
  onBrowse,
}: {
  head: ReactNode;
  ready: ShelfCard[];
  soon: ShelfCard[];
  interview: HomeViewProps["interview"];
  exercises: number;
  onBrowse: () => void;
}) {
  const router = useRouter();
  const [active, setActive] = useState<string>(READY_TAB);
  const [preview, setPreview] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [cleared, setCleared] = useState(false);
  const [engaged, setEngaged] = useState<Engaged>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const topics = useMemo(() => buildTopics(ready, soon, interview), [ready, soon, interview]);
  const metro = useMemo(
    () =>
      layoutMetro(
        topics.map((topic) => ({
          id: topic.id,
          name: topic.name,
          category: topic.category === HUB ? null : topic.category,
          lit: topic.written,
        })),
        TOPIC_CATEGORIES
      ),
    [topics]
  );
  const byStation = useMemo(() => new Map<string, Station>(metro.stations.map((s) => [s.id, s])), [metro]);
  const byTopic = useMemo(() => new Map<string, Topic>(topics.map((topic) => [topic.id, topic])), [topics]);
  const start = useMemo(() => startTopic(ready), [ready]);

  const entries: LegendEntry[] = [
    {
      id: READY_TAB,
      label: "Ready now",
      written: topics.filter((topic) => topic.written).length,
      total: topics.length,
      glyph: null,
    },
    ...TOPIC_CATEGORIES.map((category) => ({
      id: category.id,
      label: category.label,
      written: topics.filter((topic) => topic.category === category.id && topic.written).length,
      total: topics.filter((topic) => topic.category === category.id).length,
      glyph: lineGlyph(metro, category.id),
    })).filter((entry) => entry.total > 0),
  ];
  const index = Math.max(
    0,
    entries.findIndex((entry) => entry.id === active)
  );
  const current = entries[index].id;
  const matches = useMemo(() => findTopics(topics, query), [topics, query]);
  const matchIds = useMemo(() => new Set(matches.map((topic) => topic.id)), [matches]);
  const searching = query.trim() !== "";
  const shown = preview ?? current;
  const pointed = engaged ? byStation.get(engaged.id) : undefined;
  const settled = current === READY_TAB ? HOME_LINE : current;
  const followed = pointed
    ? pointed.line
    : preview !== null && preview !== READY_TAB
      ? preview
      : searching
        ? (metro.stations.find((station) => matchIds.has(station.id))?.line ?? settled)
        : settled;
  const trainLine = metro.lines.some((line) => line.id === followed) ? followed : HOME_LINE;

  function lineTone(line: string): Tone {
    if (pointed) return pointed.lines.includes(line) ? "bright" : "dim";
    if (searching)
      return metro.stations.some((station) => station.lines.includes(line) && matchIds.has(station.id))
        ? "base"
        : "dim";
    if (shown === READY_TAB) return "base";
    return shown === line ? "bright" : "dim";
  }

  function stationTone(station: Station): Tone {
    if (pointed) return pointed.lines.some((line) => station.lines.includes(line)) ? "bright" : "dim";
    if (searching) return matchIds.has(station.id) ? "bright" : "dim";
    if (shown === READY_TAB) return station.lit ? "bright" : "base";
    return station.lines.includes(shown) ? "bright" : "dim";
  }

  function select(id: string) {
    setActive(id);
    setPreview(null);
    setEngaged(null);
    setCleared(query !== "");
    setQuery("");
  }

  function changeQuery(value: string) {
    setCleared(value === "" && query !== "");
    setQuery(value);
    setEngaged(null);
  }

  function submit() {
    const target = exactTopic(topics, query) ?? (matches.length === 1 ? matches[0] : undefined);
    if (target) router.push(target.href);
  }

  function onKey(e: KeyboardEvent) {
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
    select(entries[next].id);
    tabs.current[next]?.focus();
  }

  function onSceneKey(e: KeyboardEvent) {
    if (e.key === "Escape" && engaged) setEngaged(null);
  }

  const engage = (id: string, kind: "pointer" | "focus" | "chip") => setEngaged({ id, kind });
  const release = (id: string, kind: "pointer" | "focus" | "chip") =>
    setEngaged((now) => (now && now.id === id && now.kind === kind ? null : now));

  const visible = (topic: Topic) =>
    searching ? matchIds.has(topic.id) : current === READY_TAB ? topic.written : topic.category === current;

  const exerciseCount = plural(exercises, "exercise");

  return (
    <Scene onKeyDown={onSceneKey}>
      <Copy className={styles.copy}>
        {head}
        <p className={styles.caption}>
          {exercises > 0 ? `Written first, ${exerciseCount} so far.` : "Written first."} The rest fill in as chapters
          are written.
        </p>
        <TopicsLegend
          entries={entries}
          index={index}
          topics={topics}
          mapId={MAP_ID}
          tabs={tabs}
          query={query}
          cleared={cleared}
          matches={matches}
          start={start}
          onQuery={changeQuery}
          onSubmit={submit}
          onSelect={select}
          onKey={onKey}
          onPreview={setPreview}
          onChipEnter={(id) => engage(id, "chip")}
          onChipLeave={(id) => release(id, "chip")}
          onBrowse={onBrowse}
        />
      </Copy>
      <Stage live tone="blue" pointer={false} className={styles.shelfStage}>
        <div
          className={styles.map}
          role="tabpanel"
          id={MAP_ID}
          aria-labelledby={`shelf-tab-${current}`}
          data-focus={current}
          data-engaged={engaged ? "" : undefined}
        >
          <div className={styles.field} style={vars({ rw: REF_W, rh: REF_H, cw: CARD_W, ch: CARD_H })}>
            <svg className={styles.lines} viewBox={`0 0 ${REF_W} ${REF_H}`} aria-hidden="true" focusable="false">
              {metro.lines.map((line) => (
                <g
                  key={line.id}
                  className={styles.line}
                  data-line={line.id}
                  data-tone={lineTone(line.id)}
                  style={accent(toneOfCategory(line.id))}
                >
                  <path
                    d={line.d}
                    pathLength={1}
                    className={styles.track}
                    data-motion="edge"
                    style={vars({ lag: line.lag })}
                  />
                  <path d={line.bar} className={styles.bar} />
                </g>
              ))}
              {metro.stations.map((station) => (
                <g
                  key={`leader-${station.id}`}
                  className={styles.leader}
                  data-open={engaged?.id === station.id ? "" : undefined}
                >
                  <path d={station.leader.line} />
                  <path d={station.leader.head} className={styles.head} />
                </g>
              ))}
              {metro.lines.map((line) => (
                <Train key={`train-${line.id}`} line={line} on={line.id === trainLine} />
              ))}
            </svg>
            {metro.lines.map((line) => (
              <span
                key={line.id}
                className={styles.badge}
                data-motion="star"
                data-tone={lineTone(line.id)}
                aria-hidden="true"
                style={{
                  ...accent(toneOfCategory(line.id)),
                  ...vars({
                    x: ofWidth(line.badge.x),
                    y: ofHeight(line.badge.y),
                    bw: line.badge.w,
                    bh: line.badge.h,
                    lag: line.lag,
                  }),
                }}
              >
                {line.label}
              </span>
            ))}
            <ul className={styles.stations}>
              {metro.stations.map((station, i) => {
                const topic = byTopic.get(station.id);
                if (!topic) return null;
                const open = engaged?.id === station.id;
                const cardId = `shelf-card-${topic.id}`;
                return (
                  <li
                    key={topic.id}
                    className={styles.node}
                    data-motion="star"
                    data-id={topic.id}
                    data-kind={topic.written ? "written" : "soon"}
                    data-tone={stationTone(station)}
                    data-align={station.align}
                    data-join={station.lines.length > 1 ? "" : undefined}
                    data-open={open ? "" : undefined}
                    data-hide={visible(topic) ? undefined : ""}
                    data-bare={station.bare ? "" : undefined}
                    data-hit={searching && matchIds.has(topic.id) ? "" : undefined}
                    style={
                      {
                        ...accent(toneOfCategory(station.line)),
                        ...vars({
                          x: ofWidth(station.x),
                          y: ofHeight(station.y),
                          lag: station.lag,
                          i,
                          lx: Math.round(station.label.x - station.x),
                          ly: Math.round(station.label.y - station.y),
                          lw: Math.ceil(station.label.w),
                          lh: Math.ceil(station.label.h),
                          cx: Math.round(station.card.x - station.x),
                          cy: Math.round(station.card.y - station.y),
                          tilt: ((i * TILT_STEP) % TILT_SPREAD) - Math.floor(TILT_SPREAD / 2),
                        }),
                      } as CSSProperties
                    }
                  >
                    <Link
                      href={topic.href}
                      prefetch={false}
                      className={styles.link}
                      aria-label={topic.label}
                      aria-describedby={topic.meta ? `${cardId}-tag ${cardId}-meta` : `${cardId}-tag`}
                      onFocus={() => engage(topic.id, "focus")}
                      onBlur={() => release(topic.id, "focus")}
                      onPointerEnter={(e) => e.pointerType === "mouse" && engage(topic.id, "pointer")}
                      onPointerLeave={(e) => e.pointerType === "mouse" && release(topic.id, "pointer")}
                    >
                      <span className={styles.marker} aria-hidden="true">
                        {topic.written ? (
                          <span className={styles.mark}>{topic.mark}</span>
                        ) : (
                          <i className={styles.ring} />
                        )}
                        {topic.written && <i className={styles.twinkle} />}
                      </span>
                      <span className={styles.name}>
                        <span className={styles.nameText}>{topic.name}</span>
                        {topic.written && <span className={styles.nameChip}>{topic.chip}</span>}
                      </span>
                      <span className={styles.card} id={cardId} data-soon={topic.written ? undefined : ""}>
                        <Tape rot={i % 2 ? 4 : -4} />
                        <span className={styles.cardMark} aria-hidden="true">
                          {topic.mark}
                        </span>
                        <span className={styles.cardTitle}>
                          <span className={styles.cardName}>{topic.name}</span>
                          {topic.meta && (
                            <span className={styles.cardMeta} id={`${cardId}-meta`}>
                              {topic.meta}
                            </span>
                          )}
                        </span>
                        <span className={styles.cardTag} id={`${cardId}-tag`}>
                          {topic.tagline}
                        </span>
                        <span className={styles.cardChip} data-soon={topic.written ? undefined : ""}>
                          {topic.chip}
                        </span>
                        <span className={styles.cardGo}>
                          <span className={styles.goText}>{topic.written ? "Open" : "Outline"}</span>
                          <span aria-hidden="true">→</span>
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className={styles.key} style={placed(DECOR.key)} aria-hidden="true">
              <span className={styles.keyRow}>
                <i className={styles.keyFilled} />
                written
              </span>
              <span className={styles.keyRow}>
                <i className={styles.keyHollow} />
                coming soon
              </span>
              <span className={styles.keyRow}>
                <i className={styles.keyDouble} />
                interchange
              </span>
            </p>
            {searching && matches.length === 0 && (
              <p className={styles.empty} style={placed(DOCK)}>
                No topic matches.
              </p>
            )}
            <Sticker rot={-6} depth={20} className={styles.topicsSticker} style={placed(DECOR.sticker)}>
              free to read
            </Sticker>
            <Note arrow="dl" rot={-3} depth={16} className={styles.topicsNote} style={placed(DECOR.note)}>
              pick a stop
            </Note>
            <Chip
              fact={`${interview.questions}`}
              rot={-3}
              depth={12}
              speed={46}
              className={styles.chipA}
              style={placed(DECOR.chipA)}
            >
              {interview.questions}+ questions
            </Chip>
            <Chip
              fact={`${interview.rounds}`}
              rot={2}
              depth={-8}
              speed={-34}
              className={styles.chipB}
              style={placed(DECOR.chipB)}
            >
              {interview.rounds} rounds
            </Chip>
            {exercises > 0 && (
              <Chip
                fact={exerciseCount}
                rot={-2}
                depth={16}
                speed={62}
                className={styles.chipC}
                style={placed(DECOR.chipC)}
              >
                {exerciseCount}
              </Chip>
            )}
          </div>
        </div>
      </Stage>
    </Scene>
  );
}
