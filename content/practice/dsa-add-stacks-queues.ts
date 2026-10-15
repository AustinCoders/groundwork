import type { Exercise } from "../types";

export const dsaAddStacksQueues: Exercise[] = [
  {
    "id": "ex-simplify-path",
    "chapter": "dsa-stacks-queues",
    "level": "beginner",
    "title": "Simplify Path",
    "brief": "<p>Given an absolute Unix-style path, return its canonical form.</p><ul><li><code>.</code> means the current directory and is dropped</li><li><code>..</code> means the parent directory; at the root it does nothing</li><li>Repeated slashes count as one, and the result has no trailing slash (except the root itself, which is <code>\"/\"</code>)</li><li>Any other segment is a directory name, including <code>\"...\"</code> and names like <code>\"x.y\"</code></li><li>The path always starts with <code>/</code></li></ul>",
    "starter": "function simplifyPath(path) {\n  // TODO: split on '/' and keep a stack of directory names\n}\n",
    "hints": [
      "Split the path on '/'. Each piece is a name, '.', '..' or an empty string (from '//' or a trailing slash).",
      "Keep a stack of names. Skip '' and '.', pop on '..' (popping an empty stack is harmless), and push anything else.",
      "Join the stack with '/' and put a '/' in front. An empty stack gives just '/'."
    ],
    "solution": "function simplifyPath(path) {\n  const stack = [];\n  for (const part of path.split('/')) {\n    if (part === '' || part === '.') continue;\n    if (part === '..') stack.pop();\n    else stack.push(part);\n  }\n  return '/' + stack.join('/');\n}\n",
    "tests": [
      {
        "name": "dots and parents",
        "body": "assert.equal(simplifyPath('/a/./b/../../c/'), '/c');"
      },
      {
        "name": "a simple path with a trailing slash",
        "body": "assert.equal(simplifyPath('/home/'), '/home');\nassert.equal(simplifyPath('/home/user/docs'), '/home/user/docs');"
      },
      {
        "name": "repeated slashes collapse",
        "body": "assert.equal(simplifyPath('/home//foo/'), '/home/foo');\nassert.equal(simplifyPath('//a///b//'), '/a/b');"
      },
      {
        "name": "going above the root stays at the root",
        "body": "assert.equal(simplifyPath('/../'), '/');\nassert.equal(simplifyPath('/../../a'), '/a');"
      },
      {
        "name": "the root itself",
        "body": "assert.equal(simplifyPath('/'), '/');\nassert.equal(simplifyPath('/.'), '/');"
      },
      {
        "name": "three dots is an ordinary name",
        "body": "assert.equal(simplifyPath('/.../a/../b/c/../d/./'), '/.../b/d');\nassert.equal(simplifyPath('/a/x.y/..'), '/a');"
      },
      {
        "name": "everything cancels out",
        "body": "assert.equal(simplifyPath('/a/b/c/../../..'), '/');\nassert.equal(simplifyPath('/a/b/../../../..'), '/');"
      }
    ]
  },
  {
    "id": "ex-remove-adjacent-duplicates",
    "chapter": "dsa-stacks-queues",
    "level": "beginner",
    "title": "Remove All Adjacent Duplicates",
    "brief": "<p>Given a string of lowercase letters, repeatedly delete a pair of <b>equal adjacent</b> characters until no such pair remains, and return the result.</p><ul><li><code>\"abbaca\"</code> becomes <code>\"ca\"</code>: remove <code>bb</code> to get <code>\"aaca\"</code>, then <code>aa</code> to get <code>\"ca\"</code></li><li>A removal can create a new pair, so one left-to-right scan that only compares neighbours is not enough</li><li>The answer does not depend on the order of removals</li><li>Aim for O(n); repeatedly searching the string and rebuilding it is O(n^2)</li></ul>",
    "starter": "function removeDuplicates(s) {\n  // TODO: one pass with a stack of the characters that are still in the string\n}\n",
    "hints": [
      "Think of the output being built as you read: the last character kept is the only one a new character can cancel with.",
      "Keep a stack. If the top equals the current character, pop it (the pair disappears); otherwise push the character.",
      "After a pop, the new top is exactly the new neighbour, so chains such as 'abba' collapse in the same pass."
    ],
    "solution": "function removeDuplicates(s) {\n  const stack = [];\n  for (const c of s) {\n    if (stack.length && stack[stack.length - 1] === c) stack.pop();\n    else stack.push(c);\n  }\n  return stack.join('');\n}\n",
    "tests": [
      {
        "name": "the textbook example",
        "body": "assert.equal(removeDuplicates('abbaca'), 'ca');"
      },
      {
        "name": "nothing to remove",
        "body": "assert.equal(removeDuplicates('abc'), 'abc');\nassert.equal(removeDuplicates('a'), 'a');\nassert.equal(removeDuplicates(''), '');"
      },
      {
        "name": "everything cancels",
        "body": "assert.equal(removeDuplicates('aa'), '');\nassert.equal(removeDuplicates('abba'), '');\nassert.equal(removeDuplicates('abccba'), '');"
      },
      {
        "name": "removals create new pairs",
        "body": "assert.equal(removeDuplicates('azxxzy'), 'ay');\nassert.equal(removeDuplicates('aabccba'), 'a');"
      },
      {
        "name": "an odd run leaves one character",
        "body": "assert.equal(removeDuplicates('aaa'), 'a');\nassert.equal(removeDuplicates('aaaaa'), 'a');\nassert.equal(removeDuplicates('baaab'), 'bab');"
      },
      {
        "name": "agrees with repeated replacement on random strings",
        "body": "let seed = 4;\nconst rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) >> 3);\nfor (let t = 0; t < 300; t++) {\n  const s = Array.from({ length: rnd() % 16 }, () => 'abc'[rnd() % 3]).join('');\n  let expected = s;\n  while (/(.)\\1/.test(expected)) expected = expected.replace(/(.)\\1/, '');\n  assert.equal(removeDuplicates(s), expected);\n}"
      },
      {
        "name": "a long string of nested pairs finishes quickly",
        "body": "const half = 'ab'.repeat(50000);\nconst s = half + half.split('').reverse().join('');\nassert.equal(removeDuplicates(s), '');"
      }
    ]
  },
  {
    "id": "ex-remove-adjacent-duplicates-k",
    "chapter": "dsa-stacks-queues",
    "level": "intermediate",
    "title": "Remove K Adjacent Duplicates",
    "brief": "<p>Given a string <code>s</code> and an integer <code>k</code>, repeatedly delete <b>k equal adjacent</b> characters (a group of exactly k in a row) until none remain, and return the result.</p><ul><li><code>removeDuplicates(\"deeedbbcccbdaa\", 3)</code> is <code>\"aa\"</code></li><li>Deleting a group can bring two runs of the same letter together, and those may then form a new group of k</li><li><code>k &gt;= 2</code>; the answer does not depend on the order of deletions</li><li>Aim for O(n): a stack of <code>[character, run length]</code> pairs</li></ul>",
    "starter": "function removeDuplicates(s, k) {\n  // TODO: a stack of [char, runLength]; pop an entry when its run reaches k\n}\n",
    "hints": [
      "Counting equal characters on the fly is not enough, because deleting a group can merge two runs. The count must live with the stack entry.",
      "Keep entries [char, count]. If the top has the same character, increase its count; otherwise push [char, 1].",
      "When a count reaches k, pop the whole entry. At the end rebuild the string with repeat(count) for each entry."
    ],
    "solution": "function removeDuplicates(s, k) {\n  const stack = [];\n  for (const c of s) {\n    if (stack.length && stack[stack.length - 1][0] === c) {\n      if (++stack[stack.length - 1][1] === k) stack.pop();\n    } else {\n      stack.push([c, 1]);\n    }\n  }\n  return stack.map(([c, n]) => c.repeat(n)).join('');\n}\n",
    "tests": [
      {
        "name": "the textbook example",
        "body": "assert.equal(removeDuplicates('deeedbbcccbdaa', 3), 'aa');"
      },
      {
        "name": "a second example",
        "body": "assert.equal(removeDuplicates('pbbcggttciiippooaais', 2), 'ps');"
      },
      {
        "name": "nothing to remove",
        "body": "assert.equal(removeDuplicates('abcd', 2), 'abcd');\nassert.equal(removeDuplicates('aabb', 3), 'aabb');"
      },
      {
        "name": "a run longer than k is cut down",
        "body": "assert.equal(removeDuplicates('aaaaa', 3), 'aa');\nassert.equal(removeDuplicates('aaaaaa', 3), '');"
      },
      {
        "name": "the empty string",
        "body": "assert.equal(removeDuplicates('', 2), '');"
      },
      {
        "name": "deletions merge runs into a new group",
        "body": "assert.equal(removeDuplicates('aabbbaa', 3), 'a');\nassert.equal(removeDuplicates('aaabbbaaa', 3), '');\nassert.equal(removeDuplicates('abbbaa', 3), '');"
      },
      {
        "name": "random strings agree with repeated replacement",
        "body": "let seed = 12;\nconst rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) >> 3);\nfor (let t = 0; t < 300; t++) {\n  const k = 2 + (rnd() % 3);\n  const s = Array.from({ length: rnd() % 16 }, () => 'abc'[rnd() % 3]).join('');\n  const re = new RegExp('(.)\\\\1{' + (k - 1) + '}');\n  let expected = s;\n  while (re.test(expected)) expected = expected.replace(re, '');\n  assert.equal(removeDuplicates(s, k), expected);\n}"
      },
      {
        "name": "a long input finishes quickly",
        "body": "const half = 'ab'.repeat(30000);\nconst s = half + 'cc' + half.split('').reverse().join('');\nassert.equal(removeDuplicates(s, 2), '');"
      }
    ]
  },
  {
    "id": "ex-remove-k-digits",
    "chapter": "dsa-stacks-queues",
    "level": "intermediate",
    "title": "Remove K Digits",
    "brief": "<p>Given a non-negative integer as a string <code>num</code> and an integer <code>k</code>, remove exactly <code>k</code> digits so that the remaining number is as small as possible. Return it as a string.</p><ul><li><code>removeKdigits(\"1432219\", 3)</code> is <code>\"1219\"</code></li><li>The result has no leading zeros: <code>removeKdigits(\"10200\", 1)</code> is <code>\"200\"</code></li><li>If nothing is left, return <code>\"0\"</code></li><li>The remaining digits keep their original order</li><li>Aim for O(n)</li></ul>",
    "starter": "function removeKdigits(num, k) {\n  // TODO: a stack of kept digits; pop while the top is bigger than the new digit and k remains\n}\n",
    "hints": [
      "A bigger digit sitting before a smaller one is the best digit to delete, because an earlier digit weighs more than any later one.",
      "Scan left to right with a stack. While k > 0 and the top is greater than the current digit, pop it and decrement k. Then push the digit.",
      "After the scan, if you still owe deletions, remove them from the end (the stack is non-decreasing, so the largest are there). Then strip leading zeros and return '0' for an empty result."
    ],
    "solution": "function removeKdigits(num, k) {\n  const stack = [];\n  for (const d of num) {\n    while (k > 0 && stack.length && stack[stack.length - 1] > d) {\n      stack.pop();\n      k--;\n    }\n    stack.push(d);\n  }\n  while (k > 0) {\n    stack.pop();\n    k--;\n  }\n  const result = stack.join('').replace(/^0+/, '');\n  return result === '' ? '0' : result;\n}\n",
    "tests": [
      {
        "name": "the textbook example",
        "body": "assert.equal(removeKdigits('1432219', 3), '1219');"
      },
      {
        "name": "leading zeros are stripped",
        "body": "assert.equal(removeKdigits('10200', 1), '200');\nassert.equal(removeKdigits('100', 1), '0');"
      },
      {
        "name": "removing everything gives zero",
        "body": "assert.equal(removeKdigits('10', 2), '0');\nassert.equal(removeKdigits('9', 1), '0');"
      },
      {
        "name": "k is zero",
        "body": "assert.equal(removeKdigits('12345', 0), '12345');"
      },
      {
        "name": "an increasing number loses digits from the end",
        "body": "assert.equal(removeKdigits('112', 1), '11');\nassert.equal(removeKdigits('12345', 2), '123');"
      },
      {
        "name": "a decreasing number loses digits from the front",
        "body": "assert.equal(removeKdigits('54321', 2), '321');\nassert.equal(removeKdigits('9876', 3), '6');"
      },
      {
        "name": "equal neighbours are not removed",
        "body": "assert.equal(removeKdigits('1221', 1), '121');\nassert.equal(removeKdigits('2222', 2), '22');"
      },
      {
        "name": "random inputs agree with an exhaustive search",
        "body": "let seed = 8;\nconst rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) >> 3);\nfor (let t = 0; t < 200; t++) {\n  const n = 1 + (rnd() % 8);\n  const num = Array.from({ length: n }, () => String(rnd() % 10)).join('');\n  const k = rnd() % (n + 1);\n  const keep = n - k;\n  let best = null;\n  const rec = (i, chosen) => {\n    if (chosen.length === keep) { const v = BigInt(chosen.join('') || '0'); if (best === null || v < best) best = v; return; }\n    if (i === n) return;\n    rec(i + 1, chosen.concat(num[i]));\n    rec(i + 1, chosen);\n  };\n  rec(0, []);\n  assert.equal(removeKdigits(num, k), String(best));\n}"
      },
      {
        "name": "a long number finishes quickly",
        "body": "const num = '9'.repeat(100000) + '1';\nassert.equal(removeKdigits(num, 50000), '9'.repeat(50000) + '1');"
      }
    ]
  },
  {
    "id": "ex-inorder-traversal-iterative",
    "chapter": "dsa-stacks-queues",
    "level": "intermediate",
    "title": "Inorder Traversal Without Recursion",
    "brief": "<p>A binary tree node is an object <code>{ val, left, right }</code>, where <code>left</code> and <code>right</code> are nodes or <code>null</code>. Return the values in <b>inorder</b> (left subtree, node, right subtree) as an array.</p><ul><li>Do <b>not</b> use recursion: one test builds a left chain 200,000 nodes deep</li><li>Use an explicit stack</li><li>An empty tree (<code>null</code>) gives <code>[]</code></li></ul>",
    "starter": "function inorder(root) {\n  // TODO: go left as far as possible, stacking the nodes you pass; pop, record, then go right\n}\n",
    "hints": [
      "Inorder visits a node only after its entire left subtree. So walk down the left spine, pushing each node, until you fall off the tree.",
      "Pop the top of the stack: it is the next node to visit. Record its value.",
      "Then continue from its right child, and repeat. Keep going while there is a current node or the stack is not empty."
    ],
    "solution": "function inorder(root) {\n  const out = [];\n  const stack = [];\n  let node = root;\n  while (node !== null || stack.length) {\n    while (node !== null) {\n      stack.push(node);\n      node = node.left;\n    }\n    node = stack.pop();\n    out.push(node.val);\n    node = node.right;\n  }\n  return out;\n}\n",
    "tests": [
      {
        "name": "an empty tree",
        "body": "assert.deepEqual(inorder(null), []);"
      },
      {
        "name": "a single node",
        "body": "assert.deepEqual(inorder({ val: 7, left: null, right: null }), [7]);"
      },
      {
        "name": "a small search tree",
        "body": "const n = (val, left = null, right = null) => ({ val, left, right });\nconst tree = n(4, n(2, n(1), n(3)), n(6, n(5), n(7)));\nassert.deepEqual(inorder(tree), [1, 2, 3, 4, 5, 6, 7]);"
      },
      {
        "name": "a right-leaning tree with a left child inside",
        "body": "const n = (val, left = null, right = null) => ({ val, left, right });\nassert.deepEqual(inorder(n(1, null, n(2, n(3)))), [1, 3, 2]);"
      },
      {
        "name": "a left-only and a right-only chain",
        "body": "const n = (val, left = null, right = null) => ({ val, left, right });\nassert.deepEqual(inorder(n(3, n(2, n(1)))), [1, 2, 3]);\nassert.deepEqual(inorder(n(1, null, n(2, null, n(3)))), [1, 2, 3]);"
      },
      {
        "name": "random trees match the recursive definition",
        "body": "let seed = 2;\nconst rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) >> 3);\nlet next = 0;\nconst build = (count) => {\n  if (count === 0) return null;\n  const leftCount = rnd() % count;\n  const left = build(leftCount);\n  const val = next++;\n  return { val, left, right: build(count - 1 - leftCount) };\n};\nconst ref = (t) => (t === null ? [] : [...ref(t.left), t.val, ...ref(t.right)]);\nfor (let i = 0; i < 200; i++) {\n  const tree = build(rnd() % 30);\n  assert.deepEqual(inorder(tree), ref(tree));\n}"
      },
      {
        "name": "a 200,000-node left chain does not overflow the stack",
        "body": "let root = null;\nfor (let i = 0; i < 200000; i++) root = { val: i, left: root, right: null };\nconst out = inorder(root);\nassert.equal(out.length, 200000);\nassert.equal(out[0], 0);\nassert.equal(out[199999], 199999);"
      }
    ]
  },
];
