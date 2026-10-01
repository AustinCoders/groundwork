---
title: 'Share images, topic breadcrumbs and a correct sitemap'
type: 'feature'
ticket: '5'
created: '2026-10-01'
status: 'built'
route: 'full'
route_source: 'auto'
review: 'thorough'
review_source: 'auto'
lenses_ran: ['blind-hunter', 'edge-case-hunter', 'verification-gap', 'intent-alignment']
review_loop_iteration: 0
followup_review_recommended: true
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/planning-artifacts/audit-2026-09-28/seo-content-roadmap.md']
warnings: ['oversized']
deferred:
  - summary: >-
      The problem-page breadcrumb's use of chapter.topic.name/href in PracticeWorkspace's JSX is untested at the render level.
    evidence: |-
      Only practiceChapterLinks()'s returned data is tested (tests/seo.test.ts, "problem breadcrumbs"), not what the component does with it. A label/href field swap in the Crumbs call would ship with every test green. The repo has no React-render test infrastructure (no Testing Library dependency) to extend; adding one is a larger change than this story's scope.
    location: >-
      components/practice/PracticeWorkspace.tsx:1183-1193
    severity: low
baseline_revision: '5a95689b53f085880d68a75b3a6609e45753b114'
---

<intent-contract>

## Intent

**Problem:** `pageMetadata()` never sets `openGraph.images`, and Next replaces rather than merges `openGraph` when a page sets its own, so the nine existing `opengraph-image.tsx` cards never reach any page outside the exact segment that owns them — about 770 of 781 sitemap URLs share no image. Every problem breadcrumb hard-codes "JavaScript" regardless of the problem's real topic. `/mock` and `/interview/questions` are missing from the sitemap and `/practice` (empty on the server) is in it. Every sitemap entry's `lastModified` is the moment of the build, so every deploy marks all 781 URLs as changed and crawlers learn to ignore it.

**Approach:**
- Give `pageMetadata()` a per-section default image, derived from the page's path against the nine existing section images, falling back to the root card.
- Carry the real topic name and href through `practiceChapterLinks()` into the problem breadcrumb.
- Add `/mock`, `/interview/questions` and `/privacy` to the sitemap; drop `/practice`.
- Give every sitemap entry a `lastModified` drawn from content: a topic's own `meta.updated` month where one exists, and one shared, manually-bumped constant everywhere else (problems, Git chapters, mock, the question bank, privacy, home, the whiteboard).
- Update `arch-build.ts`'s stale URL count and lastModified description, with a claims test guarding the new count.

## Boundaries & Constraints

**Always:**
- `lib/metadata.ts`'s `pageMetadata()` sets `openGraph.images` and `twitter.images` to a one-element array from a new `ogImageFor(path)` helper, matching the page's path against the nine existing `opengraph-image.tsx` routes (`/notes`, `/react`, `/dsa`, `/system-design`, `/git`, `/architecture`, `/interview`, `/problems`) by prefix, and falling back to `/opengraph-image`. No new image-generation routes; reuse what exists, per S1's "quick" fix.
- `app/practice/PracticeClient.tsx`'s `ChapterLink` gains a required `topic: { name: string; href: string }`. `lib/practiceLinks.ts`'s `practiceChapterLinks()` populates it from each chapter's own topic. `components/practice/PracticeWorkspace.tsx`'s breadcrumb uses `chapter.topic.name`/`chapter.topic.href` when a chapter is linked, and keeps "JavaScript"/"/notes" only for the free-play mode (`chapter === null`), which is a real default, not a bug.
- `app/sitemap.ts`: add `/mock`, `/interview/questions` (both monthly, priority 0.7) and `/privacy` (yearly, priority 0.3); drop `/practice`. Every entry's `lastModified` comes from content:
  - a topic's cover, level page and every written chapter use that topic's `notesData(topicId).meta.updated` (a "Month YYYY" string already on every topic), parsed to the first of that month;
  - everything else (home, `/problems`, every problem page, `/whiteboard`, Git's chapters, `/mock`, `/interview/questions`, `/privacy`) uses one new constant, `UNDATED_CONTENT_LAST_CHANGED` in `lib/site.ts`, bumped by hand when that content changes materially — never `new Date()` at build time.
- `content/architecture/arch-build.ts`'s sitemap paragraph states the new URL count and describes the two-tier `lastModified` source; `tests/claims.test.ts` derives and asserts that count from `sitemap().length`, since this chapter is under `content/architecture/` (AGENTS.md).
- `tests/seo.test.ts` covers: the three additions and the one removal; every entry's `lastModified` is not "now"; every cover and written chapter has an `og:image`; `/mock`/`/privacy`/`/interview/questions`/a problem page resolve to the right section image; every written chapter's breadcrumb names its real topic.
- No comments. No new `.cspell` words expected.

**Never:**
- Do not add new `opengraph-image.tsx` routes for the other 13 topics; reuse the nine that exist.
- Do not touch `/soon` copy, the interview-question count, S2 (thin problem pages), S4 (structured data), S5 (home title/description) or any other audit finding outside S1, S3, S7 and S8.
- Do not change the free-play Playground breadcrumb's "JavaScript"/"/notes" default.
- Do not shell out to `git log` for per-file dates; the content-date-or-shared-constant approach avoids that risk entirely (resolves the ticket's `unknown`).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| A JS chapter page | `topicChapterMetadata("js", "closures")` | `openGraph.images` is `["/notes/opengraph-image"]` | No error expected |
| A page with no section | `pageMetadata({..., path: "/mock"})` | `openGraph.images` is `["/opengraph-image"]` | Same |
| A problem page | `pageMetadata({..., path: "/problems/ex-accounts-merge"})` | `openGraph.images` is `["/problems/opengraph-image"]` | Same |
| A DSA problem's breadcrumb | `practiceChapterLinks()["union-find"]` (a DSA chapter id) | `topic.name` is "DSA in JS", `topic.href` is `/dsa` | Same |
| Free-play Playground | `chapter` prop is `null` | Breadcrumb still reads "JavaScript" → `/notes` | Same |
| Sitemap additions | `sitemap()` | Contains `/mock`, `/interview/questions`, `/privacy`; omits `/practice` | Same |
| Sitemap dates | Any entry | `lastModified` is not within the last minute of "now" | Same |
| arch-build count | `content/architecture/arch-build.ts` | States the sitemap's true URL count, asserted by a test | Test fails if the count drifts |

</intent-contract>

## Code Map

- `lib/metadata.ts`: `pageMetadata()` (the whole file, ~45 lines). Add `SECTION_IMAGES` and `ogImageFor(path)`; set `images` in both `openGraph` and `twitter`.
- `app/opengraph-image.tsx` and the 8 section copies (`app/{react,git,dsa,problems,architecture,notes,interview,system-design}/opengraph-image.tsx`) already exist and are untouched; `ogImageFor` just points at their routes.
- `components/reader/topicPages.tsx`: `topicCoverMetadata`/`topicChapterMetadata` already call `pageMetadata({..., path: notesHref/chapterHref(...)})`, so every topic cover and chapter gets an image automatically once `pageMetadata` sets one — including the bare `/react`, `/dsa`, `/notes`, `/system-design` covers themselves, which lose their file-convention image today because setting `openGraph` replaces rather than merges it (confirmed against `node_modules/next`'s own metadata-merging docs).
- `app/practice/PracticeClient.tsx:8-13`: `ChapterLink` interface, add `topic: { name; href }`.
- `lib/practiceLinks.ts:4-14`: `practiceChapterLinks()` builds `links[ch.id]` per topic; add `topic: { name: t.name, href: base }`. `app/problems/[slug]/page.tsx:58` is the only other reader of this map (`practiceChapterLinks()[ex.chapter] ?? null`); it needs no change.
- `components/practice/PracticeWorkspace.tsx` (~line 1182): the `Crumbs` call hard-codes `{ label: "JavaScript", href: "/notes" }`; use `chapter ? chapter.topic.name/href : "JavaScript"/"/notes"`.
- `lib/site.ts`: add `UNDATED_CONTENT_LAST_CHANGED = "2026-09-30"`.
- `app/sitemap.ts` (the whole file): add `topicLastModified(topicId)` parsing `notesData(topicId).meta.updated` ("Month YYYY", present on every topic per `content/*-notes.ts`) into a UTC date; use it for that topic's cover/level/chapter entries; use `UNDATED_CONTENT_LAST_CHANGED` for every other entry (home, `/problems`, exercises, `/whiteboard`, `GIT_CHAPTERS`, the three new entries). Verified by direct computation: total goes from 781 to 783 (notes.ts etc. each already carry `meta.updated`).
- `content/architecture/arch-build.ts`: the "Indexes, sitemap and preview images" paragraph (stale: "755 URLs… lastModified is the moment of the build") and the following OG paragraph.
- `tests/claims.test.ts`: import `sitemap` from `@/app/sitemap` (already a pattern `tests/seo.test.ts` uses), add one case asserting `arch-build.ts` states the live `sitemap().length`.
- `tests/seo.test.ts`: already imports `sitemap`, `topicCoverMetadata`, `topicChapterMetadata`, `exercises`, `topics`, etc. Add cases per the matrix: the three additions/one removal; `lastModified` not "now"; `og:image` on every cover and chapter; `ogImageFor` resolution for a few representative paths via `pageMetadata` directly; `practiceChapterLinks()` naming every written chapter's real topic.

## Tasks & Acceptance

**Execution:**
- [ ] `lib/metadata.ts` -- per-section `og:image`/`twitter:image` default -- S1
- [ ] `app/practice/PracticeClient.tsx`, `lib/practiceLinks.ts`, `components/practice/PracticeWorkspace.tsx` -- the breadcrumb names the problem's real topic -- S3
- [ ] `lib/site.ts`, `app/sitemap.ts` -- add/drop entries; content-derived `lastModified` -- S7, S8
- [ ] `content/architecture/arch-build.ts`, `tests/claims.test.ts` -- the refreshed, asserted URL count and lastModified description -- truth
- [ ] `tests/seo.test.ts` -- covers every row in the matrix -- guard

**Acceptance Criteria:**
- Given any written chapter or topic cover, when its metadata is read, then `openGraph.images` and `twitter.images` are non-empty.
- Given a DSA or React problem page, when its breadcrumb renders, then the middle crumb names that problem's real topic, not "JavaScript", except in free-play mode.
- Given `sitemap()`, when read, then it contains `/mock`, `/interview/questions` and `/privacy`, omits `/practice`, and no entry's `lastModified` is within the last minute.
- Given `npm run check`, when it runs, then `tests/claims.test.ts` and `tests/seo.test.ts` pass with the new cases.

## Implementation Notes

- The plan was written after investigation and implementation had already run together in the coordinating session (not dispatched to a fresh subagent), because the scope only became clear through investigation (checking Next's actual metadata-merge behaviour, the real sitemap breakdown, and which fields exist on content). The plan documents the implementation as built; review runs the full four-lens set regardless, matching the change's real size (9 files).
- Confirmed empirically (not guessed): Next's metadata resolution **replaces** `openGraph` wholesale when a page sets its own (it does not merge `images` in from a parent's file-convention image) — this is why even the bare `/react`, `/dsa`, `/notes`, `/system-design` covers needed the fix, not only their sub-chapters.
- Confirmed empirically: every topic's notes file already has a `meta.updated` field ("Month YYYY"); `Exercise` and `GIT_CHAPTERS` entries have no date field at all, which is what forces the shared-constant fallback and resolves the ticket's open question without touching `git log` at build time.
- The sitemap's pre-existing `arch-build.ts` count ("755 URLs… 538 problem pages, 201 written chapters, 5 level pages, 11 top-level pages") was already wrong before this story (the live count was 781, not 755) and was never asserted by a test. This story does not reconstruct the old four-way breakdown; it states one total, now asserted.

## Plan Change Log

## Review Triage Log

### 2026-10-01 — Review pass
- verdicts: 11 findings — high 0, medium 3, low 6, false 2, maybe-false 0
- findings:
  - `[false]` `[reject]` The home page (`/`) ships with no `og:image` because `app/page.tsx` sets no `openGraph` of its own — verified empirically against a production build (`curl` on `/`): Next's file-convention `opengraph-image.tsx` at the root still injects the image, since neither `app/page.tsx` nor `app/layout.tsx` overrides `openGraph.images`. The claim does not hold.
  - `[medium]` `[patch]` `/level/<topic>` pages (e.g. `/level/react`) call `pageMetadata` with a path no `SECTION_IMAGES` prefix matches, so they fall to the generic default instead of their topic's own image — `ogImageFor` now strips a `/level/<id>` path to `/<id>` before matching, so `/level/react` resolves to `/react/opengraph-image`; a topic with no section image still gets the generic default. Covered by the extended section-image test.
  - `[medium]` `[patch]` The section-image identity test covered only 2 of 8 prefixes, so a typo or dropped entry in 6 sections would pass every existing test — extended to check all 8 sections, both the bare cover and a nested page, plus the new `/level/*` behaviour.
  - `[medium]` `[patch]` The lastModified tests could not tell a real per-topic date from the shared fallback constant (both satisfy "not within the last minute") — added a test comparing an August-dated written topic (DSA) against a September-dated one (React) and against the fallback used for `/problems`.
  - `[low]` `[defer]` The breadcrumb component's use of `chapter.topic.name`/`chapter.topic.href` in the JSX (label vs href) is untested at the render level; only the data `practiceChapterLinks()` returns is tested — the repo has no React-render test infrastructure (no Testing Library dependency), and adding one here would start a new pattern rather than extend an existing one. Fits a future UI-testing story, not this one.
  - `[low]` `[reject]` `notesData("git")` resolves to `EMPTY_NOTES` (`meta.updated === ""`), so `/git`'s cover sitemap entry silently uses the fallback constant rather than a parsed date — this is exactly the designed behaviour for content with no topic-level date (git's content lives in `content/git-body.ts`, not a `NotesFile`), not a bug; noted in Design Notes for clarity.
  - `[low]` `[reject]` One shared constant covers unrelated undated content (problems, git chapters, mock, privacy, whiteboard), so bumping it for one area resets `lastModified` everywhere in that bucket — the plan's Boundaries explicitly excludes per-chapter real dates and names the shared-constant fallback as the chosen design; the fix (per-item dates) is far more than a direct correction.
  - `[low]` `[reject]` `arch-build.ts` drops the old four-way URL breakdown for a single total — the plan's Implementation Notes record this as a deliberate scope cut; the old breakdown was already stale and unasserted before this story, and reconstructing it is not a direct correction.
  - `[low]` `[reject]` The fallback breadcrumb branch (`chapter === null`) still hard-codes "JavaScript"/"/notes" — the plan's Boundaries names this as the correct free-play default, not a bug.
  - `[false]` `[reject]` `practiceChapterLinks()` skips the `js` topic (since `js`'s `notesHref` differs structurally), conflating JS-chapter problems with genuine free play — confirmed harmless: the fallback is literally "JavaScript"/"/notes", which is the correct label for a JS chapter too, so no incorrect output results.
  - `[low]` `[reject]` No new test renders `PageFrame`/`PracticeWorkspace` directly to catch a field swap in the Crumbs JSX — same reasoning as the deferred finding above; grouped with it.

## Design Notes

`og:image` defaults are chosen by path prefix against the nine routes that already exist, rather than adding 13 more per-topic image routes, because the ticket frames this as a `lib/metadata.ts` fix (the audit's "quick" option), not new build-time image generation for every topic.

`lastModified` uses topic-level granularity (one date per topic, covering its cover, level page and every chapter), not per-chapter dates, because no per-chapter date exists in the content model today; adding one would mean hand-dating hundreds of objects, well beyond this story's scope. This still fully resolves the bug it targets: entries are stable across deploys and only change when a human bumps the relevant date, instead of silently retraining crawlers to ignore `lastmod` on every single push.

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: pass.
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build && PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run test:e2e` -- expected: all pass. e2e serves on 3100; never touch 3000.

- **2026-10-01, e2e flake unrelated to this change.** `e2e/smoke.spec.ts:628` ("python can be stepped through too") failed once on a full run (`Test timeout of 30000ms exceeded` waiting on Pyodide, a jsDelivr-fetched WASM runtime) and passed on an isolated retry in 14.3s. Nothing in this story touches Python, Pyodide or the debugger; this is pre-existing network-dependent flakiness.

## Auto Run Result

**Summary:** `pageMetadata()` now sets `openGraph.images`/`twitter.images` from a per-section default (one of the nine existing `opengraph-image.tsx` outputs, matched by path, including `/level/<topic>` pages), reaching every page that calls it — fixing the og:image gap on about 770 of 781 sitemap URLs. Problem breadcrumbs name the problem's real topic instead of always "JavaScript". `/mock`, `/interview/questions` and `/privacy` are in the sitemap; `/practice` is out. Every sitemap entry's `lastModified` comes from content: a topic's own `meta.updated` month, or one shared, hand-bumped constant for everything without a content date.

**Files changed:**
- `lib/metadata.ts`: `SECTION_IMAGES`, `ogImageFor` (with `/level/<topic>` handling), `images` on both `openGraph` and `twitter`.
- `app/practice/PracticeClient.tsx`, `lib/practiceLinks.ts`, `components/practice/PracticeWorkspace.tsx`: `ChapterLink.topic`, populated per chapter, used in the breadcrumb.
- `lib/site.ts`: `UNDATED_CONTENT_LAST_CHANGED`.
- `app/sitemap.ts`: `/mock`, `/interview/questions`, `/privacy` added; `/practice` dropped; `topicLastModified()` drives every entry's date.
- `content/architecture/arch-build.ts`: the sitemap and OG paragraphs, refreshed and asserted.
- `tests/claims.test.ts`, `tests/seo.test.ts`: the new URL count; the three sitemap additions/one removal; non-"now" dates, including a cross-topic date-differentiation check; og:image on every cover, chapter and all eight sections (plus `/level/*`); every written chapter's breadcrumb naming its real topic.

**Review findings:** 11 findings (medium 3, low 6, false 2). Three medium entries patched: `/level/<topic>` now resolves to its topic's own image; the section-image test now covers all eight sections instead of two; a new test distinguishes a real per-topic date from the shared fallback. One low finding deferred (frontmatter `deferred`): the breadcrumb's JSX field order is untested at the render level, since the repo has no component-render test infrastructure. The rest were rejected: one false claim (checked empirically against a production build — the home page already has an `og:image` via Next's file convention, since neither `app/page.tsx` nor `app/layout.tsx` sets its own `openGraph.images`), and five items matching the plan's own stated Boundaries or Design Notes (the shared fallback constant's granularity, the dropped URL-count breakdown, the free-play breadcrumb default, and the `js`/`git` data-shape quirks).

**Follow-up review:** recommended (`true`), since three medium entries were patched and this story edits SEO-sensitive metadata read by search engines in production.

**Verification:** `npm run check` passes (19 files, 320 unit tests). `npm run build` passes, and `npm run test:e2e` passes 152/152 on port 3100. One unrelated flake (`python can be stepped through too`, a Pyodide network timeout) failed once on the first full run and passed in isolation in 14.3s; nothing in this diff touches Python or the debugger.

**Residual risks:**
- `UNDATED_CONTENT_LAST_CHANGED` is one constant shared by every piece of undated content (problems, Git chapters, mock, the question bank, privacy, home, the whiteboard); bumping it for one area resets `lastModified` for all of them. This is the documented, in-scope tradeoff for avoiding a build-time `git log` dependency.
- `/path` cannot get a per-topic image, since its topic comes from a client-side query string, not the server path.
- Ten topics with no dedicated `opengraph-image.tsx` (css, html, typescript, nextjs, nestjs, node, docker, databases, testing, security, cloud-devops) still get the generic root image. Adding one each is a follow-up, not this story's "quick" scope.
