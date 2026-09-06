"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { progress, store } from "@/lib/storage";
import { useClientValue, useMounted, useProgressValue } from "@/lib/hooks";
import { plural } from "@/lib/format";

const BUDGET_KEY = "jsnotes:reading-budget";
const BUDGET_STEPS = [10, 20, 30, 45, 60, 90];
const DEFAULT_BUDGET = 30;

export interface Station {
  id: string;
  num: string;
  short: string;
  subtitle: string;
  minutes: number;
  exercises: number;
  ready: boolean;
}

export interface RouteGroup {
  id: string;
  name: string;
  stations: Station[];
}

function formatSpan(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export function CoverMap({ groups, basePath }: { groups: RouteGroup[]; basePath: string }) {
  const mounted = useMounted();
  const savedBudget = useClientValue(() => store.get<number>(BUDGET_KEY, DEFAULT_BUDGET), DEFAULT_BUDGET);
  const [budgetOverride, setBudgetOverride] = useState<number | null>(null);
  const budget = budgetOverride ?? savedBudget;
  const [peeked, setPeeked] = useState<string | null>(null);

  const readable = useMemo(() => groups.flatMap((g) => g.stations).filter((s) => s.ready), [groups]);

  const doneKey = useProgressValue(() => readable.map((s) => (progress.isChapterDone(s.id) ? "1" : "0")).join(""), "");
  const done = useMemo(() => {
    const set = new Set<string>();
    if (!doneKey) return set;
    readable.forEach((s, i) => {
      if (doneKey[i] === "1") set.add(s.id);
    });
    return set;
  }, [doneKey, readable]);

  const next = useMemo(() => readable.find((s) => !done.has(s.id)) ?? null, [readable, done]);

  const reach = useMemo(() => {
    const set = new Set<string>();
    if (!next) return set;
    let spent = 0;
    for (let i = readable.indexOf(next); i < readable.length; i++) {
      const s = readable[i];
      if (done.has(s.id)) continue;
      if (spent + s.minutes > budget) break;
      spent += s.minutes;
      set.add(s.id);
    }
    return set;
  }, [readable, next, done, budget]);

  const minutesLeft = readable.filter((s) => !done.has(s.id)).reduce((sum, s) => sum + s.minutes, 0);
  const lastInReach = readable.filter((s) => reach.has(s.id)).slice(-1)[0] ?? null;
  const preview = useMemo(() => {
    const id = peeked ?? next?.id ?? readable[0]?.id;
    return readable.find((s) => s.id === id) ?? null;
  }, [peeked, next, readable]);

  function setBudget(value: number) {
    setBudgetOverride(value);
    store.set(BUDGET_KEY, value);
  }

  const readCount = done.size;

  return (
    <div className="covermap">
      <div className="covermap__bar">
        <div className="covermap__score">
          <span className="covermap__score-num">
            {mounted ? readCount : 0}
            <span className="covermap__score-of">/ {readable.length}</span>
          </span>
          <span className="covermap__score-label">chapters read</span>
        </div>

        <div className="covermap__meter">
          <div className="meter__track">
            <div
              className="meter__fill"
              style={{
                width: `${readable.length ? Math.round(((mounted ? readCount : 0) / readable.length) * 100) : 0}%`,
              }}
            />
          </div>
          <span className="covermap__left">
            {mounted && readCount === readable.length && readable.length > 0
              ? "every chapter read — the review page keeps it fresh"
              : `${formatSpan(mounted ? minutesLeft : readable.reduce((s, c) => s + c.minutes, 0))} of reading left`}
          </span>
        </div>

        {mounted && next && (
          <Link className="btn btn--primary covermap__continue" href={`${basePath}/${next.id}`}>
            {readCount === 0 ? "Start here" : "Continue"} — {next.short} →
          </Link>
        )}
      </div>

      <div className="covermap__budget" role="group" aria-label="Reading time budget">
        <span className="covermap__budget-q">I&apos;ve got</span>
        <div className="covermap__budget-steps">
          {BUDGET_STEPS.map((step) => (
            <button
              key={step}
              type="button"
              className={`covermap__budget-step${budget === step ? " is-on" : ""}`}
              aria-pressed={budget === step}
              onClick={() => setBudget(step)}
            >
              {step}m
            </button>
          ))}
        </div>
        <span className="covermap__budget-out">
          {mounted && next
            ? reach.size > 0
              ? `→ ${plural(reach.size, "chapter")}, up to ${lastInReach?.short}`
              : `→ not even ${next.short} (${next.minutes} min) fits`
            : "→ pick a run for tonight"}
        </span>
      </div>

      <div className="covermap__body">
        <div className="covermap__route">
          {groups.map((group) => {
            const groupMinutes = group.stations.reduce((sum, s) => sum + (s.ready ? s.minutes : 0), 0);
            return (
              <section className="route" key={group.id}>
                <h3 className="route__name">
                  {group.name}
                  <span className="route__meta">
                    {plural(group.stations.filter((s) => s.ready).length, "chapter")} · {formatSpan(groupMinutes)}
                  </span>
                </h3>
                <ol className="route__line">
                  {group.stations.map((s) => {
                    const isDone = mounted && done.has(s.id);
                    const isNext = mounted && next?.id === s.id;
                    const isReach = mounted && reach.has(s.id) && !isNext;
                    const cls = [
                      "station",
                      !s.ready ? "is-soon" : "",
                      isDone ? "is-done" : "",
                      isNext ? "is-next" : "",
                      isReach ? "is-reach" : "",
                      preview?.id === s.id ? "is-peeked" : "",
                    ]
                      .filter(Boolean)
                      .join(" ");
                    return (
                      <li key={s.id} className="station-row">
                        <Link
                          className={cls}
                          href={`${basePath}/${s.id}`}
                          onMouseEnter={() => setPeeked(s.id)}
                          onMouseLeave={() => setPeeked(null)}
                          onFocus={() => setPeeked(s.id)}
                          onBlur={() => setPeeked(null)}
                        >
                          <span className="station__num" aria-hidden="true">
                            {s.num}
                          </span>
                          <span className="station__name">{s.short}</span>
                          <span className="station__min">{s.minutes}m</span>
                        </Link>
                        {mounted && s.ready && (
                          <button
                            type="button"
                            className={`station__tick${isDone ? " is-done" : ""}`}
                            aria-pressed={isDone}
                            title={isDone ? `Mark ${s.short} unread` : `Mark ${s.short} read`}
                            aria-label={isDone ? `Mark ${s.short} unread` : `Mark ${s.short} read`}
                            onClick={() => progress.setChapterDone(s.id, !isDone)}
                          >
                            ✓
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </section>
            );
          })}
        </div>

        <aside className="covermap__peek" aria-live="polite">
          {preview && (
            <>
              <span className="covermap__peek-num">{preview.num}</span>
              <h3 className="covermap__peek-title">{preview.short}</h3>
              <p className="covermap__peek-sub">{preview.subtitle}</p>
              <div className="covermap__peek-meta">
                <span className="chip">{preview.minutes} min read</span>
                {preview.exercises > 0 && <span className="chip">{plural(preview.exercises, "exercise")}</span>}
                {mounted && done.has(preview.id) && <span className="chip chip--done">read ✓</span>}
                {!preview.ready && <span className="chip">not written yet</span>}
              </div>
              <Link className="btn covermap__peek-go" href={`${basePath}/${preview.id}`}>
                Open this chapter →
              </Link>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
