export type LevelId = "beginner" | "intermediate" | "advanced";

export interface SyllabusSection {
  title: string;
  chapter: string | null;
  items: string[];
}

export interface Level {
  id: LevelId;
  name: string;
  mark: string;
  tagline: string;
  blurb: string;
  bullets: string[];
  checkpoint: string;
  syllabus: SyllabusSection[];
}

export interface Topic {
  id: string;
  name: string;
  mark: string;
  accent: string;
  tagline: string;
  status: "ready" | "soon";
  notes: string | null;
  blurb: string;

  curriculumNotes?: string[] | null;
  levels?: Level[] | null;
  planned?: string[];
}

export interface TopicsData {
  levels: Level[];
  curriculumNotes: string[];
  topics: Topic[];
}

export interface Chapter {
  id: string;
  num: string;
  title: string;
  short: string;
  levels: LevelId[];
  practice: string[];
  ready: boolean;
  subtitle: string;
  body: string;
}

/**
 * A chapter without its body. The reader shell (sidebar, search, nav) only
 * ever needs this — keeping bodies out of it is what stops every chapter
 * of a topic being shipped to the browser to read one of them.
 *
 * readMinutes is precomputed on the server precisely because working it
 * out requires the body.
 */
export interface ChapterMeta extends Omit<Chapter, "body"> {
  readMinutes: number;
}

export interface NotesFile {
  meta: {
    title: string;
    subtitle: string;
    lead: string;
    author: string;
    updated: string;
  };
  hero: { figure: string };
  chapters: Chapter[];
}

export interface ExerciseTest {
  name: string;
  body: string;
}

export interface Exercise {
  id: string;
  chapter: string;
  level: LevelId;
  title: string;
  brief: string;
  starter: string;
  hints: string[];
  solution: string;
  tests: ExerciseTest[];
}
