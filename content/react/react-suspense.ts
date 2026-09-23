import type { Chapter } from "../types";

export const reactSuspense: Chapter = {
  id: "react-suspense",
  num: "A3",
  title: "Suspense & code splitting",
  short: "Suspense",
  levels: ["advanced"],
  practice: ["ex-comp-suspense-boundary-swap", "ex-comp-independent-suspense-boundaries"],
  ready: true,
  subtitle: "Declaring where a loading state lives, instead of threading one through every component.",
  body: `<h3>The idea</h3>
<pre><code>&lt;Suspense fallback={&lt;Skeleton /&gt;}&gt;
  &lt;Profile /&gt;      <span class="c">// if this suspends, the skeleton shows</span>
&lt;/Suspense&gt;</code></pre>
<p>
  A component "suspends" when it needs something that is not ready yet. React
  stops rendering that subtree, shows the nearest boundary's fallback, and
  retries when the thing arrives. The component itself contains no
  <code>isLoading</code> check &mdash; the loading state moved out, to a place
  that can describe the whole region.
</p>
<p class="sub">
  The mechanism is a thrown promise, which is why older articles describe it
  that way. You never throw one yourself: you reach it through
  <code>lazy</code>, <code>use</code>, or a library that supports Suspense.
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
  The module must have a default export; for a named one, map it:
  <code>lazy(() =&gt; import("./Chart").then((m) =&gt; ({ default: m.Chart })))</code>.
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

<figure class="viz-figure">
  <svg viewBox="0 0 560 210" role="img" aria-label="A page with a Suspense boundary around Feed. Header renders at once; while Feed is loading the boundary shows its skeleton.">
    <rect class="viz-rect" x="10" y="10" width="540" height="190" rx="10"></rect>
    <text class="viz-label" x="24" y="32">Page</text>
    <rect class="viz-rect viz-rect--client" x="30" y="48" width="150" height="40" rx="6"></rect>
    <text class="viz-label" x="44" y="72">Header  (ready)</text>
    <rect class="viz-rect viz-rect--wait viz-rect--server" x="30" y="108" width="500" height="80" rx="8"></rect>
    <text class="viz-label" x="44" y="128">&lt;Suspense fallback={&lt;FeedSkeleton /&gt;}&gt;</text>
    <rect class="viz-rect viz-rect--wait" x="44" y="138" width="200" height="38" rx="6"></rect>
    <text class="viz-label" x="58" y="161">Feed  (still loading)</text>
    <rect class="viz-rect" x="300" y="138" width="216" height="38" rx="6"></rect>
    <text class="viz-label" x="314" y="161">FeedSkeleton  (shown now)</text>
    <path class="viz-line" d="M244 157 L300 157"></path>
  </svg>
  <figcaption>The boundary owns the loading state for its region. Header is outside it, so it appears at once.</figcaption>
</figure>

<h3>Nested boundaries reveal outside in</h3>
<pre><code>&lt;Suspense fallback={&lt;PageSkeleton /&gt;}&gt;
  &lt;Article /&gt;
  &lt;Suspense fallback={&lt;CommentsSkeleton /&gt;}&gt;
    &lt;Comments /&gt;
  &lt;/Suspense&gt;
&lt;/Suspense&gt;</code></pre>
<p>
  While <code>Article</code> is loading, the page skeleton shows. When it is
  ready the article appears, and if comments are still loading their own
  skeleton takes their place. Nesting is how you say "this part may arrive
  later, but that part must not". Whatever is inside the outer boundary and
  outside the inner one appears together, as a unit.
</p>
<p class="sub">
  React also paces the reveals: suspended content is revealed at most once
  every 300ms, and boundaries that become ready inside that window appear
  together instead of popping in one by one. Since React 19, when something
  suspends, the fallback is committed straight away and the suspended siblings
  are rendered afterwards to start their requests early, so the fallback appears
  faster than it did in React 18.
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
  This is the rule precisely: once a boundary is showing content, suspending
  again brings the fallback back <b>unless</b> the update came from
  <code>startTransition</code> or <code>useDeferredValue</code>. It is the
  difference between a page that flashes on every navigation and one that feels
  continuous, and it is why routers wrap navigation in a transition. When
  content is hidden again, React cleans up its layout effects and runs them
  again once it reappears.
</p>

<h3>Resetting a boundary on navigation</h3>
<pre><code>&lt;ProfilePage key={userId} /&gt;</code></pre>
<p>
  Going from one profile to another inside a transition keeps the old profile
  visible while the new one loads, which is usually wrong: the user asked for a
  different person. A <code>key</code> tells React this is different content, so
  the boundary resets and shows its fallback. The key can sit on the boundary or
  any component above it.
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
<p>
  Boundaries also contain server errors. If a component throws while rendering
  on the server, React does not abort the page. It puts the nearest boundary's
  fallback into the HTML and tries that component again on the client. One
  failing widget costs you a spinner, not a 500 &mdash; and if the client render
  fails too, the error boundary takes over.
</p>

<h3>What can suspend</h3>
<div class="table-scroll"><table>
<thead><tr><th>Suspends</th><th>Does not</th></tr></thead>
<tbody>
<tr><td><code>lazy()</code> components</td><td>A bare <code>fetch</code> in an effect or event handler</td></tr>
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
<p class="sub">
  One more caveat: state is not kept for a render that suspended before it ever
  mounted. When the data arrives React renders that tree from scratch, so a
  component that suspends on first render cannot rely on state it set before
  suspending.
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
<p>
  Recovering is not the same as catching. A lazy component remembers that its
  import failed, so re-rendering it will not try again. After a deploy the old
  chunk name may simply no longer exist. The dependable recovery for a failed
  chunk is a fallback with a button that reloads the page; for failed data, the
  boundary's reset should also trigger a fresh request, otherwise it retries
  into the same rejected promise.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "Suspense moves the loading state out of the component and into a boundary
    that owns a region, which is what makes streaming SSR and selective
    hydration possible. Its most important interaction is with transitions:
    inside one, React keeps the current content visible instead of replacing it
    with the fallback — and a key is how you opt back out when the content is
    genuinely different."
  </p>
</div>`,
};
