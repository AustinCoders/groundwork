import type { Chapter } from "../types";

export const reactRenderingStrategies: Chapter = {
  id: "react-rendering-strategies",
  num: "A7",
  title: "Rendering strategies",
  short: "Rendering strategies",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle: "Where the HTML is produced, and when — the decision that shapes everything downstream.",
  body: `<h3>The four, and what actually differs</h3>
<div class="table-scroll"><table>
<thead><tr><th></th><th>HTML made</th><th>By</th><th>Time to first byte</th><th>Freshness</th></tr></thead>
<tbody>
<tr><td><b>CSR</b></td><td>In the browser, after JS loads</td><td>the client</td><td>fast, but empty</td><td>always current</td></tr>
<tr><td><b>SSR</b></td><td>On every request</td><td>the server</td><td>slowest &mdash; waits for data</td><td>always current</td></tr>
<tr><td><b>SSG</b></td><td>At build time</td><td>the build</td><td>fastest &mdash; a file</td><td>as old as the deploy</td></tr>
<tr><td><b>ISR</b></td><td>At build, then regenerated</td><td>build + background</td><td>fastest</td><td>bounded staleness</td></tr>
</tbody>
</table></div>

<h3>Client-side rendering</h3>
<pre><code>&lt;div id="root"&gt;&lt;/div&gt;      <span class="c">// the entire document</span></code></pre>
<p>
  The server sends an empty shell; the browser downloads the bundle, runs it,
  fetches data, and paints. Time to first byte is excellent and time to anything
  useful is not. Crawlers that do not execute JavaScript see nothing, and the
  whole experience is hostage to the bundle size.
</p>
<p class="sub">
  Right for an app behind a login, where SEO is irrelevant and the first load
  happens once a day. Wrong for anything with a public landing page.
</p>

<h3>Server-side rendering</h3>
<p>
  React renders to HTML on each request, and the client hydrates &mdash; attaches
  handlers to markup that already exists. The user sees content before the
  JavaScript arrives.
</p>
<p>
  The cost is that <b>TTFB now includes your slowest query</b>. A 400ms database
  call means 400ms before a single byte moves. Streaming with
  <a href="/react/react-suspense">Suspense</a> is the fix: send the shell
  immediately, stream each boundary as its data resolves.
</p>

<h3>Static generation</h3>
<p>
  Render at build time, serve files from a CDN. Nothing is faster and nothing is
  cheaper &mdash; there is no server in the request path at all. The constraint
  is that the content must be knowable at build time, and the cost is that
  changing one word means a rebuild and a redeploy.
</p>
<pre><code>export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) =&gt; ({ slug: p.slug }));   <span class="c">// one page per post</span>
}</code></pre>

<h3>Incremental regeneration</h3>
<pre><code>export const revalidate = 3600;      <span class="c">// serve cached, refresh at most hourly</span></code></pre>
<p>
  A static file with an expiry. The first request after the window serves the
  stale page and triggers a background regeneration; everyone after gets the new
  one. You choose how stale is acceptable, and pay nothing for freshness you did
  not ask for.
</p>
<p class="sub">
  On-demand revalidation is the sharper version: a webhook from the CMS
  regenerates exactly the pages that changed, so the content is fresh in seconds
  without a rebuild.
</p>

<h3>Hydration, and the two ways it hurts</h3>
<div class="bx is-prim">
  <span class="ttl">The mismatch</span>
  <pre><code>&lt;p&gt;{new Date().toLocaleTimeString()}&lt;/p&gt;     <span class="c">// ✗ server time ≠ client time</span>
&lt;p&gt;{Math.random()}&lt;/p&gt;                       <span class="c">// ✗</span>
&lt;p&gt;{localStorage.getItem("name")}&lt;/p&gt;        <span class="c">// ✗ no localStorage on the server</span></code></pre>
  <p>
    If the client's first render disagrees with the server's HTML, React warns
    and re-renders that subtree from scratch &mdash; losing the benefit of SSR
    exactly where it happened. The fix is to render the server-safe value first
    and correct it after mount:
  </p>
  <pre><code>const [mounted, setMounted] = useState(false);
useEffect(() =&gt; setMounted(true), []);
return &lt;p&gt;{mounted ? localValue : fallback}&lt;/p&gt;;</code></pre>
</div>
<p>
  The second cost is simply that hydration is work: React walks the whole tree
  attaching handlers before the page is interactive. A page can look ready and
  ignore clicks for a second. Selective hydration and Server Components both
  exist to shrink that window.
</p>

<h3>Choosing per route, not per app</h3>
<p>
  The real answer in a modern framework is that this is not one decision. A
  marketing page is static, a blog post is ISR, a dashboard is server-rendered
  per request, and a settings panel behind auth can be client-rendered. Picking
  one strategy for an entire application is the mistake.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Page</th><th>Strategy</th><th>Because</th></tr></thead>
<tbody>
<tr><td>Landing, docs, marketing</td><td>SSG</td><td>Same for everyone, SEO matters</td></tr>
<tr><td>Blog, product catalogue</td><td>ISR</td><td>Changes occasionally, must stay fast</td></tr>
<tr><td>Personalised feed, dashboard</td><td>SSR</td><td>Different per user, must be current</td></tr>
<tr><td>Editor, admin behind a login</td><td>CSR</td><td>No SEO, heavy interaction</td></tr>
</tbody>
</table></div>

<h3>The one number to check</h3>
<p>
  For anything public, measure <b>Interaction to Next Paint</b> and the time
  between first paint and interactivity. A statically served page that ships a
  megabyte of JavaScript is not fast &mdash; it just looks fast until somebody
  clicks.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "The strategies differ in where and when HTML is produced, and the trade is
    always freshness against latency: static is fastest and stalest, per-request
    SSR is current but pays your slowest query in TTFB, and ISR picks a bounded
    staleness in between. It is a per-route decision, and hydration mismatches
    are what quietly undo SSR's benefit."
  </p>
</div>`,
};
