"use client";

import Link from "next/link";
import { useEffect, useReducer, useState } from "react";
import { Crumbs } from "@/components/Crumbs";
import { Shell } from "@/components/Shell";
import { formatClock, pickQuestions, summarise, type MockFilters, type Rating } from "@/lib/mockSession";
import type { MockQuestion } from "@/lib/mockQuestions";

const STORAGE_KEY = "jsnotes:mock";
const LEVELS: [MockFilters["level"], string][] = [
  ["any", "Any level"],
  ["fresher", "Fresher"],
  ["mid", "Mid"],
  ["senior", "Senior"],
  ["drill", "Output drills"],
];

interface Session {
  phase: "setup" | "asking" | "revealed" | "done";
  questions: MockQuestion[];
  index: number;
  ratings: Rating[];
  secondsPerQuestion: number;
  timedOut: boolean[];
}

type Action =
  | { type: "start"; questions: MockQuestion[]; secondsPerQuestion: number }
  | { type: "reveal"; timedOut: boolean }
  | { type: "rate"; rating: Rating }
  | { type: "reset" };

const idle: Session = { phase: "setup", questions: [], index: 0, ratings: [], secondsPerQuestion: 120, timedOut: [] };

function reducer(state: Session, action: Action): Session {
  switch (action.type) {
    case "start":
      if (action.questions.length === 0) return state;
      return { ...idle, phase: "asking", questions: action.questions, secondsPerQuestion: action.secondsPerQuestion };
    case "reveal":
      if (state.phase !== "asking") return state;
      return { ...state, phase: "revealed", timedOut: [...state.timedOut, action.timedOut] };
    case "rate": {
      if (state.phase !== "revealed") return state;
      const ratings = [...state.ratings, action.rating];
      const finished = state.index + 1 >= state.questions.length;
      return {
        ...state,
        ratings,
        index: finished ? state.index : state.index + 1,
        phase: finished ? "done" : "asking",
      };
    }
    case "reset":
      return idle;
  }
}

function saveResult(percent: number, total: number) {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    const history = Array.isArray(list) ? list : [];
    history.push({ at: Date.now(), percent, total });
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-10)));
  } catch {
    // storage can be blocked or full; the summary on screen is enough
  }
}

function readHistory(): { at: number; percent: number; total: number }[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(list) ? list.slice(-5).reverse() : [];
  } catch {
    return [];
  }
}

function Countdown({ seconds, onExpire }: { seconds: number; onExpire: () => void }) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    const started = Date.now();
    const id = window.setInterval(() => {
      const remaining = seconds - Math.floor((Date.now() - started) / 1000);
      setLeft(Math.max(0, remaining));
      if (remaining <= 0) {
        window.clearInterval(id);
        onExpire();
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [seconds, onExpire]);

  return (
    <span className={"chip" + (left <= 15 ? " tone-bad" : "")} role="timer" aria-label="Time left for this question">
      ⏱ {formatClock(left)}
    </span>
  );
}

export function MockView({ questions }: { questions: MockQuestion[] }) {
  const [session, dispatch] = useReducer(reducer, idle);
  const [sources, setSources] = useState<MockFilters["sources"]>(["js", "react"]);
  const [level, setLevel] = useState<MockFilters["level"]>("any");
  const [count, setCount] = useState(10);
  const [seconds, setSeconds] = useState(120);
  const [notes, setNotes] = useState("");

  const available = questions.filter(
    (q) => sources.includes(q.source) && (level === "any" || q.level === level)
  ).length;

  const current = session.questions[session.index];
  const summary = summarise(session.ratings);

  useEffect(() => {
    if (session.phase === "done") saveResult(summary.percent, summary.total);
  }, [session.phase, summary.percent, summary.total]);

  function toggleSource(source: "js" | "react") {
    setSources((prev) => (prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]));
  }

  return (
    <Shell skipLabel="Skip to the mock interview">
      <Crumbs items={[{ label: "All topics", href: "/" }, { label: "Mock interview" }]} />

      <section className="sheet hero">
        <span className="hero__kicker">timed practice</span>
        <h1>Mock interview</h1>
        <p className="hero__lead">
          Random questions from the JavaScript and React banks. Answer out loud before you reveal it, then score
          yourself honestly. Recognising an answer and producing one are different skills.
        </p>
      </section>

      {session.phase === "setup" && (
        <section className="sheet" aria-labelledby="mock-setup">
          <h2 id="mock-setup">Set it up</h2>
          <fieldset style={{ border: 0, padding: 0, margin: "12px 0" }}>
            <legend className="sub">Topics</legend>
            {(["js", "react"] as const).map((s) => (
              <label key={s} style={{ marginRight: 16 }}>
                <input type="checkbox" checked={sources.includes(s)} onChange={() => toggleSource(s)} />{" "}
                {s === "js" ? "JavaScript" : "React"}
              </label>
            ))}
          </fieldset>
          <p>
            <label>
              Level{" "}
              <select value={level} onChange={(e) => setLevel(e.target.value as MockFilters["level"])}>
                {LEVELS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>{" "}
            <label>
              Questions{" "}
              <select value={count} onChange={(e) => setCount(Number(e.target.value))}>
                {[5, 10, 15, 20].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>{" "}
            <label>
              Time each{" "}
              <select value={seconds} onChange={(e) => setSeconds(Number(e.target.value))}>
                {[60, 120, 180, 300].map((n) => (
                  <option key={n} value={n}>
                    {formatClock(n)}
                  </option>
                ))}
              </select>
            </label>
          </p>
          <p className="sub">{available} questions match.</p>
          <button
            className="btn btn--primary"
            type="button"
            disabled={available === 0}
            onClick={() =>
              dispatch({
                type: "start",
                questions: pickQuestions(questions, { sources, level, count }),
                secondsPerQuestion: seconds,
              })
            }
          >
            Start
          </button>
          <RecentResults />
        </section>
      )}

      {(session.phase === "asking" || session.phase === "revealed") && current && (
        <section className="sheet" aria-live="polite">
          <p className="sub">
            Question {session.index + 1} of {session.questions.length} ·{" "}
            <span className="tag">{current.source === "js" ? "JavaScript" : "React"}</span>{" "}
            <span className="tag">{current.level}</span>
          </p>
          <h2 dangerouslySetInnerHTML={{ __html: current.questionHtml }} />

          {session.phase === "asking" && (
            <>
              <p>
                <Countdown
                  key={session.index}
                  seconds={session.secondsPerQuestion}
                  onExpire={() => dispatch({ type: "reveal", timedOut: true })}
                />
              </p>
              <label className="sub" htmlFor="mock-notes">
                Jot your answer (optional, it is not saved)
              </label>
              <textarea
                id="mock-notes"
                rows={4}
                style={{ width: "100%" }}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <p>
                <button
                  className="btn btn--primary"
                  type="button"
                  onClick={() => dispatch({ type: "reveal", timedOut: false })}
                >
                  Reveal the answer
                </button>
              </p>
            </>
          )}

          {session.phase === "revealed" && (
            <>
              {session.timedOut[session.index] && <p className="warn">Time was up before you revealed it.</p>}
              <div className="bx is-ref">
                <span className="ttl">The answer</span>
                <div dangerouslySetInnerHTML={{ __html: current.answerHtml }} />
              </div>
              <p className="sub">How did you do?</p>
              <p>
                {(
                  [
                    ["nailed", "Nailed it"],
                    ["partly", "Partly"],
                    ["missed", "Missed it"],
                  ] as const
                ).map(([rating, label]) => (
                  <button
                    key={rating}
                    className="btn"
                    type="button"
                    style={{ marginRight: 8 }}
                    onClick={() => {
                      setNotes("");
                      dispatch({ type: "rate", rating });
                    }}
                  >
                    {label}
                  </button>
                ))}
              </p>
            </>
          )}
        </section>
      )}

      {session.phase === "done" && (
        <section className="sheet" aria-labelledby="mock-done">
          <h2 id="mock-done">{summary.percent}%</h2>
          <p>
            {summary.nailed} nailed, {summary.partly} partly, {summary.missed} missed, out of {summary.total}.
          </p>
          {session.questions.some((_, i) => session.ratings[i] !== "nailed") && (
            <>
              <h3>Go back to these</h3>
              <ul>
                {session.questions.map((q, i) =>
                  session.ratings[i] === "nailed" ? null : (
                    <li key={q.id}>
                      <Link href={q.href}>
                        <span dangerouslySetInnerHTML={{ __html: q.questionHtml }} />
                      </Link>{" "}
                      <span className="tag">{session.ratings[i]}</span>
                    </li>
                  )
                )}
              </ul>
            </>
          )}
          <button className="btn btn--primary" type="button" onClick={() => dispatch({ type: "reset" })}>
            Another round
          </button>
        </section>
      )}
    </Shell>
  );
}

function RecentResults() {
  const [history] = useState(readHistory);
  if (history.length === 0) return null;
  return (
    <>
      <h3>Recent rounds</h3>
      <ul>
        {history.map((h) => (
          <li key={h.at}>
            {new Date(h.at).toLocaleDateString("en-GB")}: {h.percent}% of {h.total}
          </li>
        ))}
      </ul>
    </>
  );
}
