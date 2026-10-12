---
title: 'Bring feature/dsa-rebuild up to date with main: merge main in and port the DSA features onto the new home-style kits'
type: 'feature'
ticket: ''
created: '2026-10-13'
status: 'built'
route: 'full'
route_source: 'auto'
review: ''
review_source: ''
lenses_ran: []
review_loop_iteration: 0
followup_review_recommended: false
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/specs/spec-dsa-mastery/SPEC.md']
warnings: ['oversized']
deferred: []
baseline_revision: 'acdbd5d'
---

<intent-contract>

## Intent

**Problem:** `feature/dsa-rebuild` (12 commits, last acdbd5d, built story by story: the new 42-chapter DSA curriculum, chapter islands on the topic reader, one completion policy for every tick, a cover aside slot, the Python/Java/C++ code switch, the step-by-step player, the question model, the chapter check with its pass through mark-read, the mark-as-read banner, and the placement engine) was paused while `main` moved on 22 commits further: the whole site was rebuilt on the home-style kits (`TopicReader`, `TopicCover`, `TopicPath`, level pages, chapter pages on `components/chapter/ChapterKit`, `TopicKit`, `Compose`, the Menu pill, the chapter sidebar, the tour, etc.). The owner asked to join the DSA branch with `main`.

**A trial merge of origin/main into the DSA branch conflicts in 23 files.** The text conflicts are the easy part. The real work: the DSA features were built on the OLD reader, cover and path components, and `main` deleted or rewrote those (`components/chapter/ChapterCard.tsx`, `ChapterEnd.tsx`, `components/series/chapter.module.css`, `landing.module.css` are deleted on main; `TopicReader.tsx`, `TopicCover.tsx`, `TopicPath.tsx`, their CSS and `TocCard.tsx` were rewritten). The DSA features must be re-attached to the new components so they work and look like the rest of the site.

**Approach:** In the worktree on `feature/dsa-rebuild`, merge `origin/main` into it (one merge commit, no rebase of the 12 commits), resolve every conflict deliberately, and port the DSA features onto the new kits:
- chapter islands: mount points inside the new chapter page (ChapterKit based reader) for the step-by-step player, the Python/Java/C++ switch and the chapter check, loaded lazily, with the same behaviour the DSA stories specified;
- the cover aside slot and the DSA cover content on the new topic cover (Compose-kit stage), so the DSA cover shows what the stories intended (placement entry, progress) in the new look;
- the completion policy and mark-as-read tick: keep the DSA branch's single policy (every tick goes through it, the check opens when the policy says so, banner, pulse, focus on the first question) wired into the new `ChapterEndScene` / mark-as-read controls and the chapter sidebar ticks;
- the DSA curriculum (42 chapters in order, prerequisites, eight outlines) in `content/dsa-notes.ts`, `content/topics.ts` and the topic data: where `main` also changed those files take main's structure and re-apply the DSA curriculum on top; nothing from either side is silently dropped;
- the new surfaces from the DSA branch (the check dialog or panel, the player, the placement UI if it exists yet, the language switch) get the home-style look through the shared kits and tokens (`--t-*` scale, theme tokens, no hex, no comments, handwriting fonts, nine themes), not their old styling.

## Boundaries & Constraints

**Always:**
- Work ONLY in the git worktree at `/private/tmp/claude-501/-Users-akshat-Desktop-groundwork/d4636351-c962-41d8-89f8-14dac520617b/scratchpad/dsa-wt` (checked out on `feature/dsa-rebuild`, at acdbd5d). Never switch branches or change files in `/Users/akshat/Desktop/groundwork` (the owner's dev server runs there). The worktree needs its own install: run `npm ci` in it (scratch). Run build, check and e2e in this worktree (it IS the verification copy); `git init` is not needed.
- Read first: the DSA spec `_bmad-output/specs/spec-dsa-mastery/SPEC.md` and the ticket tree under `_bmad-output/initiative-dsa-mastery/` to know what each DSA feature must do; the plans of the home-style work on main (`_bmad-output/implementation-artifacts/plan-chapter-pages-home-style.md`, `plan-topic-pages-home-style.md`, `plan-stage-compositions-v2.md`, `plan-sidebar-and-menu-v3.md`, `plan-first-visit-tour.md`) for the kits and rules you must follow; and `AGENTS.md`.
- Resolution rules: for UI structure and styling take `main`; for DSA behaviour, data and tests take the DSA branch; where both changed the same file, combine them. For `content/architecture/*` and `tests/claims.test.ts`-asserted numbers, recompute from the merged result (CSS modules, client files, storage keys, test counts, DSA chapter counts); the DSA branch added storage keys (`groundwork:quiz`, `groundwork:dsa:placement`, language preference, etc.) and tests, so those numbers differ from both parents. `.cspell/project-words.txt`: keep both sides' words, appended at the end, never re-sorted.
- Tests: merge both sides' tests; update tests that asserted the old reader or cover markup so they assert the same behaviour on the new components; keep every e2e role and name on main working; add coverage where a ported feature lost it. The DSA branch's e2e and unit tests must pass on the merged result.
- The whiteboard stays untouched: do not edit `app/whiteboard/**`, `lib/whiteboard*`, `app/mock/Whiteboard.tsx` (if the merge touches them, take main's version unchanged).
- Rules learned on main that apply to anything new you build: header gap and balance on scenes, text uses the full width of its panel, nothing part-transparent at any scroll position, no `data-fx` reveals, no two states visible at once, no one-frame flash before hydration (anything that depends on saved progress, quiz or placement state is hidden until hydration), reduced-motion safe, tap targets 44px, no horizontal scroll at 320, the Compose rules (`e2e/compose.spec.ts`).

**Never:** comments in source (`npm run comments` fails them); hex, white or literal colours (theme tokens only); hard offset shadows; editing `.claude/skills/` or `_bmad/`; touching port 3000 or any broad `pkill`; pushing, and merging into `main` (the coordinator does that after verifying); leaving the merge half-done: finish with a clean, fully resolved, uncommitted-or-committed state as described below.

## Deliverable state

Finish with the merge fully resolved and everything verified. Leave the merge COMMIT for the coordinator: resolved files staged in the worktree, `MERGE_HEAD` still present, nothing committed (so the coordinator can inspect and commit with the owner's identity). If you must commit work in progress to protect it, do so as ONE merge commit only after the gates pass, with message `merge: bring main into feature/dsa-rebuild and port the DSA features onto the home-style kits`, no Co-Authored-By trailer; say which state you left.

## Tasks & Acceptance

- Given the worktree after the merge, then `git diff --name-only --diff-filter=U` is empty, no conflict markers remain anywhere (`grep -rn '^<<<<<<<\|^>>>>>>>' .` outside node_modules and .next), and `git status` shows a coherent merge.
- Given the merged site, then: the DSA topic cover, level picker, path, chapter pages and the chapter sidebar look like the rest of the site; the DSA features work on the new components: the language switch and step-by-step player on binary search and two pointers, the chapter check opening from the tick per the completion policy with its banner, pulse and focus, the question pool for binary search, and the placement engine's store and rules; the 42-chapter curriculum shows in order with prerequisites and eight outlines.
- Given a visual check of the DSA cover, a DSA chapter with a player, the check open, the language switch, and the level and path pages at 390 and 1440 in Night and light with Classic and Roboto, then nothing overlaps, clips or looks odd (screenshots reviewed by you; report them).
- Given `npm run check`, `npm run build` and the full e2e in the worktree on the merged result, then all pass; every number asserted by `tests/claims.test.ts` is correct for the merged site; the first-load JS of `/` and a DSA chapter are reported against main's numbers (the DSA islands must stay lazy and out of the first-load bundle).
- Given the DSA branch's own e2e (player, language switch, check, placement), then they pass on the merged result.

## Implementation Notes

(agent: write the conflict-by-conflict resolution table and the port list here, newest last; this file lives on main, so also copy the notes into `_bmad-output/implementation-artifacts/` inside the worktree if you keep a DSA-side plan)

### Implementation Notes (agent run 1)

Worktree: `/private/tmp/claude-501/-Users-akshat-Desktop-groundwork/d4636351-c962-41d8-89f8-14dac520617b/scratchpad/dsa-wt`, merge of `origin/main` (3181f5b) into acdbd5d in progress (`git merge --no-commit --no-ff`). My originals of conflicted files: `../dsa-merge-notes/*.ours` (scratchpad).

**Conflict resolution table (23 files)**

| File | Resolution |
| --- | --- |
| `.cspell/project-words.txt` | both sides' words, main's first then DSA's unique ones, appended, not sorted |
| `components/chapter/ChapterCard.tsx`, `ChapterEnd.tsx`, `components/series/chapter.module.css`, `landing.module.css` | deleted (main). DSA tick-as-link behaviour re-attached to the new kit components (see port list) |
| `components/chapter/TocCard.tsx`, `components/topic/TopicReader.tsx`, `TopicCover.tsx`, `TopicPath.tsx`, `cover.module.css`, `level.module.css`, `reader.module.css` | main's version taken whole; DSA features ported on top (see port list) |
| `content/dsa-notes.ts` | title "DSA — the whole map" (main's rename), subtitle with 42 sections / 34 written / 8 outlined (DSA) |
| `content/architecture/arch-*.ts` (8 files) | main's text taken, DSA facts re-applied and every asserted number recomputed at the end |
| `e2e/smoke.spec.ts`, `e2e/a11y.spec.ts` | both sides kept (imports and the appended test blocks); DSA tests then updated for the new markup |

**Port list (DSA features onto the new kits)**

- Reader (`TopicReader`): main's version plus `completion`, `check`, `checkChapterIds`, `codeBlocks`, `segments`, `islands`. `Prose` in `ChapterKit` takes optional `segments`/`islands` (same `#chapters` container, `.segment {display: contents}`), `ChapterHero` takes an `extra` slot in its facts row (the language switch), the Check island sits between `ChapterPractice` and `ChapterEndScene`.
- Ticks: `ChapterFinish` (end card) and `TocCard` take `tickHref`; unread chapters of a `completion: "quiz"` topic render a link to `#check` with `openCheckOnClick`, everything else keeps the button. Cover contents ticks (`TopicCover`, `topicKit.tick`) and path steps (`TopicPath`) do the same; `quizStore.unmark` on unmark; `quizStore.clear()` with the path reset; `nextChapter` for Continue/Up next/path next step.
- Cover: `aside` slot rendered as a third Compose card (`at="c"`); no placement UI exists on the branch yet, so nothing fills it.
- Islands restyled: Play it and Check yourself use the `Eyebrow` kit heading in a `.practice`-style sheet card (`reader.module.css`, tokens only); player and check modules scoped under `.player` / `.runner` so `.prose` rules cannot leak in (the old code-line backgrounds, list padding), font sizes on the `--t-*` scale, weights 400/700, ghost-button look at 44px; the pulse (`.attention`) stays unscoped because it is applied to the island card.
- Language switch: dashed pill group, 34px buttons (44px under 760px), full-width four-up row under 560px.
- Architecture chapters: main's text with the DSA facts re-applied (`merge-file --theirs` over base/ours/theirs for the 8 conflicted files, then DSA rows/paragraphs and every asserted number recomputed).

**Result (agent run 1)**

- Worktree left with the merge fully resolved and staged, MERGE_HEAD present, nothing committed. Commit with: `git -C <worktree> commit -m "merge: bring main into feature/dsa-rebuild and port the DSA features onto the home-style kits"` (no trailer).
- Gates in the worktree: `npm run check` clean (1298 unit tests), `npm run build` ok (1,803 routes), full e2e 631 passed / 0 failed (rerun after the last change).
- Extra fixes the merge needed: `/level/<topic>` facts card shows the reading time as `5h 47m` (compactSpan) because DSA's prose-only minute count made `5 h 47 min` overflow the card at 1280; `workbench.spec.ts` now expects "B5 Hashing" (DSA numbering); the heavy DSA islands (Player, CheckRunner, CodeLanguageSwitch) load through `next/dynamic` loaders so non-DSA reader pages do not carry them; e2e `press()` waits for React hydration of its target because the islands now hydrate from a lazy chunk.
- First-load JS (script tags in the HTML, raw/gzip): `/` 1,003,364 / 316,581 vs main 1,003,349 / 316,575; `/notes/closures` 959,658 / 304,469 vs main 949,124 / 300,785; `/dsa/dsa-binary-search` 988,140 / 313,916 vs main 949,124 / 300,785 (player and check are server-rendered islands, their code is a separate chunk); `/dsa` cover 926,963 vs 917,284.
- Not ported: the placement UI and the DSA cover placement entry do not exist on the branch (only the engine and store), so the cover `aside` slot is a Compose card nothing fills yet.

## Plan Change Log

## Verification

**Commands (in the worktree):** `npm ci`, `git merge --no-commit --no-ff origin/main`, resolve, then `npm run build` (wrap with `perl -e 'alarm 900; exec @ARGV' ...`, retry once after `rm -rf .next` on a font-fetch error), `npm run check`, `npx playwright test --workers=3 --retries=0`.

## Auto Run Result

Built. `origin/main` (3181f5b) was merged into `feature/dsa-rebuild` in a separate worktree and the DSA features were ported onto the home-style kits: merge commit 83ff172. The CI fixes that landed on main afterwards (5ae5845) were merged into the DSA branch as 0cd5e19, with one conflict in `lib/headingToc.ts` resolved by keeping the DSA reserved heading id "check" together with main's server-side table wrapping. Gates on the merged DSA branch before each merge commit: `npm run check` 1298 unit tests, build with 1,803 prerendered routes, full e2e 631 of 631 (the e2e suite has since been cut to a 15-test smoke on main; the DSA branch still carries its own extra e2e tests, which will conflict as modify/delete when main is merged into it again, and should be deleted there). Placement UI does not exist on the branch (engine and store only), so the cover's aside slot is empty. The DSA branch was pushed; it was not merged into main, by the owner's decision.
