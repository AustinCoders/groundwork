"use client";

import { useNow } from "@/app/mock/useStageBanks";
import { formatClock } from "@/lib/mockSession";
import { stagePosition, type Session } from "@/lib/mock/session";
import type { StageId, StageInfo } from "@/lib/mock/types";
import styles from "./roomBar.module.css";

export function Elapsed({ since, until }: { since: number; until: number | null }) {
  const now = useNow(until === null);
  const s = Math.max(0, Math.floor(((until ?? now) - since) / 1000));
  const h = Math.floor(s / 3600);
  const text = h ? `${h}:${formatClock(s % 3600).padStart(5, "0")}` : formatClock(s);
  return (
    <span className={styles.clock} title="Time since you walked in">
      {text}
    </span>
  );
}

export function RoomRail({ session, stages }: { session: Session; stages: Record<StageId, StageInfo> }) {
  const { stageIndex } = stagePosition(session);
  const current = session.plan[stageIndex];
  const where = session.plan.length > 1 ? `Round ${stageIndex + 1} of ${session.plan.length}` : "One round";
  return (
    <div className={styles.rail}>
      <p className={styles.where}>
        {where} <span aria-hidden="true">·</span> <b>{current ? stages[current.stage]?.title : ""}</b>
      </p>
      <ol className={styles.segments} aria-label="Rounds in this interview">
        {session.plan.map((p, i) => {
          const qs = session.questions.filter((q) => q.stage === p.stage);
          const done = qs.filter((q) => q.score !== null).length;
          const state = i < stageIndex ? "done" : i === stageIndex ? "current" : "next";
          return (
            <li
              key={p.stage}
              className={styles.segment}
              data-state={state}
              aria-current={state === "current" ? "step" : undefined}
            >
              <span className={styles.fill} style={{ width: `${qs.length ? (done / qs.length) * 100 : 0}%` }} />
              <span className="visually-hidden">{stages[p.stage]?.title}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function RoomActions({ session, onEnd }: { session: Session; onEnd: () => void }) {
  return (
    <>
      <Elapsed since={session.startedAt} until={session.finishedAt} />
      <button
        type="button"
        className={styles.end}
        onClick={() => {
          if (window.confirm("End the interview here? It will be scored on what you have answered so far.")) onEnd();
        }}
      >
        End
      </button>
    </>
  );
}
