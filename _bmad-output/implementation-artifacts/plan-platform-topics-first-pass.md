---
title: 'Platform topics, first pass: DSA rename, a general homepage and a categorised topic list'
type: 'feature'
ticket: ''
created: '2026-10-08'
status: 'built'
route: 'full'
route_source: 'auto'
review: 'thorough'
review_source: 'auto'
lenses_ran: ['blind-hunter', 'edge-case-hunter', 'verification-gap', 'intent-alignment']
review_loop_iteration: 0
followup_review_recommended: false
context: ['{project-root}/AGENTS.md']
warnings: ['oversized']
deferred:
  - summary: >-
      What each new topic will contain, in what order and with what exercises, is not planned; the 11 topics are outlines with a two-sentence blurb.
    evidence: |-
      The owner chose "small version first, then spec". Write the platform topics spec (catalogue, categories, per-topic chapter plan, homepage final design) through bmad-spec, then ticket it.
    location: >-
      content/topics.ts, _bmad-output/specs
    severity: medium
  - summary: >-
      `levels: []` is truthy, so 11 extra `/level/<id>` pages are generated only to redirect to the cover, and code that filters `t.levels` includes the new topics with zero levels.
    evidence: |-
      Filter on `t.levels?.length` in `generateStaticParams`, `topicHref`, `topicsNav` level ids and the sitemap's single-page check when the first real new topic gets chapters; it only adds build output now.
    location: >-
      app/level/[topic]/page.tsx, lib/topics.ts
    severity: low
  - summary: >-
      The homepage's default topic pane is "Ready now", so a first-time visitor sees none of the new languages until they pick a category.
    evidence: |-
      This was the layout the owner chose; reconsider the default (or show a "coming soon" strip under Ready now) once the new topics have content.
    location: >-
      app/HomeView.tsx
    severity: low
  - summary: >-
      The DSA rename is made on this branch while the multi-language code that motivated it is on `feature/dsa-rebuild`; main's DSA chapters are still JavaScript-only.
    evidence: |-
      When `feature/dsa-rebuild` merges, expect conflicts in `content/topics.ts` and the architecture chapters; the DSA tagline and chapter prose that say "in JS" belong to the DSA stories.
    location: >-
      content/topics.ts, content/dsa/
    severity: low
baseline_revision: 'a531681750391939a7268b830e2d4370465f8aec'
---

<intent-contract>

## Intent

**Problem:** The site presents itself as a JavaScript site: the homepage says "Understand JavaScript properly", the brand mark is "JS", the DSA topic is called "DSA in JS", and the topic list is flat and holds only web topics. The owner wants a site for software developers in general, with JavaScript as one topic among languages, databases, computer science and AI.

**Approach:** A first, content-free pass. Rename "DSA in JS" to "DSA". Make the homepage, site description and brand general while keeping JavaScript fully available as a topic. Add a `category` to every topic, group the sidebar topic list by category, and add the new topics as coming-soon outlines (no written chapters yet). The deeper plan for what each new topic contains is a separate spec afterwards.

## Boundaries & Constraints

**Always:**
- Work on branch `feature/platform-topics` (cut from `main`); never touch `feature/dsa-rebuild`; commit nothing yourself.
- Rename: `content/topics.ts` DSA `name` to "DSA" (and any tagline, blurb or notes that say "in JS" or imply JavaScript-only; the id `dsa` and every route stay), `content/dsa-notes.ts` `meta.title` to "DSA — the whole map", the `arch-coming-soon.ts` table row, `docs/ROADMAP.md` and any other live copy found by `grep -rni "DSA in JS"` outside `_bmad-output` and `docs/2026-08-audit.html` (leave dated audit and planning records). `app/problems/opengraph-image.tsx` chips stay accurate.
- Categories: add a `category` field to `Topic` and `TopicNav` (`content/types.ts`), carried by `topicsNav()`, with these ids and labels: `languages` (Languages), `web` (Web), `backend` (Backend and APIs), `data` (Data), `cs` (Computer science), `devops` (DevOps and cloud), `engineering` (Engineering practice), `ai` (AI). Assign: js, typescript, python, java, cpp, rust, ruby, go to languages; html, css, react, nextjs to web; nestjs, node, graphql to backend; databases ("SQL & Databases"), redis, mongodb, dbms to data; dsa, system-design, networks, os to cs; docker, kubernetes, cloud-devops to devops; testing, security to engineering; ai to ai. Topics that are guides rather than topics (`architecture`, `git`, `interview`) keep whatever the current topic list does with them; give them a category only if the type requires one. A test asserts every topic has a known category and every category has at least one topic.
- New coming-soon topics (all `status: "ready"` with no written chapters, because "coming soon" is computed as `written === 0` and `tests/seo.test.ts` forbids `status: "soon"`): Python (`python`), Java (`java`), C++ (`cpp`), Rust (`rust`), Ruby (`ruby`), Go (`go`), MongoDB (`mongodb`), DBMS (`dbms`), Computer Networks (`networks`), Operating Systems (`os`), Claude and AI tools (`ai`, name "Claude & AI tools"). Each has `id`, `name`, a short `mark`, an `accent` from the existing tokens, a one-line `tagline`, a `blurb` of two sentences saying what the topic will cover, `notes` as the existing outline topics have it, and `levels: []` (so it does not fall back to JavaScript's syllabus and is not listed in the sitemap). Order: place each next to its category's neighbours.
- Each new topic needs its route `app/<id>/page.tsx` (the same ten lines as the other outline topics, calling `TopicCoverPage`), an entry in `PINNED_OUTLINE_TOPIC_IDS` in `next.config.ts` (`tests/next-config.test.ts` asserts it equals the outline ids), and must render a sensible outline page with an empty syllabus: heading, blurb, a "Being planned" note and a way back, never JavaScript's syllabus and never a 404. If `TopicOutline` breaks on `levels: []`, fix it so an empty syllabus reads well.
- Sidebar (`components/SiteDrawer.tsx` `TopicList`): keep `<nav aria-label="Topics">` and the Topics fold; inside it group topics under plain category headings (not nested folds, to keep axe and the focus order simple), and within a category list ready topics first, then coming-soon ones with the existing "Soon" meta. The fold summary and the Ready and Coming-soon counts stay true. Search still finds every topic.
- Homepage (`app/HomeView.tsx`, `app/page.tsx`) and site copy: the h1 becomes general and keeps the sentence "Walk into the interview ready." (an e2e asserts it); the lead says what the site is for software developers; the primary button no longer says "Start with JavaScript" (use "Pick a topic" to the shelf section, and keep "Prepare for an interview"); the nav's "Start reading" goes to the topic shelf instead of `/level/js`; the kicker, FAQ answers and any sentence that claims the site is JavaScript-only are made true for a multi-topic site; the hero art may keep its JavaScript example card. The brand mark changes from "JS" to "G" wherever it appears (header and drawer brand, `app/icon.tsx`, `app/apple-icon.tsx`, `app/opengraph-image.tsx`). `lib/site.ts` `SITE_DESCRIPTION` and the manifest name and description become general ("handwritten notes for software developers: languages, web, data, computer science and AI"). The "On the shelf" and "Being written next" parts show the new topics sensibly (grouped or in the same flat list, but not broken or overflowing at 390px).
- Update tests and e2e that this moves: `e2e/smoke.spec.ts` (the `Start with JavaScript` link, home heading, sidebar topic counts and grouping, anything that expects the old brand mark) and add tests that the sidebar shows category headings and the new topics as Soon, that `/python` and `/networks` render an outline (not a 404) with an empty syllabus, that the DSA topic is named "DSA" in the sidebar and on its cover, and that the homepage no longer says "Understand JavaScript properly". Add a unit test for the category rules. Update the architecture chapters for every number that moves (`arch-overview.ts` topic counts, `arch-routes.ts`, `arch-coming-soon.ts` table and subtitle, the stale `arch-roadmap.ts` and `arch-state.ts` numbers, sitemap or route counts, test counts) so `tests/claims.test.ts` stays green. Theme tokens only; no comments in source; append new spelling words to the end of `.cspell/project-words.txt`.

**Never:** Do not write chapters, exercises or content for any new topic; do not change the JavaScript, React, Git or other written topics' content; do not touch `feature/dsa-rebuild` or any DSA chapter body, player, check or placement code; do not change routes or ids that exist (`/dsa`, `/notes`, `/level/js`); do not add `status: "soon"`; do not add a dependency; do not remove JavaScript from the homepage's shelf, paths or search; do not use hex colours or white.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Home | `/` | general hero, "Walk into the interview ready.", "Pick a topic" button, brand mark "G" | none |
| Sidebar | open the menu, open Topics | category headings; ready topics first, then Soon topics per category | none |
| New topic | `/python`, `/networks`, `/ai` | an outline page with name, blurb and "Being planned", no JS syllabus | not a 404 |
| Old name | DSA in sidebar, cover, metadata | "DSA" | none |
| Search | search "rust" | the Rust topic appears | none |
| Phone | 390px home and sidebar | no horizontal scroll | none |
| Sitemap | `/sitemap.xml` | new outline topics are not listed | none |

</intent-contract>

## Code Map

- `content/topics.ts` (about 4400 lines; topics in `topics.topics[]`: js at about 502, dsa at about 2474, databases about 2895, kubernetes about 4197) and `content/types.ts:21-47` (`Topic`, `TopicNav`) -- the data; `lib/topics.ts` (`topicsNav()`, `levels(topicId)` falls back to the JS levels when `topic.levels` is undefined, `RELATED_INTERVIEW_ROUND`), `lib/topicStats.ts` (`topicStats`, `siteStats`), `lib/topicIds.ts` (`outlineTopicIds()`), `lib/accent.ts` (accent tokens: blue, green, grey, orange, purple, red, teal, yellow, ink; `mint` maps to green).
- `components/SiteDrawer.tsx:218-241` (`TopicList`: ready is `status === "ready" && written > 0`, everything else soon; `Fold id="topics"` at about 423; search `topicHit`), `components/SiteDrawer.module.css` (group label and soon styles).
- `app/<id>/page.tsx` for the existing outline topics (about ten lines calling `TopicCoverPage` from `components/reader/topicPages.tsx`; `topicCoverMetadata` sets `index:false` when nothing is written); `next.config.ts:7-23` `PINNED_OUTLINE_TOPIC_IDS` and the `/soon`, `/path` and `/level` redirect regexes built from it; `tests/next-config.test.ts:14-21`; `tests/seo.test.ts:163,170`.
- `app/page.tsx`, `app/HomeView.tsx` (1220 lines: nav anchors about 820; h1 about 839; lead about 846; buttons about 853 and 1161; hero art about 212 and 295; personas about 60-105; FAQ about 779-785; brand mark about 814 and 1181; shelf and "Being written next" about 1075), `app/home.module.css`.
- `lib/site.ts:11-15` (`SITE_NAME`, `SITE_DESCRIPTION`), `app/layout.tsx`, `app/manifest.ts`, `app/opengraph-image.tsx:11`, `app/icon.tsx:34`, `app/apple-icon.tsx:34`.
- `content/dsa-notes.ts:39`, `content/architecture/arch-coming-soon.ts:25,45,128`, `docs/ROADMAP.md:23` -- the "DSA in JS" copy.
- `tests/claims.test.ts` (topics, routes, sitemap counts) with `content/architecture/arch-overview.ts:49` (topics row), `arch-routes.ts:155` (`/level/<topic>` row), `arch-coming-soon.ts`, `arch-roadmap.ts:126`, `arch-state.ts:99`, `arch-build.ts:131`; `e2e/smoke.spec.ts:10,15,1141,1172-1176,1193,1334`; `e2e/a11y.spec.ts` (the site menu open state; do not add PAGES unless the claimed counts are updated).
- New: `app/{python,java,cpp,rust,ruby,go,mongodb,dbms,networks,os,ai}/page.tsx`, a categories module such as `lib/topicCategories.ts` (labels and order), a unit test for the category rules.

## Tasks & Acceptance

**Execution:**
- [x] `content/types.ts`, `lib/topics.ts`, `lib/topicCategories.ts` -- the `category` field, the ids, labels and order -- grouping data
- [x] `content/topics.ts` -- rename DSA, assign categories, add the 11 coming-soon topics -- the catalogue
- [x] `app/<id>/page.tsx` x11, `next.config.ts`, the outline page for an empty syllabus -- the routes and their rendering
- [x] `components/SiteDrawer.tsx`, `SiteDrawer.module.css` -- categories in the sidebar -- navigation
- [x] `app/HomeView.tsx`, `app/page.tsx`, `lib/site.ts`, `app/layout.tsx`, `app/manifest.ts`, icons and OG images -- the general homepage, description and brand mark
- [ ] DSA rename copy in `content/dsa-notes.ts`, `content/architecture/*`, `docs/ROADMAP.md`
- [x] `tests/*`, `e2e/*` -- update what moves and add the new checks
- [x] `content/architecture/*` -- every number that moves -- claims stay green
- [x] `.cspell/project-words.txt` -- append new words at the end

**Acceptance Criteria:**
- Given the homepage, when read, then it says nothing that makes the site JavaScript-only, still says "Walk into the interview ready.", offers "Pick a topic", and JavaScript is still on the shelf.
- Given the sidebar, when Topics is open, then topics sit under category headings, each category lists ready topics before Soon ones, and DSA is called "DSA".
- Given `/python`, `/java`, `/cpp`, `/rust`, `/ruby`, `/go`, `/mongodb`, `/dbms`, `/networks`, `/os` or `/ai`, then an outline page renders with the topic's blurb and no JavaScript syllabus, and none is in the sitemap.
- Given the brand, then the mark reads "G" in the header, drawer, favicon, apple icon and share image.
- Given `npm run check`, `npm run build` and the full e2e, then all pass, including `tests/claims.test.ts`, `tests/seo.test.ts` and `tests/next-config.test.ts`, with axe clean in nine themes on the pages it already covers and no horizontal scroll at 390px on the home and the open sidebar.

## Implementation Notes

- Rename: the DSA topic is named "DSA" (topics.ts, dsa-notes.ts meta title, the coming-soon chapter row, ROADMAP); id and routes unchanged. A `category` on every topic (`lib/topicCategories.ts`: languages, web, backend, data, cs, devops, engineering, ai), 11 new coming-soon outline topics (python, java, cpp, rust, ruby, go, mongodb, dbms, networks, os, ai) with `levels: []`, a route each and entries in `PINNED_OUTLINE_TOPIC_IDS`, and an empty-syllabus branch in `TopicOutline` ("Being planned").
- Brand mark "JS" became "G" everywhere (header, drawer, frames, favicon, apple icon, share image); `SITE_DESCRIPTION`, the manifest and the README tagline are general; the homepage hero is "Understand software properly. Walk into the interview ready." with "Pick a topic" and "Prepare for an interview".
- After the first build the owner asked for two UI changes, both done on this branch: the sidebar category groups became a single-open accordion (the first category, or the current topic's, open; opening another closes it), and the home topic section became a left category list with a right grid of accent-coloured cards (a "Ready now" entry first). A first tab-bar version was replaced because its bar wrapped into two lines.
- Findings that shaped the code: "coming soon" is computed as `written === 0` and `tests/seo.test.ts` forbids `status: "soon"`, so a new outline topic is `status: "ready"` with `levels: []`; `curriculumNotes()` and `levels()` fall back to JavaScript's when a topic defines none, so a new topic must not rely on them.

## Plan Change Log

- 2026-10-08, after the first build: the owner asked for the sidebar categories to be collapsible (single-open accordion, first category open) instead of the plan's plain headings, and for the home "On the shelf / Ready to read today / Coming soon" block to be redesigned (the owner chose a left category list with a right card grid with accent cards and hover lift after a tab-bar version looked wrong). The plan's "plain category headings (not nested folds)" and the homepage shelf wording were amended accordingly. KEEP: `<nav aria-label="Topics">`, ready-before-soon ordering, `id="shelf"`, the "Pick a topic" heading, and the rule that new topics are `status: "ready"` outlines with `levels: []`.

## Review Triage Log

### 2026-10-08 — Review pass
- verdicts: 29 findings (duplicates across lenses merged) — high 0, medium 6, low 17, false 6, maybe-false 0
- findings:
  - `[medium]` `[patch]` edge-case-hunter, verification-gap: the 11 new covers show JavaScript's "Three honest notes" because `curriculumNotes()` falls back to the JS notes — empty for `levels: []`, hidden in the planning branch, tested
  - `[medium]` `[patch]` blind-hunter, edge-case-hunter, verification-gap: every unmapped new topic's "Meanwhile" block says "JavaScript is written — start there" — python, java and cpp map to dsa, the data and CS topics to system-design, the rest hide the block
  - `[medium]` `[patch]` blind-hunter, edge-case-hunter: the home topic section rendered only the active panel, so the coming-soon topics were not in the HTML for crawlers or no-JS readers — all panels render, inactive ones hidden
  - `[medium]` `[patch]` blind-hunter, intent-alignment: the homepage kept JavaScript-only claims in the Fresher persona, the LAYERS list and a patched "Read" step — reworded
  - `[medium]` `[patch]` blind-hunter: the architecture chapters contradicted each other on route and page counts, the largest-files chart was stale and test figures were unmeasured — recomputed from the real build, `wc -l` and vitest, with honest "working tree, not a CI run" wording
  - `[medium]` `[patch]` verification-gap, blind-hunter: the new sidebar accordion, the non-default home category and a planning cover were never axe-checked — three states and `/python` added, nine themes, desktop and phone
  - `[low]` `[patch]` blind-hunter, edge-case-hunter: the accordion's open category never followed navigation — re-derived when the current topic changes
  - `[low]` `[patch]` blind-hunter, verification-gap: the planning copy promised a beginner-to-advanced layout and the cover description could start with a space — reworded and trimmed, asserted
  - `[low]` `[patch]` blind-hunter, edge-case-hunter: `docs/ROADMAP.md` still said 7 of 21 and omitted the new topics — updated
  - `[low]` `[defer]` blind-hunter, edge-case-hunter: the spec for what the new topics contain is not written — the owner's agreed next step
  - `[low]` `[defer]` edge-case-hunter: `levels: []` is truthy, so 11 `/level/<id>` redirect pages are generated — filter when topics get chapters
  - `[low]` `[defer]` intent-alignment: the default home pane shows no new topic until a category is picked — the layout the owner chose
  - `[low]` `[defer]` intent-alignment: the DSA rename lands here while the multi-language code is on the DSA branch — merge note
  - `[low]` `[reject]` blind-hunter, edge-case-hunter, intent-alignment: the sidebar accordion contradicts the plan's "plain headings" — the owner asked for it; recorded in the Plan Change Log
  - `[low]` `[reject]` blind-hunter, edge-case-hunter: a topic with no category vanishes from the sidebar and shelf — a test asserts every listed topic has a category
  - `[low]` `[reject]` blind-hunter: the fold summary and the list header could count differently — both count the same grouped topics today
  - `[low]` `[reject]` blind-hunter: repeated accents, cryptic marks "DM" and "Mg", and the same blurb sentence — copy and colour taste, to settle in the spec
  - `[low]` `[reject]` blind-hunter: the OG image has no "coming soon" chip for planning topics — they are noindex
  - `[low]` `[reject]` intent-alignment: the catalogue stops at the 11 named topics (no C#, Kotlin, Swift, PHP) — the owner named a list; the spec widens it
  - `[low]` `[reject]` intent-alignment: Git sits in "Engineering practice" while guides have no category — a topic in the list needs one
  - `[low]` `[reject]` blind-hunter: the hover lift and accent colour are not asserted — visual, seen in screenshots
  - `[low]` `[reject]` blind-hunter: `content: none !important` pseudo-element resets are brittle — scoped to the new section, contrast passes in nine themes
  - `[false]` `[reject]` intent-alignment: only the first sidebar category should open — the owner's "first open" is the default, location-aware only when reading a topic
  - `[false]` `[reject]` blind-hunter: the plan file is unfinished — closed out here
  - `[false]` `[reject]` verification-gap: cover metadata and related-topic mapping are untested — asserted after the patches
  - `[false]` `[reject]` intent-alignment: the "Ready now" tab is not a category — it is the default pane the owner's layout choice included
  - `[false]` `[reject]` blind-hunter: `notes: "python.html"` points at files that do not exist — covers with no chapters never read them
  - `[false]` `[reject]` blind-hunter: the arch counts moved without test additions — measured per file with vitest, 367 tests in 22 files

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: all green, comments check clean
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build` -- expected: success
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run test:e2e` -- expected: all pass (serves the production build on port 3100)

**Manual checks (if no CLI):**
- Screenshots of the home hero, the open sidebar Topics group and `/python` at 1440 and 390 in two themes.

## Auto Run Result

**Summary:** The site is no longer presented as JavaScript-only. The DSA topic is "DSA"; the homepage says "Understand software properly. Walk into the interview ready." with "Pick a topic" and a general lead, FAQ and personas; the brand mark is "G" in the header, drawer, favicon, apple icon and share image; the description and manifest are general. Every topic has a category, and 11 coming-soon outline topics exist (Python, Java, C++, Rust, Ruby, Go, MongoDB, DBMS, Computer Networks, Operating Systems, Claude and AI tools), each with its own route that renders an honest "Being planned" outline. The sidebar groups topics into eight categories as a single-open accordion; the homepage topic section is a left category list with a right grid of accent cards (Ready now first).

**Files changed:** `content/types.ts`, `content/topics.ts`, `lib/topicCategories.ts`, `lib/topics.ts`, `lib/topicRelated.ts`, `lib/site.ts`, `lib/topicOg.tsx`, `app/<id>/page.tsx` x11, `next.config.ts`, `components/SiteDrawer.tsx` and its CSS, `components/topic/TopicOutline.tsx`, `components/reader/topicPages.tsx`, `app/HomeView.tsx`, `app/home.module.css`, `app/page.tsx`, icons, manifest and share images, brand marks in the frames, `content/dsa-notes.ts`, `docs/ROADMAP.md`, `README.md`, the architecture chapters, `tests/topic-categories.test.ts` and the other tests and e2e that moved.

**Review:** 29 findings: medium 6, low 17, false 6. Patched 9 groups (JavaScript notes and "Meanwhile" links on new topics, all home panels in the HTML, JavaScript-only homepage claims, the architecture numbers recomputed from real measurements, axe on the new states, accordion following navigation, copy and metadata, ROADMAP), deferred 4 (the topics spec, `levels: []` redirect pages, the default home pane, the DSA merge note), rejected the rest with reasons logged.

**Follow-up review recommended:** false.

**Verification:** `npm run check` 367 unit tests, build ok, full e2e 204/204 including axe in nine themes on the new states; screenshots of the home topic section at 1440 and 390 in a light theme and the first sidebar version looked right.

**Residual risks:** no new topic has any content yet (a spec comes next); merging `feature/dsa-rebuild` later will conflict in `content/topics.ts` and the architecture chapters; one existing lint warning in `useReadingPlan.ts` is not from this work.
