import type { Chapter } from "../types";

export const errorHandlingDebugging: Chapter = {
  id: "error-handling-debugging",
  num: "I7",
  title: "Error handling & debugging",
  short: "Error handling",
  levels: ["intermediate"],
  practice: ["ex-error-chain", "ex-immutable-update"],
  ready: true,
  subtitle: "The Intermediate track's close-out — past what the beginner errors chapter covered.",
  body: `<p>
  <a href="/notes/errors-tools">The first pass at errors</a> covered
  <code>try/catch/finally</code>, custom <code>Error</code> subclasses,
  and reading a stack trace. This is what's past that: chaining errors
  together, what happens to a rejection nobody catches, why
  immutability keeps coming up in framework code, and debugging tools
  past <code>console.log</code>.
</p>

<h3>Error chaining with cause</h3>
<p>
  Catching a low-level error and throwing a more meaningful one is
  normal — but doing that used to destroy the original error entirely.
  The <code>cause</code> option keeps it attached.
</p>
<div class="try">
  <pre><code>function loadUser() {
  try {
    JSON.parse("not valid json");
  } catch (dbError) {
    throw new Error("failed to load user", { cause: dbError });
  }
}

try {
  loadUser();
} catch (e) {
  console.log(e.message);
  console.log(e.cause.message);   <span class="c">// what happens?</span>
}</code></pre>
</div>
<p class="sub">
  <code>"failed to load user"</code>, then the original
  <code>SyntaxError</code>'s message. Without <code>cause</code>, that
  original error is just gone — whoever's debugging this in production
  sees "failed to load user" and has to guess why. With it,
  <code>e.cause</code> carries the full original error (and its own
  stack trace) all the way up, however many layers re-throw in between.
</p>

<h3>Unhandled promise rejections</h3>
<p>
  A rejected promise with no <code>.catch()</code> anywhere in its
  chain doesn't fail silently — it surfaces as a top-level
  <code>unhandledrejection</code> event (the same mechanism
  <a href="/notes/basic-async">this site's own code runner</a> listens
  to, to show you an error even from code with no explicit
  <code>catch</code> at all).
</p>
<pre><code>window.addEventListener("unhandledrejection", (event) =&gt; {
  console.error("Unhandled:", event.reason);
  event.preventDefault();   <span class="c">// stops it from also logging as a browser console error</span>
});</code></pre>
<div class="warn">
  <span class="ttl">⚠ Forgetting to return inside a .then breaks the chain's error handling</span>
  <code>promise.then(() =&gt; { anotherAsyncCall(); })</code> — without a
  <code>return</code> — lets <code>anotherAsyncCall()</code>'s promise
  run <b>completely detached</b> from the outer chain. If it rejects,
  no <code>.catch()</code> further down that outer chain will ever see
  it; it becomes its own separate unhandled rejection.
</div>

<h3>Immutability — why frameworks care so much</h3>
<p>
  React, Redux, and similar tools decide "did this change?" with a
  single <code>===</code> check, not a deep comparison — because a
  deep comparison of a large tree, on every single render, is far too
  slow to do constantly.
</p>
<div class="try">
  <pre><code>const state1 = { count: 0 };

function mutateInPlace(state) {
  state.count++;
  return state;
}
function updateImmutably(state) {
  return { ...state, count: state.count + 1 };
}

const afterMutate = mutateInPlace(state1);
console.log(state1 === afterMutate);   <span class="c">// what happens?</span>

const state2 = { count: 0 };
const afterUpdate = updateImmutably(state2);
console.log(state2 === afterUpdate);   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>true</code>, then <code>false</code>. Mutating in place changes
  the <em>same object</em> — a <code>===</code> check comparing the old
  reference to the new one sees no difference at all and a framework
  built on that check will skip re-rendering, even though the data
  genuinely changed. Building a fresh object every update
  guarantees a new reference exactly when something actually changed —
  which is the entire reason "don't mutate state directly" is a rule in
  React, not just a style preference.
</p>
<pre><code>const frozen = Object.freeze({ a: 1 });
frozen.a = 2;             <span class="c">// non-strict script: fails silently, "a" stays 1</span>
                            <span class="c">// strict mode / modules (the normal case today): throws a TypeError</span>
console.log(frozen.a);    <span class="c">// 1 either way — the object never actually changed</span></code></pre>
<div class="sticky mint">
  <span class="ttl">Rule</span> <code>Object.freeze</code> is shallow —
  it locks the object's own top-level properties, but a nested object
  inside a frozen one is still fully mutable. It's a debugging aid for
  catching accidental top-level mutation, not a deep-immutability
  guarantee.
</div>

<h3>Debugging, past console.log</h3>
<table>
  <tr>
    <th>Tool</th>
    <th>For</th>
  </tr>
  <tr><td>A line-number breakpoint (Sources panel)</td><td>pause every time execution reaches that exact line</td></tr>
  <tr><td>A conditional breakpoint</td><td>right-click the line number — pause only when an expression you type is true, e.g. <code>user.id === 42</code>. Essential once a bug only shows up for one specific input out of thousands.</td></tr>
  <tr><td>A watch expression</td><td>pin any expression to re-evaluate and display at every pause, without retyping it in the console each time</td></tr>
  <tr><td><code>debugger;</code></td><td>a breakpoint written directly in the source — pauses there whenever DevTools is open, no manual click needed</td></tr>
  <tr><td>The Network tab</td><td>every request's status, timing, headers, and actual response body — the first stop when data "never showed up"</td></tr>
</table>
<p class="sub">
  Once paused at any breakpoint, the call stack panel shows the exact
  chain of calls that got you there — the same information a
  <code>.stack</code> string gives you after the fact, except you can
  now inspect every live variable at every level of it, not just read a
  frozen snapshot of what the values were.
</p>`,
};
