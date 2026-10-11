"use client";

import Link from "next/link";
import { Copy, Note, Scene, Stage, StageCard, Tape } from "@/components/home/Stage";
import { TopicFrame } from "@/components/topic/TopicFrame";
import { HashRedirect } from "@/components/reader/HashRedirect";
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
  Tagline,
  TopicPage,
  Underlined,
  topicKit,
} from "@/components/topic/TopicKit";
import { Journey, JourneyStop, SoonTag, Station, StopHead } from "@/components/topic/Journey";
import { plural } from "@/lib/format";
import type { LevelId } from "@/content/types";
import styles from "./outline.module.css";

export interface OutlineSection {
  title: string;
  num: string | null;
  href: string | null;
}

export interface OutlineLevel {
  id: LevelId;
  name: string;
  tagline: string;
  blurb: string;
  sections: OutlineSection[];
}

const pad = (n: number) => String(n).padStart(2, "0");

export function TopicOutline({
  topicName,
  mark,
  accent,
  tagline,
  blurb,
  basePath,
  written,
  planned,
  levels,
  relatedHref,
  relatedLabel,
  relatedRoundHref,
  relatedRoundLabel,
  curriculumNotes,
}: {
  topicName: string;
  mark: string;
  accent: string;
  tagline: string;
  blurb: string;
  basePath: string;
  written: number;
  planned: number;
  levels: OutlineLevel[];
  relatedHref: string | null;
  relatedLabel: string | null;
  relatedRoundHref: string | null;
  relatedRoundLabel: string | null;
  curriculumNotes: string[];
}) {
  const planning = levels.length === 0;
  const hasMeanwhile = Boolean(relatedHref && relatedLabel);
  const bands = (planning ? 0 : 1) + (hasMeanwhile ? 1 : 0);

  return (
    <TopicFrame
      topic={{ name: topicName, href: basePath, mark, accent }}
      layout="reader"
      skip={{ label: `Skip to ${topicName}` }}
    >
      <HashRedirect basePath={basePath} />
      <TopicPage accent={accent} id="top">
        <Scene className={topicKit.hero}>
          <Copy>
            <Kicker mark={mark} dashed>
              {planning
                ? "No chapters yet"
                : `${written} of ${plural(planned, "chapter")} written · ${plural(levels.length, "level")} planned`}
            </Kicker>
            <Heading>
              <Underlined>{topicName}</Underlined>
            </Heading>
            {tagline && <Tagline>{tagline}</Tagline>}
            <p className={styles.pill}>Not written yet</p>
            {blurb && <Lead>{blurb}</Lead>}
            <Actions>
              <Button href="/#shelf">Browse written topics</Button>
            </Actions>
          </Copy>
          <Stage live hostClassName={topicKit.stageHost} className={styles.stage}>
            <StageCard rot={-1.4} depth={-8} i={0} still className={styles.draft} aria-labelledby="draft-title">
              <Tape rot={-5} />
              {planning ? (
                <>
                  <h2 className={styles.draftTitle} id="being-planned">
                    Being planned
                  </h2>
                  <p className={styles.draftText} id="draft-title">
                    No chapters are written yet for {topicName}, and its syllabus has not been set.
                  </p>
                </>
              ) : (
                <>
                  <p className={styles.cardKicker} id="draft-title">
                    The plan
                  </p>
                  <Facts
                    items={[
                      { value: planned, label: planned === 1 ? "chapter planned" : "chapters planned" },
                      { value: levels.length, label: levels.length === 1 ? "level" : "levels" },
                      { value: written, label: written === 1 ? "chapter written" : "chapters written" },
                    ]}
                  />
                </>
              )}
            </StageCard>
            <StageCard decor rot={3} depth={14} i={1} className={styles.ghost}>
              <span className={styles.ghostLine} />
              <span className={styles.ghostLine} />
              <span className={styles.ghostLine} />
            </StageCard>
            <StageCard decor rot={-2.4} depth={-12} i={2} extra className={`${styles.ghost} ${styles.ghostTwo}`}>
              <span className={styles.ghostLine} />
              <span className={styles.ghostLine} />
            </StageCard>
            <span className={`${styles.stamp} ${styles.stampSticker}`} aria-hidden="true">
              sketch only
            </span>
            <Note arrow="dr" rot={-4} depth={14} className={styles.outlineNote}>
              coming, one chapter at a time
            </Note>
          </Stage>
        </Scene>

        {!planning && (
          <Band
            no="01"
            id="plan-title"
            label="The plan"
            title="What is planned, level by level"
            sub="Every stop below is an outline for now. Open one to see what it will cover."
            count={plural(planned, "chapter")}
          >
            {levels.map((level, i) => (
              <div key={level.id} className={styles.level}>
                <Station
                  no={pad(i + 1)}
                  name={level.name}
                  id={`part-${level.id}`}
                  quote={level.tagline || undefined}
                  chips={[plural(level.sections.length, "section")]}
                />
                <Journey count={level.sections.length} slot={76} label={`${level.name}: planned sections`}>
                  {level.sections.map((section, si) => (
                    <JourneyStop key={si} state="soon">
                      <StopHead
                        code={section.num ?? undefined}
                        title={section.title}
                        href={section.href}
                        end={<SoonTag />}
                      />
                    </JourneyStop>
                  ))}
                </Journey>
              </div>
            ))}
          </Band>
        )}

        {hasMeanwhile && (
          <Band
            no={pad((planning ? 0 : 1) + 1)}
            id="meanwhile-title"
            label="Read this first"
            title="Meanwhile"
            sub="Nothing here is written yet, but these are."
          >
            <ul className={styles.signs}>
              <li>
                <Link className={styles.sign} href={relatedHref!} prefetch={false}>
                  <span className={styles.signText}>
                    <span className={styles.signTitle}>{relatedLabel} is written, start there</span>
                    <span className={styles.signSub}>The nearest topic with real chapters.</span>
                  </span>
                  <span className={styles.signArrow} aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
              {relatedRoundHref && relatedRoundLabel && (
                <li>
                  <Link className={styles.sign} href={relatedRoundHref} prefetch={false}>
                    <span className={styles.signText}>
                      <span className={styles.signTitle}>{relatedRoundLabel} covers this in the interview book</span>
                      <span className={styles.signSub}>Practise it as interview rounds.</span>
                    </span>
                    <span className={styles.signArrow} aria-hidden="true">
                      →
                    </span>
                  </Link>
                </li>
              )}
            </ul>
          </Band>
        )}

        {!planning && curriculumNotes.length > 0 && <Notes no={pad(bands + 1)} notes={curriculumNotes} />}

        <Foot>
          <FootLink href="/">Switch topic</FootLink>
        </Foot>
      </TopicPage>
    </TopicFrame>
  );
}
