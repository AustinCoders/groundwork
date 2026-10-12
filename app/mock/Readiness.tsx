"use client";

import { useRef } from "react";
import { COMPANIES, COMPETENCY_LABEL, LEVELS, ROLES } from "@/app/mock/options";
import { useScrollRegions } from "@/components/reader/scrollRegions";
import { Band, CardKicker, topicKit } from "@/components/topic/TopicKit";
import { useClientValue } from "@/lib/hooks";
import { STAGE_RULES } from "@/lib/mock/loops";
import { BAND_LABEL, bandFor, heatmap, nextUp, readiness, streak, trends } from "@/lib/mock/readiness";
import { competencyProfile, VERDICT_LABEL } from "@/lib/mock/scoring";
import type { HistoryEntry } from "@/lib/mock/storage";
import { styleOf } from "@/lib/mock/styles";
import type { Competency, StageId } from "@/lib/mock/types";
import kit from "./mockKit.module.css";
import styles from "./readiness.module.css";

function todayNoon(): number {
  return new Date().setHours(12, 0, 0, 0);
}

function shortDate(at: number): string {
  return new Date(at).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
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

function Trend({ values, wide = false, label }: { values: number[]; wide?: boolean; label?: string }) {
  const w = wide ? 220 : 120;
  const h = wide ? 48 : 34;
  const pad = 4;
  if (values.length < 2) return <span className={styles.once}>one session so far</span>;
  const x = (i: number) => pad + (i * (w - pad * 2)) / (values.length - 1);
  const y = (v: number) => h - pad - v * (h - pad * 2);
  const line = values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={wide ? styles.trendWide : styles.trend}
      preserveAspectRatio="none"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <line className={styles.trendBar} x1={pad} x2={w - pad} y1={y(0.65)} y2={y(0.65)} />
      <path className={styles.trendLine} d={line} />
      <circle className={styles.trendDot} cx={x(values.length - 1)} cy={y(values[values.length - 1])} r={4} />
    </svg>
  );
}

function Empty() {
  return (
    <div className={styles.empty}>
      <span className={`${styles.gauge} ${styles.gaugeEmpty}`} aria-hidden="true">
        <svg viewBox="0 0 128 128" width="128" height="128">
          <circle cx="64" cy="64" r="52" className={styles.gaugeTrack} />
        </svg>
        <span className={styles.gaugeNum}>–</span>
        <span className={styles.gaugeBand}>not yet</span>
      </span>
      <div className={styles.emptyText}>
        <p className={styles.emptyTitle}>Nothing to measure yet.</p>
        <p>
          Finish one round and this fills in: a readiness number out of 100 that leans on your recent sessions, your
          streak, how each skill is moving and which round to practise next. It stays in this browser.
        </p>
      </div>
    </div>
  );
}

function Record({ history }: { history: HistoryEntry[] }) {
  const loops = history.filter((h) => h.mode === "loop");
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
    <>
      <h3 className={styles.sub}>Your record</h3>
      <div className={styles.tiles}>
        <div className={styles.tile}>
          <span className={styles.num}>{loops.length}</span>
          <span className={styles.tileLabel}>
            full {loops.length === 1 ? "loop" : "loops"}, {hires} ending in an offer
          </span>
        </div>
        {loops.length > 0 && (
          <div className={styles.tile}>
            <span className={styles.num}>{Math.round(loops[loops.length - 1].score * 100)}%</span>
            <span className={styles.tileLabel}>last loop · dashed line is the hire bar</span>
            <Trend
              wide
              values={loops.slice(-12).map((h) => h.score)}
              label={`Loop scores, oldest to newest: ${loops
                .slice(-12)
                .map((h) => Math.round(h.score * 100) + "%")
                .join(", ")}`}
            />
          </div>
        )}
        {weakest && (
          <div className={styles.tile}>
            <span className={styles.num}>{Math.round(weakest[1] * 100)}%</span>
            <span className={styles.tileLabel}>
              weakest area across everything: <b>{COMPETENCY_LABEL[weakest[0]]}</b>
            </span>
          </div>
        )}
      </div>
      <ul className={styles.history}>
        {recent.map((h) => (
          <li key={h.id} className={styles.historyRow}>
            <span className={styles.historyDate}>{shortDate(h.finishedAt)}</span>
            <span className={styles.historyWhat}>
              {h.mode === "loop"
                ? `${ROLES.find(([r]) => r === h.config.role)?.[1]} · ${LEVELS.find(([l]) => l === h.config.seniority)?.[1]} · ${styleOf(h.config.style)?.name ?? COMPANIES.find(([c]) => c === h.config.company)?.[1]}`
                : h.mode === "retry"
                  ? "Retry round"
                  : "Single round"}{" "}
              <span className={styles.historyScore}>· {Math.round(h.score * 100)}%</span>
            </span>
            <span className={kit.verdictChip} data-verdict={h.verdict}>
              {VERDICT_LABEL[h.verdict]}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

export function ReadinessBoard({
  no,
  history,
  available,
  stageTitle,
  onPractise,
}: {
  no: string;
  history: HistoryEntry[];
  available: StageId[];
  stageTitle: (s: StageId) => string;
  onPractise: (stage: StageId) => void;
}) {
  const now = useClientValue(todayNoon, 0);
  const board = useRef<HTMLDivElement>(null);
  useScrollRegions(board, `${now}:${history.length}`);
  const ready = now && history.length ? readiness(history, now) : null;
  const lines = trends(history);
  const heat = heatmap(history);
  const days = now ? streak(history, now) : null;
  const next = now ? nextUp(history, now, available) : null;

  return (
    <Band
      no={no}
      id="mock-readiness"
      label="Where you stand"
      title="How ready you are"
      count={history.length ? `${history.length} ${history.length === 1 ? "session" : "sessions"}` : undefined}
    >
      <div ref={board} className={now ? undefined : topicKit.pending}>
        {!ready || !days ? (
          <Empty />
        ) : (
          <>
            <div className={styles.top}>
              <div className={`${kit.paper} ${styles.gaugeCard}`}>
                <span className={kit.tape} aria-hidden="true" />
                <Gauge score={ready.score} band={BAND_LABEL[ready.band]} />
              </div>
              <div className={`${kit.paper} ${styles.streakCard}`}>
                <CardKicker>Your streak</CardKicker>
                <span className={styles.num}>
                  {days.current} <span aria-hidden="true">🔥</span>
                </span>
                <span className={styles.tileLabel}>
                  {days.current === 1 ? "day" : "days"} in a row · best {days.best}
                </span>
                <span className={styles.streakDots} role="img" aria-label="Days with a mock in the last two weeks">
                  {days.lastFortnight.map((on, i) => (
                    <span key={i} className={styles.streakDot} data-on={on || undefined} />
                  ))}
                </span>
              </div>
              {next && (
                <div className={`${kit.sticky} ${styles.nextUp}`}>
                  <span className={kit.tape} aria-hidden="true" />
                  <CardKicker>Practise next</CardKicker>
                  <b className={styles.nextStage}>{stageTitle(next.stage)}</b>
                  <span className={styles.tileLabel}>{next.reason}</span>
                  <button type="button" className={`${kit.btn} ${kit.btnSmall}`} onClick={() => onPractise(next.stage)}>
                    Set up that round
                  </button>
                </div>
              )}
            </div>

            <h3 className={styles.sub}>By competency</h3>
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
                    <span
                      className={styles.compDelta}
                      data-dir={delta === null ? undefined : delta >= 0 ? "up" : "down"}
                    >
                      {delta === null ? "" : `${delta >= 0 ? "▲" : "▼"} ${Math.abs(delta)}`}
                    </span>
                    <Trend values={points.map((p) => p.score)} />
                  </li>
                );
              })}
            </ul>

            {heat.sessions.length > 1 && (
              <>
                <h3 className={styles.sub}>Round by round, last {heat.sessions.length} sessions</h3>
                <div className="table-scroll">
                  <table className={styles.heat}>
                    <thead>
                      <tr>
                        <th scope="col">Round</th>
                        {heat.sessions.map((s) => (
                          <th key={s.id} scope="col">
                            {shortDate(s.at)}
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

            <Record history={history} />
          </>
        )}
      </div>
    </Band>
  );
}
