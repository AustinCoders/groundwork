"use client";

import { SCORE_AREAS, VERDICTS, type PeerMock } from "@/lib/account/social";
import people from "@/app/people/people.module.css";
import styles from "./peer.module.css";

export function scoreTrend(mocks: PeerMock[]) {
  const scored = mocks
    .filter((m) => !m.interviewer && m.score)
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
    .slice(-8);
  const areas = SCORE_AREAS.map((area) => {
    const points = scored.map((m) => m.score!.ratings[area.id]);
    const first = points[0] ?? 0;
    const last = points[points.length - 1] ?? 0;
    return { ...area, points, last, change: points.length > 1 ? last - first : 0 };
  });
  return { count: scored.length, areas, verdict: scored.length ? scored[scored.length - 1].score!.verdict : null };
}

export function PeerHistory({ mocks }: { mocks: PeerMock[] }) {
  const trend = scoreTrend(mocks);
  if (trend.count === 0) return null;
  const verdict = VERDICTS.find((v) => v.id === trend.verdict)?.label;
  return (
    <section className={people.card} aria-labelledby="peer-history">
      <div className={people.cardHead}>
        <h2 id="peer-history" className={people.title}>
          How you are doing
        </h2>
        <span className={people.tag}>{trend.count === 1 ? "1 scorecard" : `${trend.count} scorecards`}</span>
      </div>
      {verdict && <p className={people.hint}>Last call: {verdict}</p>}
      <ul className={styles.trend}>
        {trend.areas.map((area) => (
          <li key={area.id}>
            <span className={styles.trendLabel}>{area.label}</span>
            <span className={styles.spark} aria-hidden="true">
              {area.points.map((p, i) => (
                <span key={i} style={{ height: `${p * 20}%` }} />
              ))}
            </span>
            <span className={styles.trendValue}>
              {area.last}/5
              {area.change !== 0 && (
                <span data-up={area.change > 0 || undefined} className={styles.change}>
                  {area.change > 0 ? `↑${area.change}` : `↓${-area.change}`}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
      <p className={people.hint}>
        {trend.count === 1 ? "From your one mock" : `From your last ${trend.count} mocks`} where a friend interviewed
        you.
      </p>
    </section>
  );
}
