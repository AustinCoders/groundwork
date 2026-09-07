import type { Chapter } from "../types";

export const reactTypescript: Chapter = {
  id: "react-typescript",
  num: "I15",
  title: "TypeScript with React",
  short: "TypeScript",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle: "Props are a function's parameters, so typing a component is typing a function.",
  body: `<h3>Start here</h3>
<pre><code>type ButtonProps = {
  label: string;
  onClick: () =&gt; void;
  variant?: "primary" | "ghost";      <span class="c">// optional, and only these two</span>
  children?: React.ReactNode;
};

function Button({ label, onClick, variant = "primary" }: ButtonProps) { ... }</code></pre>
<p>
  No <code>React.FC</code>. It adds nothing useful, makes generics awkward, and
  historically implied a <code>children</code> prop the component may not
  accept. Annotate the parameter &mdash; that is the whole pattern.
</p>

<h3>The types you will use daily</h3>
<div class="table-scroll"><table>
<thead><tr><th>Type</th><th>For</th></tr></thead>
<tbody>
<tr><td><code>React.ReactNode</code></td><td>Anything renderable &mdash; the right type for <code>children</code></td></tr>
<tr><td><code>React.ReactElement</code></td><td>Specifically a JSX element, not a string or null</td></tr>
<tr><td><code>React.ComponentProps&lt;"button"&gt;</code></td><td>Every prop a real <code>&lt;button&gt;</code> takes</td></tr>
<tr><td><code>React.ChangeEvent&lt;HTMLInputElement&gt;</code></td><td>An input's change event</td></tr>
<tr><td><code>React.FormEvent&lt;HTMLFormElement&gt;</code></td><td>A form submit</td></tr>
<tr><td><code>React.CSSProperties</code></td><td>A <code>style</code> object</td></tr>
</tbody>
</table></div>

<h3>Extending a DOM element</h3>
<pre><code>type ButtonProps = React.ComponentProps&lt;"button"&gt; &amp; {
  variant?: "primary" | "ghost";
};

function Button({ variant = "primary", ...rest }: ButtonProps) {
  return &lt;button className={"btn btn--" + variant} {...rest} /&gt;;
}</code></pre>
<p>
  Now <code>type</code>, <code>disabled</code>, <code>aria-label</code>,
  <code>onClick</code> and every other button attribute are typed correctly and
  autocompleted, without listing one of them. This is the single most useful
  React-specific TypeScript pattern.
</p>

<h3>useState needs help only sometimes</h3>
<pre><code>const [count, setCount] = useState(0);              <span class="c">// inferred: number</span>
const [user, setUser] = useState&lt;User | null&gt;(null); <span class="c">// otherwise: always null</span>
const [items, setItems] = useState&lt;Todo[]&gt;([]);      <span class="c">// otherwise: never[]</span></code></pre>
<p>
  Inference is right whenever the initial value is representative. It is wrong
  for <code>null</code> and for an empty array, which are the two cases worth
  remembering.
</p>

<h3>Refs</h3>
<pre><code>const input = useRef&lt;HTMLInputElement&gt;(null);
input.current?.focus();                       <span class="c">// null until mounted</span>

const timer = useRef&lt;number | undefined&gt;(undefined);   <span class="c">// a mutable box</span></code></pre>
<p class="sub">
  The optional chaining is not defensive noise &mdash; a DOM ref genuinely is
  <code>null</code> during the first render, and the type says so.
</p>

<h3>Discriminated unions make impossible states impossible</h3>
<pre><code>type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: Error }
  | { status: "ready"; data: User };

if (state.status === "ready") {
  state.data.name;        <span class="c">// ✓ narrowed — data exists here</span>
  state.error;            <span class="c">// ✗ compile error — and rightly so</span>
}</code></pre>
<p>
  This is the type-level version of the
  <a href="/react/react-usereducer">reducer argument</a>, and it is where
  TypeScript earns its place in a React codebase: not catching typos, but making
  a whole class of UI bug unrepresentable.
</p>

<h3>Typing a reducer</h3>
<pre><code>type Action =
  | { type: "added"; text: string }
  | { type: "removed"; id: string }
  | { type: "cleared" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "added":   return { ...state, items: [...state.items, action.text] };
    case "removed": return { ...state, items: state.items.filter((i) =&gt; i.id !== action.id) };
    case "cleared": return { ...state, items: [] };
  }
}</code></pre>
<p>
  With no <code>default</code> case, adding a fourth action type makes the
  function fail to return on one path &mdash; a compile error pointing exactly at
  the reducer you forgot to update. That exhaustiveness check is free and
  genuinely prevents bugs.
</p>

<h3>Generic components</h3>
<pre><code>type ListProps&lt;T&gt; = {
  items: T[];
  renderItem: (item: T) =&gt; React.ReactNode;
  keyOf: (item: T) =&gt; string;
};

function List&lt;T&gt;({ items, renderItem, keyOf }: ListProps&lt;T&gt;) {
  return &lt;ul&gt;{items.map((i) =&gt; &lt;li key={keyOf(i)}&gt;{renderItem(i)}&lt;/li&gt;)}&lt;/ul&gt;;
}

&lt;List items={users} keyOf={(u) =&gt; u.id} renderItem={(u) =&gt; u.name} /&gt;
<span class="c">// u is inferred as User — no annotation needed at the call site</span></code></pre>

<h3>Events</h3>
<pre><code>function handleChange(e: React.ChangeEvent&lt;HTMLInputElement&gt;) {
  setValue(e.target.value);           <span class="c">// typed as string</span>
}

&lt;input onChange={(e) =&gt; setValue(e.target.value)} /&gt;
<span class="c">// inline: e is inferred from the JSX attribute — no annotation needed</span></code></pre>
<p>
  Inline handlers are inferred from context. You only annotate when the function
  is defined separately, which is worth knowing before you decorate every arrow
  with a type.
</p>

<h3>Context without the null dance</h3>
<pre><code>const AuthContext = createContext&lt;Auth | null&gt;(null);

export function useAuth(): Auth {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside &lt;AuthProvider&gt;");
  return ctx;                          <span class="c">// narrowed — callers get Auth</span>
}</code></pre>
<p>
  One runtime check in one place, and every consumer gets a non-null type. The
  alternative &mdash; optional chaining at forty call sites &mdash; is worse in
  every way.
</p>

<h3>Two habits worth forming</h3>
<ul>
  <li>
    <b>Avoid <code>any</code>; prefer <code>unknown</code>.</b> <code>any</code>
    switches the checker off and the hole spreads through everything it touches.
    <code>unknown</code> forces you to narrow before use.
  </li>
  <li>
    <b>Derive types rather than restating them.</b>
    <code>type FormValues = z.infer&lt;typeof schema&gt;</code>, or
    <code>Pick&lt;User, "id" | "name"&gt;</code>. A type written twice is a type
    that will disagree with itself.
  </li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "Typing a component is typing a function's parameter, so I annotate props
    and skip <code>React.FC</code>, and I extend
    <code>ComponentProps&lt;'button'&gt;</code> rather than restating DOM
    attributes. The real payoff is discriminated unions for state — narrowing
    means the compiler stops you reading <code>data</code> in the error branch."
  </p>
</div>`,
};
