---
title: 'Chapter pages in the home language: reader chrome and prose for every chapter of every topic'
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
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/implementation-artifacts/plan-topic-pages-home-style.md', '{project-root}/_bmad-output/implementation-artifacts/plan-sidebar-and-menu-v3.md']
warnings: ['oversized']
deferred: []
baseline_revision: 'bd5f5e7'
---

<intent-contract>

## Intent

**Problem:** Home, the menu, the chapter sidebar and the topic pages (level picker, path, cover, outline) are now one family, but the chapter reading page itself (the page every one of the 227 written chapters renders through `components/series/ChapterView.tsx` and the shared prose rules in `app/globals.css`) still looks like the old site. The owner asked to redesign the chapter page, for every chapter, in the same language as the rest.

**Approach:** Redesign the reader as one reusable template so every chapter of every topic changes at once, without editing chapter content files: a home-style chapter hero (big handwriting title with the code in a numbered mono kicker, the level and part, read-time, diagrams and exercises as chips, the Listen control, one taped or stickered moment), a calm, comfortable reading column (the reader's comfort comes first: measure about 60 to 72 characters, body at the `--t-*` body size or larger, generous line height, the `--reader-zoom` text-size setting still works), section headings with the numbered kicker rhythm, and the prose building blocks styled as the same family: sticky-note boxes (`.sticky`, `.bx` and its variants) as home sticky notes and stamps, code blocks as the home editor card (the "counter.js" card look), diagrams (`.dg` SVGs and figures) on paper cards with a caption, tables, `.qa` question and answer blocks, try-it blocks, the practice strip, the chapter end (mark as read, next chapter as a home-style "next stop" scene, pager). The left chapter sidebar, the right "On this page" card, the header Menu pill and the Chapters sheet were just redone in the shared kit (`components/ui/MenuKit.tsx`, `components/chapter/rail.module.css`): keep them and make the page around them agree with them.

## Boundaries & Constraints

**Always:**
- Study `app/HomeView.tsx`, `components/home/*`, `components/ui/MenuKit.tsx`, `components/topic/TopicKit.tsx` and `Journey.tsx`, then reuse their pieces and tokens. Anything new that two or more of these surfaces share goes in one shared place.
- Do not edit chapter content (`content/**`): the redesign lives in `ChapterView`, `components/chapter/*`, `components/series/chapter.module.css`, `components/reader/*` and the prose rules in `app/globals.css` (chapter bodies are HTML strings that cannot import a module, so prose rules stay global). If a content pattern cannot be styled without a markup change, list it and ask me; do not hand-edit hundreds of chapters.
- Every chapter content pattern must still work and look right: headings h2 to h4, paragraphs, lists, inline code, `pre` code blocks with the enhance-code controls, tables inside `.table-scroll`, `.sticky` (all colours), `.bx` boxes (prim, ref, others), `.qa`, `.dg` diagrams and figures with captions, try-it blocks and scripts, step-through visualisers, callouts and checkpoints, images, blockquotes, details. First inventory which classes and elements the content actually uses (grep the content tree) and write the inventory in the plan notes, then style every one of them.
- Keep everything that works today: reading progress bar, active-heading tracking in "On this page", keyboard shortcuts (`[` `]` `t`), narration/Listen with its settings, mark as read, resume writing, search, hash links to sections, print styles, `--reader-zoom`, the diagram filter defs, scroll regions for wide code and tables, and the focus and aria behaviour the e2e uses.
- Typography: the `--t-*` scale on `:root`; display type once per page; weights 400 and 700 only; nothing under 12px in chrome (prose follows the reader zoom); headings in `--font-heading`, prose in `--font-body`; all eight handwriting styles and nine themes must hold, with extra care for Reading and Roboto (long-form reading) and for Chalk and Marker (thin or heavy faces).
- Responsive 320 to 2560, no horizontal page scroll (wide tables and code scroll inside their own region), tap targets at least 44px on phones. Print stays clean.
- Performance: no layout shift on load, no extra client JS beyond what the template needs, no pinned scenes, no parallax, no scroll-reveal that leaves text part-transparent (topic pages already dropped `data-fx`; do the same on chapters).

**Never:** comments in source (`npm run comments` fails them); hex colours, white or literal colours (theme tokens only; chapter-semantic fixed colours that globals already allow stay as they are, see `tests/theme-roles.test.ts`); hard offset shadows; edits to `.claude/skills/` or `_bmad/`; touching port 3000 or any broad `pkill`; committing, pushing or staging (the coordinator does that).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Any written chapter, any topic | `/notes/*`, `/react/*`, and every other topic's chapter routes | Same template, topic accent, no overflow, no clipped or overlapped text | none |
| Heavy chapter | Many diagrams, wide tables, long code, step-through visualisers (find the heaviest ones) | Diagrams on paper cards at full width, wide tables and code scroll inside their regions, visualisers keep working | none |
| First and last chapter | No previous or no next | Pager and "next stop" scene degrade gracefully | no broken link |
| Mark as read | Toggle | State persists, progress line and sidebar tick update as today | none |
| Listen / narration | Start and stop | Works as today; highlight of the spoken paragraph stays readable in all themes | none |
| Reduced motion, JS off | Preference set, or no JS | All text visible at once; chapter body readable without JS (it is server HTML) | none |
| Fonts and zoom | Eight styles, zoom steps | No clipping at any size; line length stays comfortable | none |
| Print | Print preview | Clean body, no chrome | none |

</intent-contract>

## Code Map

- `components/series/ChapterView.tsx`, `components/series/chapter.module.css` -- chapter page template
- `components/chapter/*` (ChapterHeaderPager, ChapterEnd, ChapterPager, ChapterCard, PartSection, TocCard, ChapterRail, ChaptersSheet, ChapterSearch, rail.module.css) -- page chrome
- `components/reader/*` (ChapterDone, PracticeStrip and its css, enhancements, narration, scrollRegions) -- reader behaviour
- `components/topic/TopicReader.tsx`, `components/topic/reader.module.css`, `components/frame/*` -- the topic reader wrapper and page frame
- `app/globals.css` -- prose building blocks (`.sticky`, `.bx`, `.qa`, `.dg`, code, tables, headings) and `:root` tokens; it ends with appended playground blocks, keep them
- `content/**` -- READ ONLY: used to inventory patterns and to find the heaviest chapters
- `components/ui/MenuKit.tsx`, `components/topic/TopicKit.tsx`, `Journey.tsx`, `components/home/*` -- the language to reuse
- `e2e/smoke.spec.ts`, `e2e/a11y.spec.ts`, `tests/*`, `content/architecture/*` -- tests and chapters whose asserted numbers change

## Tasks & Acceptance

- Given any chapter of any topic, then the page is visibly the same family as home, the menu and the topic pages, with a home-style hero, a comfortable reading column and the prose blocks restyled, checked in your own screenshots of at least ten different chapters across at least five topics, including the heaviest ones, at 320, 390, 1440 and 1920.
- Given a crawl of every chapter route at 390 wide in a production build, then no page has horizontal page overflow, no console error and no empty body; add that as an e2e or script-based check that runs in the suite in a reasonable time (batch it; a few minutes at most).
- Given the eight handwriting styles, the nine themes and the zoom steps, then no chrome or prose is clipped or overlapped, and axe passes in all nine themes at 1440 and 390 for the chapter states the e2e opens (add a second topic's chapter and a heavy chapter to the states).
- Given the existing behaviours listed above, then they all still work (the e2e covers them or you extend it).
- Given `npm run check`, `npm run build` and the full e2e in a clean copy, then all pass; architecture chapter numbers asserted by `tests/claims.test.ts` are updated.

## Implementation Notes

(agent: log progress here, newest last; include the pattern inventory)

**Working order (owner): kit first, then the redesign.** 1 inventory, 2 reusable chapter kit proven in a throwaway preview in the scratch copy (eight fonts, nine themes), 3 recompose `ChapterView`/`TopicReader` and the prose layer from the kit, delete what it replaces, crawl, gates.

**Inventory (step 1, done)**
- Routes: 200 written chapters render through the reader (js 41, react 57, architecture 26, dsa 34, system-design 24, git 18) via `TopicReader` (topics) and `ChapterView` (architecture, git). The other 27 of the "227" are interview-book chapters (`/interview/*`, own book shell, not this reader). Unwritten chapters render the outline pages (not in scope).
- Section headings in content are `h3` only (200 of 200 chapters); `h4` in 112; no `h2`, `h1`, blockquote, details, img or hr. The page `h1` is the chapter title. `withHeadingIds` ids every `h3` and builds the "On this page" list.
- Block patterns (uses over all chapters): `p.sub` 699 (caption or follow-up under code), `div.table-scroll` 206, `div.bx.is-ref` 252 and `div.bx.is-prim` 75 (titled callouts, `span.ttl` first child), `div.warn` 178, `div.qa` 152 with `p.q` 100, `div.try` 102 (code plus injected run button and `.demo__term` output), `div.say` 101, `div.codeblock` 70 (static) plus every `pre` (wrapped at runtime by `enhanceCodeBlocks`, copy button), `div.sticky.mint` 65 and plain `div.sticky` 2, `figure` with `svg.dg` and `figcaption` in 108 chapters (4 per chapter at most; 106 `svg.dg`), `div.demo` family 29 (`demo__bar/body/ctl/note/term`), `div.loop-*` 22, `div.viz*` 8, `div.c3d*` 1, `div.boxes` + `bx__cap/slot/arrow` 3, `chipset`, `readout`, `ruler`, `units`, `ev-box`, `dom-sandbox`, `cover__meta` with `chip` and `tag--beginner|intermediate|advanced` (18). Tables use `td.tone-yes|no|warn|bad` and inline `span.tone-*`. Inline code `code` everywhere, `span.c` comment spans inside code, `button.btn`, `button.btn--ghost`, `label`, `input`, `select` in demos, `script` in 24 chapters (activated at runtime), inline `style` 983 (mostly svg text sizes), `aria-label` 212, `role="img"` on diagrams.
- SVG diagram internals use `.box .boxg .boxr .boxy .ln .lnr .lng .dash .rough` and `text.lbl .sm .rd .gr` (token based already, filter defs come from `DiagramDefs`).
- Heaviest chapters: longest `dsa/dsa-dp-2d` (66k chars), `js/var-let-const` (35k), `system-design/sysdes-walkthrough-simple` (34k), `git/scale`, `git/tools`; most diagrams `dsa/dsa-complexity-analysis`, `dsa/dsa-arrays-strings`, `system-design/sysdes-walkthrough-medium`, `git/model` (4 each); most tables `git/cheat` (11), `js/types-values` (9), `dsa/dsa-interview-strategy` (8); most code `react/react-interview-bank` (20 pre), `js/basic-async` (17), `js/types-values` (15, and 14 try blocks); most demos and scripts `js/in-the-browser` (5 scripts), `js/closures` (c3d), `js/single-thread`, `js/var-let-const`; most sections `react/react-typescript` (17), `js/security` (16); shortest `react/react-custom-renderers` (5k).
- Global rules shared with other surfaces (mock room, interview book): `.sticky`, `.warn`, `.say`, `.ttl`, `pre`, `code`, `table`, `figure`; chapter-only rules: `.bx*`, `.qa`, `.try`, `.demo*`, `.dg*`, `.codeblock*`, widget classes. The reader prose layer is therefore scoped under one wrapper class and owns the chapter-only rules outright.

**Kit contract (step 2)**
- React pieces in `components/chapter/ChapterKit.tsx` with `components/chapter/chapterKit.module.css`, built on `MenuKit` (`Eyebrow`, `kit.rows`), `TopicKit` (`Kicker`, `Underlined`, chips) and the home Stage pieces (`Tape`, `Sticker`); the home `btn` classes are composed, nothing re-implemented.
  - `ReaderLayout({accent, rail, railId, aside, children})`: the page, the three-column grid (rail 272, column, aside 232; aside drops at 1240, rail at 900), sets the topic `--accent`. `ReaderAside({label, children})`: the sticky right column (used by "On this page" and "Meanwhile").
  - `ReadingColumn({id, read, children})`: the `article.chapter` (still carries `is-done`), at most 54rem.
  - `ChapterHero({mark, num, partLabel, title, subtitle, facts, listenId, position, read, status})`: numbered kicker with the topic mark, the title in `--t-chapter` with the last word hand-underlined, the subtitle as a lead, chips for the facts, the Listen button (`.listenbtn`, `data-listen`), and one taped stamp card (chapter n of N, a "read" sticker once read; dashed and plain for unwritten chapters, which also get a "Not written yet." chip via `status`).
  - `ChapterInlineToc({toc})`: the "On this page" fold under 1240px. `Prose({html, bodyRef, id})`: the reader-zoomed `.prose` wrapper that receives the chapter HTML. `ChapterPractice({exercises, topicId, level, levelTotal})`: practice rows as a paper card.
  - `ChapterEndScene({finish?, prev, next, basePath, homeLabel})`: the Finish region (mark as read, progress) and the "Chapter navigation" nav (previous row, the next chapter as a yellow taped "next stop" card; "The end" and "Back to" variants).
  - Header pieces: `ChapterCrumbs`, `ChapterHeaderPager`, `ChaptersButton`. `useChapterBody(chapterId)` (components/reader) runs the enhancers, narration and scroll regions for the `.prose` body.
- The HTML-string prose layer is one block in `app/globals.css` under `.prose` (find it by `.prose {`): measure 38rem (`--measure`, callouts `--measure-card`), numbered section headings (`h3` with a CSS counter, the same numbers as "On this page"), `h4`, `p.sub`, lists, links, inline code, the code card (`pre`, window-dot bar drawn in `pre::before` so it is identical before and after `enhanceCodeBlocks` wraps it, copy pill), the try-it card (code, run strip reserved with `html[data-js]` so the run button adds no shift, output panel), the table card (`.table-scroll`), the figure card with a numbered caption, the callouts (`.bx.is-prim`, `.bx.is-ref`, `.warn`, `.say`, `.sticky`, `.sticky.mint`), the `.qa` rows, and the `.demo` window frame. Widget internals (`loop-*`, `viz*`, `c3d*`, `chipset`, `readout`, `ruler`, `units`, `ev-box`, `dom-sandbox`, `bx__*`, `.dg` svg classes) are untouched and keep their rules in `globals.css`.
- New `:root` tokens: `--t-prose` (1.125rem), `--t-prose-h3`, `--t-chapter` (smaller for Reading, Roboto, Chalk, Marker).
- Throwaway preview (scratch copy only, not in the repo): `app/kit-preview` renders every piece over real chapter bodies.

**Owner direction after the first kit pass (overrides the plan where it conflicts)**
- Text uses the full reading column: no `max-width`, `ch` cap or right padding on prose; paragraphs, lists, headings, `.qa`, `.bx`, notes under code, code cards, figure cards and tables share the same left and right edges. Line length is controlled by the column width (`clamp(640px, 58vw, 980px)`) and a body size that grows with the viewport (`--t-prose`), aiming at about 70 to 90 characters from 1280 to 2560. No dead band between a paragraph's end and the column edge at any width.
- Much bolder redesign at the level of the home scenes, keeping reading comfortable: composed hero (big title, numbered kicker, "what you will learn" taped card, stamp sticker, hand note, chips), heavier section headings with the numbered kicker, dashed rule and a marker underline plus real vertical rhythm, sticky-note callouts with tape and a rubber stamp for traps, editor-card code (title bar with a file label, Run this pill in the bar, quiet copy), taped figure cards with handwritten captions, a "try it" with a console panel, and a next-stop scene with a trail.

**Build log (kit first, then the redesign)**
- Kit built and proven in a throwaway preview (scratch copy only, `app/kit-preview`, not in the repo): every piece over real chapter bodies, screenshots in Classic, Marker, Sketch, Pen, Script, Chalk, Reading and Roboto, and in light, Night, lavender, blueprint and kraft, at 320, 390, 1280, 1440, 1920, 2307 and 2560 wide.
- After the owner's direction the kit was reworked: the article is `clamp(640px, 58vw, 940px)`, `--t-prose` is `clamp(1.125rem, 0.5rem + 0.9vw, 1.625rem)` (Sketch is scaled up), no prose element has its own max-width or padding-right, and the e2e asserts that a paragraph, a code card and the article share one width and that a line is at most 92 characters from 1280 to 2560 wide.
- Found and fixed on the way: a scroll-driven reveal in `globals.css` (`.chapter h3`, `pre`, `.say`, `.sticky`, `.dg` with `animation-timeline: view()`) that left headings and code part-transparent; the old header pager arrows overflowing the header at 390 and below (they are hidden under 520px, the end scene and `[` `]` remain); inline `code` inside `.qa .q` breaking out of a flex container.
- Removed because the kit replaced them: `components/series/chapter.module.css`, `components/chapter/ChapterEnd.tsx`, `ChapterPager.tsx`, `ChapterHeaderPager.tsx`, `components/reader/PracticeStrip.tsx` and its module, `components/reader/ChapterDone.tsx` (unused), the page, hero, end and pager rules of `components/topic/reader.module.css`, and from `app/globals.css` the chapter-only rules `.codeblock*`, `.chapter__*`, `.chapter--soon`, `.badge`, `.listenbtn`, `.toc*`, `.pagebtn*`, `.btn__hint`, `#chapters`, `.qa*`, `.bx` and its variants, `.try pre`, `.try__run`, `.demo`, `.demo__bar`, `.demo__body`, `.practice*`, `.practice-strip*`, and the chapter selectors of the view-timeline reveal. `PageFrame`'s `frame.module.css` no longer blanks `h3` pseudo-elements.
- Tests: new `tests/chapter-kit.test.ts`; `tests/theme-roles.test.ts` lists `.prose .sticky` and `.prose .sticky.mint` instead of `.bx.is-prim` and `.bx.is-ref`; new `e2e/chapters.spec.ts` (crawl of the 200 written chapters at 390 in batches of twenty, balanced header gap, line length, shared edges, no part-transparent text, hero stage, heavy chapter blocks, no layout shift for the run button, wide figure scroll, outline chapter); `e2e/a11y.spec.ts` adds `/notes/types-values`, `/react/react-interview-bank`, `/dsa/dsa-complexity-analysis` and three states; `e2e/smoke.spec.ts` article width and `finishMark`. Architecture chapters: globals.css about 8,400 lines and the 8,429 bar, 39 CSS modules, 84 client files, 36 pages and 35 states for axe, 135 a11y tests, a new `chapters.spec.ts` row, 5 specs and 358 browser tests.

**Gates (clean scratch copy, final code)**
- `npm run build` ok; `npm run check` ok (719 unit tests in 43 files, one old lint warning in `useReadingPlan.ts`, comments, format and spelling clean).
- Full e2e on the previous build: 364 of 368 passed; the four failures (blueprint and forest contrast of `.bx__cap` inside the tinted primitive box, a hidden "On this page" selector in the new a11y state, links inside callouts losing the callout colour) were fixed and the affected specs rerun green (17 plus 38 tests). Crawl of all 200 written chapters at 390: no overflow, no clipped content, no console error, no failed request, no empty body; separately checked at 320 with a script (clean after the `.warn` title fix).
- Reviewed by eye: JavaScript var/let/const (Night, 2307 wide; Marker lavender 1280), closures (Classic 1440 and 390), types-values, git cheat sheet (1920), react interview bank (Reading Night 1440, 1920), dsa complexity (Chalk blueprint, 320), dsa dp-2d (Pen lavender 390), architecture build (figure), TypeScript outline chapter, home and the topic path page side by side; Sketch, Pen, Script kraft; 2560 measured by the e2e only.

## Plan Change Log

## Review Triage Log

## Verification

**Commands:**
- in a clean scratch copy: `npm run build`, then `npm run check`, then `npx playwright test --workers=3 --retries=0` -- expected: all green (a known home rail landing test can flake under load; rerun it alone before reporting a failure)

**Manual checks:**
- Own screenshots over several rounds, at 320, 390, 1440 and 1920, of a short chapter, the longest chapter, a diagram-heavy chapter, a table-heavy chapter and a code-heavy chapter from different topics; Classic, Marker, Chalk, Reading, Roboto; light, Night, lavender, blueprint; with the sidebar, the hero and a home screenshot side by side to judge one family.

## Auto Run Result

Built. Independent check in a clean copy on the final code: `npm run build` ok; `npm run check` 719 unit tests in 43 files (one pre-existing lint warning in `components/topic/useReadingPlan.ts`); full e2e 368 of 368 with no retries, including the 200-chapter crawl at 390 wide. The agent's own full run before its last fixes was 364 of 368; the four failures (blueprint and forest `.bx__cap` contrast, an a11y selector, callout link colour) are fixed and the whole suite passes. Owner direction applied: prose, lists, headings, callouts, code cards, figure cards and tables share one left and right edge; the redesign is built on a reusable kit (`components/chapter/ChapterKit.tsx`, one scoped `.prose` layer in `app/globals.css`), and the old chapter-specific components and rules it replaced were removed. Screenshots reviewed by the coordinator: JavaScript Scope (hero and body, Classic light, 1440x900) and var-let-const (Night, 1440x900). Not verified by eye: narration highlight readability, themes sepia, forest, rose and mono, 2560 wide, zoom steps, print preview, and the phone view of a chapter.
