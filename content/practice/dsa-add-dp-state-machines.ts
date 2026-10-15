import type { Exercise } from "../types";

export const dsaAddDpStateMachines: Exercise[] = [
  {
    "id": "ex-stock-ii-unlimited",
    "chapter": "dsa-dp-state-machines",
    "level": "intermediate",
    "title": "Best Time to Buy and Sell Stock II",
    "brief": "<p>You are given <code>prices</code>, where <code>prices[i]</code> is the price of a stock on day <code>i</code>. You may buy and sell as many times as you like, but you can hold <b>at most one share</b> at a time (sell before you buy again). Return the largest total profit.</p><ul><li>You may buy and sell on the same day, which earns nothing</li><li>Return <code>0</code> when no trade is profitable, or when there are fewer than two prices</li><li>Think of two modes: holding a share, and holding nothing</li><li>Target complexity: O(n) time, O(1) space</li></ul>",
    "starter": "function maxProfitUnlimited(prices) {\n  // TODO: keep the best profit while holding a share and while holding nothing\n}\n",
    "hints": [
      "After each day you are in one of two modes: holding a share, or holding nothing. Write down the best profit for each mode.",
      "Holding after today comes from holding yesterday, or from being free yesterday and buying at today's price. Free after today comes from being free yesterday, or from holding yesterday and selling at today's price.",
      "Start with held = -Infinity (you cannot hold before the first purchase) and free = 0, update both from the OLD values in one step, and return free."
    ],
    "solution": "function maxProfitUnlimited(prices) {\n  let held = -Infinity;\n  let free = 0;\n  for (const p of prices) {\n    [held, free] = [Math.max(held, free - p), Math.max(free, held + p)];\n  }\n  return free;\n}\n",
    "tests": [
      {
        "name": "classic example",
        "body": "assert.equal(maxProfitUnlimited([7, 1, 5, 3, 6, 4]), 7);"
      },
      {
        "name": "always rising takes the whole climb",
        "body": "assert.equal(maxProfitUnlimited([1, 2, 3, 4, 5]), 4);"
      },
      {
        "name": "always falling earns nothing",
        "body": "assert.equal(maxProfitUnlimited([7, 6, 4, 3, 1]), 0);"
      },
      {
        "name": "empty, single price and flat prices",
        "body": "assert.equal(maxProfitUnlimited([]), 0);\nassert.equal(maxProfitUnlimited([5]), 0);\nassert.equal(maxProfitUnlimited([3, 3, 3, 3]), 0);"
      },
      {
        "name": "zigzag",
        "body": "assert.equal(maxProfitUnlimited([1, 5, 1, 5, 1, 5]), 12);\nassert.equal(maxProfitUnlimited([2, 1, 2, 0, 1]), 2);"
      },
      {
        "name": "matches a brute force on random small inputs",
        "body": "let seed = 4242;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nconst arr = (n, lo, hi) => Array.from({ length: n }, () => lo + rnd(hi - lo + 1));\nconst brute = (p, limit, fee, cool) => {\n  let best = 0;\n  const go = (i, holding, trades, lastSell, profit) => {\n    if (i === p.length) { if (!holding) best = Math.max(best, profit); return; }\n    go(i + 1, holding, trades, lastSell, profit);\n    if (!holding && trades < limit && (!cool || i > lastSell + 1)) go(i + 1, true, trades + 1, lastSell, profit - p[i]);\n    if (holding) go(i + 1, false, trades, i, profit + p[i] - fee);\n  };\n  go(0, false, 0, -5, 0);\n  return best;\n};\nfor (let t = 0; t < 300; t++) {\n  const p = arr(rnd(10), 0, 9);\n  assert.equal(maxProfitUnlimited(p), brute(p, Infinity, 0, false), 'prices ' + p);\n}"
      },
      {
        "name": "a long input finishes quickly and equals the sum of the rises",
        "body": "const p = [];\nfor (let i = 0; i < 100000; i++) p.push((i * 7919) % 1000);\nlet rises = 0;\nfor (let i = 1; i < p.length; i++) if (p[i] > p[i - 1]) rises += p[i] - p[i - 1];\nassert.equal(maxProfitUnlimited(p), rises);"
      }
    ]
  },
  {
    "id": "ex-stock-with-cooldown",
    "chapter": "dsa-dp-state-machines",
    "level": "intermediate",
    "title": "Best Time to Buy and Sell Stock with Cooldown",
    "brief": "<p>You are given daily <code>prices</code>. You may buy and sell as many times as you like, holding at most one share, with one extra rule: after you sell, you <b>cannot buy on the next day</b> (a one-day cooldown). Return the largest total profit.</p><ul><li>You may skip any day</li><li>You may buy again on the second day after a sale</li><li>Return <code>0</code> when no trade helps or the list is empty</li><li>Target complexity: O(n) time, O(1) space</li></ul>",
    "starter": "function maxProfitCooldown(prices) {\n  // TODO: a state machine with three modes: holding, just sold, resting\n}\n",
    "hints": [
      "Two modes are not enough: 'free' hides whether you sold yesterday. Add a third mode so you have held, sold (sold today) and rest (holding nothing and free to buy).",
      "held comes from held (wait) or rest (buy). sold comes only from held (sell). rest comes from rest (wait) or sold (the cooldown day passing). Draw the arrows first.",
      "Compute all three new values from the OLD values in one destructuring assignment, start with held = sold = -Infinity and rest = 0, and return max(sold, rest)."
    ],
    "solution": "function maxProfitCooldown(prices) {\n  let held = -Infinity;\n  let sold = -Infinity;\n  let rest = 0;\n  for (const p of prices) {\n    [held, sold, rest] = [Math.max(held, rest - p), held + p, Math.max(rest, sold)];\n  }\n  return Math.max(sold, rest);\n}\n",
    "tests": [
      {
        "name": "classic example",
        "body": "assert.equal(maxProfitCooldown([1, 2, 3, 0, 2]), 3);"
      },
      {
        "name": "empty and single price",
        "body": "assert.equal(maxProfitCooldown([]), 0);\nassert.equal(maxProfitCooldown([1]), 0);\nassert.equal(maxProfitCooldown([2, 1]), 0);"
      },
      {
        "name": "the cooldown really blocks the next buy",
        "body": "assert.equal(maxProfitCooldown([0, 1, 0, 1]), 1);\nassert.equal(maxProfitCooldown([1, 2, 1, 2]), 1);"
      },
      {
        "name": "a straight climb needs a single trade",
        "body": "assert.equal(maxProfitCooldown([1, 2, 4]), 3);\nassert.equal(maxProfitCooldown([1, 2, 3, 4, 5]), 4);"
      },
      {
        "name": "selling a day later can beat selling and resting",
        "body": "assert.equal(maxProfitCooldown([6, 1, 3, 2, 4, 7]), 6);"
      },
      {
        "name": "matches a brute force on random small inputs",
        "body": "let seed = 4242;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nconst arr = (n, lo, hi) => Array.from({ length: n }, () => lo + rnd(hi - lo + 1));\nconst brute = (p, limit, fee, cool) => {\n  let best = 0;\n  const go = (i, holding, trades, lastSell, profit) => {\n    if (i === p.length) { if (!holding) best = Math.max(best, profit); return; }\n    go(i + 1, holding, trades, lastSell, profit);\n    if (!holding && trades < limit && (!cool || i > lastSell + 1)) go(i + 1, true, trades + 1, lastSell, profit - p[i]);\n    if (holding) go(i + 1, false, trades, i, profit + p[i] - fee);\n  };\n  go(0, false, 0, -5, 0);\n  return best;\n};\nfor (let t = 0; t < 300; t++) {\n  const p = arr(rnd(10), 0, 9);\n  assert.equal(maxProfitCooldown(p), brute(p, Infinity, 0, true), 'prices ' + p);\n}"
      },
      {
        "name": "a long input agrees with a three-array reference",
        "body": "const p = [];\nfor (let i = 0; i < 50000; i++) p.push((i * 7919) % 1000);\nconst n = p.length;\nconst held = new Array(n).fill(-Infinity);\nconst sold = new Array(n).fill(-Infinity);\nconst rest = new Array(n).fill(0);\nheld[0] = -p[0];\nfor (let i = 1; i < n; i++) {\n  held[i] = Math.max(held[i - 1], rest[i - 1] - p[i]);\n  sold[i] = held[i - 1] + p[i];\n  rest[i] = Math.max(rest[i - 1], sold[i - 1]);\n}\nassert.equal(maxProfitCooldown(p), Math.max(sold[n - 1], rest[n - 1]));"
      }
    ]
  },
  {
    "id": "ex-stock-with-fee",
    "chapter": "dsa-dp-state-machines",
    "level": "intermediate",
    "title": "Best Time to Buy and Sell Stock with Transaction Fee",
    "brief": "<p>You are given daily <code>prices</code> and an integer <code>fee</code>. You may buy and sell as many times as you like, holding at most one share. Each <b>transaction</b> (a buy together with its sale) costs <code>fee</code>, paid once. Return the largest total profit.</p><ul><li>Pay the fee once per transaction, not on both the buy and the sell</li><li>A trade that earns less than the fee is never worth making</li><li>Return <code>0</code> when no trade helps</li><li>Target complexity: O(n) time, O(1) space</li></ul>",
    "starter": "function maxProfitWithFee(prices, fee) {\n  // TODO: two modes, holding and free; put the fee on the selling arrow\n}\n",
    "hints": [
      "This is the unlimited-transactions machine with two modes: holding a share and holding nothing.",
      "Selling now earns price - fee instead of price. Buying costs the price as before. The fee belongs on exactly one of the two arrows.",
      "free = max(free, held + p - fee) and held = max(held, free - p), both from the old values. Start held = -Infinity, free = 0."
    ],
    "solution": "function maxProfitWithFee(prices, fee) {\n  let held = -Infinity;\n  let free = 0;\n  for (const p of prices) {\n    [held, free] = [Math.max(held, free - p), Math.max(free, held + p - fee)];\n  }\n  return free;\n}\n",
    "tests": [
      {
        "name": "classic example",
        "body": "assert.equal(maxProfitWithFee([1, 3, 2, 8, 4, 9], 2), 8);"
      },
      {
        "name": "another example",
        "body": "assert.equal(maxProfitWithFee([1, 3, 7, 5, 10, 3], 3), 6);"
      },
      {
        "name": "a fee larger than any rise means no trade",
        "body": "assert.equal(maxProfitWithFee([1, 2, 3, 4], 5), 0);\nassert.equal(maxProfitWithFee([5, 4, 3], 0), 0);"
      },
      {
        "name": "a fee of zero is the unlimited version",
        "body": "assert.equal(maxProfitWithFee([7, 1, 5, 3, 6, 4], 0), 7);"
      },
      {
        "name": "empty and single price",
        "body": "assert.equal(maxProfitWithFee([], 2), 0);\nassert.equal(maxProfitWithFee([9], 2), 0);"
      },
      {
        "name": "matches a brute force on random small inputs",
        "body": "let seed = 4242;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nconst arr = (n, lo, hi) => Array.from({ length: n }, () => lo + rnd(hi - lo + 1));\nconst brute = (p, limit, fee, cool) => {\n  let best = 0;\n  const go = (i, holding, trades, lastSell, profit) => {\n    if (i === p.length) { if (!holding) best = Math.max(best, profit); return; }\n    go(i + 1, holding, trades, lastSell, profit);\n    if (!holding && trades < limit && (!cool || i > lastSell + 1)) go(i + 1, true, trades + 1, lastSell, profit - p[i]);\n    if (holding) go(i + 1, false, trades, i, profit + p[i] - fee);\n  };\n  go(0, false, 0, -5, 0);\n  return best;\n};\nfor (let t = 0; t < 300; t++) {\n  const p = arr(rnd(10), 0, 9);\n  const fee = rnd(5);\n  assert.equal(maxProfitWithFee(p, fee), brute(p, Infinity, fee, false), 'prices ' + p + ' fee ' + fee);\n}"
      },
      {
        "name": "a long input finishes quickly",
        "body": "const p = [];\nfor (let i = 0; i < 100000; i++) p.push((i * 7919) % 1000);\nconst got = maxProfitWithFee(p, 10);\nassert.ok(got >= maxProfitWithFee(p, 50));\nassert.ok(got <= maxProfitWithFee(p, 0));"
      }
    ]
  },
  {
    "id": "ex-stock-iii-two-transactions",
    "chapter": "dsa-dp-state-machines",
    "level": "advanced",
    "title": "Best Time to Buy and Sell Stock III",
    "brief": "<p>You are given daily <code>prices</code>. You may complete <b>at most two</b> transactions (a transaction is one buy followed by one sell), holding at most one share at a time. Return the largest total profit.</p><ul><li>Fewer than two transactions is allowed</li><li>You must sell before you buy again</li><li>Return <code>0</code> when no trade helps</li><li>Target complexity: O(n) time, O(1) space</li></ul>",
    "starter": "function maxProfitTwo(prices) {\n  // TODO: four variables: holding after the 1st buy, free after the 1st sale, holding after the 2nd buy, free after the 2nd sale\n}\n",
    "hints": [
      "The number of transactions used joins the state. Make a pair of modes for each count: held1, free1 for the first transaction and held2, free2 for the second.",
      "held1 = max(held1, -p). free1 = max(free1, held1 + p). held2 = max(held2, free1 - p). free2 = max(free2, held2 + p). The second purchase starts from the profit of the first sale.",
      "Start both held values at -Infinity and both free values at 0, and return free2. Selling and buying on the same day earns 0, so reusing the freshly updated free1 is safe because the recurrences mean 'at most'."
    ],
    "solution": "function maxProfitTwo(prices) {\n  let held1 = -Infinity, free1 = 0;\n  let held2 = -Infinity, free2 = 0;\n  for (const p of prices) {\n    held1 = Math.max(held1, -p);\n    free1 = Math.max(free1, held1 + p);\n    held2 = Math.max(held2, free1 - p);\n    free2 = Math.max(free2, held2 + p);\n  }\n  return free2;\n}\n",
    "tests": [
      {
        "name": "classic example",
        "body": "assert.equal(maxProfitTwo([3, 3, 5, 0, 0, 3, 1, 4]), 6);"
      },
      {
        "name": "a single climb needs one transaction",
        "body": "assert.equal(maxProfitTwo([1, 2, 3, 4, 5]), 4);"
      },
      {
        "name": "always falling earns nothing",
        "body": "assert.equal(maxProfitTwo([7, 6, 4, 3, 1]), 0);"
      },
      {
        "name": "empty and single price",
        "body": "assert.equal(maxProfitTwo([]), 0);\nassert.equal(maxProfitTwo([4]), 0);"
      },
      {
        "name": "three rises, only the best two count",
        "body": "assert.equal(maxProfitTwo([1, 4, 2, 6, 3, 5]), 7);\nassert.equal(maxProfitTwo([1, 3, 1, 3, 1, 3]), 4);"
      },
      {
        "name": "matches a brute force on random small inputs",
        "body": "let seed = 4242;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nconst arr = (n, lo, hi) => Array.from({ length: n }, () => lo + rnd(hi - lo + 1));\nconst brute = (p, limit, fee, cool) => {\n  let best = 0;\n  const go = (i, holding, trades, lastSell, profit) => {\n    if (i === p.length) { if (!holding) best = Math.max(best, profit); return; }\n    go(i + 1, holding, trades, lastSell, profit);\n    if (!holding && trades < limit && (!cool || i > lastSell + 1)) go(i + 1, true, trades + 1, lastSell, profit - p[i]);\n    if (holding) go(i + 1, false, trades, i, profit + p[i] - fee);\n  };\n  go(0, false, 0, -5, 0);\n  return best;\n};\nfor (let t = 0; t < 300; t++) {\n  const p = arr(rnd(11), 0, 9);\n  assert.equal(maxProfitTwo(p), brute(p, 2, 0, false), 'prices ' + p);\n}"
      },
      {
        "name": "a long input finishes quickly and is at least the best single transaction",
        "body": "const p = [];\nfor (let i = 0; i < 100000; i++) p.push((i * 7919) % 1000);\nlet low = Infinity, one = 0;\nfor (const x of p) { low = Math.min(low, x); one = Math.max(one, x - low); }\nassert.ok(maxProfitTwo(p) >= one);\nassert.ok(maxProfitTwo(p) <= 2 * 999);"
      }
    ]
  },
  {
    "id": "ex-stock-iv-k-transactions",
    "chapter": "dsa-dp-state-machines",
    "level": "advanced",
    "title": "Best Time to Buy and Sell Stock IV",
    "brief": "<p>You are given an integer <code>k</code> and daily <code>prices</code>. You may complete <b>at most k</b> transactions (a buy followed by a sell), holding at most one share at a time. Return the largest total profit.</p><ul><li><code>k</code> can be far larger than the number of days (a million, say): do not loop or allocate up to <code>k</code></li><li>A transaction needs two days, so only about half as many transactions as days can ever help</li><li>Return <code>0</code> when <code>k</code> is 0 or no trade helps</li><li>Target complexity: O(n · min(k, n/2)) time, O(min(k, n/2)) space</li></ul>",
    "starter": "function maxProfitK(k, prices) {\n  // TODO: cap k, then keep held[j] and free[j] for j = 1..k\n}\n",
    "hints": [
      "Generalise the two-transaction version: held[j] is the best profit holding a share bought as the j-th transaction, free[j] the best profit holding nothing after at most j sales, and free[0] = 0.",
      "For every price p and every j from 1 to k: held[j] = max(held[j], free[j-1] - p), then free[j] = max(free[j], held[j] + p). The answer is free[k].",
      "If k is at least floor(n / 2), the limit never binds, so the unlimited-transaction machine gives the answer. Check that first, which also keeps a huge k from allocating a huge array."
    ],
    "solution": "function maxProfitK(k, prices) {\n  const n = prices.length;\n  if (k === 0 || n < 2) return 0;\n  if (k >= Math.floor(n / 2)) {\n    let held = -Infinity;\n    let free = 0;\n    for (const p of prices) {\n      [held, free] = [Math.max(held, free - p), Math.max(free, held + p)];\n    }\n    return free;\n  }\n  const held = new Array(k + 1).fill(-Infinity);\n  const free = new Array(k + 1).fill(0);\n  for (const p of prices) {\n    for (let j = 1; j <= k; j++) {\n      held[j] = Math.max(held[j], free[j - 1] - p);\n      free[j] = Math.max(free[j], held[j] + p);\n    }\n  }\n  return free[k];\n}\n",
    "tests": [
      {
        "name": "small examples",
        "body": "assert.equal(maxProfitK(2, [2, 4, 1]), 2);\nassert.equal(maxProfitK(2, [3, 2, 6, 5, 0, 3]), 7);"
      },
      {
        "name": "k = 1 is the single-transaction problem",
        "body": "assert.equal(maxProfitK(1, [7, 1, 5, 3, 6, 4]), 5);"
      },
      {
        "name": "k = 0, empty and single price",
        "body": "assert.equal(maxProfitK(0, [1, 5, 3]), 0);\nassert.equal(maxProfitK(3, []), 0);\nassert.equal(maxProfitK(3, [4]), 0);"
      },
      {
        "name": "a huge k does not allocate a huge array",
        "body": "assert.equal(maxProfitK(1000000, [1, 5, 2, 9, 3, 8]), 16);"
      },
      {
        "name": "more transactions never reduce the profit",
        "body": "const p = [3, 3, 5, 0, 0, 3, 1, 4, 9, 2, 8, 1, 7];\nlet previous = 0;\nfor (let k = 0; k <= 8; k++) {\n  const got = maxProfitK(k, p);\n  assert.ok(got >= previous, 'k = ' + k);\n  previous = got;\n}"
      },
      {
        "name": "matches a brute force on random small inputs",
        "body": "let seed = 4242;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nconst arr = (n, lo, hi) => Array.from({ length: n }, () => lo + rnd(hi - lo + 1));\nconst brute = (p, limit, fee, cool) => {\n  let best = 0;\n  const go = (i, holding, trades, lastSell, profit) => {\n    if (i === p.length) { if (!holding) best = Math.max(best, profit); return; }\n    go(i + 1, holding, trades, lastSell, profit);\n    if (!holding && trades < limit && (!cool || i > lastSell + 1)) go(i + 1, true, trades + 1, lastSell, profit - p[i]);\n    if (holding) go(i + 1, false, trades, i, profit + p[i] - fee);\n  };\n  go(0, false, 0, -5, 0);\n  return best;\n};\nfor (let t = 0; t < 300; t++) {\n  const p = arr(rnd(11), 0, 9);\n  const k = rnd(6);\n  assert.equal(maxProfitK(k, p), brute(p, k, 0, false), 'k ' + k + ' prices ' + p);\n}"
      },
      {
        "name": "a long input with a large k equals the sum of the rises",
        "body": "const p = [];\nfor (let i = 0; i < 2000; i++) p.push((i * 7919) % 1000);\nlet rises = 0;\nfor (let i = 1; i < p.length; i++) if (p[i] > p[i - 1]) rises += p[i] - p[i - 1];\nassert.equal(maxProfitK(1000000, p), rises);\nassert.equal(maxProfitK(1000, p), rises);"
      }
    ]
  },
  {
    "id": "ex-paint-house",
    "chapter": "dsa-dp-state-machines",
    "level": "intermediate",
    "title": "Paint House",
    "brief": "<p>There is a row of <code>n</code> houses. <code>costs[i]</code> is a list of three numbers: the cost of painting house <code>i</code> red, blue or green (in that order). No two <b>neighbouring</b> houses may have the same colour. Return the minimum total cost to paint all houses.</p><ul><li>Return <code>0</code> for an empty row</li><li>The cheapest prefix may end in a colour you cannot reuse, so keep one value per colour</li><li>Target complexity: O(n) time, O(1) space</li></ul>",
    "starter": "function paintHouse(costs) {\n  // TODO: best cost so far when the last house is red, blue or green\n}\n",
    "hints": [
      "Let the mode be the colour of the last house painted: keep red, blue and green as the cheapest total so far that ends in that colour.",
      "A house painted red costs its red price plus the cheaper of the previous blue and green totals, and similarly for the other colours.",
      "Update all three from the previous values at once (destructuring), then return the smallest of the three after the last house."
    ],
    "solution": "function paintHouse(costs) {\n  let red = 0, blue = 0, green = 0;\n  for (const [r, b, g] of costs) {\n    [red, blue, green] = [\n      r + Math.min(blue, green),\n      b + Math.min(red, green),\n      g + Math.min(red, blue),\n    ];\n  }\n  return Math.min(red, blue, green);\n}\n",
    "tests": [
      {
        "name": "classic example",
        "body": "assert.equal(paintHouse([[17, 2, 17], [16, 16, 5], [14, 3, 19]]), 10);"
      },
      {
        "name": "two houses",
        "body": "assert.equal(paintHouse([[7, 6, 2]]), 2);\nassert.equal(paintHouse([[7, 6, 2], [1, 9, 3]]), 3);"
      },
      {
        "name": "empty row",
        "body": "assert.equal(paintHouse([]), 0);"
      },
      {
        "name": "the cheapest colour cannot repeat",
        "body": "assert.equal(paintHouse([[1, 9, 9], [1, 9, 9], [1, 9, 9]]), 11);"
      },
      {
        "name": "equal costs",
        "body": "assert.equal(paintHouse([[4, 4, 4], [4, 4, 4], [4, 4, 4], [4, 4, 4]]), 16);"
      },
      {
        "name": "matches a brute force on random inputs",
        "body": "let seed = 4242;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nconst arr = (n, lo, hi) => Array.from({ length: n }, () => lo + rnd(hi - lo + 1));\nconst brute = (costs) => {\n  let best = Infinity;\n  const pick = [];\n  const go = (i) => {\n    if (i === costs.length) { best = Math.min(best, pick.reduce((s, c, j) => s + costs[j][c], 0)); return; }\n    for (let c = 0; c < 3; c++) { if (i > 0 && pick[i - 1] === c) continue; pick[i] = c; go(i + 1); }\n    pick.length = i;\n  };\n  go(0);\n  return best;\n};\nfor (let t = 0; t < 200; t++) {\n  const costs = Array.from({ length: 1 + rnd(7) }, () => arr(3, 1, 9));\n  assert.equal(paintHouse(costs), brute(costs), JSON.stringify(costs));\n}"
      },
      {
        "name": "a long row finishes quickly",
        "body": "const costs = Array.from({ length: 100000 }, (_, i) => [(i % 7) + 1, (i % 5) + 1, (i % 3) + 1]);\nconst got = paintHouse(costs);\nassert.ok(got >= 100000);\nassert.ok(got <= 300000);"
      }
    ]
  },
  {
    "id": "ex-paint-house-ii",
    "chapter": "dsa-dp-state-machines",
    "level": "intermediate",
    "title": "Paint House II",
    "brief": "<p>There is a row of <code>n</code> houses and <code>k</code> colours. <code>costs[i][c]</code> is the cost of painting house <code>i</code> with colour <code>c</code>. No two neighbouring houses may have the same colour. Return the minimum total cost.</p><ul><li>Return <code>0</code> for an empty row</li><li>The obvious solution scans all other colours for each colour, O(n · k²); aim for <b>O(n · k)</b></li><li>Hint for the speed-up: the best previous total excluding your own colour is either the smallest total, or the second smallest when you are the colour that owns the smallest</li><li>Assume <code>k ≥ 2</code> whenever there is more than one house</li></ul>",
    "starter": "function paintHouseK(costs) {\n  // TODO: track the smallest and second smallest previous totals, and which colour owns the smallest\n}\n",
    "hints": [
      "Keep, for the previous house, the cheapest total ending in each colour. The new total for colour c is costs[i][c] plus the cheapest previous total over colours other than c.",
      "You do not need to scan every other colour: remember the smallest previous total, the colour that owns it, and the second smallest.",
      "If c owns the smallest, add the second smallest; otherwise add the smallest. Treat the first house separately because it has no neighbour to avoid."
    ],
    "solution": "function paintHouseK(costs) {\n  if (costs.length === 0) return 0;\n  const k = costs[0].length;\n  let prev = costs[0];\n  for (let i = 1; i < costs.length; i++) {\n    let min1 = Infinity, min2 = Infinity, minColor = -1;\n    for (let c = 0; c < k; c++) {\n      if (prev[c] < min1) {\n        min2 = min1;\n        min1 = prev[c];\n        minColor = c;\n      } else if (prev[c] < min2) {\n        min2 = prev[c];\n      }\n    }\n    prev = costs[i].map((cost, c) => cost + (c === minColor ? min2 : min1));\n  }\n  return Math.min(...prev);\n}\n",
    "tests": [
      {
        "name": "examples",
        "body": "assert.equal(paintHouseK([[1, 5, 3], [2, 9, 4]]), 5);\nassert.equal(paintHouseK([[1, 3], [2, 4]]), 5);"
      },
      {
        "name": "one house takes its cheapest colour",
        "body": "assert.equal(paintHouseK([[9, 2, 7, 4]]), 2);\nassert.equal(paintHouseK([[5]]), 5);"
      },
      {
        "name": "empty row",
        "body": "assert.equal(paintHouseK([]), 0);"
      },
      {
        "name": "ties for the cheapest colour",
        "body": "assert.equal(paintHouseK([[1, 1, 5], [1, 1, 5], [1, 1, 5]]), 3);\nassert.equal(paintHouseK([[2, 2], [2, 2], [2, 2]]), 6);"
      },
      {
        "name": "two colours must alternate",
        "body": "assert.equal(paintHouseK([[1, 10], [1, 10], [1, 10], [1, 10]]), 22);"
      },
      {
        "name": "matches a brute force on random inputs",
        "body": "let seed = 4242;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nconst arr = (n, lo, hi) => Array.from({ length: n }, () => lo + rnd(hi - lo + 1));\nconst brute = (costs) => {\n  if (costs.length === 0) return 0;\n  const k = costs[0].length;\n  let best = Infinity;\n  const pick = [];\n  const go = (i) => {\n    if (i === costs.length) { best = Math.min(best, pick.reduce((s, c, j) => s + costs[j][c], 0)); return; }\n    for (let c = 0; c < k; c++) { if (i > 0 && pick[i - 1] === c) continue; pick[i] = c; go(i + 1); }\n    pick.length = i;\n  };\n  go(0);\n  return best;\n};\nfor (let t = 0; t < 200; t++) {\n  const k = 2 + rnd(4);\n  const costs = Array.from({ length: rnd(7) }, () => arr(k, 1, 5));\n  assert.equal(paintHouseK(costs), brute(costs), JSON.stringify(costs));\n}"
      },
      {
        "name": "a large instance agrees with the O(n k^2) version",
        "body": "let seed = 4242;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nconst arr = (n, lo, hi) => Array.from({ length: n }, () => lo + rnd(hi - lo + 1));\nconst n = 600, k = 40;\nconst costs = Array.from({ length: n }, () => arr(k, 1, 100));\nlet prev = costs[0].slice();\nfor (let i = 1; i < n; i++) {\n  prev = costs[i].map((cost, c) => cost + Math.min(...prev.filter((_, d) => d !== c)));\n}\nassert.equal(paintHouseK(costs), Math.min(...prev));"
      }
    ]
  },
  {
    "id": "ex-unbounded-knapsack",
    "chapter": "dsa-dp-state-machines",
    "level": "intermediate",
    "title": "Unbounded Knapsack",
    "brief": "<p>You have <code>n</code> kinds of item. Kind <code>i</code> has a <code>weights[i]</code> and a <code>values[i]</code>, and you have <b>unlimited copies</b> of each kind. The bag holds at most <code>capacity</code> total weight. Return the largest total value you can carry.</p><ul><li>Weights are positive integers, values are non-negative integers, <code>capacity</code> is a non-negative integer</li><li>Return <code>0</code> when nothing fits</li><li>Compare with the 0/1 knapsack: here the inner loop over the capacity runs in the <em>other</em> direction</li><li>Target complexity: O(n · capacity) time, O(capacity) space</li></ul>",
    "starter": "function unboundedKnapsack(weights, values, capacity) {\n  // TODO: one array over the capacity; decide the direction of the inner loop\n}\n",
    "hints": [
      "Let best[w] be the largest value that fits in weight w using the kinds seen so far, with unlimited copies. best[0] = 0, and the array starts as all zeros because carrying less than the capacity is allowed.",
      "For each kind, for each w from weights[i] up to capacity: best[w] = max(best[w], best[w - weights[i]] + values[i]).",
      "Run w upwards. When you read best[w - weight] it has already been updated for this kind, so taking another copy of the same kind is allowed. That is exactly what 'unlimited' means."
    ],
    "solution": "function unboundedKnapsack(weights, values, capacity) {\n  const best = new Array(capacity + 1).fill(0);\n  for (let i = 0; i < weights.length; i++) {\n    for (let w = weights[i]; w <= capacity; w++) {\n      best[w] = Math.max(best[w], best[w - weights[i]] + values[i]);\n    }\n  }\n  return best[capacity];\n}\n",
    "tests": [
      {
        "name": "items can repeat",
        "body": "assert.equal(unboundedKnapsack([3], [5], 9), 15);\nassert.equal(unboundedKnapsack([2, 3], [3, 5], 7), 11);"
      },
      {
        "name": "a worked example",
        "body": "assert.equal(unboundedKnapsack([1, 3, 4, 5], [1, 4, 5, 7], 7), 9);"
      },
      {
        "name": "nothing fits",
        "body": "assert.equal(unboundedKnapsack([5, 6], [10, 12], 4), 0);\nassert.equal(unboundedKnapsack([], [], 10), 0);\nassert.equal(unboundedKnapsack([2], [3], 0), 0);"
      },
      {
        "name": "a leftover that no item fills",
        "body": "assert.equal(unboundedKnapsack([4], [7], 11), 14);"
      },
      {
        "name": "mixing kinds fills the bag best",
        "body": "assert.equal(unboundedKnapsack([2, 5], [3, 8], 9), 14);"
      },
      {
        "name": "matches a brute force on random inputs",
        "body": "let seed = 4242;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nconst arr = (n, lo, hi) => Array.from({ length: n }, () => lo + rnd(hi - lo + 1));\nconst brute = (w, v, cap) => {\n  const rec = (i, c) => {\n    if (i === w.length) return 0;\n    let best = 0;\n    for (let t = 0; t * w[i] <= c; t++) best = Math.max(best, t * v[i] + rec(i + 1, c - t * w[i]));\n    return best;\n  };\n  return rec(0, cap);\n};\nfor (let t = 0; t < 250; t++) {\n  const n = rnd(5);\n  const w = arr(n, 1, 8), v = arr(n, 0, 9), cap = rnd(25);\n  assert.equal(unboundedKnapsack(w, v, cap), brute(w, v, cap), JSON.stringify([w, v, cap]));\n}"
      },
      {
        "name": "a large capacity finishes quickly",
        "body": "assert.equal(unboundedKnapsack([7, 11, 13], [10, 16, 20], 20000), 30766);"
      }
    ]
  },
  {
    "id": "ex-bounded-knapsack",
    "chapter": "dsa-dp-state-machines",
    "level": "advanced",
    "title": "Bounded Knapsack",
    "brief": "<p><code>items</code> is a list of <code>{ weight, value, count }</code> objects: there are <code>count</code> copies of that item, and you may take any number of them from 0 to <code>count</code>. The bag holds at most <code>capacity</code> total weight. Return the largest total value.</p><ul><li>Weights are positive integers, <code>count</code> can be as large as a million</li><li>Expanding every item into <code>count</code> separate 0/1 items is too slow when counts are large</li><li>Split each count into the pieces 1, 2, 4, ... and a remainder, and treat every piece as a 0/1 item</li><li>Target complexity: O(Σ log count · capacity) time, O(capacity) space</li></ul>",
    "starter": "function boundedKnapsack(items, capacity) {\n  // TODO: binary-split each count into 0/1 pieces\n}\n",
    "hints": [
      "Taking t copies of an item of weight w and value v is the same as taking one 'big item' of weight t*w and value t*v. You need a short list of piece sizes so every count from 0 to count is a sum of some of them.",
      "Use the pieces 1, 2, 4, 8, ... while they fit, then the remainder. For a count of 13 the pieces are 1, 2, 4 and 6, and every number from 0 to 13 is a subset sum of those. Each piece is used at most once.",
      "Each piece is a 0/1 item, so run the inner loop over the capacity from high to low. Piece of size take: weight take*weight, value take*value."
    ],
    "solution": "function boundedKnapsack(items, capacity) {\n  const best = new Array(capacity + 1).fill(0);\n  for (const { weight, value, count } of items) {\n    let left = count;\n    for (let piece = 1; left > 0; piece *= 2) {\n      const take = Math.min(piece, left);\n      left -= take;\n      for (let w = capacity; w >= take * weight; w--) {\n        best[w] = Math.max(best[w], best[w - take * weight] + take * value);\n      }\n    }\n  }\n  return best[capacity];\n}\n",
    "tests": [
      {
        "name": "a count of one is the 0/1 knapsack",
        "body": "const items = [{ weight: 10, value: 60, count: 1 }, { weight: 20, value: 100, count: 1 }, { weight: 30, value: 120, count: 1 }];\nassert.equal(boundedKnapsack(items, 50), 220);"
      },
      {
        "name": "the count limits how many copies you may take",
        "body": "assert.equal(boundedKnapsack([{ weight: 3, value: 5, count: 2 }], 9), 10);\nassert.equal(boundedKnapsack([{ weight: 3, value: 5, count: 3 }], 9), 15);"
      },
      {
        "name": "nothing fits, or the bag is empty",
        "body": "assert.equal(boundedKnapsack([{ weight: 5, value: 9, count: 4 }], 4), 0);\nassert.equal(boundedKnapsack([], 10), 0);\nassert.equal(boundedKnapsack([{ weight: 1, value: 1, count: 5 }], 0), 0);"
      },
      {
        "name": "a count of zero adds nothing",
        "body": "assert.equal(boundedKnapsack([{ weight: 1, value: 100, count: 0 }, { weight: 2, value: 3, count: 2 }], 10), 6);"
      },
      {
        "name": "counts that are not powers of two",
        "body": "for (let c = 0; c <= 13; c++) {\n  assert.equal(boundedKnapsack([{ weight: 1, value: 1, count: 13 }], c), c);\n}\nassert.equal(boundedKnapsack([{ weight: 1, value: 1, count: 13 }], 20), 13);"
      },
      {
        "name": "matches a brute force on random inputs",
        "body": "let seed = 4242;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nconst arr = (n, lo, hi) => Array.from({ length: n }, () => lo + rnd(hi - lo + 1));\nconst brute = (items, cap) => {\n  const rec = (i, c) => {\n    if (i === items.length) return 0;\n    const { weight, value, count } = items[i];\n    let best = 0;\n    for (let t = 0; t <= count && t * weight <= c; t++) best = Math.max(best, t * value + rec(i + 1, c - t * weight));\n    return best;\n  };\n  return rec(0, cap);\n};\nfor (let t = 0; t < 250; t++) {\n  const items = Array.from({ length: rnd(5) }, () => ({ weight: 1 + rnd(7), value: rnd(10), count: rnd(7) }));\n  const cap = rnd(30);\n  assert.equal(boundedKnapsack(items, cap), brute(items, cap), JSON.stringify([items, cap]));\n}"
      },
      {
        "name": "huge counts finish quickly",
        "body": "const items = [{ weight: 1, value: 1, count: 1000000 }, { weight: 3, value: 4, count: 1000000 }];\nassert.equal(boundedKnapsack(items, 100000), 133333);"
      }
    ]
  },
  {
    "id": "ex-combination-sum-iv",
    "chapter": "dsa-dp-state-machines",
    "level": "intermediate",
    "title": "Combination Sum IV: count ordered sequences",
    "brief": "<p>Given an array <code>nums</code> of <b>distinct positive integers</b> and a <code>target</code>, return the number of <b>sequences</b> of numbers from <code>nums</code> (each number may be used any number of times) that add up to <code>target</code>. Different orders count as different sequences, so <code>[1, 2]</code> and <code>[2, 1]</code> are two answers.</p><ul><li>The answer fits in a JavaScript safe integer for the inputs used here</li><li>An empty target of <code>0</code> has exactly one sequence, the empty one</li><li>This is the Coin Change II lesson from the chapter, with the loops the other way round</li><li>Target complexity: O(target · nums.length) time, O(target) space</li></ul>",
    "starter": "function combinationSum4(nums, target) {\n  // TODO: which loop is the outer one when the order of the numbers matters?\n}\n",
    "hints": [
      "Let ways[a] be the number of sequences that sum to a, with ways[0] = 1 for the empty sequence.",
      "Every sequence for amount a has exactly one LAST number c, and what comes before it is a sequence for a - c. So ways[a] is the sum of ways[a - c] over every c <= a.",
      "Put the target in the OUTER loop and the numbers in the inner loop. With the numbers outside you would count combinations instead, ignoring order."
    ],
    "solution": "function combinationSum4(nums, target) {\n  const ways = new Array(target + 1).fill(0);\n  ways[0] = 1;\n  for (let a = 1; a <= target; a++) {\n    for (const c of nums) {\n      if (c <= a) ways[a] += ways[a - c];\n    }\n  }\n  return ways[target];\n}\n",
    "tests": [
      {
        "name": "classic example",
        "body": "assert.equal(combinationSum4([1, 2, 3], 4), 7);"
      },
      {
        "name": "no way to reach the target",
        "body": "assert.equal(combinationSum4([9], 3), 0);\nassert.equal(combinationSum4([2], 3), 0);"
      },
      {
        "name": "target zero has one empty sequence",
        "body": "assert.equal(combinationSum4([1, 2], 0), 1);"
      },
      {
        "name": "order matters, unlike combinations",
        "body": "assert.equal(combinationSum4([1, 2, 5], 5), 9);\nassert.equal(combinationSum4([2, 1], 3), 3);"
      },
      {
        "name": "a single number",
        "body": "assert.equal(combinationSum4([3], 9), 1);\nassert.equal(combinationSum4([1], 20), 1);"
      },
      {
        "name": "matches a brute force on random inputs",
        "body": "let seed = 4242;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nconst arr = (n, lo, hi) => Array.from({ length: n }, () => lo + rnd(hi - lo + 1));\nconst brute = (nums, rem) => {\n  if (rem === 0) return 1;\n  let s = 0;\n  for (const c of nums) if (c <= rem) s += brute(nums, rem - c);\n  return s;\n};\nfor (let t = 0; t < 120; t++) {\n  const nums = [...new Set(arr(1 + rnd(4), 1, 7))];\n  const target = rnd(15);\n  assert.equal(combinationSum4(nums, target), brute(nums, target), JSON.stringify([nums, target]));\n}"
      },
      {
        "name": "a larger target finishes quickly",
        "body": "assert.equal(combinationSum4([1, 2, 3], 30), 53798080);"
      }
    ]
  },
  {
    "id": "ex-ones-and-zeroes",
    "chapter": "dsa-dp-state-machines",
    "level": "intermediate",
    "title": "Ones and Zeroes",
    "brief": "<p>You are given an array <code>strs</code> of binary strings (each made only of <code>\"0\"</code> and <code>\"1\"</code> characters) and two integers <code>m</code> and <code>n</code>. Return the size of the <b>largest subset</b> of <code>strs</code> that uses <b>at most <code>m</code> zeros and at most <code>n</code> ones</b> in total. Each string can be used once.</p><ul><li>This is a 0/1 knapsack with <em>two</em> capacities</li><li>Return <code>0</code> when no string fits</li><li>Target complexity: O(L · m · n) time for L strings, O(m · n) space</li></ul>",
    "starter": "function findMaxForm(strs, m, n) {\n  // TODO: best[z][o] = most strings that fit in z zeros and o ones\n}\n",
    "hints": [
      "Each string is an item that costs some zeros and some ones and is worth 1. The budget has two numbers, so the table has two axes: best[z][o].",
      "For a string with zeros z0 and ones o0: best[z][o] = max(best[z][o], best[z - z0][o - o0] + 1) for every z >= z0 and o >= o0.",
      "Each string is used once, so run BOTH loops from high to low. Then the cell you read still holds the answer from before this string."
    ],
    "solution": "function findMaxForm(strs, m, n) {\n  const best = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));\n  for (const s of strs) {\n    let zeros = 0;\n    for (const ch of s) if (ch === \"0\") zeros++;\n    const ones = s.length - zeros;\n    for (let z = m; z >= zeros; z--) {\n      for (let o = n; o >= ones; o--) {\n        best[z][o] = Math.max(best[z][o], best[z - zeros][o - ones] + 1);\n      }\n    }\n  }\n  return best[m][n];\n}\n",
    "tests": [
      {
        "name": "classic example",
        "body": "assert.equal(findMaxForm([\"10\", \"0001\", \"111001\", \"1\", \"0\"], 5, 3), 4);"
      },
      {
        "name": "small budget",
        "body": "assert.equal(findMaxForm([\"10\", \"0\", \"1\"], 1, 1), 2);\nassert.equal(findMaxForm([\"10\", \"0\", \"1\"], 0, 0), 0);"
      },
      {
        "name": "no strings",
        "body": "assert.equal(findMaxForm([], 5, 5), 0);"
      },
      {
        "name": "a string too big for the budget is skipped",
        "body": "assert.equal(findMaxForm([\"0000\", \"1\", \"1\"], 3, 2), 2);"
      },
      {
        "name": "a string is used at most once",
        "body": "assert.equal(findMaxForm([\"0\"], 10, 10), 1);\nassert.equal(findMaxForm([\"01\", \"01\"], 1, 1), 1);"
      },
      {
        "name": "matches a brute force on random inputs",
        "body": "let seed = 4242;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nconst arr = (n, lo, hi) => Array.from({ length: n }, () => lo + rnd(hi - lo + 1));\nconst brute = (strs, m, n) => {\n  let best = 0;\n  for (let mask = 0; mask < (1 << strs.length); mask++) {\n    let z = 0, o = 0, c = 0;\n    for (let i = 0; i < strs.length; i++) if (mask >> i & 1) { for (const ch of strs[i]) ch === '0' ? z++ : o++; c++; }\n    if (z <= m && o <= n) best = Math.max(best, c);\n  }\n  return best;\n};\nfor (let t = 0; t < 250; t++) {\n  const strs = Array.from({ length: rnd(9) }, () => Array.from({ length: 1 + rnd(5) }, () => rnd(2)).join(''));\n  const m = rnd(7), n = rnd(7);\n  assert.equal(findMaxForm(strs, m, n), brute(strs, m, n), JSON.stringify([strs, m, n]));\n}"
      },
      {
        "name": "a larger instance finishes quickly",
        "body": "const strs = [];\nfor (let i = 0; i < 300; i++) strs.push(i % 2 === 0 ? '01' : '0011');\nassert.equal(findMaxForm(strs, 100, 100), 100);"
      }
    ]
  },
  {
    "id": "ex-last-stone-weight-ii",
    "chapter": "dsa-dp-state-machines",
    "level": "intermediate",
    "title": "Last Stone Weight II",
    "brief": "<p>You have an array <code>stones</code> of positive integer weights. On each turn you choose <b>any two</b> stones with weights <code>x ≤ y</code> and smash them together: if <code>x === y</code> both are destroyed, otherwise the stone of weight <code>x</code> is destroyed and the other becomes weight <code>y − x</code>. After at most <code>n − 1</code> turns at most one stone remains. Return the <b>smallest possible weight</b> of the remaining stone, or <code>0</code> if none remains.</p><ul><li>You choose which two stones to smash, so this is not the \"two heaviest\" heap problem</li><li>Think of the stones as being split into two groups; what is the last weight in terms of the groups?</li><li>Target complexity: O(n · sum) time, O(sum) space</li></ul>",
    "starter": "function lastStoneWeightII(stones) {\n  // TODO: a subset sum up to half of the total\n}\n",
    "hints": [
      "Every original stone ends up added or subtracted exactly once in the final weight, so the answer is the smallest possible gap |sum(A) - sum(B)| over all ways to split the stones into two groups A and B.",
      "If one group has sum s, the other has total - s and the gap is |total - 2s|. You want s as close to total / 2 as possible without exceeding it.",
      "Run a boolean subset-sum over 0..floor(total / 2) with the inner loop from high to low. Find the largest reachable s and return total - 2 * s."
    ],
    "solution": "function lastStoneWeightII(stones) {\n  const total = stones.reduce((a, b) => a + b, 0);\n  const half = Math.floor(total / 2);\n  const reach = new Array(half + 1).fill(false);\n  reach[0] = true;\n  for (const stone of stones) {\n    for (let s = half; s >= stone; s--) {\n      if (reach[s - stone]) reach[s] = true;\n    }\n  }\n  let best = half;\n  while (!reach[best]) best--;\n  return total - 2 * best;\n}\n",
    "tests": [
      {
        "name": "classic example",
        "body": "assert.equal(lastStoneWeightII([2, 7, 4, 1, 8, 1]), 1);"
      },
      {
        "name": "another example",
        "body": "assert.equal(lastStoneWeightII([31, 26, 33, 21, 40]), 5);"
      },
      {
        "name": "a single stone stays",
        "body": "assert.equal(lastStoneWeightII([7]), 7);\nassert.equal(lastStoneWeightII([1]), 1);"
      },
      {
        "name": "two stones leave their difference",
        "body": "assert.equal(lastStoneWeightII([5, 3]), 2);\nassert.equal(lastStoneWeightII([4, 4]), 0);"
      },
      {
        "name": "choosing the pair beats smashing the heaviest two",
        "body": "assert.equal(lastStoneWeightII([3, 3, 2, 2, 2]), 0);"
      },
      {
        "name": "matches a brute force that tries every smash",
        "body": "let seed = 4242;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nconst arr = (n, lo, hi) => Array.from({ length: n }, () => lo + rnd(hi - lo + 1));\nconst brute = (stones) => {\n  const memo = new Map();\n  const rec = (a) => {\n    if (a.length === 0) return 0;\n    if (a.length === 1) return a[0];\n    const key = a.slice().sort((x, y) => x - y).join(',');\n    if (memo.has(key)) return memo.get(key);\n    let best = Infinity;\n    for (let i = 0; i < a.length; i++) {\n      for (let j = i + 1; j < a.length; j++) {\n        const rest = a.filter((_, k) => k !== i && k !== j);\n        const d = Math.abs(a[i] - a[j]);\n        best = Math.min(best, rec(d === 0 ? rest : rest.concat([d])));\n      }\n    }\n    memo.set(key, best);\n    return best;\n  };\n  return rec(stones);\n};\nfor (let t = 0; t < 150; t++) {\n  const stones = arr(1 + rnd(7), 1, 12);\n  assert.equal(lastStoneWeightII(stones), brute(stones), 'stones ' + stones);\n}"
      },
      {
        "name": "a larger instance finishes quickly",
        "body": "const stones = Array.from({ length: 60 }, (_, i) => (i * 37) % 100 + 1);\nconst total = stones.reduce((a, b) => a + b, 0);\nconst got = lastStoneWeightII(stones);\nassert.ok(got >= 0 && got <= 1);\nassert.equal((total - got) % 2, 0);"
      }
    ]
  }
];
