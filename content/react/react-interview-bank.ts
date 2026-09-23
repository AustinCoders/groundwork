import type { Chapter } from "../types";

export const reactInterviewBank: Chapter = {
  id: "react-interview-bank",
  num: "A23",
  title: "React interview bank",
  short: "Interview bank",
  levels: ["advanced"],
  practice: ["ex-react-batched-updates-sim", "ex-react-conditional-slot-preserves-state"],
  ready: true,
  subtitle: "Forty-six questions split by level, and twenty output drills.",
  body: `<h3>How to use this</h3>
<p>
  Answer out loud before reading. The React round is mostly follow-ups &mdash;
  the first answer buys you the second question &mdash; so rehearse the chain,
  not the one-liner. Links go to the chapter where the reasoning lives.
</p>

<h3>Fresher &mdash; 0 to 2 years</h3>

<div class="qa"><p class="q">What is JSX, and what does it compile to?</p>
<p>Syntax sugar for a function call that returns a plain object describing the UI &mdash; <code>{ type, props }</code>. That is why it is an expression, why you cannot return two sibling tags, and why the rules feel like JavaScript rules rather than HTML ones.</p></div>

<div class="qa"><p class="q">Difference between props and state?</p>
<p>Props come from the parent and are read-only inside the component. State is owned by the component and changing it schedules a re-render. Data flows down as props; changes flow up as callbacks.</p></div>

<div class="qa"><p class="q">Why can't you write <code>if</code> inside JSX?</p>
<p>Braces take an <em>expression</em>, and <code>if</code> is a statement &mdash; it produces no value. Hence ternaries, <code>&amp;&amp;</code> and <code>.map()</code>.</p></div>

<div class="qa"><p class="q">What is the <code>key</code> prop for?</p>
<p>Item identity between renders, so React can match a new element to an existing DOM node. Not a performance hint. With index keys, deleting from the middle makes React preserve state on the wrong row &mdash; typed text and checkboxes move.</p></div>

<div class="qa"><p class="q">Why does <code>setCount(count + 1)</code> three times only add one?</p>
<p>Each render is a snapshot; all three read the same <code>count</code>. The updater form <code>setCount(c =&gt; c + 1)</code> receives the latest value and adds three.</p></div>

<div class="qa"><p class="q">Controlled versus uncontrolled input?</p>
<p>Controlled renders from state and reports changes back &mdash; React is the source of truth. Uncontrolled keeps the value in the DOM and you read it at submit, usually with <code>FormData</code>. Never switch a component between the two mid-life.</p></div>

<div class="qa"><p class="q">Why does <code>{items.length &amp;&amp; &lt;List /&gt;}</code> print a zero?</p>
<p><code>0 &amp;&amp; x</code> evaluates to <code>0</code>, and React renders zero as text &mdash; unlike <code>false</code>, <code>null</code> and <code>undefined</code>, which render nothing. Force a boolean: <code>length &gt; 0 &amp;&amp;</code>.</p></div>

<div class="qa"><p class="q">What is <code>useEffect</code> for?</p>
<p>Synchronising with something outside React &mdash; a subscription, a timer, a browser API. It runs after paint; the returned function cleans up before the next run and on unmount. The interesting half is what is <em>not</em> an effect: derived values, anything caused by a user action, and resetting state on a prop change.</p></div>

<h3>Mid &mdash; 2 to 5 years</h3>

<div class="qa"><p class="q">Explain the rules of hooks. Why do they exist?</p>
<p>Top level only, and only from React functions. React has no names for your hooks &mdash; it matches them to stored state <b>by call order</b>. Put one inside an <code>if</code> and every slot after it shifts, so one piece of state returns another's value.</p></div>

<div class="qa"><p class="q">What is a stale closure, and how do you fix it?</p>
<p>An effect captured the values of the render it ran in, and never re-ran &mdash; so an interval logs the first <code>count</code> forever. Four fixes in order: the updater form; add the dependency and accept the restart; <code>useEffectEvent</code>, which reads the latest value without depending on it; or a ref. See <a href="/react/react-effects-depth">effects in depth</a>.</p></div>

<div class="qa"><p class="q">What actually happens when state changes?</p>
<p>Render is a pure call producing an element tree, and is interruptible. Commit mutates the DOM and is synchronous. Diffing is per position and per type: same type keeps the node and its state, different type unmounts and remounts.</p></div>

<div class="qa"><p class="q">When does <code>memo</code> do nothing?</p>
<p>When any prop is a new reference each render &mdash; an inline arrow, an object or array literal, a style object. <code>memo</code> compares props shallowly, so the check fails every time and you have added cost for nothing. It is a contract with every call site, not one decision.</p></div>

<div class="qa"><p class="q">Context versus a state library?</p>
<p>Context is a transport with no selectors: when the provider value changes by identity, every consumer re-renders, even one reading a field that did not change. A store subscribes per slice. Also memoise the provider value, or an object literal re-renders everyone on every parent render.</p></div>

<div class="qa"><p class="q">When would you use <code>useReducer</code> over <code>useState</code>?</p>
<p>When several fields change together, when the same transition happens from many places, or when you want the logic testable without rendering. The real payoff is that impossible states stop being representable &mdash; four booleans give sixteen combinations, one <code>status</code> field gives four.</p></div>

<div class="qa"><p class="q">What is wrong with fetching in <code>useEffect</code>?</p>
<p>Five things: <code>fetch</code> does not throw on a 404, so errors pass silently; a race where a slow earlier response overwrites a newer one; no cache; no deduplication between components; and waterfalls, since each level discovers what it needs only after its parent rendered. See <a href="/react/react-data-fetching">data fetching</a>.</p></div>

<div class="qa"><p class="q">How do you reset a component's state when a prop changes?</p>
<p><code>&lt;Form key={userId} /&gt;</code>. React sees a new key, unmounts and mounts fresh. An effect watching the prop renders once with the stale value first.</p></div>

<div class="qa"><p class="q">Difference between <code>useMemo</code> and <code>useCallback</code>?</p>
<p><code>useCallback(fn, d)</code> is <code>useMemo(() =&gt; fn, d)</code>. One caches a value, the other a function identity. Both are for expense or for referential stability, and both cost something &mdash; memoising arithmetic loses.</p></div>

<div class="qa"><p class="q">How would you render ten thousand rows?</p>
<p>Virtualise &mdash; render the twenty that are visible. The bottleneck is DOM node count, which is the browser's problem, not React's; no amount of <code>memo</code> substitutes for it. Mention the costs: Ctrl-F stops finding off-screen content, and variable heights get awkward.</p></div>

<div class="qa"><p class="q">What is a custom hook, and what does it share?</p>
<p>A function starting with <code>use</code> that calls other hooks. It shares <b>logic, never state</b> &mdash; two components calling it get independent state. Shared state is context or a store.</p></div>

<div class="qa"><p class="q">How do you type a component's props?</p>
<p>Annotate the parameter; no <code>React.FC</code>. Extend the DOM element rather than restating attributes: <code>React.ComponentProps&lt;"button"&gt; &amp; { variant?: "primary" | "ghost" }</code>.</p></div>

<div class="qa"><p class="q">Why does a Zustand selector returning <code>{ a, b }</code> break?</p>
<p>The store compares the selector's result with the last one by reference, and an object literal is new every call, so it always looks changed. In Zustand 4 that was a re-render on every store update; in Zustand 5 it loops until React throws "Maximum update depth exceeded". Select each value separately, or wrap the selector in <code>useShallow</code>, which compares the object's fields instead. See <a href="/react/react-state-libraries">State libraries</a>.</p></div>

<div class="qa"><p class="q">Why is <code>pending</code> always false in my <code>useFormStatus</code>?</p>
<p>It reads the status of the <b>parent</b> form of the component that calls it, never a form that component renders itself. Calling it next to the <code>&lt;form&gt;</code> tag returns false forever. Move it into a child, such as a <code>&lt;SubmitButton /&gt;</code> rendered inside the form, which is also what makes that button reusable with no props.</p></div>

<div class="qa"><p class="q">What do route loaders give you over fetching in an effect?</p>
<p>The data is there on the first render, so there is no loading branch in the component. Loaders for every matched route run in parallel, which removes the render-fetch waterfall. And the router cancels a superseded navigation, so a slow response for the previous page cannot overwrite the current one. After an action, loaders revalidate without manual refetching. See <a href="/react/react-router">React Router</a>.</p></div>

<div class="qa"><p class="q">How do you accept a <code>ref</code> in a wrapper component in React 19, with TypeScript?</p>
<p>Type the props as <code>React.ComponentProps&lt;"input"&gt;</code> and spread them onto the input. <code>ref</code> is an ordinary prop since React 19, and that type already includes it, so no <code>forwardRef</code> is needed. Use <code>ComponentPropsWithoutRef</code> when a wrapper must not pass a ref through. See <a href="/react/react-typescript">TypeScript with React</a>.</p></div>

<h3>Senior &mdash; 5 years and up</h3>

<div class="qa"><p class="q">What is Fiber, and what did it change?</p>
<p>Reconciliation moved from recursion to a walk over a linked list of work units, so rendering became <b>interruptible</b> while commit stayed synchronous. Everything after it &mdash; time slicing, transitions, Suspense, streaming &mdash; needed that one capability. It is also why components must be pure: a render may be abandoned and re-run.</p></div>

<div class="qa"><p class="q">How does React skip work?</p>
<p>Bailouts. If props are referentially equal with no pending state, React reuses the fiber without calling your component. If the element object is identical &mdash; which is what happens when you pass <code>children</code> straight through &mdash; the whole subtree is skipped. That is why composition beats <code>memo</code>.</p></div>

<div class="qa"><p class="q">What are concurrent features actually doing?</p>
<p>Prioritising. <code>startTransition</code> marks an update interruptible, so a keystroke is never queued behind it, and React discards in-progress low-priority work when newer input arrives. Not a debounce &mdash; it yields on demand rather than waiting a fixed time. It cannot help a single 300ms synchronous block, because there is no yield point inside one.</p></div>

<div class="qa"><p class="q">Server Components versus SSR?</p>
<p>SSR renders your components on the server for fast HTML, then ships the same components to run again in the browser. Server Components run <b>only</b> on the server and ship no JavaScript &mdash; the client receives a serialised element tree. They can await data directly, which removes the API layer and the render-fetch waterfall.</p></div>

<div class="qa"><p class="q">What does <code>"use client"</code> actually mark?</p>
<p>A boundary, not a component. Everything the file imports becomes client code transitively, so it belongs as low in the tree as possible. A client component cannot import a server one, but can receive one as <code>children</code> &mdash; by then it is a rendered payload rather than code.</p></div>

<div class="qa"><p class="q">What is the risk with Server Actions?</p>
<p><code>"use server"</code> publishes a public HTTP endpoint. Being imported by one form protects nothing &mdash; anyone can call it with any arguments. Every action authenticates, authorises and validates for itself, exactly like a REST route.</p></div>

<div class="qa"><p class="q">Explain Suspense, and its interaction with transitions.</p>
<p>A component suspends by throwing a promise; the nearest boundary shows its fallback and retries on resolve. The important interaction: inside a transition, React keeps the <em>current</em> content on screen rather than replacing it with the fallback &mdash; which is the difference between a page that flashes on every navigation and one that feels continuous.</p></div>

<div class="qa"><p class="q">Why does <code>useSyncExternalStore</code> exist?</p>
<p>Tearing. With the effect-and-state pattern, an external value can change mid-render under concurrency, so two components show different values of the same store in one frame. It also gives a server snapshot, which the naive version cannot. Every state library moved to it in React 18.</p></div>

<div class="qa"><p class="q">How would you debug a slow React page?</p>
<p>Profile first, with "record why each component rendered" on &mdash; "slow" means five different things. Then fix structure before caching: move state down, pass children, virtualise, code-split. Memoise last, at the place the profiler pointed. Then measure again and delete what did not help.</p></div>

<div class="qa"><p class="q">How do you find a memory leak in a React app?</p>
<p>Heap snapshot, repeat a navigation five times, snapshot again, compare retained size and sort by detached nodes. The cause is almost always an effect with no cleanup &mdash; a listener, an interval, a subscription &mdash; holding a closure over something large. Strict Mode's double mount makes it show up twice as fast.</p></div>

<div class="qa"><p class="q">You inherit a 200,000-line class-based app on React 17. What do you do?</p>
<p>Not a rewrite. Get onto a supported version first, then move server state out of Redux into a query cache &mdash; usually the biggest single deletion. TypeScript file by file. Convert classes only when you are already in the file. Put the progress numbers in CI, and name the code you will deliberately never touch.</p></div>

<div class="qa"><p class="q">What does the React Compiler do, and should you delete your <code>useMemo</code> calls?</p>
<p>It memoises at build time by analysing which values depend on which, including after an early return where a hook could never go. For new code, rely on it and keep <code>useMemo</code>/<code>useCallback</code> as escape hatches for exact control. For existing code, leave the memoisation in place or remove it only with testing, because removing it can change the compiled output. Adopt it with the <code>eslint-plugin-react-hooks</code> rules first, then <code>annotation</code> mode and <code>"use memo"</code>. See <a href="/react/react-memoisation">Memoisation</a>.</p></div>

<div class="qa"><p class="q">What was React2Shell, and what did it change about how you ship Server Components?</p>
<p>CVE-2025-55182, CVSS 10.0, disclosed December 2025: a crafted request to any Server Function endpoint could run code on the server, with no authentication, and it was exploited within days. Pure client apps were unaffected. The lessons are that every Server Function is a public endpoint that must validate and authorise its input, that the framework has to be upgraded as well as React, and that tracking advisories is part of the job. See <a href="/react/react-server-components">Server Components</a>.</p></div>

<div class="qa"><p class="q">How would you animate a route change in React today?</p>
<p>With <code>&lt;ViewTransition&gt;</code>, stable since React 19.3. Wrap the page, trigger the navigation inside <code>startTransition</code> &mdash; a plain <code>setState</code> does not animate &mdash; and use <code>addTransitionType</code> to pick a different animation for back and forward. Put the boundary before any DOM node, name matching boundaries for a shared-element morph, and respect <code>prefers-reduced-motion</code>. See <a href="/react/react-animation">Animation</a>.</p></div>

<div class="qa"><p class="q">What would you look for reviewing someone's React?</p>
<p>State that should not exist &mdash; derived values stored, or the same truth twice. Effects that are not synchronisation. Missing loading, empty and error states. Index keys. Icon buttons with no accessible name. And the question that catches most of it: <b>what happens the second time?</b></p></div>

<div class="qa"><p class="q">In a Server Component, when do you <code>await</code> and when do you pass a promise to <code>use</code>?</p>
<p>Await data the component itself renders. Pass an unawaited promise when a child further down renders it, so the request starts early without blocking the fast parts of the page, and a Suspense boundary decides what shows meanwhile. On the client, <code>use</code> needs a cached promise &mdash; one created during render loops &mdash; and it cannot sit inside <code>try/catch</code>; rejection goes to an error boundary, or becomes a value with <code>.catch</code> before it is passed in. See <a href="/react/react-use-hook">The use() hook</a>.</p></div>

<div class="qa"><p class="q">How do Suspense and transitions decide whether the user sees a fallback?</p>
<p>A boundary showing content goes back to its fallback when something inside suspends, unless the update came from <code>startTransition</code> or <code>useDeferredValue</code>, in which case the old content stays. That default is wrong when the content is genuinely different &mdash; another user's profile &mdash; so a <code>key</code> resets the boundary. React also reveals suspended content at most once every 300ms, so boundaries that finish close together appear together. See <a href="/react/react-suspense">Suspense</a>.</p></div>

<div class="qa"><p class="q">What happens to <code>useSyncExternalStore</code> during a transition?</p>
<p>Store updates cannot be transitions. React calls <code>getSnapshot</code> again just before committing a transition, and if the store changed it restarts the render as a blocking update so the screen shows one version. The consequences: do not suspend on a store value, because it will replace visible content with a fallback; and the server snapshot is also what hydration renders, so client-only values change after load. See <a href="/react/react-sync-external-store">useSyncExternalStore</a>.</p></div>

<div class="qa"><p class="q">The codebase uses Recoil. What do you do?</p>
<p>Plan a migration. Meta archived the repository on 1 January 2025, so it receives no fixes for new React versions. Jotai is the usual destination because atoms and derived atoms map almost one to one; move one feature at a time behind the same hooks. And before porting a single atom, ask whether it is server data that belongs in a query cache instead. See <a href="/react/react-state-libraries">State libraries</a>.</p></div>

<div class="qa"><p class="q">How do you make a lookup table fail to compile when a new case is added?</p>
<p><code>const labels = { ... } satisfies Record&lt;Status, string&gt;</code>. <code>satisfies</code> checks the object against the type without widening it, so a missing status or a stale key is an error while the object keeps its precise type. It is exhaustiveness for data, the way <code>assertNever</code> is for a <code>switch</code>. See <a href="/react/react-advanced-typescript">Advanced TypeScript</a>.</p></div>

<div class="qa"><p class="q">Next.js gives you <code>updateTag</code> and <code>revalidateTag</code>. When is each right?</p>
<p><code>updateTag</code> is for read-your-own-writes: callable only in a Server Action, and the next read waits for fresh data, so the user who created a post sees it. <code>revalidateTag(tag, "max")</code> marks data stale and serves the old copy while refreshing, and works from route handlers too, which suits webhooks. The one-argument <code>revalidateTag</code> is deprecated in Next.js 16. See <a href="/react/react-server-actions">Server Actions</a>.</p></div>

<div class="qa"><p class="q">When would you argue against using React?</p>
<p>A mostly static content site &mdash; it costs a runtime and hydration on every page to make three widgets work, and islands ship the same UI with almost no JavaScript. A small embedded widget, where bundle size dominates. And a team that knows something else well, because familiarity beats theoretical fit.</p></div>

<h3>Output drills &mdash; say what happens before you run it</h3>
<p>
  Interviewers put a snippet on screen and ask what it logs or renders. Each of
  these hides one rule. Cover the answer, commit to one out loud, then check.
  Assume React 19 with <code>createRoot</code>, and no Strict Mode unless the
  drill says so.
</p>

<div class="qa"><p class="q">1. The count starts at 0. What is logged, and what renders after one click?</p>
<pre><code>function handleClick() {
  setN(n + 1);
  setN(n + 1);
  console.log(n);
}</code></pre>
<p>Logs <code>0</code>; renders <code>1</code>. Both calls read the same snapshot, and <code>n</code> in this render never changes.</p></div>

<div class="qa"><p class="q">2. Starting from 0?</p>
<pre><code>setN(n + 5);
setN((c) =&gt; c + 1);</code></pre>
<p><code>6</code>. Updates queue in order: the first replaces the value with 5, the updater then receives 5.</p></div>

<div class="qa"><p class="q">3. Starting from 0?</p>
<pre><code>setN((c) =&gt; c + 1);
setN(42);</code></pre>
<p><code>42</code>. A plain value replaces whatever the queue had built so far.</p></div>

<div class="qa"><p class="q">4. In what order do these log on the first render?</p>
<pre><code>function Parent() {
  console.log("render parent");
  useEffect(() =&gt; console.log("effect parent"));
  return &lt;Child /&gt;;
}
function Child() {
  console.log("render child");
  useEffect(() =&gt; console.log("effect child"));
}</code></pre>
<p><code>render parent</code>, <code>render child</code>, <code>effect child</code>, <code>effect parent</code>. Rendering goes top down; effects run after commit from the children up, so a parent's effect can rely on its children being set up.</p></div>

<div class="qa"><p class="q">5. In development with Strict Mode, what logs when this mounts?</p>
<pre><code>useEffect(() =&gt; {
  console.log("subscribe");
  return () =&gt; console.log("unsubscribe");
}, []);</code></pre>
<p><code>subscribe</code>, <code>unsubscribe</code>, <code>subscribe</code>. Strict Mode mounts, unmounts and remounts once to prove the cleanup works. Production logs <code>subscribe</code> once.</p></div>

<div class="qa"><p class="q">6. Which logs first?</p>
<pre><code>useEffect(() =&gt; console.log("effect"));
useLayoutEffect(() =&gt; console.log("layout"));</code></pre>
<p><code>layout</code>, then <code>effect</code>. Layout effects run after the DOM changes but before the browser paints; ordinary effects run after paint. Order in the source does not matter.</p></div>

<div class="qa"><p class="q">7. The user clicks the counter up to 3, then <code>isAdmin</code> flips. What does the counter show?</p>
<pre><code>{isAdmin ? &lt;Counter label="Admin" /&gt; : &lt;Counter label="User" /&gt;}</code></pre>
<p><code>3</code>. Same component type at the same position, so React keeps the instance and its state and only updates the label. Add different <code>key</code>s to reset it.</p></div>

<div class="qa"><p class="q">8. The second counter is at 3. <code>showBanner</code> goes from true to false. What does it show?</p>
<pre><code>&lt;div&gt;
  {showBanner &amp;&amp; &lt;Banner /&gt;}
  &lt;Counter /&gt;
&lt;/div&gt;</code></pre>
<p><code>3</code>. <code>false</code> still occupies the first slot, so <code>Counter</code> stays in the second position and keeps its state.</p></div>

<div class="qa"><p class="q">9. What happens as the user types?</p>
<pre><code>function Form() {
  const [text, setText] = useState("");
  function Field() {
    return &lt;input value={text} onChange={(e) =&gt; setText(e.target.value)} /&gt;;
  }
  return &lt;Field /&gt;;
}</code></pre>
<p>The input loses focus after every keystroke. <code>Field</code> is a new function on every render, so React sees a new component type, unmounts the old input and mounts a fresh one. Define components at module scope.</p></div>

<div class="qa"><p class="q">10. <code>Row</code> is wrapped in <code>memo</code>. Does it re-render when the parent does?</p>
<pre><code>&lt;Row item={item} style={{ padding: 8 }} /&gt;</code></pre>
<p>Yes, every time. The style object is new on each render, so the shallow prop comparison always fails.</p></div>

<div class="qa"><p class="q">11. The button is clicked three times. What is on screen?</p>
<pre><code>const clicks = useRef(0);
return &lt;button onClick={() =&gt; clicks.current++}&gt;{clicks.current}&lt;/button&gt;;</code></pre>
<p><code>0</code>. The ref really is 3, but changing a ref does not schedule a render. The next render for any other reason will show 3.</p></div>

<div class="qa"><p class="q">12. How many times does the component render after the timeout fires?</p>
<pre><code>setTimeout(() =&gt; {
  setA(1);
  setB(2);
}, 100);</code></pre>
<p>Once. Since React 18, updates are batched everywhere &mdash; timeouts, promises and native handlers included, not only React events.</p></div>

<div class="qa"><p class="q">13. What does the counter show after five seconds?</p>
<pre><code>useEffect(() =&gt; {
  const id = setInterval(() =&gt; setCount(count + 1), 1000);
  return () =&gt; clearInterval(id);
}, []);</code></pre>
<p><code>1</code>. The interval closed over the first render's <code>count</code>, which is 0, so it sets 1 every second. <code>setCount((c) =&gt; c + 1)</code> fixes it.</p></div>

<div class="qa"><p class="q">14. How many times does <code>load</code> run over ten renders, in production?</p>
<pre><code>const [a] = useState(load());
const [b] = useState(() =&gt; load());</code></pre>
<p>Ten for the first line, one for the second. <code>load()</code> is an ordinary call made on every render, and its result is thrown away after the first. Passing the function lets React call it only for the initial value.</p></div>

<div class="qa"><p class="q">15. Does the list update?</p>
<pre><code>function add(item) {
  items.push(item);
  setItems(items);
}</code></pre>
<p>No. The array is the same reference, so React compares with <code>Object.is</code>, sees no change and skips the render. <code>setItems([...items, item])</code> works.</p></div>

<div class="qa"><p class="q">16. In development with Strict Mode, one "added" action is dispatched. How many items appear?</p>
<pre><code>case "added":
  state.items.push(action.item);
  return { ...state };</code></pre>
<p>Two. Strict Mode calls the reducer twice to expose impurity, and both calls push into the same array. Production shows one, which is exactly why the bug survives until someone compares states.</p></div>

<div class="qa"><p class="q">17. <code>Toolbar</code> is wrapped in <code>memo</code> and reads <code>ThemeContext</code>. <code>App</code> re-renders for an unrelated reason. Does <code>Toolbar</code>?</p>
<pre><code>function App() {
  const [theme] = useState("dark");
  return (
    &lt;ThemeContext value={{ theme }}&gt;
      &lt;Toolbar /&gt;
    &lt;/ThemeContext&gt;
  );
}</code></pre>
<p>Yes. The value is a new object every time <code>App</code> renders, so every consumer re-renders regardless of <code>memo</code>. Wrap the value in <code>useMemo</code>, or pass the string itself.</p></div>

<div class="qa"><p class="q">18. The count is 0. What is logged?</p>
<pre><code>async function handleClick() {
  setN(n + 1);
  await save();
  console.log(n);
}</code></pre>
<p><code>0</code>. Awaiting does not refresh the closure. The component has re-rendered with 1 by then, but this function belongs to the render where <code>n</code> was 0.</p></div>

<div class="qa"><p class="q">19. How often does this effect run?</p>
<pre><code>const options = { limit: 10 };
useEffect(() =&gt; {
  fetchItems(options);
}, [options]);</code></pre>
<p>After every render. <code>options</code> is a new object each time, so the dependency always looks changed. Move it outside the component, depend on <code>options.limit</code>, or create it inside the effect.</p></div>

<div class="qa"><p class="q">20. What happens on the first render?</p>
<pre><code>const size = useSyncExternalStore(
  subscribe,
  () =&gt; ({ width: window.innerWidth })
);</code></pre>
<p>React warns "The result of getSnapshot should be cached", then throws "Maximum update depth exceeded". Every call returns a new object, so the snapshot always looks changed. Return <code>window.innerWidth</code> itself.</p></div>

<div class="bx is-ref">
  <span class="ttl">The four that decide most React rounds</span>
  <p>
    Hooks rules and why they exist. Reconciliation and keys. What is and is not
    an effect. The server boundary. Everything else is a follow-up to one of
    those &mdash; rehearse them until the follow-up is where you get interesting,
    not where you run out.
  </p>
</div>`,
};
