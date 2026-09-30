---
title: 'Nine-theme review and sweep'
type: 'chore'
ticket: '5'
created: '2026-09-30'
status: 'built'
baseline_revision: '4c55b1a909817a3985cdfce5060e3799dc7b7316'
route: 'full'
route_source: 'auto'
review: 'thorough'
review_source: 'auto'
lenses_ran: ['blind-hunter', 'edge-case-hunter', 'verification-gap', 'intent-alignment']
review_loop_iteration: 0
followup_review_recommended: true
context: ['{project-root}/_bmad-output/specs/spec-groundwork-overhaul/palette.md', '{project-root}/AGENTS.md']
warnings: []
deferred:
  - summary: >-
      --pencil still misses 4.5:1 on some backgrounds in some themes. In Kraft it is 3.96:1 on --paper, and in Blueprint 3.96:1 on the inline-code background. Kraft --caution on --paper is 4.36:1.
    evidence: |-
      The sweep fixed only the two places axe flagged (.planHead .eyebrow and .level__list code), by moving them to --ink-soft. The token pairs themselves still fail, and 103 rules use --pencil. The roadmap's t48 already names "Kraft grey text is 3.96:1". Owned by epic-audit-fixes entry 3, which runs axe in every theme.
    location: >-
      app/globals.css (the kraft and blueprint blocks, --pencil)
    severity: medium
  - summary: >-
      In the practice workspace, state and faint text on hovered or focused rows (--ide-hover, a 12% ink mix) falls below AA. Blueprint --danger is about 3.3–3.7:1 there, and --pencil is 3.34:1 in Blueprint and 3.69:1 in Kraft.
    evidence: |-
      tests/contrast.test.ts checks the states on the resting --sheet-2 only. Blueprint's new --danger #ff907b clears that by 0.001. Before this epic, --ide-red was the same colour, so this predates the change.
    location: >-
      app/globals.css (.ed__problems, .problem rows)
    severity: medium
  - summary: >-
      On /review with chapters due, the "Review N of 5" spans carry an aria-label with no role, which axe reports as aria-prohibited-attr (WCAG A).
    evidence: |-
      Found by the sweep's axe run with seeded progress, in every theme. e2e/a11y.spec.ts loads /review with no progress, so it never renders these spans.
    location: >-
      app/review (span.stage[aria-label])
    severity: medium
  - summary: >-
      An old-format read mark shows on /review as "20723 days overdue".
    evidence: |-
      Seen in the seeded /review sweep. A read mark stored without a date is treated as day zero.
    location: >-
      app/review
    severity: low
  - summary: >-
      The "Start here" button on /notes has underlined text.
    evidence: |-
      Seen in the sweep. It looks the same on main before this epic: the global a rule's underline shows through a .btn link.
    location: >-
      app/globals.css (.btn as a link)
    severity: low
  - summary: >-
      The sweep's axe-in-every-theme loop should become a committed e2e spec.
    evidence: |-
      The sweep ran axe on 14 pages in all nine themes from a scratch script. The committed a11y spec runs Paper only. This is the roadmap's t48, owned by epic-audit-fixes entry 3.
    location: >-
      e2e/a11y.spec.ts
    severity: low
---

<intent-contract>

## Intent

**Problem:** Entries 1–4 and 6 moved every section onto the theme roles and locked it with tests, but no one has yet looked at every section in every theme. Three known leftovers read wrong:
- Blueprint's `--danger` is 4.47:1 on the editor background.
- The editor bar's selected option hides its check mark and focus ring.
- "How this is built" states stale CSS sizes.

**Approach:**
- Screenshot every section in all nine themes, fix what reads wrong, and fix the three known leftovers.
- Guard the stale numbers and state contrast with tests.
- Record the remaining categorical uses of green and red.
- Tick the roadmap.

## Boundaries & Constraints

**Always:**
- Fixes follow the role rules in palette.md and the conventions of entries 2–4:
  - text on a `-soft` tint is `--ink`;
  - text on a `--primary` fill is `--on-primary`;
  - links keep a non-colour cue.
- A palette value may change only to reach 4.5:1. Choose the nearest value that passes, and record it in palette.md with the reason.
- Run your own servers on port 3200 (e2e uses 3100). Never touch port 3000.
- Screenshots and scripts live in the scratchpad and are not committed.
- No comments. Tokens only.

**Never:**
- Do not redesign a page, change layout or motion, or change a categorical decision from entries 2–4 unless a screenshot shows it reads wrong. If one does, record why.
- Do not weaken a test or remove an allowed-list entry to make a check pass.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| State text on the editor background | Every theme, `--success`, `--danger`, `--caution` and `--info` against `--sheet-2` | At least 4.5:1, asserted in `tests/contrast.test.ts` and naming the theme and token | Vitest failure |
| Editor-bar selected option | The practice editor's language dropdown open, the current option selected and focused | The check mark and the focus ring are visible on the `--primary` fill | No error expected |
| Stated CSS sizes | "How this is built" says how long `app/globals.css` is and how many CSS modules exist | The numbers equal the tree's, asserted in `tests/claims.test.ts` | Vitest failure |

</intent-contract>

## Code Map

- **The sweep:**
  - Scratchpad script. Run `npm run build`, then serve on 3200 with `npx next start -p 3200`.
  - Use Playwright (Chromium, 1280×900, reduced motion, `jsnotes:theme` in localStorage) to take a viewport shot of 14 pages in each of the 9 themes (`THEME_ITEMS` order): `/`, `/review`, `/progress`, `/interview`, `/mock`, `/problems`, `/problems/ex-two-sum`, `/whiteboard`, `/git`, `/git/merge`, `/architecture`, `/notes`, `/notes/closures` and `/level/js`.
  - Build one 3×3 contact sheet per page with `uv run --with pillow`, labelled by theme.
  - Review each sheet. List every finding in Implementation Notes as page, theme and what reads wrong.
  - Fix each finding in the file that owns the rule, re-shoot the sheets it touched, and stop the server.
- `app/globals.css:6249-6272`:
  - `.ed__bar .dd__opt[aria-selected="true"]` is a solid `--primary` fill, while `.ed__bar .dd__opt-check` and `.ed__bar .dd__opt:focus-visible` are also `--primary`, so both vanish on the selected row.
  - On the selected row, the check becomes `inherit` (it takes the row's `--on-primary`) and the focus outline becomes `--on-primary`.
- `app/globals.css`, the Blueprint block (`[data-theme="blueprint"]`):
  - `--danger` `#ff8f7a` is 4.47:1 on `--sheet-2` `#204569`. Pick the nearest lighter value that reaches 4.5:1 on both `--sheet` and `--sheet-2`.
  - Check every theme's four states on `--sheet-2` the same way, and adjust any other failure the same way.
  - Update `_bmad-output/specs/spec-groundwork-overhaul/palette.md`'s table and add a dated note.
- `tests/contrast.test.ts`:
  - Add the four states against `--sheet-2` at 4.5:1 to the role describe. Reuse `blocks()`, `declaration()` and `contrast()`.
  - Update the counts the design-system chapter states for these checks.
- **"How this is built":**
  - `content/architecture/arch-design-system.ts:258` says `globals.css` is 9,608 lines (it is 9,612 before this change) and "Seven CSS modules" (16 exist).
  - `content/architecture/arch-health.ts:68,88,105` says 9,319 in the aria-label, the bar label and the prose. Keep the bar's drawn length proportional if the chart scales by lines.
  - `content/architecture/arch-tech-stack.ts:24` says 9,319 lines and "7 CSS modules".
  - Set every one to the final numbers after all fixes.
  - `tests/claims.test.ts`: add cases that compute the `globals.css` line count and the `*.module.css` count from the tree, and assert each chapter's wording.
- **Categorical record:** run `rg -n "var\(--(green|red|c-green|c-red|hl-yellow|hl-mint)\)" app components` and list the hits in Implementation Notes, grouped by file and selector. Confirm each one sits in a `tests/theme-roles.test.ts` allowed list or a theme or shared token block.
- **`docs/roadmap.html`:** this is the prettier copy of the roadmap artifact.
  - In the `roadmap-data` JSON, add a `p-audit` task:
    - title "A colour palette per theme, on every page";
    - area Design;
    - source "User request 28 Sep";
    - effort "3 days";
    - status done, `doneOn` "2026-09-30";
    - a one-line why.
  - Add a note to `t48` saying the roles fixed the Kraft and Forest buttons and the "Lean no" stamp, and that axe in every theme is still open.
  - Run `npx prettier --write docs/roadmap.html`. The coordinator republishes the artifact from this file.

## Tasks & Acceptance

**Execution:**
- [x] Scratchpad sweep script and contact sheets -- 14 pages × 9 themes, reviewed, findings recorded -- the Done-when screenshots
- [x] The files that own each finding -- fix what reads wrong, then re-shoot -- nothing reads wrong in any theme
- [x] `app/globals.css` -- the editor-bar selected option, and Blueprint's `--danger` plus any other state that fails on `--sheet-2` -- the known leftovers
- [x] `e2e/smoke.spec.ts` -- in Lavender, on `/practice`, open the language dropdown in the editor bar. Assert the selected option's check mark `color` equals `themeColour("lavender", "--on-primary")`, and that the focused selected option's `outline-color` does too -- the matrix row for the selected option (changed; see the Plan Change Log)
- [x] `tests/contrast.test.ts`, `_bmad-output/specs/spec-groundwork-overhaul/palette.md` -- the state pairs on `--sheet-2`, and the changed values recorded -- state text stays readable in the workspace
- [x] `content/architecture/arch-design-system.ts`, `arch-health.ts`, `arch-tech-stack.ts`, `tests/claims.test.ts` -- the true numbers, asserted -- How this is built stays true
- [x] `docs/roadmap.html` -- the palette task added and ticked, and the t48 note -- the roadmap reflects the epic

**Acceptance Criteria:**
- Given the 14 contact sheets in all nine themes, when they are reviewed after the fixes, then every primary button, text link, progress fill and active item shows that theme's accent, no action is still a fixed green or red, and no text visibly fails to read.
- Given `rg -n "var\(--(green|red|c-green|c-red|hl-yellow|hl-mint)\)" app components`, when it runs, then every hit is a categorical use recorded in Implementation Notes and covered by an allowed list or a token block.
- Given `npm run check`, `npm run build` and `npm run test:e2e`, when they run, then all pass, a11y included.

## Implementation Notes

- 2026-09-30: a subagent implemented this from the plan and wrote these notes. The coordinator's review sent it back once; the notes describe the state after that round.
- **What the sweep covered.** Screenshots and scripts stayed in the session scratchpad and are not committed. Every shot is Chromium at 1280×900 with reduced motion and the theme set in `jsnotes:theme`, in all nine themes in `THEME_ITEMS` order.
  - First screen only, one labelled 3×3 contact sheet per page, before and after the fixes: the plan's 14 pages, plus `/interview/questions`, `/path?topic=js&level=beginner` and `/practice` (the playground). That is 17 pages.
  - First screen again with seeded progress (read and due chapters, solved exercises, an activity streak), so fills, done states and due rows show: `/`, `/review`, `/progress`, `/problems`, `/problems/ex-two-sum`, `/git`, `/git/merge`, `/notes` and `/level/js`.
  - Full length, in bands: `/`, `/mock` and `/interview` empty, and `/progress` seeded.
  - The editor bar's language dropdown, opened with the keyboard on `/practice?id=ex-two-sum`, with its computed colours recorded in every theme.
  - Axe, with the e2e tags and disabled rule, on all 17 pages in every theme, both empty and seeded. Also on the mock lobby's three tabs. Axe checks the whole page, not only the first screen.
  - Nothing else below the first screen was reviewed by eye.
- **Findings** (page, theme, what reads wrong):
  - `/mock`, Kraft: the "start here" eyebrow above "What do you want to practise?" is `--pencil` on `--paper`, 3.95:1. Axe found it on all three lobby tabs.
    - Fixed in `app/mock/mock.module.css`: `.planHead .eyebrow` is `--ink-soft`, the same fix `.nextUp .eyebrow` already uses.
    - `tests/contrast.test.ts` now checks `--ink-soft` on `--paper` in every theme; the lowest is Kraft at 5.24:1.
    - `e2e/smoke.spec.ts` checks the eyebrow's colour in every theme.
  - `/level/js`, Blueprint: the inline `<code>this</code>` in the level cards' lists is `--pencil` on `--code-inline-bg` over the sheet, 3.94:1 (axe).
    - Fixed in `app/globals.css`: `.level__list code` is `--ink-soft`, at least 5.46:1 in every theme.
    - `e2e/smoke.spec.ts` checks its colour in every theme.
  - `/path?topic=js&level=beginner` with a read chapter (seeded), in Kraft, Blueprint, Forest and Rose: the "mark as read" label in a done step is `--pencil` on `--success-soft`, 3.66–4.30:1 (axe). The step's tint moved from `--dg-box-green` to `--success-soft` in entry 4, and the label kept `--pencil`.
    - Fixed in `app/globals.css`: `.step.is-done .check` joins the `.step.is-done .step__sub` rule and is `--ink-soft`, at least 5.02:1 in every theme.
    - `tests/contrast.test.ts` now checks `--ink-soft` on `--success-soft`.
    - `e2e/smoke.spec.ts` checks the label's colour in every theme, with one chapter marked read.
  - Known leftover, Blueprint: `--danger` `#ff8f7a` is 4.47:1 on `--sheet-2`.
    - Now `#ff907b`, the nearest lighter value with the same hue: 4.50:1 on `--sheet-2` and 5.13:1 on `--sheet`.
    - No other state in any theme failed on `--sheet-2`. The lowest was Paper `--success` at 4.97:1.
  - Known leftover, the editor bar's selected option: it did not reproduce, so nothing changed in the CSS. See the Plan Change Log.
  - Known leftover, the stale CSS sizes: fixed. See the Plan Change Log.
  - Nothing else reads wrong in what was reviewed. In all nine themes, every primary button, text link, progress fill, active tab and active chapter takes the theme's `--primary`, and no action is a fixed green or red.
  - After the fixes, axe reports no colour-contrast violation on any of the 17 pages in any theme, empty or seeded.
- **Seen but not changed.** None of these depends on the theme, and they are outside this entry.
  - `/review` with due chapters (seeded), every theme: axe `aria-prohibited-attr`. Each `span.stage[aria-label="Review N of 5"]` has an aria-label but no role. The e2e a11y run misses it because it loads `/review` with no progress.
  - `/review`: a legacy `true` chapter mark (`at: 0`) shows as "20723 days overdue".
  - `/notes`: the cover map's "Start here — … →" button text is underlined, because the global `a` keeps its underline and `.btn` does not remove it. It was the same on `main` before the epic, so it was left alone under "do not redesign".
  - Home, "Where are you now?": the selected persona tab takes its persona's colour (green for Fresher), not the accent. It is the inline per-persona `--accent` that entry 3 kept as categorical.
- **Categorical record.** After the fixes, `rg -n "var\(--(green|red|c-green|c-red|hl-yellow|hl-mint)\)" app components` gives 105 hits. Each one is in a token block, a `tests/theme-roles.test.ts` allowed list or `SOURCE_MARKER_FILLS`, and that test passes.
  - Token blocks:
    - `app/globals.css` `:root, [data-theme]`: `--c-red`, `--c-green`, `--c-red-soft`, `--c-green-soft`, `--ide-red`, `--ide-green`.
    - `app/theme-bridge.css` `@theme inline static`: `--color-red`, `--color-green`, `--color-hl-yellow`, `--color-hl-mint`.
  - Callouts:
    - `app/globals.css`: `.g`, `.r`, `.warn`, `.boxg`, `.boxr`, `.bx.is-prim`, `.tone-yes`, `.tone-bad`, `.interview-body .prep` and `.interview-body .prep .ttl`.
    - `app/interview/book.module.css`: `.sayBox`, `.sayBox .boxLabel`, `.trapBox` and `.trapBox .boxLabel`.
  - Diagrams:
    - `app/globals.css`, chapter diagrams: `.dg .rd`, `.dg .gr`, `.lnr`, `.lng`, `.demo__term .ok`, `.ev-box--inner`, `.loop-frame--micro`, `.loop-frame--macro` and `.loop-frame--out`.
    - `app/globals.css`, visualisers: `.viz__cell--lo`, `.viz__cell--hi`, `.viz__cell--done`, `.viz__gcell--done`, `.c3d__plane.is-kept`, `.c3d__badge`, `.c3d__link`, `.viz-node.is-done`, `.viz-badge`, `.viz-badge--work`, `.viz-phase.is-yours::after`, `.viz-rect--client` and `.viz-vertex.is-visited circle`.
    - The lane colours: `components/series/landing.module.css` `.page` and `app/architecture/architecture.module.css` `.page`.
    - Arrowhead markers (`SOURCE_MARKER_FILLS`): `components/reader/ReaderShell.tsx` and `components/series/ChapterView.tsx`, `arrow-green` and `arrow-red`.
    - The whiteboard: `app/whiteboard/whiteboard.module.css` `.paperMargin`, `.laser`, `.laserGlow` and `.swatch[data-value="none"]`.
  - Chips and tags:
    - `app/globals.css`: `.t-mint`, `.t-red`, `.tag--beginner`, `.tag--advanced`, `.soon-stamp` and `.interview-body .pill.r`.
    - `app/interview/book.module.css`: `.companies span[data-hot]` and `.bankTags span[data-t="trap"]`.
    - `app/problems/problems.module.css`: `.page` and `.sheetRoot`, which set the difficulty colours `--beginner` and `--advanced`.
  - Achievements: `app/globals.css` `.stat-card--a .stat-card__icon`, `.stat-card--c .stat-card__icon`, `.stat-card--d .stat-card__icon`, `.badge-card.is-earned`, `.badge-card.is-earned::after` and `.level-up-banner`.
  - Avatars: `app/mock/mock.module.css` `.avatar` and `.avatar[data-tone="calm"]`; `app/mock/guide.module.css` `.avatar` and `.avatar[data-tone="sharp"]`.
  - Window dots: `app/home.module.css` `.paperCode .codeBar > span:nth-child(1)` and `.paperCode .codeBar > span:nth-child(3)`.
  - Illustration, the home page's interview story: `app/home.module.css` `.round:hover`, `.roundNum`, `.roundGo`, `.paperRound` and `.followUp`.

## Plan Change Log

- **The editor bar's selected option.** The leftover did not reproduce, so the CSS is unchanged.
  - The only dropdown inside `.ed__bar` is the language picker, a grid menu (`columns={4}`). `.ed__bar .dd__menu--grid .dd__opt[aria-selected="true"]` (specificity 0,4,0), which `main` already had, overrides the solid fill. The selected option is transparent with `--primary` text.
  - The check mark shows only in grid menus; elsewhere it is `display: none`. Measured in all nine themes, the check and the focus ring are `--primary` on the menu's `--sheet`, visible, and `:focus-visible` matches. The solid `--primary` fill would apply only to a non-grid menu in the editor bar, and none exists.
  - The first pass added two rules that recoloured the check and the ring on a solid fill. The review pointed out that they changed nothing that renders, so they were removed.
  - The e2e test stays as the guard for the grid menu. It asserts that the row is visible, not the literal `--on-primary`, which would fail there.
    - In Lavender on `/practice?id=ex-two-sum`, it opens the picker with the keyboard. The selected option must be focused, `aria-selected` and `:focus-visible`.
    - The check mark's `display` is not `none`, and its colour and the solid ring's colour equal the option's text colour.
    - That colour is at least 3:1 against what is behind it: the option's fill, or the menu when the fill's alpha is 0.
    - Bare `/practice` is the playground, whose editor bar has no language picker (`showLanguagePicker={!playground}`).
- **The stated sizes.** Exact `globals.css` counts would fail on almost every CSS edit, so the prose rounds them.
  - All three chapters say `globals.css` is about 9,600 lines. `arch-design-system.ts` says there are 16 CSS modules, the largest `app/mock/mock.module.css` at about 3,300 lines. `arch-tech-stack.ts` says 16 modules too.
  - The rewritten paragraph no longer ranks the other modules. The original named seven modules, so a number swap would not have made it true.
  - `tests/claims.test.ts` computes each rounded figure and the module count from the tree, and compares with whitespace normalised.
- **The line-count chart** in `arch-health.ts` was redrawn from `wc -l` as of 30 September 2026, and says so.
  - It shows the eight largest files, ordered by size: `globals.css`, `interview-data.ts`, `topics.ts`, `mock.module.css`, `home.module.css`, `Board.tsx`, `PracticeWorkspace.tsx` and `book.module.css`.
  - The scale is one unit per 20 lines, anchored on the longest bar. The `globals.css` bar ends at x 726 and its label at about x 770, which leaves room for about 3,000 more lines.
  - `tests/claims.test.ts` checks the chart three ways:
    - each label is within 5% of its file's line count today, and the description matches the labels;
    - every bar is within 1 unit of the scale set by the longest bar;
    - the longest bar plus 120 units fits the 900-unit viewBox.
  - The table of the three big components under the chart keeps its older numbers. It is outside this ticket.
- **The axe counts.** `arch-design-system.ts` said axe ran on 18 pages, and `arch-testing.ts` said 19 tests over 18 pages. `e2e/a11y.spec.ts` lists 20 pages in 21 tests. Both chapters are corrected, and `tests/claims.test.ts` counts both numbers from the spec.
- **The contrast count.** The chapter's role-check count went from 63 to 108. The four states on `--sheet-2` add 36, and `--ink-soft` on `--paper` adds 9. The sentence names both. Following entry 6, no test asserts a count that multiplies by the number of themes, so a tenth theme still passes; the chapter's counts are kept by hand.
- **palette.md.** The "at least 4.5:1 against its pair" list also names the `--sheet-2` pairs.
- **The roadmap.**
  - The new task is `t88`, placed after the last `p-audit` task. Its "why" states the review's exact coverage.
  - `updatedAt` is `2026-09-30`.
  - The t48 note records the three contrast failures this sweep fixed.
  - The t77 note says this epic delivered the token half of "one meaning per token", and the type and spacing scale stays with epic-one-system.

## Review Triage Log

### 2026-09-30 — Review pass
- verdicts: 27 findings — high 0, medium 9, low 17, false 1, maybe-false 0
- findings:
  - `[low]` `[patch]` BH: the editor-bar CSS changes nothing that renders, and the new e2e test would pass without it. Verified: the language picker is a grid menu whose selected row is transparent with `--primary` text, and a non-grid check is `display: none`. Action: the two rules are deleted, the notes say the leftover did not reproduce, and the test also asserts the check is displayed and treats alpha 0 as unfilled.
  - `[medium]` `[defer]` BH: the token pairs behind the two sweep fixes still fail. Verified by computation: Kraft `--pencil` on `--paper` is 3.96:1, Blueprint `--pencil` on the inline-code background is 3.96:1, and Kraft `--caution` on `--paper` is 4.36:1. This predates the epic and is named in t48. Deferred to epic-audit-fixes entry 3. The missing tests for the two fixes are patched under VG1.
  - `[medium]` `[defer]` BH: on hovered or focused workspace rows, state and faint text falls below AA, and Blueprint `--danger` clears `--sheet-2` by 0.001. This predates the change, since `--ide-red` was the same colour. Deferred.
  - `[medium]` `[patch]` BH: the sweep covers less than it claims. Verified: `/interview/questions`, `/path` and `/practice` were not shot, and nothing below the first screen was. Action: those three pages were shot, `/`, `/mock`, `/interview` and seeded `/progress` were shot full-page in nine themes, and the notes and t88 now claim exactly the coverage.
  - `[medium]` `[patch]` BH: the line-count chart mixes two dates. Verified against `wc -l`: mock 3,314 against 2,187, interview-data 4,734 against 4,237, and so on, with home.module.css missing. Action: the chart is redrawn from today's counts for the real largest files, dated, rescaled, and asserted within 5%. Grouped with EC11, VG2 and VG other 2.
  - `[medium]` `[patch]` BH: exact `globals.css` counts fail on almost every CSS edit, and the chart label would pass the viewBox at about 10,000 lines. Verified: globals changed in 45 commits this month. Action: the prose says the count rounded to the nearest hundred, the claims assert the rounding, and the chart has room to grow. Grouped with the chart row and EC3.
  - `[low]` `[patch]` BH: other stated numbers are stale or unasserted. Verified: the chapters said 18 pages and 19 tests where the spec has 20 and 21, the ranking claims were unasserted, and one claim depended on line wrapping. Action: the page and test counts are corrected and asserted from the spec, the ranking claims are dropped or asserted, and whitespace is normalised. Counts that multiply by the number of themes stay hand-kept by entry 6's design.
  - `[low]` `[defer]` BH: defects the sweep found are not tracked. Action: they are recorded in `deferred`: the /review `aria-prohibited-attr`, the "20723 days overdue" mark, the underlined `.btn` link, and the axe-in-every-theme spec. The stale 18 pages is patched above.
  - `[low]` `[patch]` BH: the evidence lives in the scratchpad, and a committed file shows a local machine path. Action: the notes summarise the evidence without paths. Keeping the axe loop is deferred with t48.
  - `[low]` `[patch]` BH: `contrastRatio` duplicates maths and ignores alpha. Action: a background with alpha 0 in any format counts as unfilled. The duplicate helper is cosmetic and left as is.
  - `[low]` `[patch]` EC: a hidden check mark would pass the test. Action: the test asserts `display` is not `none`.
  - `[low]` `[patch]` EC: translucent or `color(… / 0)` backgrounds. Grouped with the BH alpha row.
  - `[low]` `[patch]` EC: the chart label would overflow as `globals.css` grows. Grouped with the BH rounding and chart rows.
  - `[low]` `[reject]` EC: "99 more checks" is unasserted. That number multiplies by the number of themes. Asserting it would fail a complete tenth theme, which entry 6's Verify forbids; the chapter records it as hand-kept.
  - `[low]` `[patch]` EC: the module-ranking claims are unasserted. Grouped with the BH numbers row.
  - `[low]` `[reject]` EC: Windows path separators in the claims test. Unlikely; the repo and CI run on macOS and Linux.
  - `[low]` `[reject]` EC: two modules could tie in line count. Unlikely, and a tie leaves the claim ambiguous rather than false.
  - `[low]` `[patch]` EC: the module-count claim depends on wrapping or CRLF. Grouped with the BH numbers row; the comparison normalises whitespace.
  - `[false]` `[reject]` EC: the contrast test hard-codes `--sheet-2` as the editor background. `--ide-bg` is declared only in the shared block as `var(--sheet-2)`, and entry 6's contract fails any theme block that declares a non-colour token, so no theme can override it.
  - `[low]` `[patch]` EC: the e2e test never exercises the filled branch. Grouped with the BH editor-bar row. The rules are gone, and the test guards the grid menu that exists.
  - `[medium]` `[patch]` EC: the arch-health chart. Grouped with the BH chart row.
  - `[medium]` `[patch]` VG1 (pre-verified): the Kraft eyebrow and Blueprint list-code fixes have no committed test. Action: per-theme e2e assertions that both are `--ink-soft`, and an `--ink-soft` on `--paper` pair in the contrast test.
  - `[medium]` `[patch]` VG2 (pre-verified): the chart's other stylesheet bars are unasserted. Grouped with the BH chart row.
  - `[low]` `[reject]` VG3 (pre-verified): the changed "99 more checks" is unasserted. Real, but asserting it breaks entry 6's tenth-theme Verify; the chapter records it as hand-kept.
  - `[low]` `[patch]` VG other 1: the editor-bar CSS is a no-op. Grouped with the BH editor-bar row.
  - `[medium]` `[patch]` VG other 2: the chart mixes snapshots. Grouped with the BH chart row.
  - `[low]` `[patch]` Intent auditor (descriptive): it implements A1 with two extra pages, B1 and B2, C2, and D1 in the repo copy. Its divergences map to the rows above: coverage, the editor-bar no-op, the missing tests for the fixes, the chart, and the evidence. The categorical record now labels each group by kind (callout, diagram, chip or tag, achievement, avatar, window dot, illustration). These are the kinds entries 2–4 decided, which is wider than the epic's four examples. t77 gains a note for the CAP-8 half. The coordinator republishes the roadmap artifact. The BMad epic status is not a file this workflow writes.

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npx vitest run tests/contrast.test.ts tests/claims.test.ts tests/theme-contract.test.ts tests/theme-roles.test.ts` -- expected: pass.
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: pass.
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build && PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run test:e2e` -- expected: all pass. e2e serves on 3100; never touch 3000.

**Manual checks (if no CLI):**
- The contact sheets, before and after the fixes, stayed in the session scratchpad; Implementation Notes summarise them.

**Results (2026-09-30):**
- First pass:
  - The four named Vitest files: 121 passed.
  - `npm run check`: passed, with 278 unit tests.
  - `npm run build`: passed.
  - `npm run test:e2e`: 93 passed, a11y included.
- Review round, running only the tests that cover the edited files; the coordinator runs the full gates:
  - `tests/contrast.test.ts` and `tests/claims.test.ts` pass.
  - Without the fix, the `--sheet-2` pair failed with `[data-theme="blueprint"] --danger (#ff8f7a) is 4.47:1 against --sheet-2 (#204569)`.
  - Planted stale values each failed their claims case:
    - 19 a11y tests;
    - a chart label of 4,237 for `interview-data.ts`;
    - an off-scale bar;
    - "about 9,300" in the tech-stack row.
  - The four `e2e/smoke.spec.ts` tests that changed pass against a fresh build.
- Port 3000 was never touched. The sweep server ran on 3200 and was stopped afterwards.

## Auto Run Result

- **Summary:** every section was looked at in all nine themes, and what read wrong is fixed. The epic's Done-when items now hold:
  - the accent shows on buttons, links, progress and active items;
  - the green/red/highlight search returns only recorded categorical uses;
  - check, build and e2e pass.
- **Coverage:**
  - 17 pages, first screen, in nine themes: the epic's 12, plus `/git/merge`, `/level/js`, `/interview/questions`, `/path?topic=js&level=beginner` and `/practice`.
  - Full-page shots of `/`, `/mock`, `/interview` and seeded `/progress`.
  - Axe on all 17 pages in every theme, with and without saved progress.
- **Fixes:**
  - Three text-contrast failures, found by axe: the Kraft "start here" eyebrow on `/mock`, the Blueprint list code on `/level/js`, and the done-step "mark as read" label on `/path`. Each moved to `--ink-soft`.
  - Blueprint `--danger` `#ff8f7a` → `#ff907b`, 4.50:1 on the editor background, recorded in palette.md.
  - "How this is built" states the true sizes. The line-count chart is redrawn from today's counts and dated, and the axe counts are 20 pages and 21 tests.
  - The editor-bar leftover did not reproduce, so its CSS is unchanged.
- **Files changed:**
  - `app/globals.css`: Blueprint `--danger`, `.level__list code`, `.step.is-done .check`.
  - `app/mock/mock.module.css`: `.planHead .eyebrow`.
  - `tests/contrast.test.ts`: the states on `--sheet-2`, `--ink-soft` on `--paper`, `--ink-soft` on `--success-soft`.
  - `tests/claims.test.ts`: the rounded `globals.css` size, the module count and the largest module, the chart labels within 5% and on one scale with room to grow, and the axe page and test counts.
  - `e2e/smoke.spec.ts`: the three fixed labels are `--ink-soft` in every theme, and the editor-bar grid menu keeps its check and ring visible.
  - `content/architecture/arch-design-system.ts`, `arch-health.ts`, `arch-tech-stack.ts`, `arch-testing.ts`: the true numbers.
  - `docs/roadmap.html`: `t88` added and done, notes on `t48` and `t77`.
  - `palette.md`: the Blueprint change.
- **Review findings:** 27 in total.
  - 7 entries went to patch, all applied:
    - medium 3: the untested fixes, the sweep coverage, the chart and the rounding;
    - low 4: the editor-bar no-op, the chapter numbers, the evidence paths, the e2e alpha and display.
  - 6 deferred: `--pencil` token pairs (t48), workspace hover rows, the `/review` `aria-prohibited-attr`, the "20723 days overdue" mark, the underlined `.btn` link, and the committed axe-in-every-theme spec.
  - 5 rejected, with reasons in the triage log:
    - the theme-multiplied counts (entry 6's tenth-theme contract), twice;
    - Windows paths;
    - ties in module size;
    - `--ide-bg` (false: theme blocks cannot declare it).
- **Follow-up review:** recommended. Three medium entries were patched in one pass without a second lens run. The unverified risk is the new done-step fix and the redrawn chart. They are covered by a per-theme e2e colour check and claims tests, but no second reviewer has read them.
- **Verification:**
  - `npm run check`: 279 unit tests.
  - `npm run build`.
  - `npm run test:e2e`: 93 passed, a11y included.
  - The sweep's axe run: no contrast violation on any of the 17 pages in any theme.
  - Planted regressions each failed the claims cases.
- **Residual risks:**
  - axe in every theme is not yet a committed spec (t48).
  - The deferred `--pencil` pairs still fail on some backgrounds that axe did not reach.
