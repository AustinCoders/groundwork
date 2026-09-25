import type { Chapter } from "../types";

export const archPerformance: Chapter = {
  id: "arch-performance",
  num: "A1",
  title: "Performance, and how it is kept",
  short: "Performance",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle:
    "Budgets that fail CI, code that loads only when it is asked for, and two places where the browser is told to skip work.",
  body: `<h3>Three ideas</h3>
<p>
  Performance here rests on three things. The first is a set of <strong>budgets</strong> that fail
  the CI job when a page gets slower or heavier. The second is <strong>deferral</strong>: anything
  heavy loads only when a reader does something that needs it. The third is <strong>skipping
  work</strong> the reader cannot see, on the two pages that can grow without limit. This chapter
  covers all three, with the numbers as they stand today.
</p>

<h3>The budgets, and why they now run three times</h3>
<p>
  The budgets live in <code>.lighthouserc.json</code>. The last step of CI starts the production
  build on port 3101 and runs Lighthouse, with the desktop preset, against three URLs: the home
  page, one chapter (<code>/notes/setup-mental-model</code>) and <code>/interview</code>.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Assertion</th><th>Limit</th><th>Level</th></tr></thead>
<tbody>
<tr><td>Performance, accessibility, best practices, SEO</td><td>each at least 0.95</td><td>error</td></tr>
<tr><td>First Contentful Paint</td><td>1,200 ms</td><td>error</td></tr>
<tr><td>Largest Contentful Paint</td><td>2,000 ms</td><td>error</td></tr>
<tr><td>Total Blocking Time</td><td>200 ms</td><td>error</td></tr>
<tr><td>Cumulative Layout Shift</td><td>0.06</td><td>error</td></tr>
<tr><td>Script bytes</td><td>700,000</td><td>error</td></tr>
<tr><td>Font bytes</td><td>250,000</td><td>error</td></tr>
<tr><td>All bytes</td><td>1,000,000</td><td>error</td></tr>
</tbody>
</table></div>
<p>
  Four audits are switched off: long cache lifetimes, unused JavaScript, unused CSS and
  <code>csp-xss</code>. The first three would report on choices made on purpose, like chunks that
  load later. The last one would flag the policy's <code>'unsafe-inline'</code>, which is discussed
  in the security chapter.
</p>
<p>
  <code>numberOfRuns</code> is now <strong>3</strong>. Locally, the home page scores 100 on
  performance with 0 ms of blocking time. On a GitHub runner, a single run once measured 0.91 and
  245 ms for the same page. That run was on the Dependabot pull request for Next, and it failed both
  the performance score and the blocking-time budget. Nothing in the pull request had made the page
  slower. The runner had been slow. With three runs, one bad sample can no longer fail the job.
</p>
<p>
  There is a price. Lighthouse CI's default aggregation is optimistic: it asserts against the best
  of the runs. So a real regression now has to show up in all three samples before it fails. In the
  latest run on <code>main</code> the step took 118 seconds, the longest step in the pipeline.
</p>

<h3>What a page actually downloads</h3>
<p>
  The table below comes from the most recent local production build. For each page it reads the
  prerendered HTML, collects every script the HTML references, and sums the files. That is the
  JavaScript a first visit pays for before anything is clicked. Here KB means 1,000 bytes.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Page</th><th>Scripts</th><th>Raw</th><th>Gzip</th><th>HTML, gzip</th></tr></thead>
<tbody>
<tr><td>Home</td><td>14</td><td>788 KB</td><td>247 KB</td><td>11 KB</td></tr>
<tr><td>A chapter</td><td>15</td><td>810 KB</td><td>254 KB</td><td>33 KB</td></tr>
<tr><td><code>/problems</code></td><td>14</td><td>810 KB</td><td>254 KB</td><td>33 KB</td></tr>
<tr><td><code>/whiteboard</code></td><td>14</td><td>764 KB</td><td>240 KB</td><td>7 KB</td></tr>
<tr><td>A problem page</td><td>19</td><td>1,323 KB</td><td>422 KB</td><td>10 KB</td></tr>
<tr><td><code>/practice</code></td><td>19</td><td>1,323 KB</td><td>422 KB</td><td>7 KB</td></tr>
</tbody>
</table></div>
<p>
  The script budget measures bytes on the wire, so the home page uses about 35% of its 700,000.
  The two heaviest pages are the playground and the problem pages, which carry the code editor, and
  <strong>neither is on the Lighthouse URL list</strong>. They are guarded only by the Playwright
  tests, which check that they work, not how much they weigh.
</p>

<h3>Loaded when asked</h3>
<p>
  The build writes 81 script chunks totalling 11.6 MB raw. A chapter reader downloads 810 KB of
  that. Most of the difference is code that waits for a reason to load.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Chunk</th><th>Raw size</th><th>Loads when</th></tr></thead>
<tbody>
<tr><td>The TypeScript compiler</td><td>3.47 MB</td><td>A TypeScript file runs, or the editor checks types</td></tr>
<tr><td>The whole exercise bank</td><td>1.70 MB</td><td>A mock interview room opens. A problem page loads only its own exercise</td></tr>
<tr><td>ESLint for the browser</td><td>1.28 MB</td><td>The editor lints for the first time, inside a worker</td></tr>
<tr><td>Sentry</td><td>548 KB</td><td>Never, unless a DSN is configured</td></tr>
</tbody>
</table></div>
<p>
  <strong>Workers start lazily.</strong> There are four Web Workers, and each one is created by a
  <code>getWorker()</code> the first time it is needed, then kept in a module variable:
</p>
<ul>
<li><code>jsWorker</code> runs JavaScript and TypeScript.</li>
<li><code>pyodideWorker</code> runs Python.</li>
<li><code>scriptWorker</code> runs C, C++, Ruby, PHP and Lua.</li>
<li><code>toolsWorker</code> formats, lints and type-checks for the editor.</li>
</ul>
<p>
  Opening the playground starts none of them. Switching a file to C, C++, Ruby, PHP or Lua sends
  the script worker a <code>warm</code> message, so the compiler downloads while the reader is still
  typing rather than after they press Run.
</p>
<p>
  <strong>Runtimes come from a CDN.</strong> Pyodide 314.0.6, sql.js 1.14.2, wasmoon, Ruby's WASI
  build, php-wasm and a Clang build all load from jsDelivr, at versions pinned in
  <code>lib/wasmAssets.ts</code>. None of them is part of a deploy. What remains in
  <code>public/wasm/</code> is 1.4 MB: TypeScript's lib files, which the editor fetches one at a
  time, and the 204 KB React sandbox.
</p>
<p>
  <strong>Dynamic imports.</strong> There are six <code>next/dynamic</code> calls in five files:
</p>
<ul>
<li>the whiteboard's <code>Board</code>, with <code>ssr: false</code></li>
<li>the mock interview's room and scorecard</li>
<li>the editor inside the room</li>
<li>Radix's focus trap, twice</li>
</ul>
<p>
  Below that level, <code>lib/codeLanguages.ts</code> loads each of its 17 language grammars with
  <code>import()</code> when a file in that language opens. The editor's Vim mode and minimap load
  only when they are switched on.
</p>
<p>
  <strong>Prefetch is opt-out.</strong> Next prefetches every visible link's route, chunks
  included. There are 21 <code>prefetch={false}</code> links across 8 files, 11 of them in the
  sidebar shell. Without them, a link from a light page to the playground makes every visitor pay
  for the editor.
</p>

<figure>
<svg viewBox="0 0 900 300" class="dg" role="img" aria-label="Four stages of loading on the playground, left to right: page scripts at load, a language grammar when a file opens, a Web Worker on the first run, and a runtime from jsDelivr on the first run of that language. Below them, the chunks that never load unless asked: the TypeScript compiler, the exercise bank and Sentry.">
<g class="rough">
<rect x="20" y="40" width="190" height="96" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
<rect x="244" y="40" width="190" height="96" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.8" />
<rect x="468" y="40" width="190" height="96" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.8" />
<rect x="692" y="40" width="190" height="96" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.8" />
<rect x="20" y="196" width="862" height="80" rx="12" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<path class="ln" d="M210 88 H236" marker-end="url(#arrow)" />
<path class="ln" d="M434 88 H460" marker-end="url(#arrow)" />
<path class="ln" d="M658 88 H684" marker-end="url(#arrow)" />
</g>
<text class="lbl" x="36" y="72">Page scripts</text>
<text class="sm" x="36" y="96">at load</text>
<text class="sm" x="36" y="116">240 to 422 KB gzip</text>
<text class="lbl" x="260" y="72">Grammar</text>
<text class="sm" x="260" y="96">when a file opens</text>
<text class="sm" x="260" y="116">1 of 17 languages</text>
<text class="lbl" x="484" y="72">Web Worker</text>
<text class="sm" x="484" y="96">on the first Run</text>
<text class="sm" x="484" y="116">4 kinds, kept once made</text>
<text class="lbl" x="708" y="72">Runtime</text>
<text class="sm" x="708" y="96">from jsDelivr</text>
<text class="sm" x="708" y="116">first run of Python, C...</text>
<text class="sm" x="36" y="222">NEVER LOADED UNLESS ASKED</text>
<text class="lbl" x="36" y="254">TypeScript compiler 3.47 MB &middot; exercise bank 1.70 MB &middot; Sentry 548 KB</text>
</svg>
<figcaption>
  Only the green box is paid on arrival. Each later stage waits for something the reader does, and
  the bottom row waits for something most readers never do.
</figcaption>
</figure>

<h3>Skipping what the reader cannot see</h3>
<p>
  <strong>The problems page.</strong> <code>/problems</code> lists all 538 problems in 130 groups,
  one per chapter. Its HTML is 283 KB before compression. Every group has
  <code>content-visibility: auto</code> and <code>contain-intrinsic-size: auto 66px</code> in
  <code>app/problems/problems.module.css</code>. The browser skips layout and paint for groups that
  are off screen and reserves 66 pixels for each, which is roughly a collapsed group header. The
  <code>auto</code> keyword makes it remember a group's real height once it has been drawn, so the
  scrollbar stops jumping after the first pass. Since the latest change only the first group starts
  open, so most groups really are 66 pixels tall.
</p>
<p>
  <strong>The whiteboard.</strong> <code>Board.tsx</code> culls. When a board holds more than 150
  elements, it renders only those whose bounds overlap the visible area, padded by 200 screen
  pixels, plus anything selected or being edited. Below 150 elements it draws everything, because
  the filter would cost more than it saves. The paper pattern is also dropped below each layout's
  minimum zoom, where its lines would blur into grey anyway.
</p>

<h3>The search index has a budget of its own</h3>
<p>
  Search fetches one JSON index per topic on the first keystroke. <code>tests/search-index.test.ts</code>
  fails if any topic's index goes over 85 KB gzipped. The limit was raised from 75 on 24 September,
  after real content growth, not bloat, pushed two topics past it. Measured today, in bytes:
</p>
<div class="table-scroll"><table>
<thead><tr><th>Topic</th><th>Chapters</th><th>Index, gzip</th><th>Share of 87,040</th></tr></thead>
<tbody>
<tr><td>JavaScript</td><td>41</td><td>77,347</td><td>89%</td></tr>
<tr><td>React</td><td>57</td><td>76,150</td><td>87%</td></tr>
<tr><td>System Design</td><td>24</td><td>73,293</td><td>84%</td></tr>
<tr><td>Interview</td><td>27</td><td>64,246</td><td>74%</td></tr>
<tr><td>DSA</td><td>34</td><td>57,719</td><td>66%</td></tr>
<tr><td>This topic, before this rewrite</td><td>18</td><td>11,500</td><td>13%</td></tr>
</tbody>
</table></div>
<p>
  The same test file checks that the compact index finds exactly the same words as the full chapter
  text: nothing gained and nothing lost. That is what makes the trim safe to keep.
</p>

<div class="bx is-prim">
<span class="ttl">Two lessons that still hold</span>
<p>
  <strong>Importing one constant imports the module.</strong> The sidebar once shipped the whole
  syllabus to every page because a client component imported one string from the file that held
  it. Tree-shaking drops unused exports, not unused properties of an exported object.
</p>
<p>
  <strong>A budget has to cover the heavy pages.</strong> The budgets here are tight and they pass.
  But they watch the three lightest kinds of page, and the heaviest page on the site is outside
  them. Adding <code>/practice</code> to the URL list is the cheapest real improvement left.
</p>
</div>`,
};
