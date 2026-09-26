"use client";

import { useRef, useState } from "react";
import { STAGE_GUIDE } from "@/lib/mock/guide";
import { personaFor } from "@/lib/mock/persona";
import { rubricFor, VERDICT_LABEL, type Verdict } from "@/lib/mock/scoring";
import { RETIRE_AT, RETRY_BELOW } from "@/lib/mock/storage";
import type { LoopConfig, StageId, StageInfo, TalkItem } from "@/lib/mock/types";
import styles from "./guide.module.css";

const CRITERIA = rubricFor({ testing: "-", trap: "-", say: "-" } as TalkItem, true);
const TOTAL_WEIGHT = CRITERIA.reduce((n, c) => n + c.weight, 0);

const BANDS: { verdict: Verdict; from: number; to: number; tone: string }[] = [
  { verdict: "no-hire", from: 0, to: 45, tone: "red" },
  { verdict: "lean-no", from: 45, to: 65, tone: "orange" },
  { verdict: "hire", from: 65, to: 80, tone: "green" },
  { verdict: "strong-hire", from: 80, to: 100, tone: "teal" },
];

const LOOP_RULES = [
  {
    title: "Core rounds count double",
    body: "Coding and behaviour are always core, plus the rounds your role lives on: the frontend rounds for frontend, backend for backend, design for seniors. They carry twice the weight in the average.",
  },
  {
    title: "A no-hire in a core round sinks it",
    body: "However well the other rounds went, a clear no in a core round is rarely overruled in the debrief.",
  },
  {
    title: "Two lean-nos read as a no",
    body: "One weak round can be argued away. Two, and the loop is a lean-no unless someone in the room fights for you.",
  },
  {
    title: "Design decides the level",
    body: "Pass everything but come in under the bar on design, and the offer lands a level down. Strong-hire every round and there is a case for a level up.",
  },
];

const SAMPLE_ROUNDS: [string, number][] = [
  ["Screening call", 86],
  ["Coding", 72],
  ["JavaScript & TypeScript", 81],
  ["React & the frontend", 64],
  ["System design", 69],
  ["Behavioural", 77],
];

function bandOf(score: number) {
  return BANDS.find((b) => score >= b.from && score < b.to) ?? BANDS[BANDS.length - 1];
}

function tone(name: string): React.CSSProperties {
  return { "--tone": `var(--c-${name})` } as React.CSSProperties;
}

export function RoundsDecoded({
  stages,
  config,
  onPractise,
}: {
  stages: StageInfo[];
  config: LoopConfig;
  onPractise: (stage: StageId) => void;
}) {
  const [active, setActive] = useState<StageId>(stages[0]?.id ?? "screening");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const s = stages.find((x) => x.id === active) ?? stages[0];
  if (!s) return null;
  const guide = STAGE_GUIDE[s.id];
  const who = personaFor(s.id, config);

  function onKey(e: React.KeyboardEvent, i: number) {
    const step =
      e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (i + step + stages.length) % stages.length;
    setActive(stages[next].id);
    tabs.current[next]?.focus();
  }

  return (
    <section className={styles.block} id="rounds" aria-labelledby="rounds-h">
      <div className={styles.head} data-fx="stagger">
        <p className={styles.eyebrow}>Know the room</p>
        <h2 id="rounds-h" className={styles.title}>
          Every round, decoded.
        </h2>
        <p className={styles.sub}>
          Who sits across the table, what they are actually deciding, the shape of an answer that passes and what gets
          marked down. Read it before you walk in.
        </p>
      </div>
      <div className={styles.decoder} data-fx="up">
        <div className={styles.roundList} role="tablist" aria-label="Rounds" aria-orientation="vertical">
          {stages.map((x, i) => (
            <button
              key={x.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`round-tab-${x.id}`}
              aria-selected={x.id === s.id}
              aria-controls="round-panel"
              tabIndex={x.id === s.id ? 0 : -1}
              className={styles.roundTab}
              onClick={() => setActive(x.id)}
              onKeyDown={(e) => onKey(e, i)}
            >
              <span className={styles.roundCode}>{x.code || String(i + 1).padStart(2, "0")}</span>
              <span className={styles.roundName}>{x.title}</span>
              <span className={styles.roundKind} data-kind={x.kind}>
                {x.kind === "coding" ? "code" : "talk"}
              </span>
            </button>
          ))}
        </div>
        <article
          className={styles.roundPanel}
          role="tabpanel"
          id="round-panel"
          aria-labelledby={`round-tab-${s.id}`}
          key={s.id}
        >
          <header className={styles.panelTop}>
            <span className={styles.avatar} data-tone={who.tone} aria-hidden="true">
              {who.initials}
            </span>
            <div>
              <p className={styles.panelWho}>
                {who.name} · {who.role}
              </p>
              <h3 className={styles.panelTitle}>{s.title}</h3>
            </div>
            <span className={styles.panelCount}>{s.available} questions</span>
          </header>
          <p className={styles.pitch}>{guide.pitch}</p>
          <dl className={styles.facts}>
            {s.who && (
              <div>
                <dt>Across the table</dt>
                <dd>{s.who}</dd>
              </div>
            )}
            {s.decides && (
              <div>
                <dt>What they decide</dt>
                <dd>{s.decides}</dd>
              </div>
            )}
          </dl>
          <p className={styles.label}>The shape of an answer that passes</p>
          <ol className={styles.shape}>
            {guide.shape.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <div className={styles.twoCol}>
            <div>
              <p className={styles.label}>Do this</p>
              <ul className={styles.tips}>
                {guide.tips.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className={styles.label}>Marked down for</p>
              <ul className={styles.marked}>
                {guide.markedDown.map((t) => (
                  <li key={t}>{t}</li>
                ))}
                {s.failMode && <li>{s.failMode}</li>}
              </ul>
            </div>
          </div>
          <button type="button" className={styles.practise} onClick={() => onPractise(s.id)}>
            Practise {s.title} <span aria-hidden="true">→</span>
          </button>
        </article>
      </div>
    </section>
  );
}

export function HowScored() {
  return (
    <section className={styles.block} id="scoring" aria-labelledby="scoring-h">
      <div className={styles.head} data-fx="stagger">
        <p className={styles.eyebrow}>How you are scored</p>
        <h2 id="scoring-h" className={styles.title}>
          The rubric is the same one the room uses.
        </h2>
        <p className={styles.sub}>
          After each spoken answer you mark yourself against the model answer on five things. Coding rounds are marked
          by the tests, less a little for every hint you open.
        </p>
      </div>
      <div className={styles.rubric} data-fx="stagger">
        {CRITERIA.map((c, i) => (
          <div key={c.id} className={styles.criterion}>
            <span className={styles.critNum}>{String(i + 1).padStart(2, "0")}</span>
            <div>
              <b>{c.label}</b>
              <p>{c.hint}</p>
            </div>
            <span className={styles.weight}>
              <span className={styles.weightBar}>
                <span style={{ width: `${(c.weight / 3) * 100}%` }} />
              </span>
              {Math.round((c.weight / TOTAL_WEIGHT) * 100)}%
            </span>
          </div>
        ))}
      </div>
      <div className={styles.scale} data-fx="up" aria-label="Score to verdict">
        {BANDS.map((b) => (
          <div key={b.verdict} className={styles.band} style={{ ...tone(b.tone), flexGrow: b.to - b.from }}>
            <b>{VERDICT_LABEL[b.verdict]}</b>
            <span>
              {b.from}
              {b.to === 100 ? "%+" : `–${b.to - 1}%`}
            </span>
          </div>
        ))}
      </div>
      <p className={styles.label}>Then the committee decides the loop</p>
      <div className={styles.rules} data-fx="stagger">
        {LOOP_RULES.map((r) => (
          <div key={r.title} className={styles.rule}>
            <b>{r.title}</b>
            <p>{r.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SampleDebrief() {
  return (
    <section className={styles.block} id="debrief" aria-labelledby="debrief-h">
      <div className={styles.split}>
        <div className={styles.head} data-fx="stagger">
          <p className={styles.eyebrow}>What you leave with</p>
          <h2 id="debrief-h" className={styles.title}>
            A debrief, not just a score.
          </h2>
          <p className={styles.sub}>
            Every loop ends the way a real one does: a verdict, the level it would land at, the reasons a committee
            would give, and exactly what to study next. Weak answers go on a retry list until you nail them.
          </p>
          <ul className={styles.checks}>
            <li>A verdict per round and for the loop</li>
            <li>The level call, below, at or above what you asked for</li>
            <li>Chapters to read next, picked from your weakest skill</li>
            <li>Your trend across every loop you have run</li>
          </ul>
        </div>
        <figure className={styles.sheet} data-fx="right" aria-label="A sample debrief">
          <span className={styles.sampleTag}>Sample</span>
          <p className={styles.sheetKicker}>Full-stack · mid-level · product company</p>
          <p className={styles.verdict}>
            Hire<span>, at mid-level</span>
          </p>
          <ul className={styles.bars}>
            {SAMPLE_ROUNDS.map(([name, score], i) => {
              const b = bandOf(score);
              return (
                <li key={name} style={{ ...tone(b.tone), "--i": i } as React.CSSProperties}>
                  <span>{name}</span>
                  <span className={styles.bar}>
                    <span style={{ width: `${score}%` }} />
                  </span>
                  <b>{score}%</b>
                </li>
              );
            })}
          </ul>
          <div className={styles.reasons}>
            <p>
              <b>Strongest round:</b> Screening call (86%). <b>Weakest:</b> React &amp; the frontend (64%).
            </p>
            <p>
              <b>Next:</b> re-read <em>Why React re-renders</em> and <em>Effects in depth</em>, then retry the four
              answers under 60%.
            </p>
          </div>
        </figure>
      </div>
    </section>
  );
}

export function MockFaq() {
  const faqs = [
    {
      q: "Do I need a microphone?",
      a: "No. Nothing is recorded. You answer out loud to yourself, as you would in the room, and can jot the skeleton in the notes box. Saying it out loud is the practice.",
    },
    {
      q: "Who marks my answers?",
      a: "You do, against the model answer and the five-point rubric, right after you answer. Coding and machine coding rounds are marked by real tests running in your browser.",
    },
    {
      q: "How long does a loop take?",
      a: "Pick Quick, Standard or Full. The planner shows every round and the total time before you start, and a single round takes about as long as one real one.",
    },
    {
      q: "Can I stop half-way?",
      a: "Yes. The interview saves as you go. Come back later and walk straight back in to the question you left on, or throw it away and start fresh.",
    },
    {
      q: "What happens to weak answers?",
      a: `Anything you score under ${Math.round(RETRY_BELOW * 100)}% lands on your retry list. Score ${Math.round(RETIRE_AT * 100)}% or better on it later and it comes off.`,
    },
    {
      q: "Is any of this sent anywhere?",
      a: "No. Your loops, scores and notes stay in this browser. There is no account and nothing to sign up for.",
    },
  ];
  return (
    <section className={styles.block} id="faq" aria-labelledby="mock-faq-h">
      <div className={styles.faqGrid}>
        <div className={styles.head} data-fx="stagger">
          <p className={styles.eyebrow}>Before you walk in</p>
          <h2 id="mock-faq-h" className={styles.title}>
            Questions people ask first.
          </h2>
        </div>
        <div className={styles.faq} data-fx="stagger">
          {faqs.map((f) => (
            <details key={f.q} className={styles.faqItem}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
