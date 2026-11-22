"use client";

import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { Card, Compose, Remark, Tag } from "@/components/topic/Compose";
import { CardKicker } from "@/components/topic/TopicKit";
import { openAuth } from "@/lib/account/config";
import styles from "./gate.module.css";
import { useCountUp } from "./useCountUp";

export type HeroFeature = "progress" | "review" | "account";

interface HeroCopy {
  kicker: string;
  title: string;
  accent: string;
  body: string;
  perks: string[];
}

const COPY: Record<HeroFeature, HeroCopy> = {
  progress: {
    kicker: "Progress",
    title: "Your progress,",
    accent: "on every device.",
    body: "Your streak, XP, badges and reading calendar live in your account, so they follow you from the laptop to the phone.",
    perks: [
      "A streak and XP that keep counting wherever you read",
      "A calendar of every day you studied",
      "Badges for chapters, exercises and mock interviews",
    ],
  },
  review: {
    kicker: "Review",
    title: "Remember it",
    accent: "next month too.",
    body: "Spaced review needs to remember what you read and when. Sign in and the queue picks up from every device.",
    perks: [
      "Chapters come back just before you would forget them",
      "One queue across your laptop and your phone",
      "Say how well you recalled it and the gaps adjust",
    ],
  },
  account: {
    kicker: "Account",
    title: "One account,",
    accent: "every device.",
    body: "Change your name and goals, check sync, connect Google or GitHub, turn on two-step sign-in, or download your data.",
    perks: [
      "Profile, goal and level in one place",
      "Sync status, data download and erase",
      "Two-step sign-in and connected logins",
    ],
  },
};

const DAYS = 35;
const WEEK = [0.45, 0.7, 0.3, 0.9, 0.6, 1, 0.5];
const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
const STARTING_DAYS = [1, 2, 3, 5, 8, 9, 10, 11, 15, 16, 17, 18, 19, 22, 23, 24, 25, 26, 29, 30, 31, 32, 33];

function ProgressStage() {
  const [days, setDays] = useState<Set<number>>(() => new Set(STARTING_DAYS));
  const xp = useCountUp(1240 + days.size * 10);
  const streak = useCountUp(5);
  return (
    <Compose layout="trio">
      <Card at="a" tilt={-1} taped>
        <CardKicker>Reading calendar · tap a day</CardKicker>
        <div className={styles.calendar} role="group" aria-label="A sample reading calendar">
          {Array.from({ length: DAYS }, (_, day) => {
            const on = days.has(day);
            return (
              <button
                key={day}
                type="button"
                className={styles.day}
                data-on={on || undefined}
                aria-pressed={on}
                aria-label={`Day ${day + 1}`}
                style={{ "--i": day } as CSSProperties}
                onClick={() =>
                  setDays((now) => {
                    const next = new Set(now);
                    if (next.has(day)) next.delete(day);
                    else next.add(day);
                    return next;
                  })
                }
              />
            );
          })}
        </div>
        <p className={styles.cardFoot}>{days.size} days this month</p>
      </Card>
      <Card at="b" tilt={1}>
        <Tag tone="success" corner="top">
          🔥 {streak}-day streak
        </Tag>
        <CardKicker>Level 4 · Explorer</CardKicker>
        <p className={styles.bigNumber}>
          {xp.toLocaleString()} <small>XP</small>
        </p>
        <span className={styles.bar} aria-hidden="true">
          <span className={styles.barFill} />
        </span>
        <p className={styles.cardFoot}>260 XP to level 5</p>
        <ul className={styles.badges} aria-label="Badges">
          {["📘", "⚡", "🧠", "🎯"].map((badge, i) => (
            <li key={badge} style={{ "--i": i } as CSSProperties}>
              {badge}
            </li>
          ))}
        </ul>
        <p className={styles.subKicker}>This week</p>
        <div className={styles.week} aria-hidden="true">
          {WEEK.map((minutes, i) => (
            <span key={i} style={{ "--h": minutes, "--i": i } as CSSProperties}>
              <i />
              <b>{WEEKDAYS[i]}</b>
            </span>
          ))}
        </div>
      </Card>
      <Card at="c" tone="note" tilt={-1}>
        <CardKicker>Up next</CardKicker>
        <p className={styles.cardText}>Closures · B13, then the event loop.</p>
        <Remark>picks up where you stopped</Remark>
      </Card>
    </Compose>
  );
}

const REVIEW = [
  {
    id: "closure",
    title: "Closures",
    due: "due today",
    q: "What does a closure keep alive?",
    a: "The variables of the scope it was made in.",
  },
  {
    id: "loop",
    title: "Event loop",
    due: "in 2 days",
    q: "Which runs first: a promise or a timeout?",
    a: "The promise: microtasks run before the next task.",
  },
  {
    id: "keys",
    title: "React keys",
    due: "in 5 days",
    q: "Why not use the index as a key?",
    a: "Reordering keeps the wrong state on the wrong row.",
  },
];

function ReviewStage() {
  const [flipped, setFlipped] = useState<string | null>(null);
  return (
    <Compose layout="trio">
      <Card at="a" tilt={-1} taped>
        <Tag tone="success" corner="top">
          ↻ 3 due
        </Tag>
        <CardKicker>Your review queue · tap a card</CardKicker>
        <ul className={styles.queue}>
          {REVIEW.map((item, i) => (
            <li key={item.id} style={{ "--i": i } as CSSProperties}>
              <button
                type="button"
                className={styles.flip}
                data-flipped={flipped === item.id || undefined}
                aria-pressed={flipped === item.id}
                onClick={() => setFlipped((now) => (now === item.id ? null : item.id))}
              >
                <span className={styles.flipFront}>
                  <strong>{item.title}</strong>
                  <span>{item.q}</span>
                  <em>{item.due}</em>
                </span>
                <span className={styles.flipBack}>
                  <strong>Answer</strong>
                  <span>{item.a}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Card>
      <Card at="b" tilt={1}>
        <CardKicker>How well did you recall it?</CardKicker>
        <div className={styles.grades}>
          {["Again", "Hard", "Good", "Easy"].map((grade, i) => (
            <span key={grade} className={styles.grade} data-i={i}>
              {grade}
            </span>
          ))}
        </div>
        <p className={styles.cardFoot}>Easy pushes it further out. Again brings it back tomorrow.</p>
        <p className={styles.subKicker}>Coming up</p>
        <ul className={styles.rows}>
          {[
            ["Tomorrow", "2 chapters"],
            ["Thursday", "4 chapters"],
            ["Next week", "9 chapters"],
          ].map(([when, what], i) => (
            <li key={when} style={{ "--i": i } as CSSProperties}>
              <span>{when}</span>
              <b>{what}</b>
            </li>
          ))}
        </ul>
      </Card>
      <Card at="c" tone="note" tilt={-1}>
        <CardKicker>The curve</CardKicker>
        <svg className={styles.curve} viewBox="0 0 220 80" aria-hidden="true">
          <path d="M6 10 C 40 60, 70 66, 110 70 S 190 74, 214 74" />
          <path
            className={styles.curveBoost}
            d="M6 10 C 30 30, 50 34, 70 34 L 72 14 C 100 24, 120 26, 140 26 L 142 12 C 170 18, 190 20, 214 20"
          />
        </svg>
        <Remark>each review flattens it</Remark>
      </Card>
    </Compose>
  );
}

function AccountStage() {
  return (
    <Compose layout="trio">
      <Card at="a" tilt={-1} taped>
        <CardKicker>Your account</CardKicker>
        <div className={styles.profile}>
          <span className={styles.avatar} aria-hidden="true">
            AL
          </span>
          <span>
            <strong>Ada Lovelace</strong>
            <span>Preparing for interviews · Intermediate</span>
          </span>
        </div>
        <ul className={styles.ticks}>
          <li>Google connected</li>
          <li>Two-step sign-in on</li>
          <li>Synced just now</li>
        </ul>
      </Card>
      <Card at="b" tilt={1}>
        <Tag tone="success" corner="top">
          ● in sync
        </Tag>
        <CardKicker>Laptop and phone</CardKicker>
        <svg viewBox="0 0 220 110" className={styles.devices} aria-hidden="true">
          <rect x="10" y="18" width="92" height="60" rx="6" />
          <path d="M2 86h108" />
          <path d="M22 34h50M22 46h66M22 58h40" />
          <rect x="160" y="22" width="44" height="72" rx="8" />
          <path d="M172 40h20M172 52h16M172 64h20" />
          <path className={styles.flow} d="M112 38c14-12 30-12 42-2" />
          <path className={styles.flow} d="M154 72c-14 12-30 12-42 2" />
        </svg>
        <p className={styles.subKicker}>Signed in on</p>
        <ul className={styles.rows}>
          {[
            ["MacBook", "now"],
            ["Phone", "2 min ago"],
            ["Office PC", "yesterday"],
          ].map(([device, when], i) => (
            <li key={device} style={{ "--i": i } as CSSProperties}>
              <span>
                <i className={styles.dot} data-live={i === 0 || undefined} /> {device}
              </span>
              <b>{when}</b>
            </li>
          ))}
        </ul>
      </Card>
      <Card at="c" tone="note" tilt={-1}>
        <CardKicker>Yours to keep</CardKicker>
        <p className={styles.cardText}>Download everything as one file, or delete it all in one click.</p>
        <Remark>no lock-in</Remark>
      </Card>
    </Compose>
  );
}

export function GateHero({ feature }: { feature: HeroFeature }) {
  const copy = COPY[feature];
  const stage = useRef<HTMLDivElement>(null);

  function tilt(e: PointerEvent<HTMLDivElement>) {
    const box = stage.current;
    if (!box || e.pointerType !== "mouse") return;
    const rect = box.getBoundingClientRect();
    box.style.setProperty("--px", ((e.clientX - rect.left) / rect.width - 0.5).toFixed(3));
    box.style.setProperty("--py", ((e.clientY - rect.top) / rect.height - 0.5).toFixed(3));
  }

  function settle() {
    stage.current?.style.removeProperty("--px");
    stage.current?.style.removeProperty("--py");
  }

  return (
    <section className={styles.hero} aria-labelledby={`gate-${feature}`}>
      <div className={styles.copy}>
        <p className={styles.kicker}>
          <span className={styles.kickerDot} aria-hidden="true" />
          {copy.kicker} · free account
        </p>
        <h1 id={`gate-${feature}`} className={styles.title}>
          {copy.title} <span className={styles.accent}>{copy.accent}</span>
          <svg className={styles.swoosh} viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true">
            <path d="M4 14 C 80 4, 200 2, 296 10" />
          </svg>
        </h1>
        <p className={styles.body}>{copy.body}</p>
        <ul className={styles.perks}>
          {copy.perks.map((perk, i) => (
            <li key={perk} style={{ "--i": i } as CSSProperties}>
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3 8.5 6.5 12 13 4.5" />
              </svg>
              {perk}
            </li>
          ))}
        </ul>
        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={() => openAuth("sign-up")}>
            Create a free account <span aria-hidden="true">→</span>
          </button>
          <button type="button" className={styles.ghost} onClick={() => openAuth("sign-in")}>
            Sign in
          </button>
        </div>
        <p className={styles.note}>
          Nothing is lost while you decide: what you read and solve is still saved on this device, and it moves into
          your account the moment you sign in.
        </p>
      </div>
      <div className={styles.stage} ref={stage} onPointerMove={tilt} onPointerLeave={settle}>
        <span className={styles.lock} aria-hidden="true">
          🔒 a preview of what you unlock
        </span>
        {feature === "progress" ? <ProgressStage /> : feature === "review" ? <ReviewStage /> : <AccountStage />}
      </div>
    </section>
  );
}
