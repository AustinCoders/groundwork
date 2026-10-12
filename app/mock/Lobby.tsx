"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { fetchStages, prefetchStages, whenIdle } from "@/app/mock/useStageBanks";
import { loadRoom } from "@/app/mock/preload";
import { planLoop, STAGE_RULES } from "@/lib/mock/loops";
import { buildSession, type Session, type SessionMode } from "@/lib/mock/session";
import type { HistoryEntry, RetryEntry } from "@/lib/mock/storage";
import { STYLES } from "@/lib/mock/styles";
import type {
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
import { useMounted, subscribeNever } from "@/lib/hooks";
import { Band, Foot, FootLink, TopicPage } from "@/components/topic/TopicKit";
import { DrillPanel } from "@/app/mock/DrillPanel";
import { LobbyHero } from "@/app/mock/LobbyHero";
import { LoopWizard } from "@/app/mock/LoopWizard";
import { ReadinessBoard } from "@/app/mock/Readiness";
import { RetryPanel } from "@/app/mock/RetryPanel";
import { LOBBY_STEPS } from "@/lib/mock/guide";
import { COMPANIES, INTENSITIES, LEVELS, ROLES } from "@/app/mock/options";
import { HowScored, MockFaq, RoundsDecoded, SampleDebrief } from "@/app/mock/LobbyGuide";
import { smoothScroll } from "@/lib/scrollFx";
import styles from "./plan.module.css";
import lobby from "./lobby.module.css";

const CONFIG_KEY = "groundwork:mock:config";

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
    style: saved.style && saved.style in STYLES ? saved.style : null,
  };
}

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

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function newSeed(): number {
  return Math.floor(Math.random() * 2 ** 31) || 1;
}

const MODES: [SessionMode, string][] = [
  ["loop", "Full loop"],
  ["drill", "Single round"],
  ["retry", "Retry weak answers"],
];

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
  const mounted = useMounted();
  const stages = useMemo(
    () => Object.fromEntries(catalog.stages.map((s) => [s.id, s])) as Record<StageId, StageInfo>,
    [catalog.stages]
  );

  const [mode, setMode] = useState<SessionMode>("loop");
  const stored = useSyncExternalStore(subscribeNever, savedConfig, serverConfig);
  const [picked, setPicked] = useState<LoopConfig | null>(null);
  const config = picked ?? stored;
  const [drillStage, setDrillStage] = useState<StageId>("javascript");
  const [drillCount, setDrillCount] = useState(5);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function scrollToPlan() {
    const plan = document.getElementById("plan");
    if (plan) smoothScroll.to(plan.getBoundingClientRect().top + window.scrollY - 60);
  }

  function practise(stage: StageId) {
    setDrillStage(stage);
    setMode("drill");
    scrollToPlan();
  }

  function goPlan(which: SessionMode) {
    setMode(which);
    scrollToPlan();
  }

  function setConfig(patch: Partial<LoopConfig>) {
    const next = { ...config, ...patch };
    store.set(CONFIG_KEY, next);
    setPicked(next);
  }

  const plan = useMemo(() => planLoop(config, catalog.hotFor), [config, catalog.hotFor]);

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

  const warmRoom = () => whenIdle(() => void loadRoom().catch(() => {}));
  const warmLoop = () => prefetchStages(plan.map((p) => p.stage));

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
        config: which === "loop" ? config : { ...config, style: null },
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

  const talkCount = catalog.stages.filter((s) => s.kind === "talk").reduce((n, s) => n + s.available, 0);
  const codeCount = catalog.stages.filter((s) => s.kind === "coding").reduce((n, s) => n + s.available, 0);

  return (
    <TopicPage accent="blue">
      <LobbyHero
        stages={stages}
        rounds={catalog.stages.length}
        questions={talkCount}
        problems={codeCount}
        inProgress={inProgress}
        history={history}
        onResume={onResume}
        onDiscard={onDiscard}
        onPlan={goPlan}
      />

      <Band
        no="01"
        id="how-title"
        label="How a mock works"
        title="Four steps, then the debrief"
        sub="No microphone, nothing recorded: you answer out loud to yourself, against a clock, the way you would in the room."
      >
        <ol className={lobby.steps} aria-label="How a mock works">
          {LOBBY_STEPS.map((s, i) => (
            <li key={s.title} className={lobby.step}>
              <span className={lobby.stepNo} aria-hidden="true">
                {i + 1}
              </span>
              <b className={lobby.stepTitle}>{s.title}</b>
              <span className={lobby.stepBody}>{s.body}</span>
            </li>
          ))}
        </ol>
      </Band>

      <Band
        no="02"
        id="plan-title"
        sectionId="plan"
        label="Start here"
        title="What do you want to practise?"
        count={`${catalog.stages.length} rounds`}
      >
        <div className={styles.modes} role="tablist" aria-label="Kind of practice">
          {MODES.map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`mode-${id}`}
              aria-controls="mode-panel"
              aria-selected={mode === id}
              className={styles.mode}
              onClick={() => setMode(id)}
            >
              {label}
              {id === "retry" && mounted && retry.length > 0 && (
                <span className={styles.modeCount}>{retry.length}</span>
              )}
            </button>
          ))}
        </div>
        <div role="tabpanel" id="mode-panel" aria-labelledby={`mode-${mode}`}>
          {mode === "loop" && (
            <LoopWizard
              config={config}
              onChange={setConfig}
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
            <DrillPanel
              catalog={catalog.stages}
              stages={stages}
              config={config}
              drillStage={drillStage}
              drillQuestions={drillQuestions}
              drillIsCoding={drillIsCoding}
              busy={busy}
              error={error}
              onPick={setDrillStage}
              onCount={setDrillCount}
              onLevel={(seniority) => setConfig({ seniority })}
              onStart={() => start("drill")}
            />
          )}
          {mode === "retry" && (
            <RetryPanel retry={retry} stages={stages} busy={busy} error={error} onStart={() => start("retry")} />
          )}
        </div>
      </Band>

      <ReadinessBoard
        no="03"
        history={history}
        available={catalog.stages.map((s) => s.id)}
        stageTitle={(id) => stages[id]?.title ?? id}
        onPractise={practise}
      />

      <RoundsDecoded no="04" stages={catalog.stages} config={config} onPractise={practise} />
      <HowScored no="05" />
      <SampleDebrief no="06" />
      <MockFaq no="07" />

      <Foot>
        <FootLink href="/interview">Interview book</FootLink>
        <FootLink href="/problems">Problems</FootLink>
        <FootLink href="/practice">Playground</FootLink>
        <FootLink href="/">All topics</FootLink>
      </Foot>
    </TopicPage>
  );
}
