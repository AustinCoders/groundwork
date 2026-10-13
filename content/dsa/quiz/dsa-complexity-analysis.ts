import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "ca-what-big-o-says",
      chapter: "dsa-complexity-analysis",
      level: "beginner",
      skill: "recognise",
      pattern: "complexity-analysis",
      section: "what-big-o-actually-measures",
      placement: true,
      kind: "single",
      prompt: "<p>A teammate says their function is <code>O(n)</code>. What does that tell you?</p>",
      choices: [
        {
          id: "a",
          text: "It takes exactly n steps on an input of size n.",
          why: "Big-O hides constants and smaller terms on purpose. A function that does 3n + 7 steps is also O(n), so the notation never promises an exact count.",
        },
        {
          id: "b",
          text: "The work grows at most in proportion to n, whatever the constant factor.",
          why: "Big-O describes how the work grows as the input grows, not how many seconds it takes. A constant factor, even a large one, does not change the class.",
        },
        {
          id: "c",
          text: "It finishes within n milliseconds.",
          why: "Big-O says nothing about real time. Two O(n) functions can differ by a factor of a hundred in seconds, because Big-O ignores the constant and the machine.",
        },
        {
          id: "d",
          text: "It beats every O(n²) function on every input.",
          why: "Big-O is about the shape of growth for large n. On a small input an O(n²) function with a tiny constant can easily win, and the notation makes no promise about any single input.",
        },
      ],
      answer: "b",
    },
    {
      id: "ca-spot-the-quadratic",
      chapter: "dsa-complexity-analysis",
      level: "beginner",
      skill: "recognise",
      pattern: "complexity-analysis",
      section: "reading-complexity-out-of-code",
      placement: true,
      kind: "single",
      prompt:
        "<p>Each loop below runs inside a function that receives an array <code>arr</code> of n numbers. Which one takes quadratic time in the worst case?</p>",
      choices: [
        {
          id: "a",
          text: "<code>for (let i = 1; i &lt; n; i *= 2) total += i;</code>",
          why: "The counter doubles on every pass, so it reaches n after about log n steps. This loop is O(log n), far below quadratic.",
        },
        {
          id: "b",
          text: "<code>for (const x of arr) { if (seen.has(x)) return true; seen.add(x); }</code>, where <code>seen</code> is a <code>Set</code>",
          why: "One pass, and each <code>has</code> and <code>add</code> is O(1) on average, so this is O(n). It is the fix for the quadratic version that uses an array.",
        },
        {
          id: "c",
          text: "<code>for (const x of arr) total += arr.indexOf(x);</code>",
          why: "Only one loop is written, but <code>indexOf</code> is a loop of its own. When the values are distinct it scans further each time, so n calls of an O(n) method add up to O(n²).",
        },
        {
          id: "d",
          text: "<code>for (let i = 0; i &lt; arr.length; i += 2) total += arr[i];</code>",
          why: "Stepping by 2 halves the number of passes, but half of n is still proportional to n. A constant factor does not change the class, so this is O(n).",
        },
      ],
      answer: "c",
    },
    {
      id: "ca-two-inputs",
      chapter: "dsa-complexity-analysis",
      level: "beginner",
      skill: "complexity",
      pattern: "complexity-analysis",
      section: "multiple-inputs-when-there-isn-t-just-one-n",
      kind: "single",
      prompt:
        "<p><code>arr1</code> holds a numbers and <code>arr2</code> holds b numbers. What is the time complexity?</p><pre><code>function summarize(arr1, arr2) {\n  let sum = 0;\n  for (const x of arr1) sum += x;\n\n  let biggest = -Infinity;\n  for (const y of arr2) biggest = Math.max(biggest, y);\n\n  return sum + biggest;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "O(a + b)",
          why: "The first loop does a units of work and the second does b, one after the other, so the costs add. Keeping a and b separate says more than collapsing them into one n.",
        },
        {
          id: "b",
          text: "O(n²), because there are two loops",
          why: "Counting loops is not the rule, how they are arranged is. Two sequential loops add their costs, and the two arrays are not even the same size, so there is no single n to square.",
        },
        {
          id: "c",
          text: "O(a × b)",
          why: "A product means every element of one array meets every element of the other, which needs one loop nested inside the other. Here the loops run one after the other.",
        },
        {
          id: "d",
          text: "O(log(a + b))",
          why: "Nothing here halves the work. Both loops visit every element of their array, so the cost grows with the sizes, not with their logarithm.",
        },
      ],
      answer: "a",
    },
    {
      id: "ca-hidden-includes",
      chapter: "dsa-complexity-analysis",
      level: "beginner",
      skill: "complexity",
      pattern: "complexity-analysis",
      section: "reading-complexity-out-of-code",
      kind: "single",
      prompt:
        "<p>This function counts the distinct values in an array of n numbers. What is its worst-case time, and what is the smallest change that brings it to O(n) on average?</p><pre><code>function distinctCount(items) {\n  const unique = [];\n  for (const item of items) {\n    if (!unique.includes(item)) unique.push(item);\n  }\n  return unique.length;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "O(n), because there is only one loop. Nothing needs to change.",
          why: "The visible loop is one, but <code>includes</code> scans <code>unique</code> from the start on every pass. When all the values are different, the scans grow to 0, 1, 2, ... n - 1 comparisons.",
        },
        {
          id: "b",
          text: "O(n²), and replacing <code>includes</code> with <code>indexOf</code> would fix it.",
          why: "The bound is right, but <code>indexOf</code> is a linear scan just like <code>includes</code>. Swapping one scan for another changes nothing.",
        },
        {
          id: "c",
          text: "O(n log n), because <code>includes</code> halves the search each time.",
          why: "Halving is binary search, which needs sorted data. <code>includes</code> has no such shortcut: it walks the array one element at a time.",
        },
        {
          id: "d",
          text: "O(n²), and keeping the seen values in a <code>Set</code> with <code>has</code> and <code>add</code> fixes it.",
          why: "The worst case is every value different, which costs about n²/2 comparisons. A Set answers <code>has</code> in O(1) on average, so one pass of n cheap lookups is O(n) time. The Set holds up to n values, which is the same O(n) space the array used.",
        },
      ],
      answer: "d",
    },
    {
      id: "ca-linear-search-siblings",
      chapter: "dsa-complexity-analysis",
      level: "beginner",
      skill: "recognise",
      pattern: "complexity-analysis",
      section: "big-o-s-two-siblings-and",
      kind: "single",
      prompt:
        "<p>Linear search scans an unsorted array of n numbers from the left. It stops at the first match, or returns -1 if the target is missing. Which statement is correct?</p>",
      choices: [
        {
          id: "a",
          text: "It is Θ(n), because it always scans the whole array.",
          why: "It does not always scan everything: it stops at the first match. When the target is the first element, a single comparison is enough.",
        },
        {
          id: "b",
          text: "It is O(1), because the best case finds the target at once.",
          why: "Unless you are told otherwise, an interviewer wants the worst case, and a missing target forces a full scan. The best case is a lucky input, so O(1) is not a bound that holds for every input.",
        },
        {
          id: "c",
          text: "It is O(n) and Ω(1), so no single Θ bound describes its time on every input.",
          why: "O(n) is the ceiling, reached when the target is last or missing, and Ω(1) is the floor, reached when it is first. Θ needs both to meet, and here they differ.",
        },
        {
          id: "d",
          text: "It is O(log n) on average, because each comparison rules out half of the array.",
          why: "Ruling out half the array per comparison is what binary search does, and only on sorted data. Linear search rules out one element per comparison.",
        },
      ],
      answer: "c",
    },
    {
      id: "ca-trace-doubling-loop",
      chapter: "dsa-complexity-analysis",
      level: "beginner",
      skill: "trace",
      pattern: "complexity-analysis",
      section: "reading-complexity-out-of-code",
      kind: "single",
      prompt:
        "<p>How many times does <code>count++</code> run?</p><pre><code>let count = 0;\nfor (let i = 1; i &lt; 100; i *= 2) {\n  count++;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "6",
          why: "That skips a pass. The first pass is with <code>i = 1</code>, so the values of <code>i</code> that run are 1, 2, 4, 8, 16, 32 and 64.",
        },
        {
          id: "b",
          text: "7",
          why: "<code>i</code> takes the values 1, 2, 4, 8, 16, 32 and 64. The next value, 128, fails <code>i &lt; 100</code>. Seven passes for a limit near 100 is the log n pattern: the counter doubles, so it needs about log₂ n steps to reach n.",
        },
        {
          id: "c",
          text: "8",
          why: "The value 128 is computed, but the test <code>i &lt; 100</code> fails before the body runs, so it does not count.",
        },
        {
          id: "d",
          text: "99",
          why: "That is what the loop would do with <code>i++</code>. Multiplying by 2 skips almost every value, which is exactly why the loop is O(log n) and not O(n).",
        },
      ],
      answer: "b",
    },
    {
      id: "ca-trace-call-count",
      chapter: "dsa-complexity-analysis",
      level: "beginner",
      skill: "trace",
      pattern: "complexity-analysis",
      section: "recurrence-relations-how-you-actually-derive-o-n-log-n",
      kind: "single",
      prompt:
        "<p>What is the value of <code>calls</code> after <code>walk(8)</code> returns?</p><pre><code>let calls = 0;\n\nfunction walk(n) {\n  calls++;\n  if (n &lt;= 1) return;\n  walk(n / 2);\n  walk(n / 2);\n}\n\nwalk(8);</code></pre>",
      choices: [
        {
          id: "a",
          text: "7",
          why: "Seven is the number of calls that go on to recurse: 1 at size 8, 2 at size 4 and 4 at size 2. The 8 calls at size 1 count too, because each one increments <code>calls</code> before it returns.",
        },
        {
          id: "b",
          text: "8",
          why: "Eight is only the calls at size 1, the leaves of the tree. Every call higher up has also run <code>calls++</code>.",
        },
        {
          id: "c",
          text: "16",
          why: "The levels hold 1, 2, 4 and 8 calls. A fifth level of 16 would need <code>walk</code> to recurse on size 1, but <code>n &lt;= 1</code> returns first.",
        },
        {
          id: "d",
          text: "15",
          why: "The calls form a tree: 1 call at size 8, 2 at size 4, 4 at size 2 and 8 at size 1, which is 15 in all. That is 2n - 1 calls, matching the recurrence T(n) = 2T(n/2) + O(1), which is O(n).",
        },
      ],
      answer: "d",
    },
    {
      id: "ca-space-recursion",
      chapter: "dsa-complexity-analysis",
      level: "beginner",
      skill: "complexity",
      pattern: "complexity-analysis",
      section: "space-complexity-the-part-people-forget",
      kind: "single",
      prompt:
        "<p>A teammate says <code>sumTo</code> uses O(1) extra space because it never creates an array or an object. What does it really cost in space?</p><pre><code>function sumTo(n) {\n  if (n === 0) return 0;\n  return n + sumTo(n - 1);\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "O(n), because about n calls are waiting on the stack at the deepest point.",
          why: "<code>sumTo(n)</code> cannot return until <code>sumTo(n - 1)</code> does, so n + 1 frames pile up before the first one is released. The loop version needs only a running total, which is O(1). For very large n the recursive one can even overflow the stack.",
        },
        {
          id: "b",
          text: "O(log n), because the argument shrinks on every call.",
          why: "The argument shrinks by 1, not by half, so there are n calls waiting at the deepest point. Halving would be needed for a log n depth.",
        },
        {
          id: "c",
          text: "O(1), because no new data structure is allocated.",
          why: "Variables are not the only memory a program uses. Each call that has not returned yet keeps a frame on the call stack, and the stack counts toward space.",
        },
        {
          id: "d",
          text: "O(n²), because there are n calls and each one adds n.",
          why: "Each frame holds a fixed amount of data, so n frames cost n times a constant. Nothing in a frame grows with n.",
        },
      ],
      answer: "a",
    },
    {
      id: "ca-push-amortized",
      chapter: "dsa-complexity-analysis",
      level: "beginner",
      skill: "complexity",
      pattern: "complexity-analysis",
      section: "amortized-complexity-the-array-push-case",
      kind: "multi",
      prompt:
        "<p>An empty JavaScript array has <code>push</code> called on it n times in a row. Select every statement that is true.</p>",
      choices: [
        {
          id: "a",
          text: "A single <code>push</code> can cost O(n), when the underlying buffer is full and everything is copied into a bigger one.",
          why: "Most pushes just write into a free slot. Now and then the buffer is full, and the engine allocates a larger one and copies every element across, which is O(n) for that one call.",
        },
        {
          id: "b",
          text: 'The n pushes cost O(n) in total, which is what "amortized O(1) per push" means.',
          why: "The buffer grows by a constant factor each time, doubling in the textbook case, so the copies cost about 1 + 2 + 4 + ... + n/2, which adds up to about n. Spread over n pushes, that is a constant per push.",
        },
        {
          id: "c",
          text: '"Amortized O(1)" means <code>push</code> is fast on average over random input values.',
          why: "That describes the average case, which is about the distribution of inputs. Amortized cost is about a sequence of operations on one structure, and it holds whatever values you push.",
        },
        {
          id: "d",
          text: "Because of the occasional copy, the n pushes cost O(n²) in total.",
          why: "That would be true if the buffer grew by one slot each time, since every push would copy everything. Doubling makes the copies rare enough that they sum to about n, not n².",
        },
      ],
      answers: ["a", "b"],
    },
    {
      id: "ca-best-and-worst-input",
      chapter: "dsa-complexity-analysis",
      level: "beginner",
      skill: "edge-case",
      pattern: "complexity-analysis",
      section: "best-average-and-worst-case-three-different-questions",
      kind: "single",
      prompt:
        "<p>How much work does <code>hasRepeat</code> do on <code>[5, 5, 1, 2, 3, 4]</code>, and how much on n values that are all different?</p><pre><code>function hasRepeat(arr) {\n  const seen = [];\n  for (const x of arr) {\n    if (seen.includes(x)) return true;\n    seen.push(x);\n  }\n  return false;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "O(n) on both, because it is one loop over the array.",
          why: "The loop can run n times, but each <code>includes</code> call is a scan of its own. With all values different, the scans grow to 0, 1, 2, ... n - 1 comparisons, which is about n²/2 in all.",
        },
        {
          id: "b",
          text: "O(1) on both, because <code>includes</code> stops at a match.",
          why: "It stops at a match, but when no value repeats there is never a match to stop at. Every call then scans all of <code>seen</code> and finds nothing.",
        },
        {
          id: "c",
          text: "O(n²) on both, because <code>includes</code> is always a full scan.",
          why: "<code>includes</code> stops at the first match, and here the match is the very first element it looks at. A scan only costs its full length when the value is missing.",
        },
        {
          id: "d",
          text: "O(1) on the repeat, and O(n²) on the all-different input.",
          why: "The second 5 is found on the second pass: <code>seen</code> holds one element, so the function stops after one comparison. When nothing repeats it never stops early, and the total comparisons are 0 + 1 + ... + (n - 1).",
        },
      ],
      answer: "d",
    },
    {
      id: "ca-order-master-theorem",
      chapter: "dsa-complexity-analysis",
      level: "beginner",
      skill: "complexity",
      pattern: "complexity-analysis",
      section: "recurrence-relations-how-you-actually-derive-o-n-log-n",
      kind: "order",
      prompt:
        "<p>Merge sort splits the array into two halves, sorts each half recursively, then merges the two sorted halves in linear time. Put the steps that give its running time with the master theorem in order.</p>",
      items: [
        {
          id: "read",
          text: "Read the code: two recursive calls on halves, plus a linear merge.",
        },
        {
          id: "write",
          text: "Write the recurrence <code>T(n) = 2T(n/2) + O(n)</code>.",
        },
        {
          id: "params",
          text: "Read <code>a</code>, <code>b</code> and <code>d</code> off the recurrence: <code>a = 2</code>, <code>b = 2</code> and <code>d = 1</code>.",
        },
        {
          id: "compare",
          text: "Work out <code>log_b(a) = log_2(2) = 1</code> and compare it with <code>d = 1</code>.",
        },
        {
          id: "conclude",
          text: "They are equal, so the balanced case applies and <code>T(n) = O(n log n)</code>.",
        },
      ],
      why: "Each step feeds the next: the code gives you the recurrence, the recurrence gives you a, b and d, and you need all three before you can compare d with log_b(a). Only the comparison tells you which of the three cases you are in, so the answer comes last.",
    },
  ],
  pattern: {
    pattern: "complexity-analysis",
    chapter: "dsa-complexity-analysis",
    signals: [
      "The prompt asks for the time or space complexity of some code or of your own approach.",
      "A loop calls includes, indexOf, a spread or a slice inside another loop.",
      "The function recurses, so the cost depends on the number of calls and the depth of the stack.",
      "Two inputs of different sizes appear, so one n is not enough.",
      "The interviewer asks whether you can do better than the first version.",
    ],
    template:
      "<pre><code>time = iterations of each loop (multiplied when nested, added in sequence)\n       × cost of every call made inside the loop\nrecursion: T(n) = a × T(n / b) + O(n^d), then compare d with log_b(a)\nspace = extra structures + deepest call stack</code></pre>",
    time: "Read off by counting loops and calls",
    space: "Extra memory plus call-stack depth",
    styles: ["online-assessment", "phone-screen", "onsite"],
  },
};
