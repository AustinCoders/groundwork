"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookFrame } from "@/app/interview/BookFrame";
import { followUpsHtml, sayHtml, trapHtml } from "@/app/interview/answerHtml";
import { Copy, Scene, Tape } from "@/components/home/Stage";
import { Card, Compose, Deck, Remark, Tag } from "@/components/topic/Compose";
import { Prose } from "@/components/chapter/ChapterKit";
import type { FrameTopic } from "@/components/topic/TopicFrame";
import {
  Actions,
  Band,
  Button,
  CardKicker,
  Chips,
  Foot,
  FootLink,
  Heading,
  Kicker,
  Lead,
  Toggle,
  ToggleGroup,
  TopicPage,
  Underlined,
  Wrap,
  topicKit,
} from "@/components/topic/TopicKit";
import { ClearButton, SearchPill, kit } from "@/components/ui/MenuKit";
import { plural } from "@/lib/format";
import { useMounted } from "@/lib/hooks";
import { confidence, CONFIDENCE_LABEL, useConfidence, type Confidence } from "@/lib/interviewConfidence";
import type { BankQuestion, BookPart } from "@/lib/interviewBook";
import { plainText, truncate } from "@/lib/homeRounds";
import { shortcutShouldStepAside } from "@/lib/shortcuts";
import styles from "./bank.module.css";

type Status = "all" | "unmarked" | "shaky" | "knew";

const STATUS: [Status, string][] = [
  ["all", "All"],
  ["unmarked", "Not tried yet"],
  ["shaky", "Shaky or blank"],
  ["knew", "Knew it"],
];

const CONF: Confidence[] = ["knew", "shaky", "blank"];
const DECK_SIZE = 20;
const SAMPLE_LIMIT = 110;

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
        <CardKicker>Deck done</CardKicker>
        <h2 className={styles.doneTitle}>
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
        <p className={styles.doneNote}>
          The shaky and blank ones stay marked. Filter by &ldquo;Shaky or blank&rdquo; and drill them again tomorrow.
        </p>
        <button type="button" className={styles.primary} onClick={onExit}>
          Back to the bank
        </button>
      </section>
    );
  }

  const back = [q.say ? sayHtml(q.say) : "", q.trap ? trapHtml(q.trap) : "", followUpsHtml(q.fu)].join("");

  return (
    <section className={styles.drill} aria-label="Flashcard drill">
      <div className={styles.drillTop}>
        <span>
          Card {i + 1} of {deck.length}
        </span>
        <span className={styles.drillBar}>
          <span style={{ width: `${(i / deck.length) * 100}%` }} />
        </span>
        <button type="button" className={styles.stop} onClick={onExit}>
          Stop
        </button>
      </div>
      <article className={styles.card} key={q.id} data-open={open || undefined}>
        <Tape rot={-3} />
        <p className={styles.cardRound}>
          {q.roundCode} · {q.roundTitle}
          {conf[q.id] && <em> · last time: {CONFIDENCE_LABEL[conf[q.id]]}</em>}
        </p>
        <h2 className={styles.cardQ}>
          <span dangerouslySetInnerHTML={{ __html: q.q }} />
        </h2>
        {!open ? (
          <button type="button" className={styles.primary} onClick={() => setOpen(true)}>
            Reveal <kbd>space</kbd>
          </button>
        ) : (
          <div className={styles.cardBack}>
            {q.test && (
              <p className={styles.test}>
                <b>What they are really testing</b>
                <span dangerouslySetInnerHTML={{ __html: q.test }} />
              </p>
            )}
            {back && <Prose html={back} className="interview-body" />}
            <Link href={`/interview/${q.roundId}#${q.id}`} className={styles.fullLink} target="_blank">
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
  topic,
  questions,
  parts,
  totalQuestions,
}: {
  topic: FrameTopic;
  questions: BankQuestion[];
  parts: { id: BookPart; title: string }[];
  totalQuestions: number;
}) {
  const mounted = useMounted();
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
  const filtered = Boolean(words.length) || part !== "all" || status !== "all" || onlyTraps;
  const sample = questions[0];

  function clearFilters() {
    setQuery("");
    setPart("all");
    setStatus("all");
    setOnlyTraps(false);
  }

  if (deck) {
    return (
      <BookFrame topic={topic} scan="drill">
        <TopicPage accent={topic.accent}>
          <Wrap>
            <h1 className="visually-hidden">Flashcard drill</h1>
            <div className={styles.drillWrap}>
              <Drill deck={deck} onExit={() => setDeck(null)} />
            </div>
          </Wrap>
        </TopicPage>
      </BookFrame>
    );
  }

  return (
    <BookFrame topic={topic} scan="list">
      <TopicPage accent={topic.accent}>
        <Scene className={topicKit.hero}>
          <Copy>
            <Kicker mark={topic.mark}>
              {plural(questions.length, "question")} in depth · {totalQuestions} in all
            </Kicker>
            <Heading>
              Every question, in <Underlined>one place</Underlined>
            </Heading>
            <Lead>
              {questions.length} questions answered in depth, plus {totalQuestions - questions.length} more as
              rapid-fire follow-ups and prep guides. Search them, filter them, or drill them as flashcards: read the
              question, say your answer out loud, reveal, and mark yourself honestly.
            </Lead>
            <Actions>
              <Button href="#bank-title">
                Jump to the questions <span aria-hidden="true">↓</span>
              </Button>
              <Button ghost href="/interview">
                Back to the rounds
              </Button>
            </Actions>
            <div className={mounted ? undefined : topicKit.pending}>
              <Chips>
                <span className={topicKit.chip}>{knew} knew it</span>
                <span className={topicKit.chip}>{shaky} shaky or blank</span>
                <span className={topicKit.chip}>{questions.length - knew - shaky} not tried</span>
              </Chips>
            </div>
          </Copy>
          <Compose layout="stack">
            <Deck at="a">
              <Card decor at="a" tilt={-1} taped>
                <Tag tone="primary">★ mark it honestly</Tag>
                <p className={styles.flashKicker}>
                  <span>
                    Flashcard · {sample?.roundCode} {sample?.roundTitle}
                  </span>
                  <span className={styles.flashCount}>{DECK_SIZE} cards a round</span>
                </p>
                <p className={styles.flashQ}>
                  <span className={topicKit.highlight}>
                    {sample ? truncate(plainText(sample.q), SAMPLE_LIMIT) : ""}
                  </span>
                </p>
                <div className={styles.flashRow}>
                  <span className={styles.flashReveal}>
                    Reveal <kbd>space</kbd>
                  </span>
                  <span className={styles.flashMarks}>
                    <i data-c="knew">1</i>
                    <i data-c="shaky">2</i>
                    <i data-c="blank">3</i>
                  </span>
                </div>
                <Remark>say it out loud first</Remark>
              </Card>
            </Deck>
          </Compose>
        </Scene>

        <Band
          no="01"
          id="bank-title"
          label="Search and filter"
          title="Find the one that scares you"
          count={plural(questions.length, "question")}
        >
          <div className={styles.tools}>
            <SearchPill
              trailing={query ? <ClearButton label="Clear the search" onClear={() => setQuery("")} /> : undefined}
            >
              <input
                type="search"
                value={query}
                placeholder="Search questions, e.g. closures, cache, notice period"
                aria-label="Search questions"
                autoComplete="off"
                onChange={(e) => setQuery(e.target.value)}
              />
            </SearchPill>
            <ToggleGroup label="Part of the book">
              <Toggle pressed={part === "all"} onClick={() => setPart("all")}>
                Every part
              </Toggle>
              {parts.map((p) => (
                <Toggle key={p.id} pressed={part === p.id} onClick={() => setPart(p.id)}>
                  {p.title}
                </Toggle>
              ))}
            </ToggleGroup>
            <ToggleGroup label="Your marks">
              {STATUS.map(([id, label]) => (
                <Toggle key={id} pressed={status === id} onClick={() => setStatus(id)}>
                  {label}
                </Toggle>
              ))}
              <Toggle pressed={onlyTraps} onClick={() => setOnlyTraps((v) => !v)}>
                Has a trap
              </Toggle>
            </ToggleGroup>
            <div className={styles.bar}>
              <span aria-live="polite">
                {list.length} of {questions.length}
              </span>
              <button
                type="button"
                className={styles.primary}
                disabled={!list.length}
                onClick={() => setDeck(shuffle(list).slice(0, DECK_SIZE))}
              >
                Drill {Math.min(DECK_SIZE, list.length)} as flashcards →
              </button>
            </div>
          </div>

          <ol className={`${kit.rows} ${styles.list}`}>
            {list.map((q) => {
              const open = openId === q.id;
              return (
                <li key={q.id} data-mark={conf[q.id]}>
                  <button
                    type="button"
                    className={`${kit.row} ${styles.item}`}
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? null : q.id)}
                  >
                    <span className={kit.code}>{q.roundCode}</span>
                    <span className={`${kit.title} ${styles.text}`} dangerouslySetInnerHTML={{ __html: q.q }} />
                    <span className={styles.tags}>
                      {q.trap && <span data-t="trap">trap</span>}
                      {q.hasCode && <span data-t="code">code</span>}
                      {q.fu.length > 0 && <span>{q.fu.length} follow-ups</span>}
                    </span>
                  </button>
                  {open && (
                    <div className={styles.more}>
                      {q.test && (
                        <p className={styles.test}>
                          <b>What they test</b>
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
                        <Link href={`/interview/${q.roundId}#${q.id}`} className={styles.fullLink}>
                          Read the answer in {q.roundTitle} →
                        </Link>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
          {!list.length && (
            <div className={styles.empty}>
              <p>Nothing matches. Try fewer words or another filter.</p>
              {filtered && (
                <button type="button" className={styles.ghost} onClick={clearFilters}>
                  Clear the filters
                </button>
              )}
            </div>
          )}
        </Band>

        <Foot>
          <FootLink href="/interview">All rounds</FootLink>
          <FootLink href="/mock">Mock interview</FootLink>
          <FootLink href="/">All topics</FootLink>
        </Foot>
      </TopicPage>
    </BookFrame>
  );
}
