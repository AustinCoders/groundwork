"use client";

import { useEffect, useState, type ReactNode } from "react";
import { PACING, ROUND_MINUTES } from "./shared";
import styles from "./company-questions.module.css";

type Mode = "open" | "covered" | "done";

const ROUND_SECONDS = ROUND_MINUTES * 60;

function clock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function phaseAt(seconds: number) {
  let end = 0;
  for (const phase of PACING) {
    end += phase.minutes * 60;
    if (seconds < end) return { label: phase.label, left: end - seconds };
  }
  return null;
}

export function TryFirst({ rail, children }: { rail: ReactNode; children: ReactNode }) {
  const [mode, setMode] = useState<Mode>("open");
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

  function reveal() {
    setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    setMode("done");
  }

  const phase = phaseAt(elapsed);
  const progress = Math.min(elapsed / ROUND_SECONDS, 1) * 100;

  return (
    <div className={styles.trial} data-mode={mode}>
      <div className={styles.trialBar}>
        <div className={styles.trialCopy}>
          {mode === "open" && (
            <>
              <b>Try it first.</b>
              <span>Cover the answer, start a 45 minute clock and talk it through. Then compare.</span>
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
                  <>Past the usual 45 minutes. Wrap up and compare.</>
                )}
              </span>
            </>
          )}
          {mode === "done" && (
            <>
              <b className={styles.clock}>{clock(elapsed)}</b>
              <span>
                {elapsed > 0 && elapsed < 60 ? "That was quick. " : ""}
                {elapsed <= ROUND_SECONDS ? "Inside a normal round." : "Over a normal round."} Compare your sketch with
                the answer below.
              </span>
            </>
          )}
        </div>
        <div className={styles.trialActions}>
          {mode === "open" && (
            <button type="button" className={styles.primaryBtn} onClick={cover}>
              Cover and start the clock
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
          {PACING.map((entry) => (
            <span key={entry.id} style={{ flexGrow: entry.minutes }}>
              {entry.label}
            </span>
          ))}
          {mode !== "open" && <i style={{ left: `${progress}%` }} />}
        </div>
      </div>

      <div className={styles.reader}>
        <aside className={styles.rail}>{rail}</aside>
        <div className={styles.answerWrap}>
          <div className={styles.answer} inert={mode === "covered"}>
            {children}
          </div>
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
