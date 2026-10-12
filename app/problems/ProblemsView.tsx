"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { FocusTrap } from "@/components/FocusTrap";
import { PageFrame, type FrameLink } from "@/components/frame/PageFrame";
import { Copy, Scene } from "@/components/home/Stage";
import { Card, Compose, Remark, Tag } from "@/components/topic/Compose";
import {
  Actions,
  Band,
  CardKicker,
  Chips,
  Facts,
  Foot,
  FootLink,
  Heading,
  Kicker,
  Lead,
  ProgressMeter,
  Toggle,
  ToggleGroup,
  TopicPage,
  Underlined,
  topicKit,
} from "@/components/topic/TopicKit";
import { ClearButton, CloseButton, KeyHint, SearchPill, kit } from "@/components/ui/MenuKit";
import { TopIcon } from "@/components/practice/TopIcon";
import { plural } from "@/lib/format";
import { useMounted, useProgressValue } from "@/lib/hooks";
import { problemHref } from "@/lib/problemHref";
import { progress } from "@/lib/storage";
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
const STATUSES: [Status, string][] = [
  ["all", "Any"],
  ["todo", "Unsolved"],
  ["solved", "Solved"],
];

const LINKS: FrameLink[] = [
  { href: "/problems", label: "Problems" },
  { href: "/practice", label: "Playground" },
  { href: "/mock", label: "Mock interview" },
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

export function ProblemsView({ groups, total }: { groups: CategoryGroup[]; total: number }) {
  const mounted = useMounted();
  const router = useRouter();
  const [filters, update] = useFilters();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [opened, setOpened] = useState<{ q: string; ids: Set<string> } | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const filtersButtonRef = useRef<HTMLButtonElement>(null);

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

  const totalTests = useMemo(
    () => groups.reduce((sum, g) => sum + g.problems.reduce((n, p) => n + p.tests, 0), 0),
    [groups]
  );
  const nextUp = useMemo(() => flat.find((p) => !solved.has(p.id)) ?? null, [flat, solved]);
  const solvedCount = mounted ? solved.size : 0;

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
      if (e.key === "Escape") {
        setSheetOpen(false);
        filtersButtonRef.current?.focus();
      }
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

  function clearFilters() {
    update({ q: "", topic: "all", levels: [], status: "all" });
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
      <ToggleGroup label="Topic" lead="Topic">
        {[{ id: "all", name: "All topics" }, ...topics].map((t) => (
          <Toggle key={t.id} pressed={filters.topic === t.id} onClick={() => update({ topic: t.id })}>
            {t.name} <span className={styles.count}>{counts.topic[t.id] ?? 0}</span>
          </Toggle>
        ))}
      </ToggleGroup>
      <ToggleGroup label="Difficulty" lead="Difficulty">
        {LEVELS.map((l) => (
          <Toggle key={l} pressed={filters.levels.includes(l)} onClick={() => toggleLevel(l)}>
            <span className={styles.levelName} data-level={l}>
              {l}
            </span>{" "}
            <span className={styles.count}>{counts.level[l] ?? 0}</span>
          </Toggle>
        ))}
      </ToggleGroup>
      <ToggleGroup label="Status" lead="Status">
        {STATUSES.map(([s, label]) => (
          <Toggle key={s} pressed={filters.status === s} onClick={() => update({ status: s })}>
            {label} <span className={styles.count}>{mounted ? counts.status[s] : "–"}</span>
          </Toggle>
        ))}
      </ToggleGroup>
    </>
  );

  const sortAndView = (
    <>
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
          <span>By pattern</span>
        </button>
        <button
          type="button"
          aria-pressed={filters.view === "list"}
          onClick={() => update({ view: "list" })}
          aria-label="One list"
        >
          <TopIcon name="list" size={16} />
          <span>One list</span>
        </button>
      </div>
    </>
  );

  return (
    <PageFrame
      title="Problems"
      titleHref="/problems"
      mark="{ }"
      accent="blue"
      links={LINKS}
      layout="reader"
      skipLabel="Skip to the problems"
      skipHref="#problem-list"
      scan={`${filters.view}:${filters.topic}`}
    >
      <TopicPage accent="blue">
        <Scene className={topicKit.hero}>
          <Copy>
            <Kicker mark="{ }">
              {plural(total, "problem")} · {plural(topics.length, "topic")} · {plural(totalTests, "test")}
            </Kicker>
            <Heading>
              Pick a problem, make the <Underlined>tests pass</Underlined>
            </Heading>
            <Lead>
              Every problem runs in your browser and is graded by real tests. They are grouped by the pattern each one
              teaches, so you learn the shape of the answer, not just this one answer. Nothing is sent anywhere; your
              ticks live on this device.
            </Lead>
            <Actions>
              <Link className={topicKit.btn} href="#problem-list">
                Jump to the list <span aria-hidden="true">↓</span>
              </Link>
              <button type="button" className={topicKit.btnGhost} onClick={randomProblem} disabled={!shown}>
                Random problem
              </button>
            </Actions>
            <Chips>
              {LEVELS.map((l) => (
                <span key={l} className={topicKit.chip}>
                  {byLevel[l].total} {l}
                </span>
              ))}
            </Chips>
          </Copy>
          <Compose live layout="trio">
            <Card as="aside" aria-label="Up next" at="a" tilt={-1} taped>
              <div className={mounted ? undefined : topicKit.pending}>
                <CardKicker>{solvedCount ? "Pick up where you left off" : "Start here"}</CardKicker>
                {nextUp ? (
                  <>
                    <p className={styles.upNextTitle}>
                      <span className={topicKit.highlight}>{nextUp.title}</span>
                    </p>
                    <p className={styles.upNextMeta}>
                      {groupOf.get(nextUp.chapter)?.title} · {nextUp.level} · {plural(nextUp.tests, "test")}
                    </p>
                    <Link className={`${topicKit.btn} ${styles.solveIt}`} href={problemHref(nextUp.id)}>
                      Solve it <span aria-hidden="true">→</span>
                    </Link>
                  </>
                ) : (
                  <p className={styles.upNextMeta}>Everything in view is solved. Try other filters.</p>
                )}
              </div>
            </Card>
            <Card as="aside" aria-label="The problems in numbers" at="b" tilt={1}>
              <Tag tone="primary">★ run in your browser</Tag>
              <CardKicker>In numbers</CardKicker>
              <Facts
                items={[
                  { value: total, label: "problems" },
                  { value: topics.length, label: "topics" },
                  { value: totalTests, label: "tests" },
                ]}
              />
              <Remark>red first, then green</Remark>
            </Card>
            <Card at="c" tone="note" tilt={-1}>
              <div className={mounted ? undefined : topicKit.pending}>
                <CardKicker>Your progress</CardKicker>
                <ProgressMeter done={solvedCount} total={total} label={`${solvedCount} / ${total} solved`} />
                <ul className={styles.levels}>
                  {LEVELS.map((l) => (
                    <li key={l} data-level={l}>
                      <span>{l}</span>
                      <b>
                        {mounted ? byLevel[l].done : 0}/{byLevel[l].total}
                      </b>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </Compose>
        </Scene>

        <Band
          no="01"
          id="find-title"
          label="Find one"
          title="Search it, filter it, or let it pick"
          count={plural(total, "problem")}
        >
          <div className={styles.tools}>
            <SearchPill
              trailing={
                filters.q ? (
                  <ClearButton label="Clear the search" onClear={() => update({ q: "" })} />
                ) : (
                  <KeyHint>/</KeyHint>
                )
              }
            >
              <input
                ref={searchRef}
                type="search"
                placeholder="Search problems, patterns, topics"
                aria-label="Search problems"
                autoComplete="off"
                value={filters.q}
                onChange={(e) => update({ q: e.target.value })}
              />
            </SearchPill>
            <aside className={styles.filters} aria-label="Filters">
              {filterPanel}
              {activeCount > 0 && (
                <button type="button" className={styles.clear} onClick={clearFilters}>
                  Clear {plural(activeCount, "filter")}
                </button>
              )}
            </aside>
          </div>

          <div className={styles.bar}>
            <button
              ref={filtersButtonRef}
              type="button"
              className={styles.filterBtn}
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
            <div className={styles.barEnd}>
              {sortAndView}
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
          </div>

          <div id="problem-list" className={styles.list}>
            {shown === 0 ? (
              <div className={styles.empty}>
                <p className={styles.emptyTitle}>No problems match</p>
                <p className={styles.emptyText}>Try a shorter search, or clear the filters.</p>
                <button type="button" className={topicKit.btnGhost} onClick={clearFilters}>
                  Clear filters
                </button>
              </div>
            ) : filters.view === "list" ? (
              <ol className={kit.rows}>
                {flat.map((p, i) => (
                  <ProblemItem
                    key={p.id}
                    p={p}
                    n={i + 1}
                    done={solved.has(p.id)}
                    ready={mounted}
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
                  <section className={styles.group} key={g.chapter} aria-label={g.title}>
                    <h2 className={styles.groupHead}>
                      <button
                        type="button"
                        className={`${kit.eyebrow} ${kit.eyebrowToggle}`}
                        aria-expanded={open}
                        aria-controls={`gl-${g.chapter}`}
                        onClick={() => toggleGroup(g.chapter)}
                      >
                        <span className={kit.eyebrowNo} aria-hidden="true">
                          {g.num}
                        </span>
                        <span className={kit.eyebrowText}>{g.title}</span>
                        <span className={kit.eyebrowRule} aria-hidden="true" />
                        <span className={`${kit.eyebrowCount} ${styles.groupTopic}`}>{g.topicName}</span>
                        <span className={kit.eyebrowCount}>
                          {done}/{all.length}
                          <span className="visually-hidden"> solved</span>
                        </span>
                        <span className={kit.chevron} aria-hidden="true" />
                      </button>
                    </h2>
                    {open && (
                      <div id={`gl-${g.chapter}`} className={styles.groupBody}>
                        <ol className={kit.rows}>
                          {g.problems.map((p) => (
                            <ProblemItem key={p.id} p={p} done={solved.has(p.id)} ready={mounted} />
                          ))}
                        </ol>
                        <Link className={styles.readLink} href={g.chapterHref} prefetch={false}>
                          Read the chapter first <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    )}
                  </section>
                );
              })
            )}
          </div>
        </Band>

        <Foot>
          <FootLink href="/practice">Playground</FootLink>
          <FootLink href="/mock">Mock interview</FootLink>
          <FootLink href="/">All topics</FootLink>
        </Foot>
      </TopicPage>

      {sheetOpen && (
        <div className={styles.sheetRoot}>
          <div className={styles.sheetBackdrop} onClick={() => setSheetOpen(false)} aria-hidden="true" />
          <FocusTrap>
            <div className={styles.sheet} id="problem-filters" role="dialog" aria-modal="true" aria-label="Filters">
              <div className={styles.sheetHead}>
                <p className={styles.sheetTitle}>Filters</p>
                <CloseButton
                  label="Close filters"
                  onClose={() => {
                    setSheetOpen(false);
                    filtersButtonRef.current?.focus();
                  }}
                />
              </div>
              <div className={styles.sheetBody}>
                {filterPanel}
                <div className={styles.sheetSort}>{sortAndView}</div>
                {activeCount > 0 && (
                  <button type="button" className={styles.clear} onClick={clearFilters}>
                    Clear {plural(activeCount, "filter")}
                  </button>
                )}
              </div>
              <button
                type="button"
                className={`${topicKit.btn} ${styles.sheetDone}`}
                onClick={() => {
                  setSheetOpen(false);
                  filtersButtonRef.current?.focus();
                }}
              >
                Show {plural(shown, "problem")}
              </button>
            </div>
          </FocusTrap>
        </div>
      )}
    </PageFrame>
  );
}

function ProblemItem({
  p,
  n,
  done,
  ready,
  pattern,
}: {
  p: ProblemRow;
  n?: number;
  done: boolean;
  ready: boolean;
  pattern?: string;
}) {
  return (
    <li>
      <Link className={`${kit.row} ${styles.row}`} href={problemHref(p.id)} prefetch={false}>
        <span className={ready ? styles.tick : `${styles.tick} ${topicKit.pending}`} data-done={done || undefined}>
          {done ? "✓" : ""}
        </span>
        {n !== undefined && <span className={kit.code}>{n}</span>}
        <span className={styles.rowText}>
          <span className={kit.title}>{p.title}</span>
          {pattern && <span className={styles.rowPattern}>{pattern}</span>}
        </span>
        <span className={styles.level} data-level={p.level}>
          {p.level}
        </span>
        <span className={styles.tests}>{plural(p.tests, "test")}</span>
        <span className={styles.go} aria-hidden="true">
          →
        </span>
        {done && <span className="visually-hidden">(solved)</span>}
      </Link>
    </li>
  );
}
