---
title: 'Question model, loader and the binary-search pool'
type: 'feature'
ticket: '1'
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
      Only one of the pool's code-dependent answers is checked against code (the `mid` sequence); the others were checked by hand.
    evidence: |-
      bs-first-of-the-duplicates, bs-lo-less-than-hi, bs-mid-needs-floor and bs-answer-search-cost depend on running the code shown. A later pool with many such questions needs a cross-check table, and any new `trace` question outside TRACE_CHECKS is unchecked; make the check cover every trace question when 3.5 or the level epics add more.
    location: >-
      tests/dsa-quiz.test.ts
    severity: low
  - summary: >-
      A `predict` question's tracer id and step are not checked against the play registry and the tracer's frames.
    evidence: |-
      Only a non-blank tracer and a non-negative integer step are checked; entry 3.6 uses the kind and should verify the id exists and the step is in range.
    location: >-
      lib/quiz.ts
    severity: low
  - summary: >-
      The company-name deny list is short, and a case-sensitive match lets lowercase names through.
    evidence: |-
      Extend the list (and a small allow-list for words such as Meta or Oracle in ordinary prose) when the revision list (7.8) starts using the tags; no pool has a company name today.
    location: >-
      lib/quiz.ts
    severity: low
  - summary: >-
      Question id prefixes are checked for kebab-case and one shared prefix per pool, not tied to a chapter short name.
    evidence: |-
      The curriculum has no short-name field; add one if two pools ever collide on a prefix (uniqueness of ids across pools is already checked).
    location: >-
      lib/quiz.ts
    severity: low
  - summary: >-
      Unit-test totals in the architecture chapters are stale and asserted nowhere.
    evidence: |-
      Vitest now runs 515 tests in 30 files; derive and assert the figures in the frame sweep (1.5).
    location: >-
      content/architecture/arch-testing.ts, arch-health.ts, arch-tech-stack.ts, arch-repo-map.ts
    severity: low
baseline_revision: '81c6e3fc858047046e2e437163bcc0b8fe521d76'
---

<intent-contract>

## Intent

**Problem:** The chapter check, the placement quiz, the complexity round, the pattern drill and the cheat sheet all need authored questions and per-chapter pattern records, and none exists. There is no question model, no fixed pattern vocabulary and no way to load one chapter's questions without pulling every chapter's.

**Approach:** Define the data and prove it on one chapter, with no UI. Types live in `content/quiz-types.ts`; the fixed vocabularies (patterns, skills, interview styles) and the pure integrity helpers live in `lib/quiz.ts`; a registry with one dynamic import per chapter and a `loadPool(chapterId)` loader live in `lib/quizPool.ts`; binary search's pool and pattern record are authored in `content/dsa/quiz/dsa-binary-search.ts`. Integrity tests, with negative fixtures, run over every pool present, so each later level epic adds a pool and gets the checks for free. The chapter page loads nothing yet (3.2 wires it).

## Boundaries & Constraints

**Always:**
- `content/quiz-types.ts` holds types only: `Question` (a union on `kind`), `Choice`, `PatternRecord`, `ChapterPool`. Every question has `id` (unique across all pools, kebab-case, prefixed by its chapter's short name), `chapter` (a chapter id), `level` (`LevelId`), `skill` (`recognise`, `complexity`, `trace` or `edge-case`), `pattern` (from the vocabulary), `section` (an `<h3>` id of the chapter, as `withHeadingIds(chapter.body).toc` gives), `prompt` (HTML; code is JavaScript in `<pre><code>`), an optional `placement: true`, and the kind's own fields. Kinds: `single` (3 to 5 `choices` of `{id, text, why}` and one `answer` id), `multi` (3 to 5 choices and `answers`, two or more ids but not all), `order` (3 to 6 `items` of `{id, text}` listed in the correct order, plus `why`; the UI will shuffle), `predict` (`tracer` id, `step` index, and the single shape's choices and `answer`; used by the player in 3.6). Every choice has a non-empty `why` (shown for right and wrong picks alike); every question is auto-gradable, no free text.
- `PatternRecord`: `pattern`, `chapter`, `signals` (2 to 5 short phrases that tell a reader to reach for it), `template` (HTML, a short JavaScript code block), `time` and `space` (strings such as `O(log n)`), and `styles`, a non-empty list of interview styles from `online-assessment`, `phone-screen`, `onsite`. No company names anywhere. `ChapterPool` is `{ questions: Question[]; pattern: PatternRecord }`.
- `lib/quiz.ts` (no import from `content/` except types, no `"use client"`, safe for client use): `PATTERNS` (a fixed `as const` list of ids with a display label each, covering the 42 chapters' techniques; the implementer derives it from `content/dsa-notes.ts` and `curriculum.md`, no duplicates, kebab-case), `SKILLS`, `STYLES` with labels (Online assessment, Phone screen, Onsite round), `isPattern`, and the pure integrity helpers described in the tests below, which return a list of problem strings (empty when sound).
- `lib/quizPool.ts`: a `Map` with one `() => import("@/content/dsa/quiz/<id>")` line per chapter id (static literals, as `lib/play/registry.ts`); `loadPool(chapterId)` resolves to the `ChapterPool` or `null` for an unknown id (including `constructor` and `__proto__`). It returns exactly that chapter's pool. No file under `app/`, `components/` or `lib/` other than `lib/quizPool.ts` imports `content/dsa/quiz` and that one only dynamically; `tests/client-bundle.test.ts` stays green.
- Binary search's pool (`content/dsa/quiz/dsa-binary-search.ts`, `export const pool: ChapterPool`): 10 questions, at least two `placement: true` (recognition-level, answerable by someone who knows the idea), at least two `complexity`, at least five that are not `complexity` (so a check of five never needs them), at least one authored `trace` question on a stated array and target (checked against the tracer in the test), at least one each of `multi` and `order`, every `section` a real `<h3>` id of the chapter, distractors written by hand from the real mistakes (`lo < hi` instead of `<=`, `mid = (lo+hi)/2` without flooring, `hi = mid` loops, binary search on an unsorted array, searching the answer space for a monotonic yes/no), `level: "beginner"`, `pattern: "binary-search"`, and one `PatternRecord` for it with `styles` covering all three interview styles that fit (at least `online-assessment` and `phone-screen`). Copy says "checked", never "verified". HTML in prompts, choices and explanations is balanced (`<code>` and `<pre>` closed).
- Integrity tests in `tests/dsa-quiz.test.ts`, over the pools present (the registry's ids), each backed by a pure helper in `lib/quiz.ts` and a negative fixture that proves it fails: answers and `answers` are among the choices (and `multi` is not all of them); choice ids unique per question and question ids unique across pools; `chapter` exists in `chapters("dsa")` and equals the pool's chapter; pattern is in the vocabulary; skill is known; `section` is in the chapter's toc; every `why` and `explanation` non-empty; HTML balanced; counts (at least 8 questions, 2 `placement`, 2 `complexity`, 5 non-`complexity`, 1 `trace`); every pattern record has a non-empty `styles` from the vocabulary, 2 to 5 signals, a `time` and a `space`, and no company name from a short deny list. The registry has a pool file for exactly the chapters it lists, and no stray file sits in `content/dsa/quiz/`. The authored trace question's answer equals what `lib/play/binarySearch` records for the same array and target. `loadPool("dsa-binary-search")` returns only questions whose `chapter` is that id; unknown ids give `null`. A structural test shows nothing under `app/`, `components/` or `lib/` (apart from the registry's dynamic import) imports `content/dsa/quiz`.
- Add a paragraph on the question data, the vocabularies and the loader to the architecture chapter that already describes `content/dsa/code` and the play registry (`content/architecture/arch-rendering.ts`), and keep `tests/claims.test.ts` green. No comments in source, tests included. Append new spelling words to the end of `.cspell/project-words.txt`.

**Never:** Do not touch `CheckIsland`, `TopicReader`, `topicPages`, the completion policy, the Player, the language switch or any chapter body. Do not add a storage key, a route, a CSS module, a `"use client"` file or an e2e test. Do not put questions, patterns or pools on `Chapter` or `chapterMetas`. Do not write other chapters' pools (the level epics do) and no puzzles or round data (2.8, 3.10; they will add their own lazy files beside the pool). Do not import `content/practice`. No company names. Do not edit the spec files.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Load a pool | `loadPool("dsa-binary-search")` | the pool, every question's `chapter` is that id | none |
| Unknown chapter | `loadPool("dsa-nope")`, `"constructor"`, `"__proto__"` | `null` | none, no throw |
| Answer not a choice | a single question whose `answer` is not among its choices | the helper reports it; the real pool has none | test fails |
| Duplicate id | two questions share an id across pools | reported | test fails |
| Bad section | `section` not in the chapter's toc | reported | test fails |
| Unbalanced HTML | an unclosed `<code>` in a prompt or `why` | reported | test fails |
| Thin pool | fewer than 8 questions, 2 placement, 2 complexity, 5 non-complexity or no trace | reported | test fails |
| Pattern record | no style, one signal, an unknown pattern or a company name | reported | test fails |
| Wrong trace answer | the authored trace answer disagrees with the tracer | the test fails | test fails |

</intent-contract>

## Code Map

- `content/types.ts` -- `LevelId`, `Chapter`, `ChapterMeta`; import types only; keep quiz data off `Chapter`.
- `content/dsa-notes.ts`, `content/dsa/dsa-binary-search.ts` -- chapter ids, `<h3>` headings (ids `the-core-idea`, `the-template-that-avoids-off-by-one-bugs`, `binary-search-on-the-answer-not-the-array`, `finding-a-boundary-first-last-occurrence`, `see-the-range-collapse`, `recognizing-it-in-an-unseen-problem`) and the three code blocks the questions may refer to; do not edit.
- `lib/headingToc.ts` -- `withHeadingIds(html).toc` gives the section ids the integrity test checks.
- `lib/content.ts` -- `chapters("dsa")`, `chapter(id, topicId)`.
- `lib/play/registry.ts`, `lib/play/binarySearch.ts` -- the registry pattern to copy (Map of static dynamic imports, `null` for unknown) and the tracer the trace question is checked against.
- `lib/dsaCode.ts`, `tests/dsa-code-languages.test.ts` -- precedent for pure helpers in `lib/` with negative "fails when" cases and for dynamic imports in tests.
- `tests/client-bundle.test.ts` -- walks static imports from `"use client"` files; `lib/quiz.ts` may be imported by clients, `content/dsa/quiz/*` and `content/quiz-types.ts` runtime values may not (types only).
- `tests/claims.test.ts` and `content/architecture/arch-rendering.ts` -- the chapter that describes `lib/play/registry.ts` and `content/dsa/code`; add the paragraph there.
- `components/check/CheckIsland.tsx` -- stub for 3.2; do not touch.
- New: `content/quiz-types.ts`, `lib/quiz.ts`, `lib/quizPool.ts`, `content/dsa/quiz/dsa-binary-search.ts`, `tests/dsa-quiz.test.ts`.

## Tasks & Acceptance

**Execution:**
- [x] `content/quiz-types.ts` -- the types -- the model every pool follows
- [x] `lib/quiz.ts` -- vocabularies and the pure integrity helpers -- shared by the tests now and by the check, drill and cheat sheet later
- [x] `lib/quizPool.ts` -- registry with one dynamic import per chapter and `loadPool` -- lazy per chapter
- [x] `content/dsa/quiz/dsa-binary-search.ts` -- the 10 questions and the pattern record -- the tracer pool
- [x] `tests/dsa-quiz.test.ts` -- the integrity tests, negative fixtures, the loader tests, the trace cross-check and the structural import test -- the safety net for every later pool
- [x] `content/architecture/arch-rendering.ts` -- one paragraph on the question data and the loader -- keeps the architecture chapters true
- [x] `.cspell/project-words.txt` -- append any new words at the end

**Acceptance Criteria:**
- Given `loadPool("dsa-binary-search")`, when called, then it returns 10 or more questions that all belong to that chapter plus its pattern record; given an unknown id, then `null`.
- Given the integrity tests, when any helper is fed a pool with a missing answer, a duplicate id, a bad section, unbalanced HTML, a thin pool or a pattern record without a style, then it reports a problem, and the real pool reports none.
- Given the binary-search pool, then it has at least 8 questions, 2 placement-tagged, 2 complexity (and 5 that are not), one authored trace question whose answer matches the tracer, one `multi`, one `order`, and its pattern record carries style tags.
- Given a production build, then no client chunk and no page of `/dsa/dsa-binary-search` contains a question id of the pool (the loader is not called by any page yet).
- Given `npm run check`, then it passes including the comments check and `tests/client-bundle.test.ts` and `tests/claims.test.ts`.

## Implementation Notes

- Types in `content/quiz-types.ts` (type-only imports), vocabularies (45 patterns derived from the 42 chapters, 4 skills, 3 interview styles) and the pure integrity helpers in `lib/quiz.ts`, registry and `loadPool` in `lib/quizPool.ts` (one static dynamic-import line per chapter, `null` for unknown ids including `constructor` and `__proto__`), binary search's 11 questions (the plan said 10; a second recognition-level placement question was added when the answer-space question lost its tag) and its pattern record in `content/dsa/quiz/dsa-binary-search.ts`, the integrity tests with negative fixtures in `tests/dsa-quiz.test.ts`, and one paragraph in `arch-rendering.ts`.
- Judgement calls: ids need kebab-case, uniqueness across pools and one shared first segment per pool (the pool uses `bs-`); the `order` question's `why` stands in for an explanation; the `order` question is tagged `trace` since it follows one loop pass; the company deny list (25 names, case-sensitive, word-boundary) lives in `lib/quiz.ts`.
- Payload: this entry wires nothing into a page, so the chapter payload cannot change. After the build, no question id of the pool appears anywhere under `.next` (static chunks, server output, the HTML of `/dsa/dsa-binary-search`).
- The puzzle and complexity-round data of the intent are not built here; entries 2.8 and 3.10 add their own lazy files beside the pool, and the registry shape (one import line per chapter) is what they extend. Only binary search has a pool and a pattern record; the other chapters' pools belong to the level epics.

## Plan Change Log

## Review Triage Log

### 2026-10-08 — Review pass
- verdicts: 22 findings (duplicates across lenses merged) — high 0, medium 4, low 14, false 4, maybe-false 0
- findings:
  - `[medium]` `[patch]` blind-hunter: `bs-order-one-pass` refers to code it does not show, so a drawn check could not answer it — code embedded in its prompt
  - `[medium]` `[patch]` blind-hunter: `bs-loop-that-never-ends` choice a's explanation names the unsafe form as the safe one — corrected
  - `[medium]` `[patch]` blind-hunter: `bs-spot-the-answer-space` gives its answer away and is placement-tagged although it is the chapter's harder idea — stem neutral, tag moved to recognition-level questions
  - `[medium]` `[patch]` blind-hunter, edge-case-hunter: nothing ties a question's pattern to the pool's pattern record, and a placement tag can sit on a non-recognition question — two helper rules
  - `[low]` `[patch]` blind-hunter: the correct answer is `b` in 4 of 8 single questions and often the longest — rebalanced
  - `[low]` `[patch]` blind-hunter: `sorted` is unnamed in `bs-mid-needs-floor`, and choice a of `bs-lo-less-than-hi` reads as correct — reworded
  - `[low]` `[patch]` blind-hunter: the "checked, never verified" rule is a one-off, so later pools get no check — moved into `poolProblems`
  - `[low]` `[patch]` verification-gap, blind-hunter, edge-case-hunter: the `predict` branch has no test, an unknown kind throws instead of reporting — fixtures and a problem string
  - `[low]` `[patch]` edge-case-hunter, blind-hunter: the company scan reads JSON-escaped text, so a name after a newline slips through — scans the raw strings
  - `[low]` `[patch]` edge-case-hunter: `.DS_Store` in `content/dsa/quiz` fails the stray-file test on macOS — dotfiles filtered
  - `[low]` `[patch]` edge-case-hunter: a per-line match fails when prettier wraps the registry import — matches across lines
  - `[low]` `[patch]` blind-hunter: the import-boundary scan matches any `/dsa/quiz` text, such as a route, and skips `content/` — anchored on import specifiers, `content/` included
  - `[low]` `[defer]` verification-gap, edge-case-hunter: only one code-dependent answer is checked against code, and a new trace question outside the table is unchecked — later pools
  - `[low]` `[defer]` blind-hunter, edge-case-hunter: `predict` tracer id and step are not checked against the registry — 3.6
  - `[low]` `[defer]` blind-hunter, edge-case-hunter, verification-gap: the company list is short and case-sensitive — when 7.8 uses the tags
  - `[low]` `[defer]` blind-hunter, edge-case-hunter, verification-gap: id prefix not tied to a chapter short name — no short-name field exists
  - `[low]` `[defer]` blind-hunter, intent-alignment, verification-gap: unit-test totals stale — frame sweep
  - `[low]` `[reject]` edge-case-hunter: `loadPool` lets a rejected import propagate — a missing file is a build bug the registry test already catches
  - `[low]` `[reject]` blind-hunter: `LEVEL_IDS` duplicates the `LevelId` union — three fixed values; a typecheck failure shows if a level is added
  - `[low]` `[reject]` blind-hunter: `bs-order-one-pass` and `bs-first-of-the-duplicates` are tagged `trace` and `edge-case` loosely — the tags are the author's call and the count rules hold
  - `[false]` `[reject]` intent-alignment: no page calls the loader and the payload clause holds only because nothing is loaded — the plan sets wiring as 3.2's scope; the build grep shows no question id in any chunk or HTML
  - `[false]` `[reject]` blind-hunter: the plan file is unfinished and the architecture paragraph skips `poolChapterIds` — closed out here; the paragraph names the loader and the vocabularies
  - `[false]` `[reject]` intent-alignment: two loading surfaces (server and client) are not separate entry points — one lazy `loadPool` serves both by design
  - `[false]` `[reject]` intent-alignment: puzzle and round data and `predict` questions are absent — deferred to 2.8, 3.10 and 3.6 by the plan; the intent asks only to keep them lazy later

## Design Notes

The model is a data contract first: 3.2 renders it, 3.3 routes on the `placement` tag, 3.5 adds generated `trace` entries (so nothing forbids them), 3.6 reads `predict`, and 7.x read the pattern records. Keeping the integrity rules as pure helpers in `lib/` means a level epic that adds a pool gets the whole test for free, and the same helpers can refuse a bad question at runtime later if ever needed.

A single question, golden shape:

```
{ id: "bs-mid-floor", chapter: "dsa-binary-search", level: "beginner", skill: "edge-case",
  pattern: "binary-search", section: "the-template-that-avoids-off-by-one-bugs",
  kind: "single", prompt: "…", choices: [{ id: "a", text: "…", why: "…" }, …], answer: "b" }
```

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: all green, comments check clean
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build` -- expected: success; then grep `.next/static` and the server HTML of `/dsa/dsa-binary-search` for a pool question id and find none
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run test:e2e` -- expected: all pass (no e2e change)

**Manual checks (if no CLI):**
- Read the ten questions once as a learner: exactly one defensible answer each, every `why` true.

## Auto Run Result

**Summary:** The question model, the fixed vocabularies, the per-chapter lazy loader and binary search's pool now exist, with no UI. `content/quiz-types.ts` types the four kinds (single, multi, order, predict) and the pattern record; `lib/quiz.ts` holds 45 patterns, 4 skills, 3 interview styles and the pure integrity helpers; `lib/quizPool.ts` maps each chapter to one dynamic import and `loadPool` returns that chapter's pool or `null`; `content/dsa/quiz/dsa-binary-search.ts` has 11 hand-written questions (2 placement, 2 complexity, an authored trace question checked against the tracer, one multi, one order) and its pattern record with style tags. Integrity tests with negative fixtures run over every pool present, so later level epics get them for free.

**Files changed:** `content/quiz-types.ts`, `lib/quiz.ts`, `lib/quizPool.ts`, `content/dsa/quiz/dsa-binary-search.ts`, `tests/dsa-quiz.test.ts`, `content/architecture/arch-rendering.ts`.

**Review:** 22 findings: medium 4, low 14, false 4. Patched 12 (an order question without its code, a wrong explanation, an answer-giving stem and tag, answer-letter bias, pattern/placement/wording helper rules, unknown-kind handling, predict fixtures, raw-string company scan, dotfile and wrapped-import robustness, a sharper import-boundary scan), deferred 5 low (cross-checking more answers against code, predict tracer ids, a longer company list, id prefixes, stale unit-test totals), rejected the rest with reasons logged.

**Follow-up review recommended:** false.

**Verification:** `npm run check` 515 unit tests, build ok, full e2e 206/206; no question id appears under `.next` (static chunks, server output, the chapter's HTML).

**Residual risks:** only binary search has a pool and a pattern record; no page calls `loadPool` until 3.2; puzzle and complexity-round data are not built (2.8, 3.10).
