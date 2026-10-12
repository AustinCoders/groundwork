---
title: 'Interview book and "How this is built" in the home language'
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
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/implementation-artifacts/plan-topic-pages-home-style.md', '{project-root}/_bmad-output/implementation-artifacts/plan-chapter-pages-home-style.md']
warnings: ['oversized']
deferred: []
baseline_revision: 'bd5f5e7'
---

<intent-contract>

## Intent

**Problem:** The two big non-topic reading sections still look like the old site: the interview book (`/interview`: landing, the round pages, the question bank, its shell and header) and "How this is built" (`/architecture`: the index/landing view). The owner asked to redesign the UI of both, in the same language as home, the menu, the topic pages and the chapter pages.

**Approach:** Redesign both as home-style scenes using the shared kits (`components/ui/MenuKit.tsx`, `components/topic/TopicKit.tsx` and `Journey.tsx`, the home `Scene`/`Stage`/`StageCard`/`Tape`/`Sticker`/`Note`, and the reusable chapter kit that the chapter-pages work introduces), with the one-screen hero rule from the topic pages (a measured hero under the header, capped height, balanced space, no next section peeking in on desktop; natural height on phones and short windows). The architecture chapters themselves (`/architecture/[chapter]`) render through `ChapterView` and are covered by the chapter-pages work; do not redo them, but make sure they agree with the new index. The interview round pages are separate from `ChapterView` (`app/interview/[chapter]/RoundView.tsx`): bring them to the same chapter look through the chapter kit so that a round reads like a chapter, plus whatever is specific to a round (stage, difficulty, question and follow-up blocks, the "answer that loses the room" stamp, rubric hints).

## Scope

1. Interview: `app/interview/InterviewLanding.tsx`, `BookShell.tsx`, `book.module.css`, `app/interview/[chapter]/RoundView.tsx`, `app/interview/questions/QuestionBank.tsx` (and its page), the interview header and section navigation.
2. Architecture: `app/architecture/ArchitectureView.tsx`, `architecture.module.css`, `app/architecture/page.tsx`.
3. Shared pieces they need: extend the shared kits, never copy styles.
Not in scope: the home interview-book scene (already done), the chapter template itself, the menu and sidebar, DSA (paused).

## Boundaries & Constraints

**Always:**
- Start from a fresh look at the current pages (screenshots at 1440 and 390), the home scenes, the topic pages (`TopicKit`) and the chapter kit as it landed; reuse their pieces and tokens, and put anything new that two surfaces share in one shared place.
- Interview landing: a one-screen hero with the big question ("From the first call to the offer"), the stage structure of the book (Screening, Technical, Design and depth, People and offer) as the home winding trail or numbered stage rows with round counts and time, a "start at round 1" primary pill and a "browse all N questions" outline pill, honest numbers from data (never hard-coded), then the rounds as stops on the trail. Round pages read like chapters: hero with stage and difficulty kicker, the question as the featured quote, the answer that loses the room as a stamped sticky note, follow-ups as notes, the answer sections in the chapter prose, previous and next round as the next-stop scene. The question bank gets the same family look with search and filters that stay usable at 390.
- Architecture landing: a one-screen hero ("How this is built") with the layers of the site as a composed stage (a small diagram-like card set on taped paper), the chapters as a trail or numbered rows grouped by part, counts from data, a clear "start here" entry; keep the existing numbers asserted by `tests/claims.test.ts` correct.
- Keep behaviour: progress and resume, search indexes, keyboard shortcuts, hash links, the Menu pill header, mock-interview links, `aria` roles and names the e2e uses (or update those tests in the same change).
- Typography: the `--t-*` scale on `:root`; weights 400 and 700; nothing under 12px in chrome; titles in `--font-heading`, prose in `--font-body`; eight handwriting styles and nine themes must hold (check Classic, Marker, Chalk, Reading, Roboto and light, Night, lavender, blueprint). Prose and code blocks use the full width of their column (no narrower cap on text than on the cards beside it).
- Spacing: header gap at least clamp(48px, 8vh, 96px) above the highest decoration, balanced above and below, capped hero height; nothing part-transparent at any scroll position; no transition that shows two states at once; no one-frame flash before hydration.
- Responsive 320 to 2560, no horizontal page scroll, tap targets at least 44px on phones.

**Never:** comments in source (`npm run comments` fails them); hex, white or literal colours (theme tokens only); hard offset shadows; `data-fx` scroll reveals on these pages; edits to `.claude/skills/` or `_bmad/`; touching port 3000 or any broad `pkill`; committing, pushing or staging (the coordinator does that).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| New visitor | `/interview` | Hero, stages and rounds as a trail; start at round 1 | none |
| Returning reader | Progress saved | The trail shows what is read and where you stopped | none |
| Round page | Any of the 27 rounds | Same family as chapters, round specifics preserved, previous and next scene | first and last round degrade gracefully |
| Question bank | Search, filter, 390 wide | Usable, no clipping, results update without layout jumps | empty result shows an honest empty state |
| Architecture index | `/architecture` | Hero plus chapter trail, counts from data | none |
| Fonts and themes | 8 styles x 9 themes | No clipping or overlap; axe passes | none |
| Reduced motion, JS off | Preference or no JS | Everything visible and linked | none |

</intent-contract>

## Code Map

- `app/interview/*`, `app/interview/[chapter]/RoundView.tsx`, `app/interview/questions/*` -- interview book
- `app/architecture/ArchitectureView.tsx`, `architecture.module.css`, `page.tsx` -- architecture index
- `components/ui/MenuKit.tsx`, `components/topic/TopicKit.tsx`, `Journey.tsx`, `components/home/*`, the chapter kit from the chapter-pages work -- the language to reuse
- `e2e/smoke.spec.ts`, `e2e/a11y.spec.ts`, `tests/*`, `content/architecture/*` -- tests and chapters whose asserted numbers change

## Tasks & Acceptance

- Given `/interview`, a round page, the question bank and `/architecture` at 320, 390, 1440 and 1920, then each is visibly the same family as home, the topic pages and the chapter pages, with a measured one-screen hero where the topic pages have one.
- Given the eight handwriting styles and nine themes, then nothing is clipped, overlapped or under 12px, and axe passes in all nine themes at 1440 and 390 for the states the e2e opens (add the interview landing, a round and the question bank if they are not already covered).
- Given `npm run check`, `npm run build` and the full e2e in a clean copy, then all pass; architecture chapter numbers asserted by `tests/claims.test.ts` are updated.

## Implementation Notes

(agent: log progress here, newest last)

**Build 1 (interview book, question bank, rounds, architecture index)**
- Shared pieces added, nothing copied: `TopicKit` gets `CardKicker`, `ProgressRing`, `ProgressMeter` (moved out of `path.module.css`, the path page now uses them), `ToggleGroup` and `Toggle` (the pill filters of the landing and the bank) and a `pending` class that hides a client-only value until hydration (`html[data-js]` plus `@media (scripting: enabled)`, so it holds even on the very first frame); `Journey.Station` gets an optional `blurb`; `ChapterKit` gets `subtitleHtml` and `learnLabel` on the hero, `unit`/`scope`/labels/`aside` on the finish card, `navLabel`/`unit` on the end scene, `className` on `Prose` and a `label` on the Chapters button, sheet and rail; `TocCard` takes `label`, `item`, `unit`, per-question `marks`, `before` and `after`.
- `app/interview/BookShell.tsx` and the 1,600-line `book.module.css` are gone. `BookFrame` is a thin wrapper over `PageFrame` (the same header as every topic page: back pill, Menu pill, brand, topic mark, related-page tabs), so the book no longer carries its own header CSS.
- Landing: one-screen hero (H1 "From the first call to the offer", honest kicker from data, "Start the book" / "Continue: round" pill, "Browse all N questions" outline pill, follow-up and trap chips) with a composed stage: taped question of the day (reveals in place, fixed height), a taped numbers card, a "your progress" sticky with the meter and the shaky link, a note and a sticker. Then 01 four steps on a dashed line, 02 the loop: company filter and six parts, each a Station and a winding Journey of round stops (code, title, what it decides, questions, follow-ups, minutes, tick, confidence bar, "pick up here" sticker), 03 the mock-interview closer. The label of the primary pill and the progress values are hidden until hydration, so nothing changes under the reader's eyes.
- Rounds go through the chapter kit: rounds rail (`ChapterRail` labelled "Rounds", search over `/interview/search-index.json`), Rounds sheet button on phones, crumbs and pager in the header, `ChapterHero` (code in the kicker, part, title with the last words underlined, the intro as the lead, "In this round" stamp card of the questions, position sticker), an "at a glance" paper card (length, who, decides, fail mode, asked at, mock link), a Read/Practise switch, each question as a numbered section (`R3.1` pill, dashed rule, mark chip, the question as a highlighted quote, "what they are really testing" with a dashed rule), the answer inside the chapter `.prose` layer (`.say`, the trap as the stamped `.warn`, the 2026 note as the mint sticky, follow-ups as the yellow sticky, code in the editor card with the label from the data), the "How did you do?" row, the aside "In this round" with live marks, the Finish card ("Mark as read", "Clear my marks") and the next-stop scene. Answer markup is built by `app/interview/answerHtml.ts` and shared with the drill.
- Question bank: one-screen hero (flashcard stack stage, mark chips), then 01 search pill (MenuKit), part and mark toggles, count and the drill button, flat dashed result rows with expandable detail, an honest empty state with "Clear the filters". The drill drops the hero and shows the flashcard on taped paper with the same answer blocks; keys (space, Enter, 1 2 3, Escape) are unchanged.
- Architecture: one-screen hero with a composed stage (the four lanes as taped cards joined by a dashed flow, a sticker "every number measured"), 01 the eight measured numbers on one taped sheet, 02 "The system on one page" as flat dashed rows per lane (20 boxes, each a link to its chapter), 03 three Journeys of the 26 chapters grouped by part with minutes and read ticks; the "Start reading" header action stays.
- Tests: `e2e/book.spec.ts` (16 tests: trails and counts from data, daily card keeps its height and no stage card covers another at four sizes, a per-frame sampler for the wrong label before hydration, marks and read state, first and last round, practice mode, bank filters and empty state, totals agree, 44px targets and no overflow at 390, a crawl of every round at 390 and 320 with no console error, no part-transparent content, code regions); `e2e/smoke.spec.ts` (heading and accent selectors, practice test selects the question sections, the hero measure now covers the landing, the bank and the architecture index); `e2e/a11y.spec.ts` (page `/interview/r1`, five new states); `tests/topic-type.test.ts` covers the four new modules; `tests/theme-roles.test.ts` loses the old book module.

**Gates (clean scratch copy, final code)**
- `npm run build` ok; `npm run check` ok (744 unit tests in 43 files, the one old lint warning in `useReadingPlan.ts`, comments, format and spelling clean); full e2e 396 of 396 with no retries, including `book.spec.ts` (16) and the five new axe states in all nine themes at 1440 and 390.
- Found and fixed on the way: the hidden-until-hydration class raced the theme script on the first frames under load (now also `@media (scripting: enabled)`); the landing stage was taller than the one-screen cap at 1920x1080 (stage height capped at 520px); the bank's theme-accent check moved from a toggle to the drill button.
- Reviewed by eye: landing at 1440, 1920, 1280x720 (Classic light, Marker light, Chalk Night, Reading lavender, Roboto blueprint, Reading sepia), 390 and 320; question bank at 1440 (Classic, Roboto blueprint) and 390; round R3 at 1440 (Classic, Chalk Night practice mode with marks) and 390, R1 end scene, R7 at 320; architecture at 1440, 1280x720, 1920 (Classic, Reading lavender, Chalk Night, Pen kraft) and 390.

## Plan Change Log

## Review Triage Log

## Verification

**Commands:**
- in a clean scratch copy: `npm run build`, then `npm run check`, then `npx playwright test --workers=3 --retries=0` -- expected: all green (a known home rail landing test can flake under load; rerun it alone before reporting a failure)

**Manual checks:**
- Own screenshots over several rounds at 320, 390, 1440 and 1920 of the interview landing, two rounds, the question bank and the architecture index; Classic, Marker, Chalk, Reading, Roboto; light, Night, lavender, blueprint; next to home and a topic page to judge one family.

## Auto Run Result

Built. Independent check in a clean copy on the final code, on top of the staged chapter-pages work: `npm run build` ok; `npm run check` 744 unit tests in 43 files (one pre-existing lint warning in `components/topic/useReadingPlan.ts`); full e2e 396 of 396 with no retries. The interview landing, the question bank, every round and the architecture index were rebuilt in the home language on the shared kits; `BookShell.tsx` and the 1,600-line `book.module.css` were replaced by `BookFrame`. Screenshots reviewed by the coordinator: the interview landing (hero and the loop section, Classic light, 1440x900) and the architecture index hero (Night, Classic, 1440x900). Not verified by eye: round pages, the question bank, the drill screen, themes forest, rose, mono and sepia, the Sketch, Script and Pen fonts, 2560 wide, print. The primary pill reads "Start the book" because the first stop in the data is the scouting report, not R1.
