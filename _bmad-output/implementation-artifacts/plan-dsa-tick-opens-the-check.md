---
title: 'A mark-as-read tick opens the chapter check'
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
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/initiative-dsa-mastery/epic-dsa-checks/story-check-runner-and-store-on-binary-search-plan.md']
warnings: []
deferred:
  - summary: >-
      Reloading or sharing a `#check` URL starts a fresh random draw with no click, including after a failed attempt.
    evidence: |-
      Arriving at `#check` is intended to start the check, but nothing clears the hash when the check ends or is skipped; `history.replaceState` after the check opens would stop it. Decide with the end-of-chapter popup (3.9).
    location: >-
      components/check/CheckRunner.tsx
    severity: low
  - summary: >-
      Unit-test totals in the architecture chapters are stale and asserted nowhere.
    evidence: |-
      Vitest runs 590 tests in 35 files; derive and assert the figures in the frame sweep (1.5).
    location: >-
      content/architecture/arch-testing.ts, arch-health.ts
    severity: low
baseline_revision: 'f69e8a545eb3960138880eceaa5e0b4991a06eb1'
---

<intent-contract>

## Intent

**Problem:** On a DSA chapter that has a check (today only binary search), "Mark as read" on the end card, the contents card, the cover and the path is a plain `#check` link. When the check card is already on screen nothing visibly happens, so the button feels dead, and the reader is not told that passing the check is what marks the chapter read.

**Approach:** Make the tick open the check. A click scrolls to the check card (as now), plays a short attention animation on the card, shows a banner that says the chapter is marked read once the check is passed (4 of 5), and starts the check at its first question. Arriving from the cover or path tick (a link to `/dsa/<id>#check`) does the same. A reader who does not want the check still has a visible way to mark the chapter read without it.

## Boundaries & Constraints

**Always:**
- A small client module `lib/checkOpen.ts` exposes `requestCheck()`, which dispatches a `window` `CustomEvent` named `groundwork:open-check`; the tick anchors (`ChapterEnd`, `TocCard`, `ChapterCard`) call it from `onClick` without `preventDefault`, so the native `#check` anchor scroll (and Lenis' anchor handling) still runs. Pure helpers that need a test live in `lib/`, no `"use client"` unless they touch the DOM.
- `CheckRunner` opens on that event, and on arriving at a chapter whose URL hash is `#check` (mount, and `hashchange`) when the chapter has a check, is not read and the runner is on its start card. Opening means: the check starts at once (the same draw and state as pressing "Start the check"), an `attention` flag is set for about 1.4 seconds, a banner appears inside the check card above the question and stays until the check ends: "Pass the check, 4 of 5 right, and this chapter is marked read." (use the real pass mark and question count from `passMark`), with a secondary button "Mark as read without the check" that marks it read as not checked exactly like the start card's button. Focus moves to the question's fieldset legend (give it `tabIndex={-1}`), and the `aria-live` status says "Check started. Answer 4 of 5 correctly to mark this chapter read." (real numbers). A second click while the check is running does nothing harmful: it replays the attention animation only, never redraws the questions or resets the answers. If the chapter is already read, the runner ignores the event and the hash.
- The attention animation is a short outline/glow pulse on the check card (`@keyframes` in `components/check/check.module.css`, theme tokens only, `--accent` or `--ink`-based, never a hex or white). Under `prefers-reduced-motion: reduce` there is no animation and no transition; the banner and the focus move are enough, and a static outline for the same 1.4 seconds is allowed. The card never changes size in a way that shifts the page while scrolling.
- Chapters without a check keep their plain read toggles (`tickHref` returns null for them); a read chapter's tick stays a "Mark as unread" button. Nothing else changes in the check's flow, scoring, store or copy ("checked", never "verified").
- E2E in `e2e/smoke.spec.ts`: on `/dsa/dsa-binary-search` clicking the end card tick starts the check (question 1 visible, banner text, URL hash `#check`, focus inside the check) even when the card is already in view; the contents card tick does the same; the cover tick (a navigation to `/dsa/dsa-binary-search#check`) arrives and starts; a direct load of `/dsa/dsa-binary-search#check` for an unread chapter starts it; a second tick click mid-check leaves the same questions and answers; "Mark as read without the check" in the banner marks it read as not checked; on a read chapter, and on a chapter without a check, nothing opens; under reduced motion the card has no animation. Add an axe state for the started-from-the-tick view (banner and first question) in `e2e/a11y.spec.ts`, desktop and phone, nine themes. Unit-test any pure helper. Update the architecture chapter paragraph that describes the check and every count that moves (`tests/claims.test.ts` green). No comments in source. Append new spelling words to the end of `.cspell/project-words.txt`.

**Never:** Do not build the end-of-chapter popup (story 3.9) or a modal; do not change the draw, the scoring, `groundwork:quiz` or the pass rule; do not change `lib/completion.ts`'s link rules; do not touch the Player, chapter bodies or other topics; do not call `preventDefault` on the tick click or block the anchor scroll; do not add a dependency or a CSS module (use `components/check/check.module.css`); no autoplay timers; the check must never start from a hash on a chapter that is already read.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Tick on an unread chapter with a check | click end card, contents or chapter-card tick | scroll to the card, pulse, banner, question 1, focus in the check | none |
| Check card already in view | same click | same visible response: pulse, banner, question 1 | none |
| Arrive from cover or path | tick link to `/dsa/<id>#check` | page loads, scrolls to the card, check starts | none |
| Direct load with `#check` | unread chapter | check starts | none |
| Second click mid-check | tick clicked again | pulse replays; questions and answers unchanged | none |
| Already read | read chapter | tick is "Mark as unread"; event and hash ignored | none |
| No check for the chapter | chapter without a pool | plain toggle, nothing opens | none |
| Skip | "Mark as read without the check" | read, recorded as not checked | none |
| Reduced motion | `prefers-reduced-motion` | no animation or transition; banner and focus move | none |
| Pass | 4 of 5 right | as today: read, score, confetti, review note | none |

</intent-contract>

## Code Map

- `components/check/CheckRunner.tsx` -- phases (`start`, `asking`, `result`), `begin()` starts a draw with `Math.random`, status line, refocus handling; listen for the event and the hash here; the start card's "Mark as read without the check" button is the model for the banner's secondary button.
- `components/check/check.module.css` -- add the banner and the attention keyframes; it already holds the card styles and the reduced-motion handling.
- `components/chapter/ChapterEnd.tsx` (the `<a className={styles.endBtn} href={tickHref}>`), `components/chapter/TocCard.tsx` (`<a className={readClass} href={tickHref}>`), `components/chapter/ChapterCard.tsx` (`<Link className={styles.cardTick} href={tickHref}>`) -- add `onClick={requestCheck}` when the href is a check link.
- `lib/completion.ts` -- `tickHref` (read only); `components/topic/TopicReader.tsx`, `TopicCover.tsx`, `TopicPath.tsx` -- the callers; no change expected.
- `components/play/Player.tsx` and `lib/scrollFx.ts` -- anchors use Lenis `anchors: {offset: -64}`; do not fight it.
- `components/topic/reader.module.css:116-127` -- `.island`/`.checkIsland` (`scroll-margin-top`).
- `e2e/check.ts`, `e2e/smoke.spec.ts` (check flows near the 3.2 tests), `e2e/a11y.spec.ts` (`STATES`, the 4-space `name:`/`viewports:` format that `tests/claims.test.ts` parses), `content/architecture/arch-rendering.ts` (the CheckIsland paragraph), `arch-testing.ts`, `arch-design-system.ts`, `arch-health.ts`.
- New: `lib/checkOpen.ts` (client), a unit test for any pure helper.

## Tasks & Acceptance

**Execution:**
- [x] `lib/checkOpen.ts` -- `requestCheck()` and the event name -- the one way a tick asks the check to open
- [x] `components/chapter/ChapterEnd.tsx`, `TocCard.tsx`, `ChapterCard.tsx` -- call it from the check-link ticks -- the click does something
- [x] `components/check/CheckRunner.tsx`, `check.module.css` -- listen, auto-start, banner with the skip button, attention pulse, focus and live message, hash arrival -- the response
- [x] `e2e/smoke.spec.ts`, `e2e/a11y.spec.ts` -- the flows and the axe state
- [x] `content/architecture/*` -- the paragraph and every count that moves
- [x] `.cspell/project-words.txt` -- append any new words at the end

**Acceptance Criteria:**
- Given an unread `/dsa/dsa-binary-search` with the check card in view, when the reader clicks the end card's "Mark as read", then the check card pulses, a banner says to pass 4 of 5 to mark the chapter read, question 1 is shown and focus is inside the check.
- Given the cover or path tick or a direct `#check` URL for an unread chapter, then the chapter loads and the check starts.
- Given a running check, when a tick is clicked again, then the questions and answers are unchanged.
- Given the banner's "Mark as read without the check", then the chapter is read and the island says it was marked read, not checked.
- Given a read chapter or a chapter with no check, then no tick opens anything.
- Given `prefers-reduced-motion: reduce`, then there is no animation or transition on the card.
- Given axe on the started view at 1440 and 390 in nine themes, then there are no violations; `npm run check`, `npm run build` and the full e2e pass.

## Implementation Notes

- Request: the owner found that "Mark as read" on binary search only jumped to `#check`, so it felt dead, and asked for the quiz to activate with an animation and a message that the quiz must be passed first.
- `lib/checkOpen.ts` dispatches a `groundwork:open-check` window event from the end card, contents card and chapter-card ticks without `preventDefault`, so the native anchor scroll still runs. The cover and path ticks navigate to another page, so they work through the `#check` hash on arrival (mount and `hashchange`); a chapter that is already read ignores both.
- `CheckRunner` starts the check at once with a banner ("Pass the check, 4 of 5 right, and this chapter is marked read.") and a "Mark as read without the check" button, a hidden live line, focus on the question legend and a 1.4 s outline pulse on the check card (a static `--ink` outline under reduced motion). The pulse class is added to the server-rendered `[data-island="check"]` section from the runner, because that section is outside the client tree. Pure text and hash helpers are in `lib/checkBanner.ts`.
- The banner and pulse use `--primary` and `--primary-soft` rather than the plan's `--accent`; both are theme tokens and axe passes in nine themes. Native fragment navigation focuses the section after the click handler runs, so the legend is focused again after the click; on a direct load the focus effect waits until the legend exists.
- `ChapterCard` calls `requestCheck` too, which does nothing on the cover (no runner is mounted); the cover and path rely on the hash. Screenshots at 1440 and 390 after a click show the banner, the first question and the pulse with no horizontal scroll.

## Plan Change Log

## Review Triage Log

### 2026-10-08 — Review pass
- verdicts: 24 findings (duplicates across lenses merged) — high 0, medium 3, low 14, false 7, maybe-false 0
- findings:
  - `[medium]` `[patch]` blind-hunter, edge-case-hunter: a tick on a failed result screen, or while asking without a banner, only pulses the card and does nothing else — a fresh bannered check starts, or the banner shows
  - `[medium]` `[patch]` edge-case-hunter: ctrl, cmd, shift or middle click on a tick starts the check on the current page while the browser opens a new tab — only a plain primary click opens it
  - `[medium]` `[patch]` edge-case-hunter, verification-gap: a same-page click fires the event and then `hashchange`, so the open runs twice and the pulse restarts — de-duplicated
  - `[low]` `[patch]` blind-hunter, edge-case-hunter: two focus mechanisms and a stale pending legend target — one mechanism, cleared when not asking
  - `[low]` `[patch]` verification-gap: the tick after pass then unmark, the `hashchange` path on a live page, a read chapter ignoring a runtime hash, the second-click test that can pass empty, the miss-screen tick and the reduced-motion outline have no strong test — tests added or fixed
  - `[low]` `[patch]` blind-hunter: the axe state runs while the 1.4 s pulse is still running, which makes contrast flake — waits for the pulse
  - `[low]` `[defer]` blind-hunter, edge-case-hunter: a reloaded or shared `#check` URL starts a new draw with no click — decide with 3.9
  - `[low]` `[defer]` blind-hunter, edge-case-hunter, verification-gap: unit-test totals stale — frame sweep
  - `[low]` `[reject]` blind-hunter: banner and pulse use `--primary` rather than the plan's `--accent` — both are theme tokens and axe passes in nine themes; recorded in the notes
  - `[low]` `[reject]` blind-hunter: the 1.4 s duration lives in both the helper and the CSS — a mismatch only shortens or lengthens a pulse
  - `[low]` `[reject]` blind-hunter: the pulse class is added to a node the runner does not own — the section is server-rendered outside the client tree, and the class is removed on a timer
  - `[low]` `[reject]` edge-case-hunter: a client-side navigation from the cover may set the hash after the mount effect reads it — the cover tick e2e shows arrival working
  - `[low]` `[reject]` edge-case-hunter: the banner's skip button can be pressed by accident mid-check — the miss and start screens have the same button and unmarking is free
  - `[low]` `[reject]` blind-hunter: the live status repeats while asking — one polite line set once at the start
  - `[low]` `[reject]` verification-gap, intent-alignment: `ChapterCard` calls `requestCheck` on the cover and the path tick does not, so neither responds at click time — the cover and path rely on hash arrival, which the e2e covers
  - `[false]` `[reject]` blind-hunter: the plan file is unfinished and the cspell task has no change — closed out here; no new words were needed
  - `[false]` `[reject]` intent-alignment: the skip button weakens "only then marked done" — the owner's intent is the pass criterion with an honest not-checked escape, as the start card already offers
  - `[false]` `[reject]` intent-alignment: only the end card is checked on a phone — the axe state runs on both viewports and the start flow is the same component
  - `[false]` `[reject]` intent-alignment: the animation is asserted by `animationName` — the screenshots show it, and reduced motion is separately tested
  - `[false]` `[reject]` intent-alignment: the path tick is not wired for a click — its link goes to `/dsa/<id>#check`, which starts the check on arrival
  - `[false]` `[reject]` verification-gap: the draw is not asserted identical beyond the current id — fixed with the second-click test
  - `[false]` `[reject]` edge-case-hunter: a stale `refocus` can steal focus later — cleared when not asking

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: all green, comments check clean
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build` -- expected: success
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run test:e2e` -- expected: all pass (production build on port 3100)

**Manual checks (if no CLI):**
- Screenshots of the card right after a tick click (banner, first question, pulse) at 1440 and 390 in two themes.

## Auto Run Result

**Summary:** On a DSA chapter that has a check (binary search today), "Mark as read" on the end card, the contents card and the cover and path ticks now opens the check instead of only jumping to it. A plain click starts the check at question 1, pulses the check card for 1.4 s (a static outline under reduced motion), shows a banner ("Pass the check, 4 of 5 right, and this chapter is marked read.") with a "Mark as read without the check" button, and moves focus into the check. The cover and path ticks do the same on arrival at `/dsa/<id>#check`, as does a direct `#check` URL. A tick on a failed result screen starts a fresh bannered check; a second click mid-check only replays the pulse; Ctrl, Cmd, Shift and middle clicks open nothing; a read chapter, and a chapter without a check, are unaffected.

**Files changed:** `lib/checkOpen.ts`, `lib/checkBanner.ts`, `components/check/CheckRunner.tsx`, `components/check/check.module.css`, `components/check/{ChoiceList,OrderList}.tsx` (focusable legend), `components/chapter/{ChapterEnd,TocCard,ChapterCard}.tsx`, `tests/check-banner.test.ts`, `e2e/smoke.spec.ts`, `e2e/a11y.spec.ts`, and the architecture chapters that state the counts.

**Review:** 24 findings: medium 3, low 14, false 7. Patched 6 groups (dead tick on a failed result or an unbannered check, modified clicks, a double open from click plus `hashchange`, a single focus mechanism, nine weak or missing e2e checks, axe waiting for the pulse), deferred 2 low (a reloaded `#check` URL restarts the draw, stale unit-test totals), rejected the rest with reasons logged.

**Follow-up review recommended:** false.

**Verification:** `npm run check` 590 unit tests, build ok, full e2e 251/251 including axe on the started view at 1440 and 390 in nine themes; screenshots after a click at 1440 and 390 with the banner, question 1 and the pulse, no horizontal scroll.

**Residual risks:** the end-of-chapter popup (3.9) is still to build; the plan, cover, path and `/review` still do not show "not checked" (3.4).
