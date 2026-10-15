import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "slg-outline-plan",
      chapter: "dsa-sweep-line-geometry",
      level: "advanced",
      skill: "recognise",
      pattern: "intervals",
      section: "the-skyline-problem-a-heap-with-lazy-deletion",
      placement: true,
      kind: "single",
      prompt:
        "<p>You are given n buildings as <code>[left, right, height]</code>, with coordinates up to 10<sup>9</sup>, and must report the outline: every point where the silhouette height changes. Which plan scales to n = 10<sup>5</sup>?</p>",
      choices: [
        {
          id: "a",
          text: "For every integer x from the smallest left edge to the largest right edge, scan all the buildings for the tallest one, then merge neighbours of equal height.",
          why: "The output would be right, but the cost is the width of the range times n. With coordinates up to 10<sup>9</sup> the range alone is far too wide to walk.",
        },
        {
          id: "b",
          text: "Sort the buildings by height and paint each one onto an outline array, tallest first.",
          why: "Painting a building costs time proportional to its width, and a width can be 10<sup>9</sup>. Ordering by height does not remove that cost.",
        },
        {
          id: "c",
          text: "Sweep the sorted edges with a max-heap of the covering buildings, dropping an ended one only at the top.",
          why: "The outline can only change at an edge, so at most 2n coordinates matter. Each building is pushed once and popped at most once, which gives O(n log n).",
        },
        {
          id: "d",
          text: "Sort the buildings by left edge and compare each one only with the building just before it in that order.",
          why: "The tallest building at a position may have started much earlier than the previous one in sorted order, and a taller building further back can become visible again when a nearer one ends. A comparison with the predecessor alone cannot see it.",
        },
      ],
      answer: "c",
    },
    {
      id: "slg-count-containing",
      chapter: "dsa-sweep-line-geometry",
      level: "advanced",
      skill: "recognise",
      pattern: "intervals",
      section: "offline-queries-answer-them-in-the-order-that-suits-you",
      placement: true,
      kind: "single",
      prompt:
        "<p>You have 10<sup>5</sup> closed intervals <code>[start, end]</code> and 10<sup>5</sup> query times, all known up front. For each query time, you must report how many intervals contain it. Which plan is best?</p>",
      choices: [
        {
          id: "a",
          text: "Sort the starts and the ends once; the answer for t is (starts at most t) minus (ends below t), by binary search.",
          why: "An interval contains t when it has started by t and has not ended before t. Every interval that ended before t also started by t, so the subtraction removes exactly the ones that are over. The cost is O((n + q) log n).",
        },
        {
          id: "b",
          text: "For each query, loop over all the intervals and test <code>start &lt;= t &amp;&amp; t &lt;= end</code>.",
          why: "This is correct, but it makes n × q = 10<sup>10</sup> tests, which is far too slow at these sizes.",
        },
        {
          id: "c",
          text: "Merge the overlapping intervals first, then binary search the merged list for each query time.",
          why: "Merging forgets how many intervals made up each block. It can tell whether t is covered, but the question asks for a count.",
        },
        {
          id: "d",
          text: "Put every interval into a min-heap keyed by its end time, and pop the ended ones as each query arrives, in the given order.",
          why: "Popping for one query removes intervals that a later query with a smaller time may still need, so the answers go wrong when the queries arrive in the given order. It only becomes safe if the queries are sorted first, and then the binary searches are still simpler.",
        },
      ],
      answer: "a",
    },
    {
      id: "slg-most-collinear",
      chapter: "dsa-sweep-line-geometry",
      level: "advanced",
      skill: "recognise",
      pattern: "intervals",
      section: "maximum-points-on-a-line-hash-the-direction-not-the-slope",
      placement: true,
      kind: "single",
      prompt:
        "<p>Up to 3,000 points with integer coordinates are given, and some points may repeat. Find the largest number of points that lie on one straight line. Which plan is correct and fast enough?</p>",
      choices: [
        {
          id: "a",
          text: "Test every triple of points with the cross product and keep the largest collinear set.",
          why: "It is exact, but there are about 4.5 × 10<sup>9</sup> triples at n = 3,000, which is too many.",
        },
        {
          id: "b",
          text: "Sort the points by x and take the longest run of consecutive points whose slopes to the next point are equal.",
          why: "Points on one line need not be neighbours in the sorted order. Points from other lines can sit between them, so the longest run can miss the line.",
        },
        {
          id: "c",
          text: "For each point, key a <code>Map</code> by the floating-point value <code>dy / dx</code> to every other point and take the largest count plus one.",
          why: "With large coordinates, two different slopes can round to the same double, which merges points that are not collinear, and <code>dx = 0</code> needs a separate branch.",
        },
        {
          id: "d",
          text: "For each point, count the gcd-reduced directions <code>(dy, dx)</code>, signs fixed, in a <code>Map</code>; add the repeats and the point.",
          why: "Two integer vectors are parallel exactly when they are equal after dividing out the gcd and fixing the sign, so the key is exact. Each anchor costs O(n) lookups, so the whole thing is O(n²) times a logarithmic gcd.",
        },
      ],
      answer: "d",
    },
    {
      id: "slg-skyline-time",
      chapter: "dsa-sweep-line-geometry",
      level: "advanced",
      skill: "complexity",
      pattern: "intervals",
      section: "the-skyline-problem-a-heap-with-lazy-deletion",
      kind: "single",
      prompt:
        "<p>The heap-based skyline sorts the 2n edge coordinates, pushes each building once and pops ended buildings lazily from the top of the heap. What is its running time for n buildings?</p>",
      choices: [
        {
          id: "a",
          text: "O(n)",
          why: "Each building is touched a constant number of times, but the touches are not free. Sorting the coordinates costs O(n log n), and every push and pop on the heap costs O(log n).",
        },
        {
          id: "b",
          text: "O(n log n)",
          why: "Sorting the coordinates is O(n log n). Each building is pushed once and popped at most once, each in O(log n), so the sweep is O(n log n) as well.",
        },
        {
          id: "c",
          text: "O(n²), because dead buildings stay in the heap and are checked again at every coordinate",
          why: "A dead building is only examined when it is at the top, and it is popped on the spot and never seen again. A building that stays buried is not examined at all, so the pops in total are at most n.",
        },
        {
          id: "d",
          text: "O(n · W), where W is the width of the covered range",
          why: "The sweep visits only the 2n edge coordinates, never the positions between them, so the width does not appear in the cost.",
        },
      ],
      answer: "b",
    },
    {
      id: "slg-union-time",
      chapter: "dsa-sweep-line-geometry",
      level: "advanced",
      skill: "complexity",
      pattern: "intervals",
      section: "rectangle-union-the-simple-way-and-the-segment-tree",
      kind: "single",
      prompt:
        "<p>The area of the union of n axis-aligned rectangles is computed in two ways. One goes slab by slab, with the rectangles sorted by bottom edge once and each slab merging the y-ranges in one pass. The other sweeps along x with a segment tree over the compressed y values. Which pair of running times is right?</p>",
      choices: [
        {
          id: "a",
          text: "O(n log n) for the slab version and O(n log n) for the tree",
          why: "The tree is O(n log n), but the slab version has up to 2n - 1 slabs and every slab scans all n rectangles. That is quadratic.",
        },
        {
          id: "b",
          text: "O(n) for the slab version and O(n log n) for the tree",
          why: "The slab version cannot be linear: each of its up to 2n - 1 slabs looks at every rectangle.",
        },
        {
          id: "c",
          text: "O(n³) for the slab version and O(n²) for the tree",
          why: "The sort inside a slab was removed by sorting once up front, so each slab is a linear pass and the total is quadratic, not cubic. The tree does 2n updates of O(log n) each, which is not quadratic.",
        },
        {
          id: "d",
          text: "O(n²) for the slab version and O(n log n) for the tree",
          why: "The slab version has up to 2n - 1 slabs, each a linear pass over the rectangles. The tree makes 2n range updates of O(log n) each, after one sort.",
        },
      ],
      answer: "d",
    },
    {
      id: "slg-trace-skyline",
      chapter: "dsa-sweep-line-geometry",
      level: "advanced",
      skill: "trace",
      pattern: "intervals",
      section: "the-skyline-problem-a-heap-with-lazy-deletion",
      kind: "single",
      prompt:
        "<p>The chapter's <code>getSkyline</code> runs on <code>[[1, 5, 4], [2, 4, 6], [3, 7, 3]]</code>, with buildings written as <code>[left, right, height]</code>. What does it return?</p>",
      choices: [
        {
          id: "a",
          text: "<code>[[1, 4], [2, 6], [4, 4], [5, 3], [7, 0]]</code>",
          why: "The outline is 4 from x = 1, then 6 from x = 2. The 6-high building covers x only while x &lt; 4, so at x = 4 the height falls back to 4. The 4-high building ends at 5, which leaves the 3-high one, and at 7 nothing remains.",
        },
        {
          id: "b",
          text: "<code>[[1, 4], [2, 6], [5, 3], [7, 0]]</code>",
          why: "This misses <code>[4, 4]</code>. When the 6-high building ends at 4, the 4-high one is still standing until 5, so the outline steps down to 4 before it steps down to 3.",
        },
        {
          id: "c",
          text: "<code>[[1, 4], [2, 6], [3, 3], [4, 4], [5, 3], [7, 0]]</code>",
          why: "The 3-high building starts at 3 underneath the 6-high one, which stays on top, so the outline does not change at x = 3 and no key point is recorded.",
        },
        {
          id: "d",
          text: "<code>[[1, 4], [2, 6], [4, 6], [5, 3], [7, 0]]</code>",
          why: "A building is half-open: it covers x only while x &lt; right. At x = 4 the 6-high building has ended, so the height is 4, and a key point <code>[4, 6]</code> would not even be a change.",
        },
      ],
      answer: "a",
    },
    {
      id: "slg-trace-flowers",
      chapter: "dsa-sweep-line-geometry",
      level: "advanced",
      skill: "trace",
      pattern: "intervals",
      section: "offline-queries-answer-them-in-the-order-that-suits-you",
      kind: "single",
      prompt:
        "<p>Flowers bloom on the closed ranges <code>[[2, 5], [4, 8], [7, 9]]</code>. The chapter's <code>fullBloomFlowers</code> is called with the visitor times <code>[1, 5, 8, 9, 10]</code>. What does it return?</p>",
      choices: [
        {
          id: "a",
          text: "<code>[0, 1, 1, 0, 0]</code>",
          why: "This is the result when the ended flowers are counted with <code>end &lt;= t</code> instead of <code>end &lt; t</code>. It loses the flower that ends exactly at the visitor's time, which is still in bloom on a closed range.",
        },
        {
          id: "b",
          text: "<code>[0, 2, 3, 2, 0]</code>",
          why: "At t = 8 the flower [2, 5] is over, so only [4, 8] and [7, 9] are in bloom, which is 2, and at t = 9 only [7, 9] remains, which is 1.",
        },
        {
          id: "c",
          text: "<code>[0, 2, 2, 1, 0]</code>",
          why: "Starts are 2, 4, 7 and ends are 5, 8, 9. For t = 1, 5, 8, 9, 10 the starts at most t number 0, 2, 3, 3, 3 and the ends below t number 0, 0, 1, 2, 3. The differences are 0, 2, 2, 1, 0.",
        },
        {
          id: "d",
          text: "<code>[1, 2, 2, 1, 0]</code>",
          why: "At t = 1 no flower has opened yet, because the earliest start is 2, so the count is 0 and not 1.",
        },
      ],
      answer: "c",
    },
    {
      id: "slg-closed-tie",
      chapter: "dsa-sweep-line-geometry",
      level: "advanced",
      skill: "edge-case",
      pattern: "intervals",
      section: "the-sweep-line-recipe-events-a-tie-break-and-an-active-set",
      kind: "single",
      prompt:
        "<p>A teammate counts the most closed intervals that share a point, where touching ends count. Their events are <code>[x, +1]</code> for a start and <code>[x, -1]</code> for an end. They sort with <code>a[0] - b[0] || a[1] - b[1]</code>, then add the second numbers in order and keep the maximum. What does it return for <code>[[1, 2], [2, 3]]</code>?</p>",
      choices: [
        {
          id: "a",
          text: "2, since the point 2 is shared",
          why: "2 is the right answer to the question, but this code does not produce it. At x = 2 the end event <code>-1</code> sorts before the start event <code>+1</code>, so the count falls before it rises again.",
        },
        {
          id: "b",
          text: "1",
          why: "The sorted events are (1, +1), (2, -1), (2, +1), (3, -1), so the running count is 1, 0, 1, 0 and its maximum is 1. For closed intervals the starts must come first at a tie.",
        },
        {
          id: "c",
          text: "3",
          why: "There are only two intervals, so the count of active ones can never exceed 2.",
        },
        {
          id: "d",
          text: "0",
          why: "The running count does end at 0, but the answer is its maximum over the walk, which is at least 1 after the first start.",
        },
      ],
      answer: "b",
    },
    {
      id: "slg-cross-range",
      chapter: "dsa-sweep-line-geometry",
      level: "advanced",
      skill: "edge-case",
      pattern: "intervals",
      section: "geometry-in-integers-cross-product-and-orientation",
      kind: "single",
      prompt:
        "<p>The points have integer coordinates with absolute value at most M, and the cross product is computed with plain <code>Number</code> arithmetic. Which of these bounds on M is the largest one for which every result is guaranteed to be exact?</p>",
      choices: [
        {
          id: "a",
          text: "30,000,000",
          why: "Each difference is at most 6 × 10<sup>7</sup>, each product at most 3.6 × 10<sup>15</sup> and the cross product at most 7.2 × 10<sup>15</sup>. That is below 2<sup>53</sup>, about 9 × 10<sup>15</sup>, so every integer on the way is represented exactly.",
        },
        {
          id: "b",
          text: "50,000,000",
          why: "Differences reach 10<sup>8</sup>, so products can reach 10<sup>16</sup>, past 2<sup>53</sup>, where not every integer can be stored, so a product or the difference of two products can be off.",
        },
        {
          id: "c",
          text: "1,000,000,000",
          why: "Far beyond the safe range. For the points (0, 0), (999999999, 999999998) and (999999998, 999999997) the exact cross product is -1, but <code>Number</code> arithmetic returns 0 and calls them collinear.",
        },
        {
          id: "d",
          text: "2,000,000,000",
          why: "This allows the full 32-bit range, where a product of two differences reaches about 1.6 × 10<sup>19</sup>, over a thousand times 2<sup>53</sup>. <code>BigInt</code> is needed there.",
        },
      ],
      answer: "a",
    },
    {
      id: "slg-ray-vertex",
      chapter: "dsa-sweep-line-geometry",
      level: "advanced",
      skill: "edge-case",
      pattern: "intervals",
      section: "point-in-polygon-by-ray-casting",
      kind: "single",
      prompt:
        "<p>A ray-casting test counts an edge whenever the row of the ray lies between the edge's two y values, ends included. For the diamond <code>[[2, 0], [4, 2], [2, 4], [0, 2]]</code> and the point <code>(1, 2)</code> the ray to the right passes exactly through the vertex <code>(4, 2)</code>, and the test says the point is outside. Which repair makes the count right at every vertex on the ray?</p>",
      choices: [
        {
          id: "a",
          text: "Skip every edge that has a vertex on the ray's row, since those are the troublesome ones.",
          why: "That also skips real crossings. In this diamond all four edges touch a vertex on the row y = 2, so every edge is skipped and the count is 0 for a point that is inside.",
        },
        {
          id: "b",
          text: "Count a crossing twice whenever the ray goes through a vertex, so vertices weigh double.",
          why: "At (4, 2) the outline passes from below the ray to above it, which is one crossing. Counting it twice would keep the total even, so the point would still look outside.",
        },
        {
          id: "c",
          text: "Count an edge only when exactly one of its ends is strictly above the ray's row.",
          why: "This treats a vertex on the row as lying just below the ray, so the ray never touches a vertex. A vertex where the outline passes through is counted once, and a horizontal edge, with both ends on one side, is never counted.",
        },
        {
          id: "d",
          text: "Shoot the ray upward instead of to the right, so that it misses the vertex (4, 2).",
          why: "A vertex can lie directly above the point just as well as to its right, so the same problem appears for the new direction. The rule for vertices has to be fixed whichever way the ray goes.",
        },
      ],
      answer: "c",
    },
    {
      id: "slg-collinear-overlap",
      chapter: "dsa-sweep-line-geometry",
      level: "advanced",
      skill: "edge-case",
      pattern: "intervals",
      section: "geometry-in-integers-cross-product-and-orientation",
      kind: "single",
      prompt:
        "<p>For segments <code>ab</code> and <code>cd</code>, the chapter computes the orientations <code>o1</code>, <code>o2</code> of <code>c</code> and <code>d</code> against <code>ab</code>, and <code>o3</code>, <code>o4</code> of <code>a</code> and <code>b</code> against <code>cd</code>. On its own, the test <code>o1 !== o2 &amp;&amp; o3 !== o4</code> wrongly reports &quot;no intersection&quot; for which input?</p>",
      choices: [
        {
          id: "a",
          text: "Two segments that cross like an X, with the crossing inside both of them.",
          why: "Both pairs of orientations differ, so the test returns true, which is correct.",
        },
        {
          id: "b",
          text: "A T shape, where an endpoint of one segment lies in the middle of the other one.",
          why: "The endpoint on the other segment has orientation 0, the other endpoint has orientation 1 or -1, so the first pair differs. The other pair differs too, so the test returns true, which is correct.",
        },
        {
          id: "c",
          text: "Two segments that share exactly one endpoint and are not on the same line.",
          why: "The shared endpoint has orientation 0 against the other segment and the far endpoint does not, so both pairs differ and the test returns true, which is correct.",
        },
        {
          id: "d",
          text: "Two collinear segments that overlap, such as (0, 0)-(3, 3) and (2, 2)-(5, 5).",
          why: "All four orientations are 0, so <code>o1 === o2</code> and the test returns false although the segments share a stretch. The four checks for an endpoint lying on the other segment are what catch it.",
        },
      ],
      answer: "d",
    },
    {
      id: "slg-hull-collinear",
      chapter: "dsa-sweep-line-geometry",
      level: "advanced",
      skill: "edge-case",
      pattern: "intervals",
      section: "convex-hull-by-monotone-chain-erect-the-fence",
      kind: "single",
      prompt:
        "<p>A monotone chain pops the top of its stack while <code>cross(a, b, p) &lt;= 0</code>. For &quot;erect the fence&quot; every point on the boundary must be kept, including points in the middle of a straight stretch. What change is needed?</p>",
      choices: [
        {
          id: "a",
          text: "Sort the points by y instead of by x, so the chain starts at the bottom.",
          why: "The sort axis does not matter for this. Whichever axis is used, a point in the middle of a straight stretch makes a zero turn, and <code>&lt;= 0</code> still pops it.",
        },
        {
          id: "b",
          text: "Pop only while <code>cross(a, b, p) &lt; 0</code>, so straight triples keep their middle.",
          why: "A zero cross product means the middle point is on the segment between its neighbours, so it is on the boundary but not a corner. Popping only on a strict right turn keeps it and still removes every point that is inside.",
        },
        {
          id: "c",
          text: "Pop while <code>cross(a, b, p) &gt;= 0</code> instead, which flips the turn that gets removed.",
          why: "That pops left turns and keeps right turns, so the chains run clockwise, but a straight triple has a cross product of 0 and <code>&gt;= 0</code> still pops its middle point.",
        },
        {
          id: "d",
          text: "Build only the lower chain, because the upper chain would repeat the same points.",
          why: "The lower chain follows the bottom of the boundary only. Without the upper chain, the points along the top are missing.",
        },
      ],
      answer: "b",
    },
    {
      id: "slg-same-direction",
      chapter: "dsa-sweep-line-geometry",
      level: "advanced",
      skill: "trace",
      pattern: "intervals",
      section: "maximum-points-on-a-line-hash-the-direction-not-the-slope",
      kind: "multi",
      prompt:
        "<p>In the chapter's <code>maxPoints</code>, the key for another point is built from its offset <code>(dx, dy)</code> from the anchor, divided by the gcd of the two numbers and then given a fixed sign. Select every offset that gets the same key as the offset <code>(2, 4)</code>.</p>",
      choices: [
        {
          id: "a",
          text: "<code>(1, 2)</code>",
          why: "The gcd of 1 and 2 is 1, so the pair is unchanged, and it is the same as (2, 4) divided by its gcd of 2.",
        },
        {
          id: "b",
          text: "<code>(-1, -2)</code>",
          why: "It points the opposite way along the same line. The sign rule makes <code>dx</code> positive, which turns it into (1, 2), the same key.",
        },
        {
          id: "c",
          text: "<code>(4, 8)</code>",
          why: "Dividing by the gcd of 4 gives (1, 2) again, because it is a multiple of (2, 4) in the same direction.",
        },
        {
          id: "d",
          text: "<code>(2, -4)</code>",
          why: "It reduces to (1, -2). The direction is mirrored across the horizontal axis, so it is a different line and gets a different key.",
        },
        {
          id: "e",
          text: "<code>(4, 2)</code>",
          why: "It reduces to (2, 1). The two numbers are swapped, which is a different slope, so the key differs.",
        },
      ],
      answers: ["a", "b", "c"],
    },
    {
      id: "slg-offline-order",
      chapter: "dsa-sweep-line-geometry",
      level: "advanced",
      skill: "trace",
      pattern: "intervals",
      section: "offline-queries-answer-them-in-the-order-that-suits-you",
      kind: "order",
      prompt:
        "<p>Put the steps of the offline &quot;smallest interval containing each query&quot; sweep in the order they happen. The three steps that run once per query are listed in the order of a single pass of the loop.</p>",
      items: [
        { id: "sort", text: "Sort the intervals by left end, and sort the query indices by query value." },
        {
          id: "push",
          text: "For the next query <code>q</code>, push every interval whose left end is at most <code>q</code> onto the min-heap as <code>[size, right]</code>.",
        },
        { id: "pop", text: "Pop from the heap while its top has a right end below <code>q</code>." },
        {
          id: "write",
          text: "Write the top's size into the answer slot of the query's original index, or -1 if the heap is empty.",
        },
      ],
      why: "Both sorts come first, because the sweep consumes intervals and queries in increasing order. For each query, intervals must be pushed before dead ones are popped, since a freshly pushed interval can already have ended and has to be removed in the same pass. The answer is read last, from a top that is now alive, and written to the index the query came from.",
    },
  ],
  pattern: {
    pattern: "intervals",
    chapter: "dsa-sweep-line-geometry",
    signals: [
      "Buildings, rectangles or intervals with a start and an end, and a question about the tallest, smallest or total covered value at each position.",
      "Many queries against a fixed set, all known up front, where sorting the queries lets one sweep answer them.",
      "Coordinates up to 10^9 with few distinct values, where only the order of the values matters.",
      "Integer points where the question is a turn direction, an intersection, an area, or the most points on a line.",
    ],
    template:
      "<pre><code>events.sort((a, b) =&gt; a.x - b.x || a.kind - b.kind); for (const e of events) { update(active, e); read(active); }</code></pre>",
    time: "O(n log n) to sort the events",
    space: "O(n) for the events and the active set",
    styles: ["online-assessment", "phone-screen", "onsite"],
  },
};
