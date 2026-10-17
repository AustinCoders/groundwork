"use client";

import Link from "next/link";
import { useMemo } from "react";
import { PageFrame } from "@/components/frame/PageFrame";
import {
  Band,
  Foot,
  FootLink,
  Heading,
  Kicker,
  Lead,
  ProgressMeter,
  TopicPage,
  Underlined,
  Wrap,
  topicKit,
} from "@/components/topic/TopicKit";
import { accentVar } from "@/lib/accent";
import { formatSpan, plural } from "@/lib/format";
import type { Roadmap } from "@/lib/roadmap";
import { roadmapProgress } from "./roadmapModel";
import { useDone } from "./useDone";
import styles from "./roadmap.module.css";

const LINKS = [
  { href: "/roadmap", label: "Roadmaps" },
  { href: "/progress", label: "Progress" },
];

function Goal({ roadmap, loaded, done }: { roadmap: Roadmap; loaded: boolean; done: ReadonlySet<string> }) {
  const progress = useMemo(() => roadmapProgress(roadmap, done), [roadmap, done]);
  const { totals } = roadmap;
  return (
    <li className={styles.goal} style={{ "--accent": accentVar(roadmap.accent) } as React.CSSProperties}>
      <h3 className={styles.goalTitle}>
        <Link href={`/roadmap/${roadmap.id}`} prefetch={false}>
          {roadmap.title}
        </Link>
      </h3>
      <p className={styles.goalTagline}>{roadmap.tagline}</p>
      <p className={styles.goalPain}>{roadmap.pain}</p>
      <p className={styles.goalMeta}>
        {plural(totals.steps, "step")} in {plural(roadmap.stages.length, "stage")} · {totals.written} you can read today
        · {formatSpan(totals.minutes)} of reading
      </p>
      <div className={loaded ? undefined : topicKit.pending}>
        <ProgressMeter
          done={progress.stepsDone}
          total={progress.stepsReadable}
          label={`${progress.stepsDone} of ${progress.stepsReadable} steps done`}
        />
      </div>
    </li>
  );
}

export function RoadmapHub({ roadmaps }: { roadmaps: Roadmap[] }) {
  const { done, loaded } = useDone();
  return (
    <PageFrame
      title="Roadmaps"
      mark="⌖"
      accent="blue"
      layout="reader"
      links={LINKS}
      skipLabel="Skip to the roadmaps"
      scan={roadmaps.length}
    >
      <TopicPage accent="blue">
        <Wrap className={styles.hero}>
          <Kicker mark="⌖">Roadmaps · saved in this browser</Kicker>
          <Heading id="roadmaps-title">
            Pick where you are going. <Underlined>We show the way.</Underlined>
          </Heading>
          <Lead>
            Each roadmap is an ordered route through the chapters and interview rounds on this site. Every number comes
            from what is actually written, and your progress is marked on the route as you read.
          </Lead>
        </Wrap>
        <Band
          no="01"
          id="goals-h"
          sectionId="goals"
          label="Pick a path"
          title="Where do you want to get to?"
          sub="Open one to see every stage, what is ready to read and what is still an outline."
          count={plural(roadmaps.length, "roadmap")}
        >
          <ul className={styles.goals} aria-label="Roadmaps">
            {roadmaps.map((entry) => (
              <Goal key={entry.id} roadmap={entry} loaded={loaded} done={done} />
            ))}
          </ul>
          <p className={styles.honest}>
            A step marked <b>Not written yet</b> is planned but has no chapters. It stays on the map so the whole route
            is visible, and it does not count toward your progress until it is written.
          </p>
        </Band>
        <Wrap>
          <Foot>
            <FootLink href="/progress">Your progress</FootLink>
            <FootLink href="/interview">Interview book</FootLink>
            <FootLink href="/">All topics</FootLink>
          </Foot>
        </Wrap>
      </TopicPage>
    </PageFrame>
  );
}
