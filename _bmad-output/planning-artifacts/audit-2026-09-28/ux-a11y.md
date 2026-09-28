# Groundwork: UX, visual-system and accessibility audit

Static, read-only audit of `feature/app-audit` (HEAD `d766972`) on 2026-09-28. I did not run a build, a dev server or any tests. Contrast ratios were computed offline from the hex tokens in `app/globals.css`, using the WCAG luminance formula (scripts are in the scratchpad, not the repo). All file references are repo-relative `path:line`.

Severity scale: **Critical** means the site is unusable for a group of users. **High** means a WCAG A/AA failure or a broken core flow on many routes. **Medium** means a real defect with a workaround, or systemic drift that is already causing bugs. **Low** means polish or hygiene.
Effort: **S** is under 2 hours, **M** is half a day to 2 days, **L** is several days.

---

## 0. Corrections to the brief

These points in the brief don't match the code:

- **`/problems`, `/practice` and `/whiteboard` do not use `components/Shell.tsx`.**
  - `/problems` has its own header plus `SiteDrawer` (`app/problems/ProblemsView.tsx:374-426`).
  - `/practice` and `/problems/[slug]` use the `PracticeWorkspace` top bar plus `SiteDrawer` (`components/practice/PracticeWorkspace.tsx:825-900, 1073`).
  - `/whiteboard` uses `BareShell` with no header, plus its own `BoardMenu` (`app/whiteboard/WhiteboardShell.tsx:17`, `app/whiteboard/BoardMenu.tsx:164-190`).
  - `Shell` is used only by the topic readers (through `ReaderShell`), `/level/[topic]`, `/path`, `/soon`, `app/not-found.tsx` and `app/error.tsx`.
- **`/git` and `/architecture` do not have the labelled `.head-back` pill or the scroll-fx engine.** `SeriesLanding`, `ArchitectureView` and `ChapterView` render an **icon-only** back button (`components/series/SeriesLanding.tsx:63`, `app/architecture/ArchitectureView.tsx:158`, `components/series/ChapterView.tsx:255`). None of them calls `useScrollFx`.
  - `useScrollFx` is used only by `app/HomeView.tsx:718`, `app/mock/MockApp.tsx:80`, `app/interview/BookShell.tsx:27` and `components/frame/PageFrame.tsx:38`.
  - The labelled pill appears only in `PageFrame` (`/review`, `/progress`), `BookShell` (`/interview/**`) and `MockApp` (`/mock`).
- **14 of the 21 topics have no written chapters.**
  - Affected topics: html, css, nextjs, nestjs, typescript, node, docker, databases, testing, security, cloud-devops, graphql, redis and kubernetes. Each has 0 `ready: true` chapters and 21–41 `ready: false` chapters in `content/*-notes.ts`.
  - All 14 are still marked `status: "ready"` in `content/topics.ts`.
  - This drives finding **U1**.

---

## 1. Route × shell matrix

The Shell column names the header/layout component each route renders. The Back column names which back-button variant it uses.

| Route | Shell / header | Back button | Menu / drawer | Sidebar | Scroll-fx | Footer | Brand "JS" mark |
|---|---|---|---|---|---|---|---|
| `/` | Custom sticky nav (`HomeView.tsx:796-827`) | none | `SiteDrawer` | none | **JS `data-fx` + Lenis** | **Rich 4-column footer** (only one on the site) | yes |
| `/notes`, `/react`, `/dsa`, `/system-design` + 14 outline topics (covers) | `ReaderShell` → old `Shell` (focused) | **Two**: topbar icon (≤900px) + sidebar "rail" link (`Shell.tsx:178, 241`) | Shell's own off-canvas `<aside>` (≤900px) | Full Shell sidebar: clock/weather, streak, topic of day, tools, chapter nav + search, progress, display settings, print, narration | CSS `animation-timeline: view()` reveals (`globals.css:3651-3690`) | none | yes (×2) |
| `/<topic>/[chapter]` (18 topics) | same as covers | same | same | same, plus a top progress bar and a back-to-top FAB | same CSS reveals on `.chapter h3/pre/.dg` | chapter footer nav only | yes |
| `/<topic>/[chapter]` while loading | **No shell at all.** `loading.tsx` renders a bare `ChapterSkeleton` | none | none | none | – | – | no |
| `/architecture` | `ArchitectureView` custom header | **icon-only** | `SiteDrawer` (`reading`) | none | none | none | **no** |
| `/architecture/[chapter]`, `/git/[section]` | `ChapterView` | **icon-only** | `SiteDrawer` (`reading`) + "Chapters" sheet dialog | Left chapter rail + right "On this page" | none (own progress bar) | none | **no** |
| `/git` | `SeriesLanding` | **icon-only** | `SiteDrawer` | none | none | none | **no** |
| `/interview`, `/interview/[chapter]`, `/interview/questions` | `BookShell` | **labelled `.head-back`** (fallback "Interview book") | `SiteDrawer` | Round view: "In this round" rail | JS `data-fx` + Lenis | none | yes |
| `/mock` | `MockApp` header | **labelled `.head-back`** | `SiteDrawer` | none | JS `data-fx` + Lenis | none | yes |
| `/review`, `/progress` | `PageFrame` | **labelled `.head-back`** | `SiteDrawer` | none | JS `data-fx` + Lenis | none | yes |
| `/problems` | `ProblemsView` custom header (h1 in header) | **icon-only** | `SiteDrawer` + Filters sheet dialog | Filters aside | none | none | **no** |
| `/practice`, `/problems/[slug]` | `PracticeWorkspace` `lc-topbar` | **icon-only** (`lc-icon-btn`) | `SiteDrawer` | Brief / tests panel | none | none | **no** |
| `/whiteboard` | `BareShell header={false}` + floating `BoardMenu` island | **icon-only** | `BoardMenu` (boards, export, theme; **no site navigation**) | none | none | none | **no** |
| `/level/[topic]` | old `Shell` (focused) | topbar icon + rail | Shell sidebar | Shell sidebar + `ChapterNavSection` | none | `.site-foot` links | yes |
| `/path` | old `Shell` (focused) | topbar icon + rail | Shell sidebar | Shell sidebar + `ChapterNavSection` | none | `.site-foot` | yes |
| `/soon` | old `Shell` (full) | topbar icon + rail | Shell sidebar | full Shell sidebar | none | `.site-foot` | yes |
| `/level` (query redirect) | renders `null` | – | – | – | – | – | – |
| 404 (`not-found.tsx`), `error.tsx` | old `Shell` (full), **also for errors on new-style pages** | topbar icon + rail | Shell sidebar | full | none | none | yes |
| `global-error.tsx` | inline-styled bare document | none | none | none | none | none | no |

Totals:
- **7 distinct header implementations**: Shell topbar, HomeView nav, PageFrame, BookShell, MockApp, the series header (`SeriesLanding`/`ArchitectureView`/`ChapterView`/`ProblemsView`, whose CSS is duplicated per module), and `lc-topbar`. The whiteboard adds an eighth, the `BoardMenu` island.
- **3 back-button variants**: labelled pill, icon-only, and Shell's rail link plus topbar icon.
- **3 drawer implementations**: Shell `<aside>`, `SiteDrawer` and `BoardMenu`.
- **2 scroll-reveal engines**: CSS `view()` timelines on old pages, JS `data-fx` on new pages.

### What each navigation surface contains

| Item | Old `Shell` sidebar | `SiteDrawer` | Home footer | Whiteboard `BoardMenu` |
|---|---|---|---|---|
| Home | brand only | "Home" link | brand | back button only |
| Playground / Problems / Whiteboard | yes | yes | yes | – |
| **Mock interview** | yes (`Shell.tsx:288`) | yes (`SiteDrawer.tsx:24`) | yes | – |
| Interview book | yes, conditional (`Shell.tsx:275`) | "Learn" fold | yes | – |
| How this is built | "Playground" group, icon **▤** (`Shell.tsx:269-274`) | footnote link + fold | "You" column | – |
| Review (due badge) | yes, **with due count** (`Shell.tsx:310`) | yes; due only inside `ProgressCard` | yes, no count | – |
| Progress | icon **🔥** (`Shell.tsx:319`) | icon **▤** (`SiteDrawer.tsx:26`) | yes | – |
| Topics | "Ready to read" / "More topics", or "Switch topic" in focused mode | "Topics" fold (ready + coming soon) | first 5 ready | – |
| Clock / weather / streak / topic of day | yes | **no** | no | no |
| Theme | Radix dropdown ("Theme") | swatch radiogroup ("Theme") | – | own |
| Font | dropdown labelled **"Style"** (`Shell.tsx:441`) | radiogroup labelled **"Handwriting"** (`SiteDrawer.tsx:446`) | – | – |

Mock interview appears on every surface except the whiteboard, which has no site navigation at all. The inconsistencies are in icons, labels and widgets, not in which destinations are listed.

---

## 2. Findings

### 2.1 Navigation and header consistency

**N1 — Medium-High — Eight header/back-button patterns across the site**
- Evidence: the table above.
  - `components/Shell.tsx:177-195, 240-242`
  - `components/frame/PageFrame.tsx:47-79`
  - `app/interview/BookShell.tsx:36-78`
  - `app/mock/MockApp.tsx:168-201`
  - `components/series/SeriesLanding.tsx:61-83`
  - `app/architecture/ArchitectureView.tsx:156-176`
  - `components/series/ChapterView.tsx:253-321`
  - `app/problems/ProblemsView.tsx:374-426`
  - `components/practice/PracticeWorkspace.tsx:825-900`
  - `app/whiteboard/BoardMenu.tsx:164-190`
- What's inconsistent:
  - `PageFrame` and `BookShell` are near-verbatim copies of each other, each with its own CSS module (`frame.module.css:30-41` and `book.module.css:34-45`).
  - The brand mark appears on 6 surfaces and is missing on 6.
  - Menu icon buttons measure 36, 38 or 40px depending on the module (see V3).
- Impact: users relearn where "back", "menu" and "home" are on every section, and the visual identity feels like several products.
- Fix:
  - Extract a single `<SiteHeader>` with slots (`back`, `title`, `links`, `actions`) and one `<BackPill>` that collapses to icon-only below 720px.
  - Migrate `Shell`'s topbar and the series headers onto it.
  - Delete the duplicated `.top`, `.iconBtn` and `.brand` rules.
- Effort: M–L.

**N2 — Medium — The old `Shell` shows two back buttons on mobile, and its sidebar contents drift from `SiteDrawer`**
- Evidence:
  - Two back buttons: `Shell.tsx:178` (topbar icon) and `Shell.tsx:240-242` (rail link inside the drawer) render together when the ≤900px drawer is open.
  - Icon clash: **▤** means "How this is built" in `Shell.tsx:271` but "Progress" in `SiteDrawer.tsx:26`, where Progress is 🔥 in `Shell.tsx:319`.
  - Label clash: the font setting is called "Style" (`Shell.tsx:441`) in one place and "Handwriting" (`SiteDrawer.tsx:446`) in the other.
  - Two different theme controls: `ThemePicker` dropdown versus `AppearancePicker` radiogroup.
- Impact: same destination, different glyph; same setting, different name.
- Fix: share the `LINKS` array and icon map between both surfaces, and use one appearance picker. Better still, replace the old sidebar's nav block with `SiteDrawer` (see N1).
- Effort: S–M.

**N3 — Low — The brand mark is a hard-coded "JS" in 9 JSX sites plus the icons**
- Evidence:
  - `app/HomeView.tsx:811, 1178`
  - `components/Shell.tsx:190, 231`
  - `components/AppHeader.tsx:21`
  - `components/SiteDrawer.tsx:534`
  - `components/frame/PageFrame.tsx:63`
  - `app/interview/BookShell.tsx:57`
  - `app/mock/MockApp.tsx:184`
  - `app/icon.tsx:34`, `app/apple-icon.tsx:34`
- Impact: the brand reads as "JavaScript notes" on Docker, Kubernetes and system-design pages.
- Fix: add a `<BrandMark/>` component with a "G" or neutral glyph, and update the icons too.
- Effort: S.

**N4 — Low — The whiteboard has no route out except back**
- Evidence: `app/whiteboard/BoardMenu.tsx:167` (back only). The drawer at `BoardMenu.tsx:68` holds only boards and export. `aria-haspopup="dialog"` sits on an `<aside>` that has no `role="dialog"` (`BoardMenu.tsx:173-176`).
- Impact: users who arrive from a share link have no site navigation.
- Fix: add a "Groundwork" section (the `SiteDrawer` `LINKS`) to `BoardMenu`, and either give it `role="dialog"` or drop `aria-haspopup`.
- Effort: S.

**N5 — Low — Due-review count is only visible in the old Shell sidebar**
- Evidence: `Shell.tsx:310` shows the count. On new-style pages it is shown only inside the closed `SiteDrawer` `ProgressCard` (`SiteDrawer.tsx:173-179`). Home shows it only to returning users (`HomeView.tsx:268-288`).
- Fix: put a dot or count badge on the Menu button, or next to "Review" in `PageFrame` links.
- Effort: S.

### 2.2 Accessibility

**A1 — High — The old Shell's off-canvas sidebar stays focusable and exposed when closed (≤900px)**
- Evidence:
  - `app/globals.css:3558-3574` hides it with only `transform: translateX(-102%)`. There is no `visibility:hidden`, `inert` or `display:none`, and `grep visibility|inert globals.css` returns nothing.
  - `components/Shell.tsx:209-217`: the aside is always rendered.
  - `Shell.tsx:143` calls `asideRef.current?.focus()` on an `<aside>` that has no `tabIndex`, so it does nothing.
- Impact:
  - At phone/tablet widths, or at 200% zoom on a laptop, keyboard and screen-reader users tab through roughly 40–80 invisible controls before reaching content.
  - Affected routes: all 18 topic readers, `/level`, `/path`, `/soon`, 404 and the error page.
  - Fails WCAG 2.4.3 and 2.4.7 (focus goes to invisible elements).
- Fix: at ≤900px, apply `visibility:hidden` (transitioned) or set `inert={!drawerOpen}` on the aside when closed, and add `tabIndex={-1}` to the aside.
- Effort: S.

**A2 — High — Modal dialogs don't trap or manage focus**
- `SiteDrawer` (every new-style page):
  - `components/SiteDrawer.tsx:531` sets `role="dialog" aria-modal="true"`.
  - `SiteDrawer.tsx:504-524` focuses the first link and restores focus on close, but has **no focus trap and no `inert` on the page**, so Tab walks out into the obscured page.
  - By contrast, the old Shell drawer uses Radix `FocusScope` (`Shell.tsx:24-33`).
- ChapterView "Chapters" sheet:
  - `components/series/ChapterView.tsx:497-514` is `role="dialog" aria-modal`, with no initial focus, no trap and no focus return.
  - Its trigger's `aria-controls="arch-rail"` (`ChapterView.tsx:271`) points at the desktop aside, not the dialog.
- Problems "Filters" sheet: `app/problems/ProblemsView.tsx:627-630` has the same issues. It closes on Escape (`:258-265`) but has no focus handling.
- Impact:
  - Keyboard users lose their place.
  - Screen-reader users are told the page is modal while Tab says otherwise.
  - Fails WCAG 2.4.3 and violates the ARIA dialog pattern.
- Fix: wrap all three in the existing `FocusScope` (trapped, loop), or use native `<dialog>.showModal()` as `components/Modal.tsx` already does. Set `inert` on `#main` while open.
- Effort: S–M.

**A3 — High — Global Enter/Space handlers swallow activation of focused buttons and links**
- Question-bank drill: `app/interview/questions/QuestionBank.tsx:54-67`.
  - While a card is closed, `keydown` on `window` calls `preventDefault()` for **Enter or Space on any element** except inputs and dialogs.
  - As a result, "Stop" (`:105`), the back pill, the header links and the "Menu" button all reveal the card instead of activating.
- Mock room brief step: `app/mock/Room.tsx:737-757`.
  - Enter on any non-input element dispatches `enter` and prevents default.
  - `SiteDrawer` is a portal and is not excluded, so Enter on a drawer link during the brief starts the round instead of navigating.
  - The review step guards buttons and links (`:758`); the brief step does not.
- Impact: keyboard users can't operate visible controls. Fails WCAG 2.1.1.
- Fix: bail out when `e.target` is inside `button, a, summary, [role=button], [role=dialog], [contenteditable]`, or when `e.defaultPrevented`. Better, scope the shortcut to the card or stage element.
- Effort: S.

**A4 — Medium — Broken skip link on the playground and every problem page**
- Evidence: `app/practice/PracticeClient.tsx:69` links to `#editor`. No element with `id="editor"` exists anywhere (confirmed by grep across `app`, `components` and `lib`).
- Impact: "Skip to the editor" does nothing on `/practice` and `/problems/[slug]`, the most keyboard-heavy pages. Axe does not check skip-link targets.
- Fix: put `id="editor"` (with `tabIndex={-1}`) on the editor wrapper, or point the link at `#main`.
- Effort: S.

**A5 — Medium — Single-character shortcuts can't be turned off (WCAG 2.1.4)**
- Evidence:
  - `components/reader/ReaderShell.tsx:183-202`: `/`, `[`, `]`, `n`, `p`, `t`.
  - `components/series/ChapterView.tsx:165-177`: `[`, `]`, `n`, `p`, `t`.
  - The whiteboard has many as well, but it is an application region, which is acceptable.
- Impact: speech-input users who say words containing "n", "p" or "t" navigate away from the chapter.
- Fix: add an off switch in the drawer's "Reading" fold, or require a modifier. Keep `/` for search only when focus is on `body`.
- Effort: S.

**A6 — Medium — Headings: some screens have no `<h1>`**
- Evidence:
  - `PageFrame` renders its title as a `<span>` (`components/frame/PageFrame.tsx:69`).
  - The review **session** state renders only `<h2>` (`app/review/ReviewView.tsx:103-107, 172-176`).
  - The mock **room** has no `h1` in any step (`app/mock/Room.tsx:86, 421, 531, 611`; only `Lobby.tsx:339` and `Scorecard.tsx:111` have one).
  - ReaderShell search mode replaces the chapter (and its `h1`) with an `h2` "Search results" (`ReaderShell.tsx:404-406`).
  - The old Shell puts sidebar `h2`s ("Ready to read", "Chapters", "Your progress", "Display") before `main`'s `h1` in DOM order (`Shell.tsx:356, 388, 430`).
- Impact: screen-reader heading navigation has no landmark title on these screens.
- Fix: add a visually hidden `h1` in the session, room and search states. Make `PageFrame`'s title an `h1` only when the page has none, or pass `titleAs`.
- Effort: S.

**A7 — Medium — Home "how it works" story hides 3 of 4 steps from assistive tech**
- Evidence: `app/HomeView.tsx:500`: `<article … aria-hidden={i !== active}>`. `active` only changes on scroll. The mobile `storyList` duplicate is `display:none` on desktop (`home.module.css:738-739`).
- Impact: desktop screen-reader users hear step 1 only. The rail buttons (`:483-495`) change the step silently.
- Fix: stop hiding inactive steps (make them visually dimmed only), or add `aria-live="polite"` to `.pinCopy` and keep all steps readable.
- Effort: S.

**A8 — Medium — Focus is lost when card-based flows advance**
- Evidence:
  - Review session remounts `<article key={r.ch.id}>` after "✓ I still had it" (`ReviewView.tsx:103, 119-128`).
  - The drill remounts `<article key={q.id}>` (`QuestionBank.tsx:106`).
  - `RouteFade` wraps the whole app in `<div key={pathname}>` after the first navigation (`components/RouteFade.tsx:10-15`). That remounts the entire tree on every client navigation, resetting sidebar scroll, reader search and open `<details>`.
- Impact: focus drops to `<body>` and keyboard users restart from the top on every card.
- Fix: move focus to the new card's heading (`tabIndex={-1}` plus `focus()`), as `LoopWizard.tsx:221` already does. Drop the `key` in `RouteFade` and animate with CSS on `main`.
- Effort: S–M.

**A9 — Medium — The a11y e2e suite covers the light theme only, and computed contrast fails in other themes**
- Coverage gap:
  - `e2e/a11y.spec.ts:28-35` never sets `data-theme`.
  - `tests/contrast.test.ts` checks only editor syntax tokens (4.5:1) and palette tokens at **3:1** against `--sheet` (`:107-118`). That is a non-text threshold, and it is applied to tokens also used for text.
- Computed failures:
  - **Kraft**: `--pencil` (#6b5a3f) on `--paper` (#d8c6a0) is **3.96:1** (`globals.css:207, 216`). `--pencil` is text colour 38× in `app/mock/mock.module.css` and 16× in `problems.module.css` on paper-coloured pages, and `.sub` uses it at weight 300 (`globals.css:724-729`).
  - **Mock "Lean no" verdict stamp**: `color: var(--dg-yellow-stroke)` (`mock.module.css:1838-1840`) is **2.72:1** on `--sheet` and 2.51:1 on `--paper` in light. That fails even large-text 3:1.
  - **Primary buttons**: forest home/mock `.btn` (`--paper` on `--c-green`) is **4.43:1**. Kraft interview-book `.btn` is **4.13:1** (`book.module.css:164-183`), and it is 16px text, which is not large.
  - **Accent text on accent-soft chips**: tokens `--c-orange` and `--c-yellow` on their `-soft` mixes sit at 3.1–3.5:1 in light, kraft, forest and lavender. Wherever that pairing is used for text it will fail.
- Fix:
  - Parametrise the a11y spec over at least `light`, `dark` and `kraft` (set `localStorage` before `goto`).
  - Extend `contrast.test.ts` to assert `--pencil` and `--ink-soft` ≥ 4.5 on `--paper`, `--sheet` and `--sheet-2`, and `--paper` ≥ 4.5 on `--c-green`/`--c-red`.
  - Darken kraft `--pencil`, and use `color-mix(... var(--ink))` for the lean-no stamp.
- Effort: M.

**A10 — Medium — Code is rendered in handwriting fonts in 5 of 7 font styles**
- Evidence: `app/globals.css:111-140`: `marker`, `sketch`, `pen`, `script` and `roboto` all set `--font-code: var(--font-body)`, i.e. Shadows Into Light, Reenie Beanie, Neucha, Handlee, Roboto.
- Impact: in code, `0/O`, `1/l/I` and `{}`/`()` become ambiguous, and Reenie Beanie at 14px is barely legible. This undermines exercises and interview answers.
- Fix: always keep `--font-code: var(--font-mono)`. Offer a separate "handwritten code" toggle if desired.
- Effort: S.

**A11 — Medium — Scrollable regions aren't keyboard focusable, and the axe rule for it is disabled**
- Evidence:
  - `e2e/a11y.spec.ts:34, 48` disable `scrollable-region-focusable`.
  - Reader tables are wrapped in `.table-scroll` with `min-width: 460px` (`components/reader/enhancements.ts:67-74`, `globals.css:2908-2911`) and no `tabindex`.
  - The progress heatmap scroller (`progress.module.css:342-345`, inner `min-width: 760px` at `:351`) has no `tabindex`.
- Impact: Safari keyboard users can't scroll these on narrow screens. Chrome and Firefox mitigate this with focusable scrollers.
- Fix: add `tabIndex={0}`, `role="region"` and `aria-label` to the scroll wrappers, then re-enable the rule.
- Effort: S.

**A12 — Low-Medium — State conveyed only visually**
- Progress badges: earned versus locked is shown only by colour and border style (`progress.module.css:593-625`, `ProgressView.tsx:430-438`), with no text.
- Heatmap days: only a `title` on a non-focusable span (`ProgressView.tsx:124`). The week chart bars carry only their height (`ProgressView.tsx:285-296`).
- CoverMap stations: "not written", "read", "next" and "within budget" are CSS classes only (`components/reader/CoverMap.tsx:156-181`); unwritten stations show "—".
- `PracticeStrip` solved tick is a bare "✓" (`components/reader/PracticeStrip.tsx:37`). `ProblemsView` does this correctly with visually hidden "(solved)" (`ProblemsView.tsx:675`).
- Fix: add visually hidden text such as "(earned)", "(not written yet)" and "(read)". Render the week chart as a table or give it a data-rich `aria-label`.
- Effort: S.

**A13 — Low-Medium — Noisy or awkward ARIA**
- `CoverMap` "peek" `<aside aria-live="polite">` (`CoverMap.tsx:203`) re-announces the whole preview on every hover **and every focus** as users tab the stations.
- The station tick toggles both `aria-pressed` and its label ("Mark X read"/"Mark X unread", `CoverMap.tsx:183-191`). Screen readers say "Mark X unread, pressed". Pick one.
- `aria-label` on a non-interactive `<span>` (`ReviewView.tsx:56`) is ignored by many screen readers.
- `Crumbs` separators "›" are not `aria-hidden` and the last crumb has no `aria-current` (`components/Crumbs.tsx:14-15`). `ChapterView` crumbs do this correctly (`ChapterView.tsx:277-283`).
- Tabs without arrow-key support: `PracticeWorkspace.tsx:1104-1146, 1364-1470`. Radiogroup without arrow keys: `components/AppearancePicker.tsx:32-66`. The home `PathTabs` (`HomeView.tsx:538-567`) and mock `LobbyGuide` (`:96-111`) implement roving tabindex correctly.
- `target="_blank"` with only "↗"/"→" as a hint: `ReviewView.tsx:114`, `QuestionBank.tsx:148`.
- Emoji inside accessible text: "🔊 Listen" (`ChapterSheet.tsx:42`) and "🔥" in `WelcomeBack` (`HomeView.tsx:283`).
- Effort: S.

**A14 — Low — Focus appearance is inconsistent**
- Focus rings in use: global `3px var(--red)` (`globals.css:748-752`); `2px var(--green)` ×17; `2px var(--c-green)` ×5 (`frame.module.css:114-119`, `.head-back` at `globals.css:9486-9489`); `--ide-accent`, `--primary` and `--ink` variants.
- Several text inputs only change the border from `--line-soft` to `--ink-soft` on focus: `.search__input` (`globals.css:1986-1996`) and `.shelf-search input` (`:5382-5388`).
- Fix: define `--focus-ring` once, and give inputs a 2px ring.
- Effort: S.

**A15 — Low — Sticky headers can hide focused elements (WCAG 2.2 2.4.11)**
- Evidence: 60px sticky headers everywhere (`frame.module.css:30-41`, `book.module.css:34-45`, `home.module.css:13`, `chapter.module.css:8`, `globals.css:796-808`). There is no `scroll-padding-top` on `html`; `scroll-margin-top` is set only on headings.
- Fix: `html { scroll-padding-top: calc(var(--bar-h) + 12px); }`.
- Effort: S.

**A16 — Low — Touch targets under 24px**
- `.daily-recap__close` is about 20px (`globals.css:1173`, 12px font + 4px padding).
- `.clock-weather__format` is about 22px (`globals.css:963`).
- `.search__clear` is 26px (OK).
- Effort: S.

**A17 — Low — The clock blinks and ticks every second in the old sidebar**
- Evidence: `globals.css:930-946` blinks the colon; `ClockWeather.tsx:36` runs `setInterval` at 1s. The global reduced-motion rule stops the blink, but nothing pauses it otherwise (WCAG 2.2.2).
- Fix: drop the seconds and blink, or add a pause option.
- Effort: S.

### 2.3 Visual-system drift

**V1 — Medium — Shared token names mean different things on different pages**
- Evidence:
  - `--primary` is `--ink` in `app/theme-bridge.css:8`, but `--c-green` in `app/home.module.css:4` and `app/mock/mock.module.css:2190`, and `--c-red` in `app/interview/book.module.css:2`.
  - `--radius-lg` is 12px (`theme-bridge.css:92`) but 22px on home (`home.module.css:3`). Book uses a private `--r: 20px` (`book.module.css:5`) and mock `--r-lg: 20px` (`mock.module.css:2193`).
  - `--accent` is `--hl-mint` in theme-bridge but `--ink` in `SiteDrawer.module.css:100, 711`.
- Impact: Tailwind utilities (`bg-primary`) and shared components change colour depending on which module wraps them, and theming bugs are hard to trace.
- Fix: never redefine bridge tokens. Introduce page-scoped names (`--page-accent`) or a small `tokens.css` with `--radius-{sm,md,lg,xl}` and `--accent-{page}`.
- Effort: M.

**V2 — Medium — No type or spacing scale**
- 41 distinct `font-size` px values across the CSS (e.g. 12 ×87, 13 ×80, 14 ×76, 12.5 ×70, 13.5 ×52, 14.5 ×46, 15.5 ×23, 11.5 ×25…). There are 0 `font-size: var(--…)` usages.
- 24 declarations are **below 11px**, down to 8.5px (`whiteboard.module.css:250`) and 9–10px (`globals.css:1002, 4133, 6732, 6755, 7957, 8247, 8268, 8455, 8526`), often in handwriting fonts.
- Radii: 30 distinct values (999px ×92, 10 ×49, 8 ×39, 14 ×31, 12 ×31, 7 ×28, 9 ×27, 16 ×24, 6 ×23…). Only 17 use `var(--radius)`.
- Everything is in px, not rem, so users' browser default font size is ignored.
- Fix: define `--fs-{xs..3xl}` in rem with an 12px floor, and a 4-step radius scale. Codemod the nearest values.
- Effort: L (incremental).

**V3 — Medium — Duplicated components in CSS**
- `app/architecture/architecture.module.css` (677 lines) is a **near-verbatim copy** of `components/series/landing.module.css`; `diff` finds 18 lines of difference.
- `.iconBtn` is defined 7 times with 3 sizes: 36px in chapter, landing, architecture and problems; 38px in frame and book; 40px in home and mock.
- `.btn` is defined in `globals.css:1706`, `Modal.module.css:110`, `home.module.css:84`, `book.module.css:164`, `landing.module.css:74`, `architecture.module.css:74` and `chapter.module.css:112`, at heights 34/38/46px and radii 9/10/12px.
- `book.module.css` defines `.linkBtn` twice (`:211` and `:231`) and has both `.btnGhost` and `.ghostBtn`.
- Tooltip (`[data-tip]::after`) CSS is duplicated in 6 places: `globals.css:9029-9032`, `landing.module.css:569`, `architecture.module.css`, `chapter.module.css:949-976`, `problems.module.css` and `whiteboard.module.css:1494-1518`.
- Six different scrim colours are used for modal backdrops: `rgba(0,0,0,.28|.32|.35|.4)`, `rgba(10,14,24,.45)` and `rgba(20,20,20,.35)` (`globals.css:1212, 1695`, `SiteDrawer.module.css:10`, `Modal.module.css:21`, `chapter.module.css:903`, `problems.module.css:903`, `whiteboard.module.css:910, 1087`).
- Fix: import `landing.module.css` in `ArchitectureView` with a small override, extract `Button`/`IconButton`/`Tooltip` primitives, and add a `--scrim` token.
- Effort: M.

**V4 — Low — Hard-coded colours outside the theme definitions (few, and mostly scrims)**
- In `globals.css` after line 639 there are only 8 hits: scrims at 1212 and 1695, `rgba(196,52,43,.32)` at 2132, `rgba(0,0,0,.07)` and `rgba(255,255,255,.09)` at 2821/2830, `rgba(0,0,0,.25)` at 5821, `rgba(0,0,0,.28)` at 6485, and `rgba(31,58,115,.13)` at 8597. The last is a light-theme ink colour, so the shadow is wrong in dark and rose.
- In modules:
  - `whiteboard.module.css:84`: `rgba(255,59,59,.28)`.
  - Dead `#b7791f` fallbacks for `--dg-yellow-stroke` in 6 places (the token is always defined): `problems.module.css:3, 892`, `landing.module.css:5`, `architecture.module.css:5`, `SiteDrawer.module.css:572-573`.
- `app/global-error.tsx:22-24, 34, 40, 50-51, 60` uses inline hex with no dark variant. The Next 16 docs note global-error doesn't receive global styles, so hard-coding is acceptable, but add `@media (prefers-color-scheme: dark)`.
- TSX inline styles use no colour literals; they are layout-only (e.g. `style={{ marginTop: 18 }}` in `LevelView.tsx:92, 102, 104`, `error.tsx:38`, `WhiteboardShell.tsx:9`, `PracticeClient.tsx:47`).
- Effort: S.

**V5 — Low — Two scroll-reveal systems and two heading languages**
- Old pages animate `.chapter h3`, `pre`, `.dg`, `.say` and `.sticky` with CSS `animation-timeline: view()` (`globals.css:3651-3690`). New pages use `data-fx` (`globals.css:9402-9460` plus `lib/scrollFx.ts`).
- `PageFrame` strips the site's signature highlighter underline from h1–h3 with `content: none !important` (`frame.module.css:8-15`), while old pages keep it (`globals.css:683-702`).
- The site uses 17 different breakpoints (360, 420, 480, 560, 620, 640, 720, 760, 860, 900, 980, 1000, 1080, 1100, 1180, 1240, 1440) and has no breakpoint tokens.
- Fix: decide the house style for headings, then pick 4 breakpoints (480/720/900/1080).
- Effort: M.

### 2.4 Responsive

**R1 — Medium — The chapter loading state drops the whole shell**
- Evidence:
  - All 18 `app/<topic>/[chapter]/loading.tsx` render `<ChapterSkeleton/>` alone.
  - There is no topic `layout.tsx` (`find app -name layout.tsx` finds only root, level, mock, progress and review).
  - Chapter links disable prefetch (`components/reader/ChapterNav.tsx:61`, `Shell.tsx:51`).
- Impact: on every sidebar chapter click, the sidebar and header vanish and a bare skeleton shows full-width, then the shell re-appears. The loading state also has no `<main>` or skip link. The skeleton's inline 240/300px widths (`ChapterSkeleton.tsx:11, 16`) risk overflow at 320px.
- Fix: add `app/<topic>/layout.tsx` (or a route group) that renders `ReaderShell`, so `loading.tsx` swaps only the sheet. Alternatively, re-enable prefetch for adjacent chapters.
- Effort: M.

**R2 — Low-Medium — The `PageFrame` header can clip on small phones**
- Evidence: `frame.module.css:30-41` is a single-row flex with no wrap and `height: 60px`. Only `brandName` and `sep` hide at ≤640px (`:121-126`). `.title` plus two pill links (`:83-100`) stay, and `.page { overflow-x: clip }` (`:1-5`) silently clips overflow instead of scrolling.
- Impact: at 360px the sum is roughly 36 back + 38 menu + 38 mark + ~80 title + ~150 links + gaps, which is about 380px, so "Progress" can be clipped out of reach. Unverified at runtime.
- Fix: hide `.title` below 480px (it duplicates the active link), or let `.links` scroll with `overflow-x:auto`.
- Effort: S.

**R3 — Low — `100vh` drawers on iOS**
- Evidence: `.site-sidenav { height: 100vh }` in the mobile drawer (`globals.css:3558-3565`). The display settings at the bottom can hide under Safari's toolbar. `mock.module.css` already uses `100dvh`.
- Fix: use `100dvh`.
- Effort: S.

**R4 — Low — Grids with 290px minimums**
- Evidence: `progress.module.css:426` (`minmax(290px,1fr)`) leaves 2px spare at 320px with 14px gutters.
- Fix: use `minmax(min(100%, 290px), 1fr)` (the pattern `mock.module.css:1883` already uses).
- Effort: S.

What's already good here: most module grids collapse at 640/720/900px, mock uses `min(100%, …)`, Problems and ChapterView convert side rails to bottom sheets, and the Shell drawer caps at `min(84vw,300px)`.

### 2.5 UX flows

**U1 — High — "Coming soon" topics never show the coming-soon page, and land on a level picker for content that doesn't exist**
- Evidence:
  - Home links topics with `written === 0` to `/soon?topic=…` (`app/page.tsx:12-15`). So do `navHref` (`lib/topicNav.tsx:59-60`) and the SiteDrawer "Coming soon" list (`SiteDrawer.tsx:215, 232-241`).
  - `SoonClient` then **redirects any topic with `status === "ready"` to `/level/<id>`** (`app/soon/SoonClient.tsx:39-41`). All 14 outline topics are `status: "ready"` in `content/topics.ts`.
  - `/level/css` then asks "How much CSS do you already have? step 1 of 2" and shows per-level chapter counts that include unwritten chapters (`lib/content.ts:104-106`, `app/level/LevelView.tsx:58-80`).
  - `/soon`'s "not written yet" hero is effectively unreachable. It also renders `null` until mounted (`SoonClient.tsx:43`), so users see a blank flash, then a redirect.
- Impact: two thirds of the shelf misleads users. They click "Coming soon", go through a level quiz and a path, and find only "coming soon" tags.
- Fix: derive readiness from written chapters, not `status`. Either set `status: "planned"` until a chapter ships, or change `SoonClient` and `/level/[topic]` to redirect on `written === 0`. Then fix `/soon` copy (see U7).
- Effort: S.

**U2 — Medium — Unwritten chapters look like written ones in the reader**
- Evidence:
  - `ChapterNav` (`components/reader/ChapterNav.tsx:51-69`) lists every chapter with no `ready` indicator.
  - `ChapterSheet` prev/next (`ChapterSheet.tsx:64-94`) and the `[`/`]` shortcuts (`ReaderShell.tsx:174-181`) walk into "not written yet" sheets.
  - The unwritten sheet shows an empty "This section will cover:" list when no syllabus section matches (`ChapterSheet.tsx:26-27, 53-58`).
- By contrast, `CoverMap` marks `is-soon` and `PathClient` tags "coming soon".
- Fix: add a "soon" style and "(not written yet)" text in `ChapterNav`. Skip unwritten chapters in prev/next, or label them ("next written: …"). Hide the empty plan list.
- Effort: S.

**U3 — Medium — Wrong breadcrumb on non-JS problems**
- Evidence: `components/practice/PracticeWorkspace.tsx:1176-1183` hard-codes `{ label: "JavaScript", href: "/notes" }` for every problem. `content/practice/` includes 9 DSA files and 2 React files. `ChapterLink` carries no topic (`app/practice/PracticeClient.tsx:8-13`, `lib/practiceLinks.ts:9-11`).
- Impact: a DSA problem says "All topics › JavaScript › Two pointers" and links to the JS notes.
- Fix: add `topicName` and `topicHref` to `ChapterLink` in `practiceChapterLinks()`.
- Effort: S.

**U4 — Medium — Error pages: wrong recovery API, wrong shell, one label for every boundary**
- Evidence:
  - `app/error.tsx:9, 30` and `app/global-error.tsx:6, 45` call `reset()`. The Next 16.3 docs (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md:117-157`) make `retry()` stable and say to prefer it, because `reset` doesn't re-fetch.
  - "Reload the app" in global-error does not reload.
  - Errors are reported as `boundary: "reader"` and logged as "Reader crashed" for every route (`error.tsx:11-12`).
  - Because `error.tsx` sits at the root, a crash in `/mock` or `/review` shows the old Shell with its sidebar.
  - global-error has no `<title>` (the docs suggest React `<title>`) and no dark-scheme styling.
  - `not-found.tsx:24-26` offers "Open the DSA notes" as the only alternative, which is arbitrary.
- Fix: switch to `retry`, use `window.location.reload()` in global-error, and derive the boundary label from `usePathname()`. Render errors inside a minimal `SiteHeader` (N1). Replace the DSA CTA with search (the drawer's jump box) or "Problems" and "Interview book".
- Effort: S–M.

**U5 — Medium — Progress persistence: silent failure, no backup, and a global reset hidden on a topic page**
- Evidence:
  - `store.set` returns `false` on quota or private-mode failure (`lib/storage.ts:26-33`), but no caller checks it (grep finds none).
  - There is no export or import of progress anywhere.
  - The only reset is "Reset my progress" on `/path`, which calls `progress.reset()` through `window.confirm` (`app/path/PathClient.tsx:149-160`). It wipes **every** topic's ticks and solves from a per-topic page.
  - Marking read (`ChapterDone.tsx:15-18`) gives no confirmation beyond the checkbox, and doesn't say the chapter will come back in Review.
- Impact: users can lose weeks of streaks and review schedules by clearing site data, and there is no warning when saving fails.
- Fix:
  - Add "Download / restore progress (JSON)" and a clearly scoped reset on `/progress`.
  - Show a one-time toast if `store.set` fails.
  - After "mark as read", add a line such as "Comes back for review in 1 day".
- Effort: M.

**U6 — Low-Medium — Blank first paint on several client-only routes**
- Evidence: these render `null` until mounted: `/path` (`PathClient.tsx:36-38, 78`), `/soon` (`SoonClient.tsx:14-16, 43`), `/practice` (`PracticeClient.tsx:30-32`), `/level` redirect (`app/level/page.tsx:15, 20`) and the old Shell theme pickers (`ThemeFontPicker.tsx`). The whiteboard shows a plain "Setting up the board…" line.
- Fix: render the shell with a skeleton; `/path` can render server-side, since only the tick state needs the client.
- Effort: M.

**U7 — Low — `/soon` copy is stale and JS-centric**
- Evidence: `SoonClient.tsx:96-101` says "JavaScript is the one topic with a full syllabus… 23 sections. A few are already written". The CTA is always "See the JavaScript path" (`:86-88`), whatever the topic.
- Fix: generate the copy from `siteStats()` and suggest the nearest written topic (for example, Next.js → React).
- Effort: S.

**U8 — Low — Dead pass-through layouts**
- Evidence: `app/mock/layout.tsx`, `app/progress/layout.tsx` and `app/review/layout.tsx` return `children` only.
- Fix: delete them, or use them for per-section metadata.
- Effort: S.

---

## 3. Playwright / axe coverage

What's covered: `e2e/a11y.spec.ts:4-25` runs 20 URLs (`/`, `/notes`, one JS chapter, `/interview`, 2 rounds, `/level/js`, `/path` JS beginner, `/practice?id=free`, `/problems`, one problem, `/review`, `/mock`, `/whiteboard`, `/progress`, `/git`, 2 git chapters, `/architecture`, 1 architecture chapter). It also runs one scripted mock round covering brief, question, follow-up, rubric and debrief (`:44-86`). Tags are `wcag2a/aa` and `wcag21a/aa`, with reduced motion.

What's missed:
- **Routes:**
  - `/interview/questions`, including the drill (A3).
  - `/soon`, 404 and the error boundary.
  - The other 17 topic covers and chapters, including `/react`, `/dsa` and `/system-design`, whose chapters carry custom widgets (step-through demos, `c3d`, `viz-tree`, diagrams).
  - `/level/<non-js>` and `/path` for other topics or levels.
- **States:**
  - `SiteDrawer` open.
  - The old Shell mobile drawer open and closed; closed would catch A1 if run at ≤900px.
  - The ChapterView "Chapters" sheet and the Problems "Filters" sheet.
  - The review session, `/progress` with seeded data (badges, heatmap), mock lobby history, and the wizard.
  - Reader search mode.
- **Themes:** only the default light theme (A9).
- **Viewports:** desktop only. There is no mobile project in `playwright.config`.
- **Disabled rule:** `scrollable-region-focusable` is off globally (A11).
- Not detectable by axe in any case: A3 (key hijack), A4 (skip target), A8 (focus loss) and A5 (single-key shortcuts). These need keyboard e2e tests.

Suggested additions:
- A `projects` matrix of desktop plus Pixel-7 viewports × `light`/`dark`/`kraft`.
- Open-state checks that click "Menu" and then run axe.
- Keyboard tests: "Tab from skip link lands in main", "Tab never leaves the open drawer", and "Enter on Stop exits the drill".

---

## 4. What's already good

- **Skip links on every surface**, with sensible targets (except A4). There is a global `:focus-visible` ring (`globals.css:748-752`) and a `.visually-hidden` utility.
- **Reduced motion is respected throughout.** There is a global kill-switch for animations and transitions (`globals.css:3711-3722`). `useScrollFx` and Lenis both bail out when `prefers-reduced-motion` is set (`lib/scrollFx.ts:11, 49`; Lenis also defaults `respectReducedMotion`), and `data-fx` styles only apply under `[data-fx-root="on"]`, so content is never left hidden. `ReaderShell` and `ChapterView` pick `behavior: "auto"` for scroll-to-top.
- **Theme discipline is strong.** Outside the 9 theme blocks there are only about 15 colour literals, mostly scrims. The contrast unit test enforces editor tokens in all themes.
- **Good ARIA in the newer surfaces:**
  - Mock: `role="timer"`, `role="log"` chats, focus moved to the wizard step heading (`LoopWizard.tsx:221`), `aria-pressed` rubric marks, roving-tabindex tabs (`LobbyGuide.tsx:96-111`).
  - Home `PathTabs` implement the tabs pattern fully.
  - The interview book uses `aria-pressed` on filters and confidence buttons.
  - Problems uses `role="status"` for result counts and visually hidden "(solved)".
  - Native `<dialog>` for confirm and name modals (`components/Modal.tsx`).
- **SVG hygiene is strong**: every decorative SVG found is `aria-hidden` or inherits it, and meaningful graphics use `role="img"` with labels (Readiness gauge, Lobby sparkline, verdict stamp).
- **SiteDrawer** handles Escape (without eating Escape from nested listboxes or search), restores focus on close, and uses `inert` on collapsed folds. It's a good base once a focus trap is added.
- **Empty states exist** and are written in a friendly voice: Review ("Finish a chapter and it starts coming back here…"), the Progress interview section, the drawer search ("Nothing matches…") and reader search suggestions.
- **Legacy URL handling**: `HashRedirect` and `/level?topic=` keep old links working.
