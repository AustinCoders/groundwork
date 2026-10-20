import type { CsSet } from "./cs-types";

export const set: CsSet = {
  id: "dbms",
  title: "Database management systems",
  intro:
    "Database theory questions candidates report from campus and lateral rounds, from normalisation and keys to transactions and indexing. Read the answer, then say it aloud with your own example.",
  themes: [
    {
      id: "design",
      name: "Schema design and normalisation",
    },
    {
      id: "model",
      name: "Keys and the relational model",
    },
    {
      id: "sql",
      name: "SQL behaviour",
    },
    {
      id: "txn",
      name: "Transactions and concurrency",
    },
    {
      id: "perf",
      name: "Indexing, scaling and choosing a store",
    },
  ],
  chapters: [
    {
      href: "/dbms",
      label: "DBMS notes",
    },
  ],
  questions: [
    {
      id: "dbms-normalisation",
      theme: "design",
      q: "What are the normal forms from 1NF to BCNF, and how would you normalise a given table?",
      a: "<p>Normalisation organises tables so each fact is stored once, which removes update, insert and delete anomalies. It works by removing dependencies that should not exist.</p><ul><li><b>1NF</b>: every cell holds one atomic value and there are no repeating groups.</li><li><b>2NF</b>: 1NF, and no non-key column depends on only part of a composite key.</li><li><b>3NF</b>: 2NF, and no non-key column depends on another non-key column (no transitive dependency).</li><li><b>BCNF</b>: for every non-trivial dependency X determines Y, X is a superkey.</li></ul><p>Example: <code>enrolment(student_id, course_id, student_name, course_title)</code> breaks 2NF because the names depend on only half of the key. Split it into <code>student</code>, <code>course</code> and <code>enrolment</code>. The usual follow-up is when you would denormalise on purpose.</p>",
      level: "Core",
      companies: ["microsoft", "uber", "myntra", "atlassian", "amazon", "meesho", "groww", "swiggy", "zomato"],
      evidence: "several",
      sources: [
        {
          label: "Microsoft Interview Experience | Set 59 (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/microsoft-interview-experience-set-59-on-campus/",
          kind: "candidate-report",
        },
        {
          label: "Microsoft Interview Experience | Set 176 (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/microsoft-interview-experience-set-176-on-campus/",
          kind: "candidate-report",
        },
        {
          label: "Microsoft Interview | Set 5 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/microsoft-interview-set-5/",
          kind: "candidate-report",
        },
        {
          label: "Uber Interview Experience | Software Engineer 1 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/uber-interview-experience-software-engineer-1/",
          kind: "candidate-report",
        },
        {
          label: "Myntra Interview Experience | Set 9 (On Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/myntra-interview-experience-set-9-campus/",
          kind: "candidate-report",
        },
        {
          label: "Atlassian On-Campus Interview Experience (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/atlassian-on-campus-interview-experience/",
          kind: "candidate-report",
        },
        {
          label: "Atlassian Interview Experience for SDE (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/atlassian-interview-experience-for-sde-on-campus/",
          kind: "candidate-report",
        },
        {
          label: "Atlassian Interview Experience | On-Campus August 2020 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/atlassian-interview-experience-on-campus-august-2020/",
          kind: "candidate-report",
          year: 2020,
        },
        {
          label: "Amazon Interview Experience For SDE Intern (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-for-sde-intern-8/",
          kind: "candidate-report",
        },
        {
          label: "Meesho Interview Experience for SDE-1 | On-Campus (Virtual) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/meesho-interview-experience-for-sde-1-on-campus-virtual/",
          kind: "candidate-report",
        },
        {
          label: "Groww Interview Experience for Internship (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/groww-interview-experience-for-internship-on-campus/",
          kind: "candidate-report",
        },
        {
          label: "Swiggy Interview Experience for Software Dev Engineer (On-Campus) 2021 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/swiggy-interview-experience-for-software-dev-engineer-on-campus-2021/",
          kind: "candidate-report",
          year: 2021,
        },
        {
          label: "Zomato Interview Experience for SDE (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/zomato-interview-experience-for-sde-3/",
          kind: "candidate-report",
        },
        {
          label: "PhonePe Interview Questions (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/gfg-academy/phonepe-interview-questions/",
          kind: "prep-guide",
        },
        {
          label: "DBMS Interview Questions with Answers (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/dbms/commonly-asked-dbms-interview-questions/",
          kind: "prep-guide",
        },
      ],
    },
    {
      id: "dbms-sql-vs-nosql",
      theme: "perf",
      q: "How do you choose between a SQL and a NoSQL database, for example for a payments system?",
      a: "<p>Relational databases give a fixed schema, joins and multi-row ACID transactions. NoSQL stores (document, key-value, wide-column, graph) trade some of that for a flexible schema and easier horizontal scale, usually by partitioning on a key.</p><p>Choose by access pattern, not fashion:</p><ul><li>Payments, ledgers and inventory suit relational, because correctness across several rows matters more than raw write volume.</li><li>Huge key-based lookups, feeds, sessions and catalogues with varying attributes suit a document or key-value store.</li><li>Ad hoc queries and reporting favour relational; known, narrow access paths favour NoSQL.</li></ul><p>Avoid absolute claims such as NoSQL has no transactions or SQL cannot scale, because many engines blur both lines. The follow-up is usually how you would shard the relational store or keep the NoSQL one consistent.</p>",
      level: "Core",
      companies: ["ola", "phonepe", "microsoft", "meesho", "razorpay", "zomato", "myntra", "atlassian"],
      evidence: "several",
      sources: [
        {
          label: "Ola Interview Experience (1 Year Experienced) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/ola-interview-experience-1-year-experienced/",
          kind: "candidate-report",
        },
        {
          label: "Phonepe Interview Experience for SDE-2 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/phonepe-interview-experience-for-sde-2/",
          kind: "candidate-report",
        },
        {
          label: "Microsoft Interview Experience For SDE -II (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/microsoft-interview-experience-for-sde-ii/",
          kind: "candidate-report",
        },
        {
          label: "Microsoft Interview Experience for SDE - II (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/microsoft-interview-experience-for-sde-ii-4/",
          kind: "candidate-report",
        },
        {
          label: "Meesho Interview Experience for SDE-1 | On-Campus (Virtual) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/meesho-interview-experience-for-sde-1-on-campus-virtual/",
          kind: "candidate-report",
        },
        {
          label: "Razorpay Interview Experience for SDE-1 (On-Campus 2020) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/razorpay-interview-experience-for-sde-1-on-campus-2020/",
          kind: "candidate-report",
          year: 2020,
        },
        {
          label: "Zomato Interview Experience (4+ years Experienced ) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/zomato-interview-experience-4-years-experienced/",
          kind: "candidate-report",
        },
        {
          label: "Myntra Interview Experience for SDE 2 (3+ years Experienced) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/myntra-interview-experience-for-sde-2-3-years-experienced/",
          kind: "candidate-report",
        },
        {
          label: "Atlassian Interview Experience (Off-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/atlassian-interview-experience-off-campus-2/",
          kind: "candidate-report",
        },
        {
          label: "Zomato SDE intern backend interview, Nov 2024 (CodingKaro, mirrors LeetCode Discuss)",
          url: "https://www.codingkaro.in/jobs-internships/leetcode-interview-experience/Zomato",
          kind: "candidate-report",
          year: 2024,
        },
        {
          label: "Member Of Technical Staff (MTS) Interview Questions and Answers (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/member-of-technical-staff-mts-interview-questions-and-answers/",
          kind: "prep-guide",
        },
      ],
    },
    {
      id: "dbms-indexing",
      theme: "perf",
      q: "What is a database index, which data structure backs it, and what are the trade-offs?",
      a: "<p>An index is a separate structure that maps column values to row locations, so a lookup avoids scanning the whole table. Most relational engines use a B+ tree: a balanced, shallow tree whose leaves are linked in sorted order, so both point lookups and range scans cost about O(log n) page reads.</p><ul><li><b>Clustered</b>: the table rows are stored in index order, so there is at most one per table (in MySQL InnoDB it is the primary key).</li><li><b>Non-clustered</b>: a separate tree whose leaves point to the rows or to the primary key.</li></ul><p>Cost: every insert, update and delete must maintain each index, and indexes take space. A composite index on <code>(a, b)</code> usually helps filters on <code>a</code>, or on <code>a</code> and <code>b</code>, but generally not on <code>b</code> alone. Follow-up: when does the planner ignore an index (low selectivity, a function on the column, a leading wildcard)?</p>",
      level: "Core",
      companies: ["groww", "paytm", "zomato", "microsoft", "flipkart", "dream11", "phonepe", "meesho"],
      evidence: "several",
      sources: [
        {
          label: "Groww Internship Interview Experience (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/groww-internship-interview-experience-on-campus/",
          kind: "candidate-report",
        },
        {
          label: "Groww Interview Experience for Internship (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/groww-interview-experience-for-internship-on-campus/",
          kind: "candidate-report",
        },
        {
          label: "Paytm Interview Experience For Java Backend (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/paytm-interview-experience-for-java-backend/",
          kind: "candidate-report",
        },
        {
          label: "Zomato Interview Experience (4+ years Experienced ) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/zomato-interview-experience-4-years-experienced/",
          kind: "candidate-report",
        },
        {
          label: "Zomato Interview Experience for SDE Intern (On-Campus) 2022 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/zomato-interview-experience-for-sde-intern-on-campus-2022/",
          kind: "candidate-report",
          year: 2022,
        },
        {
          label: "Microsoft Interview Experience | Set 59 (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/microsoft-interview-experience-set-59-on-campus/",
          kind: "candidate-report",
        },
        {
          label: "Flipkart Interview Experience for SDE-2 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/flipkart-interview-experience-for-sde-2-1/",
          kind: "candidate-report",
        },
        {
          label: "Dream11 Interview Experience for SDE II (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/dream11-interview-experience-for-sde-ii-2/",
          kind: "candidate-report",
        },
        {
          label: "Phonepe Interview Experience (On-campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/phonepe-interview-experience-on-campus-1/",
          kind: "candidate-report",
        },
        {
          label: "Meesho SDE3 interview, May 2025 (DynamoDB indexing) (CodingKaro, mirrors LeetCode Discuss)",
          url: "https://www.codingkaro.in/jobs-internships/leetcode-interview-experience/Meesho",
          kind: "candidate-report",
          year: 2025,
        },
        {
          label: "Zomato SDE intern backend interview, Nov 2024 (CodingKaro, mirrors LeetCode Discuss)",
          url: "https://www.codingkaro.in/jobs-internships/leetcode-interview-experience/Zomato",
          kind: "candidate-report",
          year: 2024,
        },
        {
          label: "DBMS Interview Questions with Answers (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/dbms/commonly-asked-dbms-interview-questions/",
          kind: "prep-guide",
        },
      ],
    },
    {
      id: "dbms-acid",
      theme: "txn",
      q: "What are the ACID properties, and how does a database maintain each one?",
      a: "<p>ACID describes the guarantees of a transaction.</p><ul><li><b>Atomicity</b>: all of its changes happen or none do; the engine rolls back using an undo log.</li><li><b>Consistency</b>: a transaction moves the database from one valid state to another, respecting constraints and rules.</li><li><b>Isolation</b>: concurrent transactions behave as if they ran in some serial order, enforced by locking or MVCC.</li><li><b>Durability</b>: once committed, data survives a crash, achieved by flushing a write-ahead log to disk before acknowledging the commit.</li></ul><p>Example: a transfer debits one account and credits another, and a crash between the two statements must not lose money. Consistency is partly the application's job, since the database only enforces the constraints you declared. Follow-up: how isolation levels weaken the I part.</p>",
      level: "Core",
      companies: ["amazon", "groww", "atlassian", "ola", "meesho", "swiggy", "phonepe"],
      evidence: "several",
      sources: [
        {
          label: "Amazon Interview Experience | SDE-I (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-sde-i/",
          kind: "candidate-report",
        },
        {
          label: "Amazon Interview Experience For SDE Intern (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-for-sde-intern-8/",
          kind: "candidate-report",
        },
        {
          label: "Amazon Interview Experience for SDE-1 (Amazon Wow drive) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-for-sde-1-amazon-wow-drive/",
          kind: "candidate-report",
        },
        {
          label: "Groww Interview Experience for SDET Intern (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/groww-interview-experience-for-sdet-intern/",
          kind: "candidate-report",
        },
        {
          label: "Atlassian Interview Experience for SDE (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/atlassian-interview-experience-for-sde-on-campus/",
          kind: "candidate-report",
        },
        {
          label: "OLA Interview Experience | Set 12 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/ola-interview-experience-set-12/",
          kind: "candidate-report",
        },
        {
          label: "Meesho Interview Experience for SDE-1 | On-Campus (Virtual) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/meesho-interview-experience-for-sde-1-on-campus-virtual/",
          kind: "candidate-report",
        },
        {
          label: "Swiggy Interview Experience for SDE-1 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/swiggy-interview-experience-for-sde-1/",
          kind: "candidate-report",
        },
        {
          label: "Phonepe Interview Experience (On-campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/phonepe-interview-experience-on-campus-1/",
          kind: "candidate-report",
        },
        {
          label: "PhonePe Interview Questions (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/gfg-academy/phonepe-interview-questions/",
          kind: "prep-guide",
        },
        {
          label: "Juspay Interview Questions for Technical Profiles (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/juspay-interview-questions-for-technical-profiles/",
          kind: "prep-guide",
        },
        {
          label: "DBMS Interview Questions with Answers (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/dbms/commonly-asked-dbms-interview-questions/",
          kind: "prep-guide",
        },
        {
          label: "Member Of Technical Staff (MTS) Interview Questions and Answers (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/member-of-technical-staff-mts-interview-questions-and-answers/",
          kind: "prep-guide",
        },
      ],
    },
    {
      id: "dbms-joins",
      theme: "sql",
      q: "What kinds of joins exist, and when does each one apply?",
      a: "<p>A join combines rows from two tables using a condition.</p><ul><li><b>INNER</b>: only rows that match on both sides.</li><li><b>LEFT</b> (or RIGHT): all rows from one side, with NULLs where the other side has no match.</li><li><b>FULL</b>: all rows from both sides, NULL-filled where unmatched (MySQL has no FULL join).</li><li><b>CROSS</b>: every pair of rows, so m times n rows.</li><li><b>Self join</b>: a table joined to itself under aliases, for example employees to their managers.</li></ul><p>Pitfalls: NULL never equals NULL in a join condition, so rows with NULL keys do not match, and a <code>WHERE</code> filter on the right table usually turns a left join into an inner join. With 3 left rows and 2 right rows, a cross join gives 6. Follow-up: how the engine executes it (nested loop, hash or merge join).</p>",
      level: "Core",
      companies: ["zomato", "swiggy", "razorpay", "paytm", "atlassian", "amazon"],
      evidence: "several",
      sources: [
        {
          label: "Zomato Interview Experience (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/zomato-interview-experience-on-campus/",
          kind: "candidate-report",
        },
        {
          label: "Zomato Interview Experience (On - Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/zomato-interview-experience-on-campus-2/",
          kind: "candidate-report",
        },
        {
          label: "Swiggy Interview Experience for Software Dev Engineer (On-Campus) 2021 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/swiggy-interview-experience-for-software-dev-engineer-on-campus-2021/",
          kind: "candidate-report",
          year: 2021,
        },
        {
          label: "Razorpay PSE Intern Interview Experience (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/razorpay-pse-intern-interview-experience-on-campus-2025/",
          kind: "candidate-report",
          year: 2025,
        },
        {
          label: "Paytm Interview Experience for Data Engineer (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/paytm-interview-experience-for-data-engineer/",
          kind: "candidate-report",
        },
        {
          label: "Atlassian On-Campus Interview Experience (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/atlassian-on-campus-interview-experience/",
          kind: "candidate-report",
        },
        {
          label: "Atlassian Interview Experience for SDE (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/atlassian-interview-experience-for-sde-on-campus/",
          kind: "candidate-report",
        },
        {
          label: "Amazon Interview Experience For SDE Intern (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-for-sde-intern-8/",
          kind: "candidate-report",
        },
        {
          label: "PhonePe Interview Questions (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/gfg-academy/phonepe-interview-questions/",
          kind: "prep-guide",
        },
        {
          label: "Juspay Interview Questions for Technical Profiles (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/juspay-interview-questions-for-technical-profiles/",
          kind: "prep-guide",
        },
        {
          label: "Member Of Technical Staff (MTS) Interview Questions and Answers (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/member-of-technical-staff-mts-interview-questions-and-answers/",
          kind: "prep-guide",
        },
      ],
    },
    {
      id: "dbms-sharding-replication-cap",
      theme: "perf",
      q: "How do sharding, partitioning and replication differ, and what does the CAP theorem say?",
      a: "<p>Partitioning splits one table into pieces; sharding places those pieces on different servers by a shard key (range, hash or directory). Replication keeps copies of the same data on several servers for availability and read scale.</p><ul><li>Sharding scales writes and storage but makes cross-shard joins and transactions hard, and a poor key creates hot shards.</li><li>Leader-follower replication scales reads, but followers can lag, so reads may be stale.</li></ul><p>CAP says that when a network partition happens, a distributed store must choose between consistency (every read sees the latest write) and availability (every request gets an answer). Without a partition you can have both, so the choice only bites during one. Example: a personalisation store may pick availability and accept eventual consistency, while a ledger picks consistency. Follow-up: how to reshard without downtime.</p>",
      level: "Deep",
      companies: ["zomato", "swiggy", "paytm", "amazon", "flipkart", "atlassian", "myntra"],
      evidence: "several",
      sources: [
        {
          label: "Zomato Interview Experience (4+ years Experienced ) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/zomato-interview-experience-4-years-experienced/",
          kind: "candidate-report",
        },
        {
          label: "Swiggy Interview Experience for Software Dev Engineer (On-Campus) 2021 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/swiggy-interview-experience-for-software-dev-engineer-on-campus-2021/",
          kind: "candidate-report",
          year: 2021,
        },
        {
          label: "Paytm Interview Experience For Java Backend (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/paytm-interview-experience-for-java-backend/",
          kind: "candidate-report",
        },
        {
          label: "Amazon Interview Experience | On-Campus (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-on-campus-4/",
          kind: "candidate-report",
        },
        {
          label: "Flipkart Interview Experience For SDE-2 (Off-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/flipkart-interview-experience-for-sde-2-off-campus/",
          kind: "candidate-report",
        },
        {
          label: "Atlassian Interview Experience (Off-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/atlassian-interview-experience-off-campus-2/",
          kind: "candidate-report",
        },
        {
          label: "Myntra Interview Experience for SDE 2 (3+ years Experienced) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/myntra-interview-experience-for-sde-2-3-years-experienced/",
          kind: "candidate-report",
        },
        {
          label: "Microsoft Theoretical Interview Questions (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/microsofts-asked-interview-questions/",
          kind: "prep-guide",
        },
      ],
    },
    {
      id: "dbms-keys",
      theme: "model",
      q: "How do primary, candidate, super, unique and foreign keys differ?",
      a: "<p>A <b>super key</b> is any set of columns that uniquely identifies a row. A <b>candidate key</b> is a minimal super key, meaning no column can be dropped. The <b>primary key</b> is the candidate key you choose as the main identifier; it cannot be NULL and there is one per table. A <b>unique key</b> is a uniqueness constraint on another candidate key; it may allow NULL (how many NULLs depends on the engine) and a table can have many. A <b>foreign key</b> is a column whose values must match a key in another table (or be NULL), which enforces referential integrity. A composite key uses several columns together.</p><p>Example: in <code>users(id, email, phone)</code>, both <code>id</code> and <code>email</code> can be candidate keys; <code>id</code> is the primary key and <code>email</code> gets a unique constraint. Follow-up: natural versus surrogate keys.</p>",
      level: "Core",
      companies: ["groww", "phonepe", "razorpay", "amazon"],
      evidence: "several",
      sources: [
        {
          label: "Groww Internship Interview Experience (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/groww-internship-interview-experience-on-campus/",
          kind: "candidate-report",
        },
        {
          label: "Groww Interview Experience for Internship (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/groww-interview-experience-for-internship-on-campus/",
          kind: "candidate-report",
        },
        {
          label: "Phonepe Interview Experience (On-campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/phonepe-interview-experience-on-campus-1/",
          kind: "candidate-report",
        },
        {
          label: "Razorpay Interview Experience (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/razorpay-interview-experience/",
          kind: "candidate-report",
        },
        {
          label: "Amazon Interview Experience For SDE Intern (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-for-sde-intern-8/",
          kind: "candidate-report",
        },
        {
          label: "Juspay Interview Questions for Technical Profiles (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/juspay-interview-questions-for-technical-profiles/",
          kind: "prep-guide",
        },
        {
          label: "DBMS Interview Questions with Answers (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/dbms/commonly-asked-dbms-interview-questions/",
          kind: "prep-guide",
        },
      ],
    },
    {
      id: "dbms-isolation-locking-2pc",
      theme: "txn",
      q: "Explain isolation levels, locking and two-phase commit.",
      a: "<p>Isolation levels trade correctness for concurrency by choosing which anomalies are allowed.</p><ul><li><b>Read uncommitted</b>: dirty reads are possible.</li><li><b>Read committed</b>: no dirty reads, but a repeated read can change (non-repeatable read).</li><li><b>Repeatable read</b>: a row read twice stays the same; the standard still allows phantom rows, though some engines prevent them.</li><li><b>Serializable</b>: results match some serial order.</li></ul><p>Engines implement this with locks (shared and exclusive, row or table) or with MVCC snapshots, where readers do not block writers.</p><p>Two-phase commit coordinates one transaction across several databases: the coordinator asks every participant to prepare, and only if all vote yes does it send commit. It blocks if the coordinator fails after the prepare phase. Follow-up: sagas as an alternative.</p>",
      level: "Deep",
      companies: ["dream11", "swiggy"],
      evidence: "several",
      sources: [
        {
          label: "Dream11 Interview Experience for SDE II (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/dream11-interview-experience-for-sde-ii-2/",
          kind: "candidate-report",
        },
        {
          label: "Swiggy Interview experience for SDE-3 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/swiggy-interview-experience-for-sde-3/",
          kind: "candidate-report",
        },
        {
          label: "Dream11 SDE-2 interview, Nov 2024 (CodingKaro, mirrors LeetCode Discuss)",
          url: "https://www.codingkaro.in/jobs-internships/leetcode-interview-experience/Dream11",
          kind: "candidate-report",
          year: 2024,
        },
      ],
    },
    {
      id: "dbms-schema-design",
      theme: "design",
      q: "Design a relational schema for a scenario such as students and courses, and justify the keys.",
      a: "<p>Start from the entities and how they relate, then turn each into a table with a key.</p><ol><li>List the entities (student, course, instructor) and the facts each carries.</li><li>Decide the cardinality of each relationship: one-to-many becomes a foreign key on the many side, and many-to-many becomes a junction table holding both keys.</li><li>Pick primary keys and add constraints: <code>NOT NULL</code>, <code>UNIQUE</code>, <code>CHECK</code>, and foreign keys with a delete rule.</li><li>Normalise to 3NF, then add indexes for the queries you expect.</li></ol><p>Example: students enrol in many courses and a course has many students, so use <code>enrolment(student_id, course_id, grade)</code> with a composite primary key on the two ids. State assumptions aloud, such as whether a course can have several instructors. Follow-up: write a query on the schema you just drew.</p>",
      level: "Core",
      companies: ["microsoft", "meesho", "flipkart"],
      evidence: "several",
      sources: [
        {
          label: "Microsoft Interview | Set 5 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/microsoft-interview-set-5/",
          kind: "candidate-report",
        },
        {
          label: "Microsoft Interview experience | Set 98 (On Campus for IDC) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/microsoft-interview-experience-set-98-on-campus-for-idc/",
          kind: "candidate-report",
        },
        {
          label: "Meesho Interview Experience | On-Campus (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/meesho-interview-experience-on-campus/",
          kind: "candidate-report",
        },
        {
          label: "Flipkart Interview Experience for SDE-2 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/flipkart-interview-experience-for-sde-2-1/",
          kind: "candidate-report",
        },
        {
          label: "Flipkart Interview Experience For SDE-2 (Off-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/flipkart-interview-experience-for-sde-2-off-campus/",
          kind: "candidate-report",
        },
      ],
    },
    {
      id: "dbms-group-by-having",
      theme: "sql",
      q: "How do GROUP BY and aggregates work, and what is the difference between WHERE and HAVING?",
      a: "<p><code>GROUP BY</code> collapses rows that share the same values in the grouping columns into one row each, so aggregates such as <code>COUNT</code>, <code>SUM</code>, <code>AVG</code>, <code>MIN</code> and <code>MAX</code> run per group. <code>WHERE</code> filters individual rows before grouping; <code>HAVING</code> filters groups after aggregation, so only <code>HAVING</code> can use an aggregate.</p><p>Logical order: <code>FROM</code>, <code>WHERE</code>, <code>GROUP BY</code>, <code>HAVING</code>, <code>SELECT</code>, <code>ORDER BY</code>. Example: to find departments with more than five well-paid employees, put the salary test in <code>WHERE</code>, group by department, and put the count test in <code>HAVING</code>. Pitfalls: in standard SQL every selected column must be grouped or aggregated, <code>COUNT(*)</code> counts rows with NULLs while <code>COUNT(col)</code> skips them, and other aggregates ignore NULLs. Follow-up: why a non-aggregate condition belongs in <code>WHERE</code>.</p>",
      level: "Core",
      companies: ["razorpay", "phonepe", "paytm", "zomato"],
      evidence: "several",
      sources: [
        {
          label: "Razorpay PSE Intern Interview Experience (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/razorpay-pse-intern-interview-experience-on-campus-2025/",
          kind: "candidate-report",
          year: 2025,
        },
        {
          label: "PhonePe Interview Experience for Software Engineer FTE (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/phonepe-interview-experience-for-software-engineer-fte/",
          kind: "candidate-report",
        },
        {
          label: "Paytm Interview Experience for Data Engineer (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/paytm-interview-experience-for-data-engineer/",
          kind: "candidate-report",
        },
        {
          label: "Zomato Interview Experience (On - Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/zomato-interview-experience-on-campus-2/",
          kind: "candidate-report",
        },
        {
          label: "DBMS Interview Questions with Answers (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/dbms/commonly-asked-dbms-interview-questions/",
          kind: "prep-guide",
        },
      ],
    },
    {
      id: "dbms-rank-dense-rank-row-number",
      theme: "sql",
      q: "What is the difference between RANK, DENSE_RANK and ROW_NUMBER?",
      a: "<p>All three number rows inside a partition ordered by a key, without collapsing rows. They differ on ties. For scores 90, 90, 80:</p><ul><li><code>ROW_NUMBER</code> gives 1, 2, 3: always unique, with ties broken arbitrarily unless you add a tiebreaker.</li><li><code>RANK</code> gives 1, 1, 3: ties share a rank and the following ranks are skipped.</li><li><code>DENSE_RANK</code> gives 1, 1, 2: ties share a rank and no gap follows.</li></ul><p>Syntax: <code>RANK() OVER (PARTITION BY dept ORDER BY salary DESC)</code>. Use <code>DENSE_RANK</code> for the Nth highest salary, and <code>ROW_NUMBER</code> to keep one row per group or to remove duplicates. You cannot filter on a window function in <code>WHERE</code>; wrap it in a subquery or CTE. Follow-up: the top two salaries per department.</p>",
      level: "Core",
      companies: ["meesho", "flipkart", "phonepe", "paytm"],
      evidence: "several",
      sources: [
        {
          label: "Meesho Interview Experience | Full Time (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/meesho-interview-experience-full-time/",
          kind: "candidate-report",
        },
        {
          label: "Flipkart Interview Experience for BA intern (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/flipkart-interview-experience-for-ba-intern/",
          kind: "candidate-report",
        },
        {
          label: "PhonePe Interview Experience for Software Engineer FTE (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/phonepe-interview-experience-for-software-engineer-fte/",
          kind: "candidate-report",
        },
        {
          label: "Paytm Interview Experience for Data Engineer (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/paytm-interview-experience-for-data-engineer/",
          kind: "candidate-report",
        },
      ],
    },
    {
      id: "dbms-denormalisation",
      theme: "design",
      q: "When and why would you denormalise a schema?",
      a: "<p>Denormalisation deliberately stores redundant data, such as a copy of a customer name on each order or a precomputed counter, to avoid joins and speed up reads. Normalisation optimises for write correctness; denormalisation optimises for read latency.</p><ul><li><b>When</b>: read-heavy paths, reporting and analytics tables, sharded systems where cross-shard joins are expensive, and caches or materialised views.</li><li><b>Cost</b>: duplicates can drift apart, writes get heavier, and you need code, triggers or jobs to keep copies in sync.</li></ul><p>Example: an order keeps a snapshot of the shipping address and item price at purchase time, which is also the correct business behaviour. Normalise first, measure, then denormalise the specific hot query. Follow-up: how you would keep the copies consistent.</p>",
      level: "Core",
      companies: ["uber", "microsoft", "zomato"],
      evidence: "several",
      sources: [
        {
          label: "Uber Interview Experience | Software Engineer 1 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/uber-interview-experience-software-engineer-1/",
          kind: "candidate-report",
        },
        {
          label: "Microsoft Interview Experience | Set 59 (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/microsoft-interview-experience-set-59-on-campus/",
          kind: "candidate-report",
        },
        {
          label: "Zomato Interview Experience for SDE (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/zomato-interview-experience-for-sde-3/",
          kind: "candidate-report",
        },
        {
          label: "DBMS Interview Questions with Answers (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/dbms/commonly-asked-dbms-interview-questions/",
          kind: "prep-guide",
        },
      ],
    },
    {
      id: "dbms-dbms-vs-rdbms",
      theme: "model",
      q: "How does a DBMS differ from an RDBMS, and what are the levels of data abstraction?",
      a: "<p>A DBMS is software that stores, retrieves and manages data and handles concurrency, security and recovery. An RDBMS is a DBMS based on the relational model: data in tables of rows and columns, keys and foreign keys, SQL, and ACID transactions. Simpler DBMSs may store data as files, hierarchies or documents without enforced relations.</p><p>Three levels of data abstraction give data independence:</p><ul><li><b>Physical</b>: how data sits on disk (files, pages, indexes).</li><li><b>Logical</b>: tables, columns, relationships and constraints.</li><li><b>View</b>: the part of the data that a particular user or application sees.</li></ul><p>Example: adding an index changes the physical level without touching any query, which is physical data independence. Follow-up: logical versus physical data independence.</p>",
      level: "Core",
      companies: ["amazon", "razorpay"],
      evidence: "several",
      sources: [
        {
          label: "Amazon Interview Experience For SDE Intern (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-for-sde-intern-8/",
          kind: "candidate-report",
        },
        {
          label: "Razorpay Interview Experience for SDE-1 (On-Campus 2020) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/razorpay-interview-experience-for-sde-1-on-campus-2020/",
          kind: "candidate-report",
          year: 2020,
        },
        {
          label: "PhonePe Interview Questions (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/gfg-academy/phonepe-interview-questions/",
          kind: "prep-guide",
        },
        {
          label: "DBMS Interview Questions with Answers (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/dbms/commonly-asked-dbms-interview-questions/",
          kind: "prep-guide",
        },
      ],
      links: [
        {
          href: "/dbms",
          label: "DBMS notes",
        },
      ],
    },
    {
      id: "dbms-delete-truncate-drop",
      theme: "sql",
      q: "What is the difference between DELETE, TRUNCATE and DROP?",
      a: "<ul><li><b>DELETE</b> is DML: it removes the rows matching an optional <code>WHERE</code>, logs each row, fires row triggers and can be rolled back in a transaction.</li><li><b>TRUNCATE</b> removes all rows, takes no <code>WHERE</code>, and is much faster because it deallocates data pages instead of logging each row; in many engines it resets identity counters and is classed as DDL.</li><li><b>DROP</b> removes the table itself, with its data, indexes and, in most engines, its permissions.</li></ul><p>Rollback depends on the engine: PostgreSQL and SQL Server allow TRUNCATE inside a transaction, while MySQL and Oracle commit implicitly. SQLite has no TRUNCATE, so you use <code>DELETE FROM t</code> without a <code>WHERE</code>. TRUNCATE usually cannot run on a table that a foreign key references. Follow-up: DDL versus DML versus DCL.</p>",
      level: "Core",
      companies: ["razorpay", "amazon"],
      evidence: "several",
      sources: [
        {
          label: "Razorpay Interview Experience for Product Support Engineer (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/razorpay-interview-experience-for-product-support-engineer/",
          kind: "candidate-report",
        },
        {
          label: "Amazon Interview Experience For SDE Intern (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-for-sde-intern-8/",
          kind: "candidate-report",
        },
        {
          label: "DBMS Interview Questions with Answers (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/dbms/commonly-asked-dbms-interview-questions/",
          kind: "prep-guide",
        },
      ],
    },
    {
      id: "dbms-er-model",
      theme: "design",
      q: "What is the ER model, and how do you map an ER diagram to tables?",
      a: "<p>The entity-relationship model describes data before any tables exist. An ER diagram shows entities (things like <code>Student</code>), attributes (name, roll number) and relationships (enrols in), with cardinality such as one-to-one, one-to-many and many-to-many, and whether participation is mandatory.</p><ul><li>A strong entity has its own key; a weak entity depends on an owner entity and is identified only together with it.</li><li>Attributes can be simple, composite, multivalued or derived.</li></ul><p>Mapping to tables: each entity becomes a table, a one-to-many relationship becomes a foreign key on the many side, a many-to-many relationship becomes a junction table, and a multivalued attribute becomes its own table. Example: an order line is a weak entity of an order. Follow-up: turn a described scenario into a diagram and then into tables.</p>",
      level: "Core",
      companies: ["atlassian", "amazon"],
      evidence: "several",
      sources: [
        {
          label: "Atlassian On-Campus Interview Experience (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/atlassian-on-campus-interview-experience/",
          kind: "candidate-report",
        },
        {
          label: "Amazon Interview Experience For SDE Intern (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-for-sde-intern-8/",
          kind: "candidate-report",
        },
        {
          label: "DBMS Interview Questions with Answers (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/dbms/commonly-asked-dbms-interview-questions/",
          kind: "prep-guide",
        },
      ],
    },
    {
      id: "dbms-deadlock",
      theme: "txn",
      q: "What is a deadlock in a database, and how is it prevented or handled?",
      a: "<p>A database deadlock occurs when two or more transactions each hold a lock that the other needs, so none can proceed. Example: T1 locks row A and then wants row B, while T2 has locked row B and wants row A.</p><p>Four conditions must all hold: mutual exclusion, hold and wait, no preemption, and circular wait. Engines usually detect deadlocks with a wait-for graph and abort one victim, which the application must retry; some rely on lock timeouts instead.</p><ul><li>Acquire locks in a consistent order across code paths.</li><li>Keep transactions short and never wait for user input inside one.</li><li>Index the columns you update, so fewer rows are locked.</li><li>Retry the transaction when a deadlock error comes back.</li></ul><p>Follow-up: how wait-die and wound-wait schemes avoid cycles.</p>",
      level: "Core",
      companies: ["atlassian"],
      evidence: "several",
      sources: [
        {
          label: "Atlassian Interview Experience for SDE (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/atlassian-interview-experience-for-sde-on-campus/",
          kind: "candidate-report",
        },
        {
          label: "DBMS Interview Questions with Answers (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/dbms/commonly-asked-dbms-interview-questions/",
          kind: "prep-guide",
        },
      ],
    },
    {
      id: "dbms-query-optimisation",
      theme: "perf",
      q: "How do you read an execution plan and fix a slow query?",
      a: "<p>The optimizer picks a plan using statistics about table sizes and value distribution. Read it with <code>EXPLAIN</code>, or <code>EXPLAIN ANALYZE</code> (PostgreSQL and MySQL 8), which also runs the query and shows real times and row counts.</p><ol><li>Look for full table scans on large tables, and for estimated row counts far from the actual ones, which usually mean stale statistics.</li><li>Check the join order and join type (nested loop, hash, merge), and any sort or temporary table spilling to disk.</li><li>Fix the cause: add or reshape an index to match the filter and sort columns, select only the columns you need, avoid wrapping an indexed column in a function, and page with the last-seen key instead of a large <code>OFFSET</code>.</li></ol><p>Example: <code>WHERE DATE(created_at)</code> equal to a day usually cannot use an index on <code>created_at</code>, but a range on the column can. Follow-up: when more indexes make things worse.</p>",
      level: "Deep",
      companies: [],
      evidence: "guide",
      sources: [
        {
          label: "Juspay Interview Questions for Technical Profiles (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/juspay-interview-questions-for-technical-profiles/",
          kind: "prep-guide",
        },
        {
          label: "Member Of Technical Staff (MTS) Interview Questions and Answers (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/member-of-technical-staff-mts-interview-questions-and-answers/",
          kind: "prep-guide",
        },
      ],
    },
    {
      id: "dbms-views-triggers-procedures",
      theme: "sql",
      q: "What are views, triggers and stored procedures, and when would you use each?",
      a: "<ul><li>A <b>view</b> is a stored query that behaves like a virtual table. It hides complexity, restricts which columns or rows users see, and keeps one definition of a join. A materialised view stores the result and must be refreshed.</li><li>A <b>trigger</b> is code that runs automatically before or after an insert, update or delete on a table. Typical uses are audit logs and enforcing rules, but it hides logic and can slow writes.</li><li>A <b>stored procedure</b> is named SQL logic stored in the database and called with parameters. It cuts round trips and centralises rules, but is harder to version, test and port between engines.</li></ul><p>Example: a view <code>active_orders</code> filters out cancelled rows so that every report uses the same definition. Follow-up: can you update through a view? Usually only simple views over one table allow it.</p>",
      level: "Core",
      companies: [],
      evidence: "guide",
      sources: [
        {
          label: "DBMS Interview Questions with Answers (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/dbms/commonly-asked-dbms-interview-questions/",
          kind: "prep-guide",
        },
        {
          label: "Member Of Technical Staff (MTS) Interview Questions and Answers (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/member-of-technical-staff-mts-interview-questions-and-answers/",
          kind: "prep-guide",
        },
      ],
    },
  ],
};
