import Link from "next/link";
import type { CSSProperties } from "react";
import { toneStyle } from "@/components/topic/shell/tone";
import type { ShellTone } from "@/components/topic/shell/types";
import type { Question } from "@/content/quiz-types";
import { PlacementQuestion } from "./PlacementQuestion";
import styles from "./ask.module.css";

export function PlacementAsk({
  leaveHref,
  question,
  answered,
  capacity,
  guaranteed,
  tone,
  picked,
  onPick,
  onNext,
  onNotSure,
  onBack,
  onStartOver,
}: {
  leaveHref: string;
  question: Question;
  answered: number;
  capacity: number;
  guaranteed: number;
  tone: ShellTone;
  picked: string[];
  onPick: (picked: string[]) => void;
  onNext: () => void;
  onNotSure: () => void;
  onBack?: () => void;
  onStartOver: () => void;
}) {
  const number = answered + 1;
  const total = capacity > 0 ? `${capacity > guaranteed ? "up to " : ""}${capacity}` : null;
  const share = capacity > 0 ? Math.min(100, Math.max(4, (answered / capacity) * 100)) : 0;
  const style = { ...toneStyle(tone), "--pct": `${share}%` } as CSSProperties;

  return (
    <div className={styles.ask} style={style} data-ask="">
      <div className={styles.top}>
        <Link className={styles.leave} href={leaveHref} prefetch={false}>
          <span aria-hidden="true">←</span> Leave the check
        </Link>
        <h1 className={styles.count}>
          Question {number}
          {total && <span className={styles.countOf}> of {total}</span>}
        </h1>
      </div>
      {capacity > 0 && (
        <div className={styles.progress} aria-hidden="true">
          <i />
        </div>
      )}
      <p className="visually-hidden" role="status">
        Question {number}
        {total ? ` of ${total}` : ""}
      </p>
      <PlacementQuestion
        question={question}
        number={number}
        picked={picked}
        onPick={onPick}
        onNext={onNext}
        onNotSure={onNotSure}
      />
      <div className={styles.foot}>
        {onBack ? (
          <button type="button" className={styles.link} data-previous="" onClick={onBack}>
            <span aria-hidden="true">←</span> Previous question
          </button>
        ) : (
          <span />
        )}
        <button type="button" className={styles.link} data-start-over="" onClick={onStartOver}>
          Start over
        </button>
      </div>
    </div>
  );
}
