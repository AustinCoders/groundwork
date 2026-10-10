import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(process.cwd(), "components/SiteDrawer.module.css"), "utf8");

const TOKENS: Record<string, number> = {
  "--t-display": 1.75,
  "--t-heading": 1.375,
  "--t-control": 1,
  "--t-title": 1.25,
  "--t-body": 0.9375,
  "--t-meta": 0.8125,
  "--t-kicker": 0.75,
};

describe("the site menu type scale", () => {
  it("defines the seven sizes in rem, none under 12px", () => {
    for (const [name, rem] of Object.entries(TOKENS)) {
      expect(css, name).toContain(`${name}: ${rem}rem;`);
      expect(rem * 16).toBeGreaterThanOrEqual(12);
    }
  });

  it("sets every font size from a token", () => {
    const sizes = [...css.matchAll(/^\s*font-size:\s*([^;]+);/gm)].map((match) => match[1].trim());
    expect(sizes.length).toBeGreaterThan(10);
    for (const size of sizes) {
      const token = /^var\((--t-[a-z]+)\)$/.exec(size)?.[1];
      expect(token && token in TOKENS, `font-size: ${size}`).toBe(true);
    }
  });

  it("uses only the weights 400 and 700", () => {
    const weights = [...css.matchAll(/^\s*font-weight:\s*([^;]+);/gm)].map((match) => match[1].trim());
    for (const weight of weights) expect(["400", "700"], `font-weight: ${weight}`).toContain(weight);
  });

  it("keeps the mono face for the section kicker alone", () => {
    const users = [...css.matchAll(/([^{}]+)\{[^{}]*font-family:\s*var\(--font-mono\)/g)].map((match) =>
      match[1].trim()
    );
    expect(users).toEqual([".eyebrow"]);
  });
});
