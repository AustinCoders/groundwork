import { chapters, exercises, hasNotes, htmlMinutes, topicExerciseCount, topics, totalTime } from "@/lib/content";
import { GIT_BODY_HTML, GIT_SECTIONS } from "@/content/git-body";
import { onShelf } from "@/lib/topicIds";

export interface TopicStat {
  written: number;
  planned: number;
  exercises: number;
  minutes: number;
}

export interface SiteStats {
  writtenChapters: number;
  exercises: number;
  minutes: number;
  topics: number;
}

const SINGLE_PAGE_STATS: Record<string, TopicStat> = {
  git: {
    written: GIT_SECTIONS.length,
    planned: 0,
    exercises: 0,
    minutes: htmlMinutes(GIT_BODY_HTML),
  },
};

export function topicStats(): Record<string, TopicStat> {
  const out: Record<string, TopicStat> = {};
  topics().forEach((t) => {
    if (!t.levels && SINGLE_PAGE_STATS[t.id]) {
      out[t.id] = SINGLE_PAGE_STATS[t.id];
      return;
    }
    const all = t.levels || hasNotes(t.id) ? chapters(t.id) : [];
    const written = all.filter((c) => c.ready);
    out[t.id] = {
      written: written.length,
      planned: t.levels ? all.length : (t.planned || []).length,
      exercises: t.levels ? topicExerciseCount(t) : 0,
      minutes: totalTime(written),
    };
  });
  return out;
}

export function siteStats(): SiteStats {
  const list = topics();
  const stats = topicStats();
  const totals = list.reduce(
    (acc, t) => {
      const stat = stats[t.id];
      return { chapters: acc.chapters + stat.written, minutes: acc.minutes + stat.minutes };
    },
    { chapters: 0, minutes: 0 }
  );
  return {
    writtenChapters: totals.chapters,
    exercises: exercises().length,
    minutes: totals.minutes,
    topics: list.filter((t) => onShelf(t.id)).length,
  };
}
