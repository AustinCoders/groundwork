import type { DsaQuestion } from "./dsa-types";

export const questions: DsaQuestion[] = [
  {
    id: "flipkart-max-points-from-cards",
    company: "flipkart",
    title: "Maximum Points You Can Obtain from Cards",
    prompt:
      "A row of cards each shows a number of points. In exactly k moves you take one card per move, always from the left end or the right end of what remains, and your score is the sum of the cards you took. For example, cards [1,2,3,4,5,6,1] with k = 3 give 12, by taking the three cards at the right end: 1, 6 and 5. The row can hold up to 100,000 cards and 1 <= k <= number of cards.",
    level: "SDE",
    difficulty: "Medium",
    pattern: "Sliding window on the complement",
    patternId: "window",
    leetcode: { number: 1423, slug: "maximum-points-you-can-obtain-from-cards" },
    evidence: "several",
    sources: [
      {
        label: "GeeksforGeeks: Flipkart SDE interview experience (cards problem)",
        url: "https://www.geeksforgeeks.org/?p=1006229",
        kind: "candidate-report",
      },
      {
        label: "Company-tagged list: Flipkart (LeetCode tags)",
        url: "https://raw.githubusercontent.com/liquidslr/leetcode-company-wise-problems/main/Flipkart/5.%20All.csv",
        kind: "company-list",
        year: 2025,
      },
    ],
    chapters: ["dsa-sliding-window", "dsa-prefix-sums"],
    answer: {
      ask: `<p>I would ask: do I have to take exactly k cards, and may I choose left or right freely on every move? Can card values be zero or negative, or are they all positive? Can k equal the number of cards? How long can the row be, and could the total outgrow a normal number?</p>
<p>I will assume k is at least 1 and at most n, values are integers, the total fits in a JavaScript number, and I return only the best total, not which cards were taken. If k equals n, every card is taken and the answer is the whole sum.</p>`,
      brute: `<p>The obvious plan is to try every way to split the k moves: take i cards from the left end and k - i from the right end, for i from 0 to k. Add those cards up from scratch for each split and keep the largest total.</p>
<p>Each split costs O(k) to add up, and there are k + 1 splits, so the whole thing is O(k²). With n and k near 100,000 that is about ten billion additions, far too slow. A recursive "left or right" choice on every move is worse still, 2<sup>k</sup> paths. Running sums can bring the split loop down to O(k), but the juggling of two ends is easy to get wrong, so I prefer a cleaner view.</p>`,
      insight: `<p>Flip the question. Whatever I take, the cards I do <em>not</em> take form one unbroken block in the middle of the row, and that block always has length n - k. The total of all cards is fixed, so score = total - (sum of the block I leave behind). Maximizing the score is the same as minimizing the sum of a window of exactly n - k consecutive cards.</p>
<p>Why is this exactly equivalent? If I take i cards from the left and k - i from the right, the block left behind starts at index i and has length n - k. As i runs from 0 to k, the block start runs over every possible window start, and every window start from 0 to k is reachable by one choice of i. So the set of "left behind" blocks equals the set of all windows of length n - k, nothing more and nothing less.</p>
<p>Now this is a <b>fixed-size sliding window</b>. Build the first window of n - k cards, then slide it one step at a time: add the new card on the right, drop the old card on the left, and keep the smallest sum seen. Each slide is O(1), so the scan is O(n).</p>
<p>Out loud I would say: "Instead of choosing what to take, I choose what to leave, and what I leave is always a contiguous middle stretch of known length."</p>`,
      walkthrough: `<p>Take cards [1,2,3,4,5,6,1] with k = 3. The total is 22 and the window length is n - k = 4.</p>
<p>The first window [1,2,3,4] sums to 10. Slide right: drop 1 and add 5, giving 14. Slide again: drop 2, add 6, giving 18. Slide a last time: drop 3, add 1, giving 16. The smallest window sum is 10, so the best score is 22 - 10 = 12.</p>
<p>The <code>trace</code> table shows each window, its sum and the smallest sum so far. The smallest block, [1,2,3,4], is what I leave behind, so I took the three cards after it: 5, 6 and 1, which add up to 12 as in the prompt.</p>`,
      edges: `<p>If k equals n, the window length is 0 and there is nothing to leave behind, so the code returns the total straight away before building any window. If k is 1, the window has n - 1 cards and the answer is the larger of the two end cards, which the same loop finds without a special case. A single card with k = 1 returns that card.</p>
<p>Zeros are harmless: they add nothing to any window sum. Negative values would also work, because the argument is about sums only. The smallest sum starts as the first window's sum, not as zero, so a window of all positive numbers is never beaten by a fake zero. Large rows stay at O(n) time with two running numbers, so there is nothing extra to allocate.</p>`,
      followups: [
        "How would you solve it with a prefix sum from the left and a suffix sum from the right, growing the left count from 0 to k, and why is that also O(k)?",
        "Does the complement argument still hold when some cards are negative?",
        "How would you return which cards were taken, not only the total?",
        "What changes if you must take at least one card from each end?",
      ],
      slips: `<p>The classic wrong answer is greedy: on each move take the bigger of the two end cards. It fails because a small card at an end can hide a huge card right behind it, and the greedy never looks past the end.</p>
<p>Other slips: sliding a window of size k and taking the maximum, which answers a different question; getting the window length wrong by one (it is n - k, not n - k + 1); not noticing that k equal to n leaves an empty window (the code here returns the total early); seeding the smallest sum with 0 instead of the first window's sum; and mixing up the added and dropped indices when sliding.</p>`,
    },
    trace: {
      caption: "cardPoints = [1,2,3,4,5,6,1], k = 3, total = 22, window length n - k = 4",
      head: ["step", "window", "sum", "smallest so far", "note"],
      rows: [
        ["build", "[1,2,3,4]", "10", "10", "first window"],
        ["slide 1", "[2,3,4,5]", "14", "10", "drop 1, add 5"],
        ["slide 2", "[3,4,5,6]", "18", "10", "drop 2, add 6"],
        ["slide 3", "[4,5,6,1]", "16", "10", "drop 3, add 1"],
        ["answer", "-", "-", "10", "22 - 10 = 12"],
      ],
    },
    complexity: { time: "O(n)", space: "O(1) extra", brute: "O(k²)" },
    solution: {
      entry: "maxScore",
      code: `function maxScore(cardPoints, k) {
  const n = cardPoints.length;
  let total = 0;
  for (const points of cardPoints) total += points;

  const windowSize = n - k;
  if (windowSize <= 0) return total;

  let windowSum = 0;
  for (let i = 0; i < windowSize; i++) windowSum += cardPoints[i];

  let smallest = windowSum;
  for (let right = windowSize; right < n; right++) {
    windowSum += cardPoints[right] - cardPoints[right - windowSize];
    if (windowSum < smallest) smallest = windowSum;
  }
  return total - smallest;
}`,
      cases: [
        { args: [[1, 2, 3, 4, 5, 6, 1], 3], expected: 12 },
        { args: [[2, 2, 2], 2], expected: 4 },
        { args: [[9, 7, 7, 9, 7, 7, 9], 7], expected: 55 },
        { args: [[1], 1], expected: 1 },
        { args: [[1, 1000, 1], 1], expected: 1 },
        { args: [[100, 40, 17, 9, 73, 75], 3], expected: 248 },
        { args: [[0, 0, 0], 2], expected: 0 },
        { args: [[5, 5, 5, 5, 5, 5], 4], expected: 20 },
        { args: [[1, 79, 80, 1, 1, 1, 200, 1], 3], expected: 202 },
        {
          args: [[59, 28, 57, 90, 62, 61, 16, 80, 64, 75, 67, 31, 72, 18, 53, 22, 19, 71, 79, 76, 11, 43, 66, 33], 9],
          expected: 517,
        },
      ],
    },
  },
  {
    id: "flipkart-longest-unique-substring",
    company: "flipkart",
    title: "Longest Substring Without Repeating Characters",
    prompt:
      'Given a string, return the length of the longest contiguous stretch of it in which no character appears twice. For example, "abcabcbb" gives 3, because "abc" is the longest such stretch. The string may hold letters, digits, symbols and spaces, and can be up to 50,000 characters long.',
    level: "SDE",
    difficulty: "Medium",
    pattern: "Sliding window with last-seen index",
    patternId: "window",
    leetcode: { number: 3, slug: "longest-substring-without-repeating-characters" },
    evidence: "several",
    sources: [
      {
        label: "GeeksforGeeks: Flipkart SDE interview experience (unique-character window)",
        url: "https://www.geeksforgeeks.org/?p=1054055",
        kind: "candidate-report",
      },
      {
        label: "Company-tagged list: Flipkart (LeetCode tags)",
        url: "https://raw.githubusercontent.com/liquidslr/leetcode-company-wise-problems/main/Flipkart/5.%20All.csv",
        kind: "company-list",
        year: 2025,
      },
    ],
    chapters: ["dsa-sliding-window", "dsa-hashing"],
    answer: {
      ask: `<p>I would ask: do I return the length or the substring itself? Is the comparison case sensitive, so that "a" and "A" differ? What is the character set: only ASCII, or arbitrary Unicode? What should an empty string return? How long can the input be?</p>
<p>I will assume I return only the length, comparison is exact and case sensitive, characters are JavaScript string units, the empty string gives 0, and n is up to about 50,000. I will mention that emoji made of two string units would need extra care if the interviewer cares about them.</p>`,
      brute: `<p>The direct approach is to try every start index i and walk right, adding characters to a set until one repeats, then record the length and move on to i + 1.</p>
<p>That is O(n · m) where m is the longest distinct run it explores, and in the worst case, with a large character set, m can approach n, which is O(n²). At 50,000 characters an all-distinct input means about 1.25 billion set operations. Even when the alphabet caps the run length, the method is wasteful: every restart at i + 1 re-verifies characters we already knew were distinct a moment ago. We need a way to remember what the previous window taught us.</p>`,
      insight: `<p>Keep a window <code>s[left..right]</code> that always contains no repeated character, and move <code>right</code> one step at a time. A map remembers, for every character, the last index where we saw it.</p>
<p>When the new character c arrives, look up its last index p. If p is at least <code>left</code>, then c already lives inside the window, so the window would hold two copies. Any valid window that ends at right cannot contain both p and right, so its start must be p + 1 or later, and the best choice is the earliest allowed start: <code>left = p + 1</code>. We jump in one move instead of nudging left one step at a time. If p is smaller than left, or c was never seen, the old sighting is outside the window and we ignore it. That check is the heart of the problem.</p>
<p>Then record <code>lastSeen[c] = right</code> and compare <code>right - left + 1</code> with the best length.</p>
<p>The invariant is: after handling right, the window <code>s[left..right]</code> has all-distinct characters and left is as small as that allows. Left only moves forward and right only moves forward, so the work is O(n). The pattern is a <b>variable-size sliding window with a last-seen map</b>. The map operations are average O(1) in JavaScript.</p>`,
      walkthrough: `<p>Take "abcabcbb". The first three steps read a, b and c, so the window grows to "abc" and the best is 3.</p>
<p>At index 3 the character a was last seen at index 0, which is inside the window starting at 0, so left jumps to 1. The window becomes "bca", length 3. Index 4 (b, last at 1) moves left to 2, and index 5 (c, last at 2) moves left to 3. At index 6 the character b was last seen at index 4, so left jumps to 5 and the window is "cb". At index 7 another b was last seen at 6, so left becomes 7 and the window is "b".</p>
<p>The <code>trace</code> table lists left, the window text and the best so far at each step. The final answer is 3.</p>`,
      edges: `<p>The empty string never enters the loop and returns 0. A string of one repeated character, like "bbbbb", moves left on every step and returns 1. A string with no repeats returns its full length.</p>
<p>The tricky case is "abba": at the second b the window shrinks to start at 2, and when the final a arrives its last sighting is index 0, which is now left of the window. Because the code only jumps when the stored index is at least left, it correctly ignores that stale sighting and the answer is 2, not 3. Spaces and symbols are ordinary characters. A character made of two string units, such as some emoji, is counted as two units by this code.</p>`,
      followups: [
        "How would you return the substring itself, and what extra state do you keep?",
        "How would you adapt this when at most k distinct characters are allowed instead of none repeated?",
        "Can you replace the map with a fixed array, and what does that assume about the characters?",
        "What changes if the input arrives as a stream you cannot rewind?",
      ],
      slips: `<p>The most common bug is skipping the "last index is at least left" check, which lets an old sighting drag left backwards and gives "abba" the answer 3. The second is a Set-based version that removes only one character from the left per repeat instead of looping until the repeated character is gone, which leaves a duplicate inside the window and reports too long a length ("abba" gives 3 there too).</p>
<p>Other slips: computing the length as <code>right - left</code> and missing the plus one; updating the best length before moving left; and restarting the scan from the old start plus one after every repeat instead of jumping left, which silently turns the solution back into O(n²).</p>`,
    },
    trace: {
      caption: 'Input "abcabcbb": left jumps to lastSeen + 1 when the old sighting is inside the window',
      head: ["right", "char", "left", "window", "best"],
      rows: [
        ["0", "a", "0", "a", "1"],
        ["1", "b", "0", "ab", "2"],
        ["2", "c", "0", "abc", "3"],
        ["3", "a", "1", "bca", "3"],
        ["4", "b", "2", "cab", "3"],
        ["5", "c", "3", "abc", "3"],
        ["6", "b", "5", "cb", "3"],
        ["7", "b", "7", "b", "3"],
      ],
    },
    complexity: { time: "O(n)", space: "O(min(n, alphabet))", brute: "O(n²)" },
    solution: {
      entry: "lengthOfLongestSubstring",
      code: `function lengthOfLongestSubstring(s) {
  const lastSeen = new Map();
  let left = 0;
  let best = 0;

  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    const previous = lastSeen.get(char);
    if (previous !== undefined && previous >= left) {
      left = previous + 1;
    }
    lastSeen.set(char, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}`,
      cases: [
        { args: ["abcabcbb"], expected: 3 },
        { args: [""], expected: 0 },
        { args: ["bbbbb"], expected: 1 },
        { args: ["pwwkew"], expected: 3 },
        { args: ["abba"], expected: 2 },
        { args: [" "], expected: 1 },
        { args: ["dvdf"], expected: 3 },
        { args: ["x1 y2 x1 z3-y2 w4 x1"], expected: 8 },
        { args: ["abcdefg"], expected: 7 },
        { args: ["a1b2c3a1d4e5b2f6"], expected: 12 },
      ],
    },
  },
  {
    id: "flipkart-house-robber",
    company: "flipkart",
    title: "House Robber",
    prompt:
      "A street has houses in a row, each holding some cash, and you may take from any set of houses as long as no two are neighbours. Given the amounts in order, return the most you can take. For example, [2,7,9,3,1] gives 12, by taking from the houses holding 2, 9 and 1. There are up to 100 houses and every amount is zero or more.",
    level: "SDE (on-campus, 2021)",
    difficulty: "Medium",
    pattern: "1D dynamic programming",
    patternId: "dp",
    leetcode: { number: 198, slug: "house-robber" },
    evidence: "one",
    sources: [
      {
        label: "GeeksforGeeks: Flipkart SDE on-campus interview experience, 2021",
        url: "https://www.geeksforgeeks.org/?p=552746",
        kind: "candidate-report",
        year: 2021,
      },
    ],
    chapters: ["dsa-dp-1d"],
    answer: {
      ask: `<p>I would ask: can the street be empty, and what do I return then? Can amounts be negative, which would make skipping a house better than taking it? Is the street a straight row or a circle where the first and last houses are neighbours? Do I return only the total or also the chosen houses? How many houses are there?</p>
<p>I will assume a straight row, non-negative integer amounts, an empty street returns 0, and I return the total only. The size is small, but I will write something that would still be fine for a million houses.</p>`,
      brute: `<p>The direct approach is recursion: at each house either take it and jump to the house two steps ahead, or skip it and move to the next one, and keep the larger total. Equivalently, enumerate every set of houses with no two neighbours.</p>
<p>The number of such sets grows like the Fibonacci numbers, roughly 1.6 times larger for every extra house. For 100 houses that is more than 10<sup>20</sup> sets, which no computer can enumerate. The waste is clear: the recursion asks "what is the best from house 40 onward" again and again, from different earlier choices. There are only n distinct questions, so we should answer each one once.</p>`,
      insight: `<p>Let <code>best(i)</code> be the most I can take from the first i houses. Look at the last house, number i. Either I skip it, which leaves me with <code>best(i - 1)</code>, or I take it. If I take it, I cannot take its neighbour, so everything else comes from the first i - 2 houses, which gives <code>amount + best(i - 2)</code>. The answer for i is the larger of the two.</p>
<p>Why is this correct? Any optimal plan for the first i houses either includes house i or not. If it does not, the rest of the plan is a valid plan for the first i - 1 houses, and it must be optimal there, or swapping in a better one would improve the whole plan. If it does include house i, the rest is a valid plan for the first i - 2 houses, and again any better plan there could be swapped in. This is optimal substructure.</p>
<p>The recurrence reads only the two previous values, so I do not need an array: two variables, <code>beforePrevious</code> and <code>previous</code>, are enough. That gives O(n) time and O(1) space. The pattern is <b>1D dynamic programming with a rolling state</b>.</p>
<p>Out loud: "At each house I ask whether taking it beats the best I had one house ago."</p>`,
      walkthrough: `<p>Take [2,7,9,3,1]. Start with both remembered values at 0.</p>
<p>House 0 (2): taking gives 0 + 2 = 2, skipping gives 0, best is 2. House 1 (7): taking gives 0 + 7 = 7, skipping gives 2, best is 7. House 2 (9): taking gives 2 + 9 = 11, skipping gives 7, best is 11. House 3 (3): taking gives 7 + 3 = 10, skipping gives 11, best stays 11. House 4 (1): taking gives 11 + 1 = 12, skipping gives 11, best is 12.</p>
<p>The <code>trace</code> table lists the take and skip values for each house. The final answer is 12.</p>`,
      edges: `<p>An empty street returns 0 through the guard at the top. One house returns that amount, because taking beats the empty skip of 0. Two houses return the larger of the two amounts, since they are neighbours. All zeros return 0.</p>
<p>Equal neighbours such as [5,5] return 5, not 10. A tricky pattern is [2,1,1,2], where the best is 4 by taking the first and last houses, which are not neighbours; any rule that only looks at every other house misses it. Amounts only add, so large streets work as long as the total stays inside a normal number.</p>`,
      followups: [
        "How would you solve it if the houses form a circle so the first and last are neighbours?",
        "How would you recover which houses to take, not only the total?",
        "What changes if you may not take from houses within two places of each other?",
        "How does the same recurrence appear in a tree-shaped street?",
      ],
      slips: `<p>The popular wrong idea is to add up the odd-position houses and the even-position houses and return the larger. It fails on [2,1,1,2], where both sums are 3 but the answer is 4. A second slip is a greedy "take the biggest house, then remove its neighbours", which fails on [4,5,4], where it takes 5 and ends with 5 instead of 8.</p>
<p>Implementation slips: mixing up which value is two houses back when shifting the two variables (work out the new best from the old pair of values before overwriting either); forgetting that skipping a house must carry forward the previous best, not zero; and crashing on an empty array by reading index 0.</p>`,
    },
    trace: {
      caption: "nums = [2,7,9,3,1]: best so far is the larger of 'take this house' and 'skip it'",
      head: ["house", "amount", "take = two back + amount", "skip = previous best", "best"],
      rows: [
        ["0", "2", "0 + 2 = 2", "0", "2"],
        ["1", "7", "0 + 7 = 7", "2", "7"],
        ["2", "9", "2 + 9 = 11", "7", "11"],
        ["3", "3", "7 + 3 = 10", "11", "11"],
        ["4", "1", "11 + 1 = 12", "11", "12"],
      ],
    },
    complexity: { time: "O(n)", space: "O(1) extra", brute: "O(1.6ⁿ)" },
    solution: {
      entry: "rob",
      code: `function rob(nums) {
  if (nums.length === 0) return 0;

  let beforePrevious = 0;
  let previous = 0;
  for (let house = 0; house < nums.length; house++) {
    const skipHouse = previous;
    const robHouse = beforePrevious + nums[house];
    beforePrevious = previous;
    previous = Math.max(skipHouse, robHouse);
  }
  return previous;
}`,
      cases: [
        { args: [[2, 7, 9, 3, 1]], expected: 12 },
        { args: [[]], expected: 0 },
        { args: [[5]], expected: 5 },
        { args: [[1, 2, 3, 1]], expected: 4 },
        { args: [[2, 1, 1, 2]], expected: 4 },
        { args: [[0, 0, 0]], expected: 0 },
        { args: [[5, 5]], expected: 5 },
        { args: [[4, 4, 4, 4, 4, 4]], expected: 12 },
        { args: [[14, 14, 21, 11, 40, 24, 27, 43, 31, 35, 1, 28, 22, 26, 33, 14]], expected: 221 },
      ],
    },
  },
  {
    id: "swiggy-three-sum",
    company: "swiggy",
    title: "3Sum",
    prompt:
      "Given an array of integers, find every distinct triple of values that adds up to zero, using three different positions in the array. List each triple in ascending order and the triples in ascending order too, so the answer is unique, and never list the same triple twice even if its values occur several times. For example, [-1,0,1,2,-1,-4] gives [[-1,-1,2],[-1,0,1]]. The array has up to 3,000 numbers.",
    level: "SDE-1",
    difficulty: "Medium",
    pattern: "Sort and two pointers",
    patternId: "pointers",
    leetcode: { number: 15, slug: "3sum" },
    evidence: "one",
    sources: [
      {
        label: "GeeksforGeeks: Swiggy SDE-1 off-campus interview experience, 2021",
        url: "https://www.geeksforgeeks.org/?p=598921",
        kind: "candidate-report",
        year: 2021,
      },
    ],
    chapters: ["dsa-two-pointers", "dsa-sorting-algorithms"],
    answer: {
      ask: `<p>I would ask: must the three numbers come from three different positions, while equal values at different positions are fine, as in [-1,-1,2]? Should each distinct triple appear once? Can I sort or copy the input? What do I return if nothing matches, or if the array has fewer than three numbers? How big can it be?</p>
<p>I will assume three different positions, each distinct value-triple reported once, sorting a copy is fine, and an empty list is the answer when no triple exists. I will return each triple in ascending order, with the triples in ascending order, so the output is deterministic.</p>`,
      brute: `<p>The direct approach is three nested loops over positions i &lt; j &lt; k, checking whether the sum is zero, and putting each sorted triple in a set to remove duplicates.</p>
<p>That is O(n³): with 3,000 numbers there are about 4.5 billion triples to check, which is far beyond a second or two. A middle path fixes one number and uses a hash set to find the other two in one pass, giving O(n²), but removing duplicate triples with a set of strings is clumsy and memory hungry. Sorting makes both the search and the duplicate handling much cleaner.</p>`,
      insight: `<p>Sort a copy of the array. Then fix the smallest number of the triple at position i and look for two numbers to its right whose sum is <code>-sorted[i]</code>. Use two pointers: <code>left</code> starts at i + 1 and <code>right</code> at the end.</p>
<p>Look at the sum of the three. If it is below zero, the number at left is too small to work with anything at or left of right, so I can discard left and move it up. If it is above zero, the number at right is too big for anything at or right of left, so I discard right and move it down. If it is exactly zero, I record the triple and move both pointers inward. This is the invariant: no valid pair for this i uses a position outside [left, right]. Each step removes one position, so one i costs O(n).</p>
<p>Duplicates are handled by order. Skip an i whose value equals the previous one, because the earlier i already explored every pair. After recording a triple, move left and right past values equal to the ones just used. Because the array is sorted, equal values sit next to each other, so these skips are enough to guarantee each triple appears once. If sorted[i] is already positive, nothing to its right can bring the sum down to zero, so I stop.</p>
<p>The pattern is <b>sort, then fix one and sweep two pointers</b>. Total time is O(n²), dominated by n sweeps.</p>`,
      walkthrough: `<p>Take [-1,0,1,2,-1,-4]. Sorted, it is [-4,-1,-1,0,1,2].</p>
<p>With i at -4, the pair sums are too small at each step (-3, -3, -2, -1), so left moves right until it meets right. Next i is the first -1: left at the second -1 and right at 2 give sum 0, so I record [-1,-1,2]; then left at 0 and right at 1 also sum to 0, so I record [-1,0,1]. The next i is also -1, a duplicate of the previous one, so it is skipped. With i at 0, left at 1 and right at 2 give sum 3, too big, so right moves left and the pointers meet.</p>
<p>The <code>trace</code> table shows every step. The answer is [[-1,-1,2],[-1,0,1]].</p>`,
      edges: `<p>Fewer than three numbers: the loop bound <code>i &lt; n - 2</code> never runs, so the result is empty. An array of all zeros, such as [0,0,0,0], gives exactly one triple, because after recording it the pointer skips remove the remaining equal values and the repeated i is skipped.</p>
<p>All positive or all negative numbers give an empty list; the break on a positive first number handles the first case quickly. Mixed duplicates like [-1,-1,-1,2,2] yield [-1,-1,2] once. The sort uses a numeric comparator, since the default JavaScript sort compares text and would put 10 before 2. I sort a copy, so the caller's array is left untouched.</p>`,
      followups: [
        "How would you solve 3Sum Closest, where the sum only has to be nearest to a target?",
        "Can you do it with a hash set instead of sorting, and what does duplicate removal cost you?",
        "How does the approach extend to 4Sum, and what is its time?",
        "What changes if you must count the triples instead of listing them?",
      ],
      slips: `<p>The most frequent bug is duplicate triples in the output, from forgetting to skip repeated values for i, or for left and right after a hit. A second is skipping duplicates before checking, which can throw away the legitimate [-1,-1,2] pair: the skip for i must compare with the previous i, not the next one.</p>
<p>Other slips: sorting with the default comparator so negative numbers and multi-digit numbers order wrongly; moving neither pointer after a hit, which loops forever, or only one of them, which repeats the same triple; letting left and right cross while the duplicate skip runs, so the skip loops need the left &lt; right guard; and picking the same position twice.</p>`,
    },
    trace: {
      caption: "sorted = [-4,-1,-1,0,1,2]: fix i, then move left/right toward each other",
      head: ["step", "i (value)", "left (value)", "right (value)", "sum", "move"],
      rows: [
        ["1", "0 (-4)", "1 (-1)", "5 (2)", "-3", "left++"],
        ["2", "0 (-4)", "2 (-1)", "5 (2)", "-3", "left++"],
        ["3", "0 (-4)", "3 (0)", "5 (2)", "-2", "left++"],
        ["4", "0 (-4)", "4 (1)", "5 (2)", "-1", "left++, meet"],
        ["5", "1 (-1)", "2 (-1)", "5 (2)", "0", "record [-1,-1,2]"],
        ["6", "1 (-1)", "3 (0)", "4 (1)", "0", "record [-1,0,1]"],
        ["7", "2 (-1)", "-", "-", "-", "skip duplicate i"],
        ["8", "3 (0)", "4 (1)", "5 (2)", "3", "right--, meet"],
      ],
    },
    complexity: { time: "O(n²)", space: "O(n) with a sorted copy", brute: "O(n³)" },
    solution: {
      entry: "threeSum",
      code: `function threeSum(nums) {
  const sorted = [...nums].sort((a, b) => a - b);
  const triples = [];

  for (let i = 0; i < sorted.length - 2; i++) {
    if (sorted[i] > 0) break;
    if (i > 0 && sorted[i] === sorted[i - 1]) continue;

    let left = i + 1;
    let right = sorted.length - 1;
    while (left < right) {
      const sum = sorted[i] + sorted[left] + sorted[right];
      if (sum < 0) {
        left++;
      } else if (sum > 0) {
        right--;
      } else {
        triples.push([sorted[i], sorted[left], sorted[right]]);
        left++;
        right--;
        while (left < right && sorted[left] === sorted[left - 1]) left++;
        while (left < right && sorted[right] === sorted[right + 1]) right--;
      }
    }
  }
  return triples;
}`,
      cases: [
        {
          args: [[-1, 0, 1, 2, -1, -4]],
          expected: [
            [-1, -1, 2],
            [-1, 0, 1],
          ],
        },
        { args: [[]], expected: [] },
        { args: [[0, 0, 0]], expected: [[0, 0, 0]] },
        { args: [[0, 0, 0, 0]], expected: [[0, 0, 0]] },
        { args: [[1, 2, 3]], expected: [] },
        {
          args: [[-2, 0, 1, 1, 2]],
          expected: [
            [-2, 0, 2],
            [-2, 1, 1],
          ],
        },
        { args: [[-1, -1, -1, 2, 2]], expected: [[-1, -1, 2]] },
        {
          args: [[3, 0, -2, -1, 1, 2]],
          expected: [
            [-2, -1, 3],
            [-2, 0, 2],
            [-1, 0, 1],
          ],
        },
        { args: [[1, 1]], expected: [] },
        {
          args: [[0, 6, -4, 0, 5, 1, -6, 2, 2, -1, 4, 2, -3, 4]],
          expected: [
            [-6, 0, 6],
            [-6, 1, 5],
            [-6, 2, 4],
            [-4, -1, 5],
            [-4, 0, 4],
            [-4, 2, 2],
            [-3, -1, 4],
            [-3, 1, 2],
            [-1, 0, 1],
          ],
        },
      ],
    },
  },
  {
    id: "swiggy-min-stack",
    company: "swiggy",
    title: "Min Stack",
    prompt:
      "Design a stack that supports push, pop, top and getMin, where getMin returns the smallest value currently in the stack, and every operation runs in constant time. For example, after pushing -2, 0 and -3, getMin returns -3; after one pop, top returns 0 and getMin returns -2. Pop, top and getMin are only ever called on a non-empty stack, and there can be tens of thousands of operations.",
    level: "SDE-1",
    difficulty: "Medium",
    pattern: "Stack with a running minimum",
    patternId: "stack",
    leetcode: { number: 155, slug: "min-stack" },
    evidence: "one",
    sources: [
      {
        label: "GeeksforGeeks: Swiggy SDE-1 on-campus interview experience, 2021",
        url: "https://www.geeksforgeeks.org/?p=703061",
        kind: "candidate-report",
        year: 2021,
      },
    ],
    chapters: ["dsa-stacks-queues", "dsa-design-problems"],
    answer: {
      ask: `<p>I would ask: do all four operations really need constant time, or only getMin? Is pop, top or getMin ever called on an empty stack, and if so what should they return? Are values plain integers, and may they repeat? Is extra memory proportional to the stack size acceptable?</p>
<p>I will assume constant time for all four, no calls on an empty stack, integer values with repeats allowed, and O(n) extra space is fine. I will mention that array push and pop in JavaScript are amortized O(1), since the underlying storage occasionally grows.</p>`,
      brute: `<p>The obvious design is a plain array. Push, pop and top are O(1), and getMin scans the whole array to find the smallest value.</p>
<p>That makes getMin O(n). With a stack of 30,000 values and 30,000 getMin calls, that is nearly a billion comparisons, and the point of the question is that getMin should not depend on the size at all. Keeping the elements in a sorted structure gives O(log n) for every push and pop, still not constant. Neither approach meets the requirement, so we need to store a little extra information with the stack itself.</p>`,
      insight: `<p>The key observation: while an element sits in the stack, everything below it stays exactly the same. So the minimum of "this element and everything below it" never changes while the element is there. I can compute it once, at push time, and store it next to the value.</p>
<p>Each stack entry is a pair <code>[value, minSoFar]</code>. On push, the new minSoFar is the smaller of the new value and the minSoFar of the current top (or just the value if the stack is empty). On pop, I discard the top pair, and the pair underneath still holds the minimum for the smaller stack, so the old minimum is restored with no extra work. Top reads the value of the last pair and getMin reads its minSoFar. All four are O(1).</p>
<p>The invariant is: for every entry, minSoFar equals the smallest value among that entry and all entries below it. It holds after a push by the rule above and trivially after a pop, since the entries below are untouched.</p>
<p>There is a well-known variant with a second stack of minima that only pushes when the new value is less than or equal to the current minimum. It works, but the equal case is easy to get wrong when values repeat, which is why I prefer pairs. The pattern is <b>augmenting a stack with a running aggregate</b>, and the same trick works for maximum, sum or gcd.</p>`,
      walkthrough: `<p>The example pushes -2, 0, -3, then asks getMin, pops, asks top and asks getMin.</p>
<p>Push -2: stack is empty, so the pair is (-2, -2). Push 0: the current top minimum is -2, so the pair is (0, -2). Push -3: the pair is (-3, -3). getMin reads the top pair and returns -3. Pop removes (-3, -3), leaving (-2, -2) and (0, -2). Top returns 0, and getMin returns -2, restored with no recomputation.</p>
<p>The <code>trace</code> table shows the pairs from bottom to top after each call. The result list for the whole sequence is [null, null, null, null, -3, null, 0, -2], with the constructor and the push and pop calls returning null.</p>`,
      edges: `<p>A single element: its pair is (value, value), so top and getMin agree. Duplicates of the minimum, for example pushing 1 twice and popping once, are safe because each pair carries its own minimum, so the surviving 1 still reports 1. Pushing a larger value never changes the reported minimum, because the new pair copies the one below it.</p>
<p>Ascending pushes keep the minimum at the first value for the whole run; descending pushes update it every time. After popping everything and pushing again, the first push sees an empty stack and starts a fresh minimum. Calls on an empty stack are outside the stated contract, so the code does not guard them, and I would say so out loud.</p>`,
      followups: [
        "How would you cut the extra space by storing the minimum only when it changes?",
        "How would you add getMax in the same constant time?",
        "How would you build the same structure with a queue instead of a stack?",
        "What would you change to make the stack safe for several threads?",
      ],
      slips: `<p>The classic bug is the two-stack version that pushes onto the minimum stack only when the new value is strictly smaller than the current minimum. With duplicates, popping one copy of the minimum removes it from the minimum stack while another copy is still in the main stack, and getMin is then wrong. The fix is to push on less-than-or-equal, or to use pairs as above.</p>
<p>Other slips: keeping one running minimum variable, which cannot be restored after a pop; recomputing the minimum with a scan on every getMin; forgetting to compare against the top's minimum on push and storing only the new value; and returning the pair instead of just the value from top.</p>`,
    },
    trace: {
      caption: "Entries are (value, minimum of this entry and everything below), shown bottom to top",
      head: ["step", "call", "stack", "returns"],
      rows: [
        ["1", "push(-2)", "(-2,-2)", "null"],
        ["2", "push(0)", "(-2,-2) (0,-2)", "null"],
        ["3", "push(-3)", "(-2,-2) (0,-2) (-3,-3)", "null"],
        ["4", "getMin()", "(-2,-2) (0,-2) (-3,-3)", "-3"],
        ["5", "pop()", "(-2,-2) (0,-2)", "null"],
        ["6", "top()", "(-2,-2) (0,-2)", "0"],
        ["7", "getMin()", "(-2,-2) (0,-2)", "-2"],
      ],
    },
    complexity: { time: "O(1) per operation", space: "O(n)", brute: "O(n) per getMin" },
    solution: {
      entry: "run",
      code: `class MinStack {
  constructor() {
    this.entries = [];
  }

  push(value) {
    const smallest =
      this.entries.length === 0 ? value : Math.min(value, this.getMin());
    this.entries.push([value, smallest]);
  }

  pop() {
    this.entries.pop();
  }

  top() {
    return this.entries[this.entries.length - 1][0];
  }

  getMin() {
    return this.entries[this.entries.length - 1][1];
  }
}

function run(ops, args) {
  let stack = null;
  const results = [];
  for (let i = 0; i < ops.length; i++) {
    if (ops[i] === "MinStack") {
      stack = new MinStack();
      results.push(null);
    } else {
      const result = stack[ops[i]](...args[i]);
      results.push(result === undefined ? null : result);
    }
  }
  return results;
}`,
      cases: [
        {
          args: [
            ["MinStack", "push", "push", "push", "getMin", "pop", "top", "getMin"],
            [[], [-2], [0], [-3], [], [], [], []],
          ],
          expected: [null, null, null, null, -3, null, 0, -2],
        },
        { args: [["MinStack"], [[]]], expected: [null] },
        {
          args: [
            ["MinStack", "push", "push", "pop", "getMin"],
            [[], [1], [1], [], []],
          ],
          expected: [null, null, null, null, 1],
        },
        {
          args: [
            ["MinStack", "push", "top", "getMin"],
            [[], [7], [], []],
          ],
          expected: [null, null, 7, 7],
        },
        {
          args: [
            ["MinStack", "push", "push", "push", "getMin", "pop", "pop", "getMin"],
            [[], [1], [2], [3], [], [], [], []],
          ],
          expected: [null, null, null, null, 1, null, null, 1],
        },
        {
          args: [
            ["MinStack", "push", "push", "push", "getMin", "pop", "getMin", "pop", "getMin"],
            [[], [3], [2], [1], [], [], [], [], []],
          ],
          expected: [null, null, null, null, 1, null, 2, null, 3],
        },
        {
          args: [
            ["MinStack", "push", "push", "getMin", "pop", "push", "getMin"],
            [[], [0], [-1], [], [], [5], []],
          ],
          expected: [null, null, null, -1, null, null, 0],
        },
        {
          args: [
            ["MinStack", "push", "pop", "push", "getMin", "top"],
            [[], [4], [], [9], [], []],
          ],
          expected: [null, null, null, null, 9, 9],
        },
        {
          args: [
            [
              "MinStack",
              "push",
              "push",
              "getMin",
              "push",
              "push",
              "getMin",
              "top",
              "getMin",
              "pop",
              "getMin",
              "getMin",
              "top",
              "push",
              "top",
              "getMin",
              "push",
              "getMin",
              "getMin",
              "getMin",
              "getMin",
              "pop",
              "top",
            ],
            [[], [9], [4], [], [-4], [4], [], [], [], [], [], [], [], [9], [], [], [2], [], [], [], [], [], []],
          ],
          expected: [
            null,
            null,
            null,
            4,
            null,
            null,
            -4,
            4,
            -4,
            null,
            -4,
            -4,
            -4,
            null,
            9,
            -4,
            null,
            -4,
            -4,
            -4,
            -4,
            null,
            9,
          ],
        },
      ],
    },
  },
  {
    id: "swiggy-task-scheduler",
    company: "swiggy",
    title: "Task Scheduler",
    prompt:
      'A processor runs one task per time slot or sits idle, and each task is a capital letter that may run in any order. Two runs of the same letter must have at least n other slots (tasks or idle) between them, and you return the fewest slots needed to finish all tasks. For example, tasks ["A","A","A","B","B","B"] with n = 2 need 8 slots: A B idle A B idle A B. There are up to 10,000 tasks.',
    level: "SDE-1",
    difficulty: "Medium",
    pattern: "Greedy counting or max-heap",
    patternId: "greedy",
    leetcode: { number: 621, slug: "task-scheduler" },
    evidence: "one",
    sources: [
      {
        label: "GeeksforGeeks: Swiggy SDE-1 off-campus interview experience, 2021",
        url: "https://www.geeksforgeeks.org/?p=598921",
        kind: "candidate-report",
        year: 2021,
      },
    ],
    chapters: ["dsa-greedy", "dsa-heaps-priority-queues"],
    answer: {
      ask: `<p>I would ask: may different letters run back to back with no gap? Can I reorder the tasks freely? Do I return only the number of slots, not the schedule itself? Is n zero allowed, meaning no cooldown at all? How many tasks, and are the labels limited to the 26 capital letters?</p>
<p>I will assume different letters have no restriction on each other, order is free, I return only the length, n can be 0, and the labels are capital letters. An empty task list needs 0 slots. I will state that I may also describe a schedule-building version afterwards.</p>`,
      brute: `<p>The honest brute force is a search over schedules: at each slot, try running each task that is allowed or sitting idle, and keep the shortest complete schedule. That explores a number of orderings that grows like a factorial in the number of tasks, so it breaks down beyond about a dozen tasks, nowhere near 10,000.</p>
<p>A second, polynomial idea is to simulate the clock with a max-heap: each slot, run the available letter with the most copies left, and park it in a cooldown queue for n slots. That is correct and costs about O(S log 26) for S slots, where S can be much larger than the number of tasks when n is big. But it builds a whole schedule just to report its length, and it has several moving parts to get right under pressure. Counting alone gives the same number.</p>`,
      insight: `<p>The letter that appears most often is the bottleneck. Say its count is f. Its copies need gaps, so picture the schedule as <code>f - 1</code> full frames, each of width <code>n + 1</code> (the letter, then n slots for cooldown), followed by a last row. Every other letter can be dropped into the spare slots of the frames.</p>
<p>The last row is not just the busiest letter: any other letter that also appears exactly f times needs its final copy somewhere too, and the only place without breaking its own cooldown is that last row. If <code>tied</code> letters share the maximum count, the last row holds <code>tied</code> tasks. So the schedule is at least <code>(f - 1) * (n + 1) + tied</code> slots long.</p>
<p>That formula is a lower bound, because the busiest letters alone force it. The other bound is simply the number of tasks, since each slot runs at most one. When there are so many tasks that the frames overflow, the extra tasks can be spread through the schedule and no idle slot is needed. So the answer is the larger of the two: <code>max(tasks.length, (f - 1) * (n + 1) + tied)</code>.</p>
<p>I would say this out loud as: "the most common letter decides the frame; idle time only appears when the other tasks cannot fill it." If asked for a rigorous proof, I would point to the heap simulation, which builds a matching schedule. The pattern is <b>greedy counting</b>.</p>`,
      walkthrough: `<p>Take tasks A A A B B B with n = 2. Counting gives A: 3 and B: 3, so the highest count f is 3, and two letters share it, so tied is 2.</p>
<p>There are f - 1 = 2 full frames of width n + 1 = 3, which is 6 slots. The last row holds the two tied letters, adding 2, for 8 slots. The number of tasks is only 6, so the frame bound wins: the answer is max(8, 6) = 8, matching A B idle A B idle A B.</p>
<p>The <code>trace</code> table lists each quantity in order, from the counts to the final maximum.</p>`,
      edges: `<p>If n is 0, the frame width is 1 and the formula gives at most the number of tasks, so the answer is the task count and no idle appears. An empty list gives a highest count of 0, a negative frame total, and the maximum with the task count of 0 returns 0.</p>
<p>Many distinct letters with a small n, for example A, B, C with n = 5 once each, has a highest count of 1 with three letters tied, so the frame bound is 0 * 6 + 3 = 3, which equals the task count: no idle is needed. A single repeated letter, such as six copies of A with n = 2, gives (6 - 1) * 3 + 1 = 16, with lots of idle time. Several letters tying for the maximum are handled by the tied count.</p>`,
      followups: [
        "How would you return the actual schedule, and why does a max-heap with a cooldown queue work?",
        "What if the cooldown depends on the letter?",
        "How would you spread the tasks over k identical processors?",
        "Can you prove that the max of the two bounds is always achievable?",
      ],
      slips: `<p>The commonest slip is forgetting the tied count and using <code>(f - 1) * (n + 1) + 1</code>, which is wrong when two letters share the highest count: A A A B B B with n = 2 would give 7 instead of 8. A second is using <code>f * (n + 1)</code>, which counts idle slots in the last row that are not needed.</p>
<p>Other slips: omitting the maximum with the task count, so inputs with many distinct letters return an answer smaller than the number of tasks, which is impossible; mixing up n and n + 1; counting distinct letters instead of letters tied at the top count; and writing a heap simulation that decrements the cooldown at the wrong moment, so that the gap between two copies is one slot too short or too long.</p>`,
    },
    trace: {
      caption: 'tasks = ["A","A","A","B","B","B"], n = 2: build the frame from the busiest letters',
      head: ["step", "quantity", "value", "meaning"],
      rows: [
        ["1", "counts", "A=3, B=3", "frequency table"],
        ["2", "f (max count)", "3", "busiest letter's runs"],
        ["3", "tied", "2", "letters with count f"],
        ["4", "full frames", "f - 1 = 2", "frames before last row"],
        ["5", "frame width", "n + 1 = 3", "one run plus cooldown"],
        ["6", "frame slots", "2 x 3 = 6", "slots in full frames"],
        ["7", "last row", "tied = 2", "A and B end the plan"],
        ["8", "frame bound", "6 + 2 = 8", "forced by busiest"],
        ["9", "task count", "6", "needed even with no idle"],
        ["10", "answer", "max(8, 6) = 8", "larger bound wins"],
      ],
    },
    complexity: { time: "O(T)", space: "O(1) extra", brute: "O(T!)" },
    solution: {
      entry: "leastInterval",
      code: `function leastInterval(tasks, n) {
  const counts = new Map();
  for (const task of tasks) {
    counts.set(task, (counts.get(task) || 0) + 1);
  }

  let maxFrequency = 0;
  for (const count of counts.values()) {
    maxFrequency = Math.max(maxFrequency, count);
  }

  let tiedForMax = 0;
  for (const count of counts.values()) {
    if (count === maxFrequency) tiedForMax++;
  }

  const framedLength = (maxFrequency - 1) * (n + 1) + tiedForMax;
  return Math.max(tasks.length, framedLength);
}`,
      cases: [
        { args: [["A", "A", "A", "B", "B", "B"], 2], expected: 8 },
        { args: [[], 3], expected: 0 },
        { args: [["A", "A", "A", "B", "B", "B"], 0], expected: 6 },
        { args: [["A", "B", "C"], 5], expected: 3 },
        { args: [["A"], 4], expected: 1 },
        { args: [["A", "A", "A", "A", "A", "A", "B", "C", "D", "E", "F", "G"], 2], expected: 16 },
        {
          args: [["A", "A", "A", "B", "B", "B", "C", "C", "C", "D", "D", "E"], 2],
          expected: 12,
        },
        { args: [["A", "A", "B"], 2], expected: 4 },
        { args: [["A", "A", "A", "B", "B", "B"], 3], expected: 10 },
        { args: [["A", "D", "C", "A", "C", "A", "B", "A", "C", "C", "D"], 2], expected: 11 },
      ],
    },
  },
];
