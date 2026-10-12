"use client";

import { Copy, Scene } from "@/components/home/Stage";
import { Card, Column, Compose, Remark, Tag } from "@/components/topic/Compose";
import { Actions, CardKicker, Chips, Heading, Kicker, Lead, Underlined, topicKit } from "@/components/topic/TopicKit";
import { useMounted } from "@/lib/hooks";
import { stagePosition, type Session } from "@/lib/mock/session";
import { VERDICT_LABEL } from "@/lib/mock/scoring";
import type { HistoryEntry } from "@/lib/mock/storage";
import type { StageId, StageInfo } from "@/lib/mock/types";
import kit from "./mockKit.module.css";
import styles from "./lobby.module.css";

const RING = 2 * Math.PI * 18;

function PickUp({
  inProgress,
  stages,
  last,
  onResume,
  onDiscard,
}: {
  inProgress: Session | null;
  stages: Record<StageId, StageInfo>;
  last: HistoryEntry | undefined;
  onResume: () => void;
  onDiscard: () => void;
}) {
  const mounted = useMounted();
  const position = inProgress ? stagePosition(inProgress) : null;
  const stage = inProgress && position ? stages[inProgress.plan[position.stageIndex]?.stage] : null;
  return (
    <Card as="aside" aria-label="Pick up" at="c" tilt={-1}>
      <div className={mounted ? styles.pickBody : `${styles.pickBody} ${topicKit.pending}`}>
        {inProgress && position ? (
          <div role="status">
            <CardKicker>Pick up where you left off</CardKicker>
            <p className={styles.pickTitle}>You left an interview half-way.</p>
            <p className={styles.pickMeta}>
              {stage?.title}, stage {position.stageIndex + 1} of {inProgress.plan.length} · question{" "}
              {inProgress.cursor + 1} of {inProgress.questions.length}
            </p>
            <div className={styles.pickActions}>
              <button type="button" className={`${kit.btn} ${kit.btnSmall}`} onClick={onResume}>
                Walk back in
              </button>
              <button type="button" className={`${kit.btn} ${kit.btnQuiet} ${kit.btnSmall}`} onClick={onDiscard}>
                Throw it away
              </button>
            </div>
          </div>
        ) : last ? (
          <>
            <CardKicker>Your last one</CardKicker>
            <p className={styles.pickTitle}>
              {VERDICT_LABEL[last.verdict]} · {Math.round(last.score * 100)}%
            </p>
            <p className={styles.pickMeta}>
              {last.mode === "loop" ? "A full loop" : last.mode === "retry" ? "A retry round" : "A single round"} on{" "}
              {new Date(last.finishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}. The numbers
              are further down.
            </p>
          </>
        ) : (
          <>
            <CardKicker>First time here?</CardKicker>
            <p className={styles.pickTitle}>Nothing saved yet.</p>
            <p className={styles.pickMeta}>
              Your loops, scores and notes stay in this browser. Plan one below and it starts building your record.
            </p>
          </>
        )}
      </div>
    </Card>
  );
}

export function LobbyHero({
  stages,
  rounds,
  questions,
  problems,
  inProgress,
  history,
  onResume,
  onDiscard,
  onPlan,
}: {
  stages: Record<StageId, StageInfo>;
  rounds: number;
  questions: number;
  problems: number;
  inProgress: Session | null;
  history: HistoryEntry[];
  onResume: () => void;
  onDiscard: () => void;
  onPlan: (which: "loop" | "drill") => void;
}) {
  return (
    <Scene className={topicKit.hero}>
      <Copy>
        <Kicker mark="Q">Timed · scored · follow-ups included</Kicker>
        <Heading id="mock-title">
          A mock interview that <Underlined>pushes back.</Underlined>
        </Heading>
        <Lead>
          The whole loop, round by round: the recruiter, coding graded by real tests, the deep dives, system design,
          behaviour and the number. Answer out loud against a clock, get pushed the way real interviewers push, and
          leave with a debrief that decides like a hiring committee.
        </Lead>
        <Actions>
          <button type="button" className={topicKit.btn} onClick={() => onPlan("loop")}>
            Plan a full loop
          </button>
          <button type="button" className={topicKit.btnGhost} onClick={() => onPlan("drill")}>
            Practise one round
          </button>
        </Actions>
        <Chips>
          <span className={topicKit.chip}>{rounds} rounds</span>
          <span className={topicKit.chip}>{questions} questions with model answers</span>
          <span className={topicKit.chip}>{problems} coding problems with tests</span>
        </Chips>
      </Copy>
      <Compose live layout="trio">
        <Card decor at="a" tilt={-1} taped>
          <Tag tone="success">★ Hire</Tag>
          <div className={styles.previewHead}>
            <span className={kit.avatar} data-tone="calm">
              PR
            </span>
            <span className={styles.previewWho}>
              <b>Priya</b>
              <small>Principal engineer · System design</small>
            </span>
            <span className={styles.previewClock}>
              <svg viewBox="0 0 44 44" width="44" height="44">
                <circle cx="22" cy="22" r="18" className={styles.ringTrack} />
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  className={styles.ringFill}
                  strokeDasharray={RING}
                  strokeDashoffset={RING * 0.38}
                />
              </svg>
              <em>6:12</em>
            </span>
          </div>
          <p className={styles.ask}>
            <span className={kit.highlight}>Design a URL shortener that handles 10,000 writes a second.</span>
          </p>
          <p className={styles.you}>Before I draw anything: reads or writes heavier? And how long do links live?</p>
        </Card>
        <Column at="b">
          <Card decor extra tone="alert" tilt={1}>
            <CardKicker>Follow-up</CardKicker>
            <p className={styles.push}>Good. Now two users shorten the same URL at once. What happens?</p>
          </Card>
          <Card decor extra tone="note" tilt={1}>
            <CardKicker>You mark yourself</CardKicker>
            <ul className={styles.rubric}>
              <li>Answered what they were testing</li>
              <li>Named the trade-off</li>
              <li>Held up when pushed</li>
            </ul>
            <Remark>pushed, then scored</Remark>
          </Card>
        </Column>
        <PickUp
          inProgress={inProgress}
          stages={stages}
          last={history.at(-1)}
          onResume={onResume}
          onDiscard={onDiscard}
        />
      </Compose>
    </Scene>
  );
}
