---
title: 'A first-visit tour: a short, skippable, CSS-3D walkthrough shown after the page has loaded'
type: 'feature'
ticket: ''
created: '2026-10-13'
status: 'draft'
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
baseline_revision: 'SET_AT_START'
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

## Plan Change Log

## Review Triage Log

## Verification

**Commands:**
- in a clean scratch copy: `npm run build`, then `npm run check`, then `npx playwright test --workers=3 --retries=0` -- expected: all green

**Manual checks:**
- Own screenshots of the prompt and every slide at 390 and 1440, light and Night, Classic and Roboto and Chalk; a recorded sequence of frames for one slide's animation to prove it settles with opaque text.
