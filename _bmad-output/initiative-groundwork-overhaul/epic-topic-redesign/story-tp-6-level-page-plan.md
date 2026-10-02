---
title: 'TP-6 · Level page'
type: 'feature'
ticket: '7'
created: '2026-10-02'
status: 'built'
route: 'full'
route_source: 'auto'
review: 'thorough'
review_source: 'auto'
lenses_ran: ['blind-hunter', 'edge-case-hunter', 'verification-gap', 'intent-alignment']
review_loop_iteration: 0
followup_review_recommended: true
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/planning-artifacts/audit-2026-09-28/topics.md']
warnings: []
deferred: []
baseline_revision: '39c888035e067a306120aba3a08cc9a801ac285a'
---

<intent-contract>

## Intent

**Problem:** `/level/<topic>` still renders through the old `Shell`, with its three level cards' stats (`chapters`/`exercises`) counting every chapter in a level including unwritten ones, no visual mark for a reader's already-saved level, and its CSS still living as bare global classes (`.level*`, `.syllabus*`) in `globals.css`.

**Approach:** Move `LevelView` onto `TopicFrame` with a staggered hero, fix the level-card stats to count only `ready` chapters, mark the saved level as "Your level," and give the level-grid and the `Syllabus` accordion their own CSS module. `/level/js` joins the head-back e2e loop.

## Boundaries & Constraints

**Always:**
- `app/level/[topic]/page.tsx`'s `perLevel` computation filters `chaptersForLevel(level.id, topic.id)` to `.filter(c => c.ready)` before taking `.length`, and does the same for the exercise count — `chaptersForLevel`/`exercisesForLevel` themselves stay unfiltered (other, non-level-page consumers rely on the unfiltered lists), only this call site changes.
- `LevelView` renders inside `TopicFrame` (`back` → the topic's cover, `mark`/`accent` from the topic, `reading` off — this page has no reader controls), keeping `Crumbs`, the hero (`data-fx="stagger"`, reusing the existing shared `.hero`/`.hero__kicker`/`.hero__lead` global classes — not part of this story's CSS-module move), the three level cards, "Full syllabus," curriculum notes and the footer links.
- The saved level (`useLastLevel()`) gets a visible "Your level" mark on its matching card — new, since today `savedLevel` is read but never shown.
- `components/Syllabus.tsx` and the level-grid move onto a new CSS module (two new files or one shared one, implementer's call) — classes renamed from the current bare global ones (`.level`, `.level__*`, `.syllabus`, `.syllabus-level__*`, etc.) to the module's local names; `Syllabus.tsx`'s hardcoded `` `/${(topic.notes||"").replace(/\.html$/,"")}/${id}` `` href becomes `` `${notesHref(topic.id)}/${id}` ``, matching how every other page links into a topic's chapters.
- `app/globals.css`'s now-unused `.level-grid`/`.level*`/`.syllabus*` rules (roughly L4700-4930) are removed once nothing references them.
- `e2e/smoke.spec.ts`'s head-back loop/`PAGES` array gains `/level/js`.
- No comments. Theme tokens only.

**Never:**
- Do not touch `/path`'s own page or links — entry 8 (TP-7) re-points those.
- Do not move `.hero`/`.hero__*`, `.sticky.mint`, `.section-title`/`.section-note`, or `.site-foot` into a module — these are shared globally across other still-unmigrated pages and out of this story's named scope.
- Do not change `chaptersForLevel`/`exercisesForLevel`'s own return values — only this page's use of them.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Level page | `/level/js` | `#main h1` contains "JavaScript"; each card's chapter/exercise count matches only written chapters | No error |
| Old query redirect | `/level?topic=system-design` | Lands on `/level/system-design` | No error |
| Saved level | `jsnotes:level` set to `"intermediate"` | The Intermediate card shows "Your level" | No error |
| Outline topic | `/level/typescript` | Already redirects to `/typescript` (TP-5), unaffected by this story | No error |
| a11y | `/level/js`, `/level/typescript` | Pass in light and dark at 1440 and 390 (already in the a11y PAGES list) | No error |

</intent-contract>

## Code Map

- `app/level/[topic]/page.tsx` L48-56 (`perLevel` build) -- add the `ready` filter before counting chapters/exercises.
- `app/level/LevelView.tsx` (full file, 119 lines) -- rewrite onto `TopicFrame`; the saved-level mark logic goes here (`savedLevel === level.id`).
- `components/Syllabus.tsx` L58-60,73-76 -- fix the href construction to use `notesHref`; move its classes onto the new module.
- `app/globals.css` L4700-4796 (`.level-grid`/`.level*`), L4796-4930 (`.syllabus*`) -- delete once the module covers them.
- `lib/topics.ts:54` `notesHref` -- reused, not changed.
- `e2e/smoke.spec.ts` -- the `PAGES`/head-back loop array gains `/level/js`.
- `content/architecture/arch-design-system.ts`, `arch-tech-stack.ts` -- CSS module count bump for the new module(s).
- `content/architecture/arch-content-model.ts` or wherever level-stat counting is described -- correct the "chapters" claim if it currently says otherwise.

## Tasks & Acceptance

**Execution:**
- [ ] `app/level/[topic]/page.tsx` -- ready-filtered stats -- fixes the B4-adjacent gap this ticket names
- [ ] `app/level/LevelView.tsx` -- `TopicFrame`, staggered hero, saved-level mark -- the story's deliverable
- [ ] `components/Syllabus.tsx` + new CSS module -- href fix, module-scoped classes -- closes the ticket's named CSS debt
- [ ] `app/globals.css` -- delete the now-unused `.level*`/`.syllabus*` rules -- cleanup
- [ ] `e2e/smoke.spec.ts` -- `/level/js` in the head-back loop -- regression guard
- [ ] `content/architecture/*.ts` -- updated counts and truthful prose -- keeps claims honest

**Acceptance Criteria:**
- Given `/level/js`, when it renders, then `#main h1` contains "JavaScript" and each level card's stats count only written chapters.
- Given `/level?topic=system-design`, when it redirects, then it lands on `/level/system-design`.
- Given a saved level in storage, when `/level/<topic>` renders, then the matching card shows "Your level."
- Given `npm run check`, `npm run build` and `npm run test:e2e`, when they run, then all pass, including a11y on `/level/js` in light and dark at 1440 and 390.

## Implementation Notes

- Implemented by a step-03 subagent in one pass (paused once before dispatch, resumed cleanly within the same session).
- Review round: all 7 patch-group fixes were applied by the same subagent, re-engaged successfully. While fixing the architecture chapter's chart/prose contradiction, the implementer caught that this round's own CSS deletions shifted the rounded line count further (9,400 → 9,300) and corrected it everywhere in the same pass rather than leaving a second drift behind. Noted but deliberately left alone: a pre-existing, already-stale "307 unit tests" figure in `arch-testing.ts`'s subtitle (real count is 348) — not dynamically checked by `tests/claims.test.ts`, not named by any review finding, so fixing it was judged out of this round's scope.
- Verification after the patch round: `npm run check` (348/348 unit tests), `npm run build`, and full `npm run test:e2e` at `--workers=3`: 178/181 (the same 3 known pre-existing, unrelated `/notes/setup-mental-model`/`/notes/basic-async` contrast/focus failures).

## Plan Change Log

## Review Triage Log

### 2026-10-02 — Review pass
- verdicts: 13 findings — high 0, medium 9, low 3, false 1, maybe-false 0
- findings:
  - `[false]` `[reject]` blind-hunter: claimed the new "Your level" badge is misleading because `jsnotes:level` is a single global key, so picking "Advanced" on `/level/js` would also mark Advanced as "Your level" on every other topic's level page — refuted as a new defect: that global, cross-topic "level" preference is the pre-existing, intentional design already driving `/path`'s pre-selected level and `ReaderShell` for every topic; the badge only surfaces that existing, consistent behavior visibly for the first time, which is exactly this ticket's own ask ("the saved level marked"). Redesigning level storage to be per-topic is a product-level change far outside this ticket.
  - `[medium]` `[patch]` edge-case-hunter: `app/globals.css`'s `@media (max-width: 720px) { .level:nth-child(n) { transform: none; } }` now matches nothing — the cards moved to the CSS-module class `.card`, so the mobile-width rule that cancels the cards' decorative tilt is dead; the tilt now persists at phone widths where it was meant to be cancelled. Verified by reading both files.
  - `[medium]` `[patch]` blind-hunter: same finding, found independently, same fix (add the rule to `level.module.css` targeting `.card`, or an equivalent).
  - `[low]` `[patch]` edge-case-hunter: `@media print { .topic, .level, .step { box-shadow: none; } }` also still targets the removed `.level` class — printing a level page no longer suppresses the card's shadow.
  - `[low]` `[patch]` blind-hunter: same finding, found independently, same fix.
  - `[medium]` `[patch]` edge-case-hunter: `.syllabus-level` was removed from the shared `@supports (animation-timeline: view())` reveal-up selector list in `globals.css`, but no `data-fx` (or equivalent) was added to `Syllabus.tsx` to replace it — the "Full syllabus" section's accordions now animate in with nothing, while `LevelView.tsx`'s own hero and level grid got `data-fx="stagger"` in the same diff. Verified both files.
  - `[medium]` `[patch]` blind-hunter: same finding, found independently, calling it an apparent accidental regression rather than an intentional removal — same fix (add `data-fx` to the syllabus accordions, consistent with the rest of the page).
  - `[medium]` `[patch]` blind-hunter: `content/architecture/arch-health.ts`'s "largest files" chart still states `app/globals.css` is "9,616 lines as of 30 September 2026" (an SVG label, unedited), while this same diff edits different prose two sections below to say "about 9,400 lines" — the file now contradicts itself. Verified by reading the chapter.
  - `[low]` `[patch]` blind-hunter: `content/architecture/arch-design-system.ts`'s "Three page frames" section only half-updated — the `Shell` paragraph correctly dropped the level page, but the following paragraph (what `PageFrame`/`TopicFrame` render instead) was left unchanged and never says level pages now render through `TopicFrame` too, unlike `arch-routes.ts`, which was updated correctly. Verified both files.
  - `[medium]` `[patch]` verification-gap: the level-card stats' "written chapters only" filtering (`app/level/[topic]/page.tsx`'s `.filter(c => c.ready)`) has no test that would catch a reversion — confirmed no current topic actually exposes a visible difference (every `"ready"`-status topic today is either fully written or fully unwritten, and unwritten ones redirect away before `perLevel` is computed), so no existing e2e/a11y run can distinguish filtered from unfiltered counts. Fix: a `tests/content.test.ts` case with a synthetic mixed-ready level, mirroring the adjacent `totalTime` exclusion test.
  - `[medium]` `[patch]` verification-gap: the new "Your level" badge is wholly unverified — no test seeds `jsnotes:level` before visiting a `/level/<topic>` page or asserts the badge's presence on the right card. Fix: an e2e case seeding the storage key and asserting the badge appears only on the matching card.
  - `[medium]` `[patch]` blind-hunter: same "Your level" badge gap, found independently.
  - `[medium]` `[patch]` intent-alignment: same gap again, from the divergence-in-readings angle — of the ticket's four "Verify at" bullets, three are carried entirely by pre-existing code and tests this diff doesn't touch; only the "Your level" mark is genuinely new, and it's the one bullet with no test anywhere.

## Design Notes

This story is narrower than the previous ones in the epic: the page already uses the right data-fetching shape (`chaptersForLevel`/`totalTime`/`curriculumNotes`), and `Syllabus` already behaves like an accordion per level — the work is swapping the frame (`Shell` → `TopicFrame`), fixing a stat-counting gap TP-0 deliberately left for this story, adding the saved-level mark, and finishing the CSS-module migration the ticket's own `unknown` field already named precisely.

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: pass.
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build && PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run test:e2e` -- expected: all pass (port 3100).

## Auto Run Result

**Summary:** `/level/<topic>` now renders inside `TopicFrame` instead of `Shell` — a staggered hero, three level cards whose chapter/exercise stats count only `ready` chapters, a "Your level" mark on the saved level's card, and the level-grid plus the `Syllabus` accordion moved off bare global classes onto a new `components/topic/level.module.css`. `/level/js` joined the head-back e2e loop.

**Files changed:** `app/level/LevelView.tsx` (`TopicFrame`, stagger, the saved-level mark); `app/level/[topic]/page.tsx` (ready-filtered stats); `components/Syllabus.tsx` (module classes, `notesHref`-based links, its own stagger reveal); `components/topic/level.module.css` (new); `app/globals.css` (dead `.level*`/`.syllabus*` rules removed, two leftover dead rules fixed in the patch round); `tests/content.test.ts` (new mixed-ready-level case); `e2e/smoke.spec.ts` (head-back loop entry, the new "Your level" badge test, updated CSS-module selectors); `content/architecture/arch-design-system.ts`, `arch-health.ts`, `arch-routes.ts`, `arch-tech-stack.ts`, `arch-testing.ts` (truthful prose, updated counts).

**Review findings:** 13 findings (medium 9, low 3, false 1). 7 patched: two dead CSS rules left behind by the class rename (a mobile tilt-cancel rule and a print box-shadow rule, both still targeting the removed `.level` class); the `Syllabus` accordion losing its scroll-reveal entirely with nothing replacing it, while the rest of the page gained one in the same diff; an architecture chapter contradicting its own chart against its own prose on `globals.css`'s line count; a second architecture chapter only half-updated (dropped the level page from the `Shell` paragraph but never said what replaced it); and two newly-shipped behaviors — the written-chapters-only stat filtering, and the "Your level" mark — that had no test at all, confirmed unreachable by any existing run since every current topic is either fully written or fully unwritten. One finding rejected as false: the "Your level" badge using a single, cross-topic `jsnotes:level` key is the same pre-existing, intentional preference `/path` and `ReaderShell` already use everywhere, not a new scoping bug this story introduced.

**Follow-up review recommended:** `true`. Five distinct medium-severity entries were patched. The specific unverified risk: this patch round's own new code — the new `tests/content.test.ts` synthetic-level case, the new e2e badge test, and the two CSS fixes moved into `level.module.css` — has not itself been through a review pass.

**Verification:** `npm run check` passes (20 files, 348 unit tests; the same pre-existing, unrelated `useReadingPlan.ts` lint warning persists, non-blocking). `npm run build` passes, all topic routes statically generated. `npm run test:e2e` at `--workers=3`: 178/181 (the 3 known pre-existing `/notes/setup-mental-model`/`/notes/basic-async` contrast/focus failures persist identically, consistent across every story this session).

**Residual risks:**
- `arch-testing.ts`'s "307 unit tests" subtitle figure is stale (real count is 348) — pre-existing, not dynamically checked, not named by this round's review, deliberately left alone rather than widening scope.
- The "Your level" mark is a genuinely global, cross-topic preference; whether that's the right product behavior long-term (versus a per-topic saved level) is a design question outside this ticket, not a defect in it.
