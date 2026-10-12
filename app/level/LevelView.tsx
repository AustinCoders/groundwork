"use client";

import Link from "next/link";
import { useState } from "react";
import { Copy, Scene } from "@/components/home/Stage";
import { Card, Compose, Remark, Tag } from "@/components/topic/Compose";
import { TopicFrame } from "@/components/topic/TopicFrame";
import {
  Band,
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
import { Check, Checkpoint, Journey, JourneyStop, SoonTag, Station, StopHead } from "@/components/topic/Journey";
import { formatSpan, plural } from "@/lib/format";
import { levelRows } from "@/lib/levelRows";
import { notesHref } from "@/lib/topics";
import { rememberLevel } from "@/lib/storage";
import { useLastLevel, useMounted } from "@/lib/hooks";
import type { ChapterMeta, Level, Topic } from "@/content/types";
import styles from "@/components/topic/level.module.css";

export interface LevelStat {
  chapters: number;
  minutes: number;
  exercises: number;
}

export interface LevelViewProps {
  topic: Topic;
  levels: Level[];
  perLevel: Record<string, LevelStat>;
  chapterById: Record<string, ChapterMeta>;
  curriculumNotes: string[];
}

const NO_STAT: LevelStat = { chapters: 0, minutes: 0, exercises: 0 };
const PREVIEW = 4;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function LevelView({ topic, levels, perLevel, chapterById, curriculumNotes }: LevelViewProps) {
  const savedLevel = useLastLevel();
  const mounted = useMounted();
  const [picked, setPicked] = useState<string | null>(null);
  const basePath = notesHref(topic.id);
  const known = (id: string | null) => (id && levels.some((l) => l.id === id) ? id : null);
  const selected = known(picked) ?? known(savedLevel) ?? levels[0]?.id;

  const totals = levels.reduce(
    (sum, level) => {
      const stat = perLevel[level.id] ?? NO_STAT;
      return {
        chapters: sum.chapters + stat.chapters,
        minutes: sum.minutes + stat.minutes,
        exercises: sum.exercises + stat.exercises,
      };
    },
    { chapters: 0, minutes: 0, exercises: 0 }
  );

  return (
    <TopicFrame
      topic={{ name: topic.name, href: basePath, mark: topic.mark, accent: topic.accent }}
      back={{ href: basePath, label: topic.name }}
      skip={{ label: "Skip to the levels" }}
      layout="reader"
    >
      <TopicPage accent={topic.accent}>
        <Scene className={`${topicKit.hero} ${styles.pick}`}>
          <Copy>
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
            <fieldset className={`${styles.choices} ${mounted ? "" : styles.pending}`} id="level-grid">
              <legend>Pick your level</legend>
              {levels.map((level, i) => {
                const stat = perLevel[level.id] ?? NO_STAT;
                return (
                  <label key={level.id} className={styles.choice}>
                    <input
                      type="radio"
                      name="level"
                      value={level.id}
                      checked={selected === level.id}
                      onChange={() => setPicked(level.id)}
                    />
                    <span className={styles.choiceNo}>{pad(i + 1)}</span>
                    <span className={styles.choiceName}>{level.name}</span>
                    {savedLevel === level.id && <span className={styles.yours}>Your level</span>}
                    <span className={styles.choiceQuote}>&ldquo;{level.tagline}&rdquo;</span>
                    <span className={styles.choiceMeta}>
                      {plural(stat.chapters, "chapter")} · ~{formatSpan(stat.minutes)} ·{" "}
                      {plural(stat.exercises, "exercise")}
                    </span>
                  </label>
                );
              })}
            </fieldset>
          </Copy>
          <Compose live fixed layout="rail" className={`${styles.pickStage} ${mounted ? "" : styles.pending}`}>
            {levels.map((level, i) => {
              const stat = perLevel[level.id] ?? NO_STAT;
              const rows = levelRows(level, chapterById);
              const preview = rows.slice(0, PREVIEW);
              return (
                <div key={level.id} className={styles.panel} data-level={level.id}>
                  <Card at="a" tilt={-1} taped className={styles.main}>
                    {savedLevel === level.id && <Tag tone="primary">★ your level</Tag>}
                    <p className={styles.cardKicker}>
                      Part {i + 1} · {plural(rows.length, "section")}
                    </p>
                    <h2 className={styles.cardName}>{level.name}</h2>
                    <p className={styles.cardQuote}>
                      <span>&ldquo;{level.tagline}&rdquo;</span>
                    </p>
                    <p className={styles.cardChips}>
                      <span>{plural(stat.chapters, "chapter")}</span>
                      <span>~{formatSpan(stat.minutes)}</span>
                      <span>{plural(stat.exercises, "exercise")}</span>
                    </p>
                    <p className={styles.cardBlurb}>{level.blurb}</p>
                    <p className={styles.cardLabel}>It opens with</p>
                    <ol className={styles.cardChapters}>
                      {preview.map((row, k) => (
                        <li key={k}>
                          <span className={styles.chapterCode}>{row.ready ? row.chapter.num : "..."}</span>
                          <span
                            className={styles.chapterName}
                            {...(row.ready
                              ? { dangerouslySetInnerHTML: { __html: row.chapter.title } }
                              : { children: row.section.title })}
                          />
                          <span className={styles.chapterMin}>
                            {row.ready ? `${row.chapter.readMinutes} min` : "soon"}
                          </span>
                        </li>
                      ))}
                    </ol>
                    {rows.length > PREVIEW && (
                      <p className={styles.more}>and {rows.length - PREVIEW} more stops below</p>
                    )}
                    <div className={styles.goRow}>
                      <Link
                        className={topicKit.btn}
                        href={`/path/${topic.id}/${level.id}`}
                        prefetch={false}
                        onClick={() => rememberLevel(level.id)}
                      >
                        Show me this path <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                    <Remark>not sure? start at Beginner</Remark>
                  </Card>
                  <Card at="c" tone="note" tilt={1} className={styles.who}>
                    <p className={styles.cardKicker}>This is you if</p>
                    <ul className={styles.whoList}>
                      {level.bullets.map((b, k) => (
                        <li key={k} dangerouslySetInnerHTML={{ __html: b }} />
                      ))}
                    </ul>
                  </Card>
                </div>
              );
            })}
            <Card as="aside" aria-label={`${topic.name} in numbers`} at="b" tilt={1} className={styles.facts}>
              <Facts
                items={[
                  { value: totals.chapters, label: totals.chapters === 1 ? "chapter written" : "chapters written" },
                  { value: formatSpan(totals.minutes), label: "of reading" },
                  { value: totals.exercises, label: totals.exercises === 1 ? "exercise" : "exercises" },
                ]}
              />
            </Card>
          </Compose>
        </Scene>

        <Band
          no="02"
          id="syllabus-title"
          label="Full syllabus"
          title="Every stop on the way"
          sub="Everything each level eventually covers. Flags with a tick are written, the dashed ones are still on the desk."
          count={plural(totals.chapters, "chapter")}
        >
          <div id="syllabus">
            {levels.map((level, index) => {
              const rows = levelRows(level, chapterById);
              const written = rows.filter((r) => r.ready).length;
              return (
                <div key={level.id} className={topicKit.level}>
                  <Station
                    no={pad(index + 1)}
                    name={level.name}
                    id={`station-${level.id}`}
                    quote={level.tagline}
                    mark={savedLevel === level.id ? "Your level" : undefined}
                    chips={[`${written} / ${rows.length} sections written`]}
                  />
                  <Journey count={rows.length} slot={76} label={`${level.name}: every section`}>
                    {rows.map((row, i) => (
                      <JourneyStop
                        key={row.ready ? row.chapter.id : row.section.title + i}
                        state={row.ready ? "done" : "soon"}
                      >
                        {row.ready ? (
                          <StopHead
                            code={row.chapter.num}
                            title={row.chapter.title}
                            rawTitle
                            sub={row.chapter.subtitle}
                            rawSub
                            href={`${basePath}/${row.chapter.id}`}
                            end={<Check />}
                          />
                        ) : (
                          <StopHead
                            code={row.chapter?.num}
                            title={row.section.title}
                            sub={row.section.items.join(" · ")}
                            href={row.chapter ? `${basePath}/${row.chapter.id}` : null}
                            end={<SoonTag />}
                          />
                        )}
                      </JourneyStop>
                    ))}
                  </Journey>
                  {level.checkpoint && <Checkpoint>{level.checkpoint}</Checkpoint>}
                </div>
              );
            })}
          </div>
        </Band>

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
