import Link from "next/link";
import styles from "./companyQuestionsTeaser.module.css";

export function CompanyQuestionsTeaser({
  href,
  questions,
  companies,
}: {
  href: string;
  questions: number;
  companies: number;
}) {
  return (
    <div className={styles.teaser}>
      <p className={styles.kicker}>Asked at big companies?</p>
      <p className={styles.title}>{questions} reported design questions, each with a worked answer</p>
      <p className={styles.sub}>
        From {companies} companies, global and Indian. Cover the answer, run a 45 minute clock, then compare.
      </p>
      <Link className="btn btn--primary" href={href} prefetch={false}>
        Open company questions <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
