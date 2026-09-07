import type { Chapter } from "../types";

export const reactEventsConditionals: Chapter = {
  id: "react-events-conditionals",
  num: "B5",
  title: "Events & conditional rendering",
  short: "Events & conditionals",
  levels: ["beginner"],
  practice: [],
  ready: true,
  subtitle: "Pass the function, do not call it — and know why && puts a zero on your page.",
  body: `<h3>Handlers are props holding functions</h3>
<pre><code>&lt;button onClick={handleClick}&gt;Save&lt;/button&gt;      <span class="c">// ✓ passes the function</span>
&lt;button onClick={handleClick()}&gt;Save&lt;/button&gt;    <span class="c">// ✗ calls it during render</span>
&lt;button onClick={() =&gt; remove(id)}&gt;Delete&lt;/button&gt; <span class="c">// ✓ wrap when you need an argument</span></code></pre>
<p>
  The second line is the most common beginner bug in React. It runs
  <code>handleClick</code> while rendering and hands React whatever it returned
  &mdash; usually <code>undefined</code>. If the handler sets state, you get an
  infinite render loop.
</p>

<h3>The event object</h3>
<p>
  Handlers receive a <b>SyntheticEvent</b> &mdash; React's wrapper with the same
  API as the native one, normalised across browsers. The real event is at
  <code>e.nativeEvent</code> if you ever need it.
</p>
<pre><code>function handleSubmit(e) {
  e.preventDefault();      <span class="c">// stop the page reloading</span>
  e.stopPropagation();     <span class="c">// stop it bubbling to parents</span>
  console.log(e.target.value, e.currentTarget);
}</code></pre>
<p class="sub">
  <code>e.target</code> is what was actually clicked, which may be a child.
  <code>e.currentTarget</code> is the element the handler is attached to. Use
  <code>currentTarget</code> when you want the thing you bound to.
</p>
<p>
  Returning <code>false</code> from a handler does nothing in React &mdash; that
  is a jQuery habit. Call <code>preventDefault()</code>.
</p>

<h3>Where events actually listen</h3>
<p>
  React does not attach a listener to each button. It attaches one listener per
  event type at the root of your app and works out which component it belongs
  to when the event bubbles up. That is why handlers are cheap even on a
  thousand rows, and why a stray <code>stopPropagation</code> on a native
  listener can stop a React handler firing.
</p>

<h3>Conditional rendering: four ways</h3>

<h4>Ternary, when there are two outcomes</h4>
<pre><code>&lt;div&gt;{isLoggedIn ? &lt;Dashboard /&gt; : &lt;Login /&gt;}&lt;/div&gt;</code></pre>

<h4>&amp;&amp;, when there is one</h4>
<pre><code>{error &amp;&amp; &lt;p className="error"&gt;{error}&lt;/p&gt;}</code></pre>

<div class="bx is-prim">
  <span class="ttl">The zero trap</span>
  <pre><code>{items.length &amp;&amp; &lt;List items={items} /&gt;}</code></pre>
  <p>
    With an empty list this is <code>0 &amp;&amp; ...</code>, which evaluates to
    <code>0</code> &mdash; and React renders <code>0</code> as visible text. A
    stray zero appears on the page and nobody can find where it came from.
  </p>
  <pre><code>{items.length &gt; 0 &amp;&amp; &lt;List items={items} /&gt;}   <span class="c">// ✓ force a boolean</span>
{items.length ? &lt;List items={items} /&gt; : null}   <span class="c">// ✓ or a ternary</span></code></pre>
</div>

<h4>Early return, when the whole component branches</h4>
<pre><code>function Profile({ user }) {
  if (!user) return &lt;Spinner /&gt;;
  if (user.banned) return &lt;Banned /&gt;;

  return &lt;div&gt;{user.name}&lt;/div&gt;;   <span class="c">// the happy path, unindented</span>
}</code></pre>
<p class="sub">
  This is usually the most readable option once you have more than two
  branches, and it keeps the main case at the left margin.
</p>

<h4>A lookup object, when there are many</h4>
<pre><code>const views = {
  loading: &lt;Spinner /&gt;,
  error: &lt;ErrorPanel /&gt;,
  empty: &lt;Empty /&gt;,
  ready: &lt;List items={items} /&gt;,
};

return views[status] ?? null;</code></pre>
<p>
  Cleaner than a chain of ternaries, and it fails loudly if you add a status and
  forget the view. Note that every branch is <em>constructed</em> here, so keep
  the elements cheap or use a function per key.
</p>

<h3>The four states every screen has</h3>
<p>
  Beginner React tends to render only the happy path. A screen that touches data
  has four, and the last two are the ones users actually hit.
</p>
<div class="table-scroll"><table>
<thead><tr><th>State</th><th>What the user sees</th></tr></thead>
<tbody>
<tr><td>Loading</td><td>A skeleton or spinner &mdash; and ideally the shape of what is coming</td></tr>
<tr><td>Error</td><td>What went wrong and what to do, not "Something went wrong"</td></tr>
<tr><td>Empty</td><td>Why it is empty and how to fill it, not a blank box</td></tr>
<tr><td>Ready</td><td>The data</td></tr>
</tbody>
</table></div>
<p class="sub">
  Interviewers watching you build a screen are usually counting these. Handling
  the empty state unprompted is one of the cheapest signals you can give.
</p>

<h3>Conditional attributes</h3>
<pre><code>&lt;button
  className={"btn " + (active ? "is-active" : "")}
  disabled={isSaving}
  aria-pressed={active}
&gt;</code></pre>
<p>
  <code>disabled={false}</code> removes the attribute entirely &mdash; React
  understands boolean DOM attributes, so you never need
  <code>{isSaving ? "disabled" : ""}</code>.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "Handlers are props holding function references, so you pass the function
    rather than calling it, and React delegates the real listeners to the root.
    For conditionals, <code>&amp;&amp;</code> is fine as long as the left side is
    a boolean &mdash; with a number, zero renders."
  </p>
</div>`,
};
