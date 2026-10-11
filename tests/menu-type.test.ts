import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(join(process.cwd(), file), "utf8");

const globals = read("app/globals.css");

const SURFACES = {
  "the site menu": "components/SiteDrawer.module.css",
  "the menu button": "components/MenuButton.module.css",
  "the shared menu kit": "components/ui/menuKit.module.css",
  "the chapter sidebar": "components/chapter/rail.module.css",
} as const;

const TOKENS: Record<string, number> = {
  "--t-display": 1.75,
  "--t-heading": 1.375,
  "--t-control": 1,
  "--t-title": 1.25,
  "--t-body": 0.9375,
  "--t-meta": 0.8125,
  "--t-kicker": 0.75,
};

describe("the shared type scale", () => {
  it("is defined once on :root in rem, none under 12px", () => {
    const root = /^:root \{([^}]*--t-display[^}]*)\}/m.exec(globals)?.[1] ?? "";
    for (const [name, rem] of Object.entries(TOKENS)) {
      expect(root, name).toContain(`${name}: ${rem}rem;`);
      expect(rem * 16).toBeGreaterThanOrEqual(12);
    }
  });

  it("shrinks the title size for the Reading and Roboto fonts", () => {
    expect(globals).toMatch(/html\[data-font="serif"\],\s*html\[data-font="roboto"\] \{\s*--t-title: 1rem;/);
  });

  for (const [surface, file] of Object.entries(SURFACES)) {
    const css = read(file);

    describe(surface, () => {
      it("does not define its own sizes", () => {
        expect(css).not.toMatch(/--t-[a-z]+:/);
      });

      it("sets every font size from a token", () => {
        const sizes = [...css.matchAll(/^\s*font-size:\s*([^;]+);/gm)].map((match) => match[1].trim());
        for (const size of sizes) {
          const token = /^var\((--t-[a-z]+)\)$/.exec(size)?.[1];
          expect(token && token in TOKENS, `font-size: ${size}`).toBe(true);
        }
      });

      it("uses only the weights 400 and 700", () => {
        const weights = [...css.matchAll(/^\s*font-weight:\s*([^;]+);/gm)].map((match) => match[1].trim());
        for (const weight of weights) expect(["400", "700"], `font-weight: ${weight}`).toContain(weight);
      });

      it("keeps the mono face for kickers and chapter codes alone", () => {
        const users = [...css.matchAll(/([^{}]+)\{[^{}]*font-family:\s*var\(--font-mono\)/g)].map((match) =>
          match[1].trim()
        );
        for (const user of users) expect([".eyebrow", ".code"], user).toContain(user);
      });
    });
  }

  it("sizes the menu surfaces from tokens in enough places to matter", () => {
    expect(read(SURFACES["the site menu"]).match(/font-size:\s*var\(--t-/g)?.length).toBeGreaterThan(10);
    expect(read(SURFACES["the chapter sidebar"]).match(/font-size:\s*var\(--t-/g)?.length).toBeGreaterThan(10);
  });
});
