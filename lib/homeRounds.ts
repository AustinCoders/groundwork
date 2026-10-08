import type { BankQuestion, BookRound } from "@/lib/interviewBook";

export interface HomeRound {
  id: string;
  code: string;
  title: string;
  href: string;
  tests: string;
  wrong: string;
  sample: string;
}

export const TESTS_LIMIT = 160;
export const WRONG_LIMIT = 160;
export const SAMPLE_LIMIT = 120;

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

export function plainText(html: string | null | undefined): string {
  if (!html) return "";
  return decode(html.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

export function truncate(text: string, limit: number): string {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit - 1);
  const space = cut.lastIndexOf(" ");
  const head = space > limit * 0.6 ? cut.slice(0, space) : cut;
  return `${head.replace(/[\s,;:.\-–—]+$/, "")}…`;
}

function failMode(round: Pick<BookRound, "meta">): string {
  return round.meta.find(([key]) => key === "Fail mode")?.[1] ?? "";
}

export function homeRounds(
  rounds: Pick<BookRound, "id" | "code" | "navTitle" | "meta">[],
  questions: Pick<BankQuestion, "roundId" | "q" | "test" | "trap">[]
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
        tests: truncate(plainText(first?.test), TESTS_LIMIT),
        wrong: truncate(plainText(first?.trap) || plainText(failMode(round)), WRONG_LIMIT),
        sample: truncate(plainText(first?.q), SAMPLE_LIMIT),
      };
    });
}
