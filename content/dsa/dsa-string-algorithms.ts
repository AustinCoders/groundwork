import type { Chapter } from "../types";

export const dsaStringAlgorithms: Chapter = {
  id: "dsa-string-algorithms",
  num: "A7",
  title: "String algorithms",
  short: "String algorithms",
  levels: ["advanced"],
  practice: ["ex-implement-strstr"],
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
  <figcaption>Notice index 5: a single character can force several fallbacks in a row, and that chain is exactly what keeps the build linear.</figcaption>
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
  if (pattern.length === 0) return [0];
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
  by one or drops it to a strictly smaller state — and it never rewinds the
  input. That's why it streams: you can feed KMP a network socket you can't
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
  <code>MOD</code> to 10¹² "because bigger is better" and the products
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

<h3>The Z-function: the same information, easier to reason about</h3>
<p>
  <code>z[i]</code> is the length of the longest substring starting at
  <code>i</code> that is also a prefix of the whole string. It's computed
  with a "Z-box" — the rightmost interval <code>[l, r]</code> known to match
  a prefix — which lets you copy an already-known answer from the mirror
  position instead of recomputing it. Many people find Z easier to derive
  under pressure than KMP's failure table, and it solves substring search by
  a trick: concatenate.
</p>
<pre><code><span class="c">// Z-function — O(n) time, O(n) space</span>
function zFunction(s) {
  const n = s.length;
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

<span class="c">// substring search: glue with a separator that appears in neither string</span>
function zSearch(text, pattern) {
  const combined = pattern + " " + text;
  const z = zFunction(combined);
  const hits = [];
  for (let i = pattern.length + 1; i &lt; combined.length; i++) {
    if (z[i] === pattern.length) hits.push(i - pattern.length - 1);
  }
  return hits;
}</code></pre>
<p class="sub">
  The separator must be a character that cannot occur in either string,
  otherwise a "match" could straddle the boundary and report a false hit.
  <code>" "</code> is a safe default for arbitrary text; interviewers
  often accept <code>"#"</code> with a stated assumption.
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
</table>
<p class="sub">
  In real code you would call <code>indexOf</code>, which V8 implements with
  a tuned hybrid (a two-way / Boyer-Moore-Horspool variant). Say that too —
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
  const fail = buildFailure(s + " " + rev);
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
  <code>n - fail[n-1]</code> being the smallest period of a string is a
  genuinely useful identity — it's the whole answer to "Repeated Substring
  Pattern" and to several string-rotation questions.
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
</ul>`,
};
