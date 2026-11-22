import type { Chapter } from "../types";

export const reactServerComponents: Chapter = {
  id: "react-server-components",
  num: "A4",
  title: "Server Components",
  short: "Server Components",
  levels: ["advanced"],
  prerequisites: ["react-suspense", "react-context", "react-rendering-strategies"],
  practice: ["ex-react-serializable-props", "ex-react-request-cache"],
  ready: true,
  subtitle: "Components that run once, on the server, and ship no JavaScript at all.",
  body: `<p>
  For most of React's history every component ran in the browser, and server rendering was an optimisation that ran the
  same components twice. Server Components change the default: a component can run only on the server, read data
  directly, and send its rendered result to the browser without its code. This chapter covers what they are and how they
  differ from server rendering, the client boundary and what may cross it, how a request flows end to end, data fetching
  without waterfalls, composition patterns, caching, the security lessons of late 2025, and when not to use them.
  Framework details use the Next.js App Router, the most common host, but the model is React's.
</p>

<h3>What they are</h3>
<p>
  A Server Component runs on the server, during the render, and its code is
  never sent to the browser. It can await a database query directly. It cannot
  use state, effects, or event handlers &mdash; because there is no browser to
  run them in and it never runs again.
</p>
<pre><code><span class="c">// no "use client" — this is a Server Component by default in the App Router</span>
export default async function Page({ params }) {
  const { id } = await params;
  const post = await db.post.findUnique({ where: { id } });
  return &lt;article&gt;{post.body}&lt;/article&gt;;
}</code></pre>
<p>
  No <code>useEffect</code>, no loading state, no API route in between, and the
  <code>db</code> client is not in the bundle.
</p>
<p>
  The component is an <code>async</code> function, which client components cannot
  be. React awaits it during the server render, and if a Suspense boundary sits
  above it, the rest of the page can stream while it waits. Because it runs once per
  request (or once at build time for static pages), there is nothing to re-render:
  fresh data comes from rendering it again on the server, which is what a
  navigation, a refresh, or a Server Action that revalidates the page does.
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

<h3>A request, end to end</h3>
<p>
  What happens when a user opens a page built from Server Components, and then navigates within the app:
</p>
<div class="table-scroll"><table>
<thead><tr><th>Step</th><th>Where</th><th>What happens</th></tr></thead>
<tbody>
<tr><td>1</td><td>Server</td><td>React renders the tree. Server Components run, awaiting their data; where it meets a client component it records a reference to that component's module and its props instead of running it</td></tr>
<tr><td>2</td><td>Server</td><td>The result is serialised as the RSC payload and streamed. Suspense boundaries let the shell go first and slow parts follow</td></tr>
<tr><td>3</td><td>Server, first load only</td><td>The framework also runs the client components once to turn the whole tree into HTML, so the page paints before any JavaScript runs</td></tr>
<tr><td>4</td><td>Browser</td><td>HTML paints. The browser downloads only the chunks for client components named in the payload</td></tr>
<tr><td>5</td><td>Browser</td><td>React hydrates the client components, attaching handlers and state; server-rendered parts are already final and need no hydration</td></tr>
<tr><td>6</td><td>Browser, on navigation</td><td>The router requests the RSC payload for the new route, not HTML, and React merges the new tree into the existing one, keeping client state where the tree matches</td></tr>
</tbody>
</table></div>
<p>
  Step 3 is why Server Components are often confused with SSR: on the first load both happen. Step 6 is where they
  differ most. A navigation fetches a description of the new UI, rendered on the server with fresh data, and React
  applies it like any other update: a search box in a shared layout keeps its text, a client-side cart keeps its items.
  Client components that appear in both the old and new tree at the same position are updated, not remounted, by the
  same reconciliation rules described in <a href="/react/react-fiber">Fiber</a>.
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

<h3>Fetching without waterfalls</h3>
<p>
  An async component that awaits two things in sequence waits for both, one after the other:
</p>
<pre><code><span class="c">// ✗ sequential: the second query starts after the first finishes</span>
async function Profile({ id }) {
  const user = await getUser(id);
  const posts = await getPosts(id);
  return &lt;Layout user={user} posts={posts} /&gt;;
}

<span class="c">// ✓ parallel: both start at once</span>
async function Profile({ id }) {
  const [user, posts] = await Promise.all([getUser(id), getPosts(id)]);
  return &lt;Layout user={user} posts={posts} /&gt;;
}

<span class="c">// ✓ better still: let each part arrive when ready</span>
async function Profile({ id }) {
  const user = await getUser(id);
  return (
    &lt;Layout user={user}&gt;
      &lt;Suspense fallback={&lt;PostsSkeleton /&gt;}&gt;
        &lt;Posts id={id} /&gt;                  <span class="c">// an async component that awaits getPosts itself</span>
      &lt;/Suspense&gt;
    &lt;/Layout&gt;
  );
}</code></pre>
<p>
  The third version streams: the profile header appears as soon as the user query returns, and the posts follow in the
  same response. Sibling async components inside separate boundaries render concurrently on the server, so nesting does
  not cause a waterfall unless a child needs its parent's result. A server component can also start a request and pass
  the <em>promise</em> to a client component, which reads it with <code>use</code>; the client component then suspends
  until the data streams in, without the server waiting for it first.
</p>

<h3>Composition patterns</h3>
<ul>
  <li><b>Providers at the edge.</b> Theme, query-cache and similar providers are client components. Render them in a server layout and pass the rest of the page as <code>children</code>; the pages inside stay server components.</li>
  <li><b>Interactive shells, server content.</b> Tabs, accordions and modals are client components that take server-rendered panels as children or other element props.</li>
  <li><b>Leaves, not layouts.</b> Put <code>"use client"</code> on the smallest component that needs state or a handler: the like button, not the article.</li>
  <li><b>Guard server-only modules.</b> Importing the <code>server-only</code> package at the top of a module makes the build fail if a client component ever imports it, so a database client or a secret cannot slip into the bundle by accident. <code>client-only</code> does the reverse for browser-only modules.</li>
</ul>

<h3>Worked example: moving a page to the server</h3>
<p>
  A product page written before Server Components, as one client component:
</p>
<pre><code>"use client";
export default function ProductPage({ id }) {
  const [product, setProduct] = useState(null);
  useEffect(() =&gt; {
    fetch("/api/products/" + id).then((r) =&gt; r.json()).then(setProduct);
  }, [id]);
  if (!product) return &lt;Spinner /&gt;;
  return (
    &lt;article&gt;
      &lt;h1&gt;{product.name}&lt;/h1&gt;
      &lt;Markdown&gt;{product.description}&lt;/Markdown&gt;
      &lt;AddToCart productId={product.id} /&gt;
    &lt;/article&gt;
  );
}</code></pre>
<p>And after:</p>
<pre><code>export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  return (
    &lt;article&gt;
      &lt;h1&gt;{product.name}&lt;/h1&gt;
      &lt;Markdown&gt;{product.description}&lt;/Markdown&gt;
      &lt;AddToCart productId={product.id} /&gt;     <span class="c">// the only "use client" file</span>
    &lt;/article&gt;
  );
}</code></pre>
<div class="table-scroll"><table>
<thead><tr><th></th><th>Before</th><th>After</th></tr></thead>
<tbody>
<tr><td>JavaScript shipped</td><td>The page, the markdown library, the fetch logic</td><td>Only <code>AddToCart</code></td></tr>
<tr><td>Requests before content</td><td>HTML, then JavaScript, then the API call</td><td>One: the HTML already contains the product</td></tr>
<tr><td>Loading state</td><td>A spinner in the component</td><td>None needed; a <code>loading</code> file or boundary if the query is slow</td></tr>
<tr><td>API route</td><td>Needed, and public</td><td>Not needed for this page</td></tr>
<tr><td>Race on fast <code>id</code> changes</td><td>Possible; needs cleanup</td><td>Not possible; each navigation renders on the server</td></tr>
</tbody>
</table></div>
<p>
  The page got shorter, faster and safer at once, which is the typical result for content that is read more than it is
  interacted with. Pages that are mostly interaction, such as an editor or a canvas, gain much less.
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
<p>
  A checklist for a new page follows from that model. Start with every component as a Server Component. For each one,
  ask whether it needs state, an effect, an event handler or a browser API; only those become client components, and
  only the smallest piece that needs it. Fetch data in the Server Components that display it, in parallel, with
  Suspense boundaries around the slow parts. Pass client components only serialisable props, and pass behaviour as
  Server Actions. Guard server-only modules. Then check the bundle report: the client JavaScript for the page should be
  roughly the size of its interactive islands, and anything larger is a directive placed too high or an import that
  crossed the boundary.
</p>

<h3>Errors across the boundary</h3>
<p>
  When a Server Component throws during rendering, the error travels to the client inside the payload and the nearest
  error boundary renders. In production, React does not send the original message, which could contain internal details
  such as a query or a file path. The client sees a generic message and a <code>digest</code>, a short identifier that
  matches the full error in the server logs. So the boundary's fallback should be written for users ("Could not load
  your orders") and your logging should record the digest, which is how support can find the real cause from a user's
  screenshot. Expected failures, such as a missing record, are better handled in the component (render a not-found
  state) than thrown.
</p>

<h3>Testing them</h3>
<p>
  Async Server Components are harder to render in a unit test than client components, because the testing tools were
  built for the browser. The practical split is to test the parts separately: data functions (<code>getProduct</code>,
  <code>getUser</code>) as plain async functions against a test database or a mocked client; client components with
  Testing Library as usual, passing the props a server parent would; and the integration, server and client together,
  with end-to-end tests that load real pages. A Server Component that is mostly markup around data functions usually
  needs no unit test of its own.
</p>

<h3>When not to use them</h3>
<p>
  Server Components need a server, or a build step that runs them ahead of time, and a framework that supports them.
  For a highly interactive app behind a login (a design tool, a trading screen, a game) most components need state and
  effects anyway, and the benefit shrinks to the shell. For a static marketing site, plain static generation may be
  simpler. And for a team without operational experience of running a Node server, the security section above is a
  reminder that a server boundary is a server to patch. They are a strong default for content-heavy, data-driven pages,
  not a requirement for every React app.
</p>

<h3>Pitfalls</h3>
<ul>
  <li><b><code>"use client"</code> too high</b>, turning a whole subtree, and its imports, into client code.</li>
  <li><b>Passing functions, class instances or other non-serialisable values</b> across the boundary.</li>
  <li><b>Importing a server module from a client component</b>; guard it with <code>server-only</code>.</li>
  <li><b>Sequential awaits</b> for independent data, creating a server-side waterfall.</li>
  <li><b>Treating Server Functions as private</b>: each is a public endpoint that needs validation and authorisation.</li>
  <li><b>Confusing Server Components with SSR</b>, and expecting state or effects to work in them.</li>
  <li><b>Running unpatched RSC packages</b>, or patching React but not the framework that bundles them.</li>
  <li><b>Putting secrets in source</b> rather than environment variables.</li>
</ul>

<h3>Recognising it in a problem</h3>
<ul>
  <li>"useState only works in client components": the file has no <code>"use client"</code>, so it is a Server Component.</li>
  <li>"Functions cannot be passed directly to Client Components": a callback prop crossing the boundary; use a Server Action or move the handler to the client.</li>
  <li>"Our bundle grew after adding a layout directive": <code>"use client"</code> placed high in the tree.</li>
  <li>"The page waits for every query before showing anything": sequential awaits, or no Suspense boundaries for slow parts.</li>
  <li>"A database package appears in the client bundle": a client import chain reaching a server module.</li>
</ul>

<h3>Interview questions</h3>
<p><b>1. What is a Server Component, and how does it differ from SSR?</b></p>
<p>
  A component that runs only on the server and sends its rendered output, not its code, to the client as the RSC
  payload. SSR renders components to HTML on the server and then runs the same components again in the browser to
  hydrate them. Server Components never hydrate and add nothing to the bundle; frameworks usually combine both, so the
  first load is HTML and later navigations fetch RSC payloads.
</p>
<p class="sub">
  <i>Follow-up: what can a Server Component not do?</i> Use state, effects, event handlers or browser APIs, because it
  never runs in the browser and never re-renders there.
</p>
<p><b>2. What does <code>"use client"</code> mean exactly?</b></p>
<p>
  It marks a module as an entry point into client code. That module and everything it imports are bundled for the
  browser. Server Components can render the components it exports, passing serialisable props. It is a boundary, not a
  per-component label, so it belongs on the smallest interactive leaf.
</p>
<p><b>3. How can a client component contain a Server Component?</b></p>
<p>
  Not by importing it, which would pull server code into the bundle, but by receiving it as <code>children</code> or
  another element prop from a Server Component parent. By then it is already rendered output.
</p>
<p><b>4. How do you avoid waterfalls when fetching in Server Components?</b></p>
<p>
  Start independent requests together with <code>Promise.all</code>, or split slow parts into separate async components
  under their own Suspense boundaries so they render concurrently and stream. Use <code>cache()</code> to deduplicate the
  same request made by several components in one render.
</p>
<p><b>5. What did React2Shell teach about Server Components?</b></p>
<p>
  That the server boundary is an attack surface: a flaw in how React decoded requests let unauthenticated requests to Server Function
  endpoints run code on the server. Every Server Function is a public endpoint needing validation and authorisation,
  frameworks bundle their own RSC runtime and must be upgraded too, and patching within days is part of the job.
</p>
<p><b>6. A page shows a spinner, then fetches in an effect from an API route. How would you move it to Server Components, and what improves?</b></p>
<p>
  Make the page an async Server Component that awaits the data function directly, keep only the interactive parts as
  small client components, and add a Suspense boundary or loading file if the query is slow. The bundle loses the page,
  its libraries and the fetch logic; the browser makes one request instead of three before content appears; the API
  route is no longer needed for that page; and the fetch race on fast navigation disappears.
</p>
<div class="bx is-prim">
  <span class="ttl">The trap question</span>
  <p>
    "If I add <code>"use client"</code> to my root layout, do my pages still benefit from Server Components?" Partly.
    The pages the framework passes to the layout as <code>children</code> stay Server Components. But the layout
    itself, and every module it imports (the header, the navigation, the footer), becomes client code: it loses direct
    data access, ships to the browser and hydrates. Keep layouts on the server and put the directive on the interactive
    leaves, or wrap <code>children</code> in a small client provider.
  </p>
</div>
<div class="bx is-ref">
  <span class="ttl">Say it like this</span>
  <p>
    "Server Components run only on the server and ship no JavaScript, unlike SSR, which runs the same components again
    in the browser. They can await data directly, which removes the API layer and the render-then-fetch waterfall, and
    navigations fetch a serialised element tree that React merges without losing client state. <code>"use client"</code>
    marks a doorway, so it goes as low as possible, and anything crossing it must serialise. Every Server Function is a
    public endpoint, so I validate inside it and keep the framework patched."
  </p>
</div>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Explain the difference between Server Components and SSR in one table.</li>
    <li>Trace a first load and a client navigation through the six steps.</li>
    <li>Place <code>"use client"</code> on the right component in a page with one interactive button.</li>
    <li>Say which props can cross the boundary, and how to pass behaviour that cannot.</li>
    <li>Nest a server component inside a client tabs component without importing it.</li>
    <li>Turn sequential awaits into parallel or streamed fetching.</li>
    <li>Guard a module that holds a database client so no client component can import it, and say which package does it.</li>
    <li>Move a client page that fetches in an effect to a Server Component and list what changed.</li>
    <li>Summarise React2Shell and the practices it calls for.</li>
    <li>Explain what the client sees when a Server Component throws in production, and how to find the real error.</li>
    <li>Plan tests for a page built from server and client components.</li>
  </ul>
</div>`,
};
