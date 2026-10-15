import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "gb-nearest-gate",
      chapter: "dsa-grid-bfs",
      level: "intermediate",
      skill: "recognise",
      pattern: "grid-bfs",
      section: "multi-source-bfs-start-from-every-source-at-once",
      placement: true,
      kind: "single",
      prompt:
        "<p>A grid of rooms contains some gates, some walls and some empty rooms. For every empty room you must report the number of steps to its nearest gate. There can be thousands of gates. Which plan takes time proportional to the number of cells, no matter how many gates there are?</p>",
      choices: [
        {
          id: "a",
          text: "Run a separate BFS from each gate and keep the smaller number for every room.",
          why: "Each BFS can touch the whole grid, so with G gates the work grows like G times the number of cells. It gives correct answers, but it is the slow plan the question rules out.",
        },
        {
          id: "b",
          text: "Put every gate in the queue at distance 0 before the loop starts, then run one BFS.",
          why: "The queue still holds one distance followed by the next, so every room is first reached by its nearest gate. One pass over the grid answers all the rooms.",
        },
        {
          id: "c",
          text: "Run a DFS from every empty room until it meets a gate, and report the depth of the path it found.",
          why: "A DFS stops at the first gate it finds, which is not necessarily the nearest, so the depth it reports can be too large. Repeating it for every room is also expensive.",
        },
        {
          id: "d",
          text: "Sort the gates by row, then binary search for the gate closest to each room.",
          why: "Walls can block a straight line between a room and a gate, so the number of steps is not the difference in coordinates. Sorting by row says nothing about the walking distance.",
        },
      ],
      answer: "b",
    },
    {
      id: "gb-surrounded-plan",
      chapter: "dsa-grid-bfs",
      level: "intermediate",
      skill: "recognise",
      pattern: "grid-bfs",
      section: "reverse-from-the-borders",
      placement: true,
      kind: "single",
      prompt:
        '<p>A board holds <code>"X"</code> and <code>"O"</code>. You must flip every group of connected <code>"O"</code> cells that is completely surrounded by <code>"X"</code>. A group touching the edge of the board stays. Which plan runs in time proportional to the number of cells?</p>',
      choices: [
        {
          id: "a",
          text: 'Search from every <code>"O"</code> on the border and mark what it reaches as safe, then flip each unmarked <code>"O"</code>.',
          why: "The groups that survive are exactly the ones connected to a border cell, so one search from the border finds all of them. Everything not marked is enclosed. Each cell is visited a constant number of times.",
        },
        {
          id: "b",
          text: 'Start a search from every <code>"O"</code> cell and flip it if that search never reaches the edge of the board.',
          why: "A search from each cell can cover the whole board, so the total is the number of cells squared in the worst case. The results are right, but the cost is too high.",
        },
        {
          id: "c",
          text: "Run one BFS from the top-left cell and flip everything it does not reach.",
          why: "One search reaches one connected group at most. Enclosed groups elsewhere would be left alone or flipped for the wrong reason.",
        },
        {
          id: "d",
          text: 'Flip every cell that has an <code>"X"</code> on all four sides.',
          why: "A group of two or more cells has no cell with four <code>X</code> neighbours inside it, so this test misses every enclosed group of two or more cells.",
        },
      ],
      answer: "a",
    },
    {
      id: "gb-lock-graph",
      chapter: "dsa-grid-bfs",
      level: "intermediate",
      skill: "recognise",
      pattern: "grid-bfs",
      section: "state-space-bfs-the-graph-lives-in-your-head",
      placement: true,
      kind: "single",
      prompt:
        '<p>A lock has four wheels with the digits 0 to 9, starting at <code>"0000"</code>. One move turns one wheel one step in either direction, and some combinations are forbidden. You need the fewest moves to reach a given combination. How do you set this up as a graph search?</p>',
      choices: [
        {
          id: "a",
          text: "Use a grid with four rows and ten columns and run BFS from the top-left cell.",
          why: "The wheels are not positions on a board. A combination is the whole string of four digits, and moves change one digit while the others stay.",
        },
        {
          id: "b",
          text: 'Use DFS from <code>"0000"</code> and return the length of the first path that reaches the target.',
          why: "DFS returns whichever path its neighbour order finds first, which is rarely the shortest. Fewest moves needs the layer-by-layer order of BFS.",
        },
        {
          id: "c",
          text: "Treat each four-digit string as a state, with the eight strings one wheel-turn away as its neighbours, and run BFS.",
          why: "There are 10,000 states and each has eight neighbours, so the graph is small. Every move costs one, so BFS counts moves exactly. Forbidden combinations are simply never offered as neighbours.",
        },
        {
          id: "d",
          text: "Use Dijkstra with the digit values as edge weights.",
          why: "Every move is one move, whatever digit it lands on, so the edges all have the same cost. BFS does the same job with a plain queue.",
        },
      ],
      answer: "c",
    },
    {
      id: "gb-mark-on-pop",
      chapter: "dsa-grid-bfs",
      level: "intermediate",
      skill: "edge-case",
      pattern: "grid-bfs",
      section: "visited-on-enqueue-not-on-dequeue-what-goes-wrong",
      kind: "single",
      prompt:
        "<p>A BFS on an open grid, started at a corner, marks a cell as seen only when it is popped, and it has no check for a cell that was already seen. It pushes every unseen neighbour of the cell it pops. What happens as the grid grows?</p>",
      choices: [
        {
          id: "a",
          text: "A cell is queued once for each shortest path that reaches it, so the number of queue entries explodes.",
          why: "Every copy of a cell is expanded and queues its neighbours again, because none of them is marked yet. The copies of a cell add up to the number of shortest paths to it. On a 10 by 10 grid that is 184,755 entries for 100 cells.",
        },
        {
          id: "b",
          text: "The queue holds the same number of entries as when cells are marked on push.",
          why: "Marking on push claims a cell the moment it is queued, giving one entry per cell. Marking on pop lets several cells queue the same neighbour before it is popped, so the queue is larger.",
        },
        {
          id: "c",
          text: "The search never ends, because a cell can be queued again after it has been popped.",
          why: "Cells already popped are marked, so they are not queued again. The search does end, but only after processing a very large number of duplicate entries.",
        },
        {
          id: "d",
          text: "Some cells are never reached, because the second copy of a cell blocks its neighbours.",
          why: "Extra copies do not block anything. Every reachable cell still gets popped; the problem is the cost of all the repeated work.",
        },
      ],
      answer: "a",
    },
    {
      id: "gb-multisource-cost",
      chapter: "dsa-grid-bfs",
      level: "intermediate",
      skill: "complexity",
      pattern: "grid-bfs",
      section: "multi-source-bfs-start-from-every-source-at-once",
      kind: "single",
      prompt:
        "<p>A multi-source BFS runs on a grid with R rows and C columns and G sources, all put in the queue first. Each cell is queued at most once and has four neighbours to check. Which bound on the running time is the tightest?</p>",
      choices: [
        {
          id: "a",
          text: "O(G · R · C)",
          why: "That is the cost of running one BFS per source. With all the sources in a single queue, no cell is queued twice, so the factor G never appears.",
        },
        {
          id: "b",
          text: "O(R · C · log G)",
          why: "A logarithm would come from a heap that orders the sources. A plain queue has no ordering cost, because the layers are already in order.",
        },
        {
          id: "c",
          text: "O(G + R + C)",
          why: "The search can reach every cell of the grid, so the time depends on the number of cells, R · C, and not on the sum of the side lengths.",
        },
        {
          id: "d",
          text: "O(R · C)",
          why: "The sources are at most R · C cells, so putting them in the queue costs at most R · C. Each cell is queued once and examined with four neighbour checks, so the total is proportional to the number of cells.",
        },
      ],
      answer: "d",
    },
    {
      id: "gb-ladder-cost",
      chapter: "dsa-grid-bfs",
      level: "intermediate",
      skill: "complexity",
      pattern: "grid-bfs",
      section: "state-space-bfs-the-graph-lives-in-your-head",
      kind: "single",
      prompt:
        "<p>A word ladder has N words of length L over a 26-letter alphabet. Words are put into wildcard buckets such as <code>h*t</code> and <code>*ot</code>, and BFS looks up the L buckets of each word it pops. Which bound is the tightest for the total work?</p>",
      choices: [
        {
          id: "a",
          text: "O(N² · L), because every word is compared with every other word.",
          why: "That is the cost of the pairwise comparison the buckets replace. With buckets, a word only looks at the words that share a pattern with it.",
        },
        {
          id: "b",
          text: "O(26<sup>L</sup>)",
          why: "That counts every possible string, but the search only touches words in the list. The work is limited by the N words and their L patterns.",
        },
        {
          id: "c",
          text: "O(N · L), because each word contributes L buckets and each bucket costs one step.",
          why: "Building one bucket key takes O(L) time, since it copies the word with one letter replaced. N · L keys of length L cost N · L², which is what dominates.",
        },
        {
          id: "d",
          text: "O(N · L²)",
          why: "There are N · L keys and each is built in O(L). A bucket holds words that differ only at one position, so with 26 letters it holds at most 26 words, and the search adds only a constant factor times N · L steps.",
        },
      ],
      answer: "d",
    },
    {
      id: "gb-trace-distance",
      chapter: "dsa-grid-bfs",
      level: "intermediate",
      skill: "trace",
      pattern: "grid-bfs",
      section: "bfs-gives-distances-the-layer-argument",
      kind: "single",
      prompt:
        "<p>The chapter's <code>shortestPath</code> runs on this grid, where <code>0</code> is open and <code>1</code> is a wall. The start is <code>(0, 0)</code> and the goal is <code>(2, 0)</code>, with the cell at row 2, column 0 directly below the wall in row 1. What does it return?</p><pre><code>[[0, 0, 0],\n [1, 1, 0],\n [0, 0, 0]]</code></pre>",
      choices: [
        {
          id: "a",
          text: "2",
          why: "That is the straight-line distance down the left column, but the cell at (1, 0) is a wall, so the search cannot go that way.",
        },
        {
          id: "b",
          text: "4",
          why: "Four is the distance to the opposite corner, (2, 2): two steps right and two steps down. The goal here is the cell at the bottom left.",
        },
        {
          id: "c",
          text: "-1",
          why: "The goal is reachable. The route goes right along the top row, down the right column and back left along the bottom row.",
        },
        {
          id: "d",
          text: "6",
          why: "The route is two steps right, two steps down and two steps left. Cell (0, 2) is at distance 2, (1, 2) at 3, (2, 2) at 4, (2, 1) at 5 and (2, 0) at 6.",
        },
      ],
      answer: "d",
    },
    {
      id: "gb-oranges-no-guard",
      chapter: "dsa-grid-bfs",
      level: "intermediate",
      skill: "edge-case",
      pattern: "grid-bfs",
      section: "multi-source-bfs-start-from-every-source-at-once",
      kind: "single",
      prompt:
        "<p>A version of Rotting Oranges loops with <code>while (layer.length &gt; 0)</code> instead of <code>while (layer.length &gt; 0 &amp;&amp; fresh &gt; 0)</code>, and increments <code>minutes</code> at the end of every round. It returns <code>fresh === 0 ? minutes : -1</code>. What does it return for the grid <code>[[2, 1]]</code>?</p>",
      choices: [
        {
          id: "a",
          text: "1",
          why: "One is the right answer, and it is what the chapter's version returns. The version in the question runs one round more, so it counts a minute in which nothing rots.",
        },
        {
          id: "b",
          text: "2",
          why: "In round one the fresh orange rots and the new layer holds that orange. Round two expands it, finds nothing fresh, and still adds one to the minutes, so the count ends at 2.",
        },
        {
          id: "c",
          text: "0",
          why: "Zero is returned only when there is no fresh orange to start with. Here there is one, and the loop does run at least once.",
        },
        {
          id: "d",
          text: "-1",
          why: "The fresh counter reaches 0 in the first round, so the final test passes and a number is returned, not -1.",
        },
      ],
      answer: "b",
    },
    {
      id: "gb-fill-same-colour",
      chapter: "dsa-grid-bfs",
      level: "intermediate",
      skill: "edge-case",
      pattern: "grid-bfs",
      section: "flood-fill-dfs-or-bfs-and-what-the-stack-costs",
      kind: "single",
      prompt:
        "<p>The recursive flood fill loses its first line, <code>if (old === color) return image;</code>. It is then called on <code>[[1, 1], [1, 1]]</code> with the new colour <code>1</code>. What happens?</p>",
      choices: [
        {
          id: "a",
          text: "The image comes back unchanged, because painting a cell with the colour it already has changes nothing at all.",
          why: "The paint changes nothing, but that is the problem: the cell still matches the old colour afterwards, so the test that stops the recursion never succeeds.",
        },
        {
          id: "b",
          text: "Only the starting cell is painted, because the neighbours are already the new colour.",
          why: "The neighbours are the new colour only because it equals the old one, and the code compares with the old colour. They still match, so the recursion goes on into them.",
        },
        {
          id: "c",
          text: "The recursion never reaches a base case along some path, and a stack overflow error is thrown.",
          why: "Each call paints a cell and calls its four neighbours. Painted cells still equal the old colour, so calls bounce between neighbouring cells forever until the call stack is exhausted.",
        },
        {
          id: "d",
          text: "Each cell is painted exactly once and the function returns normally.",
          why: "Nothing records which cells were painted. The painted colour is the only visited mark, and here it cannot be told apart from the original colour.",
        },
      ],
      answer: "c",
    },
    {
      id: "gb-shift-cost",
      chapter: "dsa-grid-bfs",
      level: "intermediate",
      skill: "complexity",
      pattern: "grid-bfs",
      section: "a-queue-without-the-o-n-shift",
      kind: "single",
      prompt:
        "<p>A BFS over a grid of a million cells uses a plain array as its queue and removes the front with <code>queue.shift()</code>. Which statement is right?</p>",
      choices: [
        {
          id: "a",
          text: "<code>shift</code> moves every remaining element down one place, so each call is O(n) and the BFS can become quadratic.",
          why: "The language describes <code>shift</code> as moving all the remaining elements, so you should plan for a cost proportional to the queue length. Reading with an index that moves forward avoids the cost.",
        },
        {
          id: "b",
          text: "<code>shift</code> is always O(1), so the BFS stays linear.",
          why: "Nothing in the language guarantees that. An engine may do something clever in some situations, but an analysis cannot assume it, and the chapter measured a large slowdown at 100,000 elements.",
        },
        {
          id: "c",
          text: "<code>shift</code> is slow only when the queue holds arrays or objects.",
          why: "The cost comes from moving elements, whatever they are. The chapter measured it on a queue of plain numbers.",
        },
        {
          id: "d",
          text: "<code>shift</code> makes the answer wrong, because it removes the last element of the array and not the first.",
          why: "<code>shift</code> removes the first element and <code>pop</code> removes the last one. Used as a queue front, <code>shift</code> gives the right answers, only slowly.",
        },
      ],
      answer: "a",
    },
    {
      id: "gb-cell-state-not-enough",
      chapter: "dsa-grid-bfs",
      level: "intermediate",
      skill: "recognise",
      pattern: "grid-bfs",
      section: "state-space-bfs-the-graph-lives-in-your-head",
      kind: "single",
      prompt:
        "<p>You may walk through at most k walls on the way across a grid. A solution keeps one visited flag per cell and ignores a cell it has already seen. Why can it return a wrong answer?</p>",
      choices: [
        {
          id: "a",
          text: "A cell first reached with few removals left blocks a later arrival with more left, which may be the only way through.",
          why: "Arriving with more removals left is strictly better, so the state has to include the removals left. A flag on the cell alone rejects the better arrival, so a route that needs it is lost and the answer can come out too long or as -1.",
        },
        {
          id: "b",
          text: "BFS cannot be used when a move can cost a removal, so only DFS with backtracking is correct.",
          why: "Every move is still one step, so BFS counts the steps correctly. The fix is a richer state, not a different search.",
        },
        {
          id: "c",
          text: "A visited flag on cells is only valid on grids with at most four rows.",
          why: "The size of the grid is not the issue. The flag fails because two arrivals at the same cell are not equal when their removals left differ.",
        },
        {
          id: "d",
          text: "The flag has to be set when the cell is popped, not when it is pushed.",
          why: "Marking on push is the right moment. The error here is the choice of what to mark, which has to be the cell together with the removals left.",
        },
      ],
      answer: "a",
    },
    {
      id: "gb-multi-sources",
      chapter: "dsa-grid-bfs",
      level: "intermediate",
      skill: "recognise",
      pattern: "grid-bfs",
      section: "choosing-the-technique-and-what-each-costs",
      kind: "multi",
      prompt: "<p>Select every task that is naturally solved by a BFS that starts with many cells in the queue.</p>",
      choices: [
        {
          id: "a",
          text: "For each cell of a 0 and 1 matrix, the distance to the nearest 0.",
          why: "Every 0 is a source with distance 0, and the answer for a 1 is the distance to whichever zero reaches it first.",
        },
        {
          id: "b",
          text: "The number of minutes until every fresh orange has rotted, when several oranges are rotten at the start.",
          why: "All rotten oranges spread at the same time, so they all go in the first layer, and each layer is one minute.",
        },
        {
          id: "c",
          text: "The fewest steps from one named cell to another named cell in a maze.",
          why: "There is one start. A plain single-source BFS is enough, and adding extra sources would change the question.",
        },
        {
          id: "d",
          text: "All cells from which water can flow to the left or top edge, when water moves to neighbours that are not higher.",
          why: "Searching backward from every cell on those edges, climbing to neighbours that are not lower, marks all the cells that can reach them in one pass.",
        },
        {
          id: "e",
          text: "The number of separate islands in a grid of land and water.",
          why: "Counting islands is a flood fill that is started again each time a new unseen land cell is found, not one search that starts from many cells.",
        },
      ],
      answers: ["a", "b", "d"],
    },
    {
      id: "gb-order-multisource",
      chapter: "dsa-grid-bfs",
      level: "intermediate",
      skill: "trace",
      pattern: "grid-bfs",
      section: "multi-source-bfs-start-from-every-source-at-once",
      kind: "order",
      prompt:
        "<p>Put the steps of the 01 Matrix BFS in the order the code performs them, from the first line to the work done on one neighbour.</p>",
      items: [
        { id: "scan", text: "Scan the grid, and for every 0 set its distance to 0 and add it to the queue." },
        { id: "pop", text: "Take the next cell from the front of the queue." },
        {
          id: "bounds",
          text: "For one of its four directions, compute the neighbour and skip it if it is outside the grid.",
        },
        { id: "seen", text: "Skip the neighbour if it already has a distance." },
        {
          id: "set",
          text: "Set the neighbour's distance to the popped cell's distance plus one and add it to the queue.",
        },
      ],
      why: "The queue has to hold all the sources before the first pop, so the scan comes first. A cell is popped before its neighbours are looked at. The bounds check comes before any read of the neighbour, since reading a position outside the grid fails or gives <code>undefined</code>. The seen test needs a neighbour inside the grid, and the distance is written only for a neighbour that passed both tests.",
    },
  ],
  pattern: {
    pattern: "grid-bfs",
    chapter: "dsa-grid-bfs",
    signals: [
      "The input is a grid, a word list, a lock or a board, and the question asks for the fewest moves or steps.",
      "The task asks for the nearest of many sources, or for something that happens everywhere at once, one round at a time.",
      "The question is about cells that can or cannot reach the edge, and a search from the edge is cheaper than one from every cell.",
      "Something besides the position, such as removals left or keys held, changes what is allowed, so it belongs in the state.",
    ],
    template:
      "<pre><code>const queue = [...sources]; let head = 0; while (head &lt; queue.length) { const [r, c] = queue[head++]; for (const [dr, dc] of DIRS) { const nr = r + dr, nc = c + dc; if (nr &lt; 0 || nr &gt;= rows || nc &lt; 0 || nc &gt;= cols || dist[nr][nc] !== -1) continue; dist[nr][nc] = dist[r][c] + 1; queue.push([nr, nc]); } }</code></pre>",
    time: "O(R · C) for a grid, or O(states · moves per state) for a state space",
    space: "O(R · C), or O(states)",
    styles: ["online-assessment", "phone-screen", "onsite"],
  },
};
