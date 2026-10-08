---
title: 'Home redesign: big type and motion bands for every section after the hero'
type: 'feature'
ticket: ''
created: '2026-10-08'
status: 'blocked'
route: 'full'
route_source: 'auto'
review: ''
review_source: ''
lenses_ran: []
review_loop_iteration: 0
followup_review_recommended: false
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/implementation-artifacts/plan-home-interview-and-how-it-works-redesign.md']
warnings: ['oversized']
deferred: []
baseline_revision: '385ad2020401e0cbea9cf186614da0afba836257'
---

<intent-contract>

## Intent

**Problem:** After the hero the homepage feels empty to the owner: nine sections that each repeat "eyebrow, big heading, a few small cards", several with little content stretched over a full view, two of them (Everything in one place, Practice tools) saying nearly the same thing, a comparison table, and a Paths section that is still JavaScript-only. The Topics block, the main decision, sits five screens down.

**Approach:** Keep the hero exactly as it is and rebuild everything after it in a bold, dense "big type and motion bands" style: huge display type, scrolling keyword bands, big number strips, topic marquees and pull quotes, with each section still filling one centered view on 721px and wider but now actually full. Reorder the page to Hero, Topics, Practice, How it works, Paths, Interview book, FAQ, final CTA; merge the two overlapping feature sections into one Practice section; fold the comparison table into an FAQ answer; make Paths multi-topic.

## Boundaries & Constraints

**Always:**
- Scope is `app/HomeView.tsx`, `app/home.module.css`, `app/page.tsx` (props), `lib/homeRounds.ts` and their tests; the hero section's markup, copy, styles and behaviour do not change. Work on branch `feature/platform-topics` after the previous home redesign is committed. Theme tokens only (no hex, no white); all nine themes and both heading fonts (`--font-heading`) must look right, because the handwriting themes change the display face; no comments in source; append new spelling words to the end of `.cspell/project-words.txt`; update the architecture chapters for every number or sentence these changes move (`tests/claims.test.ts` stays green).
- Page order and nav: Hero, Topics (`#shelf`), Practice (`#practice`), How it works (`#how`), Paths (`#paths`), The interview book (`#loop`), FAQ (`#faq`), final CTA (`#cta`). The header nav lists Topics, Practice, How it works, Paths, Interview book, FAQ in that order and every anchor lands with the section top at the header offset. The "Pick a topic" hero button still goes to `#shelf`.
- Layout rule (already built, keep): from 721px up each section after the hero has a one-viewport minimum height with its content vertically centered and a header-offset scroll margin; taller sections simply grow; no scroll-snap, no pinned heights. The difference now is that every section must have enough real content, scaled with `clamp()`, that a 1440x900 and a 1280x720 view looks full, not stretched.
- Motion bands: slim full-width bands between sections (and inside Topics and the CTA) of repeating keywords in huge outlined or filled display type that scroll slowly with a pure-CSS `transform` animation (two rows in opposite directions where used), duplicated text marked `aria-hidden`, the band itself `role="presentation"`/decorative with its meaningful content available once to assistive tech or not at all; paused on hover and focus-within; under `prefers-reduced-motion: reduce` there is no animation and no transition (the band shows as a static, wrapped or truncated line); no JavaScript timers; no layout shift; keep the page free of horizontal overflow (the band lives inside an `overflow: hidden` wrapper).
- Topics section (`#shelf`, heading "Pick a topic." or a bolder equivalent that still contains it): a huge headline ("Every topic a developer needs."), two opposite-direction marquee rows of all topic names (written topics in solid ink, coming-soon topics outlined), then the existing category explorer (left category list, right accent card grid, "Ready now" first) compacted so the section fills one view without crowding. The explorer's tablist semantics, all-panels-in-HTML behaviour and tests stay.
- Practice section (`#practice`, replaces "Everything in one place" and "Practice tools"; delete both): a strip of four giant numbers computed from `siteStats()` and the existing props (exercises, languages the editor runs, interview rounds, interview questions), then four full-width giant-type rows, Problems, Playground, Mock interviews, Whiteboard, each with a one-line description, a small stat chip and an arrow, linking to `/problems`, `/playground`, `/mock` and `/whiteboard`; hover or focus reveals a small preview chip or mini visual (CSS only); a marquee row of the languages the Playground runs. Copy states only true facts from the existing data.
- How it works (`#how`): keep the stepper (tablist, four panels all in the HTML, the live mini demos, auto-advance rules and tests from the previous redesign) and restyle it in the new language: giant step numerals, larger type, a slim motion band above or below. Behaviour and tests stay.
- Paths (`#paths`): multi-topic, role-based, replacing the three JavaScript personas: for example "Frontend developer", "Interview prep (DSA and rounds)" and "Senior and system design"; big-type tabs; each panel shows a journey of four or five steps as a horizontal band of topic marks (written topics link to their `/level/<id>` or topic page, coming-soon topics appear as quiet chips marked "soon", never as broken or empty links) and three "after this path you can" lines. Drop currency-specific and country-specific wording. Keep the visible h2 phrase an e2e asserts ("a path that starts there") or update that assertion with the copy.
- The interview book (`#loop`): keep the vertical timeline with the sticky preview card, but group the rounds into four stages (Screening, Technical, Design and depth, People and offer; derive the grouping from round codes in `lib/homeRounds.ts` as data, unit-tested) so only the active stage's rounds are listed at a time with a stage switcher, which makes the section fit one view; the active round still follows scroll within the stage and click, and the preview shows the five elements. Fix preview truncation: cut at the last sentence end inside the limit, else at the last word boundary with an ellipsis, never mid-clause without one; unit-test it.
- FAQ (`#faq`): a two-column layout with a huge "Questions." display heading and a call to action on the left and the accordion on the right; add the answer that replaces the comparison table ("Why not just videos, problem sites, docs or blog posts?" with the four contrasts as a compact list). Delete the comparison table section.
- Final CTA (`#cta`): a huge display line ("Ten minutes from now, you could understand one thing properly."), the two existing buttons, and a motion band; no card box.
- Remove dead code and CSS for the deleted sections (features bento, tools, compare table, the JavaScript personas and `PathTabs` pieces that no longer apply). Do not put `data-fx` on swapped nodes; use it on static section heads only. Keep reduced motion, hydration safety (`prefersMotion()` and `matchMedia` only in effects), and axe clean in nine themes at 1440 and 390. Phones (below 721px) get the same content in a single column with no pinned heights and no horizontal overflow at 375px.
- Tests: update `e2e/smoke.spec.ts` for the removed and moved sections (headings, nav order and anchors, the 375px overflow check, the one-view rule test, the Topics, stepper and interview tests); add tests that the Topics marquee exists and has no animation under reduced motion, that the Practice rows link to their pages and show the numbers from the data, that each Paths tab shows its journey with soon topics as non-links, that the interview stage switcher changes the listed rounds, that the FAQ has the new answer, and that no section after the hero is shorter than the viewport at 1280x720 and 1440x900. Update `e2e/a11y.spec.ts` states (the home page, the Practice section, a Paths tab, an interview stage, the FAQ) in nine themes at 1440 and 390. Unit tests for the stage grouping and the sentence-boundary truncation.

**Never:** Do not change the hero, the header or the footer's content, the topic data, the interview book pages, or any route; do not invent statistics, testimonials, logos or claims (every number comes from `siteStats()` or the existing props); do not add a dependency, a carousel library or scroll-snap; do not use JavaScript timers for the bands; do not use hex colours or white; do not make any section shorter than the viewport on 721px and wider.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Desktop view | 1440x900, each section after the hero | centered, fills the view, dense with real content, no sliver of the next section | none |
| Short window | 1280x720 | sections grow rather than clip | none |
| Reduced motion | `prefers-reduced-motion` | bands and demos static, stepper not auto-advancing | none |
| Band on hover | pointer or focus inside | band paused | none |
| Paths with a soon topic | journey step for an unwritten topic | quiet "soon" chip, no link | none |
| Interview stage | switch stage | only that stage's rounds listed, first selected, preview updates | none |
| Phone | 375px and 390px | one column, no horizontal overflow, no pinned heights | none |
| Nav anchors | click each nav item | section top meets the header offset | none |

</intent-contract>

## Code Map

- `app/HomeView.tsx` -- the page: hero (do not touch), `TopicShelf` and its explorer, `Story` replacement (the how-it-works stepper), the interview timeline and preview (`bookRounds` prop), the personas and `PathTabs`, the features bento, the tools block, the comparison table, the FAQ, the CTA and the nav anchors; `Words`, `accent()`, `onGlow`, `useCompact`, `useScrollFx`.
- `app/home.module.css` -- section chrome (`.section`, `.head`, `.eyebrow`, `.h2`, `.sub`), the one-view rules, the shelf, stepper, timeline and preview rules, reduced-motion blocks, the focus-ring selector list, the h3 `content: none !important` list.
- `app/page.tsx` -- props from the server (`siteStats`, `interview` totals, `bookRounds`, topics with categories); `lib/homeRounds.ts` (the round data helper, truncation) and `tests/home-rounds.test.ts`.
- `lib/topicStats.ts` (`siteStats`), `lib/topics.ts` (`chapterHref`, `levels`), `content/topics.ts` (written versus outline topics for the journeys and the marquee).
- `lib/scrollFx.ts` (`useScrollFx` scans `[data-fx]` once), `lib/dom.ts` (`prefersMotion`), `tests/client-bundle.test.ts`, `tests/colour-literal.ts`, `tests/theme-roles.test.ts` (categorical colour allowlist for `app/home.module.css`), `tests/claims.test.ts`.
- `e2e/smoke.spec.ts` (the home landing test and the new home flows), `e2e/a11y.spec.ts` (`/` in PAGES and the home states), `content/architecture/*` (line counts, test counts, section descriptions).

## Tasks & Acceptance

**Execution:**
- [ ] `lib/homeRounds.ts`, `tests/home-rounds.test.ts` -- stage grouping and sentence-boundary truncation -- data for the interview section
- [ ] `app/HomeView.tsx`, `app/home.module.css` -- Topics with marquees and the compacted explorer -- first section after the hero
- [ ] `app/HomeView.tsx`, `app/home.module.css` -- the Practice section, deleting features and tools -- the merged section
- [ ] `app/HomeView.tsx`, `app/home.module.css` -- restyle How it works; multi-topic Paths; the interview stages; FAQ with the compare answer; the CTA; the motion bands; delete the compare section and dead code
- [ ] `app/HomeView.tsx` nav and anchors -- the new order
- [ ] `e2e/smoke.spec.ts`, `e2e/a11y.spec.ts` -- the flows and axe states
- [ ] `content/architecture/*` -- counts and descriptions that move -- claims stay green
- [ ] `.cspell/project-words.txt` -- append new words at the end

**Acceptance Criteria:**
- Given the home page, when read after the hero, then the sections are Topics, Practice, How it works, Paths, The interview book, FAQ and the CTA in that order, each filling one centered view at 1440x900 and 1280x720 with dense real content and big type, and the hero is unchanged.
- Given the bands and marquees, then they scroll with CSS only, pause on hover and focus, are static under reduced motion, and the page never scrolls sideways at 375px.
- Given Paths, then each tab shows a multi-topic journey with written topics linked and unwritten ones as non-link "soon" chips.
- Given the interview book, then rounds are grouped in four stages with a switcher and the preview never ends mid-clause.
- Given the removed sections, then no features bento, tools block or comparison table remains and the FAQ answers "why not videos, problem sites, docs or blog posts".
- Given `npm run check`, `npm run build` and the full e2e, then all pass with axe clean in nine themes at 1440 and 390; screenshots of every section at 1440x900, 1280x720 and 390 in a dark and a light theme look full, polished and consistent.

## Implementation Notes

## Plan Change Log

- 2026-10-08: superseded by `plan-home-scenes-redesign.md` before review. The owner asked for the hero's own scene style in every section instead of big type and bands. The unverified working tree from this plan is the starting point of the scenes plan.

## Review Triage Log

## Verification

**Commands:**
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run check` -- expected: all green, comments check clean
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build` -- expected: success
- `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run test:e2e` -- expected: all pass (production build on port 3100)

**Manual checks (if no CLI):**
- Screenshots of every section after the hero at 1440x900, 1280x720 and 390 in a dark and a light theme and in a handwriting-font theme; iterate until none feels empty, cramped or unbalanced.
