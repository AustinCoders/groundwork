---
title: 'Home How it works: a section the visitor can actually try'
type: 'feature'
ticket: ''
created: '2026-10-09'
status: 'built'
route: 'full'
route_source: 'auto'
review: 'none'
review_source: 'auto'
lenses_ran: []
review_loop_iteration: 0
followup_review_recommended: false
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/implementation-artifacts/plan-home-scroll-motion.md']
warnings: ['oversized']
deferred: []
baseline_revision: '1e05b943d388c60cf60f16a47ee54e27a7be1f8a'
---

<intent-contract>

## Intent

**Problem:** The How it works section (`#how`, headline "Read it. Run it. Get asked about it. Keep it.") has been redesigned twice and the owner still dislikes it, both columns. Today the left is four big step tabs and the right is an illustrated loop track whose cards are pure pictures; in the owner's latest screenshot the centre caption card even shows two steps' texts printed over each other mid-crossfade. Illustrations of a product do not convince; using it does.

**Approach:** Replace the whole section (left and right) with TRY IT LIVE: a real, tiny, safe interactive workbench where the visitor actually does the four steps in a minute. Read: tap a line of a short real explanation to open its plain-words breakdown and see "built on" links to the layer below. Run: a counter function in three variants; pick a variant and press Run to execute the real functions in the browser against a small test list, break it, then fix it, and watch tests turn green. Get asked: a real interview question with options; the chosen answer is graded with an explanation and the interviewer's follow-up appears with a typing indicator. Keep: press "Mark as read today" and a calendar lights the real review days the site would schedule. The left is a ladder of the four steps showing what the visitor has done (ticks, "2 of 4 tried") with a Next button and an honest "Demo only, nothing is saved" line. It is not pinned and not scroll-driven; the visitor drives it.

## Boundaries & Constraints

**Always:**
- Branch `feature/platform-topics` (HEAD 1e05b94); the hero, header, footer and the other scenes' content do not change; no commits, no staging; Node 24 (`PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH`); do builds, e2e and screenshots in a scratch copy of the repo under your scratchpad (rsync excluding .next, .git, .vercel, .claude, _bmad; `git init -q` in the copy; build first so generated types exist; a font-fetch error in a build is transient, retry once); only ports 3100 to 3102; NEVER touch the dev server on port 3000; NEVER run a broad `pkill` or `killall` (kill only a specific pid whose cwd is under your scratchpad); theme tokens only (no hex, no white, nine themes, both heading fonts); no comments in source; no dead code; append new spelling words to the end of `.cspell/project-words.txt`; update the architecture chapters for every number or sentence that moves (`tests/claims.test.ts` green).
- Section contract: keep `section#how`, the eyebrow "03 How it works", the visible `<h2>` "Read it. Run it. Get asked about it. Keep it.", the sub copy, the connector waypoint attribute (`data-waypoint`) and scroll margin so the connectors and rail still dock correctly, and the one-view rule from 721px up (at least a viewport tall, content centred). The section is NOT pinned and has no scroll-scrubbed pieces: remove `how` from the pin system (`PIN_STEP_VH`, `pinLengthVh`, `usePin` wiring in HowScene, the pinned connector slack logic for this section, `data-pin-*` attributes, the e2e and unit tests for a pinned How, and any `fx.ts` kinds, lib helpers and CSS that only the loop track and the How pin used), keeping Paths and the interview book pinning exactly as they are; update `tests/pin-lengths.test.ts` and the architecture chapters (page height, test counts) accordingly.
- Layout: the same two-column scene grammar as the other scenes from 1081px (copy column about 5/12, workbench about 7/12, sides alternating as before: stage on the right), one column from 721px to 1080px, a single compact column on phones. Left column: eyebrow, headline, sub copy, then the LADDER: four real buttons forming a `role="tablist"` (01 Read, 02 Run, 03 Get asked, 04 Keep; number, title, one line, a tick when that step's goal is achieved, the active one highlighted, roving tabindex, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Home, End), a progress line "N of 4 tried" with `aria-live` polite, a "Next step" button, and the honest note "A small demo. Nothing you do here is saved." Right: ONE workbench card (a paper card with tape and the stage vocabulary: a sticker, a handwritten note, real-data chips; no tilt on the interactive card beyond about 1 degree so it stays crisp and clickable; no backdrop panel, dotted or dashed backdrop, glow or blob behind it) whose content is the active step's panel in a `role="tabpanel"`. All four panels exist in the server HTML; without JavaScript each shows its final state (static explanation, the tests all passing, the answer and follow-up visible, the calendar lit) stacked, and with JavaScript only the active panel shows (`hidden` and `inert` applied after mount, as the other scenes do).
- Panel 01 READ (real content): a three-sentence explanation of how code runs, each sentence a real button; activating a sentence expands a plain-words breakdown under it and highlights, in a small "layers" outline beside it, the layer it rests on (Syntax and values, How code runs, Core concepts, Patterns, Systems and scale; each layer only uses words from the ones below it); goal achieved when the visitor has opened at least two sentences.
- Panel 02 RUN (real execution, safe): a code card shows a small counter function in three variants selectable by a segmented control (a shared global counter that fails the "each counter keeps its own n" test, a closure version that passes all, a version with an off-by-one that fails "counts up from 1"); a "Run tests" button executes the REAL functions (defined in the module, never built from strings, no `eval`, no `new Function`, no user-typed code) against a list of three or four small tests and shows each test's result and the "N / M passed" line; a failing test shows its expected and received values; goal achieved when the visitor has seen a failing run and then a fully passing run. The tests and variants live in a pure module in `lib/` with unit tests (each variant's expected pass/fail set, determinism, isolation: running twice does not leak state between runs).
- Panel 03 GET ASKED (real grading): one real interview-style question about the code above (a short closure question) with four options, one correct; choosing an option grades it with an explanation per option (reuse the pure grading approach of the chapter check where it fits, but do not import `content/` into the client; hand-authored question data lives in a `components/home` data module or a server-passed prop), then the interviewer's follow-up appears after a typing indicator (CSS, off under reduced motion) with a one-line "what they are really testing" note; goal achieved when the visitor has answered. Copy says "checked", never "verified".
- Panel 04 KEEP (real schedule): a "Mark as read today" button; pressing it lights a month-style calendar at the real review gaps from `REVIEW_GAPS_DAYS` in `lib/storage.ts` (import the constant, never write storage), labelled with the dates relative to today ("today", "in 3 days", "in 7 days", "in 21 days", "in 60 days") as real text; a "Reset demo" button clears it; goal achieved when pressed. It must write no `jsnotes:*` or `groundwork:*` key (an e2e asserts localStorage is unchanged after using every panel).
- State: plain React state in the client scene; no storage, no timers beyond the typing indicator's CSS; the visitor can do the steps in any order; Next goes to the next step; Run, answers and the calendar can be reset by "Reset demo" in the ladder footer. Reduced motion: no animation (typing indicator static, instant changes). Hydration safe (no `Date.now()`, `Math.random()` or `matchMedia` in the render path; compute "today" in an effect or on click).
- Accessibility: the tablist semantics above; every control a real, labelled, keyboard-operable element with visible focus; results announced politely (test results, grading, calendar lit); decoration (tape, sticker, notes, chips' duplicates) `aria-hidden`; text contrast AA in nine themes; no text covered by another element at any state; axe clean at 1440 and 390 in nine themes for each of the four panels and for a failing-tests state.
- Remove everything of the loop-track How scene that is no longer used (HowScene's track, stations, walker integration for How, the crossfaded caption card, its CSS in `how.module.css` and `track.module.css` where only How used it, motion kinds, tests); `Track.tsx` and its CSS stay because Paths uses them: audit and remove only what is dead; run the unused-export and unused-class audit over every file you touch.
- Tests: unit tests for the pure demo module (variants, tests, isolation), the question grading and the review calendar dates (from a fixed "today"); e2e in `e2e/smoke.spec.ts`: the ladder tablist works by mouse and keyboard, each panel's demo works (open two sentences; run the failing variant then the passing variant and see "3 / 3 passed"; answer wrongly then rightly and see the follow-up; press Mark as read today and see the real gap dates), "N of 4 tried" updates, Reset demo works, localStorage is unchanged after using everything, panels are all present with JavaScript disabled in their final state, the section is one view tall at 1280x720 and 1440x900, no text overlap or clipping probe in every panel state (extend `e2e/textProbe.ts`) at 1280x720, 1440x900 and 1920x1080, no horizontal overflow at 375, 1024 and 1920, reduced motion has no animation; update `e2e/a11y.spec.ts` states for the four panels; remove the tests of the old loop track and the pinned How; update `tests/claims.test.ts`-asserted counts in the architecture chapters.
- Visual quality: screenshot every panel and the ladder at 1280x720, 1440x900, 1920x1080 and 390 in a dark theme, a light theme and a handwriting-font theme, with the demos in their before and after states, look critically as a senior frontend developer and UI/UX designer, and iterate over several rounds until the section is clear, tidy, fun to use and distinctive, with no empty areas.

**Never:** Do not use `eval`, `new Function`, `dangerouslySetInnerHTML` for demo content, or any user-typed code execution; do not write to storage; do not import `content/` into client code; do not pin or scroll-drive this section; do not use a crossfade that shows two panels' text at once (swap with `hidden` and give only the incoming panel a short slide-in); no backdrop panel, dotted pattern, glow or blob; no placeholder or skeleton bars; do not change the hero, the other scenes or routes; do not add a dependency; do not use hex or white.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| First paint | desktop | ladder with step 1 active, Read panel visible, no tests run yet | none |
| Run failing variant | pick the global counter, Run | one test fails with expected and received, "2 / 3 passed" | none |
| Run passing variant | pick the closure, Run | "3 / 3 passed" and the step ticks after a failing then a passing run | none |
| Run twice | press Run repeatedly | same result, no leaked state | none |
| Answer a question | choose any option | graded with that option's explanation, follow-up appears | none |
| Mark as read | press the button | calendar lights the real gaps with relative dates | no storage write |
| Reset demo | press it | all panels return to their initial state, ticks cleared | none |
| Keyboard | Tab and arrows | tablist and every control reachable, focus visible | none |
| No JavaScript | scripts blocked | all four panels visible in their final static state | none |
| Reduced motion | `prefers-reduced-motion` | no animation, instant changes | none |
| Phone | 390px | one column, ladder as a horizontal scroller or stacked buttons, panels full width, no overflow | none |

</intent-contract>

## Code Map

- `components/home/HowScene.tsx`, `how.module.css`, `Track.tsx`, `track.module.css` (Track stays for Paths), `usePin.ts`, `useSceneScroll.ts`, `fx.ts`, `Stage.tsx` (the stage vocabulary: Scene, Copy, Stage, Tape, Sticker, Note), `Connectors.tsx` (waypoints and pinned slack), `app/HomeView.tsx` (composition, `data-pin-groups`/steps for How, hops facts that mention "4 steps").
- `lib/pinLengths.ts` (`PIN_STEP_VH`, `pinLengthVh`), `tests/pin-lengths.test.ts`, `lib/storage.ts` (`REVIEW_GAPS_DAYS`), `lib/checkDraw.ts` (`gradeAnswer`, optional), `lib/homeFacts.ts` or `lib/homePaths.ts` (how-it-works data constants such as `HOW_STEPS`, `TEST_NAMES`), `lib/breakpoints.ts`, `lib/math.ts`.
- `e2e/smoke.spec.ts` (How tests, pinned How tests, textProbe and motionProbe usage), `e2e/a11y.spec.ts` (How states), `e2e/textProbe.ts`, `e2e/motionProbe.ts`, `tests/claims.test.ts`, `content/architecture/*` (test counts, line counts, page height, home script size).
- New: a pure demo module such as `lib/howDemo.ts` with `tests/how-demo.test.ts`, and the new How scene components and CSS module under `components/home/`.

## Tasks & Acceptance

**Execution:**
- [x] `lib/howDemo.ts` and tests -- counter variants, test list, runner, isolation; the question and its grading; the review calendar dates
- [x] the new HowScene (ladder, four panels, workbench, ladder footer) with its CSS; remove the loop-track How code, pinned How wiring and their tests
- [x] `e2e/smoke.spec.ts`, `e2e/a11y.spec.ts`, `e2e/textProbe.ts` -- the demo flows, no-JS, storage-unchanged, probes, axe states
- [x] `content/architecture/*`, `.cspell/project-words.txt`; cleanup audit; Implementation Notes

**Acceptance Criteria:**
- Given the How it works section, when a visitor uses it, then they can read an explanation line by line, run real functions and see tests fail then pass, answer a real question and see its follow-up, and mark a chapter read to see the real review schedule, all in one view at 1280x720 and 1440x900, with the ladder showing what they have tried.
- Given any panel state, then no text is covered or clipped and no two steps' texts are ever shown over each other.
- Given storage, then using the whole section writes no key; given no JavaScript or reduced motion, then every step is visible in its final state with no animation.
- Given the code, then there is no `eval` or `new Function`, no pinned How, no dead loop-track code, Paths and the interview book still pin and work, and the connectors still dock at How.
- Given `npm run check`, `npm run build` and the full e2e, then all pass with axe clean in nine themes at 1440 and 390; your own screenshots of every panel in before and after states look clear, fun and polished.

## Implementation Notes

Progress (update as work proceeds; a restart must resume from here):

- Round 1 built (scratch copy at the session scratchpad `repo/`, synced with `tools/sync.sh`; dev server on 3102 for visual iteration, production on 3101):
  - `lib/howDemo.ts` (pure): three counter variants as real functions (`shared`, `closure`, `offByOne`), three tests (`counts up from 1`, `each counter keeps its own n`, `adds exactly one every call`) run on a fresh instance per test (no state leaks between tests or runs), `runVariant`, the question and `gradeAnswer` (`Checked:` copy), `reviewSchedule` from `REVIEW_GAPS_DAYS` (cumulative offsets 0, 3, 10, 31, 91, 271 because every review restarts the gap, as `lib/storage.ts` does). `tests/how-demo.test.ts`.
  - `components/home/howState.ts` (reducer, goals), `HowPanels.tsx` (four panels), `HowScene.tsx` (ladder tablist, Next step, Reset demo, "N of 4 tried", workbench bench with tape, sticker, note, spark, two chips), `how.module.css` rewritten.
  - No-JavaScript: `liveOnly` / `finalOnly` classes keyed on `html[data-js]` plus final-state blocks rendered only until mount (`!mounted`), so JS visitors never see a flash of the final state.
  - Removed: pin wiring for How (`data-pin-*`, `PIN_STEP_VH.how`), loop track (`buildLoop`, `loopProgress`, `LOOP_*`, `data-fx-shape`), fx kinds `reveal light bar typing fill stroke`, `reveal()` and `lt` in `lib/pose.ts`, `FxInput.t`, `useNarrow.ts`, `NARROW`, `REVIEW_DAYS`, the loop walker CSS.
  - Panel zoom `--k` (1.1 from 1300x800) and stage height caps (580, 640 from 1300x800) so the bench fills at 1440x900 and 1920x1080.
- Rounds 2 to 5 (visual): Read changed from inline accordion to a fixed "plain words" box under the three lines (idle state shows the counter code, so no empty area and no layout jump); Run is two columns (versions + code, then Run + results + two task ticks "Break it" / "Fix it"); Ask is a chat (interviewer bubble with code, four option buttons, your graded reply, typing dots, follow-up, "what they are really testing"); Keep has the calendar plus a schedule list that shows dimmed (dashed) before the press and lit with dates after it. When all four are tried the ladder footer swaps Next step for a "Pick a topic" link and the sticker and note say so. Dimmed layers use a dashed border, not opacity (axe contrast).
- Deviations from the plan text, on purpose: (1) the Keep labels are cumulative ("in 10 days", not "in 7 days") because `lib/storage.ts` restarts the gap after every review; the 7, 21, 60 and 180 gaps appear as "review 2, 7 days later" etc., and 91 and 271 days sit off the 35-day calendar in the list; (2) the Read breakdown is a box below the lines rather than directly under each line; (3) no `data-card` on the bench (not scroll-scrubbed), so generic scene tests allow 0 cards for How; (4) "Run tests" is the button name, so the hero e2e is now scoped to the hero.
- Measured (production build, home page, gzip, same script as baseline built from HEAD in a scratch dir): scripts 293,170 B before, 296,377 B now (+3.2 KB); CSS 64,689 to 67,024 B; HTML 35,928 to 36,859 B (the server HTML carries the no-JavaScript final blocks). Architecture chapters updated: browser tests 318 (smoke 188 with 162 flows, a11y 116 with 30 states), smoke chart 4,499 lines, home script row (20 scripts, 906 KB raw, 285 KB gzip, 31 KB HTML, 41 percent).
- Verified in the scratch copy: tsc, eslint (the one old warning), comments, prettier, cspell, 620 unit tests in 38 files, production build, full e2e 318 of 318 after one test fix (smoke 188 after the fix run, a11y 116 with axe clean in nine themes at 1440 and 390 for every How state, whiteboard 6, keyboard 8). Negative control for the text probe and the new fit probe checked by injecting an overflow.
- Looked at: all four panels, before and after states, at 1280x720 dark, 1440x900 light and dark, 1920x1080 dark, 390 dark, 1100x800 light, 820x1100 dark, lavender plus sketch font, typing indicator mid-animation, calendar mid-draw, completion state, no-JavaScript stack at 1440.
- Risks: very short Ask/Run/Keep content relies on the panel zoom (`--k`) tiers keyed to width and height media queries, so unusual aspect ratios between 1300 and 1500 px wide at 800 to 860 px tall have a little spare room; the no-JS HTML is about 0.9 KB gzip larger; the unit-test counts in `arch-testing.ts` (405 tests) were already stale and remain unasserted.

- Follow-up fixes: (1) the section rail's `land()` computed its scroll target once; a layout shift above the target during the Lenis animation (a font swap, say) left the section 36 px low. It now watches the scroll until it is still and, if it arrived where it was sent but the section has since moved, scrolls again (`correctAfterLanding` in `SectionRail.tsx`); new e2e "a rail landing corrects itself when the layout above shifts after the click" fails without the fix and passes with it. (2) The Run code card starts at its top and keeps the height of the 5-line variant, so switching variants does not move anything. Counts now: browser tests 319 (smoke 189, 163 flows), smoke chart 4,519 lines.

## Plan Change Log

## Review Triage Log

## Verification

**Commands:**
- in the scratch copy: `npm run build`, then `npm run check`, then `npm run test:e2e` -- expected: all green

**Manual checks (if no CLI):**
- Use the section like a visitor in a production build: run the failing then the passing variant, answer wrong then right, mark read today, reset; look at every state in dark, light and a handwriting theme at 1280x720, 1440x900, 1920x1080 and 390.

## Auto Run Result

**Summary:** The How it works section is now a live workbench the visitor operates, replacing the loop track. A four-step ladder (tablist with arrows, Home and End, "N of 4 tried", Next step, Reset demo, and the note that nothing is saved) drives one workbench card. Read: three tappable lines with plain-words breakdowns and a layers outline. Run: three real counter functions (shared, closure, off by one) executed in the browser against three tests, with expected and received values on a failure and no eval or `new Function`. Get asked: a graded question with per-option explanations, then the interviewer's follow-up after a typing indicator. Keep: a "Mark as read today" button that lights a calendar and a list built from the real review gaps in `lib/storage.ts` (cumulative dates, since the site restarts the gap after each review). It is not pinned or scroll-driven; without JavaScript all four panels show stacked in their final state; using it writes no storage key. The loop track, the pinned How wiring and the fx kinds only they used were removed.

**Review:** none run; the section was verified by use and by the full gate. A flaky section-rail e2e that failed once under three-worker load (passed alone three of three) was investigated and hardened by the implementer, and a stranded blank band above the code in the Run panel was fixed.

**Verification:** in a clean copy: tsc after a build, eslint (one old warning in `useReadingPlan.ts`), comments, prettier, cspell, 620 unit tests, production build, full e2e 319/319 with axe clean in nine themes at 1440 and 390 for every How state; used the section like a visitor in a production build (failing then passing run, answers, mark read, reset) with `localStorage` unchanged.

**Residual risks:** odd aspect ratios between 1300 and 1500 px wide and 800 to 860 px tall rely on stepped zoom tiers; the unit-test counts in `arch-testing.ts` were already stale and are not asserted.
