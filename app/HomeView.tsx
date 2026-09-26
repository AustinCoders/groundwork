"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
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
import "lenis/dist/lenis.css";
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

let smooth: { scrollTo: (y: number) => void; stop: () => void; start: () => void } | null = null;

function useScrollFx(root: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const host = root.current;
    if (!host || !prefersMotion() || !("IntersectionObserver" in window)) return;
    host.setAttribute("data-fx", "on");
    const bar = host.querySelector<HTMLElement>("[data-scrollbar]");
    const els = Array.from(host.querySelectorAll<HTMLElement>("[data-fx]"));
    const live = new Set<HTMLElement>();
    const clamp = (n: number) => Math.min(1, Math.max(0, n));

    const measure = (el: HTMLElement, h: number, y: number, max: number) => {
      const r = el.getBoundingClientRect();
      const start = r.top + y - h;
      const travel = Math.min(h * 0.32, max - start);
      const enter = start <= 0 || travel <= 0 ? 1 : clamp((y - start) / travel);
      el.style.setProperty("--in", enter.toFixed(3));
      el.style.setProperty("--vp", clamp((h - r.top) / (h + r.height)).toFixed(3));
      el.style.setProperty("--out", clamp(-r.top / Math.max(1, r.height)).toFixed(3));
    };

    const frame = (all: boolean) => {
      const h = window.innerHeight;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - h;
      (all ? els : live).forEach((el) => measure(el, h, y, max));
      bar?.style.setProperty("--sp", (max > 0 ? y / max : 0).toFixed(4));
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) live.add(e.target as HTMLElement);
          else live.delete(e.target as HTMLElement);
        });
        frame(true);
      },
      { rootMargin: "15% 0px 15% 0px" }
    );
    els.forEach((el) => io.observe(el));
    frame(true);

    let raf = 0;
    const onScroll = () => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          frame(false);
        });
    };
    const onResize = () => frame(true);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    let dead = false;
    let loop = 0;
    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null;
    import("lenis").then(({ default: Lenis }) => {
      if (dead) return;
      const l = new Lenis({
        lerp: 0.085,
        smoothWheel: true,
        anchors: { offset: -64 },
        prevent: (node) => Boolean(node.closest("[role=dialog], textarea, [data-no-smooth]")),
      });
      lenis = l;
      smooth = { scrollTo: (y) => l.scrollTo(y), stop: () => l.stop(), start: () => l.start() };
      const tick = (t: number) => {
        l.raf(t);
        loop = requestAnimationFrame(tick);
      };
      loop = requestAnimationFrame(tick);
    });

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(loop);
      lenis?.destroy();
      smooth = null;
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      host.removeAttribute("data-fx");
    };
  }, [root]);
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
      {allGood && (
        <span className={styles.stamp} aria-hidden="true">
          Passed ✓
        </span>
      )}
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

function HeroArt({ interview }: { interview: HomeViewProps["interview"] }) {
  return (
    <div className={styles.art}>
      <div className={`${styles.paper} ${styles.paperNote}`} aria-hidden="true">
        <span className={styles.tape} />
        <span className={styles.paperKicker}>JavaScript · Beginner · B13</span>
        <p className={styles.paperTitle}>
          A closure is a function plus <mark>the scope it was born in</mark>.
        </p>
        <span className={styles.lineLong} />
        <span className={styles.lineMid} />
      </div>
      <div className={`${styles.paper} ${styles.paperCode}`}>
        <TryIt />
      </div>
      <div className={`${styles.paper} ${styles.paperRound}`} aria-hidden="true">
        <span className={styles.paperKicker}>Round 2 of {interview.rounds} · Machine coding</span>
        <p className={styles.paperQ}>“Now make it work with two browser tabs open.”</p>
        <span className={styles.followUp}>the follow-up they push with next →</span>
      </div>
      <span className={styles.xp} aria-hidden="true">
        +25 XP
      </span>
      <span className={styles.doodleNote} aria-hidden="true">
        go on, run it
      </span>
      <svg className={styles.doodleArrow} viewBox="0 0 120 80" aria-hidden="true">
        <path d="M8 12 C 40 4, 86 20, 100 62" />
        <path d="M86 56 L 101 64 L 106 47" />
      </svg>
      <svg className={styles.doodleStar} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
      </svg>
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
    k: "Keep",
    title: "And it comes back before you forget.",
    body: "Chapters you finish come back for review on a spaced schedule, so what you read in week one is still there on interview day.",
  },
];

const LAYERS = ["What the engine does", "Execution context", "Scope", "Closures", "Async & the event loop"];
const RUN_TESTS = ["returns a promise", "resolves in order", "rejects on the first failure", "handles an empty list"];
const CHAT: { who: "them" | "you"; text: string }[] = [
  { who: "them", text: "Build me a debounce." },
  { who: "you", text: "A timer, cleared on every call, fired after the wait." },
  { who: "them", text: "Good. Now the first call fires at once. And how do I cancel it?" },
];
const REVIEW_DAYS = [0, 3, 10, 31];

function vars(v: Record<string, number>): React.CSSProperties {
  return Object.fromEntries(Object.entries(v).map(([k, n]) => [`--${k}`, n])) as React.CSSProperties;
}

function StoryVisual({ step }: { step: number }) {
  if (step === 0)
    return (
      <div className={styles.vis} aria-hidden="true">
        <div className={styles.layers}>
          {LAYERS.map((t, i) => (
            <span key={t} className={styles.layer} style={vars({ i })} data-top={i === 3 || undefined}>
              <b>{String(i + 1).padStart(2, "0")}</b>
              {t}
            </span>
          ))}
        </div>
        <small>Each layer only uses words from the ones below it.</small>
      </div>
    );
  if (step === 1)
    return (
      <div className={styles.vis} aria-hidden="true">
        <div className={styles.visTests}>
          {RUN_TESTS.map((t, i) => (
            <span key={t} style={vars({ i })}>
              <i>✓</i>
              {t}
            </span>
          ))}
        </div>
        <span className={styles.visBar}>
          <span />
        </span>
        <strong className={styles.visBig}>4 / 4 passed</strong>
      </div>
    );
  if (step === 2)
    return (
      <div className={styles.vis} aria-hidden="true">
        <div className={styles.chat}>
          {CHAT.map((m, i) => (
            <p key={m.text} data-who={m.who} style={vars({ i })}>
              {m.text}
            </p>
          ))}
          <span className={styles.typing}>
            <i />
            <i />
            <i />
          </span>
        </div>
        <small>Every round shows the follow-up they push with next.</small>
      </div>
    );
  return (
    <div className={styles.vis} aria-hidden="true">
      <div className={styles.cal}>
        {Array.from({ length: 35 }, (_, i) => {
          const k = REVIEW_DAYS.indexOf(i);
          return <span key={i} data-on={k >= 0 || undefined} style={k >= 0 ? vars({ k }) : undefined} />;
        })}
      </div>
      <small>Read today. Back after 3 days, then 7 more, then 21.</small>
    </div>
  );
}

function Story() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const prog = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1;
      const x = prog * STORY.length;
      const step = Math.min(STORY.length - 1, Math.floor(x));
      const local = Math.min(1, Math.max(0, (x - step) * 1.35));
      el.style.setProperty("--progress", prog.toFixed(4));
      el.style.setProperty("--p", local.toFixed(4));
      if (step !== activeRef.current) {
        activeRef.current = step;
        setActive(step);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  function jump(i: number) {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const total = el.offsetHeight - window.innerHeight;
    const target = top + (total * (i + 0.55)) / STORY.length;
    if (smooth) smooth.scrollTo(target);
    else window.scrollTo({ top: target, behavior: "smooth" });
  }

  const state = (i: number) => (i < active ? "past" : i === active ? "active" : "next");

  return (
    <>
      <div className={styles.story} ref={ref} style={vars({ steps: STORY.length })}>
        <div className={styles.pin}>
          <div className={styles.pinText}>
            <div className={styles.rail} aria-label="Steps" role="group">
              {STORY.map((s, i) => (
                <button
                  key={s.k}
                  type="button"
                  aria-current={i === active ? "step" : undefined}
                  className={styles.railStep}
                  style={vars({ i })}
                  onClick={() => jump(i)}
                >
                  <span className={styles.railFill} />
                  <b>
                    {String(i + 1).padStart(2, "0")} · {s.k}
                  </b>
                </button>
              ))}
            </div>
            <div className={styles.pinCopy}>
              {STORY.map((s, i) => (
                <article key={s.k} data-state={state(i)} aria-hidden={i !== active}>
                  <span className={styles.bigNum} aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </article>
              ))}
            </div>
          </div>
          <div className={styles.pinStage}>
            {STORY.map((s, i) => (
              <div key={s.k} className={styles.stageItem} data-state={state(i)}>
                <StoryVisual step={i} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <ol className={styles.storyList}>
        {STORY.map((s, i) => (
          <li key={s.k} data-fx="up">
            <span className={styles.storyKey}>
              {String(i + 1).padStart(2, "0")} · {s.k}
            </span>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
            <StoryVisual step={i} />
          </li>
        ))}
      </ol>
    </>
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

function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((w, i, all) => (
        <Fragment key={i}>
          <span className={styles.w} style={vars({ i })}>
            {w}
          </span>
          {i < all.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  );
}

function Journey({ children }: { children: React.ReactNode }) {
  const guides = useGuidesNav();
  const wrapRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const book = guides.find((g) => g.id === "interview");
  const rounds = book?.groups[0]?.chapters ?? [];

  useEffect(() => {
    const wrap = wrapRef.current;
    const pin = pinRef.current;
    const track = trackRef.current;
    if (!wrap || !pin || !track) return;
    const wide = window.matchMedia("(min-width: 1081px)");
    let dist = 0;
    let raf = 0;
    const measure = () => {
      const on = wide.matches && prefersMotion();
      wrap.dataset.pinned = on ? "true" : "false";
      if (!on) {
        wrap.style.height = "";
        track.style.transform = "";
        return;
      }
      dist = Math.max(0, track.scrollWidth - pin.clientWidth);
      wrap.style.height = `${dist * 0.55 + window.innerHeight}px`;
      update();
    };
    const update = () => {
      raf = 0;
      if (wrap.dataset.pinned !== "true") return;
      const top = wrap.getBoundingClientRect().top;
      const prog = dist > 0 ? Math.min(1, Math.max(0, -top / (dist * 0.55))) : 0;
      track.style.transform = `translate3d(${(-prog * dist).toFixed(1)}px, 0, 0)`;
      wrap.style.setProperty("--jp", prog.toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, [rounds.length]);

  if (!rounds.length) return null;
  return (
    <div className={styles.sideWrap} ref={wrapRef}>
      <div className={styles.sidePin} ref={pinRef}>
        {children}
        <span className={styles.sideProgress} aria-hidden="true">
          <span />
        </span>
        <ol className={styles.track} ref={trackRef} aria-label="Interview rounds in order">
          {rounds.map((r, i) => (
            <li key={r.id} style={vars({ i })}>
              <Link href={r.href} prefetch={false} className={styles.round} data-glow>
                <span className={styles.roundNum}>{r.num}</span>
                <span className={styles.roundStep}>Round {String(i + 1).padStart(2, "0")}</span>
                <span className={styles.roundTitle}>{r.title}</span>
                <span className={styles.roundGo} aria-hidden="true">
                  Read it →
                </span>
              </Link>
            </li>
          ))}
          <li className={styles.offer}>
            <span className={styles.roundNum}>🎉</span>
            <span className={styles.roundTitle}>The offer</span>
            <span className={styles.roundStep}>and the number you negotiate</span>
          </li>
        </ol>
      </div>
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
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    smooth?.start();
  }, []);
  const pageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const hours = Math.round(stats.minutes / 60);
  useScrollFx(pageRef);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      setScrolled(window.scrollY > 8);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  function onHeroMove(e: React.PointerEvent<HTMLElement>) {
    const art = artRef.current;
    if (!art || e.pointerType !== "mouse" || !prefersMotion()) return;
    const r = e.currentTarget.getBoundingClientRect();
    art.style.setProperty("--px", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    art.style.setProperty("--py", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  }

  function onGlow(e: React.PointerEvent) {
    if (e.pointerType !== "mouse") return;
    const card = (e.target as Element).closest<HTMLElement>("[data-glow]");
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

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
      <div className={styles.page} ref={pageRef} onPointerMove={onGlow}>
        <header className={styles.nav} data-scrolled={scrolled || undefined}>
          <button
            type="button"
            className={styles.iconBtn}
            aria-label="Menu"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            onClick={() => {
              smooth?.stop();
              setMenuOpen(true);
            }}
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
          <span className={styles.scrollBar} data-scrollbar aria-hidden="true" />
        </header>

        <main id="main">
          <section className={styles.hero} ref={heroRef} data-fx="heroOut" onPointerMove={onHeroMove}>
            <div className={styles.heroCopy}>
              <WelcomeBack />
              <p className={styles.kicker}>
                <span className={styles.dot} aria-hidden="true" /> Free · no sign-up · {stats.writtenChapters} chapters
                written
              </p>
              <h1 className={styles.h1}>
                Understand JavaScript properly.{" "}
                <span className={styles.h1Accent}>
                  Walk into the interview ready.
                  <svg className={styles.underline} viewBox="0 0 400 24" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M4 16 C 90 4, 190 22, 280 10 S 380 8, 396 14" />
                  </svg>
                </span>
              </h1>
              <p className={styles.lead}>
                Notes that never use a word before explaining it, exercises graded by real tests right in the page, and
                an interview book that walks every round up to the offer.
              </p>
              <div className={styles.actions}>
                <Link href="/level/js" className={`${styles.btn} ${styles.btnBig}`}>
                  Start with JavaScript <span className={styles.btnArrow}>→</span>
                </Link>
                <Link href="/interview" className={`${styles.btn} ${styles.btnGhost} ${styles.btnBig}`}>
                  Prepare for an interview
                </Link>
              </div>
              <dl className={styles.heroStats}>
                {[
                  { n: stats.writtenChapters, s: "", l: "chapters" },
                  { n: stats.exercises, s: "", l: "runnable exercises" },
                  { n: hours, s: "h", l: "of reading" },
                  { n: interview.questions, s: "+", l: "interview questions" },
                ].map((x) => (
                  <div key={x.l}>
                    <dt>{x.l}</dt>
                    <dd>
                      {x.n}
                      {x.s}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className={styles.artWrap} ref={artRef}>
              <HeroArt interview={interview} />
            </div>
          </section>

          <section className={styles.section} id="how" aria-labelledby="how-h">
            <div className={styles.head} data-fx="head">
              <p className={styles.eyebrow}>How it works</p>
              <h2 id="how-h" className={styles.h2}>
                <Words text="Read it. Run it. Get asked about it. Keep it." />
              </h2>
              <p className={styles.sub}>
                Most prep is either too shallow or too scattered. Here, the explanation, the practice and the interview
                sit in one place, in the right order.
              </p>
            </div>
            <Story />
          </section>

          <section className={styles.section} id="features" aria-labelledby="feat-h">
            <div className={styles.head} data-fx="head">
              <p className={styles.eyebrow}>Everything in one place</p>
              <h2 id="feat-h" className={styles.h2}>
                <Words text="Built for the way interviews actually go." />
              </h2>
            </div>
            <div className={styles.bento}>
              <article className={`${styles.cell} ${styles.cellWide}`} style={accent("green")} data-fx="left" data-glow>
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
              <article
                className={styles.cell}
                style={{ ...accent("red"), ...vars({ d: 1 }) }}
                data-fx="right"
                data-glow
              >
                <span className={styles.cellIcon}>
                  <Icon d="M12 21a9 9 0 100-18 9 9 0 000 18zM12 16a4 4 0 100-8 4 4 0 000 8zM12 12h.01" />
                </span>
                <h3>{interview.rounds} interview rounds</h3>
                <p>From the screening call to the offer number, with {interview.questions}+ questions answered.</p>
              </article>
              <article className={styles.cell} style={accent("orange")} data-fx="flip" data-glow>
                <span className={styles.cellIcon}>
                  <Icon d="M12 7v5l3 2M12 21a9 9 0 110-18 9 9 0 010 18z" />
                </span>
                <h3>Mock interviews</h3>
                <p>A timer, follow-ups, a rubric and a hiring-committee style debrief.</p>
              </article>
              <article
                className={styles.cell}
                style={{ ...accent("teal"), ...vars({ d: 1 }) }}
                data-fx="flip"
                data-glow
              >
                <span className={styles.cellIcon}>
                  <Icon d="M3 5h18v12H3zM8 21h8M12 17v4M7 9h4M7 13h7" />
                </span>
                <h3>A real whiteboard</h3>
                <p>Arrows that stay attached, sticky notes and system design templates.</p>
              </article>
              <article
                className={`${styles.cell} ${styles.cellWide}`}
                style={{ ...accent("purple"), ...vars({ d: 2 }) }}
                data-fx="right"
                data-glow
              >
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
            <div className={styles.head} data-fx="head">
              <p className={styles.eyebrow}>Paths</p>
              <h2 id="who-h" className={styles.h2}>
                <Words text="Where are you now? There is a path that starts there." />
              </h2>
            </div>
            <div data-fx="scale">
              <PathTabs />
            </div>
          </section>

          <section className={styles.loopSection} id="loop" aria-labelledby="loop-h">
            <Journey>
              <div className={styles.head}>
                <p className={styles.eyebrow}>The interview book</p>
                <h2 id="loop-h" className={styles.h2}>
                  <Words text="From the first call to the offer, round by round." />
                </h2>
                <p className={styles.sub}>
                  What each round is really testing, the answer, the wrong answer that loses the room, and the
                  follow-up. Pick any round to read it.
                </p>
              </div>
            </Journey>
          </section>

          <section className={styles.section} id="shelf" aria-labelledby="shelf-h">
            <div className={styles.head} data-fx="head">
              <p className={styles.eyebrow}>On the shelf</p>
              <h2 id="shelf-h" className={styles.h2}>
                <Words text="Ready to read today." />
              </h2>
            </div>
            <div className={styles.shelf}>
              {ready.map((t, i) => (
                <Link
                  key={t.id}
                  href={t.href}
                  className={styles.book}
                  style={{ ...accent(t.accent), ...vars({ d: i % 3 }) }}
                  data-fx="up"
                  data-glow
                >
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
              <Link
                href="/interview"
                className={styles.book}
                style={{ ...accent("red"), ...vars({ d: ready.length % 3 }) }}
                data-fx="up"
                data-glow
              >
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
              <div className={styles.soonWrap} data-fx="right">
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
            <div className={styles.head} data-fx="head">
              <p className={styles.eyebrow}>Practice tools</p>
              <h2 id="tools-h" className={styles.h2}>
                <Words text="Reading is half of it." />
              </h2>
            </div>
            <div className={styles.tools}>
              {TOOLS.map((x, i) => (
                <Link
                  key={x.href}
                  href={x.href}
                  className={styles.tool}
                  data-glow
                  style={{ ...accent(x.tone), ...vars({ d: i }) }}
                  prefetch={false}
                  data-fx="flip"
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
            <div className={styles.head} data-fx="head">
              <p className={styles.eyebrow}>Why not just…</p>
              <h2 id="vs-h" className={styles.h2}>
                <Words text="What you already tried, and what is different here." />
              </h2>
            </div>
            <div className={styles.compare} data-fx="compare">
              <div className={styles.compareHead} aria-hidden="true">
                <span />
                <span>The usual way</span>
                <span>{SITE_NAME}</span>
              </div>
              {COMPARE.map((c, i) => (
                <div key={c.them} className={styles.compareRow} style={vars({ r: i })}>
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
              <div className={styles.head} data-fx="head">
                <p className={styles.eyebrow}>Questions</p>
                <h2 id="faq-h" className={styles.h2}>
                  <Words text="Before you start." />
                </h2>
                <p className={styles.sub}>Everything people ask before opening their first chapter.</p>
              </div>
              <div className={styles.faq}>
                {faqs.map((f, i) => (
                  <details key={f.q} className={styles.faqItem} data-fx="right" style={vars({ d: i * 0.6 })}>
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

          <section className={styles.cta} aria-labelledby="cta-h" data-fx="scale">
            <h2 id="cta-h" className={styles.h2}>
              <Words text="Ten minutes from now, you could understand one thing properly." />
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
          <svg className={styles.bigBrand} viewBox="0 0 1000 190" aria-hidden="true" focusable="false" data-fx="brand">
            <text x="500" y="150" textAnchor="middle">
              {SITE_NAME}
            </text>
          </svg>
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
