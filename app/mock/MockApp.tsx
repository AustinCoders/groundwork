"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { SiteDrawer } from "@/components/SiteDrawer";
import { TopIcon } from "@/components/practice/TopIcon";
import { SITE_NAME } from "@/lib/site";
import { smoothScroll, useScrollFx } from "@/lib/scrollFx";
import styles from "./mock.module.css";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    smoothScroll.start();
  }, []);
  const pageRef = useRef<HTMLDivElement>(null);

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
    smoothScroll.to(0, screen !== "lobby");
  }, [place, screen]);
  useScrollFx(pageRef, `${screen}:${saved.history.length}`);

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
    <>
      <a className="skip-link" href="#main">
        Skip to the mock interview
      </a>
      <div className={styles.page} ref={pageRef} data-room={inRoom ? "true" : undefined}>
        <span className={styles.scrollBar} data-scrollbar aria-hidden="true" />
        <header className={styles.top}>
          <button
            type="button"
            className={styles.iconBtn}
            aria-label="Menu"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            onClick={() => {
              smoothScroll.stop();
              setMenuOpen(true);
            }}
          >
            <TopIcon name="menu" />
          </button>
          <Link href="/" className={styles.brand} aria-label={`${SITE_NAME} home`}>
            <span className="brand__mark" aria-hidden="true">
              JS
            </span>
            <span className={styles.brandName}>{SITE_NAME}</span>
          </Link>
          <span className={styles.topSep} aria-hidden="true" />
          <span className={styles.topTitle}>Mock interview</span>
          <span className={styles.spacer} />
          {inRoom ? (
            <span className={styles.topLive}>
              <span className={styles.liveDot} aria-hidden="true" /> In the room
            </span>
          ) : (
            <Link href="/interview" className={styles.topLink}>
              Interview book
            </Link>
          )}
        </header>
        <main id="main" className={styles.main}>
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
        </main>
      </div>
      <SiteDrawer open={menuOpen} onClose={closeMenu} />
    </>
  );
}
