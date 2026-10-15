import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "rs-list-random-node",
      chapter: "dsa-randomization-sampling",
      level: "intermediate",
      skill: "recognise",
      pattern: "randomization",
      section: "reservoir-sampling-one-item-from-a-stream-of-unknown-length",
      placement: true,
      kind: "single",
      prompt:
        "<p>You hold the head of a singly linked list whose length is not stored. Return the value of a uniformly random node, reading the list once and using O(1) extra memory. Which plan does that?</p>",
      choices: [
        {
          id: "a",
          text: "Copy every value into an array, then return <code>arr[Math.floor(Math.random() * arr.length)]</code>.",
          why: "Every node is equally likely, but the array costs O(n) memory, which the problem rules out. It is the right answer when memory is free.",
        },
        {
          id: "b",
          text: "Keep one candidate while walking, and let the i-th node replace it with probability 1/i.",
          why: "By induction, after i nodes each one is the candidate with probability 1/i: an older node survives with (1/i) * (i/(i + 1)) = 1/(i + 1). It needs one pass and one stored value.",
        },
        {
          id: "c",
          text: "Draw a number of steps from 0 to 9, and return the node that far from the head.",
          why: "Nodes more than nine steps from the head can never be returned, so the choice is not uniform on a long list.",
        },
        {
          id: "d",
          text: "At every node, replace the candidate with probability 1/2.",
          why: "The last node would win with probability 1/2, the one before it with 1/4, and so on, so the picks pile up at the end of the list.",
        },
      ],
      answer: "b",
    },
    {
      id: "rs-weights-recognise",
      chapter: "dsa-randomization-sampling",
      level: "intermediate",
      skill: "recognise",
      pattern: "randomization",
      section: "weighted-random-pick-prefix-sums-and-binary-search",
      placement: true,
      kind: "single",
      prompt:
        "<p>An array <code>w</code> holds n positive integer weights, and <code>pickIndex()</code> must return index i with probability <code>w[i] / sum(w)</code>. It will be called many times, and the weights can be large. Which plan is the standard one?</p>",
      choices: [
        {
          id: "a",
          text: "Build an array that repeats each index <code>w[i]</code> times, then pick from it uniformly.",
          why: "The probabilities are right, but the array has <code>sum(w)</code> entries, which can be far too many to store when the weights are large.",
        },
        {
          id: "b",
          text: "Draw a real number r in [0, 1) and return the first index whose weight is greater than r.",
          why: "Every weight is at least 1, which is greater than any r below 1, so this returns index 0 every time.",
        },
        {
          id: "c",
          text: "Take prefix sums, draw a whole number below the total, binary search the first prefix above it.",
          why: "Index i owns a segment of the line from 0 to the total whose length is <code>w[i]</code>, so a uniform whole number lands in it with the right probability. The search takes O(log n).",
        },
        {
          id: "d",
          text: "Pick an index uniformly at random and return it, giving each index the same chance whatever its weight.",
          why: "That ignores the weights. Every index gets probability 1/n, whatever <code>w</code> holds.",
        },
      ],
      answer: "c",
    },
    {
      id: "rs-shuffle-recognise",
      chapter: "dsa-randomization-sampling",
      level: "intermediate",
      skill: "recognise",
      pattern: "randomization",
      section: "fisher-yates-and-the-proof-that-every-order-is-equally-likel",
      placement: true,
      kind: "single",
      prompt:
        "<p>Rearrange an array of n items so that every one of the n! orders is equally likely, in O(n) time. Which approach fits?</p>",
      choices: [
        {
          id: "a",
          text: "Walk from the last index down to 1, swapping each position with a random one from 0 up to itself.",
          why: "This is Fisher-Yates. The n! sequences of choices map one-to-one onto the n! orders, so each order has probability 1/n!. It does n - 1 draws and swaps.",
        },
        {
          id: "b",
          text: "Call <code>arr.sort(() =&gt; Math.random() - 0.5)</code>.",
          why: "The comparator is inconsistent, so the order is left to the implementation, and with coin-flip comparisons the order probabilities cannot be 1/n!. It also takes O(n log n).",
        },
        {
          id: "c",
          text: "Swap every position with a random position anywhere in the array.",
          why: "That makes n to the power n equally likely sequences, and n! does not divide n to the power n once n is 3 or more, so some orders are more likely than others.",
        },
        {
          id: "d",
          text: "Repeatedly pick a random element of a copy, append it to the result, and <code>splice</code> it out of the copy.",
          why: "The distribution is uniform, but each <code>splice</code> shifts the remaining elements, which makes the whole thing O(n squared).",
        },
      ],
      answer: "a",
    },
    {
      id: "rs-comparator-shuffle",
      chapter: "dsa-randomization-sampling",
      level: "intermediate",
      skill: "edge-case",
      pattern: "randomization",
      section: "why-sort-math-random-0-5-is-biased-measured",
      kind: "single",
      prompt:
        "<p>A tutorial shuffles an array with <code>arr.sort(() =&gt; Math.random() - 0.5)</code>. What is wrong with it?</p>",
      choices: [
        {
          id: "a",
          text: "The comparator is always negative, so the array simply ends up reversed once the sort has finished.",
          why: "<code>Math.random() - 0.5</code> is negative for about half of the draws and positive for the rest, so it is not constant in sign.",
        },
        {
          id: "b",
          text: "The array method <code>sort</code> only accepts numbers, so strings and objects cannot be shuffled this way at all.",
          why: "<code>sort</code> accepts any elements when it is given a comparator. The comparator here does not even look at them.",
        },
        {
          id: "c",
          text: "The shuffle is uniform, but it takes O(n log n) time where Fisher-Yates takes O(n), with one swap per step.",
          why: "It is slower, but the larger problem is the distribution: on three elements the original order came out about 37% of the time in a measured run, against 1/6 for a fair shuffle.",
        },
        {
          id: "d",
          text: "The comparator is inconsistent, so the order is implementation-defined, and coin-flip comparisons cannot give every order 1/n!.",
          why: "Such a sort gives each order a probability that is a whole number over a power of two, and 1/n! is not of that form when n! has the factor 3.",
        },
      ],
      answer: "d",
    },
    {
      id: "rs-trace-fisher-yates",
      chapter: "dsa-randomization-sampling",
      level: "intermediate",
      skill: "trace",
      pattern: "randomization",
      section: "fisher-yates-and-the-proof-that-every-order-is-equally-likel",
      kind: "single",
      prompt:
        '<p>Fisher-Yates runs from the back on <code>["A", "B", "C", "D"]</code>. For i = 3, 2, 1 the generator returns 0.2, 0.7, 0.9, and each step uses <code>j = Math.floor(draw * (i + 1))</code> and swaps positions i and j. What is the result?</p>',
      choices: [
        {
          id: "a",
          text: "<code>D B C A</code>",
          why: "i = 3 gives j = 0, so A and D swap. i = 2 gives j = 2 and i = 1 gives j = 1, which swap a position with itself, so only the first swap moves anything.",
        },
        {
          id: "b",
          text: "<code>C D B A</code>",
          why: "That is what you get when the draw is scaled by i instead of i + 1. It sends j to 0, 1, 0, and it can never leave a position unchanged.",
        },
        {
          id: "c",
          text: "<code>D A C B</code>",
          why: "That is the result of scaling every draw by the array length 4, so that j can come from the whole array, as the naive shuffle does.",
        },
        {
          id: "d",
          text: "<code>A D B C</code>",
          why: "That is the result of the forward variant, which fills positions from the front, run on the same three draws. It is a valid shuffle, but a different sequence of swaps.",
        },
      ],
      answer: "a",
    },
    {
      id: "rs-shuffle-j-range",
      chapter: "dsa-randomization-sampling",
      level: "intermediate",
      skill: "edge-case",
      pattern: "randomization",
      section: "fisher-yates-and-the-proof-that-every-order-is-equally-likel",
      kind: "single",
      prompt:
        "<p>A shuffle loop runs <code>for (let i = n - 1; i &gt; 0; i--)</code> but draws <code>j = Math.floor(rng() * i)</code>, not <code>* (i + 1)</code>. For n = 4, how many of the 24 orders can it produce?</p>",
      choices: [
        {
          id: "a",
          text: "All 24, each with probability 1/24, as in a correct shuffle.",
          why: "With j below i, a step never leaves position i holding its own element, so only 6 of the 24 orders can come out, all of them single cycles. Twenty-four would need j to be able to equal i.",
        },
        {
          id: "b",
          text: "12, the even permutations, half of all the orders.",
          why: "The loop's outputs are all single 4-cycles, and a 4-cycle is an odd permutation, so the count does not follow the even permutations.",
        },
        {
          id: "c",
          text: "6, one per choice sequence, all single cycles.",
          why: "There are 3 * 2 * 1 = 6 choice sequences, and different sequences give different arrays. This is Sattolo's algorithm, which is uniform over single cycles and correct only for that purpose.",
        },
        {
          id: "d",
          text: "Exactly 1, because the draw is always below i, so nothing varies.",
          why: "The draw is below i but not constant: it takes i different values, so different draws lead to different arrays.",
        },
      ],
      answer: "c",
    },
    {
      id: "rs-reservoir-survival",
      chapter: "dsa-randomization-sampling",
      level: "intermediate",
      skill: "trace",
      pattern: "randomization",
      section: "reservoir-sampling-one-item-from-a-stream-of-unknown-length",
      kind: "single",
      prompt:
        "<p>Reservoir sampling with a reservoir of one runs on four items A, B, C, D, and the i-th item replaces the candidate with probability 1/i. What is the probability that A is the final answer?</p>",
      choices: [
        {
          id: "a",
          text: "1/2, because A was the first item and nothing replaced it for one step.",
          why: "1/2 is the chance A is still the candidate after item 2, not after item 4. Items 3 and 4 get their own chances to replace it.",
        },
        {
          id: "b",
          text: "1/8, because each of the three later items would replace A with probability 1/2, and 1/2 cubed is 1/8.",
          why: "The later items replace with probabilities 1/3 and 1/4, not 1/2. Using 1/2 every time is a different procedure that favours the last items.",
        },
        {
          id: "c",
          text: "1, because the first item is always accepted.",
          why: "The first item is accepted, but it can be replaced later. Being accepted at the start is not the same as being the final answer.",
        },
        {
          id: "d",
          text: "1/4, the product (1/2) * (2/3) * (3/4) of A surviving items 2, 3 and 4.",
          why: "The product (1/2) * (2/3) * (3/4) telescopes to 1/4, which equals the chance for B, C and D, so all four are equally likely.",
        },
      ],
      answer: "d",
    },
    {
      id: "rs-weighted-cost",
      chapter: "dsa-randomization-sampling",
      level: "intermediate",
      skill: "complexity",
      pattern: "randomization",
      section: "weighted-random-pick-prefix-sums-and-binary-search",
      kind: "single",
      prompt:
        "<p>A weighted picker builds prefix sums over n weights and answers each <code>pickIndex()</code> with a binary search. What do setup and one pick cost?</p>",
      choices: [
        {
          id: "a",
          text: "Setup O(n log n) to sort the prefix sums, then O(1) per pick.",
          why: "Prefix sums of non-negative weights are already in non-decreasing order, so nothing is sorted. A pick still needs a search to find its segment.",
        },
        {
          id: "b",
          text: "Setup O(n), then O(log n) per pick.",
          why: "One pass builds the prefix sums, and each pick does one random draw and a binary search over n sorted values.",
        },
        {
          id: "c",
          text: "No setup, then O(n) per pick.",
          why: "That is the cost of walking the weights and subtracting from a random target on each call. It uses no extra memory but repeats the work every time.",
        },
        {
          id: "d",
          text: "Setup O(sum of the weights), then O(1) per pick.",
          why: "That is the expanded array: one entry per unit of weight. The setup time and memory depend on the weights' values, not just on n.",
        },
      ],
      answer: "b",
    },
    {
      id: "rs-quickselect-wording",
      chapter: "dsa-randomization-sampling",
      level: "intermediate",
      skill: "complexity",
      pattern: "randomization",
      section: "randomized-quickselect-expected-o-n-and-what-expected-means",
      kind: "single",
      prompt:
        "<p>Quickselect with a random pivot and a three-way partition finds the k-th largest of n numbers. Which statement is accurate?</p>",
      choices: [
        {
          id: "a",
          text: "Expected O(n) for every input, over its own random pivots; the worst case is still O(n squared).",
          why: "Each round has about a one-half chance of leaving at most three quarters of the elements, which bounds the expected work by a constant times n. A run of extreme pivots can still happen.",
        },
        {
          id: "b",
          text: "It runs in O(n) in the worst case, because a random pivot always splits the array into two nearly equal parts.",
          why: "A random pivot is evenly placed only about half the time. If every pivot is an extreme, the work is n + (n - 1) + ... which is quadratic.",
        },
        {
          id: "c",
          text: "It is O(n log n) in expectation, like quicksort, because it recurses on both halves of the partition.",
          why: "Quickselect recurses into only the one side that contains the target. That is why the work shrinks geometrically instead of adding up to n log n.",
        },
        {
          id: "d",
          text: "O(n) on average over random inputs, but an already sorted input is its worst case.",
          why: "The expectation is over the pivots, not over inputs. A sorted array is the worst case for a fixed pivot such as the first or last element, but a random pivot treats it like any other input.",
        },
      ],
      answer: "a",
    },
    {
      id: "rs-rand10-loop",
      chapter: "dsa-randomization-sampling",
      level: "intermediate",
      skill: "recognise",
      pattern: "randomization",
      section: "the-counting-test-can-this-algorithm-be-uniform-at-all",
      kind: "single",
      prompt:
        "<p>You are given <code>rand7()</code> and must build a uniform <code>rand10()</code>. Why must a correct solution be allowed to call <code>rand7</code> an unbounded number of times?</p>",
      choices: [
        {
          id: "a",
          text: "Because 10 is larger than 7, so a single call cannot reach every one of the ten results.",
          why: "That is a reason to combine two calls, not to loop: two calls already give 49 combinations, more than the 10 results needed.",
        },
        {
          id: "b",
          text: "Because the sum of two <code>rand7</code> calls is not a whole number, so it cannot be used as an index.",
          why: "The sum of two integers is an integer. The sum is a poor choice for another reason: its values 2 to 14 are not equally likely.",
        },
        {
          id: "c",
          text: "Because k calls give 7 to the power k equally likely sequences, never a multiple of 10, so no fixed k splits evenly.",
          why: "Each result needs exactly 1/10 of the sequences, which needs a multiple of 10. Rejecting the unusable sequences and drawing again is the way out.",
        },
        {
          id: "d",
          text: "Because <code>rand7</code> can return the same value twice in a row, and repeats break the argument that all 49 pairs are equally likely.",
          why: "Consecutive calls are independent and may repeat, and the 49 pairs count that as one of the equally likely cases. Nothing in the argument depends on avoiding repeats.",
        },
      ],
      answer: "c",
    },
    {
      id: "rs-circle-radius",
      chapter: "dsa-randomization-sampling",
      level: "intermediate",
      skill: "edge-case",
      pattern: "randomization",
      section: "random-point-in-a-circle",
      kind: "single",
      prompt:
        "<p>A function picks a point in a circle of radius R by drawing a uniform angle and the distance <code>R * u</code>, where u is uniform in [0, 1). About what share of its points lands within R/2 of the center?</p>",
      choices: [
        {
          id: "a",
          text: "25%, the share of the disc's area that lies within R/2 of the center.",
          why: "That is what a uniform pick over the disc would give. This method draws the distance uniformly, which is not the same thing as drawing the area uniformly.",
        },
        {
          id: "b",
          text: "50%: the distance is uniform, and R/2 is half of R.",
          why: "The distance falls below R/2 with probability 1/2, while only a quarter of the area lies there. The center is crowded. Using <code>R * Math.sqrt(u)</code> fixes it.",
        },
        {
          id: "c",
          text: "75%, the share of the area that lies outside the distance R/2.",
          why: "75% is the share of the area outside radius R/2, which is the part this method under-fills. It does not describe the points inside R/2.",
        },
        {
          id: "d",
          text: "12.5%, one half cubed.",
          why: "One half cubed is the volume fraction inside half the radius of a ball in three dimensions. A circle is two-dimensional, so the area fraction is one half squared.",
        },
      ],
      answer: "b",
    },
    {
      id: "rs-multi-uniform-shuffles",
      chapter: "dsa-randomization-sampling",
      level: "intermediate",
      skill: "edge-case",
      pattern: "randomization",
      section: "why-sort-math-random-0-5-is-biased-measured",
      kind: "multi",
      prompt:
        "<p>Which of these shuffles give every order of n distinct items probability exactly 1/n!? Select all that do.</p>",
      choices: [
        {
          id: "a",
          text: "For i from n - 1 down to 1, swap position i with a position j drawn uniformly from 0 .. i.",
          why: "Fisher-Yates from the back. Its n! choice sequences map one-to-one onto the n! orders.",
        },
        {
          id: "b",
          text: "For i from 0 to n - 2, swap position i with a position j drawn uniformly from i .. n - 1.",
          why: "Fisher-Yates from the front, the same argument read from the other end: n * (n - 1) * ... * 2 sequences, each giving a different order.",
        },
        {
          id: "c",
          text: "For every i, swap position i with a position drawn uniformly from the whole array.",
          why: "The n to the power n sequences cannot be split evenly among n! orders, so some orders are more likely than others.",
        },
        {
          id: "d",
          text: "Sort with the comparator <code>() =&gt; Math.random() - 0.5</code>.",
          why: "The comparator is inconsistent, so the result is implementation-defined, and no coin-flip comparison sort can give every order 1/n! once n is 3 or more.",
        },
        {
          id: "e",
          text: "Give each item an independent random key and sort the items by key, assuming no two keys are equal.",
          why: "With all keys different, every order of the keys is equally likely, so every order of the items is. It costs O(n log n) instead of O(n).",
        },
      ],
      answers: ["a", "b", "e"],
    },
    {
      id: "rs-order-weighted-pick",
      chapter: "dsa-randomization-sampling",
      level: "intermediate",
      skill: "trace",
      pattern: "randomization",
      section: "weighted-random-pick-prefix-sums-and-binary-search",
      kind: "order",
      prompt:
        "<p>Put the steps of a weighted random pick in the order they happen, from the setup to the returned index.</p>",
      items: [
        { id: "prefix", text: "Build the prefix sums of the weights once, and keep the total." },
        { id: "draw", text: "Draw a whole number r from 0 to total - 1." },
        { id: "search", text: "Binary search for the first prefix sum that is strictly greater than r." },
        { id: "return", text: "Return the index that the search found." },
      ],
      why: "The search needs the prefix sums, so they come first and are built once for all picks. The draw needs the total, which the setup produced. The search needs both the prefix array and r, and the returned index is its result. Reordering any step breaks the one before or after it.",
    },
  ],
  pattern: {
    pattern: "randomization",
    chapter: "dsa-randomization-sampling",
    signals: [
      "The prompt says shuffle, random pick, random sample, or asks for a result that is equally likely or proportional to a weight.",
      "Items arrive in a stream or a linked list of unknown length, with one pass and O(1) memory allowed.",
      "One fair source (a rand7, a coin, Math.random) must be turned into a different distribution.",
      "The answer must be argued as uniform, or tested with a generator you can seed.",
    ],
    template:
      "<pre><code>let chosen;\nlet seen = 0;\nfor (const item of stream) {\n  seen++;\n  if (Math.floor(rng() * seen) === 0) chosen = item;\n}</code></pre>",
    time: "O(n) for a shuffle or a pass over a stream; O(log n) per weighted pick",
    space: "O(1) to O(k) extra, O(n) for prefix sums",
    styles: ["online-assessment", "phone-screen", "onsite"],
  },
};
