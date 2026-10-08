import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { chapters, topics } from "@/lib/content";
import {
  blockSource,
  duplicateBlockIds,
  javascriptBlocks,
  markedBlockCount,
  syntaxErrors,
  translationGaps,
  TRANSLATED_LANGUAGES,
  type TranslatedLanguage,
} from "@/lib/dsaCode";

const CODE_DIR = join(process.cwd(), "content", "dsa", "code");

const withBlocks = topics()
  .flatMap((t) => chapters(t.id))
  .filter((c) => c.ready && markedBlockCount(c.body) > 0);

async function translationsOf(chapterId: string) {
  const found: Partial<Record<TranslatedLanguage, Record<string, string>>> = {};
  for (const language of TRANSLATED_LANGUAGES) {
    if (!existsSync(join(CODE_DIR, chapterId, `${language}.ts`))) continue;
    const loaded = await import(`../content/dsa/code/${chapterId}/${language}.ts`);
    found[language] = loaded.code;
  }
  return found;
}

describe("DSA chapter code in four languages", () => {
  it("finds the chapters that carry marked code blocks", () => {
    expect(withBlocks.map((c) => c.id)).toEqual(expect.arrayContaining(["dsa-binary-search", "dsa-two-pointers"]));
  });

  it("writes every marked block as a div around one pre and code, with a unique id", () => {
    for (const chapter of withBlocks) {
      const ids = Object.keys(javascriptBlocks(chapter.body));
      expect(ids.length, `${chapter.id} has a malformed data-code block`).toBe(markedBlockCount(chapter.body));
      expect(duplicateBlockIds(chapter.body), `${chapter.id} repeats a block id`).toEqual([]);
    }
  });

  it("has a code folder only for chapters that carry marked blocks", () => {
    const folders = existsSync(CODE_DIR) ? readdirSync(CODE_DIR) : [];
    expect(folders.sort()).toEqual(withBlocks.map((c) => c.id).sort());
  });

  describe("completeness", () => {
    for (const chapter of withBlocks) {
      it(`${chapter.id} has Python, Java and C++ for every block and nothing extra`, async () => {
        const ids = Object.keys(javascriptBlocks(chapter.body));
        expect(translationGaps(ids, await translationsOf(chapter.id))).toEqual([]);
      });
    }

    it("fails when a translation is removed", () => {
      const ids = ["a", "b"];
      const full = { python: { a: "x", b: "y" }, java: { a: "x", b: "y" }, cpp: { a: "x", b: "y" } };
      expect(translationGaps(ids, full)).toEqual([]);
      expect(translationGaps(ids, { ...full, cpp: undefined })).toEqual(["cpp: no file"]);
      expect(translationGaps(ids, { ...full, java: { a: "x" } })).toEqual(["java: b missing or empty"]);
      expect(translationGaps(ids, { ...full, python: { a: "x", b: "  " } })).toEqual(["python: b missing or empty"]);
      expect(translationGaps(ids, { ...full, python: { a: "x", b: "y", c: "z" } })).toEqual([
        "python: c is not a block in the chapter",
      ]);
    });
  });

  describe("syntax", () => {
    for (const chapter of withBlocks) {
      it(`${chapter.id} parses in all four languages without error nodes`, async () => {
        const translations = await translationsOf(chapter.id);
        const problems: string[] = [];
        for (const [id, html] of Object.entries(javascriptBlocks(chapter.body))) {
          for (const error of syntaxErrors("javascript", blockSource(html)))
            problems.push(`javascript ${id}: ${error}`);
          for (const language of TRANSLATED_LANGUAGES) {
            const translated = translations[language]?.[id] ?? "";
            for (const error of syntaxErrors(language, blockSource(translated))) {
              problems.push(`${language} ${id}: ${error}`);
            }
          }
        }
        expect(problems).toEqual([]);
      });
    }

    it("keeps markup out of the translations apart from comment spans", async () => {
      for (const chapter of withBlocks) {
        const translations = await translationsOf(chapter.id);
        for (const language of TRANSLATED_LANGUAGES) {
          for (const [id, html] of Object.entries(translations[language] ?? {})) {
            const stripped = html.replace(/<span class="c">/g, "").replace(/<\/span>/g, "");
            expect(stripped, `${chapter.id} ${language} ${id} has markup besides comment spans`).not.toMatch(
              /<|&(?!lt;|gt;|amp;|quot;|#39;)/
            );
          }
        }
      }
    });

    it("decodes entities and strips comment spans before parsing", () => {
      expect(blockSource('if (a &lt; b) <span class="c">// ok</span>')).toBe("if (a < b) // ok");
      expect(blockSource("if (a <= b) { x < y }")).toBe("if (a <= b) { x < y }");
    });

    const valid: Record<string, string> = {
      javascript: "function f(a) {\n  return a + 1;\n}",
      python: "def f(a):\n    return a + 1\n",
      java: "static int f(int a) {\n    return a + 1;\n}",
      cpp: "int f(int a) {\n    return a + 1;\n}",
    };
    const broken: Record<string, string> = {
      javascript: "function f(a {\n  return a + ;\n}",
      python: "def f(a)\n    return a + 1\n",
      java: "static int f(int a) {\n    return a + 1;\n",
      cpp: "int f(int a) {\n    return (a + 1;\n}",
    };

    for (const language of ["javascript", "python", "java", "cpp"] as const) {
      it(`accepts valid ${language} and fails on a syntax error in ${language}`, () => {
        expect(syntaxErrors(language, valid[language])).toEqual([]);
        expect(syntaxErrors(language, broken[language]).length).toBeGreaterThan(0);
      });
    }
  });
});
