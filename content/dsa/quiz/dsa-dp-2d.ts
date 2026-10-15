import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "dp2-edit-state",
      chapter: "dsa-dp-2d",
      level: "intermediate",
      skill: "recognise",
      pattern: "dp-2d",
      section: "edit-distance-arguably-the-single-most-asked-2d-dp-question",
      placement: true,
      kind: "single",
      prompt:
        "<p>You must find the fewest single-character insertions, deletions and replacements that turn a string <code>s</code> into a string <code>t</code>. Which table definition lets each entry be worked out from smaller ones?</p>",
      choices: [
        {
          id: "a",
          text: "<code>dp[i]</code> is the fewest operations to turn the first <code>i</code> characters of <code>s</code> into all of <code>t</code>.",
          why: "This does not say how much of <code>t</code> has been built so far, so <code>dp[i]</code> cannot be worked out from <code>dp[i - 1]</code> alone. Both strings need an index.",
        },
        {
          id: "b",
          text: "<code>dp[i]</code> is how many positions <code>k &lt; i</code> have <code>s[k] !== t[k]</code>, counted from the left.",
          why: 'Counting mismatches position by position only fits replacements. For <code>s = "abc"</code> and <code>t = "bc"</code> the first two aligned positions both differ, so the count is at least 2, but deleting the <code>a</code> takes 1 operation.',
        },
        {
          id: "c",
          text: "<code>dp[i][j]</code> is the fewest operations to turn the first <code>i</code> characters of <code>s</code> into the first <code>j</code> of <code>t</code>.",
          why: "With a prefix of each string, the last characters either match or need one of three fixes, and each fix leaves a smaller pair of prefixes: <code>(i - 1, j)</code>, <code>(i, j - 1)</code> or <code>(i - 1, j - 1)</code>. The answer is <code>dp[s.length][t.length]</code>.",
        },
        {
          id: "d",
          text: "Walk both strings with two pointers, and replace a character whenever the two characters differ.",
          why: 'This commits to a replacement every time, so it cannot discover that a deletion or insertion is cheaper. For <code>"abc"</code> and <code>"bc"</code> it replaces twice and then deletes, which is 3 operations, where one deletion would do.',
        },
      ],
      answer: "c",
    },
    {
      id: "dp2-knapsack-approach",
      chapter: "dsa-dp-2d",
      level: "intermediate",
      skill: "recognise",
      pattern: "dp-2d",
      section: "the-0-1-knapsack-shape-item-index-vs-remaining-capacity",
      placement: true,
      kind: "single",
      prompt:
        "<p>Each item has a weight and a value and may be taken at most once. The bag holds weight 8. The items are weights <code>[5, 4, 4]</code> with values <code>[10, 7, 7]</code>, and in general there can be hundreds of items. Which approach finds the largest total value?</p>",
      choices: [
        {
          id: "a",
          text: "Fill <code>dp[i][w]</code>, the best value from the first <code>i</code> items with room <code>w</code>, by skipping item <code>i</code> or taking it when it fits.",
          why: "The two indexes record both which items have been considered and how much room is left, which is exactly what each decision depends on. The table has about <code>n · capacity</code> cells and gives 14 here, from the two items of weight 4.",
        },
        {
          id: "b",
          text: "Sort the items by value per weight and keep taking items from the top while they still fit.",
          why: "The first item has the best ratio, so it is taken, and then neither remaining item fits beside it. That gives 10, while the two items of weight 4 together give 14.",
        },
        {
          id: "c",
          text: "Let <code>dp[i]</code> be the best value from the first <code>i</code> items in the bag of 8, and build it from <code>dp[i - 1]</code> by adding item <code>i</code> whenever it still fits.",
          why: "A single number per prefix does not say how much room it uses, and it cannot swap an earlier item out. Here <code>dp[1]</code> is 10 from the item of weight 5, neither later item fits beside it, and the rule ends at 10 instead of 14. The remaining room must be part of the state.",
        },
        {
          id: "d",
          text: "Try every subset of items with backtracking and keep the best one that fits the weight limit.",
          why: "It is correct, but there are 2ⁿ subsets, which is far too many for hundreds of items. The table touches only <code>n · capacity</code> states.",
        },
      ],
      answer: "a",
    },
    {
      id: "dp2-grid-with-blocks",
      chapter: "dsa-dp-2d",
      level: "intermediate",
      skill: "recognise",
      pattern: "dp-2d",
      section: "grid-paths-the-most-visual-entry-point",
      kind: "single",
      prompt:
        "<p>A 20 by 20 grid has some blocked cells. Moving only right or down, count the routes from the top-left cell to the bottom-right cell, or 0 if there is none. Which approach fits best?</p>",
      choices: [
        {
          id: "a",
          text: "Backtrack through every route and add one for each route that reaches the bottom-right corner.",
          why: "It is correct but it visits every route one at a time. A 20 by 20 grid with no blocked cells already has 35,345,263,800 routes.",
        },
        {
          id: "b",
          text: "Fill a table where each cell sums the routes from the cell above and from the left, with 0 for blocked cells.",
          why: "Every route into a cell arrives from above or from the left, so the counts add. Each of the 400 cells is computed once, and a blocked cell contributes nothing to its neighbours.",
        },
        {
          id: "c",
          text: "Go right whenever the next cell is free, otherwise go down, and report the single route found.",
          why: "This follows one route, and it can even get stuck, so it neither counts the routes nor reliably finds one.",
        },
      ],
      answer: "b",
    },
    {
      id: "dp2-trace-lcs-row",
      chapter: "dsa-dp-2d",
      level: "intermediate",
      skill: "trace",
      pattern: "dp-2d",
      section: "comparing-two-strings-the-other-common-shape",
      kind: "single",
      prompt:
        '<p>The loops of <code>longestCommonSubsequence</code> run with <code>a = "BCBA"</code> and <code>b = "CABA"</code>. What is the last row of <code>dp</code>, <code>dp[4][0]</code> to <code>dp[4][4]</code>?</p><pre><code>const dp = Array.from({ length: a.length + 1 }, () =&gt; new Array(b.length + 1).fill(0));\nfor (let i = 1; i &lt;= a.length; i++) {\n  for (let j = 1; j &lt;= b.length; j++) {\n    if (a[i - 1] === b[j - 1]) {\n      dp[i][j] = dp[i - 1][j - 1] + 1;\n    } else {\n      dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);\n    }\n  }\n}</code></pre>',
      choices: [
        {
          id: "a",
          text: "<code>0, 0, 1, 0, 2</code>",
          why: "That is what you get if a mismatch resets the cell to 0, which finds the longest common contiguous piece. A subsequence may skip characters, so a mismatch keeps the better of the cell above and the cell to the left.",
        },
        {
          id: "b",
          text: "<code>0, 1, 2, 1, 2</code>",
          why: "This takes only the cell above on a mismatch. The cell to the left can be larger. A row of this table never decreases from left to right, and this one drops from 2 to 1.",
        },
        {
          id: "c",
          text: "<code>0, 0, 1, 1, 2</code>",
          why: "On a mismatch this copies the diagonal cell. That ignores the longer answers sitting above or to the left, so the counts come out too small.",
        },
        {
          id: "d",
          text: "<code>0, 1, 2, 2, 3</code>",
          why: "The last row compares all of <code>BCBA</code> with longer and longer prefixes of <code>CABA</code>. The counts reach 1 after <code>C</code>, 2 after <code>CA</code>, stay at 2 after <code>CAB</code>, and reach 3 after <code>CABA</code>, matching the common subsequence <code>CBA</code>.",
        },
      ],
      answer: "d",
    },
    {
      id: "dp2-trace-edit-distance",
      chapter: "dsa-dp-2d",
      level: "intermediate",
      skill: "trace",
      pattern: "dp-2d",
      section: "edit-distance-arguably-the-single-most-asked-2d-dp-question",
      kind: "single",
      prompt:
        '<p>What does <code>minDistance("bread", "bear")</code> return?</p><pre><code>function minDistance(a, b) {\n  const dp = Array.from({ length: a.length + 1 }, () =&gt; new Array(b.length + 1).fill(0));\n  for (let i = 0; i &lt;= a.length; i++) dp[i][0] = i;\n  for (let j = 0; j &lt;= b.length; j++) dp[0][j] = j;\n  for (let i = 1; i &lt;= a.length; i++) {\n    for (let j = 1; j &lt;= b.length; j++) {\n      if (a[i - 1] === b[j - 1]) {\n        dp[i][j] = dp[i - 1][j - 1];\n      } else {\n        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);\n      }\n    }\n  }\n  return dp[a.length][b.length];\n}</code></pre>',
      choices: [
        {
          id: "a",
          text: "1",
          why: "No single operation turns <code>bread</code> into <code>bear</code>. Deleting any one letter of <code>bread</code> gives <code>read</code>, <code>bead</code>, <code>brad</code>, <code>bred</code> or <code>brea</code>, and none of those is <code>bear</code>.",
        },
        {
          id: "b",
          text: "2",
          why: "Deleting the <code>r</code> turns <code>bread</code> into <code>bead</code>, and replacing the <code>d</code> with an <code>r</code> gives <code>bear</code>. The table's last cell, <code>dp[5][4]</code>, holds 2.",
        },
        {
          id: "c",
          text: "3",
          why: "3 is the cost if only insertions and deletions were allowed, such as deleting the <code>r</code> and the <code>d</code> and then adding an <code>r</code>. A replacement does the same job as a paired delete and insert, in one step.",
        },
        {
          id: "d",
          text: "4",
          why: "4 counts the three letters <code>r</code>, <code>e</code>, <code>a</code> that differ from <code>e</code>, <code>a</code>, <code>r</code> when the words are lined up from the left, plus the extra <code>d</code>. Shifting the alignment with a deletion needs fewer operations.",
        },
      ],
      answer: "b",
    },
    {
      id: "dp2-knapsack-upward",
      chapter: "dsa-dp-2d",
      level: "intermediate",
      skill: "edge-case",
      pattern: "dp-2d",
      section: "space-optimization-do-you-really-need-the-whole-grid",
      kind: "single",
      prompt:
        "<p>A one-row version of 0/1 knapsack loops over the capacity upward instead of downward. What does <code>knapsack([2], [3], 5)</code> return, for one item of weight 2 and value 3 in a bag of capacity 5?</p><pre><code>function knapsack(weights, values, capacity) {\n  const dp = new Array(capacity + 1).fill(0);\n  for (let i = 0; i &lt; weights.length; i++) {\n    for (let w = weights[i]; w &lt;= capacity; w++) {\n      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);\n    }\n  }\n  return dp[capacity];\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>3</code>, because the single item is taken once.",
          why: "3 is the right answer for 0/1 knapsack, and it is what a downward loop returns. Going upward, <code>dp[w - weights[i]]</code> has already been updated in the same pass, so the item is counted again.",
        },
        {
          id: "b",
          text: "<code>9</code>, because three copies of the item are taken.",
          why: "Three copies weigh 6, which does not fit in a bag of 5. The loop only counts weight that fits.",
        },
        {
          id: "c",
          text: "<code>6</code>, because the item is taken twice, with total weight 4.",
          why: "When the loop reaches <code>w = 4</code>, <code>dp[2]</code> already holds 3 from this same item, so <code>dp[4]</code> becomes 6. The upward order turns the problem into one where an item can be reused, which is a different problem.",
        },
        {
          id: "d",
          text: "<code>0</code>, because <code>dp[0]</code> is the only entry that is set.",
          why: "Every entry from index 2 onward is updated by the inner loop, and <code>dp[5]</code> is read at the end. Only entries below the item's weight stay at 0.",
        },
      ],
      answer: "c",
    },
    {
      id: "dp2-empty-string-base",
      chapter: "dsa-dp-2d",
      level: "intermediate",
      skill: "edge-case",
      pattern: "dp-2d",
      section: "edit-distance-arguably-the-single-most-asked-2d-dp-question",
      kind: "single",
      prompt:
        '<p>Using the <code>minDistance</code> from the earlier question, what does <code>minDistance("", "abc")</code> return?</p>',
      choices: [
        {
          id: "a",
          text: "<code>0</code>, because the loops over <code>i</code> and <code>j</code> never run.",
          why: "The nested loops do not run for an empty <code>a</code>, but the base-case loops do. They set <code>dp[0][j] = j</code> before anything else, and the function returns an entry of that row.",
        },
        {
          id: "b",
          text: "<code>undefined</code>, because <code>a[0]</code> does not exist.",
          why: "The code never reads <code>a[0]</code> here, since the main loops do not run. The table has one row and four columns, so <code>dp[0][3]</code> exists.",
        },
        {
          id: "c",
          text: "<code>1</code>, because one replacement turns the empty string into text.",
          why: 'A replacement changes a character that exists, and an empty string has none. Each of the three characters of <code>"abc"</code> has to be inserted.',
        },
        {
          id: "d",
          text: '<code>3</code>, one insertion for each character of <code>"abc"</code>.',
          why: "The padded table has a row 0 for the empty prefix, and the loop sets <code>dp[0][j] = j</code>, meaning that j insertions build the first j characters. The answer is <code>dp[0][3]</code>, which is 3.",
        },
      ],
      answer: "d",
    },
    {
      id: "dp2-knapsack-time",
      chapter: "dsa-dp-2d",
      level: "intermediate",
      skill: "complexity",
      pattern: "dp-2d",
      section: "the-0-1-knapsack-shape-item-index-vs-remaining-capacity",
      kind: "single",
      prompt:
        "<p>The two-dimensional <code>knapsack</code> from the chapter runs on <code>n</code> items with a capacity of <code>W</code>. What is its tightest <em>time</em> bound?</p>",
      choices: [
        {
          id: "a",
          text: "O(n · W)",
          why: "The table has <code>n + 1</code> rows and <code>W + 1</code> columns, and each cell takes constant time from two earlier cells. Since W is a number, not the size of an input list, this is called pseudo-polynomial time.",
        },
        {
          id: "b",
          text: "O(n + W)",
          why: "That would be one pass over the items and one over the capacities. The loops are nested, so every item is combined with every capacity value.",
        },
        {
          id: "c",
          text: "O(n · log W)",
          why: "log W is the number of bits needed to write W, but the inner loop counts through every value from 0 to W, one at a time.",
        },
        {
          id: "d",
          text: "O(2ⁿ)",
          why: "That is the number of subsets that a plain search would look at. The table shares work between subsets, so its cost is not tied to 2ⁿ.",
        },
      ],
      answer: "a",
    },
    {
      id: "dp2-lcs-rolling-space",
      chapter: "dsa-dp-2d",
      level: "intermediate",
      skill: "complexity",
      pattern: "dp-2d",
      section: "space-optimization-do-you-really-need-the-whole-grid",
      kind: "single",
      prompt:
        "<p>For strings <code>a</code> of length <code>m</code> and <code>b</code> of length <code>n</code>, this version keeps only the previous row. What is the tightest bound on the extra <em>space</em> in use at once, apart from the two strings?</p><pre><code>function lcsLength(a, b) {\n  let prev = new Array(b.length + 1).fill(0);\n  for (let i = 1; i &lt;= a.length; i++) {\n    const curr = new Array(b.length + 1).fill(0);\n    for (let j = 1; j &lt;= b.length; j++) {\n      curr[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], curr[j - 1]);\n    }\n    prev = curr;\n  }\n  return prev[b.length];\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "O(m · n), because a row is allocated for every character of <code>a</code>.",
          why: "A new row is created on each pass, but once <code>prev</code> moves on the old row is no longer reachable, so at most two rows are in use at once. The full table would be O(m · n).",
        },
        {
          id: "b",
          text: "O(1), because only two variables are updated.",
          why: "The variables <code>prev</code> and <code>curr</code> each refer to an array of <code>n + 1</code> numbers, so the space grows with <code>n</code>.",
        },
        {
          id: "c",
          text: "O(n)",
          why: "Two arrays of <code>n + 1</code> numbers are in use at any moment, and everything else is a handful of variables. The length of <code>a</code> only sets how many rows are made one after another, not how many exist together.",
        },
        {
          id: "d",
          text: "O(min(m, n)), whichever string is shorter.",
          why: "That bound is reachable by putting the shorter string across the columns, but this code puts <code>b</code> there whatever its length. If <code>b</code> is the longer string, the rows are longer than the shorter length.",
        },
      ],
      answer: "c",
    },
    {
      id: "dp2-palindrome-fill-orders",
      chapter: "dsa-dp-2d",
      level: "intermediate",
      skill: "edge-case",
      pattern: "dp-2d",
      section: "palindrome-dp-a-different-kind-of-two-dimensional-state",
      kind: "multi",
      prompt:
        "<p>In the palindrome table, a cell <code>dp[i][j]</code> with <code>j &gt;= i + 2</code> reads <code>dp[i + 1][j - 1]</code>. The diagonal <code>dp[i][i]</code> is set first. Select every order of filling the cells above the diagonal in which that cell is always ready when it is read.</p>",
      choices: [
        {
          id: "a",
          text: "Rows from <code>i = 0</code> down to the last row, each row from left to right.",
          why: "Cell <code>dp[0][3]</code> needs <code>dp[1][2]</code>, which sits in a later row and is still unfilled when row 0 is processed.",
        },
        {
          id: "b",
          text: "Substrings in order of increasing length, as the chapter fills it.",
          why: "The cell it needs is the substring one character shorter at each end, which is two shorter in length, so it is always done earlier.",
        },
        {
          id: "c",
          text: "Rows from the last row up to <code>i = 0</code>, each row from left to right.",
          why: "The cell needed lies in row <code>i + 1</code>, and a bottom-up pass finishes that whole row before it reaches row <code>i</code>. This order works too, even though the chapter fills by length.",
        },
        {
          id: "d",
          text: "Columns from the last column down to <code>j = 0</code>, each column from top to bottom.",
          why: "The cell needed lies in column <code>j - 1</code>, and this order reaches column <code>j - 1</code> after column <code>j</code>, so it is not ready yet.",
        },
      ],
      answers: ["b", "c"],
    },
    {
      id: "dp2-order-edit-distance-steps",
      chapter: "dsa-dp-2d",
      level: "intermediate",
      skill: "trace",
      pattern: "dp-2d",
      section: "edit-distance-arguably-the-single-most-asked-2d-dp-question",
      kind: "order",
      prompt:
        "<p>Put the steps of <code>minDistance</code> in the order they run. Start with creating the table and end with returning the answer.</p>",
      items: [
        { id: "create", text: "Create the <code>(a.length + 1) × (b.length + 1)</code> table." },
        { id: "base", text: "Fill row 0 and column 0 with <code>dp[0][j] = j</code> and <code>dp[i][0] = i</code>." },
        { id: "loops", text: "Start the nested loops at <code>i = 1</code> and <code>j = 1</code>." },
        {
          id: "cell",
          text: "Set each cell from the match test, copying the diagonal or taking 1 plus the smallest of three neighbours.",
        },
        { id: "return", text: "Return <code>dp[a.length][b.length]</code>." },
      ],
      why: "The base row and column come before the loops because the first cell the loops compute already reads them. A cell is computed inside the loops, after they start, from cells that are already filled, and the answer is read from the bottom-right cell only once every cell is done.",
    },
    {
      id: "dp2-min-path-zero-edge",
      chapter: "dsa-dp-2d",
      level: "intermediate",
      skill: "edge-case",
      pattern: "dp-2d",
      section: "obstacles-and-costs-unique-paths-ii-and-minimum-path-sum",
      kind: "single",
      prompt:
        "<p>A teammate changes <code>minPathSum</code> so that a neighbour that is off the grid counts as <code>0</code> instead of <code>Infinity</code>, and leaves every other line alone. What does the changed function return for <code>[[5, 1]]</code>, a grid with one row and two cells?</p>",
      choices: [
        {
          id: "a",
          text: "<code>6</code>, the cost of the only route, 5 + 1.",
          why: "6 is what the original function returns, because the second cell can only be entered from the left. With <code>0</code> standing in for the missing cell above, the minimum picks that 0 and the 5 is lost.",
        },
        {
          id: "b",
          text: "<code>0</code>, because the missing neighbour is worth nothing and the minimum is taken from it.",
          why: "The 0 is used only as the cost of arriving from a cell that does not exist. The cell's own cost, 1, is still added to it, so the result is not 0.",
        },
        {
          id: "c",
          text: "<code>1</code>, because the minimum picks the missing cell above and drops the 5.",
          why: "For the second cell, <code>Math.min(0, 5)</code> is 0, so the cell becomes <code>1 + 0</code>. A neighbour that does not exist has to be <code>Infinity</code> so that the minimum can never choose it.",
        },
        {
          id: "d",
          text: "<code>5</code>, because the loop stops at the first cell.",
          why: "The loop visits both cells, and the answer is read from the last one. 5 is only the value of the start cell.",
        },
      ],
      answer: "c",
    },
    {
      id: "dp2-walk-back-lcs",
      chapter: "dsa-dp-2d",
      level: "intermediate",
      skill: "trace",
      pattern: "dp-2d",
      section: "getting-the-answer-back-out-not-only-its-length",
      kind: "single",
      prompt:
        '<p>Run <code>lcsString</code> on the two strings below. The table is filled first, and then the walk starts at the bottom-right cell. What does the call return?</p><pre><code>function lcsString(a, b) {\n  const dp = Array.from({ length: a.length + 1 }, () =&gt; new Array(b.length + 1).fill(0));\n  for (let i = 1; i &lt;= a.length; i++) {\n    for (let j = 1; j &lt;= b.length; j++) {\n      dp[i][j] = a[i - 1] === b[j - 1]\n        ? dp[i - 1][j - 1] + 1\n        : Math.max(dp[i - 1][j], dp[i][j - 1]);\n    }\n  }\n  const picked = [];\n  let i = a.length, j = b.length;\n  while (i &gt; 0 &amp;&amp; j &gt; 0) {\n    if (a[i - 1] === b[j - 1]) { picked.push(a[i - 1]); i--; j--; }\n    else if (dp[i - 1][j] &gt;= dp[i][j - 1]) i--;\n    else j--;\n  }\n  return picked.reverse().join("");\n}\n\nlcsString("XMJYAUZ", "MZJAWXU");</code></pre>',
      choices: [
        {
          id: "a",
          text: '<code>"MJAU"</code>',
          why: "The corner holds 4, and the walk picks U, then A, then J, then M, because those four are the matches it meets on the way back. Reversed, they read MJAU, which appears in order in both strings.",
        },
        {
          id: "b",
          text: '<code>"XJAU"</code>',
          why: 'This is a subsequence of the first string, but not of the second: in <code>"MZJAWXU"</code> the X comes after the J and the A, so the letters cannot appear in the order X, J, A, U.',
        },
        {
          id: "c",
          text: '<code>"MZJU"</code>',
          why: 'This is a subsequence of the second string, but not of the first: the only Z in <code>"XMJYAUZ"</code> is its last character, so no J or U can follow it.',
        },
        {
          id: "d",
          text: '<code>"MJAWU"</code>',
          why: "The first string has no W, so no common subsequence can contain one. The walk only collects characters that match in both strings.",
        },
      ],
      answer: "a",
    },
    {
      id: "dp2-substring-recognise",
      chapter: "dsa-dp-2d",
      level: "intermediate",
      skill: "recognise",
      pattern: "dp-2d",
      section: "longest-common-substring-the-table-that-resets-to-zero",
      placement: true,
      kind: "single",
      prompt:
        "<p>Given two strings, you must find the length of the longest block of <em>consecutive</em> characters that appears in both. Which table definition and answer fit?</p>",
      choices: [
        {
          id: "a",
          text: "The best length of a common subsequence of the first <code>i</code> and <code>j</code> characters, taking the larger neighbour on a mismatch, with the answer in the bottom-right corner.",
          why: 'That table allows skipped characters. For <code>"ABXC"</code> and <code>"ABYC"</code> it gives 3, from the subsequence ABC, while the longest shared block is only 2.',
        },
        {
          id: "b",
          text: "The number of insertions, deletions and replacements needed to turn the first <code>i</code> characters into the first <code>j</code>, read from the corner.",
          why: "That counts operations between two prefixes, not the length of a shared block. Two strings can need many edits and still share a long block.",
        },
        {
          id: "c",
          text: "The length of the common run that ends exactly at the two current characters, 0 on a mismatch, with the answer as the largest value anywhere.",
          why: "A match extends the run that ended at the previous pair, and a mismatch breaks it, so the cell is 0. Because a run can end anywhere, the best one is found as the largest cell, tracked while filling.",
        },
        {
          id: "d",
          text: "The same run-length cell, with 0 on a mismatch, but with the answer read from the bottom-right corner.",
          why: 'The corner only holds a run that ends at the last character of both strings. For <code>"abcde"</code> and <code>"zbcdf"</code> it is 0, although the shared block <code>"bcd"</code> has length 3.',
        },
      ],
      answer: "c",
    },
    {
      id: "dp2-target-sum-reduction",
      chapter: "dsa-dp-2d",
      level: "intermediate",
      skill: "recognise",
      pattern: "dp-2d",
      section: "counting-instead-of-optimizing-distinct-subsequences-interle",
      placement: true,
      kind: "single",
      prompt:
        "<p>You are given a list of numbers and a target. You must put a plus or a minus in front of every number so that the signed total equals the target, and you must count how many sign patterns work. Which reduction turns this into a table you know?</p>",
      choices: [
        {
          id: "a",
          text: "Count the subsets whose sum is <code>(total + target) / 2</code>, and answer 0 if that is not a whole number.",
          why: "The plus group P and the minus group N satisfy <code>sum(P) - sum(N) = target</code> and <code>sum(P) + sum(N) = total</code>, so <code>sum(P) = (total + target) / 2</code>. Each subset with that sum is exactly one sign pattern.",
        },
        {
          id: "b",
          text: "Count the subsets whose sum equals the target itself, since those are the numbers that get a plus.",
          why: "For five ones and a target of 3 this counts 10 subsets, any three of the five, but the number of sign patterns is 5. The minus group also has to be accounted for, which is why the goal is not the target.",
        },
        {
          id: "c",
          text: "Find the subset with the largest sum that does not go over the target, then compare it with the target.",
          why: "That is an optimisation that returns a sum, not a count of ways, and it ignores the numbers that receive a minus sign.",
        },
        {
          id: "d",
          text: "Sort the numbers and assign signs from the largest down, always moving the running total toward the target.",
          why: "A greedy pass finds at most one sign pattern, while the question asks for the number of patterns. For five ones and a target of 3 there are 5 patterns, and the pass would report one of them.",
        },
      ],
      answer: "a",
    },
    {
      id: "dp2-square-neighbours",
      chapter: "dsa-dp-2d",
      level: "intermediate",
      skill: "trace",
      pattern: "dp-2d",
      section: "maximal-square-three-neighbours-and-a-minimum",
      kind: "single",
      prompt:
        '<p>In the Maximal Square table, the current cell holds <code>"1"</code>. The table already holds 2 for the cell above, 3 for the cell to the left, and 2 for the cell up and to the left. What value does the recurrence store for the current cell?</p>',
      choices: [
        {
          id: "a",
          text: "<code>4</code>, one more than the largest of the three.",
          why: "A square of side 4 ending here would need a square of side 3 ending at the cell above, but that cell only holds 2. The smallest neighbour limits the square, not the largest.",
        },
        {
          id: "b",
          text: "<code>8</code>, one more than the sum of the three.",
          why: "A side length cannot be built by adding the neighbours: their squares overlap, so their cells would be counted several times. The recurrence takes a minimum, not a sum.",
        },
        {
          id: "c",
          text: "<code>2</code>, the smallest of the three.",
          why: "The cell holds a 1 of its own, and that adds one to the side. The smallest neighbour says how large the squares around it are, and the new square is one larger.",
        },
        {
          id: "d",
          text: "<code>3</code>, one more than the smallest of the three.",
          why: "The recurrence is <code>1 + Math.min(2, 3, 2)</code>, which is 3. The minimum is the neighbour that limits how far the square can reach.",
        },
      ],
      answer: "d",
    },
    {
      id: "dp2-envelope-ties",
      chapter: "dsa-dp-2d",
      level: "intermediate",
      skill: "edge-case",
      pattern: "dp-2d",
      section: "russian-doll-envelopes-when-sorting-removes-a-dimension",
      kind: "single",
      prompt:
        "<p>A teammate changes the sort in <code>maxEnvelopes</code> to <code>(a, b) =&gt; a[0] - b[0] || a[1] - b[1]</code>, so ties in width are broken by height ascending, and leaves the rest alone. What does the changed function return for <code>[[3, 3], [3, 5], [4, 6]]</code>?</p>",
      choices: [
        {
          id: "a",
          text: "<code>2</code>",
          why: "2 is the right answer, and it is what the original sort returns. The two width-3 envelopes cannot be in the same chain, so the best chains are 2 long, such as <code>[3, 3]</code> then <code>[4, 6]</code>.",
        },
        {
          id: "b",
          text: "<code>3</code>",
          why: "The sorted order is <code>[3, 3], [3, 5], [4, 6]</code>, whose heights 3, 5, 6 increase, so the tails array grows to length 3. The chain wrongly includes two envelopes of the same width.",
        },
        {
          id: "c",
          text: "<code>1</code>",
          why: "Some envelope does fit in another: <code>[3, 3]</code> is strictly smaller than <code>[4, 6]</code> in both width and height, so a chain of at least 2 exists.",
        },
        {
          id: "d",
          text: "<code>4</code>",
          why: "The input holds only three envelopes, and a chain cannot be longer than the number of envelopes.",
        },
      ],
      answer: "b",
    },
    {
      id: "dp2-target-sum-cost",
      chapter: "dsa-dp-2d",
      level: "intermediate",
      skill: "complexity",
      pattern: "dp-2d",
      section: "counting-instead-of-optimizing-distinct-subsequences-interle",
      kind: "single",
      prompt:
        "<p>The Target Sum table has <code>n + 1</code> rows and <code>goal + 1</code> columns, where <code>goal = (total + target) / 2</code>, and each cell costs O(1). One test has 40 numbers, each up to 100000. Which statement about the running time is right?</p>",
      choices: [
        {
          id: "a",
          text: "It is O(2<sup>n</sup>), because each number has two possible signs and the table has to look at all of the patterns.",
          why: "The table shares work between patterns, so it never lists them. The number of cells is rows times columns, which has nothing to do with 2<sup>n</sup>.",
        },
        {
          id: "b",
          text: "It is O(n²), because the table is as wide as it is tall.",
          why: "The width is <code>goal + 1</code>, which depends on the values of the numbers, not on how many there are. The table is only square by coincidence.",
        },
        {
          id: "c",
          text: "It is O(n log n), because the numbers are only added up once.",
          why: "The sum is only used to find the goal. After that, every one of the n rows is filled across the whole width of the table.",
        },
        {
          id: "d",
          text: "It is O(n × goal), which grows with the size of the numbers as well as their count.",
          why: "Each of the n rows has goal + 1 cells. The cost is pseudo-polynomial: it is small when the numbers are small, and with values near 100000 the goal can reach the millions.",
        },
      ],
      answer: "d",
    },
    {
      id: "dp2-memo-sentinel",
      chapter: "dsa-dp-2d",
      level: "intermediate",
      skill: "edge-case",
      pattern: "dp-2d",
      section: "the-same-table-filled-on-demand-a-top-down-template",
      kind: "single",
      prompt:
        '<p>A teammate fills the memo of <code>lcsTopDown</code> with <code>0</code> instead of <code>undefined</code>, and changes the cache check to <code>if (memo[i][j]) return memo[i][j];</code>. What happens when the two strings share no character, such as 16 copies of <code>"a"</code> against 16 copies of <code>"b"</code>?</p>',
      choices: [
        {
          id: "a",
          text: "It returns 0 quickly, because every result is stored the first time it is computed and then reused.",
          why: "The result is stored, but a stored 0 is falsy, so the check treats it as missing. For these strings every answer is 0, so no state is ever recognised as cached.",
        },
        {
          id: "b",
          text: "It returns 0, but a state whose answer is 0 is never found in the cache, so the calls grow exponentially.",
          why: "Every state in this input has the answer 0, so every state is recomputed on each visit. The answer is still right, but the calls multiply: the correct check, with <code>undefined</code>, makes about 500 calls for 16 characters, where this version needs over a billion.",
        },
        {
          id: "c",
          text: "It returns a wrong answer, because a stored 0 is mistaken for a real length.",
          why: "Nothing wrong is ever returned. A 0 that is treated as missing is simply computed again, and it comes out as 0 again.",
        },
        {
          id: "d",
          text: "It throws a <code>TypeError</code>, because reading an entry of the memo is not allowed before it is set.",
          why: "Every entry holds the number 0 from the start, so a read is always allowed. The problem is the truthiness test, not the access.",
        },
      ],
      answer: "b",
    },
  ],
  pattern: {
    pattern: "dp-2d",
    chapter: "dsa-dp-2d",
    signals: [
      "Two strings or two arrays are compared, merged or transformed into each other.",
      "The prompt counts routes or finds a best route across a grid, moving only in fixed directions.",
      "Items are taken or skipped under a budget or a capacity, with each item used at most once.",
      "A substring or subsequence property depends on both its start and its end.",
      "A one-dimensional state is missing a second quantity, such as the amount left or the position in the other string.",
    ],
    template:
      "<pre><code>const dp = Array.from({ length: m + 1 }, () =&gt; new Array(n + 1).fill(0));\nfor (let i = 1; i &lt;= m; i++) {\n  for (let j = 1; j &lt;= n; j++) {\n    dp[i][j] = combine(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);\n  }\n}\nreturn dp[m][n];</code></pre>",
    time: "O(m · n) for a table of m rows and n columns",
    space: "O(m · n), or O(n) when each row depends only on the one before",
    styles: ["online-assessment", "phone-screen", "onsite"],
  },
};
