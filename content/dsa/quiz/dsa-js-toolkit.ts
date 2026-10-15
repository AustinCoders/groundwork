import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "jt-queue-plan",
      chapter: "dsa-js-toolkit",
      level: "beginner",
      skill: "recognise",
      pattern: "js-collections",
      section: "the-queue-without-shift-a-head-index",
      placement: true,
      kind: "single",
      prompt:
        "<p>A breadth-first search over a graph with 200,000 nodes keeps its queue in an array. Which way of taking the next node keeps every step O(1)?</p>",
      choices: [
        {
          id: "a",
          text: "Call <code>queue.shift()</code>, which removes and returns the first element in one call.",
          why: "It is one call, but the language moves every remaining element down one place, so each call is O(n). Draining 200,000 items this way took about 4.5 seconds in the chapter's measurement.",
        },
        {
          id: "b",
          text: "Call <code>queue.splice(0, 1)[0]</code>, because splice only touches the front.",
          why: "Removing the first element with <code>splice</code> still leaves a gap that every later element has to close, so it is O(n) as well.",
        },
        {
          id: "c",
          text: "Read <code>queue[head]</code> and add one to <code>head</code>, leaving the array as it is.",
          why: "Nothing is deleted or moved, so a step costs the same however long the queue is. Each node is pushed once, so the array stays at most as long as the number of nodes.",
        },
        {
          id: "d",
          text: "Add with <code>queue.unshift(x)</code> and take with <code>queue.pop()</code>.",
          why: "The order is correct, since the oldest item is at the end. But <code>unshift</code> moves every element one place to the right, so each add is O(n).",
        },
      ],
      answer: "c",
    },
    {
      id: "jt-ordered-set-need",
      chapter: "dsa-js-toolkit",
      level: "beginner",
      skill: "recognise",
      pattern: "js-collections",
      section: "no-built-in-ordered-set-why-and-what-to-use",
      placement: true,
      kind: "single",
      prompt:
        "<p>About 20,000 values arrive one at a time. After each arrival you must report the largest value seen so far that is at most a given <code>x</code>. Which tool fits, using what JavaScript provides plus a few lines of your own?</p>",
      choices: [
        {
          id: "a",
          text: "A sorted array: binary search for the position, <code>splice</code> to insert, and read the neighbour.",
          why: "The search is O(log n) and the insert shifts later items, which is O(n) and fine for tens of thousands of values. Reading the item just before the position gives the answer.",
        },
        {
          id: "b",
          text: "A <code>Set</code>, asking it for <code>set.floor(x)</code>.",
          why: "A <code>Set</code> has no <code>floor</code> method. It is a hash container that remembers insertion order and knows nothing about the order of its values.",
        },
        {
          id: "c",
          text: "A <code>Map</code>, because it keeps its keys in sorted order.",
          why: "A <code>Map</code> iterates in the order the keys were inserted, not in key order, so the largest key at most <code>x</code> cannot be read off it.",
        },
        {
          id: "d",
          text: "A heap, because it keeps all of its values sorted.",
          why: "A heap only guarantees that the first item is the best one. The rest is ordered partially, and it cannot answer a question about an arbitrary <code>x</code>.",
        },
      ],
      answer: "a",
    },
    {
      id: "jt-heap-recognise",
      chapter: "dsa-js-toolkit",
      level: "beginner",
      skill: "recognise",
      pattern: "js-collections",
      section: "no-built-in-heap-a-minimal-one-with-a-comparator",
      placement: true,
      kind: "single",
      prompt:
        "<p>Merging k sorted lists means taking the smallest front element again and again while new ones are added. Which structure gives O(log n) for each insert and each removal of the smallest?</p>",
      choices: [
        {
          id: "a",
          text: "An array that is re-sorted with <code>sort()</code> after every push.",
          why: "It gives the right answers, but each re-sort costs O(n log n) comparisons in the model, which is far more than O(log n) per operation.",
        },
        {
          id: "b",
          text: "The built-in <code>PriorityQueue</code> class.",
          why: "JavaScript has no such class. Writing <code>new PriorityQueue()</code> throws a <code>ReferenceError</code>, because the name does not exist.",
        },
        {
          id: "c",
          text: "A <code>Set</code>, read in order with <code>set.values().next()</code>.",
          why: "A <code>Set</code> yields its values in insertion order, so the first value is the oldest one and not the smallest. It would also drop duplicates.",
        },
        {
          id: "d",
          text: "A binary heap that you write, kept in an array and ordered by a comparator.",
          why: "Push sifts the new item up and pop moves the last item to the root and sifts it down. Each moves along one root-to-leaf path, which is about log₂ n steps.",
        },
      ],
      answer: "d",
    },
    {
      id: "jt-shift-loop-cost",
      chapter: "dsa-js-toolkit",
      level: "beginner",
      skill: "complexity",
      pattern: "js-collections",
      section: "array-operations-and-what-they-really-cost",
      kind: "single",
      prompt:
        "<p>What is the tightest time bound for this loop, as a function of n?</p><pre><code>const a = Array.from({ length: n }, (_, i) =&gt; i);\nlet total = 0;\nwhile (a.length &gt; 0) total += a.shift();</code></pre>",
      choices: [
        {
          id: "a",
          text: "O(n)",
          why: "This would hold if each <code>shift()</code> took constant time. It moves every remaining element, so it does not.",
        },
        {
          id: "b",
          text: "O(n log n)",
          why: "Nothing in the loop halves a range or sorts. The cost comes from moving elements, not from a logarithmic number of steps.",
        },
        {
          id: "c",
          text: "O(n²)",
          why: "The k-th call moves the n − k elements that remain, so the calls move about n(n − 1)/2 elements in total. The chapter's timings grew about four times for each doubling of n.",
        },
        {
          id: "d",
          text: "O(n³)",
          why: "This is an upper bound, but not the tightest one. The total number of moves is n(n − 1)/2, which grows like n², not n³.",
        },
      ],
      answer: "c",
    },
    {
      id: "jt-spread-build-cost",
      chapter: "dsa-js-toolkit",
      level: "beginner",
      skill: "complexity",
      pattern: "js-collections",
      section: "array-operations-and-what-they-really-cost",
      kind: "single",
      prompt:
        "<p>How many element copies does this loop make in total?</p><pre><code>let p = [];\nfor (let i = 0; i &lt; n; i++) p = [...p, i];</code></pre>",
      choices: [
        {
          id: "a",
          text: "n copies, one for each new element.",
          why: "The spread copies everything that is already in <code>p</code>, not only the new element, so the number of copies is larger than n.",
        },
        {
          id: "b",
          text: "n(n − 1)/2 copies, so O(n²).",
          why: "Step i copies the i elements gathered so far, and 0 + 1 + … + (n − 1) is n(n − 1)/2. Using <code>p.push(i)</code> instead copies nothing.",
        },
        {
          id: "c",
          text: "About n log n copies, because the array is rebuilt in halves.",
          why: "The array is rebuilt from scratch at every step, not in halves. No step has a logarithmic number of copies.",
        },
        {
          id: "d",
          text: "2n copies, because the array doubles in size when it is full.",
          why: "Doubling is how <code>push</code> pays for growth. A spread builds a brand new array on every step, which is a different cost.",
        },
      ],
      answer: "b",
    },
    {
      id: "jt-sorted-add-cost",
      chapter: "dsa-js-toolkit",
      level: "beginner",
      skill: "complexity",
      pattern: "js-collections",
      section: "no-built-in-ordered-set-why-and-what-to-use",
      kind: "single",
      prompt:
        "<p>A <code>SortedList</code> stores n items in an array. Its <code>add</code> finds the position with a binary search and then calls <code>splice(position, 0, x)</code>. What does one <code>add</code> cost?</p>",
      choices: [
        {
          id: "a",
          text: "O(log n), because binary search finds the position.",
          why: "The search is O(log n), but it is only half of the work. The <code>splice</code> then shifts every item after the position by one place.",
        },
        {
          id: "b",
          text: "O(n log n), because it searches and then sorts.",
          why: "Nothing is sorted. The array is already in order, and the insert keeps it in order.",
        },
        {
          id: "c",
          text: "O(1) amortized, as with <code>push</code>.",
          why: "<code>push</code> writes after the last slot. An insert in the middle opens a gap by moving the later items, which has no amortized shortcut.",
        },
        {
          id: "d",
          text: "O(n), because of the shift that <code>splice</code> performs.",
          why: "The binary search is O(log n) and the splice moves up to n items, so the sum is O(n). The chapter measured 100,000 middle inserts at about 0.6 seconds.",
        },
      ],
      answer: "d",
    },
    {
      id: "jt-default-sort-trace",
      chapter: "dsa-js-toolkit",
      level: "beginner",
      skill: "trace",
      pattern: "js-collections",
      section: "sorting-the-default-comparator-comparators-and-stability",
      kind: "single",
      prompt: "<p>What does <code>[10, 9, 1].sort()</code> return?</p>",
      choices: [
        {
          id: "a",
          text: "<code>[1, 9, 10]</code>",
          why: "This is the numeric order, which needs the comparator <code>(a, b) =&gt; a - b</code>. Without one, <code>sort</code> compares the values as text.",
        },
        {
          id: "b",
          text: "<code>[1, 10, 9]</code>",
          why: 'The values become the strings <code>"10"</code>, <code>"9"</code> and <code>"1"</code>. Compared character by character, <code>"1"</code> comes before <code>"10"</code> because it is a prefix of it, and <code>"10"</code> comes before <code>"9"</code> because <code>"1"</code> is less than <code>"9"</code>.',
        },
        {
          id: "c",
          text: "<code>[10, 9, 1]</code>",
          why: "That is the order of the input, as if nothing were sorted. The default comparison does reorder these three values.",
        },
        {
          id: "d",
          text: "<code>[9, 10, 1]</code>",
          why: 'No rule produces this. As text, <code>"1"</code> is the smallest, so it cannot end up last.',
        },
      ],
      answer: "b",
    },
    {
      id: "jt-map-order-trace",
      chapter: "dsa-js-toolkit",
      level: "beginner",
      skill: "trace",
      pattern: "js-collections",
      section: "map-and-set-equality-order-and-composite-keys",
      kind: "single",
      prompt:
        '<p>What does the last line produce?</p><pre><code>const m = new Map();\nm.set("a", 1);\nm.set("b", 2);\nm.set("c", 3);\nm.set("a", 9);\nm.delete("b");\nm.set("b", 5);\n[...m.keys()];</code></pre>',
      choices: [
        {
          id: "a",
          text: "<code>['a', 'b', 'c']</code>",
          why: 'This ignores the delete. After <code>m.delete("b")</code> the key is gone, and setting it again adds it at the end.',
        },
        {
          id: "b",
          text: "<code>['b', 'a', 'c']</code>",
          why: 'A key that is set again is added at the end, so <code>"b"</code> cannot come back to the front.',
        },
        {
          id: "c",
          text: "<code>['c', 'a', 'b']</code>",
          why: 'Setting an existing key such as <code>"a"</code> only changes its value. It keeps its place, so <code>"a"</code> is still before <code>"c"</code>.',
        },
        {
          id: "d",
          text: "<code>['a', 'c', 'b']</code>",
          why: 'The second <code>set("a")</code> keeps <code>"a"</code> in its original place. Deleting <code>"b"</code> and setting it again moves it to the end, after <code>"c"</code>.',
        },
      ],
      answer: "d",
    },
    {
      id: "jt-int32-mask-trace",
      chapter: "dsa-js-toolkit",
      level: "beginner",
      skill: "trace",
      pattern: "js-collections",
      section: "bit-operations-and-the-32-bit-window",
      kind: "single",
      prompt: "<p>A mask of the low 31 bits is built as <code>(1 &lt;&lt; 31) - 1</code>. What value does it have?</p>",
      choices: [
        {
          id: "a",
          text: "2147483647, which is 2<sup>31</sup> − 1.",
          why: "This is what the formula means on paper. The shift works on a signed 32-bit integer, so it does not produce 2<sup>31</sup>.",
        },
        {
          id: "b",
          text: "-2147483648, the result of the shift alone.",
          why: "The shift does give -2147483648, because bit 31 is the sign bit. But the formula then subtracts 1, so the final value is not this one.",
        },
        {
          id: "c",
          text: "-2147483649, because the shift is negative and 1 is then subtracted from it.",
          why: "<code>1 &lt;&lt; 31</code> is -2147483648, and the subtraction is ordinary arithmetic, which is not limited to 32 bits. The result is -2147483649.",
        },
        {
          id: "d",
          text: "0, because the shift count wraps around to 0.",
          why: "The count wraps modulo 32, but 31 is already below 32 and stays 31. The wrap would only matter for <code>1 &lt;&lt; 32</code>.",
        },
      ],
      answer: "c",
    },
    {
      id: "jt-mulmod-edge",
      chapter: "dsa-js-toolkit",
      level: "beginner",
      skill: "edge-case",
      pattern: "js-collections",
      section: "bigint-exact-integers-with-rules",
      kind: "single",
      prompt:
        "<p>With <code>x = 999999999</code> and <code>y = 999999998</code>, the expression <code>(x * y) % 1000000007</code> gives 70, while the exact answer is 72. Why?</p>",
      choices: [
        {
          id: "a",
          text: "The <code>%</code> operator only accepts 32-bit integers, so it cuts the product down.",
          why: "<code>%</code> works on any numbers. For example, <code>5000000000 % 7</code> is 2, which is correct even though 5,000,000,000 does not fit in 32 bits.",
        },
        {
          id: "b",
          text: "The product is too large for a number to hold exactly, so it was rounded before <code>%</code> saw it.",
          why: "The exact product is 999999997000000002, but a number can only store 999999997000000000 there. <code>%</code> then works on the rounded value. A BigInt product keeps every digit.",
        },
        {
          id: "c",
          text: "The <code>*</code> operator turns both operands into 32-bit integers first.",
          why: "Only the bit operators do that. <code>x * y</code> is an ordinary floating-point product, and it prints 999999997000000000, which is not a 32-bit value.",
        },
        {
          id: "d",
          text: "The <code>%</code> operator gives a negative result for large operands.",
          why: "The remainder takes the sign of the left operand, which is positive here, and the result 70 is positive too. The sign is not the problem.",
        },
      ],
      answer: "b",
    },
    {
      id: "jt-deep-dfs-edge",
      chapter: "dsa-js-toolkit",
      level: "beginner",
      skill: "edge-case",
      pattern: "js-collections",
      section: "recursion-depth-the-stack-runs-out",
      kind: "single",
      prompt:
        "<p>A recursive depth-first search counts the nodes of a graph shaped like one long path of 100,000 nodes, starting at one end. What happens in Node 24?</p>",
      choices: [
        {
          id: "a",
          text: "It throws a <code>RangeError</code> about the call stack.",
          why: "Each node is one level deeper, so the depth reaches 100,000. The chapter measured a limit of about ten thousand levels for a tiny function, so the error is thrown.",
        },
        {
          id: "b",
          text: "It returns a count that is too small, because the frames past the limit are skipped.",
          why: "Nothing is skipped silently. When the limit is reached the engine throws, so no wrong count is returned.",
        },
        {
          id: "c",
          text: "It returns the right count, because Node removes calls that are the last step of a function.",
          why: "Node does not remove such calls. The chapter's tail-recursive <code>sumTo(100000)</code> also threw. In this search the recursive call is followed by an addition, so it is not even a last step.",
        },
        {
          id: "d",
          text: "It finishes, but only after O(n²) time because the visited set is copied at every call.",
          why: "The visited flags live in one shared array that is never copied. The problem is the depth of the recursion, not the time per call.",
        },
      ],
      answer: "a",
    },
    {
      id: "jt-map-keys-multi",
      chapter: "dsa-js-toolkit",
      level: "beginner",
      skill: "edge-case",
      pattern: "js-collections",
      section: "map-and-set-equality-order-and-composite-keys",
      kind: "multi",
      prompt: "<p>Select every statement that is true in Node 24.</p>",
      choices: [
        {
          id: "a",
          text: "<code>new Map([[NaN, 'x']]).get(NaN)</code> is <code>'x'</code>.",
          why: "Keys are compared with SameValueZero, under which <code>NaN</code> equals itself, unlike with <code>===</code>.",
        },
        {
          id: "b",
          text: "<code>new Set([1, '1']).size</code> is 1.",
          why: "A number and a string are different types, so they are different keys and the size is 2.",
        },
        {
          id: "c",
          text: "<code>new Set([[1, 2], [1, 2]]).size</code> is 2.",
          why: "Each array literal makes a new object, and objects are equal as keys only to themselves, so both stay in the set.",
        },
        {
          id: "d",
          text: "<code>new Set([1, 1n]).size</code> is 1.",
          why: "A number and a BigInt are different types, so <code>1</code> and <code>1n</code> are different keys and the size is 2.",
        },
        {
          id: "e",
          text: "<code>new Map([[-0, 'x']]).get(0)</code> is <code>'x'</code>.",
          why: "SameValueZero treats <code>+0</code> and <code>-0</code> as the same key, and the map stores the key as <code>0</code>.",
        },
      ],
      answers: ["a", "c", "e"],
    },
    {
      id: "jt-ring-grow-order",
      chapter: "dsa-js-toolkit",
      level: "beginner",
      skill: "trace",
      pattern: "js-collections",
      section: "no-built-in-deque-a-ring-buffer",
      kind: "order",
      prompt:
        "<p>The ring-buffer <code>Deque</code> is completely full, and <code>pushFront(x)</code> is called. Put what happens in order, from the first step to the last.</p>",
      items: [
        { id: "full", text: "Notice that the size equals the capacity." },
        { id: "alloc", text: "Allocate a new array twice as long." },
        { id: "copy", text: "Copy the items in front-to-back order into slots 0, 1, 2, and so on." },
        { id: "reset", text: "Make the new array the buffer and set <code>head</code> to 0." },
        { id: "write", text: "Move <code>head</code> back one slot, wrapping around, and write <code>x</code> there." },
      ],
      why: "The full check comes first, because writing into a full buffer would overwrite the front item. The copy reads each item through the old <code>head</code>, so <code>head</code> may only be reset after the copy. The new item is written last, once there is a free slot in front of the old front.",
    },
  ],
  pattern: {
    pattern: "js-collections",
    chapter: "dsa-js-toolkit",
    signals: [
      "The solution is right on paper but slow only on large inputs, and a shift, unshift, splice, concat or spread sits inside a loop.",
      "The problem needs a priority queue, a deque or an ordered set, and JavaScript has none of them built in.",
      "Numbers near 2^53, a modulus around 10^9 + 7, or bit tricks on values wider than 31 bits appear.",
      "A recursion could go tens of thousands of levels deep, such as a depth-first search on a path-shaped graph.",
    ],
    template:
      "<pre><code>for (let head = 0; head &lt; queue.length; head++) { const node = queue[head]; queue.push(next); }</code></pre>",
    time: "O(1) per queue step with a head index",
    space: "O(n)",
    styles: ["online-assessment", "phone-screen", "onsite"],
  },
};
