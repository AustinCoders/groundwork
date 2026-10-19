import type { DsaQuestion } from "./dsa-types";

export const questions: DsaQuestion[] = [
  {
    id: "google-merge-intervals",
    company: "google",
    title: "Merge Intervals",
    prompt:
      "You are given a list of closed intervals [start, end] in no particular order. Combine every group of intervals that overlap or touch, and return the combined intervals sorted by start. For example, [[8,10],[1,3],[2,6],[15,18]] becomes [[1,6],[8,10],[15,18]]. There can be up to 10,000 intervals, and the numbers are integers.",
    level: "L3",
    difficulty: "Medium",
    pattern: "Intervals, sorting",
    patternId: "intervals",
    leetcode: { number: 56, slug: "merge-intervals" },
    evidence: "several",
    sources: [
      {
        label: "Aced: a Google software engineer interview (L3)",
        url: "https://www.aced.io/experiences/google-software-engineer-interview-4c0584",
        kind: "candidate-report",
      },
      {
        label: "Company-tagged list: Google (LeetCode tag export)",
        url: "https://github.com/snehasishroy/leetcode-companywise-interview-questions/blob/master/google/all.csv",
        kind: "company-list",
        year: 2026,
      },
    ],
    chapters: ["dsa-intervals", "dsa-sorting-algorithms"],
    answer: {
      ask: `<p>First I would confirm what overlapping means. Do [1,4] and [4,5] merge because they share the point 4? I will assume yes, since the intervals are closed. Then: is the input sorted? Can it be empty? Can an interval be a single point like [3,3]? Can numbers be negative? Should I return a new list or edit the input? And how many intervals are there, to know whether an O(n²) approach could pass?</p>
<p>Assumptions I would state: closed intervals, start never greater than end, unsorted input, up to 10,000 intervals, an empty input returns an empty list, and the input is left unchanged.</p>`,
      brute: `<p>The obvious approach compares pairs. Take an interval, scan the rest for one that overlaps it, replace the two by their union, and start again. Stop when a full scan finds nothing to merge. It needs no sorting and is easy to get right.</p>
<p>The cost is the problem. One scan over all pairs is O(n²), and a merge can unlock new merges (a long interval can bridge two others that did not touch before), so you may need up to n scans. Worst case O(n³). At 10,000 intervals one scan is already 50 million pair checks and n³ is around a trillion. The waste is that every interval gets compared with far away intervals that can never touch it.</p>`,
      insight: `<p>The pattern is <b>sort, then sweep</b>. Sort the intervals by start. After that an interval can only reach the ones next to it in sorted order, so one left-to-right pass is enough.</p>
<p>Keep a list of merged blocks and look only at its last block, the one still growing. For the next interval in sorted order ask a single question: does its start fall at or before the end of that last block? If yes, they overlap or touch, so set the block's end to the larger of the two ends. The maximum matters, because the new interval can sit entirely inside the block. If no, there is a gap, so the new interval opens a fresh block.</p>
<p>Why is it correct? Because the starts are sorted, every interval not yet seen starts at or after the current one. If the current interval starts beyond the last block's end, then every later interval does too, so that block is finished for good and nothing can ever extend it. Only the newest block can still grow, so checking only the last block is not a shortcut. It is the only check there is. After each step the merged list is exactly the answer for the intervals seen so far.</p>
<p>Out loud: "Sort by start, then walk once. Either the next interval starts inside my current block, so I extend the end with a max, or it starts after it, so I close the block and open a new one. The sort costs O(n log n) and the walk costs O(n)."</p>`,
      walkthrough: `<p>Take [[8,10],[1,3],[2,6],[15,18]]. Sorting by start gives [1,3], [2,6], [8,10], [15,18]. The table follows the sweep.</p>
<p>The first interval has no block before it, so it opens [1,3]. Next is [2,6]: its start 2 is at most the block end 3, so they overlap and the end becomes max(3,6) = 6. Next is [8,10]: 8 is greater than 6, so there is a gap and a new block opens. Last is [15,18]: 15 is greater than 10, so another new block opens. Each interval is looked at once, and the only thing ever compared is its start against the end of the last block. The final column of the table is the answer.</p>`,
      edges: `<p><b>Empty input:</b> the loop never runs and the result is an empty list.</p>
<ul>
  <li><b>One interval:</b> it opens a block and nothing else happens.</li>
  <li><b>Touching intervals:</b> [1,4] and [4,5] merge because the test is start &lt;= end. If the problem used open intervals, the test would become a strict less-than.</li>
  <li><b>Nested intervals:</b> [1,10] with [2,3] keeps end 10 because of the max.</li>
  <li><b>Identical intervals:</b> the copy starts inside the block and changes nothing.</li>
  <li><b>Single points and negatives:</b> [3,3] and negative numbers work, since only comparisons are used.</li>
  <li><b>Caller's data:</b> the code copies each pair before sorting, so the input is not changed.</li>
</ul>`,
      followups: [
        "How would you insert one new interval into an already merged, sorted list in O(n) time?",
        "What changes if the input is already sorted by start, and what is the running time then?",
        "How would you list the gaps between the merged intervals, or count the most intervals that overlap at once?",
        "How would you answer 'is this point covered?' when intervals arrive one at a time?",
        "How would you merge intervals from a file too large to hold in memory?",
      ],
      slips: `<p>The classic mistake is skipping the sort, or calling <code>sort()</code> with no comparator. JavaScript then compares numbers as strings, so [10,12] lands before [2,3] and the sweep silently breaks.</p>
<ul>
  <li>Writing <code>last[1] = end</code> instead of the max, which shrinks a block when the new interval is nested.</li>
  <li>Using a strict less-than and failing to merge touching intervals.</li>
  <li>Comparing the new interval with the previous input interval instead of the last merged block.</li>
  <li>Pushing the original pair and then editing it, which changes the caller's input.</li>
  <li>Forgetting the empty input, so reading the last block of an empty list throws.</li>
</ul>`,
    },
    trace: {
      caption: "Sweep over the sorted intervals, comparing each start with the end of the last block.",
      head: ["Step", "Next interval", "Last block", "Decision", "Blocks so far"],
      rows: [
        ["1", "[1,3]", "none", "no block, open one", "[1,3]"],
        ["2", "[2,6]", "[1,3]", "2 <= 3, end becomes 6", "[1,6]"],
        ["3", "[8,10]", "[1,6]", "8 > 6, open new", "[1,6] [8,10]"],
        ["4", "[15,18]", "[8,10]", "15 > 10, open new", "[1,6] [8,10] [15,18]"],
      ],
    },
    complexity: { time: "O(n log n)", space: "O(n) for the copy and the result", brute: "O(n³)" },
    solution: {
      entry: "mergeIntervals",
      code: `function mergeIntervals(intervals) {
  const sorted = intervals
    .map((pair) => [pair[0], pair[1]])
    .sort((a, b) => a[0] - b[0]);
  const merged = [];

  for (const [start, end] of sorted) {
    const lastBlock = merged[merged.length - 1];
    if (lastBlock && start <= lastBlock[1]) {
      lastBlock[1] = Math.max(lastBlock[1], end);
    } else {
      merged.push([start, end]);
    }
  }

  return merged;
}`,
      cases: [
        {
          args: [
            [
              [8, 10],
              [1, 3],
              [2, 6],
              [15, 18],
            ],
          ],
          expected: [
            [1, 6],
            [8, 10],
            [15, 18],
          ],
        },
        { args: [[]], expected: [] },
        { args: [[[5, 7]]], expected: [[5, 7]] },
        {
          args: [
            [
              [1, 4],
              [4, 5],
            ],
          ],
          expected: [[1, 5]],
        },
        {
          args: [
            [
              [1, 2],
              [1, 2],
              [1, 2],
            ],
          ],
          expected: [[1, 2]],
        },
        {
          args: [
            [
              [1, 10],
              [2, 3],
              [4, 5],
              [6, 7],
            ],
          ],
          expected: [[1, 10]],
        },
        {
          args: [
            [
              [-5, -2],
              [-3, 1],
              [2, 3],
            ],
          ],
          expected: [
            [-5, 1],
            [2, 3],
          ],
        },
        {
          args: [
            [
              [3, 3],
              [1, 1],
              [2, 2],
            ],
          ],
          expected: [
            [1, 1],
            [2, 2],
            [3, 3],
          ],
        },
        {
          args: [
            [
              [2, 3],
              [4, 5],
              [6, 7],
              [1, 10],
            ],
          ],
          expected: [[1, 10]],
        },
        {
          args: [
            [
              [10, 12],
              [2, 3],
            ],
          ],
          expected: [
            [2, 3],
            [10, 12],
          ],
        },
        {
          args: [
            [
              [59, 61],
              [29, 34],
              [31, 33],
              [4, 9],
              [60, 65],
              [28, 34],
              [54, 60],
              [38, 39],
              [28, 30],
              [47, 53],
              [39, 44],
              [48, 52],
            ],
          ],
          expected: [
            [4, 9],
            [28, 34],
            [38, 44],
            [47, 53],
            [54, 65],
          ],
        },
      ],
    },
  },
  {
    id: "google-word-break-ii",
    company: "google",
    title: "Word Break II",
    prompt: `Given a string s and a list of dictionary words, put spaces into s to build every sentence in which each word comes from the dictionary. A word can be used any number of times. For example, s = "catsanddog" with the words cat, cats, and, sand, dog gives "cat sand dog" and "cats and dog". The string has up to 20 characters, and the dictionary has up to 1,000 words of length up to 10.`,
    level: "L3",
    difficulty: "Hard",
    pattern: "DP with memoised backtracking",
    patternId: "dp",
    leetcode: { number: 140, slug: "word-break-ii" },
    evidence: "several",
    sources: [
      {
        label: "Roundz: Google SDE L3 interview experience",
        url: "https://roundz.substack.com/p/interview-experience-100-google-sde-l3",
        kind: "candidate-report",
        year: 2025,
      },
      {
        label: "Company-tagged list: Google (LeetCode tag export)",
        url: "https://github.com/snehasishroy/leetcode-companywise-interview-questions/blob/master/google/all.csv",
        kind: "company-list",
        year: 2026,
      },
    ],
    chapters: ["dsa-backtracking", "dsa-dp-1d"],
    answer: {
      ask: `<p>I would ask: can a dictionary word be reused? (Yes, the prompt says so.) Does the dictionary contain duplicates? Can <code>s</code> be empty? What do I return when no sentence exists? In what order do you want the sentences? And how large can the output get? With 20 characters there are 19 gaps, and each gap either holds a space or not, so at most 2<sup>19</sup> sentences exist.</p>
<p>Assumptions I would state: <code>s</code> has at least one character, I treat the dictionary as a set, no valid split means an empty list, and I return the sentences sorted so the answer has one canonical order.</p>`,
      brute: `<p>The plain solution is backtracking. At each position try every dictionary word that matches there, move forward by its length, and recurse. When the end is reached, record the sentence. It is correct and short.</p>
<p>It has no memory. Many different prefixes lead to the same position, and each one re-solves the same suffix from scratch. Worse, it keeps doing this on suffixes that can never succeed. Take a string made of "cat" repeated many times and ending in "cow", with the words Cat, Ca and t: every way to split the repeated part is explored, only to find at the end that "cow" cannot be built, and the answer is empty. The number of explored paths doubles with each extra "cat", which is a lot of work for an empty answer. Work is spent on dead ends again and again.</p>`,
      insight: `<p>The pattern is <b>memoised backtracking</b>, which is top-down DP over the starting index of a suffix. Define <code>sentencesFrom(start)</code> as the list of every sentence that can be built from <code>s[start..]</code>. If <code>start</code> equals the length of <code>s</code>, there is exactly one sentence, the empty one. Otherwise try each end position: if <code>s[start..end)</code> is a dictionary word, put that word in front of every sentence from <code>sentencesFrom(end)</code>.</p>
<p>The key observation is that the answer for a suffix depends only on where it starts, never on how we got there. So there are only n + 1 different subproblems, and we cache each result in a map. A dead end is cached too, as an empty list, so a hopeless suffix is explored once instead of once per prefix that reaches it.</p>
<p>Why is it correct and free of duplicates? Every sentence has exactly one first word, and what remains is a sentence of the suffix after it. So grouping sentences by their first word splits the answer into disjoint parts with nothing missing. I also stop the end position at the longest dictionary word, so I never slice strings that are too long to match.</p>
<p>One honest caveat for the interviewer: the output itself can be exponential ("aaaa..." with the words a, aa and aaa has about 1.84<sup>n</sup> sentences, because each length can be written as a sum of 1s, 2s and 3s in many ways), so no algorithm can be polynomial in the worst case. Memoisation makes the cost proportional to what is built, not to the number of dead paths.</p>`,
      walkthrough: `<p>Take s = "catsanddog". The table lists the calls in the order they finish. From index 0 the word "cat" leads to index 3. From index 3 the word "sand" leads to index 7, and from 7 the word "dog" reaches the end, so index 7 stores the single sentence "dog". Index 3 then stores "sand dog", and index 0 gets its first sentence, "cat sand dog".</p>
<p>Back at index 0 the word "cats" leads to index 4. From 4 the word "and" leads to index 7, which is already in the cache, so no work is repeated: index 4 stores "and dog". Index 0 now holds the second sentence, "cats and dog". After sorting, the answer is "cat sand dog" followed by "cats and dog".</p>`,
      edges: `<p><b>No valid split:</b> for "catsandog" some indices store an empty list and the final answer is an empty list.</p>
<ul>
  <li><b>Word longer than the string:</b> the end position never goes past the string, so it is never tried.</li>
  <li><b>Empty dictionary:</b> the longest length is 0, the loop does not run, and the result is empty. Using <code>Math.max(0, ...)</code> avoids a result of negative infinity.</li>
  <li><b>Reused words:</b> nothing is removed from the dictionary, so "a a a" is allowed.</li>
  <li><b>Duplicate dictionary entries:</b> building a Set removes them, otherwise sentences would repeat.</li>
  <li><b>Whole string is one word:</b> the sentence is just that word, with no leading or trailing space.</li>
  <li><b>Huge output:</b> allowed, and unavoidable.</li>
</ul>`,
      followups: [
        "How would a yes-or-no Word Break check, run first, help you skip impossible inputs quickly?",
        "How would you only count the sentences instead of listing them, and what does it cost?",
        "How would a trie of the dictionary replace the slice-and-lookup step?",
        "How would you return only the sentence with the fewest words?",
        "What if each word has a cost and you want the cheapest sentence?",
      ],
      slips: `<p>The biggest slip is writing plain backtracking and calling it done. It passes the small example and then times out on a long repeated string whose last piece is not in the dictionary.</p>
<ul>
  <li>Caching only the successes, so dead-end suffixes are recomputed.</li>
  <li>Joining words with a space and leaving a stray space at the front or the end of a sentence.</li>
  <li>Pushing into a cached list that another call is still reading.</li>
  <li>Looping the end position past the longest word, which wastes time slicing.</li>
  <li>Answering with a boolean DP table from Word Break I, which tells you whether a split exists but not what the splits are.</li>
  <li>Forgetting that the result order is unspecified, so tests only pass after sorting.</li>
</ul>`,
    },
    trace: {
      caption: "Calls in the order they finish for s = catsanddog; index 7 is computed once and reused.",
      head: ["Step", "Start", "Word tried", "What happens", "Cached result"],
      rows: [
        ["1", "0", "cat", "recurse to index 3", "-"],
        ["2", "3", "sand", "recurse to index 7", "-"],
        ["3", "7", "dog", "reaches the end", "7: [dog]"],
        ["4", "3", "sand", "rest is dog", "3: [sand dog]"],
        ["5", "0", "cat", "rest is sand dog", "partial: cat sand dog"],
        ["6", "0", "cats", "recurse to index 4", "-"],
        ["7", "4", "and", "index 7 is in the cache", "4: [and dog]"],
        ["8", "0", "cats", "rest is and dog", "0: both sentences"],
      ],
    },
    complexity: {
      time: "O(n·L²) plus building and sorting the sentences; exponential in n at worst",
      space: "O(total size of the cached sentences); exponential in n at worst",
      brute: "O(2ⁿ) even when no answer exists",
    },
    solution: {
      entry: "wordBreak",
      code: `function wordBreak(s, wordDict) {
  const words = new Set(wordDict);
  const longest = Math.max(0, ...wordDict.map((word) => word.length));
  const cache = new Map();

  function sentencesFrom(start) {
    if (start === s.length) return [""];
    if (cache.has(start)) return cache.get(start);

    const sentences = [];
    const lastEnd = Math.min(s.length, start + longest);
    for (let end = start + 1; end <= lastEnd; end++) {
      const word = s.slice(start, end);
      if (!words.has(word)) continue;
      for (const rest of sentencesFrom(end)) {
        sentences.push(rest === "" ? word : word + " " + rest);
      }
    }

    cache.set(start, sentences);
    return sentences;
  }

  return sentencesFrom(0).sort();
}`,
      cases: [
        { args: ["catsanddog", ["cat", "cats", "and", "sand", "dog"]], expected: ["cat sand dog", "cats and dog"] },
        {
          args: ["pineapplepenapple", ["apple", "pen", "applepen", "pine", "pineapple"]],
          expected: ["pine apple pen apple", "pine applepen apple", "pineapple pen apple"],
        },
        { args: ["catsandog", ["cats", "dog", "sand", "and", "cat"]], expected: [] },
        { args: ["a", ["a"]], expected: ["a"] },
        { args: ["a", ["aaaa"]], expected: [] },
        { args: ["abc", []], expected: [] },
        { args: ["ab", ["a", "b", "ab"]], expected: ["a b", "ab"] },
        { args: ["aaa", ["a", "a", "aa"]], expected: ["a a a", "a aa", "aa a"] },
        {
          args: ["CatCatCatDog", ["Cat", "Ca", "t", "Dog"]],
          expected: [
            "Ca t Ca t Ca t Dog",
            "Ca t Ca t Cat Dog",
            "Ca t Cat Ca t Dog",
            "Ca t Cat Cat Dog",
            "Cat Ca t Ca t Dog",
            "Cat Ca t Cat Dog",
            "Cat Cat Ca t Dog",
            "Cat Cat Cat Dog",
          ],
        },
        { args: ["CatCatCatCatCatCow", ["Cat", "Ca", "t"]], expected: [] },
      ],
    },
  },
  {
    id: "google-players-and-trainers",
    company: "google",
    title: "Maximum Matching of Players With Trainers",
    prompt:
      "Each player has an ability and each trainer has a capacity. A trainer can train a player only when the capacity is at least the ability, and everyone can be in at most one pair, so return the largest number of pairs you can form. For example, players [4,7,9] and trainers [8,2,5,8] give 2. Each array holds up to 100,000 integers.",
    level: "L4",
    difficulty: "Medium",
    pattern: "Greedy, sort and two pointers",
    patternId: "greedy",
    leetcode: { number: 2410, slug: "maximum-matching-of-players-with-trainers" },
    evidence: "several",
    sources: [
      {
        label: "Roundz: Google software engineer L4 interview experience",
        url: "https://roundz.substack.com/p/interview-experience-google-software-engineer-l4",
        kind: "candidate-report",
        year: 2025,
      },
      {
        label: "Company-tagged list: Google (LeetCode tag export)",
        url: "https://github.com/snehasishroy/leetcode-companywise-interview-questions/blob/master/google/all.csv",
        kind: "company-list",
        year: 2026,
      },
    ],
    chapters: ["dsa-greedy", "dsa-two-pointers"],
    answer: {
      ask: `<p>I would ask: does "at least" mean equal values can be paired? (Yes.) Is each trainer limited to one player? Are the arrays sorted? Can either be empty? Are values large or negative? Do I return only the count, or also the pairs? Can I change the input arrays?</p>
<p>Assumptions I would state: equal ability and capacity can pair, one player per trainer and one trainer per player, unsorted input, either array may be empty (answer 0), I return the count only, and I will not modify the caller's arrays, so I work on sorted copies.</p>`,
      brute: `<p>The exhaustive approach tries every way to assign trainers to players: for each player, either skip them or pair them with any unused trainer that is strong enough, and keep the best count. It is correct, but exponential, roughly as many branches as there are partial matchings. It cannot handle even 30 players, never mind 100,000.</p>
<p>The tempting shortcut is first fit: go through the players in the given order and give each one the first unused trainer who can handle them. That is fast but wrong. With players [4,7] and trainers [8,5], player 4 grabs trainer 8, and player 7 is left with nobody, so the count is 1. Pairing 4 with 5 and 7 with 8 gives 2. A strong trainer was wasted on a weak player.</p>`,
      insight: `<p>The pattern is <b>greedy: sort both sides, then two pointers</b>. Sort players by ability and trainers by capacity, both ascending. Then compare the weakest unmatched player with the weakest unused trainer. If the trainer is strong enough, pair them. If not, that trainer is too weak for this player, and since this is the weakest player left, too weak for everyone, so throw the trainer away. Either way move the trainer pointer forward. The player pointer only moves when a pair is made, so its final value is the answer.</p>
<p>Why is the greedy choice safe? An exchange argument. Let w be the weakest player and t the weakest trainer who can handle w. Take any best solution. If w is paired with some trainer t2 (stronger than or equal to t), and t is paired with another player x, swap them: w goes with t, and x goes with t2. This is valid because t could handle x, and t2 is at least as strong as t. If t is unused, move w to t. If w is unpaired and t is paired with x, replace x by w. In every case the count does not drop, so some best solution contains the pair (w, t). Remove both and repeat on the smaller problem.</p>
<p>Out loud: "Weakest player gets the weakest trainer who can do the job. That never hurts, because the stronger trainers are worth more to the stronger players." Sorting is the dominant cost.</p>`,
      walkthrough: `<p>Sorted, the players are [4,7,9] and the trainers are [2,5,8,8]. The table shows each trainer in turn against the weakest waiting player.</p>
<p>Trainer 2 cannot handle player 4, so the trainer is dropped and the player keeps waiting. Trainer 5 can handle 4, so that is the first pair, and both pointers move. Trainer 8 against player 7 is a second pair. The last trainer, 8, faces player 9, who needs more than 8, so this trainer is dropped, and the trainers run out. The player pointer stopped at 2, so the answer is 2. Note that the player with ability 9 could not be paired by anyone here, since no trainer has capacity above 8.</p>`,
      edges: `<p><b>Either array empty:</b> the loop condition fails at once and the answer is 0.</p>
<ul>
  <li><b>Equal values:</b> the check uses less-than-or-equal, so ability 5 pairs with capacity 5.</li>
  <li><b>All trainers too weak:</b> the trainer pointer runs off the end with zero pairs.</li>
  <li><b>More players than trainers, or the reverse:</b> the loop stops when either side is exhausted.</li>
  <li><b>Duplicates:</b> each copy is a separate player or trainer and pairs on its own.</li>
  <li><b>Unsorted input:</b> sorting copies makes the order irrelevant and leaves the caller's arrays alone.</li>
  <li><b>Large values:</b> only comparisons are made, so there is no overflow.</li>
</ul>`,
      followups: [
        "What changes if each trainer can train two players?",
        "What if each pair earns a score and you want the highest total instead of the most pairs?",
        "Could you scan from the strongest player and strongest trainer instead, and would the answer stay the same?",
        "How would you avoid the sort if all abilities and capacities were small integers?",
        "How is this related to handing out cookies to children, or to assigning jobs to machines?",
      ],
      slips: `<p>The most common slip is first fit on the unsorted input, which wastes strong trainers on weak players and gives a wrong count.</p>
<ul>
  <li>Sorting only one of the two arrays.</li>
  <li>Calling <code>sort()</code> with no comparator, so numbers are compared as text and 10 sorts before 9.</li>
  <li>Using a strict less-than, which refuses equal pairs.</li>
  <li>Advancing both pointers every time, even on a failed comparison, which throws away a player who could still be matched.</li>
  <li>Giving the strongest trainer to the weakest player.</li>
  <li>Returning the trainer pointer instead of the player pointer.</li>
  <li>Sorting the caller's arrays in place without meaning to.</li>
</ul>`,
    },
    trace: {
      caption: "Players [4,7,9] against trainers [2,5,8,8], both sorted ascending.",
      head: ["Step", "Trainer", "Waiting player", "Decision", "Pairs so far"],
      rows: [
        ["1", "2", "4", "2 < 4, drop trainer", "0"],
        ["2", "5", "4", "5 >= 4, pair them", "1"],
        ["3", "8", "7", "8 >= 7, pair them", "2"],
        ["4", "8", "9", "8 < 9, drop trainer", "2"],
        ["5", "none left", "9", "trainers exhausted", "2"],
      ],
    },
    complexity: { time: "O(n log n + m log m)", space: "O(n + m) for the sorted copies", brute: "Exponential in n" },
    solution: {
      entry: "matchPlayersAndTrainers",
      code: `function matchPlayersAndTrainers(players, trainers) {
  const abilities = [...players].sort((a, b) => a - b);
  const capacities = [...trainers].sort((a, b) => a - b);

  let nextPlayer = 0;
  let nextTrainer = 0;
  while (nextPlayer < abilities.length && nextTrainer < capacities.length) {
    if (abilities[nextPlayer] <= capacities[nextTrainer]) {
      nextPlayer++;
    }
    nextTrainer++;
  }

  return nextPlayer;
}`,
      cases: [
        {
          args: [
            [4, 7, 9],
            [8, 2, 5, 8],
          ],
          expected: 2,
        },
        { args: [[], []], expected: 0 },
        { args: [[], [1]], expected: 0 },
        { args: [[1], []], expected: 0 },
        {
          args: [
            [5, 5, 5],
            [5, 5],
          ],
          expected: 2,
        },
        {
          args: [
            [1, 2, 3],
            [3, 3, 3],
          ],
          expected: 3,
        },
        { args: [[10], [1, 2, 9]], expected: 0 },
        {
          args: [
            [4, 7],
            [8, 5],
          ],
          expected: 2,
        },
        {
          args: [
            [9, 1],
            [1, 9],
          ],
          expected: 2,
        },
        {
          args: [
            [3, 1, 2],
            [2, 1, 3],
          ],
          expected: 3,
        },
        {
          args: [
            [10, 2, 7, 5, 16, 3, 6, 2, 13],
            [19, 7, 5, 1, 14, 17, 1, 12],
          ],
          expected: 6,
        },
      ],
    },
  },
  {
    id: "meta-vertical-order-traversal",
    company: "meta",
    title: "Binary Tree Vertical Order Traversal",
    prompt:
      "A binary tree of up to 10,000 nodes is given in level-order form, with null for a missing child. Give every node a column: the root is column 0, a left child sits one column left of its parent and a right child one column right. Return the values grouped by column from left to right, listing each column top to bottom and, within one row, left to right. For example, [3,9,20,null,null,15,7] gives [[9],[3,15],[20],[7]].",
    level: "E4 and E5",
    difficulty: "Medium",
    pattern: "Tree BFS with a hash map",
    patternId: "tree",
    leetcode: { number: 314, slug: "binary-tree-vertical-order-traversal" },
    evidence: "several",
    sources: [
      {
        label: "GeeksforGeeks: Meta interview experience",
        url: "https://www.geeksforgeeks.org/meta-interview-experience/",
        kind: "candidate-report",
      },
      {
        label: "Hello Interview: Meta E5 guide",
        url: "https://www.hellointerview.com/guides/meta/e5",
        kind: "prep-guide",
      },
      {
        label: "TechInterview.org: top coding problems by company",
        url: "https://www.techinterview.org/post/3233474385/coding-interview-top-50-most-asked-problems-by-company-google-amazon-meta-apple-microsoft-blind-75-neetcode-150/",
        kind: "company-list",
        year: 2026,
      },
      {
        label: "Company-tagged list: Meta (LeetCode tag export)",
        url: "https://github.com/snehasishroy/leetcode-companywise-interview-questions/blob/master/meta/all.csv",
        kind: "company-list",
        year: 2026,
      },
    ],
    chapters: ["dsa-trees", "dsa-hashing"],
    answer: {
      ask: `<p>I would ask: when two nodes share both a row and a column, what is the order? I will assume left to right, as they appear on the page, not sorted by value. Is the tree given as a level-order array with null for gaps? Can it be empty? Can values repeat or be negative? Do I return a list of lists, one per column? How many nodes are there, and how deep can the tree be?</p>
<p>Assumptions I would state: level-order input, an empty tree returns an empty list, values are arbitrary integers, up to 10,000 nodes, and the output has one list per column, left column first.</p>`,
      brute: `<p>The direct way is to walk the tree once to find the smallest and largest column, then for each column from left to right walk the whole tree again, in level order, collecting the nodes that sit in that column. It is simple and the order inside each column comes out right.</p>
<p>The cost is one full traversal per column. The number of columns can be as large as n, for example in a tree where every node has only a right child, so the total is O(n × width), which is O(n²) in the worst case. At 10,000 nodes that is 100 million node visits to produce 10,000 values. A second option, recording (column, depth, position) for every node and sorting, is O(n log n) and acceptable, but it needs extra bookkeeping to break ties. A single pass can do better.</p>`,
      insight: `<p>The pattern is <b>BFS with a hash map from column to list</b>. Run a level-order traversal and put each node's column number in the queue next to it: the root has 0, a left child gets parent - 1, a right child gets parent + 1. When a node is dequeued, append its value to the list for its column in a Map.</p>
<p>Why does this give the right order with no sorting? A level-order traversal visits nodes top to bottom, and inside one level, left to right. So when node X is dequeued, every node above it and every node on its row to its left has already been dequeued. Each column's list is therefore appended to in exactly the order the problem asks for. This is why BFS is the right tool. A depth-first walk would reach a deep node in some column before a shallower node of that column on a different branch, and the lists would come out in the wrong order.</p>
<p>The columns are also consecutive: a child's column differs from its parent's by exactly one, so there are no empty columns between the smallest and the largest. I track the minimum and maximum column while traversing, and at the end read the Map for each column from the minimum to the maximum. No sorting of keys is needed.</p>
<p>One implementation detail: I use an array as the queue with a moving head index, since <code>Array.prototype.shift</code> can cost O(n) per call. Map lookups are O(1) on average.</p>`,
      walkthrough: `<p>Take [3,9,20,null,null,15,7]. The root 3 has children 9 and 20; 20 has children 15 and 7. Breadth-first order is 3, 9, 20, 15, 7, and the table lists each visit.</p>
<p>The root goes into column 0. Node 9 is its left child, so column -1. Node 20 is its right child, column 1. Node 15 is the left child of 20, so column 1 - 1 = 0, and it is appended after 3 in column 0. Node 7 is the right child of 20, column 2. The range of columns seen grows from 0..0 to -1..2. Reading the map from column -1 to column 2 gives [9], [3,15], [20], [7], which is the answer.</p>`,
      edges: `<p><b>Empty tree:</b> an empty array, or one whose first entry is null, returns an empty list before any tree is built.</p>
<ul>
  <li><b>Single node:</b> one column holding one value.</li>
  <li><b>Right-only or left-only chains:</b> each node lands in a new column, so every list has one value, ordered by direction.</li>
  <li><b>Same row, same column:</b> a left subtree's right child and a right subtree's left child meet at the same column and row. BFS order puts the left one first.</li>
  <li><b>Null gaps in the input:</b> a null consumes one slot and gets no children, which is how level-order arrays work.</li>
  <li><b>Negative columns:</b> a Map takes negative keys without trouble.</li>
</ul>`,
      followups: [
        "What changes if nodes in the same row and column must be ordered by value instead of left to right?",
        "Can DFS solve it if you also store the depth of each node, and what does that cost?",
        "How would you print only the top view of the tree using the same column idea?",
        "Why does a BFS version avoid the recursion limit that a DFS version could hit on a deep tree?",
        "How would you adapt it to return the sum of each column instead of the values?",
      ],
      slips: `<p>The most common wrong answer is a DFS: it visits the whole left subtree first, so a deep left node can be appended to a column before a shallower node from the right branch, and the top-to-bottom order is broken.</p>
<ul>
  <li>Keying a plain object by column and expecting numeric order. Negative keys keep insertion order, not numeric order, so track min and max instead.</li>
  <li>Using <code>queue.shift()</code> in a loop, which can turn the traversal quadratic.</li>
  <li>Pushing null children into the queue and then reading a value from null.</li>
  <li>Sorting ties by value, which solves a different problem.</li>
  <li>Forgetting the empty tree.</li>
  <li>Building the tree wrongly from the array, for example by treating it as a heap with children at 2i + 1 and 2i + 2, which is not how nulls are encoded.</li>
</ul>`,
    },
    trace: {
      caption: "Breadth-first visits for [3,9,20,null,null,15,7], with each node's column.",
      head: ["Step", "Node", "Column", "Column list after", "Columns seen"],
      rows: [
        ["1", "3", "0", "0: [3]", "0 to 0"],
        ["2", "9", "-1", "-1: [9]", "-1 to 0"],
        ["3", "20", "1", "1: [20]", "-1 to 1"],
        ["4", "15", "0", "0: [3,15]", "-1 to 1"],
        ["5", "7", "2", "2: [7]", "-1 to 2"],
        ["6", "read out", "-1 to 2", "[[9],[3,15],[20],[7]]", "done"],
      ],
    },
    complexity: { time: "O(n) average, Map operations O(1)", space: "O(n)", brute: "O(n × width), O(n²) worst case" },
    solution: {
      entry: "verticalOrder",
      code: `function verticalOrder(values) {
  if (values.length === 0 || values[0] === null) return [];

  const columns = new Map();
  const queue = [[buildTree(values), 0]];
  let leftmost = 0;
  let rightmost = 0;

  for (let head = 0; head < queue.length; head++) {
    const [node, column] = queue[head];
    if (!columns.has(column)) columns.set(column, []);
    columns.get(column).push(node.val);
    leftmost = Math.min(leftmost, column);
    rightmost = Math.max(rightmost, column);
    if (node.left) queue.push([node.left, column - 1]);
    if (node.right) queue.push([node.right, column + 1]);
  }

  const result = [];
  for (let column = leftmost; column <= rightmost; column++) {
    result.push(columns.get(column));
  }
  return result;
}

function buildTree(values) {
  const root = { val: values[0], left: null, right: null };
  const waiting = [root];
  let next = 1;
  for (let head = 0; head < waiting.length && next < values.length; head++) {
    for (const side of ["left", "right"]) {
      if (next >= values.length) break;
      const value = values[next++];
      if (value === null) continue;
      waiting[head][side] = { val: value, left: null, right: null };
      waiting.push(waiting[head][side]);
    }
  }
  return root;
}`,
      cases: [
        { args: [[3, 9, 20, null, null, 15, 7]], expected: [[9], [3, 15], [20], [7]] },
        { args: [[]], expected: [] },
        { args: [[null]], expected: [] },
        { args: [[1]], expected: [[1]] },
        { args: [[1, null, 2, null, 3]], expected: [[1], [2], [3]] },
        { args: [[1, 2, null, 3]], expected: [[3], [2], [1]] },
        { args: [[3, 9, 8, 4, 0, 1, 7]], expected: [[4], [9], [3, 0, 1], [8], [7]] },
        { args: [[1, 2, 3, null, 4, 5]], expected: [[2], [1, 4, 5], [3]] },
        { args: [[5, 5, 5, 5, 5, 5, 5]], expected: [[5], [5], [5, 5, 5], [5], [5]] },
        {
          args: [[0, 8, 1, null, 9, 4, 2, null, null, null, null, 3, 5, null, null, 6, null, 7, null, 10, null, 11]],
          expected: [[8, 11], [0, 9, 4, 10], [1, 3, 7], [2, 6], [5]],
        },
      ],
    },
  },
  {
    id: "meta-subarray-sum-equals-k",
    company: "meta",
    title: "Subarray Sum Equals K",
    prompt:
      "Given an integer array nums and an integer k, count the contiguous, non-empty subarrays whose elements add up to exactly k. The array can contain negative numbers and zeros. For example, nums = [2,1,-1,1,2] and k = 3 gives 4. The array has up to 100,000 elements.",
    level: "E4 / L4",
    difficulty: "Medium",
    pattern: "Prefix sums with a hash map",
    patternId: "hash",
    leetcode: { number: 560, slug: "subarray-sum-equals-k" },
    evidence: "several",
    sources: [
      {
        label: "GeeksforGeeks: Meta E4/L4 Canada remote interview experience",
        url: "https://www.geeksforgeeks.org/interview-experiences/meta-interview-experience-e4l4-canada-remote-apr-2024offer/",
        kind: "candidate-report",
      },
      {
        label: "TechInterview.org: top coding problems by company",
        url: "https://www.techinterview.org/post/3233474385/coding-interview-top-50-most-asked-problems-by-company-google-amazon-meta-apple-microsoft-blind-75-neetcode-150/",
        kind: "company-list",
        year: 2026,
      },
      {
        label: "Company-tagged list: Meta (LeetCode tag export)",
        url: "https://github.com/snehasishroy/leetcode-companywise-interview-questions/blob/master/meta/all.csv",
        kind: "company-list",
        year: 2026,
      },
    ],
    chapters: ["dsa-prefix-sums", "dsa-hashing"],
    answer: {
      ask: `<p>I would ask: can the array hold negative numbers or zeros? (Yes, that matters a lot.) Is k allowed to be zero or negative? Do I count subarrays by position, so two equal subarrays at different places count twice? Can the array be empty? How large can n get, and how large can the count be?</p>
<p>Assumptions I would state: contiguous and non-empty subarrays, counted by position, any integer k, an empty array gives 0, n up to 100,000, so the count can reach about 5 billion. That fits exactly in a JavaScript number, but would need a 64-bit integer in Java or C++.</p>`,
      brute: `<p>The direct solution fixes the start of the subarray, extends the end one element at a time while keeping a running sum, and counts every time the sum equals k. That is two nested loops and O(1) work inside, so O(n²) time and O(1) space. It is correct for any input.</p>
<p>The trouble is the size. With n = 100,000 there are about n²/2 = 5 billion subarrays to look at, which takes far too long. A sliding window would be the natural way to avoid this, but it only works when the elements are non-negative: then growing the window can only raise the sum and shrinking it can only lower it. With negatives, extending the window can make the sum go down, so you cannot tell when to move the left edge, and the window method silently loses answers.</p>`,
      insight: `<p>The pattern is <b>prefix sums with a hash map of counts</b>. Let P[j] be the sum of the first j elements, with P[0] = 0. The subarray from index i up to j - 1 has sum P[j] - P[i]. We want that to equal k, which means P[i] = P[j] - k.</p>
<p>So walk the array once, keeping the running prefix. At each step, ask: how many earlier prefixes equal (current prefix - k)? Each such earlier prefix is the start of a subarray ending here with sum k. Add that number to the answer. Then record the current prefix in a Map from prefix value to how many times it has been seen.</p>
<p>Three details make it right. First, the map starts with {0: 1}, the empty prefix, so subarrays that begin at index 0 are counted. Second, the lookup happens before the current prefix is inserted, so a subarray is only paired with strictly earlier prefixes. This also stops k = 0 from counting an empty subarray. Third, the map stores counts, not just presence, because several different start positions can share the same prefix value (zeros and negatives make that common), and each one is a separate subarray.</p>
<p>Why does it work with negatives? Nothing here relies on the sums growing. It relies only on subtraction: each subarray corresponds to exactly one pair of prefixes (i, j) with i before j, so each subarray is counted exactly once. Out loud: "Count pairs of prefix sums that differ by k, in one pass with a map."</p>`,
      walkthrough: `<p>Take nums = [2,1,-1,1,2] and k = 3. The prefix sums are 2, 3, 2, 3, 5, and the map starts as {0:1}.</p>
<p>After 2: prefix 2, we look for -1, nothing. After 1: prefix 3, we look for 0, which is present once (the empty prefix), so the subarray [2,1] counts. After -1: prefix 2, look for -1, nothing. After 1: prefix 3, look for 0, found once, so [2,1,-1,1] counts. After 2: prefix 5, look for 2, which has been seen twice (after the first and third elements), so [1,-1,1,2] and [1,2] count. The total is 4. The table shows the map growing as it goes.</p>`,
      edges: `<p><b>Empty array:</b> the loop never runs, so the answer is 0.</p>
<ul>
  <li><b>k = 0:</b> with [0,0,0] the answer is 6, because the lookup happens before inserting the current prefix, so only non-empty subarrays are counted.</li>
  <li><b>Negative numbers:</b> handled, because only subtraction of prefixes is used.</li>
  <li><b>Negative k:</b> works the same, since the target prefix is just prefix - k.</li>
  <li><b>Whole array sums to k:</b> found through the seed {0: 1}.</li>
  <li><b>Repeated prefix values:</b> counts handle them, for example [1,-1,1,-1].</li>
  <li><b>Large answers:</b> at most n(n+1)/2, exact in a JavaScript number.</li>
</ul>`,
      followups: [
        "How would you return the length of the longest subarray with sum k instead of the count?",
        "If every number is positive, can you do it with a sliding window and O(1) extra space?",
        "How would you count subarrays whose sum is divisible by k?",
        "How does the same idea extend to counting submatrices with a given sum?",
        "What changes if the numbers arrive as a stream and you must report the count after every element?",
      ],
      slips: `<p>The classic slip is reaching for a sliding window or two pointers. It passes examples with only positive numbers and fails once negatives appear.</p>
<ul>
  <li>Forgetting the seed {0: 1}, which loses every subarray that starts at index 0.</li>
  <li>Inserting the current prefix before the lookup, which counts too many when k = 0.</li>
  <li>Using a Set or a "last index" map, so repeated prefix values are collapsed into one.</li>
  <li>Computing the sum of every pair of positions again, falling back to O(n²).</li>
</ul>`,
    },
    trace: {
      caption: "nums = [2,1,-1,1,2], k = 3: look up prefix - k, then record the prefix.",
      head: ["Step", "Value", "Prefix", "Hits (total)", "Map after (prefix:count)"],
      rows: [
        ["start", "-", "0", "0 (0)", "{0:1}"],
        ["1", "2", "2", "0 (0)", "{0:1,2:1}"],
        ["2", "1", "3", "1 (1)", "{0:1,2:1,3:1}"],
        ["3", "-1", "2", "0 (1)", "{0:1,2:2,3:1}"],
        ["4", "1", "3", "1 (2)", "{0:1,2:2,3:2}"],
        ["5", "2", "5", "2 (4)", "{0:1,2:2,3:2,5:1}"],
      ],
    },
    complexity: { time: "O(n) average, Map operations O(1)", space: "O(n) distinct prefix sums", brute: "O(n²)" },
    solution: {
      entry: "subarraySum",
      code: `function subarraySum(nums, k) {
  const seenCounts = new Map();
  seenCounts.set(0, 1);

  let prefix = 0;
  let total = 0;
  for (const value of nums) {
    prefix += value;
    const needed = prefix - k;
    if (seenCounts.has(needed)) {
      total += seenCounts.get(needed);
    }
    seenCounts.set(prefix, (seenCounts.get(prefix) || 0) + 1);
  }

  return total;
}`,
      cases: [
        { args: [[2, 1, -1, 1, 2], 3], expected: 4 },
        { args: [[], 0], expected: 0 },
        { args: [[1], 1], expected: 1 },
        { args: [[1], 0], expected: 0 },
        { args: [[1, 1, 1], 2], expected: 2 },
        { args: [[0, 0, 0], 0], expected: 6 },
        { args: [[-1, -1, 1], 0], expected: 1 },
        { args: [[1, -1, 0], 0], expected: 3 },
        { args: [[-1, -2, 3, -3], -3], expected: 3 },
        { args: [[3, -1, 3, 4, -2, 3, 4, 1, -3, 1, 2, 2, 1, 4, 3, 4], 3], expected: 10 },
      ],
    },
  },
  {
    id: "meta-lowest-common-ancestor",
    company: "meta",
    title: "Lowest Common Ancestor of a Binary Tree",
    prompt:
      "A binary tree is given in level-order form (null for a missing child) and all its values are different, and two values p and q are both in it. Return the value of the lowest node that has both p and q in its subtree, where a node counts as part of its own subtree. For example, with the tree [3,5,1,6,2,0,8,null,null,7,4], p = 6 and q = 4 give 5. The tree has up to 10,000 nodes.",
    level: "E4 / L4",
    difficulty: "Medium",
    pattern: "Tree recursion",
    patternId: "tree",
    leetcode: { number: 236, slug: "lowest-common-ancestor-of-a-binary-tree" },
    evidence: "several",
    sources: [
      {
        label: "GeeksforGeeks: Meta E4/L4 Canada remote interview experience",
        url: "https://www.geeksforgeeks.org/interview-experiences/meta-interview-experience-e4l4-canada-remote-apr-2024offer/",
        kind: "candidate-report",
      },
      {
        label: "TechInterview.org: top coding problems by company",
        url: "https://www.techinterview.org/post/3233474385/coding-interview-top-50-most-asked-problems-by-company-google-amazon-meta-apple-microsoft-blind-75-neetcode-150/",
        kind: "company-list",
        year: 2026,
      },
      {
        label: "Company-tagged list: Meta (LeetCode tag export)",
        url: "https://github.com/snehasishroy/leetcode-companywise-interview-questions/blob/master/meta/all.csv",
        kind: "company-list",
        year: 2026,
      },
    ],
    chapters: ["dsa-trees", "dsa-tree-problems"],
    answer: {
      ask: `<p>I would ask: is it a plain binary tree or a search tree? (Plain, so ordering tricks do not apply.) Are the values unique? Are p and q guaranteed to be in the tree? Can p equal q? Can one be an ancestor of the other, and does a node count as its own ancestor? Are there parent pointers? How deep can the tree get?</p>
<p>Assumptions I would state: plain binary tree, unique values, both values present, a node is allowed to be its own ancestor (so if p is above q, the answer is p), no parent pointers, and the tree arrives as a level-order array, which I turn into nodes first.</p>`,
      brute: `<p>The naive solution tests every node: for each one, search its subtree for p and for q, and keep the deepest node whose subtree contains both. It is easy to reason about and needs nothing but a basic search.</p>
<p>It repeats the same searches again and again. Each check costs O(size of the subtree), and on a chain of 10,000 nodes the subtree sizes are 10,000, 9,999, 9,998 and so on, around 50 million steps in total, so O(n²). A better middle step is to find the root-to-p path and the root-to-q path, each in O(n), and walk them together until they differ. That is O(n) time and O(h) space and is a perfectly good answer. The one-pass recursion below gets the same cost without building and comparing paths.</p>`,
      insight: `<p>The pattern is <b>tree recursion that combines the answers of the two children</b> (a post-order). Write a function that returns what it found in a subtree: the node itself if it is p or q, otherwise whatever the left and right calls return, merged.</p>
<p>The rules are short. If the node is null, return null. If the node is p or q, return it at once, without looking further down. Otherwise search both children. If both searches return something, then p and q are in different child subtrees, so this node is the lowest one that has both: return it. If only one search returns something, pass that result up unchanged. If neither does, return null.</p>
<p>Why is it correct? A call returns non-null only if its subtree contains p or q. Take the lowest node that has both in its subtree. Both targets are in its subtree but not both in the same child, because otherwise a lower node would qualify. So either they sit in different children, which is the "both children reported" case, or one of them is the node itself. In the second case we return the node immediately when we reach it, and the other target is below it, so no other node ever sees two separate reports and the early return is correct. Nodes above the answer only ever receive one report and pass it up, so the answer reaches the root.</p>
<p>Out loud: "Each subtree reports whether it found p or q. The first node that hears from both sides is the answer." This relies on both values being in the tree. If q were missing, the code would return p as the answer.</p>`,
      walkthrough: `<p>Take the tree [3,5,1,6,2,0,8,null,null,7,4] with p = 6 and q = 4. The table lists nodes in the order their calls finish.</p>
<p>Node 6 is p, so it returns itself straight away. Node 7 has no children and is neither target, so it returns null. Node 4 is q and returns itself. Node 2 gets null from its left child (7) and 4 from its right, so it passes 4 up. Node 5 now gets 6 from its left and 4 from its right: both sides reported, so 5 is the answer and it returns itself. Nodes 0, 8 and 1 find nothing and return null. The root 3 hears 5 from the left and null from the right, so it passes 5 up. The final result is 5.</p>`,
      edges: `<p><b>p is an ancestor of q:</b> the search stops at p and returns it, which is correct since a node counts as its own descendant.</p>
<ul>
  <li><b>p equals q:</b> the first match is returned, which is that node.</li>
  <li><b>Single node:</b> the root is both values, and the answer is the root.</li>
  <li><b>Answer is the root:</b> p and q are on different sides of it.</li>
  <li><b>Value 0 or negative values:</b> the code compares node objects, never the truthiness of a value, so a value of 0 is safe.</li>
  <li><b>Very deep trees:</b> recursion depth equals the height, which can be n for a chain. For huge chains use an iterative version with parent links.</li>
  <li><b>One target missing:</b> not supported, and it would return the one that exists.</li>
</ul>`,
      followups: [
        "How does the answer get simpler if the tree is a binary search tree?",
        "How would you detect that p or q is missing from the tree?",
        "How would you answer thousands of such queries on the same tree quickly?",
        "What if every node has a parent pointer but you are not given the root?",
        "How would you rewrite it iteratively to avoid deep recursion?",
      ],
      slips: `<p>The classic slip is using the binary search tree shortcut, going left when both values are smaller and right when both are larger. That only works in a search tree, and this tree has no ordering.</p>
<ul>
  <li>Returning null when only one side finds something, which throws away the found node.</li>
  <li>Ignoring the current node when it is p or q and looking only at its children, so a target that is an ancestor of the other is lost.</li>
  <li>Testing the truthiness of a value (so a value of 0 looks like "not found") instead of testing the node.</li>
  <li>Forgetting that a node is its own ancestor, and answering with its parent.</li>
  <li>Building the tree wrongly from the array.</li>
  <li>Doing a separate full search for p and q at every node, which is quadratic.</li>
</ul>`,
    },
    trace: {
      caption: "Post-order results for p = 6, q = 4 in the tree [3,5,1,6,2,0,8,null,null,7,4].",
      head: ["Step", "Node", "Left result", "Right result", "Returns"],
      rows: [
        ["1", "6", "-", "-", "6 (is p)"],
        ["2", "7", "null", "null", "null"],
        ["3", "4", "-", "-", "4 (is q)"],
        ["4", "2", "null", "4", "4"],
        ["5", "5", "6", "4", "5 (both sides)"],
        ["6", "0", "null", "null", "null"],
        ["7", "8", "null", "null", "null"],
        ["8", "1", "null", "null", "null"],
        ["9", "3", "5", "null", "5"],
      ],
    },
    complexity: { time: "O(n)", space: "O(h) call stack, h is the height", brute: "O(n²)" },
    solution: {
      entry: "lowestCommonAncestor",
      code: `function lowestCommonAncestor(values, p, q) {
  if (values.length === 0 || values[0] === null) return null;
  const found = findAncestor(buildTree(values), p, q);
  return found === null ? null : found.val;
}

function findAncestor(node, p, q) {
  if (node === null || node.val === p || node.val === q) return node;

  const fromLeft = findAncestor(node.left, p, q);
  const fromRight = findAncestor(node.right, p, q);
  if (fromLeft !== null && fromRight !== null) return node;
  return fromLeft !== null ? fromLeft : fromRight;
}

function buildTree(values) {
  const root = { val: values[0], left: null, right: null };
  const waiting = [root];
  let next = 1;
  for (let head = 0; head < waiting.length && next < values.length; head++) {
    for (const side of ["left", "right"]) {
      if (next >= values.length) break;
      const value = values[next++];
      if (value === null) continue;
      waiting[head][side] = { val: value, left: null, right: null };
      waiting.push(waiting[head][side]);
    }
  }
  return root;
}`,
      cases: [
        { args: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 6, 4], expected: 5 },
        { args: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 5, 1], expected: 3 },
        { args: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 5, 4], expected: 5 },
        { args: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 7, 4], expected: 2 },
        { args: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 6, 8], expected: 3 },
        { args: [[1], 1, 1], expected: 1 },
        { args: [[1, 2], 1, 2], expected: 1 },
        { args: [[1, 2, null, 3], 3, 2], expected: 2 },
        { args: [[0, -1, -2], -1, -2], expected: 0 },
        {
          args: [
            [
              0,
              1,
              2,
              3,
              4,
              8,
              null,
              6,
              10,
              null,
              5,
              null,
              null,
              null,
              7,
              null,
              11,
              9,
              null,
              null,
              null,
              null,
              null,
              null,
              12,
            ],
            9,
            11,
          ],
          expected: 1,
        },
      ],
    },
  },
];
