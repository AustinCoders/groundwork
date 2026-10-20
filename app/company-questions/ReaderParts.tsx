import type { CSSProperties } from "react";
import Link from "next/link";
import type { ReportSource } from "@/content/system-design/company-questions/types";
import { PractisedButton } from "./PractisedButton";
import { SOURCE_KIND_LABEL } from "./shared";
import { whiteboardLink, type BoardSource } from "@/lib/whiteboard/walk";
import styles from "./company-questions.module.css";

export function AfterActions({ id, extra }: { id: string; extra: { href: string; label: string }[] }) {
  return (
    <section className={styles.after} aria-labelledby="after-h">
      <h2 id="after-h">Now make it stick</h2>
      <div className={styles.afterRow}>
        <PractisedButton id={id} />
        {extra.map((link) => (
          <Link key={link.href} className={styles.ghostBtn} href={link.href} prefetch={false}>
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

export function BoardLink({ source, id, note }: { source: BoardSource; id: string; note: string }) {
  return (
    <p className={styles.boardRow}>
      <Link className={styles.ghostBtn} href={whiteboardLink(source, id)} prefetch={false}>
        Open on the whiteboard
      </Link>
      <span>{note}</span>
    </p>
  );
}

export function SourcesList({ sources }: { sources: ReportSource[] }) {
  return (
    <section className={styles.refs} id="sources" aria-labelledby="sources-h">
      <h2 id="sources-h">Where this was reported</h2>
      <p className={styles.refsNote}>
        Public pages only. Companies do not confirm these, and they rotate their questions, so treat each link as one
        person&apos;s account or one list&apos;s tag.
      </p>
      <ul className={styles.sources}>
        {sources.map((source) => (
          <li key={source.url}>
            <a href={source.url} rel="noopener noreferrer" target="_blank">
              <span className={styles.sourceKind}>
                {SOURCE_KIND_LABEL[source.kind]}
                {source.year ? ` · ${source.year}` : ""}
              </span>
              <span className={styles.sourceLabel}>{source.label}</span>
              <span className={styles.sourceGo} aria-hidden="true">
                ↗
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ChapterLinks({
  heading,
  ids,
  base,
  titles,
}: {
  heading: string;
  ids: string[];
  base: string;
  titles: Record<string, string>;
}) {
  if (ids.length === 0) return null;
  return (
    <section className={styles.refs} aria-labelledby="read-h">
      <h2 id="read-h">{heading}</h2>
      <ul className={styles.chapterLinks}>
        {ids.map((chapterId) => (
          <li key={chapterId}>
            <Link href={`${base}/${chapterId}`} prefetch={false}>
              {titles[chapterId] ?? chapterId} <span aria-hidden="true">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function RelatedList({
  heading,
  items,
}: {
  heading: string;
  items: { href: string; company: string; title: string; accent: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <section className={styles.refs} aria-labelledby="related-h">
      <h2 id="related-h">{heading}</h2>
      <ul className={styles.related}>
        {items.map((item) => (
          <li key={item.href} style={{ "--accent": item.accent } as CSSProperties}>
            <Link href={item.href} prefetch={false}>
              <span>{item.company}</span>
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Pager({
  previous,
  next,
}: {
  previous: { href: string; title: string };
  next: { href: string; title: string };
}) {
  return (
    <nav className={styles.pager} aria-label="Other questions">
      <Link href={previous.href} prefetch={false}>
        <span>← Previous</span>
        {previous.title}
      </Link>
      <Link href={next.href} prefetch={false}>
        <span>Next →</span>
        {next.title}
      </Link>
    </nav>
  );
}
