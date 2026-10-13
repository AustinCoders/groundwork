import { groupSummary } from "./model";
import { ChapterRow } from "./ChapterRow";
import { Fold } from "./Fold";
import type { ShellGroup } from "./types";
import styles from "./shell.module.css";

export function PathList({ groups, counting }: { groups: ShellGroup[]; counting: boolean }) {
  return (
    <div className={styles.levels}>
      {groups.map((group) => (
        <Fold
          key={group.id}
          id={group.id}
          open={group.open}
          variant="level"
          name={group.name}
          aside={
            <>
              {group.yours && <span className={styles.yours}>your level</span>}
              <span className={styles.levelCount}>{groupSummary(group, counting)}</span>
            </>
          }
        >
          <ol className={styles.rows}>
            {group.chapters.map((chapter) => (
              <ChapterRow key={chapter.id} chapter={chapter} />
            ))}
          </ol>
        </Fold>
      ))}
    </div>
  );
}
