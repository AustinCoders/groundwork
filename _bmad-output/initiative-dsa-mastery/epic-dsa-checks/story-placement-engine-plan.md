---
title: 'Placement engine'
type: 'feature'
ticket: '3'
created: '2026-10-08'
status: 'built'
route: 'full'
route_source: 'auto'
review: 'thorough'
review_source: 'auto'
lenses_ran: ['blind-hunter', 'edge-case-hunter', 'verification-gap', 'intent-alignment']
review_loop_iteration: 0
followup_review_recommended: false
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/specs/spec-dsa-mastery/quiz-and-placement.md', '{project-root}/_bmad-output/initiative-dsa-mastery/epic-dsa-checks/epic-dsa-checks.md']
warnings: ['oversized']
deferred:
  - summary: >-
      The spec names `content/dsa/placement.ts` for the stages, sizes and thresholds, but the engine keeps them in `lib/placement.ts` because client code cannot import `content/dsa`.
    evidence: |-
      The spec files are not edited by a story; update `quiz-and-placement.md` through bmad-spec so the spec and the code agree (the stage table now lives in `lib/placement.ts`, the thresholds in `lib/adaptiveThresholds.ts`).
    location: >-
      _bmad-output/specs/spec-dsa-mastery/quiz-and-placement.md
    severity: low
  - summary: >-
      The result cannot say whether a reader was tested and placed or the bank simply ran out of questions at a stage.
    evidence: |-
      A reader who clears `route` with no intermediate questions silently ends at beginner. Only binary search has placement questions today, so the 3.7 flow should read `stages` (which stages were played) or add an explicit ceiling flag once more pools exist.
    location: >-
      lib/placement.ts
    severity: low
  - summary: >-
      `placementResult` on an unfinished state returns a result that `placementFromResult` can store as final.
    evidence: |-
      The 3.7 flow must call it only when `placementDone(state)`; consider making `placementFromResult` refuse an unfinished placement then.
    location: >-
      lib/placement.ts, lib/placementRecord.ts
    severity: low
  - summary: >-
      A stored placement can list retired or renamed chapter ids, and the sanitiser does not know the curriculum.
    evidence: |-
      The consumer (3.7 plan, 3.4 states) should filter ids against the current chapters when it reads the record.
    location: >-
      lib/placementRecord.ts
    severity: low
  - summary: >-
      Unit-test totals in the architecture chapters are stale and asserted nowhere.
    evidence: |-
      Vitest runs 653 tests in 38 files; derive and assert the figures in the frame sweep (1.5).
    location: >-
      content/architecture/arch-testing.ts, arch-health.ts
    severity: low
baseline_revision: '55db06ec2f20c0342dadcf4b552960dc2768fed4'
---

<intent-contract>

## Intent

**Problem:** The DSA section is meant to find a reader's level before it plans their path, but there is no placement logic at all, the mock interview's thresholds are private to the mock, and nothing stores a placement result.

**Approach:** Build the placement as pure, testable logic with no UI: a staged, adaptive engine over placement-tagged questions that returns the reader's level, the chapters to study and the chapters tested out; share `RAISE_AT` and `LOWER_BELOW` with the mock through a common module; and add the versioned `groundwork:dsa:placement` store with the builders the later flow (3.7) needs. Vitest scripts answer sequences through the engine and checks the outcome.

## Boundaries & Constraints

**Always:**
- `lib/adaptiveThresholds.ts` (new, no `"use client"`) exports `RAISE_AT = 0.8` and `LOWER_BELOW = 0.45`; `lib/mock/adaptive.ts` imports them from there instead of defining them (re-exporting is fine); `shiftFor` and the mock's behaviour do not change and `tests/mock-session.test.ts` passes untouched.
- `lib/placement.ts` (new, pure, no `"use client"`, no randomness, no `content/` import except types, no I/O): the engine takes its chapters (`PlacementChapter = {id, level: LevelId, prerequisites: string[]}` in curriculum order, which is already a valid prerequisite order) and its bank (`Question[]`; only `placement === true` questions are used) as arguments, so tests pass fixtures. Its state is serialisable. API: `startPlacement(ctx)`, `currentQuestion(state, ctx)` (null when done), `answerQuestion(state, ctx, answer)` where `answer` is a value `gradeAnswer` accepts or the constant `NOT_SURE`, and `placementResult(state, ctx)`. Grading uses `gradeAnswer` from `lib/checkDraw.ts`; a "not sure" answer counts as a miss everywhere.
- Stages and sizes are constants in `lib/placement.ts` (`content/dsa/placement.ts`, which the spec names, cannot be imported by client code; record this in the notes): `route` (beginner questions, 6), `beginner-more` (beginner, 4), `intermediate` (6), `advanced` (6). At most 18 questions are ever asked (route, intermediate, advanced is the longest path).
- Routing: after `route`, score at or above `RAISE_AT` goes to `intermediate`; below `LOWER_BELOW` ends with level beginner; between goes to `beginner-more` and then ends with level beginner. After `intermediate`, at or above `RAISE_AT` goes to `advanced`; between ends with level intermediate; below `LOWER_BELOW` ends with level beginner. After `advanced`, at or above `RAISE_AT` gives level advanced; anything lower gives intermediate. A stage's score is correct answers over answers given in that stage. A stage ends early after 3 misses or not-sure answers in a row within it (the streak resets on a correct answer), and its score then counts the answers given. A stage with no unasked question of its level, or one that has been asked all it can, ends with the answers given; a stage with no answers at all has no score and ends the placement at the level reached so far (so a bank with no questions yields level beginner and tests nothing).
- Question order is deterministic: within a stage's level, take chapters in curriculum order and their placement questions in bank order, round-robin (the first question of each chapter, then the second), skipping a question already asked.
- Credit: a chapter is tested out when it has 2 correct answers and none of its direct prerequisites was missed or answered not-sure in this run (an untested prerequisite does not block). Result: `level`, `allotted` (every chapter whose level is at or above the placed level, plus lower-level chapters with a miss or not-sure, minus tested-out chapters, in curriculum order), `testedOut`, `reviseEarlier` (lower-level chapters that are neither allotted nor tested out; they stay open), and `stages` (per stage: id, correct, asked) for the store. The engine never shows or needs a raw score in its public decisions beyond `stages`; the UI decides what to display.
- `lib/placementRecord.ts` (new, pure): the record `{mode: "quiz" | "beginning" | "self", level, stages, testedOut, allotted, takenAt, seconds}`, a sanitiser that returns null for junk, and the builders `placementFromResult(result, takenAt, seconds)`, `beginningPlacement(chapters, takenAt)` (mode `beginning`, level beginner, everything allotted in order, nothing tested out) and `selfPlacement(level, chapters, takenAt)` (mode `self`, chapters at or above the level allotted, none tested out).
- `lib/placementStore.ts` (new, `"use client"`): key `groundwork:dsa:placement`, `{v: 1, record}`, a `useSyncExternalStore` store with a snapshot cache, an in-memory fallback when storage fails, a storage-event listener that also handles a null key, a stale or unknown version treated as no placement, `usePlacement()`, `savePlacement(record)` and `clearPlacement()`, following `lib/quizStore.ts`. The key's absence means "not placed yet". It never writes `jsnotes:level` or any `jsnotes:*` key and `lib/storage.ts` is unchanged.
- `lib/quizPool.ts` gains `loadPlacementBank()` (async): loads every registered pool and returns the placement-tagged questions in registry order; nothing else imports `content/dsa/quiz/*` (the importer test stays green).
- Tests: `tests/placement.test.ts` with a fixture curriculum (beginner, intermediate and advanced chapters with prerequisites) and fixture banks, scripted sequences for every route above (all correct reaches advanced in 18 questions at most; a wrong start stops after 3 misses in a row; the between-thresholds path to `beginner-more`; intermediate between and below; advanced below), exact-threshold cases (0.8 raises, 0.45 holds), a not-sure answer breaking a streak the same as a miss, a correct answer resetting the streak, credit with 2 correct, credit blocked by a missed prerequisite and not blocked by an untested one, a chapter with no questions never tested but allotted, `allotted` in prerequisite order, `reviseEarlier`, determinism (the same answers give the same state), serialisable state (JSON round trip), an empty bank, and the real curriculum with the real bank returning level beginner without throwing. `tests/placement-store.test.ts` (modelled on `tests/quiz-store.test.ts`): version, junk, clear, stable snapshots, null-key storage event, no `jsnotes:*` write. `tests/mock-session.test.ts` and the rest stay green.
- Update the architecture chapters in this entry: a `groundwork:dsa:placement` row and the key counts in `content/architecture/arch-state.ts`, a short paragraph on the placement engine and store in `arch-rendering.ts` with the `"use client"` count, a note in the mock chapter that the thresholds moved to a shared module; keep `tests/claims.test.ts` green. No comments in source, tests included. Append new spelling words to the end of `.cspell/project-words.txt`.

**Never:** Do not build the placement UI, the "Find your level" prompt, the plan, Re-check or Revise-earlier display (3.7), the check states (3.4), or any change to `nextChapter` or `lib/completion.ts`. Do not touch `jsnotes:level` or the global level. Do not write other chapters' pools or placement questions. Do not change the mock's behaviour or tests. No randomness, timers or I/O in `lib/placement.ts`. Do not edit the spec files.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| All correct | every answer right | route, intermediate, advanced; 18 questions; level advanced | none |
| Weak start | first 3 answers wrong | route ends early, level beginner, `allotted` is every chapter | none |
| Middle route score | route score from 0.45 up to below 0.8 | `beginner-more` (4 more), then level beginner | none |
| Intermediate between | intermediate from 0.45 up to below 0.8 | ends, level intermediate | none |
| Intermediate weak | intermediate below 0.45 | ends, level beginner | none |
| Advanced short | advanced below 0.8 | level intermediate | none |
| Not sure | `NOT_SURE` answer | counted as a miss, extends the streak | none |
| Credit | 2 correct on a chapter, no prerequisite missed | chapter in `testedOut`, not in `allotted` | none |
| Blocked credit | 2 correct, a prerequisite missed | not tested out, stays allotted | none |
| No questions | chapter or stage without placement questions | never tested; allotted if at or above the level; no stage score ends at the level so far | none |
| Empty bank | bank is `[]` | level beginner, nothing tested | no throw |
| Stale store | unknown version or junk in the key | no placement | none |
| Storage fails | write throws | the session keeps the result in memory | none |

</intent-contract>

## Code Map

- `lib/mock/adaptive.ts:4-5` -- `RAISE_AT = 0.8`, `LOWER_BELOW = 0.45`, `shiftFor` at about lines 19-24, `rank()`, `pickAlternates`; importers are `lib/mock/session.ts:12` and `lib/mock/persona.ts:1`; covered indirectly by `tests/mock-session.test.ts:216-251`. Move the two constants only.
- `lib/checkDraw.ts` -- `gradeAnswer(question, answer)` and `Answer`; reuse for grading.
- `lib/quizPool.ts` -- `poolChapterIds()`, `loadPool(id)`; add `loadPlacementBank()`; `content/quiz-types.ts` -- `Question` with `level`, `skill`, `placement?: true`, `chapter`; `lib/quiz.ts` -- `placementProblems` (placement-tagged questions are `recognise`).
- `content/types.ts` -- `Chapter.levels: LevelId[]`, `Chapter.prerequisites?`; `lib/content.ts` -- `chapters("dsa")`; `content/dsa-notes.ts` -- 42 chapters in prerequisite order (34 ready, 8 outlines); the engine uses `levels[0]` as a chapter's level.
- `lib/quizStore.ts`, `lib/quizRecord.ts`, `tests/quiz-store.test.ts` -- the store and its test to copy; `lib/codeLanguage.ts` -- the null-key storage event handling.
- `lib/storage.ts:6` -- `jsnotes:level`; never written here.
- `tests/claims.test.ts:239` and `content/architecture/arch-rendering.ts:18` -- the `"use client"` file count (86 plus the two this entry should not add except the store); `content/architecture/arch-state.ts` -- key table around lines 109-115 and prose counts ("Thirty-two", "32 keys or prefixes", "thirty keys"); `arch-mock.ts` -- text about 0.8 and 0.45.
- `tests/dsa-quiz.test.ts` -- the importer rule for `content/dsa/quiz`.
- New: `lib/adaptiveThresholds.ts`, `lib/placement.ts`, `lib/placementRecord.ts`, `lib/placementStore.ts`, `tests/placement.test.ts`, `tests/placement-store.test.ts`.

## Tasks & Acceptance

**Execution:**
- [x] `lib/adaptiveThresholds.ts`, `lib/mock/adaptive.ts` -- move the two thresholds -- shared by the mock and the placement
- [x] `lib/placement.ts` -- stages, routing, early stop, credit, result -- the engine
- [x] `lib/placementRecord.ts` -- the record, sanitiser and the three builders -- what 3.7 stores
- [x] `lib/placementStore.ts` -- the versioned `groundwork:dsa:placement` store -- persistence
- [x] `lib/quizPool.ts` -- `loadPlacementBank()` -- the question source
- [x] `tests/placement.test.ts`, `tests/placement-store.test.ts` -- the scripted sequences and the store rules
- [x] `content/architecture/*` -- the key, the paragraphs and the counts -- claims test stays green
- [x] `.cspell/project-words.txt` -- append any new words at the end

**Acceptance Criteria:**
- Given a fixture curriculum and bank, when scripted answers run through the engine, then it returns the expected level, `allotted`, `testedOut` and `reviseEarlier`, never asks more than 18 questions, and stops a stage after 3 misses or not-sure answers in a row.
- Given a score of exactly 0.8 or exactly 0.45, then the engine raises or holds as the thresholds say.
- Given a missed prerequisite, then a chapter with 2 correct answers is not tested out.
- Given the real curriculum and the real bank, then the engine returns level beginner without throwing.
- Given the mock, then `tests/mock-session.test.ts` passes unchanged and imports no new behaviour.
- Given `groundwork:dsa:placement`, then it is versioned, stale values read as no placement, `clearPlacement()` empties it and no `jsnotes:*` key is written.
- Given `npm run check` and `npm run build` and the full e2e, then they pass, including `tests/client-bundle.test.ts`, `tests/claims.test.ts` and `tests/dsa-quiz.test.ts`.

## Implementation Notes

- Pure engine `lib/placement.ts` (stages route 6, beginner-more 4, intermediate 6, advanced 6; at most 18 questions; deterministic round-robin over the stage level's chapters; 3 misses or not-sure in a row end a stage; credit at 2 correct with no direct prerequisite missed; `allotted`, `testedOut`, `reviseEarlier`, `stages`), shared thresholds in `lib/adaptiveThresholds.ts` (the mock imports them, `shiftFor` is unchanged), record and builders in `lib/placementRecord.ts`, the `groundwork:dsa:placement` store in `lib/placementStore.ts`, and `loadPlacementBank()` in `lib/quizPool.ts`.
- Decisions on what the spec left open: a stage's streak and score are counted within that stage; the early stop ends the stage and routing continues on its partial score; after intermediate a score from 0.45 up to below 0.8 ends at intermediate, below 0.45 at beginner; a failed advanced stage gives intermediate; a stage with no answers ends the placement at the level reached; an untested prerequisite does not block credit; "not sure" counts as a miss; a chapter is tested out even with a miss of its own once it has 2 correct and no missed prerequisite; a lower-level chapter with 2 correct but a missed prerequisite goes to `reviseEarlier`. `levels[0]` is a chapter's level.
- The stage constants live in `lib/placement.ts`, not `content/dsa/placement.ts` (client code cannot import `content/dsa`).
- Verification: with only binary search's two placement questions, the real curriculum and bank give level beginner without throwing.
- Architecture chapters: a `groundwork:dsa:placement` row and the key counts (33), a placement paragraph in `arch-rendering.ts` with the `"use client"` count (87), and a note in `arch-mock.ts` that the thresholds moved.

- The stages and sizes live in `lib/placement.ts`, not `content/dsa/placement.ts`, which client code cannot import; the spec's `content/dsa/placement.ts` is not created.
- `outcomeAfter(stage, score)` is exported so the exact 0.8 and 0.45 boundaries are tested directly; no stage of at most 6 answers can score exactly 0.45.
- A lower-level chapter with 2 correct answers but a missed prerequisite is not tested out and has no miss of its own, so it lands in `reviseEarlier`, not `allotted`; it stays open.
- A chapter at or above the placed level that earned credit is tested out, so a reader who clears advanced has an empty `allotted` list.

## Plan Change Log

## Review Triage Log

### 2026-10-08 — Review pass
- verdicts: 27 findings (duplicates across lenses merged) — high 0, medium 2, low 17, false 8, maybe-false 0
- findings:
  - `[medium]` `[patch]` edge-case-hunter: `answerQuestion` grades against the engine's next question, not the one shown, so a late async bank could mis-grade — optional question id guard
  - `[medium]` `[patch]` blind-hunter, edge-case-hunter: the real-bank test pins level beginner, which breaks as soon as another pool is added — asserts the invariants (no throw, within 18, a partition of the curriculum)
  - `[low]` `[patch]` edge-case-hunter, blind-hunter: `takenAt` of 0 or NaN saves a record that reads back as "not placed", and the sanitiser keeps duplicate stage ids and overlapping lists — normalised and deduped
  - `[low]` `[patch]` edge-case-hunter, blind-hunter: one failed pool chunk rejects the whole placement bank, and the bank is reloaded on each call — `allSettled` and a memoised promise
  - `[low]` `[patch]` blind-hunter: 2 correct plus a miss on one chapter has no rule or test — pinned (tested out wins)
  - `[low]` `[patch]` blind-hunter: test hygiene (a null-like answer test that passes `[]`, per-stage size, snake case, double unstub) — fixed
  - `[low]` `[patch]` verification-gap, blind-hunter: a storage event clearing the in-memory fallback, another tab's removal and a later save are untested — added
  - `[low]` `[patch]` blind-hunter, edge-case-hunter: the architecture paragraph omits the thresholds, credit rule and result meanings, and the topic summary still says thirty-one keys — updated
  - `[low]` `[defer]` blind-hunter, intent-alignment: the spec names `content/dsa/placement.ts`, the code uses `lib/` — spec update through bmad-spec
  - `[low]` `[defer]` blind-hunter, intent-alignment: the result cannot tell tested-and-placed from out-of-questions — 3.7 reads `stages` or adds a flag
  - `[low]` `[defer]` edge-case-hunter: `placementResult` on an unfinished state can be stored as final — 3.7 contract
  - `[low]` `[defer]` edge-case-hunter, blind-hunter: ghost chapter ids in an old record — filtered by the reader of the record
  - `[low]` `[defer]` blind-hunter, edge-case-hunter, verification-gap: unit-test totals stale — frame sweep
  - `[low]` `[reject]` blind-hunter: `reviseEarlier` mixes untested with weak chapters — the spec defines it as the open chapters below the level
  - `[low]` `[reject]` edge-case-hunter, blind-hunter: question level is ignored in favour of the chapter's level — the plan sets the chapter's level as the rule and the pool integrity tests tie questions to their chapter
  - `[low]` `[reject]` edge-case-hunter: duplicate question ids across pools shrink a stage — unique ids across pools are already tested in `tests/dsa-quiz.test.ts`
  - `[low]` `[reject]` blind-hunter: `NOT_SURE` is a plain string that could collide with a choice id — choice ids are short letters
  - `[low]` `[reject]` blind-hunter: the engine recomputes the question order on every call — at most 18 questions and a few dozen chapters
  - `[low]` `[reject]` blind-hunter: a multi-level chapter uses `levels[0]` — recorded in the notes, the curriculum has one level per chapter
  - `[low]` `[reject]` edge-case-hunter: `clearPlacement` when removal fails leaves the key — `store.remove` swallows by design, as in the other stores
  - `[false]` `[reject]` intent-alignment: no page or flow calls the engine — the plan sets the UI as 3.7; the intent's Verify line is Vitest on the engine
  - `[false]` `[reject]` intent-alignment: the engine does not call the loader itself — the plan gives it a bank argument and the loader a `loadPlacementBank` helper, as the plan says
  - `[false]` `[reject]` intent-alignment: `stages` in the result is a raw score — the spec's rule is about display, and the store keeps stage scores by spec
  - `[false]` `[reject]` intent-alignment: the early stop does not stop the whole placement — the spec ends a stage; the plan records this reading
  - `[false]` `[reject]` blind-hunter: the plan file is unfinished and has a muddy code map — closed out here
  - `[false]` `[reject]` intent-alignment: the exported thresholds were removed from the mock — no other importer exists, and the mock tests pass
  - `[false]` `[reject]` verification-gap: `adaptiveThresholds` is not used by other bands — the readiness bands are a different concept
  - `[false]` `[reject]` intent-alignment: `allotted` is curriculum order, not a computed sort — the curriculum order is already a valid prerequisite order and a test checks it

## Design Notes

The engine is a pure reducer: the same answers always give the same state, so the 3.7 flow can keep the state in React and the tests can replay any path. Routing uses the mock's own thresholds so "raise" and "lower" mean one thing across the product. Stage scores are kept (not shown) because the store records them and 3.4 and 3.7 read the tested-out chapters.

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: all green, comments check clean
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build` -- expected: success
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run test:e2e` -- expected: all pass (no page changes)

**Manual checks (if no CLI):**
- Read the stage table once: every path ends, none exceeds 18 questions.

## Auto Run Result

**Summary:** The placement logic exists and is tested, with no UI yet. `lib/placement.ts` is a pure, deterministic engine: six routing questions on beginner chapters, then `beginner-more` or an intermediate module, and an advanced module only after intermediate is cleared, at most 18 questions, a "not sure" answer counted as a miss, a stage ended by 3 misses in a row, a chapter tested out after 2 correct answers with no direct prerequisite missed, and a result of level, `allotted`, `testedOut`, `reviseEarlier` and per-stage scores. `RAISE_AT` (0.8) and `LOWER_BELOW` (0.45) moved to `lib/adaptiveThresholds.ts` and the mock imports them. `lib/placementRecord.ts` has the record, a sanitiser and the builders for the quiz, "start from the beginning" and "I know my level" modes, `lib/placementStore.ts` is the versioned `groundwork:dsa:placement` store, and `loadPlacementBank()` in `lib/quizPool.ts` reads the placement-tagged questions through the pool loader.

**Files changed:** `lib/adaptiveThresholds.ts`, `lib/placement.ts`, `lib/placementRecord.ts`, `lib/placementStore.ts`, `lib/mock/adaptive.ts`, `lib/quizPool.ts`, `tests/placement.test.ts`, `tests/placement-store.test.ts`, `tests/placement-bank.test.ts`, and the architecture chapters and topic summary that state the key and the counts.

**Review:** 27 findings: medium 2, low 17, false 8. Patched 8 groups (a stale-question guard on `answerQuestion`, a real-bank test that no longer pins a level, record normalisation and sanitising, a bank loader that survives one failed pool, a rule and test for 2 correct plus a miss, test hygiene, store cache tests, architecture prose and the topic key count), deferred 5 low (the spec's `content/dsa/placement.ts` naming, a "bank ran out" signal, unfinished-state results, ghost chapter ids, stale unit-test totals), rejected the rest with reasons logged.

**Follow-up review recommended:** false.

**Verification:** `npm run check` 653 unit tests, build ok, full e2e 251/251. With only binary search's two placement questions, the real curriculum and bank give level beginner without throwing.

**Residual risks:** no page calls the engine until 3.7; only binary search has placement questions; the spec still names `content/dsa/placement.ts`.
