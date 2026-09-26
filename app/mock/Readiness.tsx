"use client";

import { COMPETENCY_LABEL } from "@/app/mock/Lobby";
import { useClientValue } from "@/lib/hooks";
import { BAND_LABEL, bandFor, heatmap, nextUp, readiness, streak, trends, type TrendPoint } from "@/lib/mock/readiness";
import type { HistoryEntry } from "@/lib/mock/storage";
import type { Competency, StageId } from "@/lib/mock/types";
import styles from "./mock.module.css";

function todayNoon(): number {
  return new Date().setHours(12, 0, 0, 0);
}

function Gauge({ score, band }: { score: number; band: string }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className={styles.gauge} role="img" aria-label={`Readiness ${Math.round(score * 100)} out of 100: ${band}`}>
      <svg viewBox="0 0 128 128" width="128" height="128" aria-hidden="true">
        <circle cx="64" cy="64" r={r} className={styles.gaugeTrack} />
        <circle
          cx="64"
          cy="64"
          r={r}
          className={styles.gaugeFill}
          data-band={bandFor(score)}
          strokeDasharray={`${c * score} ${c}`}
          transform="rotate(-90 64 64)"
        />
      </svg>
      <span className={styles.gaugeNum}>{Math.round(score * 100)}</span>
      <span className={styles.gaugeBand}>{band}</span>
    </div>
  );
}

function Spark({ points }: { points: TrendPoint[] }) {
  const w = 120;
  const h = 34;
  if (points.length < 2) return <span className={styles.hint}>one session so far</span>;
  const xs = points.map((_, i) => (i / (points.length - 1)) * w);
  const ys = points.map((p) => h - p.score * h);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className={styles.spark} aria-hidden="true">
      <line x1="0" x2={w} y1={h - 0.65 * h} y2={h - 0.65 * h} className={styles.sparkBar} />
      <polyline points={xs.map((x, i) => `${x},${ys[i]}`).join(" ")} className={styles.sparkLine} />
      <circle cx={xs.at(-1)} cy={ys.at(-1)} r="3" className={styles.sparkDot} />
    </svg>
  );
}

export function ReadinessBoard({
  history,
  available,
  stageTitle,
  onPractise,
}: {
  history: HistoryEntry[];
  available: StageId[];
  stageTitle: (s: StageId) => string;
  onPractise: (stage: StageId) => void;
}) {
  const now = useClientValue(todayNoon, 0);
  if (!now || !history.length) return null;
  const ready = readiness(history, now);
  if (!ready) return null;
  const lines = trends(history);
  const heat = heatmap(history);
  const days = streak(history, now);
  const next = nextUp(history, now, available);

  return (
    <section className={styles.panel} aria-labelledby="mock-readiness">
      <h2 id="mock-readiness">How ready you are</h2>
      <div className={styles.readyTop}>
        <Gauge score={ready.score} band={BAND_LABEL[ready.band]} />
        <div className={styles.readyTile}>
          <span className={styles.recordNum}>
            {days.current} <span aria-hidden="true">🔥</span>
          </span>
          <span className={styles.recordLabel}>
            {days.current === 1 ? "day" : "days"} in a row · best {days.best}
          </span>
          <span className={styles.streakDots} aria-label="Days with a mock in the last two weeks">
            {days.lastFortnight.map((on, i) => (
              <span key={i} className={styles.streakDot} data-on={on || undefined} />
            ))}
          </span>
        </div>
        {next && (
          <div className={`${styles.readyTile} ${styles.nextUp}`}>
            <span className={styles.eyebrow}>Practise next</span>
            <b className={styles.nextStage}>{stageTitle(next.stage)}</b>
            <span className={styles.recordLabel}>{next.reason}</span>
            <button type="button" className="btn btn--primary" onClick={() => onPractise(next.stage)}>
              Set up that round
            </button>
          </div>
        )}
      </div>

      <h3 className={styles.readyH}>By competency</h3>
      <ul className={styles.compList}>
        {ready.competencies.map((c) => {
          const points = lines[c.competency as Competency] ?? [];
          const last = points.at(-1)?.score;
          const prev = points.at(-2)?.score;
          const delta = last !== undefined && prev !== undefined ? Math.round((last - prev) * 100) : null;
          return (
            <li key={c.competency} className={styles.compRow}>
              <span className={styles.compName}>{COMPETENCY_LABEL[c.competency]}</span>
              <span className={styles.compScore} data-band={bandFor(c.score)}>
                {Math.round(c.score * 100)}%
              </span>
              <span className={styles.compDelta} data-dir={delta === null ? undefined : delta >= 0 ? "up" : "down"}>
                {delta === null ? "" : `${delta >= 0 ? "▲" : "▼"} ${Math.abs(delta)}`}
              </span>
              <Spark points={points} />
            </li>
          );
        })}
      </ul>

      {heat.sessions.length > 1 && (
        <>
          <h3 className={styles.readyH}>Round by round, last {heat.sessions.length} sessions</h3>
          <div className="table-scroll">
            <table className={styles.heat}>
              <thead>
                <tr>
                  <th scope="col">Round</th>
                  {heat.sessions.map((s) => (
                    <th key={s.id} scope="col">
                      {new Date(s.at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heat.rows.map((row) => (
                  <tr key={row.stage}>
                    <th scope="row">{stageTitle(row.stage)}</th>
                    {row.cells.map((cell, i) => (
                      <td key={i} data-band={cell === null ? undefined : bandFor(cell)}>
                        {cell === null ? "" : Math.round(cell * 100)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
