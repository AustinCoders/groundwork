import styles from "../SiteDrawer.module.css";

export function Eyebrow({ no, id, children }: { no: string; id?: string; children: React.ReactNode }) {
  return (
    <p className={styles.eyebrow}>
      <span className={styles.eyebrowNo} aria-hidden="true">
        {no}
      </span>
      <span id={id}>{children}</span>
      <span className={styles.eyebrowRule} aria-hidden="true" />
    </p>
  );
}
