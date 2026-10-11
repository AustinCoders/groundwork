"use client";

import Link from "next/link";
import { Copy, Note, Scene, Stage, StageCard, Sticker, Tape } from "@/components/home/Stage";
import {
  Actions,
  Button,
  CardKicker,
  Chips,
  Facts,
  Heading,
  Kicker,
  Lead,
  Underlined,
  topicKit,
} from "@/components/topic/TopicKit";
import { plural } from "@/lib/format";
import { REVIEW_GAPS_DAYS } from "@/lib/storage";
import { GAP_LABELS, SHORT_GAPS, lateness, minutesFor, whenLabel, type ReviewRow } from "./reviewModel";
import { StageDots } from "./StageDots";
import styles from "./review.module.css";

const LONGEST_GAP = Math.sqrt(REVIEW_GAPS_DAYS[REVIEW_GAPS_DAYS.length - 1]);

export interface ReviewNumbers {
  due: number;
  scheduled: number;
  read: number;
  kept: number;
}

function Next({ loaded, featured, now }: { loaded: boolean; featured: ReviewRow | null; now: number }) {
  const isDue = featured !== null && featured.due !== null && featured.due <= now;
  return (
    <StageCard
      as="aside"
      aria-label="Next up"
      rot={-1.4}
      depth={-6}
      i={0}
      still
      className={loaded ? styles.next : `${styles.next} ${topicKit.pending}`}
    >
      <Tape rot={-4} />
      {featured ? (
        <>
          <CardKicker>{isDue ? "Due first" : "Comes back next"}</CardKicker>
          <Link href={featured.ch.href} className={styles.nextTitle}>
            {featured.ch.title}
          </Link>
          <p className={styles.nextMeta}>
            {featured.ch.topicName} · {featured.ch.num} ·{" "}
            {isDue ? lateness(featured.due!, now) : whenLabel(featured.due!, now)}
          </p>
          <div className={styles.nextFoot}>
            <StageDots reviews={featured.mark.reviews} />
            <Link href={featured.ch.href} className={styles.nextOpen}>
              Open the chapter ↗
            </Link>
          </div>
        </>
      ) : (
        <>
          <CardKicker>How it starts</CardKicker>
          <p className={styles.nextTitle}>Read a chapter, tick it done.</p>
          <p className={styles.nextMeta}>{GAP_LABELS[0]} later it comes back here, just before you would forget it.</p>
        </>
      )}
    </StageCard>
  );
}

function Numbers({ loaded, numbers }: { loaded: boolean; numbers: ReviewNumbers }) {
  return (
    <StageCard
      as="aside"
      aria-label="Your numbers"
      rot={1.8}
      depth={14}
      i={1}
      still
      className={loaded ? styles.numbers : `${styles.numbers} ${topicKit.pending}`}
    >
      <CardKicker>Your numbers</CardKicker>
      <Facts
        items={[
          { value: numbers.due, label: "due today" },
          { value: numbers.scheduled, label: "scheduled" },
          { value: numbers.read, label: "read so far" },
          { value: numbers.kept, label: "kept for good" },
        ]}
      />
    </StageCard>
  );
}

function stickerFor(numbers: ReviewNumbers): { text: string; tone: "success" | "caution" | "info" } {
  if (numbers.due > 0) return { text: `↻ ${numbers.due} due`, tone: "caution" };
  if (numbers.read > 0) return { text: "✓ caught up", tone: "success" };
  return { text: "↻ new here", tone: "info" };
}

export function ReviewHero({
  loaded,
  now,
  numbers,
  featured,
  nextDay,
  shaky,
  onStart,
}: {
  loaded: boolean;
  now: number;
  numbers: ReviewNumbers;
  featured: ReviewRow | null;
  nextDay: string | null;
  shaky: number;
  onStart: () => void;
}) {
  const { due, read } = numbers;
  const sticker = stickerFor(numbers);
  const pending = loaded ? undefined : topicKit.pending;
  return (
    <Scene className={topicKit.hero}>
      <Copy>
        <Kicker mark="↻">Spaced review · today</Kicker>
        <div className={pending}>
          <Heading id="review-title">
            {due > 0 ? (
              <>
                {due} {due === 1 ? "chapter is" : "chapters are"} <Underlined>due today.</Underlined>
              </>
            ) : read > 0 ? (
              <>
                Nothing is <Underlined>due</Underlined> today.
              </>
            ) : (
              <>
                Nothing to <Underlined>review</Underlined> yet.
              </>
            )}
          </Heading>
          <Lead>
            {due > 0
              ? `About ${plural(minutesFor(due), "minute")}. Recall first, then skim to check, and each one moves to a longer gap.`
              : read > 0
                ? nextDay
                  ? `Everything you have read is still fresh. The next one comes back ${nextDay}.`
                  : "Everything you have read is still fresh, and the rest is kept for good."
                : "Finish a chapter and it starts coming back here, just before you would forget it."}
          </Lead>
          <Actions>
            {due > 0 ? (
              <button type="button" className={topicKit.btn} onClick={onStart}>
                Start reviewing
              </button>
            ) : (
              <Button href="/">Find something to read →</Button>
            )}
            <Button href="#spacing" ghost>
              {read > 0 ? "See the schedule" : "How the spacing works"}
            </Button>
          </Actions>
          <Chips>
            {read > 0 && <span className={topicKit.chip}>{plural(read, "chapter")} read</span>}
            {due > 0 && <span className={topicKit.chip}>about {plural(minutesFor(due), "minute")}</span>}
            {shaky > 0 && (
              <Link href="/interview/questions?filter=shaky" className={topicKit.chip}>
                {plural(shaky, "shaky interview answer")}
              </Link>
            )}
            {read === 0 && <span className={topicKit.chip}>nothing is stored off this device</span>}
          </Chips>
        </div>
      </Copy>
      <Stage live hostClassName={topicKit.stageHost} className={styles.stage}>
        <Next loaded={loaded} featured={featured} now={now} />
        <Numbers loaded={loaded} numbers={numbers} />
        <StageCard decor extra rot={-2} depth={10} i={2} className={styles.spacing}>
          <CardKicker>Gaps grow</CardKicker>
          <ol className={styles.steps}>
            {REVIEW_GAPS_DAYS.map((days, k) => (
              <li key={days}>
                <span
                  className={styles.step}
                  style={{ "--grow": Math.sqrt(days) / LONGEST_GAP } as React.CSSProperties}
                />
                <b>{SHORT_GAPS[k]}</b>
              </li>
            ))}
          </ol>
        </StageCard>
        <Sticker
          rot={-7}
          depth={20}
          tone={sticker.tone}
          className={loaded ? styles.sticker : `${styles.sticker} ${topicKit.pending}`}
        >
          {sticker.text}
        </Sticker>
        <Note arrow="dl" rot={-3} depth={12} className={styles.note}>
          just before you forget
        </Note>
      </Stage>
    </Scene>
  );
}
