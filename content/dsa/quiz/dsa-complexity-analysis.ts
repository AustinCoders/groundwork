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
          text: "It takes exactly n steps on an input of size n, no more and no fewer.",
          why: "Big-O hides constants and smaller terms on purpose. A function that does 3n + 7 steps is also O(n), so the notation never promises an exact count.",
        },
        {
          id: "b",
          text: "Work grows at most in proportion to n, whatever the constant.",
          why: "Big-O describes how the work grows as the input grows, not how many seconds it takes. A constant factor, even a large one, does not change the class.",
        },
        {
          id: "c",
          text: "It finishes within n milliseconds on an input of size n.",
          why: "Big-O says nothing about real time. Two O(n) functions can differ by a factor of a hundred in seconds, because Big-O ignores the constant and the machine.",
        },
        {
          id: "d",
          text: "It beats every O(n²) function on every input, however small.",
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
          text: "O(n), because about n calls wait on the stack at the deepest point.",
          why: "<code>sumTo(n)</code> cannot return until <code>sumTo(n - 1)</code> does, so n + 1 frames pile up before the first one is released. The loop version needs only a running total, which is O(1). For very large n the recursive one can even overflow the stack.",
        },
        {
          id: "b",
          text: "O(log n), because the argument shrinks on every call, so few calls pile up.",
          why: "The argument shrinks by 1, not by half, so there are n calls waiting at the deepest point. Halving would be needed for a log n depth.",
        },
        {
          id: "c",
          text: "O(1), because no new array, object or other data structure is allocated.",
          why: "Variables are not the only memory a program uses. Each call that has not returned yet keeps a frame on the call stack, and the stack counts toward space.",
        },
        {
          id: "d",
          text: "O(n²), because there are n calls and each one adds n more.",
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
    {
      id: "ca-harmonic-inner-stride",
      chapter: "dsa-complexity-analysis",
      level: "beginner",
      skill: "complexity",
      pattern: "complexity-analysis",
      section: "loops-that-don-t-count-up-by-one",
      kind: "single",
      prompt:
        "<p>What is the time complexity of this function?</p><pre><code>function f(n) {\n  let steps = 0;\n  for (let i = 1; i &lt;= n; i++) {\n    for (let j = i; j &lt;= n; j += i) steps++;\n  }\n  return steps;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "O(n²), because there are two nested loops that both run up to n.",
          why: "The inner variable takes steps of size <code>i</code>, so the inner loop runs only about n / i times. Only <code>i = 1</code> gets close to n passes. Two loops up to n give n² only when the inner one runs about n times for every outer value.",
        },
        {
          id: "b",
          text: "O(n), because the inner loop skips most values.",
          why: "The inner loop does skip values, but it runs n/1 times for <code>i = 1</code>, n/2 for <code>i = 2</code>, and so on. Those counts add up to n · (1 + 1/2 + 1/3 + ...), which is more than n.",
        },
        {
          id: "c",
          text: "O(n log n), because the inner loop runs n / i times and those counts sum to about n · ln n.",
          why: "For each <code>i</code> the inner body runs ⌊n / i⌋ times. Summing n / i over i = 1..n is n times the harmonic number, which grows like ln n. For n = 100 the exact count is 482.",
        },
        {
          id: "d",
          text: "O(√n), because the stride grows with <code>i</code>.",
          why: "A square root appears when the condition is <code>i * i &lt;= n</code>, not when the stride grows. Here the outer loop alone already runs n times, so the total can never be below n.",
        },
      ],
      answer: "c",
    },
    {
      id: "ca-trace-pointer-moves",
      chapter: "dsa-complexity-analysis",
      level: "beginner",
      skill: "trace",
      pattern: "complexity-analysis",
      section: "loops-that-don-t-count-up-by-one",
      kind: "single",
      prompt:
        "<p>How many times in total is a pointer moved (each pass of the <code>for</code> body counts once, and each pass of the <code>while</code> body counts once) in this call, <code>countWindowMoves([4, 2, 3, 5, 1], 6)</code>?</p><pre><code>function countWindowMoves(nums, limit) {\n  let left = 0, sum = 0, moves = 0;\n  for (let right = 0; right &lt; nums.length; right++) {\n    sum += nums[right];\n    moves++;\n    while (sum &gt; limit &amp;&amp; left &lt;= right) {\n      sum -= nums[left];\n      left++;\n      moves++;\n    }\n  }\n  return moves;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "5",
          why: "That is only the moves of <code>right</code>. The window also shrinks: at <code>right = 2</code> the sum is 9, which is over 6, so <code>left</code> has to move.",
        },
        {
          id: "b",
          text: "10",
          why: "Ten is 2n, the most this loop could ever do, and it would need <code>left</code> to move five times. Here <code>left</code> ends at index 3, so it moves three times.",
        },
        {
          id: "c",
          text: "8",
          why: "<code>right</code> moves 5 times. <code>left</code> moves once at <code>right = 2</code> (dropping 4, sum 5), then twice at <code>right = 3</code> (dropping 2 and 3, sum 5), and not at all at <code>right = 4</code>. 5 + 3 = 8, below the bound 2n = 10.",
        },
        {
          id: "d",
          text: "25",
          why: "Twenty-five is n². The inner loop does not restart: <code>left</code> never goes backwards, so across the whole call it can move at most n times in total.",
        },
      ],
      answer: "c",
    },
    {
      id: "ca-filter-includes",
      chapter: "dsa-complexity-analysis",
      level: "beginner",
      skill: "complexity",
      pattern: "complexity-analysis",
      section: "what-built-in-calls-really-cost",
      kind: "single",
      prompt:
        "<p><code>a</code> has n numbers and <code>b</code> has m numbers. What does <code>a.filter((x) =&gt; b.includes(x))</code> cost in time?</p>",
      choices: [
        {
          id: "a",
          text: "O(n + m)",
          why: "That is the cost of two separate passes. Here the callback of <code>filter</code> calls <code>includes</code>, which scans <code>b</code>, and it does so once for every element of <code>a</code>. The two scans are nested, not sequential.",
        },
        {
          id: "b",
          text: "O(n · m) in the worst case",
          why: "<code>filter</code> calls its callback n times, and each <code>b.includes(x)</code> can scan all m elements when <code>x</code> is missing. n calls of an O(m) method make O(n · m). Putting <code>b</code> into a <code>Set</code> first brings it to O(n + m) on average.",
        },
        {
          id: "c",
          text: "O(n log m)",
          why: "A log factor would need a sorted <code>b</code> and a binary search. <code>includes</code> does not assume sorted input, so it is a plain scan.",
        },
        {
          id: "d",
          text: "O(n), because <code>includes</code> is a single method call.",
          why: "How many method calls appear on the line says nothing about how much work each one does. <code>includes</code> is a loop over <code>b</code> inside the engine, which makes the single line a nested loop.",
        },
      ],
      answer: "b",
    },
    {
      id: "ca-memo-states-work",
      chapter: "dsa-complexity-analysis",
      level: "beginner",
      skill: "complexity",
      pattern: "complexity-analysis",
      section: "memoized-recursion-states-times-work-per-state",
      kind: "single",
      prompt:
        '<p>A memoized <code>solve(left)</code> answers "fewest coins for this amount". For every <code>left</code> from 1 to <code>amount</code> it loops over all k coin values and calls <code>solve(left - coin)</code>; results are cached by <code>left</code>. What is its running time?</p>',
      choices: [
        {
          id: "a",
          text: "O(amount), because each state is solved once.",
          why: "Each state's body does run once, but that body loops over k coins. Time is the number of states times the work inside one state, so the factor k stays.",
        },
        {
          id: "b",
          text: "O(k^amount), because every call branches k ways.",
          why: "That is the cost without the cache. With the cache, a state that has been solved answers in O(1), so the branching tree collapses to one body per state.",
        },
        {
          id: "c",
          text: "O(amount²), because there are amount states and each can look at every smaller amount.",
          why: "Each state looks at k other states, one per coin, not at every smaller amount. Only when k is as large as the amount does the count approach amount².",
        },
        {
          id: "d",
          text: "O(amount · k) time with O(amount) space for the cache.",
          why: "There are <code>amount</code> distinct states, each runs one loop of k coins, and every repeat is a cache hit costing O(1). The cache holds one entry per state.",
        },
      ],
      answer: "d",
    },
    {
      id: "ca-limit-rules-out",
      chapter: "dsa-complexity-analysis",
      level: "beginner",
      skill: "recognise",
      pattern: "complexity-analysis",
      section: "the-constraints-tell-you-the-target-complexity",
      placement: true,
      kind: "single",
      prompt:
        "<p>A problem gives an array of up to 100,000 numbers and asks whether some pair adds up to a target. Reading only that limit, which first idea can you rule out before writing any code?</p>",
      choices: [
        {
          id: "a",
          text: "Sort the array, then walk two pointers in from both ends.",
          why: "Sorting is O(n log n), about 1.7 million steps for 100,000 numbers, and the pointer walk is O(n). That fits comfortably.",
        },
        {
          id: "b",
          text: "Check every pair with two nested loops.",
          why: "Pairs number about n² / 2, which is around 5 billion for n = 100,000. That is far beyond the roughly 10⁸ steps you can plan for, so the idea is out.",
        },
        {
          id: "c",
          text: "Walk the array once with a <code>Set</code> of values seen so far.",
          why: "One pass with O(1) average lookups is O(n), and 100,000 steps is tiny. The limit allows it.",
        },
        {
          id: "d",
          text: "Put every value in a <code>Set</code> first, then loop once asking for <code>target - x</code>.",
          why: "Two linear passes are still O(n). The extra memory for 100,000 numbers is small, so the limit does not exclude this one either.",
        },
      ],
      answer: "b",
    },
    {
      id: "ca-potential-full-push",
      chapter: "dsa-complexity-analysis",
      level: "beginner",
      skill: "complexity",
      pattern: "complexity-analysis",
      section: "the-potential-method-amortized-cost-with-a-bank-account",
      kind: "single",
      prompt:
        "<p>A dynamic array uses the potential Φ = 2 · size − capacity. A push arrives when size = capacity = 8, so the array must double and copy its 8 elements, then write the new one. What is the amortized cost of this push?</p>",
      choices: [
        {
          id: "a",
          text: "9",
          why: "Nine is the actual cost: 8 copies and 1 write. Amortized cost is the actual cost plus the change in potential, and the potential drops here.",
        },
        {
          id: "b",
          text: "1",
          why: "One is the actual cost of a push that has room to spare. This push triggers a copy, so its actual cost is 9, and the potential change then brings the amortized figure down.",
        },
        {
          id: "c",
          text: "3",
          why: "Φ was 2 · 8 − 8 = 8 before the push and is 2 · 9 − 16 = 2 after it. The change is −6, so the amortized cost is 9 + (−6) = 3, the same as for a cheap push.",
        },
        {
          id: "d",
          text: "17",
          why: "Seventeen would be the actual cost of copying 16 elements and writing one, which is the next full push. Neither the actual cost nor the amortized cost of this one is that.",
        },
      ],
      answer: "c",
    },
    {
      id: "ca-pseudo-polynomial",
      chapter: "dsa-complexity-analysis",
      level: "beginner",
      skill: "complexity",
      pattern: "complexity-analysis",
      section: "output-size-and-numbers-that-are-values-rather-than-sizes",
      kind: "single",
      prompt:
        "<p><code>canMakeSum(nums, target)</code> fills a <code>Uint8Array(target + 1)</code> and loops over every number in <code>nums</code> and every index up to <code>target</code>. The array <code>nums</code> stays the same, but <code>target</code> changes from 1,000,000 to 1,000,000,000. What happens?</p>",
      choices: [
        {
          id: "a",
          text: "Nothing much, because <code>target</code> is one number and does not add to the input length.",
          why: "The loop bound is the numeric value of <code>target</code>, so a bigger value means more iterations even though it is still one number. That is why the cost is called pseudo-polynomial.",
        },
        {
          id: "b",
          text: "The work and the memory both grow by a factor of 1,000.",
          why: "The inner loop runs about <code>target</code> times for each number, and the array has <code>target + 1</code> cells, so both scale linearly with the value. Three more digits mean 1,000 times as much work, and about a gigabyte instead of a megabyte.",
        },
        {
          id: "c",
          text: "The work grows by a factor of 3, one for each extra digit.",
          why: "Each added digit multiplies the value by ten, not adds one step. Going from 7 digits to 10 multiplies the work by 10³.",
        },
        {
          id: "d",
          text: "The work grows by log 1,000, because the number is written with logarithmically many digits.",
          why: "The number of digits is logarithmic in the value, but the loop runs once per unit of value, not once per digit. That mismatch is exactly why the cost is exponential in the length of the input.",
        },
      ],
      answer: "b",
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
