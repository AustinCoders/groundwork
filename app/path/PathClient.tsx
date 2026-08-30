"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Crumbs } from "@/components/Crumbs";
import { Shell } from "@/components/Shell";
import { escapeHtml, plural } from "@/lib/format";
import { level as findLevel, topic as findTopic } from "@/lib/topics";
import { lastLevel, progress, rememberLevel } from "@/lib/storage";
import { levelRows } from "@/lib/levelRows";
import type { ChapterMeta } from "@/content/types";
import { useMounted } from "@/lib/hooks";

function LevelTag({ level }: { level: string }) {
  return <span className={`tag tag--${level}`}>{level}</span>;
}

export interface PathClientProps {
  /** id -> chapter metadata for every chapter in every topic on the shelf. */
  chapterById: Record<string, ChapterMeta>;
  chapterExercises: Record<string, ExerciseLink[]>;
  /** level key `${topicId}:${levelId}` -> the exercises tagged for it. */
  levelExercises: Record<string, ExerciseLink[]>;
}

export interface ExerciseLink {
  id: string;
  title: string;
  testCount: number;
  level: string;
  chapterShort: string | null;
}

export default function PathClient(props: PathClientProps) {
  return (
    <Suspense fallback={null}>
      <PathPageInner {...props} />
    </Suspense>
  );
}

function PathPageInner({ chapterById, chapterExercises, levelExercises }: PathClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mounted = useMounted();
  const [, forceUpdate] = useState(0);
  const bump = () => forceUpdate((n) => n + 1);

  const topicId = searchParams.get("topic") || "js";
  const topic = findTopic(topicId);
  const levelParam = searchParams.get("level");
  const levelId = levelParam || (mounted ? lastLevel() : null) || "beginner";
  const level = topic && findLevel(levelId, topic.id);

  useEffect(() => {
    if (!mounted) return;
    if (!topic) {
      router.replace("/");
      return;
    }
    if (topic.status !== "ready") {
      router.replace(`/soon?topic=${topic.id}`);
      return;
    }
    if (!level) {
      router.replace(`/level?topic=${topic.id}`);
      return;
    }
    rememberLevel(level.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, topic?.id, level?.id]);

  const entries = useMemo(() => {
    if (!topic || !level) return [];
    const rows = levelRows(level, chapterById);
    const cheat = topic.id === "js" ? chapterById["cheat"] : null;
    if (cheat && cheat.ready) rows.push({ ready: true, chapter: cheat });
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic?.id, level?.id, chapterById]);

  const chapters = useMemo(() => entries.filter((e) => e.ready).map((e) => e.chapter), [entries]);

  if (!mounted || !topic || topic.status !== "ready" || !level) return null;

  const notesHref = `/${(topic.notes || "").replace(/\.html$/, "")}`;
  const plannedCount = entries.length - chapters.length;
  const done = progress.countDone(chapters);
  const pct = chapters.length ? (done / chapters.length) * 100 : 0;
  const next = chapters.find((ch) => !progress.isChapterDone(ch.id)) || chapters[0];
  const levelExerciseList = levelExercises[`${topic.id}:${level.id}`] ?? [];

  return (
    <Shell skipLabel="Skip to the path" topicId={topic.id} progressChapters={chapters}>
      <Crumbs
        items={[
          { label: "All topics", href: "/" },
          { label: topic.name, href: `/level?topic=${topic.id}` },
          { label: level.name },
        ]}
      />

      <section className="sheet hero">
        <span className="hero__kicker" id="path-kicker">
          step 2 of 2 · your path
        </span>
        <h1 id="path-title">
          {topic.name} — {level.name}
        </h1>
        <p className="hero__lead" id="path-blurb">
          {level.blurb}
        </p>

        <div className="meter">
          <div className="meter__track">
            <div className="meter__fill" id="meter-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="meter__label" id="meter-label">
            {done} / {chapters.length} done
          </span>
        </div>

        <div className="hero__actions">
          <Link
            className="btn btn--primary btn--big"
            id="start-btn"
            href={next ? `${notesHref}/${next.id}` : notesHref}
          >
            {done === 0 ? "Start reading" : `Continue — ${next?.short}`} →
          </Link>
          <Link className="btn btn--big" id="full-notes-btn" href={notesHref}>
            Open the full notes
          </Link>
          <Link className="btn btn--big" id="change-level" href={`/level?topic=${topic.id}`}>
            <span aria-hidden="true">⇄</span> Change level
          </Link>
          <button
            className="btn btn--big"
            id="reset-progress"
            type="button"
            onClick={() => {
              if (!window.confirm("Clear every tick and solved exercise on this device?")) return;
              progress.reset();
              bump();
            }}
          >
            Reset my progress
          </button>
        </div>
      </section>

      <h2 className="section-title">The order I&apos;d read them in</h2>
      <p className="section-note" id="path-note">
        {plural(chapters.length, "chapter")} written so far, about{" "}
        {chapters.reduce((sum, ch) => sum + ch.readMinutes, 0)} minutes of reading
        {plannedCount ? ` · ${plural(plannedCount, "section")} still on the desk` : ""}. Tick off what you&apos;ve read
        — it is remembered on this device.
      </p>

      <ol className="steps" id="steps">
        {entries.map((entry, i) => {
          if (!entry.ready) {
            const section = entry.section;
            const sub = section.items.map(escapeHtml).join(" · ");
            return (
              <li className="step is-planned" key={`planned-${i}`}>
                <span className="step__num" aria-hidden="true">
                  ○
                </span>
                <div>
                  {entry.chapter ? (
                    <a className="step__title" href={`${notesHref}/${entry.chapter.id}`}>
                      {section.title}
                    </a>
                  ) : (
                    <span className="step__title">{section.title}</span>
                  )}
                  <p className="step__sub" dangerouslySetInnerHTML={{ __html: sub }} />
                  <div className="step__meta">
                    <span className="tag tag--soon">coming soon</span>
                  </div>
                </div>
              </li>
            );
          }

          const chapter = entry.chapter;
          const chapterExerciseList = chapterExercises[chapter.id] ?? [];
          const chapterDone = progress.isChapterDone(chapter.id);

          return (
            <li className={`step${chapterDone ? " is-done" : ""}`} id={`step-${chapter.id}`} key={chapter.id}>
              <span className="step__num" aria-hidden="true">
                {chapter.num}
              </span>
              <div>
                <span className="step__title">{chapter.title}</span>
                <p className="step__sub">{chapter.subtitle}</p>
                <div className="step__meta">
                  <span className="tag">{chapter.readMinutes} min read</span>
                  {chapterExerciseList.length > 0 && (
                    <span className="tag">{plural(chapterExerciseList.length, "exercise")}</span>
                  )}
                  {(chapter.levels || []).map((l) => (
                    <LevelTag key={l} level={l} />
                  ))}
                </div>
                <div className="step__actions">
                  <Link className="btn" href={`${notesHref}/${chapter.id}`}>
                    {/^\d+$/.test(chapter.num) ? `Read chapter ${chapter.num}` : "Read it"}
                  </Link>
                  <label className="check">
                    <input
                      type="checkbox"
                      data-chapter={chapter.id}
                      checked={chapterDone}
                      onChange={(e) => {
                        progress.setChapterDone(chapter.id, e.target.checked);
                        bump();
                      }}
                    />{" "}
                    mark as read
                  </label>
                </div>
                {chapterExerciseList.length > 0 && (
                  <div className="practice-list">
                    {chapterExerciseList.map((ex) => {
                      const solved = progress.isExerciseSolved(ex.id);
                      return (
                        <Link className="practice" href={`/practice?id=${ex.id}`} key={ex.id}>
                          <span className="practice__top">
                            <span className="practice__title">{ex.title}</span>
                            {solved && <span className="practice__tick">✓</span>}
                          </span>
                          <span className="practice__meta">
                            {plural(ex.testCount, "test")} · {ex.level}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <h2 className="section-title">Practice at this level</h2>
      <p className="section-note">Every exercise opens in the editor with tests you can run.</p>
      <div className="practice-list" id="practice-list">
        {!levelExerciseList.length && (
          <p className="section-note">
            No exercises tagged for this level yet — the ones on each chapter above still work.
          </p>
        )}
        {levelExerciseList.map((ex) => {
          const solved = progress.isExerciseSolved(ex.id);
          return (
            <Link className="practice" href={`/practice?id=${ex.id}`} key={ex.id}>
              <span className="practice__top">
                <span className="practice__title">{ex.title}</span>
                {solved && <span className="practice__tick">✓</span>}
              </span>
              <span className="practice__meta">
                {ex.chapterShort ? `${ex.chapterShort} · ` : ""}
                {plural(ex.testCount, "test")}
              </span>
            </Link>
          );
        })}
      </div>

      <footer className="site-foot">
        <Link href="/">All topics</Link>
        <Link href={notesHref} id="full-notes-footer">
          {topic.name} notes
        </Link>
        <Link href="/practice?id=free">Playground</Link>
      </footer>
    </Shell>
  );
}
