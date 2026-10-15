import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "topo-spreadsheet-order",
      chapter: "dsa-topological-patterns",
      level: "intermediate",
      skill: "recognise",
      pattern: "topological-sort",
      section: "recognizing-it-in-an-unseen-problem",
      placement: true,
      kind: "single",
      prompt:
        "<p>A spreadsheet stores formulas, and each formula reads some other cells. After an edit, the program must recalculate the cells in an order where every cell is computed after the cells it reads, and it must report a circular reference if no such order exists. Which approach fits?</p>",
      choices: [
        {
          id: "a",
          text: "Sort all the cells by name and recalculate them in that sorted order, from the first name to the last.",
          why: "Names say nothing about what a formula reads. A cell named A1 can read a cell named Z9, and then A1 would be computed before its input.",
        },
        {
          id: "b",
          text: "Run BFS from the edited cell and recalculate each cell the first time BFS reaches it, in the order reached.",
          why: "BFS reaches a cell the first time any one of its inputs is reached. A cell with two inputs can be reached through the first one before the second has been recalculated.",
        },
        {
          id: "c",
          text: "Add an edge from each input cell to its reader, then topologically sort; if cells are left over, there is a circular reference.",
          why: "A topological order puts every cell after the cells it reads, which is exactly the recalculation order. A cycle of references has no such order, so the sort stops short of emitting every cell.",
        },
        {
          id: "d",
          text: "Use union-find to group cells that share a formula, then recalculate one group at a time, in any order.",
          why: "Union-find records which cells are connected and ignores direction. A group does not say which of its cells has to be computed first, so no recalculation order comes out of it.",
        },
      ],
      answer: "c",
    },
    {
      id: "topo-derive-edges",
      chapter: "dsa-topological-patterns",
      level: "intermediate",
      skill: "recognise",
      pattern: "topological-sort",
      section: "alien-dictionary-deriving-the-graph-is-the-hard-part",
      placement: true,
      kind: "single",
      prompt:
        "<p>You get a list of words that is known to be sorted according to a secret alphabet. Produce one order of the letters that is consistent with the list, or report that none exists. How do you get the constraints on the letters?</p>",
      choices: [
        {
          id: "a",
          text: "Compare each adjacent pair of words, take the letters at the first position where they differ as one constraint, then topologically sort.",
          why: "Sorting compares words from the left and stops at the first difference, so that one pair of letters is all an adjacent pair of words tells you. The constraints form a graph on letters, and a topological order of it is a consistent alphabet.",
        },
        {
          id: "b",
          text: "Compare each adjacent pair of words and add a constraint from every position where they differ, then topologically sort.",
          why: 'Only the first difference carries information. For <code>"ax"</code> before <code>"by"</code> the list says a comes before b, and says nothing about x and y.',
        },
        {
          id: "c",
          text: "Sort all the letters with the default string comparison and check that the word list agrees with that order.",
          why: "The default comparison follows the usual alphabet, and the secret alphabet is the very thing you are asked to find. The word list is the only evidence there is.",
        },
        {
          id: "d",
          text: "Take the first letter of each word and use the order of those letters in the list as the alphabet.",
          why: "First letters can repeat, as in a, a, b, and they leave out letters that only appear later in a word. Words with the same first letter are ordered by their later letters.",
        },
      ],
      answer: "a",
    },
    {
      id: "topo-fewest-days",
      chapter: "dsa-topological-patterns",
      level: "intermediate",
      skill: "recognise",
      pattern: "topological-sort",
      section: "kahn-s-algorithm-bfs-over-in-degrees",
      placement: true,
      kind: "single",
      prompt:
        "<p>Six tasks take one day each, and any number of them can run on the same day. A and B have no prerequisites. C needs A and B. D needs C, E needs C, and F needs both D and E. What is the fewest number of days to finish everything, and how do you compute it in general?</p>",
      choices: [
        {
          id: "a",
          text: "2 days: count the tasks that have no prerequisites, since those start first.",
          why: "That counts the tasks that can start on the first day, not the days needed. C cannot start until both A and B are done, so more days follow.",
        },
        {
          id: "b",
          text: "6 days: count all the tasks, because every task takes a full day of its own.",
          why: "That is the answer only if no two tasks may run in parallel. Here A and B can share a day, and so can D and E.",
        },
        {
          id: "c",
          text: "3 days: count the edges on the longest chain of prerequisites, the critical path.",
          why: "The longest chain is A → C → D → F, which has three edges but four tasks, and each task takes a day. Counting edges leaves out one day.",
        },
        {
          id: "d",
          text: "4 days: run Kahn's algorithm and count the rounds, each draining the whole queue.",
          why: "The rounds here are A and B, then C, then D and E, then F. Each round is one day, so there are four, which equals the number of tasks on the longest chain.",
        },
      ],
      answer: "d",
    },
    {
      id: "topo-trace-kahn",
      chapter: "dsa-topological-patterns",
      level: "intermediate",
      skill: "trace",
      pattern: "topological-sort",
      section: "kahn-s-algorithm-bfs-over-in-degrees",
      kind: "single",
      prompt:
        "<p>What does <code>topoSortKahn(6, edges)</code> return?</p><pre><code>function topoSortKahn(n, edges) {\n  const adj = Array.from({ length: n }, () =&gt; []);\n  const indeg = new Array(n).fill(0);\n  for (const [u, v] of edges) { adj[u].push(v); indeg[v]++; }\n\n  const queue = [];\n  for (let i = 0; i &lt; n; i++) if (indeg[i] === 0) queue.push(i);\n\n  const order = [];\n  for (let head = 0; head &lt; queue.length; head++) {\n    const u = queue[head];\n    order.push(u);\n    for (const v of adj[u]) {\n      if (--indeg[v] === 0) queue.push(v);\n    }\n  }\n\n  return order.length === n ? order : [];\n}\n\nconst edges = [[4, 1], [4, 0], [3, 0], [3, 2], [0, 5], [1, 5]];\ntopoSortKahn(6, edges);</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>[3, 4, 0, 1, 2, 5]</code>",
          why: "This is a valid topological order but not what this code produces. Node 2 is freed when 3 is popped, before 4 is popped, so 2 is queued ahead of 0 and 1.",
        },
        {
          id: "b",
          text: "<code>[3, 4, 2, 1, 0, 5]</code>",
          why: "The nodes with in-degree 0 are 3 and 4. Popping 3 frees 2. Popping 4 lists <code>adj[4] = [1, 0]</code>, so 1 is freed, and 0 is freed after it. Popping 2 frees nothing, popping 1 only lowers node 5 to 1, and popping 0 frees 5.",
        },
        {
          id: "c",
          text: "<code>[3, 4, 1, 0, 2, 5]</code>",
          why: "Node 2 depends only on 3. It is freed by the very first pop, before 4 is processed, so it is queued before 1 and 0.",
        },
        {
          id: "d",
          text: "<code>[3, 4, 2, 0, 1, 5]</code>",
          why: "The list of node 4 is <code>[1, 0]</code>, so the loop frees 1 first and 0 second. Queue order follows the order of that list.",
        },
      ],
      answer: "b",
    },
    {
      id: "topo-trace-dfs",
      chapter: "dsa-topological-patterns",
      level: "intermediate",
      skill: "trace",
      pattern: "topological-sort",
      section: "dfs-topological-sort-post-order-then-reverse",
      kind: "single",
      prompt:
        "<p>What does <code>topoSortDfs(5, edges)</code> return?</p><pre><code>const WHITE = 0, GRAY = 1, BLACK = 2;\n\nfunction topoSortDfs(n, edges) {\n  const adj = Array.from({ length: n }, () =&gt; []);\n  for (const [u, v] of edges) adj[u].push(v);\n\n  const state = new Array(n).fill(WHITE);\n  const order = [];\n  let cyclic = false;\n\n  function dfs(u) {\n    state[u] = GRAY;\n    for (const v of adj[u]) {\n      if (state[v] === GRAY) { cyclic = true; return; }\n      if (state[v] === WHITE) {\n        dfs(v);\n        if (cyclic) return;\n      }\n    }\n    state[u] = BLACK;\n    order.push(u);\n  }\n\n  for (let i = 0; i &lt; n; i++) {\n    if (state[i] === WHITE) {\n      dfs(i);\n      if (cyclic) return [];\n    }\n  }\n  return order.reverse();\n}\n\nconst edges = [[0, 2], [0, 1], [1, 3], [2, 3], [4, 3]];\ntopoSortDfs(5, edges);</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>[3, 2, 1, 0, 4]</code>",
          why: "That is the post-order, the order in which nodes finish, before it is reversed. The function ends with <code>order.reverse()</code>, so the result starts from the end of this list.",
        },
        {
          id: "b",
          text: "<code>[0, 2, 3, 1, 4]</code>",
          why: "That is the order in which nodes are first entered. It is not even a valid topological order, because 3 appears before 1 although the edge 1 → 3 needs 1 first.",
        },
        {
          id: "c",
          text: "<code>[4, 0, 1, 2, 3]</code>",
          why: "<code>dfs(0)</code> goes to 2 first, since <code>adj[0] = [2, 1]</code>. Node 3 finishes first, then 2, then 1, then 0. Then <code>dfs(4)</code> finishes 4, so the post-order is 3, 2, 1, 0, 4, and reversing it gives 4, 0, 1, 2, 3.",
        },
        {
          id: "d",
          text: "<code>[4, 0, 2, 1, 3]</code>",
          why: "This is a valid topological order, but not the one this code returns. Node 2 finishes before node 1, so after reversing, 1 comes before 2.",
        },
      ],
      answer: "c",
    },
    {
      id: "topo-kahn-time",
      chapter: "dsa-topological-patterns",
      level: "intermediate",
      skill: "complexity",
      pattern: "topological-sort",
      section: "kahn-s-algorithm-bfs-over-in-degrees",
      kind: "single",
      prompt:
        "<p>In <code>topoSortKahn</code>, with V nodes and E edges, what is the tightest worst-case time bound, including building <code>adj</code> and <code>indeg</code>? The queue is an array read with a moving <code>head</code> index, as in the chapter, and never uses <code>shift()</code>.</p><pre><code>for (let head = 0; head &lt; queue.length; head++) {\n  const u = queue[head];\n  order.push(u);\n  for (const v of adj[u]) {\n    if (--indeg[v] === 0) queue.push(v);\n  }\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "O(V + E)",
          why: "Every node enters the queue at most once and is read once, and every edge is looked at once, when its source is popped. Building the lists and counts takes O(V + E) as well.",
        },
        {
          id: "b",
          text: "O(V²)",
          why: "A queue built on <code>shift()</code> can cost time proportional to its length on each pop, and that can add up to this. The moving <code>head</code> never moves elements, so this code does not pay it.",
        },
        {
          id: "c",
          text: "O(V · E)",
          why: "That would need every node to trigger a pass over every edge. Each edge is visited just once, when its source node is popped.",
        },
        {
          id: "d",
          text: "O(E log V)",
          why: "Nothing in this loop sorts, halves or uses a heap. It also would not cover a graph with no edges, where all V nodes are still queued and read.",
        },
      ],
      answer: "a",
    },
    {
      id: "topo-smallest-order-time",
      chapter: "dsa-topological-patterns",
      level: "intermediate",
      skill: "complexity",
      pattern: "topological-sort",
      section: "course-schedule-i-and-ii-the-canonical-pair",
      kind: "single",
      prompt:
        "<p>To return the lexicographically smallest topological order, the plain queue in Kahn's algorithm is replaced by a binary min-heap holding the nodes that are ready. With V nodes and E edges, which is the tightest worst-case time bound?</p>",
      choices: [
        {
          id: "a",
          text: "O(V + E)",
          why: "That is the cost with a plain queue. Each of the V nodes is now pushed into and popped from a heap, and each of those operations can cost O(log V).",
        },
        {
          id: "b",
          text: "O(V log V + E)",
          why: "Every node is pushed once and popped once, which is V heap operations of O(log V) each. Each of the E edge decrements is an O(1) step. A node is pushed only when it is freed, and that push is already counted among the V pushes.",
        },
        {
          id: "c",
          text: "O(E log V)",
          why: "With no edges, all V nodes still go through the heap, which costs V log V, and O(E log V) would say zero. Edges do not each pay a heap operation, since a node is pushed only once, when it is freed.",
        },
        {
          id: "d",
          text: "O(V²)",
          why: "Nothing here costs V per node. A binary heap needs only O(log V) per operation, so V nodes need V log V, and the edge work adds E.",
        },
      ],
      answer: "b",
    },
    {
      id: "topo-edge-direction",
      chapter: "dsa-topological-patterns",
      level: "intermediate",
      skill: "edge-case",
      pattern: "topological-sort",
      section: "course-schedule-i-and-ii-the-canonical-pair",
      kind: "single",
      prompt:
        "<p>Each pair <code>[course, prereq]</code> means <code>prereq</code> must be taken before <code>course</code>. A developer builds the graph like this, with the rest of Kahn's algorithm unchanged. What does <code>findOrder(3, [[1, 0], [2, 1]])</code> return?</p><pre><code>for (const [course, prereq] of prerequisites) {\n  adj[course].push(prereq);\n  indeg[prereq]++;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>[0, 1, 2]</code>, the valid order of the courses.",
          why: "This is the order a correct build, with edges from prerequisite to course, produces. With the edges reversed, the only node with no incoming edge is 2, so the algorithm starts there.",
        },
        {
          id: "b",
          text: "<code>[]</code>, because reversing the edges creates a cycle.",
          why: "Reversing every edge of an acyclic graph gives another acyclic graph. The algorithm has nothing to report, so no cycle is signalled.",
        },
        {
          id: "c",
          text: "<code>[1, 0, 2]</code>, with the course that has a prerequisite first.",
          why: "In the reversed graph node 1 has an incoming edge from 2, so its in-degree is 1 and it cannot be queued at the start. Nothing is emitted before its blocker is.",
        },
        {
          id: "d",
          text: "<code>[2, 1, 0]</code>, a valid order of the reversed graph but the wrong answer.",
          why: "Nodes 2, 1 and 0 are emitted in turn and no cycle is found, so the call looks successful. But course 2 needs course 1, which needs course 0, so 0 must come first.",
        },
      ],
      answer: "d",
    },
    {
      id: "topo-push-on-decrement",
      chapter: "dsa-topological-patterns",
      level: "intermediate",
      skill: "edge-case",
      pattern: "topological-sort",
      section: "kahn-s-algorithm-bfs-over-in-degrees",
      kind: "single",
      prompt:
        "<p>A developer changes the inner loop of <code>topoSortKahn</code> so that a node is pushed every time one of its in-degree counts drops, not only when it reaches zero. What does <code>topoSortKahn(3, [[0, 2], [1, 2]])</code> return?</p><pre><code>for (const v of adj[u]) {\n  indeg[v]--;\n  queue.push(v);\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>[0, 1, 2]</code>, because node 2 is still emitted after both of its prerequisites.",
          why: "Node 2 is pushed as soon as 0 is popped, while 1 has not been popped yet, and it is pushed again when 1 is popped. So node 2 is emitted twice, not once.",
        },
        {
          id: "b",
          text: "<code>[0, 2, 1]</code>, with node 2 emitted before node 1 is done.",
          why: "Node 1 is already in the queue, ahead of the pushed 2, because the queue starts as <code>[0, 1]</code>. Node 1 is popped before the pushed copy of 2 is reached.",
        },
        {
          id: "c",
          text: "<code>[]</code>, which wrongly reports a cycle.",
          why: "Node 2 is queued twice, so <code>order</code> grows to four entries, [0, 1, 2, 2]. That length is not 3, so the final check returns an empty array even though the graph has no cycle.",
        },
        {
          id: "d",
          text: "<code>[0, 1, 2, 2]</code>, with node 2 emitted twice.",
          why: "The array is built, but the function returns <code>order</code> only when its length is 3. With four entries it returns <code>[]</code> instead.",
        },
      ],
      answer: "c",
    },
    {
      id: "topo-empty-alphabet",
      chapter: "dsa-topological-patterns",
      level: "intermediate",
      skill: "edge-case",
      pattern: "topological-sort",
      section: "alien-dictionary-deriving-the-graph-is-the-hard-part",
      kind: "multi",
      prompt:
        '<p>The chapter\'s <code>alienOrder(words)</code> returns <code>""</code> when no consistent alphabet exists. Select every input for which it returns the empty string.</p>',
      choices: [
        {
          id: "a",
          text: '<code>["z", "x", "z"]</code>',
          why: "The first pair gives z before x, and the second pair gives x before z. The two constraints form a cycle, so not every letter is emitted and the function returns an empty string.",
        },
        {
          id: "b",
          text: '<code>["abc", "ab"]</code>',
          why: "In any alphabet a word is never placed after a longer word that begins with it, so this list cannot be sorted by any order. The function catches it with the prefix check before any graph is built.",
        },
        {
          id: "c",
          text: '<code>["z", "x"]</code>',
          why: 'The only constraint is z before x, which has a valid order. The function returns <code>"zx"</code>.',
        },
        {
          id: "d",
          text: '<code>["ab", "abc"]</code>',
          why: 'A word may come before a longer word that starts with it, so there is nothing wrong. The two words differ nowhere in their common part, so there is no constraint at all, and every letter is free. The function returns all three letters, here <code>"abc"</code>.',
        },
      ],
      answers: ["a", "b"],
    },
    {
      id: "topo-order-kahn",
      chapter: "dsa-topological-patterns",
      level: "intermediate",
      skill: "trace",
      pattern: "topological-sort",
      section: "kahn-s-algorithm-bfs-over-in-degrees",
      kind: "order",
      prompt:
        "<p>Put the steps of Kahn's algorithm in the order they happen. Start with counting the in-degrees and end with the check that tells whether a cycle blocked some nodes. The two middle steps that repeat are listed once, in the order they run inside one pass of the loop.</p>",
      items: [
        { id: "count", text: "Build the adjacency lists and count each node's in-degree from the edges." },
        { id: "seed", text: "Put every node whose in-degree is 0 into the queue." },
        { id: "take", text: "Take the next node from the queue and append it to <code>order</code>." },
        {
          id: "release",
          text: "Decrement the in-degree of each node it points to, and queue any whose count has just reached 0.",
        },
        { id: "check", text: "Compare the length of <code>order</code> with the number of nodes." },
      ],
      why: "The in-degrees have to exist before the queue can be seeded, and the queue has to be seeded before a node can be taken from it. A node is released only after it has been taken, since the release uses the edges leaving the node just emitted. The length comparison goes last, because only when the queue has run out can you tell whether some nodes were never freed.",
    },
    {
      id: "topo-peel-too-far",
      chapter: "dsa-topological-patterns",
      level: "intermediate",
      skill: "edge-case",
      pattern: "topological-sort",
      section: "minimum-height-trees-peeling-leaves-is-kahn-on-a-tree",
      kind: "single",
      prompt:
        "<p>A developer changes the loop condition of <code>findMinHeightTrees</code> from <code>while (remaining &gt; 2)</code> to <code>while (remaining &gt; 0)</code>, leaving the rest unchanged. The tree is the path <code>0-1-2-3-4</code>, so <code>n = 5</code> and the edges are <code>[[0, 1], [1, 2], [2, 3], [3, 4]]</code>. What does the function return?</p>",
      choices: [
        {
          id: "a",
          text: "<code>[2]</code>, the middle of the path.",
          why: "This is what the original condition returns. It stops once one node is left. With the new condition the loop also runs a round for that last node.",
        },
        {
          id: "b",
          text: "<code>[1, 3]</code>, the two nodes of the second layer.",
          why: "Those are the leaves after the first round, but the loop keeps going. Two more rounds follow, and <code>leaves</code> is overwritten each time.",
        },
        {
          id: "c",
          text: "<code>[0, 4]</code>, the two original leaves.",
          why: "The original leaves are removed in the first round, and the variable <code>leaves</code> is overwritten in every round, so it cannot still hold them at the end.",
        },
        {
          id: "d",
          text: "<code>[]</code>, because the last round also removes the centre.",
          why: "Round one removes 0 and 4, round two removes 1 and 3, and round three removes 2. The degrees of 1 and 3 then fall to 0, not to 1, so no new leaf is found and the final <code>leaves</code> is an empty array.",
        },
      ],
      answer: "d",
    },
    {
      id: "topo-peel-time",
      chapter: "dsa-topological-patterns",
      level: "intermediate",
      skill: "complexity",
      pattern: "topological-sort",
      section: "minimum-height-trees-peeling-leaves-is-kahn-on-a-tree",
      kind: "single",
      prompt:
        "<p>For a tree of <code>n</code> nodes, what is the tightest worst-case time of <code>findMinHeightTrees</code>, the version that removes layers of leaves, including building the adjacency lists?</p>",
      choices: [
        {
          id: "a",
          text: "O(n²)",
          why: "That is the cost of running a BFS from every node as a candidate root, at O(n) per run. The peeling version never repeats a traversal.",
        },
        {
          id: "b",
          text: "O(n log n)",
          why: "Nothing here sorts or uses a heap. The only sort is on the final one or two nodes, which costs a constant.",
        },
        {
          id: "c",
          text: "O(n)",
          why: "A tree has n - 1 edges. Each node becomes a leaf and is removed at most once, and each edge is looked at when each of its two ends is removed, so the work adds up to a constant times n.",
        },
        {
          id: "d",
          text: "O(n · d), where d is the number of edges on the longest path",
          why: "There are about d / 2 rounds, but a round only touches the leaves of that round. The sizes of the rounds add up to n, so the diameter does not multiply the work.",
        },
      ],
      answer: "c",
    },
    {
      id: "topo-ancestor-cost",
      chapter: "dsa-topological-patterns",
      level: "intermediate",
      skill: "complexity",
      pattern: "topological-sort",
      section: "course-schedule-iv-answering-reachability-queries-on-a-dag",
      kind: "single",
      prompt:
        "<p>The ancestor-set solution to Course Schedule IV runs Kahn's algorithm once, giving each node a <code>Set</code> of everything that reaches it, and then answers each of <code>q</code> queries with one <code>has</code> call. The graph has V nodes and E edges. What is the tightest worst-case time, queries included?</p>",
      choices: [
        {
          id: "a",
          text: "O(q · (V + E)), one traversal per query",
          why: "That is the cost of a separate DFS for each query. The sets are built once, and each query then costs a single lookup.",
        },
        {
          id: "b",
          text: "O(V + E + q), one linear pass and a lookup per query",
          why: "This would need every edge to be handled in constant time. Each edge copies the ancestor set of its tail into its head, and that set can hold up to V nodes.",
        },
        {
          id: "c",
          text: "O(V³)",
          why: "This is the cost of Floyd–Warshall. It leaves out the q queries, and it is not tight for a sparse graph, which has few edges and copies far fewer than V³ elements.",
        },
        {
          id: "d",
          text: "O(V + E · V + q)",
          why: "Kahn's loop is O(V + E), each of the E edges may copy up to V ancestors, and each of the q queries is one O(1) lookup.",
        },
      ],
      answer: "d",
    },
    {
      id: "topo-unique-queue",
      chapter: "dsa-topological-patterns",
      level: "intermediate",
      skill: "edge-case",
      pattern: "topological-sort",
      section: "sequence-reconstruction-is-the-order-unique",
      kind: "single",
      prompt:
        "<p>While running <code>sequenceReconstruction([1, 2, 3], [[1, 2], [1, 3]])</code>, node 1 is popped and the queue then holds <code>[2, 3]</code>. What happens, and why?</p>",
      choices: [
        {
          id: "a",
          text: "It returns <code>false</code> at once, because 2 and 3 are free together and could be swapped.",
          why: "Two nodes that are both free at the same moment have no ordering between them. The sequences allow both [1, 2, 3] and [1, 3, 2], so <code>nums</code> is not the only answer.",
        },
        {
          id: "b",
          text: "The function pops 2, checks it against <code>nums[1]</code>, then pops 3, and returns <code>true</code>.",
          why: "The function never gets that far. It tests the queue size at the top of every iteration, and a size above one ends the run before anything is popped.",
        },
        {
          id: "c",
          text: "The function returns <code>false</code> because the graph contains a cycle.",
          why: "There is no cycle here. The edges are 1 → 2 and 1 → 3, and both 2 and 3 have in-degree 0 once 1 is gone. A cycle would show up as nodes that never enter the queue, not as two nodes waiting in it.",
        },
        {
          id: "d",
          text: "The function sorts the queue and continues, since the numbers are labelled in ascending order.",
          why: "Sorting would pick one of the two orders and hide the other. The question asks whether the order is forced, and two free nodes mean it is not.",
        },
      ],
      answer: "a",
    },
    {
      id: "topo-layers-or-weights",
      chapter: "dsa-topological-patterns",
      level: "intermediate",
      skill: "edge-case",
      pattern: "topological-sort",
      section: "parallel-courses-rounds-first-then-durations",
      kind: "single",
      prompt:
        "<p>Three courses take <code>time = [1, 10, 1]</code> months. Courses 1 and 2 have no prerequisites, and course 3 needs both of them. Courses can run at the same time. What is the fewest months to finish all three?</p>",
      choices: [
        {
          id: "a",
          text: "2, the number of layers Kahn's algorithm peels.",
          why: "The layers are {1, 2} then {3}, which is two. But a layer lasts as long as its slowest course, so the layer count measures semesters, not months.",
        },
        {
          id: "b",
          text: "12, the sum of all three durations.",
          why: "The sum is what a single student would need working one course at a time. Courses 1 and 2 overlap, so the one-month course costs nothing extra.",
        },
        {
          id: "c",
          text: "10, the duration of the slowest course.",
          why: "Course 3 cannot start until course 2 is done at month 10, and then it takes one more month. The slowest course alone ignores that final step.",
        },
        {
          id: "d",
          text: "11, the slowest chain: course 2, then course 3.",
          why: "Course 3 starts at month 10, when the later of its two prerequisites finishes (course 1 finishes at month 1), and ends at month 11. The answer is the longest path weighted by duration.",
        },
      ],
      answer: "d",
    },
    {
      id: "topo-safe-wrong-direction",
      chapter: "dsa-topological-patterns",
      level: "intermediate",
      skill: "edge-case",
      pattern: "topological-sort",
      section: "eventual-safe-states-peel-from-the-sinks",
      kind: "single",
      prompt:
        "<p>For Eventual Safe States, a developer runs ordinary Kahn's algorithm on the graph as given, with in-degrees, and returns the nodes it emits. The graph is <code>[[1], [2], [1]]</code>: node 0 points to 1, node 1 points to 2, and node 2 points back to 1. What does this return, and what is the correct answer?</p>",
      choices: [
        {
          id: "a",
          text: "It returns <code>[0]</code>, but the correct answer is <code>[]</code>.",
          why: "Node 0 has in-degree 0 and is emitted. Nodes 1 and 2 keep a positive in-degree because of their cycle. But node 0 leads into that cycle, so no node is safe.",
        },
        {
          id: "b",
          text: "It returns <code>[]</code>, which is the correct answer.",
          why: "The empty array is the correct answer, but this code does not produce it. Node 0 has no incoming edge, so it is emitted before the cycle blocks the others.",
        },
        {
          id: "c",
          text: "It returns <code>[0, 1, 2]</code>, because every node is eventually reached.",
          why: "Nodes 1 and 2 each wait for the other, so neither ever reaches in-degree 0. They are never emitted, which is the cycle showing up as nodes that stay stuck.",
        },
        {
          id: "d",
          text: "It returns <code>[1, 2]</code>, the nodes on the cycle, which are the safe ones.",
          why: "Nodes on a cycle are the least safe of all, since a path can circle through them forever. Safe nodes are the ones that cannot reach a cycle.",
        },
      ],
      answer: "a",
    },
    {
      id: "topo-equal-neighbours",
      chapter: "dsa-topological-patterns",
      level: "intermediate",
      skill: "edge-case",
      pattern: "topological-sort",
      section: "longest-increasing-path-in-a-matrix-a-dag-you-never-build",
      kind: "single",
      prompt:
        "<p>In the memoized <code>longestFrom</code>, a developer writes <code>matrix[nr][nc] &gt;= matrix[r][c]</code> instead of <code>&gt;</code>. What happens for <code>longestIncreasingPath([[1, 1]])</code>?</p>",
      choices: [
        {
          id: "a",
          text: "It returns <code>2</code>, because the second cell can be visited after the first.",
          why: "A step between equal values would count as a step up, but the call never finishes to return anything, because the two cells keep calling each other.",
        },
        {
          id: "b",
          text: "It returns <code>1</code>, because equal cells add nothing to the path, so it is one cell long.",
          why: "That is the answer for the correct <code>&gt;</code>. With <code>&gt;=</code> the code treats equal neighbours as edges, so it does not stop to return 1.",
        },
        {
          id: "c",
          text: "It throws a <code>RangeError</code>, because the two equal cells call each other without end.",
          why: "Cell (0, 0) calls cell (0, 1), which calls cell (0, 0) again before any value has been stored. The calls never end, and the call stack overflows.",
        },
        {
          id: "d",
          text: "It returns <code>0</code>, because the memo still holds its starting value and nothing overwrites it.",
          why: "The memo is written only after the loop over neighbours finishes, and here that loop never finishes. Nothing is returned, so the starting zeros are never read as an answer.",
        },
      ],
      answer: "c",
    },
    {
      id: "topo-center-recognise",
      chapter: "dsa-topological-patterns",
      level: "intermediate",
      skill: "recognise",
      pattern: "topological-sort",
      section: "minimum-height-trees-peeling-leaves-is-kahn-on-a-tree",
      kind: "single",
      prompt:
        "<p>A network is a tree of <code>n</code> machines joined by <code>n - 1</code> undirected cables. A server may go on any machine, and a message must travel from it to the farthest machine. Which machines give the smallest worst-case travel distance, with <code>n</code> up to fifty thousand?</p>",
      choices: [
        {
          id: "a",
          text: "Run a BFS from every machine in turn and keep the ones with the smallest farthest distance.",
          why: "This is correct but runs n breadth-first searches of O(n) each. At n = 50,000 that is about two and a half billion steps.",
        },
        {
          id: "b",
          text: "Repeatedly remove all machines with a single cable, and report the one or two that remain.",
          why: "The machines that remain after removing leaves layer by layer are the middle of the longest path, which is where a server minimises its worst distance. It takes O(n).",
        },
        {
          id: "c",
          text: "Pick the machine with the most cables, since it is the best connected.",
          why: "A machine with many cables can still sit to one side, with a long chain of machines hanging off another side. The number of cables does not measure the farthest distance.",
        },
        {
          id: "d",
          text: "Run Kahn's algorithm and report the node emitted last.",
          why: "Kahn's algorithm needs directed edges and in-degrees. An undirected tree has no direction, so there is no order to emit and no last node to read.",
        },
      ],
      answer: "b",
    },
  ],
  pattern: {
    pattern: "topological-sort",
    chapter: "dsa-topological-patterns",
    signals: [
      "The prompt says prerequisite, depends on, must come before or build order, or gives ordered pairs meaning “a then b”.",
      "The prompt asks whether all tasks can be completed, or whether there is a circular dependency.",
      "The input is sorted or ranked, and the order of the symbols themselves has to be recovered.",
      "The prompt asks for the fewest rounds or semesters with unlimited parallel work.",
      "The prompt asks for longest, shortest or number of paths in a graph that has no cycles.",
    ],
    template:
      "<pre><code>count in-degrees; queue every node with in-degree 0;\nwhile queue: take u, append u to order,\n  for each v after u: indeg[v]--, queue v when it reaches 0;\nreturn order.length === n ? order : []</code></pre>",
    time: "O(V + E)",
    space: "O(V + E)",
    styles: ["online-assessment", "phone-screen", "onsite"],
  },
};
