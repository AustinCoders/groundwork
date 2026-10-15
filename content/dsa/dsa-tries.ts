import type { Chapter } from "../types";

export const dsaTries: Chapter = {
  id: "dsa-tries",
  num: "I17",
  title: "Tries",
  short: "Tries",
  levels: ["intermediate"],
  prerequisites: ["dsa-trees", "dsa-hashing"],
  practice: [
    "ex-maximum-xor-of-two-numbers",
    "ex-implement-trie",
    "ex-add-and-search-words",
    "ex-word-search-ii",
    "ex-replace-words",
    "ex-longest-word-in-dictionary",
    "ex-map-sum-pairs",
    "ex-stream-of-characters",
    "ex-trie-remove-word",
  ],
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
<h4>Dry run: inserting "car", "cat", "do", "dog" — the diagram above</h4>
<table>
  <tr><th>Call</th><th>Nodes walked</th><th>New nodes created</th><th>Result</th></tr>
  <tr><td>insert("car")</td><td>root→c→a→r</td><td>c, a, r (all new)</td><td>isEnd(r) = true</td></tr>
  <tr><td>insert("cat")</td><td>root→c→a→t</td><td>t only (c, a reused)</td><td>isEnd(t) = true</td></tr>
  <tr><td>insert("do")</td><td>root→d→o</td><td>d, o (all new)</td><td>isEnd(o) = true</td></tr>
  <tr><td>insert("dog")</td><td>root→d→o→g</td><td>g only (d, o reused)</td><td>isEnd(g) = true</td></tr>
  <tr><td>search("do")</td><td>root→d→o</td><td>—</td><td>node found, isEnd(o)=true → true</td></tr>
  <tr><td>search("d")</td><td>root→d</td><td>—</td><td>node found, isEnd(d)=false → false</td></tr>
  <tr><td>startsWith("do")</td><td>root→d→o</td><td>—</td><td>node found, isEnd not checked → true</td></tr>
</table>
<p class="sub">
  "car" and "cat" only ever create one new node (t) because <code>insert</code>'s
  <code>children.has(ch)</code> check reuses the existing c→a path — that sharing
  is the whole point of a trie. <code>search("d")</code> and <code>startsWith("do")</code>
  both walk to a real node; the only reason they'd disagree on the same input is
  the <code>isEnd</code> check, which is exactly the line <code>search</code> has
  and <code>startsWith</code> doesn't.
</p>
<div class="warn">
  <span class="ttl">⚠ isEnd and "has children" are independent facts</span>
  Neither one tells you the other. In the diagram, the <code>o</code> node
  has a child (<code>g</code>) but <em>is</em> a word ("do") — so testing
  <code>children.size === 0</code> misses it. And if you only ever insert
  "dog", the <code>o</code> node still has a child but is <em>not</em> a
  word, so having children can't tell you a word ends there either. Only the
  flag can. <code>search()</code> and <code>startsWith()</code> differing by
  exactly the <code>isEnd</code> check is the entire point of the flag; if
  your two methods have identical bodies, you have a bug.
</div>

<h3>Array children, Map children, and the radix trie</h3>
<p>
  The <code>Map</code> in each node is a default, not a law. When the alphabet
  is fixed and small (lowercase letters, digits, DNA bases) a node can hold a
  plain array with one slot per letter, indexed by
  <code>word.charCodeAt(i) - 97</code>. A child lookup becomes an array read
  with no hashing, and a node has a fixed shape, which helps the engine.
</p>
<pre><code>class ArrayTrieNode {
  constructor() {
    this.children = new Array(26).fill(null); <span class="c">// slot 0 is "a", slot 25 is "z"</span>
    this.isEnd = false;
  }
}

class ArrayTrie {
  constructor() { this.root = new ArrayTrieNode(); }

  insert(word) {
    let node = this.root;
    for (let i = 0; i &lt; word.length; i++) {
      const slot = word.charCodeAt(i) - 97;
      if (node.children[slot] === null) node.children[slot] = new ArrayTrieNode();
      node = node.children[slot];
    }
    node.isEnd = true;
  }

  search(word) {
    let node = this.root;
    for (let i = 0; i &lt; word.length; i++) {
      node = node.children[word.charCodeAt(i) - 97];
      if (node === null) return false;
    }
    return node.isEnd;
  }
}</code></pre>
<table>
  <tr><th></th><th>Array of 26 slots</th><th>Map per node</th></tr>
  <tr><td>Child lookup</td><td>index arithmetic, O(1)</td><td>hash lookup, O(1) on average</td></tr>
  <tr><td>Memory per node</td><td>26 slots whether or not used</td><td>grows with the real number of children</td></tr>
  <tr><td>Alphabet</td><td>must be known and small; a stray capital letter or digit indexes outside 0..25</td><td>anything: Unicode, digits, whole words as "characters"</td></tr>
  <tr><td>Iterating children in order</td><td>already in alphabetical order</td><td>needs a sort of the keys</td></tr>
  <tr><td>Best when</td><td>dense nodes near the root, lowercase input</td><td>sparse, deep nodes or an unknown alphabet</td></tr>
</table>
<p class="sub">
  With a Map, a node that has one child costs one entry. With the array, the
  same node still pays for 26, which dominates memory for long, unshared
  words. A mistyped input such as <code>"A"</code> gives slot -32, and
  <code>children[-32]</code> is <code>undefined</code>, not <code>null</code>,
  so the <code>=== null</code> test lets it through into a crash. Say the
  tradeoff, then pick the Map unless you were told the alphabet.
</p>
<p>
  Long unshared words are exactly where a plain trie wastes nodes: a word
  stored alone becomes a chain of single-child nodes. A <b>radix trie</b>
  (compressed trie, Patricia trie) collapses every such chain into one edge
  that carries a string label. Every non-root node then either ends a word or
  has at least two children, which bounds the whole tree at about 2n nodes for
  n words, whatever the word lengths.
</p>
<pre><code>function commonPrefixLength(a, b) {
  let i = 0;
  while (i &lt; a.length &amp;&amp; i &lt; b.length &amp;&amp; a[i] === b[i]) i++;
  return i;
}

class RadixNode {
  constructor() {
    this.edges = new Map(); <span class="c">// first character of the label → { label, node }</span>
    this.isEnd = false;
  }
}

class RadixTrie {
  constructor() { this.root = new RadixNode(); }

  insert(word) {
    let node = this.root, rest = word;
    while (rest.length &gt; 0) {
      const edge = node.edges.get(rest[0]);
      if (!edge) {                                     <span class="c">// no edge starts this way: one new edge holds the whole rest</span>
        const leaf = new RadixNode();
        leaf.isEnd = true;
        node.edges.set(rest[0], { label: rest, node: leaf });
        return;
      }
      const k = commonPrefixLength(edge.label, rest);
      if (k &lt; edge.label.length) {                     <span class="c">// the label only partly matches: split it at k</span>
        const middle = new RadixNode();
        middle.edges.set(edge.label[k], { label: edge.label.slice(k), node: edge.node });
        edge.label = edge.label.slice(0, k);
        edge.node = middle;
      }
      node = edge.node;
      rest = rest.slice(k);
    }
    node.isEnd = true;
  }

  search(word) {
    let node = this.root, rest = word;
    while (rest.length &gt; 0) {
      const edge = node.edges.get(rest[0]);
      if (!edge || !rest.startsWith(edge.label)) return false;
      node = edge.node;
      rest = rest.slice(edge.label.length);
    }
    return node.isEnd;
  }
}</code></pre>
<h4>Dry run: insert "car", then "cat", then "do"</h4>
<table>
  <tr><th>Call</th><th>What happens</th><th>Edges afterwards</th></tr>
  <tr><td>insert("car")</td><td>root has no edge starting with c, so one edge carries the whole word</td><td>c: "car"</td></tr>
  <tr><td>insert("cat")</td><td>the edge "car" shares only "ca" with "cat" (k = 2), so it splits: "ca" leads to a middle node with edges "r" and "t"</td><td>c: "ca" → { r: "r", t: "t" }</td></tr>
  <tr><td>insert("do")</td><td>no edge starts with d: a new edge "do"</td><td>c: "ca" → { r, t }, d: "do"</td></tr>
</table>
<p class="sub">
  The splitting step is the whole difficulty; searching is the same walk as
  before, comparing a whole label with <code>startsWith</code> instead of one
  character. Costs stay O(L) character comparisons per operation. A slice that
  copies would make the string version O(L²) in the worst case, and although V8
  shares the memory of long slices, walking by index is O(L) by construction. In an interview you are almost never asked to write this; knowing
  it exists, and why it saves memory, is the point.
</p>

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

<h3>Counting inside the trie: prefix counts and Map Sum</h3>
<p>
  A node can carry any number that is defined by "all words below me". Store
  at each node the total value of the words that pass through it, and the
  answer to "what is the total of everything with this prefix" is the number
  on the prefix node: O(prefix length), no subtree walk. The design question
  <b>Map Sum</b> asks for exactly that: <code>insert(key, val)</code> sets a key
  to a value (replacing an old one), and <code>sum(prefix)</code> returns the
  total of all values whose key starts with the prefix.
</p>
<p>
  The replacement rule is the trap. Re-inserting a key must not add its new
  value on top of the old; it must add the <em>difference</em>. Keep a side
  map of each key's current value, compute <code>delta = val - old</code>, and
  add the delta at every node on the key's path.
</p>
<pre><code>class MapSum {
  constructor() {
    this.root = { sum: 0, children: new Map() };
    this.values = new Map(); <span class="c">// key → its current value, so a replacement can be turned into a delta</span>
  }

  insert(key, val) {
    const delta = val - (this.values.get(key) ?? 0);
    this.values.set(key, val);
    let node = this.root;
    node.sum += delta;
    for (const ch of key) {
      if (!node.children.has(ch)) node.children.set(ch, { sum: 0, children: new Map() });
      node = node.children.get(ch);
      node.sum += delta;
    }
  }

  sum(prefix) {
    let node = this.root;
    for (const ch of prefix) {
      node = node.children.get(ch);
      if (!node) return 0;
    }
    return node.sum;
  }
}</code></pre>
<h4>Dry run: insert("apple", 3), sum("ap"), insert("app", 2), sum("ap"), insert("apple", 5), sum("ap")</h4>
<table>
  <tr><th>Call</th><th>delta</th><th>Sums on the path a, p, p, l, e</th><th>Returns</th></tr>
  <tr><td>insert("apple", 3)</td><td>3 - 0 = 3</td><td>3, 3, 3, 3, 3</td><td>—</td></tr>
  <tr><td>sum("ap")</td><td>—</td><td>node for "ap" holds 3</td><td>3</td></tr>
  <tr><td>insert("app", 2)</td><td>2 - 0 = 2</td><td>a: 5, p: 5, p: 5 (the "l" and "e" nodes stay 3)</td><td>—</td></tr>
  <tr><td>sum("ap")</td><td>—</td><td>node for "ap" holds 5</td><td>5</td></tr>
  <tr><td>insert("apple", 5)</td><td>5 - 3 = 2</td><td>a: 7, p: 7, p: 7, l: 5, e: 5</td><td>—</td></tr>
  <tr><td>sum("ap")</td><td>—</td><td>node for "ap" holds 7</td><td>7</td></tr>
</table>
<p class="sub">
  Insert is O(L), sum is O(P), and memory is O(total characters). The same
  idea, with 1 instead of a value, gives "how many words start with this
  prefix" (a prefix count), which also lets you detect that one word is a
  prefix of another without a flag walk. The brute-force alternative, a map
  from key to value plus a scan of every key on each <code>sum</code>, costs
  O(n · L) per query.
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

<h3>Replace Words: stop at the shortest root</h3>
<p>
  A dictionary holds "roots" (<code>"cat"</code>, <code>"bat"</code>), and
  every word in a sentence that starts with a root is replaced by the
  <em>shortest</em> root that begins it. Build a trie of the roots, then walk
  each word through it: the first node on the path that is marked as a word end
  is the shortest root, so return as soon as you meet it. If the walk falls off
  the trie, or the word ends first, no root applies and the word stays as it
  is.
</p>
<pre><code>function replaceWords(dictionary, sentence) {
  const trie = {};
  for (const root of dictionary) {
    let node = trie;
    for (const ch of root) {
      if (!node[ch]) node[ch] = {};
      node = node[ch];
    }
    node.end = true;
  }

  function shortestRoot(word) {
    let node = trie;
    for (let i = 0; i &lt; word.length; i++) {
      node = node[word[i]];
      if (!node) return word;                  <span class="c">// no root starts this way</span>
      if (node.end) return word.slice(0, i + 1); <span class="c">// first end seen is the shortest root</span>
    }
    return word;
  }

  return sentence.split(" ").map(shortestRoot).join(" ");
}

replaceWords(["cat", "bat", "rat"], "the cattle was rattled by the battery");
<span class="c">// "the cat was rat by the bat"</span></code></pre>
<p class="sub">
  Building costs O(total root characters). Each word costs at most the length
  of the longest root, since the walk dies there, so the replacement phase is
  O(sentence length) rather than O(words · roots). The rejected alternative is
  to test every root with <code>startsWith</code> for every word. In the code
  the end marker is stored under the key <code>"end"</code>, which cannot
  collide with a child because child keys are single characters.
</p>

<h3>Longest Word in Dictionary: every prefix must be a word</h3>
<p>
  Find the longest word that can be built one letter at a time, each prefix
  also being a word in the list; break ties with the lexicographically smallest.
  In the trie, a word qualifies exactly when every node on its path is a word
  end, so search only through children that are word ends. Visiting children
  in alphabetical order, and replacing the best answer only when a path is
  strictly longer, makes the first word found at each length the smallest.
</p>
<pre><code>function longestWord(words) {
  const root = { end: true, kids: new Map() }; <span class="c">// the empty prefix counts as buildable</span>
  for (const word of words) {
    let node = root;
    for (const ch of word) {
      if (!node.kids.has(ch)) node.kids.set(ch, { end: false, kids: new Map() });
      node = node.kids.get(ch);
    }
    node.end = true;
  }

  let best = "";
  function dfs(node, path) {
    if (path.length &gt; best.length) best = path; <span class="c">// strict: an equal-length later word is lexicographically larger</span>
    for (const ch of [...node.kids.keys()].sort()) {
      const child = node.kids.get(ch);
      if (child.end) dfs(child, path + ch); <span class="c">// a gap in the chain of words ends this branch</span>
    }
  }
  dfs(root, "");
  return best;
}</code></pre>
<h4>Dry run: ["w", "wo", "wor", "worl", "world", "banana", "ban", "ba"]</h4>
<table>
  <tr><th>Branch from the root</th><th>Path visited</th><th>Why it stops</th></tr>
  <tr><td>"b"</td><td>"b" is not a word, so the branch is never entered</td><td>the first letter is missing</td></tr>
  <tr><td>"w"</td><td>w → wo → wor → worl → world</td><td>every prefix is a word, so best becomes "world"</td></tr>
</table>
<p class="sub">
  <code>"banana"</code> has the prefixes <code>"ba"</code> and
  <code>"ban"</code> in the list but no <code>"b"</code>, so it cannot be
  built. The answer is <code>"world"</code>. Time O(total characters) for the
  build plus the walk over the nodes (and the sorts, bounded by the alphabet
  size at each node). The alternative without a trie sorts the words and keeps
  a Set of buildable ones: also fine, and worth mentioning.
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

<h3>Deleting a word: unlink on the way back up</h3>
<p>
  Deletion is the operation people skip and interviewers like to ask for.
  Two separate things might need to happen. The word must stop being a word,
  which means clearing <code>isEnd</code> on its last node. And nodes that
  <em>only</em> existed for that word should disappear, otherwise the trie
  leaks memory and <code>startsWith</code> still answers true for prefixes of
  a word that is gone. A node is removable when it is not a word end and has
  no children. The check runs from the deepest node back toward the root and
  stops at the first node that is still needed.
</p>
<pre><code>function removeWord(root, word) {
  const path = []; <span class="c">// [parent, character] pairs from the root down to the last node</span>
  let node = root;
  for (const ch of word) {
    const next = node.children.get(ch);
    if (!next) return false; <span class="c">// the word is not in the trie</span>
    path.push([node, ch]);
    node = next;
  }
  if (!node.isEnd) return false; <span class="c">// the path exists only as a prefix of other words</span>
  node.isEnd = false;

  for (let i = path.length - 1; i &gt;= 0; i--) {
    const [parent, ch] = path[i];
    const child = parent.children.get(ch);
    if (child.isEnd || child.children.size &gt; 0) break; <span class="c">// something else still uses this node</span>
    parent.children.delete(ch);
  }
  return true;
}</code></pre>
<h4>Dry run: the trie holds "do" and "dog"</h4>
<table>
  <tr><th>Call</th><th>Walk and flag</th><th>Cleanup, deepest node first</th><th>Result</th></tr>
  <tr><td>removeWord("dog")</td><td>reaches g, g.isEnd becomes false</td><td>g has no children and is not an end: delete it. Then o is an end ("do"): stop</td><td>trie holds "do" only, with d → o</td></tr>
  <tr><td>removeWord("do")</td><td>reaches o, o.isEnd becomes false</td><td>o has no children: delete it. d now has none and is not an end: delete it</td><td>trie is empty</td></tr>
  <tr><td>removeWord("d")</td><td>the root has no child d (the trie is empty)</td><td>none</td><td>false: nothing was removed</td></tr>
</table>
<p class="sub">
  Cost O(L). The two traps are deleting a prefix of another word (removing
  <code>"do"</code> must keep the nodes <code>d, o, g</code> that
  <code>"dog"</code> needs) and returning true for a word that was only a
  prefix. An alternative with the same effect is a counter of words passing
  through each node, decremented along the path, deleting any node whose count
  reaches zero.
</p>

<h3>Stream of Characters: a trie of reversed words</h3>
<p>
  Letters arrive one at a time, and after each one you must say whether some
  suffix of everything received so far is a dictionary word. A normal trie
  matches from the start of a word, but here the end is fixed (the newest
  letter) and the start is unknown. So flip the problem: insert every word
  <em>reversed</em>, and on each arrival walk the stream backwards from the
  newest letter. The first word end you reach means a word ends here.
</p>
<pre><code>class StreamChecker {
  constructor(words) {
    this.root = { children: new Map(), isEnd: false };
    this.maxLength = 0;
    for (const word of words) {
      let node = this.root;
      for (let i = word.length - 1; i &gt;= 0; i--) { <span class="c">// reversed insert</span>
        if (!node.children.has(word[i])) node.children.set(word[i], { children: new Map(), isEnd: false });
        node = node.children.get(word[i]);
      }
      node.isEnd = true;
      this.maxLength = Math.max(this.maxLength, word.length);
    }
    this.recent = []; <span class="c">// only the last maxLength letters can matter</span>
  }

  query(letter) {
    this.recent.push(letter);
    if (this.recent.length &gt; this.maxLength) this.recent.shift();

    let node = this.root;
    for (let i = this.recent.length - 1; i &gt;= 0; i--) { <span class="c">// newest letter first</span>
      node = node.children.get(this.recent[i]);
      if (!node) return false;   <span class="c">// no word ends with these letters</span>
      if (node.isEnd) return true; <span class="c">// a whole reversed word matched: a suffix of the stream is a word</span>
    }
    return false;
  }
}</code></pre>
<h4>Dry run: words ["cd", "f", "kl"], stream a, b, c, d, e, f</h4>
<table>
  <tr><th>query</th><th>recent (last 2 letters)</th><th>Walk, newest first</th><th>Returns</th></tr>
  <tr><td>"a"</td><td>a</td><td>root has no child "a"</td><td>false</td></tr>
  <tr><td>"b"</td><td>a, b</td><td>root has no child "b"</td><td>false</td></tr>
  <tr><td>"c"</td><td>b, c</td><td>root has no child "c" ("cd" is stored as d then c)</td><td>false</td></tr>
  <tr><td>"d"</td><td>c, d</td><td>d, then c, and that node is a word end</td><td>true</td></tr>
  <tr><td>"e"</td><td>d, e</td><td>root has no child "e"</td><td>false</td></tr>
  <tr><td>"f"</td><td>e, f</td><td>f is a word end at once</td><td>true</td></tr>
</table>
<p class="sub">
  Each query costs O(longest word), independent of the stream length, because
  only the last <code>maxLength</code> letters are kept. The
  <code>shift()</code> there is also O(maxLength), which does not change the
  per-query bound. The shape to remember is "match against the end of a growing
  string, so reverse the dictionary". The general tool for matching many words
  against a stream is an Aho-Corasick automaton (a trie plus failure links),
  which does a constant amortized amount of work per letter; the reversed trie
  is the simpler one to write in an interview.
</p>

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
  <li>"Replace with the shortest root," "sum of values by prefix," "count of words with this prefix" → store the answer on the node and read it at the end of the prefix walk</li>
  <li>"Every prefix must also be a word" → only descend through children that are word ends</li>
  <li>Letters arrive in a stream and you ask about a suffix → insert the words reversed and walk backwards from the newest letter</li>
  <li>"Remove a word" → clear the flag, then delete nodes upward while they are not word ends and have no children</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Write insert, search, and startsWith from memory, and say in one sentence exactly what isEnd changes between the last two.</li>
    <li>Explain why "car" and "cat" share nodes in the trie but "do" still needs isEnd as a flag separate from "has children," using the "dog" example.</li>
    <li>Explain why Word Search II builds one trie for all words instead of running Word Search once per word, and what the prefix-miss check prunes.</li>
    <li>Trace the greedy bit-by-bit choice in maximum XOR and explain why taking the opposite bit is never a mistake, even made greedily from the top bit down.</li>
    <li>Given a new problem, recognize when it needs a trie — incremental prefix checks while a candidate string is still being built — versus a plain hash set, which only answers exact membership.</li>
    <li>Compare array children with Map children, and say what a radix trie compresses and why it has about 2n nodes.</li>
    <li>Keep a running total on every node for Map Sum, and say why a replaced key adds only the difference.</li>
    <li>Delete a word from a trie without breaking the words that share its prefix, and say which nodes are safe to unlink.</li>
    <li>Answer a stream-of-characters query with a reversed trie, and say why only the last <code>maxLength</code> letters need to be kept.</li>
  </ul>
</div>`,
};
