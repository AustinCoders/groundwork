import type { Chapter } from "../types";

export const reactSuspense: Chapter = {
  id: "react-suspense",
  num: "A3",
  title: "Suspense & code splitting",
  short: "Suspense",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle: "Declaring where a loading state lives, instead of threading one through every component.",
  body: `<h3>The idea</h3>
<pre><code>&lt;Suspense fallback={&lt;Skeleton /&gt;}&gt;
  &lt;Profile /&gt;      <span class="c">// if this suspends, the skeleton shows</span>
&lt;/Suspense&gt;</code></pre>
<p>
  A component "suspends" by throwing a promise. React catches it, renders the
  nearest boundary's fallback, and retries when the promise resolves. The
  component itself contains no <code>isLoading</code> check &mdash; the loading
  state moved out, to a place that can describe the whole region.
</p>

<h3>Code splitting, the everyday use</h3>
<pre><code>const Settings = lazy(() =&gt; import("./Settings"));

&lt;Suspense fallback={&lt;Spinner /&gt;}&gt;
  &lt;Settings /&gt;
&lt;/Suspense&gt;</code></pre>
<p>
  <code>lazy</code> returns a component that suspends until its chunk arrives.
  The natural split points are routes, heavy dialogs, and anything below the
  fold that most visitors never open &mdash; an editor, a chart library, a map.
</p>
<p class="sub">
  Prefetch on intent, not on render: <code>onMouseEnter={() =&gt; import("./Settings")}</code>
  starts the download while the pointer is travelling, so the click feels
  instant.
</p>

<div class="bx is-prim">
  <span class="ttl">The most common mistake</span>
  <pre><code>function Page() {
  const Chart = lazy(() =&gt; import("./Chart"));   <span class="c">// ✗ inside the component</span>
}</code></pre>
  <p>
    A new lazy component on every render means a new type, so React unmounts and
    remounts it every time &mdash; the chunk reloads and the fallback flashes
    forever. <code>lazy</code> belongs at module scope.
  </p>
</div>

<h3>Boundary placement is a design decision</h3>
<pre><code><span class="c">// one boundary: nothing appears until everything is ready</span>
&lt;Suspense fallback={&lt;PageSkeleton /&gt;}&gt;
  &lt;Header /&gt;&lt;Feed /&gt;&lt;Sidebar /&gt;
&lt;/Suspense&gt;

<span class="c">// three: each region appears as it becomes ready</span>
&lt;Suspense fallback={&lt;HeaderSkeleton /&gt;}&gt;&lt;Header /&gt;&lt;/Suspense&gt;
&lt;Suspense fallback={&lt;FeedSkeleton /&gt;}&gt;&lt;Feed /&gt;&lt;/Suspense&gt;</code></pre>
<p>
  Finer boundaries are not automatically better. Too many and the page assembles
  in visible stages, shifting layout as each lands. Aim for regions a user would
  describe as separate things, and give the fallback the <b>same shape</b> as
  the content so nothing moves when it swaps.
</p>

<h3>Suspense and transitions together</h3>
<pre><code>startTransition(() =&gt; setTab("analytics"));</code></pre>
<p>
  Without the transition, switching to a tab whose data is not ready replaces
  the current content with a fallback &mdash; the screen goes blank and comes
  back. Inside a transition, React keeps the old content on screen until the new
  one is ready, and <code>isPending</code> lets you dim it in the meantime.
</p>
<p>
  This is the difference between a page that flashes on every navigation and one
  that feels continuous, and it is why routers wrap navigation in a transition.
</p>

<h3>Streaming SSR</h3>
<p>
  On the server, Suspense boundaries are the unit of streaming. The server sends
  the shell immediately with fallbacks in place, then streams each boundary's
  HTML as its data resolves. The user sees the page structure straight away
  instead of waiting for the slowest query.
</p>
<pre><code>&lt;Layout&gt;
  &lt;Suspense fallback={&lt;FeedSkeleton /&gt;}&gt;
    &lt;Feed /&gt;        <span class="c">// slow query — streams in later, does not block the shell</span>
  &lt;/Suspense&gt;
&lt;/Layout&gt;</code></pre>
<p>
  Selective hydration follows the same boundaries: React hydrates the parts the
  user interacts with first, so a click on a ready section works even while
  another is still arriving.
</p>

<h3>What can suspend</h3>
<div class="table-scroll"><table>
<thead><tr><th>Suspends</th><th>Does not</th></tr></thead>
<tbody>
<tr><td><code>lazy()</code> components</td><td>A bare <code>fetch</code> in an effect</td></tr>
<tr><td>Framework data APIs, and Server Components</td><td><code>useState</code> loading flags</td></tr>
<tr><td>Query libraries in suspense mode</td><td>Anything you have not opted in</td></tr>
<tr><td><code>use(promise)</code> &mdash; see <a href="/react/react-use-hook">the use hook</a></td><td></td></tr>
</tbody>
</table></div>
<p>
  Suspense does not make ordinary fetching declarative on its own. The data
  source has to participate, which is why "just use Suspense for loading states"
  does not work in a plain Vite app without a library.
</p>

<h3>Pair it with an error boundary</h3>
<pre><code>&lt;ErrorBoundary fallback={&lt;Failed /&gt;}&gt;
  &lt;Suspense fallback={&lt;Skeleton /&gt;}&gt;
    &lt;Profile /&gt;
  &lt;/Suspense&gt;
&lt;/ErrorBoundary&gt;</code></pre>
<p>
  Suspense handles "not yet"; an <a href="/react/react-boundaries-portals">error
  boundary</a> handles "never". A chunk that fails to download &mdash; a deploy
  mid-session, a flaky connection &mdash; throws, and without a boundary that is
  a blank page.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "Suspense moves the loading state out of the component and into a boundary
    that owns a region, which is what makes streaming SSR and selective
    hydration possible. Its most important interaction is with transitions:
    inside one, React keeps the current content visible instead of replacing it
    with the fallback."
  </p>
</div>`,
};
