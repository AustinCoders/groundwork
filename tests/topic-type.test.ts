import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(join(process.cwd(), file), "utf8");

const globals = read("app/globals.css");

const SURFACES = {
  "the topic kit": "components/topic/topicKit.module.css",
  "the journey": "components/topic/journey.module.css",
  "the outline page": "components/topic/outline.module.css",
  "the level picker": "components/topic/level.module.css",
  "the path page": "components/topic/path.module.css",
  "the topic cover": "components/topic/cover.module.css",
  "the outline chapter": "components/topic/reader.module.css",
  "the interview landing": "app/interview/landing.module.css",
  "the question bank": "app/interview/questions/bank.module.css",
  "the interview round": "app/interview/[chapter]/round.module.css",
  "the architecture landing": "app/architecture/architecture.module.css",
} as const;

const TOKENS = [
  "--t-display",
  "--t-heading",
  "--t-control",
  "--t-title",
  "--t-body",
  "--t-meta",
  "--t-kicker",
  "--t-hero",
  "--t-lead",
  "--t-section",
  "--t-hero-fit",
];

const MONO_USERS = [
  ".kicker",
  ".cardKicker",
  ".meterLabel",
  ".chip",
  ".foldNo",
  ".checkpointLabel",
  ".sticker",
  ".cardBadge",
  ".cardMeta span",
  ".cardLabel",
  ".budgetStep",
  ".exerciseDetails > summary",
  ".status",
  ".stationChips span",
  ".yours",
  ".here",
  ".mark",
  ".checkpointLabel",
  ".stamp",
  ".pill",
  ".choiceNo",
  ".choiceMeta",
  ".chapterCode",
  ".cardChips span",
  ".entryCode",
  ".entryMeta",
  ".partNo",
  ".partCount",
  ".meterLabel",
  ".budgetStep",
  ".factsTitle",
  ".dailyRound",
  ".meta dt",
  ".qNo",
  ".qMark",
  ".test b",
  ".flashKicker",
  ".flashMarks i",
  ".flashReveal kbd,\n.primary kbd,\n.confRow kbd",
  ".drillTop",
  ".cardRound",
  ".tags span",
  ".laneChips span",
];

describe("the topic pages share the menu type scale", () => {
  it("defines the hero and lead sizes once on :root", () => {
    expect(globals).toMatch(/--t-hero: clamp\(2\.5rem, min\(5\.4vw, 8svh\), 5rem\);/);
    expect(globals).toMatch(/--t-section: clamp\(2\.125rem, 3\.8vw, 3\.5rem\);/);
    expect(globals).toMatch(/--t-lead: 1\.125rem;/);
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
          const token = /^var\((--t-[a-z-]+)\)$/.exec(size)?.[1];
          expect(token && TOKENS.includes(token), `font-size: ${size}`).toBe(true);
        }
      });

      it("uses only the weights 400 and 700", () => {
        const weights = [...css.matchAll(/^\s*font-weight:\s*([^;]+);/gm)].map((match) => match[1].trim());
        for (const weight of weights) expect(["400", "700"], `font-weight: ${weight}`).toContain(weight);
      });

      it("keeps the mono face for kickers, chips and codes alone", () => {
        const users = [...css.matchAll(/([^{}]+)\{[^{}]*font-family:\s*var\(--font-mono\)/g)].map((match) =>
          match[1].trim()
        );
        for (const user of users) expect(MONO_USERS, user).toContain(user);
      });
    });
  }

  it("keeps scroll reveals off the topic pages", () => {
    for (const file of [
      "app/level/LevelView.tsx",
      "components/topic/Journey.tsx",
      "components/topic/TopicPath.tsx",
      "components/topic/TopicCover.tsx",
      "components/topic/TopicOutline.tsx",
      "components/topic/TopicKit.tsx",
      "app/interview/InterviewLanding.tsx",
      "app/interview/BookFrame.tsx",
      "app/interview/[chapter]/RoundView.tsx",
      "app/interview/questions/QuestionBank.tsx",
      "app/architecture/ArchitectureView.tsx",
    ]) {
      expect(read(file), file).not.toContain("data-fx");
    }
  });
});
