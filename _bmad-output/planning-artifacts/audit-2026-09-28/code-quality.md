# Groundwork audit: code quality, architecture, tests, security and dependencies

Audited on 2026-09-28 at `feature/app-audit` (d766972). This was a read-only audit: nothing in the repo was changed. Typecheck wrote its build info to the scratchpad. The build output in `.next` was only read, after the background build had finished. I ran knip through the npx cache.

## Check results

| Check | Result |
| --- | --- |
| `tsc --noEmit` (the same as `npm run typecheck`, with build info redirected to the scratchpad) | **Pass**, 0 errors, 7.8 s, about 880 MB RSS |
| `eslint` (`npm run lint`) | **Pass**, 0 problems, 11.6 s, about 1.65 GB RSS (heavy but fine) |
| `vitest run` (`npm test`) | **Pass**: 16 files, 173 tests, 5.1 s |
| `npm audit --omit=dev` | **0 vulnerabilities** |
| `npm audit` | 1 high, dev-only: `js-yaml` 4.3.1 via `eslint` → `@eslint/eslintrc` (GHSA-2883-xcg3-v3hh, CPU DoS). `npm audit fix` resolves it |
| knip (unused files, exports and deps) | 3 unused files (2 are false positives), 4 unused deps (1 is a false positive), 59 unused exports, 57 unused exported types |

## Severity summary

| # | Sev | Title | Effort |
| --- | --- | --- | --- |
| 1 | High | Seven page-chrome implementations; the header and drawer are copied into 8 files | 4–8 days, staged |
| 2 | Medium | `globals.css` is a 9.5k-line monolith with about 1,200 dead lines, and it is the most-changed file | 1–2 days |
| 3 | Medium | God components: `Board`, `PracticeWorkspace`, `CodeEditor`, `HomeView` | 2–4 days |
| 4 | Medium | The CSP gives little XSS protection: `'unsafe-eval'` on every page and all of jsDelivr allowed in `script-src` | 1–2 days |
| 5 | Medium | Runtimes run from jsDelivr with no integrity check; e2e depends on the CDN | 1–2 days |
| 6 | Medium | Error reporting is effectively off in production | Hours |
| 7 | Medium | CI does not run `npm run comments`, and workflows are not hardened | 1 hour |
| 8 | Medium | Unit-test gaps in core logic; no coverage report; e2e misses 17 topic readers and runs on Chromium only | 2–3 days |
| 9 | Low | Dead code, dead dependencies and a leftover Tailwind/shadcn toolchain | Half a day |
| 10 | Low | localStorage: three key schemes, modules that bypass `store`, no schema version, no backup | 1 day |
| 11 | Low | API hardening: per-instance rate limiter, TTS proxy abuse, no narration fallback | Hours |
| 12 | Low | Share-link decompression has no output cap | 1 hour |
| 13 | Low | 60 boilerplate route files, one set per topic | Half a day to 1 day |
| 14 | Low | Type-safety leaks: about 228 `as` casts, 12 `as unknown as`, about 65 `!`, `exhaustive-deps` disables with no reason given | Hours to 1 day |
| 15 | Low | The error boundary and 404 render the heavy legacy Shell | Hours |
| 16 | Low | Dependency hygiene: stale `@types/node`, a TS 6 bridge is available, pinned runtimes Dependabot cannot see | Hours |
| 17 | Low | Tooling scope and doc drift: `.claude/worktrees` is not excluded; AGENTS.md says "no backend" | Minutes |

---

## 1. Architecture and duplication

### Which routes use which shell

| Route(s) | Page chrome | Header, menu and drawer |
| --- | --- | --- |
| 18 topic readers: `/notes`, `/css`, `/html`, `/react`, `/nextjs`, `/node`, `/nestjs`, `/typescript`, `/dsa`, `/graphql`, `/databases`, `/redis`, `/docker`, `/kubernetes`, `/cloud-devops`, `/system-design`, `/security`, `/testing` (cover and `[chapter]`) | `components/reader/topicPages.tsx` → `ReaderShell` → legacy **`Shell`** | Its own sidebar drawer (`Shell.tsx:108-163`), its own hard-coded nav list (`Shell.tsx:248-323`) and `ThemeFontPicker` |
| `/level`, `/level/[topic]`, `/path`, `/soon`, `error.tsx`, `not-found.tsx` | legacy **`Shell`** (`LevelView`, `PathClient`, `SoonClient`) | as above |
| `/review`, `/progress` | **`PageFrame`** (`components/frame/PageFrame.tsx`) | `SiteDrawer` and `useScrollFx` |
| `/interview`, `/interview/[chapter]`, `/interview/questions` | **`BookShell`** (`app/interview/BookShell.tsx`), a near-copy of PageFrame | `SiteDrawer` and `useScrollFx` |
| `/git`, `/git/[section]`, `/architecture/[chapter]` | **series** `SeriesLanding` and `ChapterView` | `SiteDrawer`, its own scroll-progress handler and its own key handler |
| `/architecture` | `ArchitectureView`, its own header (CSS identical to `landing.module.css`) | `SiteDrawer` |
| `/problems` | `ProblemsView`, its own header | `SiteDrawer` |
| `/practice`, `/problems/[slug]` | `PracticeWorkspace`, its own header (two menu buttons, lines 836 and 893) | `SiteDrawer` |
| `/mock` | `MockApp`, its own header | `SiteDrawer` and `useScrollFx` |
| `/` | `HomeView`, its own header and 3 separate scroll listeners (`HomeView.tsx:454,659,730`) | `SiteDrawer` and `useScrollFx` |
| `/whiteboard` | `BareShell` with `header={false}` plus `BoardMenu` | `AppearancePicker` |

### Finding 1 (High): two generations of site chrome, with the newer one copied by hand into 8 files

**Evidence**
- The **legacy generation** is `components/Shell.tsx` (460 lines) plus `components/reader/ReaderShell.tsx` (449 lines). It serves 23 routes and has its own drawer state, focus trap, resize and Escape handling, sidebar collapse and nav list.
- The **new generation** has the same header block written out in 8 places: skip link, `BackButton`, a menu button with `aria-haspopup="dialog"`, `TopIcon name="menu"`, the brand mark, a title, `<SiteDrawer open onClose>`, plus `menuOpen` state and `closeMenu`. Measured spans from the skip link to `</header>`:
  - `components/frame/PageFrame.tsx:42-79` (38 lines), `app/interview/BookShell.tsx:31-78` (48), `app/mock/MockApp.tsx:163-201` (39), `components/series/ChapterView.tsx:248-321` (74), `components/series/SeriesLanding.tsx:56-83` (28), `app/architecture/ArchitectureView.tsx:152-176` (25), `app/problems/ProblemsView.tsx:370-425` (56), `app/HomeView.tsx:792-827` (36). That is about **345 lines of TSX**.
  - Header CSS (`.top`, `.iconBtn`, `.brand`, `.brandName`, `.scrollBar`, `.title`, `.links`…) is repeated across 8 CSS modules, about **694 lines** in all: frame 90, book 117, mock 64, chapter 119, landing 80, architecture 80, problems 80, home 64. Some copies are byte-identical: `.iconBtn` in `frame.module.css` and `book.module.css`, and `.top` and `.iconBtn` in `landing.module.css` and `architecture.module.css`. Others have drifted slightly: `.top` gap is 10px vs 12px, and `.iconBtn` is 38px vs 40px.
- `BookShell` is PageFrame with a fixed link list and a linked title. It could be deleted outright.
- **The two nav lists have already diverged.** `Shell.tsx:248-323` and `SiteDrawer.tsx:19-27` use different Progress icons (🔥 vs ▤). The Architecture and Interview links appear in only one of them.
- **There are two theme pickers:** `components/ThemeFontPicker.tsx`, used by Shell and AppHeader, and `components/AppearancePicker.tsx`, used by SiteDrawer and BoardMenu.
- **There are two chapter readers:** `reader/ReaderShell` with `ChapterSheet` (18 topics) and `series/ChapterView` (git and architecture). Each has its own scroll-progress loop (`ReaderShell.tsx:137-162`, `ChapterView.tsx:131-163`), its own `[`/`]`/`n`/`p`/`t` key handler (`ReaderShell.tsx:183-202`, `ChapterView.tsx:165-177`), its own copy of `prefersMotion` (`ReaderShell.tsx:16`, `ChapterView.tsx:67`, while `lib/dom.ts:1` exists) and its own wiring of the enhancements.

**Why it matters.** Any change to nav, header, drawer or accessibility has to be made in 9 or more places. The drift shows this is already costing consistency. `Shell.tsx` had 20 commits in 6 months, and the header CSS makes up much of the churn in the modules.

**Fix, staged**
1. Grow `PageFrame` into a single `SiteFrame` that covers every case. Give it these props: `title`, `titleHref`, `links`, `backFallback` (href or label), an `actions` slot (for ChapterView's prev/next and SeriesLanding's CTA), an optional `progress` slot and `scrollFx: boolean`. Pull out a `useSiteMenu()` hook for open/close plus Lenis stop/start. Keep a single `frame.module.css` header. Then delete `BookShell` and move `MockApp`, `SeriesLanding`, `ArchitectureView`, `ProblemsView` and the practice header onto it. HomeView becomes a `variant="landing"`. **1–2 days.**
2. Make the series `ChapterView` general enough to read the 18 topics (its parts come from `levelsNav(topicId)`), keep ReaderShell's search as a rail component, then delete `Shell`, `ReaderShell` and the legacy sidebar CSS in `globals.css`. **3–5 days.**
3. Move `/level`, `/path`, `/soon`, error and 404 onto `SiteFrame`. **About 1 day.**
4. Put the shared helpers in `lib/dom.ts`: `prefersMotion`, `isTypingTarget` (3 copies), `copyText` (`reader/enhancements.ts:27` and `PracticeWorkspace.tsx:128`), and a `useChapterKeys()` hook.

### Finding 13 (Low): 60 boilerplate route files

**Evidence.** Each of the 20 topics has three files that differ only in `const TOPIC = "…"`: `app/<topic>/page.tsx`, `app/<topic>/[chapter]/page.tsx` and `app/<topic>/search-index.json/route.ts`. See for example `app/css/page.tsx`, `app/css/[chapter]/page.tsx` and `app/css/search-index.json/route.ts`.

**Why it matters.** Adding or renaming a topic means creating three files and registering the topic. Forgetting one only shows up at runtime.

**Fix.** Use `app/(topics)/[topic]/…` with `generateStaticParams()` over the ready topics and `dynamicParams = false`. Static segments such as `/mock` still win. The custom OG images for `dsa`, `interview` and `architecture` can stay as overrides. If the per-folder layout is preferred, add a test that every topic with notes has all three files. **Half a day to 1 day.**

### Finding 15 (Low): the error boundary and 404 render the full legacy Shell

**Evidence.** `app/error.tsx:15` and `app/not-found.tsx:6` wrap their content in `Shell`. Shell mounts `DailyRecap`, `ClockWeather` (geolocation and `/api/weather`), `StreakMini` and `TopicOfDay`.

**Why it matters.** If one of those widgets throws, the error page throws too and escalates to `global-error`. The 404 page also ships the heaviest chrome.

**Fix.** Give error and 404 pages a minimal static frame. **Hours.**

---

## 2. Large files and hotspots

### Biggest non-content source files

| Lines | File | Changes in the last 6 months |
| --- | --- | --- |
| 9,497 | `app/globals.css` | **56** (top) |
| 3,306 | `app/mock/mock.module.css` | 11 |
| 2,457 | `app/home.module.css` | 11 |
| 1,852 | `app/whiteboard/Board.tsx` | – |
| 1,735 | `components/practice/PracticeWorkspace.tsx` | **35** |
| 1,618 | `app/interview/book.module.css` | – |
| 1,572 | `app/whiteboard/whiteboard.module.css` | 8 |
| 1,217 | `app/HomeView.tsx` | **23** |
| 1,167 | `app/problems/problems.module.css` | – |
| 1,116 | `components/series/chapter.module.css` | – |
| 1,112 | `components/practice/CodeEditor.tsx` | **20** |
| 893 | `e2e/smoke.spec.ts` | – |
| 812 | `components/SiteDrawer.module.css` | – |
| 788 | `app/mock/Room.tsx` | – |
| 733 | `app/mock/guide.module.css` | – |
| 716 | `app/progress/progress.module.css` | – |
| 695 | `lib/whiteboard/model.ts` | – |
| 686 | `components/series/landing.module.css` | – |
| 679 | `app/problems/ProblemsView.tsx` | – |
| 677 | `app/architecture/architecture.module.css` | – |

The code outside `content/` comes to 338 files: about 35.8k lines of TS/TSX/MJS and about 25.6k lines of CSS. `content/` holds the largest files overall: `interview-data.ts` at 4,734 lines and `topics.ts` at 4,394. Those are data and are fine.

### Finding 3 (Medium): god components

**Evidence** (hook counts are approximate)
- `app/whiteboard/Board.tsx`: `Board()` runs from line 219 to 1803, about **1,585 lines in one component**, with about 24 `useState`, 25 `useRef`, about 15 effects and 18 `useMemo`/`useCallback`.
- `components/practice/PracticeWorkspace.tsx`: `PracticeWorkspace()` runs from line 166 to 1735, about **1,570 lines**, with about 26 `useState` and 30+ inner functions (file ops, share, preview, run, debug, tests, templates). It is the second most-changed file.
- `components/practice/CodeEditor.tsx`: 1,112 lines with about 22 `useState`.
- `app/HomeView.tsx`: 1,217 lines holding 10 components and 3 scroll listeners.

**Why it matters.** These are the highest-churn code files. Their state is tightly coupled and cannot be unit-tested without a browser, so every change needs e2e runs.

**Fix**
- For the workspace: extract a `useProject()` reducer (files, tabs, closed stack, persistence), `useRunner()` (run, tests, debug, history) and `usePreview()`. Split the JSX into `WorkspaceHeader`, `BriefPanel`, `OutputPanel` and `PreviewPanel`.
- For Board: move the pointer and tool state machine into `lib/whiteboard/` as a pure reducer so the existing model tests can cover it. Split out `useCamera` and `useSelection`.
- For HomeView: one file per section and one shared scroll observer.
- **2–4 days**, done incrementally, with e2e as the safety net.

### Finding 2 (Medium): `globals.css` monolith with about 1,200 dead lines

**Evidence**
- `app/globals.css` has 9,497 lines, 42 `@media` blocks and 18 theme blocks, and no section markers (the no-comment rule applies to CSS too).
- A script check found that **148 rules (about 1,200 lines, about 12%)** have a selector whose class appears nowhere in `app`, `components`, `lib` or `content`. Dynamic prefixes such as `is-*`, `cm-*`, `line--*`, `viz__*` and `t-*` were excluded. Clusters with zero references outside `globals.css`:
  - progress page: `progress-hero*` (8 selectors), `level-ring*` (7), `stat-card*` (10), `badge-card*` (8), `badge-grid`, `level-up-banner`
  - old home page: `featured*` (20), `topic-row*` (13), `topics-compact`, `hero__doodle*` (5), `shelf-search*` (4), `howto-strip*` (9)
  - progress widget: `joke-card*` (3)
  - problems page, since moved to a CSS module: `prob-group*` and `prob__*`
  - `readout*` (6) and `ruler*` (4)

  These are leftovers from redesigns whose styles moved into CSS modules.
- CSS modules are much cleaner: 23 unreferenced classes in total, the main cluster being `landing.module.css`'s `lane`/`node*` group (13 classes).
- There are 34 `!important` and 23 distinct `z-index` values across the CSS.

**Why it matters.** This is the most-changed file in the repo (56 commits in 6 months). Dead rules make every edit riskier, and the CSS ships on every page.

**Fix**
1. Delete the dead clusters. To confirm, run a Playwright CSS-coverage pass over all routes, or PurgeCSS in report mode.
2. Split the file into `@import`ed files named by concern, so the names do the job of comments: `tokens.css`, `themes.css`, `base.css`, `shell-legacy.css` (deleted after finding 1), `reader.css`, `editor.css`, `print.css`.
3. **1–2 days.**

### Debug code, TODOs and leftovers

- `lib/debug/*` is **not** leftover debug code. It is the playground's step-through debugger:
  - `instrument.ts` rewrites user code with the TypeScript compiler API.
  - `view.ts` shapes the trace.
  - It is used by `lib/editor/toolsWorker.ts:4`, `lib/jsWorker.ts:2` and `components/practice/DebugPanel.tsx`, and is covered by `tests/debug-trace.test.ts` (6 tests).
  - Its only dead parts are the exported constants `TRACE_FN`, `ENTER_FN` and `EXIT_FN` (lines 3-5), which are exported but only used internally.
- There are no `console.log` calls outside the playground templates and the intentional `console.error` in the error paths, no `debugger`, no TODO/FIXME/HACK markers, and no `.skip` or `.only` in tests.

### Finding 9 (Low): dead code, dead dependencies and a leftover Tailwind/shadcn toolchain

**Unused files and components**
- `components/CountUp.tsx` has no importers.
- `components/AppHeader.tsx`: `AppHeader` is only reachable through `BareShell`, and the only `BareShell` caller passes `header={false}` (`app/whiteboard/WhiteboardShell.tsx:17`). So `AppHeader`, most of `AppHeader.module.css` (104 lines) and the `compact` mode of `ThemeFontPicker` are dead.
- Knip's other two "unused files", `lib/reactSandbox/*`, are a false positive: they are built by `scripts/build-react-sandbox.mjs`.

**No-op layouts.** `app/mock/layout.tsx`, `app/progress/layout.tsx` and `app/review/layout.tsx` only `return children`.

**Unused exports (knip found 59).** Examples:
- `lib/topics.ts:64` `topicHref` (duplicates `navHref`)
- `lib/content.ts:61-72`: re-exports of `level`, `topicHref` and `plural`
- `lib/dom.ts:5` `debounce`
- `lib/mock/session.ts:50,270` `newQuestion` and `elapsedSeconds`
- `lib/mock/adaptive.ts:4-14`
- `lib/whiteboard/geometry.ts:64` `wrapText`
- `lib/whiteboard/model.ts:83,299`
- `lib/wasmAssets.ts:10-14` version constants
- `lib/interviewContent.ts:83`
- `app/mock/LoopWizard.tsx:55` `LoopMap`
- `components/practice/DebugPanel.tsx:71`, `components/practice/FileDialogs.tsx:16`
- the 5 shadcn `Select*` exports in `components/ui/select.tsx:121` (only `Dropdown` is imported)

**Misplaced module.** `lib/mockSession.ts` is a 4-line file that holds only `formatClock`. It belongs in `lib/format.ts`.

**Unused dependencies.** `@codemirror/lang-json`, `@codemirror/lang-markdown` and `class-variance-authority` have no imports anywhere. `pyodide` is used only by `copy-wasm-assets.mjs --all` and by the version test, so it is kept on purpose but could be a devDependency.

**Leftover Tailwind/shadcn toolchain**
- `app/globals.css:1-2` imports Tailwind's theme and utilities.
- `app/theme-bridge.css` (104 lines) maps tokens onto shadcn variables.
- `components.json` is present.
- Yet **no Tailwind utility class appears in any `className` string**.
- `cn()` in `lib/utils.ts` runs `tailwind-merge` over BEM class names (`dd__btn`), where it has no effect.
- **Fix:** replace `cn` with `clsx`, and remove `tailwind-merge`, `class-variance-authority`, `tailwindcss`, `@tailwindcss/postcss`, `postcss.config.mjs` and `components.json`. Check the 27 `var(--color-*)` references before deleting `theme-bridge.css`.

**Also.** `BackButton` and `TopIcon` are used site-wide but live in `components/practice/`.

**Fix and effort.** Delete the above, and add knip to CI with a config that lists `lib/reactSandbox/runtime.ts` as an entry and ignores `pyodide`. **Half a day.**

---

## 3. Type safety

| Metric (app, components, lib, tests, e2e; content excluded) | Count |
| --- | --- |
| `any` (annotation, cast or generic) | **0** |
| `@ts-expect-error` / `@ts-ignore` / `@ts-nocheck` | 4 / 0 / 0, all in `lib/jsWorker.ts:69,75,213,235` and all justified (globals used by generated code) |
| `eslint-disable` | 9: `react-hooks/exhaustive-deps` ×5 (`app/path/PathClient.tsx:70,79`, `components/practice/CodeEditor.tsx:575,618`, `components/practice/PracticeWorkspace.tsx:380`), `react-hooks/refs` ×2 (`CodeEditor.tsx:519,521`), `prefer-const` ×2 (`lib/runner.ts:99`, `lib/pythonRunner.ts:33`) |
| `as` type assertions (excluding `as const`) | about 228; 44 `as const` |
| `as unknown as` | 12 |
| Non-null assertions `x!` | about 65 |
| `strict` | on |

### Finding 14 (Low): the worst spots

- `app/mock/Room.tsx:559`: `ex as unknown as PracticeExercise`. The content `Exercise` type and the workspace `PracticeExercise` type have drifted apart. Unify them, or map explicitly.
- `app/review/ReviewView.tsx:104,164,259,281,283`: `r.due!` five times. Split the row type into a due and a not-due variant so the compiler can narrow it.
- `components/practice/PracticeWorkspace.tsx:322,442,453,464,470,482`: `projectRef.current!` six times. The `useProject` reducer from finding 3 would remove these.
- `app/whiteboard/Board.tsx:415,677,767,843,844,892,973,1435`: `svgRef.current!` and `el.points!`. Use a `points`-bearing element type guard.
- `lib/storage.ts:17-24`: `store.get<T>` returns unvalidated `JSON.parse` output as `T`. This is an implicit cast on every stored value; see finding 10.
- Four of the five `exhaustive-deps` disables give no `-- reason`, unlike the other disables. That hides stale-closure risk. Require a description on every eslint directive.
- Consider `noUncheckedIndexedAccess` for `lib/` first.

**Effort:** hours to 1 day.

**In good shape:** no `any`, strict mode, and the only `@ts-expect-error` directives are documented.

---

## 4. Tests and CI

### What exists

- **Vitest** (`vitest.config.mts`): node environment, `tests/**/*.test.ts`, 16 files, 173 tests. Coverage:
  - content integrity: `content.test.ts` (15 tests), `claims.test.ts` and `search-index.test.ts`
  - SEO and sitemap (15)
  - contrast of editor colours in every theme
  - the comments script
  - the debugger tracer
  - error-tracking config
  - the mock-interview engine, sessions, readiness and guide (71 in all)
  - polyglot grading (15)
  - whiteboard model (17)
  - wasm asset versions
- **Playwright** (`playwright.config.ts`, Chromium only, port 3100, production build):
  - `smoke.spec.ts`: 16 page smokes plus about 40 flows (playground, debugger, Lua and Python, share links, mock loop, problems filters, architecture, git anchors, interview book, review)
  - `a11y.spec.ts`: axe on 20 paths plus the mock room
  - `whiteboard.spec.ts`: 7 flows
- **CI** (`.github/workflows/ci.yml`): `npm ci --ignore-scripts` → `next typegen` → typecheck → lint → format → spell → vitest → build → Playwright → Lighthouse budgets. Dependabot runs weekly for npm (grouped) and monthly for Actions.

### Finding 7 (Medium): CI does not run `npm run comments`, and the workflows are not hardened

**Evidence**
- `ci.yml:23-44` runs every part of `npm run check` except `comments` (`package.json` `check` script). Only `.husky/pre-push` enforces it. That hook is skipped by `--no-verify`, by GitHub web edits and by Dependabot branches.
- Neither workflow has a `permissions:` block (`ci.yml`, `vercel-cleanup.yml`), and the cleanup job holds `VERCEL_CLEANUP_TOKEN`.
- Actions are pinned by tag, including the third-party `treosh/lighthouse-ci-action@v12`.
- There is no `concurrency:` block to cancel superseded runs.

**Fix**
- Add a `- run: npm run comments` step. Or make CI run `npm run check` followed by build and e2e, so the two lists cannot drift.
- Add `permissions: { contents: read }`.
- Pin third-party actions to commit SHAs.
- Add `concurrency: { group: ci-${{ github.ref }}, cancel-in-progress: true }`.
- **About 1 hour.**

### Finding 8 (Medium): gaps in unit, component and e2e coverage

**Unit tests.** 58 of 87 `lib/` modules have no direct unit test. The notable gaps are:
- `lib/storage.ts`: progress and the spaced-review schedule (`dueAt`, `dueForReview`, `REVIEW_GAPS_DAYS`). This is the core user data and it has no tests.
- `lib/gamification.ts`: XP, streaks and badges shown on /progress.
- `lib/webPreview.ts`: `buildPage` inlining and `</script>` escaping.
- `lib/shareLink.ts` and `lib/compress.ts`: round trip, caps and malformed input.
- `lib/rateLimit.ts` and **all four API routes** (`app/api/tts`, `weather`, `joke`, `client-error`). Nothing tests their input validation.
- `lib/format.ts` `escapeHtml`, `lib/interviewBook.ts`, `lib/navTrail.ts`, `lib/whiteboard/geometry.ts` and `lib/whiteboard/exporter.ts`.

**Component tests.** There are none: vitest runs in `node`, with no jsdom or Testing Library.

**Coverage.** No coverage report or thresholds are configured.

**E2E gaps**
- 17 of the 20 topic readers get no smoke test. `/notes`, `/git` and `/architecture` are covered, and a few `/react` and `/dsa` chapters appear only in the demos test.
- `/soon`, the 404 and error pages, OG images and `/api/*` are not covered.
- Everything runs on Chromium only, yet the app uses the CSS Highlight API (`components/reader/narration.ts:125`), `CompressionStream` and module workers.
- The Lua and Python tests download runtimes from jsDelivr, with 60 s and 90 s timeouts (`e2e/smoke.spec.ts:563,577`). That makes them flaky and slow.

**Fix**
- Pure-function tests for storage (with a localStorage stub), gamification, webPreview, shareLink and compress, and the API route handlers (called with `new Request(...)`).
- Add `@vitest/coverage-v8` with a threshold on `lib/`.
- Parametrise the smoke test over every topic cover plus its first chapter. They share one template, so this is cheap.
- Add a small WebKit project.
- Self-host the runtimes in CI: `copy-wasm-assets --all` with `NEXT_PUBLIC_PYODIDE_BASE=/wasm/pyodide/`.
- **2–3 days.**

**In good shape:** all checks green; content-claims tests keep the docs honest; a11y runs with axe in CI; Lighthouse budgets; retries are limited to 1 in CI.

---

## 5. Security

### Headers (`next.config.ts:10-31`; live production headers checked with `curl -I`)

- **Set:**
  - CSP includes `default-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'` and `frame-ancestors 'none'`.
  - Other headers: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy` (camera and microphone off, geolocation self).
- **HSTS** is not set in config. Vercel adds `strict-transport-security: max-age=63072000` in production, without `includeSubDomains` or `preload`. To make it explicit, set it in `securityHeaders`.
- **Not set:** `Cross-Origin-Opener-Policy`. Low value here.

### Finding 4 (Medium): the CSP gives little XSS protection

**Evidence**
- `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://cdn.jsdelivr.net` applies to every page (`next.config.ts:12`, confirmed live).
- `https://cdn.jsdelivr.net` serves any npm or GitHub file, so allowing all of it is a well-known CSP bypass.
- `'unsafe-eval'` is needed by only three code paths:
  - the main-thread syntax check `new Function(...)` at `lib/runner.ts:90`
  - the React sandbox iframe, whose srcdoc inherits the page's policy: `lib/reactSandbox/runtime.ts:208`
  - sql.js's WebAssembly, which needs only `'wasm-unsafe-eval'`
- About 50 `dangerouslySetInnerHTML` sinks exist, for example `app/mock/Room.tsx:265-535`, `app/interview/[chapter]/RoundView.tsx`, `app/interview/questions/QuestionBank.tsx`, `components/reader/ChapterSheet.tsx:49` and `components/series/ChapterView.tsx:370`. `components/reader/enhancements.ts:77-86` (`activateScripts`) re-executes the 32 inline `<script>` demos found in 26 content files.
- **Every sink I traced renders author content from `content/*.ts`.** URL parameters are used only as lookup keys (`app/path/PathClient.tsx:49`, `app/soon/SoonClient.tsx:25`) and are never rendered as HTML. So there is **no current injection vector**, but the CSP would not contain one if one appeared.

**Realistic fix.** Nonces require dynamic rendering, per the Next docs at `node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md:181`. `'unsafe-inline'` therefore has to stay for SSG.
- Remove jsDelivr from the document's `script-src`. The runtimes load inside workers: keep jsDelivr in `connect-src` and serve a worker-scoped policy if needed.
- Move the syntax check into the worker.
- Serve the React sandbox from its own route (for example `/sandbox.html`) with its own CSP that allows `'unsafe-eval'`, instead of a srcdoc that inherits the page policy.
- Then replace the document's `'unsafe-eval'` with `'wasm-unsafe-eval'`.
- Optionally enable `experimental.sri`.
- Add a content test that fails on `on*=` attributes and on `<script` outside a known list of demos.
- **1–2 days.**

### Finding 5 (Medium): runtimes executed from jsDelivr with no integrity check

**Evidence**
- `lib/pyodideWorker.ts:165` runs `import(PYODIDE_BASE + "pyodide.mjs")`.
- `lib/scriptWorker.ts:35` dynamically imports `wasmoon@1.16.0/+esm`, `@ruby/wasm-wasi@2.10.1/…/+esm`, `php-wasm@0.1.0` and `@yowasp/clang` (defined in `lib/wasmAssets.ts:10-35`).
- `+esm` bundles are built by jsDelivr, so they are not the immutable npm bytes. Dynamic `import()` cannot carry SRI.
- The code runs in **same-origin** workers, which can call the site's APIs and use IndexedDB and Cache.
- The Lua, Ruby, PHP and Clang versions are hard-coded, with no `package.json` entry, so Dependabot never sees them. `php-wasm` is still at 0.1.0.

**Fix**
- Self-host. The script already supports `--all` for Pyodide and sql.js, so make that the default for production. Add the other runtimes as pinned devDependencies and copy their dist files the same way.
- Otherwise fetch the file, check its SHA-384 against a pinned hash, and import it from a blob URL.
- Either way, the e2e flakiness goes away too.
- **1–2 days.**

### Finding 6 (Medium): error reporting is effectively off in production

**Evidence**
- Sentry initialises only if `NEXT_PUBLIC_SENTRY_DSN` is set (`lib/errorTracking.ts:1-3`, `instrumentation-client.ts:3`, `instrumentation.ts:5`).
- The live CSP `connect-src` has no Sentry origin (`next.config.ts:17` adds it only when the DSN is set). So **the DSN is not set in production**.
- The fallback `/api/client-error` only calls `console.error` into Vercel runtime logs (`app/api/client-error/route.ts:28`), which have short retention.
- `@sentry/nextjs` stays a dependency.

**Why it matters.** Client crashes in the editor, runners and whiteboard are practically invisible.

**Fix.** Either set the DSN in Vercel and use Sentry's `tunnelRoute` (which avoids the CSP change and ad blockers), or drop `@sentry/nextjs` and send `/api/client-error` to a log drain. **Hours.**

### Finding 11 (Low): API routes

`app/api/*` exists even though AGENTS.md says "no backend".

**Evidence**
- `lib/rateLimit.ts:6` is an in-memory `Map`, so each serverless instance has its own limit.
- `app/api/tts/route.ts` proxies Microsoft Edge's unofficial Read-Aloud service through `msedge-tts`, with `maxDuration = 20`. GET responses are CDN-cacheable for a year. Anyone can use it as a free TTS proxy, which burns function time.
- `components/reader/narration.ts:102` has no `speechSynthesis` fallback if the unofficial API breaks.
- `/api/client-error` is an unauthenticated log sink (clipped and rate-limited, but spammable).

**Fix.** Add a Vercel Firewall rate-limit rule (or Upstash), check `Sec-Fetch-Site`/`Origin` on TTS and client-error, and fall back to the Web Speech API. **Hours.**

**In good shape:**
- Voice allow-list, SSML escaping, a 2,000-character cap and a pitch regex on TTS.
- Lat/lon validation and grid rounding on weather.
- A 4 KB body cap and field clipping on client-error.
- `x-forwarded-for` is set by Vercel, so it cannot be spoofed there.

### Finding 12 (Low): share-link decompression has no output cap

**Evidence.** `lib/compress.ts:23-29` inflates the whole `#share=` payload with no output limit. The limits of 20 files and 200 KB (`lib/shareLink.ts:27-37`) apply only after that. A crafted link could inflate to hundreds of MB and crash the tab.

**Good.** Shared code is never auto-run (`PracticeWorkspace.tsx:354-380`).

**Fix.** Read the stream incrementally and abort beyond about 5 MB. **1 hour.**

### Code runners (good shape)

- The web preview iframe uses `sandbox="allow-scripts allow-modals allow-forms"` with no `allow-same-origin` (`PracticeWorkspace.tsx:1591`). The React sandbox uses `sandbox="allow-scripts"` (`lib/reactRunner.ts:60`).
- Both parent listeners check `event.source` (`PracticeWorkspace.tsx:407`, `lib/reactRunner.ts:65`).
- JS, Python and scripts run in workers with timeouts and termination (`lib/runner.ts`, `pythonRunner.ts`, `scriptRunner.ts`).
- `webPreview.buildPage` escapes `</script>` and `</style>`.

### Finding 10 (Low): localStorage handling

**Evidence**
- About 35 keys under three naming schemes: `jsnotes:*`, `groundwork:*` and `groundwork-board`.
- 7 modules bypass `store`: `app/progress/ProgressView.tsx:56`, `app/mock/Lobby.tsx:68`, `lib/interviewConfidence.ts:17`, `lib/navTrail.ts`, `lib/runHistory.ts:39` and `lib/whiteboard/storage.ts:16-25` (which re-implements `store`). `lib/themeInitScript.ts` duplicates key strings.
- There is no schema version or migration path. `store.get<T>` does not validate what it reads.
- All progress lives in the browser, yet there is **no export or import**. Clearing site data loses everything.
- Heavy writes (shared files up to 4 MB, boards) can hit the quota. `store.set` returns `false` silently, and callers mostly ignore it.

**Fix.** Keep one key registry in `lib/storage.ts`, wrap values in a versioned envelope with per-key validators, add an Export/Import progress feature (JSON), and tell the user when a write fails. **About 1 day.**

### Env vars

The only `NEXT_PUBLIC_*` variables are `SENTRY_DSN` (public by design), `PYODIDE_BASE`, `SQL_JS_BASE`, `NPM_CDN`, `SITE_URL` and `VERCEL_ENV`. No secrets are exposed. `VERCEL_TOKEN`, `VERCEL_TEAM_ID` and `VERCEL_PROJECT_ID` are used only by `scripts/vercel-cleanup.mjs` in CI.

---

## 6. Dependencies

### `npm outdated`

| Package | Current | Latest | Note |
| --- | --- | --- | --- |
| typescript | 5.9.3 | 7.0.2 | **Deferred** (see below). **6.0.3 is available as a bridge** |
| eslint | 9.39.5 | 10.11.0 | **Deferred**, and the reason still holds: `eslint-plugin-react` 7.37.5 (peer `^9.7`), `eslint-plugin-jsx-a11y` 6.10.2 and `eslint-plugin-import` 2.32.0 (peer `≤9`), all bundled by `eslint-config-next` 16.3.6, have no ESLint 10 releases |
| cspell | 8.19.4 | 10.3.5 | Two majors behind |
| lint-staged | 16.4.0 | 17.6.0 | One major behind |
| @types/node | 22.20.4 | 26.6.3 | **Mismatch:** `engines` says 24.x and `.nvmrc` says 24. `.github/dependabot.yml` says it tracks `.nvmrc` but blocks majors, so it is stuck on 22. Move to `^24` |
| pyodide | 314.0.6 | 314.0.7 | Bump together with `PYODIDE_VERSION` in `lib/wasmAssets.ts:1`. The wasm-assets test enforces this |
| @uiw/react-codemirror, msedge-tts, vitest, @types/react-dom | patch or minor | – | Safe |

### Finding 16 (Low): dependency hygiene

- **The TypeScript 7 deferral is still valid**, and there is a second blocker:
  - The browser uses the JS compiler API in `lib/debug/instrument.ts`, `lib/reactSource.ts`, `lib/runner.ts:162-165` and `lib/reactRunner.ts:21-23`. `typescript` is a *runtime* dependency: its client chunk is 3.3 MB raw, 959 KB gzipped.
  - `@typescript-eslint/eslint-plugin` 8.66 has peer `typescript <6.1.0`.
  - **Recommendation:** move to **TypeScript 6.0.3** now. It is the last JS-API release, and typescript-eslint accepts it.
  - Later, alias a runtime copy (`"typescript-runtime": "npm:typescript@6.0.3"`, imported by the browser code) so the dev toolchain can move to 7 once typescript-eslint supports it.
  - **Hours.**
- Remove `@codemirror/lang-json`, `@codemirror/lang-markdown` and `class-variance-authority`, plus the Tailwind stack from finding 9.
- `postcss` is used by `postcss.config.mjs` but not listed in `package.json`. It is moot once Tailwind is removed.
- `npm audit`: fix the dev-only `js-yaml` with `npm audit fix`.

### Heavy client dependencies (good shape)

- TypeScript, `eslint-linter-browserify` (1.2 MB raw, 329 KB gzipped), Prettier, the CodeMirror language packs, vim and minimap all load via dynamic `import()`, mostly inside workers (`lib/editor/toolsWorker.ts:20-22,89`, `components/practice/CodeEditor.tsx:594-599`). Only the playground pays for them.
- `interview-data` is **not** in any client chunk: the build is tree-shaken, which I verified by grepping `.next/static/chunks`.
- **Worth a look:** `app/mock/Room.tsx:558` dynamically imports the whole `content/practice` module (1.6 MB raw, 379 KB gzipped) just to look up a few exercises. Use per-exercise JSON, or pass the needed exercises as server props.

### Finding 17 (Low): tooling scope and doc drift

- `tsconfig.json` includes `**/*.ts` and excludes only `node_modules` and `public`. `eslint.config.mjs` does not ignore gitignored paths. So whenever a worktree exists under `.claude/worktrees/`, typecheck and lint scan a full duplicate of the repo. Add it to `exclude` and `globalIgnores`.
- AGENTS.md says "no backend", but there are 4 serverless routes (`app/api/*`) and 22 static `search-index.json` routes. Update the description so agents know about them.
- `app/global-error.tsx` uses hard-coded hex colours. That is acceptable, because the global error page renders without `globals.css`, but it is worth listing as a known exception to the token rule. A few module stragglers also use hex: `problems.module.css` (2), `SiteDrawer.module.css` (2), `architecture.module.css` (1), `landing.module.css` (1).

---

## Already in good shape

- Strict TypeScript with no `any`. Typecheck, lint and 173 unit tests all pass, and they are fast.
- A thorough CI pipeline: types, lint, format, spelling, unit tests, build, e2e, axe and Lighthouse budgets. Dependabot groups related updates.
- A security header baseline; sandboxed iframes without same-origin; message-source checks; worker isolation with timeouts; validated and capped API inputs.
- Heavy editor tooling is lazy and runs in workers. Content is statically generated, and 18 topics share one template.
- The mock-interview engine, polyglot grader, whiteboard model and debugger tracer have solid unit tests.
- No debug leftovers, TODOs or skipped tests. Suppressions are rare and mostly justified.
