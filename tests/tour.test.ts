import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SLIDES } from "@/components/tour/slides";
import { coverPaths, isTourPage, shouldOfferTour } from "@/components/tour/tourRules";
import { TOUR_KEY, parseTour, readTour, rememberTourSeen } from "@/components/tour/tourStore";
import { colourLiteralPattern, withoutStringsAndUrls } from "./colour-literal";

const read = (file: string) => readFileSync(join(process.cwd(), file), "utf8");

const TOPICS = [
  { id: "js", notes: "notes.html" },
  { id: "react", notes: "react.html" },
  { id: "dsa", notes: "dsa.html" },
  { id: "git", notes: "git.html" },
  { id: "interview", notes: "interview.html" },
  { id: "soon", notes: null },
];
const GUIDES = ["interview", "architecture"];
const COVERS = coverPaths(TOPICS, GUIDES);

function storageWith(initial: Record<string, string> = {}) {
  const raw = new Map(Object.entries(initial));
  vi.stubGlobal("window", {});
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => raw.get(key) ?? null,
    setItem: (key: string, value: string) => void raw.set(key, value),
    removeItem: (key: string) => void raw.delete(key),
  });
  return raw;
}

afterEach(() => vi.unstubAllGlobals());

describe("the saved tour flag", () => {
  it("is one versioned key", () => {
    expect(TOUR_KEY).toBe("groundwork:tour");
  });

  it("accepts a well-formed flag", () => {
    expect(parseTour({ v: 1, seen: true, at: 1760000000000 })).toEqual({ v: 1, seen: true, at: 1760000000000 });
  });

  it("falls back to not seen for anything else", () => {
    for (const bad of [
      null,
      undefined,
      "seen",
      true,
      42,
      [],
      {},
      { v: 2, seen: true, at: 1 },
      { v: 1, seen: false, at: 1 },
      { v: 1, seen: "yes", at: 1 },
      { v: 1, seen: true },
      { v: 1, seen: true, at: "now" },
      { v: 1, seen: true, at: Number.NaN },
      { v: 1, seen: true, at: Number.POSITIVE_INFINITY },
    ])
      expect(parseTour(bad), JSON.stringify(bad)).toBeNull();
  });

  it("reads nothing when storage is empty, broken or blocked", () => {
    storageWith();
    expect(readTour()).toBeNull();
    storageWith({ [TOUR_KEY]: "{not json" });
    expect(readTour()).toBeNull();
    storageWith({ [TOUR_KEY]: JSON.stringify({ v: 9 }) });
    expect(readTour()).toBeNull();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    });
    expect(readTour()).toBeNull();
    expect(() => rememberTourSeen()).not.toThrow();
  });

  it("remembers once and keeps the first time", () => {
    const raw = storageWith();
    rememberTourSeen(100);
    expect(JSON.parse(raw.get(TOUR_KEY)!)).toEqual({ v: 1, seen: true, at: 100 });
    rememberTourSeen(200);
    expect(readTour()).toEqual({ v: 1, seen: true, at: 100 });
  });

  it("overwrites a bad value with a good one", () => {
    const raw = storageWith({ [TOUR_KEY]: "garbage" });
    rememberTourSeen(300);
    expect(JSON.parse(raw.get(TOUR_KEY)!)).toEqual({ v: 1, seen: true, at: 300 });
  });
});

describe("where the tour may appear", () => {
  it("lists a cover for every topic that is not a guide", () => {
    expect(COVERS).toEqual(["/notes", "/react", "/dsa", "/git", "/soon"]);
  });

  it("shows on the home page, topic covers, level pickers and path pages", () => {
    for (const path of [
      "/",
      "/notes",
      "/react",
      "/dsa",
      "/git",
      "/soon",
      "/level/js",
      "/level/react",
      "/path/js/beginner",
    ])
      expect(isTourPage(path, COVERS), path).toBe(true);
  });

  it("never shows on a chapter, an exercise, the mock, the whiteboard or any deep page", () => {
    for (const path of [
      "/notes/setup-mental-model",
      "/react/react-components",
      "/dsa/dsa-hashing",
      "/problems/ex-accounts-merge",
      "/problems",
      "/practice",
      "/mock",
      "/mock/room",
      "/whiteboard",
      "/review",
      "/progress",
      "/privacy",
      "/git/merge",
      "/interview",
      "/interview/r1oa",
      "/architecture",
      "/architecture/arch-health",
      "/level",
      "/level/js/extra",
      "/path",
      "/path/js",
      "/path/js/beginner/extra",
      "/no-such-page",
    ])
      expect(isTourPage(path, COVERS), path).toBe(false);
  });

  it("ignores a trailing slash", () => {
    expect(isTourPage("/react/", COVERS)).toBe(true);
    expect(isTourPage("/react/react-components/", COVERS)).toBe(false);
  });
});

describe("whether to offer the tour", () => {
  const base = { pathname: "/", covers: COVERS, seen: false, shownThisLoad: false };

  it("offers it to a first visit on an eligible page", () => {
    expect(shouldOfferTour(base)).toBe(true);
    expect(shouldOfferTour({ ...base, pathname: "/react" })).toBe(true);
  });

  it("stays quiet once seen", () => {
    expect(shouldOfferTour({ ...base, seen: true })).toBe(false);
  });

  it("offers it at most once per page load, even when storage cannot remember", () => {
    expect(shouldOfferTour({ ...base, shownThisLoad: true })).toBe(false);
  });

  it("stays quiet on deep pages", () => {
    expect(shouldOfferTour({ ...base, pathname: "/notes/setup-mental-model" })).toBe(false);
  });

  it("does not depend on the reduced-motion preference", () => {
    expect(shouldOfferTour.length).toBe(1);
    expect(read("components/tour/tourRules.ts")).not.toMatch(/motion/i);
  });
});

describe("the tour's slides", () => {
  it("are five, each with real text and one composed stage", () => {
    expect(SLIDES).toHaveLength(5);
    for (const slide of SLIDES) {
      expect(slide.title.length, slide.id).toBeGreaterThan(10);
      expect(slide.lead.length, slide.id).toBeGreaterThan(60);
      expect(slide.stage, slide.id).toBeTruthy();
    }
    expect(new Set(SLIDES.map((slide) => slide.id)).size).toBe(5);
  });

  it("send every action to a page the tour does not cover", () => {
    for (const slide of SLIDES.filter((item) => item.action)) {
      const target = slide.action!.href.split(/[?#]/)[0] || "/";
      expect(target.startsWith("/"), slide.id).toBe(true);
    }
  });

  it("end on the Menu and the search shortcut", () => {
    const last = SLIDES.at(-1)!;
    expect(last.lead).toMatch(/Menu/);
    expect(last.lead).toMatch(/Ctrl or Cmd plus K/);
  });
});

describe("the tour's code", () => {
  const files = readdirSync(join(process.cwd(), "components/tour")).map((name) => `components/tour/${name}`);
  const sources = files.filter((file) => /\.tsx?$/.test(file));
  const css = read("components/tour/tour.module.css");

  it("loads the tour lazily and keeps the trigger small", () => {
    const trigger = read("components/tour/TourTrigger.tsx");
    expect(trigger).toContain('import("@/components/tour/TourHost")');
    expect(trigger).not.toContain("next/dynamic");
    expect(trigger).not.toMatch(/from "@\/components\/tour\/(TourHost|TourDialog|TourPrompt|slides)"/);
    expect(trigger).not.toMatch(/from "@\/components\/(topic|home|menu|ui)\//);
    expect(trigger).not.toMatch(/from "@\/lib\//);
    expect(read("components/tour/tourStore.ts")).not.toMatch(/^import /m);
    expect(trigger.split("\n").length).toBeLessThan(90);
  });

  it("is mounted once, in the root layout", () => {
    expect(read("app/layout.tsx")).toMatch(/<TourTrigger\s+covers=/);
  });

  it("reaches for no WebGL, canvas, video, audio or animation library", () => {
    for (const file of sources) {
      const text = read(file);
      expect(text, file).not.toMatch(
        /webgl|<canvas|getContext\(|<video|<audio|new Audio|from "(framer-motion|gsap|three|motion)/i
      );
    }
    expect(css).not.toMatch(/canvas|infinite/);
  });

  it("keeps the client bundle free of the content layer", () => {
    for (const file of sources) expect(read(file), file).not.toMatch(/from "@\/content\/(?!types)/);
  });

  it("styles from theme tokens only, with no colour literal", () => {
    expect(withoutStringsAndUrls(css).match(colourLiteralPattern())).toBeNull();
  });

  it("sizes every font from the shared type scale and uses weights 400 and 700 only", () => {
    const tokens = [
      "--t-display",
      "--t-heading",
      "--t-control",
      "--t-title",
      "--t-body",
      "--t-meta",
      "--t-kicker",
      "--t-lead",
    ];
    expect(css).not.toMatch(/--t-[a-z-]+:/);
    for (const [, size] of css.matchAll(/^\s*font-size:\s*([^;]+);/gm)) {
      const token = /^var\((--t-[a-z-]+)\)$/.exec(size.trim())?.[1];
      expect(token && tokens.includes(token), `font-size: ${size}`).toBe(true);
    }
    for (const [, weight] of css.matchAll(/^\s*font-weight:\s*([^;]+);/gm))
      expect(["400", "700"], `font-weight: ${weight}`).toContain(weight.trim());
  });

  it("keeps the mono face for kickers, code, timers and keys", () => {
    const users = [...css.matchAll(/([^{}]+)\{[^{}]*font-family:\s*var\(--font-mono\)/g)].map((match) =>
      match[1].trim()
    );
    for (const user of users) expect([".code", ".timer", ".kbd"], user).toContain(user);
  });

  it("animates only transform and opacity, once, and only when motion is welcome", () => {
    const outside = css.replace(
      /@media \(prefers-reduced-motion: no-preference\) \{[\s\S]*?\n\}\n(?=\n@keyframes)/,
      ""
    );
    expect(outside).not.toMatch(/animation\s*:/);
    expect(css).toMatch(/@media \(prefers-reduced-motion: no-preference\) \{/);
    for (const frames of css.matchAll(/@keyframes [\w]+ \{([\s\S]*?)\n\}\n/g))
      for (const [, property] of frames[1].matchAll(/^\s+([\w-]+)\s*:/gm))
        expect(["transform", "opacity"], `keyframes animate ${property}`).toContain(property);
    for (const [, loops] of css.matchAll(/animation:[^;]*?(\binfinite\b|\b\d+\b\s*;)/g)) expect(loops).toBeUndefined();
  });

  it("never fades text: only the scrim animates opacity", () => {
    const fades = [...css.matchAll(/@keyframes (\w+) \{[^}]*\{[^}]*opacity/g)].map((match) => match[1]);
    expect(fades).toEqual(["scrimIn"]);
  });

  it("makes every control at least 44px tall", () => {
    expect(css).toMatch(/\.primary,\s*\.ghost,\s*\.skip \{[^}]*min-height: 44px/);
  });
});

describe("the menu's way back", () => {
  it("opens the tour from a row in the drawer's foot", () => {
    const drawer = read("components/SiteDrawer.tsx");
    expect(drawer).toContain("Take the tour");
    expect(drawer).toContain("TOUR_OPEN_EVENT");
  });
});
