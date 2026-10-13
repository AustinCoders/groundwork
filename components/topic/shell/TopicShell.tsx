"use client";

import { Eyebrow } from "@/components/ui/MenuKit";
import { DetailsPanel } from "./DetailsPanel";
import { Fold } from "./Fold";
import { Hero } from "./Hero";
import { JourneyMap } from "./JourneyMap";
import { ToolsRow } from "./ToolsRow";
import { useOpenOnHash } from "./useOpenOnHash";
import type { TopicShellProps } from "./types";
import styles from "./shell.module.css";

export function TopicShell({
  topic,
  ready,
  hero,
  pathTitle,
  pathHint,
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
      <Hero hero={hero} pending={pending} />

      <section className={`${styles.path}${pending}`} id="chapters" aria-labelledby="path-title">
        <Eyebrow no="01" count={pathCount} id="path-title">
          {pathTitle}
        </Eyebrow>
        {pathHint && <p className={styles.pathHint}>{pathHint}</p>}
        <JourneyMap groups={groups} counting={ready} />
      </section>

      <div className={`${styles.more}${pending}`}>
        <ToolsRow tools={tools} label={`More on ${topic.name}`} />
        {details && <DetailsPanel details={details} />}
        {notes && (
          <Fold id={notes.id} name={notes.title} hint={`${notes.items.length} notes`}>
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
