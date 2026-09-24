"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Crumbs } from "@/components/Crumbs";
import { Shell } from "@/components/Shell";
import { Lobby } from "@/app/mock/Lobby";
import dynamic from "next/dynamic";
import { loadRoom, loadScorecard } from "@/app/mock/preload";
import { fetchStages } from "@/app/mock/useStageBanks";
import type { MockCatalog } from "@/lib/mock/bank";
import { planLoop } from "@/lib/mock/loops";
import { buildSession, reduce, type Action, type Session } from "@/lib/mock/session";
import { mockSnapshot, mockStore, serverMockSnapshot, subscribeMock } from "@/lib/mock/storage";
import type { StageId, StageInfo } from "@/lib/mock/types";

type Screen = "lobby" | "room" | "scorecard";

const Room = dynamic(() => loadRoom().then((m) => m.Room), {
  loading: () => <p className="sub">Setting up the room…</p>,
});
const Scorecard = dynamic(() => loadScorecard().then((m) => m.Scorecard), {
  loading: () => <p className="sub">Writing up the debrief…</p>,
});

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function newSeed(): number {
  return Math.floor(Math.random() * 2 ** 31) || 1;
}

export function MockApp({ catalog }: { catalog: MockCatalog }) {
  const stages = useMemo(
    () => Object.fromEntries(catalog.stages.map((s) => [s.id, s])) as Record<StageId, StageInfo>,
    [catalog.stages]
  );
  const title = useCallback((s: StageId) => stages[s]?.title ?? s, [stages]);

  const saved = useSyncExternalStore(subscribeMock, mockSnapshot, serverMockSnapshot);
  const [screen, setScreen] = useState<Screen>("lobby");
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dispatch = useCallback((a: Action) => setSession((s) => (s ? reduce(s, a) : s)), []);

  const saveTimer = useRef<number | null>(null);
  useEffect(() => {
    if (!session || session.finishedAt !== null || screen !== "room") return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => mockStore.saveCurrent(session), 250);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [session, screen]);

  const filed = useRef<string | null>(null);
  useEffect(() => {
    if (!session || session.finishedAt === null || screen !== "room" || filed.current === session.id) return;
    filed.current = session.id;
    mockStore.finish(session, title);
    setScreen("scorecard");
  }, [session, screen, title]);

  const place = `${screen}:${session?.cursor ?? -1}:${session?.step === "brief"}`;
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [place]);

  const enterRoom = useCallback((s: Session) => {
    filed.current = null;
    setError(null);
    setSession(s);
    mockStore.saveCurrent(s);
    setScreen("room");
  }, []);

  function resume() {
    const s = saved.current;
    if (!s) return;
    enterRoom(reduce(s, { type: "resume", at: Date.now() }));
  }

  function discard() {
    mockStore.clearCurrent();
  }

  function endEarly() {
    setSession((s) => (s ? { ...s, finishedAt: Date.now() } : s));
  }

  async function retryWeak() {
    try {
      const wanted = mockStore.retry().slice(0, 10);
      const banks = await fetchStages(wanted.map((r) => r.stage));
      const fixed = wanted
        .map((r) => banks[r.stage]?.find((i) => i.id === r.id))
        .filter((i): i is NonNullable<typeof i> => Boolean(i));
      if (!fixed.length || !session) return;
      enterRoom(
        buildSession({
          id: newId(),
          mode: "retry",
          config: session.config,
          plan: session.plan,
          banks,
          seed: newSeed(),
          now: Date.now(),
          fixed,
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start the retry round.");
    }
  }

  async function again() {
    if (!session) return;
    try {
      const plan =
        session.mode === "loop"
          ? planLoop(session.config, catalog.hotFor)
          : session.plan.map((p) => ({ ...p, questions: session.questions.filter((q) => q.stage === p.stage).length }));
      const banks = await fetchStages(plan.map((p) => p.stage));
      enterRoom(
        buildSession({
          id: newId(),
          mode: session.mode === "retry" ? "drill" : session.mode,
          config: session.config,
          plan,
          banks,
          seed: newSeed(),
          now: Date.now(),
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start another round.");
    }
  }

  function backToLobby() {
    mockStore.refresh();
    setSession(null);
    setScreen("lobby");
  }

  const inRoom = screen === "room" && session;

  return (
    <Shell skipLabel="Skip to the mock interview" variant={inRoom ? "focused" : "full"}>
      {!inRoom && (
        <>
          <Crumbs items={[{ label: "All topics", href: "/" }, { label: "Mock interview" }]} />
          {screen === "lobby" && (
            <section className="sheet hero">
              <span className="hero__kicker">the whole loop, timed and scored</span>
              <h1>Mock interview</h1>
              <p className="hero__lead">
                A real loop, round by round: the recruiter, the coding, the deep dives, system design, behaviour and the
                number. Answer out loud, get pushed with a follow-up, mark yourself against what the round is actually
                listening for — then a debrief that decides the way a hiring committee would.
              </p>
            </section>
          )}
        </>
      )}

      {error && <p className="warn">{error}</p>}

      {screen === "lobby" && (
        <Lobby
          catalog={catalog}
          history={saved.history}
          retry={saved.retry}
          inProgress={saved.current}
          onStart={enterRoom}
          onResume={resume}
          onDiscard={discard}
        />
      )}

      {inRoom && <Room session={session} stages={stages} dispatch={dispatch} onEnd={endEarly} />}

      {screen === "scorecard" && session && (
        <Scorecard
          session={session}
          stages={stages}
          retryCount={saved.retry.length}
          onRetry={retryWeak}
          onAgain={again}
          onNew={backToLobby}
        />
      )}
    </Shell>
  );
}
