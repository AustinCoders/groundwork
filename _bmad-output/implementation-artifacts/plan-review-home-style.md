---
title: 'The review page (spaced repetition) in the home language'
type: 'feature'
ticket: ''
created: '2026-10-12'
status: 'built'
route: 'full'
route_source: 'auto'
review: ''
review_source: ''
lenses_ran: []
review_loop_iteration: 0
followup_review_recommended: false
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/implementation-artifacts/plan-mock-interview-home-style.md', '{project-root}/_bmad-output/implementation-artifacts/plan-workbench-pages-home-style.md', '{project-root}/_bmad-output/implementation-artifacts/plan-topic-pages-home-style.md']
warnings: ['oversized']
deferred: []
baseline_revision: '194b2c9'
---

<intent-contract>

## Intent

**Problem:** Home, the menu, topic pages, chapters, the interview book, the architecture section, the practice workbench and the mock interview are one family now. The review page (`/review`, spaced repetition of the chapters the reader has marked read) is still the old site. The owner asked to redesign it, then progress next.

**Approach:** Rebuild `/review` as a home-style scene page on the shared kits (`TopicKit`, `Journey`, `MenuKit`, `ChapterKit`, the home pieces, `FrameHeader`): a one-screen hero ("what is due today", the count as the big idea, a primary "Start reviewing" pill and an outline pill to see the schedule), a composed stage of taped cards (the next due chapter as the featured card, a numbers card, a "how the spacing works" sticky: 3 days, 1 week, 3 weeks, 2 months, 6 months), then numbered bands: due now (flat dashed rows with topic chip, chapter, how overdue, and the actions "I remember" and "Again"), coming up (a trail or a grouped schedule by day), recently reviewed, and an honest empty state for readers who have not marked anything read (a clear path back to the chapters, no fake data). The success moment when the due list reaches zero is a stamp or sticker in the home language (replace confetti-only; keep it subtle and reduced-motion safe).

## Scope

`app/review/ReviewView.tsx`, `app/review/review.module.css` (591 lines: replace with family rules, no dead CSS), `app/review/page.tsx`, and any shared piece the page needs (extend the shared kits, never copy styles). The Review "N due" badge in the menu already exists; leave the menu alone.
Not in scope: the whiteboard (the owner wants it untouched; do not edit `app/whiteboard/**`, `lib/whiteboard*`, `app/mock/Whiteboard.tsx`), the progress page (next round), the storage logic in `lib/storage.ts` and the spacing maths (`dueAt`, `REVIEW_GAPS_DAYS`), which stay exactly as they are.

## Boundaries & Constraints

**Always:**
- Start from fresh screenshots of `/review` at 1440x900 and 390 in three states (nothing marked read, some due, nothing due but scheduled) and compare with home, the mock lobby and a topic page; reuse the kits and tokens.
- Behaviour unchanged: which chapters are due and when, marking a review as remembered or again, the due badge in the menu staying in sync, links into chapters, progress storage, the interview-book confidence rows if they appear on this page today (keep them working), and every e2e role and name (or update the tests in the same change).
- Typography: the `--t-*` scale on `:root`; weights 400 and 700; nothing under 12px; headings in `--font-heading`, prose in `--font-body`; eight handwriting styles and nine themes must hold.
- Rules learned in earlier rounds: header gap at least clamp(48px, 8vh, 96px) above the highest decoration, a measured one-screen hero capped in height, balanced space above and below, text uses the full width of its panel, nothing part-transparent at any scroll position, no transition that shows two states at once, no one-frame flash before hydration (everything that depends on saved progress is hidden until hydration, with an e2e that samples every frame for a wrong count or label), no `data-fx` scroll reveals, reduced-motion safe, tap targets 44px on phones, no horizontal scroll at 320.
- Numbers come from data; no invented streaks or percentages.

**Never:** comments in source (`npm run comments` fails them); hex, white or literal colours (theme tokens only); hard offset shadows; edits to `.claude/skills/` or `_bmad/`; touching port 3000 or any broad `pkill`; committing, pushing or staging (the coordinator does that).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| New reader | Nothing marked read | Hero with an honest "nothing to review yet" stage and a path to the chapters | none |
| Items due | Several chapters due | Count in the hero, featured next card, due rows with actions, menu badge in sync | none |
| Review one | "I remember" / "Again" | Row leaves or moves, counts update with no layout jump, schedule shown | none |
| All done | Due list reaches zero | Subtle success stamp and what comes next | none |
| Nothing due, scheduled | Marked read, none due | Next due date shown, coming-up list | none |
| Phone | 390 and 320 | Stacks, actions reachable, no horizontal scroll | none |
| Fonts and themes | 8 styles x 9 themes | No clipping or overlap; axe passes | none |

</intent-contract>

## Code Map

- `app/review/*` -- the page
- `lib/storage.ts` (`dueAt`, `REVIEW_GAPS_DAYS`, `progress`), `lib/interviewConfidence.ts`, `lib/hooks.ts` -- logic (read only)
- `components/frame/FrameHeader.tsx`, `components/topic/TopicKit.tsx`, `Journey.tsx`, `components/ui/MenuKit.tsx`, `components/chapter/ChapterKit.tsx`, `app/mock/*` (lobby as a recent reference), `components/home/*` -- the language to reuse
- `e2e/smoke.spec.ts`, `e2e/a11y.spec.ts`, `tests/*`, `content/architecture/*` -- tests and chapters whose asserted numbers change

## Tasks & Acceptance

- Given `/review` in the three states at 320, 390, 1440 and 1920, then it is visibly the same family as home and the mock lobby, with a measured one-screen hero where the topic pages have one, and nothing overlaps.
- Given marking reviews and the due list reaching zero, then everything works as before and the menu badge stays in sync (the existing e2e covers it; extend where chrome changed).
- Given eight handwriting styles and nine themes, then nothing is clipped or overlapped and axe passes in all nine themes at 1440 and 390 on the states the e2e opens (add the empty, due and all-done states if missing).
- Given `npm run check`, `npm run build` and the full e2e in a clean copy, then all pass; architecture chapter numbers asserted by `tests/claims.test.ts` are updated.

## Implementation Notes

(agent: log progress here, newest last)

**Round 1 (build)**
- `/review` is a home-style scene page on `PageFrame layout="reader"` with `TopicPage accent="orange"` and the kicker mark. Files: `app/review/ReviewView.tsx` (data, state, which bands show), `ReviewHero.tsx` (one-screen hero and the composed stage), `ReviewBands.tsx` (due, schedule, recent, start and spacing bands), `ReviewSession.tsx` (the guided one-at-a-time session, kept), `StageDots.tsx`, `reviewModel.ts` (pure helpers, unit tested), and the CSS modules `review`, `bands`, `session`, `stageDots` (old 591-line file replaced). `lib/storage.ts` untouched; the spacing maths (`dueAt`, `REVIEW_GAPS_DAYS`) is only read.
- Hero: kicker, heading with the count ("5 chapters are due today." / "Nothing is due today." / "Nothing to review yet.", underlined phrase), lead, "Start reviewing" (opens the session) or "Find something to read →", a ghost jump to the schedule or the spacing, chips (read count, minutes, shaky interview answers link). Stage: a taped "Next up" card (the chapter due first, or the one that comes back next, or the first-time note), a numbers card, a yellow "Gaps grow" sticky (bars from `REVIEW_GAPS_DAYS`), a status sticker and a hand note. Everything that depends on saved progress (heading block, real cards, sticker) is hidden until hydration with the kit's `pending` class.
- Bands (numbered by what is present): start (nothing read), 01 Due now (flat dashed rows with chip, lateness, stage dots, "I remember" and "Again"; Again moves the row to the end marked "still due, read it again" with Open and Undo; nothing is stored for Again, as before), the all-done stamp card when this visit cleared the list, schedule (a sticky two-week forecast card and chapters grouped by day, first 12 then "Show all"), recently reviewed (latest six with kept-for-good tags), and the spacing trail.
- Small buttons, paper, sticky and tape come from `app/mock/mockKit.module.css` (imported, not copied); `TopicKit` got one rule (44px `a.chip` on phones). Dots, rows and the stamp are review-specific CSS on the same tokens. The accent is blue (as the mock lobby and problems), so the underline and numbered circles follow the family.
- Tests: new `e2e/review.spec.ts`, review joins the hero-measure test in smoke and the session flow test is renamed to the new button names, four new a11y states, `tests/review-model.test.ts`, `tests/topic-type.test.ts` covers the new modules.

**Gates (clean scratch copy)**
- `npm run build` ok; `npm run check` ok (863 unit tests in 44 files); full e2e 454 of 454, no retries, after the last change. Architecture chapters: 53 CSS modules, 92 client files, 52 axe states (9 seeded), 171 axe tests, 9 specs and 440 browser tests, 863 unit tests, a review.spec.ts row and a "review page" section in the design-system chapter.
- Reviewed by eye (own `next start`, reduced motion): the three states at 1440 Classic light, 1920 Classic, 1440 Marker Night, Chalk lavender, Reading blueprint, Roboto, Pen sepia, Script rose; 390 (all states, Chalk Night, Sketch Night), 320; the Again row, the all-done stamp card, the session and its done card.

## Plan Change Log

## Review Triage Log

## Verification

**Commands:**
- in a clean scratch copy: `npm run build`, then `npm run check`, then `npx playwright test --workers=3 --retries=0` -- expected: all green (a known home rail landing test can flake under load; rerun it alone before reporting a failure)

**Manual checks:**
- Own screenshots over several rounds at 390, 1440 and 1920 of the three states; Classic, Marker, Chalk, Reading, Roboto; light, Night, lavender, blueprint; next to home and the mock lobby to judge one family.

## Auto Run Result

Built. Independent check in a clean copy on the final code: `npm run build` ok; `npm run check` 863 unit tests in 44 files (one pre-existing lint warning in `components/topic/useReadingPlan.ts`); full e2e 454 of 454 with no retries. `git diff --stat -- app/whiteboard lib app/mock` is empty, so the whiteboard, the review logic and the mock pages are untouched. `/review` was rebuilt as a home-style scene page (hero with the due count, taped "Due first" card, numbers card, "Gaps grow" sticky, bands for due now, the schedule, recently reviewed and how the spacing works, a guided session, and an "All done" stamp instead of confetti). Screenshots reviewed by the coordinator, Classic light at 1440x900: nothing read, four chapters due (hero and the Due now band). Not verified by eye: 390 and 320 widths, Night and other themes and fonts, the session and all-done states, 2560 wide, print. Two choices the owner may veto: the accent is blue like the mock lobby (the old page used orange), and Again is not persisted, as before.
