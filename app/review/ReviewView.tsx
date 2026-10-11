"use client";

import { useCallback, useMemo, useState } from "react";
import { PageFrame } from "@/components/frame/PageFrame";
import { Foot, FootLink, TopicPage } from "@/components/topic/TopicKit";
import { useConfidence } from "@/lib/interviewConfidence";
import { useClientValue, useProgressValue } from "@/lib/hooks";
import { progress, type ChapterMark } from "@/lib/storage";
import { DueBand, RecentBand, ScheduleBand, SpacingBand, StartBand } from "./ReviewBands";
import { ReviewHero } from "./ReviewHero";
import { ReviewSession } from "./ReviewSession";
import { buildRows, forecast, startOfDay, thisMinute, whenLabel, type ReviewChapter } from "./reviewModel";

export type { ReviewChapter } from "./reviewModel";

const LINKS = [
  { href: "/review", label: "Review" },
  { href: "/progress", label: "Progress" },
];

const EMPTY_AGAIN: ReadonlySet<string> = new Set();

function numberAt(index: number): string {
  return String(index).padStart(2, "0");
}

export function ReviewView({ chapters }: { chapters: ReviewChapter[] }) {
  const marksKey = useProgressValue(() => JSON.stringify(progress.all().chapters), "");
  const now = useClientValue(thisMinute, 0);
  const conf = useConfidence();
  const [session, setSession] = useState(false);
  const [again, setAgain] = useState<ReadonlySet<string>>(EMPTY_AGAIN);
  const [clearedNow, setClearedNow] = useState(0);
  const loaded = marksKey !== "" && now > 0;

  const { rows, due, upcoming, kept, reviewed } = useMemo(() => {
    const marks = (marksKey ? JSON.parse(marksKey) : {}) as Record<string, true | ChapterMark>;
    return buildRows(chapters, marks, now);
  }, [marksKey, chapters, now]);

  const remember = useCallback((id: string) => {
    progress.markReviewed(id);
    setClearedNow((n) => n + 1);
    setAgain((set) => {
      if (!set.has(id)) return set;
      const next = new Set(set);
      next.delete(id);
      return next;
    });
  }, []);

  const markAgain = useCallback((id: string) => setAgain((set) => new Set(set).add(id)), []);
  const undoAgain = useCallback(
    (id: string) =>
      setAgain((set) => {
        const next = new Set(set);
        next.delete(id);
        return next;
      }),
    []
  );

  const days = useMemo(() => forecast(due.length, upcoming, now), [due.length, upcoming, now]);
  const shaky = Object.values(conf).filter((c) => c !== "knew").length;
  const read = rows.length;
  const nextRow = due[0] ?? upcoming[0] ?? null;
  const showDue = due.length > 0 || (loaded && clearedNow > 0);
  const nextDay = upcoming[0] ? whenLabel(upcoming[0].due!, now) : null;

  if (session) {
    return (
      <PageFrame
        title="Review"
        mark="↻"
        accent="blue"
        layout="reader"
        links={LINKS}
        skipLabel="Skip to the review session"
        scan="session"
      >
        <TopicPage accent="blue">
          <ReviewSession rows={due} now={startOfDay(now)} onRemember={remember} onExit={() => setSession(false)} />
        </TopicPage>
      </PageFrame>
    );
  }

  const order = [
    loaded && read === 0 && "start",
    loaded && showDue && "due",
    loaded && upcoming.length > 0 && "schedule",
    loaded && reviewed.length > 0 && "recent",
    "spacing",
  ].filter(Boolean);
  const no = (key: string) => numberAt(order.indexOf(key) + 1);

  return (
    <PageFrame
      title="Review"
      mark="↻"
      accent="blue"
      layout="reader"
      links={LINKS}
      skipLabel="Skip to the review list"
      scan={`${due.length}:${upcoming.length}`}
    >
      <TopicPage accent="blue">
        <ReviewHero
          loaded={loaded}
          now={now}
          numbers={{ due: due.length, scheduled: upcoming.length, read, kept }}
          featured={nextRow}
          nextDay={nextDay}
          shaky={shaky}
          onStart={() => setSession(true)}
        />
        {loaded && read === 0 && <StartBand no={no("start")} />}
        {loaded && showDue && (
          <DueBand
            no={no("due")}
            rows={due}
            again={again}
            clearedNow={clearedNow}
            nextRow={upcoming[0] ?? null}
            now={now}
            onRemember={remember}
            onAgain={markAgain}
            onUndo={undoAgain}
          />
        )}
        {loaded && upcoming.length > 0 && <ScheduleBand no={no("schedule")} rows={upcoming} days={days} now={now} />}
        {loaded && reviewed.length > 0 && <RecentBand no={no("recent")} rows={reviewed} now={now} />}
        <SpacingBand no={no("spacing")} />
        <Foot>
          <FootLink href="/progress">Your progress</FootLink>
          <FootLink href="/interview">Interview book</FootLink>
          <FootLink href="/mock">Mock interview</FootLink>
          <FootLink href="/">All topics</FootLink>
        </Foot>
      </TopicPage>
    </PageFrame>
  );
}
