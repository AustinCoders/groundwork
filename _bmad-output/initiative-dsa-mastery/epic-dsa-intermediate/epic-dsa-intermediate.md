---
type: epic
title: "Intermediate chapters, complete"
parent: initiative-dsa-mastery
covers: [CAP-2, CAP-3, CAP-5, CAP-6, CAP-7, CAP-8, CAP-9, CAP-10]
after: []
assignee: ""
risk: high
---

# Intermediate chapters, complete

## Description

The 19 intermediate chapters (I1–I19 in `curriculum.md`) are finished to one standard. Each is written or deepened to the depth bar, with a why-it-works box and a common-mistakes box, a question pool and pattern record, and a player for how it works inside. The new chapters are I2 BST operations, I6 BFS on grids, I12 DP state machines and I19 math. The errors fixed here are I10's fib(5) colouring and the shift() queues in I1, I5 and I7.

## Outcome

A reader at the intermediate level can read, play and check every chapter in their plan. The intermediate part of the spec's success signal holds: every chapter has a player, a puzzle and a pool of at least 8 that holds at least 2 complexity questions.

## Requirements

- R1 (CAP-6): every intermediate chapter meets the depth bar in `curriculum.md`, teaches the techniques its exercises need, and has an exercise at or below its level. New chapters are written and get exercises by moving the ones that fit and writing new ones where none exist (user, 2026-09-30).
- R2 (CAP-5): the intermediate errors in `curriculum.md`'s "Errors to fix" are fixed.
- R3 (CAP-2, CAP-7): every chapter has a pool of at least 8 auto-gradable questions, with at least 2 tagged for placement and at least one authored trace question. Recognise questions are tagged by pattern, distractors come from the common-mistakes box, and the chapter has one pattern record.
- R4 (CAP-3): every chapter embeds the players `play-catalog.md` lists for it, each with a tested tracer, presets, a parser and an input limit.
- R5 (CAP-7): every chapter has a why-it-works box and a common-mistakes box.
- R6 (CAP-6): a chapter's code, its player's code and its dry-run tables agree. A test compares each tracer's code with the chapter code block it names.
- R7 (CAP-8): every chapter has at least one puzzle, order-the-steps or pick-the-next-step, built from its tracer and registered in the play registry, whose data loads lazily with the tracer.
- R8 (CAP-9): every chapter's pool holds at least 2 questions with skill complexity, on a code sample from the chapter, for the end-of-chapter round.
- R9 (CAP-10): every chapter's pattern record carries interview-style tags (online assessment, phone screen, onsite round) and names no company.

## Done when

1. The curriculum test's allow-list holds no intermediate chapter.
2. The pool integrity test shows every intermediate chapter with at least 8 questions, 2 placement-tagged, one authored trace question and a pattern record.
3. The player registry lists a tracer for every intermediate chapter, and every tracer and code-match test passes.
4. On /dsa/dsa-dp-1d, a keyboard user plays the player, solves its puzzle, passes the check and sees the chapter marked read.
5. The pool integrity test shows every intermediate chapter with a registered puzzle, at least 2 complexity questions and interview-style tags in its pattern record.
6. Built one story at a time on `feature/dsa-rebuild` with `npm run check`, `npm run build` and `npm run test:e2e` green after each; it reaches production only through the release merge (7.6).

## Boundaries

This epic covers the intermediate chapters' content, pools, pattern records and tracers. The player, check and placement machinery belong to epic-dsa-play-engine and epic-dsa-checks. Chapter ids never change. Optional depth beyond `curriculum.md` is a spec non-goal.

## References

- spec — _bmad-output/specs/spec-dsa-mastery/SPEC.md, CAP-2, CAP-3, CAP-5, CAP-6, CAP-7
- design — _bmad-output/specs/spec-dsa-mastery/curriculum.md, play-catalog.md (Players), quiz-and-placement.md (Question model)
- analysis — _bmad-output/planning-artifacts/dsa-analysis-2026-09-30/content.md §2–§4, §7
- model chapter — content/dsa/dsa-advanced-graph-algorithms.ts, the depth and arc the others are raised to

## Notes

- Decision (agent, 2026-09-30): each entry is a pack of one or two chapters. A pack writes the prose, boxes, pool, pattern record and tracers together, so the distractors match the mistakes box and the player's code matches the prose. Packs that were too big for one session were split during validation.
- Decision (agent, 2026-09-30): there is no tracer here, because epics 2 and 3 prove the machinery. Packs mostly follow chapter order, grouping related chapters. Entry 7 carries the most risk.
- Decision (user, 2026-09-30): packs run one after another on `feature/dsa-rebuild`. Each adds a line to the shared player registry and question index and shrinks the shared curriculum allow-list, so each waits on the one before.
- Decision (agent, 2026-09-30): any entry that adds a route, a page to the smoke or a11y suites, a CSS module, a storage key or a stated count updates the How this is built chapter that states it, in the same entry (spec Constraints; tests/claims.test.ts).
- Waits on epic-dsa-play-engine because: packs need every view and the ported tracers (through 2.6, which follows them) and the presets, parsers and input UI (2.6).
- Waits on epic-dsa-checks because: pools follow 3.1's question model and pattern vocabulary, and each walk passes 3.2's check.
- Waits on epic-dsa-beginner because: entry 1 follows the beginner sweep (4.8) for the shared registry, index, allow-list and counts.
- Waits on initiative-groundwork-overhaul epic-topic-redesign because: the user chose topic redesign first (2026-09-30). The topic frame, reader, cover, level, path and outline layout this epic builds on come from its entries 1, 3, 4, 5, 7 and 8, and the nine-theme axe harness comes from epic-audit-fixes entry 3.
- Decision (2026-10-06): the spec grew puzzles (CAP-8), the complexity round (CAP-9) and the revision list (CAP-10), so every chapter-content entry (1 to 11) now also registers one puzzle, adds 2 complexity questions and tags interview styles (R7, R8, R9), and the sweep checks none is missing. The machinery lives in epic-dsa-play-engine (2.8) and epic-dsa-checks (3.9 to 3.11); this epic supplies per-chapter content only.
- Decision (2026-10-06): no new after entries were added; the puzzle (2.8), popup (3.9), round (3.10) and badge (3.11) machinery is reached through entry 1's wait on 4.8 and the epic-level waits above.
