import { INTERVIEW_ROUNDS_RAW } from "@/content/interview-data";
import type { InterviewCodeBlock, InterviewQuestionRaw, InterviewRoundRaw } from "@/content/interview-types";
import { chapters, exercises, topics } from "@/lib/content";
import { mockQuestions, type MockQuestion } from "@/lib/mockQuestions";
import { problemHref } from "@/lib/practiceLinks";
import { STAGE_ORDER, STAGE_RULES } from "@/lib/mock/loops";
import type {
  CodingItem,
  CompanyType,
  LadderRung,
  MockItem,
  Seniority,
  StageId,
  StageInfo,
  TalkItem,
} from "@/lib/mock/types";

/**
 * Everything the mock interview can ask, gathered from the three places it
 * lives: the interview book's rounds, the JavaScript and React chapter banks,
 * and the runnable exercises. Server-only — it reads the content modules —
 * and served per stage as static JSON so the browser only downloads the rounds
 * its loop actually runs.
 */

const COMPANIES: CompanyType[] = ["service", "product", "saas", "agency"];

interface TalkSource {
  round: string;
  /** Only ask this round's questions at these levels or company types. */
  onlyFor?: TalkItem["onlyFor"];
}

/** Which book rounds and banks feed each talk stage. */
const TALK_SOURCES: Partial<Record<StageId, (TalkSource | "js-bank" | "react-bank")[]>> = {
  screening: [{ round: "r1" }],
  phone: [{ round: "r1tp" }],
  javascript: [
    { round: "r3" },
    { round: "r3ts" },
    "js-bank",
    { round: "s3", onlyFor: { seniority: ["senior"], company: ["product", "saas"] } },
  ],
  react: [{ round: "r4" }, { round: "r4fe" }, "react-bank"],
  backend: [{ round: "r5" }, { round: "r6" }],
  design: [{ round: "r8" }, { round: "s2", onlyFor: { seniority: ["senior"], company: ["product", "saas"] } }],
  infra: [{ round: "r9" }],
  resume: [{ round: "r10" }],
  behaviour: [
    { round: "r11" },
    { round: "r11lp", onlyFor: { company: ["product", "saas"] } },
    { round: "s4", onlyFor: { seniority: ["senior"], company: ["product", "saas"] } },
  ],
  hr: [{ round: "r12" }, { round: "r12lv", onlyFor: { seniority: ["mid", "senior"], company: ["product", "saas"] } }],
};

/** Which book rounds say whether a company type runs this stage, and supply
 *  its header — who asks, what it decides, how it is lost. */
const TIER_SOURCES: Record<StageId, string[]> = {
  screening: ["r1"],
  phone: ["r1tp"],
  coding: ["r1oa", "r7"],
  machine: ["r2"],
  javascript: ["r3"],
  react: ["r4"],
  backend: ["r5"],
  design: ["r8"],
  infra: ["r9"],
  resume: ["r10"],
  behaviour: ["r11"],
  hr: ["r12"],
};

const STAGE_TITLE: Record<StageId, string> = {
  screening: "Screening call",
  phone: "Tech phone screen",
  coding: "Coding",
  machine: "Machine coding",
  javascript: "JavaScript & TypeScript",
  react: "React & the frontend",
  backend: "Node & databases",
  design: "System design",
  infra: "Shipping it: AWS, Docker, CI",
  resume: "Resume grilling",
  behaviour: "Behavioural",
  hr: "HR & the number",
};

export function stageTitle(stage: StageId): string {
  return STAGE_TITLE[stage];
}

// Reference lists rather than questions: "the rest of the rapid-fire round".
const BULK = /rapid-fire|the rest of|the ten numbers|implementations they ask|say out loud/i;

function round(id: string): InterviewRoundRaw | undefined {
  return INTERVIEW_ROUNDS_RAW.find((r) => r.id === id);
}

function meta(r: InterviewRoundRaw | undefined, key: string): string {
  return (r?.meta || []).find(([k]) => k === key)?.[1] || "";
}

function codeHTML(blocks: InterviewCodeBlock | InterviewCodeBlock[] | undefined): string {
  if (!blocks) return "";
  const list = Array.isArray(blocks) ? blocks : [blocks];
  return list
    .map((b) => (b.label ? `<div class="codelabel">${b.label}</div>` : "") + `<pre><code>${b.code}</code></pre>`)
    .join("");
}

const RUNG_LEVEL: [RegExp, Seniority][] = [
  [/^2/, "junior"],
  [/^5/, "mid"],
  [/^10/, "senior"],
];

function inner(html: string, cls: string): string {
  const m = new RegExp(`<p class="${cls}">([\\s\\S]*?)</p>`).exec(html);
  return m ? m[1].trim() : "";
}

/** The "same answer at three levels" block, parsed so the room can show only
 *  the bar for the level you are interviewing at. */
export function parseLadder(after: string | undefined): { ladder?: LadderRung[]; rest: string } {
  if (!after || !after.includes('class="ladder"')) return { rest: after || "" };
  const start = after.indexOf('<div class="ladder">');
  // The ladder is the last block in every question that has one.
  const block = after.slice(start);
  const rest = after.slice(0, start).trim();
  const rungs: LadderRung[] = [];
  for (const piece of block.split('<div class="rung">').slice(1)) {
    const label = (/<span class="lv">([\s\S]*?)<\/span>/.exec(piece)?.[1] || "").trim();
    const level = RUNG_LEVEL.find(([re]) => re.test(label))?.[1];
    if (!level) continue;
    rungs.push({
      level,
      label,
      bar: inner(piece, "bar").replace(/^<b>The bar:<\/b>\s*/, ""),
      script: inner(piece, "script"),
      why: inner(piece, "why").replace(/^<b>[^<]*<\/b>\s*/, ""),
    });
  }
  return { ladder: rungs.length ? rungs : undefined, rest };
}

function bookItems(stage: StageId, source: TalkSource): TalkItem[] {
  const r = round(source.round);
  if (!r) return [];
  const out: TalkItem[] = [];
  r.qs.forEach((q: InterviewQuestionRaw, index) => {
    if (BULK.test(q.q)) return;
    const { ladder, rest } = parseLadder(q.after);
    const answer = [q.a || "", codeHTML(q.code), rest].filter(Boolean).join("");
    out.push({
      id: `${r.id}-${index}`,
      kind: "talk",
      stage,
      origin: r.id,
      originTitle: `${r.code} · ${r.navTitle}`,
      level: "any",
      onlyFor: source.onlyFor,
      prompt: q.q,
      testing: q.test || undefined,
      answer: answer || undefined,
      say: q.say || undefined,
      trap: q.trap || undefined,
      note: q.note || undefined,
      followUps: q.fu || [],
      ladder,
      href: `/interview/${r.id}`,
    });
  });
  return out;
}

const BANK_LEVEL: Record<MockQuestion["level"], TalkItem["level"]> = {
  fresher: "junior",
  mid: "mid",
  senior: "senior",
  drill: "any",
};

let bankCache: MockQuestion[] | null = null;
function banks(): MockQuestion[] {
  return (bankCache ||= mockQuestions());
}

function bankItems(stage: StageId, source: "js" | "react"): TalkItem[] {
  return banks()
    .filter((q) => q.source === source)
    .map((q) => ({
      id: `bank-${q.id}`,
      kind: "talk" as const,
      stage,
      origin: `${source}-bank`,
      originTitle: source === "js" ? "JavaScript interview bank" : "React interview bank",
      level: BANK_LEVEL[q.level],
      prompt: q.questionHtml,
      answer: q.answerHtml,
      followUps: [],
      href: q.href,
    }));
}

let chapterTopic: Map<string, string> | null = null;
function topicOfChapter(chapterId: string): string {
  if (!chapterTopic) {
    chapterTopic = new Map();
    for (const t of topics()) for (const ch of chapters(t.id)) chapterTopic.set(ch.id, t.id);
  }
  return chapterTopic.get(chapterId) || "";
}

function codingItems(stage: "coding" | "machine"): CodingItem[] {
  const wanted = stage === "machine" ? "component" : "function";
  return exercises()
    .filter((ex) => (ex.kind || "function") === wanted)
    .map((ex) => ({
      id: ex.id,
      kind: "coding" as const,
      stage,
      title: ex.title,
      level: ex.level as CodingItem["level"],
      exercise: wanted,
      tests: ex.tests.length,
      topic: topicOfChapter(ex.chapter),
      href: problemHref(ex.id),
    }));
}

/** Every question the stage can draw on. */
export function stageBank(stage: StageId): MockItem[] {
  if (STAGE_RULES[stage].kind === "coding") return codingItems(stage as "coding" | "machine");
  return (TALK_SOURCES[stage] || []).flatMap((src) =>
    src === "js-bank"
      ? bankItems(stage, "js")
      : src === "react-bank"
        ? bankItems(stage, "react")
        : bookItems(stage, src)
  );
}

/** Which company types run each stage as a normal part of their loop. */
export function stageHotFor(): Record<StageId, CompanyType[]> {
  const out = {} as Record<StageId, CompanyType[]>;
  for (const stage of STAGE_ORDER) {
    const hot = new Set<CompanyType>();
    for (const id of TIER_SOURCES[stage]) {
      for (const [name, on] of round(id)?.tiers || []) {
        if (on && COMPANIES.includes(name as CompanyType)) hot.add(name as CompanyType);
      }
    }
    out[stage] = COMPANIES.filter((c) => hot.has(c));
  }
  return out;
}

export interface MockCatalog {
  stages: StageInfo[];
  hotFor: Record<StageId, CompanyType[]>;
}

/** What the setup screen needs to plan a loop, and nothing more — the
 *  questions themselves are fetched per stage once a loop is chosen. */
export function mockCatalog(): MockCatalog {
  const stages = STAGE_ORDER.map((stage): StageInfo => {
    const primary = round(TIER_SOURCES[stage][TIER_SOURCES[stage].length - 1]);
    const rule = STAGE_RULES[stage];
    return {
      id: stage,
      code: primary?.code || "",
      title: STAGE_TITLE[stage],
      kind: rule.kind,
      competency: rule.competency,
      who: meta(primary, "Who"),
      decides: meta(primary, "Decides"),
      failMode: meta(primary, "Fail mode"),
      available: stageBank(stage).length,
    };
  });
  return { stages, hotFor: stageHotFor() };
}
