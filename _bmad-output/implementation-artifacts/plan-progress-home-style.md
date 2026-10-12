---
title: 'The progress page in the home language: level, stats, next steps, activity, topics, interview and badges'
type: 'feature'
ticket: ''
created: '2026-10-12'
status: 'built'
route: 'full'
route_source: 'auto'
review: ''
review_source: ''
lenses_ran: []
review_loop_iteration: 0
followup_review_recommended: false
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/implementation-artifacts/plan-review-home-style.md', '{project-root}/_bmad-output/implementation-artifacts/plan-mock-interview-home-style.md', '{project-root}/_bmad-output/implementation-artifacts/plan-topic-pages-home-style.md']
warnings: ['oversized']
deferred: []
baseline_revision: '5562ee4'
---

<intent-contract>

## Intent

**Problem:** Home, the menu, topic pages, chapters, the interview book, the architecture section, the practice workbench, the mock interview and the review page are one family now. The progress page (`/progress`: the player card with level and XP, the stat tiles, "next steps", the year-of-activity heatmap, per-topic progress, interview progress and the badge wall) is still the old site. The owner asked to redesign it, as the last of the remaining pages (whiteboard stays untouched).

**Approach:** Rebuild `/progress` as a home-style scene page on the shared kits (`TopicKit`, `Journey`, `MenuKit`, `ChapterKit`, the home pieces, `FrameHeader`, and the review page and mock lobby as the freshest references): a one-screen hero (the level and XP as the big idea: "Level 3, 120 XP to go", a primary "Continue where you stopped" pill using the saved resume, an outline pill to the review page), a composed stage of taped cards (the level card with an XP meter, a numbers card with streak, chapters read, problems solved, and a "next badge" sticky), then numbered bands: what to do next (a trail of up to three concrete next steps from the existing logic), the year of activity (the heatmap as a paper card with a hand-drawn legend, readable and keyboard reachable as today), topics (flat dashed rows or a trail with a progress meter per topic and honest "written" counts), the interview book (rounds read, confidence marks, shaky ones link), and the badge wall (earned badges as stickers or stamps, locked ones faint with how to earn them). Honest empty states for a reader with no history. Real data and gamification maths stay as they are.

## Scope

`app/progress/ProgressView.tsx`, `app/progress/progress.module.css` (716 lines: replace with family rules, no dead CSS), `app/progress/page.tsx` if needed, and any shared piece the page needs (extend the shared kits, never copy styles). The menu's progress strip and `lib/gamification.ts`, `lib/storage.ts` stay as they are (read only).
Not in scope: the whiteboard (the owner wants it untouched; do not edit `app/whiteboard/**`, `lib/whiteboard*`, `app/mock/Whiteboard.tsx`), `lib/**` logic, the review, mock and workbench pages, privacy, 404 and error pages.

## Boundaries & Constraints

**Always:**
- Start from fresh screenshots of `/progress` at 1440x900 and 390 in three states (nothing yet, some progress, lots of progress incl. earned badges and a year of activity; seed the browser storage like the e2e does) and compare with home, the review page and the mock lobby; reuse the kits and tokens.
- Behaviour unchanged: every number comes from the same data and functions (`computeStats`, `earnedBadges`, `recentActivity`, progress, resume, interview confidence), the heatmap's tooltips or accessible text, the badge descriptions, links to chapters, topics, the review and the interview book, the print/export behaviour if there is any today. Keep every e2e role and name or update the tests in the same change.
- Typography: the `--t-*` scale on `:root`; weights 400 and 700; nothing under 12px; headings in `--font-heading`, prose in `--font-body`; eight handwriting styles and nine themes must hold.
- Rules learned in earlier rounds: header gap at least clamp(48px, 8vh, 96px) above the highest decoration, a measured one-screen hero capped in height, balanced space above and below, text uses the full width of its panel, nothing part-transparent at any scroll position (the old page used `data-fx="scale"`/`stagger` reveals: remove them), no transition that shows two states at once, no one-frame flash before hydration (everything that depends on saved progress is hidden until hydration, with an e2e that samples every frame for a wrong level, count or label), reduced-motion safe, tap targets 44px on phones, no horizontal scroll at 320, the heatmap scrolls inside its own region on phones.
- Numbers come from data; no invented streaks, ranks or percentages. Celebration stays subtle (a stamp or sticker, no confetti-only moment).

**Never:** comments in source (`npm run comments` fails them); hex, white or literal colours (theme tokens only; the heatmap cells use tokens or a mix of tokens); hard offset shadows; edits to `.claude/skills/` or `_bmad/`; touching port 3000 or any broad `pkill`; committing, pushing or staging (the coordinator does that).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| New reader | No saved data | Hero "Level 1" with an honest first step, empty heatmap and badge wall with how to earn the first badge | none |
| Active reader | Progress, streak, some badges | Level and XP, streak, next steps, heatmap with activity, topic meters, earned stamps | none |
| Heavy reader | Many chapters, a year of activity, most badges | Everything fits, no overflow, heatmap legible | none |
| Hydration | Saved data present | No flash of the wrong level or counts on any frame | none |
| Phone | 390 and 320 | Stacks, heatmap scrolls inside its card, controls 44px | none |
| Fonts and themes | 8 styles x 9 themes | No clipping or overlap; axe passes | none |

</intent-contract>

## Code Map

- `app/progress/*` -- the page
- `lib/gamification.ts`, `lib/storage.ts`, `lib/resume.ts`, `lib/interviewConfidence.ts`, `lib/hooks.ts` -- logic (read only)
- `components/frame/FrameHeader.tsx`, `components/topic/TopicKit.tsx`, `Journey.tsx`, `components/ui/MenuKit.tsx`, `components/chapter/ChapterKit.tsx`, `app/review/*`, `app/mock/*` (lobby), `components/home/*` -- the language to reuse
- `e2e/smoke.spec.ts`, `e2e/a11y.spec.ts`, `tests/*`, `content/architecture/*` -- tests and chapters whose asserted numbers change

## Tasks & Acceptance

- Given `/progress` in the three states at 320, 390, 1440 and 1920, then it is visibly the same family as home, the review page and the mock lobby, with a measured one-screen hero, and nothing overlaps.
- Given a seeded reader with a year of activity and badges, then every number matches the old page's numbers for the same storage (compare before and after), the heatmap stays accessible, and links work.
- Given eight handwriting styles and nine themes, then nothing is clipped or overlapped and axe passes in all nine themes at 1440 and 390 on the states the e2e opens (keep the existing seeded year-of-activity state).
- Given `npm run check`, `npm run build` and the full e2e in a clean copy, then all pass; architecture chapter numbers asserted by `tests/claims.test.ts` are updated.

## Implementation Notes

(agent: log progress here, newest last)

**Round 1 (build)**
- `/progress` is a home-style scene page on `PageFrame layout="reader"` with `TopicPage accent="blue"` and the kicker mark. Files: `app/progress/ProgressView.tsx` (data and state, the same hooks and functions as before), `ProgressHero.tsx` (one-screen hero and the composed stage), `ProgressBands.tsx` (next steps, the year of activity, topics, interview, badge wall, the joke sticky), `progressModel.ts` (pure helpers, unit tested: heat buckets, topic rows, next steps, badge goals), CSS modules `progress.module.css` (hero) and `bands.module.css`; the old 716-line stylesheet and every `data-fx` reveal are gone. `lib/` is untouched.
- Hero: "Level 3, 120 XP to go." with the underline, a lead built from the real counts, a primary "Continue where you stopped" pill (the menu's `continueCard` with the saved resume; "Start <topic>" or "Pick a topic" without one), an outline pill to the review (with the due count), chips (best streak, active days, badges). Stage: taped level card with the XP meter and the level-up stamp, numbers card (streak, chapters read, exercises solved, reviews done), a yellow "Next badge" sticky (nearest unearned badge by progress, hidden on phones), a streak sticker and a hand note. Everything that depends on saved progress is hidden with the kit's `pending` class until hydration.
- Bands: 01 next steps (shared `Steps`/`Step` trail added to `TopicKit`, the review start band now uses it too; the review step shows only when something is due), 02 the year (taped heatmap paper card with a hand-drawn legend, scroll region kept, a yellow "This week" sticky), 03 topics (dashed rows with a meter each; the interview book is its own band), 04 interview (rounds read, the knew/shaky/blank bar with theme role colours, the drill link), 05 the badge wall (earned: taped stickers; locked: dashed with how far you are; the next one tagged), then the dev joke as a sticky.
- Shared code: the round "stamp" moved from `bands.module.css` and `session.module.css` of the review page into `app/mock/mockKit.module.css` (one copy, used by the review, the session and the progress level-up). Two small behaviour notes: the day-of-week maths now parses `YYYY-MM-DD` as a local date (the old `new Date("YYYY-MM-DD")` was off by a day west of UTC), and "1 weak interview answers" now pluralises.
- Tests: new `e2e/progress.spec.ts` (9), `/progress` in the smoke hero-measure test, the theme-accent test reads the level meter fill, two new a11y states, `tests/progress-model.test.ts`, `tests/topic-type.test.ts` covers both modules, `tests/theme-roles.test.ts` loses the progress exceptions. Architecture chapters: 54 CSS modules, 94 client files, 54 axe states (10 seeded), 175 axe tests, 10 specs and 453 browser tests, 889 unit tests, a progress.spec.ts row and a "progress page" section.
- Found by the new tests: at 1280x720 the next-badge card touched the numbers card (fixed: narrower card, 4 percent left offset); the hydration sampler matched "0 of 41" inside "20 of 41" (word boundary).

**Gates (clean scratch copy)**
- `npm run build` ok; `npm run check` ok (889 unit tests in 45 files); full e2e 471 of 471, no retries, rerun after the last change. Numbers for the same storage (empty, some, lots) were compared with the old page: level, XP, XP bar, streak, best streak, active days, chapters, exercises, reviews, badges, week total, year total and active days, per-topic counts, interview rounds and knew/shaky/blank all match.
- Reviewed by eye (own `next start`, reduced motion): the three states at 1440 Classic light, 1920, 1280x720, Marker Night, Chalk lavender, Reading blueprint, Roboto light, Pen sepia, Script rose, Sketch forest, Classic Mono and Kraft; 390 (all three states), 320; each band at 1440 and 390.

## Plan Change Log

## Review Triage Log

## Verification

**Commands:**
- in a clean scratch copy: `npm run build`, then `npm run check`, then `npx playwright test --workers=3 --retries=0` -- expected: all green (a known home rail landing test can flake under load; rerun it alone before reporting a failure)

**Manual checks:**
- Own screenshots over several rounds at 390, 1440 and 1920 of the three states; Classic, Marker, Chalk, Reading, Roboto; light, Night, lavender, blueprint; next to home, the review page and the mock lobby to judge one family.

## Auto Run Result

Built. Independent check in a clean copy on the final code: `npm run build` ok; `npm run check` 889 unit tests in 45 files (one pre-existing lint warning in `components/topic/useReadingPlan.ts`); full e2e 471 of 471 with no retries. `git diff --stat -- app/whiteboard lib app/mock/Whiteboard.tsx .claude _bmad` is empty; the only config change is one word appended at the end of `.cspell/project-words.txt`. `/progress` was rebuilt as a home-style scene page (hero with the level and a "Continue where you stopped" pill, level card with XP meter, numbers card, next-badge sticky, bands for next steps, the year of activity, topics, the interview book and the badge wall); every number matches the old page for the same storage in three seeded states (agent's diff proof). Differences to know: the interview book is its own band, "1 weak interview answers" now pluralises, and weekday labels in the heatmap parse dates as local dates. Screenshots reviewed by the coordinator: none of the full page (the owner sent crops of the hero stage, which led to the stage-compositions plan). Not verified by eye by the coordinator: the whole page at any size, other themes and fonts, the heatmap on phones.
