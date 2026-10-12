---
title: 'QA sweep: look at every page type at 390 and 1440 in several themes and fonts, and fix what is broken or odd'
type: 'bugfix'
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
context: ['{project-root}/AGENTS.md']
warnings: []
deferred: []
baseline_revision: '0cebc9d'
---

<intent-contract>

## Intent

**Problem:** The whole site was redesigned page type by page type, each time by a different agent, verified mostly in Classic light or Night at 1440. The owner asked for a fast QA round: look at every page type at 390 and 1440 in a few themes and fonts, and fix anything broken or "ajib" (odd).

**Approach (be fast; this is a time-boxed sweep, not a redesign):**
1. Write ONE Playwright script (kept in the scratchpad, not in the repo) that visits a representative route list at 390x844 and 1440x900 in three combinations (Night + Classic, Paper + Roboto, Lavender + Chalk), waits for fonts and hydration, optionally scrolls to a second screen, saves screenshots, and ALSO measures automatically per page: horizontal page overflow, elements wider than the viewport outside scroll regions, text clipped by `overflow: hidden`, text smaller than 12px (chrome), elements overlapping each other's text, console errors, failed requests, a body font that is not the chosen font after load (fallback font in use), and empty bands taller than about 40vh between a page's visible blocks. Print a ranked table of findings per page.
2. Tile the screenshots into contact sheets (6 to 12 thumbnails per image, labelled) and LOOK at them; zoom into full-size screenshots for anything suspicious.
3. Fix real defects at the cause, in the shared place where they come from, one commit-sized change at a time. Do not redesign, do not restyle things that are merely different from your taste.
4. Run the gates ONCE at the end, then report.

Route list (representative; add any page type missing): `/`, `/notes` (JS cover), `/level/js`, `/path/js/beginner`, a chapter (`/notes/scope`) and a heavy chapter (`/notes/types-values`), `/react`, a DSA or system-design chapter, `/git`, `/git/<a section>`, `/typescript` (outline), `/python` (outline), `/typescript/ts-setup-compiler` (outline chapter), `/interview`, `/interview/<a round>`, `/interview/questions`, `/architecture`, `/architecture/<a chapter>`, `/practice`, `/problems`, `/problems/ex-tdz-order`, `/mock` (lobby, plus the wizard step and a room if reachable), `/review` (empty and seeded due), `/progress` (empty and seeded), `/privacy`, `/no-such-page`, `/whiteboard` (look only, do not change it), the Menu drawer open on `/` and on a chapter, the first-visit tour prompt and one slide (clear storage to see it), and the Chapters sheet on a phone.

## Known issues to fix first

- The 404 page (and any not-found render) paints in the fallback sans font on a first visit: Next emits no font preload on not-found renders and the handwriting fonts use `display: "optional"`. Fix at the cause in `lib/fonts.ts` or the layout (for example give the two default fonts a display strategy that does not permanently fall back, or make sure the font is preloaded or inline-declared for not-found), keeping the existing performance budget and layout-shift behaviour (no new layout shift on normal pages). Verify the 404 first visit in a fresh browser context shows the handwriting font and report the CLS effect.
- Git hero figure on phones: its labels are 8 to 10px because the diagram is scaled down; make the labels legible at 390 (at least 11 to 12px effective) or crop to the part that matters.
- The tour prompt covers part of the home hero's lower-right card at 1440x900 until dismissed: move it so it does not hide hero content (for example bottom-left, or smaller), and keep it clear of the Menu pill and of other fixed UI on phones.
- Whatever else the automatic measurements and the contact sheets show.

## Boundaries & Constraints

**Always:**
- Fix in shared pieces (kits, tokens, global prose layer) where the defect lives, never with per-page hacks; remove dead rules you replace.
- Keep behaviour, roles and names the e2e use; keep the Compose rules (`e2e/compose.spec.ts`), the hero-measure tests and the hydration frame samplers passing; add a regression test for each class of defect you fix when it can be automated cheaply (for example a measured overflow or font check added to an existing spec).
- Typography on the `--t-*` scale, weights 400 and 700, nothing under 12px in chrome, theme tokens only, reduced-motion safe, no `data-fx` reveals.

**Never:** comments in source (`npm run comments` fails them); hex, white or literal colours (theme tokens only, except the existing `global-error` inline palette); hard offset shadows; edits to `.claude/skills/` or `_bmad/`; touching port 3000 or any broad `pkill`; the whiteboard (`app/whiteboard/**`, `lib/whiteboard*`, `app/mock/Whiteboard.tsx`) and the whiteboard's own tools stay untouched (you may report a problem you see there, but do not fix it); committing, pushing or staging (the coordinator does that).

## Tasks & Acceptance

- Given the route list at 390 and 1440 in the three combinations, then the automatic checks report no horizontal overflow, no clipped text, no fallback-font pages after load, no console errors, and the contact sheets show no overlapping, stacked or cut-off text and no unexplained empty bands.
- Given the 404 on a first visit, then the handwriting font is used.
- Given `npm run check`, `npm run build` and the full e2e in a clean copy, then all pass; architecture chapter numbers asserted by `tests/claims.test.ts` are updated if they change.

## Implementation Notes

Method: one Playwright script in the scratchpad (not in the repo) visited 43 routes and states (home, JS cover, level, path, two chapters, React cover and chapter, DSA cover and chapter, system design cover and chapter, Git landing and section, TypeScript outline and outline chapter, Python, CSS, interview landing, round and question bank, architecture landing and chapter, practice, problems and a problem, mock lobby, wizard tab and room, review empty and seeded, progress empty and seeded, privacy, 404, whiteboard, the Menu drawer on `/` and on a chapter, the Chapters sheet on a phone, the tour prompt, two tour slides and the prompt on a topic page) at 390x844 and 1440x900 in Night + Classic, Paper + Roboto and Lavender + Chalk (255 page loads, 1 to 4 screens each) against a production `next start` of a clean copy. It measured sideways overflow, content past the edge, clipped text, text under 12px, overlapping text, empty bands, console errors, failed requests, and the font the browser really painted (CDP `CSS.getPlatformFontsForNode`, not the computed family). Contact sheets of the first screens were read for all three combinations on phones and Night + Classic on desktop; second screens for Lavender + Chalk on phones.

Findings (first sweep, before any fix):

| Page | Size | Combo | Defect | Status |
| --- | --- | --- | --- | --- |
| 404 (and any not-found render) | both | Night + Classic | h1 and body painted in the fallback sans (Arial) on a first visit: no font preload on not-found renders and `display: "optional"` never swaps | fixed |
| Home, every page on a slow link | 1440 | Night + Classic | same cause: with Slow 4G and 4x CPU even `/`, `/notes/scope`, `/git` and `/dsa` painted the h1 in Arial for good | fixed with the same change |
| Git landing hero figure | 390 | all | labels 7.4 to 9.5px effective (diagram scaled to 0.27 to 0.34) | fixed |
| Home tour prompt | 1440x900 | all | covered the lower-right hero card until dismissed | fixed |
| Topic covers (`/notes`, `/dsa`, `/react`, `/system-design`, other covers) | 390 | Lavender + Chalk | part header "0/12 read" ran 14px past the right edge and was cut off by the page's `overflow: clip` | fixed |
| Interview landing "How to use it" | 390 | all | the three step number circles started 7px left of the viewport and were cut off | fixed |
| Home legend and shelf (find label, tallies, start kicker, card meta, chips), practice tool chip | 390 and 1440 | all | text 10.5 to 11.5px | fixed (floors raised to 12px) |
| Chapter tables | 390 | all | inline `code` in table headers 10.6px | fixed |
| Chapter loop diagrams | both | all | `.loop-box__label` 11.5px | fixed (12px) |
| Git section "Next" sub, journey subs, home interview paper texts, editor status bar | both | all | measured as clipped; they are deliberate line clamps or a status bar that hides its tail | left, by design |
| Home hero `desk`, scroll-scene cards | 1440 | all | extend past the right edge inside the page clip; decorative, and the scene cards are mid-animation when measured | left, by design |
| Chapter tables at 390 | 390 | all | the right column is cut off at the edge of a scrolling table (the scroll cue) | left, by design |
| Whiteboard | both | all | paints its own fonts, not the chosen one | left, owner said not to touch it |
| No console errors, failed requests, sideways page overflow or empty bands taller than 40vh (reduced motion) on any route | | | | none found |

Fixes:

- `lib/fonts.ts`: Caveat and Kalam (the default Classic pair, the only fonts that are preloaded) use `display: "fallback"` instead of `"optional"`. They now swap in after the load even when Next emits no preload (not-found renders) or the link is slow. Regression test: `e2e/smoke.spec.ts` "the not-found page paints its heading in the handwriting font on a first visit".
- `app/git/git.module.css`: on phones the hero figure labels are scaled (token font size times 1.1 to 1.5, so the `--t-*` rule still holds) to at least 12px effective at 390, the "main <- HEAD" label hangs above the line end-anchored and the hotfix label sits below its branch so nothing overlaps. Regression test: `e2e/smoke.spec.ts` "the git hero figure keeps its labels at least 12 pixels high on a phone".
- `components/tour/tour.module.css`: the prompt moves to the bottom left. At 1101px and wider it becomes a one-row bar (title, text, buttons; tape hidden) under the hero stats, so it covers no hero content at 1440x900; below that it stays the stacked card, on the left. The phone layout is unchanged. Regression test: `e2e/tour.spec.ts` "the prompt covers no home hero content at 1440x900".
- `components/topic/cover.module.css`: `.partHead` wraps, so a wide part name pushes the read count to its own line instead of off the screen. Regression test: `e2e/compose.spec.ts` "nothing pokes past the right edge of a phone in any font" (seven pages, all eight fonts).
- `app/interview/landing.module.css`: the phone steps list starts 24px in (was 6px) so the number circles are fully visible.
- `app/globals.css`, `components/home/legend.module.css`, `components/home/topics.module.css`, `components/home/practice.module.css`: 12px floors for the small text listed above.
- `content/architecture/arch-testing.ts` and `arch-health.ts`: browser test counts (496 to 500; smoke 206, compose 10, tour 26) and the rows that describe the new tests.

404 first-visit font and layout shift (fresh context per run, Slow 4G, 4x CPU, 1440x900, h1 font from CDP): before, every route above painted Arial. After, all of them paint Caveat. Layout shift sum (CLS) before to after: `/` 0.0018 to 0.0042, `/no-such-page` 0.0005 to 0.0048, `/notes/scope` 0.0009 to 0.0009, `/git` 0.0044 to 0.0044, `/dsa` 0.0006 to 0.0006. All far under the 0.1 budget; the two that move do so because the fallback is now swapped for the real font once.

Left after the final sweep (not done, to keep the sweep time-boxed): text of 11 to 11.5px remains in the home page's composed scenes (topic name chips on desktop, path stop sub and meta lines on phones, the how-it-works hints and the decorative diagram labels). The floors live in `components/home/*.module.css` next to the hero measures and scale with `--u`; raising them needs a pass over those scenes. With Chalk at 1440x900 the home hero is taller than the window, so the new one-row tour prompt overlaps the hero stats row at the fold until dismissed (Classic is clear).

Gates (clean copy, final code): `npm run build` ok; `npm run check` ok with 998 unit tests (one pre-existing lint warning in `components/topic/useReadingPlan.ts`); full e2e 567 passed, 0 failed, no retries. Final sweep on the final build: no console errors, failed requests, sideways page overflow, empty bands or fallback fonts on any route except the whiteboard (its own fonts, untouched).

## Verification

**Commands:** in a clean scratch copy: `npm run build`, then `npm run check`, then `npx playwright test --workers=3 --retries=0`.

## Auto Run Result

Built. Independent check in a clean copy on the final code: `npm run build` ok; `npm run check` 998 unit tests in 48 files (one pre-existing lint warning in `components/topic/useReadingPlan.ts`); full e2e 567 of 567 with no retries. `git diff --stat -- app/whiteboard app/mock/Whiteboard.tsx .claude _bmad` is empty; the only `lib/` change is `lib/fonts.ts` (Caveat and Kalam `display: "fallback"` instead of `"optional"`, which fixes the fallback-font first paint on the 404 and on slow loads; the agent measured CLS before and after, all pages far under 0.1). The agent's sweep covered 43 routes and states at 390 and 1440 in three theme and font combinations (255 loads) with automatic overflow, clipping, font, console and request measurements. Fixed: the 404 and slow-load fallback font, the Git hero figure labels on phones (now at least 11 to 12.5px effective), the tour prompt position (a slim bar at the bottom left on desktop), a part header running past the edge on topic covers at 390 with Chalk, interview step circles starting off-screen at 390, and several 10.5 to 11.5px texts raised to 12px; regression tests were added to `smoke`, `tour` and `compose` specs. Screenshots reviewed by the coordinator at 1440x900 or 390x844: the 404 in Night, the home page with the tour prompt in light, the Git landing on a phone with the prompt. Left on purpose or reported: text of 11 to 11.5px remains in some home scenes (it scales with the scene unit and needs its own pass); with Chalk at 1440x900 the home hero is taller than the window, so the tour prompt overlaps the stats row until dismissed; the whiteboard paints its own fonts and was not touched. Not verified: Safari and Firefox, a few Paper plus Roboto and Lavender plus Chalk desktop sheets read only through measurements, the multi-step loop wizard, the tour slides on phones.
