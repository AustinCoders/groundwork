import type { Exercise } from "../types";

export const dsaAddGreedy: Exercise[] = [
  {
    id: "ex-assign-cookies",
    chapter: "dsa-greedy",
    level: "beginner",
    title: "Assign Cookies",
    brief:
      "<p>Each child <code>i</code> has a greed factor <code>greed[i]</code>, the smallest cookie size that will make them happy. Each cookie <code>j</code> has a size <code>cookies[j]</code>. A cookie goes to at most one child, and a child gets at most one cookie.</p><p>Return the largest number of children you can make happy.</p><ul><li>A child is happy when their cookie is at least as big as their greed</li><li>Either list may be empty</li><li>Do not change the input arrays</li></ul>",
    starter:
      "function findContentChildren(greed, cookies) {\n  // TODO: sort both lists and match the least greedy child with the smallest cookie that works\n}\n",
    hints: [
      "Which child is easiest to satisfy? Serve that child first, and use the cheapest cookie that works for them.",
      "Sort both lists, then walk the cookies from smallest to largest, keeping a pointer to the least greedy child who is still unhappy.",
      "If the current cookie is at least the pointed child's greed, that child is happy: move the child pointer. Either way, move on to the next cookie.",
    ],
    solution:
      "function findContentChildren(greed, cookies) {\n  const children = [...greed].sort((a, b) => a - b);\n  const sizes = [...cookies].sort((a, b) => a - b);\n  let child = 0;\n  for (let cookie = 0; cookie < sizes.length && child < children.length; cookie++) {\n    if (sizes[cookie] >= children[child]) child++;\n  }\n  return child;\n}\n",
    tests: [
      { name: "not enough cookies", body: "assert.equal(findContentChildren([1, 2, 3], [1, 1]), 1);" },
      { name: "more cookies than children", body: "assert.equal(findContentChildren([1, 2], [1, 2, 3]), 2);" },
      { name: "no children or no cookies", body: "assert.equal(findContentChildren([], [1, 2]), 0);\nassert.equal(findContentChildren([1, 2], []), 0);" },
      { name: "every cookie is too small", body: "assert.equal(findContentChildren([5, 6], [1, 2, 3]), 0);" },
      { name: "unsorted input", body: "assert.equal(findContentChildren([10, 9, 8, 7], [5, 6, 7, 8]), 2);" },
      { name: "a big cookie is not wasted on a small child when it is needed", body: "assert.equal(findContentChildren([1, 5], [5, 1]), 2);\nassert.equal(findContentChildren([3, 1], [3]), 1);" },
      { name: "equal greed values", body: "assert.equal(findContentChildren([2, 2, 2], [2, 2]), 2);" },
      {
        name: "the inputs are not changed",
        body: "const greed = [3, 1, 2];\nconst cookies = [2, 3, 1];\nfindContentChildren(greed, cookies);\nassert.deepEqual(greed, [3, 1, 2]);\nassert.deepEqual(cookies, [2, 3, 1]);",
      },
    ],
  },
  {
    id: "ex-queue-reconstruction-by-height",
    chapter: "dsa-greedy",
    level: "intermediate",
    title: "Queue Reconstruction by Height",
    brief:
      "<p>Each person is a pair <code>[h, k]</code>: their height <code>h</code>, and the number <code>k</code> of people standing <b>in front of them</b> who are at least as tall. The pairs arrive in no particular order.</p><p>Return the queue, as an array of the same pairs, in which every person's <code>k</code> is correct. The input is guaranteed to have exactly one valid answer.</p><ul><li>Do not change the input array or its pairs</li><li>Equal heights are allowed</li></ul>",
    starter:
      "function reconstructQueue(people) {\n  // TODO: insert people from tallest to shortest, each at index k\n}\n",
    hints: [
      "If you place people from tallest to shortest, everyone already in the queue is at least as tall as the next person to arrive.",
      "So the next person belongs at index k of the current queue, and later (shorter) people never change their count.",
      "Sort by height descending, and for equal heights by k ascending. Use splice(k, 0, person) to insert.",
    ],
    solution:
      "function reconstructQueue(people) {\n  const sorted = [...people].sort((a, b) => b[0] - a[0] || a[1] - b[1]);\n  const queue = [];\n  for (const person of sorted) {\n    queue.splice(person[1], 0, [...person]);\n  }\n  return queue;\n}\n",
    tests: [
      {
        name: "a standard case",
        body: "assert.deepEqual(reconstructQueue([[7, 0], [4, 4], [7, 1], [5, 0], [6, 1], [5, 2]]), [[5, 0], [7, 0], [5, 2], [6, 1], [4, 4], [7, 1]]);",
      },
      {
        name: "another case with repeated heights",
        body: "assert.deepEqual(reconstructQueue([[6, 0], [5, 0], [4, 0], [3, 2], [2, 2], [1, 4]]), [[4, 0], [5, 0], [2, 2], [3, 2], [1, 4], [6, 0]]);",
      },
      { name: "a single person", body: "assert.deepEqual(reconstructQueue([[5, 0]]), [[5, 0]]);" },
      { name: "an empty queue", body: "assert.deepEqual(reconstructQueue([]), []);" },
      { name: "everyone the same height", body: "assert.deepEqual(reconstructQueue([[5, 2], [5, 0], [5, 1]]), [[5, 0], [5, 1], [5, 2]]);" },
      { name: "strictly decreasing heights in a row", body: "assert.deepEqual(reconstructQueue([[1, 2], [2, 1], [3, 0]]), [[3, 0], [2, 1], [1, 2]]);" },
      {
        name: "the answer is a valid queue",
        body: "const input = [[9, 0], [7, 0], [1, 9], [3, 0], [2, 7], [5, 3], [6, 0], [3, 4], [6, 2], [5, 2]];\nconst queue = reconstructQueue(input);\nassert.equal(queue.length, input.length);\nqueue.forEach(([h, k], i) => {\n  const taller = queue.slice(0, i).filter(([other]) => other >= h).length;\n  assert.equal(taller, k, 'person ' + h + ',' + k + ' has ' + taller + ' in front');\n});",
      },
      {
        name: "the input is not changed",
        body: "const input = [[7, 0], [4, 4], [7, 1], [5, 0], [6, 1], [5, 2]];\nconst snapshot = JSON.stringify(input);\nconst queue = reconstructQueue(input);\nassert.equal(JSON.stringify(input), snapshot);\nqueue[0][1] = 99;\nassert.equal(JSON.stringify(input), snapshot);",
      },
    ],
  },
  {
    id: "ex-minimum-arrows-burst-balloons",
    chapter: "dsa-greedy",
    level: "intermediate",
    title: "Minimum Number of Arrows to Burst Balloons",
    brief:
      "<p>Each balloon is a horizontal span <code>[xStart, xEnd]</code>. An arrow shot straight up at position <code>x</code> bursts every balloon with <code>xStart &lt;= x &lt;= xEnd</code>, ends included, and the arrow keeps going. Return the fewest arrows that burst all the balloons.</p><ul><li>Spans that only touch, such as <code>[1, 2]</code> and <code>[2, 3]</code>, can share one arrow</li><li>An empty list needs 0 arrows</li><li>Coordinates can be negative or large; do not change the input</li></ul>",
    starter:
      "function findMinArrowShots(points) {\n  // TODO: sort by right end and shoot at the right end of the first unburst balloon\n}\n",
    hints: [
      "Pick the balloon that ends first. Where is the best place to shoot so that it is hit?",
      "Shoot at its right end: that is as far right as you can go and still hit it, so it reaches the most balloons.",
      "Sort by right end. A balloon that starts after the last arrow position needs a new arrow; otherwise it is already burst.",
    ],
    solution:
      "function findMinArrowShots(points) {\n  if (points.length === 0) return 0;\n  const sorted = [...points].sort((a, b) => a[1] - b[1]);\n  let arrows = 1;\n  let arrowAt = sorted[0][1];\n  for (let i = 1; i < sorted.length; i++) {\n    if (sorted[i][0] > arrowAt) {\n      arrows++;\n      arrowAt = sorted[i][1];\n    }\n  }\n  return arrows;\n}\n",
    tests: [
      { name: "two groups", body: "assert.equal(findMinArrowShots([[10, 16], [2, 8], [1, 6], [7, 12]]), 2);" },
      { name: "no overlaps at all", body: "assert.equal(findMinArrowShots([[1, 2], [3, 4], [5, 6], [7, 8]]), 4);" },
      { name: "touching spans share an arrow", body: "assert.equal(findMinArrowShots([[1, 2], [2, 3], [3, 4], [4, 5]]), 2);" },
      { name: "an empty list and a single balloon", body: "assert.equal(findMinArrowShots([]), 0);\nassert.equal(findMinArrowShots([[5, 9]]), 1);" },
      { name: "one balloon covers the rest", body: "assert.equal(findMinArrowShots([[1, 100], [10, 20], [30, 40]]), 2);" },
      { name: "extreme coordinates", body: "assert.equal(findMinArrowShots([[-2147483646, -2147483645], [2147483646, 2147483647]]), 2);" },
      { name: "sorting by start would fail", body: "assert.equal(findMinArrowShots([[1, 10], [2, 3], [4, 5], [6, 7]]), 3);" },
      { name: "the input is not changed", body: "const points = [[3, 4], [1, 2]];\nfindMinArrowShots(points);\nassert.deepEqual(points, [[3, 4], [1, 2]]);" },
    ],
  },
  {
    id: "ex-valid-parenthesis-string",
    chapter: "dsa-greedy",
    level: "intermediate",
    title: "Valid Parenthesis String",
    brief:
      "<p>A string contains only <code>(</code>, <code>)</code> and <code>*</code>. Return <code>true</code> if the stars can each be replaced by <code>(</code>, <code>)</code> or an empty string so that the result is a valid, balanced parenthesis string.</p><ul><li>Every <code>(</code> must be closed by a later <code>)</code>, and every <code>)</code> must have an earlier <code>(</code> to match</li><li>The empty string is valid</li><li>Target complexity: O(n) time, O(1) extra space</li></ul>",
    starter:
      "function checkValidString(s) {\n  // TODO: track the fewest and the most open brackets that are still possible\n}\n",
    hints: [
      "Without stars you would just count open brackets. With stars, the count is not one number but a range of possible numbers.",
      "Keep lo (fewest possible open) and hi (most possible open). A ( raises both, a ) lowers both, and a * lowers lo and raises hi.",
      "If hi goes below 0, return false. If lo goes below 0, set it back to 0. At the end the string is valid exactly when lo is 0.",
    ],
    solution:
      'function checkValidString(s) {\n  let lo = 0;\n  let hi = 0;\n  for (const ch of s) {\n    if (ch === "(") {\n      lo++;\n      hi++;\n    } else if (ch === ")") {\n      lo--;\n      hi--;\n    } else {\n      lo--;\n      hi++;\n    }\n    if (hi < 0) return false;\n    if (lo < 0) lo = 0;\n  }\n  return lo === 0;\n}\n',
    tests: [
      { name: "no stars, balanced", body: 'assert.equal(checkValidString("()"), true);\nassert.equal(checkValidString("(())()"), true);' },
      { name: "no stars, unbalanced", body: 'assert.equal(checkValidString("(()"), false);\nassert.equal(checkValidString("())"), false);' },
      { name: "a star can be a bracket", body: 'assert.equal(checkValidString("(*)"), true);\nassert.equal(checkValidString("(*))"), true);' },
      { name: "a star can be empty", body: 'assert.equal(checkValidString("*"), true);\nassert.equal(checkValidString("()*"), true);' },
      { name: "the empty string", body: 'assert.equal(checkValidString(""), true);' },
      { name: "a closing bracket comes first", body: 'assert.equal(checkValidString(")("), false);\nassert.equal(checkValidString(")*("), false);\nassert.equal(checkValidString("*)"), true);' },
      { name: "stars that are too late to open", body: 'assert.equal(checkValidString("(((*)"), false);\nassert.equal(checkValidString("*(("), false);' },
      { name: "many stars", body: 'assert.equal(checkValidString("(*****)"), true);\nassert.equal(checkValidString("((*)*)(*"), true);' },
    ],
  },
  {
    id: "ex-best-time-to-buy-and-sell-stock-ii",
    chapter: "dsa-greedy",
    level: "beginner",
    title: "Best Time to Buy and Sell Stock II",
    brief:
      "<p><code>prices[i]</code> is the price of a stock on day <code>i</code>. You may buy and sell as many times as you like, but you can hold at most one share at a time, and you may sell and buy again on the same day.</p><p>Return the maximum profit you can make. If no profit is possible, return 0.</p><ul><li>An empty list or a single day gives 0</li><li>Target complexity: O(n) time, O(1) space</li></ul>",
    starter: "function maxProfitMany(prices) {\n  // TODO: what is the sum of every rise from one day to the next?\n}\n",
    hints: [
      "Any profitable trade from day i to day j is the sum of the day-to-day changes between them.",
      "Negative changes only hurt, so you want every positive change and none of the negative ones.",
      "Walk the array and add prices[i] - prices[i - 1] whenever it is positive.",
    ],
    solution:
      "function maxProfitMany(prices) {\n  let profit = 0;\n  for (let i = 1; i < prices.length; i++) {\n    if (prices[i] > prices[i - 1]) profit += prices[i] - prices[i - 1];\n  }\n  return profit;\n}\n",
    tests: [
      { name: "two rises", body: "assert.equal(maxProfitMany([7, 1, 5, 3, 6, 4]), 7);" },
      { name: "one long rise", body: "assert.equal(maxProfitMany([1, 2, 3, 4, 5]), 4);" },
      { name: "prices only fall", body: "assert.equal(maxProfitMany([7, 6, 4, 3, 1]), 0);" },
      { name: "empty and single day", body: "assert.equal(maxProfitMany([]), 0);\nassert.equal(maxProfitMany([5]), 0);" },
      { name: "flat prices", body: "assert.equal(maxProfitMany([3, 3, 3, 3]), 0);" },
      { name: "a rise, a fall and a rise", body: "assert.equal(maxProfitMany([1, 5, 2, 8]), 10);" },
      { name: "a large input", body: "const prices = Array.from({ length: 100000 }, (_, i) => (i % 2 === 0 ? 1 : 3));\nassert.equal(maxProfitMany(prices), 100000);" },
    ],
  },
  {
    id: "ex-fractional-knapsack",
    chapter: "dsa-greedy",
    level: "intermediate",
    title: "Fractional Knapsack",
    brief:
      "<p><code>items</code> is an array of <code>[weight, value]</code> pairs, and <code>capacity</code> is the most weight the bag can hold. Unlike the 0/1 knapsack, you may take <b>part</b> of an item: taking a fraction <code>f</code> of an item adds <code>f * weight</code> to the bag and <code>f * value</code> to your total.</p><p>Return the largest total value the bag can hold.</p><ul><li>All weights are positive</li><li>Return a number; the tests allow a tiny rounding error</li><li>Do not change the input array</li></ul>",
    starter:
      "function fractionalKnapsack(items, capacity) {\n  // TODO: take items by best value per unit of weight, splitting the last one\n}\n",
    hints: [
      "Which item gives the most value for each unit of weight it uses up?",
      "Sort by value divided by weight, best first.",
      "Take each item whole while it fits. For the first one that does not fit, take only the fraction that does, add its share of the value, and stop.",
    ],
    solution:
      "function fractionalKnapsack(items, capacity) {\n  const sorted = [...items].sort((a, b) => b[1] / b[0] - a[1] / a[0]);\n  let value = 0;\n  let room = capacity;\n  for (const [weight, worth] of sorted) {\n    if (room === 0) break;\n    const take = Math.min(weight, room);\n    value += worth * (take / weight);\n    room -= take;\n  }\n  return value;\n}\n",
    tests: [
      { name: "the classic case", body: "assert.ok(Math.abs(fractionalKnapsack([[10, 60], [20, 100], [30, 120]], 50) - 240) < 1e-9);" },
      { name: "everything fits", body: "assert.ok(Math.abs(fractionalKnapsack([[2, 3], [4, 5]], 100) - 8) < 1e-9);" },
      { name: "no capacity", body: "assert.equal(fractionalKnapsack([[2, 3]], 0), 0);" },
      { name: "no items", body: "assert.equal(fractionalKnapsack([], 10), 0);" },
      { name: "a fraction of a single item", body: "assert.ok(Math.abs(fractionalKnapsack([[10, 30]], 4) - 12) < 1e-9);" },
      { name: "the best ratio is not the most valuable item", body: "assert.ok(Math.abs(fractionalKnapsack([[100, 150], [1, 2]], 51) - 77) < 1e-9);" },
      { name: "differs from the 0/1 answer", body: "assert.ok(Math.abs(fractionalKnapsack([[6, 10], [5, 7], [5, 7]], 10) - (10 + (4 / 5) * 7)) < 1e-9);" },
      { name: "the input is not changed", body: "const items = [[30, 120], [10, 60]];\nfractionalKnapsack(items, 20);\nassert.deepEqual(items, [[30, 120], [10, 60]]);" },
    ],
  },
];
