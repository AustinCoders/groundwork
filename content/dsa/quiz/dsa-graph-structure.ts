import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "gs-recognise-starting-pages",
      chapter: "dsa-graph-structure",
      level: "advanced",
      skill: "recognise",
      pattern: "strongly-connected",
      section: "condensation-collapse-each-component-into-one-vertex",
      placement: true,
      kind: "single",
      prompt:
        "<p>A site has thousands of pages and one-way links between them, and some links form loops. You want the smallest set of pages such that following links from them reaches every page. Which plan finds it?</p>",
      choices: [
        {
          id: "a",
          text: "Take every page that no link points to, since nothing else can reach it.",
          why: "On a graph without cycles this is right. With loops it can leave pages out: a group of pages that link only to each other and are linked from outside has no page of in-degree 0 to choose, and if nothing outside links to the group, none of its pages has in-degree 0 either, so the group is never reached.",
        },
        {
          id: "b",
          text: "Run a breadth-first search from page 0 and report the pages it misses, then add those.",
          why: "A search from one page only shows what that page reaches. The pages it misses may reach each other and may need several starts, so the missed list is not the answer.",
        },
        {
          id: "c",
          text: "Find the strongly connected components, then take one page from each one that no outside link enters.",
          why: "Collapsing each component gives a graph without cycles. A component with no edge entering it can only be reached from inside itself, so it needs a start, and one start per such component is enough because every other component is reachable from one of them.",
        },
        {
          id: "d",
          text: "Topologically sort the pages and take the first one in the order, since it comes before all the others.",
          why: "A topological order exists only when there are no cycles, and the problem says there are loops. Even on a graph without cycles, the first page in the order reaches only what is downstream of it, not necessarily every page.",
        },
      ],
      answer: "c",
    },
    {
      id: "gs-recognise-single-failure",
      chapter: "dsa-graph-structure",
      level: "advanced",
      skill: "recognise",
      pattern: "strongly-connected",
      section: "bridges-and-articulation-points",
      placement: true,
      kind: "single",
      prompt:
        "<p>A network has n servers and two-way cables. List every cable whose failure alone would leave some pair of servers that could talk before unable to talk. Which approach runs in O(n + cables)?</p>",
      choices: [
        {
          id: "a",
          text: "Remove each cable in turn and count the connected components again to see whether it changed.",
          why: "This is correct but costs O(cables) searches of O(n + cables) each, so it is far too slow for large inputs. It is the brute force the low-link idea replaces.",
        },
        {
          id: "b",
          text: "Add the cables to a union-find and report every cable that joins two sets that were already joined together.",
          why: "Those are the cables that close a cycle, which are the opposite of critical: a cable on a cycle can fail without splitting anything.",
        },
        {
          id: "c",
          text: "Run Dijkstra from one server and report all the cables that the shortest paths use.",
          why: "Shortest-path cables are not the same as cables that cannot be replaced. A cable on a cycle can sit on a shortest path and still be skipped when it fails.",
        },
        {
          id: "d",
          text: "Run one DFS that stamps each server with its discovery time and tracks the lowest time reachable from its subtree.",
          why: "A tree edge from u to its child v is critical exactly when nothing in v's subtree reaches u or above it, that is when low[v] is greater than tin[u]. One traversal decides every cable.",
        },
      ],
      answer: "d",
    },
    {
      id: "gs-recognise-every-ticket",
      chapter: "dsa-graph-structure",
      level: "advanced",
      skill: "recognise",
      pattern: "strongly-connected",
      section: "reconstruct-itinerary-hierholzer-with-lexical-order",
      placement: true,
      kind: "single",
      prompt:
        "<p>You are given a list of one-way tickets between cities and must plan a trip from a fixed start city that uses every ticket exactly once, choosing the alphabetically smallest such trip. What kind of problem is this?</p>",
      choices: [
        {
          id: "a",
          text: "A shortest-path problem between two cities, solved with breadth-first search.",
          why: "The trip is not about the fewest tickets between two cities. Every ticket has to be used, so the length of the trip is fixed by the input.",
        },
        {
          id: "b",
          text: "A topological sort of the cities, because the tickets are directed and run one way.",
          why: "Cities can repeat and the tickets can form loops, so there is no ordering of cities that all tickets respect.",
        },
        {
          id: "c",
          text: "An Euler path in a directed multigraph, found with Hierholzer's algorithm, smallest destination first.",
          why: "Each ticket is an edge that must be used once, which is the definition of an Euler path. Hierholzer's stack walk saves dead ends for the end of the trip, and trying destinations in order gives the smallest result.",
        },
        {
          id: "d",
          text: "A minimum spanning tree over the cities, using the tickets as weighted edges between cities.",
          why: "A spanning tree uses only enough edges to connect the vertices. Here every ticket must be used, including ones that would close a cycle.",
        },
      ],
      answer: "c",
    },
    {
      id: "gs-recognise-many-ancestor-queries",
      chapter: "dsa-graph-structure",
      level: "advanced",
      skill: "recognise",
      pattern: "strongly-connected",
      section: "binary-lifting-lca-and-the-kth-ancestor",
      kind: "single",
      prompt:
        '<p>A rooted tree has about 100,000 nodes and may be shaped like a long line. You must answer 100,000 queries of the form "what is the lowest common ancestor of u and v?". Which approach fits?</p>',
      choices: [
        {
          id: "a",
          text: "For each query, walk both nodes up one parent at a time until the two walks meet.",
          why: "On a line-shaped tree a query can walk tens of thousands of steps, and with 100,000 queries the total reaches billions of steps.",
        },
        {
          id: "b",
          text: "Precompute a table of 2<sup>j</sup>-th ancestors, lift the deeper node, then jump both from the longest jump.",
          why: "The table costs O(n log n) once, and each query then needs O(log n) jumps, however deep the tree is.",
        },
        {
          id: "c",
          text: "Run a fresh recursive search of the whole tree for each query, from the root.",
          why: "Each search costs O(n), so 100,000 queries cost about 10<sup>10</sup> steps, and on a line-shaped tree the recursion can also overflow the call stack.",
        },
        {
          id: "d",
          text: "Sort the node numbers and binary search for the answer in the sorted list.",
          why: "Node numbers carry no order that matches ancestry in a general tree, so a sorted list of them cannot locate a common ancestor.",
        },
      ],
      answer: "b",
    },
    {
      id: "gs-scc-cost",
      chapter: "dsa-graph-structure",
      level: "advanced",
      skill: "complexity",
      pattern: "strongly-connected",
      section: "tarjan-deriving-the-low-link-value",
      kind: "single",
      prompt: "<p>What is the time of Tarjan's algorithm on a directed graph with V vertices and E edges, and why?</p>",
      choices: [
        {
          id: "a",
          text: "O(V · E), because every edge is compared with every vertex that is on the stack.",
          why: "Edges are not compared with the stack. Each edge is examined once and the stack test is a single array lookup in <code>onStack</code>.",
        },
        {
          id: "b",
          text: "O(V + E), because each vertex is pushed and popped once and each edge is examined once.",
          why: "The DFS visits each vertex once, each adjacency entry is read once, and popping a component removes each vertex from the stack exactly once.",
        },
        {
          id: "c",
          text: "O(V log V), because the components are found by sorting the vertices by their <code>low</code> values.",
          why: "Nothing is sorted. The values <code>tin</code> and <code>low</code> are assigned in the order the DFS meets the vertices.",
        },
        {
          id: "d",
          text: "O(V<sup>2</sup>), because each time a component is popped the whole stack might be scanned again.",
          why: "A pop removes elements from the top down to the root and stops there, and every element is removed only once overall, so the total over all pops is V.",
        },
      ],
      answer: "b",
    },
    {
      id: "gs-lifting-cost",
      chapter: "dsa-graph-structure",
      level: "advanced",
      skill: "complexity",
      pattern: "strongly-connected",
      section: "binary-lifting-lca-and-the-kth-ancestor",
      kind: "single",
      prompt:
        "<p>The binary lifting table of a tree with n nodes has one row for each power of two below n. What is its size and the time to build it?</p>",
      choices: [
        {
          id: "a",
          text: "O(n) entries, built in O(n).",
          why: "A single row has n entries, but there is a row for every power of two up to n, so the table is larger than one row.",
        },
        {
          id: "b",
          text: "O(n log n) entries, built in O(n log n), each row from the one before.",
          why: "There are about log₂ n rows of n entries each, and each entry is two lookups into the previous row.",
        },
        {
          id: "c",
          text: "O(n<sup>2</sup>) entries, because every node stores all of its ancestors.",
          why: "Storing all ancestors would give n entries per node on a line-shaped tree. Lifting stores only the ancestors at distances 1, 2, 4, 8 and so on.",
        },
        {
          id: "d",
          text: "O(n log n) entries, built in O(n log<sup>2</sup> n), because every entry is found by a binary search.",
          why: "An entry is one lookup in the previous row, not a search, so each row costs O(n) and the whole build is O(n log n).",
        },
      ],
      answer: "b",
    },
    {
      id: "gs-trace-low-values",
      chapter: "dsa-graph-structure",
      level: "advanced",
      skill: "trace",
      pattern: "strongly-connected",
      section: "bridges-and-articulation-points",
      kind: "single",
      prompt:
        "<p>The chapter's <code>findBridges</code> runs on <code>n = 4</code> with edges <code>[[0, 1], [1, 2], [2, 0], [2, 3]]</code>, starting its DFS at vertex 0 and taking neighbours in the order the edges were listed. Which describes the final <code>low</code> array and the result?</p>",
      choices: [
        {
          id: "a",
          text: "<code>low = [0, 0, 0, 3]</code> and the bridges are <code>[[2, 3]]</code>.",
          why: "Vertex 2 has a back edge to vertex 0, so low[2] = 0 and that value passes up to vertex 1. Vertex 3 reaches nothing earlier, so low[3] = 3, which is greater than tin[2] = 2, and only edge 2-3 is a bridge.",
        },
        {
          id: "b",
          text: "<code>low = [0, 1, 2, 3]</code> and every edge is a bridge.",
          why: "These are the discovery times, not the low values. The edge from 2 back to 0 lowers low[2] and, through the tree edges, low[1].",
        },
        {
          id: "c",
          text: "<code>low = [0, 0, 0, 0]</code> and there is no bridge.",
          why: "Vertex 3 has only the edge to vertex 2, so nothing in its subtree reaches a vertex discovered earlier. Its low stays 3.",
        },
        {
          id: "d",
          text: "<code>low = [0, 0, 0, 3]</code> and the bridges are <code>[[0, 1], [1, 2], [2, 3]]</code>.",
          why: "The low values are right but the bridges are not. Edges 0-1 and 1-2 lie on the triangle 0-1-2 and have low[child] no greater than tin[parent], so they are not bridges.",
        },
      ],
      answer: "a",
    },
    {
      id: "gs-trace-component-order",
      chapter: "dsa-graph-structure",
      level: "advanced",
      skill: "trace",
      pattern: "strongly-connected",
      section: "tarjan-deriving-the-low-link-value",
      kind: "single",
      prompt:
        "<p>Tarjan's algorithm runs on <code>n = 4</code> with edges <code>[[0, 1], [1, 2], [2, 1], [1, 3]]</code>, starting at vertex 0. In which order does it emit the components?</p>",
      choices: [
        {
          id: "a",
          text: "{0}, then {1, 2}, then {3}",
          why: "That is the topological order, which Kosaraju produces. Tarjan emits a component when its root finishes, and the root of the last-reached part finishes first.",
        },
        {
          id: "b",
          text: "{3}, then {2, 1}, then {0}",
          why: "Vertex 3 finishes first and is its own root, so it is popped alone. Vertex 1 finishes next with low = tin = 1, and the stack above it holds 2, so {2, 1} is popped. Vertex 0 comes last.",
        },
        {
          id: "c",
          text: "{2, 1}, then {3}, then {0}",
          why: "Vertex 3 is discovered and finished inside the call for vertex 1, before vertex 1 itself finishes, so its component is emitted before {2, 1}.",
        },
        {
          id: "d",
          text: "{0, 1, 2, 3} as a single component",
          why: "No edge returns to vertex 0 and none leaves 3, so those two vertices are not on a cycle with the rest.",
        },
      ],
      answer: "b",
    },
    {
      id: "gs-root-rule-edge",
      chapter: "dsa-graph-structure",
      level: "advanced",
      skill: "edge-case",
      pattern: "strongly-connected",
      section: "bridges-and-articulation-points",
      kind: "single",
      prompt:
        "<p>A teammate's cut-vertex code applies the test <code>low[v] &gt;= tin[u]</code> to every vertex, including the DFS root, and has no separate rule for it. The graph is a single edge <code>[[0, 1]]</code>. What does the code return?</p>",
      choices: [
        {
          id: "a",
          text: "<code>[]</code>",
          why: "Removing either endpoint leaves a single vertex, which is still one component, so the true answer is empty. This code does not return it, though: the root test fires.",
        },
        {
          id: "b",
          text: "<code>[0]</code>",
          why: "The root 0 has the smallest tin, so its only child 1 satisfies low[1] = 1 &gt;= tin[0] = 0 and the root is flagged. Removing 0 leaves one vertex, so it is not a cut vertex.",
        },
        {
          id: "c",
          text: "<code>[1]</code>",
          why: "Vertex 1 is a leaf with no children, so the test never fires for it.",
        },
        {
          id: "d",
          text: "<code>[0, 1]</code>",
          why: "Only the vertex with a child can be flagged, and in a single edge that is the root alone.",
        },
      ],
      answer: "b",
    },
    {
      id: "gs-parallel-edge-skip",
      chapter: "dsa-graph-structure",
      level: "advanced",
      skill: "edge-case",
      pattern: "strongly-connected",
      section: "bridges-and-articulation-points",
      kind: "single",
      prompt:
        "<p>A bridge finder skips the parent by vertex (<code>if (v === parent) continue</code>) instead of by edge id. It runs on <code>n = 3</code> with edges <code>[[0, 1], [0, 1], [1, 2]]</code>. What does it report?</p>",
      choices: [
        {
          id: "a",
          text: "Only <code>[1, 2]</code>.",
          why: "That is what the edge-id version reports. Skipping by vertex also skips the second 0-1 edge, so the two cables are treated as one.",
        },
        {
          id: "b",
          text: "Nothing, because the two parallel edges cancel the third.",
          why: "Parallel edges protect each other only; the edge 1-2 is still the single link to vertex 2 and is a bridge either way.",
        },
        {
          id: "c",
          text: "Both <code>[0, 1]</code> and <code>[1, 2]</code>.",
          why: "The second 0-1 edge is skipped as if it were the parent edge, so low[1] stays 1, which is greater than tin[0], and 0-1 is reported as a bridge although either cable alone can fail.",
        },
        {
          id: "d",
          text: "A stack overflow, because the DFS keeps returning to vertex 0.",
          why: "Visited vertices are never entered again, so there is no unbounded recursion. The error is a wrong answer, not a crash.",
        },
      ],
      answer: "c",
    },
    {
      id: "gs-onstack-removed",
      chapter: "dsa-graph-structure",
      level: "advanced",
      skill: "edge-case",
      pattern: "strongly-connected",
      section: "tarjan-deriving-the-low-link-value",
      kind: "single",
      prompt:
        "<p>On the chapter's eight-vertex graph, a teammate deletes the <code>onStack</code> test, so every edge to an already visited vertex does <code>low[u] = Math.min(low[u], tin[v])</code>. What goes wrong?</p>",
      choices: [
        {
          id: "a",
          text: "Nothing, because the test only saves time and never affects the result at all.",
          why: "The test decides whether the edge tells you anything about the current component. Without it an edge into a finished component lowers <code>low</code> wrongly.",
        },
        {
          id: "b",
          text: "{6, 7} merges into {0, 1, 2}, because edge 7→5 into the finished {3, 4, 5} pulls low[7] down.",
          why: "low[7] becomes 5, which makes vertex 6 look as if it can reach an earlier vertex, so it is no longer a root. The pair stays on the stack and is popped with the root 0, giving two components instead of three.",
        },
        {
          id: "c",
          text: "Every vertex ends up as its own component, since no root can be recognised any more.",
          why: "Lowering <code>low</code> makes roots harder to recognise, so components merge. They do not split.",
        },
        {
          id: "d",
          text: "The algorithm runs forever, because the low values keep decreasing without a lower bound.",
          why: "Each edge is examined once and the values only take minimums of existing discovery times, so the run is still O(V + E).",
        },
      ],
      answer: "b",
    },
    {
      id: "gs-multi-euler-circuit",
      chapter: "dsa-graph-structure",
      level: "advanced",
      skill: "recognise",
      pattern: "strongly-connected",
      section: "euler-paths-and-circuits-use-every-edge-once",
      kind: "multi",
      prompt:
        "<p>Select every undirected graph that has an Euler circuit, a closed walk that uses each edge exactly once.</p>",
      choices: [
        {
          id: "a",
          text: "A square: four vertices joined in a cycle.",
          why: "Every vertex has degree 2, which is even, and all edges are in one piece, so the cycle itself is the circuit.",
        },
        {
          id: "b",
          text: "Two triangles with no vertex in common.",
          why: "Every degree is even, but the edges lie in two separate pieces and no single walk can use edges of both.",
        },
        {
          id: "c",
          text: "A triangle with one extra edge leading to a fourth vertex.",
          why: "The vertex where the extra edge joins the triangle and the new end vertex have odd degree. Two odd vertices allow an Euler path, not a circuit.",
        },
        {
          id: "d",
          text: "Two triangles that share one vertex.",
          why: "The shared vertex has degree 4 and all others have degree 2, so every degree is even and the graph is one piece. The walk can go around one triangle and then the other.",
        },
        {
          id: "e",
          text: "A path through three vertices.",
          why: "The two end vertices have degree 1, which is odd, so a closed walk using each edge once is impossible.",
        },
      ],
      answers: ["a", "d"],
    },
    {
      id: "gs-order-hierholzer",
      chapter: "dsa-graph-structure",
      level: "advanced",
      skill: "trace",
      pattern: "strongly-connected",
      section: "hierholzer-building-the-walk",
      kind: "order",
      prompt: "<p>Put the steps of Hierholzer's algorithm for a directed Euler path in order.</p>",
      items: [
        { id: "push", text: "Push the starting vertex on the stack." },
        { id: "look", text: "Look at the vertex on top of the stack." },
        {
          id: "act",
          text: "If it has an unused edge, use it and push the vertex it leads to; otherwise pop the vertex and append it to the route.",
        },
        { id: "loop", text: "Repeat the last two steps until the stack is empty." },
        { id: "reverse", text: "Reverse the route." },
      ],
      why: "The start must be on the stack before there is a top to look at. Each round looks at the top and either extends the walk or finishes a vertex, and the rounds repeat until nothing is left. Vertices are appended only when nothing remains to be done after them, so the route is built from the end of the trail backwards, and the reversal at the end gives the trail itself.",
    },
  ],
  pattern: {
    pattern: "strongly-connected",
    chapter: "dsa-graph-structure",
    signals: [
      "Groups of vertices that can all reach one another in a directed graph, or the fewest starting points that reach everything.",
      "A single edge or vertex whose failure disconnects an undirected network.",
      "Use every edge exactly once, or rebuild a route from its tickets or dominoes.",
      "Many lowest-common-ancestor or kth-ancestor queries on a large tree.",
    ],
    template:
      "<pre><code>tin[u] = low[u] = timer++; for (const v of adj[u]) { if (tin[v] === -1) { dfs(v); low[u] = Math.min(low[u], low[v]); } else if (onStack[v]) low[u] = Math.min(low[u], tin[v]); } if (low[u] === tin[u]) { popComponent(u); }</code></pre>",
    time: "O(V + E)",
    space: "O(V + E)",
    styles: ["phone-screen", "onsite"],
  },
};
