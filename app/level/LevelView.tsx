"use client";

import { TopicFrame } from "@/components/topic/TopicFrame";
import { Foot, FootLink, Heading, Kicker, Lead, Notes, TopicPage, Underlined } from "@/components/topic/TopicKit";
import { LevelPicker, levelTotals, type LevelStat } from "@/components/topic/LevelPicker";
import { LevelSyllabus } from "@/components/topic/LevelSyllabus";
import { notesHref } from "@/lib/topics";
import { rememberLevel } from "@/lib/storage";
import { useLastLevel } from "@/lib/hooks";
import type { ChapterMeta, Level, Topic } from "@/content/types";

export type { LevelStat };

export interface LevelViewProps {
  topic: Topic;
  levels: Level[];
  perLevel: Record<string, LevelStat>;
  chapterById: Record<string, ChapterMeta>;
  curriculumNotes: string[];
}

export function LevelView({ topic, levels, perLevel, chapterById, curriculumNotes }: LevelViewProps) {
  const savedLevel = useLastLevel();
  const basePath = notesHref(topic.id);
  const totals = levelTotals(levels, perLevel);

  return (
    <TopicFrame
      topic={{ name: topic.name, href: basePath, mark: topic.mark, accent: topic.accent }}
      back={{ href: basePath, label: topic.name }}
      skip={{ label: "Skip to the levels" }}
      layout="reader"
    >
      <TopicPage accent={topic.accent}>
        <LevelPicker
          topic={topic}
          levels={levels}
          perLevel={perLevel}
          chapterById={chapterById}
          savedLevel={savedLevel}
          onShowPath={rememberLevel}
          intro={
            <>
              <Kicker mark={topic.mark} id="level-kicker">
                Step 1 of 2
              </Kicker>
              <Heading id="level-title">
                How much <Underlined>{topic.name}</Underlined> do you already have?
              </Heading>
              <Lead>
                Be honest, nobody is watching. This only decides which chapters come first. Every chapter stays open to
                you either way.
              </Lead>
            </>
          }
        />

        <LevelSyllabus
          no="02"
          basePath={basePath}
          levels={levels}
          chapterById={chapterById}
          savedLevel={savedLevel}
          chapterCount={totals.chapters}
        />

        <Notes no="03" notes={curriculumNotes} />

        <Foot>
          <FootLink href="/">All topics</FootLink>
          <FootLink href={basePath} id="browse-all-link">
            Browse all {topic.name} notes
          </FootLink>
        </Foot>
      </TopicPage>
    </TopicFrame>
  );
}
