"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Shell } from "@/components/Shell";
import { Crumbs } from "@/components/Crumbs";
import { progress } from "@/lib/storage";
import { useMounted, useProgressValue } from "@/lib/hooks";
import { plural } from "@/lib/format";

export interface ProblemRow {
  id: string;
  title: string;
  level: string;
  tests: number;
  chapter: string;
}

export interface CategoryGroup {
  chapter: string;
  num: string;
  title: string;
  topicId: string;
  topicName: string;
  chapterHref: string;
  problems: ProblemRow[];
}

type LevelFilter = "all" | "beginner" | "intermediate" | "advanced";
type StatusFilter = "all" | "todo" | "solved";

export function ProblemsView({ groups, total }: { groups: CategoryGroup[]; total: number }) {
  const mounted = useMounted();
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<LevelFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  // A joined string, not a Set — useSyncExternalStore compares with Object.is.
  const solvedKey = useProgressValue(
    () =>
      groups
        .flatMap((g) => g.problems)
        .filter((p) => progress.isExerciseSolved(p.id))
        .map((p) => p.id)
        .join(","),
    ""
  );
  const solved = useMemo(() => new Set(solvedKey ? solvedKey.split(",") : []), [solvedKey]);

  const q = query.trim().toLowerCase();
  const visible = useMemo(
    () =>
      groups
        .map((g) => ({
          ...g,
          problems: g.problems.filter((p) => {
            if (level !== "all" && p.level !== level) return false;
            if (status === "solved" && !solved.has(p.id)) return false;
            if (status === "todo" && solved.has(p.id)) return false;
            if (q && !`${p.title} ${g.title} ${g.topicName}`.toLowerCase().includes(q)) return false;
            return true;
          }),
        }))
        .filter((g) => g.problems.length > 0),
    [groups, level, status, q, solved]
  );

  const shown = visible.reduce((n, g) => n + g.problems.length, 0);

  return (
    <Shell skipLabel="Skip to the problems">
      <Crumbs items={[{ label: "All topics", href: "/" }, { label: "Problems" }]} />

      <section className="sheet hero">
        <span className="hero__kicker">practice</span>
        <h1>Every problem, by pattern</h1>
        <p className="hero__lead">
          {total} runnable problems, grouped by the pattern each one teaches rather than by difficulty. Reading trains
          recognition; these train recall — which is the one an interview actually asks for.
        </p>
        <div className="cover__meta">
          <span className="chip">{total} problems</span>
          {mounted && <span className="chip">{solved.size} solved</span>}
        </div>
      </section>

      <div className="prob-controls">
        <div className="shelf-search">
          <span className="shelf-search__icon" aria-hidden="true">
            ⌕
          </span>
          <input
            type="search"
            placeholder="Search problems…"
            aria-label="Search problems"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="prob-filters" role="group" aria-label="Filter by level">
          {(["all", "beginner", "intermediate", "advanced"] as LevelFilter[]).map((l) => (
            <button
              key={l}
              type="button"
              className={`btn btn--chip${level === l ? " is-on" : ""}`}
              aria-pressed={level === l}
              onClick={() => setLevel(l)}
            >
              {l === "all" ? "All levels" : l}
            </button>
          ))}
        </div>
        <div className="prob-filters" role="group" aria-label="Filter by status">
          {(["all", "todo", "solved"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              type="button"
              className={`btn btn--chip${status === s ? " is-on" : ""}`}
              aria-pressed={status === s}
              onClick={() => setStatus(s)}
            >
              {s === "all" ? "Any status" : s === "todo" ? "Unsolved" : "Solved"}
            </button>
          ))}
        </div>
      </div>

      <p className="section-note" role="status">
        {shown === total ? `Showing all ${total}` : `${shown} of ${total} problems`}
      </p>

      {visible.length === 0 ? (
        <section className="sheet">
          <h2>No problems match</h2>
          <p className="sub">Try a shorter search, or clear the filters.</p>
        </section>
      ) : (
        visible.map((g) => (
          <section className="sheet prob-group" key={g.chapter}>
            <div className="prob-group__head">
              <span className="badge" aria-hidden="true">
                {g.num}
              </span>
              <div>
                <h2>{g.title}</h2>
                <p className="sub">
                  {g.topicName} · {plural(g.problems.length, "problem")}
                </p>
              </div>
              <Link className="btn btn--ghost prob-group__read" href={g.chapterHref}>
                Read the chapter
              </Link>
            </div>

            <ul className="prob-list">
              {g.problems.map((p) => (
                <li className={`prob${solved.has(p.id) ? " is-solved" : ""}`} key={p.id}>
                  <Link className="prob__title" href={`/practice?id=${p.id}`}>
                    {p.title}
                  </Link>
                  <span className={`tag tag--${p.level}`}>{p.level}</span>
                  <span className="prob__tests">{plural(p.tests, "test")}</span>
                  <span className="prob__tick" aria-hidden="true">
                    {solved.has(p.id) ? "✓" : ""}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </Shell>
  );
}
