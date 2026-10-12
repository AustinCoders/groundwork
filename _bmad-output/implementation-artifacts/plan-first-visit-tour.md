---
title: 'A first-visit tour: a short, skippable, CSS-3D walkthrough shown after the page has loaded'
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
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/implementation-artifacts/plan-stage-compositions-v2.md', '{project-root}/_bmad-output/implementation-artifacts/plan-sidebar-and-menu-v3.md']
warnings: ['oversized']
deferred: []
baseline_revision: 'd3ee5b7'
---

<intent-contract>

## Intent

**Problem:** The site just went through a big redesign and has many features a first-time visitor cannot guess: topics and levels, the chapter reader, the playground and problems, the interview book and the mock interview, review and progress, and where the menu is. The owner proposed a demo with 3D animation that explains everything on a visitor's first load. I advised against a blocking intro before load (it delays content for a free study site, hurts the first-load budget and search ranking, annoys returning readers and people who arrive on a chapter from search, and is poor for accessibility) and the owner approved this alternative.

**Approach:** A short tour that appears only AFTER the page has loaded, never blocks reading, and is always skippable:
- An unobtrusive prompt card (not a full-screen takeover) appears a moment after the page is interactive, on the first visit only: "First time here? Take a 30-second tour", with "Start the tour" and "Skip" (and `Esc` closes it). Dismissing or finishing remembers the choice in `localStorage` (one new, versioned key, for example `groundwork:tour` with `{v:1, seen:true, at}`), so it never reappears on that browser.
- "Start the tour" opens a dialog-style overlay with 5 slides and a visible Skip button at all times (also `Esc`, arrow keys to move, focus trapped inside, focus returned to the opener, `aria-modal`). The slides use CSS 3D transforms only (no WebGL, no canvas, no extra library), built from the family's stage pieces (the Compose kit, taped cards, stickers, notes): a slow, small tilt and rotate-in of stacked cards, a card flip, a book turn echo. No autoplay-forever loops; each slide animates once and rests.
- Slides (the copy is short, in the site's voice, each with one composed 3D stage and one primary action button where it helps):
  1. Topics and levels: pick a topic, answer "how much do you already know", get a path.
  2. Chapters: read in short parts, the sidebar and "On this page", mark as read.
  3. Practice: the playground and problems run real code against real tests in the browser.
  4. Interview book and mock interview: rounds, follow-ups, a timed mock with a debrief.
  5. Review and progress: spaced review brings chapters back; progress lives in this browser. Ends with "The Menu is here" pointing at the Menu pill (a hand arrow touching the pill's real position, or a sticker in the slide that mirrors it), plus Ctrl/Cmd+K to search.
- Where it shows: only the first visit, only on the home page and on topic pages (the topic covers, level pickers, path pages), never on a chapter, exercise, mock room, whiteboard or any deep page a visitor lands on from a search result, and never when `prefers-reduced-motion` would make the animation the main point: with reduced motion the slides are the same content as static, still composed cards with no animation.
- Way back: a "Take the tour" row in the site menu (in the Go to or the footer area of the drawer, one plain row with a small icon, not a new section), which opens the overlay directly from any page, regardless of the stored flag.

## Boundaries & Constraints

**Always:**
- Does not delay content: the tour component is loaded lazily (dynamic import after idle or after the load event), adds no weight to the first-load bundle of the home page beyond a tiny trigger (measure the first-load JS before and after and report it; the existing performance budget test in the repo must stay green), causes no layout shift, and does not render anything in the server HTML that depends on the stored flag (no hydration mismatch or flash: the prompt appears only after mount).
- Accessibility: `role="dialog"` with `aria-modal`, labelled, focus moves into it and is trapped (reuse `components/FocusTrap.tsx`), `Esc` closes, arrow keys and visible Previous or Next buttons move, slide changes are announced politely, every slide's content is real text (not only animation), the prompt card is a non-modal region that does not steal focus and can be dismissed by keyboard, tap targets 44px, contrast passes in all nine themes (axe).
- Motion: CSS transforms and opacity only on `transform` and `opacity` properties, no part-transparent text at rest (a slide shows fully opaque text once it has settled; animate cards, not the text), reduced-motion safe, nothing animates forever.
- Family look: Compose kit, taped cards, hand notes with attached arrows, the `--t-*` scale, handwriting fonts, theme tokens; works in all eight fonts and nine themes and at 320 to 2560 (on phones the slides stack and the 3D tilt reduces to a small transform).
- Storage: one new versioned key, listed in the architecture chapter that counts storage keys; bad or old values fall back to "not seen".
- Tests: unit tests for the storage helper and the "should it show" decision (path rules, flag, reduced motion); e2e for first visit on home shows the prompt after load and not before, Skip and Esc dismiss and persist, a chapter URL on first visit shows nothing, the menu row opens the tour, keyboard flow and focus return, axe on the prompt and on each slide in nine themes at 1440 and 390, no horizontal scroll at 320, the first-load JS delta is small and reported. Update the architecture chapters whose numbers the claims test asserts.

**Never:** comments in source (`npm run comments` fails them); hex, white or literal colours (theme tokens only); WebGL, canvas, video, or a new animation library; autoplay audio; blocking the page before load; showing the tour on deep pages; editing `.claude/skills/` or `_bmad/`; the whiteboard (`app/whiteboard/**`, `lib/**` except a new small storage helper if truly needed, `app/mock/Whiteboard.tsx`) stays untouched; touching port 3000 or any broad `pkill`; committing, pushing or staging (the coordinator does that).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| First visit, home | No stored flag | Page loads and is usable; a moment later the prompt card appears; nothing shifts | none |
| Skip or Esc | Prompt or any slide | Closes, stores seen, focus returns, never shows again | storage blocked: show at most once per page load |
| Finish the tour | Last slide Done | Stores seen, closes, focus to the Menu pill | none |
| Arrive on a chapter from search | No flag | Nothing appears | none |
| Returning visitor | Flag set | Nothing appears | none |
| Menu "Take the tour" | Any page, flag set or not | Opens the overlay at slide 1 | none |
| Reduced motion | Preference | Same slides, static composed cards | none |
| No JS | JS off | No tour, site fully usable | none |
| Phone | 390 and 320 | Prompt card sits clear of the Menu pill and content; slides stack | none |

</intent-contract>

## Code Map

- `app/layout.tsx` (mount point for the lazy trigger), a new `components/tour/*` (trigger, overlay, slides, storage helper, css module), `components/SiteDrawer.tsx` and `components/menu/*` (the "Take the tour" row), `components/FocusTrap.tsx`, `lib/storage.ts` (new key)
- `components/topic/Compose.tsx`, `compose.module.css`, `components/home/Stage.tsx`, `components/ui/MenuKit.tsx` -- the family pieces to reuse
- `e2e/*.spec.ts`, `tests/*`, `tests/perf*` or the first-load budget test, `content/architecture/*` (storage keys, client files, CSS modules, tests)

## Tasks & Acceptance

- Given a fresh browser on `/`, then the page is fully usable before any tour UI appears, the prompt appears after load without layout shift, and Skip persists.
- Given a fresh browser on a chapter or exercise URL, then no tour UI appears.
- Given the menu, then "Take the tour" opens the overlay from any page and the overlay is fully keyboard operable with focus trapped and returned.
- Given all slides in nine themes, eight fonts and 320 to 2560 wide, then nothing is clipped, axe passes, motion is reduced-motion safe.
- Given `npm run check`, `npm run build` and the full e2e in a clean copy, then all pass, the first-load JS of `/` grows by no more than a small trigger (report the number), and architecture numbers asserted by `tests/claims.test.ts` are updated.

## Implementation Notes

(agent: log progress here, newest last)

**Build (components/tour/*)**
- `TourTrigger.tsx` (client, mounted once in `app/layout.tsx` inside `TopicsNavProvider`) imports nothing from `lib/` or the page kits, so it adds almost nothing to the first load. The server layout passes it `covers`, the list of topic cover paths (`coverPaths(topics, guideIds)` from `tourRules.ts`). After the `load` event plus 1.6 s it loads `TourHost` with a plain `import()` and only then shows the prompt; nothing is rendered on the server or on the first client render, so there is no hydration mismatch or one-frame flash. The first attempt used `next/dynamic` and `useTopicsNav`/`lib/storage`; that grew the home page's first-load JS by about 8 KB gzipped, so both were removed (the cover paths come from the server, and `tourStore.ts` reads `localStorage` itself).
- `tourStore.ts`: key `groundwork:tour`, value `{v:1, seen:true, at}`, parsed strictly (anything else counts as not seen), written once and never overwritten when valid. It does not go through `lib/storage.ts` (keeps the trigger tiny); no `lib/` file was edited.
- `tourRules.ts`: `isTourPage` (home, topic covers that are not guides, `/level/<topic>`, `/path/<topic>/<level>`; never chapters or any deeper page, never `/mock`, `/whiteboard`, `/problems`, `/practice`), `shouldOfferTour` (not seen, not already shown this page load, eligible path), the open event name and the delay. Reduced motion does not change whether the tour is offered; the slides are the same and static.
- `TourPrompt.tsx`: a non-modal `role="region"` card portalled to the end of `body` (fixed, bottom right on desktop, bottom full width on phones, clear of the Menu pill, never takes focus). Start the tour, Skip, and Escape (ignored in text fields and while a modal is open).
- `TourDialog.tsx`: `role="dialog"` `aria-modal`, `FocusTrap` from the drawer, focus on Next at open, one slide mounted at a time (`key` per slide, so two slides never overlap), arrow keys, Back/Next/Done, "Skip tour" in the header at all times, a polite status line for each step, passive progress dots, backdrop click and Escape close. Closing writes the flag and returns focus to the opener, or the Menu pill when the opener is gone (and always the pill after Done).
- `slides.tsx`: five slides, each a heading, a lead, an optional action link and one stage composed with `Compose`/`Card`/`Tag`/`Remark`/`Facts` (trio and rail layouts, tilts only -1/0/1, one tape per taped card, notes hung under bottom-row cards). The stage is `aria-hidden`; the same information is in the real text.
- `tour.module.css`: tokens only, `--t-*` sizes, weights 400 and 700. All animation is in one `prefers-reduced-motion: no-preference` block and only animates `transform` (cards `perspective()` tilt-in with a small stagger, a page turn on the chapter card, a one-time card flip on the interview card) and, for the scrim only, `opacity`. Nothing loops; text is never faded. At rest every transform is `none`. With reduced motion the flip card rests on its answer face, which also carries the question line.
- Menu: a "Take the tour" button in the drawer's foot (`SiteDrawer.tsx`, new `tour` icon in `MenuIcon.tsx`) closes the drawer and dispatches `groundwork:tour-open`; the trigger opens the dialog at slide 1 from any page, flag or not.

**Tests**
- `tests/tour.test.ts` (29): flag parsing and storage failures, path rules, the offer decision, slide copy, lazy loading and a no-`lib`-import trigger, token-only CSS, one-shot animations, 44px targets.
- `e2e/tour.spec.ts` (25 written tests, about 75 runs): prompt after load with zero layout shift after it appears, no focus theft, chunk loaded after the load event, Skip and Escape persist, bad saved values, blocked storage (once per page load), where it shows and where it never does, the menu row from four pages, keyboard flow and focus return, one slide at a time, fully opaque text on every frame, finite animations resting at `transform: none`, reduced motion, `probeComposition` on every slide at five sizes, the prompt clear of the Menu pill, nothing clipped in all eight fonts.
- `e2e/a11y.spec.ts`: two new seeded states, the prompt and each of the five slides (scoped to the prompt and to the dialog), nine themes at 1440 and 390.
- `playwright.config.ts` now seeds the seen flag in every test's storage state so the existing specs never meet the prompt; `tour.spec.ts` clears it with `test.use`.
- Architecture chapters updated for the new numbers (`arch-state`, `arch-design-system`, `arch-rendering`, `arch-tech-stack`, `arch-testing`, `arch-health`).

**Gates (clean scratch copy, final code)**
- `npm run build` ok; `npm run check` ok (998 unit tests in 48 files, 0 errors, the one old lint warning in `components/topic/useReadingPlan.ts`); full `npx playwright test --workers=3 --retries=0`: 563 of 563 passed.
- A first full run found one real failure, axe `scrollable-region-focusable` on the tour body at 390 (the scrolling step region had nothing focusable); fixed by making the region focusable (`role="region"`, `tabIndex=0`, a focus ring), then the build, check and the full e2e were repeated.

**Measured**
- First-load JS of `/` before: 276,767 bytes on the wire (18 scripts, 314,469 bytes gzip across the HTML's chunks, 999,399 raw); after: 278,742 on the wire (19 scripts, 316,429 gzip, 1,003,496 raw): about +2 KB gzip. The tour's own chunk (about 17 KB on the wire) loads only after the page has loaded and the prompt is due.

## Plan Change Log

## Review Triage Log

## Verification

**Commands:**
- in a clean scratch copy: `npm run build`, then `npm run check`, then `npx playwright test --workers=3 --retries=0` -- expected: all green

**Manual checks:**
- Own screenshots of the prompt and every slide at 390 and 1440, light and Night, Classic and Roboto and Chalk; a recorded sequence of frames for one slide's animation to prove it settles with opaque text.

## Auto Run Result

Built. Independent check in a clean copy on the final code: `npm run build` ok; `npm run check` 998 unit tests in 48 files (one pre-existing lint warning in `components/topic/useReadingPlan.ts`); full e2e 563 of 563 with no retries. `git diff --stat -- app/whiteboard lib app/mock/Whiteboard.tsx .claude _bmad` is empty (no `lib/` file edited; the tour keeps its own small storage helper in `components/tour/tourStore.ts`). The tour shows only after the `load` event plus 1.6 s, only on the home page, topic covers, level pickers and path pages, and only until `groundwork:tour` is set; five slides in CSS 3D, one mounted at a time; a "Take the tour" button in the drawer foot reopens it from any page. First-load JS of `/` grew by about 2 KB on the wire (276,767 to 278,742 bytes); the tour chunk is about 17 KB and loads lazily. Not run: `npm run test:perf` (Lighthouse CI). The e2e suite runs with the seen flag pre-seeded in `playwright.config.ts`, except `tour.spec.ts`. Screenshots reviewed by the coordinator: the prompt at 1440x900 light, slides 1 and 4 at 1440x900 light, slide 5 at 390 Night. Verified by script: the prompt is absent at 1 s and present at 4 s on a fresh visit. Not verified by the coordinator: the 3D motion itself (frames), screen-reader output, other themes and fonts, 320 wide. Noted by the agent: on phones the dialog body scrolls inside the dialog on some slides, and at 1440x900 the prompt covers part of the home hero's lower-right card until dismissed.
