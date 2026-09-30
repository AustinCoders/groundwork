import { readFileSync } from "node:fs";
import { join } from "node:path";
import { THEME_ITEMS, type ThemeValue } from "../lib/storage";

const BLOCKS = [...readFileSync(join(__dirname, "../app/globals.css"), "utf8").matchAll(/([^{};]+)\{([^{}]*)\}/g)].map(
  ([, prelude, body]) => ({ parts: prelude.split(",").map((part) => part.trim()), body })
);

export const THEMES: ThemeValue[] = THEME_ITEMS.map((item) => item.value);

function declared(body: string, token: string): string | undefined {
  return new RegExp(`(?<![\\w-])${token}\\s*:\\s*([^;]+);`).exec(body)?.[1].trim();
}

export function themeColour(theme: ThemeValue, token: string): string {
  const block = BLOCKS.find(({ parts }) => parts.includes(`[data-theme="${theme}"]`));
  if (!block) throw new Error(`app/globals.css has no [data-theme="${theme}"] block`);
  const value = declared(block.body, token);
  if (value === undefined) throw new Error(`app/globals.css [data-theme="${theme}"] does not declare ${token}`);
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value);
  if (hex) {
    const digits = hex[1].length === 3 ? [...hex[1]].map((digit) => digit + digit).join("") : hex[1];
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16));
    return `rgb(${r}, ${g}, ${b})`;
  }
  const rgb = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/.exec(value);
  if (rgb) {
    const [r, g, b, alpha] = [...rgb.slice(1, 4).map(Number), Number(rgb[4] ?? 1)];
    return alpha === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  throw new Error(`app/globals.css gives ${token} in [data-theme="${theme}"] as "${value}", not a hex or rgb() colour`);
}
