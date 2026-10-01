"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookShell } from "@/app/interview/BookShell";
import { confidence, CONFIDENCE_LABEL, useConfidence, type Confidence } from "@/lib/interviewConfidence";
import type { BankQuestion, BookPart } from "@/lib/interviewBook";
import { INTERVIEW_TOTAL_QUESTIONS } from "@/lib/interviewContent";
import { shortcutShouldStepAside } from "@/lib/shortcuts";
import styles from "../book.module.css";

type Status = "all" | "unmarked" | "shaky" | "knew";

const STATUS: [Status, string][] = [
  ["all", "All"],
  ["unmarked", "Not tried yet"],
  ["shaky", "Shaky or blank"],
  ["knew", "Knew it"],
];

const CONF: Confidence[] = ["knew", "shaky", "blank"];

function plain(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .toLowerCase();
}

function shuffle<T>(list: T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function Drill({ deck, onExit }: { deck: BankQuestion[]; onExit: () => void }) {
  const conf = useConfidence();
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  const [tally, setTally] = useState<Record<Confidence, number>>({ knew: 0, shaky: 0, blank: 0 });
  const q = deck[i];

  function mark(c: Confidence) {
    if (!q) return;
    confidence.set(q.id, c);
    setTally((t) => ({ ...t, [c]: t[c] + 1 }));
    setOpen(false);
    setI((n) => n + 1);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.target as HTMLElement).closest("input, textarea, [role=dialog]")) return;
      if (e.key === " " || e.key === "Enter") {
        if (!open && !shortcutShouldStepAside(e)) {
          e.preventDefault();
          setOpen(true);
        }
      } else if (open && (e.key === "1" || e.key === "2" || e.key === "3")) {
        mark(CONF[Number(e.key) - 1]);
      } else if (e.key === "Escape") onExit();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!q) {
    return (
      <section className={styles.drill} aria-label="Drill finished">
        <p className={styles.eyebrow}>Deck done</p>
        <h2 className={styles.h2}>
          {deck.length} {deck.length === 1 ? "card" : "cards"} through.
        </h2>
        <div className={styles.tally}>
          {CONF.map((c) => (
            <div key={c} data-c={c}>
              <b>{tally[c]}</b>
              <span>{CONFIDENCE_LABEL[c]}</span>
            </div>
          ))}
        </div>
        <p className={styles.lead}>
          The shaky and blank ones stay marked. Filter by &ldquo;Shaky or blank&rdquo; and drill them again tomorrow.
        </p>
        <button type="button" className={styles.btn} onClick={onExit}>
          Back to the bank
        </button>
      </section>
    );
  }

  return (
    <section className={styles.drill} aria-label="Flashcard drill">
      <div className={styles.drillTop}>
        <span>
          Card {i + 1} of {deck.length}
        </span>
        <span className={styles.drillBar}>
          <span style={{ width: `${(i / deck.length) * 100}%` }} />
        </span>
        <button type="button" className={styles.linkBtn} onClick={onExit}>
          Stop
        </button>
      </div>
      <article className={styles.card} key={q.id} data-open={open || undefined}>
        <span className={styles.cardRound}>
          {q.roundCode} · {q.roundTitle}
          {conf[q.id] && <em> · last time: {CONFIDENCE_LABEL[conf[q.id]]}</em>}
        </span>
        <h2 className={styles.cardQ} dangerouslySetInnerHTML={{ __html: q.q }} />
        {!open ? (
          <button type="button" className={styles.btn} onClick={() => setOpen(true)}>
            Reveal <kbd>space</kbd>
          </button>
        ) : (
          <div className={styles.cardBack}>
            {q.test && (
              <div className={styles.testBox}>
                <span className={styles.boxLabel}>What they are really testing</span>
                <div dangerouslySetInnerHTML={{ __html: q.test }} />
              </div>
            )}
            {q.say && (
              <div className={styles.sayBox}>
                <span className={styles.boxLabel}>Say it like this</span>
                <div dangerouslySetInnerHTML={{ __html: q.say }} />
              </div>
            )}
            {q.trap && (
              <div className={styles.trapBox}>
                <span className={styles.boxLabel}>The answer that loses the room</span>
                <div dangerouslySetInnerHTML={{ __html: q.trap }} />
              </div>
            )}
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
            <Link href={`/interview/${q.roundId}#${q.id}`} className={styles.textLink} target="_blank">
              Full answer{q.hasCode ? " and code" : ""} in the round →
            </Link>
            <div className={styles.confRow} role="group" aria-label="How did you do?">
              <span>How did you do?</span>
              {CONF.map((c, k) => (
                <button key={c} type="button" data-c={c} onClick={() => mark(c)}>
                  {CONFIDENCE_LABEL[c]} <kbd>{k + 1}</kbd>
                </button>
              ))}
            </div>
          </div>
        )}
      </article>
    </section>
  );
}

export function QuestionBank({
  questions,
  parts,
}: {
  questions: BankQuestion[];
  parts: { id: BookPart; title: string }[];
}) {
  const conf = useConfidence();
  const [query, setQuery] = useState("");
  const [part, setPart] = useState<BookPart | "all">("all");
  const [status, setStatus] = useState<Status>("all");
  const [onlyTraps, setOnlyTraps] = useState(false);
  const [deck, setDeck] = useState<BankQuestion[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const f = new URLSearchParams(window.location.search).get("filter");
    if (f === "shaky") {
      const id = requestAnimationFrame(() => setStatus("shaky"));
      return () => cancelAnimationFrame(id);
    }
  }, []);

  const index = useMemo(
    () => questions.map((q) => ({ q, text: plain(`${q.q} ${q.test ?? ""} ${q.roundTitle}`) })),
    [questions]
  );

  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const list = index
    .filter(({ q, text }) => {
      if (part !== "all" && q.part !== part) return false;
      if (onlyTraps && !q.trap) return false;
      const c = conf[q.id];
      if (status === "unmarked" && c) return false;
      if (status === "shaky" && c !== "shaky" && c !== "blank") return false;
      if (status === "knew" && c !== "knew") return false;
      return words.every((w) => text.includes(w));
    })
    .map(({ q }) => q);

  const knew = questions.filter((q) => conf[q.id] === "knew").length;
  const shaky = questions.filter((q) => conf[q.id] === "shaky" || conf[q.id] === "blank").length;

  return (
    <BookShell scan={`${deck ? "drill" : "list"}`}>
      <header className={styles.bankHero} data-fx="stagger">
        <p className={styles.eyebrow}>Question bank</p>
        <h1 className={styles.roundTitle}>Every question, in one place.</h1>
        <p className={styles.lead}>
          {questions.length} questions answered in depth, plus {INTERVIEW_TOTAL_QUESTIONS - questions.length} more as
          rapid-fire follow-ups and prep guides — {INTERVIEW_TOTAL_QUESTIONS} in all. Search them, filter them, or drill
          the {questions.length} in depth as flashcards: read the question, say your answer out loud, reveal, and mark
          yourself honestly.
        </p>
        <div className={styles.bankStats}>
          <span>
            <b>{knew}</b> knew it
          </span>
          <span>
            <b>{shaky}</b> shaky or blank
          </span>
          <span>
            <b>{questions.length - knew - shaky}</b> not tried
          </span>
        </div>
      </header>

      {deck ? (
        <Drill deck={deck} onExit={() => setDeck(null)} />
      ) : (
        <>
          <div className={styles.bankTools} data-fx="up">
            <label className={styles.search}>
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" style={{ margin: 0 }}>
                <path
                  d="M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-4-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <input
                type="search"
                value={query}
                placeholder="Search questions, e.g. closures, cache, notice period"
                aria-label="Search questions"
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <div className={styles.chips} role="group" aria-label="Part of the book">
              <button type="button" aria-pressed={part === "all"} onClick={() => setPart("all")}>
                Every part
              </button>
              {parts.map((p) => (
                <button key={p.id} type="button" aria-pressed={part === p.id} onClick={() => setPart(p.id)}>
                  {p.title}
                </button>
              ))}
            </div>
            <div className={styles.chips} role="group" aria-label="Your marks">
              {STATUS.map(([id, label]) => (
                <button key={id} type="button" aria-pressed={status === id} onClick={() => setStatus(id)}>
                  {label}
                </button>
              ))}
              <button type="button" aria-pressed={onlyTraps} onClick={() => setOnlyTraps((v) => !v)}>
                Has a trap
              </button>
            </div>
            <div className={styles.bankBar}>
              <span>
                {list.length} of {questions.length}
              </span>
              <button
                type="button"
                className={styles.btn}
                disabled={!list.length}
                onClick={() => setDeck(shuffle(list).slice(0, 20))}
              >
                Drill {Math.min(20, list.length)} as flashcards →
              </button>
            </div>
          </div>

          <ol className={styles.bankList}>
            {list.map((q) => {
              const open = openId === q.id;
              return (
                <li key={q.id} className={styles.bankItem} data-mark={conf[q.id]}>
                  <button
                    type="button"
                    className={styles.bankQ}
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? null : q.id)}
                  >
                    <span className={styles.bankCode}>{q.roundCode}</span>
                    <span className={styles.bankText} dangerouslySetInnerHTML={{ __html: q.q }} />
                    <span className={styles.bankTags}>
                      {q.trap && <span data-t="trap">trap</span>}
                      {q.hasCode && <span data-t="code">code</span>}
                      {q.fu.length > 0 && <span>{q.fu.length} follow-ups</span>}
                    </span>
                  </button>
                  {open && (
                    <div className={styles.bankMore}>
                      {q.test && (
                        <p>
                          <b>What they test: </b>
                          <span dangerouslySetInnerHTML={{ __html: q.test }} />
                        </p>
                      )}
                      <div className={styles.confRow} role="group" aria-label="Mark this question">
                        {CONF.map((c) => (
                          <button
                            key={c}
                            type="button"
                            data-c={c}
                            aria-pressed={conf[q.id] === c}
                            onClick={() => confidence.set(q.id, conf[q.id] === c ? null : c)}
                          >
                            {CONFIDENCE_LABEL[c]}
                          </button>
                        ))}
                        <Link href={`/interview/${q.roundId}#${q.id}`} className={styles.textLink}>
                          Read the answer in {q.roundTitle} →
                        </Link>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
          {!list.length && <p className={styles.empty}>Nothing matches. Try fewer words or another filter.</p>}
        </>
      )}
    </BookShell>
  );
}
