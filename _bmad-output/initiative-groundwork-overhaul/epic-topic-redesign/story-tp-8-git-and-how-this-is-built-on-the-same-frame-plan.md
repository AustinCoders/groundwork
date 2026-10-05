---
title: 'TP-8 · Git and How this is built on the same frame'
type: 'feature'
ticket: '9'
created: '2026-10-05'
status: 'built'
route: 'full'
route_source: 'auto'
review: 'thorough'
review_source: 'auto'
lenses_ran: ['blind-hunter', 'edge-case-hunter', 'verification-gap', 'intent-alignment']
review_loop_iteration: 0
followup_review_recommended: true
context: ['{project-root}/AGENTS.md']
warnings: []
deferred:
  - summary: >-
      Private-header CSS is left behind after the move to the frame: `.top` in the 480px block of `chapter.module.css`, orphaned `[data-tip]:hover::after` rules in `architecture.module.css`, and `.iconBtn`/`.btn` in `landing.module.css`.
    evidence: |-
      Review passes 1 (blind-hunter, edge-case-hunter, verification-gap). Dead-CSS removal belongs to the refactor sweep; each selector must be grepped for other users first (`ChaptersSheet` and `ChapterHeaderPager` may still use `.iconBtn`/`.btn`).
    location: >-
      components/series/chapter.module.css, app/architecture/architecture.module.css, components/series/landing.module.css
    severity: low
  - summary: >-
      The Chapters sheet and keyboard test run only on `/git/merge`, not on an architecture chapter.
    evidence: |-
      Both pages share `ChapterView`, so the code path is the same; only a coverage gap.
    location: >-
      e2e/keyboard.spec.ts:98
    severity: low
baseline_revision: '82442da46b9ecfe34bd07ddef217a2adc5090f0f'
---

<intent-contract>

## Intent

**Problem:** `/git`, `/git/<section>`, `/architecture` and `/architecture/<chapter>` still render in their own hand-rolled chrome (`SeriesLanding`, `series/ChapterView`, `ArchitectureView`: an icon-only back button, a private `.top` header, a private progress bar), so they look and behave differently from every other topic page that now sits in `TopicFrame` (labelled back pill, brand, title chip, shared scroll bar, menu).

**Approach:** Render all three views inside `TopicFrame` the way `TopicCover` and `TopicReader` do, with Git and How-this-is-built as the frame's topic (name, mark, accent from `content/topics.ts`). Reuse the settled shared parts (`ChapterRail`, `TocCard`, `ChapterEnd`, `ChapterPager`, `ChapterHeaderPager`, `ChaptersSheet`, `PartSection`, `ChapterCard`) as they are; delete the private header, menu state and `SiteDrawer`/`DiagramDefs` from the three views, because the frame owns them.

## Boundaries & Constraints

**Always:** Keep the Git progress key prefix (`git-`) exactly as it is; the shared rail and cards receive `done` keyed by bare chapter id, so no key changes and no migration (this answers the ticket's unknown). Keep `/git`, `/git/<section>`, `/architecture`, `/architecture/<chapter>` URLs, metadata, `HashRedirect`, static params and the architecture "system on one page" map unchanged. Exactly one set of diagram defs per page (the frame adds them when `reading`). Landing pages: `back` is the frame default (Home). Chapter pages: `back` is `{ href: basePath, label: seriesTitle }`, `layout="reader"`, `reading`, `scan={chapter.id}`, header actions = `ChaptersSheetButton` + breadcrumb + `ChapterHeaderPager`. The landing's Start/Continue button moves into the frame `actions` as `btn btn--primary` and keeps its exact label text. Style with theme tokens only. No comments in source.

**Never:** Do not touch `TopicReader`, `TopicCover`, `TopicFrame`, `PageFrame` or the shared `components/chapter/*` parts' behaviour. Do not add search to Git or architecture chapters (Git has no search index). Do not delete CSS rules still used by `TopicReader` from `chapter.module.css`. Do not delete the old `Shell`/`ReaderShell` (TP-9) or sweep dead CSS (the refactor sweep).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Landing | `/git`, `/architecture` | Frame header with back pill titled Home, brand, title chip (mark + name), Start/Continue reading button; hero, facts, map/parts below | none |
| Chapter | `/git/merge`, `/architecture/arch-request-path` | Back pill labelled Git / How this is built to the series landing, rail, contents card, prev/next in the header, `[` `]` keys, mark-as-read | none |
| Progress | Git chapter read before the change | Still shown read in rail, cards and "n/N read" | none |
| Narrow screen | 390px | Rail opens in the Chapters sheet; no horizontal scroll | none |

</intent-contract>

## Code Map

- `components/series/SeriesLanding.tsx` -- Git landing; has private `.top` header, `useState` menu, `SiteDrawer`, `DiagramDefs`, `BackButton`. Becomes `TopicFrame` consumer; replace the `crumb` prop with a `topic` prop `{ name, mark, accent }`.
- `components/series/ChapterView.tsx` -- series chapter reader used by Git and architecture; same private header, progress bar and menu. Convert to `TopicFrame` like `components/topic/TopicReader.tsx` (the model: lines 122-243), minus search, exercises and review hint. Add the same `topic` prop.
- `app/architecture/ArchitectureView.tsx` -- architecture landing; same private header. Convert to `TopicFrame`; keep `LANES`, facts, map and parts markup.
- `app/git/page.tsx`, `app/git/[section]/page.tsx`, `app/architecture/page.tsx`, `app/architecture/[chapter]/page.tsx` -- pass the topic's name/mark/accent (read them from `topics()` by id `git` / `architecture`, do not hard-code).
- `components/series/landing.module.css`, `components/series/chapter.module.css`, `app/architecture/architecture.module.css` -- drop only the rules that were solely for the removed private header; keep every rule `TopicReader` or the shared parts still use (`chapter.module.css` `.page`, `.body`, `.left`, `.main`, `.article`, `.crumbs`, `.head`...; `landing.module.css` is also imported by `PartSection`/`ChapterCard`).
- `components/topic/TopicFrame.tsx`, `components/frame/PageFrame.tsx` -- read-only; props `topic`, `back`, `actions`, `reading`, `layout`, `skip`, `scan`.
- `e2e/smoke.spec.ts` -- the git/architecture accent test (~lines 1332-1390) uses `[class$='__progress'] > div` (the private bar, now gone: use `[data-scrollbar]`); add `/git`, `/git/merge`, `/architecture`, `/architecture/arch-request-path` to a head-back test (pattern: lines 112-125 and 180-190: pill visible, `title` is the label, `href` is the target).
- `tests/theme-roles.test.ts` lines 44-45, `tests/claims.test.ts`, `content/architecture/arch-rendering.ts`, `arch-design-system.ts`, `arch-routes.ts`, `arch-testing.ts`, `arch-state.ts` -- numbers and prose about frames, shells and spec counts are asserted; update the chapter prose if a count changes.

## Tasks & Acceptance

**Execution:**
- [x] `components/series/SeriesLanding.tsx` -- wrap in `TopicFrame` (`reading`, default Home back, `skip` "Skip to the chapters"), put the Start/Continue link in `actions`, remove menu state/`SiteDrawer`/`DiagramDefs`/private header -- one frame for all topics
- [x] `components/series/ChapterView.tsx` -- convert to `TopicFrame` per `TopicReader`; keep `progressPrefix`; keep `activateScripts`/`enhance*`/narration/scroll-region wiring; remove private header, progress bar, menu, `DiagramDefs` -- same reader chrome as every topic
- [x] `app/architecture/ArchitectureView.tsx` -- convert to `TopicFrame` (`reading`, `actions` = Start/Continue); keep map, facts and parts
- [ ] the four `page.tsx` files -- supply the frame topic from `topics()` -- no hard-coded marks
- [ ] the three CSS modules -- remove now-unused private-header rules only
- [x] `e2e/smoke.spec.ts` -- fix the accent test's progress-bar locator; add the head-back loop for the four paths
- [ ] architecture chapters / `tests/` -- keep asserted counts and prose true

**Acceptance Criteria:**
- Given `/git`, `/git/merge`, `/architecture` or `/architecture/arch-request-path`, when loaded, then `header a.head-back` is visible with the expected `title` and `href`, and the page has exactly one set of diagram defs.
- Given a Git chapter marked read before this change, when `/git` loads, then it still shows as read.
- Given any of the four pages at 390px, when loaded, then there is no horizontal scroll and the Chapters sheet still holds focus and returns it on Escape.
- Given `npm run check`, `npm run build` and the full `npm run test:e2e`, then all pass except the three known unrelated a11y failures if they still exist (they were fixed in 82442da, so expect 184/184 plus the new test).

## Implementation Notes

- `components/series/SeriesLanding.tsx`, `ChapterView.tsx`, `app/architecture/ArchitectureView.tsx` now render inside `TopicFrame`; the private header, menu state, `SiteDrawer` and `DiagramDefs` are gone. Landings use `<div>` for the body because the frame supplies `<main id="main">`.
- `lib/topics.ts` gained `frameTopic(id, href)`; the four `page.tsx` files pass it as `topic`, replacing `SeriesLanding`'s `crumb` prop.
- `markNoSmooth(el)` was added to `ChapterView`'s effect (not in the plan): the frame turns on smooth scrolling (`lib/scrollFx.ts` skips `[data-no-smooth]`), so demos, try blocks and code need it exactly as in `TopicReader`.
- The `git-` progress prefix is untouched; the rail and cards receive `done` keyed by bare id. The new landing test seeds `git-<id>` progress to prove it.
- Subagent (aaa97c5e631eb0fb1) implemented; the review patches below were applied by the coordinator because they were three small edits.

## Plan Change Log

## Review Triage Log

### 2026-10-05 — Review pass
- verdicts: 32 findings — high 0, medium 5, low 15, false 12, maybe-false 0
- findings:
  - `[low]` `[reject]` blind-hunter: `barRef` in `ChapterView` no longer attached to an element — same leftover as `TopicReader`; the hook null-checks it, so it is a silent no-op, and removing it means changing the shared `useActiveHeading` signature
  - `[low]` `[defer]` blind-hunter: private-header CSS left behind in the three modules — the sweep entry (2.11) owns dead-CSS removal; `.top` in `chapter.module.css` is still used by other pages
  - `[false]` `[reject]` blind-hunter: whitespace churn in the CSS modules — `git diff -w --stat` shows the same 262 deletions as the plain stat, so every removed line is a real rule
  - `[low]` `[patch]` blind-hunter: `frameTopic` silently falls back to a blank mark and `ink` accent — now throws on an unknown id
  - `[medium]` `[patch]` blind-hunter: acceptance criteria (carried-over Git progress, 390px) untested — new landing test added
  - `[false]` `[reject]` blind-hunter: `[data-scrollbar]` locator may be strict-mode ambiguous — the accent test passed in the full run
  - `[medium]` `[patch]` blind-hunter: `ChapterView` keeps an inner `<main>` inside the frame's `<main id="main">` — changed to `<div>` (same pre-existing pattern in `TopicReader` is a separate, earlier story's)
  - `[false]` `[reject]` blind-hunter: chapter prose in arch-rendering/design-system/routes/state not updated — none of them name `SeriesLanding`, `ChapterView` or `ArchitectureView`, and `tests/claims.test.ts` passes
  - `[false]` `[reject]` blind-hunter: `markNoSmooth` is an unplanned behaviour change — required for parity, see Implementation Notes
  - `[false]` `[reject]` blind-hunter: `homeLabel` prop is dead — `ChapterRail` and `ChapterPager` still read it
  - `[false]` `[reject]` blind-hunter: stacking two CSS modules' classes — identical to `TopicReader`, and the rules do not conflict
  - `[false]` `[reject]` blind-hunter: architecture chapter page passes `notesHref` while the landing passes `basePath` — both resolve to `/architecture`
  - `[false]` `[reject]` blind-hunter: plan file unfinished — filled in at Finalize
  - `[low]` `[reject]` edge-case-hunter: dead `barRef` — same as above
  - `[medium]` `[patch]` edge-case-hunter: nested `<main>` — same fix as above
  - `[low]` `[patch]` edge-case-hunter: `frameTopic` null fallback — same fix as above
  - `[low]` `[defer]` edge-case-hunter: `.top` kept in the 480px block — sweep
  - `[low]` `[defer]` edge-case-hunter: orphaned `[data-tip]:hover::after` rules in `architecture.module.css` — sweep
  - `[low]` `[defer]` edge-case-hunter: `.iconBtn`/`.btn` left in `landing.module.css` — still imported by `ChaptersSheet` and `ChapterHeaderPager`; sweep
  - `[false]` `[reject]` edge-case-hunter: blank-line churn — see above
  - `[false]` `[reject]` edge-case-hunter: `markNoSmooth` — see above
  - `[low]` `[reject]` edge-case-hunter: `ArchitectureView` reads `next.id` unguarded — unchanged from before and the chapter list is never empty
  - `[medium]` `[patch]` verification-gap: landing Start/Continue action and read-progress carry-over have no assertion — new e2e test seeds `git-<id>` and a bare architecture id and checks the label and href
  - `[low]` `[defer]` verification-gap: Chapters sheet and keys tested only on `/git/merge` — same shared `ChapterView` path
  - `[low]` `[patch]` verification-gap: `frameTopic` silent fallback — same fix as above
  - `[low]` `[reject]` verification-gap: dead `barRef` — see above
  - `[low]` `[reject]` verification-gap: landing accent not asserted — the accent comes from `topics()`, exercised by the chapter accent test
  - `[low]` `[defer]` verification-gap: leftover `.iconBtn` rule — sweep
  - `[medium]` `[patch]` intent-alignment: Git progress key question is answered only in prose — covered by the same new test
  - `[false]` `[reject]` intent-alignment: a11y coverage not extended — `e2e/a11y.spec.ts` already lists all four routes and passes
  - `[low]` `[patch]` intent-alignment: 390px and focus criteria unasserted — 390px scrollWidth check added to the new test; focus return stays covered by `keyboard.spec.ts`
  - `[false]` `[reject]` intent-alignment: pill label for architecture is a hard-coded string — `seriesTitle` equals the topic name and the head-back test asserts it

## Design Notes

`TopicReader` is the template; the series reader differs only by having no search, no exercises and no review hint. Chapter header actions in the frame: `ChaptersSheetButton`, the breadcrumb `nav.crumbs` (Series / Part / chapter num), then `ChapterHeaderPager`.

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: green
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build` then `npm run test:e2e` -- expected: all pass

**Manual checks (if no CLI):**
- Screenshot `/git`, `/git/merge`, `/architecture`, `/architecture/arch-request-path` at 1440 and 390 on a throwaway port (not 3000; reduced motion on).

## Auto Run Result

**Summary:** `/git`, `/git/<section>`, `/architecture` and `/architecture/<chapter>` now render inside `TopicFrame` (labelled back pill, brand, title chip with the topic's own mark and accent, shared scroll bar and menu). `ChapterView` follows `TopicReader` minus search, exercises and the review hint; the landings move Start/Continue reading into the frame header. The `git-` progress prefix is unchanged.

**Files changed:** `components/series/SeriesLanding.tsx`, `components/series/ChapterView.tsx`, `app/architecture/ArchitectureView.tsx` (onto the frame); `lib/topics.ts` (`frameTopic`); the four `page.tsx` files (pass the topic); the three CSS modules (private-header rules removed); `e2e/smoke.spec.ts` (head-back test for four paths, landing Start/Continue and progress carry-over test, accent test locator); `content/architecture/arch-testing.ts` and `arch-health.ts` (test counts).

**Review:** 32 findings: medium 5, low 15, false 12. Patched 7 (two medium entries: nested `<main>`; landing action and Git progress carry-over untested), deferred 6 low to the refactor sweep (dead CSS, orphaned rules), rejected the rest with the reasons logged above.

**Follow-up review recommended:** true. Two medium entries were patched; the unverified risk is the `<main>`→`<div>` change in `ChapterView` (the identical nested `<main>` in `TopicReader` is untouched).

**Verification:** `npm run check` 350/350; `npm run build` ok; full `npm run test:e2e` 186/186 (a11y suite included); screenshots of all four pages at 1440 and 390 with no horizontal scroll.

**Residual risks:** `TopicReader` still nests `<main>` inside the frame's `<main>`; dead CSS (`.top`, `.iconBtn`, `.btn`, orphaned `[data-tip]` rules) waits for the sweep.
