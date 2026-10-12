"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Copy, Scene } from "@/components/home/Stage";
import { Card, Column, Compose, Remark, Tag } from "@/components/topic/Compose";
import {
  Actions,
  Band,
  CardKicker,
  Chips,
  Foot,
  FootLink,
  Heading,
  Kicker,
  TopicPage,
  Underlined,
  topicKit,
} from "@/components/topic/TopicKit";
import { COMPETENCY_LABEL } from "@/app/mock/options";
import { useScrollRegions } from "@/components/reader/scrollRegions";
import {
  competencyProfile,
  decideLoop,
  rubricFor,
  stageScore,
  VERDICT_LABEL,
  verdictFor,
  type Mark,
} from "@/lib/mock/scoring";
import { answerSeconds, debriefText, isRushed, pacing } from "@/lib/mock/pacing";
import { stageResults, type Session } from "@/lib/mock/session";
import type { Competency, StageId, StageInfo, TalkItem } from "@/lib/mock/types";
import { formatClock } from "@/lib/mockSession";
import { BoardView } from "@/app/mock/Whiteboard";
import { COMPETENCY_PLAN } from "@/lib/mock/guide";
import kit from "./mockKit.module.css";
import styles from "./scorecard.module.css";

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

function Bar({ value, marks = false }: { value: number; marks?: boolean }) {
  return (
    <div className={kit.bar}>
      <div className={kit.barTrack}>
        <span className={kit.barFill} data-band={band(value)} style={{ width: `${Math.round(value * 100)}%` }} />
        {marks && (
          <>
            <span className={kit.threshold} style={{ left: `${HIRE_BAR * 100}%` }} aria-hidden="true" />
            <span className={kit.threshold} style={{ left: `${STRONG_BAR * 100}%` }} aria-hidden="true" />
          </>
        )}
      </div>
      <span className={kit.barValue}>{Math.round(value * 100)}%</span>
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
  const pace = pacing(session);
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");
  const focus = (Object.entries(profile) as [Competency, number][])
    .filter(([, v]) => v < STRONG_BAR)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2);
  const scored = results
    .filter((r) => r.scores.length > 0)
    .map((r) => ({ stage: r.stage, score: stageScore(r) }))
    .sort((a, b) => b.score - a.score);
  const best = scored[0];
  const worst = scored.length > 1 ? scored[scored.length - 1] : null;
  const stickerTone = decision.verdict === "no-hire" || decision.verdict === "lean-no" ? "caution" : "success";
  const percent = Math.round(decision.score * 100);
  const verdictWord = VERDICT_LABEL[decision.verdict];

  const rounds = useRef<HTMLDivElement>(null);
  useScrollRegions(rounds, session);

  async function copyDebrief() {
    try {
      await navigator.clipboard.writeText(debriefText(session, title));
      setCopied("done");
    } catch {
      setCopied("failed");
    }
    window.setTimeout(() => setCopied("idle"), 2400);
  }

  return (
    <TopicPage accent="blue">
      <Scene className={topicKit.hero}>
        <Copy>
          <Kicker mark="Q">{kind} debrief</Kicker>
          <Heading id="debrief-h">
            {session.mode === "loop" ? (
              decision.headline
            ) : (
              <>
                <Underlined>{percent}%</Underlined> — {verdictWord.toLowerCase()} territory
              </>
            )}
          </Heading>
          {decision.reasons.length + pace.notes.length > 0 && (
            <ul className={styles.reasons}>
              {decision.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
              {pace.notes.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          )}
          {endedEarly && (
            <p className={styles.early}>
              Ended early — unasked rounds are left out of the decision rather than counted as zeros, which flatters the
              result.
            </p>
          )}
          <Chips>
            <span className={topicKit.chip}>{percent}% weighted</span>
            <span className={topicKit.chip}>
              {answered.length}/{session.questions.length} answered
            </span>
            <span className={topicKit.chip}>
              {duration((session.finishedAt ?? session.startedAt) - session.startedAt)}
            </span>
            {timedOut > 0 && <span className={topicKit.chip}>{timedOut} over time</span>}
            {skipped > 0 && <span className={topicKit.chip}>{skipped} skipped</span>}
          </Chips>
          <Actions>
            <a className={topicKit.btn} href="#rounds">
              Read the full debrief <span aria-hidden="true">↓</span>
            </a>
          </Actions>
        </Copy>
        <Compose live layout={best ? "duo" : "stack"}>
          <Card at="a" tilt={-1} taped className={styles.stampCard}>
            {!best && <Tag tone={stickerTone}>you marked it yourself</Tag>}
            <div
              className={styles.stamp}
              data-verdict={decision.verdict}
              role="img"
              aria-label={`Verdict: ${verdictWord}`}
            >
              <div>
                <div className={styles.stampWord}>{verdictWord}</div>
                <div className={styles.stampScore}>{percent}%</div>
              </div>
            </div>
            <p className={styles.stampNote}>
              {session.mode === "loop" ? decision.headline : `${kind} score, weighted by core rounds`}
            </p>
            <Remark>marked like a committee</Remark>
          </Card>
          {best && (
            <Column at="b">
              <Card decor extra tilt={1}>
                <Tag tone={stickerTone}>you marked it yourself</Tag>
                <CardKicker>{worst ? "Strongest round" : "Your round"}</CardKicker>
                <p className={styles.cardTitle}>{title(best.stage)}</p>
                <p className={styles.cardScore}>{Math.round(best.score * 100)}%</p>
              </Card>
              {worst && (
                <Card decor extra tone="note" tilt={1}>
                  <CardKicker>Weakest round</CardKicker>
                  <p className={styles.cardTitle}>{title(worst.stage)}</p>
                  <p className={styles.cardScore}>{Math.round(worst.score * 100)}%</p>
                </Card>
              )}
            </Column>
          )}
        </Compose>
      </Scene>

      <Band no="01" id="rounds-h" sectionId="rounds" label="The rounds" title="Round by round">
        <div ref={rounds}>
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
                        <span className={styles.roundName}>{title(r.stage)}</span>{" "}
                        {r.core && <span className={kit.coreBadge}>core</span>}
                        <div className={styles.roundCount}>
                          {r.scores.length} of {session.questions.filter((q) => q.stage === r.stage).length} answered
                        </div>
                      </td>
                      <td className={styles.barCell}>
                        {has ? <Bar value={score} /> : <span className={styles.roundCount}>not reached</span>}
                      </td>
                      <td>
                        {has && (
                          <span className={kit.verdictChip} data-verdict={verdictFor(score)}>
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
        </div>
      </Band>

      <Band no="02" id="profile-h" label="The skills" title="What it says about you">
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
          ┆ dashed lines: hire at {Math.round(HIRE_BAR * 100)}%, strong hire at {Math.round(STRONG_BAR * 100)}%
        </p>
      </Band>

      {focus.length > 0 && (
        <Band no="03" id="next-h" label="Before the real one" title="What to work on next">
          <div className={styles.nextGrid}>
            {focus.map(([c, v], i) => (
              <article
                key={c}
                className={`${kit.sticky} ${styles.nextCard}`}
                style={{ "--tilt": `${[-0.8, 0.8][i % 2]}deg` } as React.CSSProperties}
              >
                <span className={kit.tape} aria-hidden="true" />
                <div className={styles.nextTop}>
                  <b>{COMPETENCY_LABEL[c]}</b>
                  <span className={styles.qScore} data-band={band(v)}>
                    {Math.round(v * 100)}%
                  </span>
                </div>
                <p>{COMPETENCY_PLAN[c].why}</p>
                <ol className={styles.nextSteps}>
                  {COMPETENCY_PLAN[c].steps.map((st) => (
                    <li key={st.href}>
                      <Link href={st.href}>{st.label}</Link>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        </Band>
      )}

      <Band no={focus.length > 0 ? "04" : "03"} id="qs-h" label="The detail" title="Every question">
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
                      <span className={styles.qMeta}>not asked</span>
                    ) : (
                      <span className={styles.qScore} data-band={band(score)}>
                        {q.skipped ? "skipped" : `${Math.round(score * 100)}%`}
                      </span>
                    )}
                  </summary>
                  <div className={styles.qBody}>
                    <span className={styles.qMeta}>
                      {title(q.stage)}
                      {answerSeconds(q) !== null ? ` · answered in ${formatClock(answerSeconds(q)!)}` : ""}
                      {q.timedOut ? " · over time" : ""}
                      {isRushed(q, session) ? " · too quick to be a full answer" : ""}
                    </span>
                    {q.notes.trim() && <div className={styles.yours}>{q.notes.trim()}</div>}
                    {q.board && q.board.shapes.length > 0 && <BoardView board={q.board} />}
                    {talk && score !== null && !q.skipped && (
                      <ul className={styles.marksList}>
                        {rubricFor(talk, Boolean(q.followUp)).map((c) => (
                          <li key={c.id}>
                            {c.label}: <b>{MARK_WORD[(q.marks[c.id] ?? 0) as Mark]}</b>
                          </li>
                        ))}
                      </ul>
                    )}
                    {q.item.kind === "coding" && q.coding && (
                      <p className={styles.qMeta}>
                        {q.coding.passed}/{q.coding.total} tests · {q.coding.hintsUsed} hints
                        {q.coding.sawSolution ? " · saw the solution" : ""}
                      </p>
                    )}
                    <p className={styles.qLink}>
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
      </Band>

      <section className={styles.next} aria-label="What next">
        <div className={styles.nextBar}>
          {retryCount > 0 && (
            <button type="button" className={kit.btn} onClick={onRetry}>
              Retry the weak ones ({retryCount})
            </button>
          )}
          <button type="button" className={retryCount > 0 ? `${kit.btn} ${kit.btnGhost}` : kit.btn} onClick={onAgain}>
            Same {session.mode === "loop" ? "loop" : "round"}, new questions
          </button>
          <button type="button" className={`${kit.btn} ${kit.btnQuiet}`} onClick={onNew}>
            Plan something else
          </button>
          <span className={styles.spacer} />
          <button type="button" className={`${kit.btn} ${kit.btnGhost}`} onClick={copyDebrief}>
            {copied === "done" ? "Copied ✓" : copied === "failed" ? "Could not copy" : "Copy the debrief"}
          </button>
          <span className="visually-hidden" aria-live="polite">
            {copied === "done" ? "Debrief copied to the clipboard" : ""}
          </span>
        </div>
      </section>

      <Foot>
        <FootLink href="/mock">Mock interview</FootLink>
        <FootLink href="/interview">Interview book</FootLink>
        <FootLink href="/progress">Progress</FootLink>
        <FootLink href="/">All topics</FootLink>
      </Foot>
    </TopicPage>
  );
}
