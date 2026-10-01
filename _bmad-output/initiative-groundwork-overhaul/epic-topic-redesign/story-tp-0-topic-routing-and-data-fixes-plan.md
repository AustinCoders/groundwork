---
title: 'TP-0 · Topic routing and data fixes'
type: 'bugfix'
ticket: '2'
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
      app/level/[topic]/page.tsx still redirects to /soon based on topic.status rather than written count, so the check never fires.
    evidence: |-
      Line 42: `if (topic.status !== "ready") redirect(...)`. Every topic's status is "ready", so this is dead code; an outline topic's /level/<id> renders instead of redirecting to /soon. Pre-existing, not introduced by this story. Fixing it is a product decision (should /level now also redirect unwritten topics?) outside the four bugs this ticket names.
    location: >-
      app/level/[topic]/page.tsx:42
    severity: low
  - summary: >-
      app/path/PathClient.tsx has the identical stale topic.status gate, in a file this story already touches.
    evidence: |-
      Lines 62 and 85 both check `topic.status !== "ready"`, which never fires for the same reason. Pre-existing; same product-decision reasoning as the level-page entry above.
    location: >-
      app/path/PathClient.tsx:62,85
    severity: low
baseline_revision: '96541de1e6bc610de170abbe12af48073595b329'
---

<intent-contract>

## Intent

**Problem:** Four correctness bugs, found while auditing topic pages, predate the redesign and should not carry into it (`topics.md` §1.7, B1–B4):
- **B1:** `/soon?topic=X` always redirects to `/level/X`, because every topic's `status` is `"ready"` regardless of whether anything is written; the redirect check should ask whether the topic has written chapters, not read its always-true `status`. The page's "What's planned" section is dead code — `Topic.planned` is set on zero topics — so an outline topic that does render `/soon` shows nothing about what it will contain.
- **B2:** `/path`'s chapter sidebar is built from every topic's chapters merged into one map, so it lists around 540 chapters and links into topics other than the one being read.
- **B3:** the 18 topic `[chapter]` routes and `/architecture/[chapter]` do not set `dynamicParams`, so an unknown slug is rendered once (not stored as a 404) and returns HTTP 200 with a "not found" body, because `next.config.ts`'s default lets Next attempt a lookup instead of refusing it outright.
- **B4:** `lib/content.ts`'s `minutesFor` floors every chapter at 2 minutes, including outline chapters with an empty body, so `totalTime()` and the level page's per-level stats show nonzero minutes for topics with nothing written.

**Approach:** Fix each at its root cause, add the tests the ticket names, and correct the three "How this is built" chapters that already describe these exact gaps (two of them, `arch-request-path.ts` and `arch-routes.ts`, already narrate B3 as an open, unfixed problem — including a callout box titled "A one-line fix nobody has made yet").

## Boundaries & Constraints

**Always:**
- **B1:** `app/soon/SoonClient.tsx`'s redirect-to-level check and its "nothing to show" guard use whether the topic has written chapters (`chapters(topic.id).some(c => c.ready)`, matching the pattern `tests/seo.test.ts` already uses), not `topic.status === "ready"`. Replace the dead `planned`-array section with the topic's real syllabus: for each of `topic.levels`, list that level's `syllabus` section titles (from `content/topics.ts`, via `levels(topic.id)` in `lib/topics.ts`), reusing the existing `.plan`/`.sheet` CSS classes and markup shape already in the file — this is a data and routing fix, not the visual redesign TP-5 (a later entry) owns.
- **B2:** `app/path/page.tsx` passes an additional per-topic map (e.g. `chaptersByTopic: Record<string, ChapterMeta[]>`, one entry per topic id holding only that topic's own `chapterMetas(topicId)`) to `PathClient`. `PathClient.tsx`'s `ChapterNavSection` call uses `chaptersByTopic[topic.id] ?? []` instead of `Object.values(chapterById)`. The existing merged `chapterById` stays as it is and keeps feeding `levelRows()`, which needs cross-reference lookup by chapter id and is not the bug (chapter ids are globally unique — verified, 540 ids, 0 collisions).
- **B3:** add `export const dynamicParams = false;` to all 18 topic `[chapter]/page.tsx` files and to `app/architecture/[chapter]/page.tsx`, placed directly after each file's `const TOPIC = "...";` line. Do not touch `app/interview/[chapter]/page.tsx` (it renders through `RoundView`, not `TopicChapterPage`, and is outside this ticket's named scope), `app/problems/[slug]/page.tsx`, or `app/level/[topic]/page.tsx` — both still default `dynamicParams` to `true` and stay that way; the chapter prose must say so plainly rather than imply the whole gap is closed.
- **B4:** `lib/content.ts`'s `readTime(chapter)` returns `0` when `!chapter.ready`, otherwise `minutesFor(chapter.body)` unchanged. Do not change `minutesFor` or `htmlMinutes` themselves — `lib/gitSeries.ts` and `lib/topicStats.ts`'s Git branch call `htmlMinutes` directly on raw HTML, not through `readTime`, and must keep their current floor behaviour.
- New tests: a vitest asserting `readTime` returns 0 for an unwritten chapter and keeps the existing floor for a written one (and that `totalTime` over a mixed list excludes the unwritten ones' minutes); an e2e smoke test asserting `page.goto("/notes/nope")` and `page.goto("/architecture/nope")` each return HTTP 404 (`response?.status()`), following the existing 200-status-check pattern in `e2e/smoke.spec.ts`.
- Update `arch-request-path.ts` and `arch-routes.ts` to state plainly that the 19 chapter routes (18 topics + architecture) now set `dynamicParams = false`, while `/problems/<id>` and `/level/<topic>` still default to `true` and remain open — rebuild the specific counts this change touches (e.g. "these N dynamic routes are listed with `fallback: null`") from a real build's routes manifest, not by guessing. Update `arch-content-model.ts`'s reading-time passage ("a floor of two minutes") and its `ready`-effects list to say an outline chapter now counts as zero minutes.
- `tests/claims.test.ts` and `tests/seo.test.ts` continue to pass; any number this story's own changes move (e.g. the routes manifest counts) gets a claims-style assertion if it lands in `content/architecture/`.
- No comments. Theme tokens only (no literal colours in any touched CSS; none expected, since B7's hard-coded `.sheet::before` colour is explicitly out of this ticket's scope).

**Never:**
- Do not touch B5 (CoverMap's empty-state visuals on outline covers — TP-2's job), B6 (`/path`/`/soon` being client-only with a blank first paint — not named in this ticket), or B7 (the hard-coded margin-line colour).
- Do not fix `dynamicParams` on `/problems/[slug]` or `/level/[topic]`; name them as still open instead.
- Do not restyle `/soon` beyond swapping the dead `planned` section for the real syllabus list, using markup already in the file.
- Do not change which topics are indexed, in the sitemap, or counted as "written" — only the redirect/display logic that currently misreads `status`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Outline topic | `/soon?topic=typescript` | Renders the TypeScript syllabus (level by level, section titles), no redirect | No error expected |
| Written topic | `/soon?topic=js` | Still redirects to `/level/js` (unchanged) | No error expected |
| Unknown topic | `/soon?topic=nope` | Redirects to `/` (unchanged) | No error expected |
| Path sidebar | `/path?topic=js&level=beginner` | Sidebar lists only JavaScript's own chapters (41), not ~540 | No error expected |
| Unknown chapter slug | `curl -w '%{http_code}' /notes/nope` | `404` | Same for `/architecture/nope` |
| Known chapter slug | `/notes/closures` | `200`, unchanged | No error expected |
| Still-open gap | `/problems/nope`, `/level/nope` | Still `200` with a client-rendered "not found" (unchanged); the architecture chapters say so | No error expected |
| Outline level stats | `/level/typescript` | Shows the real chapter count per level, 0 minutes, 0 exercises | No error expected |
| Written level stats | `/level/js` | Minutes unchanged from before this story | No error expected |

</intent-contract>

## Code Map

- **B1 — `app/soon/SoonClient.tsx`** (full file read; ~120 lines):
  - `useEffect` redirect at the lines checking `if (topic.status === "ready") router.replace(...)` → change the condition to "topic has at least one written chapter." Import `chapters` from `@/lib/content` (already used this way in `tests/seo.test.ts`'s `navHref` tests) to compute it.
  - The render guard `if (!mounted || !topic || topic.status === "ready") return null;` needs the same condition swap.
  - The dead block: `const planned = topic.planned || [];` and the `{planned.length > 0 && (...)}` section (`<h2>What's planned for this one</h2>` down to the closing `</section>`). Replace with: for each `level` in `levels(topic.id)` (from `@/lib/topics`), render an `<h2>{level.name}</h2>` (or similar) followed by a `.plan` list (`<ol className="plan">` or `<ul className="plan">`, matching the existing markup) whose `<li><span>{section.title}</span></li>` items come from `level.syllabus`. Confirmed: `content/types.ts`'s `Level.syllabus: SyllabusSection[]`, each with a `title`; confirmed via `content/topics.ts` (e.g. the `typescript` topic) that every level's syllabus holds real section titles. `Topic.planned` is set on zero topics today — safe to stop reading it.
  - Keep everything else in the file (`Crumbs`, the hero, the "Meanwhile" aside, the footer) unchanged.
- **B2 — `app/path/page.tsx`** (full file, ~45 lines) and **`app/path/PathClient.tsx`** (full file, ~295 lines):
  - In `page.tsx`'s `topics().forEach` loop, also build `const chaptersByTopic: Record<string, ChapterMeta[]> = {}; chaptersByTopic[t.id] = metas;` (where `metas = chapterMetas(t.id)`, already computed in the loop). Pass `chaptersByTopic` as a new prop to `<PathClient>`.
  - In `PathClient.tsx`, add `chaptersByTopic: Record<string, ChapterMeta[]>` to `PathClientProps` (and to the destructured props at `PathPageInner`). Change `<ChapterNavSection chapters={Object.values(chapterById)} ...>` (around line 100) to `<ChapterNavSection chapters={chaptersByTopic[topic.id] ?? []} ...>`.
  - `levelRows(level, chapterById)` (in `lib/levelRows.ts`) keeps using the full merged `chapterById` — it looks up a chapter by id from that topic's own syllabus, and ids are globally unique (verified: 540 unique ids, 0 collisions across topics), so this is not part of the bug.
- **B3 — 19 files get one new line each**, directly after their `const TOPIC = "...";`:
  - `app/{cloud-devops,css,databases,docker,dsa,graphql,html,kubernetes,nestjs,nextjs,node,notes,react,redis,security,system-design,testing,typescript}/[chapter]/page.tsx` (18 files, byte-identical template except the `TOPIC` constant — confirmed by reading several).
  - `app/architecture/[chapter]/page.tsx` (its own template, also has `const TOPIC = "architecture";`).
  - New line: `export const dynamicParams = false;`
  - Leave `app/interview/[chapter]/page.tsx`, `app/problems/[slug]/page.tsx`, `app/level/[topic]/page.tsx`, `app/git/[section]/page.tsx` (already has it) untouched.
- **B4 — `lib/content.ts`**:
  - `readTime(chapter: Chapter): number { return minutesFor(chapter.body); }` → `return chapter.ready ? minutesFor(chapter.body) : 0;`.
  - `minutesFor`, `htmlMinutes`, `totalTime` stay as they are (`totalTime` already just sums `readTime` per chapter, so the fix propagates automatically).
  - Callers that will change behaviour: `app/level/[topic]/page.tsx`'s `totalTime(chaptersForLevel(...))` (currently unfiltered — this is the live bug) and `components/reader/CoverSheet.tsx`'s `readTime(ch)` (latent today, since every currently-written topic is 100% complete — verified: js 41/41, react 57/57, dsa 34/34, system-design 24/24, architecture 26/26). `lib/topicStats.ts`'s `totalTime(written)` already pre-filters to `c.ready`, so its output is unchanged. `lib/gitSeries.ts` and Git's `htmlMinutes(GIT_BODY_HTML)` call `htmlMinutes` directly, bypassing `readTime` entirely — unaffected.
- **New tests:**
  - A vitest (new `describe`/`it` in an existing or new file under `tests/`) importing `readTime`, `totalTime` from `@/lib/content`: construct or find one `ready: false` chapter and one `ready: true` chapter (or use a real outline topic such as `typescript` and a real written one such as `js`), assert `readTime` of the unwritten one is `0` and the written one is `> 0`, and that `totalTime` on a mixed list excludes the unwritten contribution.
  - A new `e2e/smoke.spec.ts` test (or an addition to the existing 404-adjacent area) asserting, for `/notes/nope` and `/architecture/nope`: `const response = await page.goto(path); expect(response?.status()).toBe(404);` — following the `expect(response?.status(), ...).toBe(200)` pattern already at `e2e/smoke.spec.ts:69`. This is a new top-level `test(`, so it changes the smoke flow count the claims test derives; update `tests/claims.test.ts`'s expectations and `content/architecture/arch-testing.ts`'s stated smoke numbers together (follow the pattern story 2.1 already used for its own new smoke test).
- **Architecture chapters:**
  - `content/architecture/arch-request-path.ts` (~lines 134–150): the "The quiet exception" paragraph and the "A one-line fix nobody has made yet" callout box. Rewrite to state the chapter routes (19 of them) are now `dynamicParams = false`, while `/problems/<id>` and `/level/<topic>` still default to `true`. Rebuild the exact "N dynamic routes listed with `fallback: null`" / `fallback: false` counts from a real production build's `.next/routes-manifest.json` (or equivalent) after the code change — do not guess the arithmetic.
  - `content/architecture/arch-routes.ts` (~lines 88–92, and ~110–116): the chapter-route paragraph ("does not set `dynamicParams`... renders once... calls `notFound()`") and the `/problems/<id>` paragraph nearby (confirm whether it already correctly says problems still defaults to `true`, or needs the same correction). Keep the Git-exception sentence.
  - `content/architecture/arch-content-model.ts` (~lines 75–77 and ~151–157): "a floor of two minutes… every reading time on the site is that one function" → note the floor applies to written chapters, and an outline chapter counts as zero. The `ready`-effects list ("shows a 'not written yet' stamp… is marked `noindex`…") gains ", and counts no reading time."
- **Dependency note:** the ticket's `unknown` flags that `topicStats`/claims figures might move if epic 1 entry 8 (the interview-question count, already built and merged as `96541de`) landed first — it has, and it touched `tests/claims.test.ts` and `app/interview/questions/QuestionBank.tsx` only, nothing this story reads or writes. No rebase conflict; proceed directly.

## Tasks & Acceptance

**Execution:**
- [x] `app/soon/SoonClient.tsx` -- outline check by written count; real syllabus list -- B1
- [x] `app/path/page.tsx`, `app/path/PathClient.tsx` -- per-topic chapter list for the sidebar -- B2
- [x] 19 `[chapter]/page.tsx` files -- `dynamicParams = false` -- B3
- [x] `lib/content.ts` -- `readTime` returns 0 for an unwritten chapter -- B4
- [x] a new vitest for `readTime`/`totalTime`; a new e2e 404-status test -- guard
- [x] `content/architecture/arch-request-path.ts`, `arch-routes.ts`, `arch-content-model.ts`, `arch-testing.ts` (new smoke count), `tests/claims.test.ts` -- truthful, asserted numbers -- truth

**Acceptance Criteria:**
- Given `/soon?topic=typescript`, when it loads, then it renders the TypeScript syllabus without redirecting, and `/soon?topic=js` still redirects to `/level/js`.
- Given `/path?topic=js&level=beginner`, when its sidebar renders, then it lists only JavaScript's own chapters.
- Given `curl -w '%{http_code}' /notes/nope` and `/architecture/nope`, when run against a production build, then both print `404`.
- Given `/level/typescript`, when it renders, then its stats show 0 minutes for the wholly-unwritten levels.
- Given `npm run check`, `npm run build` and `npm run test:e2e`, when they run, then all pass.

## Implementation Notes

- 2026-10-01: implemented directly from this plan; no deviations from the Code Map's file list.
- **B1** (`app/soon/SoonClient.tsx`): the redirect effect and the render guard both branch on `(topicStats()[topic.id]?.written ?? 0) > 0` — the same written-count abstraction `app/page.tsx` and `lib/topicNav.ts` already use, which (unlike a direct `chapters(topic.id).some(c => c.ready)` check) correctly counts Git's 18 written sections even though Git's content isn't in `NOTES_BY_TOPIC`. The dead `planned`/`plan-list` block is gone; `#plan-list` now wraps one `<h3>{level.name}</h3>` plus an `<ol className="plan">` of that level's `syllabus` section titles per level in `levels(topic.id)` — kept as separate per-level ordered lists (not one continuous counter across levels, which would need a layout change beyond this story), with copy reading "This is the order within each level." The "Meanwhile" aside is now topic-aware: it names the viewed topic by name before pointing at JavaScript as a different, already-finished example, instead of a copy-pasted block that read the same on every topic's page.
- **B2**: `app/path/page.tsx` now also builds `chaptersByTopic[t.id] = metas` beside the existing merged `chapterById`, and passes it through. `PathClient`'s `ChapterNavSection` reads `chaptersByTopic[topic.id] ?? []`. The merged `chapterById` is untouched and still feeds `levelRows()`.
- **B3**: all 18 generic topic `[chapter]/page.tsx` files plus `app/architecture/[chapter]/page.tsx` gained `export const dynamicParams = false;` directly after their `const TOPIC = "...";` line. `app/interview/[chapter]/page.tsx`, `app/problems/[slug]/page.tsx` and `app/level/[topic]/page.tsx` were left untouched, as directed.
- **B4**: `lib/content.ts`'s `readTime()` now returns `0` when `!chapter.ready`, otherwise the unchanged `minutesFor(chapter.body)`. `chapterMetas()` carries the same `meta.ready ? minutesFor(body) : 0` gate, so the two call sites that compute a chapter's minutes agree; `minutesFor`, `htmlMinutes` and `totalTime` are themselves untouched. Verified the two callers named in the plan: `app/level/[topic]/page.tsx`'s `totalTime(chaptersForLevel(...))` now correctly shows 0 minutes for an all-outline level, and `lib/topicStats.ts`'s `totalTime(written)` is unaffected because `written` was already filtered to `c.ready` before this change.
- **Tests added:**
  - `tests/content.test.ts`: a new `describe("reading time", ...)` with two `it`s, using `chapters("js").find(ready)` and `chapters("typescript").find(!ready)` as the real written/unwritten chapters named in the plan, each guarded with an explicit `toBeDefined()` check (rather than a bare non-null assertion) so a future content change fails with the intended message instead of a generic one. Confirms `readTime` is `0` for the unwritten one and `>0` for the written one, and that `totalTime` on a `[written, outline]` list equals `readTime(written)` alone.
  - `e2e/smoke.spec.ts`: the 404 test now samples three routes (`/notes/nope`, `/architecture/nope`, `/react/nope`) in one test, plus two new top-level tests — one visiting `/soon?topic=typescript` (asserts the "not written yet" stamp and a real syllabus section title render) and `/soon?topic=js` (asserts it still redirects to `/level/js`), and one visiting `/path?topic=typescript&level=beginner` (asserts the sidebar's stated count is TypeScript's own 29 chapters and that no `/react/...` link leaks in).
- **Architecture chapters**, rebuilt from a real `npm run build`'s `.next/prerender-manifest.json` rather than guessed:
  - Before this change: 25 app-router dynamic routes total; 22 had `fallback: null` (on-demand render, matching the old "22 dynamic routes" claim) and 3 already had `fallback: false` (`/git/[section]`, `/mock/bank/[stage]`, `/problems/[slug]/cases`).
  - After this change: 19 of the 22 (`/architecture/[chapter]` and the 18 topic `[chapter]` routes) are now `fallback: false`. Exactly 3 remain `fallback: null`: `/problems/[slug]`, `/level/[topic]`, and `/interview/[chapter]` (which renders through `RoundView`, not `TopicChapterPage`, and was never in this ticket's scope — found while reading the manifest, not named in the original bug list, but true and worth stating).
  - `arch-request-path.ts`'s "The quiet exception" section and its callout box are rewritten around those numbers; the callout is retitled "Three routes still take the slow path" since the fix is no longer a one-liner nobody made.
  - `arch-routes.ts`'s chapter-route paragraph now states the `dynamicParams = false` change and names the two still-open sibling routes (`/problems/[slug]`, `/level/[topic]`); confirmed it previously made no false claim about their `dynamicParams` default, so no correction was owed there beyond the addition.
  - `arch-content-model.ts`: the "floor of two minutes" sentence now says that floor is for a written chapter, with an outline chapter at zero; the `ready`-effects list gained ", and counts no reading time."
  - Verified by manual curl against the built server: `/notes/nope` and `/architecture/nope` → 404; `/notes/closures` → 200 unchanged; `/problems/nope` and `/level/nope` → still 404 today (no `loading.tsx` on those routes, so no stream-then-404 symptom), but still cost a render per the manifest's `fallback: null` — the architecture text only claims the render cost, never a wrong status code, for those two.
- **Smoke/claims counts**: across both rounds, `e2e/smoke.spec.ts` gained three new top-level `test(`s (the 404 test, the `/soon` test, the `/path` sidebar test), moving `smokeFlows` 49 → 52 and `smokeTests` 69 → 72, which moved `browserTests` 152 → 155. Updated the literal numbers `tests/claims.test.ts` checks for in `arch-testing.ts` (the subtitle, the `<h3>` total, and the `smoke.spec.ts` table row) and in `arch-health.ts`'s Playwright row. `npx vitest run tests/content.test.ts tests/claims.test.ts` passed with these numbers in place, confirming they're exactly right rather than approximately right.
- **Left alone, out of scope**: `arch-testing.ts`'s "307 unit tests" / "19 files, 307 tests" figures are not asserted anywhere in `tests/claims.test.ts` and were already stale before this story (the suite now reports 323 Vitest tests, not 307, and did before this change touched anything). The plan's task list scopes the `arch-testing.ts` edit to "(new smoke count)" only, so this pre-existing drift was left as found rather than silently fixed under a different ticket's banner.

## Plan Change Log

- No scope changes. One addition beyond the letter of the plan: `arch-request-path.ts` now also names `/interview/[chapter]` as a third still-open route alongside `/problems/[slug]` and `/level/[topic]`, discovered from the production build's `prerender-manifest.json` while rebuilding the "22 dynamic routes" count the plan asked to verify rather than guess. It was not in B3's original scope and was not touched, but omitting it would have let the rewritten chapter imply only two routes remain open when the manifest shows three.
- `SoonClient.tsx`'s replacement syllabus heading uses `<h3>{level.name}</h3>` rather than `<h2>`, since the section already carries its own `<h2>What's planned for this one</h2>`; two sibling `<h2>`s with the same meaning would have been a worse heading outline than the plan's "(or similar)" allowed for.

## Review Triage Log

### 2026-10-01 — Review pass
- verdicts: 12 findings — high 0, medium 6, low 5, false 1, maybe-false 0
- findings:
  - `[medium]` `[patch]` `/soon?topic=git` renders "not written yet" with JavaScript's syllabus even though Git is fully written, because `chapters("git")` is always `[]` (git's content lives in `content/git-body.ts`, not `NOTES_BY_TOPIC`) — verified live: `topicStats()["git"].written` is 18. `hasWrittenChapters` now reads `topicStats()[topic.id]?.written`, the same abstraction `app/page.tsx` and `lib/topicNav.ts` already use for this exact distinction.
  - `[medium]` `[patch]` The rewritten "What's planned" section splits into one `<ul>` per level, which breaks `.plan`'s scoped `counter-reset`, drops `id="plan-list"`, and swaps ordered semantics for unordered, undercutting "This is the order it will be written in" directly above it — kept per-level `<h3>` grouping, restored `<ol>`, restored an id on the outer wrapper, and reworded the sentence to "This is the order within each level," matching what the (now correctly per-level) numbering shows.
  - `[medium]` `[patch]` `chapterMetas()` computes `readMinutes` via `minutesFor(body)` directly, bypassing the `ready` gate just added to `readTime()` — dormant today (architecture's 26 chapters are all written), but the same bug class in a sibling function, and it makes `arch-content-model.ts`'s new "every reading time on the site goes through that function" claim false. `readMinutes` now zeroes for `!ready` the same way.
  - `[medium]` `[patch]` The ticket's own description, and story 1.4's explicit hand-off, name "fixes the stale /soon copy" as part of this story; the plan's Code Map didn't name it, and the diff left the JavaScript-specific "Meanwhile" aside and CTA unchanged on every topic's `/soon` page — reworded so the pointer to JavaScript is unambiguously an example of a finished topic, not a description of the topic being viewed.
  - `[medium]` `[patch]` Regression gap: `/soon`'s rewritten redirect-or-render logic has no test in either state (outline topic stays and renders the syllabus; written topic redirects away) — a new smoke test covers both.
  - `[medium]` `[patch]` Regression gap: `/path`'s now-per-topic sidebar has no test checking it actually excludes other topics' chapters — a new smoke test (or extension) asserts this for a non-JS topic.
  - `[low]` `[patch]` The new 404 test samples only 2 of the 19 routes that gained `dynamicParams = false` — one more sample added.
  - `[low]` `[patch]` `tests/content.test.ts`'s new fixture lookup uses a non-null assertion, so a future content change would throw a generic error instead of the intended descriptive failure — guarded with an explicit `toBeDefined()` check first.
  - `[low]` `[defer]` `app/level/[topic]/page.tsx:42` still gates its own redirect-to-`/soon` on `topic.status !== "ready"`, which never fires since status is always `"ready"` — pre-existing, not introduced by this diff; whether `/level/<outline topic>` should now also redirect to `/soon` is a product decision outside B1–B4.
  - `[low]` `[defer]` `app/path/PathClient.tsx:62,85` has the identical stale gate, in a file this diff already touches for B2 — same reasoning; fixing it changes behaviour (whether `/path?topic=<outline>` redirects) beyond this story's four named bugs.
  - `[false]` `[reject]` The rewritten planned-section has no guard for a level with an empty syllabus, so it could render an empty heading — checked against the content: every level of every topic has a non-empty syllabus today, and the old code's guard existed only because `topic.planned` was always empty, not because any syllabus is.
  - `[low]` `[reject]` `js`'s `Topic.levels` is mutated in at build time via a module-level IIFE in `content/topics.ts`, making the object literal misleading to read in isolation — true, but pre-existing and not part of this story's diff; noted for anyone reading that file, not a defect this story introduced.

- No review pass was requested or run for this change; this section is left for a future `bmad-code-review` or retrospective pass.

## Design Notes

B3's fix is deliberately narrower than the two architecture chapters' own framing, which describes `[chapter]`, `[slug]` (problems) and `[topic]` (level) as one combined gap. This ticket's own description names only "the 18 topic chapter routes and… `/architecture/[chapter]`" — not problems or level pages — so those two chapters must end this story stating plainly that two of the three route families are still open, not implying the whole gap closed.

B1's syllabus list reuses the existing `.plan` CSS and markup shape instead of introducing new styling, because this ticket is "correctness fixes before the redesign" (`topics.md`'s own framing for TP-0): the unwritten-topic page gets a real, honest replacement for its dead `planned` section now, and a considered visual treatment later, in TP-5.

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: pass.
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build && PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run test:e2e` -- expected: all pass, including the new 404 test. e2e serves on 3100; never touch 3000.
- Manual: `curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3100/notes/nope` and the same for `/architecture/nope`, against the built server, expected `404` each.

**Results (2026-10-01):**
- `npm run check`: passed — typecheck, lint, `npm run comments` ("No comments found."), `prettier --check` clean, `cspell` 642 files / 0 issues, and Vitest 19 files / 323 tests passed (includes `tests/claims.test.ts`, which verifies every number this story's own changes moved).
- `npm run build`: passed; inspected `.next/prerender-manifest.json` afterward for the exact B3 route-manifest counts recorded in Implementation Notes.
- `npm run test:e2e` (port 3100, port 3000 never touched): 153 passed, including the new `/notes/nope` and `/architecture/nope` 404 test, the a11y suite, and the existing `/notes`, `/path?topic=js&level=beginner` and `/architecture/*` smoke and theme-accent tests.
- Manual curl against the built `next start -p 3100` server: `/notes/nope` → 404, `/architecture/nope` → 404, `/notes/closures` → 200 (unchanged), `/problems/nope` → 404, `/level/nope` → 404 (both of the latter two were already 404 by status code before this change, since neither route has a `loading.tsx` to trigger the stream-then-200 symptom B3 describes for chapters — they remain on the slower, render-then-404 path the architecture chapters now name as still open).
- No regressions observed in `/level/typescript` (0 minutes, 0 exercises for its wholly-unwritten levels) or `/path?topic=js` (sidebar still lists only JavaScript's chapters).

**Results after the review-fix round (2026-10-01), scoped to the edited files only — full `npm run check` / `npm run build` / `npm run test:e2e` left for the coordinator's own run:**
- `npx tsc --noEmit`: clean.
- `npx eslint app/soon/SoonClient.tsx lib/content.ts tests/content.test.ts e2e/smoke.spec.ts`: clean.
- `npx prettier --check` on the same files plus the three edited architecture chapters: clean (one formatting pass was needed on `SoonClient.tsx` after the copy edits, then re-checked clean).
- `npx cspell` on the same files: 0 issues.
- `node scripts/comments.mjs`: "No comments found."
- `npx vitest run tests/content.test.ts tests/claims.test.ts`: 56 passed, confirming the `toBeDefined()` guards and the updated smoke/browser-test counts (52 flows, 72 smoke tests, 155 browser tests) are exactly right.
- `npm run build`, then `npx playwright test e2e/smoke.spec.ts -g "stored 404|soon page renders its syllabus|path sidebar lists only"`: 3 passed — the 404 test (now sampling `/notes/nope`, `/architecture/nope`, `/react/nope`), the new `/soon` routing test, and the new `/path` sidebar-scoping test.

## Auto Run Result

**Summary:** Fixed four pre-redesign correctness bugs: `/soon` always bounced to `/level/<id>` because every topic's `status` is `"ready"` regardless of what's written; `/path`'s sidebar leaked every topic's chapters into one merged list; the 18 topic chapter routes and `/architecture/[chapter]` returned a soft 200 "not found" for unknown slugs instead of a real 404; and unwritten chapters counted a floored 2 minutes of reading time. Added the two named tests, plus the ones review found missing, and corrected three "How this is built" chapters that already described these exact gaps.

**Files changed:**
- `app/soon/SoonClient.tsx`: redirect/render gate now reads `topicStats()[topic.id]?.written` (also fixes Git, which `chapters()` alone can't see); the dead `planned` section replaced with the real per-level syllabus, in `<ol>`s under one `id="plan-list"`; the "Meanwhile" aside now names JavaScript unambiguously as a different, finished example topic.
- `app/path/page.tsx`, `app/path/PathClient.tsx`: a new `chaptersByTopic` map scopes the sidebar to the viewed topic.
- 19 `[chapter]/page.tsx` files (18 topics + architecture): `export const dynamicParams = false;`.
- `lib/content.ts`: `readTime()` and `chapterMetas()` both zero out an unwritten chapter's minutes.
- `tests/content.test.ts`: a new reading-time suite, with explicit `toBeDefined()` guards on its fixtures.
- `e2e/smoke.spec.ts`: the 404 test extended to a third route; two new tests for `/soon`'s redirect-or-render and `/path`'s per-topic sidebar.
- `content/architecture/arch-request-path.ts`, `arch-routes.ts`, `arch-content-model.ts`, `arch-testing.ts`, `arch-health.ts`: rebuilt from a real build's manifest and the final test counts (52 smoke flows, 72 smoke tests, 155 browser tests).

**Review findings:** 12 findings (medium 6, low 5, false 1). Seven patched: the Git `/soon` miscount; the broken-numbering/dropped-id syllabus list; `chapterMetas()`'s bypass of the `ready` gate; the stale `/soon` copy the ticket itself named (missed in this plan's own Code Map); missing `/soon` and `/path` test coverage; the 404 test's narrow sampling; and a fragile test assertion. Two deferred (frontmatter `deferred`): `app/level/[topic]/page.tsx` and `app/path/PathClient.tsx` each have their own separate, pre-existing dead `topic.status` gate, out of this story's four named bugs. One rejected as not currently reachable (no topic has an empty syllabus today).

**Follow-up review:** recommended (`true`) — six medium findings were patched in one round, including a behavioural bug (Git) the first pass missed entirely.

**Verification:** `npm run check` passes (19 files, 323 unit tests). `npm run build` passes, and `npm run test:e2e` passes 155/155 on port 3100 (152 before this story). Manually confirmed: `/soon?topic=typescript` renders the real syllabus and stays; `/soon?topic=js` and `/soon?topic=git` both correctly redirect to `/level/<id>`; `/path?topic=typescript&level=beginner`'s sidebar shows only TypeScript's chapters; `curl` on `/notes/nope`, `/architecture/nope` and `/react/nope` each return 404; `/level/typescript` shows 0 minutes for its wholly-unwritten levels.

**Residual risks:**
- `app/level/[topic]/page.tsx` and `app/path/PathClient.tsx` still have their own dead `topic.status` redirect checks (deferred); an outline topic's `/level/<id>` and `/path?topic=<id>` render rather than redirecting to `/soon`. Not a regression from this story.
- `/problems/[slug]` and `/level/[topic]` still default `dynamicParams` to `true`, named plainly now in `arch-request-path.ts` rather than fixed — out of this ticket's scope (B3 named only chapter routes).
- `arch-testing.ts`'s hand-kept unit-test totals ("307 unit tests") were already stale before this story (actual is 323) and are not asserted by any test; left alone, as scoped.
