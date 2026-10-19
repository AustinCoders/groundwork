"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import type { Phase } from "./shared";
import styles from "./company-questions.module.css";

type Mode = "choose" | "open" | "covered" | "done";

const READ_FIRST = "groundwork:company-questions:read-first";
const READ_FIRST_EVENT = "groundwork:read-first";

function subscribe(listener: () => void) {
  window.addEventListener("hashchange", listener);
  window.addEventListener(READ_FIRST_EVENT, listener);
  return () => {
    window.removeEventListener("hashchange", listener);
    window.removeEventListener(READ_FIRST_EVENT, listener);
  };
}

function stored(): boolean {
  try {
    return window.localStorage.getItem(READ_FIRST) === "1";
  } catch {
    return false;
  }
}

function wantsAnswer(): boolean {
  return stored() || (window.location.hash.length > 1 && window.location.hash !== "#try");
}

const noop = () => () => {};

function clock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function phaseAt(phases: readonly Phase[], seconds: number) {
  let end = 0;
  for (const phase of phases) {
    end += phase.minutes * 60;
    if (seconds < end) return { label: phase.label, left: end - seconds };
  }
  return null;
}

export function TryFirst({
  rail,
  phases,
  children,
}: {
  rail: ReactNode;
  phases: readonly Phase[];
  children: ReactNode;
}) {
  const total = phases.reduce((sum, phase) => sum + phase.minutes, 0);
  const roundSeconds = total * 60;
  const [picked, setPicked] = useState<Mode | null>(null);
  const hydrated = useSyncExternalStore(
    noop,
    () => true,
    () => false
  );
  const skip = useSyncExternalStore(subscribe, wantsAnswer, () => false);
  const mode: Mode = picked ?? (skip ? "open" : "choose");
  const setMode = setPicked;
  const [startedAt, setStartedAt] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (mode !== "covered") return;
    const timer = window.setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, [mode, startedAt]);

  function cover() {
    setStartedAt(Date.now());
    setElapsed(0);
    setMode("covered");
  }

  function remember(on: boolean) {
    try {
      if (on) window.localStorage.setItem(READ_FIRST, "1");
      else window.localStorage.removeItem(READ_FIRST);
    } catch {
      return;
    }
    window.dispatchEvent(new Event(READ_FIRST_EVENT));
  }

  function reveal() {
    setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    setMode("done");
  }

  const phase = phaseAt(phases, elapsed);
  const progress = Math.min(elapsed / roundSeconds, 1) * 100;

  return (
    <div className={styles.trial} data-mode={mode} id="try">
      <div className={styles.readBar} aria-hidden="true" />
      <div className={styles.trialBar}>
        <div className={styles.trialCopy}>
          {mode === "choose" && (
            <>
              <b>Try it first.</b>
              <span>
                The answer is covered until you pick. Talk it through against a {total} minute clock, or just read it.
              </span>
            </>
          )}
          {mode === "open" && (
            <>
              <b>Reading the answer.</b>
              <span>Want to test yourself? Cover it and run a {total} minute clock, then compare.</span>
            </>
          )}
          {mode === "covered" && (
            <>
              <b className={styles.clock} role="timer" aria-label="Time spent">
                {clock(elapsed)}
              </b>
              <span>
                {phase ? (
                  <>
                    Now: <b>{phase.label}</b>, about {Math.ceil(phase.left / 60)} min left in this part.
                  </>
                ) : (
                  <>Past the usual {total} minutes. Wrap up and compare.</>
                )}
              </span>
            </>
          )}
          {mode === "done" && (
            <>
              <b className={styles.clock}>{clock(elapsed)}</b>
              <span>
                {elapsed > 0 && elapsed < 60 ? "That was quick. " : ""}
                {elapsed <= roundSeconds ? "Inside a normal round." : "Over a normal round."} Compare your sketch with
                the answer below.
              </span>
            </>
          )}
        </div>
        <div className={styles.trialActions}>
          {mode === "open" && (
            <button type="button" className={styles.primaryBtn} onClick={cover}>
              Cover it and start the clock
            </button>
          )}
          {mode === "covered" && (
            <button type="button" className={styles.primaryBtn} onClick={reveal}>
              Reveal the answer
            </button>
          )}
          {mode === "done" && (
            <button type="button" className={styles.ghostBtn} onClick={cover}>
              Cover and go again
            </button>
          )}
          {mode === "covered" && (
            <button type="button" className={styles.ghostBtn} onClick={() => setMode("open")}>
              Skip the clock
            </button>
          )}
        </div>
        <div className={styles.pace} aria-hidden="true">
          {phases.map((entry) => (
            <span key={entry.id} style={{ flexGrow: entry.minutes }}>
              {entry.label}
            </span>
          ))}
          {(mode === "covered" || mode === "done") && <i style={{ left: `${progress}%` }} />}
        </div>
      </div>

      <div className={styles.reader}>
        <aside className={styles.rail}>{rail}</aside>
        <div className={styles.answerWrap}>
          <div className={styles.answer} inert={hydrated && (mode === "covered" || mode === "choose")}>
            {children}
          </div>
          {mode === "choose" && (
            <div className={styles.veil}>
              <div className={styles.veilCard}>
                <p>
                  <b>Have a go before you read.</b>
                </p>
                <p>
                  Interviews reward the sketch you make cold. Clarify out loud, draw it, then compare with the answer.
                </p>
                <div className={styles.veilRow}>
                  <button type="button" className={styles.primaryBtn} onClick={cover}>
                    Start the {total} minute clock
                  </button>
                  <button type="button" className={styles.ghostBtn} onClick={() => setMode("open")}>
                    Just show me the answer
                  </button>
                </div>
                <label className={styles.veilRemember}>
                  <input type="checkbox" onChange={(event) => remember(event.target.checked)} /> Always show the answer
                  straight away
                </label>
              </div>
            </div>
          )}
          {mode === "covered" && (
            <div className={styles.veil}>
              <div className={styles.veilCard}>
                <p>
                  <b>The answer is covered.</b>
                </p>
                <p>Sketch it on paper or the whiteboard first. Say the clarifying questions out loud.</p>
                <button type="button" className={styles.primaryBtn} onClick={reveal}>
                  Reveal the answer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
