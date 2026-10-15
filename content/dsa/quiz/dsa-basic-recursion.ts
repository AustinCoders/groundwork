import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "rec-nested-structure",
      chapter: "dsa-basic-recursion",
      level: "beginner",
      skill: "recognise",
      pattern: "recursion",
      section: "recognizing-it-in-an-unseen-problem",
      placement: true,
      kind: "single",
      prompt: "<p>Which of these tasks is the most natural fit for a recursive function?</p>",
      choices: [
        {
          id: "a",
          text: "Adding up a flat list of numbers into one running total.",
          why: "This can be written recursively, but nothing about the data repeats itself. A loop with a running total is shorter and uses no call stack.",
        },
        {
          id: "b",
          text: "Finding how deeply arrays nest, as in <code>[1, [2, [3, [4]]]]</code>.",
          why: "Each inner array has the same shape as the whole thing, and its depth is one more than the depth of what it contains. The problem restates itself on a smaller piece, which is what recursion is for.",
        },
        {
          id: "c",
          text: "Looking up the value stored under a given key in a <code>Map</code>.",
          why: "A <code>Map</code> finds a key directly, in one step on average. There is no smaller copy of the problem to hand off.",
        },
        {
          id: "d",
          text: "Swapping the values held in two variables using a temporary one.",
          why: "This is a fixed number of assignments, with no repeated structure to work through.",
        },
      ],
      answer: "b",
    },
    {
      id: "rec-missing-base",
      chapter: "dsa-basic-recursion",
      level: "beginner",
      skill: "recognise",
      pattern: "recursion",
      section: "every-recursive-function-is-two-things",
      placement: true,
      kind: "single",
      prompt:
        "<p>This function should count the digits of a whole number, so <code>countDigits(407)</code> should return 3. Instead it crashes with a stack overflow. Which line, added at the top, fixes it?</p><pre><code>function countDigits(n) {\n  return 1 + countDigits(Math.floor(n / 10));\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>if (n &lt; 10) return 1;</code>",
          why: "A number below 10 has exactly one digit, so the answer is known and no further call is needed. For 407 the calls go 407, 40, 4, and the last one returns 1, so the total is 1 + 1 + 1 = 3.",
        },
        {
          id: "b",
          text: "<code>if (n === 0) return 1;</code>",
          why: "This stops the recursion, but too late. For 407 the calls go 407, 40, 4, 0, and the call with 0 returns 1 while the three above it each add 1, so the answer is 4 instead of 3.",
        },
        {
          id: "c",
          text: "<code>if (n &lt; 0) return 0;</code>",
          why: "The argument never becomes negative. <code>Math.floor(0 / 10)</code> is 0, so the calls reach 0 and then stay there forever, and the test is never true.",
        },
        {
          id: "d",
          text: "Replace <code>Math.floor</code> with <code>Math.ceil</code> and add nothing else.",
          why: "Rounding up keeps the value at 1 forever, because <code>Math.ceil(1 / 10)</code> is 1. A base case is what ends the recursion, and this change adds none.",
        },
      ],
      answer: "a",
    },
    {
      id: "rec-stack-space",
      chapter: "dsa-basic-recursion",
      level: "beginner",
      skill: "complexity",
      pattern: "recursion",
      section: "the-call-stack-is-a-real-stack-draw-it",
      kind: "single",
      prompt:
        "<p>The function below adds up the numbers of an array of n elements. Not counting the array itself, how much extra space does it use?</p><pre><code>function sum(arr, i = 0) {\n  if (i === arr.length) return 0;\n  return arr[i] + sum(arr, i + 1);\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "O(1), because it never creates an array or an object",
          why: "Every call waits for the next one to return, so all n + 1 calls are alive at the same moment, each with its own frame on the call stack. That memory counts even though no array is written anywhere.",
        },
        {
          id: "b",
          text: "O(log n), because the work is split between the calls",
          why: "The work is not split in two. Each call makes a single call with <code>i + 1</code>, so the chain of waiting calls is n long, not log n.",
        },
        {
          id: "c",
          text: "O(n), because n + 1 calls are on the call stack at the deepest point",
          why: "The call with <code>i === arr.length</code> is the deepest. Beneath it on the stack sit the calls for <code>i</code> from 0 to n − 1, all suspended mid-expression. A loop with a running total would use O(1).",
        },
        {
          id: "d",
          text: "O(n²), because each call adds <code>arr[i]</code> to the rest",
          why: "Each call does a constant amount of work, and there are n + 1 calls, so the time is O(n). The stack never holds more than that many frames.",
        },
      ],
      answer: "c",
    },
    {
      id: "rec-fib-growth",
      chapter: "dsa-basic-recursion",
      level: "beginner",
      skill: "complexity",
      pattern: "recursion",
      section: "multiple-recursive-calls-the-branching-factor-matters",
      kind: "single",
      prompt:
        "<p>Counting every call, <code>fibSlow(5)</code> makes 15 calls, <code>fibSlow(10)</code> makes 177, and <code>fibSlow(20)</code> makes 21,891. What explains this growth?</p><pre><code>function fibSlow(n) {\n  if (n &lt;= 1) return n;\n  return fibSlow(n - 1) + fibSlow(n - 2);\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "The recursion is n levels deep, so the number of calls grows in step with n, one more call per extra level.",
          why: "The depth is about n, but the number of calls is not. Doubling n from 5 to 10 multiplies the calls by about 12, not by 2, because every call can make two more.",
        },
        {
          id: "b",
          text: "Each call runs a loop over all n values, so the calls add up to about n² once the whole tree is counted.",
          why: "There is no loop here. Each call does one addition. If the total were n² it would be 100 for n = 10, not 177.",
        },
        {
          id: "c",
          text: "A recursive function always costs the square of its depth, because each level repeats the work of the level above.",
          why: "There is no such rule. The cost depends on how many calls are made, and a function that makes one call per level, such as <code>sum</code>, costs only O(n).",
        },
        {
          id: "d",
          text: "Each call can make two more, and the same smaller inputs are recomputed in many branches, so growth is exponential.",
          why: "The call tree widens quickly, because each call can make two more, and <code>fibSlow(2)</code>, for example, is computed again and again. O(2ⁿ) is the usual upper bound. The true growth is a little slower, about 1.6 times per step, but it is still exponential, and caching each result with memoization removes the repeated work.",
        },
      ],
      answer: "d",
    },
    {
      id: "rec-trace-height",
      chapter: "dsa-basic-recursion",
      level: "beginner",
      skill: "trace",
      pattern: "recursion",
      section: "recursion-on-trees-the-shape-you-ll-use-constantly-later",
      kind: "single",
      prompt:
        "<p>Run the chapter's <code>treeHeight</code> on this small tree. What does it return?</p><pre><code>function treeHeight(node) {\n  if (node === null) return 0;\n  return 1 + Math.max(treeHeight(node.left), treeHeight(node.right));\n}\n\nconst tree = {\n  left: { left: null, right: { left: null, right: null } },\n  right: { left: null, right: null },\n};\ntreeHeight(tree);</code></pre>",
      choices: [
        {
          id: "a",
          text: "2",
          why: "Counting the steps from the root down to the deepest node gives 2, but this function counts nodes, not steps. An empty subtree is 0 and a single node is 1, so the longest path of three nodes gives 3.",
        },
        {
          id: "b",
          text: "3",
          why: "The right child is a single node, so its height is 1. The left child has no left subtree (0) and a right subtree that is a single node (1), so its height is 1 + max(0, 1) = 2. The root returns 1 + max(2, 1) = 3.",
        },
        {
          id: "c",
          text: "4",
          why: "The tree has four nodes in all, but the height follows only the longest path down, not every node. The two branches are compared with <code>Math.max</code>, not added.",
        },
        {
          id: "d",
          text: "5",
          why: "Five is the number of empty links in the tree, which are the calls that return 0. Those calls end the recursion but add nothing to the height.",
        },
      ],
      answer: "b",
    },
    {
      id: "rec-fib-count",
      chapter: "dsa-basic-recursion",
      level: "beginner",
      skill: "trace",
      pattern: "recursion",
      section: "multiple-recursive-calls-the-branching-factor-matters",
      kind: "single",
      prompt:
        "<p>While <code>fibSlow(5)</code> runs, how many times is <code>fibSlow</code> called with the argument 2?</p><pre><code>function fibSlow(n) {\n  if (n &lt;= 1) return n;\n  return fibSlow(n - 1) + fibSlow(n - 2);\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "3 times",
          why: "<code>fibSlow(3)</code> is called twice, once by <code>fibSlow(5)</code> and once by <code>fibSlow(4)</code>, and each of those two calls calls <code>fibSlow(2)</code> once. <code>fibSlow(4)</code> also calls <code>fibSlow(2)</code> directly, so the total is 3.",
        },
        {
          id: "b",
          text: "2 times",
          why: "Two is the number of times <code>fibSlow(3)</code> is called. Each of those calls <code>fibSlow(2)</code>, and <code>fibSlow(4)</code> adds another call to it.",
        },
        {
          id: "c",
          text: "1 time",
          why: "The memo-free version has no way to remember a result, so a value that is needed in several branches is simply computed again each time.",
        },
        {
          id: "d",
          text: "5 times",
          why: "Five is how often <code>fibSlow(1)</code> is called. The argument 2 appears fewer times.",
        },
      ],
      answer: "a",
    },
    {
      id: "rec-sum-base-off",
      chapter: "dsa-basic-recursion",
      level: "beginner",
      skill: "edge-case",
      pattern: "recursion",
      section: "recursion-on-arrays-shrink-by-one-end",
      kind: "single",
      prompt:
        "<p>A teammate writes the base case of <code>sum</code> as below, one step too early. What does <code>sum([4, 5, 6])</code> return?</p><pre><code>function sum(arr, i = 0) {\n  if (i === arr.length - 1) return 0;\n  return arr[i] + sum(arr, i + 1);\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "15",
          why: "That is the correct total, but this base case returns 0 at the last element, so 6 is never added.",
        },
        {
          id: "b",
          text: "11",
          why: "That would leave out the first element. The recursion starts at index 0, so the 4 is added, and the missing element is the last one.",
        },
        {
          id: "c",
          text: "9",
          why: "The calls with <code>i</code> equal to 0 and 1 return 4 + (5 + …). The call with <code>i</code> equal to 2 is the last index, so the base case returns 0 and the 6 is dropped. The total is 4 + 5 + 0 = 9.",
        },
        {
          id: "d",
          text: "It throws a <code>RangeError</code>",
          why: "For this array the base case is reached at index 2, so the recursion ends. It would overflow only for an empty array, because <code>i</code> would never equal -1.",
        },
      ],
      answer: "c",
    },
    {
      id: "rec-reverse-empty",
      chapter: "dsa-basic-recursion",
      level: "beginner",
      skill: "edge-case",
      pattern: "recursion",
      section: "recursion-on-arrays-shrink-by-one-end",
      kind: "single",
      prompt:
        '<p>A teammate tightens the base case of <code>reverseString</code> to <code>s.length === 1</code>. It still works for <code>"ab"</code>. What does it do for the empty string?</p><pre><code>function reverseString(s) {\n  if (s.length === 1) return s;\n  return reverseString(s.slice(1)) + s[0];\n}\n\nreverseString("");</code></pre>',
      choices: [
        {
          id: "a",
          text: "It returns an empty string, because there is nothing left to reverse.",
          why: 'The function never gets the chance to decide that. <code>"".slice(1)</code> is <code>""</code> again, so every call has the same input and the same length 0.',
        },
        {
          id: "b",
          text: "It throws a <code>RangeError</code> for exceeding the maximum call stack size.",
          why: "The length is 0, never 1, and each call hands the same empty string to the next one. The input does not get smaller, so the base case is never reached. The original <code>s.length &lt;= 1</code> covers the empty string as well.",
        },
        {
          id: "c",
          text: "It returns <code>undefined</code>, because no return statement runs.",
          why: "Every path through the function either returns or calls itself, and the empty string only ever calls itself. Nothing returns <code>undefined</code>.",
        },
        {
          id: "d",
          text: "It throws a <code>TypeError</code>, because <code>s[0]</code> does not exist on an empty string.",
          why: "Reading <code>s[0]</code> on an empty string gives <code>undefined</code> and does not throw. The code never gets that far anyway, because the recursive call comes first.",
        },
      ],
      answer: "b",
    },
    {
      id: "rec-terminates",
      chapter: "dsa-basic-recursion",
      level: "beginner",
      skill: "edge-case",
      pattern: "recursion",
      section: "every-recursive-function-is-two-things",
      kind: "multi",
      prompt:
        "<p>Each function below is called with a whole number <code>n</code> that is 0 or more. Select every function that is guaranteed to reach its base case and return, instead of overflowing the call stack.</p>",
      choices: [
        {
          id: "a",
          text: "<code>f(n) { if (n === 0) return 0; return f(n - 1); }</code>",
          why: "Each call is one smaller than the last, and every whole number from 0 up reaches 0 in steps of one, where the base case stops it.",
        },
        {
          id: "b",
          text: "<code>f(n) { if (n === 0) return 0; return f(n - 2); }</code>",
          why: "Even values of <code>n</code> reach 0, but an odd value goes 1, -1, -3 and so on, jumping over 0. The base case is never met, so it overflows the stack.",
        },
        {
          id: "c",
          text: "<code>f(n) { if (n &lt;= 0) return 0; return f(n - 2); }</code>",
          why: "Stepping down by 2 can jump past 0, but the test is <code>&lt;=</code>, so landing on -1 stops it just as landing on 0 does.",
        },
        {
          id: "d",
          text: "<code>f(n) { if (n === 0) return 1; return f(n + 1); }</code>",
          why: "Each call moves away from the base case. Any <code>n</code> above 0 grows without limit, so this one never stops, except for <code>n = 0</code>.",
        },
      ],
      answers: ["a", "c"],
    },
    {
      id: "rec-order-unwind",
      chapter: "dsa-basic-recursion",
      level: "beginner",
      skill: "trace",
      pattern: "recursion",
      section: "the-call-stack-is-a-real-stack-draw-it",
      kind: "order",
      prompt:
        "<p>Put the events of <code>factorial(3)</code> in the order they happen.</p><pre><code>function factorial(n) {\n  if (n &lt;= 1) return 1;\n  return n * factorial(n - 1);\n}</code></pre>",
      items: [
        { id: "call3", text: "<code>factorial(3)</code> starts and calls <code>factorial(2)</code>." },
        { id: "call2", text: "<code>factorial(2)</code> starts and calls <code>factorial(1)</code>." },
        { id: "base", text: "<code>factorial(1)</code> reaches the base case and returns 1." },
        { id: "ret2", text: "<code>factorial(2)</code> resumes and returns 2 × 1 = 2." },
        { id: "ret3", text: "<code>factorial(3)</code> resumes and returns 3 × 2 = 6." },
      ],
      why: "The calls build up first, each one waiting on the next, until the base case returns a value without making a call. Only then does any multiplication happen, in the reverse order of the calls: the last call to start is the first to finish.",
    },
    {
      id: "rec-iteration-followup",
      chapter: "dsa-basic-recursion",
      level: "beginner",
      skill: "recognise",
      pattern: "recursion",
      section: "converting-recursion-to-iteration-when-asked",
      kind: "single",
      prompt:
        "<p>Your recursive solution is correct, but an interviewer points out that an input with a million levels would overflow the call stack. What is a sound answer?</p>",
      choices: [
        {
          id: "a",
          text: "Add memoization, because caching each result reduces how deep the calls have to go.",
          why: "Caching helps when the same input is computed again in different branches. For a single chain of calls, each input is new, so the nesting is just as deep.",
        },
        {
          id: "b",
          text: "It cannot be done, because a recursive solution has no iterative form that does the same work.",
          why: "Any recursion can be rewritten as a loop. A function such as factorial needs only a running value, and a more complex one can keep its own explicit stack to do what the call stack did.",
        },
        {
          id: "c",
          text: "Add a second base case near the start so that the recursion stops several levels earlier.",
          why: "A base case that fires earlier changes the answer for the inputs it covers. It does not make a correct solution use fewer levels.",
        },
        {
          id: "d",
          text: "Rewrite it as a loop, or with an explicit stack, so memory stops growing with every level.",
          why: "A loop with a running value, as in <code>factorialIter</code>, needs O(1) space. A solution that really needs a stack can keep it in an array on the heap, which is not limited by the call stack's depth.",
        },
      ],
      answer: "d",
    },
    {
      id: "rec-slice-copy-cost",
      chapter: "dsa-basic-recursion",
      level: "beginner",
      skill: "complexity",
      pattern: "recursion",
      section: "slicing-hides-a-cost-count-what-each-call-copies",
      kind: "single",
      prompt:
        "<p>This function reverses a string of n characters. How does its running time grow with n?</p><pre><code>function reverseString(s) {\n  if (s.length &lt;= 1) return s;\n  return reverseString(s.slice(1)) + s[0];\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "O(n), because it makes one call per character and each call does a fixed amount of work",
          why: "There are n calls, but each one runs <code>slice(1)</code> and then a concatenation, and both build a new string almost as long as the input. That is not a fixed amount of work per call.",
        },
        {
          id: "b",
          text: "O(log n), because each call shrinks the string it is given",
          why: "Each call removes one character, not half of them. A logarithm comes from halving, and here n calls follow one another in a single chain.",
        },
        {
          id: "c",
          text: "O(n²), because each of the n calls copies a string nearly as long as its input",
          why: "The call on a string of length k copies about k characters twice over, so the copying adds up to about n(n − 1) / 2 characters in total. Passing two indices instead of slicing makes each call O(1).",
        },
        {
          id: "d",
          text: "O(2ⁿ), because the function calls itself",
          why: "It makes one recursive call, not two, so the call tree is a chain of n calls. Exponential growth needs several calls at every level.",
        },
      ],
      answer: "c",
    },
    {
      id: "rec-palindrome-crossing",
      chapter: "dsa-basic-recursion",
      level: "beginner",
      skill: "edge-case",
      pattern: "recursion",
      section: "the-leap-of-faith-write-one-step-trust-the-call",
      kind: "single",
      prompt:
        "<p>This palindrome check carries two indices toward each other. For which input does it fail to stop and overflow the call stack?</p><pre><code>function isPal(s, lo = 0, hi = s.length - 1) {\n  if (lo === hi) return true;\n  if (s[lo] !== s[hi]) return false;\n  return isPal(s, lo + 1, hi - 1);\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: 'Strings with an odd number of characters, such as <code>"abcba"</code>',
          why: "With an odd length the indices meet on the middle character, so <code>lo === hi</code> is true and the call returns <code>true</code>.",
        },
        {
          id: "b",
          text: "Any string that is not a palindrome",
          why: "A mismatch returns <code>false</code> as soon as the first differing pair is compared, which happens before the indices can cross.",
        },
        {
          id: "c",
          text: "No input, because the mismatch test always ends the recursion first",
          why: "The mismatch test ends the recursion only when a pair differs. A palindrome never has a differing pair, so for an even-length one that test never fires.",
        },
        {
          id: "d",
          text: 'Even-length palindromes such as <code>"abba"</code>, and the empty string',
          why: "The indices step past each other (1 and 2, then 2 and 1) without ever being equal, and every pair they compare matches, so nothing stops the calls. The empty string starts with <code>hi</code> at -1 and behaves the same way. Testing <code>lo &gt;= hi</code> fixes both.",
        },
      ],
      answer: "d",
    },
    {
      id: "rec-memo-in-body",
      chapter: "dsa-basic-recursion",
      level: "beginner",
      skill: "edge-case",
      pattern: "recursion",
      section: "memoized-fibonacci-each-distinct-call-runs-once",
      kind: "single",
      prompt:
        "<p>A developer adds a cache to Fibonacci, but <code>fibCached(35)</code> still takes seconds. What is wrong?</p><pre><code>function fibCached(n) {\n  const memo = new Map();\n  if (n &lt;= 1) return n;\n  if (memo.has(n)) return memo.get(n);\n  const result = fibCached(n - 1) + fibCached(n - 2);\n  memo.set(n, result);\n  return result;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "A new <code>Map</code> is created on every call, so each call starts with an empty cache and nothing is reused",
          why: "Each call stores into its own map and throws it away when it returns. The calls made are exactly those of <code>fibSlow</code>, so the time is still exponential. Passing the map as a parameter, or declaring it outside, fixes it.",
        },
        {
          id: "b",
          text: "<code>Map.has</code> is slow on integer keys, so the lookups cost more than the work they save",
          why: "A lookup in a <code>Map</code> takes constant time on average. The lookups here are cheap but never succeed, which is the real problem.",
        },
        {
          id: "c",
          text: "The result is stored after the recursive calls, when it should be stored before them",
          why: "The value is only known once the two calls have returned, so storing it after them is correct. <code>fibMemo</code> in the chapter does the same.",
        },
        {
          id: "d",
          text: "Memoization cannot help a function that calls itself twice",
          why: "It can: with the cache shared across calls, <code>fibMemo(30)</code> makes 59 calls instead of 2,692,537, because the second call at almost every level is a cache hit.",
        },
      ],
      answer: "a",
    },
    {
      id: "rec-power-two-calls",
      chapter: "dsa-basic-recursion",
      level: "beginner",
      skill: "complexity",
      pattern: "recursion",
      section: "halving-the-problem-fast-exponentiation",
      kind: "single",
      prompt:
        "<p>What is the running time of this power function, as a function of n?</p><pre><code>function pow(x, n) {\n  if (n === 0) return 1;\n  const h = Math.floor(n / 2);\n  const r = pow(x, h) * pow(x, h);\n  return n % 2 === 0 ? r : r * x;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "O(log n), because the exponent is halved on every call",
          why: "The exponent does halve, so there are only about log n levels, but every call makes two calls. The number of calls doubles at each level, so the levels do not cost one call each.",
        },
        {
          id: "b",
          text: "O(n log n), because there are log n levels and each level does about n units of work",
          why: "Each call does a constant amount of work besides its calls. The cost comes from the number of calls, and it is dominated by the bottom level, which has about n calls, not n log n.",
        },
        {
          id: "c",
          text: "O(2ⁿ), because every call makes two calls",
          why: "The tree does double at every level, but it has only about log n levels, not n, so it has about n calls in all. Exponential time would need n levels of doubling.",
        },
        {
          id: "d",
          text: "O(n), because the tree doubles on each of its log n levels, giving about n calls",
          why: "For n = 1,024 there are 12 levels and 2¹² − 1 = 4,095 calls. Storing <code>pow(x, h)</code> in a variable and squaring it makes one call per level, which gives O(log n).",
        },
      ],
      answer: "d",
    },
    {
      id: "rec-subsets-no-copy",
      chapter: "dsa-basic-recursion",
      level: "beginner",
      skill: "trace",
      pattern: "recursion",
      section: "choose-or-don-t-choose-generating-subsets",
      kind: "single",
      prompt:
        "<p>A teammate changes <code>all.push([...current])</code> to <code>all.push(current)</code>. What does <code>subsets([1, 2])</code> return now?</p><pre><code>function subsets(nums) {\n  const all = [];\n  const current = [];\n  function decide(i) {\n    if (i === nums.length) {\n      all.push(current);\n      return;\n    }\n    decide(i + 1);\n    current.push(nums[i]);\n    decide(i + 1);\n    current.pop();\n  }\n  decide(0);\n  return all;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>[[], [2], [1], [1, 2]]</code>, the same as before",
          why: "That is the result with the copy. Without it, the array pushed is the same object every time, and it keeps changing after it has been pushed.",
        },
        {
          id: "b",
          text: "<code>[[1, 2], [1, 2], [1, 2], [1, 2]]</code>",
          why: "<code>[1, 2]</code> is the fullest <code>current</code> ever gets, but it does not stay that way: each element taken is removed again by <code>pop()</code> as the calls return.",
        },
        {
          id: "c",
          text: "A <code>RangeError</code>, because the array ends up containing itself",
          why: "<code>all</code> holds four references to <code>current</code>, but <code>current</code> never receives <code>all</code>, so nothing refers to itself and the recursion is unaffected.",
        },
        {
          id: "d",
          text: "<code>[[], [], [], []]</code>",
          why: "Four entries are pushed, and all four are the one array <code>current</code>. Every push to it is undone by a matching pop before the outermost call returns, so it is empty at the end and all four entries show that final state.",
        },
      ],
      answer: "d",
    },
    {
      id: "rec-hanoi-moves",
      chapter: "dsa-basic-recursion",
      level: "beginner",
      skill: "trace",
      pattern: "recursion",
      section: "two-classics-gcd-and-the-tower-of-hanoi",
      kind: "single",
      prompt:
        '<p>How many times is <code>moves.push</code> executed by <code>hanoi(5, "A", "C", "B")</code>?</p><pre><code>function hanoi(n, from, to, via, moves = []) {\n  if (n === 0) return moves;\n  hanoi(n - 1, from, via, to, moves);\n  moves.push([from, to]);\n  hanoi(n - 1, via, to, from, moves);\n  return moves;\n}</code></pre>',
      choices: [
        {
          id: "a",
          text: "31",
          why: "Each call with n ≥ 1 pushes exactly one move, and M(n) = 2 · M(n − 1) + 1 with M(0) = 0 gives M(5) = 2⁵ − 1 = 31.",
        },
        {
          id: "b",
          text: "32",
          why: "That is 2⁵, one too many. The recurrence adds 1 for the single move of the largest disk, which gives 2ⁿ − 1, and the bottom of the tree (n = 0) pushes nothing.",
        },
        {
          id: "c",
          text: "63",
          why: "63 is the number of calls, 2⁶ − 1. Of those, 32 hit the base case <code>n === 0</code> and push nothing, which leaves 31 calls that push a move.",
        },
        {
          id: "d",
          text: "25",
          why: "25 is 5². The count is not polynomial: it roughly doubles with every extra disk.",
        },
      ],
      answer: "a",
    },
    {
      id: "rec-carry-or-return",
      chapter: "dsa-basic-recursion",
      level: "beginner",
      skill: "recognise",
      pattern: "recursion",
      section: "return-it-up-or-carry-it-down",
      kind: "single",
      prompt:
        "<p>Which of these tasks most naturally needs a value <em>carried down</em> as a parameter, rather than returned up from the children?</p>",
      choices: [
        {
          id: "a",
          text: "Counting the nodes of a binary tree, as one plus the counts of the two subtrees.",
          why: "The count is built from the children: 1 plus the counts of the left and right subtrees. Each call returns its subtree's count to its caller.",
        },
        {
          id: "b",
          text: "Summing the numbers in an array.",
          why: "The sum is naturally <code>arr[0]</code> plus the sum of the rest, returned up. An accumulator parameter also works, but it adds nothing here.",
        },
        {
          id: "c",
          text: "Listing every root-to-leaf path of a binary tree, such as <code>[1, 2, 5]</code>.",
          why: "A leaf cannot know the route that led to it unless the route is passed along, so the path so far is carried down and copied into the results when a leaf is reached.",
        },
        {
          id: "d",
          text: "Finding the height of a binary tree, as one plus the larger height of the two subtrees.",
          why: "Height is 1 plus the larger of the children's heights, so it flows up from them. A carried depth also works, but the returned version is the natural one.",
        },
      ],
      answer: "c",
    },
    {
      id: "rec-null-is-object",
      chapter: "dsa-basic-recursion",
      level: "beginner",
      skill: "edge-case",
      pattern: "recursion",
      section: "nested-data-when-the-input-is-the-recursion",
      kind: "single",
      prompt:
        '<p>What happens when this function runs?</p><pre><code>function sumNumbers(value) {\n  if (typeof value === "number") return value;\n  if (typeof value !== "object") return 0;\n  let total = 0;\n  for (const child of Object.values(value)) total += sumNumbers(child);\n  return total;\n}\n\nsumNumbers({ a: 1, b: null });</code></pre>',
      choices: [
        {
          id: "a",
          text: 'It throws a <code>TypeError</code>, because <code>typeof null</code> is <code>"object"</code>',
          why: 'The test for non-objects lets <code>null</code> through, since <code>typeof null</code> is <code>"object"</code>. The call on <code>null</code> then reaches <code>Object.values(null)</code>, which throws. Checking <code>value === null</code> first avoids it.',
        },
        {
          id: "b",
          text: "It returns 1, because <code>null</code> is not a number and counts as 0",
          why: "<code>null</code> is never given the chance to count as 0. The second test does not catch it, so the code goes on to read its values.",
        },
        {
          id: "c",
          text: "It throws a <code>RangeError</code>, because <code>null</code> recurses into itself",
          why: "Nothing recurses into <code>null</code>: the call on it fails immediately, before any further call is made.",
        },
        {
          id: "d",
          text: "It returns <code>NaN</code>, because adding <code>null</code> to a number gives <code>NaN</code>",
          why: "No addition involving <code>null</code> is reached, because the call on <code>null</code> throws first. (<code>1 + null</code> is actually 1, not <code>NaN</code>.)",
        },
      ],
      answer: "a",
    },
  ],
  pattern: {
    pattern: "recursion",
    chapter: "dsa-basic-recursion",
    signals: [
      "The data is itself recursive: a tree, a nested array or a nested object.",
      "The problem can be restated as the same problem on a strictly smaller input, plus a small step to combine the answers.",
      "The prompt asks for every combination, every path or every way to do something, which is where backtracking begins.",
      "The same sub-inputs appear again in different branches, which is the cue to add memoization.",
      "The prompt asks for the same solution without recursion, or about the depth of the call stack.",
    ],
    template:
      "<pre><code>function solve(input) {\n  if (isSmallest(input)) return directAnswer(input);\n  return combine(solve(smaller(input)));\n}</code></pre>",
    time: "O(number of calls × work per call)",
    space: "O(recursion depth) for the call stack",
    styles: ["online-assessment", "phone-screen", "onsite"],
  },
};
