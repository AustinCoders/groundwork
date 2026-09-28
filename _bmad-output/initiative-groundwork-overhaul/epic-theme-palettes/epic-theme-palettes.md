---
type: epic
title: "Each theme with its own palette"
parent: initiative-groundwork-overhaul
covers: [CAP-11, CAP-8]
after: []
assignee: ""
risk: medium
status: in-progress
---

# Each theme with its own palette

## Description

Every theme gives buttons, links, progress, active states and the highlighter its own accent and marker. Today every theme uses green for actions, the interview book uses red, and the same yellow highlighter is everywhere. States (done, failed, due, tip) keep one meaning in every theme.

The approved values and role rules are in `_bmad-output/specs/spec-groundwork-overhaul/palette.md`. This epic delivers CAP-11 and the one-meaning-per-token half of CAP-8.

## Outcome

Switching the theme changes the character of the page, not only its paper. The signal is CAP-11: the role tokens are asserted by the contrast test, and every section shows the theme's accent in all nine themes.

## Requirements

- CAP-11: role tokens in all nine themes at 4.5:1, with every action, link, progress, selection and highlight moved onto them, across every section. (SPEC; palette.md)
- CAP-8 (part): `--primary` means the theme's accent everywhere; home and the interview book no longer define their own. (SPEC; ux-a11y.md V1)

## Done when

1. `tests/contrast.test.ts` asserts `--accent`, `--success`, `--danger`, `--caution` and `--info` against the sheet, `--on-accent` against the accent, and `--mark` against the ink, in all nine themes.
2. `rg -n "var\(--(green|red|c-green|c-red|hl-yellow|hl-mint)\)" app components` returns only categorical uses: charts, topic chips, whiteboard colours and diagrams. The list is recorded in the build record.
3. Screenshots of Home, Review, Progress, `/interview`, `/mock`, `/problems`, a problem page, `/whiteboard`, `/git`, `/architecture`, `/notes` and a chapter in all nine themes show the theme's accent on buttons, links and progress.
4. `npm run check`, `npm run build` and `npm run test:e2e` (the a11y spec included) pass.

## Boundaries

Colour roles only. Paper, ink, sheet, line, the categorical `--c-*` colours, the editor syntax colours and the layout are unchanged. The topic pages get their accent through the shared global rules, not a redesign (epic-topic-redesign).

## References

- spec — _bmad-output/specs/spec-groundwork-overhaul/SPEC.md, CAP-11 and CAP-8
- design — _bmad-output/specs/spec-groundwork-overhaul/palette.md (approved values and role rules)
- design — https://claude.ai/artifact/M5iVnLkFJ6uRsR7L6SuRZw (the approved preview)
- audit — _bmad-output/planning-artifacts/audit-2026-09-28/ux-a11y.md, V1 and A9

## Notes

- Decision: the user approved the palette as published and asked for it before the rest of the plan (2026-09-28).
- Decision: entry 1 is the tracer. The tokens, the test, the theme-picker preview and the home page's `--primary` switch to the accent, so one real page proves the tokens in all nine themes (agent, 2026-09-28).
- Decision: entries 2, 3 and 4 are separate lanes over separate files, so they can run in parallel after entry 1. Entry 4 waits on entry 1 because both edit `app/globals.css`.
- Decision: entry 5, the nine-theme review, is the closing sweep. It fixes what the screenshots show and takes no new scope (agent, 2026-09-28).
