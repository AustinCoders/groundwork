import type { DsaQuestion } from "./dsa-types";

export const questions: DsaQuestion[] = [
  {
    id: "zomato-network-delay",
    company: "zomato",
    title: "Shortest path with Dijkstra",
    prompt:
      "A network has nodes labelled 1 to n, and each directed edge [from, to, time] says a signal sent from one node reaches the other after that many time units. A signal starts at node k and travels along every outgoing edge at once; return how long it takes until every node has received it, or -1 if some node is never reached. For times [[1,2,1],[1,3,5],[2,3,2],[3,4,1]], n = 4 and k = 1 the answer is 4. Times are non-negative, and there can be tens of thousands of nodes and about 100,000 edges.",
    level: "campus (SDE-1 level)",
    difficulty: "Medium",
    pattern: "Dijkstra with a min-heap",
    patternId: "graph",
    leetcode: { number: 743, slug: "network-delay-time" },
    evidence: "one",
    sources: [
      {
        label: "Zomato FTE on-campus 2023 (GeeksforGeeks)",
        url: "https://www.geeksforgeeks.org/?p=1140290",
        kind: "candidate-report",
        year: 2023,
      },
    ],
    chapters: ["dsa-graph-problems", "dsa-heaps-priority-queues"],
    answer: {
      ask: `<p>I would ask: are the edges directed, and can there be several edges between the same pair of nodes, or an edge from a node to itself? Can a time be zero or negative? Are the labels exactly 1 to n with no gaps? How many nodes and edges are there, so I know whether an O(V×E) method is allowed? What should I return when n is 1 and there are no edges, or when some node cannot be reached?</p>
<p>I would assume directed edges, non-negative integer times, possible duplicate edges and self loops, an answer of 0 for a single node, and -1 when any node is unreachable.</p>`,
      brute: `<p>The direct answer is Bellman-Ford. Set the distance of node k to 0 and everything else to infinity, then repeat n - 1 times: go through every edge and lower the distance of its target if the route through its source is shorter. The largest distance is the answer. It works for every weight, but it costs O(V×E).</p>
<p>With 10,000 nodes and 100,000 edges that is a billion edge checks, and most passes change almost nothing, because only a thin frontier of nodes still has a distance that can improve. Another naive idea, a depth-first search that keeps the smallest time seen per node, can revisit nodes an exponential number of times on a layered graph. Both waste work that a smarter visiting order avoids.</p>`,
      insight: `<p>The pattern is <b>Dijkstra's algorithm with a min-heap</b>. Keep a heap of candidate arrivals, each a pair (time, node), starting with (0, k). Repeatedly take the pair with the smallest time. If that node is already settled, skip the pair. Otherwise its time is final: record it, and push a candidate (time + edge time, neighbor) for every outgoing edge that leads to a node not yet settled.</p>
<p>Why a settled time is final: the heap always gives the smallest unsettled candidate. Any other route to that node has to leave the settled set through some candidate that is at least as large, and then keep adding edge times that are never negative, so it cannot arrive earlier. That is the whole proof, and it is also why one negative edge breaks the method.</p>
<p>The signal reaches each node at the moment its shortest path ends, so the time for everyone to hear is the largest settled time. If fewer than n nodes get settled, the rest are unreachable and the answer is -1. This is a lazy heap: instead of lowering a key in place, I push a fresh entry and ignore stale ones when they come out. Each edge pushes at most one entry, so the heap never holds more than E + 1 entries and the total cost is O(E log E). With no duplicate edges E is at most V², so that is also O(E log V). JavaScript has no built-in priority queue, so I write a small binary heap and say so.</p>
<p>Out loud: always lock in the cheapest arrival, then offer its neighbors a later one.</p>`,
      walkthrough: `<p>Take the example with k = 1. The trace shows each pop from the heap. Pop (0, 1): node 1 settles at 0, and its two edges push (1, 2) and (5, 3). Pop (1, 2): node 2 settles at 1, and its edge to node 3 pushes (3, 3), a better arrival than the (5, 3) already waiting. Pop (3, 3): node 3 settles at 3 and pushes (4, 4). Pop (4, 4): node 4 settles at 4 and has no outgoing edges.</p>
<p>The last pop is (5, 3), the old long route to node 3. Node 3 is already settled, so it is skipped. All four nodes are settled, the largest settled time is 4, and that is the answer. The stale entry sat in the heap the whole time and cost only one skipped pop.</p>`,
      edges: `<p>A single node with no edges: the heap holds (0, 1), node 1 settles, the settled count equals n, and the result is 0. An unreachable node: the settled count ends below n, so the code returns -1. A source with no outgoing edges when n is above 1 gives -1 for the same reason.</p>
<p>Zero-time edges are fine, because the method only needs times that are not negative. Duplicate edges just add a harmless extra heap entry, and a self loop is never pushed because its node is already settled. Direction matters: an edge from A to B does not let B reach A, so the graph is stored as a directed adjacency list. The adjacency array has n + 1 slots, so labels 1 to n index it directly with no shifting.</p>`,
      followups: [
        "How would you change the code to return the path to the node that hears the signal last?",
        "Why does a single negative edge break Dijkstra, and which algorithm handles it?",
        "If the graph is dense and n is small, would a plain array scan beat the heap?",
        "How would you answer this for many different start nodes on the same graph?",
        "What simpler method works if every edge takes exactly one time unit?",
      ],
      slips: `<p>Building the graph as undirected is the most common slip, because the input lists directed edges. Another is running a plain BFS and treating the number of hops as the time. BFS only works when every edge costs the same.</p>
<p>Others: marking a node as visited when it is pushed instead of when it is popped, which locks in a longer route before a shorter one arrives; forgetting the -1 case and returning the largest distance even when some node was never reached; starting the distance of every node at 0, which hides the unreachable ones; keeping the candidate list sorted by calling sort after every push, which turns O(E log E) into something far slower; and mixing up zero-based and one-based labels.</p>`,
    },
    trace: {
      caption: "Dijkstra on times [[1,2,1],[1,3,5],[2,3,2],[3,4,1]] from node 1: each pop from the heap.",
      head: ["Step", "Pop (time,node)", "What happens", "Pushed", "Heap after"],
      rows: [
        ["1", "(0,1)", "settle 1 at 0", "(1,2) (5,3)", "(1,2) (5,3)"],
        ["2", "(1,2)", "settle 2 at 1", "(3,3)", "(3,3) (5,3)"],
        ["3", "(3,3)", "settle 3 at 3", "(4,4)", "(4,4) (5,3)"],
        ["4", "(4,4)", "settle 4 at 4", "none", "(5,3)"],
        ["5", "(5,3)", "stale, skip", "none", "empty"],
      ],
    },
    complexity: { time: "O(E log E)", space: "O(V + E)", brute: "O(V×E)" },
    solution: {
      entry: "networkDelayTime",
      code: `function networkDelayTime(times, n, k) {
  const graph = Array.from({ length: n + 1 }, () => []);
  for (const [from, to, weight] of times) graph[from].push([to, weight]);
  const heap = [[0, k]];
  const settled = new Array(n + 1).fill(-1);
  let settledCount = 0;
  let latest = 0;
  while (heap.length > 0) {
    const [dist, node] = popMin(heap);
    if (settled[node] !== -1) continue;
    settled[node] = dist;
    settledCount++;
    latest = Math.max(latest, dist);
    for (const [next, weight] of graph[node]) {
      if (settled[next] === -1) pushHeap(heap, [dist + weight, next]);
    }
  }
  return settledCount === n ? latest : -1;
}
function pushHeap(heap, item) {
  heap.push(item);
  let i = heap.length - 1;
  while (i > 0 && heap[(i - 1) >> 1][0] > heap[i][0]) {
    const parent = (i - 1) >> 1;
    [heap[parent], heap[i]] = [heap[i], heap[parent]];
    i = parent;
  }
}
function popMin(heap) {
  const top = heap[0];
  const last = heap.pop();
  if (heap.length === 0) return top;
  heap[0] = last;
  let i = 0;
  while (true) {
    let smallest = i;
    for (const child of [2 * i + 1, 2 * i + 2]) {
      if (child < heap.length && heap[child][0] < heap[smallest][0]) smallest = child;
    }
    if (smallest === i) return top;
    [heap[smallest], heap[i]] = [heap[i], heap[smallest]];
    i = smallest;
  }
}`,
      cases: [
        {
          args: [
            [
              [1, 2, 1],
              [1, 3, 5],
              [2, 3, 2],
              [3, 4, 1],
            ],
            4,
            1,
          ],
          expected: 4,
        },
        {
          args: [
            [
              [2, 1, 1],
              [2, 3, 1],
              [3, 4, 1],
            ],
            4,
            2,
          ],
          expected: 2,
        },
        { args: [[[1, 2, 1]], 2, 2], expected: -1 },
        { args: [[], 1, 1], expected: 0 },
        { args: [[], 3, 2], expected: -1 },
        {
          args: [
            [
              [1, 2, 0],
              [2, 1, 0],
              [2, 2, 5],
              [1, 3, 0],
            ],
            3,
            1,
          ],
          expected: 0,
        },
        {
          args: [
            [
              [1, 2, 4],
              [1, 2, 1],
              [2, 3, 1],
              [1, 3, 9],
            ],
            3,
            1,
          ],
          expected: 2,
        },
        {
          args: [
            [
              [1, 2, 2],
              [2, 3, 2],
              [3, 4, 2],
              [4, 5, 2],
              [1, 5, 9],
              [5, 6, 1],
            ],
            6,
            1,
          ],
          expected: 9,
        },
        {
          args: [
            [
              [3, 1, 1],
              [1, 2, 1],
              [2, 3, 1],
            ],
            3,
            1,
          ],
          expected: 2,
        },
        {
          args: [
            [
              [27, 13, 13],
              [40, 28, 14],
              [7, 36, 14],
              [34, 30, 7],
              [32, 8, 12],
              [10, 9, 16],
              [35, 34, 2],
              [19, 30, 7],
              [12, 15, 19],
              [35, 17, 9],
              [33, 7, 3],
              [13, 16, 10],
              [39, 19, 15],
              [10, 18, 18],
              [33, 13, 11],
              [34, 29, 2],
              [24, 4, 14],
              [16, 28, 5],
              [16, 17, 8],
              [38, 18, 0],
              [11, 6, 14],
              [1, 12, 5],
              [17, 9, 16],
              [20, 22, 17],
              [25, 28, 0],
              [23, 18, 10],
              [27, 12, 10],
              [39, 9, 10],
              [37, 25, 0],
              [26, 26, 8],
              [33, 28, 5],
              [32, 40, 10],
              [8, 23, 14],
              [35, 23, 14],
              [4, 38, 1],
              [10, 19, 16],
              [13, 35, 4],
              [33, 17, 9],
              [1, 13, 14],
              [34, 32, 20],
              [24, 35, 6],
              [1, 11, 11],
              [26, 28, 14],
              [20, 27, 19],
              [28, 6, 11],
              [9, 28, 9],
              [13, 28, 7],
              [16, 10, 6],
              [5, 22, 20],
              [29, 21, 17],
              [33, 13, 10],
              [20, 6, 18],
              [14, 1, 12],
              [16, 4, 2],
              [5, 5, 16],
              [29, 29, 7],
              [9, 19, 19],
              [13, 4, 18],
              [15, 40, 4],
              [10, 24, 20],
              [11, 30, 6],
              [33, 12, 11],
              [30, 22, 14],
              [28, 11, 2],
              [31, 2, 2],
              [20, 19, 7],
              [28, 26, 12],
              [14, 18, 9],
              [24, 13, 19],
              [38, 25, 8],
              [36, 11, 0],
              [17, 16, 19],
              [40, 2, 8],
              [16, 7, 18],
              [12, 39, 15],
              [40, 32, 9],
              [27, 36, 6],
              [32, 24, 13],
              [23, 4, 19],
              [30, 2, 13],
              [12, 33, 15],
              [39, 22, 18],
              [9, 5, 4],
              [37, 32, 5],
              [13, 35, 16],
              [28, 29, 4],
              [34, 33, 16],
              [10, 7, 1],
              [10, 14, 10],
              [20, 3, 6],
              [26, 37, 3],
              [2, 11, 16],
              [20, 26, 11],
              [5, 33, 9],
              [26, 25, 6],
              [5, 24, 11],
              [32, 17, 0],
              [40, 32, 16],
              [10, 8, 14],
              [38, 17, 9],
              [39, 27, 10],
              [28, 22, 10],
              [29, 29, 6],
              [11, 2, 3],
              [35, 20, 6],
              [1, 5, 20],
              [33, 24, 20],
              [32, 29, 17],
              [40, 26, 14],
              [6, 32, 7],
              [27, 20, 19],
              [19, 2, 14],
              [5, 7, 20],
              [17, 18, 1],
              [37, 18, 13],
              [40, 32, 16],
              [16, 9, 15],
              [3, 2, 17],
              [17, 35, 13],
              [11, 7, 1],
              [24, 23, 13],
              [4, 12, 5],
              [4, 8, 2],
              [12, 34, 2],
              [20, 37, 1],
              [29, 28, 8],
              [1, 6, 4],
              [28, 33, 13],
              [9, 20, 4],
              [31, 1, 5],
              [13, 16, 8],
              [18, 4, 0],
              [36, 4, 10],
              [38, 33, 3],
              [3, 10, 19],
              [32, 15, 20],
              [13, 4, 7],
              [26, 20, 9],
              [19, 26, 11],
              [2, 23, 18],
              [31, 35, 7],
              [20, 6, 11],
              [13, 19, 16],
              [20, 17, 17],
              [39, 20, 8],
              [18, 33, 11],
              [37, 39, 20],
              [5, 24, 14],
              [12, 19, 2],
              [34, 12, 1],
              [6, 34, 3],
              [1, 31, 6],
              [36, 9, 20],
              [16, 9, 9],
              [9, 16, 15],
              [20, 30, 13],
              [28, 38, 16],
              [13, 30, 2],
              [24, 11, 9],
              [2, 39, 10],
              [1, 2, 30],
              [2, 3, 30],
              [3, 4, 30],
              [4, 5, 30],
              [5, 6, 30],
              [6, 7, 30],
              [7, 8, 30],
              [8, 9, 30],
              [9, 10, 30],
              [10, 11, 30],
              [11, 12, 30],
              [12, 13, 30],
              [13, 14, 30],
              [14, 15, 30],
              [15, 16, 30],
              [16, 17, 30],
              [17, 18, 30],
              [18, 19, 30],
              [19, 20, 30],
              [20, 21, 30],
              [21, 22, 30],
              [22, 23, 30],
              [23, 24, 30],
              [24, 25, 30],
              [25, 26, 30],
              [26, 27, 30],
              [27, 28, 30],
              [28, 29, 30],
              [29, 30, 30],
              [30, 31, 30],
              [31, 32, 30],
              [32, 33, 30],
              [33, 34, 30],
              [34, 35, 30],
              [35, 36, 30],
              [36, 37, 30],
              [37, 38, 30],
              [38, 39, 30],
              [39, 40, 30],
            ],
            40,
            1,
          ],
          expected: 38,
        },
      ],
    },
  },
  {
    id: "zomato-min-size-subarray",
    company: "zomato",
    title: "Minimum Size Subarray Sum",
    prompt:
      "Given an array of positive integers and a positive target, return the length of the shortest contiguous run of elements whose sum is at least the target, or 0 if no run is big enough. For target 7 and [2,3,1,2,4,3] the answer is 2, from the run [4,3]. The array can hold 100,000 numbers, so checking every pair of ends is too slow.",
    level: "level not stated",
    difficulty: "Medium",
    pattern: "Sliding window",
    patternId: "window",
    leetcode: { number: 209, slug: "minimum-size-subarray-sum" },
    evidence: "guide",
    sources: [
      {
        label: "Zomato interview process (TechPrep)",
        url: "https://www.techprep.app/companies/zomato",
        kind: "prep-guide",
        year: 2026,
      },
    ],
    chapters: ["dsa-sliding-window"],
    answer: {
      ask: `<p>I would ask: are all numbers strictly positive, or can there be zeros or negatives? Is the target always positive? Do I need a contiguous run, or any subset? Is the requirement a sum of at least the target, or exactly the target? What do I return for an empty array, or when even the whole array falls short? How long can the array be, and could the sum overflow?</p>
<p>I would assume positive integers, a positive target, a contiguous run with sum at least the target, a result of 0 when none exists, and a total that fits in a normal JavaScript number.</p>`,
      brute: `<p>Try every start. For each start, add elements one at a time until the sum reaches the target, record the length, and move to the next start. Stopping at the first success keeps each start cheap in a lucky case, but when the target is large or unreachable every start scans to the end. That is O(n²) time. Recomputing each sum from scratch instead of keeping a running total would make it O(n³).</p>
<p>With 100,000 numbers, n² is about ten billion steps, far past what runs in a second. The waste is that the sums of neighboring runs share almost every element, yet this approach rebuilds each one from nothing.</p>`,
      insight: `<p>The pattern is a <b>variable-size sliding window</b>. Keep a window from left to right and its running sum. Move right one step at a time, adding the new number. While the sum is at least the target, the window is a valid answer: record its length, then drop the leftmost number and move left forward to see whether a shorter window still works.</p>
<p>Why this finds the true minimum: fix an end position. The best start for it is the largest left whose sum still reaches the target. Because every number is positive, making the window longer on the right only raises its sum, so a start that was good for one end is still good for the next end. That means the best start never moves backward as the end moves forward, and left only ever advances. No candidate is skipped, because every shrink step happens only after the valid window was measured.</p>
<p>Each index is added once and removed at most once, so the work is O(n) even though the loop is nested. Only a few numbers are stored, so extra space is O(1). The positivity is doing real work: with negatives, dropping a number can raise the sum, and the argument above breaks. I would say it out loud as: grow until it is enough, then shrink while it is still enough, and remember the shortest size seen.</p>`,
      walkthrough: `<p>Use target 7 on [2,3,1,2,4,3]. The trace shows the state after each right step. For right = 0, 1 and 2 the sums are 2, 5 and 6, all below 7, so nothing is recorded. At right = 3 the sum is 8, which is enough: record length 4, drop the 2, and the sum falls to 6, below the target.</p>
<p>At right = 4 the sum is 10. Record length 4 for [3,1,2,4], drop the 3 to get 7, which still works, so record length 3 for [1,2,4], drop the 1 and stop at 6. At right = 5 the sum is 9: record 3, drop the 2 to get 7, record 2 for [4,3], drop the 4 to get 3 and stop. The best length seen is 2.</p>`,
      edges: `<p>Empty array: the loop never runs and the shortest length stays at Infinity, so the function returns 0. Total sum below the target: the inner loop never fires, same result of 0. A single number at least as big as the target: the window of length 1 is recorded at once, and the answer is 1, the smallest possible. The whole array needed: the window only reaches the target on the last step, so the answer is n.</p>
<p>Target met exactly: the test is greater than or equal, so a sum equal to the target counts. A big number followed by small ones: the shrinking loop may run several times in one step, which is why it must be a while loop and not a single if. Infinity is turned into 0 only at the return, so no real length is confused with the missing case.</p>`,
      followups: [
        "How would you solve it if the array could contain negative numbers?",
        "How would you also return the start and end index of the shortest run?",
        "Could you solve it with prefix sums and binary search, and what would that cost?",
        "What changes if the sum must equal the target exactly instead of reaching it?",
        "How would you count the runs whose sum is at least the target?",
      ],
      slips: `<p>The most common slip is writing <code>if</code> instead of <code>while</code> for the shrinking step. After one drop the window may still be valid, and a single drop leaves shorter answers undiscovered. The second is recording the length after shrinking instead of before, which measures a window that no longer reaches the target.</p>
<p>Others: returning Infinity (or n + 1) when no window exists instead of 0; computing the length as right - left without the + 1; resetting left to 0 on every right; and using this approach when the array may contain negatives, where the window argument fails and prefix sums with a monotonic deque are needed. Some people also reach for sorting first, which destroys the contiguity the problem depends on.</p>`,
    },
    trace: {
      caption: "Target 7 on [2,3,1,2,4,3]: the window after each right step.",
      head: ["right", "Sum after adding", "Lengths recorded", "left at end", "Best so far"],
      rows: [
        ["0", "2", "none", "0", "none"],
        ["1", "5", "none", "0", "none"],
        ["2", "6", "none", "0", "none"],
        ["3", "8", "4", "1", "4"],
        ["4", "10", "4, 3", "3", "3"],
        ["5", "9", "3, 2", "5", "2"],
      ],
    },
    complexity: { time: "O(n)", space: "O(1) extra", brute: "O(n²)" },
    solution: {
      entry: "minSubArrayLen",
      code: `function minSubArrayLen(target, nums) {
  let left = 0;
  let windowSum = 0;
  let shortest = Infinity;
  for (let right = 0; right < nums.length; right++) {
    windowSum += nums[right];
    while (windowSum >= target) {
      shortest = Math.min(shortest, right - left + 1);
      windowSum -= nums[left];
      left++;
    }
  }
  return shortest === Infinity ? 0 : shortest;
}`,
      cases: [
        { args: [7, [2, 3, 1, 2, 4, 3]], expected: 2 },
        { args: [4, [1, 4, 4]], expected: 1 },
        { args: [11, [1, 1, 1, 1, 1, 1, 1, 1]], expected: 0 },
        { args: [5, []], expected: 0 },
        { args: [3, [3]], expected: 1 },
        { args: [15, [1, 2, 3, 4, 5]], expected: 5 },
        { args: [6, [2, 2, 2, 2]], expected: 3 },
        { args: [5, [1, 2, 3, 4, 5]], expected: 1 },
        { args: [100, [50, 50]], expected: 2 },
        {
          args: [
            40,
            [
              8, 8, 5, 7, 6, 1, 9, 2, 1, 4, 4, 1, 4, 5, 6, 8, 5, 1, 8, 1, 6, 1, 4, 4, 1, 2, 3, 9, 6, 8, 4, 8, 1, 8, 5,
              4, 3, 8, 9, 3, 6, 2, 6, 5, 5, 1, 3, 3, 8, 3, 2, 6, 8, 8, 6, 8, 2, 8, 1, 6,
            ],
          ],
          expected: 6,
        },
      ],
    },
  },
  {
    id: "meesho-weighted-job-scheduling",
    company: "meesho",
    title: "Maximum Profit in Job Scheduling",
    prompt:
      "You get n jobs, each with a start time, a later end time and a profit; a set of jobs can be done only if no two overlap, though a job may start exactly when another ends. Return the largest total profit you can collect. For starts [1,2,3,3], ends [3,4,5,6] and profits [50,10,40,70] the answer is 120, from the first and last jobs. There can be 50,000 jobs and times up to a billion, so a table indexed by time is not an option.",
    level: "campus SDE-1",
    difficulty: "Hard",
    pattern: "Sort, DP and binary search",
    patternId: "dp",
    leetcode: { number: 1235, slug: "maximum-profit-in-job-scheduling" },
    evidence: "one",
    sources: [
      {
        label: "Meesho SDE-1 on-campus virtual (GeeksforGeeks)",
        url: "https://www.geeksforgeeks.org/?p=571093",
        kind: "candidate-report",
        year: 2025,
      },
    ],
    chapters: ["dsa-dp-1d", "dsa-binary-search"],
    answer: {
      ask: `<p>I would ask: can a job start at the exact moment another ends, and does that count as overlapping? Is start always smaller than end? Can profits be zero or negative? How many jobs are there, and how large can the times be, since that decides whether a table indexed by time is possible? Are the three arrays the same length? What do I return for no jobs?</p>
<p>I would assume touching jobs are allowed, start is less than end, profits are positive, the three arrays line up by index, and 0 is the answer for an empty list. I would return only the total profit, not the chosen jobs.</p>`,
      brute: `<p>The direct approach is include or exclude: for each job decide to take it or not, keep only the choices with no overlap, and return the best total. That is O(2^n), hopeless beyond about 25 jobs. A better version sorts by end time and fills a table where best[i] looks back through every earlier job to find the compatible ones, which is O(n²).</p>
<p>With 50,000 jobs, n² is over a billion comparisons. Another tempting table, indexed by clock time, needs one cell per time unit, and with times up to a billion that is too much memory and time. The slow part of the O(n²) version is the backward scan, and it can be avoided because the compatible jobs have a special shape.</p>`,
      insight: `<p>The pattern is <b>sort, dynamic programming and binary search</b>, a weighted version of interval scheduling. Sort the jobs by end time. Define best[i] as the largest profit using only the first i jobs in that order. For job i there are two choices. Skip it, and the value is best[i]. Take it, and the value is its profit plus the best result among earlier jobs that end no later than its start. So best[i + 1] is the larger of the two.</p>
<p>Why it is correct: any optimal schedule either leaves job i out, in which case it is an optimal schedule of the first i jobs, or includes it. If it includes job i, every other chosen job must finish by the start of job i, and the best way to choose those is the same problem on a smaller set. The two cases cover every schedule, so taking the larger is exact.</p>
<p>Why binary search works: the jobs are sorted by end time, so the jobs that end by a given moment always form a prefix of the list. The size of that prefix is found by binary search for the first job whose end is later than the start of job i. That turns the backward scan into O(log n). The sort is O(n log n) and so are the n searches, and best takes O(n) space. The plain earliest-finish greedy fails here because profits differ. I would say it as: sorted by end, either skip the job, or take it and add the best that fits before it.</p>`,
      walkthrough: `<p>Use starts [1,2,3,3], ends [3,4,5,6], profits [50,10,40,70]. The jobs are already sorted by end time, so the trace goes in input order. Job (1,3,50): no job ends by time 1, so j = 0, take gives 50 and skip gives 0, best 50. Job (2,4,10): j is still 0 because the first job ends at 3, after time 2; taking gives only 10, so best stays 50.</p>
<p>Job (3,5,40): the first job ends at 3, which is not later than the start 3, so it fits and j = 1. Take is best[1] + 40 = 90, beating skip at 50. Job (3,6,70): j = 1 again, take is 50 + 70 = 120 against skip at 90. The answer is 120. The trace table lists, for each job, j, the take value, the skip value and the new best.</p>`,
      edges: `<p>No jobs: the loop does not run and best[0] = 0 is returned. One job: its profit. Jobs that touch end to start: the comparison is end less than or equal to start, so they are allowed. All jobs overlapping: every take value is that job's profit plus zero, so the answer is the largest single profit.</p>
<p>Jobs with equal end times: the sort order among them does not matter, because a job that ends at the same time as job i also ends after job i starts, so it never falls inside the prefix we count. The binary search looks only at the first i jobs, never at later ones. The three input arrays are zipped into objects before sorting, so each profit stays with its job. Sums stay far below the largest safe integer in JavaScript at these sizes.</p>`,
      followups: [
        "How would you return the chosen jobs and not just the total profit?",
        "What changes if jobs that touch end to start are not allowed?",
        "How would you solve it if you could pick at most k jobs?",
        "Why does the plain earliest-finish greedy fail once profits differ?",
        "How would you handle jobs that arrive one at a time in order of end time?",
      ],
      slips: `<p>The classic mistake is sorting only the end times, or sorting the start times separately, so a profit ends up attached to the wrong job. Zip the three arrays first. Another is using strict less than when comparing an end with a start, which refuses jobs that merely touch. People also sort by start time and then run the same DP, which makes the compatible jobs no longer a prefix.</p>
<p>Others: running the binary search over the whole array instead of the first i jobs; returning best[i] without adding the profit of the job that was taken; a greedy by highest profit or earliest finish, both wrong with weights; and the O(n²) DP, which passes small tests and times out on large ones. Also remember that Array sort needs a numeric comparator, since the default sorts numbers as text.</p>`,
    },
    trace: {
      caption: "Starts [1,2,3,3], ends [3,4,5,6], profits [50,10,40,70], already sorted by end time.",
      head: ["Job", "(start,end,profit)", "j: jobs ending by start", "Take: best[j]+profit", "Skip", "New best"],
      rows: [
        ["1", "(1,3,50)", "0", "0 + 50 = 50", "0", "50"],
        ["2", "(2,4,10)", "0", "0 + 10 = 10", "50", "50"],
        ["3", "(3,5,40)", "1", "50 + 40 = 90", "50", "90"],
        ["4", "(3,6,70)", "1", "50 + 70 = 120", "90", "120"],
      ],
    },
    complexity: { time: "O(n log n)", space: "O(n)", brute: "O(2^n), or O(n²) with DP" },
    solution: {
      entry: "jobScheduling",
      code: `function jobScheduling(startTime, endTime, profit) {
  const jobs = startTime
    .map((start, i) => ({ start, end: endTime[i], gain: profit[i] }))
    .sort((a, b) => a.end - b.end);
  const best = new Array(jobs.length + 1).fill(0);
  for (let i = 0; i < jobs.length; i++) {
    let lo = 0;
    let hi = i;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (jobs[mid].end <= jobs[i].start) lo = mid + 1;
      else hi = mid;
    }
    best[i + 1] = Math.max(best[i], best[lo] + jobs[i].gain);
  }
  return best[jobs.length];
}`,
      cases: [
        {
          args: [
            [1, 2, 3, 3],
            [3, 4, 5, 6],
            [50, 10, 40, 70],
          ],
          expected: 120,
        },
        {
          args: [
            [1, 2, 3, 4, 6],
            [3, 5, 10, 6, 9],
            [20, 20, 100, 70, 60],
          ],
          expected: 150,
        },
        {
          args: [
            [1, 1, 1],
            [2, 3, 4],
            [5, 6, 4],
          ],
          expected: 6,
        },
        { args: [[], [], []], expected: 0 },
        { args: [[4], [9], [7]], expected: 7 },
        {
          args: [
            [1, 3],
            [3, 5],
            [10, 10],
          ],
          expected: 20,
        },
        {
          args: [
            [1, 1, 1, 1],
            [3, 3, 3, 3],
            [5, 5, 5, 5],
          ],
          expected: 5,
        },
        {
          args: [
            [1, 2, 3, 4],
            [10, 3, 4, 5],
            [40, 10, 10, 10],
          ],
          expected: 40,
        },
        {
          args: [
            [0, 5, 10, 15],
            [5, 10, 15, 20],
            [1, 2, 3, 4],
          ],
          expected: 10,
        },
        {
          args: [
            [
              158, 83, 43, 181, 149, 200, 33, 70, 142, 126, 88, 51, 66, 166, 1, 199, 34, 96, 185, 24, 177, 58, 142, 69,
              125, 179, 104, 128, 27, 184, 150, 116, 17, 73, 185, 170, 188, 64, 71, 23, 178, 155, 177, 16, 159, 73, 147,
              43, 44, 144, 183, 146, 137, 2, 98, 46, 55, 105, 79, 44,
            ],
            [
              162, 106, 65, 198, 150, 220, 37, 93, 148, 141, 99, 75, 69, 179, 9, 222, 51, 121, 186, 41, 194, 83, 161,
              87, 135, 202, 109, 140, 44, 191, 152, 132, 31, 79, 187, 173, 208, 73, 82, 47, 197, 169, 187, 18, 167, 90,
              162, 59, 45, 164, 205, 160, 157, 3, 99, 49, 77, 115, 97, 57,
            ],
            [
              57, 62, 29, 86, 90, 30, 20, 36, 28, 42, 28, 73, 68, 72, 50, 82, 47, 97, 96, 79, 36, 64, 21, 96, 43, 74,
              99, 50, 92, 79, 28, 43, 44, 54, 70, 65, 79, 39, 85, 24, 55, 97, 24, 14, 73, 28, 95, 49, 97, 42, 88, 89,
              90, 48, 55, 80, 12, 17, 3, 26,
            ],
          ],
          expected: 1187,
        },
      ],
    },
  },
  {
    id: "meesho-activity-selection",
    company: "meesho",
    title: "Activity Selection",
    prompt:
      "You are given the start and finish times of n unsorted activities, each starting before it finishes, and a single room, and you must pick as many activities as possible with no two overlapping; an activity may start at the moment another one finishes. Return how many you can pick. For starts [1,3,0,5,8,5] and finishes [2,4,6,7,9,10] the answer is 4, for example (1,2), (3,4), (5,7) and (8,9). The value of n can be several hundred thousand.",
    level: "campus SDE-1",
    difficulty: "Easy",
    pattern: "Greedy by earliest finish",
    patternId: "greedy",
    evidence: "one",
    sources: [
      {
        label: "Meesho SDE-1 on-campus virtual (GeeksforGeeks)",
        url: "https://www.geeksforgeeks.org/?p=571093",
        kind: "candidate-report",
        year: 2025,
      },
    ],
    chapters: ["dsa-greedy", "dsa-intervals"],
    answer: {
      ask: `<p>I would ask: if one activity ends at the moment another starts, can both be chosen? Is the start always before the finish? Are the arrays unsorted? Can there be duplicates? Do I return the count or the chosen activities? What is the answer for no activities? How many activities can there be?</p>
<p>I would assume touching is allowed, start is before finish, the input is unsorted and may contain duplicates, a count is enough, and the empty list gives 0. With n up to a few hundred thousand I want O(n log n).</p>`,
      brute: `<p>Try every subset of activities, check each for overlaps, and keep the largest valid subset. With n activities there are 2^n subsets and each check compares pairs, so it is exponential and stops being usable around 20 to 25 activities. A middle option is a DP over activities sorted by finish, where each activity looks back at all earlier ones for the best compatible chain. That is O(n²): fine for small n, but wasteful at 100,000 and more work than the problem needs.</p>
<p>The real issue is that these methods keep asking which combination is best, when one simple local rule can already settle each choice.</p>`,
      insight: `<p>The pattern is a <b>greedy choice by earliest finish time</b>. Sort the activities by finish time. Keep the end of the last activity you picked. Walk through the sorted list and pick an activity whenever it starts at or after that end. Count the picks.</p>
<p>Why it is correct, by an exchange argument. Let G be the activity with the earliest finish. Take any best schedule S. If S does not contain G, look at its first activity F. F finishes no earlier than G, so every other activity in S, which starts after F ends, also starts after G ends. Swap F for G: the schedule is still valid and still has the same size. So some best schedule begins with G. After choosing G, the rest of the problem is the same question on the activities that start at or after G ends, and the same argument applies again. Repeating it shows the greedy picks are never worse than any other schedule.</p>
<p>Other rules fail. Earliest start can choose one very long activity that blocks all the others. Shortest duration can choose a tiny activity in the middle that blocks two others that would have fit around it. Only finishing early guarantees the most room for what follows. The sort is O(n log n) and the scan is O(n). I would say it aloud as: always take the activity that frees the room soonest.</p>`,
      walkthrough: `<p>Use starts [1,3,0,5,8,5] and finishes [2,4,6,7,9,10]. Sorted by finish, the list is (1,2), (3,4), (0,6), (5,7), (8,9), (5,10). The room starts free. (1,2) starts after nothing, so take it; the last end is now 2. (3,4) starts at 3, at least 2, so take it; last end 4. (0,6) starts at 0, before 4, so skip it. (5,7) starts at 5, at least 4, take it; last end 7. (8,9) starts at 8, at least 7, take it; last end 9. (5,10) starts at 5, before 9, so skip it.</p>
<p>Four activities are taken, so the answer is 4. The trace table shows the last end, the test and the count at each step. The long activity (0,6) was skipped even though it looked attractive: it would have blocked both (3,4) and (5,7).</p>`,
      edges: `<p>Empty input: the loop does not run and the count is 0. One activity: it is taken, count 1. All activities overlapping: only the one with the earliest finish is taken. Activities that touch end to start are all accepted, because the test is start greater than or equal to the last end.</p>
<p>Duplicates: the second copy starts before the end of the first, so it is skipped. Activities with the same finish time: whichever comes first is taken and the others start before that finish, so they are skipped; the order among them does not change the count. The first comparison uses negative Infinity as the last end, so the first pick needs no special case. The caller's arrays are never changed, because the pairs are copied into new objects before the sort.</p>`,
      followups: [
        "How would you return the chosen activities themselves, not just the count?",
        "What changes if each activity has a profit, and why is greedy no longer enough?",
        "How would you find the minimum number of rooms needed to hold all the activities?",
        "How would you show that picking the shortest activity first can be wrong?",
        "How would the code change if activities that touch were not allowed?",
      ],
      slips: `<p>The main slip is a wrong greedy rule: sorting by start time, by length, or by the number of conflicts. Each has a small counterexample, and an interviewer will ask for one. The next is sorting only the finish array and leaving the starts in place, so the pairs break. Zip them first.</p>
<p>Others: using strict greater than when comparing a start with the last end, which loses touching activities when the problem allows them; sorting with the default comparator, which orders numbers as text and puts 10 before 2; updating the last end when an activity is skipped; and forgetting that the answer is a count, not the list. If the problem forbids touching, the comparison must become strictly greater, so read the statement carefully.</p>`,
    },
    trace: {
      caption: "Starts [1,3,0,5,8,5], finishes [2,4,6,7,9,10], scanned in order of finish time.",
      head: ["Activity (start,end)", "Last end kept", "Starts at or after it?", "Decision", "Count"],
      rows: [
        ["(1,2)", "none", "yes", "take", "1"],
        ["(3,4)", "2", "yes (3 >= 2)", "take", "2"],
        ["(0,6)", "4", "no (0 < 4)", "skip", "2"],
        ["(5,7)", "4", "yes (5 >= 4)", "take", "3"],
        ["(8,9)", "7", "yes (8 >= 7)", "take", "4"],
        ["(5,10)", "9", "no (5 < 9)", "skip", "4"],
      ],
    },
    complexity: { time: "O(n log n)", space: "O(n)", brute: "O(n × 2^n)" },
    solution: {
      entry: "maxActivities",
      code: `function maxActivities(start, finish) {
  const activities = start
    .map((begin, i) => ({ begin, end: finish[i] }))
    .sort((a, b) => a.end - b.end);
  let lastEnd = -Infinity;
  let chosen = 0;
  for (const activity of activities) {
    if (activity.begin >= lastEnd) {
      chosen++;
      lastEnd = activity.end;
    }
  }
  return chosen;
}`,
      cases: [
        {
          args: [
            [1, 3, 0, 5, 8, 5],
            [2, 4, 6, 7, 9, 10],
          ],
          expected: 4,
        },
        { args: [[], []], expected: 0 },
        { args: [[2], [5]], expected: 1 },
        {
          args: [
            [1, 1, 1],
            [4, 4, 4],
          ],
          expected: 1,
        },
        {
          args: [
            [1, 2, 3],
            [2, 3, 4],
          ],
          expected: 3,
        },
        {
          args: [
            [0, 1, 2, 3],
            [10, 3, 4, 5],
          ],
          expected: 2,
        },
        {
          args: [
            [1, 2, 3, 4],
            [10, 11, 12, 13],
          ],
          expected: 1,
        },
        {
          args: [
            [5, 1, 3, 8, 5, 0],
            [9, 2, 4, 9, 7, 6],
          ],
          expected: 4,
        },
        {
          args: [
            [1, 2, 4, 6, 8],
            [3, 5, 7, 9, 10],
          ],
          expected: 3,
        },
        {
          args: [
            [
              150, 163, 76, 179, 94, 88, 265, 180, 161, 31, 10, 23, 17, 3, 204, 175, 51, 269, 140, 7, 152, 218, 14, 253,
              170, 202, 224, 156, 160, 4, 142, 220, 3, 25, 129, 256, 204, 20, 51, 33, 275, 21, 89, 142, 127, 253, 286,
              165, 43, 141, 201, 75, 294, 87, 62, 114, 58, 257, 52, 137, 281, 277, 58, 232, 252, 68, 135, 206, 178, 174,
              279, 90, 11, 37, 199, 184, 6, 53, 35, 123,
            ],
            [
              164, 167, 88, 189, 100, 100, 269, 199, 173, 42, 29, 29, 35, 10, 206, 191, 65, 272, 152, 19, 169, 221, 21,
              257, 185, 216, 242, 157, 163, 7, 147, 221, 5, 37, 144, 266, 209, 35, 58, 49, 281, 22, 107, 146, 140, 262,
              294, 171, 52, 142, 219, 87, 302, 102, 74, 128, 72, 262, 53, 144, 297, 284, 61, 252, 265, 82, 150, 207,
              195, 183, 285, 94, 27, 53, 218, 192, 9, 57, 46, 130,
            ],
          ],
          expected: 33,
        },
      ],
    },
  },
  {
    id: "groww-minimum-cost-tickets",
    company: "groww",
    title: "Minimum Cost For Tickets",
    prompt:
      "You plan to travel on certain days of a year, given as a sorted list of day numbers from 1 to 365. A 1-day pass, a 7-day pass and a 30-day pass cost costs[0], costs[1] and costs[2], and a pass covers that many consecutive days starting on the day you buy it. Return the lowest total cost that covers every travel day. For days [1,4,6,7,8,20] and costs [2,7,15] the answer is 11.",
    level: "campus SDE (2020)",
    difficulty: "Medium",
    pattern: "1D dynamic programming",
    patternId: "dp",
    leetcode: { number: 983, slug: "minimum-cost-for-tickets" },
    evidence: "several",
    sources: [
      {
        label: "Groww SDE campus experience (GfG, Aug 2020)",
        url: "https://www.geeksforgeeks.org/interview-experiences/groww-software-development-engineer-interview-experience/",
        kind: "candidate-report",
        year: 2020,
      },
      {
        label: "CodeKerdos: Groww SDE-1 breakdown",
        url: "https://blog.codekerdos.in/groww-sde-1-interview-a-complete-breakdown/",
        kind: "prep-guide",
      },
    ],
    chapters: ["dsa-dp-1d"],
    answer: {
      ask: `<p>I would ask: are the days sorted and unique? Do the passes start on the day I buy them, and can I buy one on a day I do not travel? Is a 7-day pass always priced at most seven times a 1-day pass, or can prices be unusual, for example a 30-day pass cheaper than a 7-day one? Do I need the total only, or also which passes to buy? What do I return for no travel days? Is the year fixed at 365 days?</p>
<p>I would assume sorted unique days in 1 to 365, costs for 1, 7 and 30 days in that order, any prices, and a total as the answer, with 0 for no travel.</p>`,
      brute: `<p>Recursion: from the first uncovered travel day, try each of the three passes, jump to the first travel day it does not cover, and recurse. The answer is the cheapest of the three branches. Each call branches three ways and the depth can reach the number of travel days, so it takes O(3^k) time for k travel days. With 365 travel days that is astronomically large.</p>
<p>It is slow because the same tail of the calendar is solved again and again from different paths. For example, buying seven 1-day passes and buying one 7-day pass both lead to the same remaining days, and each time the whole subtree is recomputed.</p>`,
      insight: `<p>The pattern is <b>one-dimensional dynamic programming over the calendar</b>. Let cheapest[d] be the lowest cost to cover all travel days up to and including day d. Build it from day 1 up to the last travel day.</p>
<p>If day d is not a travel day, nothing new must be covered, so cheapest[d] equals cheapest[d - 1]. If it is a travel day, think of d as the last day to cover. Some pass must cover it, and that pass can be slid so that it ends on d, since days after d do not matter. A 1-day pass covers just d, so the rest costs cheapest[d - 1]. A 7-day pass ending on d covers d - 6 to d, so the rest costs cheapest[d - 7]. A 30-day pass covers d - 29 to d, so the rest costs cheapest[d - 30]. Take the cheapest of the three sums; when d - 7 or d - 30 drops below 0, use cheapest[0] = 0.</p>
<p>Why this is correct: the cheapest cover of the days up to d must use one of these three passes on d, and what remains is the same problem for earlier days, whose best answer is already stored. Using the stored value is safe because the cost of the earlier days does not depend on how the later part is paid for.</p>
<p>The table has at most 366 entries and each takes three comparisons, so the work is tiny. The lookup of whether a day is a travel day uses a Set, which is O(1) on average. I would say it as: the cost up to day d is the best of the three passes that could end today.</p>`,
      walkthrough: `<p>Use days [1,4,6,7,8,20] and costs [2,7,15]. Non-travel days copy the previous value, so the trace lists only travel days. Day 1: a 1-day pass gives cheapest[0] + 2 = 2, so the cost is 2. Day 4: cheapest[3] is still 2, so a 1-day pass gives 4; a 7-day pass gives 0 + 7 = 7; the best is 4. Day 6: cheapest[5] is 4, giving 6, which beats 7.</p>
<p>Day 7: a 1-day pass gives 6 + 2 = 8, but a 7-day pass reaching back to day 1 gives cheapest[0] + 7 = 7, so the best drops to 7. Day 8: a 1-day pass gives 9 and a 7-day pass gives cheapest[1] + 7 = 9; the best is 9. Day 20: days 9 to 19 are free, so cheapest[19] = 9, and a 1-day pass gives 11, beating 16 and 15. The answer is 11.</p>`,
      edges: `<p>No travel days: the last day is 0, the table has one cell holding 0, and the answer is 0. One travel day: the cheapest single option, which could even be a 7-day pass if that is priced below a 1-day one. A pass reaching back before day 1: Math.max(0, ...) clamps the index, so the code reads cheapest[0] = 0 instead of a negative index.</p>
<p>Unusual prices: a 7-day pass cheaper than a 1-day pass is handled because all three options are always compared. Travel on day 365: the table holds 366 cells, which is fine. Non-travel days copy the previous value so that a 30-day option can look back across a gap and still read a valid number. The input arrays are read, never modified.</p>`,
      followups: [
        "How would you also return which passes to buy and on which days?",
        "How would you solve it if the day numbers could be as large as a billion?",
        "How could you use the days array directly with a pointer and avoid the calendar table?",
        "What changes if passes of arbitrary lengths are given in an array?",
        "Why does a simple greedy rule fail on this problem?",
      ],
      slips: `<p>A common slip is indexing the table by position in the days array while using day arithmetic such as day - 7, which mixes two kinds of index. Pick one: calendar days, as here, or array positions with a pointer. Another is forgetting the clamp, which gives a negative index, an undefined cost and then NaN.</p>
<p>Others: a greedy rule such as buy the 7-day pass whenever the next seven days hold enough trips, which breaks on unusual prices; forgetting that on a travel day all three options must be compared, not only the 1-day pass; sizing the table to 365 regardless of the input, which is harmless but hides the real dependence on the last day; and writing the recursion without caching, which is correct on small tests and far too slow on a year of travel.</p>`,
    },
    trace: {
      caption: "Days [1,4,6,7,8,20], costs [2,7,15]: the three options on each travel day.",
      head: ["Day", "1-day option", "7-day option", "30-day option", "cheapest[day]"],
      rows: [
        ["1", "0 + 2 = 2", "0 + 7 = 7", "0 + 15 = 15", "2"],
        ["4", "2 + 2 = 4", "0 + 7 = 7", "0 + 15 = 15", "4"],
        ["6", "4 + 2 = 6", "0 + 7 = 7", "0 + 15 = 15", "6"],
        ["7", "6 + 2 = 8", "0 + 7 = 7", "0 + 15 = 15", "7"],
        ["8", "7 + 2 = 9", "2 + 7 = 9", "0 + 15 = 15", "9"],
        ["20", "9 + 2 = 11", "9 + 7 = 16", "0 + 15 = 15", "11"],
      ],
    },
    complexity: { time: "O(D), D at most 365", space: "O(D)", brute: "O(3^k) for k travel days" },
    solution: {
      entry: "minCostTickets",
      code: `function minCostTickets(days, costs) {
  const durations = [1, 7, 30];
  const travelDays = new Set(days);
  const lastDay = days.length === 0 ? 0 : days[days.length - 1];
  const cheapest = new Array(lastDay + 1).fill(0);
  for (let day = 1; day <= lastDay; day++) {
    if (!travelDays.has(day)) {
      cheapest[day] = cheapest[day - 1];
      continue;
    }
    let best = Infinity;
    for (let t = 0; t < durations.length; t++) {
      const before = Math.max(0, day - durations[t]);
      best = Math.min(best, cheapest[before] + costs[t]);
    }
    cheapest[day] = best;
  }
  return cheapest[lastDay];
}`,
      cases: [
        {
          args: [
            [1, 4, 6, 7, 8, 20],
            [2, 7, 15],
          ],
          expected: 11,
        },
        {
          args: [
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 30, 31],
            [2, 7, 15],
          ],
          expected: 17,
        },
        { args: [[], [2, 7, 15]], expected: 0 },
        { args: [[5], [3, 10, 20]], expected: 3 },
        {
          args: [
            [1, 2, 3, 4, 5, 6, 7],
            [5, 7, 40],
          ],
          expected: 7,
        },
        {
          args: [
            [1, 8, 15, 22, 29],
            [3, 7, 9],
          ],
          expected: 9,
        },
        {
          args: [
            [1, 30],
            [2, 7, 15],
          ],
          expected: 4,
        },
        {
          args: [
            [1, 31],
            [4, 9, 12],
          ],
          expected: 8,
        },
        {
          args: [
            [
              1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
              30,
            ],
            [2, 7, 15],
          ],
          expected: 15,
        },
        {
          args: [
            [
              6, 14, 17, 20, 25, 28, 30, 36, 41, 54, 67, 69, 70, 77, 84, 92, 100, 101, 102, 103, 118, 136, 138, 144,
              150, 154, 168, 169, 184, 186, 192, 197, 208, 209, 213, 214, 216, 217, 223, 226, 227, 229, 230, 233, 236,
              238, 242, 246, 260, 272, 274, 278, 286, 288, 294, 297, 311, 322, 326, 327, 332, 343, 345, 350, 351, 353,
              354, 355, 356, 364,
            ],
            [3, 11, 28],
          ],
          expected: 191,
        },
      ],
    },
  },
  {
    id: "groww-longest-valid-parentheses",
    company: "groww",
    title: "Longest Valid Parentheses",
    prompt:
      "Given a string made only of the characters ( and ), return the length of the longest contiguous substring that is a balanced run of parentheses, where every opening bracket is closed in the right order. For the string )()()) the answer is 4, from the substring ()(). The string can be 30,000 characters long, so checking every substring is too slow.",
    level: "internship",
    difficulty: "Hard",
    pattern: "Stack of indices",
    patternId: "stack",
    leetcode: { number: 32, slug: "longest-valid-parentheses" },
    evidence: "one",
    sources: [
      {
        label: "Groww internship experience (GfG)",
        url: "https://www.geeksforgeeks.org/interview-experiences/groww-internship-interview-experience-for-software-developer/",
        kind: "candidate-report",
      },
    ],
    chapters: ["dsa-stacks-queues", "dsa-dp-1d"],
    answer: {
      ask: `<p>I would ask: does the string contain only parentheses, or other characters I should ignore? Do I need a contiguous substring, or a subsequence? Does valid mean every opener is matched, in the right order? What do I return for an empty string, or when nothing matches? How long can the string be?</p>
<p>I would assume only ( and ), a contiguous substring, the standard balancing rules, and 0 when no pair exists. I will return the length, not the substring itself.</p>`,
      brute: `<p>Check every substring: for each start and each even length, scan it with a counter that goes up for an opener and down for a closer, rejecting it if the counter goes negative or does not end at zero. That is O(n²) substrings, each checked in O(n), so O(n³) in total. Stopping a start's scan as soon as the counter goes negative, and extending one character at a time, cuts it to O(n²).</p>
<p>With 30,000 characters, n² is nearly a billion steps, and n³ is hopeless. Both repeat work: the substring from i to j shares all but two of its characters with the one from i to j - 2, yet it is scanned again from scratch.</p>`,
      insight: `<p>The pattern is <b>a stack of indices</b>. Keep a stack whose bottom is the index of the last position that cannot belong to the run being built, starting with -1 as a floor. Scan the string. On an opener, push its index. On a closer, pop the stack. If the stack is now empty, this closer has no partner, so push its index as the new floor. Otherwise the run ending here has length i minus the index now on top of the stack, so update the best length.</p>
<p>Why it is correct: the stack holds the indices of unmatched openers, and its bottom is the most recent unmatched closer (or -1). After popping the partner of the current closer, the top of the stack is the nearest position to the left that is not matched. Everything between that position and i is made of matched pairs, so i minus top is the longest valid run that ends at i. Taking the maximum over every i gives the longest overall, since the longest run has to end somewhere.</p>
<p>Each index is pushed and popped at most once, so time is O(n), and the stack can hold up to n indices, so space is O(n). There is also an O(1) space solution with one left-to-right and one right-to-left counter pass, and a DP; I would mention both as alternatives. I would say it as: the stack remembers where the current good stretch begins, and a closer that empties it starts a new stretch.</p>`,
      walkthrough: `<p>Use )()()) with the stack starting as [-1]. Index 0 is a closer: pop -1, the stack is empty, so push 0 as the new floor. Index 1 is an opener: push it, stack [0, 1]. Index 2 is a closer: pop 1, the top is 0, length 2 - 0 = 2, best 2. Index 3 is an opener: stack [0, 3]. Index 4 is a closer: pop 3, the top is 0, length 4 - 0 = 4, best 4. The length reaches back across the earlier matched pair to the floor, which is how neighboring valid runs merge.</p>
<p>Index 5 is a closer: pop 0, the stack is empty, so push 5 as the floor, and the best stays 4. The answer is 4. The trace shows the stack after each step.</p>`,
      edges: `<p>Empty string: the loop never runs and the result is 0. Only openers, like (((: they pile up on the stack, no closer ever pops one, and the length is never updated, so 0. Only closers, like ))): each pop empties the stack and the closer becomes the floor, so 0 again. A single pair gives 2.</p>
<p>Neighboring runs, like ()(()): the floor stays at -1, so the whole string measures 6 in one piece. An unmatched opener in the middle, like the string ()(() with five characters, leaves the best at 2, because the opener at index 2 stays on the stack and blocks the merge. The -1 floor lets a run that starts at index 0 get its full length with no special case.</p>`,
      followups: [
        "How would you solve it in O(1) extra space with two counters and two passes?",
        "How would you write the dynamic programming version, and what is its recurrence?",
        "How would you return the substring itself, not just its length?",
        "What changes if the string also contains square and curly brackets?",
        "How would you count how many substrings reach the longest length?",
      ],
      slips: `<p>The usual slip is a missing -1 floor: without it, a valid run that starts at index 0 is measured as i instead of i + 1. A second is computing the length from the index you just popped, which measures only the innermost pair (and is off by one), not the merged run; use the index left on top after the pop. A third is forgetting to push the closer when the stack becomes empty, so later runs measure from the wrong floor.</p>
<p>Others: answering with the count of matched pairs times two, which counts pairs that are not adjacent (for the string ()(() it gives 4, but the answer is 2); using a stack of characters, which cannot report positions; and writing the DP with the wrong recurrence for two closers in a row.</p>`,
    },
    trace: {
      caption: "The string )()()) with the stack of indices, starting from [-1].",
      head: ["i", "char", "Action", "Stack after", "Best"],
      rows: [
        ["start", "-", "floor at -1", "[-1]", "0"],
        ["0", ")", "pop -1, empty, push 0", "[0]", "0"],
        ["1", "(", "push 1", "[0,1]", "0"],
        ["2", ")", "pop 1, 2 - 0 = 2", "[0]", "2"],
        ["3", "(", "push 3", "[0,3]", "2"],
        ["4", ")", "pop 3, 4 - 0 = 4", "[0]", "4"],
        ["5", ")", "pop 0, empty, push 5", "[5]", "4"],
      ],
    },
    complexity: { time: "O(n)", space: "O(n)", brute: "O(n³), or O(n²) with early exit" },
    solution: {
      entry: "longestValidParentheses",
      code: `function longestValidParentheses(s) {
  const stack = [-1];
  let longest = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "(") {
      stack.push(i);
      continue;
    }
    stack.pop();
    if (stack.length === 0) {
      stack.push(i);
    } else {
      longest = Math.max(longest, i - stack[stack.length - 1]);
    }
  }
  return longest;
}`,
      cases: [
        { args: [")()())"], expected: 4 },
        { args: ["(()"], expected: 2 },
        { args: [""], expected: 0 },
        { args: ["()"], expected: 2 },
        { args: ["((("], expected: 0 },
        { args: [")))"], expected: 0 },
        { args: ["()(())"], expected: 6 },
        { args: ["()(()"], expected: 2 },
        { args: ["(()())"], expected: 6 },
        { args: [")()(((())))("], expected: 10 },
        { args: [")())())(())()((()(()()))((())((())))(()(())(()))(()))())(((("], expected: 48 },
      ],
    },
  },
];
