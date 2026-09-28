# Theme palette (approved 2026-09-28)

The user approved this palette on 2026-09-28, from https://claude.ai/artifact/M5iVnLkFJ6uRsR7L6SuRZw.

- Paper, ink, sheet, line and the categorical colours (`--c-*`) are unchanged.
- The role tokens below are new, one set per theme.
- Every value below is at least 4.5:1 against its pair:
  - `accent`, `success`, `danger`, `caution` and `info` against the sheet;
  - `on-accent` against the accent;
  - `mark` against the ink.

| Theme | accent | on-accent | mark | success | danger | caution | info |
| --- | --- | --- | --- | --- | --- | --- | --- |
| light (Paper) | #2451b3 | #fffdf6 | #ffe873 | #1f7a55 | #c4342b | #8a6400 | #1c64b8 |
| dark (Night) | #8fb0ff | #10131a | #4a4020 | #64dfa6 | #ff9184 | #f2cc60 | #79b8ff |
| kraft | #8a3a12 | #fbf3df | #f0cf6a | #285c3f | #9b1b30 | #6e5200 | #2a5585 |
| blueprint | #7fd8ff | #0f2439 | #5a5a2c | #7fe0b8 | #ff8f7a | #ffe08a | #a9d4ff |
| sepia | #7a2e2a | #faf1dc | #f0d68a | #3d6543 | #a3392a | #7a5c0c | #385e88 |
| forest | #2d6a43 | #f8fbf2 | #e3e79a | #1f6f5c | #b5452f | #7a6206 | #2c6388 |
| rose | #ff8fb8 | #241823 | #5c2a44 | #7fe0b8 | #ff9a6b | #f5d68a | #9cc4ff |
| mono | #161616 | #ffffff | #e2e2dc | #276b38 | #b3261e | #6e5a00 | #1d58a3 |
| lavender | #6a3fb8 | #faf7fe | #e6d3fb | #236b56 | #b8395e | #7d6408 | #3858b8 |

## Role rules

- **accent:** primary buttons, links, the active tab or nav item, progress fills, focus rings and selected states. It replaces green used as an action colour and the interview book's red `--primary`.
- **on-accent:** text and icons on an accent fill.
- **accent-soft:** a derived tint, `color-mix(in srgb, var(--accent) 16%, var(--sheet))`, for selected rows and chips. It replaces `--hl-mint` used as a selected background.
- **mark:** highlighter behind words, inline code and title underlines. It replaces `--hl-yellow` in that role.
- **success, danger, caution, info:** states only. Passed and failed tests, done and due, tips. Never decoration.
- `--green` and `--red` stay as the categorical `--c-green` and `--c-red` for charts, topic chips and the whiteboard.
