import type { Chapter } from "../types";

export const reactServerComponents: Chapter = {
  id: "react-server-components",
  num: "A4",
  title: "Server Components",
  short: "Server Components",
  levels: ["advanced"],
  practice: ["ex-react-serializable-props", "ex-react-request-cache"],
  ready: true,
  subtitle: "Components that run once, on the server, and ship no JavaScript at all.",
  body: `<h3>What they are</h3>
<p>
  A Server Component runs on the server, during the render, and its code is
  never sent to the browser. It can await a database query directly. It cannot
  use state, effects, or event handlers &mdash; because there is no browser to
  run them in and it never runs again.
</p>
<pre><code><span class="c">// no "use client" — this is a Server Component by default in the App Router</span>
export default async function Page({ params }) {
  const post = await db.post.findUnique({ where: { id: params.id } });
  return &lt;article&gt;{post.body}&lt;/article&gt;;
}</code></pre>
<p>
  No <code>useEffect</code>, no loading state, no API route in between, and the
  <code>db</code> client is not in the bundle.
</p>

<h3>Not server-side rendering</h3>
<div class="table-scroll"><table>
<thead><tr><th></th><th>SSR</th><th>Server Components</th></tr></thead>
<tbody>
<tr><td>Runs on the server</td><td>yes</td><td>yes</td></tr>
<tr><td>Runs again in the browser</td><td>yes &mdash; hydration</td><td><b>no</b></td></tr>
<tr><td>Code shipped to the client</td><td>all of it</td><td><b>none of it</b></td></tr>
<tr><td>Output</td><td>HTML</td><td>a serialised element tree (RSC payload)</td></tr>
</tbody>
</table></div>
<p>
  SSR renders your components on the server to produce HTML fast, then ships the
  same components down to run again. Server Components run <em>only</em> on the
  server; the client receives a description of the result, not the code that
  produced it.
</p>

<h3>The boundary</h3>
<pre><code><span class="c">// app/page.tsx — server</span>
import LikeButton from "./LikeButton";

export default async function Page() {
  const post = await getPost();
  return (
    &lt;article&gt;
      &lt;h1&gt;{post.title}&lt;/h1&gt;
      &lt;LikeButton postId={post.id} /&gt;      <span class="c">// island of interactivity</span>
    &lt;/article&gt;
  );
}

<span class="c">// LikeButton.tsx</span>
"use client";
export default function LikeButton({ postId }) {
  const [liked, setLiked] = useState(false);
  return &lt;button onClick={() =&gt; setLiked(!liked)}&gt;...&lt;/button&gt;;
}</code></pre>
<p>
  <code>"use client"</code> marks the boundary. Everything that file imports is
  a client component too, transitively &mdash; so the directive is a doorway,
  not a per-component label. Put it as low in the tree as possible.
</p>

<div class="bx is-prim">
  <span class="ttl">A client component can render a server one — as children</span>
  <pre><code>&lt;ClientTabs&gt;
  &lt;ServerChart /&gt;      <span class="c">// ✓ passed as an element, already rendered</span>
&lt;/ClientTabs&gt;</code></pre>
  <p>
    A client component cannot <em>import</em> a server component &mdash; the
    server code would follow it into the bundle. It can receive one as
    <code>children</code>, because by then it is a rendered payload rather than
    code. This is the single most useful pattern for keeping an interactive
    shell around static content.
  </p>
</div>

<figure class="viz-figure">
  <svg viewBox="0 0 560 230" role="img" aria-label="A server component tree passing serialisable props to a client component island marked use client.">
    <rect class="viz-rect viz-rect--server" x="10" y="10" width="330" height="210" rx="10"></rect>
    <text class="viz-label" x="24" y="32">Server: runs once, never ships</text>
    <rect class="viz-rect" x="30" y="46" width="120" height="34" rx="6"></rect>
    <text class="viz-label" x="44" y="68">Page</text>
    <rect class="viz-rect" x="30" y="100" width="150" height="34" rx="6"></rect>
    <text class="viz-label" x="44" y="122">ProductList</text>
    <rect class="viz-rect" x="30" y="154" width="150" height="34" rx="6"></rect>
    <text class="viz-label" x="44" y="176">db.query(...)</text>
    <path class="viz-line" d="M90 80 L90 100 M90 134 L90 154"></path>
    <rect class="viz-rect viz-rect--client" x="380" y="80" width="170" height="70" rx="10"></rect>
    <text class="viz-label" x="394" y="104">Client island</text>
    <text class="viz-label" x="394" y="126">"use client"</text>
    <text class="viz-label" x="394" y="142">AddToCart</text>
    <path class="viz-line" d="M180 117 L380 117"></path>
    <text class="viz-label" x="192" y="108">props</text>
    <text class="viz-label" x="192" y="138">must serialise</text>
  </svg>
  <figcaption>Everything above the line stays on the server. Only what crosses it, as serialisable props, and the client code itself, reaches the browser.</figcaption>
</figure>

<h3>What crosses the boundary must serialise</h3>
<pre><code>&lt;Client date={new Date()} /&gt;         <span class="c">// ✓ Dates, Maps, Sets are supported</span>
&lt;Client onSave={() =&gt; save()} /&gt;    <span class="c">// ✗ functions cannot cross</span>
&lt;Client user={classInstance} /&gt;     <span class="c">// ✗ class instances lose their prototype</span></code></pre>
<p>
  Props are serialised into the RSC payload. Functions are the one that catches
  people &mdash; the exception being <a href="/react/react-server-actions">Server
  Actions</a>, which are passed as a reference the client can call.
</p>

<h3>Sharing data with the client tree through Context</h3>
<p>
  A Server Component cannot <em>create</em> Context &mdash; <code>createContext</code>
  needs the client. It can <em>render</em> one, as long as the Context is defined in
  a <code>"use client"</code> module.
</p>
<pre><code><span class="c">// user-context.js</span>
"use client";
import { createContext } from "react";
export const UserContext = createContext(null);

<span class="c">// layout.js — a Server Component, React 19.3 and later</span>
import { UserContext } from "./user-context";

export default async function Layout({ children }) {
  const user = await getCurrentUser();
  return &lt;UserContext value={user}&gt;{children}&lt;/UserContext&gt;;
}</code></pre>
<p>
  Before React 19.3 the client module also had to export a wrapper &mdash; usually
  called <code>UserProvider</code> &mdash; whose only job was to take a prop and
  hand it straight to the Context. That file is gone now. It matters most for
  Contexts that exist only so server-fetched data, such as the current user or a
  feature-flag set, reaches the interactive components below.
</p>
<p class="sub">
  The value still has to serialise, like any prop crossing the boundary. Pass the
  user object, not a class instance or a function.
</p>

<h3>What actually changes</h3>
<ul>
  <li><b>Data fetching moves next to the data.</b> No API layer built solely so the browser can reach the database.</li>
  <li><b>Waterfalls collapse.</b> Sibling Server Components fetch in parallel during one server render, instead of each discovering its needs after its parent painted.</li>
  <li><b>Bundles shrink.</b> A markdown renderer, a syntax highlighter, a date library used only for formatting &mdash; none of them ship.</li>
  <li><b>Secrets stay put.</b> API keys and database URLs are used in code that never reaches a browser.</li>
</ul>

<h3>The rules, compressed</h3>
<div class="table-scroll"><table>
<thead><tr><th></th><th>Server</th><th>Client</th></tr></thead>
<tbody>
<tr><td><code>async</code>/<code>await</code> in the component</td><td><span class="chip tone-yes">yes</span></td><td>no</td></tr>
<tr><td>Database, filesystem, secrets</td><td><span class="chip tone-yes">yes</span></td><td>no</td></tr>
<tr><td>State, effects, handlers</td><td>no</td><td><span class="chip tone-yes">yes</span></td></tr>
<tr><td>Browser APIs</td><td>no</td><td><span class="chip tone-yes">yes</span></td></tr>
<tr><td>Ships JavaScript</td><td>none</td><td>yes</td></tr>
</tbody>
</table></div>

<h3>What actually travels over the wire</h3>
<pre><code>0:["$","article",null,{"children":[["$","h1",null,{"children":"Title"}],
   ["$L1",null,{"postId":7}]]}]
1:I["./LikeButton.js",["chunk-a.js"],"default"]</code></pre>
<p>
  The RSC payload is a streamed, line-oriented format &mdash; not HTML and not
  JSON in the usual sense. Rendered server output is inline;
  <code>$L1</code> is a placeholder for a client component, and the
  <code>I</code> line tells the browser which chunk to load for it.
</p>
<p>
  Two consequences worth knowing. It <b>streams</b>, so the client can start
  rendering the top of the page before the bottom has been produced. And it
  describes <em>elements</em>, not HTML &mdash; which is why a client navigation
  can patch a subtree without discarding the state of the components around it.
  A full HTML response could not do that.
</p>

<h3>Request deduplication and cache</h3>
<pre><code>const getUser = cache(async (id) =&gt; db.user.find(id));

<span class="c">// three components calling getUser(7) in one render → one query</span></code></pre>
<p>
  Because Server Components fetch where they are used rather than at the top,
  the same data is often requested several times in one render. React dedupes
  identical <code>fetch</code> calls automatically within a request, and
  <code>cache()</code> extends that to any function.
</p>
<p class="sub">
  React 19.2 adds <code>cacheSignal</code>, which gives you an
  <code>AbortSignal</code> tied to the cache entry's lifetime &mdash; so work can
  be cancelled when the request that needed it goes away.
</p>

<h3>Errors and loading, per segment</h3>
<pre><code>app/dashboard/
  page.tsx
  loading.tsx      <span class="c">// a Suspense fallback for this segment</span>
  error.tsx        <span class="c">// a client error boundary for this segment</span></code></pre>
<p>
  Frameworks turn file conventions into the boundaries from
  <a href="/react/react-suspense">Suspense</a> and
  <a href="/react/react-boundaries-portals">error boundaries</a>. Worth knowing
  it is the same mechanism &mdash; <code>error.tsx</code> must be a client
  component, because error boundaries are still classes and still need to run in
  the browser.
</p>

<h3>Where it goes wrong</h3>
<ul>
  <li><b><code>"use client"</code> at the top of a layout.</b> Everything below becomes client. The directive belongs on the leaf that needs it.</li>
  <li><b>A client component importing a server utility</b> that pulls in the database client &mdash; the build will tell you, loudly.</li>
  <li><b>Fetching the same thing in three components.</b> React dedupes identical requests within one render pass, but only if the calls are actually identical.</li>
  <li><b>Expecting <code>useState</code> to work</b> in a file with no directive. The error message is clear once you have seen it once.</li>
</ul>

<h3>The server boundary is an attack surface: React2Shell</h3>
<p>
  On 3 December 2025 the React team disclosed <b>CVE-2025-55182</b>, rated CVSS
  10.0 and widely called <b>React2Shell</b>. An unauthenticated attacker could send
  a crafted HTTP request to any Server Function endpoint and, when React
  deserialised it, run code on the server. Google's threat intelligence group saw
  widespread exploitation almost immediately, with cryptominers deployed from
  5 December &mdash; two days after disclosure.
</p>
<p>
  Follow-up disclosures on 11 December 2025 and in January 2026 added more, and
  one original fix turned out to be incomplete:
</p>
<div class="table-scroll"><table>
<thead><tr><th>CVE</th><th>Severity</th><th>What it allowed</th></tr></thead>
<tbody>
<tr><td>CVE-2025-55182</td><td>Critical, 10.0</td><td>Remote code execution through a Server Function request</td></tr>
<tr><td>CVE-2025-55184</td><td>High, 7.5</td><td>Denial of service &mdash; an infinite loop that hangs the server process</td></tr>
<tr><td>CVE-2025-67779</td><td>High, 7.5</td><td>Denial of service</td></tr>
<tr><td>CVE-2026-23864</td><td>High, 7.5</td><td>Denial of service &mdash; crashes, out-of-memory, runaway CPU</td></tr>
<tr><td>CVE-2025-55183</td><td>Medium, 5.3</td><td>Source code exposure from a Server Function that stringifies its arguments</td></tr>
</tbody>
</table></div>
<p>
  The flaws were in <code>react-server-dom-webpack</code>,
  <code>react-server-dom-parcel</code> and
  <code>react-server-dom-turbopack</code> &mdash; the packages every RSC framework
  sits on, including Next.js, React Router, Waku, Parcel and the Vite RSC plugin.
  <b>Safe versions are 19.0.4, 19.1.5 and 19.2.4 or later.</b> Anyone who stopped
  at 19.0.3, 19.1.4 or 19.2.3 still had the incomplete DoS fix.
</p>
<div class="bx is-prim">
  <span class="ttl">What to take from it</span>
  <ul>
    <li><b>An app with no server is not affected.</b> A pure client-side React app never deserialises a Server Function request. The risk arrived with the server boundary.</li>
    <li><b>Every Server Function is a public endpoint.</b> The attack needed no login and no knowledge of your code. Validate and authorise inside each one, as you would a REST handler.</li>
    <li><b>Upgrade the framework, not only React.</b> Frameworks bundle their own copy of the RSC runtime. Follow the framework's advisory, and do not rely on a hosting provider's firewall rule instead of patching.</li>
    <li><b>Keep secrets out of source.</b> CVE-2025-55183 leaked hardcoded strings, not <code>process.env</code> values. A key that lives only in an environment variable was not exposed by it.</li>
    <li><b>Version hygiene is a skill.</b> Knowing which version you run, reading advisories, and patching within days is part of shipping Server Components.</li>
  </ul>
</div>

<h3>The mental model</h3>
<p>
  Think of the page as mostly static content with <b>islands</b> of
  interactivity. The static parts are computed once on the server and cost
  nothing at runtime; the islands are small, and they are the only JavaScript
  the user downloads. That inverts the default of the last decade, where
  everything shipped and hydrated whether it needed to or not.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "Server Components run only on the server and ship no JavaScript — unlike
    SSR, which runs the same components again in the browser. They can await
    data directly, which removes the API layer and the render-fetch waterfall,
    and <code>'use client'</code> marks a doorway rather than a single
    component, so it belongs as low in the tree as possible."
  </p>
</div>`,
};
