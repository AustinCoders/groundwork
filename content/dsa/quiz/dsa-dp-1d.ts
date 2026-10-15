import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "dp1-stepping-stones",
      chapter: "dsa-dp-1d",
      level: "intermediate",
      skill: "recognise",
      pattern: "dp-1d",
      section: "the-general-recipe-the-four-questions-every-1d-dp-answers",
      placement: true,
      kind: "single",
      prompt:
        "<p>A row of <code>n</code> stepping stones has a toll <code>cost[i]</code> for landing on stone <code>i</code>. You start on stone 0 and pay its toll. Each jump moves you 1 or 2 stones forward, and you pay the toll of the stone you land on. You want the smallest total toll for landing on the last stone. Which approach fits best?</p>",
      choices: [
        {
          id: "a",
          text: "Always jump to whichever of the next two stones has the lower toll.",
          why: "A cheap stone now can leave only expensive ones after it. For <code>[9, 9, 7, 5, 7]</code> this rule starts on 9, lands on 7, then 5, then 7 for a total of 28, while jumping from the first 7 straight to the last 7 costs 9 + 7 + 7 = 23.",
        },
        {
          id: "b",
          text: "Take every second stone, starting from stone 0, and add up their tolls.",
          why: "That picks stones by position, not by cost, and with an even number of stones it misses the last one. For tolls <code>[1, 1, 100, 1, 1]</code> it pays 1 + 100 + 1 = 102, while jumping 1, 2 and 1 stones pays 1 + 1 + 1 + 1 = 4.",
        },
        {
          id: "c",
          text: "Set <code>dp[i]</code>, the cheapest total to land on stone <code>i</code>, to <code>cost[i] + Math.min(dp[i - 1], dp[i - 2])</code>.",
          why: "You can only reach stone <code>i</code> from stone <code>i - 1</code> or <code>i - 2</code>, so the best way to it is the cheaper of those two best ways plus its own toll. Each stone is solved once, in a single pass.",
        },
        {
          id: "d",
          text: "Try every sequence of 1-stone and 2-stone jumps recursively and keep the cheapest.",
          why: "It finds the right answer, but the number of routes grows exponentially with the number of stones. For 40 stones there are 102,334,155 routes, and most of them repeat the same smaller subproblems.",
        },
      ],
      answer: "c",
    },
    {
      id: "dp1-lis-state",
      chapter: "dsa-dp-1d",
      level: "intermediate",
      skill: "recognise",
      pattern: "dp-1d",
      section: "worked-example-longest-increasing-subsequence",
      placement: true,
      kind: "single",
      prompt:
        "<p>You want the length of the longest strictly increasing subsequence of <code>nums</code> with an O(n²) table. Which meaning of <code>dp[i]</code> lets <code>dp[i]</code> be worked out from earlier entries?</p>",
      choices: [
        {
          id: "a",
          text: "The length of the longest increasing subsequence found anywhere in <code>nums[0..i]</code>.",
          why: "This forgets where the best subsequence ends. For <code>[1, 10, 2, 3]</code> the best in the first two elements is <code>[1, 10]</code>, so <code>dp[1]</code> would be 2. Extending that with the 2 would claim a length-3 subsequence ending at 2, but <code>[1, 10, 2]</code> is not increasing.",
        },
        {
          id: "b",
          text: "The length of the longest increasing subsequence that ends exactly at index <code>i</code>.",
          why: "Knowing that the subsequence ends at <code>nums[i]</code> lets you extend any earlier one that ends on a smaller value: <code>dp[i] = 1 + max(dp[j])</code> over the <code>j &lt; i</code> with <code>nums[j] &lt; nums[i]</code>. The answer is the largest entry in the table.",
        },
        {
          id: "c",
          text: "How many elements before index <code>i</code> are smaller than <code>nums[i]</code>.",
          why: "Smaller elements do not have to form an increasing chain. In <code>[2, 1, 3]</code> two elements before the 3 are smaller, yet the longest chain ending at 3 has length 2.",
        },
        {
          id: "d",
          text: "Whether <code>nums[i]</code> is larger than <code>nums[i - 1]</code>.",
          why: "A subsequence may skip elements, so the neighbour is not enough. In <code>[1, 5, 2, 6]</code> the 6 follows the 2, yet the best chain ending at 6 is built from 1 and 5 or 1 and 2, which a yes or no about one neighbour cannot show.",
        },
      ],
      answer: "b",
    },
    {
      id: "dp1-greedy-counterexample",
      chapter: "dsa-dp-1d",
      level: "intermediate",
      skill: "recognise",
      pattern: "dp-1d",
      section: "worked-example-coin-change-minimum-coins-to-make-an-amount",
      kind: "single",
      prompt:
        "<p>A teammate says that, for the fewest coins that make an amount, it is enough to keep taking the largest coin that still fits. Which input shows that this is wrong?</p>",
      choices: [
        {
          id: "a",
          text: "Coins <code>[1, 6, 10]</code>, amount 12",
          why: "Largest-first takes 10 and then 1 + 1, which is 3 coins. Two 6s make 12 with only 2 coins, so leaving out the largest coin gives a better answer.",
        },
        {
          id: "b",
          text: "Coins <code>[1, 5, 10]</code>, amount 12",
          why: "Largest-first gives 10 + 1 + 1, which is 3 coins, and no combination does better. Here the rule happens to be right.",
        },
        {
          id: "c",
          text: "Coins <code>[1, 2, 5]</code>, amount 11",
          why: "Largest-first gives 5 + 5 + 1, which is 3 coins, and no combination of these coins does better.",
        },
        {
          id: "d",
          text: "Coins <code>[1, 5, 10, 25]</code>, amount 30",
          why: "Largest-first gives 25 + 5, which is 2 coins, and one coin cannot make 30. This set is one of the cases where the rule works.",
        },
      ],
      answer: "a",
    },
    {
      id: "dp1-fill-zero",
      chapter: "dsa-dp-1d",
      level: "intermediate",
      skill: "edge-case",
      pattern: "dp-1d",
      section: "worked-example-coin-change-minimum-coins-to-make-an-amount",
      kind: "single",
      prompt:
        "<p>In <code>coinChange</code> the table is created with <code>fill(0)</code> instead of <code>fill(Infinity)</code>. Nothing else changes. What does <code>coinChange([2], 3)</code> return?</p><pre><code>function coinChange(coins, amount) {\n  const dp = new Array(amount + 1).fill(0);\n  dp[0] = 0;\n  for (let a = 1; a &lt;= amount; a++) {\n    for (const coin of coins) {\n      if (coin &lt;= a &amp;&amp; dp[a - coin] !== Infinity) {\n        dp[a] = Math.min(dp[a], dp[a - coin] + 1);\n      }\n    }\n  }\n  return dp[amount] === Infinity ? -1 : dp[amount];\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>-1</code>, because no combination of coins of 2 adds up to exactly 3.",
          why: "That is the right answer to the question, and the original code returns it. With <code>fill(0)</code> no entry is ever <code>Infinity</code>, so the final test can never be true and the function can never return -1.",
        },
        {
          id: "b",
          text: "<code>Infinity</code>, because the amount cannot be reached with these coins.",
          why: "The table starts with zeros and nothing ever writes <code>Infinity</code> into it. The function returns an entry of the table, so it cannot return <code>Infinity</code>.",
        },
        {
          id: "c",
          text: "<code>1</code>, because one coin of 2 gets closest to 3 without going over.",
          why: "Nothing in the loop picks the closest amount. <code>dp[3]</code> starts at 0, and <code>Math.min</code> can only keep it at 0 or lower it, so it cannot become 1.",
        },
        {
          id: "d",
          text: "<code>0</code>, because every entry starts at 0 and <code>Math.min</code> cannot raise it.",
          why: 'A starting value of 0 reads as "0 coins are enough" for every amount. The best choice is the minimum, and no candidate is smaller than 0, so every entry stays 0, which also hides the amounts that cannot be made.',
        },
      ],
      answer: "d",
    },
    {
      id: "dp1-recursion-depth",
      chapter: "dsa-dp-1d",
      level: "intermediate",
      skill: "edge-case",
      pattern: "dp-1d",
      section: "top-down-memoization-recursion-plus-a-cache",
      kind: "single",
      prompt:
        "<p>House Robber is solved twice: top-down with a <code>Map</code> memo keyed by house index, and bottom-up with a loop over the array. Both are correct and both take O(n) time. With 1,000,000 houses, which risk belongs only to the top-down version?</p>",
      choices: [
        {
          id: "a",
          text: "It nests about n calls deep, and engines limit stack depth, so it can fail with a stack overflow error.",
          why: "Each call waits for the call on the next smaller index, so the stack grows with n. The depth limit depends on the engine and the size of each frame. A bottom-up loop uses the same stack space whatever n is.",
        },
        {
          id: "b",
          text: "It returns wrong answers, because the memo is shared between all of the recursive calls.",
          why: "Sharing the memo is the point. Every call reads and writes the same <code>Map</code> so that a house index is solved once, and the answers stay correct.",
        },
        {
          id: "c",
          text: "It takes O(n²) time, because every <code>Map</code> lookup has to scan through the keys.",
          why: "A <code>Map</code> finds a key in O(1) on average, without scanning. The top-down version stays O(n) in time.",
        },
        {
          id: "d",
          text: "It loses old entries once the <code>Map</code> grows large, so some houses are solved again.",
          why: "A <code>Map</code> does not evict entries on its own. It keeps every key that was set until you delete it.",
        },
      ],
      answer: "a",
    },
    {
      id: "dp1-trace-coin-table",
      chapter: "dsa-dp-1d",
      level: "intermediate",
      skill: "trace",
      pattern: "dp-1d",
      section: "worked-example-coin-change-minimum-coins-to-make-an-amount",
      kind: "single",
      prompt:
        "<p>The loops of <code>coinChange</code> run with <code>coins = [2, 5, 6]</code> and <code>amount = 9</code>. What does <code>dp</code> hold, from index 0 to 9, when they finish? <code>∞</code> stands for <code>Infinity</code>.</p><pre><code>const dp = new Array(amount + 1).fill(Infinity);\ndp[0] = 0;\nfor (let a = 1; a &lt;= amount; a++) {\n  for (const coin of coins) {\n    if (coin &lt;= a &amp;&amp; dp[a - coin] !== Infinity) {\n      dp[a] = Math.min(dp[a], dp[a - coin] + 1);\n    }\n  }\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>0, 1, 1, 2, 2, 1, 1, 2, 2, 3</code>",
          why: "This treats amounts 1 and 3 as reachable. No coin is smaller than 2, so 1 cannot be made, and 3 would need a 1-coin as well, so both stay <code>∞</code>.",
        },
        {
          id: "b",
          text: "<code>0, ∞, 1, ∞, 2, 1, 1, 2, 2, 2</code>",
          why: "<code>dp[9]</code> can only come from <code>dp[7]</code>, <code>dp[4]</code> or <code>dp[3]</code>. With <code>dp[3]</code> still <code>∞</code> and the other two equal to 2, the best is 2 + 1 = 3 coins.",
        },
        {
          id: "c",
          text: "<code>0, ∞, 1, ∞, 2, 1, 1, 2, 3, 3</code>",
          why: "<code>dp[8]</code> is 2, not 3: <code>dp[6]</code> is 1, and one 2-coin on top of a 6-coin makes 8. The loop keeps the smaller of all the options.",
        },
        {
          id: "d",
          text: "<code>0, ∞, 1, ∞, 2, 1, 1, 2, 2, 3</code>",
          why: "Reading it left to right: 1 and 3 cannot be made, 2, 5 and 6 are single coins, 4 is 2 + 2, 7 is 2 + 5, 8 is 2 + 6, and 9 is 2 + 2 + 5. Each entry is the smallest of the options through the coins that fit.",
        },
      ],
      answer: "d",
    },
    {
      id: "dp1-trace-lis-table",
      chapter: "dsa-dp-1d",
      level: "intermediate",
      skill: "trace",
      pattern: "dp-1d",
      section: "worked-example-longest-increasing-subsequence",
      kind: "single",
      prompt:
        "<p>The O(n²) <code>lengthOfLIS</code> runs on <code>nums = [4, 10, 4, 3, 8, 9]</code>. What does <code>dp</code> hold when the loops finish?</p><pre><code>const dp = new Array(nums.length).fill(1);\nlet best = 1;\nfor (let i = 1; i &lt; nums.length; i++) {\n  for (let j = 0; j &lt; i; j++) {\n    if (nums[j] &lt; nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);\n  }\n  best = Math.max(best, dp[i]);\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>[1, 2, 2, 1, 3, 4]</code>",
          why: "This is what the table would hold if equal values counted as increasing, that is, if the test were <code>&lt;=</code>. The code uses <code>&lt;</code>, so the second 4 cannot follow the first.",
        },
        {
          id: "b",
          text: "<code>[1, 2, 2, 2, 2, 3]</code>",
          why: "That is the best length seen so far at each index, which is what <code>best</code> tracks. <code>dp[i]</code> only counts subsequences that end at <code>i</code>, so the second 4 and the 3 start over at 1.",
        },
        {
          id: "c",
          text: "<code>[1, 2, 1, 1, 2, 3]</code>",
          why: "The 10 extends the first 4. The second 4 and the 3 have no smaller element before them that could precede them, so both are 1. The 8 extends a 4 or the 3 to make 2, and the 9 extends that 8 to make 3.",
        },
        {
          id: "d",
          text: "<code>3</code>",
          why: "3 is the final value of <code>best</code>, the length of the longest subsequence, and it is the number the function returns. The question asks for the contents of <code>dp</code>, which is a table of six entries.",
        },
      ],
      answer: "c",
    },
    {
      id: "dp1-coin-change-time",
      chapter: "dsa-dp-1d",
      level: "intermediate",
      skill: "complexity",
      pattern: "dp-1d",
      section: "worked-example-coin-change-minimum-coins-to-make-an-amount",
      kind: "single",
      prompt:
        "<p>For an amount <code>A</code> and <code>k</code> coin values, what is the tightest bound on the worst-case <em>time</em> of the bottom-up <code>coinChange</code>?</p><pre><code>function coinChange(coins, amount) {\n  const dp = new Array(amount + 1).fill(Infinity);\n  dp[0] = 0;\n  for (let a = 1; a &lt;= amount; a++) {\n    for (const coin of coins) {\n      if (coin &lt;= a &amp;&amp; dp[a - coin] !== Infinity) {\n        dp[a] = Math.min(dp[a], dp[a - coin] + 1);\n      }\n    }\n  }\n  return dp[amount] === Infinity ? -1 : dp[amount];\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "O(A + k)",
          why: "That would mean one pass over the amounts and one over the coins. Here the coin loop is inside the amount loop, so the two multiply.",
        },
        {
          id: "b",
          text: "O(A · k)",
          why: "There are A amounts to fill, and each one tries all k coins with constant work per coin. Creating the table costs another O(A), which does not change the bound.",
        },
        {
          id: "c",
          text: "O(A²)",
          why: "The inner loop runs over the k coins, not over the A amounts. It would only be quadratic if the number of coins were about as large as the amount.",
        },
        {
          id: "d",
          text: "O(k^A)",
          why: "A recursion without a cache that tries every coin at every level can make on the order of that many calls. The table computes each of the A amounts once, so it does far less work.",
        },
      ],
      answer: "b",
    },
    {
      id: "dp1-lis-comparisons",
      chapter: "dsa-dp-1d",
      level: "intermediate",
      skill: "complexity",
      pattern: "dp-1d",
      section: "worked-example-longest-increasing-subsequence",
      kind: "single",
      prompt:
        "<p>This is the O(n²) <code>lengthOfLIS</code>. For any array with <code>n = 10</code> elements, how many times does the comparison <code>nums[j] &lt; nums[i]</code> run?</p><pre><code>function lengthOfLIS(nums) {\n  const dp = new Array(nums.length).fill(1);\n  let best = 1;\n  for (let i = 1; i &lt; nums.length; i++) {\n    for (let j = 0; j &lt; i; j++) {\n      if (nums[j] &lt; nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);\n    }\n    best = Math.max(best, dp[i]);\n  }\n  return best;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "10, one for each element.",
          why: "Each element is compared with all the elements before it, not with one. A linear count would only be right for a single pass.",
        },
        {
          id: "b",
          text: "55",
          why: "55 is 1 + 2 + … + 10, which is one row too many. Here <code>i</code> starts at 1 and stops at 9, because the loop ends before <code>i</code> reaches 10.",
        },
        {
          id: "c",
          text: "100",
          why: "100 is n², which counts every ordered pair of positions. Each unordered pair is compared at most once here, and an element is never compared with itself.",
        },
        {
          id: "d",
          text: "45",
          why: "The index <code>i</code> runs from 1 to 9 and the inner loop runs <code>i</code> times, so the count is 1 + 2 + … + 9 = 45, or n(n - 1) / 2. It does not depend on the values, which is why the whole function is O(n²) on every input.",
        },
      ],
      answer: "d",
    },
    {
      id: "dp1-order-robber-iteration",
      chapter: "dsa-dp-1d",
      level: "intermediate",
      skill: "trace",
      pattern: "dp-1d",
      section: "worked-example-house-robber",
      kind: "order",
      prompt:
        "<p>Put the work of one pass of the loop of <code>rob</code> in order. Start with reading the next value from <code>nums</code> and end with updating <code>prevTake</code>.</p><pre><code>function rob(nums) {\n  let prevSkip = 0, prevTake = 0;\n  for (const val of nums) {\n    const curr = Math.max(prevTake, prevSkip + val);\n    prevSkip = prevTake;\n    prevTake = curr;\n  }\n  return prevTake;\n}</code></pre>",
      items: [
        { id: "take", text: "The loop reads the next house value into <code>val</code>." },
        { id: "curr", text: "Compute <code>curr</code> from <code>prevTake</code> and <code>prevSkip + val</code>." },
        { id: "skip", text: "Set <code>prevSkip</code> to the old <code>prevTake</code>." },
        { id: "take-update", text: "Set <code>prevTake</code> to <code>curr</code>." },
      ],
      why: "<code>curr</code> needs the old values of both variables, so it is computed before either one changes. <code>prevSkip</code> must copy <code>prevTake</code> before <code>prevTake</code> is overwritten, or the old best would be lost, and <code>prevTake</code> is updated last.",
    },
    {
      id: "dp1-constant-space-tables",
      chapter: "dsa-dp-1d",
      level: "intermediate",
      skill: "complexity",
      pattern: "dp-1d",
      section: "bottom-up-tabulation-build-the-table-forward-no-recursion-at",
      kind: "multi",
      prompt:
        "<p>Each bottom-up table below is written the usual way. Select every one whose extra <em>space</em> can be cut to a fixed number of variables, however large <code>n</code> is.</p>",
      choices: [
        {
          id: "a",
          text: "Fibonacci, where <code>dp[i] = dp[i - 1] + dp[i - 2]</code>.",
          why: "Each entry reads only the two before it, so two variables carry everything the loop needs.",
        },
        {
          id: "b",
          text: "House Robber, where <code>dp[i] = max(dp[i - 1], dp[i - 2] + nums[i])</code>.",
          why: "Again only the last two entries are read, so <code>prevSkip</code> and <code>prevTake</code> replace the whole table, as in the chapter's version.",
        },
        {
          id: "c",
          text: "Coin Change, where <code>dp[a]</code> reads <code>dp[a - coin]</code> for every coin and a coin can be as large as the amount.",
          why: "A coin as large as the amount makes <code>dp[a]</code> read cells as far back as <code>a</code> itself, so the whole table has to be kept. A shorter window would only do if every coin were known to be small.",
        },
        {
          id: "d",
          text: "Longest Increasing Subsequence, where <code>dp[i]</code> reads <code>dp[j]</code> for every <code>j &lt; i</code>.",
          why: "Any earlier entry may be the best one to extend, so the whole table has to be kept in this form.",
        },
      ],
      answers: ["a", "b"],
    },
    {
      id: "dp1-circle-single-house",
      chapter: "dsa-dp-1d",
      level: "intermediate",
      skill: "edge-case",
      pattern: "dp-1d",
      section: "house-robber-ii-a-circle-is-two-lines",
      kind: "single",
      prompt:
        "<p>A developer writes House Robber II as <code>Math.max(robLine(nums, 0, n - 2), robLine(nums, 1, n - 1))</code>, where <code>robLine(nums, lo, hi)</code> returns the best total for the houses <code>lo..hi</code> on a line and 0 for an empty range. The special case for one house is left out. What does it return for <code>nums = [5]</code>?</p>",
      choices: [
        {
          id: "a",
          text: "<code>5</code>, because the only house can be robbed.",
          why: "5 is the right answer, but this code does not produce it. Both ranges are empty for a single house, and an empty range is worth 0.",
        },
        {
          id: "b",
          text: "<code>0</code>, because both ranges are empty.",
          why: "The first range is 0 to -1 and the second is 1 to 0, and each is worth 0. The function therefore returns 0, although a single house in a circle has no neighbour to conflict with.",
        },
        {
          id: "c",
          text: "<code>NaN</code>, because the code reads <code>nums[-1]</code>.",
          why: "The loops in <code>robLine</code> run from <code>lo</code> while <code>i &lt;= hi</code>, so an empty range never runs the body and no element is read at all.",
        },
        {
          id: "d",
          text: "It throws a <code>RangeError</code> because the range is backwards.",
          why: "A backwards range just makes the loop condition false at the start. Nothing is thrown, and the helper returns its starting value.",
        },
      ],
      answer: "b",
    },
    {
      id: "dp1-decode-zeros",
      chapter: "dsa-dp-1d",
      level: "intermediate",
      skill: "trace",
      pattern: "dp-1d",
      section: "decode-ways-counting-with-two-look-backs",
      kind: "single",
      prompt: '<p>With A = 1 up to Z = 26, how many ways are there to decode <code>"2101"</code>?</p>',
      choices: [
        {
          id: "a",
          text: "<code>1</code>",
          why: "The only reading is 2-10-1: the 0 has to pair with the 1 before it. The pair 21 would leave a lone 0, which is not a letter.",
        },
        {
          id: "b",
          text: "<code>2</code>",
          why: "A second reading would need 21 followed by 01, or 2 followed by 1, 0 and 1. The 0 cannot stand alone and 01 is not a valid pair, so those fail.",
        },
        {
          id: "c",
          text: "<code>3</code>",
          why: "This counts readings such as 2-1-0-1 and 21-0-1 as valid. Both contain a lone 0, which no letter uses, so they are not readings.",
        },
        {
          id: "d",
          text: "<code>0</code>",
          why: "A reading does exist: 2-10-1 uses every digit and every piece is a letter. The zeros block the other splits, but not this one.",
        },
      ],
      answer: "a",
    },
    {
      id: "dp1-word-break-time",
      chapter: "dsa-dp-1d",
      level: "intermediate",
      skill: "complexity",
      pattern: "dp-1d",
      section: "word-break-does-a-prefix-split-into-words",
      kind: "single",
      prompt:
        "<p>In <code>wordBreak</code> the inner loop looks back at most <code>maxLen</code> characters, where <code>maxLen</code> is the length of the longest word, and each candidate is checked by slicing a substring and looking it up in a <code>Set</code>. For a string of length <code>n</code>, what is the tightest worst-case time in terms of <code>n</code> and <code>maxLen</code>?</p>",
      choices: [
        {
          id: "a",
          text: "O(n)",
          why: "The table has n + 1 cells, but each cell tries up to maxLen start positions, so the loop alone does more than n steps.",
        },
        {
          id: "b",
          text: "O(n · maxLen)",
          why: "This counts the pairs of positions tried, but not the cost of each one. Slicing a substring of up to maxLen characters and hashing it costs up to maxLen more.",
        },
        {
          id: "c",
          text: "O(n · maxLen²)",
          why: "There are at most n · maxLen pairs, and each one builds and hashes a string of up to maxLen characters.",
        },
        {
          id: "d",
          text: "O(n³), whatever the dictionary",
          why: "That is the cost without the maxLen bound, when every start position is tried. The bound is what keeps the loop short, and maxLen can be much smaller than n.",
        },
      ],
      answer: "c",
    },
    {
      id: "dp1-tails-contents",
      chapter: "dsa-dp-1d",
      level: "intermediate",
      skill: "trace",
      pattern: "dp-1d",
      section: "lis-in-o-n-log-n-the-tails-array",
      kind: "single",
      prompt:
        "<p>After <code>lengthOfLISFast([4, 5, 1])</code> has processed every element, what does the array <code>tails</code> hold?</p>",
      choices: [
        {
          id: "a",
          text: "<code>[4, 5]</code>, the longest increasing subsequence.",
          why: "This is a longest increasing subsequence of the input, but <code>tails</code> does not store one. The 1 replaces the 4, since it is the smallest value that can end a run of length 1.",
        },
        {
          id: "b",
          text: "<code>[1, 5]</code>, with a 1 that comes after the 5 in the input.",
          why: "The 4 is overwritten by 1, and the 5 stays as the best end of a run of length 2. The array is not a subsequence of the input, because 1 comes after 5 there, but its length 2 is the correct answer.",
        },
        {
          id: "c",
          text: "<code>[1]</code>, because the later, smaller value removes the earlier ones.",
          why: "A smaller value replaces only the first tail that is not smaller than it. The tail 5 stays, because it is the best end for a run of length 2.",
        },
        {
          id: "d",
          text: "<code>[4, 5, 1]</code>, a copy of the input.",
          why: "A value is appended only when it is larger than every tail. The 1 is not, so it takes the place of an existing tail and the array stays at length 2.",
        },
      ],
      answer: "b",
    },
    {
      id: "dp1-product-one-state",
      chapter: "dsa-dp-1d",
      level: "intermediate",
      skill: "edge-case",
      pattern: "dp-1d",
      section: "two-meanings-of-dp-i-and-kadane-s-two-states",
      kind: "single",
      prompt:
        "<p>A developer solves Maximum Product Subarray with a single running value, <code>cur = Math.max(nums[i], cur * nums[i])</code>, and tracks the largest <code>cur</code> seen. What does it return for <code>[-2, 3, -4]</code>?</p>",
      choices: [
        {
          id: "a",
          text: "<code>24</code>, the product of the whole array.",
          why: "24 is the correct answer and the product of all three numbers, but a single running maximum cannot reach it. It loses the -6 that the next negative number would turn into a large positive one.",
        },
        {
          id: "b",
          text: "<code>12</code>, the product of 3 and 4 with the sign ignored.",
          why: "12 is not the product of any contiguous subarray here. The contiguous products are -2, 3, -4, -6, -12 and 24.",
        },
        {
          id: "c",
          text: "<code>3</code>, the best the single value ever reaches.",
          why: "The running value goes -2, 3 and then max(-4, -12) = -4. The largest value seen is 3, short of the true answer 24 because the minimum was never kept.",
        },
        {
          id: "d",
          text: "<code>-4</code>, the last value of the running product.",
          why: "-4 is where <code>cur</code> ends, but the function returns the largest value seen along the way, which is 3.",
        },
      ],
      answer: "c",
    },
    {
      id: "dp1-coin-order-sequences",
      chapter: "dsa-dp-1d",
      level: "intermediate",
      skill: "trace",
      pattern: "dp-1d",
      section: "coin-change-ii-the-loop-order-decides-what-you-count",
      kind: "single",
      prompt:
        "<p>A developer writes Coin Change II with the amount loop on the outside and the coin loop inside, so <code>ways[a] += ways[a - coin]</code> for every coin that fits. What does it return for <code>amount = 4</code> and <code>coins = [1, 2, 3]</code>?</p>",
      choices: [
        {
          id: "a",
          text: "<code>4</code>, the number of combinations: 1+1+1+1, 1+1+2, 2+2 and 1+3.",
          why: "This is the answer with the coins loop on the outside. With the amounts outside, the order of the coins matters, so 1+1+2, 1+2+1 and 2+1+1 are three different entries.",
        },
        {
          id: "b",
          text: "<code>7</code>, the number of ordered sequences of coins that sum to 4.",
          why: "Every order counts: 1+1+1+1, three arrangements of 1+1+2, 2+2, and two of 1+3 and 3+1, which makes 1 + 3 + 1 + 2 = 7.",
        },
        {
          id: "c",
          text: "<code>8</code>, every way to write 4 as an ordered sum of positive integers.",
          why: "8 counts the ordered sums with no limit on the part size, which includes the single part 4. The coin 4 is not in the list, so that sum is not allowed.",
        },
        {
          id: "d",
          text: "<code>3</code>, because the larger coins are used up first.",
          why: "Nothing is used up. Every coin can be used again and again, and the loop adds up every way to reach each amount.",
        },
      ],
      answer: "b",
    },
    {
      id: "dp1-forward-knapsack",
      chapter: "dsa-dp-1d",
      level: "intermediate",
      skill: "edge-case",
      pattern: "dp-1d",
      section: "partition-equal-subset-sum-the-backwards-loop",
      kind: "single",
      prompt:
        "<p>A developer writes the inner loop of <code>canPartition</code> as <code>for (let s = x; s &lt;= target; s++)</code> instead of counting down from <code>target</code>. What does it return for <code>[3, 9]</code>, whose total is 12 and whose target is 6?</p>",
      choices: [
        {
          id: "a",
          text: "<code>false</code>, which is the correct answer.",
          why: "False is the correct answer, since the two numbers cannot be split into halves of 6. The upward loop gets it wrong anyway, because it reuses the 3.",
        },
        {
          id: "b",
          text: "<code>true</code>, because the item 3 is allowed to feed itself.",
          why: "Reading upward, <code>reachable[3]</code> is set by the 3 and then <code>reachable[6]</code> is set from <code>reachable[3]</code>, which uses that single 3 twice.",
        },
        {
          id: "c",
          text: "<code>true</code>, because 9 minus 3 is 6.",
          why: "Subtraction is not what the table checks. It adds items, and 9 is above the target of 6, so the loop never reaches it.",
        },
        {
          id: "d",
          text: "It runs forever, because the loop never reaches the target.",
          why: "The loop variable rises by one on each step and stops at the target. Only a missing increment would make it endless.",
        },
      ],
      answer: "b",
    },
    {
      id: "dp1-segment-recognise",
      chapter: "dsa-dp-1d",
      level: "intermediate",
      skill: "recognise",
      pattern: "dp-1d",
      section: "recognizing-it-in-an-unseen-problem",
      kind: "single",
      prompt:
        "<p>You are given a string of up to 100,000 characters and a list of words, and must say whether the string can be written as a sequence of words from the list, each used any number of times. Which approach fits best?</p>",
      choices: [
        {
          id: "a",
          text: "At each position take the longest word that matches, and report failure if none matches at some position.",
          why: "Taking the longest match can consume characters a later word needs. With the words ab, abc and cd, the string abcd is lost by taking abc.",
        },
        {
          id: "b",
          text: "Recurse over every way of cutting the string and stop at the first success, with no cache of earlier results.",
          why: "This is correct but repeats the same suffixes through different cuts, which can take exponential time on a long string.",
        },
        {
          id: "c",
          text: "Keep a boolean per prefix, true when an earlier splittable prefix is followed by a word, looking back only as far as the longest word.",
          why: "Each prefix is decided once from smaller prefixes, so the work is bounded by the length of the string times the longest word, which is fast enough for this size.",
        },
        {
          id: "d",
          text: "Sort the words and binary search for each piece of the string.",
          why: "Sorting does not tell you where one piece ends and the next begins, so there is nothing to search for until the cuts are known.",
        },
      ],
      answer: "c",
    },
  ],
  pattern: {
    pattern: "dp-1d",
    chapter: "dsa-dp-1d",
    signals: [
      "The prompt asks for the maximum, minimum, or number of ways over a sequence or an amount.",
      "A plain recursive solution exists but repeats the same subproblems, so it grows exponentially.",
      "The answer at position i can be built from answers at a few earlier positions.",
      "A greedy choice looks tempting but a small counterexample breaks it.",
      "The prompt asks for fewest steps, coins or jumps to reach a target, where choices can repeat.",
    ],
    template:
      "<pre><code>const dp = new Array(n + 1).fill(base);\ndp[0] = start;\nfor (let i = 1; i &lt;= n; i++) {\n  for (const step of steps) {\n    if (step &lt;= i) dp[i] = best(dp[i], dp[i - step] + cost);\n  }\n}\nreturn dp[n];</code></pre>",
    time: "O(n · k) for k transitions per state, O(n) for a fixed few",
    space: "O(n), or O(1) when each state needs only a fixed window of earlier ones",
    styles: ["online-assessment", "phone-screen", "onsite"],
  },
};
