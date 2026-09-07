import type { Chapter } from "../types";

export const reactBoundariesPortals: Chapter = {
  id: "react-boundaries-portals",
  num: "I9",
  title: "Error boundaries, portals & keys in depth",
  short: "Boundaries & portals",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle: "Containing a crash, escaping the DOM tree, and using keys on purpose.",
  body: `<h3>Why one broken component blanks the page</h3>
<p>
  Since React 16, an error thrown during render that nothing catches unmounts
  the <b>entire tree</b>. That is deliberate: a half-rendered UI showing stale
  or wrong data is considered worse than showing nothing. So you have to decide
  where the damage stops, and that is an error boundary.
</p>

<h3>Error boundaries are still classes</h3>
<pre><code>class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };                     <span class="c">// render the fallback</span>
  }

  componentDidCatch(error, info) {
    logToService(error, info.componentStack);   <span class="c">// report it</span>
  }

  render() {
    if (this.state.error) return this.props.fallback;
    return this.props.children;
  }
}</code></pre>
<p>
  There is no hook equivalent, which is the one remaining reason to write a
  class in React. In practice you write it once, or install
  <code>react-error-boundary</code> and get a reset function with it.
</p>

<h3>What they do and do not catch</h3>
<div class="table-scroll"><table>
<thead><tr><th>Caught</th><th>Not caught</th></tr></thead>
<tbody>
<tr><td>Errors during render</td><td>Errors in event handlers</td></tr>
<tr><td>Errors in lifecycle methods</td><td>Errors in <code>setTimeout</code> or a promise</td></tr>
<tr><td>Errors in constructors of the tree below</td><td>Errors in the boundary itself</td></tr>
<tr><td></td><td>Server-side rendering errors</td></tr>
</tbody>
</table></div>
<p>
  Handlers and async code are not caught because React is not on the stack when
  they run &mdash; there is no render to abandon. Use <code>try/catch</code> there
  and set error state yourself.
</p>

<h3>Where to put them</h3>
<pre><code>&lt;ErrorBoundary fallback={&lt;FullPageError /&gt;}&gt;        <span class="c">// last resort</span>
  &lt;Layout&gt;
    &lt;ErrorBoundary fallback={&lt;WidgetError /&gt;}&gt;      <span class="c">// one panel fails alone</span>
      &lt;RevenueChart /&gt;
    &lt;/ErrorBoundary&gt;
    &lt;Outlet /&gt;
  &lt;/Layout&gt;
&lt;/ErrorBoundary&gt;</code></pre>
<p>
  Granularity is the whole design decision. One boundary at the root turns any
  bug into a blank page; a boundary around each independent panel means a broken
  chart leaves the rest of the dashboard usable. Put them where a failure is
  survivable.
</p>
<p class="sub">
  Give the fallback a way out &mdash; a retry button that resets the boundary's
  state, or a link home. A dead end with "Something went wrong" is barely better
  than the blank page.
</p>

<h3>Portals: rendering somewhere else in the DOM</h3>
<pre><code>createPortal(children, domNode)

function Modal({ children, onClose }) {
  return createPortal(
    &lt;div className="overlay" onClick={onClose}&gt;
      &lt;div className="modal"&gt;{children}&lt;/div&gt;
    &lt;/div&gt;,
    document.body
  );
}</code></pre>
<p>
  The modal is still a child in the <b>React tree</b> &mdash; it receives
  context, its state belongs to its parent, and events bubble to its React
  parent, not its DOM parent. Only the DOM placement changes.
</p>

<div class="bx is-prim">
  <span class="ttl">The problem portals actually solve</span>
  <p>
    A modal with <code>z-index: 9999</code> can still render behind a header if
    an ancestor created a <b>stacking context</b> &mdash; which happens with
    <code>transform</code>, <code>opacity</code> below 1, <code>filter</code> or
    <code>will-change</code>, not just <code>position</code>. No z-index inside
    that context can escape it. The same applies to
    <code>overflow: hidden</code> clipping a dropdown. A portal moves the node
    out of the offending subtree entirely.
  </p>
</div>

<h3>A modal is not just a portal</h3>
<p>
  The DOM placement is the easy part. A correct dialog also needs focus moved in
  on open, focus trapped while it is open, focus returned to the trigger on
  close, Escape to dismiss, the background made inert, and
  <code>role="dialog" aria-modal="true"</code> with a label.
</p>
<pre><code>&lt;dialog ref={ref} onClose={onClose}&gt;   <span class="c">// the browser does most of it</span></code></pre>
<p>
  The native <code>&lt;dialog&gt;</code> element with
  <code>showModal()</code> handles focus, Escape, inertness and the top layer
  for free &mdash; and being in the top layer means it does not need a portal at
  all. Worth reaching for before a library.
</p>

<h3>Keys as a deliberate tool</h3>
<p>
  Beyond lists, changing a <code>key</code> is how you tell React "this is a
  different instance now". React unmounts the old component and mounts a fresh
  one, resetting all of its state.
</p>
<pre><code>&lt;ProfileForm key={userId} user={user} /&gt;      <span class="c">// switching user clears the draft</span>
&lt;ErrorBoundary key={location.pathname}&gt;      <span class="c">// navigating clears a caught error</span>
&lt;Chart key={dataVersion} data={data} /&gt;      <span class="c">// force a third-party widget to rebuild</span></code></pre>
<p>
  Each of these replaces an effect that watched a value and reset something.
  Fewer moving parts, and no render with the stale value first.
</p>
<p class="sub">
  The cost is real: everything below unmounts, so scroll position, focus and any
  in-flight work in that subtree are discarded. Use it when you want exactly
  that, not as a way to force a refresh.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "An uncaught render error unmounts the whole tree, so boundaries are how you
    decide where a failure stops — per panel, not just at the root, and they
    catch render errors but never handlers or async code. Portals change the DOM
    parent without changing the React parent, which is how you escape a stacking
    context or an <code>overflow: hidden</code>."
  </p>
</div>`,
};
