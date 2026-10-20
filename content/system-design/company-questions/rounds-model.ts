import type { RoundType } from "./rounds";

export interface AskedModel {
  a: string;
  link?: { href: string; label: string };
}

export const ASKED_MODEL: Readonly<Record<RoundType, AskedModel[]>> = {
  oa: [
    {
      a: "Read the constraints first, because they point to the technique. If n is 100,000, an O(n^2) scan will time out, so look for a hash map, two pointers on a sorted array, or a window that moves forward only. Sketch the brute force, find the repeated work, then remove it. For two-sum style pairs you might say: I store each value's index as I scan, so the complement lookup is O(1) and the whole pass is O(n).",
      link: { href: "/level/dsa", label: "DSA course" },
    },
    {
      a: "Greedy problems hide behind a sort. Ask what ordering makes the locally best choice safe, then try to argue why swapping two adjacent choices never helps. Interval scheduling is the classic case: sort by end time and take every interval that starts after the last chosen one. Check the catch in the constraints, such as overflow, ties or equal values, and test a tiny case by hand before submitting.",
      link: { href: "/level/dsa", label: "DSA course" },
    },
    {
      a: "Decide whether the problem is a graph walk or a recurrence. On a grid, a shortest path with equal step cost is breadth-first search from the start, with a visited set so each cell is processed once, giving O(rows x cols). For dynamic programming, define the state in one sentence, write the transition, set the base cases, then see if only the previous row is needed to save space.",
      link: { href: "/level/dsa", label: "DSA course" },
    },
    {
      a: "Start from the table that holds the thing being counted, join the others on their keys, filter rows with WHERE, group, then filter groups with HAVING. Remember that WHERE runs before grouping and HAVING after. Use LEFT JOIN when rows with no match must still appear, and COUNT of a column rather than star when nulls matter. Example: customers with more than three orders is GROUP BY customer_id HAVING COUNT(*) > 3.",
      link: { href: "/databases", label: "Databases" },
    },
    {
      a: "These reward quick, accurate recall rather than long reasoning, so revise the short list of definitions that recur. Know the difference between a process and a thread, the four ACID properties, what an index trades for faster reads, TCP against UDP, and the four pillars of OOP. Eliminate two wrong options first, then choose. Do not spend more than a minute on any single question, and flag it to return to if time remains.",
      link: { href: "/mock", label: "Mock interviews" },
    },
  ],
  phone: [
    {
      a: "Give a two minute spine, not a life story: who you are now, the one or two projects that matter most, and why this role is the next step. Pick the best project and state the problem, your part, the technology and one measurable result. Keep every claim something you can defend if the next question digs in. You could open with: I am a backend engineer, and the project I am proudest of is the one where I cut checkout latency.",
      link: { href: "/interview/r1", label: "Screening call chapter" },
    },
    {
      a: "The listener wants to know whether your reason is specific and sincere, not flattery. Name one or two real things about the product, the engineering problems or the team that you have looked at, then connect them to something you have done or want to learn. Why now should be about your growth, not escaping your current job. An opening could be: I have used the product, and the scaling problem it describes is the kind I want to work on.",
      link: { href: "/interview/r1", label: "Screening call chapter" },
    },
    {
      a: "Give the facts that are true and keep the negotiation for later. State your notice period exactly as your contract says, and mention whether it can be shortened or bought out only if that is real. For compensation, say you would like to understand the role and level first, or give a researched range rather than a single anchor. Never invent a current figure. If you are asked directly, answer honestly and calmly.",
      link: { href: "/interview/r12", label: "HR and the number chapter" },
    },
    {
      a: "Treat it as a short version of the full coding round. Repeat the problem back, ask about input size and edge cases, state a plan before typing, and talk while you code. For a language question, such as what a closure is or how a hash map handles collisions, give a one line definition and a tiny example. A good line is: first I will do the simple approach so we have something correct, then improve it.",
      link: { href: "/interview/r1tp", label: "Tech phone screen chapter" },
    },
  ],
  dsa: [
    {
      a: "Name the pattern from the shape of the question. Pairs with a target use a hash map of seen values. A contiguous range with a condition uses a sliding window that grows on the right and shrinks on the left, so each element enters and leaves once, giving O(n). Range sums over many queries use a prefix sum array so each query is O(1) after O(n) setup. Count characters with a fixed-size array or map.",
      link: { href: "/level/dsa", label: "DSA course" },
    },
    {
      a: "For an LRU cache, combine a hash map from key to node with a doubly linked list ordered by recency. Get moves the node to the front, put inserts at the front, and when over capacity you remove the tail node and its map entry. Both operations are O(1), and you say why: the map finds the node, the list reorders it without a scan. For stacks, mention a monotonic stack for next greater element.",
      link: { href: "/level/dsa", label: "DSA course" },
    },
    {
      a: "Decide the traversal from what is asked. Level by level or shortest path in an unweighted graph is BFS with a queue. Exploring all paths, components or cycles is DFS. A dependency order is topological sort: Kahn's algorithm repeatedly removes nodes with in-degree zero, and leftover nodes mean a cycle. Weighted shortest path with non-negative edges is Dijkstra with a heap, O((V + E) log V). On a BST, an in-order walk is sorted.",
      link: { href: "/level/dsa", label: "DSA course" },
    },
    {
      a: "For the K largest items keep a min-heap of size K: push each element and pop the smallest when the heap exceeds K, so the cost is O(n log K) and memory is O(K). For intervals, sort by start, then merge by comparing the next start with the current end. For binary search on the answer, define a yes or no check that is monotonic, such as can ship within D days, and search the capacity range.",
      link: { href: "/level/dsa", label: "DSA course" },
    },
    {
      a: "Define the state in a sentence, write the recurrence, fix the base cases, and decide the order of filling. Start with the recursive version with memoisation, then convert to a table. For 0/1 knapsack, dp[w] is the best value at capacity w, and in the one dimensional form you loop capacity downward so each item is used once. For string problems such as edit distance, the state is a pair of prefix lengths.",
      link: { href: "/level/dsa", label: "DSA course" },
    },
    {
      a: "Treat follow-ups as a chance to show depth, and answer in the same calm order each time. To save space, ask which previous rows or values the recurrence actually reads and keep only those. For streaming input, say what summary you can keep, such as a heap of size K or a running count. For thread safety, name the shared state, guard it with a lock, and keep the critical section short.",
    },
  ],
  "machine-coding": [
    {
      a: "Spend the first ten minutes on requirements and entities, not code. For a parking lot you might list Vehicle, Slot, Ticket and Lot, with slot types as an enum and the allocation rule hidden behind an interface so a nearest-slot strategy can be swapped. Keep the code runnable early, write a small demo in main, and add a few tests. Say what you would add with more time, such as pricing rules.",
      link: { href: "/whiteboard", label: "Whiteboard" },
    },
    {
      a: "The core of expense sharing is a balance ledger: for each pair or each user, store the net amount owed. An expense has a payer, an amount and a split type such as equal, exact or percent, handled by a split strategy per type. Validate that exact splits sum to the total and handle rounding explicitly. To simplify debts, compute each person's net balance and match the largest creditor with the largest debtor.",
    },
    {
      a: "Model the board, players, dice or moves, and a game controller that owns the turn loop, with rules kept out of the board class. For tic-tac-toe, keep counters per row, column and both diagonals, so a win check is O(1) per move instead of scanning the grid. For snake and ladder, store jumps in a map from square to destination. Make board size and number of players configurable rather than hard coded.",
    },
    {
      a: "Start with the public interface and the invariants. For a rate limiter, a token bucket stores tokens and a last refill time per key, refills lazily on each call and allows the request if a token remains. For an LRU or key-value store, say the data structure and the complexity. For a scheduler, a priority queue ordered by run time with a worker that waits for the earliest job.",
    },
    {
      a: "Draw the states and transitions before coding. An elevator is idle, moving up, moving down or doors open, and each event such as a button press or arrival is handled by the current state. A vending machine moves through idle, has money, dispensing and out of stock. Implement it with a state interface or an enum and a transition table, so invalid actions are rejected in one place instead of with scattered if statements.",
    },
    {
      a: "Show that your design bends without a rewrite. For a new rule, say you add a new class that implements the existing interface and register it, leaving old code unchanged. For concurrency, name the shared state and protect it with a lock per resource, or atomic operations, keeping check-and-update in one critical section. For persistence, put a repository interface in front of storage so an in-memory version can be replaced by a database.",
      link: { href: "/mock", label: "Mock interviews" },
    },
  ],
  lld: [
    {
      a: "Begin by listing the nouns and verbs from the requirements, then turn nouns into classes and group verbs by who owns the data. For a booking system you might have Resource, Booking, User and a BookingService, with a rule that two bookings for one resource cannot overlap. Draw relationships clearly: composition when a part cannot exist alone, an interface when behaviour varies. Say which classes you would write first and why.",
      link: { href: "/whiteboard", label: "Whiteboard" },
    },
    {
      a: "Tie each principle to a concrete choice in your design rather than reciting the acronym. Single responsibility: the invoice class does not also send email. Open and closed: add a new payment method by adding a class, not editing a switch. Liskov: a subclass must honour the parent's contract. Interface segregation: small interfaces. Dependency inversion: the service depends on a notifier interface, not on an SMS client.",
    },
    {
      a: "Know the problem each pattern solves. Strategy swaps an algorithm, such as pricing or routing. Observer lets many listeners react to one event, as in notifications. Factory hides which concrete class is created. State moves behaviour into a class per state, as in an order lifecycle. Builder assembles an object with many optional fields. Say when not to use one: a pattern with a single implementation is usually noise.",
    },
    {
      a: "Identify what is shared and mutable, then choose the smallest protection that works. Use a lock around a compound check-then-act, a concurrent map for independent keys, and atomic counters for simple tallies. For operations that may be retried, make them idempotent by carrying a request id and ignoring a repeat. Example: charging a booking twice is prevented by storing the request id with the result and returning it again.",
    },
    {
      a: "Show the design absorbing change. When a new requirement arrives, say which existing abstraction already covers it and which new class you add. If a discount rule appears, add a new implementation of the discount interface and register it. If you must change old code, explain why the original split was wrong and how you would limit the edit. Mention tests: existing tests should still pass unchanged after the extension.",
    },
  ],
  hld: [
    {
      a: "Use one repeatable path: clarify scope and scale, estimate load, define the API, sketch the data model, draw the main components, then probe bottlenecks. For short links, store a mapping from a generated short id to the long url, generate ids with a counter encoded in base 62, cache hot links, and note reads far outnumber writes. For chat, mention persistent connections and a store ordered per conversation.",
      link: { href: "/system-design", label: "System design course" },
    },
    {
      a: "Money systems put correctness before speed. Use a double-entry ledger where entries are append-only and every transfer writes a debit and an equal credit in one transaction. Protect against doubled charges with an idempotency key stored with the result, so a retry returns the original outcome. For lost updates use a database transaction, and reconcile with the payment provider's records on a schedule.",
      link: { href: "/system-design", label: "System design course" },
    },
    {
      a: "Split the problem into location ingestion, a geospatial index and matching. Drivers send updates every few seconds to a write-optimised store, often in memory, keyed by a grid cell such as a geohash or S2 cell. To find nearby drivers, query the rider's cell and its neighbours, then rank by distance and estimated time. Say how you handle a stale location and a driver who accepts two rides.",
      link: { href: "/system-design", label: "System design course" },
    },
    {
      a: "For file sync, split files into chunks, hash each chunk and upload only chunks the server lacks, so a small edit transfers a small amount. Keep metadata in a database and chunks in object storage. For video, upload the original, transcode into several resolutions, store segments and serve them through a content delivery network with adaptive bitrate streaming, so the player switches quality as bandwidth changes.",
      link: { href: "/system-design", label: "System design course" },
    },
    {
      a: "Treat each as a tool with a cost. A cache cuts read latency but adds staleness and invalidation. Sharding spreads write load but makes cross-shard queries hard. Replication gives availability and read scale but introduces lag. Queues smooth spikes and decouple services but require idempotent consumers. For failures, name timeouts, retries with backoff and a fallback. State what you give up whenever you choose.",
      link: { href: "/system-design", label: "System design course" },
    },
    {
      a: "Estimates are there to choose a design, so finish each one with a decision. Use round numbers: a day has about 100,000 seconds, so 10 million requests a day is roughly 100 per second on average, with a peak of a few times that. Multiply object size by count for storage, and compare against one machine's capacity. If one database handles the load, say so and avoid sharding.",
      link: { href: "/system-design/sysdes-capacity-estimation", label: "Capacity estimation" },
    },
  ],
  cs: [
    {
      a: "A process has its own address space, while threads in one process share memory, so threads are cheaper to create and switch but need synchronisation. A deadlock needs four conditions at once: mutual exclusion, hold and wait, no pre-emption and circular wait. Break any one, for example by taking locks in a fixed order. Virtual memory maps pages to frames, and a page fault loads a missing page from disk.",
      link: { href: "/os", label: "Operating systems" },
    },
    {
      a: "ACID means atomicity, consistency, isolation and durability. Isolation levels trade anomalies for speed: read committed prevents dirty reads, repeatable read also stops a row changing under you, and serializable behaves as if transactions ran one at a time. An index, usually a B-tree, speeds lookups at the cost of slower writes and more space. Normalisation removes duplicated facts, and joins put the pieces back.",
      link: { href: "/dbms", label: "DBMS" },
    },
    {
      a: "TCP is connection-oriented, ordered and reliable, using a three-way handshake of SYN, SYN-ACK and ACK. UDP sends datagrams without those guarantees, so it suits low latency uses such as voice or DNS queries. HTTPS is HTTP over TLS, which adds encryption and server identity. DNS resolves a name to an address through a chain of resolvers. A load balancer spreads requests across servers using a policy such as round robin or least connections.",
      link: { href: "/networks", label: "Networks" },
    },
    {
      a: "Answer with a definition and a small example each time. Polymorphism means one interface with many behaviours, such as a Shape with an area method that each subclass implements. Abstraction hides detail behind a contract. An interface states what, a class states how. Mention that you prefer composition over inheritance when behaviour varies, and tie SOLID to one real choice from your own code.",
    },
    {
      a: "Work from symptom to cause, measuring before changing. For a slow query, run the execution plan, look for a full scan, a missing or unused index, or a bad join order, and check row counts. For a hung process, check whether it uses CPU, is waiting on I/O or a lock, and read a thread dump or stack trace. State the order: reproduce, observe, form one hypothesis, change one thing.",
      link: { href: "/databases", label: "Databases" },
    },
  ],
  sql: [
    {
      a: "Read the schema, decide the grain of the output row, then build the query in that order. Join on keys, filter with WHERE, aggregate with GROUP BY, and filter aggregates with HAVING. Use LEFT JOIN to keep unmatched rows, and a subquery or CTE when a result feeds another step. Example: users who never ordered is a LEFT JOIN on orders with WHERE orders.id IS NULL. Check for duplicate rows after each join.",
      link: { href: "/databases", label: "Databases" },
    },
    {
      a: "A window function computes over related rows without collapsing them. Running total is SUM(amount) OVER (ORDER BY day). For top-N per group, compute ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) in a subquery and keep rows where it is at most N. Know that RANK leaves gaps after ties, DENSE_RANK does not, and ROW_NUMBER breaks ties arbitrarily unless you add a second sort key.",
      link: { href: "/databases", label: "Databases" },
    },
    {
      a: "Start from the entities and how they relate, then decide keys. A payment flow might have users, orders, payments and refunds, with amounts stored as integers in minor units rather than floats, and a status column with allowed values. Add foreign keys, a unique constraint on any idempotency key, and timestamps. Normalise first, then name one place you would denormalise for read speed and why.",
      link: { href: "/dbms", label: "DBMS" },
    },
    {
      a: "Add an index on columns used in filters, joins and sort order, and for a composite index put the equality column first, since the leading column decides usability. An index may not help when the column has few distinct values, the table is small, or the query wraps the column in a function. Read the plan to confirm an index scan rather than a full scan, and compare estimated against actual rows.",
      link: { href: "/databases", label: "Databases" },
    },
    {
      a: "A transaction groups statements so they all apply or none do. Locks and multi-version concurrency control keep concurrent transactions from corrupting each other. Describe the anomalies by level: dirty read, non-repeatable read and phantom read. Example for a transfer: debit and credit in one transaction, with the balance row locked using SELECT FOR UPDATE so two transfers cannot both pass the balance check. Mention deadlocks and retrying.",
      link: { href: "/dbms", label: "DBMS" },
    },
  ],
  domain: [
    {
      a: "Prepare the internals of the stack named in the job, not just usage. For JavaScript, be able to explain closures, the event loop with its microtask queue, and how this is bound. For React, explain rendering, keys, and why state updates are batched. Give a short example with each claim, and say when you do not know a detail rather than guessing. The depth is checked by follow-up questions.",
      link: { href: "/interview/r3", label: "JavaScript and TypeScript chapter" },
    },
    {
      a: "Good API design is predictable. Use clear resource names, correct status codes and a consistent error body with a stable code. A retry is only safe if the operation is idempotent: GET and PUT already are, and for POST accept an idempotency key and return the stored result on repeat. For retries use exponential backoff with jitter and a cap, and only retry errors that can succeed later, such as timeouts or 503.",
      link: { href: "/interview/r5", label: "Node and NestJS chapter" },
    },
    {
      a: "Work from the user-visible symptom inward. Check whether errors or latency rose, when it started and what changed at that time, such as a deploy. Use metrics to find the failing component, logs with a request id to follow one failing request, and traces to find the slow hop. Form one hypothesis, test it, and roll back if a recent release is the likely cause. Say you would write down what you learned afterwards.",
    },
    {
      a: "Know the basic picture and be honest about your depth. A container packages an app with its dependencies and shares the host kernel, unlike a virtual machine. An image is built from layers and run as a container. For deployment, mention a build in CI, an immutable image, configuration through environment variables, health checks and a rollback path. Name one cloud service you have used and what it does.",
      link: { href: "/interview/r9", label: "AWS, Docker and CI/CD chapter" },
    },
    {
      a: "Think about duplicates, ordering and mismatch. A payment provider may send the same callback twice, so store the event id and process each once, making the handler idempotent. Reconciliation compares your records with the provider's settlement report and flags differences for review. For market data, expect out-of-order or missed ticks, so sequence numbers and a way to request a replay matter. Name what you would alert on.",
    },
  ],
  manager: [
    {
      a: "Choose a project you can discuss at every layer. Explain the problem and who it served, the options you considered, why you chose one, what broke and what you would change now. Be clear which parts you did and which the team did. Admitting a flaw earns trust. Opening line: the main constraint was latency, so I chose a cache in front of the database, and I would now add an invalidation strategy.",
      link: { href: "/interview/r10", label: "Resume grilling chapter" },
    },
    {
      a: "Use situation, task, action, result, and keep the disagreement about the work, never the person. The listener is checking that you can hold a view with evidence, listen, and commit once the decision is made. Describe what you proposed, the data or reasoning you used, how you reached agreement or accepted the other path, and what happened. Do not invent a story: use a real one, even a small one.",
      link: { href: "/interview/r11", label: "Behavioural chapter" },
    },
    {
      a: "Show a method rather than a claim of being busy. Describe how you judge impact and deadline, ask who needs the result and when, and say no or renegotiate scope early when two things clash. Mention communicating the trade-off to stakeholders so nobody is surprised. A sentence you could adapt: I list what is blocking others first, then what has a fixed date, then what moves a metric.",
      link: { href: "/interview/r11", label: "Behavioural chapter" },
    },
    {
      a: "Answer honestly and tie it to what the role offers. Say what you want to learn or own next, such as larger systems, more ownership of design, or mentoring, and what kind of team helps you do it. Then ask what the team is trying to achieve this year and how the work is reviewed. The listener checks that your wishes match the job and that you have thought about it.",
    },
  ],
  behavioral: [
    {
      a: "Use situation, task, action and result, spending most of the time on what you did. For a failure, own your part, say what you learned and show a concrete change that you kept, such as a checklist or a test. For a conflict, show you listened and focused on the goal. The listener checks honesty and growth. Start plainly: the situation was a release that slipped, and my part in it was an estimate I did not revisit.",
      link: { href: "/interview/r11", label: "Behavioural chapter" },
    },
    {
      a: "The theme is influence without a title. Pick a real example where you persuaded others, taught a teammate or raised a risk early. Describe how you built agreement, with data, a small proof or a one page proposal, and what changed afterwards. Raising a hard issue means doing it early, privately where fitting, and with a suggested fix. Do not present someone else's work as your own.",
      link: { href: "/interview/r11", label: "Behavioural chapter" },
    },
    {
      a: "Interviewers check how you decide when facts are missing. Describe how you reduced the unknowns: asked who could answer, ran a small experiment, chose the reversible option, and set a point to review. Explain what you decided, what risk you accepted, and the outcome, including if it turned out wrong. A fitting opening: nobody could tell us the real traffic, so I proposed a two week trial before committing.",
      link: { href: "/interview/r11", label: "Behavioural chapter" },
    },
    {
      a: "Show that you understand who uses the work. Pick a real example where you looked at user feedback, support tickets or usage data and changed what you built, even when the ticket asked for something narrower. Describe the extra step you took, why it mattered to the user, and the result. The listener checks initiative and that it is grounded in evidence, not just effort.",
      link: { href: "/interview/r11lp", label: "Leadership principles chapter" },
    },
  ],
  hr: [
    {
      a: "Be honest and avoid giving a single number too early. Share your current pay only if you are comfortable, and make clear what is fixed and what is variable. For expectations, say you are flexible for the right role, and offer a researched range based on level and market. If pushed, state a figure you can justify. Never state a number you cannot support, because offers are often checked.",
      link: { href: "/interview/r12", label: "HR and the number chapter" },
    },
    {
      a: "Give the facts exactly as they are in your contract. State the notice period, whether early release or a buy-out is truly possible, and the earliest honest joining date. Do not promise a date your employer has not agreed to. For relocation, say whether you can move, how soon, and whether you would need support. Clear, early information helps the recruiter plan and shows you are reliable.",
      link: { href: "/interview/r12", label: "HR and the number chapter" },
    },
    {
      a: "Keep it positive and forward looking. Talk about what you want more of, such as larger scale, ownership or a stronger team, rather than criticising your current employer. The listener checks that you will not leave this job for the same reason. Opening line: I have learned a lot in the current role, and I now want to work on problems at a bigger scale.",
    },
    {
      a: "Ask for the structure rather than only the total. Find out the level and title, base salary, bonus and whether it is guaranteed, equity amount, vesting schedule and cliff, joining bonus and any clawback. Compare offers on a yearly total with the same assumptions. If equity is in a private company, ask how it is valued and what happens on leaving. Asking calmly is normal and expected.",
      link: { href: "/interview/r12lv", label: "Levels and equity chapter" },
    },
  ],
  "bar-raiser": [
    {
      a: "Prepare a handful of real stories and be ready to map each to more than one principle. Choose the story that fits the principle being probed. Use situation, task, action and result, speak in the first person about what you did, and include a measurable result where you have one. The listener checks that your behaviour matches the principle, not that you know its name.",
      link: { href: "/interview/r11lp", label: "Leadership principles chapter" },
    },
    {
      a: "Expect repeated why and how questions on one story, to separate your own work from the team's. Know the details: the dates, the numbers, the alternatives you rejected, and who disagreed. Say we only when it is true, and I when it is you. If you do not remember a figure, say so and give your best estimate. Consistent detail is persuasive; invented detail collapses under the next question.",
      link: { href: "/interview/r11lp", label: "Leadership principles chapter" },
    },
    {
      a: "This is a shorter check that your technical level is real. Treat it like any design or coding question: clarify, state assumptions, give a simple solution first, then discuss trade-offs and failure cases. The listener looks for judgement, such as knowing what to leave out and when to be careful. Explaining your reasoning aloud matters more than a perfect final design.",
      link: { href: "/system-design", label: "System design course" },
    },
  ],
  "take-home": [
    {
      a: "Read the brief twice and list what is required and what is optional. Fetch with a timeout and handle failures and bad status codes, stream or read a large file in a way that fits memory, and parse defensively. Keep the report format exactly as requested. Separate fetching, processing and output into small functions so they can be tested, and note your assumptions in the README.",
      link: { href: "/interview/r1th", label: "Take-home round chapter" },
    },
    {
      a: "Keep the scope small and the quality high. A clear README should explain how to install, run and test it, and list the decisions you made. Validate input, return helpful errors and use consistent status codes or exit codes. Add tests for the main path and two or three edge cases. A tidy small project is better than a half-finished large one.",
      link: { href: "/interview/r1th", label: "Take-home round chapter" },
    },
    {
      a: "Be ready to list your shortcuts yourself, and say what you would do with more time. For example, there is no pagination, the input is fully read into memory, and there are no integration tests, and each shortcut has a reason. This shows judgement rather than weakness. Know every line of your code and be ready to change it live.",
    },
  ],
  loop: [
    {
      a: "Treat each coding round as separate, since interviewers rarely see each other's notes before deciding. Keep the same routine every time: clarify, discuss brute force, improve, code, test with an example, state complexity. If you stall, say what you are thinking and ask for a hint rather than going silent. A weak round can be balanced by strong ones, so do not let one error affect the next.",
      link: { href: "/level/dsa", label: "DSA course" },
    },
    {
      a: "Mid-level and senior candidates are often asked to design a system end to end. Lead the conversation: confirm requirements, estimate scale, propose a simple design, then deepen the part with the most risk. Explain trade-offs aloud and mention failure handling and monitoring. Expect the interviewer to change a requirement to see how your design adapts.",
      link: { href: "/system-design", label: "System design course" },
    },
    {
      a: "Prepare real stories for ownership, conflict, failure, ambiguity and working with others, and reshape them to the question. Use situation, task, action and result with a measurable outcome where one exists. The listener checks judgement, honesty and how you treat others. Keep each answer to around two minutes, and have a story ready for something that went wrong.",
      link: { href: "/interview/r11", label: "Behavioural chapter" },
    },
    {
      a: "Plan for stamina. Drink water, eat something light, and use breaks to reset rather than replay the last round. Each interviewer writes feedback on their own, so a mistake in one round does not carry into the next. Ask each interviewer a real question about their work at the end, and keep a short note of names and topics for your thank-you message.",
    },
  ],
};
