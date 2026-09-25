import type { Chapter } from "../types";

export const archBuild: Chapter = {
  id: "arch-build",
  num: "I2",
  title: "How 1,742 files get made",
  short: "The build",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle:
    "One source of truth, one pass, and every page, index, test case and preview image is derived from it in about thirty seconds.",
  body: `<h3>The pipeline</h3>

<figure>
<svg viewBox="0 0 900 420" class="dg" role="img" aria-label="Content TypeScript files feed lib/content.ts. From there the static generation step produces 1,149 pages, 538 test-case files recorded in node:vm, 21 search indexes, and the sitemap with nine Open Graph images. A prebuild step runs first and writes public/wasm. Static generation takes 21.5 of the build's 29.6 seconds.">
<g class="rough">
<rect x="20" y="150" width="150" height="90" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
<rect x="210" y="160" width="160" height="70" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
<rect x="430" y="20" width="260" height="62" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.8" />
<rect x="430" y="104" width="260" height="62" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.8" />
<rect x="430" y="188" width="260" height="62" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.8" />
<rect x="430" y="272" width="260" height="62" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.8" />
<rect x="720" y="150" width="165" height="90" rx="10" style="fill: var(--dg-box-yellow); stroke: var(--dg-yellow-stroke); stroke-width: 2" />
<rect x="20" y="330" width="350" height="72" rx="10" style="fill: var(--sheet-2); stroke: var(--line-soft); stroke-width: 2" />
<path class="ln" d="M170 195 H204" marker-end="url(#arrow)" />
<path class="ln" d="M370 185 C400 185 400 51 424 51" marker-end="url(#arrow)" />
<path class="ln" d="M370 192 C404 192 404 135 424 135" marker-end="url(#arrow)" />
<path class="ln" d="M370 200 C404 200 404 219 424 219" marker-end="url(#arrow)" />
<path class="ln" d="M370 208 C400 208 400 303 424 303" marker-end="url(#arrow)" />
</g>
<text class="lbl" x="95" y="186" text-anchor="middle">content/</text>
<text class="sm" x="95" y="208" text-anchor="middle">a file per chapter,</text>
<text class="sm" x="95" y="226" text-anchor="middle">a barrel per topic</text>
<text class="lbl gr" x="290" y="192" text-anchor="middle">lib/content.ts</text>
<text class="sm" x="290" y="214" text-anchor="middle">the only reader</text>
<text class="lbl" x="560" y="46" text-anchor="middle">1,149 pages</text>
<text class="sm" x="560" y="68" text-anchor="middle">generateStaticParams, 24 files</text>
<text class="lbl" x="560" y="130" text-anchor="middle">538 test-case files</text>
<text class="sm" x="560" y="152" text-anchor="middle">recordPolyglot inside node:vm</text>
<text class="lbl" x="560" y="214" text-anchor="middle">21 search indexes</text>
<text class="sm" x="560" y="236" text-anchor="middle">20 topics plus one global</text>
<text class="lbl" x="560" y="298" text-anchor="middle">Sitemap, 9 OG images</text>
<text class="sm" x="560" y="320" text-anchor="middle">755 URLs; 1200 by 630 PNG</text>
<text class="lbl" x="802" y="184" text-anchor="middle">Static generation</text>
<text class="sm" x="802" y="206" text-anchor="middle">21.5 s of the</text>
<text class="sm" x="802" y="224" text-anchor="middle">29.6 s build</text>
<text class="sm" x="36" y="354">RUNS FIRST: prebuild</text>
<text class="sm" x="36" y="376">copy-wasm-assets.mjs, build-react-sandbox.mjs</text>
<text class="sm" x="36" y="394">write public/wasm/, which git ignores</text>
</svg>
<figcaption>
  The interface in the middle does most of the work. Add a chapter file to a topic's barrel and its
  route, search entry, sitemap line and reading time all appear without any other change.
</figcaption>
</figure>

<h3>The steps, in order</h3>
<ol>
<li><b>prebuild.</b> <code>scripts/copy-wasm-assets.mjs</code> copies the 46 TypeScript declaration files listed in <code>lib/tsLibFiles.json</code> into <code>public/wasm/typescript-lib/</code>. The editor's type checker needs them. Then <code>scripts/build-react-sandbox.mjs</code> uses esbuild to bundle <code>lib/reactSandbox/runtime.ts</code> into a minified ES2020 script, <code>public/wasm/react-sandbox.js</code>, which is 205 KB. The React exercises run inside it.</li>
<li><b>Compile.</b> Turbopack bundles the app. In the last production build's trace this took 2.2 seconds.</li>
<li><b>Type check.</b> <code>tsc</code> runs inside <code>next build</code> and took 2.8 seconds. In CI, <code>npx next typegen</code> runs first, because the global <code>PageProps</code> and <code>LayoutProps</code> helper types have to exist on disk before a separate <code>tsc --noEmit</code> can check <code>app/</code>.</li>
<li><b>Static generation.</b> Every <code>generateStaticParams</code> is called, and every page, route handler and metadata file is rendered to disk. This took 21.5 seconds.</li>
</ol>
<p>
  The whole <code>next-build</code> span in <code>.next/trace-build</code> was 29.6 seconds. About
  seventy percent of it is the step that grows with the content.
</p>

<h3>Where the routes come from</h3>
<p>
  24 files under <code>app/</code> export <code>generateStaticParams</code>. The 20 topic
  <code>[chapter]</code> routes call <code>topicChapterParams(topicId)</code> in
  <code>components/reader/topicPages.tsx</code>, which returns every chapter in the topic, including
  outlines. An outline still gets a page, the "not written yet" sheet with its plan, but its
  metadata sets <code>index: false</code>. Crawlers can follow its links, but it stays out of search
  results. <code>/problems/[slug]</code> and <code>/problems/[slug]/cases</code> both map over
  <code>exercises()</code>, and <code>/level/[topic]</code> maps over topics that have levels.
</p>
<p>
  Nothing reads the content directly except <code>lib/content.ts</code>, which is also where derived
  fields come from. The reading time shown on every chapter is computed there: tags are stripped,
  the words are counted and divided by 180, and the result is rounded with a minimum of two
  minutes.
</p>

<h3>Recording test cases for other languages</h3>
<p>
  The most unusual build step is <code>lib/polyglot/record.ts</code>. Every exercise ships a
  JavaScript reference solution and JavaScript tests. The playground can also grade Python, Ruby,
  PHP, Lua, C and C++. Rather than hand-write tests in six more languages, the build
  <em>records</em> what the JavaScript does:
</p>
<ul>
<li>It finds the solution's top-level function and its parameter names with a regular expression. Anything else is declined with a reason.</li>
<li>It keeps only tests made entirely of direct <code>assert.equal</code>, <code>strictEqual</code>, <code>deepEqual</code> or <code>deepStrictEqual</code> calls on that function, plus <code>const</code> set-up lines.</li>
<li>It runs the solution and each test inside <code>vm.runInNewContext</code> with a two-second timeout. The function is wrapped so that every call logs a deep copy of its arguments and its return value.</li>
<li>Recorded values have to be plain: numbers, strings, booleans and nested arrays. From those it infers a signature, <code>int</code>, <code>float</code>, <code>bool</code>, <code>string</code> or <code>list</code> of one of them, and it gives up if an argument changes type between calls.</li>
</ul>
<p>
  <code>app/problems/[slug]/cases/route.ts</code> is <code>force-static</code>, so this runs 538
  times during the build and never in production. Of those, 222 exercises came out gradable in other
  languages, with 1,439 tests and 2,048 recorded cases, and 395 tests were skipped as not replayable.
  The other 316 carry a reason the page shows instead:
</p>
<div class="table-scroll"><table>
<thead><tr><th>Why it stays JavaScript-only</th><th>Exercises</th></tr></thead>
<tbody>
<tr><td>A React component</td><td>99</td></tr>
<tr><td>Tests check properties of the answer, not an exact value</td><td>84</td></tr>
<tr><td>Works on JavaScript objects</td><td>61</td></tr>
<tr><td>About JavaScript itself (no top-level function)</td><td>27</td></tr>
<tr><td>Parameters with destructuring or rest syntax</td><td>17</td></tr>
<tr><td>About the async model</td><td>11</td></tr>
<tr><td>Arguments change type between calls</td><td>11</td></tr>
<tr><td>Tests observe something besides the return value</td><td>6</td></tr>
</tbody>
</table></div>
<p>
  The cost is size. Most case files are a one-line refusal, and the median is 97 bytes. But
  recording keeps every call, including the recursive and repeated calls a test makes, so the
  largest file, <code>ex-maximal-square</code>, is 1,002,059 bytes. Together they come to 4.2 MB.
  A reader only downloads one after switching that problem to another language.
</p>

<h3>Indexes, sitemap and preview images</h3>
<p>
  The 21 search indexes are <code>force-static</code> route handlers too. The
  <a href="/architecture/arch-search">search chapter</a> covers what goes in them.
  <code>app/sitemap.ts</code> reads the same interface and lists 755 URLs: 538 problem pages, 201
  written chapters, 5 level pages, and 11 top-level pages. Outlines are left out. Every entry's
  <code>lastModified</code> is the moment of the build, so each deploy tells crawlers that
  everything changed. That is not true, but it costs little. <code>app/robots.ts</code> disallows
  <code>/api/</code> and points at the sitemap.
</p>
<p>
  Nine <code>opengraph-image.tsx</code> files draw 1200 by 630 PNG cards with <code>next/og</code>'s
  <code>ImageResponse</code>, through <code>ogCard</code> in <code>lib/og.tsx</code>. The topic cards
  count their written chapters and exercises at build time, so the chips on a shared link cannot go
  stale. Each PNG is between 37 and 58 KB, and all of them are prerendered.
</p>

<h3>What next.config.ts does, and does not, do</h3>
<p>
  It sets headers and redirects, and nothing else: no <code>images</code> block, no experimental
  flags, no webpack changes. The CSP inside it is assembled from two helpers. One is
  <code>wasmOrigins()</code> from <code>lib/wasmAssets.ts</code>. The other is
  <code>sentryOrigin()</code>, which adds nothing unless a DSN is set.
</p>
<p>
  <code>lib/wasmAssets.ts</code> is where every runtime version is pinned: Pyodide 314.0.6, sql.js
  1.14.2, wasmoon 1.16.0 for Lua, Ruby WASI 2.10.1, php-wasm 0.1.0, clang 22.0.0-git20542-10 and the
  WASI shim 0.4.2. By default they are all loaded from <code>cdn.jsdelivr.net</code>. The prebuild
  script can copy Pyodide and sql.js into <code>public/wasm/</code> with <code>--all</code>, and
  three environment variables can point the loaders there, but the default build does neither.
  <code>tests/wasm-assets.test.ts</code> fails if the pinned Pyodide or sql.js version stops
  matching the installed package, or if a base URL loses its trailing slash.
</p>

<h3>What the build leaves behind</h3>
<div class="table-scroll"><table>
<thead><tr><th>Output</th><th>Count</th><th>Served how</th></tr></thead>
<tbody>
<tr><td>Pages (HTML and RSC)</td><td>1,149</td><td>Static, never revalidated</td></tr>
<tr><td>Static route handlers</td><td>571</td><td>Static JSON</td></tr>
<tr><td>Metadata routes</td><td>14</td><td>Static</td></tr>
<tr><td>JavaScript chunks</td><td>81</td><td>Hashed, under <code>/_next/static</code></td></tr>
<tr><td>Functions</td><td>4 under <code>/api</code>, plus on-demand rendering for unknown slugs</td><td>Per request</td></tr>
</tbody>
</table></div>
<p class="sub">
  The prerendered HTML alone comes to 63.3 MB. <code>.next/server/app</code>, with the RSC payloads
  and route bodies, is 198 MB on disk.
</p>

<div class="bx is-prim">
<span class="ttl">Build time is not the constraint</span>
<p>
  Static generation is the only step that grows with the content, and it renders about 80 files a
  second. Writing the 358 outlined chapters would not add a single route, because every outline already
  has its page; it would only make those pages longer. The build would get slower by seconds, not
  minutes. Deploy storage is a more
  likely limit: each deployment is large enough that a scheduled workflow prunes old ones.
</p>
</div>`,
};
