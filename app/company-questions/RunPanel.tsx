"use client";

import { useEffect, useRef, useState } from "react";
import { run, type RunnerOutputEntry, type RunnerTestResult } from "@/lib/runner";
import type { RunCheck } from "@/lib/companyRun";
import styles from "./run.module.css";

type Phase = "idle" | "running" | "done";

interface Outcome {
  results: RunnerTestResult[];
  note: string | null;
  ms: number;
}

export function RunPanel({
  code,
  checks,
  prefill,
  noun,
}: {
  code: string;
  checks: RunCheck[];
  prefill: string;
  noun: string;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [snippet, setSnippet] = useState(prefill);
  const [lines, setLines] = useState<RunnerOutputEntry[] | null>(null);
  const [trying, setTrying] = useState(false);
  const stop = useRef<(() => void) | null>(null);

  useEffect(() => () => stop.current?.(), []);

  function runChecks() {
    stop.current?.();
    setPhase("running");
    setOutcome(null);
    const started = performance.now();
    const handle = run({
      code,
      tests: checks,
      timeout: 8000,
      onDone(payload) {
        const note = payload.syntax
          ? "The code has a syntax error."
          : payload.timedOut
            ? "Stopped after 8 seconds. Something loops forever."
            : payload.crashed
              ? "The code threw before the checks finished."
              : null;
        setOutcome({ results: payload.results, note, ms: Math.round(performance.now() - started) });
        setPhase("done");
      },
    });
    stop.current = handle.stop;
  }

  function runSnippet() {
    stop.current?.();
    setTrying(true);
    setLines([]);
    const out: RunnerOutputEntry[] = [];
    const handle = run({
      code: `${code}\n${snippet}`,
      timeout: 5000,
      onConsole(entry) {
        out.push(entry);
        setLines([...out]);
      },
      onDone() {
        setTrying(false);
        setLines([...out]);
      },
    });
    stop.current = handle.stop;
  }

  const passed = outcome?.results.filter((result) => result.ok).length ?? 0;
  const total = checks.length;
  const allGood = outcome !== null && !outcome.note && passed === total;

  return (
    <div className={styles.panel}>
      <div className={styles.head}>
        <button type="button" className={styles.run} onClick={runChecks} disabled={phase === "running"}>
          {phase === "running" ? "Running…" : `Run all ${total} ${noun}`}
        </button>
        <p
          className={styles.status}
          role="status"
          aria-live="polite"
          data-state={allGood ? "pass" : outcome ? "fail" : "idle"}
        >
          {outcome === null
            ? "Runs here in your browser, in a sandboxed worker. Nothing is sent anywhere."
            : outcome.note
              ? outcome.note
              : `${passed} of ${total} passed in ${outcome.ms} ms`}
        </p>
      </div>

      {outcome && outcome.results.length > 0 && (
        <ul className={styles.results}>
          {outcome.results.map((result) => (
            <li key={result.index} data-ok={result.ok ? "yes" : "no"}>
              <span aria-hidden="true">{result.ok ? "✓" : "✗"}</span>
              <code>{result.name}</code>
              {!result.ok && result.message && <em>{result.message}</em>}
            </li>
          ))}
        </ul>
      )}

      <details className={styles.try}>
        <summary>Try your own input</summary>
        <p>
          Write JavaScript that calls the code above and prints with <code>console.log</code>. It runs after the
          solution.
        </p>
        <textarea
          value={snippet}
          onChange={(event) => setSnippet(event.target.value)}
          spellCheck={false}
          rows={4}
          aria-label="Your own input"
        />
        <div className={styles.tryRow}>
          <button type="button" className={styles.run} onClick={runSnippet} disabled={trying}>
            {trying ? "Running…" : "Run it"}
          </button>
          <button type="button" className={styles.ghost} onClick={() => setSnippet(prefill)}>
            Reset
          </button>
        </div>
        {lines && (
          <pre className={styles.output} aria-live="polite">
            {lines.length === 0 && !trying
              ? "Nothing printed."
              : lines.map((entry, index) =>
                  entry.kind === "table" ? (
                    <span key={index}>{entry.rows.map((row) => row.join("  ")).join("\n")}</span>
                  ) : (
                    <span key={index} data-kind={entry.kind}>
                      {entry.text}
                      {"\n"}
                    </span>
                  )
                )}
          </pre>
        )}
      </details>
    </div>
  );
}
