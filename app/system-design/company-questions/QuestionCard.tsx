import Link from "next/link";
import type { Company, CompanyQuestion } from "@/content/system-design/company-questions/types";
import { EVIDENCE_LABEL } from "@/content/system-design/company-questions/companies";
import styles from "./company-questions.module.css";

const KIND_LABEL = {
  "candidate-report": "candidate report",
  "prep-guide": "prep guide",
  official: "official",
} as const;

function Section({ title, html }: { title: string; html: string }) {
  return (
    <section className={styles.section}>
      <h4>{title}</h4>
      <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
}

export function QuestionCard({
  question,
  company,
  chapterTitles,
}: {
  question: CompanyQuestion;
  company: Company;
  chapterTitles: Record<string, string>;
}) {
  const { answer } = question;
  const search = `${company.name} ${question.title} ${question.prompt} ${question.level}`.toLowerCase();
  return (
    <article
      className={styles.card}
      id={question.id}
      data-card
      data-company={company.id}
      data-group={company.group}
      data-search={search}
    >
      <header className={styles.meta}>
        <span className={styles.company}>{company.name}</span>
        <span className={styles.badge} data-evidence={question.evidence}>
          {EVIDENCE_LABEL[question.evidence]}
        </span>
        <span className={styles.level}>{question.level}</span>
        {question.kind === "lld" && <span className={styles.level}>low-level design</span>}
      </header>
      <h3 className={styles.title}>{question.title}</h3>
      <p className={styles.prompt}>{question.prompt}</p>
      <details className={styles.answer}>
        <summary>Show the answer</summary>
        <Section title="Ask first" html={answer.ask} />
        <Section title="Numbers" html={answer.numbers} />
        <Section title="The design" html={answer.design} />
        <Section title="Trade-offs" html={answer.tradeoffs} />
        <section className={styles.section}>
          <h4>Follow-ups to expect</h4>
          <ul>
            {answer.followups.map((followUp) => (
              <li key={followUp}>{followUp}</li>
            ))}
          </ul>
        </section>
        <Section title="Where candidates slip" html={answer.slips} />
      </details>
      <footer className={styles.foot}>
        <p>
          <b>Where this was reported</b>
        </p>
        <ul>
          {question.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} rel="noopener noreferrer" target="_blank">
                {source.label}
              </a>{" "}
              <span className={styles.kind}>
                ({KIND_LABEL[source.kind]}
                {source.year ? `, ${source.year}` : ""})
              </span>
            </li>
          ))}
        </ul>
        {question.chapters.length > 0 && (
          <p className={styles.read}>
            <b>Read first:</b>{" "}
            {question.chapters.map((id, index) => (
              <span key={id}>
                {index > 0 && ", "}
                <Link href={`/system-design/${id}`}>{chapterTitles[id] ?? id}</Link>
              </span>
            ))}
          </p>
        )}
      </footer>
    </article>
  );
}
