import type { Chapter } from "../types";

export const reactUseref: Chapter = {
  id: "react-useref",
  num: "I1",
  title: "useRef",
  short: "useRef",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle: "A box that survives renders and does not cause them.",
  body: `<h3>Two jobs, one hook</h3>
<p>
  <code>useRef</code> returns an object with a single <code>current</code>
  property. React keeps that object for the life of the component and never
  replaces it. Changing <code>current</code> does <b>not</b> trigger a render.
</p>
<pre><code>const ref = useRef(initial);   <span class="c">// { current: initial }, same object forever</span></code></pre>
<p>That one behaviour covers two very different uses.</p>

<h3>Job one: reaching a DOM node</h3>
<pre><code>function SearchBox() {
  const input = useRef(null);

  useEffect(() =&gt; {
    input.current.focus();          <span class="c">// after the DOM exists</span>
  }, []);

  return &lt;input ref={input} /&gt;;
}</code></pre>
<p>
  React sets <code>input.current</code> to the DOM node after committing, and
  back to <code>null</code> on unmount. During the first render it is
  <code>null</code> &mdash; which is why DOM work goes in an effect, not in the
  render body.
</p>
<p>
  Legitimate reasons to hold a DOM node: focus, text selection, scroll position,
  measuring, playing media, and handing the element to a non-React library like
  a chart or a map. Reading or writing anything React also controls is not on
  that list.
</p>

<h3>Job two: a value that must survive renders</h3>
<pre><code>const timer = useRef(null);

function start() {
  timer.current = setInterval(tick, 1000);   <span class="c">// no re-render, correctly</span>
}
function stop() {
  clearInterval(timer.current);
}</code></pre>
<p>
  A plain variable would be recreated each render; state would re-render the
  component for a value nothing displays. A ref is exactly the middle case:
  <b>remembered, but not rendered</b>.
</p>

<div class="table-scroll"><table>
<thead><tr><th></th><th>useState</th><th>useRef</th></tr></thead>
<tbody>
<tr><td>Survives re-renders</td><td><span class="chip tone-yes">yes</span></td><td><span class="chip tone-yes">yes</span></td></tr>
<tr><td>Changing it re-renders</td><td><span class="chip tone-yes">yes</span></td><td><span class="chip tone-bad">no</span></td></tr>
<tr><td>Can be read during render</td><td><span class="chip tone-yes">yes</span></td><td><span class="chip tone-bad">not safely</span></td></tr>
<tr><td>Updated by</td><td>a setter, replacing</td><td>assigning to <code>.current</code></td></tr>
</tbody>
</table></div>

<div class="bx is-prim">
  <span class="ttl">The rule that keeps refs safe</span>
  <p>
    Do not read or write <code>ref.current</code> during rendering. Rendering
    must be pure and repeatable; a ref is mutable state that React does not
    track, so reading it mid-render makes the output depend on something React
    cannot see. Refs belong in event handlers and effects.
  </p>
</div>

<h3>The classic use: previous value</h3>
<pre><code>function usePrevious(value) {
  const ref = useRef();
  useEffect(() =&gt; {
    ref.current = value;      <span class="c">// after render, so reads see the old one</span>
  });
  return ref.current;
}

const prevCount = usePrevious(count);   <span class="c">// undefined on first render</span></code></pre>
<p>
  The timing is the whole trick: the effect writes after the render that read
  it, so the ref is always one render behind.
</p>

<h3>The other classic: the latest callback</h3>
<pre><code>function useInterval(callback, delay) {
  const saved = useRef(callback);

  useEffect(() =&gt; { saved.current = callback; }, [callback]);   <span class="c">// always current</span>

  useEffect(() =&gt; {
    const id = setInterval(() =&gt; saved.current(), delay);
    return () =&gt; clearInterval(id);
  }, [delay]);                                                  <span class="c">// interval not restarted</span>
}</code></pre>
<p>
  Without the ref, the interval closes over the first render's
  <code>callback</code> and calls a stale function forever. Adding
  <code>callback</code> to the second effect's dependencies would fix the
  staleness by tearing down and recreating the interval on every render, which
  makes the timer drift. The ref gives you a fresh function without restarting
  anything &mdash; this is the pattern behind most "latest ref" code you will
  see in libraries.
</p>

<h3>Callback refs</h3>
<p>
  A <code>ref</code> prop can also be a function. React calls it with the node
  when it mounts and with <code>null</code> when it unmounts, which is useful
  when you need to run something the moment the node exists.
</p>
<pre><code>&lt;input ref={(node) =&gt; { if (node) node.focus(); }} /&gt;</code></pre>
<p class="sub">
  Define it outside render or memoise it &mdash; an inline arrow is a new
  function each render, so React detaches and reattaches the ref every time.
</p>
<p>
  Callback refs are also the answer to a list of refs, where
  <code>useRef</code> cannot help because you do not know the count in advance:
</p>
<pre><code>const rows = useRef(new Map());

&lt;li ref={(node) =&gt; {
  if (node) rows.current.set(item.id, node);
  else rows.current.delete(item.id);
}}&gt;</code></pre>

<h3>Refs to your own components</h3>
<p>
  In React 19, <code>ref</code> is an ordinary prop for function components, so
  a component can accept one and forward it:
</p>
<pre><code>function TextField({ ref, ...rest }) {
  return &lt;input ref={ref} {...rest} /&gt;;
}</code></pre>
<p>
  Before 19 this required <code>forwardRef</code>, which you will still meet in
  every existing codebase and most libraries:
</p>
<pre><code>const TextField = forwardRef(function TextField(props, ref) {
  return &lt;input ref={ref} {...props} /&gt;;
});</code></pre>
<p class="sub">
  <code>useImperativeHandle</code> narrows what the parent gets &mdash; instead
  of the whole DOM node, expose a small API such as
  <code>{ focus, clear }</code>. Reach for it rarely; a component that needs to
  be commanded from outside is often one that should have taken a prop.
</p>

<h3>When a ref is the wrong answer</h3>
<pre><code>const count = useRef(0);
count.current++;                     <span class="c">// ✗ the screen never updates</span>
return &lt;p&gt;{count.current}&lt;/p&gt;;</code></pre>
<p>
  If the value appears on screen, it is state. The question is not "does this
  change?" but <b>"does the UI need to change when it changes?"</b> &mdash;
  yes means state, no means ref.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "A ref is a mutable box that persists across renders without causing them,
    which makes it right for DOM nodes and for values the UI does not display —
    timers, previous values, the latest callback. Reading it during render
    breaks purity, so it belongs in handlers and effects."
  </p>
</div>`,
};
