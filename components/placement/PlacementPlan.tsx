"use client";

import { useEffect, useMemo } from "react";
import { Copy, Scene } from "@/components/home/Stage";
import { Card, Compose, Remark, Tag } from "@/components/topic/Compose";
import {
  Actions,
  Band,
  Button,
  CardKicker,
  Facts,
  Foot,
  FootLink,
  Heading,
  Kicker,
  Lead,
  List,
  Row,
  Underlined,
  topicKit,
} from "@/components/topic/TopicKit";
import { nextChapter } from "@/lib/completion";
import { plural } from "@/lib/format";
import { useProgressValue } from "@/lib/hooks";
import { levelWords, planView, readingPlan, type PlanChapter, type PlanData } from "@/lib/placementPlan";
import type { PlacementRecord } from "@/lib/placementRecord";
import { progress } from "@/lib/storage";
import { ResetPlan } from "./ResetPlan";
import styles from "./placement.module.css";

const HEADLINE = {
  quiz: (level: string) => (
    <>
      You&apos;re at <Underlined>{level}</Underlined>
    </>
  ),
  self: (level: string) => (
    <>
      You picked <Underlined>{level}</Underlined>
    </>
  ),
  beginning: () => (
    <>
      Starting <Underlined>from the beginning</Underlined>
    </>
  ),
};

function rowsFor(list: PlanChapter[], basePath: string, done: ReadonlySet<string>) {
  return list.map((chapter) => (
    <Row
      key={chapter.id}
      code={chapter.num}
      title={chapter.short}
      sub={`${chapter.minutes} min read`}
      href={`${basePath}/${chapter.id}`}
      done={done.has(chapter.id)}
    />
  ));
}

export function PlacementPlan({
  data,
  basePath,
  homeHref,
  topicName,
  record,
  fresh,
  bankNote,
  onRetake,
  onReset,
}: {
  data: PlanData;
  basePath: string;
  homeHref: string;
  topicName: string;
  record: PlacementRecord;
  fresh: boolean;
  bankNote: string | null;
  onRetake: () => void;
  onReset: () => void;
}) {
  const view = useMemo(() => planView(record, data.chapters), [record, data.chapters]);
  const readable = useMemo(() => data.chapters.filter((chapter) => chapter.ready), [data.chapters]);
  const doneKey = useProgressValue(
    () => readable.map((chapter) => (progress.isChapterDone(chapter.id) ? "1" : "0")).join(""),
    ""
  );
  const done = useMemo(
    () => new Set(readable.filter((_, at) => doneKey[at] === "1").map((chapter) => chapter.id)),
    [readable, doneKey]
  );
  const next = nextChapter("quiz", readable, done, readingPlan(record, readable), true);
  const level = levelWords(record.level, data.levelNames);
  useEffect(() => {
    if (!fresh) return;
    const heading = document.getElementById("plan-heading");
    if (!heading) return;
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }, [fresh]);

  const revise = view.reviseEarlier.length > 0 ? " Chapters below your level stay open under Revise earlier." : "";
  const lead =
    record.mode === "beginning"
      ? `Every chapter, in order, from ${view.allotted[0]?.short ?? "the first one"}. Nothing is locked.`
      : record.mode === "self"
        ? view.reviseEarlier.length > 0
          ? `Chapters from ${level} on come first. The ones before stay open under Revise earlier. Nothing is locked.`
          : `Every chapter from ${level} on is in your plan, in order. Nothing is locked.`
        : `${plural(view.allotted.length, "chapter")} to read${
            view.testedOut.length > 0 ? `, ${view.testedOut.length} tested out` : ""
          }.${revise} Nothing is locked.`;

  return (
    <>
      <Scene className={topicKit.hero}>
        <Copy>
          <Kicker mark="✓" id="plan-kicker">
            Your placement
          </Kicker>
          <Heading id="plan-heading">{HEADLINE[record.mode](level)}</Heading>
          <Lead>{lead}</Lead>
          <Actions>
            {next ? (
              <Button id="plan-continue" href={`${basePath}/${next.id}`}>
                Continue <span aria-hidden="true">→</span>
              </Button>
            ) : (
              <Button id="plan-continue" href="/review">
                Review <span aria-hidden="true">→</span>
              </Button>
            )}
            <button type="button" className={topicKit.btnGhost} id="plan-retake" onClick={onRetake}>
              Retake the placement
            </button>
          </Actions>
          <p className={styles.keepNote}>
            Saved on this device. Resetting clears only this plan: your ticks, XP and review queue stay as they are.
            {bankNote && ` ${bankNote}`}
          </p>
          <ResetPlan onReset={onReset} />
        </Copy>
        <Compose live layout="rail">
          <Card at="a" tilt={-1} taped>
            <CardKicker>Your level</CardKicker>
            <p className={styles.cardTitle}>{level}</p>
            <Facts
              items={[
                { value: view.allotted.length, label: "to read" },
                { value: view.testedOut.length, label: "tested out" },
                { value: view.reviseEarlier.length, label: "to revise earlier" },
              ]}
            />
          </Card>
          <Card at="b" tone="note" tilt={1}>
            <Tag tone="success">{next ? "⚑ you are here" : "★ plan done"}</Tag>
            <CardKicker>{next ? "Up next" : "All read"}</CardKicker>
            {next ? (
              <>
                <p className={styles.cardTitle}>{next.short}</p>
                <p className={styles.cardText}>{next.minutes} min read</p>
              </>
            ) : (
              <p className={styles.cardText}>Every chapter in the plan is ticked off.</p>
            )}
            <Remark>nothing is locked</Remark>
          </Card>
        </Compose>
      </Scene>

      <Band
        no="01"
        id="plan-list-title"
        label="The plan"
        title="Read these, in this order"
        sub="Prerequisites come first. Tick one off as you finish it."
        count={plural(view.allotted.length, "chapter")}
      >
        <List columns id="plan-list">
          {rowsFor(view.allotted, basePath, done)}
        </List>
      </Band>

      {view.testedOut.length > 0 && (
        <Band
          no="02"
          id="tested-out-title"
          label="Tested out"
          title="You already know these"
          sub="Counted as covered. They earn no XP and have no review entry, and they stay open if you want them."
          count={plural(view.testedOut.length, "chapter")}
        >
          <List columns id="tested-out-list">
            {rowsFor(view.testedOut, basePath, done)}
          </List>
        </Band>
      )}

      {view.reviseEarlier.length > 0 && (
        <Band
          no={view.testedOut.length > 0 ? "03" : "02"}
          id="revise-earlier-title"
          label="Revise earlier"
          title="Below your level, still open"
          sub="Read them whenever a gap shows up. Nothing here is locked."
          count={plural(view.reviseEarlier.length, "chapter")}
        >
          <List columns id="revise-earlier-list">
            {rowsFor(view.reviseEarlier, basePath, done)}
          </List>
        </Band>
      )}

      <Foot>
        <FootLink href="/">All topics</FootLink>
        <FootLink href={homeHref}>{topicName} home</FootLink>
      </Foot>
    </>
  );
}
