import type { Chapter } from "../types";

export const patternsArchitecture: Chapter = {
  id: "patterns-architecture",
  num: "A5",
  title: "Patterns & architecture",
  short: "Patterns & architecture",
  levels: ["advanced"],
  practice: ["ex-order-state-machine", "ex-compose-patterns"],
  ready: true,
  subtitle: "Shapes that show up again and again once code has to scale past one file.",
  body: `<h3>Functional programming basics</h3>
<p>
  A <b>pure</b> function's output depends only on its inputs, and it
  touches nothing outside itself — no network call, no mutating an
  argument, no reading a global. The upside isn't philosophical: a pure
  function is trivially testable (call it, check the return value, no
  setup), safely memoizable
  (<a href="/notes/scope-functions">already covered</a>), and safe to
  run in any order or in parallel, since it can't step on anything
  else's state.
</p>
<pre><code><span class="c">// impure — depends on and mutates something outside itself</span>
let discount = 0.1;
function applyDiscount(price) { return price - price * discount; }

<span class="c">// pure — same inputs, same output, forever, no matter what else is happening</span>
function applyDiscountPure(price, rate) { return price - price * rate; }</code></pre>
<p>
  <b>Immutability</b> — building new values instead of changing
  existing ones — is what keeps a codebase full of pure functions
  actually pure; it's the same idea
  <a href="/notes/error-handling-debugging">already covered</a> for why
  React checks <code>===</code> instead of deep-comparing.
</p>
<p>
  A <b>transducer</b> is a composable transformation that's independent
  of the collection it eventually runs against — instead of
  <code>arr.map(f).filter(p)</code> building one throwaway intermediate
  array between the two steps, a transducer combines <code>map</code>
  and <code>filter</code> into a <em>single</em> combined step function,
  run once per element, zero intermediate arrays:
</p>
<div class="try">
  <pre><code>const mapping = (fn) =&gt; (reducer) =&gt; (acc, val) =&gt; reducer(acc, fn(val));
const filtering = (pred) =&gt; (reducer) =&gt; (acc, val) =&gt; (pred(val) ? reducer(acc, val) : acc);
const compose = (...fns) =&gt; fns.reduce((f, g) =&gt; (...args) =&gt; f(g(...args)));

const push = (acc, val) =&gt; (acc.push(val), acc);
const transform = compose(mapping((x) =&gt; x * 2), filtering((x) =&gt; x &gt; 5));

console.log([1, 2, 3, 4, 5].reduce(transform(push), []));   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>[6, 8, 10]</code> — every element is doubled, then kept only if
  the doubled value clears 5, all inside <em>one</em>
  <code>reduce</code> pass with no intermediate array built between the
  two steps. This is a genuinely deep rabbit hole (it's the core idea
  behind libraries like <code>transducers-js</code>) — the takeaway at
  this level is what problem it solves: composing transformations
  without paying for an intermediate array at every step.
</p>

<h3>Design patterns, in JS terms</h3>
<table>
  <tr>
    <th>Pattern</th>
    <th>Shape</th>
    <th>Already seen it</th>
  </tr>
  <tr><td><b>Module</b></td><td>a closure exposing a small public surface, hiding the rest</td><td><a href="/notes/scope-functions">closures chapter</a>, use #2</td></tr>
  <tr><td><b>Observer / Pub-Sub</b></td><td>subscribers register a callback; a publisher calls every one when something happens</td><td><code>addEventListener</code> IS this pattern, built into the platform</td></tr>
  <tr><td><b>Strategy</b></td><td>swap the algorithm at runtime by passing a different function/object with the same interface</td><td>the comparator argument to <code>.sort()</code></td></tr>
  <tr><td><b>Factory</b></td><td>a function that builds and returns objects, hiding the construction details</td><td><code>document.createElement</code></td></tr>
  <tr><td><b>Singleton</b></td><td>exactly one instance, created lazily on first request</td><td>an ES module itself — importing it twice gives the same instance, module caching does this for free</td></tr>
</table>
<div class="try">
  <pre><code>class EventBus {
  #listeners = new Map();
  on(event, fn) {
    if (!this.#listeners.has(event)) this.#listeners.set(event, []);
    this.#listeners.get(event).push(fn);
    return () =&gt; this.off(event, fn);   <span class="c">// returns its own unsubscribe function</span>
  }
  off(event, fn) {
    const fns = this.#listeners.get(event);
    if (fns) this.#listeners.set(event, fns.filter((f) =&gt; f !== fn));
  }
  emit(event, ...args) {
    (this.#listeners.get(event) || []).forEach((fn) =&gt; fn(...args));
  }
}

const bus = new EventBus();
const unsubscribe = bus.on("greet", (name) =&gt; console.log("hello", name));
bus.emit("greet", "Ana");
unsubscribe();
bus.emit("greet", "Ravi");   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  Only <code>"hello Ana"</code> prints — the second
  <code>emit</code> finds no listeners left, because calling the
  function <code>on()</code> returned removed it. This exact shape,
  hand-rolled, is what every pub/sub library and every framework's
  event system is doing underneath, whether it's 20 lines like this one
  or a much larger implementation.
</p>

<h3>Dependency injection</h3>
<p>
  A function or class that <b>receives</b> what it depends on instead
  of reaching out and constructing or importing it directly.
</p>
<pre><code><span class="c">// tightly coupled — this function can ONLY ever hit the real API</span>
async function loadUser(id) {
  return fetch("/api/users/" + id).then((r) =&gt; r.json());
}

<span class="c">// injected — the caller decides what "fetch a user" actually means</span>
async function loadUserWith(fetchImpl, id) {
  return fetchImpl(id);
}
loadUserWith(realApiFetch, 1);       <span class="c">// production</span>
loadUserWith(fakeFetchForTests, 1);  <span class="c">// tests — no real network needed</span></code></pre>
<p class="sub">
  <b>Inversion of control</b> is the broader principle this is one
  instance of: instead of a piece of code deciding and calling its own
  dependencies, something outside it decides and hands them in. A
  framework calling <em>your</em> component function, instead of your
  code calling into the framework, is the same inversion at a larger
  scale.
</p>

<h3>State machines</h3>
<div class="try">
  <pre><code>function createTrafficLight() {
  const transitions = { red: "green", green: "yellow", yellow: "red" };
  let state = "red";
  return {
    next() { state = transitions[state]; return state; },
    current() { return state; },
  };
}
const light = createTrafficLight();
console.log(light.current());   <span class="c">// what happens?</span>
console.log(light.next(), light.next(), light.next());   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>"red"</code>, then <code>"green" "yellow" "red"</code> — the
  entire idea of a state machine in one small table: a fixed set of
  named states, and one function per state that says exactly what the
  next state is allowed to be. The value over a scattering of booleans
  (<code>isLoading</code>, <code>isError</code>, <code>isSuccess</code>,
  all mutable independently) is that an <b>impossible combination</b>
  — loading AND error AND success all true at once — simply can't be
  represented at all, instead of being a bug waiting to happen.
</p>

<h3>Error boundaries and resilience</h3>
<pre><code>function withFallback(fn, fallback) {
  return async (...args) =&gt; {
    try {
      return await fn(...args);
    } catch (error) {
      console.error("recovered from:", error);
      return fallback;
    }
  };
}
const safeLoad = withFallback(loadUserProfile, { name: "Guest" });</code></pre>
<p class="sub">
  React's actual <code>ErrorBoundary</code> component is this same
  idea at the UI layer — catch a failure from a whole subtree of
  components, render a fallback UI instead of taking down the entire
  page. The general architectural principle underneath both: contain a
  failure at the smallest boundary that can meaningfully recover from
  it, instead of letting it propagate and take out something much
  bigger that didn't need to fail too.
</p>

<h3>API design</h3>
<p>
  A request is <b>idempotent</b> if making it twice has the exact same
  effect as making it once. <code>PUT /users/1 { name: "Ana" }</code>
  is idempotent — running it five times still leaves the name
  <code>"Ana"</code>. <code>POST /users</code> to create a new one
  usually isn't — five identical calls create five accounts.
</p>
<div class="sticky mint">
  <span class="ttl">Rule</span> Idempotency is exactly what makes a
  <a href="/notes/advanced-async">retry-with-backoff</a> safe to write
  blindly. Retrying an idempotent request after a timeout is harmless —
  it might have already succeeded, and running it again changes
  nothing. Retrying a non-idempotent one risks a real duplicate,
  usually solved with a client-generated <b>idempotency key</b> the
  server deduplicates by.
</div>
<p>
  <b>Caching</b> closes the loop: the same request, made again, doesn't
  even need to reach the server. An HTTP <code>Cache-Control</code>
  header, an in-memory <code>Map</code> keyed by request, or the
  <a href="/notes/scope-functions">memoize</a> pattern from three
  chapters back are all the identical idea at different layers of the
  stack — don't redo work whose answer hasn't changed.
</p>`,
};
