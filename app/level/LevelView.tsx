"use client";

import Link from "next/link";
import { Crumbs } from "@/components/Crumbs";
import { TopicFrame } from "@/components/topic/TopicFrame";
import { Syllabus } from "@/components/Syllabus";
import { formatSpan, plural } from "@/lib/format";
import { notesHref } from "@/lib/content";
import { rememberLevel } from "@/lib/storage";
import { useLastLevel } from "@/lib/hooks";
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

  return (
    <TopicFrame
      topic={{ name: topic.name, href: basePath, mark: topic.mark, accent: topic.accent }}
      back={{ href: basePath, label: topic.name }}
      skip={{ label: "Skip to the levels" }}
    >
      <Crumbs items={[{ label: "All topics", href: "/" }, { label: topic.name }, { label: "Your level" }]} />

      <section className="sheet hero" data-fx="stagger">
        <span className="hero__kicker" id="level-kicker">
          step 1 of 2
        </span>
        <h1 id="level-title">How much {topic.name} do you already have?</h1>
        <p className="hero__lead">
          Be honest — nobody is watching. This only decides which chapters come first; every chapter stays open to you
          either way.
        </p>
      </section>

      <div className={styles.grid} id="level-grid" data-fx="stagger">
        {levels.map((level) => {
          const stat = perLevel[level.id] ?? { chapters: 0, minutes: 0, exercises: 0 };
          const isSaved = savedLevel === level.id;
          return (
            <Link
              key={level.id}
              className={styles.card}
              href={`/path?topic=${topic.id}&level=${level.id}`}
              onClick={() => rememberLevel(level.id)}
            >
              <span className={styles.cardHead}>
                <span className={styles.cardMark} aria-hidden="true">
                  {level.mark}
                </span>
                <span className={styles.cardName}>{level.name}</span>
                {isSaved && <span className={styles.cardBadge}>Your level</span>}
              </span>
              <p className={styles.cardTagline}>“{level.tagline}”</p>
              <p className={styles.cardMeta}>
                {plural(stat.chapters, "chapter")} · ~{formatSpan(stat.minutes)} · {plural(stat.exercises, "exercise")}
              </p>
              <p className={styles.cardBlurb}>{level.blurb}</p>
              <ul className={styles.cardList}>
                {level.bullets.map((b, i) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: b }} />
                ))}
              </ul>
              <span className={styles.cardCta}>Show me this path →</span>
            </Link>
          );
        })}
      </div>

      <p className="section-note" style={{ marginTop: 18 }}>
        Not sure? Start at <b>Beginner</b> — every path opens at the section people usually skip.
      </p>

      <h2 className="section-title">Full syllabus</h2>
      <p className="section-note">
        Everything each level eventually covers — ticked sections are written, the rest are still on the desk.
      </p>
      <Syllabus topic={topic} levels={levels} chapterById={chapterById} />

      <div className="sticky mint" style={{ marginTop: 22 }}>
        <span className="ttl">Three honest notes</span>
        <ul id="curriculum-notes" style={{ margin: "6px 0 0", paddingLeft: 20 }}>
          {curriculumNotes.map((note, i) => (
            <li key={i}>{note}</li>
          ))}
        </ul>
      </div>

      <footer className="site-foot">
        <Link href="/">All topics</Link>
        <Link href={basePath} id="browse-all-link">
          Browse all {topic.name} notes
        </Link>
      </footer>
    </TopicFrame>
  );
}
