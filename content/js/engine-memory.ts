import type { Chapter } from "../types";

export const engineMemory: Chapter = {
  id: "engine-memory",
  num: "A1",
  title: "Engine & memory",
  short: "Engine & memory",
  levels: ["advanced"],
  practice: ["ex-weakmap-cache"],
  ready: true,
  subtitle: "What V8 is actually doing while your code just runs.",
  body: `<p>
  Everything so far has been the language as you write it. This
  chapter is what the engine does with it — and it's the layer most
  senior-level interviews actually probe, because it's the layer where
  "it works" and "it works <em>well</em>" stop being the same question.
</p>

<h3>Stack vs heap</h3>
<div class="boxes">
  <div class="bx is-prim">
    <div class="bx__cap">call stack — fixed-size frames, LIFO</div>
    <div class="bx__slot"><b>main()</b><span>x = 5</span></div>
    <div class="bx__slot"><b>makePoint()</b><span>x = 1, y = 2</span></div>
    <div class="bx__arrow">a frame's local primitives live right here</div>
  </div>
  <div class="bx is-ref">
    <div class="bx__cap">heap — dynamic, garbage-collected</div>
    <div class="bx__slot"><b>Point { x: 1, y: 2 }</b><span>0x7a2f…</span></div>
    <div class="bx__arrow">the stack only ever holds a REFERENCE to this</div>
  </div>
</div>
<p>
  This is <a href="/notes/types-values">the exact primitive-vs-reference
  split from the types chapter</a>, one level lower: a primitive that
  never leaves its function lives directly in that function's stack
  frame — cheap to allocate, cheap to reclaim, gone the instant the
  frame pops. An object always lives on the heap, and the stack only
  ever holds a pointer to it — which is the entire mechanical reason
  copying a variable copies the reference and not the data.
</p>
<div class="warn">
  <span class="ttl">⚠ The real engine is smarter than this diagram</span>
  V8 actually runs <b>escape analysis</b> — if it can prove an object
  never leaves the function that creates it, it may stack-allocate that
  object anyway, and a captured primitive can get promoted onto the
  heap as part of a closure's context. The stack/heap split above is
  the correct mental model for reasoning about your code; the engine's
  actual placement decisions are an optimization detail on top of it,
  not a contradiction of it.
</div>
<p>
  Each function call gets its own <b>execution context</b> — the
  formal name for what's been informally called a "scope" in every
  chapter so far. It bundles an <b>environment record</b> (the actual
  variable bindings) with a reference to the outer context, and that
  chain of outer references <em>is</em>
  <a href="/notes/scope-functions">the scope chain</a> from two
  chapters back. A closure, mechanically, is just a function holding
  onto a reference to an execution context that would otherwise have
  been popped off the stack and discarded.
</p>

<h3>Garbage collection</h3>
<p>
  JS never frees memory by counting references down to zero the moment
  they drop — it periodically asks a different question:
  <b>reachability</b>. Starting from a set of <b>roots</b> (global
  variables, everything currently on the call stack), the collector
  walks every reference it can find. Anything it never reaches is
  garbage, full stop — <em>not</em> "has zero references," which
  matters the instant two objects reference only each other.
</p>
<div class="try">
  <pre><code>function makeCycle() {
  const a = {};
  const b = {};
  a.friend = b;
  b.friend = a;      <span class="c">// a and b reference EACH OTHER</span>
  return "created a cycle";
}
console.log(makeCycle());
<span class="c">// once makeCycle() returns, nothing on the stack points to a or b anymore —</span>
<span class="c">// they're unreachable from any root, cycle or not, and get collected</span></code></pre>
</div>
<p class="sub">
  A reference-counting collector (like older versions of Python) would
  actually leak this — <code>a</code> and <code>b</code> each hold one
  reference to the other, so neither ever hits zero on its own.
  Reachability-based collection sidesteps that entire class of bug for
  free: once <code>makeCycle</code> returns, nothing reachable from a
  root points at either object, cycle or not, so both are simply gone.
</p>
<p>
  V8 specifically runs a <b>generational</b> collector, built on one
  observation: most objects die young. New objects go into a small
  "young generation" that gets swept frequently and cheaply
  (<b>Scavenger</b>); anything that survives a few sweeps gets promoted
  to the "old generation," which is collected far less often, using a
  slower <b>mark-and-sweep</b> (mark everything reachable, then sweep
  away everything that wasn't marked) with an occasional
  <b>mark-compact</b> pass to defragment. Optimizing for the common
  case — short-lived objects — instead of treating every object
  identically is most of where the speed comes from.
</p>

<h3>Memory leaks — JS still has them</h3>
<p>
  "Garbage collected" means unreachable memory gets freed
  automatically. It does <em>not</em> mean memory can't leak — it means
  every JS leak is really the same root cause: something is <b>still
  reachable</b> that the program no longer actually needs.
</p>
<table>
  <tr>
    <th>Pattern</th>
    <th>What keeps it reachable</th>
  </tr>
  <tr><td>A forgotten <code>setInterval</code></td><td>the timer itself holds a live reference to its callback and everything that callback closes over, forever, until <code>clearInterval</code></td></tr>
  <tr><td>A detached DOM node</td><td>removed from the page, but still referenced by a JS variable or an event listener you forgot to remove — the node itself, and everything it references, stays alive</td></tr>
  <tr><td>An unbounded cache</td><td>a plain <code>Map</code> used as a cache that only ever grows — every entry is reachable through it forever, since nothing ever calls <code>.delete()</code></td></tr>
  <tr><td>A closure over something huge</td><td>a small, long-lived closure that happens to reference one variable from a scope containing something large — the ENTIRE execution context stays alive to keep that one binding around</td></tr>
</table>
<pre><code><span class="c">// The fix for the cache row above — cap it, or use a WeakMap when the</span>
<span class="c">// key's natural lifetime should decide the entry's lifetime (I2 covered this)</span>
const cache = new Map();
function memoizedButBounded(key, compute) {
  if (cache.has(key)) return cache.get(key);
  if (cache.size &gt;= 500) cache.delete(cache.keys().next().value);   <span class="c">// evict oldest</span>
  const value = compute();
  cache.set(key, value);
  return value;
}</code></pre>
<div class="sticky mint">
  <span class="ttl">Rule</span> Every leak is a lifetime mismatch: some
  reference is living longer than the data it points to should. Fixing
  a leak is almost always "stop something from holding a reference it
  no longer needs" — clear the interval, remove the listener, cap the
  cache, null out the field — never a special "free this memory" call,
  because JS has no such call.
</div>

<h3>Heap snapshots and allocation timelines</h3>
<p>
  DevTools' Memory panel is how a suspected leak actually gets
  confirmed rather than guessed at: take a heap snapshot, perform the
  suspect action several times (open and close a modal, navigate back
  and forth), take another snapshot, and compare. An object count that
  keeps climbing across that comparison — for a thing you'd expect to
  be fully cleaned up — is the leak, and the snapshot's retainer tree
  shows <em>exactly</em> what's still holding a reference to it. The
  allocation timeline view is the same idea over time instead of two
  fixed points — useful for catching steady growth during normal use
  rather than one specific suspected action.
</p>

<h3>Hidden classes and inline caches</h3>
<p>
  V8 doesn't store objects as generic key/value hash maps the way this
  sentence probably makes you picture — it dynamically builds a
  <b>hidden class</b> (an internal, fixed layout) for every distinct
  shape of object it sees, and every object with that same shape shares
  the same hidden class.
</p>
<pre><code>function Point(x, y) { this.x = x; this.y = y; }

const a = new Point(1, 2);   <span class="c">// x then y — hidden class C0</span>
const b = new Point(3, 4);   <span class="c">// x then y — SAME hidden class C0, shares it with a</span>

const c = new Point(5, 6);
c.z = 7;                      <span class="c">// now c has a DIFFERENT shape — its own hidden class C1</span></code></pre>
<p>
  A property access like <code>point.x</code> compiled at a specific
  call site gets an <b>inline cache</b>: after the first call, V8
  remembers "the object at this call site had hidden class C0, and its
  <code>x</code> was at this exact offset" — so the next call with the
  same hidden class skips property lookup entirely and reads straight
  from that offset.
</p>
<table>
  <tr>
    <th>Term</th>
    <th>Means</th>
    <th>Speed</th>
  </tr>
  <tr><td><b>Monomorphic</b></td><td>a call site has only ever seen one hidden class</td><td class="tone-yes">fastest — the inline cache is a direct hit every time</td></tr>
  <tr><td><b>Polymorphic</b></td><td>a call site has seen a handful (2-4) of different hidden classes</td><td class="tone-warn">still fast — checks a short list</td></tr>
  <tr><td><b>Megamorphic</b></td><td>a call site has seen too many shapes to track</td><td class="tone-bad">slow — V8 gives up on the inline cache and falls back to a generic lookup</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ This is genuinely hard to see with a stopwatch</span>
  It's tempting to prove this with <code>performance.now()</code>
  around a quick loop — in practice, allocation cost, garbage
  collection pauses, and JIT warm-up noise routinely swamp the actual
  effect at small scale, and a rushed 3-line "benchmark" is exactly how
  people ship confidently wrong performance conclusions. The takeaway
  isn't "go measure this" — it's the practical rule below, which holds
  regardless of what any one quick timing run happens to show.
</div>
<div class="sticky mint">
  <span class="ttl">Rule</span> Build objects of the same "kind" with
  their properties assigned in the <b>same order, every time</b> —
  ideally all in the constructor, none bolted on conditionally
  afterward. Shape consistency is what keeps a hot call site
  monomorphic; it's a real, well-documented V8 optimization concern,
  not premature optimization folklore.
</div>

<h3>JIT and deoptimization</h3>
<p>
  V8 starts running everything through <b>Ignition</b>, a fast-starting
  interpreter — there's no compile pause before your code runs at all.
  A function called enough times gets handed to <b>TurboFan</b>, the
  optimizing compiler, which compiles it down to fast machine code
  <em>under the assumptions it's observed so far</em> — including the
  hidden classes and argument types it's seen at every call site inside
  it.
</p>
<p>
  Break one of those assumptions — a function optimized for numbers
  suddenly gets called with a string, a monomorphic call site starts
  seeing a new shape — and V8 <b>deoptimizes</b>: throws away the
  compiled machine code and drops back to the slower interpreter for
  that function, at least until it can safely re-optimize with the
  new reality accounted for. A function that gets optimized, called
  differently, deoptimized, called differently again, and
  re-optimized in a loop never settles into its fast path at all.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "Predictable shapes and
  stable argument types aren't just a style preference — they're what
  let TurboFan's assumptions hold, which is what keeps a hot function
  compiled instead of bouncing back to the interpreter every time
  something unexpected shows up at one of its call sites."
</div>`,
};
