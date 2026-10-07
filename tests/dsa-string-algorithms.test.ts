import { describe, expect, it } from "vitest";
import { chapter } from "@/lib/content";

const ENTITIES: Record<string, string> = { lt: "<", gt: ">", amp: "&", quot: '"', "#39": "'" };

const body = chapter("dsa-string-algorithms", "dsa")?.body ?? "";

const codeBlocks = [...body.matchAll(/<pre\b[^>]*>([\s\S]*?)<\/pre>/g)].map((match) =>
  match[1]
    .replace(/<[^>]+>/g, "")
    .replace(/&(lt|gt|amp|quot|#39);/g, (_, name: string) => ENTITIES[name])
    .replace(/\u0000/g, "")
);

function blockDefining(name: string): string {
  const block = codeBlocks.find((code) => code.includes(`function ${name}(`));
  if (!block) throw new Error(`no code block in the chapter defines ${name}`);
  return block;
}

function load<Names extends string>(blocks: string[], names: Names[]): Record<Names, (...args: string[]) => unknown> {
  return new Function(`${blocks.join("\n")}\nreturn { ${names.join(", ")} };`)();
}

const { zSearch } = load([blockDefining("zFunction"), blockDefining("zSearch")], ["zSearch"]);
const { shortestPalindrome } = load(
  [blockDefining("buildFailure"), blockDefining("shortestPalindrome")],
  ["shortestPalindrome"]
);

function occurrences(text: string, pattern: string): number[] {
  const found: number[] = [];
  for (let i = 0; i + pattern.length <= text.length; i++) {
    if (text.startsWith(pattern, i)) found.push(i);
  }
  return found;
}

function everyString(alphabet: string, maxLength: number): string[] {
  let level = [""];
  const all = [""];
  for (let length = 1; length <= maxLength; length++) {
    level = level.flatMap((prefix) => [...alphabet].map((letter) => prefix + letter));
    all.push(...level);
  }
  return all;
}

describe("the string-algorithms chapter's own code", () => {
  it("finds the chapter's examples", () => {
    expect(body).not.toBe("");
    expect(codeBlocks.length).toBeGreaterThan(3);
  });

  it("uses a visible separator and says why it is needed", () => {
    expect(blockDefining("zSearch")).toContain('pattern + "#" + text');
    expect(body).toContain("The separator must be a character that cannot occur in either string");
    expect(body).toContain('This code uses <code>"#"</code>');
  });

  it("finds every occurrence with zSearch", () => {
    expect(zSearch("abab", "ab")).toEqual([0, 2]);
    expect(zSearch("aaaaa", "aa")).toEqual([0, 1, 2, 3]);
    expect(zSearch("abcabcabc", "cab")).toEqual([2, 5]);
    expect(zSearch("abc", "d")).toEqual([]);
  });

  it("agrees with a brute-force search on every small string over two letters", () => {
    for (const text of everyString("ab", 6)) {
      for (const pattern of everyString("ab", 3).filter(Boolean)) {
        expect(zSearch(text, pattern), `zSearch(${JSON.stringify(text)}, ${JSON.stringify(pattern)})`).toEqual(
          occurrences(text, pattern)
        );
      }
    }
  });

  it("says what breaks when the separator occurs in the input, and it does", () => {
    expect(body).toContain('<code>zSearch("a#", "a")</code> returns <code>[]</code>');
    expect(body).toContain('<code>shortestPalindrome("a#a")</code> shows');
    expect(zSearch("a#", "a")).toEqual([]);
    expect(shortestPalindrome("a#a")).not.toBe("a#a");
  });

  it("prepends the fewest characters with shortestPalindrome", () => {
    expect(shortestPalindrome("aacecaaa")).toBe("aaacecaaa");
    expect(shortestPalindrome("abcd")).toBe("dcbabcd");
    expect(shortestPalindrome("")).toBe("");
  });
});
