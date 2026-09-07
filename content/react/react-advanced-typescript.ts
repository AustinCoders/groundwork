import type { Chapter } from "../types";

export const reactAdvancedTypescript: Chapter = {
  id: "react-advanced-typescript",
  num: "A15",
  title: "Advanced TypeScript with React",
  short: "Advanced TypeScript",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle: "Making the wrong call fail to compile, rather than fail in review.",
  body: `<h3>Polymorphic components</h3>
<pre><code>type BoxProps&lt;E extends React.ElementType&gt; = {
  as?: E;
  children?: React.ReactNode;
} &amp; Omit&lt;React.ComponentPropsWithoutRef&lt;E&gt;, "as" | "children"&gt;;

function Box&lt;E extends React.ElementType = "div"&gt;({ as, ...rest }: BoxProps&lt;E&gt;) {
  const Component = as ?? "div";
  return &lt;Component {...rest} /&gt;;
}

&lt;Box as="a" href="/x" /&gt;         <span class="c">// ✓ href allowed</span>
&lt;Box as="div" href="/x" /&gt;       <span class="c">// ✗ compile error</span></code></pre>
<p>
  One component that can render as any element, with the correct props for
  whichever it becomes. This is what <code>as</code> props in design systems are
  built on, and the <code>Omit</code> is what stops your own props colliding with
  the element's.
</p>

<h3>Mutually exclusive props</h3>
<pre><code>type Props =
  | { variant: "link"; href: string; onClick?: never }
  | { variant: "button"; onClick: () =&gt; void; href?: never };

&lt;Action variant="link" href="/x" /&gt;              <span class="c">// ✓</span>
&lt;Action variant="link" onClick={fn} /&gt;           <span class="c">// ✗ compile error</span></code></pre>
<p>
  A union with <code>never</code> on the excluded members turns "these two props
  should never appear together" from a code-review comment into a compile error.
</p>

<h3>Requiring a label, one way or the other</h3>
<pre><code>type Labelled =
  | { children: React.ReactNode; "aria-label"?: never }
  | { children?: never; "aria-label": string };

type IconButtonProps = React.ComponentProps&lt;"button"&gt; &amp; Labelled;</code></pre>
<p>
  Now an icon-only button with no accessible name <b>does not compile</b>. This
  is the most valuable use of the technique: encoding an accessibility rule in
  the type so it cannot be forgotten.
</p>

<h3>Typing a generic list component</h3>
<pre><code>type ListProps&lt;T&gt; = {
  items: readonly T[];
  keyOf: (item: T) =&gt; React.Key;
  children: (item: T, index: number) =&gt; React.ReactNode;
};

function List&lt;T&gt;({ items, keyOf, children }: ListProps&lt;T&gt;) {
  return &lt;ul&gt;{items.map((item, i) =&gt; &lt;li key={keyOf(item)}&gt;{children(item, i)}&lt;/li&gt;)}&lt;/ul&gt;;
}

&lt;List items={users} keyOf={(u) =&gt; u.id}&gt;
  {(user) =&gt; &lt;span&gt;{user.name}&lt;/span&gt;}      <span class="c">// user inferred as User</span>
&lt;/List&gt;</code></pre>
<p class="sub">
  <code>readonly T[]</code> in the props stops the component mutating the
  caller's array, which is a real bug the type can simply prevent.
</p>

<h3>Deriving types instead of restating them</h3>
<pre><code>type FormValues = z.infer&lt;typeof schema&gt;;          <span class="c">// from the validator</span>
type Post = Awaited&lt;ReturnType&lt;typeof getPost&gt;&gt;;   <span class="c">// from the function</span>
type Summary = Pick&lt;Post, "id" | "title"&gt;;         <span class="c">// from the model</span>
type PostId = Post["id"];                          <span class="c">// from the field</span></code></pre>
<p>
  Every type written twice will eventually disagree with itself. Derive from the
  one source that is already correct.
</p>

<h3>Exhaustiveness</h3>
<pre><code>function assertNever(x: never): never {
  throw new Error("Unhandled: " + JSON.stringify(x));
}

switch (state.status) {
  case "idle": ...
  case "loading": ...
  case "ready": ...
  default: return assertNever(state);     <span class="c">// ✗ compile error if a case is missing</span>
}</code></pre>
<p>
  Add a fourth status and this line stops compiling, pointing at every switch
  that needs updating. It is the cheapest safety net in a React codebase with
  state machines in it.
</p>

<h3>Typing context so consumers get a non-null value</h3>
<pre><code>function createStrictContext&lt;T&gt;(name: string) {
  const Ctx = createContext&lt;T | null&gt;(null);

  function useCtx(): T {
    const value = useContext(Ctx);
    if (value === null) throw new Error(name + " used outside its provider");
    return value;                          <span class="c">// narrowed to T</span>
  }

  return [Ctx, useCtx] as const;
}

const [ThemeContext, useTheme] = createStrictContext&lt;Theme&gt;("useTheme");</code></pre>
<p>
  One helper, and every context in the codebase gets both the runtime guard and
  the non-null type. <code>as const</code> is what keeps the tuple's types
  distinct rather than collapsing to a union.
</p>

<h3>Typing custom hooks</h3>
<pre><code>function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = useCallback(() =&gt; setOn((v) =&gt; !v), []);
  return [on, toggle] as const;          <span class="c">// ✓ [boolean, () =&gt; void]</span>
}                                        <span class="c">// without it: (boolean | (() =&gt; void))[]</span></code></pre>
<p>
  Returning a tuple without <code>as const</code> gives an array of a union
  type, and destructuring it produces two values that are both possibly either
  thing. It is the most common typing mistake in custom hooks.
</p>

<h3>Discipline that matters more than any trick</h3>
<ul>
  <li><b><code>unknown</code>, not <code>any</code>.</b> <code>any</code> disables checking for everything downstream of it.</li>
  <li><b>Narrow at the boundary.</b> Parse API responses with a schema; do not assert a shape you have not checked.</li>
  <li><b>Stop before it gets clever.</b> A conditional type nobody on the team can read is a liability, not a safety net. The best type is the simplest one that makes the mistake impossible.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "The value is turning review comments into compile errors: discriminated
    unions with <code>never</code> for props that must not co-occur — including
    requiring either children or an aria-label, so an unlabelled icon button
    cannot compile — polymorphic <code>as</code> props, and deriving types from
    the schema or function rather than restating them."
  </p>
</div>`,
};
