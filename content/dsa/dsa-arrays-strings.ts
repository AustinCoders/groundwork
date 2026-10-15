import type { Chapter } from "../types";

export const dsaArraysStrings: Chapter = {
  id: "dsa-arrays-strings",
  num: "B3",
  title: "Arrays & strings",
  short: "Arrays & strings",
  levels: ["beginner"],
  prerequisites: ["dsa-complexity-analysis", "dsa-js-toolkit"],
  practice: [
    "ex-best-time-to-buy-and-sell-stock",
    "ex-maximum-subarray",
    "ex-merge-sorted-array",
    "ex-remove-duplicates-from-sorted-array",
    "ex-rotate-array",
    "ex-product-of-array-except-self",
    "ex-majority-element",
    "ex-move-zeroes",
    "ex-contains-duplicate",
    "ex-missing-number",
    "ex-find-disappeared-numbers",
    "ex-subarray-sum-equals-k",
    "ex-continuous-subarray-sum",
    "ex-max-size-subarray-sum-equals-k",
    "ex-contiguous-array",
    "ex-find-pivot-index",
    "ex-range-sum-query-immutable",
    "ex-longest-common-prefix",
    "ex-reverse-string-in-place",
    "ex-reverse-words-in-string",
    "ex-string-to-integer-atoi",
    "ex-integer-to-roman",
    "ex-roman-to-integer",
    "ex-zigzag-conversion",
    "ex-valid-anagram",
    "ex-find-the-difference",
    "ex-max-subarray-with-range",
    "ex-max-subarray-circular",
    "ex-majority-element-ii",
    "ex-find-all-duplicates",
    "ex-first-missing-positive",
    "ex-reverse-string-code-points",
  ],
  ready: true,
  subtitle: "The two data structures every other pattern is built on top of.",
  body: `<h3>What "beginner" means for this chapter</h3>
<p>
  If arrays and strings already feel completely automatic to you, skim
  this one — but don't skip it. The interview traps in this chapter
  (accidental O(n²) string building, <code>unshift</code>'s hidden cost,
  the shared-reference 2D array bug) are some of the most common ways
  strong candidates lose points on otherwise-correct solutions.
</p>

<h3>An array is a promise about memory</h3>
<p>
  A JS array is really a resizable list, but the mental model interviewers
  expect comes from the lower-level version: a contiguous block of memory
  where <b>index math replaces searching</b>. Because every slot is the
  same fixed size apart, the address of index <code>i</code> is just
  <code>base + i × size</code> — no walking, no scanning. That's the whole
  reason <code>arr[i]</code> is O(1): it's arithmetic, not a lookup.
</p>

<figure>
  <svg viewBox="0 0 640 160" class="dg" role="img" aria-label="An array as contiguous memory slots, each reachable directly by index arithmetic">
    <g class="rough">
      <rect class="box" x="20" y="40" width="80" height="60" />
      <rect class="box" x="100" y="40" width="80" height="60" />
      <rect class="box" x="180" y="40" width="80" height="60" />
      <rect class="box" x="260" y="40" width="80" height="60" />
      <rect class="box" x="340" y="40" width="80" height="60" />
    </g>
    <text class="sm" x="60" y="75" text-anchor="middle">7</text>
    <text class="sm" x="140" y="75" text-anchor="middle">3</text>
    <text class="sm" x="220" y="75" text-anchor="middle">9</text>
    <text class="sm" x="300" y="75" text-anchor="middle">1</text>
    <text class="sm" x="380" y="75" text-anchor="middle">5</text>
    <text class="sm" x="60" y="118" text-anchor="middle">[0]</text>
    <text class="sm" x="140" y="118" text-anchor="middle">[1]</text>
    <text class="sm" x="220" y="118" text-anchor="middle">[2]</text>
    <text class="sm" x="300" y="118" text-anchor="middle">[3]</text>
    <text class="sm" x="380" y="118" text-anchor="middle">[4]</text>
    <text class="lbl" x="440" y="65" style="font-size:16px">arr[3] = base + 3×size</text>
    <text class="sm" x="440" y="88">no scanning — direct math</text>
  </svg>
  <figcaption>Index access is a formula, not a search — that's the entire source of O(1).</figcaption>
</figure>

<h3>What's actually O(1) vs O(n) on an array</h3>
<table>
  <tr><th>Operation</th><th>Complexity</th><th>Why</th></tr>
  <tr><td>Read/write by index</td><td>O(1)</td><td>direct address math</td></tr>
  <tr><td>Push/pop at the end</td><td>O(1) amortized</td><td>no shifting needed</td></tr>
  <tr><td>Shift/unshift at the start</td><td>O(n)</td><td>every other element moves over</td></tr>
  <tr><td><code>splice()</code> in the middle</td><td>O(n)</td><td>everything after the cut shifts</td></tr>
  <tr><td>Search by value (<code>indexOf</code>, <code>includes</code>)</td><td>O(n)</td><td>no shortcut — has to walk it</td></tr>
</table>
<figure>
  <svg viewBox="0 0 640 340" class="dg" role="img" aria-label="Before: three elements sit at indices 0, 1 and 2. After unshift, each of those three elements has moved one slot to the right, and the new element fills the now-empty index 0.">
    <text class="lbl" x="20" y="20" style="font-size:15px">BEFORE — arr = [7, 3, 9], 3 elements at indices 0, 1, 2</text>
    <g class="rough">
      <rect class="box" x="20" y="35" width="70" height="50" />
      <rect class="box" x="90" y="35" width="70" height="50" />
      <rect class="box" x="160" y="35" width="70" height="50" />
    </g>
    <text class="sm" x="55" y="65" text-anchor="middle">7</text>
    <text class="sm" x="125" y="65" text-anchor="middle">3</text>
    <text class="sm" x="195" y="65" text-anchor="middle">9</text>
    <text class="sm" x="55" y="100" text-anchor="middle">[0]</text>
    <text class="sm" x="125" y="100" text-anchor="middle">[1]</text>
    <text class="sm" x="195" y="100" text-anchor="middle">[2]</text>

    <path class="lnr" d="M55,90 C 55,130 125,140 125,183" fill="none" marker-end="url(#dgarrow3)" />
    <path class="lnr" d="M125,90 C 125,130 195,140 195,183" fill="none" marker-end="url(#dgarrow3)" />
    <path class="lnr" d="M195,90 C 195,130 265,140 265,183" fill="none" marker-end="url(#dgarrow3)" />
    <defs>
      <marker id="dgarrow3" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
      </marker>
    </defs>
    <text class="sm rd" x="330" y="140" text-anchor="middle">each one moves one slot right — O(n) total</text>

    <text class="lbl" x="20" y="215" style="font-size:15px">AFTER — unshift(x) fills the now-empty index 0</text>
    <g class="rough">
      <rect class="boxg" x="20" y="230" width="70" height="50" />
      <rect class="box" x="90" y="230" width="70" height="50" />
      <rect class="box" x="160" y="230" width="70" height="50" />
      <rect class="box" x="230" y="230" width="70" height="50" />
    </g>
    <text class="sm gr" x="55" y="260" text-anchor="middle">x</text>
    <text class="sm" x="125" y="260" text-anchor="middle">7</text>
    <text class="sm" x="195" y="260" text-anchor="middle">3</text>
    <text class="sm" x="265" y="260" text-anchor="middle">9</text>
    <text class="sm" x="55" y="295" text-anchor="middle">[0]</text>
    <text class="sm" x="125" y="295" text-anchor="middle">[1]</text>
    <text class="sm" x="195" y="295" text-anchor="middle">[2]</text>
    <text class="sm" x="265" y="295" text-anchor="middle">[3]</text>
    <text class="lbl gr" x="20" y="320" style="font-size:13px">7 is now at [1] not [0], 3 is now at [2] not [1], 9 is now at [3] not [2]</text>
  </svg>
  <figcaption>Every element's INDEX changes, which means every element's underlying memory slot changes too — that's the O(n) work, done before x even gets placed at [0].</figcaption>
</figure>

<div class="warn">
  <span class="ttl">⚠ The interview trap</span>
  <code>arr.unshift(x)</code> and <code>arr.shift()</code> <em>feel</em> like
  O(1) because they're one method call — they're not. Every remaining
  element has to physically move one slot over. If you reach for these
  inside a loop, you've likely turned an O(n) solution into O(n²) by
  accident.
</div>

<h3>Strings are arrays with one extra rule</h3>
<p>
  In JS, strings are <b>immutable</b> — <code>str[0] = "x"</code> silently
  does nothing. Every "mutation" (<code>slice</code>, <code>+</code>,
  <code>replace</code>) actually builds a brand new string. That has a real
  cost: repeatedly concatenating inside a loop can be O(n) <em>per
  concatenation</em>, so a naive loop that builds a string character by
  character can be O(n²) in the worst case. Modern engines often optimise
  this, but use an array and <code>join</code> when it matters.
</p>
<pre><code><span class="c">// can be O(n²) in the worst case — each += may copy a string of growing length</span>
function buildSlow(chars) {
  let out = "";
  for (const c of chars) out += c;
  return out;
}

<span class="c">// O(n) — push to an array (O(1) amortized), join once at the end</span>
function buildFast(chars) {
  const parts = [];
  for (const c of chars) parts.push(c);
  return parts.join("");
}</code></pre>

<h3>Characters as numbers: charCodeAt and 26-slot counts</h3>
<p>
  A character is a small integer in disguise. <code>"a".charCodeAt(0)</code>
  is 97, <code>"b"</code> is 98, and so on up to <code>"z"</code> at 122;
  the digits <code>"0"</code> to <code>"9"</code> are 48 to 57. Subtracting
  the code of <code>"a"</code> turns a lowercase letter into an index from 0
  to 25, and that makes a <b>26-slot counting array</b> possible: a
  frequency table with no hashing at all, whose lookup is plain index
  arithmetic.
</p>
<pre><code>function letterCounts(s) {
  const counts = new Array(26).fill(0);
  for (let i = 0; i &lt; s.length; i++) {
    counts[s.charCodeAt(i) - 97]++;
  }
  return counts;
}

function isAnagramLowercase(a, b) {
  if (a.length !== b.length) return false;
  const counts = new Int32Array(26);
  for (let i = 0; i &lt; a.length; i++) {
    counts[a.charCodeAt(i) - 97]++;
    counts[b.charCodeAt(i) - 97]--;
  }
  return counts.every((c) =&gt; c === 0);
}</code></pre>
<p class="sub">
  The anagram check adds one for each letter of <code>a</code> and subtracts
  one for each letter of <code>b</code>, in the same loop. If the two words
  use the same letters the same number of times, every slot returns to 0.
  For <code>"listen"</code> and <code>"silent"</code> the letters
  <code>e</code>, <code>i</code>, <code>l</code>, <code>n</code>,
  <code>s</code>, <code>t</code> each get +1 from one word and −1 from the
  other; for <code>"listen"</code> and <code>"listed"</code>, slot
  <code>n</code> ends at +1 and slot <code>d</code> at −1, so the check
  fails. Time O(n), space O(1): the table has 26 slots whatever n is.
</p>
<div class="warn">
  <span class="ttl">⚠ The table silently trusts the alphabet</span>
  Feed an uppercase letter to <code>isAnagramLowercase</code> and
  <code>"A".charCodeAt(0) - 97</code> is −32. A typed array ignores writes to
  an index it does not have, so nothing fails: <code>isAnagramLowercase("A", "B")</code>
  returns <code>true</code>. With a plain array the stray write creates a
  property instead, with the same outcome. Before using the trick, check the
  alphabet in the problem (lowercase English letters? ASCII?) and say so out
  loud. When the input may be anything, use a <code>Map</code>, or a
  128-slot table indexed by the code itself for ASCII.
</div>
<p class="sub">
  The same arithmetic converts a digit character to its value
  (<code>c.charCodeAt(0) - 48</code>), a letter index back to a letter
  (<code>String.fromCharCode(97 + i)</code>), and tests a range
  (<code>c &gt;= "a" &amp;&amp; c &lt;= "z"</code>, which compares code
  units). It shows up in anagram and ransom-note checks, in "find the
  difference" problems, and in sliding windows over lowercase text.
</p>

<h3>Strings are UTF-16: length, code points and reversing</h3>
<p>
  A JavaScript string is a sequence of 16-bit <b>code units</b>, and
  <code>length</code>, indexing and <code>charCodeAt</code> all count code
  units. Most characters you type are one unit. Characters outside the
  Basic Multilingual Plane, including most emoji, take <b>two</b> units, a
  surrogate pair. The iteration protocol walks by <b>code points</b>
  instead, which gives the two views different answers:
</p>
<table>
  <tr><th>Expression</th><th>Result for <code>"😀"</code></th><th>What it counts</th></tr>
  <tr><td><code>"😀".length</code></td><td>2</td><td>UTF-16 code units</td></tr>
  <tr><td><code>[..."😀"].length</code></td><td>1</td><td>code points (spread and <code>for...of</code> iterate by code point)</td></tr>
  <tr><td><code>"😀".charCodeAt(0)</code></td><td>55357</td><td>the first half of the pair, a lone surrogate</td></tr>
  <tr><td><code>"😀".codePointAt(0)</code></td><td>128512</td><td>the whole character, read from the pair</td></tr>
</table>
<p>
  The bug appears the moment you reverse text by code unit. Splitting
  <code>"ab😀"</code> into units and reversing puts the two halves of the
  emoji in the wrong order, and the result is no longer valid text. Reversing
  by code point keeps each character whole:
</p>
<pre><code>function reverseByCodePoints(s) {
  return [...s].reverse().join("");
}

function countCodePoints(s) {
  let count = 0;
  for (let i = 0; i &lt; s.length; i++) {
    count++;
    if (s.codePointAt(i) &gt; 0xffff) i++;
  }
  return count;
}</code></pre>
<p class="sub">
  <code>"ab😀".split("").reverse().join("")</code> breaks the emoji, while
  <code>reverseByCodePoints("ab😀")</code> returns <code>"😀ba"</code>.
  <code>countCodePoints</code> shows the mechanics by hand: a code point above
  0xFFFF occupies two units, so skip one extra index when you meet it.
</p>
<div class="warn">
  <span class="ttl">⚠ Code points are still not "characters"</span>
  A user-perceived character can be several code points. The family emoji
  <code>"👨‍👩‍👧"</code> is 8 code units and 5 code points (three people joined
  by invisible joiners) but one thing on screen, and
  <code>"\\u00e9"</code> (the letter e with an accent) can be one code point or <code>"e"</code> plus a combining
  accent (2 units), so <code>"\\u00e9" === "e\\u0301"</code> is <code>false</code>
  until you call <code>.normalize()</code> on both. For text that people
  read, <code>Intl.Segmenter</code> splits into those visible units. In an
  interview, state the assumption ("ASCII or lowercase letters") and keep the
  solution simple; knowing why <code>length</code> can surprise you is the
  part that earns credit.
</div>
<p class="sub">
  One more ordering gotcha belongs here: <code>&lt;</code> on strings compares
  code units, not the dictionary order a human expects, so
  <code>"B" &lt; "a"</code> is <code>true</code> and
  <code>"a" &lt; "B"</code> is <code>false</code>. For human sorting use
  <code>a.localeCompare(b)</code>.
</p>

<h3>Parsing numbers out of strings: atoi and Roman numerals</h3>
<p>
  Parsing problems test whether you can turn a messy specification into a
  small state machine without losing a case. Two classics cover the habits.
</p>
<p>
  <b>String to integer (atoi).</b> The rules: skip leading spaces; read an
  optional <code>+</code> or <code>-</code>; read digits until the first
  non-digit; ignore the rest; clamp the result to the signed 32-bit range
  [−2³¹, 2³¹ − 1]. Each rule becomes one block of code, in this order:
</p>
<pre><code>function myAtoi(s) {
  const MAX = 2 ** 31 - 1;
  const MIN = -(2 ** 31);
  let i = 0;
  while (i &lt; s.length &amp;&amp; s[i] === " ") i++;
  let sign = 1;
  if (s[i] === "-" || s[i] === "+") {
    if (s[i] === "-") sign = -1;
    i++;
  }
  let value = 0;
  while (i &lt; s.length &amp;&amp; s[i] &gt;= "0" &amp;&amp; s[i] &lt;= "9") {
    value = value * 10 + (s.charCodeAt(i) - 48);
    if (value &gt; MAX + 1) break;
    i++;
  }
  const result = sign * value;
  if (result &gt; MAX) return MAX;
  if (result &lt; MIN) return MIN;
  return result === 0 ? 0 : result;
}</code></pre>
<h4>Dry run: myAtoi("   -042abc")</h4>
<table>
  <tr><th>step</th><th>i</th><th>character</th><th>action</th><th>value</th></tr>
  <tr><td>skip spaces</td><td>0 to 2</td><td>" "</td><td>advance</td><td>0</td></tr>
  <tr><td>sign</td><td>3</td><td>"-"</td><td>sign = −1, advance</td><td>0</td></tr>
  <tr><td>digit</td><td>4</td><td>"0"</td><td>0 × 10 + 0</td><td>0</td></tr>
  <tr><td>digit</td><td>5</td><td>"4"</td><td>0 × 10 + 4</td><td>4</td></tr>
  <tr><td>digit</td><td>6</td><td>"2"</td><td>4 × 10 + 2</td><td>42</td></tr>
  <tr><td>stop</td><td>7</td><td>"a"</td><td>not a digit, leave the loop</td><td>42</td></tr>
</table>
<p class="sub">
  The result is −42. Three details matter. The early <code>break</code> keeps
  <code>value</code> from growing without bound on a very long digit string,
  and the clamp afterwards still handles it. <code>sign * value</code> is
  <code>-0</code> for the input <code>"-0"</code>, so the last line turns
  it back into <code>0</code>. And the built-in <code>parseInt</code> is
  not a substitute: it accepts a hex prefix (<code>parseInt("0x1F")</code> is
  31), does not clamp, and gives <code>NaN</code> where atoi gives 0.
</p>
<p>
  <b>Roman numerals.</b> A symbol worth less than the one after it is
  subtracted (<code>IV</code> = 4, <code>XC</code> = 90); otherwise it is
  added. That is the whole rule for reading them:
</p>
<pre><code>function romanToInt(s) {
  const value = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  for (let i = 0; i &lt; s.length; i++) {
    const current = value[s[i]];
    const next = value[s[i + 1]];
    total += next &gt; current ? -current : current;
  }
  return total;
}</code></pre>
<h4>Dry run: romanToInt("MCMXCIV")</h4>
<table>
  <tr><th>symbol</th><th>value</th><th>next is bigger?</th><th>total after</th></tr>
  <tr><td>M</td><td>1000</td><td>no (C = 100)</td><td>1000</td></tr>
  <tr><td>C</td><td>100</td><td>yes (M = 1000)</td><td>900</td></tr>
  <tr><td>M</td><td>1000</td><td>no (X = 10)</td><td>1900</td></tr>
  <tr><td>X</td><td>10</td><td>yes (C = 100)</td><td>1890</td></tr>
  <tr><td>C</td><td>100</td><td>no (I = 1)</td><td>1990</td></tr>
  <tr><td>I</td><td>1</td><td>yes (V = 5)</td><td>1989</td></tr>
  <tr><td>V</td><td>5</td><td>no (end of string)</td><td>1994</td></tr>
</table>
<p class="sub">
  At the last symbol <code>s[i + 1]</code> does not exist, so
  <code>next</code> is <code>undefined</code>, and <code>undefined &gt; 5</code>
  is <code>false</code>: the final symbol is added with no special case.
</p>
<p>
  The reverse direction is a greedy loop over a table that lists the
  subtractive forms as entries of their own, largest first. Because 900 and
  400 and 90 appear in the table, the greedy choice never has to think about
  subtraction.
</p>
<pre><code>function intToRoman(num) {
  const table = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let out = "";
  for (const [amount, symbol] of table) {
    while (num &gt;= amount) {
      out += symbol;
      num -= amount;
    }
  }
  return out;
}</code></pre>
<p class="sub">
  <code>intToRoman(1994)</code> takes <code>M</code> (leaving 994),
  <code>CM</code> (94), <code>XC</code> (4) and <code>IV</code>, giving
  <code>"MCMXCIV"</code>, the string the previous trace read back. The
  standard numerals cover 1 to 3,999; for 4,000 the loop would write
  <code>"MMMM"</code>, which is not standard form, so the problem's range
  limit matters. <code>intToRoman</code> does a bounded amount of work, since
  no number from 1 to 3,999 needs more than 15 symbols, and
  <code>romanToInt</code> is O(n) in the length of the numeral.
</p>
<div class="warn">
  <span class="ttl">⚠ Parsing pitfalls, all one line each</span>
  Check the spec for what counts as whitespace (only <code>" "</code> here).
  Test the empty string, a sign with no digits (<code>"-"</code>), digits
  after a space (<code>"4 3"</code> reads as 4), and a number past the
  limit. Do the clamp after applying the sign, and watch for
  <code>-0</code>.
</div>

<h3>The in-place pattern</h3>
<p>
  A huge share of array interview questions ask for O(1) extra space,
  which means mutating the input instead of allocating a new array. The
  standard tool is <b>read and write pointers</b>: walk with two indices,
  overwrite in place, and treat everything past the write pointer as
  garbage.
</p>
<pre><code><span class="c">// remove all occurrences of val, in place, return new length</span>
function removeElement(nums, val) {
  let write = 0;
  for (let read = 0; read < nums.length; read++) {
    if (nums[read] !== val) {
      nums[write] = nums[read];
      write++;
    }
  }
  return write; <span class="c">// [0, write) is the real answer</span>
}</code></pre>
<p class="sub">
  This "read pointer scans everything, write pointer only advances on a
  keep" shape reappears constantly — it's the seed of the two-pointers
  chapter next.
</p>

<h3>Merging from the back: in place, without overwriting</h3>
<p>
  You are given two sorted arrays. The first, <code>nums1</code>, has room
  for everything: its first <code>m</code> slots hold real values and the
  last <code>n</code> slots are placeholder zeros. The second,
  <code>nums2</code>, holds <code>n</code> values. Merge them into
  <code>nums1</code>, sorted, without a third array.
</p>
<p>
  The obvious plan is to merge from the front, taking the smaller head each
  time. It fails for a concrete reason: when <code>nums2[0]</code> is smaller
  than <code>nums1[0]</code>, it has to be written to index 0, and that slot
  still holds an unread value of <code>nums1</code>. You would have to shift
  the whole array right first, which costs O(m) per insert and O(m · n)
  overall.
</p>
<p>
  The fix is to change the direction. The <b>largest</b> value of the merged
  result belongs in the last slot, and the last slot is free. So fill the
  array from the back, always writing the larger of the two current tails.
</p>
<pre><code>function mergeSorted(nums1, m, nums2, n) {
  let i = m - 1;
  let j = n - 1;
  let write = m + n - 1;
  while (j &gt;= 0) {
    if (i &gt;= 0 &amp;&amp; nums1[i] &gt; nums2[j]) {
      nums1[write] = nums1[i];
      i--;
    } else {
      nums1[write] = nums2[j];
      j--;
    }
    write--;
  }
}</code></pre>
<p>
  Why it is safe: at every moment the free slots are exactly the ones
  between the unread part of <code>nums1</code> and the written tail, and
  there are <code>j + 1</code> of them, the number of values still waiting in
  <code>nums2</code>. The write pointer can therefore never land on an
  unread value of <code>nums1</code>. Why the loop can stop when
  <code>j</code> runs out: whatever is left of <code>nums1</code> is already
  sorted and already in its final position.
</p>
<h4>Dry run: nums1 = [1, 3, 5, 0, 0, 0], m = 3, nums2 = [2, 4, 6], n = 3</h4>
<table>
  <tr><th>write</th><th>compare</th><th>value written</th><th>nums1 afterwards</th></tr>
  <tr><td>5</td><td>nums1[2] = 5 vs nums2[2] = 6</td><td>6, from nums2</td><td>[1, 3, 5, 0, 0, 6]</td></tr>
  <tr><td>4</td><td>nums1[2] = 5 vs nums2[1] = 4</td><td>5, from nums1</td><td>[1, 3, 5, 0, 5, 6]</td></tr>
  <tr><td>3</td><td>nums1[1] = 3 vs nums2[1] = 4</td><td>4, from nums2</td><td>[1, 3, 5, 4, 5, 6]</td></tr>
  <tr><td>2</td><td>nums1[1] = 3 vs nums2[0] = 2</td><td>3, from nums1</td><td>[1, 3, 3, 4, 5, 6]</td></tr>
  <tr><td>1</td><td>nums1[0] = 1 vs nums2[0] = 2</td><td>2, from nums2</td><td>[1, 2, 3, 4, 5, 6]</td></tr>
</table>
<p class="sub">
  The loop ran five times and stopped with <code>nums1[0] = 1</code>
  untouched, which is exactly where it belongs. The time is O(m + n), since
  every step writes one slot and moves one pointer, and the extra space is
  O(1). The other order of events is the instructive one: for
  <code>nums1 = [4, 5, 6, 0, 0, 0]</code> and <code>nums2 = [1, 2, 3]</code>
  every value of <code>nums1</code> is copied to the back first, and only
  then do the three values of <code>nums2</code> fill the front.
</p>
<div class="warn">
  <span class="ttl">⚠ Three ways this goes wrong</span>
  <b>Looping while either pointer is alive</b> (<code>i &gt;= 0 || j &gt;= 0</code>)
  forces you to handle both leftovers, and the <code>nums1</code> leftover is
  a pointless self-copy. Stop on <code>j &gt;= 0</code>.
  <b>Using <code>nums1.length</code> in place of <code>m</code></b> mixes the
  placeholder zeros into the data. <b>Writing <code>&gt;=</code> instead of
  <code>&gt;</code></b> still sorts correctly, but with
  <code>&gt;</code> the equal value of <code>nums1</code> is placed before the
  equal value of <code>nums2</code>, so the merge stays stable.
</div>
<p class="sub">
  <b>Recognise it:</b> two sorted sequences, spare room at the end of one,
  and a request for no extra array. The same direction change solves "replace
  every space with <code>%20</code> in place" (count the spaces, then fill
  from the back) and any problem where writing at the front would trample
  unread data.
</p>

<h3>Prefix sums — turn O(n) range queries into O(1)</h3>
<p>
  If you're going to ask "what's the sum of elements from index i to j?"
  <em>more than once</em> on the same array, recomputing each sum by
  scanning is wasteful. Precompute a running total once — O(n) — and every
  range sum after that is a subtraction, O(1).
</p>
<figure>
  <svg viewBox="0 0 640 195" class="dg" role="img" aria-label="A prefix sum array where each entry holds the running total up to that index, letting a range sum be computed as a single subtraction">
    <g class="rough">
      <rect class="box" x="20" y="20" width="70" height="40" />
      <rect class="boxy" x="90" y="20" width="70" height="40" />
      <rect class="boxy" x="160" y="20" width="70" height="40" />
      <rect class="boxy" x="230" y="20" width="70" height="40" />
      <rect class="boxy" x="300" y="20" width="70" height="40" />
    </g>
    <text class="sm" x="55" y="45" text-anchor="middle">3</text>
    <text class="sm" x="125" y="45" text-anchor="middle">1</text>
    <text class="sm" x="195" y="45" text-anchor="middle">4</text>
    <text class="sm" x="265" y="45" text-anchor="middle">1</text>
    <text class="sm" x="335" y="45" text-anchor="middle">5</text>
    <text class="lbl" x="20" y="85" style="font-size:13px">original array</text>

    <g class="rough">
      <rect class="boxr" x="20" y="100" width="70" height="40" />
      <rect class="box" x="90" y="100" width="70" height="40" />
      <rect class="box" x="160" y="100" width="70" height="40" />
      <rect class="box" x="230" y="100" width="70" height="40" />
      <rect class="boxg" x="300" y="100" width="70" height="40" />
    </g>
    <text class="sm rd" x="55" y="125" text-anchor="middle">3</text>
    <text class="sm" x="125" y="125" text-anchor="middle">4</text>
    <text class="sm" x="195" y="125" text-anchor="middle">8</text>
    <text class="sm" x="265" y="125" text-anchor="middle">9</text>
    <text class="sm gr" x="335" y="125" text-anchor="middle">14</text>
    <text class="lbl" x="20" y="160" style="font-size:13px">sum(1..4) = prefix[4] − prefix[0] = 14 − 3 = 11</text>
    <text class="lbl" x="20" y="182" style="font-size:13px">green cell minus red cell; prefix[i] = sum of everything up to and including index i</text>
  </svg>
  <figcaption>One O(n) pass builds the prefix array; every range sum after that is O(1) — a single subtraction.</figcaption>
</figure>
<pre><code>function buildPrefixSums(nums) {
  if (nums.length === 0) return [];
  const prefix = new Array(nums.length);
  prefix[0] = nums[0];
  for (let i = 1; i < nums.length; i++) {
    prefix[i] = prefix[i - 1] + nums[i];
  }
  return prefix;
}

<span class="c">// sum of nums[left..right] inclusive, O(1) after O(n) preprocessing</span>
function rangeSum(prefix, left, right) {
  return left === 0 ? prefix[right] : prefix[right] - prefix[left - 1];
}</code></pre>
<p class="sub">
  This is the single highest-leverage array trick for "answer many range
  queries" problems — it turns what looks like it needs O(n) per query
  (O(n·q) for q queries) into O(n) total preprocessing plus O(1) per
  query. The same idea extends to 2D (a prefix-sum matrix for rectangle
  sums) and to counting problems (prefix counts of a condition).
</p>
<p class="sub">
  This section is the short version. Subarray counting with a map of prefix
  sums, difference arrays, 2D prefix sums and the off-by-one traps get a
  chapter of their own: <a href="/dsa/dsa-prefix-sums">Prefix sums</a>.
  Below, the same "precompute a running aggregate" idea shows up again with
  products and minimums.
</p>

<h3>Kadane's algorithm — the maximum subarray, in one pass</h3>
<p>
  "Find the contiguous subarray with the largest sum" looks like it needs
  checking every subarray — O(n²). Kadane's insight: at each position,
  the best subarray ending <em>here</em> is either "extend the previous
  best" or "start fresh from here" — whichever is bigger — because a
  negative running sum can only ever hurt what comes after it.
</p>
<pre><code>function maxSubArray(nums) {
  let bestSoFar = nums[0];
  let bestEndingHere = nums[0];

  for (let i = 1; i < nums.length; i++) {
    bestEndingHere = Math.max(nums[i], bestEndingHere + nums[i]);
    bestSoFar = Math.max(bestSoFar, bestEndingHere);
  }
  return bestSoFar;
}</code></pre>
<h4>Dry run: maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4])</h4>
<table>
  <tr><th>i</th><th>nums[i]</th><th>bestEndingHere</th><th>bestSoFar</th></tr>
  <tr><td>0</td><td>-2</td><td>-2</td><td>-2</td></tr>
  <tr><td>1</td><td>1</td><td>max(1, -2+1)=1</td><td>1</td></tr>
  <tr><td>2</td><td>-3</td><td>max(-3, 1-3)=-2</td><td>1</td></tr>
  <tr><td>3</td><td>4</td><td>max(4, -2+4)=4</td><td>4</td></tr>
  <tr><td>4</td><td>-1</td><td>max(-1, 4-1)=3</td><td>4</td></tr>
  <tr><td>5</td><td>2</td><td>max(2, 3+2)=5</td><td>5</td></tr>
  <tr><td>6</td><td>1</td><td>max(1, 5+1)=6</td><td>6</td></tr>
  <tr><td>7</td><td>-5</td><td>max(-5, 6-5)=1</td><td>6</td></tr>
  <tr><td>8</td><td>4</td><td>max(4, 1+4)=5</td><td>6</td></tr>
</table>
<p class="sub">
  The interesting row is i=3: <code>bestEndingHere</code> resets to
  <code>nums[3]</code> alone (4) instead of extending the still-negative
  running sum (-2 + 4 = 2). Dropping a negative prefix entirely, rather
  than dragging it forward, is exactly what lets one O(n) pass replace
  checking every possible subarray.
</p>

<h3>Kadane's variants: the indices, and the circular array</h3>
<p>
  Interviewers rarely stop at "return the largest sum". Two follow-ups come
  up again and again, and both are small changes to the same loop.
</p>
<p>
  <b>Return the subarray, not just its sum.</b> You need to know where the
  best run started. The run restarts exactly when the sum so far has become
  a burden, that is, when it is negative; so remember the index at which the
  current run began and copy it out whenever a new best appears.
</p>
<pre><code>function maxSubArrayWithRange(nums) {
  let best = nums[0], bestStart = 0, bestEnd = 0;
  let current = nums[0], start = 0;
  for (let i = 1; i &lt; nums.length; i++) {
    if (current &lt; 0) {
      current = nums[i];
      start = i;
    } else {
      current += nums[i];
    }
    if (current &gt; best) {
      best = current;
      bestStart = start;
      bestEnd = i;
    }
  }
  return { sum: best, start: bestStart, end: bestEnd };
}</code></pre>
<p class="sub">
  This is the same decision as <code>Math.max(nums[i], current + nums[i])</code>:
  extending is better exactly when <code>current</code> is positive. On the
  chapter's example <code>[-2, 1, -3, 4, -1, 2, 1, -5, 4]</code> the run
  restarts at index 1 (because −2 is negative), again at index 3 (because
  1 − 3 = −2 is negative), and the best moves to 6 at index 6, so the answer
  is <code>{ sum: 6, start: 3, end: 6 }</code>, the subarray
  <code>[4, -1, 2, 1]</code>. With ties the strict <code>&gt;</code> keeps
  the earliest best.
</p>
<p>
  <b>The array is circular.</b> Now the best subarray may wrap around from
  the end back to the start. There are two shapes the best answer can take:
  an ordinary run in the middle (plain Kadane finds it), or a run that wraps.
  A wrapping run is the whole array minus an ordinary run in the middle, so
  to make the wrap as large as possible you subtract the <em>smallest</em>
  ordinary run. Run Kadane twice, once for the maximum and once for the
  minimum, and take the better of the two shapes.
</p>
<pre><code>function maxSubarrayCircular(nums) {
  let total = 0;
  let curMax = 0, bestMax = -Infinity;
  let curMin = 0, bestMin = Infinity;
  for (const x of nums) {
    total += x;
    curMax = Math.max(x, curMax + x);
    bestMax = Math.max(bestMax, curMax);
    curMin = Math.min(x, curMin + x);
    bestMin = Math.min(bestMin, curMin);
  }
  return bestMax &gt; 0 ? Math.max(bestMax, total - bestMin) : bestMax;
}</code></pre>
<h4>Dry run: maxSubarrayCircular([5, -3, 5])</h4>
<table>
  <tr><th>x</th><th>curMax</th><th>bestMax</th><th>curMin</th><th>bestMin</th><th>total</th></tr>
  <tr><td>5</td><td>5</td><td>5</td><td>5</td><td>5</td><td>5</td></tr>
  <tr><td>−3</td><td>2</td><td>5</td><td>−3</td><td>−3</td><td>2</td></tr>
  <tr><td>5</td><td>7</td><td>7</td><td>2</td><td>−3</td><td>7</td></tr>
</table>
<p class="sub">
  <code>bestMax</code> is 7 (the whole array). The wrapping option is
  <code>total − bestMin</code> = 7 − (−3) = 10, which is the last 5 followed
  by the first 5, with the −3 in the middle skipped. The answer is 10.
</p>
<div class="warn">
  <span class="ttl">⚠ The all-negative case breaks the formula</span>
  For <code>[-3, -2, -3]</code> the minimum run is the whole array, so
  <code>total − bestMin</code> is 0: the "wrapping" run is empty, and 0 beats
  the true answer, −2. That is why the code only trusts the wrap when
  <code>bestMax &gt; 0</code>. If some element is positive then
  <code>bestMax</code> is positive, and an "empty wrap" worth 0 can never
  beat it, so the formula is safe even in the cases where the whole array is
  the minimum run. When no element is positive, the best answer is the
  largest single element (a run never gets larger as it grows), which
  is what <code>bestMax</code> already holds.
</div>

<h3>Prefix and suffix products, and the running minimum</h3>
<p>
  The prefix-sum idea works for any operation where you can build the answer
  for a range from the answers for its pieces. Two problems show the
  pattern with different operations.
</p>
<p>
  <b>Product of the array except self.</b> For each index, return the
  product of all the other elements. The tempting answer divides the total
  product by <code>nums[i]</code>. It breaks on zeros: one zero makes the
  total 0 and every quotient 0 (or <code>NaN</code> when you divide 0 by 0),
  while the right answer has a non-zero entry at the zero's own position.
  And the problem usually forbids division anyway.
</p>
<p>
  Think of what the answer at index <code>i</code> is made of: the product of
  everything to its left times the product of everything to its right. Each
  of those is a running product, one growing left to right and one growing
  right to left. You do not need two extra arrays: write the left products
  into the output, then sweep back from the right keeping a single running
  variable.
</p>
<pre><code>function productExceptSelf(nums) {
  const n = nums.length;
  const out = new Array(n).fill(1);
  let left = 1;
  for (let i = 0; i &lt; n; i++) {
    out[i] = left;
    left *= nums[i];
  }
  let right = 1;
  for (let i = n - 1; i &gt;= 0; i--) {
    out[i] *= right;
    right *= nums[i];
  }
  return out;
}</code></pre>
<h4>Dry run: productExceptSelf([1, 2, 3, 4])</h4>
<table>
  <tr><th>pass</th><th>i</th><th>running value used</th><th>out afterwards</th></tr>
  <tr><td>left to right</td><td>0</td><td>left = 1</td><td>[1, 1, 1, 1]</td></tr>
  <tr><td>left to right</td><td>1</td><td>left = 1</td><td>[1, 1, 1, 1]</td></tr>
  <tr><td>left to right</td><td>2</td><td>left = 2</td><td>[1, 1, 2, 1]</td></tr>
  <tr><td>left to right</td><td>3</td><td>left = 6</td><td>[1, 1, 2, 6]</td></tr>
  <tr><td>right to left</td><td>3</td><td>right = 1</td><td>[1, 1, 2, 6]</td></tr>
  <tr><td>right to left</td><td>2</td><td>right = 4</td><td>[1, 1, 8, 6]</td></tr>
  <tr><td>right to left</td><td>1</td><td>right = 12</td><td>[1, 12, 8, 6]</td></tr>
  <tr><td>right to left</td><td>0</td><td>right = 24</td><td>[24, 12, 8, 6]</td></tr>
</table>
<p class="sub">
  Time O(n), and O(1) extra space not counting the output array, which the
  problem requires anyway. The same two-sweep shape computes "sum of all
  others", "gcd of all others" or "max of all others", because it needs
  nothing from the operation except that it combines pieces.
</p>
<div class="warn">
  <span class="ttl">⚠ Negative zero</span>
  <code>0 * -1</code> is <code>-0</code> in JavaScript, so
  <code>productExceptSelf([1, 0, -1])</code> returns
  <code>[-0, -1, 0]</code>. It satisfies <code>=== 0</code> and
  <code>JSON.stringify</code> prints it as <code>0</code>, but
  <code>Object.is(-0, 0)</code> is <code>false</code>, and a test helper built
  on <code>Object.is</code> will call your correct answer wrong. If you
  see it, normalise with <code>+ 0</code> on the output (<code>-0 + 0</code>
  is <code>0</code>).
</div>
<p>
  <b>Best time to buy and sell once.</b> Given daily prices, find the largest
  <code>prices[sell] − prices[buy]</code> with <code>buy &lt; sell</code>.
  Fix the selling day. The best buying day for it is the cheapest day
  before it, and "cheapest so far" is a running minimum, a prefix
  aggregate built as you go. So one pass is enough: at each price, first
  compare against the cheapest earlier price, then update the cheapest.
</p>
<pre><code>function maxProfit(prices) {
  let cheapest = Infinity;
  let best = 0;
  for (const price of prices) {
    best = Math.max(best, price - cheapest);
    cheapest = Math.min(cheapest, price);
  }
  return best;
}</code></pre>
<h4>Dry run: maxProfit([7, 1, 5, 3, 6, 4])</h4>
<table>
  <tr><th>price</th><th>price − cheapest (before update)</th><th>best</th><th>cheapest after</th></tr>
  <tr><td>7</td><td>7 − ∞ = −∞</td><td>0</td><td>7</td></tr>
  <tr><td>1</td><td>1 − 7 = −6</td><td>0</td><td>1</td></tr>
  <tr><td>5</td><td>5 − 1 = 4</td><td>4</td><td>1</td></tr>
  <tr><td>3</td><td>3 − 1 = 2</td><td>4</td><td>1</td></tr>
  <tr><td>6</td><td>6 − 1 = 5</td><td>5</td><td>1</td></tr>
  <tr><td>4</td><td>4 − 1 = 3</td><td>5</td><td>1</td></tr>
</table>
<p class="sub">
  The answer is 5: buy at 1, sell at 6. Starting <code>best</code> at 0
  (not at <code>-Infinity</code>) is the "do nothing" option, which is why a
  falling market returns 0 instead of a negative number. The sell can never
  precede the buy, because <code>cheapest</code> only ever holds prices
  from earlier days. Several transactions, a cooldown, or a fee are the
  same idea with state, and live in
  <a href="/dsa/dsa-dp-state-machines">DP state machines</a>.
</p>

<h3>Boyer-Moore voting: the majority element</h3>
<p>
  A <b>majority element</b> appears strictly more than n/2 times. The first
  answers are a hash map of counts (O(n) time, O(n) space) and sorting then
  reading the middle element (O(n log n) time, because more than half the
  array is one value, so it must sit at the middle index). The vote gets the
  same answer in O(n) time and O(1) space, and the reason it works is worth
  deriving rather than memorizing.
</p>
<p>
  Take any two <em>different</em> values and cross them out of the array
  together. If a majority value exists, each crossed-out pair contains at
  most one copy of it. So after removing the pair, the majority value still
  makes up more than half of what remains. Repeat until only copies of one
  value are left: that value is the majority. The algorithm does the
  crossing out on the fly, using one remembered value and a count of how many
  unmatched copies of it are waiting.
</p>
<pre><code>function majorityElement(nums) {
  let candidate = null;
  let count = 0;
  for (const x of nums) {
    if (count === 0) candidate = x;
    count += x === candidate ? 1 : -1;
  }
  return candidate;
}</code></pre>
<h4>Dry run: majorityElement([2, 2, 1, 1, 1, 2, 2])</h4>
<table>
  <tr><th>x</th><th>candidate</th><th>count</th><th>what happened</th></tr>
  <tr><td>2</td><td>2</td><td>1</td><td>count was 0, so adopt 2</td></tr>
  <tr><td>2</td><td>2</td><td>2</td><td>same as candidate</td></tr>
  <tr><td>1</td><td>2</td><td>1</td><td>a 1 cancels one 2</td></tr>
  <tr><td>1</td><td>2</td><td>0</td><td>a 1 cancels the other 2</td></tr>
  <tr><td>1</td><td>1</td><td>1</td><td>count was 0, so adopt 1</td></tr>
  <tr><td>2</td><td>1</td><td>0</td><td>a 2 cancels the 1</td></tr>
  <tr><td>2</td><td>2</td><td>1</td><td>count was 0, so adopt 2</td></tr>
</table>
<p class="sub">
  The candidate flips twice and ends as 2, which does appear 4 times out of
  7. The candidate along the way is not the answer so far; it is only the
  survivor of the cancellations, and the true majority is guaranteed to be
  the survivor at the end.
</p>
<div class="warn">
  <span class="ttl">⚠ The guarantee is part of the algorithm</span>
  The vote only proves "if a majority exists, it is the candidate". It says
  nothing when none exists: for <code>[1, 2, 3]</code> it returns 3, which
  appears once in three. When the problem does not promise a majority, add a
  second pass that counts the candidate and returns it only if the count
  exceeds n/2. That second pass is also O(n) and still O(1) space.
</div>
<p>
  <b>More than n/3.</b> The same cancellation works with groups of three
  distinct values instead of pairs. At most two values can appear more than
  n/3 times, so keep two candidates and two counts. A value that matches
  neither candidate and finds both counts above zero cancels one from each.
  Because this variant never promises that its candidates are real, the
  verification pass is not optional here.
</p>
<pre><code>function majorityThird(nums) {
  let a = null, b = null, countA = 0, countB = 0;
  for (const x of nums) {
    if (x === a) countA++;
    else if (x === b) countB++;
    else if (countA === 0) { a = x; countA = 1; }
    else if (countB === 0) { b = x; countB = 1; }
    else { countA--; countB--; }
  }
  countA = 0;
  countB = 0;
  for (const x of nums) {
    if (x === a) countA++;
    else if (x === b) countB++;
  }
  const out = [];
  if (countA &gt; nums.length / 3) out.push(a);
  if (countB &gt; nums.length / 3) out.push(b);
  return out;
}</code></pre>
<p class="sub">
  <b>Recognise it:</b> "more than half" or "more than a third", plus a request
  for O(1) space. If space is not constrained, a <code>Map</code> of counts is
  simpler and no worse to explain; the vote is the answer to the follow-up
  "can you do it without extra memory?".
</p>

<h3>Rotating an array in O(1) space — the triple-reversal trick</h3>
<p>
  Rotating right by k with a new array is easy but O(n) space. The
  in-place version uses a neat property: reversing the whole array, then
  reversing each of the two pieces that should end up in the "wrong"
  order, produces a correct rotation.
</p>
<pre><code>function rotate(nums, k) {
  const n = nums.length;
  if (n === 0) return;
  k = ((k % n) + n) % n; <span class="c">// also maps a negative k to the equivalent right rotation</span>
  reverse(nums, 0, nums.length - 1);  <span class="c">// reverse everything</span>
  reverse(nums, 0, k - 1);            <span class="c">// un-reverse the first k</span>
  reverse(nums, k, nums.length - 1);  <span class="c">// un-reverse the rest</span>
}

function reverse(arr, lo, hi) {
  while (lo < hi) {
    [arr[lo], arr[hi]] = [arr[hi], arr[lo]];
    lo++; hi--;
  }
}
<span class="c">// [1,2,3,4,5,6,7], k=3
   reverse all    → [7,6,5,4,3,2,1]
   reverse [0,k)  → [5,6,7,4,3,2,1]
   reverse [k,n)  → [5,6,7,1,2,3,4]  ← correctly rotated right by 3</span></code></pre>
<p class="sub">
  Three O(n) reversals is still O(n) total, but O(1) extra space instead
  of O(n) — the kind of tradeoff interviewers specifically probe for with
  "can you do it without the extra array?"
</p>

<h3>The array as its own hash table: marking and cyclic placement</h3>
<p>
  A hash map answers "have I seen this value?" in O(1), at the cost of O(n)
  memory. Some problems hand you a shortcut: the values are
  <b>tied to the indices</b>. If an array of length n holds numbers from 1 to
  n, then the value <code>v</code> has a natural home, the slot
  <code>v − 1</code>, and the array itself can play the role of the map. Two
  techniques use that, and they answer the follow-up "can you do it in O(1)
  extra space?".
</p>

<h4>Technique 1: mark the slot by flipping its sign</h4>
<p>
  <b>Find all numbers missing from 1..n.</b> The array holds n values from
  1 to n, some repeated, so some values are absent. Visit each value
  <code>x</code>, and make <code>nums[|x| − 1]</code> negative to record
  "the value |x| exists". After the pass, an index whose slot is still
  positive was never marked, so its value <code>i + 1</code> is missing.
</p>
<pre><code>function findDisappeared(nums) {
  for (const x of nums) {
    const idx = Math.abs(x) - 1;
    if (nums[idx] &gt; 0) nums[idx] = -nums[idx];
  }
  const missing = [];
  for (let i = 0; i &lt; nums.length; i++) {
    if (nums[i] &gt; 0) missing.push(i + 1);
  }
  return missing;
}</code></pre>
<h4>Dry run: findDisappeared([4, 3, 2, 7, 8, 2, 3, 1])</h4>
<table>
  <tr><th>x as read</th><th>slot marked</th><th>nums afterwards</th></tr>
  <tr><td>4</td><td>3</td><td>[4, 3, 2, −7, 8, 2, 3, 1]</td></tr>
  <tr><td>3</td><td>2</td><td>[4, 3, −2, −7, 8, 2, 3, 1]</td></tr>
  <tr><td>−2</td><td>1</td><td>[4, −3, −2, −7, 8, 2, 3, 1]</td></tr>
  <tr><td>−7</td><td>6</td><td>[4, −3, −2, −7, 8, 2, −3, 1]</td></tr>
  <tr><td>8</td><td>7</td><td>[4, −3, −2, −7, 8, 2, −3, −1]</td></tr>
  <tr><td>2</td><td>1</td><td>unchanged: already negative</td></tr>
  <tr><td>−3</td><td>2</td><td>unchanged: already negative</td></tr>
  <tr><td>−1</td><td>0</td><td>[−4, −3, −2, −7, 8, 2, −3, −1]</td></tr>
</table>
<p class="sub">
  Slots 4 and 5 are still positive, so the missing values are 5 and 6. Two
  details carry the whole technique. A value you read may already have been
  turned negative by an earlier mark, so the index is taken from
  <code>Math.abs(x)</code>. And a mark is only set when the slot is positive,
  so a repeated value does not flip it back. The same trick finds
  duplicates: if the slot is <i>already</i> negative when you arrive, you
  have seen this value before.
</p>
<pre><code>function findDuplicates(nums) {
  const dupes = [];
  for (const x of nums) {
    const idx = Math.abs(x) - 1;
    if (nums[idx] &lt; 0) dupes.push(Math.abs(x));
    else nums[idx] = -nums[idx];
  }
  return dupes;
}</code></pre>
<p class="sub">
  For the same input it returns <code>[2, 3]</code>: the second 2 meets a
  slot already marked, and so does the second 3. This version assumes every
  value appears once or twice. A value that appears three times would be
  reported twice, because its slot is already negative on both later visits.
</p>

<h4>Technique 2: put each value in its home</h4>
<p>
  Marking tells you what is present. <b>Cyclic placement</b> goes further and
  actually rearranges the array so that value <code>v</code> sits at index
  <code>v − 1</code>, using swaps. Afterwards, the first index
  <code>i</code> whose value is not <code>i + 1</code> reveals the answer.
  The classic use is <b>the first missing positive</b>: given any integers,
  including negatives, zeros and huge numbers, find the smallest positive
  integer that is absent.
</p>
<p>
  The key observation: among n numbers, the answer must be in the range 1 to
  n + 1. If the array holds all of 1 to n, the answer is n + 1; otherwise a
  gap in 1 to n exists and the answer is the first gap. So values outside
  1 to n are irrelevant, and values inside have a home slot.
</p>
<pre><code>function firstMissingPositive(nums) {
  const n = nums.length;
  for (let i = 0; i &lt; n; i++) {
    while (
      nums[i] &gt;= 1 &amp;&amp;
      nums[i] &lt;= n &amp;&amp;
      nums[nums[i] - 1] !== nums[i]
    ) {
      const home = nums[i] - 1;
      [nums[i], nums[home]] = [nums[home], nums[i]];
    }
  }
  for (let i = 0; i &lt; n; i++) {
    if (nums[i] !== i + 1) return i + 1;
  }
  return n + 1;
}</code></pre>
<h4>Dry run: firstMissingPositive([3, 4, −1, 1])</h4>
<table>
  <tr><th>i</th><th>swap</th><th>nums afterwards</th><th>why</th></tr>
  <tr><td>0</td><td>index 0 with index 2</td><td>[−1, 4, 3, 1]</td><td>3 belongs at index 2; −1 comes back and is out of range, so the loop at i = 0 stops</td></tr>
  <tr><td>1</td><td>index 1 with index 3</td><td>[−1, 1, 3, 4]</td><td>4 belongs at index 3</td></tr>
  <tr><td>1</td><td>index 1 with index 0</td><td>[1, −1, 3, 4]</td><td>the 1 that arrived belongs at index 0; −1 comes back and stops the loop</td></tr>
  <tr><td>2</td><td>none</td><td>[1, −1, 3, 4]</td><td>3 is already at index 2</td></tr>
  <tr><td>3</td><td>none</td><td>[1, −1, 3, 4]</td><td>4 is already at index 3</td></tr>
</table>
<p class="sub">
  The scan finds <code>nums[1] = −1</code> where a 2 should be, so the answer
  is 2. For <code>[7, 8, 9, 11, 12]</code> nothing is in range, no swap
  happens, and the first slot already fails, giving 1. For
  <code>[1, 2, 0]</code> slots 0 and 1 hold 1 and 2, and slot 2 holds 0
  instead of 3, so the answer is 3. When every slot passes, as in
  <code>[2, 1]</code> after placement, the answer is <code>n + 1</code>, here 3.
</p>
<p>
  <b>Why it is O(n) with a loop inside a loop.</b> Every swap puts one value
  into its final home slot, and a value in its home is never moved again
  (the <code>while</code> test stops as soon as the home already holds that
  value). There are at most n homes to fill, so all the inner loops together
  perform at most n swaps, and the outer loop adds n steps. The nested shape
  is the same shared-budget argument as the two-pointer loops in the
  complexity chapter.
</p>
<div class="warn">
  <span class="ttl">⚠ Three bugs that cost the offer</span>
  <b>The swap that eats a value.</b> Writing
  <code>[nums[i], nums[nums[i] − 1]] = [nums[nums[i] − 1], nums[i]]</code>
  looks the same, but the second target is worked out <em>after</em>
  <code>nums[i]</code> has already been overwritten, so it points at the
  wrong slot. On <code>[3, 1, 2]</code> it produces <code>[2, 3, 2]</code>,
  losing the 1. Compute <code>home</code> first, as the code does.
  <b>Dropping the duplicate test.</b> Without
  <code>nums[nums[i] − 1] !== nums[i]</code> a repeated value swaps with its
  own twin forever, an infinite loop.
  <b><code>if</code> instead of <code>while</code>.</b> After one swap, the
  value that arrived at index <code>i</code> may also belong elsewhere, and an
  <code>if</code> moves on without placing it.
</div>
<p class="sub">
  <b>Recognise it:</b> the values are in 1..n or 0..n−1 (tied to the length)
  and the problem asks for missing, duplicate, or "first absent" with
  O(1) space; or the answer is guaranteed to lie in 1..n+1. Both techniques
  <b>modify the input</b>: if you must not, say so and use a <code>Set</code>,
  or undo the marks by taking <code>Math.abs</code> of every slot at the end.
</p>

<h3>2D arrays — same rules, one more dimension</h3>
<p>
  A 2D array in JS is really an array of arrays — each row is its own
  separate array object, stored at scattered locations (unlike a true
  contiguous 2D block in lower-level languages). <code>grid[i][j]</code>
  is still O(1): it's two index lookups chained, each O(1).
</p>
<figure>
  <svg viewBox="0 0 500 190" class="dg" role="img" aria-label="A 2D array as an array of separate row arrays, each row its own object, indexed as grid of i then j">
    <g class="rough">
      <rect class="boxy" x="20" y="20" width="130" height="30" />
      <rect class="boxy" x="20" y="60" width="130" height="30" />
      <rect class="boxy" x="20" y="100" width="130" height="30" />
      <rect class="box" x="220" y="10" width="220" height="34" />
      <rect class="box" x="220" y="55" width="220" height="34" />
      <rect class="box" x="220" y="100" width="220" height="34" />
    </g>
    <text class="sm" x="85" y="40" text-anchor="middle">grid[0] →</text>
    <text class="sm" x="85" y="80" text-anchor="middle">grid[1] →</text>
    <text class="sm" x="85" y="120" text-anchor="middle">grid[2] →</text>
    <text class="sm" x="330" y="32" text-anchor="middle">1  2  3</text>
    <text class="sm" x="330" y="77" text-anchor="middle">4  5  6</text>
    <text class="sm" x="330" y="122" text-anchor="middle">7  8  9</text>
    <text class="lbl" x="20" y="165" style="font-size:13px">grid[1][2] → row 1, then index 2 within it → 6. Two O(1) lookups, chained.</text>
  </svg>
  <figcaption>Three separate row arrays, not one contiguous block — which is exactly why the fill()-sharing bug below happens.</figcaption>
</figure>
<pre><code><span class="c">// row-major traversal — the standard order, matches memory/cache-friendly access</span>
function traverse2D(grid) {
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      console.log(grid[row][col]);
    }
  }
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ The shared-row bug</span>
  <code>Array(n).fill(Array(m).fill(0))</code> creates <b>one</b> inner
  array and reuses the same reference for every row — mutate
  <code>grid[0][0]</code> and you'll find <code>grid[1][0]</code> changed
  too. Build each row independently instead:
  <pre><code>const grid = Array.from({ length: n }, () => Array(m).fill(0));</code></pre>
</div>

<div class="say">
  <span class="ttl">Say it like this →</span> "Arrays give O(1) random
  access because the address is computed, not searched — but any operation
  that has to shift elements is O(n), and strings are immutable so
  building one char-by-char in a loop can be O(n²) in the worst case, so I batch it with an array and join."
</div>

<h3>Common gotchas worth knowing cold</h3>
<ul>
  <li><b>Sparse arrays</b> — <code>new Array(5)</code> creates 5 empty
    slots, not zeros; <code>.map()</code> skips them.</li>
  <li><b>Copying</b> — <code>const b = a</code> copies the reference, not
    the array. Use <code>[...a]</code> or <code>a.slice()</code> for a
    shallow copy.</li>
  <li><b><code>sort()</code> mutates</b> the original array and defaults to
    <em>string</em> comparison — <code>[10, 2, 1].sort()</code> gives
    <code>[1, 10, 2]</code> unless you pass a comparator.</li>
  <li><b>Dynamic array growth</b> is covered in depth in the complexity
    chapter's amortized-analysis section — the short version:
    <code>push()</code> is amortized O(1) because the underlying buffer
    doubles instead of growing by one each time.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Explain why <code>arr.unshift(x)</code> is O(n) even though it's one method call, and name the interview trap it causes when used inside a loop.</li>
    <li>Build a prefix-sum array and answer a range-sum query in O(1), then say why it beats rescanning per query.</li>
    <li>Trace Kadane's algorithm on a new array by hand, including at least one point where it resets instead of extending.</li>
    <li>Explain the shared-row bug in <code>Array(n).fill(Array(m).fill(0))</code> and how <code>Array.from</code> avoids it.</li>
    <li>Given a new problem, decide whether it needs O(1) index access (array) or O(n²)-avoiding batched string building — before writing any code.</li>
    <li>Merge two sorted arrays into the spare room of the first by filling from the back, and say why the front would overwrite unread values.</li>
    <li>Return the range of the best subarray, and solve the circular version as the larger of plain Kadane and total minus the smallest run, with the all-negative case handled.</li>
    <li>Build product-except-self from a left sweep and a right sweep, and the best stock profit from a running minimum.</li>
    <li>Explain why the Boyer-Moore vote finds a majority element, and why a second counting pass is needed when no majority is promised.</li>
    <li>Use the array's own indices as a hash table (sign marking and cyclic placement) when values lie in 1..n, and name what it costs: the input is modified.</li>
    <li>Count letters in a 26-slot table, and say where it silently fails (other alphabets, UTF-16 pairs); parse atoi and Roman numerals with every rule in its own step.</li>
  </ul>
</div>`,
};
