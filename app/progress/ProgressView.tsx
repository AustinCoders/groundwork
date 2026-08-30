"use client";

import { useEffect, useMemo, useState } from "react";
import { Shell } from "@/components/Shell";
import { Crumbs } from "@/components/Crumbs";
import { Confetti } from "@/components/practice/Confetti";
import { CountUp } from "@/components/CountUp";
import { BADGES, computeStats, earnedBadges, recentActivity, type Stats } from "@/lib/gamification";
import { useMounted, useProgressValue } from "@/lib/hooks";
import { plural } from "@/lib/format";

const LAST_SEEN_LEVEL_KEY = "jsnotes:last-seen-level";

/** True for exactly one render, the first time `level` is higher than
 * whatever was last recorded — a real level-up, not just the first paint
 * of a returning level-5 reader. */
function useLevelUpCelebration(level: number): boolean {
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    if (level <= 1) return;
    let lastSeen = 1;
    try {
      lastSeen = Number(localStorage.getItem(LAST_SEEN_LEVEL_KEY) || "1");
    } catch {
      return;
    }
    if (level > lastSeen) {
      const kick = setTimeout(() => setCelebrate(true), 0);
      try {
        localStorage.setItem(LAST_SEEN_LEVEL_KEY, String(level));
      } catch {
        // best-effort — worst case the celebration replays next visit
      }
      return () => clearTimeout(kick);
    }
    if (level !== lastSeen) {
      try {
        localStorage.setItem(LAST_SEEN_LEVEL_KEY, String(level));
      } catch {}
    }
  }, [level]);

  return celebrate;
}

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

const HEATMAP_DAYS = 364; // 52 full weeks — a GitHub-style full year

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
                  data-tooltip={`${cell.day}: ${plural(cell.count, "thing")} done`}
                  tabIndex={0}
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

function LevelRing({ level, pct }: { level: number; pct: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);

  return (
    <div className="level-ring">
      <svg viewBox="0 0 140 140" width="140" height="140" aria-hidden="true">
        <circle className="level-ring__track" cx="70" cy="70" r={radius} />
        <circle
          className="level-ring__fill"
          cx="70"
          cy="70"
          r={radius}
          style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
        />
      </svg>
      <div className="level-ring__center">
        <span className="level-ring__num">
          <CountUp value={level} />
        </span>
        <span className="level-ring__label">level</span>
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
  const leveledUp = useLevelUpCelebration(stats.level);

  if (!mounted) return null;

  return (
    <Shell skipLabel="Skip to your progress">
      <Confetti fire={leveledUp} />
      <Crumbs items={[{ label: "All topics", href: "/" }, { label: "Your progress" }]} />

      {leveledUp && (
        <div className="level-up-banner" role="status">
          🎉 Level up! You&apos;re now level {stats.level}.
        </div>
      )}

      <section className="sheet hero">
        <div className="progress-glow" aria-hidden="true" />
        <span className="hero__kicker">stats · streaks · badges</span>
        <h1>Your progress</h1>
        <p className="hero__lead">
          Every chapter you finish and exercise you solve counts toward this. Nothing here is graded — it&apos;s just
          a record of the work, and a reason to keep the streak alive.
        </p>

        <div className="progress-hero">
          <LevelRing level={stats.level} pct={xpPct} />

          <div className="progress-hero__info">
            <span className="progress-hero__xp">
              <CountUp value={stats.xpIntoLevel} /> / {stats.xpForNextLevel} XP to level {stats.level + 1}
            </span>

            <div className="progress-hero__streak">
              <span className={`progress-hero__streak-flame${stats.streak > 0 ? " is-lit" : ""}`} aria-hidden="true">
                🔥
              </span>
              <div>
                <span className="progress-hero__streak-num">
                  <CountUp value={stats.streak} />
                </span>
                <span className="progress-hero__streak-label">{plural(stats.streak, "day")} streak</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="stat-row">
        <div className="stat-card stat-card--a">
          <span className="stat-card__icon" aria-hidden="true">
            🧩
          </span>
          <div>
            <span className="stat-card__num">
              <CountUp value={stats.exercisesSolved} />
            </span>
            <span className="stat-card__label">exercises solved</span>
          </div>
        </div>
        <div className="stat-card stat-card--b">
          <span className="stat-card__icon" aria-hidden="true">
            📖
          </span>
          <div>
            <span className="stat-card__num">
              <CountUp value={stats.chaptersRead} />
            </span>
            <span className="stat-card__label">chapters read</span>
          </div>
        </div>
        <div className="stat-card stat-card--c">
          <span className="stat-card__icon" aria-hidden="true">
            🏅
          </span>
          <div>
            <span className="stat-card__num">
              <CountUp value={stats.bestStreak} />
            </span>
            <span className="stat-card__label">best streak</span>
          </div>
        </div>
        <div className="stat-card stat-card--d">
          <span className="stat-card__icon" aria-hidden="true">
            ⚡
          </span>
          <div>
            <span className="stat-card__num">
              <CountUp value={stats.xp} />
            </span>
            <span className="stat-card__label">total XP</span>
          </div>
        </div>
      </div>

      <h2 className="section-title">Activity</h2>
      <p className="section-note">The last year — darker means more got done that day.</p>
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
