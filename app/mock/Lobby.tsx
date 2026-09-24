"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { fetchStages, prefetchStages, whenIdle } from "@/app/mock/useStageBanks";
import { loadRoom } from "@/app/mock/preload";
import { planLoop, STAGE_RULES } from "@/lib/mock/loops";
import { buildSession, stagePosition, type Session, type SessionMode } from "@/lib/mock/session";
import { competencyProfile, VERDICT_LABEL } from "@/lib/mock/scoring";
import { RETIRE_AT, RETRY_BELOW, type HistoryEntry, type RetryEntry } from "@/lib/mock/storage";
import type {
  Competency,
  CompanyType,
  Intensity,
  LoopConfig,
  PlannedStage,
  Role,
  Seniority,
  StageId,
  StageInfo,
} from "@/lib/mock/types";
import type { MockCatalog } from "@/lib/mock/bank";
import { store } from "@/lib/storage";
import { subscribeNever } from "@/lib/hooks";
import { ChoiceCards } from "@/app/mock/ChoiceCards";
import { LoopWizard } from "@/app/mock/LoopWizard";
import { COMPANIES, INTENSITIES, LEVELS, ROLES } from "@/app/mock/options";
import styles from "./mock.module.css";

const CONFIG_KEY = "groundwork:mock:config";

export const COMPETENCY_LABEL: Record<Competency, string> = {
  coding: "Coding",
  javascript: "JavaScript",
  frontend: "Frontend",
  backend: "Backend",
  design: "System design",
  behaviour: "Behaviour",
  negotiation: "Negotiation",
};

const DEFAULT_CONFIG: LoopConfig = { role: "fullstack", seniority: "mid", company: "product", intensity: "standard" };

function readConfig(): LoopConfig {
  const saved = store.get<Partial<LoopConfig>>(CONFIG_KEY, {});
  return {
    role: ROLES.some(([r]) => r === saved.role) ? (saved.role as Role) : DEFAULT_CONFIG.role,
    seniority: LEVELS.some(([l]) => l === saved.seniority) ? (saved.seniority as Seniority) : DEFAULT_CONFIG.seniority,
    company: COMPANIES.some(([c]) => c === saved.company) ? (saved.company as CompanyType) : DEFAULT_CONFIG.company,
    intensity: INTENSITIES.some(([i]) => i === saved.intensity)
      ? (saved.intensity as Intensity)
      : DEFAULT_CONFIG.intensity,
  };
}

// The saved choices come out of this browser, which the server cannot see, so
// the first render must use the defaults and switch after hydration — reading
// localStorage in useState's initialiser made the server's buttons and the
// client's disagree. The cache keeps useSyncExternalStore's snapshot stable.
let cachedRaw: string | null | undefined;
let cachedConfig: LoopConfig = DEFAULT_CONFIG;

function savedConfig(): LoopConfig {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(CONFIG_KEY);
  } catch {
    raw = null;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedConfig = readConfig();
  }
  return cachedConfig;
}

function serverConfig(): LoopConfig {
  return DEFAULT_CONFIG;
}

function hasSavedConfig(): boolean {
  savedConfig();
  return cachedRaw !== null && cachedRaw !== undefined;
}

function serverHasSaved(): boolean {
  return false;
}

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function newSeed(): number {
  return Math.floor(Math.random() * 2 ** 31) || 1;
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const w = 200;
  const h = 46;
  const pad = 4;
  const x = (i: number) => pad + (i * (w - pad * 2)) / (values.length - 1);
  const y = (v: number) => h - pad - v * (h - pad * 2);
  const line = values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(values.length - 1).toFixed(1)} ${h - pad} L${x(0).toFixed(1)} ${h - pad} Z`;
  const last = values[values.length - 1];
  return (
    <svg
      className={styles.spark}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={`Loop scores, oldest to newest: ${values.map((v) => Math.round(v * 100) + "%").join(", ")}`}
    >
      <line className={styles.sparkBar} x1={pad} x2={w - pad} y1={y(0.65)} y2={y(0.65)} />
      <path className={styles.sparkArea} d={area} />
      <path className={styles.sparkLine} d={line} />
      <circle className={styles.sparkDot} cx={x(values.length - 1)} cy={y(last)} r={4} />
    </svg>
  );
}

function Record({ history }: { history: HistoryEntry[] }) {
  const loops = history.filter((h) => h.mode === "loop");
  if (!history.length) return null;

  const profile = competencyProfile(
    history.flatMap((h) =>
      h.stages.map((s) => ({
        stage: s.stage,
        competency: STAGE_RULES[s.stage].competency,
        core: s.core,
        scores: s.scores,
      }))
    )
  );
  const weakest = (Object.entries(profile) as [Competency, number][]).sort((a, b) => a[1] - b[1])[0];
  const recent = [...history].reverse().slice(0, 6);
  const hires = loops.filter((h) => h.verdict === "hire" || h.verdict === "strong-hire").length;

  return (
    <section className="sheet" aria-labelledby="mock-record">
      <h2 id="mock-record">Your record</h2>
      <div className={styles.record}>
        <div className={styles.recordTile}>
          <span className={styles.recordNum}>{loops.length}</span>
          <span className={styles.recordLabel}>
            full {loops.length === 1 ? "loop" : "loops"}, {hires} ending in an offer
          </span>
        </div>
        {loops.length > 0 && (
          <div className={styles.recordTile}>
            <span className={styles.recordNum}>{Math.round(loops[loops.length - 1].score * 100)}%</span>
            <span className={styles.recordLabel}>last loop · dashed line is the hire bar</span>
            <Sparkline values={loops.slice(-12).map((h) => h.score)} />
          </div>
        )}
        {weakest && (
          <div className={styles.recordTile}>
            <span className={styles.recordNum}>{Math.round(weakest[1] * 100)}%</span>
            <span className={styles.recordLabel}>
              weakest area across everything: <b>{COMPETENCY_LABEL[weakest[0]]}</b>
            </span>
          </div>
        )}
      </div>
      <ul className={styles.history}>
        {recent.map((h) => (
          <li key={h.id} className={styles.historyRow}>
            <span className={styles.historyDate}>
              {new Date(h.finishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </span>
            <span>
              {h.mode === "loop"
                ? `${ROLES.find(([r]) => r === h.config.role)?.[1]} · ${LEVELS.find(([l]) => l === h.config.seniority)?.[1]} · ${COMPANIES.find(([c]) => c === h.config.company)?.[1]}`
                : h.mode === "retry"
                  ? "Retry round"
                  : "Single round"}{" "}
              <span className={styles.mono}>· {Math.round(h.score * 100)}%</span>
            </span>
            <span className={styles.verdictChip} data-verdict={h.verdict}>
              {VERDICT_LABEL[h.verdict]}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Lobby({
  catalog,
  history,
  retry,
  inProgress,
  onStart,
  onResume,
  onDiscard,
}: {
  catalog: MockCatalog;
  history: HistoryEntry[];
  retry: RetryEntry[];
  inProgress: Session | null;
  onStart: (s: Session) => void;
  onResume: () => void;
  onDiscard: () => void;
}) {
  const stages = useMemo(
    () => Object.fromEntries(catalog.stages.map((s) => [s.id, s])) as Record<StageId, StageInfo>,
    [catalog.stages]
  );

  const [mode, setMode] = useState<SessionMode>("loop");
  const stored = useSyncExternalStore(subscribeNever, savedConfig, serverConfig);
  const [picked, setPicked] = useState<LoopConfig | null>(null);
  const config = picked ?? stored;
  const hasSaved = useSyncExternalStore(subscribeNever, hasSavedConfig, serverHasSaved);
  const [drillStage, setDrillStage] = useState<StageId>("javascript");
  const [drillCount, setDrillCount] = useState(5);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setConfig(patch: Partial<LoopConfig>) {
    const next = { ...config, ...patch };
    store.set(CONFIG_KEY, next);
    setPicked(next);
  }

  const plan = useMemo(() => planLoop(config, catalog.hotFor), [config, catalog.hotFor]);

  // A count chosen for a coding round (1–3) is not one a talk round offers
  // (3, 5, 8), so switching rooms snaps it to the nearest the new room has.
  const drillIsCoding = STAGE_RULES[drillStage].kind === "coding";
  const drillQuestions = drillIsCoding
    ? Math.min(Math.max(drillCount, 1), 3)
    : [3, 5, 8].includes(drillCount)
      ? drillCount
      : 3;

  const drillPlan: PlannedStage[] = useMemo(() => {
    const rule = STAGE_RULES[drillStage];
    const count = drillQuestions;
    const per = rule.kind === "coding" ? (drillStage === "machine" ? 20 : 15) : 4;
    return [{ stage: drillStage, questions: count, minutes: count * per, core: true, reason: "" }];
  }, [drillStage, drillQuestions]);

  // Getting ready for Start without paying for it on every visit: the room's
  // code once the reader is looking at a finished plan, the questions once
  // they point at Start.
  const warmRoom = () => whenIdle(() => void loadRoom().catch(() => {}));
  const warmLoop = () => prefetchStages(plan.map((p) => p.stage));
  const warmDrill = () => prefetchStages([drillStage]);

  async function start(which: SessionMode) {
    setBusy(true);
    setError(null);
    try {
      if (which === "retry") {
        const wanted = retry.slice(0, 10);
        const banks = await fetchStages(wanted.map((r) => r.stage));
        const fixed = wanted
          .map((r) => banks[r.stage]?.find((i) => i.id === r.id))
          .filter((i): i is NonNullable<typeof i> => Boolean(i));
        if (!fixed.length) throw new Error("Those questions are no longer in the bank.");
        onStart(
          buildSession({ id: newId(), mode: "retry", config, plan, banks, seed: newSeed(), now: Date.now(), fixed })
        );
        return;
      }
      const thePlan = which === "loop" ? plan : drillPlan;
      const banks = await fetchStages(thePlan.map((p) => p.stage));
      const session = buildSession({
        id: newId(),
        mode: which,
        config,
        plan: thePlan,
        banks,
        seed: newSeed(),
        now: Date.now(),
      });
      if (!session.questions.length) throw new Error("No questions fit that combination — try another level.");
      onStart(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start the interview.");
    } finally {
      setBusy(false);
    }
  }

  const resumeInfo = inProgress ? stagePosition(inProgress) : null;

  return (
    <>
      {inProgress && resumeInfo && (
        <div className={styles.resume} role="status">
          <div>
            <strong>You left an interview half-way.</strong>
            <div>
              {stages[inProgress.plan[resumeInfo.stageIndex]?.stage]?.title}, stage {resumeInfo.stageIndex + 1} of{" "}
              {inProgress.plan.length} · question {inProgress.cursor + 1} of {inProgress.questions.length}
            </div>
          </div>
          <span className={styles.spacer} />
          <button type="button" className="btn btn--primary" onClick={onResume}>
            Walk back in
          </button>
          <button type="button" className="btn btn--ghost" onClick={onDiscard}>
            Throw it away
          </button>
        </div>
      )}

      <div className={styles.modes} role="tablist" aria-label="Kind of practice">
        <button
          type="button"
          role="tab"
          className={styles.mode}
          aria-selected={mode === "loop"}
          onClick={() => setMode("loop")}
        >
          Full loop
        </button>
        <button
          type="button"
          role="tab"
          className={styles.mode}
          aria-selected={mode === "drill"}
          onClick={() => setMode("drill")}
        >
          Single round
        </button>
        <button
          type="button"
          role="tab"
          className={styles.mode}
          aria-selected={mode === "retry"}
          onClick={() => setMode("retry")}
        >
          Retry weak answers
          {retry.length > 0 && <span className={styles.modeCount}>{retry.length}</span>}
        </button>
      </div>

      {mode === "loop" && (
        <LoopWizard
          config={config}
          onChange={setConfig}
          hasSaved={hasSaved}
          plan={plan}
          stages={stages}
          hotFor={catalog.hotFor}
          busy={busy}
          error={error}
          onStart={() => start("loop")}
          onReview={warmRoom}
          onStartIntent={warmLoop}
        />
      )}

      {mode === "drill" && (
        <section className="sheet" aria-labelledby="mock-drill">
          <p className={styles.eyebrow}>one round, properly</p>
          <h2 id="mock-drill">Pick the room</h2>
          <div className={styles.rounds}>
            {catalog.stages.map((s) => (
              <button
                key={s.id}
                type="button"
                className={styles.roundCard}
                aria-pressed={drillStage === s.id}
                onClick={() => setDrillStage(s.id)}
              >
                <span className={styles.row}>
                  <span className={styles.mapTitle}>{s.title}</span>
                </span>
                <span className={styles.mapMeta}>
                  <span className={styles.kindTag} data-kind={s.kind}>
                    {s.kind === "coding" ? "code" : "talk"}
                  </span>
                  {s.code && <span>{s.code}</span>}
                  <span>{s.available} in the bank</span>
                </span>
                <dl className={styles.roundFacts}>
                  <dt>Who</dt>
                  <dd>{s.who}</dd>
                  <dt>Decides</dt>
                  <dd>{s.decides}</dd>
                </dl>
              </button>
            ))}
          </div>
          <div className={styles.drillSettings}>
            <div>
              <p className={styles.eyebrow}>how many</p>
              <ChoiceCards
                compact
                label="How many questions"
                value={String(drillQuestions)}
                onChoose={(v) => setDrillCount(Number(v))}
                options={(drillIsCoding ? [1, 2, 3] : [3, 5, 8]).map((n) => ({
                  value: String(n),
                  name: String(n),
                  detail: drillIsCoding ? (n === 1 ? "problem" : "problems") : "questions",
                }))}
              />
            </div>
            <div>
              <p className={styles.eyebrow}>pitched at</p>
              <ChoiceCards
                compact
                label="Experience"
                value={config.seniority}
                onChoose={(seniority) => setConfig({ seniority })}
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
              className="btn btn--primary"
              disabled={busy}
              onPointerEnter={() => {
                warmRoom();
                warmDrill();
              }}
              onFocus={() => {
                warmRoom();
                warmDrill();
              }}
              onClick={() => start("drill")}
            >
              {busy ? "Setting up the room…" : `Start ${stages[drillStage].title}`}
            </button>
            <p className={styles.startNote}>
              <b>How it is lost:</b> {stages[drillStage].failMode || "—"}
            </p>
          </div>
          {error && <p className="warn">{error}</p>}
        </section>
      )}

      {mode === "retry" && (
        <section className="sheet" aria-labelledby="mock-retry">
          <p className={styles.eyebrow}>the ones that got away</p>
          <h2 id="mock-retry">Retry weak answers</h2>
          {retry.length === 0 ? (
            <p className="sub">
              Nothing here yet. Any question you score under {Math.round(RETRY_BELOW * 100)}% on lands in this list, and
              comes off it once you answer it well.
            </p>
          ) : (
            <>
              <p className="sub">
                The next {Math.min(10, retry.length)} of {retry.length}, most recent first. Score{" "}
                {Math.round(RETIRE_AT * 100)}% or better and it comes off the list.
              </p>
              <ul className={styles.retryList}>
                {retry.slice(0, 10).map((r) => (
                  <li key={r.id} className={styles.retryItem}>
                    <span className={styles.retryTitle}>{r.title}</span>
                    <span className={styles.retryMeta}>
                      {stages[r.stage]?.title} · {Math.round(r.score * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
              <div className={styles.startBar}>
                <button type="button" className="btn btn--primary" disabled={busy} onClick={() => start("retry")}>
                  {busy ? "Setting up the room…" : "Retry these"}
                </button>
              </div>
            </>
          )}
          {error && <p className="warn">{error}</p>}
        </section>
      )}

      <Record history={history} />
    </>
  );
}
