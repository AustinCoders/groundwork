import type { ChapterMeta, Level, SyllabusSection } from "@/content/types";

export type LevelRow =
  | { ready: true; chapter: ChapterMeta; section?: undefined }
  | { ready: false; section: SyllabusSection; chapter: ChapterMeta | null };

/**
 * Takes an id → chapter-metadata map rather than looking chapters up
 * itself: this runs inside client components, and importing lib/content
 * here would pull every chapter body into the browser bundle.
 */
export function levelRows(level: Level, chapterById: Record<string, ChapterMeta>): LevelRow[] {
  const seenChapters: Record<string, boolean> = {};
  const rows: LevelRow[] = [];

  (level.syllabus || []).forEach((section) => {
    const chapter = (section.chapter && chapterById[section.chapter]) || null;

    if (chapter && chapter.ready) {
      if (seenChapters[chapter.id]) return;
      seenChapters[chapter.id] = true;
      rows.push({ ready: true, chapter });
    } else {
      rows.push({ ready: false, section, chapter });
    }
  });

  return rows;
}

export function byChapterId(list: ChapterMeta[]): Record<string, ChapterMeta> {
  const map: Record<string, ChapterMeta> = {};
  list.forEach((ch) => {
    map[ch.id] = ch;
  });
  return map;
}
