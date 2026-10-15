import type { Chapter } from "../types";

export const dsaHashing: Chapter = {
  id: "dsa-hashing",
  num: "B5",
  title: "Hashing",
  short: "Hashing",
  levels: ["beginner"],
  prerequisites: ["dsa-arrays-strings"],
  practice: [
    "ex-two-sum",
    "ex-top-k-frequent",
    "ex-longest-consecutive-sequence",
    "ex-happy-number",
    "ex-ransom-note",
    "ex-intersection-of-two-arrays",
    "ex-intersection-of-two-arrays-ii",
    "ex-first-unique-character",
    "ex-word-frequency-top-k",
    "ex-valid-anagram",
    "ex-group-anagrams",
    "ex-isomorphic-strings",
    "ex-word-pattern",
    "ex-contains-duplicate-ii",
    "ex-four-sum-ii",
    "ex-group-shifted-strings",
    "ex-top-k-frequent-words",
    "ex-number-of-boomerangs",
    "ex-build-hashmap",
    "ex-subarray-sum-equals-k",
  ],
  ready: true,
  subtitle: "The single most common way an O(n²) brute force becomes O(n).",
  body: `<h3>What a hash map actually does</h3>
<p>
  A hash function turns a key into a number, and that number picks a
  "bucket" in an underlying array. Look-up doesn't search — it computes
  the bucket from the key and jumps straight there. That's why
  <code>Map</code>/<code>Set</code>/object lookups are O(1) average case:
  the cost of hashing the key doesn't grow with how many other keys are
  already stored.
</p>

<figure>
  <svg viewBox="0 0 640 220" class="dg" role="img" aria-label="A key being hashed to a bucket index, then stored in that bucket">
    <g class="rough">
      <rect class="boxg" x="20" y="20" width="120" height="50" rx="8" />
      <rect class="boxy" x="220" y="20" width="120" height="50" rx="8" />
      <rect class="box" x="60" y="120" width="60" height="40" />
      <rect class="box" x="120" y="120" width="60" height="40" />
      <rect class="box" x="180" y="120" width="60" height="40" />
      <rect class="box" x="240" y="120" width="60" height="40" />
      <rect class="box" x="300" y="120" width="60" height="40" />
    </g>
    <text class="lbl" x="80" y="50" text-anchor="middle" style="font-size:15px">key: "cat"</text>
    <text class="lbl" x="280" y="50" text-anchor="middle" style="font-size:15px">hash("cat") = 2</text>
    <text class="sm" x="90" y="145" text-anchor="middle">0</text>
    <text class="sm" x="150" y="145" text-anchor="middle">1</text>
    <text class="sm" x="210" y="145" text-anchor="middle">2</text>
    <text class="sm" x="270" y="145" text-anchor="middle">3</text>
    <text class="sm" x="330" y="145" text-anchor="middle">4</text>
    <text class="sm rd" x="210" y="200" text-anchor="middle">"cat" lands here — no scanning</text>
  </svg>
  <figcaption>The hash turns "which bucket" into arithmetic instead of a search.</figcaption>
</figure>

<h3>Map/Set vs plain objects</h3>
<table>
  <tr><th></th><th>Map / Set</th><th>Plain object</th></tr>
  <tr><td>Key types</td><td>anything (objects, NaN, etc.)</td><td>strings/symbols only — numbers get coerced</td></tr>
  <tr><td>Size</td><td><code>.size</code>, O(1)</td><td><code>Object.keys(o).length</code>, O(n)</td></tr>
  <tr><td>Iteration order</td><td>insertion order, guaranteed</td><td>mostly insertion order, but integer-like keys sort first</td></tr>
  <tr><td>Accidental prototype keys</td><td>impossible</td><td><code>"toString" in {}</code> is true</td></tr>
</table>
<p class="sub">
  In interviews, default to <code>Map</code>/<code>Set</code> unless
  there's a specific reason not to — it sidesteps a whole category of
  "wait, why is this key already there" bugs.</p>

<h3>The pattern: trade space for time</h3>
<p>
  Almost every "hashing" interview question is the same trade: spend O(n)
  space to remember what you've already seen, so a second O(n) pass (or
  even the same pass) can answer "have I seen this before?" in O(1)
  instead of O(n).
</p>
<pre><code><span class="c">// Two Sum — brute force: O(n²) time, O(1) space</span>
function twoSumSlow(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
}

<span class="c">// Two Sum — hashed: O(n) time, O(n) space</span>
function twoSumFast(nums, target) {
  const seen = new Map(); <span class="c">// value → index</span>
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
}</code></pre>

<h4>Dry run: twoSumFast([2, 7, 11, 15], 9)</h4>
<table>
  <tr><th>i</th><th>nums[i]</th><th>need = target − nums[i]</th><th>seen.has(need)?</th><th>action</th></tr>
  <tr><td>0</td><td>2</td><td>7</td><td>no — map is empty</td><td>store {2 → 0}</td></tr>
  <tr><td>1</td><td>7</td><td>2</td><td><b>yes</b> — seen.get(2) = 0</td><td>return [0, 1] ✓</td></tr>
</table>
<p class="sub">
  Notice the map is only ever <em>looked up</em> for the value we still
  need, and only ever <em>written</em> for values we've already passed.
  That single pass does the work a nested loop would need two passes
  (and O(n²) time) to do.
</p>

<div class="say">
  <span class="ttl">Say it like this →</span> "I'll trade O(n) space for a
  hash map so each lookup is O(1) instead of O(n) — that turns the O(n²)
  nested-loop version into a single O(n) pass."
</div>

<h3>Frequency counting — the other 80% of hashing questions</h3>
<pre><code>function frequency(arr) {
  const counts = new Map();
  for (const x of arr) {
    counts.set(x, (counts.get(x) || 0) + 1);
  }
  return counts;
}

<span class="c">// anagram check: same characters, same counts</span>
function isAnagram(a, b) {
  if (a.length !== b.length) return false;
  const counts = new Map();
  for (const c of a) counts.set(c, (counts.get(c) || 0) + 1);
  for (const c of b) {
    if (!counts.get(c)) return false;
    counts.set(c, counts.get(c) - 1);
  }
  return true;
}</code></pre>

<h3>Grouping — building a Map of arrays</h3>
<pre><code><span class="c">// group anagrams: same sorted letters → same bucket</span>
function groupAnagrams(words) {
  const groups = new Map();
  for (const word of words) {
    const key = [...word].sort().join("");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(word);
  }
  return [...groups.values()];
}</code></pre>

<div class="warn">
  <span class="ttl">⚠ Hash collisions aren't your problem, but worst case is</span>
  V8's hash maps handle collisions internally, so in a normal solution you
  never write collision-resolution code (the from-scratch section below is
  the exception). But a hash map's O(1) is an <em>average</em>
  case — a pathological hash function can degrade to O(n) per operation.
  You'll never need to defend against this in an interview, but "average
  case, not worst case" is the correct answer if asked.
</div>

<h3>Set membership: asking "is the neighbour here?"</h3>
<p>
  Many hashing problems do not need a count or an index, only the answer to
  "is this value present?". A <code>Set</code> gives that in O(1), and it
  changes what you can afford to do inside a loop. Two problems show it.
</p>
<p>
  <b>Longest consecutive sequence.</b> Given unsorted integers, find the
  length of the longest run of consecutive values, such as 1, 2, 3, 4,
  in O(n) time. Sorting gives O(n log n). With a set, you can ask
  "does <code>x + 1</code> exist?" directly, so a run can be walked one step
  at a time. The danger is walking the same run many times. If you start a
  walk from every element, the run 1, 2, ..., n is walked once from each of
  its n elements, n(n+1)/2 steps in all, O(n²). The fix is to start a walk only at the <b>beginning</b>
  of a run, which is a value whose predecessor is missing.
</p>
<pre><code>function longestConsecutive(nums) {
  const set = new Set(nums);
  let best = 0;
  for (const x of set) {
    if (set.has(x - 1)) continue;
    let length = 1;
    while (set.has(x + length)) length++;
    if (length &gt; best) best = length;
  }
  return best;
}</code></pre>
<h4>Dry run: longestConsecutive([100, 4, 200, 1, 3, 2])</h4>
<table>
  <tr><th>x</th><th>set.has(x − 1)?</th><th>walk</th><th>length</th></tr>
  <tr><td>100</td><td>no, so a run starts here</td><td>101 is missing</td><td>1</td></tr>
  <tr><td>4</td><td>yes (3), skip</td><td>none</td><td>-</td></tr>
  <tr><td>200</td><td>no, so a run starts here</td><td>201 is missing</td><td>1</td></tr>
  <tr><td>1</td><td>no, so a run starts here</td><td>2, 3, 4 are present, 5 is missing</td><td>4</td></tr>
  <tr><td>3</td><td>yes (2), skip</td><td>none</td><td>-</td></tr>
  <tr><td>2</td><td>yes (1), skip</td><td>none</td><td>-</td></tr>
</table>
<p class="sub">
  The answer is 4. Why this is O(n) even though there is a <code>while</code>
  inside a <code>for</code>: the inner loop only runs from a run's first
  element, and every value belongs to exactly one run, so across the whole
  call the inner steps visit each value at most once. The outer loop adds n
  more. Total at most 2n set lookups.
</p>
<div class="warn">
  <span class="ttl">⚠ Loop over the Set, not the array</span>
  The code iterates <code>set</code>, not <code>nums</code>. With duplicates,
  looping over the array repeats the walk for every copy of a run's start.
  For <code>[1, 1, 1, ..., 1, 2, 3, ..., n/2]</code> (n/2 copies of 1, then a
  run of n/2 values) that is n/2 walks of length n/2: for n = 20,000 the inner
  loop steps 100,000,000 times instead of about 10,000. Deduplicating through
  the <code>Set</code> first removes the problem.
</div>
<p>
  <b>Happy number.</b> Replace a number by the sum of the squares of its
  digits, and repeat. Does it reach 1, or loop forever? A set of the values
  already seen answers it: stop at 1 (happy), or at a value you have met
  before (a cycle, so never happy).
</p>
<pre><code>function digitSquareSum(n) {
  let sum = 0;
  while (n &gt; 0) {
    const digit = n % 10;
    sum += digit * digit;
    n = Math.floor(n / 10);
  }
  return sum;
}

function isHappy(n) {
  const seen = new Set();
  while (n !== 1 &amp;&amp; !seen.has(n)) {
    seen.add(n);
    n = digitSquareSum(n);
  }
  return n === 1;
}</code></pre>
<p class="sub">
  <code>isHappy(19)</code> follows 19 → 82 → 68 → 100 → 1 and returns
  <code>true</code>. <code>isHappy(2)</code> follows 2 → 4 → 16 → 37 → 58 →
  89 → 145 → 42 → 20 → 4 and meets the 4 again, so it returns
  <code>false</code>. The loop must end, because the sequence cannot grow
  forever: a number with d digits maps to at most 81 · d, which is smaller
  than the number itself from four digits up, and any number below 1,000
  maps to at most 243. So every sequence lives in a finite range, and a
  finite range forces either 1 or a repeat. The set costs O(1) extra per
  step; remembering nothing and detecting the cycle with a slow and a fast
  pointer (see <a href="/dsa/dsa-two-pointers">Two pointers</a>) trades the
  set for O(1) space.
</p>

<h3>Top-k frequent: count, then bucket by frequency</h3>
<p>
  "Return the k most frequent values" has a standard first half: count every
  value with a <code>Map</code>, which costs O(n). The second half, picking
  the top k counts, can be done in several ways, and the comparison is a
  classic interview discussion.
</p>
<table>
  <tr><th>Second half</th><th>Time (m distinct values)</th><th>Extra space</th><th>Note</th></tr>
  <tr><td>Sort all (value, count) pairs</td><td>O(m log m)</td><td>O(m)</td><td>simplest; fine when m is small</td></tr>
  <tr><td>Min-heap of size k</td><td>O(m log k)</td><td>O(k) beyond the map</td><td>best when k is much smaller than m; see <a href="/dsa/dsa-heaps-priority-queues">heaps</a></td></tr>
  <tr><td>Bucket by frequency</td><td>O(n)</td><td>O(n)</td><td>works because a count is a small integer</td></tr>
</table>
<p>
  The bucket idea: a count can only be a whole number from 1 to n, so make an
  array indexed by count, and put each value in the bucket of its count. The
  most frequent values then sit in the highest buckets; read from the top
  until you have k. It is counting sort applied to the counts themselves.
</p>
<pre><code>function topKFrequent(nums, k) {
  const counts = new Map();
  for (const x of nums) counts.set(x, (counts.get(x) || 0) + 1);

  const buckets = Array.from({ length: nums.length + 1 }, () =&gt; []);
  for (const [value, count] of counts) buckets[count].push(value);

  const out = [];
  for (let count = buckets.length - 1; count &gt;= 1 &amp;&amp; out.length &lt; k; count--) {
    for (const value of buckets[count]) {
      out.push(value);
      if (out.length === k) break;
    }
  }
  return out;
}</code></pre>
<h4>Dry run: topKFrequent([1, 1, 1, 2, 2, 3], 2)</h4>
<table>
  <tr><th>step</th><th>state</th></tr>
  <tr><td>count</td><td>Map {1 → 3, 2 → 2, 3 → 1}</td></tr>
  <tr><td>bucket</td><td>buckets[1] = [3], buckets[2] = [2], buckets[3] = [1], every other bucket is empty (indexes 0 to 6)</td></tr>
  <tr><td>read from index 6 down</td><td>buckets 6, 5, 4 are empty</td></tr>
  <tr><td>count = 3</td><td>take 1; out = [1]</td></tr>
  <tr><td>count = 2</td><td>take 2; out = [1, 2]; length is k, stop</td></tr>
</table>
<p class="sub">
  Time O(n): counting n values, filling at most m buckets, and reading at most
  n + 1 buckets, with O(n) extra space for the buckets. When the boundary
  bucket holds more values than there are slots left, the statement has to
  say which to take: if it guarantees a unique answer there is no such tie,
  and if it asks for, say, alphabetical order among ties, sort the values
  inside each bucket.
</p>
<div class="warn">
  <span class="ttl">⚠ Do not fill the buckets with one shared array</span>
  <code>new Array(n + 1).fill([])</code> puts the <em>same</em> array into every
  slot, so a push to <code>buckets[2]</code> shows up in every bucket. Create
  each one with <code>Array.from(..., () =&gt; [])</code>, the same fix as the
  shared-row bug for 2D grids in
  <a href="/dsa/dsa-arrays-strings">Arrays &amp; strings</a>.
</div>

<h3>Canonical keys: make things that are equal look equal</h3>
<p>
  Grouping problems ask which items are "the same" in some sense: anagrams,
  shifted strings, patterns with the same shape. The hashing recipe is to
  compute a <b>canonical key</b> for each item, a value that is identical for
  every item in the same class and different for items in different classes,
  and then group by that key in a <code>Map</code>. The sorted-letters key
  from the grouping section above is one. Its cost is O(L log L) per word of
  length L. Counting letters gives a faster one:
</p>
<pre><code>function groupAnagramsByCount(words) {
  const groups = new Map();
  for (const word of words) {
    const counts = new Array(26).fill(0);
    for (const ch of word) counts[ch.charCodeAt(0) - 97]++;
    const key = counts.join("#");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(word);
  }
  return [...groups.values()];
}</code></pre>
<p class="sub">
  Building a key costs O(L + 26) per word, so the whole grouping is
  O(n · (L + 26)), against O(n · L log L) for sorting each word. The
  <code>"#"</code> separator is not decoration. Without it, the count lists
  <code>[1, 11]</code> and <code>[11, 1]</code> would both join to
  <code>"111"</code>, and two different words would share a key. A good key
  has three properties: equal items give equal keys; different items give
  different keys (so separators or fixed widths); and building it is cheap.
</p>
<p>
  The same recipe handles "shifted" strings (<code>"abc"</code> and
  <code>"bcd"</code> are the same shape). Describe a word by the gaps between
  neighbouring letters instead of the letters themselves:
</p>
<pre><code>function shiftKey(word) {
  const diffs = [];
  for (let i = 1; i &lt; word.length; i++) {
    diffs.push((word.charCodeAt(i) - word.charCodeAt(i - 1) + 26) % 26);
  }
  return diffs.join(",");
}</code></pre>
<p class="sub">
  <code>shiftKey("abc")</code> and <code>shiftKey("bcd")</code> are both
  <code>"1,1"</code>; <code>shiftKey("az")</code> is <code>"25"</code> and
  <code>shiftKey("ba")</code> is <code>"25"</code> too, because the
  <code>+ 26</code> and <code>% 26</code> wrap the gap around the end of the
  alphabet. A single letter has no gaps, so its key is the empty string, and
  all single-letter words land in one group, which is right since each is a
  shift of the other.
</p>

<h3>Bijections: two maps for isomorphic strings and word patterns</h3>
<p>
  Some problems need a <b>one-to-one correspondence</b>, not just "same
  group". <code>"egg"</code> and <code>"add"</code> are isomorphic: replace
  e with a and g with d, and no two different letters may map to the same
  letter. One map is not enough. With only a forward map from s to t, the
  strings <code>"bar"</code> and <code>"foo"</code> pass, because b → f,
  a → o and r → o are each consistent, even though two different letters
  collide on o. A second map, in the opposite direction, catches that.
</p>
<pre><code>function isIsomorphic(s, t) {
  if (s.length !== t.length) return false;
  const forward = new Map();
  const backward = new Map();
  for (let i = 0; i &lt; s.length; i++) {
    const a = s[i];
    const b = t[i];
    if (forward.has(a) &amp;&amp; forward.get(a) !== b) return false;
    if (backward.has(b) &amp;&amp; backward.get(b) !== a) return false;
    forward.set(a, b);
    backward.set(b, a);
  }
  return true;
}</code></pre>
<h4>Dry run: isIsomorphic("bar", "foo")</h4>
<table>
  <tr><th>i</th><th>a → b</th><th>forward check</th><th>backward check</th></tr>
  <tr><td>0</td><td>b → f</td><td>b is new</td><td>f is new; store b→f and f→b</td></tr>
  <tr><td>1</td><td>a → o</td><td>a is new</td><td>o is new; store a→o and o→a</td></tr>
  <tr><td>2</td><td>r → o</td><td>r is new</td><td>backward.get("o") is "a", not "r": return false</td></tr>
</table>
<p class="sub">
  Word pattern is the same problem with a pattern letter on one side and a
  whole word, from <code>s.split(" ")</code>, on the other. Check that the
  number of words equals the pattern length first, or the loop will compare
  against <code>undefined</code>. An equivalent approach is a canonical key:
  replace each character by the index of its first appearance, so
  <code>"egg"</code> and <code>"add"</code> both become <code>[0, 1, 1]</code>,
  and compare the two lists. The two-map version stops at the first conflict
  and is easier to explain under pressure.
</p>

<h3>Composite keys: a Map compares objects by reference</h3>
<p>
  A <code>Map</code> or <code>Set</code> treats two objects as the same key
  only if they are <em>the same object</em>. Arrays are objects, so a pair of
  coordinates stored as an array is never found again:
</p>
<pre><code>const visited = new Set();
visited.add([1, 2]);
visited.has([1, 2]);  <span class="c">// false: a different array that merely looks equal</span></code></pre>
<p>
  The fix is to turn the composite value into a primitive key that is equal
  exactly when the parts are equal. There are three options:
</p>
<ul>
  <li><b>A string</b>, such as <code>x + "," + y</code>. Easy, and works for
    any number of parts. The separator is required: <code>"1" + "11"</code>
    and <code>"11" + "1"</code> are the same string without it. Building the
    string costs O(length), and hashing it costs the same.</li>
  <li><b>A number</b>, such as <code>row * cols + col</code>, when both parts
    have known bounds. It is the fastest, and it needs
    <code>0 &lt;= col &lt; cols</code> to be one-to-one.</li>
  <li><b>Nested maps</b> (a <code>Map</code> from x to a <code>Map</code> or
    <code>Set</code> of y). No string building, but more code.</li>
</ul>
<pre><code>function distinctVisited(moves) {
  let x = 0;
  let y = 0;
  const seen = new Set(["0,0"]);
  for (const move of moves) {
    if (move === "U") y++;
    else if (move === "D") y--;
    else if (move === "L") x--;
    else x++;
    seen.add(x + "," + y);
  }
  return seen.size;
}</code></pre>
<p class="sub">
  <code>distinctVisited("UDUD")</code> visits (0,0), (0,1), (0,0), (0,1),
  (0,0), so the set holds 2 keys and the function returns 2. Negative
  coordinates are fine with a separator: the keys <code>"-1,0"</code> and
  <code>"1,0"</code> are different strings. <code>JSON.stringify([x, y])</code>
  also works as a key but is slower, and is only safe for plain arrays and
  objects built in a consistent order.
</p>
<div class="warn">
  <span class="ttl">⚠ The silent miss</span>
  A <code>Set</code> of arrays never throws and never warns. It just answers
  "not found", so a visited-set BFS stores every state again and again and
  runs forever or blows up in memory. If a hashing solution is mysteriously
  slow or never terminates, check first whether the keys are objects.
</div>

<h3>Complement lookups: find each value's partner</h3>
<p>
  Two Sum is one case of a wider pattern: for each item, compute the partner
  that would complete the answer, then ask the map whether it exists. Two
  variations show how far it stretches.
</p>
<p>
  <b>4Sum II.</b> Four arrays a, b, c, d of length n each. Count the tuples
  (i, j, k, l) with <code>a[i] + b[j] + c[k] + d[l] === 0</code>. Four nested
  loops cost O(n⁴). Split the problem in two halves: the sums of an a-element
  and a b-element on one side, and of a c-element and a d-element on the
  other. The tuple works exactly when the left sum is the negative of the
  right sum. Store the left sums with their counts, then look up the negative
  of each right sum.
</p>
<pre><code>function fourSumCount(a, b, c, d) {
  const sums = new Map();
  for (const x of a) {
    for (const y of b) {
      const sum = x + y;
      sums.set(sum, (sums.get(sum) || 0) + 1);
    }
  }
  let count = 0;
  for (const x of c) {
    for (const y of d) {
      count += sums.get(-(x + y)) || 0;
    }
  }
  return count;
}</code></pre>
<p class="sub">
  Time O(n²) and space O(n²) for the map of pair sums. Take
  <code>a = [1, 2]</code>, <code>b = [-2, -1]</code>, <code>c = [-1, 2]</code>
  and <code>d = [0, 2]</code>. The sums of an a-element and a b-element are
  -1, 0, 0 and 1, stored as <code>{-1: 1, 0: 2, 1: 1}</code>. The sums of a
  c-element and a d-element are -1, 1, 2 and 4. Their negatives are 1, -1,
  -2 and -4: the lookup of 1 finds one pair and the lookup of -1 finds one,
  while -2 and -4 find nothing, so the count is 2. A detail to trust: when
  <code>x + y</code> is 0, <code>-(x + y)</code> is <code>-0</code>, and a
  <code>Map</code> treats 0 and -0 as the same key, so the lookup still finds
  a stored 0.
</p>
<p>
  <b>Contains duplicate II.</b> Is there a value that appears twice with the
  two positions at most k apart? For each element, the only earlier position
  that matters is the <em>nearest</em> one, the most recent time the same value
  appeared. A map from value to last index holds exactly that.
</p>
<pre><code>function containsNearbyDuplicate(nums, k) {
  const lastIndex = new Map();
  for (let i = 0; i &lt; nums.length; i++) {
    if (lastIndex.has(nums[i]) &amp;&amp; i - lastIndex.get(nums[i]) &lt;= k) {
      return true;
    }
    lastIndex.set(nums[i], i);
  }
  return false;
}</code></pre>
<p class="sub">
  <code>containsNearbyDuplicate([1, 0, 1, 1], 1)</code> reaches the third
  element, finds last index 0 and distance 2 (too far), then <em>overwrites</em>
  the stored index with 2, and at the fourth element finds distance 1 and
  returns <code>true</code>. Skipping that overwrite, keeping the first index,
  is the usual bug: it would compare against 0 and miss the pair. The same
  question can be answered with a window: a <code>Set</code> of the last k
  values, adding <code>nums[i]</code> and removing <code>nums[i − k]</code>,
  which uses O(k) space.
</p>
<p class="sub">
  Counting <em>subarrays</em> whose sum is a target is the complement idea
  applied to running totals (the partner of a prefix sum is the prefix sum
  minus the target). That is the main technique of
  <a href="/dsa/dsa-prefix-sums">Prefix sums</a>.
</p>

<h3>How a hash map works inside: buckets, collisions and resizing</h3>
<p>
  The opening section said a key picks a bucket. Here is the rest of the
  story, using the textbook design. Real engines vary in the details, but the
  costs below are why "average O(1)" is the honest claim.
</p>
<ol>
  <li><b>Hash.</b> A hash function turns the key into a large integer. Equal
    keys must give equal hashes; different keys should spread out.</li>
  <li><b>Bucket.</b> Reduce the hash to a position: <code>hash % capacity</code>.
    The table is an array of <code>capacity</code> buckets.</li>
  <li><b>Collision.</b> Two different keys can land in the same bucket. In
    <b>chaining</b>, each bucket holds a small list of its entries; a lookup
    goes to the bucket and walks that list, comparing keys. (The other common
    design, open addressing, probes neighbouring slots instead.)</li>
  <li><b>Resize.</b> Let the <b>load factor</b> be size ÷ capacity. When it
    passes a threshold (0.75 is a common choice), allocate a table with twice
    the capacity and re-insert every entry, because the bucket depends on the
    capacity. This costs O(n) but happens rarely.</li>
</ol>
<p>
  With a good hash and a bounded load factor, the lists stay short (the
  average length is the load factor, below 1), so lookup, insert and delete
  take O(1) on average. The resize is the same doubling argument as the
  array's <code>push</code>: expensive occasionally, amortized O(1) per
  insert (see <a href="/dsa/dsa-complexity-analysis">Complexity analysis</a>).
  The worst case is every key in one bucket: O(n) per operation. A bad hash
  function, or keys chosen by an adversary who knows the hash, can cause it,
  which is why production hash tables seed or randomize their hashing.
</p>
<p>What counts as "the same key" is a language decision, and JavaScript has specific rules:</p>
<table>
  <tr><th>Question</th><th>Map / Set</th><th>Plain object</th></tr>
  <tr><td>Is <code>NaN</code> found again?</td><td>yes: <code>new Set([NaN]).has(NaN)</code> is <code>true</code></td><td>the key becomes the string <code>"NaN"</code></td></tr>
  <tr><td>Are <code>0</code> and <code>-0</code> the same key?</td><td>yes, they are the same key</td><td>yes, both become <code>"0"</code></td></tr>
  <tr><td>Are <code>1</code> and <code>"1"</code> the same key?</td><td>no, two different keys</td><td>yes, both become <code>"1"</code></td></tr>
  <tr><td>Are two equal-looking arrays the same key?</td><td>no, only the same object is</td><td>both become the same string, such as <code>"1,2"</code></td></tr>
</table>
<p class="sub">
  <code>Map</code> and <code>Set</code> compare keys with a rule called
  SameValueZero. It differs from <code>===</code> in exactly one way that
  matters: <code>NaN</code> equals <code>NaN</code>. That is also why
  <code>[NaN].includes(NaN)</code> is <code>true</code> while
  <code>[NaN].indexOf(NaN)</code> is <code>-1</code>: <code>includes</code>
  uses SameValueZero and <code>indexOf</code> uses <code>===</code>. A
  <code>Map</code> also remembers insertion order, and re-inserting an
  existing key keeps its place, but deleting a key and adding it again moves
  it to the end.
</p>

<h3>Build a HashMap from scratch</h3>
<p>
  Interviewers like "implement a hash map" because it checks that you know
  what the library hides. The design below uses string keys, chaining, a
  polynomial string hash, and doubling at load factor 0.75.
</p>
<pre><code>function hashString(s) {
  let h = 0;
  for (let i = 0; i &lt; s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) &gt;&gt;&gt; 0;
  }
  return h;
}

class ChainedMap {
  constructor() {
    this.capacity = 8;
    this.size = 0;
    this.buckets = Array.from({ length: this.capacity }, () =&gt; []);
  }

  indexFor(key, capacity) {
    return hashString(key) % capacity;
  }

  get(key) {
    const bucket = this.buckets[this.indexFor(key, this.capacity)];
    for (const entry of bucket) {
      if (entry[0] === key) return entry[1];
    }
    return undefined;
  }

  has(key) {
    const bucket = this.buckets[this.indexFor(key, this.capacity)];
    return bucket.some((entry) =&gt; entry[0] === key);
  }

  put(key, value) {
    const bucket = this.buckets[this.indexFor(key, this.capacity)];
    for (const entry of bucket) {
      if (entry[0] === key) {
        entry[1] = value;
        return;
      }
    }
    bucket.push([key, value]);
    this.size++;
    if (this.size &gt; this.capacity * 0.75) this.grow();
  }

  remove(key) {
    const bucket = this.buckets[this.indexFor(key, this.capacity)];
    for (let i = 0; i &lt; bucket.length; i++) {
      if (bucket[i][0] === key) {
        bucket.splice(i, 1);
        this.size--;
        return true;
      }
    }
    return false;
  }

  grow() {
    const bigger = this.capacity * 2;
    const next = Array.from({ length: bigger }, () =&gt; []);
    for (const bucket of this.buckets) {
      for (const entry of bucket) {
        next[this.indexFor(entry[0], bigger)].push(entry);
      }
    }
    this.buckets = next;
    this.capacity = bigger;
  }
}</code></pre>
<p>
  The hash multiplies the running value by 31 and adds the next character
  code, the same polynomial idea as the string hashes of the
  <a href="/dsa/dsa-string-algorithms">string algorithms</a> chapter.
  The <code>&gt;&gt;&gt; 0</code> keeps the value an unsigned 32-bit integer,
  and the product stays far below 2<sup>53</sup>, so the arithmetic is exact.
  For <code>"cat"</code> the hash is 98,262, which is bucket 6 of 8; for
  <code>"act"</code> it is bucket 2; and for <code>"tac"</code> it is bucket 6
  again.
</p>
<h4>Dry run: three puts, then a collision and a lookup</h4>
<table>
  <tr><th>call</th><th>bucket</th><th>buckets afterwards (non-empty)</th><th>size</th></tr>
  <tr><td>put("cat", 1)</td><td>6</td><td>6: [cat]</td><td>1</td></tr>
  <tr><td>put("act", 2)</td><td>2</td><td>2: [act], 6: [cat]</td><td>2</td></tr>
  <tr><td>put("tac", 3)</td><td>6</td><td>2: [act], 6: [cat, tac]</td><td>3</td></tr>
  <tr><td>get("tac")</td><td>6</td><td>walks cat (no match), then tac: returns 3</td><td>3</td></tr>
  <tr><td>put("cat", 9)</td><td>6</td><td>cat found, value replaced, nothing appended</td><td>3</td></tr>
</table>
<p class="sub">
  The two clashing keys share bucket 6, and the <code>get</code> has to compare
  keys to tell them apart: the bucket only narrows the search. The resizes
  happen at the 7th insertion (size 7 is more than 0.75 × 8 = 6, so capacity
  goes 8 → 16) and the 13th (13 is more than 12, so 16 → 32). With 1,000
  keys such as <code>"user0"</code> through <code>"user999"</code> the table
  ends at capacity 2,048 with a longest chain of 3.
</p>
<div class="warn">
  <span class="ttl">⚠ Where hand-written hash maps go wrong</span>
  <b>Copying the buckets on resize.</b> Each entry's bucket depends on the
  capacity, so it must be re-hashed into the new table. Moving the old lists
  across unchanged puts entries where lookups will not find them.
  <b>Appending on a repeated key.</b> <code>put</code> must update an existing
  entry, or the size over-counts and the old value is still returned.
  <b>Forgetting to shrink <code>size</code> on remove</b>, which makes the load
  factor drift upward. <b>Using the raw hash</b> as an index: it can be
  larger than the table, or negative if you let the arithmetic go signed.
</div>

<h3>When hashing is the wrong tool</h3>
<ul>
  <li><b>You need order</b> — a hash map doesn't sort. If the question
    wants sorted output or range queries, you likely want a sorted
    structure (or a heap) instead.</li>
  <li><b>You need the closest match, not an exact one</b> — hashing only
    answers "is this exact key present." Nearest-value questions want
    binary search on a sorted structure.</li>
  <li><b>Memory is the actual constraint</b> — if the problem explicitly
    asks for O(1) space, a hash map is disqualified by definition.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Explain why a hash map lookup is O(1) average case, in terms of what the hash function actually does.</li>
    <li>Trace <code>twoSumFast</code> on a new array by hand, tracking exactly what's in <code>seen</code> at each step.</li>
    <li>Write a frequency counter and an anagram check from memory, using the same "count then compare" shape.</li>
    <li>Say out loud why "average case, not worst case" is the correct caveat on hash map complexity.</li>
    <li>Given a new problem, recognize when hashing is the wrong tool — because it needs order or a closest match, not an exact key.</li>
    <li>Solve longest consecutive sequence by starting a walk only where a run begins, and explain why looping over the array instead of the <code>Set</code> can turn it quadratic.</li>
    <li>Pick between sorting, a size-k heap and frequency buckets for top-k, and say what each costs.</li>
    <li>Design a canonical key for anagrams or shifted strings, and say why the key needs a separator; use two maps when the mapping must be one-to-one.</li>
    <li>Explain why <code>new Set([[1, 2]]).has([1, 2])</code> is <code>false</code>, and turn a coordinate pair into a key that works.</li>
    <li>Split a four-way sum into two pair-sum maps, and keep the nearest index when a window limit matters.</li>
    <li>Describe buckets, collisions, load factor and resizing, and write a chained hash map whose resize re-hashes every entry.</li>
  </ul>
</div>`,
};
