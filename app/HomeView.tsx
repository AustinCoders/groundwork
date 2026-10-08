"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { SiteDrawer } from "@/components/SiteDrawer";
import { TopIcon } from "@/components/practice/TopIcon";
import { Connectors, type Link as Hop } from "@/components/home/Connectors";
import { CtaScene } from "@/components/home/CtaScene";
import { FaqScene, type Faq } from "@/components/home/FaqScene";
import { HOW_STEPS, HowScene } from "@/components/home/HowScene";
import { InterviewScene } from "@/components/home/InterviewScene";
import { PATH_COUNT, PathsScene } from "@/components/home/PathsScene";
import { PracticeScene } from "@/components/home/PracticeScene";
import { SectionRail } from "@/components/home/SectionRail";
import { TopicsScene } from "@/components/home/TopicsScene";
import { useSceneScroll } from "@/components/home/useSceneScroll";
import { vars } from "@/components/home/tone";
import type { HomeViewProps } from "@/components/home/types";
import { plural } from "@/lib/format";
import { HOME_STAGES } from "@/lib/homeRounds";
import { PIN_HOLD_VH, pinLengthVh } from "@/lib/pinLengths";
import type { ConnectorLive } from "@/lib/connector";
import { prefersMotion } from "@/lib/dom";
import { smoothScroll, useScrollFx } from "@/lib/scrollFx";
import { computeStats } from "@/lib/gamification";
import { useProgressValue } from "@/lib/hooks";
import { progress } from "@/lib/storage";
import { SITE_NAME } from "@/lib/site";
import styles from "./home.module.css";

const HOME_LERP = 0.14;

function listNames(names: string[]): string {
  if (names.length < 2) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
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

function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((w, i, all) => (
        <Fragment key={i}>
          <span className={styles.w} style={vars({ i })} data-fx="word">
            {w}
          </span>
          {i < all.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  );
}

function Head({
  no,
  label,
  id,
  sub,
  size = "md",
  children,
}: {
  no: string;
  label: string;
  id: string;
  sub?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}) {
  return (
    <div className={styles.head}>
      <p className={styles.eyebrow} data-fx="eyebrow">
        <span className={styles.eyebrowNo} data-waypoint={id.replace(/-h$/, "")}>
          {no}
        </span>{" "}
        {label}
      </p>
      <h2 id={id} className={styles.h2} data-size={size}>
        {children}
      </h2>
      {sub && (
        <p className={styles.sub} data-fx="sub">
          {sub}
        </p>
      )}
    </div>
  );
}

export function HomeView({ stats, ready, soon, languages, interview, bookRounds }: HomeViewProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    smoothScroll.start();
  }, []);
  const pageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const connectorsRef = useRef<ConnectorLive | null>(null);
  const hours = Math.round(stats.minutes / 60);
  const stageCounts = HOME_STAGES.map((stage) => bookRounds.filter((round) => round.stage === stage.id).length).filter(
    (count) => count > 0
  );
  useSceneScroll(pageRef, connectorsRef);
  useScrollFx(pageRef, null, 0, HOME_LERP);

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

  const faqs: Faq[] = [
    {
      q: "Is it really free?",
      a: "Yes. Every chapter, exercise, mock interview and the whiteboard are free. There is no paid tier hiding the good parts.",
    },
    {
      q: "Why not just videos, problem sites, docs or blog posts?",
      a: "Each is good at one thing. Here is where they fall short, and what is different on this site.",
      contrasts: true,
    },
    {
      q: "Do I need to sign up?",
      a: "No. There is no account. Your progress, streak and boards are saved in this browser. Some things do leave it: anonymous page analytics, the text the narrator reads aloud, error reports, requests to a CDN for the playground's language runtimes, and the request logs every web host keeps.",
      link: { href: "/privacy", label: "What leaves, and where it goes →" },
    },
    {
      q: "Which topics are written?",
      a: `${listNames(ready.map((t) => t.name))} have chapters written today, next to the interview book. The rest of the shelf, from other languages to data, computer science and AI, is laid out as coming soon and fills in as chapters are written.`,
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
      a: "Yes, that is the point of the layering. Pick a topic, then Beginner, and the path starts from the ground up, for example with what the engine does before line 1 runs in JavaScript. If you already know it, pick a higher level and skip ahead.",
    },
    {
      q: "How is the site itself built?",
      a: "It is all written up, from the content model to the build and the tests, in How this is built.",
      link: { href: "/architecture", label: "Read how it is built →" },
    },
  ];

  const hops: Hop[] = [
    { label: "then practise it", fact: `${ready.length + 1} topics written`, traveller: "plane" },
    { label: "see how it works", fact: `${stats.exercises} exercises`, traveller: "pencil" },
    { label: "pick your path", fact: `${HOW_STEPS} steps`, traveller: "bookmark" },
    { label: "meet the rounds", fact: `${PATH_COUNT} paths`, traveller: "compass" },
    { label: "ask away", fact: `${interview.rounds} rounds`, traveller: "flag" },
    { label: "go on", fact: `${faqs.length} answers`, traveller: "key" },
  ];

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to the content
      </a>
      <div className={styles.page} ref={pageRef}>
        <Connectors liveRef={connectorsRef} links={hops} />
        <header className={styles.nav} data-scrolled={scrolled || undefined}>
          <button
            type="button"
            className={styles.iconBtn}
            aria-label="Menu"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            onClick={() => {
              smoothScroll.stop();
              setMenuOpen(true);
            }}
          >
            <TopIcon name="menu" />
          </button>
          <Link href="/" className={styles.brand} aria-label={`${SITE_NAME} home`}>
            <span className="brand__mark" aria-hidden="true">
              G
            </span>
            <span>{SITE_NAME}</span>
          </Link>
          <nav className={styles.navLinks} aria-label="Sections">
            <a href="#shelf">Topics</a>
            <a href="#practice">Practice</a>
            <a href="#how">How it works</a>
            <a href="#paths">Paths</a>
            <a href="#loop">Interview book</a>
            <a href="#faq">FAQ</a>
          </nav>
          <a href="#shelf" className={`${styles.btn} ${styles.btnSmall}`}>
            Start reading
          </a>
          <span className={styles.scrollBar} data-scrollbar aria-hidden="true" />
        </header>
        <SectionRail />

        <main id="main">
          <section className={styles.hero} ref={heroRef} data-fx="heroOut" onPointerMove={onHeroMove}>
            <div className={styles.heroCopy}>
              <WelcomeBack />
              <p className={styles.kicker}>
                <span className={styles.dot} aria-hidden="true" /> Free · no sign-up · {stats.writtenChapters} chapters
                written
              </p>
              <h1 className={styles.h1}>
                Understand software properly.{" "}
                <span className={styles.h1Accent}>
                  Walk into the interview ready.
                  <svg className={styles.underline} viewBox="0 0 400 24" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M4 16 C 90 4, 190 22, 280 10 S 380 8, 396 14" />
                  </svg>
                </span>
              </h1>
              <p className={styles.lead}>
                Handwritten notes for software developers, from languages and the web to data, computer science and AI.
                Nothing uses a word before it is explained, exercises are graded by real tests right in the page, and an
                interview book walks every round up to the offer.
              </p>
              <div className={styles.actions}>
                <a href="#shelf" className={`${styles.btn} ${styles.btnBig}`}>
                  Pick a topic <span className={styles.btnArrow}>→</span>
                </a>
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

          <section className={styles.section} id="shelf" aria-labelledby="shelf-h" data-scene>
            <div className={styles.pin} data-pin-box>
              <TopicsScene
                ready={ready}
                soon={soon}
                interview={interview}
                onBrowse={() => {
                  smoothScroll.stop();
                  setMenuOpen(true);
                }}
                head={
                  <Head
                    no="01"
                    label="Topics"
                    id="shelf-h"
                    sub="What is written today comes first. Every other topic is laid out and fills in as its chapters are written."
                  >
                    <Words text="Every topic a developer needs." />{" "}
                    <span className={styles.hl}>
                      <Words text="Pick a topic." />
                    </span>
                  </Head>
                }
              />
            </div>
          </section>

          <section className={styles.section} id="practice" aria-labelledby="practice-h" data-scene>
            <div className={styles.pin} data-pin-box>
              <PracticeScene
                stats={stats}
                languages={languages}
                interview={interview}
                head={
                  <Head
                    no="02"
                    label="Practice"
                    id="practice-h"
                    sub="Four tools, all free, all in the browser. Nothing to install and nothing to sign up for."
                  >
                    <Words text="Reading is half of it." />
                  </Head>
                }
              />
            </div>
          </section>

          <section
            className={styles.section}
            id="how"
            aria-labelledby="how-h"
            data-scene
            data-pin-groups={Array(HOW_STEPS).fill(1).join(",")}
            data-pin-hold={PIN_HOLD_VH}
            style={vars({ "pin-d": pinLengthVh("how", HOW_STEPS) })}
          >
            <div className={styles.pin} data-pin-box>
              <HowScene
                head={
                  <Head
                    no="03"
                    label="How it works"
                    id="how-h"
                    sub="Most prep is either too shallow or too scattered. Here, the explanation, the practice and the interview sit in one place, in the right order."
                  >
                    <Words text="Read it. Run it. Get asked about it. Keep it." />
                  </Head>
                }
              />
            </div>
          </section>

          <section
            className={styles.section}
            id="paths"
            aria-labelledby="paths-h"
            data-scene
            data-pin-groups={Array(PATH_COUNT).fill(1).join(",")}
            data-pin-hold={PIN_HOLD_VH}
            style={vars({ "pin-d": pinLengthVh("paths", PATH_COUNT) })}
          >
            <div className={styles.pin} data-pin-box>
              <PathsScene
                ready={ready}
                soon={soon}
                head={
                  <Head no="04" label="Paths" id="paths-h" size="sm">
                    <Words text="Where are you now? There is a path that starts there." />
                  </Head>
                }
              />
            </div>
          </section>

          <section
            className={styles.section}
            id="loop"
            aria-labelledby="loop-h"
            data-scene
            data-pin-groups={stageCounts.join(",")}
            data-pin-hold={PIN_HOLD_VH}
            style={vars({ "pin-d": pinLengthVh("loop", stageCounts.length) })}
          >
            <div className={styles.pin} data-pin-box>
              <InterviewScene
                rounds={bookRounds}
                head={
                  <Head
                    no="05"
                    label="The interview book"
                    id="loop-h"
                    size="sm"
                    sub="Pick a stage, then a round, to see what it is really testing, the wrong answer that loses the room, and a question you will get."
                  >
                    <Words text="From the first call to the offer, round by round." />
                  </Head>
                }
              />
            </div>
          </section>

          <section className={styles.section} id="faq" aria-labelledby="faq-h" data-scene>
            <div className={styles.pin} data-pin-box>
              <FaqScene
                faqs={faqs}
                languages={languages.runnable}
                head={
                  <Head
                    no="06"
                    label="FAQ"
                    id="faq-h"
                    size="lg"
                    sub="Everything people ask before opening their first chapter."
                  >
                    <Words text="Questions." />
                  </Head>
                }
              />
            </div>
          </section>

          <section className={styles.section} id="cta" aria-labelledby="cta-h" data-scene>
            <div className={styles.pin} data-pin-box>
              <CtaScene
                head={
                  <Head no="07" label="Start here" id="cta-h">
                    <Words text="Ten minutes from now, you could understand one thing properly." />
                  </Head>
                }
              />
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
                  G
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
                <Link key={t.id} href={t.href} prefetch={false}>
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
              <Link href="/privacy">Privacy</Link>
            </nav>
          </div>
        </footer>
      </div>
      <SiteDrawer open={menuOpen} onClose={closeMenu} />
    </>
  );
}
