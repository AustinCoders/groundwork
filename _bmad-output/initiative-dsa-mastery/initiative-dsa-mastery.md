---
type: initiative
title: "DSA that meets you at your level"
parent: none
covers: [CAP-1, CAP-2, CAP-3, CAP-4, CAP-5, CAP-6, CAP-7]
after: []
assignee: ""
risk: high
---

# DSA that meets you at your level

## Description

The DSA section:
- finds a reader's level and gives them a chapter plan;
- lets them play how each chapter's structure or algorithm works inside;
- checks their understanding before a chapter counts as done;
- teaches beginner to advanced in depth, on the topic frame that epic-topic-redesign builds.

The spec at `_bmad-output/specs/spec-dsa-mastery/SPEC.md` owns the capabilities, constraints and non-goals, with its companions `curriculum.md`, `play-catalog.md` and `quiz-and-placement.md`.

## Outcome

A reader can go from their first visit to `/dsa` to a checked chapter on a phone: placement, plan, player, check. The spec's success signal is the measure.

## Done when

1. The spec's success signal passes on production: the 390px walk from placement to a checked chapter, with all 42 chapters having a player and a pool of at least 8 questions.
2. CAP-1 to CAP-7 are live on production for every reader, not behind a flag.
3. Existing DSA read marks, XP, badges and review schedules are the same after release as before it.
4. axe is clean in all nine themes at 1440 and 390 on the DSA cover, a chapter at each level, the placement, the pattern drill and the cheat sheet.
5. The other 17 topics, the Git guide and How this is built behave as before, and their e2e tests pass unchanged.

## Boundaries

This initiative is the DSA section only. The spec's non-goals rule out the other topics' pages (epic-topic-redesign), accounts and a play hub.

The epics follow the spec's capabilities:
- the foundations on the topic frame;
- the player;
- the checks and placement;
- one epic per level for the chapters;
- the aids and the release.

Tracer path across epics: `/dsa/dsa-binary-search`, with its island (1.1), its player (2.1) and its check (3.1 and 3.2).

Touch points:
- **The topic frame parts from epic-topic-redesign.** The reader, rail, cover cards, end card and path step gain optional props for islands, the completion policy and the cover aside. The other topics are unchanged. Owner: epic-dsa-frame.
- **`lib/content.ts` `minutesFor`.** Reading time excludes `<script>`, `<pre>` and `<svg>` for every topic. Owner: epic-dsa-frame (1.4).
- **`content/interview-data.ts`.** DSA chapter and exercise counts are derived. Owner: epic-dsa-frame (1.4).
- **`/level/[topic]` and `/path`.** They gain DSA-only behaviour through Topic data, and stop writing `jsnotes:level` for quiz topics. Owner: epic-dsa-checks (3.7).
- **`lib/mock/adaptive.ts`.** Its thresholds move to a shared lib, and the mock is unchanged. Owner: epic-dsa-checks (3.3).
- **`app/review` and `lib/storage`.** A new DSA-only review function is added, and `markReviewed`, `dueAt` and `REVIEW_GAPS_DAYS` are untouched. Owner: epic-dsa-aids-release (7.1).
- **`content/practice/dsa-*.ts`.** Exercises are moved and new ones written for the new chapters. Owner: the level epics.
- **`content/types.ts`.** `Topic.completion` and `Chapter.prerequisites` are optional fields shared by all 18 topics. Owner: epic-dsa-frame (1.2).
- **The shared enhancers, narration and smooth scrolling.** They skip `[data-island]`. Owner: epic-dsa-frame (1.1).
- **`content/architecture`.** Its chapters are updated in the same story as each change they describe. Owner: the story making the change.

Decisions the epics share:
- The island contract and placeholder, owned by 1.1.
- Curriculum data: order, levels, prerequisites and `Topic.completion`, owned by 1.2.
- The completion policy every tick surface and read count asks, and the next-chapter hook, owned by 1.3.
- The tracer model and registry (play-catalog.md, Engine), owned by 2.1.
- The question model and pattern vocabulary with per-chapter pattern records (quiz-and-placement.md, Question model), owned by 3.1.
- The ChoiceList component, owned by 3.2.

## References

- spec — _bmad-output/specs/spec-dsa-mastery/SPEC.md, sections Capabilities, Constraints, Non-goals
- design — _bmad-output/specs/spec-dsa-mastery/curriculum.md, play-catalog.md, quiz-and-placement.md
- analysis — _bmad-output/planning-artifacts/dsa-analysis-2026-09-30/README.md, content.md, code-and-ux.md, research.md
- upstream — _bmad-output/initiative-groundwork-overhaul/epic-topic-redesign/epic-topic-redesign.md and tickets.toml

## Notes

- Decision (user, 2026-09-30):
  - The check is a soft gate.
  - Existing read marks stay done.
  - The work ships as one release.
  - Every chapter gets a player inside it.
- Decision (user, 2026-09-30): readers with DSA marks are offered Re-check my level.
- Decision (user, 2026-09-30): for a placed reader, Continue, Up next and the path's next step follow the plan and skip tested-out chapters.
- Decision (user, 2026-09-30): XP never falls. The DSA review gap lives in the quiz store.
- Decision (user, 2026-09-30): new chapters take the existing exercises that fit, and new ones are written where none fit.
- Decision (user, 2026-09-30): one integration branch, `feature/dsa-rebuild`.
  - Stories are built one at a time, because packs add a line to the shared player registry and question index.
  - `main` gets one fast-forward merge when the release gate passes and the user says merge (7.6).
- Decision (user, 2026-09-30): topic redesign comes first. This initiative starts after initiative-groundwork-overhaul's epic-topic-redesign is done. That epic in turn waits on epic-audit-fixes entries 2–5; entry 3 supplies the nine-theme axe harness.
- Decision (agent, 2026-09-30): there is no platform-baseline epic. The repo, CI and deployment exist, and the topic frame comes from epic-topic-redesign.
- Waits on initiative-groundwork-overhaul epic-topic-redesign because: DSA's pages, the outline layout, the level and path pages, and the parts this initiative extends all come from it. `tickets.py` cannot express a cross-initiative `after`, so the wait is recorded here and in each epic's Notes.
