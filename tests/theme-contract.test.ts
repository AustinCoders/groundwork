import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { THEME_ITEMS } from "@/lib/storage";
import { hasColourLiteral } from "./colour-literal";

const GLOBALS = "app/globals.css";
const STORAGE = "lib/storage.ts";

const THEME_PART = /^\[data-theme="([\w-]+)"\]$/;
const SHARED_PART = /^(?::root|\[data-theme\])$/;
const CUSTOM_PROPERTY = /(?<![\w-])(--[\w-]+)\s*:\s*([^;]+);/g;
const COLOR_SCHEME = /(?<![\w-])color-scheme\s*:\s*([^;]+);/;
const REFERENCE = /var\(\s*(--[\w-]+)/g;
const SHARED_READ = /var\(\s*(--(?:scrim|ide-[\w-]+))\s*\)/g;
const ICON_AND_NAME = /^\S+\s\S/;

type Token = { value: string; line: number };
type Rule = { selector: string; line: number; tokens: Map<string, Token>; colorScheme: string | undefined };
type ThemeBlock = Rule & { name: string };
type Sheet = { base: ThemeBlock | undefined; themes: ThemeBlock[]; shared: Rule | undefined };

function lineAt(text: string, index: number): number {
  return text.slice(0, index).split("\n").length;
}

function topLevelRules(css: string): Rule[] {
  const rules: Rule[] = [];
  let depth = 0;
  let preludeStart = 0;
  let bodyStart = 0;
  let selector = "";
  let line = 0;

  for (let i = 0; i < css.length; i += 1) {
    const ch = css[i];
    if (ch === "{") {
      if (depth === 0) {
        const prelude = css.slice(preludeStart, i);
        selector = prelude.trim().replace(/\s+/g, " ");
        line = lineAt(css, preludeStart + prelude.length - prelude.trimStart().length);
        bodyStart = i + 1;
      }
      depth += 1;
    } else if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        const body = css.slice(bodyStart, i);
        const tokens = new Map<string, Token>();
        for (const match of body.matchAll(CUSTOM_PROPERTY)) {
          tokens.set(match[1], { value: match[2].trim(), line: lineAt(css, bodyStart + match.index) });
        }
        rules.push({ selector, line, tokens, colorScheme: COLOR_SCHEME.exec(body)?.[1].trim() });
        preludeStart = i + 1;
      }
    } else if (ch === ";" && depth === 0) {
      preludeStart = i + 1;
    }
  }
  return rules;
}

function readSheet(css: string): Sheet {
  const themes: ThemeBlock[] = [];
  let base: ThemeBlock | undefined;
  let shared: Rule | undefined;

  for (const rule of topLevelRules(css)) {
    const parts = rule.selector.split(",").map((part) => part.trim());
    if (parts.every((part) => SHARED_PART.test(part)) && parts.includes("[data-theme]")) shared = rule;
    if (!parts.every((part) => part === ":root" || THEME_PART.test(part))) continue;
    for (const part of parts) {
      const name = THEME_PART.exec(part)?.[1];
      if (!name) continue;
      const block = { ...rule, name };
      themes.push(block);
      if (parts.includes(":root")) base = block;
    }
  }
  return { base, themes, shared };
}

function colourTokens(base: ThemeBlock): Set<string> {
  return new Set([...base.tokens].filter(([, token]) => hasColourLiteral(token.value)).map(([name]) => name));
}

function schemeMismatches(sheet: Sheet, cssFile = GLOBALS): string[] {
  return sheet.themes
    .filter((theme) => !theme.colorScheme)
    .map(
      (theme) =>
        `${cssFile}:${theme.line} ${theme.selector} sets no color-scheme; add color-scheme: light or dark so native controls match`
    );
}

function itemMismatches(
  items: readonly { value: string; label: string }[],
  storageSource: string,
  storageFile = STORAGE
): string[] {
  const values = items.map((item) => item.value);
  return [
    ...values
      .filter((value, i) => values.indexOf(value) !== i)
      .map((value) => `${storageFile}${entryLine(storageSource, value)} THEME_ITEMS lists "${value}" twice`),
    ...items
      .filter((item) => !ICON_AND_NAME.test(item.label))
      .map(
        (item) =>
          `${storageFile}${entryLine(storageSource, item.value)} THEME_ITEMS labels "${item.value}" "${item.label}"; write an icon, a space and the name`
      ),
  ];
}

function declaredTokens(css: string): Set<string> {
  return new Set([...css.matchAll(CUSTOM_PROPERTY)].map((match) => match[1]));
}

function undeclaredSharedReads(file: string, source: string, declared: Set<string>): string[] {
  return [...source.matchAll(SHARED_READ)]
    .filter((match) => !declared.has(match[1]))
    .map(
      (match) =>
        `${file}:${lineAt(source, match.index)} reads var(${match[1]}), but ${GLOBALS} declares no ${match[1]}; declare it in the shared :root, [data-theme] block`
    );
}

function modulesUnder(dirs: string[]): string[] {
  return dirs
    .flatMap((dir) =>
      readdirSync(join(process.cwd(), dir), { recursive: true, encoding: "utf8" }).map((entry) => `${dir}/${entry}`)
    )
    .filter((file) => file.endsWith(".module.css"))
    .sort();
}

function entryLine(source: string, value: string): string {
  const entry = new RegExp(`value:\\s*"${value}"`).exec(source);
  return entry ? `:${lineAt(source, entry.index)}` : "";
}

function listMismatches(
  items: readonly { value: string }[],
  sheet: Sheet,
  storageSource: string,
  cssFile = GLOBALS,
  storageFile = STORAGE
): string[] {
  const listed = new Set(items.map((item) => item.value));
  const styled = new Set(sheet.themes.map((theme) => theme.name));
  return [
    ...[...listed]
      .filter((value) => !styled.has(value))
      .map(
        (value) =>
          `${storageFile}${entryLine(storageSource, value)} THEME_ITEMS lists "${value}", but ${cssFile} has no [data-theme="${value}"] block`
      ),
    ...sheet.themes
      .filter((theme) => !listed.has(theme.name))
      .map(
        (theme) =>
          `${cssFile}:${theme.line} ${theme.selector} has no THEME_ITEMS entry in ${storageFile}; add { value: "${theme.name}", label } there`
      ),
  ];
}

function tokenMismatches(sheet: Sheet, cssFile = GLOBALS): string[] {
  if (!sheet.base) return [`${cssFile} has no :root, [data-theme="…"] base theme to compare against`];
  const expected = colourTokens(sheet.base);
  return sheet.themes
    .filter((theme) => theme !== sheet.base)
    .flatMap((theme) => [
      ...[...expected]
        .filter((token) => !theme.tokens.has(token))
        .map((token) => `${cssFile}:${theme.line} ${theme.selector} is missing ${token}`),
      ...[...theme.tokens]
        .filter(([token]) => !expected.has(token))
        .map(
          ([token, { line }]) =>
            `${cssFile}:${line} ${theme.selector} declares ${token}, which is not one of ${sheet.base!.selector}'s colour tokens`
        ),
    ]);
}

function derivedInBase(sheet: Sheet, cssFile = GLOBALS): string[] {
  if (!sheet.base) return [];
  const themed = colourTokens(sheet.base);
  const colours = new Set([...themed, ...(sheet.shared?.tokens.keys() ?? [])]);
  return [...sheet.base.tokens]
    .filter(([token]) => !themed.has(token))
    .flatMap(([token, { value, line }]) =>
      [...value.matchAll(REFERENCE)]
        .filter((reference) => colours.has(reference[1]))
        .map(
          (reference) =>
            `${cssFile}:${line} ${sheet.base!.selector} derives ${token} from var(${reference[1]}); declare it in the shared :root, [data-theme] block`
        )
    );
}

const read = (file: string) => readFileSync(join(process.cwd(), file), "utf8");

describe("the theme contract, on a fixture", () => {
  const fixture = [
    ":root,",
    '[data-theme="light"] {',
    "  color-scheme: light;",
    "  --sheet: #fffdf6;",
    "  --grid: rgba(31, 58, 115, 0.07);",
    "  --radius: 12px;",
    "  --ide-bg: var(--ide-fg);",
    "}",
    "",
    ":root,",
    "[data-theme] {",
    "  --ide-fg: var(--sheet);",
    "  --ide-bg: var(--ide-fg);",
    "}",
    "",
    '[data-theme="dark"] {',
    "  color-scheme: dark;",
    "  --grid: rgba(190, 214, 255, 0.05);",
    "  --radius: 4px;",
    "}",
    "",
    '[data-theme="dark"] h2::after {',
    "  --sheet: #000000;",
    "}",
  ].join("\n");
  const sheet = readSheet(fixture);

  it("finds the base theme, the other themes and the shared block", () => {
    expect(sheet.base?.selector).toBe(':root, [data-theme="light"]');
    expect(sheet.themes.map((theme) => theme.name)).toEqual(["light", "dark"]);
    expect(sheet.shared?.selector).toBe(":root, [data-theme]");
    expect([...colourTokens(sheet.base!)]).toEqual(["--sheet", "--grid"]);
  });

  it("names a list entry without a block and a block without a list entry", () => {
    const storage = [
      "export const THEME_ITEMS = [",
      '  { value: "light", label: "Paper" },',
      '  { value: "test", label: "Test" },',
      "];",
    ].join("\n");
    expect(
      listMismatches([{ value: "light" }, { value: "test" }], sheet, storage, "fixture.css", "fixture.ts")
    ).toEqual([
      'fixture.ts:3 THEME_ITEMS lists "test", but fixture.css has no [data-theme="test"] block',
      'fixture.css:16 [data-theme="dark"] has no THEME_ITEMS entry in fixture.ts; add { value: "dark", label } there',
    ]);
  });

  it("names each missing and extra token by theme", () => {
    expect(tokenMismatches(sheet, "fixture.css")).toEqual([
      'fixture.css:16 [data-theme="dark"] is missing --sheet',
      'fixture.css:19 [data-theme="dark"] declares --radius, which is not one of :root, [data-theme="light"]\'s colour tokens',
    ]);
  });

  it("accepts a complete new theme added as one block and one list entry", () => {
    const complete = [
      ":root,",
      '[data-theme="light"] {',
      "  color-scheme: light;",
      "  --sheet: #fffdf6;",
      "  --grid: rgba(31, 58, 115, 0.07);",
      "  --radius: 12px;",
      "}",
      "",
      ":root,",
      "[data-theme] {",
      "  --ide-bg: var(--sheet);",
      "}",
      "",
      '[data-theme="test"] {',
      "  color-scheme: dark;",
      "  --sheet: #faf7fe;",
      "  --grid: rgba(60, 40, 110, 0.06);",
      "}",
    ].join("\n");
    const items = [
      { value: "light", label: "📄 Paper" },
      { value: "test", label: "🧪 Test" },
    ];
    const storage = [
      "export const THEME_ITEMS = [",
      '  { value: "light", label: "📄 Paper" },',
      '  { value: "test", label: "🧪 Test" },',
      "];",
    ].join("\n");
    const tenth = readSheet(complete);
    expect(listMismatches(items, tenth, storage, "fixture.css", "fixture.ts")).toEqual([]);
    expect(itemMismatches(items, storage, "fixture.ts")).toEqual([]);
    expect(tokenMismatches(tenth, "fixture.css")).toEqual([]);
    expect(schemeMismatches(tenth, "fixture.css")).toEqual([]);
    expect(derivedInBase(tenth, "fixture.css")).toEqual([]);
  });

  it("names a theme block that sets no color-scheme", () => {
    const withoutScheme = readSheet(
      [
        ":root,",
        '[data-theme="light"] {',
        "  color-scheme: light;",
        "  --sheet: #fffdf6;",
        "}",
        "",
        '[data-theme="test"] {',
        "  --sheet: #10131a;",
        "}",
      ].join("\n")
    );
    expect(schemeMismatches(withoutScheme, "fixture.css")).toEqual([
      'fixture.css:7 [data-theme="test"] sets no color-scheme; add color-scheme: light or dark so native controls match',
    ]);
  });

  it("names a THEME_ITEMS value listed twice and a label without an icon and a name", () => {
    const storage = [
      "export const THEME_ITEMS = [",
      '  { value: "light", label: "📄 Paper" },',
      '  { value: "ocean", label: "Ocean" },',
      '  { value: "light", label: "📄 Paper" },',
      "];",
    ].join("\n");
    expect(
      itemMismatches(
        [
          { value: "light", label: "📄 Paper" },
          { value: "ocean", label: "Ocean" },
          { value: "light", label: "📄 Paper" },
        ],
        storage,
        "fixture.ts"
      )
    ).toEqual([
      'fixture.ts:2 THEME_ITEMS lists "light" twice',
      'fixture.ts:3 THEME_ITEMS labels "ocean" "Ocean"; write an icon, a space and the name',
    ]);
  });

  it("names a read of --scrim or an --ide-* alias that nothing declares", () => {
    const stylesheet = [
      ".backdrop {",
      "  background: color-mix(in srgb, var(--scrim) 40%, transparent);",
      "  color: var(--ide-fg);",
      "  border-color: var(--ide-gone, var(--line));",
      "}",
    ].join("\n");
    expect(undeclaredSharedReads("fixture.module.css", stylesheet, new Set(["--ide-fg"]))).toEqual([
      "fixture.module.css:2 reads var(--scrim), but app/globals.css declares no --scrim; declare it in the shared :root, [data-theme] block",
    ]);
  });

  it("names a colour the base theme derives instead of the shared block", () => {
    expect(derivedInBase(sheet, "fixture.css")).toEqual([
      'fixture.css:7 :root, [data-theme="light"] derives --ide-bg from var(--ide-fg); declare it in the shared :root, [data-theme] block',
    ]);
  });
});

describe("the theme contract", () => {
  const sheet = readSheet(read(GLOBALS));

  it(`finds the base theme, the shared block and the colour tokens in ${GLOBALS}`, () => {
    expect(sheet.base, `${GLOBALS} has no :root, [data-theme="…"] block`).toBeTruthy();
    expect(sheet.shared, `${GLOBALS} has no :root, [data-theme] block`).toBeTruthy();
    expect(colourTokens(sheet.base!).size).toBeGreaterThan(0);
  });

  it(`gives every THEME_ITEMS entry in ${STORAGE} one ${GLOBALS} block, and every block an entry`, () => {
    expect(listMismatches(THEME_ITEMS, sheet, read(STORAGE))).toEqual([]);
    expect(itemMismatches(THEME_ITEMS, read(STORAGE))).toEqual([]);
    const names = sheet.themes.map((theme) => theme.name);
    expect(
      names.filter((name, i) => names.indexOf(name) !== i),
      `${GLOBALS} styles a theme twice`
    ).toEqual([]);
  });

  it("has every theme restate exactly the base theme's colour tokens", () => {
    expect(tokenMismatches(sheet)).toEqual([]);
  });

  it("derives colours from colours only in the shared block, so a nested theme computes its own", () => {
    expect(derivedInBase(sheet)).toEqual([]);
  });

  it("has every theme set its own color-scheme", () => {
    expect(schemeMismatches(sheet)).toEqual([]);
  });

  it("declares --scrim and every --ide-* alias that a module or global rule reads", () => {
    const globals = read(GLOBALS);
    const declared = declaredTokens(globals);
    expect(
      [GLOBALS, ...modulesUnder(["app", "components"])].flatMap((file) =>
        undeclaredSharedReads(file, read(file), declared)
      )
    ).toEqual([]);
  });
});
