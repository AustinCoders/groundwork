import { ChapterRow } from "./ChapterRow";
import { TrailLeg } from "./TrailLeg";
import { STATUS_TEXT, groupSummary, percent } from "./model";
import { toneStyle } from "./tone";
import type { CSSProperties } from "react";
import type { ShellGroup } from "./types";
import styles from "./shell.module.css";

export function JourneyMap({ groups, counting }: { groups: ShellGroup[]; counting: boolean }) {
  const last = groups.length - 1;
  return (
    <ol className={styles.map}>
      {groups.map((group, index) => {
        const done = group.status === "done";
        const style = {
          ...toneStyle(group.tone),
          "--pct": `${counting ? percent(group.read, group.written) : 0}%`,
        } as CSSProperties;
        return (
          <li className={styles.stop} key={group.id} style={style} data-status={group.status}>
            <span className={styles.node} aria-hidden="true">
              {done ? "✓" : index + 1}
            </span>
            {index < last && <TrailLeg walked={done} />}
            <details className={styles.stage} id={group.id} open={group.open}>
              <summary className={styles.stageSummary}>
                <span className={styles.stageTop}>
                  <span className={styles.stageName}>{group.name}</span>
                  <span className={styles.chip} data-status={group.status}>
                    {STATUS_TEXT[group.status]}
                  </span>
                  <span className={styles.chevron} aria-hidden="true" />
                </span>
                {group.promise && <span className={styles.promise}>{group.promise}</span>}
                <span className={styles.stageProgress}>
                  <span className={styles.bar} aria-hidden="true">
                    <i />
                  </span>
                  <span className={styles.barText}>{groupSummary(group, counting)}</span>
                </span>
                {group.peek && <span className={styles.peek}>{group.peek}</span>}
              </summary>
              <div className={styles.stageBody}>
                <ol className={styles.rows}>
                  {group.chapters.map((chapter) => (
                    <ChapterRow key={chapter.id} chapter={chapter} />
                  ))}
                </ol>
              </div>
            </details>
          </li>
        );
      })}
    </ol>
  );
}
