import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "dpsm-cooldown-state",
      chapter: "dsa-dp-state-machines",
      level: "intermediate",
      skill: "recognise",
      pattern: "dp-state-machine",
      section: "a-cooldown-day-after-each-sale-a-third-mode",
      placement: true,
      kind: "single",
      prompt:
        "<p>You are given daily stock prices. You may trade as often as you like and hold one share at a time, but after you sell you must wait one full day before you can buy again. Which state lets each day's values be computed from the previous day's?</p>",
      choices: [
        {
          id: "a",
          text: "One number per day: the best profit made so far, and nothing else.",
          why: "The best profit says nothing about whether the last move was a sale, and that is exactly what decides whether tomorrow's purchase is allowed. Two prefixes with the same profit can have different futures.",
        },
        {
          id: "b",
          text: "Three modes per day: holding, sold today, and resting with nothing held.",
          why: "The mode sold today has a single exit, to the resting mode, and purchases are made only from the resting mode. That is the whole cooldown rule, and each day's three values depend only on the previous day's three.",
        },
        {
          id: "c",
          text: "Two modes per day: holding a share, and holding nothing, with a purchase allowed whenever nothing is held.",
          why: "Holding nothing after a sale and holding nothing after a long wait look the same here, so a purchase could not be blocked after a sale only. The cooldown needs a mode that remembers the sale.",
        },
        {
          id: "d",
          text: "The day together with how many transactions have been made so far, since each sale uses up one.",
          why: "The number of transactions is not limited in this problem, so a counter adds states without carrying anything the cooldown rule needs. What the rule needs to know is whether the share was sold yesterday.",
        },
      ],
      answer: "b",
    },
    {
      id: "dpsm-partition-approach",
      chapter: "dsa-dp-state-machines",
      level: "intermediate",
      skill: "recognise",
      pattern: "dp-state-machine",
      section: "subset-sum-and-partition-equal-subset-sum",
      placement: true,
      kind: "single",
      prompt:
        "<p>An array has up to 200 positive integers, each at most 100. Decide whether it can be split into two groups with equal sums, where every number goes into exactly one group. Which approach works?</p>",
      choices: [
        {
          id: "a",
          text: "Sort in descending order and put each number into whichever group is currently lighter, then compare the two sums.",
          why: "This can finish with unequal groups even when an equal split exists. On <code>[3, 3, 2, 2, 2]</code> it ends with groups of 7 and 5, but <code>{3, 3}</code> and <code>{2, 2, 2}</code> both sum to 6.",
        },
        {
          id: "b",
          text: "Try every way to split the array into two groups, and compare the sums of the two groups each time.",
          why: "There are 2<sup>200</sup> ways to choose the first group, far more than any machine can try. The values are small, which is what a table over sums can use.",
        },
        {
          id: "c",
          text: "Run the coin-change loop, with each number allowed any number of times, and test the half-total.",
          why: "Here every number can be used only once, and reuse changes the answer. For <code>[3, 9]</code> the half-total is 6, which two copies of the 3 would reach, yet no split of <code>[3, 9]</code> is equal.",
        },
        {
          id: "d",
          text: "Boolean subset sum to half the total, with the inner loop from high to low.",
          why: "If the total is odd the answer is no. Otherwise one group sums to half exactly when the other does, so one subset-sum question settles it. The array has at most 10,001 cells and each number is used at most once because the loop runs downwards.",
        },
      ],
      answer: "d",
    },
    {
      id: "dpsm-ordered-counting",
      chapter: "dsa-dp-state-machines",
      level: "intermediate",
      skill: "recognise",
      pattern: "dp-state-machine",
      section: "coin-change-ii-the-loop-order-decides-what-you-count",
      placement: true,
      kind: "single",
      prompt:
        "<p>Count the ways to make an amount from unlimited coins, where <code>1 + 2</code> and <code>2 + 1</code> are <b>different</b> ways. Which nesting of the loops over a one-dimensional array counts that?</p>",
      choices: [
        {
          id: "a",
          text: "Amounts in the outer loop, coins in the inner loop.",
          why: "Each way has one last coin, and what comes before it is a way to make the smaller amount. Summing over the last coin counts every ordered way once. For amount 3 with coins <code>[1, 2]</code> it gives 3.",
        },
        {
          id: "b",
          text: "Coins in the outer loop and amounts upwards in the inner loop, so each coin's uses are added up in turn.",
          why: "This records only how many of each coin are used, so <code>1 + 2</code> and <code>2 + 1</code> are one way. For amount 3 with coins <code>[1, 2]</code> it counts 2, but there are 3 ordered ways.",
        },
        {
          id: "c",
          text: "Coins in the outer loop and amounts downwards in the inner loop, so each coin is used at most once.",
          why: "Running downwards lets each coin be used at most once, which turns the problem into counting subsets of the coins. For amount 3 with coins <code>[1, 2]</code> that is 1, the subset <code>{1, 2}</code>.",
        },
        {
          id: "d",
          text: "Either nesting, because addition is commutative and the total comes out the same.",
          why: "The loops decide what is counted, not just how fast. For amount 3 with coins <code>[1, 2]</code> the two upward nestings give 2 and 3.",
        },
      ],
      answer: "a",
    },
    {
      id: "dpsm-why-backwards",
      chapter: "dsa-dp-state-machines",
      level: "intermediate",
      skill: "edge-case",
      pattern: "dp-state-machine",
      section: "the-proof-that-the-direction-is-not-a-style-choice",
      kind: "single",
      prompt:
        "<p>The one-array 0/1 knapsack has the inner loop <code>for (let w = capacity; w &gt;= weights[i]; w--)</code>. What goes wrong if it runs upwards instead, from <code>weights[i]</code> to <code>capacity</code>?</p>",
      choices: [
        {
          id: "a",
          text: "Some capacities are skipped, so their cells keep a stale value and the result is too small.",
          why: "Both directions visit exactly the same cells, from <code>weights[i]</code> to <code>capacity</code>. Only the order differs, and cells below <code>weights[i]</code> are correctly left alone either way.",
        },
        {
          id: "b",
          text: "The loop runs more iterations than before, so it can exceed the time limit on large inputs.",
          why: "The number of iterations per item is the same in both directions. The difference is in which values the cells read, not in how many cells there are.",
        },
        {
          id: "c",
          text: "The array needs a different starting value, because upward cells read a value that was never set.",
          why: "Every cell starts at 0 in both versions and every cell it reads is set before the read. The result differs because of which row's value is read, not because anything is unset.",
        },
        {
          id: "d",
          text: "The cell it reads was already rewritten for this item, so the item can be taken more than once.",
          why: "Going upwards, the cell below <code>w</code> was written earlier in the same pass, so it already includes the current item. Adding the item's value on top takes it a second time, which is the rule of the unbounded knapsack.",
        },
      ],
      answer: "d",
    },
    {
      id: "dpsm-forward-trace",
      chapter: "dsa-dp-state-machines",
      level: "intermediate",
      skill: "trace",
      pattern: "dp-state-machine",
      section: "0-1-knapsack-and-why-the-inner-loop-runs-backwards",
      kind: "single",
      prompt:
        "<p>A single item has weight 4 and value 7, and the capacity is 14. The inner loop is written upwards by mistake: <code>for (let w = 4; w &lt;= 14; w++)</code>, with <code>best[w] = Math.max(best[w], best[w - 4] + 7)</code>. What is <code>best[14]</code> at the end?</p>",
      choices: [
        {
          id: "a",
          text: "7",
          why: "This is the right answer to the 0/1 problem, where the single item is taken once. The upward loop does not stop at one copy.",
        },
        {
          id: "b",
          text: "14",
          why: "Two copies would weigh 8, but the upward loop keeps going. Cell 14 reads cell 10, which already holds 14 after two copies, so it gets 21.",
        },
        {
          id: "c",
          text: "21",
          why: "Cell 4 gets 7, cell 8 reads cell 4 and gets 14, and cell 12 reads cell 8 and gets 21. Cell 14 reads cell 10, which holds 14, so it gets 14 + 7 = 21. Three copies weigh 12, which fits in 14.",
        },
        {
          id: "d",
          text: "28",
          why: "Four copies would need a weight of 16, and the capacity is only 14. No cell can reach 28.",
        },
      ],
      answer: "c",
    },
    {
      id: "dpsm-cooldown-trace",
      chapter: "dsa-dp-state-machines",
      level: "intermediate",
      skill: "trace",
      pattern: "dp-state-machine",
      section: "a-cooldown-day-after-each-sale-a-third-mode",
      kind: "single",
      prompt:
        "<p>The chapter's <code>maxProfitCooldown</code> runs on prices <code>[2, 4]</code>. The variables start at <code>held = -Infinity</code>, <code>sold = -Infinity</code> and <code>rest = 0</code>. What are <code>(held, sold, rest)</code> after both days?</p>",
      choices: [
        {
          id: "a",
          text: "<code>(-2, 2, 0)</code>",
          why: "On day 1, <code>held</code> becomes <code>0 - 2 = -2</code>, <code>sold</code> stays at <code>-Infinity</code> and <code>rest</code> stays 0. On day 2, <code>held</code> keeps <code>-2</code>, <code>sold</code> is the old <code>held</code> plus 4, which is 2, and <code>rest</code> takes the old <code>sold</code>, <code>-Infinity</code>, so it stays 0.",
        },
        {
          id: "b",
          text: "<code>(-2, 2, 2)</code>",
          why: "<code>rest</code> takes the larger of the old <code>rest</code> and the <em>old</em> <code>sold</code>. The old <code>sold</code> is still <code>-Infinity</code>, because today's sale only turns into rest tomorrow.",
        },
        {
          id: "c",
          text: "<code>(-4, 2, 0)</code>",
          why: "Buying at 4 from <code>rest = 0</code> gives <code>-4</code>, but <code>held</code> keeps the larger of that and its old value <code>-2</code>.",
        },
        {
          id: "d",
          text: "<code>(-2, -Infinity, 0)</code>",
          why: "<code>sold</code> is the old <code>held</code> plus today's price. The old <code>held</code> is <code>-2</code>, not <code>-Infinity</code>, so <code>sold</code> is 2.",
        },
      ],
      answer: "a",
    },
    {
      id: "dpsm-coin-sequences-trace",
      chapter: "dsa-dp-state-machines",
      level: "intermediate",
      skill: "trace",
      pattern: "dp-state-machine",
      section: "coin-change-ii-the-loop-order-decides-what-you-count",
      kind: "single",
      prompt:
        "<p>What does the chapter's <code>countOrderedSequences(4, [1, 2])</code> return, the version with the amount in the outer loop?</p>",
      choices: [
        {
          id: "a",
          text: "6",
          why: "Six would need an extra way. The orders of <code>1+1+2</code> are three, of <code>2+2</code> one, and of four 1s one, which is 5 in all.",
        },
        {
          id: "b",
          text: "5",
          why: "The cells are <code>ways[1] = 1</code>, <code>ways[2] = ways[1] + ways[0] = 2</code>, <code>ways[3] = ways[2] + ways[1] = 3</code> and <code>ways[4] = ways[3] + ways[2] = 5</code>. The five orders are <code>1111</code>, <code>112</code>, <code>121</code>, <code>211</code> and <code>22</code>.",
        },
        {
          id: "c",
          text: "4",
          why: "The cells are <code>ways[1] = 1</code>, <code>ways[2] = 2</code>, <code>ways[3] = 3</code>. Then <code>ways[4] = ways[3] + ways[2]</code>, which is more than 4.",
        },
        {
          id: "d",
          text: "3",
          why: "Three is the number of combinations, the answer of <code>coinChangeII(4, [1, 2])</code>: <code>1+1+1+1</code>, <code>1+1+2</code> and <code>2+2</code>. The amount-outer loop counts orders too.",
        },
      ],
      answer: "b",
    },
    {
      id: "dpsm-knapsack-time",
      chapter: "dsa-dp-state-machines",
      level: "intermediate",
      skill: "complexity",
      pattern: "dp-state-machine",
      section: "0-1-knapsack-and-why-the-inner-loop-runs-backwards",
      kind: "single",
      prompt:
        "<p>The one-array 0/1 knapsack handles n items with capacity C. Which statement about its running time is correct?</p>",
      choices: [
        {
          id: "a",
          text: "O(n · C), which grows with the value of C, not with the digits used to write it.",
          why: "There are n passes of up to C steps each, so the time is O(n · C). A capacity of a billion is a short input but needs a billion cells, which is why this is called pseudo-polynomial.",
        },
        {
          id: "b",
          text: "O(2<sup>n</sup>), because every item is either taken or skipped, so the work doubles with each item.",
          why: "Take-or-skip describes the search tree. The table shares its subproblems, so each of the n · C cells is computed once, and 2<sup>n</sup> overstates the work for any input with a modest C.",
        },
        {
          id: "c",
          text: "O(n log C), because the loop halves the capacity at every step of its pass.",
          why: "Nothing is halved. Each item makes one pass over up to C cells, so the work grows with C itself.",
        },
        {
          id: "d",
          text: "O(n²), because every pair of items has to be compared with one another.",
          why: "Items are never compared with one another. Each is combined with the capacity array only.",
        },
      ],
      answer: "a",
    },
    {
      id: "dpsm-stock-k-cost",
      chapter: "dsa-dp-state-machines",
      level: "intermediate",
      skill: "complexity",
      pattern: "dp-state-machine",
      section: "at-most-two-or-at-most-k-transactions",
      kind: "single",
      prompt:
        "<p>The chapter's <code>maxProfitK(k, prices)</code> is called with 1,000 prices and <code>k = 1000000</code>. Which statement describes the work it does?</p>",
      choices: [
        {
          id: "a",
          text: "About 10<sup>9</sup> steps, because it loops over k counts for each of the n days.",
          why: "That is the cost without the early check. A transaction needs two days, so with <code>k &gt;= floor(n / 2)</code> the limit cannot bind, and the function returns before it builds any array of size k.",
        },
        {
          id: "b",
          text: "O(k) space, because the held and free arrays each have k + 1 cells.",
          why: "Those arrays are built only when <code>k &lt; floor(n / 2)</code>. For this call the function returns first, so no array of that size exists.",
        },
        {
          id: "c",
          text: "O(n) time and O(1) space, since <code>k &gt;= floor(n / 2)</code> sends it to the unlimited machine.",
          why: "At most 500 transactions can ever help with 1,000 days. The early check hands the work to the two-variable unlimited version, which makes one pass over the prices and keeps two numbers.",
        },
        {
          id: "d",
          text: "O(n · log k), because the counts are processed in halves for every price.",
          why: "The counts are never halved. Either the cap sends the call to a single pass, or every count from 1 to k is visited for each price.",
        },
      ],
      answer: "c",
    },
    {
      id: "dpsm-last-stone-plan",
      chapter: "dsa-dp-state-machines",
      level: "intermediate",
      skill: "recognise",
      pattern: "dp-state-machine",
      section: "last-stone-weight-ii-a-partition-problem-in-disguise",
      kind: "single",
      prompt:
        "<p>Stones have positive weights. You may smash <b>any two</b>: equal stones both vanish, otherwise the heavier loses the lighter's weight. You want the smallest possible weight of the last stone. Which plan finds it?</p>",
      choices: [
        {
          id: "a",
          text: "Always smash the two heaviest stones with a max-heap, as in the heap version of the problem.",
          why: "Choosing greedily can miss the best result. On <code>[3, 3, 2, 2, 2]</code> it ends with a stone of 2, while a smarter order reaches 0.",
        },
        {
          id: "b",
          text: "Split into two groups with the smallest gap between their sums: a subset sum up to half the total.",
          why: "Every stone ends up added or subtracted exactly once, so the last weight is at least the smallest gap between two groups, and an order of smashes reaches that gap. The answer is <code>total - 2s</code> for the largest reachable <code>s</code> at most <code>total / 2</code>.",
        },
        {
          id: "c",
          text: "Always smash the two lightest stones with a min-heap, so the small stones vanish first.",
          why: "This is also beaten on <code>[3, 3, 2, 2, 2]</code>: smashing 2 with 2, then 2 with 3, then 1 with 3 ends at 2, while 0 is reachable.",
        },
        {
          id: "d",
          text: "Sort the stones and smash neighbours in pairs, repeating until only one stone is left.",
          why: "Neighbours in sorted order are not always the right pair. On <code>[3, 3, 2, 2, 2]</code>, pairing 2 with 2 and 2 with 3 leaves 1 and 3, which smash to 2, while 0 is reachable.",
        },
      ],
      answer: "b",
    },
    {
      id: "dpsm-cooldown-leak",
      chapter: "dsa-dp-state-machines",
      level: "intermediate",
      skill: "edge-case",
      pattern: "dp-state-machine",
      section: "a-cooldown-day-after-each-sale-a-third-mode",
      kind: "single",
      prompt:
        "<p>A developer writes the cooldown update as three separate statements: <code>held = Math.max(held, rest - p);</code> then <code>sold = held + p;</code> then <code>rest = Math.max(rest, sold);</code>. The starting values are the same as in the chapter. What does the function return for prices <code>[0, 1, 0, 1]</code>, and what is the right answer?</p>",
      choices: [
        {
          id: "a",
          text: "It returns 1, the right answer, because the order of the three statements makes no difference here.",
          why: "The order does matter. The second statement now sees today's <code>held</code> instead of yesterday's, so it can sell a share on the day it was bought and the cooldown mode no longer means what it should.",
        },
        {
          id: "b",
          text: "It returns 0, but the right answer is 1.",
          why: "The leak adds moves and removes none, so it cannot make the profit smaller. Buying at the first 0 and selling at the next 1 already gives 1, so the function cannot return less than that.",
        },
        {
          id: "c",
          text: "It returns 3, but the right answer is 2.",
          why: "No plan, legal or not, can earn more than the sum of the rises, which is 2 here (0 to 1 twice). And the legal answer with the cooldown is 1.",
        },
        {
          id: "d",
          text: "It returns 2, but the right answer is 1.",
          why: "The leaked update lets <code>rest</code> pick up a sale made today, so a share sold on the second day can be bought again on the third, which the cooldown forbids. With the rule, buying on day 3 is blocked after selling on day 2, so only 1 is possible.",
        },
      ],
      answer: "d",
    },
    {
      id: "dpsm-target-sum-zero-calls",
      chapter: "dsa-dp-state-machines",
      level: "intermediate",
      skill: "edge-case",
      pattern: "dp-state-machine",
      section: "target-sum-signs-become-a-subset-count",
      kind: "multi",
      prompt:
        "<p>The chapter's <code>findTargetSumWays</code> returns 0 before it builds any array when <code>|target| &gt; total</code> or <code>total + target</code> is odd. Select every call that returns 0 by one of those two checks.</p>",
      choices: [
        {
          id: "a",
          text: "<code>findTargetSumWays([1, 2, 3], 7)</code>",
          why: "The total is 6 and the target is 7, so no choice of signs can reach it. The first check returns 0.",
        },
        {
          id: "b",
          text: "<code>findTargetSumWays([1, 2, 3], 6)</code>",
          why: "Here <code>(6 + 6) / 2 = 6</code>, so the plus group must sum to 6. That is all three numbers, so there is exactly one way, <code>+1 +2 +3</code>.",
        },
        {
          id: "c",
          text: "<code>findTargetSumWays([1, 2, 3], 1)</code>",
          why: "The total plus the target is 7, which is odd, so the plus group would have to sum to 3.5. The parity check returns 0.",
        },
        {
          id: "d",
          text: "<code>findTargetSumWays([1, 2, 3], 2)</code>",
          why: "Here <code>(6 + 2) / 2 = 4</code>, and the subset <code>{1, 3}</code> sums to 4. So there is one way, <code>+1 -2 +3</code>.",
        },
        {
          id: "e",
          text: "<code>findTargetSumWays([1, 2, 3], -6)</code>",
          why: "Here <code>(6 - 6) / 2 = 0</code>, and the empty plus group sums to 0. So there is one way, <code>-1 -2 -3</code>, and neither check applies.",
        },
      ],
      answers: ["a", "c"],
    },
    {
      id: "dpsm-order-knapsack",
      chapter: "dsa-dp-state-machines",
      level: "intermediate",
      skill: "trace",
      pattern: "dp-state-machine",
      section: "0-1-knapsack-and-why-the-inner-loop-runs-backwards",
      kind: "order",
      prompt:
        "<p>Put the steps of the one-array 0/1 knapsack in order, from the first step to the last step of one item's pass.</p>",
      items: [
        {
          id: "init",
          text: "Create <code>best</code> with one zero for each capacity from 0 to <code>capacity</code>.",
        },
        {
          id: "item",
          text: "Take the next item, with its weight and value.",
        },
        {
          id: "start",
          text: "For that item, set <code>w</code> to <code>capacity</code>.",
        },
        {
          id: "compare",
          text: "At this <code>w</code>, set <code>best[w]</code> to the larger of its current value and <code>best[w - weight] + value</code>.",
        },
        {
          id: "down",
          text: "Lower <code>w</code> by one and repeat the comparison until <code>w</code> is below the weight.",
        },
      ],
      why: "The array is created once, before any item. Each item then gets its own pass. The pass starts at the top capacity so that every cell read lies below the cell being written and still holds the previous item's value. The comparison happens at each capacity, and the pass moves downwards until the item no longer fits.",
    },
  ],
  pattern: {
    pattern: "dp-state-machine",
    chapter: "dsa-dp-state-machines",
    signals: [
      "A rule about the previous step, such as no two neighbours or one rest day after a sale, so the state must remember the last move.",
      "Buying and selling over days, with a fee, a cooldown or a limit on transactions.",
      "Items used once or many times against a budget, or a target reached by choosing from a list.",
      "A split into two groups with equal or smallest-difference sums, or a plus or minus placed on every number.",
    ],
    template: "<pre><code>[held, free] = [Math.max(held, free - p), Math.max(free, held + p)];</code></pre>",
    time: "O(n) for the stock and paint problems, O(n · C) for the knapsack family",
    space: "O(1) for the machines, O(C) for the rolling array",
    styles: ["online-assessment", "phone-screen", "onsite"],
  },
};
