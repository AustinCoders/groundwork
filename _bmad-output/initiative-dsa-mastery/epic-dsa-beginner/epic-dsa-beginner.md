---
type: epic
title: "Beginner chapters, complete"
parent: initiative-dsa-mastery
covers: [CAP-2, CAP-3, CAP-5, CAP-6, CAP-7, CAP-8, CAP-9, CAP-10, CAP-11]
after: []
assignee: ""
risk: high
---

# Beginner chapters, complete

## Description

The 12 beginner chapters (B1–B12 in `curriculum.md`) are finished to one standard. Each is written or deepened to the depth bar, with a why-it-works box and a common-mistakes box, a question pool and pattern record, and a player for how it works inside, a puzzle, and a complexity round of two questions. The new chapters are B2 the JavaScript toolkit and B4 prefix sums. The errors fixed here are B1's O and Ω, and B9's fib(4) diagram, stack drawing and explicit-stack conversion. B11 becomes the head-index queue the intermediate chapters switch to.

## Outcome

A reader at the beginner level can read, play and check every chapter in their plan. The beginner part of the spec's success signal holds: every chapter has a player, a puzzle and a pool of at least 8 that holds at least 2 complexity questions.

## Requirements

- R1 (CAP-6): every beginner chapter meets the depth bar in `curriculum.md`, teaches the techniques its exercises need, and has an exercise at or below its level. New chapters are written and get exercises by moving the ones that fit and writing new ones where none exist (user, 2026-09-30).
- R2 (CAP-5): the beginner errors in `curriculum.md`'s "Errors to fix" are fixed.
- R3 (CAP-2, CAP-7): every chapter has a pool of at least 8 auto-gradable questions, with at least 2 tagged for placement and at least one authored trace question. Recognise questions are tagged by pattern, distractors come from the common-mistakes box, and the chapter has one pattern record.
- R4 (CAP-3): every chapter embeds the players `play-catalog.md` lists for it, each with a tested tracer, presets, a parser and an input limit.
- R5 (CAP-7): every chapter has a why-it-works box and a common-mistakes box.
- R6 (CAP-6): a chapter's code, its player's code and its dry-run tables agree. A test compares each tracer's code with the chapter code block it names.
- R7 (CAP-8): every chapter has at least one puzzle, order-the-steps or pick-the-next-step, built from its tracer and registered in the play registry beside its player.
- R8 (CAP-9): every chapter's pool holds at least 2 complexity questions (skill complexity) on a code sample from the chapter, which the end card's round draws on.
- R9 (CAP-10): every chapter's pattern record carries interview-style tags (online assessment, phone screen, onsite round) for the revision list; no company names.
- R10 (CAP-11): every code block in a beginner chapter is a data-code placeholder with Python, Java and C++ translations beside the JavaScript in `content/dsa/code/<chapter-id>.ts`, and every tracer of the chapter declares its code by stable line ids with a map to each of the four languages (`code-languages.md`). Exercises, their starter code and the Playground stay JavaScript.

## Done when

1. The curriculum test's allow-list holds no beginner chapter.
2. The pool integrity test shows every beginner chapter with at least 8 questions, 2 placement-tagged, one authored trace question and a pattern record.
3. The player registry lists a tracer for every beginner chapter, and every tracer and code-match test passes.
4. On /dsa/dsa-basic-recursion, a keyboard user plays the player, solves its puzzle, passes the check and sees the chapter marked read.
5. Every beginner chapter has a registered puzzle, at least 2 complexity questions in its pool and interview-style tags in its pattern record, and the pool integrity test shows it.
6. Every beginner chapter's code blocks and tracers exist in JavaScript, Python, Java and C++, and the language completeness and syntax tests pass for them.
7. Built one story at a time on `feature/dsa-rebuild` with `npm run check`, `npm run build` and `npm run test:e2e` green after each; it reaches production only through the release merge (7.6).

## Boundaries

This epic covers the beginner chapters' content, pools, pattern records and tracers. The player, check and placement machinery belong to epic-dsa-play-engine and epic-dsa-checks. Chapter ids never change. Optional depth beyond `curriculum.md` is a spec non-goal.

## References

- spec — _bmad-output/specs/spec-dsa-mastery/SPEC.md, CAP-2, CAP-3, CAP-5, CAP-6, CAP-7, CAP-8, CAP-9, CAP-10, CAP-11
- design — _bmad-output/specs/spec-dsa-mastery/curriculum.md, play-catalog.md (Players), quiz-and-placement.md (Question model)
- analysis — _bmad-output/planning-artifacts/dsa-analysis-2026-09-30/content.md §2–§4, §7
- model chapter — content/dsa/dsa-advanced-graph-algorithms.ts, the depth and arc the others are raised to

## Notes

- Decision (agent, 2026-09-30): each entry is a pack of one or two chapters. A pack writes the prose, boxes, pool, pattern record and tracers together, so the distractors match the mistakes box and the player's code matches the prose. Packs that were too big for one session were split during validation.
- Decision (agent, 2026-09-30): there is no tracer here, because epics 2 and 3 prove the machinery. Packs mostly follow chapter order, grouping related chapters. Entry 5 carries the most risk.
- Decision (user, 2026-09-30): packs run one after another on `feature/dsa-rebuild`. Each adds a line to the shared player registry and question index and shrinks the shared curriculum allow-list, so each waits on the one before.
- Decision (agent, 2026-09-30): any entry that adds a route, a page to the smoke or a11y suites, a CSS module, a storage key or a stated count updates the How this is built chapter that states it, in the same entry (spec Constraints; tests/claims.test.ts).
- Decision (2026-10-06): the spec gained CAP-8 puzzles, CAP-9 complexity round and CAP-10 revision list, so every chapter-content entry also delivers one puzzle, two complexity questions and style tags (new R7, R8, R9), and the sweep checks none is missing. Why: puzzles and the round are per chapter, and the content packs are where each chapter's tracer, pool and pattern record are written. The puzzle engine is 2.8, the round is 3.10 and the revision list is 7.8; this epic supplies only the per-chapter data.
- Decision (2026-10-07): the spec gained CAP-11 code languages, so every chapter-content entry also delivers its code blocks as data-code placeholders with Python, Java and C++ translations and its tracers' code in all four languages (new R10), and the sweep checks none is missing. Why: the chapter code and tracers are written in these packs, and the switch, store, loader and tests come from 1.6 and 2.9. Exercises, starter code and the Playground are out of scope.
- Waits on epic-dsa-play-engine because: packs need every view and the ported tracers (through 2.6, which follows them) and the presets, parsers and input UI (2.6).
- Waits on epic-dsa-checks because: pools follow 3.1's question model and pattern vocabulary, and each walk passes 3.2's check.
- Waits on initiative-groundwork-overhaul epic-topic-redesign because: the user chose topic redesign first (2026-09-30). The topic frame, reader, cover, level, path and outline layout this epic builds on come from its entries 1, 3, 4, 5, 7 and 8, and the nine-theme axe harness comes from epic-audit-fixes entry 3.
