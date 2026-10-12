"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { InlineTimer, TimerRing } from "@/app/mock/TimerRing";
import { MINUTES_PER_CODING, MINUTES_PER_TALK } from "@/lib/mock/loops";
import { codingScore, rubricFor, talkScore, type CriterionId, type Mark } from "@/lib/mock/scoring";
import { currentQuestion, stagePosition, type Action, type Session, type SessionQuestion } from "@/lib/mock/session";
import type { CodingItem, Seniority, StageId, StageInfo, TalkItem } from "@/lib/mock/types";
import type { PracticeExercise } from "@/lib/practiceFree";
import { shortcutShouldStepAside } from "@/lib/shortcuts";
import { opener, personaFor, shiftRemark, type Persona } from "@/lib/mock/persona";
import { STAGE_GUIDE } from "@/lib/mock/guide";
import { BoardView, Whiteboard } from "@/app/mock/Whiteboard";
import { useScrollRegions } from "@/components/reader/scrollRegions";
import { EMPTY_BOARD } from "@/lib/mock/board";
import kit from "./mockKit.module.css";
import styles from "./room.module.css";

const FOLLOW_UP_SECONDS = 90;
const SHORT_PROMPT = 90;

function isShort(html: string): boolean {
  return html.replace(/<[^>]*>/g, "").length <= SHORT_PROMPT;
}

const PracticeWorkspace = dynamic(
  () => import("@/components/practice/PracticeWorkspace").then((m) => m.PracticeWorkspace),
  {
    loading: () => (
      <p className={styles.loading} role="status">
        Loading the editor…
      </p>
    ),
  }
);

const LEVEL_LABEL: Record<Seniority, string> = { junior: "2–3 years", mid: "5–7 years", senior: "10+ years" };

const MARKS: [Mark, string][] = [
  [0, "No"],
  [0.5, "Partly"],
  [1, "Yes"],
];

type Dispatch = (a: Action) => void;

function Avatar({ persona, big = false }: { persona: Persona; big?: boolean }) {
  return (
    <span className={kit.avatar} data-tone={persona.tone} data-big={big || undefined} aria-hidden="true">
      {persona.initials}
    </span>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <span className={kit.keys}>{children}</span>;
}

function StageBrief({ session, info, dispatch }: { session: Session; info: StageInfo; dispatch: Dispatch }) {
  const { stageIndex } = stagePosition(session);
  const plan = session.plan[stageIndex];
  const persona = personaFor(info.id, session.config);
  const guide = STAGE_GUIDE[info.id];
  return (
    <div className={styles.briefGrid}>
      <section className={`${styles.pane} ${styles.briefMain}`} aria-labelledby="stage-title">
        <div className={styles.scroll} data-scroll-region="Round briefing">
          <div className={styles.briefBody}>
            <p className={kit.label}>
              {session.plan.length > 1 ? `Round ${stageIndex + 1} of ${session.plan.length}` : "One round"}
              {info.code ? ` · ${info.code}` : ""}
            </p>
            <h2 id="stage-title" className={styles.briefTitle}>
              {info.title}
            </h2>
            <p className={styles.briefPitch}>
              <span className={kit.highlight}>{guide.pitch}</span>
            </p>
            <dl className={styles.briefFacts}>
              {info.decides && (
                <div>
                  <dt>What it decides</dt>
                  <dd>{info.decides}</dd>
                </div>
              )}
              {info.failMode && (
                <div>
                  <dt>How it is usually lost</dt>
                  <dd>{info.failMode}</dd>
                </div>
              )}
            </dl>
            <p className={kit.label}>Shape of a strong answer</p>
            <ol className={styles.shape}>
              {guide.shape.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <div className={styles.briefTips}>
              <div className={kit.sticky} data-tone="mint">
                <p className={kit.label}>Do this</p>
                <ul className={styles.tipList}>
                  {guide.tips.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
              <div className={kit.sticky} data-tone="rose">
                <p className={kit.label}>Where marks are lost</p>
                <ul className={`${styles.tipList} ${styles.tipBad}`}>
                  {guide.markedDown.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.paneFoot}>
          <div className={styles.actions}>
            <button
              type="button"
              className={`${kit.btn} ${styles.walkInBtn}`}
              autoFocus
              onClick={() => dispatch({ type: "enter", at: Date.now() })}
            >
              Walk in
            </button>
            <Hint>
              <kbd>Enter</kbd>
            </Hint>
          </div>
        </div>
      </section>
      <aside className={styles.briefSide} aria-label="Who you are meeting">
        <div className={`${kit.paper} ${styles.personaCard}`}>
          <span className={kit.tape} aria-hidden="true" />
          <Avatar persona={persona} big />
          <b className={styles.personaName}>{persona.name}</b>
          <span className={styles.personaRole}>{persona.role}</span>
          {info.who && <span className={styles.personaWho}>Usually run by: {info.who}</span>}
        </div>
        <div className={styles.briefNumbers}>
          <div>
            <b>{plan?.questions}</b>
            <span>{info.kind === "coding" ? "problems, graded by tests" : "questions, out loud"}</span>
          </div>
          <div>
            <b>{plan?.minutes}</b>
            <span>minutes, about</span>
          </div>
        </div>
        {plan?.core && (
          <p className={styles.coreNote}>
            <span className={kit.coreBadge}>core round</span> A no-hire here sinks the loop, whatever the other rounds
            say.
          </p>
        )}
      </aside>
    </div>
  );
}

function Coach({ stage }: { stage: StageId }) {
  const guide = STAGE_GUIDE[stage];
  return (
    <div className={styles.coach}>
      <p className={kit.label}>Shape of a strong answer</p>
      <ol className={styles.shape} data-compact>
        {guide.shape.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <details className={styles.coachTips}>
        <summary>Tips for this round</summary>
        <ul className={styles.tipList}>
          {guide.tips.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}

function QuestionHead({ q, session, info }: { q: SessionQuestion; session: Session; info: StageInfo }) {
  const { inStage, ofStage } = stagePosition(session);
  const item = q.item as TalkItem;
  return (
    <div className={styles.qHead}>
      <span className={kit.label}>
        {info.title} · {inStage} of {ofStage}
      </span>
      <span className={styles.tag}>{item.originTitle}</span>
      {item.level !== "any" && <span className={styles.tag}>{LEVEL_LABEL[item.level]}</span>}
      {q.adapted && (
        <span className={styles.shiftTag} data-shift={q.adapted}>
          {q.adapted === "harder" ? "↑ raised the bar" : "↓ back to basics"}
        </span>
      )}
    </div>
  );
}

function Said({
  persona,
  aside,
  featured,
  children,
}: {
  persona: Persona;
  aside?: boolean;
  featured?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.said} data-aside={aside || undefined} data-featured={featured || undefined}>
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
  const panel = useRef<HTMLDivElement>(null);
  useScrollRegions(panel, item);
  return (
    <div ref={panel} className={`${styles.against} interview-body`}>
      <div>
        <span className={kit.label}>What you jotted</span>
        <div className={styles.yours}>{q.notes.trim()}</div>
        {q.followUp && q.followUpNotes.trim() && (
          <>
            <span className={kit.label}>…and when they pushed</span>
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
          <span className={kit.label}>The bar at {rung.label}</span>
          <p dangerouslySetInnerHTML={{ __html: rung.bar }} />
          <p>
            <i dangerouslySetInnerHTML={{ __html: rung.script }} />
          </p>
          <p className={styles.quiet} dangerouslySetInnerHTML={{ __html: rung.why }} />
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

      <p className={styles.readLink}>
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
    <aside className={`${styles.pane} ${styles.rubric}`} aria-labelledby="rubric-h">
      <div className={styles.paneHead}>
        <h3 id="rubric-h" className={styles.paneTitle}>
          Mark it honestly
        </h3>
        <Hint>
          <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd>
        </Hint>
      </div>
      <div className={styles.scroll} data-scroll-region="Rubric">
        {criteria.map((c) => (
          <div key={c.id} className={styles.criterion} role="group" aria-label={c.label}>
            <span className={styles.criterionLabel}>
              {c.label}
              <span className={styles.weight}>×{c.weight}</span>
            </span>
            <span className={styles.criterionHint}>{c.hint}</span>
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
      </div>
      <div className={styles.paneFoot}>
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
            className={kit.btn}
            disabled={!complete}
            onClick={() => dispatch({ type: "next", at: Date.now() })}
          >
            Next question
          </button>
          {!complete && <Hint>mark every line first</Hint>}
          {complete && (
            <Hint>
              <kbd>Enter</kbd>
            </Hint>
          )}
        </div>
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
  const persona = personaFor(q.stage, session.config);
  const [padView, setPadView] = useState<"notes" | "board">("notes");
  const { inStage } = stagePosition(session);
  const seconds = MINUTES_PER_TALK[session.config.seniority] * 60;
  const expire = useCallback(() => dispatch({ type: "answered", at: Date.now(), timedOut: true }), [dispatch]);
  const expireFollowUp = useCallback(() => dispatch({ type: "followup-answered" }), [dispatch]);

  if (session.step === "answer") {
    const onBoard = padView === "board" && q.stage === "design";
    return (
      <div className={styles.split}>
        <section className={styles.pane} aria-labelledby="q-prompt">
          <div className={styles.paneHead}>
            <QuestionHead q={q} session={session} info={info} />
          </div>
          <div className={styles.scroll} data-scroll-region="The interview">
            <div className={styles.chat} role="log" aria-label={`Interview with ${persona.name}`}>
              {inStage === 1 && (
                <Said persona={persona} aside>
                  {opener(persona, q.stage, session.startedAt + session.cursor)}
                </Said>
              )}
              {q.adapted && (
                <Said persona={persona} aside>
                  {shiftRemark(q.adapted, persona)}
                </Said>
              )}
              <Said persona={persona} featured>
                <h2
                  id="q-prompt"
                  className={styles.prompt}
                  data-short={isShort(item.prompt) || undefined}
                  dangerouslySetInnerHTML={{ __html: item.prompt }}
                />
              </Said>
            </div>
          </div>
          <div className={styles.paneFoot}>
            <Coach stage={q.stage} />
          </div>
        </section>
        <section className={styles.pane} aria-label="Your answer">
          <div className={styles.paneHead}>
            {q.stage === "design" ? (
              <div className={styles.pads} role="tablist" aria-label="Answer with">
                {(["notes", "board"] as const).map((pad) => (
                  <button
                    key={pad}
                    type="button"
                    role="tab"
                    aria-selected={padView === pad}
                    className={styles.pad}
                    onClick={() => setPadView(pad)}
                  >
                    {pad === "notes"
                      ? "Notes"
                      : `Whiteboard${q.board?.shapes.length ? ` (${q.board.shapes.length})` : ""}`}
                  </button>
                ))}
              </div>
            ) : (
              <label className={styles.notesLabel} htmlFor="mock-notes">
                Say it out loud. Jot the skeleton here if it helps — it is kept for the review.
              </label>
            )}
            <span className={styles.spacer} />
            {q.startedAt !== null && <TimerRing startedAt={q.startedAt} seconds={seconds} onExpire={expire} />}
          </div>
          {onBoard ? (
            <div className={styles.scroll} data-scroll-region="Whiteboard">
              <Whiteboard board={q.board ?? EMPTY_BOARD} onChange={(board) => dispatch({ type: "board", board })} />
            </div>
          ) : (
            <div className={styles.padBody}>
              {q.stage === "design" && (
                <label className={styles.notesLabel} htmlFor="mock-notes">
                  Say it out loud. Jot the skeleton here if it helps — it is kept for the review.
                </label>
              )}
              <textarea
                id="mock-notes"
                className={styles.notes}
                value={q.notes}
                autoFocus
                onChange={(e) => dispatch({ type: "notes", text: e.target.value })}
              />
            </div>
          )}
          <div className={styles.paneFoot}>
            <div className={styles.actions}>
              <button
                type="button"
                className={kit.btn}
                onClick={() => dispatch({ type: "answered", at: Date.now(), timedOut: false })}
              >
                I&apos;ve answered
              </button>
              <button
                type="button"
                className={`${kit.btn} ${kit.btnQuiet}`}
                onClick={() => dispatch({ type: "skip", at: Date.now() })}
              >
                Skip — I don&apos;t know
              </button>
              <Hint>
                <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>Enter</kbd> when you are done
              </Hint>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (session.step === "followup" && q.followUp) {
    return (
      <div className={styles.split}>
        <section className={styles.pane} aria-labelledby="q-push">
          <div className={styles.paneHead}>
            <QuestionHead q={q} session={session} info={info} />
          </div>
          <div className={styles.scroll} data-scroll-region="The interview">
            <div className={styles.chat} role="log" aria-label={`Interview with ${persona.name}`}>
              <Said persona={persona}>
                <p className={styles.saidQuiet} dangerouslySetInnerHTML={{ __html: item.prompt }} />
              </Said>
              <YouSaid text={q.notes} />
              <Said persona={persona}>
                <div className={kit.sticky}>
                  <span className={kit.tape} aria-hidden="true" />
                  <span className={styles.pushWho}>Follow-up</span>
                  <p id="q-push" className={styles.pushText} dangerouslySetInnerHTML={{ __html: q.followUp }} />
                </div>
              </Said>
            </div>
          </div>
        </section>
        <section className={styles.pane} aria-label="Your answer">
          <div className={styles.paneHead}>
            <label className={styles.notesLabel} htmlFor="mock-followup">
              A follow-up is where a prepared answer runs out. Take the question, not the one you wish they had asked.
            </label>
            <span className={styles.spacer} />
            {q.startedAt !== null && (
              <TimerRing
                startedAt={q.answeredAt ?? q.startedAt}
                seconds={FOLLOW_UP_SECONDS}
                onExpire={expireFollowUp}
              />
            )}
          </div>
          <div className={styles.padBody}>
            <textarea
              id="mock-followup"
              className={styles.notes}
              value={q.followUpNotes}
              autoFocus
              onChange={(e) => dispatch({ type: "followup-notes", text: e.target.value })}
            />
          </div>
          <div className={styles.paneFoot}>
            <div className={styles.actions}>
              <button type="button" className={kit.btn} onClick={() => dispatch({ type: "followup-answered" })}>
                Answered — show me
              </button>
              <Hint>
                <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>Enter</kbd>
              </Hint>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.split}>
      <section className={styles.pane} aria-labelledby="q-review">
        <div className={styles.paneHead}>
          <QuestionHead q={q} session={session} info={info} />
        </div>
        <div className={styles.scroll} data-scroll-region="The model answer">
          <div className={styles.reviewQuote}>
            <h2
              id="q-review"
              className={styles.prompt}
              data-short={isShort(item.prompt) || undefined}
              dangerouslySetInnerHTML={{ __html: item.prompt }}
            />
          </div>
          {q.timedOut && (
            <p className="warn">The clock ran out before you finished. In the room they would have moved on.</p>
          )}
          {q.board && q.board.shapes.length > 0 && (
            <figure className={styles.boardFigure}>
              <BoardView board={q.board} />
              <figcaption className={kit.keys}>Your whiteboard</figcaption>
            </figure>
          )}
          <AgainstPanel item={item} q={q} seniority={session.config.seniority} />
        </div>
      </section>
      <Rubric q={q} dispatch={dispatch} />
    </div>
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
      <div className={styles.outcomeWrap}>
        <section className={`${kit.paper} ${styles.outcomeCard}`} aria-labelledby="c-review">
          <span className={kit.tape} aria-hidden="true" />
          <p className={kit.label}>
            {info.title} · {inStage} of {ofStage}
          </p>
          <h2 id="c-review" className={styles.codingTitle}>
            {item.title}
          </h2>
          {q.timedOut && <p className="warn">You went over the time for this problem.</p>}
          <div className={styles.outcome}>
            <div className={styles.outcomeTile}>
              <span className={styles.outcomeNum}>
                {outcome?.passed ?? 0}/{outcome?.total ?? item.tests}
              </span>
              <span className={styles.outcomeLabel}>tests passing when you submitted</span>
            </div>
            <div className={styles.outcomeTile}>
              <span className={styles.outcomeNum}>{outcome?.hintsUsed ?? 0}</span>
              <span className={styles.outcomeLabel}>hints opened · −5% each, up to −15%</span>
            </div>
            <div className={styles.outcomeTile}>
              <span className={styles.outcomeNum}>{outcome?.sawSolution ? "yes" : "no"}</span>
              <span className={styles.outcomeLabel}>looked at the solution · caps it at 30%</span>
            </div>
          </div>
          {!outcome?.total || (outcome && outcome.passed === 0 && !outcome.sawSolution) ? (
            <p className={styles.quiet}>
              Nothing passed — if you never pressed <b>Submit</b> in the editor, the tests never ran. Run them before
              you move on next time; an interviewer only sees what works.
            </p>
          ) : null}
          <div className={styles.meter}>
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
              className={kit.btn}
              autoFocus
              onClick={() => dispatch({ type: "next", at: Date.now() })}
            >
              Next question
            </button>
            <Link className={`${kit.btn} ${kit.btnGhost}`} href={item.href} target="_blank" rel="noopener">
              Open the problem on its own ↗
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.codingRoom}>
      <div className={styles.codingHead}>
        <div className={styles.codingWho}>
          <p className={kit.label}>
            {info.title} · {inStage} of {ofStage}
          </p>
          <span className={styles.codingTitle}>{item.title}</span>
          <p className={styles.codingNote}>
            Press <b>Submit</b> in the editor to run the tests — what is passing when you hand it in is your score.
          </p>
        </div>
        <span className={styles.tag}>{item.level}</span>
        <span className={styles.tag}>{item.tests} tests</span>
        <span className={styles.spacer} />
        {q.startedAt !== null && <InlineTimer startedAt={q.startedAt} seconds={seconds} />}
        <button
          type="button"
          className={kit.btn}
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
        <button
          type="button"
          className={`${kit.btn} ${kit.btnQuiet}`}
          onClick={() => dispatch({ type: "skip", at: Date.now() })}
        >
          Skip
        </button>
      </div>
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
          <p className={styles.loading} role="status">
            Loading the editor…
          </p>
        )}
      </div>
    </div>
  );
}

export function Room({
  session,
  stages,
  dispatch,
}: {
  session: Session;
  stages: Record<StageId, StageInfo>;
  dispatch: Dispatch;
}) {
  const q = currentQuestion(session);
  const info = q ? stages[q.stage] : null;
  const root = useRef<HTMLDivElement>(null);
  useScrollRegions(root, `${q?.item.id}:${session.step}`);

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
      if (inEditor || !q || target?.closest("[role=dialog]")) return;

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
        if (shortcutShouldStepAside(e)) return;
        e.preventDefault();
        dispatch({ type: "enter", at: Date.now() });
      } else if (e.key === "Enter" && session.step === "review" && q.item.kind === "talk" && !firstUnmarked) {
        if (shortcutShouldStepAside(e)) return;
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
    <div className={styles.room} ref={root} data-step={session.step} data-kind={q.item.kind}>
      {session.step === "brief" ? (
        <StageBrief session={session} info={info} dispatch={dispatch} />
      ) : q.item.kind === "talk" ? (
        <TalkQuestion session={session} q={q} info={info} dispatch={dispatch} />
      ) : (
        <CodingQuestion session={session} q={q} info={info} dispatch={dispatch} />
      )}
    </div>
  );
}
