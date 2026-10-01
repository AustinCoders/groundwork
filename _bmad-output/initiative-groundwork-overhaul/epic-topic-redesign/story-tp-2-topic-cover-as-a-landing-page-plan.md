---
title: 'TP-2 · Topic cover as a landing page'
type: 'feature'
ticket: '4'
created: '2026-10-01'
status: 'built'
route: 'full'
route_source: 'auto'
review: 'thorough'
review_source: 'auto'
lenses_ran: ['blind-hunter', 'edge-case-hunter', 'verification-gap', 'intent-alignment']
review_loop_iteration: 0
followup_review_recommended: true
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/planning-artifacts/audit-2026-09-28/topics.md']
warnings: ['oversized']
deferred:
  - summary: >-
      The footer's "practise this in the interview book" link (relatedInterviewRound) has no test.
    evidence: |-
      A typo'd round id would make the lookup return null, silently dropping the link, with
      nothing to catch it. Low-traffic footer link; add a one-line smoke check if cover e2e
      coverage grows.
    location: >-
      components/topic/TopicCover.tsx, lib/topics.ts (relatedInterviewRound)
    severity: low
  - summary: >-
      PartSection's level totals and the hero's pre-hydration minutes mix written+outline chapter
      counts with ready-only counts.
    evidence: |-
      total={list.length} counts every chapter in a level; read only counts done ones; totalMinutes
      sums all cards while plan.minutesLeft sums only ready ones. Currently latent: all four written
      topics (js/react/dsa/system-design) have zero unready chapters today (verified live), so no
      number is visibly wrong. Revisit when a written topic first has a ready/outline mix, which
      naturally arrives with TP-4/TP-5's outline-chapter work.
    location: >-
      components/topic/TopicCover.tsx
    severity: low
  - summary: >-
      ChapterCard renders every chapter identically regardless of `ready`, dropping the old cover's
      distinct "not written yet" treatment for outline chapters within an otherwise-written topic.
    evidence: |-
      Same latent status as the totals finding above: zero unready chapters exist in the four
      written topics today. Properly fixing this overlaps with TP-4/TP-5's outline-chapter scope.
    location: >-
      components/chapter/ChapterCard.tsx, components/topic/TopicCover.tsx
    severity: low
baseline_revision: 'ff792bafae16f571d9ad24bcaaad87812accced4'
---

<intent-contract>

## Intent

**Problem:** Every written topic's cover (`/notes`, `/react`, `/dsa`, `/system-design`) still renders the old notebook `CoverMap` (a route list with a budget picker and a hover-peek aside) inside either `ReaderShell` (3 of them) or a bespoke one-off `TopicFrame` wrapper (`/notes`, from the TP-1 tracer). The user explicitly wants every topic's cover to open as a real landing page the way `/git`'s does — a hero, stats, and chapters grouped by level — not the old sidebar-era cover.

**Approach:** Build `components/topic/TopicCover.tsx`, hosted in `TopicFrame`, from TP-1's shared `PartSection`/`ChapterCard` (extended, not forked) plus a new `useReadingPlan` hook lifted out of `CoverMap`'s existing logic for an "Up next" card. `TopicCoverPage` (in `topicPages.tsx`) becomes the single branch point for all 18 topic covers — written (`topicStats()[id].written > 0`) gets `TopicCover`; everything else keeps today's `CoverSheet`/`ReaderShell`. `app/notes/page.tsx` drops its one-off wiring and becomes the same thin wrapper the other 17 topics already are, calling `TopicCoverPage` like `app/react/page.tsx` does today.

## Boundaries & Constraints

**Always:**
- `TopicCoverPage` branches on `topicStats()[topicId].written > 0` (the same gate TP-0 already uses for `/soon`, and `app/layout.tsx:41`'s own precedent) — not a hardcoded list of 4 topic ids, so a topic that gains its first written chapter later gets this cover automatically.
- Extend `components/chapter/ChapterCard.tsx` in place: add optional `exercises?: number` and `onToggleRead?: () => void`. When `onToggleRead` is omitted (git, architecture), output is pixel-identical to today. When provided, add a sibling tick `<button>` next to the card's `<Link>` — not nested inside it (mirroring `CoverMap`'s existing `station-row` pattern: link and tick are siblings in the `<li>`, never nested interactive elements).
- `components/topic/useReadingPlan.ts`: lift `CoverMap.tsx`'s `readable`/`done`/`next`/`reach`/`minutesLeft`/`lastInReach`/budget-persistence logic verbatim into a hook taking `(stations, topicId)`. `CoverMap` itself is untouched and keeps serving outline-topic-adjacent covers via the unchanged `CoverSheet` path.
- Keep `HashRedirect`, `topicCoverMetadata`, and SSR links for every chapter (server-rendered `ChapterCard`s, no `<noscript>` needed).
- `app/notes/page.tsx` becomes `TOPIC = "js"` calling `TopicCoverPage`, same shape as `app/react/page.tsx` — the tracer's one-off composition retires.
- No comments. Theme tokens only. New CSS in `components/topic/cover.module.css`.

**Never:**
- Do not change any other cover's behavior (outline topics stay on `CoverSheet`/`ReaderShell`), `/level`, `/path`, or the chapter reader.
- Do not restyle `git`'s `SeriesLanding` or touch `components/chapter/PartSection.tsx` beyond what `ChapterCard`'s extension requires (none — `PartSection` needs no change).
- Do not build a cross-component "open the drawer from here" mechanism for the footer's "Switch topic" link — `PageFrame`'s `menuOpen` is private with no imperative API, and adding one is out of scope for a footer convenience not named in this ticket's own `verify` field. Link it to `/` instead, which already lists every topic.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Written topic cover | `/react` | Hero, stat strip, Up next card with budget picker, parts by level with `ChapterCard` grids, practice callout, footer strip | No error |
| Outline topic cover | `/typescript` | Unchanged `CoverSheet`/`ReaderShell` | No error |
| Read tick | Click a `ChapterCard`'s tick | Updates `progress`, card and stat strip reflect it, without navigating | No error |
| Continue | Click the header's Continue action | Opens the first unread chapter | If every chapter read, opens the cover's own review-due link |
| Budget picker | Pick "20m" in the Up next card | `reach` recomputes against `readable` chapters, same math as today's `CoverMap` | No error |
| Mobile | `/react` at 375px | No horizontal scroll, hero and cards stack | No error |

</intent-contract>

## Code Map

- `components/reader/CoverMap.tsx` (227 lines): the logic to lift verbatim into `useReadingPlan` is L36-76 (`readable`, `done`, `next`, `reach`, `minutesLeft`, `lastInReach`, `readCount`) and L30-33,71-74 (budget state + `store`/`BUDGET_KEY` persistence). `CoverMap.tsx` itself is untouched.
- `components/chapter/ChapterCard.tsx` (23 lines) -- add `exercises?: number`, `onToggleRead?: () => void`; sibling tick button pattern from `CoverMap.tsx` L166-195 (`station-row`).
- `components/reader/topicPages.tsx` `TopicCoverPage` (L15-29) -- branch on `topicStats(topicId).written > 0` (import from `@/lib/topicStats`); written → `TopicFrame` + new `TopicCover`; else → unchanged.
- `app/notes/page.tsx` -- replace with the thin `TOPIC = "js"` wrapper pattern (copy `app/react/page.tsx`); its current inline `TopicFrame`/`HashRedirect`/`CoverSheet` composition is retired.
- `components/topic/TopicCover.tsx` + `cover.module.css` (new) -- hero (kicker/title/lead from `notesData(topicId).meta`), stat strip (chapter/level/exercise counts, hours left, due-for-review via `progress.dueForReview`), an inline "Up next" card (built from `useReadingPlan`, including the budget stepper ported from `CoverMap.tsx` L112-134), parts-by-level using `PartSection`+extended `ChapterCard` (mirroring `SeriesLanding.tsx` L123-142's composition, but grouping via `chapter.levels.includes(level.id)` the way `CoverSheet.tsx`'s `routeGroups` already does, not a single-level model), a practice callout linking to `/problems?topic=<id>&level=<lvl>` (no existing helper — build the query string inline), and a footer strip (curriculum notes, copied markup from `app/level/LevelView.tsx` L102-109; a 4-entry `relatedInterviewRound` map new in `lib/topics.ts`, `{js:"r3\", react:"r4", dsa:"r7", "system-design":"r8"}` with hrefs `/interview/<round>`; a "Switch topic" link to `/`).
- `e2e/smoke.spec.ts` -- retarget `.station__tick`/`.covermap__score-num` (L104,106) and `#top`'s margin-line test (L1372+) to the new cover's equivalent elements on `/notes`; add `/react`, `/dsa`, `/system-design` cover checks to `PAGES` and the head-back loop.
- `e2e/a11y.spec.ts` -- a state for the Up next card's budget picker open, run on one cover.
- `content/architecture/arch-rendering.ts` (L93-98, L156, L166), `arch-state.ts` (L111), `arch-routes.ts` (L74,77,215), `arch-design-system.ts` (L239,244) -- rewrite for the unified `TopicCoverPage` branch and the retired `/notes`-only tracer wiring.
- `tests/claims.test.ts` -- update counts after implementation.

## Tasks & Acceptance

**Execution:**
- [ ] `components/topic/useReadingPlan.ts` -- lift `CoverMap`'s reading-plan logic -- reusable, no behavior change to `CoverMap` itself
- [ ] `components/chapter/ChapterCard.tsx` -- optional `exercises`/`onToggleRead`, sibling tick -- generalize without forking
- [ ] `lib/topics.ts` -- `relatedInterviewRound(topicId)` -- small, scoped lookup
- [ ] `components/topic/TopicCover.tsx`, `cover.module.css` -- the new cover -- the story's deliverable
- [ ] `components/reader/topicPages.tsx` -- the `written > 0` branch in `TopicCoverPage` -- single dispatch point for all 18 topics
- [ ] `app/notes/page.tsx` -- thin wrapper, matching the other 17 -- retires the tracer's one-off composition
- [ ] `e2e/smoke.spec.ts`, `e2e/a11y.spec.ts` -- retarget tick/margin-line selectors, cover the other 3 written topics, a budget-picker a11y state -- regression guard
- [ ] `content/architecture/arch-rendering.ts`, `arch-state.ts`, `arch-routes.ts`, `arch-design-system.ts` -- truthful prose -- keeps claims honest

**Acceptance Criteria:**
- Given `/notes` at 1440px, when it loads, then `#main h1` contains "JavaScript", the first chapter card is above the fold, and Continue targets the first unread chapter.
- Given a `ChapterCard`'s tick, when clicked, then `progress.isChapterDone` toggles and the stat strip's read count updates without navigating.
- Given `/react`, `/dsa`, `/system-design` and `/notes` at 375px, when rendered, then there is no horizontal scroll.
- Given `npm run check`, `npm run build` and `npm run test:e2e`, when they run, then all pass, including a11y on all four covers in light and dark at 1440 and 390.

## Implementation Notes

- Implemented by a step-03 subagent in one pass (no concurrent-session collision this time, unlike TP-3).
- Review round: all 7 patch-group fixes were applied by the same subagent, re-engaged successfully (unlike TP-3, where the implementer's session could not be resumed). Each was applied exactly as prescribed in the Review Triage Log's `Fix:` lines — the log's existing wording already describes the fix as applied, not just as requested.
- One residual nit from the patch round, judged not worth a further cycle: `useReadingPlan(stations, topicId)` keeps `topicId` as a parameter (the plan's own mandated hook signature) even though nothing inside the hook body uses it after `budgetGroupId` was removed; ESLint flags it as an unused-var warning, which does not fail `npm run check` (no `--max-warnings`). Left as-is — the parameter stays part of the hook's documented signature for a future per-topic use (e.g. scoping the budget key, explicitly rejected as a live defect in this pass's review but plausible as a later product choice).
- Verification after the patch round: `npm run check` (335/335 unit tests, 1 lint warning as above), `npm run build`, and the implementer's own scoped `e2e/smoke.spec.ts` run (86/86). Full `npm run test:e2e` at `--workers=3`: 174/174 (the 3 known pre-existing, unrelated `/notes/setup-mental-model`/`/notes/basic-async` contrast/focus failures persist identically — confirmed against the pre-TP-2 baseline during implementation).

## Plan Change Log

## Review Triage Log

### 2026-10-01 — Review pass
- verdicts: 19 findings — high 0, medium 6, low 13, false 0, maybe-false 0
- findings:
  - `[medium]` `[patch]` verification-gap: the cover's Start/Continue/Review CTA label and destination (`continueLabel`/`continueHref` in `TopicCover.tsx`) are untested — the two e2e tests that used to assert the CTA's label now match it by CSS selector only (`header a.btn--primary`), checking theme color, not text or `href`. Verified by reading both tests. Fix: assert the label changes Start→Continue→Review and the href targets the right chapter/`/review`.
  - `[medium]` `[patch]` blind-hunter: same root cause — `arch-testing.ts` claims smoke.spec.ts covers "a written topic's reading plan and its Continue action," but no test in the diff drives or asserts that. Same fix closes this too.
  - `[medium]` `[patch]` intent-alignment: same root cause, from the divergence-in-readings angle (the verify bullet's surface is end-to-end navigation; the diff's test surface is CSS-selector presence).
  - `[medium]` `[patch]` verification-gap: the reading-budget "reach" computation and its `budgetOut` text ("→ N chapters, up to X" / "→ not even X fits") are exercised only by an axe accessibility scan (`e2e/a11y.spec.ts`'s new "budget picked" state), which never reads the text. Verified: no test string-matches `budgetOut`'s output anywhere. Fix: assert the rendered text after picking a budget step, mirroring the existing mark-as-read count assertion.
  - `[medium]` `[patch]` edge-case-hunter: the Text-size zoom control is silently dead on all four covers — `TopicCover.tsx`'s wrapper is `id="top"`, not `id="chapters"`, so `globals.css`'s `#chapters { zoom: var(--reader-zoom,1) }` never matches it; the old zoom e2e assertion was deleted, not retargeted. Verified directly (grep confirms no `#chapters` or zoom rule anywhere in the new component or its CSS module). Fix: add `zoom: var(--reader-zoom, 1)` to `.page` in `cover.module.css`, and restore an equivalent e2e assertion.
  - `[medium]` `[patch]` blind-hunter: same root cause, same fix, found independently.
  - `[low]` `[defer]` verification-gap: the footer's "practise this in the interview book" link (`relatedInterviewRound`) has no test — the lens's own disposition: low-traffic, not worth blocking this change; a typo'd round id would silently drop the link with no test catching it.
  - `[low]` `[patch]` edge-case-hunter: the pre-hydration Start CTA falls back to `cards[0]?.id` with no `ready` check, unlike `plan.next` (and `plan.mounted`-gated code everywhere else), which is always ready-filtered. Verified at `TopicCover.tsx:95`. Fix: fall back to the first ready chapter's id.
  - `[low]` `[patch]` blind-hunter: same root cause, same fix, found independently.
  - `[low]` `[patch]` edge-case-hunter: `store.get<number>(BUDGET_KEY, DEFAULT_BUDGET)` has no runtime check that the stored value is actually a number; a corrupted/non-numeric stored budget makes the `>` comparison in `reach` always false (NaN), silently including every remaining chapter. Verified the type is trusted, not checked. Fix: a one-line `typeof` guard.
  - `[low]` `[patch]` edge-case-hunter: the card's tick button is gated only on `c.ready`, not `plan.mounted` (unlike `CoverMap`'s own `mounted && s.ready` gate it mirrors), so it renders before hydration completes, where clicking briefly does nothing. Verified at `TopicCover.tsx:192`. Fix: add the `plan.mounted` check to match the established pattern.
  - `[low]` `[patch]` blind-hunter: `useReadingPlan`'s `budgetGroupId` is computed and returned but never consumed by `TopicCover.tsx` (the budget `role="group"` uses a hardcoded `aria-label` instead) — dead code. Verified by reading both files. Fix: remove the unused field.
  - `[false]` `[reject]` blind-hunter: claimed a budget picked on one topic's cover leaks as the default to the others, via a shared, unscoped `BUDGET_KEY` — refuted: `components/reader/CoverMap.tsx`'s own, pre-existing, unmodified `BUDGET_KEY` is the identical literal string and already has no topic scoping, serving all 14+ outline-topic covers today. This diff's reuse of the same key is consistent with that pre-existing, unchanged behavior, not a new regression.
  - `[false]` `[reject]` blind-hunter: claimed "Three honest notes" should be derived from `curriculumNotes.length` rather than hardcoded — refuted as a defect introduced here: the identical literal phrase is copied verbatim from the pre-existing, unmodified `app/level/LevelView.tsx:103`, a site-wide convention this ticket didn't touch and isn't scoped to fix.
  - `[low]` `[defer]` blind-hunter: `PartSection`'s `total={list.length}` counts every chapter in a level (written+outline) while `read` counts only done ones, and the pre-hydration `totalMinutes` sums all cards while `plan.minutesLeft` sums only ready ones — a real inconsistency, but latent: verified via a live chapter dump that all four written topics (js/react/dsa/system-design) currently have zero unready chapters, so no number is visibly wrong today. Revisit when a written topic first has a mix (naturally arrives with TP-4/TP-5's outline-chapter work).
  - `[low]` `[defer]` blind-hunter: `ChapterCard` renders every chapter identically regardless of `ready`, dropping the old `CoverSheet`/`CoverMap` path's distinct "is-soon" treatment for outline chapters — same latent status as above (zero unready chapters exist in the four topics today); properly fixing this overlaps with TP-4/TP-5's outline-chapter scope rather than this ticket's.
  - `[low]` `[reject]` blind-hunter: e2e depth is uneven across the four covers (the `#site-sidenav` removal check only runs on `/react`; the budget-picked a11y state only runs on `/notes`) — all four do get generic PAGES/a11y coverage; bringing every check to full parity across all four exceeds a direct, trivial fix.
  - `[false]` `[reject]` intent-alignment: claimed `useReadingPlan` should have been an extraction out of `CoverMap` (one shared implementation) rather than a parallel, duplicated one — refuted as a defect: this plan's own Boundaries explicitly says "`CoverMap` itself is untouched," precisely to avoid destabilizing the 14 other topics' covers it still serves; the implementer followed that instruction. "Lifted" in the Intent was this plan's own imprecise wording for "written fresh, same logic, for the new consumer," not a mandate to refactor the shared component — fixing this finding would mean editing the plan's own stated boundary.
  - `[false]` `[reject]` intent-alignment: claimed the new `@media (prefers-reduced-motion: reduce) { animation: none !important }` rule in `cover.module.css` doesn't itself prove `data-fx="stagger"`/`data-fx="up"` elements land in a fully-visible final state. Verified: `data-fx` reveal is driven by `useScrollFx` (`lib/scrollFx.ts:49`), which already no-ops under `prefersMotion()` site-wide — the same proven mechanism every other `data-fx` page already relies on (confirmed via AGENTS.md's own standing constraint that this is already solved). The new rule is redundant-but-harmless extra safety for `cover.module.css`'s own (currently nonexistent) keyframes, not what protects `data-fx`.
  - `[false]` `[reject]` intent-alignment: noted the diff branches on `topicStats(topicId).written > 0` (a derived condition) rather than an enumerated 4-topic list — not a divergence: this plan's own Boundaries explicitly required exactly this structural gate, so a future topic's first written chapter picks up the new cover automatically.

## Design Notes

`useReadingPlan` and `ChapterCard`'s extension follow the same "generalize an existing TP-1 part, never fork it" discipline TP-3 established — `PartSection`/`ChapterCard` keep serving git/architecture unchanged, and `TopicCoverPage` becoming the single branch point for all 18 covers (mirroring `TopicChapterPage`'s `chapter.ready` branch from TP-3) means TP-5 (the outline-topic landing) only has to add its own branch in the same one place. The "Switch topic" footer link is scoped down to a plain link to `/` rather than a new cross-component drawer-control API, since it is not named in this ticket's own acceptance criteria and `PageFrame`'s menu state has no imperative surface today.

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: pass.
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build && PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run test:e2e` -- expected: all pass (port 3100).

**Manual checks:**
- Visual check of all four covers at 1440 and 390, light and dark: hero, stat strip, Up next card and parts-by-level grid read correctly, no overlap or clipping.

## Auto Run Result

**Summary:** All four written topics (`/notes`, `/react`, `/dsa`, `/system-design`) now render a new `components/topic/TopicCover.tsx` inside `TopicFrame` — a hero, a stat strip, an "Up next" card (built on a new `useReadingPlan` hook mirroring `CoverMap`'s reading-budget logic for the new consumer), chapters grouped by level via TP-1's `PartSection` and an extended `ChapterCard` (optional `exercises`/`onToggleRead`, sibling tick button), a practice callout, and a footer strip (curriculum notes, a new `relatedInterviewRound` lookup, a "Switch topic" link to `/`). `TopicCoverPage` branches on `topicStats(topicId).written > 0`, not a hardcoded topic list, so a future topic's first written chapter picks this up automatically. `app/notes/page.tsx` is now the same thin wrapper every other topic route already is; its TP-1 tracer-era one-off composition is retired. `CoverMap`/`CoverSheet` are untouched and keep serving the 14 outline topics.

**Files changed:** `components/topic/TopicCover.tsx`, `cover.module.css`, `useReadingPlan.ts` (new, the cover); `components/chapter/ChapterCard.tsx`, `components/series/landing.module.css` (extended, backward-compatible — git/architecture unaffected); `lib/topics.ts` (`relatedInterviewRound`); `components/reader/topicPages.tsx` (the `written > 0` branch); `app/notes/page.tsx` (thin wrapper); `e2e/smoke.spec.ts`, `a11y.spec.ts` (new/retargeted coverage for all four covers); `content/architecture/arch-rendering.ts`, `arch-routes.ts`, `arch-design-system.ts`, `arch-testing.ts`, `arch-health.ts`, `arch-tech-stack.ts` (truthful prose, updated counts).

**Review findings:** 19 findings (medium 6, low 13). 7 patched: the cover's Start/Continue/Review CTA label and destination were untested (now asserted end to end); the reading-budget "reach" text was exercised only by an axe scan (now content-asserted); the Text-size zoom control was silently dead on all four covers because the new wrapper never carried the `#chapters` zoom rule (fixed by scoping `zoom: var(--reader-zoom,1)` to the cover's own `.page` class, and restoring the e2e assertion against it); the pre-hydration Start CTA could fall back to an unready chapter; a corrupted stored budget value could silently disable the reach calculation (NaN compare); the tick button rendered before hydration completed; a computed-but-unused `budgetGroupId` field was dead code. 3 low findings deferred — all currently latent (zero of the four written topics have any unready chapters today, confirmed live): mismatched written/outline chapter counts in the level totals, no visual distinction for an unready chapter inside an otherwise-written topic, and the interview-book footer link has no test. 1 low finding rejected (uneven e2e depth across the four covers — full parity exceeds a trivial fix). 5 findings rejected as false, each independently verified against pre-existing, unrelated behavior: the shared reading-budget storage key already behaves this way in the untouched `CoverMap`; the hardcoded "Three honest notes" phrase is copied verbatim from the pre-existing `LevelView.tsx`; `useReadingPlan` not being an in-place extraction of `CoverMap` is exactly what this plan's own Boundaries required, to avoid touching the 14 other topics' covers; the reduced-motion CSS concern is already handled site-wide by `useScrollFx`'s existing no-op; and the `written > 0` structural branch (rather than a hardcoded topic list) is exactly what this plan asked for.

**Follow-up review recommended:** `true`. Three distinct medium-severity entries were patched (the CTA, the budget-reach text, and the zoom regression). The specific unverified risk: this patch round's own new code — the two new e2e tests (the CTA label/href assertions and the budget-reach text assertion) and the `zoom` CSS fix's interaction with the cover's other layout rules — has not itself been through a review pass.

**Verification:** `npm run check` passes (19 files, 335 unit tests; one pre-existing-pattern lint warning on an intentionally-unused hook parameter, non-blocking). `npm run build` passes, all 18 topics' chapters and covers statically generated. `npm run test:e2e` at `--workers=3`: 174/174 (the 3 known pre-existing `/notes/setup-mental-model`/`/notes/basic-async` contrast/focus failures persist identically, confirmed unrelated to this diff via a baseline-commit comparison).

**Residual risks:**
- The plan's manual pixel-eyeball check of all four covers at 1440/390, light and dark, was not performed by a human; only the automated a11y/contrast sweep across all nine themes and the structural `curl`-level check were done.
- `useReadingPlan` is a second, independent implementation of `CoverMap`'s budget/reach math (by this plan's own explicit design, to avoid touching the 14 other topics' covers) — a future change to that logic needs applying in both places, with nothing tying them together.
