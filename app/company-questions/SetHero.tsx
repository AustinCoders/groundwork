import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { HUB_PATH } from "./shared";
import { ShaderHero } from "./ShaderHero";
import styles from "./detail.module.css";

export interface SetHeroProps {
  crumb: string;
  topic: string;
  title: string;
  chips: string[];
  lead: string;
  glance: { label: string; value: ReactNode }[];
  tip: { title: string; steps: string[]; href: string; link: string };
  accent: string;
}

export function SetHero({ crumb, topic, title, chips, lead, glance, tip, accent }: SetHeroProps) {
  return (
    <header className={styles.hero} style={{ "--accent": accent } as CSSProperties}>
      <ShaderHero />
      <nav className={styles.crumbs} aria-label="Breadcrumb">
        <Link href={HUB_PATH} prefetch={false}>
          Company questions
        </Link>
        <span aria-hidden="true">/</span>
        <span>{crumb}</span>
      </nav>
      <div className={styles.heroGrid}>
        <div className={styles.heroMain}>
          <p className={styles.topic}>{topic}</p>
          <h1 id="question-title">{title}</h1>
          <ul className={styles.chips}>
            {chips.map((chip) => (
              <li key={chip}>{chip}</li>
            ))}
          </ul>
          <p className={styles.hint}>{lead}</p>
        </div>
        <div className={styles.side}>
          <aside className={styles.glance} aria-label="At a glance">
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
            <h2>{tip.title}</h2>
            <ol>
              {tip.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <a href={tip.href}>{tip.link}</a>
          </aside>
        </div>
      </div>
    </header>
  );
}
