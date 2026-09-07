import type { Chapter } from "../types";

export const archBuild: Chapter = {
  id: "arch-build",
  num: "I2",
  title: "How 559 pages get made",
  short: "The build",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle: "One step, one source of truth, and everything else is derived.",
  body: `<h3>The pipeline</h3>

<figure>
<svg viewBox="0 0 900 300" class="dg" role="img" aria-label="Content TypeScript files feed lib/content.ts, which feeds the static generation step, producing 559 HTML pages, twenty search indexes, and the sitemap.">
<g class="rough">
<rect x="24" y="106" width="176" height="88" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
<rect x="272" y="112" width="170" height="76" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
<rect x="516" y="24" width="200" height="62" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.8" />
<rect x="516" y="118" width="200" height="62" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.8" />
<rect x="516" y="212" width="200" height="62" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.8" />
<path class="ln" d="M200 150 H266" marker-end="url(#arrow)" />
<path class="ln" d="M442 140 C480 140 480 55 510 55" marker-end="url(#arrow)" />
<path class="ln" d="M442 150 H510" marker-end="url(#arrow)" />
<path class="ln" d="M442 160 C480 160 480 243 510 243" marker-end="url(#arrow)" />
</g>
<text class="lbl" x="112" y="140" text-anchor="middle">content/</text>
<text class="sm" x="112" y="162" text-anchor="middle">per-chapter files,</text>
<text class="sm" x="112" y="180" text-anchor="middle">barrels per topic</text>
<text class="lbl gr" x="357" y="144" text-anchor="middle">lib/content.ts</text>
<text class="sm" x="357" y="166" text-anchor="middle">the only reader</text>
<text class="lbl" x="616" y="50" text-anchor="middle">559 HTML pages</text>
<text class="sm" x="616" y="70" text-anchor="middle">generateStaticParams</text>
<text class="lbl" x="616" y="144" text-anchor="middle">20 search indexes</text>
<text class="sm" x="616" y="164" text-anchor="middle">one JSON per topic</text>
<text class="lbl" x="616" y="238" text-anchor="middle">sitemap + robots</text>
<text class="sm" x="616" y="258" text-anchor="middle">written topics only</text>
<text class="sm" x="760" y="144">whole build:</text>
<text class="sm" x="760" y="164">12.5 seconds</text>
</svg>
<figcaption>
  One interface in the middle is the whole trick. Add a chapter file and the routes, the search
  index, the sitemap entry and the reading-time estimate all appear without being told to.
</figcaption>
</figure>

<h3>The steps, in order</h3>
<ol>
<li><b>prebuild</b> — <code>scripts/copy-wasm-assets.mjs</code> copies Pyodide, sql.js and the TypeScript lib files out of <code>node_modules</code> into <code>public/wasm/</code>.</li>
<li><b>Route discovery</b> — each topic's <code>[chapter]</code> route exports <code>generateStaticParams</code>, which asks <code>lib/content.ts</code> for that topic's chapter ids.</li>
<li><b>Rendering</b> — every page in that list is rendered to HTML and to an RSC payload.</li>
<li><b>Route handlers</b> — the twenty search indexes are <code>force-static</code> route handlers, so they are written to disk at this point rather than served by a function.</li>
<li><b>Metadata</b> — the sitemap is generated from the same content interface and includes only topics that have written chapters.</li>
</ol>

<h3>What the build produces</h3>
<div class="table-scroll"><table>
<thead><tr><th>Output</th><th>Count</th><th>Served how</th></tr></thead>
<tbody>
<tr><td>Static pages</td><td>559</td><td>From the CDN, cached by path</td></tr>
<tr><td>Search indexes</td><td>20 JSON files</td><td>Static, fetched lazily on the first keystroke</td></tr>
<tr><td>API routes</td><td>4</td><td>Functions, invoked per request</td></tr>
<tr><td>Sitemap and robots</td><td>2</td><td>Static</td></tr>
</tbody>
</table></div>

<h3>Reading time is computed, not written</h3>
<p>
  Every chapter shows an estimate. Nobody types it: <code>lib/content.ts</code> strips the HTML from
  the body, counts the words, divides by 180 and takes a floor of two minutes. It updates itself
  whenever the chapter is edited, which is the whole reason it is derived rather than stored.
</p>

<div class="bx is-prim">
<span class="ttl">Twelve seconds is the budget, not the ceiling</span>
<p>
  Rendering 559 pages from 3 MB of content takes about 12.5 seconds. Writing the 399 outlined
  chapters would roughly quadruple the corpus and the build would still be well under a minute.
  Build time is not what limits this site.
</p>
</div>`,
};
