---
title: 'TP-7 · Path page, rendered on the server'
type: 'feature'
ticket: '8'
created: '2026-10-03'
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
baseline_revision: '541936ff1c0885cfd99e0e2c88c3f7dd6e2d23dc'
---

<intent-contract>

## Intent

**Problem:** `/path?topic=X&level=Y` is a single client-only page (`app/path/page.tsx` + `PathClient.tsx`) that fetches every written topic's full chapter and exercise data up front (confirmed: `topics().forEach` with no topic filter) and picks the topic/level from `useSearchParams` after mount — a large, wasted payload and a page that can never be statically generated or show real content in server HTML.

**Approach:** Give each written topic × level its own static route, `app/path/[topic]/[level]/page.tsx`, `generateStaticParams()` over the 4 written topics (js, react, dsa, system-design — all four already use the same `beginner`/`intermediate`/`advanced` levels), fetching and rendering only that one topic's data inside `TopicFrame`. Old `/path?topic=&level=` links redirect there via `next.config.ts` when both params are present; `app/path/page.tsx` stays as a client fallback for the no-level case, mirroring how TP-5 kept `SoonClient` as a fallback. `LevelView`'s cards (built in TP-6) point at the new URL directly.

## Boundaries & Constraints

**Always:**
- `app/path/[topic]/[level]/page.tsx`'s `generateStaticParams()` enumerates only the 4 written topics (`topicStats()[id].written > 0`) × their own `levels(topicId)` — 12 static pages. Each page fetches `chapterMetas(topicId)`, that topic's exercises and `levelRows(level, chapterById)` only — never the other topics' data `PathClient` used to pull in.
- `components/topic/TopicPath.tsx` (new, client component, mirrors `TopicReader`/`TopicCover`/`TopicOutline`'s shape) renders inside `TopicFrame`: a hero ("Step 2 of 2 · your path", h1 "{Topic} — {Level}", lead, a progress meter, one primary CTA that is Start/Continue depending on progress, secondary "Change level" → `/level/<topic>` and "All chapters" → the topic's cover), the step timeline, a "Practice at this level" grid, and a low-emphasis footer holding "Reset my progress" (kept behind the same `window.confirm` dialog, now out of the hero).
- The step timeline reuses `components/topic/level.module.css`'s `.path`/`.step`/`.stepNode` classes verbatim (the same connected-timeline treatment TP-6 just built for the level cards) rather than inventing a second version of the same pattern.
- Step titles, subtitles, minutes, level tags and exercise titles are all in the server-rendered HTML unconditionally. Only the read-state (checkbox checked, progress meter fill, which step is "next" for the primary CTA) is computed client-side after mount (the same `mounted`-gated pattern `TopicReader`/`TopicCover` already use), so there is no server/client content mismatch to hydrate around — this resolves the ticket's own named unknown.
- Each step's exercise list is behind a native `<details>` disclosure ("N exercises ▾"), open by default only for the first unread step once mounted (closed/collapsed for every other step, and collapsed by default before mount).
- `next.config.ts` gains one more `redirects()` entry: `source: "/path"`, matched on BOTH `topic` and `level` query keys present, `destination: "/path/:topic/:level"`. The existing outline-topic `/path` redirect (TP-5, matched on `topic` alone against the pinned outline-id list) is unchanged and still takes priority for outline topics. `app/path/page.tsx` (no path segments) stays, simplified to the no-level fallback: reads the topic from the query, the level from `lastLevel()` or `"beginner"`, and client-redirects to the new URL.
- `app/level/LevelView.tsx`'s card `href` changes from `` `/path?topic=${topic.id}&level=${level.id}` `` to `` `/path/${topic.id}/${level.id}` ``.
- `e2e/smoke.spec.ts`'s `PAGES` array entry and the theme-accent test both move to `/path/js/beginner`. "The /path sidebar lists only its own topic's chapters" test is rewritten — the new route is topic-scoped by construction (a distinct static page per topic), so cross-topic leakage is no longer a reachable failure mode; replace it with an assertion on the real step count for a specific topic/level.
- `content/architecture/arch-routes.ts`'s `/path?topic=&level=` row and diagram label, and `arch-state.ts`'s `useSearchParams` mention for `/path`, are rewritten for the new static route (the old prose explicitly describes the very over-fetch and client-only rendering this story removes).
- No comments. Theme tokens only.

**Never:**
- Do not touch `/review` or `/progress`, and do not change `progress.reset()`'s scope (it stays a global, all-topics reset — only its placement on the page moves).
- Do not change the outline-topic `/path` redirect TP-5 already built.
- Do not add exercises-collapse state to the practice-at-this-level grid below the steps — only per-step exercises inside the timeline collapse.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| New path page | `/path/js/beginner` | Server HTML contains every step's title; h1 contains "Beginner" | No error |
| Old query link, both params | `/path?topic=js&level=beginner` | 308 redirect to `/path/js/beginner` | No error |
| Old query link, topic only | `/path?topic=js` | Client fallback resolves saved/default level, replaces to `/path/js/<level>` | No error |
| Outline topic | `/path?topic=typescript&level=beginner` | Unchanged: redirects to `/typescript` (TP-5) | No error |
| Written topic, no saved progress | First visit, `mounted` not yet true | 0/N shown briefly, then updates once mounted — no flash of wrong content, only of zero-progress | No error |
| Exercise collapse | A step with exercises, not the next unread one | Collapsed, labelled "N exercises ▾" | No error |
| Reset progress | Footer button clicked | Same confirm-dialog gate, clears all progress | No error |

</intent-contract>

## Code Map

- `app/path/page.tsx`, `app/path/PathClient.tsx` (full files already read) -- the over-fetch (`topics().forEach` building `chapterById`/`chaptersByTopic`/`chapterExercises`/`levelExercises` for every topic) and the `useSearchParams`-driven render to replace; `PathClient.tsx`'s JSX (hero, steps `<ol>`, practice grid, footer) is the content spec for the new `TopicPath.tsx`.
- `components/topic/level.module.css` -- `.path`/`.step`/`.stepNode`/`.card`-family classes to reuse verbatim for the step timeline; no new timeline CSS needed.
- `lib/levelRows.ts` `levelRows`/`byChapterId` -- unchanged, reused per-topic now instead of per-request-param.
- `lib/storage.ts` `progress.countDone`/`isChapterDone`/`isExerciseSolved`/`reset`, `lastLevel`/`rememberLevel` -- unchanged, same API.
- `app/level/LevelView.tsx` -- the one `href` to re-point.
- `next.config.ts` -- the existing `redirects()` array (TP-5 already added two entries here) gains the `/path` both-params rule.
- `e2e/smoke.spec.ts` L22 (`PAGES`), L112-116 (sidebar test to rewrite), L1412-1414 (theme-accent test URL).
- `content/architecture/arch-routes.ts` L36, L159 -- diagram label and table row.
- `content/architecture/arch-state.ts` L176-179 -- `useSearchParams` mention for `/path`.

## Tasks & Acceptance

**Execution:**
- [ ] `app/path/[topic]/[level]/page.tsx` -- the new static route -- the story's deliverable
- [ ] `components/topic/TopicPath.tsx` -- the client component inside `TopicFrame` -- reuses `level.module.css`'s timeline
- [ ] `app/path/page.tsx` -- simplified to the no-level client fallback -- `PathClient.tsx` retired
- [ ] `next.config.ts` -- the both-params `/path` redirect -- closes the old-link gap
- [ ] `app/level/LevelView.tsx` -- re-pointed `href` -- single source of the new URL
- [ ] `e2e/smoke.spec.ts` -- updated/rewritten assertions -- regression guard
- [ ] `content/architecture/arch-routes.ts`, `arch-state.ts` -- truthful prose -- keeps claims honest

**Acceptance Criteria:**
- Given `/path/js/beginner`, when the server HTML is inspected (no JS), then every step's title is present and `#main h1` contains "Beginner."
- Given `/path?topic=js&level=beginner`, when it's requested, then it redirects to `/path/js/beginner`.
- Given `npm run build`, when it runs, then no new dynamic (ƒ) route is reported for `/path/[topic]/[level]`.
- Given "Reset my progress" in the footer, when clicked and confirmed, then all progress clears.
- Given `npm run check` and `npm run test:e2e`, when they run, then all pass, including a11y on the new route in light and dark at 1440 and 390.

## Implementation Notes

- Implemented by a step-03 subagent in one pass. An earlier dispatch attempt was interrupted before any result was recorded (confirmed via a clean `git status` that nothing had changed); re-dispatched fresh with no side effects from the interrupted attempt.
- Review round: all 9 patch-group fixes were applied by the same subagent, re-engaged successfully. One deviation from the literal patch instruction, explained and judged correct: rather than importing the new `pathTopicIds()` helper directly into `next.config.ts` (as the instruction's wording implied), the implementer added a second pinned, test-guarded id list (`PINNED_PATH_TOPIC_IDS`/`PATH_LEVEL_IDS`, mirroring TP-5's `PINNED_OUTLINE_TOPIC_IDS` pattern) after confirming via a failed build attempt that `next-config-ts`'s transpiler still can't resolve the `@/` alias chain through `lib/content.ts` at config-load time — the same constraint TP-5 already hit and solved the same way.
- The most consequential review finding (blind-hunter's claim that `generateStaticParams` would exclude `js` because `content/topics.ts`'s literal has `levels: null` for it) was verified false before being triaged: `content/topics.ts` ends with a module-load-time IIFE that patches `js.levels` from the shared default levels before `topics()` is ever called, confirmed by both the actual build output and a live `tsx` script evaluating the real filter.
- Verification after the patch round: `npm run check` (350/350 unit tests), `npm run build` (still 12 static `/path/[topic]/[level]` pages, no dynamic route), and full `npm run test:e2e` at `--workers=3`: 181/184 (the same 3 known pre-existing, unrelated `/notes/setup-mental-model`/`/notes/basic-async` contrast/focus failures).

## Plan Change Log

## Review Triage Log

### 2026-10-03 — Review pass
- verdicts: 18 findings — high 0, medium 10, low 6, false 2, maybe-false 0
- findings:
  - `[false]` `[reject]` blind-hunter: claimed `generateStaticParams`'s `t.levels` check (`content/topics.ts`'s `js` entry has `levels: null` in its literal) silently excludes `js` from static generation, 404ing `/path/js/*` — refuted: `content/topics.ts` ends with a module-load-time IIFE (`(function () { const js = topics.topics.find(...); js.levels = topics.levels; ... })();`) that patches `js.levels` before `topics()` is ever called. Verified directly: both the actual `npm run build` output (`/path/js/beginner|intermediate|advanced` listed as static ●) and a live `tsx` script evaluating the real filter both confirm `js` is included.
  - `[low]` `[patch]` blind-hunter: `content/architecture/arch-routes.ts`'s new `/path?topic=&level=` row claims unconditionally that both params present redirects to `/path/<topic>/<level>` — doesn't carve out that the pre-existing outline-topic redirect (matched on `topic` alone) is listed first in `next.config.ts` and wins for a pinned outline topic even with a `level` param present. Verified by reading both files.
  - `[low]` `[patch]` blind-hunter: `app/globals.css` still carries the old `.step`/`.step__*`/`.check`/`.check input` global rules — `TopicPath.tsx` uses CSS-module classes instead, and a repo-wide grep confirms nothing renders the bare classnames anymore. Dead CSS.
  - `[medium]` `[patch]` blind-hunter: `components/reader/PracticeStrip.tsx`'s "All N for this level" link still builds the old `/path?topic=&level=` query-string href instead of the new `/path/<topic>/<level>` route `LevelView.tsx` was updated to use in this same diff.
  - `[medium]` `[patch]` blind-hunter: `lib/topics.ts`'s `topicHref()` has the identical old-format leftover.
  - `[medium]` `[patch]` blind-hunter: `lib/topicNav.tsx`'s `navHref()` has the identical old-format leftover — and this is the one call site the ticket's own text named explicitly ("re-points LevelView's links, navHref..."), which this plan's own Boundaries section failed to carry over from the ticket into an explicit task (an intent gap in the plan, not an implementer deviation — same pattern as TP-4's missed architecture files, patched in the same round rather than a full bad_plan loopback since the fix is small and well-specified). `navHref` feeds `Shell.tsx`, `DailyRecap.tsx`, `TopicOfDay.tsx` and `SiteDrawer.tsx` — the sidebar/drawer/widget links sitewide.
  - `[medium]` `[patch]` intent-alignment: same `navHref` gap, found independently from the divergence-in-readings angle, confirming it's real and ticket-named.
  - `[medium]` `[patch]` blind-hunter: the new static page dropped the `topic.status !== "ready"` runtime guard `PathClient.tsx` used to have, relying solely on `generateStaticParams`/`dynamicParams = false` for gating, with no runtime fallback if a topic's status changes between builds.
  - `[medium]` `[patch]` edge-case-hunter: same gap, found independently, specifically that `generateStaticParams`'s filter checks `onShelf`/`t.levels`/`written > 0` but never `t.status === "ready"`, unlike the sibling check the client fallback (`app/path/page.tsx`) still has.
  - `[low]` `[patch]` blind-hunter ("also noted"): the exercise-count `<summary>` puts a bare "▾" glyph directly in the accessible name instead of wrapping it in `aria-hidden`.
  - `[low]` `[patch]` edge-case-hunter: the new `/path` redirect's query-value regex (`.+`) accepts any nonempty string for `topic`/`level`, so a malformed URL can produce a permanent redirect to a `/path/<topic>/<level>` combination that was never statically generated, 404ing with no fallback (unlike the old page, which degraded instead of hard-404ing). Grouped with the next finding — same fix (constrain the regex to known topic/level ids, matching the written+ready guard).
  - `[low]` `[patch]` edge-case-hunter: `app/path/page.tsx`'s level fallback uses `lastLevel()` without validating it against the current topic's actual levels before redirecting — currently unreachable (all 4 written topics share identical `beginner`/`intermediate`/`advanced` levels, confirmed live), but the validation is cheap.
  - `[medium]` `[patch]` edge-case-hunter: `TopicPath.tsx` never calls `rememberLevel(level.id)`, unlike the deleted `PathPageInner`'s mount effect, which called it unconditionally on every `/path` visit — a direct or bookmarked link to `/path/<topic>/<level>`, or browser back, no longer updates the saved level, so later bare `/path` visits or the "Your level" mark (TP-6) can silently use a stale value.
  - `[medium]` `[patch]` verification-gap: a stale-outline topic (ready, has levels, `written === 0`, but absent from `PINNED_OUTLINE_TOPIC_IDS`) falls through the first (outline) redirect rule into the new unconditional second rule, landing on a `/path/<topic>/<level>` URL excluded from static params — a hard 404 with no degrade path, unlike the client fallback's own written-count guard. Same fix as the two edge-case-hunter findings above: give the new redirect rule the same written+ready guard the client fallback already has.
  - `[medium]` `[patch]` verification-gap: the new client-side `PathRedirect` (bare `/path`, or `/path?topic=<written>` with no level) has zero test coverage — no spec visits a URL that would mount it, so a swapped topic/level default or a broken `lastLevel()` fallback would ship undetected.
  - `[medium]` `[patch]` verification-gap: the rewritten mark-as-read/unread button (`onClick` deriving `!chapterDone`, replacing the old native-checkbox `onChange` reading `e.target.checked`) is never click-tested — only pre-seeded rendered state is asserted, so an inverted or stuck toggle would ship undetected on the path's primary progress-tracking interaction.
  - `[low]` `[patch]` intent-alignment: "adds the path to the head-back loop" is correctly implemented (`TopicFrame`'s `back` prop, same pattern as `LevelView`/`TopicReader`) but never asserted — no `.head-back` check was added for `/path/<topic>/<level>` in either touched e2e file.
  - `[false]` `[reject]` intent-alignment: claimed "rendered on the server" should mean the step list's done-state and the pre-expanded exercise panel are correct in the first server paint, not just the step titles — refuted as a defect: this plan's own Boundaries explicitly chose the opposite, named it as resolving the ticket's own "unknown" about hydration without a flash, and matches the identical, already-proven `mounted`-gated pattern `TopicReader`/`TopicCover` use elsewhere in this epic.

## Design Notes

Reusing `level.module.css`'s timeline classes for the path's steps, rather than building a second copy, is the direct payoff of designing TP-6's redesign as a generic connected-path pattern rather than a one-off: the same visual language now serves "pick a level" and "walk a path" without new CSS. The mounted-gated progress state is the same technique `TopicReader`/`TopicCover` already use for the identical problem (static HTML, per-visitor localStorage state) — this story doesn't need a new hydration strategy, just the established one applied here too.

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: pass.
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build` -- expected: pass, `/path/[topic]/[level]` listed as static (●), not dynamic (ƒ).
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run test:e2e` -- expected: all pass (port 3100).

**Manual checks:**
- `curl -s http://127.0.0.1:<port>/path/js/beginner | grep "Setup"` (or similar) against a production build, to directly confirm step titles are in the raw HTML.

## Auto Run Result

**Summary:** `/path?topic=X&level=Y` is now 12 static pages, `app/path/[topic]/[level]/page.tsx` (the 4 written topics × their 3 levels), each server-rendering step titles, subtitles, minutes and exercise lists unconditionally in HTML, with only read-state gated behind the same `mounted` pattern `TopicReader`/`TopicCover` already use. The step timeline reuses TP-6's `.path`/`.step`/`.stepNode` classes verbatim. Old query-param links redirect via `next.config.ts` (both-params case) or a kept client fallback (`app/path/page.tsx`, no-level case); the outline-topic redirect (TP-5) still takes priority. `LevelView`, `navHref`, `topicHref` and `PracticeStrip` all point at the new URL directly.

**Files changed:** `app/path/[topic]/[level]/page.tsx`, `app/path/layout.tsx` (new, the static route); `components/topic/TopicPath.tsx` (new, the client component); `app/path/page.tsx` (rewritten, no-level fallback), `app/path/PathClient.tsx` (deleted); `components/topic/level.module.css` (extended, no new module); `lib/topicIds.ts` (`pathTopicIds()`), `lib/topics.ts`, `lib/topicNav.tsx`, `components/reader/PracticeStrip.tsx` (URL format); `next.config.ts` (the new guarded, constrained redirect); `app/level/LevelView.tsx` (re-pointed href); `app/globals.css` (dead CSS removed); `e2e/smoke.spec.ts`, `a11y.spec.ts`, `tests/next-config.test.ts` (new/updated coverage); `content/architecture/arch-routes.ts`, `arch-state.ts`, `arch-design-system.ts`, `arch-rendering.ts`, `arch-testing.ts`, `arch-health.ts`, `arch-tech-stack.ts` (truthful prose, updated counts).

**Review findings:** 18 findings (medium 10, low 6, false 2). 9 patched: three call sites still building the old query-string URL, one of them (`navHref`) explicitly named by the ticket but missed by this plan's own Boundaries (an intent gap, not an implementer deviation — patched in the same round per the TP-4 precedent rather than a full bad_plan loopback); a missing `status === "ready"` gate in `generateStaticParams`; an unguarded, overly permissive `next.config.ts` redirect that could 404 a stale-outline topic or a malformed URL; a dropped `rememberLevel()` call that let direct/bookmarked path visits silently go stale; an unvalidated `lastLevel()` fallback; an accessible-name glyph; an architecture-prose gap; dead global CSS; and three untested surfaces (the head-back pill, the new client fallback, and the rewritten mark-as-read click handler). 2 findings rejected as false: the claim that `js` would be excluded from static generation was verified false against a live script and the real build output (a module-load-time IIFE in `content/topics.ts` patches `js`'s levels before `generateStaticParams` runs); the claim that server HTML should also carry correct done-state/pre-expanded panels was refuted as compliant with this plan's own explicit, already-proven `mounted`-gating design.

**Follow-up review recommended:** `true`. Six distinct medium-or-higher entries were patched (grouped by root cause). The specific unverified risk: this patch round's own new code — the `pathTopicIds()` helper, the new `PINNED_PATH_TOPIC_IDS`/`PATH_LEVEL_IDS` redirect-constraint mechanism, and the three new e2e tests — has not itself been through a review pass.

**Verification:** `npm run check` passes (20 files, 350 unit tests; the same pre-existing, unrelated `useReadingPlan.ts` lint warning persists, non-blocking). `npm run build` passes, `/path/[topic]/[level]` still lists all 12 pages as static, no dynamic route. `npm run test:e2e` at `--workers=3`: 181/184 (the 3 known pre-existing `/notes/setup-mental-model`/`/notes/basic-async` contrast/focus failures persist identically, consistent across every story this session).

**Residual risks:**
- `PINNED_PATH_TOPIC_IDS`/`PATH_LEVEL_IDS` in `next.config.ts` are hand-maintained (same constraint as TP-5's outline-id list), guarded by a test that fails if they drift from `pathTopicIds()`'s live output.
- `components/reader/ChapterDone.tsx`, the only other historical consumer of the now-deleted `.check` global CSS, was confirmed already-unreferenced dead code predating this story and left untouched as out of scope.

**Follow-up (same session, 2026-10-03):** the user found the shipped visual design unconvincing and asked for a further redesign pass, same as TP-6. Done by hand (not through the bmad-build-auto pipeline): the hero became a two-column layout (question copy + a `statPanel` aside with chapters-left/reading-time/exercise counts), reusing TP-6's own `.statPanel`/`.statRow`/`.statNum`/`.statLabel` CSS classes verbatim rather than forking them. Each step in the path timeline gained a proper boxed card treatment (`.stepBody`: background, border, shadow, accent-colored border on hover/focus-within). The "done" check badge changed from plain grey text to a filled `var(--primary)` background with `var(--on-primary)` mark, dashed-outline when unchecked. One e2e assertion (`doneStepCheck` in `e2e/smoke.spec.ts`) was retargeted from `color`/`--ink-soft` to `background-color`/`accent` to match. Verified the same way as the main build: `npm run check` (350/350 unit tests), `npm run build` (still 12 static `/path/[topic]/[level]` pages), full `npm run test:e2e` (181/184, same 3 pre-existing `/notes/setup-mental-model`/`/notes/basic-async` contrast/focus failures that persist across every story this session).

**Follow-up 2 (same session, 2026-10-03):** two more hand-done passes, same pipeline exclusion as above. (1) The user asked, conversationally, what giving the shared `.page` column more room on medium/large screens would look like; agreed approach was `max-width: min(85%, 1100px)` behind a `min-width: 760px` media query (mobile untouched, since the prior fixed 900px cap was already irrelevant below that width) — shared by `LevelView.tsx` (TP-6) and `TopicPath.tsx` (TP-7) through `level.module.css`. (2) The user then flagged the "Practice at this level" exercise grid on the path page as visually flat and reported what looked like overlapping/duplicated card text in a screenshot; investigated by reproducing the page with `prefers-reduced-motion` forced and the scroll-reveal settled, which rendered cleanly — confirming the screenshot had caught the existing `data-fx` stagger-reveal animation mid-transition (the known, AGENTS.md-documented pitfall), not a real layout bug. Redesigned the cards anyway since the complaint about flatness stood: `#practice-list .practice` (global `app/globals.css`, scoped by the page's `#practice-list` id so the same exercise cards nested inside a step's `<details>` dropdown keep their lighter dashed treatment) now has a solid border, `var(--shadow-sm)` at rest and `var(--shadow-md)` plus an accent-colored border on hover/focus, and the solved tick became a filled `var(--success)` circular badge instead of bare text, matching the badge language already used for the step-done check. This pushed `app/globals.css` from the ~9,200-line bucket to ~9,300, so the three `content/architecture/` chapters asserting that count (`arch-design-system.ts`, `arch-health.ts`, `arch-tech-stack.ts`) were updated to stay truthful per `tests/claims.test.ts`. Verified the same way again: `npm run check` (350/350), `npm run build`, full `npm run test:e2e` (181/184, same 3 pre-existing failures).

**Follow-up 3 (same session, 2026-10-03):** the user pointed at a step card on a wide screen and said the empty space to the right of the text "something is missing", asking for a more advanced, responsive layout across mobile/medium/large. Each ready chapter's step content was split into a `.stepMain` block (title, subtitle, tags, button) and its `.exerciseDetails` accordion as siblings under `.stepBody`; at `min-width: 760px`, `.stepBody:has(> .exerciseDetails)` switches to a two-column grid (`minmax(0,1fr) minmax(230px,300px)`) so the exercise preview sits beside the text instead of leaving the widened card half-empty — below 760px it stays single-column, unchanged. The nested exercise card inside that accordion (global `.practice`, previously still dashed) was restyled to match via `.exerciseDetails :global(.practice)` (solid border, no shadow at rest, accent border + `shadow-sm` on hover) so it no longer looks like a leftover from before the earlier practice-card redesign. The user then asked for the subtitle to stay on one line with a hover tooltip for the full text, and for the tag row and "Mark as read" button to share one `space-between` row instead of stacking — `.stepSub` got `overflow:hidden`/`white-space:nowrap`/`text-overflow:ellipsis` plus a `title` attribute carrying the full text (native tooltip), and the tags + button were wrapped in a new `.stepRow` (`justify-content: space-between`). That surfaced a real, pre-existing-shaped bug while verifying at mobile width: `.stepBody` is a CSS grid item (the `1fr` track of `.step`'s `64px 1fr` columns) with no `min-width: 0`, so its automatic min-width fell back to content-based sizing — and a closed `<details>`'s hidden `.practice-list` (`grid-template-columns: repeat(auto-fill, minmax(260px,1fr))`) contributes a large intrinsic/max-content width to that calculation in Chromium regardless of being visually hidden, inflating `.stepBody` (and everything stretching to its width) to ~900–1000px even at a 390px viewport — clipped invisibly by an ancestor rather than scrolling, so it was easy to miss without checking computed widths directly. Fixed by adding `min-width: 0` to `.stepBody` and `.exerciseDetails` (plus its nested `:global(.practice-list)`), the standard fix for this class of grid/flex intrinsic-sizing leak. Verified with direct `getBoundingClientRect()`/`getComputedStyle()` checks at 390px (confirmed the row's rendered width dropped from ~900px to the correct ~216px) in addition to the usual `npm run check` (350/350), `npm run build`, full `npm run test:e2e` (181/184, same 3 pre-existing failures).
