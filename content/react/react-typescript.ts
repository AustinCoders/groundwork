import type { Chapter } from "../types";

export const reactTypescript: Chapter = {
  id: "react-typescript",
  num: "I16",
  title: "TypeScript with React",
  short: "TypeScript",
  levels: ["intermediate"],
  practice: ["ex-react-describe-state"],
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
<p class="sub">
  <code>type</code> or <code>interface</code> for props? Either works. Pick one
  for the codebase; <code>type</code> is the more common choice because unions
  and intersections, which props need constantly, only work with it.
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
<tr><td><code>React.MouseEvent&lt;HTMLButtonElement&gt;</code>, <code>React.KeyboardEvent</code></td><td>Clicks and key presses</td></tr>
<tr><td><code>React.CSSProperties</code></td><td>A <code>style</code> object</td></tr>
<tr><td><code>React.JSX.Element</code></td><td>What a component returns, when you annotate it</td></tr>
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

<h3>Refs are props now</h3>
<pre><code>function TextInput(props: React.ComponentProps&lt;"input"&gt;) {
  return &lt;input className="field" {...props} /&gt;;   <span class="c">// ref arrives inside props</span>
}

const ref = useRef&lt;HTMLInputElement&gt;(null);
&lt;TextInput ref={ref} /&gt;                             <span class="c">// ✓ no forwardRef</span></code></pre>
<p>
  Since React 19 a function component receives <code>ref</code> as an ordinary
  prop, and <code>ComponentProps&lt;"input"&gt;</code> already includes it. If
  you need to be explicit, <code>ComponentPropsWithRef</code> and
  <code>ComponentPropsWithoutRef</code> say which one you mean &mdash; the
  second is right for a wrapper that must not pass a ref through.
</p>

<h3>When your prop clashes with the element's</h3>
<pre><code>type InputProps = Omit&lt;React.ComponentProps&lt;"input"&gt;, "size"&gt; &amp; {
  size?: "sm" | "md" | "lg";         <span class="c">// the DOM's size is a number of characters</span>
};

function Input({ size = "md", ...rest }: InputProps) {
  return &lt;input className={"input input--" + size} {...rest} /&gt;;
}</code></pre>
<p>
  Intersecting two types that both define <code>size</code> does not replace
  one with the other; it demands a value that is a number and a string at once,
  which nothing is. <code>Omit</code> removes the element's version first.
  <code>size</code>, <code>color</code>, <code>type</code> and
  <code>onChange</code> are the usual collisions.
</p>

<h3>Defaults make optional props required inside</h3>
<p>
  <code>variant?: "primary" | "ghost"</code> means the caller may leave it out.
  Inside the component, after <code>variant = "primary"</code> in the parameter
  list, TypeScript knows it is always defined, so there is no
  <code>undefined</code> check to write. That is why defaults belong in the
  destructuring rather than in an <code>if</code> further down: the type and the
  behaviour are declared in the same place.
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
  <code>null</code> during the first render, and the type says so. Since React
  19, <code>useRef</code> requires an argument, and every ref object is mutable.
</p>

<h3>What changed in React 19's types</h3>
<div class="table-scroll"><table>
<thead><tr><th>Before</th><th>Now</th></tr></thead>
<tbody>
<tr><td><code>useRef()</code> with no argument</td><td>Compile error &mdash; pass <code>undefined</code> or <code>null</code></td></tr>
<tr><td><code>ref={(el) =&gt; (node = el)}</code></td><td>Error: a ref callback may now return a cleanup function, so an implicit return is rejected. Use braces.</td></tr>
<tr><td>Global <code>JSX</code> namespace</td><td><code>React.JSX</code></td></tr>
<tr><td><code>ReactElement["props"]</code> was <code>any</code></td><td>Now <code>unknown</code> unless you pass a type argument</td></tr>
<tr><td><code>useReducer&lt;React.Reducer&lt;S, A&gt;&gt;(reducer)</code></td><td><code>useReducer(reducer)</code> &mdash; let it infer</td></tr>
</tbody>
</table></div>
<pre><code>npx types-react-codemod@latest preset-19 ./src     <span class="c">// fixes most of these mechanically</span></code></pre>

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
  genuinely prevents bugs. Inside each <code>case</code>, <code>action</code> is
  narrowed, so <code>action.id</code> only exists where the type has one.
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

<h3>What children can and cannot promise</h3>
<pre><code>children: React.ReactNode;                          <span class="c">// anything renderable</span>
children: React.ReactElement;                       <span class="c">// exactly one element, not text</span>
children: (state: { open: boolean }) =&gt; React.ReactNode;   <span class="c">// a render function</span></code></pre>
<p>
  One limit surprises people: you cannot type <code>children</code> as "only
  <code>&lt;Tab&gt;</code> elements". Every JSX expression has the same type,
  <code>React.JSX.Element</code>, whatever component produced it, so
  <code>&lt;Tabs&gt;&lt;div /&gt;&lt;/Tabs&gt;</code> compiles even when the prop
  looks strict. If the structure matters, enforce it with an API instead
  &mdash; an <code>items</code> array prop, or compound components that read
  shared context.
</p>

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
<p>
  For your own components, type callback props by what they mean, not by the
  DOM event that triggered them: <code>onSelect: (id: string) =&gt; void</code>
  rather than <code>onSelect: (e: React.MouseEvent) =&gt; void</code>. The parent
  wants the id; making it dig through an event couples it to your markup.
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

<h3>Data from outside is unknown</h3>
<pre><code>const res = await fetch("/api/user");
const user = (await res.json()) as User;    <span class="c">// ✗ a promise to the compiler, not a check</span>

const UserSchema = z.object({ id: z.string(), name: z.string() });
type User = z.infer&lt;typeof UserSchema&gt;;
const user = UserSchema.parse(await res.json());   <span class="c">// ✓ checked at runtime, typed after</span></code></pre>
<p>
  TypeScript types vanish when the code runs, so an API that returns a
  different shape passes an <code>as</code> cast silently and fails later, far
  from the cause. Parsing at the boundary turns that into one clear error where
  the data enters, and the schema doubles as the type.
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
    attributes — which since React 19 includes <code>ref</code>. The real
    payoff is discriminated unions for state — narrowing means the compiler
    stops you reading <code>data</code> in the error branch."
  </p>
</div>`,
};
