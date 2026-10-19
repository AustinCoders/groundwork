import type { CompanyAccent } from "./types";

export type RoundType =
  | "oa"
  | "phone"
  | "dsa"
  | "machine-coding"
  | "lld"
  | "hld"
  | "cs"
  | "sql"
  | "domain"
  | "manager"
  | "behavioral"
  | "hr"
  | "bar-raiser"
  | "take-home"
  | "loop";

export interface RoundKind {
  id: RoundType;
  label: string;
  short: string;
  what: string;
  asked: string[];
  book: string[];
  topics: { href: string; label: string }[];
  accent: CompanyAccent;
  icon: string;
}

export const ROUND_KINDS: Readonly<Record<RoundType, RoundKind>> = {
  oa: {
    id: "oa",
    label: "Online assessment",
    short: "OA",
    what: "A timed test on a coding platform, taken alone. Usually two or three coding problems, sometimes with multiple-choice questions on CS basics, aptitude or SQL.",
    asked: [
      "Array and string problems that need a hash map, two pointers or a sliding window",
      "Greedy and sorting problems with a catch in the constraints",
      "A medium dynamic programming or graph-on-a-grid problem",
      "SQL queries with joins and group by",
      "Multiple-choice questions on OOP, operating systems, databases and networks",
    ],
    book: ["r1oa"],
    topics: [{ href: "/level/dsa", label: "DSA course" }],
    accent: "grey",
    icon: "timer",
  },
  phone: {
    id: "phone",
    label: "Recruiter or phone screen",
    short: "Screen",
    what: "A short call that decides whether you move on. Part resume and motivation, sometimes one easy coding or fundamentals question in a shared editor.",
    asked: [
      "Walk me through your resume and your best project",
      "Why this company and why now",
      "Notice period, location and compensation expectations",
      "One easy or medium coding question, or a language fundamentals question",
    ],
    book: ["r1", "r1tp"],
    topics: [],
    accent: "grey",
    icon: "phone",
  },
  dsa: {
    id: "dsa",
    label: "Data structures and algorithms",
    short: "DSA",
    what: "A live coding round of 45 to 60 minutes with one or two problems. You are judged on how you clarify, reason, code, test and state the complexity, not on the answer alone.",
    asked: [
      "Arrays, strings and hashing: pairs, windows, frequency counts, prefix sums",
      "Linked lists, stacks and queues, including design-a-structure problems such as an LRU cache",
      "Trees and BSTs, graphs (BFS, DFS, topological sort, shortest paths) and grids",
      "Heaps and top-K, intervals, binary search on the answer",
      "Dynamic programming from one dimension up to knapsack and string DP",
      "Follow-ups: optimise space, handle streaming input, make it thread-safe",
    ],
    book: ["r7"],
    topics: [{ href: "/level/dsa", label: "DSA course" }],
    accent: "blue",
    icon: "braces",
  },
  "machine-coding": {
    id: "machine-coding",
    label: "Machine coding",
    short: "Machine coding",
    what: "You build a small working system in your own editor in 60 to 120 minutes, then walk through it. Clean entities, extensibility, a runnable demo and tests matter more than clever algorithms.",
    asked: [
      "Parking lot, library or inventory system with several entity types",
      "Splitwise-style expense sharing, a wallet or a ledger",
      "Snake and ladder, tic-tac-toe, chess or another game engine",
      "An in-memory cache, key-value store, rate limiter or job scheduler",
      "Elevator, vending machine or ATM as a state machine",
      "Follow-ups: add a new rule without rewriting, make it concurrent, add persistence",
    ],
    book: [],
    topics: [],
    accent: "teal",
    icon: "blocks",
  },
  lld: {
    id: "lld",
    label: "Low-level design",
    short: "LLD",
    what: "An object-oriented design discussion: classes, interfaces, relationships and the patterns that keep them flexible. Often combined with machine coding.",
    asked: [
      "Class design for a booking system, a notification service or a payment module",
      "SOLID principles applied to your own classes",
      "Strategy, observer, factory, state and builder patterns, and when each helps",
      "Concurrency inside the design: locks, thread-safe collections, idempotent operations",
      "Extending the design for a new requirement without breaking old code",
    ],
    book: [],
    topics: [],
    accent: "teal",
    icon: "blocks",
  },
  hld: {
    id: "hld",
    label: "System design",
    short: "System design",
    what: "A 45 to 60 minute discussion of how to build a system at scale: requirements, numbers, APIs, data model, components, bottlenecks and trade-offs.",
    asked: [
      "Short links, chat, news feed, notifications, search, rate limiting",
      "Payments, wallets and ledgers where money must never be lost or doubled",
      "Ride matching, maps and anything with live location",
      "File storage and sync, video streaming and content delivery",
      "Fundamentals: caching, sharding, replication, queues, consistency, failure handling",
      "Back-of-envelope estimates and what they decide",
    ],
    book: ["r8"],
    topics: [{ href: "/system-design", label: "System design course" }],
    accent: "purple",
    icon: "diagram",
  },
  cs: {
    id: "cs",
    label: "CS fundamentals",
    short: "CS basics",
    what: "Questions on the subjects every engineer is expected to know: operating systems, databases, networks and object-oriented programming. Common for campus and early-career hiring.",
    asked: [
      "Process vs thread, scheduling, deadlocks, virtual memory",
      "ACID, isolation levels, indexes, normalization, joins",
      "TCP vs UDP, the TCP handshake, HTTP and HTTPS, DNS, load balancing",
      "OOP: polymorphism, abstraction, interfaces, SOLID",
      "How would you debug a slow query or a hung process",
    ],
    book: ["r6"],
    topics: [
      { href: "/os", label: "Operating systems" },
      { href: "/dbms", label: "DBMS" },
      { href: "/networks", label: "Networks" },
    ],
    accent: "orange",
    icon: "chip",
  },
  sql: {
    id: "sql",
    label: "SQL and databases",
    short: "SQL",
    what: "Writing queries and reasoning about schemas: joins, aggregation, window functions, indexing, transactions and how to speed a query up.",
    asked: [
      "Joins, group by, having and subqueries on a small schema",
      "Window functions: rank, running totals, top-N per group",
      "Schema design for your own project or a payment flow",
      "Indexes: what to add, when it does not help, how to read an execution plan",
      "Transactions, locks and isolation levels",
    ],
    book: ["r6"],
    topics: [
      { href: "/databases", label: "Databases" },
      { href: "/dbms", label: "DBMS" },
    ],
    accent: "orange",
    icon: "database",
  },
  domain: {
    id: "domain",
    label: "Role-specific deep dive",
    short: "Deep dive",
    what: "Depth in the skills the job needs: a language or framework, APIs, debugging, cloud basics, or the company's own domain such as payments or trading.",
    asked: [
      "Language and framework internals for the role (JavaScript, React, Node, Java and so on)",
      "API design, error handling, idempotency and retries",
      "Debugging a failing service from logs and metrics",
      "Cloud, containers and deployment basics",
      "Domain scenarios: duplicate callbacks, reconciliation, market data",
    ],
    book: ["r3", "r4", "r5", "r9"],
    topics: [],
    accent: "yellow",
    icon: "wrench",
  },
  manager: {
    id: "manager",
    label: "Hiring manager",
    short: "Manager",
    what: "A conversation about your past work and how you would fit the team: depth on projects, ownership, decisions and trade-offs, sometimes a design problem.",
    asked: [
      "Pick a project and go deep: why this design, what broke, what you would change",
      "A time you disagreed with a teammate or pushed back on a decision",
      "How you prioritise when everything is urgent",
      "What you want from the next role and the team",
    ],
    book: ["r10", "r11"],
    topics: [],
    accent: "purple",
    icon: "chat",
  },
  behavioral: {
    id: "behavioral",
    label: "Behavioural round",
    short: "Behavioural",
    what: "Story-based questions about how you work. Prepare a few real stories you can reshape: the situation, your action and the result, with numbers where you have them.",
    asked: [
      "A conflict, a failure, a deadline you missed and what you changed",
      "Leading without authority, mentoring, raising a hard issue",
      "Ambiguity: a time you had to decide with little information",
      "Customer or user focus, and an example of going beyond the brief",
    ],
    book: ["r11", "r11lp"],
    topics: [],
    accent: "purple",
    icon: "chat",
  },
  hr: {
    id: "hr",
    label: "HR and offer",
    short: "HR",
    what: "The closing conversation: motivation, expectations, notice period, compensation and how the offer is structured. Prepared answers and a clear number help here.",
    asked: [
      "Current and expected compensation, and how to answer without boxing yourself in",
      "Notice period, joining date and relocation",
      "Why you are leaving and what you are looking for",
      "Levels, equity and how the offer is built",
    ],
    book: ["r12", "r12lv"],
    topics: [],
    accent: "yellow",
    icon: "handshake",
  },
  "bar-raiser": {
    id: "bar-raiser",
    label: "Bar raiser",
    short: "Bar raiser",
    what: "An independent interviewer from outside the hiring team who judges you against the company's leadership principles, with the power to hold the bar.",
    asked: [
      "Stories mapped to leadership principles such as ownership and customer obsession",
      "Deep follow-ups on every claim in a story: what exactly you did, what the numbers were",
      "A technical or design question to confirm the level",
    ],
    book: ["r11lp", "r11"],
    topics: [],
    accent: "purple",
    icon: "flag",
  },
  "take-home": {
    id: "take-home",
    label: "Take-home or practical task",
    short: "Take-home",
    what: "A small program or service to build on your own time, reviewed for correctness, clarity, tests and how you explain your choices.",
    asked: [
      "Fetch data over HTTP, process a file and produce a report",
      "A small API or CLI with a README, tests and sensible error handling",
      "Follow-up discussion of every shortcut you took",
    ],
    book: ["r1th"],
    topics: [],
    accent: "grey",
    icon: "package",
  },
  loop: {
    id: "loop",
    label: "Onsite loop",
    short: "Loop",
    what: "Several interviews back to back in one day or across a couple of days: coding, design, behavioural and a hiring-manager conversation.",
    asked: [
      "Two or more coding rounds with different interviewers",
      "A system design round for mid-level and senior candidates",
      "A behavioural or values round",
      "A short break between rounds: each interviewer decides independently",
    ],
    book: ["r7", "r8", "r11"],
    topics: [],
    accent: "blue",
    icon: "layers",
  },
};

export const ROUND_ORDER: readonly RoundType[] = [
  "oa",
  "phone",
  "dsa",
  "machine-coding",
  "lld",
  "hld",
  "cs",
  "sql",
  "domain",
  "manager",
  "behavioral",
  "bar-raiser",
  "take-home",
  "loop",
  "hr",
];
