"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { BookShell } from "@/app/interview/BookShell";
import { useScrollRegions } from "@/components/reader/scrollRegions";
import { confidence, CONFIDENCE_LABEL, useConfidence, type Confidence } from "@/lib/interviewConfidence";
import { useProgressValue } from "@/lib/hooks";
import { progress, store } from "@/lib/storage";
import { smoothScroll } from "@/lib/scrollFx";
import type { BookQuestion, BookRound } from "@/lib/interviewBook";
import styles from "../book.module.css";

type Mode = "read" | "practise";
const MODE_KEY = "groundwork:interview:mode";
const modeListeners = new Set<() => void>();

function readMode(): Mode {
  return store.get<Mode>(MODE_KEY, "read") === "practise" ? "practise" : "read";
}

function subscribeMode(fn: () => void) {
  modeListeners.add(fn);
  return () => {
    modeListeners.delete(fn);
  };
}

function setMode(m: Mode) {
  store.set(MODE_KEY, m);
  modeListeners.forEach((fn) => fn());
}

export interface RoundLink {
  id: string;
  code: string;
  navTitle: string;
}

const CONF: Confidence[] = ["knew", "shaky", "blank"];

function Html({ html, className }: { html: string; className?: string }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

function Prose({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollRegions(ref, html);
  return <div ref={ref} className={`interview-body ${styles.prose}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

function QuestionCard({
  q,
  code,
  mode,
  mark,
}: {
  q: BookQuestion;
  code: string;
  mode: Mode;
  mark: Confidence | undefined;
}) {
  const [shown, setShown] = useState(false);
  const hidden = mode === "practise" && !shown && !q.bulk;
  const card = useRef<HTMLElement>(null);
  useScrollRegions(card, hidden);
  const hasAnswer = q.a || q.code.length || q.say || q.trap || q.note || q.after;

  return (
    <article ref={card} className={styles.qCard} id={q.id} data-mark={mark} data-fx="up">
      <header className={styles.qHead}>
        <span className={styles.qNum}>
          {code}.{q.n}
        </span>
        <h2 className={styles.qTitle} dangerouslySetInnerHTML={{ __html: q.q }} />
      </header>

      {q.test && (
        <div className={styles.testBox}>
          <span className={styles.boxLabel}>What they are really testing</span>
          <Html html={q.test} />
        </div>
      )}

      {hasAnswer &&
        (hidden ? (
          <div className={styles.hiddenAnswer}>
            <p>Say your answer out loud first. Then check it.</p>
            <button type="button" className={styles.btn} onClick={() => setShown(true)}>
              Show the answer
            </button>
          </div>
        ) : (
          <div className={`interview-body ${styles.answer}`}>
            <div className="qbody">
              {q.a && <Html html={q.a} />}
              {q.code.map((b, i) => (
                <div key={i}>
                  {b.label && <div className="codelabel">{b.label}</div>}
                  <pre>
                    <code dangerouslySetInnerHTML={{ __html: b.code }} />
                  </pre>
                </div>
              ))}
              {q.say && (
                <div className={styles.sayBox}>
                  <span className={styles.boxLabel}>Say it like this</span>
                  <Html html={q.say} />
                </div>
              )}
              {q.trap && (
                <div className={styles.trapBox}>
                  <span className={styles.boxLabel}>The answer that loses the room</span>
                  <Html html={q.trap} />
                </div>
              )}
              {q.note && (
                <div className={styles.noteBox}>
                  <span className={styles.boxLabel}>2026 note</span>
                  <Html html={q.note} />
                </div>
              )}
              {q.after && <Html html={q.after} />}
            </div>
          </div>
        ))}

      {q.fu.length > 0 && (
        <div className={styles.fuBox}>
          <span className={styles.boxLabel}>They will push with</span>
          <ol>
            {q.fu.map((f) => (
              <li key={f} dangerouslySetInnerHTML={{ __html: f }} />
            ))}
          </ol>
        </div>
      )}

      {!q.bulk && (
        <div className={styles.confRow} role="group" aria-label={`How well did you know ${code}.${q.n}?`}>
          <span>How did you do?</span>
          {CONF.map((c) => (
            <button
              key={c}
              type="button"
              data-c={c}
              aria-pressed={mark === c}
              onClick={() => confidence.set(q.id, mark === c ? null : c)}
            >
              {CONFIDENCE_LABEL[c]}
            </button>
          ))}
        </div>
      )}
    </article>
  );
}

export function RoundView({
  round,
  partTitle,
  prev,
  next,
}: {
  round: BookRound;
  partTitle: string;
  prev: RoundLink | null;
  next: RoundLink | null;
}) {
  const mode = useSyncExternalStore(subscribeMode, readMode, () => "read" as Mode);
  const conf = useConfidence();
  const done = useProgressValue(() => progress.isChapterDone(round.id), false);
  const [active, setActive] = useState<string | null>(null);
  const questions = round.questions;
  const marked = questions.filter((q) => conf[q.id]).length;
  const real = questions.filter((q) => !q.bulk).length;

  useEffect(() => {
    const els = questions.map((q) => document.getElementById(q.id)).filter((e): e is HTMLElement => Boolean(e));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [questions]);

  function jump(id: string) {
    const el = document.getElementById(id);
    if (el) smoothScroll.to(el.getBoundingClientRect().top + window.scrollY - 90);
  }

  return (
    <BookShell scan={mode}>
      <nav className={styles.crumbs} aria-label="Breadcrumb">
        <Link href="/interview">Interview book</Link>
        <span aria-hidden="true">/</span>
        <span>{partTitle}</span>
      </nav>

      <header className={styles.roundHero} data-fx="stagger">
        <span className={styles.roundCode}>{round.code}</span>
        <h1 className={styles.roundTitle}>{round.title}</h1>
        {round.intro && <p className={styles.roundIntro} dangerouslySetInnerHTML={{ __html: round.intro }} />}
        {round.meta.length > 0 && (
          <dl className={styles.metaGrid}>
            {round.meta.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd dangerouslySetInnerHTML={{ __html: v }} />
              </div>
            ))}
          </dl>
        )}
        <div className={styles.roundBar}>
          {round.companies.length > 0 && (
            <span className={styles.companies}>
              {round.companies.map((c) => (
                <span key={c.name} data-hot={c.hot || undefined}>
                  {c.name}
                </span>
              ))}
            </span>
          )}
          <span className={styles.roundFacts}>
            {round.guide ? `${questions.length} sections` : `${real} questions · ${round.counts.followUps} follow-ups`}{" "}
            · {round.minutes} min read
          </span>
        </div>
      </header>

      <div className={styles.roundLayout}>
        <aside className={styles.rail} aria-label="In this round">
          <div className={styles.modeSwitch} role="group" aria-label="Mode">
            <button type="button" aria-pressed={mode === "read"} onClick={() => setMode("read")}>
              Read
            </button>
            <button type="button" aria-pressed={mode === "practise"} onClick={() => setMode("practise")}>
              Practise
            </button>
          </div>
          <p className={styles.modeNote}>
            {mode === "practise" ? "Answers stay hidden until you have said yours." : "Everything open, top to bottom."}
          </p>
          <ol className={styles.railList}>
            {questions.map((q) => (
              <li key={q.id}>
                <button
                  type="button"
                  aria-current={active === q.id ? "true" : undefined}
                  data-mark={conf[q.id]}
                  onClick={() => jump(q.id)}
                >
                  <span className={styles.railNum}>{q.n}</span>
                  <span className={styles.railText} dangerouslySetInnerHTML={{ __html: q.q }} />
                </button>
              </li>
            ))}
          </ol>
          {!round.guide && (
            <p className={styles.railStat}>
              {marked} of {real} marked
            </p>
          )}
          {round.mockStage && (
            <Link href="/mock" className={styles.mockLink} prefetch={false}>
              Practise this round as a mock →
            </Link>
          )}
        </aside>

        <div className={styles.roundBody}>
          {round.pre && <Prose html={round.pre} />}
          {questions.map((q) => (
            <QuestionCard key={q.id} q={q} code={round.code} mode={mode} mark={conf[q.id]} />
          ))}
          {round.post && <Prose html={round.post} />}

          <div className={styles.doneRow} data-fx="up">
            <label className={styles.doneCheck}>
              <input
                type="checkbox"
                checked={done}
                onChange={(e) => progress.setChapterDone(round.id, e.target.checked)}
              />
              I have read this round
            </label>
            {marked > 0 && (
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => confidence.clear(questions.map((q) => q.id))}
              >
                Clear my marks
              </button>
            )}
          </div>

          <nav className={styles.pager} aria-label="Rounds">
            {prev ? (
              <Link href={`/interview/${prev.id}`} className={styles.pageCard}>
                <span>← Previous</span>
                <b>
                  {prev.code} · {prev.navTitle}
                </b>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link href={`/interview/${next.id}`} className={`${styles.pageCard} ${styles.pageNext}`}>
                <span>Next →</span>
                <b>
                  {next.code} · {next.navTitle}
                </b>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </BookShell>
  );
}
