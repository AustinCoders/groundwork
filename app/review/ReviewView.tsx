"use client";

import Link from "next/link";
import { useMemo } from "react";
import { PageFrame } from "@/components/frame/PageFrame";
import { useConfidence } from "@/lib/interviewConfidence";
import { useClientValue, useProgressValue } from "@/lib/hooks";
import { plural } from "@/lib/format";
import { dueAt, progress, REVIEW_GAPS_DAYS, type ChapterMark } from "@/lib/storage";
import styles from "@/components/frame/dash.module.css";

export interface ReviewChapter {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  topicName: string;
  href: string;
}

const DAY = 24 * 60 * 60 * 1000;

const GAP_LABEL = ["3 days", "1 week", "3 weeks", "2 months", "6 months"];

const LINKS = [
  { href: "/review", label: "Review" },
  { href: "/progress", label: "Progress" },
];

interface Row {
  ch: ReviewChapter;
  mark: ChapterMark;
  due: number | null;
}

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

function whenLabel(due: number, today: number): string {
  const days = Math.round((startOfDay(due) - today) / DAY);
  if (days <= 0) {
    const late = -days;
    return late === 0 ? "due today" : `${plural(late, "day")} overdue`;
  }
  if (days === 1) return "tomorrow";
  return new Date(due).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

export function ReviewView({ chapters }: { chapters: ReviewChapter[] }) {
  const marksKey = useProgressValue(() => JSON.stringify(progress.all().chapters), "");
  const conf = useConfidence();
  const now = useClientValue(thisMinute, 0);
  const ready = marksKey !== "";

  const { due, upcoming, read, reviews, finished } = useMemo(() => {
    const marks = (marksKey ? JSON.parse(marksKey) : {}) as Record<string, true | ChapterMark>;
    const rows: Row[] = chapters
      .filter((ch) => marks[ch.id])
      .map((ch) => {
        const mark = markOf(marks[ch.id]);
        return { ch, mark, due: dueAt(marks[ch.id]) };
      });
    return {
      read: rows.length,
      reviews: rows.reduce((n, r) => n + r.mark.reviews, 0),
      finished: rows.filter((r) => r.due === null).length,
      due: rows.filter((r) => r.due !== null && r.due <= now).sort((a, b) => a.due! - b.due!),
      upcoming: rows
        .filter((r) => r.due !== null && r.due > now)
        .sort((a, b) => a.due! - b.due!)
        .slice(0, 12),
    };
  }, [marksKey, chapters, now]);

  const today = startOfDay(now);
  const weekOut = upcoming.filter((r) => r.due! - today < 7 * DAY).length;
  const shaky = Object.values(conf).filter((c) => c !== "knew").length;

  return (
    <PageFrame
      title="Review"
      links={LINKS}
      skipLabel="Skip to the review list"
      scan={`${due.length}:${upcoming.length}`}
    >
      <section className={styles.hero}>
        <div data-fx="stagger">
          <p className={styles.eyebrow}>Spaced review</p>
          <h1 className={styles.h1}>
            {!ready ? (
              "What to read again."
            ) : due.length > 0 ? (
              <>
                <span className={styles.accent}>{plural(due.length, "chapter")}</span> to look at again today.
              </>
            ) : read > 0 ? (
              "Nothing due. Everything you read is still fresh."
            ) : (
              "Read something first, and it comes back here."
            )}
          </h1>
          <p className={styles.lead}>
            A chapter you finish comes back after 3 days, then a week, three weeks, two months and six months. Each time
            you skim it and mark it reviewed, the gap gets longer. That is what turns reading into something you can
            still recall in the room.
          </p>
        </div>
        <dl className={styles.stats} data-fx="right">
          <div>
            <dt>due now</dt>
            <dd>{due.length}</dd>
          </div>
          <div>
            <dt>due this week</dt>
            <dd>{weekOut}</dd>
          </div>
          <div>
            <dt>chapters read</dt>
            <dd>{read}</dd>
          </div>
          <div>
            <dt>reviews done</dt>
            <dd>{reviews}</dd>
          </div>
        </dl>
      </section>

      <ol className={styles.ladder} aria-label="How the gaps grow" data-fx="stagger">
        <li>
          <b>Read</b>
          <span>day 0</span>
        </li>
        {GAP_LABEL.map((g, i) => (
          <li key={g}>
            <b>Review {i + 1}</b>
            <span>after {g}</span>
          </li>
        ))}
        <li data-done>
          <b>Kept</b>
          <span>{finished} so far</span>
        </li>
      </ol>

      {due.length > 0 && (
        <section className={styles.block} aria-labelledby="due-h">
          <div className={styles.blockHead}>
            <h2 id="due-h" className={styles.h2}>
              Due now
            </h2>
            <p>Skim it, then mark it reviewed. That pushes it to the next, longer gap.</p>
          </div>
          <ol className={styles.dueList}>
            {due.map((r, i) => (
              <li key={r.ch.id} className={styles.dueCard} data-fx="up" style={{ "--d": i % 4 } as React.CSSProperties}>
                <div className={styles.dueTop}>
                  <span className={styles.topic}>{r.ch.topicName}</span>
                  <span className={styles.late}>{whenLabel(r.due!, today)}</span>
                </div>
                <div className={styles.dueMain}>
                  <span className={styles.num}>{r.ch.num}</span>
                  <div>
                    <h3>{r.ch.title}</h3>
                    {r.ch.subtitle && <p>{r.ch.subtitle}</p>}
                  </div>
                </div>
                <div className={styles.dueFoot}>
                  <span
                    className={styles.stage}
                    aria-label={`Review ${r.mark.reviews + 1} of ${REVIEW_GAPS_DAYS.length}`}
                  >
                    {REVIEW_GAPS_DAYS.map((_, k) => (
                      <i
                        key={k}
                        data-on={k < r.mark.reviews || undefined}
                        data-now={k === r.mark.reviews || undefined}
                      />
                    ))}
                  </span>
                  <Link href={r.ch.href} className={styles.ghost}>
                    Read it again
                  </Link>
                  <button type="button" className={styles.btn} onClick={() => progress.markReviewed(r.ch.id)}>
                    ✓ Reviewed
                  </button>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {ready && due.length === 0 && (
        <section className={styles.empty} data-fx="scale">
          <span aria-hidden="true">{read ? "🌿" : "📖"}</span>
          <h2 className={styles.h2}>{read ? "All caught up." : "Nothing to review yet."}</h2>
          <p>
            {read
              ? "Come back when something is due. Meanwhile, read one new chapter."
              : "Tick “Mark as read” at the end of any chapter and it starts its review schedule here."}
          </p>
          <Link href="/" className={styles.btn}>
            Find a chapter to read →
          </Link>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className={styles.block} aria-labelledby="next-h">
          <div className={styles.blockHead}>
            <h2 id="next-h" className={styles.h2}>
              Coming up
            </h2>
            <p>The next chapters to come back, and when.</p>
          </div>
          <ul className={styles.upList} data-fx="stagger">
            {upcoming.map((r) => (
              <li key={r.ch.id}>
                <span className={styles.when}>{whenLabel(r.due!, today)}</span>
                <Link href={r.ch.href}>{r.ch.title}</Link>
                <span className={styles.topic}>{r.ch.topicName}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {shaky > 0 && (
        <section className={styles.callout} data-fx="up">
          <div>
            <b>{plural(shaky, "interview answer")} marked shaky or blank.</b>
            <p>Those come back through the question bank, as flashcards.</p>
          </div>
          <Link href="/interview/questions?filter=shaky" className={styles.btn}>
            Drill them →
          </Link>
        </section>
      )}
    </PageFrame>
  );
}
