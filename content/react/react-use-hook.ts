import type { Chapter } from "../types";

export const reactUseHook: Chapter = {
  id: "react-use-hook",
  num: "A6",
  title: "The use() hook",
  short: "use()",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle: "Reading a promise or a context during render — and the only hook that breaks the rules.",
  body: `<h3>Reading a promise</h3>
<pre><code>function Comments({ commentsPromise }) {
  const comments = use(commentsPromise);      <span class="c">// suspends until it resolves</span>
  return &lt;ul&gt;{comments.map(...)}&lt;/ul&gt;;
}

&lt;Suspense fallback={&lt;Skeleton /&gt;}&gt;
  &lt;Comments commentsPromise={getComments()} /&gt;
&lt;/Suspense&gt;</code></pre>
<p>
  <code>use</code> unwraps a promise during render. If it is pending the
  component suspends and the nearest
  <a href="/react/react-suspense">Suspense boundary</a> shows its fallback; if it
  rejects, the nearest error boundary catches it. No <code>useEffect</code>, no
  loading flag, no error state in the component.
</p>

<h3>The pattern it enables</h3>
<pre><code><span class="c">// server component — starts the request but does not await it</span>
export default function Page() {
  const commentsPromise = getComments();     <span class="c">// no await</span>
  return (
    &lt;&gt;
      &lt;Article /&gt;                            <span class="c">// renders immediately</span>
      &lt;Suspense fallback={&lt;Skeleton /&gt;}&gt;
        &lt;Comments commentsPromise={commentsPromise} /&gt;
      &lt;/Suspense&gt;
    &lt;/&gt;
  );
}</code></pre>
<p>
  Awaiting in the server component would block the whole page on the slowest
  query. Passing the promise down lets the fast content render and stream
  immediately, while the slow part fills in later. This is the idiomatic way to
  avoid a server-side waterfall.
</p>
<p class="sub">
  The value a server promise resolves to crosses the network, so it must be
  serialisable: plain objects, arrays, strings, numbers, dates &mdash; not class
  instances or functions.
</p>

<h3>Start requests together, read them apart</h3>
<pre><code><span class="c">// ✗ a waterfall: the second request starts only after the first resolves</span>
async function Page() {
  const user = await getUser();
  const posts = await getPosts();
}

<span class="c">// ✓ both start now; each part reveals when its own data lands</span>
function Page() {
  const userPromise = getUser();
  const postsPromise = getPosts();
  return (
    &lt;&gt;
      &lt;Suspense fallback={&lt;HeaderSkeleton /&gt;}&gt;&lt;Header userPromise={userPromise} /&gt;&lt;/Suspense&gt;
      &lt;Suspense fallback={&lt;PostsSkeleton /&gt;}&gt;&lt;Posts postsPromise={postsPromise} /&gt;&lt;/Suspense&gt;
    &lt;/&gt;
  );
}</code></pre>
<p>
  Where a request <b>starts</b> and where it is <b>read</b> are separate
  decisions, and <code>use</code> is what lets you separate them. Two
  <code>await</code>s in a row are sequential even when the requests are
  independent. Creating both promises first makes them parallel, and the
  boundaries decide what the user sees while they run. Two components can also
  read the same promise; it is fetched once and both resume when it settles.
</p>

<h3>use or await?</h3>
<div class="table-scroll"><table>
<thead><tr><th>Where</th><th>Use</th><th>Why</th></tr></thead>
<tbody>
<tr><td>Server Component, data this component renders</td><td><code>await</code></td><td>Server Components can be async; it is simpler and needs no boundary of its own</td></tr>
<tr><td>Server Component, data a child renders later</td><td>pass the promise</td><td>Starts the request early without blocking this component</td></tr>
<tr><td>Client Component</td><td><code>use(promise)</code></td><td>Client components cannot be async functions</td></tr>
</tbody>
</table></div>
<p>
  The rule of thumb: await where the data is needed to render the component you
  are in; hand over the promise where it is needed further down. Both can live
  in the same page.
</p>

<div class="bx is-prim">
  <span class="ttl">The one hook that can be called conditionally</span>
  <pre><code>function Panel({ show, dataPromise }) {
  if (!show) return null;
  const data = use(dataPromise);      <span class="c">// ✓ legal — after an early return</span>
}</code></pre>
  <p>
    Every other hook depends on stable call order. <code>use</code> does not
    store anything in the hook slot list, so it can sit inside a condition, a
    loop, or after a return. It still cannot be called from a callback or an
    effect &mdash; only while rendering a component or inside another hook.
  </p>
</div>

<h3>It cannot go inside try/catch</h3>
<pre><code><span class="c">// ✗ throws "Suspense Exception: This is not a real error!"</span>
function Albums({ albumsPromise }) {
  try {
    const albums = use(albumsPromise);
  } catch (e) {
    return &lt;p&gt;Error&lt;/p&gt;;
  }
}

<span class="c">// ✓ the boundary is the catch</span>
&lt;ErrorBoundary fallback={&lt;p&gt;Error&lt;/p&gt;}&gt;
  &lt;Albums albumsPromise={albumsPromise} /&gt;
&lt;/ErrorBoundary&gt;</code></pre>
<p>
  Suspending works by interrupting the render, and a <code>catch</code> block
  would swallow that interruption. When a rejection should become a value rather
  than an error screen, handle it on the promise before passing it in:
</p>
<pre><code>const safe = getComments().catch(() =&gt; []);   <span class="c">// rejection becomes an empty list</span>
&lt;Comments commentsPromise={safe} /&gt;</code></pre>

<h3>Reading context</h3>
<pre><code>function Item({ compact }) {
  if (compact) {
    const theme = use(ThemeContext);   <span class="c">// ✓ conditional context read</span>
    ...
  }
}</code></pre>
<p>
  <code>use(SomeContext)</code> does what <code>useContext</code> does, with the
  same conditional freedom. Useful when a branch of a component needs context
  that the other branch has no business subscribing to. Like
  <code>useContext</code>, it looks for the closest provider <b>above</b> the
  calling component and ignores one rendered by that component itself. Reading
  context with <code>use</code> is not supported in Server Components.
</p>

<h3>Do not create the promise during render</h3>
<pre><code>function Comments({ id }) {
  const data = use(fetch("/api/comments/" + id));   <span class="c">// ✗ new promise every render</span>
}</code></pre>
<p>
  Suspending re-runs the component when the promise resolves. If the promise is
  created inside the render, the retry creates another one, which suspends
  again &mdash; an infinite loop of requests. React warns with "A component was
  suspended by an uncached promise". The promise must come from somewhere
  stable: a prop from a Server Component, a cache, or a framework API.
</p>

<h3>Caching promises in client code</h3>
<pre><code>const cache = new Map();

export function fetchComments(id) {
  if (!cache.has(id)) {
    cache.set(id, fetch("/api/comments/" + id).then((r) =&gt; r.json()));
  }
  return cache.get(id);                   <span class="c">// same promise for the same id</span>
}

function Comments({ id }) {
  const comments = use(fetchComments(id)); <span class="c">// ✓ stable across retries</span>
}</code></pre>
<p>
  This is the smallest correct version, and seeing it explains why you usually
  want a library instead. This cache never expires, never refetches, keeps a
  rejected promise forever, and grows without limit. Query libraries and
  frameworks solve exactly those problems, and then hand <code>use</code> a
  stable promise.
</p>
<p>
  On the server the equivalent is React's <code>cache</code>: wrap a data
  function with it, and every Server Component that calls it with the same
  arguments during one request shares a single call. It is scoped to that
  request and only works in Server Components, so it deduplicates without ever
  leaking one user's data into another's page.
</p>
<p class="sub">
  Never peek at a promise's <code>status</code> or <code>value</code> to skip
  calling <code>use</code>. Always pass the promise and let React decide;
  bypassing it breaks Suspense optimisations and DevTools.
</p>

<h3>How it compares</h3>
<div class="table-scroll"><table>
<thead><tr><th></th><th><code>use()</code></th><th>Effect + state</th><th>Query library</th></tr></thead>
<tbody>
<tr><td>Loading state</td><td>the boundary</td><td>you write it</td><td>returned to you</td></tr>
<tr><td>Errors</td><td>error boundary</td><td>you write it</td><td>returned to you</td></tr>
<tr><td>Caching</td><td>none of its own</td><td>none</td><td><span class="chip tone-yes">yes</span></td></tr>
<tr><td>Refetch, invalidate</td><td>the framework's job</td><td>manual</td><td><span class="chip tone-yes">yes</span></td></tr>
<tr><td>Where it fits</td><td>server-passed promises</td><td>legacy, or one-offs</td><td>client-side data</td></tr>
</tbody>
</table></div>
<p>
  <code>use</code> is not a replacement for a data library &mdash; it has no
  cache and no revalidation. It is the primitive that makes promises readable
  during render, which is what libraries and frameworks build on.
</p>

<h3>Where you will actually meet it</h3>
<ul>
  <li>A Server Component starting a slow query and passing the promise to a client component.</li>
  <li>Framework data APIs that hand you a promise instead of awaiting it for you.</li>
  <li>Conditional context reads, occasionally.</li>
  <li><code>use(browser())</code>, added in React 19.3, to render a part only on the client &mdash; covered in <a href="/react/react-rendering-strategies">rendering strategies</a>.</li>
</ul>
<p>
  In a plain client-side app with a query library, you will rarely call it
  directly &mdash; and that is fine. Knowing what it does explains how Suspense
  gets its promises.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "<code>use</code> reads a promise or a context during render, suspending
    until it resolves, and it is the only hook that can be called conditionally
    because it stores nothing in the hook list. Its main use is passing an
    unawaited promise from a Server Component to a client one; the promise must
    be cached, errors go to an error boundary rather than try/catch, and inside
    a Server Component plain <code>await</code> is usually simpler."
  </p>
</div>`,
};
