---
title: 'Refactor sweep'
type: 'refactor'
ticket: '11'
created: '2026-10-05'
status: 'built'
route: 'full'
route_source: 'auto'
review: 'thorough'
review_source: 'auto'
lenses_ran: ['blind-hunter', 'edge-case-hunter', 'verification-gap', 'intent-alignment']
review_loop_iteration: 0
followup_review_recommended: false
context: ['{project-root}/AGENTS.md']
warnings: []
deferred: []
baseline_revision: '60d6b0a1ea09fb96af0f462cfeadbe53bbc64853'
---

<intent-contract>

## Intent

**Problem:** Entries 1 to 10 of the topic redesign left deferred review findings and leftovers: a skip link that forwards to a 404, a reader that nests one `<main>` inside another, dead CSS and props from the old chrome, a dead `/soon` branch, and a permissions header that still allows geolocation.

**Approach:** Fix the ones that are plain cleanup in a single pass, with no new features and no new UI. Findings that need new tests, new content or design work are recorded as roadmap tasks in `docs/ROADMAP.md` instead.

## Boundaries & Constraints

**Always:** Cleanup only. Every selector or prop is grepped for other users (`app`, `components`, `content`, `lib`, `tests`, `e2e`) before removal; remove only what is proven unused. Keep `npm run check`, the build and the full e2e green. Update every `content/architecture/` sentence or count a change makes false (`tests/claims.test.ts` asserts some). Theme tokens only; no comments in source.

**Never:** No new components, features or visual changes. Do not touch `PageFrame`/`TopicFrame` behaviour, the shared `components/chapter/*` parts' behaviour, `app/api/*`, or content chapters beyond architecture prose. Do not re-sort `.cspell/project-words.txt` (append only).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Skip link | `/notes` loaded, "Skip to ..." activated (hash `#main`) | URL stays on `/notes`, focus moves to the main region, no 404 | none |
| Legacy anchor | `/git#undo` | still forwards to `/git/undo` | none |
| Headers | any page response | `Permissions-Policy` has `geolocation=()` | none |

</intent-contract>

## Code Map

- `components/reader/HashRedirect.tsx` -- `forward()` returns early only for `top`; the skip link's `#main` is forwarded to `/<topic>/main` (a 404). Return early when `document.getElementById(id)` exists. Add an e2e in `e2e/smoke.spec.ts`: on `/notes` and `/git` navigate to `#main`, wait, assert the URL path is unchanged; keep the existing `/git#undo` test.
- `components/topic/TopicReader.tsx` -- `<main className={styles.main}>` sits inside the frame's `<main id="main">`; change to `<div>` (same change was made in `components/series/ChapterView.tsx`). Check `e2e` locators for `main` still resolve to the frame's.
- `components/chapter/useActiveHeading.ts` (param `barRef`, line ~17), `components/topic/TopicReader.tsx`, `components/series/ChapterView.tsx` -- the private progress bar is gone, so `barRef` is never attached; drop the ref, the parameter and its write. Check other callers first.
- `components/series/chapter.module.css` (`.top`, ~line 7 and the 480px block ~1037), `app/architecture/architecture.module.css` (orphaned `[data-tip]:hover::after` / `:focus-visible::after` rules whose base rule was deleted), `components/series/landing.module.css` (`.iconBtn`, `.btn`, `.btn:active`) -- remove each only if grep shows no importer (`ChaptersSheet`, `ChapterHeaderPager`, `PartSection`, `ChapterCard`, the problems, mock and interview pages import these modules).
- `app/globals.css` -- `.plan*` (only if grep proves unused; a `plan` string also appears in `app/mock/Lobby.tsx`, `lib/interviewBook.ts`, content: check class use specifically), and any other leftover from the removed shell that grep proves unused.
- `lib/topics.ts:71` -- `topicHref` returns `/soon?topic=` for a non-`ready` topic; no topic is non-ready and `/soon` is now only a redirect. Remove that branch (and the `status` check in `app/level/[topic]/page.tsx:42` only if every topic is `ready`, keeping the `written === 0` redirect). Update `tests/seo.test.ts:173`'s comment-free assertions and any test that referenced it.
- `next.config.ts` -- `Permissions-Policy` has `geolocation=(self)`; nothing uses geolocation (the weather clock is gone). Change to `geolocation=()`; update the `content/architecture/arch-security.ts` row and any test that asserts the header.
- `docs/ROADMAP.md` -- add one short section "Left over from the topic redesign" listing, one line each, what is NOT fixed here: `app/error.tsx` has no automated test; the route-groups diagram in `arch-routes.ts` has a gap where `/soon` was; build-output figures in the chapters ("1,742 prerendered routes", "1,762 outputs") are not recomputed; cover `ChapterCard` ignores `ready` and `PartSection` totals mix written and outline chapters (TP-2); no test for the cover's interview-book footer link (TP-2); the Chapters-sheet a11y state across nine themes is unverified (TP-3); no CLS check for the loading skeleton (TP-4).
- `_bmad-output/.../story-tp-*-plan.md` -- read-only here.

## Tasks & Acceptance

**Execution:**
- [x] `components/reader/HashRedirect.tsx`, `e2e/smoke.spec.ts` -- skip hash targets that exist on the page; test it -- fixes the 404 on every cover
- [x] `components/topic/TopicReader.tsx` -- inner `<main>` to `<div>` -- one main landmark
- [x] `components/chapter/useActiveHeading.ts` and both readers -- drop the dead `barRef` -- no dead ref
- [ ] the three CSS modules and `app/globals.css` -- remove proven-dead rules -- no dead CSS from the old chrome
- [x] `lib/topics.ts`, `app/level/[topic]/page.tsx`, related tests -- remove the dead `/soon` branch
- [x] `next.config.ts`, `content/architecture/arch-security.ts` -- `geolocation=()`
- [x] `docs/ROADMAP.md` -- record the findings that are not fixed

**Acceptance Criteria:**
- Given `/notes` or `/git`, when the skip link is activated, then the URL path does not change and nothing 404s.
- Given `/git#undo`, when loaded, then it lands on `/git/undo`.
- Given any page, when its response is read, then `Permissions-Policy` contains `geolocation=()`.
- Given the repo, when `npm run check`, `npm run build` and `npm run test:e2e` run, then all pass.

## Implementation Notes

- Scope was set from the `deferred` lists of the epic's plans (TP-0, 1, 2, 3, 4, 8, 9): the fixable ones are above; the rest go to `docs/ROADMAP.md`. TP-0's stale `/level` status gate was already half fixed (it checks the written count); only the dead status half is trimmed.

## Plan Change Log

## Review Triage Log

### 2026-10-05 — Review pass
- verdicts: 25 findings — high 0, medium 3, low 18, false 4, maybe-false 0
- findings:
  - `[low]` `[patch]` blind-hunter: the skip-link test sets the hash directly and sleeps 500 ms — now presses Tab and Enter on the real skip link and waits for the page to settle
  - `[false]` `[reject]` blind-hunter: ids that exist on a cover could stop legacy anchors forwarding — checked: Git's part ids and every topic's chapter ids do not collide with each other or with `top`/`main`
  - `[medium]` `[patch]` blind-hunter: `geolocation=()` has no test and the prose is split across two chapters — `tests/next-config.test.ts` now asserts the header; the two chapters are consistent in meaning
  - `[low]` `[patch]` blind-hunter: dead CSS remains — `.topLeft`, `.topRight` and `.topLeft [data-tip]::after` removed; a script over every importer found no other unused class in `chapter.module.css`
  - `[low]` `[patch]` blind-hunter: nothing pins that every topic is `ready` — new assertion in `tests/seo.test.ts`
  - `[low]` `[reject]` blind-hunter: the smoke flow list and plan bookkeeping are stale — the list names no flow by count claim; the plan is closed out at Finalize
  - `[false]` `[reject]` edge-case-hunter: legacy id collision — see above
  - `[low]` `[reject]` edge-case-hunter: a target mounted after the check still forwards — the skip target is the frame's own `<main>`, rendered on the first paint
  - `[low]` `[patch]` edge-case-hunter: the test's fixed wait — see above
  - `[low]` `[patch]` edge-case-hunter: setting an equal hash fires no event — the test now uses the real link
  - `[low]` `[patch]` edge-case-hunter: `.topLeft`/`.topRight` left — see above
  - `[low]` `[reject]` edge-case-hunter: `Topic.status` type still allows non-ready values — the field stays; the new invariant test enforces it
  - `[low]` `[patch]` edge-case-hunter: `topicHref` no longer guards — same invariant test
  - `[low]` `[reject]` edge-case-hunter: `arch-routes.ts` still has a `/soon` heading — already recorded in `docs/ROADMAP.md`
  - `[low]` `[patch]` edge-case-hunter: the roadmap figures disagree with `arch-health.ts` — the line now says so and names both files
  - `[false]` `[reject]` edge-case-hunter: deleting `barRef` stops a progress bar — nothing reads it; `pct` still feeds `TocCard`
  - `[medium]` `[patch]` verification-gap: `geolocation=()` unverified — same fix as above
  - `[low]` `[patch]` verification-gap: skip-link focus never checked — the test now drives the real link; the 404 regression is pinned
  - `[low]` `[patch]` verification-gap: removed `/soon` branch untested — covered by the new invariant test
  - `[low]` `[patch]` verification-gap: roadmap line has no file path — path added
  - `[low]` `[patch]` intent-alignment: the path page has the same dead status gate — removed
  - `[low]` `[patch]` intent-alignment: TP-8's keyboard-coverage finding was neither fixed nor recorded — recorded in `docs/ROADMAP.md`
  - `[low]` `[patch]` intent-alignment: skip-link test weak and `/git#undo` unchecked — test strengthened; `/git#undo` keeps its own existing test
  - `[medium]` `[patch]` intent-alignment: `geolocation=()` unasserted — same fix as above
  - `[false]` `[reject]` intent-alignment: architecture prose edits drift into content — they only keep sentences true after the header change

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: green
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build` then `npm run test:e2e` -- expected: all pass

## Auto Run Result

**Summary:** Cleaned up what the epic's build records and deferred findings left behind: the skip link no longer forwards to a 404 (`HashRedirect` ignores hashes that exist on the page), `TopicReader` has one `<main>`, the dead `barRef` is gone, dead CSS from the old chrome (`.top`, `.topLeft`, `.topRight`, `.iconBtn`, `.btn`, orphaned `[data-tip]` rules, `.plan`) is removed, the dead `/soon` branch in `topicHref` and the dead status gates on the level and path pages are removed, and `Permissions-Policy` is `geolocation=()`. Findings that need new tests or design work are recorded in `docs/ROADMAP.md`.

**Files changed:** `components/reader/HashRedirect.tsx`, `components/topic/TopicReader.tsx`, `components/series/ChapterView.tsx`, `components/chapter/useActiveHeading.ts`, `components/series/chapter.module.css`, `components/series/landing.module.css`, `app/architecture/architecture.module.css`, `app/globals.css`, `lib/topics.ts`, `app/level/[topic]/page.tsx`, `app/path/page.tsx`, `next.config.ts`, `tests/seo.test.ts`, `tests/next-config.test.ts`, `e2e/smoke.spec.ts`, `content/architecture/arch-security.ts`, `arch-request-path.ts`, `arch-testing.ts`, `arch-health.ts`, `docs/ROADMAP.md`.

**Review:** 25 findings: medium 3 (one root cause, patched), low 18, false 4. Patched 14 findings across five entries, rejected the rest with reasons logged above; nothing deferred.

**Follow-up review recommended:** false. One medium entry patched, no high.

**Verification:** `npm run check` 351/351 unit tests (two added) with only the old `useReadingPlan` lint warning; `npm run build` ok; full `npm run test:e2e` 188/188; the new skip-link test was shown to fail without the fix.

**Residual risks:** the unfixed deferred findings sit in `docs/ROADMAP.md` (error-page test, diagram gap, build-output figures, TP-2 cover cards and footer link, TP-3 sheet a11y across themes, TP-4 CLS, TP-8 keyboard test on an architecture chapter).
