import type { CsSet } from "./cs-types";

export const set: CsSet = {
  id: "sql",
  title: "SQL",
  intro:
    "Eighteen SQL questions reported in interviews, each with a query and its exact output on one small sample dataset. Load the schema once, run each query yourself, then read the pitfalls.",
  themes: [
    {
      id: "joins",
      name: "Joins",
    },
    {
      id: "aggregation",
      name: "Aggregation and grouping",
    },
    {
      id: "subqueries",
      name: "Subqueries and CTEs",
    },
    {
      id: "windows",
      name: "Window functions, ranking and top N",
    },
    {
      id: "nulls-sets",
      name: "Set operations and NULL logic",
    },
    {
      id: "dedup",
      name: "Deduplication",
    },
  ],
  schema: {
    caption:
      "Four tables. The results below assume 4 departments, 8 employees (one with no department), 6 customers (two emails appear twice) and 15 orders (one guest order with no customer), as listed in the INSERT statements after the table definitions.",
    sql: "CREATE TABLE departments (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL\n);\n\nCREATE TABLE employees (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  salary INTEGER NOT NULL,\n  dept_id INTEGER REFERENCES departments (id),\n  manager_id INTEGER REFERENCES employees (id),\n  city TEXT NOT NULL\n);\n\nCREATE TABLE customers (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  email TEXT NOT NULL\n);\n\nCREATE TABLE orders (\n  id INTEGER PRIMARY KEY,\n  customer_id INTEGER REFERENCES customers (id),\n  category TEXT NOT NULL,\n  product TEXT NOT NULL,\n  order_date TEXT NOT NULL,\n  status TEXT NOT NULL,\n  amount INTEGER NOT NULL\n);\n\nINSERT INTO departments VALUES (1, 'Engineering'), (2, 'Sales'), (3, 'Support'), (4, 'Legal');\n\nINSERT INTO employees VALUES\n  (1, 'Asha', 9000, 1, NULL, 'Pune'),\n  (2, 'Bilal', 7000, 1, 1, 'Pune'),\n  (3, 'Chen', 7000, 1, 1, 'Delhi'),\n  (4, 'Dev', 8000, 2, NULL, 'Mumbai'),\n  (5, 'Esha', 5000, 2, 4, 'Mumbai'),\n  (6, 'Farid', 5000, 2, 4, 'Pune'),\n  (7, 'Gita', 4000, 3, 2, 'Pune'),\n  (8, 'Hari', 6500, NULL, 1, 'Pune');\n\nINSERT INTO customers VALUES\n  (1, 'Maya', 'maya@example.com'),\n  (2, 'Noor', 'noor@example.com'),\n  (3, 'Omar', 'omar@example.com'),\n  (4, 'Maya', 'maya@example.com'),\n  (5, 'Pia', 'pia@example.com'),\n  (6, 'Noor', 'noor@example.com');\n\nINSERT INTO orders VALUES\n  (1, 1, 'Books', 'Atlas', '2026-01-05', 'completed', 400),\n  (2, 1, 'Books', 'Novel', '2026-01-20', 'completed', 250),\n  (3, 2, 'Toys', 'Robot', '2026-01-20', 'completed', 900),\n  (4, 2, 'Books', 'Atlas', '2026-02-03', 'cancelled', 400),\n  (5, 3, 'Toys', 'Robot', '2026-02-03', 'completed', 900),\n  (6, 3, 'Toys', 'Puzzle', '2026-02-10', 'completed', 300),\n  (7, 3, 'Books', 'Novel', '2026-02-10', 'completed', 250),\n  (8, 4, 'Games', 'Chess', '2026-02-10', 'completed', 600),\n  (9, NULL, 'Toys', 'Puzzle', '2026-03-01', 'completed', 300),\n  (10, 2, 'Games', 'Chess', '2026-03-01', 'completed', 600),\n  (11, 1, 'Games', 'Cards', '2026-03-15', 'completed', 150),\n  (12, 6, 'Books', 'Atlas', '2026-03-20', 'completed', 400),\n  (13, 4, 'Toys', 'Robot', '2026-03-20', 'completed', 900),\n  (14, 3, 'Books', 'Comic', '2026-03-20', 'completed', 250),\n  (15, 6, 'Toys', 'Blocks', '2026-03-20', 'completed', 600);",
  },
  chapters: [],
  questions: [
    {
      id: "sql-join-types",
      theme: "joins",
      q: "What are the join types, and how do you keep rows that have no match?",
      a: "<p><b>INNER JOIN</b> keeps only rows that match on both sides. <b>LEFT JOIN</b> keeps every left row and fills the right columns with NULL when nothing matches. RIGHT JOIN mirrors it, FULL JOIN keeps unmatched rows from both sides, and CROSS JOIN pairs every row with every row.</p><p>The query lists every employee with a department name. Hari has no department, so he still appears with NULL; an inner join would drop him silently, which is a common reporting bug.</p><p>Pitfall: a filter on the right table in <code>WHERE</code> (such as <code>d.name = 'Sales'</code>) turns a left join back into an inner join, because NULL fails the test. Put it in the <code>ON</code> clause to keep unmatched rows. Follow-up: SQLite supports RIGHT and FULL joins only from version 3.39, and MySQL has no FULL JOIN.</p>",
      level: "Core",
      companies: ["zomato", "swiggy", "razorpay", "paytm", "flipkart", "atlassian", "amazon"],
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
          label: "Swiggy Interview Experience for SDE-1 | On-Campus 2021 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/swiggy-interview-experience-for-sde-1-on-campus-2021-2/",
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
          label: "Flipkart Interview | Set 14 (For SDET-1) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/flipkart-interview-set-14-sde-1/",
          kind: "candidate-report",
        },
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
          label: "Top 50 SQL Questions For Data Analyst Interview (GeeksforGeeks, generic guide)",
          url: "https://www.geeksforgeeks.org/data-analysis/sql-questions-for-data-analyst-interview/",
          kind: "prep-guide",
        },
      ],
      query:
        "SELECT e.name, d.name AS department\nFROM employees e\nLEFT JOIN departments d ON d.id = e.dept_id\nORDER BY e.id",
      result: {
        head: ["name", "department"],
        rows: [
          ["Asha", "Engineering"],
          ["Bilal", "Engineering"],
          ["Chen", "Engineering"],
          ["Dev", "Sales"],
          ["Esha", "Sales"],
          ["Farid", "Sales"],
          ["Gita", "Support"],
          ["Hari", "NULL"],
        ],
      },
    },
    {
      id: "sql-departments-with-zero",
      theme: "joins",
      q: "Count the employees in every department, including departments that have none.",
      a: "<p>To count children per parent and keep parents with none, start from the parent table, <code>LEFT JOIN</code> the child table, and count a child column rather than <code>*</code>.</p><p><code>COUNT(e.id)</code> ignores NULLs, so Legal shows 0. <code>COUNT(*)</code> would count the single NULL-padded row and report 1, which is the classic mistake. The query sorts by count descending and then by department id, so ties come out in a stable order.</p><ul><li>Group by the department id as well as the name, so two departments with the same name stay separate.</li><li>A condition on employees (for example only active ones) belongs in the <code>ON</code> clause, not <code>WHERE</code>, or empty departments vanish again.</li></ul><p>Variant: a correlated scalar subquery, <code>(SELECT COUNT(*) FROM employees e WHERE e.dept_id = d.id)</code>, gives the same answer without a join.</p>",
      level: "Core",
      companies: ["swiggy"],
      evidence: "one",
      sources: [
        {
          label: "Swiggy Interview Experience for SDE-1 | On-Campus 2021 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/swiggy-interview-experience-for-sde-1-on-campus-2021-2/",
          kind: "candidate-report",
          year: 2021,
        },
      ],
      query:
        "SELECT d.id, d.name, COUNT(e.id) AS employees\nFROM departments d\nLEFT JOIN employees e ON e.dept_id = d.id\nGROUP BY d.id, d.name\nORDER BY employees DESC, d.id",
      result: {
        head: ["id", "name", "employees"],
        rows: [
          ["1", "Engineering", "3"],
          ["2", "Sales", "3"],
          ["3", "Support", "1"],
          ["4", "Legal", "0"],
        ],
      },
    },
    {
      id: "sql-self-join-manager-city",
      theme: "joins",
      q: "Find employees who live in the same city as their manager.",
      a: "<p>A self join joins a table to itself under two aliases, one playing the employee and the other the manager. Here <code>e.manager_id = m.id</code> links each employee to the manager row, and the extra condition <code>e.city = m.city</code> keeps those who share a city.</p><p>Employees with no manager (Asha and Dev, whose <code>manager_id</code> is NULL) never match, so the inner join drops them. To list them too, use a <code>LEFT JOIN</code> and decide what the missing city comparison should mean, since comparing with NULL is never true.</p><p>Variants an interviewer reaches for: employees who earn more than their manager (<code>e.salary &gt; m.salary</code>), managers ranked by number of reports (group by <code>m.id</code>), and the full chain of command for one person, which needs a recursive CTE.</p>",
      level: "Core",
      companies: ["microsoft"],
      evidence: "several",
      sources: [
        {
          label: "Microsoft Interview Experience | Set 59 (On-Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/microsoft-interview-experience-set-59-on-campus/",
          kind: "candidate-report",
        },
        {
          label: "Top 50 SQL Questions For Data Analyst Interview (GeeksforGeeks, generic guide)",
          url: "https://www.geeksforgeeks.org/data-analysis/sql-questions-for-data-analyst-interview/",
          kind: "prep-guide",
        },
      ],
      query:
        "SELECT e.name AS employee, m.name AS manager, e.city\nFROM employees e\nJOIN employees m ON e.manager_id = m.id\nWHERE e.city = m.city\nORDER BY e.id",
      result: {
        head: ["employee", "manager", "city"],
        rows: [
          ["Bilal", "Asha", "Pune"],
          ["Esha", "Dev", "Mumbai"],
          ["Gita", "Bilal", "Pune"],
          ["Hari", "Asha", "Pune"],
        ],
      },
    },
    {
      id: "sql-anti-join-no-match",
      theme: "joins",
      q: "Find the rows in one table that have no match in another, such as customers with no orders.",
      a: "<p>An anti-join returns rows from one table that have no partner in another. There are three forms: <code>LEFT JOIN ... WHERE right.id IS NULL</code>, <code>NOT EXISTS</code> and <code>NOT IN</code>. The query uses the first and returns Pia, who has no orders.</p><p>Test a right-table column that can never be NULL for a real match, normally its primary key.</p><p>The trap is <code>NOT IN</code>. One sample order has a NULL <code>customer_id</code>, so <code>NOT IN (SELECT customer_id FROM orders)</code> compares against an unknown value and returns no rows at all. <code>NOT EXISTS</code> has no such problem and is the safest default.</p><p>Follow-up: engines usually plan a LEFT JOIN anti-join and <code>NOT EXISTS</code> the same way, and an index on <code>orders.customer_id</code> makes both cheap.</p>",
      level: "Core",
      companies: ["zomato"],
      evidence: "several",
      sources: [
        {
          label: "Zomato (District) Software Developer 1 interview, Apr 2025 (CodingKaro, mirrors LeetCode Discuss)",
          url: "https://www.codingkaro.in/jobs-internships/leetcode-interview-experience/Zomato",
          kind: "candidate-report",
          year: 2025,
        },
        {
          label: "Top 50 SQL Questions For Data Analyst Interview (GeeksforGeeks, generic guide)",
          url: "https://www.geeksforgeeks.org/data-analysis/sql-questions-for-data-analyst-interview/",
          kind: "prep-guide",
        },
      ],
      query: "SELECT c.id, c.name\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nWHERE o.id IS NULL",
      result: {
        head: ["id", "name"],
        rows: [["5", "Pia"]],
      },
    },
    {
      id: "sql-where-vs-having",
      theme: "aggregation",
      q: "What is the difference between WHERE and HAVING when grouping?",
      a: "<p><code>WHERE</code> filters individual rows before grouping, so it cannot use aggregates. <code>HAVING</code> filters groups after aggregation, so it can. The logical order is FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY.</p><p>The query first drops employees paid 5000 or less with <code>WHERE</code>, groups the rest by department, then keeps departments with at least two remaining people with <code>HAVING</code>. Engineering has three and averages 7666.7. Sales is left with only Dev and Support with nobody, so both disappear.</p><p>Rule of thumb: put every condition that needs no aggregate in <code>WHERE</code>, because it shrinks the data before grouping and can use an index. Follow-up: every selected column must be grouped or aggregated. Most engines reject a bare column, while SQLite accepts it and returns a value from an arbitrary row of the group.</p>",
      level: "Core",
      companies: ["razorpay"],
      evidence: "several",
      sources: [
        {
          label: "Razorpay PSE Intern Interview Experience (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/razorpay-pse-intern-interview-experience-on-campus-2025/",
          kind: "candidate-report",
          year: 2025,
        },
        {
          label: "Zomato SQL interview questions (DataLemur, practice-site guide)",
          url: "https://datalemur.com/blog/zomato-sql-interview-questions",
          kind: "prep-guide",
          year: 2025,
        },
        {
          label: "Top 100 SQL Interview Questions and Answers (GeeksforGeeks, generic guide)",
          url: "https://www.geeksforgeeks.org/sql/sql-interview-questions/",
          kind: "prep-guide",
        },
      ],
      query:
        "SELECT d.name, COUNT(*) AS headcount, ROUND(AVG(e.salary), 1) AS avg_salary\nFROM employees e\nJOIN departments d ON d.id = e.dept_id\nWHERE e.salary > 5000\nGROUP BY d.name\nHAVING COUNT(*) >= 2\nORDER BY d.name",
      result: {
        head: ["name", "headcount", "avg_salary"],
        rows: [["Engineering", "3", "7666.7"]],
      },
    },
    {
      id: "sql-odd-daily-active-users",
      theme: "aggregation",
      q: "List the dates on which the number of daily active users is odd.",
      a: "<p>Daily active users here means distinct customers with a completed order on a date. Group by date, count distinct customers, then keep odd counts with <code>HAVING COUNT(DISTINCT customer_id) % 2 = 1</code>. Some engines spell modulo <code>MOD(x, 2)</code>.</p><p>Pitfalls: count <em>distinct</em> users, since one person can order twice in a day (2026-02-10 has three orders but only two customers); filter the status in <code>WHERE</code> so cancelled orders do not count; and remember that <code>COUNT(DISTINCT col)</code> skips NULLs. The guest order on 2026-03-01 has no customer, so that date counts one user, not two.</p><p>Variant: for weekly or monthly active users, group by a truncated date (<code>DATE_TRUNC</code>, or <code>SUBSTR</code> of an ISO text date as in SQLite). Follow-up: compare each date with the previous one using <code>LAG</code>.</p>",
      level: "Core",
      companies: ["cred"],
      evidence: "one",
      sources: [
        {
          label: "CRED Product Analyst interview, SQL and Python rounds, Sep 2022 (Naukri Code360)",
          url: "https://www.naukri.com/code360/interview-experiences/cred/interview-experience-off-campus-sep-2022-2-5464",
          kind: "candidate-report",
          year: 2022,
        },
      ],
      query:
        "SELECT order_date, COUNT(DISTINCT customer_id) AS active_users\nFROM orders\nWHERE status = 'completed'\nGROUP BY order_date\nHAVING COUNT(DISTINCT customer_id) % 2 = 1\nORDER BY order_date",
      result: {
        head: ["order_date", "active_users"],
        rows: [
          ["2026-01-05", "1"],
          ["2026-02-03", "1"],
          ["2026-03-01", "1"],
          ["2026-03-15", "1"],
          ["2026-03-20", "3"],
        ],
      },
    },
    {
      id: "sql-subquery-vs-join-cte",
      theme: "subqueries",
      q: "When do you use a subquery, a correlated subquery, a join or a CTE?",
      a: "<p>A subquery is a query nested in another. A <em>correlated</em> subquery refers to the outer row and is conceptually re-run for each row; an uncorrelated one runs once. A CTE (<code>WITH name AS (...)</code>) names a subquery so the main query can reuse it and read top to bottom.</p><p>The example finds employees paid above their own department average. The CTE computes one average per department, a join attaches it to each employee, and <code>WHERE</code> compares. Asha and Dev qualify. Hari has no department, so he finds no partner in the join and is dropped.</p><p>Join versus subquery: the results are often the same and optimisers frequently rewrite one into the other, so choose for clarity. Use a join when you need columns from both sides, <code>EXISTS</code> for existence checks, and a window function (<code>AVG(salary) OVER (PARTITION BY dept_id)</code>) to avoid the second pass. Follow-up: a recursive CTE walks hierarchies.</p>",
      level: "Core",
      companies: ["zomato", "meesho", "razorpay"],
      evidence: "several",
      sources: [
        {
          label: "Zomato SDE-1 interview, Feb 2024 (CodingKaro, mirrors LeetCode Discuss)",
          url: "https://www.codingkaro.in/jobs-internships/leetcode-interview-experience/Zomato",
          kind: "candidate-report",
          year: 2024,
        },
        {
          label: "Meesho Interview Experience | Full Time (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/meesho-interview-experience-full-time/",
          kind: "candidate-report",
        },
        {
          label: "Razorpay Interview Experience (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/razorpay-interview-experience/",
          kind: "candidate-report",
        },
      ],
      query:
        "WITH dept_avg AS (\n  SELECT dept_id, AVG(salary) AS avg_salary\n  FROM employees\n  GROUP BY dept_id\n)\nSELECT e.name, e.salary, ROUND(a.avg_salary, 1) AS dept_avg\nFROM employees e\nJOIN dept_avg a ON a.dept_id = e.dept_id\nWHERE e.salary > a.avg_salary\nORDER BY e.id",
      result: {
        head: ["name", "salary", "dept_avg"],
        rows: [
          ["Asha", "9000", "7666.7"],
          ["Dev", "8000", "6000.0"],
        ],
      },
    },
    {
      id: "sql-latest-order-per-customer",
      theme: "subqueries",
      q: "Live on a given schema: return each customer's most recent completed order.",
      a: '<p>A typical live task is "latest completed order for each customer". A correlated subquery solves it: keep an order only if its date equals the maximum completed date for the same customer.</p><p>Say your approach aloud: state the grain of the output (one row per customer), choose the grouping key, decide how cancelled rows are treated, and ask about ties. If a customer placed two orders on their latest day, this query returns both, as it does for customer 6 (orders 12 and 15). <code>ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC, id DESC)</code> with <code>rn = 1</code> returns exactly one.</p><p>The guest order with a NULL customer is excluded because <code>NULL = NULL</code> is not true. That is usually right here, but say so. Follow-up: the same shape answers "maximum score for each student in the latest semester".</p>',
      level: "Core",
      companies: ["paytm", "microsoft", "zomato", "phonepe"],
      evidence: "several",
      sources: [
        {
          label: "Paytm Interview Experience for Data Engineer (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/paytm-interview-experience-for-data-engineer/",
          kind: "candidate-report",
        },
        {
          label: "Microsoft Interview | Set 5 (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/microsoft-interview-set-5/",
          kind: "candidate-report",
        },
        {
          label: "Zomato Interview Experience (On - Campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/zomato-interview-experience-on-campus-2/",
          kind: "candidate-report",
        },
        {
          label: "PhonePe Interview Experience for Software Engineer FTE (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/phonepe-interview-experience-for-software-engineer-fte/",
          kind: "candidate-report",
        },
      ],
      query:
        "SELECT o.customer_id, o.id AS order_id, o.order_date, o.amount\nFROM orders o\nWHERE o.status = 'completed'\n  AND o.order_date = (\n    SELECT MAX(i.order_date)\n    FROM orders i\n    WHERE i.customer_id = o.customer_id AND i.status = 'completed'\n  )\nORDER BY o.customer_id",
      result: {
        head: ["customer_id", "order_id", "order_date", "amount"],
        rows: [
          ["1", "11", "2026-03-15", "150"],
          ["2", "10", "2026-03-01", "600"],
          ["3", "14", "2026-03-20", "250"],
          ["4", "13", "2026-03-20", "900"],
          ["6", "12", "2026-03-20", "400"],
          ["6", "15", "2026-03-20", "600"],
        ],
      },
    },
    {
      id: "sql-rank-dense-rank-row-number",
      theme: "windows",
      q: "How do ROW_NUMBER, RANK and DENSE_RANK differ when there are ties?",
      a: '<p>All three number rows inside an ordered window. <code>ROW_NUMBER</code> gives unique numbers and breaks ties arbitrarily unless you add a tiebreaker. <code>RANK</code> gives tied rows the same number and then skips ahead (1, 2, 3, 3, 5). <code>DENSE_RANK</code> gives tied rows the same number with no gaps (1, 2, 3, 3, 4).</p><p>In the output Bilal and Chen both earn 7000, so they share rank 3 and dense rank 3. The next salary, 6500, is rank 5 but dense rank 4. <code>ROW_NUMBER</code> gives them 3 and 4 by name order.</p><p>Use <code>ROW_NUMBER</code> to pick exactly one row per group (deduplication, latest record), <code>RANK</code> when competition-style gaps are wanted, and <code>DENSE_RANK</code> for "the Nth distinct value". Follow-up: <code>NTILE</code> and <code>PERCENT_RANK</code>. Window functions need SQLite 3.25 or newer.</p>',
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
        {
          label: "SQL Query to Find Second Highest Salary (GeeksforGeeks, generic guide)",
          url: "https://www.geeksforgeeks.org/sql/sql-query-to-find-second-largest-salary/",
          kind: "prep-guide",
        },
      ],
      query:
        "SELECT name, salary,\n  ROW_NUMBER() OVER (ORDER BY salary DESC, name) AS row_num,\n  RANK() OVER (ORDER BY salary DESC) AS rnk,\n  DENSE_RANK() OVER (ORDER BY salary DESC) AS dense_rnk\nFROM employees\nORDER BY salary DESC, name",
      result: {
        head: ["name", "salary", "row_num", "rnk", "dense_rnk"],
        rows: [
          ["Asha", "9000", "1", "1", "1"],
          ["Dev", "8000", "2", "2", "2"],
          ["Bilal", "7000", "3", "3", "3"],
          ["Chen", "7000", "4", "3", "3"],
          ["Hari", "6500", "5", "5", "4"],
          ["Esha", "5000", "6", "6", "5"],
          ["Farid", "5000", "7", "6", "5"],
          ["Gita", "4000", "8", "8", "6"],
        ],
      },
    },
    {
      id: "sql-nth-highest-salary",
      theme: "windows",
      q: "Write a query for the Nth highest salary and say how ties behave.",
      a: "<p>Use <code>DENSE_RANK() OVER (ORDER BY salary DESC)</code> and keep rank N. It counts distinct salaries, so N means the Nth highest <em>value</em> even with ties. The 3rd highest salary here is 7000, shared by Bilal and Chen, so two rows return.</p><p>Alternatives and their pitfalls:</p><ul><li><code>ORDER BY salary DESC LIMIT 1 OFFSET N-1</code> counts duplicates as separate positions. For the 4th highest, <code>OFFSET 3</code> returns 7000 again instead of 6500 unless you select <code>DISTINCT salary</code> first.</li><li><code>RANK</code> skips numbers, so asking for the 4th highest returns nothing here, because the ranks run 1, 2, 3, 3, 5.</li><li>The nested <code>MAX(salary) WHERE salary &lt; (SELECT MAX(salary) ...)</code> works for the 2nd but nests badly for N.</li></ul><p>If fewer than N distinct values exist, decide whether to return no rows or NULL. For a per-department answer add <code>PARTITION BY dept_id</code>.</p>",
      level: "Core",
      companies: ["phonepe", "amazon"],
      evidence: "several",
      sources: [
        {
          label: "Phonepe Interview Experience (On-campus) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/phonepe-interview-experience-on-campus-1/",
          kind: "candidate-report",
        },
        {
          label: "Amazon Interview Experience | Business Analyst (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-business-analyst/",
          kind: "candidate-report",
        },
        {
          label: "Flipkart data engineer interview questions, SQL section (Greenroom, vendor guide)",
          url: "https://usegreenroom.app/blog/flipkart-data-engineer-interview-questions",
          kind: "prep-guide",
          year: 2026,
        },
        {
          label: "Atlassian Coding Interview Questions (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/atlassian-interview-questions-for-technical-profiles/",
          kind: "prep-guide",
        },
        {
          label: "SQL Query to Find Second Highest Salary (GeeksforGeeks, generic guide)",
          url: "https://www.geeksforgeeks.org/sql/sql-query-to-find-second-largest-salary/",
          kind: "prep-guide",
        },
      ],
      query:
        "SELECT name, salary\nFROM (\n  SELECT name, salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk\n  FROM employees\n) AS ranked\nWHERE rnk = 3\nORDER BY name",
      result: {
        head: ["name", "salary"],
        rows: [
          ["Bilal", "7000"],
          ["Chen", "7000"],
        ],
      },
    },
    {
      id: "sql-top-n-per-group",
      theme: "windows",
      q: "How do you get the top N products within each category?",
      a: "<p>Top N per group means ranking inside each group and then filtering. Compute revenue per category and product, rank with <code>RANK() OVER (PARTITION BY category ORDER BY revenue DESC)</code> in a CTE, and keep <code>rnk &lt;= 2</code>. A window result cannot be filtered in the <code>WHERE</code> of the same <code>SELECT</code> (some engines add <code>QUALIFY</code>), so the filter sits in an outer query.</p><p>Ties decide the function. In Toys, Puzzle and Blocks both earn 600, so <code>RANK</code> returns three Toys rows, <code>DENSE_RANK</code> also keeps both, and <code>ROW_NUMBER</code> would keep an arbitrary one. State the rule you want before you write it.</p><p>Pitfalls: filter the status inside the revenue CTE, and agree whether top means revenue or units. Follow-up: without window functions, use a correlated count (keep a row when fewer than N products in its category earn more) or <code>LATERAL</code> and <code>CROSS APPLY</code> in engines that have them.</p>",
      level: "Deep",
      companies: ["amazon"],
      evidence: "several",
      sources: [
        {
          label: "Amazon Interview Experience | Business Analyst (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-business-analyst/",
          kind: "candidate-report",
        },
        {
          label: "Flipkart data engineer interview questions, SQL section (Greenroom, vendor guide)",
          url: "https://usegreenroom.app/blog/flipkart-data-engineer-interview-questions",
          kind: "prep-guide",
          year: 2026,
        },
      ],
      query:
        "WITH revenue AS (\n  SELECT category, product, SUM(amount) AS total\n  FROM orders\n  WHERE status = 'completed'\n  GROUP BY category, product\n),\nranked AS (\n  SELECT category, product, total,\n    RANK() OVER (PARTITION BY category ORDER BY total DESC) AS rnk\n  FROM revenue\n)\nSELECT category, product, total, rnk\nFROM ranked\nWHERE rnk <= 2\nORDER BY category, rnk, product",
      result: {
        head: ["category", "product", "total", "rnk"],
        rows: [
          ["Books", "Atlas", "800", "1"],
          ["Books", "Novel", "500", "2"],
          ["Games", "Chess", "1200", "1"],
          ["Games", "Cards", "150", "2"],
          ["Toys", "Robot", "2700", "1"],
          ["Toys", "Blocks", "600", "2"],
          ["Toys", "Puzzle", "600", "2"],
        ],
      },
    },
    {
      id: "sql-top-three-buyers",
      theme: "windows",
      q: "Return the top three buyers by completed orders, and explain what happens with ties.",
      a: "<p>Count completed orders per customer, rank the counts, and keep ranks up to 3. <code>LIMIT 3</code> is the tempting shortcut, but it cuts through ties arbitrarily. Here Omar has 4 orders and Maya 3, while three customer rows tie at 2 and all take rank 3, so five rows qualify and <code>LIMIT 3</code> would drop two of them at random.</p><p>The ranking function matters once ties sit higher up. If two buyers tied for first, <code>RANK</code> would give the next buyer rank 3, while <code>DENSE_RANK</code> would give rank 2 and so return more people.</p><p>Join to <code>customers</code> after ranking, and exclude NULL customers (guest checkouts) so they do not form a group of their own. Another pitfall: two accounts with the same email show up as separate buyers, which the deduplication questions cover.</p><p>Ask the interviewer what top three means with ties and what should break them, such as revenue or earliest order, then add those as secondary sort keys inside the window.</p>",
      level: "Core",
      companies: ["cred"],
      evidence: "one",
      sources: [
        {
          label: "CRED Product Analyst interview, SQL and Python rounds, Sep 2022 (Naukri Code360)",
          url: "https://www.naukri.com/code360/interview-experiences/cred/interview-experience-off-campus-sep-2022-2-5464",
          kind: "candidate-report",
          year: 2022,
        },
      ],
      query:
        "WITH counts AS (\n  SELECT customer_id, COUNT(*) AS completed_orders\n  FROM orders\n  WHERE status = 'completed' AND customer_id IS NOT NULL\n  GROUP BY customer_id\n),\nranked AS (\n  SELECT customer_id, completed_orders,\n    RANK() OVER (ORDER BY completed_orders DESC) AS rnk\n  FROM counts\n)\nSELECT c.id, c.name, r.completed_orders, r.rnk\nFROM ranked r\nJOIN customers c ON c.id = r.customer_id\nWHERE r.rnk <= 3\nORDER BY r.rnk, c.id",
      result: {
        head: ["id", "name", "completed_orders", "rnk"],
        rows: [
          ["3", "Omar", "4", "1"],
          ["1", "Maya", "3", "2"],
          ["2", "Noor", "2", "3"],
          ["4", "Maya", "2", "3"],
          ["6", "Noor", "2", "3"],
        ],
      },
    },
    {
      id: "sql-running-total-window-frame",
      theme: "windows",
      q: "How do you compute a running total or rolling window with a window frame?",
      a: "<p>A running total is a window <code>SUM</code> over an ordered frame. Aggregate to one row per day first, then use <code>SUM(SUM(amount)) OVER (PARTITION BY category ORDER BY order_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)</code>. The inner <code>SUM</code> is the group aggregate and the outer one is the window.</p><p>State the frame. With only <code>ORDER BY</code>, the default is a <code>RANGE</code> frame that treats rows with equal sort keys as peers and adds them together, while <code>ROWS</code> counts physical rows. The two differ when the same key repeats within a partition.</p><p>A rolling 7-day window is <code>ROWS BETWEEN 6 PRECEDING AND CURRENT ROW</code>, which is correct only if every day has a row. Otherwise join to a calendar table or use a <code>RANGE</code> frame over dates where the engine supports it. Follow-up: retention, which compares each user's events with a week later.</p>",
      level: "Deep",
      companies: [],
      evidence: "guide",
      sources: [
        {
          label: "Flipkart data engineer interview questions, SQL section (Greenroom, vendor guide)",
          url: "https://usegreenroom.app/blog/flipkart-data-engineer-interview-questions",
          kind: "prep-guide",
          year: 2026,
        },
      ],
      query:
        "SELECT category, order_date,\n  SUM(amount) AS day_revenue,\n  SUM(SUM(amount)) OVER (\n    PARTITION BY category\n    ORDER BY order_date\n    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n  ) AS running_revenue\nFROM orders\nWHERE status = 'completed'\nGROUP BY category, order_date\nORDER BY category, order_date",
      result: {
        head: ["category", "order_date", "day_revenue", "running_revenue"],
        rows: [
          ["Books", "2026-01-05", "400", "400"],
          ["Books", "2026-01-20", "250", "650"],
          ["Books", "2026-02-10", "250", "900"],
          ["Books", "2026-03-20", "650", "1550"],
          ["Games", "2026-02-10", "600", "600"],
          ["Games", "2026-03-01", "600", "1200"],
          ["Games", "2026-03-15", "150", "1350"],
          ["Toys", "2026-01-20", "900", "900"],
          ["Toys", "2026-02-03", "900", "1800"],
          ["Toys", "2026-02-10", "300", "2100"],
          ["Toys", "2026-03-01", "300", "2400"],
          ["Toys", "2026-03-20", "1500", "3900"],
        ],
      },
    },
    {
      id: "sql-month-on-month-lag",
      theme: "windows",
      q: "Report revenue per month and the change from the previous month.",
      a: "<p>Aggregate to one row per month, then compare each month with the one before using <code>LAG(revenue) OVER (ORDER BY month)</code>. The first month has no predecessor, so <code>LAG</code> returns NULL and the difference is NULL. Pass a third argument, <code>LAG(revenue, 1, 0)</code>, if you want a default.</p><p>The month key here is <code>SUBSTR(order_date, 1, 7)</code>, which works because dates are ISO text. Other engines use <code>DATE_TRUNC('month', d)</code>, <code>TO_CHAR</code> or <code>EXTRACT</code>, and SQLite also has <code>strftime('%Y-%m', d)</code>.</p><p>Pitfalls: <code>LAG</code> looks at the previous existing row, so a month with no sales is skipped rather than shown as zero; and a growth percentage divides by the previous value, which needs <code>NULLIF(prev, 0)</code>. Variant: units, average selling price and revenue per month in one pass with <code>COUNT</code>, <code>AVG</code> and <code>SUM</code>.</p>",
      level: "Deep",
      companies: ["amazon"],
      evidence: "one",
      sources: [
        {
          label: "Amazon Interview Experience | Business Analyst (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-business-analyst/",
          kind: "candidate-report",
        },
      ],
      query:
        "WITH monthly AS (\n  SELECT SUBSTR(order_date, 1, 7) AS month, SUM(amount) AS revenue\n  FROM orders\n  WHERE status = 'completed'\n  GROUP BY SUBSTR(order_date, 1, 7)\n)\nSELECT month, revenue,\n  LAG(revenue) OVER (ORDER BY month) AS prev_revenue,\n  revenue - LAG(revenue) OVER (ORDER BY month) AS change\nFROM monthly\nORDER BY month",
      result: {
        head: ["month", "revenue", "prev_revenue", "change"],
        rows: [
          ["2026-01", "1550", "NULL", "NULL"],
          ["2026-02", "2050", "1550", "500"],
          ["2026-03", "3200", "2050", "1150"],
        ],
      },
    },
    {
      id: "sql-union-vs-union-all",
      theme: "nulls-sets",
      q: "What is the difference between UNION and UNION ALL?",
      a: "<p><code>UNION</code> combines two result sets and removes duplicate rows. <code>UNION ALL</code> keeps every row. Both need the same number of columns with compatible types, and the column names come from the first query.</p><p>The example takes the cities of two departments. <code>UNION</code> returns 3 rows (Delhi, Mumbai, Pune) while <code>UNION ALL</code> returns 6. Removing duplicates means sorting or hashing the whole result, so <code>UNION ALL</code> is cheaper. Prefer it when the inputs cannot overlap or when duplicates matter, as when summing across partitions.</p><p>Related operators: <code>INTERSECT</code> returns rows present in both inputs and <code>EXCEPT</code> (<code>MINUS</code> in Oracle) returns rows only in the first; both deduplicate. Pitfall: set operators treat two NULLs as equal for duplicate removal, unlike <code>=</code>. An <code>ORDER BY</code> applies to the whole combined result and goes last.</p>",
      level: "Core",
      companies: ["amazon"],
      evidence: "several",
      sources: [
        {
          label: "Amazon Interview Experience For SDE Intern (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-for-sde-intern-8/",
          kind: "candidate-report",
        },
        {
          label: "Top 100 SQL Interview Questions and Answers (GeeksforGeeks, generic guide)",
          url: "https://www.geeksforgeeks.org/sql/sql-interview-questions/",
          kind: "prep-guide",
        },
      ],
      query:
        "SELECT 'UNION' AS operator, COUNT(*) AS rows_returned\nFROM (\n  SELECT city FROM employees WHERE dept_id = 1\n  UNION\n  SELECT city FROM employees WHERE dept_id = 2\n) AS u\nUNION ALL\nSELECT 'UNION ALL', COUNT(*)\nFROM (\n  SELECT city FROM employees WHERE dept_id = 1\n  UNION ALL\n  SELECT city FROM employees WHERE dept_id = 2\n) AS a",
      result: {
        head: ["operator", "rows_returned"],
        rows: [
          ["UNION", "3"],
          ["UNION ALL", "6"],
        ],
      },
    },
    {
      id: "sql-null-handling",
      theme: "nulls-sets",
      q: "How does NULL behave in comparisons, aggregates and joins?",
      a: "<p>NULL means unknown, so a comparison with it is neither true nor false. <code>x = NULL</code> and <code>x &lt;&gt; NULL</code> are unknown and filter out every row, so test with <code>IS NULL</code> or <code>IS NOT NULL</code>. Aggregates skip NULLs: <code>COUNT(col)</code> and <code>AVG(col)</code> ignore them, while <code>COUNT(*)</code> counts rows.</p><p>In a join, a NULL key never equals anything, not even another NULL. The query shows 15 orders, 14 with a customer, 14 rows from the inner join, and 1 order with a NULL key that only a left join would keep. A NULL inside a <code>NOT IN</code> list means the predicate is never true, so no rows come back.</p><p>Handy tools: <code>COALESCE(col, 0)</code>, <code>NULLIF(a, b)</code> to avoid division by zero, and a null-safe equality (<code>IS NOT DISTINCT FROM</code>, <code>IS</code> in SQLite, <code>&lt;=&gt;</code> in MySQL). Where NULLs sort differs by engine.</p>",
      level: "Core",
      companies: ["paytm"],
      evidence: "several",
      sources: [
        {
          label: "Paytm Interview Experience for Data Engineer (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/paytm-interview-experience-for-data-engineer/",
          kind: "candidate-report",
        },
        {
          label: "Top 100 SQL Interview Questions and Answers (GeeksforGeeks, generic guide)",
          url: "https://www.geeksforgeeks.org/sql/sql-interview-questions/",
          kind: "prep-guide",
        },
      ],
      query:
        "SELECT\n  (SELECT COUNT(*) FROM orders) AS all_orders,\n  (SELECT COUNT(customer_id) FROM orders) AS with_customer,\n  (SELECT COUNT(*) FROM orders o JOIN customers c ON c.id = o.customer_id) AS inner_join_rows,\n  (SELECT COUNT(*) FROM orders WHERE customer_id IS NULL) AS null_key_rows",
      result: {
        head: ["all_orders", "with_customer", "inner_join_rows", "null_key_rows"],
        rows: [["15", "14", "14", "1"]],
      },
    },
    {
      id: "sql-find-duplicate-rows",
      theme: "dedup",
      q: "How do you find duplicate rows in a table?",
      a: "<p>Group by the column that should be unique and keep the groups with more than one row: <code>GROUP BY email HAVING COUNT(*) &gt; 1</code>. The output lists each duplicated email, how many copies exist, and the lowest id, which is the usual survivor.</p><p>Clarify what duplicate means before writing. Is it the email alone or the whole row? Do case and whitespace count (<code>LOWER(TRIM(email))</code>)? Which copy is kept, the lowest id or the newest? Whole-row duplicates use <code>SELECT DISTINCT</code> or group by every column.</p><p>Prevent them rather than only finding them: add a unique index on the normalised email, such as <code>LOWER(email)</code> where the engine supports expression indexes. Follow-ups are how to delete the extras, covered in the next question, and what to do with rows in other tables that reference the duplicates.</p>",
      level: "Core",
      companies: ["flipkart"],
      evidence: "several",
      sources: [
        {
          label: "Flipkart Interview | Set 14 (For SDET-1) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/flipkart-interview-set-14-sde-1/",
          kind: "candidate-report",
        },
        {
          label: "Top 50 SQL Questions For Data Analyst Interview (GeeksforGeeks, generic guide)",
          url: "https://www.geeksforgeeks.org/data-analysis/sql-questions-for-data-analyst-interview/",
          kind: "prep-guide",
        },
      ],
      query:
        "SELECT email, COUNT(*) AS copies, MIN(id) AS keep_id\nFROM customers\nGROUP BY email\nHAVING COUNT(*) > 1\nORDER BY email",
      result: {
        head: ["email", "copies", "keep_id"],
        rows: [
          ["maya@example.com", "2", "1"],
          ["noor@example.com", "2", "2"],
        ],
      },
    },
    {
      id: "sql-delete-duplicates-keep-one",
      theme: "dedup",
      q: "How do you delete duplicate rows but keep one copy of each?",
      a: "<p>First select the rows to remove, then delete exactly those. <code>ROW_NUMBER() OVER (PARTITION BY email ORDER BY id)</code> numbers the copies of each email, so every row with <code>rn &gt; 1</code> is a surplus copy and the lowest id survives. The query lists those rows: ids 4 and 6.</p><p>A portable delete is <code>DELETE FROM customers WHERE id NOT IN (SELECT MIN(id) FROM customers GROUP BY email)</code>. MySQL rejects selecting from the table being deleted unless the subquery is wrapped in a derived table. PostgreSQL can use <code>USING</code>, and SQL Server can delete through a CTE.</p><p>Before running it, repoint dependent rows. Orders 8, 12, 13 and 15 reference customers 4 and 6, so a foreign key would block the delete or leave orphans. Run the select first, wrap the work in a transaction, and add a unique constraint afterwards. With no key at all, copy the distinct rows into a new table and swap it in.</p>",
      level: "Deep",
      companies: ["flipkart"],
      evidence: "several",
      sources: [
        {
          label: "Flipkart Interview | Set 14 (For SDET-1) (GeeksforGeeks)",
          url: "https://www.geeksforgeeks.org/interview-experiences/flipkart-interview-set-14-sde-1/",
          kind: "candidate-report",
        },
        {
          label: "Top 100 SQL Interview Questions and Answers (GeeksforGeeks, generic guide)",
          url: "https://www.geeksforgeeks.org/sql/sql-interview-questions/",
          kind: "prep-guide",
        },
      ],
      query:
        "SELECT id, name, email\nFROM (\n  SELECT id, name, email,\n    ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) AS rn\n  FROM customers\n) AS numbered\nWHERE rn > 1\nORDER BY id",
      result: {
        head: ["id", "name", "email"],
        rows: [
          ["4", "Maya", "maya@example.com"],
          ["6", "Noor", "noor@example.com"],
        ],
      },
    },
  ],
};
