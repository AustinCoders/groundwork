---
title: 'Accessibility suite in every theme and on a phone'
type: 'feature'
ticket: '3'
created: '2026-09-30'
status: 'built'
route: 'full'
route_source: 'auto'
review: 'thorough'
review_source: 'auto'
lenses_ran: ['blind-hunter', 'edge-case-hunter', 'verification-gap', 'intent-alignment']
review_loop_iteration: 0
followup_review_recommended: true
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/planning-artifacts/audit-2026-09-28/ux-a11y.md']
warnings: ['oversized']
deferred:
  - summary: >-
      The command palette and shortcut help on /practice and the whiteboard's Page layout popover are never opened under axe.
    evidence: |-
      Unverified. Settle by opening each at 1440 and 390 and running axe in all nine themes; add them as STATES in e2e/a11y.spec.ts if they pass or once fixed.
    location: >-
      e2e/a11y.spec.ts
    severity: medium (unverified)
baseline_revision: '049f7de741f36b1631c0473146b3e7e5caf4cf7d'
---

<intent-contract>

## Intent

**Problem:** `e2e/a11y.spec.ts` runs axe only in the Paper theme at desktop width. It skips several routes and every open panel, and it disables `scrollable-region-focusable`. The other eight themes and phone widths are therefore unchecked. Kraft's grey text is 3.96:1, for example, and nothing catches it (ux-a11y.md A9, A11, §3).

**Approach:**
- Run every axe check in all nine themes at 1440 and at a 390 viewport set inside the spec.
- Add the missing routes and open states.
- Turn the disabled rule back on by making scroll regions focusable and named.
- Fix what fails with theme tokens.
- Extend `tests/contrast.test.ts` to the text tokens.
- Update the How this is built chapters that describe the suite.

## Boundaries & Constraints

**Always:**
- One shared axe helper in the spec with the WCAG 2.0/2.1 A and AA tags, reduced motion, and no `disableRules`.
- Every page and state is checked in all nine themes, from `e2e/themes.ts` `THEMES`, at 1440×900 and 390×844. A failure names the page, the state, the theme and the viewport.
- New pages and states:
  - `/interview/questions`, `/soon?topic=typescript` and an unknown URL, for the 404 page;
  - the site menu open, at both widths;
  - at 390: the open Shell sidebar on `/notes`, the Chapters sheet on `/git/merge` and the Filters sheet on `/problems`;
  - `/review` with a chapter due, seeded in localStorage.
- Scroll regions that axe flags get `tabIndex={0}`, `role="region"` and an `aria-label` that names their content. This covers `.table-scroll` from `components/reader/enhancements.ts`, the progress heatmap, and any others the run finds.
- Contrast is fixed by changing theme tokens in the theme blocks of `app/globals.css`, never with per-page overrides. A role value that changes is recorded in `_bmad-output/specs/spec-groundwork-overhaul/palette.md`, as story 5.5 did.
- `tests/contrast.test.ts` asserts 4.5:1 in every theme for:
  - `--ink`, `--ink-soft` and `--pencil` on `--paper`, `--sheet` and `--sheet-2`;
  - the text roles `--primary`, `--success`, `--danger`, `--caution` and `--info` on `--paper` and `--sheet-2`, as well as the `--sheet` pairs the test already checks.
- `tests/claims.test.ts` computes the a11y spec's test count from its new shape. The chapters restate the suite truthfully: `arch-testing.ts` (the a11y row, the totals and the disabled-rule sentence), `arch-design-system.ts:313-318`, and `arch-health.ts` (the Playwright row and the "written twice" finding).
- No comments. Theme tokens only.

**Never:**
- Do not add a Playwright mobile project; epic-one-system owns that.
- Do not change a page's layout or copy beyond what an axe fix needs.
- Do not touch `e2e/keyboard.spec.ts` behaviour.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Every page, every theme | The 21 current pages plus `/interview/questions`, `/soon?topic=typescript` and a 404, in each of the 9 themes at 1440 and 390 | axe reports no violations, with no rule disabled | The failure lists page, theme, viewport and each violation |
| Open panels | The site menu open at 1440 and 390; the Shell sidebar, Chapters sheet and Filters sheet open at 390 | No violations in any theme | Same |
| Seeded review | `/review` with a chapter due | No violations; the "Review N of 5" label is valid ARIA | Same |
| Mock round | The existing system design round, at both widths | No violations at each checked stage in every theme | Same |
| Scroll regions | A chapter with a wide table; `/progress` heatmap | `scrollable-region-focusable` passes; each region is focusable and named | No error expected |
| Token pairs | `tests/contrast.test.ts` | Every text-token and role pair is at least 4.5:1 in all nine themes | The message names theme, pair and ratio |

</intent-contract>

## Code Map

- `e2e/a11y.spec.ts`:
  - It holds `PAGES` (21 entries), a per-page test and a mock-round test, each with its own AxeBuilder call. Both calls disable `scrollable-region-focusable`.
  - Rewrite it around one helper. Themes are CSS only: `components/ThemeFontPicker.tsx:24` and `lib/themeInitScript.ts:18` only set `data-theme` on `<html>`, and localStorage `jsnotes:theme` holds the choice, as `e2e/smoke.spec.ts:118` seeds it.
  - So one page load can check all nine themes by setting the attribute and the key and then running axe. Reload only where the run shows a page painting theme colours from JS at mount.
  - Set the viewport with `test.use` or `page.setViewportSize` inside the spec.
- `e2e/themes.ts` exports `THEMES`.
- Seeding `/review` with a chapter due:
  - See how `e2e/smoke.spec.ts:921` ("review brings a due chapter back") seeds it.
  - The invalid label is at `app/review/ReviewView.tsx:56`: an `aria-label` on a bare `span`. Make the text visible to assistive tech in a valid way, for example with a role, or with visible and visually hidden text.
- Opening the panels at 390: reuse the locators from `e2e/keyboard.spec.ts`:
  - Menu button `/Menu/`;
  - "Open menu" on `/notes`;
  - "Chapters" on `/git/merge`;
  - "Filters" on `/problems`.
- Scroll regions:
  - `components/reader/enhancements.ts:69-70` wraps tables in `.table-scroll`.
  - `app/progress/ProgressView.tsx:111-120` has `.heatScroll`.
  - Wide `pre` blocks may also flag. Fix each one at its source component.
- Contrast:
  - The known failing pairs are Kraft `--pencil` on `--paper` (3.96:1), Blueprint `--pencil` on the inline-code background (3.96:1), Kraft `--caution` on `--paper` (4.36:1) and Blueprint `--danger` on `--sheet-2` (4.47:1).
  - Change the token values in the theme blocks of `app/globals.css`. Keep each theme's hue: darken or lighten along the same hue.
  - `tests/theme-contract.test.ts` and `tests/contrast.test.ts` must pass.
- `tests/contrast.test.ts:44-80` already pairs roles with `--sheet` and states with `--sheet-2`. Add the text-token and role pairs listed under Always.
- `tests/claims.test.ts:124-127, 178, 183` computes `a11yPages` and `a11yTests` from `PAGES` and the test indentation. Rework it to count the new structure: pages, states, themes and viewports as the spec declares them. Keep the `arch-testing.ts` row and the Browser tests heading asserted.
- Chapters to update:
  - `content/architecture/arch-testing.ts:90, 97` and the heading and subtitle totals;
  - `content/architecture/arch-design-system.ts:313-318`;
  - `content/architecture/arch-health.ts:20, 131`.
- Continuity from story 1.2 (keyboard traps): the open sidebar, the site menu and both sheets use `components/FocusTrap.tsx`. The keyboard spec runs at 390. Its deferred item asks for axe with each panel open, which this story covers.
- `playwright.config.ts` stays as it is. Measure the e2e run time before and after, and record both in the Implementation Notes.

## Tasks & Acceptance

**Execution:**
- [x] `e2e/a11y.spec.ts` -- one axe helper, the nine themes × two widths, the new pages and states, no disabled rule -- the suite
- [x] `components/reader/enhancements.ts`, `app/progress/ProgressView.tsx`, and any other flagged source -- focusable, named scroll regions -- A11
- [x] `app/review/ReviewView.tsx` -- valid ARIA on the review-stage label -- seeded review
- [x] `app/globals.css` theme blocks, `_bmad-output/specs/spec-groundwork-overhaul/palette.md` -- token fixes for every contrast failure found -- A9
- [x] `tests/contrast.test.ts` -- text-token and role pairs on `--paper`, `--sheet` and `--sheet-2` -- guard
- [x] `tests/claims.test.ts`, `content/architecture/arch-testing.ts`, `arch-design-system.ts`, `arch-health.ts` -- counts and descriptions of the suite -- truth

**Acceptance Criteria:**
- Given `npm run build` and `npm run test:e2e`, when the a11y spec runs, then every page and state passes axe in all nine themes at 1440 and 390, with no rule disabled.
- Given `npm run check`, when it runs, then `tests/contrast.test.ts` and `tests/claims.test.ts` pass with the new pairs and counts.
- Given a wide chapter table or the `/progress` heatmap, when a keyboard user tabs, then the region takes focus and a screen reader names it.

## Implementation Notes

- **Run time.** Measured on this machine (10 cores, so Playwright's default of 5 workers), each after a fresh `npm run build`:
  - Before: `npm run test:e2e`, 104 tests, 38.8 s (39.6 s wall).
  - First pass: `npm run test:e2e`, 139 tests, 2.0 min (2 min 3 s wall). The a11y spec alone was 57 tests in 1.6 min at 5 workers and 3 min 20 s at 2 workers, which is about what a 4-core CI runner gets. Its slowest test took 19 s at 2 workers.
  - After the review fixes: the a11y spec is 67 tests in 2.0 min at 5 workers. The keyboard spec is 8 tests in 6 s. The full run was not repeated here; the coordinator runs it.
  - The spec sets a 180 s test timeout inside itself, so `playwright.config.ts` is unchanged.
- **The suite's shape.**
  - `WIDE` (1440×900) and `PHONE` (390×844) make `VIEWPORTS`.
  - `PAGES` holds 26 paths.
  - `STATES` holds 9 states, and each one lists the viewports it runs at. 5 states open with a click; 4 are seeded in `localStorage`.
  - Every test is one page load. `expectNoViolationsInAnyTheme` then writes `jsnotes:theme` and `data-theme` for each of the nine `THEMES` and runs axe each time.
  - The helper collects every violation before it asserts, so one failure lists every theme that broke.
  - That makes 26 × 2 + 15 = 67 tests.
- **No reloads were needed.** Nothing paints theme colours from JavaScript at mount. `app/whiteboard/Board.tsx` reads the CSS variables only when it exports, and `SiteDrawer` watches `data-theme` with a `MutationObserver`.
- **`/soon` cannot be checked today.** Every outline topic is `status: "ready"`, so `SoonClient` redirects to `/level/<id>` (audit U1). The spec checks `/level/typescript`, the page a reader actually lands on, and the chapter says so.
- **Fixed pages for what the mock round only sometimes shows.** The mock round draws its questions at random, so a trap callout (`.warn`) comes up in some runs only.
  - `/notes/basic-async` renders `.warn`, tables and inline code on every run.
  - `/path?topic=typescript&level=beginner` renders planned steps.
- **Scroll regions.** `scrollable-region-focusable` is re-enabled.
  - `components/reader/scrollRegions.ts` finds `pre`, `.table-scroll` and `[data-scroll-region]` elements inside a container.
  - An element counts as scrolling when its `overflow` is `auto` or `scroll` and its content is wider (`scrollWidth > clientWidth`) or taller than its box.
  - While it scrolls, it gets `tabindex="0"`, `role="region"` and an `aria-label`. When it stops, it loses all three. A `ResizeObserver` and `document.fonts.ready` trigger a re-check.
  - A name is the `data-scroll-region` value if set. Otherwise it is `Table:` or `Code:` plus the caption, the `.codelabel`, or the nearest heading before it in its `article` or `main`. A name that repeats within the container gets " (2)", " (3)" and so on.
  - The helper covers:
    - the reader and series chapters (`ReaderShell`, `ChapterView`);
    - the interview book: each question card, and the round's opening and closing prose;
    - the mock room's answer panel, and the mock debrief and readiness tables;
    - the `/progress` heatmap;
    - the playground's test code and SQL results.
  - CodeMirror's `.cm-content` gets `tabindex="0"`, because axe does not count a bare `contenteditable` as focusable content.
  - At 1440, `/notes/setup-mental-model` and `/git/merge` now have no regions. At 390, all 8 and all 13 of their blocks are regions.
- **ARIA and hidden labels.**
  - `aria-prohibited-attr`: the review-stage `span` and the readiness board's `.streakDots` now have `role="img"`, so their labels are valid.
  - `button-name`, `link-name` and `select-name` at 390 on `/mock` (the wizard's stepper) and `/problems` (Random, Playground, Sort): below a breakpoint, the label spans were `display: none`, which removed the controls' accessible names. They are now visually hidden instead, so nothing moves on screen.
- **Contrast.**
  - Fixed with tokens and recorded in `palette.md`:
    - Kraft `--pencil` and `--caution`;
    - Blueprint `--code-inline-bg` alpha and `--pencil`;
    - Forest `--green`;
    - `--red` and `--warn-bg` in Kraft, Sepia, Forest, Lavender and Blueprint.
  - Not fixable with a token: `.syllabus-item.is-planned` (`opacity: 0.82`) and `.step.is-planned` (`opacity: 0.8`) faded pencil text below 4.5:1 in every theme. Both opacities are gone. A dashed left border now marks a planned syllabus item; a planned step already had a dashed border.
  - Axe does not check most reading-page contrast. On reader chapters it reports most text contrast as incomplete, because of pseudo-content (`pseudoContent`). On git and architecture chapters the ruled paper is a background gradient (`bgGradient`). Only `tests/contrast.test.ts` guards those colours, so it now also checks the tinted pairs:
    - `--red` on `--warn-bg` mixed over `--paper` and over `--sheet`, the two surfaces where a probe found `.warn`;
    - `--green` on `--dg-box-green`;
    - `--ink`, `--ink-soft` and `--pencil` on `--code-inline-bg` mixed over all three surfaces;
    - and that each `--warn-bg` is a tint of its theme's own `--red`.
  - `.warn` over `--sheet-2` is not tested: no page renders it there, and Blueprint's red would need to move again to pass.
  - No `--paper` text sits on a `--c-green` or `--c-red` fill. The site never sets `color: var(--paper)`; text on those fills uses `--sheet`. So that pair is not in the test.
- **`tests/claims.test.ts`.**
  - How it counts:
    - It reads `VIEWPORTS` and each viewport's width, then `PAGES`.
    - It splits `STATES` into entries by `name:` and reads each entry's `viewports:`.
    - It fails if the number of entries and the number of opening braces differ, if an entry has no viewport list, or if an entry names a viewport that is not declared.
    - It counts 26 × 2 + 15 = 67 tests, with 5 click states and 4 seeded ones.
  - What it asserts:
    - in `arch-testing.ts`: the a11y row, the Browser tests heading and the subtitle;
    - in `arch-design-system.ts`: the page count, the state sentence, and the themes and widths;
    - in `arch-health.ts`: the Playwright row.
  - It also fails if the spec stops looping over `THEMES` or brings back `disableRules`.
  - The hand-kept unit totals are now 307 tests in 19 files, with 11 in `contrast` and 32 in `claims`.
- **`e2e/keyboard.spec.ts`** still has 8 tests. At 390, the Chapters-sheet test now also checks one table and one code block in `/git/merge`, and one of each in `/interview/r7`. Each must be a region with `tabindex="0"` and its expected name, and must really scroll.

## Plan Change Log

- Beyond the Code Map, the fixes also touched:
  - `app/interview/[chapter]/RoundView.tsx`, `app/mock/Room.tsx`, `app/mock/Scorecard.tsx`, `app/mock/Readiness.tsx`, `components/practice/PracticeWorkspace.tsx`, `components/practice/CodeEditor.tsx`, `components/reader/ReaderShell.tsx` and `components/series/ChapterView.tsx`;
  - `app/mock/mock.module.css`, `app/problems/problems.module.css`, and the `.is-planned` rules in `app/globals.css`.
- The shared scroll-region helper is a new file, `components/reader/scrollRegions.ts`. `enhancements.ts` is back as it was.
- The contrast fixes went past the four known pairs:
  - They also changed Forest `--green`, `--red` in five themes, and Blueprint's inline-code tint.
  - `--green` and `--red` are categorical, so `--c-green` and `--c-red` move with them.
  - Blueprint `--pencil` still had to move. Lowering the inline-code alpha alone cannot reach 4.5:1 over `--sheet-2`, because `--pencil` on bare `--sheet-2` is only 4.60:1.
- `arch-health.ts`:
  - The Playwright row reads "Playwright, 4 specs" and counts every browser test.
  - The Vitest row carries the real unit total.
  - The "written twice" finding is deleted, because the spec now has one helper.
- `/soon?topic=typescript` was replaced by `/level/typescript`.
- Added after review:
  - pages: `/notes/basic-async` and `/path?topic=typescript&level=beginner`;
  - seeded states: a chapter marked read on a path, a year of activity on `/progress`, and two saved mock sessions.

## Review Triage Log

### 2026-09-30 — Review pass
- verdicts: 47 findings — high 0, medium 21, low 19, false 4, maybe-false 3
- findings:
  - `[medium]` `[patch]` Kraft, Sepia and Lavender `--warn-bg` still tint the old reds, and Kraft `.warn` passes only by rounding (4.496:1) — composite entry: warn tints re-derived from the current reds, and reds and greens moved to at least 4.6:1 where the boxes render.
  - `[medium]` `[patch]` tests/contrast.test.ts does not check the composite pairs that drove the token changes (`--red` on `--warn-bg`, Forest `--green` on `--dg-box-green`, `--pencil` on `--code-inline-bg`) — composite entry: pairs added.
  - `[medium]` `[patch]` `.warn` is only exercised when the random mock question has a trap, and CI retries can hide a miss — fixed-page entry: a JS chapter with `.warn`, tables and inline code added to PAGES.
  - `[medium]` `[patch]` `/path` with planned steps is never rendered, so the `.step.is-planned` opacity removal is unguarded — states entry: `/path?topic=typescript&level=beginner` added.
  - `[maybe-false]` `[patch]` `/path` with a chapter read may still fail on the mark-as-read label (roadmap t48) — states entry: a seeded read-chapter state added, which settles it.
  - `[maybe-false]` `[patch]` `/progress` with activity renders coloured heatmap cells that axe never sees — states entry: a seeded activity state added.
  - `[medium]` `[patch]` `/mock` with 2+ sessions (the ReadinessBoard table region) is never rendered under axe — states entry: a seeded history state added.
  - `[maybe-false]` `[defer]` CommandPalette, ShortcutHelp and the whiteboard's Page layout popover are never opened under axe — medium if true (unverified); settle by opening each at both widths and running axe in every theme.
  - `[low]` `[patch]` Blueprint `--pencil` on `--code-inline-bg` over `--sheet-2` is 4.03:1 with no follow-up — composite entry: Blueprint's inline-code tint lowered and the pair tested.
  - `[low]` `[patch]` `/soon?topic=typescript` redirects to `/level/typescript` yet is counted as the /soon page — soon entry: replaced with `/level/typescript` and described truthfully.
  - `[medium]` `[patch]` Every `pre` and table wrapper becomes a tab stop and a landmark even when it does not scroll, with repeated names and a separate RoundView scheme — regions entry: attributes gated on overflow, rechecked on resize and after fonts load, names made unique, RoundView through the helper.
  - `[low]` `[patch]` arch-health.ts's Vitest row still says 166 beside the updated Playwright row — arch-health entry: set to the real total.
  - `[low]` `[patch]` Roadmap t48 is still todo with notes that are now false — ticked at finalize by the coordinator.
  - `[low]` `[patch]` arch-design-system.ts says "6 states that only exist after a click" and "scroll sideways on a phone, so each one takes focus" — docs entry: wording corrected.
  - `[low]` `[reject]` The visually hidden rule is copied three times into two modules — nine lines, harmless; sharing the global class from a module is not a direct correction.
  - `[low]` `[reject]` claims.test.ts guards the spec with plain string checks — they fail loudly on a refactor; evading them with `.exclude()` would be deliberate.
  - `[low]` `[patch]` palette.md lines 8 and 9 overlap, and the text-token claims sit under a table that lists none — palette entry: wording tidied.
  - `[false]` `[reject]` The story plan is untracked, so it is not in the diff — it is committed with the change at finalize.
  - `[medium]` `[patch]` Mock model answers can hold wide `pre` or tables with no region treatment (Room.tsx ~298) — other-regions entry: through the helper.
  - `[medium]` `[patch]` The playground's test code `pre` and SQL result scroller get no region treatment — other-regions entry: through the helper.
  - `[medium]` `[patch]` Regions on every block, not only overflowing ones — same regions entry.
  - `[low]` `[patch]` Several blocks under one heading share one region name — same regions entry.
  - `[low]` `[patch]` RoundView names several unlabelled blocks in one question identically — same regions entry.
  - `[medium]` `[patch]` Composite text pairs untested (Kraft `.warn` 4.09:1 on `--sheet-2`) — same composite entry.
  - `[medium]` `[patch]` `--warn-bg` still tints the old red — same composite entry.
  - `[low]` `[patch]` claims.test.ts misses a state whose viewports are written another way — claims entry: states counted from their `name:` entries and viewport lists.
  - `[low]` `[patch]` arch-health.ts Vitest row stale — same arch-health entry.
  - `[medium]` `[patch]` The chapter claims every wide table and code block takes focus, but mock and playground ones do not — same other-regions entry.
  - `[false]` `[reject]` The sidebar, Chapters sheet and Filters sheet states never run at 1440 — those panels are narrow-screen UI; at 1440 the sidebar is static and the sheets' triggers are replaced by the desktop rail and filter column, as the plan's matrix states.
  - `[low]` `[patch]` Forest `--green` moved further than the nearest passing value, against palette.md's wording — same palette entry.
  - `[medium]` `[patch]` Regression gap: `/path` planned steps never checked (pre-verified) — same states entry.
  - `[medium]` `[patch]` Regression gap: the ReadinessBoard table region never renders under axe (pre-verified) — same states entry.
  - `[medium]` `[patch]` Missing adoption: Readiness `.streakDots` has an `aria-label` with no role (aria-prohibited-attr, WCAG A) (pre-verified) — `role="img"` added.
  - `[medium]` `[patch]` Regression gap: nothing asserts a scroll region's name (pre-verified) — keyboard spec asserts a code and a table region by role and name at 390.
  - `[medium]` `[patch]` axe returns `incomplete` for most reading-page text contrast over the ruled paper, while the chapter implies axe checks it — docs entry: the limit named, and the token and composite unit pairs cited as the guard.
  - `[medium]` `[patch]` The red fixes rest on one random mock screen — same fixed-page entry.
  - `[low]` `[reject]` Counts such as 234, 90 and 54 checks and the unit totals are not asserted — correct today; asserting Vitest totals needs a test-file parser, not a direct correction.
  - `[medium]` `[patch]` Tab stops on non-overflowing blocks and repeated names — same regions entry.
  - `[low]` `[patch]` Blueprint's 4.03:1 pair is recorded but may never render — same composite entry.
  - `[false]` `[reject]` "On a phone" is a 390 viewport without touch emulation — the intent's parenthetical leaves the mobile project with epic 4, and the touch rules only change tooltips and a resize handle.
  - `[low]` `[patch]` `/soon?topic=typescript` checks the level page — same soon entry.
  - `[false]` `[reject]` The diff adds states beyond "an open menu" — they come from the plan and audit §3, and only add coverage.
  - `[medium]` `[patch]` Regions everywhere, names unchecked, Readiness unreached — same regions and states entries.
  - `[low]` `[patch]` Categorical `--red`/`--green` changes and `--warn-bg` left on the old red — same composite entry; the opacity removals are necessary because opacity cannot be fixed with a token.
  - `[medium]` `[patch]` Composite and categorical text pairs are guarded only by e2e — same composite entry.
  - `[low]` `[patch]` arch-health's "latest CI run" header over local numbers, and the seeded-state sentence — same arch-health and docs entries; the numbers become the CI result on main's next run.
  - `[low]` `[reject]` CI time is measured locally, not in CI — 3 min 20 s at 2 workers for the a11y spec; CI has no job timeout, and the first CI run after push shows the real time.

## Design Notes

Checking themes by switching the attribute in place keeps the suite at one page load per page, state and width, rather than nine. That matters because the run is about 26 pages and states × 2 widths × 9 themes, roughly 470 axe runs.

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: pass.
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build && PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run test:e2e` -- expected: all pass, and the a11y spec covers nine themes at both widths. e2e serves on 3100; never touch 3000.

## Auto Run Result

**Summary:** `e2e/a11y.spec.ts` runs axe on 26 pages and 9 states in all nine themes at 1440×900 and 390×844, with no rule disabled. That is 67 tests, one page load each, with the theme switched in place.
- The 9 states are the site menu, the sidebar and the two sheets open, a chapter due, a read chapter, a year of activity, and saved mock sessions.
- `scrollable-region-focusable` is back on. Code blocks and table wrappers take `tabindex`, `role="region"` and a unique name only while they scroll, through `components/reader/scrollRegions.ts`.
- Contrast failures are fixed with theme tokens and recorded in `palette.md`, and `tests/contrast.test.ts` now guards the text tokens, the text roles and the text on the tinted boxes on every surface.

**Files changed:**
- `e2e/a11y.spec.ts`: one helper, nine themes × two widths, the new pages and seeded states.
- `e2e/keyboard.spec.ts`: region names asserted at 390 (still 8 tests).
- `components/reader/scrollRegions.ts` (new): overflow-gated, uniquely named scroll regions.
- `ReaderShell.tsx`, `ChapterView.tsx`, `RoundView.tsx`, `Room.tsx`, `Scorecard.tsx`, `Readiness.tsx`, `ProgressView.tsx` and `PracticeWorkspace.tsx`: use the helper.
- `CodeEditor.tsx`: `.cm-content` is focusable.
- `ReviewView.tsx`, `Readiness.tsx`: `role="img"` on labelled dot rows.
- `mock.module.css`, `problems.module.css`: visually hidden labels at 390 instead of `display:none`.
- `app/globals.css`: the reds and `--warn-bg` tints in five themes; Kraft `--pencil` and `--caution`; Blueprint `--pencil` and inline-code tint; Forest `--green`; planned items no longer faded by opacity.
- `tests/contrast.test.ts`, `tests/claims.test.ts`: the new pairs and structure-derived counts.
- `arch-testing.ts`, `arch-design-system.ts`, `arch-health.ts`: the suite, the axe `incomplete` limit, and 307 unit and 149 browser tests.
- `_bmad-output/specs/spec-groundwork-overhaul/palette.md`: every changed value with its ratios.
- `docs/roadmap.html`: t48 done (artifact version 10).

**Review findings:** 47 findings (medium 21, low 19, false 4, maybe-false 3).
- Twelve entries were patched:
  - composite contrast;
  - a fixed `.warn` page;
  - missing states;
  - overflow-gated and uniquely named regions;
  - other scroll containers;
  - streak dots ARIA;
  - region names asserted;
  - the `/soon` redirect;
  - the arch-health numbers;
  - the chapter wording and the axe limit;
  - the claims state count;
  - the palette wording.
- The coordinator ticked the roadmap.
- One item is deferred (frontmatter `deferred`): the practice and whiteboard popovers under axe.
- Rejected, with reasons, in the Review Triage Log:
  - the visually hidden rule duplicated;
  - claims string checks;
  - unasserted hand counts;
  - CI time measured locally;
  - four findings that proved false.

**Follow-up review:** recommended (`true`). Nine medium entries were patched. The patch round's new code has not been reviewed: the overflow gating in `scrollRegions.ts` (ResizeObserver and the fonts-ready re-check, removal when content fits) and the five re-derived theme reds and `--warn-bg` tints.

**Verification:** after the patches, `npm run check` passes (typecheck, lint, comments, prettier, cspell, and vitest with 19 files and 307 tests). `npm run build` passes, and `npm run test:e2e` passes 149/149 in 2.4 min on port 3100. The a11y spec alone is 67 tests, 2.0 min at 5 workers locally.

**Residual risks:**
- CI time is measured only locally. The a11y spec took 3 min 20 s at 2 workers before the patches and has grown since. CI has no job timeout, and the spec sets a 180 s test timeout.
- axe reports most reading-page text contrast as `incomplete` over the ruled paper, so those colours rely on the token pairs in `tests/contrast.test.ts`.
- `/soon` cannot be checked until a topic is not ready.
- `arch-tech-stack.ts` still says "15 test files" (19 exist). This was deferred to story 4 in 5.4's plan.
