import type { Chapter } from "../types";

export const archHealth: Chapter = {
  id: "arch-health",
  num: "A5",
  title: "Current health: what is actually wrong",
  short: "Current health",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle:
    "The checks pass. The debt is in a stuck framework version, a few very large files, repeated code, and documents that have drifted from the code.",
  body: `<h3>What passes</h3>
<div class="table-scroll"><table>
<thead><tr><th>Check</th><th>Result, latest CI run on <code>main</code></th></tr></thead>
<tbody>
<tr><td>TypeScript, ESLint, Prettier, cspell</td><td><span class="chip tone-yes">clean</span></td></tr>
<tr><td>Vitest</td><td><span class="chip tone-yes">166 of 166</span></td></tr>
<tr><td>Build</td><td><span class="chip tone-yes">1,746 static pages</span></td></tr>
<tr><td>Playwright, smoke and accessibility</td><td><span class="chip tone-yes">74 of 74</span></td></tr>
<tr><td>Lighthouse budgets, 3 URLs, 3 runs each</td><td><span class="chip tone-yes">pass</span></td></tr>
<tr><td><code>TODO</code>, <code>FIXME</code>, <code>HACK</code> in source</td><td><span class="chip tone-yes">0</span></td></tr>
<tr><td><code>npm audit</code>, production dependencies</td><td><span class="chip tone-bad">1 critical, 1 high</span></td></tr>
</tbody>
</table></div>
<p>
  The zero on the TODO row needs a footnote. This codebase has no comments at all, and a pre-push
  hook enforces that, so there is nowhere in the code for a TODO to live. A zero here does not mean
  there is no debt. It means the debt has to be written down somewhere else, and this chapter is
  that place.
</p>

<h3>1. The framework version is stuck, and it matters</h3>
<p>
  <code>npm audit --omit=dev</code> reports two things:
</p>
<ul>
<li><strong>Next 16.3.0, critical.</strong> Advisories cover Next 16.0.0 to 16.3.2: remote code execution on Windows-hosted servers, and remote code execution in the Image Optimization API when AVIF files are used. The newest release is 16.3.6.</li>
<li><strong><code>sharp</code>, high.</strong> Vulnerabilities in <code>libheif</code>. The full audit, dev tools included, adds a high advisory against <code>js-yaml</code>.</li>
</ul>
<p>
  The exposure here is probably narrow. The site imports <code>next/image</code> nowhere and does
  not run on Windows. But "probably not exploitable here" is a reason to be calm, not a reason to
  stay on the version.
</p>
<p>
  The reason it has not moved is on the record. Dependabot opened a grouped Next update. Its CI run
  failed Lighthouse on one slow sample: 0.91, with 245 ms of blocking time, on a page that measures
  100 and 0 ms locally. It was closed with the others. <strong>All 13 Dependabot pull requests so
  far have been closed, and none merged.</strong> Lighthouse now takes three samples, so the same
  update deserves another run.
</p>
<p>
  Two other updates cannot land without a hand:
</p>
<ul>
<li><strong>Pyodide</strong> fails a unit test until the version typed into <code>lib/wasmAssets.ts</code> is changed to match.</li>
<li><strong>The dev-tooling group</strong> fails at install, because <code>esbuild</code> is pinned to exactly 0.25.12 and a newer Vite wants more.</li>
</ul>

<h3>2. A few files carry most of the weight</h3>
<p>
  Line counts from <code>wc -l</code>, for source outside <code>content/</code> and for the two
  largest content files:
</p>

<figure>
<svg viewBox="0 0 900 350" class="dg" role="img" aria-label="Bar chart of the largest files by line count: globals.css 9,319; content/topics.ts 4,294; content/interview-data.ts 4,237; mock.module.css 2,187; Board.tsx 1,851; PracticeWorkspace.tsx 1,735; whiteboard.module.css 1,572; CodeEditor.tsx 1,112.">
<g class="rough">
<rect x="245" y="24" width="560" height="22" rx="4" style="fill: var(--dg-box-red); stroke: var(--red); stroke-width: 1.6" />
<rect x="245" y="62" width="258" height="22" rx="4" style="fill: var(--dg-box-yellow); stroke: var(--dg-yellow-stroke); stroke-width: 1.6" />
<rect x="245" y="100" width="255" height="22" rx="4" style="fill: var(--dg-box-yellow); stroke: var(--dg-yellow-stroke); stroke-width: 1.6" />
<rect x="245" y="138" width="131" height="22" rx="4" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.6" />
<rect x="245" y="176" width="111" height="22" rx="4" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.6" />
<rect x="245" y="214" width="104" height="22" rx="4" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.6" />
<rect x="245" y="252" width="94" height="22" rx="4" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.6" />
<rect x="245" y="290" width="67" height="22" rx="4" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.6" />
<path class="ln" d="M245 16 V320" />
</g>
<text class="lbl" x="232" y="41" text-anchor="end">app/globals.css</text>
<text class="lbl" x="232" y="79" text-anchor="end">content/topics.ts</text>
<text class="lbl" x="232" y="117" text-anchor="end">content/interview-data.ts</text>
<text class="lbl" x="232" y="155" text-anchor="end">mock.module.css</text>
<text class="lbl" x="232" y="193" text-anchor="end">whiteboard/Board.tsx</text>
<text class="lbl" x="232" y="231" text-anchor="end">PracticeWorkspace.tsx</text>
<text class="lbl" x="232" y="269" text-anchor="end">whiteboard.module.css</text>
<text class="lbl" x="232" y="307" text-anchor="end">CodeEditor.tsx</text>
<text class="sm" x="815" y="40">9,319</text>
<text class="sm" x="513" y="78">4,294</text>
<text class="sm" x="510" y="116">4,237</text>
<text class="sm" x="386" y="154">2,187</text>
<text class="sm" x="366" y="192">1,851</text>
<text class="sm" x="359" y="230">1,735</text>
<text class="sm" x="349" y="268">1,572</text>
<text class="sm" x="322" y="306">1,112</text>
<text class="sm" x="245" y="340">lines, one bar length per line count</text>
</svg>
<figcaption>
  One stylesheet is longer than the next two files together. The two yellow bars are content,
  which is expected to be long. The rest are components and their styles.
</figcaption>
</figure>

<p>
  <strong><code>app/globals.css</code>, 9,319 lines</strong>, is the largest single piece of debt.
  The newer parts of the site (the mock interview, the whiteboard and the problems page) use CSS
  modules, and the older reader and playground styles still live in the global sheet. Every page
  downloads all of it, and nothing tells you which rules are dead.
</p>
<p>
  <strong>The three big components</strong> each hold a whole feature in one file:
</p>
<div class="table-scroll"><table>
<thead><tr><th>Component</th><th>Lines</th><th><code>useState</code></th><th><code>useEffect</code></th><th><code>useRef</code></th></tr></thead>
<tbody>
<tr><td><code>app/whiteboard/Board.tsx</code></td><td>1,851</td><td>24</td><td>15</td><td>24</td></tr>
<tr><td><code>components/practice/PracticeWorkspace.tsx</code></td><td>1,735</td><td>26</td><td>8</td><td>12</td></tr>
<tr><td><code>components/practice/CodeEditor.tsx</code></td><td>1,112</td><td>22</td><td>8</td><td>13</td></tr>
</tbody>
</table></div>
<p>
  None of them has a unit test. Only the Playwright suites cover them, which catch breakage but
  make a refactor slow to verify. The pure parts have already been pulled out and are
  tested: <code>lib/whiteboard/model.ts</code> is 659 lines under 17 tests. The next useful split is
  the same move for the playground's file and run state.
</p>

<h3>3. Duplication</h3>
<ul>
<li><strong>Three runners, one pattern.</strong> <code>lib/runner.ts</code>, <code>lib/pythonRunner.ts</code> and <code>lib/scriptRunner.ts</code> each keep their own module-level worker, their own <code>getWorker</code> and <code>discardWorker</code>, and their own timeout-and-terminate logic. The default timeouts disagree: 5 seconds for JavaScript, 20 for everything else. A fix to one does not reach the others.</li>
<li><strong>The accessibility check is written twice</strong> in <code>e2e/a11y.spec.ts</code>, with the same tags and the same disabled rule, once for the page loop and once for the mock room.</li>
<li><strong>Two share formats, two validators.</strong> The playground and the whiteboard share <code>lib/compress.ts</code>, but each validates its own payload. That one is reasonable, because the shapes differ. It is listed so it stays a choice rather than an accident.</li>
</ul>

<h3>4. Drift between the documents and the code</h3>
<p>
  The code moved faster than what was written about it. Each row below was checked against the
  repository today.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Where</th><th>Says</th><th>Is</th></tr></thead>
<tbody>
<tr><td><code>docs/ROADMAP.md</code></td><td>602 prerendered pages</td><td>1,746 static pages in the latest build</td></tr>
<tr><td><code>docs/ROADMAP.md</code>, section 6</td><td>A weekly cleanup keeping 5 and 5, with 24 hours of grace</td><td>Daily, keeping 3 and 2, with 6 hours</td></tr>
<tr><td><code>docs/ROADMAP.md</code>, section 6</td><td><code>public/wasm/</code> is 18 MB</td><td>1.4 MB; the runtimes come from jsDelivr</td></tr>
<tr><td><code>docs/ROADMAP.md</code>, section 7</td><td>No error service; <code>/git</code> shows crawlers 42 characters</td><td>Sentry is wired behind a DSN; <code>/git</code> renders its body on the server</td></tr>
<tr><td><code>scripts/vercel-cleanup.mjs</code></td><td>Defaults of 5, 5 and 24 hours</td><td>The workflow overrides them with 3, 2 and 6</td></tr>
<tr><td><code>lib/wasmAssets.ts</code></td><td>Six runtime versions typed in by hand</td><td>Only Pyodide and sql.js are checked against <code>package.json</code>. wasmoon, Ruby, php-wasm and Clang are not dependencies, so Dependabot never sees them</td></tr>
<tr><td><code>lib/fonts.ts</code></td><td>Kalam at weights 300, 400 and 700</td><td>The roadmap flagged the 300 weight as barely used; it still ships</td></tr>
</tbody>
</table></div>
<p>
  The chapters of this topic had drifted the same way, and that is what the rewrite fixes. Only
  the figures that <code>tests/claims.test.ts</code> checks are protected from drifting again.
</p>

<h3>5. Known and accepted</h3>
<div class="table-scroll"><table>
<thead><tr><th>Issue</th><th>Severity</th><th>State</th></tr></thead>
<tbody>
<tr><td>SQL runs on the main thread with no timeout</td><td><span class="chip tone-warn">Real</span></td><td>A runaway query freezes the reader's own tab. Moving sql.js into a worker would fix it.</td></tr>
<tr><td>CI does not run the comment check</td><td><span class="chip tone-warn">Real</span></td><td>Only the pre-push hook does, and <code>--no-verify</code> skips it.</td></tr>
<tr><td>The heaviest pages have no Lighthouse budget</td><td><span class="chip tone-warn">Real</span></td><td><code>/practice</code> and the problem pages ship 422 KB of gzipped script and are not on the URL list.</td></tr>
<tr><td>The narrator depends on an unofficial service</td><td>Accepted</td><td><code>msedge-tts</code> was a known risk when it went in. It degrades to no narration, not to a broken page.</td></tr>
<tr><td>The policy allows inline scripts and <code>eval</code></td><td>Accepted</td><td>Needed by the theme script and the playground. Nothing a reader controls is rendered as HTML.</td></tr>
<tr><td>Progress lives in one browser</td><td>Accepted, for now</td><td>No accounts means no sync. See the roadmap chapter.</td></tr>
</tbody>
</table></div>

<h3>The one thing that looks broken and is not</h3>
<p>
  Run the site with <code>next start</code> and every page logs two 404s, for
  <code>/_vercel/insights/script.js</code> and <code>/_vercel/speed-insights/script.js</code>. Those
  files exist only on Vercel's edge. Locally there is nothing to serve, so the analytics do not run.
  The smoke tests filter exactly these URLs. It is worth knowing, because it is the kind of thing
  that gets "fixed" by deleting the analytics.
</p>

<div class="bx is-ref">
<span class="ttl">A bug worth remembering</span>
<p>
  Two diagrams once lost every arrow. The arrows sat in their own group, and that group had the
  hand-drawn filter applied. When every child of a group is a straight line along one axis, the
  group's bounding box has no height or no width. The filter region is derived from that box, so
  the whole group was clipped away. Arrows now share a group with the boxes, which always has an
  area. It was invisible in the source and obvious in a screenshot.
</p>
</div>`,
};
