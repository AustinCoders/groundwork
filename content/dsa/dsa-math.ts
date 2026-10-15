import type { Chapter } from "../types";

export const dsaMath: Chapter = {
  id: "dsa-math",
  num: "I19",
  title: "Math for interviews",
  short: "Math for interviews",
  levels: ["intermediate"],
  prerequisites: ["dsa-basic-recursion"],
  practice: [
    "ex-gcd-lcm-of-array",
    "ex-trailing-zeroes-factorial",
    "ex-convert-to-base",
    "ex-excel-column-title",
    "ex-reverse-integer",
    "ex-count-primes",
    "ex-pow-mod",
    "ex-fast-power",
    "ex-pascal-row",
    "ex-nck-mod-prime",
    "ex-unique-binary-search-trees",
    "ex-find-the-winner-josephus",
    "ex-ugly-number-ii",
    "ex-happy-number",
    "ex-integer-sqrt",
    "ex-integer-to-roman",
    "ex-roman-to-integer",
    "ex-fibonacci-mod-matrix",
    "ex-number-to-words",
  ],
  ready: true,
  subtitle:
    "Small, exact facts about numbers: how Euclid, the sieve, modular arithmetic and a few counting identities turn huge inputs into short loops, and where JavaScript's numbers stop being exact.",
  body: `<h3>What these problems have in common</h3>
<p>
  A math problem in an interview is usually not hard mathematics. It is a
  small fact about integers that, once you know it, replaces a loop over a
  huge range with a loop over a handful of steps. "Is this number prime?" looks
  like n divisions and costs about the square root of n. "How many trailing
  zeros does 1000000! have?" looks impossible and takes eight divisions.
  "Return the answer modulo 1000000007" tells you the true answer has
  thousands of digits and that you must never build it.
</p>
<p>
  The chapter walks through the facts that come up again and again, in the
  order each one is needed to build the next: how JavaScript stores numbers,
  gcd, primes, modular arithmetic, fast exponentiation, the modular inverse,
  binomial coefficients, Pascal's triangle, Catalan numbers, matrix
  exponentiation, Josephus, number formatting, digit problems, happy and ugly
  numbers, and the counting side of probability. For each one the order is the
  same: the shape of the problem, the idea derived from small cases, the
  complete JavaScript, a trace by hand, the cost, and the mistakes that lose
  offers.
</p>
<p>
  The input limits tell you which tool to reach for. Read them before you read
  the story.
</p>
<table>
  <tr><th>What the statement says</th><th>What it usually means</th><th>Tool</th></tr>
  <tr><td>n up to about 10<sup>6</sup> to 10<sup>7</sup>, many primality or factor queries</td><td>Preprocess once for every number up to n</td><td>Sieve, smallest-prime-factor table</td></tr>
  <tr><td>One number n up to about 10<sup>12</sup></td><td>A loop up to the square root is affordable</td><td>Trial division</td></tr>
  <tr><td>"Return the result modulo 10<sup>9</sup> + 7"</td><td>The exact answer is too big to hold</td><td>Modular arithmetic with BigInt for the products</td></tr>
  <tr><td>An exponent or index up to 10<sup>9</sup> or 10<sup>18</sup></td><td>Only O(log n) steps are allowed</td><td>Fast exponentiation, matrix exponentiation</td></tr>
  <tr><td>"Number of ways to choose / arrange / split"</td><td>A closed form exists, or a small table fills it</td><td>Binomials, stars and bars, Catalan</td></tr>
  <tr><td>"Every k-th person is removed" and n is large</td><td>A recurrence on the circle size</td><td>Josephus</td></tr>
</table>

<h3>Numbers in JavaScript: where exactness ends</h3>
<p>
  Every JavaScript <code>Number</code> is a 64-bit floating-point value. It has
  53 bits for the digits, which means every integer from -(2<sup>53</sup> - 1)
  to 2<sup>53</sup> - 1 is stored exactly, and beyond that the gaps open up.
  Between 2<sup>53</sup> and 2<sup>54</sup> the representable integers are the
  even ones only, so the odd ones round to a neighbour. This is not a rare edge
  case in this chapter. A product of two numbers below 10<sup>9</sup> is about
  10<sup>18</sup>, far past the limit, and the result is silently wrong, not an error.
</p>
<figure>
  <svg viewBox="0 0 640 170" class="dg" role="img" aria-label="Seven consecutive integers around two to the fifty-third power. The odd ones above that point, ending in 3 and 5, are not representable and round to a neighbour that ends in 2 and 6.">
    <g class="rough">
      <rect class="boxg" x="20" y="40" width="80" height="40" />
      <rect class="boxg" x="100" y="40" width="80" height="40" />
      <rect class="boxg" x="180" y="40" width="80" height="40" />
      <rect class="boxr" x="260" y="40" width="80" height="40" />
      <rect class="boxg" x="340" y="40" width="80" height="40" />
      <rect class="boxr" x="420" y="40" width="80" height="40" />
      <rect class="boxg" x="500" y="40" width="80" height="40" />
    </g>
    <text class="sm" x="60" y="65" text-anchor="middle">…990</text>
    <text class="sm" x="140" y="65" text-anchor="middle">…991</text>
    <text class="sm" x="220" y="65" text-anchor="middle">…992</text>
    <text class="sm rd" x="300" y="65" text-anchor="middle">…993</text>
    <text class="sm" x="380" y="65" text-anchor="middle">…994</text>
    <text class="sm rd" x="460" y="65" text-anchor="middle">…995</text>
    <text class="sm" x="540" y="65" text-anchor="middle">…996</text>
    <text class="lbl" x="140" y="28" text-anchor="middle" style="font-size:14px">2^53 - 1</text>
    <text class="lbl" x="220" y="28" text-anchor="middle" style="font-size:14px">2^53</text>
    <text class="sm rd" x="300" y="105" text-anchor="middle">becomes …992</text>
    <text class="sm rd" x="460" y="105" text-anchor="middle">becomes …996</text>
    <text class="sm" x="20" y="145">The digits shown are the end of 9007199254740990 … 9007199254740996. Green: stored exactly. Red: not stored.</text>
  </svg>
  <figcaption>Above 2<sup>53</sup> the odd integers fall into the gaps. 9007199254740993 reads back as 9007199254740992.</figcaption>
</figure>
<pre><code>Number.MAX_SAFE_INTEGER;            <span class="c">// 9007199254740991, which is 2 ** 53 - 1</span>
2 ** 53 + 1 === 2 ** 53;            <span class="c">// true: the +1 is lost</span>
Number.isSafeInteger(2 ** 53);      <span class="c">// false</span>
999999999 * 999999998;              <span class="c">// 999999997000000000, but written out exactly the product is 999999997000000002</span>
(999999999n * 999999998n);          <span class="c">// 999999997000000002n: BigInt keeps every digit</span></code></pre>
<p>
  <code>BigInt</code> is the built-in type for integers of any size. It is the
  right tool for the few multiplications that leave the safe range, and these
  rules are worth knowing before you use it in an interview:
</p>
<ul>
  <li>You write a BigInt literal with a trailing <code>n</code>, or convert with <code>BigInt(value)</code>. <code>BigInt(1.5)</code> throws a <code>RangeError</code>; only integers convert.</li>
  <li>You cannot mix the two types in arithmetic: <code>1n + 1</code> throws a <code>TypeError</code>. Convert one side explicitly.</li>
  <li><code>Math.sqrt</code>, <code>Math.max</code> and the other <code>Math</code> functions reject BigInt. <code>JSON.stringify</code> throws on it too.</li>
  <li>Division truncates toward zero and <code>%</code> takes the sign of the dividend, just as for Numbers: <code>-7n / 2n</code> is <code>-3n</code> and <code>-7n % 3n</code> is <code>-1n</code>.</li>
  <li>Comparison across types works (<code>1n &lt; 2</code> is true, <code>1n == 1</code> is true) but <code>1n === 1</code> is false, because the types differ.</li>
  <li>Converting back with <code>Number(big)</code> rounds silently when the value is past 2<sup>53</sup>. Convert back only when the value is known to be small, such as a residue below the modulus.</li>
</ul>
<p>
  Two more details bite in integer code. The remainder operator keeps the sign of the left side, so <code>-7 % 3</code> is <code>-1</code>, not
  <code>2</code>. A residue that should be in [0, m) needs a helper. And the
  bitwise operators (<code>|</code>, <code>&amp;</code>, <code>&lt;&lt;</code>,
  <code>&gt;&gt;</code>) first convert the number to a signed 32-bit integer, so
  they are fine for values below 2<sup>31</sup> and wrong above it.
</p>
<pre><code>function mod(a, m) {
  return ((a % m) + m) % m; <span class="c">// the result is always in [0, m), even for negative a</span>
}

mod(-7, 3);          <span class="c">// 2</span>
-7 % 3;              <span class="c">// -1</span>
2147483648 &gt;&gt; 1;    <span class="c">// -1073741824: the shift sees the 32-bit pattern of a negative number</span>
2147483648 &gt;&gt;&gt; 1;   <span class="c">// 1073741824: unsigned shift reads it as 2^31 and is correct here</span></code></pre>
<div class="warn">
  <span class="ttl">⚠ Math.floor(a / b) and Math.log are not always the integer answer</span>
  Integer division is <code>Math.floor(a / b)</code> for non-negative values,
  and <code>Math.trunc(a / b)</code> to truncate toward zero when negative values
  can occur. Both go through a floating-point division, so for a above 2<sup>53</sup>
  use BigInt. Likewise <code>Math.log(1000) / Math.log(10)</code> evaluates to
  <code>2.9999999999999996</code>, so <code>Math.floor</code> of it says 2 and the
  digit count comes out one too small. Count digits with
  <code>String(n).length</code> or a division loop instead.
</div>

<h3>The modular multiplication problem, and two fixes</h3>
<p>
  Most "modulo 10<sup>9</sup> + 7" problems multiply two residues that are each
  just below 10<sup>9</sup> + 7. The product is near 10<sup>18</sup>, past
  2<sup>53</sup>, so the plain expression <code>(a * b) % m</code> has already lost
  its low digits before the <code>%</code> runs. The plain version fails
  quietly, which is the dangerous part.
</p>
<pre><code>function naiveMulMod(a, b, m) {
  return (a * b) % m;
}

function mulMod(a, b, m) {
  return Number((BigInt(a) * BigInt(b)) % BigInt(m)); <span class="c">// exact: BigInt holds the whole product</span>
}

naiveMulMod(999999999, 999999998, 1000000007); <span class="c">// 70, wrong</span>
mulMod(999999999, 999999998, 1000000007);      <span class="c">// 72, correct: (-8) * (-9) mod p</span></code></pre>
<p>
  The result of <code>mulMod</code> is a residue below <code>m</code>, so
  converting it back to a Number is safe. When the modulus is small enough that
  every product of two residues fits in 2<sup>53</sup>, which is the case for
  <code>m - 1 &lt;= 94906265</code> (about 9.4 * 10<sup>7</sup>), plain
  <code>(a * b) % m</code> is exact and BigInt is not needed. Multiplying a
  residue by a small loop counter is also safe: <code>fact * i</code> stays
  below 2<sup>53</sup> for every <code>i</code> up to about nine million when the
  modulus is 10<sup>9</sup> + 7, which is why a factorial table filled with a
  plain Number loop is correct, while a product of two residues is not.
</p>
<p>
  If you do not want BigInt, the second fix is to build the product by
  doubling and adding, the same halving idea as fast exponentiation below. Every
  intermediate value stays below twice the modulus, so it works for any modulus
  up to 2<sup>52</sup> using only Numbers, at O(log b) per multiplication.
</p>
<pre><code>function mulModNoBigInt(a, b, m) {
  let result = 0;
  a %= m;
  while (b &gt; 0) {
    if (b % 2 === 1) result = (result + a) % m; <span class="c">// add the current doubling of a when this bit of b is set</span>
    a = (a * 2) % m;                            <span class="c">// a, 2a, 4a, ... each reduced mod m</span>
    b = Math.floor(b / 2);
  }
  return result;
}</code></pre>

<h3>gcd and lcm: Euclid on remainders</h3>
<p>
  The greatest common divisor of a and b is the largest integer that divides
  both. Listing divisors costs O(min(a, b)). Euclid's observation is that the
  divisors of the pair (a, b) are exactly the divisors of the pair (b, a mod b).
  To see why, write a = q * b + r with r = a mod b. A number d that divides b
  and a divides q * b and therefore divides a - q * b = r. A number d that
  divides b and r divides q * b + r = a. Both pairs have the same common
  divisors, so they have the same greatest one:
  gcd(a, b) = gcd(b, a mod b), and gcd(a, 0) = a stops the recursion.
</p>
<pre><code>function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const r = a % b;
    a = b;
    b = r;
  }
  return a;
}

function lcm(a, b) {
  if (a === 0 || b === 0) return 0;
  return (Math.abs(a) / gcd(a, b)) * Math.abs(b); <span class="c">// divide first, then multiply, so the intermediate stays small</span>
}

gcd(252, 105); <span class="c">// 21</span>
lcm(4, 6);     <span class="c">// 12</span></code></pre>
<h4>Dry run: gcd(252, 105)</h4>
<table>
  <tr><th>a</th><th>b</th><th>a % b</th><th>next pair</th></tr>
  <tr><td>252</td><td>105</td><td>42</td><td>(105, 42)</td></tr>
  <tr><td>105</td><td>42</td><td>21</td><td>(42, 21)</td></tr>
  <tr><td>42</td><td>21</td><td>0</td><td>(21, 0), stop: the answer is 21</td></tr>
</table>
<p>
  <b>Cost.</b> It takes O(log(min(a, b))) steps. The reason: for a at least b, a mod b is
  less than a / 2. If b is at most a / 2, then a mod b is less than b, so it is
  below a / 2. If b is more than a / 2, then a mod b = a - b, which is also below
  a / 2. One step turns (a, b) into (b, r) with r below a / 2, and the next step turns
  that into (r, r2), so after every two steps the larger number of the pair is less than
  half of what it was. After the first step the pair is bounded by min(a, b), which gives the
  logarithm of the smaller input. The slowest inputs are pairs of consecutive Fibonacci numbers
  (Lamé's theorem, quoted here and not proved).
</p>
<p>
  <b>lcm and overflow.</b> The identity is gcd(a, b) * lcm(a, b) = a * b, and
  you divide first because a * b may leave the safe range even when the lcm
  itself does not. The lcm of 1000000007 and 998244353 is their product, and as a
  Number it comes out as 998244359987710500 while the true value is
  998244359987710471. When the answer can pass 2<sup>53</sup>, switch to BigInt.
</p>
<pre><code>function gcdBig(a, b) {
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

function lcmBig(a, b) {
  return (a / gcdBig(a, b)) * b;
}

lcmBig(1000000007n, 998244353n); <span class="c">// 998244359987710471n</span></code></pre>
<p>
  The lcm of a whole array is a fold: <code>lcm = lcm(lcm(a0, a1), a2)</code>, and
  the gcd of an array folds the same way. Two other uses show up often.
  Reducing a fraction divides numerator and denominator by their gcd. Hashing a
  direction, such as the slope between two points, divides both differences by
  their gcd so that (2, 4) and (1, 2) become the same key.
</p>
<h4>Extended Euclid: finding x and y with a * x + b * y = gcd(a, b)</h4>
<p>
  Running the same recursion backward produces the coefficients. Suppose the
  recursive call on (b, a mod b) returned x' and y' with b * x' + (a mod b) * y' = g.
  Since a mod b = a - floor(a / b) * b, that says a * y' + b * (x' - floor(a / b) * y') = g,
  so the pair for (a, b) is x = y' and y = x' - floor(a / b) * y'. The base case
  (a, 0) gives x = 1, y = 0.
</p>
<pre><code>function extendedGcd(a, b) {
  if (b === 0) return { g: a, x: 1, y: 0 };
  const { g, x, y } = extendedGcd(b, a % b);
  return { g, x: y, y: x - Math.floor(a / b) * y };
}

extendedGcd(240, 46); <span class="c">// { g: 2, x: -9, y: 47 }, since 240 * (-9) + 46 * 47 = 2</span></code></pre>
<table>
  <tr><th>call</th><th>a mod b</th><th>q = floor(a / b)</th><th>(x, y) returned</th></tr>
  <tr><td>(240, 46)</td><td>10</td><td>5</td><td>(-9, 47)</td></tr>
  <tr><td>(46, 10)</td><td>6</td><td>4</td><td>(2, -9)</td></tr>
  <tr><td>(10, 6)</td><td>4</td><td>1</td><td>(-1, 2)</td></tr>
  <tr><td>(6, 4)</td><td>2</td><td>1</td><td>(1, -1)</td></tr>
  <tr><td>(4, 2)</td><td>0</td><td>2</td><td>(0, 1)</td></tr>
  <tr><td>(2, 0)</td><td>base case</td><td>-</td><td>(1, 0)</td></tr>
</table>
<p class="sub">
  Read the table from the bottom up: each row computes its pair from the row
  below it. The recursion depth is the number of Euclid steps, which is
  logarithmic, so the stack is not a concern.
</p>
<p>
  The Bézout identity this gives (a * x + b * y = gcd) has an interview use that
  is easy to forget. In "Water and Jug", you can measure exactly z litres with
  jugs of capacity x and y if and only if z is at most x + y and z is a multiple
  of gcd(x, y), because the amounts reachable by fills, empties and pours are
  exactly the integer combinations of x and y.
</p>
<pre><code>function canMeasureWater(x, y, z) {
  if (z === 0) return true;
  return z &lt;= x + y &amp;&amp; z % gcd(x, y) === 0;
}</code></pre>
<div class="say">
  <span class="ttl">Say it like this →</span> "gcd(a, b) equals gcd(b, a mod b)
  because any common divisor of a and b also divides the remainder, and the other
  way round. The remainder at least halves the larger number every two steps, so
  it is logarithmic. For the lcm I divide by the gcd before multiplying so the
  intermediate value stays small, and I check that the result is a safe integer."
</div>

<h3>Primes: trial division and the sieve</h3>
<p>
  <b>Is n prime?</b> If n = a * b with 1 &lt; a &lt;= b, then a * a &lt;= a * b = n,
  so the smaller factor is at most the square root of n. If n has any divisor
  besides 1 and itself, it has one in [2, sqrt(n)], and testing those divisors is
  enough. Write the bound as <code>d * d &lt;= n</code> and not
  <code>d &lt;= Math.sqrt(n)</code>: the multiplication is an exact integer comparison,
  and it avoids calling a floating-point function in the loop.
</p>
<pre><code>function isPrime(n) {
  if (n &lt; 2) return false; <span class="c">// 0, 1 and negatives are not prime</span>
  for (let d = 2; d * d &lt;= n; d++) {
    if (n % d === 0) return false;
  }
  return true;
}

function primeFactors(n) {
  const factors = new Map(); <span class="c">// prime -&gt; exponent</span>
  for (let d = 2; d * d &lt;= n; d++) {
    while (n % d === 0) {
      factors.set(d, (factors.get(d) ?? 0) + 1);
      n /= d; <span class="c">// exact division, since d divides n</span>
    }
  }
  if (n &gt; 1) factors.set(n, (factors.get(n) ?? 0) + 1); <span class="c">// what is left over is itself a prime</span>
  return factors;
}

primeFactors(360); <span class="c">// Map { 2 =&gt; 3, 3 =&gt; 2, 5 =&gt; 1 }</span></code></pre>
<p>
  <code>primeFactors</code> never has to test whether d is prime. By the time the
  loop reaches a composite d, every prime factor of d has already been divided out
  of n completely, so d cannot divide what remains. The leftover after the loop is
  1 or a single prime above the square root: a leftover with two prime factors would be
  at least (sqrt(n))<sup>2</sup>, which contradicts the loop having run only up to
  the square root. Each call costs O(sqrt(n)) steps. That is fine for one number up to
  about 10<sup>12</sup>, and too slow for a million queries.
</p>

<h4>The sieve of Eratosthenes</h4>
<p>
  For many queries or for "count the primes below n", do the work once for all
  numbers. Walk upward from 2. The first number not yet crossed out is prime,
  and every multiple of it is composite, so cross those out. Whatever survives
  at the end is prime.
</p>
<figure>
  <svg viewBox="0 0 640 220" class="dg" role="img" aria-label="The integers 1 to 30 in three rows of ten. Primes 2, 3, 5, 7, 11, 13, 17, 19, 23 and 29 are green. The composite numbers are red. The number 1 is plain.">
    <g class="rough">
      <rect class="box" x="20" y="30" width="52" height="40" />
      <rect class="boxg" x="72" y="30" width="52" height="40" />
      <rect class="boxg" x="124" y="30" width="52" height="40" />
      <rect class="boxr" x="176" y="30" width="52" height="40" />
      <rect class="boxg" x="228" y="30" width="52" height="40" />
      <rect class="boxr" x="280" y="30" width="52" height="40" />
      <rect class="boxg" x="332" y="30" width="52" height="40" />
      <rect class="boxr" x="384" y="30" width="52" height="40" />
      <rect class="boxr" x="436" y="30" width="52" height="40" />
      <rect class="boxr" x="488" y="30" width="52" height="40" />
      <rect class="boxg" x="20" y="74" width="52" height="40" />
      <rect class="boxr" x="72" y="74" width="52" height="40" />
      <rect class="boxg" x="124" y="74" width="52" height="40" />
      <rect class="boxr" x="176" y="74" width="52" height="40" />
      <rect class="boxr" x="228" y="74" width="52" height="40" />
      <rect class="boxr" x="280" y="74" width="52" height="40" />
      <rect class="boxg" x="332" y="74" width="52" height="40" />
      <rect class="boxr" x="384" y="74" width="52" height="40" />
      <rect class="boxg" x="436" y="74" width="52" height="40" />
      <rect class="boxr" x="488" y="74" width="52" height="40" />
      <rect class="boxr" x="20" y="118" width="52" height="40" />
      <rect class="boxr" x="72" y="118" width="52" height="40" />
      <rect class="boxg" x="124" y="118" width="52" height="40" />
      <rect class="boxr" x="176" y="118" width="52" height="40" />
      <rect class="boxr" x="228" y="118" width="52" height="40" />
      <rect class="boxr" x="280" y="118" width="52" height="40" />
      <rect class="boxr" x="332" y="118" width="52" height="40" />
      <rect class="boxr" x="384" y="118" width="52" height="40" />
      <rect class="boxg" x="436" y="118" width="52" height="40" />
      <rect class="boxr" x="488" y="118" width="52" height="40" />
    </g>
    <text class="sm" x="46" y="55" text-anchor="middle">1</text>
    <text class="sm gr" x="98" y="55" text-anchor="middle">2</text>
    <text class="sm gr" x="150" y="55" text-anchor="middle">3</text>
    <text class="sm rd" x="202" y="55" text-anchor="middle">4</text>
    <text class="sm gr" x="254" y="55" text-anchor="middle">5</text>
    <text class="sm rd" x="306" y="55" text-anchor="middle">6</text>
    <text class="sm gr" x="358" y="55" text-anchor="middle">7</text>
    <text class="sm rd" x="410" y="55" text-anchor="middle">8</text>
    <text class="sm rd" x="462" y="55" text-anchor="middle">9</text>
    <text class="sm rd" x="514" y="55" text-anchor="middle">10</text>
    <text class="sm gr" x="46" y="99" text-anchor="middle">11</text>
    <text class="sm rd" x="98" y="99" text-anchor="middle">12</text>
    <text class="sm gr" x="150" y="99" text-anchor="middle">13</text>
    <text class="sm rd" x="202" y="99" text-anchor="middle">14</text>
    <text class="sm rd" x="254" y="99" text-anchor="middle">15</text>
    <text class="sm rd" x="306" y="99" text-anchor="middle">16</text>
    <text class="sm gr" x="358" y="99" text-anchor="middle">17</text>
    <text class="sm rd" x="410" y="99" text-anchor="middle">18</text>
    <text class="sm gr" x="462" y="99" text-anchor="middle">19</text>
    <text class="sm rd" x="514" y="99" text-anchor="middle">20</text>
    <text class="sm rd" x="46" y="143" text-anchor="middle">21</text>
    <text class="sm rd" x="98" y="143" text-anchor="middle">22</text>
    <text class="sm gr" x="150" y="143" text-anchor="middle">23</text>
    <text class="sm rd" x="202" y="143" text-anchor="middle">24</text>
    <text class="sm rd" x="254" y="143" text-anchor="middle">25</text>
    <text class="sm rd" x="306" y="143" text-anchor="middle">26</text>
    <text class="sm rd" x="358" y="143" text-anchor="middle">27</text>
    <text class="sm rd" x="410" y="143" text-anchor="middle">28</text>
    <text class="sm gr" x="462" y="143" text-anchor="middle">29</text>
    <text class="sm rd" x="514" y="143" text-anchor="middle">30</text>
    <text class="sm" x="20" y="185">2 crosses out from 4, 3 from 9, 5 from 25. 7 * 7 = 49 is past 30, so nothing more starts.</text>
    <text class="sm" x="20" y="208">The ten green numbers are every prime up to 30.</text>
  </svg>
  <figcaption>After the sieve, what is left uncrossed is prime. The crossing for a prime p starts at p * p because smaller multiples have a smaller prime factor and were crossed already.</figcaption>
</figure>
<pre><code>function sieve(n) {
  const composite = new Uint8Array(n + 1); <span class="c">// one byte per number, all 0 at the start</span>
  const primes = [];
  for (let i = 2; i &lt;= n; i++) {
    if (composite[i] === 1) continue;       <span class="c">// crossed by a smaller prime</span>
    primes.push(i);
    for (let j = i * i; j &lt;= n; j += i) composite[j] = 1; <span class="c">// start at i * i, not 2 * i</span>
  }
  return primes;
}

function countPrimes(n) { <span class="c">// how many primes are strictly below n</span>
  if (n &lt; 3) return 0;
  const composite = new Uint8Array(n);
  let count = 0;
  for (let i = 2; i &lt; n; i++) {
    if (composite[i] === 1) continue;
    count++;
    for (let j = i * i; j &lt; n; j += i) composite[j] = 1;
  }
  return count;
}

sieve(30);       <span class="c">// [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]</span>
countPrimes(10); <span class="c">// 4: the primes 2, 3, 5, 7</span></code></pre>
<p>
  <b>Why start at p * p.</b> A multiple k * p with k &lt; p has a prime factor
  smaller than p (any prime factor of k), so an earlier prime has already crossed
  it. The first multiple of p that nobody has crossed is p * p. It also means the inner loop runs only
  when p * p &lt;= n, that is, for primes up to the square root of n, which is
  why the loop writes <code>j = i * i</code> and needs no separate bound.
</p>
<p>
  <b>Why O(n log log n).</b> The outer loop visits n numbers. The inner loop for a
  prime p crosses at most n / p numbers, so the crossing work totals at most
  n * (1/2 + 1/3 + 1/5 + 1/7 + ...), summed over the primes up to the square
  root of n. If you sum 1/k over all integers up to n, you get about ln n, which would give n log n.
  The same sum over primes only grows like ln ln n, a classical result of
  Mertens that is quoted here and not proved. ln ln n is about 3 for n = 10<sup>9</sup>,
  so for any n you can allocate memory for, the sieve is a few steps per element.
  <b>Space</b> is one byte per number with a <code>Uint8Array</code>, so
  10<sup>7</sup> numbers take about 10 megabytes.
</p>
<h4>Dry run: the sieve on n = 30</h4>
<table>
  <tr><th>i</th><th>Status</th><th>Inner loop starts at i * i</th><th>Crosses out</th></tr>
  <tr><td>2</td><td>prime</td><td>4</td><td>4, 6, 8, ..., 30 (14 numbers)</td></tr>
  <tr><td>3</td><td>prime</td><td>9</td><td>9, 12, 15, 18, 21, 24, 27, 30 (8; 12, 18, 24, 30 are crossed twice)</td></tr>
  <tr><td>4</td><td>crossed by 2</td><td>-</td><td>skipped</td></tr>
  <tr><td>5</td><td>prime</td><td>25</td><td>25, 30</td></tr>
  <tr><td>6</td><td>crossed</td><td>-</td><td>skipped</td></tr>
  <tr><td>7</td><td>prime</td><td>49 &gt; 30</td><td>nothing</td></tr>
  <tr><td>8 to 30</td><td>each is either crossed or prime</td><td>i * i &gt; 30 for every prime from 7 on</td><td>nothing more</td></tr>
</table>
<h4>The smallest-prime-factor table</h4>
<p>
  A variation records, for every number, its smallest prime factor. With that
  table, factorizing any x up to n takes one step per prime factor (at most about
  log<sub>2</sub> x steps) instead of a trial division up to the square root.
  It is the better tool when the same program factorizes many numbers.
</p>
<pre><code>function smallestPrimeFactors(n) {
  const spf = new Uint32Array(n + 1); <span class="c">// 0 means "not set yet"</span>
  for (let i = 2; i &lt;= n; i++) {
    if (spf[i] !== 0) continue;        <span class="c">// already has a smaller prime factor</span>
    for (let j = i; j &lt;= n; j += i) {
      if (spf[j] === 0) spf[j] = i;    <span class="c">// first prime to reach j is its smallest</span>
    }
  }
  return spf;
}

function factorizeWith(spf, x) {
  const primes = [];
  while (x &gt; 1) {
    primes.push(spf[x]);
    x /= spf[x];
  }
  return primes;
}

factorizeWith(smallestPrimeFactors(100), 84); <span class="c">// [2, 2, 3, 7]</span></code></pre>
<p class="sub">
  This version starts the inner loop at i, not at i * i, because it has to set
  the smallest factor of numbers such as 6 = 2 * 3. The total is still
  O(n log log n), since it sums n / p over all primes p up to n.
</p>
<div class="warn">
  <span class="ttl">⚠ Sieve mistakes that cost an interview</span>
  <b>(1)</b> "Count primes less than n" excludes n itself: the array has size
  <code>n</code>, not <code>n + 1</code>, and <code>countPrimes(2)</code> is 0.
  <b>(2)</b> 0 and 1 are not prime, so the loop starts at 2. <b>(3)</b> Using
  <code>new Array(n + 1).fill(true)</code> instead of a typed array works but
  uses much more memory per entry; a <code>Uint8Array</code> is one byte per
  number. <b>(4)</b> A sieve of 10<sup>9</sup> numbers is 1 gigabyte: when n is
  that large, the question is asking for a different technique, such as testing
  one number or a segment of a range.
</div>

<h3>Modular arithmetic and the 1e9+7 constant</h3>
<p>
  When a problem says "return the answer modulo 10<sup>9</sup> + 7", it is telling
  you that the true value, for example the number of paths through a large grid,
  has more digits than any integer type can hold. The remainder is small, and the
  useful fact is that you can take the remainder at every step instead of at the end,
  because addition, subtraction and multiplication all respect it:
</p>
<pre><code>(a + b) mod m = ((a mod m) + (b mod m)) mod m
(a - b) mod m = ((a mod m) - (b mod m) + m) mod m
(a * b) mod m = ((a mod m) * (b mod m)) mod m</code></pre>
<p>
  Division is the operation that does not carry over: a / b mod m is not the
  same as (a mod m) / (b mod m). It needs a modular inverse, which the section
  after fast exponentiation covers. 10<sup>9</sup> + 7 is the usual modulus
  because it is a prime that fits in 30 bits, so every residue is below
  2<sup>30</sup> and sums of two residues fit in an ordinary int in any language.
  That is a convention of the problem setters, not a law, and 998244353 is the
  other common one.
</p>
<div class="warn">
  <span class="ttl">⚠ Four habits that keep modular code correct</span>
  <b>(1)</b> Reduce after every operation that can grow, not once at the end.
  <b>(2)</b> After a subtraction add <code>m</code> before the final
  <code>%</code>, because <code>(a - b) % m</code> is negative when a &lt; b in JavaScript.
  <b>(3)</b> Multiply two residues with <code>mulMod</code> (BigInt), not
  <code>*</code>, when m is above about 9.4 * 10<sup>7</sup>.
  <b>(4)</b> Do not compare or sort residues as if they were the real values:
  the real answer may be much larger than its remainder.
</div>

<h3>Fast exponentiation</h3>
<p>
  Computing x<sup>n</sup> by n multiplications is far too slow when n is
  10<sup>9</sup>, and the numbers are huge before you reduce them. The
  idea is that the binary digits of n tell you which powers of x to multiply.
  Write n = 13 = 8 + 4 + 1, so x<sup>13</sup> = x<sup>8</sup> * x<sup>4</sup> * x<sup>1</sup>.
  The powers x<sup>1</sup>, x<sup>2</sup>, x<sup>4</sup>, x<sup>8</sup> come from squaring
  the previous one. So the loop keeps a <code>base</code> that is squared each round
  and multiplies it into <code>result</code> on every round where the current bit of n is 1. The number of rounds is the number of bits
  in n, about log<sub>2</sub> n.
</p>
<pre><code>function powMod(base, exp, m) {
  const modulus = BigInt(m);
  let result = 1n % modulus;                                 <span class="c">// 1n % 1n is 0n, which makes m = 1 work</span>
  let b = ((BigInt(base) % modulus) + modulus) % modulus;    <span class="c">// a negative base becomes its residue</span>
  let e = BigInt(exp);                                       <span class="c">// pass a BigInt for exponents above 2^53</span>
  while (e &gt; 0n) {
    if (e &amp; 1n) result = (result * b) % modulus;             <span class="c">// this bit of the exponent is set</span>
    b = (b * b) % modulus;                                   <span class="c">// b is now x^(2^i) for the next bit</span>
    e &gt;&gt;= 1n;
  }
  return Number(result);
}

powMod(2, 10, 1000000007);       <span class="c">// 1024</span>
powMod(3, 13, 1000);             <span class="c">// 323, because 3^13 = 1594323</span>
powMod(2, 1000000000000n, 1000000007);</code></pre>
<h4>Dry run: powMod(3, 13, 1000), with 13 = 1101 in binary</h4>
<table>
  <tr><th>e (binary)</th><th>bit</th><th>b = 3^(2^i) mod 1000</th><th>result after this bit</th></tr>
  <tr><td>13 (1101)</td><td>1</td><td>3</td><td>1 * 3 = 3</td></tr>
  <tr><td>6 (110)</td><td>0</td><td>9</td><td>3</td></tr>
  <tr><td>3 (11)</td><td>1</td><td>81</td><td>3 * 81 = 243</td></tr>
  <tr><td>1 (1)</td><td>1</td><td>561 (6561 mod 1000)</td><td>243 * 561 = 136323, mod 1000 = 323</td></tr>
</table>
<p>
  The four rounds used the powers 3<sup>1</sup>, 3<sup>4</sup> and 3<sup>8</sup>
  of 3, and 3 * 81 * 6561 = 3<sup>13</sup>. <b>Cost:</b> O(log n) multiplications: for n near 10<sup>9</sup>
  that is about 30 squarings and at most 30 products into the result. <b>Space:</b> O(1). The recursive form,
  x<sup>n</sup> = (x<sup>n/2</sup>)<sup>2</sup> times x when n is odd, is the same
  algorithm; the loop above is the one to write when the exponent is large,
  since it has no stack.
</p>
<p>
  <b>Exponents that arrive as digits.</b> "Super Pow" gives the exponent as an
  array of decimal digits that is too long to hold as a number. Process the digits
  left to right and use a<sup>10q + d</sup> = (a<sup>q</sup>)<sup>10</sup> * a<sup>d</sup>:
  the exponent so far, q, becomes 10q + d when digit d is appended, so the result
  so far is raised to the tenth power and multiplied by a<sup>d</sup>.
</p>
<pre><code>function superPow(a, digits) {
  const M = 1337;
  let result = 1;
  for (const d of digits) {
    result = (powMod(result, 10, M) * powMod(a, d, M)) % M; <span class="c">// both factors are below 1337, so the product is safe</span>
  }
  return result;
}

superPow(2, [1, 0]); <span class="c">// 1024, since 2^10 = 1024</span></code></pre>

<h3>pow(x, n) with doubles: negative exponents and edge cases</h3>
<p>
  The version everyone is asked for is <code>pow(x, n)</code> with x a decimal
  number and n a signed 32-bit integer. The loop is the one above, with plain
  multiplication and no modulus. The edge cases decide whether it passes.
</p>
<pre><code>function powFloat(x, n) {
  let e = Math.abs(n);              <span class="c">// no n &gt;&gt; 1 and no negating through a bitwise operator</span>
  let base = n &lt; 0 ? 1 / x : x;    <span class="c">// invert the base first, not the result</span>
  let result = 1;
  while (e &gt; 0) {
    if (e % 2 === 1) result *= base;
    base *= base;
    e = Math.floor(e / 2);
  }
  return result;
}

powFloat(2, 10);    <span class="c">// 1024</span>
powFloat(2, -2);    <span class="c">// 0.25</span>
powFloat(0, -1);    <span class="c">// Infinity, as Math.pow(0, -1) gives</span>
powFloat(2, -1074); <span class="c">// 5e-324, the smallest positive Number</span></code></pre>
<ul>
  <li><b>The most negative exponent.</b> In a language with 32-bit integers, <code>-n</code> for n = -2147483648 overflows back to itself. JavaScript Numbers are doubles, so <code>Math.abs(-2147483648)</code> is simply 2147483648. The trap is the bitwise shift: <code>(-(-2147483648)) &gt;&gt; 1</code> is <code>-1073741824</code>, because the operator first reinterprets the value as a 32-bit signed integer. Halve with <code>Math.floor(e / 2)</code> or <code>&gt;&gt;&gt;</code>.</li>
  <li><b>Parity of a negative exponent.</b> <code>-3 % 2</code> is <code>-1</code>, so the test <code>e % 2 === 1</code> fails for negative e. Take the absolute value once before the loop, as above.</li>
  <li><b>Where to invert.</b> If you compute x<sup>|n|</sup> first and return <code>1 / result</code>, then for x = 2 and n = -1074 the result 2<sup>1074</sup> overflows to <code>Infinity</code> and the answer becomes 0, though 2<sup>-1074</sup> is representable. Inverting the base first avoids it.</li>
  <li><b>No integer overflow, but Infinity and underflow.</b> Doubles do not wrap. Results too large become <code>Infinity</code>, too small become 0, and <code>0 ** 0</code> is 1 by convention in both JavaScript and the usual problem statement.</li>
  <li><b>Accuracy.</b> Repeated squaring performs about log n roundings, so the result is close to <code>Math.pow</code> but not always bit-identical. Compare with a relative tolerance, never with <code>===</code>.</li>
</ul>
<p>
  The same loop with integers and a modulus is <code>powMod</code>. Both are
  instances of one idea, which is why fast exponentiation also works for matrices
  (below) and for any associative operation.
</p>

<h4>Integer square root</h4>
<p>
  For floor(sqrt(n)) the quick answer is <code>Math.floor(Math.sqrt(n))</code>,
  and for small n it is right. It is not right for every safe integer, because
  <code>Math.sqrt</code> rounds to the nearest double and the true root of k * k - 1
  sits just under k. For n = 4503599761588224, which is 67108865 * 67108865 - 1, it
  returns 67108865, one too many. (In Node 24 it matched the exact answer at every perfect-square
  boundary up to 67108864 squared, and the first miss is the k above.) So correct the
  estimate with integer arithmetic. A binary search on r, looking for the largest r with
  r * r &lt;= n, is the other standard method, and the exercise on integer square root practises it.
</p>
<pre><code>function integerSqrt(n) {
  let r = Math.floor(Math.sqrt(n));
  while (r * r &gt; n) r--;               <span class="c">// the estimate was one too high</span>
  while ((r + 1) * (r + 1) &lt;= n) r++;   <span class="c">// the estimate was one too low</span>
  return r;
}

integerSqrt(99);  <span class="c">// 9</span>
integerSqrt(100); <span class="c">// 10</span></code></pre>

<h3>Modular inverse and nCr mod p</h3>
<p>
  The inverse of a modulo m is the number x with a * x = 1 (mod m). It is what
  "divide by a" means in modular arithmetic: to compute (b / a) mod m, compute b
  times the inverse of a. It exists exactly when gcd(a, m) = 1, and there are two ways to find it.
</p>
<p>
  <b>Way 1, for any modulus: extended Euclid.</b> If gcd(a, m) = 1 then extendedGcd
  returns x and y with a * x + m * y = 1, and reducing modulo m leaves a * x = 1, so x mod m is the inverse.
</p>
<pre><code>function modInverse(a, m) {
  const { g, x } = extendedGcd(mod(a, m), m);
  if (g !== 1) return null; <span class="c">// a and m share a factor, so no inverse exists</span>
  return mod(x, m);
}

modInverse(3, 11);  <span class="c">// 4, since 3 * 4 = 12 = 1 (mod 11)</span>
modInverse(4, 12);  <span class="c">// null</span></code></pre>
<p>
  <b>Way 2, for a prime modulus p: Fermat's little theorem.</b> For a prime p
  and a not divisible by p, a<sup>p-1</sup> = 1 (mod p). The short proof: the
  numbers a, 2a, ..., (p-1)a are all different modulo p (two equal ones would give
  p dividing (i - j) * a) and none is 0, so they are the numbers 1 to p-1 in some
  order. Their product is therefore (p-1)! on both sides, giving
  a<sup>p-1</sup> * (p-1)! = (p-1)! (mod p), and since (p-1)! is coprime to p
  you may cancel it. Rewriting, a * a<sup>p-2</sup> = 1, so the inverse of a is
  a<sup>p-2</sup>, which <code>powMod(a, p - 2, p)</code> computes in O(log p).
</p>
<h4>Binomials modulo a prime</h4>
<p>
  The binomial coefficient C(n, r) = n! / (r! * (n - r)!) counts the ways to choose r
  of n items. It is huge, the problem wants it modulo p, and the formula contains a
  division. The standard recipe precomputes the factorials once, then the inverse
  factorials, then answers each query with two multiplications.
</p>
<p>
  The inverse factorials come from one power and a backward loop. Compute
  <code>invFact[limit] = fact[limit]^(p-2)</code> once. Then because
  1 / (i - 1)! = i / i!, each earlier value is <code>invFact[i - 1] = invFact[i] * i</code>.
  That avoids a modular power per entry.
</p>
<pre><code>function buildFactorials(limit, p) {
  const fact = new Array(limit + 1);
  const invFact = new Array(limit + 1);
  fact[0] = 1;
  for (let i = 1; i &lt;= limit; i++) fact[i] = mulMod(fact[i - 1], i, p);
  invFact[limit] = powMod(fact[limit], p - 2, p);
  for (let i = limit; i &gt;= 1; i--) invFact[i - 1] = mulMod(invFact[i], i, p);
  return { fact, invFact };
}

function nCrMod(n, r, tables, p) {
  if (r &lt; 0 || r &gt; n) return 0;
  const { fact, invFact } = tables;
  return mulMod(mulMod(fact[n], invFact[r], p), invFact[n - r], p);
}

const P = 1000000007;
const tables = buildFactorials(1000, P);
nCrMod(10, 3, tables, P); <span class="c">// 120</span></code></pre>
<h4>Dry run with a small prime: p = 13, limit = 5</h4>
<table>
  <tr><th>i</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr>
  <tr><td>fact[i] mod 13</td><td>1</td><td>1</td><td>2</td><td>6</td><td>11</td><td>3</td></tr>
  <tr><td>invFact[i] mod 13</td><td>1</td><td>1</td><td>7</td><td>11</td><td>6</td><td>9</td></tr>
</table>
<p>
  invFact[5] is 3<sup>11</sup> mod 13 = 9, and 3 * 9 = 27 = 1 (mod 13), which
  confirms it. The row then fills right to left: invFact[4] = 9 * 5 = 45 = 6,
  invFact[3] = 6 * 4 = 24 = 11, invFact[2] = 11 * 3 = 33 = 7. To answer C(5, 2):
  fact[5] * invFact[2] * invFact[3] = 3 * 7 * 11 = 231, and 231 mod 13 is 10, which is
  C(5, 2).
</p>
<div class="warn">
  <span class="ttl">⚠ When this recipe is wrong</span>
  <b>(1)</b> The modulus must be prime. For a composite modulus, k! may have no
  inverse; use Pascal's triangle below instead. <b>(2)</b> n must be below p. If n &gt;= p,
  then p divides n! and the factorial has no inverse; the fix (Lucas' theorem) is outside
  this chapter. <b>(3)</b> Check <code>r &gt; n</code> and <code>r &lt; 0</code> first and return 0.
  <b>(4)</b> Use <code>mulMod</code> for the products of two residues; the loop
  <code>fact[i - 1] * i</code> is the only product that is safe with plain Numbers.
  <b>(5)</b> Build the tables once, outside the per-query function.
</div>
<p>
  <b>Cost.</b> O(limit) for the tables plus O(log p) once for the power, then
  O(1) per query. Without a modulus, the question is whether C(n, r) fits at all; the
  next section handles that.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "The answer needs division mod a prime,
  so I use the inverse. By Fermat, a to the p minus 2 is the inverse of a, which
  I get with fast exponentiation. I precompute factorials, take one inverse for the
  last one, and walk back using 1 over (i-1)! equals i over i!, so every query is two multiplications.
  The products of two residues are near 10 to the 18, so I do them in BigInt."
</div>

<h3>Pascal's triangle and exact binomials</h3>
<p>
  Without a modulus, or with a modulus that is not prime, binomials come from
  Pascal's rule, and it is the first thing to try for small n. Choosing r of n
  items either leaves out the last item, which is C(n - 1, r) ways, or includes it
  and then chooses r - 1 of the others, C(n - 1, r - 1) ways. So
  C(n, r) = C(n - 1, r - 1) + C(n - 1, r), with C(n, 0) = C(n, n) = 1. The
  table of these values is Pascal's triangle, and row n adds up to 2<sup>n</sup>.
</p>
<table>
  <tr><th>row n</th><th>C(n, 0) ... C(n, n)</th></tr>
  <tr><td>0</td><td>1</td></tr>
  <tr><td>1</td><td>1 1</td></tr>
  <tr><td>2</td><td>1 2 1</td></tr>
  <tr><td>3</td><td>1 3 3 1</td></tr>
  <tr><td>4</td><td>1 4 6 4 1</td></tr>
  <tr><td>5</td><td>1 5 10 10 5 1</td></tr>
</table>
<pre><code>function pascalRows(numRows) {
  const rows = [];
  for (let i = 0; i &lt; numRows; i++) {
    const row = new Array(i + 1).fill(1);          <span class="c">// the two ends are 1</span>
    for (let j = 1; j &lt; i; j++) {
      row[j] = rows[i - 1][j - 1] + rows[i - 1][j]; <span class="c">// the two entries above</span>
    }
    rows.push(row);
  }
  return rows;
}

function pascalRow(rowIndex) { <span class="c">// row n alone, in O(n) space</span>
  const row = new Array(rowIndex + 1).fill(1);
  for (let i = 2; i &lt;= rowIndex; i++) {
    for (let j = i - 1; j &gt;= 1; j--) row[j] += row[j - 1]; <span class="c">// right to left, so row[j - 1] is still the old row</span>
  }
  return row;
}

pascalRow(5); <span class="c">// [1, 5, 10, 10, 5, 1]</span></code></pre>
<p>
  <code>pascalRows</code> costs O(n<sup>2</sup>) time and space. In
  <code>pascalRow</code> the inner loop must run right to left: going left to right
  would read a <code>row[j - 1]</code> that has just been overwritten with a value
  from the new row. The same pattern, one array updated from the right, is the
  rolling-array trick in knapsack problems. Add <code>% m</code> to the
  addition and the table gives binomials modulo any m, prime or not, in
  O(n<sup>2</sup>).
</p>
<p>
  <b>One entry without the table.</b> C(n, k) = n * (n-1) * ... * (n-k+1) / k! can be
  built step by step: after step i the running value is C(n - k + i, i), and the next
  value is the running value times (n - k + i + 1) divided by (i + 1). The
  division is exact at every step, because the value after the step is the integer
  C(n - k + i + 1, i + 1), so the product before the division is a multiple of the divisor. That
  is an O(k) loop with no table.
</p>
<pre><code>function binomial(n, k) {
  k = Math.min(k, n - k);                     <span class="c">// C(n, k) equals C(n, n - k): do fewer steps</span>
  let result = 1;
  for (let i = 1; i &lt;= k; i++) {
    result = (result * (n - k + i)) / i;      <span class="c">// exact division at every step, while the product is a safe integer</span>
  }
  return result;
}

function binomialBig(n, k) {
  k = Math.min(k, n - k);
  let result = 1n;
  for (let i = 1; i &lt;= k; i++) {
    result = (result * BigInt(n - k + i)) / BigInt(i);
  }
  return result;
}

binomial(10, 3);        <span class="c">// 120</span>
binomial(55, 26);       <span class="c">// 3560597348629859.5 (not even an integer)</span>
binomialBig(55, 26);    <span class="c">// 3560597348629860n</span></code></pre>
<div class="warn">
  <span class="ttl">⚠ Where Numbers stop being enough</span>
  Row 57 is the first row of Pascal's triangle with an entry above
  2<sup>53</sup> - 1, and <code>binomial(55, 26)</code> already returns a non-integer,
  because the intermediate product leaves the safe range even though the answer does not.
  Factorials give out sooner: 18! is the largest factorial
  below 2<sup>53</sup>. So if a statement asks for an exact answer and n can reach
  the fifties, write the BigInt version, or take the modulus the statement gives.
</div>

<h3>Counting: stars and bars, Catalan numbers</h3>
<p>
  Many "how many ways" questions reduce to a binomial. Two families come up so
  often that you should recognise them on sight.
</p>
<h4>Stars and bars: splitting identical items into bins</h4>
<p>
  How many ways can n identical items go into k labelled bins, with a bin allowed to be empty?
  Lay the n items in a row as stars and place k - 1 dividers (bars) among them; the
  arrangement is determined by which of the n + k - 1 positions hold bars. So the count
  is C(n + k - 1, k - 1). Equivalently it counts the non-negative integer
  solutions of x<sub>1</sub> + ... + x<sub>k</sub> = n. If every bin must hold at least one
  item, give each bin one item first, and the count becomes C(n - 1, k - 1).
</p>
<p>
  For example, the number of solutions of x + y + z = 7 with non-negative integers
  is C(9, 2) = 36. The same reasoning counts paths on a grid. A path from the
  top-left to the bottom-right of an m by n grid that moves only right or down makes
  m - 1 down moves and n - 1 right moves in some order, so there are C(m + n - 2, m - 1) paths.
  That is the closed form behind the "Unique Paths" table problem.
</p>
<pre><code>function countSolutions(total, variables) {
  return binomial(total + variables - 1, variables - 1); <span class="c">// non-negative integers summing to total</span>
}

function uniquePaths(rows, cols) {
  return binomial(rows + cols - 2, rows - 1);
}

countSolutions(7, 3); <span class="c">// 36</span>
uniquePaths(3, 7);    <span class="c">// 28</span></code></pre>
<h4>Catalan numbers: balanced structures</h4>
<p>
  Count the valid strings made of n pairs of parentheses. Take such a string; its
  first character is "(", and that bracket closes at some position, leaving a valid
  string of i pairs inside it and a valid string of the remaining n - 1 - i pairs after it.
  Every valid string splits in exactly one way, so
  C<sub>n</sub> = the sum over i from 0 to n - 1 of C<sub>i</sub> * C<sub>n-1-i</sub>,
  with C<sub>0</sub> = 1. The values run 1, 1, 2, 5, 14, 42, 132, 429.
</p>
<p>
  The same recurrence counts the binary trees with n nodes and the structurally
  different binary search trees on n keys: pick the root, put i nodes on the left and n - 1 - i
  on the right, multiply the counts. It counts the ways to triangulate a polygon and the monotone lattice
  paths that never cross the diagonal. When a problem says "number of structurally
  unique" and the structure splits into a left part and a right part, think Catalan.
</p>
<p>
  <b>The closed form.</b> Think of a valid string as a path of 2n steps, "(" going up and ")" going down, that
  never goes below zero and ends at zero. All paths with n ups and n downs number
  C(2n, n). A path that does go below zero first touches the level -1. Reflect the part of
  the path after that first touch, swapping ups and downs: the reflected path ends at -2 instead of
  0, and the correspondence is reversible. So the bad paths are in one-to-one
  correspondence with all paths from 0 to -2, which number C(2n, n + 1). The valid ones are
  C(2n, n) - C(2n, n + 1) = C(2n, n) / (n + 1).
</p>
<pre><code>function catalanByRecurrence(n) {
  const c = new Array(n + 1).fill(0);
  c[0] = 1;
  for (let i = 1; i &lt;= n; i++) {
    for (let left = 0; left &lt; i; left++) c[i] += c[left] * c[i - 1 - left];
  }
  return c[n];
}

function catalan(n) {
  let c = 1n;
  for (let k = 0n; k &lt; BigInt(n); k++) {
    c = (c * 2n * (2n * k + 1n)) / (k + 2n); <span class="c">// C(k+1) = C(k) * 2(2k+1) / (k+2), exact at every step</span>
  }
  return c;
}

catalanByRecurrence(5); <span class="c">// 42</span>
catalan(19);            <span class="c">// 1767263190n, the answer to "unique BSTs" for n = 19</span></code></pre>
<p>
  The multiplicative step comes from dividing C(2n + 2, n + 1) / (n + 2) by
  C(2n, n) / (n + 1), which simplifies to 2(2n + 1) / (n + 2); the division is exact because
  the result is an integer. The recurrence costs O(n<sup>2</sup>) and is the one to write on a
  whiteboard because it is the definition. In plain Numbers it is exact up to
  C<sub>30</sub> = 3814986502092304, and beyond that you need the BigInt version or a modulus.
  The multiplicative form with Numbers is no safer: the product before the division is
  already above 2<sup>53</sup> from n = 29, and it first gives a wrong value at n = 31.
</p>
<div class="sticky mint">
  <span class="ttl">Check small cases before trusting a formula</span>
  Both families are easy to misapply by an off-by-one in the binomial's top
  argument (n + k - 1 versus n + k). Write the answer for the smallest case you can
  enumerate by hand, such as two bins and two items (3 ways), or n = 3 pairs of parentheses
  (5 strings), and compare it with the formula before writing the code.
</div>

<h3>Matrix exponentiation for linear recurrences</h3>
<p>
  Fibonacci with n up to 10<sup>18</sup> cannot be filled in a loop, and the
  table-based DP is O(n). The recurrence F(n) = F(n - 1) + F(n - 2) is linear, and a
  linear step can be written as a matrix. Keep the last two values as a column
  vector. One step turns (F(n), F(n - 1)) into (F(n + 1), F(n)):
</p>
<pre><code>| F(n+1) |   | 1 1 |   | F(n)   |
| F(n)   | = | 1 0 | * | F(n-1) |</code></pre>
<p>
  Applying the matrix n times multiplies by M<sup>n</sup>, and
  M<sup>n</sup> is computed in O(log n) matrix multiplications by the fast
  exponentiation loop, because matrix multiplication is associative. For a
  recurrence of order k, f(n) = c<sub>1</sub> f(n - 1) + ... + c<sub>k</sub> f(n - k),
  the matrix is k by k: the first row holds the coefficients and the sub-diagonal holds
  ones that shift the older values down. Each multiplication costs O(k<sup>3</sup>), so the whole
  computation is O(k<sup>3</sup> log n).
</p>
<pre><code>function matMul(A, B, m) {
  const k = A.length;
  const C = Array.from({ length: k }, () =&gt; new Array(k).fill(0n));
  for (let i = 0; i &lt; k; i++) {
    for (let t = 0; t &lt; k; t++) {
      if (A[i][t] === 0n) continue;
      for (let j = 0; j &lt; k; j++) C[i][j] = (C[i][j] + A[i][t] * B[t][j]) % m;
    }
  }
  return C;
}

function matPow(M, e, m) {
  const k = M.length;
  let result = Array.from({ length: k }, (_, i) =&gt; Array.from({ length: k }, (_, j) =&gt; (i === j ? 1n : 0n)));
  let base = M;
  while (e &gt; 0n) {
    if (e &amp; 1n) result = matMul(result, base, m);
    base = matMul(base, base, m);
    e &gt;&gt;= 1n;
  }
  return result;
}

function linearRecurrenceMod(coeffs, initial, n, m) {
  const k = coeffs.length;
  if (n &lt; k) return mod(initial[n], m);
  const M = BigInt(m);
  const companion = Array.from({ length: k }, () =&gt; new Array(k).fill(0n));
  for (let j = 0; j &lt; k; j++) companion[0][j] = BigInt(mod(coeffs[j], m));
  for (let i = 1; i &lt; k; i++) companion[i][i - 1] = 1n; <span class="c">// shifts f(n-1) down into the next slot</span>
  const power = matPow(companion, BigInt(n), M);
  let total = 0n;
  for (let j = 0; j &lt; k; j++) total += power[k - 1][j] * BigInt(mod(initial[k - 1 - j], m));
  return Number(total % M);
}

linearRecurrenceMod([1, 1], [0, 1], 10, 1000000007);          <span class="c">// 55, the Fibonacci number F(10)</span>
linearRecurrenceMod([1, 1, 1], [0, 1, 1], 10, 1000000007);    <span class="c">// 149, the Tribonacci number T(10)</span></code></pre>
<p>
  The state vector at step t is (f(t + k - 1), ..., f(t)), which is the initial values
  listed in reverse, and after n steps the last entry is f(n); that is why the final loop
  multiplies the last row of the power by the reversed initial values.
</p>
<h4>Dry run: M<sup>5</sup> for Fibonacci</h4>
<table>
  <tr><th>e</th><th>bit</th><th>base (M<sup>2^i</sup>)</th><th>result after this bit</th></tr>
  <tr><td>5 (101)</td><td>1</td><td>[[1,1],[1,0]]</td><td>[[1,1],[1,0]]</td></tr>
  <tr><td>2 (10)</td><td>0</td><td>[[2,1],[1,1]]</td><td>[[1,1],[1,0]]</td></tr>
  <tr><td>1 (1)</td><td>1</td><td>[[5,3],[3,2]]</td><td>[[8,5],[5,3]]</td></tr>
</table>
<p>
  M<sup>n</sup> has F(n + 1) and F(n) in its first row and F(n) and F(n - 1) in its second, so
  the result [[8,5],[5,3]] says F(6) = 8, F(5) = 5 and F(4) = 3. Note also what plain
  Numbers do here: F(78) = 8944394323791464 is the last Fibonacci number
  below 2<sup>53</sup>. A Number loop computes F(79) as 14472334024676220, and the true value is 14472334024676221.
  Without a modulus, use BigInt; with one, use the BigInt matrix above.
</p>
<p>
  <b>Fast doubling</b> is a faster special case for Fibonacci only. Two identities, F(2k) = F(k) * (2 F(k+1) - F(k)) and
  F(2k+1) = F(k)<sup>2</sup> + F(k+1)<sup>2</sup>, let you go from the pair for k
  to the pair for 2k and 2k + 1, halving n each time. It needs no matrix.
</p>
<pre><code>function fibDoubling(n, m) { <span class="c">// n and m are BigInt; returns [F(n), F(n+1)] mod m</span>
  if (n === 0n) return [0n, 1n % m];
  const [a, b] = fibDoubling(n &gt;&gt; 1n, m);
  const c = (a * (((2n * b - a) % m) + m)) % m;  <span class="c">// F(2k); the +m keeps the factor non-negative</span>
  const d = (a * a + b * b) % m;                 <span class="c">// F(2k+1)</span>
  return n &amp; 1n ? [d, (c + d) % m] : [c, d];
}

fibDoubling(10n, 1000000007n)[0]; <span class="c">// 55n</span></code></pre>
<p>
  <b>How to recognise it.</b> The statement defines each term from the previous few
  with fixed coefficients and asks for a term at a huge index, usually modulo a prime. Climbing
  stairs with 1 or 2 steps, tilings of a 2 by n board with dominoes, and binary
  strings of length n with no two adjacent ones are all Fibonacci in disguise, and
  with n up to 10<sup>18</sup> this is the intended tool.
</p>

<h3>Josephus: the circle that shrinks</h3>
<p>
  Stand n people in a circle numbered 0 to n - 1. Starting at person 0, count k
  people and remove the k-th, then keep counting from the next person, until one
  is left. Simulating with an array costs O(n * k) or O(n<sup>2</sup>) with
  <code>splice</code>. The recurrence is much shorter.
</p>
<p>
  Let J(n) be the position of the survivor among n people. The first person removed is at
  position (k - 1) mod n, and counting restarts at position k mod n. Relabel the
  remaining n - 1 people so that the one who starts the new count is 0: the person
  with new label j has old label (j + k) mod n. The survivor of the smaller circle is
  J(n - 1) in the new labels, so in the old labels
</p>
<pre><code>J(1) = 0
J(n) = (J(n - 1) + k) mod n</code></pre>
<pre><code>function josephus(n, k) {
  let survivor = 0;                               <span class="c">// J(1), 0-indexed</span>
  for (let size = 2; size &lt;= n; size++) {
    survivor = (survivor + k) % size;
  }
  return survivor + 1;                            <span class="c">// the people are named 1..n in the usual statement</span>
}

josephus(7, 3); <span class="c">// 4</span></code></pre>
<h4>Dry run: josephus(7, 3)</h4>
<table>
  <tr><th>circle size</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th></tr>
  <tr><td>survivor index J (0-based)</td><td>0</td><td>1</td><td>1</td><td>0</td><td>3</td><td>0</td><td>3</td></tr>
</table>
<p>
  Each cell is the previous one plus 3, modulo the size in its column. The result
  is index 3, which is person 4. The simulation agrees: people 3, 6, 2, 7, 5, 1 are
  removed in that order and 4 is left.
</p>
<p>
  <b>Cost.</b> O(n) time, O(1) space. <b>The k = 2 case</b> has a closed form: if
  2<sup>m</sup> is the largest power of two not above n, the survivor is
  2 * (n - 2<sup>m</sup>) + 1. In binary this is "move the leading 1 to the end".
  <code>1 &lt;&lt; (31 - Math.clz32(n))</code> finds 2<sup>m</sup> for n below 2<sup>31</sup>
  without a floating-point logarithm.
</p>
<pre><code>function josephusTwo(n) {
  const highest = 1 &lt;&lt; (31 - Math.clz32(n)); <span class="c">// largest power of two not above n</span>
  return 2 * (n - highest) + 1;
}

josephusTwo(7); <span class="c">// 7</span>
josephusTwo(6); <span class="c">// 5</span></code></pre>

<h3>Bases, Roman numerals and number to words</h3>
<p>
  These are "convert a representation" problems. They have no cleverness; the
  marks go to clean handling of zero, negatives and the grouping loop.
</p>
<h4>Converting to another base</h4>
<p>
  The last digit of n in base b is n mod b, and the remaining digits are the
  representation of floor(n / b). So repeat: take the remainder, divide, and stop when nothing is left.
  Digits come out from least to most significant, so reverse at the end.
</p>
<pre><code>function toBase(n, base) {
  if (n === 0) return "0";                          <span class="c">// the loop below would produce an empty string</span>
  const symbols = "0123456789abcdefghijklmnopqrstuvwxyz";
  let rest = Math.abs(n);
  const digits = [];
  while (rest &gt; 0) {
    const digit = rest % base;
    digits.push(symbols[digit]);
    rest = (rest - digit) / base;                   <span class="c">// exact: a multiple of base divided by base</span>
  }
  return (n &lt; 0 ? "-" : "") + digits.reverse().join("");
}

function fromBase(text, base) {
  const negative = text[0] === "-";
  let value = 0;
  for (const ch of negative ? text.slice(1) : text) {
    value = value * base + parseInt(ch, 36);       <span class="c">// each step shifts left one digit and adds the new one</span>
  }
  return negative ? -value : value;
}

toBase(156, 2);       <span class="c">// "10011100"</span>
toBase(-100, 7);      <span class="c">// "-202"</span>
fromBase("10011100", 2); <span class="c">// 156</span></code></pre>
<p>
  <code>n.toString(base)</code> and <code>parseInt(text, base)</code> exist
  and are the right tool in real code; the interview version asks you to write the loop.
  The loop costs O(log<sub>b</sub> n). Excel column titles are base 26
  with no zero digit ("A" is 1, "Z" is 26, "AA" is 27), so subtract 1 before taking
  each remainder. Forgetting that shift is the usual bug: 26 would become an
  empty digit.
</p>
<pre><code>function columnTitle(n) {
  const letters = [];
  while (n &gt; 0) {
    n -= 1;                                          <span class="c">// shift to 0..25 so that Z is 25, not 0</span>
    letters.push(String.fromCharCode(65 + (n % 26)));
    n = Math.floor(n / 26);
  }
  return letters.reverse().join("");
}

function columnNumber(title) {
  let n = 0;
  for (const ch of title) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n;
}

columnTitle(28);   <span class="c">// "AB"</span>
columnTitle(701);  <span class="c">// "ZY"</span>
columnNumber("AB"); <span class="c">// 28</span></code></pre>
<h4>Roman numerals</h4>
<p>
  To write n, go down a table of the thirteen values that have their own symbol (the
  subtractive forms 900, 400, 90, 40, 9, 4 included) and take each as many times as
  it fits. To read a numeral, add each symbol, but subtract it when the symbol to its right is
  larger, as in the I of IV.
</p>
<pre><code>const ROMAN = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"],
  [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];

function toRoman(n) {
  let out = "";
  for (const [value, symbol] of ROMAN) {
    while (n &gt;= value) {
      out += symbol;
      n -= value;
    }
  }
  return out;
}

function fromRoman(text) {
  const value = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  for (let i = 0; i &lt; text.length; i++) {
    const current = value[text[i]];
    const next = value[text[i + 1]] ?? 0;
    total += current &lt; next ? -current : current;
  }
  return total;
}

toRoman(1994);     <span class="c">// "MCMXCIV"</span>
fromRoman("MCMXCIV"); <span class="c">// 1994</span></code></pre>
<h4>Number to words</h4>
<p>
  English reads a number in groups of three digits, each followed by a scale word:
  1234567 is "1" million, "234" thousand, "567". So split from the right with
  <code>% 1000</code>, turn each group into words, add the scale, and join the groups
  from the largest down. A group under 1000 is the hundreds digit, then a number
  under 100 that is either in the table of 1 to 19 or a tens word plus a ones word.
</p>
<pre><code>const BELOW_TWENTY = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven",
  "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
const SCALES = ["", "Thousand", "Million", "Billion"];

function threeDigits(n) {
  const parts = [];
  if (n &gt;= 100) {
    parts.push(BELOW_TWENTY[Math.floor(n / 100)], "Hundred");
    n %= 100;
  }
  if (n &gt;= 20) {
    parts.push(TENS[Math.floor(n / 10)]);
    n %= 10;
  }
  if (n &gt; 0) parts.push(BELOW_TWENTY[n]);
  return parts.join(" ");
}

function numberToWords(num) {
  if (num === 0) return "Zero";
  const parts = [];
  for (let scale = 0; num &gt; 0; scale++) {
    const group = num % 1000;
    if (group &gt; 0) parts.push(threeDigits(group) + (SCALES[scale] ? " " + SCALES[scale] : ""));
    num = Math.floor(num / 1000);
  }
  return parts.reverse().join(" ");
}

numberToWords(1234567); <span class="c">// "One Million Two Hundred Thirty Four Thousand Five Hundred Sixty Seven"</span>
numberToWords(1000010); <span class="c">// "One Million Ten"</span></code></pre>
<div class="warn">
  <span class="ttl">⚠ Conversion mistakes</span>
  <b>(1)</b> Zero is a special case: the loops produce an empty string for it.
  <b>(2)</b> Skip a group of zeros entirely, or "One Million Thousand" appears for 1000010.
  <b>(3)</b> Join with single spaces and build the parts in an array, so there are no
  trailing or doubled spaces. <b>(4)</b> Take remainders of the absolute value
  and handle the sign once, outside the loop.
</div>

<h3>Reverse integer, digits and overflow</h3>
<p>
  Reversing digits is a loop of "take the last digit, shift the result". In JavaScript
  the interesting part is the 32-bit limit that the statement imposes, because the language
  itself does not overflow here. A 32-bit integer is at most 2147483647 in magnitude, so its
  reverse has at most ten digits and is below 10<sup>10</sup>, far inside the
  safe range. So you can compute the reverse in full and test the range at the
  end, with no need for the pre-check that other languages require.
</p>
<pre><code>function reverseInteger(x) {
  let rest = Math.abs(x);
  let reversed = 0;
  while (rest &gt; 0) {
    reversed = reversed * 10 + (rest % 10); <span class="c">// append the last digit of rest</span>
    rest = Math.floor(rest / 10);           <span class="c">// and drop it</span>
  }
  if (reversed &gt; 2 ** 31 - 1) return 0;      <span class="c">// out of the signed 32-bit range</span>
  return x &lt; 0 ? -reversed : reversed;
}

reverseInteger(123);         <span class="c">// 321</span>
reverseInteger(-120);        <span class="c">// -21</span>
reverseInteger(1534236469);  <span class="c">// 0, since 9646324351 is above 2^31 - 1</span></code></pre>
<p>
  Why no separate check for the negative side: a negative result would need a reverse of exactly 2<sup>31</sup> =
  2147483648 to reach -2<sup>31</sup>, and the input that reverses to it,
  8463847412, is itself out of range. Working with <code>Math.abs</code> avoids the
  negative-remainder trap: <code>-123 % 10</code> is <code>-3</code>, and
  <code>Math.floor(-123 / 10)</code> is <code>-13</code>, not -12. Use
  <code>Math.trunc</code> if you want to work on the signed value directly.
</p>
<p>
  <b>Palindrome number without a string.</b> Reverse only the second half. Stop
  when the reversed half is at least as large as what remains, which happens
  at the middle, and then compare, ignoring the middle digit when the length is odd. Negative numbers and numbers that end in 0 (except
  0 itself) are never palindromes, so rule them out first.
</p>
<pre><code>function isPalindromeNumber(x) {
  if (x &lt; 0 || (x % 10 === 0 &amp;&amp; x !== 0)) return false;
  let reversedHalf = 0;
  while (x &gt; reversedHalf) {
    reversedHalf = reversedHalf * 10 + (x % 10);
    x = Math.floor(x / 10);
  }
  return x === reversedHalf || x === Math.floor(reversedHalf / 10);
}

isPalindromeNumber(12321); <span class="c">// true</span></code></pre>
<h4>Digit tricks that replace a loop</h4>
<ul>
  <li><b>Digital root.</b> Repeatedly adding the digits of n until one digit is left gives 0 for n = 0 and <code>1 + (n - 1) % 9</code> otherwise. The reason: 10 leaves remainder 1 when divided by 9, so a number and its digit sum leave the same remainder when divided by 9, and the repeated sum is the one-digit number with that remainder (9, not 0, when n is a positive multiple of 9).</li>
  <li><b>Trailing zeros of n!.</b> Each trailing zero is a factor 10 = 2 * 5, and 2s are far more plentiful than 5s among the factors of 1 to n, so the count of 5s decides. Multiples of 5 contribute one, multiples of 25 a second, of 125 a third: the answer is the sum of floor(n / 5<sup>i</sup>). The loop runs log<sub>5</sub> n times, and n = 1000000 takes 8 steps.</li>
  <li><b>Power of three without a loop.</b> The largest power of three below 2<sup>31</sup> is 3<sup>19</sup> = 1162261467. Since 3 is prime, the divisors of 3<sup>19</sup> are exactly the powers of three up to 3<sup>19</sup>, so for a positive 32-bit n, <code>1162261467 % n === 0</code> tests it. The same trick works for any prime base, and is not valid for powers of a composite such as 4.</li>
  <li><b>Digit count.</b> <code>String(n).length</code>, or a loop that divides by 10. Not <code>Math.log</code>, for the reason in the warning near the start.</li>
</ul>
<pre><code>function digitalRoot(n) {
  return n === 0 ? 0 : 1 + ((n - 1) % 9);
}

function trailingZeroes(n) {
  let count = 0;
  for (let p = 5; p &lt;= n; p *= 5) count += Math.floor(n / p);
  return count;
}

function isPowerOfThree(n) {
  return n &gt; 0 &amp;&amp; 1162261467 % n === 0;
}

digitalRoot(38);        <span class="c">// 2: 3 + 8 = 11, then 1 + 1 = 2</span>
trailingZeroes(100);    <span class="c">// 24: 20 multiples of 5 plus 4 multiples of 25</span>
isPowerOfThree(27);     <span class="c">// true</span></code></pre>

<h3>Happy numbers and ugly numbers</h3>
<h4>Happy numbers</h4>
<p>
  Replace a number by the sum of the squares of its digits, repeatedly. It is happy
  if the sequence reaches 1, and unhappy otherwise. The question is why "otherwise" does
  not mean "runs forever without repeating": the sequence cannot grow without bound. A number with d digits maps to at
  most 81 * d. For d at least 4 that is smaller than the number itself
  (81 * 4 = 324 &lt; 1000), so while the value is 1000 or more it strictly decreases, and
  once it is below 1000 the next value is at most 243 (the largest sum for three digits is 81 * 3). So every sequence ends up among a finite set of
  values and must repeat. It either reaches 1, which maps to itself, or runs into a cycle.
  Checking every number below 1000 by program shows that the only cycle other than
  the fixed point 1 is 4, 16, 37, 58, 89, 145, 42, 20, back to 4.
</p>
<pre><code>function digitSquareSum(n) {
  let sum = 0;
  while (n &gt; 0) {
    const d = n % 10;
    sum += d * d;
    n = Math.floor(n / 10);
  }
  return sum;
}

function isHappy(n) {
  let slow = n;
  let fast = digitSquareSum(n);
  while (fast !== 1 &amp;&amp; slow !== fast) {  <span class="c">// stop at 1, or when the two pointers meet in a cycle</span>
    slow = digitSquareSum(slow);
    fast = digitSquareSum(digitSquareSum(fast));
  }
  return fast === 1;
}

isHappy(19); <span class="c">// true: 19, 82, 68, 100, 1</span>
isHappy(2);  <span class="c">// false: 2, 4, 16, 37, 58, 89, 145, 42, 20, 4, ...</span></code></pre>
<p>
  This is cycle detection on a function, the same fast and slow pointer idea as
  for linked lists. The alternative stores every value seen in a <code>Set</code> and
  stops on a repeat. It is simpler to write, and the fast and slow version
  needs O(1) extra space where the set needs space for every value seen. A 32-bit input
  drops below 1000 after the first step (at most 81 * 10 = 810), and from there every value is at most 243, so a 1 or a repeat
  must appear within 244 more steps. In a check over a large sample of 32-bit inputs the longest run was 20 steps.
</p>
<h4>Ugly numbers</h4>
<p>
  An ugly number has no prime factors other than 2, 3 and 5. To test one, divide out
  2, 3 and 5 as long as they divide n, and check that 1 remains. Zero and negatives are not ugly.
</p>
<p>
  To list the n-th ugly number, do not test integers one by one: the n-th ugly number can
  be far larger than n. Instead build the sequence in order. Every ugly number
  above 1 is 2, 3 or 5 times a smaller ugly number, so the next one is the smallest
  among 2 * u<sub>a</sub>, 3 * u<sub>b</sub> and 5 * u<sub>c</sub>, where a, b and c are
  pointers into the list of ugly numbers found so far, each pointing at the first entry
  whose multiple is not yet in the list. After adding a value, advance every
  pointer whose multiple equals it: 6 is both 2 * 3 and 3 * 2, and advancing only one
  pointer would add 6 twice.
</p>
<pre><code>function isUgly(n) {
  if (n &lt;= 0) return false;
  for (const p of [2, 3, 5]) {
    while (n % p === 0) n /= p;
  }
  return n === 1;
}

function nthUgly(n) {
  const ugly = [1];
  let i2 = 0;
  let i3 = 0;
  let i5 = 0;
  while (ugly.length &lt; n) {
    const next = Math.min(ugly[i2] * 2, ugly[i3] * 3, ugly[i5] * 5);
    ugly.push(next);
    if (next === ugly[i2] * 2) i2++;  <span class="c">// separate ifs, not else-if: a tie advances every pointer that produced it</span>
    if (next === ugly[i3] * 3) i3++;
    if (next === ugly[i5] * 5) i5++;
  }
  return ugly[n - 1];
}

nthUgly(10); <span class="c">// 12</span></code></pre>
<h4>Dry run: the first twelve ugly numbers</h4>
<table>
  <tr><th>step</th><th>2 * ugly[i2]</th><th>3 * ugly[i3]</th><th>5 * ugly[i5]</th><th>next</th><th>(i2, i3, i5) after</th></tr>
  <tr><td>2</td><td>2</td><td>3</td><td>5</td><td>2</td><td>(1, 0, 0)</td></tr>
  <tr><td>3</td><td>4</td><td>3</td><td>5</td><td>3</td><td>(1, 1, 0)</td></tr>
  <tr><td>4</td><td>4</td><td>6</td><td>5</td><td>4</td><td>(2, 1, 0)</td></tr>
  <tr><td>5</td><td>6</td><td>6</td><td>5</td><td>5</td><td>(2, 1, 1)</td></tr>
  <tr><td>6</td><td>6</td><td>6</td><td>10</td><td>6 (a tie)</td><td>(3, 2, 1)</td></tr>
  <tr><td>7</td><td>8</td><td>9</td><td>10</td><td>8</td><td>(4, 2, 1)</td></tr>
  <tr><td>8</td><td>10</td><td>9</td><td>10</td><td>9</td><td>(4, 3, 1)</td></tr>
  <tr><td>9</td><td>10</td><td>12</td><td>10</td><td>10 (a tie)</td><td>(5, 3, 2)</td></tr>
  <tr><td>10</td><td>12</td><td>12</td><td>15</td><td>12 (a tie)</td><td>(6, 4, 2)</td></tr>
  <tr><td>11</td><td>16</td><td>15</td><td>15</td><td>15 (a tie)</td><td>(6, 5, 3)</td></tr>
  <tr><td>12</td><td>16</td><td>18</td><td>20</td><td>16</td><td>(7, 5, 3)</td></tr>
</table>
<p class="sub">
  The list begins 1, 2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 16. <b>Cost:</b> O(n) time and space, with
  three pointer moves per step at most. The generalisation to a list of k primes
  ("super ugly numbers") keeps k pointers and takes O(n * k).
</p>

<h3>Probability basics</h3>
<p>
  Interview probability is mostly counting, so it belongs next to binomials. Three
  ideas cover most of it.
</p>
<ul>
  <li><b>Favourable over total, with equally likely outcomes.</b> The chance of rolling a sum of 7 with two dice is the number of (a, b) pairs with a + b = 7 (6 of them) divided by 36 outcomes. The skill is counting both numbers correctly, with the same notion of "outcome" in both.</li>
  <li><b>The complement.</b> "At least one" is cheapest as 1 minus "none". In a room of n people, the chance that all birthdays differ is the product of (365 - i) / 365 for i from 0 to n - 1, and the chance that at least two match is 1 minus that. It passes one half at n = 23.</li>
  <li><b>Linearity of expectation.</b> The expected value of a sum is the sum of the expected values, even when the parts are dependent. In a random permutation of n items, each position holds its own item with probability 1 / n, so the expected number of fixed points is n * (1 / n) = 1 for every n. The coupon collector's expected number of draws to see all n kinds is n * (1 + 1/2 + ... + 1/n), because once k kinds are collected, the wait for a new one has expected length n / (n - k).</li>
</ul>
<pre><code>function diceWays(dice, sides, target, m = Infinity) { <span class="c">// ways for the dice to total target; m = Infinity keeps the counts exact</span>
  let ways = new Array(target + 1).fill(0);
  ways[0] = 1;
  for (let d = 0; d &lt; dice; d++) {
    const next = new Array(target + 1).fill(0);
    for (let sum = 0; sum &lt;= target; sum++) {
      if (ways[sum] === 0) continue;
      for (let face = 1; face &lt;= sides &amp;&amp; sum + face &lt;= target; face++) {
        next[sum + face] = (next[sum + face] + ways[sum]) % m;
      }
    }
    ways = next;
  }
  return ways[target];
}

function sharedBirthdayProbability(people, days = 365) {
  let allDifferent = 1;
  for (let i = 0; i &lt; people; i++) allDifferent *= (days - i) / days;
  return 1 - allDifferent;
}

function couponCollectorExpected(kinds) {
  let expected = 0;
  for (let k = 0; k &lt; kinds; k++) expected += kinds / (kinds - k);
  return expected;
}

diceWays(2, 6, 7) / 6 ** 2;       <span class="c">// 6 / 36, about 0.1667</span>
sharedBirthdayProbability(23);    <span class="c">// about 0.5073</span>
couponCollectorExpected(6);       <span class="c">// 14.7, the expected rolls of a die to see every face</span></code></pre>
<p>
  <code>diceWays</code> is a DP over the number of dice and the running total, with O(dice * target * sides) time
  and O(target) space; it only adds, so with a modulus it is safe in plain Numbers.
  For probabilities, divide the count by sides<sup>dice</sup>, while that is small enough to represent. Other probability
  questions that look like sampling, such as building a fair generator for
  1 to 10 out of one for 1 to 7, use rejection: draw, and throw away outcomes that would make the
  result uneven, then repeat. Their expected cost is the reciprocal of the acceptance
  probability, and computing that is a counting exercise like the ones above.
</p>
<div class="warn">
  <span class="ttl">⚠ Probability pitfalls</span>
  <b>(1)</b> Counting ordered and unordered outcomes in the same ratio: two dice
  have 36 equally likely outcomes, not 21. <b>(2)</b> Multiplying the probabilities
  of events that are not independent. <b>(3)</b> Floating-point products over many
  terms lose accuracy; use logarithms or exact integer counts when the answer is a
  tiny ratio. <b>(4)</b> Saying "on average" without saying what is being averaged.
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>The statement says "modulo 10<sup>9</sup> + 7", or "return the result modulo": all arithmetic is residues, products go through BigInt or <code>mulMod</code>, and any division becomes a multiplication by an inverse.</li>
  <li>An exponent, index or repetition count is 10<sup>9</sup> or more: look for O(log n) with fast exponentiation, or with a matrix when the quantity follows a linear recurrence.</li>
  <li>"Number of ways" with identical items, grid paths or choices of a subset: a binomial. "Number of distinct trees or bracket structures": Catalan.</li>
  <li>Divisibility, "every k-th", cycles of equal length, measuring with fixed jugs, simplifying a ratio: gcd and lcm.</li>
  <li>Many primality questions or "primes up to n": sieve. One large number: trial division up to the square root, and factorization with the leftover rule.</li>
  <li>A people-in-a-circle problem where each round removes one: Josephus with the recurrence on the circle size.</li>
  <li>The input is a number but the work is on its digits, or the output is its text: the loop that takes <code>% 10</code> and <code>Math.floor(x / 10)</code>, or the grouping loop for words and bases.</li>
  <li>A process on numbers that repeats a function: either it reaches a fixed point or it cycles, and fast and slow pointers or a set decide which.</li>
  <li>The answer is an average, a chance or an expected value: write the sample space, count favourable outcomes, or break the quantity into parts and use linearity.</li>
</ul>
<p>
  Before coding any of it, test the idea on the smallest cases you can enumerate. These
  problems are short, so a wrong formula does not look wrong until you compare it with a
  case you counted by hand.
</p>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Say why integers above 2<sup>53</sup> are not all representable as a Number, and show a product of two residues below 10<sup>9</sup> + 7 that comes out wrong without BigInt.</li>
    <li>Prove that gcd(a, b) = gcd(b, a mod b) and that Euclid's algorithm takes O(log min(a, b)) steps. Explain why lcm divides by the gcd before multiplying.</li>
    <li>Explain why the sieve starts crossing at p * p, and give the argument that its running time is O(n log log n).</li>
    <li>Write <code>powMod</code> from memory and trace it on a 4-bit exponent. State what <code>mod</code> must do for negative inputs and why <code>(a - b) % m</code> is not enough.</li>
    <li>Derive the modular inverse from Fermat's little theorem, and write the factorial and inverse-factorial tables for nCr. State two conditions under which the recipe fails.</li>
    <li>Derive the Catalan recurrence from the first bracket and the stars-and-bars count from stars and dividers.</li>
    <li>Write M and the starting vector for a given linear recurrence, and say what the cost is in terms of the order k and the index n.</li>
    <li>Derive J(n) = (J(n - 1) + k) mod n from the relabelling argument, and say why simulation is slower.</li>
    <li>Handle zero, negative values and the 32-bit range in reverse integer and in base conversion, and name the bug that appears with Excel column titles if you forget to subtract one.</li>
  </ul>
</div>`,
};
