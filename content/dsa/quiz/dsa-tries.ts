import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "tr-prefix-question",
      chapter: "dsa-tries",
      level: "intermediate",
      skill: "recognise",
      pattern: "trie",
      section: "the-shape-the-word-is-the-path",
      placement: true,
      kind: "single",
      prompt:
        "<p>A dictionary of many thousands of words is stored both in a <code>Set</code> and in a trie. Which question can the trie answer by walking only the characters of the query, while the <code>Set</code> would have to look through the words one by one?</p>",
      choices: [
        {
          id: "a",
          text: "Is this exact word in the dictionary?",
          why: "<code>set.has(word)</code> hashes the string, which costs O(L) on average for a word of length L, and does not scan the dictionary. Exact membership is where a <code>Set</code> is already good.",
        },
        {
          id: "b",
          text: "Does any word in the dictionary start with these letters?",
          why: "In the trie, a prefix is a path from the root. If the walk reaches a node, some stored word runs through it, and the cost depends on the prefix length only. A <code>Set</code> holds whole words, so it has no way to ask about their beginnings except by checking each one.",
        },
        {
          id: "c",
          text: "How many words does the dictionary hold?",
          why: "A <code>Set</code> reports <code>set.size</code> directly, and a trie can keep a counter. Neither needs a walk through the words.",
        },
        {
          id: "d",
          text: "Does the dictionary contain the same word twice?",
          why: "A <code>Set</code> cannot hold the same string twice, and inserting a word into a trie a second time ends on the same node. The chapter's trie keeps no count either, so neither structure has anything to report.",
        },
      ],
      answer: "b",
    },
    {
      id: "tr-grid-many-words",
      chapter: "dsa-tries",
      level: "intermediate",
      skill: "recognise",
      pattern: "trie",
      section: "word-search-ii-the-trie-prunes-the-backtracking",
      placement: true,
      kind: "single",
      prompt:
        "<p>You are given a grid of letters and a list of W words. Report every word that can be spelled by a path of adjacent cells that uses no cell twice. Which plan prunes the search the most?</p>",
      choices: [
        {
          id: "a",
          text: "Run a single-word backtracking search from every cell, once for each of the W words.",
          why: "It finds the right words, but the grid is explored again for every word, and words that share a beginning repeat that work. This is what the trie is meant to replace.",
        },
        {
          id: "b",
          text: "Put the words in a <code>Set</code> and test the string spelled so far at every step of one grid search.",
          why: 'A <code>Set</code> only says whether the whole string is a word. A string such as <code>"oa"</code> is not in it, yet it may be the start of <code>"oath"</code>, so the search cannot tell when a path is hopeless.',
        },
        {
          id: "c",
          text: "Build one trie of the words, search the grid once, and carry a trie node along with the position.",
          why: "The trie node says which words the path so far can still become. When the next letter has no child, no word continues and the branch stops. Words with a common beginning are explored together, not once per word.",
        },
        {
          id: "d",
          text: "Sort the letters of the grid, then binary search for each word.",
          why: "A word is a path of adjacent cells, so adjacency is the whole problem. Sorting the letters throws that information away.",
        },
      ],
      answer: "c",
    },
    {
      id: "tr-maximum-xor-plan",
      chapter: "dsa-tries",
      level: "intermediate",
      skill: "recognise",
      pattern: "trie",
      section: "advanced-aside-the-binary-trie-for-maximum-xor",
      kind: "single",
      prompt:
        "<p>Given an array of n non-negative integers below 2<sup>31</sup>, find the largest value of <code>a ^ b</code> over all pairs. Which plan beats the O(n²) double loop?</p>",
      choices: [
        {
          id: "a",
          text: "Insert every number into a bit trie, high bit first, then steer each number toward the opposite bit wherever it exists.",
          why: "XOR gives a 1 where the bits differ, and a high bit is worth more than all lower bits together. Steering to the opposite bit at each level, from the top, builds the best partner for that number. Each number costs one step per bit, a fixed amount.",
        },
        {
          id: "b",
          text: "Sort the array, then move two pointers inward from both ends, as in a pair-sum problem, keeping the best XOR.",
          why: "Pair-sum works because the sum rises and falls in step with the pointers. XOR does not move in step with sorted order, so moving a pointer does not tell you whether the XOR grows or shrinks.",
        },
        {
          id: "c",
          text: "Sort the array, then compare each number only with the neighbour next to it and keep the largest XOR.",
          why: "The best pair is not always adjacent. For <code>[2, 4, 5]</code> the neighbouring pairs give 6 and 1, but 2 ^ 5 is 7.",
        },
        {
          id: "d",
          text: "Store the numbers in a <code>Map</code> and, for each one, look up the partner that completes a target value.",
          why: "The task has no target value to complete. It asks for the pair with the largest XOR, which depends on all pairs.",
        },
      ],
      answer: "a",
    },
    {
      id: "tr-set-is-enough",
      chapter: "dsa-tries",
      level: "intermediate",
      skill: "recognise",
      pattern: "trie",
      section: "recognizing-it-in-an-unseen-problem",
      kind: "single",
      prompt: "<p>Which task is better served by a plain <code>Set</code> than by a trie?</p>",
      choices: [
        {
          id: "a",
          text: "Suggesting completions as the user types a search query.",
          why: "Completions are all the words below a prefix, and a trie reaches them by walking to the prefix node. A <code>Set</code> would need a scan of every stored word.",
        },
        {
          id: "b",
          text: "Telling whether the string built so far in a depth-first search could still become one of the target words.",
          why: "This asks for a prefix check after every added character. The trie answers it as the search moves from one node to the next.",
        },
        {
          id: "c",
          text: "Finding every dictionary word that can be spelled along a path in a letter grid.",
          why: "This is the Word Search II setting, where a trie cuts every path that no word can continue.",
        },
        {
          id: "d",
          text: "Checking, for a million incoming strings, whether each is exactly one of 5,000 banned words.",
          why: "Only exact membership is asked and no prefix ever is. <code>set.has</code> answers it in O(L) on average, and a <code>Set</code> is the simpler structure to write and keep.",
        },
      ],
      answer: "d",
    },
    {
      id: "tr-node-bound",
      chapter: "dsa-tries",
      level: "intermediate",
      skill: "complexity",
      pattern: "trie",
      section: "cost-pay-for-the-word-length-not-the-dictionary-size",
      kind: "single",
      prompt:
        "<p>A trie with <code>Map</code> children stores N words, and T is the total number of characters across all of them. Which statement about its worst-case space, counting nodes besides the root, is true?</p>",
      choices: [
        {
          id: "a",
          text: "Exactly T nodes, because every character of every word needs a node of its own.",
          why: 'Words that share a beginning share nodes. Inserting <code>"car"</code> and <code>"cat"</code> makes four nodes, not six.',
        },
        {
          id: "b",
          text: "About 26 · N nodes, because every node reserves a slot for each letter.",
          why: "Reserving 26 slots is the fixed-array layout. A <code>Map</code> holds only the children that exist, and the node count depends on the characters stored, not on N.",
        },
        {
          id: "c",
          text: "At most T nodes, because each inserted character adds at most one new node.",
          why: "Inserting a character either follows an existing child or creates one new node. So T characters can create at most T nodes, which is reached when no two words share a first letter. Shared prefixes bring the count below T.",
        },
        {
          id: "d",
          text: "O(N) nodes, because every word ends at exactly one node.",
          why: "A word ends at one node, but the path to it has one node per character. A single word of 1,000 letters, with N = 1, makes 1,000 nodes.",
        },
      ],
      answer: "c",
    },
    {
      id: "tr-wildcard-cost",
      chapter: "dsa-tries",
      level: "intermediate",
      skill: "complexity",
      pattern: "trie",
      section: "wildcard-search-the-matches-any-character",
      kind: "single",
      prompt:
        '<p>A trie holds M nodes besides the root, and every stored word is shorter than L characters. <code>searchPattern</code> is called with a query of L dots, so the call returns <code>false</code>. Which bound is the tightest one that holds for every such trie?</p><pre><code>function searchPattern(node, word, i = 0) {\n  if (i === word.length) return node.isEnd;\n\n  const ch = word[i];\n  if (ch !== ".") {\n    const next = node.children.get(ch);\n    return next ? searchPattern(next, word, i + 1) : false;\n  }\n\n  for (const child of node.children.values()) {\n    if (searchPattern(child, word, i + 1)) return true;\n  }\n  return false;\n}</code></pre>',
      choices: [
        {
          id: "a",
          text: "O(L)",
          why: "That is the cost of a query with no dots, where each letter follows one child. A dot branches into every child, so the walk can reach many nodes.",
        },
        {
          id: "b",
          text: "O(M)",
          why: "A dot enters every child, and every node here lies above depth L. Each node is reached from its single parent, so it is entered exactly once. The call does a constant amount of work per node, so the time is proportional to M for every such trie, and no smaller bound is correct.",
        },
        {
          id: "c",
          text: "O(26<sup>L</sup>)",
          why: "That counts paths a trie may not have. The branching is the number of children that exist, and the whole trie only has M nodes, so M is tighter. A trie with a handful of nodes would be far below 26<sup>L</sup>.",
        },
        {
          id: "d",
          text: "O(L · M)",
          why: "This would visit every node once for each position in the query. Each node is entered once, because it has one parent and a single path leads to it, so L · M overstates the work.",
        },
      ],
      answer: "b",
    },
    {
      id: "tr-trace-insert",
      chapter: "dsa-tries",
      level: "intermediate",
      skill: "trace",
      pattern: "trie",
      section: "the-structure-from-scratch",
      kind: "single",
      prompt:
        '<p>These words are inserted, in order, into an empty trie built with the chapter\'s <code>Trie</code> class: <code>"tea"</code>, <code>"ten"</code>, <code>"to"</code>, <code>"tea"</code>, <code>"ted"</code>. How many nodes exist besides the root, and how many of them have <code>isEnd</code> set to true?</p>',
      choices: [
        {
          id: "a",
          text: "6 nodes, 4 with <code>isEnd</code>",
          why: 'The nodes are t, te, tea, ten, to and ted. The second <code>"tea"</code> follows existing nodes and creates none. Four of the six end a word: tea, ten, to and ted.',
        },
        {
          id: "b",
          text: "6 nodes, 5 with <code>isEnd</code>",
          why: 'Five <code>insert</code> calls are made, but the repeated <code>"tea"</code> marks the same node twice, so only four nodes end a word.',
        },
        {
          id: "c",
          text: "5 nodes, 4 with <code>isEnd</code>",
          why: 'This misses a node. <code>"ted"</code> shares t and e with <code>"tea"</code> but needs its own node for d.',
        },
        {
          id: "d",
          text: "14 nodes, 5 with <code>isEnd</code>",
          why: "14 is the number of characters typed in, which would be the node count only if no two words shared a beginning. All five words start with t, so they share nodes.",
        },
      ],
      answer: "a",
    },
    {
      id: "tr-trace-calls",
      chapter: "dsa-tries",
      level: "intermediate",
      skill: "trace",
      pattern: "trie",
      section: "the-structure-from-scratch",
      kind: "multi",
      prompt:
        '<p>A trie built with the chapter\'s <code>Trie</code> class holds exactly the words <code>"bat"</code>, <code>"ball"</code> and <code>"be"</code>. Select every call that returns <code>true</code>.</p>',
      choices: [
        {
          id: "a",
          text: '<code>search("ba")</code>',
          why: 'The walk reaches the node for <code>"ba"</code>, but no word ends there, so <code>isEnd</code> is false and <code>search</code> returns false.',
        },
        {
          id: "b",
          text: '<code>startsWith("ba")</code>',
          why: '<code>startsWith</code> only needs the walk to succeed, and <code>"bat"</code> and <code>"ball"</code> both pass through the node for <code>"ba"</code>.',
        },
        {
          id: "c",
          text: '<code>search("be")</code>',
          why: '<code>"be"</code> was inserted, so the walk reaches a node whose <code>isEnd</code> is true.',
        },
        {
          id: "d",
          text: '<code>startsWith("bee")</code>',
          why: 'The node for <code>"be"</code> has no child for <code>"e"</code>, so the walk returns null and <code>startsWith</code> is false.',
        },
        {
          id: "e",
          text: '<code>search("bat")</code>',
          why: '<code>"bat"</code> was inserted, so its last node has <code>isEnd</code> set to true.',
        },
      ],
      answers: ["b", "c", "e"],
    },
    {
      id: "tr-leaf-is-not-word",
      chapter: "dsa-tries",
      level: "intermediate",
      skill: "edge-case",
      pattern: "trie",
      section: "the-structure-from-scratch",
      kind: "single",
      prompt:
        '<p>A trie holds exactly the words <code>"do"</code> and <code>"dog"</code>. A teammate writes <code>search</code> so that, after walking the word, it returns <code>node !== null &amp;&amp; node.children.size === 0</code> instead of checking <code>isEnd</code>. Which call now returns a wrong answer?</p>',
      choices: [
        {
          id: "a",
          text: '<code>search("dog")</code>',
          why: 'The node for <code>"dog"</code> has no children, so the test returns true, which is right here. A leaf test only works for words that nothing else extends.',
        },
        {
          id: "b",
          text: '<code>search("d")</code>',
          why: 'The node for <code>"d"</code> has a child, so the test returns false. That is right, since <code>"d"</code> was never inserted.',
        },
        {
          id: "c",
          text: '<code>search("dot")</code>',
          why: 'There is no child for <code>"t"</code> under <code>"do"</code>, so the walk returns null and the result is false, which is right.',
        },
        {
          id: "d",
          text: '<code>search("do")</code>',
          why: '<code>"do"</code> is stored, but its node still has the child for <code>"g"</code>, so the leaf test returns false. Having children says nothing about whether a word ends there, and that is why <code>isEnd</code> is its own flag.',
        },
      ],
      answer: "d",
    },
    {
      id: "tr-null-instead-of-delete",
      chapter: "dsa-tries",
      level: "intermediate",
      skill: "edge-case",
      pattern: "trie",
      section: "word-search-ii-the-trie-prunes-the-backtracking",
      kind: "single",
      prompt:
        "<p>In the chapter's <code>findWords</code>, the line <code>delete next.word</code> is changed to <code>next.word = null</code> and nothing else changes. What is the effect?</p>",
      choices: [
        {
          id: "a",
          text: "The same words are found, but no node is ever pruned, so dead branches are walked again and again.",
          why: "The pruning test is <code>Object.keys(next).length === 0</code>. A key holding null still counts, so a node that ended a word never looks empty. Every leaf ended a word, so no node is ever pruned. The results do not change, only the running time.",
        },
        {
          id: "b",
          text: "A word that can be spelled from several start cells is reported again for each start cell.",
          why: "The test <code>if (next.word)</code> is false for null, so the word is not pushed a second time. De-duplicating still works.",
        },
        {
          id: "c",
          text: "Some words are missed, because the null marker makes the path look like a dead end.",
          why: "A dead end is found by <code>if (!next) return</code>, which looks at the node. The node still exists, so the search goes on through it.",
        },
        {
          id: "d",
          text: "A <code>TypeError</code> is thrown the next time that node is visited.",
          why: "The code only reads <code>next.word</code> and the keys of <code>next</code>. Reading a property that holds null is fine, so nothing throws.",
        },
      ],
      answer: "a",
    },
    {
      id: "tr-order-insert",
      chapter: "dsa-tries",
      level: "intermediate",
      skill: "trace",
      pattern: "trie",
      section: "the-structure-from-scratch",
      kind: "order",
      prompt:
        '<p>The trie already holds <code>"do"</code>. Put the steps of <code>insert("dog")</code> in order. Start with the walk beginning at the root and end with marking the last node.</p>',
      items: [
        { id: "root", text: "Start at the root." },
        { id: "d", text: 'Follow the existing child for <code>"d"</code>.' },
        { id: "o", text: 'Follow the existing child for <code>"o"</code>.' },
        { id: "g", text: 'Find no child for <code>"g"</code>, so create one and move onto it.' },
        { id: "end", text: "Set <code>isEnd = true</code> on the node you are now on." },
      ],
      why: 'The word is spelled by the path, so the steps follow the letters from the first to the last. The d and o nodes already exist because of <code>"do"</code>, so they are only followed. Only g is created. The flag is set last, once the walk has reached the node where the word ends. The o node keeps its own <code>isEnd</code> of true, which is how <code>"do"</code> stays a word.',
    },
    {
      id: "tr-array-uppercase",
      chapter: "dsa-tries",
      level: "intermediate",
      skill: "edge-case",
      pattern: "trie",
      section: "array-children-map-children-and-the-radix-trie",
      kind: "single",
      prompt:
        '<p>An array-based trie computes each child slot as <code>word.charCodeAt(i) - 97</code> and tests <code>children[slot] === null</code> to decide whether to create a node. What happens when the word <code>"A"</code> is inserted?</p>',
      choices: [
        {
          id: "a",
          text: "It is stored in slot 0, because uppercase and lowercase letters share one slot in the array.",
          why: "'A' has code 65, so the slot is 65 - 97, which is -32, not 0.",
        },
        {
          id: "b",
          text: "The slot is -32, which reads as <code>undefined</code>, so the null test fails and the walk uses a missing node.",
          why: "A negative index is not one of the 26 slots. The read gives <code>undefined</code>, which is not <code>null</code>, so no node is created, and setting <code>isEnd</code> on <code>undefined</code> throws a <code>TypeError</code>.",
        },
        {
          id: "c",
          text: "It wraps around to slot 25, like an index into a ring buffer of 26 slots.",
          why: "Arrays do not wrap negative indexes. A negative number is just an ordinary property name.",
        },
        {
          id: "d",
          text: "JavaScript throws a <code>RangeError</code> as soon as the slot is computed.",
          why: "Computing the number is harmless, and reading a missing property gives <code>undefined</code> rather than throwing.",
        },
      ],
      answer: "b",
    },
    {
      id: "tr-mapsum-trace",
      chapter: "dsa-tries",
      level: "intermediate",
      skill: "trace",
      pattern: "trie",
      section: "counting-inside-the-trie-prefix-counts-and-map-sum",
      kind: "single",
      prompt:
        '<p>A <code>MapSum</code> runs <code>insert("apple", 3)</code>, <code>insert("app", 2)</code> and then <code>insert("apple", 5)</code>, where the last call replaces the value of an existing key. What does <code>sum("ap")</code> return?</p>',
      choices: [
        {
          id: "a",
          text: "<code>10</code>",
          why: "That adds 3, 2 and 5 together, as if the replacement had added a new key instead of changing the old one.",
        },
        {
          id: "b",
          text: "<code>7</code>",
          why: "The replacement adds only the difference 5 - 3 = 2 on the path of the key. The total is then 5 for apple plus 2 for app.",
        },
        {
          id: "c",
          text: "<code>5</code>",
          why: "That is the value of apple alone. The key app also starts with ap and adds 2.",
        },
        {
          id: "d",
          text: "<code>8</code>",
          why: "That adds the first and last apple values and ignores app, and still counts a replaced value twice.",
        },
      ],
      answer: "b",
    },
    {
      id: "tr-remove-prefix-word",
      chapter: "dsa-tries",
      level: "intermediate",
      skill: "edge-case",
      pattern: "trie",
      section: "deleting-a-word-unlink-on-the-way-back-up",
      kind: "single",
      prompt:
        '<p>A trie holds the words <code>"do"</code> and <code>"dog"</code>. After <code>remove("do")</code>, which nodes may be unlinked?</p>',
      choices: [
        {
          id: "a",
          text: "None. Only the end flag of the node for <code>o</code> is cleared.",
          why: 'The node for <code>o</code> still has the child <code>g</code>, and <code>d</code> still has the child <code>o</code>, so both are needed by "dog".',
        },
        {
          id: "b",
          text: "The nodes for <code>d</code>, <code>o</code> and <code>g</code>.",
          why: 'Removing them would delete the word "dog" that the task did not ask to remove.',
        },
        {
          id: "c",
          text: "Only the node for <code>g</code>.",
          why: 'The node for <code>g</code> ends the word "dog", which is still stored, so it must stay.',
        },
        {
          id: "d",
          text: "Only the node for <code>o</code>, since it was the last letter of the removed word.",
          why: 'That node still has a child, so unlinking it would cut off "dog".',
        },
      ],
      answer: "a",
    },
    {
      id: "tr-stream-design",
      chapter: "dsa-tries",
      level: "intermediate",
      skill: "recognise",
      pattern: "trie",
      section: "stream-of-characters-a-trie-of-reversed-words",
      kind: "single",
      prompt:
        "<p>Letters arrive one at a time. After each letter you must say whether some suffix of the letters received so far is a dictionary word. Which design keeps each query independent of the stream length?</p>",
      choices: [
        {
          id: "a",
          text: "A trie of the words, with a new walk from the first letter of the stream on every query.",
          why: "That walk grows with the length of the stream, so the cost per query is not bounded by the word length.",
        },
        {
          id: "b",
          text: "A trie of the reversed words, walked backwards from the newest letter over the last <code>maxLength</code> letters.",
          why: "A match ends at the newest letter, so reading backwards from it matches the reversed words, and no word is longer than <code>maxLength</code>.",
        },
        {
          id: "c",
          text: "A <code>Set</code> of the words, testing every suffix of the stream received so far.",
          why: "Each test slices a string, and the number of suffixes grows with the stream.",
        },
        {
          id: "d",
          text: "A sorted array of the words, searched with binary search for the newest letter.",
          why: "A single letter says nothing about whole suffixes, so the search would not find words that end here.",
        },
      ],
      answer: "b",
    },
    {
      id: "tr-radix-size",
      chapter: "dsa-tries",
      level: "intermediate",
      skill: "complexity",
      pattern: "trie",
      section: "array-children-map-children-and-the-radix-trie",
      kind: "single",
      prompt:
        "<p>A radix (compressed) trie stores n distinct non-empty words with total length L. Which bound on its number of nodes depends only on n, so that it holds whatever the word lengths?</p>",
      choices: [
        {
          id: "a",
          text: "O(L), the same as a plain trie, which stores every character",
          why: "This bound depends on L, and a plain trie can need L nodes because each unshared character costs a node. Collapsing chains is the point of the radix trie.",
        },
        {
          id: "b",
          text: "O(n), because every non-root node ends a word or branches",
          why: "Each node other than the root either ends a word or has at least two children, which bounds the count by about 2n.",
        },
        {
          id: "c",
          text: "O(n · log L)",
          why: "No logarithm appears: the argument counts word ends and branching nodes only.",
        },
        {
          id: "d",
          text: "O(L²)",
          why: "Nodes are never created for pairs of positions in the words. The count cannot exceed the plain trie's O(L).",
        },
      ],
      answer: "b",
    },
  ],
  pattern: {
    pattern: "trie",
    chapter: "dsa-tries",
    signals: [
      "The prompt mentions prefix, starts with, autocomplete or a dictionary of words.",
      "A candidate string is built one character at a time, and the search should stop as soon as no target word can continue it.",
      "The brute force repeats a search or a scan once for each of W words, and one pass could carry all the words together.",
      "Pairs of integers are compared by XOR, which is a trie over their bits.",
    ],
    template:
      "<pre><code>for (const ch of word) { if (!node.children.has(ch)) node.children.set(ch, new TrieNode()); node = node.children.get(ch); } node.isEnd = true;</code></pre>",
    time: "O(L) per insert or lookup",
    space: "O(total characters)",
    styles: ["online-assessment", "phone-screen", "onsite"],
  },
};
