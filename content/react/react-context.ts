import type { Chapter } from "../types";

export const reactContext: Chapter = {
  id: "react-context",
  num: "I2",
  title: "Context API",
  short: "Context",
  levels: ["intermediate"],
  prerequisites: ["react-usestate", "react-lifting-styling"],
  practice: [
    "ex-react-pick-fields",
    "ex-react-relevant-change",
    "ex-comp-theme-context",
    "ex-comp-context-default-value",
    "ex-comp-nested-provider-override",
  ],
  ready: true,
  subtitle: "A way to skip the middle layers: not a state manager, and not free.",
  body: `<p>
  Props are React's main way to pass data, and their great virtue is that you can see every hop. That virtue becomes a
  chore when a value is needed by components far below where it lives, and every component in between has to accept it
  and pass it on without using it. Context lets a component provide a value to its whole subtree and lets any descendant
  read it directly. This chapter covers how providers and consumers find each other, what re-renders when a context
  value changes and how to keep that cheap, the provider pattern worth copying into every project, and the things context
  is often mistaken for. It assumes <a href="/react/react-usestate">state</a> and
  <a href="/react/react-lifting-styling">lifting state up</a>. All behaviour below was checked against React 19.3.
</p>

<h3>The problem: passing props through components that do not care</h3>
<pre><code>function App() {
  const [theme, setTheme] = useState("light");
  return &lt;Layout theme={theme} /&gt;;
}
function Layout({ theme }) {
  return &lt;Sidebar theme={theme} /&gt;;          <span class="c">// does not use theme</span>
}
function Sidebar({ theme }) {
  return &lt;Menu theme={theme} /&gt;;             <span class="c">// does not use theme either</span>
}
function Menu({ theme }) {
  return &lt;nav className={theme}&gt;…&lt;/nav&gt;;   <span class="c">// finally</span>
}</code></pre>
<p>
  This is called prop drilling. Two layers of it are fine and honestly better than any alternative: you can read the
  data flow off the JSX. Five layers, for a value half the app needs, is noise: every intermediate component has an extra
  prop it does not use, and renaming the value means editing all of them. Some values are genuinely ambient, needed in
  many places at many depths: the theme, the signed-in user, the locale, a feature-flag set, a toast dispatcher. Those are
  what context is for.
</p>

<h3>Creating, providing and reading a context</h3>
<pre><code>import { createContext, useContext, useState } from "react";

const ThemeContext = createContext("light");

function App() {
  const [theme, setTheme] = useState("light");
  return (
    &lt;ThemeContext value={theme}&gt;
      &lt;Layout /&gt;
    &lt;/ThemeContext&gt;
  );
}

function Menu() {
  const theme = useContext(ThemeContext);
  return &lt;nav className={theme}&gt;…&lt;/nav&gt;;
}</code></pre>
<p>
  Three pieces. <code>createContext(defaultValue)</code>, called once at module level, creates the context object.
  Rendering <code>&lt;ThemeContext value={…}&gt;</code> provides a value to everything inside it. And
  <code>useContext(ThemeContext)</code> in any descendant, at any depth, returns the value from the nearest provider above
  it. <code>Layout</code> and <code>Sidebar</code> no longer mention the theme at all.
</p>
<p>
  Rendering the context object itself as the provider is React 19 syntax. Before 19 you wrote
  <code>&lt;ThemeContext.Provider value={…}&gt;</code>, and that still works, so you will see both; new code can use the
  shorter form.
</p>
<p>
  React 19 also added <code>use(ThemeContext)</code>, which reads a context like <code>useContext</code> but, unlike every
  other hook, may be called inside a condition or a loop. A component that returns early before reading the context, then
  calls <code>use</code> after the check, works as expected. <code>useContext</code> remains the everyday choice; reach
  for <code>use</code> when the read is genuinely conditional.
</p>

<h3>How a consumer finds its provider</h3>
<p>
  "Nearest provider above" is meant literally. React walks up the component tree from the consumer and stops at the
  first provider for <em>that</em> context object. Different contexts do not interfere, and the same context can be
  provided more than once, with an inner provider overriding an outer one for its subtree:
</p>
<pre><code>&lt;ThemeContext value="light"&gt;
  &lt;Page /&gt;                       <span class="c">// reads "light"</span>
  &lt;ThemeContext value="dark"&gt;
    &lt;Footer /&gt;                   <span class="c">// reads "dark"</span>
  &lt;/ThemeContext&gt;
&lt;/ThemeContext&gt;</code></pre>
<p>
  Overriding is useful: a dark sidebar inside a light page, a nested form section with its own "disabled" flag, a modal
  rendered with a different locale for a preview. Because each lookup walks the tree, the value a component sees depends
  on where it is rendered, not where it is defined. A component rendered through a portal into
  <code>document.body</code> still sees the providers above where it appears in the React tree, not in the DOM.
</p>

<h3>The default value is not a fallback</h3>
<p>
  The argument to <code>createContext</code> is used only when a consumer has <em>no</em> provider above it at all. A
  provider with <code>value={undefined}</code> provides <code>undefined</code>; it does not fall back to the default.
  Checked: a consumer with no provider rendered "light", and one inside a provider rendered the provided value.
</p>
<p>
  That makes the default mostly useful in two situations: a value with a sensible app-wide default, like the theme, and
  tests that render a component on its own. For contexts that only make sense inside a provider, such as the current
  user or a form's state, a misleading default hides a bug: the component renders as if everything were fine. Make the
  default <code>null</code> and fail loudly instead, as the pattern below does.
</p>

<h3>A provider worth writing</h3>
<p>
  The pattern that holds up in real codebases wraps the context in two pieces: a provider component that owns the state,
  and a custom hook that reads it and checks the provider exists.
</p>
<pre><code>const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const value = useMemo(() =&gt; ({
    user,
    signIn: (u) =&gt; setUser(u),
    signOut: () =&gt; setUser(null),
  }), [user]);

  return &lt;AuthContext value={value}&gt;{children}&lt;/AuthContext&gt;;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error("useAuth must be used inside &lt;AuthProvider&gt;");
  }
  return ctx;
}</code></pre>
<p>
  Consumers import <code>useAuth</code> and never touch the context object, which stays private to the module. The thrown
  error turns a forgotten provider from a confusing "cannot read user of null" three layers away into a clear message at
  the right place. The <code>useMemo</code> is not decoration; the next section explains why it matters.
</p>

<h3>What re-renders when the value changes</h3>
<p>
  When a provider renders with a new value, React finds every component that reads that context below it and re-renders
  each one. Two details decide how expensive that is.
</p>
<p>
  <b>"New" means <code>Object.is</code>.</b> React compares the provider's new value with its previous one. For a string
  like <code>"dark"</code>, rendering the provider again with the same string changes nothing: a test rendering the same
  primitive value twice caused zero consumer renders, and changing it caused exactly one per consumer. For an object, a
  new object is a new value even if its fields are identical.
</p>
<p>
  <b>Context skips <code>memo</code>.</b> A component wrapped in <code>memo</code> skips re-rendering when its props are
  unchanged, but reading a context is not a prop. When the value changes, a memoised consumer re-renders anyway, even if
  every component between it and the provider bailed out. That is what lets context reach deep components cheaply, and
  it is also why careless context values are expensive.
</p>

<h4>Worked example: the inline object</h4>
<pre><code>function App() {
  const [user, setUser] = useState(null);
  const [count, setCount] = useState(0);   <span class="c">// unrelated state</span>

  return (
    &lt;AuthContext value={{ user, setUser }}&gt;   <span class="c">// a new object every render</span>
      &lt;Page /&gt;
      &lt;button onClick={() =&gt; setCount(count + 1)}&gt;{count}&lt;/button&gt;
    &lt;/AuthContext&gt;
  );
}</code></pre>
<p>
  Trace three clicks on the unrelated counter, with one memoised component deep in <code>Page</code> that reads the
  context:
</p>
<div class="table-scroll"><table>
<thead><tr><th>Render of <code>App</code></th><th><code>user</code></th><th>Context value</th><th><code>Object.is</code> with previous</th><th>Consumer renders?</th></tr></thead>
<tbody>
<tr><td>1 (mount)</td><td>null</td><td>object #1</td><td>n/a</td><td>yes (mount)</td></tr>
<tr><td>2 (click)</td><td>null</td><td>object #2</td><td>false</td><td>yes</td></tr>
<tr><td>3 (click)</td><td>null</td><td>object #3</td><td>false</td><td>yes</td></tr>
<tr><td>4 (click)</td><td>null</td><td>object #4</td><td>false</td><td>yes</td></tr>
</tbody>
</table></div>
<p>
  The user never changed, yet every consumer of <code>AuthContext</code> re-rendered on every click, and <code>memo</code>
  on the consumer did not help. In the check that backs this table, two parent renders with the same user produced two
  consumer renders. Wrap the value in <code>useMemo</code> with <code>[user]</code> as the dependency and the same three
  clicks produce the same object each time, so consumers do not re-render at all. (With the React Compiler enabled, the
  compiler memoises values like this for you; without it, write the <code>useMemo</code>.)
</p>

<h4>What happens on a change, step by step</h4>
<ol>
  <li>The component that owns the state calls its setter, and React re-renders that component, the provider's parent.</li>
  <li>The provider receives its <code>value</code>. React compares it with the previous value using <code>Object.is</code>. If they are the same, nothing below is scheduled because of the context.</li>
  <li>If they differ, React walks down the provider's subtree looking for components that read this context, and marks each one to re-render, even if a <code>memo</code> parent above it would have skipped.</li>
  <li>Components that do not read the context are not re-rendered by it. They re-render only if their own parent re-renders them, which is why passing <code>children</code> through the provider matters.</li>
  <li>Each marked consumer re-renders with the new value and returns new JSX, and its own children follow the normal rules.</li>
</ol>
<p>
  Seen this way, the two ways to make context cheap are obvious: make step 2 say "same" whenever nothing meaningful
  changed, by memoising the value, and make step 3 find as few components as possible, by splitting contexts so each
  consumer reads only what it needs.
</p>

<h3>Split contexts by how often they change</h3>
<p>
  A single context holding everything, user, theme, cart, notifications, means a change to any field re-renders every
  consumer, including the ones that only wanted the theme. Split it so each context changes for one reason:
</p>
<pre><code>&lt;ThemeContext value={theme}&gt;
  &lt;UserContext value={user}&gt;
    &lt;CartContext value={cart}&gt;
      &lt;App /&gt;
    &lt;/CartContext&gt;
  &lt;/UserContext&gt;
&lt;/ThemeContext&gt;</code></pre>
<p>
  A second split pays off when the state changes often but the functions that change it never do. Components that only
  dispatch, such as an "Add to cart" button, should not re-render when the cart contents change:
</p>
<pre><code>const CartStateContext = createContext(null);
const CartDispatchContext = createContext(null);

function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, []);
  return (
    &lt;CartStateContext value={cart}&gt;
      &lt;CartDispatchContext value={dispatch}&gt;{children}&lt;/CartDispatchContext&gt;
    &lt;/CartStateContext&gt;
  );
}</code></pre>
<p>
  <code>dispatch</code> from <code>useReducer</code> is stable across renders, so the dispatch context never changes and
  its consumers never re-render because of it. The button reads only <code>CartDispatchContext</code>; the cart badge
  reads <code>CartStateContext</code>. This pairing of reducer and context is the subject of the last section of the
  <a href="/react/react-usereducer">useReducer chapter</a>.
</p>

<h3>Passing children keeps the tree still</h3>
<p>
  The provider component above takes <code>children</code> rather than rendering <code>&lt;App /&gt;</code> itself, and
  that is not just style. When <code>CartProvider</code> re-renders because the cart changed, its <code>children</code>
  prop is the same element objects its parent created earlier, so React does not re-render them; only the components that
  read the context do. A provider that renders the app tree inside itself would re-render the whole tree on every change.
  Keep providers thin: state, a memoised value, and <code>children</code>.
</p>

<h3>What context is not</h3>
<ul>
  <li><b>Not a state manager.</b> Context transports a value; something else, usually <code>useState</code> or <code>useReducer</code> in a provider, owns it. It has no selectors, so a consumer cannot subscribe to one field; it re-renders on any change to the value.</li>
  <li><b>Not a replacement for props.</b> Props make data flow explicit and components reusable. Reaching for context to avoid passing a prop two levels makes components depend on invisible surroundings and harder to test.</li>
  <li><b>Not for high-frequency values.</b> Mouse position, scroll offset, a value updated on every keystroke across a large tree: each change re-renders every consumer. Those belong in local state, a ref, or an external store with selector support read through <code>useSyncExternalStore</code>.</li>
  <li><b>Not global.</b> Each provider creates a separate scope. Two providers give two independent values, which is useful for tests and for embedding a widget twice.</li>
</ul>

<h3>Contexts that earn their place</h3>
<p>
  A few kinds of context appear in almost every sizeable React app, and each shows a slightly different design.
</p>
<ul>
  <li><b>Theme and locale.</b> Read in many places, changed rarely, a primitive or small object. The simplest case: a memoised value, and consumers that render text or class names from it.</li>
  <li><b>The signed-in user.</b> Read widely, changed on sign-in and sign-out. Put the user and the actions in separate contexts if many components only need <code>signOut</code>, and keep tokens out of it: components need the user's name and permissions, not credentials.</li>
  <li><b>Feature flags.</b> Fetched once, then constant for the session. A context holding a frozen object, read through a <code>useFlag("newCheckout")</code> hook, makes flags easy to override in tests and stories by wrapping a different provider.</li>
  <li><b>Toasts and notifications.</b> Many components need to <em>show</em> a toast, one component renders them. Provide only the stable <code>show</code> function to the many, and keep the list of toasts in the provider, so showing a toast does not re-render every component that can show one.</li>
  <li><b>A compound component's shared state.</b> A <code>&lt;Tabs&gt;</code> component that provides the selected tab to its own <code>&lt;Tab&gt;</code> and <code>&lt;TabPanel&gt;</code> children, so users of the component write simple markup and never pass the selection by hand. This is context as an implementation detail of one component, and it is covered in <a href="/react/react-advanced-patterns">advanced patterns</a>.</li>
</ul>
<p>
  What they share: a clear owner, a narrow value, and a reason to be readable far from where it lives. A context that
  meets none of those is usually props in disguise.
</p>

<h3>Alternatives to reach for first</h3>
<p>
  Before adding a context, two simpler moves often remove the drilling. The first is composition: instead of passing
  data down through a layout, pass the finished element down.
</p>
<pre><code><span class="c">// drilling: Layout and Sidebar forward user to Avatar</span>
&lt;Layout user={user} /&gt;

<span class="c">// composition: Layout renders whatever it is given</span>
&lt;Layout sidebar={&lt;Avatar user={user} /&gt;} /&gt;</code></pre>
<p>
  <code>Layout</code> no longer knows a user exists; it just places its <code>sidebar</code> prop. The second is moving
  state down: if only one branch needs a value, keep the state in that branch rather than at the top. Context is the right
  tool when, after both, many components at many depths still need the same value.
</p>
<p>
  At the other end, when context starts carrying frequently changing data that many components each need a slice of,
  a store library with selectors (Zustand, Redux Toolkit, Jotai) is the better fit; the
  <a href="/react/react-state-libraries">state libraries chapter</a> compares them.
</p>

<h3>Worked example: a theme switcher end to end</h3>
<p>
  Putting the pieces together, here is a complete theme feature: state in a provider, a memoised value, persistence, a
  checking hook, and two consumers at different depths.
</p>
<pre><code>const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() =&gt; localStorage.getItem("theme") ?? "light");

  useEffect(() =&gt; {
    localStorage.setItem("theme", theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const value = useMemo(
    () =&gt; ({ theme, toggle: () =&gt; setTheme((t) =&gt; (t === "light" ? "dark" : "light")) }),
    [theme]
  );

  return &lt;ThemeContext value={value}&gt;{children}&lt;/ThemeContext&gt;;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (ctx === null) throw new Error("useTheme must be used inside &lt;ThemeProvider&gt;");
  return ctx;
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return &lt;button onClick={toggle}&gt;{theme === "light" ? "Dark mode" : "Light mode"}&lt;/button&gt;;
}

function Logo() {
  const { theme } = useTheme();
  return &lt;img src={theme === "light" ? "/logo.svg" : "/logo-dark.svg"} alt="Groundwork" /&gt;;
}</code></pre>
<p>
  Trace a click on the toggle. <code>toggle</code> calls the setter with an updater, so it never reads a stale theme.
  <code>ThemeProvider</code> re-renders; <code>useMemo</code> sees <code>theme</code> changed and builds a new value; React
  re-renders the two consumers, <code>ThemeToggle</code> and <code>Logo</code>, and nothing else, because the rest of the
  app arrived as <code>children</code>. After the commit, the effect saves the choice and sets the attribute that the CSS
  reads. Render the provider again for an unrelated reason and the memoised value is unchanged, so the consumers stay put.
  The lazy initialiser reads <code>localStorage</code> once; in a server-rendered app it would run on the server too,
  where <code>localStorage</code> does not exist, which is why frameworks read the saved theme in a small inline script
  instead.
</p>

<h3>Context in a server-rendered app</h3>
<p>
  In frameworks with React Server Components, such as the Next.js App Router, context only works in client components:
  <code>createContext</code> and <code>useContext</code> are client features, and a server component cannot read a
  context at all. The usual shape is a provider file marked <code>"use client"</code>, rendered from a server layout:
</p>
<pre><code><span class="c">// providers.jsx</span>
"use client";
export function Providers({ children }) {
  return &lt;ThemeProvider&gt;{children}&lt;/ThemeProvider&gt;;
}

<span class="c">// layout.jsx, a server component</span>
export default function Layout({ children }) {
  return &lt;html&gt;&lt;body&gt;&lt;Providers&gt;{children}&lt;/Providers&gt;&lt;/body&gt;&lt;/html&gt;;
}</code></pre>
<p>
  Because <code>children</code> is passed through, the pages inside can still be server components; only the components
  that call <code>useTheme</code> need to be client components. Wrap providers as deep as they are needed rather than at
  the root by habit: a provider at the root makes every page pay for it.
</p>

<h3>Typing context with TypeScript</h3>
<pre><code>type Auth = { user: User | null; signIn: (u: User) =&gt; void; signOut: () =&gt; void };

const AuthContext = createContext&lt;Auth | null&gt;(null);

export function useAuth(): Auth {
  const ctx = useContext(AuthContext);
  if (ctx === null) throw new Error("useAuth must be used inside &lt;AuthProvider&gt;");
  return ctx;                    <span class="c">// narrowed from Auth | null to Auth</span>
}</code></pre>
<p>
  The <code>null</code> default plus the throwing hook pays off twice in TypeScript: consumers get a non-null type with no
  <code>!</code> or optional chaining, and the type of the default does not have to pretend to be a real
  <code>Auth</code>. The alternative, a fake default object full of no-op functions, type-checks but hides a missing
  provider at runtime.
</p>

<h3>Testing components that use context</h3>
<p>
  A component that calls <code>useAuth</code> needs a provider in its test, and that is a feature: the test states the
  situation explicitly.
</p>
<pre><code>render(
  &lt;AuthContext value={{ user: { name: "Ana" }, signIn() {}, signOut() {} }}&gt;
    &lt;Greeting /&gt;
  &lt;/AuthContext&gt;
);
expect(screen.getByText("Hello, Ana")).toBeInTheDocument();</code></pre>
<p>
  To test against the real provider instead, render <code>&lt;AuthProvider&gt;</code> and drive it through the UI. Many
  projects add a <code>renderWithProviders</code> helper that wraps every test in the app's providers, which is convenient
  until a test needs a different value; keep the option to pass one in. If tests need the context object, export it from
  the module for tests only, or provide a test provider that accepts a value.
</p>

<h3>Moving from drilled props to context, safely</h3>
<p>
  Converting an existing drilled prop to context is a small refactor that is easy to get subtly wrong, so it is worth doing
  in a fixed order. First, confirm the value really is needed at several depths; if one component deep down is the only
  reader, composition is the better fix. Second, create the context with a <code>null</code> default, a provider component
  that owns the state, and a checking hook, and put the provider exactly where the state used to live. Third, change the
  deepest readers to call the hook, one at a time, keeping the old prop working while you go, so the app runs at every
  step. Fourth, delete the prop from the components in the middle that only forwarded it, which is where the payoff shows
  up as shorter signatures. Finally, look at the provider's value: if it is an object or includes functions, memoise it,
  and if it mixes fast-changing data with stable functions, split it. Tests that rendered a deep component with the prop
  now render it inside a provider instead, which makes their setup more explicit, not less.
</p>

<h3>Cost</h3>
<p>
  Reading a context is cheap: React looks up the nearest provider's current value. The cost is in updates. When a
  provider's value changes, React walks the provider's subtree to find the components that read it, which is quick per
  component, and then re-renders each of them along with whatever they render. The renders dominate, so the cost grows
  with the number of consumers and the size of what they draw. A memoised value and contexts split by change frequency
  are what keep that number small.
</p>

<p>
  One more cost is easy to miss: context makes a component depend on where it is rendered. A component that calls
  <code>useAuth</code> cannot be dropped into a storybook, a test or another app without a provider around it. That is
  usually a fair price for an ambient value, and the throwing hook makes the dependency loud rather than silent.
</p>

<h3>Pitfalls</h3>
<ul>
  <li><b>An inline object or function as the value</b>: every provider render re-renders every consumer. Memoise it.</li>
  <li><b>One context for everything</b>: unrelated changes re-render everyone. Split by change frequency, and split state from dispatch.</li>
  <li><b>A misleading default</b> for a context that needs a provider: bugs render quietly. Default to <code>null</code> and throw in the hook.</li>
  <li><b>Expecting <code>memo</code> to stop context updates</b>: it does not.</li>
  <li><b>Exporting the context object</b> instead of a hook: consumers skip the provider check and couple to internals.</li>
  <li><b>Using context for values two levels away</b>: pass props, or compose.</li>
  <li><b>Putting fast-changing values in context</b>: every consumer re-renders on every change.</li>
</ul>

<h3>Recognising it in a problem</h3>
<ul>
  <li>The same prop threaded through three or more components that do not use it, for a value many parts of the app need: context.</li>
  <li>"The whole app re-renders when I type in the cart quantity": one big context, or an unmemoised value.</li>
  <li>"Cannot read properties of null" from a hook deep in the tree: a missing provider, which a checking hook would have named.</li>
  <li>A sub-tree that needs a different theme or a disabled flag: a nested provider.</li>
</ul>

<h3>Interview questions</h3>
<p><b>1. When would you use context, and when would you not?</b></p>
<p>
  For values many components at many depths need and that change rarely: theme, current user, locale, feature flags, a
  dispatch function. Not for avoiding a couple of levels of props, where props or composition are clearer, and not for
  values that change rapidly, because every consumer re-renders on every change and context has no selectors.
</p>
<p class="sub">
  <i>Follow-up: what would you use for frequently changing shared state?</i> A store with selector subscriptions, such
  as Zustand or Redux Toolkit, which re-renders only the components whose selected slice changed, built on
  <code>useSyncExternalStore</code>.
</p>
<p><b>2. Why might every consumer re-render even though the data did not change?</b></p>
<p>
  The provider's value is probably an object or function created during render, so it is a new reference each time and
  <code>Object.is</code> sees a change. Memoise the value with <code>useMemo</code> on the fields it contains, and split
  contexts so each changes for one reason.
</p>
<p class="sub">
  <i>Follow-up: does wrapping the consumer in <code>memo</code> help?</i> No. <code>memo</code> compares props; a context
  change re-renders consumers regardless.
</p>
<p><b>3. What does the default value of <code>createContext</code> do?</b></p>
<p>
  It is returned only when there is no provider above the consumer. A provider with <code>value={undefined}</code>
  provides <code>undefined</code>. For contexts that require a provider, default to <code>null</code> and throw from a
  custom hook, so a missing provider fails clearly.
</p>
<p><b>4. How would you structure a provider for a cart?</b></p>
<p>
  A provider component that owns the state with <code>useReducer</code>, two contexts, one for the state and one for the
  stable <code>dispatch</code>, two custom hooks that check the provider exists, and <code>children</code> passed through
  so the provider's re-renders do not re-render the tree.
</p>
<p><b>5. A memoised component deep in the tree re-renders on every keystroke in a form at the top. What do you check?</b></p>
<p>
  Whether it reads a context whose provider sits above the form. If the provider's value is rebuilt on every render of
  the form's parent, every consumer re-renders regardless of <code>memo</code>. I would check the value is memoised, that
  the form's fast-changing state is not in the same context as slow-changing data, and that the form's state lives below
  the provider rather than in the provider's parent.
</p>
<div class="bx is-prim">
  <span class="ttl">The trap question</span>
  <p>
    "Is context a replacement for Redux?" Context replaces Redux's <em>transport</em>, getting a value to deep components.
    It does not replace a store: there are no selectors, so any change re-renders every consumer, and no middleware or
    devtools. Small apps can live on context plus <code>useReducer</code>; apps with large, frequently updated shared state
    are what stores are for.
  </p>
</div>
<div class="bx is-ref">
  <span class="ttl">Say it like this</span>
  <p>
    "Context lets a provider make a value available to its whole subtree, so I don't drill props through components that
    don't use them. Consumers re-render whenever the value changes by <code>Object.is</code>, even through
    <code>memo</code>, so I memoise the value, split contexts by how often they change, separate state from dispatch, and
    wrap each one in a provider component plus a hook that throws if the provider is missing."
  </p>
</div>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Create, provide and read a context with the React 19 provider syntax, and recognise the older <code>.Provider</code> form.</li>
    <li>Say which provider a consumer reads when the same context is nested.</li>
    <li>Explain when the default value is used, and why a <code>null</code> default plus a throwing hook is safer.</li>
    <li>Fill in the inline-object table and say what <code>useMemo</code> changes.</li>
    <li>Split a context into state and dispatch, and say why the dispatch half never re-renders its consumers.</li>
    <li>Remove a case of prop drilling with composition instead of context.</li>
  </ul>
</div>`,
};
