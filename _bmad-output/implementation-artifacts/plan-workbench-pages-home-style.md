---
title: 'The practice workbench pages in the home language: playground, exercise pages and the problems list'
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
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/implementation-artifacts/plan-topic-pages-home-style.md', '{project-root}/_bmad-output/implementation-artifacts/plan-chapter-pages-home-style.md', '{project-root}/_bmad-output/implementation-artifacts/plan-interview-and-architecture-home-style.md']
warnings: ['oversized']
deferred: []
baseline_revision: '1ec0834'
---

<intent-contract>

## Intent

**Problem:** Home, the menu, topic pages, chapters, the interview book and the architecture section are one family now. The practice surfaces are still the old site: the playground (`/practice`), the exercise pages (`/problems/[slug]`: description panel, editor, console, tests) and the problems list (`/problems`). The owner asked to redesign the rest of the site and approved doing the playground and problems side first.

**Approach:** Bring these three pages into the same language without hurting the workbench: they are tools, so the editor area keeps its full-viewport, no-page-scroll layout (the fill layout already in `app/globals.css`, the `.bare-main:has(...)` blocks near the end) and gets the family's chrome, type, surfaces, buttons, chips, stickers and tape in the places that suit a tool. The problems list becomes a home-style scene page (one-screen hero, then a trail or flat rows of problems grouped by topic and level with honest counts), reusing `TopicKit`, `Journey`, `MenuKit` and the home pieces.

## Scope

1. Playground: top bar (back, Menu pill, title, language picker, Live, Share, Examples, Run, Debug), file tabs, editor frame and status bar, the console and its tabs (Console, Problems, History, Input), the empty state, the file and share dialogs, the command palette and shortcut help: all in the family's tokens and type scale.
2. Exercise pages: the left description panel (tabs Description, Tests, Hints, breadcrumbs, title, level chip, test count), the top bar (prev, next, Run, Debug, Submit, sound, keyboard), the test results and the "all tests passed" moment (a home-style stamp or sticker, not confetti-only), the hints reveal.
3. Problems list `/problems`: one-screen hero, filters (topic, level, status, search), grouped problems as flat dashed rows or a trail with the solved tick, the level chip and the test count; sticky filters that stay usable at 390; honest empty state.
4. Shared bits these use: `components/practice/*`, `TopIcon`, `PracticeWorkspace`, `CodeEditor` chrome (not the CodeMirror theme colours unless a token mismatch shows), `components/practice/CommandPalette`, `ShortcutHelp`, `FileDialogs`.
Not in scope: mock interview, whiteboard, review, progress (next round), the chapter reader, the menu.

## Boundaries & Constraints

**Always:**
- Start from fresh screenshots of the three pages at 1440x900 and 390 and compare with home, a topic page and a chapter; reuse the kits and tokens; anything two surfaces share goes in the shared place.
- The tool keeps working exactly: running code in every language, debugging, tests and hints, live preview, share links, examples, file tabs and templates, keyboard shortcuts and command palette, the code store and resume, vim mode, status bar, fullscreen, resizing of the panels where it exists. Every e2e role and name stays or is updated in the same change.
- Full-viewport fill stays at all sizes (the playground at every width, exercise pages from 1001px up with natural scroll below), no page scroll on desktop, no blank bands, no second scrollbar surprises.
- Typography: the `--t-*` scale on `:root`; weights 400 and 700; nothing under 12px in chrome except the dense editor status bar and gutter (keep at least 11px there if needed, and say so in the notes); headings in `--font-heading`, prose in `--font-body`, code in `--font-code` or mono; eight handwriting styles and nine themes must hold.
- Spacing and polish rules learned from earlier rounds: balanced space under the header, text uses the full width of its panel, nothing part-transparent at any scroll position, no state transition that shows two states at once, no one-frame flash before hydration, no `data-fx` scroll reveals on these pages, reduced-motion safe.
- The editor theme colours stay token-driven (`--ide-*`), contrast tests stay green in all nine themes.
- Responsive: playground works 320 to 2560; exercise pages stack below 1001px with the description first, tap targets 44px on phones.

**Never:** comments in source (`npm run comments` fails them); hex, white or literal colours (theme tokens only); hard offset shadows; edits to `.claude/skills/` or `_bmad/`; touching port 3000 or any broad `pkill`; committing, pushing or staging (the coordinator does that).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Playground, first visit | `/practice` | Family chrome, editor fills the viewport, console empty state in the home voice | none |
| Run with output / error | JS, Python, SQL, HTML | Console lines, problems tab count, status bar update as today | errors shown in the console and Problems |
| Exercise page | Any exercise, desktop | Description panel, editor, console, test results all family-styled, no page scroll | none |
| All tests pass | Submit or run | A clear success moment in the home language, progress saved, no overlap | none |
| Problems list | `/problems`, filters, search, 390 wide | One-screen hero, filters usable, rows with ticks, no horizontal scroll | empty state with a clear-filters action |
| Fonts and themes | 8 styles x 9 themes | No clipping or overlap; axe passes; editor contrast tests pass | none |
| Reduced motion, no JS | Preference or no JS | Everything visible; list pages readable without JS | none |

</intent-contract>

## Code Map

- `app/practice/*`, `components/practice/*` (PracticeWorkspace, CodeEditor, CommandPalette, ShortcutHelp, FileDialogs, TopIcon, EditorSkeleton, DebugPanel, BackButton) -- playground and exercise workbench
- `app/problems/ProblemsView.tsx`, `problems.module.css`, `app/problems/[slug]/page.tsx` -- list and exercise route
- `app/globals.css` -- `.lc-*`, `.pg-*`, `.practice-layout`, `.brief`, `.ed*`, `.panel*` rules and the appended fill blocks at the end; keep or replace them in place, no dead rules left behind
- `components/ui/MenuKit.tsx`, `components/topic/TopicKit.tsx`, `Journey.tsx`, `components/chapter/ChapterKit.tsx`, `components/home/*` -- the language to reuse
- `e2e/smoke.spec.ts`, `e2e/a11y.spec.ts`, `tests/*`, `content/architecture/*` -- tests and chapters whose asserted numbers change

## Tasks & Acceptance

- Given the playground, an exercise page and `/problems` at 320 (where it applies), 390, 1440 and 1920, then each is visibly the same family as home and the chapter pages and the workbench still fills the viewport with no page scroll on desktop.
- Given running code, a failing and a passing test run, a hint reveal, a share and a file operation, then everything works as before (the existing e2e covers it; extend where chrome changed).
- Given eight handwriting styles and nine themes, then nothing is clipped or overlapped, axe passes in all nine themes at 1440 and 390 on the states the e2e opens (add `/problems` states if missing), and the editor contrast tests pass.
- Given `npm run check`, `npm run build` and the full e2e in a clean copy, then all pass; architecture chapter numbers asserted by `tests/claims.test.ts` are updated.

## Implementation Notes

(agent: log progress here, newest last)

**Round 1 (build)**
- Shared header: `components/frame/FrameHeader.tsx` is the chapter-page header (back pill, labelled Menu pill, G brand, title, links, actions) taken out of `PageFrame`. The workbench uses it with `tool="playground" | "exercise"`: the back pill shrinks to an icon (the label returns from 1700px), no brand name, the row wraps below 1000px (below 1200px for the playground, whose language picker then takes its own row) and is no longer sticky there, so one header serves every page.
- New `components/practice/workbench.module.css` holds the page shell and the new pieces: a paper page, the fill layout (the playground at every width, an exercise from 1001px up, natural scroll below, and the mock room keeps its inline layout), one `--pad` gap (`clamp(14px, 1.8vw, 28px)`) under the header, at the sides and at the bottom, the header pieces (pill buttons, language picker, exercise nav, level and solved chips), the description panel (mono breadcrumb, title in the heading font with the hand underline, chips, a "Stuck on the idea? Read the chapter" foot pinned to the bottom so a tall window is not blank), taped sticky hints, the console empty states in the home voice with a "ready" sticker, and the verdict: a dashed red count when tests fail, and a rubber "solved" stamp (rotates in with transform only, never opacity) beside the words and a pill to the next problem when they pass. `PracticeWorkspace` is rewired to it (`data-verdict="pass|fail"` replaces `.verdict--*`). The output panel and the description panel are focusable scroll regions.
- `app/globals.css` lost about 1,100 lines (the old `.lc-*`, `.pg-*`, `.practice-layout*`, `.brief*`, `.hint`, `.workbench`, `.resize-handle*`, `.bare-main*`, `.verdict*`, `.live-btn`, the old global problems-list `.prob*` and `.tag--done` rules, and the `ws-drop`, `ws-rise`, `ws-fade` keyframes). The editor window, status bar, settings, palette, debug panel, output tabs, tests and SQL rows, dialogs and shortcut help keep their global classes and are restyled in place: type on the `--t-*` scale (nothing under 12px anywhere in the chrome, including the status bar; the one new token is `--t-panel` for the description title), 16px radii, pill tabs with mono count chips, `--scrim` backdrops, no glow, and white and hex gone from `.page-preview`, `.preview-panel__host` and `.preview-frame` (the `Canvas` system colour). Editor-bar and output-tab buttons are one specificity step higher so the mock room's `.page .btn` rule can no longer squeeze their icons to nothing.
- `Modal.module.css` (shared by the file dialogs and the whiteboard) moves to the same scale: heading title, 12px-radius pill buttons, 20px card.
- Found and fixed on the way: the data-tip tooltips of the old header pushed the exercise page 92px wider than a 390 screen on hover-capable emulation (tooltips are now off under 721px and on touch); entry animations that faded the top bar and panels from transparent are gone; the console error line inside the editor (`.cm-inline-result--error`) failed contrast in seven themes (it is now ink on `--danger-soft` with a danger edge); `/practice` rendered a blank page until JavaScript arrived (the Suspense fallback is now the same playground shell with the editor skeleton); the test code boxes in the Tests tab carried the global tape decoration; a component exercise squeezed the editor to 190px because its preview panel took the same 34 percent as the console.
- Problems list: `ProblemsView` is rebuilt on `PageFrame`, `TopicKit` and the home stage kit: a one-screen hero measured like the topic pages (kicker with honest counts from the data, "Pick a problem, make the tests pass", jump and random actions, level chips, a taped up-next card, a numbers card, a yellow progress card, a hand note and a sticker), then "01 Find one" with the search pill, three toggle groups inside the `Filters` aside (topic, difficulty, status, each with counts), a sticky bar under the header (count, sort, layout, collapse all; at 900px and below a Filters button opens the sheet, which also holds sort and layout), the problems as flat dashed rows grouped by pattern under numbered disclosure heads (solved tick, level chip, test count, "Read the chapter first"), and an honest empty state with Clear filters. The `content-visibility` per group is kept (`auto 52px`). Everything that depends on saved progress is hidden until hydration, and an e2e samples every frame for the wrong label.
- Tests: new `e2e/workbench.spec.ts` (14 tests: room on every side and no page scroll at five sizes, stacking below 1001px, no sideways scroll at 390 and 320 and 44px controls, the stamp and no overlap, hints, console voice, hero and sticky bar, stage cards never covering each other, ticks, no wrong state before hydration, the Filters sheet, the empty state, no JavaScript, the mock room's editor icons); `e2e/smoke.spec.ts` (`data-verdict` selectors, the playground header bound, `/problems` joins the measured-hero test); `e2e/a11y.spec.ts` (five new states: problems with a topic and level, problems with no match, the playground after a run that threw and with the debugger open, the new file dialog, an exercise with a hint, failing tests and every test passing); `tests/topic-type.test.ts` covers the workbench and problems modules and the new components; `tests/theme-roles.test.ts` drops the old problems selectors. Architecture chapters: line counts and the chart, 42 CSS modules, 85 client files, 45 states and 157 axe tests, 7 specs and 410 browser tests, 757 unit tests, the design-system chapter's frames paragraph and a "workbench pages" section, the performance chapter's problems-page numbers, the playground chapter, the repo map.

**Gates (clean scratch copy, final code)**
- `npm run build` ok; `npm run check` ok (757 unit tests in 43 files, the one old lint warning in `useReadingPlan.ts`, comments, format and spelling clean); full e2e 420 of 420 with no retries in 10.7 minutes, including `workbench.spec.ts` (14), the five new axe states in all nine themes at 1440 and 390, and the hero measure for `/problems` at five desktop sizes. An earlier full run failed three of the new a11y states (the inline error contrast in seven themes, and an unfocusable scroll region in the output panel); both are fixed.
- Reviewed by eye: the playground (empty, run, error with the inline result, debugger open, history, input, HTML preview, SQL table, new file dialog, command palette) at 1440 Classic light, 1440 Marker Night, 390 Marker lavender, 320 and 1920 Classic, Script mono, Reading sepia 390; an exercise (description, tests, hints, failing and passing with the stamp, component preview) at 1440 and 1920 Classic light, Marker Night, Chalk lavender, Reading blueprint, Sketch kraft, 390 Chalk Night and Reading sepia, 320; the problems list (hero, filtered, one-list view, empty search, Filters sheet, group heads) at 1440 Classic light, Marker Night, Chalk lavender, Pen rose, 1920, 390 Classic and Roboto forest, 320; the mock room's coding step at 1440.
- Not checked by eye: 2560 wide (measured by the e2e only), print, themes sepia, forest, rose and mono on the exercise and playground pages, Script and Pen on the playground. The Sketch font renders code very small (the code face follows the handwriting body font; unchanged and out of scope).

## Plan Change Log

## Review Triage Log

## Verification

**Commands:**
- in a clean scratch copy: `npm run build`, then `npm run check`, then `npx playwright test --workers=3 --retries=0` -- expected: all green (a known home rail landing test can flake under load; rerun it alone before reporting a failure)

**Manual checks:**
- Own screenshots over several rounds at 390, 1440 and 1920 of the playground (empty, with output, with an error, debug open), an exercise page (before and after passing), the problems list (top, filtered, empty); Classic, Marker, Chalk, Reading, Roboto; light, Night, lavender, blueprint; next to home and a chapter page to judge one family.

## Auto Run Result

Built. Independent check in a clean copy on the final code: `npm run build` ok; `npm run check` 757 unit tests in 43 files (one pre-existing lint warning in `components/topic/useReadingPlan.ts`); full e2e 420 of 420 with no retries. The playground, the exercise pages and the problems list were rebuilt in the home language on the shared kits (`FrameHeader`, `workbench.module.css`, a home-style problems list with a one-screen hero and a Filters sheet on phones); about 1,100 lines of dead rules were removed from `app/globals.css`. Screenshots reviewed by the coordinator at 1440x900, Classic light: the playground (empty), an exercise page (description, editor, console) and the problems list hero. Not verified by eye: Night and other themes and fonts on these pages, 2560 wide, print, the passing "solved" stamp and the failing state, the Filters sheet on a phone.
