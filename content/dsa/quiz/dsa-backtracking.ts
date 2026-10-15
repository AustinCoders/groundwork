import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "bt-parentheses-approach",
      chapter: "dsa-backtracking",
      level: "intermediate",
      skill: "recognise",
      pattern: "backtracking",
      section: "the-shape-choose-explore-un-choose",
      placement: true,
      kind: "single",
      prompt:
        '<p>Given a number <code>n</code>, list every string made of <code>n</code> pairs of round brackets in which each opening bracket is closed in the right order. For <code>n = 2</code> the answer is <code>"(())"</code> and <code>"()()"</code>. Which approach fits best?</p>',
      choices: [
        {
          id: "a",
          text: "Fill a table where <code>dp[i]</code> counts the valid strings that use <code>i</code> pairs, and read off the entry for <code>n</code>.",
          why: "A table like that can tell you how many strings exist (for <code>n = 3</code> there are 5), but the task asks for the strings themselves, and a count does not list them.",
        },
        {
          id: "b",
          text: "Build every one of the 4ⁿ strings made of <code>(</code> and <code>)</code> with length 2n first, and only then keep the valid ones.",
          why: "It gives the right answer, but it builds every candidate before checking any. For <code>n = 3</code> that is 64 strings to find 5 valid ones. Checking while building lets you stop a branch the moment it can no longer be valid.",
        },
        {
          id: "c",
          text: "Add one bracket at a time: open while fewer than <code>n</code> are used, close only while closings trail openings, and keep each string of length <code>2n</code>.",
          why: "This is choose, explore, un-choose on a decision tree. The two conditions prune every branch that could never become valid, and every string that reaches full length is an answer, so nothing is missed and nothing is built twice.",
        },
        {
          id: "d",
          text: "At each position place the bracket that keeps the string valid so far, and stop once the first complete string has been built.",
          why: "That finds at most one string. The task asks for every valid string, which means going back and trying the other choices at each position, and that is what backtracking does.",
        },
      ],
      answer: "c",
    },
    {
      id: "bt-reuse-start-index",
      chapter: "dsa-backtracking",
      level: "intermediate",
      skill: "recognise",
      pattern: "backtracking",
      section: "combination-sum-when-you-re-allowed-to-reuse-an-element",
      placement: true,
      kind: "single",
      prompt:
        "<p>Given distinct positive numbers such as <code>[2, 3, 5]</code> and a target such as <code>8</code>, list every group of numbers that adds up to the target. A number may be used any number of times, and <code>[2, 3, 3]</code> and <code>[3, 2, 3]</code> count as the same group. The search loops <code>for (let i = start; i &lt; candidates.length; i++)</code>. What start should the recursive call receive?</p>",
      choices: [
        {
          id: "a",
          text: "<code>i + 1</code>, so that the loop only ever moves on to the numbers after this one.",
          why: "Moving past <code>i</code> means each number can be used at most once. For <code>[2, 3, 5]</code> and 8 the only group found is <code>[3, 5]</code>, and <code>[2, 2, 2, 2]</code> and <code>[2, 3, 3]</code> are lost.",
        },
        {
          id: "b",
          text: "<code>i</code>, so a number can repeat but never one before it.",
          why: "Staying on <code>i</code> allows repeats, and never going back means each group is built in one fixed order. <code>[2, 3, 3]</code> is found once and <code>[3, 2, 3]</code> is never built.",
        },
        {
          id: "c",
          text: "<code>0</code>, so that every number is available again at every level of the search.",
          why: "Every group is found, but once for each ordering of its numbers. For <code>[2, 3, 5]</code> and 8 the search lists six arrays for three groups, such as <code>[2, 3, 3]</code>, <code>[3, 2, 3]</code> and <code>[3, 3, 2]</code>.",
        },
        {
          id: "d",
          text: "<code>i - 1</code>, so the search may step back to the number before.",
          why: "Stepping back reopens earlier numbers, so the same group would be listed in several orders. Worse, when <code>i</code> is 0 the start would be -1, so the loop reads <code>candidates[-1]</code>, which is <code>undefined</code>, <code>remaining</code> becomes <code>NaN</code> and the recursion never stops.",
        },
      ],
      answer: "b",
    },
    {
      id: "bt-count-only",
      chapter: "dsa-backtracking",
      level: "intermediate",
      skill: "recognise",
      pattern: "backtracking",
      section: "recognizing-it-in-an-unseen-problem",
      kind: "single",
      prompt:
        "<p>A staircase has 40 steps and you climb 1 or 2 steps at a time. The problem asks only <em>how many</em> different ways there are to reach the top, not for the ways themselves. Which approach fits best?</p>",
      choices: [
        {
          id: "a",
          text: "Count with a table or a memoized recursion, where the ways to reach step <code>k</code> come from steps <code>k - 1</code> and <code>k - 2</code>.",
          why: "Only a number is wanted, and the smaller questions repeat, so storing each answer once keeps the work linear in the number of steps. Backtracking earns its cost when you must produce every answer.",
        },
        {
          id: "b",
          text: "Backtrack over every sequence of steps and add one to a counter for each sequence that reaches the top step.",
          why: "It is correct, but it visits every sequence one by one. For 40 steps there are 165,580,141 of them, far more work than the 40 table cells that give the same count.",
        },
        {
          id: "c",
          text: "Always take 2 steps while you can, then take a final 1 if one is needed, and report how many steps that took.",
          why: "That describes a single way of climbing, not the number of ways. A greedy choice cannot count alternatives it never tries.",
        },
      ],
      answer: "a",
    },
    {
      id: "bt-copy-the-path",
      chapter: "dsa-backtracking",
      level: "intermediate",
      skill: "edge-case",
      pattern: "backtracking",
      section: "the-template-every-backtracking-problem-is-built-from",
      kind: "single",
      prompt:
        "<p>A teammate pushes <code>path</code> itself instead of a copy. What does <code>subsets([1, 2])</code> return?</p><pre><code>function subsets(nums) {\n  const results = [];\n  function backtrack(start, path) {\n    results.push(path);\n    for (let i = start; i &lt; nums.length; i++) {\n      path.push(nums[i]);\n      backtrack(i + 1, path);\n      path.pop();\n    }\n  }\n  backtrack(0, []);\n  return results;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>[[], [1], [1, 2], [2]]</code>, because each push records the path as it was at that moment.",
          why: "Pushing <code>path</code> records a reference to the one array that keeps changing, not a snapshot of its contents. Only <code>[...path]</code> or <code>path.slice()</code> takes a snapshot.",
        },
        {
          id: "b",
          text: "<code>[[1, 2], [1, 2], [1, 2], [1, 2]]</code>, because the longest path is the last one built.",
          why: "The four entries are indeed the same array, but it does not keep the longest path. Every <code>push</code> is undone by a <code>pop</code> before the calls return, so the array is back to its starting state.",
        },
        {
          id: "c",
          text: "<code>[]</code>, because nothing is ever added to <code>results</code>.",
          why: "The line <code>results.push(path)</code> does run, once per call, and there are four calls. The array it holds just ends up looking empty.",
        },
        {
          id: "d",
          text: "<code>[[], [], [], []]</code>, four references to the same array that is empty by the end.",
          why: "There are four calls, so four entries, and all of them point to the single <code>path</code>. Every choice is undone as the calls return, so by the end that array is empty and every entry reads as <code>[]</code>.",
        },
      ],
      answer: "d",
    },
    {
      id: "bt-trace-combination-sum",
      chapter: "dsa-backtracking",
      level: "intermediate",
      skill: "trace",
      pattern: "backtracking",
      section: "combination-sum-when-you-re-allowed-to-reuse-an-element",
      kind: "single",
      prompt:
        "<p>What does <code>combinationSum([2, 3, 4], 8)</code> return, in the order the arrays are pushed?</p><pre><code>function combinationSum(candidates, target) {\n  const results = [];\n  function backtrack(start, path, remaining) {\n    if (remaining === 0) { results.push([...path]); return; }\n    if (remaining &lt; 0) return;\n    for (let i = start; i &lt; candidates.length; i++) {\n      path.push(candidates[i]);\n      backtrack(i, path, remaining - candidates[i]);\n      path.pop();\n    }\n  }\n  backtrack(0, [], target);\n  return results;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>[[2, 2, 2, 2], [2, 2, 4], [2, 3, 3], [4, 4]]</code>",
          why: "The loop tries 2 first and keeps choosing it until the sum reaches 8, so <code>[2, 2, 2, 2]</code> comes first. Backing up and trying larger numbers in place of the last 2 gives <code>[2, 2, 4]</code>, then <code>[2, 3, 3]</code>, and the branches that start with 4 give <code>[4, 4]</code> last.",
        },
        {
          id: "b",
          text: "<code>[[4, 4], [2, 3, 3], [2, 2, 4], [2, 2, 2, 2]]</code>",
          why: "The same four groups, but in reverse. The loop tries the numbers in array order, smallest first here, and a group is pushed the moment it is complete, so the all-2 group is found first.",
        },
        {
          id: "c",
          text: "<code>[[2, 2, 2, 2], [2, 2, 4], [2, 3, 3], [3, 2, 3], [3, 3, 2], [4, 4]]</code>",
          why: "That is what you would get if the recursive call restarted the loop at 0. Here the call passes <code>i</code>, so after choosing a 3 the search never picks a 2 again, and each group appears in one order only.",
        },
        {
          id: "d",
          text: "<code>[]</code>",
          why: "That is the result when the call moves on with <code>i + 1</code>, so each number is used at most once. No distinct numbers of 2, 3 and 4 add up to 8. Here <code>i</code> is passed, so numbers repeat and groups exist.",
        },
      ],
      answer: "a",
    },
    {
      id: "bt-subsets-time",
      chapter: "dsa-backtracking",
      level: "intermediate",
      skill: "complexity",
      pattern: "backtracking",
      section: "why-the-complexity-looks-scary-and-that-s-expected",
      kind: "single",
      prompt:
        "<p>For <code>nums</code> with <code>n</code> distinct numbers, what is the tightest bound on the worst-case <em>time</em> of this function, counting the work of copying each path into <code>results</code>?</p><pre><code>function subsets(nums) {\n  const results = [];\n  function backtrack(start, path) {\n    results.push([...path]);\n    for (let i = start; i &lt; nums.length; i++) {\n      path.push(nums[i]);\n      backtrack(i + 1, path);\n      path.pop();\n    }\n  }\n  backtrack(0, []);\n  return results;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "O(2ⁿ)",
          why: "That is the number of calls and of subsets, but each call also copies its path, which costs time proportional to the path's length. Counting those copies, the total is larger.",
        },
        {
          id: "b",
          text: "O(n²)",
          why: "The search makes 2ⁿ calls, one per subset, so it cannot be bounded by a polynomial in n.",
        },
        {
          id: "c",
          text: "O(n · 2ⁿ)",
          why: "There are 2ⁿ calls, one per subset, and the copies add up to n · 2ⁿ⁻¹ elements in total, because each element appears in half of the subsets. The loop work in the calls adds only on the order of 2ⁿ steps, so the copies set the bound.",
        },
        {
          id: "d",
          text: "O(n!)",
          why: "n! counts the orderings of the numbers, which is what permutations produce. Subsets ignore order, and there are only 2ⁿ of them.",
        },
      ],
      answer: "c",
    },
    {
      id: "bt-permutations-space",
      chapter: "dsa-backtracking",
      level: "intermediate",
      skill: "complexity",
      pattern: "backtracking",
      section: "permutations-order-matters-every-element-used-exactly-once",
      kind: "single",
      prompt:
        "<p>For <code>nums</code> with <code>n</code> distinct numbers, what is the tightest bound on the extra <em>space</em> that <code>permute</code> uses at its peak, not counting the arrays stored in <code>results</code>?</p><pre><code>function permute(nums) {\n  const results = [];\n  function backtrack(path, used) {\n    if (path.length === nums.length) {\n      results.push([...path]);\n      return;\n    }\n    for (let i = 0; i &lt; nums.length; i++) {\n      if (used[i]) continue;\n      used[i] = true;\n      path.push(nums[i]);\n      backtrack(path, used);\n      path.pop();\n      used[i] = false;\n    }\n  }\n  backtrack([], new Array(nums.length).fill(false));\n  return results;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "O(1), because only a few variables change.",
          why: "The <code>used</code> array has n entries and <code>path</code> grows to n elements, so the extra space is at least linear.",
        },
        {
          id: "b",
          text: "O(n)",
          why: "The <code>path</code> holds at most n numbers, <code>used</code> holds n flags, and the recursion is at most n + 1 calls deep. All three are linear, and the n! stored permutations are output, which this question leaves out.",
        },
        {
          id: "c",
          text: "O(n!), because every permutation has to be remembered while the search runs.",
          why: "Each finished permutation is copied into <code>results</code>, which is the output. Apart from that, the search keeps just one <code>path</code> and one <code>used</code> array at any time.",
        },
        {
          id: "d",
          text: "O(n²), because each of the n levels of recursion holds its own path.",
          why: "The levels share one <code>path</code> array and one <code>used</code> array, since both are passed by reference and changed in place. Each level adds only a constant number of values, such as the loop index.",
        },
      ],
      answer: "b",
    },
    {
      id: "bt-word-search-no-restore",
      chapter: "dsa-backtracking",
      level: "intermediate",
      skill: "edge-case",
      pattern: "backtracking",
      section: "word-search-backtracking-over-a-grid-instead-of-an-array",
      kind: "single",
      prompt:
        '<p>The line that restores the cell after exploring, <code>board[r][c] = temp</code>, has been deleted from <code>exist</code>. The board is one row, <code>[["B", "A", "A"]]</code>, and the word is <code>"AAB"</code>, which can be read by starting at the right-hand <code>A</code> and moving left. What does <code>exist</code> return?</p><pre><code>function exist(board, word) {\n  const rows = board.length, cols = board[0].length;\n  function backtrack(r, c, i) {\n    if (i === word.length) return true;\n    if (r &lt; 0 || r &gt;= rows || c &lt; 0 || c &gt;= cols) return false;\n    if (board[r][c] !== word[i]) return false;\n    board[r][c] = "#";\n    return (\n      backtrack(r + 1, c, i + 1) ||\n      backtrack(r - 1, c, i + 1) ||\n      backtrack(r, c + 1, i + 1) ||\n      backtrack(r, c - 1, i + 1)\n    );\n  }\n  for (let r = 0; r &lt; rows; r++) {\n    for (let c = 0; c &lt; cols; c++) {\n      if (backtrack(r, c, 0)) return true;\n    }\n  }\n  return false;\n}</code></pre>',
      choices: [
        {
          id: "a",
          text: "<code>true</code>, because the word can be read starting from the right.",
          why: "The word can be read that way, but the search starts at the left and meets the middle cell first. That attempt marks both <code>A</code> cells with <code>#</code> and fails, and the marks are never removed, so the later start finds no letters to match.",
        },
        {
          id: "b",
          text: "A <code>TypeError</code>, because a cell is overwritten while it is still being read.",
          why: "Assigning to an array element while recursing is allowed, and nothing here reads an undefined value. The function returns normally.",
        },
        {
          id: "c",
          text: "<code>true</code>, because the first start finds the word before any cell is marked.",
          why: "A mark is written as soon as a cell matches, before its neighbours are tried. The first start, at <code>B</code>, does not match <code>A</code> at all, so it marks nothing and the next start is the middle cell.",
        },
        {
          id: "d",
          text: "<code>false</code>, although the board does contain the word.",
          why: "The start at the middle <code>A</code> marks it, then marks the right-hand <code>A</code>, and finds no <code>B</code> beside it. Without the restore, both stay as <code>#</code>. The start at the right-hand cell now sees <code>#</code> instead of <code>A</code> and fails. With the restore line, the same search returns <code>true</code>.",
        },
      ],
      answer: "d",
    },
    {
      id: "bt-queens-stale-diagonal",
      chapter: "dsa-backtracking",
      level: "intermediate",
      skill: "edge-case",
      pattern: "backtracking",
      section: "n-queens-pruning-is-what-makes-it-tractable",
      kind: "single",
      prompt:
        "<p>In <code>solveNQueens</code> the cleanup line is changed to <code>cols.delete(col); diag1.delete(d1);</code>, so <code>diag2.delete(d2)</code> is gone. Nothing else changes. What does <code>solveNQueens(4)</code> return? The correct version returns two boards.</p>",
      choices: [
        {
          id: "a",
          text: "<code>[]</code>, because old anti-diagonal entries keep blocking free squares.",
          why: "Leftover values in <code>diag2</code> make squares look attacked when they are free, so the search throws away branches that lead to real answers. For <code>n = 4</code> that removes both solutions.",
        },
        {
          id: "b",
          text: "Both correct boards, and also some boards in which queens attack each other.",
          why: "Extra entries in <code>diag2</code> can only reject squares, never accept one that is attacked. The checks for columns and the other diagonal are still exact, so no invalid board is produced.",
        },
        {
          id: "c",
          text: "The same two boards, because the column and main-diagonal checks still do the pruning.",
          why: "The column and main-diagonal checks are still exact, but the leftover anti-diagonal values block squares that no queen on the board attacks. For <code>n = 4</code> that costs both solutions.",
        },
        {
          id: "d",
          text: "A <code>RangeError</code>, because <code>diag2</code> grows without bound.",
          why: "A <code>Set</code> holds each value once, and the values <code>row + col</code> only range from 0 to 6 for a 4×4 board. The set stays small and the function returns normally.",
        },
      ],
      answer: "a",
    },
    {
      id: "bt-order-subsets-events",
      chapter: "dsa-backtracking",
      level: "intermediate",
      skill: "trace",
      pattern: "backtracking",
      section: "subsets-include-or-exclude-every-element",
      kind: "order",
      prompt:
        "<p>While <code>subsets([1, 2])</code> runs, <code>results</code> first becomes <code>[[], [1]]</code>, and then these five events happen. Put them in the order they happen, starting with <code>[1, 2]</code> being added to <code>results</code> and ending with <code>[2]</code> being added to it.</p>",
      items: [
        { id: "copy12", text: "A copy of <code>[1, 2]</code> is pushed onto <code>results</code>." },
        { id: "pop2", text: "<code>path.pop()</code> removes the 2, leaving <code>[1]</code>." },
        { id: "pop1", text: "<code>path.pop()</code> removes the 1, leaving <code>[]</code>." },
        { id: "push2", text: "<code>path.push(2)</code> is run on the empty path, making it <code>[2]</code>." },
        { id: "copy2", text: "A copy of <code>[2]</code> is pushed onto <code>results</code>." },
      ],
      why: "The call that holds <code>[1, 2]</code> has no later index to try, so it returns, and the <code>pop</code> in the call that added the 2 runs first. That call's loop is also finished, so it returns, and the <code>pop</code> that removes the 1 runs next. Only then does the outermost loop reach <code>i = 1</code>, push the 2 onto the empty path, and record <code>[2]</code> as the first thing the new call does.",
    },
    {
      id: "bt-which-changes-break-subsets",
      chapter: "dsa-backtracking",
      level: "intermediate",
      skill: "edge-case",
      pattern: "backtracking",
      section: "subsets-include-or-exclude-every-element",
      kind: "multi",
      prompt:
        "<p>Each change below is made on its own to the <code>subsets</code> function, called with distinct numbers. Select every change that makes it return a wrong set of subsets.</p>",
      choices: [
        {
          id: "a",
          text: "Push <code>path</code> into <code>results</code> instead of <code>[...path]</code>.",
          why: "Every entry becomes a reference to the one array that is changed all through the search, so the entries all end up showing the same contents, which is an empty array here.",
        },
        {
          id: "b",
          text: "Call <code>backtrack(start + 1, path)</code> instead of <code>backtrack(i + 1, path)</code>.",
          why: "The next call no longer starts after the number just chosen. For <code>[1, 2, 3]</code> that lets the search pick a number twice and return arrays such as <code>[2, 2]</code> and <code>[1, 3, 3]</code>.",
        },
        {
          id: "c",
          text: "Move <code>results.push([...path])</code> to after the <code>for</code> loop.",
          why: "Every call still records its path, only after its children instead of before them. All eight subsets of <code>[1, 2, 3]</code> are still returned, and only their order changes.",
        },
        {
          id: "d",
          text: "Drop <code>path.push</code> and <code>path.pop</code>, and call <code>backtrack(i + 1, [...path, nums[i]])</code>.",
          why: "Each call now gets its own new array, so there is nothing to undo and no shared array to corrupt. The results are the same subsets in the same order, at the price of copying the array on every call.",
        },
      ],
      answers: ["a", "b"],
    },
    {
      id: "bt-skip-from-zero",
      chapter: "dsa-backtracking",
      level: "intermediate",
      skill: "edge-case",
      pattern: "backtracking",
      section: "duplicates-in-the-input-sort-then-skip-at-the-same-level",
      kind: "single",
      prompt:
        "<p>A developer writes the duplicate test of <code>subsetsWithDup</code> as <code>if (i &gt; 0 &amp;&amp; sorted[i] === sorted[i - 1]) continue;</code>, instead of comparing <code>i</code> with <code>start</code>. The array is sorted first. What does <code>subsetsWithDup([1, 2, 2])</code> return?</p>",
      choices: [
        {
          id: "a",
          text: "<code>[[], [1], [1, 2], [1, 2, 2], [2], [2, 2]]</code>, the six distinct subsets.",
          why: "This is what the correct test returns. With <code>i &gt; 0</code> the second 2 is skipped even in the call where the first 2 has just been chosen, so any subset holding two 2s is never built.",
        },
        {
          id: "b",
          text: "<code>[[], [1], [1, 2], [1, 2, 2], [1, 2], [2], [2, 2], [2]]</code>, with <code>[1, 2]</code> and <code>[2]</code> repeated.",
          why: "That list is what the code returns if the skip is left out altogether. Here the skip is present, so two of those entries are never built.",
        },
        {
          id: "c",
          text: "<code>[[], [1], [1, 2], [2]]</code>, with every subset that needs two 2s missing.",
          why: "Whenever the loop reaches the second 2, its neighbour is also a 2 and <code>i &gt; 0</code> holds, so it is skipped at every depth. Neither <code>[2, 2]</code> nor <code>[1, 2, 2]</code> can be built.",
        },
        {
          id: "d",
          text: "<code>[[], [1], [1, 2], [1, 2, 2]]</code>, only the subsets that start with 1.",
          why: "The loop at the top level still tries the first 2, since its neighbour is 1 and not another 2, so <code>[2]</code> is built. Also, <code>[1, 2, 2]</code> can never be built, because the second 2 is skipped.",
        },
      ],
      answer: "c",
    },
    {
      id: "bt-forgot-to-sort",
      chapter: "dsa-backtracking",
      level: "intermediate",
      skill: "edge-case",
      pattern: "backtracking",
      section: "duplicates-in-the-input-sort-then-skip-at-the-same-level",
      kind: "single",
      prompt:
        "<p>A developer removes the sort from <code>subsetsWithDup</code> and keeps the skip <code>if (i &gt; start &amp;&amp; nums[i] === nums[i - 1]) continue;</code>. The call is <code>subsetsWithDup([2, 1, 2])</code>. What is true of the result?</p>",
      choices: [
        {
          id: "a",
          text: "It holds 6 lists, all different, because equal values are skipped wherever they sit in the array.",
          why: "The skip compares a value with the one right before it in the array. In <code>[2, 1, 2]</code> the two 2s are not neighbours, so the skip never fires and every branch is explored.",
        },
        {
          id: "b",
          text: "It holds 8 lists, and some describe the same subset, such as <code>[2]</code> twice and <code>[2, 1]</code> with <code>[1, 2]</code>.",
          why: "The skip never fires on this input, so the code behaves like the plain version and returns all 2³ = 8 lists. The two 2s give repeated subsets, and the order inside a list follows the order in the array.",
        },
        {
          id: "c",
          text: "It holds 8 lists, all describing different subsets, since the skip removes the repeated ones.",
          why: "Three elements give 8 lists whichever way they are listed, but two of the elements are equal, and any pair of lists that differ only in which 2 they hold describe the same subset.",
        },
        {
          id: "d",
          text: "It throws, because comparing neighbours that are not sorted is not allowed.",
          why: "Nothing in the comparison cares about the order. It compares two numbers and, for this input, the comparison is simply never true.",
        },
      ],
      answer: "b",
    },
    {
      id: "bt-twin-skipped",
      chapter: "dsa-backtracking",
      level: "intermediate",
      skill: "trace",
      pattern: "backtracking",
      section: "duplicates-in-the-input-sort-then-skip-at-the-same-level",
      kind: "single",
      prompt:
        "<p>In <code>permuteUnique([1, 1, 2])</code> the array is sorted, <code>used</code> starts all false, and the rule is <code>if (i &gt; 0 &amp;&amp; sorted[i] === sorted[i - 1] &amp;&amp; !used[i - 1]) continue;</code>. At the very first call, with an empty path, which indices does the loop skip, and how many permutations are recorded in all?</p>",
      choices: [
        {
          id: "a",
          text: "It skips index 1, and 3 permutations are recorded.",
          why: "At the root nothing is used, so index 1 equals index 0 and its twin is unused: skipped. Index 0 and index 2 start the branches that give <code>[1, 1, 2]</code>, <code>[1, 2, 1]</code> and <code>[2, 1, 1]</code>.",
        },
        {
          id: "b",
          text: "It skips index 0, and 3 permutations are recorded.",
          why: "Index 0 has no earlier index to compare with, since <code>i &gt; 0</code> is false, so it is never skipped. The twin skipped at the root is the later one.",
        },
        {
          id: "c",
          text: "It skips nothing, and 6 permutations are recorded.",
          why: "Skipping nothing is what the plain permutation code does and it records 6 lists with repeats. This rule skips the second 1 at the root, and again inside the branch that starts with 2.",
        },
        {
          id: "d",
          text: "It skips index 1, and 6 permutations are recorded.",
          why: "Skipping index 1 at the root is right, but the count is not 6. Inside the branch that starts with 2 the same rule skips the second 1 as well, so only 3 permutations are recorded.",
        },
      ],
      answer: "a",
    },
    {
      id: "bt-parens-close-limit",
      chapter: "dsa-backtracking",
      level: "intermediate",
      skill: "edge-case",
      pattern: "backtracking",
      section: "generate-parentheses-prune-on-counts-not-at-the-leaf",
      kind: "single",
      prompt:
        "<p>In <code>generateParenthesis</code> a developer changes the closing branch from <code>if (close &lt; open)</code> to <code>if (close &lt; n)</code>. The opening branch is still <code>if (open &lt; n)</code>. What does <code>generateParenthesis(2)</code> return?</p>",
      choices: [
        {
          id: "a",
          text: '<code>["(())", "()()"]</code>, unchanged, because both conditions limit the length.',
          why: "The length check at the leaf is the same, but the closing rule is what keeps every prefix balanced. Without it a closing parenthesis can be placed with nothing open.",
        },
        {
          id: "b",
          text: 'Six strings, among them <code>"())("</code> and <code>")(()"</code> that are not well formed.',
          why: "Any string with two opening and two closing parentheses can now be built, which is C(4, 2) = 6 arrangements. Only 2 of them never close more than they have opened.",
        },
        {
          id: "c",
          text: "An empty array, because the closing branch is now blocked at the start.",
          why: "The closing branch is now allowed at the very start, since <code>close &lt; 2</code> is true when nothing has been placed. So the search finds many strings.",
        },
        {
          id: "d",
          text: "A <code>RangeError</code>, because the recursion no longer ends.",
          why: "Every call places one character and the leaf test stops at length 4, so the recursion always ends. The bug is in the strings it returns, not in whether it returns.",
        },
      ],
      answer: "b",
    },
    {
      id: "bt-parens-time",
      chapter: "dsa-backtracking",
      level: "intermediate",
      skill: "complexity",
      pattern: "backtracking",
      section: "generate-parentheses-prune-on-counts-not-at-the-leaf",
      kind: "single",
      prompt:
        "<p>For the correct <code>generateParenthesis(n)</code>, with opens limited by <code>n</code> and closes limited by the number of opens, what is the tightest worst-case time? Cₙ stands for the n-th Catalan number, the number of well-formed strings.</p>",
      choices: [
        {
          id: "a",
          text: "O(n · Cₙ), because no node is a dead end and each result is joined in O(n).",
          why: "Whenever the path is shorter than 2n at least one branch is allowed, so there are no dead ends. The nodes number at most 2n + 1 per result, and the join at the leaf costs O(n).",
        },
        {
          id: "b",
          text: "O(2²ⁿ), because there are two choices at each of the 2n positions.",
          why: "This is an upper bound but not a tight one. It counts the strings that the two conditions stop the search from ever building, and the tree here is smaller than that by a polynomial factor.",
        },
        {
          id: "c",
          text: "O(Cₙ), because each valid string is produced exactly once and nothing else is built.",
          why: "Each string is produced once, but joining it into a string costs O(n). The time is therefore a factor n above the number of strings, not equal to it.",
        },
        {
          id: "d",
          text: "O(n!), because every position could be any of the remaining characters.",
          why: "The characters are not distinct and nothing is removed from a pool. Each node has at most two children, so the tree has at most 2²ⁿ leaves.",
        },
      ],
      answer: "a",
    },
    {
      id: "bt-palindrome-cuts",
      chapter: "dsa-backtracking",
      level: "intermediate",
      skill: "complexity",
      pattern: "backtracking",
      section: "cut-point-backtracking-splitting-a-string-into-valid-pieces",
      kind: "single",
      prompt:
        '<p>How many lists does <code>partition("aaaaaaaa")</code>, eight letters a, return? A piece is accepted when it is a palindrome, and every substring of this string is one.</p>',
      choices: [
        {
          id: "a",
          text: "256, which is 2 to the power 8.",
          why: "There are 8 characters, but cuts can only go in the 7 gaps between them. Each gap is cut or not, so the count is a power of 2 with exponent 7.",
        },
        {
          id: "b",
          text: "36, the number of substrings.",
          why: "Eight characters have 8 · 9 / 2 = 36 substrings, and that counts pieces. A partition is a list of pieces that together cover the string, and there are many more of them than there are pieces.",
        },
        {
          id: "c",
          text: "128, which is 2 to the power 7.",
          why: "With every cut allowed, each of the 7 gaps between the 8 letters is either cut or kept, and every choice gives a different partition.",
        },
        {
          id: "d",
          text: "8, one for each possible length of the first piece.",
          why: "The length of the first piece does fix the first choice, but each of those choices is followed by more choices on the rest of the string, so the count multiplies up.",
        },
      ],
      answer: "c",
    },
    {
      id: "bt-ip-leading-zero",
      chapter: "dsa-backtracking",
      level: "intermediate",
      skill: "edge-case",
      pattern: "backtracking",
      section: "cut-point-backtracking-splitting-a-string-into-valid-pieces",
      kind: "single",
      prompt:
        '<p>How many valid addresses does <code>restoreIpAddresses("010010")</code> return? A part is valid if it is 0 to 255 and has no leading zero, so <code>"0"</code> is allowed and <code>"01"</code> is not.</p>',
      choices: [
        {
          id: "a",
          text: "None, because the string begins with a zero.",
          why: 'A part may be exactly <code>"0"</code>. Starting with a zero only rules out parts such as <code>"01"</code> and <code>"010"</code>, not the single digit.',
        },
        {
          id: "b",
          text: "Two: <code>0.10.0.10</code> and <code>0.100.1.0</code>.",
          why: "Each zero that starts a part must be that part's only digit. Of the ways to place three dots, only these two give four parts in range and with no leading zero.",
        },
        {
          id: "c",
          text: "Five, including <code>01.0.01.0</code> and <code>0.1.001.0</code>.",
          why: 'Those addresses contain parts such as <code>"01"</code> and <code>"001"</code>, which have a leading zero and are rejected.',
        },
        {
          id: "d",
          text: "Ten, one for every way to put three dots in the five gaps.",
          why: 'Ten is the number of ways to place the dots, not the number of valid addresses. Most placements create a part with a leading zero, such as <code>"01"</code> or <code>"010"</code>.',
        },
      ],
      answer: "b",
    },
    {
      id: "bt-split-recognise",
      chapter: "dsa-backtracking",
      level: "intermediate",
      skill: "recognise",
      pattern: "backtracking",
      section: "recognizing-it-in-an-unseen-problem",
      kind: "single",
      prompt:
        "<p>A string of digits must be cut into pieces so that every piece satisfies a rule (a range, no leading zero, a fixed number of pieces). You must list every possible way to cut it. What is the best way to think about it?</p>",
      choices: [
        {
          id: "a",
          text: "Backtracking over cut points: try each end for the next piece, and do not enter a piece that breaks the rule.",
          why: "Each root-to-leaf path is one way to cut the string, and testing the piece before recursing prunes the branches that could never complete.",
        },
        {
          id: "b",
          text: "A greedy scan that always takes the longest piece that satisfies the rule, then moves on to the rest.",
          why: "Taking the longest piece can use up digits that a later piece needs, and it returns one way to cut, not all of them.",
        },
        {
          id: "c",
          text: "Dynamic programming over prefixes, which stores the list of cuts for each prefix, then reads them off.",
          why: "A table over prefixes counts ways or tests whether one exists in polynomial time. The number of ways can itself be exponential, so any method that lists them all takes at least that long, and backtracking is the natural form.",
        },
        {
          id: "d",
          text: "Sort the digits, then use two pointers to find the pieces.",
          why: "Sorting destroys the order of the digits, and the pieces have to be consecutive digits of the original string.",
        },
      ],
      answer: "a",
    },
  ],
  pattern: {
    pattern: "backtracking",
    chapter: "dsa-backtracking",
    signals: [
      "The prompt asks for every combination, permutation, subset, arrangement or path, not just one.",
      "The answer is built one choice at a time, and a partial answer can be judged already invalid.",
      "A brute force would build every complete candidate and check it afterwards.",
      "The prompt asks whether a path or placement exists on a grid or board, where cells cannot be reused.",
      "Whether a choice may be repeated decides if the next call starts at the same index or the one after.",
    ],
    template:
      "<pre><code>function backtrack(path, choices) {\n  if (isComplete(path)) {\n    results.push([...path]);\n    return;\n  }\n  for (const choice of choices) {\n    if (!isValid(path, choice)) continue;\n    path.push(choice);\n    backtrack(path, nextChoices(choice));\n    path.pop();\n  }\n}</code></pre>",
    time: "Exponential in n: O(n · 2ⁿ) for subsets, O(n · n!) for permutations",
    space: "O(n) beyond the output, for the path and the recursion",
    styles: ["online-assessment", "phone-screen", "onsite"],
  },
};
