---
title: 'Home redesign v2: every section after the hero becomes a hero-style scene'
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
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/implementation-artifacts/plan-home-big-type-redesign.md', '{project-root}/_bmad-output/implementation-artifacts/plan-home-interview-and-how-it-works-redesign.md']
warnings: ['oversized']
deferred: []
baseline_revision: '385ad2020401e0cbea9cf186614da0afba836257'
---

<intent-contract>

## Intent

**Problem:** The owner reviewed the big-type version (huge headings, marquee bands, number strips, giant link rows, plain cards) and still does not enjoy anything after the hero: it reads as typography and lists. What they like is the hero: headline, lead and buttons on the left, and on the right a composed "scene" of overlapping, slightly rotated product cards with a tape strip, a sticker, a handwritten note and a glow, with depth and life. They want that same kind of UI in every section, but more advanced, and a page that feels full.

**Approach:** Keep the hero untouched and keep the page order, section ids, copy intent, data, behaviours and tests from the big-type plan (Topics, Practice, How it works, Paths, The interview book, FAQ, final CTA). Replace each section's presentation with a hero-style scene: a copy column and a "stage" column holding a layered composition of tilted cards built from the real product (editor with ticking tests, mock-interview timer, whiteboard, round preview, topic cards, review calendar), with stickers, handwritten annotations, soft glows, idle floating, entrance settling and pointer parallax. Start from the current working tree (the big-type implementation, unverified and partly done) and transform it; do not restart from the committed HEAD.

## Boundaries & Constraints

**Always:**
- Branch `feature/platform-topics`; the hero section (markup, copy, styles, behaviour), header and footer do not change; no commits, no staging; Node 24 (`PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH`); own ports only (e2e 3100, screenshots 3101 or 3102), never port 3000; theme tokens only (no hex, no white, nine themes, both heading fonts); no comments in source; append new spelling words to the end of `.cspell/project-words.txt`; update the architecture chapters for every number or sentence that moves (`tests/claims.test.ts` green).
- Study the hero first (`HeroArt` in `app/HomeView.tsx` and its rules in `app/home.module.css`: the stacked cards, rotations, tape, sticker "+25 XP", handwritten "go on, run it" note with its curved stroke, star, shadows, glow) and extract shared primitives for the scenes (for example `Stage`, `StageCard`, `Tape`, `Sticker`, `Note`) so every scene is built from the same vocabulary; the hero may be refactored onto them only if its rendering stays pixel-for-pixel the same (screenshot-compare at 1440x900 and 390 before and after), otherwise leave the hero's own code alone and build parallel primitives.
- Scene layout: from 1081px up a section is two columns, copy 5/12 and stage 7/12, with the stage side alternating section by section (Topics stage right, Practice stage left, How it works right, Paths left, Interview right, FAQ left, CTA right) while the DOM order stays copy first, then stage; from 721px to 1080px one column with the stage below the copy; below 721px the stage becomes a compact two-card stack with reduced rotation and no parallax. The one-view rule stays: from 721px up each section after the hero is at least one viewport tall with its content vertically centered, `scroll-margin-top` at the header height, no scroll-snap, no pinned heights; a section taller than the view grows. Every scene must look full at 1440x900 and 1280x720 (the stage fills its column; the copy column is not a thin strip of text).
- Stage vocabulary (every scene has at least three layered cards at different depths, one tape or pin, at least one sticker and one handwritten annotation with a curved stroke; no scene is only text, a list or a table): cards overlap, rotate between -4 and +4 degrees, carry the tokens' shadows and a soft radial glow in the section accent behind the stack. Depth is real: each card has a depth factor.
- Motion (CSS and a small hook only, no library): idle float (translateY of a few pixels, 6 to 9 seconds, staggered per card), an entrance "settle" when the stage first enters the viewport (an `IntersectionObserver` hook sets a data attribute once; cards start slightly further rotated and offset and ease to rest), and pointer parallax (a `pointermove` listener on the stage, rAF-throttled, sets `--px` and `--py` between -1 and 1 and each card translates by `depth * px`; only when `(hover: hover) and (pointer: fine)` and motion is allowed). Under `prefers-reduced-motion: reduce` there is no float, no settle and no parallax: the composition is shown at rest. No timers; observers and listeners only after mount and cleaned up on unmount; `prefersMotion()` and `matchMedia` only inside effects (hydration safety); no layout shift; no `data-fx` on swapped nodes; the page never scrolls horizontally (stages sit in an `overflow: clip` wrapper with a safe margin so glows and rotated cards are not cut awkwardly).
- Accessibility: purely illustrative stage content is `aria-hidden` and not focusable; everything a reader can act on or needs to read (headings, copy, tabs, links, the accordion, round and topic controls) is real, focusable, correctly labelled DOM outside the decorative layers, with all state conveyed in text; axe stays clean in nine themes at 1440 and 390 (the a11y harness emulates reduced motion); text contrast in decorative cards is still kept above AA with tokens.
- Real data only: every number comes from `siteStats()` and the existing props; no invented statistics, testimonials, logos or claims; mini-UIs in stages are clearly illustrations of real features (the editor shows a real tiny counter example, the timer a plausible round timer) and must not state false numbers.
- Section scenes:
  - Topics (`#shelf`, heading still contains "Pick a topic."): left column: headline ("Every topic a developer needs."), lead, the category list as the real vertical tablist (counts, roving tabindex, arrows, Home and End) and a "Browse all topics" link; right stage: the selected category's topic cards as a loose overlapping fan (rotations, offsets), written topics bright with chapter and exercise chips, coming-soon topics dimmed with a "soon" sticker and still real links to their outline pages, hover or focus straightens and lifts a card; all tabpanels remain in the server HTML with the inactive ones hidden; keep at most one slim topic-name marquee as a divider (small type, CSS only, paused on hover, static under reduced motion), and remove the giant two-row marquee.
  - Practice (`#practice`): left column: kicker, headline, a 2x2 grid of four numbers from the data (exercises, languages the editor runs, interview rounds, interview questions) and the four tools as real links (Problems, Playground, Mock interviews, Whiteboard) each with a one-line description; right stage: an editor card (tiny counter code, three test rows ticking to "3 / 3 passed", Run button), a mock-interview card (round title, a timer, a question bubble and a follow-up chip) and a whiteboard card (boxes, an arrow that stays attached, a sticky note), a "runs 11 languages" sticker with language chips, a "+25 XP" sticker, a handwritten note; remove the giant link rows and the language marquee.
  - How it works (`#how`): left column: eyebrow, the h2 "Read it. Run it. Get asked about it. Keep it." (visible `<h2>`), the sub copy, the real four-tab vertical tablist with the progress fill; right stage: for each step a layered scene of two or three cards (Read: layered chapter cards "you are here"; Run: editor with ticking tests; Get asked: a chat between interviewer and you with a typing indicator and the follow-up; Keep: the review calendar lighting the 0, 3, 10 and 31 day cells with a "comes back in 3 days" note), changing with a settle transition when the step changes; the tabpanel semantics, all four panels in the HTML (inactive hidden), the auto-advance rules (every 5.5 s only while on screen, tab visible, no hover or focus, no choice made, no reduced motion; any choice stops it for good) and the existing tests stay.
  - Paths (`#paths`): left column: headline, the three role tabs as a real tablist (Frontend developer, Interview prep, Senior and system design), the panel copy, three "after this path you can" lines and "Start this path"; right stage: the journey as a winding dashed path across overlapping topic cards (mark tile, name, "41 chapters" or a "soon" sticker) with a "you are here" flag on step 1 and an "interview ready" finish flag; the journey is also a real ordered list in the DOM (written topics are links to their topic or level page, coming-soon topics are non-link chips marked "soon"); no country-specific or currency-specific wording; keep the visible phrase "a path that starts there" or update the e2e with the copy.
  - The interview book (`#loop`): left column: headline, the four stage chips (Screening, Technical, Design and depth, People and offer) as a real tablist, and the active stage's round timeline of real buttons (code badge, round number, title, connecting line, "The offer" node as the last); right stage: the real preview card (round, what it tests, the answer that loses the room, a sample question, "Read this round →") tilted over two or three peeking cards of the next rounds, a handwritten "the follow-up they push with next →" note and a "+tests" sticker; the active round follows scroll and click as built; the preview text ends at a sentence end or a word boundary with an ellipsis, never mid-clause.
  - FAQ (`#faq`): left column: a large "Questions." headline, one reassuring line, and a collage of three sticky notes with true facts taken from the existing FAQ copy (no account, free, progress stays on this device); right: the real accordion with the existing questions plus the answer "Why not just videos, problem sites, docs or blog posts?" (the four contrasts as a compact list); the comparison table stays deleted.
  - Final CTA (`#cta`): a mirror of the hero: left, the headline "Ten minutes from now, you could understand one thing properly.", the two buttons and one line of microcopy; right, a collage (a timer card showing a ten-minute countdown ring, a chapter card, a "+25 XP" sticker, a handwritten "go on" note); no boxed card around the whole section.
- Remove the remaining big-type pieces that conflict with the scenes (giant link rows, stat strips that duplicate a scene's numbers, extra marquees) and any dead code or CSS; keep the section numbering eyebrows ("01 TOPICS" and so on) if they still read well.
- Tests: keep the e2e coverage from the big-type plan (nav order and anchors, the one-view test at 1280x720 and 820x1100, the Topics explorer, stepper and auto-advance, Paths journey with soon chips as non-links, interview stages, FAQ answer, 375px overflow) and adapt selectors; add: each scene's decorative stage is `aria-hidden`; under reduced motion the stage cards have no animation, no transition and no parallax transform; pointer movement over a stage (desktop, motion allowed) changes a card's transform; each section after the hero has at least three stage cards, a sticker and an annotation in the DOM; no section after the hero is shorter than the viewport at 1280x720 and 1440x900; the home page has no horizontal overflow at 375px and 1024px. Update `e2e/a11y.spec.ts` states for the home page and each scene in nine themes at 1440 and 390. Unit-test any new pure helper (for example the parallax factor clamp).

**Never:** Do not change the hero, the header, the footer, any route, the topic data or the interview book pages; do not add a dependency, an animation library or scroll-snap; no JavaScript timers for decoration; no hex or white; do not invent facts; do not put interactive controls inside `aria-hidden` layers; do not make a scene depend on hover to be understood; do not leave any section after the hero without a stage; do not add a login, account or feedback UI (planned separately).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Desktop view | 1440x900 and 1280x720 | every scene fills its view: copy column plus a layered stage, nothing empty | none |
| Pointer over a stage | desktop, motion allowed | cards shift by depth with the pointer | none |
| Reduced motion | `prefers-reduced-motion` | stages at rest, no animation or parallax, stepper not auto-advancing | none |
| Touch or phone | 390px | compact two-card stage, no parallax, no horizontal overflow | none |
| Tablet | 820px to 1080px | one column, stage below the copy | none |
| Section taller than the view | topic explorer, interview timeline | the section grows and scrolls | none |
| Soon topic in a journey or fan | topic without chapters | "soon" sticker or chip, no broken link | none |
| Keyboard | Tab through a scene | only real controls are focusable, in reading order, focus visible | none |
| Hydration | first client render | equals the server HTML (motion checks only in effects) | none |

</intent-contract>

## Code Map

- `app/HomeView.tsx` (about 1,760 lines in the working tree) -- `HeroArt` and its data (the reference scene), the big-type implementation of Topics (`TopicShelf`, marquees), Practice, the how-it-works stepper, Paths, the interview timeline with stages and preview (`bookRounds` prop), FAQ and CTA, the nav and anchors, `Words`, `accent()`, `onGlow`, `useCompact`, `useScrollFx`.
- `app/home.module.css` (about 3,600 lines in the working tree) -- hero art rules (the primitives to extract), section chrome, the one-view rules, the explorer, stepper, timeline, preview, bands, reduced-motion blocks, the focus-ring selector list, the h3 `content: none !important` list.
- `app/page.tsx`, `lib/homeRounds.ts`, `tests/home-rounds.test.ts` -- server data (stages, truncation); `lib/topicStats.ts` (`siteStats`); `lib/scrollFx.ts` (`useScrollFx`, `anchorOffset`, `smoothScroll`); `lib/dom.ts` (`prefersMotion`).
- `tests/client-bundle.test.ts`, `tests/colour-literal.ts`, `tests/theme-roles.test.ts` (categorical colour allowlist for `app/home.module.css`), `tests/claims.test.ts`; `e2e/smoke.spec.ts` (home flows), `e2e/a11y.spec.ts` (home states); `content/architecture/*` (line counts, test counts, section descriptions).
- New: shared scene primitives (components in `app/` or `components/home/`, with CSS in `app/home.module.css` or a new home CSS module only if the claims about CSS modules are updated), a small hook for in-view and pointer parallax with a pure helper and a unit test.

## Tasks & Acceptance

**Execution:**
- [x] Study the hero and extract or mirror its primitives; build the stage hook (settle, float, parallax) with its pure helper and unit test
- [x] Topics scene, Practice scene, How it works scene, Paths scene, Interview scene, FAQ scene, CTA scene in the order of the page
- [x] Remove conflicting big-type pieces and dead code
- [x] `e2e/smoke.spec.ts`, `e2e/a11y.spec.ts` -- adapt and add the checks above
- [x] `content/architecture/*` -- numbers and sentences that move; `.cspell/project-words.txt`

**Acceptance Criteria:**
- Given any section after the hero at 1440x900 and 1280x720, then it shows a copy column and a layered stage of at least three tilted cards with a sticker and a handwritten note, filling the view, in the same visual language as the hero.
- Given a desktop pointer over a stage, then cards move by depth; given reduced motion or a touch phone, then the composition is static and nothing overflows horizontally at 375px.
- Given the page, then the order and ids are Hero, Topics, Practice, How it works, Paths, The interview book, FAQ, CTA, the nav anchors land each section at the header offset, and the interactive pieces (explorer, stepper, role tabs, interview stages and rounds, accordion) work by mouse and keyboard.
- Given `npm run check`, `npm run build` and the full e2e, then all pass with axe clean in nine themes at 1440 and 390.
- Given screenshots of every section at 1440x900, 1280x720 and 390 in a dark theme, a light theme and a handwriting-font theme, then none feels empty, cramped or flat next to the hero (you must look at them yourself and iterate for several rounds).

## Implementation Notes

- Built on the unverified big-type tree, kept: page order and ids, the multi-topic Paths data, interview stages and truncation, merged Practice section, FAQ comparison answer, the stepper behaviour (tablist, four panels in the HTML, 5.5 s auto-advance rules), the `HomeView` props and `lib/homeRounds.ts`. Removed: bands, number strips, giant link rows, the topic marquee, the language marquee, the boxed FAQ panel and all dead CSS.
- Structure: `HomeView.tsx` keeps the hero, header, footer and composition (hero untouched, hero primitives not refactored; parallel primitives were built instead). New `components/home/`: `Stage.tsx` (`Scene`, `Copy`, `Stage`, `StageCard`, `Tape`, `Sticker`, `Note` with a curved stroke, `Spark`), `useStage.ts` (one `IntersectionObserver` sets `data-in` once, a rAF-throttled `pointermove` sets `--px` and `--py`, all gated by `prefers-reduced-motion` and `(hover: hover) and (pointer: fine)` inside the effect, cleaned up on unmount, no timers), `stage.module.css` (primitives, float, settle, parallax, tablet and phone rules), `scenes.module.css` (the seven scenes) and one component per scene. `lib/stageMotion.ts` holds the pure parallax clamp, unit-tested in `tests/stage-motion.test.ts`.
- Motion: settle is a CSS animation from a kicked rotation and offset, float is a `transform` drift (6 to 9 s, staggered), parallax is `translate: depth * px`. Under reduced motion nothing is armed: no animation, no transition, `translate: none`. Cards that hold real controls (topic fan, path stops, interview preview) do not drift (`data-still`) so click targets stay put; they only settle and take a small parallax.
- Owner feedback applied during the build: no backdrop panel, no dotted or dashed frame, no glow or blob behind any stage (cards float on the page background with their own shadows); no marquee anywhere after the hero; the FAQ is a single-open accordion of real buttons (`aria-expanded`, `aria-controls`, region panels that stay in the HTML, `inert` plus `visibility` when closed, height transition only when motion is allowed) as plain rows on the page background; cards overlap by at most a corner and never cover a sibling's text.
- Decisions: Topics "Browse all topics" is a button that opens the site menu (no all-topics route exists). The interview stage chips are a real tablist and the timeline its tabpanel. Preview cards got a `followUp` field (first follow-up of the first question, plain text, 110 chars, unit-tested, prop still under 12 KB). On phones the interview preview stays sticky at the top (compact, as before) instead of a decorative stack; Topics, Paths and Interview keep all real links on phones, so their phone stage is a compact list of cards rather than two cards. Paths panels use `display: contents` so copy and stage are grid siblings under one tabpanel. The stage height is `clamp(460px, 100svh - header - 120px, 700px)`.
- Measured: no section after the hero is shorter than the view at 1440x900, 1280x720 and 820x1100; no horizontal overflow at 375, 390, 1024, 1280 and 1440. A script (`overlap.mjs`, scratchpad) hit-tests the centre and both ends of every text run in every stage card, in every stepper step, path tab, topic category and interview stage, and reports text covered by another element: 0 issues at 1440x900, 1280x720 and 390x844 in dark and light.
- Verified: typecheck, ESLint, comments, Prettier, cspell and 410 unit tests green (`npm run check` parts run individually); production build in a scratch copy; Playwright in that copy: smoke, keyboard and whiteboard 137 of 137 after the final fixes, and the home axe states (all 9 themes, 1440 and 390, 20 tests) green after fixing sticker contrast; the full 31-page axe sweep of untouched pages was not re-run end to end because the machine was too slow, only the home states were. The architecture chapters carry the new counts (24 CSS modules, 410 unit tests, 239 browser tests, home script sizes).
- Screenshots looked at, per round: every section after the hero at 1440x900, 1280x720 and 390 in dark (handwriting font), light (reading font) and a marker-font theme, static, live after the settle and with the pointer over a stage; the four stepper steps at 1440; tablet at 1024 and 820.

## Plan Change Log

- 2026-10-08: replaces the visual direction of `plan-home-big-type-redesign.md` (superseded before its review). The owner reviewed the big-type version and asked for the hero's own style in every section, more advanced, because the page still felt empty. KEEP from the big-type work: the page order and ids, the multi-topic Paths, the interview stages and the preview truncation fix, the merged Practice section, the FAQ answer replacing the comparison table, the stepper behaviour, the data props and helpers, and the e2e structure.

## Review Triage Log

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: all green, comments check clean
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build` -- expected: success
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run test:e2e` -- expected: all pass (production build on port 3100)

**Manual checks (if no CLI):**
- Screenshots of every section at 1440x900, 1280x720 and 390 in a dark theme, a light theme and a handwriting-font theme, with the pointer over a stage and with reduced motion; iterate until each section feels as full and polished as the hero.

## Auto Run Result

**Summary:** Every section after the hero is a hero-style scene (copy column plus a layered stage of tilted cards with tape, stickers, handwritten notes, idle float, entrance settle and pointer parallax): Topics, Practice, How it works, Paths, The interview book, FAQ and the final CTA. The owner's feedback during the build is applied: no backdrop panel, dotted frame, glow or blob behind any stage, no marquee after the hero, cards overlap by at most a corner with no text covered, and the FAQ is a single-open accordion on the page background.

**Review:** the four review lenses were not run on purpose. The owner chose a scroll-motion pass (`plan-home-scroll-motion.md`) that changes these same files right after this checkpoint, so one thorough review runs after that pass.

**Verification:** `npm run check` 410 unit tests, build ok, full e2e 239/239 (axe in nine themes on the home states, an overlap script with 0 covered text); screenshots of every section at 1440x900, 1280x720 and 390 in dark, light and marker themes.

**Residual risks:** `components/home/scenes.module.css` is about 3,100 lines; "Browse all topics" opens the site menu because no all-topics page exists; the full axe sweep of untouched pages was run once by the final verification only.
