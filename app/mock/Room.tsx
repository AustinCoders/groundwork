"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Elapsed, InlineTimer, TimerRing } from "@/app/mock/TimerRing";
import { MINUTES_PER_CODING, MINUTES_PER_TALK } from "@/lib/mock/loops";
import { codingScore, rubricFor, talkScore, type CriterionId, type Mark } from "@/lib/mock/scoring";
import { currentQuestion, stagePosition, type Action, type Session, type SessionQuestion } from "@/lib/mock/session";
import type { CodingItem, Seniority, StageId, StageInfo, TalkItem } from "@/lib/mock/types";
import type { PracticeExercise } from "@/lib/practiceFree";
import { opener, personaFor, shiftRemark, type Persona } from "@/lib/mock/persona";
import { BoardView, Whiteboard } from "@/app/mock/Whiteboard";
import { EMPTY_BOARD } from "@/lib/mock/board";
import styles from "./mock.module.css";

const FOLLOW_UP_SECONDS = 90;

const PracticeWorkspace = dynamic(
  () => import("@/components/practice/PracticeWorkspace").then((m) => m.PracticeWorkspace),
  { loading: () => <p className="sub">Loading the editor…</p> }
);

const LEVEL_LABEL: Record<Seniority, string> = { junior: "2–3 years", mid: "5–7 years", senior: "10+ years" };

const MARKS: [Mark, string][] = [
  [0, "No"],
  [0.5, "Partly"],
  [1, "Yes"],
];

type Dispatch = (a: Action) => void;

function Rail({ session, stages, onEnd }: { session: Session; stages: Record<StageId, StageInfo>; onEnd: () => void }) {
  const { stageIndex } = stagePosition(session);
  return (
    <div className={styles.rail}>
      <ol className={styles.railStages} aria-label="Rounds in this interview">
        {session.plan.map((p, i) => {
          const qs = session.questions.filter((q) => q.stage === p.stage);
          const done = qs.filter((q) => q.score !== null).length;
          const state = i < stageIndex ? "done" : i === stageIndex ? "current" : "next";
          return (
            <li
              key={p.stage}
              className={styles.railStage}
              data-state={state}
              aria-current={state === "current" ? "step" : undefined}
            >
              <span className={styles.railBar}>
                <span className={styles.railFill} style={{ width: `${qs.length ? (done / qs.length) * 100 : 0}%` }} />
              </span>
              <span className={styles.railName}>{stages[p.stage]?.title}</span>
            </li>
          );
        })}
      </ol>
      <Elapsed since={session.startedAt} until={session.finishedAt} />
      <button
        type="button"
        className="btn btn--ghost"
        onClick={() => {
          if (window.confirm("End the interview here? It will be scored on what you have answered so far.")) onEnd();
        }}
      >
        End
      </button>
    </div>
  );
}

function StageBrief({ session, info, dispatch }: { session: Session; info: StageInfo; dispatch: Dispatch }) {
  const { stageIndex } = stagePosition(session);
  const plan = session.plan[stageIndex];
  return (
    <section className="sheet" aria-labelledby="stage-title">
      <div className={styles.brief}>
        <div>
          <p className={styles.eyebrow}>
            {session.plan.length > 1 ? `Round ${stageIndex + 1} of ${session.plan.length}` : "One round"}
            {info.code ? ` · ${info.code}` : ""}
          </p>
          <h2 id="stage-title" className={styles.briefTitle}>
            {info.title}
          </h2>
          <dl className={styles.briefFacts}>
            <div>
              <dt>Interviewing you</dt>
              <dd className={styles.briefPersona}>
                <Avatar persona={personaFor(info.id, session.config, info.who)} />
                {personaFor(info.id, session.config, info.who).name},{" "}
                {personaFor(info.id, session.config, info.who).role.toLowerCase()}
              </dd>
            </div>
            {info.decides && (
              <div>
                <dt>Decides</dt>
                <dd>{info.decides}</dd>
              </div>
            )}
            {info.failMode && (
              <div className={styles.fail}>
                <dt>How it is usually lost</dt>
                <dd>{info.failMode}</dd>
              </div>
            )}
          </dl>
        </div>
        <div className={styles.recordTile}>
          <span className={styles.recordNum}>{plan?.questions}</span>
          <span className={styles.recordLabel}>
            {info.kind === "coding" ? "problems, graded by their tests" : "questions, answered out loud"}
          </span>
          <p className={styles.mapMeta} style={{ marginTop: 10 }}>
            about {plan?.minutes} min
            {plan?.core && <span className={styles.coreBadge}>core round</span>}
          </p>
          {plan?.core && (
            <p className={styles.mapReason}>A no-hire here sinks the loop, whatever the other rounds say.</p>
          )}
          <div className={styles.actions}>
            <button
              type="button"
              className="btn btn--primary"
              autoFocus
              onClick={() => dispatch({ type: "enter", at: Date.now() })}
            >
              Walk in
            </button>
            <span className={styles.hint}>
              <kbd>Enter</kbd>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuestionHead({ q, session, info }: { q: SessionQuestion; session: Session; info: StageInfo }) {
  const { inStage, ofStage } = stagePosition(session);
  const item = q.item as TalkItem;
  return (
    <div className={styles.qHead}>
      <span className={styles.eyebrow}>
        {info.title} · {inStage} of {ofStage}
      </span>
      <span className="tag">{item.originTitle}</span>
      {item.level !== "any" && <span className="tag">{LEVEL_LABEL[item.level]}</span>}
      {q.adapted && (
        <span className={styles.shiftTag} data-shift={q.adapted}>
          {q.adapted === "harder" ? "↑ raised the bar" : "↓ back to basics"}
        </span>
      )}
    </div>
  );
}

function Avatar({ persona }: { persona: Persona }) {
  return (
    <span className={styles.avatar} data-tone={persona.tone} aria-hidden="true">
      {persona.initials}
    </span>
  );
}

function Said({ persona, aside, children }: { persona: Persona; aside?: boolean; children: React.ReactNode }) {
  return (
    <div className={styles.said} data-aside={aside || undefined}>
      <Avatar persona={persona} />
      <div className={styles.saidBody}>
        <span className={styles.saidWho}>
          {persona.name} <span className={styles.saidRole}>· {persona.role}</span>
        </span>
        <div className={styles.saidBubble}>{children}</div>
      </div>
    </div>
  );
}

function YouSaid({ text }: { text: string }) {
  return (
    <div className={styles.said} data-you>
      <div className={styles.saidBody}>
        <span className={styles.saidWho}>You</span>
        <div className={styles.saidBubble}>{text.trim() || "(answered out loud)"}</div>
      </div>
    </div>
  );
}

function AgainstPanel({ item, q, seniority }: { item: TalkItem; q: SessionQuestion; seniority: Seniority }) {
  const rung = item.ladder?.find((r) => r.level === seniority);
  return (
    <div className={`${styles.against} interview-body`}>
      <div>
        <span className={styles.notesLabel}>What you jotted</span>
        <div className={styles.yours}>{q.notes.trim()}</div>
        {q.followUp && q.followUpNotes.trim() && (
          <>
            <span className={styles.notesLabel}>…and when they pushed</span>
            <div className={styles.yours}>{q.followUpNotes.trim()}</div>
          </>
        )}
      </div>

      {item.testing && (
        <div className="test">
          <span className="ttl">What they are really testing</span>
          <span dangerouslySetInnerHTML={{ __html: item.testing }} />
        </div>
      )}

      {rung && (
        <div className={styles.ladderRung}>
          <span className={styles.eyebrow}>The bar at {rung.label}</span>
          <p dangerouslySetInnerHTML={{ __html: rung.bar }} />
          <p>
            <i dangerouslySetInnerHTML={{ __html: rung.script }} />
          </p>
          <p className="sub" dangerouslySetInnerHTML={{ __html: rung.why }} />
        </div>
      )}

      {item.say && (
        <div className="say">
          <span className="ttl">Say it like this</span>
          <div dangerouslySetInnerHTML={{ __html: item.say }} />
        </div>
      )}

      {item.trap && (
        <div className="warn">
          <span className="ttl">The answer that loses the room</span>
          <div dangerouslySetInnerHTML={{ __html: item.trap }} />
        </div>
      )}

      {item.answer && (
        <details className={styles.modelAnswer} open={!item.say}>
          <summary>The full answer</summary>
          <div className={styles.modelBody} dangerouslySetInnerHTML={{ __html: item.answer }} />
        </details>
      )}

      {item.note && (
        <div className="sticky mint">
          <span className="ttl">2026 note</span>
          <div dangerouslySetInnerHTML={{ __html: item.note }} />
        </div>
      )}

      <p>
        <Link href={item.href} target="_blank" rel="noopener">
          Read it where it is written up ↗
        </Link>
      </p>
    </div>
  );
}

function Rubric({ q, dispatch }: { q: SessionQuestion; dispatch: Dispatch }) {
  const item = q.item as TalkItem;
  const criteria = rubricFor(item, Boolean(q.followUp));
  const score = talkScore(criteria, q.marks);
  const marked = criteria.filter((c) => q.marks[c.id] !== undefined).length;
  const complete = marked === criteria.length;

  return (
    <aside className={styles.rubric} aria-labelledby="rubric-h">
      <div className={styles.rubricHead}>
        <h3 id="rubric-h">Mark it honestly</h3>
        <span className={styles.hint}>
          <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd>
        </span>
      </div>
      {criteria.map((c) => (
        <div key={c.id} className={styles.criterion} role="group" aria-label={c.label}>
          <span className={styles.criterionLabel}>
            {c.label}
            <span className={styles.weight}>×{c.weight}</span>
          </span>
          <div className={styles.marks}>
            {MARKS.map(([m, label]) => (
              <button
                key={label}
                type="button"
                className={styles.mark}
                data-mark={String(m)}
                aria-pressed={q.marks[c.id] === m}
                onClick={() => dispatch({ type: "mark", criterion: c.id, mark: m })}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      ))}
      <div className={styles.meter}>
        <div className={styles.meterLabel}>
          <span>
            {marked} of {criteria.length} marked
          </span>
          <span>{Math.round(score * 100)}%</span>
        </div>
        <div className={styles.meterTrack}>
          <span className={styles.meterFill} style={{ width: `${score * 100}%` }} />
        </div>
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className="btn btn--primary"
          disabled={!complete}
          onClick={() => dispatch({ type: "next", at: Date.now() })}
        >
          Next question
        </button>
        {!complete && <span className={styles.hint}>mark every line first</span>}
        {complete && (
          <span className={styles.hint}>
            <kbd>Enter</kbd>
          </span>
        )}
      </div>
    </aside>
  );
}

function TalkQuestion({
  session,
  q,
  info,
  dispatch,
}: {
  session: Session;
  q: SessionQuestion;
  info: StageInfo;
  dispatch: Dispatch;
}) {
  const item = q.item as TalkItem;
  const persona = personaFor(q.stage, session.config, info.who);
  const [padView, setPadView] = useState<"notes" | "board">("notes");
  const { inStage } = stagePosition(session);
  const seconds = MINUTES_PER_TALK[session.config.seniority] * 60;
  const expire = useCallback(() => dispatch({ type: "answered", at: Date.now(), timedOut: true }), [dispatch]);
  const expireFollowUp = useCallback(() => dispatch({ type: "followup-answered" }), [dispatch]);

  if (session.step === "answer") {
    return (
      <section className="sheet" aria-labelledby="q-prompt">
        <QuestionHead q={q} session={session} info={info} />
        <div className={styles.chat} role="log" aria-label={`Interview with ${persona.name}`}>
          {inStage === 1 && (
            <Said persona={persona} aside>
              {opener(persona, session.startedAt + session.cursor)}
            </Said>
          )}
          {q.adapted && (
            <Said persona={persona} aside>
              {shiftRemark(q.adapted, persona)}
            </Said>
          )}
          <Said persona={persona}>
            <h2 id="q-prompt" className={styles.prompt} dangerouslySetInnerHTML={{ __html: item.prompt }} />
          </Said>
        </div>
        <div className={styles.answerArea}>
          <div>
            {q.stage === "design" && (
              <div className={styles.padTabs} role="tablist" aria-label="Answer with">
                {(["notes", "board"] as const).map((pad) => (
                  <button
                    key={pad}
                    type="button"
                    role="tab"
                    aria-selected={padView === pad}
                    className={styles.padTab}
                    onClick={() => setPadView(pad)}
                  >
                    {pad === "notes"
                      ? "Notes"
                      : `Whiteboard${q.board?.shapes.length ? ` (${q.board.shapes.length})` : ""}`}
                  </button>
                ))}
              </div>
            )}
            {padView === "board" && q.stage === "design" ? (
              <Whiteboard board={q.board ?? EMPTY_BOARD} onChange={(board) => dispatch({ type: "board", board })} />
            ) : (
              <>
                <label className={styles.notesLabel} htmlFor="mock-notes">
                  Say it out loud. Jot the skeleton here if it helps — it is kept for the review.
                </label>
                <textarea
                  id="mock-notes"
                  className={styles.notes}
                  value={q.notes}
                  autoFocus
                  onChange={(e) => dispatch({ type: "notes", text: e.target.value })}
                />
              </>
            )}
          </div>
          {q.startedAt !== null && <TimerRing startedAt={q.startedAt} seconds={seconds} onExpire={expire} />}
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => dispatch({ type: "answered", at: Date.now(), timedOut: false })}
          >
            I&apos;ve answered
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => dispatch({ type: "skip", at: Date.now() })}>
            Skip — I don&apos;t know
          </button>
          <span className={styles.hint}>
            <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>Enter</kbd> when you are done
          </span>
        </div>
      </section>
    );
  }

  if (session.step === "followup" && q.followUp) {
    return (
      <section className="sheet" aria-labelledby="q-push">
        <QuestionHead q={q} session={session} info={info} />
        <div className={styles.chat} role="log" aria-label={`Interview with ${persona.name}`}>
          <Said persona={persona}>
            <p className={styles.saidQuiet} dangerouslySetInnerHTML={{ __html: item.prompt }} />
          </Said>
          <YouSaid text={q.notes} />
          <Said persona={persona}>
            <span className={styles.pushWho}>Follow-up</span>
            <p id="q-push" className={styles.pushText} dangerouslySetInnerHTML={{ __html: q.followUp }} />
          </Said>
        </div>
        <div className={styles.answerArea}>
          <div>
            <label className={styles.notesLabel} htmlFor="mock-followup">
              A follow-up is where a prepared answer runs out. Take the question, not the one you wish they had asked.
            </label>
            <textarea
              id="mock-followup"
              className={styles.notes}
              value={q.followUpNotes}
              autoFocus
              onChange={(e) => dispatch({ type: "followup-notes", text: e.target.value })}
            />
          </div>
          {q.startedAt !== null && (
            <TimerRing startedAt={q.answeredAt ?? q.startedAt} seconds={FOLLOW_UP_SECONDS} onExpire={expireFollowUp} />
          )}
        </div>
        <div className={styles.actions}>
          <button type="button" className="btn btn--primary" onClick={() => dispatch({ type: "followup-answered" })}>
            Answered — show me
          </button>
          <span className={styles.hint}>
            <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>Enter</kbd>
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="sheet" aria-labelledby="q-review">
      <QuestionHead q={q} session={session} info={info} />
      <h2
        id="q-review"
        className={styles.prompt}
        style={{ fontSize: 26 }}
        dangerouslySetInnerHTML={{ __html: item.prompt }}
      />
      {q.timedOut && (
        <p className="warn">The clock ran out before you finished. In the room they would have moved on.</p>
      )}
      {q.board && q.board.shapes.length > 0 && (
        <figure className={styles.boardFigure}>
          <BoardView board={q.board} />
          <figcaption className={styles.hint}>Your whiteboard</figcaption>
        </figure>
      )}
      <div className={styles.review}>
        <AgainstPanel item={item} q={q} seniority={session.config.seniority} />
        <Rubric q={q} dispatch={dispatch} />
      </div>
    </section>
  );
}

let exercisesPromise: Promise<Map<string, PracticeExercise>> | null = null;

function loadExercises(): Promise<Map<string, PracticeExercise>> {
  if (!exercisesPromise) {
    exercisesPromise = import("@/content/practice").then(
      (mod) => new Map(mod.practice.map((ex) => [ex.id, ex as unknown as PracticeExercise]))
    );
    exercisesPromise.catch(() => {
      exercisesPromise = null;
    });
  }
  return exercisesPromise;
}

function useExercise(id: string): { exercise: PracticeExercise | null; error: boolean } {
  const [state, setState] = useState<{ id: string; exercise: PracticeExercise | null; error: boolean }>({
    id: "",
    exercise: null,
    error: false,
  });
  useEffect(() => {
    let live = true;
    loadExercises().then(
      (all) => live && setState({ id, exercise: all.get(id) ?? null, error: !all.has(id) }),
      () => live && setState({ id, exercise: null, error: true })
    );
    return () => {
      live = false;
    };
  }, [id]);
  return state.id === id ? state : { exercise: null, error: false };
}

function CodingQuestion({
  session,
  q,
  info,
  dispatch,
}: {
  session: Session;
  q: SessionQuestion;
  info: StageInfo;
  dispatch: Dispatch;
}) {
  const item = q.item as CodingItem;
  const { exercise, error } = useExercise(item.id);
  const { inStage, ofStage } = stagePosition(session);
  const seconds = MINUTES_PER_CODING[item.exercise] * 60;
  const outcome = q.coding;

  if (session.step === "review") {
    const score = outcome ? codingScore(outcome) : 0;
    return (
      <section className="sheet" aria-labelledby="c-review">
        <p className={styles.eyebrow}>
          {info.title} · {inStage} of {ofStage}
        </p>
        <h2 id="c-review" className={styles.codingTitle}>
          {item.title}
        </h2>
        {q.timedOut && <p className="warn">You went over the time for this problem.</p>}
        <div className={styles.outcome} style={{ marginTop: 16 }}>
          <div className={styles.recordTile}>
            <span className={styles.recordNum}>
              {outcome?.passed ?? 0}/{outcome?.total ?? item.tests}
            </span>
            <span className={styles.recordLabel}>tests passing when you submitted</span>
          </div>
          <div className={styles.recordTile}>
            <span className={styles.recordNum}>{outcome?.hintsUsed ?? 0}</span>
            <span className={styles.recordLabel}>hints opened · −5% each, up to −15%</span>
          </div>
          <div className={styles.recordTile}>
            <span className={styles.recordNum}>{outcome?.sawSolution ? "yes" : "no"}</span>
            <span className={styles.recordLabel}>looked at the solution · caps it at 30%</span>
          </div>
        </div>
        {!outcome?.total || (outcome && outcome.passed === 0 && !outcome.sawSolution) ? (
          <p className="sub">
            Nothing passed — if you never pressed <b>Submit</b> in the editor, the tests never ran. Run them before you
            move on next time; an interviewer only sees what works.
          </p>
        ) : null}
        <div className={styles.meter} style={{ maxWidth: 420 }}>
          <div className={styles.meterLabel}>
            <span>score</span>
            <span>{Math.round(score * 100)}%</span>
          </div>
          <div className={styles.meterTrack}>
            <span className={styles.meterFill} style={{ width: `${score * 100}%` }} />
          </div>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className="btn btn--primary"
            autoFocus
            onClick={() => dispatch({ type: "next", at: Date.now() })}
          >
            Next question
          </button>
          <Link className="btn btn--ghost" href={item.href} target="_blank" rel="noopener">
            Open the problem on its own ↗
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <div className={styles.codingHead}>
        <div>
          <p className={styles.eyebrow}>
            {info.title} · {inStage} of {ofStage}
          </p>
          <span className={styles.codingTitle}>{item.title}</span>
        </div>
        <span className="tag">{item.level}</span>
        <span className="tag">{item.tests} tests</span>
        <span className={styles.spacer} />
        {q.startedAt !== null && <InlineTimer startedAt={q.startedAt} seconds={seconds} />}
        <button
          type="button"
          className="btn btn--primary"
          onClick={() =>
            dispatch({
              type: "coding-submit",
              at: Date.now(),
              timedOut: q.startedAt !== null && Date.now() - q.startedAt > seconds * 1000,
            })
          }
        >
          Hand it in
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => dispatch({ type: "skip", at: Date.now() })}>
          Skip
        </button>
      </div>
      <p className="sub" style={{ marginTop: 0 }}>
        Press <b>Submit</b> in the editor to run the tests — what is passing when you hand it in is your score.
      </p>
      <div className={styles.workspace}>
        {exercise ? (
          <PracticeWorkspace
            key={exercise.id}
            exercise={exercise}
            isFree={false}
            chapter={null}
            prev={null}
            next={null}
            interview
            onOutcome={(o) => dispatch({ type: "coding", outcome: o })}
          />
        ) : error ? (
          <p className="warn">This problem could not be loaded. Skip it and carry on.</p>
        ) : (
          <p className="sub">Loading the editor…</p>
        )}
      </div>
    </>
  );
}

export function Room({
  session,
  stages,
  dispatch,
  onEnd,
}: {
  session: Session;
  stages: Record<StageId, StageInfo>;
  dispatch: Dispatch;
  onEnd: () => void;
}) {
  const q = currentQuestion(session);
  const info = q ? stages[q.stage] : null;

  const firstUnmarked = useMemo(() => {
    if (!q || q.item.kind !== "talk" || session.step !== "review") return null;
    return rubricFor(q.item, Boolean(q.followUp)).find((c) => q.marks[c.id] === undefined) ?? null;
  }, [q, session.step]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing =
        target && (target.tagName === "TEXTAREA" || target.tagName === "INPUT" || target.isContentEditable);
      const inEditor = target?.closest(".cm-editor");
      if (inEditor || !q) return;

      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        if (session.step === "answer" && q.item.kind === "talk") {
          e.preventDefault();
          dispatch({ type: "answered", at: Date.now(), timedOut: false });
        } else if (session.step === "followup") {
          e.preventDefault();
          dispatch({ type: "followup-answered" });
        }
        return;
      }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "Enter" && session.step === "brief") {
        e.preventDefault();
        dispatch({ type: "enter", at: Date.now() });
      } else if (e.key === "Enter" && session.step === "review" && q.item.kind === "talk" && !firstUnmarked) {
        if (target?.tagName === "BUTTON" || target?.tagName === "A" || target?.tagName === "SUMMARY") return;
        e.preventDefault();
        dispatch({ type: "next", at: Date.now() });
      } else if (firstUnmarked && (e.key === "1" || e.key === "2" || e.key === "3")) {
        e.preventDefault();
        const mark = MARKS[Number(e.key) - 1][0];
        dispatch({ type: "mark", criterion: firstUnmarked.id as CriterionId, mark });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [q, session.step, firstUnmarked, dispatch]);

  if (!q || !info) return null;

  return (
    <>
      <Rail session={session} stages={stages} onEnd={onEnd} />
      {session.step === "brief" ? (
        <StageBrief session={session} info={info} dispatch={dispatch} />
      ) : q.item.kind === "talk" ? (
        <TalkQuestion session={session} q={q} info={info} dispatch={dispatch} />
      ) : (
        <CodingQuestion session={session} q={q} info={info} dispatch={dispatch} />
      )}
    </>
  );
}
