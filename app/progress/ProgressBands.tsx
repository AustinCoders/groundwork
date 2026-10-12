"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Tape } from "@/components/home/Stage";
import { Band, CardKicker, List, ProgressMeter, Row, Step, Steps, Wrap, topicKit } from "@/components/topic/TopicKit";
import { useScrollRegions } from "@/components/reader/scrollRegions";
import { BADGES, type Badge, type Stats } from "@/lib/gamification";
import { plural } from "@/lib/format";
import {
  badgeStanding,
  buildHeat,
  dayDate,
  heatLevel,
  weekTotal,
  type Confidence,
  type DayCount,
  type NextStep,
  type TopicRow,
} from "./progressModel";
import kit from "@/app/mock/mockKit.module.css";
import styles from "./bands.module.css";

function bodyClass(loaded: boolean, className?: string): string | undefined {
  if (loaded) return className;
  return className ? `${className} ${topicKit.pending}` : topicKit.pending;
}

export function NextBand({ no, loaded, steps }: { no: string; loaded: boolean; steps: NextStep[] }) {
  return (
    <Band
      no={no}
      id="next-h"
      sectionId="next"
      label="What to do next"
      title="Pick up the next small thing"
      sub="Worth a few minutes right now, from what you have read, what is due and what you marked shaky."
    >
      <div className={bodyClass(loaded)}>
        <Steps label="Next steps" count={steps.length}>
          {steps.map((step, k) => (
            <Step key={step.key} no={k + 1} title={step.title} body={step.body} href={step.href} action={step.action} />
          ))}
        </Steps>
      </div>
    </Band>
  );
}

function Heatmap({ days }: { days: DayCount[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const { weeks, months, active, total } = useMemo(() => buildHeat(days), [days]);
  const cols = { gridTemplateColumns: `repeat(${weeks.length || 52}, 1fr)` };
  useScrollRegions(scroller, weeks);

  return (
    <div className={`${kit.paper} ${styles.heat}`}>
      <Tape rot={-3} />
      <div ref={scroller} className={styles.heatScroll} data-scroll-region="Activity over the last year">
        <div className={styles.heatMonths} style={cols}>
          {months.map((m) => (
            <span key={`${m.at}-${m.label}`} style={{ gridColumnStart: m.at + 1 }}>
              {m.label}
            </span>
          ))}
        </div>
        <div className={styles.heatGrid} style={cols}>
          {weeks.map((week, wi) => (
            <div key={wi} className={styles.heatWeek}>
              {week.map((cell, di) =>
                cell ? (
                  <span
                    key={cell.day}
                    data-l={heatLevel(cell.count)}
                    title={`${cell.day}: ${plural(cell.count, "thing")} done`}
                  />
                ) : (
                  <span key={`p${di}`} data-pad />
                )
              )}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.heatFoot}>
        <span>
          <b>{total}</b> things done on <b>{active}</b> days this year
        </span>
        <span className={styles.legend} aria-hidden="true">
          less
          <svg viewBox="0 0 60 16" className={styles.legendArrow}>
            <path d="M3 9 C 14 3, 24 14, 38 7 S 50 6, 56 8" />
            <path d="M49 3 L 57 8 L 50 13" />
          </svg>
          {[0, 1, 2, 3, 4].map((level) => (
            <span key={level} data-l={level} style={{ "--k": level } as React.CSSProperties} />
          ))}
          more
        </span>
      </div>
      {total === 0 && (
        <p className={styles.heatEmpty}>Nothing here yet. Read a chapter or solve an exercise and today lights up.</p>
      )}
    </div>
  );
}

function Week({ days }: { days: DayCount[] }) {
  const week = days.slice(-7);
  const peak = Math.max(1, ...week.map((d) => d.count));
  return (
    <figure className={`${kit.sticky} ${styles.week}`} aria-label="Things done in the last seven days">
      <Tape rot={3} />
      <figcaption>
        <CardKicker>This week</CardKicker>
      </figcaption>
      <div className={styles.weekBars}>
        {week.map((d, k) => (
          <div key={d.day} data-today={k === week.length - 1 || undefined}>
            <span className={styles.weekBar} style={{ height: `${(d.count / peak) * 100}%` }} />
            <span>{dayDate(d.day).toLocaleDateString(undefined, { weekday: "narrow" })}</span>
          </div>
        ))}
      </div>
      <p className={styles.weekTotal}>
        <b>{weekTotal(days)}</b> this week
      </p>
    </figure>
  );
}

export function ActivityBand({ no, loaded, days }: { no: string; loaded: boolean; days: DayCount[] }) {
  const active = days.filter((d) => d.count > 0).length;
  return (
    <Band
      no={no}
      id="act-h"
      sectionId="activity"
      label="Activity"
      title="The last year"
      count={loaded ? plural(active, "active day") : undefined}
    >
      <div className={bodyClass(loaded, styles.activity)}>
        <Heatmap days={days} />
        <Week days={days} />
      </div>
    </Band>
  );
}

export function TopicsBand({ no, loaded, rows }: { no: string; loaded: boolean; rows: TopicRow[] }) {
  const started = rows.filter((t) => t.n > 0).length;
  return (
    <Band
      no={no}
      id="topics-h"
      sectionId="topics"
      label="By topic"
      title="Topic by topic"
      sub="Chapters you marked as read, out of the ones written so far."
      count={loaded ? `${started} of ${rows.length} started` : undefined}
    >
      <div className={bodyClass(loaded)}>
        <List columns>
          {rows.map((t) => (
            <Row
              key={t.id}
              code={t.mark}
              title={t.name}
              sub={`${t.n} of ${t.ids.length} chapters`}
              href={t.href}
              done={t.n === t.ids.length}
              end={
                <span className={styles.rowMeter}>
                  <ProgressMeter done={t.n} total={t.ids.length} label={`${t.pct}%`} />
                </span>
              }
            />
          ))}
        </List>
      </div>
    </Band>
  );
}

export function InterviewBand({
  no,
  loaded,
  rounds,
  counts,
}: {
  no: string;
  loaded: boolean;
  rounds: { n: number; total: number };
  counts: Confidence;
}) {
  const marked = counts.knew + counts.shaky + counts.blank;
  const weak = counts.shaky + counts.blank;
  return (
    <Band
      no={no}
      id="int-h"
      sectionId="interview"
      label="Interview answers"
      title="How your answers feel"
      count={loaded && marked ? `${marked} marked` : undefined}
    >
      <div className={bodyClass(loaded, styles.interview)}>
        <div className={`${kit.paper} ${styles.rounds}`}>
          <Tape rot={-4} />
          <CardKicker>The interview book</CardKicker>
          <p className={styles.big}>
            <b>{rounds.n}</b> <small>of {rounds.total} rounds read</small>
          </p>
          <ProgressMeter
            done={rounds.n}
            total={rounds.total}
            label={`${Math.round((rounds.n / Math.max(1, rounds.total)) * 100)}%`}
          />
          <Link href="/interview" className={topicKit.stepLink}>
            Open the book →
          </Link>
        </div>
        <div className={`${kit.paper} ${styles.marks}`}>
          <CardKicker>Your marks</CardKicker>
          {marked === 0 ? (
            <p className={styles.marksEmpty}>
              Nothing marked yet. Open any round in the <Link href="/interview">interview book</Link>, switch to
              practice mode and mark each answer honestly.
            </p>
          ) : (
            <>
              <div className={styles.confBar} aria-hidden="true">
                <span data-c="knew" style={{ flexGrow: counts.knew }} />
                <span data-c="shaky" style={{ flexGrow: counts.shaky }} />
                <span data-c="blank" style={{ flexGrow: counts.blank }} />
              </div>
              <div className={styles.confLegend}>
                <span data-c="knew">
                  <b>{counts.knew}</b> knew it
                </span>
                <span data-c="shaky">
                  <b>{counts.shaky}</b> shaky
                </span>
                <span data-c="blank">
                  <b>{counts.blank}</b> blank
                </span>
              </div>
              {weak > 0 && (
                <Link href="/interview/questions?filter=shaky" className={topicKit.stepLink}>
                  Drill the {weak} weak ones →
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </Band>
  );
}

export function BadgesBand({
  no,
  loaded,
  stats,
  wall,
  earned,
  next,
}: {
  no: string;
  loaded: boolean;
  stats: Stats;
  wall: Badge[];
  earned: ReadonlySet<string>;
  next: Badge | null;
}) {
  return (
    <Band
      no={no}
      id="badge-h"
      sectionId="badges"
      label="Badges"
      title="The badge wall"
      sub="Earned ones are stuck on. The rest show what it takes."
      count={loaded ? `${earned.size} of ${BADGES.length}` : undefined}
    >
      <ul className={bodyClass(loaded, styles.wall)}>
        {wall.map((b) => {
          const got = earned.has(b.id);
          const standing = badgeStanding(b, stats);
          return (
            <li
              key={b.id}
              className={styles.badge}
              data-earned={got || undefined}
              data-next={b.id === next?.id || undefined}
            >
              {got && <span className={kit.tape} aria-hidden="true" />}
              <span className={styles.medal} aria-hidden="true">
                {b.icon}
              </span>
              <b className={styles.badgeName}>
                <span className={topicKit.sr}>{got ? "Earned: " : "Not yet: "}</span>
                {b.name}
              </b>
              <p className={styles.badgeHow}>{b.description}</p>
              {!got && (
                <span className={styles.badgeProgress}>
                  <span className={styles.miniTrack}>
                    <span style={{ width: `${standing.ratio * 100}%` }} />
                  </span>
                  <span>{standing.label}</span>
                </span>
              )}
              {b.id === next?.id && <span className={`${topicKit.soon} ${styles.nextTag}`}>next up</span>}
            </li>
          );
        })}
      </ul>
    </Band>
  );
}

export function JokeNote() {
  const ref = useRef<HTMLDivElement>(null);
  const [joke, setJoke] = useState<string | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      fetch("/api/joke")
        .then((r) => r.json())
        .then((d) => {
          if (!cancelled && typeof d.text === "string") setJoke(d.text);
        })
        .catch(() => {});
    });
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, []);
  return (
    <Wrap>
      <div className={`${kit.sticky} ${styles.joke}`} ref={ref}>
        <Tape rot={-3} />
        <CardKicker>☕ a dev joke, for the streak</CardKicker>
        <p>{joke ?? "…"}</p>
      </div>
    </Wrap>
  );
}
