"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageFrame } from "@/components/frame/PageFrame";
import { Confetti } from "@/components/practice/Confetti";
import { useConfidence } from "@/lib/interviewConfidence";
import { useClientValue, useProgressValue } from "@/lib/hooks";
import { plural } from "@/lib/format";
import { dueAt, progress, REVIEW_GAPS_DAYS, type ChapterMark } from "@/lib/storage";
import styles from "./review.module.css";

export interface ReviewChapter {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  topicName: string;
  href: string;
}

interface Row {
  ch: ReviewChapter;
  mark: ChapterMark;
  due: number | null;
}

const DAY = 24 * 60 * 60 * 1000;
const GAPS = ["3 days", "1 week", "3 weeks", "2 months", "6 months"];
const LINKS = [
  { href: "/review", label: "Review" },
  { href: "/progress", label: "Progress" },
];

function markOf(v: true | ChapterMark): ChapterMark {
  return v === true ? { at: 0, reviews: 0 } : v;
}

function startOfDay(t: number): number {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function thisMinute(): number {
  return Math.floor(Date.now() / 60000) * 60000;
}

function lateness(due: number, today: number): string {
  const days = Math.round((today - startOfDay(due)) / DAY);
  return days <= 0 ? "due today" : `${plural(days, "day")} overdue`;
}

function Stage({ reviews }: { reviews: number }) {
  return (
    <span className={styles.stage} aria-label={`Review ${reviews + 1} of ${REVIEW_GAPS_DAYS.length}`}>
      {REVIEW_GAPS_DAYS.map((_, k) => (
        <i key={k} data-on={k < reviews || undefined} data-now={k === reviews || undefined} />
      ))}
    </span>
  );
}

function Session({ rows, today, onExit }: { rows: Row[]; today: number; onExit: () => void }) {
  const [queue] = useState(rows);
  const [i, setI] = useState(0);
  const [kept, setKept] = useState(0);
  const r = queue[i];

  if (!r) {
    return (
      <section className={styles.sessionDone} aria-live="polite">
        <Confetti fire={kept > 0} />
        <span aria-hidden="true">🌿</span>
        <h2>Session done.</h2>
        <p>
          {kept} of {queue.length} pushed to their next, longer gap. The rest wait for you here.
        </p>
        <button type="button" className={styles.primary} onClick={onExit}>
          Back to review
        </button>
      </section>
    );
  }

  const next = () => setI((n) => n + 1);

  return (
    <section className={styles.session} aria-label="Review session">
      <div className={styles.sessionTop}>
        <span>
          {i + 1} of {queue.length}
        </span>
        <span className={styles.sessionBar}>
          <span style={{ width: `${(i / queue.length) * 100}%` }} />
        </span>
        <button type="button" className={styles.link} onClick={onExit}>
          End session
        </button>
      </div>
      <article className={styles.focusCard} key={r.ch.id}>
        <div className={styles.focusMeta}>
          <span className={styles.topic}>{r.ch.topicName}</span>
          <span className={styles.late}>{lateness(r.due!, today)}</span>
        </div>
        <span className={styles.focusNum}>{r.ch.num}</span>
        <h2 className={styles.focusTitle}>{r.ch.title}</h2>
        {r.ch.subtitle && <p className={styles.focusSub}>{r.ch.subtitle}</p>}
        <div className={styles.prompt}>
          <b>Before you open it:</b> say out loud the two or three ideas this chapter is about. Then skim to check.
        </div>
        <div className={styles.focusFoot}>
          <Stage reviews={r.mark.reviews} />
          <Link href={r.ch.href} target="_blank" className={styles.ghost}>
            Open the chapter ↗
          </Link>
        </div>
        <div className={styles.verdict}>
          <button
            type="button"
            className={styles.primary}
            onClick={() => {
              progress.markReviewed(r.ch.id);
              setKept((k) => k + 1);
              next();
            }}
          >
            ✓ I still had it
          </button>
          <button type="button" className={styles.ghost} onClick={next}>
            Not yet, keep it due
          </button>
        </div>
      </article>
    </section>
  );
}

export function ReviewView({ chapters }: { chapters: ReviewChapter[] }) {
  const marksKey = useProgressValue(() => JSON.stringify(progress.all().chapters), "");
  const now = useClientValue(thisMinute, 0);
  const conf = useConfidence();
  const [session, setSession] = useState(false);
  const loaded = marksKey !== "" && now > 0;

  const { due, upcoming, read, kept } = useMemo(() => {
    const marks = (marksKey ? JSON.parse(marksKey) : {}) as Record<string, true | ChapterMark>;
    const rows: Row[] = chapters
      .filter((ch) => marks[ch.id])
      .map((ch) => ({ ch, mark: markOf(marks[ch.id]), due: dueAt(marks[ch.id]) }));
    return {
      read: rows.length,
      kept: rows.filter((r) => r.due === null).length,
      due: rows.filter((r) => r.due !== null && r.due <= now).sort((a, b) => a.due! - b.due!),
      upcoming: rows.filter((r) => r.due !== null && r.due > now).sort((a, b) => a.due! - b.due!),
    };
  }, [marksKey, chapters, now]);

  const today = startOfDay(now);
  const forecast = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, k) => ({ t: today + k * DAY, n: 0 }));
    days[0].n = due.length;
    upcoming.forEach((r) => {
      const k = Math.round((startOfDay(r.due!) - today) / DAY);
      if (k >= 0 && k < 14) days[k].n++;
    });
    return days;
  }, [due, upcoming, today]);
  const peak = Math.max(1, ...forecast.map((d) => d.n));
  const shaky = Object.values(conf).filter((c) => c !== "knew").length;

  if (session) {
    return (
      <PageFrame title="Review" links={LINKS} skipLabel="Skip to the review session" scan="session">
        <Session rows={due} today={today} onExit={() => setSession(false)} />
      </PageFrame>
    );
  }

  return (
    <PageFrame
      title="Review"
      links={LINKS}
      skipLabel="Skip to the review list"
      scan={`${due.length}:${upcoming.length}`}
    >
      <section className={styles.hero}>
        <div className={styles.heroCopy} data-fx="stagger">
          <p className={styles.eyebrow}>Spaced review · today</p>
          <h1 className={styles.bigCount}>
            <b>{loaded ? due.length : "–"}</b>{" "}
            <span>{due.length === 1 ? "chapter" : "chapters"} to look at again today</span>
          </h1>
          <p className={styles.lead}>
            {!loaded
              ? "Checking what is due…"
              : due.length
                ? `About ${Math.max(2, due.length * 3)} minutes. Recall first, then skim to check, and each one moves to a longer gap.`
                : read
                  ? "Nothing due. Everything you have read is still fresh."
                  : "Finish a chapter and it starts coming back here, just before you would forget it."}
          </p>
          <div className={styles.actions}>
            {due.length > 0 ? (
              <button type="button" className={styles.primary} onClick={() => setSession(true)}>
                Start the session →
              </button>
            ) : (
              <Link href="/" className={styles.primary}>
                Find something to read →
              </Link>
            )}
            {shaky > 0 && (
              <Link href="/interview/questions?filter=shaky" className={styles.ghost}>
                {plural(shaky, "shaky interview answer")}
              </Link>
            )}
          </div>
        </div>
        <figure className={styles.chart} data-fx="right" aria-label="Chapters coming back over the next two weeks">
          <figcaption>The next two weeks</figcaption>
          <div className={styles.bars}>
            {forecast.map((d, k) => (
              <div key={d.t} className={styles.barCol} data-today={k === 0 || undefined}>
                <span className={styles.barNum}>{d.n || ""}</span>
                <span className={styles.bar} style={{ height: `${(d.n / peak) * 100}%` }} />
                <span className={styles.barDay}>
                  {k === 0 ? "now" : new Date(d.t).toLocaleDateString(undefined, { weekday: "narrow" })}
                </span>
              </div>
            ))}
          </div>
          <div className={styles.chartFoot}>
            <span>
              <b>{read}</b> read
            </span>
            <span>
              <b>{upcoming.length}</b> scheduled
            </span>
            <span>
              <b>{kept}</b> kept for good
            </span>
          </div>
        </figure>
      </section>

      {due.length > 0 && (
        <section className={styles.block} aria-labelledby="due-h">
          <h2 id="due-h" className={styles.h2}>
            Due now
          </h2>
          <ol className={styles.rows}>
            {due.map((r, k) => (
              <li key={r.ch.id} data-fx="up" style={{ "--d": k % 5 } as React.CSSProperties}>
                <span className={styles.rowNum}>{r.ch.num}</span>
                <span className={styles.rowMain}>
                  <Link href={r.ch.href}>{r.ch.title}</Link>
                  <span>
                    {r.ch.topicName} · {lateness(r.due!, today)}
                  </span>
                </span>
                <Stage reviews={r.mark.reviews} />
                <button type="button" className={styles.tick} onClick={() => progress.markReviewed(r.ch.id)}>
                  ✓ Reviewed
                </button>
              </li>
            ))}
          </ol>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className={styles.block} aria-labelledby="next-h">
          <h2 id="next-h" className={styles.h2}>
            Coming back soon
          </h2>
          <ol className={styles.rows}>
            {upcoming.slice(0, 8).map((r) => (
              <li key={r.ch.id}>
                <span className={styles.when}>
                  {Math.round((startOfDay(r.due!) - today) / DAY) === 1
                    ? "tomorrow"
                    : new Date(r.due!).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                </span>
                <span className={styles.rowMain}>
                  <Link href={r.ch.href}>{r.ch.title}</Link>
                  <span>{r.ch.topicName}</span>
                </span>
                <Stage reviews={r.mark.reviews} />
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className={styles.explain} data-fx="up" aria-labelledby="how-h">
        <h2 id="how-h">How the gaps grow</h2>
        <ol>
          <li>
            <b>Read</b>
            <span>day 0</span>
          </li>
          {GAPS.map((g, k) => (
            <li key={g}>
              <b>Review {k + 1}</b>
              <span>after {g}</span>
            </li>
          ))}
          <li data-kept>
            <b>Kept</b>
            <span>for good</span>
          </li>
        </ol>
        <p>
          Each review you pass pushes the chapter to the next gap. Five reviews and it is yours; it stops coming back.
        </p>
      </section>
    </PageFrame>
  );
}
