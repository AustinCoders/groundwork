import { SOURCE_KIND_NAME, SOURCES_CHECKED, type ChapterSource } from "@/lib/sourceKinds";
import styles from "./sources.module.css";

export function ChapterSources({ sources }: { sources: ChapterSource[] }) {
  if (sources.length === 0) return null;
  return (
    <section className={styles.sources} aria-labelledby="chapter-sources">
      <h2 id="chapter-sources">Sources and further reading</h2>
      <p className={styles.sub}>
        Primary references that back the claims in this chapter. Each link was opened and checked in {SOURCES_CHECKED}.
      </p>
      <ul>
        {sources.map((source) => (
          <li key={source.url}>
            <a href={source.url} rel="noopener noreferrer" target="_blank">
              <span className={styles.kind}>{SOURCE_KIND_NAME[source.kind]}</span>
              <span className={styles.label}>{source.label} ↗</span>
            </a>
            <p>{source.backs}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
