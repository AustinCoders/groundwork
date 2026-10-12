import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(join(process.cwd(), file), "utf8");

const KIT = read("components/topic/Compose.tsx");
const CSS = read("components/topic/compose.module.css");

const HEROES: { file: string; css: string[] }[] = [
  { file: "app/progress/ProgressHero.tsx", css: ["app/progress/progress.module.css"] },
  { file: "app/review/ReviewHero.tsx", css: ["app/review/review.module.css"] },
  { file: "app/problems/ProblemsView.tsx", css: ["app/problems/problems.module.css"] },
  { file: "app/mock/LobbyHero.tsx", css: ["app/mock/lobby.module.css"] },
  { file: "app/mock/Scorecard.tsx", css: ["app/mock/scorecard.module.css"] },
  { file: "app/interview/InterviewLanding.tsx", css: ["app/interview/landing.module.css"] },
  { file: "app/interview/questions/QuestionBank.tsx", css: ["app/interview/questions/bank.module.css"] },
  { file: "app/architecture/ArchitectureView.tsx", css: ["app/architecture/architecture.module.css"] },
  { file: "app/level/LevelView.tsx", css: ["components/topic/level.module.css"] },
  { file: "components/topic/TopicPath.tsx", css: ["components/topic/path.module.css"] },
  { file: "components/topic/TopicCover.tsx", css: ["components/topic/cover.module.css"] },
  { file: "components/topic/TopicOutline.tsx", css: ["components/topic/outline.module.css"] },
  { file: "components/chapter/ChapterKit.tsx", css: ["components/chapter/chapterKit.module.css"] },
  { file: "app/git/GitView.tsx", css: ["app/git/git.module.css"] },
  { file: "app/privacy/PrivacyHero.tsx", css: ["app/privacy/privacy.module.css"] },
  { file: "components/frame/LostScene.tsx", css: ["components/frame/lost.module.css"] },
];

function union(name: string): string[] {
  const match = new RegExp(`export type ${name} = ([^;]+);`).exec(KIT);
  expect(match, `Compose.tsx declares no ${name}`).toBeTruthy();
  return [...match![1].matchAll(/"([\w-]+)"|(-?\d+)/g)].map((m) => m[1] ?? m[2]);
}

describe("the composition kit", () => {
  it("allows three tilts, one angle and nothing else", () => {
    expect(union("Tilt")).toEqual(["-1", "0", "1"]);
    expect(KIT).toContain("export const TILT_DEGREES = 1.2;");
    expect(CSS).toContain("rotate: calc(var(--tilt, 0) * 1.2deg);");
    const turns = [...CSS.matchAll(/rotate:\s*([^;]+);/g)].map((m) => m[1].trim());
    expect(new Set(turns)).toEqual(
      new Set(["calc(var(--tilt, 0) * 1.2deg)", "-2deg", "1.2deg", "calc(var(--tilt, 0) * 0.6deg)", "-1.2deg"])
    );
  });

  it("gives every layout a grid and every slot a grid area", () => {
    for (const layout of union("Layout").filter((name) => name !== "trio"))
      expect(CSS, `no rule for the ${layout} layout`).toContain(`.compose[data-layout="${layout}"]`);
    for (const slot of union("Slot")) expect(CSS, `no grid area for slot ${slot}`).toContain(`[data-at="${slot}"]`);
    expect(CSS).toContain('"a b"');
  });

  it("names every tone, tag colour and join direction in the stylesheet", () => {
    for (const tone of union("Tone").filter((name) => name !== "paper"))
      expect(CSS, `no style for the ${tone} tone`).toContain(`[data-tone="${tone}"]`);
    for (const tone of union("TagTone"))
      expect(CSS, `no style for the ${tone} tag`).toContain(`.tag[data-tone="${tone}"]`);
    for (const direction of union("JoinTo"))
      expect(CSS, `no style for the ${direction} join`).toContain(`[data-join="${direction}"]`);
  });

  it("draws shadows without a hard offset and surfaces from theme tokens only", () => {
    for (const shadow of CSS.matchAll(/box-shadow:\s*([^;]+);/g))
      expect(shadow[1], "a hard offset shadow").not.toMatch(/^-?\d+px\s+-?\d+px\s+0(px)?\s/);
    expect(CSS).toContain("var(--note)");
    expect(CSS).toContain("var(--sticker)");
    expect(CSS).toContain("var(--tape)");
    expect(CSS).not.toMatch(/var\(--mark\)/);
  });

  it("keeps notes on a card edge and connectors in the gutter", () => {
    expect(CSS).toMatch(/\.remark\s*\{[^}]*top:\s*100%/);
    expect(CSS).toMatch(/\.join\[data-join="right"\]\s*\{[^}]*left:\s*calc\(100% \+ 1px\)/);
    expect(CSS).toMatch(/\.join\[data-join="right"\]\s*\{[^}]*width:\s*var\(--gap\)/);
    expect(CSS).toMatch(/\.join\[data-join="down"\]\s*\{[^}]*height:\s*var\(--gap\)/);
  });
});

describe("the hero stages", () => {
  it.each(HEROES)("$file is composed with the kit, not placed by hand", ({ file, css }) => {
    const source = read(file);
    expect(source).toContain('from "@/components/topic/Compose"');
    expect(source).toMatch(/<Compose\b/);
    expect(source).not.toMatch(/<Stage\b|<StageCard\b|<Sticker\b|<Note\b/);
    for (const sheet of css) {
      const text = read(sheet);
      expect(text, `${sheet} still places stage cards by hand`).not.toMatch(/\.(stage|pickStage)\s+\.[\w-]+\s*\{/);
      expect(text, `${sheet} still sizes a hand-placed stage`).not.toMatch(/\.stage\s*\{/);
    }
  });

  it.each(HEROES)("$file uses only slots its layout has", ({ file }) => {
    const source = read(file);
    const needsFourth = /layout="(quad|loop)"/.test(source);
    const usesFourth = /\bat="d"|\bat: "d"/.test(source);
    expect(usesFourth && !needsFourth, `${file} uses slot d without a four-slot layout`).toBe(false);
  });

  it("puts the figures of every numbers card in one two-column table", () => {
    const kit = read("components/topic/topicKit.module.css");
    expect(kit).toMatch(/\.facts\s*\{[^}]*grid-template-columns:\s*max-content/);
    expect(kit).toMatch(/\.fact\s*\{[^}]*grid-template-columns:\s*subgrid/);
    expect(kit).toMatch(/\.fact dd\s*\{[^}]*justify-self:\s*end/);
    expect(kit).toMatch(/\.fact dd\s*\{[^}]*font-variant-numeric:\s*tabular-nums/);
  });

  it("draws every highlight as a stroke along the bottom, never as a band behind the text", () => {
    for (const sheet of [
      "components/topic/topicKit.module.css",
      "app/mock/mockKit.module.css",
      "components/home/stage.module.css",
      "app/home.module.css",
    ]) {
      const text = read(sheet);
      expect(text, `${sheet} still lays a highlight band behind text`).not.toMatch(
        /linear-gradient\(transparent \d+%, color-mix\(in srgb, var\(--mark\)/
      );
    }
    expect(read("components/topic/topicKit.module.css")).toMatch(
      /\.highlight\s*\{[^}]*linear-gradient\(var\(--marker\), var\(--marker\)\) 0 100% \/ 100% 0\.3em no-repeat/
    );
  });
});
