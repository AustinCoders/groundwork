import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const THEME_BLIND =
  /var\(\s*--(green|c-green|red|c-red|c-yellow|c-orange|hl-yellow|hl-mint|hl-pink|sticky-bg|sticky-fg|sticky-mint-bg|sticky-mint-fg|dg-box-green|dg-box-red|dg-box-yellow|dg-yellow-stroke|ide-accent|ide-green|ide-red|ide-yellow)\s*[,)]/g;

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
  "app/problems/problems.module.css": [".page", ".sheetRoot"],
  "app/whiteboard/whiteboard.module.css": [".paperMargin", ".laser", '.swatch[data-value="none"]'],
  "components/series/landing.module.css": [".page"],
  "app/architecture/architecture.module.css": [".page"],
  "components/series/chapter.module.css": [],
  "components/AppearancePicker.module.css": [],
};

const FILES = Object.keys(CATEGORICAL_SELECTORS);

const GLOBALS = "app/globals.css";

const GLOBAL_CATEGORICAL_SELECTORS = [
  ".daily-recap",
  ".g",
  ".r",
  ".sticky",
  ".sticky.mint",
  ".warn",
  ".dg .rd",
  ".dg .gr",
  ".boxg",
  ".boxr",
  ".boxy",
  ".lnr",
  ".lng",
  ".demo__term .ok",
  ".ev-box--inner",
  ".loop-frame--stack",
  ".loop-frame--micro",
  ".loop-frame--macro",
  ".loop-frame--out",
  ".tone-yes",
  ".tone-warn",
  ".tone-bad",
  ".bx.is-prim",
  ".bx.is-ref",
  ".unit.is-pair",
  ".stat-card--a .stat-card__icon",
  ".stat-card--c .stat-card__icon",
  ".stat-card--d .stat-card__icon",
  ".badge-card.is-earned",
  ".badge-card.is-earned::after",
  ".level-up-banner",
  ".t-yellow",
  ".t-mint",
  ".t-red",
  ".tag--beginner",
  ".tag--intermediate",
  ".tag--advanced",
  ".soon-stamp",
  ".hint",
  ".ed__tl--red",
  ".ed__tl--yellow",
  ".ed__tl--green",
  ".viz__cell--lo",
  ".viz__cell--hi",
  ".viz__cell--mid, .viz__cell--hot",
  ".viz__cell--done",
  ".viz__gcell--hot",
  ".viz__gcell--done",
  ".interview-body .tier.hot",
  ".interview-body .prep",
  ".interview-body .prep .ttl",
  ".interview-body tr.hi td",
  ".interview-body .card.g",
  ".interview-body .card.r",
  ".interview-body .card.y",
  ".interview-body .pill.y",
  ".interview-body .pill.m",
  ".interview-body .pill.r",
  ".c3d__plane.is-kept",
  ".c3d__plane.is-hot",
  ".c3d__badge",
  ".c3d__link",
  ".viz-node.is-done",
  ".viz-badge",
  ".viz-badge--work",
  ".viz-phase.is-yours::after",
  ".viz-rect--server",
  ".viz-rect--client",
  ".viz-vertex.is-visited circle",
];

const THEME_BLOCK_PART = /^(?::root|\[data-theme(?:="[\w-]+")?\])$/;

const SOURCE_MARKER_FILLS: Record<string, Record<string, string>> = {
  "components/practice/CodeEditor.tsx": {},
  "components/reader/narration.ts": {},
  "components/reader/ReaderShell.tsx": { "arrow-green": "--green", "arrow-red": "--red" },
  "components/series/ChapterView.tsx": { "arrow-green": "--green", "arrow-red": "--red" },
};

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

function isThemeBlock(selector: string): boolean {
  return selector.split(",").every((part) => THEME_BLOCK_PART.test(part.trim()));
}

function globalRuleUses(css: string): ThemeBlindUse[] {
  return themeBlindUses(css).filter((use) => !isThemeBlock(use.selector));
}

function outsideCategorical(file: string, uses: ThemeBlindUse[], allowedSelectors: string[]): string[] {
  const allowed = new Set(allowedSelectors);
  return uses
    .filter((use) => !allowed.has(use.selector))
    .map((use) => `${file}:${use.line} ${use.selector} uses var(${use.token}); use a role token instead`);
}

function markerAround(source: string, index: number): string | undefined {
  const listed = /\["([\w-]+)",\s*"$/.exec(source.slice(Math.max(0, index - 80), index));
  if (listed) return listed[1];
  const open = source.lastIndexOf("<marker", index);
  if (open < 0 || source.lastIndexOf("</marker>", index) > open) return undefined;
  return /\bid="([^"]+)"/.exec(source.slice(open, index))?.[1];
}

function outsideMarkerFills(file: string, source: string, markerFills: Record<string, string>): string[] {
  return [...source.matchAll(THEME_BLIND)]
    .filter((match) => markerFills[markerAround(source, match.index) ?? ""] !== `--${match[1]}`)
    .map((match) => `${file}:${lineAt(source, match.index)} uses var(--${match[1]}); use a role token instead`);
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
    expect(outsideCategorical("fixture.module.css", themeBlindUses(fixture), [".keep"])).toEqual([
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
    expect(outsideCategorical(file, themeBlindUses(read(file)), CATEGORICAL_SELECTORS[file])).toEqual([]);
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

describe("theme-blind colours in the global rules", () => {
  it("skips the theme and shared token blocks but scans theme-scoped rules", () => {
    const fixture = [
      ":root,",
      '[data-theme="light"] {',
      "  --ide-accent: var(--green);",
      "}",
      "",
      ":root,",
      "[data-theme] {",
      "  --c-red: var(--red);",
      "}",
      "",
      '[data-theme="dark"] h2::after {',
      "  background: var(--hl-yellow);",
      "}",
      "",
      ".lc-topbar .btn--run {",
      "  background: var(--ide-accent);",
      "}",
    ].join("\n");
    expect(outsideCategorical(GLOBALS, globalRuleUses(fixture), [])).toEqual([
      'app/globals.css:12 [data-theme="dark"] h2::after uses var(--hl-yellow); use a role token instead',
      "app/globals.css:16 .lc-topbar .btn--run uses var(--ide-accent); use a role token instead",
    ]);
  });

  it(`${GLOBALS} paints actions, links, progress, selection and highlights with role tokens`, () => {
    expect(outsideCategorical(GLOBALS, globalRuleUses(read(GLOBALS)), GLOBAL_CATEGORICAL_SELECTORS)).toEqual([]);
  });

  it(`${GLOBALS} lists only categorical selectors it still uses`, () => {
    const used = new Set(globalRuleUses(read(GLOBALS)).map((use) => use.selector));
    const stale = GLOBAL_CATEGORICAL_SELECTORS.filter((selector) => !used.has(selector));
    expect(stale, `${GLOBALS} lists categorical selectors that no longer use a fixed colour`).toEqual([]);
  });
});

describe("theme-blind colours in the editor and the reader", () => {
  it("allows a fixed colour only as the fill of a named diagram marker", () => {
    const source = [
      '<marker id="arrow-green">',
      '  <path style={{ fill: "var(--green)" }} />',
      "</marker>",
      '<path style={{ fill: "var(--green)" }} />',
      '<marker id="arrow-red">',
      '  <path style={{ fill: "var(--green)" }} />',
      "</marker>",
      '["arrow-red", "var(--red)"],',
      '["arrow-red", "var(--green)"],',
    ].join("\n");
    expect(outsideMarkerFills("fixture.tsx", source, { "arrow-green": "--green", "arrow-red": "--red" })).toEqual([
      "fixture.tsx:4 uses var(--green); use a role token instead",
      "fixture.tsx:6 uses var(--green); use a role token instead",
      "fixture.tsx:9 uses var(--green); use a role token instead",
    ]);
  });

  it.each(Object.keys(SOURCE_MARKER_FILLS))("%s paints highlights, actions and states with role tokens", (file) => {
    expect(outsideMarkerFills(file, read(file), SOURCE_MARKER_FILLS[file])).toEqual([]);
  });
});
