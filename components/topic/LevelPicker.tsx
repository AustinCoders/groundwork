"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Copy, Scene } from "@/components/home/Stage";
import { Card, Compose, Remark, Tag } from "@/components/topic/Compose";
import { RevealWithoutScript } from "@/components/topic/RevealWithoutScript";
import { Facts, topicKit } from "@/components/topic/TopicKit";
import { compactSpan, formatSpan, plural } from "@/lib/format";
import { levelRows } from "@/lib/levelRows";
import { useMounted } from "@/lib/hooks";
import type { ChapterMeta, Level, LevelId, Topic } from "@/content/types";
import styles from "./level.module.css";

export interface LevelStat {
  chapters: number;
  minutes: number;
  exercises: number;
}

export const NO_STAT: LevelStat = { chapters: 0, minutes: 0, exercises: 0 };
const PREVIEW = 4;

export function padNumber(n: number) {
  return String(n).padStart(2, "0");
}

export function levelTotals(levels: Level[], perLevel: Record<string, LevelStat>): LevelStat {
  return levels.reduce(
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
}

export function LevelPicker({
  topic,
  levels,
  perLevel,
  chapterById,
  savedLevel,
  intro,
  hero = true,
  pathLabel = "Show me this path",
  onShowPath,
}: {
  topic: Topic;
  levels: Level[];
  perLevel: Record<string, LevelStat>;
  chapterById: Record<string, ChapterMeta>;
  savedLevel: string | null;
  intro: ReactNode;
  hero?: boolean;
  pathLabel?: string;
  onShowPath: (levelId: LevelId) => void;
}) {
  const mounted = useMounted();
  const [picked, setPicked] = useState<string | null>(null);
  const known = (id: string | null) => (id && levels.some((l) => l.id === id) ? id : null);
  const selected = known(picked) ?? known(savedLevel) ?? levels[0]?.id;
  const selectedName = levels.find((level) => level.id === selected)?.name ?? "";
  const selectedStat = (selected && perLevel[selected]) || NO_STAT;

  return (
    <Scene className={hero ? `${topicKit.hero} ${styles.pick}` : `${styles.pick} ${styles.pickInline}`}>
      <RevealWithoutScript className={styles.pending} />
      <Copy>
        {intro}
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
                <span className={styles.choiceNo}>{padNumber(i + 1)}</span>
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
        {selected && (
          <div className={`${styles.goMobile} ${mounted ? "" : styles.pending}`}>
            <Link
              className={topicKit.btn}
              href={`/path/${topic.id}/${selected}`}
              prefetch={false}
              onClick={() => onShowPath(selected as LevelId)}
            >
              {pathLabel} <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}
      </Copy>
      <Compose
        live
        fixed
        layout="rail"
        className={`${styles.pickStage} ${hero ? "" : styles.pickStageInline} ${mounted ? "" : styles.pending}`}
      >
        {levels.map((level, i) => {
          const stat = perLevel[level.id] ?? NO_STAT;
          const written = levelRows(level, chapterById).filter(
            (row): row is Extract<typeof row, { ready: true }> => row.ready
          );
          const soon = levelRows(level, chapterById).length - written.length;
          const preview = written.slice(0, PREVIEW);
          return (
            <div key={level.id} className={styles.panel} data-level={level.id}>
              <Card at="a" tilt={-1} taped className={styles.main}>
                {savedLevel === level.id && <Tag tone="primary">★ your level</Tag>}
                <p className={styles.cardKicker}>
                  Part {i + 1} of {levels.length}
                  {soon > 0 && ` · ${soon} more soon`}
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
                  {preview.map((row) => (
                    <li key={row.chapter.id}>
                      <span className={styles.chapterCode}>{row.chapter.num}</span>
                      <span className={styles.chapterName} dangerouslySetInnerHTML={{ __html: row.chapter.title }} />
                      <span className={styles.chapterMin}>{row.chapter.readMinutes} min</span>
                    </li>
                  ))}
                </ol>
                {written.length > PREVIEW && (
                  <p className={styles.more}>and {plural(written.length - PREVIEW, "more chapter")} below</p>
                )}
                <div className={styles.goRow}>
                  <Link
                    className={topicKit.btn}
                    href={`/path/${topic.id}/${level.id}`}
                    prefetch={false}
                    onClick={() => onShowPath(level.id)}
                  >
                    {pathLabel} <span aria-hidden="true">→</span>
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
        <Card
          as="aside"
          aria-label={`${topic.name} ${selectedName} in numbers`}
          at="b"
          tilt={1}
          className={styles.facts}
        >
          <Facts
            items={[
              {
                value: selectedStat.chapters,
                label: selectedStat.chapters === 1 ? "chapter written" : "chapters written",
              },
              { value: compactSpan(selectedStat.minutes), label: "of reading" },
              { value: selectedStat.exercises, label: selectedStat.exercises === 1 ? "exercise" : "exercises" },
            ]}
          />
        </Card>
      </Compose>
    </Scene>
  );
}
