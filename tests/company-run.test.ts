import { describe, expect, it } from "vitest";
import { assert } from "@/lib/assertKit";
import { codingChecks, codingPrefill, lldChecks, lldPrefill } from "@/lib/companyRun";
import { COMPANY_DSA } from "@/content/system-design/company-questions/dsa-index";
import { COMPANY_LLD } from "@/content/system-design/company-questions/lld-index";

const exec = (code: string, body: string) => new Function("assert", `${code}\n${body}`)(assert);

describe("the checks the answer pages run in the browser", () => {
  describe.each(COMPANY_DSA.map((question) => [question.id, question] as const))("%s", (_id, question) => {
    const { solution } = question;

    it("keeps its cases JSON safe, so they survive being written into a test body", () => {
      expect(JSON.parse(JSON.stringify(solution.cases))).toEqual(solution.cases);
    });

    it("passes every generated check with the shipped code", () => {
      const checks = codingChecks(solution.entry, solution.cases);
      expect(checks).toHaveLength(solution.cases.length);
      for (const check of checks) expect(() => exec(solution.code, check.body), check.name).not.toThrow();
    });

    it("fails a check when the code gives a wrong answer", () => {
      const wrong = `${solution.code}\nconst __real = ${solution.entry};\nfunction ${solution.entry}() { return "wrong"; }`;
      const failing = codingChecks(solution.entry, solution.cases).filter((check) => {
        try {
          exec(`function ${solution.entry}() { return "wrong"; }`, check.body);
          return false;
        } catch {
          return true;
        }
      });
      expect(wrong.length).toBeGreaterThan(0);
      expect(failing.length).toBeGreaterThan(0);
    });

    it("prefills a call that prints something", () => {
      expect(codingPrefill(solution.entry, solution.cases)).toMatch(
        new RegExp(`^console\\.log\\(${solution.entry}\\(`)
      );
    });
  });

  describe.each(COMPANY_LLD.map((question) => [question.id, question] as const))("%s", (_id, question) => {
    it("keeps its expected values JSON safe", () => {
      expect(JSON.parse(JSON.stringify(question.checks.map((check) => check.expected)))).toEqual(
        question.checks.map((check) => check.expected)
      );
    });

    it("passes every generated check with the shipped code", () => {
      const checks = lldChecks(question.checks);
      expect(checks).toHaveLength(question.checks.length);
      for (const check of checks) expect(() => exec(question.code, check.body), check.name).not.toThrow();
    });

    it("prefills an expression that prints something", () => {
      expect(lldPrefill(question.checks)).toMatch(/^console\.log\(/);
    });
  });
});
