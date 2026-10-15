import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "ab-trie-for-many-words",
      chapter: "dsa-advanced-backtracking",
      level: "advanced",
      skill: "recognise",
      pattern: "backtracking",
      section: "word-search-ii-a-trie-prunes-the-whole-dictionary-at-once",
      placement: true,
      kind: "single",
      prompt:
        "<p>A board of letters must be searched for any of 5,000 dictionary words. A word is read along a path of adjacent cells that never uses a cell twice. Running the single-word search once per word is too slow. Which change removes the repeated work?</p>",
      choices: [
        {
          id: "a",
          text: "Keep the visited cells in a bitmask, so that checking whether a cell is used takes a single operation.",
          why: "That makes each step a little cheaper, but the board is still walked once for every word. The repeated walking is the cost to remove, not the price of one step.",
        },
        {
          id: "b",
          text: "Put all the words in a trie and walk the board once, carrying the trie node, so a path stops when no word continues.",
          why: "Words that share a prefix share the walk, and a path dies as soon as no word in the whole dictionary continues with its letters. The factor for the number of words disappears from the cost.",
        },
        {
          id: "c",
          text: "Cache the best result found for each cell, so a cell that is reached again does not have to be explored again.",
          why: "Whether a path can finish a word depends on the cells it has already used and on the letters so far, not on the cell alone. A cell-only cache can hand back a result that belongs to a different path.",
        },
        {
          id: "d",
          text: "Sort the words alphabetically and stop the search as soon as one word turns out to be missing from the board.",
          why: "A word that is missing says nothing about the words after it in the list. Stopping there would drop words that really are on the board.",
        },
      ],
      answer: "b",
    },
    {
      id: "ab-bound-safe",
      chapter: "dsa-advanced-backtracking",
      level: "advanced",
      skill: "recognise",
      pattern: "backtracking",
      section: "branch-and-bound-pruning-with-a-number-not-just-a-rule",
      placement: true,
      kind: "single",
      prompt:
        "<p>A search for the best 0/1 knapsack choice over 40 items decides item by item whether to take it. <code>best</code> holds the highest total value found so far. Which test makes it safe to abandon the current branch early?</p>",
      choices: [
        {
          id: "a",
          text: "The value taken so far is smaller than <code>best</code>.",
          why: "Items are still to come, and each adds value. A branch that is behind now can finish ahead, so abandoning it for this reason can throw the best answer away.",
        },
        {
          id: "b",
          text: "The value taken so far plus the value of the next item is smaller than <code>best</code>.",
          why: "The items after the next one can still be added. Only a figure that covers everything the branch can still gain can justify stopping.",
        },
        {
          id: "c",
          text: "The bound of this branch is lower than the bound of its sibling branch.",
          why: "Comparing siblings can decide which one to explore first, but it cannot justify skipping one: the lower branch may still hold an answer better than <code>best</code>. A branch is safe to drop only when it cannot beat <code>best</code>.",
        },
        {
          id: "d",
          text: "The value so far plus an optimistic estimate of the rest is no more than <code>best</code>.",
          why: "No completion of the branch can then beat the best answer found, so nothing is lost by stopping. The estimate must never be lower than what the branch can really reach, or it could cut the optimum.",
        },
      ],
      answer: "d",
    },
    {
      id: "ab-most-constrained-first",
      chapter: "dsa-advanced-backtracking",
      level: "advanced",
      skill: "recognise",
      pattern: "backtracking",
      section: "sudoku-bitmasks-plus-constraint-propagation",
      placement: true,
      kind: "single",
      prompt:
        "<p>A Sudoku solver fills the empty cells from left to right, trying the digits 1 to 9 in each, and takes minutes on a hard board. Which change cuts the most search nodes?</p>",
      choices: [
        {
          id: "a",
          text: "Store each row, column and box as a 9-bit mask instead of an array of digits.",
          why: "This makes the work at each node cheaper, but the same cells are tried in the same order, so the tree has the same nodes. It speeds up the constant, not the number of nodes.",
        },
        {
          id: "b",
          text: "Try the digits from 9 down to 1 instead of from 1 up to 9.",
          why: "On a given board that may find the solution sooner or later, but it does not aim at dead branches. What decides how early a dead end is noticed is which cell is filled next.",
        },
        {
          id: "c",
          text: "Branch on the empty cell with the fewest legal digits, and give up at once if some cell has none.",
          why: "A cell with one candidate is a forced move, and a cell with none shows that the branch is already dead, before any guess is spent. This most-constrained-variable rule cuts whole subtrees.",
        },
        {
          id: "d",
          text: "Remember every board seen after a placement, so that a repeated board is never searched again.",
          why: "When the cells are filled in a fixed order, each partial board comes from exactly one sequence of choices, so the memo would never find a repeat while it stores a great many boards.",
        },
      ],
      answer: "c",
    },
    {
      id: "ab-same-tree",
      chapter: "dsa-advanced-backtracking",
      level: "advanced",
      skill: "complexity",
      pattern: "backtracking",
      section: "complexity-at-this-level-say-the-honest-thing",
      kind: "single",
      prompt:
        "<p>An N-Queens solver that tracks columns and diagonals in three <code>Set</code>s is rewritten with bitmasks, as the chapter shows. It still returns every solution. Which statement about its <em>worst-case time</em> is correct?</p>",
      choices: [
        {
          id: "a",
          text: "It visits the same placements as before, so the number of nodes is unchanged; only the work per node shrinks.",
          why: "The masks hold exactly the information the sets held, so the search tree is identical. What changes is the cost of each node: one expression finds all the safe columns, and the loop visits only those.",
        },
        {
          id: "b",
          text: "The number of nodes drops from about n! to 2<sup>n</sup>, because a mask can take only 2<sup>n</sup> values.",
          why: "A mask can take 2<sup>n</sup> values, but the search does not merge nodes that share a mask: it still walks every placement. Merging equal states is memoisation, which this code does not do.",
        },
        {
          id: "c",
          text: "The worst case becomes polynomial in n, because one expression finds all the safe columns of a row.",
          why: "Finding the safe columns faster does not shrink the tree. The number of placements the search can explore is still exponential in n, and faster steps do not change that.",
        },
        {
          id: "d",
          text: "It is slower in the worst case, because working with 32-bit integers costs more than a lookup in a Set.",
          why: "In practice bitwise operations on small integers are cheap, and the chapter's point is that they cost less per node than the Set operations they replace.",
        },
      ],
      answer: "a",
    },
    {
      id: "ab-queens-space",
      chapter: "dsa-advanced-backtracking",
      level: "advanced",
      skill: "complexity",
      pattern: "backtracking",
      section: "n-queens-with-bitmasks-the-canonical-example",
      kind: "single",
      prompt:
        "<p>This version only counts the solutions and stores no board. What is the tightest bound on its <em>extra space</em>, in terms of <code>n</code>, apart from the returned number?</p><pre><code>function countQueens(n) {\n  const full = (1 &lt;&lt; n) - 1;\n  function place(row, cols, diag1, diag2) {\n    if (row === n) return 1;\n    let free = full &amp; ~(cols | diag1 | diag2);\n    let total = 0;\n    while (free) {\n      const bit = free &amp; -free;\n      free ^= bit;\n      total += place(row + 1, cols | bit, ((diag1 | bit) &lt;&lt; 1) &amp; full, (diag2 | bit) &gt;&gt; 1);\n    }\n    return total;\n  }\n  return place(0, 0, 0, 0);\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "O(1), because the whole board is kept in four integers.",
          why: "The four integers are passed to each call, and every call that is still waiting keeps its own copy. Up to n + 1 calls wait at once, so the total grows with n.",
        },
        {
          id: "b",
          text: "O(n)",
          why: "The recursion goes one row deeper for each queen, so up to n + 1 calls are waiting at once, and each holds a constant number of integers. Nothing else grows.",
        },
        {
          id: "c",
          text: "O(n<sup>2</sup>)",
          why: "That would be the size of a stored board. This version keeps no board, only a count, and each waiting call holds a few integers.",
        },
        {
          id: "d",
          text: "O(2<sup>n</sup>)",
          why: "A mask can take 2<sup>n</sup> values, but the code never keeps a table indexed by mask. It only holds the masks of the calls that are currently waiting.",
        },
      ],
      answer: "b",
    },
    {
      id: "ab-free-trace",
      chapter: "dsa-advanced-backtracking",
      level: "advanced",
      skill: "trace",
      pattern: "backtracking",
      section: "n-queens-with-bitmasks-the-canonical-example",
      kind: "single",
      prompt:
        "<p>In <code>solveNQueens(4)</code> the first queen goes in column 0 of row 0 and the second goes in column 3 of row 1. What number is <code>free</code> when the call for row 2 begins?</p><pre><code>function solveNQueens(n) {\n  const full = (1 &lt;&lt; n) - 1;\n  function place(row, cols, diag1, diag2) {\n    if (row === n) return;\n    let free = full &amp; ~(cols | diag1 | diag2);\n    while (free) {\n      const bit = free &amp; -free;\n      free ^= bit;\n      place(row + 1, cols | bit, ((diag1 | bit) &lt;&lt; 1) &amp; full, (diag2 | bit) &gt;&gt; 1);\n    }\n  }\n  place(0, 0, 0, 0);\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>0</code>",
          why: "<code>free</code> would be 0 if every column of row 2 were attacked, which makes a dead end. Column 1 is still safe: it shares no column and no diagonal with either queen.",
        },
        {
          id: "b",
          text: "<code>4</code>",
          why: "4 would mean that only column 2 is safe. Column 2 is attacked twice: by the queen at row 1, column 3, one step away on a diagonal, and by the queen at row 0, column 0, two steps away on the other.",
        },
        {
          id: "c",
          text: "<code>6</code>",
          why: "6 is columns 1 and 2, which is what <code>15 &amp; ~9</code> gives if you remove the used columns and forget the diagonals. Column 2 is on a diagonal of both queens, so only column 1 is left.",
        },
        {
          id: "d",
          text: "<code>2</code>",
          why: "<code>cols</code> is 9 (columns 0 and 3). The diagonal masks have been shifted once per row and are both 4, which blocks column 2. So <code>free</code> is <code>15 &amp; ~(9 | 4 | 4)</code> = 2, column 1.",
        },
      ],
      answer: "d",
    },
    {
      id: "ab-order-sudoku-digit",
      chapter: "dsa-advanced-backtracking",
      level: "advanced",
      skill: "trace",
      pattern: "backtracking",
      section: "sudoku-bitmasks-plus-constraint-propagation",
      kind: "order",
      prompt:
        "<p>Put the work for one candidate digit in the Sudoku solver in the order it runs. Start with picking the digit and end with undoing it.</p>",
      items: [
        { id: "pick", text: "Take the lowest set bit of <code>free</code> as the digit to try." },
        {
          id: "mark",
          text: "Set that digit's bit in the row, column and box masks, and write the digit on the board.",
        },
        { id: "recurse", text: "Call <code>solve(k + 1)</code> and check whether it returned true." },
        {
          id: "undo",
          text: "If it did not, clear the bits and the board cell again, ready for the next digit.",
        },
      ],
      why: "The digit has to be chosen before it can be recorded, and it has to be recorded before the recursive call so that the deeper cells see it as used. The undo comes last, and only when the call failed, because a success returns straight away.",
    },
    {
      id: "ab-prefix-word",
      chapter: "dsa-advanced-backtracking",
      level: "advanced",
      skill: "edge-case",
      pattern: "backtracking",
      section: "word-search-ii-a-trie-prunes-the-whole-dictionary-at-once",
      kind: "single",
      prompt:
        '<p>In the chapter\'s <code>findWords</code>, a teammate adds <code>return;</code> straight after <code>delete node.word;</code>, reasoning that the word is found and this walk can stop. The board is <code>[["t", "o", "w"]]</code> and the words are <code>["to", "tow"]</code>. What does the function return?</p><pre><code>function dfs(r, c, parent) {\n  const ch = board[r][c];\n  const node = parent[ch];\n  if (!node) return;\n\n  if (node.word) {\n    found.push(node.word);\n    delete node.word;\n    return;\n  }\n\n  board[r][c] = "#";\n  if (r &gt; 0) dfs(r - 1, c, node);\n  if (r + 1 &lt; R) dfs(r + 1, c, node);\n  if (c &gt; 0) dfs(r, c - 1, node);\n  if (c + 1 &lt; C) dfs(r, c + 1, node);\n  board[r][c] = ch;\n\n  if (Object.keys(node).length === 0) delete parent[ch];\n}</code></pre>',
      choices: [
        {
          id: "a",
          text: '<code>["to", "tow"]</code>',
          why: "That is the right answer, and the original function returns it. With the added <code>return</code> the walk stops at the <code>o</code>, so it never reaches the <code>w</code>.",
        },
        {
          id: "b",
          text: '<code>["tow"]</code>',
          why: 'The shorter word is found first, at the cell with <code>o</code>, and it is pushed before the <code>return</code> runs. So <code>"to"</code> is in the result.',
        },
        {
          id: "c",
          text: '<code>["to"]</code>',
          why: "The <code>return</code> fires at <code>o</code>, before the four neighbour calls, so the longer word <code>tow</code>, which continues past the end of <code>to</code>, is never reached. A word that is a prefix of another must not end the walk.",
        },
        {
          id: "d",
          text: "<code>[]</code>",
          why: "Nothing stops <code>to</code> from being pushed: the <code>return</code> comes after the push. The function can only lose the longer word.",
        },
      ],
      answer: "c",
    },
    {
      id: "ab-unsorted-break",
      chapter: "dsa-advanced-backtracking",
      level: "advanced",
      skill: "edge-case",
      pattern: "backtracking",
      section: "branch-and-bound-pruning-with-a-number-not-just-a-rule",
      kind: "single",
      prompt:
        "<p>A teammate deletes the line <code>candidates.sort((a, b) =&gt; a - b)</code> from <code>combinationSum</code> but keeps the <code>break</code>. What does <code>combinationSum([4, 2], 2)</code> return?</p><pre><code>function combinationSum(candidates, target) {\n  const results = [], path = [];\n  function go(start, remaining) {\n    if (remaining === 0) { results.push([...path]); return; }\n    for (let i = start; i &lt; candidates.length; i++) {\n      if (candidates[i] &gt; remaining) break;\n      path.push(candidates[i]);\n      go(i, remaining - candidates[i]);\n      path.pop();\n    }\n  }\n  go(0, target);\n  return results;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>[]</code>",
          why: "At <code>i = 0</code> the candidate 4 is larger than 2, so <code>break</code> leaves the loop. The 2 at index 1 is never tried. The break assumed that everything after a too-large candidate is also too large, which only holds after sorting.",
        },
        {
          id: "b",
          text: "<code>[[2]]</code>",
          why: "That is the correct answer, and the sorted version returns it. Sorted, the candidates are <code>[2, 4]</code>, the 2 is tried first and the 4 is never reached.",
        },
        {
          id: "c",
          text: "<code>[[4], [2]]</code>",
          why: "<code>[4]</code> can never be a result, because 4 does not add up to 2, and the code never pushes a candidate that is larger than the remainder. Treating <code>break</code> like <code>continue</code> would give <code>[[2]]</code>, not this.",
        },
        {
          id: "d",
          text: "It never finishes, because the loop does not end.",
          why: "The loop ends at once at the <code>break</code>. The function returns normally, just with a result that is missing the answer.",
        },
      ],
      answer: "a",
    },
    {
      id: "ab-bound-multi",
      chapter: "dsa-advanced-backtracking",
      level: "advanced",
      skill: "recognise",
      pattern: "backtracking",
      section: "ordering-the-search-is-free-speed",
      kind: "multi",
      prompt: "<p>Select every statement about branch and bound that is correct.</p>",
      choices: [
        {
          id: "a",
          text: "A bound may underestimate what a branch can still reach, because a smaller bound prunes more.",
          why: "A bound that is too low can cut the branch that holds the optimum. That is why the estimate has to be optimistic, never below what the branch can really reach.",
        },
        {
          id: "b",
          text: "A tighter bound, one that stays optimistic but is closer to the truth, can cut more of the tree.",
          why: "A bound that is closer to what the branch can really reach falls below <code>best</code> in more places, so more subtrees are dropped. The price is usually a more expensive bound.",
        },
        {
          id: "c",
          text: "Exploring the most promising branch first can make later bounds cut more.",
          why: "A good answer found early raises <code>best</code> early, and every later branch is compared with that higher figure. Sorting by value density does exactly this for knapsack.",
        },
        {
          id: "d",
          text: "With a good enough bound, the worst-case running time becomes polynomial.",
          why: "A bound makes the typical search much smaller, but an input can still defeat it, so the worst case is not guaranteed to improve. The honest claim is that the nodes visited collapse in practice.",
        },
      ],
      answers: ["b", "c"],
    },
    {
      id: "ab-partition-memo",
      chapter: "dsa-advanced-backtracking",
      level: "advanced",
      skill: "recognise",
      pattern: "backtracking",
      section: "recognizing-it-in-an-unseen-problem",
      kind: "single",
      prompt:
        "<p>Sixteen positive numbers must be split into 4 groups of equal sum, using every number. A search places the numbers one at a time into the current group, and opens the next group only when the current one reaches exactly the target sum. Different orders of placing the same numbers can lead to the same future. Which memo key lets the search recognise that?</p>",
      choices: [
        {
          id: "a",
          text: "The index of the last number placed.",
          why: "Different sets of placed numbers can end at the same index, and their futures differ. One index does not say which numbers are left.",
        },
        {
          id: "b",
          text: "The list of the numbers in the order they were placed.",
          why: "Two orders of the same numbers give two different lists, so the memo would never see them as the same state. A list like that is just the path, not the state.",
        },
        {
          id: "c",
          text: "How many numbers have been placed so far.",
          why: "Different sets of the same size leave different numbers to place, so their futures differ. A count cannot tell them apart.",
        },
        {
          id: "d",
          text: "A bitmask of which numbers are used.",
          why: "Which numbers remain decides the future. Because each group is closed exactly at the target, the sum used so far also fixes how full the current group is, so the mask is the whole state. That is at most 2<sup>16</sup> states, which makes it a bitmask DP.",
        },
      ],
      answer: "d",
    },
    {
      id: "ab-twin-buckets",
      chapter: "dsa-advanced-backtracking",
      level: "advanced",
      skill: "recognise",
      pattern: "backtracking",
      section: "symmetry-breaking-never-explore-the-same-subtree-twice",
      kind: "single",
      prompt:
        "<p>In the bucket search for Partition to K Equal Sum Subsets, the next number is about to be placed. Which buckets may be skipped without losing any solution?</p>",
      choices: [
        {
          id: "a",
          text: "Any bucket whose current sum equals the sum of a bucket already tried for this number.",
          why: "The rest of the search depends only on the multiset of bucket sums, so two buckets with the same sum are interchangeable. If placing the number in one leads nowhere, placing it in the other cannot do better.",
        },
        {
          id: "b",
          text: "Every bucket after the first one that has room.",
          why: "Buckets with different sums lead to different futures, so skipping all but the first would lose solutions that need the number in a later bucket.",
        },
        {
          id: "c",
          text: "Any bucket whose last-placed number equals the number about to be placed, since the two look alike.",
          why: "The last number says little about the bucket's sum, so two such buckets can still have different sums and different futures.",
        },
        {
          id: "d",
          text: "Any bucket that currently holds more than one number.",
          why: "A bucket with several numbers can still have room, and its sum can be the only one that lets a later number fit.",
        },
      ],
      answer: "a",
    },
    {
      id: "ab-partition-bound",
      chapter: "dsa-advanced-backtracking",
      level: "advanced",
      skill: "complexity",
      pattern: "backtracking",
      section: "symmetry-breaking-never-explore-the-same-subtree-twice",
      kind: "single",
      prompt:
        "<p>On one 14-number input the bucket search made about 2.6 million calls with only the overflow check, and 3,700 calls after sorting descending and skipping equal-sum buckets. What does that say about the algorithm's worst case with k buckets and n numbers?</p>",
      choices: [
        {
          id: "a",
          text: "It is now polynomial in n, because the number of calls fell by a factor of about 700 on that input.",
          why: "A drop on one input does not change the bound. Other inputs, such as many distinct sums, still need exponentially many calls.",
        },
        {
          id: "b",
          text: "It is O(n log n), the cost of the sort.",
          why: "The sort is a small one-off cost. The search that follows is still a tree whose size is not bounded by n log n.",
        },
        {
          id: "c",
          text: "Still exponential: O(k<sup>n</sup>) is the bound, and the pruning cuts visited nodes.",
          why: "Each of the n numbers still has up to k places to go in the worst case. The two prunes make typical inputs far cheaper, and the honest claim is about nodes visited on that input.",
        },
        {
          id: "d",
          text: "It is O(2<sup>k</sup>), because each bucket is used or not.",
          why: "The search decides one bucket per number, not one use per bucket, so the exponent is in n, with k as the branching factor.",
        },
      ],
      answer: "c",
    },
    {
      id: "ab-expression-multiply",
      chapter: "dsa-advanced-backtracking",
      level: "advanced",
      skill: "trace",
      pattern: "backtracking",
      section: "expression-add-operators-carry-the-last-term-so-multiplicati",
      kind: "single",
      prompt:
        '<p>While building an expression for <code>"232"</code>, the search has produced <code>2+3</code>, so <code>value</code> is 5 and <code>lastTerm</code> is 3. It now appends <code>*2</code>. What are the new <code>value</code> and <code>lastTerm</code>?</p>',
      choices: [
        {
          id: "a",
          text: "value 10, lastTerm 6",
          why: "This multiplies the whole value 5 by 2. Multiplication binds only to the last term, so 2+3*2 is 2 + 6, not (2+3) × 2.",
        },
        {
          id: "b",
          text: "value 8, lastTerm 6",
          why: "The value 5 included the 3. Taking it back out and adding 3 × 2 gives 5 - 3 + 6 = 8, and the new last term is 3 × 2 = 6, so a further <code>*</code> would apply to the 6.",
        },
        {
          id: "c",
          text: "value 11, lastTerm 6",
          why: "The code removes the old last term and adds the product, so the new value is 5 - 3 + 6 = 8. Adding 6 to the value without removing the 3 counts the 3 twice.",
        },
        {
          id: "d",
          text: "value 8, lastTerm 2",
          why: "The value is right, but the last term must be the whole product 3 × 2 = 6. A later multiplication has to take back all of 6, not only the 2.",
        },
      ],
      answer: "b",
    },
    {
      id: "ab-expression-operands",
      chapter: "dsa-advanced-backtracking",
      level: "advanced",
      skill: "edge-case",
      pattern: "backtracking",
      section: "expression-add-operators-carry-the-last-term-so-multiplicati",
      kind: "multi",
      prompt:
        '<p>Expression Add Operators is run on <code>"1005"</code>. Select every string below that may appear as an operand (a run of consecutive digits, with no leading zero unless it is exactly "0").</p>',
      choices: [
        {
          id: "a",
          text: '<code>"10"</code>',
          why: "It starts with 1, so it is a normal two-digit number.",
        },
        {
          id: "b",
          text: '<code>"00"</code>',
          why: "It has two digits and starts with 0, which is a leading zero, so it is rejected. The search stops extending an operand that starts at a 0.",
        },
        {
          id: "c",
          text: '<code>"0"</code>',
          why: "A single 0 is allowed. Only longer operands that start with 0 are rejected.",
        },
        {
          id: "d",
          text: '<code>"05"</code>',
          why: "It starts with 0 and has two digits, so it is not an operand.",
        },
        {
          id: "e",
          text: '<code>"1005"</code>',
          why: "The whole string starts with 1, so it is a valid operand, and it is also the expression with no operators at all.",
        },
      ],
      answers: ["a", "c", "e"],
    },
    {
      id: "ab-parens-budget",
      chapter: "dsa-advanced-backtracking",
      level: "advanced",
      skill: "trace",
      pattern: "backtracking",
      section: "remove-invalid-parentheses-decide-what-to-remove-then-never-",
      kind: "single",
      prompt:
        '<p>The first scan of Remove Invalid Parentheses counts the unmatched brackets. For <code>"(()))("</code>, how many <code>(</code> and how many <code>)</code> must be removed?</p>',
      choices: [
        {
          id: "a",
          text: "2 open and 2 close, because the string has 3 of one and 3 of the other.",
          why: "The count of each bracket in the string is not what matters. Only brackets that cannot be matched are removed, and here the matched ones pair up.",
        },
        {
          id: "b",
          text: "3 open and 0 close.",
          why: "Three <code>(</code> appear in the string, but two of them are matched by the first two <code>)</code>, and one <code>)</code> is unmatched too.",
        },
        {
          id: "c",
          text: "0 open and 2 close.",
          why: "Only the third <code>)</code> is unmatched. The final <code>(</code> has no <code>)</code> after it either, so an open bracket must go as well.",
        },
        {
          id: "d",
          text: "1 open and 1 close.",
          why: "Scanning left to right, the two <code>(</code> are closed by the first two <code>)</code>. The third <code>)</code> has nothing to close and the final <code>(</code> is never closed, so one of each is unmatched.",
        },
      ],
      answer: "d",
    },
    {
      id: "ab-paths3-end",
      chapter: "dsa-advanced-backtracking",
      level: "advanced",
      skill: "edge-case",
      pattern: "backtracking",
      section: "unique-paths-iii-a-hamiltonian-path-count-with-a-visited-gri",
      kind: "single",
      prompt:
        "<p>In Unique Paths III, the search reaches the end square. Why does the code return 1 only when exactly one walkable square is still unvisited, rather than whenever it arrives?</p>",
      choices: [
        {
          id: "a",
          text: "Otherwise the same walk would be counted twice, once from each direction.",
          why: "Walks are counted from the start in one direction, and each distinct sequence of squares is counted once. Early arrival is wrong for a different reason: it skips squares.",
        },
        {
          id: "b",
          text: "It does not need to: the mark 2 already guarantees that the end square can only be reached as the last step of any walk.",
          why: "The mark 2 only identifies the end square. Nothing stops the search from stepping onto it early, which is why the count of remaining squares is checked.",
        },
        {
          id: "c",
          text: "Arriving early counts walks that skipped squares, but every non-obstacle square must be visited exactly once.",
          why: "With <code>left === 1</code> the end square is the only one remaining, so every other walkable square has already been visited. Arriving with more left over returns 0, since squares that were skipped can no longer be reached.",
        },
        {
          id: "d",
          text: "The count of walkable squares includes the end square, so one must remain to keep the recursion from stopping.",
          why: "Recursion stops because the code returns at the end square, not because of any count. The count is compared to detect whether every square was visited.",
        },
      ],
      answer: "c",
    },
    {
      id: "ab-mitm-cost",
      chapter: "dsa-advanced-backtracking",
      level: "advanced",
      skill: "complexity",
      pattern: "backtracking",
      section: "meet-in-the-middle-when-2n-is-too-big-and-2n-2-is-not",
      kind: "single",
      prompt:
        "<p>Closest subset sum on n = 40 numbers is solved by meet in the middle: both halves' subset sums are listed, one list is sorted, and each sum of the other is looked up by binary search. What are the time and the space, in terms of n?</p>",
      choices: [
        {
          id: "a",
          text: "Time O(2<sup>n/2</sup> · n) and space O(2<sup>n/2</sup>).",
          why: "Each half has 2<sup>n/2</sup> sums, sorting one and searching it for each sum of the other cost O(n) per element in total, and both lists must be held at once, which is the memory price.",
        },
        {
          id: "b",
          text: "Time O(n<sup>2</sup>) and space O(n).",
          why: "No polynomial algorithm is known for this problem in general, and this one still builds lists whose length is exponential in n.",
        },
        {
          id: "c",
          text: "Time O(2<sup>n</sup>) and space O(n), as plain enumeration but with less memory.",
          why: "Enumeration is exactly what is avoided. Two lists of 2<sup>n/2</sup> sums replace 2<sup>n</sup> subsets, and the lists are the memory cost.",
        },
        {
          id: "d",
          text: "Time O(2<sup>n/2</sup>) and space O(1).",
          why: "The lists of sums must be stored to be sorted and searched, so the space is not constant, and sorting and searching add a factor that grows with n.",
        },
      ],
      answer: "a",
    },
    {
      id: "ab-memo-key",
      chapter: "dsa-advanced-backtracking",
      level: "advanced",
      skill: "recognise",
      pattern: "backtracking",
      section: "memoized-backtracking-when-the-state-is-small-stop-re-explor",
      kind: "single",
      prompt:
        "<p>In Can I Win, two players pick unused numbers from 1 to m and add them to a running total. Which memo key is both complete and small enough to be reused?</p>",
      choices: [
        {
          id: "a",
          text: "The remaining total alone.",
          why: "Different sets of used numbers can leave the same remaining total while leaving different numbers available, so the future differs. Keying on the total conflates them and gives wrong answers.",
        },
        {
          id: "b",
          text: "A bitmask of the numbers already used.",
          why: "The remaining total and whose turn it is both follow from the used set, so the mask holds everything the future depends on. There are at most 2<sup>m</sup> masks, and different orders of the same picks share one key.",
        },
        {
          id: "c",
          text: "The last number picked.",
          why: "It does not say which other numbers are gone, so it is far too small a key.",
        },
        {
          id: "d",
          text: "The full sequence of numbers picked so far, in order.",
          why: "The key is complete but almost never repeats, because the same used set reached by different orders gives different keys. That is the original search tree with a map attached.",
        },
      ],
      answer: "b",
    },
  ],
  pattern: {
    pattern: "backtracking",
    chapter: "dsa-advanced-backtracking",
    signals: [
      "Plain backtracking is the obvious approach, but it times out.",
      "The state is a small dense set, such as the columns of a board or the digits 1 to 9.",
      "Many words are searched against one board or one structure.",
      "The task asks for the best value, so a bound can be compared with the best found so far.",
      "The candidates can be sorted so that one failure rules out every later candidate.",
    ],
    template:
      "<pre><code>function search(state) {\n  if (isComplete(state)) return record(state);\n  if (cannotBeatBest(state)) return;\n  for (const choice of legalChoices(state)) {\n    apply(choice);\n    search(state);\n    undo(choice);\n  }\n}</code></pre>",
    time: "Exponential in the worst case, for example O(n!) for N-Queens; pruning cuts the nodes visited, not the worst-case bound",
    space: "O(depth of the recursion), plus any mask or trie that is built",
    styles: ["online-assessment", "onsite"],
  },
};
