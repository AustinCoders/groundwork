---
type: epic
title: "Understanding aids and the release"
parent: initiative-dsa-mastery
covers: [CAP-4, CAP-7, CAP-10]
after: []
assignee: ""
risk: medium
---

# Understanding aids and the release

## Description

The reader gets five aids that work across chapters:
- `/review` asks a due DSA chapter's check questions;
- a which-pattern drill mixes the problem statements of their done chapters;
- a cheat sheet has one page per pattern, plus an index;
- a shaky list on `/review` shows the questions the reader missed;
- a revision list on `/dsa` groups what they have done and missed by interview style and pattern.

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
- X3 (CAP-7): a cheat sheet with one page per pattern at `/dsa/cheat-sheet/<pattern>`, each with its signals, template and complexity, linking to its chapter and player, plus an index at `/dsa/cheat-sheet`.
- X5 (CAP-7): a shaky list holds the question ids missed in checks, the complexity round and review.
  - A question leaves it when the reader later answers it right.
  - `/review` shows it with a link to each question's chapter section.
  - It lives in `groundwork:quiz`, never in `jsnotes:progress`.
- X6 (CAP-10): a revision list on `/dsa` groups the reader's done chapters, shaky questions and the site's existing exercises by interview style (online assessment, phone screen, onsite round) and by pattern.
  - It names no companies, because the repo holds no sourced company data.
  - It works from local data only, with no network call.
- X4 (CAP-4, release): completeness, nine themes, the phone walk and legacy parity pass. How this is built, the sitemap and the roadmap match. `main` is merged on the user's word.

## Done when

1. With a seeded due DSA chapter, `/review` asks two questions and reschedules by X1, and a due `/notes` chapter still asks for self-rating.
2. The drill and the cheat sheet render from content alone, every pattern has its own cheat-sheet page, and every pattern links to a chapter and player that exist.
3. A wrong answer in a check, the complexity round or review appears on the `/review` shaky list with a link to its chapter section, and leaves it when later answered right.
4. The revision list on `/dsa` groups done chapters, shaky questions and exercises by interview style and pattern, names no company and works with the network blocked.
5. The completeness test (a puzzle, two complexity questions and style tags in every chapter), the 390px walk with the popup, a puzzle and the shaky list, the nine-theme axe run and the legacy-progress check pass.
6. After the user's merge, production serves the new `/dsa` and the walk passes there.
7. Built one story at a time on `feature/dsa-rebuild` with `npm run check`, `npm run build` and `npm run test:e2e` green after each; it reaches production only through the release merge (7.6).

## Boundaries

This epic covers the aids and the release. Company names stay out: the revision list uses interview styles only. Review for other topics and any new chapter content are out of scope.

## References

- spec — _bmad-output/specs/spec-dsa-mastery/SPEC.md, CAP-4, CAP-7, CAP-10 and Success signal
- design — _bmad-output/specs/spec-dsa-mastery/quiz-and-placement.md, Review, the pattern drill, the shaky list and the complexity round
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
- Decision (2026-10-06): the cheat sheet is now one page per pattern plus an index (X3, entry 3), following the spec's CAP-7 update; the routes go to How this is built.
- Decision (2026-10-06): entry 7 adds the shaky list (X5) and entry 8 the revision list (X6, new CAP-10). Both go before the sweep so the sweep and the gate cover them; the sweep now waits on 7 and 8.
- Decision (2026-10-06): entry 1 hands review's wrong answers to the shaky-list recorder, and entry 7 owns the store, the wiring and the `/review` display, because 7 waits on 1 and the store cannot be a dependency of the entry that precedes it. Checks' complexity round (3.10) feeds the same store.
- Decision (2026-10-06): the release gate (entry 5) now also requires a puzzle, two complexity questions and style tags in every chapter, and the phone walk covers the end-of-chapter popup, a puzzle and the shaky list.
- Decision (2026-10-06): the revision list names no companies and uses local data only; the spec's company non-goal is lifted for this list alone and no company data exists yet.
- Waits on epic-dsa-checks entry 3.10 (complexity round) because: the shaky list records its misses; and on 3.1 because: the revision list reads style tags from the question model's pattern records.
- Decision (2026-10-06): entry 1 only saves the ids of wrong review answers in the review result; it no longer refers to a recorder that entry 7 builds. Entry 7 reads the check, round and review records and owns the shaky list and its /review display.
- Decision (2026-10-06): entry 8 gives each existing exercise the style and pattern of its chapter's pattern record, because exercises carry no tags of their own; a seeded exercise must appear under its group.
- Decision (2026-10-06): the release gate's walk also covers the revision list, Revise earlier, the First check passed badge and Try your own input; entries 5 and 7.7 of checks note where they may be split if one session is not enough.
