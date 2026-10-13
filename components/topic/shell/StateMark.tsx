import type { ShellMark } from "./types";
import styles from "./shell.module.css";

export function StateMark({ mark }: { mark: ShellMark }) {
  return (
    <>
      <span className={styles.mark} data-kind={mark.kind} aria-hidden="true" />
      <span className={mark.word ? styles.word : styles.sr} data-state={mark.kind}>
        {mark.word ?? mark.label}
      </span>
    </>
  );
}
