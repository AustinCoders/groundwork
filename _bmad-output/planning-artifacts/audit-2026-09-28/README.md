# Groundwork audit, 28 Sep 2026

Whole-site audit on `feature/app-audit` (at `d766972`, Next 16.3.6, React 19.3). Five read-only passes, each with its own report in this folder:

| Area | Report | Findings |
| --- | --- | --- |
| Performance and optimization | [performance.md](performance.md) | 10 (P1–P10), measured on a production build |
| UX consistency and accessibility | [ux-a11y.md](ux-a11y.md) | 41 (N, A, V, R, U series) |
| Code quality, tests, security, dependencies | [code-quality.md](code-quality.md) | 17 |
| SEO, content, roadmap status | [seo-content-roadmap.md](seo-content-roadmap.md) | 14 SEO (S1–S14), 11 content (C1–C11), t01–t44 checked |
| Topic pages: inventory, screenshots, redesign brief | [topics.md](topics.md) | 7 bugs (B1–B7), stories TP-0 to TP-9 |

Screenshots and measurement scripts stayed in the session scratchpad and are not committed.

## Scorecard

| Area | Grade | One line |
| --- | --- | --- |
| Build health | A | Typecheck, lint and 173 unit tests pass; 0 production vulnerabilities; every page static. |
| Desktop performance | A | Lighthouse 97–100, LCP under 0.65 s everywhere, CLS ≤ 0.035. |
| Mobile performance | C+ | Lighthouse 72–89; the Playground and `/path` paint nothing until JS loads (FCP 4.0 s and 3.1 s). |
| Accessibility | C | Reduced motion is handled well, but there are three keyboard/focus blockers and the axe suite covers only the light theme on desktop. |
| Visual consistency | C− | Eight header patterns, three back-button styles, seven page shells; topic pages still use the old notebook frame. |
| Code structure | B− | Clean types, but the site chrome is copied into 8 files, `globals.css` is 9.5k lines with ~1,200 dead, and two components are ~1,580 lines each. |
| SEO | B− | Metadata, canonicals and noindex are right; ~770 of 781 sitemap pages have no share image, 538 problem pages are thin, no JSON-LD. |
| Content accuracy | C | The interview book still names an earlier employer, home town and relocation month; three different question counts; stale "coming soon" copy. |
| Security | B | No injection path found, but the CSP allows `'unsafe-eval'` and all of jsDelivr, runtimes load without integrity checks, and error reporting is off in production. |
| Tests and CI | B− | Good unit and e2e base; no tests for `lib/storage.ts`, e2e skips 17 of 20 topic readers, Chromium only, CI skips the comments check. |

## Is the app fully optimized?

No. The foundations are right: static rendering, lazy heavy tools in workers, immutable caching, near-zero layout shift, and 9 of 12 measured pages are "good" on a throttled phone. What keeps it from "fully optimized", in order of gain:

1. **P1** The Playground and `/path` render nothing on the server (`<Suspense fallback={null}>` around `useSearchParams`). Mobile LCP 4.1 s and 3.1 s; server-rendering them should bring both near 1.2–1.3 s. `/path` also ships 365 KB of HTML with every topic's chapters.
2. **P2** The mock room imports all 538 exercises (1.7 MB, 389 KB gz) to show one (`app/mock/Room.tsx:558`).
3. **P3** Every page blocks on 180–354 KB of CSS, 82–95% unused; Turbopack merges unrelated module CSS into the homepage.
4. **P4** Radix Select ships on every page for two closed pickers: 37 KB gz, 91% unused.
5. **P6** Scroll effects cost 3.8 s of main-thread time per homepage scroll at 4× CPU, against 0.43 s with reduced motion.
6. **P7** Fonts are about 147 KB per page; one "₹" glyph pulls an extra 53 KB subset.
7. **P5** The TypeScript check runs on the main thread (about 1 s on a phone for the first run).
8. **P8** Prefetch and payload waste: 200 KB gz of editor prefetched on `/problems`, 14 KB of topic blurbs in every page, Shell bundled twice.

## Fix first (ranked across all areas)

| # | Sev | Finding | Where | Effort |
| --- | --- | --- | --- | --- |
| 1 | High | Interview book still identifies the author: an earlier employer, home town and relocation month (t01 regressed) | `content/interview-data.ts:54,66-70,176-178` | 1–2 h |
| 2 | High | Closed off-canvas sidebar stays focusable at ≤900px | `components/Shell.tsx:209`, `globals.css:3558-3574` | 2 h |
| 3 | High | Modal menus and sheets don't trap focus | `SiteDrawer.tsx:504-531`, `ChapterView.tsx:497-514`, `ProblemsView.tsx:627` | 0.5 day |
| 4 | High | Enter and Space captured page-wide in the flashcard drill and mock room | `QuestionBank.tsx:54-67`, `Room.tsx:737-757` | 2 h |
| 5 | High | `/soon` never renders; 14 outline topics land on a level picker for content that doesn't exist | `app/soon/SoonClient.tsx:39-41` | 2 h |
| 6 | High | Playground and `/path` blank until hydration (P1) | `app/practice`, `app/path` | 1 day |
| 7 | High | ~770 of 781 sitemap pages have no `og:image` | `lib/metadata.ts:23-36` | 2–3 h |
| 8 | High | Seven page shells; header and drawer copied into 8 files | `components/Shell.tsx`, `PageFrame.tsx`, `BookShell.tsx`, … | 4–8 days, staged |
| 9 | Medium | Unknown chapter slugs return HTTP 200 | `app/*/[chapter]/page.tsx` | 1 h |
| 10 | Medium | `/path` sidebar lists 540 chapters from every topic | `app/path/page.tsx` | 1 h |
| 11 | Medium | Privacy copy says "nothing about you leaves your machine"; analytics and weather geolocation do | `app/HomeView.tsx:770,960` | 2 h |
| 12 | Medium | Three interview-question counts (420+ on home, 209 in the bank, 245 in data) | `tests/claims.test.ts`, home, bank | 2 h |
| 13 | Medium | Error reporting off in production: no Sentry DSN, no CSP origin | `next.config.ts:12`, Vercel env | 1 h |
| 14 | Medium | CSP allows `'unsafe-eval'` and all of jsDelivr; runtimes load without SRI | `next.config.ts:12`, `lib/pyodideWorker.ts:165` | 1–2 days |
| 15 | Medium | Axe suite runs light theme and desktop only; kraft grey 3.96:1, forest button 4.43:1, mock stamp 2.7:1 | `e2e/a11y.spec.ts` | 1 day |
| 16 | Medium | Every problem breadcrumb says JavaScript | `PracticeWorkspace.tsx:1176-1183` | 1 h |
| 17 | Medium | CI skips `npm run comments`; workflows have no `permissions:` | `.github/workflows/ci.yml` | 1 h |

## Topic pages

All 18 generic topic routes (`/notes`, `/react`, `/dsa`, `/system-design` and 14 outline topics) render through the old `Shell` sidebar and notebook sheet. The chapter list starts below the fold, text runs ~110 characters a line at 1440px and ~35 on a phone, chapters have no contents or section links, and outline topics show "0 / 0 chapters read". The redesign brief and ten stories (TP-0 to TP-9) are in [topics.md](topics.md), sections 3.1–3.6, and are planned as epic 1 of the BMad initiative.

## What is already good

- Every page prerendered; only 4 API routes are dynamic.
- Reduced motion is honoured by CSS, `useScrollFx` and Lenis.
- Theme discipline: about 15 colour literals outside the nine theme blocks.
- No `any` in code; 4 justified `@ts-expect-error`.
- Newer surfaces (mock, home tabs, drawer) use correct ARIA patterns and native `<dialog>`.
- Heavy tools load lazily and mostly in workers; static assets cached a year, immutable.
