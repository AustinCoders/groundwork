# Groundwork performance audit (2026-09-28)

Scope: the production build already in `.next` (Next 16.3.6, Turbopack, branch `feature/app-audit` at d766972). I served it with `next start -p 3201` and measured it with Playwright (Chromium 1243), the cached Lighthouse 12.8.2, Chrome coverage and CDP metrics. Static analysis covered `.next/diagnostics/route-bundle-stats.json`, the RSC client-reference manifests, the prerendered HTML, flight payloads and the source. I also spot-checked production (`groundwork.austincoders.com`) for headers and the Sentry DSN. Nothing in the repo was edited.

Scripts and raw data are in `scratchpad/audit/perf/`: `static-routes.mjs`, `chunkmap.mjs`, `flight.mjs`, `measure.mjs` (+ `measure.json`), `coverage.mjs`, `scrollcost.mjs`, `anims.mjs`, `tscost.mjs` and `lh/*.json`.

## Verdict: not fully optimized

The architecture is sound. There are no dynamic pages apart from 4 API routes, 1,765 static generation tasks, heavy tools (TypeScript, ESLint, Prettier, Pyodide, sql.js) that load lazily and mostly in workers, immutable caching, near-zero CLS and Lighthouse desktop scores of 97–100. It still falls short of "fully optimized" for these reasons:

1. **Two pages render nothing until JavaScript hydrates.** The Playground (`/practice?id=free`) and `/path` use `useSearchParams` inside `<Suspense fallback={null}>`. On mobile, FCP is **4.0 s** and **3.1 s**, which is poor.
2. **The JS floor is high for a reading site.** Every page ships ≥194 KB gzip of first-load JS, and a text chapter ships 209 KB, about 60% of it unused at load. That includes a Radix Select (37 KB gz) on every page, 91% of it unused.
3. **Render-blocking CSS is 180–354 KB raw per page, and 82–95% of it is unused.** Turbopack also merges unrelated module CSS (whiteboard, problems, architecture) into the homepage's blocking CSS.
4. **The scroll effects are expensive.** Scrolling the homepage at 4× CPU costs **3.8 s of main-thread time instead of 0.43 s** with reduced motion (1,531 style recalcs instead of 18).
5. **Payload waste.** The mock-interview room downloads all 538 exercises (1.7 MB, 389 KB gz) to show one. `/path` serializes a 300 KB flight payload. A single ₹ glyph pulls in an extra 53 KB font subset.
6. **Lighthouse mobile scores are 72–89.** These are PSI-equivalent, simulated slow 4G with 4× CPU. Simulated LCP is 3.8–6.0 s on every page, driven by render-blocking CSS and the JS dependency graph.

Real-network lab numbers (applied 150 ms RTT, 1.6 Mbps, 4× CPU) are **good on 9 of 12 pages**. The site is fast on desktop and acceptable on mobile, but not fully optimized.

---

## 1. Build output

### Route table (from `build.log`)
- **Static (○):** about 73 entries, including every topic landing, `/`, `/practice`, `/path`, `/mock`, `/review`, `/progress`, `/whiteboard`, `/soon`, `/level`, `/interview/questions`, 20 `search-index.json` route handlers, 9 `opengraph-image`, `icon`, `apple-icon`, `manifest`, `robots` and `sitemap`.
- **SSG (●):** **1,692 pages** from `generateStaticParams`. That breaks down as problems 538 plus `problems/[slug]/cases` 538, react 57, node 41, notes 41, dsa 34, nextjs 29, typescript 29, interview 27, architecture 26, nestjs 26, css/databases 25 each, cloud-devops/kubernetes/security/system-design/testing 24 each, docker/graphql/html 22 each, redis 21, level 19, git 18 and mock/bank 12.
- **Dynamic (ƒ):** only `/api/client-error`, `/api/joke`, `/api/tts` and `/api/weather`. **No unexpected dynamic routes.**
- `Generating static pages … (1765/1765) in 25.4s`.

### Chunk inventory (`.next/static`)
- **JS:** 100 files, 12.14 MB raw. **CSS:** 11 files, 464 KB raw. **Fonts:** 61 woff2 files, 1.22 MB (only the ones actually used get downloaded).

| Chunk | Raw | gzip | Contents (by string fingerprint and manifest) | Loaded when |
|---|---:|---:|---|---|
| `3gm6m6yp6nxux.js` | 3,470 KB | 982 KB | TypeScript compiler | Lazy: `runner.transpileTS` (main thread), `reactRunner`, `toolsWorker` |
| `0nzkir5vcz8f-.js` | 1,700 KB | 389 KB | All 538 exercises (`content/practice`) | Lazy: mock interview Room (`app/mock/Room.tsx:558`) |
| `3u7ppp4-8dqfs.js` | 1,279 KB | 337 KB | `eslint-linter-browserify` | Worker, on lint |
| `32inmlhjhmb2f.js` | 883 KB | 208 KB | Prettier TypeScript plugin | Worker, on format |
| `3tmli5d83e0n1.js` | 548 KB | 177 KB | `@sentry/nextjs` | Only if `NEXT_PUBLIC_SENTRY_DSN` is set. It isn't in prod (verified). |
| `14z65lzycpnit.js` | 323 KB | 104 KB | CodeMirror core | First load of `/problems/[slug]` and `/practice` |
| `0y2dwqrtts-sm.js` | 316 KB | 81 KB | Prettier babel/estree plugins | Worker |
| `3e5cnimcytbkl.js` | 233 KB | 73 KB | react-dom | Every page |
| `2t6ogzbidg-sy.js` | 207 KB | 59 KB | Prettier standalone | Worker |
| `0csycziksyq2t.js` | 142 KB | 39 KB | Next app-router runtime | Every page |
| `0ufzvex8v8c-8.js` | 127 KB | 39 KB | `content/topics.ts` (levels and syllabus for every topic) | First load of `/path` and `/soon` |
| `157fsqi-yp6zz.js` | 121 KB | 39 KB | `@replit/codemirror-vim` | Lazy |
| `0r57e-f0i33mt.js` | 121 KB | 39 KB | CodeEditor component and editor UI | Problem pages and playground |
| `0cz1d0mv5g_q7.js` | 113 KB | 39 KB | Legacy polyfills (`noModule`) | Not loaded by modern browsers |
| `2paueoytxm2tr.js` | 111 KB | 37 KB | Radix Select, Popper and floating-ui (`components/ui/select.tsx`) | **Every page** (Shell ThemePicker/FontPicker) |

Heavy tools are split correctly. ESLint, Prettier and TypeScript-for-tools run in `lib/editor/toolsWorker.ts`, and CodeMirror languages, vim and minimap load through dynamic imports (`lib/codeLanguages.ts`, `CodeEditor.tsx:594-599`).

### CSS files
| File | Raw | gzip | What | Pages |
|---|---:|---:|---|---|
| `2gcgbskg4mh3d.css` | 150 KB | 29 KB | `globals.css`, which also carries editor `.ed*`, dropdown `.dd*`, `.lc*` and interview rules | Every page (render-blocking) |
| `0q7kw7iufiwv7.css` | 111 KB | 15 KB | Turbopack-merged modules: whiteboard, problems, chapter, SiteDrawer, landing, architecture | `/`, `/problems*`, `/interview`, `/mock`, `/review`, `/progress`, `/practice` |
| `0bvk7-yan5drm.css` | 67 KB | 11 KB | Mock and guide | `/mock` |
| `1hqjyph_s821n.css` | 44 KB | 8 KB | Home | `/` |
| `2pcnfpskd92gv.css` | 35 KB | 4.4 KB | 106 `@font-face` rules for 13 families | Every page |
| `19rhlcx2srev9.css` | 0.5 KB | 0.2 KB | `lenis.css` as a separate blocking request | `/`, `/interview`, `/mock`, `/review`, `/progress` |

### First-load JS per route (`.next/diagnostics/route-bundle-stats.json`, polyfills excluded)
| Route | Raw | gzip | Chunks |
|---|---:|---:|---:|
| `/_not-found` (the floor) | 634 KB | 194 KB | 12 |
| `/level` · `/level/[topic]` | 635–658 KB | 194–201 KB | 13 |
| `/whiteboard` | 663 KB | 204 KB | 14 |
| All 19 topic landings and every `/…/[chapter]` | 682 KB | 209 KB | 14 |
| `/review` · `/progress` · `/problems` · `/interview/questions` | 701–705 KB | 216–217 KB | 14–15 |
| `/git*` · `/architecture*` · `/interview*` | 708–719 KB | 218–220 KB | 15 |
| `/` | 727 KB | 224 KB | 15 |
| `/mock` | 755 KB | 233 KB | 15 |
| `/soon` · `/path` | 778–784 KB | 238–240 KB | 14–15 |
| **`/practice` · `/problems/[slug]`** | **1,204 KB** | **379 KB** | 18 |

The framework accounts for about 432 KB raw / 128 KB gz of the floor (react-dom, the router, the runtime and turbopack). The rest of the floor is app code: Radix Select 111 KB, **Shell twice** (`3zzy-_afa3ctl.js` 17 KB and `0q52lesxuy67m.js` 18 KB, because `app/error.tsx` imports Shell), storage/hooks 29 KB, analytics 15 KB and instrumentation 10.5 KB.

Content check: **reader chapter pages do not ship `content/*.ts` to the client.** First-load JS is byte-identical for `/notes` and every `/notes/[chapter]`. The chapter body arrives as HTML plus the RSC flight payload. The exceptions are `/path` and `/soon` (the `topics.ts` chunk) and the mock Room (all practice content).

### HTML and RSC payload per page (prerendered)
| Page | HTML | HTML gz | Inline flight | Notes |
|---|---:|---:|---:|---|
| `/` | 86 KB | 17 KB | 32 KB | |
| `/notes/setup-mental-model` | 135 KB | 33 KB | 82 KB | Body is in both markup and flight (inherent to RSC, about 1.5×) |
| `/problems` | 283 KB | 34 KB | 131 KB | 92 KB of `groups` |
| `/interview/questions` | 271 KB | 58 KB | 178 KB | 138 KB of question data |
| **`/path`** | **365 KB** | **67 KB** | **360 KB** | `chapterById` for all 540 chapters plus exercises (300 KB), to render one topic × level |
| Every page | — | — | ~14 KB | Root-layout `TopicsNavProvider` data: all topics with blurbs and taglines, in every HTML and RSC response |

---

## 2. Measured pages (Playwright, cold cache, median of 3 runs)

Desktop is 1440×900 with no throttling. Mobile is 390×844 DPR 3 with **4× CPU** (`Emulation.setCPUThrottlingRate`) and 150 ms RTT, 1.6 Mbps down, 750 Kbps up. Transfer sizes are gzip from `next start`; Vercel serves brotli, about 12% smaller. TBT is the sum of (longtask − 50 ms) from FCP to load + 5 s. JS KB includes Next's in-viewport Link prefetches.

| Profile | Page | FCP ms | LCP ms | CLS | TBT ms | Longest task | Load ms | DOM | Reqs | JS KB | CSS KB | Font KB | Doc KB | Total KB |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| desktop | `/` | 120 | 176 | 0 | 0 | 0 | 117 | 910 | 42 | 283 | 66 | 215 | 18 | 631 |
| desktop | `/notes` | 124 | 124 | 0.024 | 0 | 0 | 132 | 692 | 45 | 257 | 60 | 148 | 20 | 642 |
| desktop | `/notes/var-let-const` | 144 | 144 | 0.031 | 0 | 76 | 148 | 974 | 31 | 257 | 60 | 148 | 38 | 514 |
| desktop | `/problems` | 88 | 540 | 0 | 0 | 0 | 105 | 2034 | 39 | 456 | 60 | 148 | 35 | 715 |
| desktop | `/problems/ex-typeof-guard` | 236 | 344 | 0 | 0 | 0 | 115 | 299 | 50 | 516 | 60 | 148 | 12 | 798 |
| desktop | `/interview` | 108 | 108 | 0.005 | 0 | 0 | 123 | 478 | 47 | 312 | 66 | 177 | 32 | 690 |
| desktop | `/mock` | 108 | 108 | 0 | 0 | 0 | 136 | 540 | 40 | 317 | 78 | 148 | 17 | 594 |
| desktop | `/review` | 72 | 72 | 0.005 | 0 | 0 | 78 | 184 | 41 | 284 | 69 | 148 | 24 | 560 |
| desktop | `/progress` | 124 | 124 | 0 | 0 | 0 | 133 | 742 | 47 | 309 | 75 | 155 | 13 | 632 |
| desktop | `/practice?id=free` | 256 | 624 | 0 | 0 | 94 | 107 | 284 | 37 | 475 | 60 | 148 | 9 | 703 |
| desktop | `/whiteboard` | 48 | 364 | 0 | 0 | 0 | 54 | 199 | 34 | 284 | 62 | 148 | 9 | 514 |
| desktop | `/path` | 196 | 196 | 0.016 | 0 | 0 | 79 | 2401 | 50 | 505 | 60 | 116 | 69 | 822 |
| mobile | `/` | 1320 | 1900 | 0 | 61 | 94 | 2679 | 910 | 40 | 283 | 66 | 155 | 18 | 571 |
| mobile | `/notes` | 1236 | 1236 | 0.011 | 133 | 142 | 2497 | 692 | 33 | 257 | 60 | 148 | 20 | 513 |
| mobile | `/notes/var-let-const` | 1292 | 1292 | 0 | 128 | 280 | 2505 | 974 | 31 | 257 | 60 | 148 | 38 | 514 |
| mobile | `/problems` | 1084 | 1536 | 0 | 59 | 105 | 2611 | 2034 | 39 | 456 | 60 | 148 | 35 | 715 |
| mobile | `/problems/ex-typeof-guard` | 1448 | 1448 | 0.001 | **249** | 187 | 3429 | 299 | 50 | 516 | 60 | 148 | 12 | 798 |
| mobile | `/interview` | 1148 | 1148 | 0.002 | 68 | 99 | 2752 | 478 | 47 | 312 | 66 | 177 | 32 | 690 |
| mobile | `/mock` | 1264 | 2056 | 0 | 61 | 95 | 2694 | 540 | 40 | 317 | 78 | 148 | 17 | 594 |
| mobile | `/review` | 1040 | 1040 | 0.017 | 48 | 94 | 2642 | 184 | 41 | 284 | 69 | 148 | 24 | 560 |
| mobile | `/progress` | 1064 | 1064 | 0 | 143 | 148 | 2649 | 739 | 42 | 284 | 69 | 155 | 13 | 556 |
| mobile | **`/practice?id=free`** | **4020** | **4100** | 0 | 18 | **375** | 3272 | 284 | 37 | 475 | 60 | 148 | 9 | 703 |
| mobile | `/whiteboard` | 1048 | 1048 | 0 | 45 | 95 | 2338 | 199 | 34 | 284 | 62 | 148 | 9 | 514 |
| mobile | **`/path`** | **3080** | **3080** | 0 | 0 | 153 | 2599 | 2395 | 40 | 313 | 60 | 116 | 69 | 610 |

CLS sources are all under 0.035. They come from the sidebar `TopicOfDay` tilt-card and `StreakMini` mounting after hydration, and from the review chart.

### Lighthouse 12.8.2 (single run each, performance only)
Mobile uses the default Lantern simulation (slow 4G, 4× CPU), which is what PageSpeed Insights reports. Desktop uses `--preset=desktop`.

| Page | Mobile score | FCP | LCP | TBT | CLS | Desktop score | Desktop LCP | Render-blocking est. (mobile) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `/` | 86 | 1.66 s | 4.06 s | 17 | 0 | 99 | 0.86 s | 750 ms |
| `/notes` | 86 | 1.36 s | 4.14 s | 50 | 0.009 | 100 | 0.77 s | 600 ms |
| `/notes/var-let-const` | 89 | 1.36 s | 3.76 s | 87 | 0 | 100 | 0.73 s | 600 ms |
| `/problems` | 79 | 1.51 s | 5.73 s | 36 | 0 | 98 | 1.11 s | 700 ms |
| `/problems/ex-typeof-guard` | 78 | 1.36 s | 5.73 s | 94 | 0 | 99 | 0.90 s | 650 ms |
| `/interview` | 85 | 1.81 s | 4.21 s | 38 | 0 | 100 | 0.81 s | 1,050 ms |
| `/mock` | 86 | 1.66 s | 4.06 s | 16 | 0 | 100 | 0.81 s | 750 ms |
| `/review` | 84 | 1.66 s | 4.39 s | 13 | 0.017 | 100 | 0.77 s | 900 ms |
| `/progress` | 88 | 1.51 s | 3.92 s | 25 | 0 | 100 | 0.77 s | 900 ms |
| `/practice?id=free` | **72** | 1.81 s | **6.00 s** | **258** | 0 | 97 | 1.22 s | 750 ms |
| `/whiteboard` | 83 | 1.21 s | 4.69 s | 33 | 0 | 99 | 0.91 s | 600 ms |
| `/path` | **78** | 1.89 s | 5.16 s | 138 | 0 | 97 | 1.32 s | 450 ms |

Lantern's mobile LCP is pessimistic here. In the observed trace the LCP paint happened after the async JS had arrived (local server), so the model charges the whole JS graph to LCP. The applied-throttling run above shows that text pages actually paint at 1.0–1.9 s. The PSI number is still what users and Search Console see, and the only ways to move it are less render-blocking CSS and less first-load JS. The repo's own `.lighthouserc.json` gates on desktop only (≥0.95), which is why CI stays green.

### Coverage at load (desktop, after one scroll)
| Page | JS loaded | JS unused | CSS loaded | CSS unused | Worst offenders |
|---|---:|---:|---:|---:|---|
| `/` | 854 KB | 68% | 332 KB | **87%** | Radix Select chunk 91% unused; prefetched Shell/Interview chunks 100% unused |
| `/notes/var-let-const` | 775 KB | 63% | 180 KB | 82% | Home chunk (prefetched via the brand link) 100% unused |
| `/problems` | 1,367 KB | **82%** | 288 KB | 92% | CodeMirror 316 KB and 118 KB **100% unused**, prefetched by the "Next up" Link |
| `/problems/ex-typeof-guard` | 1,524 KB | 63% | 288 KB | 93% | CodeMirror 60% unused |
| `/interview` | 935 KB | 73% | 317 KB | **94%** | |
| `/mock` | 951 KB | 69% | 354 KB | 90% | |
| `/whiteboard` | 845 KB | 70% | 289 KB | **95%** | |

---

## 3. Runtime cost of scroll effects (`lib/scrollFx.ts`, Lenis, HomeView)

Desktop 1280×800, **4× CPU**. I scrolled 40 × 180 px wheel steps over about 5.2 s, then measured 5 s of idle. "Reduced" means `prefers-reduced-motion: reduce`.

| Page | Mode | Scroll task ms | Style ms | Style recalcs | Layouts | Idle 5 s task ms | Idle recalcs | `[data-fx]` | Lenis |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| `/` | motion | **3,801** | **1,912** | **1,531** | 8 | **581** | 301 | 38 | yes |
| `/` | reduced | 434 | 24 | 18 | 10 | 3 | 0 | 38 | no |
| `/interview` | motion | 1,500 | 754 | 1,261 | 0 | 22 | 0 | 17 | yes |
| `/interview` | reduced | 296 | 8 | 15 | 15 | 3 | 0 | 17 | no |
| `/mock` | motion | 1,326 | 517 | 1,311 | 64 | 169 | 300 | 13 | yes |
| `/mock` | reduced | 147 | 2 | 2 | 2 | 2 | 0 | 13 | no |
| `/notes/var-let-const` | motion | 1,071 | 94 | 439 | **214** | 51 | 15 | 0 | no |
| `/notes/var-let-const` | reduced | 383 | 21 | 59 | 47 | 43 | 0 | 0 | no |

Frame intervals stayed at p95 17 ms on this M-series machine even at 4×. On a low-end Android, which is roughly 2× slower again, home and interview scrolling would drop frames.

What drives the cost:
- **`scrollFx.frame()` interleaves reads and writes** (`lib/scrollFx.ts:56-72`). For each live element it calls `getBoundingClientRect()` and then `style.setProperty('--in'|'--vp'|'--out')`, so the next element's read forces another style recalc. That shows up as about 5 recalcs per frame. Custom properties inherit, so every write invalidates the element's whole subtree.
- **The IntersectionObserver callback calls `frame(true)`**, which re-measures all 38 elements, not just the visible ones, on every intersection change (`scrollFx.ts:74-81`).
- **HomeView adds three more independent scroll listeners, each with its own rAF.** These are `Story` (`app/HomeView.tsx:426-462`, which writes `--progress`/`--p` and calls `setState` per step), the pinned rounds track (`:621-667`) and the `scrolled` flag (`:720-737`). That makes four rAF callbacks per frame, each reading layout after another has written.
- **The reader progress bar animates `width`** (`components/reader/ReaderShell.tsx:144`), which forces a layout on every scroll frame (214 layouts during the chapter scroll). `ChapterView` already uses `transform: scaleX`.
- **Lenis** (18.7 KB raw / 6.5 KB gz) loads lazily on `/`, `/interview`, `/mock`, `/review` and `/progress`. It runs a perpetual rAF (`scrollFx.ts:29-33`), but its idle cost is negligible: `/interview` idle is 22 ms per 5 s with 0 recalcs. It smooths wheel input, which multiplies scroll frames.
- **The idle cost comes from non-composited CSS animations, not JS.** Home's `glow` (box-shadow, 3 × 2.2 s after load) and `/mock`'s `drain` (stroke-dashoffset, **infinite**) each cause 60 style recalcs per second: 169–581 ms per 5 s at 4×. Lighthouse lists 58 non-composited animated elements on `/` and 28 on `/mock`, mostly border-color and color transitions at load. The `ping`, `float`, `spin` and `bob` animations are transform, rotate and opacity, so they're composited and fine.
- **Reduced motion is honored everywhere I checked.** `prefersMotion()` gates Lenis and scrollFx, and there are 7 `prefers-reduced-motion` blocks in `globals.css` and 2 in `home.module.css`. The check is made once at mount and doesn't react to OS changes mid-session, which is minor.

---

## 4. Fonts and images
- **next/font/google, 13 families** (`lib/fonts.ts`). Only Caveat (heading) and Kalam (body) are preloaded, with `display: optional`, which keeps CLS near 0. The other 11 families use `preload: false` and load only when their theme is picked. That's good.
- **Preloaded on every page: 115 KB.** Caveat is a variable font at **74.5 KB**, which makes it the largest single asset on most pages and bigger than every JS chunk except react-dom. Kalam 300, 400 and 700 are 13–14 KB each. JetBrains Mono (32 KB, not preloaded) is fetched on almost every page for code, which brings fonts to **147 KB per page**. That's about 25% of total bytes and more than half the JS on reader pages.
- **Wasted subsets from one glyph.** `next/font` emits `@font-face` rules for every subset with `unicode-range`. The **₹** in `app/HomeView.tsx:89,97` ("₹50L") falls in Kalam's Devanagari range (U+20B9) and makes the homepage download **53 KB** (`f9d625bba3a10f71`). On `/interview`, ₹ in Caveat headings pulls Caveat latin-ext (**30 KB**). Σ pulls JetBrains Mono Greek (8 KB) on `/`, chapter pages and `/progress`.
- **Images.** There's no `next/image`, no raster content images and no `<img>` in components; everything is inline SVG and CSS, which is ideal. `next.config.ts` has no `images` block, and none is needed.
- **OG images and icons** are prerendered at build as static PNGs (38–58 KB, 9 files), so they cost nothing at runtime. The `icon` is a 23.5 KB 512×512 PNG requested on first visit; an SVG favicon would be about 1 KB.

## 5. Heavy client dependencies: who loads what
| Dependency | Where | How |
|---|---|---|
| CodeMirror (~300 KB gz with editor UI) | First load of `/problems/[slug]` and `/practice`. **Prefetched on `/problems`** through the "Next up" Link (`ProblemsView.tsx:467`). | Static import in the practice route; languages, vim and minimap are lazy (good) |
| Prettier (standalone and plugins, ~350 KB gz) | Only on "format", **in a worker** (`lib/editor/toolsWorker.ts:20-22`) | Good |
| ESLint browserify (337 KB gz) | Only on lint, in a worker (`toolsWorker.ts:89`) | Good |
| TypeScript (982 KB gz) | Worker for tools, **but `lib/runner.ts:162-256` `transpileTS` runs `createProgram` and a full semantic check on the main thread** | See finding P5 |
| Lenis | 5 pages, dynamic import | Good; see runtime notes above |
| Sentry (177 KB gz) | Only if a DSN is set. **In prod it isn't:** the prod chunk `3-eefk39ljrns.js` reads an un-inlined `process.env.NEXT_PUBLIC_SENTRY_DSN`, so it's disabled. | If one is ever set, `instrumentation-client.ts` imports Sentry eagerly on every page. Defer it to idle or first error. |
| Search index (`/search-index.json` 53 KB, per-topic up to 193 KB raw) | **Fetched only once the user types a query** (`ReaderShell.tsx:69-91`) | Good |
| `content/practice` (389 KB gz) | Mock Room, whole file for one exercise (`app/mock/Room.tsx:555-565`) | See finding P2 |
| `content/topics.ts` (39 KB gz) | `/path` and `/soon` first load | See finding P1 |
| Confetti | 1.4 KB CSS component, no library | Fine |
| Vercel Analytics and Speed Insights | 15 KB raw, every page | Fine; Speed Insights gives you field CWV, so check it |

## 6. Caching and headers
- `next start` and prod both serve `/_next/static/*` with `Cache-Control: public, max-age=31536000, immutable`. Prod uses brotli and a `/_next/static/immutable/` path.
- Prod HTML is `public, max-age=0, must-revalidate` with `x-vercel-cache: HIT` (served from the CDN; `age` was 42,090 s). That's correct for SSG.
- `next.config.ts` sets only security headers and redirects. `compress` is at its default (on), and there's no `images` config (not needed).
- `public/` is 1.4 MB, all in `public/wasm`: `react-sandbox.js` (232 KB) and 46 TypeScript lib `.d.ts` files (~1.0 MB). These are **unhashed and served `max-age=0`**, so every session revalidates them, and the 46 lib files are fetched one by one on the first TS run (`runner.ts:176-188`). This only affects TS and React runs.
- Locally `X-Powered-By: Next.js` is sent; prod didn't show it.

## 7. Web Vitals verdict per page
Thresholds: LCP ≤2.5 s good / ≤4 s needs improvement / >4 s poor; CLS ≤0.1 good; TBT ≤200 ms good (a lab proxy for INP).

| Page | Desktop | Mobile (applied throttle) | Mobile (Lighthouse/PSI) | Verdict |
|---|---|---|---|---|
| `/` | Good | Good (LCP 1.90, TBT 61) | 86, LCP 4.06 | **Good / PSI needs work** |
| `/notes` | Good | Good (1.24, 133) | 86, 4.14 | Good / PSI needs work |
| Chapter | Good | Good (1.29, TBT 128, longest task 280 ms) | 89, 3.76 | Good / PSI needs work |
| `/problems` | Good | Good (1.54, 59) | 79, 5.73 | Good / PSI poor |
| `/problems/[slug]` | Good | **Needs work** (LCP 1.45, **TBT 249**) | 78, 5.73 | Needs work |
| `/interview` | Good | Good (1.15, 68) | 85, 4.21 | Good / PSI needs work |
| `/mock` | Good | Good (2.06, 61) | 86, 4.06 | Good (near the limit) |
| `/review` | Good | Good (1.04, 48) | 84, 4.39 | Good / PSI needs work |
| `/progress` | Good | Good (1.06, 143) | 88, 3.92 | Good / PSI needs work |
| `/practice?id=free` | Good (LCP 0.62) | **Poor (FCP 4.02, LCP 4.10)** | 72, 6.00, TBT 258 | **Poor** |
| `/whiteboard` | Good | Good (1.05, 45) | 83, 4.69 | Good / PSI needs work |
| `/path` | Good | **Needs work (LCP 3.08)** | 78, 5.16 | **Needs work** |

CLS is good on every page (max 0.035).

---

## Findings

Severity reflects user impact × reach. Gains are estimates from the measurements above.

### P1 · High · The Playground and `/path` render nothing server-side
- **Evidence:** `app/practice/PracticeClient.tsx:30` and `app/path/PathClient.tsx:36` (also `app/soon/SoonClient.tsx:14` and `app/level/page.tsx:20`) wrap `useSearchParams` in `<Suspense fallback={null}>`. The prerendered HTML carries no content, so first paint waits for about 475 KB of transferred JS plus hydration. Mobile FCP/LCP is **4.02/4.10 s** for the Playground and **3.08 s** for `/path`. `/path` also serializes `chapterById` for all 540 chapters plus every exercise list (**365 KB HTML, 360 KB flight**) and ships `content/topics.ts` (127 KB raw) just to render one topic × level.
- **Impact:** Two of the most-linked destinations are poor or needs-work on mobile. The Playground is in every sidebar and on the home Tools grid.
- **Fix:**
  - Playground: render the free workspace statically. Make `<PracticeBody exercise={FREE_EXERCISE} isFree …/>` the Suspense fallback, or move the `?id=<slug>` → `/problems/<slug>` redirect into `next.config.ts` `redirects` with `has: [{ type: "query", key: "id", value: "(?<id>(?!free$).+)" }]`.
  - `/path`: prerender `/path/[topic]/[level]` (about 57 pages) with only that slice of data, and redirect the query form to it. Do the same for `/soon?topic=`.
- **Expected gain:** mobile FCP/LCP 4.1 s → about 1.3 s (Playground) and 3.1 s → about 1.2 s (`/path`). `/path` HTML 365 KB → about 30 KB, and JS −39 KB gz.
- **Effort:** S for the Playground, M for `/path`.

### P2 · High (for mock users) · The mock room downloads every exercise to show one
- **Evidence:** `app/mock/Room.tsx:555-565` does `import("@/content/practice")`, which pulls in `0nzkir5vcz8f-.js` (**1.70 MB raw, 389 KB gz**, 538 exercises) for each coding question's `useExercise(id)`.
- **Impact:** On 4G that's about 2–3 s before the coding question appears, plus 1.7 MB of JS to parse and hold in memory during a timed interview.
- **Fix:** Emit one static JSON per exercise (a route handler with `generateStaticParams`, the same pattern as `search-index.json`) or reuse the `/problems/[slug]` RSC payload, and fetch only the needed id.
- **Expected gain:** about −385 KB gz per session (a few KB instead of 389 KB).
- **Effort:** S–M.

### P3 · Medium–High · Render-blocking CSS is 3–10× what a page uses
- **Evidence:** Per-page blocking CSS is 180 KB raw (reader) to 354 KB raw (`/mock`), with 82–95% unused (coverage table). `globals.css` (150 KB) holds editor, dropdown and interview rules for every page. Turbopack merged whiteboard, problems, architecture and landing module CSS into `0q7kw7iufiwv7.css` (111 KB), which blocks `/`, `/interview`, `/mock`, `/review`, `/progress` and `/practice`. `lenis.css` is a separate 457-byte blocking request. Lighthouse estimates **450–1,050 ms of FCP** savings on mobile.
- **Fix:**
  - Set `experimental.cssChunking: 'graph'` (Turbopack; see `node_modules/next/dist/docs/.../cssChunking.md`).
  - Move `.ed*` editor, `.dd*` dropdown and interview rules out of `globals.css` into the CSS modules of the components that use them.
  - Fold the lenis rules into `globals.css`.
  - Once the CSS is smaller, consider `experimental.inlineCss`.
- **Expected gain:** −150 to −200 KB raw (−25 to −35 KB gz) of blocking CSS on `/`; mobile FCP −0.4 to −0.9 s (Lighthouse estimate); PSI +5 to +10.
- **Effort:** M.

### P4 · Medium · Radix Select ships on every page for two closed dropdowns
- **Evidence:** `components/ThemeFontPicker.tsx` imports `components/ui/select.tsx` (`radix-ui` Select), which Shell renders in the sidebar footer on every page. The chunk is `2paueoytxm2tr.js` (111 KB raw, **37 KB gz**) and is **91% unused** at load on `/`, `/interview`, `/mock` and `/whiteboard`. Lighthouse lists it as the top unused-JS item (33.5 KB wasted).
- **Fix:** Use a native `<select>` for theme and font, or render a lightweight trigger and `import()` the Radix Select on first pointerenter or focus.
- **Expected gain:** −37 KB gz and −111 KB parse/compile on every page. That's about 18% of a reader page's first-load JS (209 → 172 KB gz).
- **Effort:** S.

### P5 · Medium · TypeScript type-checking runs on the main thread
- **Evidence:** `lib/runner.ts:162-256` `transpileTS` loads the 3.47 MB (982 KB gz) TypeScript chunk in the page and builds a fresh `ts.createProgram` for every run. It re-parses 46 lib files (1.05 MB of `.d.ts`) through `createSourceFile` every time, then calls `getSemanticDiagnostics`. In Node on this M-series Mac, `require('typescript')` takes 125 ms, the first check 131 ms and each re-check 69 ms. At a phone's roughly 4× slower CPU, that's about 1 s of blocked main thread on the first TS run and about 280 ms per re-run.
- **Fix:** Move `transpileTS` into the existing `toolsWorker` or `jsWorker` (TypeScript is already bundled there). Cache the lib `SourceFile`s and pass `oldProgram` to reuse the program.
- **Expected gain:** 0 ms of main-thread blocking for TS runs (INP on "Run" for TypeScript exercises).
- **Effort:** S–M.

### P6 · Medium · Scroll effects cost 3–9× more main-thread time
- **Evidence:** See section 3. With motion on, the homepage spends **3,801 ms** (1,531 style recalcs) against **434 ms** (18) with reduced motion. `/interview` is 1,500 against 296 and `/mock` 1,326 against 147. The causes are read/write interleaving in `lib/scrollFx.ts:56-72`, `frame(true)` on every IntersectionObserver callback, four independent scroll/rAF handlers on the homepage, and the `width`-animated reader progress bar at `ReaderShell.tsx:144`.
- **Fix:**
  - Move the reveal and parallax effects to CSS scroll-driven animations (`animation-timeline: view()` / `scroll()`), with the current JS kept only as an `@supports not (animation-timeline: view())` fallback.
  - In the JS path, batch all `getBoundingClientRect` reads before any writes, measure only `live` elements, and merge the four HomeView handlers into one rAF.
  - Use `transform: scaleX` for the reader bar.
  - Make `/mock`'s infinite `drain` animation composited (a transform on a mask), or pause it off-screen.
- **Expected gain:** 60–90% less main-thread time while scrolling, on par with the reduced-motion numbers, and smoother scrolling on low-end Android.
- **Effort:** M.

### P7 · Medium · Fonts are about 25% of page weight, plus glyph-triggered subsets
- **Evidence:** 147 KB of fonts on almost every page. Caveat's variable file (74.5 KB, preloaded) is the single largest asset. ₹ triggers Kalam Devanagari (**53 KB**, `/`) and Caveat latin-ext (**30 KB**, `/interview`).
- **Fix:**
  - Render currency figures in a span with the system font, or write "Rs 50L" or "50 LPA", to avoid the Devanagari and latin-ext downloads.
  - Consider a single static Caveat weight, or drop the 500 weight, instead of the variable file.
  - Consider not preloading Kalam 300 (it's used in only 3 rules).
- **Expected gain:** −53 KB on `/` and −30 KB on `/interview` right away, and about −30 to −45 KB per page if Caveat is slimmed.
- **Effort:** S.

### P8 · Low–Medium · Prefetch and serialized-payload waste
- **Evidence:**
  - Every page prefetches `/` (about 12 KB RSC plus the Home chunks, which are 100% unused on chapter pages) through the brand link in `components/Shell.tsx:189`.
  - `/problems` prefetches the problem route, including **~200 KB gz of CodeMirror** (`ProblemsView.tsx:467`).
  - The root layout serializes about **14 KB** of topic blurbs and taglines into every HTML and RSC response (`app/layout.tsx:51`, `topicsNavWithStats()`).
  - Shell is bundled twice (`3zzy-_afa3ctl.js` and `0q52lesxuy67m.js`) because `app/error.tsx` imports it.
- **Fix:**
  - Add `prefetch={false}` on the brand link and the "Next up" CTA, or switch them to hover prefetch.
  - Pass only the nav fields the sidebar needs (id, name, mark, status, href) and let the homepage fetch blurbs itself.
  - Give `error.tsx` a lightweight shell.
- **Expected gain:** −200 KB gz of speculative download on `/problems`, −3 to −4 KB gz per HTML, −5 KB gz of duplicate JS.
- **Effort:** S.

### P9 · Low · Problem pages block for 249 ms at load on mobile
- **Evidence:** `/problems/[slug]` mobile TBT is 249 ms, script time 819 ms and first-load JS 379 KB gz, with CodeMirror (104 KB gz) and the editor UI (39 KB gz) in the initial graph.
- **Fix:** Keep the SSR'd brief and tests visible and `next/dynamic` the CodeEditor with a static `<pre>` placeholder of the starter code, so hydration of the text isn't gated on CodeMirror.
- **Expected gain:** TBT under 150 ms, and PSI +5 to +8 on 538 pages.
- **Effort:** M.

### P10 · Low · Assorted
- `public/wasm/*` is unhashed with `max-age=0`. Version the path or add a `headers()` rule with a long `max-age` plus a content hash.
- The 512 px PNG favicon (23.5 KB) could be an SVG favicon.
- Next's polyfill module adds about 14 KB of legacy JS inside react-dom's chunk, per Lighthouse's legacy-javascript audit.
- If a Sentry DSN is ever set, lazy-init Sentry on `requestIdleCallback` or first error instead of in `instrumentation-client.ts` at boot (177 KB gz on every page otherwise).
- `ClockWeather` re-renders every second (`components/ClockWeather.tsx:36`) even when the sidebar is off-canvas on mobile. Pause it while hidden.

---

## Ranked opportunities (by expected gain)
1. **P1:** Server-render the Playground and `/path`. Mobile LCP 4.1 s → ~1.3 s and 3.1 s → ~1.2 s; `/path` HTML −335 KB.
2. **P2:** Per-exercise JSON for the mock room. −385 KB gz and −1.7 MB of JS per mock session.
3. **P3:** Cut render-blocking CSS (`cssChunking: 'graph'`, split `globals.css`, inline lenis). −25 to −35 KB gz blocking; mobile FCP −0.4 to −0.9 s.
4. **P4:** Drop Radix Select from the global Shell. −37 KB gz and −111 KB parse on every page.
5. **P6:** Scroll FX to CSS scroll-driven animations and batched reads/writes. −60 to −90% main-thread time while scrolling.
6. **P7:** Font diet (₹ subset fix, slimmer Caveat). −30 to −83 KB per page.
7. **P5:** TypeScript check in a worker with cached lib files. About 1 s less main-thread blocking on the first TS run on phones.
8. **P8:** Prefetch and payload trims. −200 KB gz speculative on `/problems`, −14 KB raw per HTML, deduplicated Shell.
