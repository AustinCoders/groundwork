import type { Chapter } from "../types";

export const dsaBitManipulation: Chapter = {
  id: "dsa-bit-manipulation",
  num: "I11",
  title: "Bit manipulation",
  short: "Bit manipulation",
  levels: ["intermediate"],
  practice: [
    "ex-single-number",
    "ex-single-number-three-times",
    "ex-missing-number-xor",
    "ex-hamming-weight",
    "ex-counting-bits",
    "ex-reverse-bits",
    "ex-power-of-two",
    "ex-power-of-four",
    "ex-bitwise-and-of-range",
    "ex-sum-of-two-integers",
    "ex-divide-two-integers",
    "ex-gray-code",
    "ex-utf8-validation",
    "ex-count-triplets-equal-xor",
    "ex-min-flips-a-or-b-equals-c",
    "ex-xor-sum-of-pairwise-and",
    "ex-decode-xored-array",
    "ex-xor-queries-of-a-subarray",
  ],
  ready: true,
  subtitle: "A small, fixed toolkit of tricks that turn up constantly once you recognize them.",
  body: `<h3>The operators, and what they actually do</h3>
<figure>
  <svg viewBox="0 0 640 130" class="dg" role="img" aria-label="Bitwise AND, OR, and XOR truth tables shown as aligned bit rows for the numbers 6 and 3">
    <text class="lbl" x="20" y="20" style="font-size:14px">6 = 110</text>
    <text class="lbl" x="20" y="40" style="font-size:14px">3 = 011</text>
    <text class="sm" x="140" y="30">AND (&amp;): 010 = 2 — 1 only where BOTH have a 1</text>
    <text class="sm" x="140" y="55">OR  (|): 111 = 7 — 1 where EITHER has a 1</text>
    <text class="sm" x="140" y="80">XOR (^): 101 = 5 — 1 where they DIFFER</text>
    <text class="sm" x="140" y="105">NOT (~): flips every bit — ~6 = -7 (two's complement)</text>
  </svg>
  <figcaption>Same two operands, four completely different results depending on the operator.</figcaption>
</figure>
<table>
  <tr><th>Operator</th><th>Symbol</th><th>Common use</th></tr>
  <tr><td>AND</td><td><code>&amp;</code></td><td>check/clear specific bits</td></tr>
  <tr><td>OR</td><td><code>|</code></td><td>set specific bits</td></tr>
  <tr><td>XOR</td><td><code>^</code></td><td>toggle bits, find "the one that's different"</td></tr>
  <tr><td>NOT</td><td><code>~</code></td><td>flip every bit (rarely used alone)</td></tr>
  <tr><td>Left shift</td><td><code>&lt;&lt;</code></td><td>multiply by 2 per shift — <code>x &lt;&lt; 1 === x * 2</code></td></tr>
  <tr><td>Right shift</td><td><code>&gt;&gt;</code></td><td>divide by 2 per shift (rounds toward -∞)</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ JS bitwise ops force numbers to 32-bit signed integers</span>
  <code>2 ** 32 | 0</code> is <code>0</code>, not <code>4294967296</code> —
  every bitwise operator first converts its operands to a 32-bit signed
  int. This is exactly why <code>x | 0</code> is a common (if now
  old-fashioned) "truncate toward zero" trick, and why bit tricks silently
  break on numbers bigger than 32 bits.
</div>

<h3>Trick 1 — XOR cancels itself out</h3>
<p>
  <code>x ^ x === 0</code> and <code>x ^ 0 === x</code>, for any
  <code>x</code>. XOR-ing a whole list together makes every value that
  appears an even number of times vanish, leaving only what's left over.
</p>
<pre><code><span class="c">// find the single number that doesn't appear exactly twice — O(n) time, O(1) space</span>
function singleNumber(nums) {
  let result = 0;
  for (const num of nums) result ^= num; <span class="c">// every pair cancels to 0</span>
  return result; <span class="c">// whatever's left is the unpaired one</span>
}</code></pre>
<p class="sub">
  This is a genuinely elegant O(1)-space answer to a problem that looks
  like it needs a hash set (O(n) space) — worth recognizing "appears an
  even number of times except one" as an XOR tell.
</p>

<h3>Trick 2 — check, set, and clear a specific bit</h3>
<pre><code>function getBit(num, i)   { return (num >> i) & 1; }        <span class="c">// is bit i a 1?</span>
function setBit(num, i)   { return num | (1 << i); }         <span class="c">// force bit i to 1</span>
function clearBit(num, i) { return num & ~(1 << i); }         <span class="c">// force bit i to 0</span>
function toggleBit(num, i){ return num ^ (1 << i); }          <span class="c">// flip bit i</span></code></pre>
<p class="sub">
  <code>1 &lt;&lt; i</code> builds a number that's all zeros except a single
  1 at position <code>i</code> — every one of these four operations is
  just combining that "mask" with the original number using the right
  bitwise operator.
</p>

<h3>Trick 3 — the lowest set bit, and counting set bits</h3>
<pre><code><span class="c">// n & (n - 1) clears the LOWEST set bit — used constantly</span>
function countSetBits(n) {
  let count = 0;
  while (n !== 0) {
    n = n & (n - 1); <span class="c">// each iteration removes exactly one 1-bit</span>
    count++;
  }
  return count; <span class="c">// loop runs once per set bit, not once per bit position — faster than checking all 32</span>
}

<span class="c">// is n a power of 2? a power of 2 has EXACTLY one set bit</span>
function isPowerOfTwo(n) {
  return n > 0 && (n & (n - 1)) === 0;
}</code></pre>
<figure>
  <svg viewBox="0 0 640 100" class="dg" role="img" aria-label="Showing how n and n-1 combined with AND clears exactly the lowest set bit">
    <text class="lbl" x="20" y="25" style="font-size:14px">n     = 0110 1100</text>
    <text class="lbl" x="20" y="50" style="font-size:14px">n - 1 = 0110 1011</text>
    <text class="lbl gr" x="20" y="80" style="font-size:14px">n &amp; (n-1) = 0110 1000 — lowest 1-bit gone</text>
  </svg>
  <figcaption>Subtracting 1 flips every trailing 0 to 1 and the lowest 1 to 0 — ANDing with the original clears just that bit.</figcaption>
</figure>

<h3>Trick 4 — bitmasks as a compact set</h3>
<p>
  For a small, fixed universe of items (say, ≤ 20-30 elements), an integer
  can represent an entire subset — bit <code>i</code> set means "item i is
  in the set." This is the foundation of bitmask DP (advanced tier): a
  whole subset becomes a single number you can use as a state or a Map
  key, instead of an array you'd need to compare element-by-element.
</p>
<pre><code>let mask = 0;
mask |= (1 << 3);        <span class="c">// add item 3 to the set</span>
const has3 = (mask & (1 << 3)) !== 0; <span class="c">// is item 3 in the set?</span>
mask &= ~(1 << 3);        <span class="c">// remove item 3</span></code></pre>

<div class="say">
  <span class="ttl">Say it like this →</span> "Since every value except one
  appears an even number of times, XOR-ing the whole array together
  cancels every paired value to zero and leaves exactly the unpaired one
  — O(n) time, O(1) space, no hash set needed."
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>"Without using extra space," combined with numbers that appear in pairs → XOR</li>
  <li>"Count sallow bits," "power of two," "single bit differs" → the set-bit tricks above</li>
  <li>A small fixed number of items/states (≤ ~20) where you need to represent "which subset" compactly → bitmask</li>
  <li>Multiplying/dividing by exact powers of 2 in a performance-sensitive inner loop → shifts, though modern engines often optimize this automatically</li>
</ul>`,
};
