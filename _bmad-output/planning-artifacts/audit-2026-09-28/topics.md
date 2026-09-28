# Topic pages: audit and redesign brief

Audited 28 Sep 2026 on `feature/app-audit` (build `R2vJGS5Tp_3eN83ee1B7I`, served with `next start -p 3200`). Read-only: no repo files changed.
Screenshots: `scratchpad/audit/shots/` (list in §2.1). Scripts: `shoot.mjs`, `verify.mjs`, `montage.mjs`, `counts.ts`, `body.ts` in `scratchpad/audit/`.

---

## 0. Summary

**What exists.** There are 18 "generic" topic routes (`/notes` for JS plus 17 others). They are identical 4-file clones that call `components/reader/topicPages.tsx`, which renders the old `Shell` sidebar frame through `ReaderShell`, with `CoverSheet`/`CoverMap` for the cover and `ChapterSheet` for chapters. Four of them are fully written (JS 41, React 57, DSA 34, System Design 24, so 156 chapters). The other 14 are outline-only (358 outline chapters, 0 written). Architecture and Git use the newer `components/series` reader. The Interview book has its own `BookShell`. `/level/[topic]`, `/path` and `/soon` also still use `Shell`.

**Top problems**
1. **Two frames.** Topic pages keep the old 268px `Shell` sidebar with the clock, weather, today's pick and eight site links. The chapter list only starts at y≈760 of 900 and is below the fold. There is no labelled back pill and no scroll-fx. Every redesigned page uses a full-width header with `.head-back`, the `SiteDrawer` and scroll-fx.
2. **Reading measure.** At 1440px a chapter paragraph is 994px wide at 17–18px, about 110 characters a line. The series reader caps the article at 780px.
3. **No in-chapter navigation.** The h3 sections have no ids: 0 of 11 on `/notes/closures`. So there is no TOC, no section deep links and no position in the header ("13 / 41"). Prev/next only appears at the very bottom. "Mark as read" is a small checkbox.
4. **Covers are long flat lists.** JS has 41 rows and React 57, with no subtitles, no level blurbs, no exercise counts, and a peek panel that only works at the top. Outline covers show broken states: "0 / 0 chapters read", "0 min of reading left", useless budget chips, an empty dashed peek box, and a column of "—".
5. **Mobile.** The notebook sheet (44px ring-hole gutter plus 18px right padding at ≤720px) inside the 18px shell padding cuts text to about 294px (≈35 characters a line) and squeezes tables. The hamburger opens the old sidebar (clock first). There is no quick chapter or section access.
6. **Broken routing and data** (§1.7):
   - `/soon` never renders. Every topic is `status: "ready"`, so `SoonClient` bounces outline topics to `/level/<id>`, which asks "How much TypeScript do you already have?" for a topic with nothing written.
   - The `/path` sidebar lists **540 chapters from every topic** under `/notes/…` links that soft-404.
   - The level cards claim "~16 min" for 0 written chapters.
   - Unknown chapter slugs return HTTP 200 (soft 404).
7. **Two header generations inside the "redesigned" set.** Series pages (git/architecture) use an icon back button with no brand. PageFrame/BookShell/Mock use the `.head-back` pill plus brand plus title plus links. The topic redesign should follow the second and pull the series pages along.

**Proposed stories (in order, detailed in §3.6).**
- TP-0 correctness fixes
- TP-1 TopicFrame (generalised PageFrame) plus extraction of shared reader parts from `components/series`
- TP-2 topic cover
- TP-3 chapter reader
- TP-4 outline chapter plus skeleton
- TP-5 outline-topic landing (replaces /soon)
- TP-6 level page
- TP-7 path page
- TP-8 series headers converge on TopicFrame
- TP-9 cleanup (delete Shell/ReaderShell and their CSS, migrate error/not-found, rewrite the architecture chapters that describe the old reader)

---

## 1. Inventory

### 1.1 Route map

The generic topic folders are byte-identical apart from `const TOPIC`. I confirmed this with a diff against `app/react/*`. Each has:

- `app/<route>/page.tsx`, which does `generateMetadata → topicCoverMetadata(TOPIC)` and renders `<TopicCoverPage topicId>`.
- `app/<route>/[chapter]/page.tsx`, which has `generateStaticParams → topicChapterParams` (all chapters, including outlines), `generateMetadata → topicChapterMetadata` and renders `<TopicChapterPage>`. `dynamicParams` is left at its default of `true`.
- `app/<route>/[chapter]/loading.tsx`, which renders `ChapterSkeleton`.
- `app/<route>/search-index.json/route.ts`, which returns `searchIndexResponse(TOPIC)` (force-static).
- `opengraph-image.tsx` exists only for notes, react, dsa and system-design.

The URL base comes from `topic.notes` in `content/topics.ts` (`"notes.html"` → `/notes`), through `notesHref` in `lib/topics.ts`.

| Route | Topic id | Data | Chapters (written / outline) | Exercises | Levels → `/level`, `/path` | Cover component | Chapter component |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/notes` | js | `content/notes.ts` + `content/js/*` (41 files) | 41 / 0 (incl. `★ cheat`, in all 3 levels) | 99 | yes (17/11/12 syllabus sections) | TopicCoverPage → ReaderShell → CoverSheet → CoverMap | TopicChapterPage → ReaderShell → ChapterSheet |
| `/react` | react | `content/react-notes.ts` + `content/react/*` (57) | 57 / 0 (incl. `★ react-cheat`) | 162 | yes (11/22/23) | same | same |
| `/dsa` | dsa | `content/dsa-notes.ts` + `content/dsa/*` (34) | 34 / 0 | 277 | yes (10/12/12) | same | same |
| `/system-design` | system-design | `content/system-design-notes.ts` + `content/system-design/*` (24) | 24 / 0 | 0 | yes (7/9/8) | same | same |
| `/html` | html | `content/html-notes.ts` | 0 / 22 | 0 | yes | same | same (outline state) |
| `/css` | css | `content/css-notes.ts` | 0 / 25 | 0 | yes | same | same |
| `/typescript` | typescript | `content/typescript-notes.ts` | 0 / 29 | 0 | yes | same | same |
| `/nextjs` | nextjs | `content/nextjs-notes.ts` | 0 / 29 | 0 | yes | same | same |
| `/node` | node | `content/node-notes.ts` | 0 / 41 | 0 | yes | same | same |
| `/nestjs` | nestjs | `content/nestjs-notes.ts` | 0 / 26 | 0 | yes | same | same |
| `/databases` | databases | `content/databases-notes.ts` | 0 / 25 | 0 | yes | same | same |
| `/testing` | testing | `content/testing-notes.ts` | 0 / 24 | 0 | yes | same | same |
| `/security` | security | `content/security-notes.ts` | 0 / 24 | 0 | yes | same | same |
| `/docker` | docker | `content/docker-notes.ts` | 0 / 22 | 0 | yes | same | same |
| `/cloud-devops` | cloud-devops | `content/cloud-devops-notes.ts` | 0 / 24 | 0 | yes | same | same |
| `/graphql` | graphql | `content/graphql-notes.ts` | 0 / 22 | 0 | yes | same | same |
| `/redis` | redis | `content/redis-notes.ts` | 0 / 21 | 0 | yes | same | same |
| `/kubernetes` | kubernetes | `content/kubernetes-notes.ts` | 0 / 24 | 0 | yes | same | same |
| `/architecture` | architecture | `content/architecture-notes.ts` + `content/architecture/*` | 26 / 0 | 0 | has levels in topics.ts, so `/level/architecture` and `/path?topic=architecture` are generated even though it is off-shelf | `app/architecture/page.tsx` → `ArchitectureView` (lane map + repo stats) | `app/architecture/[chapter]/page.tsx` → `components/series/ChapterView` |
| `/git` | git | `content/git-body.ts` + `content/git/*` (not in `NOTES_BY_TOPIC`) | 18 / 0 in 4 parts | 0 | no levels | `app/git/page.tsx` → `SeriesLanding` | `app/git/[section]/page.tsx` → `ChapterView` (`dynamicParams = false`) |
| `/interview` | interview | `lib/interviewContent` / `lib/interviewBook` | 27 rounds | 0 | no | `BookShell` + `InterviewLanding` | `BookShell` + `RoundView` |
| `/level/[topic]` | all with levels + ready | `lib/content` | — | — | — | `app/level/[topic]/page.tsx` → `LevelView` (Shell + `Syllabus` + `ChapterNavSection` + `Crumbs`) | — |
| `/level?topic=` | — | — | — | — | — | `app/level/page.tsx` client redirect to `/level/<id>` | — |
| `/path?topic=&level=` | any | `app/path/page.tsx` builds `chapterById` for **all** topics | — | — | — | `PathClient` (Shell, client-only, `null` until mounted) | — |
| `/soon?topic=` | any | `topic.planned` (empty for every topic) | — | — | — | `SoonClient` (Shell, client-only) | — |

Totals: 156 written plus 358 outline chapters on generic topics, then 26 architecture, 18 git and 27 interview. That makes 227 written, which matches the architecture page. There are 538 exercises in total.

Chapter bodies (written) all use `h3` for sections: JS 372, React 529, DSA 281, System Design 212. There is no `h2`. Average length is 2,044 words for JS, 1,111 for React, 1,896 for DSA and 3,062 for System Design. Other content:

- JS: 101 runnable `.try` blocks, 21 inline `<script>` demos, 122 tables.
- DSA: 67 `svg.dg` diagrams.
- System Design: 61 diagrams and 129 tables.
- React: 3 script demos, which the e2e tests exercise through `#fw-next`, `#rr-click` and `#et-next`.

Outline chapters have an empty `body` and `subtitle`. Their content is the syllabus `items` from `content/topics.ts`.

### 1.2 How a generic topic page renders today

```
app/<topic>/page.tsx ─► TopicCoverPage (server)
                          └─ ReaderShell (client, 449 lines)
                               └─ Shell variant="focused" (client, 460 lines)
                                    topbar (≤900px only): icon BackButton, ☰ drawer toggle, brand
                                    aside.site-sidenav (268px, sticky 100vh):
                                      brand · BackButton rail · ClockWeather · StreakMini · TopicOfDay
                                      Playground/Problems/How built/Interview/Mock/Whiteboard/Review(+due count)/Progress
                                      [sidebarExtra] Chapters: #search + ChapterNav (level <details>) + key hints
                                      Switch topic <details> · Your progress meter
                                      Display: [footBefore] Text size · Theme · Style · [footAfter] NarrationSettings · Print
                                    DailyRecap popup · red .progress bar · .fab back-to-top · SVG defs (#wob, arrow markers)
                               └─ #chapters (zoom: var(--reader-zoom)) ─► HashRedirect + CoverSheet → CoverMap
app/<topic>/[chapter]/page.tsx ─► TopicChapterPage ─► ReaderShell ─► ChapterSheet
                                    badge · h1 · 🔊 Listen · subtitle · body HTML | (outline: stamp + syllabus items)
                                    PracticeStrip · foot: prev/“The cover” · ChapterDone checkbox · ↑ Cover · next
```

ReaderShell effects after mount:

- `activateScripts`, `enhanceCodeBlocks` (copy button), `enhanceTables` (scroll wrapper), `enhanceTryBlocks` (▶ Run this through `lib/runner`) and `setupNarration` (`/api/tts`, word highlighting).
- A progress bar and FAB on scroll.
- Keys: `/` search, `[`/`]`/`n`/`p` chapter, `t` top.
- Search: per-topic full-text index fetched lazily from `<base>/search-index.json`, plus the global `/search-index.json` of titles. Results replace the article area.

### 1.3 Chapter page feature matrix

| Feature | Generic topics (ReaderShell + ChapterSheet) | Series (architecture, git) | Interview round |
| --- | --- | --- | --- |
| Frame | `Shell` sidebar; topbar only ≤900px | own sticky header: icon back, menu, "Chapters" sheet button, crumbs, prev · n/N · next, progress bar | `BookShell`: `.head-back` pill, menu, brand, title, links, scroll-fx, scroll bar |
| Back | `BackButton` rail item in sidebar ("← Home"), icon in mobile topbar | icon `BackButton` (fallback: series home) | `.head-back` pill |
| Chapter list | sidebar `ChapterNav`, level `<details>`, active link | left rail, part folds with read counts and ✓; sheet dialog on mobile | question rail |
| Search | yes: per-topic full text + other-topic titles, `/` key | no (drawer jump search only) | question bank page |
| TOC / section links | **none** (h3 have no ids) | right `TocCard`: active section, % ring, `withHeadingIds`; inline `<details>` on mobile | rail jumps to questions |
| Prev/next | bottom only (`pagebtn`), keys `[` `]` | header plus bottom pager cards plus keys | bottom pager |
| Narration | 🔊 Listen (`.listenbtn`), settings in sidebar foot | Listen chip, settings in `SiteDrawer reading` | no |
| Code runners / demos | `.try` Run, inline scripts, copy, table scroll | same enhancements | no |
| Diagrams | inline SVG; defs rendered inside ReaderShell's `progressBar` slot | `DiagramDefs` component (duplicate of the same defs) | n/a |
| Practice | `PracticeStrip` "Practice this layer" (solved ✓) | none | "Practise this round as a mock" |
| Done marker | `ChapterDone` checkbox "mark as read" (toggles `.is-done` on section) | end card plus TOC card button (`aria-pressed`) | "I have read this round" checkbox |
| Progress / review | `progress.setChapterDone` stores `{at, reviews:0}`; review is due after `REVIEW_GAPS_DAYS` [3,7,21,60,180]; sidebar shows the due count | same API, with a `git-` key prefix | same API |
| Text zoom / print / theme | sidebar foot | `SiteDrawer reading` folds | drawer |
| Loading UI | `loading.tsx` → `ChapterSkeleton` | none | none |
| Outline state | yes: dashed sheet, "not written yet" stamp, syllabus items | n/a | n/a |
| Motion | CSS scroll-driven `reveal-up` (`animation-timeline: view()`, Chromium only) on chapter `h3`, `pre`, `.sticky`, `.say` and `.dg`, plus RouteFade. No useScrollFx/Lenis. | none beyond hover | `useScrollFx` + Lenis |

### 1.4 Level, path, soon

- **`/level/[topic]`** (`LevelView`, Shell): "step 1 of 2" hero; three level cards linking to `/path?topic&level` (they call `rememberLevel`); a "Not sure?" note; the "Full syllabus" accordion (`components/Syllabus.tsx`, which duplicates the cover list in another visual language); "Three honest notes" (`curriculumNotes`); a footer. The sidebar shows `ChapterNavSection` for the topic.
- **`/path`** (`PathClient`, Shell, fully client-rendered): "step 2 of 2" hero with a meter and four equal buttons (Start/Continue, Open the full notes, Change level, **Reset my progress**, which wipes every topic on the device). Then the step list from `levelRows`, with every step expanded, its exercise cards and a mark-as-read checkbox. Then "Practice at this level". Outline sections appear as "coming soon" steps.
- **`/soon`** (`SoonClient`, Shell, client-only): a hero with the topic mark, tagline, blurb, JS CTA and a stale "Meanwhile" note ("23 sections. A few are already written"). It shows the plan from `topic.planned`, which is empty for every topic. It redirects to `/level/<id>` whenever `topic.status === "ready"`, which is true for all 21 topics.

### 1.5 Where topics differ from each other

1. **Three reader implementations.**
   - Generic: `components/reader/*` on `Shell`.
   - Series: `components/series/*`, used by architecture and git, with its own header CSS in `chapter.module.css` (1,116 lines) and `landing.module.css` (686).
   - Interview: `app/interview/*` on `BookShell`.
2. **Three data shapes.**
   - `NotesFile`/`Chapter` with `levels[]`, `practice[]` and `ready`, for the generic topics and architecture.
   - `GIT_CHAPTERS` with `part`, `GIT_PARTS`, and progress keys prefixed `git-` (`lib/gitSeries.ts`). Git is not in `NOTES_BY_TOPIC`, so `chapters("git") = []`, git is absent from the global search index, and it uses the `[section]` param.
   - Interview `BookRound`.
3. **Grouping.** Generic topics group by level. A chapter may sit in several levels (only `cheat` and `react-cheat` do). `CoverSheet` claims each chapter for its first level, while `ChapterNav` repeats cheat pages under every level. Series groups by part (`ARCH_PARTS` maps `levels[0]`, `GIT_PARTS` maps `part`).
4. **Architecture is half-and-half.** It has levels in `topics.ts`, its own `search-index.json` route and `topicCoverMetadata`. It also has a bespoke landing (`ArchitectureView`) and the series reader, and `/level/architecture` exists although the topic is off-shelf.
5. **Git** has `dynamicParams = false`, no `loading.tsx`, no search route and no levels. `topicStats` special-cases it through `SINGLE_PAGE_STATS`.
6. **Numbering.** `B1…B17`, `I1…`, `A1…` and `★` for cheat pages. Interview uses `00`, `R1·OA` and so on.
7. **OG images** exist only for 4 topics. The other 14 inherit the root image.
8. **Heading decoration.** Global `h2::after` draws a highlighter. `frame.module.css` (PageFrame) switches off `h1/h2/h3 ::before/::after` inside `.page`, and series CSS does the same for titles. Topic pages keep the highlighter on titles.
9. **Progress colour.** The reader bar uses `--red`. PageFrame and BookShell bars use `--c-green`.

### 1.6 Contracts the redesign must keep or knowingly update

- **e2e smoke** (`e2e/smoke.spec.ts`):
  - `#main h1, #main h2` first match must contain /JavaScript/ on `/notes`, /Setup/ on `/notes/setup-mental-model`, /JavaScript/ on `/level/js` and /Beginner/ on `/path?topic=js&level=beginner`.
  - Mark-read on the cover: `.station__tick` changes `.covermap__score-num`.
  - Search: `#search`, `#search-count` ("chapters? match"), `#nav-list .site-navlink__match`, no `.site-navlink__hits`, "Nothing matches".
  - `/level?topic=system-design` must land on `/level/system-design` with an h1 of System Design.
  - Narration: `.listenbtn` → "Pause", `.is-narrating`, `/api/tts` mocked.
  - Demos: `#fw-next`, `#rr-click`, `#rr-memo`, `#et-kind`, `#gt-mode`, `#gt-order .loop-frame`.
  - The playground test starts on `/notes/basic-async` and clicks the **sidebar** `a.site-navlink` "Playground". That test must move to the drawer's Playground link.
  - The final test loops over `header a.head-back`. Add topic routes to that loop.
- **a11y** (`e2e/a11y.spec.ts`, reduced motion): `/notes`, `/notes/setup-mental-model`, `/level/js`, `/path?topic=js&level=beginner`, `/git`, `/git/merge`, `/git/github`, `/architecture`, `/architecture/arch-request-path`.
- **Unit tests import reader modules:**
  - `tests/seo.test.ts` imports `topicChapterMetadata` and `topicCoverMetadata` from `components/reader/topicPages`. It also asserts that `navHref` sends outline topics to `/soon?topic=`.
  - `tests/search-index.test.ts` imports `components/reader/searchIndex`.
  - Move these modules with care, or update the imports.
- **`tests/claims.test.ts`** asserts written/outline/exercise counts inside `content/architecture/*`.
- **Architecture chapters describe the old reader by name.** Keep "How this is built" truthful:
  - `arch-rendering.ts`: ReaderShell diagram and text, CoverMap
  - `arch-search.ts`: ReaderShell search
  - `arch-routes.ts`: `/soon`, Shell
  - `arch-repo-map.ts`: "components/reader/: 15 files", Shell row
  - `arch-design-system.ts`: "Reading pages use components/Shell.tsx"
  - `arch-state.ts` and `arch-coming-soon.ts`: `/soon` flow
  - `arch-build.ts`: topicPages
- **Theme:** `jsnotes:theme` in localStorage (a JSON string), applied by `lib/themeInitScript.ts` to `html[data-theme]`. There are nine themes in `globals.css`. `tests/contrast.test.ts` checks the tokens.

### 1.7 Bugs found while auditing

| # | Where | What | Evidence |
| --- | --- | --- | --- |
| B1 | `app/soon/SoonClient.tsx` + `lib/topicNav.ts navHref` + `app/page.tsx hrefFor` | Home "Being written next", the drawer's "Coming soon" and the sidebar all send outline topics to `/soon?topic=X`. `SoonClient` then redirects to `/level/X` because every topic has `status:"ready"`. The seo test's intent ("not an empty reading path") is defeated. | `soon-typescript-*` shots: final URL `/level/typescript` |
| B2 | `app/path/page.tsx` + `PathClient` | `chapterById` is built across **all** topics, and `ChapterNavSection` receives `Object.values(chapterById)`. The path sidebar says "540 chapters", "Beginner 157", and links `/notes/react-setup-jsx` and similar. | `verify.mjs`: 544 links; `path-js-desk-top.png` |
| B3 | unknown chapter slugs | `/notes/react-setup-jsx` renders "Page not found" with **HTTP 200**. `notFound()` fires after `loading.tsx` starts streaming, and `dynamicParams` defaults to true. Git avoids this with `dynamicParams = false`. | `curl -w %{http_code}` → 200 |
| B4 | `lib/content.ts minutesFor` | The minimum of 2 minutes per chapter applies to empty outline bodies. `/level/typescript` shows "8 chapters · ~16 min · 0 exercises" when nothing is written. | `verify.mjs` level meta |
| B5 | outline covers | CoverMap renders "0/0 chapters read", "0 min of reading left", budget chips with "pick a run for tonight", and an empty dashed peek panel. | `typescript-cover-desk-full.png` |
| B6 | `/path`, `/soon` | Both are client-only: `return null` until mounted. The server HTML has no content (blank flash, nothing without JS). | code |
| B7 | legacy CSS | `.sheet::before` margin line is `rgba(196, 52, 43, 0.32)`, a hard-coded colour that ignores the nine themes (visible in dark). | `app/globals.css:2125` |

---

## 2. Screenshots and critique

### 2.1 Screenshot index (`scratchpad/audit/shots/`)

All shots use reduced motion (settled state) and `deviceScaleFactor 1`. Desktop is 1440×900 (`-desk-`) and mobile is 390×844 (`-mob-`, isMobile/touch). Covers have `-top` and `-full` (clipped to 4200 or 5200px). Chapters have `-top`, `-mid` (30% down) and `-end`.

- Covers: `notes-cover`, `react-cover`, `dsa-cover`, `sysdes-cover`, `typescript-cover` (outline)
- Chapters: `notes-chapter` (/notes/closures), `react-chapter` (/react/react-components), `dsa-chapter` (/dsa/dsa-hashing), `typescript-chapter` (outline /typescript/ts-setup-compiler)
- `level-js`, `level-typescript`, `path-js`, `soon-typescript` (it lands on /level/typescript)
- Comparison: `architecture`, `architecture-chapter` (/architecture/arch-build), `interview`, `interview-round` (/interview/r3), `review`
- Dark theme (`localStorage jsnotes:theme = "dark"`): `dark-react-cover`, `dark-react-chapter`
- Extras: `notes-chapter-mob-drawer.png` (the hamburger on a topic chapter). Mobile montages: `m-mob-covers.png`, `m-mob-chapter.png`, `m-mob-ref.png`.

Layout measurements (from the shot script's `results.json`):

| Page @1440 | Main column | Body paragraph width | ≈ chars/line | h1 |
| --- | --- | --- | --- | --- |
| Topic chapter (all written topics) | 1172px beside a 268px sidebar | 994px, 17–18px Kalam, lh 1.8 | ~110 | 40px |
| Series chapter (architecture) | 782px article | ≤780px | ~70–75 | 48px |
| Interview round | 1200px | 820px prose in a card | ~90 | 62px |
| Topic chapter @390 | full width | 294px (44px ring-hole gutter + sheet and shell padding) | ~35 | 28px |
| Interview round @390 | full width | 362px | ~40 | 36px |

### 2.2 Page-by-page critique

**Topic cover, written (`notes-cover`, `react-cover`, `dsa-cover`, `sysdes-cover`)**
- *Header and back.* There is no header at desktop width. Back is a sidebar item ("← Home") under the brand. The sidebar spends its first 700px on the clock, weather, "Today's pick" and site links, then repeats the chapter list that the cover already shows.
- *Hero.* "JavaScript — the whole map" at 60px. Below it: a pencil-grey subtitle, an italic lead, then three low-value chips ("41 / 41 chapters written", "by Akshat", "updated September 2026") ahead of anything actionable. There is no topic mark or accent, although every topic has `mark` and `accent`.
- *Primary action.* "Start here — Setup & mental model →" is an underlined link inside a mint box. It looks different from the solid primary buttons on /interview, /review and /architecture.
- *Density and structure.* A single column of 41 or 57 rows showing only the number, short title and minutes. There are no subtitles, exercise counts or level blurbs, even though `level.tagline`, `blurb` and `checkpoint` exist. The peek card only sits beside the first rows. Past that, the right third of the sheet is empty for 3,000px.
- *Budget chips.* "I've got 10m…90m" is a clever feature but has no explanation, and it sits between the CTA and the list.
- *Motion.* None on covers. Chapters use a separate CSS `reveal-up` view-timeline on h3, pre and callouts. The other redesigned landings stagger the hero and reveal parts with `useScrollFx`.

**Topic cover, outline (`typescript-cover`)**
- It tells the reader to "Pick a level…", then offers no level CTA.
- Broken states: "0 / 0 chapters read", "0 min of reading left", budget chips, an empty peek box, and 29 rows ending in "—".
- It should read as a roadmap: what's coming, in which order, and what to read meanwhile.

**Chapter, written (`notes-chapter`, `react-chapter`, `dsa-chapter`)**
- *Reading width.* About 110 characters a line in a handwritten font at line-height 1.8, which is tiring. Tables and code blocks stretch to 994px, and short tables look sparse.
- *Hierarchy.* The badge, the h1 with its highlighter and the subtitle are fine. There is no meta line: minutes, sections, exercises, level.
- *Wayfinding.* There is no TOC, and sections cannot be linked because the h3s have no ids. There is no "13 / 41". Prev/next only appears after 5,000–9,000px. The foot bar reads "previous this" (the short title of B12 is "this"), then a tiny "mark as read" checkbox, "↑ Cover", and next.
- *Done and review.* Marking as read is easy to miss. There is no hint that the chapter will come back for review.
- *Chrome.* A red progress bar, a circular FAB overlapping content, and the notebook ring holes and margin line.
- *Mobile* (`m-mob-chapter.png`):
  - The notebook gutter plus sheet and shell padding leave about 294px for text.
  - The dry-run table wraps "a() — 1st" onto two lines per cell.
  - The foot wraps into three rows.
  - The only way to reach other chapters is the hamburger. It opens the old sidebar under the topbar, with the clock and weather first and the chapter list below eight links (`notes-chapter-mob-drawer.png`).

**Chapter, outline (`typescript-chapter`)**
- A dashed sheet with a rotated "not written yet" stamp and two numbered item cards, over a mostly empty viewport.
- Not bad in itself, but it gives no pointer to anything readable: no related written chapter, and no interview round (R3-TS covers TypeScript).

**Level (`level-js`, `level-typescript`)**
- Crumbs sit above a notebook "hero" sheet. The three level cards are dense paragraphs plus bullet lists.
- The "Full syllabus" accordion (green left-border rows with ✓) is a third visual language for the same chapter list.
- For outline topics this page should not exist in its current form (B1, B4).
- On mobile the three cards stack into about 2,000px of text before the syllabus.

**Path (`path-js`)**
- The hero offers four equally weighted buttons, including "Reset my progress", which wipes every topic.
- Every step is fully expanded with 1–3 exercise cards, so 18 chapters make a 7,400px desktop page (12,400px on mobile).
- The sidebar lists 540 chapters from every topic (B2).
- Rendered client-only (B6).

**Soon (`soon-typescript`)**
- Unreachable (B1): the request lands on the level picker.
- The component's copy is stale and its data (`topic.planned`) is empty for every topic.

**Dark theme (`dark-react-*`)**
- The tokens mostly hold: sheet, text, chips and the green "reach" rows read well.
- The legacy margin line is a hard-coded red (B7). The title highlighter is swapped for a thin underline by a theme override.
- Contrast looks fine. The problems are structural, not colour.

**Comparison pages** (`interview`, `interview-round`, `architecture`, `architecture-chapter`, `review`)

These set the bar:

- A full-width 60px header: `.head-back` pill, menu, brand, separator, section title, and right-aligned section links or a primary CTA.
- Heroes: eyebrow or stat pill, a big h1 (60–72px), a lead of 60–75 characters, 1–2 solid CTAs, a stat strip, and on /interview a feature card on the right.
- Parts laid out as a left label column (Part N, title, blurb, progress) plus a card grid on the right.
- Scroll-fx stagger and reveal. Paper-grid background with cards instead of a ring-bound sheet.
- Mobile: the pill collapses to a 36px icon, cards go to one column, and body text is about 360px wide.
- The series reader adds the three-column rail, article and TOC, the header pager and the end card.

### 2.3 Cross-cutting scorecard

| Dimension | Topic pages today | Redesigned pages |
| --- | --- | --- |
| Header / back | sidebar rail item (desktop), icon (mobile); no brand bar on desktop | sticky 60px bar, labelled `.head-back` pill, brand, title, links/CTA |
| Hero | notebook sheet, "X — the whole map", metadata chips first | eyebrow + h1 + lead + solid CTAs + stats (+ feature card) |
| Density | long single-column lists; 994px text | card grids by part; 720–820px prose |
| Chapter navigation | bottom prev/next only, sidebar list below fold, no TOC | header pager, rail with read counts, TOC with active section |
| Mobile | 35 chars/line, old sidebar drawer | ~40 chars/line, SiteDrawer, chapters sheet, inline "On this page" |
| Consistency | notebook metaphor, highlighter titles, red progress bar, legacy global classes | CSS modules, tokens, green scroll bar, shared drawer |
| Motion | CSS `reveal-up` view-timeline on chapter blocks (a third motion system) + RouteFade; nothing on covers, level or path | `useScrollFx` + Lenis, reduced-motion safe |

---

## 3. Redesign brief: all topic pages

### 3.1 Principles

1. **One frame for every topic surface.** Cover, chapter, level, path and outline all use the same header grammar as PageFrame/BookShell: `.head-back` pill, menu (SiteDrawer), brand, topic title, right-side actions.
2. **The cover is a landing and the chapter is a reader.** No sidebar chrome that is not about the topic.
3. **Readable measure first.** Article at most about 72 characters (`max-width: 46rem`, roughly 720–760px at 18px). Tables and diagrams may break out to about 900px.
4. **Honest states.** An outline topic is a roadmap, never an empty reading path. No "0 / 0".
5. **Features do not regress** (§3.5).
6. **Constraints:**
   - No comments in source.
   - Theme tokens only (`--ink`, `--ink-soft`, `--sheet`, `--sheet-2`, `--paper`, `--line`, `--c-*`), including the topic accent via `--c-${accent}`.
   - CSS modules for new UI.
   - `prefers-reduced-motion` respected (useScrollFx already no-ops, and new transitions go under a media query).
   - e2e on port 3100 and the a11y suite stay green, with tests updated in the same story when a selector moves.
   - Each story on its own `feature/<name>` branch.
   - Read `node_modules/next/dist/docs` before touching route config (`dynamicParams`, async `searchParams`).

### 3.2 Shared frame: `TopicFrame`

Generalise `components/frame/PageFrame.tsx` rather than fork it. Review and Progress keep calling it unchanged. Then add a thin `components/topic/TopicFrame.tsx` that fills the props for a topic.

New PageFrame props, all optional so existing call sites don't change:

| Prop | Purpose |
| --- | --- |
| `back?: { href: string; label: string }` | BackButton fallback. Today it is hard-coded to `/`, `Home`. Chapter → cover, cover → Home, level → cover, path → level. |
| `titleHref?: string` | The topic title becomes a link to the cover (as BookShell does). |
| `mark?: string` and `accent?: string` | Topic chip beside the title (`--accent: var(--c-…)`), as home shelf cards do. |
| `actions?: ReactNode` | Right side. Cover: "Continue →" solid button. Chapter: `‹ 13 / 41 ›` pager plus a "Chapters" button below 1240px. |
| `reading?: boolean` | Passes `reading` to `SiteDrawer`, which brings the Text size and Narrator folds and Print. This replaces the old sidebar footer. |
| `layout?: "page" \| "reader"` | `page` keeps `max-width: 1180px`. `reader` gives a full-width main for the rail / article / TOC grid. |
| `skipLabel`, `skipHref` | e.g. "Skip to the chapter" → `#<chapterId>`. |

Keep `data-scrollbar` (green) and `useScrollFx(pageRef, scan)`. For the reader, pass `scan = chapterId` so fx re-measures after client navigation. Render `DiagramDefs` once in the frame when `reading` is set.

Mobile (≤720px): the pill collapses (existing CSS), links hide, and actions shrink to icons. The "Chapters" button opens the rail as a sheet (reuse the series sheet dialog). An optional SiteDrawer `children` slot can hold a "This topic" block if the drawer should also list chapters.

### 3.3 Target information architecture

#### (a) Topic cover / landing (written topics)

1. **Header.** Back "Home" (or the trail). Title "JavaScript" with its mark chip. Links: *Chapters* (anchor), *Your level* (`/level/<id>`, or the saved path), *Problems* (`/problems?topic=<id>`, which already supports a topic filter). Action: solid **Continue / Start →** to the next unread chapter.
2. **Hero** (`data-fx="stagger"`, two columns at ≥1024px):
   - Left: an eyebrow pill ("41 chapters · 3 levels · 99 exercises"), h1 = topic name (keep "JavaScript" in `#main h1` for e2e), lead (`meta.lead`), CTAs (primary *Start with B1 Setup & mental model* or *Continue B13 Closures*; secondary *Pick your level*), and a stat strip (hours, chapters read, exercises solved, due for review).
   - Right: the **Up next card**, the old peek card made purposeful. It shows the next chapter's number, title, subtitle, minutes and exercises, an Open button, and the reading-budget control ("I've got 10/20/30/45/60/90m → 3 chapters, up to Hashing"). The budget control moves in here from the middle of the page.
3. **Progress band** (thin): an overall bar, "7 h 48 m left", and "N due for review →" linking to /review.
4. **Parts by level** (`data-fx="up"`), one section per level, in the InterviewLanding and SeriesLanding pattern:
   - Left column: *Part 1 · Beginner*, the level `tagline` as a quote, `blurb`, the `checkpoint` ("You can build…"), and a progress bar reading x / y.
   - Right column: a card grid of chapters. Each card has the number, title, subtitle (1–2 lines), minutes, exercise count and a read tick button (`aria-pressed`, keeps the `.station__tick` semantics). Cheat pages get a distinct "★ Cheat page" card at the end of the first level.
5. **Practice callout:** exercises per level linking to `/problems?topic=<id>&level=<lvl>`.
6. **Footer strip:** related interview round (JS → R3, React → R4, DSA → R7, System Design → R8), a "Switch topic" link to the drawer, and the curriculum notes ("Three honest notes").

Keep `HashRedirect` (old `#chapter` anchors), the `topicCoverMetadata` exports, and SSR links for every chapter (no `<noscript>` needed once cards are server-rendered and progress hydrates on top).

#### (b) Chapter reader (written chapter)

Grid at ≥1240px: **rail 250px | article ≤760px | aside 230px**. At 900–1240px: article plus aside, with the rail in a sheet. Below 900px: a single column, with the rail in a sheet and the TOC inline.

1. **Header** (TopicFrame, reader layout): back pill (fallback "Back to JavaScript" → cover), menu, a "Chapters" button (<1240px), crumb *JavaScript / Beginner / B13*, and on the right `‹ 13 / 41 ›` with tooltips showing the prev/next titles. There is a green scroll bar.
2. **Rail** (shared `ChapterRail`):
   - A "The cover" link and a **search box** ported from ReaderShell: per-topic full text plus other-topic titles, `/` focuses it, Enter opens the first hit, Esc clears. Results appear in the rail instead of replacing the article.
   - Level folds with "x / y read" and ✓ per chapter, with `aria-current="page"` on the current one. Keep `#search`, `#search-count`, `#nav-list` and `.site-navlink__match`, or update the e2e search test in the same story.
3. **Article head:** kicker "Beginner · B13", badge plus h1, subtitle, and meta chips (min read · n sections · n exercises · n diagrams · 🔊 Listen, which keeps `.listenbtn` and `data-listen`).
4. **Body:** `withHeadingIds(chapter.body)` gives h3 ids and the TOC. Run the `enhancements.ts` functions and `setupNarration` unchanged. `--reader-zoom` applies to the content wrapper. Tables and diagrams can go full-bleed within the article. Wrap interactive demos (3D drag scenes, sliders) in `[data-no-smooth]`, or add their selectors to Lenis `prevent`.
5. **After the body:**
   - **Practice this chapter**: PracticeStrip restyled as cards with solved ✓, test count and level, plus "all N for this level →".
   - **End card**: Mark as read (big button, `aria-pressed`), topic progress bar, and "Comes back for review in 3 days" (from `REVIEW_GAPS_DAYS[0]`).
   - **Pager cards** showing full titles, not short names (fixes "previous this").
6. **Aside:** `TocCard` (active section, % ring, numbered sections), a Mark as read button, Back to top, and key hints (`/` search · `[` `]` chapters · `t` top). The FAB goes away.
7. **Mobile:** inline `<details>` "On this page" under the head, the "Chapters" sheet, sticky header pager, no notebook gutter (16–20px side padding), and tables in horizontal scroll wrappers (already done by `enhanceTables`).
8. **Motion:** `data-fx` goes on frame-level blocks only: head, end card, pager, practice. Do not put it on the hundreds of body elements, because useScrollFx measures every `[data-fx]` element per frame. Either keep the CSS `reveal-up` view-timeline for body diagrams and callouts or drop it, but choose one system on purpose. Both are off under reduced motion.

#### (c) Level page (`/level/[topic]`)

- **Header** back → cover. **Hero** (`data-fx="stagger"`): eyebrow "Step 1 of 2", h1 "How much JavaScript do you already have?", lead.
- **Three level cards** (`data-fx="stagger"`): mark, name, tagline, stats counted from **written chapters only** (fixes B4), a 2-line blurb, a "You'll recognise yourself if…" list collapsed to 3, and CTA "Show me this path →" (keeps `rememberLevel`). Highlight the saved level ("Your level").
- A "Not sure? Start at Beginner" note.
- **Syllabus** as one accordion styled like the cover parts (`Syllabus` moved into a CSS module), plus the curriculum notes card and links back.
- Outline topics never render this page. They redirect to the outline landing (see e).

#### (d) Path page (`/path?topic&level`)

- **Header** back → level. **Hero:** "Step 2 of 2 · your path", h1 "JavaScript — Beginner", lead, a progress meter, one primary CTA (Start / Continue — next), and secondary *Change level* and *All chapters*.
- **Timeline** (`data-fx="up"`): numbered steps with title, subtitle, minutes, level tags and a read toggle. Exercises collapse into "3 exercises ▾" (opened by default for the next unread step only). Outline sections become compact "coming" rows.
- **Practice at this level:** a card grid.
- **Reset progress** moves to the page foot in a low-emphasis zone with honest copy ("Clears every chapter and exercise on this device").
- Render server-side from the `searchParams` Promise, or at least server-render a skeleton, so there is no `null` HTML (B6). Weigh this against the page becoming dynamic.

#### (e) Outline topic landing (replaces `/soon`)

- **Recommendation:** the outline topic's own cover (`/typescript`, static, already `noindex`) renders a `TopicOutline` view. `/soon?topic=X` becomes a redirect to it, kept for old links. `/level/X` and `/path?topic=X` redirect to it while `written === 0`. Update `navHref`/`hrefFor` and the seo test to say "outline topics link to their outline landing". The alternative is to keep `/soon` as the canonical URL but make it render server-side and stop bouncing.
- **Content:**
  - Hero: mark chip in the accent colour, name, tagline, a "Not written yet" stamp as a small pill (not a rotated card), an honest status ("0 of 29 chapters written · 3 levels planned") and the blurb.
  - A **roadmap by level**, from `level.syllabus` (sections → items). Each section links to its outline chapter page.
  - **Meanwhile**: related written topics (TS → JS and the interview round R3-TS; Next.js → React; Node/Nest → JS). A small map in `lib` is enough.
  - Curriculum notes.
- **Outline chapter pages** use the reader frame. The article is a roadmap card: "This chapter will cover" plus the items, then "Meanwhile" links, with prev/next among outline chapters. There is no search result count and no Listen button.

### 3.4 Component reuse plan

**Reuse as is:**
- `BackButton` (bar) with `.head-back`, `SiteDrawer` (with `reading`), `TopIcon`
- `useScrollFx` and `smoothScroll` (use `smoothScroll.to` for `t` / Back to top)
- `components/reader/enhancements.ts`, `narration.ts`, `NarrationSettings`
- `searchIndex.ts` and the `search-index.json` routes, `HashRedirect`
- `lib/headingToc.withHeadingIds`, `lib/levelRows`, `lib/storage` (`progress`, `rememberLevel`, `REVIEW_GAPS_DAYS`)
- `lib/hooks` (`useMounted`, `useProgressValue`, `useClientValue`), `problemHref`, `formatSpan`/`plural`
- `topicChapterMetadata`, `topicCoverMetadata` and `topicChapterParams` (keep them exported from `components/reader/topicPages.tsx`, or re-export, for `tests/seo.test.ts`)

**Extract from `components/series/ChapterView.tsx`** (and its CSS) into shared modules used by the series and topic readers:
- `ChapterRail` (groups → folds, read counts, current, optional search slot)
- `TocCard` plus `useActiveHeading(toc)`
- `ChapterEnd`
- `ChapterPager`
- `useChapterKeys({prev, next})`
- `ChaptersSheet` (mobile dialog)
- `DiagramDefs` (and delete the inline copy in ReaderShell)

**Extract from `components/series/SeriesLanding.tsx`:** `PartSection` and `ChapterCard`, for the topic cover and the series landing.

**Extract from `CoverMap`:** a `useReadingPlan(stations, budget)` hook (done set, next, reach, minutes left). The UI moves into the Up next card.

**New:**
- `components/topic/TopicFrame.tsx`
- `TopicCover.tsx` + `cover.module.css`
- `TopicReader.tsx` + `reader.module.css` (or reuse `chapter.module.css` once it is split)
- `TopicOutline.tsx`
- `app/level/LevelView.tsx` and `app/path/PathClient.tsx` rewritten onto modules
- `lib/topicRelated.ts` (the "Meanwhile" map)

**Retire** (TP-9, after every consumer is gone):
- `ReaderShell`, `ChapterSheet`, `CoverSheet`, `CoverMap`, `ChapterNav`, `ChapterNavSection`, `SoonClient`, the old `PracticeStrip` markup, `ChapterSkeleton` markup (restyle)
- `Shell.tsx`, once `app/error.tsx` and `app/not-found.tsx` move to PageFrame
- Shell-only widgets: `DailyRecap`, `ClockWeather`, `StreakMini`, `TopicOfDay`, `TiltCard`. This is a product decision: keep the daily recap as a toast or a card inside SiteDrawer's ProgressCard, or drop it.
- Global layout CSS: `.topbar`, `.shell-*`, `.site-sidenav*`, `.sheet*`, `.cover*`, `.covermap*`, `.station*`, `.route*`, `.chapter__*`, `.searchbar`, `.fab`, `.progress`, `.level*`, `.syllabus*`, `.steps/.step*`, `.soon-*`, `.practice-strip`
- **Keep** the content styles the chapter HTML relies on: element typography, `pre`/`code`, tables, `.try`, `.demo`, `.sticky`, `.warn`, `.say`, `.dg` and so on. They are global element and class rules with no `.sheet` ancestor, which is why series pages already render the bodies correctly.
- Re-target the print CSS: `@media print` at `globals.css` around line 3724 hides `.topbar`, `.site-sidenav`, `.fab`, `.chapter__foot` and `.progress` and restyles `.sheet`. The ≤720px `.sheet` override is around line 3606, and the scroll-driven `reveal-up` list around line 3663.

### 3.5 Must not regress (acceptance checklist for every story)

- Mark as read and unread on the cover, in the chapter and on the path, all through `progress.setChapterDone`. Review scheduling and due counts must still work (`/review`, drawer ProgressCard).
- Per-topic full-text search plus other-topic title matches, the `/` key, Enter to open, Esc to clear.
- Keys `[` `]` `n` `p` `t`.
- Narration: Listen/Pause, word highlight, voice/rate/pitch settings.
- `.try` Run, inline demo scripts (React and DSA step-through demos), copy buttons, table scroll, SVG diagram markers (`#wob`, `#arrow*`).
- PracticeStrip with solved ticks. Text zoom (`--reader-zoom`, shared key `jsnotes:zoom`). Print. Theme and handwriting pickers (drawer).
- Old `#chapter` hash links (`HashRedirect`) and `/level?topic=` redirects.
- Metadata: canonical, noindex for outlines, OG. Sitemap. Loading skeleton.
- Every theme. The a11y suite under reduced motion. No horizontal scroll at 375/390px.

### 3.6 Stories (in order)

Each story: own `feature/<name>` branch; `npm run check`; `npm run build` then `npm run test:e2e` (port 3100). Screenshot diffs at 1440 and 390 in light and dark.

**TP-0 · Correctness fixes before the redesign** (`feature/topic-fixes`)
- **Scope:** B1 (stop `/soon` bouncing outline topics: base "outline" on written count, not `status`); B2 (path sidebar: only this topic's chapters); B3 (`export const dynamicParams = false` in the 18 `app/*/[chapter]/page.tsx`, after reading the Next 16 docs); B4 (`readTime`/`totalTime` count 0 for `!ready`, or level stats use written chapters only); SoonClient stale copy.
- **Files:** `app/soon/SoonClient.tsx`, `app/level/[topic]/page.tsx`, `app/path/PathClient.tsx`, `app/path/page.tsx`, `lib/content.ts`, `app/*/[chapter]/page.tsx`.
- **Acceptance:**
  - `/soon?topic=typescript` shows the TypeScript outline, not the level picker.
  - The `/path?topic=js` sidebar shows 41 chapters.
  - `curl /notes/nope` returns 404.
  - `/level/typescript` never shows invented minutes.
  - seo, claims and sitemap tests pass.
- **Risk:** low. Watch `topicStats` and claims numbers if `totalTime` changes.

**TP-1 · TopicFrame and shared reader parts** (`feature/topic-frame`)
- **Scope:** add the new optional PageFrame props (§3.2). Add `components/topic/TopicFrame.tsx`. Extract `ChapterRail`, `TocCard`, `ChapterEnd`, `ChapterPager`, `ChaptersSheet`, `useActiveHeading`, `useChapterKeys`, `DiagramDefs`, `PartSection` and `ChapterCard` from `components/series/*`, splitting `chapter.module.css` and `landing.module.css` to match. No visual change.
- **Files:** `components/frame/PageFrame.tsx`, `frame.module.css`, `components/series/*`, new `components/topic/*`.
- **Acceptance:**
  - `/review`, `/progress`, `/git*` and `/architecture*` are visually unchanged (before/after shots).
  - The architecture and git e2e tests and the head-back loop pass.
  - No comments; tokens only.
- **Risk:** medium. It is a refactor of a 519-line component and its CSS module.

**TP-2 · Topic cover redesign** (`feature/topic-cover`)
- **Scope:** §3.3a for the four written topics (outline covers stay as they are until TP-5). Add `useReadingPlan`. `TopicCoverPage` renders `TopicCover` in `TopicFrame`.
- **Files:** `components/reader/topicPages.tsx`, new `components/topic/TopicCover.tsx` + module CSS, `components/reader/CoverMap.tsx` (logic moves out), `e2e/smoke.spec.ts` (tick test selectors, add `/notes` to the head-back loop).
- **Acceptance:**
  - `#main h1` contains "JavaScript".
  - Clicking a card's read tick updates the read count.
  - The first chapter card is visible above the fold at 1440×900.
  - Continue CTA targets the first unread chapter.
  - a11y `/notes` is clean.
  - No horizontal scroll at 375px.
  - The hero stagger and part reveals work and are static under reduced motion.
  - Dark and all nine themes read correctly.
- **Risk:** medium.

**TP-3 · Chapter reader redesign** (`feature/topic-reader`)
- **Scope:** §3.3b for all written chapters. `TopicChapterPage` computes `withHeadingIds`, the counts and prev/next, then renders `TopicReader`. Port search into the rail. Move text size, narrator and print into `SiteDrawer reading`. Retire the FAB and red bar on these pages. Handle Lenis with interactive demos.
- **Files:** `components/reader/topicPages.tsx`, new `components/topic/TopicReader.tsx` + CSS, `components/reader/PracticeStrip.tsx` (restyle), `e2e/smoke.spec.ts` (search test if selectors move; the playground test uses the Menu → Playground link; add chapter routes to the head-back loop).
- **Acceptance:**
  - Article paragraphs are ≤ 760px (≈72ch) at 1440.
  - The TOC lists every h3 and deep links `#id` work.
  - Header `n / N` and prev/next work, as do the keys.
  - Every e2e test passes: narration, React/DSA demos, search.
  - a11y `/notes/setup-mental-model` passes.
  - At 390px the text column is ≥ 350px and the Chapters sheet and inline TOC work.
  - Print output contains only the article.
  - Marking as read still schedules review (a chapter shows on `/review` after `REVIEW_GAPS_DAYS[0]`).
- **Risk:** high. It touches 156 chapters with inline scripts; Lenis vs drag demos; narration selectors (`SPEECH_EXCLUDE` includes `.chapter__foot, .practice-strip`, so update it for the new end and practice blocks); zoom scope; soft-nav remounts through `RouteFade`.

**TP-4 · Outline chapter and loading skeleton** (`feature/topic-outline-chapter`)
- **Scope:** the outline-chapter state in the new reader (§3.3e, last point), plus `ChapterSkeleton` restyled to the new grid.
- **Files:** `TopicReader` (or `TopicOutlineChapter`), `components/reader/ChapterSkeleton.tsx`, `lib/topicRelated.ts`.
- **Acceptance:**
  - `/typescript/ts-setup-compiler` shows the items, Meanwhile links and prev/next.
  - noindex is kept.
  - The skeleton matches the final layout (no layout jump).
- **Risk:** low.

**TP-5 · Outline topic landing** (`feature/topic-outline-landing`)
- **Scope:** §3.3e. `TopicOutline` on outline covers. `/soon` redirects. Level and path redirects for outline topics. Update `navHref`, `app/page.tsx hrefFor` and the SiteDrawer topic hits. Update the seo test wording and assertion.
- **Files:** `components/reader/topicPages.tsx`, new `components/topic/TopicOutline.tsx`, `app/soon/*`, `app/level/[topic]/page.tsx`, `app/path/*`, `lib/topicNav.ts`, `app/page.tsx`, `tests/seo.test.ts`, `content/architecture/arch-coming-soon.ts`, `arch-routes.ts`, `arch-state.ts`.
- **Acceptance:**
  - Home "Being written next" → TypeScript lands on the outline landing, server-rendered.
  - No page says "0 / 0" or "0 min".
  - Sitemap still omits outline covers.
  - The claims test passes.
- **Risk:** medium (routing, SEO, architecture text).

**TP-6 · Level page** (`feature/topic-level`)
- **Scope:** §3.3c on TopicFrame. `Syllabus` goes into a CSS module.
- **Files:** `app/level/LevelView.tsx`, `components/Syllabus.tsx`, new module CSS.
- **Acceptance:** `/level/js` h1 contains JavaScript; `/level?topic=system-design` redirect test passes; a11y `/level/js` passes; the saved level is highlighted; stats count written chapters only.
- **Risk:** low to medium.

**TP-7 · Path page** (`feature/topic-path`)
- **Scope:** §3.3d on TopicFrame, with a server-rendered shell. Exercises collapse. Reset progress moves out of the hero.
- **Files:** `app/path/page.tsx`, `app/path/PathClient.tsx`, new module CSS.
- **Acceptance:** heading /Beginner/; a11y `/path?topic=js&level=beginner` passes; the server HTML contains the step titles; the reset still asks for confirmation and clears progress.
- **Risk:** medium (hydration of progress state; dynamic rendering cost if `searchParams` is used).

**TP-8 · Series headers converge** (`feature/series-frame`)
- **Scope:** `SeriesLanding`, `ChapterView` and `ArchitectureView` render inside TopicFrame (head-back pill, brand, title, actions) and share the TP-1 parts. Add `/git`, `/architecture` and their chapters to the head-back e2e loop.
- **Acceptance:** the architecture and git e2e and a11y tests pass; the headers match the topic pages.
- **Risk:** low to medium.

**TP-9 · Cleanup and docs** (`feature/topic-cleanup`)
- **Scope:**
  - Delete the retired components and global CSS (§3.4).
  - Move `app/error.tsx` and `app/not-found.tsx` to PageFrame and delete `Shell.tsx` and its widgets (after the product call on `DailyRecap`).
  - Re-target the print CSS.
  - Rewrite the architecture chapters that describe the old reader: `arch-rendering`, `arch-search`, `arch-routes`, `arch-repo-map`, `arch-design-system`, `arch-state`, `arch-build`.
  - Update `.cspell/project-words.txt` (append only).
- **Acceptance:** `npm run check`, build, e2e, a11y and contrast pass; `rg "components/Shell|ReaderShell|CoverMap"` finds nothing outside git history; every number stated in `content/architecture/` is still true.
- **Risk:** medium (globals.css is 9,497 lines shared with chapter content; watch the contrast test).

**Parallelism.** TP-0 can land any time before TP-5. After TP-1, TP-2 and TP-6/TP-7 can run in parallel with TP-3. TP-4 and TP-5 need TP-3 and TP-2 respectively. TP-8 needs TP-1. TP-9 goes last.
