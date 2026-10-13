"use client";

import { useState } from "react";
import { Card } from "@/components/topic/Compose";
import { Button } from "@/components/topic/TopicKit";
import { NO_STAT, type LevelStat } from "@/components/topic/levelStats";
import { compactSpan, plural } from "@/lib/format";
import type { Level, LevelId } from "@/content/types";
import styles from "./shell.module.css";

function statLine(stat: LevelStat): string {
  return `${plural(stat.chapters, "chapter")} · ${compactSpan(stat.minutes)} · ${plural(stat.exercises, "exercise")}`;
}

export function LevelChoice({
  topicId,
  levels,
  perLevel,
  savedLevel,
  pathLabel = "Show me this path",
  onShowPath,
}: {
  topicId: string;
  levels: Level[];
  perLevel: Record<string, LevelStat>;
  savedLevel: string | null;
  pathLabel?: string;
  onShowPath: (levelId: LevelId) => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const known = (id: string | null) => (id && levels.some((level) => level.id === id) ? id : null);
  const selected = known(picked) ?? known(savedLevel) ?? levels[0]?.id;
  const level = levels.find((item) => item.id === selected);
  if (!level) return null;
  const stat = perLevel[level.id] ?? NO_STAT;

  return (
    <div className={styles.choice}>
      <fieldset className={styles.choices} id="level-grid">
        <legend>Pick your level</legend>
        {levels.map((item) => (
          <label key={item.id} className={styles.choiceItem}>
            <input
              type="radio"
              name="level"
              value={item.id}
              checked={selected === item.id}
              onChange={() => setPicked(item.id)}
            />
            <span className={styles.choiceName}>{item.name}</span>
            <span className={styles.choiceMeta}>{statLine(perLevel[item.id] ?? NO_STAT)}</span>
          </label>
        ))}
      </fieldset>
      <Card as="section" aria-label={`${level.name} level`} className={styles.preview}>
        <h3 className={styles.previewName}>{level.name}</h3>
        <p className={styles.previewQuote}>&ldquo;{level.tagline}&rdquo;</p>
        <p className={styles.choiceMeta}>{statLine(stat)}</p>
        <p className={styles.previewBlurb}>{level.blurb}</p>
        <p className={styles.cardKicker}>This is you if</p>
        <ul className={styles.previewList}>
          {level.bullets.map((bullet, index) => (
            <li key={index} dangerouslySetInnerHTML={{ __html: bullet }} />
          ))}
        </ul>
        <div className={styles.previewGo}>
          <Button href={`/path/${topicId}/${level.id}`} onClick={() => onShowPath(level.id)}>
            {pathLabel} <span aria-hidden="true">→</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
