import type { BankQuestion, BookRound } from "@/lib/interviewBook";

type HomeStageId = "screening" | "technical" | "design" | "people";

export interface HomeRound {
  id: string;
  code: string;
  title: string;
  href: string;
  stage: HomeStageId;
  tests: string;
  wrong: string;
  sample: string;
  followUp: string;
  questions: number;
  followUps: number;
  minutes: number;
}

export const HOME_STAGES: { id: HomeStageId; label: string; last: number }[] = [
  { id: "screening", label: "Screening", last: 1 },
  { id: "technical", label: "Technical", last: 5 },
  { id: "design", label: "Design and depth", last: 9 },
  { id: "people", label: "People and offer", last: Infinity },
];

export interface BookStage {
  id: HomeStageId;
  label: string;
  number: number;
  first: number;
  items: { round: HomeRound; index: number }[];
}

export function stageOf(code: string): HomeStageId {
  const number = Number(/^R(\d+)/.exec(code)?.[1]);
  const found = HOME_STAGES.find((stage) => number <= stage.last);
  return (found ?? HOME_STAGES[HOME_STAGES.length - 1]).id;
}

export const TESTS_LIMIT = 160;
export const WRONG_LIMIT = 160;
export const SAMPLE_LIMIT = 120;
export const FOLLOW_UP_LIMIT = 110;

const NAMED: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  mdash: "—",
  ndash: "–",
  hellip: "…",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
};

function decode(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, body: string) => {
    if (body[0] === "#") {
      const code = body[1].toLowerCase() === "x" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : whole;
    }
    return NAMED[body.toLowerCase()] ?? whole;
  });
}

const BLOCK_TAG = /<\/?(?:p|br|li|ul|ol|div|h[1-6]|tr|td|th|table|blockquote|pre|section|article)\b[^>]*>/gi;

export function plainText(html: string | null | undefined): string {
  if (!html) return "";
  return decode(html.replace(BLOCK_TAG, " ").replace(/<[^>]*>/g, ""))
    .replace(/\s+/g, " ")
    .trim();
}

const SENTENCE_END = /[.!?]["'”’)\]]*(?=\s|$)/g;
const ABBREVIATION = /(?:^|[\s(])(?:e\.g|i\.e|vs|approx)\.$/i;
const MIN_SENTENCE_SHARE = 0.4;

function lastSentenceEnd(text: string, limit: number): number {
  let end = -1;
  for (const match of text.matchAll(SENTENCE_END)) {
    const stop = match.index + match[0].length;
    if (stop > limit) break;
    if (!ABBREVIATION.test(text.slice(0, match.index + 1))) end = stop;
  }
  return end;
}

export function truncate(text: string, limit: number): string {
  if (text.length <= limit) return text;
  const sentence = lastSentenceEnd(text, limit);
  if (sentence >= limit * MIN_SENTENCE_SHARE) return text.slice(0, sentence);
  const cut = text.slice(0, limit - 1);
  const space = cut.lastIndexOf(" ");
  const head = space > limit * 0.5 ? cut.slice(0, space) : cut;
  return `${head.replace(/[\s,;:.\-–—]+$/, "")}…`;
}

function failMode(round: Pick<BookRound, "meta">): string {
  return round.meta?.find(([key]) => key === "Fail mode")?.[1] ?? "";
}

export function homeRounds(
  rounds: Pick<BookRound, "id" | "code" | "navTitle" | "meta" | "minutes" | "counts">[],
  questions: Pick<BankQuestion, "roundId" | "q" | "test" | "trap" | "fu">[]
): HomeRound[] {
  return rounds
    .filter((round) => /^R/.test(round.code))
    .map((round) => {
      const first = questions.find((question) => question.roundId === round.id);
      return {
        id: round.id,
        code: round.code,
        title: round.navTitle,
        href: `/interview/${round.id}`,
        stage: stageOf(round.code),
        tests: truncate(plainText(first?.test), TESTS_LIMIT),
        wrong: truncate(plainText(first?.trap) || plainText(failMode(round)), WRONG_LIMIT),
        sample: truncate(plainText(first?.q), SAMPLE_LIMIT),
        followUp: truncate(plainText(first?.fu?.[0]), FOLLOW_UP_LIMIT),
        questions: round.counts?.questions ?? 0,
        followUps: round.counts?.followUps ?? 0,
        minutes: round.minutes ?? 0,
      };
    });
}

export function bookStages(rounds: HomeRound[]): BookStage[] {
  return HOME_STAGES.map((stage) => ({
    id: stage.id,
    label: stage.label,
    number: 0,
    first: rounds.findIndex((round) => round.stage === stage.id),
    items: rounds.flatMap((round, index) => (round.stage === stage.id ? [{ round, index }] : [])),
  }))
    .filter((stage) => stage.items.length > 0)
    .map((stage, k) => ({ ...stage, number: k + 1 }));
}
