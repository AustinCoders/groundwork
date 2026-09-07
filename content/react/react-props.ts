import type { Chapter } from "../types";

export const reactProps: Chapter = {
  id: "react-props",
  num: "B3",
  title: "Props",
  short: "Props",
  levels: ["beginner"],
  practice: [],
  ready: true,
  subtitle: "Data flows down. A component can read its props and must never write to them.",
  body: `<h3>Props are the function's arguments</h3>
<p>
  Everything you write as an attribute becomes a key on one object, and that
  object is the component's only argument.
</p>
<pre><code>&lt;Avatar name="Ana" size={48} active /&gt;

<span class="c">// arrives as</span>
{ name: "Ana", size: 48, active: true }</code></pre>
<p>
  A bare attribute with no value is <code>true</code>. Anything that is not a
  string needs braces &mdash; <code>size="48"</code> passes the string
  <code>"48"</code>, <code>size={48}</code> passes the number.
</p>

<h3>Destructure in the signature</h3>
<pre><code>function Avatar({ name, size = 40, active = false }) {
  return (
    &lt;img
      src={"/avatars/" + name + ".png"}
      width={size}
      className={active ? "is-active" : ""}
      alt={name}
    /&gt;
  );
}</code></pre>
<p class="sub">
  Defaults go in the destructuring. There is no separate mechanism for them, and
  the old <code>Component.defaultProps</code> is gone in React 19.
</p>

<h3>Props are read-only</h3>
<p>
  This is not a convention that is nice to follow. It is the rule the whole
  model rests on.
</p>
<pre><code>function Total({ items }) {
  items.push({ id: 99 });   <span class="c">// ✗ mutates the parent's array</span>
  items = [...items, x];    <span class="c">// ✗ pointless: reassigns a local</span>
  const next = [...items, x];  <span class="c">// ✓ a new array of your own</span>
}</code></pre>
<p>
  A component that mutates a prop is changing data the parent owns, without the
  parent knowing. React will not re-render the parent, so the screen and the
  data disagree &mdash; and the bug appears somewhere else entirely.
</p>

<div class="bx is-prim">
  <span class="ttl">One-way data flow</span>
  <p>
    Data goes down through props; changes go up through callbacks. The component
    that <b>owns</b> a piece of state is the only one allowed to change it.
    Everyone below receives the value and a function to ask for a change.
  </p>
</div>

<h3>Changes go up as callbacks</h3>
<pre><code>function Parent() {
  const [count, setCount] = useState(0);
  return &lt;Child count={count} onIncrement={() =&gt; setCount(count + 1)} /&gt;;
}

function Child({ count, onIncrement }) {
  return &lt;button onClick={onIncrement}&gt;{count}&lt;/button&gt;;
}</code></pre>
<p>
  <code>Child</code> cannot change <code>count</code>. It can only say "the
  button was pressed", and the parent decides what that means. That indirection
  is what makes a component reusable in a context its author never saw.
</p>

<h3>Spreading, and when not to</h3>
<pre><code>&lt;Avatar {...user} /&gt;                    <span class="c">// every key of user becomes a prop</span>
&lt;Avatar {...user} size={64} /&gt;          <span class="c">// later wins: size is 64</span>
&lt;Avatar size={64} {...user} /&gt;          <span class="c">// user.size wins, if it has one</span></code></pre>
<p>
  Spreading is genuinely useful in one place: a wrapper that forwards the props
  it does not care about to the element underneath.
</p>
<pre><code>function Button({ variant = "primary", ...rest }) {
  return &lt;button className={"btn btn--" + variant} {...rest} /&gt;;
}

&lt;Button variant="ghost" type="submit" disabled onClick={save}&gt;Save&lt;/Button&gt;</code></pre>
<p>
  Everywhere else it hurts, because you can no longer see what a component
  receives by reading the call. <code>&lt;Chart {...props} /&gt;</code> tells the
  next reader nothing.
</p>

<h3>Passing elements and functions</h3>
<p>
  Props are not limited to strings and numbers. Anything a JavaScript value can
  be, a prop can be &mdash; including elements and other components.
</p>
<pre><code>&lt;Modal title={&lt;strong&gt;Delete?&lt;/strong&gt;} onConfirm={remove} /&gt;
&lt;List items={rows} renderItem={(row) =&gt; &lt;Row key={row.id} {...row} /&gt;} /&gt;
&lt;Route element={&lt;Dashboard /&gt;} /&gt;</code></pre>

<h3>Two props React takes for itself</h3>
<pre><code>&lt;Row key={item.id} ref={rowRef} item={item} /&gt;</code></pre>
<p>
  <code>key</code> and <code>ref</code> look like props and are not. React
  strips both before your component is called &mdash; <code>key</code> is for
  <a href="/react/react-lists-keys">list identity</a>, <code>ref</code> for
  <a href="/react/react-useref">reaching a DOM node</a>. Neither appears in
  <code>props</code>.
</p>
<p class="sub">
  In React 19 <code>ref</code> is finally a normal prop for function components,
  so <code>forwardRef</code> is no longer needed for new code. You will still
  meet it constantly in existing codebases.
</p>

<h3>children is more flexible than it looks</h3>
<pre><code>&lt;Wrapper&gt;text&lt;/Wrapper&gt;              <span class="c">// children: "text"</span>
&lt;Wrapper&gt;&lt;A /&gt;&lt;/Wrapper&gt;            <span class="c">// children: one element</span>
&lt;Wrapper&gt;&lt;A /&gt;&lt;B /&gt;&lt;/Wrapper&gt;       <span class="c">// children: an array</span>
&lt;Wrapper&gt;{(x) =&gt; &lt;A v={x} /&gt;}&lt;/Wrapper&gt; <span class="c">// children: a function</span></code></pre>
<p>
  The last one is the <b>render prop</b> pattern &mdash; the wrapper owns some
  state and hands it to the caller to render. Hooks replaced most uses of it,
  but you will still find it in libraries where the wrapper needs to control
  when and how often the children render.
</p>

<h3>Naming that survives contact with other people</h3>
<div class="table-scroll"><table>
<thead><tr><th>Kind</th><th>Convention</th><th>Example</th></tr></thead>
<tbody>
<tr><td>Boolean</td><td><code>is</code>/<code>has</code>/<code>can</code>, and positive</td><td><code>isOpen</code>, not <code>isNotClosed</code></td></tr>
<tr><td>Handler prop</td><td><code>on</code> + what happened</td><td><code>onSelect</code>, <code>onDismiss</code></td></tr>
<tr><td>The function itself</td><td><code>handle</code> + what happened</td><td><code>handleSelect</code></td></tr>
<tr><td>Element prop</td><td>the slot's name</td><td><code>icon</code>, <code>footer</code></td></tr>
</tbody>
</table></div>
<p class="sub">
  Name handlers after <em>what happened</em>, not what should occur.
  <code>onDelete</code> ties the child to one outcome;
  <code>onConfirm</code> lets the parent decide what confirming means.
</p>

<h3>An object prop is a new reference every render</h3>
<pre><code>&lt;Chart options={{ grid: true }} /&gt;          <span class="c">// new object every render</span>
&lt;Chart onZoom={() =&gt; zoom(1)} /&gt;           <span class="c">// new function every render</span></code></pre>
<p>
  Harmless most of the time &mdash; creating a small object is cheap. It starts
  to matter in exactly two places: when the child is memoised, where a new
  reference defeats the memo entirely; and when the prop ends up in a
  dependency array, where it makes an effect run on every render. Both are
  covered later, but the shape is worth recognising now.
</p>

<h3>Checking props without TypeScript</h3>
<p>
  <code>PropTypes</code> was removed from React in version 19. In a plain
  JavaScript project the remaining options are a runtime check at the top of the
  component, or JSDoc types that your editor understands:
</p>
<pre><code><span class="c">/** @param {{ items: string[], onPick: (s: string) =&gt; void }} props */</span>
function Picker({ items, onPick }) { ... }</code></pre>
<p class="sub">
  The real answer is TypeScript, which is what
  <a href="/react/react-typescript">the intermediate tier</a> covers &mdash;
  props are a function's parameters, so typing them is typing a function.
</p>

<h3>A prop that changes is not a variable you can watch</h3>
<p>
  A common early instinct is to copy a prop into state so it can be "kept in
  sync". Almost always wrong &mdash; the copy goes stale the moment the prop
  changes, and now there are two sources of truth for one value.
</p>
<pre><code>function Price({ cents }) {
  const [display, setDisplay] = useState(cents / 100);  <span class="c">// ✗ frozen at first render</span>
  const display = cents / 100;                          <span class="c">// ✓ just compute it</span>
}</code></pre>
<p>
  If a value can be derived from props, derive it during render. State is for
  things the component <em>owns</em>, which is the subject of
  <a href="/react/react-usestate">the next chapter</a>.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "Props are a component's arguments and they are immutable from the inside.
    Data flows down as props and changes flow up as callbacks, so the component
    that owns a value is the only one that can change it &mdash; which is what
    makes a React tree traceable."
  </p>
</div>`,
};
