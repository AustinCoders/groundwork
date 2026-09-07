import type { Chapter } from "../types";

export const archRequestPath: Chapter = {
  id: "arch-request-path",
  num: "I1",
  title: "What happens when you open a page",
  short: "Opening a page",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle: "For a chapter page, nothing executes on a server at all.",
  body: `<h3>The path</h3>

<figure>
<svg viewBox="0 0 900 320" class="dg" role="img" aria-label="A request reaches the Vercel firewall. Page requests go to the CDN cache, which either returns cached HTML or fetches the prerendered file once. Requests under slash api take a separate path to a function, which calls an upstream service.">
<g class="rough">
<rect x="24" y="120" width="132" height="62" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
<rect x="238" y="120" width="130" height="62" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
<rect x="450" y="120" width="176" height="62" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
<rect x="450" y="24" width="176" height="60" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
<rect x="712" y="120" width="164" height="62" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
<rect x="450" y="232" width="176" height="62" rx="10" style="fill: var(--sheet); stroke: var(--red); stroke-width: 2" />
<rect x="712" y="232" width="164" height="62" rx="10" style="fill: var(--sheet-2); stroke: var(--red); stroke-width: 1.6" />
<path class="ln" d="M156 151 H232" marker-end="url(#arrow)" />
<path class="ln" d="M368 151 H444" marker-end="url(#arrow)" />
<path class="ln" d="M538 120 V90" marker-end="url(#arrow-green)" style="stroke: var(--green)" />
<path class="ln" d="M626 151 H706" marker-end="url(#arrow)" />
<path class="ln" d="M303 182 C303 236 380 263 444 263" marker-end="url(#arrow-red)" style="stroke: var(--red)" />
<path class="ln" d="M626 263 H706" marker-end="url(#arrow-red)" style="stroke: var(--red)" />
</g>
<text class="lbl" x="90" y="146" text-anchor="middle">Browser</text>
<text class="sm" x="90" y="168" text-anchor="middle">one request</text>
<text class="lbl" x="303" y="146" text-anchor="middle">Firewall</text>
<text class="sm" x="303" y="168" text-anchor="middle">100/min per IP</text>
<text class="lbl" x="538" y="146" text-anchor="middle">CDN cache</text>
<text class="sm" x="538" y="168" text-anchor="middle">keyed by path</text>
<text class="lbl gr" x="538" y="48" text-anchor="middle">Cache hit</text>
<text class="sm" x="538" y="70" text-anchor="middle">HTML straight back</text>
<text class="lbl" x="794" y="146" text-anchor="middle">Prerendered file</text>
<text class="sm" x="794" y="168" text-anchor="middle">written at build</text>
<text class="lbl rd" x="538" y="258" text-anchor="middle">Function</text>
<text class="sm" x="538" y="280" text-anchor="middle">only under /api/</text>
<text class="lbl" x="794" y="258" text-anchor="middle">Upstream</text>
<text class="sm" x="794" y="280" text-anchor="middle">TTS, weather, joke</text>
<text class="sm gr" x="550" y="106">hit</text>
<text class="sm" x="666" y="142" text-anchor="middle">miss, once</text>
<text class="sm rd" x="352" y="222">/api/ only</text>
</svg>
<figcaption>
  The green path is what almost every reader gets. A miss costs one fetch of a file that already
  exists — nothing is rendered on demand.
</figcaption>
</figure>

<h3>You can watch it happen</h3>
<p>
  A response from any page here carries <code>x-vercel-cache</code>. The first request for a path in
  a given region is a <code>MISS</code>, which fetches the prerendered file; every request after it
  in that region is a <code>HIT</code> served from the edge. There is no third case for a page route
  — no <code>STALE</code>, no revalidation, because the file only changes when a deploy replaces it.
</p>

<h3>Then hydration</h3>
<p>
  Once the HTML lands, React hydrates and the interactive parts wake up: the sidebar, the search box,
  the progress ticks, the narrator. That is where the JavaScript cost sits.
</p>

<div class="table-scroll"><table>
<thead><tr><th>Page</th><th>HTML</th><th>JavaScript (uncompressed)</th></tr></thead>
<tbody>
<tr><td>Home</td><td>58 KB</td><td>647 KB across 13 files</td></tr>
<tr><td>A chapter</td><td>~85 KB</td><td>653 KB across 13 files</td></tr>
<tr><td>The playground</td><td>~97 KB</td><td>~2.1 MB across 19 files</td></tr>
</tbody>
</table></div>

<p>
  Those numbers are the result of work rather than luck, and two of them used to be much worse. The
  sidebar's topic data was in every page's bundle; the home page prefetched the code editor it has no
  use for. Both are covered in <a href="/architecture/arch-performance">the performance chapter</a>.
</p>

<div class="bx is-ref">
<span class="ttl">Why every page route is static</span>
<p>
  The rule this project holds is that a page route is prerendered unless something makes that
  impossible. Three routes once broke it — the playground, the level picker and the coming-soon page
  were server-rendering on every visit because they read the query string during render. Moving that
  read to the client made all three static, and the difference at the edge is between a cache hit and
  a function invocation on every single visit.
</p>
</div>`,
};
