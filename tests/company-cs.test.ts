import { describe, expect, it } from "vitest";
import { COMPANIES } from "@/content/system-design/company-questions/companies";
import { CS_SETS } from "@/content/system-design/company-questions/cs-index";
import { bookRound } from "@/lib/interviewBook";

const ALLOWED_TAGS = new Set(["p", "ul", "ol", "li", "b", "em", "code"]);
const companyIds = new Set(COMPANIES.map((company) => company.id));
const ROOTS = new Set([
  "/level/dsa",
  "/system-design",
  "/dbms",
  "/os",
  "/networks",
  "/databases",
  "/mock",
  "/whiteboard",
  "/problems",
]);

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

describe("the CS fundamentals and SQL question sets", () => {
  it("has the five sets, once each", () => {
    expect(CS_SETS.map((set) => set.id).sort()).toEqual(["dbms", "networks", "oop", "os", "sql"]);
  });

  it("gives every question a unique id across all sets", () => {
    const ids = CS_SETS.flatMap((set) => set.questions.map((question) => question.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  describe.each(CS_SETS.map((set) => [set.id, set] as const))("%s", (_id, set) => {
    it("has enough questions across its themes", () => {
      expect(set.questions.length).toBeGreaterThanOrEqual(14);
      expect(set.themes.length).toBeGreaterThanOrEqual(3);
      const themeIds = new Set(set.themes.map((theme) => theme.id));
      for (const theme of set.themes)
        expect(
          set.questions.some((question) => question.theme === theme.id),
          `${theme.id} is empty`
        ).toBe(true);
      for (const question of set.questions) expect(themeIds.has(question.theme), question.id).toBe(true);
      expect(set.intro.length).toBeGreaterThan(80);
    });

    it("links only to pages that exist", () => {
      for (const link of [...set.chapters, ...set.questions.flatMap((question) => question.links ?? [])]) {
        expect(link.label.length).toBeLessThanOrEqual(48);
        const interview = link.href.match(/^\/interview\/([a-z0-9]+)$/);
        if (interview) expect(bookRound(interview[1]), link.href).toBeTruthy();
        else
          expect(
            ROOTS.has(link.href) || /^\/(os|dbms|networks|databases)\/[a-z0-9-]+$/.test(link.href),
            link.href
          ).toBe(true);
      }
    });

    describe.each(set.questions.map((question) => [question.id, question] as const))("%s", (id, question) => {
      it("names real companies and derives its evidence from its sources", () => {
        expect(id.startsWith(`${set.id}-`)).toBe(true);
        for (const company of question.companies) expect(companyIds.has(company), company).toBe(true);
        expect(question.sources.length).toBeGreaterThanOrEqual(1);
        const urls = question.sources.map((source) => source.url);
        expect(new Set(urls).size).toBe(urls.length);
        for (const source of question.sources) expect(source.url.startsWith("https://")).toBe(true);
        expect(question.evidence).toBe(deriveEvidence(question.sources.map((source) => source.kind)));
      });

      it("has a short model answer in the markup the page renders", () => {
        expect(question.q.length).toBeGreaterThan(15);
        expect(question.q).not.toMatch(/<[^>]+>/);
        expect(words(question.a)).toBeGreaterThanOrEqual(45);
        expect(words(question.a)).toBeLessThanOrEqual(220);
        for (const [, , tag] of question.a.matchAll(/<(\/?)([a-z0-9]+)[^>]*>/gi))
          expect(ALLOWED_TAGS.has(tag.toLowerCase()), `<${tag}>`).toBe(true);
        expect(question.a).not.toMatch(/\bhref=|\bstyle=|\bon[a-z]+=|—/i);
        const opens = (question.a.match(/<(p|ul|ol|li|b|em|code)(\s|>)/g) ?? []).length;
        const closes = (question.a.match(/<\/(p|ul|ol|li|b|em|code)>/g) ?? []).length;
        expect(opens).toBe(closes);
        expect(plain(question.a)).not.toMatch(/\b(TODO|TBD|FIXME|lorem|undefined)\b/i);
      });

      it("never claims what a company asked", () => {
        const text = plain(question.a);
        for (const company of COMPANIES)
          expect(text).not.toMatch(new RegExp(`\\b${company.name}\\s+(asked|asks|uses|built|builds|runs|ran)\\b`, "i"));
      });

      if (set.id === "sql") {
        it("pairs a query with its result", () => {
          expect(question.query, "sql questions carry a query").toBeTruthy();
          expect(question.query).not.toMatch(/--|\/\*/);
          expect(question.result?.rows.length).toBeGreaterThanOrEqual(1);
          for (const row of question.result?.rows ?? []) expect(row).toHaveLength(question.result!.head.length);
        });
      }
    });
  });
});
