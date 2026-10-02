---
title: 'TP-5 · A real page for unwritten topics'
type: 'feature'
ticket: '6'
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
baseline_revision: 'fb138320495c7caf98e66f4c4f39a947e079c46e'
---

<intent-contract>

## Intent

**Problem:** An outline topic's cover (`/typescript`) still renders the old `ReaderShell`/`CoverSheet`; the real content people land on for an unwritten topic is `/soon?topic=X`, a client-only page with no server HTML, a hardcoded "Meanwhile… JavaScript" that ignores which topic it's on, and `/level/X`/`/path?topic=X` either render fake empty stats or nothing at all.

**Approach:** Give outline topics a server-rendered `TopicOutline` view on their own cover URL (roadmap by level, a correct `relatedTopicId`-driven Meanwhile link, curriculum notes), mirroring exactly how `TopicCoverPage` already branches written vs. outline (TP-2) and `TopicChapterPage` branches ready vs. outline (TP-3/TP-4). Redirect the three old entry points at it: `/level/[topic]` gets its existing in-component `redirect()` (already used for `status !== "ready"`) extended to `written === 0`, pointed at `/<id>` instead of `/soon?topic=`; `/soon?topic=` and `/path?topic=` — both query-driven with no path segment to statically branch on — get `next.config.ts` redirects matched on the query, so those routes stay static instead of becoming dynamic server routes.

## Boundaries & Constraints

**Always:**
- `TopicCoverPage`'s existing `written > 0` branch (`components/reader/topicPages.tsx`, from TP-2) gets its `else` arm changed from `ReaderShell`+`CoverSheet` to `TopicFrame`+`TopicOutline` — same single dispatch point, same pattern TP-3/TP-4 used for chapters.
- `components/topic/TopicOutline.tsx` (new): hero (mark/accent chip, name, tagline/blurb, a "Not written yet" pill, honest status "N of M chapters written · K levels planned"), a roadmap by level from `level.syllabus` (each section already links to its outline chapter page, built in TP-4), a Meanwhile card via `relatedTopicId` + `relatedInterviewRound` (both already built, TP-4/TP-2), curriculum notes via `curriculumNotes(topicId)` (same accessor `LevelView.tsx` already uses).
- `app/level/[topic]/page.tsx`'s redirect condition (`topic.status !== "ready"`) becomes `topic.status !== "ready" || topicStats()[topic.id]?.written === 0`, destination `` `/${topic.id}` `` instead of `` `/soon?topic=${topic.id}` ``. `generateStaticParams` stays as-is (prebuilds every ready topic; the redirect still fires per-param at build time for outline ones, exactly as it already does today for non-ready ones).
- `next.config.ts`'s `redirects()` gains two more entries (alongside the existing `LEGACY_HOSTS` one): `/soon` and `/path`, each matched with `has: [{ type: "query", key: "topic", value: "(?<topic>outline-id-1|outline-id-2|...)" }]`, `destination: "/:topic"`. The id list is generated from a new, small, server-safe helper (`outlineTopicIds()` in `lib/topicIds.ts`, filtering `topicStats()` by `written === 0 && status === "ready"`), not hand-maintained, so a topic that becomes written drops out of the redirect automatically. This resolves the ticket's own named unknown about coverage; if importing `lib/topicStats` into `next.config.ts` turns out not to build cleanly, fall back to a literal id array in the same file, called out explicitly rather than silently.
- `lib/topicNav.tsx`'s `navHref` and `app/page.tsx`'s `hrefFor` (two independent copies of the same outline-branch condition) both change their outline-topic return from `` `/soon?topic=${t.id}` `` to `` `/${t.id}` ``. `SiteDrawer.tsx`'s topic links and `HomeView.tsx`'s "Being written next" list need no direct change — both already just render whatever `navHref`/`hrefFor` return.
- `app/soon/SoonClient.tsx` stays as a fallback for any `/soon?topic=` hit the next.config redirect doesn't catch (stale external links, a build/deploy gap) — fix its hardcoded "Meanwhile… JavaScript" to use `relatedTopicId` too, for consistency with the new `TopicOutline`, but do not remove the component or its rendering branch.
- `app/sitemap.ts`'s existing outline-topic exclusion (`if (!written.length && !isSinglePage) return;`) is unchanged — outline covers stay out of the sitemap.
- `tests/seo.test.ts:162-168`'s assertion changes from `` navHref(t, "beginner") === `/soon?topic=${t.id}` `` to `` === `/${t.id}` ``.
- No comments. Theme tokens only.

**Never:**
- Do not delete `ReaderShell`, `CoverSheet`, `CoverMap`, or `ChapterNav` even though this story makes them fully unused (zero remaining importers) — topics.md explicitly scopes that cleanup, plus the global CSS and Shell widgets it's tangled with, to TP-9 as its own dedicated story.
- Do not touch `/level/[topic]/page.tsx`'s rendering for `written > 0` topics, or `PathClient`'s client-side behavior for written topics.
- Do not add the new `/<id>` outline cover URL to the sitemap.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Outline cover | `/typescript` | Server HTML: roadmap by level, Meanwhile → JS + R3, curriculum notes, still `noindex` | No error |
| Old /soon link | `/soon?topic=typescript` | 308 redirect to `/typescript` (next.config) | No error |
| Old /level link | `/level/typescript` | 308 redirect to `/typescript` (in-component) | No error |
| Old /path link | `/path?topic=typescript&level=beginner` | 308 redirect to `/typescript` (next.config) | No error |
| Written topic unaffected | `/level/js`, `/path?topic=js&level=beginner`, `/soon?topic=js` | `/level/js` renders; `/path?topic=js` renders; `/soon?topic=js` client-bounces to `/level/js` (unchanged) | No error |
| Stale /soon hit the redirect missed | `/soon?topic=typescript` if next.config somehow doesn't match | `SoonClient`'s existing fallback UI still renders correctly, Meanwhile now correct too | No error |

</intent-contract>

## Code Map

- `components/reader/topicPages.tsx` `TopicCoverPage` -- the `else` arm (currently `ReaderShell`+`CoverSheet`) -- swap for `TopicFrame`+`TopicOutline`, reusing the same `t`/`data` lookups the `written>0` arm already does.
- `app/soon/SoonClient.tsx` L26-130 -- the full outline-topic render, already a near-complete spec for `TopicOutline`'s content (hero, syllabus-by-level); L97-103's hardcoded Meanwhile text -- port to `relatedTopicId`, keep the component as a fallback.
- `app/level/[topic]/page.tsx` L37-42 -- extend the redirect condition and destination as described in Boundaries.
- `lib/topicNav.tsx:59-65` `navHref`, `app/page.tsx:12-15` `hrefFor` -- both outline-branch returns change.
- `lib/topicIds.ts` -- new `outlineTopicIds()` alongside existing `onShelf`.
- `next.config.ts` -- two new `redirects()` entries using `outlineTopicIds()`.
- `lib/topics.ts:32-36` `curriculumNotes`, `lib/topicRelated.ts` `relatedTopicId`, `lib/topics.ts:91-100` `relatedInterviewRound` -- all reused as-is by the new `TopicOutline`.
- `tests/seo.test.ts:162-168` -- updated assertion.
- `content/architecture/arch-coming-soon.ts` L77-81, `arch-routes.ts` L39,153,158,162,167, `arch-state.ts` (context around L177) -- truthful prose for the new routing.

## Tasks & Acceptance

**Execution:**
- [ ] `lib/topicIds.ts` -- `outlineTopicIds()` -- feeds the next.config redirects
- [ ] `components/topic/TopicOutline.tsx` -- the new outline cover -- the story's deliverable
- [ ] `components/reader/topicPages.tsx` -- `TopicCoverPage`'s outline arm -- single dispatch point unchanged from TP-2
- [ ] `app/level/[topic]/page.tsx` -- redirect condition + destination -- closes the `/level/X` gap
- [ ] `next.config.ts` -- `/soon` and `/path` query-matched redirects -- closes the two query-driven gaps
- [ ] `lib/topicNav.tsx`, `app/page.tsx` -- `navHref`/`hrefFor` -- point every internal link at the new URL directly
- [ ] `app/soon/SoonClient.tsx` -- correct the Meanwhile text -- fallback stays honest
- [ ] `tests/seo.test.ts`, `content/architecture/arch-coming-soon.ts`, `arch-routes.ts`, `arch-state.ts` -- updated assertions and prose -- regression guard and truthful claims

**Acceptance Criteria:**
- Given `curl -sL` on `/soon?topic=typescript`, `/level/typescript` and `/path?topic=typescript`, when each resolves, then all three end on `/typescript` with the roadmap present in the HTML.
- Given the home page, when it renders, then "Being written next" → TypeScript lands on `/typescript` directly, not `/soon`.
- Given no topic page, when it renders, then nothing shows "0 / 0" or an invented minutes figure.
- Given `npm run check`, `npm run build` and `npm run test:e2e`, when they run, then all pass, including `tests/seo.test.ts` and `tests/claims.test.ts`.

## Implementation Notes

- `lib/topicIds.ts` gained `outlineTopicIds()` as planned, and it is used by app-side code and by a new guard test (`tests/next-config.test.ts`). It could not be imported into `next.config.ts` itself: Next 16's `next-config-ts` loader only rewrites `@/` path aliases for `next.config.ts`'s own imports, not transitively for files it requires — every nested `@/...` import inside `lib/topicIds.ts`'s own dependency chain (`lib/topics.ts`, `lib/topicStats.ts`, `lib/content.ts`, and onward into `content/*`) resolved to the wrong path when required from the compiled config, breaking `next build` with `Cannot find module './lib/topics'` and then `'./content/topics'`. Per the plan's own fallback clause, `next.config.ts` instead carries a literal, exported `PINNED_OUTLINE_TOPIC_IDS` array. This is called out, not silent: `tests/next-config.test.ts` asserts the pinned array equals `outlineTopicIds()`'s live output and will fail the moment a pinned topic's first chapter ships (or a new outline topic appears) without the array being updated by hand.
- `e2e/smoke.spec.ts` needed more than the one assertion the plan named: the `/typescript` cover's `#site-sidenav` check flipped from 1 to 0 (it now renders `TopicFrame`, not `Shell`); the old `/soon?topic=typescript` test was rewritten around the new redirect (and a new test added for `/level/typescript` and `/path?topic=typescript` doing the same); the `/path` sidebar-scoping test moved off `typescript` (now redirected away from `/path` entirely) onto `react`; and the now-nonexistent "outline cover's notebook margin line" test was deleted outright, since `TopicOutline` never had the old `.sheet::before` notebook motif TP-2 had already dropped for written covers — there is nothing left for that test to check. `ThemeValue` became an unused import after that deletion and was removed.
- Adding `components/topic/outline.module.css` moved the site's CSS-module count from 20 to 21, which is asserted in prose in two places (`arch-design-system.ts`, `arch-tech-stack.ts`); both were updated and `npm test` (which recomputes the count from disk) confirms they match.
- Verification: `npm run check` (341/341 unit tests, including the new `tests/next-config.test.ts`), `npm run build`, and full `npm run test:e2e`: 177/180, with the 3 failures being the same pre-existing `/notes/setup-mental-model` and `/notes/basic-async` contrast/focus violations noted as unrelated flake in TP-4's own Implementation Notes ("persist identically across every story this session has touched").
- Paused overnight right after this first implementation pass, before review; resumed cleanly the next session.
- Mid-session, the user's own dev server (port 3000) hit two unrelated stale-cache symptoms after this story's large file restructuring — a stale `next.config.compiled.js` requiring a dev-server restart, and later an apparent "written topics show the old UI" report that turned out to be the same class of issue (confirmed via a fresh production build on a throwaway port that the `TopicCover` written-topic path was unaffected). Neither was a code regression; both resolved by the user restarting their own server, which this session never touches directly.
- Review round: all 6 patch-group fixes were applied by the same subagent, re-engaged successfully. One fix (the circular dependency between `lib/topicIds.ts` and `lib/topicStats.ts`) went beyond a single-line change — a new `lib/topicShelf.ts` was split out to hold `onShelf`/`INTERVIEW_TOPIC_ID`/`ARCHITECTURE_TOPIC_ID`, with three other call sites (`components/Shell.tsx`, `app/page.tsx`, `lib/topics.ts`) repointed at it — judged proportionate since the alternative (leaving the cycle) was the thing flagged as fragile.
- Verification after the patch round: `npm run check` (343/343 unit tests), `npm run build` (confirms the circular-import fix and the `next.config.ts` loader both resolve cleanly), and full `npm run test:e2e` at `--workers=3`: 177/180 (same 3 pre-existing failures). Manually confirmed via `curl` against a production build: `/soon?topic=typescript` → 308 → `/typescript`; `/level/typescript` → 307 → `/typescript`; `/path?topic=typescript&level=beginner` → 308 → `/typescript`; `/typescript` itself contains "Meanwhile", "Not written yet" and roadmap content; `/level/js` and `/soon?topic=js` (written topic) are unaffected.

## Plan Change Log

## Review Triage Log

### 2026-10-02 — Review pass
- verdicts: 14 findings — high 0, medium 3, low 5, false 6, maybe-false 0
- findings:
  - `[false]` `[reject]` blind-hunter: claimed the new `/soon`/`/path` redirects' unanchored query regex (`` `(?<topic>${outlineIds})` ``) risks a substring partial-match — refuted independently by edge-case-hunter and verification-gap, both confirming via Next.js's own source (`prepare-destination.js`) that `has` query values are always wrapped in `^...$` internally.
  - `[false]` `[reject]` blind-hunter: claimed `next.config.ts`'s `PINNED_OUTLINE_TOPIC_IDS` duplicating `outlineTopicIds()` instead of calling it is a defect — refuted: this is this plan's own explicitly-documented fallback ("if importing `lib/topicStats` into `next.config.ts` turns out not to build cleanly, fall back to a literal id array... called out explicitly rather than silently"), executed exactly as specified, with the drift risk closed by a new guard test (`tests/next-config.test.ts`).
  - `[false]` `[reject]` edge-case-hunter: same finding, found independently, same refutation.
  - `[false]` `[reject]` edge-case-hunter: claimed a stale-redirect risk if the pinned list isn't kept in sync with `outlineTopicIds()` — refuted as a live defect: this is the exact risk the guard test exists to catch, and it does (asserts the two sets are equal, runs in `npm test`/CI).
  - `[low]` `[patch]` blind-hunter: `lib/topicIds.ts` now imports `topicStats` from `lib/topicStats.ts`, which itself imports `onShelf` from `lib/topicIds.ts` — a new circular dependency between the two modules. Works today only because neither call runs at module-eval time. Verified by reading both files. Fix: move `onShelf`/`INTERVIEW_TOPIC_ID`/`ARCHITECTURE_TOPIC_ID` out of the cycle (a third small file, or inline the two-constant check directly in `topicStats.ts`).
  - `[medium]` `[patch]` blind-hunter: `arch-routes.ts`'s updated row introduces new hardcoded counts ("19", "five", "fourteen") with nothing in `tests/claims.test.ts` asserting them — exactly the silent-drift pitfall AGENTS.md's "Known pitfalls" names for `content/architecture/`. Verified: these are genuinely new, unguarded numbers. Fix: add `tests/claims.test.ts` cases deriving them from real data, matching the existing pattern for this file's other numeric claims.
  - `[low]` `[patch]` blind-hunter: the `/path` row in the same chapter claims an outline topic "never reaches this code," while the `/soon` row directly above it candidly notes its own redirect "is reached only when... the redirect's id list was last built" — both rely on the identical pinned-list mechanism, so the `/path` row's claim is inconsistent with the `/soon` row's honesty. Fix: give `/path` the same staleness caveat.
  - `[low]` `[reject]` blind-hunter: noted no architecture chapter describes the new `TopicOutline` component's actual content (the level cards, the "Not written yet" pill, Meanwhile, curriculum notes) — only the routing mechanics. This ticket's own named files (`arch-coming-soon.ts`, `arch-routes.ts`, `arch-state.ts`) are about coming-soon *routing*, not a full UI description; writing new descriptive prose for the page itself exceeds a trivial fix and is better scoped to whichever story next touches this surface.
  - `[false]` `[reject]` blind-hunter: claimed `TopicOutline`'s syllabus-card hrefs aren't validated against real chapter ids — refuted: `tests/content.test.ts:98-107` already asserts syllabus sections only point at chapters that exist, confirmed by verification-gap independently while tracing the same code.
  - `[medium]` `[patch]` blind-hunter: the new e2e tests for `/typescript` only assert the heading and the "Not written yet" pill — nothing exercises the Meanwhile link, the interview-round link, or the written/planned counts. Same root cause and fix as the next entry.
  - `[medium]` `[patch]` verification-gap: same finding, with a concrete repro (swap/drop `relTopicId`/`relatedRoundHref` wiring and none of the three `/typescript`-visiting tests would catch it) and fix (assert the Meanwhile link's href and the `/interview/r3` round link on an existing `/typescript` test, mirroring the pattern already used for `TopicOutlineChapter`).
  - `[false]` `[reject]` intent-alignment: noted `/level/<outline>`'s redirect lives in the page component while `/soon`/`/path` use `next.config.ts`, diverging from a literal reading of the ticket's single sentence naming all three together — refuted as a defect: `arch-state.ts`/`arch-routes.ts`'s own prose already describes this exact split consistently, confirming it's a deliberate design choice (the ticket's own Design Notes explain why `/level` needed a different mechanism), not an oversight, and the ticket's actual verification (curl behavior) holds regardless of mechanism.
  - `[low]` `[patch]` intent-alignment: the outline cover's one theme-token-dependent rule (`.meanwhileLink:hover { color: var(--primary) }`) has no test, and the one e2e test that used to check theme-accent correctness on the old outline cover (the notebook margin line) was deleted with no replacement for the new page. Verified: the old test is legitimately obsolete (the new page doesn't use `.sheet`), but nothing replaced its theme-correctness coverage. Fix: add the new outline covers to an existing theme-accent sweep test, or a new one, per AGENTS.md's standing constraint that all nine themes and the contrast test depend on this.
  - `[low]` `[patch]` intent-alignment: `app/soon/SoonClient.tsx`'s hero CTA is still hardcoded to `/level/js` ("See the JavaScript path →") rather than using the same `relatedHref`/`relTopicId` it now computes for its own Meanwhile box — the fallback page's two related-topic mentions disagree with each other. Fix: point the CTA at the same computed `relatedHref`.

## Design Notes

The `/level/[topic]` and the `/soon`+`/path` cases need genuinely different mechanisms, not the same one applied twice: `/level/[topic]` already has a path segment and a working in-component `redirect()` precedent for exactly this kind of per-topic branching (it already redirects non-ready topics today), so extending its existing condition is the smallest change. `/soon` and `/path` have no topic in the path at all — only a query string — so branching server-side would force those routes to become dynamic; a `next.config.ts` redirect, evaluated by the routing layer before the app even runs, is the only way to keep them static while still redirecting correctly. Generating the outline-id list for that redirect from `topicStats()` rather than hand-maintaining it is what keeps this story's work from silently going stale the next time a topic's first chapter ships.

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: pass.
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build && PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run test:e2e` -- expected: all pass (port 3100).

**Manual checks:**
- `curl -sL` the three old entry points for `typescript` against a production build and confirm each lands on `/typescript` with real roadmap HTML, not a redirect loop or an empty shell.

## Auto Run Result

**Summary:** Every outline topic's cover (`/typescript`, `/node`, etc., 14 total) now renders a new server-rendered `components/topic/TopicOutline.tsx` inside `TopicFrame` — a roadmap by level, a correct `relatedTopicId`-driven Meanwhile link to a written topic and its interview round, and curriculum notes — replacing the old `ReaderShell`/`CoverSheet`. The three old entry points (`/soon?topic=`, `/level/<outline>`, `/path?topic=<outline>`) all redirect straight to the new cover: `/level/[topic]` via its existing in-component `redirect()` (extended from a `status`-only check to also cover `written === 0`), `/soon` and `/path` via two new `next.config.ts` redirects matched on the `topic` query, kept static via a pinned topic-id list (next.config's loader can't resolve the `@/` alias chain through `lib/content`'s full dependency graph) guarded by a new `tests/next-config.test.ts` that fails if the pinned list ever drifts from the live `outlineTopicIds()`. `navHref` and `hrefFor` now point at the new URL directly everywhere internally.

**Files changed:** `components/topic/TopicOutline.tsx`, `outline.module.css` (new, the outline cover); `lib/topicShelf.ts` (new, broken out to resolve a circular import); `lib/topicIds.ts` (`outlineTopicIds()`); `next.config.ts` (two new redirects); `app/level/[topic]/page.tsx` (redirect condition/destination); `lib/topicNav.tsx`, `app/page.tsx` (`navHref`/`hrefFor`); `app/soon/SoonClient.tsx` (kept as a fallback, Meanwhile and CTA both now correctly computed); `components/reader/topicPages.tsx` (`TopicCoverPage`'s outline arm); `tests/seo.test.ts`, `tests/claims.test.ts`, `tests/next-config.test.ts` (new), `e2e/smoke.spec.ts`; `content/architecture/arch-coming-soon.ts`, `arch-routes.ts`, `arch-state.ts`, `arch-design-system.ts`, `arch-tech-stack.ts`.

**Review findings:** 14 findings (medium 3, low 5, false 6). 6 patched: a circular dependency between `lib/topicIds.ts` and `lib/topicStats.ts` (resolved by extracting `lib/topicShelf.ts`); two new hardcoded counts in `arch-routes.ts` with nothing asserting them (now guarded in `tests/claims.test.ts`); a prose inconsistency between the `/soon` and `/path` rows' staleness honesty; the Meanwhile link, interview-round link and chapter counts on an outline cover were untested (now asserted); the new outline cover's one theme-token-dependent rule had no replacement for the deleted old theme-accent test (now covered in the existing per-theme sweep); and `SoonClient`'s fallback hero CTA was hardcoded to `/level/js` independent of its own Meanwhile computation (now shares one computed href). 1 low finding rejected: no architecture chapter describes the new `TopicOutline` page's actual content, only its routing — out of this ticket's own named scope. 6 findings rejected as false, each independently verified: the redirect regex is anchored by Next.js itself internally; the pinned-list/`outlineTopicIds()` split and its staleness risk are both this plan's own explicit, guarded fallback design, not a silent gap; the `/level` redirect living in the page component rather than `next.config.ts` is a deliberate, documented, internally-consistent design choice; and the syllabus-card href validation concern is already covered by an existing unit test.

**Follow-up review recommended:** `true`. Two distinct medium-severity entries were patched (the untested-counts group and the Meanwhile/round-link-untested group). The specific unverified risk: this patch round's own new code — the `lib/topicShelf.ts` extraction and its three repointed call sites, and the new theme-accent assertion added to an existing sweep test — has not itself been through a review pass.

**Verification:** `npm run check` passes (20 files, 343 unit tests; the same pre-existing, unrelated `useReadingPlan.ts` lint warning persists, non-blocking). `npm run build` passes, all 14 outline topics' covers and all 18 topics' chapter routes statically generated. `npm run test:e2e` at `--workers=3`: 177/180 (the 3 known pre-existing `/notes/setup-mental-model`/`/notes/basic-async` contrast/focus failures persist identically, consistent across every story this session). Manually confirmed via `curl`: all three old entry points for `typescript` redirect to `/typescript` with real roadmap content; written topics (`/level/js`, `/soon?topic=js`) are unaffected.

**Residual risks:**
- `PINNED_OUTLINE_TOPIC_IDS` in `next.config.ts` is hand-maintained; the guard test will fail loudly the day a pinned topic's first chapter ships or a new outline topic is added, but until someone runs or sees that failure, the redirect table could silently miss a topic.
- No architecture chapter describes the new `TopicOutline` page's content (level cards, the "Not written yet" pill, Meanwhile, curriculum notes) — only where the old entry points now redirect to. Worth a pass if the site's architecture docs are ever audited for completeness again.
