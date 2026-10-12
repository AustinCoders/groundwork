---
title: 'Check states on the rail, cover and path'
type: 'feature'
ticket: '4'
created: '2026-10-12'
status: built
route: 'full'
route_source: 'auto'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
followup_review_recommended: false
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/specs/spec-dsa-mastery/quiz-and-placement.md', '{project-root}/_bmad-output/initiative-dsa-mastery/epic-dsa-checks/epic-dsa-checks.md']
warnings: []
deferred:
  - summary: >-
      The new `.main` column in `ChapterRail` rows and the shrinkable `.partCount` apply to every topic that uses them, not only quiz topics.
    evidence: |-
      Row and header layout for other topics was not screenshotted; only the closures rail text is asserted. The title stays a single line there, so the visual change should be nil.
    location: >-
      components/chapter/ChapterRail.tsx, components/chapter/rail.module.css, components/topic/cover.module.css
    severity: low
  - summary: >-
      The outline chapter pages (eight DSA outlines) keep `NO_DONE` and show no read or state marks on their rail.
    evidence: |-
      They track no progress by design; tested-out outlines cannot occur until a placement question exists for them.
    location: >-
      components/topic/TopicOutlineChapter.tsx
    severity: low
baseline_revision: 'e6cebf3c83c1582474995f62248f57b4b4da0768'
---

<intent-contract>

## Intent

**Problem:** A DSA reader can pass a chapter check, mark a chapter read anyway, hold an old read mark from before checks existed, or be credited by the placement, but the rail, the Chapters sheet, the cover and the path all show only a plain read tick, so the four states cannot be told apart.

**Approach:** Derive one state per chapter from the read mark, the `groundwork:quiz` record and the `groundwork:dsa:placement` tested-out list through a pure function, and show it in words (checked, not checked, read before checks, tested out) on the DSA rail and Chapters sheet, the cover's entries, chips and part counts, and the path's steps and progress card. Topics that do not ask for checks render as before.

## Boundaries & Constraints

**Always:**
- `checked` shows only while the read mark exists; `not checked` is a read chapter marked read anyway; `read before checks` is a read chapter with a check written and no pass and no anyway flag (an old mark, or only misses); `tested out` is a placement credit on a chapter that is not yet read, and a read chapter shows its own state instead.
- A read chapter with no check written, a pass left on an unread chapter, and placement ids the topic does not have show nothing.
- Everything that depends on saved state stays hidden until hydration (`mounted`, `useSyncExternalStore` server snapshots), and the words come from one table so no surface says "verified" or "certified".
- Theme tokens and the `--t-*` scale only, no comments, no new CSS module, no new storage key; the Git, How this is built and `/path?topic=js` tick tests pass unchanged.

**Never:** Do not change `nextChapter`, `lib/completion.ts`, Continue or Up next (3.7 makes them skip tested-out chapters), the check runner, the stores' shapes, or the outline chapter pages (they track no progress). Do not build the placement UI.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Passed | read mark and a record with `passedAt` | checked | none |
| Marked anyway | read mark and `markedAnyway` | not checked | none |
| Old mark | read mark, no record or only misses | read before checks | none |
| Tested out | placement lists the chapter, not read | tested out | ghost ids ignored |
| Stale pass | record with `passedAt`, no read mark | nothing | none |
| No check written | read mark, chapter has no pool | nothing | none |
| Other topic | `completion` is not `quiz` | nothing anywhere | none |

</intent-contract>

## Code Map

- `lib/quizRecord.ts` -- `checkStatus(done, record)` already derives passed, not-checked, read-before-checks and unread; reused.
- `lib/quizStore.ts` -- gains `useQuizRecords()` (all records, empty on the server).
- `lib/placementStore.ts`, `lib/placementRecord.ts` -- `usePlacement()` and `testedOut`; read only.
- `lib/chapterState.ts` (new, pure) -- `chapterState`, `buildChapterStates`, `countStates`, `summarizeStates`, the word table.
- `lib/useChapterStates.ts` (new, client) -- joins the stores and the read marks into one map; empty for topics without `completion: "quiz"`.
- `components/chapter/ChapterRail.tsx`, `rail.module.css` -- state line under the row title; serves the sidebar and the phone Chapters sheet.
- `components/topic/TopicReader.tsx` -- passes the map to the rail.
- `components/topic/TopicCover.tsx`, `cover.module.css` -- entry state line, state chips, part counts, Up next chip.
- `components/topic/TopicPath.tsx`, `path.module.css` -- step chip and progress card summary.
- `components/topic/TopicOutlineChapter.tsx` -- keeps `NO_DONE`; untouched.
- `content/architecture/arch-rendering.ts`, `arch-testing.ts`, `arch-health.ts` -- paragraph, `"use client"` count and test counts asserted by `tests/claims.test.ts`.

## Tasks & Acceptance

**Execution:**
- [x] `lib/chapterState.ts`, `tests/chapter-state.test.ts` -- the pure rules and their tests
- [x] `lib/quizStore.ts`, `lib/useChapterStates.ts` -- the hook
- [x] `components/chapter/ChapterRail.tsx`, `rail.module.css`, `components/topic/TopicReader.tsx` -- rail and sheet
- [x] `components/topic/TopicCover.tsx`, `cover.module.css` -- cover entries, chips, part counts
- [x] `components/topic/TopicPath.tsx`, `path.module.css` -- path steps and summary
- [x] `e2e/smoke.spec.ts` -- one seeded-mix check across the rail, cover and path, and one check that a non-quiz topic shows none
- [x] `content/architecture/*` -- paragraph and asserted numbers

**Acceptance Criteria:**
- Given a seeded mix of a passed, a marked-anyway, an old-mark and a tested-out chapter, when the rail, cover and path load, then each surface shows each state in words.
- Given a pass with no read mark, then no surface says checked.
- Given the Git topic, How this is built and `/path?topic=js`, then their tick tests pass unchanged.
- Given `npm run check` and `npm run build`, then both pass.

## Implementation Notes

- The plan file was written after the code, in the same session: the implementation was done directly in this run, not by a separate subagent.
- Only binary search has a check pool, so a single chapter can hold checked, not checked and read before checks one at a time; the e2e seeds each in turn plus a tested-out chapter.
- Rail rows put the word on a second line under the title, because the row has no room for "read before checks" beside the title and the tick; the read tick stays.
- The first build kept `flex: none` in the minified `.partCount`; the final CSS uses `flex-shrink: 1` and was re-screenshotted.
- The title highlight on the current row had stretched across the new column; the column aligns its items to the start.

## Plan Change Log

## Review Triage Log

### 2026-10-12 — Review pass
- verdicts: 6 findings — high 0, medium 0, low 5, false 0, maybe-false 0 (one finding is a duplicate of the first and merged into its row)
- findings:
  - `[low]` `[patch]` the non-quiz e2e only checked the closures rail, not the cover or the path — added `/notes` and `/path/js/beginner` assertions
  - `[low]` `[patch]` the stale-pass case did not assert the cover chips, part counts and path summary — added a no-aggregate assertion on the cover and the path
  - `[low]` `[patch]` the `1 ${name}` regex was unanchored — now `(?<!\d)1 name\b`
  - `[low]` `[patch]` no check of the phone Chapters sheet — added a 390 test for the sheet
  - `[low]` `[defer]` `.main` and `.partCount` changes reach every topic using them — layout checked on DSA only, see deferred
  - `[low]` `[patch]` `.partCount` with all four states could not wrap — made it shrinkable with `overflow-wrap`, and a 320 and 390 worst-case screenshot shows it wrapping without overflow

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: all green
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build` -- expected: success
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npx playwright test e2e/smoke.spec.ts -g "tell checked|does not ask for checks"` -- expected: 2 passed

## Auto Run Result

**Summary:** The DSA rail and phone Chapters sheet, the cover (entries, chips, part counts, Up next) and the path (steps and progress card) now say checked, not checked, read before checks or tested out in words. One pure function (`lib/chapterState.ts`) derives the state from the read mark, the `groundwork:quiz` record, whether a check exists and the placement's tested-out list; `lib/useChapterStates.ts` joins the stores and is empty for topics without `completion: "quiz"` and before hydration.

**Files changed:** `lib/chapterState.ts`, `lib/useChapterStates.ts`, `lib/quizStore.ts` (`useQuizRecords`), `components/chapter/ChapterRail.tsx`, `components/chapter/rail.module.css`, `components/topic/TopicReader.tsx`, `TopicCover.tsx`, `cover.module.css`, `TopicPath.tsx`, `path.module.css`, `tests/chapter-state.test.ts`, `e2e/smoke.spec.ts` (3 tests), `content/architecture/arch-rendering.ts`, `arch-testing.ts`, `arch-health.ts`.

**Review:** quick pass, 6 findings: 5 patched (test coverage for the cover, path, stale pass, regex and phone sheet; the part count wrap), 1 deferred low (shared layout changes for other topics). Nothing rejected.

**Follow-up review recommended:** false.

**Verification:** `npm run check` green with 1309 unit tests (11 new); `npm run build` ok; `e2e/smoke.spec.ts` and `e2e/chapters.spec.ts` 272 of 272 before the last two test edits, then the 3 new tests and the tick, Git and accent tests pass (23 of 23). Screenshots of the rail, Chapters sheet, cover and path at 390 and 1440 in Night and Paper with Classic and Roboto were reviewed, plus a 320 worst case for the part count.

**Residual risks:** only binary search has a check pool, so the three read states can only be seen one at a time on real data; "Continue" and Up next still ignore tested-out chapters until story 3.7.
