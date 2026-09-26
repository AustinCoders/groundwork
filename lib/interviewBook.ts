import { INTERVIEW_ROUNDS_RAW } from "@/content/interview-data";
import type { InterviewCodeBlock, InterviewQuestionRaw, InterviewRoundRaw } from "@/content/interview-types";
import type { StageId } from "@/lib/mock/types";

export type BookPart = "before" | "technical" | "people" | "offer" | "staff" | "prep";

export const PARTS: { id: BookPart; title: string; blurb: string }[] = [
  {
    id: "before",
    title: "Before the loop",
    blurb:
      "How your profile reads from the other side, the recruiter call, and the three filters that end most loops before anyone talks to you.",
  },
  {
    id: "technical",
    title: "The technical rounds",
    blurb: "Machine coding, the language, the framework, the backend, data, algorithms, design and shipping it.",
  },
  {
    id: "people",
    title: "The people rounds",
    blurb: "Your resume under a microscope, behaviour, and Amazon's Leadership Principles loop.",
  },
  {
    id: "offer",
    title: "The offer",
    blurb: "The number, levels and equity at big companies, and working for a company abroad.",
  },
  {
    id: "staff",
    title: "The ₹50L track",
    blurb: "What changes at the senior bar: hard DSA, distributed systems, runtime internals and staff-level stories.",
  },
  {
    id: "prep",
    title: "The week before",
    blurb: "A plan for the last seven days, and for the one night if that is all you have.",
  },
];

const PART_OF: Record<string, BookPart> = {
  scout: "before",
  r1: "before",
  r1oa: "before",
  r1th: "before",
  r1tp: "before",
  r10: "people",
  r11: "people",
  r11lp: "people",
  r12: "offer",
  r12lv: "offer",
  r13: "offer",
  plan: "prep",
};

const MOCK_STAGE: Record<string, StageId> = {
  r1: "screening",
  r1tp: "phone",
  r1oa: "coding",
  r7: "coding",
  r2: "machine",
  r3: "javascript",
  r3ts: "javascript",
  r4: "react",
  r4fe: "react",
  r5: "backend",
  r6: "backend",
  r8: "design",
  r9: "infra",
  r10: "resume",
  r11: "behaviour",
  r11lp: "behaviour",
  r12: "hr",
};

const GUIDES = new Set(["scout", "s0", "plan"]);

const BULK_TITLE = /rapid-fire|the rest of|the ten numbers|implementations they ask|say out loud/i;

export interface BookQuestion {
  id: string;
  n: number;
  q: string;
  test: string | null;
  a: string | null;
  code: InterviewCodeBlock[];
  say: string | null;
  trap: string | null;
  note: string | null;
  after: string | null;
  fu: string[];
  bulk: boolean;
}

export interface BookRound {
  id: string;
  code: string;
  navTitle: string;
  title: string;
  part: BookPart;
  guide: boolean;
  meta: [string, string][];
  companies: { name: string; hot: boolean }[];
  intro: string | null;
  pre: string | null;
  post: string | null;
  questions: BookQuestion[];
  mockStage: StageId | null;
  minutes: number;
  counts: { questions: number; followUps: number; traps: number; code: number };
}

const COMPANY = new Set(["service", "product", "saas", "agency"]);

function words(html: string | undefined | null): number {
  if (!html) return 0;
  return html
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

function toQuestion(round: InterviewRoundRaw, q: InterviewQuestionRaw, i: number): BookQuestion {
  const code = q.code ? (Array.isArray(q.code) ? q.code : [q.code]) : [];
  return {
    id: `${round.id}-${i + 1}`,
    n: i + 1,
    q: q.q,
    test: q.test ?? null,
    a: q.a ?? null,
    code,
    say: q.say ?? null,
    trap: q.trap ?? null,
    note: q.note ?? null,
    after: q.after ?? null,
    fu: q.fu ?? [],
    bulk: GUIDES.has(round.id) || BULK_TITLE.test(q.q),
  };
}

function toRound(r: InterviewRoundRaw): BookRound {
  const questions = r.qs.map((q, i) => toQuestion(r, q, i));
  const total =
    words(r.intro) +
    words(r.pre) +
    words(r.post) +
    r.qs.reduce(
      (n, q) => n + words(q.q) + words(q.test) + words(q.a) + words(q.say) + words(q.trap) + words(q.after),
      0
    );
  return {
    id: r.id,
    code: r.code,
    navTitle: r.navTitle,
    title: r.title,
    part: r.lv === 2 ? "staff" : (PART_OF[r.id] ?? "technical"),
    guide: GUIDES.has(r.id),
    meta: r.meta ?? [],
    companies: (r.tiers ?? []).filter(([n]) => COMPANY.has(n)).map(([name, hot]) => ({ name, hot: Boolean(hot) })),
    intro: r.intro ?? null,
    pre: r.pre ?? null,
    post: r.post ?? null,
    questions,
    mockStage: MOCK_STAGE[r.id] ?? null,
    minutes: Math.max(1, Math.round(total / 220)),
    counts: {
      questions: questions.filter((q) => !q.bulk).length,
      followUps: questions.reduce((n, q) => n + q.fu.length, 0),
      traps: questions.filter((q) => q.trap).length,
      code: questions.filter((q) => q.code.length).length,
    },
  };
}

let cache: BookRound[] | null = null;

export function bookRounds(): BookRound[] {
  if (!cache) cache = INTERVIEW_ROUNDS_RAW.map(toRound);
  return cache;
}

export function bookRound(id: string): BookRound | null {
  return bookRounds().find((r) => r.id === id) ?? null;
}

export interface RoundCard {
  id: string;
  code: string;
  navTitle: string;
  title: string;
  part: BookPart;
  guide: boolean;
  sections: number;
  intro: string | null;
  companies: { name: string; hot: boolean }[];
  minutes: number;
  counts: BookRound["counts"];
  questionIds: string[];
  who: string | null;
  decides: string | null;
}

function metaValue(r: BookRound, key: string): string | null {
  return r.meta.find(([k]) => k === key)?.[1] ?? null;
}

export function roundCards(): RoundCard[] {
  return bookRounds().map((r) => ({
    id: r.id,
    code: r.code,
    navTitle: r.navTitle,
    title: r.title,
    part: r.part,
    guide: r.guide,
    sections: r.questions.length,
    intro: r.intro,
    companies: r.companies,
    minutes: r.minutes,
    counts: r.counts,
    questionIds: r.questions.map((q) => q.id),
    who: metaValue(r, "Who"),
    decides: metaValue(r, "Decides"),
  }));
}

export interface BankQuestion {
  id: string;
  roundId: string;
  roundCode: string;
  roundTitle: string;
  part: BookPart;
  q: string;
  test: string | null;
  say: string | null;
  trap: string | null;
  fu: string[];
  hasCode: boolean;
}

export function bankQuestions(): BankQuestion[] {
  return bookRounds().flatMap((r) =>
    r.questions
      .filter((q) => !q.bulk)
      .map((q) => ({
        id: q.id,
        roundId: r.id,
        roundCode: r.code,
        roundTitle: r.navTitle,
        part: r.part,
        q: q.q,
        test: q.test,
        say: q.say,
        trap: q.trap,
        fu: q.fu,
        hasCode: q.code.length > 0,
      }))
  );
}
