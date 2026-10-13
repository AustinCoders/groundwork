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
  "the topic shell": "components/topic/shell/shell.module.css",
  "the outline chapter": "components/topic/reader.module.css",
  "the interview landing": "app/interview/landing.module.css",
  "the question bank": "app/interview/questions/bank.module.css",
  "the interview round": "app/interview/[chapter]/round.module.css",
  "the architecture landing": "app/architecture/architecture.module.css",
  "the workbench": "components/practice/workbench.module.css",
  "the problems list": "app/problems/problems.module.css",
  "the mock kit": "app/mock/mockKit.module.css",
  "the mock shell": "app/mock/shell.module.css",
  "the mock room bar": "app/mock/roomBar.module.css",
  "the mock lobby": "app/mock/lobby.module.css",
  "the mock planner": "app/mock/plan.module.css",
  "the mock readiness board": "app/mock/readiness.module.css",
  "the mock guide": "app/mock/guide.module.css",
  "the mock room": "app/mock/room.module.css",
  "the mock scorecard": "app/mock/scorecard.module.css",
  "the review hero": "app/review/review.module.css",
  "the review bands": "app/review/bands.module.css",
  "the review session": "app/review/session.module.css",
  "the review stage dots": "app/review/stageDots.module.css",
  "the progress hero": "app/progress/progress.module.css",
  "the progress bands": "app/progress/bands.module.css",
  "the git landing": "app/git/git.module.css",
  "the privacy page": "app/privacy/privacy.module.css",
  "the not-found and error scene": "components/frame/lost.module.css",
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
  "--t-panel",
];

const MONO_USERS = [
  ".kicker",
  ".eyebrow",
  ".teaserCaption",
  ".upCode",
  ".cardKicker",
  ".fact dd",
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
  ".rowCode",
  ".choices legend",
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
  ".level,\n.solvedChip",
  ".pgMark",
  ".count",
  ".crumbs",
  ".emptyText kbd",
  '.empty[data-phase="idle"]::after',
  ".stamp small",
  ".levels b",
  ".badge",
  ".level",
  ".avatar",
  ".kindTag",
  ".coreBadge",
  ".barValue",
  ".keys",
  ".keys kbd",
  ".label",
  ".where",
  ".clock",
  ".previewClock em",
  ".modeCount",
  ".cardSource",
  ".mapNo",
  ".liveMin",
  ".roundMeta",
  ".retryMeta",
  ".compScore",
  ".compDelta",
  ".heat thead th",
  ".heat td",
  ".historyDate",
  ".historyScore",
  ".roundCode",
  ".panelCount",
  ".facts dt",
  ".weight",
  ".band span",
  ".sampleTag",
  ".bars b",
  ".tag",
  ".shiftTag",
  ".pushWho",
  ".timerNum",
  ".inlineTimer",
  ".briefFacts dt",
  ".stampScore",
  ".cardScore",
  ".stageTable th",
  ".qNum",
  ".qScore",
  ".qMeta",
  ".num",
  ".barNum,\n.barDay",
  ".stampNote",
  ".key",
  ".digest",
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
      "components/topic/TopicHome.tsx",
      "components/topic/shell/TopicShell.tsx",
      "components/topic/shell/JourneyMap.tsx",
      "components/topic/shell/Hero.tsx",
      "components/topic/shell/Ring.tsx",
      "components/topic/shell/TrailLeg.tsx",
      "components/topic/shell/ChapterRow.tsx",
      "components/topic/TopicOutline.tsx",
      "components/topic/TopicKit.tsx",
      "app/interview/InterviewLanding.tsx",
      "app/interview/BookFrame.tsx",
      "app/interview/[chapter]/RoundView.tsx",
      "app/interview/questions/QuestionBank.tsx",
      "app/architecture/ArchitectureView.tsx",
      "app/problems/ProblemsView.tsx",
      "app/mock/MockApp.tsx",
      "app/mock/Lobby.tsx",
      "app/mock/LobbyHero.tsx",
      "app/mock/LobbyGuide.tsx",
      "app/mock/LoopWizard.tsx",
      "app/mock/Readiness.tsx",
      "app/mock/Room.tsx",
      "app/mock/Scorecard.tsx",
      "app/review/ReviewView.tsx",
      "app/review/ReviewHero.tsx",
      "app/review/ReviewBands.tsx",
      "app/review/ReviewSession.tsx",
      "app/progress/ProgressView.tsx",
      "app/progress/ProgressHero.tsx",
      "app/progress/ProgressBands.tsx",
      "components/practice/PracticeWorkspace.tsx",
      "components/frame/FrameHeader.tsx",
      "app/git/GitView.tsx",
      "app/privacy/PrivacyHero.tsx",
      "app/privacy/PrivacySection.tsx",
      "components/frame/LostScene.tsx",
      "app/not-found.tsx",
      "app/error.tsx",
    ]) {
      expect(read(file), file).not.toContain("data-fx");
    }
  });
});
