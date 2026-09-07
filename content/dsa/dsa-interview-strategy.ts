import type { Chapter } from "../types";

export const dsaInterviewStrategy: Chapter = {
  id: "dsa-interview-strategy",
  num: "A12",
  title: "Interview strategy",
  short: "Interview strategy",
  levels: ["advanced"],
  practice: ["ex-pick-approach-from-constraint", "ex-feasible-approaches-under-constraints"],
  ready: true,
  subtitle:
    "The algorithm is half the score — the other half is everything you say before, during and after writing it.",
  body: `<h3>What is actually being scored</h3>
<p>
  At the advanced level the interviewer is not checking whether you can produce
  a correct program. They are estimating one thing: <b>what is it like to hand
  this person an ambiguous problem and come back in three days?</b> Every
  behaviour in this chapter is a proxy for that. Clarifying questions predict
  whether you will build the wrong thing. Stating a brute force before
  optimizing predicts whether you ship something or stall. Testing your own
  code predicts whether QA finds your bugs or you do. Naming a tradeoff
  unprompted predicts whether you will make a defensible technical decision
  alone.
</p>
<p>
  Two candidates can both produce a working O(n log n) solution and receive
  "strong hire" and "no hire." The difference is almost never the code. It is
  that one of them narrated a decision process the interviewer could follow and
  trust, and the other silently emitted a memorized answer that could not be
  probed, extended, or debugged out loud.
</p>

<figure>
  <svg viewBox="0 0 640 215" class="dg" role="img" aria-label="A 45 minute interview timeline divided into clarify, approach, code, test and tradeoff phases, with the common failure mode of coding too early marked in red">
    <g class="rough">
      <rect class="boxy" x="40" y="60" width="62" height="46" rx="4" />
      <rect class="boxg" x="102" y="60" width="87" height="46" rx="4" />
      <rect class="box" x="189" y="60" width="261" height="46" rx="4" />
      <rect class="boxg" x="450" y="60" width="87" height="46" rx="4" />
      <rect class="box" x="537" y="60" width="63" height="46" rx="4" />
    </g>
    <text class="sm" x="71" y="88" text-anchor="middle">clarify</text>
    <text class="sm" x="145" y="88" text-anchor="middle">approach</text>
    <text class="sm" x="319" y="88" text-anchor="middle">code, narrating</text>
    <text class="sm" x="493" y="88" text-anchor="middle">test</text>
    <text class="sm" x="568" y="82" text-anchor="middle">trade-</text>
    <text class="sm" x="568" y="98" text-anchor="middle">offs</text>
    <text class="sm" x="40" y="128" text-anchor="middle">0</text>
    <text class="sm" x="102" y="128" text-anchor="middle">5</text>
    <text class="sm" x="189" y="128" text-anchor="middle">12</text>
    <text class="sm" x="450" y="128" text-anchor="middle">33</text>
    <text class="sm" x="537" y="128" text-anchor="middle">40</text>
    <text class="sm" x="600" y="128" text-anchor="middle">45 min</text>
    <text class="lbl" x="40" y="40" style="font-size:14px">no code is written before minute 12 — that is deliberate, not slow</text>
    <text class="lbl rd" x="40" y="165" style="font-size:14px">the common failure: coding at minute 3</text>
    <text class="sm rd" x="40" y="187">→ wrong complexity discovered at minute 30, no time to recover, and</text>
    <text class="sm rd" x="40" y="205">→ the interviewer never saw you reason, only saw you type</text>
  </svg>
  <figcaption>The first twelve minutes buy the last thirty. A wrong approach caught at minute 8 costs nothing; the same mistake found at minute 30 ends the interview.</figcaption>
</figure>

<h3>The first five minutes: questions that change the answer</h3>
<p>
  Silence here is the single strongest negative signal available, and it is the
  cheapest to fix. An engineer who starts coding from an under-specified
  problem statement is telling the interviewer exactly how they behave with an
  under-specified ticket. But not all questions are equal — "can I use a
  hashmap?" wastes the goodwill you are trying to build. Ask only questions
  whose answer would <b>change your solution</b>, and say why you are asking.
</p>
<table>
  <tr><th>Ask</th><th>Why it changes the solution</th></tr>
  <tr><td>"How large can n get?"</td><td>The highest-value question in the interview. It fixes your target complexity before you have written anything — see the table below.</td></tr>
  <tr><td>"Is the input sorted, or can I sort it?"</td><td>Sorted unlocks two pointers and binary search for free. If not sorted, an O(n log n) sort may be free anyway when the target is already O(n log n) — but it is <em>not</em> free if the target is O(n).</td></tr>
  <tr><td>"Can there be duplicates?"</td><td>Changes whether you dedupe, whether a Set is safe, whether two-pointer needs a skip loop, and whether the expected output is unique.</td></tr>
  <tr><td>"What's the range of the values? Negative? Zero? Floats?"</td><td>Negatives break sliding-window-on-sums and greedy arguments. Small bounded values unlock counting sort or a bitmask. Floats kill exact equality.</td></tr>
  <tr><td>"What should I return for empty input / no valid answer?"</td><td>An explicit contract, decided up front, instead of an ad-hoc guess at minute 40.</td></tr>
  <tr><td>"Can I mutate the input?"</td><td>In-place sorting or marking may be the whole space optimization; if the input is shared state, it isn't allowed.</td></tr>
  <tr><td>"Is this called once, or repeatedly on the same data?"</td><td>Repeated queries change the answer entirely — preprocess into a prefix array, segment tree, or index map and amortize.</td></tr>
  <tr><td>"Does the whole input fit in memory, or is it a stream?"</td><td>Streaming rules out sorting and random access; pushes toward heaps, reservoir sampling, count-min sketch.</td></tr>
</table>
<div class="say">
  <span class="ttl">Say it like this →</span> "Before I start — a few things
  that would change my approach. How big is n? Can values be negative? And are
  duplicates possible in the input? …n is up to 10⁵ and values can be negative
  — good, that rules out the sliding-window approach I was about to reach for,
  since a negative number means the window sum isn't monotonic."
</div>
<p class="sub">
  That last clause is the part that scores. You are not collecting facts, you
  are demonstrating that each fact <em>eliminates a branch</em> of your
  decision tree. Two or three questions asked this way beat ten asked
  mechanically.
</p>
<div class="warn">
  <span class="ttl">⚠ Don't ask questions you can answer from the examples</span>
  If the provided example contains a negative number, asking "can values be
  negative?" reads as not having read the problem. Skim the examples first,
  extract what they already settle, and ask only about what they leave open —
  then say so: "the example has duplicates so I'll assume they're allowed; what
  I can't tell from it is whether the array is guaranteed non-empty."
</div>

<h3>A framework that works on a problem you have never seen</h3>
<p>
  You will not recognize the problem. That is the point of an advanced
  interview. What you need is not recall but a procedure that visibly makes
  progress even from zero. Run these seven steps out loud, in order.
</p>
<table>
  <tr><th>#</th><th>Step</th><th>What you actually say</th></tr>
  <tr><td>1</td><td>Restate in your own words</td><td>"So: given X, return Y, where the constraint is Z. Is that right?"</td></tr>
  <tr><td>2</td><td>Work the given example by hand</td><td>Say the answer for the example before writing anything. Catches misreads instantly.</td></tr>
  <tr><td>3</td><td>State a brute force, with its complexity</td><td>"The obvious thing is to check every pair — O(n²) time, O(1) space. That's my baseline; let me see if I can beat it."</td></tr>
  <tr><td>4</td><td>Name the bottleneck</td><td>"The expensive part is that for each i, I re-scan everything before i. That inner scan is the thing to remove."</td></tr>
  <tr><td>5</td><td>Read the constraints for the target</td><td>"n goes to 10⁵, so O(n²) is 10¹⁰ — far too slow. They're steering me to O(n log n) or O(n)."</td></tr>
  <tr><td>6</td><td>Ask what structure removes the bottleneck</td><td>"What would make that inner scan O(1) or O(log n)? A hashmap of seen values, a heap, a monotonic stack, or precomputed prefix sums."</td></tr>
  <tr><td>7</td><td>Confirm, then code</td><td>"So: one pass, hashmap from value to index, O(n) time and O(n) space. Shall I code that?"</td></tr>
</table>
<p>
  Step 3 is non-negotiable and candidates skip it constantly, believing a brute
  force looks weak. The opposite is true: it guarantees you have <em>a</em>
  solution on the board within five minutes, it proves you understand the
  problem, and it gives you a concrete complexity to improve on. An interviewer
  will almost always let you skip implementing it. What they will not forgive
  is twenty minutes of silence hunting for the clever answer.
</p>
<figure>
  <svg viewBox="0 0 640 190" class="dg" role="img" aria-label="A three step flow from brute force through naming the repeated work to replacing it with a data structure that answers the same question faster">
    <g class="rough">
      <path class="ln" d="M186,75 L232,75" />
      <path class="ln" d="M406,75 L452,75" />
    </g>
    <g class="rough">
      <rect class="box" x="26" y="45" width="160" height="60" rx="6" />
      <rect class="boxy" x="232" y="45" width="174" height="60" rx="6" />
      <rect class="boxg" x="452" y="45" width="162" height="60" rx="6" />
    </g>
    <text class="sm" x="106" y="70" text-anchor="middle">brute force</text>
    <text class="sm" x="106" y="90" text-anchor="middle">O(n²), stated aloud</text>
    <text class="sm" x="319" y="70" text-anchor="middle">what work repeats?</text>
    <text class="sm" x="319" y="90" text-anchor="middle">"I re-scan the prefix"</text>
    <text class="sm" x="533" y="70" text-anchor="middle">which structure</text>
    <text class="sm" x="533" y="90" text-anchor="middle">answers it in O(1)?</text>
    <text class="sm" x="26" y="140">hashmap · prefix sums · heap · monotonic stack · sorted order + two pointers ·</text>
    <text class="sm" x="26" y="160">binary search on the answer · union-find · trie · memoized state</text>
    <text class="lbl gr" x="26" y="30" style="font-size:14px">optimization is a search over this middle box, not over memorized solutions</text>
  </svg>
  <figcaption>Almost every optimization in interview DSA is the same move: identify work being redone, then buy it back with a data structure.</figcaption>
</figure>

<h3>Constraints → intended complexity: the highest-leverage table here</h3>
<p>
  Interviewers and problem setters choose <code>n</code> deliberately. The
  bound is a hint about the intended solution, and reading it correctly can
  collapse a twenty-minute search into thirty seconds. Calibrate against the
  rough industry rule that <b>~10⁸ simple operations is about one second</b>.
</p>
<table>
  <tr><th>Constraint on n</th><th>Intended complexity</th><th>Pattern family it points at</th></tr>
  <tr><td>n ≤ 10-12</td><td>O(n!) · O(n! · n)</td><td>Full permutation search, brute-force TSP, "try every ordering"</td></tr>
  <tr><td>n ≤ 20-25</td><td>O(2ⁿ) · O(2ⁿ · n)</td><td><b>Bitmask</b> — subset enumeration, bitmask DP, meet-in-the-middle (2^(n/2)) if n ≈ 40</td></tr>
  <tr><td>n ≤ 100</td><td>O(n³) · O(n⁴)</td><td>Floyd-Warshall, interval/matrix-chain DP, triple nested loops are fine</td></tr>
  <tr><td>n ≤ 1,000-5,000</td><td>O(n²)</td><td>2D DP over pairs — edit distance, LCS, palindromic substrings; all-pairs comparison</td></tr>
  <tr><td>n ≤ 10⁵</td><td>O(n log n)</td><td>Sort-then-scan, heap, binary search on the answer, balanced BST / ordered set, divide and conquer, segment tree</td></tr>
  <tr><td>n ≤ 10⁶-10⁷</td><td>O(n) · O(n log log n)</td><td>Single pass, two pointers, sliding window, hashmap, counting sort, prefix sums, sieve, Kadane</td></tr>
  <tr><td>n ≤ 10⁹-10¹⁸</td><td>O(log n) · O(√n) · O(1)</td><td>Math/closed form, binary search over the answer space, matrix exponentiation, digit DP — <em>you cannot even read the input</em></td></tr>
</table>
<p class="sub">
  Read the second half of the constraints too. "Sum of all string lengths ≤
  10⁵" over many strings means linear in the <em>total</em>, which points at a
  Trie or Aho-Corasick rather than per-string work. A value range like "values
  ≤ 100" alongside a huge n points at counting/bucketing. A memory limit
  matters as much as time: n = 10⁵ with an O(n²) DP table is 10¹⁰ cells —
  impossible regardless of the time limit, which tells you the DP must be
  rolled down to one or two rows.
</p>
<div class="sticky mint">
  <span class="ttl">Read the constraints backwards</span>
  Do not design a solution and then check whether it is fast enough. Read
  <code>n</code> first, derive the complexity the setter intends, and use that
  as a <em>filter on which patterns are even eligible</em>. "n ≤ 20" is not
  trivia — it is the interviewer telling you the answer involves subsets. Very
  few candidates do this, and it is visible in seconds when someone does.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "n is at most 20, which is a
  strong hint — 2²⁰ is about a million, so exponential in n is affordable and
  polynomial probably isn't achievable here. That points at enumerating subsets
  with a bitmask, most likely bitmask DP over the set of already-used elements.
  Let me check whether the state really is just 'which subset is used' or
  whether I need an index too."
</div>

<h3>How to talk while you code</h3>
<p>
  The goal is a continuous, low-effort narration that lets the interviewer
  follow your reasoning without interrupting. Not a play-by-play of syntax —
  nobody needs "now I'll write a for loop." Narrate <b>decisions</b>, and
  <b>name your patterns</b>, because naming is what proves the choice was
  deliberate rather than lucky.
</p>
<table>
  <tr><th>Instead of</th><th>Say</th></tr>
  <tr><td>silence</td><td>"I'll use a monotonic decreasing stack here, because I need the next greater element for every index and a stack lets each element be pushed and popped once — amortized O(n)."</td></tr>
  <tr><td>"now a map"</td><td>"Map from value to index rather than a Set, because I need to return indices, not just detect membership."</td></tr>
  <tr><td>"hmm, hold on"</td><td>"I'm deciding between sorting first and using a heap. Sorting is simpler but O(n log n) up front; the heap gets me the top k in O(n log k). Since k is small I'll take the heap."</td></tr>
  <tr><td>"…" while fixing a bug</td><td>"That should be <code>&lt;=</code>, not <code>&lt;</code> — otherwise the last window never gets evaluated. Let me re-check the boundary."</td></tr>
  <tr><td>"I'll handle that later"</td><td>"I'm deliberately deferring the empty-input case; noting it here as a TODO and I'll come back before I call this done."</td></tr>
</table>
<p class="sub">
  Two mechanical habits pay for themselves. First, write the function signature
  and the return type before the body — it forces the contract to be explicit.
  Second, when you defer something, say so and leave a visible marker; an
  acknowledged gap is a plan, an unacknowledged one is a bug.
</p>
<div class="warn">
  <span class="ttl">⚠ Narrating and thinking are different modes, and forcing both at once stalls people</span>
  It is entirely fine to say "give me twenty seconds to think this through
  quietly" and then go silent — that reads as controlled. What reads badly is
  <em>undeclared</em> silence for two minutes. Buy the quiet explicitly, use
  it, then come back with a statement rather than a mumble.
</div>

<h3>Being stuck, handled well</h3>
<p>
  You will get stuck. It is expected and it is not disqualifying — freezing is.
  What is being measured is whether you have a procedure for it. Work this
  ladder out loud, in order, and say which rung you are on.
</p>
<table>
  <tr><th>Rung</th><th>Do this</th><th>Why it works</th></tr>
  <tr><td>1</td><td>Re-read the constraints and the exact wording of the ask</td><td>Most stuckness is a misread — "subsequence" vs "subarray," "any" vs "all," "at most" vs "exactly." The constraint bound also re-states the target complexity you may have drifted from.</td></tr>
  <tr><td>2</td><td>Work a tiny example by hand — n = 1, n = 2, n = 3</td><td>You are looking for the <em>rule</em> your hand is following. Solving n = 3 manually and asking "what did I just do?" recovers the recurrence more often than staring at the general case.</td></tr>
  <tr><td>3</td><td>Ask "what shape is this?"</td><td>Not "have I seen this problem" but: is it a graph? intervals? a tree of choices? a search over a monotonic answer space? Shape recall is far more reliable than problem recall.</td></tr>
  <tr><td>4</td><td>Ask whether it is two known patterns composed</td><td>Advanced problems usually are. Sort + two pointers. Trie + backtracking. Binary search on the answer + a greedy feasibility check. Heap + hashmap. Topological order + DP. Say the two names out loud.</td></tr>
  <tr><td>5</td><td>Relax the problem, solve the easier version</td><td>Drop a constraint (assume sorted, assume no duplicates, assume k = 1, assume the array is positive). Solve that, then re-introduce the constraint and see what breaks. Partial credit is real credit.</td></tr>
  <tr><td>6</td><td>State where you are stuck, precisely, and take the hint</td><td>"I have an O(n²) solution and I know the bottleneck is re-scanning the prefix; what I can't see is a structure that gives me the max of a shrinking window in O(1)." That is a targeted request, and it lets the interviewer give a small hint rather than a large one.</td></tr>
</table>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'm going to slow down for a
  second and work n = 3 by hand, because I think the recurrence will be obvious
  once I see what I'm doing manually. …Right — at each step I'm choosing
  between taking this element and skipping it, and the choice only depends on
  the remaining capacity. That's a knapsack shape, so the state is (index,
  remaining) and I can memoize it."
</div>
<p class="sub">
  Note what that phrasing does: it converts "stuck" into "executing a
  deliberate step." Interviewers are instructed to give hints; taking one
  gracefully costs far less than most candidates fear, and refusing to ask
  while burning ten minutes costs far more.
</p>

<h3>Test before you say "done"</h3>
<p>
  Declaring completion and letting the interviewer find the bug is the most
  avoidable score loss in the entire interview. Finding it yourself, out loud,
  converts the same bug into a positive signal. Trace the given example first —
  line by line, tracking real variable values, not vibes — then run a
  deliberately chosen edge case.
</p>
<table>
  <tr><th>Edge case</th><th>What it catches</th></tr>
  <tr><td>Empty input <code>[]</code> / <code>""</code></td><td><code>arr[0]</code> on an empty array, <code>Math.max()</code> of nothing returning <code>-Infinity</code>, a <code>while</code> loop that assumed one element</td></tr>
  <tr><td>Single element</td><td>Two-pointer and sliding-window loops whose body never executes; <code>left &lt; right</code> vs <code>left &lt;= right</code></td></tr>
  <tr><td>All duplicates <code>[5,5,5,5]</code></td><td>Dedupe logic, Set-vs-Map choices, two-pointer skip loops, "distinct" requirements</td></tr>
  <tr><td>Already sorted / reverse sorted</td><td>Worst-case quicksort partitioning, degenerate BSTs, and off-by-one at the array ends</td></tr>
  <tr><td>Two elements</td><td>The smallest case where a comparison or swap can be backwards</td></tr>
  <tr><td>Negatives and zero</td><td>Greedy and sliding-window sum arguments that silently assume positivity; division and modulo by zero</td></tr>
  <tr><td>All elements identical to the target / none matching</td><td>The "not found" return contract you agreed on in minute two</td></tr>
  <tr><td>Maximum n from the constraints</td><td>Recursion depth (JS blows up around 10⁴-10⁵ frames), integer overflow past 2⁵³, O(n²) memory</td></tr>
</table>
<div class="say">
  <span class="ttl">Say it like this →</span> "Let me trace the given example
  before I call this done. left = 0, right = 4, sum = 9, target is 9 — returns
  [0, 4], matches. Now an edge case: single element. The <code>while (left &lt;
  right)</code> never executes, so I fall through to the not-found return —
  correct. And an empty array: <code>nums.length - 1</code> is -1, the loop
  still doesn't execute, still correct. I'm happy with this."
</div>
<div class="warn">
  <span class="ttl">⚠ Tracing "in your head" is not tracing</span>
  Under pressure, silently re-reading code confirms what you intended to write,
  not what you wrote. Say the actual variable values out loud, or write them in
  a comment block. The whole value of the exercise comes from forcing yourself
  to evaluate rather than recognize — and it is also the only way the
  interviewer can see you doing it.
</div>

<h3>Discussing tradeoffs at a senior level</h3>
<p>
  The clearest seniority marker in the last ten minutes is raising a tradeoff
  <b>before you are asked</b>, and framing it against a use case rather than in
  the abstract. Intermediate candidates report complexity. Advanced candidates
  report complexity, name the alternative they rejected, and say what would
  change their mind.
</p>
<table>
  <tr><th>Axis</th><th>The sentence to have ready</th></tr>
  <tr><td>Time vs space</td><td>"This is O(n) time with an O(n) hashmap. If memory were the binding constraint I'd sort in place and use two pointers — O(1) extra space, O(n log n) time. Which matters more here?"</td></tr>
  <tr><td>Preprocess vs per-query</td><td>"If this is called once, the linear scan is right. If it's called a million times on the same array, I'd build prefix sums up front — O(n) once, then O(1) per query."</td></tr>
  <tr><td>Worst case vs average case</td><td>"Quickselect is O(n) expected but O(n²) adversarially. If this is on a user-facing path where input could be hostile, I'd take the heap's guaranteed O(n log k) instead."</td></tr>
  <tr><td>Simplicity vs constant factor</td><td>"The bitmask version is maybe 5× faster per node but noticeably harder to read. For n ≤ 12 I'd ship the readable one and leave a comment about the optimization."</td></tr>
  <tr><td>Amortized vs bounded latency</td><td>"The dynamic array is amortized O(1) but a single resize is O(n). If this were in a real-time path I'd pre-size it."</td></tr>
  <tr><td>Exact vs approximate</td><td>"For exact distinct counts I need O(n) memory. If an error of a percent or two is acceptable at this scale, HyperLogLog does it in kilobytes."</td></tr>
  <tr><td>Mutating vs pure</td><td>"I'm sorting the input in place, which is faster but destroys the caller's array. If it's shared, I'd copy first and pay the O(n)."</td></tr>
</table>
<p class="sub">
  Every one of those ends in a question or a condition. That is deliberate — it
  turns a monologue into a design conversation and invites the interviewer to
  supply real-world context, which is the exact interaction they are trying to
  score. It is also honest: which side of a tradeoff is correct genuinely
  depends on information you do not have.
</p>
<p>
  Two more things to have ready without being asked. <b>How would this scale
  past one machine?</b> — even a sentence ("if the array doesn't fit in memory,
  I'd external-sort by chunk, or shard by hash of the key and merge") shows the
  thinking extends past the whiteboard. And <b>what would you test?</b> — naming
  three unit tests and one property ("the output should always be a permutation
  of the input") signals engineering maturity that pure DSA never reaches.
</p>

<h3>Signals that separate an advanced performance from an intermediate one</h3>
<ul>
  <li><b>Constraints are read as a hint, not as trivia.</b> "n ≤ 20, so they
    intend an exponential-in-n solution — that means bitmask" is said in the
    first two minutes, not discovered at minute thirty.</li>
  <li><b>A brute force is stated with its complexity before any optimizing
    starts.</b> There is always something on the board, and the improvement is
    measured against a named baseline rather than asserted.</li>
  <li><b>Patterns are named out loud as they are chosen.</b> "Monotonic stack,
    because I need the next greater element and each index is pushed and popped
    once" — not just correct code that happens to be a monotonic stack.</li>
  <li><b>The bottleneck is identified explicitly</b> ("the expensive part is
    re-scanning the prefix") and the optimization is presented as buying that
    specific work back with a specific structure.</li>
  <li><b>Getting stuck produces a described procedure, not silence.</b>
    Re-read constraints → hand-trace a tiny case → identify the shape → check
    for two composed patterns → relax a constraint → ask a precise question.</li>
  <li><b>The candidate tests their own code before declaring done</b> — a real
    trace with real values, plus a deliberately chosen edge case, and finds
    their own off-by-one.</li>
  <li><b>Tradeoffs are raised unprompted and tied to a use case</b>, with a
    stated condition that would flip the decision, rather than a memorized
    complexity table recited on request.</li>
  <li><b>Corrections are absorbed without defensiveness.</b> A hint is taken,
    integrated, and credited — "good catch, that breaks when the values are
    negative; let me fix the invariant" — because the interviewer is
    simulating what code review with you feels like.</li>
  <li><b>Uncertainty is stated honestly and bounded.</b> "I'm fairly sure this
    is O(n log n) amortized but I'd want to double-check the resize cost" beats
    a confident wrong claim every time, and it is the difference between an
    engineer you can trust and one you have to verify.</li>
</ul>`,
};
