import type { Diagram as DiagramData } from "@/content/system-design/company-questions/diagram-types";
import { Diagram } from "./Diagram";
import styles from "./hub.module.css";

export function HeroArt({
  diagram,
  diagramTitle,
  code,
  codeTitle,
  time,
  space,
}: {
  diagram: DiagramData | null;
  diagramTitle: string;
  code: string[];
  codeTitle: string;
  time: string;
  space: string;
}) {
  return (
    <div className={styles.art} aria-hidden="true">
      <div className={styles.board}>
        <span className={styles.boardTape} />
        <p className={styles.boardHead}>
          <b>System design</b>
          <span>{diagramTitle}</span>
        </p>
        {diagram && <Diagram diagram={diagram} uid="hero-art" bare />}
      </div>
      <div className={styles.snippet}>
        <p className={styles.snippetBar}>
          <i />
          <i />
          <i />
          <span>{codeTitle}</span>
        </p>
        <pre>
          {code.map((line, index) => (
            <span key={index}>{line}</span>
          ))}
        </pre>
        <p className={styles.snippetFoot}>
          <span>time {time}</span>
          <span>space {space}</span>
        </p>
      </div>
    </div>
  );
}
