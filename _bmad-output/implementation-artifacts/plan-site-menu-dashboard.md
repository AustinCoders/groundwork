---
title: 'Site menu: a smart dashboard drawer on every page'
type: 'feature'
ticket: ''
created: '2026-10-09'
status: 'built'
route: 'full'
route_source: 'auto'
review: ''
review_source: ''
lenses_ran: []
review_loop_iteration: 0
followup_review_recommended: false
context: ['{project-root}/AGENTS.md']
warnings: ['oversized']
deferred: []
baseline_revision: '3f6f6a6'
---

<intent-contract>

## Intent

**Problem:** The site menu (`components/SiteDrawer.tsx`, opened from the header's menu button on every page) is a plain, long stack: a search field, a progress card, seven small link tiles, three folds (Topics, Interview book, How this is built), two more folds for Theme and Handwriting, and a footer sentence. It does not answer "where was I" or "what do I do next", settings hide behind folds, and it looks generic next to the redesigned home page. The owner asked to improve its UI "in every way, on every page".

**Approach:** Redesign it as a SMART DASHBOARD DRAWER (owner's choice) with their four extras: a "Continue where you left off" card from the browser's own data, a compact progress strip, bigger quick-action tiles, the topics as a single-open category accordion, inline theme swatches and a handwriting toggle instead of folds, keyboard shortcut hints (including Ctrl or Cmd plus K), and a disabled "Sign in, coming soon" placeholder so a future login does not change the layout. Remove the dev-only ticket link if any trace remains.

## Boundaries & Constraints

**Always:**
- Branch `feature/platform-topics`. Do not start until the instructions in your prompt say the tree is free of other in-progress work (another agent may be editing the book; you work in a scratch copy and touch the real repo only for the files in this plan). No commits, no staging. Node 24 (`PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH`); builds, e2e and screenshots in a scratch copy of the repo under your scratchpad (rsync excluding .next, .git, .vercel, .claude, _bmad; `git init -q` in the copy; build first so generated types exist; a font-fetch error in a build is transient, retry once); only ports 3100 to 3102; NEVER touch the dev server on port 3000; NEVER run a broad `pkill` or `killall` (kill only a specific pid whose cwd is under your scratchpad); theme tokens only (no hex, no white, nine themes, both heading fonts); no comments in source; no dead code; append new spelling words to the end of `.cspell/project-words.txt`; update the architecture chapters for every number or sentence that moves (`tests/claims.test.ts` green).
- Keep working behaviour: dialog semantics, focus trap, Escape closes and returns focus to the menu button, scroll lock, background inert, the closed drawer out of the tab order, the search over topics and pages, the existing e2e-asserted names where possible (`<nav aria-label="Topics">`, the category buttons' accessible names, the fold for the interview book and "How this is built", `a[aria-current=page]`), routes and data. Where a test must change because the structure changes, change it and say so in the notes.
- Structure, top to bottom (mobile 390px sheet and the desktop sheet use the same content; the desktop width gets a two-column inner layout only if it reads better, otherwise a comfortable single column of about 420 to 480px):
  1. Header: brand and close; beside them a `Sign in` placeholder that is clearly disabled ("Sign in, coming soon"), a real element with `aria-disabled="true"`, not a link, not focus-trapping, no account logic, no dead route. The privacy page still says there is no account, which stays true.
  2. Search: a labelled field (real label, not placeholder-only) with a visible shortcut hint chip ("/" and "Ctrl K" or "⌘K" by platform, decided in an effect so server and first client render match); typing filters topics and pages as today; the results stay a flat list. Add a global Ctrl or Cmd plus K shortcut that opens the menu and focuses the search on every page, EXCEPT while focus is in an input, textarea, select, contenteditable or CodeMirror editor, and without breaking the existing key rules in `lib/shortcuts.ts` and `components/chapter/useChapterKeys.ts` (read them first; shortcuts leave keys to focused controls); Escape closes.
  3. Continue card: a taped card (stage vocabulary from the home scenes, tokens only) showing the last topic and chapter the reader was in, its position ("chapter 3 of 41", a progress ring) and one tap back in; derive it from data the site already keeps in the browser (read marks, activity, navigation keys) if that is enough to be correct; if not, add exactly one small versioned key (for example `groundwork:resume`, `{v: 1, topic, chapter, at}`) written when a chapter page is viewed, never read by the server, with a unit test, listed in the "How this is built" state chapter and its key counts. With no history it becomes an honest "Start here" card (the topic with the most written chapters, as the home page does). It never shows anything invented. Nothing new leaves the browser.
  4. Progress strip: Level, an XP bar, day streak, chapters read and problems solved in one compact two-row strip using the existing gamification data (the full card remains reachable through a "See all progress" link), numbers real, `aria` labels in words.
  5. Quick actions: bigger tiles (at least 44px touch targets, icon, name and a one-line hint) for Problems, Playground, Mock interview, Whiteboard, Review (with a real "N due" badge when the review store knows) and Progress; Home stays reachable (the brand links home). `aria-current="page"` on the current page's tile.
  6. Topics: no outer fold; the categories listed directly as the same single-open accordion the sidebar uses (reuse its component or logic rather than duplicating; the open category follows the current topic; ready topics first, coming-soon ones with their quiet "Soon" marker), with the section heading "Topics" and a count. Interview book and "How this is built" stay as two compact folds (or rows that expand) with their chapter counts and current-chapter behaviour.
  7. Settings, inline: Theme as a row of the nine theme swatches (real buttons with accessible names, the current one marked with a text check, a tap switches the theme immediately without leaving the menu; swatch colours come from each theme's own tokens, so use the existing mechanism that previews themes in the current Theme fold rather than inventing colours) and Handwriting as an inline segmented control of the existing font choices; text size or zoom controls that exist today remain reachable (inline if small, else in a small "More settings" fold). Folds for Theme and Handwriting are removed.
  8. Footer: the privacy line and links; remove any dev-only entry: grep for "Ticket" in `components/SiteDrawer.tsx` and the nav data and make sure none exists (the ticket board route files are local and untracked, leave them alone; the menu must not show them).
- Visual language: consistent with the redesigned home (handwriting display headings, paper cards with a small tilt only on decorative cards, never on controls), no neon, no backdrop blobs, generous spacing, clear hierarchy (Continue first), tidy rhythm; focus rings visible; reduced motion respected; the drawer's open and close transitions only when motion is allowed; text contrast AA in nine themes; no text clipped at 320px.
- Every page: check that the menu opens and looks right from the home page, a topic cover, a chapter, the DSA chapter, problems, playground, mock, interview book, progress, review, the whiteboard (it has its own header: confirm the menu entry point there), the architecture pages and a coming-soon topic, at 390 and 1440, in a dark, a light and a handwriting-font theme. Fix per-page problems you find (for example pages whose header does not open the new menu correctly).
- Tests: unit tests for any new pure helper (continue-card derivation, shortcut-hint platform text, key handling); e2e in `e2e/smoke.spec.ts`: the new menu shows Continue, progress strip, quick actions, the topics accordion (single open, current topic's category open), inline swatches switch the theme and persist, the handwriting toggle works, the Sign in placeholder is disabled and not focusable as a link, Ctrl or Cmd plus K opens the menu with the search focused (and does nothing inside an input or the editor), Escape closes and restores focus, search still finds topics, no "Ticket" text, no horizontal overflow at 320, 390 and 1440; update `e2e/a11y.spec.ts` menu states (closed, open at top, open with a category expanded, open with the swatches focused) in nine themes at 1440 and 390; update the existing menu-related tests that rely on the old folds.
- Visual quality: screenshot the menu at 390x844, 320x640, 1440x900 and 1920x1080 in a dark theme, a light theme and a handwriting-font theme, in its states (top, scrolled, a category open, search results, theme swatches), look critically as a senior frontend developer and UI/UX designer, and iterate over several rounds until it is clear, tidy, delightful and obviously better than today's.

**Never:** Do not change routes, the topics data or categories, the hero or home scenes, or the progress, gamification and theme logic beyond reading them; do not add accounts, network calls or tracking; do not add a dependency; no hex or white; no `dangerouslySetInnerHTML`; no placeholder-only labels; do not make the Sign in placeholder a link; do not break the focus trap, Escape or the closed-drawer tab-order rule; do not show developer-only entries.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| First visit, no history | open the menu | Continue shows "Start here" with the best written topic; progress strip at zeros | none |
| Returning reader | read marks and a last chapter | Continue shows that chapter, "chapter n of m", ring, one tap back | missing chapter data falls back to Start here |
| Search | type "rust" | flat results incl. Rust as Soon; Enter opens a sole match | none |
| Shortcut | Ctrl or Cmd plus K on any page | menu opens, search focused | ignored inside inputs and the editor |
| Escape | Escape in the open menu | closes, focus returns to the menu button | none |
| Theme swatch | tap a swatch | theme changes at once, current marked in text, persists | none |
| Sign in | tap the placeholder | nothing happens, announced as unavailable | none |
| Narrow phone | 320px | no horizontal overflow, nothing clipped | none |
| Reduced motion | media feature | no open or close animation, instant changes | none |

</intent-contract>

## Code Map

- `components/SiteDrawer.tsx` (about 600 lines: `DrawerBody`, `TopicList`, `Fold`, `LINKS`, `GuideList`, search `hits` and `topicHit`), `components/SiteDrawer.module.css` (about 870 lines), `lib/topicNav.tsx` (`useTopicsNav`, `useGuidesNav`, `navHref`), `lib/topicCategories.ts`, `components/AppHeader.tsx`, `components/frame/PageFrame.tsx`, `app/mock/MockApp.tsx`, `app/interview/BookShell.tsx` and the whiteboard header (the places that render the menu button and the drawer).
- Progress and settings data: `lib/gamification.ts`, `lib/storage.ts` (`progress`, `REVIEW_GAPS_DAYS`, `store`), `lib/hooks.ts`, the theme and font mechanisms (`lib/theme*`, `app/globals.css`, the existing Theme fold code), the review store used by `/review`.
- Shortcuts and focus: `lib/shortcuts.ts`, `components/chapter/useChapterKeys.ts`, `components/FocusTrap.tsx`, `components/Modal.tsx`.
- Tests and docs: `e2e/smoke.spec.ts` (menu and sidebar tests around the Topics fold and `nav[aria-label=Topics]`), `e2e/a11y.spec.ts` ("site menu open" states), `tests/claims.test.ts`, `content/architecture/*` (state chapter if a key is added, test counts, line counts).
- New: any pure helpers under `lib/` with tests; the Continue card and settings components under `components/` (a small folder for the menu parts is fine) and CSS modules as needed (update the claims-asserted CSS module count and the line-count chart).

## Tasks & Acceptance

**Execution:**
- [ ] derive the Continue data (and the one optional key only if needed) with tests
- [ ] rebuild the drawer: header with the Sign in placeholder, search with shortcut hints and Ctrl or Cmd plus K, Continue, progress strip, quick actions, topics accordion, inline settings, footer; remove the folds, the dev-only link and dead code
- [ ] check and fix the menu entry point on every page type
- [ ] `e2e/smoke.spec.ts`, `e2e/a11y.spec.ts` and the architecture chapters, cleanup audit, Implementation Notes

**Acceptance Criteria:**
- Given any page, when the menu opens, then the top shows a Continue card (or Start here), a compact real progress strip, bigger quick-action tiles with a real due badge, the topics as a single-open accordion following the current topic, inline theme swatches and a handwriting toggle, shortcut hints and a disabled Sign in placeholder, and no ticket or developer entry.
- Given Ctrl or Cmd plus K outside inputs and the editor, then the menu opens with search focused; given Escape, then it closes and focus returns; the focus trap, inert background and closed-drawer tab-order rules still hold.
- Given nine themes, 320 to 1920px widths and reduced motion, then the menu is readable, AA, free of horizontal overflow and clipping, and animations stop under reduced motion.
- Given `npm run check`, `npm run build` and the full e2e, then all pass with axe clean in nine themes at 1440 and 390 for the menu states; your own screenshots of the menu on the page types listed look clearly better than today and consistent with the home page.

## Implementation Notes

Built as a dashboard drawer; status left for the owner to set.

**What changed**
- `components/SiteDrawer.tsx` is now a thin shell (portal, focus trap, Escape, scroll lock, Ctrl or Cmd plus K) around `DrawerBody`; the parts live in `components/menu/` (`ContinueCard`, `ProgressStrip`, `QuickActions`, `Topics`, `Settings`, `Shortcuts`, `Fold`, `MenuIcon`). One CSS module, `components/SiteDrawer.module.css`, rewritten.
- Layout: a sticky header (brand, disabled "Sign in, coming soon" button with `aria-disabled`, close, then the labelled search with a Ctrl K or Cmd K chip), a taped hero Continue card with a progress ring and a "Pick up" button, a level badge with XP bar and three stat tiles, six tactile quick-action tiles (due badge on Review, "here" tag with `aria-current` on the current page), the topics as a single-open accordion with a category icon, a ready-count ring and a marker bar on the current category, the interview book and "How this is built" as folds, inline theme swatches (radiogroup with arrow keys, check badge on the current), a handwriting radiogroup, text size and Narrator when reading, a Keyboard shortcuts fold, and the footer. Entrance motion only under `prefers-reduced-motion: no-preference`. Hard offset shadows and edges use `light-dark()` so they do not glow in dark themes.
- Continue data: existing browser data was not enough (nothing records the last chapter opened), so one small versioned key was added, `groundwork:resume` (`{v: 1, topic, topicName, chapter, num, title, href, index, total, at}`), written in an effect by `TopicReader` and `ChapterView`, read only in the drawer, validated by `parseResume`. `lib/continueCard.ts` falls back to "Start here" (the written topic with the most chapters) when the key is missing, malformed, or names a topic or guide chapter that is gone.
- Ctrl or Cmd plus K: `lib/menuShortcut.ts`; `SiteDrawer` clicks the page's own Menu button (focusing it first, so Escape returns focus there) and focuses the search. It is ignored in inputs, textareas, selects, contenteditable and `.cm-editor`, and while another modal is open.
- Dev-only "Ticket board": no trace was in `SiteDrawer` or the nav data (grep clean); the e2e asserts the menu has no "ticket" text.
- Whiteboard: it has its own board menu, not the site menu; an "Elsewhere on Groundwork" row of site links was added to it (`app/whiteboard/BoardMenu.tsx`). Ctrl K does not open anything there.
- Removed: the Theme and Handwriting folds, the old progress card, the "Go to" list, the `children` prop of `SiteDrawer` (unused).
- `AppearancePicker` now exports `FONT_FAMILIES`.

**Tests changed**: `e2e/smoke.spec.ts` (fold-based menu tests rewritten for inline swatches and text size; new tests for the dashboard, the Continue card and Ctrl or Cmd plus K), `e2e/a11y.spec.ts` (the Topics fold state became "the site menu open with the Data category expanded", a new "theme swatches focused" state, the reading menu opens Narrator and Keyboard shortcuts). New unit tests: `tests/continue-card.test.ts`, `tests/menu-shortcut.test.ts`.

**Docs**: architecture chapters updated for the 85 client files, the new key (32 keys, "the other twenty-two"), the a11y states and test counts, the drawer description, and the line-count chart (smoke.spec.ts is now the second-longest file).

## Plan Change Log

- Owner feedback mid-build asked for a bolder redesign: the first tidy version was replaced by the sticky header, hero Continue card, tactile tiles and category accordion with icons and rings.

## Review Triage Log

## Verification

**Commands:**
- in the scratch copy: `npm run build`, then `npm run check`, then `npm run test:e2e` -- expected: all green

**Manual checks (if no CLI):**
- Open the menu on each page type at 390 and 1440 in dark, light and a handwriting theme; use search, a shortcut, the swatches and the Continue card.

## Auto Run Result

Built. Independent check in a clean copy: `npm run build` ok; `npm run check` 637 unit tests in 40 files (one pre-existing lint warning in `components/topic/useReadingPlan.ts`); full e2e 328 of 328 on the agent's run and 327 of 328 on the coordinator's (the home section rail landing test failed under load and passed 3 of 3 alone). Screenshots reviewed: menu on home (light, night) and a topic page at 390 (lavender). Known gap: `arch-testing.ts` and `arch-health.ts` still say 405 unit tests in 24 files, stale before this work and not asserted by a test.
