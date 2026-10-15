import type { Exercise } from "../types";

export const dsaAddTries: Exercise[] = [
  {
    "id": "ex-replace-words",
    "chapter": "dsa-tries",
    "level": "intermediate",
    "title": "Replace Words",
    "brief": "<p>A dictionary contains <b>roots</b> such as <code>\"cat\"</code>. In a sentence of space-separated words, replace every word that starts with a root by the <b>shortest</b> root that is a prefix of it. A word that starts with no root stays as it is. Return the new sentence.</p><ul><li><code>replaceWords([\"cat\", \"bat\", \"rat\"], \"the cattle was rattled by the battery\")</code> is <code>\"the cat was rat by the bat\"</code></li><li>When several roots fit (<code>\"a\"</code> and <code>\"ab\"</code> for <code>\"abc\"</code>), the shortest wins</li><li>Aim for time proportional to the total length of the roots plus the sentence, not roots times words</li></ul>",
    "starter": "function replaceWords(dictionary, sentence) {\n  // TODO: build a trie of the roots; stop at the first word end on each word's path\n}\n",
    "hints": [
      "Checking every root with startsWith for every word costs roots times words. A trie shares the work.",
      "Insert each root into a trie, marking the node where a root ends.",
      "Walk each word through the trie. The first marked node you meet is the shortest root, so return word.slice(0, i + 1) immediately; if you fall off the trie or run out of letters first, keep the word."
    ],
    "solution": "function replaceWords(dictionary, sentence) {\n  const trie = {};\n  for (const root of dictionary) {\n    let node = trie;\n    for (const ch of root) {\n      if (!node[ch]) node[ch] = {};\n      node = node[ch];\n    }\n    node.end = true;\n  }\n  const shortestRoot = (word) => {\n    let node = trie;\n    for (let i = 0; i < word.length; i++) {\n      node = node[word[i]];\n      if (!node) return word;\n      if (node.end) return word.slice(0, i + 1);\n    }\n    return word;\n  };\n  return sentence.split(\" \").map(shortestRoot).join(\" \");\n}\n",
    "tests": [
      {
        "name": "the standard example",
        "body": "assert.equal(replaceWords([\"cat\", \"bat\", \"rat\"], \"the cattle was rattled by the battery\"), \"the cat was rat by the bat\");"
      },
      {
        "name": "the shortest root wins",
        "body": "assert.equal(replaceWords([\"a\", \"b\", \"c\"], \"aadsfasf absbs bbab cadsfafs\"), \"a a b c\");\nassert.equal(replaceWords([\"ab\", \"a\"], \"abc\"), \"a\");"
      },
      {
        "name": "no root matches",
        "body": "assert.equal(replaceWords([\"xyz\"], \"hello world\"), \"hello world\");"
      },
      {
        "name": "a word shorter than every root is kept",
        "body": "assert.equal(replaceWords([\"catt\"], \"cat catt cattle\"), \"cat catt catt\");"
      },
      {
        "name": "a word equal to a root",
        "body": "assert.equal(replaceWords([\"go\"], \"go going gone\"), \"go go go\");"
      },
      {
        "name": "a single word",
        "body": "assert.equal(replaceWords([\"ab\"], \"abcd\"), \"ab\");\nassert.equal(replaceWords([\"ab\"], \"a\"), \"a\");"
      },
      {
        "name": "an empty dictionary",
        "body": "assert.equal(replaceWords([], \"nothing changes here\"), \"nothing changes here\");"
      },
      {
        "name": "many roots on a longer sentence",
        "body": "let seed = 20260103;\nconst rand = (n) => { seed = (seed * 16807) % 2147483647; return seed % n; };\nconst roots = Array.from({ length: 30 }, () => Array.from({ length: 1 + rand(3) }, () => \"abc\"[rand(3)]).join(\"\"));\nconst words = Array.from({ length: 80 }, () => Array.from({ length: 1 + rand(7) }, () => \"abc\"[rand(3)]).join(\"\"));\nconst expected = words.map((w) => {\n  let best = w;\n  for (const root of roots) if (w.startsWith(root) && root.length < best.length) best = root;\n  return best;\n}).join(\" \");\nassert.equal(replaceWords(roots, words.join(\" \")), expected);"
      }
    ]
  },
  {
    "id": "ex-longest-word-in-dictionary",
    "chapter": "dsa-tries",
    "level": "intermediate",
    "title": "Longest Word in Dictionary",
    "brief": "<p>Given an array of strings <code>words</code>, return the <b>longest word that can be built one letter at a time</b>, where every prefix of the word (including the word's first letter on its own) is also in <code>words</code>. If several words have the same length, return the lexicographically smallest. If there is no such word, return <code>\"\"</code>.</p><ul><li><code>longestWord([\"w\", \"wo\", \"wor\", \"worl\", \"world\"])</code> is <code>\"world\"</code></li><li><code>longestWord([\"a\", \"banana\", \"app\", \"appl\", \"ap\", \"apply\", \"apple\"])</code> is <code>\"apple\"</code>, tied with <code>\"apply\"</code> and smaller</li><li>Duplicates may appear in the input</li></ul>",
    "starter": "function longestWord(words) {\n  // TODO: a trie where you only walk through nodes that end a word\n}\n",
    "hints": [
      "A word qualifies when every prefix of it is a word. In a trie, that is when every node on its path is marked as a word end.",
      "Insert all the words, then DFS from the root, only stepping into children that are word ends.",
      "Visit children in alphabetical order and replace the best answer only when the new path is strictly longer; then the first path found at each length is the lexicographically smallest."
    ],
    "solution": "function longestWord(words) {\n  const root = { end: true, kids: new Map() };\n  for (const word of words) {\n    let node = root;\n    for (const ch of word) {\n      if (!node.kids.has(ch)) node.kids.set(ch, { end: false, kids: new Map() });\n      node = node.kids.get(ch);\n    }\n    node.end = true;\n  }\n  let best = \"\";\n  const dfs = (node, path) => {\n    if (path.length > best.length) best = path;\n    for (const ch of [...node.kids.keys()].sort()) {\n      const child = node.kids.get(ch);\n      if (child.end) dfs(child, path + ch);\n    }\n  };\n  dfs(root, \"\");\n  return best;\n}\n",
    "tests": [
      {
        "name": "a chain of prefixes",
        "body": "assert.equal(longestWord([\"w\", \"wo\", \"wor\", \"worl\", \"world\"]), \"world\");"
      },
      {
        "name": "ties go to the smaller word",
        "body": "assert.equal(longestWord([\"a\", \"banana\", \"app\", \"appl\", \"ap\", \"apply\", \"apple\"]), \"apple\");"
      },
      {
        "name": "a word with a missing prefix is rejected",
        "body": "assert.equal(longestWord([\"w\", \"wo\", \"worl\", \"world\"]), \"wo\");"
      },
      {
        "name": "no one-letter word means nothing can be built",
        "body": "assert.equal(longestWord([\"ab\", \"abc\"]), \"\");\nassert.equal(longestWord([]), \"\");"
      },
      {
        "name": "single letters only",
        "body": "assert.equal(longestWord([\"b\", \"a\", \"c\"]), \"a\");"
      },
      {
        "name": "duplicates in the input",
        "body": "assert.equal(longestWord([\"a\", \"a\", \"ab\", \"ab\", \"abc\"]), \"abc\");"
      },
      {
        "name": "the order of the input does not matter",
        "body": "assert.equal(longestWord([\"yo\", \"ew\", \"fc\", \"zrc\", \"yodn\", \"fcm\", \"qm\", \"qmo\", \"fcmz\", \"z\", \"ewq\", \"yod\", \"ewqz\", \"y\"]), \"yodn\");"
      },
      {
        "name": "matches a set-based check on pseudo-random words",
        "body": "let seed = 20260103;\nconst rand = (n) => { seed = (seed * 16807) % 2147483647; return seed % n; };\nconst words = Array.from({ length: 120 }, () => Array.from({ length: 1 + rand(5) }, () => \"ab\"[rand(2)]).join(\"\"));\nconst set = new Set(words);\nlet expected = \"\";\nfor (const w of [...set].sort()) {\n  let ok = true;\n  for (let i = 1; i < w.length; i++) if (!set.has(w.slice(0, i))) ok = false;\n  if (ok && w.length > expected.length) expected = w;\n}\nassert.equal(longestWord(words), expected);"
      }
    ]
  },
  {
    "id": "ex-map-sum-pairs",
    "chapter": "dsa-tries",
    "level": "intermediate",
    "title": "Map Sum Pairs",
    "brief": "<p>Implement a class <code>MapSum</code>:</p><ul><li><code>insert(key, val)</code> stores the pair. If <code>key</code> already exists, its value is <b>replaced</b> by <code>val</code></li><li><code>sum(prefix)</code> returns the sum of the values of all keys that start with <code>prefix</code>; an unknown prefix gives <code>0</code></li><li>Keys are lowercase strings. Both operations should cost time proportional to the length of the key or prefix, not to the number of keys</li></ul>",
    "starter": "class MapSum {\n  constructor() {\n    // TODO: a trie whose nodes remember the total value below them\n  }\n\n  insert(key, val) {\n    // TODO: add the change in value along the whole path of key\n  }\n\n  sum(prefix) {\n    // TODO: walk to the prefix node and return its total\n  }\n}\n",
    "hints": [
      "Store on every trie node the total of the values of all keys that pass through it. Then sum(prefix) is the number on the prefix node.",
      "A replaced key must not be added twice. Keep a Map from key to its current value and compute delta = val - oldValue.",
      "insert adds delta to every node on the key's path, so a new key (old value 0) adds val and a replaced key adds only the difference."
    ],
    "solution": "class MapSum {\n  constructor() {\n    this.root = { sum: 0, children: new Map() };\n    this.values = new Map();\n  }\n\n  insert(key, val) {\n    const delta = val - (this.values.get(key) ?? 0);\n    this.values.set(key, val);\n    let node = this.root;\n    node.sum += delta;\n    for (const ch of key) {\n      if (!node.children.has(ch)) node.children.set(ch, { sum: 0, children: new Map() });\n      node = node.children.get(ch);\n      node.sum += delta;\n    }\n  }\n\n  sum(prefix) {\n    let node = this.root;\n    for (const ch of prefix) {\n      node = node.children.get(ch);\n      if (!node) return 0;\n    }\n    return node.sum;\n  }\n}\n",
    "tests": [
      {
        "name": "the standard example",
        "body": "const m = new MapSum();\nm.insert('apple', 3);\nassert.equal(m.sum('ap'), 3);\nm.insert('app', 2);\nassert.equal(m.sum('ap'), 5);"
      },
      {
        "name": "replacing a key",
        "body": "const m = new MapSum();\nm.insert('apple', 3);\nm.insert('app', 2);\nm.insert('apple', 5);\nassert.equal(m.sum('ap'), 7);\nassert.equal(m.sum('apple'), 5);"
      },
      {
        "name": "an unknown prefix",
        "body": "const m = new MapSum();\nm.insert('cat', 4);\nassert.equal(m.sum('dog'), 0);\nassert.equal(m.sum('cats'), 0);"
      },
      {
        "name": "a prefix equal to a whole key",
        "body": "const m = new MapSum();\nm.insert('car', 6);\nm.insert('card', 1);\nassert.equal(m.sum('car'), 7);\nassert.equal(m.sum('card'), 1);"
      },
      {
        "name": "the empty prefix sums everything",
        "body": "const m = new MapSum();\nm.insert('a', 1);\nm.insert('b', 2);\nm.insert('a', 10);\nassert.equal(m.sum(''), 12);"
      },
      {
        "name": "replacing with a smaller or negative value",
        "body": "const m = new MapSum();\nm.insert('key', 10);\nm.insert('key', 4);\nassert.equal(m.sum('k'), 4);\nm.insert('key', -3);\nassert.equal(m.sum('ke'), -3);"
      },
      {
        "name": "a new instance starts empty",
        "body": "const a = new MapSum();\nconst b = new MapSum();\na.insert('x', 5);\nassert.equal(b.sum('x'), 0);"
      },
      {
        "name": "matches a scan over all keys on pseudo-random operations",
        "body": "let seed = 20260103;\nconst rand = (n) => { seed = (seed * 16807) % 2147483647; return seed % n; };\nconst m = new MapSum();\nconst truth = new Map();\nfor (let i = 0; i < 400; i++) {\n  const key = Array.from({ length: 1 + rand(4) }, () => 'abc'[rand(3)]).join('');\n  const val = rand(21) - 10;\n  m.insert(key, val);\n  truth.set(key, val);\n  const prefix = Array.from({ length: rand(3) }, () => 'abc'[rand(3)]).join('');\n  let expected = 0;\n  for (const [k, v] of truth) if (k.startsWith(prefix)) expected += v;\n  assert.equal(m.sum(prefix), expected);\n}"
      }
    ]
  },
  {
    "id": "ex-stream-of-characters",
    "chapter": "dsa-tries",
    "level": "advanced",
    "title": "Stream of Characters",
    "brief": "<p>Implement a class <code>StreamChecker</code> that receives a list of <code>words</code> in its constructor and then a stream of letters:</p><ul><li><code>query(letter)</code> accepts the next letter of the stream and returns <code>true</code> if <b>some suffix</b> of the letters received so far (the last 1, 2, 3, ... letters, ending with this one) is one of the words, otherwise <code>false</code></li><li>With <code>words = [\"cd\", \"f\", \"kl\"]</code>, the stream <code>a b c d e f g h i j k l</code> gives <code>true</code> exactly at <code>d</code>, <code>f</code> and <code>l</code></li><li>Each query must cost time proportional to the length of the longest word, not to the number of letters received</li></ul>",
    "starter": "class StreamChecker {\n  constructor(words) {\n    // TODO: a trie of the reversed words, and a buffer of recent letters\n  }\n\n  query(letter) {\n    // TODO: walk the buffer from the newest letter backwards\n  }\n}\n",
    "hints": [
      "A normal trie matches from the start of a word. Here the end of the match is fixed (the newest letter) and the start is unknown.",
      "Insert every word reversed. Then matching a suffix of the stream means walking the stream backwards from the newest letter.",
      "Keep only the last maxLength letters, since no word is longer. During the backward walk, return true the first time you reach a node marked as a word end, and false if the walk falls off the trie."
    ],
    "solution": "class StreamChecker {\n  constructor(words) {\n    this.root = { children: new Map(), isEnd: false };\n    this.maxLength = 0;\n    for (const word of words) {\n      let node = this.root;\n      for (let i = word.length - 1; i >= 0; i--) {\n        if (!node.children.has(word[i])) node.children.set(word[i], { children: new Map(), isEnd: false });\n        node = node.children.get(word[i]);\n      }\n      node.isEnd = true;\n      this.maxLength = Math.max(this.maxLength, word.length);\n    }\n    this.recent = [];\n  }\n\n  query(letter) {\n    this.recent.push(letter);\n    if (this.recent.length > this.maxLength) this.recent.shift();\n    let node = this.root;\n    for (let i = this.recent.length - 1; i >= 0; i--) {\n      node = node.children.get(this.recent[i]);\n      if (!node) return false;\n      if (node.isEnd) return true;\n    }\n    return false;\n  }\n}\n",
    "tests": [
      {
        "name": "the standard example",
        "body": "const s = new StreamChecker(['cd', 'f', 'kl']);\nconst out = 'abcdefghijkl'.split('').map((ch) => s.query(ch));\nassert.deepEqual(out, [false, false, false, true, false, true, false, false, false, false, false, true]);"
      },
      {
        "name": "a one-letter word matches at once",
        "body": "const s = new StreamChecker(['a']);\nassert.equal(s.query('b'), false);\nassert.equal(s.query('a'), true);"
      },
      {
        "name": "a word that is a suffix of another word",
        "body": "const s = new StreamChecker(['abc', 'bc']);\nassert.equal(s.query('x'), false);\nassert.equal(s.query('b'), false);\nassert.equal(s.query('c'), true);"
      },
      {
        "name": "the match must end at the newest letter",
        "body": "const s = new StreamChecker(['ab']);\nassert.equal(s.query('a'), false);\nassert.equal(s.query('b'), true);\nassert.equal(s.query('c'), false);"
      },
      {
        "name": "repeated letters",
        "body": "const s = new StreamChecker(['aa']);\nassert.equal(s.query('a'), false);\nassert.equal(s.query('a'), true);\nassert.equal(s.query('a'), true);"
      },
      {
        "name": "a failed partial match does not hide a later one",
        "body": "const s = new StreamChecker(['abc']);\nconst out = 'ababc'.split('').map((ch) => s.query(ch));\nassert.deepEqual(out, [false, false, false, false, true]);"
      },
      {
        "name": "two instances are independent",
        "body": "const a = new StreamChecker(['x']);\nconst b = new StreamChecker(['y']);\nassert.equal(a.query('y'), false);\nassert.equal(b.query('y'), true);"
      },
      {
        "name": "matches endsWith on a pseudo-random stream",
        "body": "let seed = 20260103;\nconst rand = (n) => { seed = (seed * 16807) % 2147483647; return seed % n; };\nconst words = Array.from({ length: 8 }, () => Array.from({ length: 1 + rand(4) }, () => 'ab'[rand(2)]).join(''));\nconst s = new StreamChecker(words);\nlet stream = '';\nfor (let i = 0; i < 300; i++) {\n  const ch = 'ab'[rand(2)];\n  stream += ch;\n  assert.equal(s.query(ch), words.some((w) => stream.endsWith(w)));\n}"
      }
    ]
  },
  {
    "id": "ex-trie-remove-word",
    "chapter": "dsa-tries",
    "level": "advanced",
    "title": "Trie With Remove",
    "brief": "<p>Implement a <code>Trie</code> class with four operations plus a way to inspect its size:</p><ul><li><code>insert(word)</code>, <code>search(word)</code> (exact word) and <code>startsWith(prefix)</code> work as usual</li><li><code>remove(word)</code> deletes a stored word and returns <code>true</code>; it returns <code>false</code> if the word is not stored (a word that exists only as a prefix of other words is not stored)</li><li>Removing a word must not break other words that share its prefix, and must <b>delete the nodes that only that word needed</b>, so that <code>startsWith</code> stops matching its private prefixes</li><li><code>nodeCount()</code> returns the number of nodes below the root; it exists so that pruning can be checked</li></ul>",
    "starter": "class Trie {\n  constructor() {\n    // TODO\n  }\n\n  insert(word) {\n    // TODO\n  }\n\n  search(word) {\n    // TODO\n  }\n\n  startsWith(prefix) {\n    // TODO\n  }\n\n  remove(word) {\n    // TODO: clear the end flag, then unlink nodes that have no children and are not word ends\n  }\n\n  nodeCount() {\n    // TODO: count the nodes below the root\n  }\n}\n",
    "hints": [
      "Removing has two parts: the word must stop being a word (clear the end flag on its last node), and nodes nobody else needs must disappear.",
      "Walk down the word and remember the path of (parent, character) pairs. If a character is missing, or the last node is not a word end, return false.",
      "Go back up the path from the deepest node: delete the child if it is not a word end and has no children, and stop at the first node that is still needed."
    ],
    "solution": "class Trie {\n  constructor() {\n    this.root = { children: new Map(), isEnd: false };\n  }\n\n  insert(word) {\n    let node = this.root;\n    for (const ch of word) {\n      if (!node.children.has(ch)) node.children.set(ch, { children: new Map(), isEnd: false });\n      node = node.children.get(ch);\n    }\n    node.isEnd = true;\n  }\n\n  walk(str) {\n    let node = this.root;\n    for (const ch of str) {\n      node = node.children.get(ch);\n      if (!node) return null;\n    }\n    return node;\n  }\n\n  search(word) {\n    const node = this.walk(word);\n    return node !== null && node.isEnd;\n  }\n\n  startsWith(prefix) {\n    return this.walk(prefix) !== null;\n  }\n\n  remove(word) {\n    const path = [];\n    let node = this.root;\n    for (const ch of word) {\n      const next = node.children.get(ch);\n      if (!next) return false;\n      path.push([node, ch]);\n      node = next;\n    }\n    if (!node.isEnd) return false;\n    node.isEnd = false;\n    for (let i = path.length - 1; i >= 0; i--) {\n      const [parent, ch] = path[i];\n      const child = parent.children.get(ch);\n      if (child.isEnd || child.children.size > 0) break;\n      parent.children.delete(ch);\n    }\n    return true;\n  }\n\n  nodeCount() {\n    const count = (node) => {\n      let total = 0;\n      for (const child of node.children.values()) total += 1 + count(child);\n      return total;\n    };\n    return count(this.root);\n  }\n}\n",
    "tests": [
      {
        "name": "remove a word that is a leaf path",
        "body": "const t = new Trie();\nt.insert('dog');\nassert.equal(t.remove('dog'), true);\nassert.equal(t.search('dog'), false);\nassert.equal(t.startsWith('d'), false);\nassert.equal(t.nodeCount(), 0);"
      },
      {
        "name": "removing a longer word keeps its prefix word",
        "body": "const t = new Trie();\nt.insert('do');\nt.insert('dog');\nassert.equal(t.remove('dog'), true);\nassert.equal(t.search('do'), true);\nassert.equal(t.startsWith('dog'), false);\nassert.equal(t.nodeCount(), 2);"
      },
      {
        "name": "removing a prefix word keeps the longer word",
        "body": "const t = new Trie();\nt.insert('do');\nt.insert('dog');\nassert.equal(t.remove('do'), true);\nassert.equal(t.search('do'), false);\nassert.equal(t.search('dog'), true);\nassert.equal(t.startsWith('do'), true);\nassert.equal(t.nodeCount(), 3);"
      },
      {
        "name": "a word that is only a prefix is not stored",
        "body": "const t = new Trie();\nt.insert('dog');\nassert.equal(t.remove('do'), false);\nassert.equal(t.search('dog'), true);\nassert.equal(t.nodeCount(), 3);"
      },
      {
        "name": "a word that was never inserted",
        "body": "const t = new Trie();\nt.insert('cat');\nassert.equal(t.remove('car'), false);\nassert.equal(t.remove('catalog'), false);\nassert.equal(t.search('cat'), true);"
      },
      {
        "name": "removing twice",
        "body": "const t = new Trie();\nt.insert('a');\nassert.equal(t.remove('a'), true);\nassert.equal(t.remove('a'), false);"
      },
      {
        "name": "shared prefixes are kept for the other branch",
        "body": "const t = new Trie();\nt.insert('car');\nt.insert('cat');\nassert.equal(t.nodeCount(), 4);\nassert.equal(t.remove('car'), true);\nassert.equal(t.nodeCount(), 3);\nassert.equal(t.search('cat'), true);\nassert.equal(t.startsWith('car'), false);"
      },
      {
        "name": "insert after remove works again",
        "body": "const t = new Trie();\nt.insert('go');\nt.remove('go');\nt.insert('go');\nassert.equal(t.search('go'), true);\nassert.equal(t.nodeCount(), 2);"
      },
      {
        "name": "matches a fresh trie after pseudo-random removals",
        "body": "let seed = 20260103;\nconst rand = (n) => { seed = (seed * 16807) % 2147483647; return seed % n; };\nconst words = Array.from({ length: 40 }, () => Array.from({ length: 1 + rand(4) }, () => 'abc'[rand(3)]).join(''));\nconst t = new Trie();\nconst alive = new Set();\nfor (const w of words) { t.insert(w); alive.add(w); }\nfor (let i = 0; i < 60; i++) {\n  const w = Array.from({ length: 1 + rand(4) }, () => 'abc'[rand(3)]).join('');\n  assert.equal(t.remove(w), alive.delete(w));\n}\nconst fresh = new Trie();\nfor (const w of alive) fresh.insert(w);\nassert.equal(t.nodeCount(), fresh.nodeCount());\nfor (const w of words) assert.equal(t.search(w), alive.has(w));"
      }
    ]
  }
];
