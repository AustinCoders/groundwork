import type { Exercise } from "../types";

export const dsaAddMatrixProblems: Exercise[] = [
  {
    "id": "ex-transpose-matrix",
    "chapter": "dsa-matrix-problems",
    "level": "beginner",
    "title": "Transpose Matrix",
    "brief": "<p>The <b>transpose</b> of a matrix swaps its rows and columns: the element at row <code>r</code>, column <code>c</code> moves to row <code>c</code>, column <code>r</code>. Return the transpose of <code>matrix</code> as a new matrix.</p><ul><li>The matrix does <b>not</b> have to be square: a <code>2 x 3</code> matrix becomes <code>3 x 2</code></li><li>Do not modify the input</li><li><code>transpose([[1, 2, 3], [4, 5, 6]])</code> is <code>[[1, 4], [2, 5], [3, 6]]</code></li></ul>",
    "starter": "function transpose(matrix) {\n  // TODO: build a cols x rows result\n}\n",
    "hints": [
      "If the input has R rows and C columns, the result has C rows and R columns.",
      "result[c][r] = matrix[r][c]. Build the result with Array.from so each row is its own array.",
      "Do not use new Array(C).fill(new Array(R)): every row would be the same array."
    ],
    "solution": "function transpose(matrix) {\n  const rows = matrix.length;\n  const cols = matrix[0].length;\n  const result = Array.from({ length: cols }, () => new Array(rows));\n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) result[c][r] = matrix[r][c];\n  }\n  return result;\n}\n",
    "tests": [
      {
        "name": "a rectangular matrix",
        "body": "assert.deepEqual(transpose([[1, 2, 3], [4, 5, 6]]), [[1, 4], [2, 5], [3, 6]]);"
      },
      {
        "name": "a square matrix",
        "body": "assert.deepEqual(transpose([[1, 2, 3], [4, 5, 6], [7, 8, 9]]), [[1, 4, 7], [2, 5, 8], [3, 6, 9]]);"
      },
      {
        "name": "a single row becomes a single column",
        "body": "assert.deepEqual(transpose([[1, 2, 3, 4]]), [[1], [2], [3], [4]]);"
      },
      {
        "name": "a single column becomes a single row",
        "body": "assert.deepEqual(transpose([[1], [2], [3]]), [[1, 2, 3]]);"
      },
      {
        "name": "one cell",
        "body": "assert.deepEqual(transpose([[7]]), [[7]]);"
      },
      {
        "name": "the input is left unchanged",
        "body": "const input = [[1, 2], [3, 4], [5, 6]];\ntranspose(input);\nassert.deepEqual(input, [[1, 2], [3, 4], [5, 6]]);"
      },
      {
        "name": "rows of the result are separate arrays",
        "body": "const result = transpose([[0, 0], [0, 0]]);\nresult[0][0] = 9;\nassert.equal(result[1][0], 0);"
      },
      {
        "name": "transposing twice returns the original",
        "body": "const m = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]];\nassert.deepEqual(transpose(transpose(m)), m);"
      }
    ]
  },
  {
    "id": "ex-rotate-matrix-counterclockwise",
    "chapter": "dsa-matrix-problems",
    "level": "intermediate",
    "title": "Rotate Matrix Counterclockwise",
    "brief": "<p>Given an <code>n x n</code> matrix, rotate it 90&deg; <b>counterclockwise</b>, <b>in place</b>.</p><ul><li>You must modify the matrix you were given; the return value is ignored</li><li>After the rotation, the last column read top-to-bottom is the first row, so <code>[[1, 2], [3, 4]]</code> becomes <code>[[2, 4], [1, 3]]</code></li><li>A <code>1 x 1</code> matrix is unchanged</li><li>Aim for O(1) extra space</li></ul>",
    "starter": "function rotateCounterclockwise(matrix) {\n  // TODO: two in-place steps, like the clockwise rotation but with one step changed\n}\n",
    "hints": [
      "Clockwise is transpose then reverse each row. Which of the two steps changes to turn the other way?",
      "Counterclockwise is transpose then reverse the order of the rows (flip top to bottom), not each row.",
      "Transpose by swapping matrix[r][c] and matrix[c][r] only for c > r. matrix.reverse() reverses the row order in place."
    ],
    "solution": "function rotateCounterclockwise(matrix) {\n  const n = matrix.length;\n  for (let r = 0; r < n; r++) {\n    for (let c = r + 1; c < n; c++) {\n      const tmp = matrix[r][c];\n      matrix[r][c] = matrix[c][r];\n      matrix[c][r] = tmp;\n    }\n  }\n  matrix.reverse();\n}\n",
    "tests": [
      {
        "name": "2x2 rotates in place",
        "body": "const m = [[1, 2], [3, 4]];\nrotateCounterclockwise(m);\nassert.deepEqual(m, [[2, 4], [1, 3]]);"
      },
      {
        "name": "3x3 rotates in place",
        "body": "const m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];\nrotateCounterclockwise(m);\nassert.deepEqual(m, [[3, 6, 9], [2, 5, 8], [1, 4, 7]]);"
      },
      {
        "name": "1x1 is unchanged",
        "body": "const m = [[5]];\nrotateCounterclockwise(m);\nassert.deepEqual(m, [[5]]);"
      },
      {
        "name": "4x4 rotates in place",
        "body": "const m = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]];\nrotateCounterclockwise(m);\nassert.deepEqual(m, [[4, 8, 12, 16], [3, 7, 11, 15], [2, 6, 10, 14], [1, 5, 9, 13]]);"
      },
      {
        "name": "two rotations make a half turn",
        "body": "const m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];\nrotateCounterclockwise(m);\nrotateCounterclockwise(m);\nassert.deepEqual(m, [[9, 8, 7], [6, 5, 4], [3, 2, 1]]);"
      },
      {
        "name": "four rotations return to the start",
        "body": "const m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];\nfor (let i = 0; i < 4; i++) rotateCounterclockwise(m);\nassert.deepEqual(m, [[1, 2, 3], [4, 5, 6], [7, 8, 9]]);"
      },
      {
        "name": "matches the index rule on a larger matrix",
        "body": "const n = 7;\nconst original = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => r * n + c));\nconst m = original.map((row) => row.slice());\nrotateCounterclockwise(m);\nfor (let r = 0; r < n; r++) for (let c = 0; c < n; c++) assert.equal(m[r][c], original[c][n - 1 - r]);"
      }
    ]
  },
  {
    "id": "ex-reshape-the-matrix",
    "chapter": "dsa-matrix-problems",
    "level": "beginner",
    "title": "Reshape the Matrix",
    "brief": "<p>Reshape the matrix <code>mat</code> into a new matrix with <code>r</code> rows and <code>c</code> columns, filling it with the same elements <b>in row-major order</b> (left to right, top to bottom).</p><ul><li>If the reshape is not possible, because <code>r * c</code> differs from the number of elements, return the original <code>mat</code></li><li>Otherwise return a new matrix and leave the input unchanged</li><li><code>matrixReshape([[1, 2], [3, 4]], 1, 4)</code> is <code>[[1, 2, 3, 4]]</code></li></ul>",
    "starter": "function matrixReshape(mat, r, c) {\n  // TODO: walk the old matrix in row-major order and place each value in the new one\n}\n",
    "hints": [
      "First check that mat has exactly r * c elements; if not, return mat.",
      "The k-th element in row-major order of the old matrix is mat[Math.floor(k / oldCols)][k % oldCols].",
      "Place it at result[Math.floor(k / c)][k % c]. One loop over k does the whole job."
    ],
    "solution": "function matrixReshape(mat, r, c) {\n  const rows = mat.length;\n  const cols = mat[0].length;\n  if (rows * cols !== r * c) return mat;\n  const result = Array.from({ length: r }, () => new Array(c));\n  for (let k = 0; k < r * c; k++) {\n    result[Math.floor(k / c)][k % c] = mat[Math.floor(k / cols)][k % cols];\n  }\n  return result;\n}\n",
    "tests": [
      {
        "name": "flatten to one row",
        "body": "assert.deepEqual(matrixReshape([[1, 2], [3, 4]], 1, 4), [[1, 2, 3, 4]]);"
      },
      {
        "name": "an impossible reshape returns the original",
        "body": "assert.deepEqual(matrixReshape([[1, 2], [3, 4]], 2, 4), [[1, 2], [3, 4]]);"
      },
      {
        "name": "the same shape",
        "body": "assert.deepEqual(matrixReshape([[1, 2], [3, 4]], 2, 2), [[1, 2], [3, 4]]);"
      },
      {
        "name": "one row to a grid",
        "body": "assert.deepEqual(matrixReshape([[1, 2, 3, 4, 5, 6]], 3, 2), [[1, 2], [3, 4], [5, 6]]);"
      },
      {
        "name": "one column to a grid",
        "body": "assert.deepEqual(matrixReshape([[1], [2], [3], [4]], 2, 2), [[1, 2], [3, 4]]);"
      },
      {
        "name": "rows of different widths",
        "body": "assert.deepEqual(matrixReshape([[1, 2, 3], [4, 5, 6]], 3, 2), [[1, 2], [3, 4], [5, 6]]);"
      },
      {
        "name": "the input is not modified",
        "body": "const input = [[1, 2], [3, 4]];\nmatrixReshape(input, 4, 1);\nassert.deepEqual(input, [[1, 2], [3, 4]]);"
      },
      {
        "name": "a new matrix has separate rows",
        "body": "const result = matrixReshape([[0, 0, 0, 0]], 2, 2);\nresult[0][0] = 9;\nassert.equal(result[1][0], 0);"
      }
    ]
  },
  {
    "id": "ex-flipping-an-image",
    "chapter": "dsa-matrix-problems",
    "level": "beginner",
    "title": "Flipping an Image",
    "brief": "<p>You are given an <code>n x n</code> binary matrix <code>image</code>. <b>Flip</b> it horizontally (reverse every row), then <b>invert</b> it (every <code>0</code> becomes <code>1</code> and every <code>1</code> becomes <code>0</code>). Return the resulting matrix.</p><ul><li><code>flipAndInvertImage([[1, 1, 0], [1, 0, 1], [0, 0, 0]])</code> is <code>[[1, 0, 0], [0, 1, 0], [1, 1, 1]]</code></li><li>It can be done in a single pass over each row with two pointers</li><li>An empty matrix gives an empty matrix</li></ul>",
    "starter": "function flipAndInvertImage(image) {\n  // TODO: reverse each row and flip every bit\n}\n",
    "hints": [
      "Doing the two steps separately is fine, but you can do both while walking each row from both ends.",
      "For a row, swap image[r][lo] and image[r][hi] and invert both; when lo and hi meet at the middle cell, just invert it.",
      "Inverting a bit is 1 - bit or bit ^ 1. A middle cell must be inverted exactly once."
    ],
    "solution": "function flipAndInvertImage(image) {\n  for (const row of image) {\n    let lo = 0;\n    let hi = row.length - 1;\n    while (lo <= hi) {\n      const left = row[lo] ^ 1;\n      const right = row[hi] ^ 1;\n      row[lo] = right;\n      row[hi] = left;\n      lo++;\n      hi--;\n    }\n  }\n  return image;\n}\n",
    "tests": [
      {
        "name": "the standard example",
        "body": "assert.deepEqual(flipAndInvertImage([[1, 1, 0], [1, 0, 1], [0, 0, 0]]), [[1, 0, 0], [0, 1, 0], [1, 1, 1]]);"
      },
      {
        "name": "a 4x4 example",
        "body": "assert.deepEqual(flipAndInvertImage([[1, 1, 0, 0], [1, 0, 0, 1], [0, 1, 1, 1], [1, 0, 1, 0]]), [[1, 1, 0, 0], [0, 1, 1, 0], [0, 0, 0, 1], [1, 0, 1, 0]]);"
      },
      {
        "name": "one cell",
        "body": "assert.deepEqual(flipAndInvertImage([[0]]), [[1]]);\nassert.deepEqual(flipAndInvertImage([[1]]), [[0]]);"
      },
      {
        "name": "all zeros",
        "body": "assert.deepEqual(flipAndInvertImage([[0, 0], [0, 0]]), [[1, 1], [1, 1]]);"
      },
      {
        "name": "all ones",
        "body": "assert.deepEqual(flipAndInvertImage([[1, 1, 1], [1, 1, 1], [1, 1, 1]]), [[0, 0, 0], [0, 0, 0], [0, 0, 0]]);"
      },
      {
        "name": "an odd-width middle cell is inverted once",
        "body": "assert.deepEqual(flipAndInvertImage([[0, 1, 1]]), [[0, 0, 1]]);\nassert.deepEqual(flipAndInvertImage([[1, 0, 0]]), [[1, 1, 0]]);"
      },
      {
        "name": "an empty image",
        "body": "assert.deepEqual(flipAndInvertImage([]), []);"
      },
      {
        "name": "a row that is its own flip and invert",
        "body": "const result = flipAndInvertImage([[1, 0], [1, 0]]);\nassert.deepEqual(result, [[1, 0], [1, 0]]);"
      }
    ]
  },
  {
    "id": "ex-toeplitz-matrix",
    "chapter": "dsa-matrix-problems",
    "level": "beginner",
    "title": "Toeplitz Matrix",
    "brief": "<p>A matrix is <b>Toeplitz</b> if every diagonal that runs from the top-left to the bottom-right has the same value all along it. Given an <code>m x n</code> matrix, return <code>true</code> if it is Toeplitz and <code>false</code> otherwise.</p><ul><li><code>[[1, 2, 3, 4], [5, 1, 2, 3], [9, 5, 1, 2]]</code> is Toeplitz</li><li>The matrix does not have to be square</li><li>A matrix with one row or one column is always Toeplitz</li></ul>",
    "starter": "function isToeplitzMatrix(matrix) {\n  // TODO: compare each cell with its upper-left neighbour\n}\n",
    "hints": [
      "Cells on the same diagonal differ in position by (+1, +1). Which neighbour of a cell lies on its diagonal?",
      "Every cell (r, c) with r > 0 and c > 0 must equal (r - 1, c - 1). If every such pair matches, every diagonal is constant.",
      "No hash map needed: one pass over the cells, O(m * n) time and O(1) space."
    ],
    "solution": "function isToeplitzMatrix(matrix) {\n  for (let r = 1; r < matrix.length; r++) {\n    for (let c = 1; c < matrix[r].length; c++) {\n      if (matrix[r][c] !== matrix[r - 1][c - 1]) return false;\n    }\n  }\n  return true;\n}\n",
    "tests": [
      {
        "name": "a Toeplitz matrix",
        "body": "assert.equal(isToeplitzMatrix([[1, 2, 3, 4], [5, 1, 2, 3], [9, 5, 1, 2]]), true);"
      },
      {
        "name": "a matrix that is not Toeplitz",
        "body": "assert.equal(isToeplitzMatrix([[1, 2], [2, 2]]), false);"
      },
      {
        "name": "one row",
        "body": "assert.equal(isToeplitzMatrix([[1, 2, 3]]), true);"
      },
      {
        "name": "one column",
        "body": "assert.equal(isToeplitzMatrix([[1], [2], [3]]), true);"
      },
      {
        "name": "one cell",
        "body": "assert.equal(isToeplitzMatrix([[5]]), true);"
      },
      {
        "name": "tall matrix",
        "body": "assert.equal(isToeplitzMatrix([[1, 2], [3, 1], [4, 3], [5, 4]]), true);\nassert.equal(isToeplitzMatrix([[1, 2], [3, 1], [4, 9], [5, 4]]), false);"
      },
      {
        "name": "a wrong cell in the last row",
        "body": "assert.equal(isToeplitzMatrix([[1, 2, 3], [4, 1, 2], [5, 4, 7]]), false);"
      },
      {
        "name": "a constant matrix",
        "body": "assert.equal(isToeplitzMatrix([[7, 7, 7], [7, 7, 7]]), true);"
      }
    ]
  },
  {
    "id": "ex-count-negatives-in-sorted-matrix",
    "chapter": "dsa-matrix-problems",
    "level": "beginner",
    "title": "Count Negative Numbers in a Sorted Matrix",
    "brief": "<p>You are given an <code>m x n</code> matrix <code>grid</code> whose rows are sorted in <b>non-increasing</b> order and whose columns are also sorted in non-increasing order. Return the number of negative numbers in it.</p><ul><li><code>countNegatives([[4, 3, 2, -1], [3, 2, 1, -1], [1, 1, -1, -2], [-1, -1, -2, -3]])</code> is <code>8</code></li><li>Scanning every cell is O(m * n); aim for <b>O(m + n)</b> by walking a staircase from a corner</li><li>The grid may be empty</li></ul>",
    "starter": "function countNegatives(grid) {\n  // TODO: start in a corner where one move goes toward negatives and the other away\n}\n",
    "hints": [
      "Rows and columns both decrease, so once a cell is negative, every cell below it in its column and to its right in its row is negative too.",
      "Start at the top-right cell: it is the smallest value in its row and the largest in its column, so one comparison discards a whole row or column.",
      "If the cell is negative, the whole column from this row down is negative: add rows - r and move left. Otherwise move down. Each step removes a row or a column, so it takes at most rows + cols steps."
    ],
    "solution": "function countNegatives(grid) {\n  if (grid.length === 0) return 0;\n  const rows = grid.length;\n  const cols = grid[0].length;\n  let count = 0;\n  let r = 0;\n  let c = cols - 1;\n  while (r < rows && c >= 0) {\n    if (grid[r][c] < 0) {\n      count += rows - r;\n      c--;\n    } else {\n      r++;\n    }\n  }\n  return count;\n}\n",
    "tests": [
      {
        "name": "the standard example",
        "body": "assert.equal(countNegatives([[4, 3, 2, -1], [3, 2, 1, -1], [1, 1, -1, -2], [-1, -1, -2, -3]]), 8);"
      },
      {
        "name": "no negatives",
        "body": "assert.equal(countNegatives([[3, 2], [1, 0]]), 0);"
      },
      {
        "name": "all negative",
        "body": "assert.equal(countNegatives([[-1, -2], [-3, -4]]), 4);"
      },
      {
        "name": "one row and one column",
        "body": "assert.equal(countNegatives([[5, 1, -1, -3]]), 2);\nassert.equal(countNegatives([[2], [0], [-5]]), 1);"
      },
      {
        "name": "an empty grid",
        "body": "assert.equal(countNegatives([]), 0);"
      },
      {
        "name": "zero is not negative",
        "body": "assert.equal(countNegatives([[0, 0], [0, 0]]), 0);"
      },
      {
        "name": "matches a full scan on a larger sorted grid",
        "body": "const rows = 40;\nconst cols = 55;\nconst grid = Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => 60 - r - c - Math.floor(c / 3)));\nlet expected = 0;\nfor (const row of grid) for (const v of row) if (v < 0) expected++;\nassert.equal(countNegatives(grid), expected);"
      }
    ]
  },
  {
    "id": "ex-kth-smallest-in-sorted-matrix",
    "chapter": "dsa-matrix-problems",
    "level": "advanced",
    "title": "Kth Smallest Element in a Sorted Matrix",
    "brief": "<p>You are given an <code>n x n</code> matrix whose rows and columns are each sorted in <b>ascending</b> order, and an integer <code>k</code>. Return the <code>k</code>-th smallest element in the matrix (counting duplicates, so the k-th in sorted order, not the k-th distinct).</p><ul><li><code>kthSmallest([[1, 5, 9], [10, 11, 13], [12, 13, 15]], 8)</code> is <code>13</code></li><li><code>1 &lt;= k &lt;= n * n</code>. Flattening and sorting costs O(n² log n); do better</li><li>Target: <b>O(n log(max - min))</b> with O(1) extra space, by binary searching on the value</li></ul>",
    "starter": "function kthSmallest(matrix, k) {\n  // TODO: binary search the answer; count cells <= mid with a staircase walk\n}\n",
    "hints": [
      "You cannot index the k-th smallest directly, but you can ask: how many cells are <= x? That count rises with x.",
      "Count cells <= x in O(n): start at the bottom-left; if the cell is <= x, everything above it in its column also is, so add r + 1 and move right; otherwise move up.",
      "Binary search x between the smallest and largest value. If count(mid) >= k the answer is mid or smaller (hi = mid); else lo = mid + 1. At the end lo is a value in the matrix."
    ],
    "solution": "function kthSmallest(matrix, k) {\n  const n = matrix.length;\n  const countAtMost = (limit) => {\n    let count = 0;\n    let r = n - 1;\n    let c = 0;\n    while (r >= 0 && c < n) {\n      if (matrix[r][c] <= limit) {\n        count += r + 1;\n        c++;\n      } else {\n        r--;\n      }\n    }\n    return count;\n  };\n  let lo = matrix[0][0];\n  let hi = matrix[n - 1][n - 1];\n  while (lo < hi) {\n    const mid = Math.floor((lo + hi) / 2);\n    if (countAtMost(mid) >= k) hi = mid;\n    else lo = mid + 1;\n  }\n  return lo;\n}\n",
    "tests": [
      {
        "name": "the standard example",
        "body": "assert.equal(kthSmallest([[1, 5, 9], [10, 11, 13], [12, 13, 15]], 8), 13);"
      },
      {
        "name": "a one-cell matrix",
        "body": "assert.equal(kthSmallest([[-5]], 1), -5);"
      },
      {
        "name": "the smallest and the largest",
        "body": "const m = [[1, 5, 9], [10, 11, 13], [12, 13, 15]];\nassert.equal(kthSmallest(m, 1), 1);\nassert.equal(kthSmallest(m, 9), 15);"
      },
      {
        "name": "duplicates count separately",
        "body": "assert.equal(kthSmallest([[1, 2], [1, 3]], 2), 1);\nassert.equal(kthSmallest([[1, 2], [1, 3]], 3), 2);"
      },
      {
        "name": "all equal values",
        "body": "assert.equal(kthSmallest([[7, 7], [7, 7]], 3), 7);"
      },
      {
        "name": "negative values",
        "body": "assert.equal(kthSmallest([[-5, -4], [-3, -1]], 2), -4);\nassert.equal(kthSmallest([[-9, -3], [-2, 4]], 3), -2);"
      },
      {
        "name": "every k on a generated sorted matrix",
        "body": "const n = 12;\nconst m = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => r * 3 + c * 5 + ((r * c) % 4)));\nconst flat = m.flat().sort((a, b) => a - b);\nfor (let k = 1; k <= n * n; k++) assert.equal(kthSmallest(m, k), flat[k - 1]);"
      }
    ]
  }
];
