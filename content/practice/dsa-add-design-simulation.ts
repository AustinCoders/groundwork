import type { Exercise } from "../types";

export const dsaAddDesignSimulation: Exercise[] = [
  {
    "id": "ex-lazy-flatten-generator",
    "chapter": "dsa-design-simulation",
    "level": "beginner",
    "title": "Lazy Flatten with a Generator",
    "brief": "<p>Write <code>flattenLazy(list)</code>, a <b>generator function</b> that yields every non-array value of a nested array, in order, at any depth.</p><ul><li><code>[...flattenLazy([[1, 1], 2, [1, 1]])]</code> is <code>[1, 1, 2, 1, 1]</code></li><li>It must be lazy: asking for the first value must not read the items after it</li><li>Only arrays are unwrapped. A string such as <code>\"ab\"</code> is a value and is yielded whole, and <code>0</code>, <code>false</code> and <code>null</code> are values too</li><li>Do not build the flat array first and then yield from it</li></ul>",
    "starter": "function* flattenLazy(list) {\n  // TODO: yield each value; hand arrays over to a nested call\n}\n",
    "hints": [
      "A generator pauses at every yield, so the 'where was I' state is kept for you. Loop over the items and yield the plain ones.",
      "For an item that is an array, you need to yield everything the nested call yields. yield* followed by a nested flattenLazy(item) does exactly that.",
      "Test with Array.isArray, not with typeof or a truthiness check: a string is iterable but must be yielded whole, and 0 must not be skipped."
    ],
    "solution": "function* flattenLazy(list) {\n  for (const item of list) {\n    if (Array.isArray(item)) yield* flattenLazy(item);\n    else yield item;\n  }\n}\n",
    "tests": [
      {
        "name": "the standard example",
        "body": "assert.deepEqual([...flattenLazy([[1, 1], 2, [1, 1]])], [1, 1, 2, 1, 1]);"
      },
      {
        "name": "mixed depths",
        "body": "assert.deepEqual([...flattenLazy([1, [2, [3, [4, [5]]]], 6])], [1, 2, 3, 4, 5, 6]);"
      },
      {
        "name": "empty arrays contribute nothing",
        "body": "assert.deepEqual([...flattenLazy([])], []);\nassert.deepEqual([...flattenLazy([[], [[]], [[], []]])], []);"
      },
      {
        "name": "falsy values and strings are values",
        "body": "assert.deepEqual([...flattenLazy([0, [false], [[null, '']], 'ab', ['cd']])], [0, false, null, '', 'ab', 'cd']);"
      },
      {
        "name": "it returns an iterator that produces values one at a time",
        "body": "const it = flattenLazy([1, [2, 3]]);\nassert.equal(typeof it.next, 'function');\nassert.deepEqual(it.next(), { value: 1, done: false });\nassert.deepEqual(it.next(), { value: 2, done: false });\nassert.deepEqual(it.next(), { value: 3, done: false });\nassert.equal(it.next().done, true);"
      },
      {
        "name": "it does not read items it has not been asked for",
        "body": "const list = [1, [2]];\nObject.defineProperty(list, 2, { get() { throw new Error('read too early'); } });\nconst it = flattenLazy(list);\nassert.equal(it.next().value, 1);\nassert.equal(it.next().value, 2);"
      },
      {
        "name": "a list nested a thousand levels deep",
        "body": "let nested = [9];\nfor (let i = 0; i < 1000; i++) nested = [nested];\nassert.deepEqual([...flattenLazy(nested)], [9]);"
      },
      {
        "name": "random nested arrays against a flatMap reference",
        "body": "let seed = 20261013;\nconst rand = (n) => { seed = (seed * 16807) % 2147483647; return seed % n; };\nconst build = (depth) => Array.from({ length: rand(5) }, () => (depth < 4 && rand(3) === 0 ? build(depth + 1) : rand(30)));\nconst flat = (x) => x.flatMap((v) => (Array.isArray(v) ? flat(v) : [v]));\nfor (let t = 0; t < 300; t++) {\n  const nested = build(0);\n  assert.deepEqual([...flattenLazy(nested)], flat(nested));\n}"
      }
    ]
  },
  {
    "id": "ex-nested-list-iterator",
    "chapter": "dsa-design-simulation",
    "level": "intermediate",
    "title": "Flatten Nested List Iterator",
    "brief": "<p>A nested list holds integers and, recursively, further nested lists: <code>[[1, 1], 2, [1, 1]]</code>. Write an iterator that returns the integers in order, one at a time.</p><ul><li><code>new NestedIterator(nestedList)</code></li><li><code>hasNext()</code> - <code>true</code> if another integer remains. It must be correct for lists such as <code>[[], [[]]]</code>, and calling it twice in a row must change nothing</li><li><code>next()</code> - the next integer. Throw an <code>Error</code> when there is none</li><li>Be lazy: the constructor must not read the items, and the memory should be proportional to the nesting depth, not to the number of integers</li></ul>",
    "starter": "class NestedIterator {\n  constructor(nestedList) {\n    // TODO: keep only enough state to find the next integer\n  }\n\n  hasNext() {\n    // TODO: advance until the next integer, or report that there is none\n  }\n\n  next() {\n    // TODO\n  }\n}\n",
    "hints": [
      "A position inside a nested list is a path: an index in the outer list, then an index in the list inside it. A stack of (list, index) pairs holds exactly that.",
      "Let hasNext do the work. While the stack is not empty look at the top frame: if its index is past the end, pop it; if the item is a list, push a frame for it (and advance the parent's index); otherwise stop and return true.",
      "next() calls hasNext() first and then reads the item under the top frame and advances that frame's index. Test with Array.isArray, never with a truthiness check, because 0 is an integer."
    ],
    "solution": "class NestedIterator {\n  constructor(nestedList) {\n    this.stack = [{ list: nestedList, index: 0 }];\n  }\n\n  hasNext() {\n    while (this.stack.length > 0) {\n      const top = this.stack[this.stack.length - 1];\n      if (top.index === top.list.length) {\n        this.stack.pop();\n      } else if (Array.isArray(top.list[top.index])) {\n        this.stack.push({ list: top.list[top.index], index: 0 });\n        top.index++;\n      } else {\n        return true;\n      }\n    }\n    return false;\n  }\n\n  next() {\n    if (!this.hasNext()) throw new Error('no more values');\n    const top = this.stack[this.stack.length - 1];\n    return top.list[top.index++];\n  }\n}\n",
    "tests": [
      {
        "name": "the standard example",
        "body": "const it = new NestedIterator([[1, 1], 2, [1, 1]]);\nconst out = [];\nwhile (it.hasNext()) out.push(it.next());\nassert.deepEqual(out, [1, 1, 2, 1, 1]);"
      },
      {
        "name": "deeper nesting and a mix of depths",
        "body": "const it = new NestedIterator([1, [4, [6]], [[[7]]], 8]);\nconst out = [];\nwhile (it.hasNext()) out.push(it.next());\nassert.deepEqual(out, [1, 4, 6, 7, 8]);"
      },
      {
        "name": "empty lists contribute nothing, so hasNext is false",
        "body": "assert.equal(new NestedIterator([]).hasNext(), false);\nassert.equal(new NestedIterator([[]]).hasNext(), false);\nassert.equal(new NestedIterator([[], [[]], []]).hasNext(), false);\nconst it = new NestedIterator([[], [[], 5], []]);\nassert.equal(it.hasNext(), true);\nassert.equal(it.next(), 5);\nassert.equal(it.hasNext(), false);"
      },
      {
        "name": "calling hasNext twice changes nothing",
        "body": "const it = new NestedIterator([[1, 2], [3]]);\nassert.equal(it.hasNext(), true);\nassert.equal(it.hasNext(), true);\nassert.equal(it.next(), 1);\nassert.equal(it.hasNext(), true);\nassert.equal(it.hasNext(), true);\nassert.equal(it.next(), 2);\nassert.equal(it.next(), 3);\nassert.equal(it.hasNext(), false);\nassert.equal(it.hasNext(), false);"
      },
      {
        "name": "next on an exhausted iterator throws",
        "body": "const it = new NestedIterator([[1]]);\nit.next();\nassert.throws(() => it.next());\nassert.throws(() => new NestedIterator([]).next());"
      },
      {
        "name": "falsy integers are still integers",
        "body": "const it = new NestedIterator([0, [0], [[0, -1]], 0]);\nconst out = [];\nwhile (it.hasNext()) out.push(it.next());\nassert.deepEqual(out, [0, 0, 0, -1, 0]);"
      },
      {
        "name": "a very deep list does not exhaust the memory or the stack",
        "body": "let nested = [42];\nfor (let i = 0; i < 3000; i++) nested = [nested];\nconst it = new NestedIterator(nested);\nassert.equal(it.hasNext(), true);\nassert.equal(it.next(), 42);\nassert.equal(it.hasNext(), false);"
      },
      {
        "name": "the constructor does not read the items",
        "body": "const list = [1, 2];\nObject.defineProperty(list, 0, { get() { throw new Error('read too early'); } });\nconst it = new NestedIterator(list);\nassert.ok(it);"
      },
      {
        "name": "random nested lists against a recursive flatten",
        "body": "let seed = 20261013;\nconst rand = (n) => { seed = (seed * 16807) % 2147483647; return seed % n; };\nconst build = (depth) => Array.from({ length: rand(5) }, () => (depth < 4 && rand(3) === 0 ? build(depth + 1) : rand(50) - 10));\nconst flat = (x) => x.flatMap((v) => (Array.isArray(v) ? flat(v) : [v]));\nfor (let t = 0; t < 300; t++) {\n  const nested = build(0);\n  const it = new NestedIterator(nested);\n  const out = [];\n  while (true) {\n    if (rand(3) === 0) assert.equal(it.hasNext(), it.hasNext());\n    if (!it.hasNext()) break;\n    out.push(it.next());\n  }\n  assert.deepEqual(out, flat(nested));\n}"
      }
    ]
  },
  {
    "id": "ex-peeking-iterator",
    "chapter": "dsa-design-simulation",
    "level": "intermediate",
    "title": "Peeking Iterator",
    "brief": "<p>You are given an iterator object with two methods, <code>hasNext()</code> and <code>next()</code>. Wrap it in a <code>PeekingIterator</code> that also supports <code>peek()</code>, which returns the next value <b>without</b> consuming it.</p><ul><li><code>new PeekingIterator(iterator)</code></li><li><code>peek()</code> - the next value; calling it again returns the same value. Throw an <code>Error</code> if there is none</li><li><code>next()</code> - the next value, consuming it. Throw an <code>Error</code> if there is none</li><li><code>hasNext()</code> - whether a value remains, taking a peeked value into account</li><li>Every value must be pulled from the wrapped iterator exactly once, and the constructor must not pull any</li><li>Values may be any value, including <code>0</code>, <code>false</code>, <code>null</code> and <code>undefined</code></li></ul>",
    "starter": "class PeekingIterator {\n  constructor(iterator) {\n    // TODO\n  }\n\n  peek() {\n    // TODO\n  }\n\n  next() {\n    // TODO\n  }\n\n  hasNext() {\n    // TODO\n  }\n}\n",
    "hints": [
      "The wrapped iterator only moves forward, so a value you have looked at must be remembered until next() is called.",
      "Keep one slot for the peeked value. Be careful what 'empty' means: if you store the bare value, you cannot tell an empty slot from a stored 0, false, null or undefined.",
      "Store the peeked value in a box such as { value }, with null meaning 'nothing cached'. peek fills the box if it is empty; next empties it, or delegates when it is already empty; hasNext is true if the box is full or the inner iterator has more."
    ],
    "solution": "class PeekingIterator {\n  constructor(iterator) {\n    this.iterator = iterator;\n    this.cached = null;\n  }\n\n  peek() {\n    if (this.cached === null) {\n      if (!this.iterator.hasNext()) throw new Error('no more values');\n      this.cached = { value: this.iterator.next() };\n    }\n    return this.cached.value;\n  }\n\n  next() {\n    if (this.cached !== null) {\n      const { value } = this.cached;\n      this.cached = null;\n      return value;\n    }\n    if (!this.iterator.hasNext()) throw new Error('no more values');\n    return this.iterator.next();\n  }\n\n  hasNext() {\n    return this.cached !== null || this.iterator.hasNext();\n  }\n}\n",
    "tests": [
      {
        "name": "peek does not consume",
        "body": "class Counter { constructor(a) { this.a = a; this.i = 0; } hasNext() { return this.i < this.a.length; } next() { return this.a[this.i++]; } }\nconst p = new PeekingIterator(new Counter([1, 2, 3]));\nassert.equal(p.peek(), 1);\nassert.equal(p.peek(), 1);\nassert.equal(p.next(), 1);\nassert.equal(p.next(), 2);\nassert.equal(p.peek(), 3);\nassert.equal(p.next(), 3);\nassert.equal(p.hasNext(), false);"
      },
      {
        "name": "hasNext counts a peeked value",
        "body": "class Counter { constructor(a) { this.a = a; this.i = 0; } hasNext() { return this.i < this.a.length; } next() { return this.a[this.i++]; } }\nconst p = new PeekingIterator(new Counter([9]));\nassert.equal(p.hasNext(), true);\nassert.equal(p.peek(), 9);\nassert.equal(p.hasNext(), true);\nassert.equal(p.next(), 9);\nassert.equal(p.hasNext(), false);"
      },
      {
        "name": "falsy values are handled",
        "body": "class Counter { constructor(a) { this.a = a; this.i = 0; } hasNext() { return this.i < this.a.length; } next() { return this.a[this.i++]; } }\nconst values = [0, false, null, undefined, '', 7];\nconst p = new PeekingIterator(new Counter(values));\nfor (const expected of values) {\n  assert.equal(p.hasNext(), true);\n  assert.equal(p.peek(), expected);\n  assert.equal(p.peek(), expected);\n  assert.equal(p.next(), expected);\n}\nassert.equal(p.hasNext(), false);"
      },
      {
        "name": "each value is pulled from the wrapped iterator once",
        "body": "let pulls = 0;\nclass Counter { constructor(a) { this.a = a; this.i = 0; } hasNext() { return this.i < this.a.length; } next() { pulls++; return this.a[this.i++]; } }\nconst p = new PeekingIterator(new Counter([1, 2]));\nassert.equal(pulls, 0);\np.peek(); p.peek(); p.peek();\nassert.equal(pulls, 1);\np.next();\nassert.equal(pulls, 1);\np.next();\nassert.equal(pulls, 2);"
      },
      {
        "name": "an empty iterator",
        "body": "class Counter { constructor(a) { this.a = a; this.i = 0; } hasNext() { return this.i < this.a.length; } next() { return this.a[this.i++]; } }\nconst p = new PeekingIterator(new Counter([]));\nassert.equal(p.hasNext(), false);\nassert.throws(() => p.peek());\nassert.throws(() => p.next());"
      },
      {
        "name": "peek and next past the end throw",
        "body": "class Counter { constructor(a) { this.a = a; this.i = 0; } hasNext() { return this.i < this.a.length; } next() { return this.a[this.i++]; } }\nconst p = new PeekingIterator(new Counter([5]));\nassert.equal(p.next(), 5);\nassert.throws(() => p.peek());\nassert.throws(() => p.next());"
      },
      {
        "name": "random mixes of peek, next and hasNext against an array",
        "body": "let seed = 20261013;\nconst rand = (n) => { seed = (seed * 16807) % 2147483647; return seed % n; };\nclass Counter { constructor(a) { this.a = a; this.i = 0; } hasNext() { return this.i < this.a.length; } next() { return this.a[this.i++]; } }\nfor (let t = 0; t < 300; t++) {\n  const arr = Array.from({ length: rand(8) }, () => [0, null, 1, 2, false][rand(5)]);\n  const p = new PeekingIterator(new Counter(arr));\n  let at = 0;\n  for (let step = 0; step < 25; step++) {\n    const op = rand(3);\n    if (op === 0) assert.equal(p.hasNext(), at < arr.length);\n    else if (op === 1) { if (at < arr.length) assert.equal(p.peek(), arr[at]); else assert.throws(() => p.peek()); }\n    else if (at < arr.length) assert.equal(p.next(), arr[at++]);\n    else assert.throws(() => p.next());\n  }\n}"
      }
    ]
  },
  {
    "id": "ex-zigzag-iterator",
    "chapter": "dsa-design-simulation",
    "level": "intermediate",
    "title": "Zigzag Iterator",
    "brief": "<p>Given <code>k</code> lists of integers, possibly of different lengths, return their values by taking one from each list in turn: first the first value of every list, then the second value of every list that has one, and so on.</p><ul><li><code>new ZigzagIterator(lists)</code> - <code>lists</code> is an array of arrays; some may be empty</li><li><code>hasNext()</code> - whether any value remains</li><li><code>next()</code> - the next value. Throw an <code>Error</code> when there is none</li><li>For <code>[[1, 2, 3], [4, 5, 6, 7], [8, 9]]</code> the order is <code>1, 4, 8, 2, 5, 9, 3, 6, 7</code></li><li>Do not copy all the values in the constructor, and do not change the input lists. Each call should be O(1)</li></ul>",
    "starter": "class ZigzagIterator {\n  constructor(lists) {\n    // TODO\n  }\n\n  hasNext() {\n    // TODO\n  }\n\n  next() {\n    // TODO\n  }\n}\n",
    "hints": [
      "Whose turn it is changes after every call, and a list that runs out must drop out of the rotation. Think of a line of people: the person at the front takes a turn and goes to the back.",
      "Keep a queue of cursors { list, index }, holding only the lists that still have values. The constructor enqueues every non-empty list.",
      "next(): dequeue the front cursor, read its value, advance its index, and enqueue it again only if it still has values. hasNext is whether the queue is non-empty. Write the queue with linked nodes so that dequeue is O(1)."
    ],
    "solution": "class Queue {\n  constructor() {\n    this.head = null;\n    this.tail = null;\n    this.length = 0;\n  }\n\n  enqueue(value) {\n    const node = { value, next: null };\n    if (this.tail === null) this.head = node;\n    else this.tail.next = node;\n    this.tail = node;\n    this.length++;\n  }\n\n  dequeue() {\n    const { value } = this.head;\n    this.head = this.head.next;\n    if (this.head === null) this.tail = null;\n    this.length--;\n    return value;\n  }\n\n  peek() {\n    return this.head === null ? undefined : this.head.value;\n  }\n}\n\nclass ZigzagIterator {\n  constructor(lists) {\n    this.queue = new Queue();\n    for (const list of lists) {\n      if (list.length > 0) this.queue.enqueue({ list, index: 0 });\n    }\n  }\n\n  hasNext() {\n    return this.queue.length > 0;\n  }\n\n  next() {\n    if (!this.hasNext()) throw new Error('no more values');\n    const cursor = this.queue.dequeue();\n    const value = cursor.list[cursor.index++];\n    if (cursor.index < cursor.list.length) this.queue.enqueue(cursor);\n    return value;\n  }\n}\n",
    "tests": [
      {
        "name": "three lists of different lengths",
        "body": "const it = new ZigzagIterator([[1, 2, 3], [4, 5, 6, 7], [8, 9]]);\nconst out = [];\nwhile (it.hasNext()) out.push(it.next());\nassert.deepEqual(out, [1, 4, 8, 2, 5, 9, 3, 6, 7]);"
      },
      {
        "name": "two lists, one much longer",
        "body": "const it = new ZigzagIterator([[1], [2, 3, 4, 5]]);\nconst out = [];\nwhile (it.hasNext()) out.push(it.next());\nassert.deepEqual(out, [1, 2, 3, 4, 5]);"
      },
      {
        "name": "empty lists are skipped",
        "body": "const it = new ZigzagIterator([[], [1, 2], [], [3], []]);\nconst out = [];\nwhile (it.hasNext()) out.push(it.next());\nassert.deepEqual(out, [1, 3, 2]);"
      },
      {
        "name": "no lists, or only empty lists",
        "body": "assert.equal(new ZigzagIterator([]).hasNext(), false);\nassert.equal(new ZigzagIterator([[], []]).hasNext(), false);\nassert.throws(() => new ZigzagIterator([[]]).next());"
      },
      {
        "name": "a single list is returned in order",
        "body": "const it = new ZigzagIterator([[7, 8, 9]]);\nassert.equal(it.next(), 7);\nassert.equal(it.next(), 8);\nassert.equal(it.next(), 9);\nassert.equal(it.hasNext(), false);"
      },
      {
        "name": "calling hasNext repeatedly changes nothing, and the input is untouched",
        "body": "const lists = [[1, 2], [3]];\nconst it = new ZigzagIterator(lists);\nassert.equal(it.hasNext(), true);\nassert.equal(it.hasNext(), true);\nassert.equal(it.next(), 1);\nassert.equal(it.next(), 3);\nassert.equal(it.next(), 2);\nassert.equal(it.hasNext(), false);\nassert.deepEqual(lists, [[1, 2], [3]]);"
      },
      {
        "name": "random lists against a round-robin reference",
        "body": "let seed = 20261013;\nconst rand = (n) => { seed = (seed * 16807) % 2147483647; return seed % n; };\nfor (let t = 0; t < 300; t++) {\n  const lists = Array.from({ length: rand(6) }, () => Array.from({ length: rand(6) }, () => rand(100)));\n  const expected = [];\n  const longest = Math.max(0, ...lists.map((l) => l.length));\n  for (let i = 0; i < longest; i++) for (const l of lists) if (i < l.length) expected.push(l[i]);\n  const it = new ZigzagIterator(lists);\n  const out = [];\n  while (it.hasNext()) out.push(it.next());\n  assert.deepEqual(out, expected);\n}"
      }
    ]
  },
  {
    "id": "ex-tic-tac-toe",
    "chapter": "dsa-design-simulation",
    "level": "intermediate",
    "title": "Tic-Tac-Toe in O(1) per Move",
    "brief": "<p>Design an <code>n</code> by <code>n</code> Tic-Tac-Toe game for two players, numbered 1 and 2.</p><ul><li><code>new TicTacToe(n)</code></li><li><code>move(row, col, player)</code> - player <code>player</code> marks the cell. Return <code>0</code> if nobody has won yet, or the player's number if this move completes a full row, a full column or a full diagonal (either one) of that player's marks</li><li>Every move is on an empty cell, and no move comes after a win</li><li>Each move must take O(1) time: do not scan a row, a column or the board. The memory should be O(n), not O(n&sup2;)</li></ul>",
    "starter": "class TicTacToe {\n  constructor(n) {\n    // TODO\n  }\n\n  move(row, col, player) {\n    // TODO: 0 for no winner yet, otherwise the winning player\n  }\n}\n",
    "hints": [
      "What does the win check need to know about a line? Only whether all n of its cells belong to one player. You do not have to remember which cells.",
      "Keep one number per line: n for rows, n for columns, one for the main diagonal (cells with row === col) and one for the other (row + col === n - 1).",
      "Add +1 to the counters a move touches for player 1 and -1 for player 2. A counter that reaches n or -n in absolute value means one player holds the whole line. The centre of an odd board is on both diagonals, so use two separate ifs."
    ],
    "solution": "class TicTacToe {\n  constructor(n) {\n    this.n = n;\n    this.rows = new Array(n).fill(0);\n    this.cols = new Array(n).fill(0);\n    this.diagonal = 0;\n    this.antiDiagonal = 0;\n  }\n\n  move(row, col, player) {\n    const delta = player === 1 ? 1 : -1;\n    this.rows[row] += delta;\n    this.cols[col] += delta;\n    if (row === col) this.diagonal += delta;\n    if (row + col === this.n - 1) this.antiDiagonal += delta;\n    const complete = (total) => Math.abs(total) === this.n;\n    if (complete(this.rows[row]) || complete(this.cols[col]) || complete(this.diagonal) || complete(this.antiDiagonal)) {\n      return player;\n    }\n    return 0;\n  }\n}\n",
    "tests": [
      {
        "name": "a row win for player 1",
        "body": "const g = new TicTacToe(3);\nassert.equal(g.move(0, 0, 1), 0);\nassert.equal(g.move(1, 0, 2), 0);\nassert.equal(g.move(0, 1, 1), 0);\nassert.equal(g.move(1, 1, 2), 0);\nassert.equal(g.move(0, 2, 1), 1);"
      },
      {
        "name": "a column win for player 2",
        "body": "const g = new TicTacToe(3);\nassert.equal(g.move(0, 0, 1), 0);\nassert.equal(g.move(0, 2, 2), 0);\nassert.equal(g.move(1, 0, 1), 0);\nassert.equal(g.move(1, 2, 2), 0);\nassert.equal(g.move(2, 1, 1), 0);\nassert.equal(g.move(2, 2, 2), 2);"
      },
      {
        "name": "the main diagonal",
        "body": "const g = new TicTacToe(3);\nassert.equal(g.move(0, 0, 1), 0);\nassert.equal(g.move(0, 1, 2), 0);\nassert.equal(g.move(1, 1, 1), 0);\nassert.equal(g.move(0, 2, 2), 0);\nassert.equal(g.move(2, 2, 1), 1);"
      },
      {
        "name": "the anti-diagonal, including the centre cell",
        "body": "const g = new TicTacToe(3);\nassert.equal(g.move(0, 2, 1), 0);\nassert.equal(g.move(0, 0, 2), 0);\nassert.equal(g.move(1, 1, 1), 0);\nassert.equal(g.move(0, 1, 2), 0);\nassert.equal(g.move(2, 0, 1), 1);"
      },
      {
        "name": "a mixed row is not a win, and a full board can be a draw",
        "body": "const g = new TicTacToe(3);\nconst moves = [[0, 0, 1], [0, 1, 2], [0, 2, 1], [1, 1, 2], [1, 0, 1], [1, 2, 2], [2, 1, 1], [2, 0, 2], [2, 2, 1]];\nfor (const [r, c, p] of moves) assert.equal(g.move(r, c, p), 0);"
      },
      {
        "name": "boards of size 1 and 2",
        "body": "assert.equal(new TicTacToe(1).move(0, 0, 2), 2);\nconst g = new TicTacToe(2);\nassert.equal(g.move(0, 0, 1), 0);\nassert.equal(g.move(1, 1, 1), 1);\nconst h = new TicTacToe(2);\nassert.equal(h.move(0, 1, 2), 0);\nassert.equal(h.move(1, 0, 2), 2);"
      },
      {
        "name": "a larger board needs the whole line",
        "body": "const g = new TicTacToe(5);\nfor (let c = 0; c < 4; c++) assert.equal(g.move(2, c, 1), 0);\nassert.equal(g.move(0, 0, 2), 0);\nassert.equal(g.move(2, 4, 1), 1);"
      },
      {
        "name": "random games against a full board scan",
        "body": "let seed = 20261013;\nconst rand = (n) => { seed = (seed * 16807) % 2147483647; return seed % n; };\nfor (let t = 0; t < 300; t++) {\n  const n = 1 + rand(6);\n  const g = new TicTacToe(n);\n  const board = Array.from({ length: n }, () => new Array(n).fill(0));\n  const cells = [];\n  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) cells.push([i, j]);\n  for (let i = cells.length - 1; i > 0; i--) { const j = rand(i + 1); [cells[i], cells[j]] = [cells[j], cells[i]]; }\n  let player = 1 + rand(2);\n  for (const [row, col] of cells) {\n    board[row][col] = player;\n    const lines = [board.map((x, i) => x[i]), board.map((x, i) => x[n - 1 - i])];\n    for (let i = 0; i < n; i++) lines.push(board[i], board.map((x) => x[i]));\n    const expected = lines.some((line) => line.every((v) => v === player)) ? player : 0;\n    assert.equal(g.move(row, col, player), expected);\n    if (expected !== 0) break;\n    player = 3 - player;\n  }\n}"
      }
    ]
  },
  {
    "id": "ex-snake-game",
    "chapter": "dsa-design-simulation",
    "level": "intermediate",
    "title": "Snake Game",
    "brief": "<p>Design the Snake game on a <code>width</code> by <code>height</code> grid. Cells are written <code>[row, col]</code> and the top-left cell is <code>[0, 0]</code>.</p><ul><li><code>new SnakeGame(width, height, food)</code> - the snake starts with length 1 at <code>[0, 0]</code>. <code>food</code> is an array of <code>[row, col]</code> pairs; only the first one not yet eaten is on the board</li><li><code>move(direction)</code> - <code>\"U\"</code>, <code>\"D\"</code>, <code>\"L\"</code> or <code>\"R\"</code>. Return the score (the number of foods eaten so far), or <code>-1</code> if the game is over</li><li>The game ends when the head leaves the grid or moves onto a cell of the snake's body. When the head moves onto the food, the snake grows by one and the next food appears. When it does not, the tail moves forward in the same turn, so the head may move into the cell the tail is leaving</li><li>Each move should be O(1) on average</li></ul>",
    "starter": "class SnakeGame {\n  constructor(width, height, food) {\n    // TODO\n  }\n\n  move(direction) {\n    // TODO: the score, or -1 when the game is over\n  }\n}\n",
    "hints": [
      "The body has one end that grows and one end that shrinks: a queue. But 'is this cell part of the snake?' is slow on a queue, so keep a Set of the same cells beside it. Encode a cell as one number, row * width + col.",
      "Compute the new head. Off the grid is game over. Decide whether it is eating (it equals the next food). Then the collision test: the new head hits the body if its cell is in the set, except that when the snake is not eating, the cell of the tail is about to be freed.",
      "Do the collision test before changing anything. Then, if not eating, dequeue the tail and delete it from the set. Finally enqueue the new head and add it to the set. Write the queue with linked nodes, or any structure whose dequeue is O(1)."
    ],
    "solution": "class Queue {\n  constructor() {\n    this.head = null;\n    this.tail = null;\n    this.length = 0;\n  }\n\n  enqueue(value) {\n    const node = { value, next: null };\n    if (this.tail === null) this.head = node;\n    else this.tail.next = node;\n    this.tail = node;\n    this.length++;\n  }\n\n  dequeue() {\n    const { value } = this.head;\n    this.head = this.head.next;\n    if (this.head === null) this.tail = null;\n    this.length--;\n    return value;\n  }\n\n  peek() {\n    return this.head === null ? undefined : this.head.value;\n  }\n}\n\nclass SnakeGame {\n  constructor(width, height, food) {\n    this.width = width;\n    this.height = height;\n    this.food = food;\n    this.eaten = 0;\n    this.body = new Queue();\n    this.occupied = new Set();\n    this.row = 0;\n    this.col = 0;\n    this.body.enqueue(0);\n    this.occupied.add(0);\n  }\n\n  move(direction) {\n    let row = this.row;\n    let col = this.col;\n    if (direction === 'U') row--;\n    else if (direction === 'D') row++;\n    else if (direction === 'L') col--;\n    else col++;\n    if (row < 0 || row >= this.height || col < 0 || col >= this.width) return -1;\n\n    const key = row * this.width + col;\n    const next = this.food[this.eaten];\n    const eating = next !== undefined && next[0] === row && next[1] === col;\n    const tail = this.body.peek();\n    if (this.occupied.has(key) && (eating || key !== tail)) return -1;\n\n    if (eating) {\n      this.eaten++;\n    } else {\n      this.body.dequeue();\n      this.occupied.delete(tail);\n    }\n    this.body.enqueue(key);\n    this.occupied.add(key);\n    this.row = row;\n    this.col = col;\n    return this.eaten;\n  }\n}\n",
    "tests": [
      {
        "name": "the standard example",
        "body": "const g = new SnakeGame(3, 2, [[1, 2], [0, 1]]);\nassert.equal(g.move('R'), 0);\nassert.equal(g.move('D'), 0);\nassert.equal(g.move('R'), 1);\nassert.equal(g.move('U'), 1);\nassert.equal(g.move('L'), 2);\nassert.equal(g.move('U'), -1);"
      },
      {
        "name": "leaving the grid ends the game on every side",
        "body": "assert.equal(new SnakeGame(3, 3, []).move('U'), -1);\nassert.equal(new SnakeGame(3, 3, []).move('L'), -1);\nconst a = new SnakeGame(2, 3, []);\nassert.equal(a.move('R'), 0);\nassert.equal(a.move('R'), -1);\nconst b = new SnakeGame(2, 2, []);\nassert.equal(b.move('D'), 0);\nassert.equal(b.move('D'), -1);"
      },
      {
        "name": "with no food the snake just moves",
        "body": "const g = new SnakeGame(3, 3, []);\nfor (const d of ['R', 'R', 'D', 'D', 'L', 'L', 'U']) assert.equal(g.move(d), 0);"
      },
      {
        "name": "the head may move into the cell the tail is leaving",
        "body": "const g = new SnakeGame(2, 2, [[0, 1], [1, 1], [1, 0]]);\nassert.equal(g.move('R'), 1);\nassert.equal(g.move('D'), 2);\nassert.equal(g.move('L'), 3);\nassert.equal(g.move('U'), 3);\nassert.equal(g.move('R'), 3);"
      },
      {
        "name": "eating into the cell the tail occupies is a collision",
        "body": "const g = new SnakeGame(2, 2, [[0, 1], [1, 1], [1, 0], [0, 0]]);\nassert.equal(g.move('R'), 1);\nassert.equal(g.move('D'), 2);\nassert.equal(g.move('L'), 3);\nassert.equal(g.move('U'), -1);"
      },
      {
        "name": "running into the body ends the game",
        "body": "const g = new SnakeGame(5, 5, [[0, 1], [0, 2], [0, 3], [1, 3]]);\nassert.equal(g.move('R'), 1);\nassert.equal(g.move('R'), 2);\nassert.equal(g.move('R'), 3);\nassert.equal(g.move('D'), 4);\nassert.equal(g.move('L'), 4);\nassert.equal(g.move('U'), -1);"
      },
      {
        "name": "food is eaten in list order, so a later food cell is just a cell until its turn",
        "body": "const g = new SnakeGame(4, 1, [[0, 3], [0, 1]]);\nassert.equal(g.move('R'), 0);\nassert.equal(g.move('R'), 0);\nassert.equal(g.move('R'), 1);\nassert.equal(g.move('L'), 1);\nassert.equal(g.move('L'), 2);"
      },
      {
        "name": "random games against a plain array simulation",
        "body": "let seed = 20261013;\nconst rand = (n) => { seed = (seed * 16807) % 2147483647; return seed % n; };\nclass Naive {\n  constructor(w, h, food) { this.w = w; this.h = h; this.food = food; this.body = [[0, 0]]; this.eaten = 0; }\n  move(d) {\n    const [hr, hc] = this.body[this.body.length - 1];\n    const nr = hr + (d === 'D') - (d === 'U');\n    const nc = hc + (d === 'R') - (d === 'L');\n    if (nr < 0 || nr >= this.h || nc < 0 || nc >= this.w) return -1;\n    const f = this.food[this.eaten];\n    const eating = f !== undefined && f[0] === nr && f[1] === nc;\n    const after = eating ? this.body : this.body.slice(1);\n    if (after.some(([a, b]) => a === nr && b === nc)) return -1;\n    this.body = [...after, [nr, nc]];\n    if (eating) this.eaten++;\n    return this.eaten;\n  }\n}\nfor (let t = 0; t < 400; t++) {\n  const w = 2 + rand(5);\n  const h = 2 + rand(5);\n  const food = Array.from({ length: 1 + rand(12) }, () => [rand(h), rand(w)]).filter(([a, b]) => a !== 0 || b !== 0);\n  const g = new SnakeGame(w, h, food);\n  const n = new Naive(w, h, food);\n  for (let step = 0; step < 100; step++) {\n    const d = ['U', 'D', 'L', 'R'][rand(4)];\n    const want = n.move(d);\n    assert.equal(g.move(d), want);\n    if (want === -1) break;\n  }\n}"
      }
    ]
  },
  {
    "id": "ex-snapshot-array",
    "chapter": "dsa-design-simulation",
    "level": "intermediate",
    "title": "Snapshot Array",
    "brief": "<p>Design an array that can be frozen at any time and read back as it was.</p><ul><li><code>new SnapshotArray(length)</code> - an array of <code>length</code> zeros</li><li><code>set(index, value)</code> - change one entry</li><li><code>snap()</code> - freeze the array and return the snapshot id: <code>0</code> for the first call, <code>1</code> for the second, and so on</li><li><code>get(index, snapId)</code> - the value <code>array[index]</code> had when snapshot <code>snapId</code> was taken. <code>snapId</code> is always one that has been returned by <code>snap()</code></li><li>Do not copy the whole array on every <code>snap()</code>: it should be O(1). <code>set</code> should be O(1) and <code>get</code> O(log v), where v is the number of changes at that index</li></ul>",
    "starter": "class SnapshotArray {\n  constructor(length) {\n    // TODO\n  }\n\n  set(index, value) {\n    // TODO\n  }\n\n  snap() {\n    // TODO: the id of the snapshot just taken\n  }\n\n  get(index, snapId) {\n    // TODO\n  }\n}\n",
    "hints": [
      "Between two snapshots only the entries you set have changed. Record the changes, not the whole array.",
      "For each index keep a list of [snapId, value] pairs. A set is tagged with the id the next snapshot will get, which is a counter you increase in snap(). A second set to the same index before the next snap() overwrites the last pair instead of adding one.",
      "get(index, snapId) wants the last pair whose tag is at or before snapId. The tags are sorted, so binary search for the first pair whose tag is greater than snapId and step back one. If there is no pair before it, the value is the initial 0."
    ],
    "solution": "class SnapshotArray {\n  constructor(length) {\n    this.history = Array.from({ length }, () => []);\n    this.snapId = 0;\n  }\n\n  set(index, value) {\n    const versions = this.history[index];\n    const last = versions[versions.length - 1];\n    if (last !== undefined && last[0] === this.snapId) last[1] = value;\n    else versions.push([this.snapId, value]);\n  }\n\n  snap() {\n    return this.snapId++;\n  }\n\n  get(index, snapId) {\n    const versions = this.history[index];\n    let lo = 0;\n    let hi = versions.length;\n    while (lo < hi) {\n      const mid = (lo + hi) >> 1;\n      if (versions[mid][0] > snapId) hi = mid;\n      else lo = mid + 1;\n    }\n    return lo === 0 ? 0 : versions[lo - 1][1];\n  }\n}\n",
    "tests": [
      {
        "name": "the standard example",
        "body": "const a = new SnapshotArray(3);\na.set(0, 5);\nassert.equal(a.snap(), 0);\na.set(0, 6);\nassert.equal(a.get(0, 0), 5);"
      },
      {
        "name": "snapshot ids count up from 0",
        "body": "const a = new SnapshotArray(1);\nassert.equal(a.snap(), 0);\nassert.equal(a.snap(), 1);\nassert.equal(a.snap(), 2);"
      },
      {
        "name": "a second set before the next snap replaces the first",
        "body": "const a = new SnapshotArray(2);\na.set(1, 4);\na.set(1, 8);\na.set(1, 9);\nconst id = a.snap();\nassert.equal(a.get(1, id), 9);"
      },
      {
        "name": "an index that was never set reads 0 in every snapshot",
        "body": "const a = new SnapshotArray(4);\na.set(0, 1);\na.snap();\na.set(0, 2);\na.snap();\nassert.equal(a.get(3, 0), 0);\nassert.equal(a.get(3, 1), 0);"
      },
      {
        "name": "a value set later does not appear in an earlier snapshot",
        "body": "const a = new SnapshotArray(2);\na.snap();\na.set(0, 7);\na.snap();\na.set(0, 8);\na.snap();\nassert.equal(a.get(0, 0), 0);\nassert.equal(a.get(0, 1), 7);\nassert.equal(a.get(0, 2), 8);"
      },
      {
        "name": "a snapshot taken after quiet snapshots still sees the old value",
        "body": "const a = new SnapshotArray(1);\na.set(0, 3);\nfor (let i = 0; i < 5; i++) a.snap();\na.set(0, 4);\nconst last = a.snap();\nfor (let id = 0; id < 5; id++) assert.equal(a.get(0, id), 3);\nassert.equal(a.get(0, last), 4);"
      },
      {
        "name": "a setting of 0 is a real value",
        "body": "const a = new SnapshotArray(1);\na.set(0, 5);\na.snap();\na.set(0, 0);\na.snap();\nassert.equal(a.get(0, 0), 5);\nassert.equal(a.get(0, 1), 0);"
      },
      {
        "name": "random operations against copying the whole array",
        "body": "let seed = 20261013;\nconst rand = (n) => { seed = (seed * 16807) % 2147483647; return seed % n; };\nfor (let t = 0; t < 300; t++) {\n  const length = 1 + rand(5);\n  const a = new SnapshotArray(length);\n  const live = new Array(length).fill(0);\n  const copies = [];\n  for (let step = 0; step < 40; step++) {\n    const op = rand(3);\n    if (op === 0) { const i = rand(length); const v = rand(50); a.set(i, v); live[i] = v; }\n    else if (op === 1) { assert.equal(a.snap(), copies.length); copies.push(live.slice()); }\n    else if (copies.length > 0) { const id = rand(copies.length); const i = rand(length); assert.equal(a.get(i, id), copies[id][i]); }\n  }\n}"
      }
    ]
  },
  {
    "id": "ex-browser-history",
    "chapter": "dsa-design-simulation",
    "level": "beginner",
    "title": "Browser History",
    "brief": "<p>Design the history of one browser tab.</p><ul><li><code>new BrowserHistory(homepage)</code> - the tab starts on <code>homepage</code></li><li><code>visit(url)</code> - go to <code>url</code> from the current page. Every page that was ahead of the current one (reachable by going forward) is erased</li><li><code>back(steps)</code> - go back up to <code>steps</code> pages, stopping at the first page. Return the page the tab is on</li><li><code>forward(steps)</code> - go forward up to <code>steps</code> pages, stopping at the last page. Return the page the tab is on</li></ul>",
    "starter": "class BrowserHistory {\n  constructor(homepage) {\n    // TODO\n  }\n\n  visit(url) {\n    // TODO\n  }\n\n  back(steps) {\n    // TODO: the page the tab is on afterwards\n  }\n\n  forward(steps) {\n    // TODO: the page the tab is on afterwards\n  }\n}\n",
    "hints": [
      "The history is a line of pages with one of them on screen. What single number says which one?",
      "Keep the pages in an array and the index of the current page. back and forward only move the index, clamped to the ends of the array.",
      "visit cuts the array down to current + 1 entries (assigning to length does it), pushes the new page, and moves the index onto it."
    ],
    "solution": "class BrowserHistory {\n  constructor(homepage) {\n    this.pages = [homepage];\n    this.current = 0;\n  }\n\n  visit(url) {\n    this.pages.length = this.current + 1;\n    this.pages.push(url);\n    this.current++;\n  }\n\n  back(steps) {\n    this.current = Math.max(0, this.current - steps);\n    return this.pages[this.current];\n  }\n\n  forward(steps) {\n    this.current = Math.min(this.pages.length - 1, this.current + steps);\n    return this.pages[this.current];\n  }\n}\n",
    "tests": [
      {
        "name": "the standard example",
        "body": "const h = new BrowserHistory('start.com');\nh.visit('a.example');\nh.visit('b.example');\nh.visit('d.example');\nassert.equal(h.back(1), 'b.example');\nassert.equal(h.back(1), 'a.example');\nassert.equal(h.forward(1), 'b.example');\nh.visit('c.example');\nassert.equal(h.forward(2), 'c.example');\nassert.equal(h.back(2), 'a.example');\nassert.equal(h.back(7), 'start.com');"
      },
      {
        "name": "back and forward on a single page stay put",
        "body": "const h = new BrowserHistory('home');\nassert.equal(h.back(3), 'home');\nassert.equal(h.forward(3), 'home');\nassert.equal(h.back(0), 'home');"
      },
      {
        "name": "steps of zero do not move",
        "body": "const h = new BrowserHistory('a');\nh.visit('b');\nassert.equal(h.back(0), 'b');\nassert.equal(h.forward(0), 'b');"
      },
      {
        "name": "a visit erases the pages ahead",
        "body": "const h = new BrowserHistory('a');\nh.visit('b');\nh.visit('c');\nh.visit('d');\nh.back(2);\nh.visit('x');\nassert.equal(h.forward(5), 'x');\nassert.equal(h.back(1), 'b');\nassert.equal(h.forward(1), 'x');"
      },
      {
        "name": "going forward past the end stops at the last page",
        "body": "const h = new BrowserHistory('a');\nh.visit('b');\nh.visit('c');\nh.back(2);\nassert.equal(h.forward(100), 'c');"
      },
      {
        "name": "visiting the same page again is a new entry",
        "body": "const h = new BrowserHistory('a');\nh.visit('a');\nh.visit('a');\nassert.equal(h.back(1), 'a');\nassert.equal(h.back(1), 'a');\nassert.equal(h.back(1), 'a');\nh.visit('b');\nassert.equal(h.forward(1), 'b');\nassert.equal(h.back(1), 'a');"
      },
      {
        "name": "random operations against a rebuild-the-list version",
        "body": "let seed = 20261013;\nconst rand = (n) => { seed = (seed * 16807) % 2147483647; return seed % n; };\nclass Naive {\n  constructor(home) { this.list = [home]; this.i = 0; }\n  visit(u) { this.list = [...this.list.slice(0, this.i + 1), u]; this.i = this.list.length - 1; }\n  back(s) { for (let k = 0; k < s; k++) if (this.i > 0) this.i--; return this.list[this.i]; }\n  forward(s) { for (let k = 0; k < s; k++) if (this.i < this.list.length - 1) this.i++; return this.list[this.i]; }\n}\nfor (let t = 0; t < 300; t++) {\n  const h = new BrowserHistory('home');\n  const n = new Naive('home');\n  let count = 0;\n  for (let step = 0; step < 50; step++) {\n    const op = rand(3);\n    const s = rand(5);\n    if (op === 0) { const u = 'p' + count++; h.visit(u); n.visit(u); }\n    else if (op === 1) assert.equal(h.back(s), n.back(s));\n    else assert.equal(h.forward(s), n.forward(s));\n  }\n}"
      }
    ]
  },
  {
    "id": "ex-text-editor",
    "chapter": "dsa-design-simulation",
    "level": "advanced",
    "title": "Design a Text Editor",
    "brief": "<p>Design a text editor with a cursor. The text is lower-case letters; the cursor starts at the beginning of an empty text and can sit at either end or between any two characters.</p><ul><li><code>addText(text)</code> - insert <code>text</code> at the cursor. The cursor ends after the inserted text</li><li><code>deleteText(k)</code> - delete up to <code>k</code> characters to the <b>left</b> of the cursor. Return how many were actually deleted</li><li><code>cursorLeft(k)</code> - move the cursor left by up to <code>k</code> characters. Return the last (up to) 10 characters to the left of the cursor</li><li><code>cursorRight(k)</code> - move the cursor right by up to <code>k</code> characters. Return the last (up to) 10 characters to the left of the cursor</li><li>No operation may cost time that depends on the total length of the text: only on the length added, <code>k</code>, and 10</li></ul>",
    "starter": "class TextEditor {\n  constructor() {\n    // TODO\n  }\n\n  addText(text) {\n    // TODO\n  }\n\n  deleteText(k) {\n    // TODO: how many characters were deleted\n  }\n\n  cursorLeft(k) {\n    // TODO: the text just left of the cursor, at most 10 characters\n  }\n\n  cursorRight(k) {\n    // TODO: the text just left of the cursor, at most 10 characters\n  }\n}\n",
    "hints": [
      "Everything happens at the cursor. Splitting a string at the cursor and joining it again on every edit costs time proportional to the whole text.",
      "Keep the characters before the cursor on one stack and the characters after it on another, each with the character nearest the cursor on top.",
      "Typing pushes onto the left stack, deleting pops from it. Moving the cursor left pops the left stack and pushes the same character onto the right stack; moving right does the reverse. The answer to a move is the last 10 entries of the left stack, joined."
    ],
    "solution": "class TextEditor {\n  constructor() {\n    this.left = [];\n    this.right = [];\n  }\n\n  addText(text) {\n    for (const ch of text) this.left.push(ch);\n  }\n\n  deleteText(k) {\n    let removed = 0;\n    while (removed < k && this.left.length > 0) {\n      this.left.pop();\n      removed++;\n    }\n    return removed;\n  }\n\n  cursorLeft(k) {\n    while (k > 0 && this.left.length > 0) {\n      this.right.push(this.left.pop());\n      k--;\n    }\n    return this.left.slice(-10).join('');\n  }\n\n  cursorRight(k) {\n    while (k > 0 && this.right.length > 0) {\n      this.left.push(this.right.pop());\n      k--;\n    }\n    return this.left.slice(-10).join('');\n  }\n}\n",
    "tests": [
      {
        "name": "the standard example",
        "body": "const e = new TextEditor();\ne.addText('breakfast');\nassert.equal(e.deleteText(4), 4);\ne.addText('through');\nassert.equal(e.cursorLeft(7), 'break');\nassert.equal(e.deleteText(5), 5);\nassert.equal(e.cursorLeft(1), '');\nassert.equal(e.cursorRight(7), 'through');"
      },
      {
        "name": "a cursor move returns at most ten characters",
        "body": "const e = new TextEditor();\nconst text = 'internationalization';\ne.addText(text);\nassert.equal(e.cursorLeft(0), text.slice(-10));\nassert.equal(e.cursorLeft(3), text.slice(-13, -3));\nassert.equal(e.cursorRight(1), text.slice(-12, -2));"
      },
      {
        "name": "deleting more than there is reports the real count",
        "body": "const e = new TextEditor();\ne.addText('abc');\nassert.equal(e.deleteText(10), 3);\nassert.equal(e.deleteText(1), 0);\nassert.equal(e.cursorLeft(5), '');"
      },
      {
        "name": "deleting acts on the left of the cursor only",
        "body": "const e = new TextEditor();\ne.addText('hello');\ne.cursorLeft(2);\nassert.equal(e.deleteText(1), 1);\nassert.equal(e.cursorRight(10), 'he' + 'lo');"
      },
      {
        "name": "moving past either end stops at the end",
        "body": "const e = new TextEditor();\ne.addText('abc');\nassert.equal(e.cursorLeft(100), '');\nassert.equal(e.cursorLeft(1), '');\nassert.equal(e.cursorRight(100), 'abc');\nassert.equal(e.cursorRight(1), 'abc');"
      },
      {
        "name": "typing in the middle goes in at the cursor",
        "body": "const e = new TextEditor();\ne.addText('ac');\ne.cursorLeft(1);\ne.addText('b');\nassert.equal(e.cursorRight(5), 'abc');\ne.cursorLeft(2);\ne.addText('XYZ');\nassert.equal(e.cursorRight(5), 'aXYZbc');"
      },
      {
        "name": "an empty editor",
        "body": "const e = new TextEditor();\nassert.equal(e.cursorLeft(3), '');\nassert.equal(e.cursorRight(3), '');\nassert.equal(e.deleteText(3), 0);"
      },
      {
        "name": "random operations against a string and an index",
        "body": "let seed = 20261013;\nconst rand = (n) => { seed = (seed * 16807) % 2147483647; return seed % n; };\nclass Naive {\n  constructor() { this.s = ''; this.c = 0; }\n  addText(t) { this.s = this.s.slice(0, this.c) + t + this.s.slice(this.c); this.c += t.length; }\n  deleteText(k) { const d = Math.min(k, this.c); this.s = this.s.slice(0, this.c - d) + this.s.slice(this.c); this.c -= d; return d; }\n  cursorLeft(k) { this.c = Math.max(0, this.c - k); return this.s.slice(Math.max(0, this.c - 10), this.c); }\n  cursorRight(k) { this.c = Math.min(this.s.length, this.c + k); return this.s.slice(Math.max(0, this.c - 10), this.c); }\n}\nfor (let t = 0; t < 300; t++) {\n  const e = new TextEditor();\n  const n = new Naive();\n  for (let step = 0; step < 60; step++) {\n    const op = rand(4);\n    const k = rand(15);\n    if (op === 0) { const text = Array.from({ length: rand(8) }, () => 'abc'[rand(3)]).join(''); e.addText(text); n.addText(text); }\n    else if (op === 1) assert.equal(e.deleteText(k), n.deleteText(k));\n    else if (op === 2) assert.equal(e.cursorLeft(k), n.cursorLeft(k));\n    else assert.equal(e.cursorRight(k), n.cursorRight(k));\n  }\n}"
      }
    ]
  },
  {
    "id": "ex-design-news-feed",
    "chapter": "dsa-design-simulation",
    "level": "advanced",
    "title": "Design a News Feed",
    "brief": "<p>Design a small social feed.</p><ul><li><code>postTweet(userId, tweetId)</code> - the user posts a new item. Posts are made one after another; newer posts are more recent. <code>tweetId</code> values are labels: they are not in time order and may be any numbers</li><li><code>follow(followerId, followeeId)</code> and <code>unfollow(followerId, followeeId)</code> - change whom a user reads. Following twice is the same as once, and unfollowing someone you do not follow does nothing</li><li><code>getNewsFeed(userId)</code> - the ids of the (at most) 10 most recent posts made by the user or by anyone they follow, most recent first. A user always sees their own posts; <code>follow(u, u)</code> and <code>unfollow(u, u)</code> change nothing</li><li>Do not sort every post of every followed user: the posts of one user are already in time order, so merge them with a heap</li></ul>",
    "starter": "class NewsFeed {\n  constructor() {\n    // TODO\n  }\n\n  postTweet(userId, tweetId) {\n    // TODO\n  }\n\n  getNewsFeed(userId) {\n    // TODO: up to 10 tweet ids, newest first\n  }\n\n  follow(followerId, followeeId) {\n    // TODO\n  }\n\n  unfollow(followerId, followeeId) {\n    // TODO\n  }\n}\n",
    "hints": [
      "Give every post a number from a counter that only goes up. 'Newer' is then a plain number comparison, and the tweet ids can be anything.",
      "Keep each user's posts in an array in posting order, and a Map from a user to the Set of users they follow. The sources of a feed are that Set plus the user.",
      "Merge with a max-heap on post time. Push one cursor per source, { list, index }, starting at the last post. Pop the newest, add its id to the feed, and push the cursor for that user's previous post. Stop at 10 posts or an empty heap."
    ],
    "solution": "class Heap {\n  constructor(compare, items = []) {\n    this.compare = compare;\n    this.data = items.slice();\n    for (let i = (this.data.length >> 1) - 1; i >= 0; i--) this.siftDown(i);\n  }\n\n  size() {\n    return this.data.length;\n  }\n\n  push(item) {\n    this.data.push(item);\n    let i = this.data.length - 1;\n    while (i > 0) {\n      const parent = (i - 1) >> 1;\n      if (this.compare(this.data[i], this.data[parent]) >= 0) break;\n      [this.data[i], this.data[parent]] = [this.data[parent], this.data[i]];\n      i = parent;\n    }\n  }\n\n  pop() {\n    const top = this.data[0];\n    const last = this.data.pop();\n    if (this.data.length > 0) {\n      this.data[0] = last;\n      this.siftDown(0);\n    }\n    return top;\n  }\n\n  siftDown(i) {\n    const n = this.data.length;\n    while (true) {\n      let best = i;\n      const left = 2 * i + 1;\n      const right = left + 1;\n      if (left < n && this.compare(this.data[left], this.data[best]) < 0) best = left;\n      if (right < n && this.compare(this.data[right], this.data[best]) < 0) best = right;\n      if (best === i) break;\n      [this.data[i], this.data[best]] = [this.data[best], this.data[i]];\n      i = best;\n    }\n  }\n}\n\nclass NewsFeed {\n  constructor() {\n    this.clock = 0;\n    this.posts = new Map();\n    this.following = new Map();\n  }\n\n  postTweet(userId, tweetId) {\n    if (!this.posts.has(userId)) this.posts.set(userId, []);\n    this.posts.get(userId).push({ time: this.clock++, id: tweetId });\n  }\n\n  follow(followerId, followeeId) {\n    if (!this.following.has(followerId)) this.following.set(followerId, new Set());\n    this.following.get(followerId).add(followeeId);\n  }\n\n  unfollow(followerId, followeeId) {\n    const set = this.following.get(followerId);\n    if (set !== undefined) set.delete(followeeId);\n  }\n\n  getNewsFeed(userId, limit = 10) {\n    const sources = new Set(this.following.get(userId) ?? []);\n    sources.add(userId);\n    const newest = [];\n    for (const source of sources) {\n      const list = this.posts.get(source);\n      if (list !== undefined) newest.push({ list, index: list.length - 1 });\n    }\n    const heap = new Heap((a, b) => b.list[b.index].time - a.list[a.index].time, newest);\n    const feed = [];\n    while (feed.length < limit && heap.size() > 0) {\n      const top = heap.pop();\n      feed.push(top.list[top.index].id);\n      if (top.index > 0) heap.push({ list: top.list, index: top.index - 1 });\n    }\n    return feed;\n  }\n}\n",
    "tests": [
      {
        "name": "the standard example",
        "body": "const f = new NewsFeed();\nf.postTweet(1, 5);\nassert.deepEqual(f.getNewsFeed(1), [5]);\nf.follow(1, 2);\nf.postTweet(2, 6);\nassert.deepEqual(f.getNewsFeed(1), [6, 5]);\nf.unfollow(1, 2);\nassert.deepEqual(f.getNewsFeed(1), [5]);"
      },
      {
        "name": "a feed holds at most the ten newest posts",
        "body": "const f = new NewsFeed();\nfor (let id = 1; id <= 15; id++) f.postTweet(1, id);\nassert.deepEqual(f.getNewsFeed(1), [15, 14, 13, 12, 11, 10, 9, 8, 7, 6]);"
      },
      {
        "name": "posts from several users are merged by time, not by id",
        "body": "const f = new NewsFeed();\nf.follow(1, 2);\nf.follow(1, 3);\nf.postTweet(2, 900);\nf.postTweet(3, 10);\nf.postTweet(1, 500);\nf.postTweet(2, 20);\nf.postTweet(3, 700);\nassert.deepEqual(f.getNewsFeed(1), [700, 20, 500, 10, 900]);"
      },
      {
        "name": "a user with no posts and no follows has an empty feed",
        "body": "const f = new NewsFeed();\nassert.deepEqual(f.getNewsFeed(7), []);\nf.follow(7, 8);\nassert.deepEqual(f.getNewsFeed(7), []);"
      },
      {
        "name": "following twice does not repeat posts, and the user is not their own follower",
        "body": "const f = new NewsFeed();\nf.postTweet(2, 1);\nf.follow(1, 2);\nf.follow(1, 2);\nf.follow(1, 1);\nf.postTweet(1, 2);\nassert.deepEqual(f.getNewsFeed(1), [2, 1]);\nf.unfollow(1, 1);\nassert.deepEqual(f.getNewsFeed(1), [2, 1]);"
      },
      {
        "name": "unfollowing a user you do not follow does nothing",
        "body": "const f = new NewsFeed();\nf.postTweet(1, 4);\nf.unfollow(1, 2);\nf.unfollow(9, 1);\nassert.deepEqual(f.getNewsFeed(1), [4]);"
      },
      {
        "name": "following is one-way",
        "body": "const f = new NewsFeed();\nf.postTweet(1, 1);\nf.postTweet(2, 2);\nf.follow(1, 2);\nassert.deepEqual(f.getNewsFeed(1), [2, 1]);\nassert.deepEqual(f.getNewsFeed(2), [2]);"
      },
      {
        "name": "random operations against collect-and-sort",
        "body": "let seed = 20261013;\nconst rand = (n) => { seed = (seed * 16807) % 2147483647; return seed % n; };\nclass Naive {\n  constructor() { this.t = 0; this.all = []; this.f = new Map(); }\n  postTweet(u, id) { this.all.push({ u, id, t: this.t++ }); }\n  follow(a, b) { if (!this.f.has(a)) this.f.set(a, new Set()); this.f.get(a).add(b); }\n  unfollow(a, b) { if (this.f.has(a)) this.f.get(a).delete(b); }\n  getNewsFeed(u) { const set = new Set([u, ...(this.f.get(u) || [])]); return this.all.filter((x) => set.has(x.u)).sort((x, y) => y.t - x.t).slice(0, 10).map((x) => x.id); }\n}\nfor (let t = 0; t < 200; t++) {\n  const f = new NewsFeed();\n  const n = new Naive();\n  for (let step = 0; step < 80; step++) {\n    const op = rand(5);\n    const u = rand(4);\n    const v = rand(4);\n    if (op <= 1) { const id = rand(1000); f.postTweet(u, id); n.postTweet(u, id); }\n    else if (op === 2) { f.follow(u, v); n.follow(u, v); }\n    else if (op === 3) { f.unfollow(u, v); n.unfollow(u, v); }\n    else assert.deepEqual(f.getNewsFeed(u), n.getNewsFeed(u));\n  }\n}"
      }
    ]
  },
  {
    "id": "ex-logger-rate-limiter",
    "chapter": "dsa-design-simulation",
    "level": "beginner",
    "title": "Logger Rate Limiter",
    "brief": "<p>Design a logger that prints each distinct message at most once every 10 seconds.</p><ul><li><code>new Logger()</code></li><li><code>shouldPrint(timestamp, message)</code> - return <code>true</code> if <code>message</code> may be printed at <code>timestamp</code> (in whole seconds), and <code>false</code> if the same message was printed less than 10 seconds earlier. A message printed at time <code>t</code> may be printed again at <code>t + 10</code></li><li>A call that returns <code>false</code> does not change anything: it does not restart the 10 seconds</li><li>Timestamps never decrease between calls; several calls may share a timestamp</li></ul>",
    "starter": "class Logger {\n  constructor() {\n    // TODO\n  }\n\n  shouldPrint(timestamp, message) {\n    // TODO\n  }\n}\n",
    "hints": [
      "Each message has its own clock: what matters for 'foo' is when 'foo' was last printed, not when anything else was.",
      "Keep a Map from message to the first timestamp at which it may print again.",
      "If the message is in the map and timestamp is less than the stored time, return false and change nothing. Otherwise store timestamp + 10 and return true."
    ],
    "solution": "class Logger {\n  constructor() {\n    this.nextAllowed = new Map();\n  }\n\n  shouldPrint(timestamp, message) {\n    const allowed = this.nextAllowed.get(message);\n    if (allowed !== undefined && timestamp < allowed) return false;\n    this.nextAllowed.set(message, timestamp + 10);\n    return true;\n  }\n}\n",
    "tests": [
      {
        "name": "the standard example",
        "body": "const log = new Logger();\nassert.equal(log.shouldPrint(1, 'foo'), true);\nassert.equal(log.shouldPrint(2, 'bar'), true);\nassert.equal(log.shouldPrint(3, 'foo'), false);\nassert.equal(log.shouldPrint(8, 'bar'), false);\nassert.equal(log.shouldPrint(10, 'foo'), false);\nassert.equal(log.shouldPrint(11, 'foo'), true);"
      },
      {
        "name": "exactly ten seconds later is allowed",
        "body": "const log = new Logger();\nassert.equal(log.shouldPrint(5, 'a'), true);\nassert.equal(log.shouldPrint(14, 'a'), false);\nassert.equal(log.shouldPrint(15, 'a'), true);"
      },
      {
        "name": "a refused call does not restart the window",
        "body": "const log = new Logger();\nassert.equal(log.shouldPrint(0, 'x'), true);\nassert.equal(log.shouldPrint(9, 'x'), false);\nassert.equal(log.shouldPrint(10, 'x'), true);"
      },
      {
        "name": "different messages are independent",
        "body": "const log = new Logger();\nassert.equal(log.shouldPrint(1, 'a'), true);\nassert.equal(log.shouldPrint(1, 'b'), true);\nassert.equal(log.shouldPrint(1, 'a'), false);\nassert.equal(log.shouldPrint(1, 'b'), false);"
      },
      {
        "name": "the same timestamp twice is refused the second time",
        "body": "const log = new Logger();\nassert.equal(log.shouldPrint(0, 'm'), true);\nassert.equal(log.shouldPrint(0, 'm'), false);"
      },
      {
        "name": "a message printed long ago may print again",
        "body": "const log = new Logger();\nassert.equal(log.shouldPrint(1, 'm'), true);\nassert.equal(log.shouldPrint(1000, 'm'), true);\nassert.equal(log.shouldPrint(1009, 'm'), false);"
      },
      {
        "name": "random calls against a log of printed times",
        "body": "let seed = 20261013;\nconst rand = (n) => { seed = (seed * 16807) % 2147483647; return seed % n; };\nfor (let t = 0; t < 300; t++) {\n  const log = new Logger();\n  const printed = new Map();\n  let time = 0;\n  for (let step = 0; step < 60; step++) {\n    time += rand(5);\n    const message = 'm' + rand(4);\n    const last = printed.get(message);\n    const expected = last === undefined || time - last >= 10;\n    if (expected) printed.set(message, time);\n    assert.equal(log.shouldPrint(time, message), expected);\n  }\n}"
      }
    ]
  },
  {
    "id": "ex-moving-average-from-data-stream",
    "chapter": "dsa-design-simulation",
    "level": "beginner",
    "title": "Moving Average from a Data Stream",
    "brief": "<p>Design a class that keeps the average of the most recent numbers of a stream.</p><ul><li><code>new MovingAverage(size)</code> - the window holds the last <code>size</code> numbers; <code>size</code> is at least 1</li><li><code>next(value)</code> - add <code>value</code> and return the average of the numbers in the window. Until <code>size</code> numbers have arrived, the window holds all of them</li><li>Each call must be O(1): do not add up the window again on every call. The memory should be O(size)</li></ul>",
    "starter": "class MovingAverage {\n  constructor(size) {\n    // TODO\n  }\n\n  next(value) {\n    // TODO: the average of the last size values\n  }\n}\n",
    "hints": [
      "Re-adding the window costs O(size) per call. Keep the sum instead: add the newcomer and subtract the value that falls out.",
      "The value that falls out is always the oldest one. Store the window in an array of length size used as a ring: the slot for the n-th value is n % size, which is where the oldest value sits.",
      "Start the ring filled with zeros so that subtracting the content of an unused slot changes nothing. Divide by the number of values counted so far, capped at size."
    ],
    "solution": "class MovingAverage {\n  constructor(size) {\n    this.window = new Array(size).fill(0);\n    this.count = 0;\n    this.sum = 0;\n  }\n\n  next(value) {\n    const slot = this.count % this.window.length;\n    this.sum += value - this.window[slot];\n    this.window[slot] = value;\n    this.count++;\n    return this.sum / Math.min(this.count, this.window.length);\n  }\n}\n",
    "tests": [
      {
        "name": "the standard example",
        "body": "const m = new MovingAverage(3);\nassert.equal(m.next(1), 1);\nassert.equal(m.next(10), 5.5);\nassert.ok(Math.abs(m.next(3) - 14 / 3) < 1e-9);\nassert.equal(m.next(5), 6);"
      },
      {
        "name": "a window of one is the value itself",
        "body": "const m = new MovingAverage(1);\nassert.equal(m.next(4), 4);\nassert.equal(m.next(-7), -7);\nassert.equal(m.next(0), 0);"
      },
      {
        "name": "before the window is full, the average is over what has arrived",
        "body": "const m = new MovingAverage(5);\nassert.equal(m.next(10), 10);\nassert.equal(m.next(20), 15);\nassert.equal(m.next(30), 20);"
      },
      {
        "name": "negative numbers and zeros",
        "body": "const m = new MovingAverage(2);\nassert.equal(m.next(-4), -4);\nassert.equal(m.next(0), -2);\nassert.equal(m.next(6), 3);\nassert.equal(m.next(0), 3);\nassert.equal(m.next(0), 0);"
      },
      {
        "name": "a long stream stays correct after the ring wraps many times",
        "body": "const m = new MovingAverage(4);\nlet last = 0;\nfor (let i = 1; i <= 1000; i++) last = m.next(i);\nassert.equal(last, (997 + 998 + 999 + 1000) / 4);"
      },
      {
        "name": "a large window does not have to be re-added on every call",
        "body": "const m = new MovingAverage(30000);\nlet last = 0;\nfor (let i = 0; i < 30000; i++) last = m.next(2);\nassert.equal(last, 2);\nfor (let i = 0; i < 30000; i++) last = m.next(4);\nassert.equal(last, 4);"
      },
      {
        "name": "random integers against recomputing the window",
        "body": "let seed = 20261013;\nconst rand = (n) => { seed = (seed * 16807) % 2147483647; return seed % n; };\nfor (let t = 0; t < 300; t++) {\n  const size = 1 + rand(6);\n  const m = new MovingAverage(size);\n  const values = [];\n  for (let step = 0; step < 40; step++) {\n    const v = rand(2001) - 1000;\n    values.push(v);\n    const window = values.slice(-size);\n    assert.equal(m.next(v), window.reduce((a, b) => a + b, 0) / window.length);\n  }\n}"
      }
    ]
  },
  {
    "id": "ex-underground-system",
    "chapter": "dsa-design-simulation",
    "level": "intermediate",
    "title": "Underground System",
    "brief": "<p>Design a system that records journeys between stations and reports average journey times.</p><ul><li><code>checkIn(id, stationName, t)</code> - the card <code>id</code> enters <code>stationName</code> at time <code>t</code>. A card has at most one open journey at a time</li><li><code>checkOut(id, stationName, t)</code> - the card leaves <code>stationName</code> at time <code>t</code>, completing its journey</li><li><code>getAverageTime(startStation, endStation)</code> - the average duration of all completed journeys that started at <code>startStation</code> and ended at <code>endStation</code>. A route is directional: A to B is not B to A. It is only asked for routes that have at least one journey</li><li>Station names are arbitrary strings; they may contain commas or other punctuation</li><li>Every call should be O(1) on average</li></ul>",
    "starter": "class UndergroundSystem {\n  constructor() {\n    // TODO\n  }\n\n  checkIn(id, stationName, t) {\n    // TODO\n  }\n\n  checkOut(id, stationName, t) {\n    // TODO\n  }\n\n  getAverageTime(startStation, endStation) {\n    // TODO\n  }\n}\n",
    "hints": [
      "Two questions need two maps: 'where and when did this card check in?' and 'what are the totals for this route?'.",
      "For the route totals, do not store the average: an average cannot be updated without the number of values behind it. Store the sum of durations and the count of journeys, and divide in getAverageTime.",
      "The route key is an ordered pair. Joining the two names with a separator breaks when a name contains that separator ('a,b' + 'c' and 'a' + 'b,c' collide). JSON.stringify([from, to]) keeps them apart, and so does a Map of Maps. Delete the open journey on check-out."
    ],
    "solution": "class UndergroundSystem {\n  constructor() {\n    this.checkedIn = new Map();\n    this.trips = new Map();\n  }\n\n  checkIn(id, stationName, t) {\n    this.checkedIn.set(id, { station: stationName, time: t });\n  }\n\n  checkOut(id, stationName, t) {\n    const { station, time } = this.checkedIn.get(id);\n    this.checkedIn.delete(id);\n    const key = JSON.stringify([station, stationName]);\n    const total = this.trips.get(key) ?? { sum: 0, count: 0 };\n    total.sum += t - time;\n    total.count++;\n    this.trips.set(key, total);\n  }\n\n  getAverageTime(startStation, endStation) {\n    const total = this.trips.get(JSON.stringify([startStation, endStation]));\n    return total.sum / total.count;\n  }\n}\n",
    "tests": [
      {
        "name": "the standard example",
        "body": "const u = new UndergroundSystem();\nu.checkIn(45, 'Leyton', 3);\nu.checkIn(32, 'Paradise', 8);\nu.checkIn(27, 'Leyton', 10);\nu.checkOut(45, 'Waterloo', 15);\nu.checkOut(27, 'Waterloo', 20);\nu.checkOut(32, 'Cambridge', 22);\nassert.equal(u.getAverageTime('Paradise', 'Cambridge'), 14);\nassert.equal(u.getAverageTime('Leyton', 'Waterloo'), 11);\nu.checkIn(10, 'Leyton', 24);\nassert.equal(u.getAverageTime('Leyton', 'Waterloo'), 11);\nu.checkOut(10, 'Waterloo', 38);\nassert.equal(u.getAverageTime('Leyton', 'Waterloo'), 12);"
      },
      {
        "name": "the average is not an integer in general",
        "body": "const u = new UndergroundSystem();\nu.checkIn(1, 'A', 0);\nu.checkOut(1, 'B', 1);\nu.checkIn(2, 'A', 0);\nu.checkOut(2, 'B', 2);\nassert.equal(u.getAverageTime('A', 'B'), 1.5);\nu.checkIn(3, 'A', 0);\nu.checkOut(3, 'B', 4);\nassert.equal(u.getAverageTime('A', 'B'), 7 / 3);"
      },
      {
        "name": "a route is directional",
        "body": "const u = new UndergroundSystem();\nu.checkIn(1, 'A', 0);\nu.checkOut(1, 'B', 10);\nu.checkIn(2, 'B', 0);\nu.checkOut(2, 'A', 30);\nassert.equal(u.getAverageTime('A', 'B'), 10);\nassert.equal(u.getAverageTime('B', 'A'), 30);"
      },
      {
        "name": "a card can travel again after checking out",
        "body": "const u = new UndergroundSystem();\nu.checkIn(9, 'A', 0);\nu.checkOut(9, 'B', 5);\nu.checkIn(9, 'B', 6);\nu.checkOut(9, 'C', 16);\nu.checkIn(9, 'A', 20);\nu.checkOut(9, 'B', 31);\nassert.equal(u.getAverageTime('A', 'B'), 8);\nassert.equal(u.getAverageTime('B', 'C'), 10);"
      },
      {
        "name": "station names with commas do not collide",
        "body": "const u = new UndergroundSystem();\nu.checkIn(1, 'a,b', 0);\nu.checkOut(1, 'c', 10);\nu.checkIn(2, 'a', 0);\nu.checkOut(2, 'b,c', 50);\nassert.equal(u.getAverageTime('a,b', 'c'), 10);\nassert.equal(u.getAverageTime('a', 'b,c'), 50);"
      },
      {
        "name": "interleaved journeys on the same route",
        "body": "const u = new UndergroundSystem();\nu.checkIn(1, 'A', 0);\nu.checkIn(2, 'A', 2);\nu.checkIn(3, 'A', 4);\nu.checkOut(3, 'B', 5);\nu.checkOut(1, 'B', 9);\nu.checkOut(2, 'B', 12);\nassert.equal(u.getAverageTime('A', 'B'), (1 + 9 + 10) / 3);"
      },
      {
        "name": "random journeys against a stored list of every trip",
        "body": "let seed = 20261013;\nconst rand = (n) => { seed = (seed * 16807) % 2147483647; return seed % n; };\nconst names = ['A', 'B', 'a,b', 'c', 'a', 'b,c', 'x'];\nfor (let t = 0; t < 200; t++) {\n  const u = new UndergroundSystem();\n  const trips = [];\n  const open = new Map();\n  let time = 0;\n  for (let step = 0; step < 60; step++) {\n    time += rand(5);\n    const id = rand(5);\n    const station = names[rand(names.length)];\n    if (open.has(id)) {\n      const start = open.get(id);\n      open.delete(id);\n      u.checkOut(id, station, time);\n      trips.push({ from: start.station, to: station, d: time - start.time });\n    } else {\n      open.set(id, { station, time });\n      u.checkIn(id, station, time);\n    }\n    const a = names[rand(names.length)];\n    const b = names[rand(names.length)];\n    const match = trips.filter((x) => x.from === a && x.to === b);\n    if (match.length > 0) assert.equal(u.getAverageTime(a, b), match.reduce((s, x) => s + x.d, 0) / match.length);\n  }\n}"
      }
    ]
  },
  {
    "id": "ex-parking-lot-lowest-slot",
    "chapter": "dsa-design-simulation",
    "level": "intermediate",
    "title": "Parking Lot with the Lowest Free Slot",
    "brief": "<p>Design a parking lot with numbered slots <code>1</code> to <code>slots</code>.</p><ul><li><code>new ParkingLot(slots)</code> - <code>slots</code> may be 0</li><li><code>park()</code> - give the arriving car the <b>lowest-numbered free slot</b>. Return <code>{ ticket, slot }</code>, where <code>ticket</code> is a new number (1 for the first car, then 2, 3, ...), or <code>null</code> if the lot is full</li><li><code>leave(ticket)</code> - free the slot held by that ticket and return <code>true</code>. Return <code>false</code> (and change nothing) if the ticket is unknown or has already been used</li><li><code>park</code> and <code>leave</code> should be O(log s) for s slots: do not scan the slots</li></ul>",
    "starter": "class ParkingLot {\n  constructor(slots) {\n    // TODO\n  }\n\n  park() {\n    // TODO: { ticket, slot } or null\n  }\n\n  leave(ticket) {\n    // TODO: true if the ticket was open\n  }\n}\n",
    "hints": [
      "Two things must be known: which slots are free (and the lowest of them), and which slot each open ticket holds.",
      "A min-heap of the free slot numbers gives the lowest in O(log s), and a Map from ticket to slot says where each car is. Every slot is in exactly one of the two places.",
      "park pops the heap and records the ticket. leave must check that the ticket is in the Map before it pushes the slot back, otherwise a slot could be pushed twice and handed to two cars."
    ],
    "solution": "class Heap {\n  constructor(compare, items = []) {\n    this.compare = compare;\n    this.data = items.slice();\n    for (let i = (this.data.length >> 1) - 1; i >= 0; i--) this.siftDown(i);\n  }\n\n  size() {\n    return this.data.length;\n  }\n\n  push(item) {\n    this.data.push(item);\n    let i = this.data.length - 1;\n    while (i > 0) {\n      const parent = (i - 1) >> 1;\n      if (this.compare(this.data[i], this.data[parent]) >= 0) break;\n      [this.data[i], this.data[parent]] = [this.data[parent], this.data[i]];\n      i = parent;\n    }\n  }\n\n  pop() {\n    const top = this.data[0];\n    const last = this.data.pop();\n    if (this.data.length > 0) {\n      this.data[0] = last;\n      this.siftDown(0);\n    }\n    return top;\n  }\n\n  siftDown(i) {\n    const n = this.data.length;\n    while (true) {\n      let best = i;\n      const left = 2 * i + 1;\n      const right = left + 1;\n      if (left < n && this.compare(this.data[left], this.data[best]) < 0) best = left;\n      if (right < n && this.compare(this.data[right], this.data[best]) < 0) best = right;\n      if (best === i) break;\n      [this.data[i], this.data[best]] = [this.data[best], this.data[i]];\n      i = best;\n    }\n  }\n}\n\nclass ParkingLot {\n  constructor(slots) {\n    this.free = new Heap((a, b) => a - b, Array.from({ length: slots }, (_, i) => i + 1));\n    this.parked = new Map();\n    this.nextTicket = 1;\n  }\n\n  park() {\n    if (this.free.size() === 0) return null;\n    const slot = this.free.pop();\n    const ticket = this.nextTicket++;\n    this.parked.set(ticket, slot);\n    return { ticket, slot };\n  }\n\n  leave(ticket) {\n    const slot = this.parked.get(ticket);\n    if (slot === undefined) return false;\n    this.parked.delete(ticket);\n    this.free.push(slot);\n    return true;\n  }\n}\n",
    "tests": [
      {
        "name": "cars take the lowest slots in order",
        "body": "const p = new ParkingLot(3);\nassert.deepEqual(p.park(), { ticket: 1, slot: 1 });\nassert.deepEqual(p.park(), { ticket: 2, slot: 2 });\nassert.deepEqual(p.park(), { ticket: 3, slot: 3 });"
      },
      {
        "name": "a full lot returns null",
        "body": "const p = new ParkingLot(2);\np.park();\np.park();\nassert.equal(p.park(), null);\nassert.equal(new ParkingLot(0).park(), null);"
      },
      {
        "name": "a freed slot is reused, lowest first",
        "body": "const p = new ParkingLot(4);\nfor (let i = 0; i < 4; i++) p.park();\nassert.equal(p.leave(3), true);\nassert.equal(p.leave(1), true);\nassert.equal(p.park().slot, 1);\nassert.equal(p.park().slot, 3);\nassert.equal(p.park(), null);"
      },
      {
        "name": "tickets keep counting up",
        "body": "const p = new ParkingLot(1);\nassert.equal(p.park().ticket, 1);\np.leave(1);\nassert.equal(p.park().ticket, 2);\np.leave(2);\nassert.equal(p.park().ticket, 3);"
      },
      {
        "name": "a used or unknown ticket is rejected and changes nothing",
        "body": "const p = new ParkingLot(2);\np.park();\nassert.equal(p.leave(1), true);\nassert.equal(p.leave(1), false);\nassert.equal(p.leave(99), false);\nassert.equal(p.leave(0), false);\nassert.equal(p.park().slot, 1);\nassert.equal(p.park().slot, 2);\nassert.equal(p.park(), null);"
      },
      {
        "name": "leaving twice never hands one slot to two cars",
        "body": "const p = new ParkingLot(2);\np.park();\np.park();\np.leave(1);\np.leave(1);\nconst a = p.park();\nassert.equal(a.slot, 1);\nassert.equal(p.park(), null);"
      },
      {
        "name": "random events against a scan for the lowest free slot",
        "body": "let seed = 20261013;\nconst rand = (n) => { seed = (seed * 16807) % 2147483647; return seed % n; };\nfor (let t = 0; t < 300; t++) {\n  const capacity = rand(6);\n  const p = new ParkingLot(capacity);\n  const used = new Map();\n  let issued = 0;\n  for (let step = 0; step < 60; step++) {\n    if (rand(2) === 0) {\n      let slot = null;\n      const taken = new Set(used.values());\n      for (let s = 1; s <= capacity; s++) if (!taken.has(s)) { slot = s; break; }\n      const got = p.park();\n      if (slot === null) assert.equal(got, null);\n      else { assert.equal(got.slot, slot); assert.equal(got.ticket, ++issued); used.set(got.ticket, slot); }\n    } else {\n      const ticket = rand(issued + 3);\n      const open = used.has(ticket);\n      assert.equal(p.leave(ticket), open);\n      used.delete(ticket);\n    }\n  }\n}"
      }
    ]
  }
];
