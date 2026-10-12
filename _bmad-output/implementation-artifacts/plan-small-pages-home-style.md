---
title: 'The last four old pages in the home language: the Git landing, privacy, 404 and the error pages'
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
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/implementation-artifacts/plan-stage-compositions-v2.md', '{project-root}/_bmad-output/implementation-artifacts/plan-topic-pages-home-style.md', '{project-root}/_bmad-output/implementation-artifacts/plan-review-home-style.md']
warnings: ['oversized']
deferred: []
baseline_revision: '8314c78'
---

<intent-contract>

## Intent

**Problem:** Every other page of the site is now in the home language (home, menu, topic pages, chapters, interview book, architecture, practice workbench, mock, review, progress, composed hero stages). Four things are still the old site: the Git landing (`/git`, rendered by `components/series/SeriesLanding.tsx` with `landing.module.css`, the only user of that component), the privacy page (`/privacy`), the 404 page (`app/not-found.tsx`) and the two error pages (`app/error.tsx`, `app/global-error.tsx`). The owner asked to finish these.

**Approach:** Bring each into the family using the shared kits (`components/topic/Compose.tsx` and `compose.module.css`, `TopicKit`, `Journey`, `MenuKit`, `ChapterKit`, `FrameHeader`/`PageFrame`, the home pieces):
- **Git landing:** the same shape as a topic cover with a one-screen hero (the topic's big question, a composed stage using the Compose kit with the git hero figure on a taped paper card, a numbers table from `gitFacts()`), then numbered bands: the parts of the guide as a trail of chapters with read ticks, a "start here" entry and an honest note. After this, `SeriesLanding.tsx`, `landing.module.css` and any rules only they used are deleted (no dead code). The Git chapters already use the chapter kit; keep them working.
- **Privacy:** a calm reading page in the chapter style (hero with a numbered kicker, then numbered bands per section with the full-width prose layer), the same words and facts as today (nothing is added or removed in meaning; shorten only where you can without changing a claim), a "what is stored in your browser" table as a numbers-style table from the real storage keys if the page lists them today.
- **404:** a one-screen scene: a big "404" stamp on a taped card, the line "Nothing written on this page", a primary "Back to all topics" pill, an outline pill to the DSA notes, and a small "Search" or "Open the menu" hint pointing to the Menu pill and Ctrl or Cmd K; compose with the kit.
- **Error pages:** `app/error.tsx` (inside the layout, so it can use the theme, the family chrome and the kit) as a one-screen scene with a retry pill and a link home, with an honest short message and the digest in a small mono line; `app/global-error.tsx` replaces the root layout, so it cannot rely on the app CSS or fonts: keep it self-contained with inline styles, theme-neutral and readable in light and dark (prefers-color-scheme), but make it visually the same family as far as inline styles allow (paper tone, handwriting-like system fallback, the same pill buttons, a taped card look); it must still report the error and offer a reload.

## Boundaries & Constraints

**Always:**
- Start from fresh screenshots of the four pages at 1440x900 and 390 (Night and light, Classic), reuse the kits and tokens; anything shared goes in the shared place.
- Behaviour unchanged: metadata, canonical paths, the Git search and progress prefix logic (`lib/gitSeries`), `HashRedirect`, error reporting (`reportError`), the 404 status, the reset action of the error boundary, every e2e role and name (or update the tests in the same change).
- Typography: the `--t-*` scale on `:root`; weights 400 and 700; nothing under 12px; eight handwriting styles and nine themes must hold (the global-error page is exempt from fonts and themes but must meet contrast in light and dark).
- Rules learned in earlier rounds: header gap at least clamp(48px, 8vh, 96px) above the highest decoration, a measured one-screen hero capped in height, balanced space above and below, text uses the full width of its panel, nothing part-transparent at any scroll position, no `data-fx`, no one-frame flash before hydration, reduced-motion safe, tap targets 44px, no horizontal scroll at 320. The new compositions must satisfy the existing `e2e/compose.spec.ts` rules (tilts, tape, notes attached, columns aligned), and `tests/compose.test.ts` should cover the new users.
- Add e2e coverage: the Git landing in the hero-measure test and the axe states; 404 and the error page rendered (use an existing way to trigger them, or a test-only route that is not shipped); privacy axe in nine themes if not already.

**Never:** comments in source (`npm run comments` fails them); hex, white or literal colours in module CSS (theme tokens only; `global-error.tsx` is the one place where literal colours in inline styles are allowed because no stylesheet is available, keep the current pattern and test exceptions); hard offset shadows; edits to `.claude/skills/` or `_bmad/`; touching port 3000 or any broad `pkill`; the whiteboard (`app/whiteboard/**`, `lib/**`, `app/mock/Whiteboard.tsx`) stays untouched; committing, pushing or staging (the coordinator does that).

## Code Map

- `app/git/page.tsx`, `app/git/[section]/page.tsx`, `components/series/SeriesLanding.tsx`, `landing.module.css`, `lib/gitSeries.ts` (read only), `content/git-body.ts` (read only)
- `app/privacy/page.tsx`, `privacy.module.css`
- `app/not-found.tsx`, `app/error.tsx`, `app/global-error.tsx`
- `components/topic/Compose.tsx`, `compose.module.css`, `TopicKit.tsx`, `components/ui/MenuKit.tsx`, `components/chapter/ChapterKit.tsx`, `components/frame/*`, `components/home/*`
- `e2e/*.spec.ts`, `tests/*`, `content/architecture/*`

## Tasks & Acceptance

- Given `/git`, `/privacy`, a missing URL and a thrown render error at 320, 390, 1440 and 1920, then each is visibly the same family as the rest of the site, nothing overlaps, and the one-screen scenes measure like the other heroes.
- Given `SeriesLanding.tsx` and `landing.module.css`, then they are deleted with no dangling imports or rules.
- Given eight handwriting styles and nine themes, then nothing is clipped and axe passes on these pages.
- Given `npm run check`, `npm run build` and the full e2e in a clean copy, then all pass; architecture chapter numbers asserted by `tests/claims.test.ts` are updated.

## Implementation Notes

(agent: log progress here, newest last)

**Round 1 (build)**
- Kit: `components/topic/Compose.tsx` got one new layout, `banner` (slot a across the top, b and c under it), with its grid in `compose.module.css` and a branch for it in `e2e/composeProbe.ts` (second-row tops and bottoms aligned, even gutters). No other kit change. Tilts on the Git stage are a -1, b 0, c +1, because a bounding box counts both tilted corners and -1/+1 next to each other closed the row gap under 6px at 1280x720.
- Git landing: `app/git/GitView.tsx` + `git.module.css` (client view; `page.tsx` passes the cards, parts, facts and the hero figure string, so no client file imports content/). Hero is a topic-cover hero at 4fr/8fr: kicker, "What is Git really doing?", lead, Start/Continue pill and "The four parts" (hidden until hydration), chips; stage = taped commit-graph card, numbers table card from `gitFacts()` with a "free to read" sticker, and a "Start here" note card (chapter one, hand note attached). Bands: 01 three doors (Steps: new to Git, something went wrong, interview this week, each to a real chapter), 02 the four parts as Journey trails with a tick per read chapter and "pick up here" (read state only after mount), 03 three honest notes, footer. The figure's SVG text is raised to `--t-heading` for branch labels and `--t-control` for hashes (kept small so "c04b8a" stays clear of the hotfix curve); on phones the hashes are hidden and labels use `--t-display`, so the whole graph fits with no sideways scroll.
- Deleted: `components/series/SeriesLanding.tsx`, `landing.module.css`, and `components/chapter/ChapterCard.tsx` and `PartSection.tsx` (only SeriesLanding used them); the `landing.module.css` entry in `tests/theme-roles.test.ts`.
- Privacy: `app/privacy/page.tsx` keeps every word (section titles, paragraphs, the five list items, whose bold lead-ins became block headings without their full stops), now as five numbered bands (`PrivacySection`: eyebrow + title on the left, sticky on desktop; paper panel with the shared `.prose` layer on the right), under a one-screen hero (`PrivacyHero`, rail layout: contents card with anchors, "In short" note, questions card). No storage-keys table: the page never listed keys. "Last updated" moved into a chip.
- 404 and error: shared `components/frame/LostScene.tsx` + `lost.module.css` (rail layout: taped stamp card with blank dashed lines, a places-to-go card, a note card with the hand note). `app/not-found.tsx` (status still 404, Menu pill and Ctrl or Cmd K hint, key label after hydration only) and `app/error.tsx` (reset pill, link home, mail link, digest in a mono line, same reportError call). `app/global-error.tsx` now carries a `<style>` from `components/frame/globalErrorCss.ts` (literal colours, light and dark by `prefers-color-scheme`, taped card, pills, handwriting-style system stack); its "Back to the start" is a button that does `window.location.replace("/")`.
- Tests: `e2e/failToLoad.ts` triggers the real error boundary without any shipped test code (open /privacy, abort `_next/static/chunks/**`, client-navigate to Review => ChunkLoadError). It needs a fresh browser context per attempt (a second attempt in one context hydrates anyway). New: error scene and 404 checks, git landing flash test, privacy structure test (smoke); error state (a11y); git, privacy and 404 in the compose spec pages, themes, fonts and numbers-table lists plus a new error-scene test; git, privacy and 404 in the hero-measure test; `tests/global-error.test.ts` (contrast of the inline palette in light and dark, sizes, report and reload kept); `topic-type` and `compose` unit tests cover the new modules. Architecture chapters: 56 CSS modules, 96 client files, 55 axe states, 177 a11y tests, 204 smoke tests (178 flows), compose row 9, 467 browser tests, 964 unit tests, plus a short section in the design-system chapter. Spelling words Segoe and Consolas appended.
- Gates (clean scratch copy, after the last change): `npm run build` ok; `npm run check` ok (964 unit tests in 47 files; the only lint warning is the existing unused `topicId` in `useReadingPlan.ts`); full e2e 485 of 485, no retries. Reviewed by eye on my own `next start`: /git, /privacy, 404 at 1280x720, 1440x900, 1920x1080 and 390 in Night, Paper, Sepia, Blueprint, Rose, Lavender with Classic, Marker, Chalk, Sketch, Pen, Script, Reading and Roboto; the error scene (Paper, 1440); the global-error page in light and dark at 1440 and 390 (axe clean).
- Findings outside scope: `display: optional` handwriting fonts plus Next emitting no font preload on any not-found render (checked: `/nope`, `/git/zzz`, and the prerendered `_not-found.html`) means the first visit to a missing URL can paint in the fallback font. Fix would be in `lib/fonts.ts` (not touched). "Try again" on a ChunkLoadError does not recover (React keeps the rejected lazy chunk); only a reload does. That is the existing `reset` behaviour and was left alone. Also `components/topic/useReadingPlan.ts` has an unused `topicId` lint warning that was already there.

## Plan Change Log

## Review Triage Log

## Verification

**Commands:**
- in a clean scratch copy: `npm run build`, then `npm run check`, then `npx playwright test --workers=3 --retries=0` -- expected: all green (a known home rail landing test can flake under load; rerun it alone before reporting a failure)

**Manual checks:**
- Own screenshots at 390, 1440 and 1920, Night and light, Classic and Roboto and Chalk, of the four pages plus the global-error page in light and dark.

## Auto Run Result

Built. Independent check in a clean copy on the final code: `npm run build` ok; `npm run check` 964 unit tests in 47 files (one pre-existing lint warning in `components/topic/useReadingPlan.ts`); full e2e 485 of 485 with no retries. `git diff --stat -- app/whiteboard lib app/mock/Whiteboard.tsx .claude _bmad` is empty. The Git landing (`app/git/GitView.tsx`), the privacy page, the 404 and error scenes (`components/frame/LostScene.tsx`) and the self-contained `app/global-error.tsx` (CSS in `components/frame/globalErrorCss.ts`) were rebuilt on the Compose kit; `SeriesLanding.tsx`, `landing.module.css`, `ChapterCard.tsx` and `PartSection.tsx` were deleted. Screenshots reviewed by the coordinator in Night or light, Classic, 1440x900: `/git`, `/privacy` and the 404. Not viewed by the coordinator: the error scenes, phone sizes, other themes and fonts. Known issue left for the QA round: on a first visit to a missing URL the 404 paints in the fallback font because Next emits no font preload on not-found renders and the handwriting fonts use `display: optional`; the fix belongs in `lib/fonts.ts`. Also noted by the agent: "Try again" after a failed chunk load does not recover until a reload (existing behaviour), and the Git hero figure's labels are 8 to 10px on phones because the diagram is scaled down.
