---
title: 'Role tokens in all nine themes (tracer)'
type: 'feature'
ticket: '1'
created: '2026-09-28'
status: 'built'
baseline_revision: '21b3054b7df1a1d913e67553fad1609c73dc7a8b'
route: 'full'
route_source: 'auto'
review: 'thorough'
review_source: 'auto'
lenses_ran: ['blind-hunter', 'edge-case-hunter', 'verification-gap', 'intent-alignment']
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/specs/spec-groundwork-overhaul/palette.md', '{project-root}/AGENTS.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Every theme uses green for actions, the interview book uses red, and one yellow is the highlighter everywhere. There are no per-theme role tokens, and `--primary` means ink, green or red depending on the file.

**Approach:** Define the approved role colours (palette.md) as tokens in all nine theme blocks, make `--primary` the theme's accent everywhere, assert every role pair at 4.5:1 in the contrast test, and prove it on the home page and the theme picker.

## Boundaries & Constraints

**Always:**
- Use palette.md's values exactly.
- Name the roles as follows:
  - `--primary`, `--on-primary` and `--primary-soft` for the accent and its text and tint;
  - `--mark` for the highlighter;
  - `--success`, `--danger`, `--caution` and `--info` for states, each with a `-soft` tint.
- Soft tints are `color-mix` over `--sheet`, defined once in the shared `:root, [data-theme]` block.
- No comments in source. Theme tokens only.

**Never:**
- Do not rename or change existing tokens (`--green`, `--red`, `--c-*`, `--hl-*`, paper, ink or the editor colours). Later entries move their consumers.
- Do not name a global token `--accent`. Home, Progress and SiteDrawer set it locally to a topic's colour, and Home, Mock and the interview book already style actions with `var(--primary)`.
- Do not touch module CSS other than `app/home.module.css` lines 4–5 and `components/AppearancePicker.module.css`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Theme picked | `data-theme="lavender"` | Home's Start button is #6a3fb8 with #faf7fe text | No error expected |
| No saved theme | no attribute, light OS | `:root` roles apply (Paper #2451b3) | No error expected |
| Theme missing a role | a block without `--mark` | contrast test fails naming the theme and token | Vitest failure message |

</frozen-after-approval>

## Code Map

- `app/globals.css:5-90` (`:root`, the Paper theme) and `:142-636` (the eight `[data-theme]` blocks) -- add the 7 role values to each, after `--c-grey`.
- `app/globals.css:92-104` -- the shared block of `--c-*-soft` mixes. Add `--primary-soft` and the four state `-soft` mixes, in the same pattern.
- `app/theme-bridge.css:1-21,96-104` -- shadcn aliases.
  - Remove `--primary: var(--ink)`.
  - Set `--primary-foreground: var(--on-primary)`, `--accent: var(--primary-soft)`, `--ring: var(--primary)` and `--destructive: var(--danger)`.
  - Move the checked select item from mint to `--primary-soft`/`--ink`.
- `app/home.module.css:4-5` -- delete the local `--primary` and `--on-primary`. The rest of the file already uses `var(--primary)`.
- `components/AppearancePicker.tsx:42-49`, `.module.css:46-95` -- the theme cards are live previews (`data-theme` on `.swatch`). Add a `--primary` chip beside the ink line. Move the selected border and focus outline from `--green` to `--primary`.
- `tests/contrast.test.ts` -- reuse `blocks()`, `declaration()`, `hexToRgb()` and `contrast()`. Add a describe over the 9 blocks with `--primary` and `--sheet`, asserting 4.5:1 for primary and the four states against the sheet, on-primary against primary, and ink against mark.
- `content/architecture/arch-design-system.ts:59-64,244-262` -- states 65 properties, 43 overrides, 90 checks and 43 colours. Recount with a script, add a paragraph on the role tokens and the single meaning of `--primary`, and add the role checks.

## Tasks & Acceptance

**Execution:**
- [x] `app/globals.css` -- add the 7 role tokens to `:root` and the 8 theme blocks, and the 5 soft mixes to the shared block -- one source of truth per theme
- [x] `app/theme-bridge.css` -- map the shadcn aliases onto the roles, and move the select states off mint -- removes the ink `--primary` and the mint selection
- [x] `app/home.module.css` -- delete the local `--primary` and `--on-primary` -- the tracer page takes the theme accent
- [x] `components/AppearancePicker.tsx`, `components/AppearancePicker.module.css` -- show the accent on each theme card; selected and focus states use `--primary` -- the picker previews the character of each theme
- [x] `tests/contrast.test.ts` -- add the role-pair describe -- a theme missing or failing a role fails in Vitest
- [x] `content/architecture/arch-design-system.ts` -- recount the stated numbers and describe the roles -- How this is built stays true

**Acceptance Criteria:**
- Given any of the nine themes, when `/` loads, then the Start button and the stat accents use that theme's palette.md accent, with its on-accent text.
- Given the menu's theme picker, when it is open, then each card shows its own theme's accent, and the selected card's border is the current theme's accent.
- Given `npm run test`, when a theme block lacks a role or a role pair is under 4.5:1, then `tests/contrast.test.ts` fails naming the theme selector and token.

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npx vitest run tests/contrast.test.ts` -- expected: all pass, including the new role describe with 9 themes.
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: typecheck, lint, comments, format, spell and tests pass.
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build` -- expected: succeeds.

**Manual checks (if no CLI):**
- Serve the build on port 3200 (never 3000). Screenshot `/` in all nine themes (localStorage `jsnotes:theme`). Each Start button matches palette.md.

## Implementation Notes

- 2026-09-28: implemented by a fresh subagent from this plan.
  - The role tokens went into all 9 blocks with palette.md's values. The 5 `-soft` mixes are 16% over `--sheet`.
  - The theme-bridge aliases moved onto the roles. Home's local `--primary` and `--on-primary` were deleted.
  - Each theme picker card shows a `--primary` chip.
  - `tests/contrast.test.ts` gained the "role colours" describe, with 63 checks.
  - `arch-design-system.ts` was recounted by script: 78 root properties, 56 overrides per theme, 63 role checks and 54 categorical checks.
- Deviations, each within the frozen intent:
  - (a) The Paper block's selector became `:root, [data-theme="light"]`. Before, the Paper card showed the current theme whenever another theme was active; now it shows Paper.
  - (b) The test selects theme blocks by `--sheet` and `--ink`, not by `--primary`, so a theme that forgets `--primary` fails by name instead of dropping out of the count.
  - (c) The four state tints use 16%, the same as `--primary-soft`. palette.md gives no mix for them.
- Knock-on: the global shadcn `--accent` is now the accent tint instead of mint. Only `home.module.css:2012` falls back to it.
- The subagent ran the contrast test, `npm run check` and the build. Screenshots of Home and the picker in 9 themes matched palette.md. It could not run e2e because the Bash safety check was unavailable.
- Matrix audit: rows 1 and 2 had no automated test. The orchestrator added the "home page's primary action takes each theme's accent" test to `e2e/smoke.spec.ts`. It checks the default Paper accent, then the Start button's background in all nine themes. Row 3 is covered by the role describe, whose failure messages name the selector and token (checked by breaking themes on purpose).

- Review pass 1 patches, applied by the same implementation subagent:
  - The dropdown's selected option and its check moved to `--primary-soft`/`--ink` and `--primary`.
  - The bridge's `--accent` now points at `--primary`, which restores the home `.round` glow.
  - The chapter's role section was rewritten as a role/use/replaces table. It states the rules and says what has not moved yet.
  - The home e2e test also checks the on-primary text. A new e2e test covers the picker chips (Paper inside Night, and Lavender) and the checked border.
  - The subagent cleared a corrupt Turbopack font entry from `.next/cache/turbopack` before rebuilding. The dev cache was untouched.
- Verification after the patches: `npm run check` (175 unit tests), `npm run build` and `npm run test:e2e` (85 passed).

## Plan Change Log

## Review Triage Log

- Pass 1 (2026-09-28). Verdicts: high 0, medium 2, low 5, false 2, maybe-false 0. Some rows below record rejected findings.
  - **medium** · VG, EC1, EC8. Verified: `globals.css:1950` `.dd__opt[aria-selected="true"]` is still `--hl-mint`/`--sticky-mint-fg`. It comes later than the bridge rule at the same specificity, so a focused checked option is mint. `.dd__opt-check` is `--green`. Route **patch**: both move to `--primary-soft`/`--ink` and `--primary`.
  - **medium** · VG, BH. Verified: nothing tests acceptance criterion 2 (picker chip, Paper preview inside another theme, selected border) or the `--on-primary` text in criterion 1. Route **patch**: add a `color` assertion to the home test, and add a picker test in Night that checks the Paper and Lavender chips and the checked border.
  - **low** · BH, EC2. Verified: the global `--accent` is now `--primary-soft`. So `var(--accent, var(--primary))` in `home.module.css:2010` never falls back, and the `.round` glow is 16% of a 16% tint. Before, it was 16% of mint. Route **patch**: point the bridge's `--accent` at `--primary`, which is what every module consumer of `var(--accent)` treats it as, and fix the chapter sentence.
  - **low** · BH (three findings: the chapter states intended use as done, gives no `--red`-versus-`--danger` rule, and has a hard-to-follow role paragraph). Verified against `globals.css`: links are `--ink`, `.progress` and `:focus-visible` are `--red`, and `.btn--primary` is mint. Route **patch**: reword as the intended use, list what has not moved yet, and state the role rules from palette.md.
  - **low** · BH, EC5. Verified by script: state text on its own `-soft` tint fails 4.5:1 in several themes. Two more pairs fail: Kraft `--caution` on `--paper` (4.36) and Blueprint `--danger` on `--sheet-2` (4.47). Ink on every `-soft` tint is 6.9:1 or higher. Nothing renders these pairs yet. Route **defer**, as a rule for entries 2–4.
  - **low** · BH, EC6. Verified: `--primary` against `--ink` is 1.76:1 or lower, and 1.04:1 in Mono. A link marked only by the accent colour would fail WCAG 1.4.1. No link uses `--primary` yet. Route **defer**, as a rule for entries 2–4: accent links keep an underline. Mono's chip matching its ink is by design.
  - **low** · VG other and BH: `tests/claims.test.ts` has no case for `arch-design-system.ts`, and its "18 pages" is really 20. Both are pre-existing. Route **defer**.
  - **low, rejected** · BH: `THEME_ACCENTS` repeats the palette, and a tenth theme would slip past it. Adding a theme is rare, and iterating `THEME_ITEMS` adds structure. The pre-loop Paper check covers matrix row 2 (no saved theme); it is not a repeat.
  - **low, rejected** · BH: a nested Paper preview also resets fonts and sizes. The swatches hold no text, and splitting the block is more than a direct fix.
  - **low, rejected** · EC4: a non-hex role gives `NaN:1`. That fails loudly, which is correct.
  - **false** · BH, EC3: bridge aliases resolve at `:root` while `--primary` is nested. No `bg-primary`, `text-primary-foreground` or `ring` utility is used anywhere (no Tailwind classes in app or components), so the mismatch is never rendered.
  - **false** · EC7 and the intent auditor: Mock and the book keep their local `--primary`. The frozen Boundaries limit module CSS to home and the picker ("Later entries move their consumers"). Epic entry 2 owns these.
  - Intent auditor: descriptive, with no new finding. Its divergences map to the rows above: picker and on-primary tests (patch), `--mark` and states with no consumers (entries 2–4), and β pairs (defer).
