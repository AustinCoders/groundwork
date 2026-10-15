import type { Exercise } from "../types";

export const dsaAddGamesProbabilityDp: Exercise[] = [
  {
    "id": "ex-nim-game",
    "chapter": "dsa-games-probability-dp",
    "level": "intermediate",
    "title": "Nim Game",
    "brief": "<p>You and a friend play with a pile of <code>n</code> stones, and you move first. On each turn the player to move removes <b>1, 2 or 3</b> stones. The player who cannot move, because the pile is empty, loses. Return <code>true</code> if you can force a win with optimal play.</p><ul><li><code>canWinNim(4)</code> is <code>false</code>: whatever you take, your friend takes the rest</li><li><code>canWinNim(5)</code> is <code>true</code>: take 1 and leave 4</li><li><code>n</code> can be as large as <code>2^53 - 4</code>, so a loop over the stones is far too slow</li></ul>",
    "starter": "function canWinNim(n) {\n  // TODO: find which pile sizes are losing, and prove the pattern\n}\n",
    "hints": [
      "Build the win/lose table for n = 0, 1, 2, ... by hand: n is winning if some move leads to a losing position, and n = 0 is losing.",
      "The losing positions in the table are 0, 4, 8, 12 ... From a multiple of 4 every move of 1 to 3 leaves a non-multiple.",
      "From a non-multiple n, taking n % 4 stones (which is 1, 2 or 3) leaves a multiple of 4. So the answer is n % 4 !== 0, in constant time."
    ],
    "solution": "function canWinNim(n) {\n  return n % 4 !== 0;\n}\n",
    "tests": [
      {
        "name": "an empty pile is lost, and 1 to 3 stones are won",
        "body": "assert.equal(canWinNim(0), false);\nassert.equal(canWinNim(1), true);\nassert.equal(canWinNim(2), true);\nassert.equal(canWinNim(3), true);"
      },
      {
        "name": "four stones are lost",
        "body": "assert.equal(canWinNim(4), false);"
      },
      {
        "name": "5 to 7 are won and 8 is lost",
        "body": "assert.equal(canWinNim(5), true);\nassert.equal(canWinNim(6), true);\nassert.equal(canWinNim(7), true);\nassert.equal(canWinNim(8), false);"
      },
      {
        "name": "matches a table built move by move for n up to 80",
        "body": "const win = [false];\nfor (let n = 1; n <= 80; n++) win.push([1, 2, 3].some((t) => t <= n && !win[n - t]));\nfor (let n = 0; n <= 80; n++) assert.equal(canWinNim(n), win[n], 'n = ' + n);"
      },
      {
        "name": "a huge pile is answered at once",
        "body": "assert.equal(canWinNim(2147483647), true);\nassert.equal(canWinNim(2147483648), false);\nassert.equal(canWinNim(9007199254740988), false);\nassert.equal(canWinNim(9007199254740989), true);"
      },
      {
        "name": "multiples of four lose and every other size wins, around a million",
        "body": "for (let n = 1000000; n <= 1000040; n++) assert.equal(canWinNim(n), n % 4 !== 0, 'n = ' + n);"
      }
    ]
  },
  {
    "id": "ex-divisor-game",
    "chapter": "dsa-games-probability-dp",
    "level": "intermediate",
    "title": "Divisor Game",
    "brief": "<p>Two players start with the number <code>n</code> on the board, and the first player moves first. A move chooses an integer <code>x</code> with <code>0 &lt; x &lt; n</code> and <code>n % x === 0</code>, and replaces <code>n</code> with <code>n - x</code>. The player who cannot move loses. Return <code>true</code> if the first player wins with optimal play.</p><ul><li><code>divisorGame(2)</code> is <code>true</code>: choose 1, and the opponent faces 1 with no move</li><li><code>divisorGame(3)</code> is <code>false</code>: the only move is 1, which leaves the opponent at 2</li><li><code>n</code> is between 1 and 1000</li></ul>",
    "starter": "function divisorGame(n) {\n  // TODO: tabulate small n, find the pattern, then prove it\n}\n",
    "hints": [
      "Fill a table win[1..n]: n is winning if some divisor x < n makes win[n - x] false. win[1] is false because there is no move.",
      "Print the table for n up to 20 and read it: the winners are exactly the even numbers.",
      "Proof by induction: an odd n has only odd divisors, so every move gives an even number, which is winning for the opponent. An even n can choose x = 1 and give the opponent an odd number."
    ],
    "solution": "function divisorGame(n) {\n  return n % 2 === 0;\n}\n",
    "tests": [
      {
        "name": "the smallest cases",
        "body": "assert.equal(divisorGame(1), false);\nassert.equal(divisorGame(2), true);\nassert.equal(divisorGame(3), false);\nassert.equal(divisorGame(4), true);"
      },
      {
        "name": "matches the win table built from the rules for n up to 120",
        "body": "const win = [false, false];\nfor (let n = 2; n <= 120; n++) {\n  let w = false;\n  for (let x = 1; x < n; x++) if (n % x === 0 && !win[n - x]) w = true;\n  win.push(w);\n}\nfor (let n = 1; n <= 120; n++) assert.equal(divisorGame(n), win[n], 'n = ' + n);"
      },
      {
        "name": "the upper limit",
        "body": "assert.equal(divisorGame(1000), true);\nassert.equal(divisorGame(999), false);"
      },
      {
        "name": "odd numbers always lose and even numbers always win",
        "body": "for (let n = 1; n <= 1000; n++) assert.equal(divisorGame(n), n % 2 === 0, 'n = ' + n);"
      },
      {
        "name": "returns a boolean",
        "body": "assert.equal(typeof divisorGame(6), 'boolean');"
      },
      {
        "name": "agrees with a recursive search that tries every divisor, for n up to 22",
        "body": "const brute = (n) => { for (let x = 1; x < n; x++) if (n % x === 0 && !brute(n - x)) return true; return false; };\nfor (let n = 1; n <= 22; n++) assert.equal(divisorGame(n), brute(n), 'n = ' + n);"
      }
    ]
  },
  {
    "id": "ex-stone-game-iv",
    "chapter": "dsa-games-probability-dp",
    "level": "intermediate",
    "title": "Stone Game IV",
    "brief": "<p>Alice and Bob take turns, Alice first, with a pile of <code>n</code> stones. On a turn the player removes any <b>non-zero square number</b> of stones (1, 4, 9, 16, ...) from the pile. The player who cannot move loses. Return <code>true</code> if Alice wins with optimal play.</p><ul><li><code>winnerSquareGame(1)</code> is <code>true</code></li><li><code>winnerSquareGame(2)</code> is <code>false</code>: Alice takes 1 and Bob takes the last one</li><li><code>winnerSquareGame(7)</code> is <code>false</code></li><li><code>n</code> is up to <code>100000</code></li></ul>",
    "starter": "function winnerSquareGame(n) {\n  // TODO: win[k] is true when some square s*s <= k leaves a losing position\n}\n",
    "hints": [
      "The position is the number of stones left. Define win[k] for the player to move with k stones, and win[0] = false.",
      "win[k] is true exactly when some square s*s <= k has win[k - s*s] false.",
      "Fill k from 1 to n. Each k tries about sqrt(k) squares, so the time is O(n sqrt n) and the space O(n)."
    ],
    "solution": "function winnerSquareGame(n) {\n  const win = new Array(n + 1).fill(false);\n  for (let k = 1; k <= n; k++) {\n    for (let s = 1; s * s <= k; s++) {\n      if (!win[k - s * s]) {\n        win[k] = true;\n        break;\n      }\n    }\n  }\n  return win[n];\n}\n",
    "tests": [
      {
        "name": "the first few values",
        "body": "assert.equal(winnerSquareGame(1), true);\nassert.equal(winnerSquareGame(2), false);\nassert.equal(winnerSquareGame(3), true);\nassert.equal(winnerSquareGame(4), true);"
      },
      {
        "name": "examples with larger piles",
        "body": "assert.equal(winnerSquareGame(7), false);\nassert.equal(winnerSquareGame(17), false);"
      },
      {
        "name": "matches a plain recursive search with no memo for n up to 28",
        "body": "const brute = (k) => { for (let s = 1; s * s <= k; s++) if (!brute(k - s * s)) return true; return false; };\nfor (let n = 1; n <= 28; n++) assert.equal(winnerSquareGame(n), brute(n), 'n = ' + n);"
      },
      {
        "name": "matches a memoized search for every n up to 600",
        "body": "const memo = new Map();\nconst go = (k) => { if (k === 0) return false; if (memo.has(k)) return memo.get(k); let w = false; for (let s = 1; s * s <= k && !w; s++) if (!go(k - s * s)) w = true; memo.set(k, w); return w; };\nfor (let n = 1; n <= 600; n++) assert.equal(winnerSquareGame(n), go(n), 'n = ' + n);"
      },
      {
        "name": "the losing pile sizes up to 60",
        "body": "const losing = [];\nfor (let n = 0; n <= 60; n++) if (n === 0 || !winnerSquareGame(n)) losing.push(n);\nassert.deepEqual(losing, [0, 2, 5, 7, 10, 12, 15, 17, 20, 22, 34, 39, 44, 52, 57]);"
      },
      {
        "name": "the largest allowed pile is fast",
        "body": "const r = winnerSquareGame(100000);\nassert.equal(typeof r, 'boolean');"
      }
    ]
  },
  {
    "id": "ex-predict-the-winner",
    "chapter": "dsa-games-probability-dp",
    "level": "intermediate",
    "title": "Predict the Winner",
    "brief": "<p>The integer array <code>nums</code> lies in a row. Two players alternate, player 1 first. On a turn the player takes <b>either end</b> of the row, adds that number to their own score, and removes it from the row. When the row is empty, the player with the higher score wins, and a tie is a win for player 1. Return <code>true</code> if player 1 can win when both play optimally.</p><ul><li><code>predictTheWinner([1, 5, 2])</code> is <code>false</code></li><li><code>predictTheWinner([1, 5, 233, 7])</code> is <code>true</code>: take the 1 first</li><li>The row has between 1 and 20 numbers, each from 0 to 10<sup>7</sup></li></ul>",
    "starter": "function predictTheWinner(nums) {\n  // TODO: lead[i][j] = best (mover score - other score) on nums[i..j]\n}\n",
    "hints": [
      "Do not store the best total. Store the best lead (your score minus the opponent's) for the player to move on nums[i..j].",
      "Taking the left end gains nums[i], and then the opponent is the mover on [i + 1, j], whose best lead is lead[i + 1][j]. So your lead is nums[i] - lead[i + 1][j]. Take the larger of the left and right options.",
      "lead[i][i] = nums[i]. Fill intervals by increasing length. Player 1 wins when lead[0][n - 1] >= 0 (a tie counts)."
    ],
    "solution": "function predictTheWinner(nums) {\n  const n = nums.length;\n  const lead = Array.from({ length: n }, () => new Array(n).fill(0));\n  for (let i = 0; i < n; i++) lead[i][i] = nums[i];\n  for (let len = 2; len <= n; len++) {\n    for (let i = 0; i + len - 1 < n; i++) {\n      const j = i + len - 1;\n      lead[i][j] = Math.max(nums[i] - lead[i + 1][j], nums[j] - lead[i][j - 1]);\n    }\n  }\n  return lead[0][n - 1] >= 0;\n}\n",
    "tests": [
      {
        "name": "player 1 loses on [1, 5, 2]",
        "body": "assert.equal(predictTheWinner([1, 5, 2]), false);"
      },
      {
        "name": "player 1 wins on [1, 5, 233, 7] by opening with the 1",
        "body": "assert.equal(predictTheWinner([1, 5, 233, 7]), true);"
      },
      {
        "name": "a single number goes to player 1",
        "body": "assert.equal(predictTheWinner([5]), true);\nassert.equal(predictTheWinner([0]), true);"
      },
      {
        "name": "a tie counts as a win for player 1",
        "body": "assert.equal(predictTheWinner([4, 4]), true);\nassert.equal(predictTheWinner([3, 7, 3, 7]), true);\nassert.equal(predictTheWinner([2, 2, 2]), true);"
      },
      {
        "name": "two numbers: take the larger",
        "body": "assert.equal(predictTheWinner([3, 9]), true);\nassert.equal(predictTheWinner([9, 3]), true);"
      },
      {
        "name": "player 1 loses on [2, 4, 55, 6, 8] even with optimal play",
        "body": "assert.equal(predictTheWinner([2, 4, 55, 6, 8]), false);"
      },
      {
        "name": "matches an exhaustive search that tracks both scores, on random rows",
        "body": "let seed = 11;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nconst brute = (a, i, j) => { if (i > j) return [0, 0]; const l = brute(a, i + 1, j); const r = brute(a, i, j - 1); const optL = [a[i] + l[1], l[0]]; const optR = [a[j] + r[1], r[0]]; return optL[0] >= optR[0] ? optL : optR; };\nfor (let t = 0; t < 300; t++) {\n  const n = 1 + rnd(11);\n  const a = Array.from({ length: n }, () => rnd(30));\n  const [p1, p2] = brute(a, 0, n - 1);\n  assert.equal(predictTheWinner(a), p1 >= p2, JSON.stringify(a));\n}"
      },
      {
        "name": "twenty numbers are answered quickly",
        "body": "const a = Array.from({ length: 20 }, (_, i) => (i * 7919) % 101);\nassert.equal(typeof predictTheWinner(a), 'boolean');"
      }
    ]
  },
  {
    "id": "ex-stone-game-iii",
    "chapter": "dsa-games-probability-dp",
    "level": "advanced",
    "title": "Stone Game III",
    "brief": "<p>Alice and Bob play with a row of piles whose values are in <code>stoneValue</code> (values may be negative). Alice goes first. On each turn a player takes <b>1, 2 or 3</b> piles from the <b>front</b> of the row. Each player's score is the sum of the piles they took. The game ends when the piles are gone. Return <code>\"Alice\"</code>, <code>\"Bob\"</code> or <code>\"Tie\"</code> for the player with the higher score, with both playing optimally.</p><ul><li><code>stoneGameIII([1, 2, 3, 7])</code> is <code>\"Bob\"</code></li><li><code>stoneGameIII([1, 2, 3, -9])</code> is <code>\"Alice\"</code></li><li><code>stoneGameIII([1, 2, 3, 6])</code> is <code>\"Tie\"</code></li></ul>",
    "starter": "function stoneGameIII(stoneValue) {\n  // TODO: lead[i] = best (mover - other) when piles i.. remain\n}\n",
    "hints": [
      "The position is the index i of the first remaining pile. Store the best lead (mover minus other) for the player to move.",
      "Taking k piles gains their sum and then hands the opponent lead[i + k]. So lead[i] = max over k in 1..3 of (sum of those k piles) - lead[i + k], with lead[n] = 0.",
      "Start each maximum at -Infinity (a player may not pass), guard i + k <= n, fill i from n - 1 down to 0, then compare lead[0] with 0."
    ],
    "solution": "function stoneGameIII(stoneValue) {\n  const n = stoneValue.length;\n  const lead = new Array(n + 1).fill(0);\n  for (let i = n - 1; i >= 0; i--) {\n    let taken = 0;\n    lead[i] = -Infinity;\n    for (let k = 1; k <= 3 && i + k <= n; k++) {\n      taken += stoneValue[i + k - 1];\n      lead[i] = Math.max(lead[i], taken - lead[i + k]);\n    }\n  }\n  if (lead[0] > 0) return 'Alice';\n  if (lead[0] < 0) return 'Bob';\n  return 'Tie';\n}\n",
    "tests": [
      {
        "name": "Bob wins on [1, 2, 3, 7]",
        "body": "assert.equal(stoneGameIII([1, 2, 3, 7]), 'Bob');"
      },
      {
        "name": "Alice wins on [1, 2, 3, -9]",
        "body": "assert.equal(stoneGameIII([1, 2, 3, -9]), 'Alice');"
      },
      {
        "name": "a tie on [1, 2, 3, 6]",
        "body": "assert.equal(stoneGameIII([1, 2, 3, 6]), 'Tie');"
      },
      {
        "name": "all negative piles: the least bad play still ties here",
        "body": "assert.equal(stoneGameIII([-1, -2, -3]), 'Tie');"
      },
      {
        "name": "one pile",
        "body": "assert.equal(stoneGameIII([5]), 'Alice');\nassert.equal(stoneGameIII([-5]), 'Bob');\nassert.equal(stoneGameIII([0]), 'Tie');"
      },
      {
        "name": "a player may not pass, even when every move costs points",
        "body": "assert.equal(stoneGameIII([-3, -3]), 'Tie');\nassert.equal(stoneGameIII([-2, -5]), 'Alice');\nassert.equal(stoneGameIII([-1, -9, 10, 10]), 'Bob');"
      },
      {
        "name": "matches an exhaustive search over both scores on random rows",
        "body": "let seed = 5;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nconst play = (v, i, turn, sc) => { if (i >= v.length) return sc.slice(); let best = null; let taken = 0; for (let k = 1; k <= 3 && i + k <= v.length; k++) { taken += v[i + k - 1]; const next = sc.slice(); next[turn] += taken; const r = play(v, i + k, 1 - turn, next); if (best === null || r[turn] > best[turn]) best = r; } return best; };\nfor (let t = 0; t < 300; t++) {\n  const n = 1 + rnd(11);\n  const v = Array.from({ length: n }, () => rnd(41) - 20);\n  const [a, b] = play(v, 0, 0, [0, 0]);\n  assert.equal(stoneGameIII(v), a > b ? 'Alice' : a < b ? 'Bob' : 'Tie', JSON.stringify(v));\n}"
      },
      {
        "name": "fifty thousand piles in linear time",
        "body": "const v = Array.from({ length: 50000 }, (_, i) => ((i * 7919) % 2001) - 1000);\nconst r = stoneGameIII(v);\nassert.ok(r === 'Alice' || r === 'Bob' || r === 'Tie');"
      }
    ]
  },
  {
    "id": "ex-stone-game-ii",
    "chapter": "dsa-games-probability-dp",
    "level": "advanced",
    "title": "Stone Game II",
    "brief": "<p>Alice and Bob take turns, Alice first, with a row of piles <code>piles[i]</code> (all positive). Start with <code>M = 1</code>. On a turn the player takes <b>all the stones in the first X remaining piles</b>, for any <code>1 &lt;= X &lt;= 2M</code>, and then <code>M</code> becomes <code>max(M, X)</code>. The game ends when no piles remain. Return the most stones Alice can collect when both players play to collect as many as possible.</p><ul><li><code>stoneGameII([2, 7, 9, 4, 4])</code> is <code>10</code></li><li><code>stoneGameII([1, 2, 3, 4, 5, 100])</code> is <code>104</code></li><li>There are up to 100 piles</li></ul>",
    "starter": "function stoneGameII(piles) {\n  // TODO: state (i, M); best(i, M) = most stones the mover can collect from piles i..\n}\n",
    "hints": [
      "The legal moves depend on M, so the state is (i, M): the first remaining pile and the current limit. Memoize on both.",
      "Every remaining stone goes to someone, so after you take X piles the opponent collects best(i + X, max(M, X)) of the rest, and you keep suffix[i] minus that.",
      "best(i, M) = max over X in 1..2M of suffix[i] - best(i + X, max(M, X)). If i + 2M >= n the mover can take everything and gets suffix[i] (valid because every pile is positive)."
    ],
    "solution": "function stoneGameII(piles) {\n  const n = piles.length;\n  const suffix = new Array(n + 1).fill(0);\n  for (let i = n - 1; i >= 0; i--) suffix[i] = suffix[i + 1] + piles[i];\n  const memo = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(-1));\n  const best = (i, M) => {\n    if (i + 2 * M >= n) return suffix[i];\n    if (memo[i][M] !== -1) return memo[i][M];\n    let most = 0;\n    for (let x = 1; x <= 2 * M; x++) {\n      most = Math.max(most, suffix[i] - best(i + x, Math.max(M, x)));\n    }\n    memo[i][M] = most;\n    return most;\n  };\n  return best(0, 1);\n}\n",
    "tests": [
      {
        "name": "the first example",
        "body": "assert.equal(stoneGameII([2, 7, 9, 4, 4]), 10);"
      },
      {
        "name": "a heavy last pile",
        "body": "assert.equal(stoneGameII([1, 2, 3, 4, 5, 100]), 104);"
      },
      {
        "name": "one pile and two piles",
        "body": "assert.equal(stoneGameII([5]), 5);\nassert.equal(stoneGameII([3, 9]), 12);"
      },
      {
        "name": "three equal piles",
        "body": "assert.equal(stoneGameII([4, 4, 4]), 8);"
      },
      {
        "name": "matches an exhaustive search that tracks both totals, on random rows",
        "body": "let seed = 13;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nconst play = (p, i, M, turn, sc) => { if (i >= p.length) return sc.slice(); let best = null; let taken = 0; for (let x = 1; x <= 2 * M && i + x <= p.length; x++) { taken += p[i + x - 1]; const next = sc.slice(); next[turn] += taken; const r = play(p, i + x, Math.max(M, x), 1 - turn, next); if (best === null || r[turn] > best[turn]) best = r; } return best; };\nfor (let t = 0; t < 250; t++) {\n  const n = 1 + rnd(10);\n  const p = Array.from({ length: n }, () => 1 + rnd(20));\n  assert.equal(stoneGameII(p), play(p, 0, 1, 0, [0, 0])[0], JSON.stringify(p));\n}"
      },
      {
        "name": "never more than the total, never zero",
        "body": "const p = Array.from({ length: 60 }, (_, i) => 1 + ((i * 37) % 23));\nconst total = p.reduce((a, b) => a + b, 0);\nconst r = stoneGameII(p);\nassert.ok(r > 0 && r <= total);"
      },
      {
        "name": "one hundred piles finish quickly",
        "body": "const p = Array.from({ length: 100 }, (_, i) => 1 + ((i * 7919) % 10000));\nconst r = stoneGameII(p);\nassert.ok(Number.isInteger(r) && r > 0);"
      }
    ]
  },
  {
    "id": "ex-flip-game-ii",
    "chapter": "dsa-games-probability-dp",
    "level": "advanced",
    "title": "Flip Game II",
    "brief": "<p>A string <code>currentState</code> contains only <code>'+'</code> and <code>'-'</code>. Two players take turns; a move chooses two <b>consecutive</b> <code>\"++\"</code> and flips them to <code>\"--\"</code>. The player who can no longer move loses. Return <code>true</code> if the player who moves first can guarantee a win.</p><ul><li><code>canWin(\"++++\")</code> is <code>true</code>: flip the middle, leaving <code>\"+--+\"</code>, and the opponent has no move</li><li><code>canWin(\"+\")</code> is <code>false</code></li><li>The string has at most 25 characters</li></ul>",
    "starter": "function canWin(currentState) {\n  // TODO: the string is the position; memoize on it\n}\n",
    "hints": [
      "A position is the string. The mover wins if some flip of two neighbouring pluses leaves the opponent in a losing position.",
      "With no \"++\" left, the mover cannot move and loses, so the loop simply finds no winning flip.",
      "Memoize results in a Map keyed by the string. Build each next string with slice, since strings are immutable."
    ],
    "solution": "function canWin(currentState) {\n  const memo = new Map();\n  const wins = (state) => {\n    if (memo.has(state)) return memo.get(state);\n    let result = false;\n    for (let i = 0; i + 1 < state.length && !result; i++) {\n      if (state[i] === '+' && state[i + 1] === '+') {\n        if (!wins(state.slice(0, i) + '--' + state.slice(i + 2))) result = true;\n      }\n    }\n    memo.set(state, result);\n    return result;\n  };\n  return wins(currentState);\n}\n",
    "tests": [
      {
        "name": "four pluses are won by flipping the middle",
        "body": "assert.equal(canWin('++++'), true);"
      },
      {
        "name": "no move to make",
        "body": "assert.equal(canWin(''), false);\nassert.equal(canWin('+'), false);\nassert.equal(canWin('-+-+-'), false);\nassert.equal(canWin('+-+'), false);"
      },
      {
        "name": "short rows of pluses",
        "body": "assert.equal(canWin('++'), true);\nassert.equal(canWin('+++'), true);\nassert.equal(canWin('+++++'), false);"
      },
      {
        "name": "pluses separated by minus signs",
        "body": "assert.equal(canWin('++-++'), false);\nassert.equal(canWin('++-+++'), false);\nassert.equal(canWin('++++-++'), true);\nassert.equal(canWin('++-++-++'), true);"
      },
      {
        "name": "matches a plain recursive search with no memo on every string of length 10 or less",
        "body": "const brute = (s) => { for (let i = 0; i + 1 < s.length; i++) if (s[i] === '+' && s[i + 1] === '+' && !brute(s.slice(0, i) + '--' + s.slice(i + 2))) return true; return false; };\nfor (let len = 0; len <= 10; len++) for (let mask = 0; mask < (1 << len); mask++) {\n  let s = '';\n  for (let i = 0; i < len; i++) s += (mask >> i) & 1 ? '+' : '-';\n  assert.equal(canWin(s), brute(s), s);\n}"
      },
      {
        "name": "a long string is answered in reasonable time",
        "body": "const r = canWin('+'.repeat(22));\nassert.equal(typeof r, 'boolean');"
      }
    ]
  },
  {
    "id": "ex-nim-winning-move",
    "chapter": "dsa-games-probability-dp",
    "level": "advanced",
    "title": "Nim: find a winning move",
    "brief": "<p>In Nim there are several heaps of stones, and a move removes <b>any positive number</b> of stones from <b>one</b> heap. The player who cannot move loses. Write <code>nimMove(heaps)</code>. If the player to move is in a losing position, return <code>null</code>. Otherwise return <code>[index, count]</code>: remove <code>count</code> stones from the heap at <code>index</code>, so that the opponent is left in a losing position.</p><ul><li><code>nimMove([1, 2, 3])</code> is <code>null</code> (1 ^ 2 ^ 3 = 0)</li><li><code>nimMove([3, 4, 5])</code> may return <code>[0, 2]</code>, leaving <code>[1, 4, 5]</code></li><li>Any correct winning move is accepted; the tests check the result, not one specific answer</li></ul>",
    "starter": "function nimMove(heaps) {\n  // TODO: use the XOR of all heap sizes\n}\n",
    "hints": [
      "The player to move loses exactly when the XOR of all the heap sizes is 0. Compute the XOR s first; if s is 0 return null.",
      "Otherwise you need to make the XOR 0 by changing exactly one heap h into h ^ s. That is a legal move only when h ^ s < h.",
      "Scan the heaps and take the first with (h ^ s) < h, and return [index, h - (h ^ s)]. Such a heap exists: it is any heap that has the highest set bit of s."
    ],
    "solution": "function nimMove(heaps) {\n  let xor = 0;\n  for (const h of heaps) xor ^= h;\n  if (xor === 0) return null;\n  for (let i = 0; i < heaps.length; i++) {\n    const target = heaps[i] ^ xor;\n    if (target < heaps[i]) return [i, heaps[i] - target];\n  }\n  return null;\n}\n",
    "tests": [
      {
        "name": "a zero XOR has no winning move",
        "body": "assert.equal(nimMove([1, 2, 3]), null);\nassert.equal(nimMove([5, 5]), null);\nassert.equal(nimMove([]), null);\nassert.equal(nimMove([0, 0]), null);"
      },
      {
        "name": "one heap: take it all",
        "body": "const m = nimMove([7]);\nassert.deepEqual(m, [0, 7]);"
      },
      {
        "name": "the result is legal and leaves a zero XOR for [3, 4, 5]",
        "body": "const heaps = [3, 4, 5];\nconst m = nimMove(heaps);\nassert.ok(Array.isArray(m) && m.length === 2);\nassert.ok(Number.isInteger(m[0]) && m[0] >= 0 && m[0] < heaps.length);\nassert.ok(Number.isInteger(m[1]) && m[1] >= 1 && m[1] <= heaps[m[0]]);\nconst after = heaps.slice();\nafter[m[0]] -= m[1];\nassert.equal(after.reduce((a, b) => a ^ b, 0), 0);"
      },
      {
        "name": "two unequal heaps: equalize them",
        "body": "const m = nimMove([9, 4]);\nassert.deepEqual(m, [0, 5]);"
      },
      {
        "name": "a heap that does not have the top bit is not touched",
        "body": "const m = nimMove([1, 8, 8, 1, 6]);\nassert.ok(m !== null);\nconst after = [1, 8, 8, 1, 6];\nassert.ok(m[1] >= 1 && m[1] <= after[m[0]]);\nafter[m[0]] -= m[1];\nassert.equal(after.reduce((a, b) => a ^ b, 0), 0);"
      },
      {
        "name": "random positions: a move exists exactly when the XOR is not zero, and it wins",
        "body": "let seed = 17;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfor (let t = 0; t < 400; t++) {\n  const k = 1 + rnd(6);\n  const heaps = Array.from({ length: k }, () => rnd(40));\n  const xor = heaps.reduce((a, b) => a ^ b, 0);\n  const m = nimMove(heaps);\n  if (xor === 0) { assert.equal(m, null, JSON.stringify(heaps)); continue; }\n  assert.ok(m !== null, JSON.stringify(heaps));\n  assert.ok(m[1] >= 1 && m[1] <= heaps[m[0]], 'legal ' + JSON.stringify(heaps));\n  const after = heaps.slice();\n  after[m[0]] -= m[1];\n  assert.equal(after.reduce((a, b) => a ^ b, 0), 0, JSON.stringify(heaps));\n}"
      },
      {
        "name": "large heaps",
        "body": "const heaps = [1000000007, 999999937, 123456789];\nconst xor = heaps.reduce((a, b) => a ^ b, 0);\nconst m = nimMove(heaps);\nif (xor === 0) assert.equal(m, null);\nelse {\n  const after = heaps.slice();\n  after[m[0]] -= m[1];\n  assert.ok(m[1] >= 1 && m[1] <= heaps[m[0]]);\n  assert.equal(after.reduce((a, b) => a ^ b, 0), 0);\n}"
      }
    ]
  },
  {
    "id": "ex-expected-rolls-to-reach",
    "chapter": "dsa-games-probability-dp",
    "level": "advanced",
    "title": "Expected rolls to reach a target",
    "brief": "<p>A fair die with <code>faces</code> sides (numbered 1 to <code>faces</code>) is rolled repeatedly, and the numbers rolled are added up. Return the <b>expected number of rolls</b> until the total is at least <code>target</code>. The answer is a real number; the tests accept an error of 1e-9.</p><ul><li><code>expectedRolls(1, 6)</code> is <code>1</code></li><li><code>expectedRolls(2, 6)</code> is <code>7/6</code></li><li><code>expectedRolls(3, 6)</code> is <code>49/36</code></li><li><code>target</code> is at most 5000 and <code>faces</code> at most 100</li></ul>",
    "starter": "function expectedRolls(target, faces) {\n  // TODO: E[s] = 1 + average of E[s + face], and E[s] = 0 once s >= target\n}\n",
    "hints": [
      "Let E[s] be the expected number of further rolls from total s. For s >= target it is 0.",
      "From s < target one roll is made, which costs 1, and lands on s + face for each face with probability 1 / faces. So E[s] = 1 + (sum of E[s + face]) / faces.",
      "The total only grows, so fill s from target - 1 down to 0 and return E[0]. Pad the array with zeros so that s + face past the target reads 0. Summing faces entries per state gives O(target * faces); a sliding sum makes it O(target)."
    ],
    "solution": "function expectedRolls(target, faces) {\n  const expected = new Array(target + faces + 1).fill(0);\n  let window = 0;\n  for (let s = target - 1; s >= 0; s--) {\n    window += expected[s + 1];\n    window -= expected[s + faces + 1];\n    expected[s] = 1 + window / faces;\n  }\n  return expected[0];\n}\n",
    "tests": [
      {
        "name": "a target of one needs exactly one roll",
        "body": "assert.ok(Math.abs(expectedRolls(1, 6) - 1) < 1e-9);\nassert.ok(Math.abs(expectedRolls(1, 1) - 1) < 1e-9);"
      },
      {
        "name": "targets 2 and 3 on a six-sided die",
        "body": "assert.ok(Math.abs(expectedRolls(2, 6) - 7 / 6) < 1e-9);\nassert.ok(Math.abs(expectedRolls(3, 6) - 49 / 36) < 1e-9);"
      },
      {
        "name": "a one-sided die rolls a 1 every time",
        "body": "assert.ok(Math.abs(expectedRolls(5, 1) - 5) < 1e-9);\nassert.ok(Math.abs(expectedRolls(40, 1) - 40) < 1e-9);"
      },
      {
        "name": "a two-sided die and target 3",
        "body": "assert.ok(Math.abs(expectedRolls(3, 2) - 2.25) < 1e-9);"
      },
      {
        "name": "matches the finishing-time distribution, summed as t * P(finish at t)",
        "body": "const viaDistribution = (target, faces) => {\n  let dist = new Array(target).fill(0);\n  dist[0] = 1;\n  let e = 0;\n  for (let t = 1; t <= 3000; t++) {\n    const next = new Array(target).fill(0);\n    let done = 0;\n    for (let s = 0; s < target; s++) {\n      if (dist[s] === 0) continue;\n      for (let f = 1; f <= faces; f++) {\n        if (s + f >= target) done += dist[s] / faces;\n        else next[s + f] += dist[s] / faces;\n      }\n    }\n    e += t * done;\n    dist = next;\n  }\n  return e;\n};\nfor (const [target, faces] of [[7, 6], [20, 6], [50, 6], [30, 4], [25, 10], [9, 2]]) {\n  assert.ok(Math.abs(expectedRolls(target, faces) - viaDistribution(target, faces)) < 1e-9, target + ',' + faces);\n}"
      },
      {
        "name": "the average roll is (faces + 1) / 2, so large targets need about target / that rolls",
        "body": "const e = expectedRolls(1000, 6);\nassert.ok(e > 1000 / 3.5 && e < 1000 / 3.5 + 2);"
      },
      {
        "name": "the largest inputs run quickly",
        "body": "const e = expectedRolls(5000, 100);\nassert.ok(e > 0 && e < 5000);"
      }
    ]
  },
  {
    "id": "ex-knight-probability",
    "chapter": "dsa-games-probability-dp",
    "level": "advanced",
    "title": "Knight Probability in Chessboard",
    "brief": "<p>A knight is on an <code>n x n</code> board at <code>(row, column)</code>, with rows and columns numbered from 0. It makes exactly <code>k</code> moves. On each move it picks one of its <b>8</b> possible knight moves uniformly at random, even if that move leaves the board, and once it is off the board it stays off. Return the probability that the knight is still on the board after <code>k</code> moves. The tests accept an error of 1e-9.</p><ul><li><code>knightProbability(3, 2, 0, 0)</code> is <code>0.0625</code></li><li><code>knightProbability(1, 0, 0, 0)</code> is <code>1</code></li><li><code>n</code> is up to 25 and <code>k</code> up to 100</li></ul>",
    "starter": "function knightProbability(n, k, row, column) {\n  // TODO: push the probability forward one move at a time\n}\n",
    "hints": [
      "Keep a grid whose cell (r, c) holds the probability of being there after t moves and never having left the board. Start with 1 at (row, column).",
      "For each cell with probability p, each of the 8 moves that stays on the board adds p / 8 to the target cell of the next grid. Moves that leave the board are simply dropped: that probability is gone for good.",
      "Use a fresh grid for each move (never update in place), and after k moves return the sum of the whole grid. Time O(k * n^2 * 8)."
    ],
    "solution": "function knightProbability(n, k, row, column) {\n  const moves = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];\n  let now = Array.from({ length: n }, () => new Array(n).fill(0));\n  now[row][column] = 1;\n  for (let step = 0; step < k; step++) {\n    const next = Array.from({ length: n }, () => new Array(n).fill(0));\n    for (let r = 0; r < n; r++) {\n      for (let c = 0; c < n; c++) {\n        if (now[r][c] === 0) continue;\n        for (const [dr, dc] of moves) {\n          const nr = r + dr;\n          const nc = c + dc;\n          if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;\n          next[nr][nc] += now[r][c] / 8;\n        }\n      }\n    }\n    now = next;\n  }\n  let total = 0;\n  for (const line of now) for (const p of line) total += p;\n  return total;\n}\n",
    "tests": [
      {
        "name": "the standard example",
        "body": "assert.ok(Math.abs(knightProbability(3, 2, 0, 0) - 0.0625) < 1e-9);"
      },
      {
        "name": "zero moves keep the knight where it is",
        "body": "assert.ok(Math.abs(knightProbability(1, 0, 0, 0) - 1) < 1e-12);\nassert.ok(Math.abs(knightProbability(8, 0, 3, 4) - 1) < 1e-12);"
      },
      {
        "name": "a 1 x 1 board is left by any move",
        "body": "assert.ok(Math.abs(knightProbability(1, 1, 0, 0)) < 1e-12);"
      },
      {
        "name": "a 3 x 3 board: the centre has no moves, so one move from a corner leaves 2 of 8",
        "body": "assert.ok(Math.abs(knightProbability(3, 1, 0, 0) - 0.25) < 1e-12);\nassert.ok(Math.abs(knightProbability(3, 1, 1, 1)) < 1e-12);"
      },
      {
        "name": "matches a direct count of all 8^k move sequences on small boards",
        "body": "let seed = 21;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nconst MV = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];\nconst count = (n, k, r, c) => { if (r < 0 || r >= n || c < 0 || c >= n) return 0; if (k === 0) return 1; let s = 0; for (const [a, b] of MV) s += count(n, k - 1, r + a, c + b); return s; };\nfor (let t = 0; t < 80; t++) {\n  const n = 1 + rnd(6);\n  const k = rnd(6);\n  const r = rnd(n);\n  const c = rnd(n);\n  const want = count(n, k, r, c) / Math.pow(8, k);\n  assert.ok(Math.abs(knightProbability(n, k, r, c) - want) < 1e-9, [n, k, r, c].join(','));\n}"
      },
      {
        "name": "a larger example",
        "body": "assert.ok(Math.abs(knightProbability(8, 30, 6, 4) - 0.00019052566298333653) < 1e-12);"
      },
      {
        "name": "the probability never rises with more moves",
        "body": "let last = 1;\nfor (let k = 0; k <= 12; k++) {\n  const p = knightProbability(8, k, 0, 0);\n  assert.ok(p <= last + 1e-12);\n  last = p;\n}"
      },
      {
        "name": "the largest board with the most moves is fast and a probability",
        "body": "const p = knightProbability(25, 100, 12, 12);\nassert.ok(p > 0 && p < 1);"
      }
    ]
  },
  {
    "id": "ex-out-of-boundary-paths",
    "chapter": "dsa-games-probability-dp",
    "level": "advanced",
    "title": "Out of Boundary Paths",
    "brief": "<p>A ball sits at <code>(startRow, startColumn)</code> of an <code>m x n</code> grid. In one move it goes to one of the four neighbouring cells, which may be outside the grid. It may make <b>at most</b> <code>maxMove</code> moves. Return the number of different move sequences that take the ball out of the grid, <b>modulo 1,000,000,007</b>. A path is counted once, when the ball first leaves.</p><ul><li><code>findPaths(2, 2, 2, 0, 0)</code> is <code>6</code></li><li><code>findPaths(1, 3, 3, 0, 1)</code> is <code>12</code></li><li><code>m</code> and <code>n</code> are up to 50 and <code>maxMove</code> up to 50</li></ul>",
    "starter": "function findPaths(m, n, maxMove, startRow, startColumn) {\n  // TODO: ways[r][c] after each move; add the paths that leave to the answer\n}\n",
    "hints": [
      "Keep a grid of how many move sequences are on each cell after t moves without having left. Start with 1 at the start cell.",
      "On each move, push every cell's count to its four neighbours. A neighbour outside the grid means those paths leave now: add the count to the answer instead of to a cell.",
      "Take the remainder modulo 1,000,000,007 after every addition. Counts and sums stay below 2^53 so plain numbers are exact. Time O(maxMove * m * n * 4)."
    ],
    "solution": "function findPaths(m, n, maxMove, startRow, startColumn) {\n  const MOD = 1000000007;\n  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];\n  let ways = Array.from({ length: m }, () => new Array(n).fill(0));\n  ways[startRow][startColumn] = 1;\n  let out = 0;\n  for (let move = 0; move < maxMove; move++) {\n    const next = Array.from({ length: m }, () => new Array(n).fill(0));\n    for (let r = 0; r < m; r++) {\n      for (let c = 0; c < n; c++) {\n        const w = ways[r][c];\n        if (w === 0) continue;\n        for (const [dr, dc] of dirs) {\n          const nr = r + dr;\n          const nc = c + dc;\n          if (nr < 0 || nr >= m || nc < 0 || nc >= n) out = (out + w) % MOD;\n          else next[nr][nc] = (next[nr][nc] + w) % MOD;\n        }\n      }\n    }\n    ways = next;\n  }\n  return out;\n}\n",
    "tests": [
      {
        "name": "the first example",
        "body": "assert.equal(findPaths(2, 2, 2, 0, 0), 6);"
      },
      {
        "name": "the second example",
        "body": "assert.equal(findPaths(1, 3, 3, 0, 1), 12);"
      },
      {
        "name": "no moves, no exits",
        "body": "assert.equal(findPaths(3, 3, 0, 1, 1), 0);"
      },
      {
        "name": "a corner cell exits in two ways on the first move",
        "body": "assert.equal(findPaths(5, 5, 1, 0, 0), 2);\nassert.equal(findPaths(5, 5, 1, 2, 2), 0);\nassert.equal(findPaths(1, 1, 1, 0, 0), 4);"
      },
      {
        "name": "a larger example with a remainder",
        "body": "assert.equal(findPaths(8, 7, 16, 1, 5), 102984580);"
      },
      {
        "name": "matches full path enumeration on small grids",
        "body": "let seed = 31;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nconst brute = (m, n, mv, r, c) => { if (r < 0 || r >= m || c < 0 || c >= n) return 1; if (mv === 0) return 0; return brute(m, n, mv - 1, r + 1, c) + brute(m, n, mv - 1, r - 1, c) + brute(m, n, mv - 1, r, c + 1) + brute(m, n, mv - 1, r, c - 1); };\nfor (let t = 0; t < 100; t++) {\n  const m = 1 + rnd(4);\n  const n = 1 + rnd(4);\n  const mv = rnd(8);\n  const r = rnd(m);\n  const c = rnd(n);\n  assert.equal(findPaths(m, n, mv, r, c), brute(m, n, mv, r, c) % 1000000007, [m, n, mv, r, c].join(','));\n}"
      },
      {
        "name": "matches an exact BigInt count that is reduced only at the end",
        "body": "const big = (m, n, mv, sr, sc) => {\n  let ways = Array.from({ length: m }, () => new Array(n).fill(0n));\n  ways[sr][sc] = 1n;\n  let out = 0n;\n  for (let s = 0; s < mv; s++) {\n    const nx = Array.from({ length: m }, () => new Array(n).fill(0n));\n    for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) {\n      const w = ways[r][c];\n      if (w === 0n) continue;\n      for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {\n        const nr = r + a; const nc = c + b;\n        if (nr < 0 || nr >= m || nc < 0 || nc >= n) out += w; else nx[nr][nc] += w;\n      }\n    }\n    ways = nx;\n  }\n  return out;\n};\nfor (const [m, n, mv, r, c] of [[10, 10, 50, 3, 4], [50, 50, 50, 25, 25], [30, 40, 50, 0, 7], [1, 1, 50, 0, 0]]) {\n  assert.equal(findPaths(m, n, mv, r, c), Number(big(m, n, mv, r, c) % 1000000007n), [m, n, mv, r, c].join(','));\n}"
      }
    ]
  },
  {
    "id": "ex-soup-servings",
    "chapter": "dsa-games-probability-dp",
    "level": "advanced",
    "title": "Soup Servings",
    "brief": "<p>There are two soups, A and B, each starting with <code>n</code> ml. On every turn one of four servings is chosen, each with probability 1/4, as the amounts of (A, B): <code>(100, 0)</code>, <code>(75, 25)</code>, <code>(50, 50)</code>, <code>(25, 75)</code>. If a soup has less than the serving asks for, it serves what is left. The process stops when at least one soup is empty. Return <code>P(A becomes empty first) + 0.5 * P(A and B become empty on the same turn)</code>. An answer within 1e-5 of the true value is accepted.</p><ul><li><code>soupServings(50)</code> is <code>0.625</code></li><li><code>soupServings(100)</code> is <code>0.71875</code></li><li><code>n</code> is up to <code>10^9</code>, so a table over the volumes will not do</li></ul>",
    "starter": "function soupServings(n) {\n  // TODO: count in units of 25 ml, memoize on (a, b), and stop at a cutoff for large n\n}\n",
    "hints": [
      "Every serving is a multiple of 25, so count in units: the servings are (4, 0), (3, 1), (2, 2), (1, 3) units, and n becomes ceil(n / 25) units (use ceil, not floor).",
      "f(a, b) = 0.25 * (f(a-4, b) + f(a-3, b-1) + f(a-2, b-2) + f(a-1, b-3)), with f = 0.5 if both are empty, 1 if only a is empty, and 0 if only b is empty. Memoize on (a, b).",
      "A loses 62.5 ml per turn on average and B only 37.5, so for large n the answer approaches 1. Compute the answer for n = 4800 and see that it is within 1e-5 of 1; return 1 for any n at or above the cutoff."
    ],
    "solution": "function soupServings(n) {\n  if (n >= 4800) return 1;\n  const units = Math.ceil(n / 25);\n  const memo = Array.from({ length: units + 1 }, () => new Array(units + 1).fill(-1));\n  const f = (a, b) => {\n    if (a <= 0 && b <= 0) return 0.5;\n    if (a <= 0) return 1;\n    if (b <= 0) return 0;\n    if (memo[a][b] !== -1) return memo[a][b];\n    memo[a][b] = 0.25 * (f(a - 4, b) + f(a - 3, b - 1) + f(a - 2, b - 2) + f(a - 1, b - 3));\n    return memo[a][b];\n  };\n  return f(units, units);\n}\n",
    "tests": [
      {
        "name": "the first example",
        "body": "assert.ok(Math.abs(soupServings(50) - 0.625) < 1e-5);"
      },
      {
        "name": "a second example",
        "body": "assert.ok(Math.abs(soupServings(100) - 0.71875) < 1e-5);"
      },
      {
        "name": "no soup at all: both are empty at once",
        "body": "assert.ok(Math.abs(soupServings(0) - 0.5) < 1e-5);"
      },
      {
        "name": "a very small amount",
        "body": "assert.ok(Math.abs(soupServings(1) - 0.625) < 1e-5);"
      },
      {
        "name": "sizes that are not multiples of 25 round up",
        "body": "assert.ok(Math.abs(soupServings(60) - 0.65625) < 1e-5);\nassert.ok(Math.abs(soupServings(99) - 0.71875) < 1e-5);"
      },
      {
        "name": "matches a plain game search with no memo, in raw millilitres, for n up to 150",
        "body": "const brute = (a, b) => { if (a <= 0 && b <= 0) return 0.5; if (a <= 0) return 1; if (b <= 0) return 0; let s = 0; for (const [x, y] of [[100, 0], [75, 25], [50, 50], [25, 75]]) s += 0.25 * brute(a - x, b - y); return s; };\nfor (let n = 0; n <= 150; n++) assert.ok(Math.abs(soupServings(n) - brute(n, n)) < 1e-5, 'n = ' + n);"
      },
      {
        "name": "large volumes are within tolerance of 1 and answered at once",
        "body": "assert.ok(Math.abs(soupServings(5000) - 1) < 1e-5);\nassert.ok(Math.abs(soupServings(100000) - 1) < 1e-5);\nassert.ok(Math.abs(soupServings(1000000000) - 1) < 1e-5);"
      },
      {
        "name": "mid-sized volumes are close to 1 but not equal to it",
        "body": "assert.ok(Math.abs(soupServings(1000) - 0.9765650521094358) < 1e-5);\nassert.ok(Math.abs(soupServings(2500) - 0.99925483400331) < 1e-5);\nassert.ok(soupServings(1000) < 0.99999);"
      }
    ]
  },
  {
    "id": "ex-new-21-game",
    "chapter": "dsa-games-probability-dp",
    "level": "advanced",
    "title": "New 21 Game",
    "brief": "<p>Alice starts with 0 points. While she has <b>fewer than</b> <code>k</code> points she draws a number uniformly at random from <code>1</code> to <code>maxPts</code> (independently each time) and adds it to her points. She stops as soon as she has <code>k</code> or more points. Return the probability that her final total is <b>at most</b> <code>n</code>. An answer within 1e-5 is accepted.</p><ul><li><code>new21Game(10, 1, 10)</code> is <code>1</code></li><li><code>new21Game(6, 1, 10)</code> is <code>0.6</code></li><li><code>new21Game(21, 17, 10)</code> is about <code>0.73278</code></li><li><code>n</code> is up to 10<sup>4</sup>, so an O(n * maxPts) sum per total may be too slow in the worst case</li></ul>",
    "starter": "function new21Game(n, k, maxPts) {\n  // TODO: reach[i] = chance the total ever equals i, with a sliding window sum\n}\n",
    "hints": [
      "Let reach[i] be the probability that Alice's total is ever exactly i. reach[0] = 1. She reaches i from a total j below k by drawing i - j, so reach[i] = (sum of reach[j] for j in [i - maxPts, i - 1] with j < k) / maxPts.",
      "The answer is the sum of reach[i] for k <= i <= n, because those are the totals where she stops. Handle k = 0 (no draw at all) and n >= k + maxPts - 1 (every final total is at most n) first: both answers are 1.",
      "Keep a running window sum instead of re-adding maxPts terms: after computing reach[i], add it if i < k, and subtract reach[i - maxPts] if that index is at least 0 and below k."
    ],
    "solution": "function new21Game(n, k, maxPts) {\n  if (k === 0 || n >= k + maxPts - 1) return 1;\n  const reach = new Array(n + 1).fill(0);\n  reach[0] = 1;\n  let window = 1;\n  let answer = 0;\n  for (let i = 1; i <= n; i++) {\n    reach[i] = window / maxPts;\n    if (i < k) window += reach[i];\n    else answer += reach[i];\n    if (i - maxPts >= 0 && i - maxPts < k) window -= reach[i - maxPts];\n  }\n  return answer;\n}\n",
    "tests": [
      {
        "name": "Alice never draws when k is 0",
        "body": "assert.ok(Math.abs(new21Game(0, 0, 1) - 1) < 1e-9);\nassert.ok(Math.abs(new21Game(5, 0, 3) - 1) < 1e-9);"
      },
      {
        "name": "one draw of at most 10 points",
        "body": "assert.ok(Math.abs(new21Game(10, 1, 10) - 1) < 1e-9);\nassert.ok(Math.abs(new21Game(6, 1, 10) - 0.6) < 1e-9);"
      },
      {
        "name": "the third example",
        "body": "assert.ok(Math.abs(new21Game(21, 17, 10) - 0.73278) < 1e-5);"
      },
      {
        "name": "a single-point draw lands exactly on k",
        "body": "assert.ok(Math.abs(new21Game(1, 1, 1) - 1) < 1e-9);\nassert.ok(Math.abs(new21Game(3, 5, 1) - 0) < 1e-9);"
      },
      {
        "name": "a hand-computed case",
        "body": "assert.ok(Math.abs(new21Game(5, 3, 4) - 0.921875) < 1e-9);"
      },
      {
        "name": "matches the direct recursion on small inputs",
        "body": "let seed = 41;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nconst direct = (n, k, W) => { const go = (p) => { if (p >= k) return p <= n ? 1 : 0; let s = 0; for (let j = 1; j <= W; j++) s += go(p + j); return s / W; }; return go(0); };\nfor (let t = 0; t < 150; t++) {\n  const k = rnd(8);\n  const W = 1 + rnd(5);\n  const n = rnd(k + W + 2);\n  assert.ok(Math.abs(new21Game(n, k, W) - direct(n, k, W)) < 1e-9, [n, k, W].join(','));\n}"
      },
      {
        "name": "matches the O(n * maxPts) table on a larger input",
        "body": "const slow = (n, k, W) => { if (k === 0 || n >= k + W - 1) return 1; const reach = new Array(n + 1).fill(0); reach[0] = 1; let a = 0; for (let i = 1; i <= n; i++) { let s = 0; for (let j = Math.max(0, i - W); j <= Math.min(i - 1, k - 1); j++) s += reach[j]; reach[i] = s / W; if (i >= k) a += reach[i]; } return a; };\nfor (const [n, k, W] of [[300, 250, 50], [600, 500, 100], [2000, 1500, 400]]) {\n  assert.ok(Math.abs(new21Game(n, k, W) - slow(n, k, W)) < 1e-9, [n, k, W].join(','));\n}"
      },
      {
        "name": "the largest input is fast",
        "body": "const p = new21Game(10000, 6000, 1000);\nassert.ok(p >= 0 && p <= 1);"
      }
    ]
  },
  {
    "id": "ex-dice-roll-simulation",
    "chapter": "dsa-games-probability-dp",
    "level": "advanced",
    "title": "Dice Roll Simulation",
    "brief": "<p>A die has faces 1 to 6 (index 0 to 5 in the array). It is rolled <code>n</code> times, and face <code>i</code> may not come up <b>more than</b> <code>rollMax[i]</code> times <b>in a row</b>. Return the number of different sequences of <code>n</code> rolls that obey every limit, <b>modulo 1,000,000,007</b>. Two sequences differ when some roll differs.</p><ul><li><code>dieSimulator(2, [1, 1, 2, 2, 2, 3])</code> is <code>34</code> (36 sequences, minus the pairs 1-1 and 2-2)</li><li><code>dieSimulator(2, [1, 1, 1, 1, 1, 1])</code> is <code>30</code></li><li><code>dieSimulator(3, [1, 1, 1, 2, 2, 3])</code> is <code>181</code></li><li><code>n</code> is up to 5000 and each <code>rollMax[i]</code> from 1 to 15</li></ul>",
    "starter": "function dieSimulator(n, rollMax) {\n  // TODO: state = (last face, run length of that face)\n}\n",
    "hints": [
      "The last face alone is not enough: you also need how many times in a row it has come up. Let dp[face][run] count the sequences so far that end in exactly `run` copies of `face`.",
      "Repeating a face turns (face, run) into (face, run + 1) when run + 1 <= rollMax[face]. Switching to a face starts a run of 1 and can come from every sequence that does not end in that face: all - endsIn[face].",
      "Reduce modulo 1,000,000,007 as you go and add MOD before taking the remainder of a subtraction, because % can return a negative number. After n rolls, add up the whole table."
    ],
    "solution": "function dieSimulator(n, rollMax) {\n  const MOD = 1000000007;\n  let dp = rollMax.map((limit) => new Array(limit + 1).fill(0));\n  for (let face = 0; face < 6; face++) dp[face][1] = 1;\n  for (let roll = 2; roll <= n; roll++) {\n    const endsIn = dp.map((runs) => runs.reduce((sum, count) => (sum + count) % MOD, 0));\n    const all = endsIn.reduce((sum, count) => (sum + count) % MOD, 0);\n    const next = rollMax.map((limit) => new Array(limit + 1).fill(0));\n    for (let face = 0; face < 6; face++) {\n      next[face][1] = (all - endsIn[face] + MOD) % MOD;\n      for (let run = 2; run <= rollMax[face]; run++) next[face][run] = dp[face][run - 1];\n    }\n    dp = next;\n  }\n  let total = 0;\n  for (const runs of dp) for (const count of runs) total = (total + count) % MOD;\n  return total;\n}\n",
    "tests": [
      {
        "name": "the first example",
        "body": "assert.equal(dieSimulator(2, [1, 1, 2, 2, 2, 3]), 34);"
      },
      {
        "name": "no face may repeat",
        "body": "assert.equal(dieSimulator(2, [1, 1, 1, 1, 1, 1]), 30);"
      },
      {
        "name": "the third example",
        "body": "assert.equal(dieSimulator(3, [1, 1, 1, 2, 2, 3]), 181);"
      },
      {
        "name": "one roll has six outcomes",
        "body": "assert.equal(dieSimulator(1, [1, 1, 1, 1, 1, 1]), 6);\nassert.equal(dieSimulator(1, [15, 15, 15, 15, 15, 15]), 6);"
      },
      {
        "name": "limits that cannot bind are the same as no limits",
        "body": "assert.equal(dieSimulator(3, [3, 3, 3, 3, 3, 3]), 216);\nassert.equal(dieSimulator(4, [4, 4, 4, 4, 4, 4]), 1296);"
      },
      {
        "name": "matches full enumeration on random small cases",
        "body": "let seed = 51;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nconst brute = (n, rm) => { let count = 0; const go = (left, last, run) => { if (left === 0) { count++; return; } for (let f = 0; f < 6; f++) { const nr = f === last ? run + 1 : 1; if (nr > rm[f]) continue; go(left - 1, f, nr); } }; go(n, -1, 0); return count; };\nfor (let t = 0; t < 100; t++) {\n  const n = 1 + rnd(7);\n  const rm = Array.from({ length: 6 }, () => 1 + rnd(4));\n  assert.equal(dieSimulator(n, rm), brute(n, rm) % 1000000007, n + ':' + rm.join(','));\n}"
      },
      {
        "name": "matches an exact BigInt table that is reduced only at the end",
        "body": "const exact = (n, rm) => {\n  let dp = rm.map((l) => new Array(l + 1).fill(0n));\n  for (let f = 0; f < 6; f++) dp[f][1] = 1n;\n  for (let roll = 2; roll <= n; roll++) {\n    const ends = dp.map((runs) => runs.reduce((a, b) => a + b, 0n));\n    const all = ends.reduce((a, b) => a + b, 0n);\n    const nx = rm.map((l) => new Array(l + 1).fill(0n));\n    for (let f = 0; f < 6; f++) {\n      nx[f][1] = all - ends[f];\n      for (let run = 2; run <= rm[f]; run++) nx[f][run] = dp[f][run - 1];\n    }\n    dp = nx;\n  }\n  let total = 0n;\n  for (const runs of dp) for (const c of runs) total += c;\n  return Number(total % 1000000007n);\n};\nfor (const [n, rm] of [[321, [2, 13, 13, 5, 3, 9]], [681, [13, 5, 3, 8, 1, 3]], [1409, [6, 6, 5, 2, 5, 9]], [60, [15, 15, 15, 15, 15, 15]]]) {\n  assert.equal(dieSimulator(n, rm), exact(n, rm), n + ':' + rm.join(','));\n}"
      },
      {
        "name": "the largest input, reduced modulo 1,000,000,007",
        "body": "assert.equal(dieSimulator(5000, [15, 15, 15, 15, 15, 15]), 549903798);"
      }
    ]
  }
];
