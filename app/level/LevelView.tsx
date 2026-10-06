"use client";

import Link from "next/link";
import { TopicFrame } from "@/components/topic/TopicFrame";
import { Syllabus } from "@/components/Syllabus";
import { formatSpan, plural } from "@/lib/format";
import { notesHref } from "@/lib/topics";
import { rememberLevel } from "@/lib/storage";
import { useLastLevel } from "@/lib/hooks";
import { accentVar } from "@/lib/accent";
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

export function LevelView({ topic, levels, perLevel, chapterById, curriculumNotes }: LevelViewProps) {
  const savedLevel = useLastLevel();
  const basePath = notesHref(topic.id);

  const totals = levels.reduce(
    (sum, level) => {
      const stat = perLevel[level.id] ?? { chapters: 0, minutes: 0, exercises: 0 };
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
    >
      <div className={styles.page} style={{ "--accent": accentVar(topic.accent) } as React.CSSProperties}>
        <div className={styles.heroRow} data-fx="stagger">
          <section className={styles.hero}>
            <p className={styles.kicker} id="level-kicker">
              <span className={styles.kickerMark} aria-hidden="true">
                {topic.mark}
              </span>
              Step 1 of 2
            </p>
            <h1 className={styles.title} id="level-title">
              How much {topic.name} do you already have?
            </h1>
            <p className={styles.lead}>
              Be honest — nobody is watching. This only decides which chapters come first; every chapter stays open to
              you either way.
            </p>
            <p className={styles.heroNote}>
              Not sure? Start at <b>Beginner</b> — every path opens at the section people usually skip.
            </p>
          </section>

          <aside className={styles.statPanel} aria-label={`${topic.name} in numbers`}>
            <div className={styles.statRow}>
              <span className={styles.statNum}>{totals.chapters}</span>
              <span className={styles.statLabel}>{plural(totals.chapters, "chapter")} written</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statNum}>{formatSpan(totals.minutes)}</span>
              <span className={styles.statLabel}>of reading, all levels</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statNum}>{totals.exercises}</span>
              <span className={styles.statLabel}>{plural(totals.exercises, "exercise")} to practice</span>
            </div>
          </aside>
        </div>

        <div className={styles.path} id="level-grid" data-fx="up">
          {levels.map((level) => {
            const stat = perLevel[level.id] ?? { chapters: 0, minutes: 0, exercises: 0 };
            const isSaved = savedLevel === level.id;
            return (
              <div key={level.id} className={styles.step}>
                <span className={styles.stepNode} aria-hidden="true">
                  {level.mark}
                </span>
                <Link
                  className={styles.card}
                  href={`/path/${topic.id}/${level.id}`}
                  onClick={() => rememberLevel(level.id)}
                >
                  <span className={styles.cardHead}>
                    <span className={styles.cardName}>{level.name}</span>
                    {isSaved && <span className={styles.cardBadge}>Your level</span>}
                  </span>
                  <p className={styles.cardTagline}>“{level.tagline}”</p>
                  <p className={styles.cardMeta}>
                    {plural(stat.chapters, "chapter")} · ~{formatSpan(stat.minutes)} ·{" "}
                    {plural(stat.exercises, "exercise")}
                  </p>
                  <p className={styles.cardBlurb}>{level.blurb}</p>
                  <ul className={styles.cardList}>
                    {level.bullets.map((b, i) => (
                      <li key={i} dangerouslySetInnerHTML={{ __html: b }} />
                    ))}
                  </ul>
                  <span className={styles.cardCta}>Show me this path →</span>
                </Link>
              </div>
            );
          })}
        </div>

        <div className={styles.sectionHead} data-fx="up">
          <h2 className={styles.sectionTitle}>Full syllabus</h2>
          <p className={styles.sectionNote}>
            Everything each level eventually covers — ticked sections are written, the rest are still on the desk.
          </p>
        </div>
        <Syllabus topic={topic} levels={levels} chapterById={chapterById} />

        <div className={`sticky mint ${styles.notes}`}>
          <span className="ttl">Three honest notes</span>
          <ul id="curriculum-notes" style={{ margin: "6px 0 0", paddingLeft: 20 }}>
            {curriculumNotes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </div>

        <footer className={styles.footer}>
          <Link href="/">All topics</Link>
          <Link href={basePath} id="browse-all-link">
            Browse all {topic.name} notes
          </Link>
        </footer>
      </div>
    </TopicFrame>
  );
}
