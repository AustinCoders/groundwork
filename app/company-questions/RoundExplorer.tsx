"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { RoundIcon } from "./RoundIcon";
import styles from "./hub.module.css";

export interface ExplorerKind {
  id: string;
  label: string;
  what: string;
  asked: string[];
  icon: string;
  tone: string;
  companies: { id: string; name: string; accent: string }[];
  books: { id: string; title: string }[];
  topics: { href: string; label: string }[];
}

export function RoundExplorer({ kinds }: { kinds: ExplorerKind[] }) {
  const [at, setAt] = useState(0);
  const kind = kinds[at];
  return (
    <div className={styles.explorer} style={{ "--tone": kind.tone } as CSSProperties}>
      <ul className={styles.kindList} role="tablist" aria-label="Kinds of interview round" aria-orientation="vertical">
        {kinds.map((entry, index) => (
          <li key={entry.id} style={{ "--tone": entry.tone } as CSSProperties}>
            <button
              type="button"
              role="tab"
              id={`kind-${entry.id}`}
              aria-selected={at === index}
              aria-controls="kind-panel"
              onClick={() => setAt(index)}
            >
              <span className={styles.kindIcon} aria-hidden="true">
                <RoundIcon name={entry.icon} size={20} />
              </span>
              <span className={styles.kindName}>{entry.label}</span>
              <span className={styles.kindCount}>{entry.companies.length}</span>
            </button>
          </li>
        ))}
      </ul>

      <section className={styles.kindPanel} role="tabpanel" id="kind-panel" aria-labelledby={`kind-${kind.id}`}>
        <header>
          <span className={styles.kindIconLg} aria-hidden="true">
            <RoundIcon name={kind.icon} size={30} />
          </span>
          <div>
            <h3>{kind.label}</h3>
            <p>
              {kind.companies.length === 0
                ? "Usually part of another round"
                : `${kind.companies.length} ${kind.companies.length === 1 ? "company" : "companies"} run this round`}
            </p>
          </div>
        </header>
        <p className={styles.kindWhat}>{kind.what}</p>

        <h4>What gets asked</h4>
        <ol className={styles.askedGrid}>
          {kind.asked.map((item, index) => (
            <li key={item}>
              <span aria-hidden="true">{index + 1}</span>
              {item}
            </li>
          ))}
        </ol>

        {kind.companies.length > 0 && (
          <>
            <h4>Companies that run it</h4>
            <ul className={styles.kindCompanies}>
              {kind.companies.map((company) => (
                <li key={company.id}>
                  <Link
                    href={`/company-questions/${company.id}`}
                    style={{ "--accent": company.accent } as CSSProperties}
                    prefetch={false}
                  >
                    <b aria-hidden="true">{company.name.charAt(0)}</b>
                    {company.name}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        {(kind.books.length > 0 || kind.topics.length > 0) && (
          <>
            <h4>Prepare with</h4>
            <p className={styles.kindLinks}>
              {kind.books.map((book) => (
                <Link key={book.id} href={`/interview/${book.id}`} prefetch={false}>
                  Interview book · {book.title}
                </Link>
              ))}
              {kind.topics.map((topic) => (
                <Link key={topic.href} href={topic.href} prefetch={false}>
                  {topic.label}
                </Link>
              ))}
            </p>
          </>
        )}
      </section>
    </div>
  );
}
