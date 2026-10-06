---
type: epic
title: "Advanced chapters, complete"
parent: initiative-dsa-mastery
covers: [CAP-2, CAP-3, CAP-5, CAP-6, CAP-7, CAP-8, CAP-9, CAP-10]
after: []
assignee: ""
risk: high
---

# Advanced chapters, complete

## Description

The 11 advanced chapters (A1–A11 in `curriculum.md`) are finished to one standard. Each is written or deepened to the depth bar, with a why-it-works box and a common-mistakes box, a question pool and pattern record, and a player for how it works inside. The new chapters are A5 advanced graphs and A7 sparse tables. No advanced error is left to fix here: 1.2 drops the syllabus promises and 1.4 fixes A8's NUL, and A1, A3 and A11 point to where the dropped topics live.

## Outcome

A reader at the advanced level can read, play and check every chapter in their plan. The advanced part of the spec's success signal holds: every chapter has a player and a pool of at least 8.

## Requirements

- R1 (CAP-6): every advanced chapter meets the depth bar in `curriculum.md`, teaches the techniques its exercises need, and has an exercise at or below its level. New chapters are written and get exercises by moving the ones that fit and writing new ones where none exist (user, 2026-09-30).
- R2 (CAP-5): A1, A3 and A11 point to where the topics dropped from their syllabus now live (I12, I8, and the mock interview and interview book). The syllabus lines themselves are dropped in 1.2, and A8's NUL is fixed in 1.4.
- R3 (CAP-2, CAP-7): every chapter has a pool of at least 8 auto-gradable questions, with at least 2 tagged for placement and at least one authored trace question. Recognise questions are tagged by pattern, distractors come from the common-mistakes box, and the chapter has one pattern record.
- R4 (CAP-3): every chapter embeds the players `play-catalog.md` lists for it, each with a tested tracer, presets, a parser and an input limit.
- R5 (CAP-7): every chapter has a why-it-works box and a common-mistakes box.
- R6 (CAP-6): a chapter's code, its player's code and its dry-run tables agree. A test compares each tracer's code with the chapter code block it names.
- R7 (CAP-8): every advanced chapter has at least one puzzle (order the steps or pick the next step) built from its tracer and registered in the play registry, with its data loaded lazily with the tracer.
- R8 (CAP-9): every advanced chapter's pool holds at least 2 questions with skill complexity, written on a code sample from the chapter, for the end-card complexity round.
- R9 (CAP-10): every advanced chapter's pattern record carries interview-style tags (online assessment, phone screen, onsite round) for the revision list, and names no company.

## Done when

1. The curriculum test's allow-list holds no advanced chapter.
2. The pool integrity test shows every advanced chapter with at least 8 questions, 2 placement-tagged, one authored trace question and a pattern record.
3. The player registry lists a tracer for every advanced chapter, and every tracer and code-match test passes.
4. On /dsa/dsa-graph-structure, a keyboard user plays the player, passes the check and sees the chapter marked read.
5. Every advanced chapter has a registered puzzle, at least 2 complexity questions in its pool and style tags in its pattern record, and the pool integrity test and the puzzle registry test show it.
6. Built one story at a time on `feature/dsa-rebuild` with `npm run check`, `npm run build` and `npm run test:e2e` green after each; it reaches production only through the release merge (7.6).

## Boundaries

This epic covers the advanced chapters' content, pools, pattern records and tracers. The player, check and placement machinery belong to epic-dsa-play-engine and epic-dsa-checks. Chapter ids never change. Optional depth beyond `curriculum.md` is a spec non-goal.

## References

- spec — _bmad-output/specs/spec-dsa-mastery/SPEC.md, CAP-2, CAP-3, CAP-5, CAP-6, CAP-7, CAP-8, CAP-9, CAP-10
- design — _bmad-output/specs/spec-dsa-mastery/curriculum.md, play-catalog.md (Players), quiz-and-placement.md (Question model)
- analysis — _bmad-output/planning-artifacts/dsa-analysis-2026-09-30/content.md §2–§4, §7
- model chapter — content/dsa/dsa-advanced-graph-algorithms.ts, the depth and arc the others are raised to

## Notes

- Decision (agent, 2026-09-30): each entry is a pack of one or two chapters. A pack writes the prose, boxes, pool, pattern record and tracers together, so the distractors match the mistakes box and the player's code matches the prose. Packs that were too big for one session were split during validation.
- Decision (agent, 2026-09-30): there is no tracer here, because epics 2 and 3 prove the machinery. Packs mostly follow chapter order, grouping related chapters. Entry 4 carries the most risk.
- Decision (user, 2026-09-30): packs run one after another on `feature/dsa-rebuild`. Each adds a line to the shared player registry and question index and shrinks the shared curriculum allow-list, so each waits on the one before.
- Decision (agent, 2026-09-30): any entry that adds a route, a page to the smoke or a11y suites, a CSS module, a storage key or a stated count updates the How this is built chapter that states it, in the same entry (spec Constraints; tests/claims.test.ts).
- Waits on epic-dsa-play-engine because: packs need every view and the ported tracers (through 2.6, which follows them) and the presets, parsers and input UI (2.6).
- Waits on epic-dsa-checks because: pools follow 3.1's question model and pattern vocabulary, and each walk passes 3.2's check.
- Waits on epic-dsa-intermediate because: entry 1 follows the intermediate sweep (5.12) for the same shared files.
- Waits on initiative-groundwork-overhaul epic-topic-redesign because: the user chose topic redesign first (2026-09-30). The topic frame, reader, cover, level, path and outline layout this epic builds on come from its entries 1, 3, 4, 5, 7 and 8, and the nine-theme axe harness comes from epic-audit-fixes entry 3.
- Decision (2026-10-06): the spec gained puzzles (CAP-8), the complexity round (CAP-9) and style tags for the revision list (CAP-10), so every chapter-content entry now also registers one puzzle, adds at least 2 complexity questions and style-tags its pattern record. Added R7, R8 and R9 and covered them from entries 1 to 7; ids, titles and after are unchanged.
- Decision (2026-10-06): the Refactor sweep (8) covers R7 to R9 and its verify checks that no chapter lacks a puzzle or two complexity questions.
- Decision (2026-10-06, owner to confirm): A11 interview strategy has no algorithm, but it has a constraints-to-approach tracer, so its puzzle orders the steps of an interview strategy from that tracer; if the owner prefers an exception for A11, drop its puzzle and keep the two complexity questions on the chapter's code sample.
- Waits on epic-dsa-play-engine entry 8 and epic-dsa-checks entries 1 and 10 for the puzzle registry and the complexity pool model: these are already ordered through 2.7 and 3.8 ahead of entry 1, so no new after is added.
