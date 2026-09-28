---
title: 'Role tokens in all nine themes (tracer)'
type: 'feature'
ticket: '1'
created: '2026-09-28'
status: 'ready-for-dev'
route: 'full'
route_source: 'auto'
review: ''
review_source: ''
lenses_ran: []
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
- [ ] `app/globals.css` -- add the 7 role tokens to `:root` and the 8 theme blocks, and the 5 soft mixes to the shared block -- one source of truth per theme
- [ ] `app/theme-bridge.css` -- map the shadcn aliases onto the roles, and move the select states off mint -- removes the ink `--primary` and the mint selection
- [ ] `app/home.module.css` -- delete the local `--primary` and `--on-primary` -- the tracer page takes the theme accent
- [ ] `components/AppearancePicker.tsx`, `components/AppearancePicker.module.css` -- show the accent on each theme card; selected and focus states use `--primary` -- the picker previews the character of each theme
- [ ] `tests/contrast.test.ts` -- add the role-pair describe -- a theme missing or failing a role fails in Vitest
- [ ] `content/architecture/arch-design-system.ts` -- recount the stated numbers and describe the roles -- How this is built stays true

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
