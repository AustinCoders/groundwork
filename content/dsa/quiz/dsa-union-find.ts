import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "uf-live-group-count",
      chapter: "dsa-union-find",
      level: "advanced",
      skill: "recognise",
      pattern: "union-find",
      section: "the-one-question-it-answers-and-why-bfs-isn-t-good-enough",
      placement: true,
      kind: "single",
      prompt:
        "<p>A social app starts with up to 200,000 people and no friendships. Friendships are added one at a time, and after each addition you must report how many separate friend groups exist. Which approach fits?</p>",
      choices: [
        {
          id: "a",
          text: "After each friendship, run a BFS from every person not yet reached and count how many searches it took.",
          why: "It is correct, but every addition costs a full pass over the people and the friendships, which is O(V + E). With 200,000 additions that is far too slow.",
        },
        {
          id: "b",
          text: "Keep a union-find over the people with a group counter that drops whenever a friendship joins two different groups.",
          why: "Each friendship is one <code>union</code>, which costs almost constant amortised time. The counter drops only when the two people were in different sets, so the group count is ready after every addition.",
        },
        {
          id: "c",
          text: "Read all the friendships first, run one DFS, and print its component count after every friendship.",
          why: "One DFS over the finished graph gives only the final number of groups. It cannot say how many groups there were after the first, second or third friendship.",
        },
        {
          id: "d",
          text: "Store a 200,000 by 200,000 table of who is friends with whom, and count the rows that have no friends.",
          why: "That table has 4 × 10<sup>10</sup> cells, too many to store. Counting the rows with no friends would also count lone people, not groups.",
        },
      ],
      answer: "b",
    },
    {
      id: "uf-same-set-test",
      chapter: "dsa-union-find",
      level: "advanced",
      skill: "recognise",
      pattern: "union-find",
      section: "the-production-dsu-memorize-this-one",
      placement: true,
      kind: "single",
      prompt:
        "<p>A <code>DSU</code> built as in the chapter, with union by size and path compression, is used like this. Which expression correctly says that elements 1 and 3 are in the same set?</p><pre><code>const dsu = new DSU(4);\ndsu.union(0, 1);\ndsu.union(2, 3);\ndsu.union(0, 2);</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>dsu.parent[1] === dsu.parent[3]</code>",
          why: "Here <code>parent[1]</code> is 0 and <code>parent[3]</code> is 2, because 3 hangs under 2 and 2 under 0. The two elements are connected, yet this test says false: it compares one step up, not the roots.",
        },
        {
          id: "b",
          text: "<code>dsu.size[1] === dsu.size[3]</code>",
          why: "Both entries happen to be 1 here, but size is only meaningful at a root, and elements of different sets can hold equal numbers. Sizes say nothing about which set an element is in.",
        },
        {
          id: "c",
          text: "<code>dsu.find(1) === 3</code>",
          why: "<code>find</code> returns a root, and 3 is not a root, since it hangs under 2. This compares one element's root with another element instead of with that element's root.",
        },
        {
          id: "d",
          text: "<code>dsu.find(1) === dsu.find(3)</code>",
          why: "Two elements are in the same set exactly when they have the same root. Here both roots are 0. The chapter's <code>connected</code> method is this test.",
        },
      ],
      answer: "d",
    },
    {
      id: "uf-directed-cycle",
      chapter: "dsa-union-find",
      level: "advanced",
      skill: "recognise",
      pattern: "union-find",
      section: "cycle-detection-and-redundant-connection",
      placement: true,
      kind: "single",
      prompt:
        "<p>A team checks prerequisites for circular dependencies with the chapter's <code>DSU</code>. Each pair <code>[a, b]</code> means that a must come before b, and the loop does <code>if (!dsu.union(a, b)) return true;</code> to report a cycle. What does it do for <code>[[1, 2], [2, 3], [1, 3]]</code>?</p>",
      choices: [
        {
          id: "a",
          text: "It reports a cycle although there is none, because 1 and 3 are already connected when the third pair arrives.",
          why: "<code>union(1, 3)</code> returns false, since 1 and 3 are already in one set through 2. But every pair points forward along 1, 2, 3, so there is a valid order. Union-find ignores direction. For directed graphs use a DFS with three colours or Kahn's algorithm.",
        },
        {
          id: "b",
          text: "It reports no cycle, since every pair points the same way along 1, 2, 3 and nothing loops back.",
          why: "The third pair joins two elements that are already in the same set, so <code>union</code> returns false and the function reports a cycle. The report is wrong, not absent.",
        },
        {
          id: "c",
          text: "It reports a cycle, and that is right, because the three elements end up in one connected set.",
          why: "Being connected is not a cycle in a directed graph. The pairs 1 to 2, 2 to 3 and 1 to 3 all point forward, so the order 1, 2, 3 satisfies all of them.",
        },
        {
          id: "d",
          text: "It misses a cycle that exists, because union-find cannot see the direction of the pairs.",
          why: "There is no cycle to miss here. In general a directed cycle also shows up as an undirected one, so union-find would not miss it: the danger is the false alarm.",
        },
      ],
      answer: "a",
    },
    {
      id: "uf-size-only-find",
      chapter: "dsa-union-find",
      level: "advanced",
      skill: "complexity",
      pattern: "union-find",
      section: "the-two-optimizations-that-change-the-complexity-class",
      kind: "single",
      prompt:
        "<p>A union-find on <code>n</code> elements uses union by size but <em>no</em> path compression. What is the tightest bound on the <em>worst-case time of a single <code>find</code></em>?</p>",
      choices: [
        {
          id: "a",
          text: "O(1)",
          why: "Without compression nothing flattens the trees, so a <code>find</code> walks up to the root, which can take several steps. The depth is bounded, but not by a constant.",
        },
        {
          id: "b",
          text: "O(α(n))",
          why: "That is the amortised cost per operation when path compression is used as well. Without compression, the bound on one find is logarithmic.",
        },
        {
          id: "c",
          text: "O(log n)",
          why: "A node gets deeper only when its tree is hung under one at least as large, so the set that contains it at least doubles each time. That can happen at most log<sub>2</sub> n times, so every element is within about log<sub>2</sub> n steps of its root, and merging equal trees pairwise can reach that depth.",
        },
        {
          id: "d",
          text: "O(n)",
          why: "That is the naive version, where a chain of n elements can build up. Hanging the smaller tree under the larger one stops that from happening.",
        },
      ],
      answer: "c",
    },
    {
      id: "uf-total-cost",
      chapter: "dsa-union-find",
      level: "advanced",
      skill: "complexity",
      pattern: "union-find",
      section: "why-the-combination-is-nearly-o-1-the-intuition",
      kind: "single",
      prompt:
        "<p>A union-find with both union by size and path compression runs a sequence of <code>m</code> <code>union</code> and <code>find</code> operations on <code>n</code> elements, where <code>m</code> is at least <code>n</code>. Which is the tightest bound for the total time that the chapter gives?</p>",
      choices: [
        {
          id: "a",
          text: "O(m · n)",
          why: "That is the naive cost, where each operation can walk a chain of length n. The two optimisations exist to avoid it.",
        },
        {
          id: "b",
          text: "O(m log n)",
          why: "This is a valid upper bound, and it is the per-operation cost of union by size alone. With path compression added the total is lower, so it is not the tightest.",
        },
        {
          id: "c",
          text: "O(n log n)",
          why: "This leaves out m. When m is much larger than n log n, the m operations alone take more time than that, so it cannot be an upper bound.",
        },
        {
          id: "d",
          text: "O(m · α(n))",
          why: "α is the inverse Ackermann function. Union by size limits how tall the trees grow and compression flattens what each find walks, and together the amortised cost per operation is α(n), at most 4 for any n you could store.",
        },
      ],
      answer: "d",
    },
    {
      id: "uf-accounts-time",
      chapter: "dsa-union-find",
      level: "advanced",
      skill: "complexity",
      pattern: "union-find",
      section: "accounts-merge-union-find-on-things-that-aren-t-integers",
      kind: "single",
      prompt:
        "<p>The chapter's <code>accountsMerge</code> receives accounts that hold <code>E</code> email addresses in total. Treat each <code>Map</code> operation and each comparison of two emails as constant time. What is the tightest bound on its <em>worst-case time</em>?</p>",
      choices: [
        {
          id: "a",
          text: "O(E · α(E))",
          why: "That covers the unions and the map work, but the function also sorts the emails of every group, and a sort by comparison costs more than that when a group is large.",
        },
        {
          id: "b",
          text: "O(E log E)",
          why: "The unions and map operations cost about E · α(E). The final sorts cost at most E log E in total, because the groups hold at most E emails between them, and a single big group reaches that. The sort dominates.",
        },
        {
          id: "c",
          text: "O(E<sup>2</sup>)",
          why: "That would be comparing every email with every other. The code finds groups through a map and unions instead, and sorts at most E items in total.",
        },
        {
          id: "d",
          text: "O(E)",
          why: "Building the sets is almost linear, but sorting a group of k emails by comparison needs on the order of k log k comparisons in the worst case, so the whole function cannot be linear in general.",
        },
      ],
      answer: "b",
    },
    {
      id: "uf-trace-parent",
      chapter: "dsa-union-find",
      level: "advanced",
      skill: "trace",
      pattern: "union-find",
      section: "the-production-dsu-memorize-this-one",
      kind: "single",
      prompt:
        "<p>The chapter's <code>DSU</code> uses union by size, and when two sizes are equal the first argument's root stays the root. What is <code>dsu.parent</code> after these calls?</p><pre><code>const dsu = new DSU(6);\ndsu.union(0, 1);\ndsu.union(2, 3);\ndsu.union(3, 1);\ndsu.union(4, 5);\ndsu.union(5, 0);\ndsu.find(5);</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>[2, 0, 2, 2, 4, 4]</code>",
          why: "That is the array after the fourth call. The fifth call still has to join the group of 0, 1, 2 and 3 to the group of 4 and 5.",
        },
        {
          id: "b",
          text: "<code>[2, 0, 2, 2, 2, 4]</code>",
          why: "That is the array right after the fifth <code>union</code>, before <code>find(5)</code> runs. Element 5 still points at 4, and the final <code>find</code> climbs 5, 4, 2 and re-points 5 at the root.",
        },
        {
          id: "c",
          text: "<code>[2, 0, 2, 2, 2, 2]</code>",
          why: "The root is 2. Element 1 still hangs under 0, because no find has climbed through it, while <code>find(5)</code> re-points 5 straight at 2.",
        },
        {
          id: "d",
          text: "<code>[2, 2, 2, 2, 2, 2]</code>",
          why: "That would need a find that climbs through 1 as well. Path compression rewrites only the nodes on the path of the find that runs, and <code>find(5)</code> never visits 1.",
        },
      ],
      answer: "c",
    },
    {
      id: "uf-order-find",
      chapter: "dsa-union-find",
      level: "advanced",
      skill: "trace",
      pattern: "union-find",
      section: "the-two-optimizations-that-change-the-complexity-class",
      kind: "order",
      prompt:
        "<p>Put the parts of the iterative <code>find(x)</code> with path compression in the order they run, for an element that is not the root. Start with the climb to the root and end with the return.</p>",
      items: [
        {
          id: "climb",
          text: "Start with <code>root = x</code> and climb with <code>root = this.parent[root]</code> until <code>this.parent[root] === root</code>.",
        },
        {
          id: "test",
          text: "Back at <code>x</code>, check that <code>this.parent[x] !== root</code>, and save <code>next = this.parent[x]</code>.",
        },
        { id: "point", text: "Set <code>this.parent[x] = root</code>." },
        { id: "move", text: "Move on with <code>x = next</code>." },
        { id: "return", text: "Return <code>root</code>." },
      ],
      why: "The root has to be known before any node is re-pointed. In each round of the second loop the old parent must be saved before <code>parent[x]</code> is overwritten, and <code>x</code> then moves on using the saved value, because after the overwrite <code>parent[x]</code> is the root, not the next node.",
    },
    {
      id: "uf-components-edge",
      chapter: "dsa-union-find",
      level: "advanced",
      skill: "edge-case",
      pattern: "union-find",
      section: "number-of-connected-components-the-counter-does-the-work",
      kind: "single",
      prompt:
        "<p>What does the chapter's <code>countComponents(6, edges)</code> return for <code>edges = [[0, 1], [1, 2], [2, 0], [3, 3], [4, 5], [5, 4]]</code>?</p>",
      choices: [
        {
          id: "a",
          text: "<code>3</code>",
          why: "The sets are {0, 1, 2}, {3} and {4, 5}. Only <code>0-1</code>, <code>1-2</code> and <code>4-5</code> join different sets, so <code>components</code> drops from 6 to 3. The edges <code>2-0</code>, <code>3-3</code> and <code>5-4</code> make <code>union</code> return false and change nothing.",
        },
        {
          id: "b",
          text: "<code>0</code>",
          why: "Starting from 6 components and removing one per edge would give 0, but that arithmetic holds only if every edge joins two different sets. A cycle edge, a self-loop and a repeated edge do not lower the count.",
        },
        {
          id: "c",
          text: "<code>2</code>",
          why: "Element 3 appears only in a self-loop, but it is still a component of its own. A self-loop joins nothing, and it does not remove the element.",
        },
        {
          id: "d",
          text: "<code>4</code>",
          why: "That would mean only two successful unions. The edges <code>0-1</code>, <code>1-2</code> and <code>4-5</code> each join two different sets, which is three.",
        },
      ],
      answer: "a",
    },
    {
      id: "uf-same-name",
      chapter: "dsa-union-find",
      level: "advanced",
      skill: "edge-case",
      pattern: "union-find",
      section: "accounts-merge-union-find-on-things-that-aren-t-integers",
      kind: "single",
      prompt:
        '<p>The chapter\'s <code>accountsMerge</code> unions accounts that share an email. How many accounts does it return for this input?</p><pre><code>[\n  ["Sam", "s1@m", "s2@m"],\n  ["Kim", "k1@m"],\n  ["Sam", "s3@m"],\n  ["Sam", "s2@m", "s4@m"],\n]</code></pre>',
      choices: [
        {
          id: "a",
          text: "<code>4</code>",
          why: "That is no merging at all. The first and the fourth accounts share <code>s2@m</code>, so they become one account.",
        },
        {
          id: "b",
          text: "<code>3</code>",
          why: "The accounts holding <code>s1@m</code>, <code>s2@m</code> and <code>s4@m</code> merge into one Sam, Kim stays alone, and the Sam with only <code>s3@m</code> shares no email with anyone, so it is a separate account.",
        },
        {
          id: "c",
          text: "<code>2</code>",
          why: "That is what merging on the name gives: the three accounts named Sam collapse into one account even though <code>s3@m</code> shares no email with the others. Only emails identify an account.",
        },
        {
          id: "d",
          text: "<code>1</code>",
          why: "Kim has no email in common with anyone, so her account stays separate. A single account would mean merging unrelated people.",
        },
      ],
      answer: "b",
    },
    {
      id: "uf-fit-multi",
      chapter: "dsa-union-find",
      level: "advanced",
      skill: "recognise",
      pattern: "union-find",
      section: "recognizing-it-in-an-unseen-problem",
      kind: "multi",
      prompt: "<p>Select every task for which union-find is a good tool.</p>",
      choices: [
        {
          id: "a",
          text: "Cells of a grid turn from water to land one at a time, and after each one you must report the number of islands.",
          why: "Each new land cell is at most four unions with its land neighbours, and the running counter gives the number of islands at once. This is the case where union-find beats a fresh search each time.",
        },
        {
          id: "b",
          text: "Find the fewest steps between two people in an unweighted friendship graph, with the path itself.",
          why: "Union-find only knows whether two elements are in the same set. It keeps no paths and no distances, so a BFS is the tool for fewest steps.",
        },
        {
          id: "c",
          text: "Decide whether an undirected list of edges contains a cycle, checking the edges one at a time.",
          why: "An undirected edge closes a cycle exactly when its two ends are already in the same set, which is when <code>union</code> returns false.",
        },
        {
          id: "d",
          text: "Produce an order in which all of the courses can be taken, given a list of prerequisite pairs.",
          why: "Prerequisites are directed, and union-find ignores direction. An ordering of a directed graph is a job for topological sort.",
        },
      ],
      answers: ["a", "c"],
    },
    {
      id: "uf-stones-elements",
      chapter: "dsa-union-find",
      level: "advanced",
      skill: "recognise",
      pattern: "union-find",
      section: "most-stones-removed-make-the-rows-and-columns-the-elements",
      kind: "single",
      prompt:
        "<p>Stones lie on integer grid points with coordinates up to 10<sup>4</sup>. A stone can be removed when another stone shares its row or column. To count the stones that can be removed with union-find, what should be the elements?</p>",
      choices: [
        {
          id: "a",
          text: "The stones, comparing every pair of stones for a shared row or column.",
          why: "That works but costs O(S<sup>2</sup>) pair checks. Making the lines the elements avoids comparing pairs.",
        },
        {
          id: "b",
          text: "The cells of a 10<sup>4</sup> by 10<sup>4</sup> grid.",
          why: "That is 10<sup>8</sup> cells, far more than there are stones. Nearly all of them would be empty and are never needed.",
        },
        {
          id: "c",
          text: "The rows and the columns, with each stone joining its row to its column.",
          why: "A group of linked stones is exactly a connected set of rows and columns. Each group leaves one stone, so the answer is stones minus groups, found in near-linear time.",
        },
        {
          id: "d",
          text: "Only the rows, since a column is determined by its stones.",
          why: "Two stones in different rows can still be linked through a shared column. Without column elements those links are lost.",
        },
      ],
      answer: "c",
    },
    {
      id: "uf-ratio-compress",
      chapter: "dsa-union-find",
      level: "advanced",
      skill: "trace",
      pattern: "union-find",
      section: "weighted-union-find-evaluate-division",
      kind: "single",
      prompt:
        "<p>In the weighted union-find, <code>ratio[x]</code> is value(x) / value(parent of x). Currently <code>a</code> points at <code>b</code> with <code>ratio[a] = 2</code>, and <code>b</code> points at the root <code>c</code> with <code>ratio[b] = 3</code>. After <code>find(a)</code> with path compression, <code>a</code> points at <code>c</code>. What is <code>ratio[a]</code> now?</p>",
      choices: [
        {
          id: "a",
          text: "5",
          why: "That adds the two ratios. Ratios compose by multiplication: (a / b) · (b / c) = a / c.",
        },
        {
          id: "b",
          text: "6",
          why: "value(a) / value(c) = (value(a) / value(b)) · (value(b) / value(c)) = 2 · 3 = 6.",
        },
        {
          id: "c",
          text: "2",
          why: "That is the old ratio to <code>b</code>. After re-pointing at <code>c</code> it has to be a ratio to <code>c</code>, which includes the step from <code>b</code> to <code>c</code>.",
        },
        {
          id: "d",
          text: "2 / 3",
          why: "That divides where it should multiply. The ratio from a to c is the product of the ratios along the path.",
        },
      ],
      answer: "b",
    },
    {
      id: "uf-parity-triangle",
      chapter: "dsa-union-find",
      level: "advanced",
      skill: "edge-case",
      pattern: "union-find",
      section: "parity-union-find-possible-bipartition",
      kind: "single",
      prompt:
        "<p>Three people 1, 2 and 3 all dislike each other, and the parity union-find processes the pairs (1,2), (2,3) and (3,1) in that order. What happens on the third pair?</p>",
      choices: [
        {
          id: "a",
          text: "The roots differ, so the sets are merged and the answer stays true.",
          why: "After the first two pairs, 1, 2 and 3 are already in one set, so the roots are the same on the third pair.",
        },
        {
          id: "b",
          text: "The roots are the same and their parities already differ, so the pair is accepted.",
          why: "1 is opposite 2 and 2 is opposite 3, so 1 and 3 are on the same side: their parities are equal, not different.",
        },
        {
          id: "c",
          text: "The roots are the same and the parities are equal, so the function returns false.",
          why: "1 and 3 end up on the same side but must be on opposite sides. This contradiction is how an odd cycle of dislikes shows up.",
        },
        {
          id: "d",
          text: "The find loops forever on the cycle 1, 2, 3.",
          why: "The structure is a forest of parent pointers, never a cycle. A cycle in the input only produces a contradiction in the parities.",
        },
      ],
      answer: "c",
    },
    {
      id: "uf-redundant-two-parents",
      chapter: "dsa-union-find",
      level: "advanced",
      skill: "edge-case",
      pattern: "union-find",
      section: "redundant-connection-ii-directed-union-find-carefully",
      kind: "single",
      prompt:
        "<p>A rooted tree had one extra directed edge added. The edges are <code>[2,1] [3,1] [4,2] [1,4]</code>. Node 1 has two parents (2 and 3). Skipping the later edge <code>[3,1]</code> and running union-find on the rest, <code>[1,4]</code> fails because 1, 4 and 2 are already connected. Which edge should be removed?</p>",
      choices: [
        {
          id: "a",
          text: "[3,1], the later of the two edges into node 1.",
          why: "Without it the cycle 1 → 4 → 2 → 1 is still there, so the remainder is not a tree.",
        },
        {
          id: "b",
          text: "[1,4], the edge that failed in the union-find.",
          why: "Removing it breaks the cycle, but node 1 still has two parents, so the result is still not a rooted tree.",
        },
        {
          id: "c",
          text: "[2,1], the earlier of the two edges into node 1.",
          why: "The cycle passes through [2,1], and node 1 has two parents. Removing [2,1] fixes both problems at once and leaves a tree.",
        },
        {
          id: "d",
          text: "[4,2], because it is the middle edge of the cycle.",
          why: "Removing it breaks the cycle but leaves node 1 with two parents, so the result is not a rooted tree.",
        },
      ],
      answer: "c",
    },
    {
      id: "uf-bricks-backwards",
      chapter: "dsa-union-find",
      level: "advanced",
      skill: "recognise",
      pattern: "union-find",
      section: "offline-union-find-play-time-backwards-bricks-falling-when-h",
      kind: "single",
      prompt:
        "<p>A grid of bricks loses one brick per hit, and after each hit you must report how many bricks lose their connection to the top row. Why is it natural to process the hits in reverse with union-find?</p>",
      choices: [
        {
          id: "a",
          text: "Union-find runs faster when the hits are read from the last one to the first.",
          why: "Direction of reading has no effect on its speed. The reason is what the structure can do.",
        },
        {
          id: "b",
          text: "In reverse, each hit becomes adding a brick, and union-find can add connections but not remove them.",
          why: "Starting from the grid after all hits and putting bricks back one by one needs only unions. The growth of the set connected to the top measures what had fallen.",
        },
        {
          id: "c",
          text: "The grid can then be stored in a smaller table, since fallen bricks need no cell.",
          why: "The table has the same size either way. The reversal changes the operations, not the storage.",
        },
        {
          id: "d",
          text: "Reverse order avoids the need for a virtual roof node in the structure.",
          why: "The roof node is still needed in reverse, to represent the top row as one set. Without it you cannot measure the size of what is attached to the top.",
        },
      ],
      answer: "b",
    },
    {
      id: "uf-factor-time",
      chapter: "dsa-union-find",
      level: "advanced",
      skill: "complexity",
      pattern: "union-find",
      section: "largest-component-size-by-common-factor-union-through-shared",
      kind: "single",
      prompt:
        "<p>To find the largest group of numbers that share factors, each number is split by trial division into primes and merged with the first number that had each prime. For N numbers of value at most M, what is the time?</p>",
      choices: [
        {
          id: "a",
          text: "O(N<sup>2</sup> log M)",
          why: "That is the cost of computing a gcd for every pair of numbers. Linking through primes avoids all pairs.",
        },
        {
          id: "b",
          text: "O(N · M)",
          why: "Trial division stops at the square root of a number, so one number costs about √M steps, not M.",
        },
        {
          id: "c",
          text: "O(N · √M) plus near-constant work per union",
          why: "Each number needs up to about √M trial divisions, and it has at most a handful of distinct primes, each causing one union of near-constant amortised cost.",
        },
        {
          id: "d",
          text: "O(N log N)",
          why: "That would be the cost of sorting the array. The trial division per number depends on the size of the values, not just on how many there are.",
        },
      ],
      answer: "c",
    },
    {
      id: "uf-islands-count",
      chapter: "dsa-union-find",
      level: "advanced",
      skill: "trace",
      pattern: "union-find",
      section: "number-of-islands-ii-when-land-keeps-appearing",
      kind: "single",
      prompt:
        "<p>On a 3 × 3 grid of water, cells are turned into land in the order (0,0), (0,2), (1,1), (0,1). How many islands exist after the last cell?</p>",
      choices: [
        {
          id: "a",
          text: "1",
          why: "(0,1) touches (0,0), (0,2) and (1,1), which were three separate islands. The new cell joins them all into one island.",
        },
        {
          id: "b",
          text: "2",
          why: "That is the count after the second cell. The third and fourth cells change it further: (1,1) adds an island and (0,1) merges three of them.",
        },
        {
          id: "c",
          text: "3",
          why: "That is the count after (1,1), before the fourth cell connects the three islands.",
        },
        {
          id: "d",
          text: "4",
          why: "That is what you get by adding 1 for the new cell and forgetting to subtract one for each successful union with a neighbour.",
        },
      ],
      answer: "a",
    },
  ],
  pattern: {
    pattern: "union-find",
    chapter: "dsa-union-find",
    signals: [
      "The prompt talks about connected, groups, merging, the same network or accounts of one person.",
      "Edges arrive over time, and the connectivity question is asked again after each one.",
      "An undirected edge that closes a loop has to be found or skipped.",
      "Related items must be merged into one group, and the relation carries over: if a goes with b and b with c, then a goes with c.",
    ],
    template:
      "<pre><code>const dsu = new DSU(n);\nfor (const [a, b] of pairs) dsu.union(a, b);\nreturn dsu.components;</code></pre>",
    time: "O(m · α(n)) for m operations on n elements, which is almost linear",
    space: "O(n)",
    styles: ["online-assessment", "phone-screen", "onsite"],
  },
};
