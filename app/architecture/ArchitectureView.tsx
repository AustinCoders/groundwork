"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { BackButton } from "@/components/practice/BackButton";
import { SiteDrawer } from "@/components/SiteDrawer";
import { TopIcon } from "@/components/practice/TopIcon";
import { progress } from "@/lib/storage";
import { useMounted, useProgressValue } from "@/lib/hooks";
import type { RepoStats } from "@/lib/repoStats";
import styles from "./architecture.module.css";

export interface ChapterCard {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  level: "beginner" | "intermediate" | "advanced";
  minutes: number;
}

interface MapNode {
  chapter: string;
  label: string;
  note: string;
}

interface Lane {
  id: string;
  title: string;
  when: string;
  nodes: MapNode[];
}

const LANES: Lane[] = [
  {
    id: "browser",
    title: "Your browser",
    when: "while you read and code",
    nodes: [
      { chapter: "arch-rendering", label: "Pages", note: "Server-rendered HTML, hydrated into small client islands" },
      { chapter: "arch-playground", label: "Editor", note: "CodeMirror, plus a worker for Prettier, ESLint and types" },
      {
        chapter: "arch-runtimes",
        label: "Runtimes",
        note: "JS, Python, SQL, C/C++, Ruby, PHP and Lua, run as WebAssembly",
      },
      { chapter: "arch-grading", label: "Grading", note: "Tests and recorded cases decide pass or fail" },
      { chapter: "arch-debugger", label: "Debugger", note: "Step through JS and Python line by line" },
      {
        chapter: "arch-whiteboard",
        label: "Whiteboard",
        note: "An SVG board with undo, arrows that follow and share links",
      },
      { chapter: "arch-mock", label: "Mock interviews", note: "Planner, rubric scoring and an adaptive interviewer" },
      { chapter: "arch-state", label: "State", note: "localStorage, the URL and share hashes; no accounts" },
    ],
  },
  {
    id: "edge",
    title: "Vercel",
    when: "on every request",
    nodes: [
      { chapter: "arch-request-path", label: "CDN", note: "Serves prerendered pages straight from the edge" },
      { chapter: "arch-apis", label: "Functions", note: "The /api routes, test cases and mock question banks" },
      { chapter: "arch-search", label: "Search indexes", note: "One JSON index per topic, fetched on demand" },
      { chapter: "arch-routes", label: "Routes", note: "Every URL and why it looks the way it does" },
    ],
  },
  {
    id: "build",
    title: "The build",
    when: "before you arrive",
    nodes: [
      { chapter: "arch-content-model", label: "Content", note: "Topics, chapters and exercises written as TypeScript" },
      { chapter: "arch-build", label: "Build", note: "Static params, recorded cases, indexes and the sitemap" },
      { chapter: "arch-design-system", label: "Design system", note: "Nine themes, seven hands, two shells" },
      { chapter: "arch-tech-stack", label: "Stack", note: "Every dependency, and what is deliberately absent" },
    ],
  },
  {
    id: "around",
    title: "Around it",
    when: "on every push",
    nodes: [
      {
        chapter: "arch-testing",
        label: "Tests & CI",
        note: "Unit tests, end-to-end, accessibility and honesty checks",
      },
      { chapter: "arch-delivery", label: "Delivery", note: "Branches, previews, cleanup and error reporting" },
      { chapter: "arch-performance", label: "Performance", note: "Lighthouse budgets and what each page ships" },
      { chapter: "arch-security", label: "Security", note: "Sandboxing your code and distrusting share links" },
    ],
  },
];

const PARTS: { level: ChapterCard["level"]; title: string; blurb: string }[] = [
  {
    level: "beginner",
    title: "Foundations",
    blurb: "What the site is, what it is made of, and where everything lives.",
  },
  {
    level: "intermediate",
    title: "How it runs",
    blurb: "From request to rendered page, and every feature that runs in your browser.",
  },
  {
    level: "advanced",
    title: "How it holds up",
    blurb: "Speed, safety, tests, delivery, current health and what breaks first.",
  },
];

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function ArchitectureView({
  title,
  lead,
  basePath,
  chapters,
  stats,
  written,
  exercises,
}: {
  title: string;
  lead: string;
  basePath: string;
  chapters: ChapterCard[];
  stats: RepoStats;
  written: number;
  exercises: number;
}) {
  const mounted = useMounted();
  const [menuOpen, setMenuOpen] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const byId = useMemo(() => new Map(chapters.map((c) => [c.id, c])), [chapters]);

  const doneKey = useProgressValue(
    () =>
      chapters
        .filter((c) => progress.isChapterDone(c.id))
        .map((c) => c.id)
        .join(","),
    ""
  );
  const done = useMemo(() => new Set(doneKey ? doneKey.split(",") : []), [doneKey]);
  const next = chapters.find((c) => !done.has(c.id)) ?? chapters[0];
  const totalMinutes = chapters.reduce((n, c) => n + c.minutes, 0);

  const facts: [string, string][] = [
    [formatNumber(stats.pages), "page routes"],
    [formatNumber(stats.routeHandlers), `route handlers, ${stats.apiFunctions} under /api`],
    [formatNumber(stats.codeLines), `lines of app code in ${formatNumber(stats.codeFiles)} files`],
    [formatNumber(stats.contentLines), "lines of written content"],
    [`${stats.runnableLanguages} of ${stats.languages}`, "languages run in the browser"],
    [formatNumber(exercises), "exercises with tests"],
    [`${stats.dependencies} + ${stats.devDependencies}`, "dependencies + dev tools"],
    [`${stats.unitTestFiles} + ${stats.e2eSpecs}`, "unit test files + browser specs"],
  ];

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to the architecture
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
            <span className={styles.crumb}>How this is built</span>
          </div>
          <Link className={`${styles.btn} ${styles.primary}`} href={`${basePath}/${next.id}`}>
            {mounted && done.size ? "Continue reading" : "Start reading"}
            <TopIcon name="next" size={16} />
          </Link>
        </header>

        <main id="main" className={styles.main}>
          <section className={styles.hero}>
            <p className={styles.kicker}>A design review of the site you are reading</p>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.lead}>{lead}</p>
            <div className={styles.heroMeta}>
              <span>{chapters.length} chapters</span>
              <span>
                about {totalMinutes >= 90 ? `${Math.round(totalMinutes / 60)} hours` : `${totalMinutes} minutes`} of
                reading
              </span>
              <span>{written} chapters written across the site</span>
              {mounted && <span>{done.size} read by you</span>}
            </div>
          </section>

          <section className={styles.facts} aria-label="Measured at build time">
            {facts.map(([n, label]) => (
              <div key={label} className={styles.fact}>
                <strong>{n}</strong>
                <span>{label}</span>
              </div>
            ))}
            <p className={styles.factsNote}>Counted from the repository during the build that made this page.</p>
          </section>

          <section className={styles.mapWrap} aria-labelledby="map-h">
            <div className={styles.sectionHead}>
              <h2 id="map-h">The system on one page</h2>
              <p>Pick any box to read the chapter behind it.</p>
            </div>
            <div className={styles.map} data-focus={focus ?? undefined}>
              {LANES.map((lane) => (
                <div key={lane.id} className={styles.lane} data-lane={lane.id}>
                  <div className={styles.laneHead}>
                    <span className={styles.laneTitle}>{lane.title}</span>
                    <span className={styles.laneWhen}>{lane.when}</span>
                  </div>
                  <ul className={styles.nodes}>
                    {lane.nodes.map((n) => {
                      const ch = byId.get(n.chapter);
                      const body = (
                        <>
                          <span className={styles.nodeLabel}>
                            {n.label}
                            {ch && mounted && done.has(ch.id) && (
                              <span className={styles.nodeDone} aria-label="read">
                                ✓
                              </span>
                            )}
                          </span>
                          <span className={styles.nodeNote}>{n.note}</span>
                          {ch && <span className={styles.nodeNum}>{ch.num}</span>}
                        </>
                      );
                      return (
                        <li key={n.chapter} data-dim={focus && focus !== lane.id ? true : undefined}>
                          {ch ? (
                            <Link
                              className={styles.node}
                              href={`${basePath}/${ch.id}`}
                              onMouseEnter={() => setFocus(lane.id)}
                              onMouseLeave={() => setFocus(null)}
                              onFocus={() => setFocus(lane.id)}
                              onBlur={() => setFocus(null)}
                            >
                              {body}
                            </Link>
                          ) : (
                            <span className={styles.node}>{body}</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
              <div className={styles.flow} aria-hidden="true">
                <span>build</span>
                <span>deploy</span>
                <span>request</span>
                <span>run</span>
              </div>
            </div>
          </section>

          {PARTS.map((part, pi) => {
            const list = chapters.filter((c) => c.level === part.level);
            if (!list.length) return null;
            const read = mounted ? list.filter((c) => done.has(c.id)).length : 0;
            return (
              <section key={part.level} className={styles.part} aria-labelledby={`part-${part.level}`}>
                <div className={styles.partHead}>
                  <span className={styles.partNum}>Part {pi + 1}</span>
                  <h2 id={`part-${part.level}`}>{part.title}</h2>
                  <p>{part.blurb}</p>
                  <span className={styles.partProgress}>
                    <span className={styles.bar} aria-hidden="true">
                      <span style={{ width: `${(read / list.length) * 100}%` }} />
                    </span>
                    {read}/{list.length} read
                  </span>
                </div>
                <ol className={styles.cards}>
                  {list.map((c) => (
                    <li key={c.id}>
                      <Link className={styles.card} href={`${basePath}/${c.id}`}>
                        <span className={styles.cardTop}>
                          <span className={styles.cardNum}>{c.num}</span>
                          <span className={styles.cardMin}>{c.minutes} min</span>
                          {mounted && done.has(c.id) && (
                            <span className={styles.cardDone} aria-label="read">
                              ✓
                            </span>
                          )}
                        </span>
                        <span className={styles.cardTitle}>{c.title}</span>
                        <span className={styles.cardSub}>{c.subtitle}</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </section>
            );
          })}
        </main>
      </div>
      <SiteDrawer open={menuOpen} onClose={closeMenu} />
    </>
  );
}
