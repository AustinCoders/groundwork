"use client";

import { useEffect, useMemo, useState } from "react";
import { Shell } from "@/components/Shell";
import { Crumbs } from "@/components/Crumbs";
import { BADGES, computeStats, earnedBadges, recentActivity, type Stats } from "@/lib/gamification";
import { useMounted, useProgressValue } from "@/lib/hooks";
import { plural } from "@/lib/format";

const DEFAULT_STATS: Stats = {
  exercisesSolved: 0,
  chaptersRead: 0,
  totalReviews: 0,
  streak: 0,
  bestStreak: 0,
  activeDays: 0,
  xp: 0,
  level: 1,
  xpIntoLevel: 0,
  xpForNextLevel: 25,
};

const HEATMAP_DAYS = 91; // 13 full weeks

const WEEKDAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

function heatLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

function Heatmap() {
  // useSyncExternalStore (which useProgressValue wraps) compares snapshots
  // with Object.is — recentActivity() building a fresh array every call
  // would look "always changed" and loop forever. Read it as a stable
  // string, then parse — same fix ReviewView.tsx uses for its due list.
  const daysKey = useProgressValue(() => JSON.stringify(recentActivity(HEATMAP_DAYS)), "[]");
  const days = useMemo(() => JSON.parse(daysKey) as { day: string; count: number }[], [daysKey]);

  // GitHub-style grid: columns are weeks, rows are Sun..Sat. Pad the front
  // so the first column starts on a Sunday, same as the real calendar.
  const weeks = useMemo(() => {
    type Cell = { day: string; count: number } | null;
    if (!days.length) return [] as Cell[][];
    const first = new Date(days[0].day);
    const padding = first.getDay();
    const padded: Cell[] = [...Array.from({ length: padding }, (): Cell => null), ...days];
    const out: Cell[][] = [];
    for (let i = 0; i < padded.length; i += 7) out.push(padded.slice(i, i + 7));
    return out;
  }, [days]);

  return (
    <div className="heatmap">
      <div className="heatmap__weekdays">
        {WEEKDAY_LABELS.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>
      <div className="heatmap__grid">
        {weeks.map((week, wi) => (
          <div className="heatmap__week" key={wi}>
            {week.map((cell, di) =>
              cell ? (
                <span
                  key={cell.day}
                  className={`heatmap__day is-level-${heatLevel(cell.count)}`}
                  title={`${cell.day}: ${plural(cell.count, "thing")} done`}
                />
              ) : (
                <span key={`pad-${di}`} className="heatmap__day is-pad" aria-hidden="true" />
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function JokeCard() {
  const [joke, setJoke] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/joke")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && typeof data.text === "string") setJoke(data.text);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="joke-card">
      <span className="joke-card__kicker">☕ dev joke</span>
      {joke ? <p>{joke}</p> : <p className="sk sk--text" style={{ width: "70%" }} />}
    </div>
  );
}

export function ProgressView() {
  const mounted = useMounted();
  // Same Object.is-stability issue as the heatmap above — go through a
  // stable string rather than handing useSyncExternalStore a fresh object.
  const statsKey = useProgressValue(() => JSON.stringify(computeStats()), "");
  const stats = useMemo(() => (statsKey ? (JSON.parse(statsKey) as Stats) : DEFAULT_STATS), [statsKey]);

  const earned = useMemo(() => earnedBadges(stats), [stats]);
  const earnedIds = useMemo(() => new Set(earned.map((b) => b.id)), [earned]);
  const xpPct = stats.xpForNextLevel > 0 ? Math.min(100, Math.round((stats.xpIntoLevel / stats.xpForNextLevel) * 100)) : 100;

  if (!mounted) return null;

  return (
    <Shell skipLabel="Skip to your progress">
      <Crumbs items={[{ label: "All topics", href: "/" }, { label: "Your progress" }]} />

      <section className="sheet hero">
        <span className="hero__kicker">stats · streaks · badges</span>
        <h1>Your progress</h1>
        <p className="hero__lead">
          Every chapter you finish and exercise you solve counts toward this. Nothing here is graded — it&apos;s just
          a record of the work, and a reason to keep the streak alive.
        </p>

        <div className="progress-hero">
          <div className="progress-hero__level">
            <span className="progress-hero__level-num">Lv {stats.level}</span>
            <div className="meter">
              <div className="meter__track">
                <div className="meter__fill" style={{ width: `${xpPct}%` }} />
              </div>
            </div>
            <span className="progress-hero__xp">
              {stats.xpIntoLevel} / {stats.xpForNextLevel} XP to level {stats.level + 1}
            </span>
          </div>

          <div className="progress-hero__streak">
            <span className="progress-hero__streak-flame" aria-hidden="true">
              🔥
            </span>
            <div>
              <span className="progress-hero__streak-num">{stats.streak}</span>
              <span className="progress-hero__streak-label">{plural(stats.streak, "day")} streak</span>
            </div>
          </div>
        </div>
      </section>

      <div className="stat-row">
        <div className="stat">
          <span className="stat__num">{stats.exercisesSolved}</span>
          <span className="stat__label">exercises solved</span>
        </div>
        <div className="stat">
          <span className="stat__num">{stats.chaptersRead}</span>
          <span className="stat__label">chapters read</span>
        </div>
        <div className="stat">
          <span className="stat__num">{stats.bestStreak}</span>
          <span className="stat__label">best streak</span>
        </div>
        <div className="stat">
          <span className="stat__num">{stats.xp}</span>
          <span className="stat__label">total XP</span>
        </div>
      </div>

      <h2 className="section-title">Activity</h2>
      <p className="section-note">The last 13 weeks — darker means more got done that day.</p>
      <section className="sheet">
        <Heatmap />
      </section>

      <h2 className="section-title">Badges</h2>
      <p className="section-note">
        {earned.length} of {BADGES.length} unlocked.
      </p>
      <div className="badge-grid">
        {BADGES.map((b) => (
          <div className={`badge-card${earnedIds.has(b.id) ? " is-earned" : ""}`} key={b.id}>
            <span className="badge-card__icon" aria-hidden="true">
              {b.icon}
            </span>
            <span className="badge-card__name">{b.name}</span>
            <span className="badge-card__desc">{b.description}</span>
          </div>
        ))}
      </div>

      <JokeCard />
    </Shell>
  );
}
