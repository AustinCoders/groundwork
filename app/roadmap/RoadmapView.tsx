"use client";

import Link from "next/link";
import { useMemo } from "react";
import { PageFrame } from "@/components/frame/PageFrame";
import {
  Actions,
  Band,
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
import { accentVar } from "@/lib/accent";
import { formatSpan, plural } from "@/lib/format";
import type { Roadmap, RoadmapStep } from "@/lib/roadmap";
import { roadmapProgress, statusLabel, type StepProgress } from "./roadmapModel";
import { useDone } from "./useDone";
import styles from "./roadmap.module.css";

const LINKS = [
  { href: "/roadmap", label: "Roadmaps" },
  { href: "/progress", label: "Progress" },
];

const pad = (n: number) => String(n).padStart(2, "0");

function stepMeta(step: RoadmapStep): string {
  if (step.written === 0) return `Outline only · ${plural(step.planned, "chapter")} planned`;
  if (step.kind === "round") return `Interview round · ${formatSpan(step.minutes)}`;
  const parts = [plural(step.written, "chapter")];
  if (step.exercises > 0) parts.push(plural(step.exercises, "exercise"));
  parts.push(formatSpan(step.minutes));
  return parts.join(" · ");
}

function StepCard({ step, progress, next }: { step: RoadmapStep; progress: StepProgress; next: boolean }) {
  return (
    <li
      className={styles.step}
      data-status={progress.status}
      data-next={next}
      style={{ "--accent": accentVar(step.accent) } as React.CSSProperties}
    >
      <div className={styles.stepHead}>
        <span className={styles.mark} aria-hidden="true">
          {step.mark}
        </span>
        <h3 className={styles.stepTitle}>
          <Link href={step.href} prefetch={false} aria-current={next ? "step" : undefined}>
            {step.title}
          </Link>
        </h3>
        {next && <span className={styles.nextTag}>Next up</span>}
      </div>
      {step.why && <p className={styles.why}>{step.why}</p>}
      <p className={styles.meta}>{stepMeta(step)}</p>
      <p className={styles.status}>{statusLabel(progress)}</p>
      {progress.status === "doing" && (
        <ProgressMeter done={progress.done} total={progress.total} label={`${progress.done} / ${progress.total}`} />
      )}
    </li>
  );
}

export function RoadmapView({ roadmap }: { roadmap: Roadmap }) {
  const { done, loaded } = useDone();
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

        {roadmap.stages.map((stage, at) => (
          <Band
            key={stage.id}
            no={pad(at + 1)}
            id={`${stage.id}-h`}
            sectionId={stage.id}
            label={stage.order === "in-order" ? "in this order" : "any order"}
            title={stage.title}
            sub={stage.blurb}
            count={plural(stage.steps.length, "step")}
          >
            <div className={loaded ? undefined : topicKit.pending}>
              <ol
                className={styles.steps}
                aria-label={`${stage.title}, ${stage.order === "in-order" ? "in this order" : "in any order"}`}
              >
                {stage.steps.map((step) => (
                  <StepCard
                    key={step.key}
                    step={step}
                    progress={progress.steps[step.key]}
                    next={start?.key === step.key}
                  />
                ))}
              </ol>
            </div>
          </Band>
        ))}

        <Wrap>
          {outlines > 0 && (
            <p className={styles.honest}>
              {plural(outlines, "step")} on this path {outlines === 1 ? "is" : "are"} marked <b>Not written yet</b>: the
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
