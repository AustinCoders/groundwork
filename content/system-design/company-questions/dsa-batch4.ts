import type { DsaQuestion } from "./dsa-types";

export const questions: DsaQuestion[] = [
  {
    id: "uber-alien-dictionary",
    company: "uber",
    title: "Alien Dictionary",
    prompt:
      'A list of words is sorted according to the dictionary order of an unknown alphabet. Work out an ordering of the letters that is consistent with the list, or return an empty string if no ordering can exist. For ["wrt","wrf","er","ett","rftt"] the answer is "wertf". Words use lowercase letters, every distinct letter must appear in the answer, and when several orders are valid return the one that is smallest as a string.',
    level: "SDE II",
    difficulty: "Hard",
    pattern: "Topological sort on letters",
    patternId: "graph",
    leetcode: { number: 269, slug: "alien-dictionary" },
    evidence: "several",
    sources: [
      {
        label: "Jointaro: Uber SDE II Bengaluru interview experience, 2024",
        url: "https://www.jointaro.com/interviews/companies/uber/experiences/software-engineer-ii-bengaluru-january-1-2024-no-offer-neutral-929fe97e/",
        kind: "candidate-report",
        year: 2024,
      },
      {
        label: "Jointaro: Uber SDE intern page with question list",
        url: "https://www.jointaro.com/interviews/companies/uber/work-experiences/sde-intern-november-19-2024-5-a5fbb8da/",
        kind: "company-list",
        year: 2024,
      },
      {
        label: "Verve Copilot: Uber LeetCode interview questions",
        url: "https://www.vervecopilot.com/blog/uber-leetcode-interview-questions",
        kind: "company-list",
        year: 2026,
      },
    ],
    chapters: ["dsa-topological-patterns", "dsa-graph-problems"],
    answer: {
      ask: `<p>First I would check whether the list is guaranteed to come from a real alphabet or may contradict itself, and what to return if it does. What if a word is a prefix of the next one, or a longer word comes before its own prefix? Must letters that are never compared still appear in the answer? Can the list be empty or hold a single word? How large can it be?</p>
<p>I would assume lowercase letters, that every distinct letter must appear in the output, that a longer word placed before its own prefix is invalid, and that ties between equally valid letters are broken by picking the alphabetically smaller one, so the answer is unique.</p>`,
      brute: `<p>Try every permutation of the distinct letters and test each one against the list. With 26 letters there are 26! permutations, about 4 × 10^26, so this stops being possible at around ten letters. Testing one candidate means checking each neighbouring pair of words, which costs a pass over all C characters.</p>
<p>A slightly smarter version compares every pair of words, which is O(n² · L) work for n words of length at most L, but it collects nothing that neighbouring words do not already give you. The real problem is that guessing the order wastes everything the list tells you. We should build the order from the constraints instead of searching for it.</p>`,
      insight: `<p>The pattern is a <b>topological sort on letters</b>. Each pair of neighbouring words gives at most one fact. Scan both words until the first position where they differ: the letter in the first word must come before the letter in the second word. That is one directed edge. Later positions say nothing. If there is no differing position, the shorter word must come first; if the longer one comes first, the input is contradictory and the answer is empty.</p>
<p>Now any valid alphabet is exactly an ordering of the letters in which every edge points forward, which is a topological order of this graph. Kahn's algorithm builds one. Count each letter's incoming edges, output a letter with none, delete its outgoing edges, and release any letter whose count drops to zero. If the output holds every letter we are done. Letters that never reach zero are on a cycle, such as a before b and b before a, or sit behind one, so no order exists and we return an empty string.</p>
<p>Why only neighbouring pairs? Dictionary order is transitive, so other pairs add no new facts. The output is correct because a letter is released only after everything that must precede it has been written.</p>
<p>When several letters are free at once, any choice is valid, so to return one canonical answer I keep the free letters sorted and always take the smallest. With C total characters, V distinct letters and E edges, reading the words costs O(C), and the peeling touches each letter and edge once plus a sort of the free letters, at most 26 of them. Out loud: "build edges from the first difference, then peel off letters with no unmet prerequisites."</p>`,
      walkthrough: `<p>Take ["wrt","wrf","er","ett","rftt"]. Neighbouring pairs give four edges. wrt and wrf first differ at the last letter, so t comes before f. wrf and er differ at the first letter, so w before e. er and ett differ at the second letter, so r before t. ett and rftt differ at the first letter, so e before r. Only w has no incoming edge.</p>
<p>The trace shows the peeling. Take w, which frees e. Take e, which frees r. Take r, which frees t. Take t, which frees f. Take f. All five letters are out, so the answer is "wertf". Exactly one letter was free at every step, so the sorted tie-break never had to choose.</p>`,
      edges: `<ul>
  <li><b>Empty list or one word:</b> there are no edges, every letter is free, and the letters come out in sorted order. An empty list gives an empty string.</li>
  <li><b>Prefix trap:</b> ["abc","ab"] is contradictory. The scan runs off the shorter word without finding a difference, and because the first word is longer the code returns an empty string. ["ab","abc"] is fine and adds no edge.</li>
  <li><b>Cycle:</b> ["z","x","z"] gives z before x and x before z. Neither count reaches zero, the output is shorter than the letter count, and the function returns an empty string.</li>
  <li><b>Repeated facts:</b> two pairs may give the same edge. The set of successors stops the incoming count being raised twice.</li>
  <li><b>Letters never compared:</b> a letter that only appears after a shared prefix still gets a node and still appears in the output.</li>
</ul>`,
      followups: [
        "How would you find and report the actual cycle of letters instead of returning an empty string?",
        "How would you count the valid alphabets, or check that the order is unique?",
        "Can you solve it with a depth-first search, and what extra state do you need to detect a cycle?",
        "What changes if the symbols are arbitrary Unicode characters or whole tokens instead of lowercase letters?",
      ],
      slips: `<p>Common mistakes on this problem:</p>
<ul>
  <li>Comparing only the first letters of neighbouring words instead of finding the first <em>differing</em> letter.</li>
  <li>Adding an edge for every differing position instead of only the first, which invents false constraints.</li>
  <li>Missing the prefix case, so ["abc","ab"] wrongly succeeds.</li>
  <li>Building nodes only from edges, which drops letters that have no edges.</li>
  <li>Counting a repeated edge twice, so a letter never reaches zero and a valid input is rejected.</li>
  <li>Returning a partial order when a cycle exists.</li>
</ul>`,
    },
    trace: {
      caption: "Peeling letters for the edges t<f, w<e, r<t, e<r (Kahn's algorithm).",
      head: ["step", "take", "frees", "ready next", "output"],
      rows: [
        ["0", "start", "-", "w", "(empty)"],
        ["1", "w", "e", "e", "w"],
        ["2", "e", "r", "r", "we"],
        ["3", "r", "t", "t", "wer"],
        ["4", "t", "f", "f", "wert"],
        ["5", "f", "nothing", "none", "wertf"],
      ],
    },
    complexity: { time: "O(C + V² log V)", space: "O(V + E)", brute: "O(V! · C)" },
    solution: {
      entry: "alienOrder",
      code: `function alienOrder(words) {
  const after = new Map();
  const incoming = new Map();
  for (const word of words) {
    for (const letter of word) {
      if (!after.has(letter)) {
        after.set(letter, new Set());
        incoming.set(letter, 0);
      }
    }
  }
  for (let i = 0; i + 1 < words.length; i++) {
    const first = words[i];
    const second = words[i + 1];
    let k = 0;
    while (k < first.length && k < second.length && first[k] === second[k]) k++;
    if (k === Math.min(first.length, second.length)) {
      if (first.length > second.length) return "";
      continue;
    }
    if (!after.get(first[k]).has(second[k])) {
      after.get(first[k]).add(second[k]);
      incoming.set(second[k], incoming.get(second[k]) + 1);
    }
  }
  const ready = [...incoming.keys()].filter((letter) => incoming.get(letter) === 0);
  let order = "";
  while (ready.length > 0) {
    ready.sort();
    const letter = ready.shift();
    order += letter;
    for (const next of after.get(letter)) {
      incoming.set(next, incoming.get(next) - 1);
      if (incoming.get(next) === 0) ready.push(next);
    }
  }
  return order.length === incoming.size ? order : "";
}`,
      cases: [
        { args: [["wrt", "wrf", "er", "ett", "rftt"]], expected: "wertf" },
        { args: [[]], expected: "" },
        { args: [["a"]], expected: "a" },
        { args: [["z", "x"]], expected: "zx" },
        { args: [["z", "x", "z"]], expected: "" },
        { args: [["abc", "ab"]], expected: "" },
        { args: [["ba", "bb", "ca"]], expected: "abc" },
        { args: [["ba", "bb", "ca", "cb"]], expected: "abc" },
        { args: [["zy", "zx"]], expected: "yxz" },
        { args: [["abc"]], expected: "abc" },
        { args: [["a", "a"]], expected: "a" },
        { args: [["bd", "bc", "ad", "ac", "cd"]], expected: "badc" },
        {
          args: [
            [
              "a",
              "b",
              "bcf",
              "bha",
              "cab",
              "cgd",
              "d",
              "d",
              "d",
              "dc",
              "dca",
              "e",
              "e",
              "ff",
              "fi",
              "gbh",
              "ge",
              "h",
              "h",
              "ha",
              "i",
              "ib",
              "if",
              "igh",
            ],
          ],
          expected: "abcdefghi",
        },
      ],
    },
  },
  {
    id: "uber-number-of-islands-ii",
    company: "uber",
    title: "Number of Islands II",
    prompt:
      "A grid with m rows and n columns starts as all water. You are given a list of cells that turn into land one at a time. After each addition, report how many islands exist, where an island is a group of land cells joined up, down, left or right. On a 3 by 3 grid, adding (0,0), (0,1), (1,2), (2,1), (1,1) gives [1,1,2,3,1]. A cell can appear twice, and adding land that is already land changes nothing. Assume up to 100,000 additions on a grid with up to a million cells.",
    level: "level not stated",
    difficulty: "Hard",
    pattern: "Union-find with online updates",
    patternId: "union",
    leetcode: { number: 305, slug: "number-of-islands-ii" },
    evidence: "guide",
    sources: [
      {
        label: "Jointaro: Uber SDE intern page with question list",
        url: "https://www.jointaro.com/interviews/companies/uber/work-experiences/sde-intern-november-19-2024-5-a5fbb8da/",
        kind: "company-list",
        year: 2024,
      },
      {
        label: "AlgoMonster: Uber interview guide",
        url: "https://algo.monster/interview-guides/uber",
        kind: "company-list",
        year: 2026,
      },
      {
        label: "Verve Copilot: Uber LeetCode interview questions",
        url: "https://www.vervecopilot.com/blog/uber-leetcode-interview-questions",
        kind: "company-list",
        year: 2026,
      },
    ],
    chapters: ["dsa-union-find"],
    answer: {
      ask: `<p>I would ask: how big can the grid and the list of additions be? Can the same cell be added twice? Are diagonal cells connected (I assume not: four directions only)? Do I need the count after every addition, while the list streams in, or only at the end? Can land ever be removed? Are the positions always inside the grid?</p>
<p>I would assume the answer is wanted after every step, additions only, duplicates possible, positions valid, and a grid large enough that rebuilding it on every step is out of the question.</p>`,
      brute: `<p>After each addition, run a flood fill over the whole grid and count the groups. One count costs O(m · n), so k additions cost O(k · m · n). With a million cells and a hundred thousand additions that is about 10^11 cell visits, far beyond a few seconds.</p>
<p>Even a cleverer version that only floods from the new cell has to walk the entire island it joins, which can be huge, and it still has to find out whether two neighbours were already the same island. The slow part is that we keep rediscovering connectivity we already knew.</p>`,
      insight: `<p>The pattern is <b>union-find with online updates</b>. Land is only ever added, so islands can merge but never split. That is exactly what a disjoint-set structure does well: it supports "merge two groups" and "which group is this cell in" in nearly constant time.</p>
<p>Keep a running island count. When a cell becomes land and it was not land before, it starts as its own group, so add one. Then look at its four neighbours. For each neighbour that is already land, ask the structure to join the two groups. If they were different groups, the join really merged two islands, so subtract one. If they were already the same group, nothing changes. After the four neighbours, the count is the answer for this step.</p>
<p>The invariant is that the count equals the number of distinct group roots among all land cells. Each addition adds one group and each successful merge removes one, so the invariant survives every step. A cell that is already land must be skipped, otherwise we would add a phantom island.</p>
<p>Two standard tricks make find nearly O(1): path halving (while walking up, point each node at its grandparent) and union by size (hang the smaller group under the larger one). Together the amortised cost per operation is the inverse Ackermann function, which is at most 4 or 5 for any real input. I store the parent links in a Map keyed by row * columns + column, so memory grows with the number of added cells, not with the grid, and Map lookups cost O(1) on average. Out loud: "each land cell is a new island, and each successful union removes one."</p>`,
      walkthrough: `<p>On the 3 by 3 grid, add (0,0): no land neighbours, count 1. Add (0,1): its neighbour (0,0) is land and in a different group, so one merge cancels the new island and the count stays 1. Add (1,2): all of its neighbours are still water, so count 2. Add (2,1): again no land neighbours, count 3.</p>
<p>Add (1,1): the count first rises to 4. Its neighbours (0,1), (1,2) and (2,1) are land, and they belong to three different groups, so three successful merges bring the count to 1. The trace shows every step; the result is [1,1,2,3,1].</p>`,
      edges: `<ul>
  <li><b>Duplicate addition:</b> the cell is already in the parent map, so we skip all the work and repeat the current count.</li>
  <li><b>Empty list:</b> the loop never runs and the result is an empty array.</li>
  <li><b>Border cells:</b> the neighbour test checks the row and column against the grid size before it looks anything up.</li>
  <li><b>Two neighbours in one island:</b> the second join finds equal roots, returns false, and the count is not reduced twice. This happens when the new cell closes a loop.</li>
  <li><b>1 by 1 grid:</b> one cell, no neighbours, the count is 1 and stays 1 for repeats.</li>
  <li><b>Key size:</b> row * columns + column must stay below 2^53 so it is exact as a JavaScript number.</li>
</ul>`,
      followups: [
        "How would you support removing a land cell, and why does plain union-find fail there?",
        "If all the additions are known up front, how could you handle removals by processing them in reverse?",
        "Would you use an array or a Map for the parent links if the grid is a million by a million, and why?",
        "How would you also report the size of the largest island after each step?",
      ],
      slips: `<p>Common mistakes on this problem:</p>
<ul>
  <li>Not skipping a cell that is already land, which counts an extra island for a duplicate.</li>
  <li>Decreasing the count for every land neighbour instead of only for unions that really merged two groups.</li>
  <li>Calling find on a water cell, or never marking the new cell as its own parent.</li>
  <li>Encoding the cell as row * rows + column, which collides when the grid is not square.</li>
  <li>Skipping both path compression and union by size, so chains grow long and finds get slow.</li>
  <li>Recomputing the count by scanning all roots after each step instead of maintaining it.</li>
</ul>`,
    },
    trace: {
      caption: "Adding land one cell at a time on a 3 by 3 grid; the count rises by one, then falls per merge.",
      head: ["step", "add", "land neighbours", "merges", "islands"],
      rows: [
        ["1", "(0,0)", "none", "0", "1"],
        ["2", "(0,1)", "(0,0)", "1", "1"],
        ["3", "(1,2)", "none", "0", "2"],
        ["4", "(2,1)", "none", "0", "3"],
        ["5", "(1,1)", "(0,1) (1,2) (2,1)", "3", "4 - 3 = 1"],
      ],
    },
    complexity: { time: "O(k · α(k))", space: "O(k)", brute: "O(k · m · n)" },
    solution: {
      entry: "numIslands2",
      code: `function numIslands2(rows, cols, positions) {
  const parent = new Map();
  const size = new Map();
  const find = (cell) => {
    while (parent.get(cell) !== cell) {
      parent.set(cell, parent.get(parent.get(cell)));
      cell = parent.get(cell);
    }
    return cell;
  };
  const union = (a, b) => {
    let rootA = find(a);
    let rootB = find(b);
    if (rootA === rootB) return false;
    if (size.get(rootA) < size.get(rootB)) [rootA, rootB] = [rootB, rootA];
    parent.set(rootB, rootA);
    size.set(rootA, size.get(rootA) + size.get(rootB));
    return true;
  };
  const counts = [];
  let islands = 0;
  for (const [row, col] of positions) {
    const cell = row * cols + col;
    if (!parent.has(cell)) {
      parent.set(cell, cell);
      size.set(cell, 1);
      islands++;
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const r = row + dr;
        const c = col + dc;
        const inside = r >= 0 && r < rows && c >= 0 && c < cols;
        if (inside && parent.has(r * cols + c) && union(cell, r * cols + c)) islands--;
      }
    }
    counts.push(islands);
  }
  return counts;
}`,
      cases: [
        {
          args: [
            3,
            3,
            [
              [0, 0],
              [0, 1],
              [1, 2],
              [2, 1],
              [1, 1],
            ],
          ],
          expected: [1, 1, 2, 3, 1],
        },
        {
          args: [
            1,
            1,
            [
              [0, 0],
              [0, 0],
            ],
          ],
          expected: [1, 1],
        },
        { args: [3, 3, []], expected: [] },
        {
          args: [
            1,
            5,
            [
              [0, 0],
              [0, 4],
              [0, 2],
              [0, 1],
              [0, 3],
            ],
          ],
          expected: [1, 2, 3, 2, 1],
        },
        {
          args: [
            2,
            2,
            [
              [0, 0],
              [1, 1],
              [0, 1],
              [1, 0],
            ],
          ],
          expected: [1, 2, 1, 1],
        },
        {
          args: [
            3,
            3,
            [
              [0, 0],
              [2, 2],
              [0, 2],
              [2, 0],
              [1, 1],
              [0, 1],
              [1, 0],
              [1, 2],
              [2, 1],
            ],
          ],
          expected: [1, 2, 3, 4, 5, 3, 2, 1, 1],
        },
        {
          args: [
            3,
            3,
            [
              [0, 0],
              [0, 0],
              [0, 0],
            ],
          ],
          expected: [1, 1, 1],
        },
        {
          args: [
            7,
            7,
            [
              [2, 1],
              [1, 5],
              [1, 1],
              [4, 3],
              [6, 3],
              [6, 1],
              [1, 6],
              [1, 1],
              [2, 1],
              [2, 5],
              [0, 0],
              [3, 4],
              [1, 0],
              [1, 4],
              [0, 2],
              [0, 6],
              [1, 3],
              [6, 5],
              [3, 1],
              [3, 4],
              [3, 1],
              [3, 0],
              [3, 4],
              [1, 6],
              [1, 0],
              [1, 1],
              [4, 5],
              [4, 2],
              [6, 6],
              [2, 3],
            ],
          ],
          expected: [1, 2, 2, 3, 4, 5, 5, 5, 5, 5, 6, 7, 6, 6, 7, 7, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9],
        },
      ],
    },
  },
  {
    id: "uber-bus-routes",
    company: "uber",
    title: "Bus Routes",
    prompt:
      "Each bus follows a route, a list of stops it visits in a loop forever. You start at one stop and want to reach another using as few different buses as possible, changing buses at any stop shared by two routes. Return the minimum number of buses, or -1 if the target cannot be reached. For routes [[1,2,7],[3,6,7]], start 1 and target 6, the answer is 2: ride the first bus to stop 7, then the second bus to stop 6. Assume up to 500 routes, 100,000 stop entries in total, and stop numbers below one million.",
    level: "level not stated",
    difficulty: "Hard",
    pattern: "BFS over routes",
    patternId: "graph",
    leetcode: { number: 815, slug: "bus-routes" },
    evidence: "guide",
    sources: [
      {
        label: "Jointaro: Uber SDE intern page with question list",
        url: "https://www.jointaro.com/interviews/companies/uber/work-experiences/sde-intern-november-19-2024-5-a5fbb8da/",
        kind: "company-list",
        year: 2024,
      },
      {
        label: "Verve Copilot: Uber LeetCode interview questions",
        url: "https://www.vervecopilot.com/blog/uber-leetcode-interview-questions",
        kind: "company-list",
        year: 2026,
      },
    ],
    chapters: ["dsa-grid-bfs", "dsa-graph-problems"],
    answer: {
      ask: `<p>I would ask: what exactly is the cost, the number of buses or the number of stops passed? (Buses.) Can a stop appear twice in one route? Can the start equal the target, and what is the answer then? Can a route list be empty, or can the list of routes be empty? How large can a single route be compared with the number of routes?</p>
<p>I would assume the cost is the number of different buses boarded, that the start equal to the target needs zero buses, that unreachable means -1, and that stop numbers are sparse so I should key everything by stop number in a Map, not an array.</p>`,
      brute: `<p>The obvious model is a graph of stops, with an edge between any two stops that share a route, then a breadth-first search from the start. It has two problems. First, a route with L stops becomes a clique of about L² / 2 edges, so one route of 100,000 stops needs around five billion edges. Second, if you avoid that blow-up by linking only consecutive stops, an edge counts one hop, but riding past fifty stops on one bus costs one bus, so plain hop counting gives the wrong answer.</p>
<p>Rescanning every route for every stop is also slow: O(stops · total entries). We need a model where the cost of one unit equals one bus.</p>`,
      insight: `<p>The pattern is <b>BFS over routes</b>, not over stops. Make each route a node. Two routes are neighbours if they share a stop. Boarding a route costs one bus, and every stop on it is then free, so the answer is the shortest path measured in routes.</p>
<p>First build a Map from stop to the list of routes that pass through it. That lookup turns "which other buses can I change to here?" into one step. Layer 1 is the set of routes through the start stop. For each route in the current layer, walk its stops: if the stop is the target, the answer is the current layer number. Otherwise every route through that stop that we have not seen joins the next layer.</p>
<p>It is correct because BFS visits routes in order of the number of buses needed. The first time any route in layer d contains the target, no shorter option exists, since all routes in earlier layers were already scanned without finding it.</p>
<p>Two visited sets keep the work linear. A route is marked seen when it is queued, so it is never queued twice. A stop is marked seen the first time it is expanded, so its list of routes is walked only once. Then every stop entry is touched a bounded number of times and the total work is proportional to the number of stop entries, not to the number of routes squared. The start equal to the target is a special case worth saying first: zero buses, even if no route exists.</p>`,
      walkthrough: `<p>Build the index first: stop 7 appears on routes 0 and 1, every other stop on exactly one route. The start stop 1 is on route 0 only, so layer 1 is route 0 and the bus count is 1.</p>
<p>Walk route 0. Stops 1 and 2 only belong to route 0, which is already seen, so nothing is added. Stop 7 belongs to route 1, which is new, so route 1 joins the next layer. The bus count becomes 2 and we walk route 1: stop 3 adds nothing, and stop 6 is the target, so the function returns 2. The trace lists each scanned stop.</p>`,
      edges: `<ul>
  <li><b>Start equals target:</b> return 0 before building anything, even when the list of routes is empty.</li>
  <li><b>Start on no route:</b> the first layer is empty, the loop does not run, and the result is -1.</li>
  <li><b>Target on no route:</b> the BFS exhausts every reachable route without a match and returns -1.</li>
  <li><b>Target on a route through the start:</b> found in layer 1, answer 1.</li>
  <li><b>Repeated stop inside one route:</b> the seen sets absorb it, with no double work.</li>
  <li><b>Many routes sharing the same stops:</b> seen routes and seen stops stop the queue from growing past the number of routes.</li>
</ul>`,
      followups: [
        "How would you return the actual sequence of routes and transfer stops, not just the count?",
        "How would the answer change if each transfer also cost waiting time and each route had a different ticket price?",
        "Could a bidirectional search from the start and the target help, and when?",
        "What if stops are added to routes over time and you must answer many queries?",
      ],
      slips: `<p>Common mistakes:</p>
<ul>
  <li>Running BFS over stops and counting stops, which charges for every stop instead of every bus.</li>
  <li>Building stop-to-stop edges for each route, which blows up memory on a long route.</li>
  <li>Forgetting a seen set for routes, which loops forever or repeats work.</li>
  <li>Marking a route as seen when it is dequeued rather than when it is queued, which lets duplicates in.</li>
  <li>Returning 1 or -1 when the start equals the target instead of 0.</li>
  <li>Searching the routes with includes for each stop, which makes the index step quadratic.</li>
</ul>`,
    },
    trace: {
      caption: "Layer by layer from stop 1 to stop 6 with routes [[1,2,7],[3,6,7]].",
      head: ["step", "buses", "route", "stop scanned", "what happens"],
      rows: [
        ["0", "0", "-", "index built", "stop 7 is on routes 0, 1"],
        ["1", "1", "route 0", "1", "route 0 only, seen"],
        ["2", "1", "route 0", "2", "route 0 only, seen"],
        ["3", "1", "route 0", "7", "route 1 is new, queued"],
        ["4", "2", "route 1", "3", "nothing new"],
        ["5", "2", "route 1", "6", "target found: answer 2"],
      ],
    },
    complexity: { time: "O(S)", space: "O(S)", brute: "O(S²)" },
    solution: {
      entry: "numBusesToDestination",
      code: `function numBusesToDestination(routes, source, target) {
  if (source === target) return 0;
  const routesAtStop = new Map();
  routes.forEach((stops, route) => {
    for (const stop of stops) {
      if (!routesAtStop.has(stop)) routesAtStop.set(stop, []);
      routesAtStop.get(stop).push(route);
    }
  });
  const seenRoutes = new Set();
  const seenStops = new Set();
  let frontier = [];
  for (const route of routesAtStop.get(source) || []) {
    if (!seenRoutes.has(route)) {
      seenRoutes.add(route);
      frontier.push(route);
    }
  }
  for (let buses = 1; frontier.length > 0; buses++) {
    const nextFrontier = [];
    for (const route of frontier) {
      for (const stop of routes[route]) {
        if (stop === target) return buses;
        if (seenStops.has(stop)) continue;
        seenStops.add(stop);
        for (const other of routesAtStop.get(stop)) {
          if (!seenRoutes.has(other)) {
            seenRoutes.add(other);
            nextFrontier.push(other);
          }
        }
      }
    }
    frontier = nextFrontier;
  }
  return -1;
}`,
      cases: [
        {
          args: [
            [
              [1, 2, 7],
              [3, 6, 7],
            ],
            1,
            6,
          ],
          expected: 2,
        },
        { args: [[[7, 12], [4, 5, 15], [6], [15, 19], [9, 12, 13]], 15, 12], expected: -1 },
        { args: [[[1, 2, 7]], 5, 5], expected: 0 },
        { args: [[[1, 2, 7]], 1, 9], expected: -1 },
        {
          args: [
            [
              [1, 2],
              [2, 3],
              [3, 4],
              [4, 5],
            ],
            1,
            5,
          ],
          expected: 4,
        },
        {
          args: [
            [
              [1, 2, 3, 4, 5],
              [5, 6],
              [1, 6],
            ],
            1,
            6,
          ],
          expected: 1,
        },
        { args: [[], 1, 2], expected: -1 },
        {
          args: [
            [
              [0, 1, 6, 16, 22, 23],
              [14, 15, 24, 33],
              [1, 3, 8, 14, 18],
              [3, 5, 9, 12, 23, 28],
              [2, 7, 12, 34],
            ],
            0,
            23,
          ],
          expected: 1,
        },
        {
          args: [
            [
              [18, 22, 14],
              [1, 5, 20],
              [24, 8, 14],
              [21, 29, 5, 22],
              [10, 14, 22, 21],
              [14, 12, 2, 23],
              [3, 29],
              [25, 15],
              [6, 27],
              [29, 15],
              [18, 12],
              [5, 13],
            ],
            18,
            13,
          ],
          expected: 3,
        },
      ],
    },
  },
  {
    id: "atlassian-snake-game",
    company: "atlassian",
    title: "Design Snake Game",
    prompt:
      "Simulate the classic snake game on a board with a given width and height. The snake starts as one cell at the top-left corner, and a list of food cells, as [row, column], appears one at a time in the given order. Each move is U, D, L or R, and after a move you return the score, which is the number of foods eaten, or -1 once the game is over because the head left the board or hit the snake's own body. On a 3 wide, 2 high board with food [[1,2],[0,1]], the moves R, D, R, U, L, U return 0, 0, 1, 1, 2, -1. Each move should cost constant time.",
    level: "SDE-2 (P40)",
    difficulty: "Medium",
    pattern: "Deque plus a set",
    patternId: "design",
    leetcode: { number: 353, slug: "design-snake-game" },
    evidence: "several",
    sources: [
      {
        label: "Roundz: Atlassian SDE-2 (P40) interview experience",
        url: "https://roundz.substack.com/p/interview-experience-atlassian-sde2-p40",
        kind: "candidate-report",
        year: 2025,
      },
      {
        label: "PracHub: Atlassian coding questions list",
        url: "https://prachub.com/companies/atlassian/positions/software-engineer/categories/coding-and-algorithms",
        kind: "company-list",
        year: 2025,
      },
    ],
    chapters: ["dsa-design-simulation", "dsa-stacks-queues"],
    answer: {
      ask: `<p>I would ask: does the snake grow by one cell for each food? Does only the next food appear on the board, in list order? What happens when the head moves into the cell the tail is leaving this tick? What should further moves return after the game is over? Can the move list be very long, so that per-move cost matters? Is the food ever placed on the snake?</p>
<p>I would assume growth by one per food, one food visible at a time, the tail moving away before the collision check unless the snake is eating, the game staying over (-1) after the first loss, and food never placed on the body.</p>`,
      brute: `<p>Keep the snake as a plain array of cells. Each move appends the new head, and if no food was eaten removes the tail from the front. To test for a collision, scan the whole array for the new head.</p>
<p>That scan is O(length) per move, and removing from the front of an array can also cost O(length) in the worst case, so q moves with a snake of length n cost O(q · n). With a long snake and a hundred thousand moves that is about 10^10 operations. The scan is the part to eliminate, since all we ask is whether one cell is occupied.</p>`,
      insight: `<p>This is a <b>design and simulation</b> problem whose answer is a deque plus a set. The deque holds the snake in order from tail to head, so growing at the head and shrinking at the tail are both O(1). The set holds the same cells, so "is this cell occupied?" is O(1) on average. The two always describe the same cells, and that invariant is the whole design.</p>
<p>One move works like this. Compute the new head. If it is outside the board, the game is over. Otherwise check whether it equals the next food. If it does, the snake grows: keep the tail, add one to the score, and advance to the next food. If it does not, the tail leaves: remove it from the deque and the set. Only now test whether the new head is in the set, and if so the game is over. Otherwise add the head to both structures.</p>
<p>The order matters. Removing the tail <em>before</em> the collision test is what makes it legal to step into the cell the tail just left, because that cell is empty by the time the head arrives.</p>
<p>In my code a single Map plays both roles: it links every body cell to the next cell towards the head, and I keep a head cell and a tail cell. The Map keys are the set, and following the links from the tail gives the deque order. I encode a cell as row * width + column. Out loud: "tail leaves first unless we eat, then check the set."</p>`,
      walkthrough: `<p>On the 3 wide, 2 high board with food [[1,2],[0,1]], the snake starts at (0,0). R moves to (0,1): not food, the tail leaves, score 0. D moves to (1,1): score 0. R moves to (1,2), which is the first food, so the tail stays and the score is 1; the snake now covers (1,1) and (1,2).</p>
<p>U moves to (0,2) and the tail leaves: score 1. L moves to (0,1), the second food: the snake grows and the score is 2. The last U would go to row -1, which is off the board, so the function returns -1. The trace shows the body from tail to head after each move.</p>`,
      edges: `<ul>
  <li><b>Wall hit:</b> row or column outside the board returns -1 and marks the game over.</li>
  <li><b>Chasing the tail:</b> a snake filling a 2 by 2 board can step into the cell its tail is vacating, because the tail is removed first when no food is eaten.</li>
  <li><b>Food under the snake:</b> assumed never to happen. If it did, the eating branch keeps the tail, so the step would count as a collision.</li>
  <li><b>Length 1:</b> the tail and head are the same cell; removing the tail empties the structure and the new head becomes both ends.</li>
  <li><b>After game over:</b> a flag makes every later move return -1 without touching the state.</li>
  <li><b>No food left:</b> the next food is undefined, so no move eats and the snake keeps its length.</li>
</ul>`,
      followups: [
        "How would you place food at random on a free cell without ever choosing a cell under the snake?",
        "What changes if the board wraps around at the edges?",
        "How would you add a second snake, or let the player change speed?",
        "How would you keep memory bounded for millions of moves on a huge board?",
      ],
      slips: `<p>Where candidates go wrong:</p>
<ul>
  <li>Checking collision before removing the tail, so a snake that follows its own tail dies by mistake.</li>
  <li>Removing the tail on a move that eats food, so the snake never grows.</li>
  <li>Scanning an array for collisions, which turns each move into O(length).</li>
  <li>Forgetting to advance the food pointer after eating.</li>
  <li>Mixing up [row, column] with [x, y], or encoding cells as row * height + column.</li>
  <li>Not making game over permanent, so a later move returns a score again.</li>
</ul>`,
    },
    trace: {
      caption: "Moves on a 3 wide, 2 high board with food (1,2) then (0,1); body listed tail to head.",
      head: ["move", "new head", "food?", "body, tail to head", "result"],
      rows: [
        ["start", "(0,0)", "next is (1,2)", "(0,0)", "-"],
        ["R", "(0,1)", "no", "(0,1)", "0"],
        ["D", "(1,1)", "no", "(1,1)", "0"],
        ["R", "(1,2)", "yes, grow", "(1,1) (1,2)", "1"],
        ["U", "(0,2)", "no", "(1,2) (0,2)", "1"],
        ["L", "(0,1)", "yes, grow", "(1,2) (0,2) (0,1)", "2"],
        ["U", "(-1,1)", "wall", "game over", "-1"],
      ],
    },
    complexity: { time: "O(1) per move", space: "O(n + f)", brute: "O(n) per move" },
    solution: {
      entry: "run",
      code: `class SnakeGame {
  constructor(width, height, food) {
    Object.assign(this, { width, height, food, foodIndex: 0, score: 0, over: false, head: 0, tail: 0 });
    this.towardHead = new Map([[0, -1]]);
  }
  move(direction) {
    if (this.over) return -1;
    const [dr, dc] = { U: [-1, 0], D: [1, 0], L: [0, -1], R: [0, 1] }[direction];
    const row = Math.floor(this.head / this.width) + dr;
    const col = (this.head % this.width) + dc;
    if (row < 0 || row >= this.height || col < 0 || col >= this.width) return this.end();
    const cell = row * this.width + col;
    const next = this.food[this.foodIndex];
    if (next && next[0] === row && next[1] === col) {
      this.foodIndex++;
      this.score++;
    } else {
      const vacated = this.tail;
      this.tail = this.towardHead.get(vacated);
      this.towardHead.delete(vacated);
    }
    if (this.towardHead.has(cell)) return this.end();
    if (this.towardHead.size === 0) this.tail = cell;
    else this.towardHead.set(this.head, cell);
    this.towardHead.set(cell, -1);
    this.head = cell;
    return this.score;
  }
  end() {
    this.over = true;
    return -1;
  }
}

function run(ops, args) {
  let game = null;
  return ops.map((op, i) => {
    if (op === "SnakeGame") {
      game = new SnakeGame(args[i][0], args[i][1], args[i][2]);
      return null;
    }
    return game.move(args[i][0]);
  });
}`,
      cases: [
        {
          args: [
            ["SnakeGame", "move", "move", "move", "move", "move", "move"],
            [
              [
                3,
                2,
                [
                  [1, 2],
                  [0, 1],
                ],
              ],
              ["R"],
              ["D"],
              ["R"],
              ["U"],
              ["L"],
              ["U"],
            ],
          ],
          expected: [null, 0, 0, 1, 1, 2, -1],
        },
        {
          args: [
            ["SnakeGame", "move", "move", "move"],
            [[3, 3, []], ["R"], ["R"], ["R"]],
          ],
          expected: [null, 0, 0, -1],
        },
        {
          args: [
            ["SnakeGame", "move", "move", "move", "move", "move", "move", "move"],
            [
              [
                5,
                5,
                [
                  [0, 1],
                  [0, 2],
                  [0, 3],
                  [1, 3],
                ],
              ],
              ["R"],
              ["R"],
              ["R"],
              ["D"],
              ["L"],
              ["U"],
              ["R"],
            ],
          ],
          expected: [null, 1, 2, 3, 4, 4, -1, -1],
        },
        {
          args: [
            ["SnakeGame", "move", "move", "move", "move", "move"],
            [
              [
                2,
                2,
                [
                  [0, 1],
                  [1, 1],
                  [1, 0],
                ],
              ],
              ["R"],
              ["D"],
              ["L"],
              ["U"],
              ["R"],
            ],
          ],
          expected: [null, 1, 2, 3, 3, 3],
        },
        {
          args: [
            ["SnakeGame", "move", "move"],
            [[1, 1, []], ["U"], ["D"]],
          ],
          expected: [null, -1, -1],
        },
        {
          args: [
            ["SnakeGame", "move", "move", "move"],
            [[2, 1, []], ["R"], ["R"], ["L"]],
          ],
          expected: [null, 0, -1, -1],
        },
        { args: [["SnakeGame"], [[3, 3, []]]], expected: [null] },
        {
          args: [
            ["SnakeGame", "move", "move", "move", "move"],
            [[3, 3, [[0, 1]]], ["L"], ["R"], ["R"], ["D"]],
          ],
          expected: [null, -1, -1, -1, -1],
        },
        {
          args: [
            [
              "SnakeGame",
              "move",
              "move",
              "move",
              "move",
              "move",
              "move",
              "move",
              "move",
              "move",
              "move",
              "move",
              "move",
              "move",
              "move",
              "move",
              "move",
              "move",
              "move",
              "move",
            ],
            [
              [
                6,
                6,
                [
                  [0, 1],
                  [0, 2],
                  [0, 3],
                  [0, 4],
                  [0, 5],
                  [1, 5],
                  [2, 5],
                  [2, 4],
                ],
              ],
              ["R"],
              ["R"],
              ["R"],
              ["R"],
              ["R"],
              ["D"],
              ["D"],
              ["L"],
              ["L"],
              ["L"],
              ["U"],
              ["U"],
              ["R"],
              ["L"],
              ["D"],
              ["L"],
              ["D"],
              ["D"],
              ["R"],
            ],
          ],
          expected: [null, 1, 2, 3, 4, 5, 6, 7, 8, 8, 8, 8, 8, 8, -1, -1, -1, -1, -1, -1],
        },
      ],
    },
  },
  {
    id: "atlassian-longest-consecutive",
    company: "atlassian",
    title: "Longest Consecutive Sequence",
    prompt:
      "Given an unsorted array of integers, return the length of the longest run of consecutive integers, where the numbers may appear anywhere in the array and in any order. For [100,4,200,1,3,2] the answer is 4, because 1, 2, 3 and 4 are all present. Duplicates count once, negative numbers and zero are allowed, and the array may be empty. Aim for linear time on arrays of up to a million values.",
    level: "SDE (on-campus)",
    difficulty: "Medium",
    pattern: "Hash set, count from run starts",
    patternId: "hash",
    leetcode: { number: 128, slug: "longest-consecutive-sequence" },
    evidence: "one",
    sources: [
      {
        label: "GeeksforGeeks: Atlassian SDE on-campus interview experience",
        url: "https://www.geeksforgeeks.org/atlassian-interview-experience-for-sde-on-campus/",
        kind: "candidate-report",
      },
    ],
    chapters: ["dsa-hashing", "dsa-arrays-strings"],
    answer: {
      ask: `<p>I would ask: can there be duplicates, and should they count once? Can values be negative or very large? How big can the array be, and is extra memory fine? Is a run required to be contiguous in the array (no, only in value)? What should an empty array return? Is O(n log n) acceptable or do we need linear?</p>
<p>I would assume duplicates count once, any 32-bit values, an empty array gives 0, and the target is O(n) time using extra memory, since sorting is the easy fallback I can mention.</p>`,
      brute: `<p>The simplest approach is to sort the values and sweep once, resetting the run length at every gap. That is O(n log n) and perfectly correct, but it is not linear, and duplicates need care. In JavaScript the sort also needs a numeric comparator, because the default sort compares numbers as strings. Another common attempt is to put the values in a set and, for every value, count upward while the next number is present. That looks linear but is not: for the values 1 to n, the value 1 walks n steps, 2 walks n - 1 steps, and so on, which is O(n²).</p>
<p>The waste is that every member of a run re-counts the same run. Only the first member should do the counting.</p>`,
      insight: `<p>The pattern is a <b>hash set with counting from run starts</b>. Put every value in a set. A value is the start of a run exactly when its predecessor, value minus one, is not in the set. Loop over the values, skip any that are not starts, and for each start walk upward while the next number is present. The length of that walk plus one is the run length, and the best one wins.</p>
<p>Why is this linear? The inner walk only runs from run starts, and runs do not overlap, so each value is walked at most once as part of exactly one run. Every value also appears once in the outer loop. That is at most two visits per distinct value, and every set lookup costs O(1) on average in JavaScript.</p>
<p>Why is it correct? Every run has exactly one start, the smallest value in the run, and from it the walk finds the whole run. A value that is not a start belongs to a run that is counted from its own start, so skipping it loses nothing.</p>
<p>I loop over the set, not over the original array. With duplicates, iterating the array would visit a start several times and repeat its walk, which could bring back O(n²) for something like many copies of the first element of a long run. Out loud: "only start counting where the number before is missing."</p>`,
      walkthrough: `<p>The set is {100, 4, 200, 1, 3, 2}. Visit 100: 99 is absent, so it is a start; 101 is absent, so the run has length 1. Visit 4: 3 is present, so skip. Visit 200: a start with run length 1.</p>
<p>Visit 1: 0 is absent, so it is a start. Walk upward: 2, 3 and 4 are present and 5 is not, so the run has length 4 and the best becomes 4. Visit 3 and 2: both have predecessors present, so both are skipped. The answer is 4. The trace shows each value, whether it started a run, and the best so far.</p>`,
      edges: `<ul>
  <li><b>Empty array:</b> the loop never runs and the result is 0.</li>
  <li><b>Single value:</b> it is a start with run length 1.</li>
  <li><b>Duplicates:</b> the set stores each value once, so [5,5,5] gives 1 and [1,2,0,1] gives 3.</li>
  <li><b>Negatives and zero:</b> only value - 1 is tested, so [-3,-2,-1] is a run of 3 with no special case.</li>
  <li><b>Huge gaps:</b> values like 1,000,000,000 and 1 do not matter, since we never index an array by value.</li>
  <li><b>Already sorted or reversed:</b> order of the input has no effect on the result.</li>
</ul>`,
      followups: [
        "Can you solve it with union-find instead, merging each value with its neighbours, and what is the cost?",
        "How would you return the run itself, not just its length?",
        "What if the numbers arrive one at a time and you must report the longest run after each one?",
        "How would you handle it when the data does not fit in memory?",
      ],
      slips: `<p>Common mistakes:</p>
<ul>
  <li>Counting upward from every value, which is O(n²) on a long run.</li>
  <li>Sorting and comparing neighbours without deduplicating, so equal neighbours reset the run.</li>
  <li>Looping over the original array rather than the set, which repeats walks for duplicates.</li>
  <li>Using an array indexed by value, which fails on negatives and large gaps.</li>
  <li>Returning the last value of the run instead of its length, or being off by one.</li>
  <li>Testing value + 1 for the start check instead of value - 1.</li>
</ul>`,
    },
    trace: {
      caption: "Visiting the set {100, 4, 200, 1, 3, 2}; only run starts do any walking.",
      head: ["value", "value-1 in set?", "start?", "run length", "best"],
      rows: [
        ["100", "no (99)", "yes", "1", "1"],
        ["4", "yes (3)", "no, skip", "-", "1"],
        ["200", "no (199)", "yes", "1", "1"],
        ["1", "no (0)", "yes", "4 (1,2,3,4)", "4"],
        ["3", "yes (2)", "no, skip", "-", "4"],
        ["2", "yes (1)", "no, skip", "-", "4"],
      ],
    },
    complexity: { time: "O(n) average", space: "O(n)", brute: "O(n²) counting, O(n log n) sorting" },
    solution: {
      entry: "longestConsecutive",
      code: `function longestConsecutive(nums) {
  const present = new Set(nums);
  let longest = 0;
  for (const value of present) {
    const isRunStart = !present.has(value - 1);
    if (!isRunStart) continue;
    let end = value;
    while (present.has(end + 1)) end++;
    longest = Math.max(longest, end - value + 1);
  }
  return longest;
}`,
      cases: [
        { args: [[100, 4, 200, 1, 3, 2]], expected: 4 },
        { args: [[]], expected: 0 },
        { args: [[0]], expected: 1 },
        { args: [[1, 2, 0, 1]], expected: 3 },
        { args: [[9, 1, 4, 7, 3, -1, 0, 5, 8, -1, 6]], expected: 7 },
        { args: [[5, 5, 5]], expected: 1 },
        { args: [[-3, -2, -1, 5, 6, 7, 8, 20]], expected: 4 },
        { args: [[1000000000, 999999999, 999999998, 1]], expected: 3 },
        {
          args: [
            [
              6, 0, 11, 1, 13, 27, 14, 31, 5, 39, 10, 3, 20, 12, 7, 28, 29, 19, 2, 24, 8, 9, 30, 18, 32, 16, 26, 35, 4,
              21, 15, 33, 22, 36, 23, 37, 34, 25, 38, 3, 3, 25,
            ],
          ],
          expected: 22,
        },
      ],
    },
  },
  {
    id: "atlassian-word-in-grid",
    company: "atlassian",
    title: "Word Search, right and down moves only",
    prompt:
      'You get a grid of letters, given as an array of equal-length strings, and a target word. Decide whether the word can be spelled by a path that starts at any cell and then repeatedly steps one cell right or one cell down, reading one letter per cell. For the grid ["ooo","ozz","eze"] and the word "ooze" the answer is true: start at the top middle o, step right to o, then down to z, then down to e. Moves left and up are not allowed. Assume a grid up to 100 by 100 and a word up to 100 letters.',
    level: "SDE-2",
    difficulty: "Medium",
    pattern: "Grid DFS with memo",
    patternId: "graph",
    evidence: "several",
    sources: [
      {
        label: "FrontendGeek: Atlassian SDE-2 backend interview experience",
        url: "https://www.frontendgeek.com/interview-experience/atlassian-interview-experience-sde2-backend---7ae6b5f1-0166-44ea-abe1-b5cd8f910423",
        kind: "candidate-report",
        year: 2025,
      },
      {
        label: "PracHub: Atlassian coding questions list",
        url: "https://prachub.com/companies/atlassian/positions/software-engineer/categories/coding-and-algorithms",
        kind: "company-list",
        year: 2025,
      },
    ],
    chapters: ["dsa-backtracking", "dsa-matrix-problems"],
    answer: {
      ask: `<p>I would ask: may the path start at any cell, or only the top-left? Is the word guaranteed to be non-empty? Are rows all the same length? Is matching case sensitive? Do I return only true or false, or the path as well? Does the word have to use each cell at most once (it always will here, since moves only go right or down)?</p>
<p>I would assume any starting cell, a non-empty word (false for an empty word or empty grid), exact letter matches, and a boolean result. I would also confirm the key difference from the classic puzzle: there you may move in four directions, so a path can wind back near itself.</p>`,
      brute: `<p>Start a search from every cell, and at each step try both moves, right and down, without remembering anything. Every step branches in two, so a long run of matching letters costs up to 2^L paths. On a grid of all a's with the word "aaaa...ab", every path matches until the last letter and fails there, so the work is exponential in the word length. With L near 100 that cannot finish.</p>
<p>Many of those paths arrive at the same cell needing the same next letter, and the search repeats that sub-problem again and again. Remembering the failures should cut this down.</p>`,
      insight: `<p>The pattern is <b>grid DFS with memoisation</b>. Define search(row, col, index) as: can the word be finished if cell (row, col) is used for letter number index? It is true if that cell holds the letter, and either the word ends here or one of the two moves, right or down, continues the match.</p>
<p>The classic Word Search lets you walk in four directions without reusing a cell. That needs a visited mark and backtracking, because a path can turn back near itself, and there is no safe way to memoise since the visited set changes the answer. Here the situation is simpler. Every step raises row plus column by one, so a path can never return to a cell, and there is no visited set at all. The answer to search(row, col, index) depends only on those three numbers, not on how we got there. That is what makes memoisation valid.</p>
<p>Because the first success ends everything, I only store failures: the set of dead states (row, col, index). Before exploring a state, check the set; after both moves fail, add the state. The index is part of the key because one cell can serve different letter positions from different starting cells.</p>
<p>There are at most rows × cols × length states, each doing constant work apart from its two recursive calls, which are either a memo hit or a quick mismatch. That gives O(m · n · L) instead of 2^L. A path covers at most rows + cols - 1 cells, so a longer word is rejected at once. Out loud: "try right and down; remember every (cell, letter) pair that has already failed."</p>`,
      walkthrough: `<p>Take the grid ["ooo","ozz","eze"] and the word "ooze", trying starts in row-major order. Start (0,0) matches o, then (0,1) matches o. From (0,1) the right move reaches (0,2), which holds o where z is needed, and the down move reaches (1,1) z, which matches. From (1,1) both moves need an e and find z, so (1,1) is recorded as dead for letter 2.</p>
<p>Back at (0,0), the down move reaches (1,0) o, whose right move hits the dead (1,1) state and is skipped, and whose down move finds e instead of z. So the start (0,0) fails. Start (0,1) matches o, (0,2) matches o, then down (1,2) is z and down (2,2) is e: the word is complete, so the answer is true. The trace lists these steps.</p>`,
      edges: `<ul>
  <li><b>Empty grid or empty word:</b> return false before searching.</li>
  <li><b>Word longer than a path can be:</b> more than rows + cols - 1 letters is rejected immediately.</li>
  <li><b>One-letter word:</b> true if any cell holds that letter.</li>
  <li><b>Wrong direction:</b> "tac" in ["cat"] is false, because spelling it needs left moves that the classic puzzle would allow.</li>
  <li><b>Off the grid:</b> the bounds check runs before the grid is indexed, so a move past the last row or column just fails.</li>
  <li><b>Single row or column:</b> the problem reduces to a substring search.</li>
  <li><b>Repeating letters:</b> grids of a's are the case where the memo matters.</li>
</ul>`,
      followups: [
        "How would you solve it bottom-up with a table instead of recursion, and what is the space?",
        "How would the solution change if diagonal-down-right moves were also allowed?",
        "How would you return the path itself, not just true or false?",
        "What if the word may be several thousand letters long, and recursion depth becomes a concern?",
      ],
      slips: `<p>Common mistakes on this variant:</p>
<ul>
  <li>Copying the classic four-direction solution, with a visited mark and left and up moves, which accepts paths this problem forbids.</li>
  <li>Searching only from the top-left cell instead of from every cell.</li>
  <li>Indexing the grid before checking the bounds.</li>
  <li>Leaving the letter index out of the memo key, so a cell that failed for one letter is wrongly dead for another.</li>
  <li>Recording a dead end before both moves have been tried.</li>
  <li>Off-by-one on the last letter: the word is complete when the matched index is length - 1.</li>
</ul>`,
    },
    trace: {
      caption: "DFS on [ooo, ozz, eze] for ooze; k is the letter index and a dead state is cached.",
      head: ["step", "cell, k", "need / have", "result"],
      rows: [
        ["1", "(0,0) k=0", "o / o", "match, go right"],
        ["2", "(0,1) k=1", "o / o", "match, go right"],
        ["3", "(0,2) k=2", "z / o", "mismatch"],
        ["4", "(1,1) k=2", "z / z", "next two fail: dead"],
        ["5", "(1,0) k=1", "o / o", "match, go right"],
        ["6", "(1,1) k=2", "dead already", "memo hit, skip"],
        ["7", "(2,0) k=2", "z / e", "mismatch; start dead"],
        ["8", "(0,1) k=0", "o / o", "new start, go right"],
        ["9", "(0,2) k=1", "o / o", "right is off, go down"],
        ["10", "(1,2),(2,2)", "z / z, e / e", "word complete: true"],
      ],
    },
    complexity: { time: "O(m · n · L)", space: "O(m · n · L)", brute: "O(m · n · 2^L)" },
    solution: {
      entry: "wordPathExists",
      code: `function wordPathExists(grid, word) {
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;
  if (rows === 0 || cols === 0 || word.length === 0) return false;
  if (word.length > rows + cols - 1) return false;
  const deadEnds = new Set();
  const search = (row, col, index) => {
    if (row >= rows || col >= cols || grid[row][col] !== word[index]) return false;
    if (index === word.length - 1) return true;
    const key = (row * cols + col) * word.length + index;
    if (deadEnds.has(key)) return false;
    if (search(row, col + 1, index + 1) || search(row + 1, col, index + 1)) return true;
    deadEnds.add(key);
    return false;
  };
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (search(row, col, 0)) return true;
    }
  }
  return false;
}`,
      cases: [
        { args: [["ooo", "ozz", "eze"], "ooze"], expected: true },
        { args: [["ooo", "ozz", "eze"], "ozz"], expected: true },
        { args: [["ooo", "ozz", "eze"], "eoz"], expected: false },
        { args: [["cat"], "cat"], expected: true },
        { args: [["c", "a", "t"], "cat"], expected: true },
        { args: [["cat"], "tac"], expected: false },
        { args: [["a"], "a"], expected: true },
        { args: [["a"], "aa"], expected: false },
        { args: [[], "a"], expected: false },
        { args: [["ab", "ba"], "ba"], expected: true },
        { args: [["ab", "dc"], "abcd"], expected: false },
        { args: [["aaa", "aaa", "aaa"], "aaaaaa"], expected: false },
        { args: [["aaa", "aaa", "aaa"], "aaaaa"], expected: true },
        {
          args: [["baa", "abb", "bbb", "bbb", "bbb", "baa", "bbb", "bbb", "bba", "aaa", "abb", "bab"], "bbbbb"],
          expected: true,
        },
        {
          args: [["baa", "abb", "bbb", "bbb", "bbb", "baa", "bbb", "bbb", "bba", "aaa", "abb", "bab"], "abab"],
          expected: true,
        },
        {
          args: [["baa", "abb", "bbb", "bbb", "bbb", "baa", "bbb", "bbb", "bba", "aaa", "abb", "bab"], "aaaaaaaa"],
          expected: false,
        },
      ],
    },
  },
];
