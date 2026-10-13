"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { TopicFrame, type FrameTopic } from "@/components/topic/TopicFrame";
import { TopicPage } from "@/components/topic/TopicKit";
import type { Question } from "@/content/quiz-types";
import { startingOrder } from "@/lib/checkDraw";
import { useMounted } from "@/lib/hooks";
import {
  NOT_SURE,
  STAGES,
  answerQuestion,
  currentQuestion,
  placementDone,
  placementResult,
  startPlacement,
  type PlacementContext,
  type PlacementInput,
  type PlacementState,
} from "@/lib/placement";
import { summarizeBank, thinNote, type BankSummary } from "@/lib/placementBank";
import {
  clearDraft,
  draftFitsBank,
  readDraft,
  writeDraft,
  type DraftStep,
  type PlacementDraft,
} from "@/lib/placementDraft";
import { levelWords, pickLevelPath, planSummary, planView, type PlanData } from "@/lib/placementPlan";
import { beginningPlacement, placementFromResult } from "@/lib/placementRecord";
import { clearPlacement, savePlacement, usePlacement } from "@/lib/placementStore";
import { loadPlacementBank } from "@/lib/quizPool";
import { levelStop, levelTone } from "./levelTone";
import { PlacementAsk } from "./PlacementAsk";
import { IntroSkeleton, PlacementIntro, type IntroPlan } from "./PlacementIntro";
import { PlacementPlan } from "./PlacementPlan";
import { answerOf } from "./PlacementQuestion";
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
        <div className={styles.page}>
          <IntroSkeleton />
        </div>
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
  const stage = asking?.state.stage ?? null;
  const askLevel = stage ? STAGES[stage].level : (asking?.state.level ?? "beginner");
  const plan: IntroPlan | null = placement
    ? {
        level: levelWords(placement.level, data.levelNames),
        tone: levelTone(placement.level),
        step: levelStop(placement.level),
        summary: planSummary(planView(placement, data.chapters)),
      }
    : null;

  return (
    <TopicFrame
      topic={topic}
      back={{ href: topic.href, label: `Back to ${topic.name}` }}
      skip={{ label: "Skip to the placement" }}
      layout="reader"
    >
      <TopicPage accent={topic.accent}>
        <div className={styles.page}>
          {asking && question ? (
            <PlacementAsk
              leaveHref={topic.href}
              question={question}
              answered={answered}
              capacity={summary?.capacity ?? 0}
              guaranteed={summary?.start ?? 0}
              tone={levelTone(askLevel)}
              picked={asking.picked}
              onPick={(picked) => setStarted({ ...asking, picked })}
              onNext={() => submit(answerOf(question, asking.picked))}
              onNotSure={() => submit(NOT_SURE)}
              onBack={asking.history.length > 0 ? back : undefined}
              onStartOver={startOver}
            />
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
            <PlacementIntro
              summary={summary}
              note={emptyBank ? null : note}
              emptyBank={emptyBank}
              canBegin={canBegin}
              plan={plan}
              pickHref={pickLevelPath(data.topicId)}
              onBegin={begin}
              onKeep={keepPlan}
              onStartFromBeginning={startFromTheBeginning}
            />
          )}
        </div>
      </TopicPage>
    </TopicFrame>
  );
}
