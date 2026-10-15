import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "bit-why-pairs-cancel",
      chapter: "dsa-bit-manipulation",
      level: "intermediate",
      skill: "recognise",
      pattern: "bit-manipulation",
      section: "trick-1-xor-cancels-itself-out",
      placement: true,
      kind: "single",
      prompt:
        "<p>Every value in an array of integers appears exactly twice, except one value that appears once, and the two copies of a value can sit far apart. A loop does <code>result ^= num</code> for every element, starting from 0. Why does <code>result</code> end up equal to the single value?</p>",
      choices: [
        {
          id: "a",
          text: "XOR works through the array in order, so a value only cancels when its two copies sit next to each other in the array.",
          why: "Position makes no difference to the final result. XOR does not look at neighbours, and the same pair cancels whether its copies are adjacent or at opposite ends of the array.",
        },
        {
          id: "b",
          text: "XOR can be regrouped freely, and <code>x ^ x</code> is 0 while <code>x ^ 0</code> is <code>x</code>, so each pair cancels wherever it sits.",
          why: "XOR is commutative and associative, so the elements can be regrouped freely until the two copies of each value meet and give 0. What is left is the unpaired value XOR 0, which is the value itself.",
        },
        {
          id: "c",
          text: "XOR subtracts the second copy of a value from the first, so every pair adds up to zero and the sum of what is left is the single value.",
          why: "XOR works on each bit separately and does not add or subtract anything. The cancelling comes from two equal bits XOR-ing to 0, not from arithmetic.",
        },
        {
          id: "d",
          text: "The trick only works for non-negative values, because negative numbers have a sign bit that does not cancel the way other bits do.",
          why: "The sign bit is an ordinary bit to XOR, and two equal values cancel completely, whatever their sign. For example, XOR-ing <code>[-5, 7, -5]</code> gives 7.",
        },
      ],
      answer: "b",
    },
    {
      id: "bit-power-of-four-test",
      chapter: "dsa-bit-manipulation",
      level: "intermediate",
      skill: "recognise",
      pattern: "bit-manipulation",
      section: "trick-3-the-lowest-set-bit-and-counting-set-bits",
      placement: true,
      kind: "single",
      prompt:
        "<p>Which test correctly decides whether the integer <code>n</code> is a power of four, that is 1, 4, 16, 64 and so on, for any <code>n</code> in the range of a 32-bit signed integer? (<code>0x55555555</code> has a 1 in every even bit position.)</p>",
      choices: [
        {
          id: "a",
          text: "<code>n &gt; 0 &amp;&amp; n % 4 === 0 &amp;&amp; (n &amp; (n - 1)) === 0</code>",
          why: "8 is divisible by 4 and has a single set bit, so this accepts it, but 8 is not a power of four. It also rejects 1, which is 4 to the power 0, because 1 % 4 is 1.",
        },
        {
          id: "b",
          text: "<code>n &gt; 0 &amp;&amp; (n &amp; (n - 1)) === 0 &amp;&amp; (n &amp; 0xAAAAAAAA) !== 0</code>",
          why: "The mask <code>0xAAAAAAAA</code> has a 1 in every odd bit position, so this accepts a power of two only when its one set bit is at an odd position. It accepts 2 and 8, which are not powers of four, and rejects 1 and 4, which are.",
        },
        {
          id: "c",
          text: "<code>n &gt; 0 &amp;&amp; (n &amp; 0x55555555) === n</code>",
          why: "This only says every set bit sits at an even position. 5 is 101 in binary, with set bits at positions 0 and 2, so it passes, but 5 is not a power of four.",
        },
        {
          id: "d",
          text: "<code>n &gt; 0 &amp;&amp; (n &amp; (n - 1)) === 0 &amp;&amp; (n &amp; 0x55555555) !== 0</code>",
          why: "A power of four has exactly one set bit, which the middle test checks, and that bit must be at an even position, which the mask test checks. Together they accept exactly 1, 4, 16 and the other powers of four.",
        },
      ],
      answer: "d",
    },
    {
      id: "bit-remove-item-from-mask",
      chapter: "dsa-bit-manipulation",
      level: "intermediate",
      skill: "recognise",
      pattern: "bit-manipulation",
      section: "trick-4-bitmasks-as-a-compact-set",
      placement: true,
      kind: "single",
      prompt:
        "<p>A set of up to 12 items is stored in one integer <code>mask</code>, where bit <code>i</code> being 1 means that item <code>i</code> is in the set. Which expression removes item 5 whether or not it is present, and changes nothing else?</p>",
      choices: [
        {
          id: "a",
          text: "<code>mask &amp; ~(1 &lt;&lt; 5)</code>",
          why: "<code>1 &lt;&lt; 5</code> has only bit 5 set, <code>~</code> flips it so that only bit 5 is 0, and the AND clears bit 5 and keeps every other bit. If item 5 was already absent, nothing changes.",
        },
        {
          id: "b",
          text: "<code>mask ^ (1 &lt;&lt; 5)</code>",
          why: "XOR toggles the bit. If item 5 is absent, this adds it, which is the opposite of what is wanted.",
        },
        {
          id: "c",
          text: "<code>mask - (1 &lt;&lt; 5)</code>",
          why: "Subtracting only works when bit 5 is set. If item 5 is absent, the subtraction borrows from higher bits and scrambles the set, for example <code>0b11 - 32</code> is -29.",
        },
        {
          id: "d",
          text: "<code>mask &amp; (1 &lt;&lt; 5)</code>",
          why: "This clears every bit except bit 5, so it keeps item 5 alone and throws away the rest of the set. It is the test for membership, not a removal.",
        },
      ],
      answer: "a",
    },
    {
      id: "bit-trace-operator-results",
      chapter: "dsa-bit-manipulation",
      level: "intermediate",
      skill: "trace",
      pattern: "bit-manipulation",
      section: "the-operators-and-what-they-actually-do",
      kind: "single",
      prompt:
        "<p>In JavaScript, what does this expression evaluate to?</p><pre><code>[5 ^ 3, ~5, -7 &gt;&gt; 1, 1 &lt;&lt; 31]</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>[6, -6, -3, 2147483648]</code>",
          why: "The first two are right. But <code>&gt;&gt;</code> rounds toward negative infinity, so -7 &gt;&gt; 1 is -4, not -3. And <code>1 &lt;&lt; 31</code> sets the sign bit of a 32-bit integer, so the result is negative.",
        },
        {
          id: "b",
          text: "<code>[7, -6, -4, -2147483648]</code>",
          why: "7 is 5 | 3. XOR gives 1 only where the bits differ: 101 ^ 011 is 110, which is 6. The other three entries are right.",
        },
        {
          id: "c",
          text: "<code>[6, -6, -4, -2147483648]</code>",
          why: "5 ^ 3 is 110, which is 6. <code>~5</code> flips every bit of a 32-bit integer, which gives -(5 + 1) = -6. -7 &gt;&gt; 1 is -4 because the shift rounds down. <code>1 &lt;&lt; 31</code> lands on the sign bit and gives -2147483648.",
        },
        {
          id: "d",
          text: "<code>[6, -5, -4, 2147483648]</code>",
          why: "<code>~5</code> is -6, not -5, because flipping all bits of x gives -x - 1. And <code>1 &lt;&lt; 31</code> is -2147483648, because bit 31 is the sign bit.",
        },
      ],
      answer: "c",
    },
    {
      id: "bit-trace-mask-updates",
      chapter: "dsa-bit-manipulation",
      level: "intermediate",
      skill: "trace",
      pattern: "bit-manipulation",
      section: "trick-4-bitmasks-as-a-compact-set",
      kind: "single",
      prompt:
        "<p>What is the value of <code>mask</code> after this code runs?</p><pre><code>let mask = 0;\nmask |= 1 &lt;&lt; 3;\nmask |= 1 &lt;&lt; 0;\nmask &amp;= ~(1 &lt;&lt; 3);\nmask ^= 1 &lt;&lt; 2;</code></pre>",
      choices: [
        {
          id: "a",
          text: "13",
          why: "13 is 1101, the set with items 0, 2 and 3, which is what remains if the removal never happens. The line with <code>~(1 &lt;&lt; 3)</code> clears item 3, which is worth 8.",
        },
        {
          id: "b",
          text: "5",
          why: "After the two ORs the mask is 1001, which is 9. The AND with <code>~(1 &lt;&lt; 3)</code> clears bit 3 and leaves 1, and XOR with 4 toggles bit 2 on, giving 101, which is 5.",
        },
        {
          id: "c",
          text: "9",
          why: "9 is the mask after the first two lines, items 3 and 0. The last two lines still change it, one by clearing item 3 and the other by toggling item 2.",
        },
        {
          id: "d",
          text: "4",
          why: "That would leave item 2 only. Item 0 was set earlier and nothing removes it: the clear targets bit 3 and the toggle targets bit 2.",
        },
      ],
      answer: "b",
    },
    {
      id: "bit-count-past-32-bits",
      chapter: "dsa-bit-manipulation",
      level: "intermediate",
      skill: "edge-case",
      pattern: "bit-manipulation",
      section: "the-operators-and-what-they-actually-do",
      kind: "single",
      prompt:
        "<p>The number 4294967301 is <code>2 ** 32 + 5</code>, so in binary it has three set bits: bit 32, bit 2 and bit 0. What does the chapter's <code>countSetBits</code> return for it?</p><pre><code>function countSetBits(n) {\n  let count = 0;\n  while (n !== 0) {\n    n = n &amp; (n - 1);\n    count++;\n  }\n  return count;\n}\n\ncountSetBits(2 ** 32 + 5);</code></pre>",
      choices: [
        {
          id: "a",
          text: "2, because the bitwise operators drop everything above bit 31",
          why: "<code>&amp;</code> first converts both operands to 32-bit signed integers. 2 ** 32 + 5 becomes 5, the first pass gives 5 &amp; 4 = 4, the second gives 4 &amp; 3 = 0, and the loop stops after two passes. Bit 32 was never counted.",
        },
        {
          id: "b",
          text: "3, because the number has three set bits",
          why: "Three is the true number of set bits, but the loop cannot see bit 32. Bitwise operators work on 32 bits, so the number is cut down before the AND is applied.",
        },
        {
          id: "c",
          text: "1, because only the highest set bit is removed",
          why: "Each pass of <code>n &amp; (n - 1)</code> removes the lowest set bit it can see, not the highest. After the first pass 4 is left, which still has a set bit, so the loop runs again.",
        },
        {
          id: "d",
          text: "It throws a <code>RangeError</code>, because the number does not fit in 32 bits",
          why: "JavaScript does not throw for bitwise operators on large numbers. It quietly converts them to 32-bit integers, which is why the result is wrong without any warning.",
        },
      ],
      answer: "a",
    },
    {
      id: "bit-power-of-two-without-guard",
      chapter: "dsa-bit-manipulation",
      level: "intermediate",
      skill: "edge-case",
      pattern: "bit-manipulation",
      section: "trick-3-the-lowest-set-bit-and-counting-set-bits",
      kind: "multi",
      prompt:
        "<p>A teammate drops the <code>n &gt; 0</code> check and writes <code>isPowerOfTwo = (n) =&gt; (n &amp; (n - 1)) === 0</code>. Select every input for which this returns <code>true</code> although the input is not a power of two.</p>",
      choices: [
        {
          id: "a",
          text: "<code>6</code>",
          why: "6 is 110 and 5 is 101, so 6 &amp; 5 is 100, which is 4 and not 0. The expression is false, which is correct, because 6 is not a power of two.",
        },
        {
          id: "b",
          text: "<code>0</code>",
          why: "0 &amp; -1 is 0, so the expression is <code>true</code>. 0 has no set bits and is not a power of two, which is what the <code>n &gt; 0</code> check was for.",
        },
        {
          id: "c",
          text: "<code>-8</code>",
          why: "-8 ends in three 0 bits and -9 does not, so -8 &amp; -9 is -16, which is not 0. The expression is false, so a negative number of this kind is not wrongly accepted.",
        },
        {
          id: "d",
          text: "<code>-2147483648</code>",
          why: "This is the smallest 32-bit integer, with only the sign bit set. Subtracting 1 wraps to 2147483647 when the operands are converted to 32 bits, and the AND is 0, so the expression is <code>true</code>. A negative number is not a power of two.",
        },
      ],
      answers: ["b", "d"],
    },
    {
      id: "bit-three-copies",
      chapter: "dsa-bit-manipulation",
      level: "intermediate",
      skill: "edge-case",
      pattern: "bit-manipulation",
      section: "trick-1-xor-cancels-itself-out",
      kind: "single",
      prompt:
        "<p>The chapter's <code>singleNumber</code> XORs every element into <code>result</code>. What does it return for <code>[3, 3, 3, 8]</code>?</p>",
      choices: [
        {
          id: "a",
          text: "8, the value that appears once",
          why: "That would need every other value to appear an even number of times. 3 appears three times, and the third copy has no partner to cancel it.",
        },
        {
          id: "b",
          text: "3, the value that appears most often",
          why: "The result is <code>3 ^ 3 ^ 3 ^ 8</code>. That is <code>3 ^ 8</code> once the first two copies cancel, and it does not simplify to 3.",
        },
        {
          id: "c",
          text: "11",
          why: "Two copies of 3 cancel and leave 0, so what remains is <code>3 ^ 8</code>. In binary 0011 ^ 1000 is 1011, which is 11. A value that appears an odd number of times survives in the result, so the trick only isolates one value when all the others come in pairs.",
        },
        {
          id: "d",
          text: "0, because the repeated values cancel",
          why: "Values cancel in pairs, and an odd number of copies leaves one behind. Here 3 leaves a copy and 8 appears once, and 3 ^ 8 is not 0.",
        },
      ],
      answer: "c",
    },
    {
      id: "bit-xor-pass-cost",
      chapter: "dsa-bit-manipulation",
      level: "intermediate",
      skill: "complexity",
      pattern: "bit-manipulation",
      section: "trick-1-xor-cancels-itself-out",
      kind: "single",
      prompt:
        "<p>For the chapter's <code>singleNumber</code> on an array of n 32-bit integers, which pair states the worst-case time and the extra space (not counting the input)?</p>",
      choices: [
        {
          id: "a",
          text: "O(n) time and O(1) extra space",
          why: "The loop reads each element once and does one XOR on it, and the only extra memory is the variable <code>result</code>. This is the advantage over a hash set.",
        },
        {
          id: "b",
          text: "O(n) time and O(n) extra space",
          why: "O(n) extra space is what a hash set of the values seen so far would use. The XOR version keeps a single number, so its extra space does not grow with n.",
        },
        {
          id: "c",
          text: "O(n log n) time and O(1) extra space",
          why: "Nothing is sorted. The loop does constant work per element, so the time is linear and no logarithm appears.",
        },
        {
          id: "d",
          text: "O(log n) time and O(1) extra space",
          why: "The single value could be anywhere in the array, so every element has to be read before the answer is known. The loop therefore takes time linear in n.",
        },
      ],
      answer: "a",
    },
    {
      id: "bit-all-subsets-cost",
      chapter: "dsa-bit-manipulation",
      level: "intermediate",
      skill: "complexity",
      pattern: "bit-manipulation",
      section: "trick-4-bitmasks-as-a-compact-set",
      kind: "single",
      prompt:
        "<p>For n items (n at most 20), this code lists every subset. What is its worst-case running time in n, taking the work inside the <code>if</code> as constant?</p><pre><code>for (let mask = 0; mask &lt; (1 &lt;&lt; n); mask++) {\n  for (let i = 0; i &lt; n; i++) {\n    if ((mask &gt;&gt; i) &amp; 1) {\n      include(i);\n    }\n  }\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "O(2ⁿ), because there are 2ⁿ subsets and each one is listed once",
          why: "There are 2ⁿ masks, but each one is examined by an inner loop of n steps. Counting only the outer loop leaves out a factor of n.",
        },
        {
          id: "b",
          text: "O(n²), because there are two nested loops",
          why: "The outer loop runs 2ⁿ times, not n times. Two nested loops give a product of their trip counts, and here that product is not n².",
        },
        {
          id: "c",
          text: "O(n!), because every ordering of the items is tried",
          why: "Masks represent sets, which have no order, so there are 2ⁿ of them and not n! orderings. n! grows much faster than 2ⁿ.",
        },
        {
          id: "d",
          text: "O(n · 2ⁿ), because each of the 2ⁿ masks is scanned bit by bit",
          why: "The outer loop runs 2ⁿ times and the inner loop runs n times for each, so the total is n · 2ⁿ. This is the cost to keep in mind when a bitmask solution loops over every subset.",
        },
      ],
      answer: "d",
    },
    {
      id: "bit-order-clear-lowest",
      chapter: "dsa-bit-manipulation",
      level: "intermediate",
      skill: "trace",
      pattern: "bit-manipulation",
      section: "trick-3-the-lowest-set-bit-and-counting-set-bits",
      kind: "order",
      prompt:
        "<p><code>countSetBits(44)</code> repeats <code>n = n &amp; (n - 1)</code> until <code>n</code> is 0. Put the values <code>n</code> holds in order, starting with the value it begins with and ending with the value that stops the loop.</p>",
      items: [
        { id: "start", text: "<code>44</code>, which is 101100 in binary" },
        { id: "first", text: "<code>40</code>, which is 101000 in binary" },
        { id: "second", text: "<code>32</code>, which is 100000 in binary" },
        { id: "done", text: "<code>0</code>, which has no set bits" },
      ],
      why: "Each pass clears the lowest set bit. 44 is 101100, and 44 &amp; 43 is 101000, which is 40. Then 40 &amp; 39 is 100000, which is 32, and 32 &amp; 31 is 0. The loop ran three times, once for each set bit.",
    },
    {
      id: "bit-shift-negative-rounding",
      chapter: "dsa-bit-manipulation",
      level: "intermediate",
      skill: "trace",
      pattern: "bit-manipulation",
      section: "two-s-complement-how-negative-numbers-look-in-32-bits",
      kind: "single",
      prompt: "<p>What does <code>-7 &gt;&gt; 1</code> evaluate to in JavaScript?</p>",
      choices: [
        {
          id: "a",
          text: "<code>-3</code>",
          why: "That is -3.5 rounded toward zero, as <code>Math.trunc</code> would do. The arithmetic right shift keeps the sign bit and rounds toward minus infinity instead.",
        },
        {
          id: "b",
          text: "<code>-4</code>",
          why: "The shift copies the sign bit in from the left, so the result is the floor of -3.5, which is -4.",
        },
        {
          id: "c",
          text: "<code>2147483644</code>",
          why: "That is the result of the unsigned shift <code>-7 &gt;&gt;&gt; 1</code>, where a 0 is shifted in and the pattern is read as a large positive number.",
        },
        {
          id: "d",
          text: "<code>3</code>",
          why: "A shift by one halves the magnitude but does not change the sign of a negative number when the sign bit is copied in.",
        },
      ],
      answer: "b",
    },
    {
      id: "bit-lowest-bit-negation",
      chapter: "dsa-bit-manipulation",
      level: "intermediate",
      skill: "trace",
      pattern: "bit-manipulation",
      section: "isolating-the-lowest-set-bit-with-negation",
      kind: "single",
      prompt: "<p>In 8 bits, <code>44</code> is <code>00101100</code>. What is <code>44 &amp; -44</code>?</p>",
      choices: [
        {
          id: "a",
          text: "<code>8</code>",
          why: "8 is bit 3, which is set in 44, but it is not the lowest set bit. The lowest is bit 2, worth 4.",
        },
        {
          id: "b",
          text: "<code>0</code>",
          why: "The AND is 0 only when the two share no set bit. 44 and -44 always share the lowest set bit of 44.",
        },
        {
          id: "c",
          text: "<code>4</code>",
          why: "-44 is <code>11010100</code>, which agrees with 44 on the lowest set bit and is inverted above it, so the AND keeps only bit 2, which is 4.",
        },
        {
          id: "d",
          text: "<code>44</code>",
          why: "That would need -44 to have every bit of 44 set, but above the lowest set bit the two patterns are opposite.",
        },
      ],
      answer: "c",
    },
    {
      id: "bit-single-three-mask",
      chapter: "dsa-bit-manipulation",
      level: "intermediate",
      skill: "trace",
      pattern: "bit-manipulation",
      section: "single-number-iii-two-survivors-separated-by-one-bit",
      kind: "single",
      prompt:
        "<p>The two survivors of Single Number III XOR to <code>6</code> (binary <code>110</code>). What value does <code>xor &amp; -xor</code> give, that is, the mask used to split the array in two groups?</p>",
      choices: [
        {
          id: "a",
          text: "<code>1</code>",
          why: "Bit 0 of 6 is 0, so the two survivors agree on it and would land in the same group.",
        },
        {
          id: "b",
          text: "<code>6</code>",
          why: "6 is the XOR itself. It has two set bits, so it is not a single-bit mask and does not name one position.",
        },
        {
          id: "c",
          text: "<code>4</code>",
          why: "Bit 2 is also set in 6 and would separate the survivors, but it is not the lowest set bit, which is what <code>xor &amp; -xor</code> returns.",
        },
        {
          id: "d",
          text: "<code>2</code>",
          why: "6 is 110, its lowest set bit is bit 1, and <code>6 &amp; -6</code> keeps just that bit, which is 2.",
        },
      ],
      answer: "d",
    },
    {
      id: "bit-submask-total",
      chapter: "dsa-bit-manipulation",
      level: "intermediate",
      skill: "complexity",
      pattern: "bit-manipulation",
      section: "enumerating-every-subset-and-every-submask-of-a-mask",
      kind: "single",
      prompt:
        "<p>A bitmask DP loops over every mask of n bits and, for each mask, over all of its submasks. How many iterations does the double loop run in total?</p>",
      choices: [
        {
          id: "a",
          text: "O(2<sup>n</sup>)",
          why: "A single mask already has up to 2<sup>n</sup> submasks, so the total over all masks is much larger than 2<sup>n</sup>.",
        },
        {
          id: "b",
          text: "O(4<sup>n</sup>)",
          why: "That is the cost of two independent loops over all masks. A submask loop visits only subsets of the current mask, which is fewer.",
        },
        {
          id: "c",
          text: "O(3<sup>n</sup>)",
          why: "Each item is in one of three states: outside the mask, in the mask but not in the submask, or in both. That gives 3<sup>n</sup> pairs.",
        },
        {
          id: "d",
          text: "O(n · 2<sup>n</sup>)",
          why: "That would be the cost of scanning n bits for each mask. Counting submask pairs gives a different total, which grows faster.",
        },
      ],
      answer: "c",
    },
    {
      id: "bit-range-and-prefix",
      chapter: "dsa-bit-manipulation",
      level: "intermediate",
      skill: "trace",
      pattern: "bit-manipulation",
      section: "bitwise-and-of-a-range-keep-the-common-prefix",
      kind: "single",
      prompt:
        "<p>What is the bitwise AND of every integer from <code>26</code> to <code>30</code> inclusive? In binary, 26 is <code>11010</code> and 30 is <code>11110</code>.</p>",
      choices: [
        {
          id: "a",
          text: "<code>26</code>",
          why: "That is the left endpoint. It would be the answer only if the range held the single number 26.",
        },
        {
          id: "b",
          text: "<code>16</code>",
          why: "The two endpoints agree on their top two bits, not just the top one, so more than the leading bit survives.",
        },
        {
          id: "c",
          text: "<code>0</code>",
          why: "The result is 0 when the range crosses a power of two, such as 15 to 16. Here 26 to 30 stays inside 16 to 31.",
        },
        {
          id: "d",
          text: "<code>24</code>",
          why: "The common prefix of 11010 and 11110 is 11, and everything below it varies across the range, so the result is 11000, which is 24.",
        },
      ],
      answer: "d",
    },
    {
      id: "bit-sum-first-round",
      chapter: "dsa-bit-manipulation",
      level: "intermediate",
      skill: "trace",
      pattern: "bit-manipulation",
      section: "adding-without-plus-sum-of-two-integers",
      kind: "single",
      prompt:
        "<p>In <code>getSum(5, 3)</code> the loop computes <code>carry = (a &amp; b) &lt;&lt; 1</code>, then <code>a = a ^ b</code>, then <code>b = carry</code>. What are <code>a</code> and <code>b</code> after the first round?</p>",
      choices: [
        {
          id: "a",
          text: "<code>a = 8</code>, <code>b = 0</code>",
          why: "That is the state after the fourth and last round, when no carry is left.",
        },
        {
          id: "b",
          text: "<code>a = 7</code>, <code>b = 1</code>",
          why: "That uses OR for the sum and forgets to shift the carry. The sum bits come from XOR and the carry moves one column up.",
        },
        {
          id: "c",
          text: "<code>a = 2</code>, <code>b = 6</code>",
          why: "The two values are swapped. The XOR (6) becomes the new <code>a</code> and the shifted carry (2) becomes the new <code>b</code>.",
        },
        {
          id: "d",
          text: "<code>a = 6</code>, <code>b = 2</code>",
          why: "5 ^ 3 is 110, which is 6, and (5 &amp; 3) is 001, shifted left to 010, which is 2.",
        },
      ],
      answer: "d",
    },
    {
      id: "bit-range-xor-queries",
      chapter: "dsa-bit-manipulation",
      level: "intermediate",
      skill: "recognise",
      pattern: "bit-manipulation",
      section: "prefix-xor-range-xor-in-o-1-and-counting-subarrays",
      kind: "single",
      prompt:
        "<p>An array is fixed, and a million queries each ask for the XOR of <code>nums[l..r]</code>. Which approach answers each query fastest after a single O(n) setup?</p>",
      choices: [
        {
          id: "a",
          text: "XOR the elements from <code>l</code> to <code>r</code> for every query.",
          why: "That is correct but costs O(r - l + 1) per query, which is O(n) in the worst case, a million times.",
        },
        {
          id: "b",
          text: "Build <code>prefix</code> once and answer each query with <code>prefix[r + 1] ^ prefix[l]</code>.",
          why: "The shared first <code>l</code> elements appear in both prefixes and cancel, so one XOR gives the range in O(1).",
        },
        {
          id: "c",
          text: "Subtract: <code>prefix[r + 1] - prefix[l]</code>.",
          why: "Subtraction gives the difference of two XOR values, which is not the XOR of the range.",
        },
        {
          id: "d",
          text: "Build a segment tree and query it.",
          why: "It works, with O(log n) per query, but the array never changes and XOR is its own inverse, so a prefix array is simpler and faster.",
        },
      ],
      answer: "b",
    },
  ],
  pattern: {
    pattern: "bit-manipulation",
    chapter: "dsa-bit-manipulation",
    signals: [
      "Every value appears in pairs except one, and the prompt asks for O(1) extra space.",
      "The prompt talks about a power of two, a single bit that differs, or counting set bits.",
      "A small fixed number of items, about 20 or fewer, and you need to represent which subset is chosen.",
      "The prompt asks to add, remove or test one item of a set stored in a single integer.",
    ],
    template: "<pre><code>let acc = 0;\nfor (const x of nums) acc ^= x;\nreturn acc;</code></pre>",
    time: "O(1) per operation, O(n) per pass",
    space: "O(1)",
    styles: ["online-assessment", "phone-screen", "onsite"],
  },
};
