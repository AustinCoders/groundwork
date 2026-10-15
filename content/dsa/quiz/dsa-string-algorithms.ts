import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "sa-skip-rechecks",
      chapter: "dsa-string-algorithms",
      level: "advanced",
      skill: "recognise",
      pattern: "string-matching",
      section: "the-insight-a-mismatch-still-tells-you-something",
      placement: true,
      kind: "single",
      prompt:
        "<p>A text has n characters and a pattern has m. The naive search can cost O(n · m), because after a mismatch it slides the pattern one step and compares again from the pattern's first character. Which idea gets the worst case down to O(n + m)?</p>",
      choices: [
        {
          id: "a",
          text: "Hash every window of the text and report a match whenever its hash equals the pattern's hash, with no further check of the characters.",
          why: "Two different strings can share a hash, so this can report a match that is not one. If every hash hit is checked character by character, the running time is linear in expectation, but an adversarial or repetitive input brings the O(n · m) worst case back.",
        },
        {
          id: "b",
          text: "Preprocess the pattern, so that a mismatch says how much of the match to keep and the text pointer never moves back.",
          why: "A mismatch after k matched characters is not zero information, because those k text characters are the first k characters of the pattern. A table built from the pattern in O(m) says how many of them can be reused, and the scan over the text then costs O(n). That is the idea behind KMP.",
        },
        {
          id: "c",
          text: "Sort the characters of the text and of the pattern, then compare the two sorted strings from the left.",
          why: 'Sorting throws away the order of the characters, which is exactly what a substring match depends on. <code>"abc"</code> and <code>"cab"</code> sort to the same string, and the sort itself already costs O(n log n).',
        },
        {
          id: "d",
          text: "Put every substring of the text into a Set, then look the pattern up in that Set in one step.",
          why: "A text of n characters can have up to about n²/2 different substrings, so building the Set can cost far more than the O(n · m) search it was meant to replace.",
        },
      ],
      answer: "b",
    },
    {
      id: "sa-repeated-block",
      chapter: "dsa-string-algorithms",
      level: "advanced",
      skill: "recognise",
      pattern: "string-matching",
      section: "recognizing-it-in-an-unseen-problem",
      placement: true,
      kind: "single",
      prompt:
        '<p>Given a non-empty string <code>s</code> of length n, decide whether it is built by repeating a shorter string two or more times. <code>"abcabcabc"</code> is, and <code>"abcabcab"</code> is not. Which technique decides this in O(n) time?</p>',
      choices: [
        {
          id: "a",
          text: "Count each character, and answer yes when all of the counts share a common divisor above 1.",
          why: 'A repeated string does have counts that share a divisor, but the converse fails. <code>"aabb"</code> has counts 2 and 2 and is not a repetition of anything, because the order of the characters matters.',
        },
        {
          id: "b",
          text: "Expand around every center of the string and look for a long palindrome inside it.",
          why: 'Palindromes are about mirror symmetry, not repetition. <code>"abcabc"</code> is a repetition with no palindrome longer than one character, and <code>"aba"</code> is a palindrome that is not a repetition.',
        },
        {
          id: "c",
          text: "Hash the first half and the second half of <code>s</code>, and answer yes when the two hashes are equal.",
          why: 'That only finds strings made of exactly two copies. <code>"abcabcabc"</code> has three copies of <code>"abc"</code> and an odd length, so it has no halves to compare.',
        },
        {
          id: "d",
          text: "Build the prefix function and test that <code>n - fail[n - 1]</code> is below n and divides n.",
          why: "<code>n - fail[n - 1]</code> is the smallest period of the string. A repetition exists exactly when that period is shorter than the string and divides its length. Building the table takes O(n), and the test afterwards is O(1).",
        },
      ],
      answer: "d",
    },
    {
      id: "sa-failure-table-tasks",
      chapter: "dsa-string-algorithms",
      level: "advanced",
      skill: "recognise",
      pattern: "string-matching",
      section: "the-failure-table-answers-more-than-where-is-the-pattern",
      kind: "multi",
      prompt:
        "<p>A prefix function (failure table) is built in O(n) for a string, possibly after joining strings with a separator character that occurs in none of them. Select every task that it answers.</p>",
      choices: [
        {
          id: "a",
          text: "The length of the longest palindromic <em>subsequence</em> of <code>s</code>.",
          why: "A subsequence need not be contiguous, and the table only knows about prefixes that are also suffixes. This is a two-dimensional DP problem.",
        },
        {
          id: "b",
          text: "The length of the longest proper prefix of <code>s</code> that is also a suffix of <code>s</code>.",
          why: "That is the definition of the table's last entry, <code>fail[n - 1]</code>. Reading it is O(1) once the table exists.",
        },
        {
          id: "c",
          text: "The edit distance between two different strings.",
          why: "Edit distance allows insertions, deletions and replacements, and it is solved by a DP table over pairs of positions. A failure table only reports exact matches of prefixes against suffixes.",
        },
        {
          id: "d",
          text: "The smallest period of <code>s</code>: the smallest <code>p</code> such that <code>s[i] === s[i + p]</code> wherever both positions exist.",
          why: "The smallest period is <code>n - fail[n - 1]</code>. When it divides n and is smaller than n, it is also the length of the repeating unit.",
        },
        {
          id: "e",
          text: "The fewest characters to put in front of <code>s</code> so that the result is a palindrome.",
          why: 'Build the table for <code>s + "#" + reverse(s)</code>. Its last entry is the length of the longest palindromic prefix of <code>s</code>, and the answer is n minus that. The separator must not occur in <code>s</code>, or the last entry can exceed n.',
        },
      ],
      answers: ["b", "d", "e"],
    },
    {
      id: "sa-many-equal-patterns",
      chapter: "dsa-string-algorithms",
      level: "advanced",
      skill: "recognise",
      pattern: "string-matching",
      section: "rabin-karp-compare-hashes-not-characters",
      kind: "single",
      prompt:
        "<p>A text holds 1,000,000 characters. You are given 10,000 patterns, each exactly 8 characters long, and you must report which of them occur in the text. Which approach fits best?</p>",
      choices: [
        {
          id: "a",
          text: "Store each pattern under its hash, roll one hash over the text, and compare characters on each hit.",
          why: "Because every pattern has the same length, one window length serves them all. Each window costs O(1) to hash and O(1) expected to look up among the stored hashes, so one pass over the text covers all 10,000 patterns. Every hash hit is checked, so a collision costs time but never gives a wrong answer.",
        },
        {
          id: "b",
          text: "Run KMP separately for each pattern, with one full pass over the text for every one of them.",
          why: "Each run is correct and costs O(n + m) in the worst case, but 10,000 runs over a million characters is on the order of 10<sup>10</sup> steps. A single rolling-hash pass does the work of all of them.",
        },
        {
          id: "c",
          text: "Sort the characters of the text, then binary search for each of the patterns in the sorted text.",
          why: "Sorting destroys the adjacency of characters, so a substring of the original text no longer exists in the sorted string. Binary search needs the data in an order that keeps the question meaningful.",
        },
        {
          id: "d",
          text: "Run Manacher's algorithm once on the text and compare every palindrome it finds with the patterns.",
          why: "Manacher's algorithm finds palindromic substrings only. The patterns are arbitrary strings, and most of them are not palindromes.",
        },
      ],
      answer: "a",
    },
    {
      id: "sa-build-cost",
      chapter: "dsa-string-algorithms",
      level: "advanced",
      skill: "complexity",
      pattern: "string-matching",
      section: "building-the-failure-table-step-by-step",
      kind: "single",
      prompt:
        "<p>The pattern has m characters. What is the tightest worst-case time bound for building its failure table?</p><pre><code>function buildFailure(pattern) {\n  const fail = new Array(pattern.length).fill(0);\n  let len = 0;\n  for (let i = 1; i &lt; pattern.length; i++) {\n    while (len &gt; 0 &amp;&amp; pattern[i] !== pattern[len]) {\n      len = fail[len - 1];\n    }\n    if (pattern[i] === pattern[len]) len++;\n    fail[i] = len;\n  }\n  return fail;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "O(m²), because a <code>while</code> loop that can run up to m times sits inside the <code>for</code> loop.",
          why: "Nested loops are quadratic only when the inner loop can restart from scratch on every pass. Here <code>len</code> rises by at most 1 per outer iteration and every fallback lowers it, so the inner loop cannot run that often.",
        },
        {
          id: "b",
          text: "O(m log m), because each fallback roughly halves <code>len</code> and there are m positions.",
          why: "A fallback replaces <code>len</code> with <code>fail[len - 1]</code>, which can be just one smaller. Nothing halves, and the bound does not come from a logarithm.",
        },
        {
          id: "c",
          text: "O(m), because <code>len</code> rises at most m - 1 times and every fallback lowers it.",
          why: "Across the whole build <code>len</code> goes up by at most 1 per outer iteration. It never drops below 0, and each fallback lowers it by at least 1, so there are at most m - 1 fallbacks in all. The same amortized argument bounds a sliding window's left pointer.",
        },
        {
          id: "d",
          text: "O(m) on average, but O(m²) for some patterns, depending on how the characters repeat.",
          why: "The bound holds for every pattern, not just on average. A count of fallbacks on any input cannot exceed the number of times <code>len</code> was raised.",
        },
      ],
      answer: "c",
    },
    {
      id: "sa-rolling-hash-worst-case",
      chapter: "dsa-string-algorithms",
      level: "advanced",
      skill: "complexity",
      pattern: "string-matching",
      section: "rabin-karp-compare-hashes-not-characters",
      kind: "single",
      prompt:
        '<p><code>rabinKarp(text, pattern)</code> from the chapter checks every hash hit with <code>text.startsWith(pattern, i)</code>. The text is <code>"a".repeat(n)</code> and the pattern is <code>"a".repeat(m)</code> with m at most n / 2. What is its tightest worst-case running time in n and m?</p>',
      choices: [
        {
          id: "a",
          text: "O(n + m), because the rolling hash makes the work for each window O(1) in every case.",
          why: "The hash update is O(1) per window, but here every window equals the pattern, so every window's hash equals the pattern's hash. Each of them then triggers a check that compares m characters.",
        },
        {
          id: "b",
          text: "O(n · m): each window really matches, and confirming it takes m comparisons.",
          why: "There are n - m + 1 windows, which is at least n / 2 when m is at most n / 2. Each one passes the hash test and then costs m comparisons to confirm, so the total is proportional to n · m. This is the worst case that exists even with no collision at all.",
        },
        {
          id: "c",
          text: "O(n log m), because the window length is halved on each check of a window.",
          why: "Nothing in the algorithm halves the window. It keeps the window length m fixed and slides it one position at a time.",
        },
        {
          id: "d",
          text: "O(n), because each text character enters the window once and leaves it once.",
          why: "That counts the hash updates only. Each verification adds m comparisons on top, and on this input there is one for every window.",
        },
      ],
      answer: "b",
    },
    {
      id: "sa-center-expansion-cost",
      chapter: "dsa-string-algorithms",
      level: "advanced",
      skill: "complexity",
      pattern: "string-matching",
      section: "manacher-s-algorithm-every-palindrome-in-o-n",
      kind: "single",
      prompt:
        '<p>This function expands around each of the 2n - 1 centers of a string. For <code>s = "a".repeat(n)</code>, how does the total number of <code>while</code> iterations grow with n?</p><pre><code>function countPalindromes(s) {\n  let count = 0;\n  for (let center = 0; center &lt; 2 * s.length - 1; center++) {\n    let left = center &gt;&gt; 1;\n    let right = left + (center &amp; 1);\n    while (left &gt;= 0 &amp;&amp; right &lt; s.length &amp;&amp; s[left] === s[right]) {\n      count++;\n      left--;\n      right++;\n    }\n  }\n  return count;\n}</code></pre>',
      choices: [
        {
          id: "a",
          text: "In proportion to n, because there are only 2n - 1 centers.",
          why: "The number of centers is linear, but one center can expand about n / 2 times. On a string of one repeated letter, most centers expand far.",
        },
        {
          id: "b",
          text: "In proportion to n log n, because each expansion is a halving.",
          why: "An expansion grows one step at a time and stops at a mismatch or at an end of the string. On a string of one letter it only stops at an end, so nothing halves.",
        },
        {
          id: "c",
          text: "In proportion to n³, because each of the n² substrings needs an O(n) palindrome test.",
          why: "That is the cost of testing every substring from scratch. Expansion tests a substring in O(1) by extending a palindrome by one pair of characters, so each palindromic substring is counted once.",
        },
        {
          id: "d",
          text: "In proportion to n², since the loop runs exactly n(n + 1) / 2 times.",
          why: "Every substring of a string of one repeated letter is a palindrome, and each iteration counts one palindromic substring. There are n(n + 1) / 2 of them. Manacher's algorithm gets this kind of work down to O(n) by reusing mirrored radii.",
        },
      ],
      answer: "d",
    },
    {
      id: "sa-trace-failure",
      chapter: "dsa-string-algorithms",
      level: "advanced",
      skill: "trace",
      pattern: "string-matching",
      section: "building-the-failure-table-step-by-step",
      kind: "single",
      prompt:
        '<p>Using the chapter\'s <code>buildFailure</code>, what does <code>buildFailure("aabaaab")</code> return?</p>',
      choices: [
        {
          id: "a",
          text: "<code>[0, 1, 0, 1, 2, 2, 3]</code>",
          why: "At i = 5 the character is <code>a</code> but <code>pattern[2]</code> is <code>b</code>, so <code>len</code> falls from 2 to <code>fail[1] = 1</code>. Then <code>pattern[1]</code> is <code>a</code>, which matches, and <code>len</code> becomes 2. At i = 6 the character <code>b</code> matches <code>pattern[2]</code>, so <code>len</code> becomes 3.",
        },
        {
          id: "b",
          text: "<code>[0, 1, 0, 1, 2, 1, 0]</code>",
          why: 'This is what you get when a mismatch resets <code>len</code> to 0 instead of falling back to <code>fail[len - 1]</code>. At i = 5 the correct fallback is the border <code>"a"</code>, which then extends to <code>"aa"</code> and gives 2. The reset restarts from nothing and finds only a single <code>a</code>, so it gives 1.',
        },
        {
          id: "c",
          text: "<code>[0, 1, 0, 1, 2, 3, 4]</code>",
          why: "The run of <code>a</code>s tempts you to keep extending, but at i = 5 the next expected character <code>pattern[2]</code> is <code>b</code>. The match cannot grow, so <code>len</code> has to fall back.",
        },
        {
          id: "d",
          text: "<code>[1, 2, 0, 1, 2, 2, 3]</code>",
          why: 'The first entries break the rule that the prefix must be proper. <code>fail[0]</code> is always 0, because a single character has no proper prefix, and <code>fail[1]</code> is 1, because <code>"aa"</code> cannot count as its own border.',
        },
      ],
      answer: "a",
    },
    {
      id: "sa-order-kmp-step",
      chapter: "dsa-string-algorithms",
      level: "advanced",
      skill: "trace",
      pattern: "string-matching",
      section: "kmp-search-the-text-pointer-never-moves-backward",
      kind: "order",
      prompt:
        "<p>Put the steps of one iteration of the <code>for</code> loop in <code>kmpSearch</code> in the order they run. Start with the fallback loop and end with the loop moving on to the next index.</p>",
      items: [
        {
          id: "fallback",
          text: "While <code>len &gt; 0</code> and <code>text[i] !== pattern[len]</code>, set <code>len = fail[len - 1]</code>.",
        },
        { id: "extend", text: "If <code>text[i] === pattern[len]</code>, add 1 to <code>len</code>." },
        {
          id: "hit",
          text: "If <code>len === pattern.length</code>, record the hit at <code>i - pattern.length + 1</code> and set <code>len = fail[len - 1]</code>.",
        },
        { id: "advance", text: "Move on to <code>text[i + 1]</code>, without ever lowering <code>i</code>." },
      ],
      why: "The fallback loop comes first because it finds the longest match that can still be extended by <code>text[i]</code>. Extending comes next and only then can <code>len</code> reach <code>pattern.length</code>, which is what the hit test looks for. After a hit, <code>len</code> drops to <code>fail[len - 1]</code> so overlapping matches are not lost. The text index only ever increases.",
    },
    {
      id: "sa-overlap-after-hit",
      chapter: "dsa-string-algorithms",
      level: "advanced",
      skill: "edge-case",
      pattern: "string-matching",
      section: "kmp-search-the-text-pointer-never-moves-backward",
      kind: "single",
      prompt:
        '<p>In <code>kmpSearch</code>, the line after a recorded hit is changed from <code>len = fail[len - 1]</code> to <code>len = 0</code>, and nothing else changes. What does <code>kmpSearch("aaaa", "aa")</code> return?</p>',
      choices: [
        {
          id: "a",
          text: "<code>[0, 1, 2]</code>",
          why: 'That is the answer of the original code, which keeps the border <code>"a"</code> after each hit and so finds overlapping matches. With <code>len = 0</code> the overlaps are lost.',
        },
        {
          id: "b",
          text: "<code>[0]</code>",
          why: "The search does not stop at the first hit. After <code>len</code> is reset the loop keeps reading text, so it can find the next hit.",
        },
        {
          id: "c",
          text: "<code>[0, 2]</code>",
          why: "After the hit at 0, <code>len</code> restarts from 0, so the characters at indexes 2 and 3 are matched afresh and give a hit at 2. The hit at 1 is lost because its first character was already used. The result counts non-overlapping matches only.",
        },
        {
          id: "d",
          text: "<code>[0, 1, 2, 3]</code>",
          why: "A pattern of length 2 fits in a text of length 4 at only 3 starting positions, 0, 1 and 2. No version of the search can report a start at 3.",
        },
      ],
      answer: "c",
    },
    {
      id: "sa-z-separator",
      chapter: "dsa-string-algorithms",
      level: "advanced",
      skill: "edge-case",
      pattern: "string-matching",
      section: "the-z-function-the-same-information-easier-to-reason-about",
      kind: "single",
      prompt:
        '<p>The chapter\'s <code>zSearch</code> joins the strings with <code>"#"</code>. What does <code>zSearch("a#", "a")</code> return, when the text contains a <code>#</code>?</p>',
      choices: [
        {
          id: "a",
          text: '<code>[0]</code>, because <code>"a"</code> occurs at index 0 of the text.',
          why: 'That is the right answer to the question, but not what the function returns. The combined string is <code>"a#a#"</code>, where <code>z[2]</code> is 2, because the match runs on across the separator, and the test <code>z[i] === pattern.length</code> looks for 1.',
        },
        {
          id: "b",
          text: "<code>[0, 1]</code>, because both characters of the text are matched.",
          why: 'The second character of the text is <code>#</code>, which is not <code>"a"</code>, so no match can start at index 1.',
        },
        {
          id: "c",
          text: "<code>[2]</code>, the index in the combined string.",
          why: "The function subtracts <code>pattern.length + 1</code> before pushing a hit, so it reports positions in the text and not in the combined string. And in this case it reports no hit at all.",
        },
        {
          id: "d",
          text: "<code>[]</code>, because the match overruns the separator.",
          why: 'The combined string is <code>"a#a#"</code>. At index 2 the text <code>"a#"</code> matches the start of the combined string for 2 characters, which is longer than the pattern, so <code>z[2]</code> is 2 and the equality test skips a real occurrence. The separator has to be a character that occurs in neither string.',
        },
      ],
      answer: "d",
    },
    {
      id: "sa-negative-modulo",
      chapter: "dsa-string-algorithms",
      level: "advanced",
      skill: "edge-case",
      pattern: "string-matching",
      section: "rabin-karp-compare-hashes-not-characters",
      kind: "single",
      prompt:
        '<p>In <code>rabinKarp</code>, with <code>BASE = 256</code> and <code>MOD = 1000000007</code>, the line that drops the left character is changed to the version below, without the <code>+ MOD</code>. Nothing else changes. What does <code>rabinKarp("srjmoapbz", "rjmoa")</code> return?</p><pre><code>winHash = (winHash - (text.charCodeAt(i) * high) % MOD) % MOD;</code></pre>',
      choices: [
        {
          id: "a",
          text: "<code>[1]</code>, because the arithmetic is still correct modulo <code>MOD</code>.",
          why: "The value is correct modulo <code>MOD</code>, but the code compares numbers with <code>===</code>, and the subtraction can leave a negative number. A negative number does not equal the pattern's hash, even when it differs from it by exactly <code>MOD</code>.",
        },
        {
          id: "b",
          text: "<code>[]</code>, because the rolled hash is negative and never equals <code>patHash</code>.",
          why: "JavaScript's <code>%</code> keeps the sign of its left operand, so a negative <code>winHash</code> stays negative. At index 1 the rolled hash is negative, so it is never <code>===</code> to the non-negative <code>patHash</code>, and the real match is missed. Adding <code>MOD</code> back before the final <code>%</code> fixes it.",
        },
        {
          id: "c",
          text: "<code>[0, 1]</code>, because the damaged hash now reports extra false matches.",
          why: "The <code>startsWith</code> check still runs on every hash hit, so a wrong hash cannot add a false match. The failure here goes the other way: a true match is missed.",
        },
        {
          id: "d",
          text: "It throws a <code>RangeError</code>, because a hash value has become negative.",
          why: "A negative number is a valid JavaScript value, and nothing in the code rejects it. The result is silently wrong, not an exception.",
        },
      ],
      answer: "b",
    },
    {
      id: "sa-hash-multiplication",
      chapter: "dsa-string-algorithms",
      level: "advanced",
      skill: "edge-case",
      pattern: "string-matching",
      section: "prefix-hashes-compare-any-two-substrings-in-o-1",
      kind: "single",
      prompt:
        "<p>A substring hash needs <code>(prefix[l] * power[r - l]) % mod</code> with <code>mod = 1000000007</code>, and both factors can be close to the modulus. Why does the chapter use a helper <code>mulMod</code> instead of writing that expression directly in JavaScript?</p>",
      choices: [
        {
          id: "a",
          text: "The product can reach about 10<sup>18</sup>, above 2<sup>53</sup>, so the <code>Number</code> is only approximate and the remainder is silently wrong.",
          why: "A JavaScript number is a double and is exact for integers only up to 2<sup>53</sup>, about 9 × 10<sup>15</sup>. The product of two values near 10<sup>9</sup> is far beyond that, so low digits are lost before the <code>%</code> is applied. No error is thrown.",
        },
        {
          id: "b",
          text: "The <code>%</code> operator throws a <code>RangeError</code> when its left operand is larger than the modulus squared.",
          why: "The <code>%</code> operator never throws for numbers. The trouble is silent: the left operand has already lost precision by the time the remainder is taken.",
        },
        {
          id: "c",
          text: "The remainder of a product is not the product of the remainders, so the two factors must be reduced first.",
          why: "Reducing the factors first is valid and is what the hash does: the product of two residues has the same remainder as the product of the originals. The problem is the size of that product, not the identity.",
        },
        {
          id: "d",
          text: "Bitwise operators are needed because <code>%</code> only works on 32-bit integers.",
          why: "The <code>%</code> operator works on any double. Bitwise operators convert to 32 bits and would truncate a value near 10<sup>9</sup> times another one, giving a worse result.",
        },
      ],
      answer: "a",
    },
    {
      id: "sa-why-binary-search-length",
      chapter: "dsa-string-algorithms",
      level: "advanced",
      skill: "recognise",
      pattern: "string-matching",
      section: "longest-duplicate-substring-binary-search-on-the-length",
      kind: "single",
      prompt:
        "<p>To find the longest substring of <code>s</code> that occurs at least twice, a solution binary searches on the length L and checks whether some substring of length L repeats. Which fact makes binary search on L valid?</p>",
      choices: [
        {
          id: "a",
          text: "The longest duplicate always lies in the first half of the string, so the search range halves.",
          why: 'Nothing places the duplicate in the first half. In <code>"xyzwabab"</code> the repeated block <code>ab</code> lies entirely in the second half.',
        },
        {
          id: "b",
          text: "If a substring of length L occurs twice, so does its prefix of length L − 1, so the check never goes from false back to true as L grows.",
          why: "The truth values are true for short lengths and false for long ones, with one switch, which is the shape binary search needs. The check for a fixed length costs one pass with hashes.",
        },
        {
          id: "c",
          text: "Hashes of longer substrings are always larger than hashes of shorter ones, so they can be ordered.",
          why: "A modular hash has no order that follows the length: a longer substring can have a smaller hash than a shorter one. The search is over lengths, not over hash values.",
        },
        {
          id: "d",
          text: "Each doubling of the length halves the number of windows, so only log n lengths are possible.",
          why: "A string of length n has windows of every length from 1 to n − 1. The number of windows of length L is n − L + 1, which falls by one per step, not by half.",
        },
      ],
      answer: "b",
    },
    {
      id: "sa-trace-dup-probes",
      chapter: "dsa-string-algorithms",
      level: "advanced",
      skill: "trace",
      pattern: "string-matching",
      section: "longest-duplicate-substring-binary-search-on-the-length",
      kind: "single",
      prompt:
        '<p>The chapter\'s <code>longestDupSubstring</code> runs on <code>"abcabcab"</code>, which has 8 characters, so the search starts with <code>lo = 1</code> and <code>hi = 7</code>. In which order does it test lengths, and what does it return?</p>',
      choices: [
        {
          id: "a",
          text: '4, then 6, then 5; it returns <code>"abcab"</code>.',
          why: 'Length 4 has a duplicate (<code>"abca"</code> at 0 and 3), so lo becomes 5. Length 6 has none, so hi becomes 5. Length 5 has one (<code>"abcab"</code> at 0 and 3), so lo becomes 6 and the loop ends with that string.',
        },
        {
          id: "b",
          text: '4, then 6, then 5; it returns <code>"abcabc"</code>.',
          why: 'The order of the lengths is right, but no substring of length 6 repeats: the windows <code>"abcabc"</code>, <code>"bcabca"</code> and <code>"cabcab"</code> are all different. The answer comes from the last successful length, 5.',
        },
        {
          id: "c",
          text: '4, then 5, then 6; it returns <code>"abcab"</code>.',
          why: "After a success at 4 the next probe is the middle of the upper half, <code>(5 + 7) &gt;&gt; 1 = 6</code>, not 5. Binary search jumps in the middle of the remaining range and does not scan lengths in order.",
        },
        {
          id: "d",
          text: "1, then 2, then 3, and so on, until a length has no duplicate.",
          why: "That describes a linear scan over the lengths. The function is a binary search, which needs only about log n probes, each one pass over the string.",
        },
      ],
      answer: "a",
    },
    {
      id: "sa-aho-link",
      chapter: "dsa-string-algorithms",
      level: "advanced",
      skill: "recognise",
      pattern: "string-matching",
      section: "aho-corasick-many-patterns-one-pass-over-the-text",
      kind: "single",
      prompt:
        "<p>In an Aho-Corasick automaton built from a trie of patterns, what does the failure link of a node point to?</p>",
      choices: [
        {
          id: "a",
          text: "The node's parent in the trie.",
          why: "The parent is the node for the string without its last character. The failure link may jump much further up, or sideways to another branch, and is usually not the parent.",
        },
        {
          id: "b",
          text: "The node for the longest proper suffix of the node's string that is also a prefix of some pattern.",
          why: "This generalises KMP's fallback to a border. When the next character has no edge from a node, the search continues from this node because it represents the longest shorter match that is still alive.",
        },
        {
          id: "c",
          text: "The node of the shortest pattern that is a substring of the node's string.",
          why: "Which pattern is shortest has no bearing on where a failed match should resume. The link follows suffixes that are prefixes of patterns, not whole patterns.",
        },
        {
          id: "d",
          text: "The root, for every node whose string is not itself a pattern.",
          why: "Only nodes of depth one link to the root. A node such as <code>sh</code> for the patterns <code>she</code> and <code>hers</code> links to <code>h</code>, so a failed match keeps its useful tail.",
        },
      ],
      answer: "b",
    },
    {
      id: "sa-aho-inherited-output",
      chapter: "dsa-string-algorithms",
      level: "advanced",
      skill: "edge-case",
      pattern: "string-matching",
      section: "aho-corasick-many-patterns-one-pass-over-the-text",
      kind: "single",
      prompt:
        '<p>In <code>buildAhoCorasick</code>, the line <code>out[child] = out[child].concat(out[link[child]])</code> is deleted. What does <code>ahoCorasickSearch("she", ["he", "she"])</code> return afterwards? With the line in place it returns <code>[[0, 1], [1, 0]]</code>.</p>',
      choices: [
        {
          id: "a",
          text: "<code>[[0, 1], [1, 0]]</code>, unchanged.",
          why: "The pattern <code>he</code> ends inside <code>she</code> and is no longer attached to the node for <code>she</code> without that line. Only the node for <code>he</code> would list it, and the search never stands on that node here.",
        },
        {
          id: "b",
          text: "<code>[[1, 0]]</code>",
          why: "This keeps the shorter pattern and loses the longer one. The node reached after reading <code>she</code> is the node whose own list holds the pattern <code>she</code>, so that report remains.",
        },
        {
          id: "c",
          text: "<code>[[0, 1]]</code>",
          why: "The search ends at the node for <code>she</code>, whose own list holds only the pattern <code>she</code> (id 1, starting at 0). The occurrence of <code>he</code> inside it was only reachable through the failure link, so it is no longer reported.",
        },
        {
          id: "d",
          text: "<code>[]</code>",
          why: "The pattern <code>she</code> still ends at its own node, so it is still reported. Only the occurrences that are reached through failure links are lost.",
        },
      ],
      answer: "c",
    },
    {
      id: "sa-aho-cost",
      chapter: "dsa-string-algorithms",
      level: "advanced",
      skill: "complexity",
      pattern: "string-matching",
      section: "aho-corasick-many-patterns-one-pass-over-the-text",
      kind: "single",
      prompt:
        "<p>Aho-Corasick is built for k patterns of total length M and run over a text of length n, reporting z occurrences in all. With <code>Map</code> transitions, what is the tightest bound on build plus search?</p>",
      choices: [
        {
          id: "a",
          text: "O(M · n)",
          why: "That would be the cost of testing every pattern position against every text position. The failure links make the search resume from a shorter match instead of restarting, and the pointer rises at most once per text character.",
        },
        {
          id: "b",
          text: "O(k · n), one KMP pass per pattern.",
          why: "That is the cost of running a separate search for each pattern. A single automaton handles all k patterns in one pass over the text, so the number of patterns does not multiply n.",
        },
        {
          id: "c",
          text: "O(M + n + z)",
          why: "Building the trie and its failure links takes time linear in M, the search advances through the text once with amortised constant work per character, and each reported occurrence costs one step to write down.",
        },
        {
          id: "d",
          text: "O(n log M)",
          why: "No logarithm appears: a transition is a hash lookup, not a search. The bound also leaves out the cost of building the trie from M characters.",
        },
      ],
      answer: "c",
    },
    {
      id: "sa-trace-sum-scores",
      chapter: "dsa-string-algorithms",
      level: "advanced",
      skill: "trace",
      pattern: "string-matching",
      section: "sum-of-scores-reading-the-whole-z-array",
      kind: "single",
      prompt:
        '<p>The chapter\'s <code>sumScores</code> adds up the Z array of <code>s</code>. What does <code>sumScores("aabaa")</code> return?</p>',
      choices: [
        {
          id: "a",
          text: "9",
          why: "The Z array is [5, 1, 0, 2, 1]: the whole string scores 5, position 1 matches <code>a</code>, position 2 matches nothing, position 3 matches <code>aa</code> and position 4 matches <code>a</code>. The sum is 9.",
        },
        {
          id: "b",
          text: "4",
          why: "This leaves out <code>z[0]</code>. The suffix that is the whole string is one of the strings being scored, and it scores n = 5.",
        },
        {
          id: "c",
          text: "5",
          why: "That counts only the whole string. The other suffixes also share prefixes with <code>s</code>: <code>aa</code> and <code>a</code> at the end, and <code>abaa</code> up to its first character.",
        },
        {
          id: "d",
          text: "15",
          why: "15 is 5 + 4 + 3 + 2 + 1, the sum of the lengths of all the suffixes. A score is the length of the common prefix with <code>s</code>, which stops at the first mismatch.",
        },
      ],
      answer: "a",
    },
    {
      id: "sa-distinct-substrings",
      chapter: "dsa-string-algorithms",
      level: "advanced",
      skill: "trace",
      pattern: "string-matching",
      section: "suffix-arrays-every-suffix-in-sorted-order",
      kind: "single",
      prompt:
        '<p>For <code>s = "abab"</code> the sorted suffixes are <code>ab</code>, <code>abab</code>, <code>b</code>, <code>bab</code> (starting at 2, 0, 3, 1). Using the number of substrings counted with repeats minus the sum of the LCP array, how many different substrings does <code>s</code> have?</p>',
      choices: [
        {
          id: "a",
          text: "10",
          why: "10 is 4 · 5 / 2, the count that includes repeated substrings. The two copies of <code>a</code>, of <code>b</code> and of <code>ab</code> were counted separately, and the LCP sum removes them.",
        },
        {
          id: "b",
          text: "6",
          why: "The substrings are a, b, ab, ba, aba, bab and abab, seven in all. Six would drop one of them.",
        },
        {
          id: "c",
          text: "7",
          why: "The LCP array is [2, 0, 1]: <code>ab</code> and <code>abab</code> share 2, <code>abab</code> and <code>b</code> share 0, and <code>b</code> and <code>bab</code> share 1. The sum is 3, and 10 − 3 = 7.",
        },
        {
          id: "d",
          text: "8",
          why: "This would need an LCP sum of 2. The neighbouring pairs share 2, 0 and 1 characters, which adds up to 3.",
        },
      ],
      answer: "c",
    },
  ],
  pattern: {
    pattern: "string-matching",
    chapter: "dsa-string-algorithms",
    signals: [
      "The prompt asks for all occurrences of a pattern in a text, and n and m are both large enough that O(n · m) times out.",
      "The text arrives as a stream you may not rewind, or the answer depends on prefixes that are also suffixes.",
      "Many patterns of the same length are searched in one text, or the pattern is a two-dimensional block.",
      "The prompt asks for the shortest string to prepend, the smallest repeating unit, or whether a string is a rotation of another.",
    ],
    template:
      "<pre><code>function kmpSearch(text, pattern) {\n  const fail = buildFailure(pattern);\n  const hits = [];\n  let len = 0;\n  for (let i = 0; i &lt; text.length; i++) {\n    while (len &gt; 0 &amp;&amp; text[i] !== pattern[len]) len = fail[len - 1];\n    if (text[i] === pattern[len]) len++;\n    if (len === pattern.length) {\n      hits.push(i - len + 1);\n      len = fail[len - 1];\n    }\n  }\n  return hits;\n}</code></pre>",
    time: "O(n + m)",
    space: "O(m)",
    styles: ["onsite"],
  },
};
