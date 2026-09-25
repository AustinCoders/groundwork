import type { LanguageKey } from "@/lib/codeLanguages";

export interface Template {
  name: string;
  code: string;
}

const JS: Template[] = [
  {
    name: "Hello, sandbox",
    code: `// Playground — anything you write here runs in a sandbox.
// ⌘/Ctrl + Enter to run.

const notes = ["types", "closures", "the event loop"];

notes.forEach(function (topic, i) {
  console.log(i + 1, topic);
});

console.log({ layers: 9, mood: "caffeinated" });
`,
  },
  {
    name: "Event loop order",
    code: `// Predict the order before you run it.
console.log("1 · script start");

setTimeout(() => console.log("5 · timeout (macrotask)"), 0);

Promise.resolve()
  .then(() => console.log("3 · promise (microtask)"))
  .then(() => console.log("4 · chained microtask"));

queueMicrotask(() => console.log("3b · queueMicrotask"));

console.log("2 · script end");
`,
  },
  {
    name: "Closures",
    code: `function counter(start = 0) {
  let count = start;
  return {
    up: () => ++count,
    down: () => --count,
    get value() {
      return count;
    },
  };
}

const a = counter();
const b = counter(10);
a.up();
a.up();
b.down();
console.log("a:", a.value, "b:", b.value); // each closure keeps its own count
`,
  },
  {
    name: "async / await",
    code: `const wait = (ms, value) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

async function main() {
  console.time("in turn");
  await wait(100, "a");
  await wait(100, "b");
  console.timeEnd("in turn");

  console.time("together");
  const both = await Promise.all([wait(100, "a"), wait(100, "b")]);
  console.timeEnd("together");
  console.log(both);
}

main();
`,
  },
  {
    name: "Which is faster?",
    code: `const nums = Array.from({ length: 10_000 }, (_, i) => i);

compare({
  "for loop": () => {
    let sum = 0;
    for (let i = 0; i < nums.length; i++) sum += nums[i];
    return sum;
  },
  reduce: () => nums.reduce((a, b) => a + b, 0),
  "for...of": () => {
    let sum = 0;
    for (const n of nums) sum += n;
    return sum;
  },
});
`,
  },
  {
    name: "Array methods",
    code: `const orders = [
  { id: 1, total: 42, paid: true },
  { id: 2, total: 17, paid: false },
  { id: 3, total: 99, paid: true },
];

const revenue = orders.filter((o) => o.paid).reduce((sum, o) => sum + o.total, 0);
const byId = Object.fromEntries(orders.map((o) => [o.id, o]));
const [biggest] = orders.toSorted((a, b) => b.total - a.total);

console.log({ revenue, biggest: biggest.id });
console.table(orders);
console.log(byId[2]);
`,
  },
];

const TS: Template[] = [
  {
    name: "Hello, types",
    code: `// TypeScript is compiled in your browser, then run.
type Level = "beginner" | "intermediate" | "advanced";

interface Topic {
  name: string;
  level: Level;
}

const topics: Topic[] = [
  { name: "Generics", level: "intermediate" },
  { name: "Narrowing", level: "beginner" },
];

for (const t of topics) console.log(\`\${t.name} (\${t.level})\`);
`,
  },
  {
    name: "Generics",
    code: `function groupBy<T, K extends PropertyKey>(items: T[], key: (item: T) => K): Record<K, T[]> {
  const out = {} as Record<K, T[]>;
  for (const item of items) (out[key(item)] ??= []).push(item);
  return out;
}

const words = ["apple", "avocado", "banana", "blueberry", "cherry"];
console.log(groupBy(words, (w) => w[0]));
`,
  },
  {
    name: "Discriminated unions",
    code: `type Shape =
  | { kind: "circle"; r: number }
  | { kind: "rect"; w: number; h: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle":
      return Math.PI * s.r ** 2;
    case "rect":
      return s.w * s.h;
  }
}

console.log(area({ kind: "circle", r: 1 }).toFixed(2), area({ kind: "rect", w: 3, h: 4 }));
`,
  },
];

const PY: Template[] = [
  {
    name: "Hello, Python",
    code: `# Runs in your browser with Pyodide — the first run downloads it.
topics = ["lists", "dicts", "comprehensions"]

for i, topic in enumerate(topics, start=1):
    print(i, topic)

print({t: len(t) for t in topics})
`,
  },
  {
    name: "Comprehensions",
    code: `nums = range(1, 21)

squares = [n * n for n in nums if n % 2 == 0]
by_parity = {"even": [n for n in nums if n % 2 == 0], "odd": [n for n in nums if n % 2]}
pairs = [(a, b) for a in range(1, 4) for b in range(a, 4)]

print(squares)
print(by_parity)
print(pairs)
`,
  },
  {
    name: "Which is faster?",
    code: `nums = list(range(10_000))

def with_loop():
    total = 0
    for n in nums:
        total += n
    return total

compare({
    "for loop": with_loop,
    "sum()": lambda: sum(nums),
    "comprehension": lambda: sum([n for n in nums]),
})
`,
  },
  {
    name: "Dataclasses",
    code: `from dataclasses import dataclass, field

@dataclass(order=True)
class Task:
    priority: int
    title: str = field(compare=False)
    done: bool = field(default=False, compare=False)

tasks = sorted([Task(3, "write tests"), Task(1, "fix the bug"), Task(2, "review")])
for t in tasks:
    print(t)
`,
  },
];

const SQL: Template[] = [
  {
    name: "Joins & group by",
    code: `-- An in-memory SQLite database, fresh on every run.
CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE orders (id INTEGER PRIMARY KEY, user_id INTEGER, total REAL);

INSERT INTO users VALUES (1, 'Ada'), (2, 'Ben'), (3, 'Chen');
INSERT INTO orders VALUES (1, 1, 40), (2, 1, 25), (3, 2, 90);

SELECT u.name, COUNT(o.id) AS orders, COALESCE(SUM(o.total), 0) AS spent
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id
ORDER BY spent DESC;
`,
  },
  {
    name: "Window functions",
    code: `CREATE TABLE sales (region TEXT, month INTEGER, amount INTEGER);
INSERT INTO sales VALUES
  ('north', 1, 100), ('north', 2, 140), ('north', 3, 90),
  ('south', 1, 80), ('south', 2, 60), ('south', 3, 120);

SELECT region, month, amount,
  SUM(amount) OVER (PARTITION BY region ORDER BY month) AS running_total,
  RANK() OVER (PARTITION BY region ORDER BY amount DESC) AS rank_in_region
FROM sales;
`,
  },
];

const HTML: Template[] = [
  {
    name: "A page",
    code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>My page</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <main class="card">
      <h1>Hello, page</h1>
      <p>Clicked <strong id="count">0</strong> times.</p>
      <button id="btn">Click me</button>
    </main>
    <script src="script.js"></script>
  </body>
</html>
`,
  },
];

const CSS: Template[] = [
  {
    name: "Card",
    code: `body {
  display: grid;
  place-items: center;
  min-height: 100vh;
  margin: 0;
  font-family: system-ui, sans-serif;
  background: #f4f1ea;
}

.card {
  padding: 28px 32px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 10px 30px rgb(0 0 0 / 0.12);
  text-align: center;
}

button {
  padding: 10px 18px;
  font: inherit;
  border: 0;
  border-radius: 999px;
  background: #2f6f4e;
  color: white;
  cursor: pointer;
}
`,
  },
];

export const PAGE_SCRIPT = `const btn = document.getElementById("btn");
const count = document.getElementById("count");
let clicks = 0;

btn.addEventListener("click", () => {
  clicks += 1;
  count.textContent = clicks;
  console.log("clicked", clicks);
});
`;

const HELLO: Partial<Record<LanguageKey, string>> = {
  cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<string> topics = {"pointers", "templates", "the STL"};\n    for (size_t i = 0; i < topics.size(); i++) {\n        cout << i + 1 << " " << topics[i] << "\\n";\n    }\n    return 0;\n}\n`,
  c: `#include <stdio.h>\n\nint main(void) {\n    const char *topics[] = {"pointers", "structs", "memory"};\n    for (int i = 0; i < 3; i++) {\n        printf("%d %s\\n", i + 1, topics[i]);\n    }\n    return 0;\n}\n`,
  java: `public class Main {\n    public static void main(String[] args) {\n        String[] topics = {"classes", "interfaces", "streams"};\n        for (int i = 0; i < topics.length; i++) {\n            System.out.println((i + 1) + " " + topics[i]);\n        }\n    }\n}\n`,
  go: `package main\n\nimport "fmt"\n\nfunc main() {\n	topics := []string{"goroutines", "channels", "interfaces"}\n	for i, t := range topics {\n		fmt.Println(i+1, t)\n	}\n}\n`,
  rust: `fn main() {\n    let topics = ["ownership", "borrowing", "lifetimes"];\n    for (i, t) in topics.iter().enumerate() {\n        println!("{} {}", i + 1, t);\n    }\n}\n`,
  kotlin: `fun main() {\n    val topics = listOf("null safety", "data classes", "coroutines")\n    topics.forEachIndexed { i, t -> println("\${i + 1} $t") }\n}\n`,
  swift: `let topics = ["optionals", "protocols", "value types"]\nfor (i, t) in topics.enumerated() {\n    print(i + 1, t)\n}\n`,
  csharp: `using System;\n\nclass Program {\n    static void Main() {\n        string[] topics = { "LINQ", "async", "records" };\n        for (int i = 0; i < topics.Length; i++) {\n            Console.WriteLine($"{i + 1} {topics[i]}");\n        }\n    }\n}\n`,
  ruby: `topics = %w[blocks symbols mixins]\ntopics.each_with_index { |t, i| puts "#{i + 1} #{t}" }\n`,
  php: `<?php\n$topics = ["arrays", "closures", "traits"];\nforeach ($topics as $i => $t) {\n    echo ($i + 1) . " " . $t . "\\n";\n}\n`,
  lua: `local topics = { "tables", "metatables", "coroutines" }\nfor i, t in ipairs(topics) do\n  print(i, t)\nend\n`,
};

export function templatesFor(lang: LanguageKey): Template[] {
  switch (lang) {
    case "javascript":
      return JS;
    case "typescript":
      return TS;
    case "python":
      return PY;
    case "sql":
      return SQL;
    case "html":
      return HTML;
    case "css":
      return CSS;
    default:
      return HELLO[lang] ? [{ name: "Hello, world", code: HELLO[lang]! }] : [];
  }
}
