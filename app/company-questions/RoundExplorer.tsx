"use client";

import Link from "next/link";
import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { RoundIcon } from "./RoundIcon";
import styles from "./hub.module.css";

export interface ExplorerKind {
  id: string;
  label: string;
  what: string;
  asked: { item: string; a: string; link?: { href: string; label: string } }[];
  icon: string;
  tone: string;
  companies: { id: string; name: string; accent: string }[];
  books: { id: string; title: string }[];
  topics: { href: string; label: string }[];
}

export function RoundExplorer({ kinds, total }: { kinds: ExplorerKind[]; total: number }) {
  const [at, setAt] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const kind = kinds[at];

  function move(event: KeyboardEvent, index: number) {
    const keys: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowDown: index + 1,
      ArrowLeft: index - 1,
      ArrowUp: index - 1,
      Home: 0,
      End: kinds.length - 1,
    };
    if (!(event.key in keys)) return;
    event.preventDefault();
    const target = (keys[event.key] + kinds.length) % kinds.length;
    setAt(target);
    tabs.current[target]?.focus();
  }

  return (
    <div className={styles.explorer}>
      <ul className={styles.kindGrid} role="tablist" aria-label="Kinds of interview round">
        {kinds.map((entry, index) => (
          <li key={entry.id} style={{ "--tone": entry.tone } as CSSProperties}>
            <button
              type="button"
              role="tab"
              id={`kind-${entry.id}`}
              ref={(node) => {
                tabs.current[index] = node;
              }}
              aria-selected={at === index}
              aria-controls="kind-panel"
              tabIndex={at === index ? 0 : -1}
              onClick={() => setAt(index)}
              onKeyDown={(event) => move(event, index)}
            >
              <span className={styles.kindIcon} aria-hidden="true">
                <RoundIcon name={entry.icon} size={22} />
              </span>
              <span className={styles.kindName}>{entry.label}</span>
              <span className={styles.kindCount}>
                {entry.companies.length === 0 ? "Part of another round" : `${entry.companies.length} companies`}
              </span>
              <span className={styles.kindMeter} aria-hidden="true">
                <i style={{ width: `${Math.round((entry.companies.length / total) * 100)}%` }} />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <section
        key={kind.id}
        className={styles.kindPanel}
        role="tabpanel"
        id="kind-panel"
        aria-labelledby={`kind-${kind.id}`}
        style={{ "--tone": kind.tone } as CSSProperties}
      >
        <div className={styles.panelTop}>
          <span className={styles.kindIconLg} aria-hidden="true">
            <RoundIcon name={kind.icon} size={32} />
          </span>
          <div className={styles.panelTitle}>
            <h3>{kind.label}</h3>
            <p className={styles.kindWhat}>{kind.what}</p>
          </div>
          <div className={styles.stat}>
            <b>{kind.companies.length}</b>
            <span>of {total} companies run it</span>
          </div>
        </div>

        <div className={styles.panelCols}>
          <div className={styles.col}>
            <h4>What gets asked</h4>
            <ol className={styles.askedGrid}>
              {kind.asked.map((entry, index) => (
                <li key={entry.item} style={{ "--i": index } as CSSProperties}>
                  <details>
                    <summary>
                      <span aria-hidden="true">{index + 1}</span>
                      {entry.item}
                    </summary>
                    <p>{entry.a}</p>
                    {entry.link && (
                      <Link href={entry.link.href} prefetch={false}>
                        {entry.link.label} <span aria-hidden="true">→</span>
                      </Link>
                    )}
                  </details>
                </li>
              ))}
            </ol>
          </div>

          <div className={styles.col}>
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
                <ul className={styles.kindLinks}>
                  {kind.books.map((book) => (
                    <li key={book.id}>
                      <Link href={`/interview/${book.id}`} prefetch={false}>
                        Interview book · {book.title} <span aria-hidden="true">→</span>
                      </Link>
                    </li>
                  ))}
                  {kind.topics.map((topic) => (
                    <li key={topic.href}>
                      <Link href={topic.href} prefetch={false}>
                        {topic.label} <span aria-hidden="true">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
