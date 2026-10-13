import { STATE_TEXT, type ChapterState } from "@/lib/chapterState";
import { plural } from "@/lib/format";
import type { ShellCard, ShellChapter, ShellGroup, ShellMark, ShellPart } from "./types";

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
    .map((part) => {
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
      return {
        id: part.level,
        name: part.title,
        chapters,
        written: written.length,
        read: done ? written.filter((card) => done.has(card.id)).length : 0,
        yours: yourLevel === part.level,
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
  const total = plural(group.written, "chapter");
  return counting && group.read > 0 ? `${group.read} / ${group.written} read` : total;
}

export function heroStatus(read: number, written: number, nextTitle: string | null): string {
  const base = `${read} / ${written} read`;
  if (nextTitle) return `${base} · next: ${nextTitle}`;
  return read >= written ? `${base} · every chapter read` : `${base} · your plan is done`;
}
