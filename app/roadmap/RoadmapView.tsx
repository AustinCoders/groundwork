"use client";

import { useMemo, useState } from "react";
import { PageFrame } from "@/components/frame/PageFrame";
import {
  Actions,
  Button,
  Chips,
  Foot,
  FootLink,
  Heading,
  Kicker,
  Lead,
  ProgressMeter,
  TopicPage,
  Wrap,
  topicKit,
} from "@/components/topic/TopicKit";
import { formatSpan, plural } from "@/lib/format";
import type { Roadmap } from "@/lib/roadmap";
import { RoadmapOrbit } from "./RoadmapOrbit";
import { RoadmapRail } from "./RoadmapRail";
import { roadmapProgress } from "./roadmapModel";
import { useDone } from "./useDone";
import styles from "./roadmap.module.css";

const LINKS = [
  { href: "/roadmap", label: "Roadmaps" },
  { href: "/progress", label: "Progress" },
];

export function RoadmapView({ roadmap }: { roadmap: Roadmap }) {
  const { done, loaded } = useDone();
  const [view, setView] = useState<"hub" | "track">("hub");
  const progress = useMemo(() => roadmapProgress(roadmap, done), [roadmap, done]);
  const { totals } = roadmap;
  const start = progress.next;
  const started = start !== null && progress.steps[start.key].done > 0;
  const finished = loaded && progress.stepsReadable > 0 && progress.stepsDone === progress.stepsReadable;
  const outlines = totals.steps - totals.written;

  return (
    <PageFrame
      title={roadmap.title}
      mark="⌖"
      accent={roadmap.accent}
      layout="reader"
      links={LINKS}
      back={{ href: "/roadmap", label: "Roadmaps" }}
      skipLabel="Skip to the roadmap"
      scan={`${roadmap.id}:${progress.chaptersDone}`}
    >
      <TopicPage accent={roadmap.accent}>
        <Wrap className={styles.hero}>
          <Kicker mark="⌖">Roadmap · saved in this browser</Kicker>
          <Heading id="roadmap-title">{roadmap.tagline}</Heading>
          <Lead>{roadmap.pain}</Lead>
          <div className={loaded ? undefined : topicKit.pending}>
            <Actions>
              {start && (
                <Button href={start.href}>
                  {started ? `Continue with ${start.title}` : `Start with ${start.title}`}
                </Button>
              )}
              <Button href="/roadmap" ghost>
                All roadmaps
              </Button>
            </Actions>
            {finished && <p className={styles.goalMeta}>Every step you can read today is done.</p>}
          </div>
          <Chips>
            <span className={topicKit.chip}>{plural(totals.written, "step")} you can read today</span>
            {totals.chapters > 0 && <span className={topicKit.chip}>{plural(totals.chapters, "chapter")}</span>}
            {totals.rounds > 0 && <span className={topicKit.chip}>{plural(totals.rounds, "interview round")}</span>}
            {totals.exercises > 0 && <span className={topicKit.chip}>{plural(totals.exercises, "exercise")}</span>}
            <span className={topicKit.chip}>{formatSpan(totals.minutes)} of reading</span>
          </Chips>
          <div className={`${styles.heroMeter} ${loaded ? "" : topicKit.pending}`}>
            <ProgressMeter
              done={progress.stepsDone}
              total={progress.stepsReadable}
              label={`${progress.stepsDone} of ${progress.stepsReadable} steps done`}
            />
          </div>
        </Wrap>

        <Wrap>
          <div className={styles.views} role="group" aria-label="Choose how to see the route">
            {(
              [
                ["hub", "Hub"],
                ["track", "Track"],
              ] as const
            ).map(([id, label]) => (
              <button key={id} type="button" aria-pressed={view === id} onClick={() => setView(id)}>
                {label}
              </button>
            ))}
          </div>
          {view === "hub" ? <RoadmapOrbit roadmap={roadmap} /> : <RoadmapRail roadmap={roadmap} />}
          {outlines > 0 && (
            <p className={styles.honest}>
              {plural(outlines, "step")} on this path {outlines === 1 ? "is" : "are"} marked <b>not written yet</b>: the
              topic is planned and outlined, but has no chapters to read. They stay on the map so the whole route is
              visible; they will start counting toward your progress the day they are written.
            </p>
          )}
          <Foot>
            <FootLink href="/roadmap">All roadmaps</FootLink>
            <FootLink href="/progress">Your progress</FootLink>
            <FootLink href="/interview">Interview book</FootLink>
            <FootLink href="/">All topics</FootLink>
          </Foot>
        </Wrap>
      </TopicPage>
    </PageFrame>
  );
}
