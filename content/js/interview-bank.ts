import type { Chapter } from "../types";

export const interviewBank: Chapter = {
  id: "interview-bank",
  num: "A11",
  title: "JavaScript interview bank",
  short: "Interview bank",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle: "Forty questions, split by the level they are asked at, with the answer that lands.",
  body: `<h3>How to use this</h3>
<p>
  Answer out loud before reading. Recognising an answer and producing one are
  different skills, and only the second is tested. Where a question links to a
  chapter, that is where the reasoning lives &mdash; this page is recall, not
  teaching.
</p>

<h3>Fresher &mdash; 0 to 2 years</h3>

<div class="qa"><p class="q">What is the difference between <code>var</code>, <code>let</code> and <code>const</code>?</p>
<p><code>var</code> is function-scoped and hoisted as <code>undefined</code>; <code>let</code> and <code>const</code> are block-scoped and sit in the temporal dead zone until declared. <code>const</code> stops reassignment, not mutation &mdash; a <code>const</code> object's contents can still change.</p></div>

<div class="qa"><p class="q">What does <code>typeof null</code> return, and why?</p>
<p><code>"object"</code>. A bug from the first implementation, where the type tag for objects was <code>000</code> and <code>null</code> was the null pointer &mdash; also all zeroes. Kept because fixing it would break the web.</p></div>

<div class="qa"><p class="q">What is the difference between <code>==</code> and <code>===</code>?</p>
<p><code>===</code> compares type and value. <code>==</code> coerces first, with rules worth knowing: <code>null == undefined</code> is <code>true</code>, but <code>null == 0</code> is <code>false</code>. Use <code>===</code>; the one common exception is <code>x == null</code> to catch both nullish values.</p></div>

<div class="qa"><p class="q">Which values are falsy?</p>
<p>Exactly eight: <code>false</code>, <code>0</code>, <code>-0</code>, <code>0n</code>, <code>""</code>, <code>null</code>, <code>undefined</code>, <code>NaN</code>. Everything else is truthy &mdash; including <code>[]</code>, <code>{}</code> and <code>"0"</code>.</p></div>

<div class="qa"><p class="q">What is hoisting?</p>
<p>Declarations are registered before any code runs. <code>var</code> is initialised to <code>undefined</code>; function declarations are fully available; <code>let</code>, <code>const</code> and <code>class</code> are registered but unreachable until their line &mdash; the temporal dead zone.</p></div>

<div class="qa"><p class="q">Difference between <code>null</code> and <code>undefined</code>?</p>
<p><code>undefined</code> is the language's absence &mdash; unassigned variables, missing properties, no return. <code>null</code> is your absence, assigned deliberately to mean "nothing here".</p></div>

<div class="qa"><p class="q">What does <code>this</code> refer to?</p>
<p>How the function was <em>called</em>, not where it was written. Five rules in order: <code>new</code>, then explicit <code>call</code>/<code>apply</code>/<code>bind</code>, then a method call's object, then default (<code>undefined</code> in strict mode), and arrow functions, which have no <code>this</code> of their own and take the enclosing one. See <a href="/notes/scope-functions">Scope &amp; functions</a>.</p></div>

<div class="qa"><p class="q">Which array methods mutate?</p>
<p><code>push</code>, <code>pop</code>, <code>shift</code>, <code>unshift</code>, <code>splice</code>, <code>sort</code>, <code>reverse</code>, <code>fill</code>. The rest return a new array. The modern non-mutating twins are <code>toSorted</code>, <code>toReversed</code>, <code>toSpliced</code> and <code>with</code>.</p></div>

<div class="qa"><p class="q">What is the difference between <code>map</code> and <code>forEach</code>?</p>
<p><code>map</code> returns a new array of the results; <code>forEach</code> returns <code>undefined</code> and exists for side effects. Using <code>map</code> and discarding the result is a signal you meant <code>forEach</code>.</p></div>

<div class="qa"><p class="q">How do you copy an object?</p>
<p><code>{ ...obj }</code> and <code>Object.assign</code> are shallow &mdash; nested objects are shared. For a deep copy, <code>structuredClone</code> is built in and handles <code>Date</code>, <code>Map</code>, <code>Set</code> and cycles. <code>JSON.parse(JSON.stringify(x))</code> silently drops functions, <code>undefined</code> and dates.</p></div>

<h3>Mid &mdash; 2 to 5 years</h3>

<div class="qa"><p class="q">Explain the event loop. Where do promises and <code>setTimeout</code> sit?</p>
<p>One thread, a call stack, and queues. When the stack empties, <b>all</b> microtasks drain &mdash; promise callbacks, <code>queueMicrotask</code>, <code>MutationObserver</code> &mdash; before the next macrotask, which is where timers and I/O live. So <code>Promise.resolve().then(...)</code> always logs before <code>setTimeout(..., 0)</code>. A promise chain that keeps scheduling can starve timers indefinitely.</p></div>

<div class="qa"><p class="q">What is a closure? Give one from real code.</p>
<p>A function that keeps access to the scope it was created in, after that scope returned. Real ones: a debounce holding its <code>timer</code>, a module keeping private state, a memo cache. The follow-up is always "where have you used one" &mdash; have an answer that is not a counter.</p></div>

<div class="qa"><p class="q">What happens with <code>var</code> in a loop with <code>setTimeout</code>?</p>
<p>All callbacks share one binding and log the final value. <code>let</code> creates a fresh binding per iteration and prints 0, 1, 2. The classic pre-ES6 fix was an IIFE to capture the value.</p></div>

<div class="qa"><p class="q">Difference between <code>call</code>, <code>apply</code> and <code>bind</code>?</p>
<p><code>call</code> invokes with arguments listed, <code>apply</code> with an array, <code>bind</code> returns a new function with <code>this</code> fixed and does not invoke. Partial application falls out of <code>bind</code>.</p></div>

<div class="qa"><p class="q">How does prototypal inheritance work?</p>
<p>Every object has a hidden link to another object. A missed property lookup walks that chain until it finds one or reaches <code>null</code>. <code>class</code> is syntax over the same mechanism &mdash; methods live on <code>Constructor.prototype</code>, shared by every instance.</p></div>

<div class="qa"><p class="q">Write <code>debounce</code>.</p>
<pre><code>function debounce(fn, ms) {
  let t;
  return (...args) =&gt; {
    clearTimeout(t);
    t = setTimeout(() =&gt; fn(...args), ms);
  };
}</code></pre>
<p>Then say the difference from throttle: debounce fires after the activity stops, throttle fires at most once per interval. Search boxes want debounce; scroll handlers want throttle.</p></div>

<div class="qa"><p class="q">What is event delegation?</p>
<p>One listener on a common ancestor instead of one per child, using <code>e.target</code> to work out what was hit. Fewer listeners, and it keeps working for elements added later.</p></div>

<div class="qa"><p class="q"><code>Promise.all</code> versus <code>allSettled</code> versus <code>race</code> versus <code>any</code>?</p>
<p><code>all</code> rejects on the first failure; <code>allSettled</code> waits for everything and reports each outcome; <code>race</code> settles on the first to finish either way; <code>any</code> resolves on the first success and rejects only if all fail.</p></div>

<div class="qa"><p class="q">How do you cancel a fetch?</p>
<p><code>AbortController</code> &mdash; pass <code>controller.signal</code> and call <code>abort()</code>. The rejection has <code>name === "AbortError"</code>, which you check for rather than reporting as a failure. It is also the fix for the request race where a slow early response overwrites a fast late one.</p></div>

<div class="qa"><p class="q">Deep-equality check, from scratch?</p>
<p>Handle primitives with <code>Object.is</code>, then reject mismatched types, then compare keys by length and recurse. Say the edge cases before you are asked: <code>NaN</code>, <code>-0</code>, arrays versus objects, <code>Date</code>, and cycles.</p></div>

<div class="qa"><p class="q">What is the difference between a <code>Map</code> and an object?</p>
<p><code>Map</code> takes any key type including objects, preserves insertion order, has a real <code>size</code>, and is iterable. An object coerces keys to strings and carries prototype keys. Use <code>Map</code> when keys are dynamic or not strings.</p></div>

<div class="qa"><p class="q">Explain <code>async</code>/<code>await</code> against promises.</p>
<p>Syntax over the same objects. An <code>async</code> function always returns a promise; <code>await</code> pauses that function and resumes as a microtask. The common mistake is awaiting in a loop where the calls are independent &mdash; that is sequential when <code>Promise.all</code> would be parallel.</p></div>

<h3>Senior &mdash; 5 years and up</h3>

<div class="qa"><p class="q">How does the garbage collector decide what to free?</p>
<p>Reachability from roots, not reference counting &mdash; which is why cycles are collected. V8 uses a generational collector: a small young space scavenged often, survivors promoted to an old space collected by mark-and-sweep with compaction. See <a href="/notes/engine-memory">Engine &amp; memory</a>.</p></div>

<div class="qa"><p class="q">What causes a memory leak in a browser app?</p>
<p>Something long-lived holding something large: a listener never removed, an interval never cleared, a subscription never closed, a cache that only grows, a detached DOM node still referenced. The tool is a heap snapshot before and after repeating an action, sorted by retained size.</p></div>

<div class="qa"><p class="q">What are hidden classes and inline caches?</p>
<p>V8 gives objects with the same shape a shared hidden class so property access is an offset rather than a hash lookup, and caches the lookup at each call site. Adding properties in a different order, or later, creates a new shape and can deoptimise the call site. Initialise all fields in the constructor, in one order.</p></div>

<div class="qa"><p class="q">Explain <code>Proxy</code> and <code>Reflect</code>.</p>
<p><code>Proxy</code> intercepts fundamental operations &mdash; get, set, has, deleteProperty &mdash; and <code>Reflect</code> gives the default behaviour to delegate to, with the correct <code>receiver</code>. It is how reactive frameworks track dependencies. The cost is real and every trap is a function call.</p></div>

<div class="qa"><p class="q">How do generators work, and what are they for?</p>
<p><code>function*</code> returns an iterator that pauses at each <code>yield</code> and resumes with a value passed back in. Two-way communication is the point. Uses: lazy or infinite sequences, custom iteration via <code>Symbol.iterator</code>, and cooperative scheduling &mdash; async/await is built on the same suspend-and-resume idea.</p></div>

<div class="qa"><p class="q">How would you run heavy work without freezing the page?</p>
<p>Move it to a Web Worker so it runs off the main thread and can be terminated; use <code>SharedArrayBuffer</code> and <code>Atomics</code> only if the data is genuinely large enough to make copying the bottleneck. If it must stay on the main thread, split it into chunks and yield &mdash; <code>scheduler.yield</code> or a macrotask &mdash; so the browser can paint and handle input.</p></div>

<div class="qa"><p class="q">What is the difference between ESM and CommonJS?</p>
<p>ESM is static &mdash; imports are resolved before execution, which makes tree-shaking possible &mdash; and its bindings are live views, not copies. CommonJS is dynamic and synchronous, and <code>module.exports</code> is a value copied at require time. The interop pain is almost always default-export shape and top-level <code>await</code>.</p></div>

<div class="qa"><p class="q">How do you prevent XSS in a JavaScript application?</p>
<p>Never build HTML from user input; if you must render HTML, sanitise with a real library. Validate URL protocols before putting them in <code>href</code> &mdash; <code>javascript:</code> executes. A Content Security Policy is the seatbelt, not the fix. And anything in a public env variable is public.</p></div>

<div class="qa"><p class="q">Explain the temporal dead zone and why it exists.</p>
<p>Between entering a scope and the <code>let</code>/<code>const</code> declaration, the binding exists but access throws. It exists so that using a value before it is initialised is an error rather than silently <code>undefined</code> &mdash; the failure mode <code>var</code> has.</p></div>

<div class="qa"><p class="q">What does <code>0.1 + 0.2 !== 0.3</code> tell you, and how do you handle money?</p>
<p>IEEE-754 doubles cannot represent those decimals exactly. Never store money as a float: use integer minor units &mdash; paise, cents &mdash; or a decimal library, and format for display with <code>Intl.NumberFormat</code>.</p></div>

<div class="qa"><p class="q">How would you implement a concurrency-limited task pool?</p>
<p>Keep a running count, start tasks while it is under the limit, and on each settle start the next from a queue. Say the parts that get skipped: results must stay in input order, one rejection must not strand the pool, and there should be a way to cancel. See <a href="/notes/advanced-async">Advanced async</a>.</p></div>

<div class="qa"><p class="q">What actually happens between typing a URL and seeing the page?</p>
<p>DNS, TCP, TLS, the HTML response, then parsing &mdash; which blocks on synchronous scripts unless they are <code>defer</code> or <code>type="module"</code> &mdash; then the CSSOM, layout, paint, and finally your JavaScript running. The point of the question is whether you know where your code sits in that order.</p></div>

<div class="bx is-ref">
  <span class="ttl">The three that decide most interviews</span>
  <p>
    The event loop, closures, and <code>this</code>. They come up at every level,
    the follow-ups go deeper each time, and a confident answer to all three buys
    you credit for the rest of the hour. Rehearse those out loud even if you skip
    everything else here.
  </p>
</div>`,
};
