import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { THEME_ITEMS } from "@/lib/storage";

const CSS = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");

const TOKENS = ["--ide-keyword", "--ide-string", "--ide-number", "--ide-op", "--ide-comment"] as const;

type Rgb = [number, number, number];

function hexToRgb(hex: string): Rgb {
  const h = hex.trim().replace("#", "");
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as Rgb;
}

function parseRgba(value: string): [number, number, number, number] {
  const inner = /rgba?\(([^)]+)\)/.exec(value);
  if (!inner) throw new Error(`not an rgba value: ${value}`);
  const parts = inner[1].split(",").map((p) => Number(p.trim()));
  return [parts[0], parts[1], parts[2], parts.length > 3 ? parts[3] : 1];
}

function composite(fg: [number, number, number, number], bg: Rgb): Rgb {
  return [0, 1, 2].map((i) => fg[3] * fg[i] + (1 - fg[3]) * bg[i]) as Rgb;
}

function luminance([r, g, b]: Rgb): number {
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function blocks(): { selector: string; body: string }[] {
  const out: { selector: string; body: string }[] = [];
  const opener = /^([^{\n][^{\n]*)\{/gm;
  let m: RegExpExecArray | null;
  while ((m = opener.exec(CSS))) {
    let depth = 1;
    let i = m.index + m[0].length;
    while (i < CSS.length && depth > 0) {
      if (CSS[i] === "{") depth += 1;
      else if (CSS[i] === "}") depth -= 1;
      i += 1;
    }
    out.push({ selector: m[1].trim(), body: CSS.slice(m.index + m[0].length, i - 1) });
  }
  return out;
}

function declaration(body: string, name: string): string | null {
  const m = new RegExp(`(?<![\\w-])${name}:\\s*([^;]+);`).exec(body);
  return m ? m[1].trim() : null;
}

const themes = blocks().filter(
  (b) => declaration(b.body, "--ide-keyword") && declaration(b.body, "--sheet-2") && declaration(b.body, "--line-soft")
);

describe("editor syntax colours", () => {
  it("finds a theme to check", () => {
    expect(themes.length).toBe(THEME_ITEMS.length);
  });

  it("meets WCAG AA on the editor background and on the active line, in every theme", () => {
    for (const theme of themes) {
      const editor = hexToRgb(declaration(theme.body, "--sheet-2")!);
      const activeLine = composite(parseRgba(declaration(theme.body, "--line-soft")!), editor);

      for (const token of TOKENS) {
        const value = declaration(theme.body, token);
        expect(value, `${theme.selector} is missing ${token}`).toBeTruthy();
        const colour = hexToRgb(value!);

        for (const [name, background] of [
          ["the editor", editor],
          ["the active line", activeLine],
        ] as const) {
          const ratio = contrast(colour, background);
          expect(
            ratio,
            `${theme.selector} ${token} (${value}) is ${ratio.toFixed(2)}:1 against ${name}`
          ).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });
});

describe("the theme palette", () => {
  const PALETTE = ["--c-orange", "--c-yellow", "--c-teal", "--c-blue", "--c-purple", "--c-grey"] as const;
  const withPalette = blocks().filter((b) => declaration(b.body, "--c-blue") && declaration(b.body, "--sheet"));

  it("is defined by every theme", () => {
    expect(withPalette.length).toBe(THEME_ITEMS.length);
    for (const theme of withPalette)
      for (const token of PALETTE) expect(declaration(theme.body, token), `${theme.selector} ${token}`).toBeTruthy();
  });

  it("stands out from the page in every theme", () => {
    for (const theme of withPalette) {
      const sheet = hexToRgb(declaration(theme.body, "--sheet")!);
      for (const token of PALETTE) {
        const value = declaration(theme.body, token)!;
        const ratio = contrast(hexToRgb(value), sheet);
        expect(
          ratio,
          `${theme.selector} ${token} (${value}) is ${ratio.toFixed(2)}:1 on the sheet`
        ).toBeGreaterThanOrEqual(3);
      }
    }
  });
});

const SURFACES = ["--paper", "--sheet", "--sheet-2"] as const;

function onEverySurface(foregrounds: readonly string[]): [foreground: string, background: string][] {
  return foregrounds.flatMap((foreground) => SURFACES.map((surface): [string, string] => [foreground, surface]));
}

function expectReadable(theme: { selector: string; body: string }, [foreground, background]: [string, string]) {
  const fg = declaration(theme.body, foreground);
  const bg = declaration(theme.body, background);
  expect(fg, `${theme.selector} is missing ${foreground}`).toBeTruthy();
  expect(bg, `${theme.selector} is missing ${background}`).toBeTruthy();
  const ratio = contrast(hexToRgb(fg!), hexToRgb(bg!));
  expect(
    ratio,
    `${theme.selector} ${foreground} (${fg}) is ${ratio.toFixed(2)}:1 against ${background} (${bg})`
  ).toBeGreaterThanOrEqual(4.5);
}

describe("the text colours", () => {
  const TEXT = ["--ink", "--ink-soft", "--pencil"] as const;
  const withTheme = blocks().filter((b) => declaration(b.body, "--sheet") && declaration(b.body, "--ink"));

  it("meet WCAG AA on the paper, the sheet and the editor in every theme", () => {
    expect(withTheme.length).toBe(THEME_ITEMS.length);
    for (const theme of withTheme) for (const pair of onEverySurface(TEXT)) expectReadable(theme, pair);
  });
});

describe("the role colours", () => {
  const ROLES = ["--primary", "--on-primary", "--mark", "--success", "--danger", "--caution", "--info"] as const;
  const TEXT_ROLES = ["--primary", "--success", "--danger", "--caution", "--info"] as const;
  const PAIRS: [foreground: string, background: string][] = [
    ...onEverySurface(TEXT_ROLES),
    ["--on-primary", "--primary"],
    ["--ink", "--mark"],
  ];
  const withTheme = blocks().filter((b) => declaration(b.body, "--sheet") && declaration(b.body, "--ink"));

  it("is defined by every theme", () => {
    expect(withTheme.length).toBe(THEME_ITEMS.length);
    for (const theme of withTheme)
      for (const token of ROLES)
        expect(declaration(theme.body, token), `${theme.selector} is missing ${token}`).toBeTruthy();
  });

  it("meets WCAG AA against its pair in every theme", () => {
    for (const theme of withTheme) for (const pair of PAIRS) expectReadable(theme, pair);
  });
});

describe("text on the tinted boxes", () => {
  const TINTED: { text: string; tint: string; surfaces: readonly string[]; box: string }[] = [
    { text: "--red", tint: "--warn-bg", surfaces: ["--paper", "--sheet"], box: "a warning" },
    { text: "--green", tint: "--dg-box-green", surfaces: ["--sheet"], box: "the interview book's prep box" },
    ...["--ink", "--ink-soft", "--pencil"].map((text) => ({
      text,
      tint: "--code-inline-bg",
      surfaces: SURFACES,
      box: "inline code",
    })),
  ];
  const withTheme = blocks().filter((b) => declaration(b.body, "--warn-bg") && declaration(b.body, "--ink"));

  function colour(value: string): [number, number, number, number] {
    return value.startsWith("#") ? [...hexToRgb(value), 1] : parseRgba(value);
  }

  it("tints each theme's warning with that theme's own red", () => {
    expect(withTheme.length).toBe(THEME_ITEMS.length);
    for (const theme of withTheme) {
      const red = hexToRgb(declaration(theme.body, "--red")!);
      const tint = parseRgba(declaration(theme.body, "--warn-bg")!).slice(0, 3);
      expect(tint, `${theme.selector} --warn-bg is not a tint of its --red`).toEqual(red);
    }
  });

  it("keeps the text at WCAG AA on each tint, over every surface the box sits on, in every theme", () => {
    for (const theme of withTheme) {
      for (const { text, tint, surfaces, box } of TINTED) {
        const fg = declaration(theme.body, text);
        const tintValue = declaration(theme.body, tint);
        expect(fg, `${theme.selector} is missing ${text}`).toBeTruthy();
        expect(tintValue, `${theme.selector} is missing ${tint}`).toBeTruthy();
        for (const surface of surfaces) {
          const background = composite(colour(tintValue!), hexToRgb(declaration(theme.body, surface)!));
          const ratio = contrast(hexToRgb(fg!), background);
          expect(
            ratio,
            `${theme.selector} ${text} (${fg}) is ${ratio.toFixed(2)}:1 on ${box}, ${tint} over ${surface}`
          ).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });
});

describe("text on the role tints", () => {
  const TINTS = ["--primary-soft", "--success-soft", "--danger-soft", "--caution-soft", "--info-soft"] as const;
  const PAIRS: [foreground: string, tint: string][] = [
    ...TINTS.map((tint): [string, string] => ["--ink", tint]),
    ["--ink-soft", "--primary-soft"],
    ["--ink-soft", "--success-soft"],
  ];
  const MIX = /color-mix\(in srgb,\s*var\((--[\w-]+)\)\s*([\d.]+)%,\s*var\((--[\w-]+)\)\)/;
  const shared = blocks().find((b) => declaration(b.body, "--primary-soft"));
  const withTheme = blocks().filter((b) => declaration(b.body, "--sheet") && declaration(b.body, "--ink"));

  function tintIn(body: string, tint: string): Rgb {
    const recipe = MIX.exec(declaration(shared!.body, tint) ?? "");
    expect(recipe, `${tint} is not a color-mix of a role and a base`).toBeTruthy();
    const [, role, percent, base] = recipe!;
    const share = Number(percent) / 100;
    const top = hexToRgb(declaration(body, role)!);
    const under = hexToRgb(declaration(body, base)!);
    return [0, 1, 2].map((i) => share * top[i] + (1 - share) * under[i]) as Rgb;
  }

  it("is mixed once, for every theme", () => {
    expect(shared, "no block declares the -soft tints").toBeTruthy();
    expect(withTheme.length).toBe(THEME_ITEMS.length);
  });

  it("keeps ink and soft ink at WCAG AA on every tint in every theme", () => {
    for (const theme of withTheme) {
      for (const [foreground, tint] of PAIRS) {
        const fg = declaration(theme.body, foreground);
        expect(fg, `${theme.selector} is missing ${foreground}`).toBeTruthy();
        const ratio = contrast(hexToRgb(fg!), tintIn(theme.body, tint));
        expect(
          ratio,
          `${theme.selector} ${foreground} (${fg}) is ${ratio.toFixed(2)}:1 on ${tint}`
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});

describe("text on the interview book's paper", () => {
  const BOOK = ["--book-ink", "--book-ink-soft", "--book-pen"] as const;
  const withBook = blocks().filter((b) => declaration(b.body, "--book-paper") && declaration(b.body, "--sheet"));
  const hex = (theme: { body: string }, token: string) => hexToRgb(declaration(theme.body, token)!);
  const mix = (top: Rgb, share: number, under: Rgb): Rgb =>
    [0, 1, 2].map((i) => share * top[i] + (1 - share) * under[i]) as Rgb;

  function expectRatio(theme: { selector: string }, what: string, fg: Rgb, bg: Rgb) {
    const ratio = contrast(fg, bg);
    expect(ratio, `${theme.selector} ${what} is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
  }

  it("is defined by every theme", () => {
    expect(withBook.length).toBe(THEME_ITEMS.length);
    for (const theme of withBook)
      for (const token of [
        "--book-paper",
        "--book-paper-shade",
        "--book-ink",
        "--book-ink-soft",
        "--book-rule",
        "--book-cover",
        "--book-cover-dark",
        "--book-cover-light",
        "--book-edge",
        "--book-ribbon",
        "--book-gold",
        "--book-shadow",
        "--book-pen",
        "--book-note",
        "--book-tape",
      ])
        expect(declaration(theme.body, token), `${theme.selector} is missing ${token}`).toBeTruthy();
  });

  it("keeps ink and soft ink at WCAG AA on the paper and on the page edge colour, and pen red on the paper, in every theme", () => {
    for (const theme of withBook) {
      for (const token of BOOK)
        expectRatio(theme, `${token} on --book-paper`, hex(theme, token), hex(theme, "--book-paper"));
      for (const token of ["--book-ink", "--book-ink-soft"])
        expectRatio(theme, `${token} on --book-edge`, hex(theme, token), hex(theme, "--book-edge"));
    }
  });

  it("keeps ink on the sticky note and on the highlighted contents row, in every theme", () => {
    for (const theme of withBook) {
      const highlighted = mix(hex(theme, "--book-note"), 0.48, hex(theme, "--book-paper"));
      expectRatio(theme, "--book-ink on the note", hex(theme, "--book-ink"), hex(theme, "--book-note"));
      expectRatio(theme, "--book-ink on the highlighted row", hex(theme, "--book-ink"), highlighted);
      expectRatio(theme, "--book-ink-soft on the highlighted row", hex(theme, "--book-ink-soft"), highlighted);
    }
  });

  it("keeps ink on every thumb-index tab, in every theme", () => {
    for (const theme of withBook)
      for (const tone of ["--c-teal", "--c-blue", "--c-purple", "--c-orange"])
        for (const share of [0.34, 0.44, 0.5])
          expectRatio(
            theme,
            `--book-ink on a ${tone} tab at ${share}`,
            hex(theme, "--book-ink"),
            mix(hex(theme, tone), share, hex(theme, "--book-paper"))
          );
  });

  it("keeps the cover distinct from the paper in every theme", () => {
    for (const theme of withBook) {
      const ratio = contrast(hex(theme, "--book-cover"), hex(theme, "--book-paper"));
      expect(ratio, `${theme.selector} cover against paper is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4);
    }
  });
});

describe("the stage surfaces", () => {
  const withTheme = blocks().filter((b) => declaration(b.body, "--sheet") && declaration(b.body, "--ink"));
  const shared = blocks().find((b) => declaration(b.body, "--note"));

  function splitArguments(text: string): string[] {
    const parts: string[] = [];
    let depth = 0;
    let start = 0;
    for (let i = 0; i < text.length; i += 1) {
      if (text[i] === "(") depth += 1;
      else if (text[i] === ")") depth -= 1;
      else if (text[i] === "," && depth === 0) {
        parts.push(text.slice(start, i).trim());
        start = i + 1;
      }
    }
    parts.push(text.slice(start).trim());
    return parts;
  }

  function mixColours(top: Rgb, share: number, under: Rgb): Rgb {
    return [0, 1, 2].map((i) => share * top[i] + (1 - share) * under[i]) as Rgb;
  }

  function resolve(value: string, theme: { body: string }): Rgb {
    const text = value.trim();
    if (text.startsWith("#")) return hexToRgb(text);
    const call = /^([\w-]+)\(([\s\S]*)\)$/.exec(text);
    if (!call) throw new Error(`cannot read the colour ${text}`);
    const [, name, inner] = call;
    const args = splitArguments(inner);
    if (name === "var") {
      const token = args[0];
      const found = declaration(theme.body, token) ?? declaration(shared!.body, token);
      if (!found) throw new Error(`${token} is not declared`);
      return resolve(found, theme);
    }
    if (name === "rgb" || name === "rgba") {
      const [r, g, b, a] = parseRgba(text);
      return composite([r, g, b, a], resolve("var(--sheet)", theme));
    }
    if (name === "light-dark") {
      const scheme = declaration(theme.body, "color-scheme");
      return resolve(scheme === "dark" ? args[1] : args[0], theme);
    }
    if (name === "color-mix") {
      const [first, second] = args.slice(1);
      const [firstColour, firstShare] = first.split(/\s+(?=[\d.]+%$)/);
      const [secondColour, secondShare] = second.split(/\s+(?=[\d.]+%$)/);
      const share = firstShare ? parseFloat(firstShare) / 100 : 1 - parseFloat(secondShare ?? "50") / 100;
      return mixColours(resolve(firstColour, theme), share, resolve(secondColour, theme));
    }
    throw new Error(`cannot read the function ${name}`);
  }

  const surface = (theme: { body: string }, token: string) => resolve(`var(${token})`, theme);
  const spread = ([r, g, b]: Rgb) => Math.max(r, g, b) - Math.min(r, g, b);
  const isDark = (theme: { body: string }) => declaration(theme.body, "color-scheme") === "dark";

  it("declares the note, sticker and marker once, in the shared block", () => {
    expect(shared, "no shared block declares --note").toBeTruthy();
    for (const token of ["--note", "--sticker", "--marker"])
      expect(declaration(shared!.body, token), `${token} is missing from the shared block`).toBeTruthy();
    expect(withTheme.length).toBe(THEME_ITEMS.length);
  });

  it("keeps ink and soft ink at WCAG AA on a note card in every theme", () => {
    for (const theme of withTheme)
      for (const text of ["--ink", "--ink-soft"]) {
        const ratio = contrast(surface(theme, text), surface(theme, "--note"));
        expect(ratio, `${theme.selector} ${text} is ${ratio.toFixed(2)}:1 on a note card`).toBeGreaterThanOrEqual(4.5);
      }
  });

  it("keeps ink at WCAG AA on a sticker in every theme", () => {
    for (const theme of withTheme) {
      const ratio = contrast(surface(theme, "--ink"), surface(theme, "--sticker"));
      expect(ratio, `${theme.selector} ink is ${ratio.toFixed(2)}:1 on a sticker`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("keeps text readable even where a highlight stroke crosses a descender, in every theme", () => {
    for (const theme of withTheme) {
      const ratio = contrast(surface(theme, "--ink"), surface(theme, "--marker"));
      expect(ratio, `${theme.selector} ink is ${ratio.toFixed(2)}:1 on the highlight stroke`).toBeGreaterThanOrEqual(
        4.5
      );
    }
  });

  it("keeps the dark themes' notes and stickers restrained, not olive, and their tape cool", () => {
    for (const theme of withTheme.filter(isDark)) {
      const base = spread(surface(theme, "--sheet"));
      expect(spread(surface(theme, "--note")) - base, `${theme.selector} note is tinted`).toBeLessThanOrEqual(12);
      expect(spread(surface(theme, "--sticker")) - base, `${theme.selector} sticker is tinted`).toBeLessThanOrEqual(34);
      const [r, g, b] = surface(theme, "--tape");
      expect((r + g) / 2 - b, `${theme.selector} tape is warm`).toBeLessThan(30);
    }
  });
});
