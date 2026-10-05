"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookShell } from "@/app/interview/BookShell";
import { useConfidence } from "@/lib/interviewConfidence";
import { useMounted, useProgressValue } from "@/lib/hooks";
import { progress } from "@/lib/storage";
import type { BookPart, RoundCard } from "@/lib/interviewBook";
import styles from "./book.module.css";

export interface DailyQuestion {
  id: string;
  q: string;
  test: string | null;
  roundId: string;
  roundCode: string;
  roundTitle: string;
}

const COMPANIES: [string, string][] = [
  ["service", "Service company"],
  ["product", "Product company"],
  ["saas", "SaaS"],
  ["agency", "Agency"],
];

function dayIndex(n: number): number {
  const d = new Date();
  const key = d.getFullYear() * 400 + d.getMonth() * 32 + d.getDate();
  return (key * 2654435761) % n;
}

function QuestionOfTheDay({ pool }: { pool: DailyQuestion[] }) {
  const mounted = useMounted();
  const [shift, setShift] = useState(0);
  const [open, setOpen] = useState(false);
  if (!pool.length) return null;
  const q = pool[(mounted ? dayIndex(pool.length) + shift : shift) % pool.length];
  return (
    <aside className={styles.daily} aria-label="Question of the day">
      <div className={styles.dailyTop}>
        <span className={styles.dailyTag}>{shift === 0 ? "Question of the day" : "Another one"}</span>
        <span className={styles.dailyRound}>
          {q.roundCode} · {q.roundTitle}
        </span>
      </div>
      <p className={styles.dailyQ} dangerouslySetInnerHTML={{ __html: q.q }} />
      {q.test && (
        <div className={styles.dailyReveal} data-open={open || undefined}>
          {open ? (
            <p>
              <b>What they are really testing: </b>
              <span dangerouslySetInnerHTML={{ __html: q.test }} />
            </p>
          ) : (
            <button type="button" className={styles.ghostBtn} onClick={() => setOpen(true)}>
              Think about it, then reveal what they test
            </button>
          )}
        </div>
      )}
      <div className={styles.dailyFoot}>
        <Link href={`/interview/${q.roundId}#${q.id}`} className={styles.textLink}>
          Read the full answer →
        </Link>
        <button
          type="button"
          className={styles.linkBtn}
          onClick={() => {
            setShift((s) => s + 1);
            setOpen(false);
          }}
        >
          Another
        </button>
      </div>
    </aside>
  );
}

function RoundTile({
  r,
  read,
  marks,
  dim,
}: {
  r: RoundCard;
  read: boolean;
  marks: { knew: number; shaky: number; blank: number };
  dim: boolean;
}) {
  const total = r.questionIds.length || 1;
  return (
    <Link
      href={`/interview/${r.id}`}
      prefetch={false}
      className={styles.tile}
      data-dim={dim || undefined}
      data-read={read || undefined}
    >
      <span className={styles.tileTop}>
        <span className={styles.tileCode}>{r.code}</span>
        {read && (
          <span className={styles.readBadge} aria-label="Read">
            ✓ read
          </span>
        )}
      </span>
      <span className={styles.tileTitle}>{r.navTitle}</span>
      {r.decides && (
        <span className={styles.tileDecides}>
          <b>Decides:</b> <span dangerouslySetInnerHTML={{ __html: r.decides }} />
        </span>
      )}
      <span className={styles.tileMeta}>
        <span>{r.guide ? `${r.sections} sections` : `${r.counts.questions} questions`}</span>
        {r.counts.followUps > 0 && <span>{r.counts.followUps} follow-ups</span>}
        <span>{r.minutes} min</span>
      </span>
      {marks.knew + marks.shaky + marks.blank > 0 && (
        <span className={styles.confBar} aria-label={`${marks.knew} knew, ${marks.shaky} shaky, ${marks.blank} blank`}>
          <span data-c="knew" style={{ width: `${(marks.knew / total) * 100}%` }} />
          <span data-c="shaky" style={{ width: `${(marks.shaky / total) * 100}%` }} />
          <span data-c="blank" style={{ width: `${(marks.blank / total) * 100}%` }} />
        </span>
      )}
    </Link>
  );
}

export function InterviewLanding({
  rounds,
  parts,
  daily,
  totals,
}: {
  rounds: RoundCard[];
  parts: { id: BookPart; title: string; blurb: string }[];
  daily: DailyQuestion[];
  totals: { rounds: number; questions: number; followUps: number; traps: number };
}) {
  const [company, setCompany] = useState<string | null>(null);
  const conf = useConfidence();
  const readKey = useProgressValue(
    () =>
      rounds
        .filter((r) => progress.isChapterDone(r.id))
        .map((r) => r.id)
        .join(","),
    ""
  );
  const read = useMemo(() => new Set(readKey ? readKey.split(",") : []), [readKey]);

  const marksFor = (r: RoundCard) => {
    const m = { knew: 0, shaky: 0, blank: 0 };
    r.questionIds.forEach((id) => {
      const c = conf[id];
      if (c) m[c]++;
    });
    return m;
  };
  const allMarks = Object.values(conf);
  const shaky = allMarks.filter((c) => c !== "knew").length;
  const firstUnread = rounds.find((r) => !read.has(r.id));

  return (
    <BookShell scan={company}>
      <section className={styles.hero}>
        <div className={styles.heroCopy} data-fx="stagger">
          <p className={styles.kicker}>
            <span className={styles.dot} aria-hidden="true" /> {totals.rounds} rounds · {totals.questions}+ questions ·{" "}
            {totals.followUps} follow-ups
          </p>
          <h1 className={styles.h1}>
            Every round of the loop, <span className={styles.accent}>and the answer that gets you through it.</span>
          </h1>
          <p className={styles.lead}>
            Not a list of questions. For each round: who sits across the table, what they are really testing, the answer
            and the code, the words to say, the answer that loses the room, and the follow-up they push with next.
          </p>
          <div className={styles.actions}>
            <Link href={`/interview/${firstUnread?.id ?? rounds[0]?.id}`} className={styles.btn}>
              {read.size ? `Continue: ${firstUnread?.navTitle ?? "start again"}` : "Start with the scouting report"}{" "}
              <span aria-hidden="true">→</span>
            </Link>
            <Link href="/interview/questions" className={`${styles.btn} ${styles.btnGhost}`}>
              Drill the question bank
            </Link>
          </div>
          <dl className={styles.stats}>
            <div>
              <dt>rounds</dt>
              <dd>{totals.rounds}</dd>
            </div>
            <div>
              <dt>questions answered</dt>
              <dd>{totals.questions}+</dd>
            </div>
            <div>
              <dt>follow-ups</dt>
              <dd>{totals.followUps}</dd>
            </div>
            <div>
              <dt>traps named</dt>
              <dd>{totals.traps}</dd>
            </div>
          </dl>
        </div>
        <div data-fx="right">
          <QuestionOfTheDay pool={daily} />
        </div>
      </section>

      {(read.size > 0 || allMarks.length > 0) && (
        <section className={styles.progressBand} aria-label="Your progress" data-fx="up">
          <div>
            <b>{read.size}</b>
            <span>of {rounds.length} rounds read</span>
          </div>
          <div>
            <b>{allMarks.filter((c) => c === "knew").length}</b>
            <span>answers you knew</span>
          </div>
          <div>
            <b>{shaky}</b>
            <span>shaky or blank</span>
          </div>
          {shaky > 0 && (
            <Link href="/interview/questions?filter=shaky" className={styles.btn}>
              Drill the shaky ones →
            </Link>
          )}
        </section>
      )}

      <section className={styles.howUse} aria-labelledby="how-h" data-fx="stagger">
        <h2 id="how-h" className="visually-hidden">
          How to use this book
        </h2>
        {[
          [
            "Read the round",
            "Before each interview, read the round you have next. Start with who is across the table.",
          ],
          ["Practise, do not skim", "Switch a round to practice mode. Answers stay hidden until you have said yours."],
          [
            "Mark it honestly",
            "Knew it, shaky or blank. The question bank brings the shaky ones back until they stick.",
          ],
          [
            "Then get pushed",
            "Run the round as a mock interview, with a clock and the follow-ups, before the real one.",
          ],
        ].map(([t, b], i) => (
          <div key={t}>
            <span className={styles.howNum}>{String(i + 1).padStart(2, "0")}</span>
            <b>{t}</b>
            <p>{b}</p>
          </div>
        ))}
      </section>

      <section className={styles.mapHead} aria-labelledby="map-h">
        <div data-fx="stagger">
          <p className={styles.eyebrow}>The loop, in order</p>
          <h2 id="map-h" className={styles.h2}>
            Every round you will meet.
          </h2>
        </div>
        <div className={styles.filter} role="group" aria-label="Show the rounds for">
          <span>Interviewing at</span>
          <button type="button" aria-pressed={company === null} onClick={() => setCompany(null)}>
            Anywhere
          </button>
          {COMPANIES.map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={company === id}
              onClick={() => setCompany(company === id ? null : id)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {parts.map((p, pi) => {
        const list = rounds.filter((r) => r.part === p.id);
        if (!list.length) return null;
        return (
          <section key={p.id} className={styles.part} aria-labelledby={`part-${p.id}`}>
            <div className={styles.partHead} data-fx="left">
              <span className={styles.partNum}>Part {pi + 1}</span>
              <h3 id={`part-${p.id}`}>{p.title}</h3>
              <p>{p.blurb}</p>
            </div>
            <div className={styles.tiles} data-fx="stagger">
              {list.map((r) => {
                const hot = !company || !r.companies.length || r.companies.some((c) => c.name === company && c.hot);
                return <RoundTile key={r.id} r={r} read={read.has(r.id)} marks={marksFor(r)} dim={!hot} />;
              })}
            </div>
          </section>
        );
      })}

      <section className={styles.cta} data-fx="scale">
        <h2 className={styles.h2}>Reading is not the same as saying it.</h2>
        <p className={styles.lead}>
          Once a round feels solid, run it as a timed mock interview. The follow-ups are where a prepared answer runs
          out.
        </p>
        <div className={styles.actions}>
          <Link href="/mock" className={styles.btn} prefetch={false}>
            Start a mock interview <span aria-hidden="true">→</span>
          </Link>
          <Link href="/interview/questions" className={`${styles.btn} ${styles.btnGhost}`}>
            Flashcard drill
          </Link>
        </div>
      </section>
    </BookShell>
  );
}
