import type { Chapter } from "../types";

export const dsaStringAlgorithms: Chapter = {
  id: "dsa-string-algorithms",
  num: "A8",
  title: "String algorithms",
  short: "String algorithms",
  levels: ["advanced"],
  prerequisites: ["dsa-hashing", "dsa-prefix-sums"],
  practice: [
    "ex-implement-strstr",
    "ex-prefix-function",
    "ex-repeated-substring",
    "ex-longest-happy-prefix",
    "ex-repeated-dna",
    "ex-longest-duplicate-substring",
    "ex-sum-of-scores",
    "ex-rotate-string",
    "ex-shortest-palindrome",
    "ex-stream-of-characters",
    "ex-smallest-rotation",
    "ex-distinct-substrings",
    "ex-count-keyword-occurrences",
  ],
  ready: true,
  subtitle: "Preprocess the pattern once, and you never have to look backward in the text again.",
  body: `<h3>The insight: a mismatch still tells you something</h3>
<p>
  The naive substring search tries every alignment and, on a mismatch,
  throws away everything it just learned — it slides the pattern one step
  right and re-compares from character zero. That's O(n·m). But a
  mismatch after <em>k</em> matched characters is not zero information:
  you now know exactly what the last k characters of the text were, because
  they were the first k characters of the pattern. Every fast string
  algorithm in this chapter is a different way of cashing in that
  information.
</p>
<figure>
  <svg viewBox="0 0 640 230" class="dg" role="img" aria-label="A pattern aligned against a text, mismatching at its last character, with the naive one-step shift compared against the KMP shift of two that reuses the already-matched prefix">
    <g class="rough">
      <rect class="box" x="20" y="42" width="38" height="36" rx="4" />
      <rect class="box" x="58" y="42" width="38" height="36" rx="4" />
      <rect class="box" x="96" y="42" width="38" height="36" rx="4" />
      <rect class="box" x="134" y="42" width="38" height="36" rx="4" />
      <rect class="box" x="172" y="42" width="38" height="36" rx="4" />
      <rect class="box" x="210" y="42" width="38" height="36" rx="4" />
      <rect class="box" x="248" y="42" width="38" height="36" rx="4" />
    </g>
    <g class="rough">
      <rect class="boxg" x="20" y="96" width="38" height="36" rx="4" />
      <rect class="boxg" x="58" y="96" width="38" height="36" rx="4" />
      <rect class="boxg" x="96" y="96" width="38" height="36" rx="4" />
      <rect class="boxg" x="134" y="96" width="38" height="36" rx="4" />
      <rect class="boxg" x="172" y="96" width="38" height="36" rx="4" />
      <rect class="boxr" x="210" y="96" width="38" height="36" rx="4" />
    </g>
    <g class="rough">
      <rect class="boxg" x="96" y="155" width="38" height="36" rx="4" />
      <rect class="boxg" x="134" y="155" width="38" height="36" rx="4" />
      <rect class="boxg" x="172" y="155" width="38" height="36" rx="4" />
      <rect class="box" x="210" y="155" width="38" height="36" rx="4" />
      <rect class="box" x="248" y="155" width="38" height="36" rx="4" />
      <rect class="box" x="286" y="155" width="38" height="36" rx="4" />
    </g>
    <text class="sm" x="20" y="32">text</text>
    <text class="sm" x="39" y="66" text-anchor="middle">a</text>
    <text class="sm" x="77" y="66" text-anchor="middle">b</text>
    <text class="sm" x="115" y="66" text-anchor="middle">a</text>
    <text class="sm" x="153" y="66" text-anchor="middle">b</text>
    <text class="sm" x="191" y="66" text-anchor="middle">a</text>
    <text class="sm" x="229" y="66" text-anchor="middle">b</text>
    <text class="sm" x="267" y="66" text-anchor="middle">c</text>
    <text class="sm" x="39" y="120" text-anchor="middle">a</text>
    <text class="sm" x="77" y="120" text-anchor="middle">b</text>
    <text class="sm" x="115" y="120" text-anchor="middle">a</text>
    <text class="sm" x="153" y="120" text-anchor="middle">b</text>
    <text class="sm" x="191" y="120" text-anchor="middle">a</text>
    <text class="sm rd" x="229" y="120" text-anchor="middle">c</text>
    <text class="sm" x="115" y="179" text-anchor="middle">a</text>
    <text class="sm" x="153" y="179" text-anchor="middle">b</text>
    <text class="sm" x="191" y="179" text-anchor="middle">a</text>
    <text class="sm" x="229" y="179" text-anchor="middle">b</text>
    <text class="sm" x="267" y="179" text-anchor="middle">a</text>
    <text class="sm" x="305" y="179" text-anchor="middle">c</text>
    <text class="lbl" x="340" y="62" style="font-size:14px">5 characters match</text>
    <text class="lbl rd" x="340" y="112" style="font-size:14px">mismatch at p[5]</text>
    <text class="sm" x="340" y="134">naive: shift 1, recompare all 6</text>
    <text class="lbl gr" x="340" y="168" style="font-size:14px">KMP: fail[4] = 3</text>
    <text class="sm gr" x="340" y="190">keep the matched "aba",</text>
    <text class="sm gr" x="340" y="208">shift 2, resume at p[3]</text>
  </svg>
  <figcaption>The three already-matched characters in the shifted row were never re-read from the text — that reuse is the entire speedup.</figcaption>
</figure>

<h3>The prefix function: what KMP actually precomputes</h3>
<p>
  For a pattern <code>p</code>, define <code>fail[i]</code> as the length of
  the longest <b>proper</b> prefix of <code>p[0..i]</code> that is also a
  suffix of <code>p[0..i]</code>. "Proper" means it can't be the whole thing
  — otherwise the answer would trivially always be <code>i + 1</code>. This
  single array is all KMP needs: when a mismatch happens after
  <code>len</code> matched characters, <code>fail[len - 1]</code> tells you
  the largest number of characters you may keep without re-reading the text.
</p>
<figure>
  <svg viewBox="0 0 640 240" class="dg" role="img" aria-label="The failure table for the pattern ababaca, showing each character above its failure value, with an arc marking the fallback from index five back to index two">
    <g class="rough">
      <rect class="box" x="40" y="52" width="50" height="42" rx="4" />
      <rect class="box" x="90" y="52" width="50" height="42" rx="4" />
      <rect class="box" x="140" y="52" width="50" height="42" rx="4" />
      <rect class="box" x="190" y="52" width="50" height="42" rx="4" />
      <rect class="box" x="240" y="52" width="50" height="42" rx="4" />
      <rect class="boxr" x="290" y="52" width="50" height="42" rx="4" />
      <rect class="box" x="340" y="52" width="50" height="42" rx="4" />
    </g>
    <g class="rough">
      <rect class="boxy" x="40" y="100" width="50" height="40" rx="4" />
      <rect class="boxy" x="90" y="100" width="50" height="40" rx="4" />
      <rect class="boxy" x="140" y="100" width="50" height="40" rx="4" />
      <rect class="boxy" x="190" y="100" width="50" height="40" rx="4" />
      <rect class="boxy" x="240" y="100" width="50" height="40" rx="4" />
      <rect class="boxy" x="290" y="100" width="50" height="40" rx="4" />
      <rect class="boxy" x="340" y="100" width="50" height="40" rx="4" />
    </g>
    <g class="rough">
      <path class="lnr dash" d="M315,144 C305,196 185,196 165,144" />
    </g>
    <text class="sm" x="65" y="44" text-anchor="middle">0</text>
    <text class="sm" x="115" y="44" text-anchor="middle">1</text>
    <text class="sm" x="165" y="44" text-anchor="middle">2</text>
    <text class="sm" x="215" y="44" text-anchor="middle">3</text>
    <text class="sm" x="265" y="44" text-anchor="middle">4</text>
    <text class="sm" x="315" y="44" text-anchor="middle">5</text>
    <text class="sm" x="365" y="44" text-anchor="middle">6</text>
    <text class="sm" x="65" y="79" text-anchor="middle">a</text>
    <text class="sm" x="115" y="79" text-anchor="middle">b</text>
    <text class="sm" x="165" y="79" text-anchor="middle">a</text>
    <text class="sm" x="215" y="79" text-anchor="middle">b</text>
    <text class="sm" x="265" y="79" text-anchor="middle">a</text>
    <text class="sm rd" x="315" y="79" text-anchor="middle">c</text>
    <text class="sm" x="365" y="79" text-anchor="middle">a</text>
    <text class="sm" x="65" y="126" text-anchor="middle">0</text>
    <text class="sm" x="115" y="126" text-anchor="middle">0</text>
    <text class="sm" x="165" y="126" text-anchor="middle">1</text>
    <text class="sm" x="215" y="126" text-anchor="middle">2</text>
    <text class="sm" x="265" y="126" text-anchor="middle">3</text>
    <text class="sm" x="315" y="126" text-anchor="middle">0</text>
    <text class="sm" x="365" y="126" text-anchor="middle">1</text>
    <text class="sm rd" x="240" y="212" text-anchor="middle">len falls 3 → 1 → 0 before 'c' settles</text>
    <text class="lbl" x="404" y="66" style="font-size:13px">fail[i] = longest proper</text>
    <text class="lbl" x="404" y="84" style="font-size:13px">prefix of p[0..i] that is</text>
    <text class="lbl" x="404" y="102" style="font-size:13px">also a suffix of p[0..i]</text>
    <text class="sm gr" x="404" y="132">p[0..4] = "ababa"</text>
    <text class="sm gr" x="404" y="150">prefix "aba" = suffix "aba"</text>
    <text class="sm gr" x="404" y="168">so fail[4] = 3</text>
  </svg>
  <figcaption>Notice index 5: a single character can force several fallbacks in a row, yet the build stays linear because each fallback is paid for by an earlier increase of len.</figcaption>
</figure>

<h3>Building the failure table, step by step</h3>
<p>
  The build is the same algorithm as the search, run with the pattern
  matched against itself. <code>len</code> holds "how many characters of the
  prefix currently match the suffix ending at <code>i - 1</code>". On a
  mismatch you don't reset <code>len</code> to 0 — you fall back to the next
  shorter candidate, <code>fail[len - 1]</code>, and try again.
</p>
<pre><code><span class="c">// prefix function / failure table — O(m) time, O(m) space</span>
function buildFailure(pattern) {
  const fail = new Array(pattern.length).fill(0);
  let len = 0; <span class="c">// length of the current prefix-suffix match</span>

  for (let i = 1; i &lt; pattern.length; i++) { <span class="c">// fail[0] is always 0 — a single char has no proper prefix</span>
    while (len > 0 &amp;&amp; pattern[i] !== pattern[len]) {
      len = fail[len - 1]; <span class="c">// fall back to the next-shorter border, don't reset to 0</span>
    }
    if (pattern[i] === pattern[len]) len++;
    fail[i] = len;
  }
  return fail;
}

buildFailure("ababaca"); <span class="c">// [0, 0, 1, 2, 3, 0, 1]</span></code></pre>
<h4>Dry run: buildFailure("ababaca")</h4>
<table>
  <tr><th>i</th><th>p[i]</th><th>len before</th><th>fallback chain</th><th>fail[i]</th></tr>
  <tr><td>1</td><td>b</td><td>0</td><td>—</td><td>0</td></tr>
  <tr><td>2</td><td>a</td><td>0</td><td>—</td><td>1</td></tr>
  <tr><td>3</td><td>b</td><td>1</td><td>—</td><td>2</td></tr>
  <tr><td>4</td><td>a</td><td>2</td><td>—</td><td>3</td></tr>
  <tr><td>5</td><td>c</td><td>3</td><td>3 → fail[2]=1 → fail[0]=0</td><td>0</td></tr>
  <tr><td>6</td><td>a</td><td>0</td><td>—</td><td>1</td></tr>
</table>
<p class="sub">
  The <code>while</code> loop looks like it could make this quadratic. It
  can't: <code>len</code> grows by at most 1 per iteration of the outer
  loop, so across the whole build it increases at most m times — and the
  <code>while</code> loop only ever <em>decreases</em> it. Total decreases
  ≤ total increases ≤ m. This is the same amortized argument as the sliding
  window's left pointer, and it is the sentence to say out loud.
</p>

<h3>KMP search: the text pointer never moves backward</h3>
<pre><code><span class="c">// all occurrences of pattern in text — O(n + m) time, O(m) space</span>
function kmpSearch(text, pattern) {
  if (pattern.length === 0) return [];
  const fail = buildFailure(pattern);
  const hits = [];
  let len = 0; <span class="c">// how many pattern chars currently matched</span>

  for (let i = 0; i &lt; text.length; i++) { <span class="c">// i only ever increases — no backtracking in the text</span>
    while (len > 0 &amp;&amp; text[i] !== pattern[len]) {
      len = fail[len - 1];
    }
    if (text[i] === pattern[len]) len++;

    if (len === pattern.length) {
      hits.push(i - pattern.length + 1);
      len = fail[len - 1]; <span class="c">// keep going — allows overlapping matches</span>
    }
  }
  return hits;
}

kmpSearch("aaaaa", "aa"); <span class="c">// [0, 1, 2, 3] — overlaps included</span></code></pre>
<div class="sticky mint">
  <span class="ttl">The one-line mental model</span>
  KMP is a state machine whose state is "how many characters of the pattern
  I've matched so far." Reading a text character either advances the state
  by one or drops it to a state no larger than before — and it never rewinds
  the input. That's why it streams: you can feed KMP a network socket you can't
  seek backward in.
</div>
<div class="warn">
  <span class="ttl">⚠ After a full match, resetting len to 0 loses overlaps</span>
  If the question is "count occurrences of <code>aa</code> in
  <code>aaaa</code>," the answer is 3, not 2. Setting <code>len = 0</code>
  after a hit gives you the non-overlapping count. Setting
  <code>len = fail[len - 1]</code> gives you overlapping matches. Ask the
  interviewer which they want — and note that you deliberately chose.
</div>

<h3>Rabin-Karp: compare hashes, not characters</h3>
<p>
  KMP is clever about <em>which</em> comparisons to skip. Rabin-Karp is
  clever about making each comparison O(1): treat every length-m window of
  the text as a base-B number mod a large prime, and roll that number
  forward as the window slides — subtract the outgoing character's
  contribution, multiply by the base, add the incoming character. A window
  can only be a match if its hash equals the pattern's hash, so you compare
  m characters only on a hash hit.
</p>
<pre><code><span class="c">// Rabin-Karp — O(n + m) expected, O(n·m) worst case, O(1) extra space</span>
const BASE = 256;
const MOD = 1000000007; <span class="c">// large prime → collisions are rare, not impossible</span>

function rabinKarp(text, pattern) {
  const n = text.length, m = pattern.length;
  if (m === 0 || m > n) return [];

  let high = 1; <span class="c">// BASE^(m-1) mod MOD — the weight of the leftmost char</span>
  for (let i = 0; i &lt; m - 1; i++) high = (high * BASE) % MOD;

  let patHash = 0, winHash = 0;
  for (let i = 0; i &lt; m; i++) {
    patHash = (patHash * BASE + pattern.charCodeAt(i)) % MOD;
    winHash = (winHash * BASE + text.charCodeAt(i)) % MOD;
  }

  const hits = [];
  for (let i = 0; i + m &lt;= n; i++) {
    <span class="c">// hash equality is necessary but NOT sufficient — always verify</span>
    if (winHash === patHash &amp;&amp; text.startsWith(pattern, i)) hits.push(i);

    if (i + m &lt; n) {
      winHash = (winHash - (text.charCodeAt(i) * high) % MOD + MOD) % MOD; <span class="c">// drop the left char (+MOD keeps it non-negative)</span>
      winHash = (winHash * BASE + text.charCodeAt(i + m)) % MOD;           <span class="c">// shift left, add the right char</span>
    }
  }
  return hits;
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Two bugs that bite everyone who writes this from memory</span>
  <b>(1) Negative modulo.</b> JavaScript's <code>%</code> returns a negative
  result for negative operands, so <code>-3 % 7</code> is <code>-3</code>,
  not <code>4</code>. Always add <code>MOD</code> back before the final
  <code>%</code>. <b>(2) Silent overflow.</b> JS numbers are exact only up
  to 2⁵³. With <code>MOD</code> near 10⁹, the product
  <code>winHash * BASE</code> reaches ~2.6 × 10¹¹ and
  <code>charCode * high</code> reaches ~6.5 × 10¹³ — both safe. Push
  <code>MOD</code> to 10¹⁵ "because bigger is better" and the products
  silently lose precision and the algorithm returns wrong answers on large
  inputs. Use <code>BigInt</code> if you truly need a bigger modulus.
</div>
<p class="sub">
  Collisions are handled by the <code>startsWith</code> verification, so
  Rabin-Karp is never <em>wrong</em> — only occasionally slow. An adversary
  who knows your BASE and MOD can construct a text where every window
  collides, degrading it to O(n·m); production implementations pick BASE
  randomly at startup for exactly this reason. Mentioning that unprompted
  reads as real experience.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "Rabin-Karp buys me O(1) per
  window with a rolling hash, and I verify on hash equality so collisions
  cost time but never correctness. I'd reach for it over KMP when I'm
  searching for <em>many</em> patterns of the same length at once — I hash
  all of them into a set and still do one pass — or for 2D pattern search,
  where KMP doesn't generalize cleanly."
</div>

<h3>Prefix hashes: compare any two substrings in O(1)</h3>
<p>
  The rolling hash above slides one fixed-length window. Many problems instead
  ask "are these two substrings equal?" for <em>arbitrary</em> positions and
  lengths, again and again. Comparing characters costs O(length) each time. The
  fix is to precompute a hash of every prefix once, so the hash of <em>any</em>
  substring becomes a subtraction.
</p>
<p>
  Let <code>H[i]</code> be the hash of the first i characters, built left to
  right: <code>H[0] = 0</code> and <code>H[i + 1] = H[i] · B + code(s[i])</code>
  (mod p). Unrolling the recurrence, <code>H[r]</code> is the polynomial whose
  highest power of B multiplies <code>s[0]</code>. The first l characters
  contribute <code>H[l]</code> multiplied by B once for each of the
  <code>r − l</code> characters that follow them, so
</p>
<p class="sub">
  hash(s[l..r)) = H[r] − H[l] · B<sup>r−l</sup> (mod p)
</p>
<p>
  Two substrings of the same length are equal exactly when their hashes are
  equal, up to collisions. A small worked example with base 10, modulus 101 and
  <code>a = 1, b = 2</code> on <code>"abab"</code>: the prefix hashes are
  <code>H = [0, 1, 12, 20, 0]</code>. The substring <code>"ab"</code> at [0, 2) has
  hash 12 − 0 · 100 = 12. The one at [2, 4) has hash
  0 − 12 · 100 = −1200, which is 12 modulo 101 (since 1200 = 11 · 101 + 89 and
  101 − 89 = 12). Equal, as they should be.
</p>
<div class="warn">
  <span class="ttl">⚠ The multiplication is where JavaScript bites</span>
  With a modulus near 10<sup>9</sup>, <code>H[l] · pow[r − l]</code> is a product
  of two numbers below 10<sup>9</sup>, up to about 10<sup>18</sup>, well past the
  2<sup>53</sup> that a <code>Number</code> holds exactly. The rolling hash above
  stayed safe because one factor was a character code or a small base; here both
  factors are large. Either use <code>BigInt</code> (correct, but slow in a hot
  loop), keep the modulus below about 9.4 × 10<sup>7</sup> so the product fits, or
  multiply in two halves as below. The helper splits <code>b</code> into its upper
  and lower 16 bits, so no intermediate value exceeds 2<sup>47</sup>.
</div>
<pre><code><span class="c">// (a * b) % mod without leaving the exact integer range; needs 0 &lt;= a, b &lt; mod &lt; 2^31</span>
function mulMod(a, b, mod) {
  const high = Math.floor(b / 65536); <span class="c">// b = high * 65536 + low</span>
  const low = b % 65536;
  return (((a * high) % mod) * 65536 + a * low) % mod;
}

<span class="c">// two independent hashes of every prefix, so substring hashes cost O(1) after O(n) setup</span>
class SubstringHasher {
  constructor(s) {
    const n = s.length;
    this.mods = [1000000007, 998244353];
    this.prefix = [];
    this.power = [];
    for (const mod of this.mods) {
      const base = 256 + Math.floor(Math.random() * (mod - 512)); <span class="c">// random base, chosen at run time</span>
      const prefix = new Array(n + 1).fill(0);
      const power = new Array(n + 1).fill(1); <span class="c">// power[i] = base^i mod mod</span>
      for (let i = 0; i &lt; n; i++) {
        prefix[i + 1] = (mulMod(prefix[i], base, mod) + s.charCodeAt(i)) % mod;
        power[i + 1] = mulMod(power[i], base, mod);
      }
      this.prefix.push(prefix);
      this.power.push(power);
    }
  }

  <span class="c">// hash of s[l..r), as a string key that is safe to use in a Map</span>
  hash(l, r) {
    const parts = this.mods.map((mod, k) => {
      const removed = mulMod(this.prefix[k][l], this.power[k][r - l], mod);
      return (this.prefix[k][r] - removed + mod) % mod; <span class="c">// + mod keeps the difference non-negative</span>
    });
    return parts.join(",");
  }
}</code></pre>
<p class="sub">
  Setup is O(n) time and space; every <code>hash(l, r)</code> after that is O(1)
  (two <code>mulMod</code> calls). Two independent moduli are used for a reason
  explained two sections below. The hash is returned as a string such as
  <code>"123456,789012"</code> because the two numbers together are too large to
  pack into one exact <code>Number</code>.
</p>

<h3>Longest duplicate substring: binary search on the length</h3>
<p>
  Find the longest substring that occurs at least twice (the two copies may
  overlap). Checking every pair of start positions with a character comparison is
  O(n³) in the worst case. Two observations make it O(n log n).
</p>
<ul>
  <li><b>Monotone in the length.</b> If some substring of length L occurs twice, so does its first L − 1 characters. So "is there a duplicate of length L?" is true for small L and false from some point on, which is exactly the shape binary search needs.</li>
  <li><b>One length is one pass.</b> For a fixed L, slide a window over the string, hash every window in O(1) with the prefix hashes, and store the hashes in a Map. The first window whose hash is already present is a candidate duplicate.</li>
</ul>
<pre><code><span class="c">// O(n log n) expected time, O(n) space. Overlapping copies count; any longest one may be returned.</span>
function longestDupSubstring(s) {
  const n = s.length;
  const hasher = new SubstringHasher(s);

  <span class="c">// start of the second copy of some repeated substring of this length, or -1</span>
  function duplicateStart(len) {
    const seen = new Map(); <span class="c">// hash key -> starts of windows with that hash</span>
    for (let i = 0; i + len &lt;= n; i++) {
      const key = hasher.hash(i, i + len);
      const starts = seen.get(key);
      if (starts === undefined) {
        seen.set(key, [i]);
        continue;
      }
      const here = s.slice(i, i + len);
      if (starts.some((j) => s.startsWith(here, j))) return i; <span class="c">// verify: equal hashes may still be a collision</span>
      starts.push(i);
    }
    return -1;
  }

  let lo = 1, hi = n - 1, best = "";
  while (lo &lt;= hi) {
    const mid = (lo + hi) >> 1;
    const at = duplicateStart(mid);
    if (at !== -1) {
      best = s.slice(at, at + mid); <span class="c">// a duplicate exists: remember it and try longer</span>
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return best;
}</code></pre>
<h4>Dry run: longestDupSubstring("banana")</h4>
<table>
  <tr><th>lo, hi</th><th>mid</th><th>windows of that length</th><th>duplicate?</th><th>then</th></tr>
  <tr><td>1, 5</td><td>3</td><td>ban, ana, nan, ana</td><td>yes: "ana" again at 3</td><td>best = "ana", lo = 4</td></tr>
  <tr><td>4, 5</td><td>4</td><td>bana, anan, nana</td><td>no</td><td>hi = 3</td></tr>
  <tr><td>4, 3</td><td colspan="4">lo &gt; hi, stop: the answer is "ana" (positions 1 and 3, the two copies share the "a" at position 3)</td></tr>
</table>
<p class="sub">
  Cost: about log n rounds, each one pass of n window hashes, each O(1), plus
  the verification. Verification happens only on a hash hit, and a true hit ends
  the round immediately, so it adds O(L) once per round in the usual case: the
  total expected time stays O(n log n). Correctness never depends on luck: a
  collision costs time (an extra comparison), never a wrong answer.
</p>
<div class="warn">
  <span class="ttl">⚠ Four details that decide whether this passes</span>
  <b>The search range.</b> A duplicate cannot be as long as the whole string, so
  the lengths run from 1 to n − 1. Starting <code>hi</code> at n would call the
  check with a window as long as the string, which has only one position and
  never repeats. <b>Return the string, not the length.</b> Remember the best
  match each time the check succeeds. <b>Overlap is legal.</b> <code>"aaaa"</code>
  has the duplicate <code>"aaa"</code>, at positions 0 and 1; a solution that
  requires the copies not to overlap is answering a different problem.
  <b>Mind the memory.</b> The Map holds up to n keys per round, but only one round
  at a time, so the space stays O(n).
</div>

<h3>Double hashing, and the hash that anyone can break</h3>
<p>
  A single modulus near 10<sup>9</sup> has only about a billion possible hash
  values. By the birthday paradox, among about the square root of that many
  different strings (tens of thousands) two will probably share a hash. In
  <code>longestDupSubstring</code> that is harmless, because it verifies, but
  in code that trusts the hash to mean equality it is a real bug waiting for a big
  input. <b>Double hashing</b> uses two independent moduli (and bases) and
  treats two substrings as equal only if both hashes agree. The combined space
  is about 10<sup>18</sup> values, so the collision probability among 10<sup>5</sup>
  strings, roughly (10<sup>5</sup>)² / 2 divided by 10<sup>18</sup>, is about
  5 × 10<sup>−9</sup>.
</p>
<p>
  The other defence is where the base comes from. If the base and modulus are
  constants in the source, anyone who can read the problem can construct inputs
  that collide on purpose. Choosing the base at run time, as
  <code>SubstringHasher</code> does, means a test written in advance cannot
  target it.
</p>
<p>
  The most instructive failure is the one with <em>no modulus at all</em>.
  Hashing with the machine's natural 32-bit overflow looks harmless, and it
  is trivial to break. Build two strings by the Thue–Morse rule: start from
  <code>T = "a"</code> and <code>S = "b"</code>, and repeat
  <code>T, S = T + S, S + T</code>. After seven rounds the two strings are 128
  characters long and differ in every position (one is the other with a and b swapped), and yet
  they have exactly the same hash for every odd base:
</p>
<pre><code>function overflowHash(s, base) {
  let h = 0;
  for (let i = 0; i &lt; s.length; i++) h = (Math.imul(h, base) + s.charCodeAt(i)) | 0; <span class="c">// wraps at 2^32</span>
  return h;
}

function thueMorsePair(rounds) {
  let t = "a", u = "b";
  for (let i = 0; i &lt; rounds; i++) [t, u] = [t + u, u + t];
  return [t, u];
}

const [t, u] = thueMorsePair(7);
t === u;                                 <span class="c">// false, 128 characters each</span>
overflowHash(t, 31) === overflowHash(u, 31); <span class="c">// true, for any odd base</span></code></pre>
<p class="sub">
  The reason is that the difference of the two hashes is, up to sign, a product of
  factors <code>B<sup>2<sup>i</sup></sup> − 1</code>, each divisible by a growing power of two, so
  after a few rounds it is divisible by 2<sup>32</sup> and vanishes. (We checked
  every odd base below 20,000.) With a 64-bit wrap the same construction needs
  only ten rounds, 1,024 characters. A prime modulus does not have this weakness,
  which is why the code uses one.
</p>
<table>
  <tr><th>Hash design</th><th>Collisions</th><th>Use it when</th></tr>
  <tr><td>One prime modulus, fixed base</td><td>about √p strings find a collision by chance; an adversary can aim for one</td><td>never trust it without verifying</td></tr>
  <tr><td>One prime modulus, random base</td><td>chance collisions only, but with p near 10<sup>9</sup> they are likely on large inputs</td><td>you verify every hit</td></tr>
  <tr><td>Two prime moduli, random bases</td><td>about 5 × 10<sup>−9</sup> chance per 10<sup>5</sup> strings</td><td>comparing many substrings, still verifying if the answer must be exact</td></tr>
  <tr><td>Natural overflow (no modulus)</td><td>broken by Thue–Morse strings, whatever the base</td><td>never, if the input is not under your control</td></tr>
</table>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'll precompute prefix hashes so any
  substring's hash is one subtraction, then binary search the length: if a
  duplicate of length L exists, so does one of length L − 1. Each length is one
  pass with a hash map. I use two moduli and a random base so collisions are
  vanishingly unlikely, and I confirm a hit with a real comparison so a collision
  can only cost time, never correctness."
</div>

<h3>The Z-function: the same information, easier to reason about</h3>
<p>
  <code>z[i]</code> is the length of the longest substring starting at
  <code>i</code> that is also a prefix of the whole string. It's computed
  with a "Z-box" — the rightmost interval <code>[l, r)</code> known to match
  a prefix — which lets you copy an already-known answer from the mirror
  position instead of recomputing it. Many people find Z easier to derive
  under pressure than KMP's failure table, and it solves substring search by
  a trick: concatenate.
</p>
<pre><code><span class="c">// Z-function — O(n) time, O(n) space</span>
function zFunction(s) {
  const n = s.length;
  if (n === 0) return [];
  const z = new Array(n).fill(0);
  z[0] = n;
  let l = 0, r = 0; <span class="c">// [l, r) = rightmost segment known to match a prefix</span>

  for (let i = 1; i &lt; n; i++) {
    if (i &lt; r) z[i] = Math.min(r - i, z[i - l]); <span class="c">// reuse the mirror, clamped to the box</span>
    while (i + z[i] &lt; n &amp;&amp; s[z[i]] === s[i + z[i]]) z[i]++; <span class="c">// extend past the box the slow way</span>
    if (i + z[i] > r) { l = i; r = i + z[i]; } <span class="c">// this match reaches further right — adopt it</span>
  }
  return z;
}

<span class="c">// substring search: glue with a separator assumed to appear in neither string</span>
function zSearch(text, pattern) {
  if (pattern.length === 0) return [];
  const combined = pattern + "#" + text;
  const z = zFunction(combined);
  const hits = [];
  for (let i = pattern.length + 1; i &lt; combined.length; i++) {
    if (z[i] === pattern.length) hits.push(i - pattern.length - 1);
  }
  return hits;
}</code></pre>
<p class="sub">
  The separator must be a character that cannot occur in either string. If
  it does, a prefix match can run across the boundary, <code>z[i]</code>
  exceeds <code>pattern.length</code>, and the <code>===</code> test misses
  a real hit: <code>zSearch("a#", "a")</code> returns <code>[]</code>.
  This code uses <code>"#"</code>, so it assumes the strings hold no
  <code>#</code> (lowercase letters, say); state that assumption out loud,
  and pick another character if the input can contain one. All three
  searchers here (<code>kmpSearch</code>, <code>rabinKarp</code>,
  <code>zSearch</code>) return <code>[]</code> for an empty pattern, a choice
  to state aloud, since <code>indexOf("")</code> would call it a match at 0.
</p>

<h3>Sum of scores: reading the whole Z array</h3>
<p>
  The Z-function gives you, for every position, how far the string agrees with
  its own beginning. Some problems ask for an <em>aggregate</em> of that. Here is
  one. Build a string by prepending characters one at a time, so the strings are
  the suffixes of <code>s</code> of length 1, 2, ..., n. The <b>score</b> of a
  suffix is the length of its longest common prefix with the full string
  <code>s</code>. What is the sum of the scores of all n suffixes?
</p>
<p>
  The suffix of length i starts at position n − i, and its score is exactly
  <code>z[n − i]</code>, the length of the longest match with the prefix there.
  As i runs from 1 to n, the position n − i runs through every index of the
  string, so the answer is the sum of the whole Z array. The suffix of length n
  is the string itself and scores n, which is why <code>zFunction</code> sets
  <code>z[0] = n</code>.
</p>
<pre><code><span class="c">// O(n) time, O(n) space; uses zFunction from above</span>
function sumScores(s) {
  return zFunction(s).reduce((total, value) => total + value, 0);
}

sumScores("babab"); <span class="c">// 9</span></code></pre>
<table>
  <tr><th>suffix start</th><th>suffix of "babab"</th><th>common prefix with "babab"</th><th>z</th></tr>
  <tr><td>0</td><td>babab</td><td>babab</td><td>5</td></tr>
  <tr><td>1</td><td>abab</td><td>none</td><td>0</td></tr>
  <tr><td>2</td><td>bab</td><td>bab</td><td>3</td></tr>
  <tr><td>3</td><td>ab</td><td>none</td><td>0</td></tr>
  <tr><td>4</td><td>b</td><td>b</td><td>1</td></tr>
</table>
<p class="sub">
  The scores 5 + 0 + 3 + 0 + 1 add up to 9. The brute force, comparing every
  suffix against the string character by character, is O(n²) in the worst case
  (<code>"aaaa..."</code>). The Z array does all those comparisons in one linear
  pass. The same sum counts, over all lengths k, how many positions the prefix of
  length k occurs at, so "how many times does each prefix occur" is also one
  read of the Z array: the number of occurrences of the length-k prefix is the
  number of positions with <code>z[i] &gt;= k</code>.
</p>

<h3>Manacher's algorithm: every palindrome, in O(n)</h3>
<p>
  Expand-around-center for the longest palindromic substring is O(n²): 2n−1
  centers, each expansion up to O(n). Manacher makes it linear with the same
  reuse idea as the Z-function — a palindrome centered at <code>c</code>
  reaching to <code>right</code> means positions inside it are mirror images
  of positions already solved, so you start each expansion from a known
  lower bound rather than from zero.
</p>
<p>
  First, the unification trick. Odd-length and even-length palindromes need
  different center handling, which is where most hand-written attempts get
  tangled. Interleave a separator: <code>"abba"</code> becomes
  <code>"#a#b#b#a#"</code>. The transformed string always has odd length
  <code>2n + 1</code>, so <em>every</em> palindrome in it is odd-length and
  has a single character center — even-length palindromes of the original
  become odd-length palindromes centered on a <code>#</code>. Better still,
  the radius <code>p[i]</code> in the transformed string is exactly the
  palindrome's <em>length</em> in the original string.
</p>
<table>
  <tr><th>original</th><th>transformed</th><th>center</th><th>radius p</th><th>original length</th></tr>
  <tr><td>"aba"</td><td>#a#b#a#</td><td>index 3 ('b')</td><td>3</td><td>3</td></tr>
  <tr><td>"abba"</td><td>#a#b#b#a#</td><td>index 4 ('#')</td><td>4</td><td>4</td></tr>
  <tr><td>"a"</td><td>#a#</td><td>index 1 ('a')</td><td>1</td><td>1</td></tr>
</table>
<pre><code><span class="c">// longest palindromic substring — O(n) time, O(n) space</span>
function longestPalindrome(s) {
  if (s.length &lt; 2) return s;

  const t = "#" + s.split("").join("#") + "#"; <span class="c">// always odd length: 2n + 1</span>
  const n = t.length;
  const p = new Array(n).fill(0); <span class="c">// p[i] = palindrome radius at i (= length in s)</span>
  let center = 0, right = 0; <span class="c">// rightmost palindrome found so far</span>

  for (let i = 0; i &lt; n; i++) {
    if (i &lt; right) {
      const mirror = 2 * center - i;
      p[i] = Math.min(right - i, p[mirror]); <span class="c">// clamp: beyond "right" nothing is verified yet</span>
    }
    <span class="c">// expand only past what the mirror already guaranteed</span>
    while (i - p[i] - 1 >= 0 &amp;&amp; i + p[i] + 1 &lt; n &amp;&amp;
           t[i - p[i] - 1] === t[i + p[i] + 1]) {
      p[i]++;
    }
    if (i + p[i] > right) { center = i; right = i + p[i]; } <span class="c">// new rightmost reach</span>
  }

  let best = 0, bestCenter = 0;
  for (let i = 0; i &lt; n; i++) {
    if (p[i] > best) { best = p[i]; bestCenter = i; }
  }
  const start = (bestCenter - best) / 2; <span class="c">// map transformed index back to s</span>
  return s.slice(start, start + best);
}

longestPalindrome("babad");   <span class="c">// "bab" (or "aba" — both valid)</span>
longestPalindrome("cbbd");    <span class="c">// "bb"</span>
longestPalindrome("forgeeksskeegfor"); <span class="c">// "geeksskeeg"</span></code></pre>
<div class="warn">
  <span class="ttl">⚠ The clamp is what makes it linear, and it's the line people drop</span>
  <code>Math.min(right - i, p[mirror])</code> — without the
  <code>right - i</code> term you'd copy a mirror radius that extends past
  the verified region, and you'd report palindromes that don't exist.
  Without <code>p[mirror]</code> you'd start every expansion at 0 and be
  back to O(n²). The linearity argument: <code>right</code> only moves
  forward, and every iteration of the inner <code>while</code> loop pushes
  <code>right</code> one step further, so the total work in all expansions
  is bounded by n.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "Expand-around-center is O(n²)
  and is a completely acceptable answer here — let me code that first, then
  I'll tell you how Manacher gets it to O(n). The trick is interleaving a
  separator so odd and even cases unify, then reusing the mirror radius
  inside the current rightmost palindrome so each expansion starts from a
  known lower bound instead of from scratch."
</div>
<p class="sub">
  That's a genuinely good interview move. Manacher is rarely <em>required</em>
  — but showing you know the O(n²) baseline, can implement it cleanly, and
  can explain the linear improvement is worth more than a memorized
  Manacher you can't justify.
</p>

<h3>Choosing between them</h3>
<table>
  <tr><th>Algorithm</th><th>Preprocess</th><th>Search</th><th>Extra space</th><th>Reach for it when</th></tr>
  <tr><td>Naive</td><td>—</td><td>O(n·m)</td><td>O(1)</td><td>m is tiny, or it's the stated baseline</td></tr>
  <tr><td>KMP</td><td>O(m)</td><td>O(n) guaranteed</td><td>O(m)</td><td>One pattern, worst-case guarantee needed, streaming input</td></tr>
  <tr><td>Rabin-Karp</td><td>O(m)</td><td>O(n) expected</td><td>O(1)</td><td>Many equal-length patterns, 2D search, dedup/fingerprinting</td></tr>
  <tr><td>Z-function</td><td>O(n+m)</td><td>O(n+m)</td><td>O(n+m)</td><td>Prefix-flavoured questions; easier to re-derive live</td></tr>
  <tr><td>Manacher</td><td>—</td><td>O(n)</td><td>O(n)</td><td>Palindromes specifically</td></tr>
  <tr><td>Prefix hashes + binary search</td><td>O(n)</td><td>O(1) per substring comparison</td><td>O(n)</td><td>Equality of arbitrary substrings; "longest ... that repeats" where the length is monotone</td></tr>
  <tr><td>Aho-Corasick</td><td>O(total pattern length)</td><td>O(n + matches)</td><td>O(total pattern length)</td><td>Many patterns of any lengths in one pass; banned words, keyword tagging</td></tr>
  <tr><td>Suffix array + LCP</td><td>O(n log² n)</td><td>O(m log n) per pattern</td><td>O(n)</td><td>All substrings of one string: distinct count, longest repeat, many queries</td></tr>
  <tr><td>Minimal rotation</td><td>—</td><td>O(n)</td><td>O(1)</td><td>A canonical form for a cyclic string, grouping rotations</td></tr>
</table>
<p class="sub">
  In real code you would call <code>indexOf</code>, which engines implement
  with a tuned hybrid (V8's is Boyer-Moore-Horspool based). Say that too —
  knowing when <em>not</em> to hand-roll is part of the signal. These
  algorithms earn their keep when the built-in doesn't fit the shape:
  streaming, multi-pattern, or when the failure table itself is the answer
  (shortest palindrome, longest repeated prefix, string periodicity).
</p>

<h3>The failure table answers more than "where is the pattern"</h3>
<p>
  A surprising number of string questions reduce to "compute the prefix
  function and read one entry."
</p>
<pre><code><span class="c">// Shortest palindrome: prepend the fewest chars to make s a palindrome.</span>
<span class="c">// Trick: the answer hinges on the longest palindromic PREFIX of s.</span>
function shortestPalindrome(s) {
  const rev = s.split("").reverse().join("");
  const fail = buildFailure(s + "#" + rev);
  const overlap = fail[fail.length - 1]; <span class="c">// longest prefix of s that is a suffix of reverse(s)</span>
  return rev.slice(0, s.length - overlap) + s;
}

<span class="c">// Smallest repeating unit: "abcabcabc" → "abc". Returns s itself if none.</span>
function repeatedUnit(s) {
  const fail = buildFailure(s);
  const period = s.length - fail[s.length - 1];
  return s.length % period === 0 ? s.slice(0, period) : s;
}</code></pre>
<p class="sub">
  As in <code>zSearch</code>, the <code>"#"</code> in <code>shortestPalindrome</code> must not occur in
  <code>s</code>: if it does, the table's last entry can exceed <code>s.length</code> and the answer is
  wrong, as <code>shortestPalindrome("a#a")</code> shows.
</p>
<p class="sub">
  <code>n - fail[n-1]</code> being the smallest period of a string is a
  genuinely useful identity — it's the core of the answer to "Repeated Substring
  Pattern" (plus a check that the period divides n) and to several string-rotation questions.
</p>

<h3>Why the prefix function finds the longest palindromic prefix</h3>
<p>
  <code>shortestPalindrome</code> above is short enough to look like a trick.
  Here is the reasoning that makes it a method. To make <code>s</code> a
  palindrome by adding characters only at the front, you keep the longest
  prefix of <code>s</code> that is already a palindrome, <code>P</code>, and
  mirror everything after it onto the front. The cost is the length of the part
  that is not in <code>P</code>, so the whole problem is to find the
  <em>longest palindromic prefix</em>.
</p>
<p>
  Now connect that to borders. The suffix of <code>reverse(s)</code> of length k
  is the reverse of the prefix of <code>s</code> of length k. A string is a
  palindrome exactly when it equals its own reverse. So the prefix of length k
  is a palindrome if and only if it equals the length-k suffix of
  <code>reverse(s)</code>. In <code>s + "#" + reverse(s)</code>, that says the
  length-k prefix of the whole string equals its length-k suffix, which is a
  <em>border</em>, and the last entry of the prefix function is the length of the
  longest border. The <code>#</code> keeps the border from being longer than n,
  because no match can contain it (it occurs once).
</p>
<h4>Dry run: s = "aacecaaa", rev = "aaacecaa", glued = "aacecaaa#aaacecaa"</h4>
<table>
  <tr><th>i</th><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td><td>11</td><td>12</td><td>13</td><td>14</td><td>15</td><td>16</td></tr>
  <tr><th>char</th><td>a</td><td>a</td><td>c</td><td>e</td><td>c</td><td>a</td><td>a</td><td>a</td><td>#</td><td>a</td><td>a</td><td>a</td><td>c</td><td>e</td><td>c</td><td>a</td><td>a</td></tr>
  <tr><th>fail</th><td>0</td><td>1</td><td>0</td><td>0</td><td>0</td><td>1</td><td>2</td><td>2</td><td>0</td><td>1</td><td>2</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td><b>7</b></td></tr>
</table>
<p class="sub">
  The last value is 7, so <code>"aacecaa"</code> (the first seven characters) is
  the longest palindromic prefix. The characters left over are
  <code>s.slice(7) = "a"</code>; its reverse is prepended, and the result is
  <code>"a" + "aacecaaa" = "aaacecaaa"</code>. In code,
  <code>rev.slice(0, n - overlap)</code> is that reversed leftover. The method is
  O(n) where checking every prefix for being a palindrome is O(n²). The same
  idea, with the roles of prefix and suffix swapped, gives the shortest string to
  <em>append</em>.
</p>

<h3>Minimal rotation: the smallest cyclic shift</h3>
<p>
  A rotation moves a prefix to the end: the rotations of <code>"bca"</code> are
  <code>"bca"</code>, <code>"cab"</code> and <code>"abc"</code>. Two questions
  come up. Is <code>t</code> a rotation of <code>s</code>? And what is the
  lexicographically smallest rotation of <code>s</code>, a <b>canonical form</b>
  that lets you compare cyclic strings or group strings that are rotations of
  each other?
</p>
<p>
  The first has a clean answer: <code>t</code> is a rotation of
  <code>s</code> exactly when the lengths match and <code>t</code> occurs inside
  <code>s + s</code>, because every rotation of s is a window of length n in
  <code>s + s</code>. With KMP that is O(n):
</p>
<pre><code><span class="c">// O(n) time using kmpSearch from above</span>
function isRotation(s, t) {
  return s.length === t.length &amp;&amp; (s.length === 0 || kmpSearch(s + s, t).length > 0);
}</code></pre>
<p>
  For the smallest rotation, trying all n rotations and comparing them costs
  O(n²). The two-pointer method below does it in O(n). Keep two <b>candidate
  starts</b>, <code>i</code> and <code>j</code>, and compare the rotations that
  begin at them, character by character, with <code>k</code> counting how many
  characters agree. At the first difference:
</p>
<ul>
  <li>If the character at <code>i + k</code> is larger, the rotation starting at <code>i</code> is not minimal. Neither is any start in <code>(i, i + k]</code>: the start <code>i + t</code> is dominated by the start <code>j + t</code>, which matched the same characters and is at least as small afterwards. Move <code>i</code> to <code>i + k + 1</code>.</li>
  <li>If it is smaller, the same argument applies to <code>j</code>.</li>
</ul>
<pre><code><span class="c">// start index of the lexicographically smallest rotation — O(n) time, O(1) space</span>
function minimalRotationStart(s) {
  const n = s.length;
  let i = 0, j = 1, k = 0;
  while (i &lt; n &amp;&amp; j &lt; n &amp;&amp; k &lt; n) {
    const a = s[(i + k) % n], b = s[(j + k) % n]; <span class="c">// the % n is what makes the string circular</span>
    if (a === b) { k++; continue; }
    if (a > b) i += k + 1;
    else j += k + 1;
    if (i === j) j++; <span class="c">// the candidates must stay different</span>
    k = 0;
  }
  return Math.min(i, j);
}

function minimalRotation(s) {
  const at = minimalRotationStart(s);
  return s.slice(at) + s.slice(0, at);
}

minimalRotation("bca");   <span class="c">// "abc"</span>
minimalRotation("cabab"); <span class="c">// "ababc"</span></code></pre>
<h4>Dry run: minimalRotationStart("cabab")</h4>
<table>
  <tr><th>i, j, k</th><th>compare</th><th>action</th></tr>
  <tr><td>0, 1, 0</td><td>s[0] = c vs s[1] = a</td><td>c is larger, so skip i to 0 + 0 + 1 = 1; now i = j, so j = 2; k = 0</td></tr>
  <tr><td>1, 2, 0</td><td>s[1] = a vs s[2] = b</td><td>b is larger, so skip j to 2 + 0 + 1 = 3; k = 0</td></tr>
  <tr><td>1, 3, 0</td><td>s[1] = a, s[3] = a: equal; k = 1, s[2] = b vs s[4] = b: equal; k = 2, s[3] = a vs s[(3 + 2) % 5] = s[0] = c</td><td>c is larger, so skip j to 3 + 2 + 1 = 6; j is no longer below n, stop</td></tr>
  <tr><td colspan="3">return min(1, 6) = 1, so the smallest rotation is <code>s.slice(1) + s.slice(0, 1) = "ababc"</code></td></tr>
</table>
<p class="sub">
  Each comparison either raises <code>k</code> or, on a mismatch, moves one
  pointer forward by <code>k + 1</code>, so the pointers advance at least as far
  as the work done, and each can only go up to about n. The total is O(n). Use it
  for "group the strings that are rotations of each other" by keying on
  <code>minimalRotation(s)</code>, and for any cyclic comparison.
</p>
<div class="warn">
  <span class="ttl">⚠ Periodic strings and the i = j rule</span>
  For a string like <code>"abab"</code> several starts give the same rotation, and
  the loop ends when <code>k</code> reaches n. That is fine: the returned index
  may be any of them, and the rotated string is identical. The two things to get
  right are the <code>% n</code> in the comparison (without it you read past the
  end instead of wrapping) and the <code>if (i === j) j++</code> step (without it
  you compare a start with itself and never make progress).
</div>

<h3>Aho-Corasick: many patterns, one pass over the text</h3>
<p>
  KMP finds one pattern. A list of banned words, a dictionary of keywords, or a
  set of DNA motifs needs <em>all</em> of them at once. Running KMP once per
  pattern costs O(k · n) for k patterns. A trie of all patterns plus the idea
  behind KMP's failure table gives one pass over the text: <b>Aho-Corasick</b>.
</p>
<p>
  Start from the trie of the patterns (see the tries chapter). The state is the
  trie node for the longest suffix of the text read so far that is a prefix of
  some pattern. When the next character has no edge from the node, KMP would fall
  back to a shorter border. Here the node falls back along a <b>failure link</b>:
  the link of a node is the trie node for the longest <em>proper</em> suffix of
  its string that is also a prefix of some pattern. Links are computed in
  breadth-first order, so a node's link points to a shallower node that is
  already done. One more detail: a pattern can end inside another one (<code>"he"</code>
  inside <code>"she"</code>), so each node also collects the patterns that end at
  the nodes along its failure chain.
</p>
<pre><code><span class="c">// patterns must be non-empty. O(total pattern length) to build, using Maps for transitions.</span>
function buildAhoCorasick(patterns) {
  const next = [new Map()]; <span class="c">// next[node]: character -> child node</span>
  const link = [0];         <span class="c">// failure link of each node; the root links to itself</span>
  const out = [[]];         <span class="c">// out[node]: ids of patterns that END at this node or on its failure chain</span>

  patterns.forEach((word, id) => {
    let node = 0;
    for (const ch of word) {
      if (!next[node].has(ch)) {
        next[node].set(ch, next.length);
        next.push(new Map());
        link.push(0);
        out.push([]);
      }
      node = next[node].get(ch);
    }
    out[node].push(id);
  });

  const queue = [...next[0].values()]; <span class="c">// depth-1 nodes keep link 0</span>
  for (let head = 0; head &lt; queue.length; head++) {
    const node = queue[head];
    for (const [ch, child] of next[node]) {
      let f = link[node];
      while (f !== 0 &amp;&amp; !next[f].has(ch)) f = link[f]; <span class="c">// the KMP fallback, on the trie</span>
      link[child] = next[f].has(ch) ? next[f].get(ch) : 0;
      out[child] = out[child].concat(out[link[child]]); <span class="c">// the link is shallower, so its list is already complete</span>
      queue.push(child);
    }
  }
  return { next, link, out };
}

<span class="c">// every occurrence as [startIndex, patternId] — O(text length + matches) after the build</span>
function ahoCorasickSearch(text, patterns) {
  const { next, link, out } = buildAhoCorasick(patterns);
  const hits = [];
  let node = 0;
  for (let i = 0; i &lt; text.length; i++) {
    const ch = text[i];
    while (node !== 0 &amp;&amp; !next[node].has(ch)) node = link[node];
    if (next[node].has(ch)) node = next[node].get(ch);
    for (const id of out[node]) hits.push([i - patterns[id].length + 1, id]);
  }
  return hits;
}

ahoCorasickSearch("ushers", ["he", "she", "his", "hers"]); <span class="c">// [[1, 1], [2, 0], [2, 3]]</span></code></pre>
<h4>Dry run: patterns he, she, his, hers, text "ushers"</h4>
<p>The trie has ten nodes. The ones that matter for the search:</p>
<table>
  <tr><th>node</th><th>string</th><th>failure link</th><th>patterns ending here or along the chain</th></tr>
  <tr><td>1</td><td>h</td><td>root</td><td>none</td></tr>
  <tr><td>2</td><td>he</td><td>root</td><td>he</td></tr>
  <tr><td>3</td><td>s</td><td>root</td><td>none</td></tr>
  <tr><td>4</td><td>sh</td><td>h</td><td>none</td></tr>
  <tr><td>5</td><td>she</td><td>he</td><td>she, he</td></tr>
  <tr><td>8</td><td>her</td><td>root</td><td>none</td></tr>
  <tr><td>9</td><td>hers</td><td>s</td><td>hers</td></tr>
</table>
<table>
  <tr><th>i</th><th>char</th><th>state after reading it</th><th>reports</th></tr>
  <tr><td>0</td><td>u</td><td>root (no edge for u)</td><td>none</td></tr>
  <tr><td>1</td><td>s</td><td>s</td><td>none</td></tr>
  <tr><td>2</td><td>h</td><td>sh</td><td>none</td></tr>
  <tr><td>3</td><td>e</td><td>she</td><td>she at 1, he at 2</td></tr>
  <tr><td>4</td><td>r</td><td>she has no r edge, falls back to he, which has one: her</td><td>none</td></tr>
  <tr><td>5</td><td>s</td><td>hers</td><td>hers at 2</td></tr>
</table>
<p class="sub">
  Both <code>she</code> and <code>he</code> are reported at index 3 even though only
  one trie node was reached, because <code>out[she]</code> inherited
  <code>he</code> through the failure link. The transition from <code>she</code> on
  <code>r</code> is the interesting one: the text so far, <code>"ushe"</code>,
  ends in <code>"he"</code>, which is exactly where a continuation
  <code>"r"</code> can still lead to <code>"hers"</code>. KMP would have called
  that falling back to a border.
</p>
<p>
  Complexity: the node pointer can rise by one level per text character and every
  failure-link step lowers it, the same amortised argument as KMP, so scanning is
  O(text length) plus the number of reported matches (a text of all
  <code>a</code>s with patterns <code>a, aa, aaa, ...</code> reports many matches
  per position, and no algorithm can report them faster than it writes them). The
  build is O(total length of the patterns) with <code>Map</code> transitions, plus the cost of copying the
  output lists (a "dictionary link" per node instead of a copied list avoids that). For a
  fixed small alphabet you can also precompute the full transition table so
  scanning never loops at all.
</p>
<div class="warn">
  <span class="ttl">⚠ Where Aho-Corasick goes wrong</span>
  <b>Forgetting the inherited outputs.</b> Without
  <code>out[child] = out[child].concat(out[link[child]])</code> the search finds
  <code>she</code> and silently misses the <code>he</code> inside it.
  <b>Computing links depth-first.</b> A link must point to a node whose own link
  is already known, which is why the loop is breadth-first. <b>Empty patterns.</b>
  An empty pattern would end at the root and be reported at every position; decide
  what you want, or filter them out as the comment above says. <b>Duplicate
  patterns.</b> The same word listed twice ends at one node with two ids, and both
  are reported. That is correct for "report every pattern id", and wrong if you
  wanted a set.
</div>

<h3>Suffix arrays: every suffix, in sorted order</h3>
<p>
  The suffix array of a string is the list of the starting positions of all its
  suffixes, ordered by the suffixes' alphabetical order. For
  <code>"banana"</code> the suffixes in order are
  <code>a, ana, anana, banana, na, nana</code>, so the suffix array is
  <code>[5, 3, 1, 0, 4, 2]</code>. Once you have it, many questions about
  <em>all substrings</em> reduce to questions about neighbours in a sorted list,
  because every substring is a prefix of some suffix and substrings that start
  alike sit next to each other.
</p>
<p>
  <b>Building it.</b> Sorting the suffixes as full strings is O(n² log n) in the
  worst case. <b>Prefix doubling</b> avoids comparing long strings: rank the
  suffixes by their first character, then repeatedly rank them by their first
  2, 4, 8, ... characters. To order by the first 2k characters, compare the pair
  (rank by the first k characters of the suffix, rank by the first k characters of
  the suffix that starts k later). After about log₂ n rounds all ranks are
  distinct.
</p>
<pre><code><span class="c">// O(n log² n) time (about log n rounds of a comparison sort), O(n) space</span>
function suffixArray(s) {
  const n = s.length;
  if (n === 0) return [];
  const sa = Array.from({ length: n }, (_, i) => i);
  let rank = Array.from(s, (c) => c.charCodeAt(0)); <span class="c">// round 0: rank by the first character</span>

  for (let k = 1; ; k *= 2) {
    const second = (i) => (i + k &lt; n ? rank[i + k] : -1); <span class="c">// a suffix shorter than k sorts first</span>
    sa.sort((a, b) => rank[a] - rank[b] || second(a) - second(b));

    const next = new Array(n).fill(0);
    for (let i = 1; i &lt; n; i++) {
      const same = rank[sa[i - 1]] === rank[sa[i]] &amp;&amp; second(sa[i - 1]) === second(sa[i]);
      next[sa[i]] = next[sa[i - 1]] + (same ? 0 : 1);
    }
    rank = next;
    if (rank[sa[n - 1]] === n - 1) return sa; <span class="c">// every suffix has its own rank: done</span>
  }
}</code></pre>
<p>
  The array alone is not enough for most problems; you usually want the
  <b>LCP array</b> too: <code>lcp[i]</code> is the length of the longest common
  prefix of the neighbouring suffixes <code>sa[i]</code> and
  <code>sa[i + 1]</code>. Computing it naively is quadratic, but Kasai's
  algorithm uses one fact: when you move from suffix <code>i</code> to suffix
  <code>i + 1</code>, the common prefix with its sorted neighbour can shrink by
  at most one, so you never need to restart the count from zero.
</p>
<pre><code><span class="c">// O(n) time, O(n) space; lcp[r] is the common prefix of suffixes sa[r] and sa[r + 1]</span>
function lcpArray(s, sa) {
  const n = s.length;
  const rank = new Array(n);
  for (let i = 0; i &lt; n; i++) rank[sa[i]] = i;

  const lcp = new Array(Math.max(n - 1, 0)).fill(0);
  let h = 0; <span class="c">// the current common-prefix length, carried from one suffix to the next</span>
  for (let i = 0; i &lt; n; i++) {
    if (rank[i] === n - 1) { h = 0; continue; } <span class="c">// the last suffix has no right neighbour</span>
    const j = sa[rank[i] + 1];
    while (i + h &lt; n &amp;&amp; j + h &lt; n &amp;&amp; s[i + h] === s[j + h]) h++;
    lcp[rank[i]] = h;
    if (h > 0) h--; <span class="c">// the next suffix shares at least h - 1 characters with its neighbour</span>
  }
  return lcp;
}

<span class="c">// the number of different substrings: all n(n+1)/2, minus those counted twice</span>
function countDistinctSubstrings(s) {
  const lcp = lcpArray(s, suffixArray(s));
  return (s.length * (s.length + 1)) / 2 - lcp.reduce((total, value) => total + value, 0);
}

<span class="c">// the longest substring that occurs at least twice (overlaps allowed)</span>
function longestRepeatedSubstring(s) {
  const sa = suffixArray(s);
  const lcp = lcpArray(s, sa);
  let best = 0, at = 0;
  for (let i = 0; i &lt; lcp.length; i++) {
    if (lcp[i] > best) { best = lcp[i]; at = sa[i]; }
  }
  return s.slice(at, at + best);
}</code></pre>
<h4>Dry run: s = "banana"</h4>
<table>
  <tr><th>rank r</th><th>sa[r]</th><th>suffix</th><th>lcp[r] with the next suffix</th></tr>
  <tr><td>0</td><td>5</td><td>a</td><td>1 (with "ana")</td></tr>
  <tr><td>1</td><td>3</td><td>ana</td><td>3 (with "anana")</td></tr>
  <tr><td>2</td><td>1</td><td>anana</td><td>0 (with "banana")</td></tr>
  <tr><td>3</td><td>0</td><td>banana</td><td>0 (with "na")</td></tr>
  <tr><td>4</td><td>4</td><td>na</td><td>2 (with "nana")</td></tr>
  <tr><td>5</td><td>2</td><td>nana</td><td>none</td></tr>
</table>
<p class="sub">
  There are 6 · 7 / 2 = 21 substrings counted with repeats, and the LCP values
  add up to 1 + 3 + 0 + 0 + 2 = 6, so there are 21 − 6 = 15 distinct substrings.
  The largest LCP is 3, between <code>"ana"</code> and <code>"anana"</code>, so the
  longest repeated substring is the first 3 characters of the suffix at position 3,
  which is <code>"ana"</code>. Why the distinct count works: walking the sorted
  suffixes, each new suffix contributes only the prefixes that are longer than
  what it shares with the previous one, which is its length minus the LCP.
</p>
<div class="warn">
  <span class="ttl">⚠ What the comparator must say about short suffixes</span>
  In the doubling step, a suffix that has fewer than <code>k</code> characters left
  has no second half. It must sort <em>before</em> any suffix that agrees with it
  on the first half and continues, because a prefix of a string sorts before the
  string itself. Using <code>-1</code> for the missing second rank (all real ranks
  are 0 or more) does exactly that; using 0 would tie it with a real rank and
  produce a wrong order. Also, <code>Array.prototype.sort</code> with a comparator
  is a comparison sort, so each round is O(n log n), and the whole construction is
  O(n log² n) rather than the O(n log n) of radix-sort versions.
</div>
<p class="sub">
  Linear-time constructions exist, but you will not be asked to write one in an
  interview. What you should be able to say: the suffix array plus the LCP array
  turns "distinct substrings", "longest repeated substring" and "does pattern P
  occur" (binary search the suffix array, O(m log n)) into short loops, at the
  price of O(n log² n) to build. For one-off questions about a single substring
  length, hashing with binary search is usually less code; the suffix array pays
  off when you ask many different questions about the same string.
</p>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>"Find all occurrences," "does A contain B," "how many times does the pattern appear" with n and m both large enough that O(n·m) times out — that's KMP or Rabin-Karp</li>
  <li>The input is a <em>stream</em>, or you're told you may not seek backward in the text — KMP is the only one of these that never rewinds the input pointer</li>
  <li>Several patterns, all the same length, searched at once, or a 2D grid pattern — Rabin-Karp, because hashes go into a Set and generalize to rectangles</li>
  <li>Anything about <b>prefixes that are also suffixes</b>, string periodicity, rotations, or "shortest characters to prepend/append" — build the failure table and read one entry, don't invent a new algorithm</li>
  <li>"Longest palindromic substring/prefix," "count all palindromic substrings" — expand-around-center first (O(n²), always acceptable), Manacher if pressed for linear</li>
  <li>Distinguish from DP: "longest palindromic <em>subsequence</em>" (non-contiguous) is 2D DP, not Manacher; "edit distance" and "longest common subsequence" are DP too. These algorithms are all about <em>contiguous</em> matches</li>
  <li>Pitfall: hash equality is never proof of string equality — an implementation that skips the verification step is a bug, not an optimization</li>
  <li>"Longest substring that appears twice / satisfies something monotone in the length," or many "are these two substrings equal" checks → prefix hashes plus binary search on the length, with two moduli, a random base and a verification on hits</li>
  <li>A dictionary of many words searched in one text, or "censor / tag every keyword" → Aho-Corasick: a trie with failure links, one pass over the text</li>
  <li>"Sum of the longest common prefixes with the whole string" → the sum of the Z array. "Is B a rotation of A" → B occurs in A + A. "Smallest or canonical rotation" → the two-pointer minimal rotation</li>
  <li>"Number of distinct substrings," "longest repeated substring," "k-th smallest substring" → a suffix array and its LCP array, rather than a new algorithm per question</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Build the KMP failure table for a pattern by hand, and explain why a mismatch falls back to <code>fail[len - 1]</code> instead of resetting <code>len</code> to 0.</li>
    <li>Write <code>kmpSearch</code> from memory and explain why the text pointer <code>i</code> never moves backward, even on a mismatch.</li>
    <li>Explain Rabin-Karp's two classic bugs — negative modulo and silent overflow — and what specifically in the code prevents each one.</li>
    <li>Trace the Z-function's mirror-copy step on a short string and explain why it keeps the algorithm O(n) instead of degrading to O(n²).</li>
    <li>Given a new problem, decide whether it needs occurrence search (KMP/Rabin-Karp/Z-function), palindrome structure (Manacher), or just the failure table's <code>n - fail[n-1]</code> identity (periodicity) — and justify the choice.</li>
    <li>Derive the substring hash <code>H[r] - H[l] * B^(r-l)</code>, explain why <code>H[l] * pow</code> needs a safe multiplication in JavaScript, and use the monotone-length idea to find the longest duplicate substring.</li>
    <li>Say why one modulus with a fixed base is unsafe, why natural 32-bit overflow can be broken by a Thue-Morse pair, and what two moduli with a random base buy you.</li>
    <li>Explain the failure link of Aho-Corasick as KMP's fallback on a trie, and why each node must inherit the outputs of its link.</li>
    <li>Show why the prefix function of <code>s + "#" + reverse(s)</code> gives the longest palindromic prefix, and why the sum of the Z array is the sum of scores.</li>
    <li>Describe how a suffix array and its LCP array count distinct substrings, and what comparison rule a suffix with no second half needs.</li>
  </ul>
</div>`,
};
