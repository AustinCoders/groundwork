---
title: 'Theme contract: a new theme is one CSS block and one list entry'
type: 'feature'
ticket: '6'
created: '2026-09-29'
status: 'built'
baseline_revision: '1af74a73aea14e593df811a60f8bb02dceabb6aa'
route: 'full'
route_source: 'auto'
review: 'thorough'
review_source: 'auto'
lenses_ran: ['blind-hunter', 'edge-case-hunter', 'verification-gap', 'intent-alignment']
review_loop_iteration: 0
followup_review_recommended: true
context: ['{project-root}/_bmad-output/specs/spec-groundwork-overhaul/palette.md', '{project-root}/AGENTS.md']
warnings: ['oversized']
deferred: []
---

<intent-contract>

## Intent

**Problem:** Entries 1–4 put every section on the role tokens, but nothing yet makes a theme self-sufficient or keeps a new section on the roles:
- A theme block can forget a token.
- `THEME_ITEMS` can list a theme with no CSS.
- The guard covers only a hand-listed set of modules and source files.
- Modules still hold `rgba()` literals.
- The e2e accent tests read hand-kept colour maps.

**Approach:** Add a theme contract, made of these parts:
- Every theme block declares exactly Paper's colour tokens.
- `THEME_ITEMS` and the theme blocks match one to one, and a theme is one list entry because the type comes from the list.
- The guard scans every module, global rule and source file for fixed colours outside named categorical lists.
- Module CSS has no colour literals.
- The e2e accent tests iterate `THEME_ITEMS` and read each theme's colours from `app/globals.css`.
- The design-system chapter says what adding a theme takes.

## Boundaries & Constraints

**Always:**
- Failure messages name the file (and line or selector) and the token or theme.
- Derived colour tokens, those that are a `var()` of other colours, live in the shared `:root, [data-theme]` block, so every themed element, nested previews included, computes them from its own theme.
- Colour values in the nine theme blocks do not change.
- No comments. Tokens only.
- Prove the contract by adding a temporary tenth theme and three deliberate breaks, then reverting all of them before finishing.

**Never:**
- Do not change a palette value, a role, or a categorical decision made in entries 2–4.
- Do not change layout, fonts or motion.
- Do not keep a hand-written theme list or colour map anywhere in `tests/` or `e2e/`.
- Do not leave the tenth theme or any planted break in the tree.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Complete tenth theme | A copy of the Lavender block renamed `[data-theme="test"]` plus `{ value: "test", label: "Test" }` in `THEME_ITEMS` | `npm run test` passes, and the e2e accent tests run for ten themes and pass | No error expected |
| Theme missing a token | The tenth block without `--mark` | `npm run test` fails, naming `app/globals.css`, `[data-theme="test"]` and `--mark` | Vitest failure |
| List entry without CSS | `THEME_ITEMS` gains `test` with no block | `npm run test` fails, naming `lib/storage.ts`, `test` and the missing block | Vitest failure |
| Block without list entry | A `[data-theme="test"]` block with no `THEME_ITEMS` entry | `npm run test` fails, naming the block and `THEME_ITEMS` | Vitest failure |
| Button on a fixed colour | `.x { background: var(--green); }` in any module, including a new one | `npm run test` fails, naming the file, line, selector and `--green` | Vitest failure |
| Colour literal in a module | `rgba(0, 0, 0, 0.4)` or `#fff` in any `*.module.css` | `npm run test` fails, naming the file and line | Vitest failure |

</intent-contract>

## Code Map

- `app/globals.css`:
  - The Paper block `:root, [data-theme="light"]` (lines 5–99) holds 78 properties. The 8 theme blocks (156–716) hold 56 each: exactly the Paper tokens whose value contains a colour literal (hex, `rgb(a)`, `hsl(a)`, including the three `--shadow-*`).
  - The 22 Paper-only properties are the layout ones (`--bar-h`, `--side-w`, `--radius`), the fonts, and the `--ide-*` aliases at lines 61–76, which are `var()` of colours.
  - Move the `--ide-*` aliases into the shared `:root, [data-theme]` block (lines 101–118).
  - Delete `--ide-accent`; nothing has read it since entry 4.
  - Keep `--ide-red`, `--ide-yellow` and `--ide-green`, which the `.ed__tl--*` window dots use.
  - Add `--scrim: rgb(0 0 0)` to the shared block, as the one theme-independent overlay colour.
- **Module literals to replace:**
  - The scrims become `color-mix(in srgb, var(--scrim) N%, transparent)` with today's alpha:
    - `components/Modal.module.css:21` (40%);
    - `components/SiteDrawer.module.css:10` (32%);
    - `components/series/chapter.module.css:910` (35%);
    - `app/whiteboard/whiteboard.module.css:935` (35%) and `:1112` (28%).
  - `app/whiteboard/whiteboard.module.css:89` `.laserGlow` becomes `color-mix(in srgb, var(--c-red) 28%, transparent)`, matching `.laser`. It joins whiteboard's categorical list.
- `lib/storage.ts:200-213`:
  - Make `THEME_ITEMS` a `const` list with `satisfies`, and derive `export type ThemeValue = (typeof THEME_ITEMS)[number]["value"]`.
  - Keep the consumers compiling: `components/ThemeFontPicker.tsx:57`, `components/AppearancePicker.tsx:33`.
  - `lib/themeInitScript.ts` needs no list.
- `tests/theme-contract.test.ts` (new). Parse `app/globals.css` with the helpers pattern from `tests/contrast.test.ts` (`blocks()`, `declaration()`).
  - (a) The `THEME_ITEMS` values match the `[data-theme="…"]` names one to one. Paper is found through `[data-theme="light"]` in its combined selector.
  - (b) Colour tokens are Paper's properties whose value contains a colour literal. Each theme block declares exactly that set; report missing and extra tokens by theme and name.
  - (c) No Paper-only property references a colour token through `var()`. This keeps derived colours in the shared block.
- `tests/theme-roles.test.ts`:
  - Find modules with a recursive `readdirSync` of `app/` and `components/` for `*.module.css`. `CATEGORICAL_SELECTORS` becomes per-file allowed lists, defaulting to `[]`. `components/AppHeader.module.css` is then covered with none.
  - The role-declaration check runs on every module.
  - Add a colour-literal check on every module: `#hex`, `rgb(`, `rgba(`, `hsl(` and `hsla(`, reporting `file:line`.
  - `THEME_BLIND` gains `c-green-soft`, `c-red-soft`, `c-yellow-soft`, `c-orange-soft` and `warn-bg`. Their only uses, `.warn` and `.interview-body .pill.r`, are already allowed.
  - Scan the component rules of `app/theme-bridge.css` as well, skipping its `:root` and `@theme` token blocks.
  - Scan every `.ts`/`.tsx` under `app/`, `components/` and `lib/` for `THEME_BLIND`, with the existing marker-fill allowance for ReaderShell and ChapterView as the only exceptions.
- `e2e/themes.ts` (new):
  - Read `app/globals.css` with `fs`, and import `THEME_ITEMS` from `../lib/storage`.
  - Export `THEMES` (the values) and `themeColour(theme, token)`. It returns the computed-style form, `rgb(r, g, b)`, from that theme's block, falling back to Paper's.
- `e2e/smoke.spec.ts:901-1180`:
  - Delete `THEME_ACCENTS` and `THEME_ON_ACCENTS`. Every accent loop iterates `THEMES`, including the review, book and mock test that today picks four themes.
  - Every hard-coded state colour reads `themeColour`: Lavender success and danger, Forest success, Paper caution, the picker's chips and the `colourChannels` accent.
  - Tests that need a theme where success ≠ green (or danger ≠ red) keep their named theme but read the value.
- `content/architecture/arch-design-system.ts:300-330`:
  - Rewrite the cost note to say what adding a theme takes and what fails if something is missed:
    - one `[data-theme]` block restating the colour tokens, the roles included;
    - one `THEME_ITEMS` entry;
    - optional additions to the dark-theme override selectors.
  - Keep every stated count true: the number of colour tokens and the contrast check counts.

## Tasks & Acceptance

**Execution:**
- [x] `app/globals.css` -- move the derived `--ide-*` aliases to the shared block, drop `--ide-accent`, add `--scrim` -- themes are self-sufficient and previews compute their own colours
- [x] `components/Modal.module.css`, `components/SiteDrawer.module.css`, `components/series/chapter.module.css`, `app/whiteboard/whiteboard.module.css` -- replace the colour literals -- module CSS is literal-free
- [x] `lib/storage.ts` -- derive `ThemeValue` from `THEME_ITEMS` -- a theme is one list entry
- [x] `tests/theme-contract.test.ts` -- list ↔ blocks, token parity, derived-colour placement -- the contract
- [x] `tests/theme-roles.test.ts` -- a guard over every module, source file and bridge rule, the literal check, the soft aliases -- no section can bypass the roles
- [x] `e2e/themes.ts`, `e2e/smoke.spec.ts` -- read theme colours from CSS and iterate `THEME_ITEMS` -- a new theme is tested without editing tests
- [x] `content/architecture/arch-design-system.ts` -- the cost note -- How this is built says what a theme costs

**Acceptance Criteria:**
- Given the contract in place, when a complete tenth theme is added as one block and one list entry, then `npm run check`, `npm run build` and `npm run test:e2e` pass with no other edit, and the accent tests report the tenth theme.
- Given the nine themes, when the contract lands, then every page renders the same colours as before: the same e2e values, and screenshots in Paper, Night and Lavender show no change apart from nested theme previews.

## Implementation Notes

- **Counts after the move:** the Paper block holds 63 custom properties, 56 of them colour tokens. Every other theme block holds exactly those 56. The shared `:root, [data-theme]` block holds 30: 15 tints, 14 `--ide-*` aliases and `--scrim`. The chapter says 63 and 56; its contrast counts (90, 63, 54) are unchanged.
- **Gate on the finished tree:** `npm run check` passed, with 262 Vitest tests. The three focused files passed 93 tests. `npm run build` passed, and `npm run test:e2e` passed 92 of 92 on port 3100.
- **Tenth theme** (a Lavender copy `[data-theme="test"]` plus `{ value: "test", label: "Test" }`):
  - `npm run check` passed, `npm run build` passed, and `npm run test:e2e` passed 92 of 92.
  - To show the loops reach the tenth theme, the source `--primary` of `test` was changed after the build, so it no longer matched the served CSS. All five accent loops and the picker then failed at `test` and at no earlier theme: `Error: test`, `/review in test`, `/notes in test`, `/problems in test`, and the picker at `radio.nth(9)`. Each reported `Expected: "rgb(1, 2, 3)" Received: "rgb(106, 63, 184)"`. The source was then restored.
- **Breaks, one at a time, each reverted:**
  - No `--mark` in the tenth block: `app/globals.css:716 [data-theme="test"] is missing --mark`. contrast.test.ts also failed, with `[data-theme="test"] is missing --mark`.
  - Entry kept, block dropped: `lib/storage.ts:210 THEME_ITEMS lists "test", but app/globals.css has no [data-theme="test"] block`. contrast.test.ts's four theme counts also failed.
  - Block kept, entry dropped: `app/globals.css:716 [data-theme="test"] has no THEME_ITEMS entry in lib/storage.ts; add { value: "test", label } there`.
  - `var(--green)` on the back button's hover in `components/AppHeader.module.css`, a module the guard did not cover before: `components/AppHeader.module.css:28 .head :global(.back-btn:hover) uses var(--green); use a role token instead`.
  - A new `components/Planted.module.css` with `var(--green)`, `rgba(0, 0, 0, 0.4)` and `#fff`: `components/Planted.module.css:2 .planted uses var(--green)…`, `…:3 uses the colour literal rgba(…` and `…:4 uses the colour literal #fff…`.
  - `--ide-bg: var(--sheet-2)` added back to Paper: `app/globals.css:60 :root, [data-theme="light"] derives --ide-bg from var(--sheet-2); declare it in the shared :root, [data-theme] block`.
- **Screenshots:** the baseline `1af74a7` and this tree were built side by side and served on ports 3300 and 3301. Chromium took 1280×900 shots with reduced motion, a fixed clock and no outside network, in Paper, Night and Lavender. The pages were home, notes, closures, practice, problems, two-sum, whiteboard, review, progress, mock, interview, interview/r3, git/merge, the design-system chapter and level/js. The shots also covered the site menu, the home menu's theme swatches, and the whiteboard's shortcut dialog with its `::backdrop`.
  - Every page matched pixel for pixel except the design-system chapter, whose header now reads "14 min read" instead of "13 min read" because its text is longer.
  - The two menus differ by 0 to 175 pixels from one run to the next, even between two shots of the same server, so that is noise. Some runs across the two builds matched exactly.
  - The whiteboard dialog's `::backdrop` matched exactly in all three themes.

- Deviations from the Code Map, each within the intent:
  - `app/problems/problems.module.css:903` held a fifth scrim, `rgba(0, 0, 0, 0.35)`, that the Code Map did not list. It now uses `color-mix(in srgb, var(--scrim) 35%, transparent)`, since the literal check covers every module.
  - `tests/contrast.test.ts` asserted exactly nine themes in four places. It now compares against `THEME_ITEMS.length`, because a tenth theme would otherwise fail `npm run test` and break the "no other edit" acceptance.
  - `components/ThemeFontPicker.tsx` passes `[...THEME_ITEMS]`, because the `as const` list is readonly and `DropdownProps.items` takes a mutable `DropdownItem[]`.
  - In `e2e/smoke.spec.ts`, the picker test now checks every theme's swatch in list order, not only Paper and Lavender. The two page reads of `--ink` became `themeColour(theme, "--ink")`.
  - `THEME_BLIND` keeps `ide-accent` even though the alias is gone, so it cannot come back.
- Matrix audit (coordinator): row 1 (a complete tenth theme passes) had only the manual proof. So `tests/theme-contract.test.ts` gained a fixture case, "accepts a complete new theme added as one block and one list entry". A base theme plus a complete `test` block and its list entry give no list, token or derived-colour mismatch. Rows 2–6 are covered by the fixture cases and the whole-tree guard.

- Review fixes, applied by the coordinator. The implementing subagent stalled after receiving the patch list, with no edits made.
  - `app/globals.css` gains a `::backdrop { --scrim: rgb(0 0 0); }` rule.
  - `tests/colour-literal.ts` (new) is shared by the module check, the contract and the claims test. It covers hex, the colour functions and the 148 named colours, and ignores strings and `url()`. The module check reads declaration values only.
  - `tests/theme-contract.test.ts`:
    - `color-scheme` on every theme block;
    - duplicate `THEME_ITEMS` values and the icon-and-name label shape;
    - undeclared `var(--scrim)`/`var(--ide-…)` reads in modules and global rules;
    - a fixture case for each, with the complete tenth theme now setting `color-scheme`.
  - `e2e/themes.ts`: `themeColour(theme: ThemeValue, …)` throws when the block or the token is missing. Paper's unused fallback is gone.
  - `e2e/smoke.spec.ts` pins success ≠ green (Forest) and danger ≠ red (Lavender) before the state checks, and types the margin-line helper.
  - `lib/storage.ts`: `savedTheme()` validates against `THEME_ITEMS`.
  - `arch-design-system.ts`:
    - It says what the source scan does check.
    - It says the global backdrops keep their own tints and `--scrim` is also declared on `::backdrop`.
    - It says the chapter is the one hand-kept description.
    - It lists the contract's new failures.
  - `tests/claims.test.ts` asserts the chapter's 63 and 56 against `globals.css`. The theme count is not asserted, so a complete tenth theme still passes every test.
- Verification after the review fixes:
  - `npm run check`: 269 tests.
  - `npm run build`.
  - `npm run test:e2e`: 92 passed.
  - The four affected unit files: 112 passed.

## Plan Change Log

## Review Triage Log

### 2026-09-30 — Review pass
- verdicts: 45 findings — high 0, medium 10, low 32, false 3, maybe-false 0
- findings:
  - `[medium]` `[patch]` BH: `::backdrop` loses its dimming in the browsers Next 16 still supports. Verified: Next 16 supports Chrome 111+, Firefox 111+ and Safari 16.4+, but a backdrop inherits from its dialog only from Chrome 122, Firefox 120 and Safari 17.4. Action: a `::backdrop { --scrim: rgb(0 0 0); }` rule next to the shared block. Grouped with EC1.
  - `[low]` `[patch]` BH: "Nothing else is edited" is untrue of the chapter, and its counts go unchecked. Verified: the table, the heading and the per-theme check counts are hand-kept. Action: the cost note says this chapter is the one hand-kept description. `tests/claims.test.ts` asserts the 63 and 56 counts from `globals.css`. The theme count is not asserted, because that would fail a complete tenth theme and break the ticket's Verify.
  - `[medium]` `[patch]` BH: the contract does not check `color-scheme` or membership of the dark overrides. Verified for `color-scheme`. Action: `schemeMismatches` fails a theme block with none, and there is a fixture case. Joining the dark overrides stays optional by design, and the chapter says so. Grouped with VG1.
  - `[low]` `[reject]` BH: the literal check skips the global rules, and three global scrims were not moved. The intent limits the literal ban to module CSS. The chapter now says the global backdrops set their own tints.
  - `[low]` `[patch]` BH: the chapter says "the arrow markers are the only fixed colours allowed in source", which is false. Verified: the source scan looks for tokens, not hex. Action: reworded to say what the scan checks, and which source files keep their own colours.
  - `[medium]` `[patch]` BH: both literal patterns miss named colours and newer colour functions. Verified. Action: a shared `tests/colour-literal.ts` covers hex, `rgb`/`hsl`/`hwb`/`lab`/`lch`/`oklab`/`oklch`/`color()` and the 148 CSS named colours. The module check matches declaration values only and ignores strings and `url()`. Fixture lines were added for `white`, `oklch()`, a colour-named selector, `url(#fade)` and a font string. The contract uses the same pattern. Grouped with EC5, EC11, EC12 and VG3.
  - `[low]` `[reject]` BH: `--scrim` itself is not guarded. Using it as a text colour is unlikely, and the fix adds a new allow-list.
  - `[low]` `[reject]` BH: `e2e/themes.ts` rejects space-separated `rgb()` and other formats. It fails loudly with the theme and token named, and every theme block uses hex today.
  - `[low]` `[patch]` BH: `themeColour` is untyped and falls back to Paper silently. Verified. Action: `theme` is typed `ThemeValue`, and the helper throws when the block or the token is missing. Grouped with EC3.
  - `[false]` `[reject]` BH: the bridge's derived aliases break nested previews. No Tailwind utility class is used in app or components (entry 1's review), so nothing renders those aliases in a nested theme.
  - `[low]` `[reject]` BH: the e2e loops grow inside single tests. Today's longest test takes 8.3s, well inside the timeout. Splitting it into one test per theme is a restructure with no present defect.
  - `[low]` `[patch]` BH: the named-theme state tests no longer pin their premise. Action: they assert Forest success ≠ green and Lavender danger ≠ red, including in the entry-3 Forest read check.
  - `[low]` `[patch]` BH: nothing checks `THEME_ITEMS` label shape or duplicate values. Verified: `plain()` strips the first word. Action: `itemMismatches` fails a duplicate value, or a label that is not an icon, a space and a name, with `lib/storage.ts:line`.
  - `[low]` `[patch]` BH: a saved theme is never checked against the list. Action: `savedTheme()` returns a stored value only when `THEME_ITEMS` has it. Grouped with EC17.
  - `[low]` `[reject]` BH: plan and write-up gaps. The triage log is written in this step. The "15 tints" wording and the three parsers are cosmetic. The `.laserGlow` change was asked for by the Code Map, and a fix would edit the plan.
  - `[medium]` `[patch]` EC: the `::backdrop` inheritance. Grouped with BH1.
  - `[low]` `[reject]` EC: `themeColour` formats. Grouped with the BH row; the failure is loud.
  - `[low]` `[patch]` EC: a typo in the theme name falls back to Paper. Grouped with the BH `themeColour` row.
  - `[low]` `[reject]` EC: a token declared twice in one block. This is unlikely, and prettier plus review would see it.
  - `[medium]` `[patch]` EC: the contract's colour pattern misses named colours and newer functions. Grouped with the BH literal row.
  - `[low]` `[reject]` EC: a theme restates a colour token as `var()`. The contrast test and `themeColour` both fail loudly on a non-hex value.
  - `[medium]` `[patch]` EC: `color-scheme`. Grouped with BH3.
  - `[false]` `[reject]` EC: colours derived in plain `:root` or the bridge. Same as the BH bridge row: nothing renders them.
  - `[low]` `[reject]` EC: a second shared block. Unlikely.
  - `[low]` `[reject]` EC: a Paper selector that lists two theme names. Unlikely.
  - `[medium]` `[patch]` EC: named colours and newer functions in modules. Grouped with the BH literal row.
  - `[low]` `[patch]` EC: a hex-like id or `url(#id)` false positive. Covered by the value-only matching and `url()` stripping in the literal row.
  - `[low]` `[reject]` EC: scan source and bridge files for literals. The intent limits the literal ban to module CSS.
  - `[low]` `[reject]` EC: paint properties inside token blocks. Unlikely; entry 4 rejected the same point.
  - `[low]` `[reject]` EC: Tailwind class aliases such as `bg-hl-mint`. No Tailwind classes are used, so this is unlikely.
  - `[low]` `[reject]` EC: Windows path separators. The repo and CI run on macOS and Linux, so this is unlikely.
  - `[low]` `[patch]` EC: `savedTheme` validation. Grouped with the BH row.
  - `[low]` `[patch]` EC: the claims test does not cover 63 and 56. Grouped with BH2.
  - `[low]` `[reject]` EC: the `.laserGlow` colour change. The Code Map asked for it (to match `.laser`), and a fix would edit the plan.
  - `[false]` `[reject]` EC: bridge aliases in nested previews. Same refutation as the BH bridge row.
  - `[low]` `[reject]` EC: `content/` chapters are not scanned. Chapter diagrams are content styles, and the intent covers modules and global component rules.
  - `[low]` `[patch]` EC: the chapter's source claim. Grouped with BH5.
  - `[low]` `[patch]` EC: "nothing else edited", the missing `color-scheme` check and the nine-row table. Grouped with BH2 and BH3.
  - `[medium]` `[patch]` VG1 (pre-verified): no `color-scheme` check. Grouped with BH3.
  - `[medium]` `[patch]` VG2 (pre-verified): nothing checks that `--scrim` or the moved `--ide-*` aliases exist. Action: the contract fails any `var(--scrim)` or `var(--ide-…)` read without a fallback, in a module or a global rule, that `globals.css` does not declare. There is a fixture case.
  - `[medium]` `[patch]` VG3 (pre-verified): named colours pass the module literal check. Grouped with the BH literal row.
  - `[low]` `[patch]` VG other 1: the chapter's source claim. Grouped with BH5.
  - `[low]` `[patch]` VG other 2: hand-kept theme references. Grouped with BH2. `ArchitectureView`'s "Nine themes" note stays hand-kept, which the chapter now says.
  - `[low]` `[reject]` VG other 3: `.laserGlow`. Grouped with the EC laser row.
  - `[low]` `[patch]` Intent auditor (descriptive): it implements A1 with derived colours moved to the shared block, B1 and B3, C1 and C3′, D between D1 and D2 (now nearer D2), E1, F1 and G1. Probes confirm the real tree fails and passes as the Verify asks. Its divergences map to the rows above: duplicates, named colours, the premise pins and the chapter overclaims are patched. The alias route (`var(--beginner)` in an allowed `.page`) and the long allowed list are the inherited per-selector design, which entry 2 rejected changing.

## Design Notes

A theme block restates only colours; anything computed from colours lives in the shared block. The shared block's `:root, [data-theme]` selector matches every element that carries a theme, so a preview card with `data-theme="kraft"` inside a Night page computes Kraft's editor colours instead of inheriting Night's. That is the difference between a theme that works on `<html>` and one that works anywhere.

The e2e helper reads the same file the browser does. When a palette value changes or a theme is added, the expected colours follow without touching a test.

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npx vitest run tests/theme-contract.test.ts tests/theme-roles.test.ts tests/contrast.test.ts` -- expected: pass.
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: pass.
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build && PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run test:e2e` -- expected: all pass. e2e serves on 3100; never touch 3000.

**Manual checks (if no CLI):**
- The tenth-theme proof:
  - Add a Lavender-copy `test` theme and its list entry. Run `npm run test`, `npm run build` and the accent e2e tests; all should pass with ten themes.
  - Then, one at a time, drop its `--mark`, drop its block but keep the entry, and plant `var(--green)` in a module button. Each should fail with the file and token named.
  - Revert everything, and record the outputs in Implementation Notes.

## Auto Run Result

- **Summary:** a new theme is now one `[data-theme]` block and one `THEME_ITEMS` entry, and tests enforce it.
  - Every theme block declares exactly Paper's 56 colour tokens and a `color-scheme`.
  - `THEME_ITEMS` and the blocks match one to one, with unique values and icon-and-name labels, and `ThemeValue` comes from the list.
  - Derived colours (`--ide-*`, the tints and `--scrim`) live in the shared block, so nested previews compute their own.
  - The guard finds every module, global rule, bridge rule and source file by itself.
  - Module CSS holds no colour literal, named colours included.
  - The e2e accent tests iterate `THEME_ITEMS` and read expected colours from `globals.css`.
  - The design-system chapter says what a theme costs.
- **Files changed:**
  - `app/globals.css`: the `--ide-*` aliases move to the shared block, `--ide-accent` is dropped, and `--scrim` is added, also on `::backdrop`.
  - Modal, SiteDrawer, the chapter, problems and whiteboard modules: backdrops mix `--scrim`, and the laser glow uses `--c-red`.
  - `lib/storage.ts`: `THEME_ITEMS` is the source of `ThemeValue`, and `savedTheme()` validates against it. `ThemeFontPicker.tsx` passes a mutable copy of the list.
  - `tests/theme-contract.test.ts` (new): the contract.
  - `tests/colour-literal.ts` (new): the shared literal pattern.
  - `tests/theme-roles.test.ts`: the whole-tree guard and the literal check.
  - `tests/contrast.test.ts`: theme counts follow `THEME_ITEMS`.
  - `tests/claims.test.ts`: the chapter's token counts.
  - `e2e/themes.ts` (new) and `e2e/smoke.spec.ts`: the colours come from CSS, the loops iterate `THEMES`, and the premises are pinned.
  - `content/architecture/arch-design-system.ts`: the contract, the counts and the cost note.
- **Review findings:** 45 in total.
  - 9 entries went to patch, all applied:
    - medium 4: `::backdrop`, `color-scheme`, named-colour literals, `--scrim`/`--ide-*` existence;
    - low 5: the chapter and claims, `themeColour` typing, the premise pins, the list shape, `savedTheme` validation.
  - None deferred.
  - 21 rejected, each with its reason in the triage log: 3 false (the bridge aliases have no Tailwind consumer) and 18 low. The low ones were out of the intent's scope, unlikely, loud failures, or fixes that would edit the plan.
- **Follow-up review:** recommended. Four medium entries were patched in one pass, by the coordinator after the implementer stalled, without a second lens run. The unverified risk is the new value-only literal scanner: it has fixture cases, but it could still over-match a colour word in some future module value. Today it passes on all 16 modules.
- **Verification:**
  - The implementer's tenth-theme proof: a Lavender copy with its entry passed check, build and 92 e2e, and each planted break failed naming the file and token.
  - After the review fixes: `npm run check` (269), `npm run build`, `npm run test:e2e` (92).
  - Pixel comparison against `1af74a7` in Paper, Night and Lavender: identical apart from the design-system chapter's read time.
- **Residual risks:**
  - The laser glow now follows each theme's red.
  - The global-rule backdrops keep their own `rgba()`.
  - The chapter's theme table and per-theme check counts are hand-kept.
  - a11y runs only in Paper, deferred from entry 2.
