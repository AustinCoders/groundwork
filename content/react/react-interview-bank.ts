import type { Chapter } from "../types";

export const reactInterviewBank: Chapter = {
  id: "react-interview-bank",
  num: "A21",
  title: "React interview bank",
  short: "Interview bank",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle: "Thirty-five questions, split by the level they are asked at.",
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

<div class="qa"><p class="q">What would you look for reviewing someone's React?</p>
<p>State that should not exist &mdash; derived values stored, or the same truth twice. Effects that are not synchronisation. Missing loading, empty and error states. Index keys. Icon buttons with no accessible name. And the question that catches most of it: <b>what happens the second time?</b></p></div>

<div class="qa"><p class="q">When would you argue against using React?</p>
<p>A mostly static content site &mdash; it costs a runtime and hydration on every page to make three widgets work, and islands ship the same UI with almost no JavaScript. A small embedded widget, where bundle size dominates. And a team that knows something else well, because familiarity beats theoretical fit.</p></div>

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
