"use client";

import Link from "next/link";
import { useState } from "react";
import { Tape } from "@/components/home/Stage";
import { CardKicker, Wrap, topicKit } from "@/components/topic/TopicKit";
import { lateness, type ReviewRow } from "./reviewModel";
import { StageDots } from "./StageDots";
import kit from "@/app/mock/mockKit.module.css";
import styles from "./session.module.css";

export function ReviewSession({
  rows,
  now,
  onRemember,
  onExit,
}: {
  rows: ReviewRow[];
  now: number;
  onRemember: (id: string) => void;
  onExit: () => void;
}) {
  const [queue] = useState(rows);
  const [i, setI] = useState(0);
  const [kept, setKept] = useState(0);
  const row = queue[i];
  const next = () => setI((n) => n + 1);

  if (!row) {
    return (
      <Wrap className={styles.wrap}>
        <section className={`${kit.paper} ${styles.card} ${styles.done}`} aria-live="polite">
          <Tape rot={-3} />
          <span className={kit.stamp} aria-hidden="true">
            <b>Done</b>
            <small>for now</small>
          </span>
          <h2 className={styles.doneTitle}>Session done.</h2>
          <p className={styles.doneText}>
            {kept} of {queue.length} pushed to their next, longer gap. The rest wait for you here.
          </p>
          <button type="button" className={topicKit.btn} onClick={onExit}>
            Back to review
          </button>
        </section>
      </Wrap>
    );
  }

  return (
    <Wrap className={styles.wrap}>
      <section className={styles.session} aria-label="Review session">
        <div className={styles.top}>
          <span className={styles.count}>
            {i + 1} of {queue.length}
          </span>
          <span
            className={styles.bar}
            role="progressbar"
            aria-label="Session progress"
            aria-valuemin={0}
            aria-valuemax={queue.length}
            aria-valuenow={i}
          >
            <span style={{ width: `${(i / queue.length) * 100}%` }} />
          </span>
          <button type="button" className={styles.end} onClick={onExit}>
            End session
          </button>
        </div>
        <article className={`${kit.paper} ${styles.card}`} key={row.ch.id}>
          <Tape rot={-3} />
          <CardKicker>
            {row.ch.topicName} · {lateness(row.due!, now)}
          </CardKicker>
          <p className={styles.num}>{row.ch.num}</p>
          <h2 className={styles.title}>{row.ch.title}</h2>
          {row.ch.subtitle && <p className={styles.sub}>{row.ch.subtitle}</p>}
          <p className={`${kit.sticky} ${styles.prompt}`}>
            <b>Before you open it:</b> say out loud the two or three ideas this chapter is about. Then skim to check.
          </p>
          <div className={styles.foot}>
            <StageDots reviews={row.mark.reviews} />
            <Link href={row.ch.href} target="_blank" className={styles.open}>
              Open the chapter ↗
            </Link>
          </div>
          <div className={styles.verdict}>
            <button
              type="button"
              className={topicKit.btn}
              onClick={() => {
                onRemember(row.ch.id);
                setKept((k) => k + 1);
                next();
              }}
            >
              I remember
            </button>
            <button type="button" className={topicKit.btnGhost} onClick={next}>
              Again
            </button>
          </div>
        </article>
      </section>
    </Wrap>
  );
}
