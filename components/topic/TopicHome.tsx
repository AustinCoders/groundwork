"use client";

import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import { Copy, Scene } from "@/components/home/Stage";
import { Card, Compose, Remark } from "@/components/topic/Compose";
import { HashRedirect } from "@/components/reader/HashRedirect";
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
  Notes,
  TopicPage,
  Underlined,
  topicKit,
} from "@/components/topic/TopicKit";
import { ChapterContents, PracticeLinks, ProgressChips, UpNextAndBudget } from "@/components/topic/CoverParts";
import { LevelPicker, levelTotals, type LevelStat } from "@/components/topic/LevelPicker";
import { LevelSyllabus } from "@/components/topic/LevelSyllabus";
import { useCoverProgress, type CoverCard } from "@/components/topic/useCoverProgress";
import { PlacementAside } from "@/components/placement/PlacementAside";
import { PlacementDoors } from "@/components/placement/PlacementDoors";
import placement from "@/components/placement/placement.module.css";
import { compactSpan, plural } from "@/lib/format";
import { notesHref } from "@/lib/topics";
import { PICK_LEVEL_ID, type PlanData } from "@/lib/placementPlan";
import { selfPlacement } from "@/lib/placementRecord";
import { savePlacement } from "@/lib/placementStore";
import { usePlacementState } from "@/lib/usePlacementState";
import type { SeriesPart } from "@/components/chapter/types";
import type { ChapterMeta, Level, LevelId, Topic } from "@/content/types";

export interface TopicHomeProps {
  topic: Topic;
  levels: Level[];
  perLevel: Record<string, LevelStat>;
  chapterById: Record<string, ChapterMeta>;
  curriculumNotes: string[];
  parts: SeriesPart<LevelId>[];
  cards: CoverCard[];
  checkChapterIds: string[];
  placementData: PlanData;
  relatedRoundHref: string | null;
  relatedRoundLabel: string | null;
}

export function TopicHome({
  topic,
  levels,
  perLevel,
  chapterById,
  curriculumNotes,
  parts,
  cards,
  checkChapterIds,
  placementData,
  relatedRoundHref,
  relatedRoundLabel,
}: TopicHomeProps) {
  const basePath = notesHref(topic.id);
  const progress = useCoverProgress({
    topicId: topic.id,
    basePath,
    cards,
    completion: topic.completion,
    checkChapterIds,
  });
  const { plan, written, totalExercises, continueHref, continueLabel } = progress;
  const status = usePlacementState(plan.readable.map((s) => s.id));
  const firstTime = !status.mounted || status.firstTime;

  useEffect(() => {
    if (!status.mounted) return;
    const id = window.location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView();
  }, [status.mounted]);
  const savedLevel = status.placement?.level ?? null;
  const totals = levelTotals(levels, perLevel);
  const heroClass = `${topicKit.hero} ${status.mounted ? "" : placement.pending}`;
  const kicker = `${plural(written, "chapter")} · ${plural(parts.length, "level")} · ${plural(totalExercises, "exercise")}`;

  const picker = (intro: ReactNode, hero: boolean) => (
    <LevelPicker
      topic={topic}
      levels={levels}
      perLevel={perLevel}
      chapterById={chapterById}
      savedLevel={savedLevel}
      hero={hero}
      intro={intro}
      onShowPath={(levelId) => {
        if (status.firstTime) savePlacement(selfPlacement(levelId, placementData.chapters, Date.now()));
      }}
    />
  );

  const order = firstTime ? ["picker", "chapters", "practice"] : ["chapters", "practice", "picker"];
  const present = order.filter((band) => band !== "practice" || totalExercises > 0);
  const no = (band: string) => String(present.indexOf(band) + 1).padStart(2, "0");
  const after = (offset: number) => String(present.length + offset).padStart(2, "0");

  const bands: Record<string, ReactNode> = {
    picker: (
      <Band
        key="picker"
        no={no("picker")}
        id="pick-title"
        sectionId={PICK_LEVEL_ID}
        label={firstTime ? "Or pick a level" : "Change level"}
        title={firstTime ? "Choose where you are" : "Pick a different level"}
        sub={
          firstTime
            ? "Pick the level that sounds like you and see its path. Every chapter stays open either way."
            : "Your ticks and your plan stay as they are. This only shows you another level's path."
        }
      >
        {picker(null, false)}
      </Band>
    ),
    chapters: (
      <Band
        key="chapters"
        no={no("chapters")}
        id="contents-title"
        sectionId="chapters"
        label="Chapters"
        title="Every chapter, in reading order"
        sub="Start at the top or jump to what you need. Tick a chapter once you have read it."
        count={plural(cards.length, "chapter")}
      >
        <ChapterContents
          progress={progress}
          parts={parts}
          cards={cards}
          basePath={basePath}
          completion={topic.completion}
          checkChapterIds={checkChapterIds}
        />
      </Band>
    ),
    practice: (
      <Band
        key="practice"
        no={no("practice")}
        id="practice-title"
        label="Practice"
        title={`Practice ${topic.name}`}
        sub="Every exercise opens in the editor with tests you can run."
      >
        <PracticeLinks topicId={topic.id} parts={parts} cards={cards} />
      </Band>
    ),
  };

  return (
    <TopicFrame
      topic={{ name: topic.name, href: `/level/${topic.id}`, mark: topic.mark, accent: topic.accent }}
      reading
      layout="reader"
      skip={{ label: `Skip to ${topic.name}` }}
      actions={
        plan.mounted && !firstTime ? (
          <Link className="btn btn--primary" href={continueHref}>
            {continueLabel} →
          </Link>
        ) : undefined
      }
    >
      <HashRedirect basePath={basePath} />
      <TopicPage accent={topic.accent} id="top">
        {firstTime ? (
          <Scene className={heroClass}>
            <Copy>
              <Kicker mark={topic.mark}>{kicker}</Kicker>
              <Heading id="level-title">
                Where do you start with <Underlined>{topic.name}</Underlined>?
              </Heading>
              <Lead>
                Be honest, nobody is watching. This only decides which chapters come first. Every chapter stays open to
                you either way.
              </Lead>
              <PlacementDoors
                data={placementData}
                basePath={basePath}
                pickHref={`#${PICK_LEVEL_ID}`}
                labelledBy="level-title"
              />
            </Copy>
            <Compose live layout="stack">
              <Card at="a" tilt={-1} taped>
                <Facts
                  items={[
                    { value: totals.chapters, label: totals.chapters === 1 ? "chapter written" : "chapters written" },
                    { value: compactSpan(totals.minutes), label: "of reading" },
                    { value: totals.exercises, label: totals.exercises === 1 ? "exercise" : "exercises" },
                  ]}
                />
              </Card>
              <Card at="b" tone="note" tilt={1}>
                <p className={placement.cardKicker}>Nothing is locked</p>
                <ul className={placement.bullets}>
                  <li>Every chapter is open to you, whatever you choose.</li>
                  <li>A placement is about 10 minutes, no timer, and it never changes a tick.</li>
                  <li>You can change your level any time from this page.</li>
                </ul>
                <Remark>no wrong door</Remark>
              </Card>
            </Compose>
          </Scene>
        ) : (
          <Scene className={heroClass}>
            <Copy>
              <Kicker mark={topic.mark}>{kicker}</Kicker>
              <Heading>
                <Underlined>{topic.name}</Underlined>
              </Heading>
              <Lead>
                Pick up where you left off. Your next chapter, your plan and every chapter&apos;s check state are here,
                and you can change your level any time.
              </Lead>
              <Actions>
                <Button href={continueHref}>
                  {continueLabel} <span aria-hidden="true">→</span>
                </Button>
                <Button ghost href={`#${PICK_LEVEL_ID}`}>
                  Change level
                </Button>
              </Actions>
              <ProgressChips progress={progress} />
            </Copy>
            <Compose live layout="stack">
              <UpNextAndBudget progress={progress} basePath={basePath} />
              <PlacementAside
                data={placementData}
                basePath={basePath}
                state={status}
                next={plan.next}
                readCount={plan.readCount}
              />
            </Compose>
          </Scene>
        )}

        {present.map((band) => bands[band])}

        <LevelSyllabus
          no={after(1)}
          basePath={basePath}
          levels={levels}
          chapterById={chapterById}
          savedLevel={savedLevel}
          chapterCount={totals.chapters}
        />

        <Notes no={after(2)} notes={curriculumNotes} />

        <Foot>
          {relatedRoundHref && (
            <FootLink href={relatedRoundHref}>Practise this as {relatedRoundLabel} in the interview book →</FootLink>
          )}
          <FootLink href="/">All topics</FootLink>
        </Foot>
      </TopicPage>
    </TopicFrame>
  );
}
