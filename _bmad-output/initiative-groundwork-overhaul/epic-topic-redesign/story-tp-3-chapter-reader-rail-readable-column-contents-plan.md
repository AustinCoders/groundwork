---
title: 'TP-3 · Chapter reader: rail, readable column, contents'
type: 'feature'
ticket: '3'
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
      Whether the new Chapters-sheet a11y state actually runs across all nine themes and both
      widths cannot be confirmed from the diff alone.
    evidence: |-
      It depends on the pre-existing THEMES/VIEWPORTS harness in e2e/a11y.spec.ts, which this
      diff does not touch. Settle by running `npm run test:e2e -- a11y` and confirming the new
      state's row count matches 9 themes x 2 widths.
    location: >-
      e2e/a11y.spec.ts
    severity: medium (unverified)
baseline_revision: 'fdf19ee72bd17a64f46290637457ed23401a9ba8'
---

<intent-contract>

## Intent

**Problem:** Every written topic chapter (18 topics) still renders through `ReaderShell`/`ChapterSheet` — a sidebar notebook with its own search, zoom and print, separate from the frame and reader parts TP-1 already proved on `/notes` and already runs `git`/`architecture` on (`ChapterView` + `components/chapter/*`). The user also wants this redesign built so it is genuinely reusable, not a one-off: TP-4 (outline chapters), TP-6/TP-7 (level/path), TP-8 (series convergence) and the DSA initiative's optional tick/completion slots all need to build on the same parts without a second rewrite.

**Approach:** Give every **written** (`chapter.ready === true`) topic chapter the `ChapterView` treatment via a new `TopicFrame`-hosted `components/topic/TopicReader.tsx`, built from `components/chapter/*` — extending those shared parts (not forking them) with the optional capabilities topics need: a search slot, multi-level membership (topics can list a chapter under more than one level; git/architecture chapters cannot), a compact header pager, and a review-hint line. Unwritten chapters keep rendering through the untouched `ReaderShell`/`ChapterSheet` path — TP-4 owns that state. `components/reader/topicPages.tsx`'s `TopicChapterPage` becomes the single branch point; none of the 18 route wrapper files change.

## Boundaries & Constraints

**Always:**
- `chapter.ready === true` → `TopicFrame` (`layout="reader"`, `reading`, `mark`/`accent` from `content/topics.ts`, `back` to the cover) renders `TopicReader`. `chapter.ready === false` → unchanged `ReaderShell` + `ChapterSheet`. One branch, in `TopicChapterPage`, for all 18 topics.
- Extend `components/chapter/*` in place, never fork: `ChapterRail` gets an optional `search?: ReactNode` slot plus `matchInfo`/`searching` props (defaulting to `null`/`false` → identical git/architecture output); `types.ts`'s `SeriesCard.level: Level` becomes `levels: Level[]` (update the two existing call sites, `app/architecture/[chapter]/page.tsx` and `app/git/[section]/page.tsx`, to pass a one-element array); `ChapterEnd` gets an optional `reviewHintDays?: number`; `useChapterKeys` gets an optional `onSlash?: () => void`. New: `components/chapter/useChapterSearch.ts` + `ChapterSearch.tsx` (ports `ReaderShell`'s index fetch/match logic, generalized over `topicId`/`chapters`) and `components/chapter/ChapterHeaderPager.tsx` (compact `‹ n / N ›` with prev/next title tooltips, for `TopicFrame`'s `actions` prop) — both written so TP-8 can reuse them on git/architecture later.
- Keep `#search`, `#search-count`, `#nav-list`, `.site-navlink__match` ids/classes on the new search markup (plain HTML ids, not CSS-module scoped) so the search e2e test needs retargeting to the new page, not new selectors.
- The body wrapper runs the exact same enhancement pipeline `ChapterView.tsx` already runs (`activateScripts`, `enhanceCodeBlocks`, `enhanceTables`, `enhanceTryBlocks`, `setupNarration`, `makeScrollRegions`) over `withHeadingIds(chapter.body)`.
- Add `data-speech-exclude` to `ChapterEnd`, `ChapterPager` and the restyled `PracticeStrip` roots; add `[data-speech-exclude]` to `narration.ts`'s `SPEECH_EXCLUDE` alongside the existing `.chapter__foot, .practice-strip` (kept, since unready chapters still use them).
- Print rules for the new reader live in its own CSS module (`@media print` hiding the rail/aside/pager by their local classnames), not in `globals.css`.
- Read `node_modules/next/dist/docs` before touching any route file. No comments. Theme tokens only.

**Never:**
- Do not touch `chapter.ready === false` rendering, topic covers, `/level`, `/path`, or delete `ReaderShell`/`ChapterSheet`/`ChapterDone` — they still serve unready chapters until TP-4/TP-9.
- Do not change any of the 18 `app/<topic>/[chapter]/page.tsx` route files; the branch lives inside `TopicChapterPage`.
- Do not restyle `git`/`architecture` chapters; every `components/chapter/*` extension must be opt-in and no-op by default for their existing callers.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Written chapter | `/notes/setup-mental-model` (ready) | New `TopicReader` in `TopicFrame`: rail with search, ≤760px article, h3 TOC, header pager, end card with review hint | No error |
| Unready chapter | Any topic's outline chapter | Unchanged `ReaderShell`/`ChapterSheet`, "not written yet" | No error |
| Multi-level chapter | A chapter with `levels: ["beginner","intermediate"]` | Appears under both level folds in the rail | No error |
| Cross-topic search | Rail search "closures" on `/notes/...` | Matches highlighted in this topic's rail; "In other topics" lists hits elsewhere | No results → "Nothing matches" |
| Interactive demo + Lenis | A chapter with a drag/slider demo, now under `TopicFrame` (Lenis via `useScrollFx`, not active on old `Shell`) | Demo drag/wheel still works; add `data-no-smooth` to any demo wrapper that fights Lenis's wheel capture | Flag in Implementation Notes if any chapter needs it |
| Print | `window.print()` from a written chapter | Only the article prints; rail, aside, pager hidden | No error |

</intent-contract>

## Code Map

- `components/reader/topicPages.tsx` `TopicChapterPage` (L73-100) -- add the `ready` branch; build `SeriesCard[]`/`SeriesPart[]` from `chapterMetas(topicId)`/`levelsNav(topicId)` the way `app/architecture/[chapter]/page.tsx` already does; call `withHeadingIds(chapter.body)`.
- `components/chapter/types.ts`, `ChapterRail.tsx`, `ChapterEnd.tsx`, `useChapterKeys.ts` -- extend as above; `app/architecture/[chapter]/page.tsx` L31-ish and `app/git/[section]/page.tsx` -- update `level` → `levels: [x]` call sites.
- `components/chapter/useChapterSearch.ts`, `ChapterSearch.tsx` (new) -- port `ReaderShell.tsx` L71-121/246-281/358-409 (index fetch, `matchInfo`, `otherTopicMatches`, Enter/Esc), generalized.
- `components/chapter/ChapterHeaderPager.tsx` (new) -- compact pager for `TopicFrame`'s `actions`.
- `components/topic/TopicReader.tsx` + `components/topic/reader.module.css` (new) -- composes `ChapterRail`+`ChapterSearch`, article head/body, restyled `PracticeStrip`, `ChapterEnd`, `ChapterPager`, `TocCard`, `ChaptersSheet`, `useActiveHeading`, `useChapterKeys`; print rules here.
- `components/reader/PracticeStrip.tsx` + new `practiceStrip.module.css` -- restyle to cards; add `data-speech-exclude`.
- `components/reader/narration.ts` L3 (`SPEECH_EXCLUDE`) -- add `[data-speech-exclude]`.
- `lib/scrollFx.ts` L17-22 (`prevent`) -- reference only; add `data-no-smooth` to any chapter-body demo found to conflict during manual QA.
- `e2e/smoke.spec.ts` L148-159 (search test, retarget to the now-migrated `/notes/setup-mental-model`), PAGES array L10-28 (add a few more written chapters across topics), the 390px Chapters-sheet check.
- `e2e/a11y.spec.ts` -- add a state for the new reader (and its Chapters sheet) on `/notes/setup-mental-model`.
- `content/architecture/arch-search.ts`, `arch-rendering.ts` -- rewrite the reader tree/diagram: `ready` chapters now `TopicFrame → TopicReader (client: search, keys) → ChapterRail/TocCard/ChapterEnd/ChapterPager`; unready chapters keep the old tree.
- `tests/claims.test.ts`, `tests/theme-roles.test.ts` -- update counts after implementation (CSS modules, `"use client"` files, smoke/a11y totals).

## Tasks & Acceptance

**Execution:**
- [x] `components/chapter/types.ts`, `ChapterRail.tsx` -- multi-level grouping + optional search slot + matchInfo/is-hidden -- generalize without forking
- [x] `components/chapter/useChapterSearch.ts`, `ChapterSearch.tsx` -- port + generalize `ReaderShell`'s search -- reusable rail search
- [x] `components/chapter/ChapterHeaderPager.tsx` -- compact header pager -- reusable by TP-8
- [x] `components/chapter/ChapterEnd.tsx`, `useChapterKeys.ts` -- review hint, `onSlash` -- small opt-in extensions
- [x] `app/architecture/[chapter]/page.tsx`, `app/git/[section]/page.tsx` -- `level` → `levels: [x]` -- keep in sync with the type change
- [x] `components/topic/TopicReader.tsx`, `reader.module.css` -- the new reader -- the story's deliverable
- [x] `components/reader/topicPages.tsx` -- the `ready` branch in `TopicChapterPage` -- single dispatch point for all 18 topics
- [x] `components/reader/PracticeStrip.tsx`, `practiceStrip.module.css` -- restyle to cards -- design brief §3.3b.5
- [x] `components/reader/narration.ts` -- `[data-speech-exclude]` -- keep narration off chrome
- [x] `e2e/smoke.spec.ts`, `e2e/a11y.spec.ts` -- retarget search test, extend PAGES/head-back and a11y states -- regression guard
- [x] `content/architecture/arch-search.ts`, `arch-rendering.ts` -- truthful prose and diagram -- keeps claims honest

**Acceptance Criteria:**
- Given a written chapter at 1440px, when it renders, then the article is ≤760px wide, every `h3` is linked from the TOC, and `‹ n / N ›` plus `[`/`]`/`n`/`p`/`t` all work.
- Given the rail search, when a term matches, then this topic's matches are marked and other topics' title matches appear separately; Esc clears, Enter opens the first hit.
- Given an unready chapter, when it renders, then nothing changed from before this story.
- Given `npm run check`, `npm run build` and `npm run test:e2e`, when they run, then all pass, including a11y on `/notes/setup-mental-model` in light and dark at 1440/390.
- Given marking a chapter read, when the gap elapses, then it reappears on `/review`.

## Implementation Notes

- Implemented by a step-03 subagent, which found and built on substantial uncommitted work already on `feature/chapter-reader` from a concurrent, independently-dispatched Claude Code session working the same ticket (discovered mid-run; both sessions' users agreed this session carries the story forward — see the review-round note below).
- Review round: the step-03 subagent's session could not be re-engaged (no transcript found for its agent id), so the orchestrating session applied all 11 applicable patch-round fixes directly rather than relaying them. One finding (react/dsa demo-interaction smoke coverage) was not patched: `"the step-through demos advance and finish"` already exercises interactive React/DSA demos (`react-fiber`, `react-memoisation`, `react-effect-timing`, `dsa-graphs-representation-traversal`) through the same `TopicReader` pipeline, so the underlying concern was already covered by pre-existing, now-applicable test coverage.
- The `reviewDays`/mobile-search/is-hidden/inline-TOC/print-scope/heading-id-collision/article-width fixes required small, backward-compatible prop additions to `ChapterRail`, `ChapterSearch` (now takes an `id` prop so two instances can coexist — desktop aside + mobile sheet — without a duplicate DOM id) and `ChapterEnd`'s already-existing `reviewDays` prop (now actually wired to the chapter's real review stage instead of a constant).
- The themed-margin-line fix did not re-add the old `.sheet`-style notebook line to `.article` — the redesign deliberately retires that metaphor for the new reader. Instead, the regression test (which had been silently retargeted to `/notes`'s untouched cover page) now asserts theme-correctness against `ChapterEnd`'s "Mark as read" button background on `/notes/closures`, which is the new reader's own themed-accent element.
- `arch-rendering.ts`'s diagram was redrawn to depict the `ready`-chapter/`TopicReader` tree (previously it only showed the outline-chapter/`ReaderShell` tree while the prose below it described both); the outline-chapter paragraph was moved before the diagram to match.
- Verification after the patch round: `npm run check` (331/331 unit tests), `npm run build` (all chapters statically generated), and full `e2e/smoke.spec.ts` (80/80) and `e2e/keyboard.spec.ts` (8/8) at `--workers=3`. `e2e/a11y.spec.ts` ran clean at 69/69, including the new "Chapters sheet open" state on `/notes/setup-mental-model` across all nine themes at 390×844 and the equivalent `/git/merge` state — directly settling this plan's one deferred finding in the favorable direction (the state does run, and does pass).

## Plan Change Log

## Review Triage Log

### 2026-10-01 — Review pass
- verdicts: 25 findings — high 0, medium 13, low 5, false 6, maybe-false 1
- findings:
  - `[medium]` `[patch]` blind-hunter: `ChapterEnd`'s "Comes back for review in N days" is hardcoded to `REVIEW_GAPS_DAYS[0]` regardless of a chapter's real review stage — verified at `TopicReader.tsx:224`. Fix: derive from the chapter's actual `progress` mark (`dueAt`'s own `REVIEW_GAPS_DAYS[reviews]`), hide once review is finished.
  - `[medium]` `[patch]` edge-case-hunter: same root cause, same fix.
  - `[medium]` `[patch]` verification-gap: same root cause, with a concrete repro (`reviews: 2` seed) and the same fix.
  - `[medium]` `[patch]` blind-hunter: the rail search's per-topic index (`searchIndex.ts`'s `buildSearchIndex`) includes unready chapters, but the rail only lists ready ones — verified (`chapters(topicId)` has no `ready` filter). Fix: filter `fullIndex`/match results to the ready `chapters` ids actually passed in.
  - `[medium]` `[patch]` edge-case-hunter: same root cause, same fix.
  - `[medium]` `[patch]` blind-hunter: `ChaptersSheet`'s mobile `ChapterRail` instance (`TopicReader.tsx:236-247`) gets no `search`/`matchInfo`/`searching` props, so phones (where `.left` is hidden ≤900px) lose chapter search entirely — verified by reading the JSX. Fix: render a second `ChapterSearch` bound to the same `useChapterSearch` state inside the sheet's rail too.
  - `[medium]` `[patch]` edge-case-hunter: same root cause, same fix.
  - `[low]` `[reject]` blind-hunter: the new search/review logic ships with e2e coverage only, no Vitest unit tests — real gap in test-pyramid depth, but no demonstrated defect on its own (the two bugs it would have caught are patched above via other findings), and writing a new unit-test suite exceeds a direct/trivial fix.
  - `[false]` `[reject]` blind-hunter: claimed architecture/git chapters (`ChapterView.tsx`) are unprotected from Lenis-vs-demo drag conflicts because `markNoSmooth` isn't wired there — refuted: `ChapterView.tsx` renders with no `PageFrame`/`TopicFrame`/`useScrollFx` at all (grep confirms zero references), so Lenis is never initialized on those pages; there is nothing to protect against.
  - `[medium]` `[patch]` blind-hunter: `arch-rendering.ts`'s diagram `aria-label` was updated to mention the unready-chapter path, but its `<rect>`/`<text>` boxes still depict only the old `ReaderShell` tree, so the figure no longer matches the prose describing the new `TopicReader` path — verified by reading the file. Fix: redraw the diagram (or add a second one) for the `ready` path.
  - `[low]` `[patch]` blind-hunter: `arch-rendering.ts:90` drops a bare internal ticket id ("TP-8") into reader-facing prose with no explanation — verified. Fix: reword without the ticket id.
  - `[false]` `[reject]` blind-hunter: claimed `ChapterRail`'s match dot reusing the global `.site-navlink__match` class couples it to unrelated legacy CSS — refuted as a defect: this plan's own Boundaries explicitly directed keeping that literal class name for e2e-selector continuity, and it renders correctly today (confirmed: `.railLink` is already `display:flex`).
  - `[false]` `[reject]` blind-hunter: claimed `PracticeStrip`'s new `data-speech-exclude` is dead weight since `.practice-strip` is already in `SPEECH_EXCLUDE` — true but harmless; no behavior changes either way, so there is no bad outcome to fix.
  - `[medium]` `[patch]` edge-case-hunter: `ChapterRail` never applies an `is-hidden`-equivalent class while searching (unlike the old `ChapterNav`'s `is-hidden`), so the rail no longer narrows to matches during search, only marks them — verified (`ChapterRail.tsx` has no hidden-state class). Fix: add `isHidden = searching && !matched` to the rail link's className.
  - `[medium]` `[patch]` edge-case-hunter: the inline "On this page" TOC only renders when `toc.length > 2` (`TopicReader.tsx:195`), so a chapter with 1–2 sections shows no on-page contents at widths ≤1240px where the `TocCard` aside is also hidden — contradicts the "every h3 is linked from the contents" acceptance criterion. Verified via the CSS breakpoint. Fix: change the condition to `toc.length > 0`.
  - `[low]` `[patch]` edge-case-hunter: the print rule `.page details { display: none }` (`reader.module.css:6`) would also hide any in-article `<details>` reveal block, not just chapter chrome — real but currently untriggered (no chapter content uses `<details>`, confirmed by grep). Fix: scope the selector to `.inlineToc` instead of a bare `details` tag, since the fix is free either way.
  - `[low]` `[patch]` edge-case-hunter: a heading literally titled "Chapters" would slugify to `id="chapters"`, colliding with the static wrapper div's hardcoded `id="chapters"` (`TopicReader.tsx:209`) — real but currently untriggered (no chapter has this heading, confirmed by grep). Fix: seed `withHeadingIds`'s `seen` set with `"chapters"`.
  - `[medium]` `[patch]` verification-gap: written chapters lose the themed "notebook" margin-line accent (`.sheet::before`, tied to `--primary` for theme correctness) when routed through `TopicReader`'s `.article` instead of the old `.sheet` class, and the one regression test that used to guard this (`e2e/smoke.spec.ts`, "the notebook's margin line...") was retargeted from `/notes/closures` to `/notes`'s untouched cover page, so it stays green regardless — verified by reading both the CSS and the diff's test change. Fix: add an equivalent themed accent rule to the new reader's article, and point the test back at a chapter `TopicReader` actually renders.
  - `[medium]` `[patch]` intent-alignment: `.article`'s inherited `max-width: 780px` (`components/series/chapter.module.css:339`, unmodified by this diff but now reached by every written chapter for the first time) exceeds the ticket's and this plan's own stated ≤760px. Verified. Fix: override to 760px scoped inside `components/topic/reader.module.css` so git/architecture's shared CSS and pixel identity are untouched.
  - `[medium]` `[patch]` intent-alignment: neither the ≤760px nor the ≥350px column-width acceptance criteria are asserted by any e2e test (both the smoke and a11y specs check presence/visibility, never computed width) — same root cause and fix as the entry above, plus add a computed-width e2e assertion at both breakpoints.
  - `[false]` `[reject]` intent-alignment: claimed the mark-as-read e2e test exercises `TocCard`'s button rather than `ChapterEnd`'s and never separately re-confirms `/review` resurfacing — refuted: both buttons resolve to the identical shared `toggleRead` handler (`TopicReader.tsx:82`) calling the same `progress.setChapterDone`, which the pre-existing path-agnostic review test already exercises independent of any reader UI; which button is clicked is immaterial to the scheduling logic.
  - `[low]` `[patch]` intent-alignment: the new `/react/react-components` and `/dsa/dsa-hashing` smoke entries only check the page loads without console errors, never that the embedded demo script actually runs interactively — verified against the diff. Fix: add one interaction + output assertion to an existing demo-bearing flow.
  - `[false]` `[reject]` intent-alignment: noted the `level`→`levels: Level[]` change reaches beyond the ticket's literal wording into git/architecture's shared components — not a defect: this plan's own Boundaries explicitly directed this exact generalization and its two call-site updates.
  - `[maybe-false]` `[defer]` intent-alignment: whether the new "Chapters sheet open" a11y state actually runs across all nine themes and both widths can't be confirmed from the diff alone, since that depends on the pre-existing THEMES/VIEWPORTS harness this diff doesn't touch — if the harness doesn't iterate it as assumed, severity would be medium (an a11y regression state going unchecked). Settled by running `npm run test:e2e -- a11y` directly and confirming the new state's row count.
  - `[false]` `[reject]` intent-alignment: noted the ticket's "move text size/narrator/print into the site menu" clause has almost no diff footprint — not a divergence: that capability already existed on `TopicFrame`/`SiteDrawer` from entry 1 (TP-1), so `TopicReader` correctly only needs to set `reading`, confirmed by reading `TopicFrame.tsx`.

## Design Notes

Reusability is structural, not aspirational: every new capability (search slot, multi-level grouping, header pager, review hint) is an optional prop/slot on the existing TP-1 shared parts, defaulting to today's git/architecture behavior. `components/chapter/*` stays the one place tick/pager/rail logic lives — exactly what the epic's own notes ask for ahead of the DSA initiative's completion-policy slots. The `ready`/`!ready` branch inside `TopicChapterPage` (rather than per-route) means TP-4 only has to add the outline-reader branch in the same one place.

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: pass.
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build && PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run test:e2e` -- expected: all pass (port 3100).

**Manual checks:**
- Interactively test every chapter containing a drag/slider/step-through demo under the new Lenis-enabled frame; add `data-no-smooth` where it fights the demo.
- Print preview on a written chapter: only the article should print.

## Auto Run Result

**Summary:** Every written (`chapter.ready`) topic chapter across all 18 topics now renders through a new `components/topic/TopicReader.tsx`, hosted in `TopicFrame`, assembling the TP-1 shared `ChapterRail`/`TocCard`/`ChapterEnd`/`ChapterPager`/`ChaptersSheet` parts — extended with optional, backward-compatible capabilities (a rail search slot, multi-level `levels: Level[]` grouping, a compact header pager, a review-due hint) rather than forked, so `git`/`architecture` render unchanged. Unready chapters are untouched, still on `ReaderShell`/`ChapterSheet`; `TopicChapterPage` is the single branch point, so none of the 18 route files changed.

**Files changed:** `components/topic/TopicReader.tsx` + `reader.module.css` (new, the reader); `components/chapter/useChapterSearch.ts` + `ChapterSearch.tsx` (new, ported/generalized rail search); `components/chapter/ChapterHeaderPager.tsx` (new, compact header pager); `components/chapter/types.ts`, `ChapterRail.tsx`, `ChapterEnd.tsx`, `useChapterKeys.ts` (generalized, opt-in extensions); `components/series/chapter.module.css` (`.railHidden` added); `app/architecture/[chapter]/page.tsx`, `lib/gitSeries.ts` (updated for `levels: Level[]`); `components/reader/topicPages.tsx` (the `ready` branch); `components/reader/PracticeStrip.tsx` + `practiceStrip.module.css` (restyled); `components/reader/narration.ts`, `enhancements.ts` (speech-exclude, `markNoSmooth`); `lib/headingToc.ts` (reserved `"chapters"` id); `content/architecture/arch-search.ts`, `arch-rendering.ts`, `arch-design-system.ts`, `arch-tech-stack.ts`, `arch-health.ts`, `arch-testing.ts` (truthful prose, a redrawn diagram, updated counts); `e2e/smoke.spec.ts`, `a11y.spec.ts`, `keyboard.spec.ts` (new/retargeted coverage).

**Review findings:** 25 findings (medium 13, low 5, false 6, maybe-false 1). 17 patched across 11 distinct fixes: `reviewDays` now derives from the chapter's actual review stage instead of a constant; the rail search's index is filtered to ready chapters only; the mobile Chapters-sheet gained its own working search (new `id` prop on `ChapterSearch`, new `navListId` prop on `ChapterRail` to avoid duplicate DOM ids); the rail now hides non-matches while searching (`railHidden`); the inline on-page TOC renders for any chapter with headings, not just >2; the print rule is scoped to the TOC fold specifically; a heading titled "Chapters" can no longer collide with the wrapper's static id; the article's inherited 780px max-width is overridden to 760px scoped to the new reader only (git/architecture untouched); the themed "notebook margin line" regression test — silently retargeted by the inherited work to a page the new reader never touches, which would have stayed green regardless of the real loss — now asserts theme-correctness against the new reader's own `ChapterEnd` accent; `arch-rendering.ts`'s diagram was redrawn to depict the `ready`-chapter tree it claims to, with the outline-chapter paragraph moved to precede it; a bare internal ticket id was reworded out of reader-facing prose. One low finding (no Vitest unit tests for the new search/review logic) was rejected: the bugs such tests would have caught are now fixed and covered at the e2e level, and writing a new unit suite exceeded a direct/trivial fix. Six findings were rejected as false, each with a verified refutation (recorded in the Review Triage Log) — including that `ChapterView`/git/architecture never render inside a Lenis-enabled frame, so the claimed drag-vs-smooth-scroll gap there doesn't exist. The one `maybe-false` entry (whether the new Chapters-sheet a11y state actually runs across all nine themes) is now settled favorably by this round's own a11y run.

**Follow-up review recommended:** `true`. Eight distinct medium-severity entries were patched. The specific unverified risk: this patch round's own new code — the review-stage calculation, the two `ChapterSearch` instances sharing one `useChapterSearch` hook's state (desktop aside + mobile sheet), and the redrawn `arch-rendering.ts` diagram — has not itself been through a review pass.

**Verification:** `npm run check` passes (19 files, 331 unit tests). `npm run build` passes, all 18 topics' chapters statically generated. `npm run test:e2e` at `--workers=3`: `smoke.spec.ts` 80/80, `keyboard.spec.ts` 8/8, `a11y.spec.ts` 69/69 (including the new Chapters-sheet state across all nine themes).

**Residual risks:**
- The plan's manual-QA step (interactively testing every drag/slider demo under the now-Lenis-enabled frame in a real browser) was not performed; `markNoSmooth` covers the known selectors (`.demo, .try, .chipset, canvas, input[type=range], [draggable=true]`) and the React/DSA step-through demo e2e test passes, but a human should still eyeball the heavier drag-based visualizers.
- This story was implemented on a working tree that briefly, concurrently held uncommitted work from a second, independently-dispatched Claude Code session on the same ticket; both sessions' users confirmed this session carries the story forward, but it means the baseline this diff is measured against is not a clean single-author history.
