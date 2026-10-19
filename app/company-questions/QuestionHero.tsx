import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { accentVar } from "@/lib/accent";
import { HUB_PATH, evidenceCopy, type EvidenceKey, type Kind } from "./shared";
import styles from "./detail.module.css";

export interface QuestionHeroProps {
  company: { id: string; name: string; accent: string };
  kind: Kind;
  topic: string;
  title: string;
  evidence: EvidenceKey;
  chips: string[];
  promptLabel: string;
  prompt: string;
  disclaimer: string;
  glance: { label: string; value: ReactNode }[];
  glyph?: ReactNode;
  actions?: ReactNode;
}

export function QuestionHero(props: QuestionHeroProps) {
  const { company, kind, topic, title, evidence, chips, promptLabel, prompt, disclaimer, glance, glyph, actions } =
    props;
  const copy = evidenceCopy(kind, evidence);
  return (
    <header className={styles.hero} style={{ "--accent": accentVar(company.accent) } as CSSProperties}>
      <nav className={styles.crumbs} aria-label="Breadcrumb">
        <Link href={HUB_PATH} prefetch={false}>
          Company questions
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={`${HUB_PATH}/${company.id}`} prefetch={false}>
          {company.name}
        </Link>
        <span aria-hidden="true">/</span>
        <span>{kind === "design" ? "System design" : "Coding"}</span>
      </nav>

      <div className={styles.heroGrid}>
        <div className={styles.heroMain}>
          <p className={styles.topic}>{topic}</p>
          <h1 id="question-title">{title}</h1>
          <ul className={styles.chips}>
            <li className={styles.badge} data-evidence={evidence}>
              <i aria-hidden="true" />
              {copy.label}
            </li>
            {chips.map((chip) => (
              <li key={chip}>{chip}</li>
            ))}
          </ul>
          <p className={styles.hint}>{copy.hint}</p>
          {actions}
          <figure className={styles.prompt}>
            <span className={styles.tape} aria-hidden="true" />
            <figcaption>{promptLabel}</figcaption>
            <blockquote>{prompt}</blockquote>
            <p>{disclaimer}</p>
          </figure>
        </div>

        <div className={styles.side}>
          <aside className={styles.glance} aria-label="At a glance">
            {glyph && <div className={styles.glyph}>{glyph}</div>}
            <Link href={`${HUB_PATH}/${company.id}`} className={styles.companyLink} prefetch={false}>
              <span className={styles.monogram} aria-hidden="true">
                {company.name.charAt(0)}
              </span>
              <span>
                <b>{company.name}</b>
                <em>See the whole interview process →</em>
              </span>
            </Link>
            <dl>
              {glance.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
          <aside className={styles.quick} aria-label="How to use this page">
            <h2>Practise it like the real round</h2>
            <ol>
              <li>Read the prompt and clarify out loud.</li>
              <li>Cover the answer and start the clock.</li>
              <li>Compare, then mark it practised.</li>
            </ol>
            <a href="#try">Go to the interview clock ↓</a>
          </aside>
        </div>
      </div>
    </header>
  );
}
