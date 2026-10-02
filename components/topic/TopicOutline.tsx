import Link from "next/link";
import { TopicFrame } from "@/components/topic/TopicFrame";
import { HashRedirect } from "@/components/reader/HashRedirect";
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
  relatedHref: string;
  relatedLabel: string;
  relatedRoundHref: string | null;
  relatedRoundLabel: string | null;
  curriculumNotes: string[];
}) {
  return (
    <TopicFrame topic={{ name: topicName, href: basePath, mark, accent }} skip={{ label: `Skip to ${topicName}` }}>
      <HashRedirect basePath={basePath} />
      <div className={styles.page} id="top">
        <section className={styles.hero} data-fx="stagger">
          <p className={styles.kicker}>
            {written} of {plural(planned, "chapter")} written · {plural(levels.length, "level")} planned
          </p>
          <h1 className={styles.title}>{topicName}</h1>
          {tagline && <p className={styles.tagline}>{tagline}</p>}
          <span className={styles.pill}>Not written yet</span>
          {blurb && <p className={styles.lead}>{blurb}</p>}
        </section>

        <div className={styles.parts} data-fx="up">
          {levels.map((level, i) => (
            <section key={level.id} aria-labelledby={`part-${level.id}`}>
              <div className={styles.partHead}>
                <span className={styles.partNum}>Part {i + 1}</span>
                <h2 id={`part-${level.id}`}>{level.name}</h2>
                {level.tagline && <p className={styles.partQuote}>&ldquo;{level.tagline}&rdquo;</p>}
                {level.blurb && <p>{level.blurb}</p>}
              </div>
              <ol className={styles.cards}>
                {level.sections.map((section, si) =>
                  section.href ? (
                    <li key={si}>
                      <Link className={styles.card} href={section.href}>
                        {section.num && <span className={styles.cardNum}>{section.num}</span>}
                        <span className={styles.cardTitle}>{section.title}</span>
                      </Link>
                    </li>
                  ) : (
                    <li key={si}>
                      <span className={styles.card}>
                        <span className={styles.cardTitle}>{section.title}</span>
                      </span>
                    </li>
                  )
                )}
              </ol>
            </section>
          ))}
        </div>

        <section className={styles.meanwhile} aria-label="Meanwhile">
          <p className={styles.meanwhileKicker}>Meanwhile</p>
          <Link className={styles.meanwhileLink} href={relatedHref}>
            {relatedLabel} is written — start there
          </Link>
          {relatedRoundHref && relatedRoundLabel && (
            <Link className={styles.meanwhileLink} href={relatedRoundHref}>
              {relatedRoundLabel} covers this in the interview book
            </Link>
          )}
        </section>

        {curriculumNotes.length > 0 && (
          <div className={`sticky mint ${styles.notes}`}>
            <span className="ttl">Three honest notes</span>
            <ul>
              {curriculumNotes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </div>
        )}

        <footer className={styles.footer}>
          <Link href="/">Switch topic</Link>
        </footer>
      </div>
    </TopicFrame>
  );
}
