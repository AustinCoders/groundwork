# Checks, placement and review

This file is the source for CAP-1, CAP-2 and CAP-7 (review and the pattern drill). The evidence behind it:
- `_bmad-output/planning-artifacts/dsa-analysis-2026-09-30/code-and-ux.md` §2, §4, §8.1–§8.3;
- `research.md` §1, §2 and §6.

## Question model

- **Where questions live.** Each chapter has its own file, `content/dsa/quiz/<chapter-id>.ts`. The placement draws from these pools, using the questions tagged `placement` (at least 2 per chapter). `content/dsa/placement.ts` holds only the routing: stages, sizes and thresholds. Shared types sit in `content/quiz-types.ts`. None of this goes on `Chapter`. A server loader passes a chapter page only that chapter's questions.
- **Each question has:**
  - a stable id;
  - its chapter;
  - its level;
  - a kind: `single`, `multi`, `order` or `predict`;
  - a prompt, which may include a code sample;
  - 3–5 choices;
  - the answer;
  - an explanation for every choice;
  - a skill: `recognise`, `complexity`, `trace` or `edge-case`;
  - a link to the chapter section that teaches it;
  - an optional `placement` tag;
  - the pattern it tests, from a fixed vocabulary. Each chapter adds one pattern record (signals, template, complexity) beside its pool; the drill and the cheat sheet read these records.
- **Distractors** come from the chapter's common-mistakes box, so a wrong answer teaches the misconception.
- **Generated trace questions.** A chapter's tracer can produce "state after step k" and "what happens next" questions from a preset input. These extend the authored pool without repeating it.
- **Integrity tests.** Every chapter has a pool. Answers are among the choices. Ids are unique. Every chapter referenced exists. Explanations are never empty. HTML is balanced.

## Chapter check (CAP-2)

- **Pool and draw.** The pool holds at least 8 authored questions plus the generated trace questions. A check draws 5, shuffled, with at least one `trace` and at least one `recognise` or `complexity` question. It passes at 4 of 5.
- **One question at a time.** Each is a fieldset with a legend, using native radio buttons or checkboxes. The reader chooses, presses Check, reads the explanation, then goes to the next question. Feedback is announced through `aria-live`. Keys work only while focus is inside the check.
- **Outcomes:**
  - **Pass:** the chapter is marked read through `setChapterDone`, and the reader sees confetti, the score and a note that it comes back for review in 3 days.
  - **Miss:** the reader sees every explanation and a link to each section. Retry draws fresh questions. Retries are unlimited and have no cooldown.
  - **Mark done anyway:** the chapter is marked read and recorded as not checked. The plan and the review page show "not checked".
- **Existing read marks** stay done. They display as "read before checks" and offer an optional "Check yourself".
- **Where the check appears:**
  - the chapter's end card, reachable at `#check`;
  - the cover, plan and `/path?topic=dsa` ticks, which link to `/dsa/<id>#check`.

## Placement (CAP-1)

- **First visit.** When there is no DSA placement and no `dsa-*` mark, `/dsa` and `/level/dsa` show three doors:
  - start from the beginning;
  - find my level (about 10 minutes);
  - I'll pick a level.
- **Readers with DSA marks** see a "Re-check my level" link on the cover. It runs the same placement and never changes their marks.
- **Deep links are never redirected.**
- **The test itself:**
  - It is multistage. About 6 routing questions on beginner fundamentals come first. The reader then gets either more beginner questions or an intermediate module. Only a reader who clears intermediate goes on to the advanced module.
  - There are at most 18 questions and no timer.
  - Every question has a "not sure yet" choice.
  - A stage ends after 3 misses or "not sure" answers in a row.
- **Credit:**
  - A chapter is tested out after 2 correct answers on it, with no missed prerequisite.
  - The level is the highest stage cleared, using the mock's thresholds: raise at 0.8, lower below 0.45.
  - Allotted chapters are every chapter at or above the level, plus the lower chapters the reader missed. They are ordered by prerequisites.
- **Result screen:**
  - It shows the level, the allotted chapters and the tested-out chapters. It never shows a raw score.
  - It offers Continue to the first allotted chapter, retake, and reset to the beginning.
  - After a placement, the cover's Continue, Up next and the path's next step follow the plan and skip tested-out chapters (user, 2026-09-30).
- **Storage:**
  - Placement is stored in its own versioned key, `groundwork:dsa:placement`, holding mode, level, scores per stage, tested-out chapters, allotted chapters and the time taken.
  - It never writes `jsnotes:progress` and never sets `jsnotes:level`.
  - Tested-out chapters count as covered on the plan, but earn no XP and get no review entry.

## Stores

- **`groundwork:quiz`** (versioned) records, for each chapter:
  - attempts;
  - the best score;
  - the last attempt time;
  - the pass time, or null;
  - whether it was marked without a pass;
  - the question ids missed.
- **The read mark** stays in `jsnotes:progress`.
- **Reactivity.** Both stores are `useSyncExternalStore` stores with a snapshot cache and cross-tab events, following `lib/interviewConfidence.ts`.
- **"How this is built"** (`arch-state.ts`) lists the new keys.

## Review and the pattern drill (CAP-7)

- **Review.** When a DSA chapter is due in `/review`, the reader answers 2 of its check questions instead of self-rating.
  - Both right: the chapter advances to the next gap.
  - One right: it stays at the same gap.
  - Both wrong: it steps back one gap.
  
  The gaps stay 3, 7, 21, 60 and 180 days. A DSA chapter's gap lives in `groundwork:quiz`, so the review count in `jsnotes:progress` only grows and XP never falls (user, 2026-09-30). Other topics keep self-rating.
- **Which-pattern drill.** The drill uses the problem statements tagged by pattern in the placement and check banks. It mixes statements from the reader's done chapters, and the reader picks the pattern.
- **Cheat sheet.** One page lists every pattern with its signals, its template and its complexity. It links each pattern to its chapter and player.
