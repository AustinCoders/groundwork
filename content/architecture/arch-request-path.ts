import type { Chapter } from "../types";

export const archRequestPath: Chapter = {
  id: "arch-request-path",
  num: "I1",
  title: "What happens when you open a page",
  short: "Opening a page",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle:
    "Every page and every JSON file is already a file when you ask for it. Four handlers under /api are the only code that runs per request, plus one quiet exception.",
  body: `<h3>Four kinds of request</h3>
<p>
  A request to this site ends up in one of four places. Most go to a file that the build already
  wrote. A few go to a function. One awkward case goes to a function when it should not. And the
  playground's language runtimes come from somewhere else entirely: the browser fetches them from a
  public CDN, not from this site.
</p>

<figure>
<svg viewBox="0 0 900 400" class="dg" role="img" aria-label="The browser sends a request to the Vercel edge, which applies headers and redirects. From there it goes to a prerendered static file, to an on-demand render for an unknown chapter or problem slug, or to one of four functions under /api which call upstream services. Separately, the browser loads language runtimes straight from jsDelivr.">
<g class="rough">
<rect x="20" y="160" width="130" height="70" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
<rect x="190" y="150" width="170" height="90" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
<rect x="420" y="20" width="250" height="66" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
<rect x="420" y="112" width="250" height="66" rx="10" style="fill: var(--dg-box-yellow); stroke: var(--dg-yellow-stroke); stroke-width: 2" />
<rect x="420" y="204" width="250" height="66" rx="10" style="fill: var(--dg-box-red); stroke: var(--red); stroke-width: 2" />
<rect x="700" y="200" width="190" height="74" rx="10" style="fill: var(--sheet-2); stroke: var(--red); stroke-width: 1.6" />
<rect x="20" y="310" width="340" height="70" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.6" />
<path class="ln" d="M150 195 H184" marker-end="url(#arrow)" />
<path class="ln" d="M360 180 C392 180 392 53 414 53" marker-end="url(#arrow-green)" style="stroke: var(--green)" />
<path class="ln" d="M360 195 C392 195 392 145 414 145" marker-end="url(#arrow)" />
<path class="ln" d="M360 210 C392 210 392 237 414 237" marker-end="url(#arrow-red)" style="stroke: var(--red)" />
<path class="ln" d="M670 237 H694" marker-end="url(#arrow-red)" style="stroke: var(--red)" />
<path class="ln" d="M85 230 V304" marker-end="url(#arrow)" />
</g>
<text class="lbl" x="85" y="190" text-anchor="middle">Browser</text>
<text class="sm" x="85" y="212" text-anchor="middle">one request</text>
<text class="lbl" x="275" y="182" text-anchor="middle">Vercel edge</text>
<text class="sm" x="275" y="204" text-anchor="middle">security headers,</text>
<text class="sm" x="275" y="222" text-anchor="middle">legacy-host redirect</text>
<text class="lbl gr" x="545" y="48" text-anchor="middle">Prerendered file</text>
<text class="sm" x="545" y="70" text-anchor="middle">1,742 outputs, never revalidated</text>
<text class="lbl" x="545" y="140" text-anchor="middle">On-demand render</text>
<text class="sm" x="545" y="162" text-anchor="middle">an unknown chapter or problem slug</text>
<text class="lbl rd" x="545" y="232" text-anchor="middle">Function</text>
<text class="sm" x="545" y="254" text-anchor="middle">four route handlers under /api</text>
<text class="lbl" x="795" y="226" text-anchor="middle">Upstream</text>
<text class="sm" x="795" y="246" text-anchor="middle">Edge voices, Open-Meteo,</text>
<text class="sm" x="795" y="264" text-anchor="middle">JokeAPI</text>
<text class="lbl" x="190" y="340" text-anchor="middle">cdn.jsdelivr.net</text>
<text class="sm" x="190" y="362" text-anchor="middle">Pyodide, sql.js, Lua, Ruby, PHP, clang</text>
<text class="sm" x="96" y="286">only in the playground</text>
</svg>
<figcaption>
  The green path is what nearly every request takes. The yellow one is a gap in the configuration,
  covered below. Nothing in the bottom box ever passes through this site's servers.
</figcaption>
</figure>

<h3>Before anything is served</h3>
<p>
  There is no <code>middleware.ts</code> and no <code>proxy.ts</code> in the repository, so no code
  runs in front of the routes. What happens at the edge is set in <code>next.config.ts</code>, which
  the build turns into routing rules:
</p>
<ul>
<li><b>Headers on every path.</b> One rule, <code>/:path*</code>, attaches a Content-Security-Policy, <code>X-Frame-Options: DENY</code>, <code>nosniff</code>, a referrer policy and a permissions policy that only lets this site itself ask for geolocation. The CSP's <code>script-src</code> and <code>connect-src</code> lists are built from <code>lib/wasmAssets.ts</code>, so they allow the jsDelivr origin and nothing else.</li>
<li><b>One redirect.</b> Requests for the old <code>groundwork-ivory-beta.vercel.app</code> host get a permanent redirect to <code>groundwork.austincoders.com</code>, with the path kept.</li>
</ul>
<p>
  Rate limiting in front of <code>/api/</code> is a Vercel Firewall rule. Its threshold is set in
  the Vercel dashboard and deliberately kept out of this public repository, so this chapter cannot
  quote it.
</p>

<h3>The common case: a file</h3>
<p>
  The last production build wrote 1,742 entries into <code>.next/prerender-manifest.json</code>,
  and every one has <code>initialRevalidateSeconds: false</code>. Nothing is on a timer and nothing
  is regenerated in the background. A file changes only when a deploy replaces it.
</p>
<div class="table-scroll"><table>
<thead><tr><th>What</th><th>Count</th><th>Made by</th></tr></thead>
<tbody>
<tr><td>Pages, as HTML plus an RSC payload</td><td>1,149</td><td><code>page.tsx</code> and <code>generateStaticParams</code></td></tr>
<tr><td>Test cases for other languages</td><td>538</td><td><code>app/problems/[slug]/cases/route.ts</code></td></tr>
<tr><td>Search indexes</td><td>21</td><td>20 per-topic routes plus one global route</td></tr>
<tr><td>Mock interview question banks</td><td>12</td><td><code>app/mock/bank/[stage]/route.ts</code>, one per stage</td></tr>
<tr><td>Metadata files</td><td>14</td><td>9 Open Graph images, sitemap, robots, manifest, two icons</td></tr>
</tbody>
</table></div>
<p>
  On top of those sit the 81 hashed JavaScript chunks under <code>/_next/static</code>, and
  <code>public/wasm/</code>, which holds 46 TypeScript <code>lib.*.d.ts</code> files and a 205 KB
  React sandbox bundle. Both are written by the <code>prebuild</code> script.
</p>

<h3>What a page weighs</h3>
<p>
  Sizes from that same build. HTML is uncompressed, as the manifest records it. JavaScript is the
  first-load set from <code>.next/diagnostics/route-bundle-stats.json</code>, with gzip measured
  on the actual chunk files.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Route</th><th>HTML</th><th>First-load JS</th></tr></thead>
<tbody>
<tr><td>Home</td><td>60 KB</td><td>660 KB, 202 KB gzip, 13 files</td></tr>
<tr><td>A chapter page</td><td>50 to 222 KB; the JavaScript topic averages 106 KB</td><td>681 KB, 210 KB gzip, 14 files</td></tr>
<tr><td>A problem page</td><td>39 to 50 KB</td><td>1,182 KB, 373 KB gzip, 18 files</td></tr>
<tr><td><code>/practice</code></td><td>27 KB</td><td>1,182 KB, 373 KB gzip, 18 files</td></tr>
<tr><td><code>/whiteboard</code></td><td>27 KB</td><td>636 KB, 196 KB gzip, 13 files</td></tr>
<tr><td><code>/problems</code></td><td>276 KB</td><td>681 KB, 210 KB gzip, 13 files</td></tr>
</tbody>
</table></div>
<p>
  Two rows need explaining. <code>/practice</code> has so little HTML because
  <code>PracticeClient</code> reads <code>useSearchParams()</code> inside a
  <code>&lt;Suspense fallback={null}&gt;</code>. During prerendering, everything below that boundary
  is left for the browser to render, so the page ships an empty frame. The whiteboard is small for
  a different reason: its canvas is loaded with <code>ssr: false</code> and is not in the first load
  at all.
</p>

<h3>Moving between pages</h3>
<p>
  After the first page, a click on a link does not fetch HTML. The router fetches the target's
  <code>.rsc</code> payload, which is also a prerendered file. Nineteen chapter routes have a
  <code>loading.tsx</code> that shows <code>ChapterSkeleton</code> while it arrives. The root layout
  wraps every page in <code>RouteFade</code>, which fades in the new page on client navigations but
  not on the first load.
</p>

<h3>The quiet exception</h3>
<p>
  The chapter, problem and level routes all export <code>generateStaticParams</code>, but none of
  them sets <code>dynamicParams</code>, and the default is <code>true</code>. So a slug the build
  never saw, such as <code>/notes/not-a-chapter</code>, is not answered with a stored 404. It is
  handed to a function, which renders the page, and <code>TopicChapterPage</code> calls
  <code>notFound()</code>. The manifest shows this: these 22 dynamic routes are listed with
  <code>fallback: null</code>. The two route handlers do set <code>dynamicParams = false</code> and are
  listed with <code>fallback: false</code>, which gives a plain 404 without running anything.
</p>
<div class="bx is-ref">
<span class="ttl">A one-line fix nobody has made yet</span>
<p>
  Adding <code>export const dynamicParams = false</code> to the <code>[chapter]</code>,
  <code>[slug]</code> and <code>[topic]</code> pages would make a mistyped URL cost nothing. The risk
  is small: every valid slug comes from the same content arrays <code>generateStaticParams</code>
  reads. Until someone makes that change, the honest count of code paths that can run per request
  is five, not four.
</p>
</div>

<h3>What the browser fetches after load</h3>
<div class="table-scroll"><table>
<thead><tr><th>Request</th><th>When</th><th>Served as</th></tr></thead>
<tbody>
<tr><td><code>{topic}/search-index.json</code> and <code>/search-index.json</code></td><td>First character typed in the chapter search box</td><td>Static file</td></tr>
<tr><td><code>/problems/{id}/cases</code></td><td>Switching a problem to a language other than JavaScript or SQL, or starting the debugger</td><td>Static file</td></tr>
<tr><td><code>/mock/bank/{stage}</code></td><td>Pointing at or focusing the start button in the mock lobby, then starting; cached per stage in memory</td><td>Static file</td></tr>
<tr><td><code>/api/tts</code></td><td>Pressing Listen, once per chunk of up to 700 characters</td><td>Function, then CDN-cached</td></tr>
<tr><td><code>/api/weather</code></td><td>Tapping the sidebar clock and allowing location</td><td>Function</td></tr>
<tr><td><code>/api/joke</code></td><td>Opening <code>/progress</code></td><td>Function</td></tr>
<tr><td><code>/api/client-error</code></td><td>An uncaught error or rejection, at most five per page load, and only when no Sentry DSN is configured</td><td>Function</td></tr>
<tr><td>Runtimes on <code>cdn.jsdelivr.net</code></td><td>First run of Python, SQL, Lua, Ruby, PHP, C or C++</td><td>Someone else's CDN</td></tr>
</tbody>
</table></div>
<p>
  Each of the four functions is an extra on top of a page that already works without it. If one
  fails, the narrator does not start, the clock shows no temperature, a hardcoded joke appears, or
  an error is not logged. No chapter depends on any of them. The <a href="/architecture/arch-apis">APIs
  chapter</a> goes through each one in detail.
</p>`,
};
