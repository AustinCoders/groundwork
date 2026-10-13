import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Underlined, topicKit } from "@/components/topic/TopicKit";
import { toneStyle } from "@/components/topic/shell/tone";
import type { ShellTone } from "@/components/topic/shell/types";
import { sizeLine, type BankSummary } from "@/lib/placementBank";
import styles from "./intro.module.css";

export interface IntroPlan {
  level: string;
  tone: ShellTone;
  step: number;
  summary: string;
}

const EXPECT: { id: string; title: string; text: string; icon: ReactNode }[] = [
  {
    id: "timer",
    title: "No timer",
    text: "Take as long as you like on every question.",
    icon: (
      <>
        <circle cx="12" cy="13" r="7.5" />
        <path d="M12 9v4l2.5 2M9.5 3h5M4 4l16 16" />
      </>
    ),
  },
  {
    id: "unsure",
    title: "Not sure is fine",
    text: "Skip any question with Not sure yet. It counts as a miss, nothing more.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1.9-1.1 1.8M12 16.8v.1" />
      </>
    ),
  },
  {
    id: "safe",
    title: "Nothing you've read changes",
    text: "Your ticks, XP and review queue are never touched.",
    icon: (
      <>
        <path d="M12 3l7.5 3v5.5c0 4.6-3.1 8.2-7.5 9.5-4.4-1.3-7.5-4.9-7.5-9.5V6L12 3z" />
        <path d="M8.8 12.2l2.2 2.2 4.2-4.6" />
      </>
    ),
  },
];

function Expect() {
  return (
    <ul className={styles.expect} aria-label="What to expect">
      {EXPECT.map((item) => (
        <li key={item.id} className={styles.expectItem}>
          <svg className={styles.expectIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            {item.icon}
          </svg>
          <span className={styles.expectText}>
            <strong className={styles.expectTitle}>{item.title}</strong>
            <span className={styles.expectSub}>{item.text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function IntroFrame({ children }: { children: ReactNode }) {
  return (
    <section className={styles.card} aria-labelledby="placement-title">
      {children}
    </section>
  );
}

export function IntroHead({ returning, children }: { returning: boolean; children?: ReactNode }) {
  return (
    <header className={styles.head}>
      <p className={styles.eyebrow} id="placement-kicker">
        <span className={styles.eyebrowMark} aria-hidden="true">
          ?
        </span>
        Find my level
      </p>
      <h1 className={styles.title} id="placement-title">
        {returning ? (
          <>
            Ready to check <Underlined>again</Underlined>?
          </>
        ) : (
          <>
            Let&apos;s find your <Underlined>starting point</Underlined>
          </>
        )}
      </h1>
      {children}
    </header>
  );
}

export function IntroSkeleton() {
  return (
    <IntroFrame>
      <IntroHead returning={false}>
        <div className={styles.skeleton} role="status" aria-label="Loading the placement">
          <span />
          <span />
        </div>
      </IntroHead>
    </IntroFrame>
  );
}

export function PlacementIntro({
  summary,
  note,
  emptyBank,
  canBegin,
  plan,
  pickHref,
  onBegin,
  onKeep,
  onStartFromBeginning,
}: {
  summary: BankSummary | null;
  note: string | null;
  emptyBank: boolean;
  canBegin: boolean;
  plan: IntroPlan | null;
  pickHref: string;
  onBegin: () => void;
  onKeep: () => void;
  onStartFromBeginning: () => void;
}) {
  const pick = (
    <Link className={styles.quiet} href={pickHref} prefetch={false}>
      I&apos;ll pick a level myself
    </Link>
  );

  if (emptyBank) {
    return (
      <IntroFrame>
        <IntroHead returning={false} />
        <p className={styles.empty} role="status">
          The placement questions are not written yet, so there is nothing to answer. Start from the beginning or pick a
          level instead. Every chapter stays open either way.
        </p>
        <div className={styles.actions}>
          <button type="button" className={topicKit.btn} onClick={onStartFromBeginning}>
            Start from the beginning <span aria-hidden="true">→</span>
          </button>
          {pick}
        </div>
      </IntroFrame>
    );
  }

  return (
    <IntroFrame>
      <IntroHead returning={plan !== null}>
        <p className={styles.lead}>
          {plan
            ? "Your current plan stays exactly as it is until you finish. Nothing you've read changes, and every chapter stays open either way."
            : "A few questions, then a level and a plan. Nothing is locked, and every chapter stays open either way."}
        </p>
        {plan && (
          <p className={styles.current} style={toneStyle(plan.tone) as CSSProperties} data-current-plan="">
            <span className={styles.currentStep} aria-hidden="true">
              {plan.step}
            </span>
            <span className={styles.currentText}>
              <span className={styles.currentKicker}>Your plan now</span>
              <span className={styles.currentName}>{plan.level}</span>
              <span className={styles.currentSum}>{plan.summary}</span>
            </span>
          </p>
        )}
      </IntroHead>
      {!plan && <Expect />}
      <div className={styles.closing}>
        {summary ? (
          <p className={styles.size} data-size-line="">
            {sizeLine(summary)}
          </p>
        ) : (
          <span className={styles.sizeSkeleton} aria-hidden="true" />
        )}
        {note && (
          <p className={styles.note} data-bank-note="">
            {note}
          </p>
        )}
        <div className={styles.actions}>
          <button type="button" className={topicKit.btn} id="placement-begin" disabled={!canBegin} onClick={onBegin}>
            {plan ? "Retake the check" : "Begin"} <span aria-hidden="true">→</span>
          </button>
          {plan && (
            <button type="button" className={topicKit.btnGhost} id="placement-keep" onClick={onKeep}>
              Keep my plan
            </button>
          )}
          {(plan === null || note !== null) && pick}
        </div>
      </div>
    </IntroFrame>
  );
}
