---
title: 'Home redesign: a scroll timeline for the interview book and a stepper for how it works'
type: 'feature'
ticket: ''
created: '2026-10-08'
status: 'built'
route: 'full'
route_source: 'auto'
review: 'none'
review_source: 'auto'
lenses_ran: []
review_loop_iteration: 0
followup_review_recommended: false
context: ['{project-root}/AGENTS.md']
warnings: ['oversized']
deferred: []
baseline_revision: '5e1f951f4b863b2f7d82160bafce5a020b9df52f'
---

<intent-contract>

## Intent

**Problem:** Two homepage sections feel weak to the owner. "The interview book" is a horizontal strip of 230px cards that shows only a number and a title and scrolls sideways on every screen. "How it works" is a pinned, 340vh scroll story whose illustrations are small and leave a large empty area beneath them.

**Approach:** Redesign both on the existing `app/HomeView.tsx` and `app/home.module.css`. The interview book becomes a vertical timeline of rounds on one side and a sticky preview card on the other (what the round tests, the answer that loses the room, a sample question, a link to read it); the active round follows the reader's scroll and can also be chosen by click. How it works becomes a stepper: four clickable steps on the left and a live mini demo on the right that changes with the step, auto-advancing gently and stopping whenever the reader interacts, hovers, focuses, hides the tab or prefers reduced motion. No pinned scroll heights, no sideways scroll.

## Boundaries & Constraints

**Always:**
- Work on branch `feature/platform-topics` after the platform-topics commit; theme tokens only (no hex, no white); no comments in source; append new spelling words to the end of `.cspell/project-words.txt`; update the architecture chapters for every number or sentence these changes move (`tests/claims.test.ts` stays green).
- Interview book data: the rounds list comes from the server as a small serialisable prop built in `app/page.tsx` (not from `useGuidesNav()` in the client). A pure helper in `lib/` (for example `lib/homeRounds.ts`, no `"use client"`, unit-tested) turns `lib/interviewBook.ts`'s `bookRounds()` or `roundCards()` plus `bankQuestions()` into `{id, code, title, href, tests, wrong, sample}[]` for the rounds of the book (the ones whose code starts with "R"; not the scout or plan entries): `tests` is the first non-bulk question's "what they are really testing", `wrong` its "answer that loses the room" (falling back to the round's "Fail mode" meta, then to an empty string), `sample` its question; HTML is stripped to plain text and truncated on the server (about 160 characters for `tests` and `wrong`, about 120 for `sample`), with entities decoded; `href` is the round's `/interview/<id>` link. `HomeView` stays free of `content/` imports (`tests/client-bundle.test.ts`), and the total prop size stays under 12 KB (a unit test asserts it).
- Interview book layout: a section with id `loop` and the existing heading ("From the first call to the offer, round by round.") and eyebrow. Desktop (1081px and up): two columns, the timeline on the left (each round a button-like row with its code badge, round number text and title, a thin connecting line, and a final "The offer" node) and the preview card on the right, sticky below the page header. Below 1081px: one column with the preview card sticky at the top of the section and the timeline below it. The active round is set by an `IntersectionObserver` over the rows (the row crossing a line near the middle of the viewport wins) and by click or keyboard (Enter or Space on a row scrolls it to that line with `smoothScroll.to` and activates it); the rows are real buttons with `aria-current="true"` on the active one, and the preview card is a labelled region whose content updates with a polite live region only for user-initiated changes (not for scroll-driven ones). The preview card shows: "Round NN · code", the title, "What they are really testing", "The answer that loses the room", "A question you will get" and a "Read this round →" link to the round. No horizontal scroll at any width; the old `.track`, `.round`, `.sideWrap`, `.sidePin` and `.sideProgress` rules and their focus and glow entries are removed.
- How it works layout: keep `section#how`, the eyebrow, the h2 "Read it. Run it. Get asked about it. Keep it." as a visible `<h2>` (an e2e asserts it) and the sub copy. Below it: a two-column stepper (stacked on phones). Left: a vertical `role="tablist"` of the four steps (01 Read, 02 Run, 03 Get asked, 04 Keep), each tab with its number, title and one line of copy, `aria-selected`, roving tabindex, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Home and End, and a progress fill on the active tab while auto-advance runs. Right: a `role="tabpanel"` holding the live mini demo for the active step, reusing the existing visuals (layers, tests with ticking checks and "4 / 4 passed", chat with a typing indicator, review calendar lighting up the 0, 3, 10 and 31 day cells) but made larger and animated within the card so the card is full, not mostly empty; all four panels exist in the HTML with the inactive ones `hidden`, so the copy of every step is in the server HTML and visible to crawlers and without JavaScript (the active one, step 1, is visible). The per-step copy must stay accurate for a multi-topic site (it is already general after the platform pass; keep it so).
- Auto-advance: every 5.5 seconds while the section is on screen, the tab is visible, nothing in the stepper has focus or hover, the reader has not chosen a step by click or keyboard (any user choice stops auto-advance for good until reload), and `prefers-reduced-motion` is not reduce. Under reduced motion there is no auto-advance, no demo animation and no transition; the steps change instantly and the demo shows its final state. Compute `prefersMotion()` and `matchMedia` only inside effects (server and first client render must match); run timers and observers only after mount; clear them on unmount.
- Remove the dead code: the pinned `Story` component, `.story`, `.pin`, `.pinGrid`, `.rail*`, `.pinCopy`, `.pinStage`, `.stageItem`, the `.storyList` fallback and its duplicate `StoryVisual` render, the reduced-motion and `max-height: 800px` overrides that only served them, and `Journey`'s pinning effect. Do not put `data-fx` on any node that is swapped or mounted after load (`useScrollFx` scans `[data-fx]` once); use `data-fx` only on static wrappers (the section head).
- Tests: unit tests for the round-data helper (HTML stripping, entities, truncation, fallbacks, the R-code filter, prop size under 12 KB). E2E in `e2e/smoke.spec.ts`: the interview book shows a preview card with the tests, wrong answer and sample question for the default round; clicking a round (or pressing Enter on it) activates it and updates the preview and `aria-current`; scrolling a later round to the middle makes it active; the "Read this round" link goes to its `/interview/<id>` page; no horizontal scroll at 390px for the section; the how-it-works tabs switch with click and arrow keys, show the right demo, auto-advance with a controlled clock (`page.clock`) and stop after a click, hover or under reduced motion; the h2 "Read it. Run it" stays visible; the `/` page at 375px has `scrollWidth <= innerWidth`. Add axe states in `e2e/a11y.spec.ts` for the interview book with a later round active and for how it works on step 3 (nine themes, 1440 and 390; the a11y harness runs with reduced motion), and fix any contrast failure with tokens.

**Never:** Do not change the interview book pages or data, the topic section, the hero, paths, FAQ or any other homepage section's behaviour; do not import `content/` or `lib/interviewBook.ts` from a client file; do not add a dependency or a scroll library; do not use pinned or sticky wrappers with computed `vh` heights; do not use `data-fx` on swapped nodes; do not autoplay anything with sound or motion under reduced motion; do not remove the `#loop` and `#how` anchors or the nav links to them.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Interview book first paint | desktop, default | timeline plus preview for round 1 in the server HTML, no horizontal scroll | none |
| Scroll through rounds | scroll the timeline | the active row follows the middle line; the preview updates | none |
| Choose a round | click or Enter on a row | row activates and scrolls to the line; preview and live region update | none |
| Round without a trap | no "answer that loses the room" | the fallback line or the section is omitted, no empty heading | no throw |
| Phone | 390px | one column, sticky preview on top, no sideways scroll | none |
| How it works first paint | default | step 1 active and visible; all four steps' copy in the HTML | none |
| Auto-advance | on screen, no interaction | steps change every 5.5 s | stops on any interaction |
| Interaction | click, key, hover or focus | auto-advance stops (hover and focus pause; a choice stops it for good) | none |
| Reduced motion | `prefers-reduced-motion` | no auto-advance, no animation; final-state demo | none |
| Hidden tab or off screen | tab hidden or section out of view | auto-advance paused | none |

</intent-contract>

## Code Map

- `app/HomeView.tsx` -- `Story` (about l.434-542, pinned scroll-driven, `STORY` data l.335-356, `StoryVisual` l.371-432 with `LAYERS`, `RUN_TESTS`, `CHAT`, `REVIEW_DAYS`) used at about l.1090-1103 inside `section#how`; `Journey` (about l.627-706, `useGuidesNav()`, a pinning effect and a horizontal track) used at about l.1189-1202 inside `section#loop`; `Words` (l.612), `accent()`, `onGlow` (l.950), `useCompact` (l.712, `useSyncExternalStore` with a false server snapshot), `useScrollFx` call (l.921).
- `app/home.module.css` -- story rules about l.566-787 and visuals about l.789-975, `.howSection` l.2673, reduced-motion and mobile overrides about l.1794-1822, l.2019-2050, l.2663-2670; journey rules about l.2065-2245 (`.loopSection`, `.sideWrap`, `.sidePin`, `.sideProgress`, `.track`, `.round`, `.offer`, glow); shared `.section`, `.head`, `.eyebrow`, `.h2`, `.sub`, `.cell`, `.vis`, `.kicker`; the focus-ring selector list about l.1775-1792; h3 `content: none !important` list about l.553-564.
- `app/page.tsx` (server; passes `interview={{rounds, questions}}` today) -- add the rounds prop; `lib/interviewBook.ts` (`bookRounds()`, `roundCards()`, `bankQuestions()`: `test`, `trap` HTML, `q`, round `meta` including Fail mode), `content/interview-types.ts`, `lib/topics.ts` `chapterHref`.
- `lib/scrollFx.ts` (`smoothScroll.to`, `useScrollFx` scans `[data-fx]` once), `lib/dom.ts` (`prefersMotion`).
- `tests/client-bundle.test.ts`, `tests/claims.test.ts`, `tests/colour-literal.ts`; `e2e/smoke.spec.ts` about l.1191-1233 (home landing test: headings `/Read it. Run it/`, `/a path that starts there/i`, `/Pick a topic/`, `/Before you start/`; 375px overflow) and `e2e/a11y.spec.ts` (`/` in PAGES; STATES format `name:`/`viewports:`; the harness emulates reduced motion).
- Architecture chapters: `arch-testing.ts`, `arch-health.ts` (the line-count chart for `app/home.module.css` and `app/HomeView.tsx`), `arch-design-system.ts`, `arch-scaling.ts`/`arch-performance.ts` (home page script budget) for any number or sentence that moves.
- New: `lib/homeRounds.ts` (pure), `tests/home-rounds.test.ts`.

## Tasks & Acceptance

**Execution:**
- [x] `lib/homeRounds.ts`, `tests/home-rounds.test.ts`, `app/page.tsx` -- the server round data -- preview content without client content imports
- [x] `app/HomeView.tsx`, `app/home.module.css` -- the interview timeline and sticky preview -- replaces the horizontal strip
- [x] `app/HomeView.tsx`, `app/home.module.css` -- the how-it-works stepper with the live demo -- replaces the pinned story
- [ ] remove the dead pinned and track code and CSS
- [x] `e2e/smoke.spec.ts`, `e2e/a11y.spec.ts` -- the flows and axe states
- [x] `content/architecture/*` -- numbers and sentences that move -- claims stay green
- [x] `.cspell/project-words.txt` -- append new words at the end

**Acceptance Criteria:**
- Given the home page, when the interview book is read, then each round has a preview with what it tests, the wrong answer and a sample question, the active round follows scrolling and clicking, and nothing scrolls sideways at any width.
- Given how it works, then four clickable steps drive a full, animated mini demo, auto-advance stops on any interaction and never runs under reduced motion, and the "Read it. Run it." h2 stays visible.
- Given the server HTML of `/`, then the preview of the default round and the copy of all four steps are present.
- Given the code, then no pinned story, no horizontal track and no `content/` import in `HomeView` remain.
- Given `npm run check`, `npm run build` and the full e2e, then all pass with axe clean in nine themes and `scrollWidth <= innerWidth` at 375px; screenshots at 1440 and 390 in a dark and a light theme look polished.

## Implementation Notes

- Built: `lib/homeRounds.ts` (server round data for the interview preview, 20 rounds, about 7.2 KB, HTML stripped and truncated), a vertical interview timeline with a sticky preview card (an `IntersectionObserver` picks the active round; click or Enter scrolls and activates), a how-it-works stepper (tablist, four panels in the HTML, CSS-only demos, auto-advance every 5.5 s only while on screen with no interaction and no reduced motion), and, at 721px and wider, a one-view centered layout for every section after the hero with `scroll-margin-top` at the header height (`--nav-h`). `useScrollFx` takes an optional `anchorOffset` so the home page's anchors do not add Lenis' own offset to the scroll margin. The old pinned story, horizontal track and `useGuidesNav` use are removed.
- Review: the four review lenses were not run on purpose. The owner asked for a full redesign of every section after the hero straight afterwards (`plan-home-big-type-redesign.md`), which rebuilds these sections; that plan gets the full review. Verified here by `npm run check`, build, the full e2e and screenshots only.
- Known gaps handed to the next plan: the preview text can be cut mid-clause, the interview section is taller than one view, the Features and Tools sections overlap, and Paths is still JavaScript-only.

## Plan Change Log

- 2026-10-08, after the redesign was built: the owner added that on medium and large screens (721px and wider) every homepage section should sit vertically centered like the hero and fill exactly one view, so the next section's content does not show in the same view. Amendment: from 721px up, each section after the hero gets a one-viewport minimum height with its content centered and a header-offset scroll margin; taller sections (the interview timeline, the topic explorer on a short window) grow and scroll; no scroll-snap and no pinned heights. KEEP: the interview timeline with its sticky preview, the how-it-works stepper, the `#loop` and `#how` anchors and the visible "Read it. Run it." h2.

## Review Triage Log

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: all green, comments check clean
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build` -- expected: success
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run test:e2e` -- expected: all pass (production build on port 3100)

**Manual checks (if no CLI):**
- Screenshots of both sections at 1440 and 390 in a dark and a light theme, mid-interaction (a later round active; step 3 or 4 of the stepper); iterate on spacing and hierarchy until polished.

## Auto Run Result

**Summary:** The interview book is a vertical round timeline with a sticky preview (what it tests, the wrong answer, a sample question, a link); how it works is a four-step stepper with live demos; every section after the hero fills one centered view from 721px up.

**Review:** not run (superseded by the big-type redesign, see Implementation Notes).

**Verification:** `npm run check` 382 unit tests, build ok, full e2e 215/215 including axe in nine themes and the new one-view and anchor tests; screenshots at 1440x900, 1280x720, 1024x768 and 820x1180 in dark and light.

**Residual risks:** see Known gaps in the notes.
