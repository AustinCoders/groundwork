"use client";

import { Eyebrow } from "@/components/ui/MenuKit";
import { Button } from "@/components/topic/TopicKit";
import { DetailsPanel } from "./DetailsPanel";
import { Fold } from "./Fold";
import { PathList } from "./PathList";
import { ToolsRow } from "./ToolsRow";
import { useOpenOnHash } from "./useOpenOnHash";
import type { TopicShellProps } from "./types";
import styles from "./shell.module.css";

export function TopicShell({
  topic,
  ready,
  hero,
  pathTitle,
  pathCount,
  groups,
  tools,
  details,
  notes,
  foot,
}: TopicShellProps) {
  useOpenOnHash(ready);
  const pending = ready ? "" : ` ${styles.pending}`;

  return (
    <div className={styles.shell} data-shell>
      <header className={`${styles.hero}${pending}`} data-hero>
        <div className={styles.heroHead}>
          <h1 className={styles.title} id="topic-title">
            {hero.title}
          </h1>
          {hero.action && (
            <div className={styles.heroAction}>
              <Button id="topic-primary" href={hero.action.href}>
                {hero.action.label} <span aria-hidden="true">→</span>
              </Button>
            </div>
          )}
        </div>
        {hero.status && <p className={styles.status}>{hero.status}</p>}
        {hero.lead && <p className={styles.lead}>{hero.lead}</p>}
        {hero.choice}
      </header>

      <section className={`${styles.path}${pending}`} id="chapters" aria-labelledby="path-title">
        <Eyebrow no="01" count={pathCount} id="path-title">
          {pathTitle}
        </Eyebrow>
        <PathList groups={groups} counting={ready} />
      </section>

      <div className={`${styles.more}${pending}`}>
        <ToolsRow tools={tools} label={`More on ${topic.name}`} />
        {details && <DetailsPanel details={details} />}
        {notes && (
          <Fold id={notes.id} variant="panel" name={notes.title} hint={`${notes.items.length} notes`}>
            <ol className={styles.notes}>
              {notes.items.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ol>
          </Fold>
        )}
      </div>

      <footer className={styles.foot}>{foot}</footer>
    </div>
  );
}
