---
id: SPEC-groundwork-overhaul
companions:
  - capability-map.md
  - ../../planning-artifacts/audit-2026-09-28/README.md
  - ../../planning-artifacts/audit-2026-09-28/topics.md
  - ../../planning-artifacts/audit-2026-09-28/performance.md
  - ../../planning-artifacts/audit-2026-09-28/ux-a11y.md
  - ../../planning-artifacts/audit-2026-09-28/code-quality.md
  - ../../planning-artifacts/audit-2026-09-28/seo-content-roadmap.md
  - ../../../AGENTS.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Groundwork overhaul after the 28 Sep 2026 audit

## Why

A pain to solve. The 28 Sep audit found that readers meet two generations of the site. The pages redesigned in September (home, mock, interview book, review, progress) share a modern frame. The 18 topic routes that hold the actual notes still use the old notebook sidebar: the chapter list starts below the fold, lines run about 110 characters, sections can't be linked, and unwritten topics show empty counters or a level picker for content that doesn't exist.

Around that sit:
- a privacy regression in the interview book;
- three keyboard traps;
- mobile Lighthouse scores of 72–89, with two pages blank until JavaScript loads;
- counts that disagree;
- seven page shells copied by hand.

Readers are affected most on phones and with keyboards. The author is affected because every new page repeats the drift.

## Capabilities

- **CAP-1**
  - **intent:** No page identifies the author's employer history, home town or relocation, and the privacy copy says exactly what leaves the browser.
  - **success:** A grep of `content/` for the earlier employer, home town and relocation month finds nothing. The FAQ names analytics and the weather lookup and links a privacy page.
- **CAP-2**
  - **intent:** Keyboard and screen-reader users can reach and operate every surface.
  - **success:**
    - Closed off-canvas panels are inert.
    - Every modal menu or sheet holds and restores focus.
    - No page-wide key handler swallows Enter or Space on a focused control.
    - Every skip link lands on an element.
    - axe passes on every audited route in all nine themes, at 1440 and 390 wide.
- **CAP-3**
  - **intent:** A reader moves through any topic (cover, chapter, level, path) inside the same frame as the redesigned pages: labelled back pill, site menu, topic title and scroll effects.
  - **success:**
    - Every topic route renders `header a.head-back`.
    - Chapter paragraphs are at most 760px wide at 1440.
    - Every chapter `h3` has an id listed in an on-page contents.
    - The cover groups chapters by level as cards, with a Continue action to the first unread chapter.
- **CAP-4**
  - **intent:** A topic with nothing written shows a roadmap of what is coming and what to read meanwhile, never a level picker or empty counters.
  - **success:**
    - `/soon?topic=typescript` and `/typescript` show the outline roadmap, rendered on the server.
    - No page shows "0 / 0" or invented minutes.
    - Unknown chapter slugs return HTTP 404.
- **CAP-5**
  - **intent:** Every page paints real content from server HTML and stays light on a mid-range phone.
  - **success:**
    - Lighthouse mobile is at least 90 on `/`, `/notes`, a chapter, `/problems/<id>`, `/practice` and `/path`.
    - The server HTML of `/practice` and `/path` contains their headings.
    - The mock room downloads one exercise, not the full set.
- **CAP-6**
  - **intent:** Every count the site states matches the content.
  - **success:**
    - One interview-question count is used everywhere and asserted by `tests/claims.test.ts`.
    - No stale section, language or chapter counts remain in `/soon`, taglines, `/practice`, the README or `docs/ROADMAP.md`.
- **CAP-7**
  - **intent:** Every indexable page shares with an image and names its own topic, and the sitemap lists exactly the pages worth indexing.
  - **success:**
    - Every sitemap URL emits `og:image`.
    - Problem breadcrumbs name their topic.
    - The sitemap includes `/mock` and `/interview/questions` and drops `/practice`.
- **CAP-8**
  - **intent:** Every page shares one frame and one token and type scale, and global CSS carries no dead rules.
  - **success:**
    - One header component renders on every route.
    - `components/Shell.tsx` and `components/reader/ReaderShell.tsx` are gone.
    - `globals.css` has no rule for a class nothing renders.
    - `--primary` means one colour everywhere.
- **CAP-9**
  - **intent:** Production errors reach the tracker, and third-party code runs only when pinned.
  - **success:**
    - A thrown client error appears in Sentry.
    - `script-src` drops `'unsafe-eval'` on pages without a code runner.
    - Every CDN runtime loads with a pinned version and an integrity hash.
- **CAP-10**
  - **intent:** The logic that holds a reader's progress is tested, and the suites run where readers are.
  - **success:**
    - Unit tests cover `lib/storage.ts` progress and review scheduling.
    - e2e visits every written topic's reader and runs a mobile project.
    - CI runs `npm run comments`.

## Constraints

- No backend: progress stays in localStorage. Nothing here adds a server store, accounts or email.
- Pages stay prerendered, and only the four API routes are dynamic. A page that needs the query string renders a server shell from static params, not from request-time `searchParams`.
- No comments in source. `npm run comments` and the pre-push hook fail them.
- Theme tokens only. All nine themes and `tests/contrast.test.ts` must pass.
- The features listed in `topics.md` §3.5 must not regress.
- Scroll effects honour `prefers-reduced-motion` and go on frame-level blocks only, never on chapter body elements.
- Read `node_modules/next/dist/docs` before changing route config such as `dynamicParams` or `searchParams`.
- Each story is built on its own `feature/<name>` branch from `main`. Before merge, run `npm run check`, `npm run build` and `npm run test:e2e` (port 3100). Never touch port 3000, and merge only on the user's word.
- Counts written in `content/architecture/` are asserted by `tests/claims.test.ts`. A story that changes a count, or the reader, updates the How this is built chapters that describe it.

## Non-goals

- Writing the unwritten topics or new tracks (roadmap t27–t40, t83–t85).
- Accounts, a newsletter, notify-me, a paid tier, or any backend (t12, t43, t44).
- TypeScript 7 and ESLint 10 upgrades (t21, blocked upstream).
- Redesigning the home, mock, interview book, review or progress pages. They only move onto the shared frame (CAP-8).
- Low-severity audit findings that no capability names stay on the roadmap as later work:
  - ux-a11y.md A5–A8, A10, A12–A17, U4 and U5;
  - code-quality.md findings 11, 12, 16 and 17;
  - SEO findings S2, S5, S6 and S9 (roadmap t86 and t87).

## Success signal

- On a 390px phone, a reader opens `/notes`, taps Continue, reaches the Closures chapter and jumps to one of its sections from the contents. This takes three taps or fewer, with the labelled back pill in view.
- Mobile Lighthouse is at least 90 on the CAP-5 pages, and axe passes in all nine themes.
- The roadmap's Audit fixes, Redesign every topic page and Fast on phones phases all read done.

## Assumptions

- Outline topics get their landing on their own cover URL (`/typescript`), and `/soon?topic=` redirects there (`topics.md` §3.3e).
- `/path` moves to static segments or a server shell per topic, so its HTML is not empty and the route does not become dynamic.

## Open Questions

- When Shell is deleted, do the old sidebar widgets (daily recap popup, clock and weather, streak, today's pick) stay, move or go? (CAP-8)
- Which interview-question count is the true one: questions in the bank (209), all question objects (245), or bank plus drills (420+)? (CAP-6)
- Should the GraphQL, Redis and Kubernetes outlines keep 22, 21 and 24 chapters, or use the 6, 12 and 8 in `docs/ROADMAP.md`? (CAP-4)
- The Sentry DSN and sitemap submission need the user's Vercel, Sentry, Search Console and Bing accounts. (CAP-7, CAP-9)
