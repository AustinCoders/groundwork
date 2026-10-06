---
id: SPEC-dsa-mastery
companions:
  - curriculum.md
  - play-catalog.md
  - quiz-and-placement.md
  - ../../planning-artifacts/dsa-analysis-2026-09-30/content.md
  - ../../planning-artifacts/dsa-analysis-2026-09-30/code-and-ux.md
  - ../../planning-artifacts/dsa-analysis-2026-09-30/research.md
  - ../spec-groundwork-overhaul/SPEC.md
  - ../../../AGENTS.md
sources:
  - ../../planning-artifacts/dsa-analysis-2026-09-30/README.md
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# DSA that meets you at your level

## Why

DSA is the section readers lean on most for interviews. Today it treats every reader the same:
- It opens on a flat list of 34 chapters in the old notebook layout.
- A reader picks a level by guessing.
- A chapter counts as done the moment its box is ticked.
- Only 8 chapters let a reader watch an algorithm run, from a fixed input that cannot be changed.
- Beginner and intermediate chapters average under 1,000 words and skip techniques their own exercises need. Advanced chapters average about 2,075.
- Several chapters carry real errors.

This is both a pain to fix and a vision the owner wants: a DSA section that finds where you are, shows you how each structure works inside, checks that you understood before calling a chapter done, and covers beginner to advanced properly.

## Capabilities

- **CAP-1**
  - **intent:** A first-time DSA reader chooses to start from the beginning, find their level with a short quiz, or pick a level, and gets a chapter plan that fits.
  - **success:**
    - With no DSA placement and no `dsa-*` marks, `/dsa` offers the three choices.
    - The quiz has no timer, ends within 18 questions and has a "not sure yet" option.
    - It shows a level and the allotted chapters as the reader's plan on `/dsa`, and the chapters it credits show as tested out. After it, Continue, Up next and the path's next step follow the plan and skip tested-out chapters.
    - Nothing is locked. A reader placed at a level can still open and mark done any earlier chapter, and the plan lists those under "Revise earlier".
    - Retake and reset to the beginning always work. Readers who already have DSA marks get "Re-check my level" on the cover, which never changes their marks.
    - The placement writes no read mark, XP, activity or review entry, and it does not change the global saved level.
- **CAP-2**
  - **intent:** Marking a DSA chapter done asks a short auto-graded check on that chapter.
  - **success:**
    - Every DSA chapter's mark-done opens a check of 5 questions drawn from its pool of at least 8, passing at 4.
    - A pass marks the chapter read, so review, XP, badges and streaks work as today.
    - A miss shows each answer's explanation, and a retry draws fresh questions.
    - "Mark done anyway" marks it read and not checked. Unmarking stays free.
    - The cover, rail and path tell checked, not checked and tested out apart.
    - When a reader reaches the end of a chapter that is not yet done, a popup asks "Mark this chapter done?". Yes opens the check. Not yet dismisses it for that chapter, and it does not return. It opens at most once per chapter, never mid-reading, and Escape closes it and returns focus.
    - A pass earns XP, streak and activity as a read mark does today, and adds two badges: "First check passed" and "A level checked".
- **CAP-3**
  - **intent:** In every DSA chapter a reader can play a visual of how that chapter's structure or algorithm works inside, at their own pace and on their own input.
  - **success:**
    - Every chapter embeds at least one player from the play catalog.
    - Each player has back, next, play/pause, speed, a step scrubber and reset. It highlights the running code line with the variables in sync, offers predict-the-next-step, and has a "Try your own input" control that accepts edited input within stated limits and says why when it rejects one.
    - Each works by keyboard, narrates steps to screen readers, has a table view, never autoplays and honours reduced motion.
    - Each tracer is unit-tested so its final state equals the reference answer.
- **CAP-4**
  - **intent:** The DSA cover and chapters use the modern topic frame that epic-topic-redesign builds, extended with the slots the player, check and plan need.
  - **success:**
    - `/dsa` and every `/dsa/<chapter>` render on the shared topic frame: labelled back, menu, chapter rail, contents card, readable column, header pager and end card. Every tick surface honours the DSA completion policy.
    - They use none of Shell, ReaderShell, CoverSheet, CoverMap or ChapterSheet.
    - Every feature on the overhaul's must-not-regress list still works on DSA pages.
    - The pages hold at 390px.
    - axe passes on `/dsa`, a chapter and the placement in all nine themes.
- **CAP-5**
  - **intent:** The DSA chapters contain no known technical, diagram or syllabus errors.
  - **success:** Every error in curriculum.md "Errors to fix" is fixed, and a test guards the ones a test can catch.
- **CAP-6**
  - **intent:** The DSA section teaches every standard topic from beginner to advanced, in a sensible order, deep enough that each chapter's exercises are taught in its own prose.
  - **success:**
    - The eight new chapters in curriculum.md are written.
    - Every chapter meets the depth bar.
    - Every exercise's technique is taught in its chapter.
    - Order, levels and prerequisites match curriculum.md.
    - Every chapter has at least one exercise at or below its level.
- **CAP-7**
  - **intent:** Readers get help beyond reading: spotting the right pattern, remembering chapters over time, and seeing why an algorithm is correct and how it goes wrong.
  - **success:**
    - A which-pattern drill mixes problem statements from the reader's done chapters.
    - A DSA chapter due in `/review` asks two of its check questions instead of self-rating. Its gap can step back, but XP never falls.
    - Every chapter has a why-it-works box and a common-mistakes box.
    - A DSA cheat sheet has one page per pattern, with its signals, template and complexity and links to its chapter and player, plus an index of all patterns.
    - A shaky list holds the questions a reader missed in checks, rounds and review. Review shows it with a link to each question's chapter section, and a question leaves it when the reader later answers it right.
- **CAP-8**
  - **intent:** Every DSA chapter has small puzzles beside its player, so a reader tests and deepens their understanding of how the algorithm works.
  - **success:**
    - Every chapter has at least one puzzle, either order-the-steps or pick-the-next-step, built from that chapter's tracer.
    - Each is auto-graded with instant feedback and an explanation, and can be retried without limit.
    - A puzzle never writes a read mark, XP, activity or review entry.
    - Each works by keyboard, is announced to screen readers and gives every state in text.
- **CAP-9**
  - **intent:** Every DSA chapter ends with a short round on the time and space complexity of code from that chapter.
  - **success:**
    - The chapter's end card offers a round of 2 questions on a code sample from the chapter.
    - The round is optional and never blocks mark done.
    - A wrong answer goes to the shaky list.
    - Every chapter's pool has at least 2 complexity questions.
- **CAP-10**
  - **intent:** A reader can revise DSA by interview style and pattern, from what they have done and got wrong.
  - **success:**
    - A revision list on `/dsa` groups the reader's done chapters, shaky questions and the site's existing exercises by interview style (for example online assessment, phone screen, onsite round) and by pattern.
    - It names no companies.
    - It is built from data already on the site and needs no network.

## Constraints

- **Order.** The DSA work starts after epic-topic-redesign (initiative-groundwork-overhaul) is done, and ships as one release from `feature/dsa-rebuild` with one merge to `main` (user, 2026-09-30).
- **No backend, no LLM at runtime.** Progress, results and placement live in localStorage. Every question is auto-gradable: single choice, multiple choice, order the steps, or predict the next state. There are no free-text answers.
- **Placement has its own key.** It keeps its own versioned key and never writes `jsnotes:progress` or `jsnotes:level`, because read marks feed XP, activity, badges and review, and the level key re-routes every topic.
- **The gate lives in the UI.** A pass calls the existing `setChapterDone`, and `lib/storage`'s behaviour is unchanged for every other topic.
- **Payload stays small:**
  - Quiz data stays off `Chapter` and `chapterMetas`.
  - A chapter page receives only its own questions.
  - Tracers load lazily per algorithm.
  - `content/practice` is never imported into DSA client code.
- **Play is separate from exercises.** It is not modelled as `Exercise`: it never appears in `/problems`, the mock bank, exercise counts or `jsnotes:code:` keys. Its UI name cannot be confused with the Playground.
- **Shared components serve 18 topics.** DSA-only behaviour comes from DSA-owned routes or optional props and data such as `Topic.completion`. It never comes from `topicId === "dsa"` checks or changed defaults.
- **No dependence on pages being deleted.** DSA pages must not depend on Shell, ReaderShell, CoverSheet, CoverMap or ChapterSheet, which epic-topic-redesign TP-9 deletes.
- **Keys and motion:**
  - Player and check keys are scoped to focus inside them, because the reader owns `n`, `p`, `t`, `[`, `]` and `/`.
  - Players never autoplay, pause on navigation and when the tab is hidden, and honour `prefers-reduced-motion`.
- **Where the new state lives.** Popup dismissals, puzzle progress, complexity-round results and the shaky list live in `groundwork:quiz`, never in `jsnotes:progress`. A chapter page receives only its own puzzles and questions.
- **No colour-only state.** Every visual state is also given as text. Faded states pass contrast in all nine themes.
- **Styling rules.** Theme tokens only, no colour literals in modules, and no comments in source (AGENTS.md; `tests/theme-roles.test.ts`, `tests/theme-contract.test.ts`).
- **The architecture chapters stay true.** Numbers stated in `content/architecture/` are asserted by `tests/claims.test.ts`. A story that adds pages, e2e tests, CSS modules, storage keys or routes updates those chapters in the same story.
- **Chapter ids stay stable** when chapters change level or order.
- **Honest copy.** The check runs in the browser and its answers ship in the page, so the copy says "checked", never "verified" or "certified".

## Non-goals

- A separate play hub or gallery page; players live inside chapters.
- Accounts, server-side scores, certificates, leaderboards or timed tests.
- Company names on questions or lists, until the owner supplies sourced data. The owner lifted the company non-goal for the revision list only (2026-10-06).
- Moving the other 17 topics onto the new reader; epic-topic-redesign owns that.
- Advanced depth beyond curriculum.md: network flow, suffix arrays, Aho-Corasick, meet-in-the-middle and randomised algorithms. New exercises beyond the ones CAP-6 needs.

## Success signal

- On a 390px phone, a new reader:
  - opens `/dsa` and takes the placement in under 10 minutes;
  - lands on a plan and opens the first allotted chapter;
  - plays its visual by keyboard, solves its puzzle and, on reaching the chapter's end, answers the "Mark this chapter done?" popup with Yes;
  - passes the check and sees the chapter marked done and scheduled for review;
  - sees a missed question on the shaky list in `/review`.
- All 42 chapters have a player, a puzzle, and a question pool of at least 8 that holds at least 2 complexity questions.
- `npm run check`, `npm run build` and `npm run test:e2e` pass, with axe clean in all nine themes.

## Assumptions

- The player is labelled "Play it", with a play icon, so it stays distinct from the Playground link.
- The eight old inline demos are replaced by the new player, their scripts are removed, and the `#gt-*` e2e test is rewritten.
- Puzzles reuse the check's choice and order components and the tracers' frames.
- Real company names need sourced data that the repo does not have, so the revision list groups by interview style and pattern until the owner supplies sources.
- `/level/dsa` shows the same three-door start card above its level cards. `/path?topic=dsa` shows check-aware ticks. Both stay on their current pages until epic-topic-redesign moves them.

## Open questions

- Should code examples also show in other languages than JavaScript, through a toggle that shows the same example in Python, Java and C++, with JavaScript staying the main language, in this release or a later one? Tracers are language-neutral, so it would affect only the code shown beside the player and in chapter examples. The owner has not answered.
