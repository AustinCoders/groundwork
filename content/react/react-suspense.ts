import type { Chapter } from "../types";

export const reactSuspense: Chapter = {
  id: "react-suspense",
  num: "A3",
  title: "Suspense & code splitting",
  short: "Suspense",
  levels: ["advanced"],
  prerequisites: ["react-concurrent", "react-boundaries-portals", "react-use-hook"],
  practice: ["ex-comp-suspense-boundary-swap", "ex-comp-independent-suspense-boundaries"],
  ready: true,
  subtitle: "Declaring where a loading state lives, instead of threading one through every component.",
  body: `<p>
  Every screen that loads data has the same question: while something is not ready, what does the user see, and where?
  Before Suspense the answer lived inside each component as an <code>isLoading</code> flag, and a page with five data
  sources had five spinners that appeared and vanished independently. Suspense moves that answer to a boundary in the
  tree. This chapter covers what suspending means, code splitting with <code>lazy</code>, how to place boundaries,
  nested reveals, the important interaction with transitions, resetting with a key, streaming server rendering, what can
  and cannot suspend, and pairing with error boundaries. The sequences quoted were checked against React 19.3 with
  <code>use</code> and a hand-made promise cache.
</p>

<h3>The idea</h3>
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

<h3>Worked example: one boundary, three kinds of update</h3>
<p>
  A tab shows data read with <code>use(load(id))</code>, inside
  <code>&lt;Suspense fallback={&lt;i&gt;loading&lt;/i&gt;}&gt;</code>. Each step below waits for the promise named.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Step</th><th>What the user sees</th><th>Why</th></tr></thead>
<tbody>
<tr><td>Mount with tab a</td><td>loading</td><td>Nothing to show yet; the fallback is the only content</td></tr>
<tr><td>a resolves</td><td>data a</td><td>React retries the render and commits the content</td></tr>
<tr><td>Urgent <code>setId("b")</code></td><td>loading (data a hidden)</td><td>An urgent update that suspends brings the fallback back. The old content stays in the DOM with <code>display: none</code>, so its state survives</td></tr>
<tr><td>b resolves</td><td>data b</td><td>Content replaces the fallback</td></tr>
<tr><td><code>startTransition(() =&gt; setId("c"))</code></td><td>data b, with a pending marker</td><td>Inside a transition React keeps the visible content and sets <code>isPending</code></td></tr>
<tr><td>c resolves</td><td>data c</td><td>The transition commits</td></tr>
<tr><td>Transition to d, with <code>key={id}</code> on the boundary</td><td>loading</td><td>A new key is a new boundary, which has no content to keep</td></tr>
</tbody>
</table></div>
<p>
  That table is most of what there is to know about Suspense in practice. The fallback shows when a boundary has nothing
  to show, or when an urgent update suspends. Transitions keep content. Keys opt back out. Every line was observed, not
  inferred: checked, the urgent switch produced <code>&lt;p style="display: none !important"&gt;data a&lt;/p&gt;</code>
  next to the fallback, so the hidden tree was not unmounted.
</p>

<h3>Compared with loading flags</h3>
<div class="table-scroll"><table>
<thead><tr><th></th><th><code>isLoading</code> in each component</th><th>Suspense boundary</th></tr></thead>
<tbody>
<tr><td>Where the loading UI lives</td><td>Inside every component that fetches</td><td>In one place per region</td></tr>
<tr><td>Code that renders data</td><td>Must handle "not loaded yet" on every path</td><td>Only ever sees loaded data</td></tr>
<tr><td>Several sources in one region</td><td>Several spinners, appearing and vanishing independently</td><td>One fallback until the region is ready</td></tr>
<tr><td>Keeping old content while new data loads</td><td>Hand-written, per component</td><td>A transition</td></tr>
<tr><td>Server streaming</td><td>Not possible from flags</td><td>Built on boundaries</td></tr>
</tbody>
</table></div>
<p>
  The second row is the one that changes day-to-day code most. A component that reads data with <code>use</code> is
  written as if the data were already there, because by the time its code past that line runs, it is. Type definitions
  get simpler too: no <code>data | undefined</code> to narrow on every access.
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
  skeleton takes their place. Checked: the page fallback showed first; when the
  article's promise resolved, the article appeared with the comments fallback
  beside it; then the comments. Nesting is how you say "this part may arrive
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

<h3>How suspending works</h3>
<p>
  When a component calls <code>use(promise)</code> and the promise has not settled, <code>use</code> throws a special
  internal exception that carries the promise. React catches it during render, walks up the fiber tree to the nearest
  Suspense boundary, and renders that boundary's fallback instead of its children. It also attaches a callback to the
  promise. When the promise settles, the callback schedules a retry, and React renders the boundary's children again.
</p>
<p>
  On the retry, the component calls <code>use</code> again with the <em>same</em> promise. React records each
  promise's outcome on the promise object itself (a status and a value), so this time <code>use</code> returns the value
  synchronously and rendering continues. If the promise rejected, <code>use</code> throws the error, and the nearest
  error boundary takes over. Two consequences follow directly. The promise must be the same object on the retry, which
  is why it must be cached rather than created in render. And because the component is simply called again, everything
  before the <code>use</code> call runs again too, which is fine for pure render code and another reason not to put side
  effects in render.
</p>

<h3>A minimal cache, to see the moving parts</h3>
<pre><code>const cache = new Map();

function load(id) {
  if (!cache.has(id)) cache.set(id, fetch("/api/items/" + id).then((r) =&gt; r.json()));
  return cache.get(id);
}

function Item({ id }) {
  const item = use(load(id));
  return &lt;h2&gt;{item.title}&lt;/h2&gt;;
}</code></pre>
<p>
  This is the whole contract: the same input returns the same promise, so retries find a settled one. It is also
  exactly where the hand-made version stops being enough. It never forgets anything, so memory grows and data goes
  stale. A rejected promise is cached too, so a failed request can never be retried. There is no way to invalidate an
  entry after a mutation, and no deduplication across components that need related data. Query libraries and framework
  data layers solve those problems, which is why the advice is to use one and to treat this snippet as an explanation,
  not a pattern to ship.
</p>

<h3>Testing Suspense</h3>
<p>
  In tests, render inside <code>act</code> and assert on the fallback first. Then resolve the data inside another
  <code>act</code>, or use an async query such as <code>findByText</code> that waits for it, and assert on the content.
  Mock the data source with promises you control, as the worked example did, so each step is deterministic. If React
  warns that a suspended resource finished loading outside <code>act</code>, the resolution happened outside one, and the
  assertion that follows may see an intermediate state.
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

<h3>What to split, and how to tell it worked</h3>
<p>
  Code splitting trades one larger download for several smaller ones, and the second request costs a round trip at the
  moment the user asks for the feature. It pays off when the split part is large and most visitors never need it. Good
  candidates are routes other than the landing page, rich editors, charting and map libraries, admin-only screens, and
  dialogs behind an explicit action. Poor candidates are small components, anything above the fold, and anything nearly
  every visitor opens, where splitting only adds a waterfall.
</p>
<p>
  Measure with the bundler's analysis report before and after: the initial chunk should shrink by roughly the size of
  what you split, and the network panel should show the new chunk loading only on demand. Frameworks give you the same
  tool under other names (route-based splitting is automatic in most of them, and <code>next/dynamic</code> wraps
  <code>lazy</code> with a loading component), but the trade-off is identical. Pair every split with a prefetch on intent
  where the delay would be felt.
</p>

<h3>Animating reveals</h3>
<p>
  React 19.3 made <code>&lt;ViewTransition&gt;</code> stable, and it integrates with Suspense: wrapping a boundary's
  content and fallback lets the swap from skeleton to content cross-fade instead of jumping, using the browser's View
  Transition API. Because reveals are already batched and paced, the animation runs once per group of boundaries rather
  than once per component. Keep the motion subtle, and respect reduced-motion settings; the point is to make the change
  legible, not to decorate it.
</p>

<h3>Designing fallbacks</h3>
<p>
  A fallback is part of the interface, not a placeholder for one. Three properties make it good. It has the <b>same
  size and shape</b> as the content, so nothing below it moves when the swap happens; a skeleton with the real layout's
  boxes does this, a centred spinner does not. It is <b>scoped to its region</b>, so the rest of the page stays usable.
  And it is <b>announced</b> to assistive technology: a region that is loading can carry <code>aria-busy="true"</code>,
  and a skeleton should be hidden from screen readers with a short visually hidden "Loading comments" text instead,
  rather than read out as a sequence of empty boxes.
</p>
<p>
  Avoid the flash of a fallback for fast loads. React already waits briefly and batches reveals, and transitions keep
  existing content. For a first load that is usually quick, a fallback that fades in after a short delay through CSS
  avoids a skeleton flickering for a fraction of a second.
</p>

<h3>Worked example: placing boundaries on a dashboard</h3>
<p>
  A dashboard has a header with the user's name, a summary of four numbers, a large chart, and an activity feed. The
  name comes from the session and is instant; the summary takes 200 ms; the chart 800 ms; the feed varies.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Region</th><th>Boundary</th><th>Reason</th></tr></thead>
<tbody>
<tr><td>Header</td><td>none</td><td>Never suspends; it should never wait for anything</td></tr>
<tr><td>Summary and chart</td><td>one boundary around both</td><td>The numbers and the chart describe the same data, and a chart without its totals is confusing. Showing them together costs at most the chart's delay</td></tr>
<tr><td>Feed</td><td>its own boundary</td><td>Independent, variable, and below the fold; it should never hold up the rest</td></tr>
<tr><td>Each feed item's avatar</td><td>none</td><td>A boundary per image would make the feed assemble in dozens of stages</td></tr>
</tbody>
</table></div>
<p>
  The question for each boundary is the one a designer would ask: which parts does the user think of as a unit, and
  which can arrive later without the page feeling broken? Data dependencies inform it, but the answer is about the
  user's reading of the page.
</p>

<h3>Avoiding waterfalls</h3>
<p>
  Suspense makes one performance trap easy to fall into. If a parent suspends on its data and only renders the child
  when that data arrives, and the child then starts its own request, the two requests run one after the other.
</p>
<pre><code>function Profile({ id }) {
  const user = use(fetchUser(id));          <span class="c">// request 1</span>
  return &lt;Posts userId={user.id} /&gt;;       <span class="c">// request 2 only starts after 1 finishes</span>
}</code></pre>
<p>
  When the child does not actually need the parent's result (here <code>id</code> is already known), start both
  requests before either suspends, at the route or in the parent, and pass the promises down:
  <code>const userPromise = fetchUser(id); const postsPromise = fetchPosts(id);</code> then
  <code>use</code> each where it is needed. Framework loaders and Server Components exist partly to make this the
  default. React 19's habit of committing a fallback and then pre-rendering suspended siblings helps by starting their
  requests early, but it cannot start a request that only exists inside a component that has not rendered yet.
</p>

<h3>Pitfalls</h3>
<ul>
  <li><b><code>lazy</code> called inside a component</b>: a new type every render, an endless fallback.</li>
  <li><b>Creating the promise during render</b> without a cache: each retry creates a new promise, which suspends again forever.</li>
  <li><b>No error boundary around a lazy component</b>: a failed chunk download blanks the page.</li>
  <li><b>Navigating without a transition</b>: every navigation flashes the fallback over content that was visible.</li>
  <li><b>Keeping old content in a transition when the content is genuinely different</b>: add a key.</li>
  <li><b>One boundary per small component</b>: the page assembles in visible, shifting stages.</li>
  <li><b>Fallbacks with a different size from the content</b>: layout shift on every reveal.</li>
  <li><b>Request waterfalls</b> from components that only start fetching once their parent has resolved.</li>
  <li><b>Expecting Suspense to work with a plain <code>fetch</code> in an effect</b>: the data source must support it.</li>
</ul>

<h3>Recognising it in a problem</h3>
<ul>
  <li>"Switching tabs flashes a spinner even though we already showed something": wrap the switch in a transition.</li>
  <li>"Opening another user's profile keeps showing the previous user while loading": key the page by user id.</li>
  <li>"The loading spinner never goes away": a promise created during render, or <code>lazy</code> inside a component.</li>
  <li>"After a deploy, some users see a blank page when opening settings": a failed chunk with no error boundary.</li>
  <li>"Everything pops in one piece at a time": too many boundaries; group what the user reads as one unit.</li>
  <li>"The page takes the sum of all request times": a waterfall; start requests in parallel.</li>
</ul>

<h3>Interview questions</h3>
<p><b>1. What is Suspense, and what does it mean for a component to suspend?</b></p>
<p>
  A component suspends when it needs something that is not ready, such as a lazy component's code or a promise read with
  <code>use</code>. React stops rendering that subtree, shows the nearest <code>&lt;Suspense&gt;</code> boundary's
  fallback, and retries when the promise resolves. The loading state belongs to the boundary instead of each component.
</p>
<p class="sub">
  <i>Follow-up: can you fetch in an effect and get Suspense?</i> No. Only sources that integrate with it suspend:
  <code>lazy</code>, <code>use</code> with a cached promise, Suspense-enabled libraries and frameworks.
</p>
<p><b>2. What happens when a component that is already showing content suspends again?</b></p>
<p>
  For an urgent update, the boundary shows its fallback again, and the previous content is hidden rather than unmounted.
  For an update inside a transition or from <code>useDeferredValue</code>, React keeps the previous content visible until
  the new content is ready. A key on the boundary or above it forces the fallback when the content is a different thing.
</p>
<p><b>3. How do you decide where to put boundaries?</b></p>
<p>
  Around regions the user perceives as units, with fallbacks the same shape as the content. Things that must appear
  together share a boundary; independent or slow regions get their own; tiny pieces get none. Nesting expresses
  "this may come later, that may not".
</p>
<p><b>4. How does Suspense relate to streaming server rendering?</b></p>
<p>
  Boundaries are the unit of streaming. The server sends the shell with fallbacks immediately and streams each boundary's
  HTML as its data resolves; hydration is also selective by boundary, prioritising the region the user interacts with.
  A server render error inside a boundary sends the fallback and retries on the client.
</p>
<p><b>5. How should a failed lazy chunk be handled?</b></p>
<p>
  With an error boundary around the Suspense boundary. A failed lazy import is cached, so retrying the same component
  does not reload it; the dependable recovery is a fallback that offers to reload the page.
</p>
<p><b>6. A profile page loads the user, then the user's posts, and takes the sum of both request times. Why, and how do you fix it?</b></p>
<p>
  A waterfall: the posts component only renders, and so only starts its request, after the user's data resolves. If the
  posts request only needs the id the page already has, start both requests at the same time, in the route loader or in
  the parent, and pass the promises down to be read with <code>use</code> where each is needed. Each section can then
  have its own boundary and appear as soon as its data does.
</p>
<div class="bx is-prim">
  <span class="ttl">The trap question</span>
  <p>
    "Why does this component suspend forever?" <code>const data = use(fetch(url).then((r) =&gt; r.json()));</code> The
    promise is created during render. When it resolves, React retries the render, which creates a new, pending promise,
    which suspends again. A promise passed to <code>use</code> must be cached, created outside render, or come from a
    library or framework that caches it.
  </p>
</div>
<div class="bx is-ref">
  <span class="ttl">Say it like this</span>
  <p>
    "Suspense moves the loading state out of components into a boundary that owns a region, which is also what makes
    streaming SSR and selective hydration possible. A component suspends through <code>lazy</code>, <code>use</code> on
    a cached promise, or a library that supports it. The key interaction is with transitions: an urgent update that
    suspends shows the fallback, a transition keeps the current content, and a key opts back out when the content is
    genuinely different. I place boundaries around units the user perceives, and wrap them in an error boundary."
  </p>
</div>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Trace one boundary through mount, an urgent switch, a transition and a keyed switch.</li>
    <li>Split a route with <code>lazy</code> at module scope and prefetch it on hover.</li>
    <li>Place boundaries on a dashboard and justify each one.</li>
    <li>Predict the reveal order of nested boundaries.</li>
    <li>Explain why a promise created during render suspends forever, and fix it.</li>
    <li>Turn a request waterfall into parallel requests.</li>
    <li>Pair Suspense with an error boundary and recover from a failed chunk, including after a deploy.</li>
    <li>Describe how boundaries drive streaming and selective hydration.</li>
    <li>Explain how <code>use</code> suspends and why the retry must find the same promise.</li>
    <li>Write a test that asserts on the fallback, resolves the data, then asserts on the content.</li>
    <li>Decide whether a component is worth splitting, and measure the result.</li>
  </ul>
</div>`,
};
