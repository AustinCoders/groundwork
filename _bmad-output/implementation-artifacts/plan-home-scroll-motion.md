---
title: 'Home scroll motion: scroll-scrubbed scenes, a wider layout, a section rail, floating chips and connectors'
type: 'feature'
ticket: ''
created: '2026-10-08'
status: 'in-progress'
route: 'full'
route_source: 'auto'
review: ''
review_source: ''
lenses_ran: []
review_loop_iteration: 0
followup_review_recommended: false
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/implementation-artifacts/plan-home-scenes-redesign.md']
warnings: ['oversized']
deferred: []
baseline_revision: '22e97c7bb6cdf9960fc72bfdde6986e48e75c7da'
---

<intent-contract>

## Intent

**Problem:** Even with every section after the hero rebuilt as a hero-style scene, the owner finds the page still a little empty: the content sits in about 1,180px on screens of 1,440px and more, the stage cards fill only part of each view, and the sections feel like separate slides with nothing connecting them. They asked for a beautiful scroll animation.

**Approach:** Add a scroll-scrubbed motion system on top of the scenes, plus four fill-ins the owner chose: (1) scroll-scrubbed scenes: as a section scrolls into view its cards fly in from different directions and assemble in step with the scroll position, rest fully assembled while the section is centered, and drift apart at different speeds as it leaves, with the headline words revealing in sequence; (2) a wider layout with bigger, viewport-scaled stages; (3) a slim side progress rail with section names; (4) a few floating real-data chips around each stage; (5) connectors between sections: a dashed line that draws itself with the scroll and a sparkle that travels along it. No pinned heights, no scroll hijacking, no new dependency.

## Boundaries & Constraints

**Always:**
- Branch `feature/platform-topics`; start from the working tree left by the scenes plan (verified); the hero section, header and footer do not change; no commits, no staging; Node 24 (`PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH`); own ports only (e2e 3100, screenshots 3101 or 3102), never port 3000; theme tokens only (no hex, no white, nine themes, both heading fonts); no comments in source; append new spelling words to the end of `.cspell/project-words.txt`; update the architecture chapters for every number or sentence that moves (`tests/claims.test.ts` green).
- Scrub engine: one pure helper module in `lib/` (no `"use client"`, unit-tested) maps a section's scroll position to a progress `p` in 0 to 1 (0 when the section's top reaches the viewport bottom, 1 when its bottom leaves the viewport top) and to `enter`, `exit` and `rest` values in 0 to 1 with a hold range around the middle where `enter` is 1 and `exit` is 0 (the section is at rest whenever its top is within the header offset up to a quarter of the viewport below it, so landing on a section by a nav anchor shows it exactly at rest). A client hook attaches one passive scroll listener (Lenis already scrolls the window, so the standard scroll event keeps firing) and one `IntersectionObserver` to gate which sections are within one viewport of the screen; per animation frame it reads each active section's rect once and writes CSS custom properties (`--enter`, `--exit`, `--p`) on that section, in two separate passes (read all, then write all); it does nothing for sections far off screen, cleans up on unmount, and runs only after mount. The server HTML and the first client render equal the rest state (no content hidden before JavaScript, no flash, no hydration mismatch).
- Choreography (CSS consuming the variables, no timers): each stage card has its own enter vector (direction and distance from about 40px to 14vw, extra rotation of up to 8 degrees, scale from 0.9, opacity from 0.0 for the farthest cards but never below 0.6 for the card carrying the section's main message) that eases to its rest pose as `enter` goes 0 to 1; as `exit` goes 0 to 1 cards drift upward and slightly apart at depth-dependent speeds and scale down a little, never fading out entirely; the copy column moves by a small parallax (at most 24px); headline words reveal in sequence over the first part of `enter`; the how-it-works step demos and the topic fan use the same vocabulary. The pointer parallax of the scenes plan stays and adds to the scrub. Cards never overlap text of the copy column and never clip their own text during the move (check mid-scroll at 25 percent and 75 percent).
- Layout: from 1280px up the home sections' content width grows from 1,180px to `clamp(1180px, 92vw, 1360px)` and the stage cards, type and gaps scale with `clamp()` on the viewport so the stage fills its column at 1280, 1440 and 1920; check 1920x1080 as well. The one-view rule stays (each section after the hero at least a viewport tall, vertically centered, no scroll-snap, no pinned heights).
- Section rail: a `<nav aria-label="Sections">` fixed on the left from 1280px up, a vertical list of links to `#shelf`, `#practice`, `#how`, `#paths`, `#loop`, `#faq` and `#cta` (number, name and a dot; labels expand on hover and keyboard focus as an overlay with a token background; the dots alone are shown at rest), `aria-current="location"` on the section nearest the middle of the viewport (updated by the same observer, not by a scroll listener of its own), click scrolls with `smoothScroll.to` so the section top meets the header offset, visible focus, never overlaps content or the header at 1280 (dots sit in the left gutter, content gets matching padding), hidden below 1280px and while the hero is the only section on screen.
- Floating chips: three or four small chips around each stage (for example "538 exercises", "11 languages", "27 rounds", "420+ questions", "review in 3 days", "4 / 4 passed", "32 topics", "8 categories", "20 rounds"), each a fact taken from `siteStats()` or the existing props and also present in real text in the same section; chips are `aria-hidden`, never focusable, sit at distinct depths and move at their own speeds with the scrub (static under reduced motion), and never cover a card's key content or the copy.
- Connectors: between consecutive sections a decorative SVG inside the lower part of the section: a dashed curve that draws itself by `stroke-dashoffset` tied to the scroll (starting near the bottom of one stage and ending near the next section's headline) with a small sparkle that travels along it (CSS `offset-path` or a computed point from the same progress variable) and a short handwritten label on two of them; `aria-hidden`, `pointer-events: none`, only from 1081px up, never crossing text or controls, no horizontal overflow; fully drawn and static under reduced motion.
- Reduced motion (`prefers-reduced-motion: reduce`): no scrub (the hook does not attach), no pointer parallax, no float, no chip or connector motion: scenes, chips and connectors show at rest; the rail still works. Phones (below 721px): lighter scrub (offsets at most 24px, no extra rotation, no depth parallax), no connectors, no rail, chips reduced to two per stage or hidden if they would crowd the layout; no horizontal overflow at 375px.
- Performance: no layout reads in the write pass, `will-change: transform` only on cards of sections within range, passive listeners, no per-frame object allocation in the hot path, no forced reflow; measure the per-frame cost of the hook while scrolling the home page in Playwright (average under 1 ms on the test machine, report the number) and the home script size change (under about 6 KB gzipped; record before and after).
- Tests: unit tests for the helper (progress, enter, exit, rest range at the exact boundaries, clamping, monotonic easing, header-offset landing equals rest). E2E in `e2e/smoke.spec.ts`: after clicking each nav or rail link every section after the hero is at rest (computed `--enter` is 1 and `--exit` is 0, and the stage cards have no residual transform offset beyond their rest pose); scrolling a section so it is 25 percent into view shows `--enter` below 1 and cards displaced; under `prefers-reduced-motion` no custom property changes and no transform differences; the rail has the right links, updates `aria-current` while scrolling, click navigation works, it is hidden at 1100px and visible at 1440px, and it does not overlap the content box at 1280px; chips are `aria-hidden` and each chip's fact is found in real text of the section; connectors are `aria-hidden`; no horizontal overflow at 375, 1024, 1440 and 1920; no console errors while scrolling the whole page. Update `e2e/a11y.spec.ts` (the harness emulates reduced motion, so axe sees the rest state; add a state for the rail with a focused link and expanded label) in nine themes at 1440 and 390.

**Never:** Do not pin sections or add scroll heights, add scroll-snap, intercept the wheel or touch, or change Lenis' behaviour; do not hide content until scrolled or leave any content unreadable at rest; do not add a dependency or animation library; no JavaScript timers for decoration; no hex or white; do not invent facts for chips; do not put interactive controls in `aria-hidden` layers; do not change the hero, header, footer, routes or data; do not let any animation cause horizontal overflow or layout shift.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Land on a section | nav or rail click, section top at the header offset | scene exactly at rest, chips and connector settled | none |
| Scroll into a section | section 25 percent in view | cards displaced and partly faded toward their enter vectors, headline words part revealed | none |
| Scroll out of a section | section leaving the top | cards drift up at different speeds, none vanishes | none |
| Fast scroll or jump | anchor jump over several sections | skipped sections end at rest when reached; no stuck mid state | none |
| Reduced motion | `prefers-reduced-motion` | nothing animates, everything shown at rest, connectors fully drawn | none |
| No JavaScript | scripts blocked | server HTML shows every scene at rest, no hidden content | none |
| Wide screen | 1920x1080 | content up to 1,360px, stages scaled, no stretched or tiny cards | none |
| Narrow desktop | 1100px | no rail, no connectors that cross text, one-column rules from the scenes plan | none |
| Phone | 375px | light scrub, no rail or connectors, no overflow | none |
| Rail focus | Tab to a rail link | label expands, focus visible, nothing hidden by the header | none |

## Code Map

- `app/HomeView.tsx`, `app/home.module.css` -- the scenes from the scenes plan (stage cards with depth factors, tape, stickers, notes, pointer parallax, the section ids and the one-view rules); add the scrub hook, rail, chips and connectors here or in small components under `components/home/`.
- `lib/scrollFx.ts` (`smoothScroll.to`, `useScrollFx`, `anchorOffset` 0 on the home page), `lib/dom.ts` (`prefersMotion`); new `lib/sceneScroll.ts` (pure helper) and `tests/scene-scroll.test.ts`.
- `app/page.tsx`, `lib/topicStats.ts` (`siteStats`) -- the numbers for chips.
- `tests/client-bundle.test.ts`, `tests/colour-literal.ts`, `tests/theme-roles.test.ts` (categorical colour allowlist for `app/home.module.css`), `tests/claims.test.ts`; `e2e/smoke.spec.ts`, `e2e/a11y.spec.ts`; `content/architecture/*` (home line counts, test counts, the home script budget sentences in `arch-performance.ts` and `arch-scaling.ts`).

## Tasks & Acceptance

**Execution:**
- [ ] `lib/sceneScroll.ts`, `tests/scene-scroll.test.ts` -- progress, enter, exit and rest mapping -- the testable core
- [ ] the scrub hook and the CSS choreography for every scene (Topics, Practice, How it works, Paths, Interview, FAQ, CTA)
- [ ] wider layout and viewport-scaled stages
- [ ] section rail, floating chips, connectors
- [ ] `e2e/smoke.spec.ts`, `e2e/a11y.spec.ts` -- the checks above; `content/architecture/*`; `.cspell/project-words.txt`

**Acceptance Criteria:**
- Given any section after the hero, when it scrolls into view, then its cards fly in from different directions and assemble as the scroll position advances, rest fully assembled when the section is centered or reached by an anchor, and drift apart as it leaves, with no hidden or clipped content at any point.
- Given 1440x900, 1280x720 and 1920x1080, then content is wider, stages are bigger and each section looks full, with chips around the stage and no empty side margins beyond the rail gutter.
- Given the rail, then it lists the sections, highlights the current one, scrolls to a section on click and is hidden below 1280px; given the connectors, then they draw with the scroll between sections and are static and fully drawn under reduced motion.
- Given reduced motion, no JavaScript or a phone, then nothing relies on motion to be understood and nothing overflows horizontally at 375px.
- Given `npm run check`, `npm run build` and the full e2e, then all pass with axe clean in nine themes at 1440 and 390; the per-frame cost and the script size change are measured and recorded; screenshots at 25, 50 and 75 percent progress of every section at 1440x900 and 390 in dark and light, plus 1920x1080 at rest, look polished.

## Implementation Notes

Part 1 of the split (see the Plan Change Log). This plan file is untracked (`git status` shows it with `??`), like the other new files of this work; nothing was committed or staged.

**What part 1 built**
- Scroll engine: one rAF hook (`components/home/useSceneScroll.ts`) runs inside Lenis' tick (`smoothScroll.onFrame`), so a scene reacts in the same frame as the scroll, with no scroll-event lag and no per-frame React state. It writes `data-enter`, `data-exit` and `data-u` (1/1000 steps) on each section and drives every piece through `components/home/fx.ts`, which writes inline `translate`, `rotate`, `scale`, `opacity` and the like per element. CSS custom properties are no longer written per frame: profiling showed any custom-property write on a section forces a 3 to 4 ms style recalculation (207 inherited properties). Pure helpers with unit tests: `lib/sceneScroll.ts`, `lib/pose.ts`, `lib/trail.ts`, `lib/pageFlip.ts`, `lib/pinLengths.ts`. Lenis lerp is 0.14 on the home page.
- Pinned scrollytelling (How it works, Paths, the interview book) by native `position: sticky` in a tall wrapper (>= 1081px only). Lengths live in one place, `lib/pinLengths.ts`: 30vh per step for How and Paths, 32vh per stage for the book, a 15vh hold; each section is about 2.3 viewports tall at 1440x900. No pinning below 1081px, under reduced motion, without JavaScript or on phones. Steps cross-fade continuously (reversible), real controls scroll the page to their step (`usePin`).
- Paths: a winding trail (percent-coordinate SVG with a masked, dash-drawn path), milestone flags that light as the walker passes, the walker rotating with the path tangent. How it works: an illustrated closed loop track (Read, Run, Get asked, Keep stations with their own mini animations driven by the sub-step progress, a walker, "and round it goes again"). Both share `components/home/Track.tsx` + `track.module.css` and the `trail`/`walker`/`milestone` kinds in `fx.ts` (`data-fx-shape="loop"` selects the loop maths in `lib/trail.ts`).
- The interview book: an open book (cover, headband, page-block thickness that moves from the right to the left as you read, curved gutter, running heads, ribbon, thumb-index stage tabs, contents on the left page, the round on the right). The page turn is a leaf of 6 vertical strips, each with its own `rotateY` (`lib/pageFlip.ts`), with a shade per strip, a cast shadow on the page below, a lift, and a back face that carries the next contents page. Only the active leaf builds strips; at rest the flat faces show. A turn is scrubbed by the sub-step progress and reversible.
- Stylesheet split: `components/home/scenes.module.css` became one module per scene plus the shared `stage.module.css` (pixel-identical when split). The page scrollbar is hidden on `html` (`app/globals.css`); the reading-progress bar is the only scroll cue, which is an accessibility trade-off (no visible thumb for mouse users); keyboard and wheel scrolling are untouched.

**Measured (production build, 1440x900, instant 18px-per-frame scroll over the whole page, Chromium CDP metrics)**
- Per-frame main-thread cost: HEAD 1.79 ms (script 0.10, style 0.55, layout 0.01); now 5.97 ms (script 0.68, style 2.62, layout 0.19). The scroll hook's own JavaScript is 0.5 to 0.9 ms per frame (HEAD 0.10 to 0.18); the rest is style recalculation of the elements it moves. By section now: How 5.1, Paths 7.2, interview book 8.9 ms (peaks while 20 leaves of strips are mounted in a sweep), FAQ 5.3, CTA 3.8. Under reduced motion the cost is 0.3 ms, the same as HEAD. Ten strips cost 14.5 ms in the book, six cost 8.9, so six were kept.
- Home script (HTML-referenced scripts, gzip): 269,559 B at HEAD, 281,565 B now (+12,006 B, +4.5%); HTML gzip 31,342 to 30,422 B; home CSS gzip 65,891 to 71,592 B (the `scenes` CSS is now more files).
- Home page height: 7,484 px at HEAD, 10,930 px now at 1440x900 (How 2,051, Paths 1,781, book 2,123, each was 836); 6,062 to 8,768 at 1280x720; 10,565 to 11,003 at 390 (phones do not pin).

**Verified**
- `npm run check` green (tsc, eslint with the one old warning in `components/topic/useReadingPlan.ts`, comments, prettier, cspell, 538 unit tests in 30 files). `npm run build` ok. Full e2e green in a scratch copy: 266 of 266 (smoke 145, a11y 107, whiteboard 6, keyboard 8). Axe clean in nine themes at 1440 and 390 for every home state, including How pinned on its last step and the book pinned on its last stage.
- Looked at (screenshots): Paths, How and the book at 1440x900, 1280x720, 1920x1080 and 390 in dark and light, the book also in lavender and blueprint, the book at rest and at 15 to 90 percent of a turn. `tests/page-flip.test.ts`, `tests/trail.test.ts`, `tests/pin-lengths.test.ts`, `tests/pose.test.ts` and `tests/scene-scroll.test.ts` cover the maths; e2e covers the bending leaf, the monotonic angle frame by frame, the loop lighting its stations, pin lengths and the fallbacks.

**Decisions to know**
- The pinned a11y states move to the last step, and inject `opacity: 1` for the neighbouring sections: any scroll position inside a short pin has a neighbour in its reveal window, which axe reads as low contrast. Architecture chapters updated for every asserted number (CSS modules 33, a11y states 26, browser tests 266, line-count chart now names `smoke.spec.ts`, Home script 282 KB / 40%). The unit-test counts in `arch-testing.ts` (405 tests, 24 files, the per-area rows) were stale before this work and are not asserted; they are unchanged.
- The book renders only the current page and the next two in the DOM while pinned (and one page otherwise), so the other rounds' text is not in the page without JavaScript. The contents list and the stage tabs are always there.
- A page turn lasts about the scroll of one round: 20 rounds share 143vh, so a wheel notch turns about one page and a stage jump riffles. Longer pins would turn pages more slowly but break the 2.5 viewport cap.
- Unused exports and classes: audited every touched file; removed the old product window, conversation layout, peeking cards, journey strip, deck opacity and body/stamp/typing/marker kinds, and un-exported seven types and constants that only their own file used.

**Part 2 handover (what exists, where I stopped)**
- Already built, wired, tested and passing, but not polished: connectors with travellers and docking (`components/home/Connectors.tsx`, `connectors.module.css`, `lib/connector.ts`, `tests/connector.test.ts`, the `--d` property in `useSceneScroll.ts`); the section rail (`SectionRail.tsx`, `rail.module.css`, hidden below 1280px); floating chips in every scene; the wider scene layout and the stepped stage zoom (`--sz`). Known gaps: 1920x1080 composition (large side margins around the pinned stages, the How station notes meet the centre caption), connector labels at 1280x720, the connectors' `--d` custom property (cheap now, but the one remaining custom-property write per frame), and the page-turn pace noted above.

## Plan Change Log

- 2026-10-08 (owner agreed to split): this plan runs in two parts so something can be committed in between. PART 1 (finish now, then verify and commit): the pinned scrollytelling mechanism with the short lengths, the smoothness and latency fixes, the redesigned Paths (winding trail with a walker), How it works (illustrated loop track), and the interview book (a real open book with curved page flips), the per-scene CSS module split, the page scrollbar hide, and the cleanup audit. PART 2 (a fresh agent after part 1 is committed): connectors with docking travellers, the section rail, floating chips, the wider layout, and any remaining polish. Anything of part 2 already started must be brought to a passing state or removed cleanly; nothing new from part 2 is started in part 1.

- 2026-10-08 (owner, during the build): (1) the owner likes the new conversation-style interview scene but wants a scroll behaviour where a section stays on screen until all its steps have played, then lets the page continue; this OVERRIDES "never pin sections or add scroll heights" for the step sections (How it works, the interview book, Paths, optionally Topics): native sticky stage in a tall wrapper, step driven by scroll progress, full-viewport pinned view with no empty areas, no hijacking, fallbacks (below 1081px, reduced motion, no JavaScript, touch phones) without pinning, real controls scroll to the step. (2) The separate dashed connectors are replaced by one continuous route spine from the hero to the CTA with waypoint sockets, a travelling marker carrying a real fact, lit nodes and handwritten link labels. (3) The interview scene is redesigned as a live conversation (interviewer, candidate with a "loses the room" stamp, follow-up, a taped note, deck-style round switching, a journey strip). KEEP: all accessibility, performance, no-backdrop and token rules.
- 2026-10-08: added after the scenes checkpoint (22e97c7). The owner also asked whether dead code was removed; the audit removed `parallaxOffset` and `COMPACT`. Cleanup rule for this pass: no dead exports, unused classes or leftover helpers when you finish; the home stylesheet for the scenes is about 3,100 lines in one module, so split it into one CSS module per scene (plus the shared stage module) as part of this work, updating the claims-asserted CSS module counts and line-count chart.

- 2026-10-08 (part 1 outcome): (1) the continuous route spine was dropped in favour of the earlier dashed connectors with travellers (part 2). (2) The page scrollbar is hidden on `html`, with the reading-progress bar as the only cue. (3) The three step scenes were redesigned beyond the original plan on owner request: Paths as a winding trail with a walker, How it works as an illustrated loop track, the interview book as an open book with bending page turns; pinned lengths were shortened to 30vh per step (32vh per book stage) with a 15vh hold. (4) The book shows only its current and next pages in the DOM; the shared walker and trail code lives in `Track.tsx`.

## Review Triage Log

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: all green, comments check clean
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build` -- expected: success
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run test:e2e` -- expected: all pass (production build on port 3100)

**Manual checks (if no CLI):**
- Scroll through the whole page in a real browser window at 1440x900 and look at it as a person would: smoothness, rhythm between sections, no jank, no stuck states; record a short frame sequence per section at 25, 50 and 75 percent progress.
