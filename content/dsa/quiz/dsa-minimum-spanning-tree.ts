import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "mst-cheapest-network",
      chapter: "dsa-minimum-spanning-tree",
      level: "advanced",
      skill: "recognise",
      pattern: "minimum-spanning-tree",
      section: "what-a-minimum-spanning-tree-actually-is",
      placement: true,
      kind: "single",
      prompt:
        "<p>A town has six villages. Surveyors list the possible cable routes between pairs of villages, each with an installation cost. You must choose routes so that every village is connected to every other, directly or through other villages, for the smallest total cost. Which approach fits?</p>",
      choices: [
        {
          id: "a",
          text: "Run Dijkstra's algorithm from the largest village and keep every edge of its shortest-path tree.",
          why: "That tree gives each village its cheapest route from one source. It does not minimise the total cost of all the cables, and a different connected network can cost less in total.",
        },
        {
          id: "b",
          text: "Build a minimum spanning tree with Kruskal's or Prim's algorithm.",
          why: "The task is to connect every vertex at the smallest total edge weight, with no source and no pair of villages singled out. That is exactly a minimum spanning tree, and both greedy algorithms find one.",
        },
        {
          id: "c",
          text: "Run breadth-first search from any village and keep the edges it uses.",
          why: "Breadth-first search does produce a tree that reaches every village, but it ignores costs completely. It minimises the number of cables on each route, not the total price.",
        },
        {
          id: "d",
          text: "Let every village choose its own cheapest cable and use all the chosen cables.",
          why: "Two villages can choose each other's cable and leave the town in separate groups, so the result may not be connected. With tied costs the chosen cables can even form a cycle, so some of them are not needed.",
        },
      ],
      answer: "b",
    },
    {
      id: "mst-forest-count",
      chapter: "dsa-minimum-spanning-tree",
      level: "advanced",
      skill: "recognise",
      pattern: "minimum-spanning-tree",
      section: "kruskal-s-algorithm-sort-every-edge-take-it-if-it-doesn-t-cl",
      placement: true,
      kind: "single",
      prompt:
        "<p>Kruskal's algorithm runs on an undirected weighted graph with 10 vertices. It goes through every edge and ends with exactly 7 accepted edges. What does that tell you?</p>",
      choices: [
        {
          id: "a",
          text: "The graph is connected, and three edges were rejected because they would close a cycle.",
          why: "In a connected graph with 10 vertices Kruskal accepts exactly 9 edges. Rejected edges are extra edges, and they do not lower the number of accepted ones.",
        },
        {
          id: "b",
          text: "The graph has 2 components.",
          why: "Every accepted edge joins two different components, so the number of components is 10 minus the accepted edges. Two components would mean 8 accepted edges.",
        },
        {
          id: "c",
          text: "The graph has 3 components, and the accepted edges form a minimum spanning forest.",
          why: "Starting from 10 separate vertices, every accepted edge merges two components, so 7 accepted edges leave 10 − 7 = 3. Kruskal never joins components that no edge connects, so what it returns is one minimum tree for each component.",
        },
        {
          id: "d",
          text: "At least one edge has a negative weight.",
          why: "The signs of the weights do not change how many edges Kruskal accepts. It sorts the weights and works with negative ones just as well; only the connectivity of the graph decides the count.",
        },
      ],
      answer: "c",
    },
    {
      id: "mst-not-shortest-path",
      chapter: "dsa-minimum-spanning-tree",
      level: "advanced",
      skill: "recognise",
      pattern: "minimum-spanning-tree",
      section: "what-a-minimum-spanning-tree-actually-is",
      placement: true,
      kind: "single",
      prompt:
        "<p>A triangle has vertices A, B and C with edge weights A–B = 2, B–C = 2 and A–C = 3. Which statement about its minimum spanning tree is true?</p>",
      choices: [
        {
          id: "a",
          text: "It is A–B and B–C with total 4, so the tree route from A to C costs 4 although the direct edge A–C costs 3.",
          why: "The three possible pairs of edges weigh 4, 5 and 5, so A–B with B–C is the minimum. A minimum spanning tree minimises the total weight, not the distance between any one pair of vertices.",
        },
        {
          id: "b",
          text: "It must contain A–C, because that is the cheapest way to get from A to C.",
          why: "A spanning tree is judged by its total weight. A–C joins the tree only if that lowers the total, and here the pair A–B with A–C weighs 5, more than the 4 of A–B with B–C.",
        },
        {
          id: "c",
          text: "It is A–B and A–C with total 5, because it must contain the shortest path from A to every other vertex.",
          why: "That describes the shortest-path tree from A, which answers a different question. Its total of 5 is larger than the 4 that another pair of edges achieves.",
        },
        {
          id: "d",
          text: "There are three minimum spanning trees, one for each pair of edges.",
          why: "The three pairs weigh 4, 5 and 5, so only one of them is a minimum. Several minimum spanning trees exist only when different choices give the same smallest total.",
        },
      ],
      answer: "a",
    },
    {
      id: "mst-wells-and-pipes",
      chapter: "dsa-minimum-spanning-tree",
      level: "advanced",
      skill: "recognise",
      pattern: "minimum-spanning-tree",
      section: "the-virtual-node-trick-and-other-mst-disguises",
      kind: "single",
      prompt:
        "<p>Each of n villages can dig its own well for a known cost, or be joined by pipe to another village at a known cost for that pipe. Every village must end up with water, from its own well or through a chain of pipes from a village that has one. Which method finds the cheapest plan?</p>",
      choices: [
        {
          id: "a",
          text: "Build a minimum spanning tree over the villages using only the pipe costs, then dig one well at the village with the cheapest well.",
          why: "This forces exactly one well. When two clusters of villages are joined only by an expensive pipe, digging a second well can cost less than that pipe, and this method can never choose that plan.",
        },
        {
          id: "b",
          text: "Let every village dig its own well and use no pipes.",
          why: "That ignores the pipes. A pipe that costs less than a well lets a village share water, so the total can be lower with some pipes.",
        },
        {
          id: "c",
          text: "Run Dijkstra's algorithm from the village with the cheapest well and read off the distances.",
          why: "There is no single source: any village may dig its own well. Shortest distances from one village also do not add up the cost of a whole network.",
        },
        {
          id: "d",
          text: "Add a virtual vertex joined to each village by an edge that weighs that village's well cost, then build a minimum spanning tree.",
          why: "Digging a well becomes an edge to the virtual vertex. A spanning tree of the n + 1 vertices gives every village a chain of pipes and wells down to the virtual vertex, so its total is the cost of a valid plan, and the minimum one is the cheapest plan.",
        },
      ],
      answer: "d",
    },
    {
      id: "mst-kruskal-complete-cost",
      chapter: "dsa-minimum-spanning-tree",
      level: "advanced",
      skill: "complexity",
      pattern: "minimum-spanning-tree",
      section: "kruskal-vs-prim-which-one-in-the-interview",
      kind: "single",
      prompt:
        "<p>Kruskal's algorithm sorts an edge list with a comparison sort, then runs union-find with path halving and union by rank over it. The input is a complete graph with V vertices, so the list holds E = V(V − 1) / 2 edges. What is the tightest bound on its worst-case time?</p>",
      choices: [
        {
          id: "a",
          text: "O(V²)",
          why: "That is the bound for Prim without a heap on a dense graph. Kruskal has to sort V²/2 edges, and a comparison sort of m items needs about m log m comparisons, so a log factor stays.",
        },
        {
          id: "b",
          text: "O(V² log V)",
          why: "The sort costs O(E log E), and E is about V²/2, so log E is at most 2 log V and the sort is O(V² log V). The union-find work adds only about E times a nearly constant factor, so the sort dominates.",
        },
        {
          id: "c",
          text: "O(V³)",
          why: "That is a valid upper bound but not the tightest. Nothing in Kruskal costs V per edge: sorting takes E log E and each union-find step is nearly constant.",
        },
        {
          id: "d",
          text: "O(V log V)",
          why: "That would be right if only the V − 1 accepted edges were sorted. Kruskal sorts the whole edge list before it starts, and a complete graph has about V²/2 edges.",
        },
      ],
      answer: "b",
    },
    {
      id: "mst-prim-heap-space",
      chapter: "dsa-minimum-spanning-tree",
      level: "advanced",
      skill: "complexity",
      pattern: "minimum-spanning-tree",
      section: "prim-s-algorithm-grow-one-tree-outward-with-a-heap",
      kind: "single",
      prompt:
        "<p>The lazy-heap version of Prim's algorithm pushes <code>[weight, from, to]</code> for every edge leaving a vertex that has just joined the tree, and skips popped entries whose target is already in the tree. For a connected graph with V vertices and E edges (so E ≥ V − 1), what is the tightest bound on the extra space it needs in the worst case, counting the heap, the tree and the <code>inTree</code> array?</p>",
      choices: [
        {
          id: "a",
          text: "O(E)",
          why: "Stale entries stay in the heap until they are popped, and each edge is pushed a constant number of times, at most once from each end. On a dense graph the heap can hold about E entries, and the tree and <code>inTree</code> only need O(V), which is O(E) for a connected graph.",
        },
        {
          id: "b",
          text: "O(V)",
          why: "That would hold if each vertex had one heap entry, as with decrease-key. The lazy version can hold several entries for the same target, so the heap can be far larger than V.",
        },
        {
          id: "c",
          text: "O(V²)",
          why: "On a complete graph E is about V²/2, so this is correct there, but it is not the tightest bound in V and E for every connected graph. A sparse graph needs only O(E), which can be about V.",
        },
        {
          id: "d",
          text: "O(log V)",
          why: "log V is roughly the height of a binary heap, which is what limits the cost of one push or pop, not how many entries the heap holds.",
        },
      ],
      answer: "a",
    },
    {
      id: "mst-trace-kruskal",
      chapter: "dsa-minimum-spanning-tree",
      level: "advanced",
      skill: "trace",
      pattern: "minimum-spanning-tree",
      section: "watching-kruskal-build-the-tree-edge-by-edge",
      kind: "single",
      prompt:
        "<p>The chapter's <code>kruskalMST</code> runs with 6 vertices and these edges, each written as <code>[u, v, weight]</code>:</p><pre><code>kruskalMST(6, [\n  [0, 1, 4], [2, 3, 4], [1, 2, 1],\n  [3, 4, 2], [0, 2, 3], [1, 3, 2],\n  [4, 5, 6], [2, 4, 5], [3, 5, 7],\n])</code></pre><p>What <code>total</code> does it return?</p>",
      choices: [
        {
          id: "a",
          text: "15",
          why: "A spanning tree of weight 15 exists, but Kruskal returns a minimum one and a lighter spanning tree, weight 14, exists.",
        },
        {
          id: "b",
          text: "12",
          why: "12 is the sum of the five lightest edges, 1 + 2 + 2 + 3 + 4, but the edge of weight 4 closes a cycle, so Kruskal skips it. It also skips the weight-5 edge for the same reason and has to take the edge of weight 6 for vertex 5.",
        },
        {
          id: "c",
          text: "14",
          why: "In sorted order it accepts 1–2 (1), 3–4 (2), 1–3 (2) and 0–2 (3). The edges of weight 4 and 5 each join vertices that are already connected, so it skips them, and 4–5 (6) is the last edge needed. The total is 1 + 2 + 2 + 3 + 6 = 14.",
        },
        {
          id: "d",
          text: "13",
          why: "No spanning tree of this graph weighs 13, so no algorithm could return it. The smallest possible total is 14.",
        },
      ],
      answer: "c",
    },
    {
      id: "mst-trace-prim",
      chapter: "dsa-minimum-spanning-tree",
      level: "advanced",
      skill: "trace",
      pattern: "minimum-spanning-tree",
      section: "prim-s-algorithm-grow-one-tree-outward-with-a-heap",
      kind: "single",
      prompt:
        "<p>The chapter's <code>primMST</code> (lazy heap, starting at vertex 0) runs on 6 vertices and these undirected edges, each written as <code>[u, v, weight]</code>:</p><pre><code>[0, 1, 6], [0, 2, 3], [1, 2, 2],\n[1, 3, 5], [2, 3, 8], [2, 4, 9],\n[3, 4, 4], [3, 5, 7], [4, 5, 10]</code></pre><p>It stops once the tree has 5 edges. Which line gives the weights of the accepted edges in the order they are accepted, and the number of popped entries skipped as stale?</p>",
      choices: [
        {
          id: "a",
          text: "2, 3, 4, 5, 7, with no popped entry skipped",
          why: "That is the order Kruskal accepts these edges in, sorted by weight. Prim must take an edge that leaves the current tree, so its first accepted edge is the cheapest one touching vertex 0, which has weight 3.",
        },
        {
          id: "b",
          text: "3, 2, 5, 4, 7, with no popped entry skipped",
          why: "The accepted weights are right, but an entry is skipped. Vertex 1 joins through the edge of weight 2, so the entry <code>[6, 0, 1]</code> pushed at the start is still in the heap. It is popped before the edge of weight 7 and skipped.",
        },
        {
          id: "c",
          text: "3, 6, 5, 4, 7, with one popped entry skipped",
          why: "Vertex 1 joins the tree earlier through the edge of weight 2 from vertex 2, which is cheaper than the edge of weight 6 from vertex 0. By the time the entry of weight 6 is popped, vertex 1 is already in the tree and it is skipped.",
        },
        {
          id: "d",
          text: "3, 2, 5, 4, 7, with one popped entry skipped",
          why: "It accepts 0–2 (3), then 2–1 (2), 1–3 (5) and 3–4 (4). The next smallest entry is <code>[6, 0, 1]</code>, whose target is already in the tree, so it is skipped, and then 3–5 (7) is accepted. The total is 21.",
        },
      ],
      answer: "d",
    },
    {
      id: "mst-order-kruskal",
      chapter: "dsa-minimum-spanning-tree",
      level: "advanced",
      skill: "trace",
      pattern: "minimum-spanning-tree",
      section: "kruskal-s-algorithm-sort-every-edge-take-it-if-it-doesn-t-cl",
      kind: "order",
      prompt:
        "<p>Put the steps of <code>kruskalMST</code> in order. Start with the sort, and end with the check on the tree before it is returned. The middle steps repeat for each edge, so list them in the order they happen the first time.</p>",
      items: [
        { id: "sort", text: "Sort the edges by weight, cheapest first." },
        { id: "take", text: "Take the next edge <code>[u, v, w]</code> from the sorted list." },
        {
          id: "roots",
          text: "Ask the union-find for the roots of <code>u</code> and <code>v</code> and see whether they are the same.",
        },
        {
          id: "accept",
          text: "If the roots differ, join the two components and add the edge and its weight to the tree.",
        },
        { id: "check", text: "After the loop, return the tree only if it has n − 1 edges." },
      ],
      why: "The sort comes first, because the loop must meet the cheapest edge first for the greedy choice to be safe. Each edge must be taken before its endpoints can be looked up, and the roots must be compared before deciding whether to join them. The check on the number of edges can only be made once the loop has finished.",
    },
    {
      id: "mst-true-statements",
      chapter: "dsa-minimum-spanning-tree",
      level: "advanced",
      skill: "edge-case",
      pattern: "minimum-spanning-tree",
      section: "why-greedy-is-safe-the-cut-property",
      kind: "multi",
      prompt:
        "<p>Take a connected, undirected, weighted graph with no self-loops. Select every statement that is true.</p>",
      choices: [
        {
          id: "a",
          text: "If all edge weights are distinct, the minimum spanning tree is unique.",
          why: "With distinct weights the exchange argument behind the cut property becomes a strict inequality, so no swap of an edge can give a tree of the same weight, and only one minimum spanning tree remains.",
        },
        {
          id: "b",
          text: "Two different minimum spanning trees of the same graph can have different total weights.",
          why: "Every minimum spanning tree has the smallest possible total weight, so their totals are equal. With tied weights the trees can differ in which edges they use, never in their total.",
        },
        {
          id: "c",
          text: "The lightest edge of the graph belongs to at least one minimum spanning tree.",
          why: "The lightest edge is the cheapest edge crossing any cut that separates its two endpoints, so the cut property puts it in some minimum spanning tree. If several edges tie for lightest, at least one of them is in the tree.",
        },
        {
          id: "d",
          text: "The route between two vertices inside a minimum spanning tree is always a shortest path between them in the graph.",
          why: "The tree minimises the total weight, not any single route. In a triangle with weights 2, 2 and 3 the tree path between the ends of the weight-3 edge costs 4, while the edge itself costs 3.",
        },
        {
          id: "e",
          text: "Adding one edge that is not in a minimum spanning tree to that tree creates exactly one cycle.",
          why: "The tree already connects the edge's two endpoints by exactly one path, and the new edge closes that path into a cycle. No other cycle is formed, since the rest of the tree has no cycle.",
        },
      ],
      answers: ["a", "c", "e"],
    },
    {
      id: "mst-disconnected",
      chapter: "dsa-minimum-spanning-tree",
      level: "advanced",
      skill: "edge-case",
      pattern: "minimum-spanning-tree",
      section: "prim-s-algorithm-grow-one-tree-outward-with-a-heap",
      kind: "single",
      prompt:
        "<p>The graph has 5 vertices and the edges <code>[0, 1, 2]</code>, <code>[1, 2, 3]</code> and <code>[3, 4, 1]</code>, so it is not connected. The last line of both <code>kruskalMST</code> and <code>primMST</code> is changed to <code>return { total, tree }</code> with no check on the number of edges, and Prim starts at vertex 0. What totals do they return?</p>",
      choices: [
        {
          id: "a",
          text: "Both return 6.",
          why: "Kruskal returns 6, but Prim cannot return it. Starting at vertex 0, it only ever reaches vertices 0, 1 and 2, because no edge links them to vertices 3 and 4.",
        },
        {
          id: "b",
          text: "Kruskal returns 6 and Prim returns 5.",
          why: "Kruskal accepts all three edges, a spanning forest of weight 1 + 2 + 3 = 6. Prim fills only the component of vertex 0, accepting weights 2 and 3, and stops when the heap is empty, so its total is 5 and vertices 3 and 4 are silently left out.",
        },
        {
          id: "c",
          text: "Both return 5.",
          why: "Prim returns 5, but Kruskal does not stop at one component. It looks at every edge, so it also accepts the edge from vertex 3 to vertex 4 and returns 6.",
        },
        {
          id: "d",
          text: "Kruskal returns 5 and Prim returns 6.",
          why: "This swaps them. Kruskal never needs a start vertex and gathers the cheapest edges of every component, while Prim can only grow from vertex 0.",
        },
      ],
      answer: "b",
    },
    {
      id: "mst-minimax-route",
      chapter: "dsa-minimum-spanning-tree",
      level: "advanced",
      skill: "recognise",
      pattern: "minimum-spanning-tree",
      section: "why-the-mst-path-is-also-the-minimax-path",
      kind: "single",
      prompt:
        "<p>Hikers want to get from hut A to hut B along a network of trails. Each trail has a steepness, and a route is judged only by its single steepest trail, whatever its length. Which method finds the gentlest route's steepness?</p>",
      choices: [
        {
          id: "a",
          text: "Run Dijkstra's algorithm with each trail's steepness as its length, and read the distance to B.",
          why: "Dijkstra adds the steepness values along a route, so it minimises their sum. A long route of many gentle trails can have a larger sum than a short route with one steep trail, even though its steepest trail is gentler.",
        },
        {
          id: "b",
          text: "Run breadth-first search from A and report the steepest trail on the first route that reaches B.",
          why: "Breadth-first search finds the route with the fewest trails and ignores steepness. The route with the fewest trails can contain a steep one that a longer route avoids.",
        },
        {
          id: "c",
          text: "Add the trails to a union-find from gentlest to steepest until A and B connect; the last trail added is the answer.",
          why: "The path between two vertices inside a minimum spanning tree has the smallest possible heaviest edge. A Kruskal sweep adds edges in the order that builds that tree, so the edge that first joins A and B is the heaviest edge of the best route.",
        },
        {
          id: "d",
          text: "Build a minimum spanning tree and report its total steepness.",
          why: "The total adds up every trail in the tree, not the steepest trail on one route between A and B. The tree is useful, but the answer comes from the path inside it.",
        },
      ],
      answer: "c",
    },
    {
      id: "mst-trace-limited-paths",
      chapter: "dsa-minimum-spanning-tree",
      level: "advanced",
      skill: "trace",
      pattern: "minimum-spanning-tree",
      section: "edge-length-limited-paths-sort-the-queries-too",
      kind: "single",
      prompt:
        "<p>The chapter's <code>distanceLimitedPathsExist</code> runs with 4 vertices:</p><pre><code>distanceLimitedPathsExist(4,\n  [[0, 1, 3], [1, 2, 5], [2, 3, 1], [0, 3, 9]],\n  [[0, 2, 4], [0, 2, 6], [0, 1, 3], [0, 3, 2]])</code></pre><p>What does it return?</p>",
      choices: [
        {
          id: "a",
          text: "[false, true, false, false]",
          why: "Edges are added in order of weight 1, 3, 5, 9, and the queries are processed in order of limit 2, 3, 4, 6. Limits 2, 3 and 4 find no connection: the weight-3 edge is not shorter than 3, and 0 and 2 only meet after the weight-5 edge. Limit 6 joins all four vertices. Stored at their original positions, the answers are false, true, false, false.",
        },
        {
          id: "b",
          text: "[false, true, true, false]",
          why: "That is what the comparison <code>&lt;=</code> would give: the edge of weight 3 would count for the third query. The statement says strictly shorter, and the code compares with <code>&lt;</code>, so that query is false.",
        },
        {
          id: "c",
          text: "[false, false, false, true]",
          why: "This is the list of answers in the order the queries are processed, sorted by limit, and not written back to their original positions. The query with limit 6 is the second one in the input, so its true belongs at index 1.",
        },
        {
          id: "d",
          text: "[true, true, false, false]",
          why: "The first query asks for a path from 0 to 2 using only edges shorter than 4. Only the edges of weights 1 and 3 qualify, and they leave 0 and 2 in different components, so it is false.",
        },
      ],
      answer: "a",
    },
    {
      id: "mst-critical-cost",
      chapter: "dsa-minimum-spanning-tree",
      level: "advanced",
      skill: "complexity",
      pattern: "minimum-spanning-tree",
      section: "critical-and-pseudo-critical-edges",
      kind: "single",
      prompt:
        "<p>The chapter's <code>findCriticalAndPseudoCriticalEdges</code> sorts the E edges once. Then, for every edge, it makes up to two more passes over the sorted list, each with a fresh union-find on V vertices. What is the tightest bound on its worst-case running time?</p>",
      choices: [
        {
          id: "a",
          text: "O(E log E)",
          why: "That is the cost of the one sort, and of a single Kruskal run. The function repeats the linear pass up to 2E more times, once for each test of each edge, so the passes cost far more than the sort.",
        },
        {
          id: "b",
          text: "O(E³)",
          why: "This is an upper bound but not the tightest one. Each pass over the sorted list does E union-find steps of nearly constant cost, so a pass is about E work, not E².",
        },
        {
          id: "c",
          text: "O(V + E)",
          why: "That is the cost of a single traversal of the graph. The function builds a spanning tree from scratch for each edge, so the work is repeated about E times.",
        },
        {
          id: "d",
          text: "O(E² α(V))",
          why: "There are up to 2E + 1 passes, each performing E union-find operations of cost α(V), which is nearly constant. The sort adds only O(E log E), which is smaller. The total is about E² times the tiny inverse-Ackermann factor.",
        },
      ],
      answer: "d",
    },
    {
      id: "mst-second-best-tree-input",
      chapter: "dsa-minimum-spanning-tree",
      level: "advanced",
      skill: "edge-case",
      pattern: "minimum-spanning-tree",
      section: "second-best-mst-one-swap-away",
      kind: "single",
      prompt:
        "<p>The chapter's <code>secondBestMSTWeight</code> receives a connected graph with 4 vertices and exactly 3 edges, <code>[[0, 1, 1], [1, 2, 2], [2, 3, 3]]</code>. What does it return?</p>",
      choices: [
        {
          id: "a",
          text: "6, the weight of the minimum spanning tree.",
          why: "The graph has only one spanning tree, which is the whole edge set, and the function looks for a different one. Returning 6 would claim a second tree of the same weight exists.",
        },
        {
          id: "b",
          text: "<code>null</code>",
          why: "<code>null</code> is returned only when Kruskal cannot connect the vertices. This graph is connected, so the function gets past that check.",
        },
        {
          id: "c",
          text: "<code>Infinity</code>",
          why: "Every edge is in the tree, so the loop over non-tree edges never runs and <code>best</code> keeps its starting value. There is no second spanning tree, and <code>Infinity</code> is how this version reports it.",
        },
        {
          id: "d",
          text: "0",
          why: "Zero would be the weight of an empty tree. The only update in the function, <code>total + w - heaviest</code>, is never evaluated here, so nothing lowers <code>best</code> from its starting value.",
        },
      ],
      answer: "c",
    },
    {
      id: "mst-second-best-tie",
      chapter: "dsa-minimum-spanning-tree",
      level: "advanced",
      skill: "edge-case",
      pattern: "minimum-spanning-tree",
      section: "second-best-mst-one-swap-away",
      kind: "single",
      prompt:
        "<p>A triangle has three edges of weight 1 each. Using the swap formula <code>total + w(e) - heaviestOnPath</code> for the one non-tree edge, what weight does the chapter's version report for the second-best spanning tree?</p>",
      choices: [
        {
          id: "a",
          text: "3, because the second-best tree must be strictly heavier than the minimum, and all three edges together weigh 3.",
          why: "That is a different version of the problem, and the three edges together are not a tree. The chapter's code allows ties, and every spanning tree of this triangle has two edges, so none weighs 3.",
        },
        {
          id: "b",
          text: "2, the same as the minimum: swapping in the third edge gives another tree of weight 2.",
          why: "The minimum spanning tree weighs 2. The non-tree edge has weight 1 and the heaviest edge on its path is also 1, so the candidate is 2 + 1 - 1 = 2. A different tree of the same weight is a valid second-best tree when ties are allowed.",
        },
        {
          id: "c",
          text: "1, because the non-tree edge replaces two edges at once.",
          why: "A swap replaces exactly one edge. Removing two edges and adding one would leave the vertices disconnected, and a spanning tree of three vertices always has two edges.",
        },
        {
          id: "d",
          text: "No second-best tree exists, because every spanning tree here has the same weight.",
          why: "The trees are different sets of edges, and under the definition used here a different tree of equal weight counts. Only a graph that is itself a tree has no other spanning tree at all.",
        },
      ],
      answer: "b",
    },
    {
      id: "mst-boruvka-pick",
      chapter: "dsa-minimum-spanning-tree",
      level: "advanced",
      skill: "recognise",
      pattern: "minimum-spanning-tree",
      section: "boruvka-s-algorithm-every-component-grabs-its-cheapest-edge",
      kind: "single",
      prompt:
        "<p>In one round of Boruvka's algorithm, a component C looks at every edge with exactly one end inside C and picks the cheapest. Which statement about that edge is true?</p>",
      choices: [
        {
          id: "a",
          text: "It is the cheapest edge in the whole graph.",
          why: "It is only the cheapest edge leaving C. Another component can have a cheaper outgoing edge, and the cheapest edge of the whole graph is just one of the picks made in the round.",
        },
        {
          id: "b",
          text: "It belongs to every minimum spanning tree of the graph, because it is the cheapest edge leaving C.",
          why: "When another edge leaving C has the same weight, a minimum spanning tree can use that edge instead. The picked edge is guaranteed to be in some minimum spanning tree, not in all of them.",
        },
        {
          id: "c",
          text: "No other component can pick the same edge, since each edge has only one owner.",
          why: "The edge has two ends, so the component at the other end can pick it too. That is why the merge step checks with the union-find before adding its weight, or the edge would be counted twice.",
        },
        {
          id: "d",
          text: "It belongs to some minimum spanning tree, as the cheapest edge across the cut around C.",
          why: "This is the cut property applied to the cut formed by C and everything else. With tied weights the picks need a consistent tie-break so that the picks of one round cannot disagree.",
        },
      ],
      answer: "d",
    },
    {
      id: "mst-order-second-best",
      chapter: "dsa-minimum-spanning-tree",
      level: "advanced",
      skill: "trace",
      pattern: "minimum-spanning-tree",
      section: "second-best-mst-one-swap-away",
      kind: "order",
      prompt: "<p>Put the steps of <code>secondBestMSTWeight</code> in the order the function performs them.</p>",
      items: [
        {
          id: "build",
          text: "Run Kruskal, marking which edges are in the tree and building the tree's adjacency lists.",
        },
        {
          id: "path",
          text: "For one non-tree edge <code>(u, v)</code>, walk the tree from <code>u</code> to <code>v</code> and find the heaviest edge on the way.",
        },
        { id: "swap", text: "Compute the swap weight <code>total + w - heaviest</code> for that edge." },
        { id: "min", text: "Keep the smallest swap weight seen over all non-tree edges and return it." },
      ],
      why: "The tree has to exist before any path in it can be walked, and the heaviest edge on the path has to be known before the swap weight can be computed. The minimum can only be returned after every non-tree edge has been tried.",
    },
  ],
  pattern: {
    pattern: "minimum-spanning-tree",
    chapter: "dsa-minimum-spanning-tree",
    signals: [
      "The prompt asks to connect every node at the minimum total cost of cables, roads, pipes or links.",
      "The graph is undirected and weighted, and no start or end node is named.",
      "Nodes also have a standalone cost, such as digging a well, next to the connection costs.",
      "The prompt asks to minimise the heaviest edge on a route between two nodes.",
      "Points on a plane are given, and the cost between any two is their distance.",
    ],
    template:
      "<pre><code>edges.sort((a, b) =&gt; a[2] - b[2]);\nfor (const [u, v, w] of edges) {\n  if (dsu.union(u, v)) {\n    total += w;\n    if (++used === n - 1) break;\n  }\n}</code></pre>",
    time: "O(E log E) for Kruskal, O(E log V) for Prim with a heap, O(V²) for Prim without one",
    space: "O(V) for Kruskal's union-find, O(E) for Prim's lazy heap",
    styles: ["online-assessment", "phone-screen", "onsite"],
  },
};
