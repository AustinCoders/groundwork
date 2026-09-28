# Groundwork audit: SEO, content and the roadmap (2026-09-28)

Scope: read-only audit of `/Users/akshat/Desktop/groundwork` at `feature/app-audit` (HEAD `d766972`).
No repo files were changed. Nothing was built or served for this audit.

Where the evidence comes from:

- Source files, cited as `file:line`.
- `git log`. There are 83 commits since the roadmap was last ticked (`82070b9`, 2026-09-24), and 99 since 2026-09-24 inclusive.
- The existing production build in `.next/`. `BUILD_ID R2vJGS5Tp_3eN83ee1B7I` was built 2026-09-28 10:36, after HEAD, and has 1,177 prerendered HTML files. I read its prerendered HTML to see exactly what crawlers get.
- Content counts from small scripts in this scratchpad folder (`stats.ts`, `iv.ts`, `sm.ts`, `desc.ts`, `links.ts`, `zero.ts`, `vis.py`). Each was bundled with the repo's own esbuild and run with Node 24. They import `lib/content`, `lib/topicStats`, `lib/interviewContent`, `lib/interviewBook` and `app/sitemap` directly, so the numbers are the ones the site computes.

---

## 0. Measured numbers (today)

| Topic | Written / planned | Exercises | Read time | Notes |
| --- | --- | --- | --- | --- |
| JavaScript (`/notes`) | 41 / 41 | 99 | 468 min | only `interview-bank` and `cheat` have no exercises |
| React | 57 / 57 | 162 (63 function + 99 component) | 353 min | every chapter now has exercises (ROADMAP.md still says 9 have none) |
| DSA in JS | 34 / 34 | 277 | 360 min | no cheat page |
| System Design | 24 / 24 | **0** | 406 min | no cheat page, no exercises |
| How this is built | 26 / 26 | — | 193 min | off the shelf |
| Git | 18 sections (standalone) | **0** | 232 min | each section has its own page since `83aecbf` |
| Interview book | 27 rounds | — | 423 min | 245 question objects / 209 in the bank / "420" counted with bullet items |
| TypeScript, Next.js, Node, Nest, HTML, CSS, SQL & DB, Testing, Security, Docker, Cloud & DevOps, GraphQL, Redis, Kubernetes | 0 / 29, 0 / 29, 0 / 41, 0 / 26, 0 / 22, 0 / 25, 0 / 25, 0 / 24, 0 / 24, 0 / 22, 0 / 24, 0 / 22, 0 / 21, 0 / 24 | 0 | 0 | 358 outlines. All `status: "ready"` in `content/topics.ts` but routed to `/soon` |

Site totals from `siteStats()`:

- 227 written chapters, including Git, plus 358 outlines.
- 538 exercises (439 function, 99 component).
- 19 topics on the shelf.
- 781 sitemap URLs: 1 home, 539 under `/problems` (the hub plus 538 problem pages), 42 notes, 58 react, 35 dsa, 25 system-design, 27 architecture, 28 interview, 19 git, 5 level, plus `/practice` and `/whiteboard`.

Interview rounds, as question objects per round:

- scout 11, r1 13, r1oa 7, r1th 8, r1tp 7
- r2 7, r3 22, r3ts 9, r4 16, r4fe 7
- r5 15, r6 9, r7 10, r8 10, r9 9
- r10 6, r11 7, r11lp 9, r12 10, r12lv 7, r13 7
- ₹50L track: s0 4, s1 8, s2 11, s3 8, s4 6
- plan 2

---

## Part A: the roadmap checked against the code

The roadmap data is the JSON in `docs/roadmap.html` (`updatedAt: 2026-09-24`).

| Task | Roadmap says | Actual status | Evidence | Suggested new status and notes |
| --- | --- | --- | --- | --- |
| t01 Remove personal details from the Interview book | done | **Partly done: regressed** | `content/interview-data.ts:54` still names an earlier employer ("Jest appears under **[an earlier employer]**, five years ago"). `:66-70` "Attack 8 — **[home city]** to [new city] … change `[home city], India · Open to relocation` to `[new city], India (relocated Sept 2026)`". `:176-178` "I have already moved. I am in [new city] now". The cover credits "Akshat" (`lib/interviewContent.ts:90`) | **Reopen.** Genericise the scouting report and R10 (see C1) |
| t02 Derive every count from content/ and test it | done | Done, with one new mismatch | `tests/claims.test.ts:20-91`. But the question count is defined three ways (C2) | Keep done. Add a follow-up for C2 |
| t03 Fix stale copy and labels | done | Done, but new stale copy has appeared since | `app/soon/SoonClient.tsx:98-100` ("23 sections … a few written"), `content/topics.ts:506` ("40 sections deep"), `app/practice/page.tsx:7` (4 languages), `README.md:16` | Add a new task "Stale copy, round 2" and extend `claims.test.ts` |
| t04 Noindex unwritten chapters and drop them from the sitemap | done | Done | `tests/seo.test.ts:15-43,71-83,115-123`. `node.html` prerenders with `noindex` | Done |
| t05 Per-page metadata with generateMetadata | done | Done, but **most pages have no share image** | Every route has a title, description and canonical. Only `/`, `/notes`, `/react`, `/dsa`, `/system-design`, `/git`, `/interview`, `/problems` and `/architecture` emit `og:image`. See S1 | Keep done. Add S1 as a new task |
| t06 Server-render the Git guide | done | Done | `git.html` has 3,868 characters of server text and each section about 12k. There are now 18 sections, not 16 | Done. Update the note: 16 → 18 sections, one page each |
| t07 Give every problem its own static page | done | Done, but the pages are thin | 538 pages prerendered. The sitemap has 781 URLs, not 754. Each page has about 600–1,000 characters of server text (S2) | Done. Add S2 |
| t08 Redirect vercel.app and get indexed | done | Partly done | The redirect is in `next.config.ts` (`redirects()`, `LEGACY_HOSTS` in `lib/site.ts:3`). There is no Search Console or Bing verification meta, so I can't confirm the sitemap was submitted (DNS verification is possible) | Split out "Submit sitemap to GSC and Bing" as an open item |
| t09 Take WebAssembly out of every deploy | done | Done | `public/wasm` is 1.4 MB and gitignored | Done |
| t10 Add a real error tracker | done | Done, but inert without a DSN | `instrumentation*.ts`, `lib/errorTracking.ts` | Done |
| t11 Trim the search index | done | Done | `tests/search-index.test.ts` | Done |
| t12 "Notify me" on coming-soon topics, plus a newsletter | todo | **Not started** | No notify, newsletter or email capture anywhere (`grep` over app, components and lib). The FAQ says "Nothing to sign up for" (`app/HomeView.tsx:958`) | todo. Needs a backend or a third-party form, and a privacy note |
| t13 Report-a-mistake link on every chapter | todo | **Not started** | No `issues/new` or `github.com` link in app, components or lib | todo (2 h) |
| t14 Author, last-updated and "verified against" on chapters | todo | **Not started** | Author and updated appear on covers only (`components/reader/CoverSheet.tsx:52-53`). Nothing in `ChapterSheet.tsx` or `series/ChapterView.tsx`. The Git guide mentions "2.53" only inside the body (`content/git/config.ts:561`) | todo |
| t15 Article and BreadcrumbList structured data | todo | **Not started** | No `ld+json` in any source file, and 0 in all 1,177 built pages | todo (S4) |
| t16 Progress export and import | todo | **Not started** | Nothing in `lib/storage.ts` or `app/progress/ProgressView.tsx` | todo |
| t17 Footer and About page | todo | **Partly done** | The home page footer has Learn, Practice and You columns (`app/HomeView.tsx:1169-1211`, from the home redesign). It exists only on `/`. There is no About or author page, no licence note on the site, no privacy page and no GitHub link. `LICENSE` exists in the repo | in progress. Still missing: About, privacy (needed for C6), licence and GitHub link, and a footer on reader pages |
| t18 CTC to in-hand calculator | todo | **Not started** | Nothing found | todo |
| t19 Reword the "handwritten" claim | todo | **Not started** | `lib/site.ts:15`, `app/manifest.ts:6`, `app/opengraph-image.tsx:6,12`, `components/Shell.tsx:236`, `app/HomeView.tsx:1184` ("Written by hand"), `README.md:3` | todo (1 h) |
| t20 Consistent sidebar and a topic-neutral logo | todo | **Partly done** | Sidebar: "Mock interview" is now always in the Shell rail (`components/Shell.tsx:288`), and `SiteDrawer` (`components/SiteDrawer.tsx:24`) is shared by home, problems, playground, mock, interview, Git and architecture. Logo: still "JS" in 9 headers (`components/Shell.tsx:191,232`, `AppHeader.tsx:22`, `SiteDrawer.tsx:535`, `frame/PageFrame.tsx:64`, `app/HomeView.tsx:812,1179`, `app/mock/MockApp.tsx:185`, `app/interview/BookShell.tsx:58`), in `app/icon.tsx:34`, `app/apple-icon.tsx:34` and in `app/opengraph-image.tsx:10` | in progress. Only the logo work is left |
| t21 Test the TypeScript 7 bump | todo | **Deferred (blocked)** | Still `typescript ^5.9.3` (`package.json:72`). TS 7 has no JS compiler API, and two places need it: `lib/debug/instrument.ts:1-9` (`ts.createSourceFile`) and the in-browser type checker (`lib/editor/toolsWorker.ts:142-156`). `.github/dependabot.yml` groups `typescript` into `dev-tooling` without ignoring majors, so the PR will keep coming back | Mark "won't do for now". Add a Dependabot `ignore` for `typescript` semver-major, with the reason |
| t22 Add React's exercises to the Problems hub | todo | **Done** | `app/problems/page.tsx:47-64` groups every levelled topic, and `ProblemsView.tsx:167-174` filters by topic. The built `problems.html` contains all 162 React ids (99 `ex-comp-*`, 63 `ex-react-*`). This code has been the same since `bc3ab28` apart from metadata, so the audit's claim looks wrong even at the time | Mark done |
| t23 New exercise formats | todo | **Partly done (inside the mock only)** | The mock has design prompts marked against a 5-point rubric with a design whiteboard (`306f97f`, `app/mock/LobbyGuide.tsx:306`, `lib/mock/scoring.ts`). Its machine-coding stage uses component exercises (`lib/mock/loops.ts:70-77`). But `Exercise.kind` is still `"function" \| "component"` (`content/types.ts:103`). System Design has 0 exercises, and there is no "read and fix a multi-file project" format | in progress. Re-scope to SD rubric exercises on `/problems`, code comprehension, and machine coding with a spec and a reference |
| t24 Fill the thin DSA sections | todo | **Premise wrong. Re-scope** | Today: String algorithms 5, Graph problems 5, Union-Find 5, MST **2**. The same counts were there at `3dda58c`, so the audit's "1/1/2/2" was wrong. Still thin: MST 2, Complexity 3, Basic recursion 4, Tries 4, Advanced backtracking 4 | Re-scope to "MST +3, Tries +2, Recursion +2" (about 0.5 day) |
| t25 Git practice | todo | **Not started** | 0 Git exercises. `lib/topicStats.ts:22-27` hard-codes `exercises: 0`. The Git guide now has 18 sections, not 16 | todo. Update "16" to "18" |
| t26 A schema for chapter bodies | todo | **Not started** | No zod or valibot dependency. Checks are the ad-hoc ones in `tests/content.test.ts:11-121` | todo |
| t27 TypeScript | todo | Not started | 0 / 29 written (`content/typescript-notes.ts`) | todo (P0 in ROADMAP.md) |
| t28 Next.js | todo | Not started | 0 / 29 | todo (P0) |
| t29 Node.js | todo | Not started | 0 / 41 | todo (P0). ROADMAP.md folds GraphQL into it |
| t30 Nest.js | todo | Not started | 0 / 26 | todo |
| t31 HTML | todo | Not started | 0 / 22 | todo |
| t32 CSS | todo | Not started | 0 / 25 | todo |
| t33 SQL & Databases | todo | Not started | 0 / 25 | todo |
| t34 Testing | todo | Not started | 0 / 24 | todo |
| t35 Web Security | todo | Not started | 0 / 24 | todo. ROADMAP.md says restructure on OWASP 2025 |
| t36 Docker | todo | Not started | 0 / 22 | todo |
| t37 Cloud & DevOps | todo | Not started | 0 / 24 | todo |
| t38 GraphQL | todo | Not started | 0 / 22 | ROADMAP.md says about 6 chapters, folded into Node. The roadmap and the outline still say 22 |
| t39 Redis | todo | Not started | 0 / 21 | ROADMAP.md says about 12. The outline still says 21 |
| t40 Kubernetes | todo | Not started | 0 / 24 | ROADMAP.md says about 8. The outline still says 24 |
| t41 Offline reading | todo | Not started | There is a manifest (`app/manifest.ts`) but no service worker | todo |
| t42 Product analytics | todo | Not started | Only Vercel Analytics and Speed Insights pageviews (`app/layout.tsx:58-59`). No `track()` events | todo |
| t43 Accounts and progress sync | todo | Not started | No auth or database dependency | todo |
| t44 Interview book as a paid product | todo | Not started, and **it conflicts with the site's copy** | The home FAQ says "There is no paid tier hiding the good parts" (`app/HomeView.tsx:765-767`) | Decide one way or the other. If it stays, the FAQ becomes false when it ships |

### Shipped since 2026-09-24 that the roadmap doesn't mention

There are 83 commits after `82070b9`, touching about 56k inserted lines across content, app, components and lib.

1. **Mock interview became a full loop simulator, then was redesigned:**
   - The engine: `8b98e26`, `705bb10`.
   - Pacing and a copyable debrief: `cd90d48`.
   - The loop wizard: `e94aa3f`, `a19f1a0`, `c3a2d97`, `45fcf24`.
   - Company-style loops: `57b2f44`.
   - Lobby JavaScript cut from 628 to 237 KB: `529e460`.
   - An interviewer who adapts, and a design whiteboard: `306f97f`.
   - A readiness dashboard: `76765a2`.
   - The redesign, with its own full-width shell, lobby, coached room and debrief: `6da6102`.
   - Scroll reveals, a decoded lobby, the rubric and verdict rules: `5942f23`.
2. **Playground and editor overhaul:**
   - Every problem in 15 languages, graded in the browser: `5a63133`.
   - VS Code tooling: `6306625`.
   - Its own layout: `8c88a21`.
   - Live runs with inline values: `6c3d4f9`.
   - Files in tabs: `7e23318`.
   - CodePen-style web preview: `21cc21b`.
   - Share as a link: `f2c8da6`.
   - Run history: `a73d09e`.
   - Standard input and timing: `b3cd229`.
   - JavaScript step debugger: `a310889`. Python stepping: `8ede204`.
   - Ruby, PHP and Lua: `fe03106`. C and C++: `049bc9e`.
   - Translate with Claude, added then removed: `419eadf` → `01515b5`.
   - Phone layout, modals, and Description, Tests and Hints tabs: `03678c7`, `f7bbd90`, `98ee881`, `037d81e`, `ca6e8b7`, `365b87d`.
3. **Whiteboard:** `9e45d2b`, `a836183`, `1afc6eb`, `64a45f1`.
4. **Problems hub redesign** (filters, progress, compact list): `2674607`, `d6b12d7`, `90d8e1b`.
5. **How this is built:** 26 chapters, a landing page and its own reading page: `fdabc7c`, `87f88dd`, `7dbc30a`.
6. **Git guide:** 18 deep chapters, one page each, with a landing page and diagrams (`83aecbf`), checked against Git 2.53 (`60dae9f`).
7. **Site menu and drawer redesign:** `c9fdf0e`, `159d9cb`, `bde0161`, `6e189c8`, `1a2e14e`, `5cb7898`, `c826eb3`. Also chapter-rail folds (`c2f18dd`) and a colour palette per theme (`74d044a`).
8. **Homepage redesign** into a landing page: `375a270`, `cb87dc1`, `db9a260`, `0fff60f`, `411e520`, `df30458`, `576026e`, `b92951f`, `6cc1f79`. **Lenis smooth scrolling and the scroll-fx engine** (`1d3e1a2`), later shared across pages (`b94df8f`).
9. **Interview book:** 15 new questions, follow-ups, traps and Node LTS facts (`8d0b770`). Also its own landing page with a loop map and a question of the day, round pages with practice mode and confidence marks, and a searchable question bank with flashcard drills at `/interview/questions` (`f4b1f3f`).
10. **Review and Progress redesigned twice:** `d35f11b`, `43c7090`.
11. **Back buttons** in every header: `3c96dab`, `b4a4a6f`.
12. **Infra and workflow:**
    - The no-comments check plus a pre-push hook: `9e253f9`.
    - Node 24 everywhere: `7bc252e`.
    - Lighthouse run three times in CI: `a5347cf`.
    - An install-script allowlist: `a267b6a`.
    - Next 16.3.6, React 19.3, CodeMirror, esbuild 0.28, Prettier and Vitest updates: `246d6b2`.
    - The **BMad Method** workflow (`.claude/skills`, `_bmad`): `a5ca1c2`, plus `AGENTS.md` and `CLAUDE.md` (`d766972`).

### The two roadmap docs have drifted apart

- `docs/ROADMAP.md` still gives the old numbers:
  - "194 chapters written" (now 227).
  - Git 16 (now 18).
  - How this is built 18 (now 26).
  - "230 questions" (245 objects, 209 in the bank, "420" on the site).
  - "`/git` emits 42 characters, `/review` 38, `/progress` 23" (now 3,868, 521 and 1,388).
  - "9 of 57 React chapters open into no exercise" (now 0).
- `docs/roadmap.html` notes are stale too: t06 says "All 16 sections" and t25 says "16 sections".
- ROADMAP.md has P0 and P1 items with no task in roadmap.html:
  - **AI engineering for JS developers** (about 16 chapters, P0).
  - **System Design frontend and GenAI tracks** (about 12).
  - **Three interview rounds**: AI-assisted coding, code comprehension, frontend system design.
  - Cheat pages for DSA and SD.
  - Per-chapter recall cards.
- ROADMAP.md resizes GraphQL to about 6, Kubernetes to about 8 and Redis to about 12. t38–t40 and the outlines in `content/topics.ts` still carry 22, 24 and 21.

---

## Part B: SEO findings

### S1 · High · Almost no page has a share image

- **Evidence:**
  - `pageMetadata()` returns `openGraph` with no `images` (`lib/metadata.ts:23-36`).
  - Next merges `openGraph` shallowly, per segment. A static `opengraph-image` only survives in the segment that owns it (`node_modules/next/dist/lib/metadata/resolve-metadata.js:148-155, 182-185`). So every child page that sets `openGraph` drops its parent's image.
  - Checked in the build: `notes/closures.html`, `react/react-props.html`, `git/model.html`, `interview/r3.html`, `interview/questions.html`, `architecture/arch-overview.html`, `problems/ex-accounts-merge.html`, `mock.html`, `whiteboard.html`, `practice.html` and `level/js.html` all have **no `og:image` and no `twitter:image`**.
  - Only the 9 pages that own an `opengraph-image.tsx` have one.
  - About 770 of the 781 sitemap URLs are affected. They still declare `twitter:card = summary_large_image`.
- **Why it matters:** chapter and problem links are what people actually share (Slack, X, LinkedIn, WhatsApp). They unfurl as bare text.
- **Fix:**
  - Quick: give `pageMetadata` an `image` option that defaults to the nearest topic card. For example, `/notes/opengraph-image` for JavaScript chapters, `/problems/opengraph-image` for problems, and `/opengraph-image` otherwise.
  - Better: add `opengraph-image.tsx` to the `[chapter]`, `[section]` and `[slug]` segments, using the existing `topicOgImage()` (`lib/topicOg.tsx`) with the chapter title as the headline.
- **Effort:** 2–3 h for the fallback. 0.5–1 day for per-chapter cards (about 800 images at build time; check how long the build takes).

### S2 · High · 538 problem pages are thin (69% of the sitemap)

- **Evidence:**
  - `app/problems/[slug]/page.tsx:48-62` renders only `PracticeClient`.
  - Built pages have 600–1,000 characters of server text, and most of it is UI chrome ("Run Debug Submit … Console 0 Problems 0 … ESLint checks JavaScript…").
  - The unique part is the brief: 320 characters at the median, 100 at the minimum.
  - Tests, hints and the solution only exist on the client.
  - Many briefs describe well-known LeetCode problems (Two Sum, Accounts Merge…) that are already covered on hundreds of other sites.
- **Why it matters:** hundreds of near-empty URLs lower the quality signal for the whole site. Expect "Crawled – currently not indexed" for most of them.
- **Fix:** server-render a section below the editor with:
  - the test names and inputs (not the expected outputs),
  - the hints inside collapsed `<details>`,
  - the target complexity,
  - "Taught in: \<chapter\>" with a link,
  - 3–5 related problems from the same chapter.

  Alternatively, noindex problems whose briefs are under about 200 characters until they are enriched.
- **Effort:** 0.5–1 day.

### S3 · Medium · The breadcrumb on every problem page says "JavaScript"

- **Evidence:** `components/practice/PracticeWorkspace.tsx:1178-1182` hard-codes `{ label: "JavaScript", href: "/notes" }`. The built DSA problem page reads "All topics › JavaScript › Union-Find", and so do the 162 React problems.
- **Why it matters:** the link and the label are wrong for 439 pages. It sends internal link weight to `/notes`, and a BreadcrumbList (S4) built from it would be wrong too.
- **Fix:** add the topic name and href to `ChapterLink`. `practiceChapterLinks()` in `lib/practiceLinks.ts:4-13` already loops over topics.
- **Effort:** 30 min.

### S4 · Medium · No structured data anywhere (t15)

- **Evidence:** no `ld+json` or `schema.org` in the source, and 0 in all 1,177 built pages.
- **Fix:** add a small server `<JsonLd>` component:
  - `TechArticle` or `Article` on chapters, Git sections and interview rounds: headline, description, author `Person` "Akshat", publisher `Organization` "Austin Coders", `dateModified` from `meta.updated` or the git date, `isPartOf` the topic.
  - `BreadcrumbList` on chapters and problems (after S3).
  - `WebSite` and `Organization` on `/`.

  Skip `FAQPage`: Google has limited it to government and health sites since 2023.
- **Effort:** 2–3 h.

### S5 · Medium · The home title and site description are vague and not accurate

- **Evidence:**
  - The home page `<title>` is "Groundwork — the whole map" (`app/layout.tsx:19-21`). `app/page.tsx:10` sets only the canonical.
  - The description is `SITE_DESCRIPTION` (`lib/site.ts:14-15`): "Handwritten notes on web development — JavaScript, HTML, CSS, React, **Next.js, Nest.js** and more". Four of the six topics it names are unwritten outlines.
  - It never mentions DSA, system design, the interview book, 538 problems or mock interviews.
  - The same string feeds the manifest and the root OG card.
- **Why it matters:** the home page is the site's strongest URL, and its snippet advertises content that doesn't exist.
- **Fix:** write a title along the lines of "Groundwork — free JavaScript, React, DSA and system design interview prep". Build the description from `siteStats()`: 227 chapters, 538 runnable problems, a 27-round interview book, mock interviews.
- **Effort:** 1 h.

### S6 · Medium · Meta descriptions are taglines, not summaries

- **Evidence:**
  - Chapter descriptions are `ch.subtitle` (`components/reader/topicPages.tsx:61`). 53 of the 209 levelled written chapters are under 70 characters, for example `this-keyword`: "Not where it was written — who called it." and `closures`: "The function that walked out with its birthplace still attached."
  - All 27 interview rounds fall back to "JavaScript & TypeScript — part of Interview — the whole loop."
  - Topic covers repeat themselves ("41 sections across three levels, all written … 41 chapters written, free to read.").
  - The DSA cover never says "data structures", "algorithms" or "JavaScript". Interview says "27 chapters written".
- **Why it matters:** search snippets carry no query terms. The interview rounds are probably the best search targets on the site ("JavaScript interview questions and answers").
- **Fix:** add an optional `description` field to chapters and rounds. Generate the round descriptions from `round.intro` or the first 3 questions. Rewrite the 7 cover descriptions. Add keywords to round titles, for example "JavaScript & TypeScript interview questions — Interview book".
- **Effort:** 0.5–1 day, mostly writing.

### S7 · Medium · The sitemap lists pages that are empty on the server

- **Evidence:**
  - `app/sitemap.ts:13-14` lists `/practice` and `/whiteboard`.
  - The built `practice.html` has **0** characters of server text. `whiteboard.html` has 55 ("Setting up the board…").
  - Both are indexable.
  - `/practice` also has a stale description: "JavaScript, TypeScript, Python or SQL" (`app/practice/page.tsx:7`), when 11 languages run.
- **Fix:** take both out of the sitemap, or render a short static intro on the server (what the tool does, the languages, a link to `/problems`). Update the description.
- **Effort:** 30 min.

### S8 · Low–Medium · The sitemap misses two strong pages and says every URL changed on every deploy

- **Evidence:**
  - `/mock` has 7,095 characters of server text and `/interview/questions` has 16,055, with 209 questions. Both are indexable and neither is in `app/sitemap.ts`.
  - Every entry uses `lastModified: now` (`app/sitemap.ts:8`), so every deploy marks all 781 URLs as modified and Google learns to ignore `lastmod`.
- **Fix:** add both routes to the static list. Set `lastModified` from the content, for example the topic's `meta.updated` or the git commit date of the chapter file.
- **Effort:** 30 min, or 2 h for real dates.

### S9 · Low–Medium · Internal links only go one way

- **Evidence** (from the chapter bodies, `links.ts` in this folder):
  - DSA and System Design bodies contain **0** internal links.
  - React bodies link only to React.
  - JavaScript bodies link to JavaScript, plus 2 links to outline covers (`content/js/ecosystem-professional.ts:29,38` → `/typescript`, `/node`, both noindex).
  - Interview rounds link out to 50 chapters (dsa 23, system-design 15, notes 12), but no chapter links back.
  - Git and architecture chapter pages have no server-rendered link to `/` (0 `href="/"` in `git/model.html` and `architecture/arch-overview.html`). The only way out is the client drawer.
- **Fix:** turn the interview-to-chapter links around and render an "Asked in interviews: R3.4, R7.2" box on each chapter. Link each System Design chapter to R8 and the mock. Add a home link or crumb to `components/series/ChapterView.tsx`.
- **Effort:** about 0.5 day.

### S10 · Low · `/level/*` titles lose the brand

- **Evidence:** `app/level/layout.tsx:4-9` sets a plain `title`, which resets the `%s · Groundwork` template for its children. The built `level/js.html` has the `<title>` "JavaScript — pick your level", while `og:title` does carry "· Groundwork".
- **Fix:** remove the title from that layout, or give it a `template`.
- **Effort:** 15 min.

### S11 · Low · The 404 page has the default title

- **Evidence:** `_not-found.html` has the title "Groundwork — the whole map". It is noindexed correctly. `app/not-found.tsx` exports no metadata.
- **Fix:** export `metadata = { title: "Page not found" }`.
- **Effort:** 10 min.

### S12 · Low · Heading order

- **Evidence:**
  - Chapter pages render the sidebar `h2`s ("Chapters", "⚙ Display") before the `h1` (`notes/closures.html` and every reader page).
  - The home page renders the four "How it works" `h3`s twice, once for desktop and once for mobile.
  - `/interview/questions` has 209 questions and only one heading.
- **Fix:** make the sidebar labels non-heading elements or use `aria-labelledby`. Hide the duplicate story from the accessibility tree. Consider an `h2` per part in the question bank.
- **Effort:** 1 h.

### S13 · Low · The manifest

- **Evidence:** `app/manifest.ts`:
  - The name is "handwritten web dev notes".
  - It has only 512 px and 180 px icons: no 192 px, no `purpose: "maskable"`, no `id`.
  - The icon is the "JS" mark.
- **Fix:** handle this together with t19 and t20. Add a 192 px maskable icon.
- **Effort:** 30 min.

### S14 · Low · JSON endpoints can be crawled

- **Evidence:** `robots.ts` disallows only `/api/`. The `*/search-index.json`, `/problems/*/cases` and `/mock/bank/*` routes are public and static.
- **Fix:** add them to `disallow`, or send `X-Robots-Tag: noindex` from those handlers.
- **Effort:** 15 min.

What is fine:

- Every route has a title, description and canonical, and `metadataBase` is the canonical origin on Vercel.
- The 358 outline chapters and 14 outline covers are noindexed and out of the sitemap, and tests enforce it.
- `/review`, `/progress`, `/path`, `/soon` and `/level` are noindexed.
- Git, the interview rounds and the architecture chapters are server-rendered with one `h1` each.
- Unknown slugs return a noindexed 404.
- The legacy host redirect is permanent.

---

## Part C: content findings

### C1 · High · The interview book still holds one person's CV (t01 regressed)

- **Evidence:**
  - `content/interview-data.ts:54` names a previous employer: "Jest appears under [an earlier employer], five years ago".
  - `:66-70` "Attack 8 — [home city] to [new city]", "You are listed as [home city]-based", and "change `[home city], India · Open to relocation` to `[new city], India (relocated Sept 2026)`".
  - `:176-178`, the R1 answer: "I have already moved. I am in [new city] now".
  - The scouting report (`:5-80`) and R10 (the ten resume metrics: "75% user adoption on the learning dashboard", "15 commerce pages", "Draw the architecture of one of your four applications … the five environments … the AI agent integration") describe one specific resume.
  - The book's author is shown as "Akshat" (`lib/interviewContent.ts:90`, rendered on the cover).
  - `.cspell/project-words.txt:403,454` list "[an earlier employer]" and "[home city]".
- **Why it matters:**
  - Together, these let a reader rebuild the author's employer history, home town, relocation month and resume metrics. The t01 cleanup (`b582d59`) caught the salary and the client names but not these.
  - It also makes R10 and the scouting report read as one person's prep notes, not advice for the reader.
- **Fix:**
  - Replace "[home city]" with "\<your home city\>" and "[an earlier employer]" with "an early role". Drop "relocated Sept 2026".
  - Rewrite R10's list as a template: "for each number on *your* resume, answer: period, tool, baseline".
  - Remove the two cspell words. Check the mock bank, which reuses these questions (`lib/mock/bank.ts`), after the edit.
- **Effort:** 1–2 h.

### C2 · Medium · The site gives three different interview-question counts

- **Evidence:**
  - The home page says "**420+** interview questions" (`app/HomeView.tsx:863,928,1047`).
  - The architecture page says "420 across 27 rounds" (`content/architecture/arch-overview.ts:52`).
  - The question bank says "**209** questions from every round" (`app/interview/questions/QuestionBank.tsx:216`, from `bankQuestions()`, which skips the bulk items).
  - The data holds **245** question objects.
  - ROADMAP.md says 230.
  - 420 counts every `<li>` inside the "rapid-fire" and "the rest of" items as its own question (`lib/interviewContent.ts:36-44`), and the "+" suffix inflates it further.
- **Why it matters:** a reader who clicks from "420+" lands on "209". That is the credibility problem t02 was meant to prevent.
- **Fix:** pick one definition and use it everywhere, for example "209 questions answered in depth, plus 211 rapid-fire". Drop the "+". Add the bank count to `tests/claims.test.ts`.
- **Effort:** 1 h.

### C3 · Medium · Stale "coming soon" copy on all 14 outline topics

- **Evidence:** `app/soon/SoonClient.tsx:98-100`: "JavaScript is the one topic with a full syllabus mapped out — beginner through advanced, 23 sections. A few are already written". JavaScript is 41 of 41 written, and React, DSA and System Design are complete too. This page shows for every outline topic the reader clicks.
- **Fix:** build the copy from `topicStats()` and point readers to the written topics.
- **Effort:** 30 min.

### C4 · Low · The JavaScript tagline says 40 sections

- **Evidence:** `content/topics.ts:506` "The whole map, 40 sections deep". The home shelf shows it next to "41 chapters", and `content/notes.ts:48` says 41.
- **Fix:** derive it, or add it to the claims test.
- **Effort:** 10 min.

### C5 · Medium · The "handwritten" claim is unchanged (t19)

- **Evidence:** `lib/site.ts:15` (every page that has no description of its own, the manifest and the root OG), `app/manifest.ts:6`, `app/opengraph-image.tsx:6,12`, `components/Shell.tsx:236`, `app/HomeView.tsx:1184` ("Written by hand, rendered by a browser"), `README.md:3`.
- **Fix:** lead with what's true, for example "written and checked by Akshat, every example run in a browser".
- **Effort:** 1 h.

### C6 · Medium · The privacy copy says more than the site does

- **Evidence:** the home FAQ says "nothing about you leaves your machine" (`app/HomeView.tsx:770-771`). But:
  - Vercel Analytics and Speed Insights run on every page (`app/layout.tsx:58-59`).
  - The clock widget sends geolocation to `/api/weather` (`components/ClockWeather.tsx:78-80`).
  - The narrator sends text to `/api/tts`.
  - Errors go to `/api/client-error`, or to Sentry when a DSN is set.
  - There is no privacy page.
- **Fix:** say it accurately ("no account; progress stays in your browser; anonymous page analytics") and add a privacy page as part of t17.
- **Effort:** 1–2 h.

### C7 · Low · "No paid tier" versus t44

- **Evidence:** `app/HomeView.tsx:765-767` against roadmap t44.
- **Fix:** decide. If t44 stays, plan the wording change for when it ships.

### C8 · Low · The README and Playground copy is stale

- **Evidence:** `README.md:16` lists 4 languages for the Playground. `app/practice/page.tsx:7` does the same. The home page correctly says 11 run and 17 are known.
- **Fix:** read the numbers from `LANG_ORDER` or `LANGUAGES`.
- **Effort:** 15 min.

### C9 · Low · Mixed British and American spelling

- **Evidence:** in content and page copy, "behaviour" appears 106 times and "behavior" 26, "optimise" 26 and "optimize" 16, "judgement" 28 and "judgment" 2 (for example `content/js/dom-events.ts:289`, `content/js/testing-in-js.ts:281`, `content/dsa/dsa-dp-1d.ts:276`).
- **Fix:** add the en-GB cspell dictionary or `flagWords` for the US forms, in prose only.
- **Effort:** 1–2 h.

### C10 · Low · Content gaps still open

- System Design has 0 exercises and no cheat page.
- DSA has no cheat page.
- Git has 0 exercises.
- Thin DSA chapters: MST 2, Complexity 3, Basic recursion 4, Tries 4, Advanced backtracking 4.
- No interview rounds for AI-assisted coding, code comprehension or frontend system design (ROADMAP.md 0.3).

### C11 · Low · Messy problem meta descriptions

- **Evidence:** stripping the tags leaves stray spaces, for example "accounts[i] is [name, email, email, ...] . Two accounts…" (`app/problems/[slug]/page.tsx:18-24`).
- **Fix:** collapse the space before punctuation after stripping.
- **Effort:** 10 min.

What reads well: the chapter prose is dense and specific, the interview rounds carry follow-ups, traps and "say it like this" lines, and the ₹ market tables are labelled as worked examples. I found no placeholder, "lorem" or TODO copy in the content.

---

## Proposed changes to the roadmap

- Reopen **t01**, with the evidence in C1.
- Mark **t22** done.
- Set **t21** to deferred or won't-do and add the Dependabot ignore.
- Re-scope **t24** (MST, Tries, Recursion).
- Set **t17**, **t20** and **t23** to in progress.
- Change "16 sections" to 18 in **t06** and **t25**.
- Add new tasks:
  - S1 share images.
  - S2 problem-page content.
  - S3 breadcrumb.
  - C2 question count.
  - C3, C4 and C8 stale copy (round 2).
  - C6 privacy copy and page.
  - S5 and S6 titles and descriptions.
  - S8 sitemap fixes.
  - S9 cross-links.
  - The ROADMAP.md P0 and P1 items missing from roadmap.html: the AI engineering topic, the SD frontend and GenAI tracks, the three interview rounds, and the GraphQL, K8s and Redis resizing.
- Add a "Shipped outside the roadmap" section listing the 12 groups above, so the roadmap stays a complete record.
- Refresh `docs/ROADMAP.md` from `siteStats()`: 227 written, 358 outlines, 538 exercises, Git 18, How this is built 26, and one agreed question count.
