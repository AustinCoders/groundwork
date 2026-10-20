import Link from "next/link";
import type { PeopleSet } from "@/content/system-design/company-questions/people-types";
import { SOURCE_KIND_LABEL, evidenceCopy } from "./shared";
import styles from "./company.module.css";

export function PeopleSection({ name, people }: { name: string; people: PeopleSet }) {
  return (
    <section className={styles.people} aria-labelledby="people-h" id="people" data-reveal="">
      <h2 className={styles.sectionTitle} id="people-h">
        Preparing for the people rounds at {name}
      </h2>
      <p className={styles.sectionSub}>
        The hiring manager, behavioural and offer conversations. Candidate reports shape the themes; the answers and
        frames are written for this site, so use them as a structure and bring your own stories.
      </p>

      {people.values.length > 0 && (
        <div className={styles.peopleBlock}>
          <h3>
            What {name} says it values
            {people.valuesSource && (
              <a href={people.valuesSource.url} rel="noopener noreferrer" target="_blank">
                {SOURCE_KIND_LABEL[people.valuesSource.kind]} ↗
              </a>
            )}
          </h3>
          <ul className={styles.values}>
            {people.values.map((value) => (
              <li key={value.name}>
                <b>{value.name}</b>
                <span>{value.line}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {people.themes.length > 0 && (
        <div className={styles.peopleBlock}>
          <h3>Themes candidates report being probed</h3>
          <ul className={styles.themeChips}>
            {people.themes.map((theme) => (
              <li key={theme}>{theme}</li>
            ))}
          </ul>
        </div>
      )}

      {people.questions.length > 0 && (
        <div className={styles.peopleBlock}>
          <h3>Questions to rehearse</h3>
          <ol className={styles.peopleQs}>
            {people.questions.map((question) => (
              <li key={question.id}>
                <details>
                  <summary>
                    <span>{question.q}</span>
                    <em data-evidence={question.grade}>{evidenceCopy("design", question.grade).short}</em>
                  </summary>
                  <p>
                    <b>What is being checked.</b> {question.why}
                  </p>
                  <p>
                    <b>How to frame it.</b> {question.frame}
                  </p>
                  <p className={styles.peopleLinks}>
                    {question.book && (
                      <Link href={`/interview/${question.book.round}#${question.book.qid}`} prefetch={false}>
                        Worked example in the Interview book →
                      </Link>
                    )}
                    {question.sources.map((source) => (
                      <a key={source.url} href={source.url} rel="noopener noreferrer" target="_blank">
                        {SOURCE_KIND_LABEL[source.kind]}
                        {source.year ? ` · ${source.year}` : ""} ↗
                      </a>
                    ))}
                  </p>
                </details>
              </li>
            ))}
          </ol>
        </div>
      )}

      {people.offer.length > 0 && (
        <div className={styles.peopleBlock}>
          <h3>The offer conversation</h3>
          <ul className={styles.offer}>
            {people.offer.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      {people.gaps && (
        <p className={styles.gaps}>
          <b>What we could not verify.</b> {people.gaps}
        </p>
      )}
    </section>
  );
}
