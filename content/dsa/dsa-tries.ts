import type { Chapter } from "../types";

export const dsaTries: Chapter = {
  id: "dsa-tries",
  num: "A5",
  title: "Tries",
  short: "Tries",
  levels: ["advanced"],
  practice: ["ex-maximum-xor-of-two-numbers", "ex-implement-trie", "ex-add-and-search-words", "ex-word-search-ii"],
  ready: true,
  subtitle: "Store the string as a path, not a value — and every prefix question becomes a walk instead of a scan.",
  body: `<h3>The shape: the word is the path</h3>
<p>
  A hash set of words answers exactly one question well: "is this exact string
  present?" It is useless for "does anything here start with <code>ca</code>?"
  — you'd have to scan every key. A <b>trie</b> (prefix tree) fixes that by
  storing each character as an <em>edge</em> in a tree, so a word is a
  root-to-node path and every shared prefix is shared storage. Looking up a
  prefix costs O(length of the prefix), completely independent of how many
  words the dictionary holds.
</p>
<p>
  Each node holds two things and nothing else: a map from next-character to
  child node, and a boolean saying "a complete word ends here." That second
  flag is load-bearing — without it you can't tell the stored word
  <code>"do"</code> from the mere prefix <code>"do"</code> inside
  <code>"dog"</code>.
</p>

<figure>
  <svg viewBox="0 0 640 260" class="dg" role="img" aria-label="A trie built from the words car, cat, do and dog, with nodes that terminate a word highlighted in green">
    <g class="rough">
      <path class="ln" d="M300,25 L180,80" />
      <path class="ln" d="M300,25 L470,80" />
      <path class="ln" d="M180,80 L180,135" />
      <path class="ln" d="M180,135 L110,190" />
      <path class="ln" d="M180,135 L250,190" />
      <path class="ln" d="M470,80 L470,135" />
      <path class="ln" d="M470,135 L470,190" />
    </g>
    <g class="rough">
      <circle class="box" cx="300" cy="25" r="20" />
      <circle class="box" cx="180" cy="80" r="18" />
      <circle class="box" cx="470" cy="80" r="18" />
      <circle class="box" cx="180" cy="135" r="18" />
      <circle class="boxg" cx="470" cy="135" r="18" />
      <circle class="boxg" cx="110" cy="190" r="18" />
      <circle class="boxg" cx="250" cy="190" r="18" />
      <circle class="boxg" cx="470" cy="190" r="18" />
    </g>
    <text class="sm" x="300" y="30" text-anchor="middle">root</text>
    <text class="lbl" x="180" y="86" text-anchor="middle">c</text>
    <text class="lbl" x="470" y="86" text-anchor="middle">d</text>
    <text class="lbl" x="180" y="141" text-anchor="middle">a</text>
    <text class="lbl" x="470" y="141" text-anchor="middle">o</text>
    <text class="lbl" x="110" y="196" text-anchor="middle">r</text>
    <text class="lbl" x="250" y="196" text-anchor="middle">t</text>
    <text class="lbl" x="470" y="196" text-anchor="middle">g</text>
    <text class="sm gr" x="110" y="222" text-anchor="middle">"car"</text>
    <text class="sm gr" x="250" y="222" text-anchor="middle">"cat"</text>
    <text class="sm gr" x="470" y="222" text-anchor="middle">"dog"</text>
    <text class="sm gr" x="500" y="140">"do"</text>
    <text class="lbl gr" x="20" y="248" style="font-size:14px">green = isEnd — a stored word finishes at this node</text>
  </svg>
  <figcaption>"car" and "cat" share the c–a path entirely. "do" ends at a node that still has a child, which is why isEnd is a flag and not "has no children."</figcaption>
</figure>

<h3>The structure from scratch</h3>
<p>
  A <code>Map</code> for children beats a fixed 26-slot array: it costs nothing
  for sparse nodes, and it survives inputs that aren't lowercase a–z (digits,
  unicode, arbitrary keys). The fixed array is faster by a constant factor when
  the alphabet really is 26 letters, and it's worth mentioning that tradeoff out
  loud, but reach for the Map by default.
</p>
<pre><code>class TrieNode {
  constructor() {
    this.children = new Map(); <span class="c">// char → TrieNode</span>
    this.isEnd = false;        <span class="c">// a complete stored word terminates here</span>
  }
}

class Trie {
  constructor() { this.root = new TrieNode(); }

  <span class="c">// O(L) time where L = word.length, O(L) new nodes worst case</span>
  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch);
    }
    node.isEnd = true;
  }

  <span class="c">// walk as far as the string goes; returns the node or null</span>
  _walk(str) {
    let node = this.root;
    for (const ch of str) {
      node = node.children.get(ch);
      if (!node) return null;
    }
    return node;
  }

  search(word) {
    const node = this._walk(word);
    return node !== null && node.isEnd; <span class="c">// reaching the node is NOT enough</span>
  }

  startsWith(prefix) {
    return this._walk(prefix) !== null; <span class="c">// here reaching the node IS enough</span>
  }
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ isEnd is not "has no children," and a leaf is not "is a word"</span>
  Both directions of this confusion produce wrong answers. In the diagram,
  the <code>o</code> node has a child (<code>g</code>) but <em>is</em> a word
  ("do") — so testing <code>children.size === 0</code> misses it. And if you
  only ever insert "dog", the <code>o</code> node is childless-free but is
  <em>not</em> a word. <code>search()</code> and <code>startsWith()</code>
  differing by exactly the <code>isEnd</code> check is the entire point of the
  flag; if your two methods have identical bodies, you have a bug.
</div>

<h3>Cost: pay for the word length, not the dictionary size</h3>
<table>
  <tr><th>Operation</th><th>Trie</th><th>Hash set of words</th><th>Sorted array + binary search</th></tr>
  <tr><td>insert word of length L</td><td>O(L)</td><td>O(L) hash</td><td>O(n) shift</td></tr>
  <tr><td>exact search</td><td>O(L)</td><td>O(L)</td><td>O(L log n)</td></tr>
  <tr><td>"any word with prefix P?"</td><td><b>O(P)</b></td><td>O(n · L) — full scan</td><td>O(L log n)</td></tr>
  <tr><td>list all words with prefix P</td><td>O(P + output)</td><td>O(n · L)</td><td>O(L log n + output)</td></tr>
  <tr><td>space</td><td>O(total chars), shared prefixes stored once</td><td>O(total chars) + hash overhead</td><td>O(total chars)</td></tr>
</table>
<p class="sub">
  The sorted-array column is the honest competitor people forget: sorting the
  dictionary puts every prefix group in a contiguous block, so binary search
  handles prefix queries too. The trie wins when the dictionary <em>changes</em>
  (insertions are O(L), not O(n)) and when you need to walk character-by-character
  <em>while</em> doing something else — which is exactly the Word Search II case
  below, and the real reason tries show up in interviews.
</p>

<div class="sticky mint">
  <span class="ttl">The question each structure answers</span>
  A hash set answers "is this <em>exact</em> string here?" A trie answers "is
  anything here that <em>starts like</em> this?" — and it can answer it
  incrementally, one character at a time, without restarting. Any problem where
  you're extending a candidate string one character at a time and want to bail
  early is a trie problem.
</div>

<h3>Autocomplete: collect everything under a prefix</h3>
<p>
  Walk to the prefix node in O(P), then DFS its subtree collecting every
  <code>isEnd</code>. The cost is O(P + size of the subtree), which is
  proportional to the answer rather than the dictionary — that's what makes it
  viable at search-box latency.
</p>
<pre><code>function autocomplete(trie, prefix, limit = 10) {
  const start = trie._walk(prefix);
  if (!start) return [];

  const out = [];
  (function dfs(node, suffix) {
    if (out.length >= limit) return; <span class="c">// stop the moment we have enough</span>
    if (node.isEnd) out.push(prefix + suffix);

    <span class="c">// sort keys for lexicographic order; skip the sort if insertion order is fine</span>
    for (const ch of [...node.children.keys()].sort()) {
      dfs(node.children.get(ch), suffix + ch);
      if (out.length >= limit) return;
    }
  })(start, "");

  return out;
}</code></pre>
<p class="sub">
  Real autocomplete wants <em>top-k by popularity</em>, not lexicographic order,
  and that changes the design: store a frequency on each terminal node, and at
  insert time also push the word into a small "best few in this subtree" list on
  every node along the path. Then a prefix query is O(P) with no DFS at all —
  you read the cached list off the prefix node. That precompute-on-write trade
  is exactly the answer expected in a "design a search suggestion service"
  system-design follow-up.
</p>

<h3>Wildcard search — the '.' matches any character</h3>
<p>
  The "Design Add and Search Words" variant adds a dot that matches any single
  character. Deterministic lookup becomes a small DFS: a concrete character
  follows one child, a dot branches to all of them.
</p>
<pre><code>function searchPattern(node, word, i = 0) {
  if (i === word.length) return node.isEnd;

  const ch = word[i];
  if (ch !== ".") {
    const next = node.children.get(ch);
    return next ? searchPattern(next, word, i + 1) : false; <span class="c">// single deterministic step</span>
  }

  for (const child of node.children.values()) {
    if (searchPattern(child, word, i + 1)) return true; <span class="c">// dot = branch over every child</span>
  }
  return false;
}</code></pre>
<p class="sub">
  Worst case (a query of all dots) this degenerates to visiting the whole trie,
  O(26<sup>L</sup>) branching bounded by the number of nodes — but note the
  branching factor is the number of <em>existing</em> children, not 26, so on a
  real dictionary it collapses fast. Say that bound out loud rather than
  claiming O(L).
</p>

<h3>Word Break — the trie kills the substring scanning</h3>
<p>
  The DP is the familiar one from the 1D DP chapter: <code>ok[i]</code> means
  "s[0..i) is fully segmentable." The naive inner loop slices
  <code>s.substring(i, j)</code> and hashes it, costing O(n² · L). Walking a
  trie instead reuses the previous character's work and — crucially — breaks the
  instant no dictionary word continues down this path.
</p>
<pre><code>function wordBreak(s, wordDict) {
  const root = {};
  for (const w of wordDict) { <span class="c">// plain objects are fine and fast when keys are chars</span>
    let node = root;
    for (const ch of w) {
      if (!node[ch]) node[ch] = {};
      node = node[ch];
    }
    node.end = true;
  }

  const n = s.length;
  const ok = new Array(n + 1).fill(false);
  ok[0] = true; <span class="c">// the empty prefix is trivially segmentable</span>

  for (let i = 0; i < n; i++) {
    if (!ok[i]) continue; <span class="c">// unreachable start — nothing to extend</span>

    let node = root;
    for (let j = i; j < n; j++) {
      node = node[s[j]];
      if (!node) break; <span class="c">// THE win: no dictionary word starts s[i..j], abandon this start</span>
      if (node.end) ok[j + 1] = true;
    }
  }
  return ok[n];
}</code></pre>
<p class="sub">
  Worst case is still O(n²), but the <code>break</code> means the inner loop
  runs only as far as the longest dictionary word that actually matches — in
  practice a handful of characters, not n. No substrings are allocated either,
  which matters more than it looks on long inputs.
</p>

<h3>Word Search II — the trie prunes the backtracking</h3>
<p>
  This is the problem tries exist for in interviews. Find every dictionary word
  hidden in a grid. Running the single-word Word Search backtracking from the
  backtracking chapter once per word is O(W · R · C · 4<sup>L</sup>) and times
  out. The fix is to invert the loop: build one trie of all words and DFS the
  grid <em>once</em>, carrying a trie node alongside the position. The moment the
  path spells something no word starts with, the branch dies.
</p>
<pre><code>function findWords(board, words) {
  const root = {};
  for (const w of words) {
    let node = root;
    for (const ch of w) {
      if (!node[ch]) node[ch] = {};
      node = node[ch];
    }
    node.word = w; <span class="c">// store the word itself — no need to rebuild it from the path</span>
  }

  const rows = board.length, cols = board[0].length;
  const found = [];

  function dfs(r, c, node) {
    const ch = board[r][c];
    const next = node[ch];
    if (!next) return; <span class="c">// PRUNE: no word in the dictionary continues this way</span>

    if (next.word) {
      found.push(next.word);
      delete next.word; <span class="c">// de-dupe: never report the same word twice</span>
    }

    board[r][c] = "#"; <span class="c">// mark visited in place, same trick as Word Search</span>
    if (r > 0)        dfs(r - 1, c, next);
    if (r < rows - 1) dfs(r + 1, c, next);
    if (c > 0)        dfs(r, c - 1, next);
    if (c < cols - 1) dfs(r, c + 1, next);
    board[r][c] = ch; <span class="c">// un-choose</span>

    <span class="c">// leaf pruning: this branch is exhausted, unlink it so future DFS never enters</span>
    if (Object.keys(next).length === 0) delete node[ch];
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) dfs(r, c, root);
  }
  return found;
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Three bugs this problem reliably produces</span>
  <b>Duplicates</b> — the same word can be spelled from several start cells, so
  you must clear the marker after reporting it (<code>delete next.word</code>,
  not just pushing). <b>Using a Set to de-dupe instead</b> works but leaves the
  trie node reporting forever, wasting work. <b>Forgetting the restore</b>
  <code>board[r][c] = ch</code> silently blocks cells for later, unrelated
  searches. The leaf-pruning line is the only optional one, and it's what turns
  a TLE into a fast solution on adversarial inputs like a grid of all
  <code>'a'</code> with words <code>"aaaa...a"</code>.
</div>
<p class="sub">
  <code>delete next.word</code> rather than <code>next.word = null</code> matters
  for the pruning line below it: an assigned-null key still shows up in
  <code>Object.keys</code>, so the node would never look empty and the prune
  would never fire.
</p>

<div class="say">
  <span class="ttl">Say it like this →</span> "Instead of running the grid search
  once per word, I'll put all the words in a trie and search the grid once,
  carrying a trie pointer with the DFS. As soon as the path I've spelled isn't a
  prefix of any word, I stop — so shared prefixes are explored once rather than
  once per word, and dead branches are cut at the first character that doesn't
  match anything."
</div>

<h3>Advanced aside: the binary trie for maximum XOR</h3>
<p>
  A trie doesn't have to be built from letters. Write each number as its 32-bit
  binary string and insert those — now the "alphabet" is <code>{0, 1}</code>, the
  tree is exactly 32 deep, and you can answer "which stored number XORs with x to
  give the largest result?" greedily. XOR gives a 1 bit exactly when the bits
  differ, and the high bits dominate the value, so at each level you steer toward
  the <em>opposite</em> bit if such a branch exists.
</p>
<pre><code><span class="c">// maximum XOR of any pair — O(32n) time, O(32n) nodes, vs O(n²) brute force</span>
function findMaximumXOR(nums) {
  const BITS = 31; <span class="c">// stay inside 32-bit signed range: bit 31 down to bit 0</span>
  const root = {};

  for (const num of nums) {
    let node = root;
    for (let b = BITS; b >= 0; b--) {
      const bit = (num >> b) & 1;
      if (!node[bit]) node[bit] = {};
      node = node[bit];
    }
  }

  let best = 0;
  for (const num of nums) {
    let node = root, current = 0;
    for (let b = BITS; b >= 0; b--) {
      const bit = (num >> b) & 1;
      const want = bit ^ 1; <span class="c">// the opposite bit sets this position in the XOR</span>
      if (node[want]) {
        current |= 1 << b;  <span class="c">// greedy: a high bit is worth more than every lower bit combined</span>
        node = node[want];
      } else {
        node = node[bit];   <span class="c">// forced to match — this bit contributes 0</span>
      }
    }
    best = Math.max(best, current);
  }
  return best;
}</code></pre>
<p class="sub">
  The greedy step is safe for the same reason binary place value works: setting
  bit b contributes 2<sup>b</sup>, which strictly exceeds the sum of every lower
  bit (2<sup>b</sup> − 1). So there is never a reason to give up a high bit hoping
  to win low ones. The same structure, with counts stored per node, extends to
  "count pairs with XOR less than k" and to offline queries with a max-value
  constraint.
</p>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>The words <b>prefix</b>, <b>autocomplete</b>, <b>dictionary</b>, <b>starts with</b>, or a list of words plus something to search them against</li>
  <li>You're building a candidate string one character at a time (grid DFS, backtracking, DP over a string) and want to abandon it the moment no target could continue — that incremental "still a valid prefix?" check is the trie's unique ability</li>
  <li>Brute force is "for each of W words, scan/search the whole input" — the trie inverts it to one pass over the input carrying all W words at once</li>
  <li>Distinguish from a hash set: if only exact membership is ever asked, a <code>Set</code> is simpler, smaller and faster — don't build a trie to show off</li>
  <li>Distinguish from suffix structures: "any substring" questions (repeated substrings, longest common substring) want a suffix trie/automaton or hashing, not a plain prefix trie</li>
  <li>Bitwise pair problems — maximum XOR, XOR under a threshold — are a binary trie over 32-bit strings in disguise</li>
  <li>Watch the flag: <code>isEnd</code> is separate from "leaf," and <code>search</code> vs <code>startsWith</code> must differ by exactly that check</li>
</ul>`,
};
