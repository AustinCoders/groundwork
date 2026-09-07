import type { Chapter } from "../types";

export const reactComponents: Chapter = {
  id: "react-components",
  num: "B2",
  title: "Components & composition",
  short: "Components",
  levels: ["beginner"],
  practice: [],
  ready: true,
  subtitle: "A component is a function that takes data and returns a description of a screen.",
  body: `<h3>The whole idea</h3>
<p>
  A React component is a JavaScript function that returns JSX. That is the
  entire definition. It takes one argument, conventionally called
  <code>props</code>, and it returns an element tree.
</p>
<pre><code>function Greeting() {
  return &lt;h1&gt;Hello&lt;/h1&gt;;
}

<span class="c">// used like a tag</span>
&lt;Greeting /&gt;</code></pre>

<h3>The capital letter is not style</h3>
<p>
  <code>&lt;greeting /&gt;</code> compiles to <code>jsx("greeting", ...)</code>
  &mdash; the string <code>"greeting"</code>, which React reads as "an HTML tag
  called greeting". <code>&lt;Greeting /&gt;</code> compiles to
  <code>jsx(Greeting, ...)</code> &mdash; a reference to your function.
</p>
<p>
  Lowercase means DOM tag; capitalised means component. That is why a
  lowercase component silently renders nothing instead of erroring.
</p>

<h3>Composition</h3>
<p>
  Components nest, and that is how every React app is built: one tree, made of
  functions calling into other functions.
</p>
<pre><code>function App() {
  return (
    &lt;Page&gt;
      &lt;Header /&gt;
      &lt;Article title="Closures" /&gt;
      &lt;Footer /&gt;
    &lt;/Page&gt;
  );
}</code></pre>

<h3>children</h3>
<p>
  Whatever you put between a component's tags arrives as
  <code>props.children</code>. This is the mechanism behind every wrapper you
  will ever write &mdash; cards, modals, layouts, page shells.
</p>
<pre><code>function Card({ title, children }) {
  return (
    &lt;section className="card"&gt;
      &lt;h2&gt;{title}&lt;/h2&gt;
      &lt;div className="card__body"&gt;{children}&lt;/div&gt;
    &lt;/section&gt;
  );
}

&lt;Card title="Notes"&gt;
  &lt;p&gt;Anything at all goes here.&lt;/p&gt;
  &lt;Button /&gt;
&lt;/Card&gt;</code></pre>
<p>
  <code>Card</code> knows nothing about what it wraps. That ignorance is the
  point: it is what makes it reusable. A component that reaches inside its
  children to check what they are has usually made a mistake.
</p>

<div class="bx is-prim">
  <span class="ttl">Composition instead of configuration</span>
  <p>
    When a component grows a pile of boolean props &mdash;
    <code>showHeader</code>, <code>showFooter</code>, <code>compact</code>,
    <code>withIcon</code> &mdash; that is usually a sign it should be taking
    children instead. Passing the header <em>in</em> is more flexible than
    passing a flag that asks it to draw one.
  </p>
</div>

<h3>Named slots</h3>
<p>
  <code>children</code> is one slot. When you need several, pass elements as
  ordinary props &mdash; there is nothing special about <code>children</code>
  except its name.
</p>
<pre><code>function Layout({ sidebar, main }) {
  return (
    &lt;div className="layout"&gt;
      &lt;aside&gt;{sidebar}&lt;/aside&gt;
      &lt;main&gt;{main}&lt;/main&gt;
    &lt;/div&gt;
  );
}

&lt;Layout sidebar={&lt;Nav /&gt;} main={&lt;Article /&gt;} /&gt;</code></pre>

<h3>Components must be pure</h3>
<p>
  Given the same props, a component must return the same thing and change
  nothing outside itself. React relies on this: it may call your function more
  than once for a single screen, and in development it deliberately does, to
  surface exactly this kind of bug.
</p>
<div class="table-scroll"><table>
<thead><tr><th></th><th>Inside the component body</th></tr></thead>
<tbody>
<tr><td><span class="chip tone-yes">fine</span></td><td>Reading props and state, computing values, building JSX</td></tr>
<tr><td><span class="chip tone-bad">no</span></td><td>Mutating a prop or a variable defined outside</td></tr>
<tr><td><span class="chip tone-bad">no</span></td><td>Writing to the DOM directly</td></tr>
<tr><td><span class="chip tone-bad">no</span></td><td>Fetching, timers, subscriptions, <code>localStorage</code></td></tr>
</tbody>
</table></div>
<p>
  Everything in the "no" column belongs in an event handler or an
  <a href="/react/react-useeffect-basics">effect</a>. Purity is not
  dogma here &mdash; it is the assumption that lets React render, abandon that
  render, and start again without your code noticing.
</p>

<h3>The mistake that costs an afternoon</h3>
<p>
  Never define a component inside another component.
</p>
<pre><code>function Page() {
  <span class="c">// ✗ a brand-new function on every render</span>
  function Row({ label }) {
    return &lt;li&gt;{label}&lt;/li&gt;;
  }
  return &lt;ul&gt;&lt;Row label="one" /&gt;&lt;/ul&gt;;
}</code></pre>
<p>
  Each render creates a new <code>Row</code> function. React compares element
  <em>types</em> to decide whether to keep a DOM node, and a new function is a
  new type &mdash; so it throws the old node away and builds a fresh one every
  render. Anything inside loses its state, its focus and its scroll position.
  Move <code>Row</code> out to the module level and it is fixed.
</p>

<h3>How big should a component be?</h3>
<p>
  There is no line count that answers this. The useful test is
  <b>whether it does one thing</b>: if you cannot name it without saying "and",
  it is two components. A 200-line form component that is just a long form is
  fine. A 60-line component that fetches, formats and renders three unrelated
  panels is not.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "A component is a pure function from props to elements. Composition &mdash;
    passing elements in as children or props &mdash; is how React avoids the
    configuration explosion you get when a component tries to know about every
    variation of itself."
  </p>
</div>`,
};
