"use client";

import { useEffect, useMemo } from "react";
import { Copy, Note, Scene, Stage, StageCard, Sticker, Tape } from "@/components/home/Stage";
import { TopicFrame } from "@/components/topic/TopicFrame";
import {
  Actions,
  Band,
  Button,
  Facts,
  Foot,
  FootLink,
  Heading,
  Kicker,
  Lead,
  List,
  Row,
  TopicPage,
  Underlined,
  topicKit,
} from "@/components/topic/TopicKit";
import { Journey, JourneyStop, SoonTag, StopHead } from "@/components/topic/Journey";
import { formatSpan, plural } from "@/lib/format";
import { problemHref } from "@/lib/problemHref";
import { progress, rememberLevel } from "@/lib/storage";
import { useMounted, useProgressValue } from "@/lib/hooks";
import type { LevelRow } from "@/lib/levelRows";
import type { Level, Topic } from "@/content/types";
import type { CSSProperties } from "react";
import styles from "./path.module.css";

export interface ExerciseLink {
  id: string;
  title: string;
  testCount: number;
  level: string;
  chapterShort: string | null;
}

export function TopicPath({
  topic,
  level,
  basePath,
  entries,
  chapterExercises,
  levelExerciseList,
}: {
  topic: Topic;
  level: Level;
  basePath: string;
  entries: LevelRow[];
  chapterExercises: Record<string, ExerciseLink[]>;
  levelExerciseList: ExerciseLink[];
}) {
  const mounted = useMounted();

  useEffect(() => {
    rememberLevel(level.id);
  }, [level.id]);

  const chapters = useMemo(() => entries.filter((entry) => entry.ready).map((entry) => entry.chapter), [entries]);

  const doneKey = useProgressValue(
    () => chapters.map((ch) => (progress.isChapterDone(ch.id) ? "1" : "0")).join(""),
    ""
  );
  const done = useMemo(() => {
    const set = new Set<string>();
    chapters.forEach((ch, i) => {
      if (doneKey[i] === "1") set.add(ch.id);
    });
    return set;
  }, [doneKey, chapters]);

  const doneCount = mounted ? done.size : 0;
  const pct = chapters.length ? (doneCount / chapters.length) * 100 : 0;
  const next = mounted ? (chapters.find((ch) => !done.has(ch.id)) ?? null) : (chapters[0] ?? null);

  const continueHref = next ? `${basePath}/${next.id}` : basePath;
  const continueLabel = !mounted || doneCount === 0 ? "Start reading" : next ? `Continue — ${next.short}` : "Review";
  const totalMinutes = chapters.reduce((sum, ch) => sum + ch.readMinutes, 0);
  const chaptersLeft = chapters.length - doneCount;
  const nextIndex = next ? entries.findIndex((entry) => entry.ready && entry.chapter.id === next.id) : entries.length;
  const walked = entries.length ? Math.min(1, Math.max(0, nextIndex / entries.length)) : 0;

  const exerciseRows = (list: ExerciseLink[], withChapter: boolean) =>
    list.map((ex) => (
      <Row
        key={ex.id}
        title={ex.title}
        sub={`${withChapter && ex.chapterShort ? `${ex.chapterShort} · ` : ""}${plural(ex.testCount, "test")}${withChapter ? "" : ` · ${ex.level}`}`}
        href={problemHref(ex.id)}
        done={mounted && progress.isExerciseSolved(ex.id)}
      />
    ));

  return (
    <TopicFrame
      topic={{ name: topic.name, href: basePath, mark: topic.mark, accent: topic.accent }}
      back={{ href: `/level/${topic.id}`, label: topic.name }}
      skip={{ label: "Skip to the path" }}
      layout="reader"
    >
      <TopicPage accent={topic.accent}>
        <Scene className={topicKit.hero}>
          <Copy>
            <Kicker mark={topic.mark} id="path-kicker">
              Step 2 of 2 · your path
            </Kicker>
            <Heading id="path-title">
              {topic.name}, <Underlined>{level.name}</Underlined>
            </Heading>
            <Lead id="path-blurb">{level.blurb}</Lead>
            <Actions>
              <Button id="start-btn" href={continueHref}>
                {continueLabel} <span aria-hidden="true">→</span>
              </Button>
              <Button ghost id="change-level" href={`/level/${topic.id}`}>
                <span aria-hidden="true">⇄</span> Change level
              </Button>
              <Button ghost id="all-chapters" href={basePath}>
                All chapters
              </Button>
            </Actions>
          </Copy>
          <Stage live hostClassName={topicKit.stageHost} className={styles.stage}>
            <StageCard rot={-1.6} depth={-10} i={0} still className={`${styles.progress}`}>
              <Tape rot={-5} />
              <p className={styles.cardKicker}>Your progress</p>
              <div className={styles.ring} style={{ "--sweep": pct } as CSSProperties} aria-hidden="true">
                <span className={styles.ringFace}>
                  <strong>{doneCount}</strong>
                  <small>of {chapters.length}</small>
                </span>
              </div>
              <div className={styles.meter}>
                <div className={styles.meterTrack}>
                  <div className={styles.meterFill} id="path-meter-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className={styles.meterLabel} id="path-meter-label">
                  {doneCount} / {chapters.length} done
                </span>
              </div>
            </StageCard>
            <StageCard rot={2.2} depth={12} i={1} className={styles.next}>
              <p className={styles.cardKicker}>{next ? "Up next" : "All read"}</p>
              {next ? (
                <>
                  <p className={styles.nextTitle}>{next.short}</p>
                  <p className={styles.nextSub}>
                    {next.readMinutes} min read
                    {(chapterExercises[next.id] ?? []).length > 0
                      ? ` · ${plural(chapterExercises[next.id].length, "exercise")}`
                      : ""}
                  </p>
                </>
              ) : (
                <p className={styles.nextSub}>Every chapter on this path is ticked off.</p>
              )}
            </StageCard>
            <StageCard
              as="aside"
              aria-label={`${topic.name} ${level.name} path in numbers`}
              rot={3}
              depth={16}
              i={2}
              className={styles.facts}
            >
              <Facts
                items={[
                  { value: chaptersLeft, label: chaptersLeft === 1 ? "chapter left" : "chapters left" },
                  { value: formatSpan(totalMinutes), label: "of reading" },
                  {
                    value: levelExerciseList.length,
                    label: levelExerciseList.length === 1 ? "exercise" : "exercises",
                  },
                ]}
              />
            </StageCard>
            <Note arrow="dr" rot={-4} depth={14} className={styles.pathNote}>
              tick them off as you read
            </Note>
            <Sticker rot={-6} depth={20} tone="success" className={styles.pathSticker}>
              {chaptersLeft === 0 && chapters.length > 0 ? "★ path complete" : "⚑ you are here"}
            </Sticker>
          </Stage>
        </Scene>

        <Band
          no="01"
          id="steps-title"
          label="The way"
          title="The order I'd read them in"
          sub={`About ${formatSpan(totalMinutes)} of reading. Tick off what you've read, it is remembered on this device.`}
          subId="path-note"
          count={plural(chapters.length, "chapter")}
        >
          <Journey count={entries.length} slot={170} walked={walked} label="The reading path" id="steps">
            {entries.map((entry, i) => {
              if (!entry.ready) {
                const section = entry.section;
                return (
                  <JourneyStop key={`planned-${i}`} state="soon">
                    <StopHead
                      code={entry.chapter?.num}
                      title={section.title}
                      sub={section.items.join(" · ")}
                      href={entry.chapter ? `${basePath}/${entry.chapter.id}` : null}
                      end={<SoonTag>coming soon</SoonTag>}
                    />
                  </JourneyStop>
                );
              }

              const chapter = entry.chapter;
              const chapterExerciseList = chapterExercises[chapter.id] ?? [];
              const chapterDone = mounted && done.has(chapter.id);
              const isNext = next?.id === chapter.id;

              return (
                <JourneyStop
                  key={chapter.id}
                  id={`step-${chapter.id}`}
                  state={chapterDone ? "done" : isNext ? "next" : "todo"}
                  sticker={isNext ? "⚑ you are here" : undefined}
                  data={{ "data-step": chapter.id, "data-done": chapterDone ? "true" : "false" }}
                >
                  <StopHead
                    code={chapter.num}
                    title={chapter.title}
                    sub={chapter.subtitle}
                    href={`${basePath}/${chapter.id}`}
                  />
                  <div className={styles.stepRow}>
                    <div className={styles.tags}>
                      <span className={topicKit.chip}>{chapter.readMinutes} min read</span>
                      {chapterExerciseList.length > 0 && (
                        <span className={topicKit.chip}>{plural(chapterExerciseList.length, "exercise")}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      className={chapterDone ? `${styles.stepCheck} ${styles.stepCheckOn}` : styles.stepCheck}
                      aria-pressed={chapterDone}
                      onClick={() => progress.setChapterDone(chapter.id, !chapterDone)}
                    >
                      <span className={styles.stepCheckMark} data-role="check-mark" aria-hidden="true">
                        {chapterDone ? "✓" : ""}
                      </span>
                      {chapterDone ? "Mark as unread" : "Mark as read"}
                    </button>
                  </div>
                  {chapterExerciseList.length > 0 && (
                    <details className={styles.exerciseDetails} open={mounted && isNext}>
                      <summary>
                        {plural(chapterExerciseList.length, "exercise")}{" "}
                        <span className={styles.caret} aria-hidden="true">
                          ▾
                        </span>
                      </summary>
                      <List>{exerciseRows(chapterExerciseList, false)}</List>
                    </details>
                  )}
                </JourneyStop>
              );
            })}
          </Journey>
        </Band>

        <Band
          no="02"
          id="practice-title"
          label="Practice"
          title="Practice at this level"
          sub={
            levelExerciseList.length
              ? "Every exercise opens in the editor with tests you can run."
              : "No exercises tagged for this level yet. The ones on each chapter above still work."
          }
          count={plural(levelExerciseList.length, "exercise")}
        >
          {levelExerciseList.length > 0 && (
            <List columns id="practice-list">
              {exerciseRows(levelExerciseList, true)}
            </List>
          )}
        </Band>

        <Foot>
          <FootLink href="/">All topics</FootLink>
          <FootLink href={basePath}>{topic.name} notes</FootLink>
          <button
            type="button"
            className={topicKit.btnGhost}
            id="reset-progress"
            onClick={() => {
              if (!window.confirm("Clear every tick and solved exercise on this device?")) return;
              progress.reset();
            }}
          >
            Reset my progress
          </button>
          <p className={styles.resetNote}>Clears every chapter and exercise on this device.</p>
        </Foot>
      </TopicPage>
    </TopicFrame>
  );
}
