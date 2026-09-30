# DSA section analysis, 30 September 2026

Three read-only reports on the DSA section, made to plan its rebuild, plus the owner's decisions.

- [content.md](content.md) covers the chapters: a table of every chapter, depth, errors, coverage gaps, existing quiz-like material, the existing step-through demos, and a content backlog.
- [code-and-ux.md](code-and-ux.md) covers the code: routing, the progress model, the demo machinery, reusable quiz parts, exercise links, overlap with epic-topic-redesign, tests, performance, and a recommended architecture.
- [research.md](research.md) covers how other learning products and the research handle placement, mastery gating, algorithm visualisation, curriculum order and understanding aids. It has about 60 cited sources.

## What the owner asked for (30 Sep 2026)

1. On a reader's first visit to DSA, a quiz finds their level and allots the chapters that fit. A reader can also choose to start from the beginning.
2. Marking a chapter done first asks a short quiz on that chapter.
3. Every chapter can be "played": a visual that shows how that chapter's structure or algorithm works inside, step by step. This is separate from the existing coding exercises and the Playground.
4. The whole DSA section gets the same modern UI as the redesigned sections.
5. The section covers beginner to advanced in depth, with anything else that helps a reader understand.

## The owner's decisions

- **The quiz gate is soft.** A pass marks the chapter done. A reader may still mark it done without passing; the chapter then shows as read but not checked.
- **Existing read marks stay done.** Only new marks go through the quiz.
- **One release.** The frame, the quizzes, the player and every chapter's visual ship together, along with the content fixes, the new chapters and the deeper chapters.
- **Every chapter gets its own player,** inside the chapter.

## Key findings

**Content**
- There are 34 chapters: 10 beginner, 12 intermediate and 12 advanced. All are written, with 277 exercises.
- Depth runs the wrong way: advanced chapters average about 2,075 words, intermediate about 781 and beginner about 914.
- Real errors:
  - The string-search code uses a NUL separator that browsers drop.
  - The code-line highlight never fires in any demo.
  - Two recursion and DP diagrams are wrong.
  - O and Ω are taught as worst case and best case.
  - The queue advice contradicts itself.
  - Three chapters promise topics they do not teach.
- **Gaps:**
  - **Beginner:** prefix sums, math basics.
  - **Intermediate:** BST operations, grid BFS, DP state machines and knapsack.
  - **Advanced:** SCC, bridges, LCA and binary lifting, sparse table.
  - **Ordering:** recursion is taught after sorting.

**Code**
- DSA has no UI code of its own. It renders through the shared old reader (Shell, ReaderShell, CoverSheet, CoverMap, ChapterSheet), like 17 other topics.
- Eight chapters have demos. Seven of them are copies of one inline script with baked-in steps; one computes its steps live.
- The "read" flag lives in `jsnotes:progress`. XP, badges, streaks, review scheduling, covers and the drawer all read it.
- The saved level (`jsnotes:level`) is one global key shared by every topic.
- No auto-graded quiz exists anywhere on the site.

**Research**
- DSA prep sites let learners pick a track. Adaptive placement comes from ALEKS, Khan, Duolingo and Brilliant.
- Mastery learning helps, but hard locks raise drop-out.
- What a learner does with a visualisation (predict, change the input, build) matters more than what it shows. Control of the pace has the biggest effect.
- Record each run once as a list of steps, as Python Tutor does, so stepping back and forward is instant.
