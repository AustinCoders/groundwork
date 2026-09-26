"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { SiteDrawer } from "@/components/SiteDrawer";
import { TopIcon } from "@/components/practice/TopIcon";
import { formatSpan, plural } from "@/lib/format";
import { SITE_NAME } from "@/lib/site";
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

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" style={{ margin: 0 }}>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HeroArt({ interview }: { interview: HomeViewProps["interview"] }) {
  return (
    <div className={styles.art} aria-hidden="true">
      <div className={`${styles.paper} ${styles.paperNote}`}>
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
          <li className={styles.testsSum}>3 / 3 tests passed</li>
        </ul>
      </div>
      <div className={`${styles.paper} ${styles.paperRound}`}>
        <span className={styles.paperKicker}>Round 2 of {interview.rounds} · Machine coding</span>
        <p className={styles.paperQ}>“Now make it work with two browser tabs open.”</p>
        <span className={styles.followUp}>the follow-up they push with next →</span>
      </div>
    </div>
  );
}

export function HomeView({ stats, ready, soon, problems, languages, interview }: HomeViewProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const hours = Math.round(stats.minutes / 60);

  const reasons = [
    {
      icon: "M4 20h16M6 16h12M8 12h8M10 8h4M12 4v0",
      title: "Nothing is used before it is explained",
      body: "Every topic is layered bottom to top. You never hit a word the page has not taught you yet, so you stop skimming and start understanding.",
    },
    {
      icon: "M8 9l-4 3 4 3M16 9l4 3-4 3M13.5 6l-3 12",
      title: "Read it, then run it, right here",
      body: `${problems} exercises graded by real tests, in an editor that knows ${languages.total} languages and runs ${languages.runnable} of them inside your browser. No install, no server, no waiting.`,
    },
    {
      icon: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 16a4 4 0 100-8 4 4 0 000 8zM12 12h.01",
      title: "Every interview round, in order",
      body: `${interview.rounds} rounds from the screening call to the offer number, with ${interview.questions}+ questions, what each round is really testing, and the follow-up that comes next.`,
    },
    {
      icon: "M12 7v5l3 2M12 21a9 9 0 110-18 9 9 0 010 18z",
      title: "Rehearse the whole loop",
      body: "A mock interview for your role and level: a timer, coding graded by tests, follow-up questions, a rubric and a hiring-committee style debrief.",
    },
    {
      icon: "M3 5h18v12H3zM8 21h8M12 17v4M7 9h4M7 13h7",
      title: "Think out loud on a whiteboard",
      body: "Shapes, arrows that stay attached, sticky notes and system design templates, for the rounds where you draw instead of type.",
    },
    {
      icon: "M4 12a8 8 0 0113.7-5.6L20 9M20 4v5h-5M20 12a8 8 0 01-13.7 5.6L4 15M4 20v-5h5",
      title: "Remember what you read",
      body: "Chapters come back for review before you forget them, and your streak, XP and progress keep you honest about how much you actually did.",
    },
  ];

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
      q: `Which languages can I run?`,
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
      <div className={styles.page}>
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
              <a href="#who">Who it is for</a>
              <a href="#shelf">Topics</a>
              <a href="#faq">FAQ</a>
            </nav>
            <Link href="/level/js" className={`${styles.btn} ${styles.btnSmall}`}>
              Start reading
            </Link>
          </div>
        </header>

        <main id="main">
          <section className={styles.hero}>
            <div className={styles.heroCopy}>
              <p className={styles.kicker}>
                <span className={styles.dot} aria-hidden="true" /> Free · no sign-up · {stats.writtenChapters} chapters
                written
              </p>
              <h1 className={styles.h1}>
                Understand JavaScript properly. <span className={styles.hl}>Walk into the interview ready.</span>
              </h1>
              <p className={styles.lead}>
                {SITE_NAME} is a study site for developers who want the real understanding, not the cheat sheet. Notes
                that never use a word before explaining it, exercises you run and grade right in the page, and an
                interview book that walks every round, from the screening call to the offer number.
              </p>
              <div className={styles.actions}>
                <Link href="/level/js" className={`${styles.btn} ${styles.btnBig}`}>
                  Start with JavaScript <span aria-hidden="true">→</span>
                </Link>
                <Link href="/interview" className={`${styles.btn} ${styles.btnGhost} ${styles.btnBig}`}>
                  Prepare for an interview
                </Link>
              </div>
              <dl className={styles.stats}>
                <div>
                  <dt>chapters</dt>
                  <dd>{stats.writtenChapters}</dd>
                </div>
                <div>
                  <dt>runnable exercises</dt>
                  <dd>{stats.exercises}</dd>
                </div>
                <div>
                  <dt>hours of reading</dt>
                  <dd>{hours}</dd>
                </div>
                <div>
                  <dt>interview questions</dt>
                  <dd>{interview.questions}+</dd>
                </div>
              </dl>
            </div>
            <HeroArt interview={interview} />
          </section>

          <section className={styles.section} id="why" aria-labelledby="why-h">
            <p className={styles.eyebrow}>Why come here</p>
            <h2 id="why-h" className={styles.h2}>
              Most prep is either too shallow or too scattered.
            </h2>
            <p className={styles.sub}>
              Tutorials skip the why, problem sites skip the theory, and docs assume you already know. {SITE_NAME} puts
              the explanation, the practice and the interview in one place, in the right order.
            </p>
            <div className={styles.reasons}>
              {reasons.map((r) => (
                <article key={r.title} className={styles.reason}>
                  <span className={styles.reasonIcon}>
                    <Icon d={r.icon} />
                  </span>
                  <h3>{r.title}</h3>
                  <p>{r.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.section} id="who" aria-labelledby="who-h">
            <p className={styles.eyebrow}>Who it is for</p>
            <h2 id="who-h" className={styles.h2}>
              Wherever you are, there is a path that starts there.
            </h2>
            <div className={styles.personas}>
              {PERSONAS.map((p) => (
                <article key={p.tag} className={styles.persona} style={accent(p.tone)}>
                  <span className={styles.tag}>{p.tag}</span>
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
            <p className={styles.eyebrow}>How it works</p>
            <h2 id="how-h" className={styles.h2}>
              Three steps, then just keep going.
            </h2>
            <ol className={styles.steps}>
              <li>
                <span className={styles.stepNum}>1</span>
                <h3>Pick a topic</h3>
                <p>
                  {ready.length} are fully written today. The rest show exactly what is planned, chapter by chapter.
                </p>
              </li>
              <li>
                <span className={styles.stepNum}>2</span>
                <h3>Say where you are</h3>
                <p>Beginner, intermediate or advanced. It only changes where the path starts, never what it skips.</p>
              </li>
              <li>
                <span className={styles.stepNum}>3</span>
                <h3>Read, then run it</h3>
                <p>Each chapter that needs practice ends in an editor with real tests. Pass them and it counts.</p>
              </li>
            </ol>
          </section>

          <section className={styles.section} id="shelf" aria-labelledby="shelf-h">
            <p className={styles.eyebrow}>On the shelf</p>
            <h2 id="shelf-h" className={styles.h2}>
              Ready to read today.
            </h2>
            <div className={styles.shelf}>
              {ready.map((t) => (
                <Link key={t.id} href={t.href} className={styles.book} style={accent(t.accent)}>
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
              <Link href="/interview" className={styles.book} style={accent("red")}>
                <span className={styles.bookMark} aria-hidden="true">
                  ◎
                </span>
                <span className={styles.bookName}>Interview book</span>
                <span className={styles.bookTag}>
                  Every round, every question, the answer. Not a ladder to climb: a loop to walk into prepared.
                </span>
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
              <>
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
              </>
            )}
          </section>

          <section className={styles.section} aria-labelledby="tools-h">
            <p className={styles.eyebrow}>Practice tools</p>
            <h2 id="tools-h" className={styles.h2}>
              Reading is half of it.
            </h2>
            <div className={styles.tools}>
              <Link href="/problems" className={styles.tool} style={accent("purple")}>
                <Icon d="M8 9l-4 3 4 3M16 9l4 3-4 3" />
                <strong>Problems</strong>
                <span>{problems} problems grouped by the pattern each one teaches.</span>
              </Link>
              <Link href="/practice?id=free" className={styles.tool} style={accent("blue")} prefetch={false}>
                <Icon d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4" />
                <strong>Playground</strong>
                <span>A full editor with a debugger. Try anything in {languages.runnable} languages.</span>
              </Link>
              <Link href="/mock" className={styles.tool} style={accent("orange")}>
                <Icon d="M12 7v5l3 2M12 21a9 9 0 110-18 9 9 0 010 18z" />
                <strong>Mock interview</strong>
                <span>A timed loop for your role and level, with a debrief at the end.</span>
              </Link>
              <Link href="/whiteboard" className={styles.tool} style={accent("teal")}>
                <Icon d="M3 5h18v12H3zM8 21h8M12 17v4" />
                <strong>Whiteboard</strong>
                <span>Sketch a system design with templates and arrows that stay stuck.</span>
              </Link>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="vs-h">
            <p className={styles.eyebrow}>Why not just…</p>
            <h2 id="vs-h" className={styles.h2}>
              What you already tried, and what is different here.
            </h2>
            <div className={styles.compare}>
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
            <p className={styles.eyebrow}>Questions</p>
            <h2 id="faq-h" className={styles.h2}>
              Before you start.
            </h2>
            <div className={styles.faq}>
              {faqs.map((f) => (
                <details key={f.q} className={styles.faqItem}>
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

          <section className={styles.cta} aria-labelledby="cta-h">
            <h2 id="cta-h">Ten minutes from now, you could understand one thing properly.</h2>
            <p>Open a chapter. No account, no card, no catch.</p>
            <div className={styles.actions}>
              <Link href="/level/js" className={`${styles.btn} ${styles.btnBig}`}>
                Start with JavaScript <span aria-hidden="true">→</span>
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
