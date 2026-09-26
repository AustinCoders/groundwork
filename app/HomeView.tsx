"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { SiteDrawer } from "@/components/SiteDrawer";
import { TopIcon } from "@/components/practice/TopIcon";
import { formatSpan, plural } from "@/lib/format";
import { prefersMotion } from "@/lib/dom";
import { computeStats } from "@/lib/gamification";
import { useProgressValue } from "@/lib/hooks";
import { progress } from "@/lib/storage";
import { SITE_NAME } from "@/lib/site";
import { useGuidesNav } from "@/lib/topicNav";
import type { SiteStats } from "@/lib/topicStats";
import styles from "./home.module.css";

export interface ShelfCard {
  id: string;
  name: string;
  mark: string;
  accent: string;
  tagline: string;
  href: string;
  chapters: number;
  exercises: number;
  minutes: number;
}

export interface HomeViewProps {
  stats: SiteStats;
  ready: ShelfCard[];
  soon: ShelfCard[];
  problems: number;
  languages: { total: number; runnable: number };
  interview: { rounds: number; questions: number };
}

const ACCENTS: Record<string, string> = { mint: "green" };

function accent(name: string): React.CSSProperties {
  const token = ACCENTS[name] ?? name;
  return { "--accent": token === "ink" ? "var(--ink)" : `var(--c-${token})` } as React.CSSProperties;
}

const PERSONAS = [
  {
    tag: "Fresher",
    tone: "green",
    emoji: "🌱",
    title: "Going for your first job",
    pain: "You can make things work, but closures, this and the event loop still feel like magic, and the online assessment scares you.",
    gains: [
      "Explain what happens before line 1 runs",
      "Solve array and string problems with a pattern, not luck",
      "Walk into the online assessment knowing its format",
    ],
    path: [
      { label: "How your code actually runs", href: "/notes/execution-context" },
      { label: "Closures, finally clear", href: "/notes/closures" },
      { label: "Async and the event loop", href: "/notes/basic-async" },
      { label: "Two pointers, the first real pattern", href: "/dsa/dsa-two-pointers" },
      { label: "The online assessment round", href: "/interview/r1oa" },
    ],
  },
  {
    tag: "Mid",
    tone: "yellow",
    emoji: "🚀",
    title: "Switching after 2–5 years",
    pain: "You ship features every week, then freeze when someone asks why React re-rendered, or to build a widget live in 90 minutes.",
    gains: [
      "Say exactly why a component re-rendered, and stop it",
      "Build a working widget live, under a clock",
      "Talk through a cache or a queue without hand-waving",
    ],
    path: [
      { label: "Why React re-renders, and memo", href: "/react/react-memoisation" },
      { label: "Async, properly", href: "/notes/async-properly" },
      { label: "The machine coding round", href: "/interview/r2" },
      { label: "Caching fundamentals", href: "/system-design/sysdes-caching-fundamentals" },
      { label: "The system design round", href: "/interview/r8" },
    ],
  },
  {
    tag: "Senior",
    tone: "red",
    emoji: "🏔️",
    title: "Aiming at the ₹50L bar",
    pain: "The questions stop being about syntax. It is distributed systems, runtime internals, and proving you can lead without the title.",
    gains: [
      "Reason about consensus, partitions and failure out loud",
      "Explain the runtime under React, not just the API",
      "Tell staff-level stories that survive the follow-up",
    ],
    path: [
      { label: "What changes at ₹50L", href: "/interview/s0" },
      { label: "React Fiber, the engine underneath", href: "/react/react-fiber" },
      { label: "Distributed consensus", href: "/system-design/sysdes-distributed-consensus" },
      { label: "Distributed systems design round", href: "/interview/s2" },
      { label: "Behavioural at staff level", href: "/interview/s4" },
    ],
  },
];

const COMPARE = [
  {
    them: "Video courses",
    gap: "You watch someone else type. Nothing checks that you understood, and you cannot search a video.",
    us: "Every idea is written down, searchable, and followed by an exercise graded by real tests.",
  },
  {
    them: "Grinding problem sites",
    gap: "Hundreds of puzzles with no theory behind them, so a new twist breaks you.",
    us: "Problems are grouped by the pattern they teach, and each pattern has a chapter that explains it.",
  },
  {
    them: "Official docs",
    gap: "Complete and correct, but written for people who already know what they are looking for.",
    us: "Layered bottom to top: nothing uses a word that has not been explained yet.",
  },
  {
    them: "Interview blog posts",
    gap: "A list of questions with one-line answers, and nothing about how the round actually runs.",
    us: "Every round in order, what it is really testing, the wrong answer that loses the room, and the follow-up.",
  },
];

function Icon({ d, size = 22 }: { d: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" style={{ margin: 0 }}>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function useReveal(root: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const host = root.current;
    if (!host || !prefersMotion() || !("IntersectionObserver" in window)) return;
    const items = Array.from(host.querySelectorAll<HTMLElement>("[data-reveal]"));
    const below = items.filter((el) => el.getBoundingClientRect().top > window.innerHeight * 0.9);
    below.forEach((el) => el.setAttribute("data-hidden", ""));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.removeAttribute("data-hidden");
          io.unobserve(e.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    below.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      below.forEach((el) => el.removeAttribute("data-hidden"));
    };
  }, [root]);
}

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !prefersMotion() || !("IntersectionObserver" in window)) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    let raf = 0;
    el.textContent = `0${suffix}`;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        let start: number | null = null;
        const frame = (now: number) => {
          if (start === null) start = now;
          const t = Math.min(1, (now - start) / 1100);
          el.textContent = `${Math.round(value * (1 - Math.pow(1 - t, 3)))}${suffix}`;
          if (t < 1) raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.textContent = `${value}${suffix}`;
    };
  }, [value, suffix]);
  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
}

const GOOD_CODE = `function counter() {
  let n = 0;
  return () => ++n;
}`;

const BROKEN_CODE = `let n = 0;
function counter() {
  return () => ++n;
}`;

const DEMO_TESTS = [
  {
    name: "counts up from 1",
    body: "const c = counter(); const a = c(), b = c(); if (a !== 1 || b !== 2) throw new Error(`got ${a} then ${b}`);",
  },
  {
    name: "each counter keeps its own n",
    body: "const x = counter(), y = counter(); x(); x(); const v = y(); if (v !== 1) throw new Error(`a new counter started at ${v}`);",
  },
  {
    name: "survives a thousand calls",
    body: "const c = counter(); let v = 0; for (let i = 0; i < 1000; i++) v = c(); if (v !== 1000) throw new Error(`ended at ${v}`);",
  },
];

type DemoResult = { name: string; ok: boolean; message?: string };

function TryIt() {
  const [code, setCode] = useState(GOOD_CODE);
  const [results, setResults] = useState<DemoResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  async function runTests() {
    setRunning(true);
    setError(null);
    const { run } = await import("@/lib/runner");
    run({
      code,
      tests: DEMO_TESTS,
      timeout: 3000,
      onConsole: (e) => {
        if (e.kind === "error") setError(e.text);
      },
      onDone: (p) => {
        setRunning(false);
        setResults(
          p.results.length
            ? p.results.map((r) => ({ name: r.name, ok: r.ok, message: r.message }))
            : DEMO_TESTS.map((t) => ({ name: t.name, ok: false }))
        );
      },
    });
  }

  function load(next: string) {
    setCode(next);
    setResults(null);
    setError(null);
  }

  const passed = results?.filter((r) => r.ok).length ?? 0;
  const allGood = results !== null && passed === DEMO_TESTS.length;

  return (
    <div className={styles.editor} data-state={results ? (allGood ? "pass" : "fail") : undefined}>
      <div className={styles.codeBar}>
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <em>counter.js</em>
        <button type="button" className={styles.runPill} onClick={runTests} disabled={running}>
          {running ? "Running…" : "▶ Run tests"}
        </button>
      </div>
      <label className="visually-hidden" htmlFor="try-code">
        Code to test
      </label>
      <textarea
        id="try-code"
        className={styles.codeInput}
        value={code}
        spellCheck={false}
        rows={4}
        onChange={(e) => {
          setCode(e.target.value);
          setResults(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            runTests();
          }
        }}
      />
      <ul className={styles.tests} aria-live="polite">
        {(results ?? DEMO_TESTS.map((t) => ({ name: t.name, ok: false, pending: true }))).map((r) => (
          <li key={r.name} data-ok={"pending" in r ? undefined : r.ok}>
            <span aria-hidden="true">{"pending" in r ? "○" : r.ok ? "✓" : "✗"}</span> {r.name}
            {"message" in r && r.message && !r.ok && <em> · {r.message}</em>}
          </li>
        ))}
      </ul>
      {error && <p className={styles.runError}>{error}</p>}
      <div className={styles.tryFoot}>
        {results ? (
          <strong className={allGood ? styles.passNote : styles.failNote}>
            {passed} / {DEMO_TESTS.length} passed
          </strong>
        ) : (
          <span>Edit it, then run the real tests.</span>
        )}
        {code === GOOD_CODE ? (
          <button type="button" className={styles.linkBtn} onClick={() => load(BROKEN_CODE)}>
            Break it
          </button>
        ) : (
          <button type="button" className={styles.linkBtn} onClick={() => load(GOOD_CODE)}>
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

function WelcomeBack() {
  const key = useProgressValue(() => {
    const s = computeStats();
    const due = progress.dueForReview(Object.keys(progress.all().chapters)).length;
    return s.chaptersRead + s.exercisesSolved > 0
      ? `${s.level}|${s.chaptersRead}|${s.exercisesSolved}|${s.streak}|${due}`
      : "";
  }, "");
  if (!key) return null;
  const [level, read, solved, streak, due] = key.split("|").map(Number);
  return (
    <div className={styles.welcome}>
      <span aria-hidden="true">👋</span>
      <p>
        <strong>Welcome back.</strong> Level {level} · {plural(read, "chapter")} read · {plural(solved, "problem")}{" "}
        solved{streak > 0 ? ` · 🔥 ${streak}-day streak` : ""}
      </p>
      <Link href={due > 0 ? "/review" : "/progress"}>{due > 0 ? `${due} due for review →` : "Your progress →"}</Link>
    </div>
  );
}

function ProductWindow() {
  return (
    <div className={styles.window}>
      <div className={styles.windowBar} aria-hidden="true">
        <span />
        <span />
        <span />
        <em>groundwork / javascript / closures</em>
      </div>
      <div className={styles.windowBody}>
        <article className={styles.chapter} aria-hidden="true">
          <span className={styles.chapterKicker}>B13 · Beginner · 12 min read</span>
          <h3>Closures</h3>
          <p>
            A closure is a function plus <mark>the scope it was born in</mark>. When <code>counter</code> returns, its
            call is over, but the arrow it handed back still holds on to <code>n</code>.
          </p>
          <div className={styles.scopes}>
            <div>
              <b>global</b>
              <div>
                <b>counter()</b>
                <span>
                  n = <i>0</i>
                </span>
                <div>
                  <b>() =&gt; ++n</b>
                </div>
              </div>
            </div>
          </div>
          <p className={styles.chapterNote}>
            <span>Interview follow-up</span> Why does a second counter start from 1?
          </p>
        </article>
        <TryIt />
      </div>
    </div>
  );
}

function StoryVisual({ step }: { step: number }) {
  if (step === 0)
    return (
      <div className={styles.vis} aria-hidden="true">
        {["What the engine does", "Execution context", "Scope", "Closures", "Async & the event loop"].map((t, i) => (
          <span
            key={t}
            className={styles.layer}
            style={{ "--i": i } as React.CSSProperties}
            data-top={i === 3 || undefined}
          >
            {t}
          </span>
        ))}
        <small>Each layer only uses words from the ones below it.</small>
      </div>
    );
  if (step === 1)
    return (
      <div className={styles.vis} aria-hidden="true">
        <div className={styles.visTests}>
          {["returns a promise", "resolves in order", "rejects on the first failure", "handles an empty list"].map(
            (t, i) => (
              <span key={t} style={{ "--i": i } as React.CSSProperties}>
                <b>✓</b> {t}
              </span>
            )
          )}
        </div>
        <strong className={styles.visBig}>4 / 4 passed</strong>
        <small>Your answer, graded by the same tests as the real exercise.</small>
      </div>
    );
  if (step === 2)
    return (
      <div className={styles.vis} aria-hidden="true">
        <div className={styles.chat}>
          <p data-who="them">Build me a debounce.</p>
          <p data-who="you">Timer, clear on each call, fire after the wait.</p>
          <p data-who="them">Now the first call should fire immediately. And cancel?</p>
        </div>
        <small>Every round shows the follow-up they push with next.</small>
      </div>
    );
  return (
    <div className={styles.vis} aria-hidden="true">
      <div className={styles.cal}>
        {Array.from({ length: 28 }, (_, i) => (
          <span key={i} data-on={[2, 5, 9, 12, 16, 23].includes(i) || undefined} data-due={i === 23 || undefined} />
        ))}
      </div>
      <small>Read today, back in 3 days, then 7, 21 and 60.</small>
    </div>
  );
}

const STORY = [
  {
    k: "Read",
    title: "Read a chapter that builds on the last one.",
    body: "Topics are layered bottom to top, so closures arrive after scope, and async after the event loop. You never skim past a word you do not know yet.",
  },
  {
    k: "Run",
    title: "Prove it with real tests, right in the page.",
    body: "Chapters that need practice end in an editor. Your answer runs in your browser against real tests, and a pass is what counts.",
  },
  {
    k: "Get asked",
    title: "Then get asked the follow-up.",
    body: "The interview book shows how each round really goes: the question, the wrong answer that loses the room, and what they push with next.",
  },
  {
    k: "Remember",
    title: "And it comes back before you forget.",
    body: "Chapters you finish come back for review on a spaced schedule, so what you read in week one is still there on interview day.",
  },
];

function Story() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step));
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);
  return (
    <div className={styles.story}>
      <ol className={styles.storySteps}>
        {STORY.map((s, i) => (
          <li
            key={s.k}
            data-step={i}
            data-active={i === active || undefined}
            ref={(el) => {
              refs.current[i] = el;
            }}
          >
            <span className={styles.storyKey}>
              {i + 1} · {s.k}
            </span>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
            <div className={styles.storyInline}>
              <StoryVisual step={i} />
            </div>
          </li>
        ))}
      </ol>
      <div className={styles.storyStage}>
        <div className={styles.storySticky} key={active}>
          <StoryVisual step={active} />
        </div>
      </div>
    </div>
  );
}

function PathTabs() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const p = PERSONAS[active];
  function onKey(e: React.KeyboardEvent) {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (active + step + PERSONAS.length) % PERSONAS.length;
    setActive(next);
    tabs.current[next]?.focus();
  }
  return (
    <div className={styles.paths} style={accent(p.tone)}>
      <div className={styles.tabs} role="tablist" aria-label="Where are you now?" onKeyDown={onKey}>
        {PERSONAS.map((x, i) => (
          <button
            key={x.tag}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`path-tab-${i}`}
            aria-selected={i === active}
            aria-controls="path-panel"
            tabIndex={i === active ? 0 : -1}
            className={styles.tab}
            style={accent(x.tone)}
            onClick={() => setActive(i)}
          >
            <span aria-hidden="true">{x.emoji}</span>
            <span>
              <b>{x.tag}</b>
              <small>{x.title}</small>
            </span>
          </button>
        ))}
      </div>
      <div className={styles.panel} role="tabpanel" id="path-panel" aria-labelledby={`path-tab-${active}`} key={active}>
        <div>
          <h3>{p.title}</h3>
          <p className={styles.muted}>{p.pain}</p>
          <p className={styles.label}>After this path you can</p>
          <ul className={styles.gains}>
            {p.gains.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
          <Link href={p.path[0].href} className={styles.btn}>
            Start this path <span className={styles.btnArrow}>→</span>
          </Link>
        </div>
        <ol className={styles.road}>
          {p.path.map((step, i) => (
            <li key={step.href} style={{ "--i": i } as React.CSSProperties}>
              <Link href={step.href}>
                <span className={styles.roadNum}>{i + 1}</span>
                <span>{step.label}</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function Journey() {
  const guides = useGuidesNav();
  const trackRef = useRef<HTMLOListElement>(null);
  const book = guides.find((g) => g.id === "interview");
  const rounds = book?.groups[0]?.chapters ?? [];
  if (!rounds.length) return null;
  const scroll = (dir: number) => trackRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  return (
    <div className={styles.journey}>
      <div className={styles.journeyNav}>
        <button type="button" onClick={() => scroll(-1)} aria-label="Earlier rounds">
          ←
        </button>
        <button type="button" onClick={() => scroll(1)} aria-label="Later rounds">
          →
        </button>
      </div>
      <ol className={styles.track} ref={trackRef} aria-label="Interview rounds in order">
        {rounds.map((r) => (
          <li key={r.id}>
            <Link href={r.href} prefetch={false}>
              <span className={styles.node}>{r.num}</span>
              <span className={styles.nodeTitle}>{r.title}</span>
            </Link>
          </li>
        ))}
        <li className={styles.offer}>
          <span className={styles.node}>🎉</span>
          <span className={styles.nodeTitle}>The offer</span>
        </li>
      </ol>
    </div>
  );
}

const TOOLS = [
  { href: "/problems", tone: "purple", icon: "M8 9l-4 3 4 3M16 9l4 3-4 3", t: "Problems" },
  { href: "/practice?id=free", tone: "blue", icon: "M4 20h4L19 9l-4-4L4 16zM14 6l4 4", t: "Playground" },
  { href: "/mock", tone: "orange", icon: "M12 7v5l3 2M12 21a9 9 0 110-18 9 9 0 010 18z", t: "Mock interview" },
  { href: "/whiteboard", tone: "teal", icon: "M3 5h18v12H3zM8 21h8M12 17v4", t: "Whiteboard" },
];

export function HomeView({ stats, ready, soon, problems, languages, interview }: HomeViewProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const pageRef = useRef<HTMLDivElement>(null);
  const hours = Math.round(stats.minutes / 60);
  useReveal(pageRef);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toolText: Record<string, string> = {
    Problems: `${problems} problems grouped by the pattern each one teaches.`,
    Playground: `A full editor with a debugger. Try anything in ${languages.runnable} languages.`,
    "Mock interview": "A timed loop for your role and level, with a debrief at the end.",
    Whiteboard: "Sketch a system design with templates and arrows that stay stuck.",
  };

  const faqs = [
    {
      q: "Is it really free?",
      a: "Yes. Every chapter, exercise, mock interview and the whiteboard are free. There is no paid tier hiding the good parts.",
    },
    {
      q: "Do I need to sign up?",
      a: "No. There is no account. Your progress, streak and boards are saved in this browser, so nothing about you leaves your machine.",
    },
    {
      q: "I only have a few weeks before my interview. Where do I start?",
      a: "Open the Interview book and read the round you have next. Each round tells you what it is really testing, so you can spend the time you have on the gaps that matter.",
    },
    {
      q: "Which languages can I run?",
      a: `${languages.runnable} languages run inside your browser, including JavaScript, TypeScript, Python, SQL, C and C++. Another ${languages.total - languages.runnable}, like Java, Go and Rust, get syntax highlighting so you can still write your answers in them.`,
    },
    {
      q: "Is this beginner friendly?",
      a: "Yes, that is the point of the layering. Pick Beginner and the path starts with what the engine does before line 1 runs. If you already know it, pick a higher level and skip ahead.",
    },
    {
      q: "How is the site itself built?",
      a: "It is all written up, from the content model to the build and the tests, in How this is built.",
    },
  ];

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to the content
      </a>
      <div className={styles.page} ref={pageRef}>
        <header className={styles.nav} data-scrolled={scrolled || undefined}>
          <button
            type="button"
            className={styles.iconBtn}
            aria-label="Menu"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <TopIcon name="menu" />
          </button>
          <Link href="/" className={styles.brand} aria-label={`${SITE_NAME} home`}>
            <span className="brand__mark" aria-hidden="true">
              JS
            </span>
            <span>{SITE_NAME}</span>
          </Link>
          <nav className={styles.navLinks} aria-label="Sections">
            <a href="#how">How it works</a>
            <a href="#who">Paths</a>
            <a href="#loop">Interview loop</a>
            <a href="#shelf">Topics</a>
            <a href="#faq">FAQ</a>
          </nav>
          <Link href="/level/js" className={`${styles.btn} ${styles.btnSmall}`}>
            Start reading
          </Link>
        </header>

        <main id="main">
          <section className={styles.hero}>
            <WelcomeBack />
            <p className={styles.kicker}>
              <span className={styles.dot} aria-hidden="true" /> Free · no sign-up · {stats.writtenChapters} chapters
              written
            </p>
            <h1 className={styles.h1}>
              Understand JavaScript properly. <span className={styles.accentText}>Walk into the interview ready.</span>
            </h1>
            <p className={styles.lead}>
              Notes that never use a word before explaining it, exercises graded by real tests right in the page, and an
              interview book that walks every round up to the offer.
            </p>
            <div className={styles.actions}>
              <Link href="/level/js" className={`${styles.btn} ${styles.btnBig}`}>
                Start with JavaScript <span className={styles.btnArrow}>→</span>
              </Link>
              <Link href="/interview" className={`${styles.btn} ${styles.btnGhost} ${styles.btnBig}`}>
                Prepare for an interview
              </Link>
            </div>
            <p className={styles.tryHint} aria-hidden="true">
              ↓ the editor below really runs. Break it and see.
            </p>
            <div className={styles.windowWrap}>
              <ProductWindow />
            </div>
            <dl className={styles.stats}>
              {[
                { n: stats.writtenChapters, s: "", l: "chapters written" },
                { n: stats.exercises, s: "", l: "exercises you can run" },
                { n: hours, s: "h", l: "of careful reading" },
                { n: interview.questions, s: "+", l: "interview questions" },
              ].map((x) => (
                <div key={x.l}>
                  <dt>{x.l}</dt>
                  <dd>
                    <Counter value={x.n} suffix={x.s} />
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={styles.section} id="how" aria-labelledby="how-h">
            <div className={styles.head} data-reveal>
              <p className={styles.eyebrow}>How it works</p>
              <h2 id="how-h" className={styles.h2}>
                Read it. Run it. Get asked about it. Keep it.
              </h2>
              <p className={styles.sub}>
                Most prep is either too shallow or too scattered. Here, the explanation, the practice and the interview
                sit in one place, in the right order.
              </p>
            </div>
            <Story />
          </section>

          <section className={styles.section} id="features" aria-labelledby="feat-h">
            <div className={styles.head} data-reveal>
              <p className={styles.eyebrow}>Everything in one place</p>
              <h2 id="feat-h" className={styles.h2}>
                Built for the way interviews actually go.
              </h2>
            </div>
            <div className={styles.bento}>
              <article className={`${styles.cell} ${styles.cellWide}`} style={accent("green")} data-reveal>
                <span className={styles.cellIcon}>
                  <Icon d="M8 9l-4 3 4 3M16 9l4 3-4 3M13.5 6l-3 12" />
                </span>
                <h3>{problems} exercises, graded for real</h3>
                <p>
                  An editor that knows {languages.total} languages and runs {languages.runnable} of them inside your
                  browser. No install, no server, no waiting.
                </p>
                <div className={styles.langs} aria-hidden="true">
                  {["JS", "TS", "Python", "SQL", "C++", "C", "Ruby", "PHP", "Lua", "HTML", "CSS"].map((l) => (
                    <span key={l}>{l}</span>
                  ))}
                </div>
              </article>
              <article className={styles.cell} style={accent("red")} data-reveal>
                <span className={styles.cellIcon}>
                  <Icon d="M12 21a9 9 0 100-18 9 9 0 000 18zM12 16a4 4 0 100-8 4 4 0 000 8zM12 12h.01" />
                </span>
                <h3>{interview.rounds} interview rounds</h3>
                <p>From the screening call to the offer number, with {interview.questions}+ questions answered.</p>
              </article>
              <article className={styles.cell} style={accent("orange")} data-reveal>
                <span className={styles.cellIcon}>
                  <Icon d="M12 7v5l3 2M12 21a9 9 0 110-18 9 9 0 010 18z" />
                </span>
                <h3>Mock interviews</h3>
                <p>A timer, follow-ups, a rubric and a hiring-committee style debrief.</p>
              </article>
              <article className={styles.cell} style={accent("teal")} data-reveal>
                <span className={styles.cellIcon}>
                  <Icon d="M3 5h18v12H3zM8 21h8M12 17v4M7 9h4M7 13h7" />
                </span>
                <h3>A real whiteboard</h3>
                <p>Arrows that stay attached, sticky notes and system design templates.</p>
              </article>
              <article className={`${styles.cell} ${styles.cellWide}`} style={accent("purple")} data-reveal>
                <span className={styles.cellIcon}>
                  <Icon d="M4 12a8 8 0 0113.7-5.6L20 9M20 4v5h-5M20 12a8 8 0 01-13.7 5.6L4 15M4 20v-5h5" />
                </span>
                <h3>Nothing to sign up for</h3>
                <p>
                  Progress, streaks, XP and your whiteboards live in this browser. Nothing about you leaves your
                  machine, and there is no paid tier hiding the good parts.
                </p>
              </article>
            </div>
          </section>

          <section className={styles.section} id="who" aria-labelledby="who-h">
            <div className={styles.head} data-reveal>
              <p className={styles.eyebrow}>Paths</p>
              <h2 id="who-h" className={styles.h2}>
                Where are you now? There is a path that starts there.
              </h2>
            </div>
            <div data-reveal>
              <PathTabs />
            </div>
          </section>

          <section className={styles.section} id="loop" aria-labelledby="loop-h">
            <div className={styles.loopCard} data-reveal>
              <div className={styles.head}>
                <p className={styles.eyebrow}>The interview book</p>
                <h2 id="loop-h" className={styles.h2}>
                  From the first call to the offer, round by round.
                </h2>
                <p className={styles.sub}>
                  What each round is really testing, the answer, the wrong answer that loses the room, and the
                  follow-up. Pick any round to read it.
                </p>
              </div>
              <Journey />
            </div>
          </section>

          <section className={styles.section} id="shelf" aria-labelledby="shelf-h">
            <div className={styles.head} data-reveal>
              <p className={styles.eyebrow}>On the shelf</p>
              <h2 id="shelf-h" className={styles.h2}>
                Ready to read today.
              </h2>
            </div>
            <div className={styles.shelf}>
              {ready.map((t) => (
                <Link key={t.id} href={t.href} className={styles.book} style={accent(t.accent)} data-reveal>
                  <span className={styles.bookTop}>
                    <span className={styles.bookMark} aria-hidden="true">
                      {t.mark}
                    </span>
                    <span className={styles.bookGo} aria-hidden="true">
                      →
                    </span>
                  </span>
                  <span className={styles.bookName}>{t.name}</span>
                  <span className={styles.bookTag}>{t.tagline}</span>
                  <span className={styles.bookMeta}>
                    <span>{plural(t.chapters, "chapter")}</span>
                    {t.exercises > 0 && <span>{plural(t.exercises, "exercise")}</span>}
                    <span>{formatSpan(t.minutes)}</span>
                  </span>
                </Link>
              ))}
              <Link href="/interview" className={styles.book} style={accent("red")} data-reveal>
                <span className={styles.bookTop}>
                  <span className={styles.bookMark} aria-hidden="true">
                    ◎
                  </span>
                  <span className={styles.bookGo} aria-hidden="true">
                    →
                  </span>
                </span>
                <span className={styles.bookName}>Interview book</span>
                <span className={styles.bookTag}>Every round, every question, the answer.</span>
                <span className={styles.bookMeta}>
                  <span>{plural(interview.rounds, "round")}</span>
                  <span>{interview.questions}+ questions</span>
                </span>
              </Link>
            </div>
            {soon.length > 0 && (
              <div className={styles.soonWrap} data-reveal>
                <p className={styles.label}>Being written next</p>
                <ul className={styles.soon}>
                  {soon.map((t) => (
                    <li key={t.id}>
                      <Link href={t.href} style={accent(t.accent)}>
                        <span className={styles.soonMark} aria-hidden="true">
                          {t.mark}
                        </span>
                        {t.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section className={styles.section} aria-labelledby="tools-h">
            <div className={styles.head} data-reveal>
              <p className={styles.eyebrow}>Practice tools</p>
              <h2 id="tools-h" className={styles.h2}>
                Reading is half of it.
              </h2>
            </div>
            <div className={styles.tools}>
              {TOOLS.map((x) => (
                <Link
                  key={x.href}
                  href={x.href}
                  className={styles.tool}
                  style={accent(x.tone)}
                  prefetch={false}
                  data-reveal
                >
                  <span className={styles.cellIcon}>
                    <Icon d={x.icon} />
                  </span>
                  <strong>{x.t}</strong>
                  <span>{toolText[x.t]}</span>
                </Link>
              ))}
            </div>
          </section>

          <section className={styles.section} aria-labelledby="vs-h">
            <div className={styles.head} data-reveal>
              <p className={styles.eyebrow}>Why not just…</p>
              <h2 id="vs-h" className={styles.h2}>
                What you already tried, and what is different here.
              </h2>
            </div>
            <div className={styles.compare} data-reveal>
              <div className={styles.compareHead} aria-hidden="true">
                <span />
                <span>The usual way</span>
                <span>{SITE_NAME}</span>
              </div>
              {COMPARE.map((c) => (
                <div key={c.them} className={styles.compareRow}>
                  <h3>{c.them}</h3>
                  <p className={styles.them}>
                    <span aria-hidden="true">✗</span> {c.gap}
                  </p>
                  <p className={styles.us}>
                    <span aria-hidden="true">✓</span> {c.us}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.section} id="faq" aria-labelledby="faq-h">
            <div className={styles.faqGrid}>
              <div className={styles.head} data-reveal>
                <p className={styles.eyebrow}>Questions</p>
                <h2 id="faq-h" className={styles.h2}>
                  Before you start.
                </h2>
                <p className={styles.sub}>Everything people ask before opening their first chapter.</p>
              </div>
              <div className={styles.faq}>
                {faqs.map((f) => (
                  <details key={f.q} className={styles.faqItem} data-reveal>
                    <summary>{f.q}</summary>
                    <p>
                      {f.a}
                      {f.q.startsWith("How is the site") && (
                        <>
                          {" "}
                          <Link href="/architecture">Read how it is built →</Link>
                        </>
                      )}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.cta} aria-labelledby="cta-h" data-reveal>
            <h2 id="cta-h" className={styles.h2}>
              Ten minutes from now, you could understand one thing properly.
            </h2>
            <p className={styles.sub}>Open a chapter. No account, no card, no catch.</p>
            <div className={styles.actions}>
              <Link href="/level/js" className={`${styles.btn} ${styles.btnBig}`}>
                Start with JavaScript <span className={styles.btnArrow}>→</span>
              </Link>
              <Link href="/problems" className={`${styles.btn} ${styles.btnGhost} ${styles.btnBig}`}>
                Solve a problem
              </Link>
            </div>
          </section>
        </main>

        <footer className={styles.foot}>
          <div className={styles.footCols}>
            <div>
              <p className={styles.footBrand}>
                <span className="brand__mark" aria-hidden="true">
                  JS
                </span>
                {SITE_NAME}
              </p>
              <p className={styles.muted}>
                Written by hand, rendered by a browser. Your progress stays on your device.
              </p>
            </div>
            <nav aria-label="Learn">
              <p className={styles.label}>Learn</p>
              {ready.slice(0, 5).map((t) => (
                <Link key={t.id} href={t.href}>
                  {t.name}
                </Link>
              ))}
              <Link href="/interview">Interview book</Link>
            </nav>
            <nav aria-label="Practice">
              <p className={styles.label}>Practice</p>
              <Link href="/problems">Problems</Link>
              <Link href="/practice?id=free" prefetch={false}>
                Playground
              </Link>
              <Link href="/mock">Mock interview</Link>
              <Link href="/whiteboard">Whiteboard</Link>
            </nav>
            <nav aria-label="You">
              <p className={styles.label}>You</p>
              <Link href="/progress">Progress</Link>
              <Link href="/review">Review</Link>
              <Link href="/architecture">How this is built</Link>
            </nav>
          </div>
        </footer>
      </div>
      <SiteDrawer open={menuOpen} onClose={closeMenu} />
    </>
  );
}
