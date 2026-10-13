import { STATE_TEXT, type ChapterState } from "@/lib/chapterState";
import { plural } from "@/lib/format";
import type {
  ShellCard,
  ShellChapter,
  ShellGroup,
  ShellMark,
  ShellPart,
  ShellTone,
  StageStatus,
  ShellUpNext,
} from "./types";

export const STAGE_TONES: readonly ShellTone[] = ["green", "orange", "purple", "blue", "teal", "red"];

export const STATUS_TEXT: Record<StageStatus, string> = {
  yours: "your level",
  next: "up next",
  started: "in progress",
  fresh: "not started",
  done: "all read",
};

export function stageStatus(group: Pick<ShellGroup, "read" | "written" | "yours">, hasNext: boolean): StageStatus {
  if (group.written > 0 && group.read >= group.written) return "done";
  if (group.yours) return "yours";
  if (hasNext) return "next";
  return group.read > 0 ? "started" : "fresh";
}

export function peekFor(chapters: readonly ShellChapter[], read: number, written: number): string | null {
  if (written > 0 && read >= written) return "Every chapter read";
  const next = chapters.find((chapter) => chapter.next) ?? chapters.find((chapter) => chapter.mark.kind === "todo");
  if (!next) return written === 0 ? "Chapters are on their way" : null;
  return next.next || read > 0 ? `Next stop: ${next.title}` : `Starts with ${next.title}`;
}

export function percent(read: number, written: number): number {
  return written > 0 ? Math.min(100, Math.round((read / written) * 100)) : 0;
}

export function upNextOf(chapter: ShellChapter | undefined): ShellUpNext | null {
  if (!chapter) return null;
  const meta: string[] = [];
  if (chapter.minutes > 0) meta.push(`${chapter.minutes} min`);
  if (chapter.exercises > 0) meta.push(plural(chapter.exercises, "exercise"));
  return { code: chapter.code, title: chapter.title, meta: meta.join(" · ") };
}

const SOON: ShellMark = { kind: "soon", label: "coming soon", word: "soon" };
const TODO: ShellMark = { kind: "todo", label: "not read yet", word: null };
const READ: ShellMark = { kind: "read", label: "read", word: "read" };

export function markFor(
  card: Pick<ShellCard, "id" | "ready">,
  done: ReadonlySet<string> | null,
  states: ReadonlyMap<string, ChapterState> | null
): ShellMark {
  if (!card.ready) return SOON;
  const state = states?.get(card.id);
  if (state === "checked") return { kind: "checked", label: STATE_TEXT.checked, word: "checked" };
  if (state === "not-checked")
    return { kind: "unchecked", label: "read, " + STATE_TEXT["not-checked"], word: "not checked" };
  if (state === "tested-out") return { kind: "skipped", label: STATE_TEXT["tested-out"], word: "tested out" };
  if (state === "read-before-checks") return { ...READ, label: `read, ${STATE_TEXT["read-before-checks"]}` };
  if (done?.has(card.id)) return READ;
  return TODO;
}

export interface GroupInput {
  parts: readonly ShellPart[];
  cards: readonly ShellCard[];
  basePath: string;
  done: ReadonlySet<string> | null;
  states: ReadonlyMap<string, ChapterState> | null;
  nextId: string | null;
  reviseIds: ReadonlySet<string>;
  yourLevel: string | null;
  openLevel: string | null;
  titleOf: (card: ShellCard) => string;
}

export function buildGroups(input: GroupInput): ShellGroup[] {
  const { parts, cards, basePath, done, states, nextId, reviseIds, yourLevel, openLevel, titleOf } = input;
  return parts
    .map((part, index) => {
      const inLevel = cards.filter((card) => card.levels.includes(part.level));
      const chapters: ShellChapter[] = inLevel.map((card) => {
        const mark = markFor(card, done, states);
        const next = card.id === nextId;
        const revise = card.ready && reviseIds.has(card.id) && mark.kind === "todo";
        return {
          id: card.id,
          code: card.num,
          title: titleOf(card),
          href: `${basePath}/${card.id}`,
          minutes: card.minutes,
          exercises: card.exercises,
          written: card.ready,
          mark,
          tag: next ? "up next" : revise ? "revise earlier" : null,
          next,
        };
      });
      const written = inLevel.filter((card) => card.ready);
      const read = done ? written.filter((card) => done.has(card.id)).length : 0;
      const yours = yourLevel === part.level;
      return {
        id: part.level,
        name: part.title,
        promise: part.promise ?? null,
        tone: STAGE_TONES[index % STAGE_TONES.length],
        status: stageStatus(
          { read, written: written.length, yours },
          chapters.some((chapter) => chapter.next)
        ),
        peek: peekFor(chapters, read, written.length),
        chapters,
        written: written.length,
        read,
        yours,
        open: openLevel === part.level,
      };
    })
    .filter((group) => group.chapters.length > 0);
}

export function currentLevel(
  cards: readonly ShellCard[],
  nextId: string | null,
  yourLevel: string | null,
  fallback: string | null
): string | null {
  const next = cards.find((card) => card.id === nextId);
  return next?.levels[0] ?? yourLevel ?? fallback;
}

export function groupSummary(group: Pick<ShellGroup, "read" | "written">, counting: boolean): string {
  return counting ? `${group.read} / ${group.written} read` : plural(group.written, "chapter");
}

export function heroStatus(read: number, written: number, nextTitle: string | null): string {
  const base = `${read} / ${written} read`;
  if (nextTitle) return `${base} · next: ${nextTitle}`;
  return read >= written ? `${base} · every chapter read` : `${base} · your plan is done`;
}
