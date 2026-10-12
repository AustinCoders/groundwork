"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookFrame } from "@/app/interview/BookFrame";
import { Copy, Scene } from "@/components/home/Stage";
import { Card, Compose, Remark, Tag } from "@/components/topic/Compose";
import { Check, Journey, JourneyStop, Station, StopHead } from "@/components/topic/Journey";
import {
  Actions,
  Band,
  Button,
  CardKicker,
  Chips,
  Facts,
  Foot,
  FootLink,
  Heading,
  Kicker,
  Lead,
  ProgressMeter,
  Toggle,
  ToggleGroup,
  TopicPage,
  Underlined,
  topicKit,
} from "@/components/topic/TopicKit";
import type { FrameTopic } from "@/components/topic/TopicFrame";
import { useConfidence } from "@/lib/interviewConfidence";
import { formatSpan, plural } from "@/lib/format";
import { useMounted, useProgressValue } from "@/lib/hooks";
import { progress } from "@/lib/storage";
import type { BookPart, RoundCard } from "@/lib/interviewBook";
import styles from "./landing.module.css";

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

const STEPS: [string, string][] = [
  ["Read the round", "Before each interview, read the round you have next. Start with who is across the table."],
  ["Practise, do not skim", "Switch a round to practice mode. Answers stay hidden until you have said yours."],
  ["Mark it honestly", "Knew it, shaky or blank. The question bank brings the shaky ones back until they stick."],
  ["Then get pushed", "Run the round as a mock interview, with a clock and the follow-ups, before the real one."],
];

function dayIndex(n: number): number {
  const d = new Date();
  const key = d.getFullYear() * 400 + d.getMonth() * 32 + d.getDate();
  return (key * 2654435761) % n;
}

function QuestionOfTheDay({ pool, mounted }: { pool: DailyQuestion[]; mounted: boolean }) {
  const [shift, setShift] = useState(0);
  const [open, setOpen] = useState(false);
  if (!pool.length) return null;
  const q = pool[(mounted ? dayIndex(pool.length) + shift : shift) % pool.length];
  return (
    <div className={mounted ? styles.dailyBody : `${styles.dailyBody} ${topicKit.pending}`}>
      <div className={styles.dailyTop}>
        <CardKicker>{shift === 0 ? "Question of the day" : "Another one"}</CardKicker>
        <span className={styles.dailyRound}>
          {q.roundCode} · {q.roundTitle}
        </span>
      </div>
      <p className={styles.dailyQ}>
        <span dangerouslySetInnerHTML={{ __html: q.q }} />
      </p>
      <div className={styles.dailyReveal}>
        {q.test &&
          (open ? (
            <p>
              <b>What they are really testing: </b>
              <span dangerouslySetInnerHTML={{ __html: q.test }} />
            </p>
          ) : (
            <button type="button" className={styles.reveal} onClick={() => setOpen(true)}>
              Think about it, then reveal what they test
            </button>
          ))}
      </div>
      <div className={styles.dailyFoot}>
        <Link href={`/interview/${q.roundId}#${q.id}`} className={styles.dailyLink}>
          Read the full answer →
        </Link>
        <button
          type="button"
          className={styles.another}
          onClick={() => {
            setShift((s) => s + 1);
            setOpen(false);
          }}
        >
          Another
        </button>
      </div>
    </div>
  );
}

function ConfidenceBar({ marks, total }: { marks: { knew: number; shaky: number; blank: number }; total: number }) {
  if (marks.knew + marks.shaky + marks.blank === 0) return null;
  return (
    <span
      className={styles.confBar}
      role="img"
      aria-label={`${marks.knew} knew, ${marks.shaky} shaky, ${marks.blank} blank`}
    >
      <span data-c="knew" style={{ width: `${(marks.knew / total) * 100}%` }} />
      <span data-c="shaky" style={{ width: `${(marks.shaky / total) * 100}%` }} />
      <span data-c="blank" style={{ width: `${(marks.blank / total) * 100}%` }} />
    </span>
  );
}

export function InterviewLanding({
  topic,
  rounds,
  parts,
  daily,
  totals,
}: {
  topic: FrameTopic;
  rounds: RoundCard[];
  parts: { id: BookPart; title: string; blurb: string }[];
  daily: DailyQuestion[];
  totals: { rounds: number; questions: number; followUps: number; traps: number };
}) {
  const [company, setCompany] = useState<string | null>(null);
  const mounted = useMounted();
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
  const knew = allMarks.filter((c) => c === "knew").length;
  const shaky = allMarks.filter((c) => c !== "knew").length;
  const firstUnread = rounds.find((r) => !read.has(r.id));
  const totalMinutes = rounds.reduce((sum, r) => sum + r.minutes, 0);
  const started = read.size > 0;

  return (
    <BookFrame topic={topic} scan={company}>
      <TopicPage accent={topic.accent}>
        <Scene className={topicKit.hero}>
          <Copy>
            <Kicker mark={topic.mark}>
              {plural(totals.rounds, "round")} · {plural(totals.questions, "question")} · about{" "}
              {formatSpan(totalMinutes)}
            </Kicker>
            <Heading>
              From the first call to <Underlined>the offer</Underlined>
            </Heading>
            <Lead>
              Not a list of questions. For each round: who sits across the table, what they are really testing, the
              answer and the code, the words to say, the answer that loses the room, and the follow-up they push with
              next.
            </Lead>
            <div className={mounted ? undefined : topicKit.pending}>
              <Actions>
                <Button href={`/interview/${firstUnread?.id ?? rounds[0]?.id}`}>
                  {started ? `Continue: ${firstUnread?.navTitle ?? "start again"}` : "Start the book"}{" "}
                  <span aria-hidden="true">→</span>
                </Button>
                <Button ghost href="/interview/questions">
                  Browse all {totals.questions} questions
                </Button>
              </Actions>
            </div>
            <Chips>
              <span className={topicKit.chip}>{plural(totals.followUps, "follow-up")}</span>
              <span className={topicKit.chip}>{plural(totals.traps, "trap")} named</span>
              <span className={topicKit.chip}>{parts.length} parts</span>
            </Chips>
          </Copy>
          <Compose live layout="trio">
            <Card as="aside" aria-label="Question of the day" at="a" tilt={-1} taped>
              <QuestionOfTheDay pool={daily} mounted={mounted} />
            </Card>
            <Card as="aside" aria-label="The book in numbers" at="b" tilt={1}>
              <Tag tone="primary">★ answer · code · follow-up</Tag>
              <CardKicker>The book in numbers</CardKicker>
              <Facts
                items={[
                  { value: totals.rounds, label: "rounds" },
                  { value: totals.followUps, label: "follow-ups" },
                  { value: totals.traps, label: "traps named" },
                ]}
              />
            </Card>
            <Card at="c" tone="note" tilt={-1}>
              <div className={mounted ? undefined : topicKit.pending}>
                <CardKicker>Your progress</CardKicker>
                <ProgressMeter
                  done={read.size}
                  total={rounds.length}
                  label={`${read.size} / ${rounds.length} rounds read`}
                />
                <p className={styles.marks}>
                  {allMarks.length > 0 ? (
                    <>
                      {knew} knew it · {shaky} shaky or blank
                    </>
                  ) : (
                    "Mark questions to see them here."
                  )}
                </p>
                {shaky > 0 && (
                  <Link href="/interview/questions?filter=shaky" className={styles.dailyLink}>
                    Drill the shaky ones →
                  </Link>
                )}
              </div>
              <Remark>say it out loud, then mark it</Remark>
            </Card>
          </Compose>
        </Scene>

        <Band
          no="01"
          id="how-title"
          label="How to use it"
          title="Read it like a loop, not a list"
          count={plural(STEPS.length, "step")}
        >
          <ol className={styles.steps}>
            {STEPS.map(([title, body], i) => (
              <li key={title} className={styles.step}>
                <span className={styles.stepNo} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className={styles.stepTitle}>{title}</h3>
                <p className={styles.stepBody}>{body}</p>
              </li>
            ))}
          </ol>
        </Band>

        <Band
          no="02"
          id="map-title"
          label="The loop, in order"
          title="Every round you will meet"
          sub="Each stop is one round: read it, mark yourself, move on. The ones you have read are ticked."
          count={plural(rounds.length, "round")}
        >
          <div className={styles.filter}>
            <ToggleGroup label="Show the rounds for" lead="Interviewing at">
              <Toggle pressed={company === null} onClick={() => setCompany(null)}>
                Anywhere
              </Toggle>
              {COMPANIES.map(([id, label]) => (
                <Toggle key={id} pressed={company === id} onClick={() => setCompany(company === id ? null : id)}>
                  {label}
                </Toggle>
              ))}
            </ToggleGroup>
          </div>
          {parts.map((p, pi) => {
            const list = rounds.filter((r) => r.part === p.id);
            if (!list.length) return null;
            const readHere = list.filter((r) => read.has(r.id)).length;
            const minutes = list.reduce((sum, r) => sum + r.minutes, 0);
            return (
              <div key={p.id} className={topicKit.level}>
                <Station
                  no={String(pi + 1).padStart(2, "0")}
                  name={p.title}
                  id={`part-${p.id}`}
                  blurb={p.blurb}
                  chips={[
                    plural(list.length, "round"),
                    formatSpan(minutes),
                    ...(readHere > 0 ? [`${readHere} / ${list.length} read`] : []),
                  ]}
                />
                <Journey
                  count={list.length}
                  slot={178}
                  walked={readHere / list.length}
                  label={`${p.title}: every round`}
                >
                  {list.map((r) => {
                    const hot = !company || !r.companies.length || r.companies.some((c) => c.name === company && c.hot);
                    const marks = marksFor(r);
                    const isRead = read.has(r.id);
                    const isNext = started && r.id === firstUnread?.id;
                    return (
                      <JourneyStop
                        key={r.id}
                        state={isRead ? "done" : isNext ? "next" : "todo"}
                        sticker={isNext ? "▸ pick up here" : undefined}
                        data={{ "data-dim": hot ? undefined : "" }}
                      >
                        <StopHead
                          code={r.code}
                          title={r.navTitle}
                          href={`/interview/${r.id}`}
                          sub={r.decides ?? undefined}
                          rawSub
                          end={isRead ? <Check /> : undefined}
                        />
                        <p className={styles.stopMeta}>
                          <span>{r.guide ? `${r.sections} sections` : plural(r.counts.questions, "question")}</span>
                          {r.counts.followUps > 0 && <span>{plural(r.counts.followUps, "follow-up")}</span>}
                          <span>{r.minutes} min</span>
                          {!hot && <span>not hot at this kind of company</span>}
                        </p>
                        <ConfidenceBar marks={marks} total={r.questionIds.length || 1} />
                      </JourneyStop>
                    );
                  })}
                </Journey>
              </div>
            );
          })}
        </Band>

        <Band
          no="03"
          id="say-title"
          label="Then say it"
          title="Reading is not the same as saying it."
          sub="Once a round feels solid, run it as a timed mock interview. The follow-ups are where a prepared answer runs out."
        >
          <Actions>
            <Button href="/mock">
              Start a mock interview <span aria-hidden="true">→</span>
            </Button>
            <Button ghost href="/interview/questions">
              Flashcard drill
            </Button>
          </Actions>
        </Band>

        <Foot>
          <FootLink href="/">All topics</FootLink>
          <FootLink href="/mock">Mock interview</FootLink>
          <FootLink href="/interview/questions">Question bank</FootLink>
        </Foot>
      </TopicPage>
    </BookFrame>
  );
}
