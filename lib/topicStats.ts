import { chapters, exercises, topicExerciseCount, topics, totalTime } from "@/lib/content";

/**
 * Counts the home page needs. Computed on the server so the landing page
 * never imports chapter bodies just to say "34 chapters written".
 */
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

export function topicStats(): Record<string, TopicStat> {
  const out: Record<string, TopicStat> = {};
  topics().forEach((t) => {
    const all = t.levels ? chapters(t.id) : [];
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
  const written = list.filter((t) => t.levels).flatMap((t) => chapters(t.id).filter((c) => c.ready));
  return {
    writtenChapters: written.length,
    exercises: exercises().length,
    minutes: totalTime(written),
    topics: list.length,
  };
}
