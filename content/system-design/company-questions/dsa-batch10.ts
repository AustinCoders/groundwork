import type { DsaQuestion } from "./dsa-types";

export const questions: DsaQuestion[] = [
  {
    id: "cred-wildcard-pattern-matching",
    company: "cred",
    title: "Wildcard pattern matching with ? and *",
    prompt:
      "Given a text and a pattern, decide whether the pattern matches the entire text. In the pattern, ? stands for exactly one character, * stands for any run of characters including the empty run, and every other character matches only itself. For example, the text adceb matches the pattern *a*b, while the text acdcb does not match a*c?b. Both strings can be a few thousand characters long. A candidate report lists it among the problems of a long online coding round for an intern role.",
    level: "SDE intern (off-campus)",
    difficulty: "Hard",
    pattern: "Prefix table DP, rolled to one row",
    patternId: "dp",
    leetcode: { number: 44, slug: "wildcard-matching" },
    evidence: "one",
    sources: [
      {
        label: "CRED SDE intern interview experience, rounds dated Jun-Aug 2022 (Naukri Code360)",
        url: "https://www.naukri.com/code360/interview-experiences/cred/interview-experience-by-anubhav-mishra-off-campus-jun-2022",
        kind: "candidate-report",
        year: 2022,
      },
    ],
    chapters: ["dsa-dp-2d", "dsa-dp-1d"],
    answer: {
      ask: `<p>Before coding I would pin down the contract. Does ? match exactly one character and * any run including the empty run, as in shell globbing? Is the match against the whole text, not a substring? Can either string be empty, and are the characters limited to lowercase letters or can they be anything? Is there an escape for a literal ? or *, and how long can the strings get?</p>
<p>The report gives only the title, so I solve the standard contract: the whole text must match, ? is one character, * is zero or more characters, there are no escapes, comparison is case sensitive, and both strings may be empty and a few thousand characters long.</p>`,
      brute: `<p>The direct approach is recursion on two positions, i in the text and j in the pattern. An ordinary pattern character or ? must match the text character at i, and then both positions advance. A * can swallow any number of characters, so the recursion tries every length: swallow nothing, one character, two, and so on up to the end of the text.</p>
<p>Without memory this is exponential. Each star multiplies the work by the number of positions it can take, so a pattern with k stars costs about O(n^k) calls on a text of length n, and a text of 2,000 letters against *a*a*a*a*b is hopeless. The recursion also solves the same pair (i, j) many times over, which is the sign that a table will fix it.</p>`,
      insight: `<p>The pattern is <b>dynamic programming over prefixes</b>. Let dp[i][j] be true when the first i characters of the text are matched exactly by the first j characters of the pattern. The answer is dp[n][m], and every cell depends only on cells with smaller indices.</p>
<p>The base row is dp[0][0] = true, and dp[0][j] is true only while the pattern prefix is all stars, because only a star can match the empty text. For i above 0, dp[i][0] is false, since an empty pattern matches only an empty text. For an ordinary character or ?, dp[i][j] is true when dp[i-1][j-1] is true and the pattern character is ? or equals text[i-1]. For a star there are two ways to be right: the star matches nothing, so dp[i][j-1] must hold, or the star swallows text[i-1] and stays available for more, so dp[i-1][j] must hold. Either one is enough.</p>
<p>The second star rule is the whole trick. It never loops over run lengths: dp[i-1][j] already says that the star has matched some run ending at i-1, and extending that run by one character costs one step. That turns the exponential search into n times m cell updates.</p>
<p>Row i reads only row i-1 and earlier cells of its own row, so two rows are enough and the space drops to O(m). Out loud: "prefix table, a star is either empty or eats one more character, keep two rows."</p>`,
      walkthrough: `<p>Take the text adceb and the pattern *a*b. The columns of each row are the pattern prefixes of length 0 to 4: empty, *, *a, *a*, *a*b. Row 0 is TTFFF because the empty text matches the empty pattern and the pattern *, and nothing longer.</p>
<p>After reading a, the star can swallow it (column 1) and *a matches it (column 2), and the second star can then match nothing (column 3), giving FTTTF. Reading d turns column 2 off, since a does not match d, but column 3 stays on because the second star swallows d. The rows for c and e look the same for the same reason. The last character b is matched by the final b of the pattern, and column 3 of the previous row was true, so the last cell is true and the whole text matches.</p>`,
      edges: `<p>An empty text matches only a pattern made of stars, including the empty pattern, and the base row handles that. An empty pattern with a non-empty text is false, because the first cell of every later row is false. Runs of consecutive stars behave like one star, since the second star can always match nothing.</p>
<ul>
  <li><b>Text longer than the pattern, no star:</b> the table ends false, with no special case.</li>
  <li><b>? against the empty text:</b> false, because it needs one character.</li>
  <li><b>Star at either end:</b> works through the empty-match rule and the swallow rule.</li>
  <li><b>Case:</b> comparison is by exact character, so a and A differ.</li>
  <li><b>Special-looking characters:</b> only ? and * in the pattern are wildcards, and in the text they are ordinary characters.</li>
</ul>`,
      followups: [
        "Can you do it in constant extra space, and what is the worst-case time of that version?",
        "How does this differ from regular expression matching, where a star repeats the previous element?",
        "How would you report which part of the text each star consumed?",
        "How would you match one pattern against millions of short texts?",
        "What changes if the pattern may contain an escape character for a literal ? or *?",
      ],
      slips: `<p>The commonest slip is the base row: setting dp[0][j] false for every j, which breaks patterns that start with a star and the empty text against *. The next is treating * like a regular expression star that repeats the previous character; here it stands alone and matches any characters.</p>
<p>Others: leaving out the empty-match rule dp[i][j-1], which fails a*b against ab; confusing dp[i-1][j] (the star swallows a character) with dp[i-1][j-1] (a one-to-one match); forgetting that the first cell of every row below row 0 must be false when rows are rolled, so a reused array leaks a stale true; matching a prefix of the text instead of all of it; and writing the plain recursion without a table, which times out on a few stars.</p>`,
    },
    trace: {
      caption: "Text adceb against pattern *a*b. Each row lists dp for pattern prefixes of length 0 to 4.",
      head: ["Text read", "Row for j = 0 to 4", "Last cell"],
      rows: [
        ["(nothing yet)", "TTFFF", "F"],
        ["a", "FTTTF", "F"],
        ["ad", "FTFTF", "F"],
        ["adc", "FTFTF", "F"],
        ["adce", "FTFTF", "F"],
        ["adceb", "FTFTT", "T"],
      ],
    },
    complexity: {
      time: "O(n * m) for text length n and pattern length m",
      space: "O(m) using two rows",
      brute: "O(n^k) for a pattern with k stars, exponential in general",
    },
    solution: {
      entry: "isMatch",
      code: `function isMatch(text, pattern) {
  const n = pattern.length;
  let row = new Array(n + 1).fill(false);
  row[0] = true;
  for (let j = 1; j <= n; j++) row[j] = row[j - 1] && pattern[j - 1] === "*";
  for (let i = 1; i <= text.length; i++) {
    const next = new Array(n + 1).fill(false);
    for (let j = 1; j <= n; j++) {
      const p = pattern[j - 1];
      if (p === "*") next[j] = next[j - 1] || row[j];
      else next[j] = row[j - 1] && (p === "?" || p === text[i - 1]);
    }
    row = next;
  }
  return row[n];
}`,
      cases: [
        { args: ["adceb", "*a*b"], expected: true },
        { args: ["acdcb", "a*c?b"], expected: false },
        { args: ["", ""], expected: true },
        { args: ["", "*"], expected: true },
        { args: ["", "***"], expected: true },
        { args: ["", "?"], expected: false },
        { args: ["abc", ""], expected: false },
        { args: ["aa", "a"], expected: false },
        { args: ["aa", "*"], expected: true },
        { args: ["cb", "?a"], expected: false },
        { args: ["mississippi", "m??*ss*?i*pi"], expected: false },
        { args: ["mississippi", "m*iss*i?pi"], expected: true },
        { args: ["abcabczzzde", "*abc???de*"], expected: true },
        { args: ["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "*a*a*a*a*b"], expected: false },
        { args: ["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "*a*a*a*a*"], expected: true },
        { args: ["ab", "a*b"], expected: true },
        { args: ["abcd", "*?"], expected: true },
        { args: ["abc", "*?*?*?*"], expected: true },
        { args: ["abc", "*?*?*?*?"], expected: false },
        { args: ["b", "?*?"], expected: false },
        { args: ["ae", "a*?e"], expected: false },
      ],
    },
  },
  {
    id: "cred-minimize-cash-flow",
    company: "cred",
    title: "Settle group expenses with the fewest payments",
    prompt:
      "A group has recorded who handed money to whom: each record [from, to, amount] says that person from handed a positive whole amount to person to, so the receiver owes it back. Find the smallest number of payments that settles everyone, where a payment may move any amount between any two people. For example, the records [[0,1,10],[2,0,5]] mean person 1 owes 10 to person 0 and person 0 owes 5 to person 2, so the best settlement takes 2 payments: person 1 pays 5 to person 0 and 5 to person 2. A candidate report lists it as a face-to-face design question, minimising the give and take in an app like Splitwise, where each user adds what they spend and it is shared equally. This version takes the debts as who-owes-whom records, the usual form of the problem. Assume at most about a dozen people end up with a non-zero balance.",
    level: "Software Engineer (campus)",
    difficulty: "Hard",
    pattern: "Backtracking over net balances",
    patternId: "backtrack",
    leetcode: { number: 465, slug: "optimal-account-balancing" },
    evidence: "one",
    sources: [
      {
        label: "CRED Software Engineer interview experience, Mar 2022 (Naukri Code360)",
        url: "https://www.naukri.com/code360/interview-experiences/cred/interview-experience-by-uttam-kumar-mar-2022-exp-0-2-years",
        kind: "candidate-report",
        year: 2022,
      },
    ],
    chapters: ["dsa-advanced-backtracking", "dsa-backtracking"],
    answer: {
      ask: `<p>I would ask what a record means and what a payment may look like. Is [from, to, amount] a loan from the first person to the second? Are amounts whole numbers, such as paise, so that balances cancel exactly? May a settling payment go between any two people, or only between people who already have a record? Is the output the count of payments or the payments themselves? And how many people are involved, since the search I have in mind is exponential?</p>
<p>My assumptions: each record means from handed amount to to, amounts are positive integers, any person may pay any other, I return the minimum count, and at most about a dozen people have a non-zero balance. The report describes bills shared equally in a Splitwise-like app; I would first turn each bill into records, one per non-paying member who owes the payer a share, and then solve the records form. Listing the payments is a small extension.</p>`,
      brute: `<p>The first idea is to settle the records as they are, one repayment per record in the opposite direction. That is correct but wasteful, because records between the same people cancel and chains collapse. A person who lent 10 and borrowed 10 should not appear at all.</p>
<p>The honest brute force first reduces to net balances and then tries every order of settling: pick an unsettled person, try every person of the opposite sign as the counterparty, move the balance, and recurse. With n non-zero balances that is on the order of (n-1)! paths, and it keeps re-exploring states that differ only in which equal-valued person was chosen. A tempting shortcut, always matching the largest debtor with the largest creditor, is fast but not optimal, as the slips section shows.</p>`,
      insight: `<p>The pattern is <b>backtracking on net balances</b>, after one reduction that does most of the thinking. Only each person's net position matters: add the amount received and subtract the amount given. Drop everyone at zero. A positive balance means the person owes the group, a negative one means the group owes them, and all balances sum to zero.</p>
<p>Now count payments cleverly. Any valid set of payments connects the people with non-zero balances into groups, and a connected group of g people needs at least g-1 payments. Each group must sum to zero, since money only moves inside it, and bringing a person with a zero balance into a group only adds payments. So the number of payments is at least n minus the number of groups, and a zero-sum group of g people can always be settled in exactly g-1 payments by clearing one person at a time. The problem is therefore: split the balances into as many zero-sum groups as possible.</p>
<p>The search does that implicitly. Take the first unsettled person and try every person with the opposite sign: one payment moves the first person's whole balance onto that counterparty, which clears the first person and leaves the counterparty with the sum. Recurse on the rest and keep the minimum. Two pruning rules keep it small. If two candidates have the same balance, trying the second repeats the first, so skip it. If a candidate exactly cancels the first person, take it and stop: pairing them as a group of their own never reduces the number of zero-sum groups. The balances are changed before each recursive call and restored after it.</p>
<p>Out loud: "net the balances, then minimise payments by backtracking over who absorbs the first person's balance, with the duplicate and exact-cancel pruning rules. The worst case is exponential, which is fine for a dozen people."</p>`,
      walkthrough: `<p>Take the records [[0,2,3],[1,3,3],[0,4,2]]. Person 0 handed out 5 in total, so the balance is -5. Person 2 received 3, person 1 handed out 3, person 3 received 3 and person 4 received 2. In order of first appearance the balances are -5, 3, -3, 3 and 2, which sum to zero.</p>
<p>Step 1 merges the -5 into the first 3, which becomes -2; the same merge with the second 3 is skipped because it would repeat the work. Step 2 pairs the -2 with the next 3, leaving 1, step 3 pairs the -3 with that 1, leaving -2, and step 4 pairs the -2 with the 2, so everything is zero after 4 payments. Step 5 backtracks and tries the -3 against the 2, and step 6 finishes again with 4 payments. Step 7 instead pairs the -2 with the 2, an exact cancellation, leaving -3 and 3, and step 8 cancels those: 3 payments. Steps 9 to 11 try the -5 against the 2 and reach 3 again. The minimum is 3, from the groups {-5, 3, 2} and {-3, 3}.</p>`,
      edges: `<p>No records, or records that cancel out exactly, leave no non-zero balance and the answer is 0 without entering the search. A record from a person to themselves changes nothing. Two people with opposite balances need one payment, and k people who all owe one person need k payments, because no subset of them sums to zero.</p>
<ul>
  <li><b>One big group:</b> n non-zero balances with no zero-sum subset need n-1 payments.</li>
  <li><b>Independent groups:</b> they are found by the exact-cancel and search steps and their costs add up.</li>
  <li><b>Repeated equal balances:</b> the tried-set skips equal partners, which matters for speed and not for correctness.</li>
  <li><b>Fractions:</b> floating point amounts would make exact cancellation fail, so keep integer amounts such as paise.</li>
  <li><b>Person ids:</b> any value usable as a map key works, numbers or names.</li>
</ul>`,
      followups: [
        "Can you beat factorial time, for example with a bitmask over subsets of people?",
        "How would you output the actual payments, meaning who pays whom and how much?",
        "Why is the exact-cancel shortcut safe, and can you prove it?",
        "How would you handle cents and rounding when a bill is split three ways?",
        "Is the problem hard in general, and what would you do for a group of fifty people?",
      ],
      slips: `<p>The classic wrong answer is the greedy that always settles the largest debtor with the largest creditor. With balances 5, 4, 1, -4, -3 and -3 it can take 5 payments, while pairing 4 with -4 and settling the other four people together takes 4. Greedy gives at most n-1 payments but not the minimum.</p>
<p>Other slips: settling per record instead of per net balance; forgetting to undo the change after the recursive call, so later branches see corrupted balances; not skipping people already at zero, which counts payments that do not exist; breaking out of the loop after a match that is not exact; and using floating point amounts, where balances that should cancel differ by a rounding error.</p>`,
    },
    trace: {
      caption: "Balances -5, 3, -3, 3, 2 from the records [[0,2,3],[1,3,3],[0,4,2]]. Each row is one payment tried.",
      head: ["Step", "Settles", "With", "Left to settle", "Payments"],
      rows: [
        ["1", "-5", "3", "-2, -3, 3, 2", "1"],
        ["2", "-2", "3", "-3, 1, 2", "2"],
        ["3", "-3", "1", "-2, 2", "3"],
        ["4", "-2", "2", "all zero", "4"],
        ["5", "-3", "2", "1, -1", "3"],
        ["6", "1", "-1", "all zero", "4"],
        ["7", "-2", "2", "-3, 3, 0", "2"],
        ["8", "-3", "3", "all zero", "3"],
        ["9", "-5", "2", "3, -3, 3, -3", "1"],
        ["10", "3", "-3", "0, 3, -3", "2"],
        ["11", "3", "-3", "all zero", "3"],
      ],
    },
    complexity: {
      time: "O((n-1)!) worst case for n non-zero balances, far less after pruning",
      space: "O(n) for the balances and the recursion",
      brute: "O(n!) orderings of payments with no pruning",
    },
    solution: {
      entry: "minTransfers",
      code: `function minTransfers(transactions) {
  const net = new Map();
  for (const [from, to, amount] of transactions) {
    net.set(from, (net.get(from) ?? 0) - amount);
    net.set(to, (net.get(to) ?? 0) + amount);
  }
  const debts = [...net.values()].filter((value) => value !== 0);
  function settle(start) {
    while (start < debts.length && debts[start] === 0) start++;
    if (start === debts.length) return 0;
    let best = Infinity;
    const tried = new Set();
    for (let j = start + 1; j < debts.length; j++) {
      if (debts[j] * debts[start] >= 0 || tried.has(debts[j])) continue;
      tried.add(debts[j]);
      debts[j] += debts[start];
      best = Math.min(best, 1 + settle(start + 1));
      debts[j] -= debts[start];
      if (debts[j] + debts[start] === 0) break;
    }
    return best;
  }
  return settle(0);
}`,
      cases: [
        {
          args: [
            [
              [0, 1, 10],
              [2, 0, 5],
            ],
          ],
          expected: 2,
        },
        {
          args: [
            [
              [0, 1, 10],
              [1, 0, 1],
              [1, 2, 5],
              [2, 0, 5],
            ],
          ],
          expected: 1,
        },
        { args: [[]], expected: 0 },
        {
          args: [
            [
              [0, 1, 5],
              [1, 0, 5],
            ],
          ],
          expected: 0,
        },
        { args: [[[3, 3, 7]]], expected: 0 },
        {
          args: [
            [
              [1, 2, 4],
              [2, 3, 4],
              [3, 4, 4],
            ],
          ],
          expected: 1,
        },
        {
          args: [
            [
              [0, 3, 2],
              [1, 3, 2],
              [2, 3, 2],
            ],
          ],
          expected: 3,
        },
        {
          args: [
            [
              [0, 1, 3],
              [2, 3, 5],
            ],
          ],
          expected: 2,
        },
        {
          args: [
            [
              [0, 2, 3],
              [1, 3, 3],
              [0, 4, 2],
            ],
          ],
          expected: 3,
        },
        {
          args: [
            [
              ["asha", "ravi", 4],
              ["ravi", "meera", 4],
              ["meera", "asha", 1],
            ],
          ],
          expected: 1,
        },
        {
          args: [
            [
              [100, 0, 1],
              [100, 1, 4],
              [100, 2, 5],
              [3, 100, 3],
              [4, 100, 3],
              [5, 100, 4],
            ],
          ],
          expected: 4,
        },
        {
          args: [
            [
              [0, 1, 1],
              [1, 2, 1],
              [2, 0, 1],
            ],
          ],
          expected: 0,
        },
        {
          args: [
            [
              ["D", "B", 4],
              ["E", "A", 3],
              ["F", "A", 2],
              ["F", "C", 1],
            ],
          ],
          expected: 4,
        },
        {
          args: [
            [
              [0, 1, 2],
              [1, 2, 3],
              [2, 3, 5],
              [3, 4, 7],
              [4, 5, 4],
              [5, 0, 1],
              [6, 2, 6],
              [7, 4, 2],
            ],
          ],
          expected: 6,
        },
      ],
    },
  },
  {
    id: "cred-kth-decrypted-character",
    company: "cred",
    title: "Kth character of a repeat-encoded string",
    prompt:
      "An encoded string is a list of blocks, each block being some letters followed by a whole number that says how many times those letters repeat, so ab3c2 decodes to abababcc. Given the encoded string and a 1-based position k, return the character at position k of the decoded string, or an empty string when k falls outside it, without building the decoded string. The reported statement writes a count after every block (even a count of 1), allows counts of several digits, and may split one run into parts such as a2a2b3b1; here a block with no number counts once. The decoded string can be far longer than the encoded one. A candidate report lists it in an online test, where the candidate simply decoded the string; avoiding that is the stronger answer.",
    level: "Software Engineer (campus)",
    difficulty: "Medium",
    pattern: "One pass over run-length blocks with index arithmetic",
    patternId: "pointers",
    evidence: "one",
    sources: [
      {
        label: "CRED Software Engineer interview experience, Mar 2022 (Naukri Code360)",
        url: "https://www.naukri.com/code360/interview-experiences/cred/interview-experience-by-uttam-kumar-mar-2022-exp-0-2-years",
        kind: "candidate-report",
        year: 2022,
      },
    ],
    chapters: ["dsa-arrays-strings", "dsa-prefix-sums"],
    answer: {
      ask: `<p>The format is the first thing to settle. I read an encoded string as blocks, where a block is a run of non-digit characters followed by a run of digits that gives the repeat count of the whole run before it: ab3c2 means ababab then cc. Can the count have several digits, like ab12c3? Does every block carry a count, even a count of 1? Can one run be split into parts, as a2a2b3b1 for four a's then four b's? Is k counted from 1, and what should I return when k is past the end? Can groups nest, like a2(bc)3?</p>
<p>The reported statement answers most of this: lowercase letters, a count after every block, counts of several digits, split runs allowed, and a 1-based position. I also accept a block with no number and count it once, return an empty string for an out-of-range k, and allow no nesting. This is not the LeetCode problem Decoded String at Index, where a digit repeats everything decoded so far. The candidate simply decoded the string and indexed it, so I would mention the version that never builds it as the improvement.</p>`,
      brute: `<p>Decode everything, then index: expand each block into its repeated letters, concatenate, and return the character at position k. It is simple and fine for tiny inputs, and the decoded string is easy to print when debugging.</p>
<p>It fails on size. The decoded length is the sum over blocks of letters times count, so a ten-character input like a999999999 expands to a billion characters, and a few such blocks exhaust memory long before the answer is found. Even stopping the expansion as soon as k characters exist costs O(k) time and space, and k can be enormous. The reported follow-up asks exactly for this: answer without ever materialising the decoded string.</p>`,
      insight: `<p>The pattern is <b>one pass over run-length blocks with index arithmetic</b>. The decoded string is the blocks in order, and each block has a length you can compute without expanding it: the number of letters times the count. Position k lives in the first block where the total decoded length so far reaches k.</p>
<p>So walk the encoded string once, block by block, keeping consumed, the decoded length of all earlier blocks. For each block read its letters (remember where they start and end, no copying), then its count, and compute length = letters * count. If consumed + length is at least k, this block holds the answer: the offset inside the block is k - consumed - 1 (0-based), and because the block is its letters repeated, the character is the one at index offset mod letter-count. Otherwise add the length to consumed and move on.</p>
<p>Correctness rests on two facts: blocks appear in the decoded string in the same order as in the input, and inside a block the letters repeat with a period equal to their number. The comparison is "at least k", not "greater than", because a block whose last character sits exactly at position k contains it. The walk stops at the first block that reaches k, so consumed is always below k when we add to it.</p>
<p>Time is O(n) for an encoded string of n characters, and extra space is O(1): a few integers and indexes. Out loud: "I never decode. I add up block lengths until I pass k, then use k minus what came before, modulo the number of letters."</p>`,
      walkthrough: `<p>Take ab3cd2e4fgh2 and k = 17. The blocks are ab repeated 3 times (6 characters), cd twice (4), e four times (4), and fgh twice (6), for 20 characters in all. The running total before each block is 0, 6, 10 and 14.</p>
<p>The first three blocks end at 6, 10 and 14, all below 17, so they are skipped. The fourth block ends at 20, which is at least 17, so it holds position 17. The offset inside it is 17 - 14 - 1 = 2, and 2 mod 3 = 2, so the answer is the letter at index 2 of fgh, which is h. Nothing longer than the input was ever built.</p>`,
      edges: `<p>A k below 1 or above the decoded length returns an empty string: the walk finishes without a hit and falls through. A block with no number repeats once, which happens at the end of the input or when the string is letters only. A count of 0 gives a block of length 0, so it never holds k and the walk skips it.</p>
<ul>
  <li><b>Multi-digit counts:</b> a12 reads both digits before multiplying, so it means twelve a's.</li>
  <li><b>Boundary positions:</b> k equal to the last position of a block belongs to that block.</li>
  <li><b>Leading digits with no letters:</b> a block of length 0, so it contributes nothing.</li>
  <li><b>Empty input:</b> there are no blocks, so every k is out of range.</li>
  <li><b>Large counts:</b> lengths must stay below about 9 quadrillion in JavaScript numbers; beyond that switch to BigInt.</li>
</ul>`,
      followups: [
        "How would you handle nesting such as a2(bc3)2 without decoding?",
        "If the same encoded string answers a million queries, how would you speed each one up?",
        "What changes if the counts or k do not fit in a 64-bit integer?",
        "How would you return the substring starting at position k with length m, again without decoding everything?",
        "How does this differ from the LeetCode problem where a digit repeats the whole decoded string so far, and how do you solve that one?",
      ],
      slips: `<p>Off-by-one errors lead the list: treating k as 0-based while the offset formula assumes 1-based, or using a strict comparison so that the last character of a block is attributed to the next one. Close behind is applying the count to only the last letter, reading ab3 as abbb instead of ababab.</p>
<p>Also: reading only one digit of a multi-digit count; treating a missing count as zero and silently deleting the final letters; indexing with k modulo the whole decoded length instead of the block's letter count; building the decoded string "just to check", which defeats the point; and splitting a run of letters into separate one-letter blocks.</p>`,
    },
    trace: {
      caption: "Encoded string ab3cd2e4fgh2 with k = 17. Total columns count decoded characters.",
      head: ["Block", "Length", "Before", "After", "Holds k?"],
      rows: [
        ["ab x 3", "6", "0", "6", "no"],
        ["cd x 2", "4", "6", "10", "no"],
        ["e x 4", "4", "10", "14", "no"],
        ["fgh x 2", "6", "14", "20", "yes"],
      ],
    },
    complexity: {
      time: "O(n) for an encoded string of length n",
      space: "O(1) extra",
      brute: "O(L) time and space, where L is the decoded length and can be far larger than n",
    },
    solution: {
      entry: "kthCharacter",
      code: `function kthCharacter(encoded, k) {
  if (k < 1) return "";
  let consumed = 0;
  let i = 0;
  while (i < encoded.length) {
    const textStart = i;
    while (i < encoded.length && !(encoded[i] >= "0" && encoded[i] <= "9")) i++;
    const textEnd = i;
    let count = 0;
    let hasCount = false;
    while (i < encoded.length && encoded[i] >= "0" && encoded[i] <= "9") {
      count = count * 10 + Number(encoded[i]);
      hasCount = true;
      i++;
    }
    if (!hasCount) count = 1;
    const size = textEnd - textStart;
    const length = size * count;
    if (k <= consumed + length) return encoded[textStart + ((k - consumed - 1) % size)];
    consumed += length;
  }
  return "";
}`,
      cases: [
        { args: ["ab3c2", 8], expected: "c" },
        { args: ["ab3c2", 1], expected: "a" },
        { args: ["ab3c2", 6], expected: "b" },
        { args: ["ab3c2", 7], expected: "c" },
        { args: ["ab3c2", 9], expected: "" },
        { args: ["ab3c2", 0], expected: "" },
        { args: ["ab3c2", -4], expected: "" },
        { args: ["a", 1], expected: "a" },
        { args: ["", 1], expected: "" },
        { args: ["abc", 2], expected: "b" },
        { args: ["a12b", 12], expected: "a" },
        { args: ["a12b", 13], expected: "b" },
        { args: ["ab0c2", 1], expected: "c" },
        { args: ["ab0c2", 3], expected: "" },
        { args: ["ab3cd2e4fgh2", 17], expected: "h" },
        { args: ["3a2", 2], expected: "a" },
        { args: ["xyz1000000", 3000000], expected: "z" },
        { args: ["a2a2b3b1", 5], expected: "b" },
        { args: ["a2b3cd3", 7], expected: "d" },
        { args: ["a2bcd1e2", 4], expected: "c" },
        { args: ["ab12c3", 27], expected: "c" },
        { args: ["ab12c3", 28], expected: "" },
      ],
    },
  },
  {
    id: "cred-contact-prefix-search",
    company: "cred",
    title: "In-memory contact manager with prefix search",
    prompt:
      "Build an in-memory contact manager. add(firstName, lastName, phone) stores a contact and returns its numeric id, starting at 1. remove(id) deletes a contact and returns whether it existed. search(prefix) returns every contact whose first name, last name or phone number starts with the prefix, ignoring case, each shown as first name, last name and phone separated by spaces, in the order the contacts were added. A contact that matches through more than one field appears once, and an empty prefix returns nothing. The per-search cost should depend on the prefix length and the number of matches, not on the number of contacts. A candidate report lists it as a machine coding round: add or update contacts, then search by first name, last name or phone number, partial or complete and case insensitive, with the total count shown, in memory only and checked by unit tests. This version merges the three searches into one that matches any of the fields, and has remove in place of update.",
    level: "level not stated",
    difficulty: "Medium",
    pattern: "Trie whose nodes hold the ids passing through",
    patternId: "design",
    evidence: "one",
    sources: [
      {
        label: "CRED | Onsite | LLD Contact Management System, machine coding round of Nov 2021 (LeetCode Discuss)",
        url: "https://leetcode.com/discuss/post/1618127/cred-onsite-lld-contact-management-syste-1t0n/",
        kind: "candidate-report",
        year: 2021,
      },
    ],
    chapters: ["dsa-tries", "dsa-design-problems"],
    answer: {
      ask: `<p>I would settle the contract before drawing classes. Is a match a prefix of one field, or could it be any word inside the name? Is search case insensitive? What do I return, ids or formatted contacts, and in what order? If a contact matches through both its first and last name, does it appear twice? Does it need removal, and what happens to ids afterwards? Is it single threaded and memory only, as the prompt says?</p>
<p>My assumptions: a match is a prefix of the first name, the last name or the phone, ignoring case; results come back once each in the order the contacts were added, and their count is the length of the list; an empty prefix matches nothing; ids start at 1 and are never reused; there is no persistence, and one thread uses it. The report lists update as well, which I would treat as remove followed by add.</p>`,
      brute: `<p>Keep the contacts in an array. add pushes a new entry. search lowercases the prefix and scans every contact, testing whether the first name, last name or phone starts with it, and collects the hits in array order. remove deletes the entry. It is correct, short and easy to unit test, and a good starting point to say out loud.</p>
<p>Each search costs O(N * p) for N contacts and a prefix of length p, even when only two contacts match. With a million contacts and a search per keystroke that is millions of string comparisons every time, and most of them fail on the first character. Sorted arrays per field with binary search fix the lookups but make add and remove O(N) because of shifting, and the three result lists still have to be merged and de-duplicated.</p>`,
      insight: `<p>The pattern is <b>a trie whose nodes remember which contacts pass through them</b>. A trie turns "which keys start with this prefix" into one walk down the prefix, and the only question is what to read when the walk ends. Instead of collecting the whole subtree, store at every node the set of contact ids whose key passes through that node. After walking the prefix, that set is exactly the answer, so search is O(p + r) for a prefix of length p and r results.</p>
<p>All three fields of a contact go into the same trie, lowercased: the first name, the last name and the phone. A search for a prefix is meant to match any of the three fields, so the node reached by that prefix holds the union, and the Set removes duplicates when a contact matches through two fields. Empty fields are skipped.</p>
<p>Order comes for free. Ids are handed out in increasing order and a JavaScript Set iterates in insertion order, so each node's set lists ids in the order the contacts were added, and deleting an id never disturbs the others. The results need no sorting.</p>
<p>Removal needs care because the keys of one contact can share path nodes. First delete the id from every node along all of its keys. Only then prune bottom-up, walking each key again and deleting nodes whose set is now empty; pruning while still removing would delete a node that a second key of the same contact is about to visit. The price of the design is memory: every key character adds an id to a set, so space is the total length of all keys. In an interview I would split the trie into its own PrefixIndex class and keep the contacts in a store; the code here keeps them together to stay short.</p>`,
      walkthrough: `<p>Three contacts go in. Asha Rao gets id 1, Ravi Asher id 2 and Meera Rao id 3. Searching as walks two nodes and finds ids 1 and 2: Asha through her first name and Ravi through his last name, Asher. Searching RAO is lowercased first and finds 1 and 3 through the last name. The prefix 98 finds the two phones starting with 98, and 982 narrows it to id 2.</p>
<p>Then remove 1 deletes id 1 from every node on its paths and prunes the nodes that became empty. The same search for as now returns only Ravi, a search for zz returns nothing because the walk falls off the trie, and a second remove of id 1 returns false. The table shows ids in the result column to fit the page; the code returns the formatted contact strings.</p>`,
      edges: `<p>An empty prefix returns an empty list by definition, and a prefix longer than every key falls off the trie and returns an empty list too. A contact with an empty last name is still found by its first name and phone, since empty fields are never inserted. A contact whose first and last names are equal, like Rao Rao, is indexed twice but appears once, because the ids sit in sets.</p>
<ul>
  <li><b>Removing an unknown or already removed id:</b> returns false and changes nothing.</li>
  <li><b>Ids after removal:</b> they are never reused, so the order of the remaining results stays the order of adding.</li>
  <li><b>Mixed case:</b> keys and prefixes are lowercased the same way, so ASH finds Asha.</li>
  <li><b>Phone formats:</b> the phone is stored as typed, so a prefix like +91 matches only if it was entered with it; normalising is a follow-up.</li>
  <li><b>Two contacts with the same name:</b> they get different ids and both appear.</li>
</ul>`,
      followups: [
        "How would you rank the results, for example most recently used first, and cap them at ten?",
        "How would you also match a word in the middle of a name, or the last digits of a phone?",
        "How would you cut the memory when there are millions of contacts?",
        "How would you make it safe for many concurrent readers and one writer?",
        "How would you persist the contacts and rebuild the index on startup?",
      ],
      slips: `<p>The common design slip is one trie per field with the three result lists concatenated, which returns a contact twice when two fields match and loses the added order. Another is storing ids only at the end of a key and gathering the subtree on each search, which makes a short prefix as slow as a scan.</p>
<p>Others: pruning nodes while the contact still has other keys to remove, which crashes on a shared path; comparing without lowercasing both sides; reusing ids after a remove so the order breaks; returning the live set instead of a fresh array so callers can corrupt the index; and testing only the happy path, when a machine-coding round expects unit tests for removal, duplicates and empty input.</p>`,
    },
    trace: {
      caption: "Results are shown as contact ids to fit; the code returns the formatted strings.",
      head: ["Operation", "Result", "Note"],
      rows: [
        ["add Asha Rao 98100", "1", "keys asha, rao, 98100"],
        ["add Ravi Asher 98255", "2", "asher shares as with asha"],
        ["add Meera Rao 77001", "3", "rao node now holds 1, 3"],
        ["search as", "ids 1, 2", "first name and last name"],
        ["search RAO", "ids 1, 3", "lowercased, last names"],
        ["search 98", "ids 1, 2", "two phones"],
        ["search 982", "ids 2", "narrowed to one phone"],
        ["remove 1", "true", "id 1 leaves every path"],
        ["search as", "ids 2", "only Ravi remains"],
        ["search zz", "none", "walk falls off the trie"],
        ["remove 1", "false", "already gone"],
      ],
    },
    complexity: {
      time: "O(L) for add and remove of keys with total length L, O(p + r) for search",
      space: "O(total key length) for the trie and the id sets",
      brute: "O(N * p) per search over N contacts and a prefix of length p",
    },
    solution: {
      entry: "run",
      code: `class ContactManager {
  constructor() {
    this.root = { next: new Map(), ids: new Set() };
    this.contacts = new Map();
    this.nextId = 1;
  }

  keysOf(contact) {
    return [contact.first, contact.last, contact.phone].map((field) => field.toLowerCase()).filter((key) => key !== "");
  }

  add(first, last, phone) {
    const id = this.nextId++;
    const contact = { first, last, phone };
    this.contacts.set(id, contact);
    for (const key of this.keysOf(contact)) {
      let node = this.root;
      for (const ch of key) {
        if (!node.next.has(ch)) node.next.set(ch, { next: new Map(), ids: new Set() });
        node = node.next.get(ch);
        node.ids.add(id);
      }
    }
    return id;
  }

  remove(id) {
    const contact = this.contacts.get(id);
    if (contact === undefined) return false;
    this.contacts.delete(id);
    const keys = this.keysOf(contact);
    for (const key of keys) {
      let node = this.root;
      for (const ch of key) {
        node = node.next.get(ch);
        node.ids.delete(id);
      }
    }
    for (const key of keys) {
      const path = [];
      let node = this.root;
      for (const ch of key) {
        const child = node.next.get(ch);
        if (child === undefined) break;
        path.push([node, ch]);
        node = child;
      }
      for (let i = path.length - 1; i >= 0; i--) {
        const [parent, ch] = path[i];
        if (parent.next.get(ch).ids.size > 0) break;
        parent.next.delete(ch);
      }
    }
    return true;
  }

  search(prefix) {
    const key = prefix.toLowerCase();
    if (key === "") return [];
    let node = this.root;
    for (const ch of key) {
      node = node.next.get(ch);
      if (node === undefined) return [];
    }
    return [...node.ids].map((id) => {
      const c = this.contacts.get(id);
      return c.first + " " + c.last + " " + c.phone;
    });
  }
}

function run(ops, args) {
  const book = new ContactManager();
  return ops.map((op, i) => (i === 0 ? null : book[op](...args[i])));
}`,
      cases: [
        {
          args: [
            [
              "ContactManager",
              "add",
              "add",
              "add",
              "search",
              "search",
              "search",
              "search",
              "remove",
              "search",
              "search",
              "remove",
            ],
            [
              [],
              ["Asha", "Rao", "98100"],
              ["Ravi", "Asher", "98255"],
              ["Meera", "Rao", "77001"],
              ["as"],
              ["RAO"],
              ["98"],
              ["982"],
              [1],
              ["as"],
              ["zz"],
              [1],
            ],
          ],
          expected: [
            null,
            1,
            2,
            3,
            ["Asha Rao 98100", "Ravi Asher 98255"],
            ["Asha Rao 98100", "Meera Rao 77001"],
            ["Asha Rao 98100", "Ravi Asher 98255"],
            ["Ravi Asher 98255"],
            true,
            ["Ravi Asher 98255"],
            [],
            false,
          ],
        },
        {
          args: [
            ["ContactManager", "search"],
            [[], ["a"]],
          ],
          expected: [null, []],
        },
        {
          args: [
            ["ContactManager", "add", "search", "search"],
            [[], ["Rao", "Rao", "5"], ["ra"], [""]],
          ],
          expected: [null, 1, ["Rao Rao 5"], []],
        },
        {
          args: [
            ["ContactManager", "add", "search", "search"],
            [[], ["Sam", "", "42"], ["sa"], ["4"]],
          ],
          expected: [null, 1, ["Sam  42"], ["Sam  42"]],
        },
        {
          args: [
            ["ContactManager", "add", "add", "search"],
            [[], ["Tia", "Lee", "1"], ["Tia", "Lee", "2"], ["TIA"]],
          ],
          expected: [null, 1, 2, ["Tia Lee 1", "Tia Lee 2"]],
        },
        {
          args: [
            ["ContactManager", "add", "remove", "remove", "search", "add"],
            [[], ["Kim", "Ho", "9"], [1], [1], ["k"], ["Kim", "Ho", "9"]],
          ],
          expected: [null, 1, true, false, [], 2],
        },
        {
          args: [
            ["ContactManager", "remove", "search"],
            [[], [3], ["x"]],
          ],
          expected: [null, false, []],
        },
        {
          args: [
            ["ContactManager", "add", "add", "remove", "search", "search", "add", "search"],
            [[], ["Anil", "Anand", "1"], ["Anu", "Bose", "11"], [1], ["an"], ["1"], ["Ana", "Anil", "12"], ["an"]],
          ],
          expected: [null, 1, 2, true, ["Anu Bose 11"], ["Anu Bose 11"], 3, ["Anu Bose 11", "Ana Anil 12"]],
        },
        {
          args: [
            ["ContactManager", "add", "search", "search", "search"],
            [[], ["Zed", "Zee", "007"], ["zed"], ["zedd"], ["00"]],
          ],
          expected: [null, 1, ["Zed Zee 007"], [], ["Zed Zee 007"]],
        },
        {
          args: [
            ["ContactManager", "add", "add", "add", "remove", "remove", "search", "search"],
            [[], ["Ab", "Ba", "1"], ["Abe", "Bab", "12"], ["B", "A", "123"], [2], [1], ["a"], ["1"]],
          ],
          expected: [null, 1, 2, 3, true, true, ["B A 123"], ["B A 123"]],
        },
      ],
    },
  },
  {
    id: "zomato-max-sum-path-two-arrays",
    company: "zomato",
    title: "Maximum sum path across two sorted arrays",
    prompt:
      "You are given two arrays of integers, each in strictly increasing order. A path starts at the first element of either array and moves right, and whenever the current value also appears in the other array it may continue in either array from that shared value; a shared value is counted once. The path ends when it runs off the end of the array it is on. Return the largest possible sum of the values on a path, using O(n + m) time and O(1) extra space. For a = [2,4,5,8,10] and b = [4,6,8,9] the answer is 30, from the path 2, 4, 6, 8, 10. Two candidate reports list it, one in the second round of an SDE-2 interview and one in the second round of an SDE-1 backend interview.",
    level: "SDE-2 and SDE-1 (backend, 1+ year)",
    difficulty: "Hard",
    pattern: "Two pointers merging sorted arrays with segment sums",
    patternId: "pointers",
    leetcode: { number: 1537, slug: "get-the-maximum-score" },
    evidence: "several",
    sources: [
      {
        label: "Zomato Interview Experience for SDE-2 (GeeksforGeeks)",
        url: "https://www.geeksforgeeks.org/interview-experiences/zomato-interview-experience-for-sde-2/",
        kind: "candidate-report",
        year: 2020,
      },
      {
        label: "Zomato Interview Experience (1+ Year Experienced) (GeeksforGeeks)",
        url: "https://www.geeksforgeeks.org/interview-experiences/zomato-interview-experience-1-year-experienced/",
        kind: "candidate-report",
        year: 2021,
      },
    ],
    chapters: ["dsa-two-pointers", "dsa-arrays-strings"],
    answer: {
      ask: `<p>I would check the statement first. Are both arrays sorted in strictly increasing order, so a value never repeats inside one array? Can values be negative? Does the path have to run to the end of the array it is on, and may it start in either array? When a value appears in both arrays, is it counted once? And is the answer the exact sum or a sum modulo a prime, since the sums can be very large?</p>
<p>The reports give one sample pair, sorted and without repeats, so I take that as the contract. I solve this version: both arrays are strictly increasing, the path starts at the first element of either array and moves right until it runs off the end, it may hop to the other array at any shared value, shared values count once, and I return the exact sum. The LeetCode version takes the result modulo 1,000,000,007, which I would apply only at the very end. The target is O(n + m) time and O(1) extra space.</p>`,
      brute: `<p>Enumerate every path. Start in each array and walk right; at every shared value, branch into two paths, one that stays and one that hops to the other array. Sum each complete path and keep the maximum. Finding the matching index in the other array needs a search or a hash map.</p>
<p>With c shared values there are about 2 to the power c paths, each costing O(n + m) to add up, so the time is exponential. Memoising on the position fixes that, because the best sum from a position onward depends only on the position. That gives O(n + m) time but needs a map from values to indices and an array of results, so O(n + m) space, which misses the O(1) space target.</p>`,
      insight: `<p>The pattern is <b>two pointers merging two sorted arrays while accumulating segment sums</b>. The shared values cut both arrays into aligned segments. Between two consecutive shared values, each array holds its own stretch of numbers, and a path walks through exactly one of the two stretches. Whichever it picks, it arrives at the next shared value at the same point, so the choices in different segments do not affect each other.</p>
<p>That makes the decision local: in every segment take the larger of the two stretch sums. The answer is the sum of all shared values plus, for each segment, the larger stretch sum; the last segment, after the final shared value, ends where the arrays end.</p>
<p>The merge walk computes it in one pass. Keep sumA and sumB, the best sums of paths that end at the last consumed element of each array, with 0 before anything is consumed. Compare the current elements: the smaller one belongs to a stretch, so add it to its own array's sum and advance that pointer. When they are equal it is a shared value: the best path reaching it is max(sumA, sumB) plus the value, and from here both arrays continue from that same best, so set both sums to it and advance both pointers. When one array runs out, add the rest of the other to its sum, and the answer is max(sumA, sumB).</p>
<p>Each element is touched once, so time is O(n + m), and only two sums are stored, so extra space is O(1). Out loud: "merge the arrays, add stretches to their own sum, and at every shared value collapse both sums to the larger one plus the value."</p>`,
      walkthrough: `<p>Take a = [2,4,5,8,10] and b = [4,6,8,9], with both sums at 0. Compare 2 and 4: 2 is smaller, so sumA becomes 2. Compare 4 and 4: shared, so both sums become max(2, 0) + 4 = 6. Compare 5 and 6: take 5, so sumA is 11 while sumB stays 6. Compare 8 and 6: take 6 for b, so sumB is 12.</p>
<p>Compare 8 and 8: shared, so both sums become max(11, 12) + 8 = 20. Compare 10 and 9: take 9 for b, so sumB is 29 and b is exhausted. The rest of a is 10, so sumA becomes 30. The answer is max(30, 29) = 30, from the path 2, 4, 6, 8, 10.</p>`,
      edges: `<p>If one array is empty there are no shared values, and the answer is the sum of the other. If both are empty the answer is 0. With no shared values the answer is the larger of the two array sums. Identical arrays share every value and the answer is the sum of one of them, with every value counted once.</p>
<ul>
  <li><b>Shared value at the very start or end:</b> the equal branch handles it, adding the value once.</li>
  <li><b>Negative values:</b> the logic never assumes positives, so a negative stretch simply loses to a better one; the path still must run to the end.</li>
  <li><b>One array inside the other:</b> every value of the small one is shared, and the tails of the large one decide the end.</li>
  <li><b>Single-element arrays:</b> the loop runs at most once.</li>
  <li><b>Large sums:</b> totals can pass 2 to the power 53 for huge inputs; use BigInt then, and take any modulus only at the end.</li>
</ul>`,
      followups: [
        "What if the arrays are unsorted or contain repeated values, and how would you even define a path then?",
        "How would you return the path itself, not only its sum?",
        "Can you generalise it to k sorted arrays where a value shared by several of them is a junction?",
        "How do you return the answer modulo 1,000,000,007 when the exact sums do not fit in a number?",
        "What changes if the inputs are linked lists, or are streamed so that you cannot index them?",
      ],
      slips: `<p>The first slip is counting a shared value twice, once from each array, which inflates every junction. The second is resetting the sums to zero at a junction instead of setting both to the best sum plus the shared value, which throws away the earlier part of the path.</p>
<p>Others: taking the modulus while comparing sums, which can pick the smaller true sum; forgetting the tails after one array runs out; collapsing the equal case into a less-than-or-equal branch so that the pointers drift apart; moving only one pointer at a shared value; and reaching for a hash set of the shared values, which works but spends O(n) space when the question asked for O(1).</p>`,
    },
    trace: {
      caption: "a = [2,4,5,8,10], b = [4,6,8,9]. sumA and sumB are shown after each step.",
      head: ["Compare", "Action", "sumA", "sumB"],
      rows: [
        ["2 vs 4", "take 2 into sumA", "2", "0"],
        ["4 vs 4", "shared: both = max + 4", "6", "6"],
        ["5 vs 6", "take 5 into sumA", "11", "6"],
        ["8 vs 6", "take 6 into sumB", "11", "12"],
        ["8 vs 8", "shared: both = max + 8", "20", "20"],
        ["10 vs 9", "take 9 into sumB", "20", "29"],
        ["b is empty", "add tail 10 to sumA", "30", "29"],
      ],
    },
    complexity: {
      time: "O(n + m) for array lengths n and m",
      space: "O(1) extra",
      brute: "O(2^c * (n + m)) for c shared values",
    },
    solution: {
      entry: "maxPathSum",
      code: `function maxPathSum(a, b) {
  let i = 0;
  let j = 0;
  let sumA = 0;
  let sumB = 0;
  while (i < a.length && j < b.length) {
    if (a[i] < b[j]) sumA += a[i++];
    else if (a[i] > b[j]) sumB += b[j++];
    else {
      const best = Math.max(sumA, sumB) + a[i];
      sumA = best;
      sumB = best;
      i++;
      j++;
    }
  }
  while (i < a.length) sumA += a[i++];
  while (j < b.length) sumB += b[j++];
  return Math.max(sumA, sumB);
}`,
      cases: [
        {
          args: [
            [2, 4, 5, 8, 10],
            [4, 6, 8, 9],
          ],
          expected: 30,
        },
        {
          args: [
            [1, 3, 5, 7, 9],
            [3, 5, 100],
          ],
          expected: 109,
        },
        {
          args: [
            [1, 2, 3, 4, 5],
            [6, 7, 8, 9, 10],
          ],
          expected: 40,
        },
        { args: [[], []], expected: 0 },
        { args: [[], [1, 2]], expected: 3 },
        { args: [[5], [5]], expected: 5 },
        {
          args: [
            [1, 2, 3],
            [1, 2, 3],
          ],
          expected: 6,
        },
        {
          args: [
            [-5, -3, 0, 2],
            [-3, 1, 2],
          ],
          expected: 0,
        },
        {
          args: [
            [1, 4, 7],
            [2, 4, 6, 7, 9],
          ],
          expected: 28,
        },
        { args: [[3], [1, 2, 3, 4, 5]], expected: 15 },
        {
          args: [
            [2, 3, 7, 10, 12, 15, 30, 34],
            [1, 5, 7, 8, 10, 15, 16, 17],
          ],
          expected: 122,
        },
        {
          args: [
            [1, 100],
            [1, 2, 3, 100, 101],
          ],
          expected: 207,
        },
        {
          args: [
            [-10, -4],
            [-9, -8, -4, -1],
          ],
          expected: -14,
        },
      ],
    },
  },
  {
    id: "myntra-longest-increasing-path",
    company: "myntra",
    title: "Longest increasing path in a matrix",
    prompt:
      "Given a grid of integers, find the length of the longest path in which every step moves up, down, left or right to a cell holding a strictly larger value. A path may start in any cell and may not leave the grid, and the answer counts the cells on the path. For [[9,9,4],[6,6,8],[2,1,1]] the answer is 4, from the path 1, 2, 6, 9. The grid can have a few hundred rows and columns. Two candidate reports about a year apart mention it, and one candidate started from plain depth-first search and added memoisation when pushed.",
    level: "Senior SWE (3 years, offer) and SDE-1 (entry level)",
    difficulty: "Hard",
    pattern: "Topological layers on an implicit DAG",
    patternId: "graph",
    leetcode: { number: 329, slug: "longest-increasing-path-in-a-matrix" },
    evidence: "several",
    sources: [
      {
        label: "Myntra | Senior Software Engineer | Bangalore | Aug 2024 [Offer] (LeetCode Discuss)",
        url: "https://leetcode.com/discuss/post/5742859/myntra-senior-software-engineer-bangalor-1ec2/",
        kind: "candidate-report",
        year: 2024,
      },
      {
        label: "Interview Experience 165: Myntra SDE-1, entry level (Roundz Newsletter, posted 21 Aug 2025)",
        url: "https://roundz.substack.com/p/interview-experience-165-myntra-sde",
        kind: "candidate-report",
        year: 2025,
      },
    ],
    chapters: ["dsa-topological-patterns", "dsa-grid-bfs", "dsa-matrix-problems"],
    answer: {
      ask: `<p>I would check the move rules and the output. Are the moves only up, down, left and right, or also diagonal? Must each step go to a strictly larger value, so that equal neighbours do not count? Can the path start anywhere? Do I return the number of cells on the path or the number of steps? What do I return for an empty grid? And how big can the grid be, because that decides between recursion and an iterative method?</p>
<p>My reading: four directions, strictly larger, any start cell, the answer is the number of cells, 0 for an empty grid, and the grid may be a few hundred cells on a side, so I avoid deep recursion.</p>`,
      brute: `<p>Start a depth-first search from every cell: from a cell, try each of its four neighbours holding a larger value, and return one plus the best result. The path cannot loop because values strictly grow, so no visited set is needed. Take the maximum over all start cells.</p>
<p>This is correct, but it recounts the same paths. A cell can be reached by many different increasing paths, and each time the whole tail above it is explored again. On a grid where values grow to the right and downwards the number of increasing paths is a binomial coefficient, exponential in the grid size, so even a 20 by 20 grid is out of reach. One candidate report describes starting here and adding memoisation when pushed.</p>`,
      insight: `<p>The pattern is <b>longest path in an implicit DAG, solved in topological order</b>. Draw an edge from every cell to each neighbour with a strictly larger value. Edges only go upwards in value, so there are no cycles, and the longest increasing path is the longest path in this DAG. Nothing needs to be built: the edges are implied by the grid.</p>
<p>There are two standard ways to evaluate it. The first is memoised DFS: longest(cell) = 1 + the maximum of longest(neighbour) over larger neighbours, stored per cell, so each cell is computed once and the time is O(m * n). Its weak point is depth: on a snake-shaped grid the recursion goes as deep as the number of cells, and a 200 by 200 grid is 40,000 frames, which can overflow the JavaScript stack.</p>
<p>The second, which I ship, is Kahn's algorithm in layers. For each cell count its smaller neighbours: that is its in-degree. Cells with in-degree 0 are local minima and form layer 1. Peel a layer: for each cell in it, decrement the count of every larger neighbour, and any neighbour reaching 0 joins the next layer. The number of layers is the answer. A cell lands in layer t exactly when the longest increasing path that ends at it has t cells: it is released when its last smaller neighbour is peeled, which is one layer after the deepest of its smaller neighbours. The last layer therefore holds the ends of the longest paths.</p>
<p>Time is O(m * n), since each cell and each of its four neighbour checks happens a constant number of times, and space is O(m * n) for the counts and the layers. Out loud: "cells point to bigger neighbours, so it is a DAG; peel it layer by layer and count the layers."</p>`,
      walkthrough: `<p>Take [[9,9,4],[6,6,8],[2,1,1]] and count smaller neighbours first. The cells with none are the 4 in the top right and the two 1s in the bottom row, which form layer 1. Peeling them releases the 6 in the middle and the 2 at the bottom left, because their only smaller neighbour was a 1. The 8 and the top middle 9 still wait on other cells, so layer 2 is the 6 and the 2.</p>
<p>Peeling layer 2 releases the 9 at the top middle (its smaller neighbours 4 and 6 are both done), the 8 (its smaller neighbours 4, 6 and 1 are done), and the 6 on the left (the 2 is done), so layer 3 has those three. Peeling layer 3 releases the 9 in the top left corner, which waited on the left 6. That corner is layer 4, and peeling it releases nothing, so there are 4 layers and the answer is 4, matching the path 1, 2, 6, 9.</p>`,
      edges: `<p>An empty grid, or a grid whose rows are empty, has no cells, so the answer is 0 and the loop never starts. A one-cell grid gives 1. A grid with all values equal gives 1, because no step is strictly larger.</p>
<ul>
  <li><b>Plateaus:</b> equal neighbours add no edge and no in-degree, so a flat region with no smaller neighbours sits entirely in layer 1.</li>
  <li><b>Single row or column:</b> works the same way; a decreasing column gives its full length by walking from the bottom up.</li>
  <li><b>Negative values:</b> only comparisons are used.</li>
  <li><b>Non-square grids:</b> a cell index is row times column count plus column, so rows and columns are never mixed up.</li>
  <li><b>Snake grids:</b> the layer count equals the cell count, and nothing recurses.</li>
</ul>`,
      followups: [
        "How would you return the path itself, not only its length?",
        "How would you count how many longest paths there are?",
        "What breaks if equal neighbours are allowed as steps, and what would you do?",
        "How would you handle diagonal moves, or a weight on each step?",
        "Memoised DFS is shorter to write, so when would you still choose the layered version, and can you make the DFS safe from stack overflow?",
      ],
      slips: `<p>The most frequent slip is allowing equal neighbours (using at-least rather than strictly larger), which creates cycles and an infinite loop or wrong lengths. Next is a visited set shared across start cells, which blocks paths that legitimately pass through a cell from a different start; with memoisation no visited set is needed because the order is acyclic.</p>
<p>Others: clearing the memo for each start cell, which brings back the exponential cost; returning the number of steps instead of the number of cells; starting only from corners or from the smallest value; mixing up rows and columns on a non-square grid; and writing the recursive version without considering depth on a large snake grid.</p>`,
    },
    trace: {
      caption: "Grid [[9,9,4],[6,6,8],[2,1,1]]. Cells are shown as value@(row,column).",
      head: ["Layer", "Cells peeled", "Cells released"],
      rows: [
        ["1", "4@(0,2) 1@(2,1) 1@(2,2)", "6@(1,1) 2@(2,0)"],
        ["2", "6@(1,1) 2@(2,0)", "9@(0,1) 8@(1,2) 6@(1,0)"],
        ["3", "9@(0,1) 8@(1,2) 6@(1,0)", "9@(0,0)"],
        ["4", "9@(0,0)", "none"],
      ],
    },
    complexity: {
      time: "O(m * n) for an m by n grid",
      space: "O(m * n)",
      brute: "Exponential in the grid size without memoisation",
    },
    solution: {
      entry: "longestIncreasingPath",
      code: `function longestIncreasingPath(matrix) {
  const rows = matrix.length;
  if (rows === 0) return 0;
  const cols = matrix[0].length;
  const moves = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const smaller = new Array(rows * cols).fill(0);
  let layer = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      for (const [dr, dc] of moves) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && matrix[nr][nc] < matrix[r][c]) smaller[r * cols + c]++;
      }
      if (smaller[r * cols + c] === 0) layer.push(r * cols + c);
    }
  }
  let length = 0;
  while (layer.length > 0) {
    length++;
    const next = [];
    for (const cell of layer) {
      const r = Math.floor(cell / cols);
      const c = cell % cols;
      for (const [dr, dc] of moves) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || matrix[nr][nc] <= matrix[r][c]) continue;
        smaller[nr * cols + nc]--;
        if (smaller[nr * cols + nc] === 0) next.push(nr * cols + nc);
      }
    }
    layer = next;
  }
  return length;
}`,
      cases: [
        {
          args: [
            [
              [9, 9, 4],
              [6, 6, 8],
              [2, 1, 1],
            ],
          ],
          expected: 4,
        },
        {
          args: [
            [
              [3, 4, 5],
              [3, 2, 6],
              [2, 2, 1],
            ],
          ],
          expected: 4,
        },
        { args: [[[1]]], expected: 1 },
        { args: [[]], expected: 0 },
        { args: [[[]]], expected: 0 },
        {
          args: [
            [
              [5, 5],
              [5, 5],
            ],
          ],
          expected: 1,
        },
        { args: [[[1, 2, 3, 4, 5]]], expected: 5 },
        { args: [[[5], [4], [3], [2]]], expected: 4 },
        {
          args: [
            [
              [-3, -2],
              [-5, -4],
            ],
          ],
          expected: 3,
        },
        {
          args: [
            [
              [1, 2],
              [4, 3],
              [5, 6],
            ],
          ],
          expected: 6,
        },
        {
          args: [
            [
              [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
              [23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12],
              [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
              [47, 46, 45, 44, 43, 42, 41, 40, 39, 38, 37, 36],
              [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59],
              [71, 70, 69, 68, 67, 66, 65, 64, 63, 62, 61, 60],
              [72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83],
              [95, 94, 93, 92, 91, 90, 89, 88, 87, 86, 85, 84],
              [96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107],
              [119, 118, 117, 116, 115, 114, 113, 112, 111, 110, 109, 108],
              [120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131],
              [143, 142, 141, 140, 139, 138, 137, 136, 135, 134, 133, 132],
            ],
          ],
          expected: 144,
        },
        {
          args: [
            [
              [7, 8, 9],
              [9, 7, 6],
              [7, 2, 3],
            ],
          ],
          expected: 6,
        },
        {
          args: [
            [
              [1, 1, 1],
              [1, 2, 1],
              [1, 1, 1],
            ],
          ],
          expected: 2,
        },
        {
          args: [
            [
              [1, 2, 3],
              [6, 5, 4],
            ],
          ],
          expected: 6,
        },
        { args: [[[1], [2], [1], [2]]], expected: 2 },
      ],
    },
  },
  {
    id: "phonepe-remove-k-digits",
    company: "phonepe",
    title: "Smallest number after removing k digits",
    prompt:
      "Given a string of digits that represents a non-negative integer and a count k, delete exactly k digits so that the remaining number is as small as possible, and return it as a string with no leading zeros, or 0 if nothing is left. The remaining digits keep their original order. For 1432219 and k = 3 the answer is 1219. The input can have up to 100,000 digits, so the result cannot be handled as a native integer. Two candidate reports list it, one in the data structures round of an SDE interview and one under the second round of an onsite loop in October 2025.",
    level: "SDE (2-5 years)",
    difficulty: "Medium",
    pattern: "Monotonic stack with a deletion budget",
    patternId: "stack",
    leetcode: { number: 402, slug: "remove-k-digits" },
    evidence: "several",
    sources: [
      {
        label: "PhonePe Interview Experience for SDE (2 - 5 Years Experienced), DS/Algo round (GeeksforGeeks)",
        url: "https://www.geeksforgeeks.org/interview-experiences/phonepe-interview-experience-for-sde-2-5-years-experienced/",
        kind: "candidate-report",
      },
      {
        label: "PhonePe Prep, onsite rounds, Round 2 problem solving (LeetCode Discuss, Oct 2025)",
        url: "https://leetcode.com/discuss/post/7238042/phonepe-prep-by-anonymous_user-0sfi/",
        kind: "candidate-report",
        year: 2025,
      },
    ],
    chapters: ["dsa-stacks-queues", "dsa-monotonic-stack-queue", "dsa-greedy"],
    answer: {
      ask: `<p>I would clarify the input and the output. Is the number given as a string of digits, possibly up to 100,000 long? Can the input have leading zeros? Must exactly k digits be removed, and is k always at most the length? Should the result keep leading zeros or drop them, and what is returned when nothing is left? Do the remaining digits keep their original order?</p>
<p>My assumptions: a digit string with no leading zeros, exactly k deletions with k at most the length, remaining digits in order, leading zeros stripped from the result, and 0 when nothing remains. Because the string is long, I treat it as text and never convert it to a number.</p>`,
      brute: `<p>Try every way to delete k digits: choose which n-k positions to keep, build each candidate string, and take the smallest. Candidates have the same length, so comparing them as strings gives the numeric order. This is correct, but there are C(n, k) choices, which for 20 digits and k = 10 is already 184,756 and for realistic inputs is astronomical.</p>
<p>A smarter loop removes one digit k times: each time scan for the first digit that is larger than the digit after it and delete that one, or delete the last digit if none exists. That is correct and it is the idea behind the final solution, but each of the k rounds rescans the string, so it costs O(n * k), which is billions of steps for n = 100,000 and k near half of n.</p>`,
      insight: `<p>The pattern is <b>a monotonic stack with a deletion budget</b>. For numbers of equal length, the leftmost position where they differ decides which is smaller, so the left end matters most. When is deleting a digit most valuable? When it is larger than the digit right after it: deleting it slides a smaller digit into its place, lowering the number at the earliest possible position. If no digit is larger than its successor, the digits are non-decreasing, and the best deletion is the last digit.</p>
<p>The stack applies this in one pass. Scan the digits left to right, keeping a stack of kept digits. For each new digit, while deletions remain and the top of the stack is larger than the new digit, pop the top and spend one deletion; then push the new digit. The stack is therefore non-decreasing until the budget runs out. After the scan, any deletions left over come off the end, which holds the largest digits of a non-decreasing stack. Finally strip leading zeros and return 0 if nothing remains.</p>
<p>Why popping is safe: suppose the top t is larger than the incoming digit d and a deletion is still available. Any plan that keeps both t and d, and spends a deletion somewhere later, gets a smaller number by moving that deletion onto t, because the digit in t's place becomes d or something no larger than d, and nothing before that place changes. A plan that keeps t but deletes d is beaten by swapping the two. Earlier positions are settled first, so the rule holds by induction. Equal digits are not popped because popping gains nothing. Each digit is pushed once and popped at most once, so time is O(n), and the stack takes O(n) space. Out loud: "monotonic stack, pop while the previous digit is bigger and I still have deletions, trim the tail, strip zeros."</p>`,
      walkthrough: `<p>Take 1432219 and k = 3. The 1 is pushed. The 4 is larger than 1, so it is pushed. The 3 is smaller than the top 4, so 4 is popped and k drops to 2, then 3 is pushed. The 2 pops the 3 (k becomes 1) and is pushed. The next 2 equals the top, so nothing is popped and it is pushed. The 1 pops one 2 (k becomes 0) and is pushed. The 9 is pushed with no budget left.</p>
<p>The budget is spent, so the stack 1219 is the answer, and it has no leading zeros. Compare it with simply removing the three largest digits, which would give 1221: the stack found the smaller 1219 because the deletions were spent where a big digit sat before a small one.</p>`,
      edges: `<p>When k is zero the digits are unchanged. When k equals the length everything is deleted and the answer is 0, handled before the scan. A result with leading zeros, like 10200 with k = 1 giving 0200, is stripped to 200, and one that is all zeros collapses to a single 0.</p>
<ul>
  <li><b>Increasing digits:</b> nothing is popped during the scan, and the leftover budget trims the end.</li>
  <li><b>Decreasing digits:</b> every new digit pops the previous one until the budget is spent, so the front is deleted.</li>
  <li><b>Equal digits:</b> nothing is popped, and the trim at the end removes copies from the tail.</li>
  <li><b>A single digit:</b> k is 0 or 1, and both are handled.</li>
  <li><b>Zeros inside:</b> 1002 with k = 1 pops the 1 and gives 002, stripped to 2.</li>
</ul>`,
      followups: [
        "How would you prove the greedy choice correct?",
        "What changes if you need the largest possible number instead?",
        "Can you do it with O(1) extra space, and what does your language allow?",
        "How does the same stack idea solve the smallest subsequence of distinct letters problem?",
      ],
      slips: `<p>The frequent mistake is using if instead of while when popping, which pops at most one digit per new digit. For 1562 with k = 2 the 2 must pop both 6 and 5 to reach 12, but with if the 5 stays and the answer comes out as 15.</p>
<p>Others: not trimming the leftover deletions from the end, so 12345 with k = 2 stays unchanged; forgetting to strip leading zeros, or returning an empty string instead of 0; stripping zeros before applying the deletions; converting to a number and losing digits past about 15; and popping on equal digits for no gain, which is harmless here but muddles the proof.</p>`,
    },
    trace: {
      caption: "Digits 1432219 with k = 3. Stack is shown bottom to top.",
      head: ["Digit", "Popped", "Stack after", "k left"],
      rows: [
        ["1", "none", "1", "3"],
        ["4", "none", "14", "3"],
        ["3", "4", "13", "2"],
        ["2", "3", "12", "1"],
        ["2", "none", "122", "1"],
        ["1", "2", "121", "0"],
        ["9", "none", "1219", "0"],
        ["end", "none", "1219", "0"],
      ],
    },
    complexity: {
      time: "O(n) for n digits",
      space: "O(n) for the stack",
      brute: "O(C(n, k)) subsets, or O(n * k) deleting one digit per pass",
    },
    solution: {
      entry: "removeKdigits",
      code: `function removeKdigits(num, k) {
  if (k >= num.length) return "0";
  const stack = [];
  for (const digit of num) {
    while (k > 0 && stack.length > 0 && stack[stack.length - 1] > digit) {
      stack.pop();
      k--;
    }
    stack.push(digit);
  }
  while (k > 0) {
    stack.pop();
    k--;
  }
  let start = 0;
  while (start < stack.length - 1 && stack[start] === "0") start++;
  return stack.slice(start).join("");
}`,
      cases: [
        { args: ["1432219", 3], expected: "1219" },
        { args: ["10200", 1], expected: "200" },
        { args: ["10", 2], expected: "0" },
        { args: ["9", 1], expected: "0" },
        { args: ["12345", 0], expected: "12345" },
        { args: ["12345", 2], expected: "123" },
        { args: ["54321", 2], expected: "321" },
        { args: ["2222", 2], expected: "22" },
        { args: ["1002", 1], expected: "2" },
        { args: ["112", 1], expected: "11" },
        { args: ["100", 1], expected: "0" },
        { args: ["1234567890", 9], expected: "0" },
        { args: ["1562", 2], expected: "12" },
        { args: ["10001", 1], expected: "1" },
        { args: ["5337", 2], expected: "33" },
        { args: ["43214321", 4], expected: "1321" },
        { args: ["99999999999999999999999999999999999999991", 20], expected: "999999999999999999991" },
      ],
    },
  },
];
