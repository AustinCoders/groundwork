import type { Exercise } from "../types";

export const dsaAddGridBfs: Exercise[] = [
  {
    "id": "ex-flood-fill",
    "chapter": "dsa-grid-bfs",
    "level": "beginner",
    "title": "Flood Fill",
    "brief": "<p>An <code>image</code> is a grid of integers, each one a colour. Starting from the pixel at row <code>sr</code>, column <code>sc</code>, repaint every pixel that is connected to it through <b>side</b> neighbours and has the <b>same starting colour</b>, using the new <code>color</code>. Return the image.</p><ul><li>Connected means up, down, left or right. Diagonal neighbours are not connected</li><li>Only pixels with the same colour as the starting pixel are repainted, and a pixel that does not match also blocks the fill</li><li>If the new colour equals the starting colour, nothing changes, and your function must still stop</li><li>The image can be large, for example 300 by 300 pixels of one colour, so a deeply recursive solution can overflow the call stack</li></ul>",
    "starter": "function floodFill(image, sr, sc, color) {\n  // TODO: repaint the connected region, without recursing once per pixel\n}\n",
    "hints": [
      "Remember the colour of the starting pixel before you change anything. Every pixel you repaint must match that remembered colour, not the current colour of the start pixel.",
      "If the new colour is the same as the old one, return straight away. Otherwise a repainted pixel would still match the old colour and you would never run out of pixels to visit.",
      "Use a queue or a stack that you own instead of recursion. Repaint a pixel at the moment you put it in the queue, so the painted colour doubles as the visited mark and no pixel is added twice."
    ],
    "solution": "function floodFill(image, sr, sc, color) {\n  const rows = image.length;\n  const cols = image[0].length;\n  const old = image[sr][sc];\n  if (old === color) return image;\n\n  image[sr][sc] = color;\n  const stack = [[sr, sc]];\n  while (stack.length > 0) {\n    const [r, c] = stack.pop();\n    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {\n      const nr = r + dr;\n      const nc = c + dc;\n      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;\n      if (image[nr][nc] !== old) continue;\n      image[nr][nc] = color;\n      stack.push([nr, nc]);\n    }\n  }\n  return image;\n}\n",
    "tests": [
      {
        "name": "repaints the connected region of the starting colour",
        "body": "assert.deepEqual(floodFill([[1, 1, 1], [1, 1, 0], [1, 0, 1]], 1, 1, 2), [[2, 2, 2], [2, 2, 0], [2, 0, 1]]);"
      },
      {
        "name": "a new colour equal to the old one changes nothing and still stops",
        "body": "assert.deepEqual(floodFill([[0, 0, 0], [0, 0, 0]], 0, 0, 0), [[0, 0, 0], [0, 0, 0]]);"
      },
      {
        "name": "diagonal pixels are not connected",
        "body": "assert.deepEqual(floodFill([[1, 0], [0, 1]], 0, 0, 5), [[5, 0], [0, 1]]);"
      },
      {
        "name": "a single pixel",
        "body": "assert.deepEqual(floodFill([[3]], 0, 0, 9), [[9]]);"
      },
      {
        "name": "a ring is filled but the pixel inside it is not",
        "body": "assert.deepEqual(floodFill([[1, 1, 1], [1, 0, 1], [1, 1, 1]], 0, 0, 2), [[2, 2, 2], [2, 0, 2], [2, 2, 2]]);"
      },
      {
        "name": "a grid with more columns than rows is handled",
        "body": "assert.deepEqual(floodFill([[0, 0, 0, 0, 0], [1, 1, 1, 1, 1]], 1, 4, 7), [[0, 0, 0, 0, 0], [7, 7, 7, 7, 7]]);"
      },
      {
        "name": "a region that curls around a wall is fully repainted",
        "body": "assert.deepEqual(floodFill([[1, 1, 1, 1], [0, 0, 0, 1], [1, 1, 1, 1]], 0, 0, 4), [[4, 4, 4, 4], [0, 0, 0, 4], [4, 4, 4, 4]]);"
      },
      {
        "name": "a 300 by 300 image of one colour does not overflow the stack",
        "body": "const image = Array.from({ length: 300 }, () => new Array(300).fill(0));\nconst out = floodFill(image, 0, 0, 1);\nassert.equal(out.every((row) => row.every((v) => v === 1)), true);"
      }
    ]
  },
  {
    "id": "ex-grid-route",
    "chapter": "dsa-grid-bfs",
    "level": "intermediate",
    "title": "Shortest Route on a Grid",
    "brief": "<p><code>grid</code> holds <code>0</code> for an open cell and <code>1</code> for a wall. Given <code>start</code> and <code>goal</code> as <code>[row, column]</code> pairs, return <b>one shortest route</b> from start to goal as an array of <code>[row, column]</code> cells, including both ends. Return <code>null</code> when there is no route.</p><ul><li>You may move up, down, left or right, never diagonally, and never into a wall</li><li>If start and goal are the same open cell, the route is that one cell</li><li>If start or goal is a wall, there is no route</li><li>When several routes tie for shortest, any one of them is accepted</li></ul>",
    "starter": "function gridRoute(grid, start, goal) {\n  // TODO: BFS that remembers where each cell was reached from, then walk back from the goal\n}\n",
    "hints": [
      "A distance matrix is not enough: you also need to know which cell each cell came from. Store, for every cell, the cell that first reached it.",
      "Because BFS reaches each cell once, every cell has exactly one parent. Start from the goal and follow parents until you reach the start, which is the one cell with no parent.",
      "Pick sentinels that cannot be real cell ids: one value for unseen and a different one for the start. Collect the route goal first, then reverse it before returning."
    ],
    "solution": "function gridRoute(grid, start, goal) {\n  const rows = grid.length;\n  const cols = grid[0].length;\n  const id = (r, c) => r * cols + c;\n  const [sr, sc] = start;\n  const [gr, gc] = goal;\n  if (grid[sr][sc] === 1 || grid[gr][gc] === 1) return null;\n\n  const parent = new Array(rows * cols).fill(-2);\n  parent[id(sr, sc)] = -1;\n  const queue = [id(sr, sc)];\n  let head = 0;\n  while (head < queue.length && parent[id(gr, gc)] === -2) {\n    const cur = queue[head++];\n    const r = Math.floor(cur / cols);\n    const c = cur % cols;\n    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {\n      const nr = r + dr;\n      const nc = c + dc;\n      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;\n      if (grid[nr][nc] === 1 || parent[id(nr, nc)] !== -2) continue;\n      parent[id(nr, nc)] = cur;\n      queue.push(id(nr, nc));\n    }\n  }\n  if (parent[id(gr, gc)] === -2) return null;\n\n  const route = [];\n  for (let at = id(gr, gc); at !== -1; at = parent[at]) {\n    route.push([Math.floor(at / cols), at % cols]);\n  }\n  return route.reverse();\n}\n",
    "tests": [
      {
        "name": "finds the single shortest route through a maze",
        "body": "function checkRoute(grid, start, goal, route, moves) {\n  assert.ok(Array.isArray(route), \"expected a route\");\n  assert.deepEqual(route[0], start);\n  assert.deepEqual(route[route.length - 1], goal);\n  assert.equal(route.length, moves + 1, \"the route should have \" + (moves + 1) + \" cells\");\n  for (let i = 0; i < route.length; i++) {\n    const [r, c] = route[i];\n    assert.equal(grid[r][c], 0, \"the route enters a wall at \" + r + \",\" + c);\n    if (i > 0) {\n      const step = Math.abs(r - route[i - 1][0]) + Math.abs(c - route[i - 1][1]);\n      assert.equal(step, 1, \"cells \" + (i - 1) + \" and \" + i + \" are not neighbours\");\n    }\n  }\n}\nconst grid = [[0, 0, 0, 1, 0], [0, 1, 0, 1, 0], [0, 1, 0, 0, 0], [0, 0, 0, 1, 0]];\ncheckRoute(grid, [0, 0], [3, 4], gridRoute(grid, [0, 0], [3, 4]), 7);"
      },
      {
        "name": "start equal to goal is a route of one cell",
        "body": "assert.deepEqual(gridRoute([[0, 0], [0, 0]], [1, 1], [1, 1]), [[1, 1]]);"
      },
      {
        "name": "returns null when a wall closes the way",
        "body": "assert.equal(gridRoute([[0, 1, 0], [0, 1, 0], [0, 1, 0]], [0, 0], [0, 2]), null);"
      },
      {
        "name": "returns null when the start is a wall",
        "body": "assert.equal(gridRoute([[1, 0], [0, 0]], [0, 0], [1, 1]), null);"
      },
      {
        "name": "returns null when the goal is a wall",
        "body": "assert.equal(gridRoute([[0, 0], [0, 1]], [0, 0], [1, 1]), null);"
      },
      {
        "name": "a corridor one cell wide",
        "body": "function checkRoute(grid, start, goal, route, moves) {\n  assert.ok(Array.isArray(route), \"expected a route\");\n  assert.deepEqual(route[0], start);\n  assert.deepEqual(route[route.length - 1], goal);\n  assert.equal(route.length, moves + 1, \"the route should have \" + (moves + 1) + \" cells\");\n  for (let i = 0; i < route.length; i++) {\n    const [r, c] = route[i];\n    assert.equal(grid[r][c], 0, \"the route enters a wall at \" + r + \",\" + c);\n    if (i > 0) {\n      const step = Math.abs(r - route[i - 1][0]) + Math.abs(c - route[i - 1][1]);\n      assert.equal(step, 1, \"cells \" + (i - 1) + \" and \" + i + \" are not neighbours\");\n    }\n  }\n}\nconst grid = [[0, 0, 0, 0, 0, 0]];\ncheckRoute(grid, [0, 5], [0, 0], gridRoute(grid, [0, 5], [0, 0]), 5);"
      },
      {
        "name": "an open grid takes the Manhattan distance",
        "body": "function checkRoute(grid, start, goal, route, moves) {\n  assert.ok(Array.isArray(route), \"expected a route\");\n  assert.deepEqual(route[0], start);\n  assert.deepEqual(route[route.length - 1], goal);\n  assert.equal(route.length, moves + 1, \"the route should have \" + (moves + 1) + \" cells\");\n  for (let i = 0; i < route.length; i++) {\n    const [r, c] = route[i];\n    assert.equal(grid[r][c], 0, \"the route enters a wall at \" + r + \",\" + c);\n    if (i > 0) {\n      const step = Math.abs(r - route[i - 1][0]) + Math.abs(c - route[i - 1][1]);\n      assert.equal(step, 1, \"cells \" + (i - 1) + \" and \" + i + \" are not neighbours\");\n    }\n  }\n}\nconst grid = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];\ncheckRoute(grid, [0, 0], [2, 2], gridRoute(grid, [0, 0], [2, 2]), 4);"
      },
      {
        "name": "matches a brute-force distance on random grids",
        "body": "function checkRoute(grid, start, goal, route, moves) {\n  assert.ok(Array.isArray(route), \"expected a route\");\n  assert.deepEqual(route[0], start);\n  assert.deepEqual(route[route.length - 1], goal);\n  assert.equal(route.length, moves + 1, \"the route should have \" + (moves + 1) + \" cells\");\n  for (let i = 0; i < route.length; i++) {\n    const [r, c] = route[i];\n    assert.equal(grid[r][c], 0, \"the route enters a wall at \" + r + \",\" + c);\n    if (i > 0) {\n      const step = Math.abs(r - route[i - 1][0]) + Math.abs(c - route[i - 1][1]);\n      assert.equal(step, 1, \"cells \" + (i - 1) + \" and \" + i + \" are not neighbours\");\n    }\n  }\n}\nlet seed = 12345;\nfunction rand() {\n  seed = (seed * 1664525 + 1013904223) >>> 0;\n  return seed / 4294967296;\n}\nfunction randInt(n) {\n  return Math.floor(rand() * n);\n}\nfunction bruteDistances(open, sources, dirs) {\n  const R = open.length, C = open[0].length;\n  const d = open.map((row) => row.map(() => 1e9));\n  for (const [r, c] of sources) d[r][c] = 0;\n  let changed = true;\n  while (changed) {\n    changed = false;\n    for (let r = 0; r < R; r++) {\n      for (let c = 0; c < C; c++) {\n        if (!open[r][c]) continue;\n        for (const [dr, dc] of dirs) {\n          const nr = r + dr, nc = c + dc;\n          if (nr < 0 || nr >= R || nc < 0 || nc >= C || !open[nr][nc]) continue;\n          if (d[nr][nc] + 1 < d[r][c]) {\n            d[r][c] = d[nr][nc] + 1;\n            changed = true;\n          }\n        }\n      }\n    }\n  }\n  return d;\n}\nconst SIDES = [[-1, 0], [1, 0], [0, -1], [0, 1]];\nfor (let round = 0; round < 60; round++) {\n  const R = 1 + randInt(6), C = 1 + randInt(6);\n  const grid = Array.from({ length: R }, () => Array.from({ length: C }, () => (rand() < 0.3 ? 1 : 0)));\n  const start = [randInt(R), randInt(C)], goal = [randInt(R), randInt(C)];\n  const open = grid.map((row) => row.map((v) => v === 0));\n  const dist = open[start[0]][start[1]] ? bruteDistances(open, [start], SIDES)[goal[0]][goal[1]] : 1e9;\n  const route = gridRoute(grid, start, goal);\n  if (!open[goal[0]][goal[1]] || dist >= 1e9) assert.equal(route, null);\n  else checkRoute(grid, start, goal, route, dist);\n}"
      }
    ]
  },
  {
    "id": "ex-nearest-exit-maze",
    "chapter": "dsa-grid-bfs",
    "level": "intermediate",
    "title": "Nearest Exit from Entrance in Maze",
    "brief": "<p><code>maze</code> is a grid of strings: <code>\".\"</code> is an empty cell and <code>\"+\"</code> is a wall. <code>entrance</code> is an <code>[row, column]</code> pair naming an empty cell. In one step you move up, down, left or right into an empty cell.</p><p>An <b>exit</b> is an empty cell on the border of the maze. The entrance, even when it is on the border, does <b>not</b> count as an exit. Return the number of steps to the nearest exit, or <code>-1</code> if there is none.</p>",
    "starter": "function nearestExit(maze, entrance) {\n  // TODO: BFS from the entrance; the first border cell you reach is the answer\n}\n",
    "hints": [
      "Run a BFS from the entrance and count steps layer by layer. The first exit you reach is the nearest, because BFS reaches cells in order of distance.",
      "Mark the entrance as seen before the loop. Otherwise a start on the border looks like an exit at distance 0.",
      "Test for a border cell when you discover a neighbour that is empty and unseen. The steps taken to reach that neighbour is the answer to return."
    ],
    "solution": "function nearestExit(maze, entrance) {\n  const rows = maze.length;\n  const cols = maze[0].length;\n  const seen = Array.from({ length: rows }, () => new Array(cols).fill(false));\n  seen[entrance[0]][entrance[1]] = true;\n  let layer = [entrance];\n  let steps = 0;\n  while (layer.length > 0) {\n    steps++;\n    const next = [];\n    for (const [r, c] of layer) {\n      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {\n        const nr = r + dr;\n        const nc = c + dc;\n        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;\n        if (maze[nr][nc] === \"+\" || seen[nr][nc]) continue;\n        if (nr === 0 || nr === rows - 1 || nc === 0 || nc === cols - 1) return steps;\n        seen[nr][nc] = true;\n        next.push([nr, nc]);\n      }\n    }\n    layer = next;\n  }\n  return -1;\n}\n",
    "tests": [
      {
        "name": "the exit is one step away",
        "body": "assert.equal(nearestExit([[\"+\", \"+\", \".\", \"+\"], [\".\", \".\", \".\", \"+\"], [\"+\", \"+\", \"+\", \".\"]], [1, 2]), 1);"
      },
      {
        "name": "the entrance on the border is not an exit",
        "body": "assert.equal(nearestExit([[\"+\", \"+\", \"+\"], [\".\", \".\", \".\"], [\"+\", \"+\", \"+\"]], [1, 0]), 2);"
      },
      {
        "name": "a maze with no exit",
        "body": "assert.equal(nearestExit([[\".\", \"+\"]], [0, 0]), -1);"
      },
      {
        "name": "a closed room has no exit",
        "body": "assert.equal(nearestExit([[\"+\", \"+\", \"+\"], [\"+\", \".\", \"+\"], [\"+\", \"+\", \"+\"]], [1, 1]), -1);"
      },
      {
        "name": "a single row, entrance in the middle",
        "body": "assert.equal(nearestExit([[\".\", \".\", \".\"]], [0, 1]), 1);"
      },
      {
        "name": "two routes of the same length reach the only exit",
        "body": "const maze = [[\"+\", \"+\", \"+\", \"+\", \"+\", \"+\", \"+\"], [\"+\", \".\", \".\", \".\", \".\", \".\", \"+\"], [\"+\", \".\", \"+\", \"+\", \"+\", \".\", \"+\"], [\"+\", \".\", \".\", \".\", \".\", \".\", \".\"], [\"+\", \"+\", \"+\", \"+\", \"+\", \"+\", \"+\"]];\nassert.equal(nearestExit(maze, [1, 1]), 7);"
      },
      {
        "name": "a winding corridor to a bottom-row exit",
        "body": "const maze = [[\"+\", \"+\", \"+\", \"+\", \"+\", \"+\"], [\"+\", \".\", \".\", \".\", \".\", \"+\"], [\"+\", \".\", \"+\", \"+\", \".\", \"+\"], [\"+\", \".\", \"+\", \".\", \".\", \"+\"], [\"+\", \"+\", \"+\", \"+\", \".\", \".\"]];\nassert.equal(nearestExit(maze, [1, 1]), 6);"
      },
      {
        "name": "matches a brute-force distance on random mazes",
        "body": "let seed = 12345;\nfunction rand() {\n  seed = (seed * 1664525 + 1013904223) >>> 0;\n  return seed / 4294967296;\n}\nfunction randInt(n) {\n  return Math.floor(rand() * n);\n}\nfunction bruteDistances(open, sources, dirs) {\n  const R = open.length, C = open[0].length;\n  const d = open.map((row) => row.map(() => 1e9));\n  for (const [r, c] of sources) d[r][c] = 0;\n  let changed = true;\n  while (changed) {\n    changed = false;\n    for (let r = 0; r < R; r++) {\n      for (let c = 0; c < C; c++) {\n        if (!open[r][c]) continue;\n        for (const [dr, dc] of dirs) {\n          const nr = r + dr, nc = c + dc;\n          if (nr < 0 || nr >= R || nc < 0 || nc >= C || !open[nr][nc]) continue;\n          if (d[nr][nc] + 1 < d[r][c]) {\n            d[r][c] = d[nr][nc] + 1;\n            changed = true;\n          }\n        }\n      }\n    }\n  }\n  return d;\n}\nconst SIDES = [[-1, 0], [1, 0], [0, -1], [0, 1]];\nfor (let round = 0; round < 60; round++) {\n  const R = 2 + randInt(5), C = 2 + randInt(5);\n  const maze = Array.from({ length: R }, () => Array.from({ length: C }, () => (rand() < 0.35 ? \"+\" : \".\")));\n  const cells = [];\n  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (maze[r][c] === \".\") cells.push([r, c]);\n  if (cells.length === 0) continue;\n  const entrance = cells[randInt(cells.length)];\n  const open = maze.map((row) => row.map((v) => v === \".\"));\n  const d = bruteDistances(open, [entrance], SIDES);\n  let best = 1e9;\n  for (const [r, c] of cells) {\n    const border = r === 0 || c === 0 || r === R - 1 || c === C - 1;\n    if (border && !(r === entrance[0] && c === entrance[1])) best = Math.min(best, d[r][c]);\n  }\n  assert.equal(nearestExit(maze, entrance), best >= 1e9 ? -1 : best);\n}"
      }
    ]
  },
  {
    "id": "ex-walls-and-gates",
    "chapter": "dsa-grid-bfs",
    "level": "intermediate",
    "title": "Walls and Gates",
    "brief": "<p><code>rooms</code> is a grid of integers: <code>-1</code> is a wall, <code>0</code> is a gate, and <code>2147483647</code> (call it <code>INF</code>) is an empty room. Fill each empty room with the number of steps to its <b>nearest gate</b>. A room that no gate can reach stays <code>INF</code>.</p><ul><li>Moves are up, down, left and right, and walls cannot be crossed</li><li>Modify <code>rooms</code> in place and return it</li><li>There can be many gates. Aim for time proportional to the number of cells, not to the number of gates times the number of cells</li></ul>",
    "starter": "function wallsAndGates(rooms) {\n  // TODO: put every gate in the queue first, then run one BFS\n}\n",
    "hints": [
      "Running a BFS from each gate and taking the minimum works but is slow. Think about what changes if all the gates start in the same queue.",
      "Put every gate in the queue at distance 0 before the loop begins. Then the queue holds two consecutive distances at any moment, exactly as in a single-source BFS.",
      "A room that still holds INF has not been reached. Use that as the visited test, and write the new distance into the room as you queue it."
    ],
    "solution": "function wallsAndGates(rooms) {\n  const INF = 2147483647;\n  const rows = rooms.length;\n  if (rows === 0) return rooms;\n  const cols = rooms[0].length;\n  const queue = [];\n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) {\n      if (rooms[r][c] === 0) queue.push([r, c]);\n    }\n  }\n  let head = 0;\n  while (head < queue.length) {\n    const [r, c] = queue[head++];\n    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {\n      const nr = r + dr;\n      const nc = c + dc;\n      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;\n      if (rooms[nr][nc] !== INF) continue;\n      rooms[nr][nc] = rooms[r][c] + 1;\n      queue.push([nr, nc]);\n    }\n  }\n  return rooms;\n}\n",
    "tests": [
      {
        "name": "fills the classic example",
        "body": "const INF = 2147483647;\nconst rooms = [[INF, -1, 0, INF], [INF, INF, INF, -1], [INF, -1, INF, -1], [0, -1, INF, INF]];\nassert.deepEqual(wallsAndGates(rooms), [[3, -1, 0, 1], [2, 2, 1, -1], [1, -1, 2, -1], [0, -1, 3, 4]]);"
      },
      {
        "name": "with no gate every room stays INF",
        "body": "const INF = 2147483647;\nassert.deepEqual(wallsAndGates([[INF, INF], [INF, INF]]), [[INF, INF], [INF, INF]]);"
      },
      {
        "name": "an empty grid is returned unchanged",
        "body": "assert.deepEqual(wallsAndGates([]), []);"
      },
      {
        "name": "a room closed in by walls stays INF",
        "body": "const INF = 2147483647;\nassert.deepEqual(wallsAndGates([[0, -1, INF], [-1, -1, INF], [INF, INF, INF]]), [[0, -1, INF], [-1, -1, INF], [INF, INF, INF]]);"
      },
      {
        "name": "two gates meet in the middle of a row",
        "body": "const INF = 2147483647;\nassert.deepEqual(wallsAndGates([[0, INF, INF, INF, 0]]), [[0, 1, 2, 1, 0]]);"
      },
      {
        "name": "a single gate",
        "body": "assert.deepEqual(wallsAndGates([[0]]), [[0]]);"
      },
      {
        "name": "a grid of walls and gates only",
        "body": "assert.deepEqual(wallsAndGates([[0, -1], [-1, 0]]), [[0, -1], [-1, 0]]);"
      },
      {
        "name": "the grid is modified in place",
        "body": "const INF = 2147483647;\nconst rooms = [[0, INF]];\nconst out = wallsAndGates(rooms);\nassert.equal(out, rooms);\nassert.equal(rooms[0][1], 1);"
      },
      {
        "name": "matches a brute-force distance on random grids",
        "body": "let seed = 12345;\nfunction rand() {\n  seed = (seed * 1664525 + 1013904223) >>> 0;\n  return seed / 4294967296;\n}\nfunction randInt(n) {\n  return Math.floor(rand() * n);\n}\nfunction bruteDistances(open, sources, dirs) {\n  const R = open.length, C = open[0].length;\n  const d = open.map((row) => row.map(() => 1e9));\n  for (const [r, c] of sources) d[r][c] = 0;\n  let changed = true;\n  while (changed) {\n    changed = false;\n    for (let r = 0; r < R; r++) {\n      for (let c = 0; c < C; c++) {\n        if (!open[r][c]) continue;\n        for (const [dr, dc] of dirs) {\n          const nr = r + dr, nc = c + dc;\n          if (nr < 0 || nr >= R || nc < 0 || nc >= C || !open[nr][nc]) continue;\n          if (d[nr][nc] + 1 < d[r][c]) {\n            d[r][c] = d[nr][nc] + 1;\n            changed = true;\n          }\n        }\n      }\n    }\n  }\n  return d;\n}\nconst SIDES = [[-1, 0], [1, 0], [0, -1], [0, 1]];\nconst INF = 2147483647;\nfor (let round = 0; round < 60; round++) {\n  const R = 1 + randInt(6), C = 1 + randInt(6);\n  const rooms = Array.from({ length: R }, () => Array.from({ length: C }, () => { const x = rand(); return x < 0.2 ? -1 : x < 0.35 ? 0 : INF; }));\n  const open = rooms.map((row) => row.map((v) => v !== -1));\n  const gates = [];\n  rooms.forEach((row, r) => row.forEach((v, c) => { if (v === 0) gates.push([r, c]); }));\n  const d = bruteDistances(open, gates, SIDES);\n  const expected = rooms.map((row, r) => row.map((v, c) => (v === -1 ? -1 : d[r][c] >= 1e9 ? INF : d[r][c])));\n  assert.deepEqual(wallsAndGates(rooms), expected);\n}"
      }
    ]
  },
  {
    "id": "ex-zero-one-matrix",
    "chapter": "dsa-grid-bfs",
    "level": "intermediate",
    "title": "01 Matrix",
    "brief": "<p><code>mat</code> is a grid of <code>0</code> and <code>1</code>, with at least one <code>0</code>. Return a new grid of the same size in which each cell holds the distance to the <b>nearest 0</b>, measured in steps up, down, left or right. A cell that is itself <code>0</code> has distance 0.</p><ul><li>Do not change the input</li><li>The grid can hold tens of thousands of cells, so running a search from every <code>1</code> is too slow</li></ul>",
    "starter": "function updateMatrix(mat) {\n  // TODO: start from every 0 at once and spread outward\n}\n",
    "hints": [
      "Ask the question from the other side: instead of each 1 looking for a 0, let every 0 reach out to the 1s.",
      "Put all the zeros in the queue with distance 0 and run a single BFS. A cell is first reached by its nearest zero.",
      "Use a fresh matrix filled with -1 as both the answer and the seen marker. Zeros start at 0; set each 1 when you first reach it, at the distance of the cell you came from plus one."
    ],
    "solution": "function updateMatrix(mat) {\n  const rows = mat.length;\n  const cols = mat[0].length;\n  const dist = Array.from({ length: rows }, () => new Array(cols).fill(-1));\n  const queue = [];\n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) {\n      if (mat[r][c] === 0) {\n        dist[r][c] = 0;\n        queue.push([r, c]);\n      }\n    }\n  }\n  let head = 0;\n  while (head < queue.length) {\n    const [r, c] = queue[head++];\n    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {\n      const nr = r + dr;\n      const nc = c + dc;\n      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;\n      if (dist[nr][nc] !== -1) continue;\n      dist[nr][nc] = dist[r][c] + 1;\n      queue.push([nr, nc]);\n    }\n  }\n  return dist;\n}\n",
    "tests": [
      {
        "name": "zeros around a single one",
        "body": "assert.deepEqual(updateMatrix([[0, 0, 0], [0, 1, 0], [0, 0, 0]]), [[0, 0, 0], [0, 1, 0], [0, 0, 0]]);"
      },
      {
        "name": "a bottom row of ones",
        "body": "assert.deepEqual(updateMatrix([[0, 0, 0], [0, 1, 0], [1, 1, 1]]), [[0, 0, 0], [0, 1, 0], [1, 2, 1]]);"
      },
      {
        "name": "a single zero",
        "body": "assert.deepEqual(updateMatrix([[0]]), [[0]]);"
      },
      {
        "name": "a row with one zero at the left",
        "body": "assert.deepEqual(updateMatrix([[0, 1, 1, 1]]), [[0, 1, 2, 3]]);"
      },
      {
        "name": "a column with one zero at the bottom",
        "body": "assert.deepEqual(updateMatrix([[1], [1], [0]]), [[2], [1], [0]]);"
      },
      {
        "name": "two zeros meet in the middle",
        "body": "assert.deepEqual(updateMatrix([[0, 1, 1, 1, 0]]), [[0, 1, 2, 1, 0]]);"
      },
      {
        "name": "a grid of zeros stays all zeros",
        "body": "assert.deepEqual(updateMatrix([[0, 0], [0, 0]]), [[0, 0], [0, 0]]);"
      },
      {
        "name": "the input is not changed",
        "body": "const mat = [[0, 1], [1, 1]];\nupdateMatrix(mat);\nassert.deepEqual(mat, [[0, 1], [1, 1]]);"
      },
      {
        "name": "a lone zero in the corner of a larger grid",
        "body": "const out = updateMatrix([[1, 1, 1], [1, 1, 1], [1, 1, 0]]);\nassert.deepEqual(out, [[4, 3, 2], [3, 2, 1], [2, 1, 0]]);"
      },
      {
        "name": "matches a brute-force distance on random grids",
        "body": "let seed = 12345;\nfunction rand() {\n  seed = (seed * 1664525 + 1013904223) >>> 0;\n  return seed / 4294967296;\n}\nfunction randInt(n) {\n  return Math.floor(rand() * n);\n}\nfunction bruteDistances(open, sources, dirs) {\n  const R = open.length, C = open[0].length;\n  const d = open.map((row) => row.map(() => 1e9));\n  for (const [r, c] of sources) d[r][c] = 0;\n  let changed = true;\n  while (changed) {\n    changed = false;\n    for (let r = 0; r < R; r++) {\n      for (let c = 0; c < C; c++) {\n        if (!open[r][c]) continue;\n        for (const [dr, dc] of dirs) {\n          const nr = r + dr, nc = c + dc;\n          if (nr < 0 || nr >= R || nc < 0 || nc >= C || !open[nr][nc]) continue;\n          if (d[nr][nc] + 1 < d[r][c]) {\n            d[r][c] = d[nr][nc] + 1;\n            changed = true;\n          }\n        }\n      }\n    }\n  }\n  return d;\n}\nconst SIDES = [[-1, 0], [1, 0], [0, -1], [0, 1]];\nfor (let round = 0; round < 60; round++) {\n  const R = 1 + randInt(6), C = 1 + randInt(6);\n  const mat = Array.from({ length: R }, () => Array.from({ length: C }, () => (rand() < 0.3 ? 0 : 1)));\n  const zeros = [];\n  mat.forEach((row, r) => row.forEach((v, c) => { if (v === 0) zeros.push([r, c]); }));\n  if (zeros.length === 0) continue;\n  const everyCell = mat.map((row) => row.map(() => true));\n  assert.deepEqual(updateMatrix(mat), bruteDistances(everyCell, zeros, SIDES));\n}"
      }
    ]
  },
  {
    "id": "ex-as-far-from-land",
    "chapter": "dsa-grid-bfs",
    "level": "intermediate",
    "title": "As Far from Land as Possible",
    "brief": "<p><code>grid</code> is a square grid of <code>0</code> (water) and <code>1</code> (land). Find a water cell whose distance to the <b>nearest land cell</b> is as large as possible, and return that distance. Distance is the number of steps up, down, left or right.</p><ul><li>If the grid has no water, or no land, return <code>-1</code></li><li>Do not run a separate search for every water cell</li></ul>",
    "starter": "function maxDistance(grid) {\n  // TODO: every land cell is a source; the last layer BFS reaches is the answer\n}\n",
    "hints": [
      "The question is about each water cell's nearest land cell, so land cells are the sources. Search outward from all of them together.",
      "Process the queue one layer at a time, as in Rotting Oranges. The number of the last layer that still reached a new water cell is the largest distance.",
      "Check the two impossible inputs first: no land at all, and no water at all. Both return -1 before any search starts."
    ],
    "solution": "function maxDistance(grid) {\n  const rows = grid.length;\n  const cols = grid[0].length;\n  const seen = Array.from({ length: rows }, () => new Array(cols).fill(false));\n  let layer = [];\n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) {\n      if (grid[r][c] === 1) {\n        seen[r][c] = true;\n        layer.push([r, c]);\n      }\n    }\n  }\n  if (layer.length === 0 || layer.length === rows * cols) return -1;\n\n  let distance = -1;\n  while (layer.length > 0) {\n    distance++;\n    const next = [];\n    for (const [r, c] of layer) {\n      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {\n        const nr = r + dr;\n        const nc = c + dc;\n        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;\n        if (seen[nr][nc]) continue;\n        seen[nr][nc] = true;\n        next.push([nr, nc]);\n      }\n    }\n    layer = next;\n  }\n  return distance;\n}\n",
    "tests": [
      {
        "name": "water in the middle of four corners of land",
        "body": "assert.equal(maxDistance([[1, 0, 1], [0, 0, 0], [1, 0, 1]]), 2);"
      },
      {
        "name": "one land cell in a corner",
        "body": "assert.equal(maxDistance([[1, 0, 0], [0, 0, 0], [0, 0, 0]]), 4);"
      },
      {
        "name": "all land",
        "body": "assert.equal(maxDistance([[1, 1], [1, 1]]), -1);"
      },
      {
        "name": "all water",
        "body": "assert.equal(maxDistance([[0, 0], [0, 0]]), -1);"
      },
      {
        "name": "a single water cell",
        "body": "assert.equal(maxDistance([[0]]), -1);"
      },
      {
        "name": "a single land cell",
        "body": "assert.equal(maxDistance([[1]]), -1);"
      },
      {
        "name": "one land cell and one water cell",
        "body": "assert.equal(maxDistance([[1, 0], [1, 1]]), 1);"
      },
      {
        "name": "a larger grid with land only along the left column",
        "body": "const grid = Array.from({ length: 5 }, () => [1, 0, 0, 0, 0]);\nassert.equal(maxDistance(grid), 4);"
      },
      {
        "name": "matches a brute-force distance on random grids",
        "body": "let seed = 12345;\nfunction rand() {\n  seed = (seed * 1664525 + 1013904223) >>> 0;\n  return seed / 4294967296;\n}\nfunction randInt(n) {\n  return Math.floor(rand() * n);\n}\nfunction bruteDistances(open, sources, dirs) {\n  const R = open.length, C = open[0].length;\n  const d = open.map((row) => row.map(() => 1e9));\n  for (const [r, c] of sources) d[r][c] = 0;\n  let changed = true;\n  while (changed) {\n    changed = false;\n    for (let r = 0; r < R; r++) {\n      for (let c = 0; c < C; c++) {\n        if (!open[r][c]) continue;\n        for (const [dr, dc] of dirs) {\n          const nr = r + dr, nc = c + dc;\n          if (nr < 0 || nr >= R || nc < 0 || nc >= C || !open[nr][nc]) continue;\n          if (d[nr][nc] + 1 < d[r][c]) {\n            d[r][c] = d[nr][nc] + 1;\n            changed = true;\n          }\n        }\n      }\n    }\n  }\n  return d;\n}\nconst SIDES = [[-1, 0], [1, 0], [0, -1], [0, 1]];\nfor (let round = 0; round < 60; round++) {\n  const n = 1 + randInt(6);\n  const grid = Array.from({ length: n }, () => Array.from({ length: n }, () => (rand() < 0.2 ? 1 : 0)));\n  const land = [];\n  grid.forEach((row, r) => row.forEach((v, c) => { if (v === 1) land.push([r, c]); }));\n  let expected = -1;\n  if (land.length > 0 && land.length < n * n) {\n    const d = bruteDistances(grid.map((row) => row.map(() => true)), land, SIDES);\n    expected = 0;\n    for (const row of d) for (const v of row) expected = Math.max(expected, v);\n  }\n  assert.equal(maxDistance(grid), expected);\n}"
      }
    ]
  },
  {
    "id": "ex-open-the-lock",
    "chapter": "dsa-grid-bfs",
    "level": "intermediate",
    "title": "Open the Lock",
    "brief": "<p>A lock has four wheels, each showing a digit from <code>0</code> to <code>9</code>. A move turns one wheel one step up or down, and the wheel wraps: <code>9</code> becomes <code>0</code> going up and <code>0</code> becomes <code>9</code> going down. The lock starts at <code>\"0000\"</code>.</p><p><code>deadends</code> lists combinations that jam the lock: if you reach one, you can turn no more wheels. Return the fewest moves needed to show <code>target</code>, or <code>-1</code> if it cannot be reached.</p><ul><li>If <code>\"0000\"</code> is itself a dead end, the answer is <code>-1</code></li><li>The state is a four-character string. There are only 10,000 of them</li></ul>",
    "starter": "function openLock(deadends, target) {\n  // TODO: BFS over four-digit strings, never entering a dead end\n}\n",
    "hints": [
      "The graph has 10,000 nodes, one per combination, and every node has 8 neighbours: each of the four wheels turned up or down. You never need to write the graph out; generate neighbours on demand.",
      "Treat a dead end as a state you are never allowed to queue. Put the dead ends in a Set and skip them, and check the start itself first.",
      "Build a neighbour by replacing one character: state.slice(0, i) + newDigit + state.slice(i + 1). A wheel moving down from d goes to (d + 9) % 10."
    ],
    "solution": "function openLock(deadends, target) {\n  const dead = new Set(deadends);\n  if (dead.has(\"0000\")) return -1;\n  const dist = new Map([[\"0000\", 0]]);\n  const queue = [\"0000\"];\n  let head = 0;\n  while (head < queue.length) {\n    const state = queue[head++];\n    if (state === target) return dist.get(state);\n    for (let i = 0; i < 4; i++) {\n      const digit = Number(state[i]);\n      for (const turn of [1, 9]) {\n        const next = state.slice(0, i) + ((digit + turn) % 10) + state.slice(i + 1);\n        if (dead.has(next) || dist.has(next)) continue;\n        dist.set(next, dist.get(state) + 1);\n        queue.push(next);\n      }\n    }\n  }\n  return -1;\n}\n",
    "tests": [
      {
        "name": "avoids the dead ends on the way to 0202",
        "body": "assert.equal(openLock([\"0201\", \"0101\", \"0102\", \"1212\", \"2002\"], \"0202\"), 6);"
      },
      {
        "name": "one wheel, one move, around the wrap",
        "body": "assert.equal(openLock([\"8888\"], \"0009\"), 1);"
      },
      {
        "name": "a target walled in by eight dead ends is unreachable",
        "body": "assert.equal(openLock([\"8887\", \"8889\", \"8878\", \"8898\", \"8788\", \"8988\", \"7888\", \"9888\"], \"8888\"), -1);"
      },
      {
        "name": "a dead start jams the lock",
        "body": "assert.equal(openLock([\"0000\"], \"8888\"), -1);"
      },
      {
        "name": "the target is the start",
        "body": "assert.equal(openLock([], \"0000\"), 0);"
      },
      {
        "name": "the target is a dead end",
        "body": "assert.equal(openLock([\"1111\"], \"1111\"), -1);"
      },
      {
        "name": "no dead ends: each wheel takes the shorter way round",
        "body": "assert.equal(openLock([], \"5555\"), 20);\nassert.equal(openLock([], \"9999\"), 4);\nassert.equal(openLock([], \"1234\"), 10);"
      },
      {
        "name": "a single open door out of the start forces a detour",
        "body": "assert.equal(openLock([\"0001\", \"0009\", \"0010\", \"0090\", \"0100\", \"0900\", \"1000\"], \"0002\"), 4);"
      },
      {
        "name": "matches a brute-force relaxation over all 10,000 combinations",
        "body": "let seed = 12345;\nfunction rand() {\n  seed = (seed * 1664525 + 1013904223) >>> 0;\n  return seed / 4294967296;\n}\nfunction randInt(n) {\n  return Math.floor(rand() * n);\n}\nconst pad = (n) => String(n).padStart(4, \"0\");\nconst turns = (s) => {\n  const out = [];\n  for (let i = 0; i < 4; i++) for (const t of [1, 9]) out.push(s.slice(0, i) + ((Number(s[i]) + t) % 10) + s.slice(i + 1));\n  return out;\n};\nfor (let round = 0; round < 6; round++) {\n  const dead = Array.from({ length: randInt(800) }, () => pad(randInt(10000)));\n  const target = pad(randInt(10000));\n  const blocked = new Set(dead);\n  const dist = new Map();\n  for (let n = 0; n < 10000; n++) dist.set(pad(n), 1e9);\n  let expected = -1;\n  if (!blocked.has(\"0000\")) {\n    dist.set(\"0000\", 0);\n    let changed = true;\n    while (changed) {\n      changed = false;\n      for (const [s, d] of dist) {\n        if (d >= 1e9) continue;\n        for (const next of turns(s)) {\n          if (!blocked.has(next) && d + 1 < dist.get(next)) { dist.set(next, d + 1); changed = true; }\n        }\n      }\n    }\n    expected = dist.get(target) >= 1e9 ? -1 : dist.get(target);\n  }\n  assert.equal(openLock(dead, target), expected);\n}"
      }
    ]
  },
  {
    "id": "ex-minimum-genetic-mutation",
    "chapter": "dsa-grid-bfs",
    "level": "intermediate",
    "title": "Minimum Genetic Mutation",
    "brief": "<p>A gene is a string over the letters <code>A</code>, <code>C</code>, <code>G</code> and <code>T</code>. One mutation changes exactly one letter. A mutated gene is valid only if it appears in <code>bank</code>.</p><p>Return the fewest mutations that turn <code>startGene</code> into <code>endGene</code>, or <code>-1</code> if it cannot be done.</p><ul><li><code>startGene</code> does not have to be in the bank</li><li>If <code>startGene</code> equals <code>endGene</code>, the answer is <code>0</code></li><li>If <code>endGene</code> is not in the bank, the answer is <code>-1</code></li></ul>",
    "starter": "function minMutation(startGene, endGene, bank) {\n  // TODO: BFS where a state is a gene and a neighbour is a one-letter change that is in the bank\n}\n",
    "hints": [
      "A gene is a state. Two genes are neighbours when they differ in one position and the second one is in the bank. You do not need to build the graph first.",
      "To list the neighbours of a gene, try each position and each of the three other letters, and keep the result when the bank contains it.",
      "Put the bank in a Set for O(1) lookups and use a distance Map as the visited set. Handle start equal to end before searching."
    ],
    "solution": "function minMutation(startGene, endGene, bank) {\n  if (startGene === endGene) return 0;\n  const valid = new Set(bank);\n  if (!valid.has(endGene)) return -1;\n  const dist = new Map([[startGene, 0]]);\n  const queue = [startGene];\n  let head = 0;\n  while (head < queue.length) {\n    const gene = queue[head++];\n    if (gene === endGene) return dist.get(gene);\n    for (let i = 0; i < gene.length; i++) {\n      for (const letter of \"ACGT\") {\n        if (letter === gene[i]) continue;\n        const next = gene.slice(0, i) + letter + gene.slice(i + 1);\n        if (!valid.has(next) || dist.has(next)) continue;\n        dist.set(next, dist.get(gene) + 1);\n        queue.push(next);\n      }\n    }\n  }\n  return -1;\n}\n",
    "tests": [
      {
        "name": "one mutation",
        "body": "assert.equal(minMutation(\"AACCGGTT\", \"AACCGGTA\", [\"AACCGGTA\"]), 1);"
      },
      {
        "name": "two mutations through the bank",
        "body": "assert.equal(minMutation(\"AACCGGTT\", \"AAACGGTA\", [\"AACCGGTA\", \"AACCGCTA\", \"AAACGGTA\"]), 2);"
      },
      {
        "name": "three mutations",
        "body": "assert.equal(minMutation(\"AAAAACCC\", \"AACCCCCC\", [\"AAAACCCC\", \"AAACCCCC\", \"AACCCCCC\"]), 3);"
      },
      {
        "name": "the end gene is not in the bank",
        "body": "assert.equal(minMutation(\"AACCGGTT\", \"AACCGGTA\", []), -1);"
      },
      {
        "name": "start equals end",
        "body": "assert.equal(minMutation(\"ACGT\", \"ACGT\", []), 0);"
      },
      {
        "name": "the bank cannot connect start and end",
        "body": "assert.equal(minMutation(\"AAAA\", \"CCCC\", [\"CCCC\", \"AACC\", \"ACCC\"]), -1);"
      },
      {
        "name": "the start gene does not need to be in the bank",
        "body": "assert.equal(minMutation(\"AAAA\", \"AAAC\", [\"AAAC\"]), 1);"
      },
      {
        "name": "takes the shorter of two routes",
        "body": "assert.equal(minMutation(\"AAAA\", \"CCAA\", [\"CAAA\", \"CCAA\", \"ACAA\", \"CCCA\", \"CCCC\"]), 2);"
      },
      {
        "name": "matches a brute-force search on random banks",
        "body": "let seed = 12345;\nfunction rand() {\n  seed = (seed * 1664525 + 1013904223) >>> 0;\n  return seed / 4294967296;\n}\nfunction randInt(n) {\n  return Math.floor(rand() * n);\n}\nfunction bruteMutation(start, end, bank) {\n  if (start === end) return 0;\n  if (!bank.includes(end)) return -1;\n  const nodes = [...new Set([start, ...bank])];\n  const dist = new Map(nodes.map((n) => [n, 1e9]));\n  dist.set(start, 0);\n  let changed = true;\n  while (changed) {\n    changed = false;\n    for (const u of nodes) {\n      for (const v of nodes) {\n        let diff = 0;\n        for (let i = 0; i < u.length; i++) if (u[i] !== v[i]) diff++;\n        if (diff === 1 && v !== start && bank.includes(v) && dist.get(u) + 1 < dist.get(v)) {\n          dist.set(v, dist.get(u) + 1);\n          changed = true;\n        }\n      }\n    }\n  }\n  return dist.get(end) >= 1e9 ? -1 : dist.get(end);\n}\nconst gene = (len) => Array.from({ length: len }, () => \"ACGT\"[randInt(4)]).join(\"\");\nfor (let round = 0; round < 80; round++) {\n  const len = 1 + randInt(4);\n  const start = gene(len), end = gene(len);\n  const bank = Array.from({ length: randInt(10) }, () => gene(len));\n  assert.equal(minMutation(start, end, bank), bruteMutation(start, end, bank));\n}"
      }
    ]
  },
  {
    "id": "ex-snakes-and-ladders",
    "chapter": "dsa-grid-bfs",
    "level": "intermediate",
    "title": "Snakes and Ladders",
    "brief": "<p><code>board</code> is an <code>n</code> by <code>n</code> grid. Squares are numbered <code>1</code> to <code>n * n</code> in a zig-zag that starts at the <b>bottom-left</b>: the bottom row runs left to right, the row above it runs right to left, and so on. A cell holds <code>-1</code> for an ordinary square, or the number of the square a snake or ladder sends you to.</p><p>You start on square 1. Each turn you roll any value from 1 to 6 (you choose it) and move forward that many squares, if that does not go past square <code>n * n</code>. If you land on a square with a snake or ladder, you must take it, and you take only that one: where it ends does not start another jump. Return the fewest turns to reach square <code>n * n</code>, or <code>-1</code>.</p>",
    "starter": "function snakesAndLadders(board) {\n  // TODO: BFS over square numbers; convert a square number to a cell to read the board\n}\n",
    "hints": [
      "A state is the square you stand on after any jump. Its neighbours are the squares you can reach with a roll of 1 to 6, after following a snake or ladder if there is one.",
      "Converting a square number to a cell is the fiddly part. Count rows from the bottom with Math.floor((square - 1) / n); on odd rows from the bottom the column runs backward.",
      "Remember the distance to every square in an array of length n * n + 1, filled with -1. Skip a landing square that already has a distance, and stop when square n * n is dequeued."
    ],
    "solution": "function snakesAndLadders(board) {\n  const n = board.length;\n  const last = n * n;\n\n  function cellOf(square) {\n    const fromBottom = Math.floor((square - 1) / n);\n    const offset = (square - 1) % n;\n    const r = n - 1 - fromBottom;\n    const c = fromBottom % 2 === 0 ? offset : n - 1 - offset;\n    return [r, c];\n  }\n\n  const dist = new Array(last + 1).fill(-1);\n  dist[1] = 0;\n  const queue = [1];\n  let head = 0;\n  while (head < queue.length) {\n    const square = queue[head++];\n    if (square === last) return dist[square];\n    for (let roll = 1; roll <= 6 && square + roll <= last; roll++) {\n      const [r, c] = cellOf(square + roll);\n      const landing = board[r][c] === -1 ? square + roll : board[r][c];\n      if (dist[landing] !== -1) continue;\n      dist[landing] = dist[square] + 1;\n      queue.push(landing);\n    }\n  }\n  return -1;\n}\n",
    "tests": [
      {
        "name": "the classic 6 by 6 board with ladders and a snake",
        "body": "const board = [\n  [-1, -1, -1, -1, -1, -1],\n  [-1, -1, -1, -1, -1, -1],\n  [-1, -1, -1, -1, -1, -1],\n  [-1, 35, -1, -1, 13, -1],\n  [-1, -1, -1, -1, -1, -1],\n  [-1, 15, -1, -1, -1, -1],\n];\nassert.equal(snakesAndLadders(board), 4);"
      },
      {
        "name": "a ladder at the very end",
        "body": "assert.equal(snakesAndLadders([[-1, -1], [-1, 3]]), 1);"
      },
      {
        "name": "a 1 by 1 board is already finished",
        "body": "assert.equal(snakesAndLadders([[-1]]), 0);"
      },
      {
        "name": "a 2 by 2 board with no jumps needs one roll",
        "body": "assert.equal(snakesAndLadders([[-1, -1], [-1, -1]]), 1);"
      },
      {
        "name": "a 3 by 3 board with no jumps needs two rolls",
        "body": "assert.equal(snakesAndLadders([[-1, -1, -1], [-1, -1, -1], [-1, -1, -1]]), 2);"
      },
      {
        "name": "every square a die can reach sends you back to square 1",
        "body": "assert.equal(snakesAndLadders([[1, -1, -1], [1, 1, 1], [-1, 1, 1]]), -1);"
      },
      {
        "name": "a ladder is taken once and does not chain into the next ladder",
        "body": "const board = [[-1, -1, -1, -1], [-1, 16, -1, -1], [-1, -1, -1, 10], [-1, -1, -1, -1]];\nassert.equal(snakesAndLadders(board), 2);"
      },
      {
        "name": "matches a brute-force search on random boards",
        "body": "let seed = 12345;\nfunction rand() {\n  seed = (seed * 1664525 + 1013904223) >>> 0;\n  return seed / 4294967296;\n}\nfunction randInt(n) {\n  return Math.floor(rand() * n);\n}\nfor (let round = 0; round < 100; round++) {\n  const n = 1 + randInt(5);\n  const last = n * n;\n  const cellOf = (sq) => {\n    const fb = Math.floor((sq - 1) / n);\n    const off = (sq - 1) % n;\n    return [n - 1 - fb, fb % 2 === 0 ? off : n - 1 - off];\n  };\n  const board = Array.from({ length: n }, () => new Array(n).fill(-1));\n  for (let i = 0; i < randInt(2 * n); i++) {\n    const sq = 2 + randInt(Math.max(1, last - 1));\n    if (sq > last) continue;\n    const [r, c] = cellOf(sq);\n    board[r][c] = 1 + randInt(last);\n  }\n  const dist = new Array(last + 1).fill(1e9);\n  dist[1] = 0;\n  let changed = true;\n  while (changed) {\n    changed = false;\n    for (let sq = 1; sq <= last; sq++) {\n      for (let roll = 1; roll <= 6 && sq + roll <= last; roll++) {\n        const [r, c] = cellOf(sq + roll);\n        const to = board[r][c] === -1 ? sq + roll : board[r][c];\n        if (dist[sq] + 1 < dist[to]) {\n          dist[to] = dist[sq] + 1;\n          changed = true;\n        }\n      }\n    }\n  }\n  assert.equal(snakesAndLadders(board), dist[last] >= 1e9 ? -1 : dist[last]);\n}"
      }
    ]
  },
  {
    "id": "ex-min-knight-moves",
    "chapter": "dsa-grid-bfs",
    "level": "advanced",
    "title": "Minimum Knight Moves",
    "brief": "<p>A chess knight stands at <code>[0, 0]</code> on an infinite board whose squares have integer coordinates. In one move it jumps to one of 8 squares: two steps in one direction and one in the other, for example <code>[2, 1]</code> or <code>[-1, 2]</code>.</p><p>Return the fewest moves needed to reach <code>[x, y]</code>. The target can have negative coordinates, and its absolute values are at most 300.</p><ul><li>The board is symmetric, so reaching <code>[x, y]</code> takes as many moves as reaching <code>[|x|, |y|]</code></li><li>You cannot search an infinite board. You must keep the search inside a finite window, and that window has to be large enough to be correct</li></ul>",
    "starter": "function minKnightMoves(x, y) {\n  // TODO: BFS from [0, 0] inside a bounded window\n}\n",
    "hints": [
      "Use the symmetry first: replace x and y with their absolute values, so the target is in the first quadrant and only one quarter of the board matters.",
      "Search a window rather than the whole board. A knight sometimes has to step a little outside the rectangle between the start and the target, so allow a margin of a couple of squares below zero and beyond the target.",
      "Store visited squares as numbers or strings, not as arrays, so the Set recognises them. Count layers and return when the target is dequeued."
    ],
    "solution": "function minKnightMoves(x, y) {\n  x = Math.abs(x);\n  y = Math.abs(y);\n  const moves = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]];\n  const key = (a, b) => (a + 2) * 1000 + (b + 2);\n  const seen = new Set([key(0, 0)]);\n  let layer = [[0, 0]];\n  let steps = 0;\n  while (layer.length > 0) {\n    const next = [];\n    for (const [a, b] of layer) {\n      if (a === x && b === y) return steps;\n      for (const [da, db] of moves) {\n        const na = a + da;\n        const nb = b + db;\n        if (na < -2 || nb < -2 || na > x + 2 || nb > y + 2) continue;\n        const k = key(na, nb);\n        if (seen.has(k)) continue;\n        seen.add(k);\n        next.push([na, nb]);\n      }\n    }\n    layer = next;\n    steps++;\n  }\n  return -1;\n}\n",
    "tests": [
      {
        "name": "one jump",
        "body": "assert.equal(minKnightMoves(2, 1), 1);"
      },
      {
        "name": "the target is the start",
        "body": "assert.equal(minKnightMoves(0, 0), 0);"
      },
      {
        "name": "the classic diagonal target",
        "body": "assert.equal(minKnightMoves(5, 5), 4);"
      },
      {
        "name": "a neighbouring square takes three moves",
        "body": "assert.equal(minKnightMoves(1, 0), 3);\nassert.equal(minKnightMoves(0, 1), 3);"
      },
      {
        "name": "the diagonal neighbour takes two moves",
        "body": "assert.equal(minKnightMoves(1, 1), 2);"
      },
      {
        "name": "negative coordinates mirror the positive ones",
        "body": "assert.equal(minKnightMoves(-1, -1), 2);\nassert.equal(minKnightMoves(-5, 5), 4);\nassert.equal(minKnightMoves(5, -5), 4);\nassert.equal(minKnightMoves(-2, -1), 1);"
      },
      {
        "name": "two squares along an axis takes two moves",
        "body": "assert.equal(minKnightMoves(2, 0), 2);\nassert.equal(minKnightMoves(0, 2), 2);"
      },
      {
        "name": "far targets",
        "body": "assert.equal(minKnightMoves(300, 0), 150);\nassert.equal(minKnightMoves(299, 299), 200);"
      },
      {
        "name": "matches a brute-force search on a large board for every small target",
        "body": "function bruteKnight(tx, ty) {\n  const size = 90;\n  const moves = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]];\n  const dist = new Map([[\"0,0\", 0]]);\n  const queue = [[0, 0]];\n  let head = 0;\n  while (head < queue.length) {\n    const [a, b] = queue[head++];\n    if (a === tx && b === ty) return dist.get(a + \",\" + b);\n    for (const [da, db] of moves) {\n      const na = a + da, nb = b + db;\n      if (Math.abs(na) > size || Math.abs(nb) > size) continue;\n      const k = na + \",\" + nb;\n      if (dist.has(k)) continue;\n      dist.set(k, dist.get(a + \",\" + b) + 1);\n      queue.push([na, nb]);\n    }\n  }\n  return -1;\n}\nfor (let tx = -12; tx <= 12; tx++) {\n  for (let ty = -12; ty <= 12; ty++) {\n    assert.equal(minKnightMoves(tx, ty), bruteKnight(tx, ty), \"target \" + tx + \",\" + ty);\n  }\n}"
      }
    ]
  },
  {
    "id": "ex-sliding-puzzle",
    "chapter": "dsa-grid-bfs",
    "level": "advanced",
    "title": "Sliding Puzzle",
    "brief": "<p>A board has 2 rows and 3 columns holding the numbers <code>0</code> to <code>5</code> once each. <code>0</code> is the empty square. In one move you slide a tile that is next to the empty square (up, down, left or right) into it.</p><p>The board is solved when it reads <code>[[1, 2, 3], [4, 5, 0]]</code>. Return the fewest moves that solve <code>board</code>, or <code>-1</code> if it cannot be solved.</p><ul><li>There are only 6! = 720 arrangements, so the whole state space is tiny</li><li>The state is the whole board, not the position of one tile</li></ul>",
    "starter": "function slidingPuzzle(board) {\n  // TODO: BFS where a state is the board written as a string such as \"123450\"\n}\n",
    "hints": [
      "Write the board as one string of six characters, row by row. Strings compare by value, so they work as Map and Set keys, where arrays would not.",
      "The empty square can only swap with its neighbours. Precompute, for each of the six positions, which positions are adjacent, instead of working out rows and columns every time.",
      "BFS from the starting string until you reach \"123450\". If the queue runs dry first, half of all arrangements are unreachable, and the answer is -1."
    ],
    "solution": "function slidingPuzzle(board) {\n  const start = board.flat().join(\"\");\n  const goal = \"123450\";\n  if (start === goal) return 0;\n  const neighbours = [[1, 3], [0, 2, 4], [1, 5], [0, 4], [1, 3, 5], [2, 4]];\n  const dist = new Map([[start, 0]]);\n  const queue = [start];\n  let head = 0;\n  while (head < queue.length) {\n    const state = queue[head++];\n    const zero = state.indexOf(\"0\");\n    for (const to of neighbours[zero]) {\n      const chars = state.split(\"\");\n      [chars[zero], chars[to]] = [chars[to], chars[zero]];\n      const next = chars.join(\"\");\n      if (dist.has(next)) continue;\n      if (next === goal) return dist.get(state) + 1;\n      dist.set(next, dist.get(state) + 1);\n      queue.push(next);\n    }\n  }\n  return -1;\n}\n",
    "tests": [
      {
        "name": "one move from solved",
        "body": "assert.equal(slidingPuzzle([[1, 2, 3], [4, 0, 5]]), 1);"
      },
      {
        "name": "an unsolvable board",
        "body": "assert.equal(slidingPuzzle([[1, 2, 3], [5, 4, 0]]), -1);"
      },
      {
        "name": "a board that takes five moves",
        "body": "assert.equal(slidingPuzzle([[4, 1, 2], [5, 0, 3]]), 5);"
      },
      {
        "name": "an already solved board",
        "body": "assert.equal(slidingPuzzle([[1, 2, 3], [4, 5, 0]]), 0);"
      },
      {
        "name": "another unsolvable board",
        "body": "assert.equal(slidingPuzzle([[2, 1, 3], [4, 5, 0]]), -1);"
      },
      {
        "name": "the empty square in the top left",
        "body": "assert.equal(slidingPuzzle([[0, 1, 3], [4, 2, 5]]), 3);"
      },
      {
        "name": "a hardest solvable board takes 21 moves",
        "body": "assert.equal(slidingPuzzle([[4, 5, 0], [1, 2, 3]]), 21);"
      },
      {
        "name": "matches a brute-force search over every arrangement",
        "body": "const perms = [];\nfunction permute(rest, chosen) {\n  if (rest.length === 0) { perms.push(chosen.join(\"\")); return; }\n  for (let i = 0; i < rest.length; i++) permute([...rest.slice(0, i), ...rest.slice(i + 1)], [...chosen, rest[i]]);\n}\npermute([\"0\", \"1\", \"2\", \"3\", \"4\", \"5\"], []);\nconst adj = (s) => {\n  const z = s.indexOf(\"0\"), r = Math.floor(z / 3), c = z % 3, out = [];\n  for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {\n    const nr = r + dr, nc = c + dc;\n    if (nr < 0 || nr > 1 || nc < 0 || nc > 2) continue;\n    const a = s.split(\"\");\n    const j = nr * 3 + nc;\n    const tmp = a[z]; a[z] = a[j]; a[j] = tmp;\n    out.push(a.join(\"\"));\n  }\n  return out;\n};\nconst d = new Map(perms.map((p) => [p, 1e9]));\nd.set(\"123450\", 0);\nlet changed = true;\nwhile (changed) {\n  changed = false;\n  for (const p of perms) for (const q of adj(p)) if (d.get(q) + 1 < d.get(p)) { d.set(p, d.get(q) + 1); changed = true; }\n}\nfor (const p of perms) {\n  const board = [[+p[0], +p[1], +p[2]], [+p[3], +p[4], +p[5]]];\n  const want = d.get(p) >= 1e9 ? -1 : d.get(p);\n  assert.equal(slidingPuzzle(board), want, \"board \" + p);\n}"
      }
    ]
  },
  {
    "id": "ex-shortest-path-k-obstacles",
    "chapter": "dsa-grid-bfs",
    "level": "advanced",
    "title": "Shortest Path with Obstacles Elimination",
    "brief": "<p><code>grid</code> holds <code>0</code> for an empty cell and <code>1</code> for an obstacle. You start at the top-left cell and want to reach the bottom-right cell, moving up, down, left or right. You may walk <b>through</b> at most <code>k</code> obstacles, removing each one as you step onto it.</p><p>Return the fewest steps to reach the bottom-right cell, or <code>-1</code> if it cannot be reached. Both corner cells are empty.</p><ul><li>Arriving at a cell with more removals left is better than arriving with fewer, so a visited mark on the cell alone loses answers</li><li>A state is the cell together with the number of removals left</li></ul>",
    "starter": "function shortestPath(grid, k) {\n  // TODO: BFS over (row, column, removals left)\n}\n",
    "hints": [
      "The same cell reached with different numbers of removals left are different states. Two arrivals at one cell are not interchangeable.",
      "Mark visited with a key built from all three numbers, for example (row * cols + col) * (k + 1) + left, in a flat array or a Set of numbers.",
      "Stepping onto an obstacle costs one removal: the new count is left - grid[nr][nc]. Skip the move if that would go below zero. If k is at least rows + cols - 2 the straight Manhattan route always works."
    ],
    "solution": "function shortestPath(grid, k) {\n  const rows = grid.length;\n  const cols = grid[0].length;\n  if (k >= rows + cols - 2) return rows + cols - 2;\n\n  const width = k + 1;\n  const seen = new Uint8Array(rows * cols * width);\n  seen[k] = 1;\n  const queue = [[0, 0, k, 0]];\n  let head = 0;\n  while (head < queue.length) {\n    const [r, c, left, steps] = queue[head++];\n    if (r === rows - 1 && c === cols - 1) return steps;\n    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {\n      const nr = r + dr;\n      const nc = c + dc;\n      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;\n      const nextLeft = left - grid[nr][nc];\n      if (nextLeft < 0) continue;\n      const key = (nr * cols + nc) * width + nextLeft;\n      if (seen[key]) continue;\n      seen[key] = 1;\n      queue.push([nr, nc, nextLeft, steps + 1]);\n    }\n  }\n  return -1;\n}\n",
    "tests": [
      {
        "name": "removing one obstacle opens a short way",
        "body": "assert.equal(shortestPath([[0, 0, 0], [1, 1, 0], [0, 0, 0], [0, 1, 1], [0, 0, 0]], 1), 6);"
      },
      {
        "name": "one removal is not enough",
        "body": "assert.equal(shortestPath([[0, 1, 1], [1, 1, 1], [1, 0, 0]], 1), -1);"
      },
      {
        "name": "a 1 by 1 grid",
        "body": "assert.equal(shortestPath([[0]], 0), 0);"
      },
      {
        "name": "with k = 0 it is an ordinary shortest path",
        "body": "assert.equal(shortestPath([[0, 0, 0], [1, 1, 0], [0, 0, 0]], 0), 4);\nassert.equal(shortestPath([[0, 1], [1, 0]], 0), -1);"
      },
      {
        "name": "a large k gives the Manhattan distance",
        "body": "assert.equal(shortestPath([[0, 1, 1], [1, 1, 1], [1, 1, 0]], 40), 4);"
      },
      {
        "name": "a cell must be allowed to be reached again with more removals left",
        "body": "assert.equal(shortestPath([[0, 0, 1, 0], [1, 0, 0, 0], [1, 1, 1, 1], [1, 1, 0, 0]], 1), 6);"
      },
      {
        "name": "another grid where one visited mark per cell fails",
        "body": "assert.equal(shortestPath([[0, 0, 0, 1, 0], [0, 0, 1, 1, 0], [0, 0, 1, 1, 0], [1, 0, 1, 0, 1], [0, 0, 0, 1, 0]], 1), 8);"
      },
      {
        "name": "a wide, flat grid",
        "body": "assert.equal(shortestPath([[0, 1, 1, 1, 1, 0]], 4), 5);\nassert.equal(shortestPath([[0, 1, 1, 1, 1, 0]], 3), -1);"
      },
      {
        "name": "matches a brute-force search over (cell, removals left) on random grids",
        "body": "let seed = 12345;\nfunction rand() {\n  seed = (seed * 1664525 + 1013904223) >>> 0;\n  return seed / 4294967296;\n}\nfunction randInt(n) {\n  return Math.floor(rand() * n);\n}\nfor (let round = 0; round < 120; round++) {\n  const R = 1 + randInt(6), C = 1 + randInt(6), k = randInt(5);\n  const grid = Array.from({ length: R }, () => Array.from({ length: C }, () => (rand() < 0.4 ? 1 : 0)));\n  grid[0][0] = 0;\n  grid[R - 1][C - 1] = 0;\n  const INF = 1e9;\n  const d = {};\n  const key = (r, c, l) => r + \",\" + c + \",\" + l;\n  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) for (let l = 0; l <= k; l++) d[key(r, c, l)] = INF;\n  d[key(0, 0, k)] = 0;\n  let changed = true;\n  while (changed) {\n    changed = false;\n    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) for (let l = 0; l <= k; l++) {\n      const here = d[key(r, c, l)];\n      if (here >= INF) continue;\n      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {\n        const nr = r + dr, nc = c + dc;\n        if (nr < 0 || nr >= R || nc < 0 || nc >= C || l - grid[nr][nc] < 0) continue;\n        const to = key(nr, nc, l - grid[nr][nc]);\n        if (here + 1 < d[to]) { d[to] = here + 1; changed = true; }\n      }\n    }\n  }\n  let best = INF;\n  for (let l = 0; l <= k; l++) best = Math.min(best, d[key(R - 1, C - 1, l)]);\n  assert.equal(shortestPath(grid, k), best >= INF ? -1 : best);\n}"
      }
    ]
  },
  {
    "id": "ex-shortest-bridge",
    "chapter": "dsa-grid-bfs",
    "level": "intermediate",
    "title": "Shortest Bridge",
    "brief": "<p><code>grid</code> is an <code>n</code> by <code>n</code> grid of <code>0</code> (water) and <code>1</code> (land). It contains exactly <b>two islands</b>: two groups of land cells, each connected up, down, left and right.</p><p>You may turn water cells into land. Return the smallest number of water cells you must flip so that the two islands become one.</p><ul><li>Two different islands never touch along a side, so the answer is at least 1</li><li>Hint to the shape: find one island completely, then grow outward from all of it at once</li></ul>",
    "starter": "function shortestBridge(grid) {\n  // TODO: flood one island into the first BFS layer, then expand layer by layer until you touch land\n}\n",
    "hints": [
      "First find the cells of one island. Scan for the first 1 and flood outward from it, marking each cell as seen.",
      "Use all the cells of that island as the starting layer of a multi-source BFS. Each layer outward from the island is one more water cell you would have to flip.",
      "When you step from the current layer onto an unseen cell that is land, that land belongs to the other island. The number of layers completed so far is the number of flips."
    ],
    "solution": "function shortestBridge(grid) {\n  const n = grid.length;\n  const sides = [[-1, 0], [1, 0], [0, -1], [0, 1]];\n  const seen = Array.from({ length: n }, () => new Array(n).fill(false));\n  let layer = [];\n\n  outer: for (let r = 0; r < n; r++) {\n    for (let c = 0; c < n; c++) {\n      if (grid[r][c] !== 1) continue;\n      seen[r][c] = true;\n      const stack = [[r, c]];\n      while (stack.length > 0) {\n        const [cr, cc] = stack.pop();\n        layer.push([cr, cc]);\n        for (const [dr, dc] of sides) {\n          const nr = cr + dr;\n          const nc = cc + dc;\n          if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;\n          if (grid[nr][nc] !== 1 || seen[nr][nc]) continue;\n          seen[nr][nc] = true;\n          stack.push([nr, nc]);\n        }\n      }\n      break outer;\n    }\n  }\n\n  let flips = 0;\n  while (layer.length > 0) {\n    const next = [];\n    for (const [r, c] of layer) {\n      for (const [dr, dc] of sides) {\n        const nr = r + dr;\n        const nc = c + dc;\n        if (nr < 0 || nr >= n || nc < 0 || nc >= n || seen[nr][nc]) continue;\n        if (grid[nr][nc] === 1) return flips;\n        seen[nr][nc] = true;\n        next.push([nr, nc]);\n      }\n    }\n    layer = next;\n    flips++;\n  }\n  return -1;\n}\n",
    "tests": [
      {
        "name": "two diagonal cells need one flip",
        "body": "assert.equal(shortestBridge([[0, 1], [1, 0]]), 1);"
      },
      {
        "name": "two flips across the corner",
        "body": "assert.equal(shortestBridge([[0, 1, 0], [0, 0, 0], [0, 0, 1]]), 2);"
      },
      {
        "name": "one island inside a ring",
        "body": "assert.equal(shortestBridge([[1, 1, 1, 1, 1], [1, 0, 0, 0, 1], [1, 0, 1, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 1]]), 1);"
      },
      {
        "name": "a longer gap along one row",
        "body": "assert.equal(shortestBridge([[1, 0, 0, 0, 1], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]]), 3);"
      },
      {
        "name": "the bridge starts from the far end of a snake-shaped island",
        "body": "assert.equal(shortestBridge([[1, 1, 1, 1, 0], [0, 0, 0, 1, 0], [0, 0, 0, 1, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 1]]), 2);"
      },
      {
        "name": "the islands face each other across two columns of water",
        "body": "assert.equal(shortestBridge([[1, 0, 0, 1], [1, 0, 0, 1], [1, 0, 0, 1], [1, 0, 0, 1]]), 2);"
      },
      {
        "name": "a column of water of width one",
        "body": "assert.equal(shortestBridge([[1, 0, 1], [1, 0, 1], [1, 0, 1]]), 1);"
      },
      {
        "name": "matches a brute-force closest-pair search on random grids",
        "body": "let seed = 12345;\nfunction rand() {\n  seed = (seed * 1664525 + 1013904223) >>> 0;\n  return seed / 4294967296;\n}\nfunction randInt(n) {\n  return Math.floor(rand() * n);\n}\nfunction islandsOf(grid) {\n  const n = grid.length;\n  const id = Array.from({ length: n }, () => new Array(n).fill(0));\n  let count = 0;\n  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {\n    if (grid[r][c] !== 1 || id[r][c]) continue;\n    count++;\n    id[r][c] = count;\n    const stack = [[r, c]];\n    while (stack.length) {\n      const [x, y] = stack.pop();\n      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {\n        const nr = x + dr, nc = y + dc;\n        if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] === 1 && !id[nr][nc]) { id[nr][nc] = count; stack.push([nr, nc]); }\n      }\n    }\n  }\n  return { id, count };\n}\nlet tested = 0;\nfor (let round = 0; round < 4000 && tested < 60; round++) {\n  const n = 2 + randInt(6);\n  const grid = Array.from({ length: n }, () => Array.from({ length: n }, () => (rand() < 0.25 ? 1 : 0)));\n  const { id, count } = islandsOf(grid);\n  if (count !== 2) continue;\n  let best = 1e9;\n  for (let a = 0; a < n * n; a++) for (let b = 0; b < n * n; b++) {\n    const ar = Math.floor(a / n), ac = a % n, br = Math.floor(b / n), bc = b % n;\n    if (id[ar][ac] === 1 && id[br][bc] === 2) best = Math.min(best, Math.abs(ar - br) + Math.abs(ac - bc) - 1);\n  }\n  assert.equal(shortestBridge(grid), best);\n  tested++;\n}\nassert.ok(tested > 10, \"the random search found too few two-island grids\");"
      }
    ]
  },
  {
    "id": "ex-queue-without-shift",
    "chapter": "dsa-grid-bfs",
    "level": "intermediate",
    "title": "A Queue That Never Calls shift",
    "brief": "<p>Implement a <code>Queue</code> class for BFS. Its methods:</p><ul><li><code>enqueue(value)</code> adds to the back</li><li><code>dequeue()</code> removes and returns the front value, or <code>undefined</code> when the queue is empty</li><li><code>peek()</code> returns the front value without removing it, or <code>undefined</code></li><li><code>isEmpty()</code> returns a boolean</li><li>the <code>size</code> getter returns the number of values currently in the queue</li></ul><p>Every operation must take O(1) amortised time, and <b>you may not call <code>Array.prototype.shift</code></b>. The tests replace <code>shift</code> with a function that throws, then push hundreds of thousands of values through your queue.</p>",
    "starter": "class Queue {\n  constructor() {\n    // TODO: what two fields let dequeue skip the shifting?\n  }\n\n  get size() {\n    // TODO\n  }\n\n  enqueue(value) {\n    // TODO\n  }\n\n  dequeue() {\n    // TODO\n  }\n\n  peek() {\n    // TODO\n  }\n\n  isEmpty() {\n    // TODO\n  }\n}\n",
    "hints": [
      "Keep an array and a read index. Dequeue returns items[head] and then moves head forward; nothing is ever moved down.",
      "size is the array length minus head, and the queue is empty when head has caught up with the end of the array.",
      "To stop the array growing forever, drop the consumed prefix with slice once head is at least half of the length (and not tiny). The copy is paid for by the dequeues before it, so the cost stays amortised O(1)."
    ],
    "solution": "class Queue {\n  constructor() {\n    this.items = [];\n    this.head = 0;\n  }\n\n  get size() {\n    return this.items.length - this.head;\n  }\n\n  enqueue(value) {\n    this.items.push(value);\n  }\n\n  dequeue() {\n    if (this.head === this.items.length) return undefined;\n    const value = this.items[this.head];\n    this.items[this.head] = undefined;\n    this.head++;\n    if (this.head >= 32 && this.head * 2 >= this.items.length) {\n      this.items = this.items.slice(this.head);\n      this.head = 0;\n    }\n    return value;\n  }\n\n  peek() {\n    return this.head === this.items.length ? undefined : this.items[this.head];\n  }\n\n  isEmpty() {\n    return this.head === this.items.length;\n  }\n}\n",
    "tests": [
      {
        "name": "values come out in the order they went in",
        "body": "const q = new Queue();\nq.enqueue(1);\nq.enqueue(2);\nq.enqueue(3);\nassert.equal(q.dequeue(), 1);\nassert.equal(q.dequeue(), 2);\nassert.equal(q.dequeue(), 3);"
      },
      {
        "name": "an empty queue returns undefined and reports empty",
        "body": "const q = new Queue();\nassert.equal(q.isEmpty(), true);\nassert.equal(q.size, 0);\nassert.equal(q.dequeue(), undefined);\nassert.equal(q.peek(), undefined);"
      },
      {
        "name": "size and isEmpty follow every operation",
        "body": "const q = new Queue();\nq.enqueue(\"a\");\nq.enqueue(\"b\");\nassert.equal(q.size, 2);\nassert.equal(q.isEmpty(), false);\nq.dequeue();\nassert.equal(q.size, 1);\nq.dequeue();\nassert.equal(q.size, 0);\nassert.equal(q.isEmpty(), true);"
      },
      {
        "name": "peek does not remove",
        "body": "const q = new Queue();\nq.enqueue(7);\nq.enqueue(8);\nassert.equal(q.peek(), 7);\nassert.equal(q.peek(), 7);\nassert.equal(q.size, 2);\nassert.equal(q.dequeue(), 7);\nassert.equal(q.peek(), 8);"
      },
      {
        "name": "it can be refilled after being emptied",
        "body": "const q = new Queue();\nq.enqueue(1);\nq.dequeue();\nassert.equal(q.dequeue(), undefined);\nq.enqueue(2);\nassert.equal(q.peek(), 2);\nassert.equal(q.size, 1);"
      },
      {
        "name": "falsy values are real values",
        "body": "const q = new Queue();\nq.enqueue(0);\nq.enqueue(\"\");\nq.enqueue(null);\nassert.equal(q.size, 3);\nassert.equal(q.dequeue(), 0);\nassert.equal(q.dequeue(), \"\");\nassert.equal(q.dequeue(), null);\nassert.equal(q.isEmpty(), true);"
      },
      {
        "name": "never calls shift while 300,000 values pass through",
        "body": "const realShift = Array.prototype.shift;\nArray.prototype.shift = function () {\n  throw new Error(\"Array.prototype.shift must not be called\");\n};\ntry {\nconst q = new Queue();\nfor (let i = 0; i < 300000; i++) q.enqueue(i);\nlet sum = 0;\nwhile (!q.isEmpty()) sum += q.dequeue();\nassert.equal(sum, (299999 * 300000) / 2);\n} finally {\n  Array.prototype.shift = realShift;\n}"
      },
      {
        "name": "stays correct when enqueues and dequeues are interleaved",
        "body": "const realShift = Array.prototype.shift;\nArray.prototype.shift = function () {\n  throw new Error(\"Array.prototype.shift must not be called\");\n};\ntry {\nlet seed = 12345;\nfunction rand() {\n  seed = (seed * 1664525 + 1013904223) >>> 0;\n  return seed / 4294967296;\n}\nfunction randInt(n) {\n  return Math.floor(rand() * n);\n}\nconst q = new Queue();\nconst reference = [];\nlet readFrom = 0;\nfor (let i = 0; i < 100000; i++) {\n  if (rand() < 0.55) {\n    q.enqueue(i);\n    reference.push(i);\n  } else if (readFrom < reference.length) {\n    assert.equal(q.dequeue(), reference[readFrom++]);\n  } else {\n    assert.equal(q.dequeue(), undefined);\n  }\n  assert.equal(q.size, reference.length - readFrom);\n}\n} finally {\n  Array.prototype.shift = realShift;\n}"
      }
    ]
  },
];
