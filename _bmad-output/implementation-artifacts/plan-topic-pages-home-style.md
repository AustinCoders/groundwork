---
title: 'Topic pages in the home language: level picker, syllabus, path, cover and the outline pages of unwritten topics'
type: 'feature'
ticket: ''
created: '2026-10-11'
status: 'built'
route: 'full'
route_source: 'auto'
review: ''
review_source: ''
lenses_ran: []
review_loop_iteration: 0
followup_review_recommended: false
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/implementation-artifacts/plan-sidebar-and-menu-v3.md']
warnings: ['oversized']
deferred: []
baseline_revision: 'a280c9c'
---

<intent-contract>

## Intent

**Problem:** The per-topic pages still look like the old site and "ajib" (odd) next to the redesigned home page. The owner sent a full-page screenshot of the level picker ("How much JavaScript do you already have?", Step 1 of 2) with the Beginner/Intermediate/Advanced cards on a vertical rail and the "Full syllabus" accordion with its chapter-card grid, and said: the home page design is the reference; this page type is reusable, so the change must apply to every topic that has written chapters; and topics that are not yet written need their UI changed too. The screenshot also shows things that look broken (overlapping text in the Intermediate card and in the syllabus grid, a "Guided project" card repeated and cut off, text with strike-like lines): first find out whether those are real bugs (check with reduced motion on and with real scrolling) or captures taken mid scroll-reveal, and fix the cause either way so nothing can look like that.

**Approach:** Rebuild the topic page family on the same visual language as the home scenes and the new menu kit (`components/ui/MenuKit.tsx`, the `--t-*` type scale on `:root`): handwriting display headings, numbered mono kickers, paper surfaces with a thin `--line` border and soft shadow, one taped or stickered hero moment per page, `--mark` highlighter for the current item, dashed connectors (the level rail becomes the home "winding trail" idea in a calm, non-pinned form), the home pill buttons and chips, per-topic accent via the existing `--accent`. Calm, readable, no gimmicks: no pinned scroll scenes, no parallax, no marquee, no glows, no hard offset shadows, no pastel icon chips. Light scroll reveals are fine only if they never leave text half transparent for axe or a screenshot (use the existing reveal helper that respects reduced motion).

## Scope (all of it is one reusable family; one implementation per page type, driven by topic data)

1. Level picker: `app/level/LevelView.tsx`, `app/level/[topic]/page.tsx`, `components/topic/level.module.css`, `components/Syllabus.tsx`.
2. Path page: `components/topic/TopicPath.tsx` (`/path/[topic]/[level]`).
3. Topic cover: `components/topic/TopicCover.tsx` + `cover.module.css`, and any other topic home view for written topics.
4. Unwritten topics (status ready with `levels: []`, outline only): `components/topic/TopicOutline.tsx`, `TopicOutlineChapter.tsx`, `outline.module.css`, their `app/<id>/page.tsx` entry points and the `/level/[topic]` fallback for them. These must look like the same family and honestly say what is planned (no fake chapter counts, no fake progress), with a clear way back to topics that are written.
5. Shared bits they use: `TopicFrame`, `Crumbs`/`NavTrail` if they appear on these pages.
Not in scope: the chapter reader pages, the home page, the menu and chapter sidebar (just redone), DSA (paused branch).

## Boundaries & Constraints

**Always:**
- Study `app/HomeView.tsx`, `components/home/*.tsx` and `*.module.css` and `components/ui/MenuKit.tsx` first, reuse their pieces and tokens, and put anything new that two or more of these pages share in one shared place (a small kit), not copied per page.
- Typography follows the `--t-*` scale already on `:root` (display once per page, heading, title, control, body, meta, kicker mono uppercase one per section); weights 400 and 700 only; nothing under 12px; rem units; headings and titles in `--font-heading`, prose in `--font-body`; every one of the eight handwriting styles and nine themes must hold (check Classic, Marker, Chalk, Reading, Roboto and light, Night, lavender, blueprint at least by eye).
- Level picker content: what the owner already sees must stay (the stats card with chapters/hours/exercises, one card per level with "I can..." line, chapter/time/exercise counts, who it is for, "Show me this path", the saved "Your level" marker, the full syllabus with per-section written ticks and checkpoint notes, the honest notes, the footer links), but tell it as one calm page: a hero with the question and the stats as a quiet line or one sticker, a trail of three level steps, then the syllabus as three disclosure rows whose sections are flat dashed rows (code, title in heading font, a quiet check for written, a faint "soon" for unwritten), not a grid of boxed cards.
- Responsive from 320 to 1920; no horizontal scroll; tap targets at least 44px on phones.
- Per-topic accent comes from the topic data (`accentVar`), so a new topic needs no CSS.
- Keep a11y roles and names the e2e use, or update those tests in the same change. Keep the client-bundle rule (client files may not import `content/` at runtime). Counts shown come from data, never hard-coded.

**Never:** comments in source (`npm run comments` fails them); hex colours, white, literal colours (theme tokens only); hard offset shadows; edits to `.claude/skills/` or `_bmad/`; touching port 3000 or any broad `pkill`; committing, pushing or staging (the coordinator does that).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Written topic level picker | JavaScript, React, TypeScript and every other topic with levels | Same family of page, topic accent, three level steps, syllabus rows, no overlap, no half-drawn elements at any scroll position | none |
| Saved level | `lastLevel` set | That level's step shows "Your level" and is first in reading order for assistive tech as before | unknown saved value falls back to none |
| Outline-only topic | Python, Java, C++, Rust, Ruby, Go, MongoDB, DBMS, Networks, OS, Claude and AI tools (`levels: []`) | Outline cover and outline chapter pages in the same family; says "planned", lists the planned sections, links to the nearest written topic; no progress or counts that imply written content | `/level/<id>` for these shows the outline family, not an error |
| Partly written level | Some sections written, some not | Written rows are links with a check, unwritten rows are plain with "soon" | none |
| Reduced motion / no JS | `prefers-reduced-motion`, JS off | Everything visible and readable immediately | none |
| 320 and 1920 | Narrowest and widest | No clipping, no horizontal scroll; line length comfortable at 1920 | none |

</intent-contract>

## Code Map

- `app/level/LevelView.tsx`, `app/level/[topic]/page.tsx`, `components/topic/level.module.css`, `components/Syllabus.tsx` -- level picker and syllabus
- `components/topic/TopicPath.tsx` and `app/path/[topic]/[level]/page.tsx` -- path pages
- `components/topic/TopicCover.tsx`, `cover.module.css`, `app/notes`, `app/react/page.tsx` etc. -- covers of written topics
- `components/topic/TopicOutline.tsx`, `TopicOutlineChapter.tsx`, `outline.module.css`, `app/python/page.tsx` etc. -- unwritten topics
- `components/ui/MenuKit.tsx`, `components/ui/menuKit.module.css`, `components/home/*`, `app/HomeView.tsx`, `app/globals.css` (`:root` type scale) -- the language to reuse
- `e2e/smoke.spec.ts`, `e2e/a11y.spec.ts`, `tests/claims.test.ts`, `content/architecture/*` -- tests and chapters whose asserted numbers change

## Tasks & Acceptance

- Given the owner's screenshot page for JavaScript and then for every other written topic, then the page is visibly the same family as home and the menu, and nothing overlaps or looks half-drawn at any scroll position (look at real screenshots at 320, 390, 1440 and 1920, with reduced motion both on and off, and full-page captures that do not show mid-reveal states).
- Given an outline-only topic, then its outline cover and outline chapter are in the same family and honest about being planned.
- Given the eight handwriting styles and nine themes, then no text is clipped, overlapped or under 12px, and axe passes in all nine themes at 1440 and 390 for the level, path, cover and outline states the e2e opens.
- Given `npm run check`, `npm run build` and the full e2e in a clean copy, then all pass; architecture chapter numbers asserted by `tests/claims.test.ts` are updated.

## Implementation Notes

(agent: log progress here, newest last)

**Round 1 (build)**
- The odd screenshot bits were the scroll reveal, not a layout bug. With motion on, `data-fx="up"` (70px translate and opacity tied to scroll position) sat on the whole level trail, the "Full syllabus" heading and every syllabus row group; `data-fx="stagger"` on the hero and the syllabus. A full-page capture leaves everything below the fold at opacity 0 (a blank gap), and a stitched or scrolling capture catches blocks half-faded and 70px off, which stacks as overlapping, doubled and cut-off text. Reproduced at 1440 (full page blank where the syllabus belongs; "Full syllabus" heading at roughly 30 percent opacity mid-scroll). With reduced motion the old page was correct. Fix at the cause: none of the topic pages carries `data-fx` any more; the hero rises with a translate-only CSS animation (no opacity), and the underline draw is a stroke animation, so nothing can be part-transparent at any scroll position. `tests/topic-type.test.ts` rejects `data-fx` in these files and a smoke test scrolls five topic pages with motion on and fails on any visible block with opacity under 1.
- One shared kit: `components/topic/TopicKit.tsx` + `topicKit.module.css` (page, hero, numbered kicker pill with the topic mark, display heading with the hand-drawn underline, taped paper card with a facts list, sticker, hand note, pill buttons, numbered section eyebrow from `MenuKit`, dashed trail of numbered steps, flat dashed rows with code, title, sub, quiet check or "soon", single-open fold, notes card, footer). It reuses `MenuKit` (`Eyebrow`, `kit.row`, `kit.code`, `kit.title`). Two tokens added on `:root`: `--t-hero` and `--t-lead`.
- Level picker: hero with the question (topic name underlined), a hand note, one taped facts card; "01 Pick a level" trail of three numbered steps joined by a dashed connector, each step one paper card (name, "Your level" mark sticker, quote highlighted with `--mark`, count chips, blurb, "This is you if" check list, "Show me this path" outline button); "02 Full syllabus" as three folds whose sections are flat dashed rows in two columns (code, title in the heading font, quiet check or faint "soon", subtitle) and a checkpoint note; "03 Three honest notes"; footer links. Ids kept: `#level-grid`, `#syllabus`, `#curriculum-notes`, `#browse-all-link`, `#level-kicker`, `#level-title`.
- Path page: same hero (level name underlined, meter, start/change/all buttons, facts card), a trail of chapters (done chapters fill the node with a check, the next chapter sits on a paper card with its title highlighted, exercises as rows in a dashed column that is open for the next chapter), practice rows, footer with reset. Ids kept (`#steps`, `[data-step]`, `#path-meter-fill`, `#path-meter-label`, `#start-btn`, `#change-level`, `#all-chapters`, `#reset-progress`, `#practice-list`).
- Cover of written topics: hero with the Up next paper card (budget pills), chips, then one numbered section per level with chapter rows (code, title, subtitle, minutes, read tick; unwritten ones get "soon"), practice buttons, notes, footer. Outline pages (`TopicOutline`): dashed kicker, "Not written yet" sticker, a "Being planned" card for topics with no syllabus or a plan card (planned, levels, written) for topics with one, level sections of "soon" rows, a Meanwhile section with arrows, a button to the written topics, "Switch topic". Outline chapter page: sticker status, roadmap card with the numbered eyebrow and dashed hollow rows, Meanwhile rows. `outline.module.css` is gone; `path.module.css` and `topicKit.module.css` are new.
- Tests: new `tests/topic-type.test.ts` (token-only sizes, weights 400 and 700, mono limited to kickers and chips, no `data-fx`); smoke gets the part-transparent scroll test and the theme-accent selector `[class*='__rowItem'] [class*='__check']`; a11y adds `/level/react` and `/typescript`. Architecture chapters: 38 CSS modules (two chapters), a short "Topic pages" section in the design-system chapter.

**Round 2 (rework after the owner rejected round 1 as "the old page in new clothes")**
- The round 1 look (boxed cards on a rail, narrow column, small type) is gone. Every topic page is now a composed scene built from the home stage kit itself (`Scene`, `Copy`, `Stage`, `StageCard`, `Tape`, `Sticker`, `Note` from `components/home/Stage.tsx`), at the home scene widths (up to 1640px at 1920), with big handwriting display type (`--t-hero`, `--t-section` added on `:root`; a smaller hero for Chalk, Marker, Reading and Roboto) and top breathing room of `clamp(40px, 9vh, 112px)` under the header on every page.
- Level picker: the left column is the question and a native radio group of three large choices (number, name, the "I can" sentence, counts, "Your level" mark); the right is one composed stage that shows the selected level live (taped card with its first chapters and the primary "Show me this path" pill, a yellow sticky "This is you if", a taped facts card, a "your level" sticker, a handwritten note). The selection is pure CSS (`:has(input:checked)`), so it needs no JS and keeps a fixed stage height (no layout shift); keyboard arrows work natively; the saved level is preselected after hydration. The full syllabus is the home Paths idea in a calm form: per level a station head and a winding dashed trail with flag poles and section stops (written ones linked with a tick, unwritten ones dashed with "soon"), the checkpoint as a sticky note, then three sticky "honest notes". On phones the trail becomes a dashed spine with stacked cards.
- Path page: hero with a progress ring card, an "Up next" sticky and a facts card; the chapters are the same winding trail with progress state (done flags filled, the next stop marked "you are here" with its exercises open, the walked part of the trail drawn solid, a read toggle per stop). Cover: hero with the Up next card and the reading-budget sticky, then a book-like "Contents" sheet with part headers and dotted-line entries. Outline pages: dashed draft card with a "sketch only" stamp and ghost cards, the planned trail of "soon" stops per level, and a "Meanwhile" band of signposts to written topics. Outline chapter pages keep round 1's roadmap card.
- Shared code: `TopicKit.tsx` (page, wrap, band, kicker, heading with underline, buttons that compose the home `btn`, facts, notes, rows) and `Journey.tsx` (winding trail, stops, stations); `components/Syllabus.tsx` was removed; `TopicOutline` became a client component because the home stage uses hooks.
- Tests updated: level picker tests (radio group, keyboard, stage height, trail), accent test selectors, a11y adds `/level/react`, `/typescript` and the Advanced-picked state, `tests/topic-type.test.ts` covers the kit, journey and outline CSS.

**Round 3 (owner: more room under the header, and the hero scene on one screen)**
- Every hero scene (level picker, path, cover, outline) is now exactly one viewport below the sticky header on screens at least 1081px wide and 700px tall: `min-height: calc(100svh - var(--header-h))` (the header height is now the `--header-h` token on the page frame), the scene centred, padding of `clamp(32px, 7vh, 96px)` above and below, and the next section starts below the fold. The stage height follows the room left (`--hero-room`), and at 940px and 820px tall the level picker drops its counts line, the blurb and the "and N more" line so everything still fits at 1440x900, 1366x768 and 1280x720 (also checked at 1920x1080 and 2560x1440). Phones, tablets and short screens let the hero grow naturally.
- Later in round 3: the hero is capped at 900px so tall windows do not float it, both columns now start at the same top inside a centred block (`align-content: center`), the stage host has 22px of top room so tape, note and sticker never sit closer to the header than the copy, the stage height follows `--hero-room`, and the next section starts at least `clamp(72px, 13vh, 150px)` below the hero. The gap under the header is at least `clamp(48px, 8vh, 96px)` and the space above and below the scene is within 25% of each other at 1280x720, 1366x768, 1440x900, 1920x1080 and 2316x1068 (measured from every child's bounding box, in the e2e). The level stage is hidden until hydration (only when JS is on) so the saved level never flashes the Beginner panel first, and an e2e samples every frame on load and on a level change for two visible panels or a half-faded element.\n- Superseded smoke test: at 1440x900 and 1280x720 the hero's bottom edge is at the viewport bottom and the next section heading is not in view, for js, react, the JavaScript path, the cover and two outline topics.

## Plan Change Log

## Review Triage Log

## Verification

**Commands:**
- in a clean scratch copy: `npm run build`, then `npm run check`, then `npx playwright test --workers=3 --retries=0` -- expected: all green (a known home rail landing test can flake under load; rerun it alone before reporting a failure)

**Manual checks:**
- Own screenshots over several rounds at 320, 390, 1440 and 1920; JavaScript, React, one more written topic and two outline-only topics; Classic, Marker, Chalk, Reading, Roboto; light, Night, lavender, blueprint. Put a level picker next to a home screenshot and judge whether they are one family before reporting.

## Auto Run Result

Built. Independent check in a clean copy on the final code: `npm run build` ok; `npm run check` 710 unit tests in 42 files (one pre-existing lint warning in `components/topic/useReadingPlan.ts`); full e2e 339 of 339 with no retries. Round summary: the odd overlapping and cut-off text in the owner's first screenshot was the scroll reveal (`data-fx="up"`), not a layout bug, and topic pages no longer use it; the hero of the level picker, path page, topic cover and outline pages is one measured screen under the header (capped at 900px, balanced space above and below, header gap at least clamp(48px, 8vh, 96px), next section clear of the first screen; phones and short windows grow naturally); a one-frame flash of the wrong level panel before hydration is gone and an e2e samples every frame for it. Screenshots reviewed by the coordinator: JavaScript level picker (Classic light, 1440x900), React level picker (Night, Roboto, saved level, 2316x1068), JavaScript path page (Classic light, 1440x900). Not verified by eye: the cover and outline heroes at the final sizes, other themes and fonts at the final hero sizes, 2560x1440 and a tall 1200x2000 window (measured by the agent only).
