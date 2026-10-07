---
type: epic
title: "The Play it engine"
parent: initiative-dsa-mastery
covers: [CAP-3, CAP-5, CAP-8, CAP-11]
after: []
assignee: ""
risk: high
---

# The Play it engine

## Description

One player shows how an algorithm works inside, from a run recorded once as frames. Each algorithm is a pure, tested tracer, and every structure the curriculum needs has its own view. The eight old inline demos move onto it, which also fixes their dead code-line highlight. The level epics then add a player to every chapter by writing tracers, not new UI.

## Outcome

In the tracer chapter and the eight chapters that had demos, a reader steps through the algorithm by keyboard or pointer, on a preset or on their own input, with the code line and variables in sync. This is the engine half of CAP-3 and CAP-5's error 2, plus the puzzle half of CAP-8.

## Requirements

- P1 (CAP-3): a tracer model, a lazy registry and one Player, as play-catalog.md's Engine section describes. It has back, next, play/pause, speed, a scrubber and reset. Keys are scoped to focus, steps are narrated through `role="status"`, it never autoplays, pauses when hidden and honours reduced motion.
- P2 (CAP-3): views for arrays, grids, graphs, trees, forests, linked lists, call stacks, hash buckets, chips, bars, variables and code. Every state is labelled in text.
- P3 (CAP-3, CAP-5): the eight old demos become tracers and players and lose their inline scripts. Their code-line highlight works. The heap gets a real tree and union-find a real forest.
- P4 (CAP-3): presets, a visible "Try your own input" control with a parser and size limit that says in text why it rejects an input, and a table view of every frame.
- P5 (CAP-8): puzzles of kind order-the-steps and pick-the-next-step, built from each tracer's frames, auto-graded with instant feedback and an explanation, retryable without limit, working by keyboard, announced to screen readers and stated in text.
- P6 (CAP-11): the tracer declares its code by stable line ids and each of JavaScript, Python, Java and C++ maps those ids to its own lines, so the run, frames, narration, variables and questions never depend on the language. The Player's code panel shows the language chosen with the chapter switch, the highlight follows the frame in every language, and changing language never resets a running player.

## Done when

1. `/dsa/dsa-binary-search` plays from a preset and from an edited array, with code line, variables and narration changing every step, by keyboard alone.
2. The eight chapters that had demos have players and no inline `<script>`, and the rewritten graph demo e2e test passes.
3. Every tracer suite passes. For each preset, the final frame equals the reference answer, every frame has narration, every `line` is within the code, and over-limit input is refused.
4. axe shows no violations on a player under reduced motion in all nine themes, and no state is shown by colour alone.
5. Every tracer registers at least one puzzle in the registry, so every chapter with a player has one. The puzzle component reuses the check's ChoiceList and an order component, solved puzzles are recorded in groundwork:quiz, and a puzzle never writes a read mark, XP, activity or review entry. axe shows no violations on a puzzle under reduced motion in all nine themes.
6. Every tracer declares its code in JavaScript, Python, Java and C++ with a line-id map that covers every line id its frames use, the completeness and Lezer syntax tests pass, and on `/dsa/dsa-binary-search` switching language mid-run keeps the step and moves the highlight to the same logical line.
7. Built one story at a time on `feature/dsa-rebuild` with `npm run check`, `npm run build` and `npm run test:e2e` green after each; it reaches production only through the release merge (7.6).

## Boundaries

This epic covers the engine, the views and the ported demos. Predict-the-next-step in the check is epic-dsa-checks entry 6, which reuses the check's choice component; the puzzles here are separate and sit beside the player. The other 34 chapters' players belong to the level epics. Players are not exercises, and never touch `/problems` or `jsnotes:code:` keys.

## References

- spec — _bmad-output/specs/spec-dsa-mastery/SPEC.md, CAP-3, CAP-5 and Constraints
- design — _bmad-output/specs/spec-dsa-mastery/play-catalog.md, Engine and Players
- analysis — _bmad-output/planning-artifacts/dsa-analysis-2026-09-30/code-and-ux.md §3, §8.4; research.md §3

## Notes

- Decision (agent, 2026-09-30): entry 1 is the tracer. Binary search runs through the tracer, the registry, the Player and a chapter island.
- Decision (agent, 2026-09-30): the views are split into layout-heavy and list views, and the ports into two entries, so each fits one session. Each port writes its tracers' parsers and limits to 2.1's model, and entry 6 builds the input UI that reads them.
- Decision (agent, 2026-09-30): the registry maps each chapter to lazy imports, so a chapter page loads only its own tracers. Later packs add one line each.
- Decision (agent, 2026-09-30): any entry that adds a route, a page to the smoke or a11y suites, a CSS module, a storage key or a stated count updates the How this is built chapter that states it, in the same entry (spec Constraints; tests/claims.test.ts).
- Waits on epic-dsa-frame because: the Play island, the placeholder and the enhancer skip come from entry 1.1.
- Waits on initiative-groundwork-overhaul epic-topic-redesign because: the user chose topic redesign first (2026-09-30). The topic frame, reader, cover, level, path and outline layout this epic builds on come from its entries 1, 3, 4, 5, 7 and 8, and the nine-theme axe harness comes from epic-audit-fixes entry 3.
- Decision (2026-10-06): spec CAP-8 adds puzzles beside every player, so entry 8 (ref 2.8) is appended, covering the new requirement P5, and sits before the Refactor sweep, which now also comes after 8. It waits on 3.2 and 3.5 for the check's ChoiceList and order component. Ids are not renumbered.
- Decision (2026-10-06): spec CAP-3 makes dry-run a visible "Try your own input" control that says why it rejects an input; entry 6's description and verify now name it and the text reason, with no new entry.
- Decision (2026-10-06): puzzle data lives with its tracer in the registry so a chapter page loads only its own puzzles; solved puzzles and nothing else are stored in groundwork:quiz (spec constraint).
- Decision (2026-10-06): entry 8 (puzzles) is built after 3.2 and 3.5 although epic 3 sits after epic 2 in table order, because it reuses 3.2's ChoiceList and OrderList and 3.5's frame-to-choice step; `after` enforces this and the level epics wait for it through the sweep 2.7.

- Decision (2026-10-07): spec CAP-11 puts the language switch in this release, so entry 9 (ref 2.9) is appended, covering the new requirement P6, after 1.6 (the language store, switch and authoring format) and before the Refactor sweep, which now also comes after 9. Ids are not renumbered.
- Decision (2026-10-07): 2.9 retrofits the tracers ported in 2.4 and 2.5 to stable line ids and four languages, so those ports need not know about languages; the level epics write new tracers with all four languages from the start.
