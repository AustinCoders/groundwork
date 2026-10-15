import type { Chapter } from "../types";

export const dsaBitManipulation: Chapter = {
  id: "dsa-bit-manipulation",
  num: "I15",
  title: "Bit manipulation",
  short: "Bit manipulation",
  levels: ["intermediate"],
  prerequisites: ["dsa-complexity-analysis"],
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
    "ex-maximum-xor-of-two-numbers",
    "ex-subsets-bitmask",
    "ex-single-number-iii",
    "ex-hamming-distance",
    "ex-total-hamming-distance",
    "ex-number-complement",
    "ex-convert-to-hexadecimal",
    "ex-subarray-xor-equals-k",
    "ex-maximum-product-of-word-lengths",
    "ex-submasks-of-a-mask",
    "ex-sort-integers-by-bit-count",
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

<h3>Two's complement: how negative numbers look in 32 bits</h3>
<p>
  Every tip below that touches a negative number depends on one fact, so it
  is worth deriving once. A 32-bit pattern is just 32 digits of 0 or 1, and
  adding 1 to the largest pattern (all ones) wraps around to all zeros, the
  same way an odometer rolls over. That wrap-around gives a natural meaning
  to "minus": the pattern that, added to <code>x</code>, wraps to zero is
  <code>-x</code>. Flipping every bit of <code>x</code> gives a pattern
  that adds to <code>x</code> to make all ones, so adding one more finishes
  the wrap: <b><code>-x === ~x + 1</code></b>, and the same line read
  backwards says <code>~x === -x - 1</code>. This encoding is called
  <b>two's complement</b>. The top bit acts as the sign (it counts as
  &minus;2<sup>31</sup>), so the representable range is
  &minus;2<sup>31</sup> to 2<sup>31</sup> &minus; 1 with no special case for
  negatives.
</p>
<table>
  <tr><th>4-bit pattern</th><th>Meaning as two's complement</th><th>Why</th></tr>
  <tr><td>0111</td><td>7</td><td>top bit 0, so the value is 4 + 2 + 1</td></tr>
  <tr><td>0001</td><td>1</td><td>4 + 2 + 1 weights, only the last is set</td></tr>
  <tr><td>0000</td><td>0</td><td>no bit set</td></tr>
  <tr><td>1111</td><td>-1</td><td>-8 + 4 + 2 + 1</td></tr>
  <tr><td>1110</td><td>-2</td><td>-8 + 4 + 2</td></tr>
  <tr><td>1000</td><td>-8</td><td>only the sign bit, the most negative value</td></tr>
</table>
<p class="sub">
  JavaScript does the same with 32 bits instead of 4. Negating 6 in 8 bits
  to keep the digits short: 6 is <code>00000110</code>, <code>~6</code> is
  <code>11111001</code>, adding 1 gives <code>11111010</code>, and that
  pattern is -6. Note that the range is lopsided: there is one more negative
  value than positive, so there is no +2<sup>31</sup>: negating
  <code>-2147483648</code> as a plain number gives 2147483648, but squeezed
  back into 32 bits (<code>-(-2147483648) | 0</code>) it lands on
  <code>-2147483648</code> again.
</p>
<h4>Reading the shifts on negative numbers</h4>
<table>
  <tr><th>Expression</th><th>Result</th><th>What happened</th></tr>
  <tr><td><code>-1 &gt;&gt; 1</code></td><td>-1</td><td><code>&gt;&gt;</code> copies the sign bit in on the left, so all-ones stays all-ones</td></tr>
  <tr><td><code>-1 &gt;&gt;&gt; 1</code></td><td>2147483647</td><td><code>&gt;&gt;&gt;</code> always shifts in a 0, and the result is read as unsigned</td></tr>
  <tr><td><code>-7 &gt;&gt; 1</code></td><td>-4</td><td>rounds toward minus infinity, like <code>Math.floor(-7 / 2)</code>, not toward zero</td></tr>
  <tr><td><code>-7 &gt;&gt;&gt; 1</code></td><td>2147483644</td><td>the sign bit became an ordinary high bit</td></tr>
  <tr><td><code>-6 &gt;&gt;&gt; 0</code></td><td>4294967290</td><td>shifting by zero is the idiom for "reinterpret as unsigned"</td></tr>
  <tr><td><code>1 &lt;&lt; 31</code></td><td>-2147483648</td><td>the only set bit is the sign bit</td></tr>
  <tr><td><code>1 &lt;&lt; 32</code></td><td>1</td><td>the shift count is taken modulo 32, so this is a shift by 0</td></tr>
  <tr><td><code>2 ** 32 + 5 | 0</code></td><td>5</td><td>everything above bit 31 is dropped on conversion</td></tr>
</table>
<p>
  To <em>look at</em> a number's bits, print it unsigned.
  <code>(-6).toString(2)</code> gives <code>"-110"</code>, which is the
  mathematical sign followed by the magnitude and hides the real pattern,
  while <code>(-6 &gt;&gt;&gt; 0).toString(2)</code> gives the 32 actual
  bits, <code>11111111111111111111111111111010</code>. Pad with
  <code>.padStart(32, "0")</code> when the number is small.
</p>
<div class="warn">
  <span class="ttl">⚠ Three ways bit code goes wrong in JavaScript</span>
  <b>Arithmetic is not 32-bit.</b> <code>(1 &lt;&lt; 31) - 1</code> is
  <code>-2147483649</code>, because the subtraction happens on ordinary
  doubles after the shift; wrap it with <code>| 0</code> if you want
  2147483647. <b>Parity of negatives.</b> <code>-3 % 2</code> is
  <code>-1</code>, so <code>n % 2 === 1</code> misses negative odd numbers,
  while <code>(n &amp; 1) === 1</code> works for every integer.
  <b>Precedence.</b> Comparison binds tighter than <code>&amp;</code>, so
  <code>5 &amp; 4 === 4</code> means <code>5 &amp; (4 === 4)</code> and
  gives <code>1</code>; and <code>1 &lt;&lt; 2 + 1</code> is
  <code>1 &lt;&lt; 3</code>, which is 8. Parenthesise every bit expression
  that mixes operators.
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
<h4>Dry run: singleNumber([4, 1, 2, 1, 2])</h4>
<table>
  <tr><th>num</th><th>result before</th><th>XOR</th><th>result after</th></tr>
  <tr><td>4</td><td>000</td><td>^ 100</td><td>100 (4)</td></tr>
  <tr><td>1</td><td>100</td><td>^ 001</td><td>101 (5)</td></tr>
  <tr><td>2</td><td>101</td><td>^ 010</td><td>111 (7)</td></tr>
  <tr><td>1</td><td>111</td><td>^ 001</td><td>110 (6)</td></tr>
  <tr><td>2</td><td>110</td><td>^ 010</td><td>100 (4)</td></tr>
</table>
<p class="sub">
  Every value that appears twice (1 and 2) XORs itself away over the
  course of the loop — the last two rows undo exactly what rows 2 and 3
  did. Only 4, the unpaired value, survives to the end.
</p>
<p class="sub">
  This is a genuinely elegant O(1)-space answer to a problem that looks
  like it needs a hash set (O(n) space) — worth recognizing "appears an
  even number of times except one" as an XOR tell.
</p>

<h3>Missing Number: XOR the indices in too</h3>
<p>
  An array holds <code>n</code> distinct values from <code>0..n</code>, so
  exactly one value is missing. The shape "everything cancels except one"
  is there if you supply the second copy yourself: XOR together every
  index <code>0..n</code> and every value in the array. Each value that is
  present appears twice (once as an index, once as a value) and cancels; the
  missing value appears only as an index, so it is what remains. The
  alternative <code>n * (n + 1) / 2 - sum</code> is also O(n) time and O(1)
  space, and it is fine for sizes an interview uses; XOR never leaves 32 bits,
  which is its advantage when the sum would be huge.
</p>
<pre><code>function missingNumber(nums) {
  let x = nums.length; <span class="c">// start with n, the one index the loop below does not visit</span>
  for (let i = 0; i &lt; nums.length; i++) x ^= i ^ nums[i];
  return x;
}</code></pre>
<h4>Dry run: missingNumber([3, 0, 1])</h4>
<table>
  <tr><th>i</th><th>nums[i]</th><th>x before</th><th>x ^ i ^ nums[i]</th><th>x after</th></tr>
  <tr><td>(start)</td><td>—</td><td>—</td><td>x = 3 (n)</td><td>3</td></tr>
  <tr><td>0</td><td>3</td><td>3</td><td>3 ^ 0 ^ 3</td><td>0</td></tr>
  <tr><td>1</td><td>0</td><td>0</td><td>0 ^ 1 ^ 0</td><td>1</td></tr>
  <tr><td>2</td><td>1</td><td>1</td><td>1 ^ 2 ^ 1</td><td>2</td></tr>
</table>
<p class="sub">
  The indices 0, 1, 2 and the extra 3 meet the values 3, 0, 1 and cancel
  pair by pair; 2 has an index but no value, so it survives. Seeding
  <code>x</code> with <code>n</code> is easy to forget: the loop visits only the
  indices <code>0..n-1</code>, so without the seed the value <code>n</code>
  is left uncancelled and the function returns <code>missing ^ n</code>
  instead of <code>missing</code>.
</p>

<h3>Single Number II: when pairs become triples</h3>
<p>
  Now every value appears <em>three</em> times except one that appears
  once. XOR no longer helps, because <code>x ^ x ^ x</code> is
  <code>x</code>, not 0. Change the unit of thinking from numbers to bit
  columns. Look at one bit position across the whole array: every value that
  appears three times contributes 0 or 3 ones to that column, so the column
  total is a multiple of 3 plus the lone value's bit. The total modulo 3 is
  therefore exactly the lone value's bit.
</p>
<pre><code>function singleNumberII(nums) {
  let result = 0;
  for (let bit = 0; bit &lt; 32; bit++) { <span class="c">// all 32 columns, including the sign bit</span>
    let ones = 0;
    for (const num of nums) ones += (num >> bit) &amp; 1;
    if (ones % 3 !== 0) result |= 1 &lt;&lt; bit;
  }
  return result; <span class="c">// bit 31 set makes this come out negative, which is correct</span>
}</code></pre>
<table>
  <tr><th>Input [2, 2, 3, 2]</th><th>Column total of ones</th><th>Total mod 3</th><th>Bit of the answer</th></tr>
  <tr><td>bit 0 (2 = 10, 3 = 11)</td><td>0 + 0 + 1 + 0 = 1</td><td>1</td><td>1</td></tr>
  <tr><td>bit 1</td><td>1 + 1 + 1 + 1 = 4</td><td>1</td><td>1</td></tr>
  <tr><td>bits 2 to 31</td><td>0</td><td>0</td><td>0</td></tr>
</table>
<p class="sub">
  Bits 1 and 0 are both set, so the answer is <code>11</code> in binary, which
  is 3. This costs O(32 n) = O(n) time and O(1) space. Stopping the loop at
  bit 30 instead of 31 is the usual bug: it works for every non-negative input
  and silently returns the wrong value when the lone number is negative.
</p>
<p>
  The same idea can run in a single pass without a 32-step outer loop. Give
  every bit column a two-bit counter that counts 0, 1, 2 and then back to 0,
  stored across two variables: <code>ones</code> holds the low bit of every
  column's counter and <code>twos</code> the high bit, so the pair (twos,
  ones) cycles 00, 01, 10, 00 for a column that keeps seeing a 1.
</p>
<pre><code>function singleNumberIIFast(nums) {
  let ones = 0, twos = 0;
  for (const num of nums) {
    ones = (ones ^ num) &amp; ~twos; <span class="c">// toggle the low bit, unless the counter was at 2 (it wraps to 0)</span>
    twos = (twos ^ num) &amp; ~ones; <span class="c">// toggle the high bit, unless the low bit just became 1</span>
  }
  return ones; <span class="c">// columns of the lone value are at count 1; every tripled column is back at 0</span>
}</code></pre>
<h4>Dry run on [2, 2, 3, 2], showing the low four bits</h4>
<table>
  <tr><th>num</th><th>ones after</th><th>twos after</th><th>Reading</th></tr>
  <tr><td>2 (0010)</td><td>0010</td><td>0000</td><td>bit 1 seen once</td></tr>
  <tr><td>2 (0010)</td><td>0000</td><td>0010</td><td>bit 1 seen twice, so the counter reads 2</td></tr>
  <tr><td>3 (0011)</td><td>0001</td><td>0000</td><td>bit 1 reached three and reset; bit 0 seen once</td></tr>
  <tr><td>2 (0010)</td><td>0011</td><td>0000</td><td>bit 1 is back to one (the fourth 1 in its column)</td></tr>
</table>
<p class="sub">
  Both versions are O(n). The column-counting version generalises at once to
  "every value appears k times except one" by changing 3 to k; the two-variable
  version needs a bigger counter for each extra value of k, so say the first
  one in an interview and keep the second as the follow-up.
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

<h3>Isolating the lowest set bit with negation</h3>
<p>
  <code>n &amp; (n - 1)</code> removes the lowest set bit. Its twin keeps
  <em>only</em> that bit: <b><code>n &amp; -n</code></b>. The two's
  complement identity explains it. Write <code>n</code> as some high part,
  then its lowest 1, then zeros. Flipping gives the inverted high part, a 0,
  then ones; adding 1 carries through those ones, turns them back into zeros
  and sets the 0 to 1. So <code>-n</code> is the inverted high part followed
  by the same lowest 1 and the same zeros. ANDing with <code>n</code> cancels
  the high part (a bit and its opposite) and keeps the lowest 1.
</p>
<table>
  <tr><th></th><th>8-bit pattern</th></tr>
  <tr><td><code>n = 44</code></td><td>00101100</td></tr>
  <tr><td><code>-n</code> (that is, <code>~n + 1</code>)</td><td>11010100</td></tr>
  <tr><td><code>n &amp; -n</code></td><td>00000100, which is 4</td></tr>
</table>
<p class="sub">
  The result is a power of two, the weight of the lowest set bit. It is
  <code>0</code> for <code>n = 0</code>, and it stays correct for
  <code>-2147483648</code>, where it returns the sign bit
  <code>-2147483648</code> itself. The same expression drives Fenwick trees
  later, where it steps between the ranges a node covers.
</p>

<h3>Single Number III: two survivors, separated by one bit</h3>
<p>
  Every value appears twice except <em>two</em> values, <code>a</code> and
  <code>b</code>, which appear once. XOR-ing the whole array gives
  <code>a ^ b</code>, which is not enough on its own. But
  <code>a !== b</code>, so <code>a ^ b</code> has at least one 1-bit, and at
  that position <code>a</code> and <code>b</code> differ. Split the array by
  that bit. Both copies of any paired value land in the same half (they have
  the same bits), so each half is the "all pairs, one survivor" problem, and
  Trick 1 solves each half. <code>xor &amp; -xor</code> picks the splitting
  bit in one step.
</p>
<pre><code>function singleNumberIII(nums) {
  let xor = 0;
  for (const num of nums) xor ^= num; <span class="c">// xor === a ^ b</span>
  const bit = xor &amp; -xor;              <span class="c">// one position where a and b differ</span>

  let a = 0, b = 0;
  for (const num of nums) {
    if (num &amp; bit) a ^= num; else b ^= num; <span class="c">// pairs cancel inside their own half</span>
  }
  return [a, b];
}</code></pre>
<h4>Dry run: singleNumberIII([1, 2, 1, 3, 2, 5])</h4>
<table>
  <tr><th>Step</th><th>Value</th></tr>
  <tr><td>XOR of everything</td><td>1^2^1^3^2^5 = 3^5 = 011 ^ 101 = 110 (6)</td></tr>
  <tr><td><code>bit = 6 &amp; -6</code></td><td>010 (2): 3 and 5 differ at bit 1</td></tr>
  <tr><td>numbers with bit 1 set</td><td>2, 3, 2 → 2 ^ 3 ^ 2 = 3</td></tr>
  <tr><td>numbers with bit 1 clear</td><td>1, 1, 5 → 1 ^ 1 ^ 5 = 5</td></tr>
</table>
<p class="sub">
  Two passes, O(n) time and O(1) space. The answer comes back in an
  unspecified order, so compare the two values as a set. If you reached for
  <code>xor &amp; 1</code> as the splitting bit it breaks as soon as
  <code>a</code> and <code>b</code> agree at bit 0; the lowest <em>set</em>
  bit of the XOR is the one guaranteed to separate them.
</p>

<h3>Counting bits for every number up to n</h3>
<p>
  Calling <code>countSetBits</code> on each of <code>0..n</code> costs
  O(n log n) in the worst case. The answers for neighbouring numbers are
  related, though. Dropping the last bit of <code>i</code> gives
  <code>i &gt;&gt; 1</code>, a smaller number whose answer is already in the
  table, and the dropped bit is <code>i &amp; 1</code>:
  <code>bits[i] = bits[i &gt;&gt; 1] + (i &amp; 1)</code>. A table built in
  increasing order is a small dynamic program with O(1) work per entry.
</p>
<pre><code>function countBits(n) {
  const bits = new Array(n + 1).fill(0); <span class="c">// bits[0] = 0 is the base case</span>
  for (let i = 1; i &lt;= n; i++) bits[i] = bits[i >> 1] + (i &amp; 1);
  return bits;
}</code></pre>
<h4>Dry run: countBits(8)</h4>
<table>
  <tr><th>i</th><th>binary</th><th>i &gt;&gt; 1</th><th>bits[i &gt;&gt; 1]</th><th>i &amp; 1</th><th>bits[i]</th></tr>
  <tr><td>1</td><td>0001</td><td>0</td><td>0</td><td>1</td><td>1</td></tr>
  <tr><td>2</td><td>0010</td><td>1</td><td>1</td><td>0</td><td>1</td></tr>
  <tr><td>3</td><td>0011</td><td>1</td><td>1</td><td>1</td><td>2</td></tr>
  <tr><td>4</td><td>0100</td><td>2</td><td>1</td><td>0</td><td>1</td></tr>
  <tr><td>5</td><td>0101</td><td>2</td><td>1</td><td>1</td><td>2</td></tr>
  <tr><td>6</td><td>0110</td><td>3</td><td>2</td><td>0</td><td>2</td></tr>
  <tr><td>7</td><td>0111</td><td>3</td><td>2</td><td>1</td><td>3</td></tr>
  <tr><td>8</td><td>1000</td><td>4</td><td>1</td><td>0</td><td>1</td></tr>
</table>
<p class="sub">
  O(n) time and O(n) space for the table itself. An equivalent recurrence,
  <code>bits[i] = bits[i &amp; (i - 1)] + 1</code>, reuses the lowest-set-bit
  removal from Trick 3 instead of the shift: <code>i &amp; (i - 1)</code> is
  always smaller than <code>i</code> and has one fewer set bit.
</p>

<h3>Hamming distance: how many bits differ</h3>
<p>
  The Hamming distance between two integers is the number of bit positions
  where they differ. XOR is 1 exactly where two bits differ, so the distance
  is the count of set bits in <code>a ^ b</code>: reuse
  <code>countSetBits</code> and write
  <code>countSetBits(a ^ b)</code>. For a whole array, comparing every pair
  is O(n²) pairs, but the bit columns come to the rescue again. If a column
  holds <code>ones</code> ones and <code>n - ones</code> zeros, exactly
  <code>ones * (n - ones)</code> pairs differ in it, and the columns are
  independent, so the total over all pairs is the sum over 32 columns.
</p>
<pre><code>function totalHammingDistance(nums) {
  let total = 0;
  for (let bit = 0; bit &lt; 32; bit++) {
    let ones = 0;
    for (const num of nums) ones += (num >> bit) &amp; 1;
    total += ones * (nums.length - ones); <span class="c">// pairs with one 1 and one 0 in this column</span>
  }
  return total;
}</code></pre>
<p class="sub">
  O(32 n) time against O(n²) for the pair loop, and O(1) space.
  <code>countSetBits</code> from Trick 3 also terminates on negative inputs
  (it clears one set bit per step until the value is 0), so a negative
  argument is counted by its 32-bit pattern, not as a magnitude.
</p>

<h3>Reversing the 32 bits of a number</h3>
<p>
  Read the number from its lowest bit upward and build the answer from the
  highest bit downward: shift the result left to make room, copy the lowest
  bit of the input in, and shift the input right so the next bit becomes the
  lowest.
</p>
<pre><code>function reverseBits(n) {
  let result = 0;
  for (let i = 0; i &lt; 32; i++) {
    result = (result &lt;&lt; 1) | (n &amp; 1); <span class="c">// make room, then append the lowest bit of n</span>
    n >>>= 1;                          <span class="c">// logical shift: do not drag a sign bit in from the left</span>
  }
  return result >>> 0; <span class="c">// the final pattern may have bit 31 set; read it back as unsigned</span>
}</code></pre>
<p class="sub">
  Two JavaScript details decide whether this passes. Using
  <code>&gt;&gt;</code> instead of <code>&gt;&gt;&gt;</code> for the input
  would copy the sign bit into the empty positions for a negative
  <code>n</code>, though with exactly 32 iterations the loop reads only the
  original 32 bits either way; using <code>&gt;&gt;&gt;</code> is the habit
  that does not depend on that counting argument. And the result must end in
  <code>&gt;&gt;&gt; 0</code>: when the original number was odd, the
  reversed one has bit 31 set, and without the conversion the function returns
  a negative number where the unsigned value was expected. For
  <code>43261596</code> the answer is <code>964176192</code>.
</p>
<p>
  When the function is called millions of times, the loop's 32 steps can be
  replaced by five fixed ones that swap halves, then bytes, then nibbles,
  then pairs, then single bits:
</p>
<pre><code>function reverseBitsFast(n) {
  n = ((n >>> 16) | (n &lt;&lt; 16)) >>> 0;
  n = (((n &amp; 0xFF00FF00) >>> 8) | ((n &amp; 0x00FF00FF) &lt;&lt; 8)) >>> 0;
  n = (((n &amp; 0xF0F0F0F0) >>> 4) | ((n &amp; 0x0F0F0F0F) &lt;&lt; 4)) >>> 0;
  n = (((n &amp; 0xCCCCCCCC) >>> 2) | ((n &amp; 0x33333333) &lt;&lt; 2)) >>> 0;
  n = (((n &amp; 0xAAAAAAAA) >>> 1) | ((n &amp; 0x55555555) &lt;&lt; 1)) >>> 0;
  return n;
}</code></pre>

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

<h3>Enumerating every subset, and every submask of a mask</h3>
<p>
  If the mask is a set, counting from 0 up to <code>2ⁿ - 1</code> visits every
  possible set once, because each number in that range is a different
  pattern of n bits. Bit <code>i</code> of the counter says whether item
  <code>i</code> is chosen. This is the compact iterative form of "include or
  skip each item".
</p>
<pre><code>function allSubsets(items) {
  const n = items.length;
  const result = [];
  for (let mask = 0; mask &lt; 2 ** n; mask++) { <span class="c">// 2 ** n, not 1 &lt;&lt; n, so n = 31 and n = 32 do not break</span>
    const subset = [];
    for (let i = 0; i &lt; n; i++) {
      if (mask &amp; (1 &lt;&lt; i)) subset.push(items[i]);
    }
    result.push(subset);
  }
  return result;
}</code></pre>
<p class="sub">
  The cost is O(n · 2ⁿ): 2ⁿ masks, each scanned bit by bit. The loop bound
  matters. <code>1 &lt;&lt; 31</code> is negative and <code>1 &lt;&lt; 32</code>
  is 1, so a bound written as <code>1 &lt;&lt; n</code> runs zero or one
  times for n of 31 or 32. A subset enumeration that large is hopeless anyway,
  so in practice the constraint is n of about 20 or less, but write the bound
  so that the code is right for the whole range it can be asked about.
</p>
<p>
  A harder variant needs <em>only the submasks of a given mask</em>: every
  subset of the items already in <code>mask</code>. The elegant loop below
  visits them from largest to smallest without ever looking at an item
  outside the mask.
</p>
<pre><code>function submasks(mask) {
  const out = [];
  for (let sub = mask; ; sub = (sub - 1) &amp; mask) {
    out.push(sub);
    if (sub === 0) break; <span class="c">// 0 is the last submask; without this stop the loop would never end</span>
  }
  return out;
}</code></pre>
<p>
  Why does <code>(sub - 1) &amp; mask</code> step to the next smaller
  submask? Subtracting 1 turns the lowest set bit of <code>sub</code> into 0
  and every zero below it into 1. ANDing with <code>mask</code> then removes
  the bits that are not allowed, so the result is the largest value that is
  smaller than <code>sub</code> and still made only of mask bits. No submask
  is skipped because any pattern between them would have to be larger than the
  result and smaller than <code>sub</code>.
</p>
<h4>Dry run: submasks(0b1011)</h4>
<table>
  <tr><th>sub</th><th>binary</th><th>sub - 1</th><th>(sub - 1) &amp; 1011</th></tr>
  <tr><td>11</td><td>1011</td><td>1010</td><td>1010</td></tr>
  <tr><td>10</td><td>1010</td><td>1001</td><td>1001</td></tr>
  <tr><td>9</td><td>1001</td><td>1000</td><td>1000</td></tr>
  <tr><td>8</td><td>1000</td><td>0111</td><td>0011 (the 4 bit is not in the mask)</td></tr>
  <tr><td>3</td><td>0011</td><td>0010</td><td>0010</td></tr>
  <tr><td>2</td><td>0010</td><td>0001</td><td>0001</td></tr>
  <tr><td>1</td><td>0001</td><td>0000</td><td>0000</td></tr>
  <tr><td>0</td><td>0000</td><td>—</td><td>stop: 8 submasks, which is 2³ for 3 set bits</td></tr>
</table>
<p class="sub">
  A mask with <code>k</code> set bits has 2<sup>k</sup> submasks. If a bitmask
  DP loops over every mask and then over all its submasks, the total work is
  3<sup>n</sup>, because each item is in one of three states: outside the
  mask, in the mask but not in the submask, or in both. That is far less than
  the 4<sup>n</sup> of two nested loops over all masks, and it is the
  complexity to quote for partition-style DPs.
</p>

<h3>Gray code: change one bit at a time</h3>
<p>
  A Gray code lists all n-bit patterns so that consecutive patterns differ in
  exactly one bit. The direct formula is <code>i ^ (i &gt;&gt; 1)</code>.
</p>
<pre><code>function grayCode(n) {
  const out = [];
  for (let i = 0; i &lt; 2 ** n; i++) out.push(i ^ (i >> 1));
  return out;
}</code></pre>
<table>
  <tr><th>i</th><th>binary</th><th>i &gt;&gt; 1</th><th>i ^ (i &gt;&gt; 1)</th><th>value</th></tr>
  <tr><td>0</td><td>000</td><td>000</td><td>000</td><td>0</td></tr>
  <tr><td>1</td><td>001</td><td>000</td><td>001</td><td>1</td></tr>
  <tr><td>2</td><td>010</td><td>001</td><td>011</td><td>3</td></tr>
  <tr><td>3</td><td>011</td><td>001</td><td>010</td><td>2</td></tr>
  <tr><td>4</td><td>100</td><td>010</td><td>110</td><td>6</td></tr>
  <tr><td>5</td><td>101</td><td>010</td><td>111</td><td>7</td></tr>
  <tr><td>6</td><td>110</td><td>011</td><td>101</td><td>5</td></tr>
  <tr><td>7</td><td>111</td><td>011</td><td>100</td><td>4</td></tr>
</table>
<p class="sub">
  Why one bit changes: going from <code>i</code> to <code>i + 1</code> flips
  the trailing ones of <code>i</code> and the zero above them, say the lowest
  k + 1 bits, so <code>i ^ (i + 1)</code> is 2<sup>k+1</sup> - 1. The shifted
  copy flips the lowest k bits, 2<sup>k</sup> - 1. XOR-ing the two changes
  leaves 2<sup>k</sup>, a single bit. The last code, <code>100</code>, also
  differs from the first, <code>000</code>, by one bit, so the list is a
  cycle. Gray codes are the ordering behind "visit every subset by adding or
  removing one item at a time".
</p>

<h3>Power of four: one set bit, at an even position</h3>
<p>
  A power of four is a power of two whose single set bit sits at position 0,
  2, 4 and so on, so first check that there is exactly one set bit and then
  check where it is. A mask with a 1 at every even position,
  <code>0x55555555</code>, answers the second question in one AND.
</p>
<pre><code>function isPowerOfFour(n) {
  return n > 0 &amp;&amp; (n &amp; (n - 1)) === 0 &amp;&amp; (n &amp; 0x55555555) !== 0;
}

<span class="c">// an equivalent last test: 4 ** k leaves remainder 1 when divided by 3, 2 * 4 ** k leaves 2</span>
function isPowerOfFourMod(n) {
  return n > 0 &amp;&amp; (n &amp; (n - 1)) === 0 &amp;&amp; n % 3 === 1;
}</code></pre>
<p class="sub">
  Both tests run in O(1). The common mistakes are using the mask with the
  odd positions (<code>0xAAAAAAAA</code>, which accepts 2 and 8 and rejects 1
  and 4) and forgetting <code>n &gt; 0</code>: <code>0</code> and
  <code>-2147483648</code> both pass the single-bit test
  (<code>(0 &amp; -1) === 0</code>, and <code>-2147483648 &amp; 2147483647</code>
  is 0 too), so they must be rejected first.
</p>

<h3>Bitwise AND of a range: keep the common prefix</h3>
<p>
  AND all integers from <code>left</code> to <code>right</code>, inclusive. A
  loop over the range is O(right - left), which is too slow when the range is
  billions wide. Look at the binary forms. Take the highest bit position where
  <code>left</code> and <code>right</code> differ. Above it they agree. At that
  position <code>left</code> has 0 and <code>right</code> has 1, so the range
  contains a number with the shared prefix followed by 1 and all zeros, and
  the number just before it, the shared prefix followed by 0 and all ones. The
  lower bits (that position and everything below) therefore take both values
  across the range, and ANDing them gives 0. The answer is the common prefix
  of the two endpoints, padded with zeros.
</p>
<pre><code>function rangeBitwiseAnd(left, right) {
  let shift = 0;
  while (left !== right) { <span class="c">// until only the shared prefix is left</span>
    left >>= 1;
    right >>= 1;
    shift++;
  }
  return left &lt;&lt; shift;  <span class="c">// put the prefix back in place, zeros below</span>
}

<span class="c">// same answer, using Trick 3: strip the lowest set bit of right until right is not above left</span>
function rangeBitwiseAnd2(left, right) {
  while (right > left) right &amp;= right - 1;
  return right;
}</code></pre>
<h4>Dry run: rangeBitwiseAnd(5, 7), that is 101 and 111</h4>
<table>
  <tr><th>left</th><th>right</th><th>shift</th><th>Reason to continue</th></tr>
  <tr><td>101 (5)</td><td>111 (7)</td><td>0</td><td>they differ</td></tr>
  <tr><td>10 (2)</td><td>11 (3)</td><td>1</td><td>they still differ</td></tr>
  <tr><td>1</td><td>1</td><td>2</td><td>equal, stop: prefix is 1, and <code>1 &lt;&lt; 2</code> is 4</td></tr>
</table>
<p class="sub">
  Checking: 5 &amp; 6 &amp; 7 is 4. At most 31 shifts, so the first version
  is O(log right) and the second clears one bit per step, also O(log right).
  The second works because, while <code>right</code> is still above
  <code>left</code>, it keeps a 1 at the highest bit where the two differ, so
  clearing its lowest set bit never overshoots; the loop stops when that
  differing bit itself is cleared, leaving exactly the common prefix. Both
  assume <code>0 &lt;= left &lt;= right &lt; 2<sup>31</sup></code>, the usual
  constraint; the answer for <code>(0, 2147483647)</code> is 0.
</p>

<h3>Adding without plus: sum of two integers</h3>
<p>
  Adding in binary has two parts per column: the sum bit and the carry. The
  sum bit ignoring carries is <code>a ^ b</code> (1 plus 1 is 0 here). The
  carry is generated where both bits are 1 and moves one column up:
  <code>(a &amp; b) &lt;&lt; 1</code>. So <code>a + b</code> equals
  <code>(a ^ b) + ((a &amp; b) &lt;&lt; 1)</code>, which is the same
  problem with a carry that has moved one position left. Repeat until the carry
  is 0.
</p>
<pre><code>function getSum(a, b) {
  while (b !== 0) {
    const carry = (a &amp; b) &lt;&lt; 1; <span class="c">// columns where both are 1 produce a carry into the next column</span>
    a = a ^ b;                 <span class="c">// the sum without those carries</span>
    b = carry;                 <span class="c">// add the carries in the next round</span>
  }
  return a;
}</code></pre>
<h4>Dry run: getSum(5, 3)</h4>
<table>
  <tr><th>Round</th><th>a</th><th>b</th><th>carry = (a &amp; b) &lt;&lt; 1</th><th>new a = a ^ b</th></tr>
  <tr><td>1</td><td>0101</td><td>0011</td><td>0010</td><td>0110</td></tr>
  <tr><td>2</td><td>0110</td><td>0010</td><td>0100</td><td>0100</td></tr>
  <tr><td>3</td><td>0100</td><td>0100</td><td>1000</td><td>0000</td></tr>
  <tr><td>4</td><td>0000</td><td>1000</td><td>0000</td><td>1000</td></tr>
</table>
<p class="sub">
  After round 4 the carry is 0 and <code>a</code> is 1000, which is 8. In
  JavaScript the loop ends for negative inputs too, because the carry is
  pushed up and finally off the 32-bit edge, so it needs at most 32 rounds.
  The result equals <code>(a + b) | 0</code>: the same 32-bit wrap-around a
  hardware adder gives, so <code>getSum(2147483647, 1)</code> is
  <code>-2147483648</code>. Worth saying out loud: this is a ripple-carry adder, with
  XOR as the sum bit and AND as the carry.
</p>

<h3>Dividing without the division operator</h3>
<p>
  Long division in binary is repeated subtraction made fast by doubling.
  Subtracting the divisor one at a time costs as many steps as the quotient,
  up to 2³¹. Instead, find the largest <code>divisor · 2<sup>s</sup></code>
  that still fits in what is left of the dividend, subtract it, add
  2<sup>s</sup> to the quotient, and go on with smaller s. Because every
  integer is a sum of distinct powers of two, trying s from 31 down to 0 builds
  the quotient exactly, in at most 32 steps.
</p>
<pre><code>function divide(dividend, divisor) {
  const INT_MAX = 2147483647;
  if (dividend === -2147483648 &amp;&amp; divisor === -1) return INT_MAX; <span class="c">// the one result that does not fit in 32 bits</span>

  const negative = (dividend &lt; 0) !== (divisor &lt; 0);
  let remaining = Math.abs(dividend); <span class="c">// absolute values up to 2 ** 31: safe in a double, not in an int32</span>
  const step = Math.abs(divisor);
  let quotient = 0;

  for (let shift = 31; shift >= 0; shift--) {
    const chunk = step * 2 ** shift; <span class="c">// multiplying by a power of two is exact; step &lt;&lt; shift would wrap</span>
    if (chunk &lt;= remaining) {
      remaining -= chunk;
      quotient += 2 ** shift;
    }
  }
  return negative ? 0 - quotient : quotient; <span class="c">// 0 - q, not -q: -0 would print as -0 when q is 0</span>
}</code></pre>
<h4>Dry run: divide(43, 5)</h4>
<table>
  <tr><th>shift</th><th>chunk = 5 · 2<sup>shift</sup></th><th>remaining before</th><th>Take it?</th><th>quotient after</th></tr>
  <tr><td>31 to 4</td><td>at least 80</td><td>43</td><td>no, chunk is larger</td><td>0</td></tr>
  <tr><td>3</td><td>40</td><td>43</td><td>yes, remaining becomes 3</td><td>8</td></tr>
  <tr><td>2</td><td>20</td><td>3</td><td>no</td><td>8</td></tr>
  <tr><td>1</td><td>10</td><td>3</td><td>no</td><td>8</td></tr>
  <tr><td>0</td><td>5</td><td>3</td><td>no</td><td>8</td></tr>
</table>
<p class="sub">
  43 divided by 5 truncates to 8. The sign handling mirrors JavaScript's own
  <code>Math.trunc(a / b)</code>: the quotient truncates toward zero, so
  <code>divide(7, -3)</code> is <code>-2</code> and <code>divide(-7, 3)</code>
  is <code>-2</code> as well. Three details cost people the offer here: the
  <code>-2147483648 / -1</code> overflow, working with the absolute value of
  <code>-2147483648</code> (2147483648 does not exist as an int32, so keep it in
  an ordinary number), and the 32-bit <code>&lt;&lt;</code> that silently wraps
  when the shifted divisor passes bit 31. The time is O(32), a constant.
</p>

<h3>Prefix XOR: range XOR in O(1), and counting subarrays</h3>
<p>
  XOR undoes itself, which makes it behave like subtraction for ranges. Define
  <code>prefix[i]</code> as the XOR of the first <code>i</code> elements. Then
  <code>prefix[r + 1] ^ prefix[l]</code> is the XOR of
  <code>nums[l..r]</code>: the common first <code>l</code> elements appear in
  both prefixes and cancel. This is the prefix-sum idea with XOR in place of
  plus, and the subtraction step is XOR itself.
</p>
<pre><code>function buildPrefixXor(nums) {
  const prefix = new Array(nums.length + 1).fill(0);
  for (let i = 0; i &lt; nums.length; i++) prefix[i + 1] = prefix[i] ^ nums[i];
  return prefix;
}

function xorRange(prefix, left, right) {
  return prefix[right + 1] ^ prefix[left]; <span class="c">// O(1) per query after O(n) setup</span>
}</code></pre>
<p>
  The counting form is the hash map trick from prefix sums. A subarray
  <code>(i, j]</code> has XOR <code>k</code> exactly when
  <code>prefix[j] ^ prefix[i] === k</code>, that is when
  <code>prefix[i] === prefix[j] ^ k</code>. Scan once, keep a map of how many
  times each prefix value has been seen, and at each step add the number of
  earlier prefixes equal to <code>current ^ k</code>.
</p>
<pre><code>function subarraysWithXor(nums, k) {
  const seen = new Map([[0, 1]]); <span class="c">// the empty prefix, so subarrays that start at index 0 count</span>
  let prefix = 0, count = 0;
  for (const num of nums) {
    prefix ^= num;
    count += seen.get(prefix ^ k) ?? 0;
    seen.set(prefix, (seen.get(prefix) ?? 0) + 1);
  }
  return count;
}</code></pre>
<h4>Dry run: subarraysWithXor([4, 2, 2, 6, 4], 6)</h4>
<table>
  <tr><th>num</th><th>prefix</th><th>prefix ^ 6 (wanted earlier)</th><th>Times seen before</th><th>count</th></tr>
  <tr><td>4</td><td>4</td><td>2</td><td>0</td><td>0</td></tr>
  <tr><td>2</td><td>6</td><td>0</td><td>1</td><td>1</td></tr>
  <tr><td>2</td><td>4</td><td>2</td><td>0</td><td>1</td></tr>
  <tr><td>6</td><td>2</td><td>4</td><td>2</td><td>3</td></tr>
  <tr><td>4</td><td>6</td><td>0</td><td>1</td><td>4</td></tr>
</table>
<p class="sub">
  The four subarrays are <code>[4, 2]</code>, <code>[6]</code>,
  <code>[2, 2, 6]</code> and the whole array, each with XOR 6; the algorithm
  costs O(n) time and O(n) space. A related puzzle, "count triples <code>i &lt; j &lt;= k</code>
  where the XOR of <code>arr[i..j-1]</code> equals the XOR of
  <code>arr[j..k]</code>", reduces to the same fact: the two halves are equal
  exactly when the XOR of the whole range <code>arr[i..k]</code> is 0, and then
  every split point <code>j</code> works, so each zero-XOR range contributes
  <code>k - i</code> triples. Checking all ranges is O(n²) with a running XOR,
  and a map of prefix values brings it to O(n).
</p>

<div class="say">
  <span class="ttl">Say it like this →</span> "Since every value except one
  appears an even number of times, XOR-ing the whole array together
  cancels every paired value to zero and leaves exactly the unpaired one
  — O(n) time, O(1) space, no hash set needed."
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>"Without using extra space," combined with numbers that appear in pairs → XOR</li>
  <li>"Count set bits," "power of two," "power of four," "single bit differs," "Hamming distance" → the set-bit tricks above</li>
  <li>Every value appears twice (or three times) except one or two → XOR, or per-column counting modulo the repeat count; for two survivors, split by the lowest set bit of the XOR</li>
  <li>"Without using +, -, * or /" → the carry loop for addition, shift-and-subtract for division</li>
  <li>A range of consecutive integers combined with AND → the common binary prefix of the two endpoints</li>
  <li>"Range XOR queries" or "count subarrays whose XOR is k" → prefix XOR, with a map of prefix counts for the counting version</li>
  <li>"Every subset," "every submask," "visit all states changing one item at a time" → count a mask from 0 to 2ⁿ - 1, the submask loop, or a Gray code</li>
  <li>Any negative input in a bit problem → ask what you want, the signed 32-bit value or the unsigned pattern, and convert with <code>| 0</code> or <code>&gt;&gt;&gt; 0</code> at the boundary</li>
  <li>A small fixed number of items/states (≤ ~20) where you need to represent "which subset" compactly → bitmask</li>
  <li>Multiplying/dividing by exact powers of 2 in a performance-sensitive inner loop → shifts, though modern engines often optimize this automatically</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>State what AND, OR, XOR and NOT each do, and which one you'd reach for to check, set, clear or toggle a bit.</li>
    <li>Explain why XOR-ing an array together finds the one value that appears an odd number of times, and trace it on a 5-element example.</li>
    <li>Explain what n &amp; (n - 1) does, and use it to both count set bits and check for a power of two.</li>
    <li>Explain why JS's bitwise operators silently truncate to 32-bit signed integers, and what that breaks on large numbers.</li>
    <li>Represent a small set of items as a single integer bitmask, and add, remove and test membership of one item in it.</li>
    <li>Derive <code>-x === ~x + 1</code>, and use it to explain <code>x &amp; -x</code> and the results of <code>&gt;&gt;</code>, <code>&gt;&gt;&gt;</code> and <code>&gt;&gt;&gt; 0</code> on a negative number.</li>
    <li>Solve Single Number II by counting each bit column modulo 3, and Single Number III by splitting the array on the lowest set bit of the XOR.</li>
    <li>Fill a count-bits table with <code>bits[i] = bits[i &gt;&gt; 1] + (i &amp; 1)</code>, and explain why the total Hamming distance is a sum over columns of <code>ones * (n - ones)</code>.</li>
    <li>Write the submask loop <code>(sub - 1) &amp; mask</code> and say why a loop over all masks and their submasks costs 3<sup>n</sup>.</li>
    <li>Explain range AND as a common prefix, addition as XOR plus a shifted AND carry, and prefix XOR as "subtraction for XOR".</li>
  </ul>
</div>`,
};
