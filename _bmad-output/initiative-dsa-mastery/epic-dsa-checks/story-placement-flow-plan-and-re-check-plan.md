---
title: 'Placement flow, plan and Re-check'
type: 'feature'
ticket: '7'
created: '2026-10-13'
status: built
route: 'full'
route_source: 'auto'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
followup_review_recommended: false
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/specs/spec-dsa-mastery/quiz-and-placement.md', '{project-root}/_bmad-output/initiative-dsa-mastery/epic-dsa-checks/epic-dsa-checks.md']
warnings: ['oversized']
deferred: []
baseline_revision: '9d12a8077fb5d9234f2b01bae18fdf8c34408ace'
---

<intent-contract>

## Intent

**Problem:** The placement engine and its store exist but no reader can reach them: there is no placement route, no doors for a first-time reader, no plan, Continue and Up next ignore tested-out chapters, and a reader with marks cannot re-check their level.

**Approach:** Build the static, noindexed `/dsa/placement` route (intro, questions with "not sure yet", level-and-plan result with Revise earlier, retake, reset), the three doors on `/dsa` and `/level/dsa`, the plan in the cover aside with Continue, Re-check my level for readers with marks, and make the next-chapter hook follow the plan; quiz topics stop writing `jsnotes:level`.

## Boundaries & Constraints

**Always:** Reuse TopicFrame, TopicKit, Compose and the check's ChoiceList and OrderList; theme tokens and `--t-*` sizes only; no comments in source. Placement never writes a `jsnotes:*` key; reset clears only `groundwork:dsa:placement`. Nothing is locked: chapters below the level stay open under Revise earlier. No raw score is shown. At most 18 questions, no timer. Deep links are never redirected. Chapters the record names but the curriculum lacks are ignored.

**Never:** Do not change the engine's rules, the whiteboard, the check runner, or `lib/storage.ts`. Do not write other chapters' pools. No fixture bank in production code.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| First visit | no placement, no `dsa-*` mark | `/dsa` and `/level/dsa` show the three doors | none |
| Placed | a stored record | cover aside shows level, counts and Continue to the first allotted chapter | none |
| Marks, no plan | `dsa-*` mark, no record | Re-check my level link; no doors | none |
| Next chapter | plan with tested-out chapters | Continue, Up next and the path's next skip tested out and prefer allotted | no plan: unchanged |
| Re-check | marks and a plan, `?retake` | placement runs, marks untouched | none |
| Reset | plan screen | only the placement key is removed, doors return | none |
| Empty bank | no placement question | screen says questions are not written yet, offers the other doors | none |
| Level pick | quiz topic | `jsnotes:level` not written | none |

</intent-contract>

## Code Map

- `lib/placement.ts`, `lib/placementRecord.ts`, `lib/placementStore.ts`, `lib/quizPool.ts` (`loadPlacementBank`) -- built engine, record builders (`beginningPlacement`, `selfPlacement`, `placementFromResult`), store; read only.
- `lib/completion.ts` -- `nextChapter` gains an optional plan; used by `components/topic/useReadingPlan.ts` and `TopicPath.tsx`.
- `components/topic/TopicCover.tsx` (aside slot, `plan.done`), `TopicPath.tsx` (`rememberLevel`), `app/level/LevelView.tsx` (`rememberLevel`, `useLastLevel`), `components/reader/topicPages.tsx` and `app/level/[topic]/page.tsx` (server data).
- `components/check/ChoiceList.tsx`, `OrderList.tsx`, `check.module.css` (`.runner`) -- reused for questions.
- New: `lib/placementPlan.ts`, `lib/placementChapters.ts`, `lib/usePlacementState.ts`, `components/placement/*`, `app/dsa/placement/page.tsx`, `tests/placement-plan.test.ts`.

## Tasks & Acceptance

**Execution:**
- [ ] `lib/completion.ts`, `lib/placementPlan.ts`, `lib/placementChapters.ts`, `lib/usePlacementState.ts`, tests -- plan view, next-chapter hook
- [ ] `components/placement/*`, `app/dsa/placement/page.tsx` -- flow, plan screen, doors, aside
- [ ] `components/topic/TopicCover.tsx`, `TopicPath.tsx`, `useReadingPlan.ts`, `app/level/*`, `topicPages.tsx` -- wire doors, aside, Re-check, next, level writes
- [ ] `e2e/smoke.spec.ts`, `content/architecture/*`, `.cspell/project-words.txt` -- flow test, routes and counts

**Acceptance Criteria:**
- Given a first-time reader, when they take the placement, then they reach the plan, Continue opens the first allotted chapter, and `jsnotes:progress`, `jsnotes:activity` and `jsnotes:level` are byte-identical.
- Given a placed reader at intermediate, then lower chapters are under Revise earlier and one can be opened and marked done.
- Given a reader with marks, then the cover offers Re-check my level.
- Given axe on the placement and result screens, then no violations in the nine themes.

## Implementation Notes

The plan was written after the investigation and the code is implemented directly in this run, not by a separate subagent, because the run is itself a subagent.

## Plan Change Log

## Review Triage Log

### 2026-10-13 - Review pass
- verdicts: 8 findings - high 0, medium 2, low 5, false 1, maybe-false 0
- findings:
  - `[medium]` `[patch]` empty-bank screen offered no Start from the beginning and the pick link hid when a plan existed - added both to the empty state
  - `[low]` `[patch]` architecture route row claimed the HTML holds the frame - reworded to an empty shell
  - `[low]` `[patch]` prerendered route count (1,804), "134 others" and 68 test files stale in the architecture chapters - updated
  - `[medium]` `[patch]` `/path?topic=dsa` fell back to `jsnotes:level` - it now falls back to the placement level for DSA
  - `[low]` `[patch]` plan screen Continue could differ from the cover's for an incomplete record - both use the stored allotted list
  - `[low]` `[patch]` "Plan complete" counted ids the curriculum lacks and chapters already read - counts only readable, unread tested-out chapters
  - `[low]` `[patch]` e2e hard-coded Continue's target - it follows the first plan row
  - `[false]` `[reject]` no axe test in the diff - the browser axe suite was cut by policy (AGENTS.md); axe was run by hand in nine themes with 0 violations

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: green
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build && npm run test:e2e` -- expected: green
