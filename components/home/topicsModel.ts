import { compactSpan, plural } from "@/lib/format";
import { HUB, HUB_LINE, type Metro } from "@/lib/metro";
import { TOPIC_CATEGORIES } from "@/lib/topicCategories";
import type { HomeViewProps, ShelfCard } from "./types";

export interface Topic {
  id: string;
  name: string;
  mark: string;
  tone: string;
  tagline: string;
  category: string;
  href: string;
  written: boolean;
  chapters: number;
  chip: string;
  meta: string;
  label: string;
}

export interface Glyph {
  dots: { x: number; y: number; lit: boolean }[];
  lines: string;
}

const CATEGORY_TONE: Record<string, string> = {
  languages: "yellow",
  web: "blue",
  backend: "green",
  data: "teal",
  cs: "orange",
  devops: "purple",
  engineering: "red",
  ai: "ink",
  [HUB]: "red",
};

const FALLBACK_TONE = "grey";
const START_TOPIC_ID = "js";

export const toneOfCategory = (category: string): string => CATEGORY_TONE[category] ?? FALLBACK_TONE;

function fromCard(card: ShelfCard, written: boolean): Topic {
  return {
    id: card.id,
    name: card.name,
    mark: card.mark,
    tone: card.accent,
    tagline: card.tagline,
    category: card.category ?? HUB,
    href: card.href,
    written,
    chapters: written ? card.chapters : 0,
    chip: written ? plural(card.chapters, "chapter") : "Coming soon",
    meta: written
      ? [card.exercises > 0 ? plural(card.exercises, "exercise") : "", compactSpan(card.minutes)]
          .filter(Boolean)
          .join(" · ")
      : "",
    label: written ? `${card.name}, ${plural(card.chapters, "chapter")}, written` : `${card.name}, coming soon`,
  };
}

export function buildTopics(ready: ShelfCard[], soon: ShelfCard[], interview: HomeViewProps["interview"]): Topic[] {
  const book: Topic = {
    id: "interview",
    name: "Interview book",
    mark: "◎",
    tone: "red",
    tagline: "Every round, every question, the answer.",
    category: HUB,
    href: "/interview",
    written: true,
    chapters: 0,
    chip: plural(interview.rounds, "round"),
    meta: `${interview.questions}+ questions`,
    label: `Interview book, ${plural(interview.rounds, "round")}, written`,
  };
  const hubRank = TOPIC_CATEGORIES.findIndex((category) => category.id === HUB_LINE) + 0.5;
  const rank = (topic: Topic) => {
    if (topic.category === HUB) return hubRank;
    const index = TOPIC_CATEGORIES.findIndex((category) => category.id === topic.category);
    return index < 0 ? TOPIC_CATEGORIES.length : index;
  };
  return [...ready.map((card) => fromCard(card, true)), ...soon.map((card) => fromCard(card, false)), book].sort(
    (a, b) => rank(a) - rank(b) || Number(b.written) - Number(a.written)
  );
}

const ALIASES: Record<string, { topics?: string[]; category?: string }> = {
  k8s: { topics: ["kubernetes"] },
  golang: { topics: ["go"] },
  postgres: { topics: ["databases"] },
  postgresql: { topics: ["databases"] },
  mongo: { topics: ["mongodb"] },
  js: { topics: ["js"] },
  ts: { topics: ["typescript"] },
  py: { topics: ["python"] },
  frontend: { category: "web" },
  backend: { category: "backend" },
  ai: { category: "ai" },
};

function squash(text: string): string {
  return text
    .toLowerCase()
    .replace(/\+\+/g, "plusplus")
    .replace(/\bplus\s+plus\b/g, "plusplus")
    .replace(/[^a-z0-9+#]/g, "");
}

export function findTopics(topics: Topic[], query: string): Topic[] {
  const needle = squash(query);
  if (needle === "") return [];
  const alias = ALIASES[needle];
  return topics.filter(
    (topic) =>
      squash(topic.name).includes(needle) ||
      squash(topic.id).includes(needle) ||
      (alias?.topics?.includes(topic.id) ?? false) ||
      (alias?.category !== undefined && topic.category === alias.category)
  );
}

export function exactTopic(topics: Topic[], query: string): Topic | undefined {
  const needle = squash(query);
  if (needle === "") return undefined;
  const alias = ALIASES[needle]?.topics;
  return topics.find(
    (topic) => squash(topic.name) === needle || squash(topic.id) === needle || alias?.[0] === topic.id
  );
}

export function legendCell(index: number, active: number, count: number): { row: number; column: number } {
  const perColumn = Math.ceil(count / 2);
  const row = index % perColumn;
  return { row: row + 1 + (row > active % perColumn ? 1 : 0), column: Math.floor(index / perColumn) + 1 };
}

export function legendChipsRow(active: number, count: number): number {
  return (active % Math.ceil(count / 2)) + 2;
}

export function startTopic(ready: ShelfCard[]): ShelfCard | undefined {
  return ready.find((card) => card.id === START_TOPIC_ID) ?? [...ready].sort((a, b) => b.chapters - a.chapters)[0];
}

const GLYPH_W = 40;
const GLYPH_H = 24;
const GLYPH_PAD = 4;

export function lineGlyph(metro: Metro, lineId: string): Glyph | null {
  const line = metro.lines.find((item) => item.id === lineId);
  if (!line) return null;
  const members = metro.stations.filter((station) => station.lines.includes(lineId));
  const xs = line.points.map((point) => point[0]);
  const ys = line.points.map((point) => point[1]);
  const left = Math.min(...xs);
  const top = Math.min(...ys);
  const spanX = Math.max(...xs) - left;
  const spanY = Math.max(...ys) - top;
  const scale = Math.min(
    spanX > 0 ? (GLYPH_W - GLYPH_PAD * 2) / spanX : Infinity,
    spanY > 0 ? (GLYPH_H - GLYPH_PAD * 2) / spanY : Infinity
  );
  const fit = Number.isFinite(scale) ? scale : 1;
  const at = (x: number, y: number) => ({
    x: GLYPH_W / 2 + (x - left - spanX / 2) * fit,
    y: GLYPH_H / 2 + (y - top - spanY / 2) * fit,
  });
  const route = line.points.map((point, i) => {
    const place = at(point[0], point[1]);
    return `${i === 0 ? "M" : "L"}${place.x.toFixed(1)} ${place.y.toFixed(1)}`;
  });
  return {
    dots: members.map((station) => ({ ...at(station.x, station.y), lit: station.lit })),
    lines: route.join(""),
  };
}

export const GLYPH_FRAME = `0 0 ${GLYPH_W} ${GLYPH_H}`;
