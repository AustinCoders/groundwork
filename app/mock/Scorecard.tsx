"use client";

import Link from "next/link";
import { COMPETENCY_LABEL } from "@/app/mock/Lobby";
import {
  competencyProfile,
  decideLoop,
  rubricFor,
  stageScore,
  VERDICT_LABEL,
  verdictFor,
  type Mark,
} from "@/lib/mock/scoring";
import { stageResults, type Session } from "@/lib/mock/session";
import type { Competency, StageId, StageInfo, TalkItem } from "@/lib/mock/types";
import { formatClock } from "@/lib/mockSession";
import styles from "./mock.module.css";

const HIRE_BAR = 0.65;
const STRONG_BAR = 0.8;

const MARK_WORD: Record<number, string> = { 0: "no", 0.5: "partly", 1: "yes" };

function band(score: number): "good" | "mid" | "bad" {
  return score >= HIRE_BAR ? "good" : score >= 0.45 ? "mid" : "bad";
}

function duration(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(s / 3600);
  return h ? `${h} h ${Math.floor((s % 3600) / 60)} min` : formatClock(s);
}

function plain(html: string): string {
  return html
    .replace(/<\/(p|li|div|h\d)>/g, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&[a-z]+;|&#\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** A score bar with the hire and strong-hire lines drawn on it, so a bar is
 *  read against the bar rather than against an empty track. */
function Bar({ value, marks = false }: { value: number; marks?: boolean }) {
  return (
    <div className={styles.bar}>
      <div className={`${styles.barTrack}${marks ? ` ${styles.withMarks}` : ""}`}>
        <span className={styles.barFill} style={{ width: `${Math.round(value * 100)}%` }} />
        {marks && (
          <>
            <span className={styles.threshold} style={{ left: `${HIRE_BAR * 100}%` }} aria-hidden="true" />
            <span className={styles.threshold} style={{ left: `${STRONG_BAR * 100}%` }} aria-hidden="true" />
          </>
        )}
      </div>
      <span className={styles.barValue}>{Math.round(value * 100)}%</span>
    </div>
  );
}

export function Scorecard({
  session,
  stages,
  retryCount,
  onRetry,
  onAgain,
  onNew,
}: {
  session: Session;
  stages: Record<StageId, StageInfo>;
  retryCount: number;
  onRetry: () => void;
  onAgain: () => void;
  onNew: () => void;
}) {
  const title = (s: StageId) => stages[s]?.title ?? s;
  const results = stageResults(session);
  const decision = decideLoop(results, session.config, title);
  const profile = competencyProfile(results);
  const answered = session.questions.filter((q) => q.score !== null);
  const endedEarly = answered.length < session.questions.length;
  const timedOut = session.questions.filter((q) => q.timedOut).length;
  const skipped = session.questions.filter((q) => q.skipped).length;
  const kind = session.mode === "loop" ? "Loop" : session.mode === "retry" ? "Retry round" : "Round";

  return (
    <>
      <section className="sheet" aria-labelledby="debrief-h">
        <div className={styles.verdictSheet}>
          <div>
            <p className={styles.eyebrow}>{kind} debrief</p>
            <h1 id="debrief-h" className={styles.headline}>
              {session.mode === "loop"
                ? decision.headline
                : `${Math.round(decision.score * 100)}% — ${VERDICT_LABEL[decision.verdict].toLowerCase()} territory`}
            </h1>
            <div className={styles.facts}>
              <span>{Math.round(decision.score * 100)}% weighted</span>
              <span>
                {answered.length}/{session.questions.length} answered
              </span>
              <span>{duration((session.finishedAt ?? session.startedAt) - session.startedAt)}</span>
              {timedOut > 0 && <span>{timedOut} over time</span>}
              {skipped > 0 && <span>{skipped} skipped</span>}
            </div>
            {decision.reasons.length > 0 && (
              <ul className={styles.reasons}>
                {decision.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            )}
            {endedEarly && (
              <p className="sub">
                Ended early — unasked rounds are left out of the decision rather than counted as zeros, which flatters
                the result.
              </p>
            )}
          </div>
          <div
            className={styles.stamp}
            data-verdict={decision.verdict}
            role="img"
            aria-label={`Verdict: ${VERDICT_LABEL[decision.verdict]}`}
          >
            <div>
              <div className={styles.stampWord}>{VERDICT_LABEL[decision.verdict]}</div>
              <div className={styles.stampScore}>{Math.round(decision.score * 100)}%</div>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.split}>
        <section className="sheet" aria-labelledby="rounds-h">
          <h2 id="rounds-h">Round by round</h2>
          <div className="table-scroll">
            <table className={styles.stageTable}>
              <thead>
                <tr>
                  <th scope="col">Round</th>
                  <th scope="col" className={styles.barCell}>
                    Score
                  </th>
                  <th scope="col">Signal</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => {
                  const score = stageScore(r);
                  const has = r.scores.length > 0;
                  return (
                    <tr key={r.stage}>
                      <td>
                        {title(r.stage)} {r.core && <span className={styles.coreBadge}>core</span>}
                        <div className={styles.hint}>
                          {r.scores.length} of {session.questions.filter((q) => q.stage === r.stage).length} answered
                        </div>
                      </td>
                      <td className={styles.barCell}>
                        {has ? <Bar value={score} /> : <span className="sub">not reached</span>}
                      </td>
                      <td>
                        {has && (
                          <span className={styles.verdictChip} data-verdict={verdictFor(score)}>
                            {VERDICT_LABEL[verdictFor(score)]}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="sheet" aria-labelledby="profile-h">
          <h2 id="profile-h">What it says about you</h2>
          <dl className={styles.profile}>
            {(Object.entries(profile) as [Competency, number][])
              .sort((a, b) => b[1] - a[1])
              .map(([c, v]) => (
                <div key={c}>
                  <dt>{COMPETENCY_LABEL[c]}</dt>
                  <dd>
                    <Bar value={v} marks />
                  </dd>
                </div>
              ))}
          </dl>
          <p className={styles.legend}>
            <span>
              ┆ dashed lines: hire at {Math.round(HIRE_BAR * 100)}%, strong hire at {Math.round(STRONG_BAR * 100)}%
            </span>
          </p>
        </section>
      </div>

      <section className="sheet" aria-labelledby="qs-h">
        <h2 id="qs-h">Every question</h2>
        <ol className={styles.qList}>
          {session.questions.map((q, i) => {
            const score = q.score;
            const talk = q.item.kind === "talk" ? (q.item as TalkItem) : null;
            return (
              <li key={q.item.id}>
                <details className={styles.qRow}>
                  <summary>
                    <span className={styles.qNum}>{String(i + 1).padStart(2, "0")}</span>
                    <span className={styles.qTitle}>
                      {talk ? plain(talk.prompt) : q.item.kind === "coding" ? q.item.title : ""}
                    </span>
                    {score === null ? (
                      <span className={styles.hint}>not asked</span>
                    ) : (
                      <span className={styles.qScore} data-band={band(score)}>
                        {q.skipped ? "skipped" : `${Math.round(score * 100)}%`}
                      </span>
                    )}
                  </summary>
                  <div className={styles.qBody}>
                    <span className={styles.hint}>
                      {title(q.stage)}
                      {q.timedOut ? " · over time" : ""}
                    </span>
                    {q.notes.trim() && <div className={styles.yours}>{q.notes.trim()}</div>}
                    {talk && score !== null && !q.skipped && (
                      <ul className={styles.reasons} style={{ margin: 0 }}>
                        {rubricFor(talk, Boolean(q.followUp)).map((c) => (
                          <li key={c.id}>
                            {c.label}: <b>{MARK_WORD[(q.marks[c.id] ?? 0) as Mark]}</b>
                          </li>
                        ))}
                      </ul>
                    )}
                    {q.item.kind === "coding" && q.coding && (
                      <p className={styles.hint}>
                        {q.coding.passed}/{q.coding.total} tests · {q.coding.hintsUsed} hints
                        {q.coding.sawSolution ? " · saw the solution" : ""}
                      </p>
                    )}
                    <p style={{ margin: 0 }}>
                      <Link href={q.item.href}>
                        {q.item.kind === "coding" ? "Solve it properly" : "Read the full answer"} →
                      </Link>
                    </p>
                  </div>
                </details>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="sheet" aria-label="What next">
        <div className={styles.startBar} style={{ borderTop: 0, paddingTop: 0 }}>
          {retryCount > 0 && (
            <button type="button" className="btn btn--primary" onClick={onRetry}>
              Retry the weak ones ({retryCount})
            </button>
          )}
          <button type="button" className={retryCount > 0 ? "btn" : "btn btn--primary"} onClick={onAgain}>
            Same {session.mode === "loop" ? "loop" : "round"}, new questions
          </button>
          <button type="button" className="btn btn--ghost" onClick={onNew}>
            Plan something else
          </button>
        </div>
      </section>
    </>
  );
}
