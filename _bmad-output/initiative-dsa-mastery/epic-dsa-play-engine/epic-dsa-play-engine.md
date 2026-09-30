---
type: epic
title: "The Play it engine"
parent: initiative-dsa-mastery
covers: [CAP-3, CAP-5]
after: []
assignee: ""
risk: high
---

# The Play it engine

## Description

One player shows how an algorithm works inside, from a run recorded once as frames. Each algorithm is a pure, tested tracer, and every structure the curriculum needs has its own view. The eight old inline demos move onto it, which also fixes their dead code-line highlight. The level epics then add a player to every chapter by writing tracers, not new UI.

## Outcome

In the tracer chapter and the eight chapters that had demos, a reader steps through the algorithm by keyboard or pointer, on a preset or on their own input, with the code line and variables in sync. This is the engine half of CAP-3 and CAP-5's error 2.

## Requirements

- P1 (CAP-3): a tracer model, a lazy registry and one Player, as play-catalog.md's Engine section describes. It has back, next, play/pause, speed, a scrubber and reset. Keys are scoped to focus, steps are narrated through `role="status"`, it never autoplays, pauses when hidden and honours reduced motion.
- P2 (CAP-3): views for arrays, grids, graphs, trees, forests, linked lists, call stacks, hash buckets, chips, bars, variables and code. Every state is labelled in text.
- P3 (CAP-3, CAP-5): the eight old demos become tracers and players and lose their inline scripts. Their code-line highlight works. The heap gets a real tree and union-find a real forest.
- P4 (CAP-3): presets, edited input with a parser and size limit, and a table view of every frame.

## Done when

1. `/dsa/dsa-binary-search` plays from a preset and from an edited array, with code line, variables and narration changing every step, by keyboard alone.
2. The eight chapters that had demos have players and no inline `<script>`, and the rewritten graph demo e2e test passes.
3. Every tracer suite passes. For each preset, the final frame equals the reference answer, every frame has narration, every `line` is within the code, and over-limit input is refused.
4. axe shows no violations on a player under reduced motion in all nine themes, and no state is shown by colour alone.
5. Built one story at a time on `feature/dsa-rebuild` with `npm run check`, `npm run build` and `npm run test:e2e` green after each; it reaches production only through the release merge (7.6).

## Boundaries

This epic covers the engine, the views and the ported demos. Predict-the-next-step is epic-dsa-checks entry 6, which reuses the check's choice component. The other 34 chapters' players belong to the level epics. Players are not exercises, and never touch `/problems` or `jsnotes:code:` keys.

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
