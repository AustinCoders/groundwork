import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { GLOBAL_ERROR_CSS } from "@/components/frame/globalErrorCss";

const page = readFileSync(join(process.cwd(), "app/global-error.tsx"), "utf8");

function palette(block: string): Record<string, string> {
  return Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]));
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const light = palette(GLOBAL_ERROR_CSS.split("@media")[0]);
const dark = palette(GLOBAL_ERROR_CSS.split("@media")[1]);

const PAIRS: [string, string][] = [
  ["ink", "paper"],
  ["ink", "sheet"],
  ["soft", "sheet"],
  ["soft", "paper"],
  ["on-accent", "accent"],
  ["accent", "sheet"],
  ["line", "sheet"],
];

describe("the global error page", () => {
  it("styles itself, since the app stylesheet is not there when the root layout fails", () => {
    expect(page).toContain("GLOBAL_ERROR_CSS");
    expect(page).not.toMatch(/\.module\.css|globals\.css/);
    expect(GLOBAL_ERROR_CSS).toContain("prefers-color-scheme: dark");
  });

  it.each(PAIRS.filter(([a]) => a !== "line"))("reads %s on %s at 4.5:1 or better in light and dark", (a, b) => {
    expect(contrast(light[a], light[b]), `light ${a} on ${b}`).toBeGreaterThanOrEqual(4.5);
    expect(contrast(dark[a], dark[b]), `dark ${a} on ${b}`).toBeGreaterThanOrEqual(4.5);
  });

  it("draws its borders at 1.4:1 or better so the buttons and card stay visible", () => {
    expect(contrast(light.line, light.sheet)).toBeGreaterThanOrEqual(1.4);
    expect(contrast(dark.line, dark.sheet)).toBeGreaterThanOrEqual(1.4);
  });

  it("keeps its type at 12px or more and its buttons at 44px or more", () => {
    for (const size of GLOBAL_ERROR_CSS.matchAll(/font:\s*(?:\d+\s+)?(\d+)px/g))
      expect(Number(size[1])).toBeGreaterThanOrEqual(12);
    expect(GLOBAL_ERROR_CSS).toMatch(/min-height:\s*48px/);
  });

  it("still reports the error and offers a reload", () => {
    expect(page).toContain('reportError(error, { boundary: "global"');
    expect(page).toContain("onClick={reset}");
  });
});
