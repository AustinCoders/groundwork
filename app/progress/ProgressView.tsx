"use client";

import { useEffect, useMemo, useState } from "react";
import { PageFrame } from "@/components/frame/PageFrame";
import { Confetti } from "@/components/practice/Confetti";
import { Foot, FootLink, TopicPage } from "@/components/topic/TopicKit";
import { continueCard } from "@/lib/continueCard";
import { computeStats, earnedBadges, recentActivity, type Stats } from "@/lib/gamification";
import { useClientValue, useProgressValue } from "@/lib/hooks";
import { useConfidence } from "@/lib/interviewConfidence";
import { plural } from "@/lib/format";
import { progress } from "@/lib/storage";
import { readResume, type Resume } from "@/lib/resume";
import { useGuidesNav, useTopicsNav } from "@/lib/topicNav";
import { ActivityBand, BadgesBand, InterviewBand, JokeNote, NextBand, TopicsBand } from "./ProgressBands";
import { ProgressHero, type HeroAction } from "./ProgressHero";
import {
  badgeWall,
  confidenceCounts,
  DEFAULT_STATS,
  HEATMAP_DAYS,
  keepGoingWith,
  nextBadge,
  nextSteps,
  topicRows,
  type DayCount,
  type TopicTrack,
} from "./progressModel";

export type { TopicTrack } from "./progressModel";

const LINKS = [
  { href: "/review", label: "Review" },
  { href: "/progress", label: "Progress" },
];

const LAST_SEEN_LEVEL_KEY = "jsnotes:last-seen-level";

function useLevelUp(level: number): boolean {
  const [celebrate, setCelebrate] = useState(false);
  useEffect(() => {
    if (level <= 1) return;
    let last = 1;
    try {
      last = Number(localStorage.getItem(LAST_SEEN_LEVEL_KEY) || "1");
      if (level !== last) localStorage.setItem(LAST_SEEN_LEVEL_KEY, String(level));
    } catch {
      return;
    }
    if (level > last) {
      const t = setTimeout(() => setCelebrate(true), 0);
      return () => clearTimeout(t);
    }
  }, [level]);
  return celebrate;
}

function useActivity(): DayCount[] {
  const key = useProgressValue(() => JSON.stringify(recentActivity(HEATMAP_DAYS)), "");
  return useMemo(() => (key ? JSON.parse(key) : []) as DayCount[], [key]);
}

function useSavedResume(): Resume | null {
  const key = useClientValue(() => JSON.stringify(readResume()), "");
  return useMemo(() => (key ? (JSON.parse(key) as Resume | null) : null), [key]);
}

export function ProgressView({ tracks }: { tracks: TopicTrack[] }) {
  const statsKey = useProgressValue(() => JSON.stringify(computeStats()), "");
  const stats = useMemo(() => (statsKey ? (JSON.parse(statsKey) as Stats) : DEFAULT_STATS), [statsKey]);
  const doneKey = useProgressValue(() => Object.keys(progress.all().chapters).join(","), "");
  const done = useMemo(() => new Set(doneKey ? doneKey.split(",") : []), [doneKey]);
  const dueCount = useProgressValue(() => progress.dueForReview(Object.keys(progress.all().chapters)).length, 0);
  const days = useActivity();
  const conf = useConfidence();
  const leveledUp = useLevelUp(stats.level);
  const resume = useSavedResume();
  const guides = useGuidesNav();
  const topics = useTopicsNav().filter((t) => !guides.some((g) => g.id === t.id));
  const loaded = statsKey !== "";

  const earned = useMemo(() => new Set(earnedBadges(stats).map((b) => b.id)), [stats]);
  const wall = useMemo(() => badgeWall(earned), [earned]);
  const next = useMemo(() => nextBadge(stats, earned), [stats, earned]);
  const counts = useMemo(() => confidenceCounts(conf), [conf]);
  const rows = useMemo(() => topicRows(tracks, done), [tracks, done]);
  const topicOnly = rows.filter((t) => t.id !== "interview");
  const book = rows.find((t) => t.id === "interview");
  const steps = useMemo(() => nextSteps(dueCount, keepGoingWith(rows), counts), [dueCount, rows, counts]);

  const card = continueCard(resume, topics, guides);
  const primary: HeroAction | null = card
    ? card.kind === "resume"
      ? { href: card.href, label: "Continue where you stopped" }
      : { href: card.href, label: `Start ${card.name}` }
    : { href: "/", label: "Pick a topic" };
  const secondary: HeroAction = {
    href: "/review",
    label: dueCount > 0 ? `${plural(dueCount, "chapter")} to review` : "Open review",
  };

  return (
    <PageFrame
      title="Progress"
      mark="▤"
      accent="blue"
      layout="reader"
      links={LINKS}
      skipLabel="Skip to your progress"
      scan={statsKey.length}
    >
      <Confetti fire={leveledUp} />
      <TopicPage accent="blue">
        <ProgressHero
          loaded={loaded}
          stats={stats}
          leveledUp={leveledUp}
          earned={earned.size}
          badge={next}
          primary={primary}
          secondary={secondary}
        />
        <NextBand no="01" loaded={loaded} steps={steps} />
        <ActivityBand no="02" loaded={loaded} days={days} />
        <TopicsBand no="03" loaded={loaded} rows={topicOnly} />
        <InterviewBand
          no="04"
          loaded={loaded}
          rounds={{ n: book?.n ?? 0, total: book?.ids.length ?? 0 }}
          counts={counts}
        />
        <BadgesBand no="05" loaded={loaded} stats={stats} wall={wall} earned={earned} next={next} />
        <JokeNote />
        <Foot>
          <FootLink href="/review">Review</FootLink>
          <FootLink href="/interview">Interview book</FootLink>
          <FootLink href="/mock">Mock interview</FootLink>
          <FootLink href="/">All topics</FootLink>
        </Foot>
      </TopicPage>
    </PageFrame>
  );
}
