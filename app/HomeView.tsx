"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { SiteDrawer } from "@/components/SiteDrawer";
import { TopIcon } from "@/components/practice/TopIcon";
import { formatSpan, plural } from "@/lib/format";
import { prefersMotion } from "@/lib/dom";
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
    path: [
      { label: "JavaScript, from the engine up", href: "/level/js" },
      { label: "DSA patterns, not puzzle answers", href: "/level/dsa" },
      { label: "The online assessment round", href: "/interview/r1oa" },
    ],
  },
  {
    tag: "Mid",
    tone: "yellow",
    emoji: "🚀",
    title: "Switching after 2–5 years",
    pain: "You ship features every week, then freeze when someone asks why React re-rendered, or to build a widget live in 90 minutes.",
    path: [
      { label: "React: what really triggers a render", href: "/level/react" },
      { label: "The machine coding round", href: "/interview/r2" },
      { label: "System design, trade-offs first", href: "/level/system-design" },
    ],
  },
  {
    tag: "Senior",
    tone: "red",
    emoji: "🏔️",
    title: "Aiming at the ₹50L bar",
    pain: "The questions stop being about syntax. It is distributed systems, runtime internals, and proving you can lead without the title.",
    path: [
      { label: "What changes at ₹50L", href: "/interview/s0" },
      { label: "Distributed systems design", href: "/interview/s2" },
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

function HeroArt({ interview }: { interview: HomeViewProps["interview"] }) {
  return (
    <div className={styles.art} aria-hidden="true">
      <div className={`${styles.paper} ${styles.paperNote}`}>
        <span className={styles.tape} />
        <span className={styles.paperKicker}>JavaScript · Beginner · B13</span>
        <p className={styles.paperTitle}>
          A closure is a function plus <mark>the scope it was born in</mark>.
        </p>
        <span className={styles.lineLong} />
        <span className={styles.lineMid} />
        <span className={styles.lineShort} />
      </div>
      <div className={`${styles.paper} ${styles.paperCode}`}>
        <div className={styles.codeBar}>
          <span />
          <span />
          <span />
          <em>counter.js</em>
          <b className={styles.runPill}>▶ Run</b>
        </div>
        <pre>
          <code>
            <b>function</b> counter() {"{"}
            {"\n"}
            {"  "}
            <b>let</b> n = <i>0</i>;{"\n"}
            {"  "}
            <b>return</b> () =&gt; ++n;{"\n"}
            {"}"}
          </code>
        </pre>
        <ul className={styles.tests}>
          <li>✓ counts up from 1</li>
          <li>✓ each counter keeps its own n</li>
          <li>✓ survives a thousand calls</li>
        </ul>
        <span className={styles.stamp}>3 / 3 passed</span>
      </div>
      <div className={`${styles.paper} ${styles.paperRound}`}>
        <span className={styles.paperKicker}>Round 2 of {interview.rounds} · Machine coding</span>
        <p className={styles.paperQ}>“Now make it work with two browser tabs open.”</p>
        <span className={styles.followUp}>the follow-up they push with next →</span>
      </div>
      <span className={styles.xp}>+25 XP</span>
      <svg className={styles.doodleArrow} viewBox="0 0 120 80">
        <path d="M8 12 C 40 4, 86 20, 100 62" />
        <path d="M86 56 L 101 64 L 106 47" />
      </svg>
      <span className={styles.doodleNote}>run it right here</span>
      <svg className={styles.doodleStar} viewBox="0 0 24 24">
        <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
      </svg>
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

function TopicTicker({ topics }: { topics: ShelfCard[] }) {
  const row = (hidden: boolean) => (
    <ul className={styles.tickerRow} aria-hidden={hidden || undefined}>
      {topics.map((t) => (
        <li key={t.id} style={accent(t.accent)}>
          <span className={styles.tickerMark}>{t.mark}</span>
          {t.name}
        </li>
      ))}
    </ul>
  );
  return (
    <div className={styles.ticker} role="region" aria-label="Topics on the shelf">
      <div className={styles.tickerMove}>
        {row(false)}
        {row(true)}
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
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const pageRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const hours = Math.round(stats.minutes / 60);
  useReveal(pageRef);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function onHeroMove(e: React.PointerEvent<HTMLElement>) {
    const art = artRef.current;
    if (!art || e.pointerType !== "mouse" || !prefersMotion()) return;
    const r = e.currentTarget.getBoundingClientRect();
    art.style.setProperty("--px", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    art.style.setProperty("--py", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
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
      <div className={styles.page} ref={pageRef}>
        <header className={styles.nav}>
          <div className={styles.navInner}>
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
              <a href="#why">Why</a>
              <a href="#loop">Interview loop</a>
              <a href="#who">Who it is for</a>
              <a href="#shelf">Topics</a>
              <a href="#faq">FAQ</a>
            </nav>
            <Link href="/level/js" className={`${styles.btn} ${styles.btnSmall}`}>
              Start reading
            </Link>
          </div>
          <span className={styles.progress} ref={barRef} aria-hidden="true" />
        </header>

        <main id="main">
          <section className={styles.hero} onPointerMove={onHeroMove}>
            <span className={`${styles.blob} ${styles.blobA}`} aria-hidden="true" />
            <span className={`${styles.blob} ${styles.blobB}`} aria-hidden="true" />
            <span className={`${styles.blob} ${styles.blobC}`} aria-hidden="true" />
            <div className={styles.heroCopy}>
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
                {SITE_NAME} is a study site for developers who want the real understanding, not the cheat sheet. Notes
                that never use a word before explaining it, exercises you run and grade right in the page, and an
                interview book that walks every round, from the screening call to the offer number.
              </p>
              <div className={styles.actions}>
                <Link href="/level/js" className={`${styles.btn} ${styles.btnBig}`}>
                  Start with JavaScript <span className={styles.btnArrow}>→</span>
                </Link>
                <Link href="/interview" className={`${styles.btn} ${styles.btnGhost} ${styles.btnBig}`}>
                  Prepare for an interview
                </Link>
              </div>
              <ul className={styles.checks}>
                <li>Free forever</li>
                <li>No account needed</li>
                <li>Code runs in your browser</li>
              </ul>
            </div>
            <div className={styles.artWrap} ref={artRef}>
              <HeroArt interview={interview} />
            </div>
          </section>

          <TopicTicker topics={[...ready, ...soon]} />

          <section className={styles.numbers} aria-label="By the numbers">
            {[
              { n: stats.writtenChapters, s: "", label: "chapters written", tone: "yellow" },
              { n: stats.exercises, s: "", label: "exercises you can run", tone: "green" },
              { n: hours, s: "h", label: "of careful reading", tone: "blue" },
              { n: interview.questions, s: "+", label: "interview questions answered", tone: "red" },
            ].map((x) => (
              <div key={x.label} className={styles.note} style={accent(x.tone)} data-reveal>
                <strong>
                  <Counter value={x.n} suffix={x.s} />
                </strong>
                <span>{x.label}</span>
              </div>
            ))}
          </section>

          <section className={styles.section} id="why" aria-labelledby="why-h">
            <div className={styles.head} data-reveal>
              <p className={styles.eyebrow}>Why come here</p>
              <h2 id="why-h" className={styles.h2}>
                Most prep is either <s>too shallow</s> or <s>too scattered</s>.
              </h2>
              <p className={styles.sub}>
                Tutorials skip the why, problem sites skip the theory, and docs assume you already know. {SITE_NAME}{" "}
                puts the explanation, the practice and the interview in one place, in the right order.
              </p>
            </div>
            <div className={styles.bento}>
              <article className={`${styles.cell} ${styles.cellWide}`} style={accent("yellow")} data-reveal>
                <div className={styles.cellText}>
                  <h3>Nothing is used before it is explained</h3>
                  <p>
                    Every topic is layered bottom to top. You never hit a word the page has not taught you yet, so you
                    stop skimming and start understanding.
                  </p>
                </div>
                <ol className={styles.ladder} aria-hidden="true">
                  <li>Async &amp; the event loop</li>
                  <li>Closures</li>
                  <li>Scope</li>
                  <li>Execution context</li>
                  <li>What the engine does</li>
                </ol>
              </article>
              <article className={styles.cell} style={accent("green")} data-reveal>
                <h3>Read it, then run it</h3>
                <p>
                  {problems} exercises graded by real tests. {languages.runnable} languages run right in your browser.
                </p>
                <div className={styles.miniTests} aria-hidden="true">
                  <span className={styles.miniBar}>
                    <span />
                  </span>
                  <b>5 / 5 tests passed</b>
                </div>
              </article>
              <article className={styles.cell} style={accent("red")} data-reveal>
                <h3>Every round, in order</h3>
                <p>
                  {interview.rounds} rounds from the screening call to the offer number, and the follow-up that comes
                  next.
                </p>
                <div className={styles.miniDots} aria-hidden="true">
                  {Array.from({ length: 9 }, (_, i) => (
                    <span key={i} />
                  ))}
                  <b>🎉</b>
                </div>
              </article>
              <article className={styles.cell} style={accent("orange")} data-reveal>
                <h3>Rehearse the whole loop</h3>
                <p>A mock interview with a timer, follow-ups, a rubric and a hiring-committee debrief.</p>
                <svg className={styles.ring} viewBox="0 0 64 64" aria-hidden="true">
                  <circle cx="32" cy="32" r="26" />
                  <circle cx="32" cy="32" r="26" className={styles.ringFill} />
                  <text x="32" y="37">
                    45:00
                  </text>
                </svg>
              </article>
              <article className={`${styles.cell} ${styles.cellWide}`} style={accent("teal")} data-reveal>
                <div className={styles.cellText}>
                  <h3>Think out loud on a whiteboard</h3>
                  <p>
                    Shapes, arrows that stay attached, sticky notes and system design templates, for the rounds where
                    you draw instead of type.
                  </p>
                </div>
                <svg className={styles.board} viewBox="0 0 260 130" aria-hidden="true">
                  <rect x="6" y="46" width="62" height="36" rx="8" />
                  <rect x="100" y="12" width="66" height="36" rx="8" />
                  <rect x="100" y="80" width="66" height="36" rx="8" />
                  <ellipse cx="226" cy="64" rx="30" ry="22" />
                  <path d="M68 60 L100 32 M68 68 L100 96 M166 30 L196 56 M166 98 L196 72" />
                  <text x="37" y="69">
                    LB
                  </text>
                  <text x="133" y="35">
                    API
                  </text>
                  <text x="133" y="103">
                    API
                  </text>
                  <text x="226" y="69">
                    DB
                  </text>
                </svg>
              </article>
              <article className={styles.cell} style={accent("purple")} data-reveal>
                <h3>Remember what you read</h3>
                <p>Chapters come back for review before you forget them. Streaks and XP keep you honest.</p>
                <div className={styles.streak} aria-hidden="true">
                  {[1, 1, 1, 0, 1, 1, 1].map((on, i) => (
                    <span key={i} data-on={on || undefined} />
                  ))}
                  <b>🔥 6</b>
                </div>
              </article>
            </div>
          </section>

          <section className={`${styles.section} ${styles.loop}`} id="loop" aria-labelledby="loop-h">
            <div className={styles.head} data-reveal>
              <p className={styles.eyebrow}>The interview book</p>
              <h2 id="loop-h" className={styles.h2}>
                From the first call to the offer, round by round.
              </h2>
              <p className={styles.sub}>
                What each round is really testing, the answer, the code, the wrong answer that loses the room, and the
                follow-up they push with next. Pick any round to read it.
              </p>
            </div>
            <div data-reveal>
              <Journey />
            </div>
          </section>

          <section className={styles.section} id="who" aria-labelledby="who-h">
            <div className={styles.head} data-reveal>
              <p className={styles.eyebrow}>Who it is for</p>
              <h2 id="who-h" className={styles.h2}>
                Wherever you are, there is a path that starts there.
              </h2>
            </div>
            <div className={styles.personas}>
              {PERSONAS.map((p) => (
                <article key={p.tag} className={styles.persona} style={accent(p.tone)} data-reveal>
                  <div className={styles.personaTop}>
                    <span className={styles.personaEmoji} aria-hidden="true">
                      {p.emoji}
                    </span>
                    <span className={styles.tag}>{p.tag}</span>
                  </div>
                  <h3>{p.title}</h3>
                  <p className={styles.pain}>{p.pain}</p>
                  <p className={styles.pathLabel}>Your path</p>
                  <ol className={styles.path}>
                    {p.path.map((step) => (
                      <li key={step.href}>
                        <Link href={step.href}>{step.label}</Link>
                      </li>
                    ))}
                  </ol>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.section} aria-labelledby="how-h">
            <div className={styles.head} data-reveal>
              <p className={styles.eyebrow}>How it works</p>
              <h2 id="how-h" className={styles.h2}>
                Three steps, then just keep going.
              </h2>
            </div>
            <ol className={styles.steps}>
              {[
                {
                  t: "Pick a topic",
                  d: `${ready.length} are fully written today. The rest show exactly what is planned, chapter by chapter.`,
                },
                {
                  t: "Say where you are",
                  d: "Beginner, intermediate or advanced. It only changes where the path starts, never what it skips.",
                },
                {
                  t: "Read, then run it",
                  d: "Each chapter that needs practice ends in an editor with real tests. Pass them and it counts.",
                },
              ].map((s, i) => (
                <li key={s.t} data-reveal>
                  <span className={styles.stepNum}>{i + 1}</span>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                  {i < 2 && (
                    <svg className={styles.stepArrow} viewBox="0 0 60 30" aria-hidden="true">
                      <path d="M2 20 C 20 2, 40 2, 56 16 M46 8 L57 17 L44 21" />
                    </svg>
                  )}
                </li>
              ))}
            </ol>
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
                  <span className={styles.bookMark} aria-hidden="true">
                    {t.mark}
                  </span>
                  <span className={styles.bookName}>{t.name}</span>
                  <span className={styles.bookTag}>{t.tagline}</span>
                  <span className={styles.bookMeta}>
                    <span>{plural(t.chapters, "chapter")}</span>
                    {t.exercises > 0 && <span>{plural(t.exercises, "exercise")}</span>}
                    <span>{formatSpan(t.minutes)}</span>
                  </span>
                  <span className={styles.bookGo} aria-hidden="true">
                    →
                  </span>
                </Link>
              ))}
              <Link href="/interview" className={styles.book} style={accent("red")} data-reveal>
                <span className={styles.bookMark} aria-hidden="true">
                  ◎
                </span>
                <span className={styles.bookName}>Interview book</span>
                <span className={styles.bookTag}>Every round, every question, the answer.</span>
                <span className={styles.bookMeta}>
                  <span>{plural(interview.rounds, "round")}</span>
                  <span>{interview.questions}+ questions</span>
                </span>
                <span className={styles.bookGo} aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
            {soon.length > 0 && (
              <div data-reveal>
                <h3 className={styles.soonHead}>Being written next</h3>
                <ul className={styles.soon}>
                  {soon.map((t) => (
                    <li key={t.id}>
                      <Link href={t.href} style={accent(t.accent)}>
                        <span className={styles.soonMark} aria-hidden="true">
                          {t.mark}
                        </span>
                        {t.name}
                        <span className={styles.soonCount}>{t.chapters} planned</span>
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
                  <span className={styles.toolIcon}>
                    <Icon d={x.icon} size={24} />
                  </span>
                  <strong>{x.t}</strong>
                  <span>{toolText[x.t]}</span>
                  <em aria-hidden="true">Open →</em>
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
            <div className={styles.head} data-reveal>
              <p className={styles.eyebrow}>Questions</p>
              <h2 id="faq-h" className={styles.h2}>
                Before you start.
              </h2>
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
          </section>

          <section className={styles.cta} aria-labelledby="cta-h" data-reveal>
            <svg className={styles.ctaDoodle} viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
            </svg>
            <h2 id="cta-h">Ten minutes from now, you could understand one thing properly.</h2>
            <p>Open a chapter. No account, no card, no catch.</p>
            <div className={styles.actions}>
              <Link href="/level/js" className={`${styles.btn} ${styles.btnInvert} ${styles.btnBig}`}>
                Start with JavaScript <span className={styles.btnArrow}>→</span>
              </Link>
              <Link href="/problems" className={`${styles.btn} ${styles.btnOutline} ${styles.btnBig}`}>
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
              <p className={styles.footNote}>
                Written by hand, rendered by a browser. Your progress stays on your device.
              </p>
            </div>
            <nav aria-label="Learn">
              <p className={styles.footHead}>Learn</p>
              {ready.slice(0, 5).map((t) => (
                <Link key={t.id} href={t.href}>
                  {t.name}
                </Link>
              ))}
              <Link href="/interview">Interview book</Link>
            </nav>
            <nav aria-label="Practice">
              <p className={styles.footHead}>Practice</p>
              <Link href="/problems">Problems</Link>
              <Link href="/practice?id=free" prefetch={false}>
                Playground
              </Link>
              <Link href="/mock">Mock interview</Link>
              <Link href="/whiteboard">Whiteboard</Link>
            </nav>
            <nav aria-label="You">
              <p className={styles.footHead}>You</p>
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
