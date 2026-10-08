"use client";

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import type { CellState, Frame, TracerLine, VariableValue } from "@/lib/play/types";
import styles from "./player.module.css";

const SPEEDS = [
  { id: "slow", label: "Slow", ms: 1800 },
  { id: "normal", label: "Normal", ms: 1100 },
  { id: "fast", label: "Fast", ms: 500 },
] as const;

type SpeedId = (typeof SPEEDS)[number]["id"];

const STATE_LABEL: Record<CellState, string> = {
  in: "in range",
  out: "ruled out",
  mid: "checking",
  found: "found",
  none: "not started",
};

function codeMarker(ran: boolean, queued: boolean) {
  if (ran && queued) return "ran next";
  if (ran) return "ran";
  return queued ? "next" : "";
}

const showValue = (value: VariableValue) => (value === null ? "not set yet" : String(value));

export function Player({ title, lines, frames }: { title: string; lines: TracerLine[]; frames: Frame[] }) {
  const last = frames.length - 1;
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<SpeedId>("normal");
  const backRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const playRef = useRef<HTMLButtonElement>(null);
  const scrubId = useId();
  const frame = frames[index];

  const go = useCallback(
    (to: number) => {
      const target = Math.min(Math.max(to, 0), last);
      const active = document.activeElement;
      if (target === last && active === nextRef.current) playRef.current?.focus();
      if (target === 0 && active === backRef.current) nextRef.current?.focus();
      setIndex(target);
      if (target === last) setPlaying(false);
    },
    [last]
  );

  const jump = useCallback(
    (to: number) => {
      setPlaying(false);
      go(to);
    },
    [go]
  );

  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (index === last) go(0);
    setPlaying(true);
  };

  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => go(index + 1), SPEEDS.find((entry) => entry.id === speed)!.ms);
    return () => clearTimeout(timer);
  }, [playing, index, speed, go]);

  useEffect(() => {
    const pauseWhenHidden = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => document.removeEventListener("visibilitychange", pauseWhenHidden);
  }, []);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target as HTMLElement;
    const onRange = target instanceof HTMLInputElement && target.type === "range";
    const onButton = target.closest("button") !== null;
    if (event.key === " ") {
      if (onRange || onButton) return;
      if (!event.repeat) togglePlay();
    } else if (event.key === "ArrowLeft" || event.key === "ArrowRight" || event.key === "Home" || event.key === "End") {
      if (onRange) return;
      if (event.key === "ArrowLeft") jump(index - 1);
      else if (event.key === "ArrowRight") jump(index + 1);
      else jump(event.key === "Home" ? 0 : last);
    } else {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  }

  const stepText = `Step ${index + 1} of ${frames.length}`;

  return (
    <div className={styles.player} role="group" aria-label={`${title} player`} tabIndex={-1} onKeyDown={onKeyDown}>
      <p className={styles.label}>Array</p>
      <ul className={styles.cells} role="list" aria-label={`Array, ${frame.cells.length} cells`}>
        {frame.cells.map((cell, at) => (
          <li key={at} className={styles.cell} data-state={cell.state}>
            <span className={styles.cellIndex}>[{at}]</span>
            <span className={styles.cellValue}>{cell.value}</span>
            <span className={styles.cellState}>{STATE_LABEL[cell.state]}</span>
            <span className={styles.cellMarks}>{cell.marks.join(" ")}</span>
          </li>
        ))}
      </ul>

      <p className={styles.narration} role="status">
        {frame.narration}
      </p>

      <div className={styles.controls}>
        <button
          ref={backRef}
          type="button"
          className={styles.button}
          disabled={index === 0}
          onClick={() => jump(index - 1)}
        >
          Back
        </button>
        <button
          ref={nextRef}
          type="button"
          className={styles.button}
          disabled={index === last}
          onClick={() => jump(index + 1)}
        >
          Next
        </button>
        <button ref={playRef} type="button" className={styles.button} aria-pressed={playing} onClick={togglePlay}>
          {playing ? "Pause" : "Play"}
        </button>
        <button type="button" className={styles.button} onClick={() => jump(0)}>
          Reset
        </button>
        <div role="group" aria-label="Speed" className={styles.speed}>
          {SPEEDS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className={styles.button}
              aria-pressed={speed === entry.id}
              onClick={() => setSpeed(entry.id)}
            >
              {entry.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.scrub}>
        <label htmlFor={scrubId} className={styles.scrubLabel}>
          {stepText}
        </label>
        <input
          id={scrubId}
          className={styles.range}
          type="range"
          min={1}
          max={frames.length}
          step={1}
          value={index + 1}
          aria-valuetext={stepText}
          onChange={(event) => jump(Number(event.target.value) - 1)}
        />
      </div>

      <div className={styles.lower}>
        <div>
          <p className={styles.label}>Code</p>
          <ol className={styles.code} role="list" aria-label={`${title} code`}>
            {lines.map((line) => {
              const ran = line.id === frame.line;
              const queued = line.id === frame.next;
              return (
                <li
                  key={line.id}
                  className={styles.codeLine}
                  data-ran={ran}
                  data-next={queued}
                  aria-current={ran ? "step" : undefined}
                >
                  <span className={styles.marker}>{codeMarker(ran, queued)}</span>
                  <code className={styles.codeText}>{line.text}</code>
                </li>
              );
            })}
          </ol>
        </div>
        <div>
          <p className={styles.label}>Variables</p>
          <dl className={styles.vars}>
            {frame.vars.map(([name, value]) => (
              <div key={name} className={styles.variable}>
                <dt>{name}</dt>
                <dd data-unset={value === null}>{showValue(value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
