---
title: 'End-of-chapter popup: Mark this chapter done?'
type: 'feature'
ticket: '9'
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
      The popup needs no reduced-motion branch because it never animates, so the contract's reduced-motion clause is met by absence and has no test of its own.
    evidence: |-
      The dialog appears with no transition or fade; the dwell timer and the observer do not depend on motion.
    location: >-
      components/check/EndPopup.tsx
    severity: low
  - summary: >-
      Only chapters with a written check can show the popup, so every DSA chapter except binary search stays quiet until its pool exists.
    evidence: |-
      A chapter outside checkChapterIds has no check to open, and Yes would land on a not-written sentence.
    location: >-
      components/topic/TopicReader.tsx
    severity: low
baseline_revision: 'ee6f8f90503d117a47fe45a0d75ed7f25896a247'
---

<intent-contract>

## Intent

**Problem:** A DSA reader who reaches the end of a chapter that has a check and is not done gets only the quiet finish card, so the check is easy to miss, and there is nowhere to record that the reader was already asked.

**Approach:** A focus-trapped, taped paper dialog asks "Mark this chapter done?" once, after the reader has stayed on the end card; Yes opens the check at `#check`, and any close (Not yet, Escape, backdrop) records `popupDismissed` for the chapter in `groundwork:quiz` so it never returns.

## Boundaries & Constraints

**Always:**
- Opens only when all hold: hydrated, the chapter has a check, it is not read, no dismissal is saved, the page was not reached or left at `#check`, no check question is on screen, no other modal is open, and the end card has stayed in view for the dwell time.
- Nothing renders before hydration and nothing animates in (no part-transparent frames); the sentinel and timer are quiet under reduced motion and when jumping straight to the end.
- Yes records the dismissal too (it was asked and answered), then does what the finish card's tick does: asks the runner to open and sets the `#check` hash.
- Focus lands on the dialog itself so a stray Space cannot press a button; Tab reaches Yes then Not yet and loops; closing returns focus to where it was.
- Theme tokens and the `--t-*` scale only, 44px targets, no comments, no new storage key; the new field is listed in How this is built.

**Never:** Do not change the check runner's flow, `lib/completion.ts`, `lib/storage.ts`, the end card layout, `nextChapter`, or the whiteboard. Do not build the complexity round (3.10) or badges (3.11).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| First time at the end | not read, no dismissal, end card in view for the dwell | popup opens once | none |
| Yes | popup open | dismissal saved, popup closes, check opens at `#check` | none |
| Not yet | popup open | dismissal saved, popup closes, focus returns, never back after a reload | none |
| Escape or backdrop | popup open | same as Not yet | none |
| Done chapter | read mark present | never opens | none |
| Arrived at `#check` | hash is `#check` on load or at the dwell's end | never opens | none |
| Check in progress | a question is on screen | never opens | none |
| Chapter without a check | not in `checkChapterIds` | never opens | none |
| Fly-by | end card leaves view before the dwell | never opens | timer cleared |
| Storage fails | write throws | dismissal kept in memory for the session | none |

</intent-contract>

## Code Map

- `lib/quizRecord.ts`, `lib/quizStore.ts` -- record gains `popupDismissed` (sanitised, kept by every transition), store gains `recordPopupDismissed`.
- `lib/endPopup.ts` (new, pure) -- dwell time, `shouldOpenEndPopup` decision, `reachedEnd` test for an observer entry.
- `components/check/EndPopup.tsx` (new, client) -- sentinel, IntersectionObserver, timer, store reads, lazy dialog.
- `components/check/EndPopupDialog.tsx`, `endPopup.module.css` (new) -- the portal dialog on `FocusTrap`, following `components/tour/TourDialog.tsx` and its taped card.
- `components/topic/TopicReader.tsx` -- renders `EndPopup` before `ChapterEndScene` for chapters with a check.
- `lib/checkOpen.ts`, `lib/checkBanner.ts`, `CheckRunner.tsx` -- reused as is: `requestCheck`, hash arrival, same-gesture guard.
- `tests/end-popup.test.ts`, `tests/quiz-record.test.ts`, `tests/quiz-store.test.ts`, `e2e/smoke.spec.ts`, `content/architecture/*`, `.cspell/project-words.txt`.

## Tasks & Acceptance

**Execution:**
- [x] `lib/quizRecord.ts`, `lib/quizStore.ts`, record and store tests -- the dismissal field and its transitions
- [x] `lib/endPopup.ts`, `tests/end-popup.test.ts` -- the decision and the observer rule
- [x] `components/check/EndPopup.tsx`, `EndPopupDialog.tsx`, `endPopup.module.css`, `TopicReader.tsx` -- the popup
- [x] `e2e/smoke.spec.ts` -- one flow test
- [x] `content/architecture/*` -- field, popup paragraph, counts

**Acceptance Criteria:**
- Given an unread `/dsa/dsa-binary-search`, when a keyboard user scrolls to the end card and stays, then the popup opens once, Yes opens the check, and after Not yet a reload never shows it again.
- Given the popup, when Escape is pressed, then it closes and focus returns to where it was.
- Given a done chapter, or arrival at `#check`, then no popup opens.
- Given `npm run check`, `npm run build` and the smoke spec, then all pass.

## Implementation Notes

- Implemented directly in this run, not by a separate subagent, as 3.4 was, because this run is itself a delegated subagent.

## Plan Change Log

## Review Triage Log

### 2026-10-12 — Review pass
- verdicts: 7 findings — high 0, medium 1, low 4, false 0, maybe-false 0 (two rows are low reject or defer)
- findings:
  - `[medium]` `[patch]` a fly-by leaving through the top of the viewport armed the dwell timer, so the popup opened below the fold — `reachedEnd` now counts a marker above the viewport only on the observer's first report, with a unit test
  - `[medium]` `[patch]` the reader's plain keys (n, p, t, [, ], /) still fired from behind the dialog and could navigate away — the dialog stops them like the check runner, both now share `PLAIN_KEYS`, and the smoke test presses n
  - `[low]` `[patch]` the command palette is a `role="dialog"` without `aria-modal` and was not counted as another modal — the probe now includes `[role="dialog"]`
  - `[low]` `[patch]` the test-file count in the tech stack chapter was stale at 66 — now 67
  - `[low]` `[patch]` nothing asserted that Yes saves the dismissal — the smoke test now polls the store after Yes
  - `[low]` `[defer]` no reduced-motion branch or test — nothing animates, see deferred
  - `[low]` `[reject]` negative smoke assertions rely on a control reader taking longer than the dwell — the control opens its own popup first, which is the readiness signal, and a later opening would be caught by the next step's focus and URL checks; a clock-mocked rewrite is more complexity than it is worth

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: all green
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build` -- expected: success
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npx playwright test e2e/smoke.spec.ts` -- expected: all passed

## Auto Run Result

**Summary:** A taped, focus-trapped paper dialog asks "Mark this chapter done?" once, after the end card has stayed in view for 800 ms on an unread chapter with a check. Yes opens the check at `#check`; Not yet, Escape and a click outside close it, and every close saves `popupDismissed` on the chapter's record in `groundwork:quiz` so it never returns. It stays shut on a done chapter, on arrival at or while at `#check`, while a question or another dialog is on screen, and before hydration.

**Files changed:** `lib/quizRecord.ts`, `lib/quizStore.ts` (the flag and `recordPopupDismissed`), `lib/endPopup.ts` (decision, observer rule, shared plain keys), `components/check/EndPopup.tsx`, `EndPopupDialog.tsx`, `endPopup.module.css`, `components/check/CheckRunner.tsx` (shared key set), `components/chapter/ChapterKit.tsx` (`data-end-card` attribute), `components/topic/TopicReader.tsx`, `tests/end-popup.test.ts`, `tests/quiz-record.test.ts`, `tests/quiz-store.test.ts`, `e2e/smoke.spec.ts` (1 test), `content/architecture/*` (popup paragraph, key table, CSS module, client file, test counts).

**Review:** quick pass, 7 findings: 5 patched, 1 deferred low, 1 rejected low.

**Follow-up review recommended:** false.

**Verification:** `npm run check` green with 1323 unit tests; `npm run build` ok; `e2e/smoke.spec.ts` 21 of 21, and the popup test passed 5 of 5 across repeated runs. Screenshots at 390, 320 and 1440 in Night and Light, Classic and Roboto, plus keyboard focus on Yes and Not yet, were reviewed; axe on the popup alone is clean in all nine themes at 1440 and 390.

**Residual risks:** a jump straight to the end opens the popup after the dwell, which the entry's unknown allowed; the Next Image and Web Vitals scripts 404 locally as before.
