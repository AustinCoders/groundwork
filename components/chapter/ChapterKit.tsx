"use client";

import Link from "next/link";
import { Fragment, useId, type CSSProperties, type ReactNode, type Ref } from "react";
import { Tape } from "@/components/home/Stage";
import { Card, Compose, Remark, Tag } from "@/components/topic/Compose";
import { TopIcon } from "@/components/practice/TopIcon";
import { Underlined, Kicker, topicKit } from "@/components/topic/TopicKit";
import { Eyebrow, kit } from "@/components/ui/MenuKit";
import { accentVar } from "@/lib/accent";
import { openCheckOnClick } from "@/lib/checkOpen";
import type { BodySegment } from "@/lib/chapterIslands";
import { problemHref } from "@/lib/problemHref";
import { progress } from "@/lib/storage";
import { useProgressValue } from "@/lib/hooks";
import type { SeriesCard, TocItem } from "./types";
import styles from "./chapterKit.module.css";

const CODE_LABELS: Record<string, string> = {
  js: "example.js",
  react: "example.jsx",
  dsa: "solution",
  "system-design": "sketch",
  git: "terminal",
  architecture: "snippet",
};

export function codeLabelFor(topicId: string): string {
  return CODE_LABELS[topicId] ?? "example";
}

export interface PracticeLink {
  id: string;
  title: string;
  testCount: number;
  level: string;
}

export function ChapterCrumbs({ href, label, part, num }: { href: string; label: string; part?: string; num: string }) {
  return (
    <nav className={styles.crumbs} aria-label="Breadcrumb">
      <Link href={href}>{label}</Link>
      <span aria-hidden="true">/</span>
      <span>{part}</span>
      <span aria-hidden="true">/</span>
      <span aria-current="page">{num}</span>
    </nav>
  );
}

export function ChapterHeaderPager({
  index,
  total,
  prev,
  next,
  basePath,
}: {
  index: number;
  total: number;
  prev?: SeriesCard<string>;
  next?: SeriesCard<string>;
  basePath: string;
}) {
  return (
    <>
      {prev ? (
        <Link className={styles.iconBtn} href={`${basePath}/${prev.id}`} aria-label={`Previous: ${prev.title}`}>
          <TopIcon name="prev" />
        </Link>
      ) : (
        <span className={`${styles.iconBtn} ${styles.off}`} aria-hidden="true">
          <TopIcon name="prev" />
        </span>
      )}
      <span className={styles.position}>
        {index + 1} / {total}
      </span>
      {next ? (
        <Link className={styles.iconBtn} href={`${basePath}/${next.id}`} aria-label={`Next: ${next.title}`}>
          <TopIcon name="next" />
        </Link>
      ) : (
        <span className={`${styles.iconBtn} ${styles.off}`} aria-hidden="true">
          <TopIcon name="next" />
        </span>
      )}
    </>
  );
}

export function ChaptersButton({
  open,
  controls,
  onOpen,
  label = "Chapters",
}: {
  open: boolean;
  controls: string;
  onOpen: () => void;
  label?: string;
}) {
  return (
    <button type="button" className={styles.railBtn} aria-expanded={open} aria-controls={controls} onClick={onOpen}>
      <TopIcon name="list" size={16} />
      {label}
    </button>
  );
}

export function ReaderLayout({
  accent,
  rail,
  railId,
  aside,
  children,
  ...status
}: {
  accent?: string;
  rail?: ReactNode;
  railId?: string;
  aside?: ReactNode;
  children: ReactNode;
  role?: string;
  "aria-label"?: string;
  "aria-live"?: "polite";
}) {
  return (
    <div
      className={styles.page}
      style={accent ? ({ "--accent": accentVar(accent) } as CSSProperties) : undefined}
      {...status}
    >
      <div className={styles.layout}>
        <aside className={styles.rail} id={railId}>
          {rail}
        </aside>
        <div className={styles.column}>{children}</div>
        {aside}
      </div>
    </div>
  );
}

export function ReaderAside({ label, children }: { label: string; children: ReactNode }) {
  return (
    <aside className={styles.aside} aria-label={label}>
      <div className={styles.asideInner}>{children}</div>
    </aside>
  );
}

export function ReadingColumn({ id, read, children }: { id?: string; read?: boolean; children: ReactNode }) {
  return (
    <article className={`chapter${read ? " is-done" : ""} ${styles.article}`} id={id}>
      {children}
    </article>
  );
}

function UnderlinedTitle({ title }: { title: string }) {
  const words = title.split(" ");
  const tail = words.length > 1 && words[words.length - 1].length < 4 ? 2 : 1;
  const lead = words.slice(0, -tail).join(" ");
  return (
    <>
      {lead && `${lead} `}
      <Underlined>{words.slice(-tail).join(" ")}</Underlined>
    </>
  );
}

export function ChapterHero({
  mark,
  num,
  partLabel,
  title,
  subtitle,
  subtitleHtml,
  facts,
  listenId,
  learn = [],
  learnLabel = "In this chapter",
  minutes,
  position,
  read,
  status,
  extra,
}: {
  mark: string;
  num: string;
  partLabel: string;
  title: string;
  subtitle?: string;
  subtitleHtml?: string;
  facts: string[];
  listenId?: string;
  learn?: string[];
  learnLabel?: string;
  minutes?: number;
  position?: { index: number; total: number };
  read?: boolean;
  status?: string;
  extra?: ReactNode;
}) {
  const shown = learn.slice(0, 5);
  const more = learn.length - shown.length;
  return (
    <header className={styles.hero}>
      <div className={styles.heroCopy}>
        <Kicker mark={mark} dashed={Boolean(status)}>
          {num} · {partLabel}
        </Kicker>
        <h1 className={styles.title}>
          <UnderlinedTitle title={title} />
        </h1>
        {subtitleHtml ? (
          <p className={styles.lead} dangerouslySetInnerHTML={{ __html: subtitleHtml }} />
        ) : (
          subtitle && <p className={styles.lead}>{subtitle}</p>
        )}
        <div className={styles.meta} data-speech-exclude>
          {facts.map((fact) => (
            <span className={topicKit.chip} key={fact}>
              {fact}
            </span>
          ))}
          {status && <span className={`${topicKit.chip} ${styles.statusChip}`}>{status}</span>}
          {listenId && (
            <button className={`${styles.listen} listenbtn`} type="button" data-listen={listenId}>
              ▶ Listen
            </button>
          )}
          {extra}
        </div>
      </div>
      {(shown.length > 0 || status) && (
        <div className={styles.heroStage} aria-hidden="true" data-speech-exclude>
          <Compose layout="stack">
            <Card at="a" tone={status ? "draft" : "paper"} tilt={1}>
              {position && (
                <Tag tone="primary">
                  {position.index} of {position.total}
                </Tag>
              )}
              <p className={styles.learnKicker}>{status ? "Sketch only" : learnLabel}</p>
              {status ? (
                <div className={styles.ghost}>
                  <span />
                  <span />
                  <span />
                </div>
              ) : (
                <ul className={styles.learnList}>
                  {shown.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {more > 0 && <p className={styles.learnMore}>and {more} more</p>}
              {read && (
                <Tag tone="success" corner="bottom">
                  read ✓
                </Tag>
              )}
              {minutes ? <Remark>about {minutes} min</Remark> : null}
            </Card>
          </Compose>
        </div>
      )}
    </header>
  );
}

export function ChapterInlineToc({ toc }: { toc: TocItem[] }) {
  return (
    <details className={styles.inlineToc} data-speech-exclude>
      <summary>
        <span className={styles.inlineTocNo}>{String(toc.length).padStart(2, "0")}</span>
        On this page
      </summary>
      <ol>
        {toc.map((t) => (
          <li key={t.id}>
            <a href={`#${t.id}`}>{t.text}</a>
          </li>
        ))}
      </ol>
    </details>
  );
}

export function Prose({
  html,
  bodyRef,
  id,
  codeLabel = "example",
  className,
  segments,
  islands,
}: {
  html: string;
  segments?: BodySegment[];
  islands?: ReactNode[];
  bodyRef?: Ref<HTMLDivElement>;
  id?: string;
  codeLabel?: string;
  className?: string;
}) {
  const classes = className ? `prose ${className}` : "prose";
  const style = { "--code-label": `"${codeLabel}"` } as CSSProperties;
  if (segments) {
    return (
      <div key="segments" id={id} ref={bodyRef} className={classes} style={style} suppressHydrationWarning>
        {segments.map((segment, i) =>
          segment.kind === "island" ? (
            <Fragment key={i}>{islands?.[i]}</Fragment>
          ) : (
            <div
              key={i}
              className={styles.segment}
              suppressHydrationWarning
              dangerouslySetInnerHTML={{ __html: segment.html }}
            />
          )
        )}
      </div>
    );
  }
  return (
    <div
      key="html"
      id={id}
      ref={bodyRef}
      className={classes}
      style={style}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function ChapterPractice({
  exercises,
  topicId,
  level,
  levelTotal = 0,
}: {
  exercises: PracticeLink[];
  topicId?: string;
  level?: string;
  levelTotal?: number;
}) {
  const solvedKey = useProgressValue(
    () =>
      exercises
        .filter((ex) => progress.isExerciseSolved(ex.id))
        .map((ex) => ex.id)
        .join(","),
    ""
  );
  const solved = solvedKey ? solvedKey.split(",") : [];
  const headingId = useId();

  if (!exercises.length) return null;

  return (
    <section className={styles.practice} aria-labelledby={headingId} data-speech-exclude>
      <Eyebrow no={String(exercises.length).padStart(2, "0")} id={headingId} as="p">
        Practice this chapter
      </Eyebrow>
      <p className={styles.practiceNote}>Opens in the editor: write it, run it, and check it against real tests.</p>
      <ul className={kit.rows}>
        {exercises.map((ex) => (
          <li key={ex.id}>
            <Link className={kit.row} href={problemHref(ex.id)}>
              <span className={kit.code}>{ex.testCount === 1 ? "1 test" : `${ex.testCount} tests`}</span>
              <span className={kit.title}>{ex.title}</span>
              <span className={styles.practiceEnd}>
                {ex.level}
                {solved.includes(ex.id) && (
                  <span className={styles.practiceTick} role="img" aria-label="solved">
                    ✓
                  </span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {levelTotal > 0 && (
        <Link className={styles.practiceAll} href={`/path/${topicId}/${level}`}>
          All {levelTotal} for this level →
        </Link>
      )}
    </section>
  );
}

export interface ChapterFinishProps {
  num: string;
  read: boolean;
  readCount: number;
  total: number;
  onToggleRead: () => void;
  reviewDays?: number;
  unit?: string;
  scope?: string;
  doneLabel?: string;
  todoLabel?: string;
  aside?: ReactNode;
  tickHref?: string | null;
}

function ChapterFinish({
  num,
  read,
  readCount,
  total,
  onToggleRead,
  reviewDays,
  unit = "chapter",
  scope = "in this series",
  doneLabel = "Chapter read",
  todoLabel = "Finished reading?",
  aside,
  tickHref,
}: ChapterFinishProps) {
  return (
    <section className={styles.finish} data-read={read || undefined} aria-label="Finish" data-speech-exclude>
      <span className={styles.finishMark} aria-hidden="true">
        {read ? "✓" : num}
      </span>
      <div className={styles.finishText}>
        <p className={styles.finishTitle}>{read ? doneLabel : todoLabel}</p>
        {read && reviewDays !== undefined && (
          <p className={styles.finishReview}>
            Comes back for review in {reviewDays} {reviewDays === 1 ? "day" : "days"}
          </p>
        )}
        <p className={styles.finishSub}>
          {readCount} of {total} {unit}s read {scope}
        </p>
        <span className={styles.finishBar} aria-hidden="true">
          <span style={{ width: `${(readCount / total) * 100}%` }} />
        </span>
        {aside}
      </div>
      {tickHref ? (
        <a className={styles.finishBtn} href={tickHref} onClick={openCheckOnClick}>
          {read ? "Mark as unread" : "Mark as read"}
        </a>
      ) : (
        <button type="button" className={styles.finishBtn} aria-pressed={read} onClick={onToggleRead}>
          {read ? "Mark as unread" : "Mark as read"}
        </button>
      )}
    </section>
  );
}

export function ChapterEndScene({
  finish,
  num,
  prev,
  next,
  basePath,
  homeLabel,
  navLabel = "Chapter navigation",
  unit = "chapter",
}: {
  finish?: ChapterFinishProps;
  num: string;
  prev?: SeriesCard<string>;
  next?: SeriesCard<string>;
  basePath: string;
  homeLabel: string;
  navLabel?: string;
  unit?: string;
}) {
  const read = finish?.read;
  return (
    <div className={styles.end} data-end-card>
      {finish && <ChapterFinish {...finish} />}
      <Eyebrow no="→" as="p">
        Next stop
      </Eyebrow>
      <nav className={styles.nav} aria-label={navLabel} data-speech-exclude>
        <ol className={styles.trail}>
          <li className={styles.stop} data-stop="prev">
            <Link className={styles.prevLink} href={prev ? `${basePath}/${prev.id}` : basePath}>
              <span className={styles.node} aria-hidden="true">
                {prev ? prev.num : <TopIcon name="prev" size={18} />}
              </span>
              <span className={styles.navText}>
                <span className={styles.navHint}>{prev ? `Previous · ${prev.num}` : "Back to"}</span>
                <span className={styles.navTitle}>{prev ? prev.title : homeLabel}</span>
              </span>
            </Link>
          </li>
          <li className={styles.link} data-walked="" aria-hidden="true" />
          <li className={styles.stop} data-stop="here" aria-hidden="true">
            <span className={styles.node} data-here="" data-read={read || undefined}>
              {read ? "✓" : num}
            </span>
            <span className={styles.hereTag}>you are here</span>
          </li>
          <li className={styles.link} aria-hidden="true" />
          <li className={styles.stop} data-stop="next">
            <Link className={styles.nextStop} href={next ? `${basePath}/${next.id}` : basePath}>
              <Tape rot={2} />
              <span className={styles.navHint}>{next ? `Next · ${next.num}` : "The end"}</span>
              <span className={styles.nextTitle}>{next ? next.title : `Back to ${homeLabel.toLowerCase()}`}</span>
              {next?.subtitle && <span className={styles.nextSub}>{next.subtitle}</span>}
              <span className={styles.nextGo}>
                {next && next.minutes > 0 ? `${next.minutes} min read` : next ? `Next ${unit}` : `All ${unit}s`}
                <TopIcon name="next" size={18} />
              </span>
            </Link>
          </li>
        </ol>
      </nav>
    </div>
  );
}
