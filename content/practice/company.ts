import type { Exercise } from "../types";

export const company: Exercise[] = [
  {
    "id": "ex-players-and-trainers",
    "chapter": "dsa-greedy",
    "level": "intermediate",
    "title": "Maximum Matching of Players With Trainers",
    "brief": "<p>Each player has an ability and each trainer has a capacity. A trainer can train a player only when the capacity is at least the ability, and everyone can be in at most one pair, so return the largest number of pairs you can form. For example, players [4,7,9] and trainers [8,2,5,8] give 2. Each array holds up to 100,000 integers.</p>",
    "starter": "function matchPlayersAndTrainers(players, trainers) {\n  // TODO: greedy, sort and two pointers\n}\n",
    "hints": [
      "The exhaustive approach tries every way to assign trainers to players: for each player, either skip them or pair them with any unused trainer that is strong enough, and keep the best count. It is correct, but exponential, roughly as many branches as there are partial matchings.",
      "The pattern is greedy: sort both sides, then two pointers . Sort players by ability and trainers by capacity, both ascending. Then compare the weakest unmatched player with the weakest unused trainer.",
      "Either array empty: the loop condition fails at once and the answer is 0. Equal values: the check uses less-than-or-equal, so ability 5 pairs with capacity 5."
    ],
    "solution": "function matchPlayersAndTrainers(players, trainers) {\n  const abilities = [...players].sort((a, b) => a - b);\n  const capacities = [...trainers].sort((a, b) => a - b);\n\n  let nextPlayer = 0;\n  let nextTrainer = 0;\n  while (nextPlayer < abilities.length && nextTrainer < capacities.length) {\n    if (abilities[nextPlayer] <= capacities[nextTrainer]) {\n      nextPlayer++;\n    }\n    nextTrainer++;\n  }\n\n  return nextPlayer;\n}\n",
    "tests": [
      {
        "name": "the example from the brief",
        "body": "assert.deepEqual(matchPlayersAndTrainers([4,7,9], [8,2,5,8]), 2);"
      },
      {
        "name": "matchPlayersAndTrainers([], ...)",
        "body": "assert.deepEqual(matchPlayersAndTrainers([], []), 0);"
      },
      {
        "name": "matchPlayersAndTrainers([], ...)",
        "body": "assert.deepEqual(matchPlayersAndTrainers([], [1]), 0);"
      },
      {
        "name": "matchPlayersAndTrainers([1], ...)",
        "body": "assert.deepEqual(matchPlayersAndTrainers([1], []), 0);"
      },
      {
        "name": "matchPlayersAndTrainers([5,5,5], ...)",
        "body": "assert.deepEqual(matchPlayersAndTrainers([5,5,5], [5,5]), 2);"
      },
      {
        "name": "matchPlayersAndTrainers([1,2,3], ...)",
        "body": "assert.deepEqual(matchPlayersAndTrainers([1,2,3], [3,3,3]), 3);"
      },
      {
        "name": "matchPlayersAndTrainers([10], ...)",
        "body": "assert.deepEqual(matchPlayersAndTrainers([10], [1,2,9]), 0);"
      },
      {
        "name": "matchPlayersAndTrainers([4,7], ...)",
        "body": "assert.deepEqual(matchPlayersAndTrainers([4,7], [8,5]), 2);"
      },
      {
        "name": "matchPlayersAndTrainers([9,1], ...)",
        "body": "assert.deepEqual(matchPlayersAndTrainers([9,1], [1,9]), 2);"
      },
      {
        "name": "matchPlayersAndTrainers([3,1,2], ...)",
        "body": "assert.deepEqual(matchPlayersAndTrainers([3,1,2], [2,1,3]), 3);"
      },
      {
        "name": "matchPlayersAndTrainers([10,2,7,5,16,3,6,2,13], ...)",
        "body": "assert.deepEqual(matchPlayersAndTrainers([10,2,7,5,16,3,6,2,13], [19,7,5,1,14,17,1,12]), 6);"
      }
    ]
  },
  {
    "id": "ex-relative-sort-array",
    "chapter": "dsa-hashing",
    "level": "beginner",
    "title": "Relative Sort Array",
    "brief": "<p>You get two integer arrays, arr1 and arr2, where the values of arr2 are distinct and every one of them also appears in arr1. Reorder arr1 so the values named in arr2 come first, following arr2's order with all copies of a value together, and the remaining values follow in ascending order. For arr1 = [5,3,1,3,5,5,8,2] and arr2 = [5,1] the result is [5,5,5,1,2,3,3,8]. Lengths are about a thousand and values are small, but your solution should stay correct for any integers.</p>",
    "starter": "function relativeSortArray(arr1, arr2) {\n  // TODO: counting with a hash map\n}\n",
    "hints": [
      "The quick answer is to sort arr1 with a custom comparator. Look up each value's position in arr2 with indexOf , give values that are not found a position past the end, compare by position, and break ties by the value itself.",
      "The pattern is counting with a hash map. The order inside the arr2 part is dictated by arr2, so it never needs a comparison. All that matters for each such value is how many copies exist.",
      "Empty arr2: the first phase does nothing and the whole array is sorted ascending in the second phase. Empty arr1: both phases have nothing to emit, so the result is an empty list."
    ],
    "solution": "function relativeSortArray(arr1, arr2) {\n  const counts = new Map();\n  for (const value of arr1) counts.set(value, (counts.get(value) ?? 0) + 1);\n  const result = [];\n  for (const value of arr2) {\n    const copies = counts.get(value) ?? 0;\n    for (let i = 0; i < copies; i++) result.push(value);\n    counts.delete(value);\n  }\n  const leftovers = [...counts.keys()].sort((a, b) => a - b);\n  for (const value of leftovers) {\n    for (let i = 0; i < counts.get(value); i++) result.push(value);\n  }\n  return result;\n}\n",
    "tests": [
      {
        "name": "the example from the brief",
        "body": "assert.deepEqual(relativeSortArray([5,3,1,3,5,5,8,2], [5,1]), [5,5,5,1,2,3,3,8]);"
      },
      {
        "name": "relativeSortArray([2,3,1,3,2,4,6,7,9,2,19], ...)",
        "body": "assert.deepEqual(relativeSortArray([2,3,1,3,2,4,6,7,9,2,19], [2,1,4,3,9,6]), [2,2,2,1,4,3,3,9,6,7,19]);"
      },
      {
        "name": "relativeSortArray([], ...)",
        "body": "assert.deepEqual(relativeSortArray([], []), []);"
      },
      {
        "name": "relativeSortArray([4], ...)",
        "body": "assert.deepEqual(relativeSortArray([4], [4]), [4]);"
      },
      {
        "name": "relativeSortArray([3,1,2], ...)",
        "body": "assert.deepEqual(relativeSortArray([3,1,2], []), [1,2,3]);"
      },
      {
        "name": "relativeSortArray([10,9,100,1,9], ...)",
        "body": "assert.deepEqual(relativeSortArray([10,9,100,1,9], [9]), [9,9,1,10,100]);"
      },
      {
        "name": "relativeSortArray([-2,5,-2,0,5,-7], ...)",
        "body": "assert.deepEqual(relativeSortArray([-2,5,-2,0,5,-7], [5,-2]), [5,5,-2,-2,-7,0]);"
      },
      {
        "name": "relativeSortArray([1,1,1], ...)",
        "body": "assert.deepEqual(relativeSortArray([1,1,1], [1]), [1,1,1]);"
      },
      {
        "name": "relativeSortArray([28,6,22,8,44,17], ...)",
        "body": "assert.deepEqual(relativeSortArray([28,6,22,8,44,17], [22,28,8,6]), [22,28,8,6,17,44]);"
      },
      {
        "name": "relativeSortArray([5,19,10,1,15,6,20,11,2,16,7,21,12,3,17,8,22,13,4,18,..., ...)",
        "body": "assert.deepEqual(relativeSortArray([5,19,10,1,15,6,20,11,2,16,7,21,12,3,17,8,22,13,4,18,9,0,14,5,19,10,1,15,6,20,11,2,16,7,21,12,3,17,8,22,13,4,18,9,0,14,5,19,10,1,15,6,20,11,2,16,7,21,12,3,17,8,22,13,4,18,9,0,14,5,19,10,1,15,6,20,11,2,16,7], [5,0,22,11,3,17]), [5,5,5,5,0,0,0,22,22,22,11,11,11,11,3,3,3,17,17,17,1,1,1,1,2,2,2,2,4,4,4,6,6,6,6,7,7,7,7,8,8,8,9,9,9,10,10,10,10,12,12,12,13,13,13,14,14,14,15,15,15,15,16,16,16,16,18,18,18,19,19,19,19,20,20,20,20,21,21,21]);"
      }
    ]
  },
  {
    "id": "ex-bus-routes",
    "chapter": "dsa-grid-bfs",
    "level": "advanced",
    "title": "Bus Routes",
    "brief": "<p>Each bus follows a route, a list of stops it visits in a loop forever. You start at one stop and want to reach another using as few different buses as possible, changing buses at any stop shared by two routes. Return the minimum number of buses, or -1 if the target cannot be reached. For routes [[1,2,7],[3,6,7]], start 1 and target 6, the answer is 2: ride the first bus to stop 7, then the second bus to stop 6. Assume up to 500 routes, 100,000 stop entries in total, and stop numbers below one million.</p>",
    "starter": "function numBusesToDestination(routes, source, target) {\n  // TODO: bfs over routes\n}\n",
    "hints": [
      "The obvious model is a graph of stops, with an edge between any two stops that share a route, then a breadth-first search from the start. It has two problems. First, a route with L stops becomes a clique of about L² / 2 edges, so one route of 100,000 stops needs around five billion edges.",
      "The pattern is BFS over routes , not over stops. Make each route a node. Two routes are neighbours if they share a stop.",
      "Start equals target: return 0 before building anything, even when the list of routes is empty. Start on no route: the first layer is empty, the loop does not run, and the result is -1."
    ],
    "solution": "function numBusesToDestination(routes, source, target) {\n  if (source === target) return 0;\n  const routesAtStop = new Map();\n  routes.forEach((stops, route) => {\n    for (const stop of stops) {\n      if (!routesAtStop.has(stop)) routesAtStop.set(stop, []);\n      routesAtStop.get(stop).push(route);\n    }\n  });\n  const seenRoutes = new Set();\n  const seenStops = new Set();\n  let frontier = [];\n  for (const route of routesAtStop.get(source) || []) {\n    if (!seenRoutes.has(route)) {\n      seenRoutes.add(route);\n      frontier.push(route);\n    }\n  }\n  for (let buses = 1; frontier.length > 0; buses++) {\n    const nextFrontier = [];\n    for (const route of frontier) {\n      for (const stop of routes[route]) {\n        if (stop === target) return buses;\n        if (seenStops.has(stop)) continue;\n        seenStops.add(stop);\n        for (const other of routesAtStop.get(stop)) {\n          if (!seenRoutes.has(other)) {\n            seenRoutes.add(other);\n            nextFrontier.push(other);\n          }\n        }\n      }\n    }\n    frontier = nextFrontier;\n  }\n  return -1;\n}\n",
    "tests": [
      {
        "name": "the example from the brief",
        "body": "assert.deepEqual(numBusesToDestination([[1,2,7],[3,6,7]], 1, 6), 2);"
      },
      {
        "name": "numBusesToDestination([[7,12],[4,5,15],[6],[15,19],[9,12,13]], ...)",
        "body": "assert.deepEqual(numBusesToDestination([[7,12],[4,5,15],[6],[15,19],[9,12,13]], 15, 12), -1);"
      },
      {
        "name": "numBusesToDestination([[1,2,7]], ...)",
        "body": "assert.deepEqual(numBusesToDestination([[1,2,7]], 5, 5), 0);"
      },
      {
        "name": "numBusesToDestination([[1,2,7]], ...)",
        "body": "assert.deepEqual(numBusesToDestination([[1,2,7]], 1, 9), -1);"
      },
      {
        "name": "numBusesToDestination([[1,2],[2,3],[3,4],[4,5]], ...)",
        "body": "assert.deepEqual(numBusesToDestination([[1,2],[2,3],[3,4],[4,5]], 1, 5), 4);"
      },
      {
        "name": "numBusesToDestination([[1,2,3,4,5],[5,6],[1,6]], ...)",
        "body": "assert.deepEqual(numBusesToDestination([[1,2,3,4,5],[5,6],[1,6]], 1, 6), 1);"
      },
      {
        "name": "numBusesToDestination([], ...)",
        "body": "assert.deepEqual(numBusesToDestination([], 1, 2), -1);"
      },
      {
        "name": "numBusesToDestination([[0,1,6,16,22,23],[14,15,24,33],[1,3,8,14,18],[3,5,9,..., ...)",
        "body": "assert.deepEqual(numBusesToDestination([[0,1,6,16,22,23],[14,15,24,33],[1,3,8,14,18],[3,5,9,12,23,28],[2,7,12,34]], 0, 23), 1);"
      },
      {
        "name": "numBusesToDestination([[18,22,14],[1,5,20],[24,8,14],[21,29,5,22],[10,14,22..., ...)",
        "body": "assert.deepEqual(numBusesToDestination([[18,22,14],[1,5,20],[24,8,14],[21,29,5,22],[10,14,22,21],[14,12,2,23],[3,29],[25,15],[6,27],[29,15],[18,12],[5,13]], 18, 13), 3);"
      }
    ]
  },
  {
    "id": "ex-word-search-right-down",
    "chapter": "dsa-backtracking",
    "level": "intermediate",
    "title": "Word Search, right and down moves only",
    "brief": "<p>You get a grid of letters, given as an array of equal-length strings, and a target word. Decide whether the word can be spelled by a path that starts at any cell and then repeatedly steps one cell right or one cell down, reading one letter per cell. For the grid [\"ooo\",\"ozz\",\"eze\"] and the word \"ooze\" the answer is true: start at the top middle o, step right to o, then down to z, then down to e. Moves left and up are not allowed. Assume a grid up to 100 by 100 and a word up to 100 letters.</p>",
    "starter": "function wordPathExists(grid, word) {\n  // TODO: grid dfs with memo\n}\n",
    "hints": [
      "Start a search from every cell, and at each step try both moves, right and down, without remembering anything. Every step branches in two, so a long run of matching letters costs up to 2^L paths. On a grid of all a's with the word \"aaaa...",
      "The pattern is grid DFS with memoisation . Define search(row, col, index) as: can the word be finished if cell (row, col) is used for letter number index? It is true if that cell holds the letter, and either the word ends here or one of the two moves, right or down, continues the match.",
      "Empty grid or empty word: return false before searching. Word longer than a path can be: more than rows + cols - 1 letters is rejected immediately."
    ],
    "solution": "function wordPathExists(grid, word) {\n  const rows = grid.length;\n  const cols = rows > 0 ? grid[0].length : 0;\n  if (rows === 0 || cols === 0 || word.length === 0) return false;\n  if (word.length > rows + cols - 1) return false;\n  const deadEnds = new Set();\n  const search = (row, col, index) => {\n    if (row >= rows || col >= cols || grid[row][col] !== word[index]) return false;\n    if (index === word.length - 1) return true;\n    const key = (row * cols + col) * word.length + index;\n    if (deadEnds.has(key)) return false;\n    if (search(row, col + 1, index + 1) || search(row + 1, col, index + 1)) return true;\n    deadEnds.add(key);\n    return false;\n  };\n  for (let row = 0; row < rows; row++) {\n    for (let col = 0; col < cols; col++) {\n      if (search(row, col, 0)) return true;\n    }\n  }\n  return false;\n}\n",
    "tests": [
      {
        "name": "the example from the brief",
        "body": "assert.deepEqual(wordPathExists([\"ooo\",\"ozz\",\"eze\"], \"ooze\"), true);"
      },
      {
        "name": "wordPathExists([\"ooo\",\"ozz\",\"eze\"], ...)",
        "body": "assert.deepEqual(wordPathExists([\"ooo\",\"ozz\",\"eze\"], \"ozz\"), true);"
      },
      {
        "name": "wordPathExists([\"ooo\",\"ozz\",\"eze\"], ...)",
        "body": "assert.deepEqual(wordPathExists([\"ooo\",\"ozz\",\"eze\"], \"eoz\"), false);"
      },
      {
        "name": "wordPathExists([\"cat\"], ...)",
        "body": "assert.deepEqual(wordPathExists([\"cat\"], \"cat\"), true);"
      },
      {
        "name": "wordPathExists([\"c\",\"a\",\"t\"], ...)",
        "body": "assert.deepEqual(wordPathExists([\"c\",\"a\",\"t\"], \"cat\"), true);"
      },
      {
        "name": "wordPathExists([\"cat\"], ...)",
        "body": "assert.deepEqual(wordPathExists([\"cat\"], \"tac\"), false);"
      },
      {
        "name": "wordPathExists([\"a\"], ...)",
        "body": "assert.deepEqual(wordPathExists([\"a\"], \"a\"), true);"
      },
      {
        "name": "wordPathExists([\"a\"], ...)",
        "body": "assert.deepEqual(wordPathExists([\"a\"], \"aa\"), false);"
      },
      {
        "name": "wordPathExists([], ...)",
        "body": "assert.deepEqual(wordPathExists([], \"a\"), false);"
      },
      {
        "name": "wordPathExists([\"ab\",\"ba\"], ...)",
        "body": "assert.deepEqual(wordPathExists([\"ab\",\"ba\"], \"ba\"), true);"
      },
      {
        "name": "wordPathExists([\"ab\",\"dc\"], ...)",
        "body": "assert.deepEqual(wordPathExists([\"ab\",\"dc\"], \"abcd\"), false);"
      },
      {
        "name": "wordPathExists([\"aaa\",\"aaa\",\"aaa\"], ...)",
        "body": "assert.deepEqual(wordPathExists([\"aaa\",\"aaa\",\"aaa\"], \"aaaaaa\"), false);"
      },
      {
        "name": "wordPathExists([\"aaa\",\"aaa\",\"aaa\"], ...)",
        "body": "assert.deepEqual(wordPathExists([\"aaa\",\"aaa\",\"aaa\"], \"aaaaa\"), true);"
      },
      {
        "name": "wordPathExists([\"baa\",\"abb\",\"bbb\",\"bbb\",\"bbb\",\"baa\",\"bbb\",\"bbb\",\"bba..., ...)",
        "body": "assert.deepEqual(wordPathExists([\"baa\",\"abb\",\"bbb\",\"bbb\",\"bbb\",\"baa\",\"bbb\",\"bbb\",\"bba\",\"aaa\",\"abb\",\"bab\"], \"bbbbb\"), true);"
      },
      {
        "name": "wordPathExists([\"baa\",\"abb\",\"bbb\",\"bbb\",\"bbb\",\"baa\",\"bbb\",\"bbb\",\"bba..., ...)",
        "body": "assert.deepEqual(wordPathExists([\"baa\",\"abb\",\"bbb\",\"bbb\",\"bbb\",\"baa\",\"bbb\",\"bbb\",\"bba\",\"aaa\",\"abb\",\"bab\"], \"abab\"), true);"
      },
      {
        "name": "wordPathExists([\"baa\",\"abb\",\"bbb\",\"bbb\",\"bbb\",\"baa\",\"bbb\",\"bbb\",\"bba..., ...)",
        "body": "assert.deepEqual(wordPathExists([\"baa\",\"abb\",\"bbb\",\"bbb\",\"bbb\",\"baa\",\"bbb\",\"bbb\",\"bba\",\"aaa\",\"abb\",\"bab\"], \"aaaaaaaa\"), false);"
      }
    ]
  },
  {
    "id": "ex-distribute-coins",
    "chapter": "dsa-tree-problems",
    "level": "intermediate",
    "title": "Distribute Coins in Binary Tree",
    "brief": "<p>A binary tree has N nodes and holds exactly N coins in total, spread over the nodes (some may hold none). In one move you pass one coin between two nodes joined by an edge. Return the minimum number of moves so every node holds exactly one coin. The tree is a level-order array with null for missing children, and [0,3,0] needs 3 moves; there are up to 100 nodes.</p>",
    "starter": "function distributeCoins(levelOrder) {\n  // TODO: post-order tree dfs\n}\n",
    "hints": [
      "Treat the whole configuration as a state: the number of coins on each node. A move changes one state into a neighbor, so run a breadth-first search from the starting state to the all-ones state; the depth you reach it at is the answer.",
      "Stop thinking about individual coins and look at one edge at a time. Cut the edge between a node and its parent. The subtree below has some number of nodes S and holds some number of coins C.",
      "A single node (which must hold exactly one coin) has nothing to move and returns 0. A tree where every node already holds one coin has all excesses 0, so the answer is 0."
    ],
    "solution": "function buildTree(values) {\n  if (values.length === 0 || values[0] === null) return null;\n  const root = { val: values[0], left: null, right: null };\n  const queue = [root];\n  let head = 0;\n  let i = 1;\n  while (head < queue.length && i < values.length) {\n    const node = queue[head++];\n    if (i < values.length && values[i] !== null) {\n      node.left = { val: values[i], left: null, right: null };\n      queue.push(node.left);\n    }\n    i++;\n    if (i < values.length && values[i] !== null) {\n      node.right = { val: values[i], left: null, right: null };\n      queue.push(node.right);\n    }\n    i++;\n  }\n  return root;\n}\n\nfunction distributeCoins(levelOrder) {\n  const root = buildTree(levelOrder);\n  let moves = 0;\n  function excess(node) {\n    if (node === null) return 0;\n    const fromLeft = excess(node.left);\n    const fromRight = excess(node.right);\n    moves += Math.abs(fromLeft) + Math.abs(fromRight);\n    return node.val + fromLeft + fromRight - 1;\n  }\n  excess(root);\n  return moves;\n}\n",
    "tests": [
      {
        "name": "the example from the brief",
        "body": "assert.deepEqual(distributeCoins([3,0,0]), 2);"
      },
      {
        "name": "distributeCoins([0,3,0])",
        "body": "assert.deepEqual(distributeCoins([0,3,0]), 3);"
      },
      {
        "name": "distributeCoins([1,0,2])",
        "body": "assert.deepEqual(distributeCoins([1,0,2]), 2);"
      },
      {
        "name": "distributeCoins([1,0,0,null,3])",
        "body": "assert.deepEqual(distributeCoins([1,0,0,null,3]), 4);"
      },
      {
        "name": "distributeCoins([1])",
        "body": "assert.deepEqual(distributeCoins([1]), 0);"
      },
      {
        "name": "distributeCoins([1,1,1])",
        "body": "assert.deepEqual(distributeCoins([1,1,1]), 0);"
      },
      {
        "name": "distributeCoins([0,null,0,null,3])",
        "body": "assert.deepEqual(distributeCoins([0,null,0,null,3]), 3);"
      },
      {
        "name": "distributeCoins([])",
        "body": "assert.deepEqual(distributeCoins([]), 0);"
      },
      {
        "name": "distributeCoins([0,0,3])",
        "body": "assert.deepEqual(distributeCoins([0,0,3]), 3);"
      },
      {
        "name": "distributeCoins([5,0,0,0,0])",
        "body": "assert.deepEqual(distributeCoins([5,0,0,0,0]), 6);"
      },
      {
        "name": "distributeCoins([0,0,0,0,0,9,0,0,0])",
        "body": "assert.deepEqual(distributeCoins([0,0,0,0,0,9,0,0,0]), 26);"
      },
      {
        "name": "distributeCoins([1,0,null,3,0,0,2,null,0,null,0,null,null,null,3])",
        "body": "assert.deepEqual(distributeCoins([1,0,null,3,0,0,2,null,0,null,0,null,null,null,3]), 8);"
      },
      {
        "name": "distributeCoins([1,1,0,0,2,2,null,0,3,null,null,1,null,null,null,null...)",
        "body": "assert.deepEqual(distributeCoins([1,1,0,0,2,2,null,0,3,null,null,1,null,null,null,null,null,0]), 8);"
      },
      {
        "name": "distributeCoins([1,2,0,null,1,0,0,3,null,null,null,1])",
        "body": "assert.deepEqual(distributeCoins([1,2,0,null,1,0,0,3,null,null,null,1]), 12);"
      }
    ]
  },
  {
    "id": "ex-minimum-speed-on-time",
    "chapter": "dsa-binary-search",
    "level": "intermediate",
    "title": "Minimum Speed to Arrive on Time",
    "brief": "<p>You take n trains in order, all at the same integer speed in km per hour, and dist[i] is the length of the i-th ride. A train departs only on a whole hour, so after each ride except the last you wait for the next whole hour. Given the allowed total time hour (at most two decimal places), return the smallest positive integer speed that arrives in time, or -1 if none does. For dist = [2,4,7,3] and hour = 6.5 the answer is 4. There can be 100,000 rides, each at most 100,000 km, and hour is at most 100.</p>",
    "starter": "function minSpeedOnTime(dist, hour) {\n  // TODO: binary search on the answer\n}\n",
    "hints": [
      "Try speeds 1, 2, 3 and so on. For each speed, add up ceil(dist[i] / speed) for every ride except the last, add dist[last] / speed, and compare with hour. The first speed that fits is the answer.",
      "The pattern is binary search on the answer . The question \"does speed s arrive in time?\" is monotone: raising the speed never makes any ceiling term bigger and always makes the last ride shorter, so total time never goes up as speed goes up.",
      "If hour is at most n - 1, the guard returns -1 before any search. That includes hour exactly equal to n - 1, because the last ride needs time greater than zero."
    ],
    "solution": "function minSpeedOnTime(dist, hour) {\n  const rides = dist.length;\n  const limit = Math.round(hour * 100);\n  const guaranteed = (rides - 1) * 100;\n  if (limit <= guaranteed) return -1;\n  const lastRide = dist[rides - 1];\n  const arrivesInTime = (speed) => {\n    let used = 0;\n    for (let i = 0; i < rides - 1; i++) {\n      used += Math.ceil(dist[i] / speed) * 100;\n    }\n    const remaining = limit - used;\n    return remaining > 0 && lastRide * 100 <= remaining * speed;\n  };\n  const longest = dist.reduce((a, b) => Math.max(a, b), 0);\n  let low = 1;\n  let high = Math.max(longest, Math.ceil((lastRide * 100) / (limit - guaranteed)));\n  while (low < high) {\n    const mid = Math.floor((low + high) / 2);\n    if (arrivesInTime(mid)) high = mid;\n    else low = mid + 1;\n  }\n  return low;\n}\n",
    "tests": [
      {
        "name": "the example from the brief",
        "body": "assert.deepEqual(minSpeedOnTime([2,4,7,3], 6.5), 4);"
      },
      {
        "name": "minSpeedOnTime([1,3,2], ...)",
        "body": "assert.deepEqual(minSpeedOnTime([1,3,2], 6), 1);"
      },
      {
        "name": "minSpeedOnTime([1,3,2], ...)",
        "body": "assert.deepEqual(minSpeedOnTime([1,3,2], 2.7), 3);"
      },
      {
        "name": "minSpeedOnTime([1,3,2], ...)",
        "body": "assert.deepEqual(minSpeedOnTime([1,3,2], 1.9), -1);"
      },
      {
        "name": "minSpeedOnTime([5], ...)",
        "body": "assert.deepEqual(minSpeedOnTime([5], 0.5), 10);"
      },
      {
        "name": "minSpeedOnTime([1,1], ...)",
        "body": "assert.deepEqual(minSpeedOnTime([1,1], 1), -1);"
      },
      {
        "name": "minSpeedOnTime([1,1], ...)",
        "body": "assert.deepEqual(minSpeedOnTime([1,1], 1.01), 100);"
      },
      {
        "name": "minSpeedOnTime([1,1,100000], ...)",
        "body": "assert.deepEqual(minSpeedOnTime([1,1,100000], 2.01), 10000000);"
      },
      {
        "name": "minSpeedOnTime([3], ...)",
        "body": "assert.deepEqual(minSpeedOnTime([3], 3), 1);"
      },
      {
        "name": "minSpeedOnTime([100000], ...)",
        "body": "assert.deepEqual(minSpeedOnTime([100000], 1), 100000);"
      },
      {
        "name": "minSpeedOnTime([23251,84232,33297,82885,5355,15138,64286,92626,12221..., ...)",
        "body": "assert.deepEqual(minSpeedOnTime([23251,84232,33297,82885,5355,15138,64286,92626,12221,14637,2252,98185,17542,2858,97381,58900,13910,65686,16219,46580,53562,31429,47705,45862,37283,23364,45639,78087,59260,89720,27876,12786,40703,37675,77585,55817,10054,22905,16855,28230,12589,71276,47990,74917,57223,34220,82790,67107,33337,4361], 60.37), 67107);"
      },
      {
        "name": "minSpeedOnTime([52,878,555,430,372,140,185,958,44,355,716,988,200,72..., ...)",
        "body": "assert.deepEqual(minSpeedOnTime([52,878,555,430,372,140,185,958,44,355,716,988,200,728,432,5,340,854,748,522,166,823,476,431,726,753,76,812,55,385], 31.5), 878);"
      },
      {
        "name": "minSpeedOnTime([9,9,9,9], ...)",
        "body": "assert.deepEqual(minSpeedOnTime([9,9,9,9], 4), 9);"
      }
    ]
  },
  {
    "id": "ex-max-profit-job-scheduling",
    "chapter": "dsa-dp-1d",
    "level": "advanced",
    "title": "Maximum Profit in Job Scheduling",
    "brief": "<p>You get n jobs, each with a start time, a later end time and a profit; a set of jobs can be done only if no two overlap, though a job may start exactly when another ends. Return the largest total profit you can collect. For starts [1,2,3,3], ends [3,4,5,6] and profits [50,10,40,70] the answer is 120, from the first and last jobs. There can be 50,000 jobs and times up to a billion, so a table indexed by time is not an option.</p>",
    "starter": "function jobScheduling(startTime, endTime, profit) {\n  // TODO: sort, dp and binary search\n}\n",
    "hints": [
      "The direct approach is include or exclude: for each job decide to take it or not, keep only the choices with no overlap, and return the best total. That is O(2^n), hopeless beyond about 25 jobs.",
      "The pattern is sort, dynamic programming and binary search , a weighted version of interval scheduling. Sort the jobs by end time. Define best[i] as the largest profit using only the first i jobs in that order.",
      "No jobs: the loop does not run and best[0] = 0 is returned. One job: its profit."
    ],
    "solution": "function jobScheduling(startTime, endTime, profit) {\n  const jobs = startTime\n    .map((start, i) => ({ start, end: endTime[i], gain: profit[i] }))\n    .sort((a, b) => a.end - b.end);\n  const best = new Array(jobs.length + 1).fill(0);\n  for (let i = 0; i < jobs.length; i++) {\n    let lo = 0;\n    let hi = i;\n    while (lo < hi) {\n      const mid = (lo + hi) >> 1;\n      if (jobs[mid].end <= jobs[i].start) lo = mid + 1;\n      else hi = mid;\n    }\n    best[i + 1] = Math.max(best[i], best[lo] + jobs[i].gain);\n  }\n  return best[jobs.length];\n}\n",
    "tests": [
      {
        "name": "the example from the brief",
        "body": "assert.deepEqual(jobScheduling([1,2,3,3], [3,4,5,6], [50,10,40,70]), 120);"
      },
      {
        "name": "jobScheduling([1,2,3,4,6], ...)",
        "body": "assert.deepEqual(jobScheduling([1,2,3,4,6], [3,5,10,6,9], [20,20,100,70,60]), 150);"
      },
      {
        "name": "jobScheduling([1,1,1], ...)",
        "body": "assert.deepEqual(jobScheduling([1,1,1], [2,3,4], [5,6,4]), 6);"
      },
      {
        "name": "jobScheduling([], ...)",
        "body": "assert.deepEqual(jobScheduling([], [], []), 0);"
      },
      {
        "name": "jobScheduling([4], ...)",
        "body": "assert.deepEqual(jobScheduling([4], [9], [7]), 7);"
      },
      {
        "name": "jobScheduling([1,3], ...)",
        "body": "assert.deepEqual(jobScheduling([1,3], [3,5], [10,10]), 20);"
      },
      {
        "name": "jobScheduling([1,1,1,1], ...)",
        "body": "assert.deepEqual(jobScheduling([1,1,1,1], [3,3,3,3], [5,5,5,5]), 5);"
      },
      {
        "name": "jobScheduling([1,2,3,4], ...)",
        "body": "assert.deepEqual(jobScheduling([1,2,3,4], [10,3,4,5], [40,10,10,10]), 40);"
      },
      {
        "name": "jobScheduling([0,5,10,15], ...)",
        "body": "assert.deepEqual(jobScheduling([0,5,10,15], [5,10,15,20], [1,2,3,4]), 10);"
      },
      {
        "name": "jobScheduling([158,83,43,181,149,200,33,70,142,126,88,51,66,166,1,1..., ...)",
        "body": "assert.deepEqual(jobScheduling([158,83,43,181,149,200,33,70,142,126,88,51,66,166,1,199,34,96,185,24,177,58,142,69,125,179,104,128,27,184,150,116,17,73,185,170,188,64,71,23,178,155,177,16,159,73,147,43,44,144,183,146,137,2,98,46,55,105,79,44], [162,106,65,198,150,220,37,93,148,141,99,75,69,179,9,222,51,121,186,41,194,83,161,87,135,202,109,140,44,191,152,132,31,79,187,173,208,73,82,47,197,169,187,18,167,90,162,59,45,164,205,160,157,3,99,49,77,115,97,57], [57,62,29,86,90,30,20,36,28,42,28,73,68,72,50,82,47,97,96,79,36,64,21,96,43,74,99,50,92,79,28,43,44,54,70,65,79,39,85,24,55,97,24,14,73,28,95,49,97,42,88,89,90,48,55,80,12,17,3,26]), 1187);"
      }
    ]
  },
  {
    "id": "ex-activity-selection",
    "chapter": "dsa-greedy",
    "level": "beginner",
    "title": "Activity Selection",
    "brief": "<p>You are given the start and finish times of n unsorted activities, each starting before it finishes, and a single room, and you must pick as many activities as possible with no two overlapping; an activity may start at the moment another one finishes. Return how many you can pick. For starts [1,3,0,5,8,5] and finishes [2,4,6,7,9,10] the answer is 4, for example (1,2), (3,4), (5,7) and (8,9). The value of n can be several hundred thousand.</p>",
    "starter": "function maxActivities(start, finish) {\n  // TODO: greedy by earliest finish\n}\n",
    "hints": [
      "Try every subset of activities, check each for overlaps, and keep the largest valid subset. With n activities there are 2^n subsets and each check compares pairs, so it is exponential and stops being usable around 20 to 25 activities.",
      "The pattern is a greedy choice by earliest finish time . Sort the activities by finish time. Keep the end of the last activity you picked.",
      "Empty input: the loop does not run and the count is 0. One activity: it is taken, count 1."
    ],
    "solution": "function maxActivities(start, finish) {\n  const activities = start\n    .map((begin, i) => ({ begin, end: finish[i] }))\n    .sort((a, b) => a.end - b.end);\n  let lastEnd = -Infinity;\n  let chosen = 0;\n  for (const activity of activities) {\n    if (activity.begin >= lastEnd) {\n      chosen++;\n      lastEnd = activity.end;\n    }\n  }\n  return chosen;\n}\n",
    "tests": [
      {
        "name": "the example from the brief",
        "body": "assert.deepEqual(maxActivities([1,3,0,5,8,5], [2,4,6,7,9,10]), 4);"
      },
      {
        "name": "maxActivities([], ...)",
        "body": "assert.deepEqual(maxActivities([], []), 0);"
      },
      {
        "name": "maxActivities([2], ...)",
        "body": "assert.deepEqual(maxActivities([2], [5]), 1);"
      },
      {
        "name": "maxActivities([1,1,1], ...)",
        "body": "assert.deepEqual(maxActivities([1,1,1], [4,4,4]), 1);"
      },
      {
        "name": "maxActivities([1,2,3], ...)",
        "body": "assert.deepEqual(maxActivities([1,2,3], [2,3,4]), 3);"
      },
      {
        "name": "maxActivities([0,1,2,3], ...)",
        "body": "assert.deepEqual(maxActivities([0,1,2,3], [10,3,4,5]), 2);"
      },
      {
        "name": "maxActivities([1,2,3,4], ...)",
        "body": "assert.deepEqual(maxActivities([1,2,3,4], [10,11,12,13]), 1);"
      },
      {
        "name": "maxActivities([5,1,3,8,5,0], ...)",
        "body": "assert.deepEqual(maxActivities([5,1,3,8,5,0], [9,2,4,9,7,6]), 4);"
      },
      {
        "name": "maxActivities([1,2,4,6,8], ...)",
        "body": "assert.deepEqual(maxActivities([1,2,4,6,8], [3,5,7,9,10]), 3);"
      },
      {
        "name": "maxActivities([150,163,76,179,94,88,265,180,161,31,10,23,17,3,204,1..., ...)",
        "body": "assert.deepEqual(maxActivities([150,163,76,179,94,88,265,180,161,31,10,23,17,3,204,175,51,269,140,7,152,218,14,253,170,202,224,156,160,4,142,220,3,25,129,256,204,20,51,33,275,21,89,142,127,253,286,165,43,141,201,75,294,87,62,114,58,257,52,137,281,277,58,232,252,68,135,206,178,174,279,90,11,37,199,184,6,53,35,123], [164,167,88,189,100,100,269,199,173,42,29,29,35,10,206,191,65,272,152,19,169,221,21,257,185,216,242,157,163,7,147,221,5,37,144,266,209,35,58,49,281,22,107,146,140,262,294,171,52,142,219,87,302,102,74,128,72,262,53,144,297,284,61,252,265,82,150,207,195,183,285,94,27,53,218,192,9,57,46,130]), 33);"
      }
    ]
  },
  {
    "id": "ex-min-cost-tickets",
    "chapter": "dsa-dp-1d",
    "level": "intermediate",
    "title": "Minimum Cost For Tickets",
    "brief": "<p>You plan to travel on certain days of a year, given as a sorted list of day numbers from 1 to 365. A 1-day pass, a 7-day pass and a 30-day pass cost costs[0], costs[1] and costs[2], and a pass covers that many consecutive days starting on the day you buy it. Return the lowest total cost that covers every travel day. For days [1,4,6,7,8,20] and costs [2,7,15] the answer is 11.</p>",
    "starter": "function minCostTickets(days, costs) {\n  // TODO: 1d dynamic programming\n}\n",
    "hints": [
      "Recursion: from the first uncovered travel day, try each of the three passes, jump to the first travel day it does not cover, and recurse. The answer is the cheapest of the three branches.",
      "The pattern is one-dimensional dynamic programming over the calendar . Let cheapest[d] be the lowest cost to cover all travel days up to and including day d. Build it from day 1 up to the last travel day.",
      "No travel days: the last day is 0, the table has one cell holding 0, and the answer is 0. One travel day: the cheapest single option, which could even be a 7-day pass if that is priced below a 1-day one."
    ],
    "solution": "function minCostTickets(days, costs) {\n  const durations = [1, 7, 30];\n  const travelDays = new Set(days);\n  const lastDay = days.length === 0 ? 0 : days[days.length - 1];\n  const cheapest = new Array(lastDay + 1).fill(0);\n  for (let day = 1; day <= lastDay; day++) {\n    if (!travelDays.has(day)) {\n      cheapest[day] = cheapest[day - 1];\n      continue;\n    }\n    let best = Infinity;\n    for (let t = 0; t < durations.length; t++) {\n      const before = Math.max(0, day - durations[t]);\n      best = Math.min(best, cheapest[before] + costs[t]);\n    }\n    cheapest[day] = best;\n  }\n  return cheapest[lastDay];\n}\n",
    "tests": [
      {
        "name": "the example from the brief",
        "body": "assert.deepEqual(minCostTickets([1,4,6,7,8,20], [2,7,15]), 11);"
      },
      {
        "name": "minCostTickets([1,2,3,4,5,6,7,8,9,10,30,31], ...)",
        "body": "assert.deepEqual(minCostTickets([1,2,3,4,5,6,7,8,9,10,30,31], [2,7,15]), 17);"
      },
      {
        "name": "minCostTickets([], ...)",
        "body": "assert.deepEqual(minCostTickets([], [2,7,15]), 0);"
      },
      {
        "name": "minCostTickets([5], ...)",
        "body": "assert.deepEqual(minCostTickets([5], [3,10,20]), 3);"
      },
      {
        "name": "minCostTickets([1,2,3,4,5,6,7], ...)",
        "body": "assert.deepEqual(minCostTickets([1,2,3,4,5,6,7], [5,7,40]), 7);"
      },
      {
        "name": "minCostTickets([1,8,15,22,29], ...)",
        "body": "assert.deepEqual(minCostTickets([1,8,15,22,29], [3,7,9]), 9);"
      },
      {
        "name": "minCostTickets([1,30], ...)",
        "body": "assert.deepEqual(minCostTickets([1,30], [2,7,15]), 4);"
      },
      {
        "name": "minCostTickets([1,31], ...)",
        "body": "assert.deepEqual(minCostTickets([1,31], [4,9,12]), 8);"
      },
      {
        "name": "minCostTickets([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,2..., ...)",
        "body": "assert.deepEqual(minCostTickets([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30], [2,7,15]), 15);"
      },
      {
        "name": "minCostTickets([6,14,17,20,25,28,30,36,41,54,67,69,70,77,84,92,100,1..., ...)",
        "body": "assert.deepEqual(minCostTickets([6,14,17,20,25,28,30,36,41,54,67,69,70,77,84,92,100,101,102,103,118,136,138,144,150,154,168,169,184,186,192,197,208,209,213,214,216,217,223,226,227,229,230,233,236,238,242,246,260,272,274,278,286,288,294,297,311,322,326,327,332,343,345,350,351,353,354,355,356,364], [3,11,28]), 191);"
      }
    ]
  },
  {
    "id": "ex-longest-valid-parentheses",
    "chapter": "dsa-stacks-queues",
    "level": "advanced",
    "title": "Longest Valid Parentheses",
    "brief": "<p>Given a string made only of the characters ( and ), return the length of the longest contiguous substring that is a balanced run of parentheses, where every opening bracket is closed in the right order. For the string )()()) the answer is 4, from the substring ()(). The string can be 30,000 characters long, so checking every substring is too slow.</p>",
    "starter": "function longestValidParentheses(s) {\n  // TODO: stack of indices\n}\n",
    "hints": [
      "Check every substring: for each start and each even length, scan it with a counter that goes up for an opener and down for a closer, rejecting it if the counter goes negative or does not end at zero. That is O(n²) substrings, each checked in O(n), so O(n³) in total.",
      "The pattern is a stack of indices . Keep a stack whose bottom is the index of the last position that cannot belong to the run being built, starting with -1 as a floor. Scan the string.",
      "Empty string: the loop never runs and the result is 0. Only openers, like (((: they pile up on the stack, no closer ever pops one, and the length is never updated, so 0."
    ],
    "solution": "function longestValidParentheses(s) {\n  const stack = [-1];\n  let longest = 0;\n  for (let i = 0; i < s.length; i++) {\n    if (s[i] === \"(\") {\n      stack.push(i);\n      continue;\n    }\n    stack.pop();\n    if (stack.length === 0) {\n      stack.push(i);\n    } else {\n      longest = Math.max(longest, i - stack[stack.length - 1]);\n    }\n  }\n  return longest;\n}\n",
    "tests": [
      {
        "name": "the example from the brief",
        "body": "assert.deepEqual(longestValidParentheses(\")()())\"), 4);"
      },
      {
        "name": "longestValidParentheses(\"(()\")",
        "body": "assert.deepEqual(longestValidParentheses(\"(()\"), 2);"
      },
      {
        "name": "longestValidParentheses(\"\")",
        "body": "assert.deepEqual(longestValidParentheses(\"\"), 0);"
      },
      {
        "name": "longestValidParentheses(\"()\")",
        "body": "assert.deepEqual(longestValidParentheses(\"()\"), 2);"
      },
      {
        "name": "longestValidParentheses(\"(((\")",
        "body": "assert.deepEqual(longestValidParentheses(\"(((\"), 0);"
      },
      {
        "name": "longestValidParentheses(\")))\")",
        "body": "assert.deepEqual(longestValidParentheses(\")))\"), 0);"
      },
      {
        "name": "longestValidParentheses(\"()(())\")",
        "body": "assert.deepEqual(longestValidParentheses(\"()(())\"), 6);"
      },
      {
        "name": "longestValidParentheses(\"()(()\")",
        "body": "assert.deepEqual(longestValidParentheses(\"()(()\"), 2);"
      },
      {
        "name": "longestValidParentheses(\"(()())\")",
        "body": "assert.deepEqual(longestValidParentheses(\"(()())\"), 6);"
      },
      {
        "name": "longestValidParentheses(\")()(((())))(\")",
        "body": "assert.deepEqual(longestValidParentheses(\")()(((())))(\"), 10);"
      },
      {
        "name": "longestValidParentheses(\")())())(())()((()(()()))((())((())))(()(())(()))(())...)",
        "body": "assert.deepEqual(longestValidParentheses(\")())())(())()((()(()()))((())((())))(()(())(()))(()))())((((\"), 48);"
      }
    ]
  },
  {
    "id": "ex-zero-sum-subarrays",
    "chapter": "dsa-prefix-sums",
    "level": "intermediate",
    "title": "Zero-Sum Subarrays",
    "brief": "<p>Given an array of integers that may contain negatives and zeros, count the contiguous, non-empty subarrays whose elements add up to exactly 0. Two subarrays at different positions count separately even when their values match. For [4,-4,1,-1,3] the answer is 3, from [4,-4], [1,-1] and [4,-4,1,-1]. The array can hold up to 100,000 values, each between -10^9 and 10^9 in size.</p>",
    "starter": "function countZeroSumSubarrays(nums) {\n  // TODO: prefix sums with a hash map\n}\n",
    "hints": [
      "Try every start. From each start, extend the end one element at a time while keeping a running sum, and count each time that sum is 0. That is O(n²) time and O(1) space.",
      "The pattern is prefix sums with a hash map . Let P[i] be the sum of the first i elements, with P[0] = 0 for the empty prefix. The sum of the elements from position i up to j-1 is P[j] - P[i].",
      "An empty array returns 0 because the loop body never runs. A single 0 returns 1: the prefix stays 0, and the seeded {0: 1} entry counts it."
    ],
    "solution": "function countZeroSumSubarrays(nums) {\n  const seenCount = new Map([[0, 1]]);\n  let prefix = 0;\n  let total = 0;\n  for (const value of nums) {\n    prefix += value;\n    const earlier = seenCount.get(prefix) ?? 0;\n    total += earlier;\n    seenCount.set(prefix, earlier + 1);\n  }\n  return total;\n}\n",
    "tests": [
      {
        "name": "the example from the brief",
        "body": "assert.deepEqual(countZeroSumSubarrays([4,-4,1,-1,3]), 3);"
      },
      {
        "name": "countZeroSumSubarrays([])",
        "body": "assert.deepEqual(countZeroSumSubarrays([]), 0);"
      },
      {
        "name": "countZeroSumSubarrays([0])",
        "body": "assert.deepEqual(countZeroSumSubarrays([0]), 1);"
      },
      {
        "name": "countZeroSumSubarrays([0,0,0])",
        "body": "assert.deepEqual(countZeroSumSubarrays([0,0,0]), 6);"
      },
      {
        "name": "countZeroSumSubarrays([1,2,3])",
        "body": "assert.deepEqual(countZeroSumSubarrays([1,2,3]), 0);"
      },
      {
        "name": "countZeroSumSubarrays([1,-1,1,-1])",
        "body": "assert.deepEqual(countZeroSumSubarrays([1,-1,1,-1]), 4);"
      },
      {
        "name": "countZeroSumSubarrays([-3,1,2,-3,4,0,0,-1,-3])",
        "body": "assert.deepEqual(countZeroSumSubarrays([-3,1,2,-3,4,0,0,-1,-3]), 9);"
      },
      {
        "name": "countZeroSumSubarrays([5])",
        "body": "assert.deepEqual(countZeroSumSubarrays([5]), 0);"
      },
      {
        "name": "countZeroSumSubarrays([2,-2])",
        "body": "assert.deepEqual(countZeroSumSubarrays([2,-2]), 1);"
      },
      {
        "name": "countZeroSumSubarrays([1,2,-3,3,-3,1,2,-3])",
        "body": "assert.deepEqual(countZeroSumSubarrays([1,2,-3,3,-3,1,2,-3]), 10);"
      },
      {
        "name": "countZeroSumSubarrays([0,2,2,0,-2,1,-2,0,2,-2,-1,2,1,0,-1,1,1,-3,-1,1,0,3,-...)",
        "body": "assert.deepEqual(countZeroSumSubarrays([0,2,2,0,-2,1,-2,0,2,-2,-1,2,1,0,-1,1,1,-3,-1,1,0,3,-2,3,-2,0,1,1,1,2,3,0,3,0,2,1,-2,3,-3,-1,-1,-1,-1,-2,-1,0,0,3,2,1,0,-2,-3,2,3,-3,-1,-3,-1,2,3,3,2,-2,1,2,3,3,-2,-1,-3,-3,-3,-2,0,2,0,2,-3,-2,-3,3,-2,-3,3,3,-3,3,1,2,3,-3,-2,1,0,0,-2,3,1,0,-3,1,2,-1,-2,1,2,-1,1,1,1,2,1,1,3,2,-3,-1,3,-2,-2,2,-3,1,3,3,2,0,-3,2,1,0,3,2,-2,3,2,3,-2,-1,-2,-2,-3,-3,1,-3,0,-3,3,-1,1,-2,0,2,-1,-2,-2,-1,2,2,-1,-3,0,-3,-3,2,2,-1,-1,0,0,-3,2,-3,3,2,0,2,-1,-3,1,0,1,-2,1,-3,3,-3,3,-1,-2,-2,2,-1,-3,-2,-1,-2,1,-2]), 793);"
      },
      {
        "name": "countZeroSumSubarrays([1,1,1,-1,-1,1,1,0,-1,1,0,1,-1,0,0,0,-1,-1,1,0,-1,-1,...)",
        "body": "assert.deepEqual(countZeroSumSubarrays([1,1,1,-1,-1,1,1,0,-1,1,0,1,-1,0,0,0,-1,-1,1,0,-1,-1,-1,1,1,-1,1,-1,1,0,1,1,-1,0,-1,1,0,-1,0,0,0,-1,0,-1,1,1,-1,1,0,1,0,-1,-1,1,-1,-1,0,0,1,-1,0,-1,0,0,0,-1,-1,-1,0,1,-1,0,0,1,-1,-1,0,-1,-1,1,1,0,-1,0,0,1,1,0,1,1,1,1,1,-1,1,-1,0,-1,0,-1,1,1,-1,-1,1,1,0,1,0,1,0,0,0,0,-1,-1,1,1,-1,-1,0,-1,-1,-1,-1,0,0,0,1,1,0,0,1,0,0,1,0,1,-1,-1,-1,-1,0,0,0,0,-1,0,0,-1,1,1,1,-1,0,1,-1,1,1,1,-1,-1,-1,1,1,0,-1,0,0,-1,1,1,0,0,1,1,-1,-1,0,1,-1,1,-1,1,-1,0,0,1,0,0,0,-1,0,0,1,-1,1,-1,0,-1,-1,1,-1,0,-1,0,-1,-1,1,1,0,0,1,1,1,0,-1,1,0,0,-1,0,-1,-1,1,1,-1,-1,1,-1,0,-1,0,1,0,0,1,0,0,1,-1,0,0,-1,1,-1,-1,-1,0,-1,0,-1,0,0,1,1,0,-1,1,0,1,0,-1,0,0,-1,-1,-1,-1,1,1,0,-1,0,0,1,0,0,-1,1,-1,0,-1,1,0,-1,0,-1,-1,0,0,1,1,-1,1,1,-1,1,1,0,0,-1,1,-1,1,0,0,0,0,-1,0,-1,-1,-1,1,1,0,1,0,-1,1,0,0,1,1,1,-1,-1,-1,-1,-1,0,-1,0,1,1,1,0,0,1,0,0,-1,1,-1,0,0,0,1,0,0,0,1,1,-1,-1,1,1,-1,0,1,1,0,-1,1,0,1,1,1,0,-1,-1,1,0,-1,1,0,1,-1,0,-1,0,-1,0,-1,1,0,-1,0,1,1,-1,-1,0,1,1,1,1,-1,0]), 5547);"
      }
    ]
  },
  {
    "id": "ex-closest-pair-sorted-array",
    "chapter": "dsa-two-pointers",
    "level": "intermediate",
    "title": "Closest Pair to a Target in a Sorted Array",
    "brief": "<p>You get an array of integers sorted in ascending order and a target number. Pick two different positions whose values add up as close to the target as possible and return those two values as [smaller, larger], breaking ties by the smaller sum, then the smaller first value, and returning [] when there are fewer than two elements. For [2,5,9,14,20] and target 17 the answer is [2,14], because 16 is only 1 away. The array can hold up to 100,000 values.</p>",
    "starter": "function closestPairToTarget(sorted, target) {\n  // TODO: two pointers\n}\n",
    "hints": [
      "Check every pair of positions with two nested loops, compute the gap between the pair's sum and the target, and keep the best. That is O(n²) time and O(1) space. With n = 100,000 there are about five billion pairs, far too many for a normal time limit.",
      "The pattern is opposite-end two pointers on sorted data . Put left on the smallest value and right on the largest. Look at their sum.",
      "Fewer than two elements: the condition left right is false from the start, so the code returns the empty list. Exactly two elements: one iteration, and that pair is returned."
    ],
    "solution": "function closestPairToTarget(sorted, target) {\n  let left = 0;\n  let right = sorted.length - 1;\n  let bestPair = [];\n  let bestGap = Infinity;\n  let bestSum = Infinity;\n  while (left < right) {\n    const sum = sorted[left] + sorted[right];\n    const gap = Math.abs(sum - target);\n    if (gap < bestGap || (gap === bestGap && sum < bestSum)) {\n      bestGap = gap;\n      bestSum = sum;\n      bestPair = [sorted[left], sorted[right]];\n    }\n    if (sum < target) left++;\n    else if (sum > target) right--;\n    else break;\n  }\n  return bestPair;\n}\n",
    "tests": [
      {
        "name": "the example from the brief",
        "body": "assert.deepEqual(closestPairToTarget([2,5,9,14,20], 17), [2,14]);"
      },
      {
        "name": "closestPairToTarget([], ...)",
        "body": "assert.deepEqual(closestPairToTarget([], 5), []);"
      },
      {
        "name": "closestPairToTarget([5], ...)",
        "body": "assert.deepEqual(closestPairToTarget([5], 5), []);"
      },
      {
        "name": "closestPairToTarget([1,2], ...)",
        "body": "assert.deepEqual(closestPairToTarget([1,2], 100), [1,2]);"
      },
      {
        "name": "closestPairToTarget([3,3,3], ...)",
        "body": "assert.deepEqual(closestPairToTarget([3,3,3], 6), [3,3]);"
      },
      {
        "name": "closestPairToTarget([-9,-3,0,4,8], ...)",
        "body": "assert.deepEqual(closestPairToTarget([-9,-3,0,4,8], -1), [-9,8]);"
      },
      {
        "name": "closestPairToTarget([1,3,4,6], ...)",
        "body": "assert.deepEqual(closestPairToTarget([1,3,4,6], 7), [1,6]);"
      },
      {
        "name": "closestPairToTarget([1,3,5,12], ...)",
        "body": "assert.deepEqual(closestPairToTarget([1,3,5,12], 10), [3,5]);"
      },
      {
        "name": "closestPairToTarget([1,2,3,4], ...)",
        "body": "assert.deepEqual(closestPairToTarget([1,2,3,4], 100), [3,4]);"
      },
      {
        "name": "closestPairToTarget([1,2,3,4], ...)",
        "body": "assert.deepEqual(closestPairToTarget([1,2,3,4], -100), [1,2]);"
      },
      {
        "name": "closestPairToTarget([-5,-4,-2], ...)",
        "body": "assert.deepEqual(closestPairToTarget([-5,-4,-2], -20), [-5,-4]);"
      },
      {
        "name": "closestPairToTarget([-50,-50,-49,-48,-47,-46,-45,-45,-41,-41,-39,-37,-36,..., ...)",
        "body": "assert.deepEqual(closestPairToTarget([-50,-50,-49,-48,-47,-46,-45,-45,-41,-41,-39,-37,-36,-34,-29,-20,-18,-11,-11,-11,-6,-6,-5,-4,-4,-2,-1,2,2,6,7,7,7,7,10,11,12,14,14,15,16,19,19,21,22,22,25,26,27,28,28,34,35,41,42,45,49,49,49,50], 7), [-34,41]);"
      },
      {
        "name": "closestPairToTarget([-294,-290,-279,-272,-263,-241,-240,-239,-220,-218,-1..., ...)",
        "body": "assert.deepEqual(closestPairToTarget([-294,-290,-279,-272,-263,-241,-240,-239,-220,-218,-198,-194,-184,-181,-181,-168,-165,-152,-148,-146,-143,-136,-127,-123,-119,-118,-114,-113,-109,-102,-102,-99,-97,-96,-90,-87,-65,-64,-64,-60,-59,-55,-53,-48,-47,-44,-43,-41,-38,-33,-33,-25,-24,-23,-16,-7,5,7,14,15,29,34,35,43,47,49,58,58,60,63,68,69,73,80,81,96,98,99,103,104,117,128,134,134,136,139,142,147,147,148,149,150,156,159,159,161,163,164,166,168,175,183,185,188,195,196,204,215,216,222,239,246,249,251,257,268,272,286,288,289], -41), [-290,249]);"
      }
    ]
  },
  {
    "id": "ex-stack-pop-min-max",
    "chapter": "dsa-stacks-queues",
    "level": "intermediate",
    "title": "Stack with popMin and popMax",
    "brief": "<p>Design a stack of numbers with push, pop, top, peekMin, peekMax, popMin and popMax, driven as an operation list: run(ops, args) applies each operation with its own argument list and returns one result per operation. pop and top use the most recent surviving push; popMin and popMax remove and return the smallest or largest value, taking the copy nearest the top when values tie; push, and every operation on an empty stack, return null. For push 5, push 1, push 5, peekMax, popMax, top, popMin, pop the results are [null,null,null,5,5,1,1,5]. Up to 100,000 operations are run in order.</p><p>The <code>run(ops, args)</code> helper is already written: it builds the stack from the first operation and calls the methods for the rest, like LeetCode's operation lists. Fill in the class.</p>",
    "starter": "class undefined {\n  constructor() {\n    // TODO: set up the state\n  }\n}\n\nfunction run(ops, args) {\n  const values = [], stack = [], minHeap = [], maxHeap = [], removed = new Set();\n  const take = (id) => (removed.add(id), values[id]);\n  const actions = {\n    push: (value) => {\n      stack.push(values.length);\n      heapPush(minHeap, [value, -values.length]);\n      heapPush(maxHeap, [-value, -values.length]);\n      values.push(value);\n      return null;\n    },\n    top: () => values[stack[stack.length - 1]],\n    pop: () => take(stack.pop()),\n    peekMin: () => minHeap[0][0],\n    peekMax: () => -maxHeap[0][0],\n    popMin: () => take(-heapPop(minHeap)[1]),\n    popMax: () => take(-heapPop(maxHeap)[1]),\n  };\n  return ops.map((op, i) => {\n    while (stack.length > 0 && removed.has(stack[stack.length - 1])) stack.pop();\n    for (const heap of [minHeap, maxHeap]) {\n      while (heap.length > 0 && removed.has(-heap[0][1])) heapPop(heap);\n    }\n    return op !== \"push\" && stack.length === 0 ? null : actions[op](...args[i]);\n  });\n}\n",
    "hints": [
      "Keep a plain array. push appends, pop and top use the last slot. For peekMin or popMin, scan the whole array to find the smallest value and the last position that holds it, then splice that position out, which also shifts the tail.",
      "The pattern is one stack seen through two ordered views . Give every push an id. Keep the ids in an array for stack order, in a min-heap for smallest-first order and in a max-heap for largest-first order.",
      "Any operation on an empty stack returns null: after cleanup, an empty stack array means no live element exists, so the code checks it once before dispatching. The same check covers a stack emptied by a mix of pops and popMin or popMax calls."
    ],
    "solution": "const before = (a, b) => (a[0] - b[0] || a[1] - b[1]) < 0;\nfunction heapPush(heap, item) {\n  heap.push(item);\n  for (let i = heap.length - 1; i > 0; ) {\n    const parent = (i - 1) >> 1;\n    if (!before(heap[i], heap[parent])) break;\n    [heap[i], heap[parent]] = [heap[parent], heap[i]];\n    i = parent;\n  }\n}\nfunction heapPop(heap) {\n  const top = heap[0];\n  const last = heap.pop();\n  if (heap.length === 0) return top;\n  heap[0] = last;\n  for (let i = 0, child = 1; child < heap.length; child = 2 * i + 1) {\n    if (child + 1 < heap.length && before(heap[child + 1], heap[child])) child++;\n    if (!before(heap[child], heap[i])) break;\n    [heap[i], heap[child]] = [heap[child], heap[i]];\n    i = child;\n  }\n  return top;\n}\nfunction run(ops, args) {\n  const values = [], stack = [], minHeap = [], maxHeap = [], removed = new Set();\n  const take = (id) => (removed.add(id), values[id]);\n  const actions = {\n    push: (value) => {\n      stack.push(values.length);\n      heapPush(minHeap, [value, -values.length]);\n      heapPush(maxHeap, [-value, -values.length]);\n      values.push(value);\n      return null;\n    },\n    top: () => values[stack[stack.length - 1]],\n    pop: () => take(stack.pop()),\n    peekMin: () => minHeap[0][0],\n    peekMax: () => -maxHeap[0][0],\n    popMin: () => take(-heapPop(minHeap)[1]),\n    popMax: () => take(-heapPop(maxHeap)[1]),\n  };\n  return ops.map((op, i) => {\n    while (stack.length > 0 && removed.has(stack[stack.length - 1])) stack.pop();\n    for (const heap of [minHeap, maxHeap]) {\n      while (heap.length > 0 && removed.has(-heap[0][1])) heapPop(heap);\n    }\n    return op !== \"push\" && stack.length === 0 ? null : actions[op](...args[i]);\n  });\n}\n",
    "tests": [
      {
        "name": "the example from the brief",
        "body": "assert.deepEqual(run([\"push\",\"push\",\"push\",\"peekMax\",\"popMax\",\"top\",\"popMin\",\"pop\"], [[5],[1],[5],[],[],[],[],[]]), [null,null,null,5,5,1,1,5]);"
      },
      {
        "name": "run([], ...)",
        "body": "assert.deepEqual(run([], []), []);"
      },
      {
        "name": "run([\"top\",\"pop\",\"peekMin\",\"peekMax\",\"popMin\",\"popMax\"], ...)",
        "body": "assert.deepEqual(run([\"top\",\"pop\",\"peekMin\",\"peekMax\",\"popMin\",\"popMax\"], [[],[],[],[],[],[]]), [null,null,null,null,null,null]);"
      },
      {
        "name": "run([\"push\",\"push\",\"push\",\"push\",\"popMin\",\"top\",\"pop\",\"po..., ...)",
        "body": "assert.deepEqual(run([\"push\",\"push\",\"push\",\"push\",\"popMin\",\"top\",\"pop\",\"popMin\",\"peekMin\",\"peekMax\"], [[3],[1],[2],[1],[],[],[],[],[],[]]), [null,null,null,null,1,2,2,1,3,3]);"
      },
      {
        "name": "run([\"push\",\"push\",\"push\",\"popMax\",\"popMin\",\"top\",\"pop\",\"..., ...)",
        "body": "assert.deepEqual(run([\"push\",\"push\",\"push\",\"popMax\",\"popMin\",\"top\",\"pop\",\"pop\",\"top\"], [[4],[4],[4],[],[],[],[],[],[]]), [null,null,null,4,4,4,4,null,null]);"
      },
      {
        "name": "run([\"push\",\"push\",\"push\",\"popMin\",\"peekMax\",\"top\",\"popMa..., ...)",
        "body": "assert.deepEqual(run([\"push\",\"push\",\"push\",\"popMin\",\"peekMax\",\"top\",\"popMax\",\"pop\",\"peekMin\"], [[-2],[0],[-2],[],[],[],[],[],[]]), [null,null,null,-2,0,0,0,-2,null]);"
      },
      {
        "name": "run([\"push\",\"push\",\"push\",\"popMin\",\"pop\",\"top\",\"peekMax\",..., ...)",
        "body": "assert.deepEqual(run([\"push\",\"push\",\"push\",\"popMin\",\"pop\",\"top\",\"peekMax\",\"popMax\",\"pop\"], [[5],[1],[9],[],[],[],[],[],[]]), [null,null,null,1,9,5,5,5,null]);"
      },
      {
        "name": "run([\"push\",\"pop\",\"pop\",\"push\",\"peekMin\",\"peekMax\",\"popMa..., ...)",
        "body": "assert.deepEqual(run([\"push\",\"pop\",\"pop\",\"push\",\"peekMin\",\"peekMax\",\"popMax\",\"popMin\"], [[7],[],[],[3],[],[],[],[]]), [null,7,null,null,3,3,3,null]);"
      },
      {
        "name": "run([\"push\",\"push\",\"push\",\"push\",\"popMax\",\"top\",\"popMax\",..., ...)",
        "body": "assert.deepEqual(run([\"push\",\"push\",\"push\",\"push\",\"popMax\",\"top\",\"popMax\",\"top\",\"popMin\",\"popMin\",\"top\"], [[2],[8],[2],[8],[],[],[],[],[],[],[]]), [null,null,null,null,8,2,8,2,2,2,null]);"
      },
      {
        "name": "run([\"popMax\",\"push\",\"push\",\"peekMin\",\"peekMax\",\"peekMax\"..., ...)",
        "body": "assert.deepEqual(run([\"popMax\",\"push\",\"push\",\"peekMin\",\"peekMax\",\"peekMax\",\"top\",\"push\",\"push\",\"peekMax\",\"push\",\"push\",\"pop\",\"top\",\"popMin\",\"popMax\",\"push\",\"peekMin\",\"top\",\"popMin\",\"top\",\"peekMax\",\"pop\",\"top\",\"peekMax\",\"pop\",\"pop\",\"push\",\"top\",\"push\",\"top\",\"push\",\"push\",\"popMax\",\"push\",\"push\",\"push\",\"push\",\"popMin\",\"popMin\",\"push\",\"push\",\"push\",\"push\",\"push\",\"peekMax\",\"peekMax\",\"push\",\"popMin\",\"top\",\"top\",\"top\",\"push\",\"peekMin\",\"pop\",\"peekMin\",\"push\",\"push\",\"peekMax\",\"peekMin\",\"popMax\",\"top\",\"push\",\"top\",\"popMax\",\"peekMin\",\"top\",\"peekMax\",\"top\",\"push\",\"push\",\"push\",\"peekMax\",\"push\",\"top\",\"top\",\"push\",\"push\",\"popMax\",\"push\",\"popMax\",\"pop\",\"push\",\"peekMax\",\"popMax\",\"pop\",\"push\",\"popMax\",\"push\",\"peekMin\",\"top\",\"push\",\"push\",\"popMax\",\"pop\",\"peekMin\",\"push\",\"popMax\",\"pop\",\"push\",\"peekMin\",\"push\",\"top\",\"peekMax\",\"popMax\",\"popMin\",\"peekMin\",\"popMin\",\"push\",\"top\",\"peekMin\",\"pop\",\"popMin\",\"top\",\"peekMin\",\"push\",\"push\",\"top\",\"push\",\"popMax\",\"push\",\"push\",\"push\",\"popMin\",\"pop\",\"popMax\",\"popMax\",\"push\",\"popMin\",\"push\",\"peekMax\",\"pop\",\"push\",\"push\",\"push\",\"pop\",\"popMax\",\"peekMin\",\"peekMin\",\"push\",\"pop\",\"push\",\"top\",\"popMax\",\"push\",\"pop\",\"push\",\"push\",\"pop\",\"peekMin\",\"push\",\"popMax\",\"top\",\"pop\",\"push\",\"push\",\"popMin\",\"top\",\"push\",\"popMax\",\"top\",\"peekMin\",\"pop\",\"push\",\"pop\",\"push\",\"push\",\"push\",\"popMin\",\"popMax\",\"push\",\"push\",\"pop\",\"push\",\"pop\",\"popMin\",\"popMax\",\"top\",\"push\",\"push\",\"peekMax\",\"push\",\"push\",\"push\",\"top\",\"popMin\",\"top\",\"popMin\",\"peekMin\",\"popMax\",\"peekMin\",\"push\",\"peekMax\",\"popMin\",\"top\",\"push\",\"popMin\",\"peekMax\",\"peekMin\",\"peekMax\",\"top\",\"pop\",\"peekMin\",\"peekMin\",\"push\",\"popMax\",\"peekMin\",\"push\",\"push\",\"peekMax\",\"push\",\"push\",\"peekMin\",\"push\",\"pop\",\"push\",\"push\",\"popMin\",\"peekMin\",\"peekMin\",\"top\",\"peekMax\",\"top\",\"push\",\"push\",\"peekMax\",\"peekMin\",\"peekMin\",\"peekMin\",\"peekMin\",\"push\",\"popMin\",\"push\",\"push\",\"push\",\"peekMin\",\"popMin\",\"push\",\"push\",\"pop\",\"pop\",\"push\",\"peekMin\",\"peekMax\",\"pop\",\"peekMax\",\"popMax\",\"popMax\",\"popMax\",\"peekMax\",\"top\",\"peekMax\",\"peekMax\",\"popMax\",\"popMin\",\"push\",\"top\",\"peekMin\",\"peekMax\",\"popMax\",\"pop\",\"push\",\"top\",\"peekMin\",\"top\",\"pop\",\"popMin\",\"peekMin\",\"popMin\",\"pop\",\"popMin\",\"peekMax\",\"push\",\"top\",\"peekMax\",\"popMin\",\"pop\",\"peekMax\",\"popMax\",\"push\",\"push\",\"peekMin\",\"pop\",\"peekMin\",\"peekMax\",\"pop\",\"peekMin\",\"top\",\"top\",\"popMin\",\"popMin\",\"push\",\"peekMin\",\"push\",\"popMax\",\"push\",\"popMin\",\"top\",\"push\",\"peekMax\"], [[],[19],[-10],[],[],[],[],[5],[10],[],[4],[-13],[],[],[],[],[18],[],[],[],[],[],[],[],[],[],[],[-1],[],[3],[],[-14],[14],[],[-17],[11],[-20],[-5],[],[],[18],[-18],[-4],[-6],[-7],[],[],[-4],[],[],[],[],[11],[],[],[],[-17],[12],[],[],[],[],[15],[],[],[],[],[],[],[19],[19],[17],[],[20],[],[],[-6],[5],[],[12],[],[],[-12],[],[],[],[-11],[],[-9],[],[],[-8],[-5],[],[],[],[17],[],[],[4],[],[-13],[],[],[],[],[],[],[-12],[],[],[],[],[],[],[19],[-18],[],[13],[],[-5],[20],[0],[],[],[],[],[-10],[],[-1],[],[],[-16],[6],[-18],[],[],[],[],[-10],[],[-12],[],[],[-10],[],[16],[2],[],[],[-1],[],[],[],[-5],[7],[],[],[-9],[],[],[],[],[6],[],[20],[10],[16],[],[],[8],[16],[],[-7],[],[],[],[],[4],[16],[],[4],[0],[-16],[],[],[],[],[],[],[],[-19],[],[],[],[16],[],[],[],[],[],[],[],[],[4],[],[],[0],[8],[],[-18],[12],[],[0],[],[15],[4],[],[],[],[],[],[],[-13],[-19],[],[],[],[],[],[18],[],[-6],[-2],[-8],[],[],[6],[2],[],[],[-14],[],[],[],[],[],[],[],[],[],[],[],[],[],[14],[],[],[],[],[],[7],[],[],[],[],[],[],[],[],[],[],[18],[],[],[],[],[],[],[-3],[-3],[],[],[],[],[],[],[],[],[],[],[13],[],[-5],[],[-6],[],[],[5],[]]), [null,null,null,-10,19,19,-10,null,null,19,null,null,-13,4,-10,19,null,4,18,4,18,18,18,10,10,10,5,null,-1,null,3,null,null,14,null,null,null,null,-20,-17,null,null,null,null,null,18,18,null,-18,-4,-4,-4,null,-14,11,-14,null,null,18,-17,18,12,null,15,15,-17,12,12,12,null,null,null,19,null,20,20,null,null,20,null,19,12,null,19,19,-12,null,17,null,-17,-9,null,null,12,-5,-17,null,17,-8,null,-17,null,-13,11,11,-17,-14,-14,null,-12,-13,-12,-13,4,-11,null,null,-18,null,19,null,null,null,-18,0,20,13,null,-11,null,5,-1,null,null,null,-18,6,-16,-16,null,-10,null,-12,5,null,-10,null,null,2,-16,null,16,-1,-1,null,null,-16,7,null,7,-9,-12,-9,null,6,null,null,null,-12,20,null,null,16,null,-7,-10,16,8,null,null,16,null,null,null,-16,-16,0,-9,-7,16,-7,null,10,-19,0,null,-7,16,-6,16,16,16,-6,-6,null,10,-6,null,null,8,null,null,-18,null,0,null,null,-18,-6,-6,4,15,4,null,null,15,-19,-19,-19,-19,null,-19,null,null,null,-13,-13,null,null,2,6,null,-14,18,-14,18,18,15,12,8,-8,8,8,8,-8,null,14,-6,14,14,-2,null,7,-6,7,7,-6,-6,-6,4,-6,8,null,18,18,-5,18,8,8,null,null,-5,-3,-5,4,-3,-5,0,0,-5,-5,null,-4,null,13,null,-6,-5,null,5]);"
      },
      {
        "name": "run([\"pop\",\"push\",\"popMax\",\"top\",\"pop\",\"push\",\"pop\",\"push..., ...)",
        "body": "assert.deepEqual(run([\"pop\",\"push\",\"popMax\",\"top\",\"pop\",\"push\",\"pop\",\"push\",\"push\",\"popMin\",\"pop\",\"popMax\",\"peekMax\",\"top\",\"push\",\"push\",\"push\",\"popMax\",\"pop\",\"push\",\"push\",\"popMax\",\"popMax\",\"popMax\",\"push\",\"push\",\"top\",\"popMax\",\"push\",\"popMin\",\"push\",\"pop\",\"push\",\"top\",\"peekMax\",\"popMax\",\"pop\",\"popMin\",\"pop\",\"push\",\"push\",\"popMax\",\"popMax\",\"push\",\"peekMax\",\"push\",\"top\",\"popMin\",\"push\",\"push\",\"push\",\"top\",\"push\",\"push\",\"popMin\",\"push\",\"push\",\"popMax\",\"popMax\",\"push\",\"popMax\",\"push\",\"push\",\"popMax\",\"push\",\"push\",\"push\",\"popMax\",\"popMin\",\"push\",\"popMax\",\"popMax\",\"push\",\"push\",\"top\",\"push\",\"pop\",\"popMax\",\"top\",\"top\",\"push\",\"popMin\",\"top\",\"push\",\"top\",\"pop\",\"popMin\",\"push\",\"top\",\"peekMax\",\"top\",\"pop\",\"push\",\"popMax\",\"push\",\"push\",\"pop\",\"popMin\",\"popMax\",\"push\",\"popMax\",\"popMin\",\"peekMax\",\"popMax\",\"top\",\"push\",\"push\",\"popMax\",\"popMin\",\"popMax\",\"popMax\",\"push\",\"popMax\",\"peekMax\",\"peekMax\",\"pop\",\"peekMax\",\"push\",\"popMax\",\"popMin\",\"pop\",\"popMin\",\"pop\",\"top\",\"push\",\"push\",\"peekMax\",\"popMin\",\"peekMax\",\"popMin\",\"push\",\"popMin\",\"peekMax\",\"peekMax\",\"popMin\",\"popMax\",\"popMin\",\"popMax\",\"pop\",\"top\",\"top\",\"popMin\",\"push\",\"push\",\"push\",\"top\",\"popMin\",\"peekMax\",\"push\",\"popMin\",\"peekMax\",\"push\",\"top\",\"push\",\"push\",\"push\",\"push\",\"popMax\",\"pop\",\"peekMax\",\"top\",\"push\",\"popMax\",\"popMax\",\"push\",\"popMax\",\"push\",\"popMin\",\"popMax\",\"push\",\"push\",\"push\",\"push\",\"top\",\"push\",\"push\",\"peekMax\",\"popMax\",\"pop\",\"push\",\"peekMax\",\"popMax\",\"popMax\",\"popMax\",\"pop\",\"push\",\"popMax\",\"popMax\",\"top\",\"push\",\"push\",\"pop\",\"peekMax\",\"push\",\"peekMax\",\"peekMax\",\"popMin\",\"pop\",\"push\",\"push\",\"top\",\"popMin\",\"popMax\",\"top\",\"push\",\"popMax\",\"top\",\"push\",\"push\",\"popMax\",\"popMax\",\"popMin\",\"popMax\",\"popMax\",\"popMin\",\"popMin\",\"popMax\",\"push\",\"push\",\"push\",\"push\",\"pop\",\"push\",\"popMax\",\"push\",\"top\",\"top\",\"pop\",\"push\",\"push\",\"top\",\"popMax\",\"push\",\"popMax\",\"popMin\",\"push\",\"popMax\",\"push\",\"push\",\"push\",\"pop\",\"push\",\"push\",\"push\",\"popMin\",\"push\",\"push\",\"peekMax\",\"peekMax\",\"popMax\",\"pop\",\"push\",\"popMax\",\"popMax\",\"push\",\"push\",\"push\",\"push\",\"pop\",\"popMin\",\"push\",\"pop\",\"push\",\"push\",\"push\",\"pop\",\"popMin\",\"push\",\"popMax\",\"pop\",\"top\",\"popMin\",\"popMin\",\"push\",\"popMax\",\"push\",\"push\",\"push\",\"peekMax\",\"pop\",\"push\",\"push\",\"peekMax\",\"top\",\"top\",\"push\",\"pop\",\"pop\",\"push\",\"popMax\",\"popMax\",\"push\",\"push\",\"popMax\",\"push\",\"peekMax\",\"push\",\"push\",\"peekMax\",\"popMax\",\"push\",\"popMax\",\"popMin\",\"top\",\"push\",\"popMax\",\"pop\",\"push\",\"push\",\"pop\",\"push\",\"peekMax\",\"peekMax\",\"push\",\"peekMax\",\"popMax\",\"popMax\",\"push\",\"peekMax\",\"pop\",\"peekMax\",\"popMax\",\"popMax\",\"popMax\",\"push\",\"popMax\",\"top\",\"top\",\"push\",\"push\",\"push\",\"push\",\"popMin\",\"popMax\",\"push\",\"push\",\"pop\",\"pop\",\"top\",\"peekMax\",\"popMax\",\"push\",\"top\",\"push\",\"push\",\"popMax\",\"top\",\"popMax\",\"top\",\"push\",\"pop\",\"push\",\"push\",\"push\",\"popMax\",\"popMin\",\"push\",\"pop\",\"push\",\"push\",\"peekMax\",\"popMax\",\"popMax\",\"top\",\"popMax\",\"push\",\"popMax\",\"push\",\"push\",\"push\",\"popMax\",\"push\",\"popMax\",\"popMax\",\"push\",\"top\",\"push\",\"popMin\",\"top\",\"popMax\",\"peekMax\",\"peekMax\",\"peekMax\",\"popMax\",\"pop\",\"popMax\",\"pop\",\"pop\",\"push\",\"popMax\",\"push\",\"push\",\"peekMax\",\"popMax\",\"popMin\",\"popMax\",\"pop\",\"push\",\"top\",\"popMax\"], [[],[-1],[],[],[],[-1],[],[-4],[5],[],[],[],[],[],[3],[-3],[5],[],[],[-4],[3],[],[],[],[-1],[1],[],[],[3],[],[-1],[],[-3],[],[],[],[],[],[],[-5],[1],[],[],[-4],[],[5],[],[],[3],[5],[-3],[],[3],[0],[],[3],[4],[],[],[-4],[],[4],[3],[],[-5],[0],[-2],[],[],[-4],[],[],[4],[-1],[],[3],[],[],[],[],[-4],[],[],[-4],[],[],[],[2],[],[],[],[],[5],[],[-3],[5],[],[],[],[1],[],[],[],[],[],[3],[0],[],[],[],[],[-2],[],[],[],[],[],[-5],[],[],[],[],[],[],[-4],[0],[],[],[],[],[5],[],[],[],[],[],[],[],[],[],[],[],[2],[2],[0],[],[],[],[-5],[],[],[-1],[],[-4],[4],[-1],[-2],[],[],[],[],[0],[],[],[-4],[],[-2],[],[],[-3],[-2],[-5],[-3],[],[-1],[2],[],[],[],[5],[],[],[],[],[],[-3],[],[],[],[1],[-2],[],[],[-1],[],[],[],[],[-3],[5],[],[],[],[],[3],[],[],[-3],[5],[],[],[],[],[],[],[],[],[-4],[-3],[-5],[-1],[],[-2],[],[2],[],[],[],[3],[-2],[],[],[0],[],[],[1],[],[-1],[4],[-1],[],[5],[5],[-3],[],[1],[0],[],[],[],[],[-4],[],[],[-3],[3],[0],[-1],[],[],[4],[],[-3],[-5],[-2],[],[],[-3],[],[],[],[],[],[0],[],[-1],[-5],[0],[],[],[-5],[1],[],[],[],[4],[],[],[0],[],[],[-4],[-3],[],[-3],[],[4],[5],[],[],[1],[],[],[],[3],[],[],[-4],[2],[],[-1],[],[],[-1],[],[],[],[-1],[],[],[],[],[],[],[0],[],[],[],[0],[-5],[-2],[2],[],[],[5],[-5],[],[],[],[],[],[-4],[],[-5],[-5],[],[],[],[],[-3],[],[0],[-3],[-2],[],[],[-3],[],[2],[5],[],[],[],[],[],[4],[],[-1],[0],[3],[],[3],[],[],[1],[],[-3],[],[],[],[],[],[],[],[],[],[],[],[2],[],[-2],[-2],[],[],[],[],[],[3],[],[]]), [null,null,-1,null,null,null,-1,null,null,-4,5,null,null,null,null,null,null,5,-3,null,null,3,3,-4,null,null,1,1,null,-1,null,-1,null,-3,3,3,-3,null,null,null,null,1,-5,null,-4,null,5,-4,null,null,null,-3,null,null,-3,null,null,5,5,null,4,null,null,4,null,null,null,3,-5,null,3,3,null,null,-1,null,3,4,-1,-1,null,-4,-1,null,-4,-4,-4,null,2,3,2,2,null,5,null,null,5,-4,3,null,1,-3,0,0,-1,null,null,3,-2,0,0,null,-1,-2,-2,-2,null,null,-5,null,null,null,null,null,null,null,0,-4,0,0,null,5,null,null,null,null,null,null,null,null,null,null,null,null,null,0,0,2,null,-5,2,null,-1,null,null,null,null,4,-2,2,-1,null,2,2,null,0,null,-4,-1,null,null,null,null,-3,null,null,2,2,-1,null,5,5,-1,-2,-3,null,-2,-3,-5,null,null,-2,1,null,1,1,-5,-1,null,null,5,-4,5,-3,null,3,-3,null,null,5,1,-3,-3,-3,null,null,null,null,null,null,null,-1,null,-2,null,2,2,2,null,null,-2,3,null,0,-5,null,1,null,null,null,-1,null,null,null,-4,null,null,5,5,5,0,null,5,4,null,null,null,null,-1,-4,null,4,null,null,null,-2,-5,null,3,-3,-3,-3,-3,null,1,null,null,null,0,0,null,null,1,1,1,null,4,1,null,0,0,null,null,0,null,-1,null,null,5,5,null,4,-5,1,null,3,1,null,null,2,null,-1,-1,null,-1,-1,-1,null,-1,-1,-1,-1,-1,-2,null,0,-4,-4,null,null,null,null,-5,2,null,null,-5,5,-2,0,0,null,-4,null,null,-2,-5,-3,-5,null,-3,null,null,null,0,-5,null,-3,null,null,5,5,2,-2,-2,null,4,null,null,null,3,null,3,0,null,1,null,-5,-3,1,-1,-1,-1,-1,-3,-3,-4,-4,null,2,null,null,-2,-2,-5,-2,-3,null,3,3]);"
      }
    ]
  },
  {
    "id": "ex-lock-unlock-tree",
    "chapter": "dsa-tree-problems",
    "level": "advanced",
    "title": "Lock and Unlock Nodes in an N-ary Tree",
    "brief": "<p>Design a LockTree over n nodes numbered 0 to n-1, built from a parent array in which the single root has parent -1 (node 0 in the example below). lock(node, user) returns true and locks the node only if the node is unlocked and none of its ancestors and none of its descendants is locked, and unlock(node, user) returns true and frees the node only if that same user locked it; otherwise a call returns false and changes nothing. The input is an operation list like a LeetCode design problem: run(ops, args) returns null for the constructor \"LockTree\" and a boolean for every later call, so with parent [-1,0,0,1,1,2] the calls lock(1,7), lock(3,8), unlock(1,8) return true, false (ancestor 1 is locked), false (wrong user). There are up to 100,000 nodes and calls, user ids are positive integers, and the tree height stays under 1,000.</p><p>The <code>run(ops, args)</code> helper is already written: it builds the tree from the first operation and calls the methods for the rest. Fill in the class.</p>",
    "starter": "class LockTree {\n  constructor(parent) {\n    // TODO: set up the state\n  }\n  lock(node, user) {\n    // TODO\n  }\n  unlock(node, user) {\n    // TODO\n  }\n}\n\nfunction run(ops, args) {\n  const tree = new LockTree(args[0][0]);\n  return ops.map((op, i) => (i === 0 ? null : tree[op](...args[i])));\n}\n",
    "hints": [
      "The direct way to answer lock is to inspect every node that could block it. Walk up the parent pointers and check each ancestor, then run a depth-first search over the whole subtree of the node and check each descendant. Unlock is trivial, just compare the owner.",
      "The pattern is tree with ancestor and descendant counters . The two blocking conditions have different shapes, so give each its own cheap check. Ancestors are easy to reach: a node has exactly one parent chain, so walking up and looking at each owner costs the height h.",
      "Locking an already locked node fails on the owner check, even for the same user, and so does a second lock by another user. Unlocking a free node: the owner is null, which never equals a user id, so it returns false."
    ],
    "solution": "class LockTree {\n  constructor(parent) {\n    this.parent = parent;\n    this.owner = new Array(parent.length).fill(null);\n    this.lockedBelow = new Array(parent.length).fill(0);\n  }\n\n  hasLockedAncestor(node) {\n    for (let up = this.parent[node]; up !== -1; up = this.parent[up]) {\n      if (this.owner[up] !== null) return true;\n    }\n    return false;\n  }\n\n  adjustAncestors(node, delta) {\n    for (let up = this.parent[node]; up !== -1; up = this.parent[up]) {\n      this.lockedBelow[up] += delta;\n    }\n  }\n\n  lock(node, user) {\n    if (this.owner[node] !== null) return false;\n    if (this.lockedBelow[node] > 0 || this.hasLockedAncestor(node)) return false;\n    this.owner[node] = user;\n    this.adjustAncestors(node, 1);\n    return true;\n  }\n\n  unlock(node, user) {\n    if (this.owner[node] !== user) return false;\n    this.owner[node] = null;\n    this.adjustAncestors(node, -1);\n    return true;\n  }\n}\n\nfunction run(ops, args) {\n  const tree = new LockTree(args[0][0]);\n  return ops.map((op, i) => (i === 0 ? null : tree[op](...args[i])));\n}\n",
    "tests": [
      {
        "name": "the example from the brief",
        "body": "assert.deepEqual(run([\"LockTree\",\"lock\",\"lock\",\"lock\",\"lock\",\"unlock\",\"unlock\",\"lock\"], [[[-1,0,0,1,1,2]],[1,7],[3,8],[2,8],[0,9],[1,8],[1,7],[3,8]]), [null,true,false,true,false,false,true,true]);"
      },
      {
        "name": "run([\"LockTree\"], ...)",
        "body": "assert.deepEqual(run([\"LockTree\"], [[[-1]]]), [null]);"
      },
      {
        "name": "run([\"LockTree\",\"lock\",\"lock\",\"unlock\",\"unlock\",\"unlock\",..., ...)",
        "body": "assert.deepEqual(run([\"LockTree\",\"lock\",\"lock\",\"unlock\",\"unlock\",\"unlock\",\"lock\"], [[[-1]],[0,1],[0,1],[0,2],[0,1],[0,1],[0,2]]), [null,true,false,false,true,false,true]);"
      },
      {
        "name": "run([\"LockTree\",\"lock\",\"lock\",\"lock\",\"unlock\",\"lock\"], ...)",
        "body": "assert.deepEqual(run([\"LockTree\",\"lock\",\"lock\",\"lock\",\"unlock\",\"lock\"], [[[-1,0,0]],[0,5],[1,5],[2,6],[0,5],[1,5]]), [null,true,false,false,true,true]);"
      },
      {
        "name": "run([\"LockTree\",\"lock\",\"lock\",\"unlock\",\"lock\",\"lock\"], ...)",
        "body": "assert.deepEqual(run([\"LockTree\",\"lock\",\"lock\",\"unlock\",\"lock\",\"lock\"], [[[-1,0,1,2]],[3,4],[0,4],[3,4],[0,4],[2,1]]), [null,true,false,true,true,false]);"
      },
      {
        "name": "run([\"LockTree\",\"lock\",\"lock\",\"lock\",\"lock\"], ...)",
        "body": "assert.deepEqual(run([\"LockTree\",\"lock\",\"lock\",\"lock\",\"lock\"], [[[-1,0,0,1,1,2,2]],[3,1],[4,1],[2,2],[1,1]]), [null,true,true,true,false]);"
      },
      {
        "name": "run([\"LockTree\",\"unlock\",\"lock\",\"unlock\",\"lock\",\"lock\"], ...)",
        "body": "assert.deepEqual(run([\"LockTree\",\"unlock\",\"lock\",\"unlock\",\"lock\",\"lock\"], [[[2,2,-1,0]],[1,1],[3,1],[3,1],[2,2],[1,1]]), [null,false,true,true,true,false]);"
      },
      {
        "name": "run([\"LockTree\",\"lock\",\"lock\",\"lock\",\"unlock\",\"lock\",\"lock\"], ...)",
        "body": "assert.deepEqual(run([\"LockTree\",\"lock\",\"lock\",\"lock\",\"unlock\",\"lock\",\"lock\"], [[[3,3,3,-1]],[0,1],[1,1],[3,2],[0,1],[3,2],[2,3]]), [null,true,true,false,true,false,true]);"
      },
      {
        "name": "run([\"LockTree\",\"lock\",\"unlock\",\"unlock\",\"lock\",\"unlock\",..., ...)",
        "body": "assert.deepEqual(run([\"LockTree\",\"lock\",\"unlock\",\"unlock\",\"lock\",\"unlock\",\"lock\",\"unlock\",\"unlock\",\"lock\",\"unlock\",\"lock\",\"lock\",\"unlock\",\"unlock\",\"unlock\",\"lock\",\"lock\",\"lock\",\"lock\",\"unlock\",\"lock\",\"unlock\",\"unlock\",\"lock\",\"lock\",\"unlock\",\"lock\",\"lock\",\"lock\",\"unlock\"], [[[6,4,10,4,10,7,1,2,2,5,-1,10]],[8,2],[1,3],[5,3],[8,2],[5,1],[8,2],[4,3],[1,3],[4,3],[2,1],[10,3],[2,2],[9,2],[8,2],[7,3],[9,3],[7,2],[6,3],[3,3],[4,1],[10,2],[8,1],[10,2],[10,2],[8,3],[0,2],[4,1],[10,3],[4,3],[2,3]]), [null,true,false,false,false,false,false,false,false,true,false,false,false,false,true,false,true,false,false,false,false,false,false,false,false,true,false,false,false,false,false]);"
      },
      {
        "name": "run([\"LockTree\",\"unlock\",\"lock\",\"lock\",\"unlock\",\"lock\",\"u..., ...)",
        "body": "assert.deepEqual(run([\"LockTree\",\"unlock\",\"lock\",\"lock\",\"unlock\",\"lock\",\"unlock\",\"lock\",\"lock\",\"lock\",\"lock\",\"unlock\",\"lock\",\"unlock\",\"unlock\",\"unlock\",\"lock\",\"unlock\",\"lock\",\"lock\",\"lock\",\"lock\",\"unlock\",\"unlock\",\"lock\",\"lock\",\"lock\",\"unlock\",\"lock\",\"unlock\",\"lock\",\"lock\",\"lock\",\"lock\",\"lock\",\"lock\",\"lock\",\"unlock\",\"unlock\",\"lock\",\"unlock\",\"lock\",\"unlock\",\"lock\",\"lock\",\"lock\",\"unlock\",\"unlock\",\"lock\",\"unlock\",\"lock\",\"unlock\",\"lock\",\"lock\",\"lock\",\"unlock\",\"lock\",\"unlock\",\"unlock\",\"lock\",\"unlock\",\"lock\",\"unlock\",\"lock\",\"lock\",\"unlock\",\"unlock\",\"lock\",\"lock\",\"lock\",\"unlock\",\"unlock\",\"lock\",\"lock\",\"lock\",\"lock\",\"unlock\",\"unlock\",\"lock\",\"lock\",\"lock\"], [[[38,8,38,26,39,11,39,4,4,17,29,4,11,4,15,4,24,18,21,33,16,39,37,33,15,37,11,34,22,11,26,15,11,12,11,31,17,23,14,-1]],[32,3],[35,2],[18,3],[25,2],[23,2],[1,2],[1,3],[27,2],[0,3],[21,3],[2,3],[33,1],[25,1],[14,1],[18,1],[38,1],[18,3],[38,1],[28,1],[35,1],[17,2],[28,1],[28,2],[9,2],[12,2],[28,3],[0,3],[31,1],[1,3],[21,1],[28,2],[39,2],[36,2],[23,2],[9,2],[11,2],[38,1],[37,1],[2,2],[30,3],[24,3],[16,2],[27,1],[38,1],[17,1],[22,3],[32,3],[3,1],[10,2],[39,1],[9,3],[28,1],[18,3],[25,1],[5,1],[34,2],[39,1],[17,1],[29,1],[12,3],[5,1],[25,3],[7,1],[35,3],[30,3],[30,2],[28,3],[22,3],[32,1],[34,3],[36,3],[30,3],[23,3],[33,1],[37,2],[21,1],[23,1],[26,3],[39,2],[8,2]]), [null,false,true,true,false,true,false,true,true,true,false,false,false,false,false,false,false,true,false,false,false,true,false,false,false,false,false,true,false,true,false,false,false,false,false,false,false,false,false,true,false,true,false,false,false,false,false,false,true,false,false,false,false,false,false,false,false,false,false,true,false,true,false,true,false,false,false,false,false,true,false,false,true,false,false,false,false,false,false,false,true]);"
      }
    ]
  },
  {
    "id": "ex-max-overlapping-intervals",
    "chapter": "dsa-intervals",
    "level": "intermediate",
    "title": "Maximum Overlapping Intervals",
    "brief": "<p>Given a list of closed integer intervals [start, end] with start never above end, return the largest number of intervals that contain one common point. Intervals that only touch, like [1,4] and [4,6], do share that point. For [[1,4],[2,5],[9,12],[5,9],[5,12]] the answer is 3, because the point 5 lies in [2,5], [5,9] and [5,12]. There are up to 100,000 intervals, they come in no particular order, and an empty list gives 0.</p>",
    "starter": "function maxOverlap(intervals) {\n  // TODO: sweep line over start and end events\n}\n",
    "hints": [
      "The obvious solution is to try every candidate point. The best point can always be taken to be the start of some interval, so for each interval take its start and count how many intervals contain it. Keep the largest count.",
      "The pattern is a sweep line over start and end events . Picture a vertical line moving left to right. Its count of open intervals goes up when it reaches a start and down when it passes an end.",
      "Empty list: the loop never runs and the best stays at 0. One interval: the count rises to 1, so the answer is 1."
    ],
    "solution": "function maxOverlap(intervals) {\n  const starts = intervals.map((pair) => pair[0]).sort((a, b) => a - b);\n  const ends = intervals.map((pair) => pair[1]).sort((a, b) => a - b);\n  let open = 0;\n  let best = 0;\n  let endIndex = 0;\n\n  for (const start of starts) {\n    while (ends[endIndex] < start) {\n      open--;\n      endIndex++;\n    }\n    open++;\n    best = Math.max(best, open);\n  }\n\n  return best;\n}\n",
    "tests": [
      {
        "name": "the example from the brief",
        "body": "assert.deepEqual(maxOverlap([[1,4],[2,5],[9,12],[5,9],[5,12]]), 3);"
      },
      {
        "name": "maxOverlap([])",
        "body": "assert.deepEqual(maxOverlap([]), 0);"
      },
      {
        "name": "maxOverlap([[3,3]])",
        "body": "assert.deepEqual(maxOverlap([[3,3]]), 1);"
      },
      {
        "name": "maxOverlap([[1,4],[4,6]])",
        "body": "assert.deepEqual(maxOverlap([[1,4],[4,6]]), 2);"
      },
      {
        "name": "maxOverlap([[1,2],[1,2],[1,2]])",
        "body": "assert.deepEqual(maxOverlap([[1,2],[1,2],[1,2]]), 3);"
      },
      {
        "name": "maxOverlap([[1,2],[3,4],[5,6]])",
        "body": "assert.deepEqual(maxOverlap([[1,2],[3,4],[5,6]]), 1);"
      },
      {
        "name": "maxOverlap([[1,10],[2,3],[4,5],[6,7]])",
        "body": "assert.deepEqual(maxOverlap([[1,10],[2,3],[4,5],[6,7]]), 2);"
      },
      {
        "name": "maxOverlap([[-5,-1],[-3,2],[-2,0]])",
        "body": "assert.deepEqual(maxOverlap([[-5,-1],[-3,2],[-2,0]]), 3);"
      },
      {
        "name": "maxOverlap([[7,8],[5,9],[1,2],[6,7]])",
        "body": "assert.deepEqual(maxOverlap([[7,8],[5,9],[1,2],[6,7]]), 3);"
      },
      {
        "name": "maxOverlap([[24,24],[-3,9],[10,13],[6,11],[-2,5],[-6,2],[-12,-8]...)",
        "body": "assert.deepEqual(maxOverlap([[24,24],[-3,9],[10,13],[6,11],[-2,5],[-6,2],[-12,-8],[-8,-4],[-17,-15],[-9,5],[35,40],[-18,-10],[34,41],[-19,-15],[24,39],[-19,-16],[35,49],[25,34],[-14,-7],[-19,-18],[-4,-2],[9,21],[7,10],[5,5],[14,18]]), 5);"
      }
    ]
  },
  {
    "id": "ex-first-non-repeating-stream",
    "chapter": "dsa-hashing",
    "level": "intermediate",
    "title": "First Non-Repeating Character in a Stream",
    "brief": "<p>Characters arrive one at a time. After each arrival, report the first character that has appeared exactly once so far, or # if no character is unique, and return all the reports joined into one string. For the stream \"mamas\" the answer is \"mma#s\". There are up to 100,000 characters, and each report must be cheap because the stream never stops.</p>",
    "starter": "function firstNonRepeating(stream) {\n  // TODO: queue plus counts\n}\n",
    "hints": [
      "After each new character, count every character of the prefix seen so far, then scan the prefix from the left and report the first one whose count is 1. Another version keeps a count map but still scans the whole prefix for the first unique character.",
      "The pattern is queue plus counts . Keep a count of each character, and keep a queue of the characters in the order of their first arrival. The answer is always the first character in the queue that is still unique.",
      "Empty stream: there are no steps, so the output is an empty string. All different: the front never changes, so every report is the first character."
    ],
    "solution": "function firstNonRepeating(stream) {\n  const counts = new Map();\n  const queue = [];\n  let head = 0;\n  let output = \"\";\n\n  for (const char of stream) {\n    const count = (counts.get(char) ?? 0) + 1;\n    counts.set(char, count);\n    if (count === 1) queue.push(char);\n    while (head < queue.length && counts.get(queue[head]) > 1) head++;\n    output += head < queue.length ? queue[head] : \"#\";\n  }\n\n  return output;\n}\n",
    "tests": [
      {
        "name": "the example from the brief",
        "body": "assert.deepEqual(firstNonRepeating(\"mamas\"), \"mma#s\");"
      },
      {
        "name": "firstNonRepeating(\"\")",
        "body": "assert.deepEqual(firstNonRepeating(\"\"), \"\");"
      },
      {
        "name": "firstNonRepeating(\"a\")",
        "body": "assert.deepEqual(firstNonRepeating(\"a\"), \"a\");"
      },
      {
        "name": "firstNonRepeating(\"aa\")",
        "body": "assert.deepEqual(firstNonRepeating(\"aa\"), \"a#\");"
      },
      {
        "name": "firstNonRepeating(\"abc\")",
        "body": "assert.deepEqual(firstNonRepeating(\"abc\"), \"aaa\");"
      },
      {
        "name": "firstNonRepeating(\"aabb\")",
        "body": "assert.deepEqual(firstNonRepeating(\"aabb\"), \"a#b#\");"
      },
      {
        "name": "firstNonRepeating(\"abcabc\")",
        "body": "assert.deepEqual(firstNonRepeating(\"abcabc\"), \"aaabc#\");"
      },
      {
        "name": "firstNonRepeating(\"zzzzz\")",
        "body": "assert.deepEqual(firstNonRepeating(\"zzzzz\"), \"z####\");"
      },
      {
        "name": "firstNonRepeating(\"ab ba b\")",
        "body": "assert.deepEqual(firstNonRepeating(\"ab ba b\"), \"aaaa ##\");"
      },
      {
        "name": "firstNonRepeating(\"3661644146615223552460036632116603033242462312230635...)",
        "body": "assert.deepEqual(firstNonRepeating(\"366164414661522355246003663211660303324246231223063545465621\"), \"3333333333333335#####0######################################\");"
      }
    ]
  }
];
