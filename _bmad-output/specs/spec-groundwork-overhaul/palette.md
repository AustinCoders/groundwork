# Theme palette (approved 2026-09-28)

The user approved this palette on 2026-09-28, from https://claude.ai/artifact/M5iVnLkFJ6uRsR7L6SuRZw.

- At approval, paper, ink, sheet, line and the categorical colours (`--c-*`) were unchanged. Later changes are listed under "Changes since approval".
- The role tokens below are new, one set per theme. The accent role is named `--primary`, not `--accent`, because `--accent` is already a per-topic local variable.
- Every value in the table below is at least 4.5:1 against its pair:
  - `accent`, `success`, `danger`, `caution` and `info` against the sheet, and, since 2026-09-30, against `--paper` and `--sheet-2` too;
  - `on-accent` against the accent;
  - `mark` against the ink.
- The table does not list the text tokens or the categorical colours. Since 2026-09-30, `tests/contrast.test.ts` also holds these at 4.5:1 in every theme:
  - `--ink`, `--ink-soft` and `--pencil` on `--paper`, `--sheet` and `--sheet-2`, and on `--code-inline-bg` mixed over each of the three;
  - `--red` on `--warn-bg` mixed over `--paper` and over `--sheet`, where warnings render, with `--warn-bg` a tint of the theme's own `--red`;
  - `--green` on `--dg-box-green`, the interview book's prep box.

| Theme | primary (accent) | on-primary | mark | success | danger | caution | info |
| --- | --- | --- | --- | --- | --- | --- | --- |
| light (Paper) | #2451b3 | #fffdf6 | #ffe873 | #1f7a55 | #c4342b | #8a6400 | #1c64b8 |
| dark (Night) | #8fb0ff | #10131a | #4a4020 | #64dfa6 | #ff9184 | #f2cc60 | #79b8ff |
| kraft | #8a3a12 | #fbf3df | #f0cf6a | #285c3f | #9b1b30 | #6b5000 | #2a5585 |
| blueprint | #7fd8ff | #0f2439 | #5a5a2c | #7fe0b8 | #ff907b | #ffe08a | #a9d4ff |
| sepia | #7a2e2a | #faf1dc | #f0d68a | #3d6543 | #a3392a | #7a5c0c | #385e88 |
| forest | #2d6a43 | #f8fbf2 | #e3e79a | #1f6f5c | #b5452f | #7a6206 | #2c6388 |
| rose | #ff8fb8 | #241823 | #5c2a44 | #7fe0b8 | #ff9a6b | #f5d68a | #9cc4ff |
| mono | #161616 | #ffffff | #e2e2dc | #276b38 | #b3261e | #6e5a00 | #1d58a3 |
| lavender | #6a3fb8 | #faf7fe | #e6d3fb | #236b56 | #b8395e | #7d6408 | #3858b8 |

## Role rules

- **`--primary` (the accent):** primary buttons, links, the active tab or nav item, progress fills, focus rings and selected states. It replaces green used as an action colour and the interview book's red `--primary`.
- **`--on-primary`:** text and icons on an accent fill.
- **`--primary-soft`:** a derived tint, `color-mix(in srgb, var(--primary) 16%, var(--sheet))`, for selected rows and chips. It replaces `--hl-mint` used as a selected background.
- **`--mark`:** highlighter behind words, inline code and title underlines. It replaces `--hl-yellow` in that role.
- **`--success`, `--danger`, `--caution`, `--info`:** states only. Passed and failed tests, done and due, tips. Never decoration.
- `--green` and `--red` stay as the categorical `--c-green` and `--c-red` for charts, topic chips and the whiteboard.

## Changes since approval

- **2026-09-30, Blueprint `--danger` `#ff8f7a` → `#ff907b`.** The states also sit on the editor background, `--sheet-2`. There, `#ff8f7a` was 4.47:1 on `#204569`. `#ff907b` is the nearest lighter value that passes, with the same hue. It is 4.50:1 on `--sheet-2` and 5.13:1 on `--sheet`. Every other state in every theme already reached 4.5:1 on `--sheet-2`. `tests/contrast.test.ts` now checks all four states against `--sheet-2` as well as `--sheet`. Blueprint's categorical `--red` stays `#ff8f7a`.
- **2026-09-30, the accessibility suite in every theme.** `e2e/a11y.spec.ts` now runs axe in all nine themes at 1440 and 390 pixels wide, and `tests/contrast.test.ts` checks the pairs listed above. Each change keeps its hue. The role change and the pencil change on Kraft are the nearest passing values; the reds were moved further, to reach at least 4.6:1, so that no value sits on the rounding edge.
  - **Kraft `--caution` `#6e5200` → `#6b5000`** (role). It was 4.36:1 on `--paper` `#d8c6a0`; it is now 4.51:1.
  - **Kraft `--pencil` `#6b5a3f` → `#615239`** (text). It was 3.96:1 on `--paper`, which failed the mock room's clock; it is now 4.51:1 on `--paper` and 5.16:1 on `--sheet-2`.
  - **Blueprint `--code-inline-bg` `rgba(255, 224, 92, 0.12)` → `rgba(255, 224, 92, 0.06)`, and `--pencil` `#93b4d6` → `#a4c0dc`** (text). Pencil text on inline code was 3.96:1 over `--sheet` and 3.52:1 over `--sheet-2`. Lowering the tint alone cannot fix `--sheet-2`: `#93b4d6` is only 4.60:1 on bare `--sheet-2`, and any yellow tint takes it below 4.5:1. With both changes it is 6.04:1 over `--paper`, 5.24:1 over `--sheet` and 4.62:1 over `--sheet-2`.
  - **Forest `--green` `#2f7d4f` → `#2e7b4e`** (categorical, so `--c-green` moves with it). It is the text of the interview book's prep box, on `--dg-box-green` `#e9f5ea`, where it was 4.49:1; it is now 4.61:1.
  - **`--red` and `--warn-bg` in five themes** (categorical, so `--c-red` moves with `--red`). `.warn` sets its text in `--red` on `--warn-bg`, over `--sheet` in the reader and the mock room and over `--paper` in the git and architecture chapters. Each `--warn-bg` keeps its alpha and takes its theme's new red.
    - Kraft `#a8402f` → `#803124`: 3.27:1 → 4.63:1 over `--paper`, 4.10:1 → 5.81:1 over `--sheet`.
    - Sepia `#b1503b` → `#9a4533`: 3.75:1 → 4.63:1 over `--paper`, 4.19:1 → 5.18:1 over `--sheet`.
    - Forest `#b5452f` → `#b0432e`: 4.42:1 → 4.61:1 over `--paper`.
    - Lavender `#c14a6a` → `#ac3b5a`: 3.69:1 → 4.61:1 over `--paper`, 4.11:1 → 5.15:1 over `--sheet`.
    - Blueprint `#ff8f7a` → `#ff9480`, lighter because the theme is dark: 4.48:1 → 4.61:1 over `--sheet`. This supersedes the note above that Blueprint's `--red` stays `#ff8f7a`.
