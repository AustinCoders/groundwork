---
type: epic
title: "Chapter checks and placement"
parent: initiative-dsa-mastery
covers: [CAP-1, CAP-2, CAP-3, CAP-7, CAP-9]
after: []
assignee: ""
risk: high
---

# Chapter checks and placement

## Description

Marking a DSA chapter done asks a short check, as a soft gate. A first-time reader finds their level with a placement, starts from the beginning, or picks a level, and gets a plan; a returning reader can re-check their level. The question model carries the pattern vocabulary the drill and cheat sheet use. The player gains predict-the-next-step, which reuses the check's choice component. A chapter's end card gains a Mark this chapter done? popup and an optional complexity round, and a pass earns two badges.

## Outcome

In the tracer chapter a reader passes or misses a check with explanations, and the state shows everywhere. A first-time reader leaves the placement with a plan and no change to their XP or review queue. This is CAP-1 and CAP-2, the predict part of CAP-3 and the pattern data CAP-7 reads, the end-of-chapter popup and badges of CAP-2, and the complexity round of CAP-9.

## Requirements

- C1 (CAP-2, CAP-7, CAP-9): the question model, the pattern vocabulary with per-chapter pattern records that carry interview-style tags, at least 2 complexity questions in every pool, a per-chapter server loader and lazy import, and integrity tests (quiz-and-placement.md, Question model).
- C2 (CAP-2): the check runner and the `groundwork:quiz` store. Draw 5 of at least 8 and pass at 4. Explanations, unlimited fresh retries, mark done anyway, free unmarking, and read before checks for old marks. A pass goes through `setChapterDone`.
- C3 (CAP-2): checked, not checked, read before checks and tested out show on the rail, the cover and the path.
- C4 (CAP-2): generated trace questions join a chapter's draw.
- C5 (CAP-3): predict-the-next-step in the player.
- C6 (CAP-1): a pure staged, adaptive placement with the credit, early-stop and threshold rules, and the `groundwork:dsa:placement` store. It never writes `jsnotes:progress` or `jsnotes:level`.
- C7 (CAP-1): three doors for first-time readers, Re-check for readers with marks, the placement route, the result screen, the plan in the cover aside, and retake and reset. Continue, Up next and the path's next step follow the plan and skip tested-out chapters (user, 2026-09-30). Nothing is locked: chapters below the reader's level stay open and are listed as Revise earlier.
- C8 (CAP-2): the end-of-chapter popup. It opens once at the end card of a chapter that is not done; Yes opens the check, Not yet dismisses it for that chapter for good in `groundwork:quiz`, and Escape closes it and returns focus. It never opens on a done chapter or when the reader arrived at `#check`.
- C9 (CAP-2): a pass earns XP, streak and activity through `setChapterDone` as a read mark does, and the check adds two badges, First check passed and A level checked, using the site's existing badge mechanism.
- C10 (CAP-9): an optional 2-question complexity round at the end card on a code sample from the chapter. It never blocks mark done, has no pass mark, and the ids of questions answered wrong are saved in the round result for the shaky list (7.7) to read.

## Done when

1. On `/dsa/dsa-binary-search`, a keyboard user passes, misses and marks-anyway as the spec describes, and each state shows on the rail and the path.
2. A reader with old DSA marks sees them still done, as read before checks, with XP and review unchanged.
3. A first-time reader takes the placement with no timer, in at most 18 questions, and gets a level and a plan. `jsnotes:progress` and `jsnotes:level` are byte-identical before and after.
4. The placement, store, loader and integrity unit tests pass.
5. The end-of-chapter popup opens once on a not-done chapter, Yes opens the check, Not yet never returns, and Escape returns focus. The complexity round is optional, and a pass earns the two badges.
6. axe passes on the check, the popup, the placement and the result screen in all nine themes.
7. Built one story at a time on `feature/dsa-rebuild` with `npm run check`, `npm run build` and `npm run test:e2e` green after each; it reaches production only through the release merge (7.6).

## Boundaries

This epic covers the check, the placement, the stores, the pattern data model and predict mode. Pools for chapters other than binary search, each with at least 2 complexity questions, belong to the level epics. Puzzles belong to epic-dsa-play-engine, and the shaky list display on Review to epic-dsa-aids-release. Review questions, the drill and the cheat sheet belong to epic-dsa-aids-release. The copy says "checked", never "verified".

## References

- spec — _bmad-output/specs/spec-dsa-mastery/SPEC.md, CAP-1, CAP-2, CAP-3, CAP-7, CAP-9 and Constraints
- design — _bmad-output/specs/spec-dsa-mastery/quiz-and-placement.md
- analysis — _bmad-output/planning-artifacts/dsa-analysis-2026-09-30/code-and-ux.md §2, §4, §8.1–§8.3; research.md §1, §2

## Notes

- Decision (agent, 2026-09-30): entries 1 and 2 together are the tracer. Entry 1 is the data layer and entry 2 the first end-to-end check, split so each fits a session.
- Decision (user, 2026-09-30): readers with DSA marks get Re-check my level, which never changes their marks.
- Decision (agent, 2026-09-30): the placement reads placement-tagged questions from the chapter pools and grows as the level epics add them.
- Decision (agent, 2026-09-30): any entry that adds a route, a page to the smoke or a11y suites, a CSS module, a storage key or a stated count updates the How this is built chapter that states it, in the same entry (spec Constraints; tests/claims.test.ts).
- Waits on epic-dsa-frame because: the stub Check island and completion policy come from 1.3, and prerequisites and `Topic.completion` come from 1.2.
- Waits on epic-dsa-play-engine because: generated questions need 2.1's tracer model, and predict mode needs the finished Player from 2.6.
- Waits on initiative-groundwork-overhaul epic-topic-redesign because: the user chose topic redesign first (2026-09-30). The topic frame, reader, cover, level, path and outline layout this epic builds on come from its entries 1, 3, 4, 5, 7 and 8, and the nine-theme axe harness comes from epic-audit-fixes entry 3.
- Decision (2026-10-06): added entries 9 (popup), 10 (complexity round) and 11 (badges) before the sweep, which now also waits on them, because the spec's CAP-2 gained the popup and badges and CAP-9 is new. Entry 4 needs no hook: the popup reads the done state through the completion policy.
- Decision (2026-10-06): entry 1 now carries interview-style tags in the pattern record and at least 2 complexity questions per pool, because the revision list (CAP-10) and the complexity round read them; puzzle and round data stay lazy per chapter so a chapter page still gets only its own data.
- Decision (2026-10-06): entry 7's plan and result screen list chapters below the reader's level under Revise earlier and lock nothing, because CAP-1 gained that line.
- Decision (2026-10-06): requirements C8 to C10 added and covers gains CAP-9; the other-language code toggle is an open question and is not built here.
- Decision (2026-10-06): entry 10 saves wrong-answer ids in the round result instead of writing the shaky list itself, because 7.7 builds the shaky list and runs after 3.10; the spec's wrong answer goes to the shaky list is met once 7.7 lands.
- Decision (2026-10-06): entry 2 builds both the ChoiceList and an OrderList, because the check's `order` question kind needs a renderer and the puzzle entry (2.8) reuses both; entry 2 also keeps the ids of missed questions in groundwork:quiz, which 7.7's shaky list reads.
- Decision (2026-10-06): entry 10 now follows entry 9, because both edit the chapter end card and must not be built in parallel.
- Decision (2026-10-06): the shaky list is derived, not written by each source: checks (3.2's missed ids), the complexity round (3.10's round result) and review (7.1's review result) each save their own wrong-answer ids in groundwork:quiz, and 7.7 reads all three, so no entry refers to a store that a later entry builds.
