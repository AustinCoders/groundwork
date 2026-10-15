import type { Chapter } from "../types";

export const dsaInterviewStrategy: Chapter = {
  id: "dsa-interview-strategy",
  num: "A14",
  title: "Interview strategy",
  short: "Interview strategy",
  levels: ["advanced"],
  prerequisites: ["dsa-complexity-analysis"],
  practice: [
    "ex-pick-approach-from-constraint",
    "ex-feasible-approaches-under-constraints",
    "ex-largest-affordable-n",
    "ex-greedy-counterexample",
    "ex-majority-element-stream",
    "ex-sliding-window-maximum-deque",
    "ex-coin-change",
  ],
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
  <figcaption>The first twelve minutes buy the last thirty-three. A wrong approach caught at minute 8 costs nothing; the same mistake found at minute 30 ends the interview.</figcaption>
</figure>

<h3>The 45 minutes as checkpoints, not hopes</h3>
<p>
  The timeline above says where each phase should sit. A timeline you only
  glance at does nothing for you; what helps is knowing, at each checkpoint, what
  must already be true and what you do if it is not. These are guides to
  calibrate against, not rules: a Hard problem pushes the approach phase longer
  and a simple one shortens it.
</p>
<table>
  <tr><th>By minute</th><th>What should be true</th><th>If you are behind</th></tr>
  <tr><td>5</td><td>The problem is restated, the example is answered by hand, and two or three questions that changed your plan have been asked.</td><td>Stop asking. State your assumptions aloud ("I'll assume non-empty input and say so in the code") and move on.</td></tr>
  <tr><td>12</td><td>A brute force is on the board with its complexity, the bottleneck is named, the constraints have told you the target, and the interviewer has agreed to the plan.</td><td>No better idea by minute 10 is normal. Say so, and offer to code the brute force while you keep thinking: it is a baseline, partial credit, and often the skeleton of the optimization.</td></tr>
  <tr><td>25</td><td>The main loop or recursion exists. Helpers have names even if their bodies are stubs.</td><td>Write the core loop first and stub the rest with a one-line contract ("<code>isValid(state)</code>: true when no rule is broken"). Working structure beats polished fragments.</td></tr>
  <tr><td>33</td><td>The code is complete enough to run in your head, and you start tracing the example with real values.</td><td>Trace what exists, say what remains, and finish it as you go. An unfinished function you traced is worth more than a finished one you did not.</td></tr>
  <tr><td>40</td><td>The example and one edge case are traced, any bug is fixed, and you are naming trade-offs.</td><td>Give each trade-off two sentences. Offer the next improvement instead of starting to build it.</td></tr>
  <tr><td>45</td><td>You have asked one question of your own about the problem or the team.</td><td>If time is gone, ask it anyway: it is the part you control.</td></tr>
</table>
<p class="sub">
  The checkpoint that does the most work is minute 12, because everything
  after it is expensive to undo. The one at minute 25 catches the commonest
  failure in the middle of the interview: a candidate who has been coding
  carefully for thirteen minutes and has a lovely helper function and no
  program. Look at the clock when you finish the approach phase, not only at the
  end.
</p>

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

<h4>Dry run: the seven steps applied to one concrete problem</h4>
<p class="sub">"Given a list of daily prices, find the maximum profit from buying once and selling once later. n ≤ 10⁵."</p>
<table>
  <tr><th>Step</th><th>Applied here</th><th>Conclusion</th></tr>
  <tr><td>1. Restate</td><td>"Find the largest prices[j] - prices[i] with j &gt; i."</td><td>matches the problem</td></tr>
  <tr><td>2. Hand-run the example</td><td>[7, 1, 5, 3, 6, 4]: buy at 1, sell at 6</td><td>expected answer: 5</td></tr>
  <tr><td>3. Brute force</td><td>check every pair (i, j) with j &gt; i</td><td>O(n²), stated as the baseline</td></tr>
  <tr><td>4. Name the bottleneck</td><td>for each i, re-scanning every later j for its price</td><td>the re-scan is the wasted work</td></tr>
  <tr><td>5. Read the constraints</td><td>n ≤ 10⁵ → O(n²) is 10¹⁰, too slow</td><td>need O(n log n) or O(n)</td></tr>
  <tr><td>6. Structure that removes it</td><td>track the minimum price seen so far in one pass</td><td>no data structure needed — one running value</td></tr>
  <tr><td>7. Confirm, then code</td><td>"one pass, O(n) time, O(1) space"</td><td>ready to code</td></tr>
</table>
<p class="sub">
  The problem changes every time; the seven-step shape doesn't. That's the
  actual claim this framework makes — not that you'll recognize this specific
  problem, but that running the same seven questions on an unfamiliar one
  gets you from "no idea" to "one pass, O(n)" without needing to have seen it
  before.
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
  10⁵" over many strings means linear in the <em>total</em>, which fits a
  Trie or Aho-Corasick built over all the strings at once. A value range like "values
  ≤ 100" alongside a huge n points at counting/bucketing. A memory limit
  matters as much as time: n = 5,000 with an O(n²) DP table is 25 million
  cells, easily 100-200 MB in JavaScript, which tells you the DP is meant to be
  rolled down to one or two rows. (At n = 10⁵ the table would be 10¹⁰ cells and
  the time 10¹⁰ steps, so no rolling saves it — the quadratic idea itself is
  out.)
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
  strong hint — 2²⁰ is about a million, so exponential in n is affordable, and a
  setter wouldn't cap n this low if a polynomial solution were intended. That points at enumerating subsets
  with a bitmask, most likely bitmask DP over the set of already-used elements.
  Let me check whether the state really is just 'which subset is used' or
  whether I need an index too."
</div>

<h3>Keywords to a first guess, and the check before you commit</h3>
<p>
  The phrasing of a problem leaks its pattern. The table below is a list of
  <em>first guesses</em>, not answers: each phrase makes a pattern worth
  considering first, and the right-hand column is the one question that tells
  you whether the guess survives. Saying the check out loud is what separates
  a pattern match from a hunch.
</p>
<table>
  <tr><th>The problem says</th><th>First guess</th><th>Check before you commit</th></tr>
  <tr><td>"longest / shortest subarray or substring with at most k of something"</td><td>Sliding window</td><td>Does adding an element only ever push the window one way? Negative numbers break window sums.</td></tr>
  <tr><td>"subarray sum equals k"</td><td>Prefix sums with a hash map</td><td>Are values possibly negative? If not, a window may also work.</td></tr>
  <tr><td>"sorted array", "find the pair / position"</td><td>Binary search or two pointers</td><td>Is the order really given, and is the condition monotonic over it?</td></tr>
  <tr><td>"minimize the maximum" or "maximize the minimum"</td><td>Binary search on the answer</td><td>Can you write a yes/no check "is value x achievable?" that flips only once as x grows?</td></tr>
  <tr><td>"k-th largest", "top k", "median of a stream"</td><td>Heap (two heaps for the median)</td><td>Is k small against n? If everything is needed in order, sorting may be simpler.</td></tr>
  <tr><td>"next greater / smaller element", "span", "histogram"</td><td>Monotonic stack</td><td>Does each element need only its nearest qualifying neighbour on one side?</td></tr>
  <tr><td>"fewest steps", "shortest path" with equal-cost moves</td><td>Breadth-first search</td><td>Are all moves the same cost? With weights, you need Dijkstra or worse.</td></tr>
  <tr><td>"connected", "groups", "merge accounts"</td><td>Union-find or a graph traversal</td><td>Do you need to answer many dynamic queries (union-find) or one pass (traversal)?</td></tr>
  <tr><td>"prerequisites", "order of tasks", "build order"</td><td>Topological sort</td><td>Is a cycle possible, and what should the answer be then?</td></tr>
  <tr><td>"number of ways", "minimum cost to reach"</td><td>Dynamic programming</td><td>Can you name a state that holds everything the future depends on, with small bounds?</td></tr>
  <tr><td>"all combinations / permutations / partitions"</td><td>Backtracking</td><td>Is n small enough that the output size is affordable? Where can you prune?</td></tr>
  <tr><td>"words with a common prefix", "autocomplete"</td><td>Trie</td><td>Are there many queries against a fixed dictionary, so building it pays off?</td></tr>
  <tr><td>"overlapping intervals", "meeting rooms"</td><td>Sort by start, then sweep</td><td>Do you need the sorted order, or only the maximum overlap (a sweep over events)?</td></tr>
  <tr><td>"design a class with O(1) operations"</td><td>A hash map composed with an ordered structure</td><td>Which two requirements pull in opposite directions?</td></tr>
</table>
<p class="sub">
  If two rows fit, that is information, not confusion: say both guesses and use
  the check to choose. "This looks like a window or a prefix-sum problem; the
  values can be negative, so it is prefix sums" is a complete and strong
  sentence.
</p>

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

<h3>Pivoting off a wrong approach without losing the interview</h3>
<p>
  Sooner or later the approach you announced stops working. Candidates treat
  this as a catastrophe and either defend a failing idea or fall silent. It is
  neither: finding that an approach is wrong, early and out loud, is a
  <em>strong</em> signal, because it shows you test your own ideas. What costs
  points is finding out late, or finding out and hiding it.
</p>
<p>
  There are three ways an approach fails, and each has a different tell.
</p>
<table>
  <tr><th>How it fails</th><th>The tell</th><th>What you do next</th></tr>
  <tr><td>It is <b>incorrect</b></td><td>You can build a small input where it gives the wrong answer</td><td>Keep the counterexample on the board; it states exactly what the right idea must handle.</td></tr>
  <tr><td>It is <b>too slow</b></td><td>The constraints say n = 10<sup>5</sup> and your inner loop is O(n)</td><td>Name the repeated work and look for the structure that removes it.</td></tr>
  <tr><td>It <b>does not fit</b> a constraint you assumed</td><td>You relied on sorted input, positive values, or distinct elements, and the problem does not promise them</td><td>Ask whether the assumption can be had cheaply (sort first?), or drop the approach.</td></tr>
</table>
<p>
  The incorrect case deserves a worked example, because greedy is where
  candidates most often commit to something unproven. "Make change with the
  fewest coins: take the largest coin that fits, repeatedly." For some coin
  systems this is right. For others it is quietly wrong, and one small input
  shows it.
</p>
<pre><code>function greedyCoins(coins, amount) {
  const sorted = [...coins].sort((a, b) =&gt; b - a);
  let count = 0;
  for (const coin of sorted) {
    count += Math.floor(amount / coin);
    amount %= coin;
  }
  return amount === 0 ? count : -1;
}

function minCoins(coins, amount) {
  const best = new Array(amount + 1).fill(Infinity);
  best[0] = 0;
  for (let a = 1; a &lt;= amount; a++) {
    for (const coin of coins) {
      if (coin &lt;= a &amp;&amp; best[a - coin] + 1 &lt; best[a]) best[a] = best[a - coin] + 1;
    }
  }
  return best[amount] === Infinity ? -1 : best[amount];
}</code></pre>
<p class="sub">
  With coins <code>[1, 3, 4]</code> and amount 6, <code>greedyCoins</code>
  returns 3 (it takes 4, then 1, then 1) while <code>minCoins</code> returns 2
  (3 and 3). Amount 6 is the smallest amount where they disagree for those
  coins. With coins <code>[1, 5, 10, 25]</code> they agreed on every amount
  from 1 to 500, which is why the greedy habit survives: it works on the
  coins you grew up with.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "Let me test that before I code
  it. Take coins 1, 3 and 4 and amount 6. My greedy picks 4 then 1 and 1, three
  coins, but 3 and 3 is two. So the largest-first choice is not safe here. The
  failure is that taking the big coin can block a better combination, which
  means I need to consider both choices at each amount: that is a DP over
  amounts, one entry per amount, O(amount × coins)."
</div>
<p>
  Notice the structure of that speech: the claim, the smallest counterexample,
  the reason it fails, and what the reason tells you to build next. Three
  habits make a pivot cheap. <b>Decide on a deadline:</b> if you cannot make an
  idea work by a time you set in advance (say, five minutes), it is a wrong
  approach until proven otherwise. <b>Keep what survives:</b> the parsing, the
  helper functions and the examples usually carry over, and saying "the input
  handling stays, the core changes" shows control. <b>Say what you learned:</b>
  the counterexample or the missed constraint is the first line of the next
  approach, not an embarrassment to skip.
</p>

<h3>Proving it correct in one sentence</h3>
<p>
  "Does it work?" is asked more often than "is it fast?", and "I tested it" is
  not an answer to it. A one-sentence correctness argument is short enough to
  say aloud and strong enough to convince. It names a <b>fact that stays true
  throughout the algorithm</b> (an invariant) or a <b>reason a discarded
  option cannot matter</b>. The table gives the shape for each family; fill
  the blanks with the specifics of your problem.
</p>
<table>
  <tr><th>Technique</th><th>The one-sentence shape</th></tr>
  <tr><td>Two pointers on sorted data</td><td>"If a valid pair exists, both of its indices are always inside <code>[lo, hi]</code>, because each move discards an index that cannot be in any valid pair."</td></tr>
  <tr><td>Binary search</td><td>"The answer, if there is one, is always inside <code>[lo, hi]</code>, and each step shrinks that range while keeping the answer in it."</td></tr>
  <tr><td>Sliding window</td><td>"The window is the longest valid one ending at <code>right</code>, because shrinking from the left only stops once the constraint holds again."</td></tr>
  <tr><td>Greedy</td><td>"Any optimal solution can be changed to start with my choice without getting worse, so committing to it loses nothing" (an exchange argument).</td></tr>
  <tr><td>Dynamic programming</td><td>"The state holds everything the future depends on, and the recurrence considers every way to reach it."</td></tr>
  <tr><td>Breadth-first search</td><td>"The queue always holds nodes in non-decreasing distance, so the first time a node is reached is by a shortest path."</td></tr>
  <tr><td>Backtracking with pruning</td><td>"Every complete answer is either visited or sits under a branch I cut for a stated reason that no answer can satisfy."</td></tr>
  <tr><td>Monotonic stack or deque</td><td>"An element is removed only when a later element makes it unable to ever be the answer."</td></tr>
</table>
<p>
  The first row, worked once on the sorted two-sum from the follow-ups below.
  The loop moves <code>lo</code> up when <code>nums[lo] + nums[hi] &lt;
  target</code>. Why is that safe? <code>nums[hi]</code> is the largest value
  still allowed, so <code>nums[lo]</code> with any partner in range is at most
  <code>nums[lo] + nums[hi]</code>, which is already too small: index
  <code>lo</code> is in no valid pair, and discarding it cannot lose an answer.
  The other branch is the mirror image. That is the entire proof, and it
  also tells you the loop ends: each step discards one index.
</p>
<div class="warn">
  <span class="ttl">⚠ "It passed my examples" is not a proof</span>
  Examples show the code does what you think on the inputs you thought of. An
  invariant explains the inputs you did not think of. If you cannot state the
  invariant, you do not yet know why the algorithm works, and that is the same
  thing an interviewer's follow-up is built to find out.
</div>

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

<h3>Follow-ups: it is a stream, it is sorted, it does not fit on one machine</h3>
<p>
  The first solution is rarely the end. Interviewers keep the same problem and
  change one assumption, and each change has a standard move. Hearing the
  change as "which resource just got taken away?" is what turns the follow-up
  from a surprise into a lookup.
</p>
<table>
  <tr><th>The follow-up</th><th>What was taken away</th><th>The move</th></tr>
  <tr><td>"The data arrives as a stream."</td><td>Random access, a second pass, and the right to store everything</td><td>Keep a small summary that one pass can update: a counter, a heap of size k, a sample.</td></tr>
  <tr><td>"The input is already sorted."</td><td>Nothing: you are being <em>given</em> something</td><td>Drop the hash map or the sort. Two pointers or binary search now do it in O(1) extra space.</td></tr>
  <tr><td>"There are many queries on the same data."</td><td>The right to pay O(n) per question</td><td>Preprocess once: prefix sums, a sorted copy, an index.</td></tr>
  <tr><td>"It does not fit in memory."</td><td>Holding the whole input</td><td>Process in chunks and merge partial results (external sort, counting per chunk).</td></tr>
  <tr><td>"It is spread over many machines."</td><td>One place to compute</td><td>Compute locally, send a small summary, combine. The question is whether the answer can be combined from the pieces' answers.</td></tr>
</table>
<h4>Streaming: one pass, constant memory</h4>
<p>
  A typical case: find the element that occurs more than half the time in a
  stream, without storing the stream. Keep a candidate and a counter. A matching
  element adds a vote; a different one cancels a vote; when the votes hit zero
  the next element becomes the candidate. If a strict majority exists, it
  cannot be cancelled out, because every cancellation removes one copy of it
  together with one copy of something else.
</p>
<pre><code>class MajorityStream {
  constructor() {
    this.candidate = undefined;
    this.count = 0;
  }

  add(x) {
    if (this.count === 0) {
      this.candidate = x; <span class="c">// nothing is standing: x takes the floor</span>
      this.count = 1;
    } else if (x === this.candidate) {
      this.count++;
    } else {
      this.count--; <span class="c">// x cancels one vote for the candidate</span>
    }
  }
}</code></pre>
<p class="sub">
  The guarantee is conditional, and saying so is the point. If a strict
  majority exists, <code>candidate</code> is that value: I tested 3,000 random
  streams that each contained one. If no majority exists, the candidate is just
  whatever survived: after adding 1, 2, 3 it is 3 with a count of 1, and a
  second pass is the only way to confirm. A stream gives you no second pass, so
  the honest statement is "this tells you the majority <em>if there is one</em>".
</p>
<h4>Sorted input: the hash map was only buying you order</h4>
<p>
  For two-sum, the hash-map solution is O(n) time and O(n) space. Given sorted
  input, the same question needs no extra memory.
</p>
<pre><code>function twoSumSorted(nums, target) {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo &lt; hi) {
    const sum = nums[lo] + nums[hi];
    if (sum === target) return [lo, hi];
    if (sum &lt; target) lo++; <span class="c">// nums[lo] is too small even with the largest partner left</span>
    else hi--; <span class="c">// nums[hi] is too large even with the smallest partner left</span>
  }
  return [];
}</code></pre>
<p class="sub">
  Time O(n), space O(1). It returns the pair's positions, or an empty array
  when there is none; I checked it against all pairs on 3,000 random sorted
  arrays, including empty ones. The follow-up lesson is general: a sorted
  input is a free resource, and a solution that ignores it is probably using
  more memory than it needs.
</p>
<h4>Distributed: can the answer be combined from the pieces?</h4>
<p>
  For "the k largest of data spread over many machines", ask whether the global
  answer can be assembled from each machine's local answer. It can: every
  element of the global top k is also in the top k of the machine that holds it,
  so each machine sends only its own best k and one coordinator takes the best
  k of those.
</p>
<pre><code>function mergeTopK(shards, k) {
  const candidates = shards.flatMap((shard) =&gt; [...shard].sort((a, b) =&gt; b - a).slice(0, k)); <span class="c">// each machine sends only its own best k</span>
  return candidates.sort((a, b) =&gt; b - a).slice(0, k);
}</code></pre>
<p class="sub">
  The coordinator handles at most k times the number of machines items, however
  large the data is. I compared it with sorting everything on 2,000 random
  splits. Not every question combines this way: the median of the whole is not
  derived from the medians of the parts, so a distributed median needs a
  different design (counting values in ranges, then narrowing). Saying which
  kind of question you have is the senior answer.
</p>

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

<h3>When the problem is NP-hard: recognise it, then say the right thing</h3>
<p>
  Some problems have no known algorithm that stays fast as n grows, and an
  interviewer will occasionally give you one on purpose. Failing to notice is
  the costly mistake: you spend thirty minutes hunting a polynomial solution
  that, as far as anyone knows, does not exist. Noticing is cheap, because the
  disguises are few.
</p>
<table>
  <tr><th>It sounds like</th><th>It is</th><th>When n is small</th><th>When n is large</th></tr>
  <tr><td>"Visit every city once, shortest tour"</td><td>Travelling salesman</td><td>Bitmask DP over visited sets, O(n<sup>2</sup> · 2<sup>n</sup>)</td><td>Heuristics or an approximation (for distances that obey the triangle inequality, a tour at most twice optimal from a spanning tree)</td></tr>
  <tr><td>"A subset that adds up to exactly T"</td><td>Subset sum</td><td>Meet in the middle, O(2<sup>n/2</sup> · n)</td><td>If the values are small, a DP over sums: pseudo-polynomial in T, not in n alone</td></tr>
  <tr><td>"Split into k groups of equal total"</td><td>Partition and bin packing</td><td>Bucket backtracking with symmetry breaking, or bitmask DP</td><td>Greedy heuristics such as largest-first</td></tr>
  <tr><td>"Fewest sets that cover everything"</td><td>Set cover</td><td>Backtracking with a bound, or bitmask DP</td><td>Repeatedly take the set that covers the most uncovered items (a known approximation)</td></tr>
  <tr><td>"Longest simple path in a general graph"</td><td>Longest path</td><td>Backtracking or bitmask DP</td><td>No efficient exact method is known</td></tr>
</table>
<p>
  The clue that gives it away is almost always in the constraints: a bound like
  n &lt;= 20, or n &lt;= 40 with a sum question, is the setter telling you an
  exponential method is intended. The numbers decide how exponential. Counting
  steps against a budget of 10<sup>8</sup> operations, the largest n that fits
  is:
</p>
<table>
  <tr><th>Cost</th><th>Largest n within 10<sup>8</sup></th><th>Cost at that n</th></tr>
  <tr><td>n!</td><td>11</td><td>39,916,800</td></tr>
  <tr><td>3<sup>n</sup></td><td>16</td><td>43,046,721</td></tr>
  <tr><td>n<sup>2</sup> · 2<sup>n</sup></td><td>18</td><td>84,934,656</td></tr>
  <tr><td>n · 2<sup>n</sup></td><td>22</td><td>92,274,688</td></tr>
  <tr><td>2<sup>n</sup></td><td>26</td><td>67,108,864</td></tr>
</table>
<p class="sub">
  Computed with a loop over n, so the cutoffs are exact for that budget. The
  table also explains the odd bounds: meet in the middle turns 2<sup>40</sup>
  into about 2 × 2<sup>20</sup> sums, which is why subset-sum questions go up to
  n = 40 while bitmask DP questions stop near 20.
</p>
<p>
  Many problems <em>look</em> like the hard ones and are not, and mixing them up
  is the opposite error. The nearby pairs worth knowing: the shortest path is
  easy and the longest simple path in a general graph is hard (in a directed
  acyclic graph the longest path is easy again, by dynamic programming over a
  topological order); a tour using every <em>edge</em> once (Eulerian) is easy
  and a tour visiting every <em>vertex</em> once (Hamiltonian) is hard; deciding
  whether a graph can be coloured with two colours is easy and with three is
  hard.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "This is subset sum in disguise,
  which is NP-hard in general, so I'm not going to look for a polynomial
  algorithm. The constraint is n up to 40, so an exponential method is the
  intended one, and 2<sup>40</sup> is too many but 2<sup>20</sup> is fine: I'll
  split the items in two halves, list each half's sums, and match them. If the
  values were small instead, I'd use a DP over the sum."
</div>
<div class="warn">
  <span class="ttl">⚠ What not to say</span>
  <b>"It's NP-hard, so it can't be done."</b> It can, within the size the
  constraints give. <b>"I'll find a polynomial algorithm."</b> Nobody knows how
  for these problems, and promising one reads as not knowing the landscape.
  <b>Claiming a problem is NP-hard when you are not sure.</b> Say "this
  reminds me of" instead, and name the problem; the check is whether you can
  see a clean reduction, and the near-miss pairs above show how often it fails.
</div>

<h3>A full mock: one Hard problem, start to finish</h3>
<p>
  Everything above is easier to believe once you have watched it run on a real
  problem. Below is an interview on <b>Sliding Window Maximum</b>, written as a
  transcript. The notes in italics say which behaviour is being scored. Every
  piece of code shown was run: the brute force and the final function were
  compared on 3,000 random arrays, the trace table is the real output, and the
  wrong draft really returns what is claimed.
</p>
<p>
  <b>Interviewer:</b> Given an integer array <code>nums</code> and a window
  size <code>k</code>, the window slides one position at a time from the left
  end to the right end. Return the maximum of each window.
</p>
<p>
  <b>You:</b> Let me restate it: for every run of <code>k</code> consecutive
  elements, output the largest, so there are <code>n - k + 1</code> answers. A
  few questions that change my approach. How large can <code>n</code> be? Can
  values be negative? Is <code>k</code> always between 1 and
  <code>n</code>?
</p>
<p>
  <b>Interviewer:</b> n up to 10<sup>5</sup>, values can be negative,
  <code>1 &lt;= k &lt;= n</code>.
</p>
<p class="sub"><i>Scored: three questions, each tied to a decision (target complexity, sign of values, an empty-window case that cannot occur).</i></p>
<p>
  <b>You:</b> Let me do the example by hand. For <code>[1, 3, -1, -3, 5, 3, 6,
  7]</code> with <code>k = 3</code>, the windows are <code>[1,3,-1]</code>,
  <code>[3,-1,-3]</code>, <code>[-1,-3,5]</code>, <code>[-3,5,3]</code>,
  <code>[5,3,6]</code>, <code>[3,6,7]</code>, so the answer is
  <code>[3, 3, 5, 5, 6, 7]</code>. Brute force: for each window, scan its
  <code>k</code> elements.
</p>
<pre><code>function maxSlidingWindowBrute(nums, k) {
  const result = [];
  for (let i = 0; i + k &lt;= nums.length; i++) {
    let max = nums[i];
    for (let j = i + 1; j &lt; i + k; j++) if (nums[j] &gt; max) max = nums[j];
    result.push(max);
  }
  return result;
}</code></pre>
<p>
  <b>You:</b> That is O(n · k). With n = 10<sup>5</sup> and k = 50,000 that is
  about 50,000 windows times 50,000 comparisons, roughly 2.5 billion, far past
  the 10<sup>8</sup> a second I can count on. The bottleneck is that
  consecutive windows share <code>k - 1</code> elements and I rescan them every
  time.
</p>
<p class="sub"><i>Scored: brute force with its complexity, the number checked against the constraint, the bottleneck named in one sentence.</i></p>
<p>
  <b>You:</b> First idea: remember the current maximum and only rescan when the
  element leaving the window is that maximum. Most windows are then O(1).
  Hold on, a decreasing array breaks it. In <code>[8, 7, 6, 5, ...]</code> the
  maximum is always the element that just left, so I rescan on every window. I
  counted it: on 20 decreasing numbers with <code>k = 5</code> it rescans 15
  times, on every window after the first, 75 comparisons; on 10,000 numbers with k = 5,000 it
  does 25 million comparisons. That is the brute force again in its worst case,
  so I'm dropping it.
</p>
<p class="sub"><i>Scored: a pivot. The idea was tested on an adversarial input before any code was written, and the counterexample was kept.</i></p>
<p>
  <b>You:</b> What the failed idea shows is that after the maximum leaves, I
  need the <em>next</em> candidate ready. A max-heap of (value, index) pairs
  does it: pop the top while its index is outside the window. That is O(n log n)
  with lazy deletion and would pass. But look at what the heap keeps that it
  never needs: if <code>nums[j] &lt;= nums[i]</code> and <code>j &lt; i</code>,
  then <code>j</code> can never be a window maximum again, because
  <code>i</code> is both larger and will stay in the window longer. So I can
  throw such a <code>j</code> away immediately. What remains is a list of
  indices whose values strictly decrease, oldest first. The front is the
  maximum; the front expires when it leaves the window; a new element removes
  smaller ones from the back. That is a monotonic deque, and each index is
  pushed once and removed at most once, so O(n).
</p>
<p class="sub"><i>Scored: the optimization is a derivation from the bottleneck, an alternative (heap) is named with its cost, and the key fact ("can never be a maximum again") is stated as the reason.</i></p>
<p>
  <b>Interviewer:</b> Go ahead and code the deque version.
</p>
<p>
  <b>You:</b> Signature first: takes <code>nums</code> and <code>k</code>,
  returns an array. I'll use an array plus a head index rather than
  <code>shift()</code>, which is O(n).
</p>
<pre><code>function maxSlidingWindow(nums, k) {
  const result = [];
  const deque = []; <span class="c">// indices; their values strictly decrease from front to back</span>
  let head = 0; <span class="c">// deque[head] is the front; moving head forward is a pop-front without shift()</span>
  for (let i = 0; i &lt; nums.length; i++) {
    if (head &lt; deque.length &amp;&amp; deque[head] &lt;= i - k) head++; <span class="c">// the front slid out of the window</span>
    while (deque.length &gt; head &amp;&amp; nums[deque[deque.length - 1]] &lt;= nums[i]) deque.pop(); <span class="c">// smaller or equal values can never be a max again</span>
    deque.push(i);
    if (i &gt;= k - 1) result.push(nums[deque[head]]);
  }
  return result;
}</code></pre>
<p class="sub"><i>Scored: narrating decisions (head index versus <code>shift()</code>, why <code>&lt;=</code> pops equal values) instead of syntax.</i></p>
<p>
  <b>You:</b> Now I trace the example, with real values. The table shows the
  deque after each step as index:value.
</p>
<table>
  <tr><th>i</th><th>nums[i]</th><th>deque after the step</th><th>output</th></tr>
  <tr><td>0</td><td>1</td><td>0:1</td><td>-</td></tr>
  <tr><td>1</td><td>3</td><td>1:3 (the 1 is smaller, popped)</td><td>-</td></tr>
  <tr><td>2</td><td>-1</td><td>1:3, 2:-1</td><td>3</td></tr>
  <tr><td>3</td><td>-3</td><td>1:3, 2:-1, 3:-3</td><td>3</td></tr>
  <tr><td>4</td><td>5</td><td>4:5 (index 1 expired, 2 and 3 popped)</td><td>5</td></tr>
  <tr><td>5</td><td>3</td><td>4:5, 5:3</td><td>5</td></tr>
  <tr><td>6</td><td>6</td><td>6:6</td><td>6</td></tr>
  <tr><td>7</td><td>7</td><td>7:7</td><td>7</td></tr>
</table>
<p>
  <b>You:</b> That gives <code>[3, 3, 5, 5, 6, 7]</code>, matching my hand
  answer. Now edge cases. <code>k = 1</code> should return the array itself.
  Take <code>[1, 0]</code>. I expect <code>[1, 0]</code> and ... my first draft
  of the expiry line was <code>deque[head] &lt; i - k</code>, and it returns
  <code>[1, 1]</code>. That is an off-by-one: the window holds indices
  <code>i - k + 1</code> to <code>i</code>, so an index equal to
  <code>i - k</code> is already out and the test must be
  <code>&lt;=</code>. The final code above has the fix. It is worth knowing
  that the buggy draft produces the right answer on the given example, so the
  example alone would not have caught it.
</p>
<p class="sub"><i>Scored: tracing with values, then choosing an edge case that probes the boundary, and finding the bug before the interviewer does.</i></p>
<p>
  <b>You:</b> Complexity: each index is pushed once and popped at most once, so
  O(n) time. The live part of the deque never holds more than
  <code>k</code> indices; this array-and-head version does not free the
  consumed front, so its memory is O(n), and a circular buffer would make it
  O(k). Correctness in one sentence: the deque always holds,
  in order, exactly the indices in the window that are not dominated by a later
  index, so its front is the window's maximum. I also compared it with the brute
  force on 3,000 random arrays with negatives and repeated values, plus
  <code>k = 1</code> and <code>k = n</code>.
</p>
<p>
  <b>Interviewer:</b> What if the numbers arrive as a stream and you must
  report a maximum after each arrival?
</p>
<p>
  <b>You:</b> The same code works almost unchanged: the loop body already
  handles one element at a time and only needs the indices it has seen, so I
  would keep the deque and a running index as fields and emit the front after
  each push once <code>k</code> elements have arrived. With a circular buffer, memory stays O(k). If
  the window were defined by time rather than by count, the expiry test would
  compare timestamps instead of indices; the structure is the same.
</p>
<p class="sub"><i>Scored: a follow-up absorbed by naming what changed (nothing about the algorithm, only what the front is compared against).</i></p>
<div class="bx is-ref">
  <span class="ttl">What the transcript did, in order</span>
  <ul>
    <li>Questions that each changed the plan, then the example answered by hand.</li>
    <li>Brute force with its complexity, checked against the constraint, bottleneck named.</li>
    <li>A first improvement tested on an adversarial input and dropped before any code.</li>
    <li>The real idea derived from what the failure showed, with the alternative's cost stated.</li>
    <li>Code narrated, traced with values, an edge case found a bug, the fix explained.</li>
    <li>Complexity, a one-sentence correctness argument, then the follow-up answered by saying what changes.</li>
  </ul>
</div>

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
  <li><b>A wrong approach is abandoned early and out loud.</b> The counterexample
    or the missed constraint is stated, kept on the board, and used as the first
    line of the next approach.</li>
  <li><b>Correctness is claimed with an invariant, not with examples.</b> One
    sentence says what stays true throughout, or why a discarded option cannot
    matter.</li>
  <li><b>Hard problems are recognised as hard.</b> When the constraints point at
    an exponential method, the candidate says which problem it resembles and
    works within the stated size instead of hunting for a polynomial algorithm.</li>
  <li><b>Corrections are absorbed without defensiveness.</b> A hint is taken,
    integrated, and credited — "good catch, that breaks when the values are
    negative; let me fix the invariant" — because the interviewer is
    simulating what code review with you feels like.</li>
  <li><b>Uncertainty is stated honestly and bounded.</b> "I'm fairly sure this
    is O(n log n) amortized but I'd want to double-check the resize cost" beats
    a confident wrong claim every time, and it is the difference between an
    engineer you can trust and one you have to verify.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Run the seven-step framework out loud on a problem you have never seen, including stating a brute force first.</li>
    <li>Read a constraint like n ≤ 10⁵ and say, before designing anything, which complexity class it's steering you toward.</li>
    <li>Name the bottleneck in a brute-force solution in one sentence, before naming the data structure that fixes it.</li>
    <li>Describe your procedure for being stuck, rather than going silent, and rehearse saying it out loud.</li>
    <li>Test your own solution against the original example plus one edge case before declaring it done.</li>
    <li>Say, for each checkpoint at minutes 5, 12, 25, 33 and 40, what must already be true and what you do if it is not.</li>
    <li>Take a keyword from a problem statement, name the first-guess pattern, and say the one check that would make you abandon it.</li>
    <li>Find a counterexample to a greedy idea on a tiny input, and turn it into the first line of your next approach.</li>
    <li>Write the one-sentence correctness argument for two pointers on sorted data, and for a monotonic deque.</li>
    <li>Given "it is a stream", "it is sorted" or "it is distributed", say which resource was taken away and what the standard move is.</li>
    <li>Look at a constraint like n &lt;= 40 with a subset-sum question and say which exponential method is intended and why.</li>
  </ul>
</div>`,
};
