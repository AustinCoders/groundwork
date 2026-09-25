import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

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
  const m = new RegExp(`${name}:\\s*([^;]+);`).exec(body);
  return m ? m[1].trim() : null;
}

const themes = blocks().filter(
  (b) => declaration(b.body, "--ide-keyword") && declaration(b.body, "--sheet-2") && declaration(b.body, "--line-soft")
);

describe("editor syntax colours", () => {
  it("finds a theme to check", () => {
    expect(themes.length).toBeGreaterThanOrEqual(9);
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
    expect(withPalette.length).toBe(9);
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
