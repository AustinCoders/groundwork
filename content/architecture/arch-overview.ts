import type { Chapter } from "../types";

export const archOverview: Chapter = {
  id: "arch-overview",
  num: "B1",
  title: "What this site is",
  short: "What this is",
  levels: ["beginner"],
  practice: [],
  ready: true,
  subtitle:
    "One decision shaped everything else: the site is a build artifact, and the heavy work runs in your browser.",
  body: `<h3>The one-sentence version</h3>
<p>
  A reading site with four tools attached &mdash; a code playground, a set of runnable problems, a mock
  interview and a whiteboard &mdash; rendered to files at build time, served by a CDN, and doing its
  heavy lifting inside the reader's browser. There is no database, no login, no session, and nothing
  kept alive between deploys. Four small server functions exist. Everything else was either written
  before you arrived or runs on your own machine.
</p>

<h3>The decision underneath</h3>
<p>
  Almost every choice in these chapters follows from one call made early: <strong>the content lives in
  the repository as TypeScript, and the whole site is rendered ahead of time</strong>. That is not the
  obvious choice for a site whose last production build wrote out 1,742 routes, and it has a real cost:
  fixing a typo means a deploy, and adding a problem means a build.
</p>
<p>
  What it buys is that the interesting parts of this system are the parts that <em>do not run</em>. A
  page that was written at build time cannot time out, cannot exhaust a connection pool, and cannot
  return a 500 because something upstream is slow. The failure modes that dominate most web
  architectures were removed rather than handled.
</p>
<p>
  The second decision followed from the first. Once there was no server to lean on, anything that
  looks like computation had to move to the reader. When you run Python on a problem, the Python
  interpreter is WebAssembly running in a Web Worker in your tab. When you compile C++, the compiler
  is clang, compiled to WebAssembly, downloaded once and cached by your browser. When you save a
  whiteboard, it goes to <code>localStorage</code>. The server never receives your code, your boards or your interview answers, because it has nowhere to put them.
</p>

<div class="table-scroll"><table>
<thead><tr><th>Measured today</th><th></th></tr></thead>
<tbody>
<tr><td>Prerendered routes</td><td>1,742 in the last production build of <code>main</code></td></tr>
<tr><td>Server functions</td><td>4, all under <code>/api/</code></td></tr>
<tr><td>Databases</td><td>0</td></tr>
<tr><td>Topics</td><td>21 — 5 written, 14 outlined, 2 standalone</td></tr>
<tr><td>Written chapters</td><td>227, plus 358 outlines</td></tr>
<tr><td>Exercises with tests</td><td>538</td></tr>
<tr><td>Interview questions</td><td>405 across 27 rounds</td></tr>
<tr><td>Editor languages</td><td>17, of which 11 run in the browser</td></tr>
<tr><td>Application code</td><td>274 TypeScript files in <code>app/</code>, <code>components/</code> and <code>lib/</code>, 26,684 lines</td></tr>
</tbody>
</table></div>
<p class="sub">
  The route count comes from <code>.next/prerender-manifest.json</code>. The content counts come from
  the data through <code>lib/content.ts</code>. The code count is <code>wc -l</code> over the tracked
  files at commit <code>d6b12d7</code>.
</p>

<h3>The three layers, and where work happens</h3>

<figure>
<svg viewBox="0 0 900 380" class="dg" role="img" aria-label="Three layers. At the top, the reader's browser, which holds Web Workers, WebAssembly runtimes and sandboxed iframes. In the middle, the Vercel edge with 1,742 prerendered routes and four functions, beside a third-party CDN that serves the language runtimes. At the bottom, the build, which turns TypeScript content into the files the edge serves.">
<g class="rough">
<rect x="30" y="16" width="840" height="100" rx="12" style="fill: var(--sheet-2); stroke: var(--line-soft); stroke-width: 2" />
<rect x="470" y="42" width="120" height="56" rx="9" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.6" />
<rect x="602" y="42" width="130" height="56" rx="9" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.6" />
<rect x="744" y="42" width="110" height="56" rx="9" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.6" />
<rect x="30" y="160" width="570" height="92" rx="12" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
<rect x="250" y="178" width="200" height="54" rx="9" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.6" />
<rect x="462" y="178" width="126" height="54" rx="9" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.6" />
<rect x="620" y="160" width="250" height="92" rx="12" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<rect x="30" y="300" width="840" height="64" rx="12" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
<path class="ln" d="M300 160 V122" marker-end="url(#arrow)" />
<path class="ln" d="M745 160 V122" marker-end="url(#arrow)" />
<path class="ln" d="M300 300 V258" marker-end="url(#arrow)" />
</g>
<text class="sm" x="46" y="40">THE READER'S BROWSER</text>
<text class="lbl" x="46" y="70">HTML, one JS bundle per route</text>
<text class="sm" x="46" y="96">localStorage: progress, code, boards, mock sessions</text>
<text class="sm" x="530" y="75" text-anchor="middle">Web Workers</text>
<text class="sm" x="667" y="75" text-anchor="middle">WASM runtimes</text>
<text class="sm" x="799" y="75" text-anchor="middle">iframes</text>
<text class="sm" x="46" y="184">VERCEL EDGE</text>
<text class="lbl" x="46" y="214">CDN cache + firewall</text>
<text class="sm" x="350" y="210" text-anchor="middle">1,742 prerendered routes</text>
<text class="sm" x="525" y="210" text-anchor="middle">4 functions</text>
<text class="sm" x="636" y="184">THIRD-PARTY CDN</text>
<text class="lbl" x="636" y="210">jsDelivr</text>
<text class="sm" x="636" y="232">Pyodide, sql.js, Ruby, PHP,</text>
<text class="sm" x="636" y="248">Lua and clang runtimes</text>
<text class="sm" x="318" y="144">answers every request</text>
<text class="sm" x="763" y="144">on first use</text>
<text class="sm" x="318" y="282">deployed into the edge</text>
<text class="sm" x="46" y="322">BUILT AHEAD OF TIME</text>
<text class="lbl" x="46" y="348">TypeScript content &rarr; HTML, JSON, images, sitemap</text>
</svg>
<figcaption>
  Only the top two rows exist at request time. The green band happened before the reader arrived, and
  the right-hand box is only touched when a reader picks a language that needs it.
</figcaption>
</figure>

<h3>What the 1,742 routes are</h3>
<p>
  A static site with that many routes sounds like a site with that many pages of prose. It is not. Just
  under a third are reading pages. Most of the rest exist because every problem gets two routes: its own
  page, and a JSON file of test cases recorded from the JavaScript solution at build time.
</p>

<figure>
<svg viewBox="0 0 900 200" class="dg" role="img" aria-label="A bar of 1,742 prerendered routes drawn to scale: 567 chapter pages, 538 problem pages, 538 case files, and 99 others.">
<g class="rough">
<rect x="30" y="56" width="273.4" height="52" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
<rect x="303.4" y="56" width="259.4" height="52" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
<rect x="562.8" y="56" width="259.4" height="52" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
<rect x="822.3" y="56" width="47.7" height="52" style="fill: var(--line-soft); stroke: var(--ink); stroke-width: 2" />
<path class="ln" d="M846 108 V138" />
</g>
<text class="sm" x="30" y="40">1,742 PRERENDERED ROUTES, TO SCALE</text>
<text class="lbl" x="166.7" y="80" text-anchor="middle">567</text>
<text class="sm" x="166.7" y="100" text-anchor="middle">chapter pages</text>
<text class="lbl" x="433.1" y="80" text-anchor="middle">538</text>
<text class="sm" x="433.1" y="100" text-anchor="middle">problem pages</text>
<text class="lbl" x="692.5" y="80" text-anchor="middle">538</text>
<text class="sm" x="692.5" y="100" text-anchor="middle">test-case JSON files</text>
<text class="lbl" x="846" y="88" text-anchor="middle">99</text>
<text class="sm" x="870" y="156" text-anchor="end">the other 99: 21 topic covers &middot; 21 search indexes &middot; 20 level pages &middot; 12 mock question banks</text>
<text class="sm" x="870" y="178" text-anchor="end">9 share images &middot; 16 single pages, icons and metadata files</text>
</svg>
<figcaption>
  The 567 chapter pages include the outlines: an unwritten chapter still gets a page, marked
  <code>noindex</code> and left out of the sitemap. Counted from <code>.next/prerender-manifest.json</code>.
</figcaption>
</figure>

<h3>The four tools, and where each one runs</h3>
<div class="table-scroll"><table>
<thead><tr><th>Tool</th><th>URL</th><th>Where the work happens</th><th>Where its state lives</th></tr></thead>
<tbody>
<tr><td><b>Reader</b></td><td><code>/&lt;topic&gt;/&lt;chapter&gt;</code></td><td>HTML from the build; search JSON fetched on the first keystroke</td><td><code>jsnotes:progress</code></td></tr>
<tr><td><b>Playground and problems</b></td><td><code>/practice?id=free</code>, <code>/problems/&lt;id&gt;</code></td><td>Web Workers, WebAssembly runtimes and sandboxed iframes</td><td><code>groundwork:playground:project</code>, <code>jsnotes:code:&hellip;</code></td></tr>
<tr><td><b>Mock interview</b></td><td><code>/mock</code></td><td>A client-side session engine over 12 prerendered question banks</td><td><code>groundwork:mock:&hellip;</code></td></tr>
<tr><td><b>Whiteboard</b></td><td><code>/whiteboard</code></td><td>A canvas that never renders on the server at all</td><td><code>groundwork:boards</code></td></tr>
</tbody>
</table></div>
<p>
  The storage keys are the real ones. The older features write under <code>jsnotes:</code> and the newer
  ones under <code>groundwork:</code>. Renaming the old keys would orphan every reader's saved progress,
  so both prefixes stay.
</p>

<h3>What the server still does</h3>
<p>
  Four route handlers under <code>app/api/</code> run as functions on request. <code>/api/tts</code>
  turns chapter text into speech for the Listen button. <code>/api/weather</code> asks Open-Meteo for the
  temperature in the sidebar clock. <code>/api/joke</code> fetches one programming joke for the progress
  page. <code>/api/client-error</code> writes browser errors to the function log when Sentry is not
  configured. Each one has a per-IP rate limit, held in memory in the function instance, and none of them
  is on the path of reading a chapter or running code. If all four went down, the site would lose a
  voice, a temperature and a joke.
</p>

<h3>What this chapter set covers</h3>
<p>
  The beginner tier is orientation: this overview, <a href="/architecture/arch-tech-stack">the stack</a>,
  <a href="/architecture/arch-repo-map">the repository</a>,
  <a href="/architecture/arch-content-model">the content model</a>,
  <a href="/architecture/arch-coming-soon">what is written and what is not</a>, and
  <a href="/architecture/arch-routes">every route</a>. After that come the chapters on how it runs: the
  request path, the build, rendering, state, the playground, the endpoints and search, plus
  <a href="/architecture/arch-runtimes">the in-browser runtimes</a>,
  <a href="/architecture/arch-grading">how a solution in another language is graded</a>,
  <a href="/architecture/arch-debugger">the step-through debugger</a>,
  <a href="/architecture/arch-whiteboard">the whiteboard</a>,
  <a href="/architecture/arch-mock">the mock interview engine</a>,
  <a href="/architecture/arch-design-system">the design system</a> and
  <a href="/architecture/arch-delivery">how a change reaches production</a>. The last tier is how it holds
  up: performance, security, the tests, the health of the project, what breaks first, and what is
  deliberately missing.
</p>

<div class="bx is-ref">
<span class="ttl">Every number here was measured, and a test keeps it honest</span>
<p>
  Nothing on these pages is an estimate. Counts come from the data itself, the route count from the
  build's own manifest, and line counts from the tracked files. Several of the numbers in these chapters
  are also checked by <code>tests/claims.test.ts</code>, which recomputes them from
  <code>lib/content.ts</code> and fails if the prose has drifted, so adding a chapter without updating
  the claims here breaks <code>npm test</code>. Where a number is unflattering it is still the number.
</p>
</div>`,
};
