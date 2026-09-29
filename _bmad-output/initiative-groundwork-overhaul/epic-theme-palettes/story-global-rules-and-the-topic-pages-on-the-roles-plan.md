---
title: 'Global rules and the topic pages on the roles'
type: 'refactor'
ticket: '4'
created: '2026-09-29'
status: 'built'
baseline_revision: '595672253da9772616a5980568daf8c507202586'
route: 'full'
route_source: 'auto'
review: 'thorough'
review_source: 'auto'
lenses_ran: ['blind-hunter', 'edge-case-hunter', 'verification-gap', 'intent-alignment']
review_loop_iteration: 0
followup_review_recommended: true
context: ['{project-root}/_bmad-output/specs/spec-groundwork-overhaul/palette.md', '{project-root}/AGENTS.md', '{project-root}/_bmad-output/initiative-groundwork-overhaul/epic-theme-palettes/story-global-rules-and-the-topic-pages-on-the-roles-colour-map.md']
warnings: ['oversized']
deferred:
  - summary: >-
      Blueprint's --danger on --sheet-2 is 4.47:1, so the practice workspace's error text (test reasons, console errors, inline errors) is just under AA there.
    evidence: |-
      Computed from the theme blocks: Blueprint --danger #ff8f7a on --sheet-2 #204569 is 4.47:1. The old --red gave exactly the same ratio, so this change did not cause it. Fixing it means a palette value, which the theme blocks own, and tests/contrast.test.ts checks roles against --sheet only.
    location: >-
      app/globals.css (the [data-theme="blueprint"] block)
    severity: low
  - summary: >-
      Two other architecture chapters still say globals.css is 9,319 lines, while arch-design-system.ts now says 9,605.
    evidence: |-
      content/architecture/arch-health.ts:68,88,105 and content/architecture/arch-tech-stack.ts:24 say 9,319. The file was already 9,575 before this change. tests/claims.test.ts asserts none of these counts.
    location: >-
      content/architecture/arch-health.ts:68
    severity: low
  - summary: >-
      In the editor bar's dropdowns, the selected option's check mark and its inset focus ring are --primary on a --primary fill, so neither shows.
    evidence: |-
      app/globals.css .ed__bar .dd__opt[aria-selected="true"] is a solid --primary fill, and .ed__bar .dd__opt-check and .ed__bar .dd__opt:focus-visible are --primary. The same was true with --ide-accent before this change.
    location: >-
      app/globals.css:6242
    severity: low
  - summary: >-
      The theme-roles guard does not see the derived aliases (--c-*-soft, --warn-bg), literal colours, app/theme-bridge.css or components/AppHeader.module.css.
    evidence: |-
      THEME_BLIND in tests/theme-roles.test.ts lists named tokens only. Entry 6, the theme contract, owns generalising the guard to all files and forbidding hex literals in module CSS.
    location: >-
      tests/theme-roles.test.ts:5
    severity: low
  - summary: >-
      --ide-accent is still declared in the Paper block, but nothing reads it any more.
    evidence: |-
      After this change no rule in app/globals.css or components/practice/CodeEditor.tsx uses var(--ide-accent). This entry may not edit the theme blocks, and entry 6's token contract decides the token set.
    location: >-
      app/globals.css:68
    severity: low
---

<intent-contract>

## Intent

**Problem:** The global rules in `app/globals.css` still paint many things with fixed green, red, mint and yellow: links, the reading progress bar, the focus ring, `.btn--primary`, the sidebar and cover map, the level and path pages, the practice workspace (through `--ide-accent`/`--ide-green`/`--ide-red`), the title highlighter and the notebook margin line. So topic pages, `/level`, `/path` and the playground look the same in every theme.

**Approach:** Move every action, link, progress, selection and highlight use in the global rules, `ReaderShell.tsx` and `narration.ts` onto the entry-1 roles, following the colour map. Keep content styles categorical: callouts, stickies, diagrams, dry-run and truth tables, level tags and window dots. Guard the global rules with the theme-roles test.

## Boundaries & Constraints

**Always:**
- Follow the role rules from palette.md and entries 2 and 3:
  - A fill that carries text is pure `var(--primary)` with `--on-primary`. This includes every fill that used `--ide-bg` text on `--ide-accent`/`--ide-green`.
  - Text on a state fill is `--sheet`.
  - Text on any `-soft` tint or on `--mark` is `--ink`, or `--ink-soft` where the rule used `--pencil`.
  - Mixes stay `color-mix(in srgb, var(--role) N%, …)`.
  - Links keep an underline or border cue.
- Settle the ticket's open question this way: content styles inside chapter bodies stay categorical, as listed in the Code Map.
- The notebook margin line (`.sheet::before`) follows the theme.
- Tokens only. No comments.

**Never:**
- Do not edit the nine theme blocks or the shared `:root, [data-theme]` block (`globals.css` lines 1–~720), and add no tokens. `--warn-bg`, `--ide-*` and `--sticky-*` stay defined as they are.
- Touch only these files:
  - `app/globals.css`, `components/reader/ReaderShell.tsx` and `components/reader/narration.ts`;
  - `tests/theme-roles.test.ts`, `e2e/smoke.spec.ts` and `content/architecture/arch-design-system.ts`.
  - One exception: a module rule for a card or nav link that the new accent `a` rule recolours by accident may get `color: inherit`.
- Do not delete dead CSS. Map it by the colour map, and leave its removal to epic-one-system.
- Do not change the syntax colours, layout, sizes or motion.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Cover CTA | Any of the 9 themes, `/notes`, the cover's Continue/Start (`.btn--primary`) | background is `--primary`, text is `--on-primary` | No error expected |
| Reading chrome | Any of the 9 themes, `/notes/closures` | the reading progress bar and an in-body text link are `--primary`; the current chapter's number ring in the rail is `--primary` | No error expected |
| Practice | Any of the 9 themes, `/practice`, the Run button | background is `--primary`, text is `--on-primary` | No error expected |
| Level and path | Any of the 9 themes, `/level/js` and `/path?topic=js&level=beginner` | a written syllabus row's bar and the progress meter fill are `--primary` | No error expected |
| Margin line | Paper, then Lavender, on a chapter | the `.sheet::before` line changes with the theme and is no longer `rgba(196, 52, 43, 0.32)` | No error expected |
| State keeps meaning | `/problems/ex-two-sum` after running tests: Forest, where success ≠ green, for a passing test; Lavender, where danger ≠ red, for a failing test | the passed mark is Forest's `--success` `rgb(31, 111, 92)`; the failed mark is Lavender's `--danger` `rgb(184, 57, 94)` | No error expected |
| Guard | A `var(--green)` or `var(--ide-accent)` added to a global rule outside the categorical list | `npm run test` fails, naming `app/globals.css`, the line, the selector and the token | Vitest failure |

</intent-contract>

## Code Map

The colour map `story-global-rules-and-the-topic-pages-on-the-roles-colour-map.md` (in `context:`) classifies every use, with line, selector, old token, new token and reason. Apply every row as written, except where a decision below differs. The decisions below settle every call the map marks uncertain.

- **Section A (lines 720–2999):**
  - `li::marker`, `:focus-visible`, `.progress`, the settings rows and focus rules → `--primary`.
  - `.site-navlink__dot` → `--primary`, not success, because "ready" is not "done".
  - `.site-navlink--accent` → `--primary-soft` with `--ink`.
  - `.station.is-reach` → the 8% primary mix.
  - `h2::after` and the chapter title → `--mark`, including the dark-theme stroke override.
  - **Keep:** `.daily-recap`, `.g`, `.r`, `.sticky`, `.sticky.mint` and `.warn`, including `--warn-bg` and its red text. `.warn` is a content callout, so the map's move of it to caution is overruled.
  - Apply the map's task-2 list:
    - the global `a` → `--primary`; the UA underline stays;
    - `.site-navlink.is-active .site-navlink__num` border, `.dd__opt:focus-visible` and `.search__input:focus` → `--primary`.
  - Add `color: inherit` for links inside the kept callouts (`.sticky a`, `.warn a`, `.bx a`), so they keep their callout pair.
  - Apply the map's task-3 re-pairs: `--ink-soft` for `.site-navlink.is-active.site-navlink--muted` and for `.station__num`/`.station__min` on `.is-next` and `.is-reach`.
  - Leave `.sidenav-progress__cta` (`Shell.tsx`) and the optional rows.
- **The margin line:** `.sheet::before` `rgba(196, 52, 43, 0.32)` → `color-mix(in srgb, var(--primary) 32%, transparent)`.
- **Section B (lines 3000–4999):**
  - **Keep:**
    - diagrams: `.dg .rd`, `.dg .gr`, `.boxg`, `.boxr`, `.boxy`, `.lnr`, `.lng`;
    - `.demo__term .ok` and `.loop-frame--*`;
    - `.bx.*`, and the level tags `.tag--beginner/-intermediate/-advanced`;
    - `.tone-yes/-warn/-bad`: these are content tables, so the map's move to states is overruled;
    - `.ev-box--inner`: a demo illustration, so the map's move is overruled.
  - **Move:**
    - `.demo__term .err` → `--danger`.
    - `.de-highlight` and `.loop-code div.hot` → `--mark`. `.loop-bar i` → `--primary`.
    - `.btn--primary` → `--primary` with `--on-primary` and a `--primary` border. Its hover restates both over `.btn:hover`.
    - `.tag--done` → a `--success` border, a `--success-soft` background and `--ink` text.
    - `.syllabus-item.is-ready` and its ✓ → `--primary`. `.syllabus-checkpoint` → `--info-soft` with `--ink`.
    - `.meter__fill` → `--primary`.
    - `.step.is-done` → `--success` and `--success-soft`, with `.step.is-done .step__sub` in `--ink-soft`.
    - `.crumbs a` → `--primary`, keeping the dashed border; its hover gets a solid `--primary` border.
    - `.level:hover/:focus-visible` border and `.level__cta` → `--primary`.
  - Dead rules are mapped as in the map.
- **Section C (lines 5000–end):** apply as mapped.
  - **Keep:**
    - `.ed__tl--*`, `.soon-stamp` and `.hint`;
    - the `viz__cell`/`viz__gcell`/`c3d`/`viz-badge`/`viz-rect`/`viz-vertex.is-visited`/`viz-node.is-done`/`viz-phase.is-yours` diagram paint;
    - the `.interview-body` content: `.prep`, `.card.*`, `.pill.*`, `.tier.hot` and `tr.hi`.
  - **Solid primary with `--on-primary`:** the tab-menu hover and the selected dropdown and palette rows. Run and Test both → `--primary`.
  - **Mark:** the viz "current" highlights, `.interview-body .test` and `pre .o`, and `narration.ts`.
  - **Caution, replacing `--ide-string`:** the warnings at 6414, 7059 and 7124. `.line--info` → `--info`.
  - `.cm-debug-line` → `color-mix(in srgb, var(--primary) 16%, transparent)`.
  - Apply the map's task-2 items 1–4: the `.brief__tab.is-active` underline, the `.resize-handle:focus-visible` grip (split off from `:hover`), the `.c3d-ctl` range and `.site-foot a`.
  - Apply P1 and P2: every `var(--ide-bg)` on a new primary fill, and the switch knob → `--on-primary`.
  - P3: badge and verdict text on their own state tint keeps the state colour only where a script shows it at 4.5:1 or better in all nine themes (3:1 for the 24px verdict). Otherwise it becomes `--ink`.
- `components/reader/ReaderShell.tsx:239,250` -- the `arrow-green` and `arrow-red` markers stay categorical, matching `.lng`/`.lnr` and `ChapterView.tsx:46-47`.
- `tests/theme-roles.test.ts`:
  - Add `--ide-accent`, `--ide-green`, `--ide-red` and `--ide-yellow` to the scanned tokens.
  - Scan `app/globals.css` too, skipping every block whose selector is only `:root` and/or `[data-theme…]` (the theme and shared blocks). The theme-scoped global rules, such as `[data-theme="dark"] h2::after`, are still scanned.
  - Its allowed list is exactly the keep selectors above, plus the dead keeps from the map.
  - `narration.ts` has no scanned token. `ReaderShell.tsx` may use only the two marker fills.
- `e2e/smoke.spec.ts`:
  - A new test over all nine `THEME_ACCENTS` themes, covering matrix rows 1–4.
  - A margin-line check.
  - The state checks for matrix row 6, in Forest and Lavender. Reuse the test-running flow near `smoke.spec.ts:283`.
- `content/architecture/arch-design-system.ts:108-122`:
  - Say that every section now reads the roles, and list what stays fixed (the categorical families).
  - Update the `globals.css` line count to its new length.

## Tasks & Acceptance

**Execution:**
- [x] `app/globals.css` -- apply the colour map with the Code Map decisions -- topic pages, `/level`, `/path` and the practice workspace follow the theme
- [x] `components/reader/narration.ts` -- move the narration highlight to `--mark` -- the read-aloud highlighter matches the theme
- [x] `tests/theme-roles.test.ts` -- extend the guard to the global rules, the aliases and the two reader files -- a regression names the file, line and selector
- [x] `e2e/smoke.spec.ts` -- the nine-theme, margin-line and state checks -- the surface check
- [x] `content/architecture/arch-design-system.ts` -- update the paragraph and the `globals.css` count -- How this is built stays true

**Acceptance Criteria:**
- Given any of the nine themes, when `/notes`, `/notes/closures`, `/level/js`, `/path?topic=js&level=beginner` or `/practice` loads, then buttons, text links, progress fills, the active chapter and focus rings use that theme's `--primary`, and no global rule outside the categorical list paints with a fixed or aliased green, red, mint or yellow.
- Given the pages checked by the a11y and smoke specs, when `npm run test:e2e` runs, then both pass with no new violations.

## Implementation Notes

- 2026-09-29: a fresh subagent implemented this from the plan. It did not edit the plan; the coordinator recorded these notes from its report.
  - `app/globals.css`, now 9,605 lines:
    - Every colour-map row is applied, with the Code Map decisions.
    - Outside the theme blocks, fixed or `--ide-*` colours remain only in the 69 kept selectors (the content keeps and the dead keeps).
    - The global `a` is `--primary`, and the underline stays.
    - `.btn--primary` is `--primary` with `--on-primary`, and its hover restates the background and border.
    - Every `--ide-accent`/`--ide-green` fill in the practice workspace is `--primary` with `--on-primary`, including Run and Test and the switch knob.
    - The three `--ide-string` warnings are `--caution`, and `.line--info` is `--info`.
    - The margin line is `color-mix(in srgb, var(--primary) 32%, transparent)`.
  - P3, scripted over sheet and sheet-2 in nine themes:
    - `.tab__count` (3.49:1 at worst) and `.run-status` (3.65:1) now use `--ink` text on their state tint.
    - `.verdict` never goes below 3.92:1 (it needs 3:1), so it keeps the state colour.
  - `narration.ts`: the read-aloud highlight is `var(--mark)`. `ReaderShell.tsx` is unchanged; its markers stay categorical.
  - `tests/theme-roles.test.ts`:
    - The four `--ide-*` aliases join the scanned tokens.
    - `app/globals.css` is scanned, skipping blocks whose selector is only `:root` and/or `[data-theme…]`. It has an exact allowed list and a stale-entry check.
    - `CodeEditor.tsx`, `narration.ts` and `ReaderShell.tsx` are scanned. ReaderShell may use only the `arrow-green`/`arrow-red` fills.
    - There are fixture tests for block skipping and markers.
    - A planted `var(--green)` and a planted `var(--ide-accent)` each failed with the file, line, selector and token.
  - `e2e/smoke.spec.ts` has three new tests:
    - matrix rows 1–4 in all nine themes;
    - the margin line, checked exactly against the accent at 0.32 in Paper and Lavender;
    - a failed test in Lavender (`rgb(184, 57, 94)`) and a passed test in Forest (`rgb(31, 111, 92)`).
  - `arch-design-system.ts`:
    - It now says every section reads the roles, and lists what stays fixed.
    - The `globals.css` count is 9,605.
- Judgement calls:
  - The sidebar's `.topic-of-day__link` card turned accent under the new `a` rule, so it got `color: inherit` in `globals.css`.
  - A sweep of every link that turned accent on `/`, `/review`, `/interview`, `/mock`, `/problems`, `/git`, `/architecture` and `/progress`, in Paper and Lavender, found only in-text links and the skip link. No module needed a change.
  - The map's optional rows and its dead task-2 items were not applied. The plan asks only for the listed items.
- Visible side effects the plan accepts:
  - The `h2` underline stroke is fainter in Night, Blueprint and Rose, because `--mark` is dark there.
  - List bullets are the accent everywhere, including inside sticky notes.
- Still stale, outside this entry's files: `arch-health.ts` and `arch-tech-stack.ts` still say `globals.css` is 9,319 lines.
- Verification:
  - The coordinator re-ran it all:
    - the guard and contrast tests: 63 passed;
    - `npm run check`: 232 unit tests;
    - `npm run build`;
    - `npm run test:e2e`: 91 passed, a11y included.
  - The subagent took screenshots on port 3200 in Paper, Lavender, Kraft and Night.

- Review fixes, applied by the same subagent at the coordinator's request:
  - The `h2::after` override for Night, Blueprint and Rose uses `--primary`. `.tag--ready` text is `--ink`.
  - The link-inherit rule is `.sticky a, .warn a, .bx.is-prim a, .bx.is-ref a, .interview-body .prep a`.
  - `ChapterView.tsx` joins `SOURCE_MARKER_FILLS`. `markerAround` also reads an id from an `["arrow-green", "var(--green)"]` pair, and the fixture covers it.
  - `arch-design-system.ts`:
    - It says "most of the site" instead of "every section".
    - Its keep list says "such as" and adds the live keeps.
    - It says the visualisers' current step follows the marker, and describes what the guard actually scans.
    - The `globals.css` count is 9,608.
  - `e2e/smoke.spec.ts`:
    - On `/level/js`, `#crumbs a` and `.level__cta` are the accent.
    - On `/notes/closures`, a keyboard focus ring is the accent, with a solid style.
    - `#tests-count` is the theme's `--ink` after the fail in Lavender and after the pass in Forest.
    - The lint warning mark is `rgb(138, 100, 0)`.
    - A Paper `.warn` link matches its box.
- Verification after the review fixes:
  - The guard and contrast tests: 64 passed.
  - `npm run check`: 233.
  - `npm run build`.
  - `npm run test:e2e`: 92 passed.

## Plan Change Log

## Review Triage Log

### 2026-09-29 — Review pass
- verdicts: 28 findings — high 0, medium 5, low 21, false 2, maybe-false 0
- findings:
  - `[low]` `[defer]` BH: error text in the workspace is under AA in Blueprint. Verified: `--danger` on `--sheet-2` is 4.47:1, the same as the old `--red`, and the change improved Kraft, Sepia and Lavender, so it is pre-existing. Deferred as a palette value for the sweep.
  - `[low]` `[patch]` BH: the `h2` underline nearly vanishes in Night, Blueprint and Rose. Verified: the override at `globals.css:775-781` draws an opaque stroke, and `--mark` there is 1.5–1.6:1. Action: the override uses `--primary`, like home's title underline.
  - `[low]` `[defer]` BH: the chapters contradict each other on the `globals.css` line count. Verified: `arch-health.ts` and `arch-tech-stack.ts` say 9,319, which was already stale at 9,575 before this change. Deferred, grouped with VG other 1.
  - `[low]` `[patch]` BH: the guard misses some aliases and literals, so the chapter claims more than the test enforces. Verified. Grouped with the chapter wording. Action: the chapter describes what the guard actually scans. Widening the guard is deferred to entry 6 (see EC4).
  - `[low]` `[reject]` BH: the plan and the code disagree on `.station.is-reach .station__min`. The code follows the map row (`--primary`, 5.25:1). The fix would edit this plan's wording, which the triage rules reject.
  - `[low]` `[patch]` BH: `.tag--ready` text breaks the text-on-tint rule. Verified at `globals.css:4657`. Action: `--ink`.
  - `[medium]` `[patch]` BH: no e2e checks focus rings, Submit, the crumbs, the site foot or `.level__cta`. Grouped with VG3. Action: `#crumbs a` and `.level__cta` on `/level/js`, and a keyboard focus ring on `/notes/closures`, in all nine themes. The point about hard-coded state values is cosmetic and was not taken.
  - `[low]` `[defer]` BH: the focus ring on the editor bar's selected option is invisible. Verified. It was the same with `--ide-accent` before, so it is pre-existing. Deferred, grouped with EC2.
  - `[false]` `[reject]` BH: Run and Submit now look identical. Before, `--ide-green` and `--ide-accent` were both `var(--green)` (`globals.css:68,72`), so they already looked identical.
  - `[low]` `[patch]` BH: the callouts only half keep their colours, since `.interview-body .prep` links take the accent. Verified. Grouped with EC6 and EC7. Action: the inherit rule covers `.sticky`, `.warn`, `.bx.is-prim`, `.bx.is-ref` and `.interview-body .prep` links. Bullets inside callouts taking the accent is accepted.
  - `[low]` `[reject]` BH: the plan does not record the deferrals or the triage. This triage writes them now; the rest would be an edit to the plan.
  - `[low]` `[patch]` BH: the chapter's list of what stays fixed reads as complete, and "every section" overstates. Verified. Grouped with the chapter wording. Action: the list says "such as", "every" is dropped, and the visualisers' current-step highlight is described.
  - `[false]` `[reject]` EC: `.demo__term .ok` stays fixed while `.err` moves. Every `console.log` line gets `ok`, so it is terminal decoration, kept on purpose. `.err` marks a thrown error, which is a state.
  - `[low]` `[defer]` EC: the selected editor-bar option's check mark and focus ring are invisible. Grouped with the BH row; pre-existing.
  - `[low]` `[reject]` EC: the guard skips non-custom properties inside theme blocks. The theme blocks declare only custom properties, so this is unlikely, and the fix adds structure.
  - `[low]` `[defer]` EC: the guard misses `--c-*-soft` and `--warn-bg`. Adding them now means allow-listing every topic-chip use. Entry 6 owns generalising the guard.
  - `[low]` `[reject]` EC: a self-closing `<marker />` would excuse later uses. No marker in the scanned files is self-closing, so this is unlikely, and the fix adds a guard.
  - `[low]` `[patch]` EC: `.bx a` inherit on a plain `.bx`. Grouped with the BH callout row.
  - `[low]` `[patch]` EC: `.interview-body .prep a` is inconsistent with `.bx.is-prim a`. Grouped with the BH callout row.
  - `[low]` `[patch]` EC: the chapter claims the reader's scripts are guarded, but `ChapterView.tsx` is not scanned. Verified. Action: `ChapterView.tsx` joins `SOURCE_MARKER_FILLS` with its two markers, and the chapter names the scanned files.
  - `[low]` `[patch]` EC: the chapter lists the visualisers as fixed, although their current-step fills moved to `--mark`. Grouped with the chapter wording.
  - `[low]` `[defer]` EC: `--ide-accent` has no consumer left. The declaration is in the Paper theme block, which this entry may not edit. Deferred to entry 6's token contract.
  - `[medium]` `[patch]` VG1 (pre-verified): the P3 change to `--ink` badge text is untested. Action: `#tests-count` is `--ink` after a fail in Lavender and after a pass in Forest.
  - `[medium]` `[patch]` VG2 (pre-verified): lint warnings moved to `--caution` with no colour check. Action: in the lint test, the warning mark is Paper's `--caution` `rgb(138, 100, 0)`.
  - `[medium]` `[patch]` VG3 (pre-verified): the crumbs and `.level__cta` links are unasserted. Grouped with the BH e2e row.
  - `[medium]` `[patch]` VG4 (pre-verified): the `color: inherit` on callout links is unasserted. Action: on `/notes/basic-async` in Paper, a `.warn` link matches its `.warn` colour.
  - `[low]` `[defer]` VG other 1: the architecture chapters disagree on the line count. Grouped with the BH counts row.
  - `[low]` `[patch]` Intent auditor (descriptive). It implements the reading that everything that is not content moves, states included, with content kept by a rule rather than a count. Its divergences map to the rows above. The chapter overclaim is patched. The one-element-per-route tests gained the crumbs, `.level__cta`, a focus ring and the badges. `ReaderShell.tsx` is unchanged on purpose; its markers are categorical and now guarded, alongside `ChapterView.tsx`.

## Design Notes

The line is drawn where the ticket drew it. The site's chrome (buttons, links, progress, selection, focus, highlights) follows the theme. What a chapter says in colour (callouts, diagrams, stickies, dry-run and truth tables, level tags) stays categorical, so a red gotcha box or a green diagram box means the same in every theme. States keep one meaning: `--success` is read, passed or solved, never "available", which is why "ready" rows and dots take the accent.

The global `a` rule turns every uncoloured link the accent. Before signing off, screenshot `/`, `/review`, `/interview`, `/mock`, `/problems`, `/git` and `/architecture` in Paper and Lavender. Any card or nav link that turned accent by accident gets `color: inherit` in its own rule.

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npx vitest run tests/theme-roles.test.ts tests/contrast.test.ts` -- expected: pass.
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: pass.
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build && PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run test:e2e` -- expected: all pass. e2e serves on 3100; never touch 3000.

**Manual checks (if no CLI):**
- Serve the build on port 3200. Screenshot `/notes`, `/notes/closures`, `/level/js`, `/path?topic=js&level=beginner`, `/practice` (after a run) and `/problems/ex-two-sum` (after a failing test) in Paper, Lavender, Kraft and Night.
  - No action is still green or red.
  - The callouts and diagrams look as before.

## Auto Run Result

- **Summary:**
  - The global rules in `app/globals.css` now paint with the entry-1 roles: the old sidebar, the reader chrome, the cover map, `/level`, `/path`, the practice workspace and the playground.
    - Links, `.btn--primary`, reading progress, meters, the active chapter, focus rings and selected rows take the accent.
    - Highlighters take `--mark`. In Night, Blueprint and Rose the `h2` stroke takes the accent.
    - The notebook margin line follows the accent.
    - Read, done, passed, failed, warning and info states take the state roles.
  - The practice workspace no longer reads the green `--ide-accent`/`--ide-green` aliases.
  - The narration highlight is `--mark`.
  - Content styles stay categorical: callouts, stickies, diagrams, dry-run and truth tables, level tags, the interview book's content, window dots and the soon stamp. They are guarded by an exact allow-list of 69 selectors.
- **Files changed:**
  - `app/globals.css`: the role moves, the callout-link inherit, and the `--ink` badge text on state tints.
  - `components/reader/narration.ts`: the read-aloud highlight is `--mark`.
  - `tests/theme-roles.test.ts`:
    - It scans the global rules (skipping the theme and shared blocks), the `--ide-*` aliases, the code editor, `narration.ts`, `ReaderShell.tsx` and `ChapterView.tsx`, with a marker-fill allowance for the two diagram arrowheads.
    - It has fixture tests.
  - `e2e/smoke.spec.ts`: the nine-theme check of topic covers and chapters, `/level`, `/path` and the playground (CTA, progress, in-body link, focus ring, active chapter, crumbs, level CTA, meter, Run), the margin line, the state colours in Forest and Lavender with the badge text, the lint warning colour, and the callout link.
  - `content/architecture/arch-design-system.ts`: what reads the roles, what stays fixed, what the guard scans, and the `globals.css` count.
  - `story-global-rules-and-the-topic-pages-on-the-roles-colour-map.md` (new): the planning classification of every use.
- **Review findings:** 28 in total.
  - 8 entries went to patch, all applied:
    - medium 4: the e2e for links and focus, the badge text, the lint warning colour, the callout links;
    - low 4: the dark-theme `h2` stroke, `.tag--ready` text, the callout-link scope, and the chapter wording with ChapterView in the guard.
  - 5 deferred:
    - Blueprint danger on sheet-2 at 4.47:1, as before;
    - the stale counts in arch-health and arch-tech-stack;
    - the invisible check mark and focus ring on the editor bar's selected option, which predate this change;
    - widening the guard, owned by entry 6;
    - the unused `--ide-accent` declaration.
  - Rejected, with reasons in the triage log:
    - Run and Submit look identical (false: both were green before).
    - `.demo__term .ok` (false: it is terminal decoration).
    - The plan wording on `.station.is-reach .station__min` (a plan edit; the code is safe at 5.25:1).
    - The plan metadata (a plan edit).
    - Non-custom properties in theme blocks (low; unlikely).
    - A self-closing marker (low; unlikely).
- **Follow-up review:** recommended. Four medium entries were patched in one pass without a second lens run. The unverified risk is contrast in the eight non-Paper themes for pairs this change added. Examples are accent text on the 8% primary tint and callout links now in the accent. Those pairs are checked by scripts and token-pair tests, not by axe, because the a11y spec runs only in Paper.
- **Verification:**
  - The guard and contrast tests: 64 passed.
  - `npm run check`: 233 unit tests.
  - `npm run build`.
  - `npm run test:e2e`: 92 passed, a11y included.
  - The implementer's screenshots on port 3200 in Paper, Lavender, Kraft and Night.
- **Residual risks:**
  - List bullets inside callouts take the accent; this was accepted.
  - Dead CSS is mapped, not removed; that is left to epic-one-system.
  - The rail's "Continue" CTA (`Shell.tsx`) is still a plain button.
  - a11y still runs only in Paper, deferred from entry 2.
