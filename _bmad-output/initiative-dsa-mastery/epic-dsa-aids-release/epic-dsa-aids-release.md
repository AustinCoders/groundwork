---
type: epic
title: "Understanding aids and the release"
parent: initiative-dsa-mastery
covers: [CAP-4, CAP-7]
after: []
assignee: ""
risk: medium
---

# Understanding aids and the release

## Description

The reader gets three aids that work across chapters:
- `/review` asks a due DSA chapter's check questions;
- a which-pattern drill mixes the problem statements of their done chapters;
- a cheat sheet lists every pattern.

The epic then closes the initiative. A gate proves the whole section, and one merge takes it to production when the user says so.

## Outcome

Readers remember and recognise what they read, and the rebuilt DSA section goes live in one release with the spec's success signal passing on production.

## Requirements

- X1 (CAP-7): a DSA chapter due in `/review` asks two of its check questions.
  - Both right: it moves to the next gap.
  - One right: it stays at the same gap, counted from now.
  - The DSA gap lives in `groundwork:quiz`, so the review count in `jsnotes:progress` only grows and XP never falls (user, 2026-09-30).
  - Both wrong: it steps back one gap.
  - Other topics keep self-rating, and their schedule code is untouched.
- X2 (CAP-7): a which-pattern drill over the reader's done or tested-out chapters.
- X3 (CAP-7): a one-page cheat sheet of every pattern, with its signals, template and complexity, linking to its chapter and player.
- X4 (CAP-4, release): completeness, nine themes, the phone walk and legacy parity pass. How this is built, the sitemap and the roadmap match. `main` is merged on the user's word.

## Done when

1. With a seeded due DSA chapter, `/review` asks two questions and reschedules by X1, and a due `/notes` chapter still asks for self-rating.
2. The drill and the cheat sheet render from content alone, and every pattern links to a chapter and player that exist.
3. The completeness test, the 390px walk, the nine-theme axe run and the legacy-progress check pass.
4. After the user's merge, production serves the new `/dsa` and the walk passes there.
5. Built one story at a time on `feature/dsa-rebuild` with `npm run check`, `npm run build` and `npm run test:e2e` green after each; it reaches production only through the release merge (7.6).

## Boundaries

This epic covers the aids and the release. Review for other topics and any new chapter content are out of scope.

## References

- spec — _bmad-output/specs/spec-dsa-mastery/SPEC.md, CAP-4, CAP-7 and Success signal
- design — _bmad-output/specs/spec-dsa-mastery/quiz-and-placement.md, Review and the pattern drill
- analysis — _bmad-output/planning-artifacts/dsa-analysis-2026-09-30/research.md §2, §5, §6
- rules — AGENTS.md, Policy (merge by fast-forward, push origin, delete the branch locally and on GitHub)

## Notes

- Decision (agent, 2026-09-30): review questions can start once the check runner exists (3.2), because they only need one chapter's pool to verify. The drill and cheat sheet wait for every level's pattern records.
- Assumption: the drill counts tested-out chapters as done, because the placement showed the reader knows them. This widens the spec's "done chapters".
- Decision (agent, 2026-09-30): the sweep (entry 4) runs before the gate so the gate proves the cleaned-up tree, and the merge follows the gate.
- Decision (agent, 2026-09-30): the release is split into a gate an unattended loop can finish (entry 5) and a hitl merge (entry 6). The merge is the only one of the initiative.
- Decision (agent, 2026-09-30): any entry that adds a route, a page to the smoke or a11y suites, a CSS module, a storage key or a stated count updates the How this is built chapter that states it, in the same entry (spec Constraints; tests/claims.test.ts).
- Waits on epic-dsa-checks because: review uses 3.1's loader and 3.2's store, and the drill's empty state points to 3.7's placement.
- Waits on the level epics because: the drill, the cheat sheet and the completeness test need every chapter's pool, pattern record and player (6.8 follows them all).
- Waits on initiative-groundwork-overhaul epic-topic-redesign because: the user chose topic redesign first (2026-09-30). The topic frame, reader, cover, level, path and outline layout this epic builds on come from its entries 1, 3, 4, 5, 7 and 8, and the nine-theme axe harness comes from epic-audit-fixes entry 3.
