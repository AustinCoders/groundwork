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

<h4>Browser-only components, since React 19.3</h4>
<pre><code>"use client";
import { use } from "react";
import { browser } from "react-dom";

function SavedName() {
  use(browser());                                  <span class="c">// server: stop here. browser: carry on.</span>
  return &lt;p&gt;{localStorage.getItem("name")}&lt;/p&gt;;
}

&lt;Suspense fallback={&lt;p&gt;Loading…&lt;/p&gt;}&gt;
  &lt;SavedName /&gt;
&lt;/Suspense&gt;</code></pre>
<p>
  During server rendering, <code>use(browser())</code> stops the component and
  leaves the nearest <code>&lt;Suspense&gt;</code> fallback in the HTML. In the
  browser it returns <code>undefined</code> and the component renders normally.
  It replaces the <code>mounted</code> flag above, the
  <code>typeof window</code> check, and a framework's "disable SSR" option &mdash;
  and because the server never produced a value, there is nothing to mismatch.
</p>
<ul>
  <li><b>It needs a <code>&lt;Suspense&gt;</code> boundary above it.</b> Without one, the server render fails.</li>
  <li><b>Client Components only.</b> A Server Component always runs on the server, so the question never arises there.</li>
  <li><b>Pass it to <code>use</code>.</b> Calling <code>browser()</code> alone does nothing, and throwing it is wrong.</li>
</ul>
<p>
  The second cost is simply that hydration is work: React walks the whole tree
  attaching handlers before the page is interactive. A page can look ready and
  ignore clicks for a second. Selective hydration and Server Components both
  exist to shrink that window.
</p>

<h3>Hydration mismatches: the usual causes, and the fix for each</h3>
<p>
  Hydration reuses the server's HTML instead of rebuilding it, so the client's
  first render must produce <em>exactly</em> the markup the server sent. When it
  does not, React logs a mismatch and, in the worst case, throws the server HTML
  away and renders from scratch. React 19 prints a diff showing which text or
  attribute differed, so read the message before guessing.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Cause</th><th>Why it differs</th><th>Fix</th></tr></thead>
<tbody>
<tr><td><code>new Date()</code>, <code>Date.now()</code></td><td>The server and the browser render at different moments</td><td>Render the time in an effect, or pass the value from the server as a prop</td></tr>
<tr><td>Locale or timezone formatting</td><td>The server runs in UTC with one locale, the user has another</td><td>Format with an explicit <code>locale</code> and <code>timeZone</code></td></tr>
<tr><td><code>Math.random()</code>, generated ids</td><td>A different value each render</td><td><code>useId</code> for ids; move randomness into an effect</td></tr>
<tr><td><code>typeof window !== "undefined"</code> in render</td><td>The branch is false on the server and true in the browser</td><td>Read browser-only values in an effect, or with <code>useSyncExternalStore</code> and a server snapshot</td></tr>
<tr><td><code>localStorage</code> or <code>matchMedia</code> read during render</td><td>Does not exist on the server</td><td>The same: an effect, or a store with <code>getServerSnapshot</code></td></tr>
<tr><td>Invalid HTML nesting (<code>&lt;div&gt;</code> inside <code>&lt;p&gt;</code>)</td><td>The browser's parser repairs it before React looks</td><td>Fix the markup</td></tr>
<tr><td>Browser extensions and translators</td><td>They edit the DOM before hydration</td><td>Nothing in your code is wrong; <code>suppressHydrationWarning</code> on the affected element if it is noisy</td></tr>
</tbody>
</table></div>
<pre><code><span class="c">// a value that is legitimately different on the client</span>
function Clock() {
  const [now, setNow] = useState(null);                  <span class="c">// null on the server and on the first client render</span>
  useEffect(() =&gt; setNow(new Date()), []);
  return &lt;time&gt;{now ? now.toLocaleTimeString("en-GB") : ""}&lt;/time&gt;;
}

<span class="c">// a single text node you accept will differ</span>
&lt;time suppressHydrationWarning&gt;{new Date().toISOString()}&lt;/time&gt;</code></pre>
<p>
  <code>suppressHydrationWarning</code> is an escape hatch, not a fix. It works
  one level deep, on that element's own text and attributes, and it only silences
  the warning: the mismatched text stays until something re-renders it. Use it
  for a genuine, harmless difference such as a timestamp, never to hide a bug.
  The effect version renders the same thing on the server and the first client
  pass, then updates &mdash; which is the pattern that is always correct.
</p>

<h3>Metadata and resources, hoisted</h3>
<pre><code>function Post({ post }) {
  return (
    &lt;article&gt;
      &lt;title&gt;{post.title}&lt;/title&gt;              <span class="c">// hoisted to &lt;head&gt;</span>
      &lt;meta name="description" content={post.summary} /&gt;
      &lt;link rel="canonical" href={post.url} /&gt;
      ...
    &lt;/article&gt;
  );
}</code></pre>
<p>
  React 19 hoists <code>&lt;title&gt;</code>, <code>&lt;meta&gt;</code> and
  <code>&lt;link&gt;</code> out of wherever you render them and into the
  document head, deduplicating as it goes. The component that knows the data
  declares its own metadata, and libraries like Helmet stop being necessary.
</p>
<pre><code>import { preload, preconnect, prefetchDNS } from "react-dom";

preconnect("https://api.example.com");          <span class="c">// warm the connection</span>
preload("/fonts/body.woff2", { as: "font" });   <span class="c">// start the download early</span></code></pre>
<p>
  These let a component say what the browser will need before it needs it. The
  most valuable is usually the font or the LCP image: preloading the hero image
  can move the largest contentful paint by hundreds of milliseconds, because the
  browser stops discovering it late in the parse.
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
