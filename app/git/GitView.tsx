"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Copy, Scene } from "@/components/home/Stage";
import { TopIcon } from "@/components/practice/TopIcon";
import type { SeriesCard, SeriesPart } from "@/components/chapter/types";
import { Card, Compose, Remark, Tag } from "@/components/topic/Compose";
import { Check, Journey, JourneyStop, Station, StopHead } from "@/components/topic/Journey";
import { TopicFrame, type FrameTopic } from "@/components/topic/TopicFrame";
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
  Notes,
  Step,
  Steps,
  TopicPage,
  Underlined,
  topicKit,
} from "@/components/topic/TopicKit";
import { formatSpan, plural } from "@/lib/format";
import { useMounted, useProgressValue } from "@/lib/hooks";
import { progress } from "@/lib/storage";
import styles from "./git.module.css";

const STARTS = [
  {
    id: "model",
    title: "New to Git",
    body: "Start with the mental model, then the three areas. Those two chapters make the everyday commands make sense.",
    action: "Read the mental model",
  },
  {
    id: "undo",
    title: "Something just went wrong",
    body: "Undoing anything shows which undo fits the job, and what each one can and cannot bring back.",
    action: "Open Undoing anything",
  },
  {
    id: "interview",
    title: "An interview this week",
    body: "The interview bank has the questions with short answers, and the cheat sheet lists every command by job.",
    action: "Open the interview bank",
  },
];

const NOTES = [
  "Nothing on this site runs Git for you. Every example is a command to try in your own terminal, in a throwaway repository.",
  "The pull request chapter uses GitHub and its gh command line. Other hosts use the same ideas under different names.",
  "You do not need all of it. The first part covers the daily work, and the later parts are for the days you need them.",
];

export function GitView({
  topic,
  basePath,
  progressPrefix,
  parts,
  chapters,
  facts,
  figureHtml,
  lead,
}: {
  topic: FrameTopic;
  basePath: string;
  progressPrefix: string;
  parts: SeriesPart<string>[];
  chapters: SeriesCard<string>[];
  facts: [string, string][];
  figureHtml: string;
  lead: string;
}) {
  const mounted = useMounted();

  const doneKey = useProgressValue(
    () =>
      chapters
        .filter((c) => progress.isChapterDone(progressPrefix + c.id))
        .map((c) => c.id)
        .join(","),
    ""
  );
  const done = useMemo(() => new Set(doneKey ? doneKey.split(",") : []), [doneKey]);
  const first = chapters[0];
  const next = chapters.find((c) => !done.has(c.id)) ?? first;
  const started = mounted && done.size > 0;
  const totalMinutes = chapters.reduce((n, c) => n + c.minutes, 0);
  const doors = STARTS.map((s) => ({ ...s, chapter: chapters.find((c) => c.id === s.id) })).filter((s) => s.chapter);

  return (
    <TopicFrame
      topic={topic}
      reading
      layout="reader"
      skip={{ label: "Skip to the chapters" }}
      actions={
        mounted ? (
          <Link className="btn btn--primary" href={`${basePath}/${next.id}`}>
            {started ? "Continue reading" : "Start reading"}
            <TopIcon name="next" size={16} />
          </Link>
        ) : undefined
      }
    >
      <TopicPage accent={topic.accent}>
        <Scene className={`${topicKit.hero} ${styles.hero}`}>
          <Copy>
            <Kicker mark={topic.mark}>From first commit to reflog rescue</Kicker>
            <Heading>
              What is Git <Underlined>really doing?</Underlined>
            </Heading>
            <Lead>{lead}</Lead>
            <div className={mounted ? undefined : topicKit.pending}>
              <Actions>
                <Button href={`${basePath}/${next.id}`}>
                  {started ? "Continue" : "Start"}
                  <span className={topicKit.sr}>
                    {" "}
                    with {started ? next.short || next.title : "the first chapter"}
                  </span>{" "}
                  <span aria-hidden="true">→</span>
                </Button>
                <Button ghost href="#parts-title">
                  The four parts
                </Button>
              </Actions>
            </div>
            <Chips>
              <span className={topicKit.chip}>{plural(chapters.length, "chapter")}</span>
              <span className={topicKit.chip}>
                about {totalMinutes >= 90 ? `${Math.round(totalMinutes / 60)} hours` : `${totalMinutes} minutes`} of
                reading
              </span>
              {mounted && (
                <span className={topicKit.chip}>
                  {done.size} of {chapters.length} read
                </span>
              )}
            </Chips>
          </Copy>
          <Compose live layout="banner">
            <Card at="a" tilt={-1} taped>
              <div
                className={styles.figure}
                suppressHydrationWarning
                dangerouslySetInnerHTML={{ __html: figureHtml }}
              />
            </Card>
            <Card as="section" aria-label="In numbers" at="b" tilt={0}>
              <Tag tone="success">★ free to read</Tag>
              <CardKicker>In numbers</CardKicker>
              <Facts items={facts.map(([value, label]) => ({ value, label }))} />
            </Card>
            <Card as="aside" aria-label="Start here" extra at="c" tone="note" tilt={1}>
              <CardKicker>Start here</CardKicker>
              <Link className={styles.startTitle} href={`${basePath}/${first.id}`} prefetch={false}>
                {first.title}
              </Link>
              <p className={styles.startSub}>{first.subtitle}</p>
              <div className={styles.startMeta}>
                <span className={topicKit.chip}>{formatSpan(first.minutes)} read</span>
              </div>
              <Remark>start with the model</Remark>
            </Card>
          </Compose>
        </Scene>

        <Band
          no="01"
          id="start-title"
          label="Where to start"
          title="Pick the door that fits today"
          sub="Every chapter stands on the mental model, but you can enter anywhere."
        >
          <Steps label="Where to start" count={doors.length}>
            {doors.map((s, i) => (
              <Step
                key={s.id}
                no={i + 1}
                title={s.title}
                body={s.body}
                href={`${basePath}/${s.id}`}
                action={`${s.action} →`}
              />
            ))}
          </Steps>
        </Band>

        <Band
          no="02"
          id="parts-title"
          label="Read it in order"
          title="Four parts, one trail"
          sub="Each part is its own trail. A tick marks every chapter you have read."
          count={plural(chapters.length, "chapter")}
        >
          {parts.map((part, pi) => {
            const list = chapters.filter((c) => c.levels.includes(part.level));
            if (!list.length) return null;
            const read = mounted ? list.filter((c) => done.has(c.id)).length : 0;
            const label = `part-${part.level}`;
            return (
              <section key={part.level} className={topicKit.level} aria-labelledby={label}>
                <Station
                  no={String(pi + 1).padStart(2, "0")}
                  name={part.title}
                  id={label}
                  blurb={part.blurb}
                  chips={[plural(list.length, "chapter"), ...(mounted ? [`${read} / ${list.length} read`] : [])]}
                />
                <Journey
                  count={list.length}
                  slot={150}
                  walked={read / list.length}
                  label={`${part.title}: every chapter`}
                >
                  {list.map((c) => {
                    const isRead = mounted && done.has(c.id);
                    const isNext = started && c.id === next.id;
                    return (
                      <JourneyStop
                        key={c.id}
                        state={isRead ? "done" : isNext ? "next" : "todo"}
                        sticker={isNext ? "▸ pick up here" : undefined}
                      >
                        <StopHead
                          code={c.num}
                          title={c.title}
                          sub={c.subtitle}
                          href={`${basePath}/${c.id}`}
                          end={
                            <>
                              <span className={topicKit.chip}>{formatSpan(c.minutes)}</span>
                              {isRead && <Check />}
                            </>
                          }
                        />
                      </JourneyStop>
                    );
                  })}
                </Journey>
              </section>
            );
          })}
        </Band>

        <Notes no="03" notes={NOTES} />

        <Foot>
          <FootLink href="/">All topics</FootLink>
          <FootLink href={`${basePath}/${first.id}`}>Start at the first chapter</FootLink>
        </Foot>
      </TopicPage>
    </TopicFrame>
  );
}
