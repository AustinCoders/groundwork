import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "ma-recognise-modulo",
      chapter: "dsa-math",
      level: "intermediate",
      skill: "recognise",
      pattern: "math",
      section: "modular-arithmetic-and-the-1e9-7-constant",
      placement: true,
      kind: "single",
      prompt:
        "<p>A problem counts the paths through a large grid and says &quot;return the answer modulo <code>10<sup>9</sup> + 7</code>&quot;. The true count has hundreds of digits. What should the solution do with that sentence?</p>",
      choices: [
        {
          id: "a",
          text: "Count with floating-point numbers and round at the end.",
          why: "A JavaScript number keeps 53 bits of precision, about 16 decimal digits. A count with hundreds of digits is far outside that, so the low digits are lost long before the end.",
        },
        {
          id: "b",
          text: "Reduce every sum and product modulo <code>10<sup>9</sup> + 7</code> as it is computed.",
          why: "The remainder of a sum or a product depends only on the remainders of its parts. So each value can be kept below the modulus after every step, and the final residue is the same as the residue of the huge true answer.",
        },
        {
          id: "c",
          text: "Compute the exact count with <code>BigInt</code> and take the remainder once at the end.",
          why: "It gives the right residue, because <code>BigInt</code> holds any size. But every value grows to hundreds of digits and every operation on it costs more than one on a small residue, and the sentence in the statement is there so that you do not need to build the number.",
        },
        {
          id: "d",
          text: "Stop the loop as soon as a value passes the modulus and report that value.",
          why: "A value that passes the modulus is not the answer, only a partial count. The residue of the final count has to come from reducing at each step and carrying on, not from stopping.",
        },
      ],
      answer: "b",
    },
    {
      id: "ma-recognise-huge-index",
      chapter: "dsa-math",
      level: "intermediate",
      skill: "recognise",
      pattern: "math",
      section: "matrix-exponentiation-for-linear-recurrences",
      placement: true,
      kind: "single",
      prompt:
        "<p>A sequence is defined by <code>a(0) = 1</code>, <code>a(1) = 4</code> and <code>a(n) = 3 * a(n - 1) - a(n - 2)</code>. You must print <code>a(n)</code> modulo <code>10<sup>9</sup> + 7</code> for <code>n</code> up to <code>10<sup>18</sup></code>. Which plan fits?</p>",
      choices: [
        {
          id: "a",
          text: "Raise the 2 by 2 matrix <code>[[3, -1], [1, 0]]</code> to the power n by repeated squaring.",
          why: "One step of the recurrence is a matrix applied to the last two values, so n steps are the matrix to the n-th power. Squaring gets there in O(log n) matrix products, with the products done modulo the prime.",
        },
        {
          id: "b",
          text: "Fill an array of <code>n + 1</code> entries with a loop.",
          why: "The loop is correct for small n, but it runs n times. For n near <code>10<sup>18</sup></code> it will not finish, and the array alone would not fit in memory.",
        },
        {
          id: "c",
          text: "Write the recursion with memoisation.",
          why: "Memoisation stores each of the n values it visits, so it is also linear in n. At this size the recursion would be much deeper than a JavaScript call stack allows.",
        },
        {
          id: "d",
          text: "Find a closed formula with square roots and evaluate it with <code>Math.pow</code>.",
          why: "A closed formula exists for this kind of recurrence, but its square roots are not integers. Evaluating them in floating point loses the low digits long before n gets large, and a remainder needs every digit.",
        },
      ],
      answer: "a",
    },
    {
      id: "ma-recognise-many-primes",
      chapter: "dsa-math",
      level: "intermediate",
      skill: "recognise",
      pattern: "math",
      section: "primes-trial-division-and-the-sieve",
      placement: true,
      kind: "single",
      prompt:
        "<p>You get 200,000 queries, each asking whether a given integer between 2 and 5,000,000 is prime. Which plan does the least total work?</p>",
      choices: [
        {
          id: "a",
          text: "For each query, divide by every integer from 2 up to one less than the number.",
          why: "A single query can take about five million divisions, and 200,000 of them multiply that by 200,000.",
        },
        {
          id: "b",
          text: "For each query, test divisors only up to its square root.",
          why: "This is correct and much faster than testing every divisor, about 2,236 divisions for the largest value. But it repeats that work for every query, so the total is still 200,000 times a few thousand divisions, more than one table that serves all queries.",
        },
        {
          id: "c",
          text: "Build a sieve of Eratosthenes up to 5,000,000 once, then answer each query by reading one entry.",
          why: "The sieve costs O(n log log n) once, a few steps per number, and every query after that is a single lookup. The work does not grow with the number of queries.",
        },
        {
          id: "d",
          text: "Sort the queries and test each one by trial division against the previous prime found.",
          why: "Sorting does not help, because primality of one number says nothing about the next. A number is prime only if no smaller prime divides it, so one earlier prime found is not enough information.",
        },
      ],
      answer: "c",
    },
    {
      id: "ma-sieve-cost",
      chapter: "dsa-math",
      level: "intermediate",
      skill: "complexity",
      pattern: "math",
      section: "primes-trial-division-and-the-sieve",
      kind: "single",
      prompt:
        "<p>The sieve of Eratosthenes marks the multiples of each prime p, starting at <code>p * p</code>, for every p up to n. What is its running time?</p>",
      choices: [
        {
          id: "a",
          text: "O(n log n)",
          why: "That is the sum of n / k over every integer k up to n, which is what crossing out the multiples of every number would cost. The sieve only crosses the multiples of primes, and the sum of 1 / p over primes grows much more slowly than the sum of 1 / k.",
        },
        {
          id: "b",
          text: "O(n)",
          why: "This would hold if each composite were crossed once. It is not: in the trace for n = 30, the numbers 12, 18, 24 and 30 are each crossed by more than one prime, and the total crossing count exceeds the count of composites.",
        },
        {
          id: "c",
          text: "O(n * sqrt(n))",
          why: "That is the cost of testing every number below n by trial division up to its square root. The sieve never divides: it only steps through multiples.",
        },
        {
          id: "d",
          text: "O(n log log n)",
          why: "The crossing work is at most n times the sum of 1 / p over primes up to the square root of n. By Mertens' theorem that sum grows like ln ln n, and the outer loop over n numbers adds O(n).",
        },
      ],
      answer: "d",
    },
    {
      id: "ma-euclid-steps",
      chapter: "dsa-math",
      level: "intermediate",
      skill: "complexity",
      pattern: "math",
      section: "gcd-and-lcm-euclid-on-remainders",
      kind: "single",
      prompt:
        "<p>Euclid's algorithm replaces <code>(a, b)</code> with <code>(b, a % b)</code> until <code>b</code> is 0. How many iterations does it need in the worst case, for <code>a &gt;= b</code>?</p>",
      choices: [
        {
          id: "a",
          text: "O(min(a, b))",
          why: "That is the cost of trying every candidate divisor from the smaller number downward. Euclid's remainder drops fast: it is below half of the larger number, so the pair shrinks much faster than one unit at a time.",
        },
        {
          id: "b",
          text: "O(log(min(a, b)))",
          why: "a % b is always less than a / 2, so every two iterations the larger number of the pair is at least halved. The slowest inputs are consecutive Fibonacci numbers, and they still take a logarithmic number of steps.",
        },
        {
          id: "c",
          text: "O(a / b)",
          why: "The quotient a / b is how much one remainder step removes, not how many steps there are. For <code>gcd(1000000, 999999)</code> the quotient is 1 and the loop takes two iterations, while for <code>gcd(1000000, 1)</code> the quotient is a million and it takes one.",
        },
        {
          id: "d",
          text: "O(sqrt(a))",
          why: "A square-root bound belongs to trial division for primality. Euclid does not look for divisors one by one, so no square root appears.",
        },
      ],
      answer: "b",
    },
    {
      id: "ma-trace-powmod",
      chapter: "dsa-math",
      level: "intermediate",
      skill: "trace",
      pattern: "math",
      section: "fast-exponentiation",
      kind: "single",
      prompt:
        "<p>Fast exponentiation computes <code>powMod(3, 13, 1000)</code> by looking at the bits of the exponent from the lowest. It starts with <code>result = 1</code>, <code>b = 3</code>. In each round it multiplies <code>b</code> into <code>result</code> when the current bit is 1, then replaces <code>b</code> by <code>b * b % 1000</code>. What are <code>b</code> and <code>result</code> at the <b>start of the fourth and last round</b>, where the remaining exponent is 1?</p>",
      choices: [
        {
          id: "a",
          text: "<code>b = 561</code>, <code>result = 243</code>",
          why: "Round 1 (bit 1) sets result to 3. Round 2 (bit 0) leaves it. Round 3 (bit 1) makes it 3 * 81 = 243. b goes 3, 9, 81, then 6561 mod 1000 = 561. Round 4 will then give 243 * 561 mod 1000 = 323.",
        },
        {
          id: "b",
          text: "<code>b = 561</code>, <code>result = 323</code>",
          why: "323 is the final answer, the value of <code>result</code> after the last round multiplies in b. At the start of that round it has not yet been multiplied.",
        },
        {
          id: "c",
          text: "<code>b = 6561</code>, <code>result = 243</code>",
          why: "6561 is 81 * 81 before the reduction. Every squaring is followed by <code>% 1000</code>, which turns 6561 into 561.",
        },
        {
          id: "d",
          text: "<code>b = 81</code>, <code>result = 243</code>",
          why: "81 is the value of b during the third round. By the start of the fourth round it has been squared once more, to 561.",
        },
      ],
      answer: "a",
    },
    {
      id: "ma-precision-trap",
      chapter: "dsa-math",
      level: "intermediate",
      skill: "edge-case",
      pattern: "math",
      section: "the-modular-multiplication-problem-and-two-fixes",
      kind: "single",
      prompt:
        "<p>In Node, <code>(999999999 * 999999998) % 1000000007</code> is evaluated with ordinary numbers. The true value of the remainder is 72. What happens?</p>",
      choices: [
        {
          id: "a",
          text: "It returns 72, since <code>%</code> is an exact operation.",
          why: "<code>%</code> is exact for the numbers it receives, but it receives the already rounded product. The product 999999997000000002 is above 2<sup>53</sup>, and the low digits were lost when it was formed.",
        },
        {
          id: "b",
          text: "It throws a <code>RangeError</code> because the product is too large.",
          why: "Numbers are floating-point values, and a product that is too precise for 53 bits is rounded, not rejected. An error is raised only for operations such as converting a non-integer to a BigInt.",
        },
        {
          id: "c",
          text: "It returns <code>NaN</code>.",
          why: "<code>NaN</code> comes from undefined operations such as <code>0 / 0</code>. A large finite product is still a finite number, just a rounded one.",
        },
        {
          id: "d",
          text: "It returns 70, a wrong answer with no error.",
          why: "The product 999999997000000002 is not representable. It is stored as 999999997000000000, and that value modulo 1000000007 is 70.",
        },
      ],
      answer: "d",
    },
    {
      id: "ma-negative-modulo",
      chapter: "dsa-math",
      level: "intermediate",
      skill: "edge-case",
      pattern: "math",
      section: "numbers-in-javascript-where-exactness-ends",
      kind: "single",
      prompt:
        "<p>You need <code>(3 - 5)</code> as a residue modulo 7, in the range 0 to 6. Which expression gives it in JavaScript?</p>",
      choices: [
        {
          id: "a",
          text: "<code>(3 - 5) % 7</code>",
          why: "In JavaScript the result of <code>%</code> has the sign of the left operand, so this is <code>-2</code>, not a residue in 0 to 6.",
        },
        {
          id: "b",
          text: "<code>Math.abs((3 - 5) % 7)</code>",
          why: "This gives 2. But 2 is the residue of 5 - 3, and the residue of 3 - 5 is the other way round, 7 - 2 = 5. Taking the absolute value flips the sign, which changes the residue.",
        },
        {
          id: "c",
          text: "<code>((3 - 5) % 7 + 7) % 7</code>",
          why: "The first <code>%</code> gives -2, adding 7 gives 5, and the last <code>%</code> keeps the result in range even when the first one was already positive. 5 is correct, because 3 - 5 + 7 = 5.",
        },
        {
          id: "d",
          text: "<code>(3 - 5) &gt;&gt;&gt; 0</code>",
          why: "This turns the value into an unsigned 32-bit number, 4294967294, and does not reduce it modulo 7. It is also tied to 32 bits, so it would be wrong for larger values anyway.",
        },
      ],
      answer: "c",
    },
    {
      id: "ma-sieve-start",
      chapter: "dsa-math",
      level: "intermediate",
      skill: "edge-case",
      pattern: "math",
      section: "primes-trial-division-and-the-sieve",
      kind: "single",
      prompt:
        "<p>In the sieve, the inner loop for a prime p starts at <code>p * p</code> instead of <code>2 * p</code>. Why is nothing missed?</p>",
      choices: [
        {
          id: "a",
          text: "A multiple <code>k * p</code> with k below p has a prime factor smaller than p, so an earlier prime already crossed it.",
          why: "Any prime factor of k is smaller than p, and its own pass crossed every multiple of it, including <code>k * p</code>. So the first multiple of p that no earlier prime has crossed is <code>p * p</code>.",
        },
        {
          id: "b",
          text: "Starting at <code>2 * p</code> would cross out p itself.",
          why: "<code>2 * p</code> is twice p, so it is a different number from p. The loop never crosses p, in either version.",
        },
        {
          id: "c",
          text: "<code>p * p</code> is the first multiple of p.",
          why: "The multiples of p begin at p itself and continue with 2p, 3p and so on, so <code>p * p</code> is not the first one. The point is that the earlier ones are already crossed.",
        },
        {
          id: "d",
          text: "Numbers below <code>p * p</code> are all prime.",
          why: "This is false. With p = 5 the numbers 4, 6, 8, 9 and 10 are all below 25 and all composite. They were crossed by the smaller primes 2 and 3.",
        },
      ],
      answer: "a",
    },
    {
      id: "ma-stars-and-bars",
      chapter: "dsa-math",
      level: "intermediate",
      skill: "recognise",
      pattern: "math",
      section: "counting-stars-and-bars-catalan-numbers",
      kind: "single",
      prompt: "<p>In how many ways can 7 identical coins be placed into 3 labelled jars, if a jar may stay empty?</p>",
      choices: [
        {
          id: "a",
          text: "35, which is <code>C(7, 3)</code>.",
          why: "<code>C(7, 3)</code> is the number of ways to choose 3 of 7 different items. The coins are identical and the jars are what distinguishes the outcomes, so this counts something else.",
        },
        {
          id: "b",
          text: "2187, which is <code>3<sup>7</sup></code>.",
          why: "This counts the ways to send 7 coins that can be told apart to one of 3 jars each. For identical coins, many of those assignments are the same outcome.",
        },
        {
          id: "c",
          text: "28, which is <code>C(8, 2)</code>.",
          why: "<code>C(8, 2)</code> is the stars-and-bars count for 6 coins in 3 jars, with n + k - 1 = 8. With 7 coins the top number is 9.",
        },
        {
          id: "d",
          text: "36, which is <code>C(9, 2)</code>.",
          why: "Lay the 7 coins as stars and add 2 dividers to separate 3 jars. An outcome is the choice of which 2 of the 9 positions hold dividers, so <code>C(7 + 3 - 1, 3 - 1) = C(9, 2) = 36</code>.",
        },
      ],
      answer: "d",
    },
    {
      id: "ma-reverse-negative",
      chapter: "dsa-math",
      level: "intermediate",
      skill: "edge-case",
      pattern: "math",
      section: "reverse-integer-digits-and-overflow",
      kind: "single",
      prompt:
        "<p>A reverse-digits loop is run directly on <code>x = -123</code>, taking the last digit with <code>x % 10</code> and dropping it with <code>Math.floor(x / 10)</code>. What goes wrong?</p>",
      choices: [
        {
          id: "a",
          text: "<code>-123 % 10</code> throws for a negative left operand.",
          why: "<code>%</code> accepts negative operands and returns <code>-3</code> here. No error is raised.",
        },
        {
          id: "b",
          text: "<code>Math.floor(-12.3)</code> is <code>-13</code>, so a digit is skipped.",
          why: "Floor rounds toward negative infinity, so dropping the last digit of -123 leaves -13, not -12. The next digit read is -3 again, where it should be -2. <code>Math.trunc</code>, or working on the absolute value, avoids it.",
        },
        {
          id: "c",
          text: "<code>-123 % 10</code> is positive 3, which flips the sign of the digits.",
          why: "The result of <code>%</code> takes the sign of the left operand, so it is <code>-3</code>, not 3.",
        },
        {
          id: "d",
          text: "Nothing goes wrong: <code>Math.floor</code> and <code>%</code> work the same for negative numbers.",
          why: "They do not. <code>%</code> keeps the sign and <code>Math.floor</code> rounds down, which for negative non-integers moves away from zero. The loop reads wrong digits, and the example shows the first one.",
        },
      ],
      answer: "b",
    },
    {
      id: "ma-binomial-conditions",
      chapter: "dsa-math",
      level: "intermediate",
      skill: "edge-case",
      pattern: "math",
      section: "modular-inverse-and-ncr-mod-p",
      kind: "multi",
      prompt:
        "<p>You compute <code>C(n, r)</code> modulo p as <code>fact[n] * invFact[r] * invFact[n - r]</code>, where the inverse factorials come from <code>fact[limit]</code> raised to <code>p - 2</code>. Which conditions are needed for the recipe to be correct? Select all that apply.</p>",
      choices: [
        {
          id: "a",
          text: "p is prime.",
          why: "Fermat's little theorem, which says that a to the p - 2 is the inverse of a, is a statement about a prime modulus. For a composite modulus a factorial may have no inverse at all.",
        },
        {
          id: "b",
          text: "n is smaller than p.",
          why: "If n is at least p, then p is one of the factors of n!, so n! is 0 modulo p and has no inverse. The recipe would divide by zero.",
        },
        {
          id: "c",
          text: "r is at most n over 2.",
          why: "No such limit is needed. <code>C(n, r)</code> equals <code>C(n, n - r)</code>, so the formula is symmetric and works for every r from 0 to n.",
        },
        {
          id: "d",
          text: "p is exactly <code>10<sup>9</sup> + 7</code>.",
          why: "That prime is only the usual choice. Any prime above n works, such as 998244353, which is also common.",
        },
      ],
      answers: ["a", "b"],
    },
    {
      id: "ma-order-ncr-tables",
      chapter: "dsa-math",
      level: "intermediate",
      skill: "trace",
      pattern: "math",
      section: "modular-inverse-and-ncr-mod-p",
      kind: "order",
      prompt:
        "<p>Put the steps of the factorial-table method for <code>C(n, r)</code> modulo a prime p in the order they must run. Start with the first table and end with an answer.</p>",
      items: [
        {
          id: "fact",
          text: "Fill <code>fact[0..limit]</code> going forward, reducing by p each time.",
        },
        {
          id: "last",
          text: "Compute <code>invFact[limit]</code> as <code>fact[limit]</code> to the power p - 2 modulo p.",
        },
        {
          id: "back",
          text: "Fill <code>invFact[i - 1] = invFact[i] * i</code> for i from limit down to 1.",
        },
        {
          id: "query",
          text: "Answer a query as <code>fact[n] * invFact[r] * invFact[n - r]</code> modulo p.",
        },
      ],
      why: "The inverse of the last factorial needs that factorial, so the forward table comes first. The backward loop starts from <code>invFact[limit]</code>, so it comes after the power. A query reads all three tables, so it comes last, and every later query reuses them without rebuilding.",
    },
  ],
  pattern: {
    pattern: "math",
    chapter: "dsa-math",
    signals: [
      "The statement says modulo 10^9 + 7, or the exact answer would have hundreds of digits.",
      "An exponent, index or count is 10^9 or more, so only O(log n) steps are affordable.",
      "The question is about primes, divisors, common multiples or the digits of a number.",
      "The answer counts arrangements or choices, and a binomial or Catalan number could count it in closed form.",
    ],
    template:
      "<pre><code>while (e &gt; 0n) { if (e &amp; 1n) result = (result * b) % m; b = (b * b) % m; e &gt;&gt;= 1n; }</code></pre>",
    time: "O(log n) per power, O(n log log n) for a sieve",
    space: "O(1) for a power, O(n) for a sieve",
    styles: ["online-assessment", "phone-screen", "onsite"],
  },
};
