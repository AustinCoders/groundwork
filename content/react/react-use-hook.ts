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
    effect &mdash; only during render.
  </p>
</div>

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
  that the other branch has no business subscribing to.
</p>

<h3>Do not create the promise during render</h3>
<pre><code>function Comments({ id }) {
  const data = use(fetch("/api/comments/" + id));   <span class="c">// ✗ new promise every render</span>
}</code></pre>
<p>
  Suspending re-runs the component when the promise resolves. If the promise is
  created inside the render, the retry creates another one, which suspends
  again &mdash; an infinite loop of requests. The promise must come from
  somewhere stable: a prop from a Server Component, a cache, or a framework API.
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
    unawaited promise from a Server Component to a client one, so fast content
    streams while a slow query fills in behind a boundary."
  </p>
</div>`,
};
