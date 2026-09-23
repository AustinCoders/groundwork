import type { Chapter } from "../types";

export const reactAdvancedTypescript: Chapter = {
  id: "react-advanced-typescript",
  num: "A15",
  title: "Advanced TypeScript with React",
  short: "Advanced TypeScript",
  levels: ["advanced"],
  practice: ["ex-comp-generic-renderitem-list", "ex-react-exhaustive-switch"],
  ready: true,
  subtitle: "Making the wrong call fail to compile, rather than fail in review.",
  body: `<h3>Polymorphic components</h3>
<pre><code>type BoxProps&lt;E extends React.ElementType&gt; = {
  as?: E;
  children?: React.ReactNode;
} &amp; Omit&lt;React.ComponentPropsWithRef&lt;E&gt;, "as" | "children"&gt;;

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
  the element's. Using <code>ComponentPropsWithRef</code> means the
  <code>ref</code> type follows the element too: a ref on
  <code>&lt;Box as="a"&gt;</code> must be an anchor ref. Since React 19 the ref
  simply travels in <code>rest</code>.
</p>
<p class="sub">
  This is also where the pattern's cost shows. Polymorphic types slow the
  checker and produce long error messages. Many design systems now prefer an
  <code>asChild</code> prop that merges props onto the single child, which needs
  far less typing.
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

<h3>Constraining the generic instead of asking for a function</h3>
<pre><code>function Table&lt;T extends { id: string }&gt;({ rows, columns }: {
  rows: readonly T[];
  columns: { [K in keyof T]?: (value: T[K], row: T) =&gt; React.ReactNode };
}) {
  return rows.map((row) =&gt; &lt;tr key={row.id}&gt;...&lt;/tr&gt;);   <span class="c">// id is guaranteed</span>
}

&lt;Table rows={users} columns={{ email: (v) =&gt; &lt;a href={"mailto:" + v}&gt;{v}&lt;/a&gt; }} /&gt;
<span class="c">// v is string because users[number]["email"] is string; a misspelt column key is an error</span></code></pre>
<p>
  A constraint says what every item must have, so the component can rely on it
  without a <code>keyOf</code> callback. The mapped type does the rest: each
  column renderer receives the type of its own field, and a column for a field
  that does not exist fails to compile. This is the typing that data-grid
  libraries are built on.
</p>

<h3>Compound components with one import</h3>
<pre><code>function TabsRoot(props: TabsProps) { ... }
function TabList(props: React.ComponentProps&lt;"div"&gt;) { ... }
function TabPanel(props: { value: string; children: React.ReactNode }) { ... }

export const Tabs = Object.assign(TabsRoot, { List: TabList, Panel: TabPanel });

&lt;Tabs defaultValue="a"&gt;
  &lt;Tabs.List&gt;...&lt;/Tabs.List&gt;
  &lt;Tabs.Panel value="a"&gt;...&lt;/Tabs.Panel&gt;
&lt;/Tabs&gt;</code></pre>
<p>
  <code>Object.assign</code> returns a type that is the function and the
  attached parts together, so <code>Tabs.Panel</code> is fully typed with no
  manual interface. Assigning <code>TabsRoot.Panel = TabPanel</code> after the
  fact also works in TypeScript, but only for a function declaration in the
  same file.
</p>

<h3>Stopping one prop from deciding the type</h3>
<pre><code>function Select&lt;T extends string&gt;(props: {
  options: readonly T[];
  defaultValue: NoInfer&lt;T&gt;;
}) { ... }

&lt;Select options={["sm", "md", "lg"]} defaultValue="xl" /&gt;
<span class="c">// ✓ with NoInfer: error — "xl" is not "sm" | "md" | "lg"</span>
<span class="c">// ✗ without it: T widens to include "xl", and the typo compiles</span></code></pre>
<p>
  TypeScript infers a generic from every place it appears, so a typo in
  <code>defaultValue</code> quietly becomes one of the options. The built-in
  <code>NoInfer</code> utility (TypeScript 5.4 and later) marks a position as
  "check against T, but do not use me to work out T".
</p>

<h3>Deriving types instead of restating them</h3>
<pre><code>type FormValues = z.infer&lt;typeof schema&gt;;          <span class="c">// from the validator</span>
type Post = Awaited&lt;ReturnType&lt;typeof getPost&gt;&gt;;   <span class="c">// from the function</span>
type Summary = Pick&lt;Post, "id" | "title"&gt;;         <span class="c">// from the model</span>
type PostId = Post["id"];                          <span class="c">// from the field</span>
type ButtonVariant = React.ComponentProps&lt;typeof Button&gt;["variant"];   <span class="c">// from a component</span></code></pre>
<p>
  Every type written twice will eventually disagree with itself. Derive from the
  one source that is already correct. The last line is useful for a component
  from a library that does not export its props type.
</p>

<h3>Lookup tables that cannot miss a case</h3>
<pre><code>type Status = "idle" | "loading" | "error" | "ready";

const badge = {
  idle: "Not started",
  loading: "Working…",
  error: "Failed",
  ready: "Done",
} satisfies Record&lt;Status, string&gt;;

badge.ready;           <span class="c">// type is still the literal object, not a loose Record</span></code></pre>
<p>
  <code>satisfies</code> checks the object against a type without replacing the
  object's own, more precise type. Add a fifth status and this object fails to
  compile until someone writes its label; remove one and the stale key is an
  error. It is <code>assertNever</code> for data instead of for code, and it
  suits variant maps, icon tables and route definitions.
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

<h3>IDs that cannot be swapped</h3>
<pre><code>type UserId = string &amp; { readonly __brand: "UserId" };
type PostId = string &amp; { readonly __brand: "PostId" };

function toUserId(raw: string): UserId {
  if (!raw.startsWith("usr_")) throw new Error("Not a user id");
  return raw as UserId;                    <span class="c">// the one place a cast is allowed</span>
}

function followUser(id: UserId) { ... }
followUser(post.id);                       <span class="c">// ✗ PostId is not UserId</span></code></pre>
<p>
  Every id is a string, so passing a post id where a user id belongs compiles
  and fails at runtime with a confusing 404. A brand is a type-only tag &mdash;
  it adds nothing at runtime &mdash; that makes the two incompatible, and
  confines the cast to a single validating function.
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
<pre><code>function useStoredState&lt;T&gt;(key: string, fallback: T, parse: (raw: unknown) =&gt; T) {
  const [value, setValue] = useState&lt;T&gt;(() =&gt; {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    try { return parse(JSON.parse(raw)); } catch { return fallback; }
  });
  ...
}

const [prefs] = useStoredState("prefs", defaultPrefs, PrefsSchema.parse);</code></pre>
<p>
  A generic hook that reads outside data should take a parser, not trust a type
  argument. <code>useStoredState&lt;Prefs&gt;("prefs")</code> would be a cast
  in disguise: last month's saved shape arrives typed as this month's
  <code>Prefs</code>.
</p>

<h3>Typing an action's result</h3>
<pre><code>type FormState =
  | { ok: true }
  | { ok: false; fieldErrors: Partial&lt;Record&lt;keyof FormValues, string&gt;&gt; };

async function save(prev: FormState | null, formData: FormData): Promise&lt;FormState&gt; { ... }

const [state, action] = useActionState(save, null);
if (state &amp;&amp; !state.ok) state.fieldErrors.title;     <span class="c">// narrowed</span></code></pre>
<p>
  Server Actions return data across the network, so a discriminated result is
  the contract between server and form. <code>keyof FormValues</code> ties the
  error keys to the real field names: rename a field and every stale error key
  becomes a compile error.
</p>

<h3>Discipline that matters more than any trick</h3>
<ul>
  <li><b><code>unknown</code>, not <code>any</code>.</b> <code>any</code> disables checking for everything downstream of it.</li>
  <li><b>Narrow at the boundary.</b> Parse API responses with a schema; do not assert a shape you have not checked.</li>
  <li><b><code>@ts-expect-error</code>, not <code>@ts-ignore</code>, with a reason.</b> Both silence the next line, but <code>@ts-expect-error</code> becomes an error itself once the underlying problem is fixed, so suppressions cannot outlive their cause.</li>
  <li><b>Stop before it gets clever.</b> A conditional type nobody on the team can read is a liability, not a safety net. The best type is the simplest one that makes the mistake impossible.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "The value is turning review comments into compile errors: discriminated
    unions with <code>never</code> for props that must not co-occur — including
    requiring either children or an aria-label, so an unlabelled icon button
    cannot compile — <code>satisfies</code> for lookup tables that must cover
    every case, branded ids, and deriving types from the schema or function
    rather than restating them."
  </p>
</div>`,
};
