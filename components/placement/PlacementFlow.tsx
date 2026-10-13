"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Copy, Scene } from "@/components/home/Stage";
import { Card, Compose, Remark } from "@/components/topic/Compose";
import { TopicFrame, type FrameTopic } from "@/components/topic/TopicFrame";
import {
  Actions,
  CardKicker,
  Facts,
  Heading,
  Kicker,
  Lead,
  TopicPage,
  Underlined,
  topicKit,
} from "@/components/topic/TopicKit";
import type { Question } from "@/content/quiz-types";
import { startingOrder } from "@/lib/checkDraw";
import { useMounted } from "@/lib/hooks";
import {
  NOT_SURE,
  answerQuestion,
  currentQuestion,
  placementDone,
  placementResult,
  startPlacement,
  type PlacementContext,
  type PlacementInput,
  type PlacementState,
} from "@/lib/placement";
import { minutesText, questionCountText, summarizeBank, thinNote, type BankSummary } from "@/lib/placementBank";
import {
  clearDraft,
  draftFitsBank,
  readDraft,
  writeDraft,
  type DraftStep,
  type PlacementDraft,
} from "@/lib/placementDraft";
import { pickLevelPath, type PlanData } from "@/lib/placementPlan";
import { beginningPlacement, placementFromResult } from "@/lib/placementRecord";
import { clearPlacement, savePlacement, usePlacement } from "@/lib/placementStore";
import { loadPlacementBank } from "@/lib/quizPool";
import { plural } from "@/lib/format";
import { PlacementPlan } from "./PlacementPlan";
import { PlacementQuestion, answerOf } from "./PlacementQuestion";
import styles from "./placement.module.css";

interface Asking {
  state: PlacementState;
  startedAt: number;
  picked: string[];
  history: DraftStep[];
}

function initialPick(question: Question): string[] {
  if (question.kind !== "order") return [];
  return startingOrder(
    question.items.map((item) => item.id),
    Math.random
  );
}

function resume(ctx: PlacementContext): Asking | null {
  const draft: PlacementDraft | null = readDraft();
  if (!draft) return null;
  const question = draftFitsBank(draft, ctx) ? currentQuestion(draft.state, ctx) : null;
  if (!question) {
    clearDraft();
    return null;
  }
  return { state: draft.state, startedAt: draft.startedAt, history: draft.history, picked: initialPick(question) };
}

function subscribeToLocation(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

const locationSearch = () => window.location.search;
const noSearch = () => "";

function dropRetakeFromUrl() {
  const query = new URLSearchParams(window.location.search);
  if (!query.has("retake")) return;
  query.delete("retake");
  const rest = query.toString();
  window.history.replaceState(window.history.state, "", `${window.location.pathname}${rest ? `?${rest}` : ""}`);
}

function Shell({ topic }: { topic: FrameTopic }) {
  return (
    <TopicFrame
      topic={topic}
      back={{ href: topic.href, label: `Back to ${topic.name}` }}
      skip={{ label: "Skip to the placement" }}
      layout="reader"
    >
      <TopicPage accent={topic.accent}>
        <Scene className={topicKit.hero}>
          <Copy>
            <Kicker mark="?" id="placement-kicker">
              Find my level
            </Kicker>
            <Heading id="placement-title">
              Let&apos;s find your <Underlined>starting point</Underlined>
            </Heading>
            <div className={styles.shell} role="status" aria-label="Loading the placement">
              <span />
              <span />
              <span />
            </div>
          </Copy>
        </Scene>
      </TopicPage>
    </TopicFrame>
  );
}

export function PlacementFlow({ topic, data, basePath }: { topic: FrameTopic; data: PlanData; basePath: string }) {
  const mounted = useMounted();
  const placement = usePlacement();
  const router = useRouter();
  const search = useSyncExternalStore(subscribeToLocation, locationSearch, noSearch);
  const [retakeChoice, setRetakeChoice] = useState<boolean | null>(null);
  const [bank, setBank] = useState<Question[] | null>(null);
  const [started, setStarted] = useState<Asking | null | undefined>(undefined);
  const [fresh, setFresh] = useState(false);
  const focusId = useRef<string | null>(null);

  const retaking = retakeChoice ?? new URLSearchParams(search).get("retake") === "1";

  useEffect(() => {
    let live = true;
    void loadPlacementBank().then((questions) => {
      if (live) setBank(questions);
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (!focusId.current) return;
    const target = document.getElementById(focusId.current);
    focusId.current = null;
    if (!target) return;
    target.tabIndex = -1;
    target.focus({ preventScroll: true });
  });

  const ctx = useMemo<PlacementContext | null>(
    () => (bank ? { chapters: data.chapters, bank } : null),
    [bank, data.chapters]
  );
  const summary: BankSummary | null = useMemo(() => (ctx ? summarizeBank(ctx) : null), [ctx]);
  const canBegin = useMemo(() => ctx !== null && !placementDone(startPlacement(ctx)), [ctx]);
  const emptyBank = bank !== null && !canBegin;
  const written = data.chapters.filter((chapter) => chapter.ready).length;
  const note = summary ? thinNote(summary, written, data.levelNames) : null;

  const resumed = useMemo(() => (ctx ? resume(ctx) : null), [ctx]);
  const asking = started === undefined ? resumed : started;

  function leaveRetake() {
    setRetakeChoice(false);
    dropRetakeFromUrl();
  }

  function startFromTheBeginning() {
    savePlacement(beginningPlacement(data.chapters, Date.now()));
    const first = data.chapters.find((chapter) => chapter.ready);
    router.push(first ? `${basePath}/${first.id}` : topic.href);
  }

  function begin() {
    if (!ctx) return;
    const state = startPlacement(ctx);
    const first = currentQuestion(state, ctx);
    if (!first) return;
    clearDraft();
    setFresh(false);
    setStarted({ state, startedAt: Date.now(), picked: initialPick(first), history: [] });
  }

  function submit(input: PlacementInput) {
    if (!ctx || !asking) return;
    const question = currentQuestion(asking.state, ctx);
    if (!question) return;
    const state = answerQuestion(asking.state, ctx, input, question.id);
    const following = currentQuestion(state, ctx);
    if (placementDone(state) || !following) {
      const seconds = Math.round((Date.now() - asking.startedAt) / 1000);
      savePlacement(placementFromResult(placementResult(state, ctx), Date.now(), seconds));
      clearDraft();
      setStarted(null);
      setRetakeChoice(false);
      dropRetakeFromUrl();
      setFresh(true);
      return;
    }
    const history = [...asking.history, { state: asking.state, picked: asking.picked }];
    writeDraft({ startedAt: asking.startedAt, state, history });
    setStarted({ ...asking, state, history, picked: initialPick(following) });
  }

  function back() {
    if (!asking || asking.history.length === 0) return;
    const history = asking.history.slice(0, -1);
    const previous = asking.history[asking.history.length - 1];
    writeDraft({ startedAt: asking.startedAt, state: previous.state, history });
    setStarted({ ...asking, state: previous.state, history, picked: previous.picked });
  }

  function startOver() {
    clearDraft();
    setStarted(null);
    focusId.current = "placement-title";
  }

  function keepPlan() {
    leaveRetake();
    focusId.current = "plan-heading";
  }

  function resetPlan() {
    clearPlacement();
    setStarted(null);
    setRetakeChoice(false);
    dropRetakeFromUrl();
    setFresh(false);
    focusId.current = "placement-title";
  }

  if (!mounted) return <Shell topic={topic} />;

  const question = ctx && asking ? currentQuestion(asking.state, ctx) : null;
  const answered = asking ? asking.state.answers.length : 0;

  return (
    <TopicFrame
      topic={topic}
      back={{ href: topic.href, label: `Back to ${topic.name}` }}
      skip={{ label: "Skip to the placement" }}
      layout="reader"
    >
      <TopicPage accent={topic.accent}>
        {asking && question ? (
          <div className={styles.asking}>
            <div className={styles.askingHead}>
              <Kicker mark="?">Finding your level</Kicker>
              <h1 className={styles.askingTitle}>
                Question {answered + 1}
                {summary && summary.capacity > 0 && (
                  <span className={styles.askingOf}>
                    {" "}
                    of {summary.capacity > summary.start ? "up to " : ""}
                    {summary.capacity}
                  </span>
                )}
              </h1>
              {summary && summary.capacity > 0 && (
                <div className={styles.dots} aria-hidden="true">
                  {Array.from({ length: summary.capacity }, (_, index) => (
                    <i key={index} data-state={index < answered ? "done" : index === answered ? "now" : "todo"} />
                  ))}
                </div>
              )}
              <p className={styles.askingNote}>
                {summary ? `${questionCountText(summary)}, no timer. ` : "No timer. "}
                &ldquo;Not sure yet&rdquo; is always a fine answer.
              </p>
            </div>
            <div className={styles.sheet}>
              <PlacementQuestion
                question={question}
                number={answered + 1}
                picked={asking.picked}
                onPick={(picked) => setStarted({ ...asking, picked })}
                onNext={() => submit(answerOf(question, asking.picked))}
                onNotSure={() => submit(NOT_SURE)}
                onBack={asking.history.length > 0 ? back : undefined}
              />
            </div>
            <p className={styles.askingFoot}>
              <button type="button" className={styles.textButton} data-start-over="" onClick={startOver}>
                Start over
              </button>
            </p>
          </div>
        ) : placement && !retaking ? (
          <PlacementPlan
            data={data}
            basePath={basePath}
            homeHref={topic.href}
            topicName={topic.name}
            record={placement}
            fresh={fresh}
            bankNote={placement.mode === "quiz" ? note : null}
            onRetake={() => setRetakeChoice(true)}
            onReset={resetPlan}
          />
        ) : (
          <Scene className={topicKit.hero}>
            <Copy>
              <Kicker mark="?" id="placement-kicker">
                Find my level
              </Kicker>
              <Heading id="placement-title">
                Let&apos;s find your <Underlined>starting point</Underlined>
              </Heading>
              <Lead>
                {summary && !emptyBank
                  ? `A short placement: ${questionCountText(summary)}, ${minutesText(summary)}, no timer. `
                  : "A short placement with no timer. "}
                You get a level and a plan, and every chapter stays open either way.
              </Lead>
              {note && !emptyBank && (
                <p className={styles.keepNote} data-bank-note="">
                  {note}
                </p>
              )}
              <Actions>
                <button
                  type="button"
                  className={topicKit.btn}
                  id="placement-begin"
                  disabled={!canBegin}
                  onClick={begin}
                >
                  {placement ? "Retake the placement" : "Begin the placement"} <span aria-hidden="true">→</span>
                </button>
                {placement && (
                  <button type="button" className={topicKit.btnGhost} id="placement-keep" onClick={keepPlan}>
                    Keep my current plan
                  </button>
                )}
                {!emptyBank && (placement === null || note !== null) && (
                  <Link className={topicKit.btnGhost} href={pickLevelPath(data.topicId)} prefetch={false}>
                    I&apos;ll pick a level
                  </Link>
                )}
              </Actions>
              {emptyBank && (
                <>
                  <p className={styles.keepNote} role="status">
                    The placement questions are not written yet, so there is nothing to answer. Start from the beginning
                    or pick a level instead.
                  </p>
                  <Actions>
                    <button type="button" className={topicKit.btn} onClick={startFromTheBeginning}>
                      Start from the beginning <span aria-hidden="true">→</span>
                    </button>
                    <Link className={topicKit.btnGhost} href={pickLevelPath(data.topicId)} prefetch={false}>
                      I&apos;ll pick a level
                    </Link>
                  </Actions>
                </>
              )}
            </Copy>
            <Compose live layout="rail">
              <Card at="a" tilt={-1} taped>
                <CardKicker>How it works</CardKicker>
                <ul className={styles.bullets}>
                  <li>
                    {summary && summary.start > 0
                      ? `${plural(summary.start, "question")} to start${
                          summary.capacity > summary.start ? ", and more only while you are doing well" : ""
                        }.`
                      : "A few questions to start, and more only while you are doing well."}
                  </li>
                  <li>
                    <strong>Not sure yet</strong> is always allowed. It counts as a miss, nothing more.
                  </li>
                  <li>
                    Your ticks, XP and review queue are never touched
                    {placement ? ", and your current plan stays until you finish." : "."}
                  </li>
                </ul>
                <Remark>no score shown, ever</Remark>
              </Card>
              <Card as="aside" aria-label="The placement in numbers" at="b" tilt={1}>
                <Facts
                  items={[
                    {
                      value: summary ? summary.capacity : "...",
                      label: summary && summary.capacity === summary.start ? "questions" : "questions at most",
                    },
                    { value: summary ? `~${summary.minutes} min` : "...", label: "start to plan" },
                    { value: "none", label: "timers" },
                  ]}
                />
              </Card>
            </Compose>
          </Scene>
        )}
      </TopicPage>
    </TopicFrame>
  );
}
