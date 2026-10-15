import type { Exercise } from "../types";

export const dsaAddBstOperations: Exercise[] = [
  {
    "id": "ex-bst-insert",
    "chapter": "dsa-bst-operations",
    "level": "beginner",
    "title": "Insert into a Binary Search Tree",
    "brief": "<p>Insert <code>val</code> into a binary search tree and return the root of the resulting tree.</p><ul><li>A new value always becomes a <b>leaf</b>: nothing already in the tree moves</li><li>If the tree is empty, the new node is the root</li><li>If <code>val</code> is already in the tree, leave the tree unchanged</li><li>Return the same root object you were given whenever the tree was not empty</li><li><code>build([...])</code> and <code>toArray(root)</code> are provided; <code>toArray</code> lists a tree level by level with <code>null</code> for missing children</li></ul>",
    "starter": "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\nfunction inorder(root) {\n  const out = [];\n  function walk(node) {\n    if (!node) return;\n    walk(node.left);\n    out.push(node.val);\n    walk(node.right);\n  }\n  walk(root);\n  return out;\n}\nfunction find(root, val) {\n  let node = root;\n  while (node && node.val !== val) node = val < node.val ? node.left : node.right;\n  return node;\n}\n\nfunction insertIntoBST(root, val) {\n  // TODO: walk down like a search, then hang a new leaf where the search falls off the tree\n}\n",
    "hints": [
      "Search for val the usual way. Where would the search fall off the tree? That empty slot is the only place a new node can go.",
      "Recursively: if the node is null, return a new TreeNode. Otherwise go left or right and assign the result back with node.left = insertIntoBST(node.left, val).",
      "Do nothing when val equals the node's value, and always return the node you were given so the caller keeps the same root."
    ],
    "solution": "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\nfunction inorder(root) {\n  const out = [];\n  function walk(node) {\n    if (!node) return;\n    walk(node.left);\n    out.push(node.val);\n    walk(node.right);\n  }\n  walk(root);\n  return out;\n}\nfunction find(root, val) {\n  let node = root;\n  while (node && node.val !== val) node = val < node.val ? node.left : node.right;\n  return node;\n}\n\nfunction insertIntoBST(root, val) {\n  if (root === null) return new TreeNode(val);\n  if (val < root.val) root.left = insertIntoBST(root.left, val);\n  else if (val > root.val) root.right = insertIntoBST(root.right, val);\n  return root;\n}\n",
    "tests": [
      {
        "name": "a larger value becomes a leaf below a right child's left side",
        "body": "assert.deepEqual(toArray(insertIntoBST(build([4,2,7,1,3]), 5)), [4,2,7,1,3,5]);"
      },
      {
        "name": "an empty tree gets a root",
        "body": "const root = insertIntoBST(null, 9);\nassert.equal(root.val, 9);\nassert.deepEqual(toArray(root), [9]);"
      },
      {
        "name": "a value below everything goes to the far left",
        "body": "assert.deepEqual(toArray(insertIntoBST(build([4,2,7,1,3]), 0)), [4,2,7,1,3,null,null,0]);"
      },
      {
        "name": "a value above everything goes to the far right",
        "body": "assert.deepEqual(toArray(insertIntoBST(build([4,2,7,1,3]), 9)), [4,2,7,1,3,null,9]);"
      },
      {
        "name": "a value already present leaves the tree unchanged",
        "body": "assert.deepEqual(toArray(insertIntoBST(build([4,2,7,1,3]), 3)), [4,2,7,1,3]);\nassert.deepEqual(toArray(insertIntoBST(build([4,2,7,1,3]), 4)), [4,2,7,1,3]);"
      },
      {
        "name": "returns the same root object and keeps existing nodes",
        "body": "const root = build([4,2,7,1,3]);\nconst left = root.left;\nconst right = root.right;\nconst got = insertIntoBST(root, 5);\nassert.ok(got === root, 'a non-empty tree keeps its root');\nassert.ok(got.left === left && got.right === right, 'existing nodes must not be replaced');"
      },
      {
        "name": "values inserted one at a time build the expected shape",
        "body": "let root = null;\nfor (const v of [5,3,8,1,4,7,9]) root = insertIntoBST(root, v);\nassert.deepEqual(toArray(root), [5,3,8,1,4,7,9]);"
      },
      {
        "name": "sorted input makes a chain",
        "body": "let root = null;\nfor (const v of [1,2,3]) root = insertIntoBST(root, v);\nassert.deepEqual(toArray(root), [1,null,2,null,3]);"
      },
      {
        "name": "200 random inserts leave a valid BST holding exactly those values",
        "body": "function seeded(seed) {\n  let s = seed;\n  return function () {\n    s = (s * 1664525 + 1013904223) % 4294967296;\n    return s / 4294967296;\n  };\n}\nfunction isBST(node, lo, hi) {\n  if (!node) return true;\n  if ((lo !== undefined && node.val <= lo) || (hi !== undefined && node.val >= hi)) return false;\n  return isBST(node.left, lo, node.val) && isBST(node.right, node.val, hi);\n}\nconst rnd = seeded(7);\nlet root = null;\nconst seen = new Set();\nfor (let i = 0; i < 200; i++) {\n  const v = Math.floor(rnd() * 120);\n  seen.add(v);\n  root = insertIntoBST(root, v);\n}\nassert.ok(isBST(root));\nassert.deepEqual(inorder(root), [...seen].sort((a, b) => a - b));"
      }
    ]
  },
  {
    "id": "ex-bst-delete-node",
    "chapter": "dsa-bst-operations",
    "level": "intermediate",
    "title": "Delete a Node from a Binary Search Tree",
    "brief": "<p>Delete the node whose value is <code>key</code> from a binary search tree and return the root of the resulting tree.</p><ul><li>A leaf is simply removed; a node with one child is replaced by that child</li><li>A node with <b>two children</b> takes the value of its <b>in-order successor</b> (the smallest value in its right subtree), and then that successor is removed from the right subtree. Following this rule exactly makes the resulting shape unique</li><li>If <code>key</code> is not in the tree, return the tree unchanged</li><li>The root can change, so use the return value</li><li>Values are distinct. <code>build</code> and <code>toArray</code> are provided</li></ul>",
    "starter": "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\nfunction inorder(root) {\n  const out = [];\n  function walk(node) {\n    if (!node) return;\n    walk(node.left);\n    out.push(node.val);\n    walk(node.right);\n  }\n  walk(root);\n  return out;\n}\nfunction find(root, val) {\n  let node = root;\n  while (node && node.val !== val) node = val < node.val ? node.left : node.right;\n  return node;\n}\n\nfunction deleteNode(root, key) {\n  // TODO: find the node, then handle zero, one or two children\n}\n",
    "hints": [
      "First find the node: go left when key is smaller and right when it is larger, assigning the recursive result back (node.left = deleteNode(node.left, key)).",
      "With at most one child, return the other child (or null). That one rule covers both the leaf case and the single-child case.",
      "With two children, find the minimum of the right subtree, copy its value into this node, then delete that value from the right subtree. That minimum has no left child, so the second deletion is easy."
    ],
    "solution": "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\nfunction inorder(root) {\n  const out = [];\n  function walk(node) {\n    if (!node) return;\n    walk(node.left);\n    out.push(node.val);\n    walk(node.right);\n  }\n  walk(root);\n  return out;\n}\nfunction find(root, val) {\n  let node = root;\n  while (node && node.val !== val) node = val < node.val ? node.left : node.right;\n  return node;\n}\n\nfunction minNode(node) {\n  while (node.left !== null) node = node.left;\n  return node;\n}\nfunction deleteNode(root, key) {\n  if (root === null) return null;\n  if (key < root.val) {\n    root.left = deleteNode(root.left, key);\n  } else if (key > root.val) {\n    root.right = deleteNode(root.right, key);\n  } else {\n    if (root.left === null) return root.right;\n    if (root.right === null) return root.left;\n    const heir = minNode(root.right);\n    root.val = heir.val;\n    root.right = deleteNode(root.right, heir.val);\n  }\n  return root;\n}\n",
    "tests": [
      {
        "name": "deletes a leaf",
        "body": "assert.deepEqual(toArray(deleteNode(build([5,3,6,2,4,null,7]), 2)), [5,3,6,null,4,null,7]);"
      },
      {
        "name": "a node with one child is replaced by that child",
        "body": "assert.deepEqual(toArray(deleteNode(build([5,3,6,2,4,null,7]), 6)), [5,3,7,2,4]);"
      },
      {
        "name": "two children: the successor value moves in",
        "body": "assert.deepEqual(toArray(deleteNode(build([5,3,6,2,4,null,7]), 3)), [5,4,6,2,null,null,7]);"
      },
      {
        "name": "deleting the root with two children",
        "body": "assert.deepEqual(toArray(deleteNode(build([5,3,6,2,4,null,7]), 5)), [6,3,7,2,4]);"
      },
      {
        "name": "the successor sits deeper than the right child",
        "body": "assert.deepEqual(toArray(deleteNode(build([8,3,10,1,6,null,14,null,null,4,7,13]), 3)), [8,4,10,1,6,null,14,null,null,null,7,13]);"
      },
      {
        "name": "a key that is not in the tree changes nothing",
        "body": "assert.deepEqual(toArray(deleteNode(build([5,3,6,2,4,null,7]), 99)), [5,3,6,2,4,null,7]);\nassert.equal(deleteNode(null, 1), null);"
      },
      {
        "name": "deleting the only node gives an empty tree",
        "body": "assert.equal(deleteNode(build([1]), 1), null);"
      },
      {
        "name": "the root with a single child hands the tree to that child",
        "body": "assert.deepEqual(toArray(deleteNode(build([3,2]), 3)), [2]);\nassert.deepEqual(toArray(deleteNode(build([3,null,4]), 3)), [4]);"
      },
      {
        "name": "a long random sequence of inserts and deletes stays a valid BST with the right values",
        "body": "function seeded(seed) {\n  let s = seed;\n  return function () {\n    s = (s * 1664525 + 1013904223) % 4294967296;\n    return s / 4294967296;\n  };\n}\nfunction isBST(node, lo, hi) {\n  if (!node) return true;\n  if ((lo !== undefined && node.val <= lo) || (hi !== undefined && node.val >= hi)) return false;\n  return isBST(node.left, lo, node.val) && isBST(node.right, node.val, hi);\n}\nfunction addValue(node, v) {\n  if (!node) return new TreeNode(v);\n  if (v < node.val) node.left = addValue(node.left, v);\n  else if (v > node.val) node.right = addValue(node.right, v);\n  return node;\n}\nconst rnd = seeded(2024);\nlet root = null;\nlet reference = [];\nfor (let step = 0; step < 600; step++) {\n  const v = Math.floor(rnd() * 40);\n  if (rnd() < 0.5) {\n    root = addValue(root, v);\n    if (!reference.includes(v)) reference.push(v);\n  } else {\n    root = deleteNode(root, v);\n    reference = reference.filter((x) => x !== v);\n  }\n  assert.deepEqual(inorder(root), [...reference].sort((a, b) => a - b), 'after step ' + step);\n  assert.ok(isBST(root), 'not a valid BST after step ' + step);\n}"
      }
    ]
  },
  {
    "id": "ex-bst-inorder-successor",
    "chapter": "dsa-bst-operations",
    "level": "intermediate",
    "title": "Inorder Successor in a BST",
    "brief": "<p>Given the root of a binary search tree and a node <code>p</code> that is in it, return the <b>in-order successor</b> of <code>p</code>: the node with the smallest value that is strictly greater than <code>p.val</code>. Return <code>null</code> if there is none.</p><ul><li>You are not given parent pointers</li><li>Return the node itself, not its value</li><li>Use the ordering: you should walk one path from the root, not traverse the whole tree</li><li><code>find(root, val)</code> is provided to fetch a node by value</li></ul>",
    "starter": "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\nfunction inorder(root) {\n  const out = [];\n  function walk(node) {\n    if (!node) return;\n    walk(node.left);\n    out.push(node.val);\n    walk(node.right);\n  }\n  walk(root);\n  return out;\n}\nfunction find(root, val) {\n  let node = root;\n  while (node && node.val !== val) node = val < node.val ? node.left : node.right;\n  return node;\n}\n\nfunction inorderSuccessor(root, p) {\n  // TODO: remember the last node where you turned left while walking toward p.val\n}\n",
    "hints": [
      "The successor is the next value in sorted order. Either it is the smallest value in p's right subtree, or it is the nearest ancestor that is larger than p.",
      "Walk from the root. When node.val is greater than p.val, it could be the answer, so remember it and go left to look for a smaller one; otherwise go right.",
      "One loop handles both cases: a candidate is only replaced by a smaller one, and the loop ends when it falls off the tree. Return the last candidate."
    ],
    "solution": "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\nfunction inorder(root) {\n  const out = [];\n  function walk(node) {\n    if (!node) return;\n    walk(node.left);\n    out.push(node.val);\n    walk(node.right);\n  }\n  walk(root);\n  return out;\n}\nfunction find(root, val) {\n  let node = root;\n  while (node && node.val !== val) node = val < node.val ? node.left : node.right;\n  return node;\n}\n\nfunction inorderSuccessor(root, p) {\n  let best = null;\n  let node = root;\n  while (node !== null) {\n    if (p.val < node.val) {\n      best = node;\n      node = node.left;\n    } else {\n      node = node.right;\n    }\n  }\n  return best;\n}\n",
    "tests": [
      {
        "name": "p has a right subtree: the successor is its minimum",
        "body": "const root = build([8,3,10,1,6,null,14,null,null,4,7,13]);\nassert.equal(inorderSuccessor(root, find(root, 3)).val, 4);\nassert.equal(inorderSuccessor(root, find(root, 8)).val, 10);"
      },
      {
        "name": "p has no right subtree: the successor is an ancestor",
        "body": "const root = build([8,3,10,1,6,null,14,null,null,4,7,13]);\nassert.equal(inorderSuccessor(root, find(root, 7)).val, 8);\nassert.equal(inorderSuccessor(root, find(root, 1)).val, 3);\nassert.equal(inorderSuccessor(root, find(root, 13)).val, 14);"
      },
      {
        "name": "the largest value has no successor",
        "body": "const root = build([8,3,10,1,6,null,14,null,null,4,7,13]);\nassert.equal(inorderSuccessor(root, find(root, 14)), null);"
      },
      {
        "name": "a right child with a left child chain",
        "body": "const root = build([8,3,10,1,6,null,14,null,null,4,7,13]);\nassert.equal(inorderSuccessor(root, find(root, 10)).val, 13);\nassert.equal(inorderSuccessor(root, find(root, 6)).val, 7);"
      },
      {
        "name": "returns the node object",
        "body": "const root = build([2,1,3]);\nassert.ok(inorderSuccessor(root, find(root, 1)) === root);\nassert.ok(inorderSuccessor(root, find(root, 2)) === find(root, 3));"
      },
      {
        "name": "a single node has no successor",
        "body": "const root = build([5]);\nassert.equal(inorderSuccessor(root, root), null);"
      },
      {
        "name": "a left-leaning chain",
        "body": "const root = build([4,3,null,2,null,1]);\nassert.equal(inorderSuccessor(root, find(root, 1)).val, 2);\nassert.equal(inorderSuccessor(root, find(root, 3)).val, 4);\nassert.equal(inorderSuccessor(root, find(root, 4)), null);"
      },
      {
        "name": "answers every node of a tree correctly",
        "body": "const root = build([8,3,10,1,6,null,14,null,null,4,7,13]);\nconst sorted = inorder(root);\nfor (let i = 0; i < sorted.length; i++) {\n  const got = inorderSuccessor(root, find(root, sorted[i]));\n  assert.equal(got === null ? null : got.val, i + 1 < sorted.length ? sorted[i + 1] : null);\n}"
      },
      {
        "name": "reads only one root-to-leaf path of a big tree",
        "body": "function countReads(root) {\n  const state = { reads: 0 };\n  (function wrap(node) {\n    if (!node) return;\n    let left = node.left;\n    let right = node.right;\n    Object.defineProperty(node, \"left\", { get() { state.reads++; return left; }, set(v) { left = v; }, configurable: true });\n    Object.defineProperty(node, \"right\", { get() { state.reads++; return right; }, set(v) { right = v; }, configurable: true });\n    wrap(left);\n    wrap(right);\n  })(root);\n  return state;\n}\nfunction balancedFrom(lo, hi) {\n  if (lo > hi) return null;\n  const mid = Math.floor((lo + hi) / 2);\n  const node = new TreeNode(mid);\n  node.left = balancedFrom(lo, mid - 1);\n  node.right = balancedFrom(mid + 1, hi);\n  return node;\n}\nconst root = balancedFrom(0, 4094);\nconst p = find(root, 1000);\nconst state = countReads(root);\nconst got = inorderSuccessor(root, p);\nassert.equal(got.val, 1001);\nassert.ok(state.reads < 100, 'read ' + state.reads + ' child pointers; one path needs about 25');"
      }
    ]
  },
  {
    "id": "ex-bst-floor-ceiling",
    "chapter": "dsa-bst-operations",
    "level": "intermediate",
    "title": "Floor and Ceiling in a BST",
    "brief": "<p>Given a binary search tree and a number <code>x</code>, return <code>[floor, ceiling]</code> where <code>floor</code> is the <b>largest value that is at most x</b> and <code>ceiling</code> is the <b>smallest value that is at least x</b>. Use <code>null</code> for a side that does not exist.</p><ul><li>If <code>x</code> is in the tree, both are <code>x</code></li><li>Use the ordering: one walk down the tree, not a traversal of every node</li><li>An empty tree returns <code>[null, null]</code></li><li><code>build</code> and <code>toArray</code> are provided</li></ul>",
    "starter": "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\nfunction inorder(root) {\n  const out = [];\n  function walk(node) {\n    if (!node) return;\n    walk(node.left);\n    out.push(node.val);\n    walk(node.right);\n  }\n  walk(root);\n  return out;\n}\nfunction find(root, val) {\n  let node = root;\n  while (node && node.val !== val) node = val < node.val ? node.left : node.right;\n  return node;\n}\n\nfunction floorCeiling(root, x) {\n  // TODO: walk down once, remembering the best floor and ceiling candidates seen\n}\n",
    "hints": [
      "When node.val is below x it is a floor candidate, and a better one (larger, still below x) could only be to its right.",
      "When node.val is above x it is a ceiling candidate, and a better one could only be to its left. If node.val equals x, you are done: both are x.",
      "Keep two variables, floor and ceiling, both starting at null, and walk until you fall off the tree."
    ],
    "solution": "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\nfunction inorder(root) {\n  const out = [];\n  function walk(node) {\n    if (!node) return;\n    walk(node.left);\n    out.push(node.val);\n    walk(node.right);\n  }\n  walk(root);\n  return out;\n}\nfunction find(root, val) {\n  let node = root;\n  while (node && node.val !== val) node = val < node.val ? node.left : node.right;\n  return node;\n}\n\nfunction floorCeiling(root, x) {\n  let floor = null;\n  let ceiling = null;\n  let node = root;\n  while (node !== null) {\n    if (node.val === x) return [x, x];\n    if (node.val < x) {\n      floor = node.val;\n      node = node.right;\n    } else {\n      ceiling = node.val;\n      node = node.left;\n    }\n  }\n  return [floor, ceiling];\n}\n",
    "tests": [
      {
        "name": "x between two values",
        "body": "const root = build([8,3,10,1,6,null,14,null,null,4,7,13]);\nassert.deepEqual(floorCeiling(root, 5), [4, 6]);\nassert.deepEqual(floorCeiling(root, 12), [10, 13]);"
      },
      {
        "name": "x present in the tree",
        "body": "const root = build([8,3,10,1,6,null,14,null,null,4,7,13]);\nassert.deepEqual(floorCeiling(root, 7), [7, 7]);\nassert.deepEqual(floorCeiling(root, 8), [8, 8]);"
      },
      {
        "name": "x below every value has no floor",
        "body": "const root = build([8,3,10,1,6,null,14,null,null,4,7,13]);\nassert.deepEqual(floorCeiling(root, 0), [null, 1]);"
      },
      {
        "name": "x above every value has no ceiling",
        "body": "const root = build([8,3,10,1,6,null,14,null,null,4,7,13]);\nassert.deepEqual(floorCeiling(root, 20), [14, null]);"
      },
      {
        "name": "an empty tree has neither",
        "body": "assert.deepEqual(floorCeiling(null, 5), [null, null]);"
      },
      {
        "name": "a single node",
        "body": "assert.deepEqual(floorCeiling(build([5]), 4), [null, 5]);\nassert.deepEqual(floorCeiling(build([5]), 6), [5, null]);\nassert.deepEqual(floorCeiling(build([5]), 5), [5, 5]);"
      },
      {
        "name": "negative values and fractional x",
        "body": "const root = build([0,-5,5,-8,-2,2,9]);\nassert.deepEqual(floorCeiling(root, -3), [-5, -2]);\nassert.deepEqual(floorCeiling(root, 2.5), [2, 5]);"
      },
      {
        "name": "agrees with a brute-force scan on every query of a larger tree",
        "body": "const values = [3, 9, 14, 20, 27, 31, 42, 58, 60, 71, 85];\nfunction fromSorted(lo, hi) {\n  if (lo > hi) return null;\n  const mid = Math.floor((lo + hi) / 2);\n  const node = new TreeNode(values[mid]);\n  node.left = fromSorted(lo, mid - 1);\n  node.right = fromSorted(mid + 1, hi);\n  return node;\n}\nconst root = fromSorted(0, values.length - 1);\nfor (let x = -1; x <= 90; x++) {\n  const floor = values.filter((v) => v <= x).pop();\n  const ceiling = values.find((v) => v >= x);\n  assert.deepEqual(floorCeiling(root, x), [floor === undefined ? null : floor, ceiling === undefined ? null : ceiling], 'x = ' + x);\n}"
      },
      {
        "name": "reads only one root-to-leaf path of a big tree",
        "body": "function countReads(root) {\n  const state = { reads: 0 };\n  (function wrap(node) {\n    if (!node) return;\n    let left = node.left;\n    let right = node.right;\n    Object.defineProperty(node, \"left\", { get() { state.reads++; return left; }, set(v) { left = v; }, configurable: true });\n    Object.defineProperty(node, \"right\", { get() { state.reads++; return right; }, set(v) { right = v; }, configurable: true });\n    wrap(left);\n    wrap(right);\n  })(root);\n  return state;\n}\nfunction balancedFrom(lo, hi) {\n  if (lo > hi) return null;\n  const mid = Math.floor((lo + hi) / 2);\n  const node = new TreeNode(mid);\n  node.left = balancedFrom(lo, mid - 1);\n  node.right = balancedFrom(mid + 1, hi);\n  return node;\n}\nconst root = balancedFrom(0, 4094);\nconst state = countReads(root);\nassert.deepEqual(floorCeiling(root, 2000.5), [2000, 2001]);\nassert.ok(state.reads < 100, 'read ' + state.reads + ' child pointers; one path needs about 25');"
      }
    ]
  },
  {
    "id": "ex-bst-iterator",
    "chapter": "dsa-bst-operations",
    "level": "intermediate",
    "title": "BST Iterator",
    "brief": "<p>Implement a class <code>BSTIterator</code> over a binary search tree that returns the values in increasing order, one at a time.</p><ul><li><code>new BSTIterator(root)</code> prepares the iterator</li><li><code>next()</code> returns the next smallest value not yet returned</li><li><code>hasNext()</code> says whether any value remains</li><li>Aim for O(1) amortized time per call and O(h) memory, where h is the height. Do <b>not</b> copy the whole tree into an array in the constructor</li><li>Calls to <code>next()</code> are only made while <code>hasNext()</code> is true</li></ul>",
    "starter": "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\nfunction inorder(root) {\n  const out = [];\n  function walk(node) {\n    if (!node) return;\n    walk(node.left);\n    out.push(node.val);\n    walk(node.right);\n  }\n  walk(root);\n  return out;\n}\nfunction find(root, val) {\n  let node = root;\n  while (node && node.val !== val) node = val < node.val ? node.left : node.right;\n  return node;\n}\n\nclass BSTIterator {\n  constructor(root) {\n    // TODO: keep only the path you still need to come back to\n  }\n\n  next() {\n    // TODO\n  }\n\n  hasNext() {\n    // TODO\n  }\n}\n",
    "hints": [
      "An in-order traversal pauses with a chain of ancestors waiting to be visited. That chain is all the state you need, and it fits in a stack.",
      "In the constructor, push the root and every left child below it. The top of the stack is then the smallest value.",
      "next() pops the top, then pushes the left spine of the popped node's right child, and returns the popped value. hasNext() is whether the stack is empty."
    ],
    "solution": "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\nfunction inorder(root) {\n  const out = [];\n  function walk(node) {\n    if (!node) return;\n    walk(node.left);\n    out.push(node.val);\n    walk(node.right);\n  }\n  walk(root);\n  return out;\n}\nfunction find(root, val) {\n  let node = root;\n  while (node && node.val !== val) node = val < node.val ? node.left : node.right;\n  return node;\n}\n\nclass BSTIterator {\n  constructor(root) {\n    this.stack = [];\n    this.pushLeftSpine(root);\n  }\n\n  pushLeftSpine(node) {\n    while (node !== null) {\n      this.stack.push(node);\n      node = node.left;\n    }\n  }\n\n  next() {\n    const node = this.stack.pop();\n    this.pushLeftSpine(node.right);\n    return node.val;\n  }\n\n  hasNext() {\n    return this.stack.length > 0;\n  }\n}\n",
    "tests": [
      {
        "name": "returns the values in increasing order",
        "body": "const it = new BSTIterator(build([7,3,15,null,null,9,20]));\nassert.equal(it.next(), 3);\nassert.equal(it.next(), 7);\nassert.equal(it.hasNext(), true);\nassert.equal(it.next(), 9);\nassert.equal(it.next(), 15);\nassert.equal(it.next(), 20);\nassert.equal(it.hasNext(), false);"
      },
      {
        "name": "hasNext is true before the first call and false at the end",
        "body": "const it = new BSTIterator(build([2,1,3]));\nassert.equal(it.hasNext(), true);\nit.next(); it.next(); it.next();\nassert.equal(it.hasNext(), false);"
      },
      {
        "name": "an empty tree has nothing to return",
        "body": "assert.equal(new BSTIterator(null).hasNext(), false);"
      },
      {
        "name": "a single node",
        "body": "const it = new BSTIterator(build([4]));\nassert.equal(it.next(), 4);\nassert.equal(it.hasNext(), false);"
      },
      {
        "name": "a left-leaning and a right-leaning chain",
        "body": "const left = new BSTIterator(build([3,2,null,1]));\nconst got = [];\nwhile (left.hasNext()) got.push(left.next());\nassert.deepEqual(got, [1, 2, 3]);\nconst right = new BSTIterator(build([1,null,2,null,3]));\nconst got2 = [];\nwhile (right.hasNext()) got2.push(right.next());\nassert.deepEqual(got2, [1, 2, 3]);"
      },
      {
        "name": "walking the whole running-example tree gives its sorted values",
        "body": "const root = build([8,3,10,1,6,null,14,null,null,4,7,13]);\nconst it = new BSTIterator(root);\nconst got = [];\nwhile (it.hasNext()) got.push(it.next());\nassert.deepEqual(got, [1,3,4,6,7,8,10,13,14]);"
      },
      {
        "name": "two iterators over the same tree do not disturb each other",
        "body": "const root = build([5,3,8,1,4,7,9]);\nconst a = new BSTIterator(root);\nconst b = new BSTIterator(root);\nassert.equal(a.next(), 1);\nassert.equal(a.next(), 3);\nassert.equal(b.next(), 1);\nassert.equal(a.next(), 4);\nassert.equal(b.next(), 3);"
      },
      {
        "name": "the constructor and the first calls do not walk the whole tree",
        "body": "function countReads(root) {\n  const state = { reads: 0 };\n  (function wrap(node) {\n    if (!node) return;\n    let left = node.left;\n    let right = node.right;\n    Object.defineProperty(node, \"left\", { get() { state.reads++; return left; }, set(v) { left = v; }, configurable: true });\n    Object.defineProperty(node, \"right\", { get() { state.reads++; return right; }, set(v) { right = v; }, configurable: true });\n    wrap(left);\n    wrap(right);\n  })(root);\n  return state;\n}\nfunction balancedFrom(lo, hi) {\n  if (lo > hi) return null;\n  const mid = Math.floor((lo + hi) / 2);\n  const node = new TreeNode(mid);\n  node.left = balancedFrom(lo, mid - 1);\n  node.right = balancedFrom(mid + 1, hi);\n  return node;\n}\nconst root = balancedFrom(0, 32766);\nconst state = countReads(root);\nconst it = new BSTIterator(root);\nassert.equal(it.next(), 0);\nassert.equal(it.next(), 1);\nassert.equal(it.next(), 2);\nassert.ok(state.reads < 200, 'read ' + state.reads + ' child pointers; copying the tree would read tens of thousands');"
      },
      {
        "name": "a full walk over a big tree reads each child pointer only a few times",
        "body": "function countReads(root) {\n  const state = { reads: 0 };\n  (function wrap(node) {\n    if (!node) return;\n    let left = node.left;\n    let right = node.right;\n    Object.defineProperty(node, \"left\", { get() { state.reads++; return left; }, set(v) { left = v; }, configurable: true });\n    Object.defineProperty(node, \"right\", { get() { state.reads++; return right; }, set(v) { right = v; }, configurable: true });\n    wrap(left);\n    wrap(right);\n  })(root);\n  return state;\n}\nfunction balancedFrom(lo, hi) {\n  if (lo > hi) return null;\n  const mid = Math.floor((lo + hi) / 2);\n  const node = new TreeNode(mid);\n  node.left = balancedFrom(lo, mid - 1);\n  node.right = balancedFrom(mid + 1, hi);\n  return node;\n}\nconst root = balancedFrom(0, 16382);\nconst state = countReads(root);\nconst it = new BSTIterator(root);\nlet count = 0;\nlet previous = -1;\nwhile (it.hasNext()) {\n  const v = it.next();\n  assert.ok(v > previous);\n  previous = v;\n  count++;\n}\nassert.equal(count, 16383);\nassert.ok(state.reads < 4 * 16383, 'read ' + state.reads + ' child pointers for a walk of 16383 values');"
      }
    ]
  },
  {
    "id": "ex-bst-two-sum-iv",
    "chapter": "dsa-bst-operations",
    "level": "intermediate",
    "title": "Two Sum IV: Input Is a BST",
    "brief": "<p>Given a binary search tree and a number <code>k</code>, return <code>true</code> if there are two <b>different nodes</b> in the tree whose values add up to <code>k</code>, and <code>false</code> otherwise.</p><ul><li>A node cannot be used twice: for the tree <code>[1]</code> and <code>k = 2</code> the answer is <code>false</code></li><li>An empty tree gives <code>false</code></li><li>Values are distinct and may be negative</li><li>A set while traversing is fine. For a harder version, use two in-order walkers (one from each end) with O(h) extra space</li></ul>",
    "starter": "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\nfunction inorder(root) {\n  const out = [];\n  function walk(node) {\n    if (!node) return;\n    walk(node.left);\n    out.push(node.val);\n    walk(node.right);\n  }\n  walk(root);\n  return out;\n}\nfunction find(root, val) {\n  let node = root;\n  while (node && node.val !== val) node = val < node.val ? node.left : node.right;\n  return node;\n}\n\nfunction findTarget(root, k) {\n  // TODO: report whether two different nodes sum to k\n}\n",
    "hints": [
      "While visiting each node, ask whether k - node.val has been seen already. A Set remembers what you have visited.",
      "Do not add the node's own value before the check, or a value that is exactly half of k will pair with itself.",
      "The harder idea: in-order gives sorted values, so run the two-pointer technique with a forward walker from the smallest value and a backward walker from the largest."
    ],
    "solution": "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\nfunction inorder(root) {\n  const out = [];\n  function walk(node) {\n    if (!node) return;\n    walk(node.left);\n    out.push(node.val);\n    walk(node.right);\n  }\n  walk(root);\n  return out;\n}\nfunction find(root, val) {\n  let node = root;\n  while (node && node.val !== val) node = val < node.val ? node.left : node.right;\n  return node;\n}\n\nfunction findTarget(root, k) {\n  const seen = new Set();\n  const stack = [];\n  let node = root;\n  while (node !== null || stack.length > 0) {\n    while (node !== null) {\n      stack.push(node);\n      node = node.left;\n    }\n    node = stack.pop();\n    if (seen.has(k - node.val)) return true;\n    seen.add(node.val);\n    node = node.right;\n  }\n  return false;\n}\n",
    "tests": [
      {
        "name": "a pair exists",
        "body": "const root = build([5,3,6,2,4,null,7]);\nassert.equal(findTarget(root, 9), true);\nassert.equal(findTarget(root, 10), true);"
      },
      {
        "name": "no pair exists",
        "body": "const root = build([5,3,6,2,4,null,7]);\nassert.equal(findTarget(root, 28), false);\nassert.equal(findTarget(root, 14), false);"
      },
      {
        "name": "a node cannot pair with itself",
        "body": "assert.equal(findTarget(build([1]), 2), false);\nassert.equal(findTarget(build([5,3,6]), 10), false);"
      },
      {
        "name": "an empty tree",
        "body": "assert.equal(findTarget(null, 0), false);"
      },
      {
        "name": "two nodes only",
        "body": "assert.equal(findTarget(build([2,1]), 3), true);\nassert.equal(findTarget(build([2,null,3]), 4), false);"
      },
      {
        "name": "negative values",
        "body": "const root = build([0,-5,4,-8,-1,2,9]);\nassert.equal(findTarget(root, -9), true);\nassert.equal(findTarget(root, -13), true);\nassert.equal(findTarget(root, 20), false);"
      },
      {
        "name": "the pair is the smallest and the largest value",
        "body": "const root = build([8,3,10,1,6,null,14,null,null,4,7,13]);\nassert.equal(findTarget(root, 15), true);\nassert.equal(findTarget(root, 28), false);"
      },
      {
        "name": "agrees with a brute-force check for every k on a larger tree",
        "body": "const values = [-12, -7, -3, 0, 4, 9, 15, 22, 30, 41, 50];\nfunction fromSorted(lo, hi) {\n  if (lo > hi) return null;\n  const mid = Math.floor((lo + hi) / 2);\n  const node = new TreeNode(values[mid]);\n  node.left = fromSorted(lo, mid - 1);\n  node.right = fromSorted(mid + 1, hi);\n  return node;\n}\nconst root = fromSorted(0, values.length - 1);\nfor (let k = -30; k <= 100; k++) {\n  let expected = false;\n  for (let i = 0; i < values.length; i++) for (let j = i + 1; j < values.length; j++) if (values[i] + values[j] === k) expected = true;\n  assert.equal(findTarget(root, k), expected, 'k = ' + k);\n}"
      }
    ]
  },
  {
    "id": "ex-bst-sorted-list-to-bst",
    "chapter": "dsa-bst-operations",
    "level": "intermediate",
    "title": "Convert Sorted List to Balanced BST",
    "brief": "<p>Given the head of a singly linked list whose values are sorted in increasing order, build a <b>height-balanced</b> binary search tree holding those values and return its root.</p><ul><li>Height-balanced: for every node, the heights of its two subtrees differ by at most one</li><li>Any balanced shape is accepted; an empty list gives <code>null</code></li><li>A list has no random access. Finding the middle by walking at every level costs O(n log n); aim for O(n) by building the tree in in-order and advancing one cursor through the list</li><li><code>fromArray(values)</code>, <code>inorder(root)</code> and <code>isHeightBalanced(root)</code> are provided</li></ul>",
    "starter": "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\nfunction inorder(root) {\n  const out = [];\n  function walk(node) {\n    if (!node) return;\n    walk(node.left);\n    out.push(node.val);\n    walk(node.right);\n  }\n  walk(root);\n  return out;\n}\nfunction find(root, val) {\n  let node = root;\n  while (node && node.val !== val) node = val < node.val ? node.left : node.right;\n  return node;\n}\nfunction isHeightBalanced(root) {\n  function h(node) {\n    if (!node) return 0;\n    const l = h(node.left);\n    if (l < 0) return -1;\n    const r = h(node.right);\n    if (r < 0) return -1;\n    if (Math.abs(l - r) > 1) return -1;\n    return 1 + Math.max(l, r);\n  }\n  return h(root) >= 0;\n}\nclass ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction fromArray(values) {\n  let head = null;\n  for (let i = values.length - 1; i >= 0; i--) head = new ListNode(values[i], head);\n  return head;\n}\n\nfunction sortedListToBST(head) {\n  // TODO: count the nodes, then build the left subtree, take the next list value as the root, build the right subtree\n}\n",
    "hints": [
      "If you knew how many nodes the left subtree needs, the next list values would be exactly its nodes, in order, followed by the root.",
      "Count the list first. Then write build(lo, hi) over index bounds that makes the left subtree first, then takes the cursor's value as the node, then moves the cursor, then makes the right subtree.",
      "The recursion is in-order on the tree you are creating, so the single cursor advances through the list exactly once and the whole thing is O(n)."
    ],
    "solution": "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\nfunction inorder(root) {\n  const out = [];\n  function walk(node) {\n    if (!node) return;\n    walk(node.left);\n    out.push(node.val);\n    walk(node.right);\n  }\n  walk(root);\n  return out;\n}\nfunction find(root, val) {\n  let node = root;\n  while (node && node.val !== val) node = val < node.val ? node.left : node.right;\n  return node;\n}\nfunction isHeightBalanced(root) {\n  function h(node) {\n    if (!node) return 0;\n    const l = h(node.left);\n    if (l < 0) return -1;\n    const r = h(node.right);\n    if (r < 0) return -1;\n    if (Math.abs(l - r) > 1) return -1;\n    return 1 + Math.max(l, r);\n  }\n  return h(root) >= 0;\n}\nclass ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction fromArray(values) {\n  let head = null;\n  for (let i = values.length - 1; i >= 0; i--) head = new ListNode(values[i], head);\n  return head;\n}\n\nfunction sortedListToBST(head) {\n  let length = 0;\n  for (let p = head; p !== null; p = p.next) length += 1;\n  let cursor = head;\n  function buildRange(lo, hi) {\n    if (lo > hi) return null;\n    const mid = lo + Math.floor((hi - lo) / 2);\n    const left = buildRange(lo, mid - 1);\n    const node = new TreeNode(cursor.val);\n    cursor = cursor.next;\n    node.left = left;\n    node.right = buildRange(mid + 1, hi);\n    return node;\n  }\n  return buildRange(0, length - 1);\n}\n",
    "tests": [
      {
        "name": "holds the values in order and stays balanced",
        "body": "const values = [-10,-3,0,5,9];\nconst root = sortedListToBST(fromArray(values));\nassert.deepEqual(inorder(root), values);\nassert.ok(isHeightBalanced(root), 'must be height-balanced');"
      },
      {
        "name": "an empty list gives null",
        "body": "assert.equal(sortedListToBST(null), null);"
      },
      {
        "name": "a single value",
        "body": "assert.deepEqual(toArray(sortedListToBST(fromArray([7]))), [7]);"
      },
      {
        "name": "two values",
        "body": "const root = sortedListToBST(fromArray([1, 2]));\nassert.deepEqual(inorder(root), [1, 2]);\nassert.ok(isHeightBalanced(root));"
      },
      {
        "name": "every length from 1 to 40 is balanced and in order",
        "body": "for (let n = 1; n <= 40; n++) {\n  const values = Array.from({ length: n }, (_, i) => i * 2 - 9);\n  const root = sortedListToBST(fromArray(values));\n  assert.deepEqual(inorder(root), values, 'n = ' + n);\n  assert.ok(isHeightBalanced(root), 'not balanced for n = ' + n);\n}"
      },
      {
        "name": "a seven-value list becomes a perfect tree",
        "body": "assert.deepEqual(toArray(sortedListToBST(fromArray([1,2,3,4,5,6,7]))), [4,2,6,1,3,5,7]);"
      },
      {
        "name": "builds a big list without re-walking it at every level",
        "body": "let reads = 0;\nconst values = Array.from({ length: 8191 }, (_, i) => i);\nlet head = null;\nfor (let i = values.length - 1; i >= 0; i--) {\n  const node = new ListNode(values[i], null);\n  let nextNode = head;\n  Object.defineProperty(node, 'next', { get() { reads++; return nextNode; }, set(v) { nextNode = v; }, configurable: true });\n  head = node;\n}\nconst root = sortedListToBST(head);\nassert.deepEqual(inorder(root), values);\nassert.ok(isHeightBalanced(root));\nassert.ok(reads < 5 * 8191, 'followed next pointers ' + reads + ' times; a linear build needs about 2 per node');"
      }
    ]
  },
  {
    "id": "ex-bst-trim",
    "chapter": "dsa-bst-operations",
    "level": "intermediate",
    "title": "Trim a Binary Search Tree",
    "brief": "<p>Given a binary search tree and two bounds <code>low</code> and <code>high</code>, remove every node whose value is outside <code>[low, high]</code> and return the root of the trimmed tree.</p><ul><li>The nodes that stay keep their relative structure: do not rebuild the tree, only cut</li><li>The root may change, and the result may be empty (<code>null</code>)</li><li>Use the ordering to skip whole subtrees: a node below <code>low</code> takes its entire left subtree with it</li><li><code>build</code> and <code>toArray</code> are provided</li></ul>",
    "starter": "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\nfunction inorder(root) {\n  const out = [];\n  function walk(node) {\n    if (!node) return;\n    walk(node.left);\n    out.push(node.val);\n    walk(node.right);\n  }\n  walk(root);\n  return out;\n}\nfunction find(root, val) {\n  let node = root;\n  while (node && node.val !== val) node = val < node.val ? node.left : node.right;\n  return node;\n}\n\nfunction trimBST(root, low, high) {\n  // TODO: return the root of the subtree with every value inside [low, high]\n}\n",
    "hints": [
      "If root.val is below low, neither root nor anything in its left subtree can stay: the answer is whatever the right subtree trims to.",
      "If root.val is above high, mirror that: the answer is what the left subtree trims to.",
      "Otherwise root stays: trim both children, assign the results back to root.left and root.right, and return root."
    ],
    "solution": "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\nfunction inorder(root) {\n  const out = [];\n  function walk(node) {\n    if (!node) return;\n    walk(node.left);\n    out.push(node.val);\n    walk(node.right);\n  }\n  walk(root);\n  return out;\n}\nfunction find(root, val) {\n  let node = root;\n  while (node && node.val !== val) node = val < node.val ? node.left : node.right;\n  return node;\n}\n\nfunction trimBST(root, low, high) {\n  if (root === null) return null;\n  if (root.val < low) return trimBST(root.right, low, high);\n  if (root.val > high) return trimBST(root.left, low, high);\n  root.left = trimBST(root.left, low, high);\n  root.right = trimBST(root.right, low, high);\n  return root;\n}\n",
    "tests": [
      {
        "name": "removes a value that is too small",
        "body": "assert.deepEqual(toArray(trimBST(build([1,0,2]), 1, 2)), [1,null,2]);"
      },
      {
        "name": "a deeper node that survives is lifted into place",
        "body": "assert.deepEqual(toArray(trimBST(build([3,0,4,null,2,null,null,1]), 1, 3)), [3,2,null,1]);"
      },
      {
        "name": "trimming from both sides on the running example",
        "body": "assert.deepEqual(toArray(trimBST(build([8,3,10,1,6,null,14,null,null,4,7,13]), 4, 10)), [8,6,10,4,7]);"
      },
      {
        "name": "the root itself can change",
        "body": "const root = trimBST(build([8,3,10,1,6,null,14,null,null,4,7,13]), 9, 12);\nassert.equal(root.val, 10);\nassert.deepEqual(toArray(root), [10]);"
      },
      {
        "name": "everything outside the range gives an empty tree",
        "body": "assert.equal(trimBST(build([5,3,8]), 10, 20), null);\nassert.equal(trimBST(build([5,3,8]), 0, 2), null);\nassert.equal(trimBST(null, 0, 1), null);"
      },
      {
        "name": "a range covering everything changes nothing",
        "body": "assert.deepEqual(toArray(trimBST(build([5,3,8,1,4,7,9]), 0, 100)), [5,3,8,1,4,7,9]);"
      },
      {
        "name": "a range of exactly one value",
        "body": "assert.deepEqual(toArray(trimBST(build([5,3,8,1,4,7,9]), 4, 4)), [4]);"
      },
      {
        "name": "the bounds are inclusive",
        "body": "assert.deepEqual(toArray(trimBST(build([5,3,8,1,4,7,9]), 3, 8)), [5,3,8,null,4,7]);"
      },
      {
        "name": "keeps the surviving nodes themselves",
        "body": "const root = build([5,3,8,1,4,7,9]);\nconst four = root.left.right;\nconst got = trimBST(root, 4, 8);\nassert.ok(got === root);\nassert.ok(got.left === four, 'the node holding 4 must be the same object');"
      }
    ]
  },
  {
    "id": "ex-bst-ordered-set",
    "chapter": "dsa-bst-operations",
    "level": "intermediate",
    "title": "Build the Ordered Set JavaScript Does Not Have",
    "brief": "<p>JavaScript has no <code>TreeSet</code>. Implement a class <code>OrderedSet</code> of distinct numbers that supports ordered queries, using a sorted array and binary search.</p><ul><li><code>add(x)</code>: insert <code>x</code>; return <code>true</code> if it was new, <code>false</code> if already present</li><li><code>remove(x)</code>: delete <code>x</code>; return <code>true</code> if it was present, <code>false</code> otherwise</li><li><code>has(x)</code>, <code>size()</code></li><li><code>floor(x)</code>: the largest value ≤ x, or <code>null</code>; <code>ceiling(x)</code>: the smallest value ≥ x, or <code>null</code></li><li><code>rank(x)</code>: how many stored values are smaller than <code>x</code> (works whether or not <code>x</code> is stored)</li><li><code>kth(k)</code>: the k-th smallest, counting from 1, or <code>null</code> if <code>k</code> is out of range</li><li>Finding a position must be O(log n); the shift on insert and delete may cost O(n). Do not sort on every query</li></ul>",
    "starter": "class OrderedSet {\n  constructor() {\n    this.items = [];\n  }\n\n  add(x) {\n    // TODO: find the position with a binary search, then insert there\n  }\n\n  remove(x) {\n    // TODO\n  }\n\n  has(x) {\n    // TODO\n  }\n\n  floor(x) {\n    // TODO\n  }\n\n  ceiling(x) {\n    // TODO\n  }\n\n  rank(x) {\n    // TODO\n  }\n\n  kth(k) {\n    // TODO\n  }\n\n  size() {\n    // TODO\n  }\n}\n",
    "hints": [
      "Write one helper, lowerBound(x), that returns the first index whose value is at least x. Almost every method is that index plus one check.",
      "add and remove use lowerBound to find the position, test whether items[i] === x, and then call splice. rank(x) is just lowerBound(x). kth(k) is items[k - 1].",
      "floor(x) needs the first index whose value is greater than x (an upper bound); the element just before it is the floor. Check the index is not negative, and return null instead of undefined."
    ],
    "solution": "class OrderedSet {\n  constructor() {\n    this.items = [];\n  }\n\n  lowerBound(x) {\n    let lo = 0;\n    let hi = this.items.length;\n    while (lo < hi) {\n      const mid = (lo + hi) >>> 1;\n      if (this.items[mid] < x) lo = mid + 1;\n      else hi = mid;\n    }\n    return lo;\n  }\n\n  upperBound(x) {\n    let lo = 0;\n    let hi = this.items.length;\n    while (lo < hi) {\n      const mid = (lo + hi) >>> 1;\n      if (this.items[mid] <= x) lo = mid + 1;\n      else hi = mid;\n    }\n    return lo;\n  }\n\n  add(x) {\n    const i = this.lowerBound(x);\n    if (this.items[i] === x) return false;\n    this.items.splice(i, 0, x);\n    return true;\n  }\n\n  remove(x) {\n    const i = this.lowerBound(x);\n    if (this.items[i] !== x) return false;\n    this.items.splice(i, 1);\n    return true;\n  }\n\n  has(x) {\n    return this.items[this.lowerBound(x)] === x;\n  }\n\n  floor(x) {\n    const i = this.upperBound(x) - 1;\n    return i >= 0 ? this.items[i] : null;\n  }\n\n  ceiling(x) {\n    const i = this.lowerBound(x);\n    return i < this.items.length ? this.items[i] : null;\n  }\n\n  rank(x) {\n    return this.lowerBound(x);\n  }\n\n  kth(k) {\n    return k >= 1 && k <= this.items.length ? this.items[k - 1] : null;\n  }\n\n  size() {\n    return this.items.length;\n  }\n}\n",
    "tests": [
      {
        "name": "add reports whether the value was new and keeps order",
        "body": "const s = new OrderedSet();\nassert.equal(s.add(5), true);\nassert.equal(s.add(1), true);\nassert.equal(s.add(9), true);\nassert.equal(s.add(3), true);\nassert.equal(s.add(5), false);\nassert.equal(s.size(), 4);\nassert.equal(s.kth(1), 1);\nassert.equal(s.kth(4), 9);"
      },
      {
        "name": "has and remove",
        "body": "const s = new OrderedSet();\nfor (const v of [4, 8, 2]) s.add(v);\nassert.equal(s.has(8), true);\nassert.equal(s.has(5), false);\nassert.equal(s.remove(8), true);\nassert.equal(s.remove(8), false);\nassert.equal(s.has(8), false);\nassert.equal(s.size(), 2);"
      },
      {
        "name": "floor and ceiling between, at and outside the stored values",
        "body": "const s = new OrderedSet();\nfor (const v of [5, 1, 9, 3]) s.add(v);\nassert.equal(s.floor(4), 3);\nassert.equal(s.ceiling(4), 5);\nassert.equal(s.floor(5), 5);\nassert.equal(s.ceiling(5), 5);\nassert.equal(s.floor(0), null);\nassert.equal(s.ceiling(10), null);\nassert.equal(s.floor(100), 9);\nassert.equal(s.ceiling(-100), 1);"
      },
      {
        "name": "rank counts the values below x, stored or not",
        "body": "const s = new OrderedSet();\nfor (const v of [5, 1, 9, 3]) s.add(v);\nassert.equal(s.rank(5), 2);\nassert.equal(s.rank(4), 2);\nassert.equal(s.rank(1), 0);\nassert.equal(s.rank(0), 0);\nassert.equal(s.rank(100), 4);"
      },
      {
        "name": "kth counts from 1 and gives null outside the range",
        "body": "const s = new OrderedSet();\nfor (const v of [5, 1, 9, 3]) s.add(v);\nassert.equal(s.kth(1), 1);\nassert.equal(s.kth(3), 5);\nassert.equal(s.kth(4), 9);\nassert.equal(s.kth(0), null);\nassert.equal(s.kth(5), null);"
      },
      {
        "name": "an empty set",
        "body": "const s = new OrderedSet();\nassert.equal(s.size(), 0);\nassert.equal(s.floor(1), null);\nassert.equal(s.ceiling(1), null);\nassert.equal(s.kth(1), null);\nassert.equal(s.rank(1), 0);\nassert.equal(s.remove(1), false);"
      },
      {
        "name": "negative and decimal values order numerically",
        "body": "const s = new OrderedSet();\nfor (const v of [10, -2, 2.5, -20, 0]) s.add(v);\nassert.deepEqual([1,2,3,4,5].map((k) => s.kth(k)), [-20, -2, 0, 2.5, 10]);\nassert.equal(s.floor(2.4), 0);\nassert.equal(s.ceiling(2.4), 2.5);"
      },
      {
        "name": "stays correct over 4000 random operations compared with a brute-force array",
        "body": "function seeded(seed) {\n  let s = seed;\n  return function () {\n    s = (s * 1664525 + 1013904223) % 4294967296;\n    return s / 4294967296;\n  };\n}\nfunction isBST(node, lo, hi) {\n  if (!node) return true;\n  if ((lo !== undefined && node.val <= lo) || (hi !== undefined && node.val >= hi)) return false;\n  return isBST(node.left, lo, node.val) && isBST(node.right, node.val, hi);\n}\nconst rnd = seeded(99);\nconst s = new OrderedSet();\nlet ref = [];\nfor (let step = 0; step < 4000; step++) {\n  const v = Math.floor(rnd() * 60) - 10;\n  if (rnd() < 0.55) {\n    assert.equal(s.add(v), !ref.includes(v));\n    if (!ref.includes(v)) ref.push(v);\n  } else {\n    assert.equal(s.remove(v), ref.includes(v));\n    ref = ref.filter((x) => x !== v);\n  }\n  const sorted = [...ref].sort((a, b) => a - b);\n  const q = Math.floor(rnd() * 80) - 15;\n  const fl = sorted.filter((x) => x <= q).pop();\n  const ce = sorted.find((x) => x >= q);\n  assert.equal(s.floor(q), fl === undefined ? null : fl);\n  assert.equal(s.ceiling(q), ce === undefined ? null : ce);\n  assert.equal(s.rank(q), sorted.filter((x) => x < q).length);\n  assert.equal(s.size(), sorted.length);\n  if (sorted.length) assert.equal(s.kth(1 + Math.floor(rnd() * sorted.length)) !== null, true);\n}"
      },
      {
        "name": "handles 30000 values without sorting on every query",
        "body": "const s = new OrderedSet();\nfor (let i = 0; i < 30000; i++) s.add((i * 7919) % 30011);\nlet total = 0;\nfor (let q = 0; q < 30000; q++) {\n  const f = s.floor(q);\n  if (f !== null) total += 1;\n  s.rank(q);\n}\nassert.ok(total > 0);\nassert.equal(s.size(), 30000);"
      }
    ]
  },
  {
    "id": "ex-bst-order-statistics",
    "chapter": "dsa-bst-operations",
    "level": "advanced",
    "title": "Order-Statistic Tree: kth and rank",
    "brief": "<p>Implement a class <code>RankedBST</code>: a set of distinct numbers kept in a binary search tree where every node also stores the <b>number of values in its subtree</b>, so k-th smallest and rank take O(h) instead of O(n).</p><ul><li><code>insert(val)</code>: add <code>val</code>; do nothing if it is already present</li><li><code>remove(val)</code>: remove <code>val</code> if present</li><li><code>kth(k)</code>: the k-th smallest value counting from 1, or <code>null</code> if <code>k</code> is out of range</li><li><code>rank(x)</code>: how many stored values are smaller than <code>x</code></li><li><code>size()</code>: how many values are stored</li><li>The sizes must stay correct through inserts and removes. No balancing is required</li></ul>",
    "starter": "class RankedBST {\n  constructor() {\n    this.root = null;\n  }\n\n  insert(val) {\n    // TODO: insert like a normal BST, and fix every node's size on the way back up\n  }\n\n  remove(val) {\n    // TODO: three-case delete, fixing sizes on the way back up\n  }\n\n  kth(k) {\n    // TODO: use the left subtree's size to decide which way to go\n  }\n\n  rank(x) {\n    // TODO: count the values smaller than x\n  }\n\n  size() {\n    // TODO\n  }\n}\n",
    "hints": [
      "Give each node a size field: 1 plus the size of its left child plus the size of its right child, treating a missing child as 0. Recompute it in every call that may have changed a subtree.",
      "kth(k): let L be the size of the left subtree. If k <= L go left. If k === L + 1 this node is the answer. Otherwise subtract L + 1 from k and go right.",
      "rank(x): walk down. When x is greater than the node's value, add 1 plus the left subtree's size (this node and everything left of it are smaller) and go right; otherwise go left."
    ],
    "solution": "class RankedBST {\n  constructor() {\n    this.root = null;\n  }\n\n  size() {\n    return this.root === null ? 0 : this.root.size;\n  }\n\n  insert(val) {\n    this.root = this.add(this.root, val);\n  }\n\n  add(node, val) {\n    if (node === null) return { val, left: null, right: null, size: 1 };\n    if (val < node.val) node.left = this.add(node.left, val);\n    else if (val > node.val) node.right = this.add(node.right, val);\n    else return node;\n    node.size = 1 + this.sizeOf(node.left) + this.sizeOf(node.right);\n    return node;\n  }\n\n  sizeOf(node) {\n    return node === null ? 0 : node.size;\n  }\n\n  remove(val) {\n    this.root = this.drop(this.root, val);\n  }\n\n  drop(node, val) {\n    if (node === null) return null;\n    if (val < node.val) {\n      node.left = this.drop(node.left, val);\n    } else if (val > node.val) {\n      node.right = this.drop(node.right, val);\n    } else {\n      if (node.left === null) return node.right;\n      if (node.right === null) return node.left;\n      let heir = node.right;\n      while (heir.left !== null) heir = heir.left;\n      node.val = heir.val;\n      node.right = this.drop(node.right, heir.val);\n    }\n    node.size = 1 + this.sizeOf(node.left) + this.sizeOf(node.right);\n    return node;\n  }\n\n  kth(k) {\n    let node = this.root;\n    while (node !== null) {\n      const leftCount = this.sizeOf(node.left);\n      if (k <= leftCount) {\n        node = node.left;\n      } else if (k === leftCount + 1) {\n        return node.val;\n      } else {\n        k -= leftCount + 1;\n        node = node.right;\n      }\n    }\n    return null;\n  }\n\n  rank(x) {\n    let smaller = 0;\n    let node = this.root;\n    while (node !== null) {\n      if (x <= node.val) {\n        node = node.left;\n      } else {\n        smaller += 1 + this.sizeOf(node.left);\n        node = node.right;\n      }\n    }\n    return smaller;\n  }\n}\n",
    "tests": [
      {
        "name": "kth over a small set",
        "body": "const t = new RankedBST();\nfor (const v of [8,3,10,1,6,14,4,7,13]) t.insert(v);\nassert.deepEqual([1,2,3,4,5,6,7,8,9].map((k) => t.kth(k)), [1,3,4,6,7,8,10,13,14]);\nassert.equal(t.size(), 9);"
      },
      {
        "name": "kth out of range is null",
        "body": "const t = new RankedBST();\nfor (const v of [8,3,10]) t.insert(v);\nassert.equal(t.kth(0), null);\nassert.equal(t.kth(4), null);\nassert.equal(new RankedBST().kth(1), null);"
      },
      {
        "name": "rank counts smaller values, stored or not",
        "body": "const t = new RankedBST();\nfor (const v of [8,3,10,1,6,14,4,7,13]) t.insert(v);\nassert.equal(t.rank(7), 4);\nassert.equal(t.rank(1), 0);\nassert.equal(t.rank(5), 3);\nassert.equal(t.rank(100), 9);\nassert.equal(t.rank(-5), 0);"
      },
      {
        "name": "inserting a duplicate changes nothing",
        "body": "const t = new RankedBST();\nfor (const v of [5,3,5,3,8]) t.insert(v);\nassert.equal(t.size(), 3);\nassert.equal(t.kth(2), 5);"
      },
      {
        "name": "sizes stay right after removals of leaves, one-child and two-child nodes",
        "body": "const t = new RankedBST();\nfor (const v of [8,3,10,1,6,14,4,7,13]) t.insert(v);\nt.remove(7);\nt.remove(14);\nt.remove(3);\nt.remove(8);\nt.remove(99);\nassert.equal(t.size(), 5);\nassert.deepEqual([1,2,3,4,5].map((k) => t.kth(k)), [1,4,6,10,13]);\nassert.equal(t.rank(10), 3);"
      },
      {
        "name": "removing everything empties the tree",
        "body": "const t = new RankedBST();\nfor (const v of [2,1,3]) t.insert(v);\nfor (const v of [1,2,3]) t.remove(v);\nassert.equal(t.size(), 0);\nassert.equal(t.kth(1), null);"
      },
      {
        "name": "matches a sorted-array reference over 3000 random operations",
        "body": "function seeded(seed) {\n  let s = seed;\n  return function () {\n    s = (s * 1664525 + 1013904223) % 4294967296;\n    return s / 4294967296;\n  };\n}\nfunction isBST(node, lo, hi) {\n  if (!node) return true;\n  if ((lo !== undefined && node.val <= lo) || (hi !== undefined && node.val >= hi)) return false;\n  return isBST(node.left, lo, node.val) && isBST(node.right, node.val, hi);\n}\nconst rnd = seeded(31337);\nconst t = new RankedBST();\nlet ref = [];\nfor (let step = 0; step < 3000; step++) {\n  const v = Math.floor(rnd() * 50);\n  if (rnd() < 0.55) {\n    t.insert(v);\n    if (!ref.includes(v)) ref.push(v);\n  } else {\n    t.remove(v);\n    ref = ref.filter((x) => x !== v);\n  }\n  const sorted = [...ref].sort((a, b) => a - b);\n  assert.equal(t.size(), sorted.length);\n  const k = 1 + Math.floor(rnd() * (sorted.length + 2));\n  assert.equal(t.kth(k), k <= sorted.length ? sorted[k - 1] : null, 'kth(' + k + ') after step ' + step);\n  const q = Math.floor(rnd() * 60) - 5;\n  assert.equal(t.rank(q), sorted.filter((x) => x < q).length, 'rank(' + q + ')');\n}"
      },
      {
        "name": "answers 20000 queries on a 20000-value tree quickly",
        "body": "const t = new RankedBST();\nlet x = 12345;\nfor (let i = 0; i < 20000; i++) {\n  x = (x * 48271) % 2147483647;\n  t.insert(x);\n}\nlet last = -1;\nfor (let q = 1; q <= 20000; q++) {\n  const v = t.kth(q);\n  if (v === null) break;\n  assert.ok(v > last);\n  last = v;\n  if (q % 100 === 0) assert.equal(t.rank(v), q - 1);\n}\nassert.ok(t.size() > 19000);"
      }
    ]
  },
  {
    "id": "ex-bst-avl-insert",
    "chapter": "dsa-bst-operations",
    "level": "advanced",
    "title": "AVL Tree Insert",
    "brief": "<p>Write <code>avlInsert(node, val)</code> that inserts <code>val</code> into an <b>AVL tree</b> and returns the root of the (sub)tree, rebalancing with rotations so that at every node the heights of the two subtrees differ by at most one.</p><ul><li>Nodes are <code>AvlNode</code> objects with <code>val</code>, <code>left</code>, <code>right</code> and <code>height</code> (a leaf has height 1, a missing child counts as 0)</li><li>Keep every node's <code>height</code> field correct, including after rotations</li><li>A duplicate value leaves the tree unchanged</li><li>Four cases: left-left (one right rotation), right-right (one left rotation), left-right and right-left (two rotations)</li><li>The tree's root can change when you rotate, so use the return value</li></ul>",
    "starter": "class AvlNode {\n  constructor(val) {\n    this.val = val;\n    this.left = null;\n    this.right = null;\n    this.height = 1;\n  }\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\nfunction inorder(root) {\n  const out = [];\n  (function walk(node) {\n    if (!node) return;\n    walk(node.left);\n    out.push(node.val);\n    walk(node.right);\n  })(root);\n  return out;\n}\n\nfunction avlInsert(node, val) {\n  // TODO: insert like a plain BST, then update the height and repair an imbalance of 2 on the way back up\n}\n",
    "hints": [
      "Insert exactly as in a normal BST, assigning the result back (node.left = avlInsert(node.left, val)). Then, on the way back up, recompute the node's height and its balance, the left height minus the right height.",
      "If the balance is greater than 1 the left side is too deep: rotate right at this node. If it is less than -1, rotate left. Update heights inside each rotation, the lower node first.",
      "For the zig-zag cases, first rotate the child so the heavy grandchild is on the outside: if the left child leans right, rotate it left before rotating this node right (and mirror for the right side)."
    ],
    "solution": "class AvlNode {\n  constructor(val) {\n    this.val = val;\n    this.left = null;\n    this.right = null;\n    this.height = 1;\n  }\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\nfunction inorder(root) {\n  const out = [];\n  (function walk(node) {\n    if (!node) return;\n    walk(node.left);\n    out.push(node.val);\n    walk(node.right);\n  })(root);\n  return out;\n}\nfunction heightOf(node) {\n  return node === null ? 0 : node.height;\n}\nfunction refresh(node) {\n  node.height = 1 + Math.max(heightOf(node.left), heightOf(node.right));\n}\nfunction rotateLeft(x) {\n  const y = x.right;\n  x.right = y.left;\n  y.left = x;\n  refresh(x);\n  refresh(y);\n  return y;\n}\nfunction rotateRight(y) {\n  const x = y.left;\n  y.left = x.right;\n  x.right = y;\n  refresh(y);\n  refresh(x);\n  return x;\n}\nfunction avlInsert(node, val) {\n  if (node === null) return new AvlNode(val);\n  if (val < node.val) node.left = avlInsert(node.left, val);\n  else if (val > node.val) node.right = avlInsert(node.right, val);\n  else return node;\n  refresh(node);\n  const balance = heightOf(node.left) - heightOf(node.right);\n  if (balance > 1) {\n    if (heightOf(node.left.left) < heightOf(node.left.right)) node.left = rotateLeft(node.left);\n    return rotateRight(node);\n  }\n  if (balance < -1) {\n    if (heightOf(node.right.right) < heightOf(node.right.left)) node.right = rotateRight(node.right);\n    return rotateLeft(node);\n  }\n  return node;\n}\n",
    "tests": [
      {
        "name": "a right-right chain is fixed by a left rotation",
        "body": "let root = null;\nfor (const v of [10, 20, 30]) root = avlInsert(root, v);\nassert.deepEqual(toArray(root), [20, 10, 30]);"
      },
      {
        "name": "a left-left chain is fixed by a right rotation",
        "body": "let root = null;\nfor (const v of [30, 20, 10]) root = avlInsert(root, v);\nassert.deepEqual(toArray(root), [20, 10, 30]);"
      },
      {
        "name": "left-right needs two rotations",
        "body": "let root = null;\nfor (const v of [30, 10, 20]) root = avlInsert(root, v);\nassert.deepEqual(toArray(root), [20, 10, 30]);"
      },
      {
        "name": "right-left needs two rotations",
        "body": "let root = null;\nfor (const v of [10, 30, 20]) root = avlInsert(root, v);\nassert.deepEqual(toArray(root), [20, 10, 30]);"
      },
      {
        "name": "1 through 7 in order give the perfect tree",
        "body": "let root = null;\nfor (let v = 1; v <= 7; v++) root = avlInsert(root, v);\nassert.deepEqual(toArray(root), [4, 2, 6, 1, 3, 5, 7]);\nassert.equal(root.height, 3);"
      },
      {
        "name": "a duplicate changes nothing",
        "body": "let root = null;\nfor (const v of [5, 3, 8]) root = avlInsert(root, v);\nconst before = toArray(root);\nassert.deepEqual(before, [5, 3, 8]);\nroot = avlInsert(root, 3);\nassert.deepEqual(toArray(root), before);"
      },
      {
        "name": "1023 sorted inserts give a perfect tree of height 10",
        "body": "let root = null;\nfor (let v = 1; v <= 1023; v++) root = avlInsert(root, v);\nassert.equal(root.height, 10);\nassert.equal(root.val, 512);\nassert.deepEqual(inorder(root).length, 1023);"
      },
      {
        "name": "800 random inserts keep the tree valid, balanced and with correct stored heights",
        "body": "function seeded(seed) {\n  let s = seed;\n  return function () {\n    s = (s * 1664525 + 1013904223) % 4294967296;\n    return s / 4294967296;\n  };\n}\nconst rnd = seeded(5);\nlet root = null;\nconst seen = new Set();\nfor (let i = 0; i < 800; i++) {\n  const v = Math.floor(rnd() * 500);\n  seen.add(v);\n  root = avlInsert(root, v);\n}\nfunction check(node, lo, hi) {\n  if (node === null) return 0;\n  assert.ok((lo === undefined || node.val > lo) && (hi === undefined || node.val < hi), 'ordering broken at ' + node.val);\n  const l = check(node.left, lo, node.val);\n  const r = check(node.right, node.val, hi);\n  assert.ok(Math.abs(l - r) <= 1, 'unbalanced at ' + node.val);\n  assert.equal(node.height, 1 + Math.max(l, r), 'stale height at ' + node.val);\n  return node.height;\n}\ncheck(root);\nassert.deepEqual(inorder(root), [...seen].sort((a, b) => a - b));"
      },
      {
        "name": "5000 sorted inserts stay within the AVL height bound",
        "body": "let root = null;\nfor (let v = 1; v <= 5000; v++) root = avlInsert(root, v);\nassert.ok(root.height <= 17, 'height ' + root.height + ' is too tall for 5000 values');\nassert.equal(inorder(root).length, 5000);"
      }
    ]
  }
];
