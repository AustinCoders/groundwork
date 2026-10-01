import styles from "@/components/series/landing.module.css";

export function PartSection({
  id,
  index,
  title,
  blurb,
  read,
  total,
  children,
}: {
  id: string;
  index: number;
  title: string;
  blurb?: string;
  read: number;
  total: number;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.part} aria-labelledby={`part-${id}`}>
      <div className={styles.partHead}>
        <span className={styles.partNum}>Part {index + 1}</span>
        <h2 id={`part-${id}`}>{title}</h2>
        {blurb && <p>{blurb}</p>}
        <span className={styles.partProgress}>
          <span className={styles.bar} aria-hidden="true">
            <span style={{ width: `${(read / total) * 100}%` }} />
          </span>
          {read}/{total} read
        </span>
      </div>
      <ol className={styles.cards}>{children}</ol>
    </section>
  );
}
