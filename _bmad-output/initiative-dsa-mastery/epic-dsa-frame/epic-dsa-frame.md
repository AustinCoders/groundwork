---
type: epic
title: "DSA foundations on the topic frame"
parent: initiative-dsa-mastery
covers: [CAP-2, CAP-3, CAP-4, CAP-5, CAP-6, CAP-11]
after: []
assignee: ""
risk: medium
---

# DSA foundations on the topic frame

## Description

epic-topic-redesign moves `/dsa` and its chapters onto the topic frame first. This epic adds what DSA needs on top:
- chapter islands the player and the check plug into;
- one completion policy every tick surface asks;
- a cover aside for the plan;
- the new curriculum data;
- the language switch and the per-language chapter code format;
- the content fixes no single chapter owns.

## Outcome

The DSA pages on the topic frame are ready for the player, the check and the plan, with no change to any other topic. This is the frame part of CAP-4 and the data and global-fix parts of CAP-5 and CAP-6, and the switch, store and chapter-code format of CAP-11.

## Requirements

- F1 (CAP-3): chapter bodies hold player islands. The server renders their first state, and the enhancers, narration and smooth scrolling leave them alone.
- F2 (CAP-6, CAP-5): the DSA curriculum data matches `curriculum.md`: order, levels, numbers and prerequisites. The eight new chapters are outlines, and the broken syllabus promises are dropped.
- F3 (CAP-4, CAP-2): one completion policy, from `Topic.completion`, decides every tick surface and read count. A next-chapter hook decides Continue, Up next and the path's next step. The cover takes an optional aside, and the end card holds the Check island. Other topics are unchanged.
- F4 (CAP-5): reading time counts prose only, the interview book's DSA counts are derived and asserted, and no content file holds a NUL.
- F5 (CAP-11): a DSA reader switches chapter code between JavaScript (default), Python, Java and C++ with one keyboard-operable switch whose choice persists in its own key `groundwork:dsa:lang`. Chapter code blocks are `data-code` placeholders whose four translations are authored files in `content/dsa/code/<chapter-id>.ts`, only the chosen language loads, and completeness and syntax tests guard them.

## Done when

1. `/dsa/dsa-binary-search` holds a stub Play island in its server HTML, with the code blocks and tables around it enhanced as before.
2. The DSA order, levels and prerequisites match `curriculum.md`. A test fails when a prerequisite names a missing or later chapter, and the eight new chapters show as outlines.
3. Every DSA tick surface links to `#check`, and `/notes`, `/git` and `/architecture` ticks behave as before.
4. Reading time excludes code, scripts and SVG, and the claims test asserts the interview book's DSA counts.
5. On `/dsa/dsa-binary-search` the switch changes the code blocks to Python, Java and C++ and back, the choice survives a reload and a second chapter, no `jsnotes:*` key is written, only the chosen language's code is in the payload, and the completeness and syntax tests pass.
6. Built one story at a time on `feature/dsa-rebuild` with `npm run check`, `npm run build` and `npm run test:e2e` green after each; it reaches production only through the release merge (7.6).

## Boundaries

This epic covers DSA's data and optional props on the topic frame. Moving pages onto the frame is epic-topic-redesign's work. The player's per-language code (epic-dsa-play-engine entry 9), every other chapter's translations (the level epics), exercises, the Playground and any language beyond Python, Java and C++ are out of scope. The player (epic-dsa-play-engine), the check (epic-dsa-checks) and chapter prose (the level epics) are out of scope.

## References

- spec — _bmad-output/specs/spec-dsa-mastery/SPEC.md, CAP-2 to CAP-6, CAP-11 and Constraints
- design — _bmad-output/specs/spec-dsa-mastery/code-languages.md
- design — _bmad-output/specs/spec-dsa-mastery/curriculum.md
- analysis — _bmad-output/planning-artifacts/dsa-analysis-2026-09-30/code-and-ux.md §2, §3.1, §8.4, §10
- upstream — _bmad-output/initiative-groundwork-overhaul/epic-topic-redesign/epic-topic-redesign.md and tickets.toml (entries 1, 3, 4, 5, 7, 8)

## Notes

- Decision (agent, 2026-09-30): entry 1 is the tracer. It proves the island path on a real DSA chapter in the topic reader.
- Decision (agent, 2026-09-30): entries 2 and 4 wait on the entry before them only because they edit the same How this is built chapters and claims test.
- Decision (agent, 2026-09-30): any entry that adds a route, a page to the smoke or a11y suites, a CSS module, a storage key or a stated count updates the How this is built chapter that states it, in the same entry (spec Constraints; tests/claims.test.ts).
- Waits on initiative-groundwork-overhaul epic-topic-redesign because: the user chose topic redesign first (2026-09-30). The topic frame, reader, cover, level, path and outline layout this epic builds on come from its entries 1, 3, 4, 5, 7 and 8, and the nine-theme axe harness comes from epic-audit-fixes entry 3.
- Decision (2026-10-07): entry 6 is the CAP-11 tracer. It follows entry 1 only, because it needs the chapter body and island path; the Refactor sweep (5) now waits on it.
- Decision (2026-10-07): the player's per-language code is epic-dsa-play-engine entry 9, which waits on 6; this entry proves the switch on chapter code blocks only.
- Decision (2026-10-07): entry 6 adds `groundwork:dsa:lang` to the How this is built chapter that lists storage keys, in the same entry.
