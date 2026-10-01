---
title: 'One interview-question count'
type: 'bugfix'
ticket: '8'
created: '2026-10-01'
status: 'built'
route: 'oneshot'
route_source: 'auto'
review: 'quick'
review_source: 'auto'
lenses_ran: []
review_loop_iteration: 0
followup_review_recommended: false
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/planning-artifacts/audit-2026-09-28/seo-content-roadmap.md']
warnings: []
deferred: []
baseline_revision: 'fa7d388139de68c0e32bd9f415283cc46ee2334e'
---

<intent-contract>

## Intent

**Problem:** The site states three different interview-question counts: the home page and `arch-overview.ts` say "420" (every `<li>` inside a rapid-fire answer counted as its own question, via `INTERVIEW_TOTAL_QUESTIONS`), while the question bank says "209" (`bankQuestions().length`, which excludes rapid-fire items since they are not individually drillable flashcards). A reader who clicks from "420+ questions" to the bank sees a smaller, unexplained number. The user has chosen 420 (with drills counted) as the one count the site leads with.

**Approach:** Investigation found the home page and `arch-overview.ts` already derive their figure from `INTERVIEW_TOTAL_QUESTIONS` (both already compute to 420 today, and `arch-overview.ts`'s row is already asserted in `tests/claims.test.ts`) — so the only real gap is the question bank, which states its own true 209-item count with no link back to the 420 total. Fix the bank's wording so both numbers appear together and their relationship is explicit and derived, not hand-typed.

## Boundaries & Constraints

**Always:**
- `INTERVIEW_TOTAL_QUESTIONS` (`lib/interviewContent.ts`, already exported, already 420) stays the one source of truth; no second count constant is introduced.
- `app/interview/questions/QuestionBank.tsx`'s opening sentence states both the bank's own drillable count (`questions.length`, currently 209) and the full 420 total, with the difference between them computed from the same two values, not a separate literal number.
- A new `tests/claims.test.ts` case asserts the bank's exact wording, derived the same way the component computes it, so the two numbers can never drift apart silently.
- No comments.

**Never:**
- Do not change what `INTERVIEW_TOTAL_QUESTIONS` counts, or add a drill mode for rapid-fire items; CAP-6 asks for one true count stated consistently, not a product change.
- Do not touch `docs/ROADMAP.md`'s interview figures (it currently says 230, which matches neither 209, 245 nor 420, and reconciling it needs its own investigation outside this ticket's three named surfaces: the home page, the question bank and `arch-overview.ts`).
- Do not touch the home page or `arch-overview.ts` beyond confirming they already use `INTERVIEW_TOTAL_QUESTIONS` — they need no code change.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Home page | Rendered | Shows `INTERVIEW_TOTAL_QUESTIONS` (420) with a `+`, already the case | No error expected |
| `arch-overview.ts` | Read | States `420 across 27 rounds`, already asserted by `tests/claims.test.ts` | Test fails if it drifts |
| Question bank | Rendered | States 209 answered in depth, 211 more as rapid-fire, 420 in all — all three numbers consistent with each other and with `INTERVIEW_TOTAL_QUESTIONS` | `tests/claims.test.ts` fails if the stated numbers stop matching the derivation |

</intent-contract>

## Code Map

- `lib/interviewContent.ts`: `INTERVIEW_TOTAL_QUESTIONS` (already exported, computes every rapid-fire `<li>` as its own question; equals 420 today) and `INTERVIEW_TOTAL_ROUNDS` (27).
- `app/page.tsx:3,39`: already passes `{ rounds: INTERVIEW_TOTAL_ROUNDS, questions: INTERVIEW_TOTAL_QUESTIONS }` into `HomeView`. `app/HomeView.tsx:865,930,1049`: already renders `{interview.questions}+` in three places. No change needed; confirmed by reading, not assumed.
- `content/architecture/arch-overview.ts:52`: `<tr><td>Interview questions</td><td>420 across 27 rounds</td></tr>` — a literal string, but `tests/claims.test.ts:64` already asserts `` `<tr><td>Interview questions</td><td>${INTERVIEW_TOTAL_QUESTIONS} across ${INTERVIEW_TOTAL_ROUNDS} rounds</td></tr>` ``, which is passing today. No change needed.
- `lib/interviewBook.ts` `bankQuestions()`: filters out `q.bulk` questions, so its length (209 today) is a genuinely different, correct count — the number of individually drillable flashcards, not a wrong figure.
- `app/interview/questions/QuestionBank.tsx:217-218`: the sentence to change: `{questions.length} questions from every round. Search them, filter them, or drill them as flashcards: read the question, say your answer out loud, reveal, and mark yourself honestly.` `questions` here is the full `BankQuestion[]` prop (209 items), not the filtered `list`. Import `INTERVIEW_TOTAL_QUESTIONS` from `@/lib/interviewContent` and compute the rapid-fire remainder as `INTERVIEW_TOTAL_QUESTIONS - questions.length`.
- `tests/claims.test.ts`: follow the existing `cases`/`it.each` pattern (the `arch-overview.ts` case at line 64 is the closest precedent). Add one case for `app/interview/questions/QuestionBank.tsx` asserting the new sentence, built from `INTERVIEW_TOTAL_QUESTIONS` and a bank count computed the same way `bankQuestions()` does (or import `bankQuestions` directly, as `tests/seo.test.ts` already imports library functions like this).

## Tasks & Acceptance

**Execution:**
- [ ] `app/interview/questions/QuestionBank.tsx` -- state both the bank's own count and the 420 total, derived -- C2
- [ ] `tests/claims.test.ts` -- a case guarding the new sentence -- guard

**Acceptance Criteria:**
- Given the question bank page, when it renders, then its lead sentence states 209, 211 and 420 (today's values), each consistent with `INTERVIEW_TOTAL_QUESTIONS` and `bankQuestions().length`.
- Given `npm run check`, when it runs, then `tests/claims.test.ts` passes with the new case.

## Implementation Notes

## Plan Change Log

## Review Triage Log

### 2026-10-01 — Review pass
- verdicts: 2 findings — high 0, medium 1, low 1, false 0, maybe-false 0
- findings:
  - `[medium]` `[patch]` 17 of the new sentence's 211-item remainder are the three prep-guide rounds (the scouting report, the ₹50L-bar guide and the week-before plan), excluded from the bank because the whole round is flagged a guide, not because their content is rapid-fire — calling all 211 "rapid-fire" mischaracterised them. Verified live: `GUIDES = new Set(["scout", "s0", "plan"])` in `lib/interviewBook.ts:77` marks every question in those three rounds `bulk: true` regardless of its shape; their actual content ("Attack N" entries with full test/answer/follow-up fields) is narrative, not bullet lists. Reworded to "rapid-fire follow-ups and prep guides", which covers both buckets truthfully.
  - `[low]` `[patch]` "answered in depth from every round" is false: only 24 of 27 rounds contribute to the 209-item bank (`scout`, `s0` and `plan` contribute zero, confirmed live). This phrase predates this story, but the sentence it sits in is exactly what this story rewrote, in a ticket whose purpose is fixing misleading question-count copy, so it was fixed alongside the medium finding above rather than left in place. Grouped with the same edit.

## Design Notes

The home page and `arch-overview.ts` needed no change: both already derive from `INTERVIEW_TOTAL_QUESTIONS`, and the architecture chapter's figure is already guarded by an existing claims-test case. The only real gap was the question bank stating a true but unexplained smaller number with nothing tying it to the headline figure — which is exactly what left a reader who "clicks from 420+ and lands on 209" (the ticket's own framing of the bug). `docs/ROADMAP.md`'s "230" is left alone: it matches none of the three counts this ticket investigates (209, 245, 420) and reconciling it is a separate investigation outside the three surfaces this ticket names.

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: pass.

## Auto Run Result

**Summary:** Investigation found the home page and `arch-overview.ts` already derived their "420" from `INTERVIEW_TOTAL_QUESTIONS`, with the architecture chapter's figure already guarded by an existing claims-test case — the real gap was only the question bank, which stated its own true 209-item count with nothing tying it to the site's 420 headline. The bank's lead sentence now states both numbers and their derived difference, and no longer misdescribes what that difference contains.

**Files changed:**
- `app/interview/questions/QuestionBank.tsx`: imports `INTERVIEW_TOTAL_QUESTIONS`; its lead sentence states 209 answered in depth, 211 more as rapid-fire follow-ups and prep guides, 420 in all.
- `tests/claims.test.ts`: a new case asserting the bank's drillable count stays smaller than the total, and that the sentence's derivation expression is still wired in (not a hand-typed number).
- `.cspell/project-words.txt`: `drillable` appended.

**Review findings:** 2 findings (medium 1, low 1), both patched together: the remainder was mischaracterised as entirely "rapid-fire" (17 of 211 are prep-guide content, not bullet lists), and "from every round" was false (3 of 27 rounds contribute nothing to the bank). The sentence now says "rapid-fire follow-ups and prep guides" and drops the "every round" claim.

**Verification:** `npm run check` passes (19 files, 321 unit tests).

**Residual risks:** `docs/ROADMAP.md` still states 230 interview questions, matching none of 209/245/420; left alone, as scoped in Design Notes — it names none of this ticket's three surfaces (the home page, the question bank, `arch-overview.ts`).
