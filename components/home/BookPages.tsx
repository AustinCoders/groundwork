import Link from "next/link";
import { memo } from "react";
import { plural } from "@/lib/format";
import type { BookStage, HomeRound } from "@/lib/homeRounds";
import { Tape } from "./Stage";
import styles from "./interview.module.css";

export const roundNumber = (index: number) => `Round ${String(index + 1).padStart(2, "0")}`;
const folio = (index: number) => String(index + 1).padStart(2, "0");

function Contents({
  stage,
  active,
  offer,
  onPick,
}: {
  stage: BookStage;
  active: number;
  offer: boolean;
  onPick?: (index: number) => void;
}) {
  return (
    <div className={styles.toc}>
      <header className={styles.tocHead}>
        <h3 className={styles.tocTitle}>Contents</h3>
        <p className={styles.tocKicker}>
          {`Stage ${String(stage.number).padStart(2, "0")} · ${stage.label} · ${plural(stage.items.length, "round")}`}
        </p>
      </header>
      <ol className={styles.tocList} aria-label={onPick ? `${stage.label}: interview rounds in order` : undefined}>
        {stage.items.map(({ round, index }) => {
          const on = index === active;
          const inner = (
            <>
              <span className={styles.code} aria-hidden="true">
                {round.code}
              </span>
              <span className={styles.rowName}>
                <span className="visually-hidden">{roundNumber(index)}: </span>
                {round.title}
              </span>
              <span className={styles.leader} aria-hidden="true" />
              <span className={styles.folio} aria-hidden="true">
                {folio(index)}
              </span>
              {on && round.tests && <span className={styles.decides}>{round.tests}</span>}
            </>
          );
          return (
            <li key={round.id} className={styles.row} data-state={index < active ? "past" : on ? "active" : "next"}>
              {onPick ? (
                <button
                  type="button"
                  className={styles.rowBtn}
                  data-index={index}
                  aria-current={on ? "true" : undefined}
                  onClick={() => onPick(index)}
                >
                  {inner}
                </button>
              ) : (
                <span className={styles.rowBtn}>{inner}</span>
              )}
            </li>
          );
        })}
        {offer && (
          <li className={`${styles.row} ${styles.offerRow}`} data-state="next">
            <span className={styles.rowBtn}>
              <span className={styles.code} aria-hidden="true">
                ⚑
              </span>
              <span className={styles.rowName}>The offer</span>
              <span className={styles.leader} aria-hidden="true" />
              <span className={styles.folio} aria-hidden="true">
                end
              </span>
            </span>
          </li>
        )}
      </ol>
    </div>
  );
}

export const LeftSheet = memo(function LeftSheet({
  stage,
  active,
  offer,
  onPick,
}: {
  stage: BookStage;
  active: number;
  offer: boolean;
  onPick?: (index: number) => void;
}) {
  return (
    <div className={styles.face} data-side="left">
      <p className={styles.runHead}>The interview book</p>
      <Contents stage={stage} active={active} offer={offer} onPick={onPick} />
      <span className={styles.pageNo} aria-hidden="true">
        contents
      </span>
    </div>
  );
});

export const RightSheet = memo(function RightSheet({
  round,
  index,
  stageLabel,
  on,
  copy,
}: {
  round: HomeRound;
  index: number;
  stageLabel: string;
  on: boolean;
  copy?: boolean;
}) {
  const live = on && !copy;
  return (
    <div className={styles.face} data-side="right" aria-hidden={copy || undefined}>
      <p className={styles.runHead}>{`${stageLabel} · ${round.code}`}</p>
      <article
        className={styles.page}
        data-active={live || undefined}
        data-copy={copy || undefined}
        role={live ? "region" : undefined}
        aria-labelledby={live ? "loop-preview-title" : undefined}
      >
        <header className={styles.chapter}>
          <p className={styles.kicker}>{roundNumber(index)}</p>
          <h3 id={live ? "loop-preview-title" : undefined} className={styles.title}>
            {round.title}
          </h3>
        </header>
        <ul className={styles.facts} aria-label="This round in numbers">
          <li>{plural(round.questions, "question")}</li>
          <li>{plural(round.followUps, "follow-up")}</li>
          <li>{round.minutes} min read</li>
        </ul>
        {round.sample && (
          <blockquote className={styles.quote}>
            <p className={styles.label}>A question you will get</p>
            <p className={styles.sample}>“{round.sample}”</p>
          </blockquote>
        )}
        <div className={styles.work}>
          {round.wrong && (
            <div className={styles.pen}>
              <p className={styles.label}>The answer that loses the room</p>
              <p className={styles.penText}>{round.wrong}</p>
              <span className={styles.stamp} aria-hidden="true">
                loses the room
              </span>
            </div>
          )}
          {round.tests && (
            <div className={styles.testing}>
              <Tape rot={-3} className={styles.tape} />
              <p className={styles.label}>What they are really testing</p>
              <p className={styles.testText}>{round.tests}</p>
            </div>
          )}
        </div>
        {round.followUp && (
          <footer className={styles.footnote}>
            <p className={styles.label}>* and the follow-up they push with</p>
            <p className={styles.followText}>
              {round.followUp}
              <span className={styles.typing} aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
            </p>
          </footer>
        )}
        {copy ? (
          <span className={styles.stampBtn}>
            Read this round <span aria-hidden="true">→</span>
          </span>
        ) : (
          <Link href={round.href} prefetch={false} tabIndex={live ? undefined : -1} className={styles.stampBtn}>
            Read this round <span aria-hidden="true">→</span>
          </Link>
        )}
      </article>
      <span className={styles.pageNo} aria-hidden="true">
        {folio(index)}
      </span>
    </div>
  );
});
