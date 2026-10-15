import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "mx-rotate-plan",
      chapter: "dsa-matrix-problems",
      level: "intermediate",
      skill: "recognise",
      pattern: "matrix",
      section: "in-place-rotation-90-with-no-extra-matrix",
      placement: true,
      kind: "single",
      prompt:
        "<p>You must rotate a square matrix 90° clockwise inside the same array, using O(1) extra space. Which plan does that?</p>",
      choices: [
        {
          id: "a",
          text: "Copy each cell into a second n × n matrix with <code>fresh[c][n - 1 - r] = old[r][c]</code>.",
          why: "The formula is right and the copy comes out rotated clockwise, but a second n × n matrix is O(n²) extra space. The task asks for the rotation inside the same array.",
        },
        {
          id: "b",
          text: "Reverse each row, then transpose.",
          why: "This order rotates counter-clockwise. On <code>[[1,2,3],[4,5,6],[7,8,9]]</code> it gives <code>[[3,6,9],[2,5,8],[1,4,7]]</code>, but the clockwise result is <code>[[7,4,1],[8,5,2],[9,6,3]]</code>.",
        },
        {
          id: "c",
          text: "Transpose, then reverse each row.",
          why: "Transposing swaps <code>matrix[r][c]</code> with <code>matrix[c][r]</code>, so the first row becomes the first column. Reversing each row then moves that column to the right edge. Both steps work in place, so no second matrix is needed.",
        },
        {
          id: "d",
          text: "Transpose, then reverse the order of the rows.",
          why: "Reversing the order of the rows after a transpose also rotates counter-clockwise, and gives <code>[[3,6,9],[2,5,8],[1,4,7]]</code> for the 3 × 3 example. Reversing each row is what gives clockwise.",
        },
      ],
      answer: "c",
    },
    {
      id: "mx-graph-in-costume",
      chapter: "dsa-matrix-problems",
      level: "intermediate",
      skill: "recognise",
      pattern: "matrix",
      section: "grid-as-a-graph-search-patterns-from-the-graph-chapter-reuse",
      placement: true,
      kind: "multi",
      prompt:
        "<p>Select every task that is a graph problem wearing a grid costume, where each cell is a node with up to four neighbours.</p>",
      choices: [
        {
          id: "a",
          text: "Count the separate lakes on a map, where water cells touch horizontally or vertically.",
          why: "Each lake is a connected component. Flood fill from every unvisited water cell counts them, exactly as it does for islands.",
        },
        {
          id: "b",
          text: "List every cell of a rectangular matrix in clockwise spiral order.",
          why: "This is index bookkeeping. The walk follows four shrinking boundaries and never needs to ask which cells connect to which.",
        },
        {
          id: "c",
          text: "Find the fewest moves from the top-left cell to the bottom-right cell through open cells, stepping in four directions.",
          why: "Fewest steps between two cells is a shortest-path problem where each move is an edge. A breadth-first search over the cells solves it.",
        },
        {
          id: "d",
          text: "Rotate a square image 90° in place.",
          why: "Rotation is a transpose followed by row reversals. Every cell moves to a fixed new position, and no cell's neighbours matter.",
        },
      ],
      answers: ["a", "c"],
    },
    {
      id: "mx-counter-clockwise",
      chapter: "dsa-matrix-problems",
      level: "intermediate",
      skill: "recognise",
      pattern: "matrix",
      section: "in-place-rotation-90-with-no-extra-matrix",
      kind: "single",
      prompt: "<p>Which plan rotates a square matrix 90° counter-clockwise, in place?</p>",
      choices: [
        {
          id: "a",
          text: "Reverse each row, then transpose.",
          why: "Reversing each row turns <code>[[1,2,3],[4,5,6],[7,8,9]]</code> into <code>[[3,2,1],[6,5,4],[9,8,7]]</code>, and transposing that gives <code>[[3,6,9],[2,5,8],[1,4,7]]</code>, the counter-clockwise rotation.",
        },
        {
          id: "b",
          text: "Reverse the order of the rows, then transpose.",
          why: "This gives the clockwise result, <code>[[7,4,1],[8,5,2],[9,6,3]]</code>. Flipping the rows upside down before the transpose has the same effect as reversing each row after it.",
        },
        {
          id: "c",
          text: "Transpose, then reverse each row.",
          why: "This is the clockwise recipe from the chapter. Using it here would turn the matrix the other way.",
        },
        {
          id: "d",
          text: "Reverse each row, then reverse the order of the rows.",
          why: "Both steps are flips, and two flips make a half turn. On the 3 × 3 example this gives <code>[[9,8,7],[6,5,4],[3,2,1]]</code>, a 180° rotation.",
        },
      ],
      answer: "a",
    },
    {
      id: "mx-rotate-cost",
      chapter: "dsa-matrix-problems",
      level: "intermediate",
      skill: "complexity",
      pattern: "matrix",
      section: "in-place-rotation-90-with-no-extra-matrix",
      kind: "single",
      prompt:
        "<p>The matrix is n × n, and <code>rotate</code> is the chapter's transpose-then-reverse version. Which gives its worst-case running time and its extra space, in terms of n?</p>",
      choices: [
        {
          id: "a",
          text: "O(n) time, O(1) extra space",
          why: "An n × n matrix holds n² cells and every cell has to move, so no version can finish in O(n) time.",
        },
        {
          id: "b",
          text: "O(n²) time, O(1) extra space",
          why: "The transpose makes about n²/2 swaps and the reversals make about n²/2 more. A swap holds just two values at a time, and <code>row.reverse()</code> works inside the row, so extra space stays constant.",
        },
        {
          id: "c",
          text: "O(n²) time, O(n²) extra space",
          why: "That is the cost of the copy-into-a-new-matrix version. The two in-place passes need no second matrix.",
        },
        {
          id: "d",
          text: "O(n³) time, O(1) extra space",
          why: "Nothing here is nested three deep. The transpose is a double loop and the reversal touches each row once.",
        },
      ],
      answer: "b",
    },
    {
      id: "mx-island-stack-space",
      chapter: "dsa-matrix-problems",
      level: "intermediate",
      skill: "complexity",
      pattern: "matrix",
      section: "grid-as-a-graph-search-patterns-from-the-graph-chapter-reuse",
      kind: "single",
      prompt:
        '<p>The grid has R rows and C columns. Counting the recursion call stack, what is the worst-case extra space of this function, apart from the grid itself?</p><pre><code>function numIslands(grid) {\n  const rows = grid.length, cols = grid[0].length;\n  let islands = 0;\n\n  function sink(r, c) {\n    if (r &lt; 0 || r &gt;= rows || c &lt; 0 || c &gt;= cols || grid[r][c] !== "1") return;\n    grid[r][c] = "0";\n    sink(r + 1, c); sink(r - 1, c); sink(r, c + 1); sink(r, c - 1);\n  }\n\n  for (let r = 0; r &lt; rows; r++) {\n    for (let c = 0; c &lt; cols; c++) {\n      if (grid[r][c] === "1") {\n        islands++;\n        sink(r, c);\n      }\n    }\n  }\n  return islands;\n}</code></pre>',
      choices: [
        {
          id: "a",
          text: "O(1), because the grid is mutated and there is no visited set",
          why: "Marking cells in the grid saves the visited set, but the recursion still needs one stack frame per pending call. Those frames are extra space too.",
        },
        {
          id: "b",
          text: "O(min(R, C))",
          why: "That is the order of a breadth-first frontier on an open grid. A depth-first walk can go much deeper than the shorter side.",
        },
        {
          id: "c",
          text: "O(the number of islands)",
          why: "The number of islands is never stored. Space follows how deep the recursion goes, which depends on the shape of one island, not on how many there are.",
        },
        {
          id: "d",
          text: "O(R · C)",
          why: "With the neighbour order shown, a grid that is all land makes the walk snake through every cell before it returns, so the recursion gets R · C frames deep. Time is O(R · C) as well, because each cell is sunk once.",
        },
      ],
      answer: "d",
    },
    {
      id: "mx-spiral-trace",
      chapter: "dsa-matrix-problems",
      level: "intermediate",
      skill: "trace",
      pattern: "matrix",
      section: "traversal-direction-the-pattern-behind-spiral-order",
      kind: "single",
      prompt:
        "<p>The chapter's <code>spiralOrder</code>, with both guards, runs on a matrix of 4 rows and 3 columns:</p><pre><code>spiralOrder([\n  [1, 2, 3],\n  [4, 5, 6],\n  [7, 8, 9],\n  [10, 11, 12],\n]);</code></pre><p>What does it return?</p>",
      choices: [
        {
          id: "a",
          text: "<code>[1, 2, 3, 6, 9, 12, 11, 10, 7, 4, 8, 5]</code>",
          why: "The inner part is the column holding 5 and 8. After the outer ring, <code>top</code> is 1 and <code>bottom</code> is 2, so the next pass walks the top row first and the right column after it, giving 5 before 8.",
        },
        {
          id: "b",
          text: "<code>[1, 2, 3, 6, 9, 12, 10, 11, 7, 4, 5, 8]</code>",
          why: "The bottom row is walked from right to left, so after 12 comes 11 and then 10. This answer walks it left to right.",
        },
        {
          id: "c",
          text: "<code>[1, 2, 3, 6, 9, 12, 11, 10, 7, 4, 5, 8]</code>",
          why: "The outer ring gives 1, 2, 3, then down the right side 6, 9, 12, then along the bottom 11, 10, then up the left side 7, 4. The inner column then gives 5 and 8 in that order.",
        },
        {
          id: "d",
          text: "<code>[1, 2, 3, 6, 9, 12, 11, 10, 7, 4, 5]</code>",
          why: "The inner column holds two cells, 5 and 8. The pass after the outer ring takes the top cell and then the right column, so the 8 is still collected.",
        },
      ],
      answer: "c",
    },
    {
      id: "mx-spiral-single-row",
      chapter: "dsa-matrix-problems",
      level: "intermediate",
      skill: "edge-case",
      pattern: "matrix",
      section: "traversal-direction-the-pattern-behind-spiral-order",
      kind: "single",
      prompt:
        "<p>Someone deletes both <code>if</code> guards from <code>spiralOrder</code>, so the bottom-row and left-column loops always run. What does the result look like for a matrix with one row, <code>[[1, 2, 3]]</code>?</p>",
      choices: [
        {
          id: "a",
          text: "<code>[1, 2, 3, 2, 1]</code>",
          why: "The top row is collected first. Then <code>top</code> becomes 1 while <code>bottom</code> is still 0, and without the guard the bottom-row loop walks row 0 again from <code>right</code> down to <code>left</code>, adding 2 and 1.",
        },
        {
          id: "b",
          text: "<code>[1, 2, 3]</code>",
          why: "That is what the guarded version returns. Without the guards, nothing stops the bottom-row loop from walking row 0 a second time.",
        },
        {
          id: "c",
          text: "It throws a <code>TypeError</code> because the bottom row does not exist.",
          why: "With one row, <code>bottom</code> is 0, which is a real row. The loop reads cells that were already visited but they exist, so no error is thrown.",
        },
        {
          id: "d",
          text: "<code>[1, 2, 3, 3, 2, 1]</code>",
          why: "<code>right</code> is decreased after the right column is walked, so the repeated bottom row starts at 2, not at 3. The 3 is collected only once.",
        },
      ],
      answer: "a",
    },
    {
      id: "mx-transpose-from-zero",
      chapter: "dsa-matrix-problems",
      level: "intermediate",
      skill: "trace",
      pattern: "matrix",
      section: "in-place-rotation-90-with-no-extra-matrix",
      kind: "single",
      prompt:
        "<p>A typo starts the inner transpose loop at <code>c = 0</code> instead of <code>c = r + 1</code>:</p><pre><code>function rotate(matrix) {\n  const n = matrix.length;\n  for (let r = 0; r &lt; n; r++) {\n    for (let c = 0; c &lt; n; c++) {\n      [matrix[r][c], matrix[c][r]] = [matrix[c][r], matrix[r][c]];\n    }\n  }\n  for (const row of matrix) row.reverse();\n}</code></pre><p>After <code>rotate</code> runs on <code>[[1,2,3],[4,5,6],[7,8,9]]</code>, what does the matrix hold?</p>",
      choices: [
        {
          id: "a",
          text: "<code>[[7,4,1],[8,5,2],[9,6,3]]</code>",
          why: "That is the correct clockwise rotation, which needs a real transpose first. With this typo the transpose does not happen.",
        },
        {
          id: "b",
          text: "<code>[[1,2,3],[4,5,6],[7,8,9]]</code>",
          why: "The swaps do cancel out, but the row reversals still run afterwards, so the matrix does not end up unchanged.",
        },
        {
          id: "c",
          text: "<code>[[9,8,7],[6,5,4],[3,2,1]]</code>",
          why: "This is a half turn, which needs the rows to be reversed and also put in the opposite order. Here only each row is reversed.",
        },
        {
          id: "d",
          text: "<code>[[3,2,1],[6,5,4],[9,8,7]]</code>",
          why: "Starting at 0 visits both <code>(0, 1)</code> and <code>(1, 0)</code>, so each off-diagonal pair is swapped twice and goes back where it started. The diagonal swaps with itself. The transpose cancels, and the row reversals leave a mirror image.",
        },
      ],
      answer: "d",
    },
    {
      id: "mx-islands-number-cells",
      chapter: "dsa-matrix-problems",
      level: "intermediate",
      skill: "edge-case",
      pattern: "matrix",
      section: "grid-as-a-graph-search-patterns-from-the-graph-chapter-reuse",
      kind: "single",
      prompt:
        '<p>The chapter\'s <code>numIslands</code> tests cells with <code>grid[r][c] !== "1"</code>. A caller builds the grid from numbers and calls <code>numIslands([[1, 1, 0], [0, 0, 1]])</code>. What does it return?</p>',
      choices: [
        {
          id: "a",
          text: "2",
          why: 'Two groups of ones are there, but the function never recognises them. It compares each cell with the string <code>"1"</code>.',
        },
        {
          id: "b",
          text: "0",
          why: '<code>1 !== "1"</code> is true in JavaScript, because <code>!==</code> does not convert types. Every cell looks like water, so <code>sink</code> is never called and the count stays 0.',
        },
        {
          id: "c",
          text: "1",
          why: "A count of 1 would need one cell to pass the test. None of them does, so no island is ever counted.",
        },
        {
          id: "d",
          text: "It throws, because a number is compared with a string.",
          why: "JavaScript compares values of different types without complaint. The comparison is simply false, and the function returns normally.",
        },
      ],
      answer: "b",
    },
    {
      id: "mx-rotate-non-square",
      chapter: "dsa-matrix-problems",
      level: "intermediate",
      skill: "edge-case",
      pattern: "matrix",
      section: "in-place-rotation-90-with-no-extra-matrix",
      kind: "single",
      prompt:
        "<p>The chapter's <code>rotate</code> sets <code>n = matrix.length</code> and is called on a matrix with 2 rows and 3 columns, <code>[[1, 2, 3], [4, 5, 6]]</code>. What happens?</p>",
      choices: [
        {
          id: "a",
          text: "It turns the matrix into the 3 × 2 rotation <code>[[4,1],[5,2],[6,3]]</code> in place.",
          why: "An in-place swap of cells cannot change the number of rows or the length of each row. The result still has 2 rows of 3.",
        },
        {
          id: "b",
          text: "It throws a <code>TypeError</code> when it first reads <code>matrix[2]</code>, which does not exist.",
          why: "With <code>n = 2</code> the loops only visit <code>matrix[0]</code> and <code>matrix[1]</code>, so row 2 is never read.",
        },
        {
          id: "c",
          text: "It returns normally, but the matrix is still 2 × 3 with values in the wrong places.",
          why: "The transpose loop swaps only <code>matrix[0][1]</code> with <code>matrix[1][0]</code>, giving <code>[[1,4,3],[2,5,6]]</code>, and the row reversals then leave <code>[[3,4,1],[6,5,2]]</code>. A rectangle changes shape under rotation, so the usual approach builds a new matrix with the dimensions swapped.",
        },
        {
          id: "d",
          text: "It leaves <code>[[3,2,1],[6,5,4]]</code>, because only the row reversals take effect.",
          why: "The transpose loop does run for <code>r = 0</code> and <code>c = 1</code>, so it swaps one pair before the rows are reversed.",
        },
      ],
      answer: "c",
    },
    {
      id: "mx-order-spiral-pass",
      chapter: "dsa-matrix-problems",
      level: "intermediate",
      skill: "trace",
      pattern: "matrix",
      section: "traversal-direction-the-pattern-behind-spiral-order",
      kind: "order",
      prompt:
        "<p>Put one pass of the <code>while</code> loop in <code>spiralOrder</code> in the order it happens. Start with the loop test and end with the walk up the left column.</p><pre><code>while (top &lt;= bottom &amp;&amp; left &lt;= right) {\n  for (let c = left; c &lt;= right; c++) result.push(matrix[top][c]);\n  top++;\n  for (let r = top; r &lt;= bottom; r++) result.push(matrix[r][right]);\n  right--;\n  if (top &lt;= bottom) {\n    for (let c = right; c &gt;= left; c--) result.push(matrix[bottom][c]);\n    bottom--;\n  }\n  if (left &lt;= right) {\n    for (let r = bottom; r &gt;= top; r--) result.push(matrix[r][left]);\n    left++;\n  }\n}</code></pre>",
      items: [
        {
          id: "test",
          text: "Test <code>top &lt;= bottom &amp;&amp; left &lt;= right</code> to see whether any unvisited cells remain.",
        },
        { id: "top", text: "Walk the top row from left to right, then do <code>top++</code>." },
        { id: "right", text: "Walk the right column from top to bottom, then do <code>right--</code>." },
        {
          id: "bottom",
          text: "If <code>top &lt;= bottom</code>, walk the bottom row from right to left, then do <code>bottom--</code>.",
        },
        {
          id: "left",
          text: "If <code>left &lt;= right</code>, walk the left column from bottom to top, then do <code>left++</code>.",
        },
      ],
      why: "The loop test comes first because it decides whether the pass runs at all. The sides then follow the spiral clockwise: top, right, bottom, left. Each side uses the boundary the previous one just moved. The right column starts at the new <code>top</code>, the bottom row starts at the new <code>right</code>, and the left column starts at the new <code>bottom</code>. The guards on the last two sides are the reason a single row or column is not walked twice.",
    },
    {
      id: "mx-shared-row",
      chapter: "dsa-matrix-problems",
      level: "intermediate",
      skill: "edge-case",
      pattern: "matrix",
      section: "grids-in-javascript-indexing-building-and-the-shared-row-tra",
      kind: "single",
      prompt:
        "<p>After <code>const grid = new Array(2).fill(new Array(2).fill(0)); grid[0][0] = 1;</code>, what does <code>grid</code> hold?</p>",
      choices: [
        {
          id: "a",
          text: "<code>[[1, 0], [0, 0]]</code>",
          why: "That would need two separate row arrays. <code>fill</code> stores the same array reference in every slot.",
        },
        {
          id: "b",
          text: "<code>[[1, 0], [1, 0]]</code>",
          why: "Both slots point at one row array, so writing through <code>grid[0]</code> also shows up in <code>grid[1]</code>.",
        },
        {
          id: "c",
          text: "<code>[[1, 1], [1, 1]]</code>",
          why: "Only the cell at column 0 of the shared row was written. The other cell of the row still holds 0.",
        },
        {
          id: "d",
          text: "It throws a <code>TypeError</code>.",
          why: "Nothing here is undefined: both rows exist, they are just the same array.",
        },
      ],
      answer: "b",
    },
    {
      id: "mx-box-index",
      chapter: "dsa-matrix-problems",
      level: "intermediate",
      skill: "trace",
      pattern: "matrix",
      section: "valid-sudoku-row-column-and-box-in-one-pass",
      kind: "single",
      prompt:
        "<p>In Valid Sudoku the boxes are numbered 0 to 8 in row-major order. Which box number does the cell in row 4, column 7 belong to?</p>",
      choices: [
        {
          id: "a",
          text: "<code>7</code>",
          why: "That is the column number. Box numbers combine the box row and the box column.",
        },
        {
          id: "b",
          text: "<code>4</code>",
          why: "That is the row number, and also the middle box, but the column 7 lies in the right-hand third.",
        },
        {
          id: "c",
          text: "<code>3</code>",
          why: "That is <code>Math.floor(4 / 3) * 3</code> alone. The box column <code>Math.floor(7 / 3)</code>, which is 2, must be added.",
        },
        {
          id: "d",
          text: "<code>5</code>",
          why: "The box row is <code>Math.floor(4 / 3) = 1</code> and the box column is <code>Math.floor(7 / 3) = 2</code>, so the box is <code>1 * 3 + 2 = 5</code>.",
        },
      ],
      answer: "d",
    },
    {
      id: "mx-zeroes-order",
      chapter: "dsa-matrix-problems",
      level: "intermediate",
      skill: "edge-case",
      pattern: "matrix",
      section: "set-matrix-zeroes-the-matrix-stores-its-own-markers",
      kind: "single",
      prompt:
        "<p>In the O(1)-space Set Matrix Zeroes, the first row and first column hold the markers. Which change makes the function return wrong answers?</p>",
      choices: [
        {
          id: "a",
          text: "Applying <code>firstRowZero</code> to the first row before the interior pass.",
          why: "The first row's markers are then all 0, so the interior pass sees a marker for every column and zeroes the whole interior.",
        },
        {
          id: "b",
          text: "Computing the two flags before any marker is written.",
          why: "The flags must be taken before the markers overwrite the first row and column, so this is how it is meant to be done.",
        },
        {
          id: "c",
          text: "Starting both interior passes at row 1 and column 1, not 0.",
          why: "The interior passes must skip the marker cells, so starting at 1 is correct.",
        },
        {
          id: "d",
          text: "Applying the first-row and first-column flags last of all.",
          why: "The markers are no longer needed at that point, so applying the flags last is correct.",
        },
      ],
      answer: "a",
    },
    {
      id: "mx-staircase-search",
      chapter: "dsa-matrix-problems",
      level: "intermediate",
      skill: "recognise",
      pattern: "matrix",
      section: "searching-a-sorted-matrix-three-different-shapes",
      kind: "single",
      prompt:
        "<p>Every row of a matrix is sorted ascending and every column is sorted ascending, but a row does not start above the end of the previous row. Which search finds a target in O(rows + cols)?</p>",
      choices: [
        {
          id: "a",
          text: "Binary search on the flattened index.",
          why: "Flattening only gives a sorted list when each row starts above the previous row's end, which is not promised here.",
        },
        {
          id: "b",
          text: "Start at the top-left cell, moving right when it is too small and down when it is too large.",
          why: "At the top-left both neighbours are larger, so one comparison cannot say which way to go.",
        },
        {
          id: "c",
          text: "Binary search every row.",
          why: "That costs O(rows · log cols), which is more than O(rows + cols) for a large, roughly square matrix.",
        },
        {
          id: "d",
          text: "Start at the top-right, moving left when the cell is too large and down when it is too small.",
          why: "The top-right cell is the largest in its row and the smallest in its column, so each comparison discards a whole column or row.",
        },
      ],
      answer: "d",
    },
    {
      id: "mx-kth-cost",
      chapter: "dsa-matrix-problems",
      level: "intermediate",
      skill: "complexity",
      pattern: "matrix",
      section: "searching-a-sorted-matrix-three-different-shapes",
      kind: "single",
      prompt:
        "<p>Kth Smallest in a Sorted Matrix binary searches on the value, and each step counts the cells that are at most <code>mid</code> with a staircase walk. For an <code>n x n</code> matrix with values between <code>lo</code> and <code>hi</code>, what is the time?</p>",
      choices: [
        {
          id: "a",
          text: "O(n² log n)",
          why: "That is the cost of flattening and sorting the matrix, a different method.",
        },
        {
          id: "b",
          text: "O(n · log(hi - lo))",
          why: "Each count walks at most 2n cells, and the value search takes about log(hi - lo) rounds.",
        },
        {
          id: "c",
          text: "O(log n)",
          why: "Even a single count must look at O(n) cells, so the total cannot be logarithmic in n.",
        },
        {
          id: "d",
          text: "O(k log n)",
          why: "That is the cost of the heap method, which pops k times from a heap holding one cell per row.",
        },
      ],
      answer: "b",
    },
    {
      id: "mx-life-first-scan",
      chapter: "dsa-matrix-problems",
      level: "intermediate",
      skill: "trace",
      pattern: "matrix",
      section: "game-of-life-two-states-in-one-cell",
      kind: "single",
      prompt:
        "<p>Game of Life runs in place with the old state in bit 0 and the new state in bit 1. On the board <code>[[0,1,0],[0,1,0],[0,1,0]]</code>, what does cell (1, 0) hold after the first scan, before the final right shift?</p>",
      choices: [
        {
          id: "a",
          text: "<code>1</code>",
          why: "That value means the cell was alive and dies. Cell (1, 0) was dead.",
        },
        {
          id: "b",
          text: "<code>2</code>",
          why: "The cell was dead and has three live neighbours, so it is born: bit 1 is set and bit 0 is clear.",
        },
        {
          id: "c",
          text: "<code>3</code>",
          why: "That value means the cell was alive and survives. Cell (1, 0) was dead.",
        },
        {
          id: "d",
          text: "<code>0</code>",
          why: "A dead cell stays 0 only if it does not have exactly three live neighbours. This one has three.",
        },
      ],
      answer: "b",
    },
    {
      id: "mx-anti-diagonal-key",
      chapter: "dsa-matrix-problems",
      level: "intermediate",
      skill: "recognise",
      pattern: "matrix",
      section: "diagonals-r-c-names-each-anti-diagonal",
      kind: "single",
      prompt:
        "<p>Which quantity is the same for every cell on one anti-diagonal (the cells that run from the top-right down to the bottom-left)?</p>",
      choices: [
        {
          id: "a",
          text: "<code>r - c</code>",
          why: "That stays constant along a diagonal that runs top-left to bottom-right.",
        },
        {
          id: "b",
          text: "<code>r * c</code>",
          why: "The product changes along any diagonal, so it cannot group cells.",
        },
        {
          id: "c",
          text: "<code>r + c</code>",
          why: "Going down one row and left one column keeps the sum the same, so the sum names the anti-diagonal.",
        },
        {
          id: "d",
          text: "<code>r % c</code>",
          why: "The remainder does not stay fixed along a diagonal and is undefined when c is 0.",
        },
      ],
      answer: "c",
    },
  ],
  pattern: {
    pattern: "matrix",
    chapter: "dsa-matrix-problems",
    signals: [
      "The input is a 2D array and the prompt says spiral, rotate, transpose, diagonal or in place.",
      "The solution keeps four boundaries (top, bottom, left, right) that shrink, or swaps matrix[r][c] with matrix[c][r].",
      "The prompt talks about islands, regions, flood fill or the fewest steps through a grid, so each cell is a node with up to four neighbours.",
      "Single-row, single-column and non-square inputs are expected to break the boundary logic first.",
    ],
    template:
      "<pre><code>while (top &lt;= bottom &amp;&amp; left &lt;= right) { walk top, right, then bottom and left behind their guards; shrink all four }</code></pre>",
    time: "O(rows × cols)",
    space: "O(1) extra for spiral and rotate; O(rows × cols) for a flood-fill stack or queue",
    styles: ["online-assessment", "phone-screen", "onsite"],
  },
};
