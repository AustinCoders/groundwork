import type { Chapter } from "../types";

export const archOverview: Chapter = {
  id: "arch-overview",
  num: "B1",
  title: "What this site is",
  short: "What this is",
  levels: ["beginner"],
  practice: [],
  ready: true,
  subtitle: "One decision shaped everything else: this is a build artifact, not an application.",
  body: `<h3>The one-sentence version</h3>
<p>
  A reading site with a code playground attached, rendered to HTML at build time and served by a CDN.
  There is no database, no login, no session, and nothing kept alive between deploys. Four small
  server functions exist; everything else was written before you arrived.
</p>

<h3>The decision underneath</h3>
<p>
  Almost every choice on the following pages follows from one call made early: <strong>the content
  lives in the repository as TypeScript, and the whole site is rendered ahead of time</strong>. That
  is not the obvious choice for a site with 500-odd pages of prose, and it has a real cost — fixing a
  typo means a deploy.
</p>
<p>
  What it buys is that the interesting parts of this system are the parts that <em>do not run</em>. A
  page that was written at build time cannot time out, cannot exhaust a connection pool, and cannot
  return a 500 because something upstream is slow. The failure modes that dominate most web
  architectures were removed rather than handled.
</p>

<div class="table-scroll"><table>
<thead><tr><th>Measured today</th><th></th></tr></thead>
<tbody>
<tr><td>Prerendered pages</td><td>559</td></tr>
<tr><td>Server functions</td><td>4, all under <code>/api/</code></td></tr>
<tr><td>Databases</td><td>0</td></tr>
<tr><td>Topics</td><td>20 — 4 written, 15 outlined, 1 standalone</td></tr>
<tr><td>Written chapters</td><td>112, plus 399 outlines</td></tr>
<tr><td>Exercises with tests</td><td>299</td></tr>
<tr><td>Interview questions</td><td>405 across 27 rounds</td></tr>
<tr><td>Build time</td><td>about 12.5 seconds</td></tr>
</tbody>
</table></div>

<h3>The three layers</h3>

<figure>
<svg viewBox="0 0 900 348" class="dg" role="img" aria-label="Three layers: the reader's browser at the top, the Vercel edge in the middle, and the build output at the bottom. The edge answers every request; the build output is deployed into the edge.">
<g class="rough">
<rect x="30" y="16" width="840" height="72" rx="12" style="fill: var(--sheet-2); stroke: var(--line-soft); stroke-width: 2" />
<rect x="30" y="136" width="840" height="84" rx="12" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
<rect x="30" y="268" width="840" height="60" rx="12" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
<rect x="470" y="152" width="180" height="52" rx="9" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.6" />
<rect x="668" y="152" width="186" height="52" rx="9" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.6" />
<path class="ln" d="M300 136 V96" marker-end="url(#arrow)" />
<path class="ln" d="M300 268 V228" marker-end="url(#arrow)" />
</g>
<text class="sm" x="46" y="38">THE READER</text>
<text class="lbl" x="46" y="70">Browser &middot; HTML, one JS bundle, localStorage</text>
<text class="sm" x="46" y="158">VERCEL EDGE</text>
<text class="lbl" x="46" y="190">CDN cache + firewall</text>
<text class="sm" x="560" y="183" text-anchor="middle">559 static pages</text>
<text class="sm" x="761" y="183" text-anchor="middle">4 API functions</text>
<text class="sm" x="46" y="290">BUILT AHEAD OF TIME</text>
<text class="lbl" x="46" y="316">TypeScript content files &rarr; HTML, search indexes, sitemap</text>
<text class="sm" x="318" y="118">answers every request</text>
<text class="sm" x="318" y="252">deployed into the edge</text>
</svg>
<figcaption>
  Only the top two layers exist at request time. Everything in the green band happened before a
  reader arrived.
</figcaption>
</figure>

<h3>What this chapter set covers</h3>
<p>
  The beginner tier is orientation — the stack, the repository, the content model, and what is
  written versus what is still an outline. The intermediate tier is how it runs: the request path,
  the build, rendering, state, the playground, the endpoints and search. The advanced tier is how it
  holds up: performance, security, the tests, the current health of the project, what breaks first,
  and what is deliberately missing.
</p>

<div class="bx is-ref">
<span class="ttl">Every number here was measured</span>
<p>
  Nothing on these pages is an estimate. Page weights come from a headless browser against the
  running site, the build time from the build, the content counts from the data itself. Where a
  number is unflattering it is still the number.
</p>
</div>`,
};
