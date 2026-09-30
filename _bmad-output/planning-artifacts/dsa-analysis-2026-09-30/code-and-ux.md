# DSA section: code and UX analysis for the rebuild

Read-only analysis of `/Users/akshat/Desktop/groundwork` on `feature/dsa-plan` (clean, HEAD 925ed3b), done 30 Sep 2026. No project file was changed. All paths are repo-relative, and `file:line` refers to the current tree.

---

## 1. Routing and page composition

### 1.1 What `app/dsa/` contains

| File | What it does |
| --- | --- |
| `app/dsa/page.tsx:1-12` | `TopicCoverPage topicId="dsa"` plus `topicCoverMetadata` |
| `app/dsa/[chapter]/page.tsx:1-19` | `generateStaticParams → topicChapterParams("dsa")` (34 params), metadata, `TopicChapterPage`. `dynamicParams` is left at its default of `true`, so an unknown slug is still a soft 404 until TP-0 lands. |
| `app/dsa/[chapter]/loading.tsx` | `ChapterSkeleton` |
| `app/dsa/opengraph-image.tsx` | `topicOgImage("dsa", "Every classic interview pattern, two pointers to segment trees")` |
| `app/dsa/search-index.json/route.ts` | `searchIndexResponse("dsa")`, force-static |
| layout | **none**. There is no `app/dsa/layout.tsx`. |

These files are byte-identical to the other 17 generic topics apart from `TOPIC` (topics.md §1.1). DSA owns no UI code. Every pixel comes from shared components.

### 1.2 Render tree (shared by all 18 topics)

```
TopicCoverPage (components/reader/topicPages.tsx:12-28)
  ReaderShell ("use client", 449 lines) → Shell variant="focused" (old 268px sidebar)
    HashRedirect (old #chapter anchors → /dsa/<id>)
    CoverSheet (CoverSheet.tsx:39-71) → routeGroups by level (19-37) → CoverMap
TopicChapterPage (topicPages.tsx:73-100)
  ReaderShell → ChapterSheet (ChapterSheet.tsx:7-98)
    badge, h1, Listen, body via dangerouslySetInnerHTML (49)
    PracticeStrip (62), foot: prev / ChapterDone checkbox (82) / ↑ Cover / next
```

- `ReaderShell` receives `chapters={chapterMetas(topicId)}` (`topicPages.tsx:20,87`). `chapterMetas` is every `Chapter` field except `body` (`lib/content.ts:88-90`). **Every field on `Chapter` is serialised into the client payload of every DSA page.** This matters for where quiz data lives (§8).
- After mount, ReaderShell's effect on `[mounted, activeId]` runs `activateScripts`, `enhanceCodeBlocks`, `enhanceTables`, `enhanceTryBlocks` and `setupNarration` over `#chapters` (`ReaderShell.tsx:164-172`). It also owns the global keys: `/` search, `] n` next, `[ p` previous, `t` top. The key handler ignores only INPUT/TEXTAREA/SELECT targets (`ReaderShell.tsx:183-202`).
- `CoverMap` (`CoverMap.tsx:29-227`) shows the read score, a meter, "Start here / Continue" to the first unread ready chapter (48, 105-109), the reading budget `jsnotes:reading-budget` (9, 112-134), level "routes" of stations, a **read tick button per station** (182-193) and a peek panel.

### 1.3 `/level/dsa` and `/path?topic=dsa`

- `/level/dsa` is `app/level/[topic]/page.tsx:37-68` → `LevelView` (`app/level/LevelView.tsx`). It sits on the old Shell. It shows three **self-report** level cards linking to `/path?topic=dsa&level=<id>` and calls `rememberLevel` on click (66-71), then `Syllabus` and "Three honest notes". This is where the home shelf card sends DSA readers (`app/page.tsx:12-14`). The drawer offers both `/dsa` and `/level/dsa` (`components/SiteDrawer.tsx:37`).
- `/path?topic=dsa&level=X` is `app/path/page.tsx:16-53` → `PathClient` (client-only, `null` until mounted, `PathClient.tsx:84`). The page builds `chapterById` for **every** topic (21-50). That is the 300 KB flight payload in performance.md:88.
  - It shows the steps from `levelRows(level)` (`lib/levelRows.ts:7-24`), with a "mark as read" checkbox per step (224-235), exercises per step and per level, and "Reset my progress", which wipes every topic (149-160).
  - It calls `rememberLevel(level.id)` on every visit (69).
- DSA levels come from `content/topics.ts:2473-2714`: Beginner 10 sections (B1-B10), Intermediate 12 (I1-I12), Advanced 12 (A1-A12). Each syllabus section maps 1:1 to a chapter id. The chapter order in `content/dsa-notes.ts:48-83` is B→I→A, so "start from the beginning" is simply chapter order.

### 1.4 What "like the other sections" means in code

- `PageFrame` (`components/frame/PageFrame.tsx:18-87`) takes `title`, `links`, `skipLabel` and `scan`. It renders the `.head-back` pill, the menu → `SiteDrawer`, the brand and `useScrollFx` (Lenis plus `data-fx`). Back is hard-coded to `/` "Home" (48). Users are review, progress and privacy.
- `components/series/SeriesLanding.tsx` (git) and `ChapterView.tsx` (git and architecture) form the newer reader: a rail with part folds and read counts, a ≤780px article, a TOC card with an active heading, a header pager, an end card with "Mark as read" (`ChapterView.tsx:376-395`) and a second aside button (463-475), `withHeadingIds` h3 ids, and the same enhancements and narration (118-126).
- **Architecture proves that a generic `notesData` topic can already render on `ChapterView`**. `app/architecture/[chapter]/page.tsx` reuses `topicChapterParams` and `topicChapterMetadata`, then maps `chapterMetas` to cards and passes `withHeadingIds(chapter.body)`. DSA could follow the same pattern today.
- `TopicFrame`, `ChapterRail`, `TocCard`, `ChapterEnd`, `PartSection` and `useReadingPlan` **do not exist yet**: `rg` over app, components and lib finds none. The topic-redesign epic is planned but not started (§6).

---

## 2. Progress model: what "read" is today and who reads it

### 2.1 Storage (`lib/storage.ts`)

- `KEYS` (3-14): `jsnotes:progress`, `jsnotes:level`, `jsnotes:activity` and others.
- `jsnotes:progress` has the shape `{ chapters: Record<chapterId, true | { at: number; reviews: number }>, exercises: Record<exerciseId, true> }` (43-51). Chapter ids are **flat and unprefixed** across topics. DSA ids all start with `dsa-`. Git uses `GIT_PROGRESS_PREFIX`.
- `setChapterDone(id, done)` (119-128) writes `{at: now, reviews: 0}`, calls `recordActivity()` (a module-private function, 89-95) on a false→true flip, and emits to `progressListeners`. **It has no notion of topic, gate or reason.**
- Review: `REVIEW_GAPS_DAYS = [3,7,21,60,180]` (62). `dueAt` (69-73), `dueForReview` (130-138) and `markReviewed` (140-148) all hang off the same chapter mark.
- Level: `rememberLevel` and `lastLevel` store **one global string** in `jsnotes:level` (192-198). Picking a level on any topic changes it for every topic. It drives `navHref` (`lib/topicNav.tsx:59-65`), so Shell, DailyRecap and TopicOfDay links go to `/path?topic=X&level=<saved>`. It also sets the ReaderShell fold (`ReaderShell.tsx:62`) and LevelView's highlight (`LevelView.tsx:38`).
- Hooks: `useProgressValue` is `useSyncExternalStore(progress.subscribe, …)` (`lib/hooks.ts:51-53`). Callers serialise to strings to keep snapshots stable (for example `CoverMap.tsx:38`).

### 2.2 Every surface that writes the "read" flag

| Surface | Evidence | Topic scope |
| --- | --- | --- |
| Chapter foot checkbox | `components/reader/ChapterDone.tsx:15-18`, rendered at `ChapterSheet.tsx:82` | all 18 generic topics |
| Cover station tick | `components/reader/CoverMap.tsx:182-193` | all 18 |
| Path step checkbox | `app/path/PathClient.tsx:224-235` | every topic with levels |
| Series end card and aside | `components/series/ChapterView.tsx:392, 470` | git, architecture |
| Interview round | `app/interview/[chapter]/RoundView.tsx:279` | interview |
| Reset | `PathClient.tsx:154-155` → `progress.reset()` wipes everything | global |

### 2.3 Every surface that reads it

- **Home**: `app/HomeView.tsx:270-271`, with `computeStats` and the due count.
- **Drawer**: `components/SiteDrawer.tsx:138-139`.
- **Shell sidebar**: `components/Shell.tsx:133-134, 165` (done count, due count, next chapter).
- **Progress**: `app/progress/ProgressView.tsx:202-206`, plus per-topic rings built from ready chapter ids in `app/progress/page.tsx:17-29`.
- **Review**: `app/review/page.tsx:17-31` builds rows from every ready chapter. `ReviewView.tsx:140` reads the marks, and `:123,263` calls `markReviewed`.
- **Streaks, XP and badges**: `lib/gamification.ts:24-71`. `chaptersRead` is the count of marks (28). XP = exercises×10 + chapters×5 + reviews×3 (54). Badges "Bookworm" (10 read) and "Scholar" (50) at 110-117. `StreakMini.tsx:12`.
- **Covers and landings**: `CoverMap`, `SeriesLanding.tsx:43-50`, `ArchitectureView.tsx:127-135`, `InterviewLanding.tsx:142`, `PathClient.tsx:88-90,201`.
- **Search**: it does not read progress. The per-topic index is built from the body with `<script>` stripped (`components/reader/searchIndex.ts:20-27`).

### 2.4 What a quiz gate on "mark done" has to change

1. **Enforce it in the UI, not in `lib/storage`.** `setChapterDone` is shared by 6 surfaces and 5 features. Keep it unchanged, and have the quiz pass call `progress.setChapterDone(id, true)`. Review scheduling, XP, badges, rings, streak activity and the due counts then all keep working with no change.
2. **Replace the three DSA-reachable write surfaces**: ChapterDone (chapter foot), the CoverMap tick and the PathClient checkbox. For a gated topic, each becomes "Take the check →" and shows "passed ✓ / read" once the chapter is marked. CoverMap and ChapterDone do not know the topic today: CoverMap gets only `groups` and `basePath` (`CoverSheet.tsx:57`), and ChapterDone gets only `chapterId`. So either thread a `completion` policy prop through them or, better, give DSA its own cover and reader (§9) so the shared ones stay untouched.
3. **Keep the policy in data.** Add an optional `completion?: "tick" | "quiz"` field to `Topic` in `content/types.ts:20-33` (topics.ts is server data, and it does not ride in `chapterMetas`). Shared pages such as `/path` branch on `topic.completion`, not on `topicId === "dsa"`.
4. **Unmarking** should stay free. It only deletes the mark.
5. **Grandfathering**: existing `jsnotes:progress.chapters["dsa-*"]` marks must be kept. Deleting them would take back XP and badges and empty the review queue. Show them as "read (no check yet)".
6. **Placement must not write read marks.** If the placement ticked N chapters through `setChapterDone`, it would add N×5 XP, record N activity hits for today (`storage.ts:125`), possibly award "Bookworm", and schedule N chapters for review in 3 days. Store "placed out" in its own key (§8).
7. **Level**: do not overload the global `jsnotes:level`. A DSA placement of "advanced" would re-route every other topic's links. `PathClient.tsx:69` already overwrites it on every path visit, which is an existing cross-topic coupling. Store the DSA level per topic and navigate to `/path?topic=dsa&level=X` explicitly.
8. `recordActivity` is not exported. If a quiz attempt or the placement should count toward the streak, export a narrow `activity.record()`.
9. Any new store must notify `progressListeners`, or share an emitter with them. Otherwise `computeStats` consumers (home, drawer, progress, StreakMini) will not refresh when a quiz is passed. This only matters if the quiz store itself feeds XP. If the pass goes through `setChapterDone`, it already emits.

---

## 3. Existing interactive and visual machinery

### 3.1 Enhancements (`components/reader/enhancements.ts`, 131 lines)

- `enhanceCodeBlocks` (41-65) wraps **every `pre`** in the container with `.codeblock` and adds a copy button. `enhanceTables` (67-74) wraps **every `table`**.
- `activateScripts` (76-85) re-creates every `<script>` so inline chapter scripts execute. It needs CSP `'unsafe-inline'` (`next.config.ts`).
- `enhanceTryBlocks` (87-131): `.try` → "▶ Run this" through `lib/runner`. DSA uses it once, in complexity-analysis.
- These are imperative DOM mutations over the whole container. **A React island placed inside that container would have its `pre` and `table` rewritten under it.** A React player must either avoid those tags or the enhancers must skip a marker such as `[data-island]`. That is a small edit to a shared file.

### 3.2 DSA step-through demos (8 chapters)

| Chapter | Demo id | Lines | Views |
| --- | --- | --- | --- |
| two-pointers | `tp` | markup 151-175, script 177-276 | code, array cells, sum panel |
| sliding-window | `sw` | 158, 188-287 | code, cells, panels |
| binary-search | `bs` | 154, 180-279 | code, cells |
| heaps | `hp` | 268, 294-393 | code, **array only (no tree)** |
| monotonic-stack | `ms` | 341, 371-470 | code, cells, stack chips |
| union-find | `uf` | 424, 450-549 | code, **parent array only (no forest)** |
| dp-2d | `dp` | 307, 330-429 | code, grid (31 steps) |
| graphs traversal | `gt` | 206-233, 234-304 | hand-written SVG graph, BFS/DFS select, queue/stack and order chips |

- Seven of the eight are **one generated template**: `var ID`, `CODE[]` and a JSON `STEPS[]` of `{cells:[{v,c,p}], panels, grid?, note}`, followed by about 70 lines of identical render code repeated in each file. The step data is a ready-made spec for a data-driven player.
- **Latent bug:** the template highlights the code row where `row.dataset.n === s.line` (`dsa-two-pointers.ts:226`), but **no step in any DSA demo has a `line` key**. `grep '"line":'` returns 0 across all eight, so the code-line highlight never fires.
- **Accessibility:** controls are real `<button>`s, so they are keyboard-operable. But **7 of 8 notes have no `aria-live`**; only `gt-note` has it (`dsa-graphs-representation-traversal.ts:231`). Cell state (lo/hi/in/out/done) is conveyed by colour and opacity only, and `.viz__cell--out { opacity: .4 }` (`app/globals.css:8100-8102`) is a likely axe contrast failure once DSA pages join the a11y suite. The progress bar is decorative.
- **Reduced motion:** the global rule kills transitions and animations (`globals.css:3816-3827`). "Play" auto-advance is a user-started `setInterval(1100ms)`, and nothing clears it on navigation. It stops itself at the last step.
- **Re-init:** the template guards with `dataset.demoInit`. The graph demo has **no guard** (`dsa-graphs…:234-304`). Under dev StrictMode's double effect run, `activateScripts` would bind its listeners twice. This is dev-only and plausible, not verified in a browser.
- **Styling** (global, shared with the JS and React chapters): `.demo*` (`globals.css:3135-3204`), `.loop-grid/.loop-code/.loop-bar/.loop-box/.loop-frame*` (3304-3405), `.viz/.viz__cell*/.viz__grid/.viz__gcell*` (8028-8141), `.viz-edge/.viz-vertex` (around 9005-9035), `.viz-tree/.viz-node` (8838-8940, React only). All of it uses theme tokens.
- **Narration** skips `.demo` through `SPEECH_EXCLUDE` (`components/reader/narration.ts:3`). A new player must sit inside `.demo` or the exclude list must grow.
- **e2e depends on them:** `e2e/smoke.spec.ts:237-240` drives `#gt-mode`, `#gt-next` and `#gt-order .loop-frame` (expects 7).

### 3.3 The 3D closure diagram (JS topic, not DSA)

`content/js/closures.ts:44-97` holds the `.c3d` planes, pointer-drag rotation, tilt and turn range inputs (with aria-labels) and the same step controls. Its CSS is at `globals.css:8676-8835`, with a reduced-motion override at 8830. It shows the pattern for drag plus sliders. On a Lenis-driven frame such demos need `[data-no-smooth]`, which `lib/scrollFx.ts:21` already honours.

### 3.4 Reuse or replace?

Reuse the **visual vocabulary** (cell, grid, vertex and edge states, loop chips) and port the **STEPS data**. Replace the **mechanism** with a React player. The reasons:

- The template repeats 70+ lines per chapter.
- It cannot take reader input (it plays one fixed example).
- It has no line highlight, weak a11y and no tree or forest views.
- It relies on `activateScripts` and `'unsafe-inline'`.
- It is untestable in vitest.

Keep the old global classes, because the JS and React chapters still use them. Port DSA's eight demos and delete their inline scripts in the same stories, updating the `#gt-*` e2e test.

---

## 4. Quiz-like machinery that already exists

There is **no auto-graded multiple-choice engine anywhere**. A grep for correct, choices, answerIndex and multiple-choice found nothing relevant. What can be reused:

| Piece | Where | Reuse for |
| --- | --- | --- |
| Flashcard `Drill` | `app/interview/questions/QuestionBank.tsx:39-160` | Session shell ("Card i of n", bar, Stop), keyboard handler (space or Enter reveals, 1/2/3 marks, Esc exits, guarded by `closest("input, textarea, [role=dialog]")`), end tally screen, `shuffle` (30-37) |
| Confidence store | `lib/interviewConfidence.ts:1-65` | A `useSyncExternalStore` store with a `cachedRaw` snapshot cache and cross-tab `storage` events. This is the template for a quiz store. It is self-assessed, not graded. |
| Review `Session` | `app/review/ReviewView.tsx:64-137` | Focus-card session UI, the "Session done" screen and `Confetti`. Optionally, a DSA chapter check could replace "✓ I still had it" with a real 3-question check. |
| Mock `ChoiceCards` | `app/mock/ChoiceCards.tsx:180-226` | `aria-pressed` option cards. Good for the placement entry choice (Take the quiz / Start from the beginning / I'll pick). **Not** for answers, which need native radios in a fieldset and legend. |
| Adaptive thresholds | `lib/mock/adaptive.ts:4-24` (`RAISE_AT = 0.8`, `LOWER_BELOW = 0.45`, `rank`, `shiftFor`) | The staged placement: start at intermediate, go harder at ≥0.8, easier below 0.45. |
| Versioned store and snapshot | `lib/mock/storage.ts:49-80` (`version === 1` guard, snapshot cache, subscribe) | The shape and versioning of the placement and quiz stores |
| Scoring | `lib/mock/scoring.ts:61-78` | Weighted rubric and `codingScore`. The quiz needs a simpler got/total, so reuse the idea, not the code. |
| Confetti, sound | `components/practice/Confetti.tsx`, `lib/sound.ts` (`jsnotes:sound-enabled`) | Pass feedback |

Content hook: **every DSA chapter ends with a "Before you move on" checklist** (`.bx.is-ref`, 33 found; for example `dsa-two-pointers.ts:278-288`). These are ready-made seeds for the chapter-check questions.

---

## 5. Practice and exercises tied to DSA

- `Chapter.practice: string[]` lists exercise ids (for example `dsa-two-pointers.ts:9-22`). `Exercise.chapter` points back (`content/types.ts:92-103`). There are **277 DSA exercises** in `content/practice/dsa-1..8.ts` (about 980 KB of source), aggregated by `content/practice/dsa.ts` and `content/practice.ts`. Per chapter they range from 24 (arrays-strings) down to 2 (MST, interview strategy).
- `exercisesForChapter` (`lib/content.ts:108-112`) feeds `PracticeStrip` (`components/reader/PracticeStrip.tsx:15-47`, with solved ticks from `progress.isExerciseSolved`), which links to `/problems/<id>` (`lib/problemHref.ts`).
- `/problems?topic=dsa&level=…` filtering already exists (`app/problems/ProblemsView.tsx:69-102,173-181`). e2e covers it at `smoke.spec.ts:696-703`.
- The mock picks DSA coding items for backend roles (`lib/mock/loops.ts:269`).
- **Known bug:** a DSA problem's breadcrumb says JavaScript (`components/practice/PracticeWorkspace.tsx:1180`, ux-a11y.md:392-393).
- The Playground (`/practice?id=free`) is a free JS editor with no chapter links.
- **Keeping "play" separate:**
  - Do not model play entries as `Exercise`. They would show up in `/problems`, the mock bank, `tests/content.test.ts` practice wiring, the `exerciseCount` claims (`tests/claims.test.ts:16,27-30,48-50`) and `jsnotes:code:` keys.
  - Give play its own registry keyed by chapter.
  - Give it its own "Watch it run" strip beside, not inside, `PracticeStrip`.
  - **Naming risk:** "Play" and "Playground" (the drawer and footer link, `PathClient.tsx:291`) will be confused. Consider "Step through" or "Visualise" in the UI.

---

## 6. The planned topic redesign and where DSA sits in it

`_bmad-output/initiative-groundwork-overhaul/epic-topic-redesign/` covers CAP-3, 4, 5 and 8. The epic waits on epic-audit-fixes entries 1.2-1.5; only 1.1, the CV removal, looks done (commit 925ed3b). **No TP story has started.**

| Story | Touches DSA? |
| --- | --- |
| TP-0 (entry 2) routing fixes | Yes: `dynamicParams = false` on all 18 `[chapter]` routes including `/dsa/[chapter]`, and level stats counting written chapters only |
| TP-1 (entry 1) TopicFrame and extracted parts | Indirectly. Adds PageFrame props (back, titleHref, mark, accent, actions, reading, layout, skipHref). Extracts ChapterRail, TocCard, ChapterEnd, ChapterPager, ChaptersSheet, useActiveHeading, useChapterKeys, DiagramDefs, PartSection and ChapterCard. Only `/notes` moves. |
| **TP-3 (entry 3) chapter reader** | **Yes, all written chapters including DSA's 34.** Its acceptance requires the "React and DSA demo" e2e to pass and Lenis to cope with the demos. |
| **TP-2 (entry 4) cover** | **Yes, `/dsa` is one of the four written covers.** Adds a `useReadingPlan` hook lifted out of CoverMap, and PartSection and ChapterCard. |
| TP-4 (5), TP-5 (6) | Outline topics only, not DSA |
| **TP-6 (7) level page** | **Yes, `/level/dsa`** moves onto TopicFrame and marks the saved level |
| **TP-7 (8) path page** | **Yes, `/path` for DSA** becomes static per-topic and per-level segments, and Reset moves to the foot |
| TP-8 (9) series on the frame | No (git and architecture) |
| TP-9 (10) delete Shell, ReaderShell, CoverSheet, CoverMap, ChapterNav and the global CSS | Yes, as a consumer. DSA must not depend on anything slated for deletion. |

The brief's must-not-regress list (topics.md §3.5) applies to DSA too: mark and unmark through `setChapterDone`, review scheduling, search keys, narration, demos, PracticeStrip, zoom, print, HashRedirect, metadata, sitemap and a11y under reduced motion. So does the target IA (topics.md §3.3a-d), which includes a cover "Up next" card that holds the budget control, a footer link to interview round R7, and a chapter end card showing "Comes back for review in 3 days".

**Implication:**
- The DSA placement card, chapter-check end card and player islands are **extensions of TP-2, TP-3, TP-6 and TP-7**, not parallel inventions.
- Build them as **slots** on the TP-1 and TP-3 parts. For example, `ChapterEnd` takes a `completion` render prop, the TopicCover hero takes an aside slot, and the reader body takes islands.
- DSA then becomes the first consumer with non-default slots, and the other topics adopt the same components with defaults.

---

## 7. Tests and performance today

### Tests

- **e2e:** DSA appears only in the demo test (`smoke.spec.ts:237-240`, `#gt-*`) and the problems filter (`smoke.spec.ts:696-703`).
  - `/dsa` and any DSA chapter are **not** in smoke `PAGES` (`smoke.spec.ts:10-28`) or a11y `PAGES` (`e2e/a11y.spec.ts:4-26`).
  - The generic tick test runs on `/notes` (`smoke.spec.ts:70-75`, `.station__tick`). A DSA-only gate leaves it intact.
  - The review flow seeds `jsnotes:progress` directly (`smoke.spec.ts:921-940`).
- **vitest:**
  - `tests/content.test.ts` covers chapter integrity and practice wiring for every topic.
  - `tests/search-index.test.ts` and `tests/seo.test.ts` cover the index, sitemap and canonical rules.
  - `tests/claims.test.ts` asserts numbers stated in `content/architecture/`: chapter and exercise counts (21-71), smoke and a11y page and test counts (112-134), the number of CSS modules and the largest one, and the globals.css line count to the hundred (85-110). **Adding DSA pages to smoke or a11y, adding CSS modules, or growing globals.css forces edits to arch-testing and arch-design-system in the same story.** New storage keys make `arch-state.ts:12` ("Thirty-one localStorage keys") and its tables (80-125) stale. That text is not asserted, but the spec says to keep it true.
  - Nothing tests the DSA demos' step data.

### Performance (audit-2026-09-28/performance.md)

- DSA chapters ship the same first load as every topic page: 682 KB raw / 209 KB gz (line 69). That includes Radix Select from Shell (37 KB gz, lines 49 and 269). Moving DSA off Shell drops it.
- Chapter content is **not** shipped as JS (line 79). The body is in HTML plus the RSC flight, about 1.5× (line 85). DSA bodies average about 20 KB of source, and the largest is `dsa-dp-2d.ts` at 67 KB.
- `/path` ships `chapterById` for all 540 chapters, about 300 KB (lines 88 and 247). TP-7 fixes this.
- `content/practice` is 1.7 MB and 389 KB gz, loaded only by the mock Room (lines 36 and 252). Never import it into a DSA client component.
- The ReaderShell progress bar animates `width` (line 180, `ReaderShell.tsx:144`). ChapterView uses `scaleX`.
- The search index is fetched only on the first query (line 203).

---

## 8. Recommended architecture

### 8.1 Quiz data: where it lives and its schema

- **Not on `Chapter`.** Anything on `Chapter` rides in `chapterMetas` into every DSA page's client payload (§1.2) and into `/path`'s all-topic `chapterById`.
- Put it in `content/dsa/quiz/<chapter-id>.ts`, 34 files, one per chapter. That keeps edits local, matches the chapter files and keeps diffs small.
- Put the placement in `content/dsa/placement.ts`.
- Put shared types in `content/quiz-types.ts`.
- Add a server-only loader, `lib/quiz.ts`, with `chapterQuiz(id)` and `placementBank()`. Pass **only that chapter's slice** as props from the server page to the client runner, the same way `ChapterSheet` computes `exercises` on the server (`ChapterSheet.tsx:20-25`).
- Answer keys will sit in that page's payload. That is acceptable on a static, self-study site with no backend. Say so honestly in the UI copy.

```ts
export interface QuizChoice { id: string; html: string }
export interface QuizQuestion {
  id: string;                 // "dsa-two-pointers/sorted-needed", stable across edits
  chapter: string;            // chapter id; the placement uses it to allot chapters
  level: LevelId;
  kind: "single" | "multi";   // later: "order", "predict-step" (links to a play frame)
  prompt: string;             // HTML, same escaping rules as chapter bodies
  code?: string;              // rendered without <pre> inside islands, or with the enhancer skip
  choices: QuizChoice[];      // 3–5
  answer: string[];           // choice ids
  explain: string;            // HTML shown after answering, can link "#h3-id" in the chapter
  skill?: "recognise" | "complexity" | "trace" | "edge-case";
}
export interface ChapterQuiz { chapter: string; draw: number; passAt: number; questions: QuizQuestion[] } // e.g. pool 8, draw 5, pass 4
export interface PlacementBank { stages: LevelId[]; perStage: number; questions: QuizQuestion[] } // ≥ 2 per chapter
```

Add vitest integrity tests alongside `tests/content.test.ts`:

- every ready DSA chapter has a quiz, and `questions.length ≥ draw`
- `answer` ⊂ `choices`, and ids are unique
- every `chapter` exists
- every placement stage has enough questions
- no empty `explain`
- HTML tags are balanced, as the content test already checks for bodies

### 8.2 Quiz and placement state: storage keys

Use the newer `groundwork:` prefix, versioned like `lib/mock/storage.ts`, with a `useSyncExternalStore` store copied from the `lib/interviewConfidence.ts` pattern.

- `groundwork:quiz` = `{ version: 1, chapters: Record<chapterId, { attempts: number; best: number; lastAt: number; passedAt: number | null; missed: string[] }> }`. The key is generic, so other topics can opt in later with `topic.completion = "quiz"`.
- `groundwork:dsa:placement` = `{ version: 1, takenAt: number, mode: "quiz" | "beginning" | "self", level: LevelId, scores: Record<LevelId, [got, of]>, placedOut: string[], allotted: string[] }`.
  - "Start from the beginning" writes `mode: "beginning"`, `allotted = all 34` and `placedOut = []`.
  - The presence of this key is what the "first visit" check uses.
- **The read mark stays in `jsnotes:progress`.** On a pass, the runner calls `progress.setChapterDone(id, true)`, so review, XP, badges, rings, streak and the drawer all work unchanged.
- The placement never writes `jsnotes:progress`, and it does not set the global `jsnotes:level`.
- On the cover and path, `placedOut` chapters show as "tested out". They count toward "covered" but not toward XP or review.
- The in-progress attempt stays in React state. It is short, so it needs no key.
- Update `content/architecture/arch-state.ts`: the key count and tables.

**Placement flow:**

- A pure `lib/quiz/placement.ts` implements a staged, adaptive test using the RAISE_AT and LOWER_BELOW idea from `lib/mock/adaptive.ts:4-5`. Move those two constants to a shared lib rather than importing from mock.
  - Stage 1 is 4 intermediate questions.
  - Score ≥0.8 → 4 advanced questions. Below 0.45 → 4 beginner questions. Otherwise, a beginner check.
  - Each question carries a `chapter`.
  - The level is the highest stage passed.
  - Allotted = every chapter at or above the level, plus lower-level chapters whose question was missed.
  - It is pure and vitest-tested.
- **Entry points:**
  - The `/dsa` cover shows a placement card when `groundwork:dsa:placement` is absent **and** the reader has no `dsa-*` marks. It offers "Find my starting point (≈6 min)", "Start from the beginning" and "I'll pick a level". These are `ChoiceCards`-style buttons.
  - `/level/dsa` puts the same card above the three self-report cards.
  - Never auto-redirect deep links to `/dsa/<chapter>`. That would break search, SEO, e2e and the back button.
  - The placement runs at a static route, `app/dsa/placement/page.tsx`. A static segment wins over `[chapter]`, and every chapter id starts with `dsa-`, so there are no collisions.

### 8.3 Chapter check (the gate)

`components/quiz/`:

- `QuizRunner` takes questions, draw, passAt and onFinish. It uses a seeded shuffle and one question at a time: `fieldset`, `legend`, native radios or checkboxes, Check, then the explanation, then Next.
  - Keys 1-4 select an answer and Enter checks or advances. The keys are scoped to focus inside the runner, never global, because `n`, `p`, `t`, `[`, `]` and `/` are taken by the reader.
  - Feedback goes to `aria-live="polite"`.
- `QuizResult` shows the score, a per-question review and Retry (a fresh draw). On a pass it shows Confetti and marks the chapter read.
- Styles go in `quiz.module.css` with tokens only.
- The runner sits in the chapter's end card (TP-3's `ChapterEnd` with a `completion` slot) and is reachable at `#check`.
- On `/path?topic=dsa` and the DSA cover, the tick becomes "Take the check →" linking to `/dsa/<id>#check`. It shows ✓ when marked, with "passed" or "read before checks" depending on `groundwork:quiz`.

### 8.4 Play engine

**Model.** A pure tracer produces frames, and a generic React player renders them.

- `lib/play/types.ts`:
  - `Frame = { line?: number; note: string; array?: Cell[]; grid?: Cell[][]; graph?: {nodes, edges, state}; tree?: TreeNode; chips?: Record<string, string[]>; vars?: Record<string, string | number> }`
  - `Algorithm<I> = { id; title; chapter; code: string[]; defaultInput: I; parse(text): I | string; trace(input: I): Frame[]; maxN }`
- `lib/play/algorithms/<id>.ts`: tracers written as pure functions. Port the eight existing STEPS as the first set. Tracers are testable in vitest: the final frame equals the reference answer, every frame has a note, and `line` falls within `code.length`.
- `lib/play/registry.ts`: `{ id, chapter, title, load: () => import("./algorithms/<id>") }`. All 34 chapters share one route (`app/dsa/[chapter]/page.tsx`), so a static import of every tracer would ship all of them to every DSA chapter.

**Components** (`components/play/`):

- `Player` handles controls (Back, Next, Play/Pause, Reset, speed) and a labelled range scrubber "Step n of N". Its note uses `aria-live="polite"`. Arrow keys, space, Home and End work when focus is inside it. It pauses on unmount and on `visibilitychange`, and has no autoplay.
- Views: `ArrayView`, `GridView`, `GraphView` (SVG), `TreeView` and `ForestView` (new, for heaps and union-find), `ChipsView`, `CodeView` (an `<ol>` with an `aria-current` line, not a `pre`) and `VarsView`.
- Every cell gets a text state, such as `aria-label="7, lo pointer"`, so state is not colour-only. Use full-opacity "out" styling that passes contrast.
- The root is `class="demo"` plus `data-no-smooth` plus `data-island`, which covers narration, Lenis and the enhancers.

**Modes:**

- **Embed** in a chapter: fixed input, compact.
- **Full page** at `/dsa/play/[algo]`: editable input, "Predict the next move" (asks before revealing a frame, which reuses the QuizRunner choice UI), and a link back to the chapter and its exercises.
- **Gallery** at `/dsa/play`.
- None of this touches `Exercise`, `/problems`, `jsnotes:code:` or `setExerciseSolved`.

**Embedding in chapter HTML:**

- The body carries a placeholder: `<div data-play="two-pointers" data-input='{"a":[2,4,7,11,15,19,24],"target":22}'></div>`.
- The DSA chapter page (server) runs `withHeadingIds(body)` first, then `splitIslands(html)` into `[html, island, html, …]`. It renders HTML segments with `dangerouslySetInnerHTML` and islands as `<PlayIsland algo input />` (client), which server-renders the first frame, so there is no layout jump or empty box.
- Shared edit: `enhancements.ts` skips `pre` and `table` inside `[data-island]`. That is two `closest` checks, harmless for the other 17 topics, since no content uses the attribute today.
- The search index already sees nothing in an empty placeholder.
- A portal-after-mount approach (`createPortal` into placeholders) is the fallback if splitting fights TP-3's reader. It is simpler but gives no SSR frame.

---

## 9. Files a DSA rebuild would touch

**DSA-owned (safe):**
- `app/dsa/page.tsx`, `app/dsa/[chapter]/page.tsx` (+ `dynamicParams = false`), new `app/dsa/placement/page.tsx`, `app/dsa/play/page.tsx`, `app/dsa/play/[algo]/page.tsx` (+ opengraph for each)
- `content/dsa/*.ts`: 8 chapters swap inline scripts for `data-play` placeholders. `content/dsa/quiz/*.ts` (new, 34 files), `content/dsa/placement.ts` (new), `content/quiz-types.ts` (new).
- New `lib/quiz.ts`, `lib/quiz/placement.ts`, `lib/quiz/store.ts`, `lib/play/*`, `components/quiz/*`, `components/play/*`, plus CSS modules.

**Shared (edit with care, optional props or defaults only):**
- `content/types.ts` (`Topic.completion?`)
- `content/topics.ts` (the DSA entry)
- `components/reader/enhancements.ts` (island skip)
- `components/reader/narration.ts` (`SPEECH_EXCLUDE`, if the player is not `.demo`)
- `components/reader/topicPages.tsx` (only if DSA stays on it)
- `ChapterDone.tsx`, `CoverMap.tsx`, `CoverSheet.tsx` (only if they gain a completion policy instead of DSA getting its own cover and reader)
- `app/path/PathClient.tsx` (gate-aware tick)
- `app/level/[topic]/page.tsx` and `LevelView.tsx` (placement card slot)
- `lib/storage.ts` (export `activity.record`, if wanted)
- `components/frame/PageFrame.tsx` or the TP-1 `TopicFrame` and extracted parts
- `components/series/ChapterView.tsx` (`completion` and `afterBody` slots, if DSA piggybacks on it before TP-1)
- `app/sitemap.ts` and `tests/seo.test.ts` (new routes)
- `app/globals.css` (only additions, or none if using modules)

**Tests and docs:**
- `e2e/smoke.spec.ts`: add `/dsa`, a chapter, `/dsa/placement` and `/dsa/play/two-pointers` to `PAGES`; add placement → Continue and check → pass → marked → review flows; update `#gt-*`.
- `e2e/a11y.spec.ts` (`PAGES`)
- `tests/content.test.ts` or a new `tests/quiz.test.ts`, `tests/play.test.ts`
- `tests/claims.test.ts` does not change, but the chapters it checks do: `content/architecture/arch-testing` (spec counts), `arch-design-system` (CSS module count, largest module, globals lines), `arch-state` (keys), `arch-routes` (new routes), and `arch-overview` if the topic table changes
- `.cspell/project-words.txt` (append only)

---

## 10. Risks

1. **Shared components serve all 18 topics.** These are topicPages, ReaderShell, Shell, CoverSheet, CoverMap, ChapterSheet, ChapterDone, PracticeStrip, enhancements, narration, searchIndex, `lib/content`, `lib/storage`, `lib/hooks`, `/level` and `/path`. Any DSA-only behaviour must be opt-in through data (`topic.completion`) or DSA-owned route files. Never branch on `topicId === "dsa"` inside a shared component, and never change a default.
2. **Collision with the topic-redesign epic.** TP-2, TP-3, TP-6 and TP-7 will rewrite the same DSA cover, reader, level and path. Forking a DSA-only reader now means TP-3 either duplicates it or has to reconcile. Recommendation:
   - Land TP-1 first: the frame and extracted parts.
   - Build DSA as the first consumer of TP-2 and TP-3 shaped components with slots.
   - Or, if DSA must ship first, follow architecture's route (its own route files on `components/series/ChapterView` with optional slots) and let TP-8 carry it along.
   - Nothing in DSA may depend on CoverMap, ReaderShell or Shell, which TP-9 deletes.
3. **Progress side effects.** Placement must not call `setChapterDone` (XP, activity, badges and a review flood). Keep existing DSA marks. Keep the gate in the UI.
4. **The global level key.** Do not reuse `jsnotes:level` for placement, because it re-routes every topic.
5. **Payload.** Keep quiz data off `Chapter` and `chapterMetas`, keep `content/practice` out of client DSA code, and lazy-load tracers per algorithm.
6. **DOM enhancers versus React islands.** `pre` and `table` get wrapped. Narration and Lenis need excludes.
7. **Keyboard collisions** with the reader's global `n`, `p`, `t`, `[`, `]` and `/`. Scope player and quiz keys to focus.
8. **a11y.** DSA pages are not in the axe suite today. `.viz__cell--out` at 40% opacity and the colour-only states will probably fail once they are added. Run axe with reduced motion (an AGENTS.md pitfall).
9. **The claims test and the architecture chapters** must move with every added page, test, CSS module or key (an AGENTS.md pitfall).
10. **e2e selectors**: `#gt-*` (the demo test) and `.station__tick` (on `/notes` only; it stays valid if DSA gets its own cover).
11. **Naming**: "Play" versus "Playground".
12. **Honesty**: a client-side gate is bypassable and answer keys are in the payload. That is fine for a self-study site, but the copy should not overclaim "verified".
