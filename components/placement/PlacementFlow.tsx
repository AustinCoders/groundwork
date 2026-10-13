"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
  MAX_QUESTIONS,
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
import { pickLevelPath, type PlanData } from "@/lib/placementPlan";
import { beginningPlacement, placementFromResult } from "@/lib/placementRecord";
import { clearPlacement, savePlacement, usePlacement } from "@/lib/placementStore";
import { loadPlacementBank } from "@/lib/quizPool";
import { PlacementPlan } from "./PlacementPlan";
import { PlacementQuestion, answerOf } from "./PlacementQuestion";
import styles from "./placement.module.css";

interface Asking {
  state: PlacementState;
  startedAt: number;
  picked: string[];
}

function initialPick(question: Question): string[] {
  if (question.kind !== "order") return [];
  return startingOrder(
    question.items.map((item) => item.id),
    Math.random
  );
}

export function PlacementFlow({ topic, data, basePath }: { topic: FrameTopic; data: PlanData; basePath: string }) {
  const mounted = useMounted();
  const placement = usePlacement();
  const params = useSearchParams();
  const router = useRouter();
  const [retaking, setRetaking] = useState(() => params.get("retake") !== null);
  const [bank, setBank] = useState<Question[] | null>(null);
  const [asking, setAsking] = useState<Asking | null>(null);
  const [fresh, setFresh] = useState(false);

  useEffect(() => {
    let live = true;
    void loadPlacementBank().then((questions) => {
      if (live) setBank(questions);
    });
    return () => {
      live = false;
    };
  }, []);

  const ctx = useMemo<PlacementContext | null>(
    () => (bank ? { chapters: data.chapters, bank } : null),
    [bank, data.chapters]
  );
  const canBegin = useMemo(() => ctx !== null && !placementDone(startPlacement(ctx)), [ctx]);
  const coverage = bank ? new Set(bank.map((question) => question.chapter)).size : null;

  const emptyBank = bank !== null && !canBegin;

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
    setFresh(false);
    setAsking({ state, startedAt: Date.now(), picked: initialPick(first) });
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
      setAsking(null);
      setRetaking(false);
      setFresh(true);
      return;
    }
    setAsking({ ...asking, state, picked: initialPick(following) });
  }

  const question = ctx && asking ? currentQuestion(asking.state, ctx) : null;
  const answered = asking ? asking.state.answers.length : 0;

  return (
    <TopicFrame
      topic={topic}
      back={{ href: topic.href, label: topic.name }}
      skip={{ label: "Skip to the placement" }}
      layout="reader"
    >
      <TopicPage accent={topic.accent}>
        {asking && question ? (
          <div className={styles.asking}>
            <div className={styles.askingHead}>
              <Kicker mark="?">Finding your level</Kicker>
              <h1 className={styles.askingTitle}>
                Question {answered + 1} <span className="visually-hidden">of up to {MAX_QUESTIONS}</span>
              </h1>
              <p className={styles.askingNote}>
                Up to {MAX_QUESTIONS} questions, no timer. &ldquo;Not sure yet&rdquo; is always a fine answer.
              </p>
            </div>
            <div className={styles.sheet}>
              <PlacementQuestion
                question={question}
                number={answered + 1}
                picked={asking.picked}
                onPick={(picked) => setAsking({ ...asking, picked })}
                onNext={() => submit(answerOf(question, asking.picked))}
                onNotSure={() => submit(NOT_SURE)}
              />
            </div>
          </div>
        ) : mounted && placement && !retaking ? (
          <PlacementPlan
            data={data}
            basePath={basePath}
            homeHref={topic.href}
            topicName={topic.name}
            record={placement}
            fresh={fresh}
            coverage={coverage}
            onRetake={() => setRetaking(true)}
            onReset={() => {
              clearPlacement();
              setRetaking(false);
              setFresh(false);
            }}
          />
        ) : (
          <Scene className={`${topicKit.hero} ${mounted ? "" : styles.pending}`}>
            <Copy>
              <Kicker mark="?" id="placement-kicker">
                Find my level
              </Kicker>
              <Heading id="placement-title">
                Where should you <Underlined>start</Underlined>?
              </Heading>
              <Lead>
                A short placement: about 10 minutes, no timer, never more than {MAX_QUESTIONS} questions. You get a
                level and a plan, and every chapter stays open either way.
              </Lead>
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
                  <button type="button" className={topicKit.btnGhost} onClick={() => setRetaking(false)}>
                    Keep my current plan
                  </button>
                )}
                {!placement && !emptyBank && (
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
                  <li>Six questions to start, and more only while you are doing well.</li>
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
                    { value: MAX_QUESTIONS, label: "questions at most" },
                    { value: "~10 min", label: "start to plan" },
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
