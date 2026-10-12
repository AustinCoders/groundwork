"use client";

import { useRef, useState } from "react";
import { Band } from "@/components/topic/TopicKit";
import { STAGE_GUIDE } from "@/lib/mock/guide";
import { personaFor } from "@/lib/mock/persona";
import { rubricFor, VERDICT_LABEL, type Verdict } from "@/lib/mock/scoring";
import { RETIRE_AT, RETRY_BELOW } from "@/lib/mock/storage";
import type { LoopConfig, StageId, StageInfo, TalkItem } from "@/lib/mock/types";
import kit from "./mockKit.module.css";
import styles from "./guide.module.css";

const CRITERIA = rubricFor({ testing: "-", trap: "-", say: "-" } as TalkItem, true);
const TOTAL_WEIGHT = CRITERIA.reduce((n, c) => n + c.weight, 0);

const BANDS: { verdict: Verdict; from: number; to: number }[] = [
  { verdict: "no-hire", from: 0, to: 45 },
  { verdict: "lean-no", from: 45, to: 65 },
  { verdict: "hire", from: 65, to: 80 },
  { verdict: "strong-hire", from: 80, to: 100 },
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

export function RoundsDecoded({
  no,
  stages,
  config,
  onPractise,
}: {
  no: string;
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
    <Band
      no={no}
      id="rounds-h"
      sectionId="rounds"
      label="Know the room"
      title="Every round, decoded."
      sub="Who sits across the table, what they are actually deciding, the shape of an answer that passes and what gets marked down. Read it before you walk in."
    >
      <div className={styles.decoder}>
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
              <span className={kit.kindTag} data-kind={x.kind}>
                {x.kind === "coding" ? "code" : "talk"}
              </span>
            </button>
          ))}
        </div>
        <article
          className={`${kit.paper} ${styles.roundPanel}`}
          role="tabpanel"
          id="round-panel"
          aria-labelledby={`round-tab-${s.id}`}
          key={s.id}
        >
          <span className={kit.tape} aria-hidden="true" />
          <header className={styles.panelTop}>
            <span className={kit.avatar} data-tone={who.tone} aria-hidden="true">
              {who.initials}
            </span>
            <div className={styles.panelHead}>
              <p className={styles.panelWho}>
                {who.name} · {who.role}
              </p>
              <h3 className={styles.panelTitle}>{s.title}</h3>
            </div>
            <span className={styles.panelCount}>{s.available} questions</span>
          </header>
          <p className={styles.pitch}>
            <span className={kit.highlight}>{guide.pitch}</span>
          </p>
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
          <p className={kit.label}>The shape of an answer that passes</p>
          <ol className={styles.shape}>
            {guide.shape.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <div className={styles.twoCol}>
            <div className={kit.sticky} data-tone="mint">
              <p className={kit.label}>Do this</p>
              <ul className={styles.tips}>
                {guide.tips.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div className={kit.sticky} data-tone="rose">
              <p className={kit.label}>Marked down for</p>
              <ul className={`${styles.tips} ${styles.marked}`}>
                {guide.markedDown.map((t) => (
                  <li key={t}>{t}</li>
                ))}
                {s.failMode && <li>{s.failMode}</li>}
              </ul>
            </div>
          </div>
          <button type="button" className={`${kit.btn} ${styles.practise}`} onClick={() => onPractise(s.id)}>
            Practise {s.title} <span aria-hidden="true">→</span>
          </button>
        </article>
      </div>
    </Band>
  );
}

export function HowScored({ no }: { no: string }) {
  return (
    <Band
      no={no}
      id="scoring-h"
      sectionId="scoring"
      label="How you are scored"
      title="The rubric is the same one the room uses."
      sub="After each spoken answer you mark yourself against the model answer on five things. Coding rounds are marked by the tests, less a little for every hint you open."
    >
      <ol className={styles.rubric}>
        {CRITERIA.map((c, i) => (
          <li key={c.id} className={styles.criterion}>
            <span className={styles.critNum} aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className={styles.critText}>
              <b>{c.label}</b>
              <p>{c.hint}</p>
            </div>
            <span className={styles.weight}>
              <span className={styles.weightBar} aria-hidden="true">
                <span style={{ width: `${(c.weight / 3) * 100}%` }} />
              </span>
              {Math.round((c.weight / TOTAL_WEIGHT) * 100)}%
            </span>
          </li>
        ))}
      </ol>
      <h3 className={styles.subHead}>From score to verdict</h3>
      <div className={styles.scale} aria-label="Score to verdict">
        {BANDS.map((b) => (
          <div key={b.verdict} className={styles.band} data-verdict={b.verdict} style={{ flexGrow: b.to - b.from }}>
            <b>{VERDICT_LABEL[b.verdict]}</b>
            <span>
              {b.from}
              {b.to === 100 ? "%+" : `–${b.to - 1}%`}
            </span>
          </div>
        ))}
      </div>
      <h3 className={styles.subHead}>Then the committee decides the loop</h3>
      <div className={styles.rules}>
        {LOOP_RULES.map((r, i) => (
          <div
            key={r.title}
            className={`${kit.sticky} ${styles.rule}`}
            style={{ "--tilt": `${[-1, 0.8, -0.6, 1][i % 4]}deg` } as React.CSSProperties}
          >
            <span className={kit.tape} aria-hidden="true" />
            <b>{r.title}</b>
            <p>{r.body}</p>
          </div>
        ))}
      </div>
    </Band>
  );
}

export function SampleDebrief({ no }: { no: string }) {
  return (
    <Band no={no} id="debrief-h" sectionId="debrief" label="What you leave with" title="A debrief, not just a score.">
      <div className={styles.split}>
        <div className={styles.splitCopy}>
          <p className={styles.lead}>
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
        <figure className={`${kit.paper} ${styles.sheet}`} aria-label="A sample debrief">
          <span className={kit.tape} aria-hidden="true" />
          <span className={styles.sampleTag}>Sample</span>
          <p className={kit.label}>Full-stack · mid-level · product company</p>
          <p className={styles.verdict}>
            Hire<span>, at mid-level</span>
          </p>
          <ul className={styles.bars}>
            {SAMPLE_ROUNDS.map(([name, score]) => (
              <li key={name} data-verdict={bandOf(score).verdict}>
                <span>{name}</span>
                <span className={styles.bar}>
                  <span style={{ width: `${score}%` }} />
                </span>
                <b>{score}%</b>
              </li>
            ))}
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
    </Band>
  );
}

const FAQS = [
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

export function MockFaq({ no }: { no: string }) {
  return (
    <Band no={no} id="mock-faq-h" sectionId="faq" label="Before you walk in" title="Questions people ask first.">
      <div className={styles.faq}>
        {FAQS.map((f) => (
          <details key={f.q} className={styles.faqItem}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </Band>
  );
}
