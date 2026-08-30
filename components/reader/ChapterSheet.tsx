import Link from "next/link";
import { escapeHtml, exercisesForChapter, syllabusSectionForChapter } from "@/lib/content";
import { ChapterDone } from "@/components/reader/ChapterDone";
import { PracticeStrip } from "@/components/reader/PracticeStrip";
import type { Chapter } from "@/content/types";

/**
 * Server component — a chapter's body HTML is rendered here and never
 * enters the client bundle. Only the two interactive strips below are
 * client components, and they receive ids, not content.
 */
export function ChapterSheet({
  chapter,
  topicId,
  basePath,
  prev,
  next,
}: {
  chapter: Chapter;
  topicId: string;
  basePath: string;
  prev?: { id: string; short: string };
  next?: { id: string; short: string };
}) {
  const exercises = exercisesForChapter(chapter.id, topicId).map((ex) => ({
    id: ex.id,
    title: ex.title,
    testCount: ex.tests.length,
    level: ex.level,
  }));
  const found = syllabusSectionForChapter(chapter.id, topicId);
  const planned = found ? found.section.items : [];

  return (
    <section
      className={`sheet chapter${chapter.ready ? "" : " chapter--soon"}`}
      id={chapter.id}
      aria-labelledby={`${chapter.id}-title`}
    >
      <div className="chapter__head">
        <span className="badge" aria-hidden="true">
          {chapter.num}
        </span>
        <h1 id={`${chapter.id}-title`}>{chapter.title}</h1>
        {chapter.ready && (
          <button className="btn btn--ghost listenbtn" type="button" data-listen={chapter.id}>
            🔊 Listen
          </button>
        )}
      </div>
      {chapter.subtitle && <p className="sub">{chapter.subtitle}</p>}

      {chapter.ready ? (
        <div dangerouslySetInnerHTML={{ __html: chapter.body }} />
      ) : (
        <>
          <div className="soon-stamp">not written yet</div>
          <p>This section will cover:</p>
          <ul className="plan">
            {planned.map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: escapeHtml(item) }} />
            ))}
          </ul>
        </>
      )}

      <PracticeStrip exercises={exercises} />

      <nav className="chapter__foot" aria-label="Chapter navigation">
        {prev ? (
          <Link className="btn pagebtn" href={`${basePath}/${prev.id}`}>
            <span aria-hidden="true">←</span>
            <span>
              <span className="btn__hint">previous</span>
              {prev.short}
            </span>
          </Link>
        ) : (
          <Link className="btn pagebtn" href={basePath}>
            <span aria-hidden="true">↑</span>
            <span>
              <span className="btn__hint">back to</span>The cover
            </span>
          </Link>
        )}
        <span className="chapter__foot-spacer" />
        {chapter.ready && <ChapterDone chapterId={chapter.id} />}
        <Link className="btn btn--ghost" href={basePath} title="Back to the cover">
          ↑ Cover
        </Link>
        {next && (
          <Link className="btn pagebtn pagebtn--next" href={`${basePath}/${next.id}`}>
            <span>
              <span className="btn__hint">next</span>
              {next.short}
            </span>
            <span aria-hidden="true">→</span>
          </Link>
        )}
      </nav>
    </section>
  );
}
