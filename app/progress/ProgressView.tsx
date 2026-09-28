"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { PageFrame } from "@/components/frame/PageFrame";
import { Confetti } from "@/components/practice/Confetti";
import { BADGES, computeStats, earnedBadges, recentActivity, type Stats } from "@/lib/gamification";
import { useConfidence } from "@/lib/interviewConfidence";
import { useProgressValue } from "@/lib/hooks";
import { plural } from "@/lib/format";
import { progress } from "@/lib/storage";
import styles from "./progress.module.css";

export interface TopicTrack {
  id: string;
  name: string;
  mark: string;
  accent: string;
  href: string;
  ids: string[];
}

const LINKS = [
  { href: "/review", label: "Review" },
  { href: "/progress", label: "Progress" },
];

const LAST_SEEN_LEVEL_KEY = "jsnotes:last-seen-level";
const HEATMAP_DAYS = 364;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

function accentVar(a: string): React.CSSProperties {
  const name = a === "mint" ? "green" : a;
  const value = name === "ink" || name === "primary" ? `var(--${name})` : `var(--c-${name})`;
  return { "--accent": value } as React.CSSProperties;
}

function useLevelUp(level: number): boolean {
  const [celebrate, setCelebrate] = useState(false);
  useEffect(() => {
    if (level <= 1) return;
    let last = 1;
    try {
      last = Number(localStorage.getItem(LAST_SEEN_LEVEL_KEY) || "1");
      if (level !== last) localStorage.setItem(LAST_SEEN_LEVEL_KEY, String(level));
    } catch {
      return;
    }
    if (level > last) {
      const t = setTimeout(() => setCelebrate(true), 0);
      return () => clearTimeout(t);
    }
  }, [level]);
  return celebrate;
}

function heat(count: number): number {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

function useActivity() {
  const key = useProgressValue(() => JSON.stringify(recentActivity(HEATMAP_DAYS)), "");
  return useMemo(() => (key ? JSON.parse(key) : []) as { day: string; count: number }[], [key]);
}

function Heatmap({ days }: { days: { day: string; count: number }[] }) {
  const { weeks, months, active, total } = useMemo(() => {
    if (!days.length) return { weeks: [], months: [], active: 0, total: 0 };
    const pad = new Date(days[0].day).getDay();
    const cells = [...Array.from({ length: pad }, () => null), ...days];
    const weeks: ({ day: string; count: number } | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    const all: { at: number; label: string }[] = [];
    let last = -1;
    weeks.forEach((w, i) => {
      const first = w.find(Boolean);
      if (!first) return;
      const m = new Date(first.day).getMonth();
      if (m !== last) {
        all.push({ at: i, label: MONTHS[m] });
        last = m;
      }
    });
    return {
      weeks,
      months: all.filter((m, i) => !all[i + 1] || all[i + 1].at - m.at >= 3),
      active: days.filter((d) => d.count > 0).length,
      total: days.reduce((n, d) => n + d.count, 0),
    };
  }, [days]);
  const cols = { gridTemplateColumns: `repeat(${weeks.length || 52}, 1fr)` };

  return (
    <div className={styles.heat}>
      <div className={styles.heatScroll}>
        <div className={styles.heatMonths} style={cols}>
          {months.map((m) => (
            <span key={`${m.at}-${m.label}`} style={{ gridColumnStart: m.at + 1 }}>
              {m.label}
            </span>
          ))}
        </div>
        <div className={styles.heatGrid} style={cols}>
          {weeks.map((w, wi) => (
            <div key={wi} className={styles.heatWeek}>
              {w.map((c, di) =>
                c ? (
                  <span key={c.day} data-l={heat(c.count)} title={`${c.day}: ${plural(c.count, "thing")} done`} />
                ) : (
                  <span key={`p${di}`} data-pad />
                )
              )}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.heatFoot}>
        <span>
          <b>{total}</b> things done on <b>{active}</b> days this year
        </span>
        <span className={styles.legend} aria-hidden="true">
          less
          {[0, 1, 2, 3, 4].map((l) => (
            <span key={l} data-l={l} />
          ))}
          more
        </span>
      </div>
    </div>
  );
}

function Donut({ pct }: { pct: number }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 56 56" className={styles.donut} aria-hidden="true">
      <circle cx="28" cy="28" r={r} className={styles.donutTrack} />
      <circle
        cx="28"
        cy="28"
        r={r}
        className={styles.donutFill}
        style={{ strokeDasharray: c, strokeDashoffset: c * (1 - pct / 100) }}
      />
      <text x="28" y="32">
        {pct}%
      </text>
    </svg>
  );
}

function JokeCard() {
  const ref = useRef<HTMLDivElement>(null);
  const [joke, setJoke] = useState<string | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      fetch("/api/joke")
        .then((r) => r.json())
        .then((d) => {
          if (!cancelled && typeof d.text === "string") setJoke(d.text);
        })
        .catch(() => {});
    });
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, []);
  return (
    <div className={styles.joke} ref={ref} data-fx="up">
      <span>☕ a dev joke, for the streak</span>
      <p>{joke ?? "…"}</p>
    </div>
  );
}

export function ProgressView({ tracks }: { tracks: TopicTrack[] }) {
  const statsKey = useProgressValue(() => JSON.stringify(computeStats()), "");
  const stats = useMemo(() => (statsKey ? (JSON.parse(statsKey) as Stats) : DEFAULT_STATS), [statsKey]);
  const doneKey = useProgressValue(() => Object.keys(progress.all().chapters).join(","), "");
  const done = useMemo(() => new Set(doneKey ? doneKey.split(",") : []), [doneKey]);
  const dueCount = useProgressValue(() => progress.dueForReview(Object.keys(progress.all().chapters)).length, 0);
  const days = useActivity();
  const conf = useConfidence();
  const leveledUp = useLevelUp(stats.level);

  const earned = useMemo(() => new Set(earnedBadges(stats).map((b) => b.id)), [stats]);
  const badges = useMemo(
    () => [...BADGES].sort((a, b) => Number(earned.has(b.id)) - Number(earned.has(a.id))),
    [earned]
  );
  const week = days.slice(-7);
  const weekPeak = Math.max(1, ...week.map((d) => d.count));
  const xpPct = stats.xpForNextLevel > 0 ? Math.min(100, (stats.xpIntoLevel / stats.xpForNextLevel) * 100) : 100;
  const marks = Object.values(conf);
  const knew = marks.filter((c) => c === "knew").length;
  const shaky = marks.filter((c) => c === "shaky").length;
  const blank = marks.filter((c) => c === "blank").length;

  const rows = tracks.map((t) => {
    const n = t.ids.filter((id) => done.has(id)).length;
    return { ...t, n, pct: Math.round((n / t.ids.length) * 100) };
  });
  const continueWith = [...rows].filter((t) => t.n > 0 && t.n < t.ids.length).sort((a, b) => b.pct - a.pct)[0];

  const r = 62;
  const circ = 2 * Math.PI * r;

  return (
    <PageFrame title="Progress" links={LINKS} skipLabel="Skip to your progress" scan={statsKey.length}>
      <Confetti fire={leveledUp} />
      {leveledUp && (
        <div className={styles.levelUp} role="status">
          🎉 Level up. You are now level {stats.level}.
        </div>
      )}

      <section className={styles.player} data-fx="scale">
        <div className={styles.ringWrap}>
          <svg viewBox="0 0 150 150" className={styles.ring} aria-hidden="true">
            <circle cx="75" cy="75" r={r} className={styles.ringTrack} />
            <circle
              cx="75"
              cy="75"
              r={r}
              className={styles.ringFill}
              style={{ strokeDasharray: circ, strokeDashoffset: circ * (1 - xpPct / 100) }}
            />
          </svg>
          <div className={styles.ringCenter}>
            <span>level</span>
            <b>{stats.level}</b>
          </div>
        </div>

        <div className={styles.playerMain}>
          <p className={styles.eyebrow}>Your progress</p>
          <h1 className={styles.h1}>
            {stats.xp === 0 ? "Your progress starts with one chapter." : `${stats.xp} XP earned so far.`}
          </h1>
          <div className={styles.xpRow}>
            <div className={styles.xpBar} aria-hidden="true">
              <span style={{ width: `${xpPct}%` }} />
            </div>
            <span>
              {stats.xpIntoLevel} / {stats.xpForNextLevel} XP to level {stats.level + 1}
            </span>
          </div>
          <div className={styles.chips}>
            <span data-lit={stats.streak > 0 || undefined}>
              🔥 <b>{stats.streak}</b> day streak
            </span>
            <span>
              🏅 best <b>{stats.bestStreak}</b>
            </span>
            <span>
              📅 <b>{stats.activeDays}</b> active days
            </span>
          </div>
        </div>

        <figure className={styles.week} aria-label="Things done in the last seven days">
          <figcaption>This week</figcaption>
          <div className={styles.weekBars}>
            {week.map((d, k) => (
              <div key={d.day} data-today={k === week.length - 1 || undefined}>
                <span className={styles.weekBar} style={{ height: `${(d.count / weekPeak) * 100}%` }} />
                <span>{new Date(d.day).toLocaleDateString(undefined, { weekday: "narrow" })}</span>
              </div>
            ))}
          </div>
          <p>
            <b>{week.reduce((n, d) => n + d.count, 0)}</b> this week
          </p>
        </figure>
      </section>

      <dl className={styles.statRow} data-fx="stagger">
        {[
          ["📖", stats.chaptersRead, "chapters read", "blue"],
          ["🧩", stats.exercisesSolved, "exercises solved", "purple"],
          ["↻", stats.totalReviews, "reviews done", "green"],
          ["✦", earned.size, "badges earned", "yellow"],
        ].map(([icon, n, label, tone]) => (
          <div key={label as string} style={accentVar(tone as string)}>
            <span aria-hidden="true">{icon}</span>
            <dd>{n}</dd>
            <dt>{label}</dt>
          </div>
        ))}
      </dl>

      <section className={styles.block} aria-labelledby="next-h">
        <h2 id="next-h" className={styles.h2}>
          What to do next
        </h2>
        <div className={styles.next} data-fx="stagger">
          <Link href="/review" className={styles.nextCard} style={accentVar("orange")}>
            <b>{dueCount ? plural(dueCount, "chapter") : "Nothing"} due for review</b>
            <span>
              {dueCount ? "A few minutes keeps the streak and the memory." : "All fresh. Come back in a day or two."}
            </span>
            <em>Open review →</em>
          </Link>
          <Link
            href={continueWith?.href ?? "/"}
            className={styles.nextCard}
            style={accentVar(continueWith?.accent ?? "primary")}
          >
            <b>{continueWith ? `Keep going with ${continueWith.name}` : "Start a topic"}</b>
            <span>
              {continueWith
                ? `${continueWith.n} of ${continueWith.ids.length} read so far.`
                : "JavaScript is the one everything else builds on."}
            </span>
            <em>{continueWith ? "Continue →" : "Pick one →"}</em>
          </Link>
          <Link
            href={shaky + blank ? "/interview/questions?filter=shaky" : "/interview/questions"}
            className={styles.nextCard}
            style={accentVar("red")}
          >
            <b>{shaky + blank ? `${shaky + blank} weak interview answers` : "Drill interview questions"}</b>
            <span>{shaky + blank ? "Flashcards until they stick." : "Twenty flashcards, marked honestly."}</span>
            <em>Drill →</em>
          </Link>
        </div>
      </section>

      <section className={styles.block} aria-labelledby="act-h">
        <h2 id="act-h" className={styles.h2}>
          The last year
        </h2>
        <div data-fx="up">
          <Heatmap days={days} />
        </div>
      </section>

      <section className={styles.block} aria-labelledby="topics-h">
        <h2 id="topics-h" className={styles.h2}>
          By topic
        </h2>
        <div className={styles.tracks} data-fx="stagger">
          {rows.map((t) => (
            <Link
              key={t.id}
              href={t.href}
              className={styles.track}
              style={accentVar(t.accent)}
              data-empty={!t.n || undefined}
            >
              <Donut pct={t.pct} />
              <span className={styles.trackBody}>
                <b>{t.name}</b>
                <span>
                  {t.n} of {t.ids.length} {t.id === "interview" ? "rounds" : "chapters"}
                </span>
              </span>
              <span className={styles.trackMark} aria-hidden="true">
                {t.mark}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.block} aria-labelledby="int-h">
        <h2 id="int-h" className={styles.h2}>
          Interview answers
        </h2>
        <div className={styles.conf} data-fx="up">
          {marks.length === 0 ? (
            <p>
              Nothing marked yet. Open any round in the <Link href="/interview">interview book</Link>, switch to
              practice mode and mark each answer honestly.
            </p>
          ) : (
            <>
              <div className={styles.confBar} aria-hidden="true">
                <span data-c="knew" style={{ flexGrow: knew }} />
                <span data-c="shaky" style={{ flexGrow: shaky }} />
                <span data-c="blank" style={{ flexGrow: blank }} />
              </div>
              <div className={styles.confLegend}>
                <span data-c="knew">
                  <b>{knew}</b> knew it
                </span>
                <span data-c="shaky">
                  <b>{shaky}</b> shaky
                </span>
                <span data-c="blank">
                  <b>{blank}</b> blank
                </span>
              </div>
            </>
          )}
        </div>
      </section>

      <section className={styles.block} aria-labelledby="badge-h">
        <h2 id="badge-h" className={styles.h2}>
          Badges{" "}
          <small>
            {earned.size} of {BADGES.length}
          </small>
        </h2>
        <div className={styles.badges} data-fx="stagger">
          {badges.map((b) => (
            <div key={b.id} className={styles.badge} data-earned={earned.has(b.id) || undefined}>
              <span className={styles.medal} aria-hidden="true">
                {b.icon}
              </span>
              <b>{b.name}</b>
              <p>{b.description}</p>
            </div>
          ))}
        </div>
      </section>

      <JokeCard />
    </PageFrame>
  );
}
