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

const COMPANIES: CompanyType[] = ["service", "product", "saas", "agency"];

interface TalkSource {
  round: string;
  onlyFor?: TalkItem["onlyFor"];
}

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

const BULK = /rapid-fire|the rest of|the ten numbers|implementations they ask|say out loud/i;

export const NOT_A_QUESTION = new Set([
  "r1-9",
  "r1-10",
  "r1tp-1",
  "r1tp-2",
  "r1tp-3",
  "r1tp-4",
  "r1tp-6",
  "r6-6",
  "r8-7",
  "r11lp-1",
  "r11lp-2",
  "r11lp-7",
  "s4-0",
  "r12-0",
  "r12-6",
  "r12lv-2",
  "r12lv-4",
  "r12lv-5",
]);

export const AS_ASKED: Record<string, string> = {
  "r1tp-5": "We have a few minutes left. What would you like to ask me?",
  "r3-3": "When would you use Promise.all, allSettled, race and any?",
  "r3ts-0": "When do you reach for an interface, and when for a type alias?",
  "r3ts-3": "What is the difference between any, unknown and never?",
  "s3-1": "How does garbage collection work in V8, and how would you find a memory leak?",
  "s3-2": "Walk me through the browser rendering pipeline. What triggers each stage?",
  "s3-3": "How does Node handle concurrency? Where are the threads, and what is event loop lag?",
  "s3-4": "What do HTTP/2 and HTTP/3 change, and what does opening a connection actually cost?",
  "s2-0":
    "Before you design anything, estimate it: ten million daily users. Requests per second, and storage per year?",
  "s2-1": "Explain CAP and PACELC. Which consistency model would you pick, and when?",
  "s2-2": "Why does naive hashing fall apart when you add a node, and how does consistent hashing fix it?",
  "s2-3": "How do you choose a sharding key, and what happens when you choose the wrong one?",
  "s2-4": "How do you keep data consistent across two services? Two-phase commit, or a saga?",
  "s2-5": "Can you guarantee exactly-once delivery? If not, what do you do instead?",
  "s2-6": "How does Kafka keep ordering? Talk me through partitions, consumer groups and a rebalance.",
  "s2-7": "Design a chat system for millions of users.",
  "s2-8": "Design a news feed. How do you choose between fan-out on write and fan-out on read?",
  "s2-9": "Design a payment system.",
  "s2-10": "At this scale, how do you keep the system observable and reliable?",
  "r11-6": "That's all from me. Do you have any questions for us?",
  "r12-4": "Honestly, that is a very high expectation for your experience.",
  "r12-8": "Your current company has made a counter-offer. What are you going to do?",
  "r12lv-1": "We'd like to offer you the role, one level below the one you applied for. How do you feel about that?",
};

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

export function parseLadder(after: string | undefined): { ladder?: LadderRung[]; rest: string } {
  if (!after || !after.includes('class="ladder"')) return { rest: after || "" };
  const start = after.indexOf('<div class="ladder">');
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
    const id = `${r.id}-${index}`;
    if (NOT_A_QUESTION.has(id)) return;
    const { ladder, rest } = parseLadder(q.after);
    const answer = [q.a || "", codeHTML(q.code), rest].filter(Boolean).join("");
    out.push({
      id,
      kind: "talk",
      stage,
      origin: r.id,
      originTitle: `${r.code} · ${r.navTitle}`,
      level: "any",
      onlyFor: source.onlyFor,
      prompt: AS_ASKED[id] ?? q.q,
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
