import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "gp-pile-pattern",
      chapter: "dsa-games-probability-dp",
      level: "advanced",
      skill: "recognise",
      pattern: "game-dp",
      section: "win-and-lose-derived-a-position-is-winning-exactly-when-some",
      placement: true,
      kind: "single",
      prompt:
        "<p>Two players alternate removing 1, 3 or 4 stones from a pile of <code>n</code> stones, where <code>n</code> can be 10<sup>9</sup>. The player who cannot move loses. You are asked whether the first player wins. Which plan is the most reliable?</p>",
      choices: [
        {
          id: "a",
          text: "Memoize a recursion over the number of stones left, because that number alone decides a position and the table then fills itself.",
          why: "The key is complete, but a billion distinct positions are far too many to compute or store one by one. The memo is the right tool for small piles, not for this one.",
        },
        {
          id: "b",
          text: "Tabulate the first few dozen sizes, read the repeating pattern, and prove it from the rules.",
          why: "A size is winning exactly when some move reaches a losing size, so each verdict depends only on smaller sizes and a short table is cheap. For the moves 1, 3 and 4 the losing sizes are 0, 2, 7, 9, 14, 16, ..., repeating every 7, and the proof (every move from a losing size lands on a winning one, and every winning size has a move onto a losing one) turns that pattern into a constant-time answer.",
        },
        {
          id: "c",
          text: "Always take as many stones as the rules allow, because that shrinks the pile fastest and leaves the opponent the least.",
          why: "Taking the most is not a winning rule. From 5 stones, taking 4 leaves 1 and the opponent takes it and wins, while taking 3 leaves 2, a losing size for the opponent.",
        },
        {
          id: "d",
          text: "Run a breadth-first search from n down to 0 and report whether the pile size 0 is reached at the end.",
          why: "Reaching 0 says nothing about which player makes the last move, since the two players choose different moves. A search over a billion sizes would also be far too slow.",
        },
      ],
      answer: "b",
    },
    {
      id: "gp-lead-state",
      chapter: "dsa-games-probability-dp",
      level: "advanced",
      skill: "recognise",
      pattern: "game-dp",
      section: "score-games-maximize-your-lead-not-your-total",
      placement: true,
      kind: "single",
      prompt:
        "<p>A row of numbers is given. Two players alternate, and each takes the number at either end of the row. Both want the larger total, and you must say whether the first player can win. For an interval <code>(i, j)</code> of the row, which table is the right one to fill?</p>",
      choices: [
        {
          id: "a",
          text: "<code>best(i, j) = max(nums[i] + best(i + 1, j), nums[j] + best(i, j - 1))</code>, the largest total the player to move can collect.",
          why: "This lets the same player move again on the rest of the row, as if the opponent had passed. The opponent moves next and takes numbers for themselves, so the totals it produces are too high.",
        },
        {
          id: "b",
          text: "The sum of the numbers at even positions compared with the sum at odd positions, since the two players alternate turns.",
          why: "For a row of even length the first player can force whichever of those two sums is larger, which settles that special case. For other lengths the first player cannot choose the parity, so the comparison does not decide the game.",
        },
        {
          id: "c",
          text: "Sort the numbers and let the players alternate taking the largest remaining one.",
          why: "A player may only take an end of the row, not any number they like, so sorting throws away the restriction that defines the game.",
        },
        {
          id: "d",
          text: "<code>lead(i, j) = max(nums[i] - lead(i + 1, j), nums[j] - lead(i, j - 1))</code>, the best score difference.",
          why: "After taking one end the opponent becomes the mover on the rest, and the lead they can reach there is exactly the amount subtracted from yours. The two leads are negatives of each other because every number goes to one player, so no separate minimum is needed.",
        },
      ],
      answer: "d",
    },
    {
      id: "gp-probability-family",
      chapter: "dsa-games-probability-dp",
      level: "advanced",
      skill: "recognise",
      pattern: "game-dp",
      section: "probability-dp-push-the-probability-forward-one-step-at-a-ti",
      placement: true,
      kind: "single",
      prompt:
        "<p>A knight moves on a chessboard, choosing one of its 8 moves uniformly at random each time, and once it steps off the board it stays off. You need the probability that it is still on the board after exactly <code>k</code> moves. Which approach fits?</p>",
      choices: [
        {
          id: "a",
          text: "Push the probability forward one move at a time, dropping the part that leaves the board.",
          why: "Each layer holds the probability of being on every cell without having left, and merging all the move sequences that reach a cell into one number keeps the work to k layers. The answer is the sum of the last layer.",
        },
        {
          id: "b",
          text: "Minimax: assume the knight always picks the move that keeps it on the board for the longest time.",
          why: "Minimax models a player who chooses. Here the moves are random, so the question is an average over the moves, not a best or worst case.",
        },
        {
          id: "c",
          text: "Enumerate all 8<sup>k</sup> move sequences one by one and count those that stay on the board.",
          why: "This gives the right answer and is a good check on tiny boards, but for k up to 100 the number of sequences is out of reach. Merging sequences that reach the same cell is what avoids it.",
        },
        {
          id: "d",
          text: "Compute the expected number of moves before the knight leaves, and divide that number by k.",
          why: "The expected number of moves is a different quantity from the probability of surviving k moves, and dividing one by the other does not turn it into the other.",
        },
      ],
      answer: "a",
    },
    {
      id: "gp-memo-key",
      chapter: "dsa-games-probability-dp",
      level: "advanced",
      skill: "edge-case",
      pattern: "game-dp",
      section: "the-memo-key-everything-the-future-depends-on-nothing-else",
      kind: "single",
      prompt:
        "<p>A student memoizes Can I Win with a <code>Map</code> keyed on the <b>remaining total</b> alone, without the set of used numbers. It runs fast and passes the examples. What is wrong with it?</p>",
      choices: [
        {
          id: "a",
          text: "A <code>Map</code> cannot hold boolean values, so every verdict that is stored is lost as soon as it is written.",
          why: "A <code>Map</code> stores any value, including booleans. The fault is in the key, not in the container.",
        },
        {
          id: "b",
          text: "The remaining total is always larger than every unused number, so a key is never found again after it is stored.",
          why: "Totals shrink as numbers are picked and often repeat, so keys are found again often. That reuse is what causes the damage.",
        },
        {
          id: "c",
          text: "Different positions can share a remaining total, so a cached verdict can be wrong for a later arrival.",
          why: "The numbers 1 and 4 used, or 2 and 3 used, both leave the same remaining total, but the first leaves {2, 3, ...} and the second leaves {1, 4, ...}. Those positions have different futures, so the key is too small.",
        },
        {
          id: "d",
          text: "Nothing, because the used set is determined by the remaining total, so the key is already complete.",
          why: "It is the other way round: the used set determines the total. {1, 4} and {2, 3} have the same sum but leave different numbers to pick from.",
        },
      ],
      answer: "c",
    },
    {
      id: "gp-sentinel",
      chapter: "dsa-games-probability-dp",
      level: "advanced",
      skill: "edge-case",
      pattern: "game-dp",
      section: "bitmask-games-can-i-win-and-why-its-guards-matter",
      kind: "single",
      prompt:
        "<p>In <code>canIWin</code>, the line <code>if ((maxChoosable * (maxChoosable + 1)) / 2 &lt; desiredTotal) return false</code> runs before the search. What goes wrong if it is deleted?</p>",
      choices: [
        {
          id: "a",
          text: "Nothing but speed, because the search would also return false for those inputs without the guard.",
          why: "Without the line the search often returns true for them. The recursion reads running out of numbers as a loss for the player to move, so it credits a win to the other player, who cannot reach the target either.",
        },
        {
          id: "b",
          text: 'It reports wins for games nobody can win, reading "the opponent cannot win" as "I win".',
          why: "If even all the numbers together fall short, the game ends with no winner. The win/lose recursion assumes every play has a winner, so the guard is what makes that assumption true.",
        },
        {
          id: "c",
          text: "The bitmask overflows, because the running total can exceed 2<sup>53</sup> for large inputs.",
          why: "The mask only has one bit per number, at most 20 of them, and the total is never stored in it. Overflow is not involved.",
        },
        {
          id: "d",
          text: "The memo is keyed on the wrong value for those inputs, so verdicts are mixed up between positions.",
          why: "The key is the mask of used numbers for every input. The problem is the base case of the game, not the key.",
        },
      ],
      answer: "b",
    },
    {
      id: "gp-lead-trace",
      chapter: "dsa-games-probability-dp",
      level: "advanced",
      skill: "trace",
      pattern: "game-dp",
      section: "score-games-maximize-your-lead-not-your-total",
      kind: "single",
      prompt: "<p>The chapter's <code>bestLead</code> is called on <code>[3, 9, 1, 2]</code>. What does it return?</p>",
      choices: [
        {
          id: "a",
          text: "<code>7</code>",
          why: "Taking the 2 on the right gives 2 - lead[0][2], and lead[0][2] for [3, 9, 1] is -5, so the option is 7. Taking the 3 on the left gives only -5, so 7 is the maximum.",
        },
        {
          id: "b",
          text: "<code>8</code>",
          why: "8 is lead[1][3], the best lead on [9, 1, 2] alone, as if the 3 were already gone. The whole row has a different value.",
        },
        {
          id: "c",
          text: "<code>-5</code>",
          why: "-5 is the value of taking the 3 first, 3 - lead[1][3] = 3 - 8. It is one of the two options, but the mover prefers the other.",
        },
        {
          id: "d",
          text: "<code>6</code>",
          why: "6 is lead[0][1] for [3, 9] alone, which is just the difference of the two numbers.",
        },
      ],
      answer: "a",
    },
    {
      id: "gp-nim-move",
      chapter: "dsa-games-probability-dp",
      level: "advanced",
      skill: "trace",
      pattern: "game-dp",
      section: "nim-and-the-xor-rule-with-a-proof",
      kind: "single",
      prompt:
        "<p>The heaps are <code>[3, 4, 5]</code> and it is your move in ordinary Nim (the player who cannot move loses). Exactly one single move leaves the opponent in a losing position. Which one?</p>",
      choices: [
        {
          id: "a",
          text: "Remove 1 stone from the heap of 4, leaving the heaps 3, 3 and 5.",
          why: "3 ^ 3 ^ 5 is 5, which is not 0, so the opponent is still the one in a winning position.",
        },
        {
          id: "b",
          text: "Remove 1 stone from the heap of 5, leaving the heaps 3, 4 and 4.",
          why: "3 ^ 4 ^ 4 is 3, not 0, so this does not hand the opponent a losing position.",
        },
        {
          id: "c",
          text: "Remove 3 stones from the heap of 5, leaving the heaps 3, 4 and 2.",
          why: "3 ^ 4 ^ 2 is 5, not 0.",
        },
        {
          id: "d",
          text: "Remove 2 stones from the heap of 3.",
          why: "The XOR of 3, 4 and 5 is 2, and only the heap of 3 can be reduced to 3 ^ 2 = 1. Then 1 ^ 4 ^ 5 is 0, and the opponent is in a losing position.",
        },
      ],
      answer: "d",
    },
    {
      id: "gp-complexity-mask",
      chapter: "dsa-games-probability-dp",
      level: "advanced",
      skill: "complexity",
      pattern: "game-dp",
      section: "bitmask-games-can-i-win-and-why-its-guards-matter",
      kind: "single",
      prompt:
        "<p><code>canIWin(m, T)</code> memoizes on the mask of used numbers, and each mask tries at most <code>m</code> numbers. Which is the tightest bound that follows from solving each mask at most once?</p>",
      choices: [
        {
          id: "a",
          text: "O(m!), because every order of picking the numbers is a different play",
          why: "m! is the size of the tree without a memo. It is a true upper bound but a loose one, since the memo merges every order that uses the same set of numbers.",
        },
        {
          id: "b",
          text: "O(T · m), because the state is the remaining total and T bounds it",
          why: "The remaining total is not the state, as the memo-key discussion shows, and T does not bound the number of positions. The used set does.",
        },
        {
          id: "c",
          text: "O(2<sup>m</sup> · m): at most 2<sup>m</sup> masks, m tries each",
          why: "There are at most 2<sup>m</sup> subsets of the m numbers, each is solved at most once, and each solve loops over at most m candidates.",
        },
        {
          id: "d",
          text: "O(2<sup>m</sup>), because each mask is solved once and nothing else costs",
          why: "Each solve also loops over up to m numbers, and a bound that drops that factor is smaller than what the argument supports.",
        },
      ],
      answer: "c",
    },
    {
      id: "gp-complexity-knight",
      chapter: "dsa-games-probability-dp",
      level: "advanced",
      skill: "complexity",
      pattern: "game-dp",
      section: "probability-dp-push-the-probability-forward-one-step-at-a-ti",
      kind: "single",
      prompt:
        "<p><code>knightProbability(n, k, row, column)</code> builds one layer per move on an <code>n × n</code> board and tries 8 moves from each cell. What is its time complexity?</p>",
      choices: [
        {
          id: "a",
          text: "O(k · n<sup>2</sup>)",
          why: "There are k layers, each layer visits n<sup>2</sup> cells and tries a constant 8 moves from each. Move sequences that reach the same cell are added into one number, which is why it is not exponential in k.",
        },
        {
          id: "b",
          text: "O(8<sup>k</sup>), one step for each move sequence",
          why: "That is the number of move sequences, which the layer table never enumerates one by one.",
        },
        {
          id: "c",
          text: "O(n<sup>2</sup>)",
          why: "Every one of the k layers has to be built, one after another, because each depends on the one before it.",
        },
        {
          id: "d",
          text: "O(k · n<sup>4</sup>)",
          why: "A cell receives probability from at most 8 other cells, not from all n<sup>2</sup> of them, so a cell is not combined with every other cell.",
        },
      ],
      answer: "a",
    },
    {
      id: "gp-soup-cutoff",
      chapter: "dsa-games-probability-dp",
      level: "advanced",
      skill: "edge-case",
      pattern: "game-dp",
      section: "soup-servings-a-cutoff-that-is-justified-by-the-numbers",
      kind: "single",
      prompt:
        "<p>A Soup Servings solution returns 1 straight away when <code>n &gt;= 4800</code>, and the checker accepts an error of 1e-5. Why is the cutoff acceptable?</p>",
      choices: [
        {
          id: "a",
          text: "Because the memo table is only valid for volumes below 4800 ml, and larger ones need a different method.",
          why: "The table is valid for any volume. It is just too big to fill for huge volumes, and the cutoff is justified by the closeness of the answer to 1.",
        },
        {
          id: "b",
          text: "A is served faster on average, so the answer climbs towards 1, and at 4800 ml it is within about 5e-6 of it.",
          why: "A loses 62.5 ml per turn on average against 37.5 ml for B. Measured values show the gap to 1 shrinking, and at 4800 ml it is below the allowed 1e-5.",
        },
        {
          id: "c",
          text: "Because soup A always empties first once n is at least 4800, so the probability is exactly 1.",
          why: "A is only very likely to empty first. A run of servings that favour B has a positive probability for every n, so the exact answer is always slightly below 1.",
        },
        {
          id: "d",
          text: "Because JavaScript cannot allocate a table with more than 192 rows or columns.",
          why: "JavaScript arrays can be far larger than 192 rows. The reason is accuracy, not memory.",
        },
      ],
      answer: "b",
    },
    {
      id: "gp-float-mod",
      chapter: "dsa-games-probability-dp",
      level: "advanced",
      skill: "edge-case",
      pattern: "game-dp",
      section: "floating-point-exact-fractions-and-answers-modulo-a-prime",
      kind: "single",
      prompt:
        "<p>In JavaScript, <code>1000000006 * 1000000006 % 1000000007</code> evaluates to <code>999999972</code>, but the true value is 1. What explains it and what is the fix?</p>",
      choices: [
        {
          id: "a",
          text: "The <code>%</code> operator is inexact for numbers above 10<sup>9</sup>, so replace it with a <code>Math.floor</code> division.",
          why: "The remainder is computed exactly from the value it receives. The damage happened earlier, in the product, and a division of that rounded product would be affected in the same way.",
        },
        {
          id: "b",
          text: "1000000007 is not prime, so the remainder by it is not well defined for products of this size.",
          why: "1000000007 is prime, and a remainder by any positive number is well defined. The problem is the size of the product.",
        },
        {
          id: "c",
          text: "Numbers above 2<sup>31</sup> wrap around in JavaScript, as they do in a 32-bit integer type.",
          why: "JavaScript numbers are 64-bit doubles and do not wrap at 2<sup>31</sup>. Only the bit operators such as <code>|</code> and <code>&gt;&gt;</code> convert to 32 bits.",
        },
        {
          id: "d",
          text: "The product exceeds 2<sup>53</sup>, so it is rounded before <code>%</code> runs; use <code>BigInt</code>.",
          why: "A double holds integers exactly only up to 2<sup>53</sup>. The product is rounded first, so the remainder of the rounded value is wrong; the same product in <code>BigInt</code> is exact, and <code>Number(...)</code> converts the small remainder back.",
        },
      ],
      answer: "d",
    },
    {
      id: "gp-assumptions",
      chapter: "dsa-games-probability-dp",
      level: "advanced",
      skill: "edge-case",
      pattern: "game-dp",
      section: "win-and-lose-derived-a-position-is-winning-exactly-when-some",
      kind: "multi",
      prompt:
        '<p>The proof that "a position is winning exactly when some move leads to a losing position" is an induction. Select every assumption it relies on.</p>',
      choices: [
        {
          id: "a",
          text: "Every play of the game ends after a finite number of moves.",
          why: "The induction runs on the length of the longest play from a position, which has to exist.",
        },
        {
          id: "b",
          text: "Every finished play has a winner, so there are no draws.",
          why: "The third case concludes that the mover loses because the opponent wins after every move, which needs a winner to exist.",
        },
        {
          id: "c",
          text: "The pile or board is small enough to store a verdict for every position.",
          why: "That decides whether a DP is affordable, not whether the statement is true. It holds for a pile of a billion stones as well.",
        },
        {
          id: "d",
          text: "Every move removes the same number of stones.",
          why: "Moves may differ, as with 1, 3 or 4 stones. The argument only uses which positions are reachable.",
        },
        {
          id: "e",
          text: "The two players alternate and both see the same position and rules.",
          why: "Strategies are defined on positions, and the argument compares what each player can do from the same position, one move at a time.",
        },
      ],
      answers: ["a", "b", "e"],
    },
    {
      id: "gp-order-pile",
      chapter: "dsa-games-probability-dp",
      level: "advanced",
      skill: "trace",
      pattern: "game-dp",
      section: "win-and-lose-derived-a-position-is-winning-exactly-when-some",
      kind: "order",
      prompt:
        '<p>A pile game has a huge pile and the moves are "take one of a few allowed numbers". Put the steps of the approach in the order you would do them, starting with the rules and ending with the final function.</p>',
      items: [
        {
          id: "rules",
          text: "Write the rules as a recursion: a size is winning if some move leads to a losing size, and size 0 is losing.",
        },
        {
          id: "table",
          text: "Print the verdicts for the first thirty or forty sizes.",
        },
        {
          id: "read",
          text: "Read the losing sizes and their period off the table.",
        },
        {
          id: "prove",
          text: "Prove the pattern: from a losing size every move reaches a winning one, and from a winning size some move reaches a losing one.",
        },
        {
          id: "code",
          text: "Write the constant-time test and compare it with the table.",
        },
      ],
      why: "The table needs the recursion, a pattern needs the table to look at, and a proof needs a pattern to prove. The constant-time function is written last, from the proven pattern, and checked against the table so that a slip in the pattern or in the proof is caught.",
    },
  ],
  pattern: {
    pattern: "game-dp",
    chapter: "dsa-games-probability-dp",
    signals: [
      "Two players alternate and both play optimally, and the question is who wins or by how much.",
      "The question asks for an expected value or a probability after random steps or draws.",
      "A pile or board is far too big to tabulate, but the rules are simple enough to find a pattern in the first few values.",
      "A position is the set of remaining items or the string itself, and the memo key must hold everything that decides the future.",
    ],
    template: "<pre><code>lead[i][j] = Math.max(piles[i] - lead[i + 1][j], piles[j] - lead[i][j - 1]);</code></pre>",
    time: "positions times moves per position",
    space: "one value per position",
    styles: ["online-assessment", "phone-screen", "onsite"],
  },
};
