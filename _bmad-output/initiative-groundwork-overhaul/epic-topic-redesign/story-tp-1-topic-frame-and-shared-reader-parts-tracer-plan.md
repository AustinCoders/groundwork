---
title: 'TP-1 · Topic frame and shared reader parts (tracer)'
type: 'refactor'
ticket: '1'
created: '2026-09-30'
status: 'built'
route: 'full'
route_source: 'auto'
review: 'thorough'
review_source: 'auto'
lenses_ran: ['blind-hunter', 'edge-case-hunter', 'verification-gap', 'intent-alignment']
review_loop_iteration: 0
followup_review_recommended: true
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/planning-artifacts/audit-2026-09-28/topics.md']
warnings: ['oversized']
deferred:
  - summary: >-
      On every topic cover the "Skip to" link's #main hash fires hashchange, and HashRedirect forwards the reader to /<topic>/main, a 404.
    evidence: |-
      components/reader/HashRedirect.tsx forwards any hash matching [a-z0-9-]+ to basePath/id. Shell's skip link (href "#main") and the covers' HashRedirect were already together on all 18 covers before this change; /notes keeps both. Fix: skip ids that exist in the document, e.g. if (document.getElementById(id)) return. Fits epic-topic-redesign entry 2 (topic routing and data fixes).
    location: >-
      components/reader/HashRedirect.tsx:10-16
    severity: medium
baseline_revision: '52fb382a0143540a4d846c27eebc13a82d5aa308'
---

<intent-contract>

## Intent

**Problem:** Topic pages still use the old notebook `Shell` and `ReaderShell`. The redesigned pages (Review, Progress, Privacy) use `PageFrame`, and the git and architecture series have their own reader in `components/series/ChapterView.tsx`. The later topic stories need one frame and shared reader parts to build on (topics.md §3.2, §3.4).

**Approach:**
- Give `PageFrame` optional topic props and add a thin `TopicFrame`.
- Extract the series reader's parts, and the series landing's part section and chapter card, into shared components, without changing how git and architecture look or behave.
- As the tracer, render the `/notes` cover's existing content inside `TopicFrame`. The other 17 covers and every chapter page stay on Shell.

## Boundaries & Constraints

**Always:**
- New `PageFrame` props, all optional, with existing call sites (`app/privacy/page.tsx`, `app/progress/ProgressView.tsx`, `app/review/ReviewView.tsx`) unchanged:
  - `back?: { href; label }` feeds the BackButton fallback, still `/` and `Home` by default;
  - `titleHref?` makes the title a link, as `BookShell` does;
  - `mark?` and `accent?` add a topic chip beside the title, with `--accent: var(--c-<accent>)` built in a template string the way `SiteDrawer`'s `accentVar` does;
  - `actions?: ReactNode` on the right of the header;
  - `reading?: boolean` passes `reading` to `SiteDrawer` and renders `DiagramDefs` once;
  - `layout?: "page" | "reader"`: `page` keeps the 1180px main, `reader` is full width;
  - `skipHref?`, default `#main`.
- `components/topic/TopicFrame.tsx` takes a topic (name, cover href, mark, accent) plus `back`, `actions`, `reading`, `layout`, `skip` and `scan`, and renders `PageFrame`.
- Shared parts go in their own files under `components/chapter/`, and `ChapterView` renders them:
  - `ChapterRail`;
  - `TocCard` with `useActiveHeading`;
  - `ChapterEnd`;
  - `ChapterPager`;
  - `ChaptersSheet`, keeping `FocusTrap`, `id="chapters-sheet"`, the trigger's `aria-controls` and Escape closing it;
  - `useChapterKeys`;
  - `DiagramDefs`.
- `SeriesLanding` renders a shared `PartSection` and `ChapterCard`.
- These parts keep using the existing class names from `components/series/chapter.module.css` and `landing.module.css`. This story does not split the CSS; entry 3 does. So the git and architecture pages stay pixel-identical, and class-bound e2e selectors (`[class$='__progress']`, `[class*='__endMark']`) still match.
- `ReaderShell` drops its inline SVG defs and renders the shared `DiagramDefs`, so there is one copy.
- `/notes` renders `HashRedirect` and the existing `CoverSheet` inside `TopicFrame`, with:
  - `back` Home;
  - the title "JavaScript" linking to `/notes`;
  - mark "JS", accent yellow;
  - `reading` on;
  - layout `page`.
  The cover sits in a wrapper that keeps `zoom: var(--reader-zoom)`. The other 17 covers keep `TopicCoverPage` unchanged.
- `tests/seo.test.ts` keeps importing `components/reader/topicPages` without pulling a CSS module into its graph. Switch `/notes` in `app/notes/page.tsx` or a new component, not inside `topicPages.tsx`.
- Every number `tests/claims.test.ts` asserts stays true: the CSS module count, the globals size and the test counts. Chapters whose prose says every topic cover uses Shell, or that the diagram defs live only in the reader shell, are corrected. `arch-repo-map.ts` is a dated snapshot and stays.
- No comments. Theme tokens only.

**Never:**
- Do not move any other cover, any chapter, `/level`, `/path` or `/soon` off Shell.
- Do not restyle the git or architecture pages.
- Do not delete `Shell`, `ReaderShell`, `CoverSheet` or `CoverMap`.
- Do not add the cover redesign (Continue action, chapter rail on the cover); entry 4 owns that.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Tracer cover | `/notes` at 1440 and 390 | `header a.head-back` labelled Home. Menu button. Title "JavaScript" links to `/notes`, with a JS chip. The cover content (h1, lead, CoverMap with mark-read and score) is unchanged. No `#site-sidenav` | No error expected |
| Old hash link | `/notes#closures` | Still forwards to `/notes/closures` | No error expected |
| Site menu on `/notes` | Menu opened | It holds Text size, Narrator and Print, and Text size zooms the cover | No error expected |
| Series unchanged | `/git`, `/git/merge`, `/architecture`, `/architecture/arch-request-path`, `/review` and `/progress` at 1440 and 390 | The same pixels as before the change, and every git, architecture, keyboard and smoke test passes | A difference is reported with its page and width |
| Other covers | `/react`, `/dsa` | Still on Shell, with the sidebar | No error expected |
| a11y | `/notes` in the a11y spec | Passes in all nine themes at 1440 and 390 | Same |

</intent-contract>

## Code Map

- **`components/frame/PageFrame.tsx`** (87 lines):
  - Props are at L18-30.
  - The skip link is hard-coded to `#main` at L42.
  - The BackButton is fixed to `/` and Home.
  - The title is a plain `span.title`.
  - `SiteDrawer` is rendered without `reading` at L84.
  - Its CSS is `components/frame/frame.module.css` (`.title` at L77-81, `.main` max-width at L108-112). Put the title link, the chip and the reader layout here; do not add a new CSS module unless it is needed.
  - The title-link pattern to copy is `app/interview/BookShell.tsx:62-65` together with `book.module.css:78-83`.
- **`components/series/ChapterView.tsx`** (528 lines). The parts to extract, by line:
  - `DiagramDefs` at 38-67 (exported; `SeriesLanding.tsx:10` imports it);
  - the rail state at 186-197 and the rail JSX at 199-251;
  - `useActiveHeading` at 138-170 (it sets `pct`, `active` and the header progress bar);
  - `useChapterKeys` at 172-184 (Escape closes the sheet);
  - `ChapterEnd` at 380-403;
  - `ChapterPager` at 405-427;
  - the TOC card, Mark-as-read and footer at 431-500;
  - `ChaptersSheet` at 504-524, with its trigger at 274-283.
  - The types `SeriesCard`, `SeriesPart` and `TocItem` are at 18-36, and `lib/gitSeries.ts:3` imports `SeriesCard`. Move these types with the parts and update the imports.
  - `ChapterView` is rendered by `app/git/[section]/page.tsx:35-46` and `app/architecture/[chapter]/page.tsx:38-48`.
  - CSS gotcha: `--hover` is declared only on `.page`, and the sheet renders outside `.page`. Keep this behaviour as it is.
- **`components/series/SeriesLanding.tsx`**: `PartSection` is L120-158 and `ChapterCard` is L139-153, both using `landing.module.css` classes. It is only used by `app/git/page.tsx`. `app/architecture/ArchitectureView.tsx` has its own copy; leave it for entry 9.
- **`components/reader/ReaderShell.tsx:219-257`**: the inline SVG defs to replace with the shared `DiagramDefs`.
- **`/notes` today:**
  - The chain is `app/notes/page.tsx:11` → `components/reader/topicPages.tsx:12-28`, where `TopicCoverPage` renders `ReaderShell` containing `HashRedirect` and `CoverSheet`, and `CoverSheet` renders `CoverMap`.
  - `topicCoverMetadata` stays shared.
  - The zoom comes from `div#chapters` (`globals.css:940-942`).
  - The topic mark and accent are in `content/topics.ts:504-505` (`JS`, `yellow`).
  - What the cover loses with Shell until entry 4: the sidebar search and the "Switch topic" list, the sidebar widgets, DailyRecap, the FAB, the red progress bar, and the `/`, `[` and `]` keys.
- **Tests to retarget or extend.** Retargeting keeps every count.
  - `e2e/keyboard.spec.ts` L43-62 (closed sidebar) and L64-80 (open sidebar) use `/notes` and `#site-sidenav`. Move both to `/notes/setup-mental-model`, which stays on Shell; its sidebar search box is also "Search the notes".
  - `e2e/a11y.spec.ts` L62-71, state "the sidebar open" on `/notes`: move it to `/notes/setup-mental-model` as well.
  - `e2e/smoke.spec.ts`:
    - L946-949, the head-back loop: add `/notes`.
    - L70-75: mark-read on the cover (`.station__tick`, `.covermap__score-num`).
    - L1083-1107: the cover accent link.
    - Both must still pass.
- **`tests/theme-roles.test.ts`:**
  - `SOURCE_MARKER_FILLS` (L141-144) is keyed by `components/reader/ReaderShell.tsx` and `components/series/ChapterView.tsx`, and every key must be an existing file. Re-key it to the file that holds `DiagramDefs`, and drop the keys that no longer contain markers.
  - `CATEGORICAL_SELECTORS` keeps `components/series/landing.module.css` as it is.
- **`tests/claims.test.ts`** asserts the CSS module count, 17 today, in `arch-design-system.ts:260` and `arch-tech-stack.ts:24`, and globals.css at "about 9,600". If a module is added or globals passes 9,650 lines, update both.
- **Prose to correct:**
  - `content/architecture/arch-design-system.ts:223-232` ("Two page shells": Shell, "Eleven files render it") and `:271-273` (the defs "defined once in the reader shell");
  - `arch-routes.ts:21` and `:254-257` ("every topic cover and chapter" use Shell);
  - `arch-rendering.ts:25-80`, the cover path through ReaderShell: mention that `/notes` now renders in `TopicFrame`.
- **Before and after screenshots:**
  - Before changing any code, take full-page screenshots from a production build of the baseline, with reduced motion and the light theme. Cover `/review`, `/progress`, `/git`, `/git/merge`, `/architecture` and `/architecture/arch-request-path` at 1440 and 390.
  - Repeat after the change and compare pixel by pixel with a scratch script outside the repo.
  - Record the result in the Implementation Notes.
- **Runs:** port 3100 is e2e's. Use 3200 or higher for your own servers; never 3000.

## Tasks & Acceptance

**Execution:**
- [x] `components/frame/PageFrame.tsx`, `frame.module.css`, `components/topic/TopicFrame.tsx` -- the optional topic props and the thin frame -- the shared frame
- [x] `components/chapter/*` (new), `components/series/ChapterView.tsx`, `SeriesLanding.tsx`, `lib/gitSeries.ts`, `app/architecture/[chapter]/page.tsx` -- extract the reader parts, the part section and the chapter card, with the same markup and classes -- reuse
- [x] `components/reader/ReaderShell.tsx` -- use the shared `DiagramDefs` -- one copy
- [x] `app/notes/page.tsx`, and a cover component if needed -- the `/notes` cover inside `TopicFrame` -- tracer
- [x] `e2e/keyboard.spec.ts`, `e2e/a11y.spec.ts`, `e2e/smoke.spec.ts`, `tests/theme-roles.test.ts` -- retarget the sidebar tests, add `/notes` to the head-back loop, re-key the marker fills -- tests
- [x] `content/architecture/arch-design-system.ts`, `arch-routes.ts`, `arch-rendering.ts` -- truthful prose; claims numbers kept -- truth

**Acceptance Criteria:**
- Given `/notes` at 1440 or 390, when it loads, then it shows the labelled Home back pill, the menu button and the "JavaScript" title linking to `/notes`, with the cover content and mark-read working, no Shell sidebar, and it passes the a11y spec in all nine themes.
- Given `/review`, `/progress`, `/git`, `/git/merge`, `/architecture` and `/architecture/arch-request-path`, when screenshotted before and after at 1440 and 390, then the pixels match.
- Given `npm run check`, `npm run build` and `npm run test:e2e`, when they run, then all pass, including the architecture, git, keyboard, head-back and a11y tests.

## Implementation Notes

- **Frame.** `PageFrame` takes the optional `back`, `titleHref`, `mark`, `accent`, `actions`, `reading`, `layout` and `skipHref`, and `scan` is typed `string | number | null`. The chip resolves its accent through `accentVar` in `lib/accent.ts`, which `SiteDrawer` uses too (`mint` → green, `ink` → `--ink`, otherwise `` `var(--c-${name})` ``). The title link carries `aria-current="page"` on its own page. A topic title truncates with an ellipsis and the chip stays whole; plain titles keep their old CSS, because clipping them cut the tail of Privacy's "y". When printing, the header and scroll bar are hidden, and the drawer's Print action closes the drawer (`flushSync`) before `window.print()`. `layout="reader"` adds `.mainReader` (no max width, no padding). `TopicFrame` has no `"use client"`, so server pages can render it; its `skip` defaults to `Skip to <name>`.
- **Shared parts** in `components/chapter/`: `types.ts`, `DiagramDefs`, `ChapterRail` (plus `useRailParts`, which keeps the aside rail and the sheet on one open-parts state as before), `TocCard` (the whole right aside), `useActiveHeading(toc, barRef)`, `useChapterKeys({ prevHref, nextHref })`, `ChapterEnd`, `ChapterPager`, `ChaptersSheet` (closes itself on Escape) with `ChaptersSheetButton`, `PartSection` and `ChapterCard`. They import `components/series/chapter.module.css` and `landing.module.css`, so there are still 17 modules.
- **`/notes`** is built in `app/notes/page.tsx`: `TopicFrame` wraps `HashRedirect` and `<div id="chapters">`, which reuses the global `#chapters` zoom rule, around `CoverSheet`. `topicPages.tsx` is unchanged.
- **Prose.** `arch-rendering.ts` said 67 files carry `"use client"`. It was already 78 at baseline and is now 84, so the chapter now says 84.
- **Screenshots.** Production builds, reduced motion, light and dark, full page at 1440×900 and 390×844, compared byte by byte and then pixel by pixel.
  - The baseline was shot twice to find the noise floor. `/progress` at 390 dark changed 38 px of card-corner anti-aliasing between the two runs.
  - `/review`, `/privacy`, `/git`, `/git/merge` and `/architecture/arch-request-path` are byte-identical at both widths in both themes.
  - `/progress` is identical at 1440. At 390 the same corner flicker (38–48 px) shows up; seven of eight reshoots matched the baseline byte for byte.
  - `/architecture` differs only in content. The repo-stats row changed from 33,034 lines in 297 files to 33,344 lines in 309, which is the 12 new files. The reading minutes changed for I3 (7 → 8) and I13 (17 → 18), the chapters whose prose this story corrects. No frame or style pixel moved.
  - `/react` at 1440 differs only in the sidebar clock, as it does between two baseline runs.
- **Runs.** `npm run check` passes (307 unit tests). `npm run build` passes. `npm run test:e2e` gives 149/149, and a second full run after the last prose edit also gave 149/149.
- **Matrix test.** A new smoke flow, "the /notes cover renders in the topic frame", covers the tracer-cover, old-hash-link, site-menu and other-covers rows of the I/O matrix. It checks for the head-back pill, the JavaScript title link to `/notes`, no `#site-sidenav`, `/notes#closures` landing on `/notes/closures`, Text size setting `--reader-zoom` to 1.1 and the cover's computed zoom, and `/react` still having `#site-sidenav`. It adds one to the asserted counts: smoke goes from 68 to 69 tests and from 48 to 49 flows, and the browser total from 149 to 150, updated in `arch-testing.ts` and `arch-health.ts`. `tests/claims.test.ts` passes (32), and the new test passes on a fresh build.
- **Review fixes.**
  - `SeriesCard` and `SeriesPart` take a level type that defaults to `LevelId`, so the architecture cards need no cast. Git's parts are not beginner, intermediate or advanced, so `content/git-body.ts` now types them as `GitPartLevel`, and `gitCards()` returns `SeriesCard<GitPartLevel>`. The components accept any level.
  - The new a11y state "the reading menu open" runs on `/notes` at both widths. It makes 10 states (6 opened by a click), 69 a11y tests and 152 browser tests.
  - `claims.test.ts` now derives the `"use client"` count (84) and the Shell-renderer count (six) from the source.
  - Smoke assertions were added inside existing flows; there are still 49.
  - Verified with tsc, eslint, the comments, spelling and format checks, `claims` and `theme-roles`, and the 50 affected e2e tests on a fresh build.
  - Screenshots were retaken with the clock fixed at the baseline's time. `/review`, `/privacy`, `/progress`, `/git`, `/git/merge` and `/architecture/arch-request-path` match the baseline; `/progress` at 390 shows only the known corner flicker. `/architecture` differs only in its figures.

## Plan Change Log

- `TocCard` renders the whole right aside (TOC card, Mark as read, Back to top, keys), matching the extraction range L431-500.
- `ChaptersSheet.tsx` also exports the trigger (`ChaptersSheetButton`). `ChapterRail.tsx` also exports `useRailParts`, so the rail's open state stays shared between the aside and the sheet.
- `app/architecture/[chapter]/page.tsx` types its cards as `SeriesCard` and drops the cast to `ArchitectureView`'s `ChapterCard`.
- In `arch-routes.ts`, the first column of the route figure is relabelled from "With the Shell" to "Pages". It lists the home page, `/git`, `/review`, `/progress` and `/mock`, and none of them use the Shell any more.

## Review Triage Log

### 2026-09-30 — Review pass
- verdicts: 35 findings — high 0, medium 9, low 21, false 5, maybe-false 0
- findings:
  - `[low]` `[patch]` PageFrame adds a fourth copy of the accent resolver, and the copies have drifted — one shared `accentVar` in lib/, used by PageFrame and SiteDrawer.
  - `[low]` `[reject]` `reading` renders DiagramDefs, so a reader that keeps its own copy inside the frame would duplicate the ids — nothing duplicates today; entries 3 and 9 drop the series copies when they adopt the frame, which owns the defs.
  - `[medium]` `[patch]` Printing /notes prints the sticky header, the scroll bar and the open drawer, where the Shell printed clean — print rules hide `.top` and `.scrollBar`; the drawer closes before printing.
  - `[low]` `[patch]` The new prose says TopicFrame turns on the reading controls, that every other cover and chapter is on the Shell, and that /notes left the Shell first — corrected.
  - `[low]` `[patch]` "Two page shells", the route figure and its closing line know two frames where there are three — corrected.
  - `[low]` `[patch]` The route figure's relabelled column is vague — corrected.
  - `[low]` `[patch]` "Most" `"use client"` files belong to the three big surfaces, false at 84 — corrected.
  - `[low]` `[patch]` claims.test.ts does not assert the `"use client"` or Shell-renderer counts, which had drifted — both counts derived and asserted.
  - `[medium]` `[patch]` No axe run covers the reading-mode site menu now on /notes — an a11y state opens it on /notes with the reading folds, at both widths.
  - `[low]` `[patch]` The new /notes smoke flow skips Narrator, Print, the chip and the back label — assertions added.
  - `[low]` `[patch]` The title link points at the current page with no `aria-current` — set when the path matches.
  - `[low]` `[patch]` `scan?: unknown` crosses the server-to-client boundary — narrowed to `string | number | null`.
  - `[low]` `[patch]` `SeriesCard.level` lost the level union, and two things are named ChapterCard — union restored; the ArchitectureView interface goes with entry 9, which replaces that copy.
  - `[low]` `[patch]` `.titleMarked { min-width: 0 }` has no effect, so long names wrap in the header at 390 — the title truncates.
  - `[low]` `[patch]` Defaults are repeated in PageFrame, TopicFrame and /notes — PageFrame owns them.
  - `[medium]` `[defer]` The `#main` skip link fires `hashchange`, and HashRedirect sends the reader to `/notes/main`, a 404 — pre-existing on all 18 covers (Shell's skip link and the covers' HashRedirect were already together); belongs to entry 2 (topic routing fixes).
  - `[medium]` `[patch]` The drawer and header print over the cover — same print entry.
  - `[low]` `[patch]` Self title link has no `aria-current` — same entry.
  - `[false]` `[reject]` The /notes cover loses search, the FAB and the keys without notice — the ticket scopes the tracer to the cover's existing content, and the plan's Design Notes record the loss until entry 4.
  - `[low]` `[patch]` The prose says TopicFrame enables the reading controls — same prose entry.
  - `[medium]` `[patch]` Regression gap: DiagramDefs could stop mounting, or mount twice, with every test green (pre-verified) — `#wob` and the three markers counted as 1 on /notes, /react, an architecture chapter and /git.
  - `[medium]` `[patch]` Regression gap: `[` and the pager hrefs are untested (pre-verified) — `[` and both pager cards asserted in the architecture flow.
  - `[medium]` `[patch]` Regression gap: `useRailParts` is never observed (pre-verified) — the current part is open and a head toggles.
  - `[medium]` `[patch]` Regression gap: the read counts from the extracted parts are never asserted (pre-verified) — "1 of" in Finish, and the /git card tick and "1/" part count.
  - `[low]` `[patch]` Regression gap: the JS chip could vanish with the /notes test green (pre-verified) — the chip asserted.
  - `[false]` `[reject]` The shared parts are not yet shaped for the topic reader and cover (no search slot, `barRef`, hard-coded hints, no tick button) — the ticket extracts them for entries 3 and 4, which adapt them as their consumers.
  - `[false]` `[reject]` The open question about splitting the CSS is not tested — the plan keeps the parts on the existing modules and records why; entry 3 splits them.
  - `[low]` `[reject]` `actions`, `layout="reader"`, a custom `skipHref` and a custom `back` are untested — nothing uses them yet; entries 3 and 4 exercise and test them.
  - `[medium]` `[patch]` The reading drawer on /notes is never axe-scanned — same axe entry.
  - `[false]` `[reject]` The keyboard tests pass because they were retargeted — /notes left the Shell; the tests now run on a Shell page with the same markup.
  - `[low]` `[reject]` `/architecture` is not pixel-identical — only its figures moved: the repo stats count this story's new files, and two reading times follow the corrected prose.
  - `[low]` `[patch]` Prose beyond the ticket (Shell and "use client" counts, relabel) — same prose and claims entries.
  - `[false]` `[reject]` TopicFrame requires a topic, so it cannot be the site-wide header — the brief generalises PageFrame as the shared frame and keeps TopicFrame thin.
  - `[low]` `[patch]` The copied accent resolver — same accent entry.
  - `[low]` `[patch]` The sheet's Escape depends on the consumer wiring `useChapterKeys` — the sheet closes itself on Escape.

## Design Notes

- The tracer proves the frame on a real topic without moving any reader feature yet. The Shell sidebar's search, widgets and keys are left behind on `/notes` only until entry 4 builds the real cover. The ticket scopes the tracer to "only the /notes cover's existing content". The `/notes` chapters, where the search tests run, keep Shell until entry 3.
- Keeping the extracted parts on the existing CSS modules answers the ticket's open question. Nothing moves between modules in this story, so git and architecture stay pixel-identical, and entry 3 splits the CSS once the topic reader needs it.

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: pass.
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build && PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run test:e2e` -- expected: all pass.

**Manual checks:**
- Compare the before and after screenshots for the six series and frame pages at 1440 and 390; they must match pixel for pixel.

## Auto Run Result

**Summary:** `PageFrame` gained optional topic props (`back`, `titleHref`, `mark`/`accent`, `actions`, `reading`, `layout`, `skipHref`), and a thin `TopicFrame` fills them in. Eleven parts extracted from `components/series/ChapterView.tsx` and `SeriesLanding.tsx` now live under `components/chapter/`, on the same CSS modules, so git and architecture stay pixel-identical. As the tracer, `/notes` renders inside `TopicFrame`; the other 17 covers and every chapter stay on Shell.

**Files changed:**
- `components/frame/PageFrame.tsx`, `frame.module.css`: the new props, the title chip and link, print rules, truncation.
- `components/topic/TopicFrame.tsx` (new): the thin topic wrapper.
- `components/chapter/*` (11 new files): `DiagramDefs`, `ChapterRail`, `TocCard`, `useActiveHeading`, `useChapterKeys`, `ChapterEnd`, `ChapterPager`, `ChaptersSheet` (+ trigger), `PartSection`, `ChapterCard`, `types`.
- `components/series/ChapterView.tsx`, `SeriesLanding.tsx`: rewired onto the shared parts, same markup and classes.
- `components/reader/ReaderShell.tsx`: renders the shared `DiagramDefs` instead of its inline copy.
- `app/notes/page.tsx`: the `/notes` cover inside `TopicFrame`.
- `app/architecture/[chapter]/page.tsx`, `lib/gitSeries.ts`, `content/git-body.ts`: use the moved, now-generic `SeriesCard<Level>`/`SeriesPart<Level>`.
- `lib/accent.ts` (new): one shared `accentVar`, used by `PageFrame` and `SiteDrawer`.
- `e2e/smoke.spec.ts`, `e2e/keyboard.spec.ts`, `e2e/a11y.spec.ts`: a new smoke test for the `/notes` frame, retargeted sidebar tests, a new reading-menu a11y state, and assertions for diagram defs, rail parts, pager hrefs and read counts.
- `tests/claims.test.ts`, `tests/theme-roles.test.ts`: counts for `"use client"` files and Shell renderers; re-keyed marker fills.
- `content/architecture/arch-design-system.ts`, `arch-rendering.ts`, `arch-routes.ts`, `arch-testing.ts`, `arch-health.ts`: truthful prose for three frames, the moved diagram defs, and the a11y/browser test counts.

**Review findings:** 35 findings (medium 9, low 21, false 5). Fourteen entries patched: print CSS, a reading-menu a11y state, six smoke-test gaps (diagram defs, `[` and pager hrefs, rail-part state, read counts, the JS chip, back label/Narrator/Print), a shared `accentVar`, `aria-current` on the self title link, title truncation, the `scan` type and repeated defaults, the `SeriesCard` level type, `ChaptersSheet` owning its own Escape, six prose corrections, and two new claims counts. One item is deferred (frontmatter `deferred`): the pre-existing `#main` skip-link/HashRedirect conflict on every topic cover, which belongs to entry 2. The rest were rejected as out of scope for the tracer or already covered — see the Review Triage Log.

Two fixes deviated from the exact wording asked for, with reasons recorded by the implementer: `SeriesCard<Level extends string = LevelId>` instead of a hard union (git's parts use different level names than topics), and title truncation applied only to the marked topic title's own span, not every `.title`, to keep `/privacy`, `/review` and `/progress` pixel-identical.

**Follow-up review:** recommended (`true`), since 9 medium entries were patched. The patch round's own new code has not been reviewed: the print flow (`flushSync` before `window.print()`), the reading-menu a11y state, and the six smoke-test additions.

**Verification:** `npm run check` passes (19 files, 309 unit tests). `npm run build` passes. `npm run test:e2e` passes 152/152 on port 3100. Before-and-after screenshots at 1440 and 390, light and dark, reduced motion: `/review`, `/privacy`, `/progress`, `/git`, `/git/merge` and `/architecture/arch-request-path` match the baseline (the implementer's second screenshot pass, with the clock fixed after the date rolled to 1 Oct). `/architecture` differs only in the repo-stats numbers and two reading times, which follow this story's own new files and corrected prose.

**Residual risks:**
- `TopicFrame` and the new `PageFrame` props (`actions`, `layout="reader"`, a non-default `back` or `skipHref`) are exercised only through `/notes`'s subset of them; entries 3 and 4 are the first real consumers of the rest.
- The shared parts (`ChapterRail`, `TocCard`, etc.) are shaped for today's series reader, not yet adapted for a search slot or a tick-button chapter card; entries 3 and 4 adapt them.
- Whether `chapter.module.css` and `landing.module.css` split cleanly for the topic reader is still open; this story kept everything on the existing modules to guarantee pixel identity, so the question carries to entry 3.
