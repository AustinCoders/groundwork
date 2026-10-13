"use client";

import Link from "next/link";
import { useEffect, useMemo, type CSSProperties, type ReactNode } from "react";
import { Button, topicKit } from "@/components/topic/TopicKit";
import { Ring } from "@/components/topic/shell/Ring";
import { toneStyle } from "@/components/topic/shell/tone";
import type { ShellTone } from "@/components/topic/shell/types";
import { nextChapter } from "@/lib/completion";
import { plural } from "@/lib/format";
import { useProgressValue } from "@/lib/hooks";
import { levelWords, planMeaning, planView, readingPlan, type PlanChapter, type PlanData } from "@/lib/placementPlan";
import type { PlacementRecord } from "@/lib/placementRecord";
import { progress } from "@/lib/storage";
import { LEVEL_STOPS, levelStop, levelTone } from "./levelTone";
import { ResetPlan } from "./ResetPlan";
import styles from "./plan.module.css";

function headline(record: PlacementRecord, level: string): { kicker: string; name: string } {
  if (record.mode === "self") return { kicker: "You picked", name: level };
  if (record.mode === "beginning") return { kicker: "Your plan", name: "From the beginning" };
  return { kicker: "Your starting point", name: level };
}

function Row({ chapter, basePath, done }: { chapter: PlanChapter; basePath: string; done: boolean }) {
  return (
    <li className={styles.row}>
      <Link className={styles.rowLink} href={`${basePath}/${chapter.id}`} prefetch={false}>
        <span className={styles.rowCode}>{chapter.num}</span>
        <span className={styles.rowTitle}>{chapter.short}</span>
        <span className={styles.rowMeta}>{chapter.minutes} min read</span>
        {done && (
          <span className={styles.rowDone}>
            <span className="visually-hidden">Read. </span>
            <span aria-hidden="true">✓</span>
          </span>
        )}
      </Link>
    </li>
  );
}

function Group({
  titleId,
  listId,
  title,
  sub,
  count,
  tone,
  chapters,
  basePath,
  done,
}: {
  titleId: string;
  listId: string;
  title: string;
  sub: string;
  count: string;
  tone: string;
  chapters: PlanChapter[];
  basePath: string;
  done: ReadonlySet<string>;
}) {
  return (
    <section className={styles.group} aria-labelledby={titleId} style={{ "--tone": tone } as CSSProperties}>
      <header className={styles.groupHead}>
        <h2 className={styles.groupTitle} id={titleId}>
          {title}
        </h2>
        <span className={styles.groupCount}>{count}</span>
        <p className={styles.groupSub}>{sub}</p>
      </header>
      <ul className={styles.list} id={listId}>
        {chapters.map((chapter) => (
          <Row key={chapter.id} chapter={chapter} basePath={basePath} done={done.has(chapter.id)} />
        ))}
      </ul>
    </section>
  );
}

function Stat({ value, label, children }: { value: number; label: string; children?: ReactNode }) {
  return (
    <li className={styles.stat}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
      {children}
    </li>
  );
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
  const tone: ShellTone = levelTone(record.level);
  const { kicker, name } = headline(record, level);

  useEffect(() => {
    if (!fresh) return;
    const heading = document.getElementById("plan-heading");
    if (!heading) return;
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }, [fresh]);

  return (
    <div className={styles.plan}>
      <section className={styles.hero} style={toneStyle(tone)} aria-labelledby="plan-heading" data-plan-hero="">
        <div className={styles.main}>
          <div className={styles.lede}>
            <Ring read={levelStop(record.level)} total={LEVEL_STOPS} label="stops" />
            <h1 className={styles.title} id="plan-heading">
              <span className={styles.kicker}>{kicker}</span>
              <span className="visually-hidden">: </span>
              <span className={styles.name}>{name}</span>
            </h1>
          </div>
          <p className={styles.meaning}>{planMeaning(record, view, level)}</p>
          <div className={styles.actions}>
            {next ? (
              <Button id="plan-continue" href={`${basePath}/${next.id}`}>
                Continue <span aria-hidden="true">→</span>
              </Button>
            ) : (
              <Button id="plan-continue" href="/review">
                Review <span aria-hidden="true">→</span>
              </Button>
            )}
          </div>
          <div className={styles.quiet}>
            <a className={styles.quietLink} href="#plan-details">
              See the plan details
            </a>
            <button type="button" className={styles.quietLink} id="plan-retake" onClick={onRetake}>
              Retake the check
            </button>
            <ResetPlan onReset={onReset} />
          </div>
        </div>
        <aside className={styles.side} aria-label="Your plan at a glance">
          <div className={styles.upNext}>
            <p className={styles.upKicker}>{next ? "Up next" : "All read"}</p>
            {next ? (
              <>
                <p className={styles.upTitle}>
                  <span className={styles.upCode}>{next.num}</span> {next.short}
                </p>
                <p className={styles.upMeta}>{next.minutes} min read</p>
              </>
            ) : (
              <p className={styles.upMeta}>Every chapter in the plan is ticked off.</p>
            )}
          </div>
          <ul className={styles.stats}>
            <Stat value={view.allotted.length} label="to read" />
            {view.testedOut.length > 0 && <Stat value={view.testedOut.length} label="tested out" />}
            {view.reviseEarlier.length > 0 && <Stat value={view.reviseEarlier.length} label="to revise earlier" />}
          </ul>
        </aside>
        <p className={styles.saved}>
          Nothing is locked. Saved on this device: resetting clears only this plan, and your ticks, XP and review queue
          stay as they are.
          {bankNote && ` ${bankNote}`}
        </p>
      </section>

      <div className={styles.details} id="plan-details">
        <Group
          titleId="plan-list-title"
          listId="plan-list"
          title="Read these, in this order"
          sub="Prerequisites come first. Tick one off as you finish it."
          count={plural(view.allotted.length, "chapter")}
          tone={`var(--c-${tone})`}
          chapters={view.allotted}
          basePath={basePath}
          done={done}
        />
        {view.testedOut.length > 0 && (
          <Group
            titleId="tested-out-title"
            listId="tested-out-list"
            title="You already know these"
            sub="Counted as covered. They earn no XP and have no review entry, and they stay open if you want them."
            count={plural(view.testedOut.length, "chapter")}
            tone="var(--c-teal)"
            chapters={view.testedOut}
            basePath={basePath}
            done={done}
          />
        )}
        {view.reviseEarlier.length > 0 && (
          <Group
            titleId="revise-earlier-title"
            listId="revise-earlier-list"
            title="Below your level, still open"
            sub="Read them whenever a gap shows up. Nothing here is locked."
            count={plural(view.reviseEarlier.length, "chapter")}
            tone="var(--c-grey)"
            chapters={view.reviseEarlier}
            basePath={basePath}
            done={done}
          />
        )}
      </div>

      <footer className={styles.foot}>
        <Link className={topicKit.link} href="/">
          All topics
        </Link>
        <Link className={topicKit.link} href={homeHref}>
          {topicName} home
        </Link>
      </footer>
    </div>
  );
}
