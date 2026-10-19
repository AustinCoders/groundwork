import Link from "next/link";
import styles from "./companyQuestionsTeaser.module.css";

export function CompanyQuestionsTeaser({
  href,
  topic,
  count,
  other,
  companies,
}: {
  href: string;
  topic: "design" | "coding";
  count: number;
  other: number;
  companies: number;
}) {
  const own = topic === "design" ? "system design" : "coding";
  const rest = topic === "design" ? "coding" : "system design";
  return (
    <div className={styles.teaser}>
      <p className={styles.kicker}>Asked at big companies?</p>
      <p className={styles.title}>
        {count} reported {own} questions, each with a worked answer
      </p>
      <p className={styles.sub}>
        From {companies} companies, global and Indian, plus {other} {rest} questions. Cover the answer, run the clock,
        then compare.
      </p>
      <Link className="btn btn--primary" href={href} prefetch={false}>
        Open company questions <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
