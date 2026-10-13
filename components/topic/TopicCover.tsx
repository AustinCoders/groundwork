"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { TopicFrame } from "@/components/topic/TopicFrame";
import { HashRedirect } from "@/components/reader/HashRedirect";
import { Copy, Scene } from "@/components/home/Stage";
import { Card, Compose } from "@/components/topic/Compose";
import {
  Actions,
  Band,
  Button,
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
import { useCoverProgress, type CoverCard } from "@/components/topic/useCoverProgress";
import type { Completion } from "@/lib/completion";
import { plural } from "@/lib/format";
import type { SeriesPart } from "@/components/chapter/types";
import type { LevelId } from "@/content/types";

export function TopicCover({
  topicId,
  topicName,
  mark,
  accent,
  basePath,
  lead,
  parts,
  cards,
  relatedRoundHref,
  relatedRoundLabel,
  curriculumNotes,
  completion,
  checkChapterIds,
  aside,
}: {
  topicId: string;
  topicName: string;
  mark: string;
  accent: string;
  basePath: string;
  lead: string;
  parts: SeriesPart<LevelId>[];
  cards: CoverCard[];
  relatedRoundHref: string | null;
  relatedRoundLabel: string | null;
  curriculumNotes: string[];
  completion?: Completion;
  checkChapterIds?: string[];
  aside?: ReactNode;
}) {
  const progress = useCoverProgress({ topicId, basePath, cards, completion, checkChapterIds });
  const { plan, written, firstReadyId, totalExercises, continueHref, continueLabel } = progress;
  const nextBand = parts.length + 1;

  return (
    <TopicFrame
      topic={{ name: topicName, href: basePath, mark, accent }}
      reading
      layout="reader"
      skip={{ label: `Skip to ${topicName}` }}
      actions={
        plan.mounted ? (
          <Link className="btn btn--primary" href={continueHref}>
            {continueLabel} →
          </Link>
        ) : undefined
      }
    >
      <HashRedirect basePath={basePath} />
      <TopicPage accent={accent} id="top">
        <Scene className={topicKit.hero}>
          <Copy>
            <Kicker mark={mark}>
              {plural(written, "chapter")} · {plural(parts.length, "level")} · {plural(totalExercises, "exercise")}
            </Kicker>
            <Heading>
              <Underlined>{topicName}</Underlined>
            </Heading>
            <Lead>{lead}</Lead>
            <Actions>
              <Button href={plan.mounted ? continueHref : `${basePath}/${firstReadyId}`}>
                {plan.mounted ? continueLabel : "Start"} <span aria-hidden="true">→</span>
              </Button>
              <Button ghost href={`/level/${topicId}`}>
                Pick your level
              </Button>
            </Actions>
            <ProgressChips progress={progress} />
          </Copy>
          <Compose live layout="stack">
            <UpNextAndBudget progress={progress} basePath={basePath} />
            {aside && (
              <Card at="c" tilt={1}>
                {aside}
              </Card>
            )}
          </Compose>
        </Scene>

        <Band
          no="01"
          id="contents-title"
          label="Contents"
          title="Every chapter, in reading order"
          sub="Start at the top or jump to what you need. Tick a chapter once you have read it."
          count={plural(written, "chapter")}
        >
          <ChapterContents
            progress={progress}
            parts={parts}
            cards={cards}
            basePath={basePath}
            completion={completion}
            checkChapterIds={checkChapterIds}
          />
        </Band>

        {totalExercises > 0 && (
          <Band
            no={String(nextBand).padStart(2, "0")}
            id="practice-title"
            label="Practice"
            title={`Practice ${topicName}`}
            sub="Every exercise opens in the editor with tests you can run."
          >
            <PracticeLinks topicId={topicId} parts={parts} cards={cards} completion={completion} />
          </Band>
        )}

        {curriculumNotes.length > 0 && (
          <Notes no={String(nextBand + (totalExercises > 0 ? 1 : 0)).padStart(2, "0")} notes={curriculumNotes} />
        )}

        <Foot>
          {relatedRoundHref && (
            <FootLink href={relatedRoundHref}>Practise this as {relatedRoundLabel} in the interview book →</FootLink>
          )}
          <FootLink href="/">Switch topic</FootLink>
        </Foot>
      </TopicPage>
    </TopicFrame>
  );
}
