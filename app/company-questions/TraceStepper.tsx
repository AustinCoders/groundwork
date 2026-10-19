"use client";

import { useEffect, useState } from "react";
import styles from "./detail.module.css";

export function TraceStepper({ caption, head, rows }: { caption: string; head: string[]; rows: string[][] }) {
  const [at, setAt] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const last = rows.length - 1;

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setAt((current) => {
        const next = (current ?? -1) + 1;
        if (next >= last) setPlaying(false);
        return Math.min(next, last);
      });
    }, 1200);
    return () => window.clearInterval(timer);
  }, [playing, last]);

  const state = (index: number) => (at === null ? "all" : index < at ? "past" : index === at ? "now" : "next");

  return (
    <figure className={styles.trace}>
      <figcaption>{caption}</figcaption>
      <div className={styles.traceControls} role="group" aria-label="Step through the dry run">
        {at === null ? (
          <button
            type="button"
            className={styles.traceMain}
            onClick={() => {
              setAt(0);
              setPlaying(true);
            }}
          >
            ▶ Step through it
          </button>
        ) : (
          <>
            <button type="button" onClick={() => setAt(Math.max(0, at - 1))} disabled={at === 0}>
              ← Back
            </button>
            <button
              type="button"
              className={styles.traceMain}
              onClick={() => {
                if (at >= last) setAt(0);
                setPlaying((value) => !value);
              }}
            >
              {playing ? "❚❚ Pause" : at >= last ? "↻ Replay" : "▶ Play"}
            </button>
            <button type="button" onClick={() => setAt(Math.min(last, at + 1))} disabled={at >= last}>
              Next →
            </button>
            <button
              type="button"
              onClick={() => {
                setPlaying(false);
                setAt(null);
              }}
            >
              Show all
            </button>
            <span role="status">
              Step {at + 1} of {rows.length}
            </span>
          </>
        )}
      </div>
      <div className={styles.traceScroll} tabIndex={0} role="group" aria-label="Dry run table, scrollable">
        <table>
          <thead>
            <tr>
              {head.map((cell) => (
                <th key={cell} scope="col">
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} data-state={state(index)} aria-current={state(index) === "now" ? "step" : undefined}>
                {row.map((cell, column) => (
                  <td key={column}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
