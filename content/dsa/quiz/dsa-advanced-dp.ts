import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "adp-assign-subsets",
      chapter: "dsa-advanced-dp",
      level: "advanced",
      skill: "recognise",
      pattern: "bitmask-dp",
      section: "bitmask-dp-without-a-last-dimension-the-assignment-problem",
      placement: true,
      kind: "single",
      prompt:
        "<p>There are 16 workers and 16 jobs, and <code>cost[w][j]</code> is what it costs to give job <code>j</code> to worker <code>w</code>. Every worker gets exactly one job and every job goes to exactly one worker. Which approach finds the cheapest assignment in reasonable time?</p>",
      choices: [
        {
          id: "a",
          text: "Go through the workers in order and give each one the cheapest job that is still free, never changing an earlier choice.",
          why: "A worker that grabs the cheapest job can leave a very expensive job for a later worker. With <code>cost = [[1, 2], [1, 100]]</code> the first worker takes job 0 for 1, the second must take job 1 for 100, and the total is 101, while giving job 1 to the first worker and job 0 to the second costs only 3.",
        },
        {
          id: "b",
          text: "Write a recursive search that tries every way to match workers to jobs, 16! of them, and keeps the cheapest one it finds.",
          why: "It is correct, but 16! is about 2.1 × 10<sup>13</sup> assignments, far too many to try one by one. Many of them share the same set of taken jobs, and that is the overlap a DP can reuse.",
        },
        {
          id: "c",
          text: "Let <code>dp[mask]</code> be the cheapest cost of giving the jobs in <code>mask</code> to the first <code>popcount(mask)</code> workers, grown one job at a time.",
          why: "The set of jobs already taken is all the remaining workers need to know, and its size says which worker is next. That gives 2<sup>16</sup> states with at most 16 moves each, about a million steps.",
        },
        {
          id: "d",
          text: "Let <code>dp[i]</code> be the cheapest cost of serving the first <code>i</code> workers, and build it from <code>dp[i - 1]</code> one worker at a time.",
          why: "<code>dp[i - 1]</code> does not say which jobs are already used, and the next worker's options depend on that. Two histories with the same cost can leave different jobs free, so one number per prefix is not a valid state.",
        },
      ],
      answer: "c",
    },
    {
      id: "adp-tree-return",
      chapter: "dsa-advanced-dp",
      level: "advanced",
      skill: "recognise",
      pattern: "bitmask-dp",
      section: "dp-on-trees-the-subtree-is-the-subproblem",
      placement: true,
      kind: "single",
      prompt:
        "<p>A binary tree has a number on every node. You may pick any nodes, as long as you never pick a node together with one of its children, and you want the largest total. A recursive helper handles each subtree and hands something back to the parent. What should it hand back?</p>",
      choices: [
        {
          id: "a",
          text: "Two numbers: the best total if the subtree's root is picked, and the best total if it is not.",
          why: "The parent needs both. If the parent is picked, each child's subtree must be taken with its root left out. If it is not picked, each child can be taken in whichever way is better. Two numbers carry everything the parent needs.",
        },
        {
          id: "b",
          text: "One number: the best total anywhere inside the subtree, whether or not its root is picked.",
          why: "When the parent is picked, the child's root must stay unpicked, and the value of that case can be smaller than the subtree's best total. One number cannot tell the parent which case it is looking at.",
        },
        {
          id: "c",
          text: "The depth of the subtree, so the parent can choose to pick every other level of the tree.",
          why: "Picking alternate levels can fall well short of the best. For a chain with values 5, 1, 1, 5 the even levels total 6 and the odd levels total 6, but picking the first and the last node gives 10.",
        },
        {
          id: "d",
          text: "The set of nodes picked inside the subtree, stored as a bitmask over all of the nodes.",
          why: "A bitmask over the nodes needs 2<sup>n</sup> states, which is hopeless for a tree with thousands of nodes. Only the status of the subtree's root matters to the parent, so a mask is far more than is needed.",
        },
      ],
      answer: "a",
    },
    {
      id: "adp-digit-big-n",
      chapter: "dsa-advanced-dp",
      level: "advanced",
      skill: "recognise",
      pattern: "bitmask-dp",
      section: "digit-dp-counting-numbers-up-to-n-with-a-property",
      placement: true,
      kind: "single",
      prompt:
        "<p>Count the integers from 1 to N whose digit sum is divisible by 7, where N can be as large as 10<sup>18</sup>. Which approach fits?</p>",
      choices: [
        {
          id: "a",
          text: "Loop from 1 to N, computing the digit sum of every number and counting those divisible by 7.",
          why: "That is up to 10<sup>18</sup> iterations, far more than any machine can run in a reasonable time. The count has to be built without visiting the numbers one by one.",
        },
        {
          id: "b",
          text: "Return <code>Math.floor(N / 7)</code>, because one number in every seven has a digit sum divisible by 7.",
          why: "A number being divisible by 7 and its digit sum being divisible by 7 are different properties. Up to 30 the qualifying numbers are 7, 16 and 25, which is 3, while <code>Math.floor(30 / 7)</code> is 4.",
        },
        {
          id: "c",
          text: "Build the number digit by digit, keeping (position, digit sum mod 7, whether the prefix still equals N's).",
          why: "There are at most 19 positions, 7 remainders and 2 values of the flag, so the table is tiny. The flag decides whether the next digit is capped at N's digit or free to be anything from 0 to 9.",
        },
        {
          id: "d",
          text: "Use an interval DP over the values, with <code>dp[l][r]</code> counting the qualifying numbers between <code>l</code> and <code>r</code>, built from shorter ranges.",
          why: "That table would need a cell for every pair of values up to 10<sup>18</sup>. Interval DP indexes two ends of a sequence you can store, not a range of values that large.",
        },
      ],
      answer: "c",
    },
    {
      id: "adp-tsp-time",
      chapter: "dsa-advanced-dp",
      level: "advanced",
      skill: "complexity",
      pattern: "bitmask-dp",
      section: "traveling-salesman-the-canonical-bitmask-dp",
      kind: "single",
      prompt:
        "<p>The chapter's <code>tsp(dist)</code> fills <code>dp[mask][last]</code> for <code>n</code> cities, trying every unvisited city as the next one. What is the tightest bound on its <em>worst-case time</em>, in terms of <code>n</code>?</p>",
      choices: [
        {
          id: "a",
          text: "O(2<sup>n</sup> · n)",
          why: "That counts the states: 2<sup>n</sup> masks times n choices of the last city. Every state also loops over up to n next cities, which adds one more factor of n.",
        },
        {
          id: "b",
          text: "O(2<sup>n</sup> · n<sup>2</sup>)",
          why: "There are about 2<sup>n</sup> · n states, and each one tries up to n next cities with a constant amount of work for each. The same states are reached by many orders of visiting, and the table stores each one once.",
        },
        {
          id: "c",
          text: "O(n!)",
          why: "That is what trying every order of the cities costs. It is an upper bound, but the DP merges all the orders that end in the same (set, last city) pair, so for all but small n it does far less. It is not the tightest bound.",
        },
        {
          id: "d",
          text: "O(n<sup>2</sup>)",
          why: "That would be a single pass over the distance matrix. The table alone has 2<sup>n</sup> · n cells, which is exponential in n.",
        },
      ],
      answer: "b",
    },
    {
      id: "adp-assign-space",
      chapter: "dsa-advanced-dp",
      level: "advanced",
      skill: "complexity",
      pattern: "bitmask-dp",
      section: "bitmask-dp-without-a-last-dimension-the-assignment-problem",
      kind: "single",
      prompt:
        "<p>For <code>n</code> workers and <code>n</code> jobs, <code>minAssignmentCost</code> keeps a single array <code>dp</code> of length <code>1 &lt;&lt; n</code>, indexed by the mask of jobs already given out, and finds the next worker with <code>popcount(mask)</code>. What is the tightest bound on the <em>extra space</em> it uses, beyond the <code>cost</code> matrix?</p>",
      choices: [
        {
          id: "a",
          text: "O(n)",
          why: "The array has one cell for every subset of jobs, not one for every worker. A table of n cells could only record how many jobs are taken, not which ones.",
        },
        {
          id: "b",
          text: "O(n<sup>2</sup>)",
          why: "n<sup>2</sup> is the size of the cost matrix, which is the input and does not count as extra space. The table is indexed by subsets, which grow much faster.",
        },
        {
          id: "c",
          text: "O(2<sup>n</sup> · n)",
          why: "That is the size of the traveling salesman table, which needs a <code>last</code> index. Here the number of set bits already says which worker is next, so that second dimension is never stored.",
        },
        {
          id: "d",
          text: "O(2<sup>n</sup>)",
          why: "There is one cell per subset of jobs, and <code>popcount</code> needs only a few variables. Deriving the worker from the mask is what saves the factor of n that the traveling salesman table carries.",
        },
      ],
      answer: "d",
    },
    {
      id: "adp-submask-trace",
      chapter: "dsa-advanced-dp",
      level: "advanced",
      skill: "trace",
      pattern: "bitmask-dp",
      section: "bitmask-dp-an-integer-is-the-visited-set",
      kind: "single",
      prompt:
        "<p>What does <code>seen</code> hold after this code runs?</p><pre><code>const mask = 0b10110;\nconst seen = [];\nfor (let s = mask; s; s = (s - 1) &amp; mask) {\n  seen.push(s);\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>[22, 20, 18, 16, 6, 4, 2]</code>",
          why: "The mask 22 has three set bits, so it has 2<sup>3</sup> - 1 = 7 non-empty submasks. Each step subtracts 1 and then clears every bit that is not in the mask, so the loop visits them from the largest down.",
        },
        {
          id: "b",
          text: "<code>[22, 20, 18, 16, 6, 4, 2, 0]</code>",
          why: "The loop stops when <code>s</code> becomes 0, because 0 is falsy, so the empty subset is never pushed. If you need it, handle it after the loop.",
        },
        {
          id: "c",
          text: "<code>[22, 21, 20, 19, 18, 17, 16]</code>",
          why: "That is how the sequence would begin if the loop used <code>s - 1</code> alone. The <code>&amp; mask</code> clears bits outside the mask after each step, which is why a number such as 21 (<code>10101</code>), with a bit the mask lacks, is skipped.",
        },
        {
          id: "d",
          text: "<code>[2, 4, 6, 16, 18, 20, 22]</code>",
          why: "Those are the right numbers in the wrong order. The loop starts from the full mask and counts down, so the largest submask comes first.",
        },
      ],
      answer: "a",
    },
    {
      id: "adp-order-tsp",
      chapter: "dsa-advanced-dp",
      level: "advanced",
      skill: "trace",
      pattern: "bitmask-dp",
      section: "traveling-salesman-the-canonical-bitmask-dp",
      kind: "order",
      prompt:
        "<p>Put the parts of <code>tsp</code> in the order in which the code first reaches them. Start with the base case and end with the step that closes the tour.</p>",
      items: [
        { id: "base", text: "Set <code>dp[1][0] = 0</code>, the state in which only city 0 is visited." },
        {
          id: "masks",
          text: "Loop <code>mask</code> over the subsets, skipping any subset that leaves out city 0.",
        },
        {
          id: "last",
          text: "For each <code>last</code> city in the subset whose state is reachable, read <code>cur = dp[mask][last]</code>.",
        },
        { id: "next", text: "Loop over each <code>next</code> city that is not yet in <code>mask</code>." },
        {
          id: "relax",
          text: "Keep the smaller of the stored <code>dp[nextMask][next]</code> and <code>cur + dist[last][next]</code>.",
        },
        {
          id: "close",
          text: "Take the minimum of <code>dp[FULL][last] + dist[last][0]</code> over the last cities.",
        },
      ],
      why: "The base case comes first because every later step reads from it. The three loops are entered from the outside in, since <code>last</code> is chosen inside a mask and <code>next</code> inside a <code>last</code>. The update needs all three, so it sits in the innermost loop, and the tour is closed only after every mask has been processed.",
    },
    {
      id: "adp-two-sided-return",
      chapter: "dsa-advanced-dp",
      level: "advanced",
      skill: "edge-case",
      pattern: "bitmask-dp",
      section: "the-two-value-trick-what-you-return-upward-what-you-record",
      kind: "single",
      prompt:
        "<p>A teammate changes the last line of <code>gain</code> so that it returns the two-sided value, using both children on the way up. What does <code>maxPathSum(tree)</code> return?</p><pre><code>function maxPathSum(root) {\n  let best = -Infinity;\n  function gain(node) {\n    if (!node) return 0;\n    const left = Math.max(gain(node.left), 0);\n    const right = Math.max(gain(node.right), 0);\n    best = Math.max(best, node.val + left + right);\n    return node.val + left + right;\n  }\n  gain(root);\n  return best;\n}\n\nconst tree = {\n  val: 1,\n  left: { val: 2, left: { val: 4 }, right: { val: 5 } },\n  right: { val: 3, left: { val: 6 }, right: { val: 7 } },\n};</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>18</code>, the same as the correct version.",
          why: "18 is the real answer, the path 7, 3, 1, 2, 5. It is what the function gives when it returns the one-sided <code>node.val + Math.max(left, right)</code>. With the changed line the parents receive far larger values.",
        },
        {
          id: "b",
          text: "<code>28</code>",
          why: "Node 2 now returns 2 + 4 + 5 = 11 and node 3 returns 3 + 6 + 7 = 16, so the root records 1 + 11 + 16 = 28, the sum of every node. No single path can bend at both 2 and 3 and also pass through the root.",
        },
        {
          id: "c",
          text: "<code>16</code>",
          why: "16 is the best two-sided value at node 3 alone, 3 + 6 + 7. The root still computes its own candidate from what the children return, and that candidate is larger.",
        },
        {
          id: "d",
          text: "<code>11</code>",
          why: "11 is the best two-sided value at node 2 alone, 2 + 4 + 5. The function keeps the maximum over every node, and the root's candidate is larger than that.",
        },
      ],
      answer: "b",
    },
    {
      id: "adp-leading-zeros",
      chapter: "dsa-advanced-dp",
      level: "advanced",
      skill: "edge-case",
      pattern: "bitmask-dp",
      section: "digit-dp-counting-numbers-up-to-n-with-a-property",
      kind: "single",
      prompt:
        '<p>A digit DP counts the integers from 1 to N with no two equal adjacent digits. A learner drops the <code>started</code> flag, so the rule <code>d === prev</code> also applies to the leading zeros that pad every number to the length of N. What does this version return for <code>count(100)</code>?</p><pre><code>function count(N) {\n  const digits = String(N).split("").map(Number);\n  function go(pos, prev, tight) {\n    if (pos === digits.length) return 1;\n    const limit = tight ? digits[pos] : 9;\n    let total = 0;\n    for (let d = 0; d &lt;= limit; d++) {\n      if (d === prev) continue;\n      total += go(pos + 1, d, tight &amp;&amp; d === limit);\n    }\n    return total;\n  }\n  return go(0, -1, true);\n}</code></pre>',
      choices: [
        {
          id: "a",
          text: "<code>90</code>",
          why: "90 is the true count: the 9 one-digit numbers, plus the 81 two-digit numbers whose digits differ, while 100 itself is rejected. A version that tracks <code>started</code> returns it. Without the flag the result is smaller.",
        },
        {
          id: "b",
          text: "<code>81</code>",
          why: "Padded to three digits, 7 becomes 007, and its two leading zeros are equal, so it is rejected. All of 1 to 9 vanish that way, while a two-digit number such as 042 survives when its digits differ. That leaves the 81 two-digit numbers.",
        },
        {
          id: "c",
          text: "<code>99</code>",
          why: "99 would be the count of 1 to 99 if the equal-digit rule did not exist at all. The rule is still applied, so 11, 22 and the other repeated-digit numbers are rejected, and the padding rejects more.",
        },
        {
          id: "d",
          text: "<code>89</code>",
          why: "Nothing in the code removes just one or two numbers. The leading zeros make every one-digit number fail at once, which is a bigger loss than this.",
        },
      ],
      answer: "b",
    },
    {
      id: "adp-interval-last",
      chapter: "dsa-advanced-dp",
      level: "advanced",
      skill: "recognise",
      pattern: "bitmask-dp",
      section: "interval-dp-solve-short-ranges-first-and-pick-the-last-move",
      kind: "single",
      prompt:
        "<p>In a row of values, you repeatedly remove one value and earn a reward that depends on its two neighbours at that moment, and the neighbours then become adjacent. The interval DP picks <code>k</code> in <code>dp[l][r]</code> as the value removed <em>last</em> in the range between <code>l</code> and <code>r</code>, not first. Why?</p>",
      choices: [
        {
          id: "a",
          text: "Because the value that is removed last in a range is always the largest value in that range.",
          why: "Nothing forces the last removal to be the largest value. The recurrence tries every <code>k</code> in the range and keeps the best, so any value can turn out to be the last one.",
        },
        {
          id: "b",
          text: "Because choosing the value removed first would give the same independent halves, but it needs a bigger table.",
          why: "The first removal does not split the range into independent halves: once it is gone, the value on its left becomes the neighbour of the value on its right, and rewards in both parts depend on that.",
        },
        {
          id: "c",
          text: "Because it lets the loops run over the left end <code>l</code> first, instead of over the length of the range.",
          why: "The loop order does not depend on that choice. A range is built from shorter ranges inside it, so the loops still go by increasing length whichever removal you pick as <code>k</code>.",
        },
        {
          id: "d",
          text: "Because at that moment its neighbours are exactly <code>l</code> and <code>r</code>, so the two sides cannot affect each other.",
          why: "Everything strictly between <code>l</code> and <code>r</code> except <code>k</code> is removed before <code>k</code>, so the reward for <code>k</code> uses <code>l</code> and <code>r</code>. The left part and the right part are then separate subproblems that share no neighbours.",
        },
      ],
      answer: "d",
    },
    {
      id: "adp-bitmask-fit",
      chapter: "dsa-advanced-dp",
      level: "advanced",
      skill: "recognise",
      pattern: "bitmask-dp",
      section: "recognizing-it-in-an-unseen-problem",
      kind: "multi",
      prompt:
        "<p>Select every task for which a DP over subsets, with a bitmask as the state, is a good fit at the stated size.</p>",
      choices: [
        {
          id: "a",
          text: "Split 16 items into groups at the lowest total cost, where the cost of a group depends only on which items it holds.",
          why: "The state is which items are already placed, so 2<sup>16</sup> subsets, and each state tries the possible last groups as submasks. That is about 3<sup>16</sup>, roughly 43 million steps, which is fine.",
        },
        {
          id: "b",
          text: "Find the longest strictly increasing subsequence of an array that holds 100,000 numbers.",
          why: "A mask over 100,000 elements has 2<sup>100000</sup> values, which can never be stored. This problem has polynomial solutions that track positions and lengths instead.",
        },
        {
          id: "c",
          text: "Find the shortest route that visits each of 12 delivery points exactly once and returns to the start.",
          why: "This is the traveling salesman shape: the state is the set of points visited plus the current point, about 2<sup>12</sup> · 12 states with 12 moves each.",
        },
        {
          id: "d",
          text: "Count the monotone routes, moving only right or down, across a 1000 by 1000 grid of cells.",
          why: "The state here is just a (row, column) pair, so a table of a million cells is enough. A subset of the cells could not even be held in a mask, and no subset is needed.",
        },
      ],
      answers: ["a", "c"],
    },
    {
      id: "adp-revisit-walk",
      chapter: "dsa-advanced-dp",
      level: "advanced",
      skill: "recognise",
      pattern: "bitmask-dp",
      section: "bitmask-dp-when-you-may-revisit-shortest-path-visiting-all-n",
      kind: "single",
      prompt:
        "<p>A connected, undirected graph has 10 nodes. Find the length of the shortest walk that visits every node. The walk may start anywhere and may revisit nodes and reuse edges. Which approach is correct?</p>",
      choices: [
        {
          id: "a",
          text: "A BFS over (node, visited set) states, started from every node with only its own bit set.",
          why: "Every move costs one edge and changes the state, so the first time any state with a full mask appears, its step count is the answer. Seeding every node covers the free choice of starting point.",
        },
        {
          id: "b",
          text: "The travelling-salesman table <code>dp[mask][last]</code>, filled in order of increasing mask.",
          why: "That order needs the mask to grow with every move. Here a move to an already visited node leaves the mask unchanged, so the states form cycles and no order of masks has all dependencies ready.",
        },
        {
          id: "c",
          text: "A BFS over the same states, but started only from node 0.",
          why: "It finds the shortest walk that starts at node 0. The best walk may need to start at a leaf or elsewhere, and then this answer is too large.",
        },
        {
          id: "d",
          text: "A single BFS over the nodes with a global visited set, stopping when all nodes were reached.",
          why: "That counts the depth at which the last node is first discovered from one start, not the length of one walk that passes through all of them. The walk has to go back and forth between branches.",
        },
      ],
      answer: "a",
    },
    {
      id: "adp-team-dimension",
      chapter: "dsa-advanced-dp",
      level: "advanced",
      skill: "recognise",
      pattern: "bitmask-dp",
      section: "masking-the-small-dimension-smallest-sufficient-team",
      kind: "single",
      prompt:
        "<p>A project needs up to 16 skills, and 60 people each know some of them. You must pick the fewest people so that every skill is known by someone. What should the bitmask index?</p>",
      choices: [
        {
          id: "a",
          text: "The set of people already picked.",
          why: "That is 2<sup>60</sup> subsets, far too many to store or loop over. The bitmask belongs on the dimension that is small.",
        },
        {
          id: "b",
          text: "The set of skills already covered; each person ORs their skills into the mask.",
          why: "There are only 2<sup>16</sup> sets of skills. <code>best[mask]</code> holds the fewest people whose skills together are exactly those, and each person is a 0/1 knapsack item.",
        },
        {
          id: "c",
          text: "The number of people picked so far, with no mask at all.",
          why: "A head count does not say which skills are covered, so two states with the same count are not interchangeable. The state must record the covered skills.",
        },
        {
          id: "d",
          text: "The position of the last person picked, as in the travelling-salesman table.",
          why: "Order does not matter in a team, and one position says nothing about which skills the team covers. It would also not shrink the state space.",
        },
      ],
      answer: "b",
    },
    {
      id: "adp-reroot-step",
      chapter: "dsa-advanced-dp",
      level: "advanced",
      skill: "trace",
      pattern: "bitmask-dp",
      section: "rerooting-the-answer-for-every-node-as-the-root",
      kind: "single",
      prompt:
        "<p>In a tree of <code>n = 6</code> nodes rooted at 0, the sum of distances from node 0 to all others is <code>ans[0] = 8</code>. Node 2 is a child of node 0 and its subtree contains <code>count[2] = 4</code> nodes. What is <code>ans[2]</code>?</p>",
      choices: [
        {
          id: "a",
          text: "10",
          why: "That is 8 + 4 - 2: the signs are swapped. Moving the root into the subtree makes the 4 nodes inside it closer, not farther.",
        },
        {
          id: "b",
          text: "12",
          why: "That is 8 + 4, which counts the 4 nodes in the subtree as farther away and forgets the 2 nodes outside the subtree entirely.",
        },
        {
          id: "c",
          text: "6",
          why: "Moving the root from 0 to 2 brings the 4 nodes inside its subtree one step closer (-4) and pushes the other 6 - 4 = 2 one step farther (+2): 8 - 4 + 2 = 6.",
        },
        {
          id: "d",
          text: "4",
          why: "That is 8 - 4, which counts the nodes that get closer but leaves out the 2 nodes outside the subtree that get one step farther.",
        },
      ],
      answer: "c",
    },
    {
      id: "adp-cameras-single",
      chapter: "dsa-advanced-dp",
      level: "advanced",
      skill: "edge-case",
      pattern: "bitmask-dp",
      section: "three-states-per-node-binary-tree-cameras",
      kind: "single",
      prompt:
        "<p>In the camera DP, a tree with a single node gives <code>cam = 1</code>, <code>cov = Infinity</code> and <code>need = 0</code> (a missing child counts as covered, with no camera possible). What must the function return?</p>",
      choices: [
        {
          id: "a",
          text: "0, the smallest of the three values.",
          why: "<code>need = 0</code> means the node has no camera and nobody watches it. The root has no parent to rescue it, so that state is not a valid answer.",
        },
        {
          id: "b",
          text: "Infinity, because no child can cover the root.",
          why: "That is only the <code>cov</code> value. The root can hold a camera itself, which is the <code>cam</code> state.",
        },
        {
          id: "c",
          text: "1, the smaller of <code>cam</code> and <code>cov</code>.",
          why: "The root may hold a camera or be covered by a child, never be left unwatched, so the answer is <code>min(cam, cov)</code>, which is 1 here.",
        },
        {
          id: "d",
          text: "2, because the node needs a camera and its missing children need one each.",
          why: "Missing children are not nodes and need nothing. The base case gives them <code>cov = 0</code>, so they add no cameras.",
        },
      ],
      answer: "c",
    },
    {
      id: "adp-merge-impossible",
      chapter: "dsa-advanced-dp",
      level: "advanced",
      skill: "edge-case",
      pattern: "bitmask-dp",
      section: "interval-dp-with-a-pile-count-merge-stones",
      kind: "single",
      prompt:
        "<p>Four piles of stones are in a row. A move merges exactly 3 consecutive piles into one, at a cost equal to their total. What does the merge-stones DP return for merging everything into one pile?</p>",
      choices: [
        {
          id: "a",
          text: "The sum of all stones, since the last merge covers every pile.",
          why: "That would be the cost of one final merge, but a single merge takes three piles, not four, so it cannot finish the job.",
        },
        {
          id: "b",
          text: "0, because the piles are already in a row, so no merge is needed to finish.",
          why: "Zero is only right for a single pile. Four piles are still four piles until something is merged.",
        },
        {
          id: "c",
          text: "The cheapest cost of merging three piles, leaving two piles.",
          why: "The problem asks for one pile at the end. Stopping at two piles is not an allowed result.",
        },
        {
          id: "d",
          text: "-1, because each move removes 2 piles and 4 - 1 = 3 is not divisible by 2.",
          why: "Each move turns 3 piles into 1, so it removes 2. Going from 4 piles to 1 needs 3 removals, which is not a multiple of 2, so one pile is never reached.",
        },
      ],
      answer: "d",
    },
    {
      id: "adp-deque-time",
      chapter: "dsa-advanced-dp",
      level: "advanced",
      skill: "complexity",
      pattern: "bitmask-dp",
      section: "monotone-deque-dp-the-best-of-the-last-k-states",
      kind: "single",
      prompt:
        "<p>For <code>dp[i] = nums[i] + max(0, max of dp[j] for j in [i - k, i - 1])</code> on an array of n numbers, what is the time of the version that keeps a monotonic deque of indices?</p>",
      choices: [
        {
          id: "a",
          text: "O(n · k)",
          why: "That is the cost of rescanning the window for every i. The deque replaces the scan.",
        },
        {
          id: "b",
          text: "O(n log k)",
          why: "A heap or a balanced tree for the window maximum would cost that. The deque does better, because each index is pushed once and popped at most once.",
        },
        {
          id: "c",
          text: "O(n)",
          why: "Each index enters the deque once and leaves it at most once, from the front when it falls out of the window or from the back when it is dominated, so the total work is linear.",
        },
        {
          id: "d",
          text: "O(n<sup>2</sup>)",
          why: "That is the worst case of the plain scan when k is as large as n. The deque version does not depend on k.",
        },
      ],
      answer: "c",
    },
    {
      id: "adp-dag-equal-moves",
      chapter: "dsa-advanced-dp",
      level: "advanced",
      skill: "edge-case",
      pattern: "bitmask-dp",
      section: "dp-over-a-dag-memoized-dfs-on-an-implicit-graph",
      kind: "single",
      prompt:
        "<p>The memoized DFS for the longest increasing path in a matrix moves only to strictly larger neighbours. A teammate changes the test to <code>matrix[nr][nc] &lt; matrix[r][c]</code> for skipping a neighbour, so equal values may chain. What goes wrong?</p>",
      choices: [
        {
          id: "a",
          text: "Nothing: the memo still stores every answer, so the result stays correct.",
          why: "The memo is only written after the recursive calls return. Two equal neighbours call each other before either has stored anything, so the memo never gets a chance to help.",
        },
        {
          id: "b",
          text: "The recursion never ends on equal neighbours, because the graph now has cycles.",
          why: "Equal cells A and B each count as a valid next step for the other, so <code>go(A)</code> calls <code>go(B)</code> which calls <code>go(A)</code> again, and the stack overflows.",
        },
        {
          id: "c",
          text: "Every answer comes out one larger than before.",
          why: "Nothing adds a constant to the result. The change allows moves that previously were forbidden, and that creates a cycle, not an offset.",
        },
        {
          id: "d",
          text: "The function returns 0 for every cell with an equal neighbour.",
          why: "A cell is only given the value 0 as a placeholder for not yet computed. With equal neighbours the calls never return, so no value is produced at all.",
        },
      ],
      answer: "b",
    },
  ],
  pattern: {
    pattern: "bitmask-dp",
    chapter: "dsa-advanced-dp",
    signals: [
      "n is at most about 20 and the task is to order, assign or split all of the items.",
      "The state is which items are already used, and the order they were used in does not matter.",
      "A tree problem where picking a node limits what its children may do.",
      "A count of the numbers up to a huge N whose digits satisfy a property.",
      "Removing or merging items in a range changes who the neighbours are.",
    ],
    template:
      "<pre><code>for (let mask = 0; mask &lt; 1 &lt;&lt; n; mask++) {\n  for (let next = 0; next &lt; n; next++) {\n    if ((mask &gt;&gt; next) &amp; 1) continue;\n    const grown = mask | (1 &lt;&lt; next);\n    dp[grown] = Math.min(dp[grown], dp[mask] + cost(mask, next));\n  }\n}</code></pre>",
    time: "O(2ⁿ · n) for a mask alone, O(2ⁿ · n²) when the last item is part of the state",
    space: "O(2ⁿ), or O(2ⁿ · n) when the last item is part of the state",
    styles: ["online-assessment", "onsite"],
  },
};
