import type { Chapter } from "../types";

export const dsaHashing: Chapter = {
  id: "dsa-hashing",
  num: "B3",
  title: "Hashing",
  short: "Hashing",
  levels: ["beginner"],
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

<h3>Watch the map build up, step by step</h3>
<p><code>nums = [2, 7, 11, 15]</code>, <code>target = 9</code> — trace every iteration:</p>
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
  V8's hash maps handle collisions internally, so you never write
  collision-resolution code. But a hash map's O(1) is an <em>average</em>
  case — a pathological hash function can degrade to O(n) per operation.
  You'll never need to defend against this in an interview, but "average
  case, not worst case" is the correct answer if asked.
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
</ul>`,
};
