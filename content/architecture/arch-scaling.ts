import type { Chapter } from "../types";

export const archScaling: Chapter = {
  id: "arch-scaling",
  num: "A6",
  title: "What breaks first",
  short: "What breaks first",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle:
    "Traffic is the least of it. The limits that are close are a search index, a storage plan and a few files that grow with every exercise.",
  body: `<h3>Headroom, measured</h3>
<p>
  A design review earns its keep in the part that says where the design stops working. Here that
  question has numbers, because each pressure point has a limit and a current reading.
</p>

<figure>
<svg viewBox="0 0 900 320" class="dg" role="img" aria-label="Headroom against four limits. The JavaScript search index is at 89 percent of its 85 KB budget. Vercel storage for the whole team is at 103 percent of 10 GB. A problem page's script is at 60 percent of the 700 KB script budget, although that page is not budgeted. The home page's script is at 35 percent.">
<g class="rough">
<rect x="320" y="30" width="480" height="28" rx="5" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 1.6" />
<rect x="320" y="30" width="427" height="28" rx="5" style="fill: var(--dg-box-yellow); stroke: var(--dg-yellow-stroke); stroke-width: 1.6" />
<rect x="320" y="100" width="480" height="28" rx="5" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 1.6" />
<rect x="320" y="100" width="495" height="28" rx="5" style="fill: var(--dg-box-red); stroke: var(--red); stroke-width: 1.6" />
<rect x="320" y="170" width="480" height="28" rx="5" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 1.6" />
<rect x="320" y="170" width="289" height="28" rx="5" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.6" />
<rect x="320" y="240" width="480" height="28" rx="5" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 1.6" />
<rect x="320" y="240" width="169" height="28" rx="5" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.6" />
<path class="ln" d="M800 18 V282" style="stroke-dasharray: 6 5" />
</g>
<text class="lbl" x="20" y="44">JS search index</text>
<text class="sm" x="20" y="64">77,347 of 87,040 bytes, gzip</text>
<text class="lbl" x="20" y="114">Vercel storage, whole team</text>
<text class="sm" x="20" y="134">10.32 of 10 GB</text>
<text class="lbl" x="20" y="184">A problem page's script</text>
<text class="sm" x="20" y="204">421,830 of 700,000 bytes, not budgeted</text>
<text class="lbl" x="20" y="254">Home page script</text>
<text class="sm" x="20" y="274">246,769 of 700,000 bytes, gzip</text>
<text class="sm" x="832" y="49">89%</text>
<text class="sm rd" x="832" y="119">103%</text>
<text class="sm" x="832" y="189">60%</text>
<text class="sm" x="832" y="259">35%</text>
<text class="sm" x="760" y="306">the limit</text>
</svg>
<figcaption>
  The dashed line is each limit. One is already crossed, one is close, and the two page-weight rows
  have room. The problem page has no budget of its own; it is measured against the one the home
  page uses.
</figcaption>
</figure>

<h3>In the order they would give way</h3>
<div class="table-scroll"><table>
<thead><tr><th>Under pressure from</th><th>What gives</th><th>What it would take</th></tr></thead>
<tbody>
<tr>
  <td>Deploying often</td>
  <td>Deployment storage, and it already has. Each deployment is about 190 MB. The daily cleanup keeps the live one, 3 production, 2 previews and anything under 6 hours old, so its floor is five or six deployments. Its ceiling is however many pushes land in six hours.</td>
  <td>Fewer, batched pushes; a paid plan; or smaller deployments. Most of the size is prerendered output.</td>
</tr>
<tr>
  <td>Writing chapters in one topic</td>
  <td>That topic's search index. JavaScript is at 89% of the 85 KB budget, and its 41 chapters average 1,887 gzipped bytes each. At that rate the remaining 9,693 bytes are about five more chapters. Node is planned at 41 chapters too.</td>
  <td>An inverted index sharded per topic, or a hosted search service. The budget test is the trigger.</td>
</tr>
<tr>
  <td>Adding exercises</td>
  <td>Three things grow together. Every exercise adds two prerendered pages, <code>/problems/[slug]</code> and its <code>/cases</code> page, which is 1,076 of today's 1,746. It adds a row to <code>/problems</code>, whose HTML is 283 KB for 538 problems. And it adds to the exercise-bank chunk the mock room loads whole, 1.70 MB raw today.</td>
  <td>Load the mock room's questions by category rather than all at once; paginate or virtualise <code>/problems</code> only if <code>content-visibility</code> stops being enough.</td>
</tr>
<tr>
  <td>Writing the 358 outlined chapters</td>
  <td>Less than it looks. Outline chapters already prerender, so the page count does not move. Build time and deploy size grow with the body text, and the chapters written so far average about 15,400 characters of HTML.</td>
  <td>Nothing urgent. The whole static generation step takes 71 seconds on CI's 3 workers.</td>
</tr>
<tr>
  <td>A burst on the narrator</td>
  <td>Function cost and the upstream. The in-process limiter lives in one instance, and serverless spreads traffic across many. The firewall rule holds at the edge.</td>
  <td>A shared counter, which means state, which this design does not have.</td>
</tr>
<tr>
  <td>Readers with two devices</td>
  <td>Progress, streaks, saved code, run history and whiteboards all live in <code>localStorage</code>. They do not sync, and nothing could make them.</td>
  <td>Accounts and a database.</td>
</tr>
<tr>
  <td>Big whiteboards</td>
  <td>Storage before rendering. Rendering is culled above 150 elements. But images are stored inline as data URLs in the same <code>localStorage</code> every other feature uses, and when a save fails the board says so rather than silently losing it.</td>
  <td>IndexedDB for boards and images.</td>
</tr>
<tr>
  <td>Traffic on the pages themselves</td>
  <td>Nothing. The build lists four dynamic routes, all under <code>/api/</code>. Every other route is a file on a CDN.</td>
  <td>&mdash;</td>
</tr>
</tbody>
</table></div>

<h3>The two that are really about money</h3>
<p>
  <strong>Storage</strong> is the limit this project has actually hit, twice. It is not a code
  problem. A site that prerenders 1,746 pages ships all of them in every deployment, and the
  prerendered folder of a local build alone is 198 MB. The project itself now holds 7
  deployments. The team's total still reads 10.32 GB of 10 GB, because the figure covers every
  project on the account. The daily job handles this project's share. Only a plan change or
  cleaning up the other projects handles the rest.
</p>
<p>
  <strong>The narrator</strong> is the only feature whose cost grows with readers rather than with
  deploys. A GET to <code>/api/tts</code> is cacheable at the edge for a year, so the same sentence
  in the same voice is synthesised once. But every new sentence, voice or speed is a new function
  call and a new request to a service the site does not control.
</p>

<h3>At ten times, and at a hundred</h3>
<p>
  <strong>Ten times the readers</strong> changes almost nothing. The pages are cached files. The
  extra load falls on four functions, two of which cache their upstream: 10 minutes for weather and
  5 for the joke. The first thing a reader would notice is the search index on a slow phone
  connection, and that is a payload problem, not a capacity one.
</p>
<p>
  <strong>A hundred times</strong> is where the shape stops being right, not because the CDN
  struggles but because a site with that many readers needs different things:
</p>
<ul>
<li>accounts, and so a database</li>
<li>knowing which chapter people leave from, and so product analytics</li>
<li>publishing without a deploy, and so a content pipeline that is not the Git repository</li>
</ul>
<p>
  Each of those adds a piece this design deliberately leaves out.
</p>

<h3>What this design does not have</h3>
<p>
  Each of these is a decision, not an oversight. Together they keep the system small enough to
  hold in your head.
</p>
<ul>
<li><strong>No database.</strong> The content is the repository, and the reader's state is their browser.</li>
<li><strong>No authentication.</strong> Nothing is gated, so there is no session, no reset flow and no account to breach.</li>
<li><strong>No cache layer of its own.</strong> The CDN is the cache and the build is the invalidation.</li>
<li><strong>No queue, no background jobs.</strong> Anything slow happens at build time or in the reader's browser. The daily cleanup runs on GitHub, not in the app.</li>
<li><strong>No server-side code execution.</strong> The playground runs on the reader's machine, so untrusted code never reaches the server.</li>
</ul>

<div class="bx is-prim">
<span class="ttl">The honest summary</span>
<p>
  Nothing here is close to falling over under load. What is close is a set of budgets: a search
  index at 89% of its limit, and a storage plan past 100%. Both grow with writing and deploying,
  not with readers. That is the right way round for a site whose job is to be written, and it means
  the next scaling decision is about content structure and hosting cost, not about servers.
</p>
</div>`,
};
