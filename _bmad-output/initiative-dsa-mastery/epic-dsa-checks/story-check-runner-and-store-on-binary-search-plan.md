---
title: 'Check runner and store on binary search'
type: 'feature'
ticket: '2'
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
      The check's draw cannot be fixed from outside, so e2e and axe coverage of a given question kind (multi, code, predict) depends on retry loops over a random draw.
    evidence: |-
      begin() uses Math.random; startOnOrderQuestion retries up to 15 draws and the phone test up to 6 rounds. A test-only seed or one axe state per question kind would make it deterministic; do it in the checks sweep (3.8).
    location: >-
      components/check/CheckRunner.tsx, e2e/check.ts
    severity: low
  - summary: >-
      `.endReview` text was moved from `--success` to `--ink` to pass contrast; the real defect is that `--success` fails 4.5:1 as text on its soft background in the light theme.
    evidence: |-
      Measured 4.17:1 on the done end card. Other text uses of `--success` are unaudited; a text-safe success token would fix the cause. Revisit in the frame sweep (1.5).
    location: >-
      components/series/chapter.module.css, app/globals.css
    severity: low
  - summary: >-
      CheckRunner, ChoiceList and OrderList are tested only through e2e flows, not at component level.
    evidence: |-
      The pure rules are unit-tested (draw, record, store, review note); the phase transitions and the section-title fallback are not. Extract and test them in the checks sweep (3.8).
    location: >-
      components/check/CheckRunner.tsx
    severity: low
  - summary: >-
      Unit-test totals in the architecture chapters are stale and asserted nowhere.
    evidence: |-
      Vitest runs 582 tests in 34 files; derive and assert the figures in the frame sweep (1.5).
    location: >-
      content/architecture/arch-testing.ts, arch-health.ts, arch-tech-stack.ts, arch-repo-map.ts
    severity: low
baseline_revision: '82fb267bd46ae1e27409bbc8887f801381572c88'
---

<intent-contract>

## Intent

**Problem:** A DSA chapter's end card shows 1.3's stub ("The chapter check is not built yet"), so no unread DSA chapter can be marked read, nothing records how a reader did, and the questions authored in 3.1 are never asked.

**Approach:** Replace the stub with a real chapter check. A server `CheckIsland` loads the chapter's pool and hands its questions to a client `CheckRunner`; on Start the runner draws 5 (at least one `trace`, at least one `recognise` or `complexity`), asks them one at a time with native choices (`ChoiceList`) or a keyboard-first `OrderList`, grades, explains every choice, and passes at 4 of 5. A pass marks the chapter read through `setChapterDone` and shows the score and the review-in-3-days note; a miss shows the missed questions with section links and retries on a fresh draw; "mark done anyway" marks it read as not checked; old read marks show "read before checks" with an optional "Check yourself". Results, including the missed question ids, live in the new versioned `groundwork:quiz` store.

## Boundaries & Constraints

**Always:**
- Pure logic in `lib/` with unit tests, no `"use client"`: `lib/checkDraw.ts` (`drawCheck(questions, random, avoid?)` returns 5 questions in a shuffled order with at least one `trace` and at least one `recognise` or `complexity`; with `avoid` it prefers questions not in the previous draw and the draw as a set differs from the previous one whenever the pool allows; fewer than 5 questions returns what exists; `gradeAnswer(question, answer)` for `single` (the id), `multi` (exact set), `order` (exact sequence) and `predict` (as single); `passes(score)` is score at least 4 of 5) and `lib/quizRecord.ts` (the record shape `{attempts, best, lastAt, passedAt, markedAnyway, missed}`, `applyAttempt`, `applyPass`, `applyMarkedAnyway`, `applyUnmark` and `checkStatus(done, record)` returning `passed`, `not-checked`, `read-before-checks` or `unread`).
- The store `lib/quizStore.ts` (`"use client"`), key `groundwork:quiz`, `{v: 1, chapters: Record<chapterId, record>}`: a `useSyncExternalStore` store with a snapshot cache, an unsaved in-memory fallback when storage fails, a storage-event listener filtered by key, and a stale or unknown version treated as empty, following `lib/codeLanguage.ts`. `missed` holds the ids missed in the latest attempt (the later shaky-list work reads it; this entry writes no shaky list). Unmarking a chapter clears `passedAt` and `markedAnyway` but keeps attempts, best and missed. It never writes a `jsnotes:*` key itself; the read mark stays in `jsnotes:progress` and `lib/storage.ts` is unchanged.
- Components in `components/check/`: `CheckIsland.tsx` (async server component, keeps `<section id="check" data-island="check" data-speech-exclude tabIndex={-1} aria-label="Chapter check">`; loads the pool with `loadPool(chapterId)` and passes only that chapter's questions as props; a chapter with no pool shows a plain sentence that its check is not written yet and a "Mark as read" button that marks it read as not checked), `CheckRunner.tsx` (client), `ChoiceList.tsx` (client; reused later by predict, the complexity round and puzzles: one `<fieldset>` with a `<legend>`, native radio buttons for `single` and `predict` and checkboxes for `multi`, each choice a real label; after the answer is checked it shows every choice's `why` as text and marks the right ones and the reader's pick in words as well as style) and `OrderList.tsx` (client; reusable; items start shuffled but never in the correct order; every item has "Move up" and "Move down" buttons with the item named in their accessible name, disabled at the ends; an `aria-live` line announces "<item> moved to position n of m"; works by keyboard alone, no drag). `check.module.css` styles them with theme tokens only.
- Flow in the runner: a start card ("5 questions, pass at 4"; the "checked, never verified" wording) with a "Start the check" button (or "Check yourself" when the chapter is already read before checks) and, for an unread chapter, "Mark as read without the check"; then one question at a time: choose, press "Check answer", see "Correct" or "Not quite" as text in an `aria-live` region plus every choice's explanation, press "Next question" (or "See result" after the fifth). The draw happens on Start in the browser, never during the server render. Each question's fieldset carries `data-question="<id>"`. After the fifth: a pass screen (score "4 of 5", confetti through `components/practice/Confetti`, the note that the chapter comes back for review in 3 days) or a miss screen (score, each missed question's prompt with a link to `${basePath}/${chapterId}#${section}`, the explanation of its right answer, a "Try again" button that draws fresh questions, and "Mark as read anyway (not checked)"). Retries are unlimited. A pass calls `progress.setChapterDone(chapterId, true)` only when the chapter is not already read (a "Check yourself" pass on an old mark keeps the existing read mark and its review clock) and records the pass; "mark done anyway" calls `setChapterDone` and records `markedAnyway`; unmarking stays free through the existing "Mark as unread" control, which now also calls the store's unmark.
- Status text shown in the island: "Checked" with the score and date after a pass, "Marked read, not checked" after the anyway path, "Read before checks" with the "Check yourself" offer for an old mark. No state is shown by colour alone.
- Keys: only while focus is inside the check; the runner root stops the reader's plain-key shortcuts (`n`, `p`, `t`, `[`, `]`, `/`) from reaching the page, and a test presses one inside the check and proves the page does not move or navigate.
- `components/topic/TopicReader.tsx` renders a `check` node passed in from `components/reader/topicPages.tsx` (the same way `islands` are passed, because `TopicReader` is a client component and cannot render an async server component), instead of importing the stub; `topicPages.tsx` builds the `CheckIsland` element only when `requiresCheck(completion)`; `lib/completion.ts` and the tick links stay as they are.
- Phones: no sheet unless it fails. Code in a prompt scrolls horizontally inside a focusable labelled region (a wrapper with `tabIndex={0}`, `role="region"` and an `aria-label` when the HTML holds a `<pre>`); record in the notes what was measured at 390px and whether a sheet proved necessary.
- Payload: only the chapter's own pool is serialised, and only for a chapter whose pool exists; nothing imports `content/dsa/quiz/*` except `lib/quizPool.ts` (the importer test stays green) and `tests/client-bundle.test.ts` stays green (client files import types only from `content/`).
- Tests: unit tests for the draw rule (5 drawn, at least one trace, at least one recognise or complexity, order shuffled, a retry draws a different set, a thin pool), grading for every kind (including multi partial credit being wrong and order wrong), the record transitions and `checkStatus`, the store (versioning, stale value, missed ids kept, unmark rules, snapshot stays referentially stable). E2E in `e2e/smoke.spec.ts`: a keyboard user passes (the test reads each question's `data-question` id, looks up the answer in the pool file and answers by keyboard) and sees the score, the review note and the chapter marked read; a seeded read mark 4 days old then shows on `/review` as due; a miss shows explanations, section links and a different draw on retry; an order question is answered by keyboard; "mark done anyway" shows "not checked"; a seeded old mark shows "read before checks"; a chapter without a pool offers "Mark as read"; the store keeps the missed ids. E2E in `e2e/a11y.spec.ts`: new STATES for the start card, a checked answer with explanations, the miss screen, the pass screen and an order question, desktop and phone, nine themes. Rewrite the existing "unread chapter's tick links to its check" test, which asserted the stub text; its tick, `#check` ordering and non-quiz-topic assertions stay true.
- Update the architecture chapters in this entry for everything that moves: list `groundwork:quiz` in `arch-state.ts` (table row and the key counts that its prose states), the CheckIsland paragraph and the quiz paragraph in `arch-rendering.ts`, and every count `tests/claims.test.ts` asserts (CSS modules, `"use client"` files, a11y pages and states, smoke flows, browser totals); `tests/claims.test.ts` stays green. Copy says "checked", never "verified". No comments in source, tests included. Append new spelling words to the end of `.cspell/project-words.txt`.

**Never:** Do not build the end-of-chapter popup (3.9), the plan, cover or path states and the `/review` "not checked" badge (3.4), the placement flow (3.3, 3.7), generated trace questions (3.5), predict-in-player (3.6), the complexity round (3.10), badges (3.11), a shaky-list writer, or any other chapter's pool. Do not change `lib/storage.ts`, `lib/completion.ts`, the Player, the language switch or any chapter body. Do not add a runtime dependency or a drag-and-drop library. Do not put question data on `Chapter` or ship another chapter's questions.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Pass | 4 or 5 right | score shown, chapter marked read, review-in-3-days note, store keeps `passedAt` and `missed` | none |
| Miss | 3 or fewer right | explanations, section links for missed questions, fresh draw on "Try again", store keeps the missed ids | none |
| Retry draw | after a miss | a different set of 5 whenever the pool allows | thin pool returns what it can |
| Mark done anyway | on the start or miss screen | chapter read, "Marked read, not checked" | none |
| Old mark | seeded `jsnotes:progress`, no quiz record | "Read before checks" and "Check yourself" | none |
| Check yourself on an old mark, pass | read mark already exists | pass recorded, read mark and its `at` and `reviews` unchanged | none |
| Unmark | "Mark as unread" | free; `passedAt` and `markedAnyway` cleared, attempts kept | none |
| No pool | any DSA chapter but binary search | sentence that its check is not written yet and a "Mark as read" button | none |
| Order question | keyboard Tab, Enter on Move up or Move down | list reorders, live line announces it, Check answer grades the sequence | none |
| Keys inside | `n`, `p`, `t`, `[`, `]`, `/` with focus in the check | page does not move or navigate | none |
| Stale store | `groundwork:quiz` holds an unknown version or junk | treated as empty | none |
| Storage fails | write throws | the session keeps its results in memory | none |
| Quiz topic first paint | server render | start card only, no random draw in the HTML | none |

</intent-contract>

## Code Map

- `components/check/CheckIsland.tsx` -- 1.3 stub (server, no props); becomes the async loader; keep `id="check"`, `data-island="check"`, `tabIndex={-1}`, `.checkIsland` scroll margin in `components/topic/reader.module.css:116-127`.
- `components/topic/TopicReader.tsx` -- renders `{requiresCheck(completion) && <CheckIsland />}` at about line 266 between `PracticeStrip` and `ChapterEnd`; `toggleRead` at about line 96 uses `progress.setChapterDone`; `done` comes from `useProgressValue`; change to a `check` prop and call the store's unmark when unmarking. `components/reader/topicPages.tsx` (`TopicChapterPage`, about line 152) builds `islands`; add the `check` node the same way (it may become async).
- `components/chapter/ChapterEnd.tsx`, `lib/completion.ts` (`requiresCheck`, `tickHref`) -- unread quiz chapters link to `#check`; do not change.
- `lib/storage.ts` -- `progress.setChapterDone` (about lines 117-126) writes `{at: Date.now(), reviews: 0}` even when already read; `REVIEW_GAPS_DAYS = [3, 7, 21, 60, 180]`, `dueAt` (about lines 60-71); `app/review/ReviewView.tsx` computes due rows from `progress.all().chapters`.
- `lib/codeLanguage.ts` -- template for the versioned store (cache, unsaved fallback, storage listener); `lib/interviewConfidence.ts` for the stable empty snapshot.
- `components/play/Player.tsx` (lines 85-104) -- precedent for scoped keys (`onKeyDown` on a `role="group" tabIndex={-1}` wrapper, modifier keys ignored, `preventDefault`, `stopPropagation`) and a `role="status"` line; `components/chapter/useChapterKeys.ts` registers the document-level `n`, `p`, `[`, `]`, `t`, `/` shortcuts and skips only INPUT, TEXTAREA, SELECT, contentEditable.
- `components/practice/Confetti.tsx` (`{fire}`, honours `prefersMotion`); `components/practice/FileDialogs.tsx:58` real `<fieldset>`; `.visually-hidden` in `app/globals.css:836`.
- `lib/quizPool.ts` (`loadPool`), `content/quiz-types.ts` (`Question`, `Choice`, `OrderItem`; text is HTML, render with `dangerouslySetInnerHTML`), `lib/quiz.ts` (`SKILLS`, `wordingProblems`), `content/dsa/quiz/dsa-binary-search.ts` (11 questions: single, multi, order `bs-order-one-pass` with code, 3 recognise, 2 trace, 2 complexity, 4 edge-case); `lib/headingToc.ts` section ids.
- `tests/client-bundle.test.ts`, `tests/dsa-quiz.test.ts` (importer rule), `tests/claims.test.ts`; `e2e/smoke.spec.ts` about lines 452-546 (the stub test) and `e2e/a11y.spec.ts` `PAGES`/`STATES` (the 4-space `name:`/`viewports:` format that the claims test parses).
- `content/architecture/arch-state.ts` (key table around lines 109-115; prose counts at about lines 12, 62, 99, 226), `arch-rendering.ts` (about lines 145-153), `arch-design-system.ts`, `arch-tech-stack.ts`, `arch-testing.ts`, `arch-health.ts`.
- New: `lib/checkDraw.ts`, `lib/quizRecord.ts`, `lib/quizStore.ts`, `components/check/{CheckRunner,ChoiceList,OrderList}.tsx`, `components/check/check.module.css`, `tests/check-draw.test.ts`, `tests/quiz-record.test.ts`, `tests/quiz-store.test.ts`.

## Tasks & Acceptance

**Execution:**
- [x] `lib/checkDraw.ts` -- draw, shuffle, grade and pass rule as pure functions -- testable without a browser
- [x] `lib/quizRecord.ts` -- record shape, transitions and `checkStatus` -- one place for the states
- [x] `lib/quizStore.ts` -- the versioned `groundwork:quiz` store -- results and missed ids persist
- [x] `components/check/ChoiceList.tsx`, `OrderList.tsx` -- native choices and the keyboard-first order list -- reused later
- [x] `components/check/CheckRunner.tsx`, `check.module.css` -- the flow, feedback, pass and miss screens, status text, scoped keys -- the check
- [x] `components/check/CheckIsland.tsx`, `components/reader/topicPages.tsx`, `components/topic/TopicReader.tsx` -- load the pool on the server, pass the node in, unmark clears the record -- wiring
- [x] `tests/check-draw.test.ts`, `tests/quiz-record.test.ts`, `tests/quiz-store.test.ts` -- the rules above, with failing fixtures
- [x] `e2e/smoke.spec.ts`, `e2e/a11y.spec.ts` -- rewrite the stub test, add the flows and the axe states
- [x] `content/architecture/*` -- the key, the paragraphs and every claimed count -- claims test stays green
- [x] `.cspell/project-words.txt` -- append any new words at the end

**Acceptance Criteria:**
- Given an unread `/dsa/dsa-binary-search`, when a keyboard user starts the check and answers 4 or 5 of 5 correctly, then the score, the review-in-3-days note and "Checked" show, the chapter is read, and a read mark aged past 3 days shows on `/review`.
- Given a miss, then every explanation, a section link for each missed question and a different draw on "Try again" appear, and `groundwork:quiz` holds the missed ids.
- Given an order question, when answered by keyboard with the Move buttons, then it reorders, is announced and is graded.
- Given "Mark as read anyway", then the chapter is read and the island says "Marked read, not checked".
- Given a seeded read mark with no quiz record, then the island says "Read before checks" and offers "Check yourself"; a pass keeps the read mark's `at` and `reviews`.
- Given focus inside the check, when `n`, `p`, `t`, `[`, `]` or `/` is pressed, then the page neither scrolls nor navigates.
- Given any other DSA chapter, then its check island offers "Mark as read" and says the check is not written yet.
- Given the server HTML of `/dsa/dsa-binary-search`, then it holds the start card and no drawn question.
- Given axe on the check states at 1440 and 390 in nine themes, then there are no violations, and `npm run check`, `npm run build` and the full e2e pass.

## Implementation Notes

- 390px: measured `scrollWidth - innerWidth` as 0 on every question (before and after checking) and on the result; the code prompts scroll inside a focusable `role="region"` labelled "Code in question n of 5". No sheet was needed.
- `components/check/RichHtml.tsx` and `e2e/check.ts` are small additions beyond the listed files (shared prompt/region wrapper, shared keyboard helpers for both specs).
- `components/series/chapter.module.css` `.endReview` colour changed from `--success` to `--ink`: on the done end card it measured 4.17:1 in the light theme and the new pass-screen axe states exposed it.
- The cover and path "Mark as unread" buttons still call `progress.setChapterDone` only; `checkStatus` derives from the read mark so a stale pass cannot show. 3.4 can route them through the store's unmark.
- The unit-test counts in `arch-testing.ts` (307 tests, 19 files) were already stale and are not asserted; left as they were.

## Plan Change Log

## Plan Change Log

- 2026-10-08, after the review pass and before commit, the owner reported that "Mark as read" did nothing on every DSA chapter except binary search. Cause: 1.3's `tickHref` links the end card, contents card, cover and path ticks to `#check` for every quiz-topic chapter, but only binary search has a check; elsewhere the link only scrolls to the island. Amendment: the server passes the ids of chapters that have a pool, `tickHref` returns null for a chapter with no check so the plain read toggle shows, and the no-pool island shows "Marked as read" once read. KEEP: binary search still links its ticks to `#check`; the island's own "Mark as read" button stays.

## Review Triage Log

### 2026-10-08 — Review pass
- verdicts: 27 findings (duplicates across lenses merged) — high 0, medium 5, low 17, false 5, maybe-false 0
- findings:
  - `[medium]` `[patch]` blind-hunter, edge-case-hunter, intent-alignment: the pass screen after "Check yourself" on an old mark reads `REVIEW_GAPS_DAYS[reviews]` as days to wait, but `dueAt` counts from the original read time, and the e2e locks in "21 days" — a pure `reviewNote` derives days from `dueAt - now`
  - `[medium]` `[patch]` blind-hunter, edge-case-hunter: a pool of fewer than 4 questions can never pass and the start card still says 5 — `passMark(total)` and the real count shown
  - `[medium]` `[patch]` blind-hunter: the `role=status` verdict is `display:none` when empty, so an announcement can be missed — always rendered
  - `[medium]` `[patch]` blind-hunter: focus drops to the body after the mark-read buttons unmount — focus moves to the new state's status line
  - `[medium]` `[patch]` blind-hunter, edge-case-hunter: double-click or held Enter on "Check answer" lands on the relabelled next button and skips the explanations — separate button elements
  - `[low]` `[patch]` blind-hunter: every missed code question gets the same region name — numbered
  - `[low]` `[patch]` edge-case-hunter: a storage event with key null (`localStorage.clear()`) is ignored — notified
  - `[low]` `[patch]` blind-hunter, edge-case-hunter: the same order move is not re-announced, and the list has no position for a screen reader — move counter, list role, hidden position
  - `[low]` `[patch]` verification-gap, blind-hunter, edge-case-hunter: the cover and path "Mark as unread" buttons and "Reset my progress" skip the store, so the record disagrees with the unmark rule — routed through `quizStore.unmark` and `clear`, with an e2e
  - `[low]` `[patch]` blind-hunter: the status line mixes the best score with the pass date, with a fixed `en-GB` locale — separated, locale-aware
  - `[low]` `[patch]` blind-hunter: `RichHtml` has an unneeded `"use client"` that inflates the stated count — removed
  - `[low]` `[patch]` blind-hunter: e2e hard-codes the no-pool chapter and sleeps in the plain-key test — derived and polled
  - `[low]` `[defer]` blind-hunter, intent-alignment: the draw cannot be fixed, so axe and e2e coverage of a question kind depends on retries — checks sweep
  - `[low]` `[defer]` blind-hunter, intent-alignment: the `.endReview` colour change hides a `--success` text-contrast problem — frame sweep
  - `[low]` `[defer]` blind-hunter, verification-gap, intent-alignment: no component-level tests of the runner and lists — checks sweep
  - `[low]` `[defer]` blind-hunter, edge-case-hunter, verification-gap, intent-alignment: unit-test totals stale — frame sweep
  - `[low]` `[reject]` edge-case-hunter: a pass leaves the pass screen when `setChapterDone` cannot persist — storage failure is app-wide and `progress` has no in-memory fallback by design
  - `[low]` `[reject]` edge-case-hunter, verification-gap: the "Read again" label comes from the live heading text — the section ids come from the same headings, and the link target is tested
  - `[low]` `[reject]` blind-hunter, edge-case-hunter, intent-alignment: `e2e/check.ts` imports the pool file, which the importer test does not scan — the plan allows the answer lookup in tests, and the rule guards the app bundle
  - `[low]` `[reject]` edge-case-hunter: "Check yourself" shows for every read chapter, not only old marks — harmless retake, copy and tests agree
  - `[low]` `[reject]` blind-hunter: architecture prose nits (the "and"-chain, a click-count wording, a long run-on) — wording, no wrong count
  - `[low]` `[reject]` intent-alignment: keyboard tests focus programmatically instead of walking Tab, and `TopicChapterPage` became async — presses are real keys; async is how `PlayIsland` already works
  - `[false]` `[reject]` intent-alignment: the 390px unknown is judged by absence of overflow only — overflow was measured 0 on every state and the code scrolls in a labelled focusable region, so no sheet is needed
  - `[false]` `[reject]` blind-hunter: the story file's tasks and logs are unfinished — closed out here
  - `[false]` `[reject]` intent-alignment: `/review` is exercised only by time travel — a real 3-day wait cannot be tested; the seeded `at` is the same data a wait produces
  - `[false]` `[reject]` blind-hunter: the pass note always says 3 days — a fresh pass says 3 days, a kept mark now says what is due
  - `[false]` `[reject]` intent-alignment: store and draw-rule tests do not render the component — the unit tests cover the rules; the component is covered by e2e and axe

## Design Notes

The runner is a small state machine: `start` to `asking` (question index, chosen answer, checked or not) to `result` (pass or miss). The draw happens on Start in the browser, so the cached server HTML never holds random content and hydration cannot mismatch. `checkStatus` is derived from the read mark and the record, so unmarking and re-marking cannot leave a stale "checked"; 3.4 will reuse it for the plan, cover and review.

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: all green, comments check clean
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build` -- expected: success
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run test:e2e` -- expected: all pass (serves the production build on port 3100)

**Manual checks (if no CLI):**
- Screenshots of the start card, a question with code, an explanation, the miss and pass screens and the order question at 1440 and 390 in two themes; no horizontal page scroll, state shown in words.

## Auto Run Result

**Summary:** Every unread DSA chapter can be marked read again. `/dsa/dsa-binary-search` has a real chapter check: a start card, then five questions drawn on Start (at least one trace, at least one recognise or complexity), one at a time with native radios and checkboxes (`ChoiceList`) or a keyboard-first `OrderList` with Move up and Move down, "Check answer", every choice's explanation, and a pass at 4 of 5. A pass marks the chapter read through `setChapterDone` (skipped when it is already read, so an old mark keeps its review clock), shows the score, confetti and when the chapter comes back for review; a miss lists each missed question with a section link and retries on a fresh draw; "Mark as read anyway (not checked)" and a "Check yourself" offer on old marks are in. Results, including the missed question ids, live in the new versioned `groundwork:quiz` store (`lib/quizStore.ts`, pure rules in `lib/checkDraw.ts`, `lib/quizRecord.ts`, `lib/reviewNote.ts`). Every other DSA chapter shows that its check is not written yet; its end card, contents card, cover and path ticks are plain read toggles (a tick links to `#check` only when the chapter has a pool), and once read the island says "Marked as read". Plain reader keys (`n`, `p`, `t`, `[`, `]`, `/`) stay out of the check.

**Files changed:** `lib/checkDraw.ts`, `lib/quizRecord.ts`, `lib/quizStore.ts`, `lib/reviewNote.ts`, `lib/codeLanguage.ts` (null-key storage event), `components/check/{CheckIsland,CheckRunner,ChoiceList,OrderList,RichHtml}.tsx`, `components/check/check.module.css`, `components/reader/topicPages.tsx`, `components/topic/{TopicReader,TopicCover,TopicPath}.tsx`, `lib/completion.ts` (`tickHref` takes whether the chapter has a check), `app/path/[topic]/[level]/page.tsx`, `components/series/chapter.module.css` (`.endReview` colour), `tests/{check-draw,quiz-record,quiz-store,review-note}.test.ts`, `e2e/check.ts`, `e2e/smoke.spec.ts`, `e2e/a11y.spec.ts`, and the architecture chapters (the new key, the paragraphs and every count).

**After review:** the owner found that the end card, contents card, cover and path ticks were still `#check` links on every chapter without a pool, so "Mark as read" appeared dead; fixed here (see the Plan Change Log) and covered by an e2e on a no-pool chapter plus a real click on `/dsa/dsa-complexity-analysis`.

**Review:** 27 findings: medium 5, low 17, false 5. Patched 12 groups (the review note after a check on an old mark, a thin pool, an always-rendered live region, focus after the mark-read buttons, double-click and held Enter, unique region names, null-key storage events, order-list announcements, cover and path unmark and reset through the store, the status line, an unneeded client directive, e2e coupling), deferred 4 low (a fixed draw for tests, the `--success` text contrast, component-level tests, stale unit-test totals), rejected the rest with reasons logged.

**Follow-up review recommended:** false.

**Verification:** `npm run check` 580 unit tests, build ok, full e2e 236/236 including axe on six check states at 1440 and 390 in nine themes; screenshots of the start card, a question, an explained answer and the miss screen at 1440 and 390 with no horizontal scroll (code scrolls in a labelled region; no sheet was needed).

**Residual risks:** only binary search has a pool; the plan, cover, path and `/review` still do not show "not checked" (3.4); the end-of-chapter popup is 3.9.
