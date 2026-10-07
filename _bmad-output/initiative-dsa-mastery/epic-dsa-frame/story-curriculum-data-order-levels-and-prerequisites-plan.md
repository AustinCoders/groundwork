---
title: 'Curriculum data: order, levels and prerequisites'
type: 'feature'
ticket: '2'
created: '2026-10-07'
status: 'built'
route: 'full'
route_source: 'auto'
review: 'thorough'
review_source: 'auto'
lenses_ran: ['blind-hunter', 'edge-case-hunter', 'verification-gap', 'intent-alignment']
review_loop_iteration: 0
followup_review_recommended: false
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/specs/spec-dsa-mastery/curriculum.md']
warnings: ['oversized']
deferred:
  - summary: >-
      The architecture chapters state a Vitest total ("307 unit tests", "307 of 307") and a static-page count ("1,746 static pages") that are not derived or asserted anywhere and are now stale.
    evidence: |-
      tests/claims.test.ts asserts only the browser-test counts. Eight new outline pages and the new unit tests moved both figures. Derive and assert them, or update them from real check and build output, in the frame sweep.
    location: >-
      content/architecture/arch-testing.ts, arch-health.ts, arch-scaling.ts
    severity: low
  - summary: >-
      The coming-soon chapter's DSA row, its percentage and its bar widths are not pinned by the claims test.
    evidence: |-
      The sentence "N chapters written, M outlined" is asserted; the table cell, the "% of the plan" figure and the SVG bar proportions are not, so they go stale silently when an outline is written.
    location: >-
      content/architecture/arch-coming-soon.ts
    severity: low
baseline_revision: '7e16fa633042b9f79f71a8f5c8f0e1c501a2e89a'
---

<intent-contract>

## Intent

**Problem:** The DSA topic lists 34 chapters in an order, numbering and level split that no longer match the target curriculum (`curriculum.md`): recursion should come before sorting, topological sort, tries and the monotonic stack belong in intermediate, eight chapters do not exist yet, chapters carry no prerequisites, and three syllabus lines promise content the chapters do not keep.

**Approach:** Make the data match `curriculum.md`: the 42 chapters in its order with its `num` and level, a `prerequisites` list per chapter, the eight new chapters as outlines in the existing outline layout, `completion: "quiz"` on the DSA topic, and the syllabus lines fixed. Guard it with a curriculum test that has an allow-list for what later stories finish. Chapter ids never change.

## Boundaries & Constraints

**Always:** Every existing chapter id stays exactly as it is (read marks, review and URLs key on them); only `num`, `levels`, array order and `prerequisites` change. The 8 new chapters take exactly these ids and levels: `dsa-js-toolkit` (beginner), `dsa-prefix-sums` (beginner), `dsa-bst-operations` (intermediate), `dsa-grid-bfs` (intermediate), `dsa-dp-state-machines` (intermediate), `dsa-math` (intermediate), `dsa-graph-structure` (advanced), `dsa-sparse-table` (advanced); each is `ready: false` with empty body, subtitle and practice, defined inline in `content/dsa-notes.ts` like other topics' outlines, and has a syllabus section whose bullets come from the Work column of `curriculum.md`. Chapter array order, each chapter's `num` (B1..B12, I1..I19, A1..A11) and the level `syllabus` section order all follow `curriculum.md` exactly, because the cover follows the array and the path pages follow the syllabus. Prerequisites are ids from the Prerequisites column and every one must exist and come earlier in the array. The syllabus lines for A1 (state machines), A3 (topological sort) and A11 (mock technique, company rounds) are dropped or replaced by what the chapter keeps (A11 points to the mock and the interview book). Update every `content/architecture/` sentence and `tests/claims.test.ts` string that the new chapter counts make false (written stays 227; outlines rise by 8). No comments in source; theme tokens only; append new spelling words to the end of `.cspell/project-words.txt`.

**Never:** Do not change chapter prose, exercises or `Exercise.chapter`/`Chapter.practice` links (moving exercises into new chapters happens when each chapter is written); do not touch reading time (`minutesFor`), `interview-data.ts` counts, or `dsa-string-algorithms` NUL separators (story 1.4); do not add `completion` handling anywhere (story 1.3 consumes it); do not change `dsa-notes.ts` `meta.updated`. Do not hard-code a topic id check in shared components.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Cover order | `/dsa` | 42 chapters in curriculum order, 8 shown as outlines, 34 as written | none |
| Moved chapter | tries, monotonic stack, topological sort | listed under Intermediate on the cover, level page and path | none |
| Outline page | `/dsa/dsa-math` | outline layout with the syllabus bullets | none |
| Old link | any existing `/dsa/<id>` | still renders, id unchanged | none |
| Bad prerequisite | a prerequisite that is missing, self-referencing or later in the order | curriculum test fails naming the chapter | test fails |
| Depth bar | a written chapter under 1,200 words of prose not on the allow-list | curriculum test fails; an allow-listed chapter that now meets the bar also fails, so the list only shrinks | test fails |

</intent-contract>

## Code Map

- `content/types.ts:18-31,52-62` -- `Topic` and `Chapter`: add optional `completion?: "read" | "quiz"` to `Topic` and optional `prerequisites?: string[]` to `Chapter` (`ChapterMeta` is `Omit<Chapter,"body">` so it carries it).
- `content/dsa-notes.ts:2-35,42,51-84` -- imports, `meta.subtitle` ("34 sections… all written": make it true for 34 written plus 8 outlined) and the `chapters` array (order is array order; today it does not follow `num`). Rewrite the array to curriculum order and add the 8 outline chapters inline (pattern: `content/docker-notes.ts:15-25`).
- `content/dsa/<id>.ts` (34 files) -- each has `num` (line 5; `dsa-string-algorithms` line 6), `levels` (line 8; that file line 9): set the new `num` and `levels`, add `prerequisites: [...]`. Current-to-target numbers are in `curriculum.md`.
- `content/topics.ts:2474-2713` (DSA topic) -- add `completion: "quiz"`; rewrite `curriculumNotes` (2483-2487) where it contradicts the new split; rewrite the three level `syllabus` arrays (beginner 2504-2557, intermediate ~2558-2634, advanced ~2647-2711) to the curriculum order and membership with one `{title, chapter: id, items}` section per chapter (the 8 new ones included; items from the Work column); remove the promises at 2649-2652 (A1 state machines), 2661 (A3 topological sort) and 2708 (A11 mock technique, company rounds); update level blurbs/checkpoints that name moved topics. `tests/content.test.ts:97-110` requires every syllabus `chapter` to exist.
- `lib/content.ts:83-110` (`chapterMetas`, `chaptersForLevel`), `lib/topics.ts:44-58` (`syllabusSectionForChapter`), `components/reader/topicPages.tsx:207-220` (outline page) -- read-only: they already render outlines from the chapter plus its syllabus section.
- `tests/dsa-curriculum.test.ts` (new) -- the curriculum test: the expected order, `num`, level and prerequisites of all 42 ids written out in the test; ids and order match `chapters("dsa")`; every prerequisite exists and comes earlier; no cycles; written chapters meet the measurable depth bar (at least 1,200 words of prose with `<pre>`, `<script>`, `<svg>` and tags stripped) unless on `DEPTH_ALLOW`; every written chapter has an exercise at or below its level (`Exercise.level` rank against `levels[0]`, counting both `Chapter.practice` and `Exercise.chapter`) unless on `EXERCISE_ALLOW` (curriculum.md "Exercises" names B7, I3, I5, I7, I9, I11 and I16; compute the real list and put exactly those that fail); an allow-listed chapter that now passes fails the test. Outline chapters are skipped for depth and exercise checks.
- `tests/claims.test.ts` and `content/architecture/arch-overview.ts:50`, `arch-coming-soon.ts`, `arch-content-model.ts`, `arch-scaling.ts:73`, `arch-build.ts:184`, `arch-repo-map.ts:136`, `arch-search.ts:146`, `arch-performance.ts:207` -- counts and prose that change with 8 more outlines (outlines 358 to 366, DSA 34 to 42, sitemap unchanged because outlines are excluded); `tests/seo.test.ts` requires outlines out of the sitemap and noindex.
- `e2e/smoke.spec.ts:16,586,1662,1668` -- chapter ids only; nothing asserts `num` or order. Add one e2e: `/dsa` lists the 8 outlines and `/dsa/dsa-math` renders its outline page.
- `content/interview-data.ts:2478,4200` -- "34 chapters and 245 exercises": leave (story 1.4 derives and asserts it).

## Tasks & Acceptance

**Execution:**
- [x] `content/types.ts` -- `Topic.completion` and `Chapter.prerequisites` -- the data model
- [x] `content/dsa/*.ts` (34) and `content/dsa-notes.ts` -- `num`, `levels`, `prerequisites`, the 8 inline outlines, curriculum order, subtitle -- the chapter list
- [x] `content/topics.ts` -- DSA `completion`, notes, three syllabus arrays in curriculum order, promises dropped -- the level and path data
- [x] `tests/dsa-curriculum.test.ts` -- the curriculum test with `DEPTH_ALLOW` and `EXERCISE_ALLOW` -- keeps the data honest
- [x] `tests/claims.test.ts`, `content/architecture/*` -- true counts and prose -- the site describes itself correctly
- [x] `e2e/smoke.spec.ts` -- the 42-chapter cover and one outline page -- proof on the real pages

**Acceptance Criteria:**
- Given `/dsa`, then it lists 42 chapters in `curriculum.md` order with the eight new ones as outlines, and every existing `/dsa/<id>` still renders.
- Given `/level/dsa` and `/path/dsa/intermediate`, then tries, the monotonic stack and topological sort sit under Intermediate in curriculum order.
- Given the curriculum test, then it passes with the real allow-lists and fails if a prerequisite is missing or later, or if an allow-listed chapter now meets the bar.
- Given `npm run check`, `npm run build` and the full `npm run test:e2e`, then all pass (axe included).

## Implementation Notes

- The curriculum test writes the target (order, `num`, level, prerequisites) out in full; `DEPTH_ALLOW` holds the 20 written chapters under 1,200 prose words and `EXERCISE_ALLOW` holds `dsa-sliding-window`, the only chapter without an exercise at or below its level (the other chapters curriculum.md names already have one). Both lists must be empty at the release gate (7.5).
- The depth-bar test measures prose words only; the arc, the why-it-works and common-mistakes boxes and "code matches the player" are defined by later stories and are not tested here.
- Existing chapter titles were left as they are (only `num`, `levels`, order and `prerequisites` changed); several differ from curriculum.md only by `&` versus `and`, and I8's and A3's wording changes belong to the stories that rewrite those chapters. The I8 syllabus section keeps the chapter's title "Topological patterns".
- Prerequisites may name outline-only chapters (for example `dsa-js-toolkit`); gating on them is the placement and plan stories' job.
- A quoted historical commit title in `arch-coming-soon.ts` keeps its original number (358).

## Plan Change Log

## Review Triage Log

### 2026-10-07 — Review pass
- verdicts: 29 findings — high 0, medium 0, low 17, false 12, maybe-false 0
- findings:
  - `[low]` `[defer]` blind-hunter/gap: the "1,746 static pages" figure was not updated for 8 new pages — not asserted anywhere; derive it in the frame sweep
  - `[low]` `[defer]` blind-hunter/edge/gap: the "307 unit tests" total is stale — not asserted and already stale; derive it in the frame sweep
  - `[false]` `[reject]` blind-hunter/edge: `arch-search.ts:146`, `arch-performance.ts:207` and `claims.test.ts` were not changed — their DSA rows count written chapters (outlines are not indexed) and the claims test derives its counts
  - `[low]` `[patch]` blind-hunter: a quoted historical commit title had its number rewritten — restored to 358
  - `[low]` `[reject]` blind-hunter: the new e2e is missing from the testing chapter's flow list and a11y does not visit an outline page — the flow list names no flow by count claim, and the outline layout is already axe-tested through `/typescript/ts-setup-compiler`
  - `[low]` `[patch]` blind-hunter/edge/intent: the e2e counts links across the whole page and checks neither order nor level grouping — now reads the cover's links in order, checks the first five and that recursion precedes sorting, and that tries, monotonic stack and topological sort sit under Intermediate and not Advanced
  - `[low]` `[patch]` blind-hunter/edge: syllabus titles diverge from chapter titles and nothing checks outline bullets — the I8 section is titled like its chapter; a test asserts each chapter appears once and every outline has bullets
  - `[false]` `[reject]` blind-hunter: new unkept promises ("digit and interval DP", "alien dictionary, longest path in a DAG") — checked: the bodies cover digit DP, interval DP, the alien dictionary and longest path
  - `[false]` `[reject]` blind-hunter/edge: written chapters list outline-only prerequisites, some look odd — they are the Prerequisites column of curriculum.md; gating is a later story
  - `[low]` `[reject]` blind-hunter: the outline test hard-codes 8 ids and the no-cycle test is redundant — the first fails the moment an outline is written, which is the intended prompt to update it
  - `[false]` `[reject]` blind-hunter: old chapter numbers are not swept — a grep finds no body text referring to a chapter by its old number
  - `[false]` `[reject]` blind-hunter: spelling and checkpoint bullets — cspell passes and the level blurbs were updated
  - `[low]` `[defer]` edge-case-hunter/gap: the coming-soon DSA row, percentage and bar widths are not pinned — sweep
  - `[low]` `[reject]` edge-case-hunter: the literal "Not written yet." — it is the string the outline page renders
  - `[false]` `[reject]` edge-case-hunter: a dangling practice id passes silently — `tests/content.test.ts` already asserts every practice id exists
  - `[low]` `[patch]` intent-alignment: the rendered order and level grouping are asserted only through data — covered by the e2e above
  - `[false]` `[reject]` intent-alignment: `completion: "quiz"` is not consumed — consumed by story 1.3, by plan
  - `[low]` `[reject]` intent-alignment: the depth bar is only measured by word count — the rest is defined by later stories
  - `[false]` `[reject]` intent-alignment: the exercise allow-list holds one chapter, not seven — it is computed from the real data
  - `[false]` `[reject]` intent-alignment: the plan was left `in-progress` — closed out at Finalize

## Design Notes

The curriculum test writes the target out in full (id, `num`, level, prerequisites) rather than reading `curriculum.md`, so the markdown stays prose and the test is the executable copy. The allow-lists are the visible to-do list for the level epics; the release gate (7.5) needs them empty.

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: green
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build` then `npm run test:e2e` -- expected: all pass

**Manual checks (if no CLI):**
- Screenshot `/dsa`, `/level/dsa` and `/dsa/dsa-math` at 1440 and 390 on a throwaway port (not 3000) with reduced motion; the order, the outline cards and the outline page read correctly.

## Auto Run Result

**Summary:** The DSA topic data now follows `curriculum.md`: 42 chapters in its order with its `num` and level, a `prerequisites` list on every chapter (new optional field), the eight new chapters as outlines in the outline layout, `Topic.completion: "quiz"` set (consumed by 1.3), the three syllabus arrays rewritten in curriculum order with the A1, A3 and A11 promises dropped, and a curriculum test with allow-lists for what later stories finish. Chapter ids did not change.

**Files changed:** `content/types.ts`, the 34 `content/dsa/*.ts` chapter files (`num`, `levels`, `prerequisites`), `content/dsa-notes.ts`, `content/topics.ts`, `tests/dsa-curriculum.test.ts`, `e2e/smoke.spec.ts`, `.cspell/project-words.txt`, and the architecture chapters whose counts changed (`arch-overview`, `arch-coming-soon`, `arch-build`, `arch-scaling`, `arch-content-model`, `arch-repo-map`, `arch-testing`, `arch-health`).

**Review:** 29 findings: low 17, false 12. Patched 8 (a restored historical quote, an I8 title, an e2e that checks order and level grouping, extra curriculum assertions), deferred 5 low ones to the frame sweep, rejected the rest with reasons logged above.

**Follow-up review recommended:** false.

**Verification:** `npm run check` 370 unit tests, build ok, full `npm run test:e2e` 192 (191 plus the strengthened DSA test, re-run alone after a selector fix); screenshots of `/dsa` and `/dsa/dsa-math` at 1440 and 390 with no horizontal scroll.

**Residual risks:** 20 chapters are on `DEPTH_ALLOW`; the architecture chapters' unit-test and static-page figures are stale until the frame sweep.
