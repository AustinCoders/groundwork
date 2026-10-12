"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { Tape } from "@/components/home/Stage";
import { kit as menuKit } from "@/components/ui/MenuKit";
import { Band, Button, CardKicker, List, Step, Steps, topicKit } from "@/components/topic/TopicKit";
import { plural } from "@/lib/format";
import { REVIEW_GAPS_DAYS } from "@/lib/storage";
import { agoLabel, dayHeading, GAP_LABELS, groupByDay, lateness, whenLabel, type ReviewRow } from "./reviewModel";
import { StageDots } from "./StageDots";
import kit from "@/app/mock/mockKit.module.css";
import styles from "./bands.module.css";

const SCHEDULE_PREVIEW = 12;
const RECENT_LIMIT = 6;

function Sr({ children }: { children: string }) {
  return <span className={topicKit.sr}>{children}</span>;
}

function Topic({ children }: { children: string }) {
  return <span className={kit.kindTag}>{children}</span>;
}

export function DueBand({
  no,
  rows,
  again,
  clearedNow,
  nextRow,
  now,
  onRemember,
  onAgain,
  onUndo,
}: {
  no: string;
  rows: ReviewRow[];
  again: ReadonlySet<string>;
  clearedNow: number;
  nextRow: ReviewRow | null;
  now: number;
  onRemember: (id: string) => void;
  onAgain: (id: string) => void;
  onUndo: (id: string) => void;
}) {
  const waiting = rows.filter((r) => !again.has(r.ch.id));
  const ordered = [...waiting, ...rows.filter((r) => again.has(r.ch.id))];
  const cleared = rows.length === 0;
  return (
    <Band
      no={no}
      id="due-h"
      sectionId="due"
      label="Do these today"
      title="Due now"
      count={cleared ? "all done" : `${waiting.length} to go`}
      sub={
        cleared
          ? undefined
          : "Say the idea out loud first, then open the chapter to check. I remember pushes it to a longer gap; Again keeps it due."
      }
    >
      {cleared ? (
        <div className={`${kit.paper} ${styles.doneCard}`} role="status">
          <Tape rot={-3} />
          <span className={kit.stamp} aria-hidden="true">
            <b>All done</b>
            <small>{plural(clearedNow, "review")}</small>
          </span>
          <div className={styles.doneText}>
            <p className={styles.doneTitle}>You are caught up.</p>
            <p className={styles.doneSub}>
              {nextRow
                ? `Next up is ${nextRow.ch.title}, back ${whenLabel(nextRow.due!, now)}.`
                : "Everything you have read is kept for good."}
            </p>
            <div className={styles.doneActions}>
              <Button href="/">Read something new →</Button>
              <Button href="/progress" ghost>
                See your progress
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <List>
          {ordered.map((r) => {
            const isAgain = again.has(r.ch.id);
            return (
              <li key={r.ch.id} className={styles.dueRow} data-again={isAgain || undefined}>
                <span className={`${menuKit.code} ${styles.code}`}>{r.ch.num}</span>
                <span className={styles.text}>
                  <Link href={r.ch.href} className={`${menuKit.title} ${styles.link}`}>
                    {r.ch.title}
                  </Link>
                  <span className={styles.sub}>
                    <Topic>{r.ch.topicName}</Topic>
                    <span>{isAgain ? "still due, read it again" : lateness(r.due!, now)}</span>
                  </span>
                </span>
                <StageDots reviews={r.mark.reviews} />
                <span className={styles.actions}>
                  {isAgain ? (
                    <>
                      <Link href={r.ch.href} className={`${kit.btn} ${styles.act}`}>
                        Open it ↗<Sr>{`: ${r.ch.title}`}</Sr>
                      </Link>
                      <button
                        type="button"
                        className={`${kit.btn} ${kit.btnQuiet} ${styles.act}`}
                        onClick={() => onUndo(r.ch.id)}
                      >
                        Undo<Sr>{`: ${r.ch.title}`}</Sr>
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" className={`${kit.btn} ${styles.act}`} onClick={() => onRemember(r.ch.id)}>
                        I remember<Sr>{`: ${r.ch.title}`}</Sr>
                      </button>
                      <button
                        type="button"
                        className={`${kit.btn} ${kit.btnGhost} ${styles.act}`}
                        onClick={() => onAgain(r.ch.id)}
                      >
                        Again<Sr>{`: ${r.ch.title}`}</Sr>
                      </button>
                    </>
                  )}
                </span>
              </li>
            );
          })}
        </List>
      )}
    </Band>
  );
}

export function ScheduleBand({
  no,
  rows,
  days,
  now,
}: {
  no: string;
  rows: ReviewRow[];
  days: { t: number; n: number }[];
  now: number;
}) {
  const [all, setAll] = useState(false);
  const shown = all ? rows : rows.slice(0, SCHEDULE_PREVIEW);
  const groups = groupByDay(shown);
  const peak = Math.max(1, ...days.map((d) => d.n));
  return (
    <Band
      no={no}
      id="next-h"
      sectionId="schedule"
      label="The schedule"
      title="Coming back soon"
      count={`${rows.length} scheduled`}
    >
      <div className={styles.schedule}>
        <figure className={`${kit.paper} ${styles.forecast}`} aria-label="Chapters coming back over the next two weeks">
          <Tape rot={-4} />
          <figcaption>
            <CardKicker>The next two weeks</CardKicker>
          </figcaption>
          <div className={styles.bars}>
            {days.map((d, k) => (
              <div key={d.t} className={styles.barCol} data-today={k === 0 || undefined}>
                <span className={styles.barNum}>{d.n || ""}</span>
                <span className={styles.bar} style={{ "--h": d.n / peak } as CSSProperties} />
                <span className={styles.barDay}>
                  {k === 0 ? "now" : new Date(d.t).toLocaleDateString(undefined, { weekday: "narrow" })}
                </span>
              </div>
            ))}
          </div>
        </figure>
        <div className={styles.days}>
          {groups.map((g) => (
            <section key={g.start} className={styles.day} aria-label={dayHeading(g.start, now)}>
              <h3 className={styles.dayHead}>
                {dayHeading(g.start, now)}
                <span>{plural(g.rows.length, "chapter")}</span>
              </h3>
              <List>
                {g.rows.map((r) => (
                  <li key={r.ch.id} className={styles.row}>
                    <span className={`${menuKit.code} ${styles.code}`}>{r.ch.num}</span>
                    <span className={styles.text}>
                      <Link href={r.ch.href} className={`${menuKit.title} ${styles.link}`}>
                        {r.ch.title}
                      </Link>
                      <span className={styles.sub}>
                        <Topic>{r.ch.topicName}</Topic>
                      </span>
                    </span>
                    <StageDots reviews={r.mark.reviews} />
                  </li>
                ))}
              </List>
            </section>
          ))}
          {rows.length > SCHEDULE_PREVIEW && (
            <button
              type="button"
              className={`${kit.btn} ${kit.btnGhost} ${styles.more}`}
              aria-expanded={all}
              onClick={() => setAll(!all)}
            >
              {all ? "Show fewer" : `Show all ${rows.length}`}
            </button>
          )}
        </div>
      </div>
    </Band>
  );
}

export function RecentBand({ no, rows, now }: { no: string; rows: ReviewRow[]; now: number }) {
  return (
    <Band
      no={no}
      id="recent-h"
      sectionId="recent"
      label="Looking back"
      title="Recently reviewed"
      count={`${rows.length} so far`}
    >
      <List>
        {rows.slice(0, RECENT_LIMIT).map((r) => (
          <li key={r.ch.id} className={styles.row}>
            <span className={`${menuKit.code} ${styles.code}`}>{r.ch.num}</span>
            <span className={styles.text}>
              <Link href={r.ch.href} className={`${menuKit.title} ${styles.link}`}>
                {r.ch.title}
              </Link>
              <span className={styles.sub}>
                <Topic>{r.ch.topicName}</Topic>
                <span>reviewed {agoLabel(r.mark.at, now)}</span>
              </span>
            </span>
            {r.due === null ? (
              <span className={styles.keptTag}>kept for good</span>
            ) : (
              <StageDots reviews={r.mark.reviews} />
            )}
          </li>
        ))}
      </List>
    </Band>
  );
}

export function StartBand({ no }: { no: string }) {
  const steps = [
    ["Read a chapter", "Any chapter in any topic, on the site or the interview book."],
    ["Mark it as read", "One tap at the end of the chapter. That starts its clock."],
    [`Come back in ${GAP_LABELS[0]}`, "It lands here, and each pass pushes it to a longer gap."],
  ];
  return (
    <Band no={no} id="start-h" sectionId="start" label="How it starts" title="Reviews begin with a chapter you finish">
      <Steps label="How reviews begin" count={steps.length}>
        {steps.map(([title, body], k) => (
          <Step key={title} no={k + 1} title={title} body={body} />
        ))}
      </Steps>
      <div className={styles.startActions}>
        <Button href="/">Browse the topics →</Button>
      </div>
    </Band>
  );
}

export function SpacingBand({ no }: { no: string }) {
  return (
    <Band
      no={no}
      id="spacing-h"
      sectionId="spacing"
      label="How the spacing works"
      title="Each review pushes it further out"
      sub={`Pass a review and the chapter moves to the next gap. ${plural(REVIEW_GAPS_DAYS.length, "review")} and it is yours; it stops coming back.`}
    >
      <ol className={styles.gaps} aria-label="The gaps between reviews">
        <li className={styles.gap}>
          <span className={styles.gapNo} aria-hidden="true">
            0
          </span>
          <b>Read</b>
          <span>day 0</span>
        </li>
        {GAP_LABELS.map((label, k) => (
          <li key={label} className={styles.gap}>
            <span className={styles.gapNo} aria-hidden="true">
              {k + 1}
            </span>
            <b>Review {k + 1}</b>
            <span>after {label}</span>
          </li>
        ))}
        <li className={styles.gap} data-kept="">
          <span className={styles.gapNo} aria-hidden="true">
            ✓
          </span>
          <b>Kept</b>
          <span>for good</span>
        </li>
      </ol>
    </Band>
  );
}
