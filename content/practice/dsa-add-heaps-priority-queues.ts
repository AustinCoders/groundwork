import type { Exercise } from "../types";

export const dsaAddHeapsPriorityQueues: Exercise[] = [
  {
    "id": "ex-heap-with-comparator",
    "chapter": "dsa-heaps-priority-queues",
    "level": "intermediate",
    "title": "Build a Heap with a Comparator",
    "brief": "<p>JavaScript has no built-in heap, so write one. Implement a <code>Heap</code> class whose constructor takes a <b>comparator</b> and an optional array of starting items.</p><ul><li><code>new Heap(compare, items = [])</code>: <code>compare(a, b)</code> follows the <code>Array.prototype.sort</code> contract. A <b>negative</b> result means <code>a</code> must come out before <code>b</code></li><li><code>push(item)</code> adds an item, <code>pop()</code> removes and returns the item that comes out first, <code>peek()</code> returns it without removing, <code>size()</code> returns the count</li><li><code>pop()</code> and <code>peek()</code> on an empty heap return <code>undefined</code></li><li>The starting <code>items</code> array must <b>not</b> be reordered or changed. Build the heap from a copy, and aim for O(n) for that step</li><li><code>push</code> and <code>pop</code> must be O(log n)</li></ul>",
    "starter": "class Heap {\n  constructor(compare, items = []) {\n    // TODO: keep the comparator and a copy of the items, then make it a heap\n  }\n\n  size() {\n    // TODO\n  }\n\n  peek() {\n    // TODO\n  }\n\n  push(item) {\n    // TODO: add at the end, then sift up\n  }\n\n  pop() {\n    // TODO: take the root, move the last item to the root, then sift down\n  }\n}\n",
    "hints": [
      "Store the items in a plain array. The children of index i are at 2i + 1 and 2i + 2, and the parent of index i is at (i - 1) >> 1. Never ask what the items ARE; only ask compare(x, y) < 0.",
      "push: append, then while the item is strictly before its parent, swap them. pop: save data[0], take the last item off the array, put it at index 0, then sift down: swap with whichever child is before the current item, preferring the child that is before the other child.",
      "To build from a starting array in O(n), copy it with slice() and call siftDown on indexes from (n >> 1) - 1 down to 0. Remember to handle pop on a heap that held one item: after popping the last item there is nothing to put at the root."
    ],
    "solution": "class Heap {\n  #data;\n  #compare;\n\n  constructor(compare, items = []) {\n    this.#compare = compare;\n    this.#data = items.slice();\n    for (let i = (this.#data.length >> 1) - 1; i >= 0; i--) this.#siftDown(i);\n  }\n\n  size() { return this.#data.length; }\n  peek() { return this.#data[0]; }\n\n  push(item) {\n    this.#data.push(item);\n    this.#siftUp(this.#data.length - 1);\n  }\n\n  pop() {\n    const top = this.#data[0];\n    const last = this.#data.pop();\n    if (this.#data.length > 0) {\n      this.#data[0] = last;\n      this.#siftDown(0);\n    }\n    return top;\n  }\n\n  #siftUp(i) {\n    const data = this.#data;\n    while (i > 0) {\n      const parent = (i - 1) >> 1;\n      if (this.#compare(data[i], data[parent]) >= 0) break;\n      [data[i], data[parent]] = [data[parent], data[i]];\n      i = parent;\n    }\n  }\n\n  #siftDown(i) {\n    const data = this.#data;\n    const n = data.length;\n    while (true) {\n      let best = i;\n      const left = 2 * i + 1, right = left + 1;\n      if (left < n && this.#compare(data[left], data[best]) < 0) best = left;\n      if (right < n && this.#compare(data[right], data[best]) < 0) best = right;\n      if (best === i) break;\n      [data[i], data[best]] = [data[best], data[i]];\n      i = best;\n    }\n  }\n}\n",
    "tests": [
      {
        "name": "pops numbers smallest first with an ascending comparator",
        "body": "const h = new Heap((a, b) => a - b);\n[5, 3, 8, 1, 9, 2].forEach((x) => h.push(x));\nconst out = [];\nwhile (h.size() > 0) out.push(h.pop());\nassert.deepEqual(out, [1, 2, 3, 5, 8, 9]);"
      },
      {
        "name": "pops numbers largest first when the comparator is reversed",
        "body": "const h = new Heap((a, b) => b - a);\n[5, 3, 8, 1, 9, 2].forEach((x) => h.push(x));\nconst out = [];\nwhile (h.size() > 0) out.push(h.pop());\nassert.deepEqual(out, [9, 8, 5, 3, 2, 1]);"
      },
      {
        "name": "peek shows the next pop without removing it",
        "body": "const h = new Heap((a, b) => a - b);\nh.push(4);\nh.push(2);\nassert.equal(h.peek(), 2);\nassert.equal(h.size(), 2);\nassert.equal(h.pop(), 2);\nassert.equal(h.peek(), 4);"
      },
      {
        "name": "an empty heap pops and peeks undefined",
        "body": "const h = new Heap((a, b) => a - b);\nassert.equal(h.size(), 0);\nassert.equal(h.pop(), undefined);\nassert.equal(h.peek(), undefined);\nh.push(7);\nassert.equal(h.pop(), 7);\nassert.equal(h.pop(), undefined);\nassert.equal(h.size(), 0);"
      },
      {
        "name": "orders tuples by their first entry only",
        "body": "const h = new Heap((a, b) => a[0] - b[0]);\nh.push([10, 'x']);\nh.push([9, 'y']);\nh.push([100, 'z']);\nassert.equal(h.pop()[1], 'y');\nassert.equal(h.pop()[1], 'x');\nassert.equal(h.pop()[1], 'z');"
      },
      {
        "name": "orders objects by a field and breaks ties with a second key",
        "body": "const h = new Heap((a, b) => b.count - a.count || (a.word < b.word ? -1 : a.word > b.word ? 1 : 0));\nh.push({ word: 'pear', count: 2 });\nh.push({ word: 'apple', count: 2 });\nh.push({ word: 'fig', count: 5 });\nassert.deepEqual([h.pop().word, h.pop().word, h.pop().word], ['fig', 'apple', 'pear']);"
      },
      {
        "name": "heapifies starting items without changing the array it was given",
        "body": "const items = [9, 4, 7, 1, 8, 2, 6];\nconst snapshot = items.slice();\nconst h = new Heap((a, b) => a - b, items);\nassert.deepEqual(items, snapshot);\nassert.equal(h.size(), 7);\nconst out = [];\nwhile (h.size() > 0) out.push(h.pop());\nassert.deepEqual(out, [1, 2, 4, 6, 7, 8, 9]);"
      },
      {
        "name": "starting items and later pushes work together",
        "body": "const h = new Heap((a, b) => a - b, [5, 1, 4]);\nh.push(0);\nh.push(3);\nconst out = [];\nwhile (h.size() > 0) out.push(h.pop());\nassert.deepEqual(out, [0, 1, 3, 4, 5]);"
      },
      {
        "name": "interleaved pushes and pops match a sorted-array model",
        "body": "const h = new Heap((a, b) => a - b);\nconst model = [];\nlet seed = 12345;\nconst next = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed; };\nfor (let step = 0; step < 3000; step++) {\n  if (model.length === 0 || next() % 3 !== 0) {\n    const x = next() % 100;\n    h.push(x);\n    model.push(x);\n    model.sort((a, b) => a - b);\n  } else {\n    assert.equal(h.pop(), model.shift());\n  }\n  assert.equal(h.size(), model.length);\n}"
      },
      {
        "name": "handles many equal items",
        "body": "const h = new Heap((a, b) => a - b);\nfor (let i = 0; i < 50; i++) h.push(3);\nh.push(1);\nassert.equal(h.pop(), 1);\nfor (let i = 0; i < 50; i++) assert.equal(h.pop(), 3);\nassert.equal(h.size(), 0);"
      },
      {
        "name": "sorts a large random array by popping everything",
        "body": "let seed = 7;\nconst next = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed; };\nconst data = Array.from({ length: 5000 }, () => next() % 1000 - 500);\nconst h = new Heap((a, b) => a - b, data);\nconst out = [];\nwhile (h.size() > 0) out.push(h.pop());\nassert.deepEqual(out, data.slice().sort((a, b) => a - b));"
      }
    ]
  },
  {
    "id": "ex-top-k-frequent-words",
    "chapter": "dsa-heaps-priority-queues",
    "level": "intermediate",
    "title": "Top K Frequent Words",
    "brief": "<p>Given an array of <code>words</code> and an integer <code>k</code>, return the <code>k</code> most frequent words.</p><ul><li>Sort the answer by frequency, <b>highest first</b></li><li>Words with the same frequency are ordered <b>alphabetically</b>, by plain JavaScript string comparison (<code>a &lt; b</code>), so <code>\"B\"</code> comes before <code>\"a\"</code></li><li>You may assume <code>1 &lt;= k &lt;= </code> the number of distinct words</li><li>Aim for O(n log k) time: count first, then keep a heap of size <code>k</code>. A heap class is not provided, so write a small one or use a different method that is as fast</li></ul>",
    "starter": "function topKFrequentWords(words, k) {\n  // TODO: count with a Map, then pick the k best by (count desc, word asc)\n}\n",
    "hints": [
      "Count first with a Map. Then the question is how to rank two words: higher count wins, and if the counts are equal the alphabetically smaller word wins.",
      "A heap of size k keeps the k best seen so far if its root is the WORST of them. So the comparator for the heap is the reverse of the ranking: lower count first, and for equal counts the alphabetically larger word first.",
      "Simplest correct answer: take the distinct words, sort them with the ranking comparator, and slice(0, k). The heap version is the same ranking turned around, with a pop whenever the size exceeds k, and the popped items come out worst-first."
    ],
    "solution": "function topKFrequentWords(words, k) {\n  const counts = new Map();\n  for (const w of words) counts.set(w, (counts.get(w) ?? 0) + 1);\n  const better = (a, b) => counts.get(b) - counts.get(a) || (a < b ? -1 : a > b ? 1 : 0);\n  return [...counts.keys()].sort(better).slice(0, k);\n}\n",
    "tests": [
      {
        "name": "two most frequent words",
        "body": "assert.deepEqual(topKFrequentWords(['i', 'love', 'leetcode', 'i', 'love', 'coding'], 2), ['i', 'love']);"
      },
      {
        "name": "four most frequent words, with ties broken alphabetically",
        "body": "assert.deepEqual(topKFrequentWords(['the', 'day', 'is', 'sunny', 'the', 'the', 'the', 'sunny', 'is', 'is'], 4), ['the', 'is', 'sunny', 'day']);"
      },
      {
        "name": "all words tied: alphabetical order",
        "body": "assert.deepEqual(topKFrequentWords(['d', 'b', 'c', 'a'], 3), ['a', 'b', 'c']);"
      },
      {
        "name": "k = 1",
        "body": "assert.deepEqual(topKFrequentWords(['x', 'y', 'y', 'z'], 1), ['y']);"
      },
      {
        "name": "k equals the number of distinct words returns every word in rank order",
        "body": "assert.deepEqual(topKFrequentWords(['b', 'a', 'a', 'c', 'c', 'c'], 3), ['c', 'a', 'b']);"
      },
      {
        "name": "a single word repeated",
        "body": "assert.deepEqual(topKFrequentWords(['go', 'go', 'go'], 1), ['go']);"
      },
      {
        "name": "string comparison is by character code, so uppercase sorts first",
        "body": "assert.deepEqual(topKFrequentWords(['b', 'B', 'a'], 3), ['B', 'a', 'b']);"
      },
      {
        "name": "a tie at the cut keeps the alphabetically smaller word",
        "body": "assert.deepEqual(topKFrequentWords(['pear', 'apple', 'fig', 'fig'], 2), ['fig', 'apple']);"
      },
      {
        "name": "a large input stays correct",
        "body": "const words = [];\nfor (let i = 0; i < 3000; i++) words.push('w' + (i % 300));\nfor (let i = 0; i < 40; i++) words.push('hot');\nconst result = topKFrequentWords(words, 2);\nassert.deepEqual(result, ['hot', 'w0']);"
      }
    ]
  },
  {
    "id": "ex-kth-smallest-sorted-matrix",
    "chapter": "dsa-heaps-priority-queues",
    "level": "intermediate",
    "title": "Kth Smallest Element in a Sorted Matrix",
    "brief": "<p><code>matrix</code> is an <code>n x n</code> grid in which every row is sorted ascending and every column is sorted ascending. Return the <code>k</code>-th smallest value in the whole matrix, counting duplicates (so in <code>[1, 1, 2]</code> the 2nd smallest is <code>1</code>).</p><ul><li><code>k</code> is 1-indexed, with <code>1 &lt;= k &lt;= n * n</code></li><li>Do not flatten and sort the whole matrix. Each row is already a sorted list, so merge the rows with a heap</li><li>A comparator-based <code>Heap</code> class is already written for you</li></ul>",
    "starter": "class Heap {\n  #data = [];\n  #compare;\n\n  constructor(compare) {\n    this.#compare = compare;\n  }\n\n  size() { return this.#data.length; }\n  peek() { return this.#data[0]; }\n\n  push(item) {\n    this.#data.push(item);\n    let i = this.#data.length - 1;\n    while (i > 0) {\n      const parent = (i - 1) >> 1;\n      if (this.#compare(this.#data[i], this.#data[parent]) >= 0) break;\n      [this.#data[i], this.#data[parent]] = [this.#data[parent], this.#data[i]];\n      i = parent;\n    }\n  }\n\n  pop() {\n    const data = this.#data;\n    const top = data[0];\n    const last = data.pop();\n    if (data.length > 0) {\n      data[0] = last;\n      let i = 0;\n      while (true) {\n        let best = i;\n        const left = 2 * i + 1, right = left + 1;\n        if (left < data.length && this.#compare(data[left], data[best]) < 0) best = left;\n        if (right < data.length && this.#compare(data[right], data[best]) < 0) best = right;\n        if (best === i) break;\n        [data[i], data[best]] = [data[best], data[i]];\n        i = best;\n      }\n    }\n    return top;\n  }\n}\n\nfunction kthSmallest(matrix, k) {\n  // TODO: seed a heap with the first entry of each row, then pop k times\n}\n",
    "hints": [
      "Every row is a sorted list. The smallest unseen value overall is always at the front of some row, so this is the k-way merge from the chapter.",
      "Push [value, row, column] for column 0 of every row. Pop k times; after each pop, push the next entry of the SAME row if there is one. The k-th value you pop is the answer.",
      "You can seed only the first min(n, k) rows, because the k-th smallest cannot come from a row after the k-th row. That keeps the heap at most k entries and the cost at O(k log min(n, k))."
    ],
    "solution": "class Heap {\n  #data = [];\n  #compare;\n\n  constructor(compare) {\n    this.#compare = compare;\n  }\n\n  size() { return this.#data.length; }\n  peek() { return this.#data[0]; }\n\n  push(item) {\n    this.#data.push(item);\n    let i = this.#data.length - 1;\n    while (i > 0) {\n      const parent = (i - 1) >> 1;\n      if (this.#compare(this.#data[i], this.#data[parent]) >= 0) break;\n      [this.#data[i], this.#data[parent]] = [this.#data[parent], this.#data[i]];\n      i = parent;\n    }\n  }\n\n  pop() {\n    const data = this.#data;\n    const top = data[0];\n    const last = data.pop();\n    if (data.length > 0) {\n      data[0] = last;\n      let i = 0;\n      while (true) {\n        let best = i;\n        const left = 2 * i + 1, right = left + 1;\n        if (left < data.length && this.#compare(data[left], data[best]) < 0) best = left;\n        if (right < data.length && this.#compare(data[right], data[best]) < 0) best = right;\n        if (best === i) break;\n        [data[i], data[best]] = [data[best], data[i]];\n        i = best;\n      }\n    }\n    return top;\n  }\n}\n\nfunction kthSmallest(matrix, k) {\n  const n = matrix.length;\n  const heap = new Heap((a, b) => a[0] - b[0]);\n  for (let r = 0; r < Math.min(n, k); r++) heap.push([matrix[r][0], r, 0]);\n  let value = 0;\n  for (let i = 0; i < k; i++) {\n    const [v, r, c] = heap.pop();\n    value = v;\n    if (c + 1 < n) heap.push([matrix[r][c + 1], r, c + 1]);\n  }\n  return value;\n}\n",
    "tests": [
      {
        "name": "the classic 3 x 3 example, k = 8",
        "body": "assert.equal(kthSmallest([[1, 5, 9], [10, 11, 13], [12, 13, 15]], 8), 13);"
      },
      {
        "name": "a single cell",
        "body": "assert.equal(kthSmallest([[-5]], 1), -5);"
      },
      {
        "name": "k = 1 is the top-left corner",
        "body": "assert.equal(kthSmallest([[1, 2], [1, 3]], 1), 1);"
      },
      {
        "name": "k = n * n is the bottom-right corner",
        "body": "assert.equal(kthSmallest([[1, 2], [1, 3]], 4), 3);"
      },
      {
        "name": "duplicates are counted",
        "body": "assert.equal(kthSmallest([[1, 2], [1, 3]], 2), 1);\nassert.equal(kthSmallest([[1, 2], [1, 3]], 3), 2);"
      },
      {
        "name": "all values equal",
        "body": "assert.equal(kthSmallest([[7, 7, 7], [7, 7, 7], [7, 7, 7]], 5), 7);"
      },
      {
        "name": "negative numbers",
        "body": "assert.equal(kthSmallest([[-9, -5], [-7, -1]], 2), -7);"
      },
      {
        "name": "agrees with sorting the flattened matrix on a random sorted matrix",
        "body": "let seed = 99;\nconst next = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed; };\nconst n = 12;\nconst m = Array.from({ length: n }, () => Array(n).fill(0));\nfor (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {\n  const up = r > 0 ? m[r - 1][c] : 0;\n  const left = c > 0 ? m[r][c - 1] : 0;\n  m[r][c] = Math.max(up, left) + next() % 4;\n}\nconst flat = m.flat().sort((a, b) => a - b);\nfor (const k of [1, 2, 17, 60, 143, 144]) assert.equal(kthSmallest(m, k), flat[k - 1]);"
      }
    ]
  },
  {
    "id": "ex-merge-k-sorted-arrays",
    "chapter": "dsa-heaps-priority-queues",
    "level": "intermediate",
    "title": "Merge K Sorted Arrays",
    "brief": "<p>You are given <code>arrays</code>, a list of <code>k</code> arrays that are each sorted ascending. Return one sorted array that holds every element of all of them.</p><ul><li>Some arrays may be empty, and <code>arrays</code> itself may be empty</li><li>Duplicates must all be kept</li><li>Target O(N log k) time for N elements in total. Sorting the concatenation is O(N log N), which is not the point of the exercise</li><li>A comparator-based <code>Heap</code> class is already written for you</li></ul>",
    "starter": "class Heap {\n  #data = [];\n  #compare;\n\n  constructor(compare) {\n    this.#compare = compare;\n  }\n\n  size() { return this.#data.length; }\n  peek() { return this.#data[0]; }\n\n  push(item) {\n    this.#data.push(item);\n    let i = this.#data.length - 1;\n    while (i > 0) {\n      const parent = (i - 1) >> 1;\n      if (this.#compare(this.#data[i], this.#data[parent]) >= 0) break;\n      [this.#data[i], this.#data[parent]] = [this.#data[parent], this.#data[i]];\n      i = parent;\n    }\n  }\n\n  pop() {\n    const data = this.#data;\n    const top = data[0];\n    const last = data.pop();\n    if (data.length > 0) {\n      data[0] = last;\n      let i = 0;\n      while (true) {\n        let best = i;\n        const left = 2 * i + 1, right = left + 1;\n        if (left < data.length && this.#compare(data[left], data[best]) < 0) best = left;\n        if (right < data.length && this.#compare(data[right], data[best]) < 0) best = right;\n        if (best === i) break;\n        [data[i], data[best]] = [data[best], data[i]];\n        i = best;\n      }\n    }\n    return top;\n  }\n}\n\nfunction mergeKSortedArrays(arrays) {\n  // TODO: a heap holding the front element of each array\n}\n",
    "hints": [
      "The next element of the output is always the front of one of the arrays. So keep the fronts of all arrays in a min-heap.",
      "Each heap entry needs three things: the value, which array it came from, and its position there: [value, arrayIndex, position]. Compare entries by the value.",
      "Pop the smallest entry, append its value to the output, and push the next element of that same array if there is one. Do not push anything for an empty array, or you will push undefined."
    ],
    "solution": "class Heap {\n  #data = [];\n  #compare;\n\n  constructor(compare) {\n    this.#compare = compare;\n  }\n\n  size() { return this.#data.length; }\n  peek() { return this.#data[0]; }\n\n  push(item) {\n    this.#data.push(item);\n    let i = this.#data.length - 1;\n    while (i > 0) {\n      const parent = (i - 1) >> 1;\n      if (this.#compare(this.#data[i], this.#data[parent]) >= 0) break;\n      [this.#data[i], this.#data[parent]] = [this.#data[parent], this.#data[i]];\n      i = parent;\n    }\n  }\n\n  pop() {\n    const data = this.#data;\n    const top = data[0];\n    const last = data.pop();\n    if (data.length > 0) {\n      data[0] = last;\n      let i = 0;\n      while (true) {\n        let best = i;\n        const left = 2 * i + 1, right = left + 1;\n        if (left < data.length && this.#compare(data[left], data[best]) < 0) best = left;\n        if (right < data.length && this.#compare(data[right], data[best]) < 0) best = right;\n        if (best === i) break;\n        [data[i], data[best]] = [data[best], data[i]];\n        i = best;\n      }\n    }\n    return top;\n  }\n}\n\nfunction mergeKSortedArrays(arrays) {\n  const heap = new Heap((a, b) => a[0] - b[0]);\n  arrays.forEach((arr, i) => {\n    if (arr.length > 0) heap.push([arr[0], i, 0]);\n  });\n  const merged = [];\n  while (heap.size() > 0) {\n    const [value, i, j] = heap.pop();\n    merged.push(value);\n    if (j + 1 < arrays[i].length) heap.push([arrays[i][j + 1], i, j + 1]);\n  }\n  return merged;\n}\n",
    "tests": [
      {
        "name": "three sorted arrays",
        "body": "assert.deepEqual(mergeKSortedArrays([[1, 4, 7], [2, 5], [3, 6, 9]]), [1, 2, 3, 4, 5, 6, 7, 9]);"
      },
      {
        "name": "no arrays at all",
        "body": "assert.deepEqual(mergeKSortedArrays([]), []);"
      },
      {
        "name": "only empty arrays",
        "body": "assert.deepEqual(mergeKSortedArrays([[], [], []]), []);"
      },
      {
        "name": "empty arrays mixed with full ones",
        "body": "assert.deepEqual(mergeKSortedArrays([[], [2, 3], [], [1]]), [1, 2, 3]);"
      },
      {
        "name": "a single array comes back unchanged",
        "body": "assert.deepEqual(mergeKSortedArrays([[1, 2, 2, 5]]), [1, 2, 2, 5]);"
      },
      {
        "name": "duplicates across arrays are all kept",
        "body": "assert.deepEqual(mergeKSortedArrays([[1, 1, 2], [1, 2, 2]]), [1, 1, 1, 2, 2, 2]);"
      },
      {
        "name": "negative numbers",
        "body": "assert.deepEqual(mergeKSortedArrays([[-5, -1], [-3, 0], [-4]]), [-5, -4, -3, -1, 0]);"
      },
      {
        "name": "does not change the input arrays",
        "body": "const input = [[1, 3], [2]];\nmergeKSortedArrays(input);\nassert.deepEqual(input, [[1, 3], [2]]);"
      },
      {
        "name": "many arrays of random sorted numbers",
        "body": "let seed = 5;\nconst next = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed; };\nconst arrays = Array.from({ length: 60 }, () => Array.from({ length: next() % 40 }, () => next() % 500).sort((a, b) => a - b));\nconst expected = arrays.flat().sort((a, b) => a - b);\nassert.deepEqual(mergeKSortedArrays(arrays), expected);"
      }
    ]
  },
  {
    "id": "ex-sliding-window-median",
    "chapter": "dsa-heaps-priority-queues",
    "level": "advanced",
    "title": "Sliding Window Median",
    "brief": "<p>For every window of <code>k</code> consecutive numbers in <code>nums</code>, report its median. The window starts at the left and moves right one position at a time. Return the array of medians.</p><ul><li>For an <b>odd</b> <code>k</code> the median is the middle number of the sorted window</li><li>For an <b>even</b> <code>k</code> it is the average of the two middle numbers (so it can end in <code>.5</code>)</li><li><code>1 &lt;= k &lt;= nums.length</code>. The numbers can be negative and can repeat, and can be as large as <code>2147483647</code></li><li>Sorting every window is O(n k log k). Aim for O(n log n) with two heaps and <b>lazy deletion</b>: a number that leaves the window is only marked dead, and is removed for real when it reaches the top of its heap</li><li>A comparator-based <code>Heap</code> class is already written for you</li></ul>",
    "starter": "class Heap {\n  #data = [];\n  #compare;\n\n  constructor(compare) {\n    this.#compare = compare;\n  }\n\n  size() { return this.#data.length; }\n  peek() { return this.#data[0]; }\n\n  push(item) {\n    this.#data.push(item);\n    let i = this.#data.length - 1;\n    while (i > 0) {\n      const parent = (i - 1) >> 1;\n      if (this.#compare(this.#data[i], this.#data[parent]) >= 0) break;\n      [this.#data[i], this.#data[parent]] = [this.#data[parent], this.#data[i]];\n      i = parent;\n    }\n  }\n\n  pop() {\n    const data = this.#data;\n    const top = data[0];\n    const last = data.pop();\n    if (data.length > 0) {\n      data[0] = last;\n      let i = 0;\n      while (true) {\n        let best = i;\n        const left = 2 * i + 1, right = left + 1;\n        if (left < data.length && this.#compare(data[left], data[best]) < 0) best = left;\n        if (right < data.length && this.#compare(data[right], data[best]) < 0) best = right;\n        if (best === i) break;\n        [data[i], data[best]] = [data[best], data[i]];\n        i = best;\n      }\n    }\n    return top;\n  }\n}\n\nfunction medianSlidingWindow(nums, k) {\n  // TODO: two heaps, live counts, and a Map of how many copies of each value are dead\n}\n",
    "hints": [
      "Keep a max-heap for the lower half and a min-heap for the upper half, like the running median, but also keep two numbers saying how many LIVE entries each heap holds. heap.size() counts dead entries too, so you cannot balance with it.",
      "To remove x: add one to dead.get(x); decide which half it belongs to by comparing it with the top of the lower heap (x <= lower.peek() means lower), reduce that half's live count, and prune that heap's top if the top is now dead. Then rebalance so the live counts differ by at most one, with the lower half allowed one extra.",
      "Pruning means: while the heap's top has dead.get(top) > 0, pop it and subtract one from its dead count. Do it after every rebalance move too, because the entry you just moved could have exposed a dead entry on the other heap's top."
    ],
    "solution": "class Heap {\n  #data = [];\n  #compare;\n\n  constructor(compare) {\n    this.#compare = compare;\n  }\n\n  size() { return this.#data.length; }\n  peek() { return this.#data[0]; }\n\n  push(item) {\n    this.#data.push(item);\n    let i = this.#data.length - 1;\n    while (i > 0) {\n      const parent = (i - 1) >> 1;\n      if (this.#compare(this.#data[i], this.#data[parent]) >= 0) break;\n      [this.#data[i], this.#data[parent]] = [this.#data[parent], this.#data[i]];\n      i = parent;\n    }\n  }\n\n  pop() {\n    const data = this.#data;\n    const top = data[0];\n    const last = data.pop();\n    if (data.length > 0) {\n      data[0] = last;\n      let i = 0;\n      while (true) {\n        let best = i;\n        const left = 2 * i + 1, right = left + 1;\n        if (left < data.length && this.#compare(data[left], data[best]) < 0) best = left;\n        if (right < data.length && this.#compare(data[right], data[best]) < 0) best = right;\n        if (best === i) break;\n        [data[i], data[best]] = [data[best], data[i]];\n        i = best;\n      }\n    }\n    return top;\n  }\n}\n\nfunction medianSlidingWindow(nums, k) {\n  const small = new Heap((a, b) => b - a);\n  const large = new Heap((a, b) => a - b);\n  const owed = new Map();\n  let smallLive = 0, largeLive = 0;\n\n  const prune = (heap) => {\n    while (heap.size() > 0 && (owed.get(heap.peek()) ?? 0) > 0) {\n      owed.set(heap.peek(), owed.get(heap.peek()) - 1);\n      heap.pop();\n    }\n  };\n  const rebalance = () => {\n    if (smallLive > largeLive + 1) {\n      large.push(small.pop());\n      smallLive--; largeLive++;\n      prune(small);\n    } else if (smallLive < largeLive) {\n      small.push(large.pop());\n      largeLive--; smallLive++;\n      prune(large);\n    }\n  };\n  const add = (x) => {\n    if (smallLive === 0 || x <= small.peek()) { small.push(x); smallLive++; }\n    else { large.push(x); largeLive++; }\n    rebalance();\n  };\n  const remove = (x) => {\n    owed.set(x, (owed.get(x) ?? 0) + 1);\n    if (x <= small.peek()) {\n      smallLive--;\n      if (x === small.peek()) prune(small);\n    } else {\n      largeLive--;\n      if (x === large.peek()) prune(large);\n    }\n    rebalance();\n  };\n\n  const medians = [];\n  for (let i = 0; i < nums.length; i++) {\n    add(nums[i]);\n    if (i >= k) remove(nums[i - k]);\n    if (i >= k - 1) medians.push(k % 2 === 1 ? small.peek() : (small.peek() + large.peek()) / 2);\n  }\n  return medians;\n}\n",
    "tests": [
      {
        "name": "the classic example with k = 3",
        "body": "assert.deepEqual(medianSlidingWindow([1, 3, -1, -3, 5, 3, 6, 7], 3), [1, -1, -1, 3, 5, 6]);"
      },
      {
        "name": "even k averages the two middle numbers",
        "body": "assert.deepEqual(medianSlidingWindow([1, 2, 3, 4, 2, 3, 1, 4, 2], 3), [2, 3, 3, 3, 2, 3, 2]);\nassert.deepEqual(medianSlidingWindow([1, 2], 2), [1.5]);\nassert.deepEqual(medianSlidingWindow([1, 4, 2, 3], 4), [2.5]);"
      },
      {
        "name": "k = 1 returns the numbers themselves",
        "body": "assert.deepEqual(medianSlidingWindow([4, -2, 7], 1), [4, -2, 7]);"
      },
      {
        "name": "k equals the length gives one median",
        "body": "assert.deepEqual(medianSlidingWindow([5, 1, 9, 3, 7], 5), [5]);"
      },
      {
        "name": "a window of a single repeated value",
        "body": "assert.deepEqual(medianSlidingWindow([2, 2, 2, 2, 2], 2), [2, 2, 2, 2]);\nassert.deepEqual(medianSlidingWindow([2, 2, 2, 2, 2], 3), [2, 2, 2]);"
      },
      {
        "name": "a number leaving from the middle of a heap is handled",
        "body": "assert.deepEqual(medianSlidingWindow([2, 8, 4, 5], 3), [4, 5]);"
      },
      {
        "name": "large values do not overflow when averaged",
        "body": "assert.deepEqual(medianSlidingWindow([2147483647, 2147483647], 2), [2147483647]);\nassert.deepEqual(medianSlidingWindow([-2147483648, 2147483647], 2), [-0.5]);"
      },
      {
        "name": "duplicates on both sides of the median",
        "body": "assert.deepEqual(medianSlidingWindow([1, 1, 1, 2, 2, 2, 1, 1, 1], 4), [1, 1.5, 2, 2, 1.5, 1]);"
      },
      {
        "name": "matches sorting every window on random input",
        "body": "let seed = 31;\nconst next = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed; };\nfor (let t = 0; t < 40; t++) {\n  const n = 1 + next() % 60;\n  const nums = Array.from({ length: n }, () => next() % 7 - 3);\n  const k = 1 + next() % n;\n  const expected = [];\n  for (let i = 0; i + k <= n; i++) {\n    const w = nums.slice(i, i + k).sort((a, b) => a - b);\n    expected.push(k % 2 === 1 ? w[(k - 1) / 2] : (w[k / 2 - 1] + w[k / 2]) / 2);\n  }\n  assert.deepEqual(medianSlidingWindow(nums, k), expected);\n}"
      }
    ]
  },
  {
    "id": "ex-heapsort-in-place",
    "chapter": "dsa-heaps-priority-queues",
    "level": "intermediate",
    "title": "Heapsort in Place",
    "brief": "<p>Write <code>heapSort(arr)</code>: sort an array of numbers ascending using a heap built <b>inside the same array</b>, then return that array.</p><ul><li>Sort <b>in place</b>: the function must mutate and return the array it was given, not a copy, and use only O(1) extra space. A separate heap object is not allowed</li><li>Do <b>not</b> use <code>Array.prototype.sort</code> or build a second array. The tests make <code>sort</code> throw</li><li>The numbers can be negative, can repeat, and the array may be empty</li><li>Worst case O(n log n)</li></ul>",
    "starter": "function heapSort(arr) {\n  // TODO: build a max-heap in arr, then repeatedly swap the root to the end and sift down\n}\n",
    "hints": [
      "Use a MAX-heap inside arr[0..n-1]. The largest value is at index 0, and the final sorted position of the largest value is the last index.",
      "Step 1: build the heap bottom-up: for i from (n >> 1) - 1 down to 0, siftDown(arr, i, n). Step 2: for end from n - 1 down to 1, swap arr[0] and arr[end], then siftDown(arr, 0, end) so the heap is only arr[0..end - 1].",
      "Write siftDown(arr, i, size) so it only looks at children with index < size. The children of i are 2i + 1 and 2i + 2. Stop when neither child is larger than arr[i]."
    ],
    "solution": "function siftDown(arr, i, n) {\n  while (true) {\n    let largest = i;\n    const left = 2 * i + 1, right = left + 1;\n    if (left < n && arr[left] > arr[largest]) largest = left;\n    if (right < n && arr[right] > arr[largest]) largest = right;\n    if (largest === i) break;\n    [arr[i], arr[largest]] = [arr[largest], arr[i]];\n    i = largest;\n  }\n}\n\nfunction heapSort(arr) {\n  const n = arr.length;\n  for (let i = (n >> 1) - 1; i >= 0; i--) siftDown(arr, i, n);\n  for (let end = n - 1; end > 0; end--) {\n    [arr[0], arr[end]] = [arr[end], arr[0]];\n    siftDown(arr, 0, end);\n  }\n  return arr;\n}\n",
    "tests": [
      {
        "name": "sorts a small array",
        "body": "assert.deepEqual(heapSort([4, 10, 3, 5, 1]), [1, 3, 4, 5, 10]);"
      },
      {
        "name": "returns the very array it was given",
        "body": "const a = [3, 1, 2];\nconst result = heapSort(a);\nassert.equal(result, a);\nassert.deepEqual(a, [1, 2, 3]);"
      },
      {
        "name": "empty and single-element arrays",
        "body": "assert.deepEqual(heapSort([]), []);\nassert.deepEqual(heapSort([42]), [42]);"
      },
      {
        "name": "already sorted and reverse sorted input",
        "body": "assert.deepEqual(heapSort([1, 2, 3, 4, 5, 6]), [1, 2, 3, 4, 5, 6]);\nassert.deepEqual(heapSort([6, 5, 4, 3, 2, 1]), [1, 2, 3, 4, 5, 6]);"
      },
      {
        "name": "duplicates",
        "body": "assert.deepEqual(heapSort([3, 1, 3, 2, 1, 3]), [1, 1, 2, 3, 3, 3]);\nassert.deepEqual(heapSort([5, 5, 5, 5]), [5, 5, 5, 5]);"
      },
      {
        "name": "negative numbers",
        "body": "assert.deepEqual(heapSort([0, -3, 7, -10, 2]), [-10, -3, 0, 2, 7]);"
      },
      {
        "name": "two elements",
        "body": "assert.deepEqual(heapSort([2, 1]), [1, 2]);\nassert.deepEqual(heapSort([1, 2]), [1, 2]);"
      },
      {
        "name": "does not call Array.prototype.sort",
        "body": "const realSort = Array.prototype.sort;\nlet result;\ntry {\n  Array.prototype.sort = function () { throw new Error('heapSort must not call sort'); };\n  result = heapSort([9, 2, 7, 4, 5]);\n} finally {\n  Array.prototype.sort = realSort;\n}\nassert.deepEqual(result, [2, 4, 5, 7, 9]);"
      },
      {
        "name": "sorts a large random array correctly",
        "body": "let seed = 3;\nconst next = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed; };\nconst data = Array.from({ length: 4000 }, () => next() % 2000 - 1000);\nconst expected = data.slice().sort((a, b) => a - b);\nassert.deepEqual(heapSort(data), expected);"
      }
    ]
  },
  {
    "id": "ex-single-threaded-cpu",
    "chapter": "dsa-heaps-priority-queues",
    "level": "advanced",
    "title": "Single-Threaded CPU",
    "brief": "<p><code>tasks[i] = [enqueueTime, processingTime]</code>: task <code>i</code> becomes available at <code>enqueueTime</code> and then needs <code>processingTime</code> uninterrupted time units. A single CPU runs them like this:</p><ul><li>If the CPU is idle and no task is available, it waits until the next task becomes available</li><li>If the CPU is idle and some tasks are available, it starts the one with the <b>shortest processing time</b>. Ties go to the task with the <b>smallest index</b></li><li>Once started, a task runs to completion, and the CPU may start the next one the moment it finishes</li></ul><p>Return the <b>order of task indexes</b> in which the CPU runs them. Aim for O(n log n).</p><p>A comparator-based <code>Heap</code> class is already written for you.</p>",
    "starter": "class Heap {\n  #data = [];\n  #compare;\n\n  constructor(compare) {\n    this.#compare = compare;\n  }\n\n  size() { return this.#data.length; }\n  peek() { return this.#data[0]; }\n\n  push(item) {\n    this.#data.push(item);\n    let i = this.#data.length - 1;\n    while (i > 0) {\n      const parent = (i - 1) >> 1;\n      if (this.#compare(this.#data[i], this.#data[parent]) >= 0) break;\n      [this.#data[i], this.#data[parent]] = [this.#data[parent], this.#data[i]];\n      i = parent;\n    }\n  }\n\n  pop() {\n    const data = this.#data;\n    const top = data[0];\n    const last = data.pop();\n    if (data.length > 0) {\n      data[0] = last;\n      let i = 0;\n      while (true) {\n        let best = i;\n        const left = 2 * i + 1, right = left + 1;\n        if (left < data.length && this.#compare(data[left], data[best]) < 0) best = left;\n        if (right < data.length && this.#compare(data[right], data[best]) < 0) best = right;\n        if (best === i) break;\n        [data[i], data[best]] = [data[best], data[i]];\n        i = best;\n      }\n    }\n    return top;\n  }\n}\n\nfunction getOrder(tasks) {\n  // TODO: sort task indexes by enqueue time, and keep the available ones in a heap\n}\n",
    "hints": [
      "The CPU only ever chooses among the tasks whose enqueue time has already passed. Sort the indexes by enqueue time so that you can release tasks into the heap as the clock moves forward.",
      "Loop: while the heap is empty and tasks remain, jump the clock forward to the next enqueue time. Then push every task with enqueueTime <= clock as [processingTime, index]. Pop the best, add its processing time to the clock, and record its index.",
      "The heap comparator compares processing time first and the index second: (a, b) => a[0] - b[0] || a[1] - b[1]. Do not forget the idle jump, or the loop will spin forever when there is a gap between tasks."
    ],
    "solution": "class Heap {\n  #data = [];\n  #compare;\n\n  constructor(compare) {\n    this.#compare = compare;\n  }\n\n  size() { return this.#data.length; }\n  peek() { return this.#data[0]; }\n\n  push(item) {\n    this.#data.push(item);\n    let i = this.#data.length - 1;\n    while (i > 0) {\n      const parent = (i - 1) >> 1;\n      if (this.#compare(this.#data[i], this.#data[parent]) >= 0) break;\n      [this.#data[i], this.#data[parent]] = [this.#data[parent], this.#data[i]];\n      i = parent;\n    }\n  }\n\n  pop() {\n    const data = this.#data;\n    const top = data[0];\n    const last = data.pop();\n    if (data.length > 0) {\n      data[0] = last;\n      let i = 0;\n      while (true) {\n        let best = i;\n        const left = 2 * i + 1, right = left + 1;\n        if (left < data.length && this.#compare(data[left], data[best]) < 0) best = left;\n        if (right < data.length && this.#compare(data[right], data[best]) < 0) best = right;\n        if (best === i) break;\n        [data[i], data[best]] = [data[best], data[i]];\n        i = best;\n      }\n    }\n    return top;\n  }\n}\n\nfunction getOrder(tasks) {\n  const byEnqueue = tasks.map((_, i) => i).sort((a, b) => tasks[a][0] - tasks[b][0] || a - b);\n  const heap = new Heap((a, b) => a[0] - b[0] || a[1] - b[1]);\n  const order = [];\n  let clock = 0;\n  let next = 0;\n  while (order.length < tasks.length) {\n    if (heap.size() === 0 && clock < tasks[byEnqueue[next]][0]) clock = tasks[byEnqueue[next]][0];\n    while (next < tasks.length && tasks[byEnqueue[next]][0] <= clock) {\n      const i = byEnqueue[next++];\n      heap.push([tasks[i][1], i]);\n    }\n    const [duration, index] = heap.pop();\n    clock += duration;\n    order.push(index);\n  }\n  return order;\n}\n",
    "tests": [
      {
        "name": "the classic example",
        "body": "assert.deepEqual(getOrder([[1, 2], [2, 4], [3, 2], [4, 1]]), [0, 2, 3, 1]);"
      },
      {
        "name": "tasks that all arrive together run shortest first, ties by index",
        "body": "assert.deepEqual(getOrder([[7, 10], [7, 12], [7, 5], [7, 4], [7, 2]]), [4, 3, 2, 0, 1]);\nassert.deepEqual(getOrder([[0, 3], [0, 3], [0, 3]]), [0, 1, 2]);"
      },
      {
        "name": "a single task",
        "body": "assert.deepEqual(getOrder([[5, 2]]), [0]);"
      },
      {
        "name": "the CPU idles across a gap between tasks",
        "body": "assert.deepEqual(getOrder([[0, 1], [100, 1], [50, 1]]), [0, 2, 1]);"
      },
      {
        "name": "a long task blocks a shorter one that arrives while it runs",
        "body": "assert.deepEqual(getOrder([[0, 10], [1, 1], [2, 2]]), [0, 1, 2]);"
      },
      {
        "name": "tasks given out of order of arrival",
        "body": "assert.deepEqual(getOrder([[3, 1], [1, 1], [2, 1]]), [1, 2, 0]);"
      },
      {
        "name": "a task that arrives exactly when the previous one finishes can start at once",
        "body": "assert.deepEqual(getOrder([[0, 5], [5, 1], [5, 9]]), [0, 1, 2]);"
      },
      {
        "name": "does not change the input tasks",
        "body": "const tasks = [[2, 3], [0, 1]];\ngetOrder(tasks);\nassert.deepEqual(tasks, [[2, 3], [0, 1]]);"
      },
      {
        "name": "matches a simple simulation on random input",
        "body": "let seed = 21;\nconst next = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed; };\nfor (let t = 0; t < 30; t++) {\n  const n = 1 + next() % 25;\n  const tasks = Array.from({ length: n }, () => [next() % 30, 1 + next() % 6]);\n  const left = new Set(tasks.map((_, i) => i));\n  const expected = [];\n  let clock = 0;\n  while (left.size > 0) {\n    let best = -1;\n    for (const i of left) {\n      if (tasks[i][0] > clock) continue;\n      if (best === -1 || tasks[i][1] < tasks[best][1] || (tasks[i][1] === tasks[best][1] && i < best)) best = i;\n    }\n    if (best === -1) {\n      clock = Math.min(...[...left].map((i) => tasks[i][0]));\n      continue;\n    }\n    left.delete(best);\n    expected.push(best);\n    clock += tasks[best][1];\n  }\n  assert.deepEqual(getOrder(tasks), expected);\n}"
      }
    ]
  }
];
