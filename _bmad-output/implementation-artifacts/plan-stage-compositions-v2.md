---
title: 'Stage compositions v2: the hero "diagrams" (taped cards, stickers, notes) look composed instead of scattered'
type: 'feature'
ticket: ''
created: '2026-10-12'
status: 'built'
route: 'full'
route_source: 'auto'
review: ''
review_source: ''
lenses_ran: []
review_loop_iteration: 0
followup_review_recommended: false
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/implementation-artifacts/plan-topic-pages-home-style.md', '{project-root}/_bmad-output/implementation-artifacts/plan-progress-home-style.md', '{project-root}/_bmad-output/implementation-artifacts/plan-review-home-style.md']
warnings: ['oversized']
deferred: []
baseline_revision: '5562ee4'
---

<intent-contract>

## Intent

**Problem:** The owner sent six screenshots of the hero "diagrams" (the composed stage of taped cards, stickers and hand notes on the right of each page hero: progress, review, problems, the mock lobby, the interview book landing, and the architecture index, all in the Night theme) and said they are not enjoyable and many things look off: redesign these diagrams. My reading of the screenshots, which you must verify and extend with your own audit:
1. Tape and highlighter in dark themes: the tape is a muddy translucent olive bar; the highlighter band (`--mark` at about 55% under a title) is a dark olive block that reads as a strike-through on "Fix the temporal dead zone bug" and as a heavy brown slab over the last line of the interview question. It lowers legibility and looks dirty.
2. Scatter and dead space: cards float with large empty areas between them, edges do not align, the cards use many different tilts, so the group looks random, not composed. The architecture connectors end in mid-air and the "every number measured" sticker sits on top of a connector.
3. Orphan annotations: hand notes ("keep it going", "red first, then green", "pushed, then scored", "say it out loud first", "just before you forget") with a little arrow float far from anything and point at nothing.
4. Numbers cards: the value and its label are not aligned (labels start at a different x on each row, baselines differ, different faces for number and label), so it looks like a ragged list, not a table.
5. Inconsistent surfaces: olive-brown "sticky" cards ("your progress", "you mark yourself", the first architecture card) beside blue-grey panels; olive on a dark ground looks muddy; some cards have almost nothing inside (a big empty card with one line).
6. Stickers and tape collide (the "1 day in a row" sticker over the tape), badges clip card edges, and the "gaps grow" bars glow with a blue fill that does not match anything else.

**Approach:** Replace the hand-placed, randomly tilted scatter with a small composition system in the shared kit: a stage grid with named slots (an anchor card, one or two satellite cards, an optional sticker, an optional annotation), consistent gutters and overlaps, tilts limited to a small fixed set (for example -1.2, 0, +1.2 degrees), tape only at the top centre of a card, never over text, theme-aware; highlighter marks drawn as an underline stroke or a contrast-safe tint that never sits behind text in a way that lowers contrast (verified in all nine themes); hand notes attached to a target by an arrow whose tip touches the target card's edge (no orphan notes); numbers cards as a real two-column grid with tabular figures, right-aligned values and left-aligned labels on a shared baseline; connectors that run edge to edge between cards; one coherent set of card tints per theme (a sticky is a light tint of `--mark` mixed into the sheet with ink text, never muddy olive; in dark themes it is a restrained warm-dark with high-contrast text). Content stays the same; every page keeps its own idea but is expressed through the shared composition components.

## Scope

- The shared stage pieces in `components/home/Stage.tsx` and `stage.module.css` (`Stage`, `StageCard`, `Tape`, `Sticker`, `Note`, `Chip`, `Spark`), `components/topic/TopicKit.tsx` and `topicKit.module.css` (the page-level stage helpers and the `Band` pieces), `app/mock/mockKit.module.css`, `components/ui/MenuKit.tsx` if it holds stage styles.
- Every page-level hero stage that uses them: `app/progress/ProgressHero.tsx`, `app/review/ReviewHero.tsx`, `app/problems/ProblemsView.tsx`, `app/mock/LobbyHero.tsx`, `app/interview/InterviewLanding.tsx`, `app/architecture/ArchitectureView.tsx`, `app/level/LevelView.tsx`, `components/topic/TopicPath.tsx`, `TopicCover.tsx`, `TopicOutline.tsx`, `components/chapter/ChapterKit.tsx` (the chapter hero card), and the interview question bank hero.
- The home scenes (`components/home/*Scene.tsx`) may be touched ONLY through the shared pieces; they must not regress visually. Compare home before and after in light and Night; improvements to dark-theme tape and highlighter are welcome there too, a different home layout is not.
Not in scope: whiteboard (the owner wants it untouched: do not edit `app/whiteboard/**`, `lib/**` or `app/mock/Whiteboard.tsx`), page content and copy (except short hand notes you must reword to attach them to a target), data and logic.

## Boundaries & Constraints

**Always:**
- Start with an audit: screenshot every hero stage listed above at 1440x900 in Night and in light (Classic), and in Roboto Night; write the defect list per page into the Implementation Notes (confirm or correct my six points; add what I missed). Then design the composition system, build it in the shared kit, then re-compose each page from it. Judge the result by laying the before and after of all pages side by side.
- Measurable rules, each asserted by an e2e or unit test where it can be: no card tilt beyond the allowed set; tape never intersects text (bounding boxes); no two cards overlap each other's text; every hand note's arrow tip lies within a few pixels of a card edge or sticker; cards in a stage are inside the stage box at all sizes; numbers cards have aligned columns (same x for every label); highlight marks keep text contrast at least 4.5:1 in all nine themes (extend `tests/contrast.test.ts` where tokens are involved); connectors end on card edges (within a few pixels).
- Responsive: the same composition collapses cleanly on phones (a stacked, still composed set of two or three cards with the tape and a sticker; notes may hide only if they would orphan), no horizontal scroll at 320, tap targets 44px.
- Keep every e2e role, name and measure that exists (hero height, balance above and below, no overlap, hydration frame sampling) or update it in the same change. Keep typography on the `--t-*` scale, weights 400 and 700, nothing under 12px, eight handwriting styles and nine themes. Reduced-motion safe; no `data-fx`, nothing part-transparent at any scroll position, no one-frame flash before hydration.
- No dead CSS: remove the old per-page offsets and rules the composition system replaces.

**Never:** comments in source (`npm run comments` fails them); hex, white or literal colours (theme tokens only); hard offset shadows; edits to `.claude/skills/` or `_bmad/`; touching port 3000 or any broad `pkill`; committing, pushing or staging (the coordinator does that).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Night, Classic | All hero stages | Composed groups: aligned edges, even gutters, no mud, no band through text | none |
| Light, Classic | Same | Same family, same composition, readable | none |
| Roboto and Reading fonts | Sans and serif | Numbers aligned, nothing clipped | none |
| Narrow desktop | 1280x720 | Whole stage inside the one-screen hero, no overlap | none |
| Phone | 390 and 320 | Stacked composition, no orphan notes, no overflow | none |
| Hydration | Saved data | No wrong card or number on any frame | none |
| Reduced motion | Preference | Static composition, same layout | none |

</intent-contract>

## Code Map

- `components/home/Stage.tsx`, `components/home/stage.module.css`, `components/home/Connectors.tsx`, `connectors.module.css` -- shared stage pieces and connectors
- `components/topic/TopicKit.tsx`, `topicKit.module.css`, `Journey.tsx`; `app/mock/mockKit.module.css`; `components/ui/MenuKit.tsx` -- page-level stage helpers
- the hero files listed under Scope
- `e2e/smoke.spec.ts`, `e2e/a11y.spec.ts`, per-area specs (`e2e/review.spec.ts`, `progress.spec.ts`, `mock.spec.ts`, `book.spec.ts`, `workbench.spec.ts`), `tests/*`, `content/architecture/*` -- tests and chapters whose asserted numbers change

## Tasks & Acceptance

- Given the six pages in the owner's screenshots, then in Night at 1440x900 each stage is a composed group (aligned edges, even gutters, at most the allowed tilts), the tape and highlighter never lower text legibility, every hand note points at something, and the numbers card is a clean table; show before and after in your report.
- Given all hero stages in the nine themes and eight fonts, then nothing is clipped or overlapped, contrast holds, axe passes, and the measurable rules above are asserted by tests.
- Given home in light and Night, then the home scenes look the same or better than before (no layout change).
- Given `npm run check`, `npm run build` and the full e2e in a clean copy, then all pass; architecture chapter numbers asserted by `tests/claims.test.ts` are updated.

## Implementation Notes

### Audit (own screenshots, Night, 1440x900, before the change)

The owner's six points are right; this audit confirms each and adds these:

1. Tape and highlighter: `--tape` in Night was `rgba(226, 206, 130, 0.22)`, a translucent olive over the card; `--mark` in Night is `#4a4020` (olive) and was laid as a band across 62% to 100% of the line box, so it sat behind the lower half of the letters (strike-through look on "Fix the temporal dead zone bug", slab behind "engineer available. What do you do?"). The band was on a block `p`, so it also ran past the end of the text across the whole card. Same on the home hero ("the scope") and the "+25 XP" sticker.
2. Scatter: every stage was 3 to 5 absolutely placed cards with per-page `top/left/width` percentages, five different tilts (-2.4 to +3 degrees), cards of unrelated widths and gaps between them from 0 to 150px; the architecture connector was one SVG stretched with `preserveAspectRatio="none"` and ended in mid-air; the "every number measured" sticker sat on a connector.
3. Orphan notes: every `Note` was placed by percentages in a corner of the stage with a fixed arrow; none was tied to a card (the arrow tip touched nothing on any page; "red first, then green" pointed at empty stage, "say it out loud first" at the progress card's gap).
4. Numbers cards: `Facts` was a flex row-reverse with a `min-width: 4.4rem` value box, so labels started at a different x on every row; value in the heading face (Caveat), label in the body face (Kalam), so baselines and digit widths differ; the card stretched with no rows distributed.
5. Surfaces: sticky cards were `--mark` mixed 36% into the sheet (olive in Night), next to blue-grey sheets; three hand-written variants of the same sticky in `mockKit`, `topicKit`, level, cover, review, landing, problems and progress modules. Dashed "ghost" cards used a fourth surface. The "gaps grow" bars were `--primary` 38% with a 1.5px primary border (the blue glow).
6. Collisions: the streak sticker over the tape on the progress level card; the level-up stamp hung 54px above the card; the interview "answer, code, follow-up" sticker sat over the numbers card edge; badges clipped the stage box on narrow sizes.
7. Also found: the highlighter on the question of the day was a full-width `-webkit-box` block so the band ran across the card; stage heights were fixed per page (`--stage-h`), so short stages (question bank, outline, cover) floated at the top of the hero; the stage zoom (`--sz`) scaled cards but not gutters; "Not written yet" and "Your level" chips used raw `--mark`.

### Composition system (what was built)

- `components/topic/Compose.tsx` and `compose.module.css`: `Compose` (the stage, a CSS grid, no absolute placement), `Card` (a slot: `at` a/b/c/d, `tone` paper/note/alert/draft/ghost, `tilt` -1/0/1, `taped`), `Column` (two cards stacked in one slot), `Deck` (a card with two paper layers under it), `Tag` (a sticker on a card edge), `Remark` (a hand note hung from a card's bottom edge with an arrow whose tip touches it), `Join` (a connector that fills the gutter between two cards). Layouts: trio, rail, duo, quad, loop (a snake with connectors), stack.
- Rules: tilt is `tilt * 1.2deg` (0.6 on phones); tape is one per card at its top centre and never on a card that carries a sticker; a sticker straddles a card edge and never covers text; a remark hangs from the bottom row only and `offsetTop` equals the card's padding box height; one gutter (`--gap`) for rows and columns, tighter on short screens; cards of a row share their top, cards of a column their left; connectors are `--gap` long and start on one card edge and end on the next.
- Tokens (shared block of `app/globals.css`): `--note` (card tint), `--sticker`, `--marker` (highlight stroke), all derived with `light-dark(color-mix(...))`; Night `--tape` is now a cool translucent grey.
- `Facts` is a real table: `grid` with a `max-content` value column (right aligned, mono, tabular figures) and a label column, rows on a subgrid with baseline alignment.
- Highlights are a 0.3em stroke along the bottom of the inline text (`background: linear-gradient(var(--marker), ...) 0 100% / 100% 0.3em`).

### Tests that assert the rules

- `e2e/composeProbe.ts` (in-page probe) and `e2e/compose.spec.ts`: tilt set, tones, stage box containment, no card overlap, text never under tape or sticker, sticker on an edge, note arrow within 3px of its card edge, connectors edge to edge, figure columns and baselines, aligned edges and even gutters; run at four desktop sizes in Night, tablet and two phones in light, nine themes, eight fonts; highlight stroke contrast in all nine themes; Night tape neutral; no absolutely placed stage cards.
- `tests/contrast.test.ts` ("the stage surfaces"): `--note`, `--sticker`, `--marker` evaluated in every theme (ink 4.5:1, soft ink 4.5:1 on notes; restrained chroma in dark themes; cool tape).
- `tests/compose.test.ts`: tilt set, layouts and slots exist in the CSS, no hard offset shadows, every hero stage uses the kit and has no old `.stage .card` offsets, `Facts` table CSS, highlight stroke CSS.

### Progress

- Built the kit, re-composed 13 stages (progress, review, problems, mock lobby and debrief, interview landing and question bank, architecture, level picker, topic path, cover and outline, chapter hero), added the tokens, moved `Facts` to a table, replaced every highlight band with a stroke, made Night tape neutral, and removed the per-page offsets, `--stage-h` sizing and the old `.stageHost` rule.
- Home scenes: no layout change; shared tokens only (Night tape, sticker fill and highlight stroke in `app/home.module.css`, `stage.module.css`, `paths`, `practice`, `topics`).
- Verified in a clean copy: build, `npm run check` (932 unit tests), full e2e (see the final report for the counts); the first full run found two real failures (the question of the day card grew when revealed, and a selector that named the old hero card), both fixed and the full run repeated.
- Architecture chapters updated for the new numbers: 55 CSS modules, 11 browser specs, 461 browser tests (plus `compose.spec.ts` row), 932 unit tests.
- Known limits: the question of the day clamps its reveal text to two lines on short screens (below 820px) so the card never changes height; phones hide the tape on a card that carries a top sticker.

## Plan Change Log

## Review Triage Log

## Verification

**Commands:**
- in a clean scratch copy: `npm run build`, then `npm run check`, then `npx playwright test --workers=3 --retries=0` -- expected: all green (a known home rail landing test can flake under load; rerun it alone before reporting a failure)

**Manual checks:**
- Own before and after screenshots of every hero stage at 390, 1280, 1440 and 1920; Night and light first, then lavender, blueprint, sepia; Classic, Roboto, Reading, Chalk; plus home in light and Night.

## Auto Run Result

Built. Independent check in a clean copy on the final code (on top of the staged progress-page work): `npm run build` ok; `npm run check` 932 unit tests in 46 files (one pre-existing lint warning in `components/topic/useReadingPlan.ts`); full e2e 479 of 479 with no retries. `git diff --stat -- app/whiteboard lib app/mock/Whiteboard.tsx .claude _bmad` is empty. The hero stages were rebuilt on one composition kit (`components/topic/Compose.tsx`, `compose.module.css`: a stage grid with named slots, tilts limited to 0 and plus or minus 1.2 degrees, tape centred on a card and never over text, notes hung on their card with the arrow touching it, connectors from edge to edge, a real numbers table, highlighter as a bottom stroke, neutral tape in dark themes), asserted by `e2e/compose.spec.ts`, `e2e/composeProbe.ts`, `tests/compose.test.ts` and `tests/contrast.test.ts`. Screenshots reviewed by the coordinator in Night, Classic, 1440x900: progress, problems and architecture. Not viewed by the coordinator: review, mock, interview and question bank after the change, light-theme stages, 1920 and 2560, other fonts and themes. Design caveats from the agent: a numbers card with three rows beside tall neighbours looks airy; on phones the tape is hidden on cards that carry a top sticker; below 820px tall the question-of-the-day reveal shows two lines.
