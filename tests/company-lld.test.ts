import { describe, expect, it } from "vitest";
import { chapters } from "@/lib/content";
import { diagramProblems } from "@/app/company-questions/diagramLayout";
import { COMPANIES } from "@/content/system-design/company-questions/companies";
import { COMPANY_DSA } from "@/content/system-design/company-questions/dsa-index";
import { COMPANY_QUESTIONS } from "@/content/system-design/company-questions";
import { LLD_DIAGRAMS } from "@/content/system-design/company-questions/lld-diagrams";
import { COMPANY_LLD } from "@/content/system-design/company-questions/lld-index";
import { LLD_TOPICS } from "@/content/system-design/company-questions/lld-topics";

const chapterIds = new Set(chapters("system-design").map((chapter) => chapter.id));
const topicIds = new Set(LLD_TOPICS.map((topic) => topic.id));
const ALLOWED_TAGS = new Set(["p", "ul", "ol", "li", "b", "em", "code"]);
const SECTIONS = ["ask", "entities", "design", "slips"] as const;

const plain = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const words = (html: string) => plain(html).split(" ").filter(Boolean).length;

function deriveEvidence(kinds: string[]): "several" | "one" | "guide" {
  const reports = kinds.filter((kind) => kind === "candidate-report").length;
  if (reports >= 1 && kinds.length >= 2) return "several";
  return reports >= 1 ? "one" : "guide";
}

describe("the machine coding and low-level design answers", () => {
  it("uses ids that cannot collide with the other question kinds", () => {
    const ids = [...COMPANY_LLD, ...COMPANY_DSA, ...COMPANY_QUESTIONS].map((question) => question.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("draws diagrams for every answer and for nothing else", () => {
    const ids = new Set(COMPANY_LLD.map((question) => question.id));
    expect(Object.keys(LLD_DIAGRAMS).filter((id) => !ids.has(id))).toEqual([]);
    for (const question of COMPANY_LLD) {
      const list = LLD_DIAGRAMS[question.id] ?? [];
      expect(list.length, `${question.id} needs two or three diagrams`).toBeGreaterThanOrEqual(2);
      expect(list.length).toBeLessThanOrEqual(3);
      expect(list[0].kind, `${question.id} opens with the class map`).toBe("flow");
      expect(new Set(list.map((diagram) => diagram.title)).size).toBe(list.length);
      for (const diagram of list) expect(diagramProblems(diagram), `${question.id}: ${diagram.title}`).toEqual([]);
    }
  });

  describe.each(COMPANY_LLD.map((question) => [question.id, question] as const))("%s", (id, question) => {
    it("names a known company and topic and starts its id with the company", () => {
      expect(COMPANIES.some((company) => company.id === question.company)).toBe(true);
      expect(id.startsWith(`${question.company}-`)).toBe(true);
      expect(topicIds.has(question.topic)).toBe(true);
      expect(["machine-coding", "lld"]).toContain(question.round);
      expect(question.patterns.length).toBeGreaterThanOrEqual(1);
      expect(question.patterns.length).toBeLessThanOrEqual(4);
    });

    it("links only to chapters that exist", () => {
      for (const chapter of question.chapters)
        expect(chapterIds.has(chapter), `${chapter} is not a system design chapter`).toBe(true);
    });

    it("derives its evidence label from its sources", () => {
      expect(question.sources.length).toBeGreaterThanOrEqual(1);
      const urls = question.sources.map((source) => source.url);
      expect(new Set(urls).size).toBe(urls.length);
      for (const source of question.sources) {
        expect(source.url.startsWith("https://")).toBe(true);
        expect(source.label.length).toBeGreaterThan(8);
        if (source.year !== undefined) expect(source.year).toBeGreaterThanOrEqual(2018);
      }
      expect(question.evidence).toBe(deriveEvidence(question.sources.map((source) => source.kind)));
    });

    it("has a full written answer in the markup the page renders", () => {
      expect(question.prompt.length).toBeGreaterThan(80);
      expect(question.prompt).not.toMatch(/<[^>]+>/);
      const { answer } = question;
      expect(words(answer.ask)).toBeGreaterThanOrEqual(60);
      expect(words(answer.entities)).toBeGreaterThanOrEqual(70);
      expect(words(answer.design)).toBeGreaterThanOrEqual(200);
      expect(words(answer.slips)).toBeGreaterThanOrEqual(60);
      expect(answer.extend.length).toBeGreaterThanOrEqual(4);
      expect(answer.extend.length).toBeLessThanOrEqual(5);
      for (const key of SECTIONS) {
        const html = answer[key];
        for (const [, , tag] of html.matchAll(/<(\/?)([a-z0-9]+)[^>]*>/gi)) {
          expect(ALLOWED_TAGS.has(tag.toLowerCase()), `<${tag}> in ${key}`).toBe(true);
        }
        expect(html).not.toMatch(/\bhref=|\bstyle=|\bon[a-z]+=/i);
        const opens = (html.match(/<(p|ul|ol|li|b|em|code)(\s|>)/g) ?? []).length;
        const closes = (html.match(/<\/(p|ul|ol|li|b|em|code)>/g) ?? []).length;
        expect(opens, `unbalanced tags in ${key}`).toBe(closes);
      }
      for (const item of answer.extend) expect(/[?.]$/.test(item.trim()), item).toBe(true);
    });

    it("ships code with no comments that passes every one of its checks", () => {
      const { code, checks } = question;
      expect(code).not.toMatch(/\/\/|\/\*|console\./);
      expect(code.split("\n").length).toBeLessThanOrEqual(220);
      expect(checks.length).toBeGreaterThanOrEqual(6);
      expect(new Set(checks.map((check) => check.name)).size).toBe(checks.length);
      for (const check of checks) {
        const result = new Function(`${code}\nreturn (${check.expr});`)();
        expect(result, check.name).toEqual(check.expected);
      }
    });

    it("does not claim what a company asked or how it builds anything", () => {
      const text = plain(
        [question.prompt, ...SECTIONS.map((key) => question.answer[key]), ...question.answer.extend].join(" ")
      );
      const name = COMPANIES.find((company) => company.id === question.company)?.name ?? "";
      expect(text).not.toMatch(new RegExp(`\\b${name}\\s+(asked|asks|uses|built|builds|runs|ran)\\b`, "i"));
      expect(text).not.toMatch(/\b(verbatim|real interview question|actual question)\b/i);
      expect(text).not.toMatch(/\bTODO|TBD|FIXME|lorem|undefined|\[object/i);
    });
  });
});
