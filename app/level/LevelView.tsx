"use client";

import Link from "next/link";
import { Crumbs } from "@/components/Crumbs";
import { Shell } from "@/components/Shell";
import { Syllabus } from "@/components/Syllabus";
import { plural } from "@/lib/format";
import { rememberLevel } from "@/lib/storage";
import type { ChapterMeta, Level, Topic } from "@/content/types";

export interface LevelStat {
  chapters: number;
  minutes: number;
  exercises: number;
}

export interface LevelViewProps {
  topic: Topic;
  levels: Level[];
  notesHref: string;
  perLevel: Record<string, LevelStat>;
  chapterById: Record<string, ChapterMeta>;
  curriculumNotes: string[];
  progressChapters: { id: string; short: string }[];
}

export function LevelView({
  topic,
  levels,
  notesHref,
  perLevel,
  chapterById,
  curriculumNotes,
  progressChapters,
}: LevelViewProps) {
  return (
    <Shell skipLabel="Skip to the levels" topicId={topic.id} progressChapters={progressChapters}>
      <Crumbs items={[{ label: "All topics", href: "/" }, { label: topic.name }, { label: "Your level" }]} />

      <section className="sheet hero">
        <span className="hero__kicker" id="level-kicker">
          step 1 of 2
        </span>
        <h1 id="level-title">How much {topic.name} do you already have?</h1>
        <p className="hero__lead">
          Be honest — nobody is watching. This only decides which chapters come first; every chapter stays open to you
          either way.
        </p>
      </section>

      <div className="level-grid" id="level-grid">
        {levels.map((level) => {
          const stat = perLevel[level.id] ?? { chapters: 0, minutes: 0, exercises: 0 };
          return (
            <Link
              key={level.id}
              className="level"
              href={`/path?topic=${topic.id}&level=${level.id}`}
              onClick={() => rememberLevel(level.id)}
            >
              <span className="level__mark" aria-hidden="true">
                {level.mark}
              </span>
              <span className="level__name">{level.name}</span>
              <p className="level__tagline">“{level.tagline}”</p>
              <p className="level__meta">
                {plural(stat.chapters, "chapter")} · ~{stat.minutes} min · {plural(stat.exercises, "exercise")}
              </p>
              <p className="level__blurb">{level.blurb}</p>
              <ul className="level__list">
                {level.bullets.map((b, i) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: b }} />
                ))}
              </ul>
              <span className="level__cta">Show me this path →</span>
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
        <Link href={notesHref} id="browse-all-link">
          Browse all {topic.name} notes
        </Link>
      </footer>
    </Shell>
  );
}
