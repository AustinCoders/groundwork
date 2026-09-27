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
import styles from "@/components/frame/dash.module.css";
import own from "./progress.module.css";

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
  return { "--accent": name === "ink" ? "var(--ink)" : `var(--c-${name})` } as React.CSSProperties;
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

function Heatmap() {
  const key = useProgressValue(() => JSON.stringify(recentActivity(HEATMAP_DAYS)), "");
  const { weeks, months, active, total } = useMemo(() => {
    const days = (key ? JSON.parse(key) : []) as { day: string; count: number }[];
    if (!days.length) return { weeks: [], months: [], active: 0, total: 0 };
    const pad = new Date(days[0].day).getDay();
    const cells = [...Array.from({ length: pad }, () => null), ...days];
    const weeks: ({ day: string; count: number } | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    const months: { at: number; label: string }[] = [];
    let last = -1;
    weeks.forEach((w, i) => {
      const first = w.find(Boolean);
      if (!first) return;
      const m = new Date(first.day).getMonth();
      if (m !== last) {
        months.push({ at: i, label: MONTHS[m] });
        last = m;
      }
    });
    const spaced = months.filter((m, i) => !months[i + 1] || months[i + 1].at - m.at >= 3);
    return {
      weeks,
      months: spaced,
      active: days.filter((d) => d.count > 0).length,
      total: days.reduce((n, d) => n + d.count, 0),
    };
  }, [key]);

  return (
    <div className={own.heat}>
      <div className={own.heatScroll}>
        <div className={own.heatMonths} style={{ gridTemplateColumns: `repeat(${weeks.length || 52}, 1fr)` }}>
          {months.map((m) => (
            <span key={`${m.at}-${m.label}`} style={{ gridColumnStart: m.at + 1 }}>
              {m.label}
            </span>
          ))}
        </div>
        <div className={own.heatGrid} style={{ gridTemplateColumns: `repeat(${weeks.length || 52}, 1fr)` }}>
          {weeks.map((w, wi) => (
            <div key={wi} className={own.heatWeek}>
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
      <div className={own.heatFoot}>
        <span>
          {plural(total, "thing")} done on {plural(active, "day")} this year
        </span>
        <span className={own.legend} aria-hidden="true">
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
    <div className={own.joke} ref={ref} data-fx="up">
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
  const conf = useConfidence();
  const leveledUp = useLevelUp(stats.level);

  const earned = useMemo(() => new Set(earnedBadges(stats).map((b) => b.id)), [stats]);
  const badges = useMemo(
    () => [...BADGES].sort((a, b) => Number(earned.has(b.id)) - Number(earned.has(a.id))),
    [earned]
  );
  const xpPct = stats.xpForNextLevel > 0 ? Math.min(100, (stats.xpIntoLevel / stats.xpForNextLevel) * 100) : 100;
  const marks = Object.values(conf);
  const knew = marks.filter((c) => c === "knew").length;
  const shaky = marks.filter((c) => c === "shaky").length;
  const blank = marks.filter((c) => c === "blank").length;
  const started = tracks.filter((t) => t.ids.some((id) => done.has(id)));

  const r = 58;
  const circ = 2 * Math.PI * r;

  return (
    <PageFrame title="Progress" links={LINKS} skipLabel="Skip to your progress" scan={statsKey.length}>
      <Confetti fire={leveledUp} />
      {leveledUp && (
        <div className={own.levelUp} role="status">
          🎉 Level up. You are now level {stats.level}.
        </div>
      )}

      <section className={own.hero}>
        <div className={own.ringWrap} data-fx="scale">
          <svg viewBox="0 0 140 140" className={own.ring} aria-hidden="true">
            <circle cx="70" cy="70" r={r} className={own.ringTrack} />
            <circle
              cx="70"
              cy="70"
              r={r}
              className={own.ringFill}
              style={{ strokeDasharray: circ, strokeDashoffset: circ * (1 - xpPct / 100) }}
            />
          </svg>
          <div className={own.ringCenter}>
            <b>{stats.level}</b>
            <span>level</span>
          </div>
        </div>
        <div data-fx="stagger">
          <p className={styles.eyebrow}>Your progress</p>
          <h1 className={styles.h1}>
            {stats.xp === 0 ? (
              "Your progress starts with one chapter."
            ) : (
              <>
                <span className={styles.accent}>{stats.xpIntoLevel}</span> of {stats.xpForNextLevel} XP to level{" "}
                {stats.level + 1}.
              </>
            )}
          </h1>
          <div className={own.xpBar} aria-hidden="true">
            <span style={{ width: `${xpPct}%` }} />
          </div>
          <div className={own.streak} data-lit={stats.streak > 0 || undefined}>
            <span aria-hidden="true">🔥</span>
            <div>
              <b>{plural(stats.streak, "day")}</b>
              <span>current streak · best {plural(stats.bestStreak, "day")}</span>
            </div>
            {stats.streak === 0 && (
              <Link href="/review" className={styles.ghost}>
                Start one today →
              </Link>
            )}
          </div>
        </div>
      </section>

      <dl className={own.statRow} data-fx="stagger">
        {[
          ["📖", stats.chaptersRead, "chapters read"],
          ["🧩", stats.exercisesSolved, "exercises solved"],
          ["↻", stats.totalReviews, "reviews done"],
          ["⚡", stats.xp, "total XP"],
        ].map(([icon, n, label]) => (
          <div key={label as string}>
            <span aria-hidden="true">{icon}</span>
            <dd>{n}</dd>
            <dt>{label}</dt>
          </div>
        ))}
      </dl>

      <section className={styles.block} aria-labelledby="act-h">
        <div className={styles.blockHead}>
          <h2 id="act-h" className={styles.h2}>
            The last year
          </h2>
          <p>Darker means more got done that day.</p>
        </div>
        <div data-fx="up">
          <Heatmap />
        </div>
      </section>

      <section className={styles.block} aria-labelledby="topics-h">
        <div className={styles.blockHead}>
          <h2 id="topics-h" className={styles.h2}>
            By topic
          </h2>
          <p>
            {started.length ? `${plural(started.length, "topic")} started` : "Nothing started yet — pick one to begin."}
          </p>
        </div>
        <div className={own.tracks} data-fx="stagger">
          {tracks.map((t) => {
            const n = t.ids.filter((id) => done.has(id)).length;
            const pct = Math.round((n / t.ids.length) * 100);
            return (
              <Link
                key={t.id}
                href={t.href}
                className={own.track}
                style={accentVar(t.accent)}
                data-empty={!n || undefined}
              >
                <span className={own.trackMark} aria-hidden="true">
                  {t.mark}
                </span>
                <span className={own.trackBody}>
                  <span className={own.trackTop}>
                    <b>{t.name}</b>
                    <span>
                      {n} / {t.ids.length}
                    </span>
                  </span>
                  <span className={own.trackBar}>
                    <span style={{ width: `${pct}%` }} />
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className={styles.block} aria-labelledby="int-h">
        <div className={styles.blockHead}>
          <h2 id="int-h" className={styles.h2}>
            Interview answers
          </h2>
          <p>How you marked yourself in the interview book.</p>
        </div>
        <div className={own.conf} data-fx="up">
          {marks.length === 0 ? (
            <p>
              Nothing marked yet. Open any round in the <Link href="/interview">interview book</Link>, switch to
              practice mode and mark each answer honestly.
            </p>
          ) : (
            <>
              <div className={own.confBar} aria-hidden="true">
                <span data-c="knew" style={{ flexGrow: knew }} />
                <span data-c="shaky" style={{ flexGrow: shaky }} />
                <span data-c="blank" style={{ flexGrow: blank }} />
              </div>
              <div className={own.confLegend}>
                <span data-c="knew">
                  <b>{knew}</b> knew it
                </span>
                <span data-c="shaky">
                  <b>{shaky}</b> shaky
                </span>
                <span data-c="blank">
                  <b>{blank}</b> blank
                </span>
                {shaky + blank > 0 && (
                  <Link href="/interview/questions?filter=shaky" className={styles.btn}>
                    Drill the weak ones →
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      <section className={styles.block} aria-labelledby="badge-h">
        <div className={styles.blockHead}>
          <h2 id="badge-h" className={styles.h2}>
            Badges
          </h2>
          <p>
            {earned.size} of {BADGES.length} unlocked
          </p>
        </div>
        <div className={own.badges} data-fx="stagger">
          {badges.map((b) => (
            <div key={b.id} className={own.badge} data-earned={earned.has(b.id) || undefined}>
              <span aria-hidden="true">{b.icon}</span>
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
