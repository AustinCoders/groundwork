import { describe, expect, it } from "vitest";
import { extractCode, parseTranslateRequest, translatePrompt } from "@/lib/translate";

describe("translating code", () => {
  it("accepts a request between two known languages and refuses the rest", () => {
    expect(parseTranslateRequest({ code: "print(1)", from: "python", to: "ruby" })).toEqual({
      code: "print(1)",
      from: "python",
      to: "ruby",
      shape: undefined,
    });
    expect(parseTranslateRequest({ code: "", from: "python", to: "ruby" })).toMatch(/no code/);
    expect(parseTranslateRequest({ code: "x", from: "python", to: "cobol" })).toMatch(/Unknown target/);
    expect(parseTranslateRequest({ code: "x", from: "python", to: "python" })).toMatch(/different language/);
    expect(parseTranslateRequest({ code: "x".repeat(20_001), from: "python", to: "ruby" })).toMatch(/too long/);
  });

  it("asks for the grader's function shape when there is one", () => {
    const { system, user } = translatePrompt({
      code: "function twoSum(a, t) {}",
      from: "javascript",
      to: "python",
      shape: "def twoSum(nums: list[int], target: int) -> list[int]:",
    });
    expect(system).toContain("idiomatic Python");
    expect(user).toContain("def twoSum(nums: list[int], target: int) -> list[int]:");
  });

  it("takes the code out of the reply's fence", () => {
    expect(extractCode("Here:\n```python\ndef f():\n    return 1\n```\nDone.")).toBe("def f():\n    return 1\n");
    expect(extractCode("puts 1")).toBe("puts 1\n");
    expect(extractCode("```\n\n```")).toBeNull();
  });
});
