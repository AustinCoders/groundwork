---
title: 'Home, Review, Progress, the interview book, Mock and the menu on the roles'
type: 'refactor'
ticket: '2'
created: '2026-09-28'
status: 'built'
baseline_revision: '21df3a2e731741610b45659c1bf9483a9fa5e698'
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
      The a11y e2e spec still runs only in the Paper theme at desktop width, so contrast of the new role colours in the other eight themes is checked only by the token-pair unit test.
    evidence: |-
      e2e/a11y.spec.ts sets no theme and no viewport; epic-audit-fixes entry 3 already owns running axe in all nine themes at 1440 and 390.
    location: >-
      e2e/a11y.spec.ts
    severity: medium
---

<intent-contract>

## Intent

**Problem:** Home, Review, Progress, the interview book, Mock, the site menu and the modal paint actions, progress, selections and highlights with fixed green, red, mint and yellow. So every theme looks green there, and the book looks red. Mock and the book also redefine `--primary` locally.

**Approach:** Move every such use in these nine files onto the entry-1 roles (`--primary`, `--on-primary`, `--primary-soft`, `--mark`, `--success`, `--danger`, `--caution`, `--info`), keep genuinely categorical colours, and guard the files with a test.

## Boundaries & Constraints

**Always:**
- Apply palette.md's role rules:
  - Text on any `-soft` tint is `--ink`.
  - Text on a `--primary` fill is `--on-primary`.
  - Text on a state fill is `--sheet`.
  - Links keep an underline or another cue that is not colour.
- Mixes stay `color-mix(in srgb, var(--role) N%, …)`.
- No comments. Tokens only.

**Never:**
- Do not touch files outside the nine listed, beyond the new test and `e2e/smoke.spec.ts`.
- Do not change a per-topic `--accent` that a component sets inline (HomeView, ProgressView and SiteDrawer `accentVar`). Those are topic colours.
- Do not change layout, sizes or motion.
- Do not add new tokens to `app/globals.css`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Accent page | Lavender, `/review` "Start the session →" or "Find something to read →" | Background is #6a3fb8, text is #faf7fe | No error expected |
| Book no longer red | Forest, `/interview` primary CTA | Background is #2d6a43, not red | No error expected |
| Mock no longer green | Kraft, `/mock` primary button | Background is #8a3a12 | No error expected |
| State keeps meaning | Any theme, a failed test row on home | Uses `--danger`, not the accent | No error expected |
| Regression guard | A theme-blind token added to one of the nine files outside the allowed list | `npm run test` fails, naming the file, line and token | Vitest failure |

</intent-contract>

## Code Map

The per-line classification was done in planning. Apply these decisions; anything not listed follows the rules.

- `app/mock/mock.module.css:2190-2191` and `app/interview/book.module.css:2` -- delete the local `--primary`/`--on-primary`. This one change moves every mock and book button, CTA, rail, live dot and focus onto the accent.
- **ACTION → `--primary`** (text on a fill → `--on-primary`):
  - review: `.eyebrow`, `.bigCount b`, `.rowNum`, `.focusNum`, `.primary` (and its shadow), the `.heroCopy` wash, `.sessionBar span`, focus rules.
  - progress: `.eyebrow`, `.ringFill`, `.xpBar span`, focus.
  - book: `.scrollBar`, `.mockLink`, `.doneCheck` `accent-color`.
  - mock: `.railFill` when done, `.streakDot[data-on]`, `.scrollBar`, the `.boardShape[data-selected]` stroke.
  - guide: `.label`, selected `.roundCode`, `.critNum`, the `.roundTab[aria-selected]` border, `.shape li::before`, `.practise`, `.weightBar span`, the open FAQ, focus.
  - frame: `.scrollBar`, focus.
  - SiteDrawer: every focus rule, `.search:focus-within`, the open `.foldIcon`, the `.stats` wash, `.xpBar > span`.
  - Modal: focus and `.primary`.
  - home: `.sideProgress span`.
- **Charts of the reader's own activity** use the accent:
  - review `.bar` and progress `.weekBar`: bars are `color-mix(in srgb, var(--primary) 45%, var(--line))`, and today's bar is `--primary`.
  - progress heatmap `data-l` 1–4: `--primary` at 25/45/70/100% over `--sheet`.
  - review `.stage i[data-on]` and the `.explain` diagram: `--primary`. `data-now` is `--caution`.
- **SELECTED → `--primary-soft` with `--ink` text**, and `--primary` for any border:
  - mock: `.stepperDot` current, the pressed `.card`/`.roundCard`, `.padTab[aria-selected]`, `.said[data-you] .saidBubble`, the `.boardShape[data-selected]` fill, `.modeCount`, `.nextUp`.
  - review: `.tick`, with a `--primary` border on hover.
- **HIGHLIGHT → `--mark`**: home `.paperTitle mark`, `.xp`; book `.dailyTag`; guide `.sampleTag`.
- **SUCCESS / DANGER / CAUTION / INFO:**
  - Passed and failed rows, stamps and scores → success and danger: home `data-state`/`data-ok`, `.visTests`, `.visBar`, `.visBig`, `.stamp`, `.them` ✗; mock `.gaugeFill`, `.compScore`/`.compDelta`, `.qScore`, the `.mark` buttons, `.tipList` and `.tipBad`, `.previewRubric` and `.previewStamp`; guide `.tips`, `.marked`, `.checks`, `.verdict`.
  - Hire, lean-no and no-hire verdicts (mock `.stamp`, `.verdictChip`, and the `--dg-*` or `--pencil` state uses) → success, caution and danger.
  - Self-rated knew, shaky and blank (progress `.confBar`/`.confLegend`; book `.confBar`, `.confRow`, `.railNum`, `.qCard`, `.bankItem`, `.tally`) → success, caution and danger. A pressed state uses the matching `-soft` with ink.
  - Book done and read (`--accent-2` uses: `.tile[data-read]`, `.readBadge`, `.doneRow`) → success. Delete `--accent-2` once it is unused.
  - Push-back and warnings (home `.chat p:nth-child(3)`; mock `.previewPush`, `.coreBadge`, `.briefFacts .fail`, the `.mapStage[data-core]` tint) → caution.
  - Over time, invalid, error, the live dot (mock timers `[data-state=over]`, `.topLive`, `.liveDot`; Modal `.input[aria-invalid]`, `.error`, `.danger`) → danger.
  - Notes (mock `.styleNote`, `.resume`, `.shiftTag`) → info, with `-soft` for backgrounds.
  - The mock `.heat` table bands → caution-soft, success-soft and success.
  - SiteDrawer `.due` → caution and caution-soft, dropping the hex fallback.
- **CATEGORICAL, keep as is:**
  - home: the interview-story reds (`.round*`, `.paperRound`, `.followUp`), the `.codeBar` window dots;
  - avatars and persona tones in mock and guide;
  - the LobbyGuide `--tone` 4-step scale;
  - book: the `.sayBox`/`.trapBox` callout family, the `.bankTags` trap tag, the `.companies [data-hot]` tag;
  - progress: the `.player` wash, which may use `--primary-soft`;
  - the scrim `rgba` in SiteDrawer and Modal.
- Hard-coded text on fills becomes `--on-primary` on accent fills: review:48; guide:266, 324, 480; SiteDrawer:254; book:174, 495, 878, 888, 1140; mock:366, 1079, 1405, where the fill moves to accent.

## Tasks & Acceptance

**Execution:**
- [x] `app/home.module.css`, `app/review/review.module.css`, `app/progress/progress.module.css` -- apply the Code Map -- the reader-facing pages follow the theme
- [x] `app/interview/book.module.css` -- delete the local `--primary` and `--accent-2`, and apply the Code Map -- the book stops being red
- [x] `app/mock/mock.module.css`, `app/mock/guide.module.css` -- delete the local `--primary`/`--on-primary`, and apply the Code Map -- mock stops being green
- [x] `components/frame/frame.module.css`, `components/SiteDrawer.module.css`, `components/Modal.module.css` -- apply the Code Map -- the shared chrome follows the theme
- [x] `tests/theme-roles.test.ts` (new) -- for the nine files, fail on `var(--green|--c-green|--red|--c-red|--hl-yellow|--hl-mint|--hl-pink|--sticky-bg|--sticky-mint-bg|--sticky-mint-fg|--dg-box-green|--dg-box-red)` except an explicit list of categorical selectors per file, naming the file, line and token -- the regression guard; later entries extend its file list
- [x] `e2e/smoke.spec.ts` -- in Lavender and Kraft, assert the primary CTA background equals the theme accent on `/review`, `/interview`, `/mock` and `/progress` -- the surface check

**Acceptance Criteria:**
- Given Lavender, Kraft or Forest, when `/`, `/review`, `/progress`, `/interview`, `/interview/questions` or `/mock` loads, then primary buttons, progress bars, active tabs and focus rings use that theme's accent, and no element in these pages is painted with the fixed green or red except the categorical keeps.
- Given `npm run test:e2e`, when the a11y spec runs, then it passes with no new contrast violations.

## Auto Run Result

- **Summary:** Home, Review, Progress, the interview book, Mock, the mock guide, the page frame, the site menu and the modal now paint with the entry-1 roles: actions, progress, focus, active tabs and links take the theme's accent; selections take `--primary-soft`; highlights take `--mark`; pass, fail, due, tips and self-rated confidence take the state roles. Mock and the book no longer set their own `--primary`.
- **Files changed:**
  - The nine module files: role swaps and the removal of local `--primary`.
  - `app/progress/ProgressView.tsx`: "Start a topic" falls back to the accent.
  - `tests/theme-roles.test.ts` (new): the theme-blind token guard, the role-declaration guard and the state-meaning checks.
  - `e2e/smoke.spec.ts`: accent checks in Lavender, Kraft, Forest and Night on `/review`, `/interview`, `/interview/questions`, `/mock` and `/progress`, plus Lavender state checks for the failed editor, "Shaky" and the debrief stamp.
  - `content/architecture/arch-design-system.ts`: which sections read the roles and what moves later.
- **Review findings:** 23 in total.
  - 16 routed to patch, all applied. By entry verdict: medium 6 (highlights and tips, state meaning, links and active tabs, the state e2e checks, pencil on the soft tint, the Progress fallback) and low 10.
  - 1 deferred: a11y runs only in Paper, owned by epic 1 entry 3.
  - Rejected, each with its reason in the triage log:
    - the allowlist keyed by selector only (low; unlikely, and the fix adds structure);
    - `.stage i[data-now]` (false; "due" is a caution state);
    - the scanner ignoring strings and comments (low; module CSS has neither);
    - the first-occurrence-only state test (low; covered by e2e);
    - the `/progress` CTA (low; the page has none, and the XP fill is checked).
- **Follow-up review:** recommended. Six medium entries were patched in one pass without a second lens run. The unverified risk is text contrast on the other `-soft` and `--mark` fills in the eight non-Paper themes, since the a11y spec runs only in Paper and the token test checks pairs, not the mixes.
- **Verification:** all passed.
  - `npx vitest run tests/theme-roles.test.ts tests/contrast.test.ts`
  - `npm run check`: 205 unit tests
  - `npm run build`
  - `npm run test:e2e`: 86 passed
  - A deliberate `var(--green)`, `var(--sticky-fg)` and `--primary` declaration each failed the guard with file and line.
- **Residual risks:**
  - Topic pages, the whiteboard, problems, git and architecture, and the global rules in `globals.css` still use fixed colours. Entries 3 and 4 cover them.
  - The a11y spec's theme coverage is deferred.

## Design Notes

Delete the local `--primary` instead of mapping it. Every `var(--primary)` in mock and the book already means "this page's action colour", so once the local override goes they inherit the theme accent. Self-rated confidence uses the state roles, so "knew" reads as success in every theme, matching the progress page's legend.

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npx vitest run tests/theme-roles.test.ts tests/contrast.test.ts` -- expected: pass.
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: pass.
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build && PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run test:e2e` -- expected: all pass (e2e serves on port 3100; never touch 3000).

**Manual checks (if no CLI):**
- Screenshot `/`, `/review`, `/progress`, `/interview`, `/interview/questions` and `/mock` in Lavender, Kraft and Night on a server on port 3200. No green or red action colour remains.

## Implementation Notes

- 2026-09-28: implemented by a fresh subagent from this plan.
  - Mock and the book lost their local `--primary`/`--on-primary`, and the book lost `--accent-2`. Every Code Map line was applied.
  - Fills that carry text are pure `var(--primary)` with `--on-primary`, so the CTAs match the accent exactly. Text colours keep their mixes, with the role swapped in (for example `color-mix(in srgb, var(--primary) 70%, var(--ink))`).
  - `tests/theme-roles.test.ts` scans the nine files for the listed tokens and allows them only in named categorical selectors. It fails with `file:line selector uses var(--token)`. It also fails when a listed selector stops using a fixed colour, and it tests its own scanner on a fixture.
  - The categorical keeps are home `.round:hover`, `.roundNum`, `.roundGo`, `.paperRound`, `.followUp` and two `.codeBar` dots; book `.companies span[data-hot]`, `.sayBox`, `.trapBox` and their labels, and the trap tag; the mock and guide avatars.
  - `e2e/smoke.spec.ts` checks the CTA background and text in Lavender and Kraft on `/review`, `/interview` and `/mock`, and the XP bar on `/progress`, which has no CTA.
- Judgement calls, each within the rules:
  - Text on a fill that moved to a state role is `--sheet`, not `--on-primary`. This covers book `.railNum` (878, 888), guide `.checks` (480) and the mock heat `strong` cell (1405).
  - Pressed confidence buttons in the book (1140) and the mock `.mark` buttons, `.verdictChip`, `.qScore`, `.coreBadge` and the over-time `.inlineTimer` now use the state's `-soft` tint with `--ink` text and a state-coloured border.
  - The book's `.companies [data-hot]` tag used `--accent-2`. It now names `--c-green` directly and is on the categorical list.
  - Some uses the Code Map does not list were moved by the role rules: review `.late` → caution; the low-time timer ring and chip → caution; the readiness `getting-there` gauge and score (were `--pencil`) → caution; heat `not-yet` → danger-soft; the lean-no and mid chips (`--dg-box-yellow`) → caution-soft.
- Review fixes, applied by the same subagent at the coordinator's request:
  - The guard also catches `--sticky-fg`, `--dg-box-yellow`, `--dg-yellow-stroke`, `--c-yellow` and `--c-orange`. The allowed list grew to cover them: home `.offer`, `.doodleStar` and the middle `.codeBar` dot; progress `.levelUp`, `.chips span[data-lit]`, `.badge[data-earned]` and its `.medal`; book `.testBox` and its label.
  - The guard also fails when one of the nine files declares a role token, and its self-test checks the exact message.
  - Highlights and tips moved: home `.underline path` → `--primary`; review `.prompt` and guide `.pitch` → `--info-soft` with an `--info` border; book `.dailyReveal p` → `--mark`.
  - Links take `--primary`, and each keeps a non-colour cue: review `.link` and `.rowMain a` (now underlined), mock `.nextSteps a`, book `.crumbs a` and SiteDrawer `.footNote a`.
  - Active items take `--primary-soft` with a `--primary` inset ring: book `.topLinks` and `.modeSwitch`, mock `.mode`, and the frame's current link.
  - Mock: its focus outlines and `.railFill` are `--primary`. `--pencil` text on `--primary-soft` became `--ink-soft`.
  - Book: the kbd tint is keyed to `--on-primary`. `.doneCheck` uses `--success`.
  - `ProgressView.tsx`: "Start a topic" falls back to `var(--primary)`.
  - `arch-design-system.ts`: the paragraph now says which sections read the roles and what moves later.
  - `e2e/smoke.spec.ts`: the accent test covers Dark and `/interview/questions`. The home, book and mock flows run in Lavender and check the danger, caution and success colours.
- Verification: `npx vitest run tests/theme-roles.test.ts tests/contrast.test.ts` passed 25 tests. `npm run check` passed 194 tests. `npm run build` and `npm run test:e2e` passed 86, including a11y.
  - A planted `var(--green)` in `review.module.css` failed the guard with the file, line and token.
  - Screenshots on port 3200 in Lavender, Kraft and Night showed no green or red action colour on `/`, `/review`, `/progress`, `/interview`, `/interview/questions`, `/interview/r3` or `/mock`.

## Plan Change Log

## Review Triage Log

### 2026-09-28 — Review pass
- verdicts: 23 findings — high 0, medium 6, low 16, false 1, maybe-false 0
- findings:
  - `[low]` `[patch]` BH: `THEME_BLIND` misses tokens this change moved away from (`--sticky-fg`, `--dg-box-yellow`, `--dg-yellow-stroke`, `--c-yellow`, `--c-orange`). Verified against the regex at `tests/theme-roles.test.ts:5`. Action: extend the regex and list the remaining categorical uses.
  - `[medium]` `[patch]` BH: highlight and tip uses on `--c-yellow`/`--c-orange` were left behind (home `.underline path`, review `.prompt`, book `.dailyReveal p`, guide `.pitch`). Verified; the hero title underline stays yellow in every theme. Action: underline to `--primary`, tips to info, the revealed answer to `--mark`. Achievement and callout-family washes go on the categorical list.
  - `[low]` `[patch]` BH: nothing stops a module redeclaring `--primary` or another role. Verified: the scanner only sees token values. Action: forbid role declarations in the nine files.
  - `[low]` `[patch]` BH: the self-test never calls `outsideCategorical` or checks the message. Verified. Action: add a fixture assertion.
  - `[low]` `[reject]` BH: the allowlist is keyed by selector only. Verified, but adding a green to an avatar rule is unlikely, and keying by token adds structure.
  - `[medium]` `[patch]` BH: state meaning is checked only on home. Grouped with VG1. Action: e2e checks for the state colours in Lavender.
  - `[low]` `[patch]` BH: the e2e runs no dark theme and skips `/interview/questions`. Verified at `smoke.spec.ts:953`. Action: add Night and a `/interview/questions` surface.
  - `[medium]` `[patch]` BH and the intent auditor: links and the active nav or tab stay ink, although the intent's Verify names links and active tabs. Verified: review `.link` and `.rowMain a`, mock `.nextSteps a` and `.mode[aria-selected]`, book `.topLinks a[aria-current]` and `.crumbs a`, SiteDrawer `.footNote a`, the frame's current link. Action: underlined text links to `--primary`; active items to `--primary-soft` with a `--primary` cue.
  - `[false]` `[reject]` BH: `.stage i[data-now]` uses a state colour as decoration. It marks the review that is due now, and palette.md lists "due" as a caution state, so this is a state.
  - `[low]` `[patch]` BH: `arch-design-system.ts:110-115` still says mock and the book set their own green and red. Verified; now false. Action: rewrite the paragraph.
  - `[low]` `[patch]` BH: the book's keycap tint is keyed to `--paper` (`book.module.css:204`). Verified; it is mismatched on dark accents. Action: key it to `--on-primary`.
  - `[low]` `[patch]` BH: the `.doneCheck` accent does not match its success row. Verified. Action: `accent-color: var(--success)`.
  - `[medium]` `[patch]` VG1 (pre-verified): no rendered check of the state roles. The mock `.stamp`, `.mark`, bands and the book's confidence states can take the accent or old yellow and still pass. Action: Lavender `toHaveCSS` checks for Shaky (caution), the debrief stamp (success) and the home failed editor (danger); add the dg-yellow tokens to the guard.
  - `[medium]` `[patch]` EC: `--pencil` text on the new `--primary-soft` surfaces (mock `.roundCard[aria-pressed] .mapMeta`, `.nextUp .eyebrow`, `.recordLabel`). Verified by script: 3.64:1 Blueprint, 3.98 Kraft, 4.16 Forest; `--ink-soft` is at least 4.84. Action: use `--ink-soft` there.
  - `[low]` `[patch]` EC: the guard's token list. Grouped with the first BH row.
  - `[low]` `[reject]` EC: the scanner ignores strings and comments. Module CSS has no comments (the comments check) and no brace-bearing strings, so this is unlikely, and the fix adds parsing.
  - `[low]` `[reject]` EC: the state test reads only the first occurrence of a selector. Unlikely, and the new e2e state checks cover the rendered result.
  - `[low]` `[patch]` EC: mock `.stepQuestion:focus-visible` and `.notes:focus-visible` are still ink. Verified. Action: `--primary`.
  - `[low]` `[patch]` EC: mock `.railFill` in progress is ink; only the done state was moved. Verified. Action: `--primary`.
  - `[medium]` `[patch]` EC: ProgressView's "Start a topic" card falls back to `accentVar("green")`. Verified at `ProgressView.tsx:331`. Action: fall back to the theme accent. The review card (orange) and the interview drill (red, the interview colour) stay categorical, as do per-topic accents.
  - `[low]` `[reject]` EC: `/progress` e2e checks the XP bar, not a CTA. Verified: the page has no CTA, and the XP fill is its accent-coloured progress.
  - `[low]` `[patch]` EC: home `.underline path` is `--c-yellow`. Grouped with the second BH row.
  - `[low]` `[patch]` Intent auditor (descriptive): its divergences map to the rows above. Links and tabs, yellow highlights, dark themes and `/interview/questions`, the done split and the chapter are patched. a11y runs only in Paper, which is pre-existing and deferred to epic 1 entry 3.
