---
title: 'Chapter sidebar and site menu: one calm home-style language, and a menu button a new visitor can find'
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
context: ['{project-root}/AGENTS.md', '{project-root}/_bmad-output/implementation-artifacts/plan-site-menu-dashboard.md']
warnings: ['oversized']
deferred: []
baseline_revision: 'c8cba45'
---

<intent-contract>

## Intent

**Problem:** After two rounds the owner still says the sidebar and the side menu give them "no joy" and asked for a redesign of both. Their answers: redesign BOTH the left chapter sidebar (`components/chapter/ChapterRail.tsx`, `ChaptersSheet.tsx` and its reading-page frame) and the site menu drawer (`components/SiteDrawer.tsx`, `components/menu/*`), in one shared language; the menu button must be findable by a brand-new visitor (today it is a bare 16px "≡" icon, with no label, beside the back button, and on a 390px reading page it is a tiny glyph next to a clipped brand); and what they dislike is: the drawer is too crowded, it does not look like the home scenes (it still reads as a separate app), and the chapter list's look and spacing.

**Approach:** Make the drawer shorter and calmer, make the chapter sidebar share the drawer's exact vocabulary, and replace the bare icon with a labelled "Menu" pill everywhere the menu opens. Study the home scenes (`app/HomeView.tsx`, `components/home/*`) and reuse their language: handwriting display headings, numbered mono kickers ("01 · CONTINUE"), paper surfaces with a thin `--line` border and soft shadow, one taped card, `--mark` highlighter for the current item, dashed separators, the home pill buttons and chips. No hard offset shadows, no pastel icon chips, no neon, no glow, no gradient blobs, at most three surface treatments in the whole set.

**Decisions already made by the owner (do not re-ask):**
- Scope: both the chapter sidebar and the site menu, in one language.
- Menu button: a labelled pill that reads "Menu" with the hamburger icon, visible at every width including 320px, on every page type that opens the menu. No first-visit sticky note, no permanent icon rail.
- Keep from the previous round: the disabled "Sign in, coming soon" placeholder (`aria-disabled`), Ctrl/Cmd+K to open search (not inside inputs or editors), Continue where you left off (`groundwork:resume`), the Review "N due" badge, theme swatches and handwriting tiles (tile grid with a large "Aa" sample, Chalk included), no ticket-board entry.

## Boundaries & Constraints

**Always:**
- Drawer content, in this order, and nothing more on first view: header (brand, search with the shortcut chip, close, Sign in placeholder), 01 Continue (one taped card; the level and streak become one quiet line inside or under it, not a stat grid), 02 Go to (six plain rows with a leading stroke icon, current page highlighted with `--mark` and `aria-current="page"`), 03 Topics (single-open category accordion, every category collapsed except the current page's), 04 Appearance (one fold, closed by default, holding theme swatches, handwriting tiles and, on reading pages, text size, narrator and shortcuts). Remove everything else from the first screen (no progress card, no stat row, no extra folds visible), so on a 1440x900 screen the first view shows header, Continue, Go to and the start of Topics without scrolling past a wall of cards.
- The chapter sidebar uses the same pieces as the drawer: the same search pill, the same numbered mono kicker per part ("PART 1 · BEGINNER" with a progress count), the same flat dashed-separated rows with the chapter code in the kicker face and the title in the heading face at the title size, the same `--mark` highlight for the current chapter, read chapters shown with a quiet check, and the same spacing rhythm. The mobile `ChaptersSheet` follows it. The right "On this page" card gets the same treatment if it needs it to look like family.
- Typography from `plan-site-menu-dashboard.md` still holds: the `--t-*` scale (display 1.75rem once per view, heading 1.375rem, title 1.25rem for handwriting fonts and 1rem for Reading and Roboto, control 1rem, body 0.9375rem, meta 0.8125rem, kicker 0.75rem mono uppercase one per section), weights 400 and 700 only, nothing under 12px, rem units, titles in `--font-heading` and hints in `--font-body`. Put the scale on a shared place (`:root` in `app/globals.css` or a shared module) so the sidebar and the drawer use the same tokens, and keep `tests/menu-type.test.ts` meaningful for both files.
- The menu pill: visible text "Menu" (the accessible name stays "Menu"), the hamburger icon, `aria-haspopup="dialog"` and `aria-expanded`, a target at least 44px high on phones, a `title` or visible hint that mentions Ctrl/Cmd+K on wide screens, readable in all nine themes. It replaces the bare icon in `components/frame/PageFrame.tsx`, `components/AppHeader.tsx`, `app/mock/MockApp.tsx`, `app/interview/BookShell.tsx`, the practice/problems/playground top bars, the home header and every other place `SiteDrawer` is opened (search for `SiteDrawer` and the `menu` icon). At 320px the header must not clip the brand or the pill: collapse the brand wordmark to the "G" mark first, never the pill label.
- Reuse existing logic; do not rewrite the topic accordion, resume logic, search or shortcuts. Keep client-bundle rules (no runtime `content/` import in client files), keep roles and names the e2e use or update those tests in the same change.

**Ask First:** adding any new storage key; changing the drawer's position (left) or width behaviour.

**Never:** comments in source (`npm run comments` fails them); hex colours, white, or literal colours (theme tokens only: `--ink`, `--sheet`, `--paper`, `--line`, `--mark`, `--primary`, `--c-*`); hard offset shadows; edits to `.claude/skills/` or `_bmad/`; touching port 3000 or any broad `pkill`; committing, pushing or staging (the coordinator does that).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| New visitor, any page | No saved data | A pill labelled "Menu" with an icon is visible in the header; the drawer's Continue card reads "Start here" with the written topic with the most chapters | none |
| 320px reading page | Header at 320px | Back button, "Menu" pill and the "G" mark all fit with no clipped text; the chapters entry stays reachable | none |
| Chapter page, desktop | Sidebar visible | Same kicker/rows/highlight as the drawer; current chapter highlighted; read chapters checked; sticky and scrollable to the current chapter | none |
| Each handwriting font | Classic, Marker, Sketch, Pen, Chalk, Script, Reading, Roboto | Sidebar and drawer titles in the heading font at the right size, nothing clipped or overlapping | none |
| Keyboard | Tab through pill, drawer, sidebar | Focus rings visible, focus trap and Escape return focus to the pill | none |
| Ctrl/Cmd+K | Any page except inputs/editors | Opens the drawer with search focused | ignored inside inputs, editors, or when another modal is open |

</intent-contract>

## Code Map

- `components/SiteDrawer.tsx`, `components/SiteDrawer.module.css`, `components/menu/*` (ContinueCard, ProgressStrip, QuickActions, Topics, Settings, Shortcuts, Fold, Eyebrow, MenuIcon) -- the drawer to trim and restyle
- `components/chapter/ChapterRail.tsx`, `ChaptersSheet.tsx`, `PartSection.tsx`, `TocCard.tsx`, `components/topic/reader.module.css`, the chapter page layout CSS in `app/globals.css` -- the sidebar and its sheet
- `components/frame/PageFrame.tsx` + `PageFrame.module.css`, `components/AppHeader.tsx`, `app/mock/MockApp.tsx`, `app/interview/BookShell.tsx`, `components/practice/PracticeWorkspace.tsx` (top bar), `app/problems/ProblemsView.tsx`, `components/home/*` header -- every place the menu button lives
- `components/practice/TopIcon.tsx` -- icon set (menu icon)
- `tests/menu-type.test.ts`, `e2e/smoke.spec.ts`, `e2e/a11y.spec.ts`, `tests/claims.test.ts`, `content/architecture/*` -- tests and the chapters whose numbers change

## Tasks & Acceptance

- Given a new visitor on any page type (home, topic cover, chapter, problems, practice, mock, interview book, whiteboard menu if it has one), then a labelled "Menu" pill with an icon is visible without hovering, at 320, 390 and 1440 wide.
- Given the drawer is opened, then it shows only the four numbered sections in the order above, each with the shared eyebrow, and the first view at 1440x900 needs no scrolling to reach the Topics heading.
- Given a chapter page, then the left sidebar and the drawer are visibly the same family (same search pill, kickers, rows, highlight, spacing), checked side by side in your own screenshots.
- Given each of the eight handwriting styles and the nine themes, then no text is clipped, overlapped or below 12px in either surface, and axe passes in all nine themes at 1440 and 390 on the states the e2e opens.
- Given `npm run check`, `npm run build` and the full e2e in a clean copy, then all pass; architecture chapter numbers asserted by `tests/claims.test.ts` are updated.

## Implementation Notes

(agent: log progress here, newest last)

**Round 1 (build)**
- One shared kit, `components/ui/MenuKit.tsx` + `menuKit.module.css`: numbered mono kicker (`Eyebrow`, `EyebrowToggle`), search pill (`SearchPill`, `KeyHint`, `ClearButton`), round close button, dashed flat rows (`kit.rows`, `kit.row`, `kit.code`, `kit.title`, `kit.meta`) with a `--mark` highlight and a quiet row background on the current item. The drawer, the chapter sidebar, its mobile sheet and the "On this page" card all use it.
- Type scale moved to `:root` in `app/globals.css` (seven `--t-*` tokens, and `--t-title: 1rem` for Reading and Roboto). `tests/menu-type.test.ts` now scans four files (drawer, Menu button, kit, sidebar) and rejects local size definitions.
- Menu pill: `components/MenuButton.tsx` (+ module). Visible "Menu" label with the hamburger, `aria-haspopup="dialog"`, `aria-expanded`, `data-menu-button` (the Ctrl/Cmd+K shortcut now clicks that), 44px high at 720px and below, title mentions Ctrl K or Cmd K. It replaces the bare icon on the home header, PageFrame (every framed page, topic cover and chapter), mock, interview book, problems and both playground bars. The whiteboard has its own board menu, not the site menu; its button now carries a visible "Boards" label (aria name still "Boards and export").
- At phone widths: the marked page title is hidden at 520px and below in PageFrame so the Chapters entry and the pager fit at 320; the related-page links, mock title and book title/links hide at 520px and below; the cover's Continue button no longer wraps.
- Drawer (`SiteDrawer.tsx`, `components/menu/*`): header (brand, Sign in placeholder, close, search pill), then 01 Continue (one taped card; the level, chapters read and streak are one quiet link line inside it), 02 Go to (six rows, no hints, two columns above 380px), 03 Topics (single-open accordion shared by the categories and the two guides; the open one follows the current page), 04 Appearance (the eyebrow is the fold's toggle, closed by default, summary shows the theme and font; holds theme swatches, handwriting tiles and, on reading pages, text size, Narrator and Keyboard shortcuts). Removed: progress card and stat row, pastel chips, the separate guide folds, hints, the Settings and ProgressStrip files. At 1440x900 the Topics heading is visible without scrolling.
- Sidebar: search pill with a "/" chip, "The cover" link, one `EyebrowToggle` per part (pill shows 01, 02, 03; the visible label is the level title with "Part N · " kept for assistive tech, count and chevron at the right), flat dashed rows with the chapter code, title in the heading face, a quiet check, and the same highlight. The sheet has the drawer's sticky header. Rail, sheet, search and "On this page" CSS moved out of `chapter.module.css` into `components/chapter/rail.module.css`; the "On this page" card now has the kicker, a trail line and the same rows (the ring is gone).
- Tests changed: `tests/menu-type.test.ts`, `e2e/smoke.spec.ts` (menu tests open the Appearance fold first; the dashboard test became the four-section test; a new 320/390/1440 pill test; the guides test follows the shared accordion), `e2e/a11y.spec.ts` (swatch state and reading menu state open Appearance). Architecture chapters: 37 CSS modules, 329 browser tests (197 in smoke, 171 flows), drawer description.

**Round 2 (verification fixes)**
- Closed folds now use `visibility: hidden` (opacity alone left the swatches reachable by role queries). The current row also gets a quiet background and a primary inset bar (the theme-accent e2e asserts it). The sidebar scrolls to the current chapter on open and keeps its search pill pinned. Rail part toggles are plain divs, not headings (page heading order and the smoke headings test).
- Gates in a clean copy: `npm run build` ok; `npm run check` 668 unit tests in 41 files, 0 errors (one old lint warning in `components/topic/useReadingPlan.ts`), spelling clean; `npx playwright test --workers=3 --retries=0` 329 of 329.

## Plan Change Log

## Review Triage Log

## Verification

**Commands:**
- in a clean scratch copy: `npm run build`, then `npm run check`, then `npx playwright test --workers=3 --retries=0` -- expected: all green (a known home rail landing test can flake under load; rerun it alone before reporting a failure)

**Manual checks:**
- Look at your own screenshots over several rounds at 320, 390, 1440 and 1920 in light, Night, lavender and blueprint, and in Classic, Marker, Chalk, Reading and Roboto; put the drawer, the chapter sidebar and a home screenshot side by side and judge whether they are one family before reporting.

## Auto Run Result

Built. Independent check in a clean copy: `npm run build` ok; `npm run check` 668 unit tests in 41 files (one pre-existing lint warning in `components/topic/useReadingPlan.ts`); full e2e 329 of 329 with no retries. Screenshots reviewed by the coordinator at 1440 (chapter page with the Menu pill, sidebar and "On this page" card; drawer open over it) and at 320 (reading header). Not verified by eye: the whiteboard header after its "Boards" label, every theme and font pair, Marker's thin meta text.
