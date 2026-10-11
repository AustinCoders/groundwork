"use client";

import { ChoiceCards } from "@/app/mock/ChoiceCards";
import { LEVELS } from "@/app/mock/options";
import { loadRoom } from "@/app/mock/preload";
import { prefetchStages, whenIdle } from "@/app/mock/useStageBanks";
import { STAGE_GUIDE } from "@/lib/mock/guide";
import { personaFor } from "@/lib/mock/persona";
import type { LoopConfig, StageId, StageInfo } from "@/lib/mock/types";
import kit from "./mockKit.module.css";
import styles from "./plan.module.css";

export function DrillPanel({
  catalog,
  stages,
  config,
  drillStage,
  drillQuestions,
  drillIsCoding,
  busy,
  error,
  onPick,
  onCount,
  onLevel,
  onStart,
}: {
  catalog: StageInfo[];
  stages: Record<StageId, StageInfo>;
  config: LoopConfig;
  drillStage: StageId;
  drillQuestions: number;
  drillIsCoding: boolean;
  busy: boolean;
  error: string | null;
  onPick: (stage: StageId) => void;
  onCount: (count: number) => void;
  onLevel: (seniority: LoopConfig["seniority"]) => void;
  onStart: () => void;
}) {
  const warm = () => {
    whenIdle(() => void loadRoom().catch(() => {}));
    prefetchStages([drillStage]);
  };
  return (
    <div className={styles.panelBody}>
      <p className={styles.panelKicker}>One round, properly. Pick the room.</p>
      <div className={styles.rounds}>
        {catalog.map((s) => {
          const who = personaFor(s.id, config);
          return (
            <button
              key={s.id}
              type="button"
              className={styles.roundCard}
              aria-pressed={drillStage === s.id}
              onClick={() => onPick(s.id)}
            >
              <span className={styles.roundTitle}>{s.title}</span>
              <span className={styles.roundTop}>
                <span className={kit.avatar} data-tone={who.tone} aria-hidden="true">
                  {who.initials}
                </span>
                <span className={kit.kindTag} data-kind={s.kind}>
                  {s.kind === "coding" ? "code" : "talk"}
                </span>
              </span>
              <span className={styles.roundPitch}>{STAGE_GUIDE[s.id].pitch}</span>
              <span className={styles.roundMeta}>
                {s.code && <span>{s.code}</span>}
                <span>{s.available} in the bank</span>
              </span>
              <span className={styles.cardCheck} aria-hidden="true">
                ✓
              </span>
            </button>
          );
        })}
      </div>
      <div className={styles.drillSettings}>
        <div>
          <p className={kit.label}>How many</p>
          <ChoiceCards
            compact
            label="How many questions"
            value={String(drillQuestions)}
            onChoose={(v) => onCount(Number(v))}
            options={(drillIsCoding ? [1, 2, 3] : [3, 5, 8]).map((n) => ({
              value: String(n),
              name: String(n),
              detail: drillIsCoding ? (n === 1 ? "problem" : "problems") : "questions",
            }))}
          />
        </div>
        <div>
          <p className={kit.label}>Pitched at</p>
          <ChoiceCards
            compact
            label="Experience"
            value={config.seniority}
            onChoose={onLevel}
            options={LEVELS.map(([value, name, detail]) => ({
              value,
              name,
              detail,
              icon: value === "junior" ? "level-1" : value === "mid" ? "level-2" : "level-3",
            }))}
          />
        </div>
      </div>
      <div className={styles.startBar}>
        <button
          type="button"
          className={kit.btn}
          disabled={busy}
          onPointerEnter={warm}
          onFocus={warm}
          onClick={onStart}
        >
          {busy ? "Setting up the room…" : `Start ${stages[drillStage].title}`}
        </button>
        <p className={styles.startNote}>
          <b>How it is lost:</b> {stages[drillStage].failMode || "—"}
        </p>
      </div>
      {error && <p className="warn">{error}</p>}
    </div>
  );
}
