"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { BackButton } from "@/components/practice/BackButton";
import { SiteDrawer } from "@/components/SiteDrawer";
import { TopIcon } from "@/components/practice/TopIcon";
import { progress } from "@/lib/storage";
import { useMounted, useProgressValue } from "@/lib/hooks";
import { plural } from "@/lib/format";
import { problemHref } from "@/lib/problemHref";
import styles from "./problems.module.css";

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

type Level = "beginner" | "intermediate" | "advanced";
type Status = "all" | "todo" | "solved";
type Sort = "pattern" | "title" | "level" | "tests";
type View = "grouped" | "list";

const LEVELS: Level[] = ["beginner", "intermediate", "advanced"];
const LEVEL_RANK: Record<string, number> = { beginner: 0, intermediate: 1, advanced: 2 };
const SORTS: { value: Sort; label: string }[] = [
  { value: "pattern", label: "Pattern order" },
  { value: "level", label: "Difficulty" },
  { value: "title", label: "Title A–Z" },
  { value: "tests", label: "Most tests" },
];

interface Filters {
  q: string;
  topic: string;
  levels: Level[];
  status: Status;
  sort: Sort;
  view: View;
}

const URL_EVENT = "groundwork:problems-url";

function subscribe(cb: () => void) {
  window.addEventListener("popstate", cb);
  window.addEventListener(URL_EVENT, cb);
  return () => {
    window.removeEventListener("popstate", cb);
    window.removeEventListener(URL_EVENT, cb);
  };
}

function parse(search: string): Filters {
  const p = new URLSearchParams(search);
  const levels = (p.get("level") ?? "").split(",").filter((l): l is Level => LEVELS.includes(l as Level));
  const status = p.get("status");
  const sort = p.get("sort");
  return {
    q: p.get("q") ?? "",
    topic: p.get("topic") ?? "all",
    levels,
    status: status === "todo" || status === "solved" ? status : "all",
    sort: SORTS.some((s) => s.value === sort) ? (sort as Sort) : "pattern",
    view: p.get("view") === "list" ? "list" : "grouped",
  };
}

function useFilters(): [Filters, (patch: Partial<Filters>) => void] {
  const search = useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => ""
  );
  const filters = useMemo(() => parse(search), [search]);
  const update = useCallback((patch: Partial<Filters>) => {
    const next = { ...parse(window.location.search), ...patch };
    const p = new URLSearchParams();
    if (next.q) p.set("q", next.q);
    if (next.topic !== "all") p.set("topic", next.topic);
    if (next.levels.length) p.set("level", next.levels.join(","));
    if (next.status !== "all") p.set("status", next.status);
    if (next.sort !== "pattern") p.set("sort", next.sort);
    if (next.view !== "grouped") p.set("view", next.view);
    const qs = p.toString();
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
    window.dispatchEvent(new Event(URL_EVENT));
  }, []);
  return [filters, update];
}

function Ring({ done, total }: { done: number; total: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const frac = total ? done / total : 0;
  return (
    <svg className={styles.ring} viewBox="0 0 84 84" aria-hidden="true">
      <circle cx="42" cy="42" r={r} className={styles.ringTrack} />
      <circle
        cx="42"
        cy="42"
        r={r}
        className={styles.ringFill}
        opacity={frac ? 1 : 0}
        strokeDasharray={`${c * frac} ${c}`}
        transform="rotate(-90 42 42)"
      />
    </svg>
  );
}

function Check({ done }: { done: boolean }) {
  return (
    <span className={`${styles.check}${done ? ` ${styles.checkDone}` : ""}`} aria-hidden="true">
      {done && (
        <svg viewBox="0 0 24 24" width="12" height="12">
          <path
            d="M5 12.5l4.5 4.5L19 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}

export function ProblemsView({ groups, total }: { groups: CategoryGroup[]; total: number }) {
  const mounted = useMounted();
  const router = useRouter();
  const [filters, update] = useFilters();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [opened, setOpened] = useState<{ q: string; ids: Set<string> } | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

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

  const topics = useMemo(() => {
    const seen = new Map<string, string>();
    for (const g of groups) if (!seen.has(g.topicId)) seen.set(g.topicId, g.topicName);
    return [...seen].map(([id, name]) => ({ id, name }));
  }, [groups]);

  const q = filters.q.trim().toLowerCase();
  const pass = useCallback(
    (g: CategoryGroup, p: ProblemRow, skip?: "topic" | "level" | "status") => {
      if (skip !== "topic" && filters.topic !== "all" && g.topicId !== filters.topic) return false;
      if (skip !== "level" && filters.levels.length && !filters.levels.includes(p.level as Level)) return false;
      if (skip !== "status" && filters.status === "solved" && !solved.has(p.id)) return false;
      if (skip !== "status" && filters.status === "todo" && solved.has(p.id)) return false;
      if (q && !`${p.title} ${g.title} ${g.topicName}`.toLowerCase().includes(q)) return false;
      return true;
    },
    [filters, q, solved]
  );

  const counts = useMemo(() => {
    const topic: Record<string, number> = { all: 0 };
    const level: Record<string, number> = {};
    const status: Record<Status, number> = { all: 0, todo: 0, solved: 0 };
    for (const g of groups)
      for (const p of g.problems) {
        if (pass(g, p, "topic")) {
          topic.all++;
          topic[g.topicId] = (topic[g.topicId] ?? 0) + 1;
        }
        if (pass(g, p, "level")) level[p.level] = (level[p.level] ?? 0) + 1;
        if (pass(g, p, "status")) {
          status.all++;
          status[solved.has(p.id) ? "solved" : "todo"]++;
        }
      }
    return { topic, level, status };
  }, [groups, pass, solved]);

  const sortRows = useCallback(
    (rows: ProblemRow[]) => {
      if (filters.sort === "pattern") return rows;
      const out = rows.slice();
      if (filters.sort === "title") out.sort((a, b) => a.title.localeCompare(b.title));
      if (filters.sort === "level") out.sort((a, b) => LEVEL_RANK[a.level] - LEVEL_RANK[b.level]);
      if (filters.sort === "tests") out.sort((a, b) => b.tests - a.tests);
      return out;
    },
    [filters.sort]
  );

  const visible = useMemo(
    () =>
      groups
        .map((g) => ({ ...g, problems: sortRows(g.problems.filter((p) => pass(g, p))) }))
        .filter((g) => g.problems.length > 0),
    [groups, pass, sortRows]
  );

  const groupOf = useMemo(() => new Map(groups.map((g) => [g.chapter, g])), [groups]);
  const flat = useMemo(() => sortRows(visible.flatMap((g) => g.problems)), [visible, sortRows]);
  const shown = flat.length;

  const byLevel = useMemo(() => {
    const out: Record<string, { done: number; total: number }> = {};
    for (const l of LEVELS) out[l] = { done: 0, total: 0 };
    for (const g of groups)
      for (const p of g.problems) {
        const slot = out[p.level];
        if (!slot) continue;
        slot.total++;
        if (solved.has(p.id)) slot.done++;
      }
    return out;
  }, [groups, solved]);

  const nextUp = useMemo(() => flat.find((p) => !solved.has(p.id)) ?? null, [flat, solved]);

  const activeCount =
    (filters.topic !== "all" ? 1 : 0) + filters.levels.length + (filters.status !== "all" ? 1 : 0) + (q ? 1 : 0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!sheetOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSheetOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheetOpen]);

  function randomProblem() {
    const pool = flat.filter((p) => !solved.has(p.id));
    const from = pool.length ? pool : flat;
    if (!from.length) return;
    router.push(problemHref(from[Math.floor(Math.random() * from.length)].id));
  }

  function toggleLevel(l: Level) {
    update({ levels: filters.levels.includes(l) ? filters.levels.filter((x) => x !== l) : [...filters.levels, l] });
  }

  const openIds = useMemo(() => {
    if (opened && opened.q === q) return opened.ids;
    if (q) return new Set(visible.map((g) => g.chapter));
    return new Set(visible[0] ? [visible[0].chapter] : []);
  }, [opened, q, visible]);

  function toggleGroup(id: string) {
    const next = new Set(openIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setOpened({ q, ids: next });
  }

  const anyOpen = visible.some((g) => openIds.has(g.chapter));

  const filterPanel = (
    <>
      <section className={styles.facet} aria-labelledby="pf-topic">
        <h2 id="pf-topic" className={styles.facetH}>
          Topic
        </h2>
        <ul className={styles.facetList}>
          {[{ id: "all", name: "All topics" }, ...topics].map((t) => (
            <li key={t.id}>
              <button
                type="button"
                aria-pressed={filters.topic === t.id}
                className={styles.facetBtn}
                onClick={() => update({ topic: t.id })}
              >
                <span>{t.name}</span>
                <span className={styles.count}>{counts.topic[t.id] ?? 0}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section className={styles.facet} aria-labelledby="pf-level">
        <h2 id="pf-level" className={styles.facetH}>
          Difficulty
        </h2>
        <ul className={styles.facetList}>
          {LEVELS.map((l) => (
            <li key={l}>
              <button
                type="button"
                aria-pressed={filters.levels.includes(l)}
                className={`${styles.facetBtn} ${styles.facetCheck}`}
                data-level={l}
                onClick={() => toggleLevel(l)}
              >
                <span className={styles.box} aria-hidden="true" />
                <span className={styles.levelName}>{l}</span>
                <span className={styles.count}>{counts.level[l] ?? 0}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section className={styles.facet} aria-labelledby="pf-status">
        <h2 id="pf-status" className={styles.facetH}>
          Status
        </h2>
        <div className={styles.seg} role="group" aria-labelledby="pf-status">
          {(
            [
              ["all", "Any"],
              ["todo", "Unsolved"],
              ["solved", "Solved"],
            ] as [Status, string][]
          ).map(([s, label]) => (
            <button key={s} type="button" aria-pressed={filters.status === s} onClick={() => update({ status: s })}>
              {label}
              <span className={styles.count}>{mounted ? counts.status[s] : "–"}</span>
            </button>
          ))}
        </div>
      </section>
      {activeCount > 0 && (
        <button
          type="button"
          className={styles.clear}
          onClick={() => update({ q: "", topic: "all", levels: [], status: "all" })}
        >
          Clear {plural(activeCount, "filter")}
        </button>
      )}
    </>
  );

  return (
    <>
      <a className="skip-link" href="#problem-list">
        Skip to the problems
      </a>
      <div className={styles.page}>
        <header className={styles.top}>
          <div className={styles.topLeft}>
            <BackButton variant="icon" className={styles.iconBtn} fallbackHref="/" fallbackLabel="Home" />
            <button
              type="button"
              className={styles.iconBtn}
              aria-label="Menu"
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              data-tip="Pages, theme and handwriting"
              onClick={() => setMenuOpen(true)}
            >
              <TopIcon name="menu" />
            </button>
            <h1 className={styles.title}>Problems</h1>
          </div>
          <label className={styles.search}>
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              ref={searchRef}
              type="search"
              placeholder="Search problems, patterns, topics"
              aria-label="Search problems"
              autoComplete="off"
              value={filters.q}
              onChange={(e) => update({ q: e.target.value })}
            />
            <kbd aria-hidden="true">/</kbd>
          </label>
          <div className={styles.topRight}>
            <button type="button" className={styles.btn} onClick={randomProblem} disabled={!shown}>
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path
                  d="M4 7h3.5c2 0 3 1 4.5 3.5S14.5 17 16.5 17H20M16 3.5L20 7l-4 3.5M4 17h3.5c1.2 0 2-.4 2.8-1.2M14.2 8.2c.7-.8 1.5-1.2 2.3-1.2H20M16 13.5l4 3.5-4 3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Random</span>
            </button>
            <Link className={styles.btn} href="/practice?id=free" prefetch={false}>
              <TopIcon name="command" size={16} />
              <span>Playground</span>
            </Link>
          </div>
        </header>

        <div className={styles.body}>
          <aside className={styles.side} aria-label="Filters">
            {filterPanel}
          </aside>

          <main className={styles.main} id="main">
            <section className={styles.stats} aria-label="Your progress">
              <div className={styles.ringBox}>
                <Ring done={mounted ? solved.size : 0} total={total} />
                <div className={styles.ringText}>
                  <strong>{mounted ? solved.size : 0}</strong>
                  <span>of {total}</span>
                </div>
              </div>
              <div className={styles.levels}>
                <p className={styles.kicker}>Solved by difficulty</p>
                {LEVELS.map((l) => {
                  const s = byLevel[l];
                  const done = mounted ? s.done : 0;
                  return (
                    <div key={l} className={styles.levelRow} data-level={l}>
                      <span className={styles.levelName}>{l}</span>
                      <span className={styles.bar} aria-hidden="true">
                        <span style={{ width: `${s.total ? (done / s.total) * 100 : 0}%` }} />
                      </span>
                      <span className={styles.levelNum}>
                        {done}/{s.total}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className={styles.next}>
                <p className={styles.kicker}>{solved.size && mounted ? "Pick up where you left off" : "Start here"}</p>
                {nextUp ? (
                  <>
                    <p className={styles.nextTitle}>{nextUp.title}</p>
                    <p className={styles.nextMeta}>
                      {groupOf.get(nextUp.chapter)?.title} · {nextUp.level}
                    </p>
                    <Link className={`${styles.btn} ${styles.primary}`} href={problemHref(nextUp.id)}>
                      Solve it
                      <TopIcon name="next" size={16} />
                    </Link>
                  </>
                ) : (
                  <p className={styles.nextMeta}>Everything here is solved. Try other filters.</p>
                )}
              </div>
            </section>

            <div className={styles.toolbar}>
              <button
                type="button"
                className={`${styles.btn} ${styles.filterBtn}`}
                aria-expanded={sheetOpen}
                aria-controls="problem-filters"
                onClick={() => setSheetOpen(true)}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                  <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Filters
                {activeCount > 0 && <span className={styles.badge}>{activeCount}</span>}
              </button>
              <p className={styles.showing} role="status">
                {shown === total ? `All ${total} problems` : `${shown} of ${total} problems`}
              </p>
              <label className={styles.sort}>
                <span>Sort</span>
                <select value={filters.sort} onChange={(e) => update({ sort: e.target.value as Sort })}>
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className={styles.viewSeg} role="group" aria-label="Layout">
                <button
                  type="button"
                  aria-pressed={filters.view === "grouped"}
                  onClick={() => update({ view: "grouped" })}
                  data-tip="By pattern"
                  aria-label="Group by pattern"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                    <path
                      d="M4 5h16M4 5v4h16V5M6 13h14M6 17h14M6 21h14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-pressed={filters.view === "list"}
                  onClick={() => update({ view: "list" })}
                  data-tip="One list"
                  aria-label="One list"
                >
                  <TopIcon name="list" size={16} />
                </button>
              </div>
              {filters.view === "grouped" && visible.length > 1 && (
                <button
                  type="button"
                  className={styles.linkBtn}
                  onClick={() => setOpened({ q, ids: anyOpen ? new Set() : new Set(visible.map((g) => g.chapter)) })}
                >
                  {anyOpen ? "Collapse all" : "Expand all"}
                </button>
              )}
            </div>

            <div id="problem-list">
              {shown === 0 ? (
                <div className={styles.empty}>
                  <p className={styles.emptyTitle}>No problems match</p>
                  <p>Try a shorter search, or clear the filters.</p>
                  <button
                    type="button"
                    className={styles.btn}
                    onClick={() => update({ q: "", topic: "all", levels: [], status: "all" })}
                  >
                    Clear filters
                  </button>
                </div>
              ) : filters.view === "list" ? (
                <ol className={styles.rows}>
                  {flat.map((p, i) => (
                    <ProblemItem
                      key={p.id}
                      p={p}
                      n={i + 1}
                      done={solved.has(p.id)}
                      pattern={groupOf.get(p.chapter)?.title}
                    />
                  ))}
                </ol>
              ) : (
                visible.map((g) => {
                  const all = groupOf.get(g.chapter)!.problems;
                  const done = mounted ? all.filter((p) => solved.has(p.id)).length : 0;
                  const open = openIds.has(g.chapter);
                  return (
                    <section className={styles.group} key={g.chapter} aria-labelledby={`g-${g.chapter}`}>
                      <div className={styles.groupHead}>
                        <h2 className={styles.groupH}>
                          <button
                            type="button"
                            className={styles.groupToggle}
                            aria-expanded={open}
                            aria-controls={`gl-${g.chapter}`}
                            onClick={() => toggleGroup(g.chapter)}
                          >
                            <span className={styles.chevron} aria-hidden="true" />
                            <span className={styles.groupNum} aria-hidden="true">
                              {g.num}
                            </span>
                            <span className={styles.groupText}>
                              <span id={`g-${g.chapter}`} className={styles.groupTitle}>
                                {g.title}
                              </span>
                              <span className={styles.groupMeta}>
                                {g.topicName} · {plural(g.problems.length, "problem")}
                              </span>
                            </span>
                          </button>
                        </h2>
                        <span className={styles.groupProgress} title={`${done} of ${all.length} solved`}>
                          <span className={styles.bar} aria-hidden="true">
                            <span style={{ width: `${(done / all.length) * 100}%` }} />
                          </span>
                          <span className={styles.levelNum}>
                            {done}/{all.length}
                          </span>
                        </span>
                        <Link className={styles.linkBtn} href={g.chapterHref} prefetch={false}>
                          Read
                        </Link>
                      </div>
                      {open && (
                        <ol className={styles.rows} id={`gl-${g.chapter}`}>
                          {g.problems.map((p) => (
                            <ProblemItem key={p.id} p={p} done={solved.has(p.id)} />
                          ))}
                        </ol>
                      )}
                    </section>
                  );
                })
              )}
            </div>
          </main>
        </div>
      </div>

      {sheetOpen && (
        <div className={styles.sheetRoot}>
          <div className={styles.sheetBackdrop} onClick={() => setSheetOpen(false)} aria-hidden="true" />
          <div className={styles.sheet} id="problem-filters" role="dialog" aria-modal="true" aria-label="Filters">
            <div className={styles.sheetHead}>
              <p className={styles.sheetTitle}>Filters</p>
              <button
                type="button"
                className={styles.iconBtn}
                aria-label="Close filters"
                onClick={() => setSheetOpen(false)}
              >
                ×
              </button>
            </div>
            {filterPanel}
            <button
              type="button"
              className={`${styles.btn} ${styles.primary} ${styles.sheetDone}`}
              onClick={() => setSheetOpen(false)}
            >
              Show {plural(shown, "problem")}
            </button>
          </div>
        </div>
      )}
      <SiteDrawer open={menuOpen} onClose={closeMenu} />
    </>
  );
}

function ProblemItem({ p, n, done, pattern }: { p: ProblemRow; n?: number; done: boolean; pattern?: string }) {
  return (
    <li className={styles.row}>
      <Link className={styles.rowLink} href={problemHref(p.id)} prefetch={false}>
        <Check done={done} />
        {n !== undefined && <span className={styles.rowNum}>{n}</span>}
        <span className={styles.rowTitle}>
          <span>{p.title}</span>
          {pattern && <span className={styles.rowPattern}>{pattern}</span>}
        </span>
        <span className={styles.level} data-level={p.level}>
          {p.level}
        </span>
        <span className={styles.rowTests}>{plural(p.tests, "test")}</span>
        <span className={styles.rowGo} aria-hidden="true">
          <TopIcon name="next" size={16} />
        </span>
        {done && <span className="visually-hidden">(solved)</span>}
      </Link>
    </li>
  );
}
