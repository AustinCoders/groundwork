import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const THEME_BLIND =
  /var\(\s*--(green|c-green|red|c-red|c-yellow|c-orange|hl-yellow|hl-mint|hl-pink|sticky-bg|sticky-fg|sticky-mint-bg|sticky-mint-fg|dg-box-green|dg-box-red|dg-box-yellow|dg-yellow-stroke)\s*[,)]/g;

const ROLE_DECLARATION = /(?<![\w-])(--(?:on-)?(?:primary|mark|success|danger|caution|info)(?:-soft)?)\s*:/g;

const CATEGORICAL_SELECTORS: Record<string, string[]> = {
  "app/home.module.css": [
    ".round:hover",
    ".roundNum",
    ".roundGo",
    ".offer",
    ".paperRound",
    ".followUp",
    ".paperCode .codeBar > span:nth-child(1)",
    ".paperCode .codeBar > span:nth-child(2)",
    ".paperCode .codeBar > span:nth-child(3)",
    ".doodleStar",
  ],
  "app/review/review.module.css": [],
  "app/progress/progress.module.css": [
    ".levelUp",
    ".chips span[data-lit]",
    ".badge[data-earned]",
    ".badge[data-earned] .medal",
  ],
  "app/interview/book.module.css": [
    ".companies span[data-hot]",
    ".testBox",
    ".testBox .boxLabel",
    ".sayBox",
    ".sayBox .boxLabel",
    ".trapBox",
    ".trapBox .boxLabel",
    '.bankTags span[data-t="trap"]',
  ],
  "app/mock/mock.module.css": [".avatar", '.avatar[data-tone="sharp"]', '.avatar[data-tone="calm"]'],
  "app/mock/guide.module.css": [".avatar", '.avatar[data-tone="sharp"]'],
  "components/frame/frame.module.css": [],
  "components/SiteDrawer.module.css": [],
  "components/Modal.module.css": [],
};

const FILES = Object.keys(CATEGORICAL_SELECTORS);

type ThemeBlindUse = { line: number; selector: string; token: string };

function lineAt(css: string, index: number): number {
  return css.slice(0, index).split("\n").length;
}

function themeBlindUses(css: string): ThemeBlindUse[] {
  const uses: ThemeBlindUse[] = [];
  const open: string[] = [];
  let chunkStart = 0;

  const scanDeclarations = (end: number) => {
    const selector = [...open].reverse().find((prelude) => !prelude.startsWith("@")) ?? "";
    const chunk = css.slice(chunkStart, end);
    for (const match of chunk.matchAll(THEME_BLIND)) {
      uses.push({ line: lineAt(css, chunkStart + match.index), selector, token: `--${match[1]}` });
    }
  };

  for (let i = 0; i < css.length; i += 1) {
    const ch = css[i];
    if (ch === "{") {
      open.push(css.slice(chunkStart, i).trim().replace(/\s+/g, " "));
      chunkStart = i + 1;
    } else if (ch === "}") {
      scanDeclarations(i);
      open.pop();
      chunkStart = i + 1;
    } else if (ch === ";") {
      scanDeclarations(i);
      chunkStart = i + 1;
    }
  }
  return uses;
}

function outsideCategorical(file: string, css: string, allowedSelectors: string[]): string[] {
  const allowed = new Set(allowedSelectors);
  return themeBlindUses(css)
    .filter((use) => !allowed.has(use.selector))
    .map((use) => `${file}:${use.line} ${use.selector} uses var(${use.token}); use a role token instead`);
}

function localRoleDeclarations(file: string, css: string): string[] {
  return [...css.matchAll(ROLE_DECLARATION)].map(
    (match) => `${file}:${lineAt(css, match.index)} declares ${match[1]}; roles come from the theme`
  );
}

const read = (file: string) => readFileSync(join(process.cwd(), file), "utf8");

describe("theme-blind colours in role-owned modules", () => {
  const fixture = [
    ".keep {",
    "  color: var(--c-red);",
    "}",
    "",
    "@media (max-width: 600px) {",
    "  .button,",
    "  .link {",
    "    color: var(--success);",
    "    background: var(--hl-mint, transparent);",
    "    border-color: color-mix(in srgb, var(--c-green-soft) 50%, var(--line));",
    "  }",
    "}",
  ].join("\n");

  it("finds each fixed colour with its line and selector", () => {
    expect(themeBlindUses(fixture)).toEqual([
      { line: 2, selector: ".keep", token: "--c-red" },
      { line: 9, selector: ".button, .link", token: "--hl-mint" },
    ]);
  });

  it("reports a fixed colour outside the categorical list by file, line, selector and token", () => {
    expect(outsideCategorical("fixture.module.css", fixture, [".keep"])).toEqual([
      "fixture.module.css:9 .button, .link uses var(--hl-mint); use a role token instead",
    ]);
  });

  it("reports a module that declares its own role token by file and line", () => {
    const css = [".page {", "  --primary: var(--c-red);", "  --max: 1200px;", "  color: var(--primary);", "}"].join(
      "\n"
    );
    expect(localRoleDeclarations("fixture.module.css", css)).toEqual([
      "fixture.module.css:2 declares --primary; roles come from the theme",
    ]);
  });

  it.each(FILES)("%s paints actions and states with role tokens", (file) => {
    expect(outsideCategorical(file, read(file), CATEGORICAL_SELECTORS[file])).toEqual([]);
  });

  it.each(FILES)("%s takes its role tokens from the theme instead of declaring them", (file) => {
    expect(localRoleDeclarations(file, read(file))).toEqual([]);
  });

  it.each(FILES)("%s lists only categorical selectors it still uses", (file) => {
    const used = new Set(themeBlindUses(read(file)).map((use) => use.selector));
    const stale = CATEGORICAL_SELECTORS[file].filter((selector) => !used.has(selector));
    expect(stale, `${file} lists categorical selectors that no longer use a fixed colour`).toEqual([]);
  });
});
