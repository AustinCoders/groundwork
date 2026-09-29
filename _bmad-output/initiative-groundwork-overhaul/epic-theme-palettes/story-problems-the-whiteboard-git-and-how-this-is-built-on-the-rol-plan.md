---
title: 'Problems, the whiteboard, Git and How this is built on the roles'
type: 'refactor'
ticket: '3'
created: '2026-09-29'
status: 'built'
baseline_revision: 'be55d6645b7ff2d8ba0f2a71fd460d3e71c8cc77'
route: 'full'
route_source: 'auto'
review: 'thorough'
review_source: 'auto'
lenses_ran: ['blind-hunter', 'edge-case-hunter', 'verification-gap', 'intent-alignment']
review_loop_iteration: 0
followup_review_recommended: true
context: ['{project-root}/_bmad-output/specs/spec-groundwork-overhaul/palette.md', '{project-root}/AGENTS.md']
warnings: ['oversized']
deferred:
  - summary: >-
      Elements on these pages without a module focus rule (the chapter's Mark as read button, breadcrumb and contents links, and the whiteboard's board menu buttons) take the global focus ring, which is a fixed red in every theme.
    evidence: |-
      app/globals.css:826 sets :focus-visible { outline: 3px solid var(--red); }. Entry 4 owns the global rules in globals.css, and the chapter already lists the focus ring as not moved yet.
    location: >-
      app/globals.css:826
    severity: medium
  - summary: >-
      The CSS size claims in How this is built are stale and not asserted by any test.
    evidence: |-
      content/architecture/arch-design-system.ts:229-233 says globals.css is 9,319 lines (it is 9,575) and names seven CSS modules with four small ones, but 16 module files exist and SiteDrawer.module.css is 812 lines. tests/claims.test.ts has no case for this chapter (already deferred from entry 1), and entry 4 changes the globals.css length again.
    location: >-
      content/architecture/arch-design-system.ts:229
    severity: low
---

<intent-contract>

## Intent

**Problem:** The problems list, the whiteboard, the series landing and chapter pages (`/git`, `/git/<section>`, `/architecture`, `/architecture/<chapter>`) and the code editor's highlights paint actions, progress, the active chapter, selections and highlights with fixed green, red, mint and yellow. So these sections stay green in every theme.

**Approach:** Move every such use in the entry's files onto the entry-1 roles, using the same rules as entry 2. Keep the genuinely categorical colours, and extend `tests/theme-roles.test.ts` to guard these files.

## Boundaries & Constraints

**Always:**
- Follow palette.md's role rules and entry 2's conventions:
  - A fill that carries text is pure `var(--primary)` with `--on-primary` text. Text on a state fill is `--sheet`. Text on any `-soft` tint or on `--mark` is `--ink`, or `--ink-soft` where the file uses `--pencil` today.
  - Active nav items use `--primary-soft` with a `--primary` inset bar or ring.
  - Text links keep an underline or border cue.
  - Done and read states use `--success`. Destructive actions use `--danger`.
- Drop the `#b7791f` hex fallback wherever it follows `var(--dg-yellow-stroke, …)`. The token is defined in `:root`.
- The whiteboard's selected tool follows the accent. This settles the ticket's open question by palette.md's rule that selected states are `--primary`.
- No comments. Tokens only.

**Never:**
- Do not touch any file other than the Code Map files, `tests/theme-roles.test.ts`, `e2e/smoke.spec.ts` and `content/architecture/arch-design-system.ts`.
- Do not touch `app/globals.css`. Entry 4 owns the practice workspace chrome, `--ide-accent`, chapter prose and links.
- Do not change the whiteboard's drawing colours, which come from `StylePanel` values. Do not change the editor syntax colours, layout, sizes or motion.
- Do not add tokens.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Accent CTA | Any of the 9 themes, `/problems`, `/git` or `/architecture`, the `.primary` "next" link | background is the theme's `--primary`, text is `--on-primary` | No error expected |
| Active tool | Any of the 9 themes, `/whiteboard`, the pressed tool | background is `--primary`, icon is `--on-primary` | No error expected |
| Chapter action | Any of the 9 themes, `/git/merge`, the end-of-chapter mark-read button | background is `--primary`. Once pressed, the done mark is `--success`. | No error expected |
| Guard | A `var(--green)` added to one of the six CSS files outside its categorical list | `npm run test` fails, naming the file, line, selector and token | Vitest failure |

</intent-contract>

## Code Map

Planning classified every use. Apply the decisions below; anything not listed follows the rules.

- `app/problems/problems.module.css`:
  - **Keep** the level scale `--beginner`/`--intermediate`/`--advanced` in `.page` (lines 2–4) and `.sheetRoot` (lines 891–893).
  - **Primary:**
    - `.search:focus-within` (border and its 18% ring).
    - `.primary` and its hover: pure fill with `--on-primary`, replacing `--sheet`.
    - `.ringFill`.
    - `.badge`, the active-filter count: `--on-primary` text.
    - The `var(--lvl, …)` fallbacks in `.facetCheck[aria-pressed] .box` and `.bar > span` become `var(--lvl, var(--primary))`.
    - `.clear`, a reset, not a delete: it keeps its dashed underline.
    - The focus rules at 779 and 951.
  - **Primary-soft:** `.facetBtn[aria-pressed]`, with ink text.
  - **Success:** `.checkDone`.
- `components/series/chapter.module.css` (git and architecture chapters):
  - **Primary:**
    - `.progress > div`, `.endBar > span`, `.ringFill` and `.toc li[data-state="past"] .tocNum`.
    - `.endBtn`: pure fill with `--on-primary`.
    - `.readBtn:hover` border.
    - `.crumbs a` and its hover border.
    - `.inlineToc a`, which also gets an underline.
    - Focus rules 230 and 945.
  - **Primary-soft with an inset primary bar:** `.railLink[aria-current="page"]` and `.toc li[data-state="now"] a`.
  - **Success:**
    - `.railDone`, and `.is-done .badge`.
    - `.endDone`: `--success-soft` background with a success border mix.
    - `.endMark` and `.readBtnOn .readTick`.
    - `.readBtnOn`: `--success-soft` background with a success border mix.
- `components/series/landing.module.css` and `app/architecture/architecture.module.css` (the two files are nearly identical):
  - **Keep** the `--lane-*` diagram colours in `.page`.
  - **Primary:** `.primary` (pure fill with `--on-primary`), `.bar > span`, and the focus rule.
  - **Success:** `.nodeDone` and `.cardDone`.
- `app/whiteboard/whiteboard.module.css`:
  - **Keep:** `.paperMargin` (the ruled paper's red margin), `.laser`, and `.swatch[data-value="none"]` (the "no colour" slash).
  - **Primary:**
    - The selection chrome: `.selection rect:first-child`, `.handle`, `.lockBadge`, and `.marquee`, whose fill stays a 10% mix.
    - `.editor`'s dashed border.
    - The hover borders on `.emptyStart button` and `.newBoard`.
    - `.blankBtn` and `.paperOpt` when pressed.
    - The `accent-color` on `.snapRow input` and the range.
    - The inset on `.actions button[aria-pressed]`.
    - The focus rule at 241.
  - **Primary fill with `--on-primary`, replacing the ink fill and sheet text:** `.tool[aria-pressed|aria-checked]`, `.islandBtn[aria-pressed|aria-expanded]` and `.seg button[aria-pressed]`.
  - **Primary-soft with ink text, replacing `--hl-mint`:** the hovers on `.iconRow button`, `.actions button`, `.menuItem` and `.exportGrid button`, and `.boardList li[data-current]`.
  - **Primary-soft background with a primary border mix and a primary icon:** `.shareCard`.
  - **Danger:**
    - `.danger` and `.boardDelete:hover`.
    - `.clearBtn`: text and border mix. On hover it gets a `--danger-soft` background with ink text.
  - **Neutral, leave as is:** the segmented `.tabs button[aria-selected]`.
- `components/practice/CodeEditor.tsx:148-175`:
  - Bracket match: `color-mix(in srgb, var(--mark) 60%, transparent)`.
  - `.cm-searchMatch`: `var(--mark)`.
  - `.cm-searchMatch-selected`: `var(--primary-soft)` with `outline: 1px solid var(--primary)`.
  - `.cm-selectionMatch`: `var(--primary-soft)`.
- `components/series/ChapterView.tsx:46-47` -- the `arrow-green` and `arrow-red` diagram markers are categorical. Leave them.
- `components/AppearancePicker.module.css` -- already on the roles, since entry 1. Only add it to the guard.
- `tests/theme-roles.test.ts` -- add the six CSS files to `CATEGORICAL_SELECTORS`:
  - problems: `.page` and `.sheetRoot`;
  - whiteboard: `.paperMargin`, `.laser` and `.swatch[data-value="none"]`;
  - landing and architecture: `.page`;
  - chapter and AppearancePicker: none.
  Add a case that `CodeEditor.tsx` has no `THEME_BLIND` match.
- `e2e/smoke.spec.ts:959+` -- reuse `THEME_ACCENTS`/`THEME_ON_ACCENTS` and the theme loop pattern.
- `content/architecture/arch-design-system.ts:108-119` -- the roles paragraph lists what still has to move. Move these sections into the moved list: problems, the whiteboard, the git and architecture pages, and the editor highlights. What is left is the `globals.css` rules and the topic pages. Keep the line counts at 229–230 true.

## Tasks & Acceptance

**Execution:**
- [x] `app/problems/problems.module.css` -- apply the Code Map -- the problems list follows the theme
- [x] `components/series/chapter.module.css`, `components/series/landing.module.css`, `app/architecture/architecture.module.css` -- apply the Code Map -- the git and architecture pages follow the theme
- [x] `app/whiteboard/whiteboard.module.css` -- apply the Code Map -- the whiteboard's chrome follows the theme; the drawing colours do not change
- [x] `components/practice/CodeEditor.tsx` -- move the match highlights onto the roles -- the editor's highlighter matches the theme
- [x] `tests/theme-roles.test.ts` -- extend the guard as mapped -- a regression names the file and line
- [x] `e2e/smoke.spec.ts` -- new test over all nine `THEME_ACCENTS` themes:
  - `/problems`, `/git` and `/architecture`: the `.primary` link's background and text;
  - `/whiteboard`: the pressed tool's background and icon colour;
  - `/git/merge`: the end button's background.
  Then in Lavender, press the chapter's read button and assert the done mark is `rgb(35, 107, 86)` -- the surface check
- [x] `content/architecture/arch-design-system.ts` -- update the paragraph -- How this is built stays true

**Acceptance Criteria:**
- Given any of the nine themes, when `/problems`, `/whiteboard`, `/git`, `/git/merge`, `/architecture` or an architecture chapter loads, then:
  - the primary buttons, progress fills, the active chapter in the rail and contents, focus rings and selection chrome use that theme's `--primary`;
  - no element in these files is painted with the fixed green, red or mint outside the categorical keeps.
- Given `npm run test:e2e`, when the a11y spec runs, then it passes with no new violations.

## Implementation Notes

- 2026-09-29: implemented by a fresh subagent from this plan. Every Code Map line was applied.
  - Fills that carry text are pure `var(--primary)` with `--on-primary`: the problems `.primary` and `.badge`, the landing and architecture `.primary`, the chapter `.endBtn`, and the whiteboard's pressed `.tool`, `.islandBtn` and `.seg` buttons.
  - The `#b7791f` fallback is gone from `--intermediate` (problems `.page`, `.sheetRoot`) and `--lane-build` (landing and architecture `.page`).
  - `CodeEditor.tsx`: bracket match `color-mix(in srgb, var(--mark) 60%, transparent)`, search match `--mark`, selected search match `--primary-soft` with a `--primary` outline, selection match `--primary-soft`.
  - `tests/theme-roles.test.ts` guards the six CSS files with the mapped categorical lists, and a new case fails on any `THEME_BLIND` token in `CodeEditor.tsx` with `file:line`.
  - `e2e/smoke.spec.ts`: one test over all nine `THEME_ACCENTS` themes checks the background and text of "Solve it" on `/problems`, "Start reading" on `/git` and `/architecture`, and the pressed Select tool on `/whiteboard`, plus the Finish "Mark as read" background on `/git/merge`. Then, in Lavender, it presses that button and checks that `.endMark` is `rgb(35, 107, 86)`.
  - `arch-design-system.ts`: the paragraph now lists problems, the whiteboard, the git guide, the architecture pages and the editor's match highlights as moved. What is left is the `globals.css` rules and the topic pages. The whiteboard count is updated to the file's length (1,598 after the review fixes). The mock count said 2,187 but the file has had 3,310 lines since before this epic, so it now says 3,310, which keeps lines 229–230 true. The `globals.css` count (9,319) was already stale, but entry 4 owns that file, so it is left.
- Judgement calls, each within the rules (text on a `-soft` tint is `--ink`, or `--ink-soft` where the file used `--pencil`):
  - Whiteboard: `.shareCard small` and, in the current board row, `.boardMeta` and the resting `.boardDelete` go from `--pencil` to `--ink-soft`. `--pencil` on `--primary-soft` is 3.64 in Blueprint, 3.97 in Kraft and 4.16 in Forest.
  - Whiteboard: the style panel's Delete now hovers to `--danger-soft` with ink text, like `.clearBtn`. Danger text on the new `--primary-soft` hover is 3.54 in Blueprint and about 4.1 in Paper, Forest and Lavender.
  - Chapter: the rail's read tick on the current chapter's `--primary-soft` row is `--ink`, because `--success` there is 4.04 in Paper. Elsewhere in the rail, the tick stays `--success`.
  - The `.crumbs a` link keeps its hover-only dashed border, as mapped. `.inlineToc a` gets the underline that entry 2 gave `.rowMain a`.
  - The whiteboard `.swatch[aria-pressed]` ring stays `--ink`: it is not a fixed colour, and an accent ring around a colour swatch would read as a swatch colour.
- Review fixes, applied by the same subagent at the coordinator's request:
  - Whiteboard: the selection chrome (outline, handles, lock badge, marquee, text box) reads a local `--wb-select`. It is `--primary` on the theme's own paper and `--wb-ink` on a board tint (`.app:not([data-tint="auto"])`), because the accent can vanish on a tint (Mono on Night 1.00:1).
  - Whiteboard: hovering × on the current board row gives ink text on `--danger-soft`. A pressed or checked tool's key hint is at opacity 0.85, which reads at least as well as it did on the ink fill.
  - Chapter: the primary hover border applies only to unread `.readBtn`s, so a read button keeps its success border.
  - `CodeEditor.tsx`: the match fills are translucent, so the selection layer shows through. Bracket match is `--primary` at 22%. Search match is `--mark` at 80% with a 35% ink outline. The selected match is `--primary` at 30% with a `--primary` outline. Selection match is `--primary` at 14%. `--ink` over each fill composited on `--sheet-2` is at least 4.72:1 in all nine themes. The active-line number is `--primary`, the selected autocomplete option is `--primary` with `--on-primary` text, and the error marker is `--danger`. The guard also rejects `--ide-accent`, `--ide-green` and `--ide-red` in the editor.
  - `tests/contrast.test.ts`: a new describe computes each `-soft` tint from the shared block's mix. It asserts `--ink` on all five tints and `--ink-soft` on `--primary-soft`, at 4.5:1 or better in all nine themes.
  - e2e: the nine-theme loop also checks the current rail link's accent bar, the header progress bar and the breadcrumb link on `/git/merge` and `/architecture/arch-build`. The read-state check runs in Forest, where success and green differ. It checks `.endMark` against `rgb(31, 111, 92)` and the current row's rail tick against the theme's `--ink`. A Lavender case checks that the editor's selected search match has an accent outline.
  - `arch-design-system.ts`: the not-yet list names the practice workspace's buttons (`--ide-accent`). The editor clause now covers the active line, autocomplete and error marks.
- Verification:
  - `npx vitest run tests/theme-roles.test.ts tests/contrast.test.ts`: 55 passed, then 57 after the review fixes.
  - `npm run check`: 224 unit tests.
  - `npm run build`.
  - `npm run test:e2e`: 87 passed, a11y included.
  - A planted `var(--green)` in `chapter.module.css` failed the guard as `components/series/chapter.module.css:814 .readBtn:hover uses var(--green)`. A planted `var(--hl-mint)` in `CodeEditor.tsx` failed it as `components/practice/CodeEditor.tsx:175 uses var(--hl-mint)`.
  - Screenshots on port 3200 in Lavender, Kraft and Night of `/problems`, `/problems/ex-two-sum` with an editor search, `/whiteboard` with a selection and the board menu, `/git`, `/git/merge` before and after marking it read, and `/architecture` show no green or red action colour in these files' chrome. Still green: the practice workspace's Run and Submit (`--ide-accent`) and the chapter prose stickies, both in `globals.css` (entry 4), and the diagram arrows (categorical).

## Plan Change Log

## Review Triage Log

### 2026-09-29 — Review pass
- verdicts: 26 findings — high 0, medium 11, low 13, false 2, maybe-false 0
- findings:
  - `[medium]` `[patch]` BH: the whiteboard selection chrome on `--primary` can vanish on a board tint that differs from the theme. Verified by script against `TINTS` in `app/whiteboard/Paper.tsx:287`: Mono on the Night tint is 1.00:1 (was 2.80), and Paper on Blueprint is 1.13 (was 1.55). Action: a local `--wb-select` is `--primary` on the theme paper and `--wb-ink` under `.app:not([data-tint="auto"])`, using the `data-tint` that `Board.tsx:1372` already sets. The selection outline, handles, lock badge, marquee and text box read it.
  - `[medium]` `[patch]` BH: the editor's search and bracket matches got fainter, and the opaque fills hide the selection. Verified: `drawSelection()` (`CodeEditor.tsx:259`) paints behind the text, and `--mark` on `--sheet-2` is 1.04 to 1.54:1. Action: translucent fills. The bracket is `--primary` at 22%. The search match is `--mark` at 80% with an ink 35% outline. The selected match is `--primary` at 30% with a `--primary` outline. The selection match is `--primary` at 14%. Ink over each fill is at least 4.72:1 in all nine themes.
  - `[medium]` `[patch]` BH: the e2e success check runs in Lavender, where `--success` and `--green` are both #236b56. Grouped with VG1. Action: the read state runs in Forest (`rgb(31, 111, 92)`).
  - `[low]` `[patch]` BH: the editor guard misses the aliases `--ide-accent`, `--ide-green` and `--ide-red`. Because of that, the active-line number (147), the selected autocomplete option (160) and the error marker (176) stay green and red. Verified at `globals.css:68-72`. Action: `--primary`, `--primary`/`--on-primary` and `--danger`, and the editor guard now rejects the aliases.
  - `[low]` `[patch]` BH: the chapter under-reports what is still green, and it is unclear who owns `--ide-accent`. Verified: the not-yet list omitted the practice buttons. Ownership is settled by entry 4's description, "practice and playground styles", which covers the `--ide-accent` consumers in `globals.css`. Action: the list names the practice workspace's buttons.
  - `[low]` `[defer]` BH: `arch-design-system.ts:229-233` is still false. Verified: globals.css has 9,575 lines, there are 16 modules, and the drawer file is 812 lines. All of this predates the change and none of it is asserted. Deferred, with EC9 and VG other 1.
  - `[low]` `[patch]` BH: the danger hover on the current board row is under 4.5:1 (3.53 in Blueprint). Grouped with EC2 and VG other 2. Action: `.boardList li[data-current] .boardDelete:hover` is ink on `--danger-soft`.
  - `[false]` `[reject]` BH: "Page layout" (`.islandBtn[aria-expanded]`) now looks like a selected tool. Before the diff it had the same ink fill as a pressed tool, so the resemblance is not new. The diff kept the grouping and swapped only the colour.
  - `[medium]` `[patch]` BH: e2e coverage falls short of the verify line (a problem page, an architecture chapter, links, progress, the active chapter). Grouped with VG3. Action: the nine-theme loop checks the rail's accent bar, the header progress and the breadcrumb link on `/git/merge` and `/architecture/arch-build`. A Lavender case checks the editor's selected search match outline on `/problems/ex-two-sum`.
  - `[false]` `[reject]` BH: plan metadata is inconsistent. The triage log is written in this step. Entry 2's a11y deferral lives in its own plan. The a11y criterion claims only that no new violations appear, not nine-theme coverage.
  - `[low]` `[patch]` BH: the pressed tool's `.toolKey` hint lost contrast (2.98 to 3.31:1 on the accent fill). It shows whenever a tool is pressed. Action: opacity 0.85 on pressed and checked tools, which gives 4.98 to 13.2:1.
  - `[medium]` `[patch]` EC: the selection chrome on tinted boards. Grouped with BH row 1.
  - `[low]` `[patch]` EC: the danger hover on the current board row. Grouped with BH row 7.
  - `[medium]` `[patch]` EC: the opaque marks cover the drawSelection layer. Grouped with BH row 2.
  - `[medium]` `[patch]` EC: search matches are barely visible in Kraft (1.04) and on Night's active line (1.02). Grouped with BH row 2.
  - `[low]` `[patch]` EC: `.readBtn:hover` (0,2,0) outranks `.readBtnOn`, so a read button shows an accent border on hover. Verified in `chapter.module.css`. Action: `.readBtn:not(.readBtnOn):hover`.
  - `[low]` `[reject]` EC: the allowlist is keyed by selector, so a new fixed colour inside `.page` passes. This is unlikely, and keying by property adds structure. Entry 2 rejected the same point.
  - `[medium]` `[defer]` EC: focus rings on `.endBtn`, the crumbs, `.inlineToc a` and the board menu buttons fall back to the global `:focus-visible`, which is `--red` (`globals.css:826`). This is pre-existing. The ticket's intent lists these files, not the global rule, and entry 4 owns `globals.css`. Deferred.
  - `[low]` `[reject]` EC: `ROLE_DECLARATION` does not run on `CodeEditor.tsx`. A CodeMirror theme object sets CSS properties, not custom properties, so a role declaration there is unlikely, and the fix adds a check.
  - `[low]` `[defer]` EC: the globals.css count 9,319 is stale. Grouped with BH row 6.
  - `[medium]` `[patch]` VG1 (pre-verified): the success check in Lavender cannot see a revert to green. Grouped with BH row 3. The Forest check also asserts that the current row's read tick is `--ink`.
  - `[medium]` `[patch]` VG2 (pre-verified): no test observes the contrast overrides (the ink rail tick, `--ink-soft` on the current board row and the share card, the danger hover). Action: `tests/contrast.test.ts` "text on the role tints" asserts `--ink` on all five `-soft` tints and `--ink-soft` on `--primary-soft` in all nine themes, and the Forest e2e checks the rail tick.
  - `[medium]` `[patch]` VG3 (pre-verified): the editor test is only a scan of the source text. Grouped with BH row 9. Action: a runtime Lavender check of the selected match outline.
  - `[low]` `[defer]` VG other 1: `tests/claims.test.ts` does not assert the CSS counts. Grouped with BH row 6. The missing claims case was already deferred from entry 1.
  - `[low]` `[patch]` VG other 2: the danger hover on the current board row. Grouped with BH row 7.
  - `[low]` `[patch]` Intent auditor (descriptive). It implements the file-scoped reading, with the accent answer to the ticket's unknown, as the plan decided from palette.md's "selected states" rule. Its divergences map to the rows above:
    - the editor's `--ide-accent` uses are patched;
    - e2e now checks links, progress and the active chapter, plus the problem page editor;
    - the practice chrome and prose links belong to entry 4.
    Hovers on `--primary-soft` extend the tint from selected rows to hover, with no harm named.

## Design Notes

A chapter's "read" is a done state, so it uses `--success`, as the interview book's read tiles do. Reading progress and the contents markers you have scrolled past are progress, so they use `--primary`. The whiteboard's segmented `.tabs` and the problems `.seg` keep their neutral sheet-and-shadow look: they are view switches, not selections of content. The ink-filled tool and style buttons are selections, so they take the accent.

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npx vitest run tests/theme-roles.test.ts tests/contrast.test.ts` -- expected: pass.
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: pass.
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build && PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run test:e2e` -- expected: all pass. e2e serves on 3100; never touch 3000.

**Manual checks (if no CLI):**
- Serve the build on port 3200, then screenshot `/problems`, `/problems/ex-two-sum` (after a search in the editor), `/whiteboard`, `/git/merge` and `/architecture` in Lavender, Kraft and Night. No green or red action colour remains.

## Auto Run Result

- **Summary:**
  - The problems list, the whiteboard, the git and architecture landings and chapters, and the code editor now paint with the entry-1 roles:
    - actions, progress, focus, the active chapter and the selection chrome take the theme's accent;
    - selections and hovers take `--primary-soft`;
    - search matches take `--mark`;
    - read, done and solved take `--success`, and destructive actions take `--danger`.
  - The whiteboard's pressed tool follows the accent. This settles the ticket's open question by palette.md's rule that selected states use the accent.
  - On a tinted board, the selection chrome follows the tint's ink.
  - These stay categorical: the problem levels, the architecture lanes, the whiteboard's ruled margin, laser and "no colour" slash, and `ChapterView.tsx`'s diagram arrows.
- **Files changed:**
  - `app/problems/problems.module.css`: CTA, badge, ring, filters, focus and the solved check.
  - `components/series/chapter.module.css`: the progress bars and rings, the current chapter in the rail and contents, the crumbs, the contents links, the end button, and the read and done states.
  - `components/series/landing.module.css`, `app/architecture/architecture.module.css`: CTA, progress, read marks and focus.
  - `app/whiteboard/whiteboard.module.css`:
    - the selection chrome, via `--wb-select`;
    - the pressed tools and style buttons;
    - hovers, the current board, the share card, focus and the danger actions.
  - `components/practice/CodeEditor.tsx`: the match fills, the active-line number, the autocomplete selection and the error marker.
  - `tests/theme-roles.test.ts`: the guard covers six more stylesheets. The editor must not use any `THEME_BLIND` token or `--ide-*` alias.
  - `tests/contrast.test.ts`: `--ink` on the `-soft` tints and `--ink-soft` on `--primary-soft`, in all nine themes.
  - `e2e/smoke.spec.ts`: accent checks across nine themes on `/problems`, `/git`, `/architecture`, `/whiteboard`, `/git/merge` and `/architecture/arch-build` (CTA, rail bar, progress, crumbs), a Forest read-state check, and a Lavender check of the editor's search.
  - `content/architecture/arch-design-system.ts`: which sections read the roles, and what is still to move.
- **Review findings:** 26 findings.
  - 10 entries went to patch and were applied: medium 5 (tinted-board selection, editor match fills, the success e2e check, e2e coverage, tint contrast tests) and low 5 (editor aliases, the chapter's not-yet list, the board-row danger hover, the tool key hint, the read-button hover).
  - 2 deferred: the global red focus ring, owned by entry 4, and the stale CSS size claims.
  - Rejected, with reasons in the triage log:
    - "Page layout" looks like a selected tool (false; the resemblance predates the change).
    - The plan metadata (false).
    - The allowlist is keyed by selector only (low; unlikely, and the fix adds structure).
    - `ROLE_DECLARATION` does not run on the editor (low; unlikely, and the fix adds a check).
- **Follow-up review:** recommended. Five medium entries were patched in one pass without a second lens run. Two risks are unverified:
  - On the editor's active line in Blueprint, ink over the selected search match is 3.55:1 and over the bracket match 4.01:1. This was measured by script; no axe run covers it.
  - The tinted-board selection and the new tints are checked by e2e colour assertions and token pairs, not by axe outside Paper.
- **Verification:**
  - `npx vitest run tests/theme-roles.test.ts tests/contrast.test.ts`: 57 passed.
  - `npm run check`: 226 unit tests.
  - `npm run build`.
  - `npm run test:e2e`: 88 passed, a11y included.
  - The implementer took screenshots on port 3200 in Lavender, Kraft and Night, and planted regressions that each failed the guard with the file and line.
- **Residual risks:**
  - The problem page's Run and Submit buttons (`--ide-accent`), the chapter prose links and stickies, and the global focus ring are still green or red. They live in `globals.css`, which entry 4 owns.
  - `--primary` on the editor's active-line gutter is 3.81:1 in Kraft and 3.99:1 in Blueprint. The old green was about the same, so this is not a regression.
  - a11y still runs only in Paper. This was deferred from entry 2 to epic 1 entry 3.
