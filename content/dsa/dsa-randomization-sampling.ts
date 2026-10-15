import type { Chapter } from "../types";

export const dsaRandomizationSampling: Chapter = {
  id: "dsa-randomization-sampling",
  num: "I22",
  title: "Randomization and sampling",
  short: "Randomization",
  levels: ["intermediate"],
  prerequisites: ["dsa-prefix-sums", "dsa-binary-search"],
  practice: [
    "ex-seeded-generator",
    "ex-chi-square-statistic",
    "ex-naive-shuffle-counts",
    "ex-shuffle-array",
    "ex-shuffle-and-reset",
    "ex-random-pick-index",
    "ex-linked-list-random-node",
    "ex-reservoir-sample-k",
    "ex-random-pick-weight",
    "ex-rand10-from-rand7",
    "ex-random-point-in-circle",
    "ex-random-point-in-rectangles",
    "ex-random-pick-blacklist",
    "ex-quickselect-kth-largest",
    "ex-kth-smallest-many-duplicates",
    "ex-insert-delete-getrandom",
    "ex-randomized-collection",
  ],
  ready: true,
  subtitle:
    "Make the generator a parameter, count the outcomes, and prove every outcome gets its fair share before you trust the code.",
  body: `<h3>What "random" has to mean before you can code it</h3>
<p>
  Most interview problems that say "random" are not about the generator. They
  hand you one source of randomness (<code>Math.random()</code>, a
  <code>rand7()</code>, a fair coin) and ask you to build a different
  distribution out of it: a shuffle, one item from a stream, an index chosen in
  proportion to weights, a point in a circle. What the grader checks is a
  statement about probability. Each outcome must have exactly the chance the
  problem promises, usually "all outcomes equally likely", and a later result
  must not depend on an earlier one. That is why a solution can pass every
  example and still be wrong: one run of a random function never shows whether
  its probabilities are right.
</p>
<p>
  Three habits carry the whole chapter, and each technique below repeats them.
</p>
<ul>
  <li><b>State the target as one sentence.</b> "Each of the n! orders has probability 1/n!." "Each of the n items seen so far is held with probability 1/n."</li>
  <li><b>Argue that the algorithm reaches it.</b> Either a counting argument (how many equally likely random choices are there, and how do they map onto outcomes?) or an induction on the number of items.</li>
  <li><b>Check it with an experiment you can repeat.</b> That needs a generator you control, counts over many trials, and a number to compare them with. A random function you cannot replay is a function you cannot debug.</li>
</ul>
<p>
  The techniques are few. Fisher-Yates builds a uniform shuffle. Reservoir
  sampling picks from a stream whose length you do not know. Prefix sums with a
  binary search turn weights into probabilities. Rejection sampling builds one
  distribution out of another by throwing away the draws that do not fit.
  Randomized quickselect uses a random pivot to get an expected linear running
  time. The last sections cover hashing as an alternative to random choice and
  how to answer "is this random enough?" out loud.
</p>

<h3>Math.random and its limits</h3>
<p>
  <code>Math.random()</code> returns a number <code>x</code> with
  <code>0 &lt;= x &lt; 1</code>: it can be <code>0</code> and is never
  <code>1</code>. The language only asks that the values be approximately
  uniform. It does not say which algorithm produces them, and there is no way
  to give it a seed, so two runs of the same program see different numbers.
  The interview building block is the integer in <code>0 .. n - 1</code>:
  scale by <code>n</code> and drop the fraction. The helpers below take the
  generator as an argument, <code>rng</code>, a function that returns a number
  in <code>[0, 1)</code>. In production code you pass
  <code>Math.random</code>. In tests you pass something you can replay, as the
  next sections show.
</p>
<pre><code>function randInt(rng, n) {
  return Math.floor(rng() * n); <span class="c">// 0 .. n - 1, each equally likely</span>
}

function randBetween(rng, lo, hi) {
  return lo + randInt(rng, hi - lo + 1); <span class="c">// lo .. hi, both ends included</span>
}</code></pre>
<table>
  <tr><th>You want</th><th>Write</th><th>Watch for</th></tr>
  <tr><td>An integer from 0 to n - 1</td><td><code>Math.floor(Math.random() * n)</code></td><td>With <code>n = 0</code> it returns <code>0</code>, not an error</td></tr>
  <tr><td>An integer from lo to hi, both included</td><td><code>lo + Math.floor(Math.random() * (hi - lo + 1))</code></td><td>Leaving out the <code>+ 1</code> means <code>hi</code> never appears</td></tr>
  <tr><td>A real number from lo up to but not including hi</td><td><code>lo + Math.random() * (hi - lo)</code></td><td>The upper end is never produced</td></tr>
  <tr><td>A random array element</td><td><code>arr[Math.floor(Math.random() * arr.length)]</code></td><td>An empty array gives <code>undefined</code></td></tr>
  <tr><td>A coin flip</td><td><code>Math.random() &lt; 0.5</code></td><td>The range <code>[0, 0.5)</code> is exactly half of <code>[0, 1)</code>, so <code>&lt;</code> is the right test</td></tr>
</table>
<p class="sub">
  Two recipes that look equivalent are not. <code>Math.round(x * (n - 1))</code>
  gives the values <code>0</code> and <code>n - 1</code> only half the width of
  the others: <code>round</code> returns 0 for <code>[0, 0.5)</code> but 1 for
  <code>[0.5, 1.5)</code>, a full unit. For six values the ends have
  probability 0.5/5 = 10% each and the middle four 20% each. And
  <code>(x * n) | 0</code> truncates the result to a 32-bit signed integer, so
  for <code>n</code> of 2<sup>31</sup> or more it can go negative:
  <code>(0.9999 * 2 ** 32) | 0</code> is <code>-429497</code>. Use
  <code>Math.floor</code>.
</p>

<h4>Why Math.random is the wrong tool for anything secret</h4>
<p>
  <code>Math.random</code> is not cryptographically secure: nothing promises
  that someone who has seen some of its outputs cannot predict the next ones.
  A session token, a password, a lottery draw or a shuffle that decides who
  wins money needs the platform's secure source: <code>crypto.getRandomValues</code>
  in browsers and in Node, or <code>crypto.randomInt</code> from
  <code>node:crypto</code>, which returns a uniform integer in a range. In an
  interview one sentence is enough: "<code>Math.random</code> is fine for a
  simulation or a game, not for anything an attacker would want to guess."
</p>

<h4>Modulo bias: why x % n is not a uniform pick</h4>
<p>
  The other common way to shrink a random integer into <code>0 .. n - 1</code>
  is the remainder. Suppose a source gives M equally likely raw values
  <code>0 .. M - 1</code>. The remainder <code>x % n</code> is uniform only when
  n divides M. Otherwise the first <code>M % n</code> remainders have one more
  raw value mapped onto them than the rest.
</p>
<pre><code>function residueCounts(values, n) {
  const counts = new Array(n).fill(0);
  for (let x = 0; x &lt; values; x++) counts[x % n]++; <span class="c">// x stands for one equally likely raw output</span>
  return counts;
}</code></pre>
<table>
  <tr><th>Raw values</th><th>Mapped to</th><th>How many raw values land on each result</th><th>What it means</th></tr>
  <tr><td>8 (a 3-bit number)</td><td>6 results, <code>x % 6</code></td><td><code>residueCounts(8, 6)</code> is <code>[2, 2, 1, 1, 1, 1]</code></td><td>Results 0 and 1 have probability 2/8, results 2 to 5 only 1/8</td></tr>
  <tr><td>49 (two rand7 calls)</td><td>10 results, <code>x % 10</code></td><td><code>residueCounts(49, 10)</code> is <code>[5, 5, 5, 5, 5, 5, 5, 5, 5, 4]</code></td><td>Result 9 is a little rarer than the others</td></tr>
  <tr><td>2<sup>32</sup> (a 32-bit number)</td><td>3,000,000,000 results</td><td>1,294,967,296 results get two raw values, the rest get one</td><td>The first 43% of the range is twice as likely as the rest</td></tr>
</table>
<p class="sub">
  The bias shrinks as the raw range grows far beyond n, which is why it hides
  in real code and shows up in small examples. The fix is not to patch the
  remainder. It is to refuse the raw values that fall in the incomplete last
  group and draw again. That is rejection sampling, and it has its own section
  below. The same finite-grid argument applies to <code>Math.floor(x * n)</code>:
  any generator has finitely many outputs, 2<sup>b</sup> of them for a
  b-bit generator, so the number of raw values behind two different results
  differs by at most one, out of about 2<sup>b</sup>/n each. For the sizes in
  interviews that is far below anything you could measure, so the standard answer is to state the assumption ("I assume
  <code>Math.random</code> is uniform on [0, 1)") and move on.
</p>

<h3>The counting test: can this algorithm be uniform at all?</h3>
<p>
  Before proving that a random algorithm is right, ask whether it can be. Most
  of the algorithms in this chapter make a fixed number of independent random
  choices, and the combination of choices decides the result. If there are N
  equally likely combinations in total and each one produces exactly one
  result, then every result gets a probability that is a whole number divided
  by N. For M results to be equally likely, each must receive exactly N / M
  combinations, so <b>M must divide N</b>. That is a one-line check that rules
  out a lot of tempting code.
</p>
<table>
  <tr><th>Algorithm</th><th>Equally likely combinations N</th><th>Results M</th><th>Verdict</th></tr>
  <tr><td>Swap each position with a random position, as in the naive shuffle of n items</td><td>n<sup>n</sup></td><td>n!</td><td>For n = 3, 27 combinations cannot be split into 6 equal groups. For every n of 3 or more, n - 1 divides n! but not n<sup>n</sup>, because n<sup>n</sup> leaves remainder 1 when divided by n - 1. Never uniform</td></tr>
  <tr><td>Fisher-Yates: choose among n, then n - 1, down to 2</td><td>n!</td><td>n!</td><td>Divisible. Can be uniform, and the proof below shows it is</td></tr>
  <tr><td>rand10 from two rand7 calls</td><td>49</td><td>10</td><td>49 is not a multiple of 10. And an algorithm that is guaranteed to stop within k calls has probabilities that are multiples of 1/7<sup>k</sup>, while 7<sup>k</sup> is odd, so it is never a multiple of 10</td></tr>
  <tr><td>Any shuffle that sorts with coin-flip comparisons (at most m comparisons)</td><td>2<sup>m</sup></td><td>n!</td><td>n! has the factor 3 for n of 3 or more, and 2<sup>m</sup> does not. Never uniform</td></tr>
</table>
<p class="sub">
  The third row is the real lesson of rand10. Because no algorithm with a
  fixed cap on its rand7 calls can work, the solution <em>must</em> be allowed to loop: draw,
  and if the draw is unusable, draw again. Rejection sampling is not a
  trick. It is forced. When the count says "possible", you still owe the
  argument that the combinations land evenly. When it says "impossible", you
  are done, and you can say so in one sentence.
</p>

<h3>Testing randomized code: inject the generator, seed it, count</h3>
<p>
  A function that calls <code>Math.random()</code> inside cannot be tested
  well. You cannot replay a failure, and a test that checks a distribution
  fails on some runs for no reason you can find. The cure is to make the
  randomness a parameter. Every algorithm in this chapter takes the
  generator as an argument, and the exercises do the same. That
  allows three kinds of test.
</p>
<ul>
  <li><b>A scripted generator</b> returns values you list in advance. The program's path is then fixed, so you can trace it by hand and assert an exact answer. All the dry-run tables below use one.</li>
  <li><b>A seeded generator</b> produces a long but repeatable sequence. Run the function a hundred thousand times, count the outcomes, and compare the counts with the probabilities you claim. The test gives the same verdict every time.</li>
  <li><b>Property checks</b> do not look at the distribution at all. The shuffled array is a permutation of the input, the sample has k distinct members, the input was not changed.</li>
</ul>
<pre><code>function mulberry32(seed) {
  let a = seed &gt;&gt;&gt; 0;
  return function () {
    a = (a + 0x6d2b79f5) &gt;&gt;&gt; 0;
    let t = a;
    t = Math.imul(t ^ (t &gt;&gt;&gt; 15), t | 1);
    t ^= t + Math.imul(t ^ (t &gt;&gt;&gt; 7), t | 61);
    return ((t ^ (t &gt;&gt;&gt; 14)) &gt;&gt;&gt; 0) / 4294967296; <span class="c">// always in [0, 1)</span>
  };
}

function scripted(values) {
  let next = 0;
  return function () {
    if (next &gt;= values.length) throw new Error("the script ran out of values");
    return values[next++];
  };
}

function tally(trials, keys, run) {
  const counts = new Map(keys.map((key) =&gt; [key, 0])); <span class="c">// every possible outcome starts at 0</span>
  for (let t = 0; t &lt; trials; t++) {
    const key = run();
    if (!counts.has(key)) throw new Error("impossible outcome: " + key);
    counts.set(key, counts.get(key) + 1);
  }
  return keys.map((key) =&gt; counts.get(key));
}

function chiSquare(observed) {
  const total = observed.reduce((sum, count) =&gt; sum + count, 0);
  const expected = total / observed.length;
  let statistic = 0;
  for (const count of observed) statistic += (count - expected) ** 2 / expected;
  return statistic;
}</code></pre>
<p>
  <code>mulberry32</code> is a small 32-bit generator that is easy to paste
  and is good enough for tests. It is not secure and you are not expected to
  recite its constants. If an interviewer asks you to write a seedable
  generator, three lines of a linear congruential generator are enough:
</p>
<pre><code>function lcg(seed) {
  let state = seed &gt;&gt;&gt; 0;
  return function () {
    state = (state * 1664525 + 1013904223) % 4294967296; <span class="c">// exact: the product stays below 2 ** 53</span>
    return state / 4294967296;
  };
}</code></pre>
<p class="sub">
  A linear congruential generator has weak low-order bits, which is why this
  version divides by 2<sup>32</sup> and uses the high-order part of the state
  (the way <code>randInt</code> does) rather than taking <code>state % n</code>.
  For a test, either generator is fine. Never use either for secrets.
</p>

<h4>Reading a chi-square number</h4>
<p>
  Counts from a random experiment never match the expected counts exactly, so
  you need a rule for "close enough". The chi-square statistic adds up, over
  all outcomes, the squared gap between observed and expected count divided by
  the expected count. For a statistic computed from k outcomes, compare it with
  the critical value for k - 1 degrees of freedom. If the algorithm really is
  uniform, the statistic exceeds the 0.1% critical value in about one run out of
  a thousand.
</p>
<table>
  <tr><th>Outcomes</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>10</th><th>12</th><th>24</th><th>35</th></tr>
  <tr><td>Degrees of freedom</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>9</td><td>11</td><td>23</td><td>34</td></tr>
  <tr><td>Critical value at 0.1%</td><td>10.83</td><td>13.82</td><td>16.27</td><td>18.47</td><td>20.52</td><td>22.46</td><td>24.32</td><td>27.88</td><td>31.26</td><td>49.73</td><td>65.25</td></tr>
</table>
<h4>Dry run: 60,000 rolls of a six-sided die, seed 1</h4>
<p>
  The call is <code>tally(60000, [0, 1, 2, 3, 4, 5], () =&gt; randInt(rng, 6))</code>
  with <code>rng = mulberry32(1)</code>. The expected count for each face is
  60,000 / 6 = 10,000.
</p>
<table>
  <tr><th>Face</th><th>Observed</th><th>Gap from 10,000</th><th>Gap squared / 10,000</th></tr>
  <tr><td>0</td><td>10,062</td><td>+62</td><td>0.384</td></tr>
  <tr><td>1</td><td>9,933</td><td>-67</td><td>0.449</td></tr>
  <tr><td>2</td><td>9,957</td><td>-43</td><td>0.185</td></tr>
  <tr><td>3</td><td>10,144</td><td>+144</td><td>2.074</td></tr>
  <tr><td>4</td><td>9,999</td><td>-1</td><td>0.000</td></tr>
  <tr><td>5</td><td>9,905</td><td>-95</td><td>0.903</td></tr>
  <tr><td colspan="3">Statistic</td><td>3.99</td></tr>
</table>
<p class="sub">
  3.99 is below the critical value 20.52 for 5 degrees of freedom, so the
  die looks fair. For contrast, the same seed with
  <code>Math.round(rng() * 5)</code> gives the counts 6009, 11985, 11958,
  12208, 11908 and 5932, and a statistic of about 4,877: the end values come
  out at about half the others, as the width argument predicted.
</p>
<div class="warn">
  <span class="ttl">⚠ What a chi-square test can and cannot tell you</span>
  A small statistic says only that a bias big enough to show at this number of
  trials is not there. It does not prove uniformity, and a bias of a fraction
  of a percent needs millions of trials to show. It looks at counts, so it says
  nothing about whether one result depends on the previous one: to test that,
  count pairs of consecutive results as well. Keep the expected count per
  outcome comfortably above 5. Choose your seeds before you look at results;
  trying seeds until one passes proves nothing. And give <code>tally</code>
  every possible outcome in advance, as the code does, because an outcome that
  never occurs has no entry to count and would silently make the statistic
  look better.
</div>

<h3>Fisher-Yates and the proof that every order is equally likely</h3>
<p>
  The task: rearrange an array so that each of its n! orders has probability
  1/n!. The natural plan is to fill the positions one at a time, choosing
  uniformly among the elements not yet placed. Choosing the element for the
  last position first leaves a smaller array of the same problem, and the
  chosen element can be moved into place by swapping it with the position being
  filled. Everything not yet placed then stays packed in a prefix of the
  array, so no extra storage is needed.
</p>
<pre><code>function shuffle(items, rng) {
  const a = items.slice(); <span class="c">// work on a copy</span>
  for (let i = a.length - 1; i &gt; 0; i--) {
    const j = randInt(rng, i + 1); <span class="c">// 0 .. i, so position i may keep its own element</span>
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function naiveShuffle(items, rng) {
  const a = items.slice();
  for (let i = 0; i &lt; a.length; i++) {
    const j = randInt(rng, a.length); <span class="c">// the bug: every step draws from the whole array</span>
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sortShuffle(items, rng) {
  return items.slice().sort(() =&gt; rng() - 0.5); <span class="c">// the popular one-liner, with the generator passed in</span>
}

function shuffleByKeys(items, rng) {
  return items
    .map((item) =&gt; ({ item, key: rng() }))
    .sort((p, q) =&gt; p.key - q.key)
    .map((pair) =&gt; pair.item);
}

function sampleDistinct(items, k, rng) {
  const a = items.slice();
  const count = Math.min(k, a.length);
  for (let i = 0; i &lt; count; i++) {
    const j = i + randInt(rng, a.length - i); <span class="c">// a random element from the part not yet chosen</span>
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, count);
}</code></pre>
<p>
  Read <code>shuffle</code> first. <code>sampleDistinct</code> is the same loop
  run from the front for only k steps, so it returns k elements chosen without
  replacement in a uniformly random order. <code>naiveShuffle</code>,
  <code>sortShuffle</code> and <code>shuffleByKeys</code> are the other ways
  people try, and are measured in the next section.
</p>
<h4>Dry run: shuffle(["A", "B", "C", "D"]) with the script 0.6, 0.9, 0.3</h4>
<table>
  <tr><th>i</th><th>rng value</th><th>j = floor(value * (i + 1))</th><th>Swap</th><th>Array afterwards</th></tr>
  <tr><td>-</td><td>-</td><td>-</td><td>-</td><td>A B C D</td></tr>
  <tr><td>3</td><td>0.6</td><td>floor(2.4) = 2</td><td>positions 3 and 2</td><td>A B D C</td></tr>
  <tr><td>2</td><td>0.9</td><td>floor(2.7) = 2</td><td>position 2 with itself</td><td>A B D C</td></tr>
  <tr><td>1</td><td>0.3</td><td>floor(0.6) = 0</td><td>positions 1 and 0</td><td>B A D C</td></tr>
</table>
<p class="sub">
  The result is <code>["B", "A", "D", "C"]</code>. Position 0 is never drawn
  for: when i reaches 0 only one element is left, so there is nothing to
  choose, which is why the loop stops at <code>i &gt; 0</code>. The middle row
  swapped a position with itself. That is not wasted. It is the case where the
  element already there is the one chosen, and leaving it out would make that
  outcome impossible.
</p>

<h4>Why every order has probability exactly 1/n!</h4>
<p>
  Write the random choices as a sequence <code>(j<sub>n-1</sub>, ..., j<sub>1</sub>)</code>,
  where <code>j<sub>i</sub></code> is drawn from <code>0 .. i</code>. The
  choices are independent, so each of the
  <code>n * (n - 1) * ... * 2 = n!</code> sequences has probability 1/n!. Now
  show that two different sequences always produce different arrays. Given the
  final array, you can recover the sequence from the back. The element in the
  last position was put there by the first step and never moved again, so
  <code>j<sub>n-1</sub></code> is the index that element had in the original
  array. After undoing that swap, the element in position n - 2 was placed by
  the second step, and <code>j<sub>n-2</sub></code> is its index in the array as
  it stood after the first step, and so on down to position 1. Every step is
  determined, so the map from sequences to arrays never maps two sequences to
  one array. There are n! sequences and n! possible arrays, so the map is a
  one-to-one correspondence: each array comes from exactly one sequence, with
  probability 1/n!. I also checked this by brute force. For every n from 1 to
  6, running <code>shuffle</code> on all n! scripted choice sequences produced
  n! different arrays.
</p>
<p>
  The same fact in the language of an invariant: <em>before the step for
  position i, the elements in positions 0 .. i are the ones not yet placed, and
  every one of them is equally likely to be chosen for position i</em>. The
  step picks one with probability 1/(i + 1) and sets it aside for good, so the
  chosen order is built one uniform choice at a time.
</p>

<h4>Why the naive version fails</h4>
<p>
  <code>naiveShuffle</code> swaps each position with a position drawn from the
  whole array. Its choices form n<sup>n</sup> equally likely sequences, and by
  the counting test n<sup>n</sup> cannot be shared evenly among n! orders. For
  three items I enumerated all 27 sequences: three orders (<code>123</code>,
  <code>312</code> and <code>321</code>) come from 4 sequences each, and the other
  three from 5. The probabilities are 4/27 = 14.8% and 5/27 = 18.5%, instead
  of 16.7% for all. The measured counts in the next section agree.
</p>

<h4>Complexity and variations</h4>
<p>
  Fisher-Yates does n - 1 random draws and n - 1 swaps: O(n) time. A copy costs
  O(n) extra space, and shuffling the caller's array in place costs O(1). Decide
  which you promise, and say so. <code>sampleDistinct</code> finishes after k
  steps, so after the O(n) copy it costs O(k): it is the right tool for "k
  distinct random elements of an array". Starting at the front with
  <code>j = i + randInt(rng, n - i)</code> is as correct as starting at the
  back: it is the same argument read from the other end.
</p>
<div class="warn">
  <span class="ttl">⚠ Three bugs in a shuffle loop</span>
  <code>randInt(rng, i)</code> instead of <code>randInt(rng, i + 1)</code> means
  a position can never keep its own element. That is Sattolo's algorithm: it is
  uniform over the (n - 1)! orders that form a single cycle and can never
  produce the others, correct for that purpose and wrong for a shuffle (I
  checked n = 4: it produced only 6 of the 24 orders, each about a sixth of the
  time). <code>Math.floor(Math.random() * i + 1)</code> parses as
  <code>floor(x * i + 1)</code>, which ranges over <code>1 .. i</code>:
  the parentheses belong around <code>i + 1</code>. And shuffling the input
  array when the caller expected it to stay as it was is a bug in any problem
  that has a <code>reset()</code>.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'll walk from the last position
  down, pick a random index from zero up to and including the current one,
  swap, and move on. That makes n! equally likely choice sequences, and
  different sequences give different arrays, so each order has probability
  one over n factorial. It is O(n) time and in place."
</div>

<h3>Why sort(() =&gt; Math.random() - 0.5) is biased: measured</h3>
<p>
  The one-line shuffle appears in many tutorials. It passes a comparator that
  answers "negative" or "positive" at random, hoping the sort will scramble the
  array. A comparator is supposed to be consistent: if it says <code>a</code>
  goes before <code>b</code> now, it must say so next time. This one answers
  the same question differently each time, and the specification then leaves
  the resulting order up to the implementation. So the outcome depends on which
  sorting algorithm the engine uses, and there is a counting proof that no
  comparison sort can make it fair. Suppose the sort makes at most m
  comparisons and each answer is an exactly fair coin flip (the real comparator
  is no better than that). Then every order has probability k/2<sup>m</sup>
  for some whole number k. The target 1/n! is of that form only if n! divides a
  power of two, and n! has the factor 3 once n is 3 or more. The bias is not a
  rounding accident. It cannot be avoided.
</p>
<p>
  The next table shows how large it is. Each row runs the method on
  <code>[1, 2, 3]</code> 60,000 times with <code>mulberry32(7)</code>, so a fair
  method puts about 10,000 in every column. The chi-square line uses 5 degrees
  of freedom, where the 0.1% critical value is 20.52.
</p>
<table>
  <tr><th>Method</th><th>123</th><th>132</th><th>213</th><th>231</th><th>312</th><th>321</th><th>Statistic</th></tr>
  <tr><td>Fisher-Yates</td><td>9,998</td><td>9,928</td><td>9,973</td><td>10,122</td><td>9,868</td><td>10,111</td><td>5.1</td></tr>
  <tr><td>Naive swaps</td><td>8,894</td><td>11,169</td><td>11,065</td><td>11,144</td><td>8,902</td><td>8,826</td><td>761.7</td></tr>
  <tr><td>Random comparator</td><td>22,498</td><td>3,813</td><td>7,442</td><td>3,700</td><td>3,740</td><td>18,807</td><td>35,746.3</td></tr>
  <tr><td>Sort by random keys</td><td>9,954</td><td>10,090</td><td>9,892</td><td>10,058</td><td>10,083</td><td>9,923</td><td>3.8</td></tr>
</table>
<p class="sub">
  With the comparator, the original order <code>123</code> survives 37.5% of the
  time and <code>321</code> 31.3%, against 16.7% for a fair shuffle. On four
  items (24 orders, 120,000 trials, <code>mulberry32(11)</code>, 23 degrees of
  freedom and a critical value of 49.73) the statistics were 31.1 for
  Fisher-Yates, 3,694.7 for the naive swaps, 139,336.9 for the comparator and
  25.5 for random keys. On ten items, element 0 ended in the first position
  19.4% of the time with the comparator (100,000 trials, seed 5), against 10.0%
  with Fisher-Yates. These are measurements of Node 24's sort. Another engine
  or version sorts differently and would give other numbers, but the counting
  proof says it cannot give fair ones. A different seed changes every count in
  the table without changing the verdicts.
</p>
<p>
  <code>shuffleByKeys</code>, the last row, is correct: give every element an
  independent random key and sort by the key. If all keys are different, each of
  the n! orders of the keys is equally likely, so each order of the elements is
  too. Its flaw is cost, O(n log n) against O(n), and ties: two equal keys leave
  the sort to decide, which is a slight bias when the keys are coarse. Prefer
  Fisher-Yates and mention random keys only as a correct alternative.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "Sorting with a random comparator
  is not a shuffle. The comparator is inconsistent, so the result is
  implementation-defined, and for any comparison sort driven by coin flips the
  order probabilities are multiples of a power of two, which cannot equal one
  over n factorial. I measured it on three elements and the identity order came
  out about 37% of the time."
</div>

<h3>Reservoir sampling: one item from a stream of unknown length</h3>
<p>
  The problem: items arrive one at a time, you cannot go back, you do not know
  in advance how many will come, and when the stream ends you must return one
  item chosen uniformly. The obvious plan, store everything and then pick
  <code>items[randInt(rng, items.length)]</code>, uses O(n) memory and fails
  outright when the stream is too large to hold. The other obvious plan, count
  the items in one pass and pick an index in a second, needs a stream you can
  read twice.
</p>
<p>
  Derive the answer by asking what a one-slot memory can do. Keep one candidate.
  When the first item arrives it must be the candidate, because with one item
  seen it is the only possible answer. After two items each must be the answer
  with probability 1/2. The first is already the candidate, so the second must
  take over with probability 1/2. After three items each needs probability 1/3,
  so the third takes over with probability 1/3, and so on. In general the i-th item replaces the candidate with probability
  <b>1/i</b>.
</p>
<pre><code>function sampleOne(stream, rng) {
  let chosen;
  let seen = 0;
  for (const item of stream) {
    seen++;
    if (randInt(rng, seen) === 0) chosen = item; <span class="c">// probability 1 / seen</span>
  }
  return chosen; <span class="c">// undefined for an empty stream</span>
}

function reservoirSample(stream, k, rng) {
  const reservoir = [];
  let seen = 0;
  for (const item of stream) {
    seen++;
    if (reservoir.length &lt; k) {
      reservoir.push(item);
    } else {
      const slot = randInt(rng, seen); <span class="c">// 0 .. seen - 1</span>
      if (slot &lt; k) reservoir[slot] = item; <span class="c">// probability k / seen, and it lands in a uniform slot</span>
    }
  }
  return reservoir;
}

class RandomPickIndex {
  constructor(nums, rng) {
    this.nums = nums;
    this.rng = rng;
  }

  pick(target) {
    let chosen = -1;
    let matches = 0;
    for (let i = 0; i &lt; this.nums.length; i++) {
      if (this.nums[i] !== target) continue;
      matches++;
      if (randInt(this.rng, matches) === 0) chosen = i;
    }
    return chosen;
  }
}

class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

class RandomListNode {
  constructor(head, rng) {
    this.head = head;
    this.rng = rng;
  }

  getRandom() {
    let chosen = this.head.val;
    let seen = 0;
    for (let node = this.head; node !== null; node = node.next) {
      seen++;
      if (randInt(this.rng, seen) === 0) chosen = node.val;
    }
    return chosen;
  }
}

function mergeSamples(first, second, rng) {
  const seen = first.seen + second.seen;
  const winner = randInt(rng, seen) &lt; first.seen ? first : second; <span class="c">// each side in proportion to the items it saw</span>
  return { item: winner.item, seen };
}</code></pre>
<p>
  Notice <code>sampleOne</code> draws a number even for the first item, where
  <code>randInt(rng, 1)</code> is always 0. That keeps the loop uniform and the
  script of a test simple: one draw per item.
</p>
<h4>Dry run: sampleOne over A, B, C, D with the script 0.3, 0.7, 0.2, 0.6</h4>
<table>
  <tr><th>seen</th><th>Item</th><th>Draw</th><th>floor(draw * seen)</th><th>Replace?</th><th>Candidate</th></tr>
  <tr><td>1</td><td>A</td><td>0.3</td><td>0</td><td>yes (0 means replace)</td><td>A</td></tr>
  <tr><td>2</td><td>B</td><td>0.7</td><td>1</td><td>no</td><td>A</td></tr>
  <tr><td>3</td><td>C</td><td>0.2</td><td>0</td><td>yes</td><td>C</td></tr>
  <tr><td>4</td><td>D</td><td>0.6</td><td>2</td><td>no</td><td>C</td></tr>
</table>
<p class="sub">
  The answer is <code>C</code>. The code replaces exactly when the drawn number
  is 0, which has probability 1/seen for <code>randInt(rng, seen)</code>.
</p>

<h4>Proof by induction: after i items, each is held with probability exactly 1/i</h4>
<p>
  <b>Base.</b> After one item, the candidate is that item, with probability
  1 = 1/1. <b>Step.</b> Assume that after i items each of them is the candidate
  with probability 1/i. The next item replaces the candidate with probability
  1/(i + 1), so the new item itself is held with probability 1/(i + 1), as
  required. An old item is held after the step only if it was held before and
  the new item did <em>not</em> replace it. Those two events are independent,
  because the new draw does not look at the old ones, so the probability is
  (1/i) * (1 - 1/(i + 1)) = (1/i) * (i/(i + 1)) = 1/(i + 1). Every item, old or
  new, has probability 1/(i + 1). The induction is complete.
</p>
<table>
  <tr><th>Item</th><th>Survival after 4 items</th><th>Each factor</th></tr>
  <tr><td>A</td><td>1/4</td><td>1 (enters) * 1/2 * 2/3 * 3/4</td></tr>
  <tr><td>B</td><td>1/4</td><td>1/2 (enters) * 2/3 * 3/4</td></tr>
  <tr><td>C</td><td>1/4</td><td>1/3 (enters) * 3/4</td></tr>
  <tr><td>D</td><td>1/4</td><td>1/4 (enters)</td></tr>
</table>
<p class="sub">
  The product telescopes: each numerator cancels the next denominator. I also
  checked the code two ways. Enumerating all 1 * 2 * 3 * 4 * 5 = 120 scripted
  draw sequences for five items put each item last standing in exactly 24 of
  them. And 50,000 seeded runs (<code>mulberry32(3)</code>) on a five-item
  array gave the counts 10110, 10042, 9876, 9872, 10100, a statistic of 5.56
  against a critical value of 18.47.
</p>
<p>
  Cost: one pass, O(n) time, O(1) extra space, and it works on any iterable,
  including a generator that you can only walk once.
</p>

<h3>Random pick index and linked list random node</h3>
<p>
  Two classic problems are reservoir sampling in disguise. In <b>random pick
  index</b>, an array has duplicates, and <code>pick(target)</code> must return
  a uniformly random index among those holding the target. The easy solution is
  a map from value to the list of its indices, which makes a pick O(1) but
  costs O(n) memory. If the array is huge and memory is the constraint, scan
  it and run reservoir sampling over the <em>matching</em> positions only. That
  is <code>RandomPickIndex</code> above: <code>matches</code> is the count of
  candidates so far, and the current match replaces the chosen one with
  probability <code>1 / matches</code>.
</p>
<p>
  In <b>linked list random node</b>, you hold only the head, and the length is
  not known. You could walk the list once to count it and again to stop at a
  random position, which is two passes. Reservoir sampling does it in one pass
  with O(1) space, which is the point of the follow-up question in the
  problem. <code>RandomListNode</code> is the same loop with
  <code>node = node.next</code> in place of the array index.
</p>
<table>
  <tr><th>Approach</th><th>Setup</th><th>Each pick</th><th>Extra space</th><th>Use when</th></tr>
  <tr><td>Map from value to list of indices</td><td>O(n)</td><td>O(1)</td><td>O(n)</td><td>Many picks, memory is cheap</td></tr>
  <tr><td>Count matches, then walk to a random one</td><td>none</td><td>O(n), two passes</td><td>O(1)</td><td>The data can be read twice</td></tr>
  <tr><td>Reservoir over the matches</td><td>none</td><td>O(n), one pass</td><td>O(1)</td><td>One pass only, or the length is unknown</td></tr>
</table>
<h4>Dry run: pick(3) on [1, 3, 2, 3, 3] with the script 0.4, 0.9, 0.1</h4>
<table>
  <tr><th>Index</th><th>Value</th><th>matches</th><th>Draw</th><th>floor(draw * matches)</th><th>chosen</th></tr>
  <tr><td>0</td><td>1</td><td>0 (skipped)</td><td>-</td><td>-</td><td>-1</td></tr>
  <tr><td>1</td><td>3</td><td>1</td><td>0.4</td><td>0, replace</td><td>1</td></tr>
  <tr><td>2</td><td>2</td><td>1 (skipped)</td><td>-</td><td>-</td><td>1</td></tr>
  <tr><td>3</td><td>3</td><td>2</td><td>0.9</td><td>1, keep</td><td>1</td></tr>
  <tr><td>4</td><td>3</td><td>3</td><td>0.1</td><td>0, replace</td><td>4</td></tr>
</table>
<p class="sub">
  The pick is index 4. Non-matching values never touch the generator, so the
  script has one value per <em>match</em>, not per element. A target that is not
  present returns <code>-1</code> here, so check what the problem promises. In
  30,000 seeded picks (<code>mulberry32(5)</code>) the three matching indices
  came out 10048, 10051 and 9901 times. On a five-node list, 50,000 calls
  gave 10051, 9946, 9989, 10071 and 9943, a statistic of 1.39.
</p>

<h3>Reservoir sampling for k items</h3>
<p>
  Now keep k items instead of one, with every k-element subset of the stream
  equally likely. The same idea scales. Fill the reservoir with the first k
  items, since with only k items seen they must all be in it. The i-th item
  after that (counting from 1, so i is greater than k) should end up in the
  sample with probability k/i. Draw a number <code>slot</code> from
  <code>0 .. i - 1</code>. If <code>slot &lt; k</code>, which has probability
  k/i, the new item enters and replaces whatever is in that slot. Because the
  slot is uniform among k, each current member is equally likely to be the one
  evicted. That is <code>reservoirSample</code> above.
</p>
<h4>Dry run: reservoirSample(A..E, 2) with the script 0.5, 0.9, 0.1</h4>
<table>
  <tr><th>Item</th><th>seen</th><th>Draw</th><th>slot = floor(draw * seen)</th><th>Action</th><th>Reservoir</th></tr>
  <tr><td>A</td><td>1</td><td>-</td><td>-</td><td>fill</td><td>[A]</td></tr>
  <tr><td>B</td><td>2</td><td>-</td><td>-</td><td>fill</td><td>[A, B]</td></tr>
  <tr><td>C</td><td>3</td><td>0.5</td><td>1</td><td>1 &lt; 2: replace slot 1</td><td>[A, C]</td></tr>
  <tr><td>D</td><td>4</td><td>0.9</td><td>3</td><td>3 &gt;= 2: skip</td><td>[A, C]</td></tr>
  <tr><td>E</td><td>5</td><td>0.1</td><td>0</td><td>0 &lt; 2: replace slot 0</td><td>[E, C]</td></tr>
</table>
<h4>Proof: each k-subset is equally likely</h4>
<p>
  Claim: after i items, the reservoir, read as a set, is equally likely to be
  any of the C(i, k) subsets of the items seen. For i = k there is one subset,
  with probability 1. Assume it for i and take a k-subset S of the first i + 1
  items. There are two cases.
</p>
<ul>
  <li>
    <b>S does not contain item i + 1.</b> The reservoir must have been S
    already, with probability 1/C(i, k), and the new item must have been
    skipped, with probability 1 - k/(i + 1) = (i + 1 - k)/(i + 1). The product
    is (i + 1 - k) / ((i + 1) * C(i, k)).
  </li>
  <li>
    <b>S contains item i + 1.</b> Then S minus that item is a (k - 1)-subset
    of the first i, and the reservoir before the step was that subset plus one
    other item x. There are i - (k - 1) = i + 1 - k choices for x, each with
    probability 1/C(i, k). The new item must enter, with probability
    k/(i + 1), and pick exactly the slot holding x, with probability 1/k. The
    total is (i + 1 - k) * (1/C(i, k)) * (k/(i + 1)) * (1/k), which is again
    (i + 1 - k) / ((i + 1) * C(i, k)).
  </li>
</ul>
<p>
  Both cases give the same number, and since C(i + 1, k) = C(i, k) * (i + 1) /
  (i + 1 - k), that number is 1/C(i + 1, k). Every subset has the same
  probability. In particular each single item is in the reservoir with
  probability k/i.
</p>
<p class="sub">
  Checks I ran: enumerating every scripted draw sequence, the 10 subsets of a
  five-item stream with k = 2 each came from exactly 6 of the 60
  sequences, and the same held for n = 6, k = 3 (20 subsets, 6 each), n = 7, k = 3
  (35 subsets, 24 each) and n = 7, k = 4 (35 subsets, 6 each). With 100,000
  seeded runs (<code>mulberry32(4)</code>) on five items with k = 2 the ten
  subset counts ranged from 9,896 to 10,134 with a statistic of 7.10 against 27.88.
  With k = 3 on seven items and 350,000 runs the statistic was 26.99 for 34
  degrees of freedom (critical value 65.25).
</p>
<p>
  Cost: O(n) time, O(k) space, one pass. The guarantee is about the
  <em>set</em> of items. The order of the items inside the reservoir array is
  not promised to be a uniform shuffle, so shuffle the result if the problem
  needs random order. For k of at least n the loop simply keeps everything.
</p>
<h4>Merging samples from two streams</h4>
<p>
  If two machines each hold one sampled item together with the number of
  items they saw, <code>mergeSamples</code> combines them for k = 1: take the
  first machine's item with probability <code>first.seen / (first.seen + second.seen)</code>.
  Every item overall then has probability 1/total. For streams of 3 and 5
  items, 80,000 merges gave counts between 9,903 and 10,147 for the eight
  items (statistic 6.34, critical value 24.32). A variant for weighted items,
  where the sample is drawn in proportion to the weights, assigns every item the key <code>u ** (1 / weight)</code> for a fresh random
  <code>u</code> in (0, 1) and keeps the k largest keys. It is worth knowing the
  name exists; the unweighted version is what interviews ask for.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "I keep a reservoir of size k.
  The first k items go in. For the i-th item I draw a number from zero to i
  minus one, and if it is below k the new item takes that slot. By induction,
  after i items every item is in the reservoir with probability k over i. It
  is one pass, O(k) memory, and I don't need to know n."
</div>

<h3>Weighted random pick: prefix sums and binary search</h3>
<p>
  The problem: given positive weights, return index <code>i</code> with
  probability <code>w[i] / total</code>. The beginner solutions are both
  expensive. Expanding the array, with <code>i</code> repeated
  <code>w[i]</code> times and then a uniform pick, costs memory equal to the
  total weight, which can be enormous. Walking the weights and subtracting
  from a random target costs O(n) per pick.
</p>
<p>
  Derive the fast way from a picture. Lay the weights end to end on a number
  line from 0 to the total. Index 0 owns the first <code>w[0]</code> units,
  index 1 the next <code>w[1]</code>, and so on. Throw a dart uniformly at the
  line: the chance that it lands in index i's segment is exactly its length over
  the total. The segment boundaries are the prefix sums, so the work is to find
  which segment contains the dart, and the prefix array is sorted, so binary
  search does it in O(log n).
</p>
<figure>
  <svg viewBox="0 0 640 190" class="dg" role="img" aria-label="A number line from 0 to 10 split into three segments of lengths 1, 3 and 6 for indexes 0, 1 and 2, with a dart at 5 landing in the third segment">
    <g class="rough">
      <rect class="boxr" x="40" y="60" width="56" height="44" />
      <rect class="boxy" x="96" y="60" width="168" height="44" />
      <rect class="boxg" x="264" y="60" width="336" height="44" />
    </g>
    <text class="sm" x="68" y="88" text-anchor="middle">idx 0</text>
    <text class="sm" x="180" y="88" text-anchor="middle">idx 1</text>
    <text class="sm" x="432" y="88" text-anchor="middle">idx 2</text>
    <text class="sm" x="68" y="50" text-anchor="middle">w = 1</text>
    <text class="sm" x="180" y="50" text-anchor="middle">w = 3</text>
    <text class="sm" x="432" y="50" text-anchor="middle">w = 6</text>
    <text class="sm" x="40" y="126" text-anchor="middle">0</text>
    <text class="sm" x="96" y="126" text-anchor="middle">1</text>
    <text class="sm" x="264" y="126" text-anchor="middle">4</text>
    <text class="sm" x="600" y="126" text-anchor="middle">10</text>
    <g class="rough">
      <path class="ln dash" d="M320,150 L320,106" />
    </g>
    <text class="sm gr" x="320" y="170" text-anchor="middle">r = 5: the first prefix greater than 5 is 10, so index 2</text>
  </svg>
  <figcaption>Weights 1, 3 and 6 as segments of a line of length 10. The prefix sums 1, 4 and 10 are the right ends of the segments.</figcaption>
</figure>
<p>
  Make the dart a whole number <code>r</code> drawn from
  <code>0 .. total - 1</code>. Index i owns the numbers from
  <code>prefix[i - 1]</code> up to but not including <code>prefix[i]</code>, so
  the answer is the <b>first index whose prefix sum is strictly greater than
  r</b>. That is a binary search you already know (an upper-bound search, see the
  <a href="/dsa/dsa-binary-search">binary search</a> chapter), over the prefix
  sums you met in <a href="/dsa/dsa-prefix-sums">prefix sums</a>.
</p>
<pre><code>function firstGreater(prefix, r) {
  let lo = 0;
  let hi = prefix.length - 1; <span class="c">// the last prefix is the total, which is always greater than r</span>
  while (lo &lt; hi) {
    const mid = lo + ((hi - lo) &gt;&gt; 1);
    if (prefix[mid] &gt; r) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

class WeightedPicker {
  constructor(weights, rng) {
    this.rng = rng;
    this.prefix = [];
    let running = 0;
    for (const weight of weights) {
      running += weight;
      this.prefix.push(running);
    }
    this.total = running;
  }

  pickIndex() {
    const r = randInt(this.rng, this.total); <span class="c">// a whole number 0 .. total - 1</span>
    return firstGreater(this.prefix, r);
  }
}</code></pre>
<p>
  The setup is an O(n) pass for the prefix sums and the space is O(n). Each
  pick is one random draw and a binary search, O(log n). The search range ends
  at the last index because the final prefix, the total, is always greater than
  r, so the answer always exists.
</p>
<h4>Dry run: weights [1, 3, 6], prefix [1, 4, 10], total 10</h4>
<table>
  <tr><th>r</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th></tr>
  <tr><td>First prefix greater than r</td><td>1</td><td>4</td><td>4</td><td>4</td><td>10</td><td>10</td><td>10</td><td>10</td><td>10</td><td>10</td></tr>
  <tr><td>Index returned</td><td>0</td><td>1</td><td>1</td><td>1</td><td>2</td><td>2</td><td>2</td><td>2</td><td>2</td><td>2</td></tr>
</table>
<p class="sub">
  One value of r maps to index 0, three to index 1, six to index 2: exactly the
  weights. Checking by enumeration like this is stronger than a random test,
  because it covers every possible draw once. A test can pass a scripted
  generator that returns <code>(r + 0.5) / total</code> for each r in turn and
  count where the picks land. The half avoids a rounding error at the edge when
  the division is not exact.
</p>
<div class="warn">
  <span class="ttl">⚠ Greater than, not greater than or equal</span>
  With weights [1, 3] and r in 0 to 3, the strict version gives index 0 once and
  index 1 three times. Switch to <code>prefix[mid] &gt;= r</code> and the
  prefix [1, 4] sends r = 0 and r = 1 to index 0, and r = 2 and r = 3 to index
  1: two and two, so a weight of 1 to 3 has become 1 to 1. A search for the
  first prefix at least r is correct when r runs from 1 to total, not from 0.
  Zero weights are handled with no special code: a zero-weight index has the
  same prefix as the one before it, so the first prefix greater than r is
  never its own. In 200,000 seeded picks over the weights [1, 3, 6, 0, 10]
  (<code>mulberry32(6)</code>) the counts were 9995, 29615, 60017, 0 and 100373,
  against the expected 10000, 30000, 60000, 0 and 100000. The statistic over the
  four non-zero weights was 6.34, below the critical value 16.27.
</div>
<p>
  If the weights are real numbers, use <code>rng() * total</code> for the
  target and keep the same search. Rounding in the running total shifts the
  boundaries by tiny amounts, which is acceptable in practice. If the weights
  change between picks, rebuilding the prefix array costs O(n). A Fenwick tree
  stores prefix sums that update in O(log n) and supports a descent that finds
  the segment directly (see <a href="/dsa/dsa-segment-fenwick-trees">segment and Fenwick trees</a>).
</p>
<h4>The alias method, as awareness</h4>
<p>
  When there are many picks from a fixed set of weights, the alias method
  spends O(n) to build two small tables and then answers each pick in O(1)
  with two random numbers. Rescale the weights so the average is 1 and imagine
  n columns of height 1. Each column is filled by at most two outcomes: a
  small outcome (height below 1) fills part of its own column, and a large one
  donates the missing height, shrinking by exactly that much. Repeat until all
  columns are full. To pick, choose a column uniformly, then keep the column's
  own outcome with probability <code>accept[column]</code> and otherwise take its
  alias.
</p>
<pre><code>function buildAlias(weights) {
  const n = weights.length;
  const total = weights.reduce((a, b) =&gt; a + b, 0);
  const scaled = weights.map((w) =&gt; (w * n) / total); <span class="c">// the average column now has height 1</span>
  const accept = new Array(n).fill(1);
  const alias = Array.from({ length: n }, (_, i) =&gt; i); <span class="c">// a column that is not shared points at itself</span>
  const small = [];
  const large = [];
  scaled.forEach((height, i) =&gt; (height &lt; 1 ? small : large).push(i));
  while (small.length &gt; 0 &amp;&amp; large.length &gt; 0) {
    const s = small.pop();
    const l = large.pop();
    accept[s] = scaled[s]; <span class="c">// column s keeps its own outcome with this probability</span>
    alias[s] = l; <span class="c">// and the rest of its height is filled by outcome l</span>
    scaled[l] = scaled[l] + scaled[s] - 1; <span class="c">// l gave away 1 - scaled[s] of its height</span>
    (scaled[l] &lt; 1 ? small : large).push(l);
  }
  return { accept, alias };
}

function pickAlias({ accept, alias }, rng) {
  const column = randInt(rng, accept.length);
  return rng() &lt; accept[column] ? column : alias[column];
}</code></pre>
<p class="sub">
  For the weights [1, 3, 6, 10] the tables are
  <code>accept = [0.2, 0.6, 1, 0.8]</code> and <code>alias = [3, 3, 2, 2]</code>.
  Adding up each outcome's share over the four columns gives the exact
  probabilities 0.05, 0.15, 0.30 and 0.50, which are 1, 3, 6 and 10 over 20. I
  also checked 500 random weight lists against that sum. It is rarely asked as
  code in an interview. Know that it exists, that the build is O(n), and that a
  pick costs O(1) instead of the O(log n) of binary search.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'll turn the weights into prefix
  sums, so each index owns a segment of a line as long as its weight. I draw a
  whole number below the total and binary search for the first prefix sum
  strictly greater than it. Setup is O(n), each pick is O(log n), and zero
  weights never get picked."
</div>

<h3>Rejection sampling: rand10 from rand7</h3>
<p>
  <b>Rejection sampling</b> builds a uniform choice on a target set T from a
  uniform choice on a bigger set U that contains it: draw from U, keep the draw
  if it lies in T, otherwise throw it away and draw again. Every accepted value
  is uniform on T. In every round each value of U is equally likely to be drawn, and whether a
  draw is kept depends only on whether it lies in T. So among the rounds that
  succeed, every value of T is equally likely: P(x) = (1/|U|) / (|T|/|U|) = 1/|T|. The expected
  number of rounds is |U| / |T|.
</p>
<p>
  The classic exercise: you are given <code>rand7()</code>, returning 1 to 7
  uniformly, and must build <code>rand10()</code>. Two natural attempts fail.
  Adding two calls gives 2 to 14 with a triangle of probabilities (in 100,000
  trials the sum 8 came out about 14% of the time and the sum 2 about 2%). Using
  <code>(rand7() + rand7()) % 10 + 1</code> gives counts from 8,069 to 14,200
  across the ten results in my run. By the counting test, no fixed number of
  calls can work, so a loop is required.
</p>
<p>
  Two calls make a base-7 number with two digits:
  <code>(a - 1) * 7 + b</code> takes each value from 1 to 49 with probability
  1/49. The values 1 to 40 divide evenly into ten groups of four. The values 41
  to 49 do not, so reject them and draw again.
</p>
<figure>
  <svg viewBox="0 0 640 175" class="dg" role="img" aria-label="The values 1 to 49 in a row: four green blocks of ten, 1 to 10 up to 31 to 40, kept and mapped to results 1 to 10, then one red block of nine, 41 to 49, rejected">
    <g class="rough">
      <rect class="boxg" x="40" y="50" width="100" height="44" />
      <rect class="boxg" x="140" y="50" width="100" height="44" />
      <rect class="boxg" x="240" y="50" width="100" height="44" />
      <rect class="boxg" x="340" y="50" width="100" height="44" />
      <rect class="boxr" x="440" y="50" width="90" height="44" />
    </g>
    <text class="sm" x="90" y="78" text-anchor="middle">1 to 10</text>
    <text class="sm" x="190" y="78" text-anchor="middle">11 to 20</text>
    <text class="sm" x="290" y="78" text-anchor="middle">21 to 30</text>
    <text class="sm" x="390" y="78" text-anchor="middle">31 to 40</text>
    <text class="sm rd" x="485" y="78" text-anchor="middle">41 to 49</text>
    <text class="sm gr" x="240" y="124" text-anchor="middle">kept: each result 1 to 10 appears 4 times</text>
    <text class="sm rd" x="485" y="124" text-anchor="middle">rejected</text>
    <text class="sm rd" x="485" y="146" text-anchor="middle">draw again</text>
  </svg>
  <figcaption>The 49 equally likely values of two rand7 calls. Forty of them split into four complete rounds of the results 1 to 10, and the nine left over are discarded.</figcaption>
</figure>
<pre><code>function rand10(rand7) {
  while (true) {
    const index = (rand7() - 1) * 7 + rand7(); <span class="c">// uniform on 1 .. 49</span>
    if (index &lt;= 40) return 1 + ((index - 1) % 10); <span class="c">// 40 is a multiple of 10</span>
  }
}

function makeRand10(rand7) {
  let leftover = 0; <span class="c">// uniform on 0 .. range - 1</span>
  let range = 1;
  return function rand10() {
    while (true) {
      while (range &lt; 10) {
        leftover = leftover * 7 + (rand7() - 1); <span class="c">// append one base-7 digit</span>
        range *= 7;
      }
      const usable = range - (range % 10);
      if (leftover &lt; usable) {
        const result = 1 + (leftover % 10);
        leftover = Math.floor(leftover / 10); <span class="c">// uniform on 0 .. usable / 10 - 1</span>
        range = usable / 10;
        return result;
      }
      leftover -= usable; <span class="c">// rejected: still uniform on what is left</span>
      range -= usable;
    }
  };
}</code></pre>
<h4>Dry run: the pairs (1,1), (6,5), (6,6), (7,7), (3,4)</h4>
<table>
  <tr><th>First call a</th><th>Second call b</th><th>index = (a - 1) * 7 + b</th><th>Decision</th><th>Result 1 + (index - 1) % 10</th></tr>
  <tr><td>1</td><td>1</td><td>1</td><td>keep</td><td>1</td></tr>
  <tr><td>6</td><td>5</td><td>40</td><td>keep</td><td>10</td></tr>
  <tr><td>6</td><td>6</td><td>41</td><td>reject</td><td>-</td></tr>
  <tr><td>7</td><td>7</td><td>49</td><td>reject</td><td>-</td></tr>
  <tr><td>3</td><td>4</td><td>18</td><td>keep</td><td>8</td></tr>
</table>
<p class="sub">
  Fed the script 6, 6, 7, 7, 3, 4, <code>rand10</code> rejects twice and
  returns 8. Counting all 49 pairs, each result from 1 to 10 appears exactly
  four times among the 40 kept, which is the whole proof. In 100,000 seeded
  calls the ten counts ranged from 9,828 to 10,200 (statistic 12.20 against
  27.88).
</p>
<h4>Expected cost, and what "worst case" means here</h4>
<p>
  A round uses two calls and is accepted with probability 40/49. The number of
  rounds is geometric with mean 49/40 = 1.225, so the expected number of
  <code>rand7</code> calls per <code>rand10</code> is 2 * 49/40 = 2.45. I
  measured 2.456 over 100,000 results. There is no worst-case bound: the chance
  of t rejections in a row is (9/49)<sup>t</sup>, which is tiny but never zero
  (for ten in a row it is about 4 in 100 million). The answer is always
  correct and only the running time is random. Algorithms with that property
  are called Las Vegas algorithms. Say "expected 2.45 calls, no hard cap".
</p>
<p>
  The follow-up is "reduce the number of calls". The rejected values are not
  waste: given a reject, the leftover is itself uniform on a smaller range, and
  you can keep it and append more base-7 digits instead of starting over.
  <code>makeRand10</code> keeps <code>leftover</code>, uniform on
  <code>0 .. range - 1</code>, and loops until a value below the largest
  multiple of 10 appears. It averaged 1.497 calls per result in 200,000 runs.
  Information theory puts a floor of log<sub>7</sub> 10, about 1.18, under any
  method. Its output counts were uniform (statistic 12.01), and counting 200,000
  pairs of consecutive results as 100 outcomes gave 102.7 against a critical
  value of 148.2, so successive results showed no dependence. Writing this
  version bug-free under pressure is hard: my first draft set the new range
  after an accepted value to <code>range / 10</code> instead of
  <code>usable / 10</code>, and the chi-square test flagged it at once with a
  statistic near 3,600. In an interview, the two-call
  version plus the sentence "I could reuse the rejected values to cut the
  expected calls" is a good answer.
</p>

<h3>Random point in a circle</h3>
<p>
  The problem: given a radius and a center, return a point uniformly random in
  the disc, meaning each region has probability in proportion to its area.
  Rejection sampling fits directly. Pick a point uniformly in the bounding
  square, which is easy, and keep it only if it falls inside the circle. The
  circle fills π/4 of its square, about 78.5%, so the expected number of
  tries is 4/π, about 1.27 (measured 1.275 over 200,000 points).
</p>
<pre><code>function pointInCircle(radius, cx, cy, rng) {
  while (true) {
    const x = (rng() * 2 - 1) * radius; <span class="c">// -radius .. radius</span>
    const y = (rng() * 2 - 1) * radius;
    if (x * x + y * y &lt;= radius * radius) return [cx + x, cy + y]; <span class="c">// keep only what falls inside the circle</span>
  }
}

function pointInCirclePolar(radius, cx, cy, rng) {
  const angle = rng() * 2 * Math.PI;
  const distance = radius * Math.sqrt(rng()); <span class="c">// the square root makes equal areas equally likely</span>
  return [cx + distance * Math.cos(angle), cy + distance * Math.sin(angle)];
}</code></pre>
<p>
  The direct method is shorter in the number of draws but easy to get wrong.
  Pick a uniform angle, then a distance. The tempting choice,
  <code>distance = radius * rng()</code>, is wrong: a ring at distance d with
  width dd has area about 2πd * dd, which grows with d, so equal distance ranges
  hold unequal areas. The probability that the distance is at most d has to
  equal the area fraction, (d / R)<sup>2</sup>. To draw a number with that
  distribution from a uniform u, solve u = (d / R)<sup>2</sup>, which gives
  <code>d = R * Math.sqrt(u)</code>.
</p>
<table>
  <tr><th>Method (200,000 points, <code>mulberry32(21)</code>, radius 10)</th><th>Share within half the radius (area says 25%)</th><th>Five equal-area rings: statistic (4 df, critical 18.47)</th></tr>
  <tr><td>Rejection from the square</td><td>24.93%</td><td>-</td></tr>
  <tr><td>Angle and <code>R * sqrt(u)</code></td><td>25.08%</td><td>4.09</td></tr>
  <tr><td>Angle and <code>R * u</code></td><td>50.12%</td><td>80,736</td></tr>
</table>
<p class="sub">
  The wrong formula puts half of all points inside the inner quarter of the
  area: the center is crowded. Four quadrant counts for the correct polar method
  were 49915, 50120, 50114 and 49851 (statistic 1.14). Both correct methods
  answer in O(1) expected time and O(1) space.
</p>

<h3>Random points in rectangles</h3>
<p>
  Now several non-overlapping rectangles, and the point must be uniform over
  their union with integer coordinates, corners and edges included. Picking a
  rectangle at random and then a point in it is wrong: a tiny rectangle would
  receive as many points as a huge one. The rectangle must be chosen with
  probability in proportion to the number of integer points it holds,
  <code>(x2 - x1 + 1) * (y2 - y1 + 1)</code>. That is a weighted pick, so reuse
  the previous section's machinery.
</p>
<pre><code>class RectanglePicker {
  constructor(rects, rng) {
    this.rects = rects; <span class="c">// [x1, y1, x2, y2], corners included, no two overlap</span>
    this.rng = rng;
    this.prefix = [];
    let running = 0;
    for (const [x1, y1, x2, y2] of rects) {
      running += (x2 - x1 + 1) * (y2 - y1 + 1); <span class="c">// whole-number points in this rectangle</span>
      this.prefix.push(running);
    }
  }

  pick() {
    const r = randInt(this.rng, this.prefix[this.prefix.length - 1]); <span class="c">// one point number out of all of them</span>
    const i = firstGreater(this.prefix, r);
    const [x1, y1, x2] = this.rects[i];
    const offset = r - (i === 0 ? 0 : this.prefix[i - 1]); <span class="c">// which point inside rectangle i</span>
    const width = x2 - x1 + 1;
    return [x1 + (offset % width), y1 + Math.floor(offset / width)];
  }
}</code></pre>
<p>
  One draw does both jobs. <code>r</code> numbers all the points in the union
  from 0 to total - 1, rectangle by rectangle. The binary search finds the
  rectangle, and the remainder <code>offset</code> numbers the points inside it
  row by row: column <code>offset % width</code>, row
  <code>floor(offset / width)</code>.
</p>
<h4>Dry run: rectangles [0,0,1,1] and [5,5,5,7]</h4>
<table>
  <tr><th>Rectangle</th><th>Size</th><th>Integer points</th><th>Prefix</th></tr>
  <tr><td>0: x 0 to 1, y 0 to 1</td><td>2 by 2</td><td>4</td><td>4</td></tr>
  <tr><td>1: x 5, y 5 to 7</td><td>1 by 3</td><td>3</td><td>7</td></tr>
</table>
<table>
  <tr><th>r</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th></tr>
  <tr><td>Rectangle</td><td>0</td><td>0</td><td>0</td><td>0</td><td>1</td><td>1</td><td>1</td></tr>
  <tr><td>Point</td><td>(0,0)</td><td>(1,0)</td><td>(0,1)</td><td>(1,1)</td><td>(5,5)</td><td>(5,6)</td><td>(5,7)</td></tr>
</table>
<p class="sub">
  All seven integer points appear exactly once, which I confirmed by the same
  enumeration on 200 random sets of non-overlapping rectangles. With 70,000
  seeded picks (<code>mulberry32(21)</code>) the seven counts ranged from 9,925
  to 10,107 (statistic 3.04, critical value 22.46). If the problem asked for a
  real-valued point instead, weight by area <code>w * h</code> and add
  <code>rng() * w</code> and <code>rng() * h</code> to the corner. Weighting a
  whole-number problem by area, or forgetting the <code>+ 1</code>, gives wrong
  odds with no error to catch them.
</p>

<h3>Random pick with a blacklist</h3>
<p>
  The problem: choose uniformly from <code>0 .. n - 1</code> excluding a
  blacklist, where n may be huge and the blacklist small, and keep the number of
  random calls to a minimum. Redrawing until the draw is not banned is correct
  rejection sampling, but when most numbers are banned the expected number of
  draws, n divided by the number of allowed values, is large. Building the list
  of allowed numbers costs O(n) memory.
</p>
<p>
  Let <code>size = n - blacklist.length</code> be the number of allowed values.
  Draw once from <code>0 .. size - 1</code>. Some banned numbers may lie in that
  range. Those are the holes, say h of them. The range below
  <code>size</code> then holds only <code>size - h</code> allowed numbers, so
  the other h allowed numbers must lie at or above <code>size</code>. Remap each
  hole to a distinct one of them.
</p>
<pre><code>class BlacklistPicker {
  constructor(n, blacklist, rng) {
    this.rng = rng;
    this.size = n - blacklist.length; <span class="c">// how many numbers are allowed</span>
    const banned = new Set(blacklist);
    this.remap = new Map();
    let spare = this.size; <span class="c">// the allowed numbers at or above size are the spares</span>
    for (const b of blacklist) {
      if (b &gt;= this.size) continue; <span class="c">// banned numbers up there are never drawn</span>
      while (banned.has(spare)) spare++;
      this.remap.set(b, spare++);
    }
  }

  pick() {
    const r = randInt(this.rng, this.size); <span class="c">// one call, always inside 0 .. size - 1</span>
    return this.remap.has(r) ? this.remap.get(r) : r;
  }
}</code></pre>
<h4>Dry run: n = 10 with blacklists [2, 3, 5] and [1, 7, 8]</h4>
<table>
  <tr><th>Blacklist</th><th>size</th><th>Holes below size</th><th>Spares (allowed values at or above size)</th><th>Remap</th></tr>
  <tr><td>[2, 3, 5]</td><td>7</td><td>2, 3, 5</td><td>7, 8, 9</td><td>2 to 7, 3 to 8, 5 to 9</td></tr>
  <tr><td>[1, 7, 8]</td><td>7</td><td>1 only (7 and 8 are not below 7)</td><td>9 (7 and 8 are banned and skipped)</td><td>1 to 9</td></tr>
</table>
<table>
  <tr><th>r</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th></tr>
  <tr><td>Result for [2, 3, 5]</td><td>0</td><td>1</td><td>7</td><td>8</td><td>4</td><td>9</td><td>6</td></tr>
  <tr><td>Result for [1, 7, 8]</td><td>0</td><td>9</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td></tr>
</table>
<p class="sub">
  Each row lists seven different allowed numbers, one per r, so a uniform r
  gives a uniform allowed number. I enumerated every possible blacklist for
  every n up to 9, and 300 random blacklists with n up to 60 (about 60% of the
  numbers banned), and the check "every allowed number appears exactly once as
  r runs over 0 .. size - 1" held each time. In 70,000 seeded picks
  (<code>mulberry32(3)</code>) for [2, 3, 5] the seven allowed numbers came
  out 9,887 to 10,133 times (statistic 4.62). Build is
  O(blacklist size), a pick is one random call and O(1), and memory is
  O(blacklist size). The details that matter are skipping the banned numbers
  while searching for spares, and ignoring blacklist entries at or above
  <code>size</code>, which can never be drawn.
</p>

<h3>Insert, delete, getRandom: a pointer</h3>
<p>
  A related design question asks for a set with O(1) insert, delete and
  <code>getRandom</code>. A hash set gives the first two but cannot return a
  random member without walking it. The standard answer is an array of the
  members plus a map from member to its index. <code>getRandom</code> is
  <code>items[randInt(rng, items.length)]</code>. Delete swaps the member with
  the last array element, updates the moved element's index in the map, and pops
  the end, so the array never has holes. It is uniform because every member sits
  in exactly one of the slots <code>0 .. length - 1</code> and the slot is chosen
  uniformly. The full code, the duplicates variant with a map from value to a
  set of indices, and the exercises are in the
  <a href="/dsa/dsa-design-problems">design problems chapter</a>.
</p>

<h3>Randomized quickselect: expected O(n), and what "expected" means</h3>
<p>
  The problem: find the k-th largest element of an unsorted array. Sorting
  works in O(n log n). A min-heap of size k works in O(n log k) with O(k)
  space. <b>Quickselect</b> does better on average by sorting only as much as it
  needs. Partition the array around a pivot, so smaller values go left and larger
  go right. The pivot then sits at its final sorted position. If that is the
  position you want, you are done. Otherwise the answer is in exactly one side,
  so recurse into that side alone and ignore the other. The partition steps shrink
  the live range from n to a part of n, and the work adds up to about a
  constant multiple of n instead of n log n.
</p>
<p>
  The pivot rule decides the cost. If you always take the first or last element,
  an already sorted array is the worst case: every partition peels off one
  element. I measured it. With the last element as pivot on a sorted array of
  20,000 numbers, looking for the minimum, the partitions examined 199,990,000
  elements, essentially n<sup>2</sup>/2 = 200,000,000. With a <b>random pivot</b> there is no input that is bad every time: the
  pivot is chosen after the input is fixed, by coin flips the input's author
  never sees, so a bad run needs a long streak of unlucky draws on any input.
</p>
<pre><code>function kthLargest(nums, k, rng) {
  const a = nums.slice();
  const target = a.length - k; <span class="c">// where the answer sits in sorted order</span>
  let lo = 0;
  let hi = a.length - 1;
  while (lo &lt; hi) {
    const pivot = a[lo + randInt(rng, hi - lo + 1)]; <span class="c">// a random value from the live range</span>
    let lt = lo; <span class="c">// a[lo .. lt - 1] &lt; pivot</span>
    let i = lo; <span class="c">// a[lt .. i - 1] === pivot</span>
    let gt = hi; <span class="c">// a[gt + 1 .. hi] &gt; pivot</span>
    while (i &lt;= gt) {
      if (a[i] &lt; pivot) {
        [a[lt], a[i]] = [a[i], a[lt]];
        lt++;
        i++;
      } else if (a[i] &gt; pivot) {
        [a[i], a[gt]] = [a[gt], a[i]];
        gt--;
      } else {
        i++;
      }
    }
    if (target &lt; lt) hi = lt - 1;
    else if (target &gt; gt) lo = gt + 1;
    else return pivot; <span class="c">// the target falls in the block of equal values</span>
  }
  return a[lo];
}</code></pre>
<p>
  The loop uses a three-way partition: values below the pivot go to the left
  block, values equal to it stay in the middle block, values above go to the right
  block. Three-way partition is not decoration. A two-way partition that sends
  all the equal values to one side degrades to n<sup>2</sup> on an array of
  equal elements, even with a random pivot, because every partition peels off
  a single element. With three blocks, all-equal input finishes in one pass:
  300,000 equal values took about 1 millisecond in my run. If the target index
  falls inside the middle block, the pivot's value is the answer.
</p>
<h4>Dry run: kthLargest([3, 2, 1, 5, 6, 4], 2) with the script 0.2, 0.9, 0.5, 0.1</h4>
<p>
  The target index in sorted order is 6 - 2 = 4 (the sorted array is
  1 2 3 4 5 6, and index 4 holds 5).
</p>
<table>
  <tr><th>Round</th><th>Live range</th><th>Draw</th><th>Pivot</th><th>Array after partition</th><th>Equal block</th><th>Decision</th></tr>
  <tr><td>1</td><td>0 to 5: 3,2,1,5,6,4</td><td>0.2, so offset 1</td><td>2</td><td>1 2 5 6 4 3</td><td>index 1</td><td>target 4 is right of it: lo = 2</td></tr>
  <tr><td>2</td><td>2 to 5: 5,6,4,3</td><td>0.9, so offset 3</td><td>3</td><td>1 2 3 4 6 5</td><td>index 2</td><td>target 4 is right of it: lo = 3</td></tr>
  <tr><td>3</td><td>3 to 5: 4,6,5</td><td>0.5, so offset 1</td><td>6</td><td>1 2 3 4 5 6</td><td>index 5</td><td>target 4 is left of it: hi = 4</td></tr>
  <tr><td>4</td><td>3 to 4: 4,5</td><td>0.1, so offset 0</td><td>4</td><td>1 2 3 4 5 6</td><td>index 3</td><td>target 4 is right of it: lo = 4</td></tr>
  <tr><td colspan="7">lo equals hi at index 4, so the answer is <code>a[4]</code> = 5</td></tr>
</table>
<p class="sub">
  It is a worked example of the invariant: the answer always lies in
  <code>a[lo .. hi]</code> and the range only shrinks. The function works on a
  copy, so the caller's array is untouched. The check against a sort-and-index
  brute force passed on 5,000 random arrays with many duplicates and negative
  values.
</p>
<h4>Why the expected time is O(n)</h4>
<p>
  Call a pivot <em>good</em> if its rank among the live elements is between a
  quarter and three quarters. Half of the possible pivots are good, so each
  round is good with probability about 1/2 (ignoring rounding). A good pivot leaves at most 3/4
  of the elements. Let E(n) be the largest expected total work on any input of
  size n, counting each element examined by a partition as one unit. Partitioning
  costs n. Then
</p>
<p>
  E(n) &lt;= n + (1/2) E(3n/4) + (1/2) E(n), which rearranges to
  E(n) &lt;= 2n + E(3n/4).
</p>
<p>
  Unrolling gives 2n * (1 + 3/4 + (3/4)<sup>2</sup> + ...) = 2n * 4 = 8n. The
  bound 8n is generous. Averaged over 200 random arrays, looking for the median,
  the partitions examined 3.45 times n elements at n = 1,000, 3.46 times n at
  10,000 and 3.30 times n at 100,000 (<code>mulberry32(2024)</code>). A random k
  gave about 3.0 to 3.2 times n.
</p>
<div class="warn">
  <span class="ttl">⚠ Say "expected" and mean it</span>
  The bound is on the average over the algorithm's own coin flips, for every
  input. It is not a promise about one run, and it is not an average over
  different inputs. A single run can be much more expensive than the
  expectation: the worst of my 200 runs at n = 10,000 took 9.3 times n, above
  the 8n bound on the mean. The worst case is still n<sup>2</sup>/2, if every pivot
  is an extreme. The chance of a long streak of bad pivots falls quickly, but I
  would not quote a number I had not computed. Do not confuse this with
  <em>amortized</em> cost, which is a worst-case guarantee over a sequence of
  operations with no randomness (a dynamic array's push), nor with the
  <em>average case</em> over random inputs, which a random pivot makes
  unnecessary.
</p>
<p>
  If the interviewer wants a hard guarantee, name the alternatives: a heap of
  size k gives O(n log k) worst case, and the median-of-medians pivot rule gives
  O(n) worst case with a larger constant, which is rarely worth writing in an
  interview. Randomized
  quicksort uses the same pivot rule and has expected cost about
  2 n ln n comparisons on distinct keys, which is about 1.39 n log<sub>2</sub> n.
  Practice for this section is in the
  <a href="/dsa/dsa-sorting-algorithms">sorting chapter</a>.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'll do quickselect with a random
  pivot and a three-way partition. It is expected O(n) time: each partition has
  a one-half chance of discarding a quarter of the array, which sums to at most
  8n. The worst case is still O(n squared), and the random pivot makes that
  unlikely on every input rather than impossible. If you need a worst-case
  bound I'd use a heap of size k, O(n log k)."
</div>

<h3>Hashing and sampling a stream</h3>
<p>
  Random choice is one way to sample. Hashing is another, and it answers a
  question reservoir sampling cannot: "does this key belong to the sample?" with
  no state at all. Hash the key and keep it if the hash falls below a threshold.
  The same key always gets the same answer, on every machine and every time it
  appears, so a sample of users keeps all of each sampled user's events and none
  of anyone else's.
</p>
<pre><code>function fnv1a(text) {
  let hash = 0x811c9dc5;
  for (let i = 0; i &lt; text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash &gt;&gt;&gt; 0;
}

function inSample(key, percent) {
  return fnv1a(key) % 100 &lt; percent; <span class="c">// the same key always gets the same answer</span>
}</code></pre>
<p class="sub">
  <code>fnv1a</code> is a simple non-cryptographic 32-bit hash. Over the keys
  <code>"user-0"</code> to <code>"user-99999"</code>, <code>inSample(key, 10)</code>
  kept 10,004 of 100,000. The remainder by 100 has the modulo bias from earlier,
  here about two parts in a hundred million, which does not matter.
</p>
<table>
  <tr><th></th><th>Reservoir sampling</th><th>Hash threshold</th></tr>
  <tr><td>Sample size</td><td>Exactly k</td><td>Random: about the rate times the number of distinct keys</td></tr>
  <tr><td>State</td><td>O(k) items</td><td>None</td></tr>
  <tr><td>Same key seen twice</td><td>Can be picked twice</td><td>Same decision every time</td></tr>
  <tr><td>Reproducible across machines</td><td>No, it depends on the order</td><td>Yes, for the same hash</td></tr>
  <tr><td>Depends on</td><td>The generator</td><td>The hash behaving like a uniform function of the key</td></tr>
</table>
<p class="sub">
  The hash version is only as random as the hash, and keys that are related
  (consecutive numbers with a weak hash) can fall unevenly. If you need exactly k
  <em>distinct</em> keys from a stream, keep the k keys with the smallest hash
  values: a repeated key hashes to the same value and cannot take a second slot.
  That structure, the "bottom-k" sketch, is also the basis of some
  distinct-count estimators.
</p>

<h3>Is this random enough? Answering in an interview</h3>
<p>
  "Is it really random?" is a question about the distribution, so answer it in
  that order, short and checkable.
</p>
<ul>
  <li><b>Name the target.</b> "Uniform over the n! orders", "each item with probability 1/n", "proportional to the weights".</li>
  <li><b>Count.</b> How many equally likely combinations of random choices, how many outcomes, does one divide the other? This rules out the naive shuffle and any fixed-call rand10 without code.</li>
  <li><b>Prove.</b> An induction (reservoir), a one-to-one map between choice sequences and outcomes (Fisher-Yates), or an area argument (circle).</li>
  <li><b>Test.</b> Inject the generator, run many trials with a fixed seed, compare counts with the expected counts using a chi-square statistic, and say what it cannot show: it detects a bias big enough for the trial count, and does not prove there is none.</li>
  <li><b>State the source's limits.</b> <code>Math.random</code> is approximately uniform and not secure. A seeded generator with b bits of seed can produce at most 2<sup>b</sup> different shuffles. A 32-bit seed allows 4,294,967,296 shuffles, fewer than 13! = 6,227,020,800, so it cannot reach every order of 13 items, and 52! needs about 226 bits (log<sub>2</sub> 52! is 225.6).</li>
</ul>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'd argue it's uniform by counting:
  each outcome comes from exactly one of the equally likely random sequences. Then
  I'd test it with a seeded generator and compare the counts to the expected
  counts. A passing test doesn't prove it, but a fixed seed makes the failure
  reproducible, and for anything security-related I'd use the platform's
  cryptographic source instead of <code>Math.random</code>."
</div>

<h3>Pitfalls that cost offers</h3>
<ul>
  <li>
    <b>The comparator shuffle.</b> <code>sort(() =&gt; Math.random() - 0.5)</code>
    is not uniform for any comparison sort, and is O(n log n) for a job that
    needs O(n).
  </li>
  <li>
    <b>Swapping with any position.</b> The naive shuffle draws from the whole
    array each time. The draw must come from the positions not yet fixed:
    <code>0 .. i</code>, not <code>0 .. n - 1</code>, and not
    <code>0 .. i - 1</code>.
  </li>
  <li>
    <b>Off-by-one in the reservoir.</b> The i-th item (counting from 1) replaces
    with probability 1/i. A zero-based counter needs <code>+ 1</code>. For
    k items the slot comes from <code>0 .. i - 1</code> and the test is
    <code>slot &lt; k</code>.
  </li>
  <li>
    <b>Using <code>%</code> or <code>Math.round</code> to scale.</b> Both can skew
    the counts. Use <code>Math.floor(rng() * n)</code>, and use rejection
    when you start from a small integer range.
  </li>
  <li>
    <b>Weighted pick off by one.</b> A strict greater-than search with r from
    0 to total - 1, or an at-least search with r from 1 to total. Mixing them
    changes the odds.
  </li>
  <li>
    <b>Picking the object first.</b> A random rectangle then a random point, or
    a random distance times <code>R</code>, favors small regions. Weight by what
    the problem counts: points for integer coordinates, area for real ones, and
    the square root of the area fraction for the radius.
  </li>
  <li>
    <b>Testing with <code>Math.random</code> inside.</b> You cannot replay it. Pass
    the generator in, script it for exact traces, seed it for counts.
  </li>
  <li>
    <b>A chi-square test with a missing outcome.</b> An outcome that never
    occurs has no count and silently lowers the statistic. List all outcomes.
  </li>
  <li>
    <b>Overselling "expected".</b> Quickselect is expected O(n) and worst-case
    O(n<sup>2</sup>). Rejection sampling has no worst-case bound on its calls.
    Say both parts.
  </li>
  <li>
    <b>Mutating the input.</b> Shuffle a copy unless the problem says in place,
    and keep the original for <code>reset()</code>.
  </li>
  <li>
    <b>A fixed pivot in quickselect, or a two-way partition with duplicates.</b>
    Sorted input, or an array of equal values, sends either to n<sup>2</sup>.
  </li>
  <li>
    <b>Reading secrets from <code>Math.random</code>.</b> Tokens, passwords and
    anything an attacker could benefit from guessing belong to
    <code>crypto.getRandomValues</code>.
  </li>
</ul>

<h3>Recognizing it in an unseen problem</h3>
<table>
  <tr><th>The prompt says</th><th>Reach for</th></tr>
  <tr><td>"shuffle", "random permutation", "random order", "deal cards"</td><td>Fisher-Yates from the back, a copy, <code>j</code> from <code>0 .. i</code></td></tr>
  <tr><td>"k random elements", "random sample without replacement" from an array</td><td>The first k steps of Fisher-Yates</td></tr>
  <tr><td>"stream", "unknown length", "one pass", "O(1) memory", "head of a linked list"</td><td>Reservoir sampling, k = 1 or k items</td></tr>
  <tr><td>"pick a random index with value x"</td><td>Reservoir over the matching positions, or a map of index lists if memory is free</td></tr>
  <tr><td>"proportional to weight", "probability w[i] / sum"</td><td>Prefix sums, a random whole number below the total, upper-bound binary search</td></tr>
  <tr><td>"build a fair X from a fair Y", "rand10 using rand7"</td><td>Check divisibility, then rejection sampling, maybe reusing leftovers</td></tr>
  <tr><td>"random point in a circle, ring, polygon, union of rectangles"</td><td>Rejection from a bounding box, or weight by area then sample the piece</td></tr>
  <tr><td>"random number excluding these values", "minimize calls to random"</td><td>Remap the holes to the spare allowed values: one call</td></tr>
  <tr><td>"insert, delete and getRandom in O(1)"</td><td>Array plus index map, swap with last</td></tr>
  <tr><td>"k-th largest, average linear time"</td><td>Random pivot, three-way partition, recurse into one side</td></tr>
  <tr><td>"sample users consistently", "same key, same decision"</td><td>Hash the key and compare with a threshold</td></tr>
  <tr><td>"is it really random?", "prove it is uniform"</td><td>Count outcomes against sequences, prove, then test with a seeded generator</td></tr>
</table>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Write <code>randInt(rng, n)</code> and <code>randBetween(rng, lo, hi)</code> from memory, and say what goes wrong with <code>Math.round</code>, with <code>% n</code> and with <code>| 0</code>.</li>
    <li>Apply the counting test to the naive shuffle, to rand10 from two rand7 calls, and to a coin-flip comparator, and say in one line why each cannot be uniform.</li>
    <li>Explain how to make randomness testable: pass the generator in, script it for an exact trace, seed it for counts, and read a chi-square statistic with its limits.</li>
    <li>Write Fisher-Yates and prove that every order has probability 1/n!, using the one-to-one map between choice sequences and arrays.</li>
    <li>Explain why <code>sort(() =&gt; Math.random() - 0.5)</code> is biased for every comparison sort, and what its measured bias looks like on three elements.</li>
    <li>Write reservoir sampling for k = 1 and for k items, and prove by induction that each item is held with probability 1/i or k/i.</li>
    <li>Solve random pick index and linked list random node in one pass with O(1) extra space, and compare them with a map of index lists.</li>
    <li>Turn weights into prefix sums and pick with a strict upper-bound binary search, and explain why the off-by-one with <code>&gt;=</code> changes the odds.</li>
    <li>Build rand10 from rand7 by rejection, state its expected number of calls (2.45) and why it has no worst-case bound.</li>
    <li>Pick a uniform point in a circle two ways, and explain why <code>R * u</code> clusters at the center and <code>R * sqrt(u)</code> does not.</li>
    <li>Pick uniformly over several rectangles by weighting with whole-number point counts, and pick from a blacklist in one random call by remapping the holes.</li>
    <li>Say where insert-delete-getRandom lives, and why swapping with the last element keeps every slot filled.</li>
    <li>Write randomized quickselect with a three-way partition and give the expected-versus-worst-case wording, including the 8n argument.</li>
    <li>Contrast hash-threshold sampling with reservoir sampling, and answer "is this random enough?" with target, count, proof, test and the limits of the source.</li>
  </ul>
</div>
`,
};
