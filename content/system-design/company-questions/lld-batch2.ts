import type { LldQuestion } from "./lld-types";

export const questions: LldQuestion[] = [
  {
    id: "atlassian-rate-limiter",
    company: "atlassian",
    title: "Rate limiter with pluggable algorithms",
    prompt:
      "Design a rate limiter for an API. Given requests that carry millisecond timestamps, decide for each one whether it is allowed, for example when a user may send at most two pings per second. Reports describe this both as a short pseudocode design and as a concrete function, so be ready to show a small class design and to compare the algorithms you could plug in.",
    level: "SDE-2 (off-campus); internship; Principal (Poland)",
    round: "lld",
    topic: "infra",
    patterns: ["Strategy", "Factory", "Sliding window", "Token bucket"],
    evidence: "several",
    sources: [
      {
        label: "Atlassian Interview Experience for SDE-2, off-campus (GeeksforGeeks)",
        url: "https://www.geeksforgeeks.org/atlassian-interview-experience-for-sde-2-off-campus",
        kind: "candidate-report",
      },
      {
        label: "Atlassian Interview Experience for Internship, on-campus (GeeksforGeeks)",
        url: "https://www.geeksforgeeks.org/interview-experiences/atlassian-interview-experience-for-internship-on-campus/",
        kind: "candidate-report",
        year: 2022,
      },
      {
        label: "Atlassian Principal Software Engineer, Poland (Jointaro)",
        url: "https://www.jointaro.com/interviews/companies/atlassian/experiences/principal-software-engineer-poland-december-1-2024-no-offer-negative-bb3c6bd9/",
        kind: "candidate-report",
        year: 2024,
      },
    ],
    chapters: ["sysdes-rate-limiting"],
    answer: {
      ask: "<p>Questions worth asking before you write a line:</p>\n<ul>\n<li>What identifies the caller: a user id, an API key, an IP address? <em>Assume an opaque string key.</em></li>\n<li>Is there one limit or several, such as per second and per minute? <em>Assume one named rule has one limit, and many rules can be registered side by side.</em></li>\n<li>One process or a fleet of servers? <em>Assume one process, and say what changes for a fleet.</em></li>\n<li>Should a rejected caller learn when to try again? <em>Assume yes.</em></li>\n<li>How exact must the count be at window edges? <em>Assume the owner of each rule chooses the algorithm, and that a request exactly one window old no longer counts.</em></li>\n</ul>\n<p>In scope: the limiter interface, three algorithms, a factory that validates the spec, a service that holds named rules, and an injected clock. Out of scope: shared storage across servers, hot reload of configuration, HTTP headers and metrics.</p>",
      entities:
        '<ul>\n<li><b>Clock</b> is an injected collaborator with <code>now()</code> in milliseconds. Tests use a manual clock, so no test ever sleeps.</li>\n<li><b>Limiter</b> is the interface: <code>tryAcquire(key)</code> returns a decision. Every algorithm implements it.</li>\n<li><b>Decision</b> is a small value: <code>allowed</code> plus <code>retryAfterMs</code>, so callers can build a retry hint.</li>\n<li><b>FixedWindowLimiter</b>, <b>SlidingWindowLogLimiter</b> and <b>TokenBucketLimiter</b> implement Limiter. Each owns a map from key to its own small state and reads the shared clock.</li>\n<li><b>createLimiter</b> is a factory that turns a plain spec such as <code>{ type: "bucket", capacity: 3 }</code> into a limiter.</li>\n<li><b>RateLimiterService</b> has many named rules, each one limiter, and exposes <code>check(rule, key)</code>. Callers never see the algorithm.</li>\n</ul>',
      design:
        "<p>The core of the design is <b>one narrow interface</b> and several interchangeable algorithms. <code>RateLimiterService</code> only knows <code>Limiter.tryAcquire(key)</code>, so choosing fixed window, sliding log or token bucket is a one line change in a rule's spec. That is the Strategy pattern, and the factory keeps construction details out of the service.</p>\n<p>The three algorithms trade accuracy against cost:</p>\n<ul>\n<li><b>Fixed window</b> keeps a count per key and resets it when the window number changes. It is O(1) in time and memory, but a caller can send the full limit just before a boundary and again just after it, so up to twice the limit passes in a short span.</li>\n<li><b>Sliding window log</b> keeps the timestamps of accepted requests, drops those at or before <code>now - window</code>, and compares the remaining count with the limit. It is exact, costs O(limit) memory per key, and each timestamp is added and removed once. Array <code>shift</code> is linear on long arrays, so a large limit wants a ring buffer.</li>\n<li><b>Token bucket</b> stores a token balance and the time of the last refill. On each call it adds <code>elapsed * rate</code> tokens, capped at capacity, then spends one. The balance is kept in thousandths of a token, so whole-number rates stay exact and <code>retryAfterMs</code> is not off by a rounding error. It is O(1), allows a burst up to capacity, and then settles to the refill rate. If the clock steps backwards the bucket neither refills nor goes negative.</li>\n</ul>\n<p>Main flow: the caller invokes <code>check(rule, key)</code>, the service looks up the rule's limiter, the limiter reads the clock exactly once so the whole decision uses a single timestamp, updates its state for that key, and returns a decision. A denied decision carries <code>retryAfterMs</code>, for example the time until the oldest logged request leaves the window.</p>\n<p>Two choices matter. First, <b>denied requests are not recorded</b> in the sliding log, otherwise a client that keeps retrying would never recover. Second, the clock is injected, so the two-pings-per-second example is a plain function over a list of timestamps.</p>\n<p>Concurrency: each decision is a read-modify-write on per-key state. In this single-threaded model that is atomic. A real service needs a lock per key or an atomic compare-and-set, and across servers a shared store with atomic operations, or a local limiter with the limit divided between nodes. The trade-off I made is accuracy and simplicity per process over cross-server precision.</p>",
      extend: [
        "How would you enforce two rules at once, such as 2 per second and 100 per minute, without spending a token on the first rule when the second one denies?",
        "How do you stop memory from growing when millions of keys appear once and never return?",
        "How would the same limit hold across several servers behind a load balancer, and what do you give up?",
        "How would you cut the sliding log to constant memory per key while staying close to exact, for example with two adjacent window counters?",
        "Which algorithm would you pick for a login endpoint and which for a public search API, and why?",
      ],
      slips:
        "<p>These mistakes are what this problem tends to punish:</p>\n<ul>\n<li>Calling the system clock inside the limiter, which makes the behaviour impossible to test deterministically.</li>\n<li>Off-by-one errors at the window edge: whether a request exactly one window old still counts must be decided and tested.</li>\n<li>Recording denied requests in the sliding log, so a client that retries is blocked for ever.</li>\n<li>Using one global counter instead of state per key.</li>\n<li>Returning only a boolean, which gives callers no retry hint.</li>\n<li>Presenting fixed window as exact without naming the boundary burst, or letting idle keys accumulate state with no eviction plan.</li>\n</ul>",
    },
    checks: [
      {
        name: "allows two pings per second and recovers once the oldest leaves the window",
        expr: 'classifyPings([0, 100, 200, 1000, 1100], { type: "sliding", limit: 2, windowMs: 1000 })',
        expected: [true, true, false, true, true],
      },
      {
        name: "gives each key its own budget",
        expr: '(() => { const service = new RateLimiterService(new ManualClock()).addRule("api", { type: "sliding", limit: 1, windowMs: 1000 }); return [service.check("api", "a").allowed, service.check("api", "a").allowed, service.check("api", "b").allowed]; })()',
        expected: [true, false, true],
      },
      {
        name: "reports how long a denied caller should wait",
        expr: '(() => { const clock = new ManualClock(); const limiter = createLimiter({ type: "sliding", limit: 2, windowMs: 1000 }, clock); limiter.tryAcquire("u"); clock.set(100); limiter.tryAcquire("u"); clock.set(300); return limiter.tryAcquire("u"); })()',
        expected: {
          allowed: false,
          retryAfterMs: 700,
        },
      },
      {
        name: "does not record denied requests in the sliding log",
        expr: 'classifyPings([0, 500, 1000], { type: "sliding", limit: 1, windowMs: 1000 })',
        expected: [true, false, true],
      },
      {
        name: "resets a fixed window exactly at its boundary",
        expr: 'classifyPings([0, 999, 1000], { type: "fixed", limit: 1, windowMs: 1000 })',
        expected: [true, false, true],
      },
      {
        name: "lets a fixed window pass a burst across its edge that the sliding log blocks",
        expr: '({ fixed: classifyPings([900, 950, 1000, 1050], { type: "fixed", limit: 2, windowMs: 1000 }), sliding: classifyPings([900, 950, 1000, 1050], { type: "sliding", limit: 2, windowMs: 1000 }) })',
        expected: {
          fixed: [true, true, true, true],
          sliding: [true, true, false, false],
        },
      },
      {
        name: "refills a token bucket over time",
        expr: 'classifyPings([0, 0, 0, 500, 600], { type: "bucket", capacity: 2, refillPerSecond: 2 })',
        expected: [true, true, false, true, false],
      },
      {
        name: "never lets an idle token bucket exceed its capacity",
        expr: 'classifyPings([0, 0, 10000, 10000, 10000], { type: "bucket", capacity: 2, refillPerSecond: 1 })',
        expected: [true, true, true, true, false],
      },
      {
        name: "runs different algorithms side by side in one service",
        expr: '(() => { const service = new RateLimiterService(new ManualClock()).addRule("strict", { type: "fixed", limit: 1, windowMs: 1000 }).addRule("burst", { type: "bucket", capacity: 3, refillPerSecond: 1 }); return [service.check("strict", "u").allowed, service.check("strict", "u").allowed, service.check("burst", "u").allowed, service.check("burst", "u").allowed]; })()',
        expected: [true, false, true, true],
      },
      {
        name: "rejects an unknown rule name",
        expr: '(() => { try { new RateLimiterService(new ManualClock()).check("missing", "u"); return "no error"; } catch (error) { return error.message; } })()',
        expected: "unknown rule missing",
      },
      {
        name: "counts a request exactly one window old as expired and one a millisecond younger as live",
        expr: `[
  classifyPings([0, 999], { type: "sliding", limit: 1, windowMs: 1000 }),
  classifyPings([0, 1000], { type: "sliding", limit: 1, windowMs: 1000 }),
]`,
        expected: [
          [true, false],
          [true, true],
        ],
      },
      {
        name: "rejects bad specs, an unknown algorithm and a duplicate rule name without registering anything",
        expr: `(() => {
  const clock = new ManualClock();
  const service = new RateLimiterService(clock);
  const attempt = (fn) => {
    try {
      fn();
      return "ok";
    } catch (error) {
      return error.message;
    }
  };
  const results = [
    attempt(() => service.addRule("a", { type: "sliding", limit: 0, windowMs: 1000 })),
    attempt(() => service.addRule("b", { type: "fixed", limit: 2, windowMs: NaN })),
    attempt(() => service.addRule("c", { type: "bucket", capacity: 2, refillPerSecond: 0 })),
    attempt(() => service.addRule("d", { type: "leaky" })),
  ];
  service.addRule("e", { type: "fixed", limit: 1, windowMs: 1000 });
  results.push(attempt(() => service.addRule("e", { type: "fixed", limit: 5, windowMs: 1000 })));
  return [results, service.rules.size, service.check("e", "u").allowed, service.check("e", "u").allowed];
})()`,
        expected: [
          [
            "limit must be a positive integer",
            "windowMs must be a positive number",
            "refillPerSecond must be a positive number",
            "unknown limiter type leaky",
            "rule exists: e",
          ],
          1,
          true,
          false,
        ],
      },
      {
        name: "tells a denied token bucket caller the exact wait until one token has refilled",
        expr: `(() => {
  const clock = new ManualClock();
  const limiter = createLimiter({ type: "bucket", capacity: 1, refillPerSecond: 5 }, clock);
  limiter.tryAcquire("u");
  clock.set(2);
  const denied = limiter.tryAcquire("u");
  clock.set(2 + denied.retryAfterMs - 1);
  const early = limiter.tryAcquire("u").allowed;
  clock.set(2 + denied.retryAfterMs);
  return [denied.retryAfterMs, early, limiter.tryAcquire("u").allowed];
})()`,
        expected: [198, false, true],
      },
      {
        name: "does not refill or go negative when the clock steps backwards",
        expr: `(() => {
  const clock = new ManualClock(1000);
  const limiter = createLimiter({ type: "bucket", capacity: 1, refillPerSecond: 1 }, clock);
  const first = limiter.tryAcquire("u").allowed;
  clock.set(500);
  const back = limiter.tryAcquire("u");
  clock.set(2000);
  return [first, back.allowed, limiter.tryAcquire("u").allowed];
})()`,
        expected: [true, false, true],
      },
    ],
    code: `class ManualClock {
  constructor(start = 0) {
    this.time = start;
  }
  now() {
    return this.time;
  }
  set(time) {
    this.time = time;
  }
}

function allowed() {
  return { allowed: true, retryAfterMs: 0 };
}

function denied(retryAfterMs) {
  return { allowed: false, retryAfterMs };
}

class FixedWindowLimiter {
  constructor(clock, limit, windowMs) {
    this.clock = clock;
    this.limit = limit;
    this.windowMs = windowMs;
    this.windows = new Map();
  }
  tryAcquire(key) {
    const now = this.clock.now();
    const start = Math.floor(now / this.windowMs) * this.windowMs;
    let state = this.windows.get(key);
    if (!state || state.start !== start) {
      state = { start, count: 0 };
      this.windows.set(key, state);
    }
    if (state.count >= this.limit) return denied(start + this.windowMs - now);
    state.count += 1;
    return allowed();
  }
}

class SlidingWindowLogLimiter {
  constructor(clock, limit, windowMs) {
    this.clock = clock;
    this.limit = limit;
    this.windowMs = windowMs;
    this.logs = new Map();
  }
  tryAcquire(key) {
    const now = this.clock.now();
    const log = this.logs.get(key) || [];
    while (log.length > 0 && log[0] <= now - this.windowMs) log.shift();
    this.logs.set(key, log);
    if (log.length >= this.limit) return denied(log[0] + this.windowMs - now);
    log.push(now);
    return allowed();
  }
}

class TokenBucketLimiter {
  constructor(clock, capacity, refillPerSecond) {
    this.clock = clock;
    this.capacity = capacity;
    this.refillPerSecond = refillPerSecond;
    this.buckets = new Map();
  }
  tryAcquire(key) {
    const now = this.clock.now();
    const bucket = this.buckets.get(key) || { balance: this.capacity * 1000, updatedAt: now };
    const elapsed = Math.max(0, now - bucket.updatedAt);
    bucket.balance = Math.min(this.capacity * 1000, bucket.balance + elapsed * this.refillPerSecond);
    bucket.updatedAt = Math.max(now, bucket.updatedAt);
    this.buckets.set(key, bucket);
    if (bucket.balance < 1000) return denied(Math.ceil((1000 - bucket.balance) / this.refillPerSecond));
    bucket.balance -= 1000;
    return allowed();
  }
}

function positive(value, name, whole) {
  if (!Number.isFinite(value) || value <= 0 || (whole && !Number.isInteger(value))) {
    throw new Error(name + " must be a positive " + (whole ? "integer" : "number"));
  }
}

function createLimiter(spec, clock) {
  if (spec.type === "fixed" || spec.type === "sliding") {
    positive(spec.limit, "limit", true);
    positive(spec.windowMs, "windowMs", false);
  } else if (spec.type === "bucket") {
    positive(spec.capacity, "capacity", true);
    positive(spec.refillPerSecond, "refillPerSecond", false);
  }
  if (spec.type === "fixed") return new FixedWindowLimiter(clock, spec.limit, spec.windowMs);
  if (spec.type === "sliding") return new SlidingWindowLogLimiter(clock, spec.limit, spec.windowMs);
  if (spec.type === "bucket") return new TokenBucketLimiter(clock, spec.capacity, spec.refillPerSecond);
  throw new Error("unknown limiter type " + spec.type);
}

class RateLimiterService {
  constructor(clock) {
    this.clock = clock;
    this.rules = new Map();
  }
  addRule(name, spec) {
    if (this.rules.has(name)) throw new Error("rule exists: " + name);
    this.rules.set(name, createLimiter(spec, this.clock));
    return this;
  }
  check(rule, key) {
    const limiter = this.rules.get(rule);
    if (!limiter) throw new Error("unknown rule " + rule);
    return limiter.tryAcquire(key);
  }
}

function classifyPings(timestamps, spec) {
  const clock = new ManualClock();
  const limiter = createLimiter(spec, clock);
  return timestamps.map((time) => {
    clock.set(time);
    return limiter.tryAcquire("user").allowed;
  });
}
`,
  },
  {
    id: "atlassian-snake-game-lld",
    company: "atlassian",
    title: "Snake game on a grid",
    prompt:
      "Design a snake game on a rectangular grid where the snake moves one cell at a time by adding a new head and removing its tail. One report links the round to the LeetCode snake game problem, says clarifying questions changed the scope so that leaving the board wraps to the opposite side, and mentions follow-ups on the data structure for the body, on several direction inputs arriving at once and how to synchronise them, and on unit tests. Food, growth and scoring are this answer's assumptions.",
    level: "SDE-2 (P40); Senior Software Engineer",
    round: "lld",
    topic: "games",
    patterns: ["Strategy", "Observer", "Deque"],
    evidence: "several",
    sources: [
      {
        label: "Interview Experience, Atlassian SDE2 P40 (Roundz)",
        url: "https://roundz.substack.com/p/interview-experience-atlassian-sde2-p40",
        kind: "candidate-report",
        year: 2025,
      },
      {
        label: "Atlassian Interview Experience for Senior Software Engineer (GeeksforGeeks)",
        url: "https://www.geeksforgeeks.org/interview-experiences/atlassian-interview-experience-for-senior-software-engineer/",
        kind: "candidate-report",
      },
    ],
    chapters: [],
    answer: {
      ask: "<p>Questions to ask first:</p>\n<ul>\n<li>One snake or several? <em>Assume one snake, single player.</em></li>\n<li>What ends the game: hitting a wall, hitting itself, both? <em>One report says the snake should reappear on the opposite side instead of dying. Assume a switchable rule: solid walls end the game, wrap-around does not, and hitting itself always does.</em></li>\n<li>Who drives time: a real timer or an outside loop? <em>Assume an outside loop calls <code>tick()</code>, so the game itself has no timers.</em></li>\n<li>What if the player presses two keys inside one tick, or presses the opposite direction? <em>Assume inputs are queued, capped at two, and a reversal is ignored.</em></li>\n<li>Is there food, and how is it placed? <em>The reports do not say. Assume one piece at a time on a free cell, growth by one and a score per meal, behind an interface so tests can script it.</em></li>\n</ul>\n<p>Out of scope: rendering, speed levels, multiple snakes, networking and persistence of high scores.</p>",
      entities:
        "<ul>\n<li><b>SnakeGame</b> owns the rules: grid size, direction, score, status (<code>running</code>, <code>over</code>, <code>won</code>) and the <code>tick()</code> step. It has one Deque, one wall policy and one food source.</li>\n<li><b>Deque</b> is a doubly linked list holding the body from head to tail. Adding a head and removing the tail are both O(1).</li>\n<li><b>Occupied set</b> is a hash set of cell keys kept in step with the Deque, so the self-collision test is O(1).</li>\n<li><b>WallPolicy</b> is an interface with <code>resolve(cell)</code>. <code>SolidWalls</code> returns null outside the grid, <code>WrapAround</code> maps the cell to the other side.</li>\n<li><b>FoodSource</b> is an interface with <code>place(freeCells)</code>. <code>FirstFreeFood</code> and <code>ScriptedFood</code> are the deterministic versions; a random one has the same shape.</li>\n<li><b>Listeners</b> are callbacks that receive <code>ate</code>, <code>over</code> and <code>won</code> events, which is how a UI or a score board hears about the game.</li>\n</ul>",
      design:
        '<p><b>Body data structure.</b> A move is "add a head, drop the tail", so the body is a deque: a doubly linked list with pointers to both ends makes both operations O(1). A plain array makes <code>unshift</code> linear. Alongside it I keep a <b>set of occupied cell keys</b>, so asking "is the next cell part of the snake" is O(1) instead of a scan of the body.</p>\n<p><b>One tick</b>, in order:</p>\n<ol>\n<li>If the game is not running, return. Otherwise take at most one pending direction from the input queue.</li>\n<li>Compute the next cell from the head and the direction, then ask the <code>WallPolicy</code> to resolve it. Null means the snake hit a wall.</li>\n<li>Decide whether the move eats: does the next cell equal the food cell?</li>\n<li>Check the body. The cell the tail is about to leave is legal to enter, unless the snake is growing, because then the tail stays.</li>\n<li>Remove the tail unless growing, add the new head, and update the set.</li>\n<li>If it ate, bump the score, ask the food source for a new cell among the free cells, and emit <code>ate</code>. No free cell means the board is full and the player has won.</li>\n</ol>\n<p><b>Patterns that earn their place.</b> Strategy for walls and food, because both are rule variants a requirements change will touch (wrap-around, random versus scripted food) and tests need to script food. Observer for events, so scoring and UI stay out of the rules.</p>\n<p><b>Simultaneous input.</b> Key presses arrive outside the tick. They go into a small queue and each tick consumes one. A new direction is rejected if it equals or reverses the last queued direction, so two quick presses such as down then left both take effect, on consecutive ticks, instead of the second silently turning the snake into itself. In a threaded program the UI thread would only enqueue into a thread-safe queue and a single game-loop thread would own all state, so no lock is needed around the grid.</p>\n<p>Trade-off: computing free cells on each meal is O(width * height). That is fine for small boards; a large board would keep a free set updated on every move.</p>',
      extend: [
        "How would you add speed levels that depend on score without touching the rules class?",
        "What changes if two snakes share the grid and heads can collide with each other?",
        "How would you record every tick so a finished game can be replayed from a seed?",
        "How would you add a second kind of food that shrinks the snake or gives bonus points?",
        "Key presses come from another thread. Where does synchronisation go, and why not lock the whole game?",
      ],
      slips:
        "<p>Mistakes this problem punishes:</p>\n<ul>\n<li>Storing the body in an array and doing <code>unshift</code> and a full scan for collisions, then having no answer when asked about the cost.</li>\n<li>Rejecting a move into the cell the tail is leaving, which wrongly kills a snake that is chasing its own tail, or failing to keep the tail when the snake grows.</li>\n<li>Letting a reversal through, so a snake of length two dies when the player presses the opposite key.</li>\n<li>Dropping all but the last key press in a tick, or applying several turns in one tick.</li>\n<li>Placing food on top of the snake, or looping forever looking for a free cell when the board is full.</li>\n<li>Hard-coding the timer and random food, which makes the game untestable.</li>\n</ul>",
    },
    checks: [
      {
        name: "moves one cell per tick in the current direction",
        expr: '(() => { const game = ((options) => new SnakeGame({ width: 5, height: 5, start: { x: 1, y: 1 }, direction: "RIGHT", walls: new SolidWalls(), food: new ScriptedFood([{ x: 4, y: 4 }]), ...options }))({}); game.tick(); return [game.body.toArray(), game.score]; })()',
        expected: [
          [
            {
              x: 2,
              y: 1,
            },
          ],
          0,
        ],
      },
      {
        name: "grows by one cell and scores when the head reaches food",
        expr: '(() => { const game = ((options) => new SnakeGame({ width: 5, height: 5, start: { x: 1, y: 1 }, direction: "RIGHT", walls: new SolidWalls(), food: new ScriptedFood([{ x: 4, y: 4 }]), ...options }))({ food: new ScriptedFood([{ x: 2, y: 1 }]) }); game.tick(); return [game.body.toArray(), game.score]; })()',
        expected: [
          [
            {
              x: 2,
              y: 1,
            },
            {
              x: 1,
              y: 1,
            },
          ],
          1,
        ],
      },
      {
        name: "ignores a reversal into the opposite direction",
        expr: '(() => { const game = ((options) => new SnakeGame({ width: 5, height: 5, start: { x: 1, y: 1 }, direction: "RIGHT", walls: new SolidWalls(), food: new ScriptedFood([{ x: 4, y: 4 }]), ...options }))({}); const accepted = game.queueDirection("LEFT"); game.tick(); return [accepted, game.body.head.value]; })()',
        expected: [
          false,
          {
            x: 2,
            y: 1,
          },
        ],
      },
      {
        name: "applies two quick inputs on consecutive ticks in order",
        expr: '(() => { const game = ((options) => new SnakeGame({ width: 5, height: 5, start: { x: 1, y: 1 }, direction: "RIGHT", walls: new SolidWalls(), food: new ScriptedFood([{ x: 4, y: 4 }]), ...options }))({}); const first = game.queueDirection("DOWN"); const second = game.queueDirection("LEFT"); game.tick(); const afterFirst = game.body.head.value; game.tick(); return [first, second, afterFirst, game.body.head.value]; })()',
        expected: [
          true,
          true,
          {
            x: 1,
            y: 2,
          },
          {
            x: 0,
            y: 2,
          },
        ],
      },
      {
        name: "ends the game on a solid wall",
        expr: '(() => { const game = ((options) => new SnakeGame({ width: 5, height: 5, start: { x: 1, y: 1 }, direction: "RIGHT", walls: new SolidWalls(), food: new ScriptedFood([{ x: 4, y: 4 }]), ...options }))({ start: { x: 0, y: 0 }, direction: "UP" }); const events = []; game.subscribe((event) => events.push(event)); game.tick(); return [game.status, events]; })()',
        expected: [
          "over",
          [
            {
              type: "over",
              reason: "wall",
            },
          ],
        ],
      },
      {
        name: "wraps to the opposite edge when the wall policy is swapped",
        expr: '(() => { const game = ((options) => new SnakeGame({ width: 5, height: 5, start: { x: 1, y: 1 }, direction: "RIGHT", walls: new SolidWalls(), food: new ScriptedFood([{ x: 4, y: 4 }]), ...options }))({ start: { x: 0, y: 0 }, direction: "UP", walls: new WrapAround() }); game.tick(); return [game.status, game.body.head.value]; })()',
        expected: [
          "running",
          {
            x: 0,
            y: 4,
          },
        ],
      },
      {
        name: "ends the game when the head turns into its own body",
        expr: '(() => { const game = new SnakeGame({ width: 6, height: 6, start: { x: 1, y: 1 }, direction: "RIGHT", walls: new SolidWalls(), food: new ScriptedFood([{ x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 }]) }); const events = []; game.subscribe((event) => events.push(event.type + ":" + (event.reason || event.score))); for (let i = 0; i < 4; i += 1) game.tick(); ["DOWN", "LEFT", "UP"].forEach((name) => { game.queueDirection(name); game.tick(); }); return [game.status, game.score, events]; })()',
        expected: ["over", 4, ["ate:1", "ate:2", "ate:3", "ate:4", "over:self"]],
      },
      {
        name: "places new food only on free cells",
        expr: '(() => { const game = new SnakeGame({ width: 3, height: 2, start: { x: 0, y: 0 }, direction: "RIGHT", walls: new SolidWalls(), food: new FirstFreeFood() }); const first = game.food; game.tick(); return [first, game.food]; })()',
        expected: [
          {
            x: 1,
            y: 0,
          },
          {
            x: 2,
            y: 0,
          },
        ],
      },
      {
        name: "wins when the snake fills the board",
        expr: '(() => { const game = new SnakeGame({ width: 2, height: 1, start: { x: 0, y: 0 }, direction: "RIGHT", walls: new SolidWalls(), food: new FirstFreeFood() }); game.tick(); return [game.status, game.food, game.tick()]; })()',
        expected: ["won", null, "won"],
      },
      {
        name: "lets the head move into the cell the tail is leaving",
        expr: '(() => { const game = new SnakeGame({ width: 3, height: 3, start: { x: 0, y: 0 }, direction: "RIGHT", walls: new SolidWalls(), food: new ScriptedFood([{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }]) }); game.tick(); ["DOWN", "LEFT", "UP"].forEach((name) => { game.queueDirection(name); game.tick(); }); return [game.status, game.body.size, game.body.head.value]; })()',
        expected: [
          "running",
          4,
          {
            x: 0,
            y: 0,
          },
        ],
      },
      {
        name: "refuses a bad board, direction or start cell, and starts already won on a one cell board",
        expr: `(() => {
  const build = (options) =>
    new SnakeGame({
      width: 3,
      height: 3,
      start: { x: 1, y: 1 },
      direction: "RIGHT",
      walls: new SolidWalls(),
      food: new FirstFreeFood(),
      ...options,
    });
  const attempt = (options) => {
    try {
      return build(options).status;
    } catch (error) {
      return error.message;
    }
  };
  return [
    attempt({ width: 0 }),
    attempt({ direction: "NORTH" }),
    attempt({ start: { x: 3, y: 0 } }),
    attempt({ width: 1, height: 1, start: { x: 0, y: 0 } }),
    attempt({}),
  ];
})()`,
        expected: [
          "the board needs a positive width and height",
          "unknown direction NORTH",
          "the start cell is outside the board",
          "won",
          "running",
        ],
      },
      {
        name: "queues at most two turns, ignoring a repeat of the last direction and a third press",
        expr: `(() => {
  const game = new SnakeGame({
    width: 5,
    height: 5,
    start: { x: 2, y: 2 },
    direction: "RIGHT",
    walls: new SolidWalls(),
    food: new ScriptedFood([{ x: 4, y: 4 }]),
  });
  const presses = ["RIGHT", "DOWN", "DOWN", "LEFT", "UP"].map((name) => game.queueDirection(name));
  const path = [];
  for (let i = 0; i < 3; i += 1) {
    game.tick();
    path.push(game.body.head.value);
  }
  return [presses, path];
})()`,
        expected: [
          [false, true, false, true, false],
          [
            { x: 2, y: 3 },
            { x: 1, y: 3 },
            { x: 0, y: 3 },
          ],
        ],
      },
      {
        name: "keeps its score and won status once the board is full, with food always on a free cell",
        expr: `(() => {
  const game = new SnakeGame({
    width: 4,
    height: 1,
    start: { x: 0, y: 0 },
    direction: "RIGHT",
    walls: new SolidWalls(),
    food: new FirstFreeFood(),
  });
  const foods = [];
  for (let i = 0; i < 3; i += 1) {
    game.tick();
    foods.push(game.food);
  }
  const end = game.tick();
  return [end, game.score, game.tick(), foods, game.body.size];
})()`,
        expected: ["won", 3, "won", [{ x: 2, y: 0 }, { x: 3, y: 0 }, null], 4],
      },
    ],
    code: `const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};
const OPPOSITE = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };

function keyOf(cell) {
  return cell.x + "," + cell.y;
}

class Deque {
  constructor() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }
  addFirst(value) {
    const node = { value, prev: null, next: this.head };
    if (this.head) this.head.prev = node;
    else this.tail = node;
    this.head = node;
    this.size += 1;
  }
  removeLast() {
    const node = this.tail;
    this.tail = node.prev;
    if (this.tail) this.tail.next = null;
    else this.head = null;
    this.size -= 1;
    return node.value;
  }
  toArray() {
    const out = [];
    for (let node = this.head; node; node = node.next) out.push(node.value);
    return out;
  }
}

class SolidWalls {
  resolve(cell, width, height) {
    const inside = cell.x >= 0 && cell.y >= 0 && cell.x < width && cell.y < height;
    return inside ? cell : null;
  }
}

class WrapAround {
  resolve(cell, width, height) {
    return { x: (cell.x + width) % width, y: (cell.y + height) % height };
  }
}

class FirstFreeFood {
  place(free) {
    return free.length > 0 ? free[0] : null;
  }
}

class ScriptedFood {
  constructor(cells) {
    this.cells = cells.slice();
  }
  place(free) {
    while (this.cells.length > 0) {
      const cell = this.cells.shift();
      if (free.some((candidate) => keyOf(candidate) === keyOf(cell))) return cell;
    }
    return free.length > 0 ? free[0] : null;
  }
}

class SnakeGame {
  constructor({ width, height, start, direction, walls, food }) {
    if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
      throw new Error("the board needs a positive width and height");
    }
    if (!DIRECTIONS[direction]) throw new Error("unknown direction " + direction);
    if (!new SolidWalls().resolve(start, width, height)) throw new Error("the start cell is outside the board");
    this.width = width;
    this.height = height;
    this.direction = direction;
    this.walls = walls;
    this.foodSource = food;
    this.body = new Deque();
    this.body.addFirst(start);
    this.occupied = new Set([keyOf(start)]);
    this.pending = [];
    this.listeners = [];
    this.status = "running";
    this.score = 0;
    this.food = this.foodSource.place(this.freeCells());
    if (this.food === null) this.status = "won";
  }
  subscribe(listener) {
    this.listeners.push(listener);
  }
  emit(event) {
    this.listeners.forEach((listener) => listener(event));
  }
  freeCells() {
    const free = [];
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) if (!this.occupied.has(x + "," + y)) free.push({ x, y });
    }
    return free;
  }
  queueDirection(name) {
    const last = this.pending.length > 0 ? this.pending[this.pending.length - 1] : this.direction;
    if (!DIRECTIONS[name] || name === last || name === OPPOSITE[last] || this.pending.length >= 2) return false;
    this.pending.push(name);
    return true;
  }
  finish(status, reason) {
    this.status = status;
    this.emit({ type: status, reason });
    return status;
  }
  tick() {
    if (this.status !== "running") return this.status;
    if (this.pending.length > 0) this.direction = this.pending.shift();
    const head = this.body.head.value;
    const step = DIRECTIONS[this.direction];
    const next = this.walls.resolve({ x: head.x + step.x, y: head.y + step.y }, this.width, this.height);
    if (!next) return this.finish("over", "wall");
    const grows = this.food !== null && keyOf(next) === keyOf(this.food);
    const hitsBody = this.occupied.has(keyOf(next)) && (grows || keyOf(next) !== keyOf(this.body.tail.value));
    if (hitsBody) return this.finish("over", "self");
    if (!grows) this.occupied.delete(keyOf(this.body.removeLast()));
    this.body.addFirst(next);
    this.occupied.add(keyOf(next));
    if (!grows) return this.status;
    this.score += 1;
    this.food = this.foodSource.place(this.freeCells());
    this.emit({ type: "ate", score: this.score });
    return this.food === null ? this.finish("won", "board full") : this.status;
  }
}
`,
  },
  {
    id: "swiggy-snake-and-ladder",
    company: "swiggy",
    title: "Snake and ladder board game",
    prompt:
      "Implement the board game snake and ladder in an object-oriented way. The basic rules must work, and extra requirements are to be supported by extension: any board size, any number of players, a ladder that begins where a snake ends, a snake that begins where a ladder ends, and play that continues until every player has finished.",
    level: "SDE-1 (backend)",
    round: "machine-coding",
    topic: "games",
    patterns: ["Strategy", "State", "Factory"],
    evidence: "one",
    sources: [
      {
        label: "Swiggy Interview Experience for SDE-1, off-campus 2021 (GeeksforGeeks)",
        url: "https://www.geeksforgeeks.org/interview-experiences/swiggy-interview-experience-for-sde-1-off-campus-2021-2/",
        kind: "candidate-report",
        year: 2021,
      },
    ],
    chapters: [],
    answer: {
      ask: "<p>Questions to ask first:</p>\n<ul>\n<li>How big is the board and how many dice? <em>Assume a configurable size, default 100, and one die that returns a value from an injected source.</em></li>\n<li>Which rules are mandatory? <em>The report does not list them. Assume the standard game: players start off the board, roll one die in turn, and snakes and ladders move them.</em></li>\n<li>Can a player overshoot the last cell? <em>The source does not say. Assume an exact roll is needed, and make that rule swappable.</em></li>\n<li>If a snake tail is the bottom of a ladder, or a ladder top is a snake head, do both fire in one move? <em>Assume yes, followed to the end of the chain, and reject chains that loop.</em></li>\n<li>Does the game stop at the first winner? <em>Assume not: it continues until every player has finished and produces a ranking.</em></li>\n<li>Extra turn on a six, capturing another player? <em>Out of scope.</em></li>\n</ul>",
      entities:
        "<ul>\n<li><b>Game</b> runs turns. It has one Board, one Dice, one finish rule, a list of players, a queue of players still waiting to finish, a ranking and a status (<code>playing</code> or <code>finished</code>).</li>\n<li><b>Board</b> holds the size and a map from a start cell to an end cell. A snake is a jump whose end is lower than its start, a ladder is the opposite, so the board needs one concept, not two classes.</li>\n<li><b>Player</b> holds a name and a position, where 0 means not yet on the board.</li>\n<li><b>Dice</b> is an interface with <code>roll()</code>. <code>SequenceDice</code> replays a fixed list in tests; a random one has the same shape.</li>\n<li><b>FinishRule</b> is a strategy: <code>ExactFinish</code> keeps a player in place when the roll overshoots, <code>OvershootFinishes</code> clamps to the last cell.</li>\n<li><b>createGame</b> is the factory that builds a Game from a plain config and picks the finish rule by name.</li>\n</ul>",
      design:
        "<p>The design keeps every rule that might change behind a small seam. <b>The Board</b> validates its jump map when it is built: a jump may not start on cell 1 or on the last cell, may not start where another jump starts, and must stay on the board. It also rejects a board smaller than two cells, and the game rejects duplicate player names. It then walks every chain with a visited set, so a loop such as 2 to 5 and 5 to 2 is rejected immediately with a clear message rather than hanging a game later. <code>settle(cell)</code> follows a chain until the cell has no jump, which gives the optional rule for free: a ladder that starts at a snake's tail, or a snake that starts at a ladder's end, is just two entries in the same map.</p>\n<p><b>Dice</b> is injected. Production code supplies a random die, tests supply <code>SequenceDice</code>, and a loaded die for a demo is the same interface. <b>FinishRule</b> is a Strategy for the one rule the prompt leaves open, so switching from exact finish to overshoot is a config value, not an edit to <code>Game</code>.</p>\n<p><b>Turn flow</b> in <code>playTurn()</code>:</p>\n<ol>\n<li>Reject the call if the game is already finished.</li>\n<li>Look at the player at the front of the waiting queue.</li>\n<li>Roll the dice. A roll that is not a whole number of at least 1 throws here, before anything has changed, so a failed roll never costs the player their place. Then take the player off the queue and ask the finish rule where they land from the current cell.</li>\n<li>Ask the board to settle that cell through snakes and ladders and store the result as the player's position.</li>\n<li>If the position is the last cell, append the player to the ranking. Otherwise put the player at the back of the queue.</li>\n<li>When the queue is empty the status becomes <code>finished</code>. The method returns a record with the roll, the cell landed on and the final cell, which a UI or a test can print.</li>\n</ol>\n<p>The status field is a small state machine: <code>playing</code> to <code>finished</code> only when the last player reaches the end, and no turn is accepted afterwards. Because finished players leave the queue, \"play until everyone finishes\" needs no special loop, and a game with any number of players or any board size uses the same code.</p>\n<p>Trade-off: snakes and ladders are one kind of entry in a single jump map. If you later add obstacles with different behaviour, such as skip a turn, replace the map value with a cell effect object that has an <code>apply(player)</code> method.</p>",
      extend: [
        "How would you give a player another turn after rolling a six, and cancel the turn after three sixes in a row?",
        "How would you support two dice, or a loaded die that is used only in tests?",
        "How would you add a trap cell that makes the player skip the next turn?",
        "What changes if landing on an occupied cell sends the other player back to the start?",
        "How would you stop the game when only one player is left, or when the first player finishes?",
      ],
      slips:
        "<p>This problem punishes these slips:</p>\n<ul>\n<li>Writing separate Snake and Ladder classes with duplicated logic, then having no clean way to add a third obstacle.</li>\n<li>Resolving a jump only once, so the optional chain rule fails, or resolving it with no cycle check so a bad board loops for ever.</li>\n<li>Calling a random number generator inside the game, which makes every test flaky.</li>\n<li>Declaring the first finisher the winner and stopping, when the prompt asks that play continue until all have finished.</li>\n<li>Forgetting the overshoot rule, or letting a player move past the last cell.</li>\n<li>Mixing printing into the rules, so the game cannot be tested without capturing output.</li>\n</ul>",
    },
    checks: [
      {
        name: "moves the first player by the rolled value",
        expr: '(() => { const game = createGame({ size: 10, jumps: [], players: ["A", "B"], dice: new SequenceDice([3, 4]) }); return game.playTurn(); })()',
        expected: {
          player: "A",
          roll: 3,
          from: 0,
          landed: 3,
          to: 3,
        },
      },
      {
        name: "climbs a ladder and slides down a snake",
        expr: '(() => { const game = createGame({ size: 10, jumps: [[3, 8], [9, 2]], players: ["A"], dice: new SequenceDice([3, 1]) }); const up = game.playTurn(); const down = game.playTurn(); return [up.to, down.landed, down.to]; })()',
        expected: [8, 9, 2],
      },
      {
        name: "follows a ladder that starts at a snake tail and a snake at a ladder end",
        expr: '(() => { const game = createGame({ size: 10, jumps: [[9, 4], [4, 7], [2, 6], [6, 3]], players: ["A", "B"], dice: new SequenceDice([9, 2]) }); return [game.playTurn().to, game.playTurn().to]; })()',
        expected: [7, 3],
      },
      {
        name: "rejects a board whose jumps form a cycle",
        expr: '(() => { try { new Board(10, [[2, 5], [5, 2]]); return "no error"; } catch (error) { return error.message; } })()',
        expected: "jump cycle at 2",
      },
      {
        name: "rejects a jump that starts on the last cell",
        expr: '(() => { try { new Board(10, [[10, 2]]); return "no error"; } catch (error) { return error.message; } })()',
        expected: "invalid jump 10 to 2",
      },
      {
        name: "needs an exact roll to finish under the exact rule",
        expr: '(() => { const game = createGame({ size: 10, players: ["A"], dice: new SequenceDice([6, 6, 4]) }); return [game.playTurn().to, game.playTurn().to, game.playTurn().to, game.status]; })()',
        expected: [6, 6, 10, "finished"],
      },
      {
        name: "finishes on an overshoot when the rule is swapped",
        expr: '(() => { const game = createGame({ size: 10, players: ["A"], finish: "overshoot", dice: new SequenceDice([6, 6]) }); return [game.playToEnd(10), game.status]; })()',
        expected: [["A"], "finished"],
      },
      {
        name: "keeps playing after the first finisher until everyone is ranked",
        expr: '(() => { const game = createGame({ size: 6, players: ["A", "B"], dice: new SequenceDice([3, 6, 3]) }); game.playTurn(); game.playTurn(); const midway = [game.ranking.slice(), game.status]; game.playTurn(); return [midway, game.ranking, game.status]; })()',
        expected: [[["B"], "playing"], ["B", "A"], "finished"],
      },
      {
        name: "supports any board size and any number of players",
        expr: '(() => { const game = createGame({ size: 5, players: ["A", "B", "C"], dice: new SequenceDice([5, 5, 5]) }); return game.playToEnd(10); })()',
        expected: ["A", "B", "C"],
      },
      {
        name: "refuses a turn once the game is finished",
        expr: '(() => { const game = createGame({ size: 5, players: ["A"], dice: new SequenceDice([5, 1]) }); game.playTurn(); try { game.playTurn(); return "no error"; } catch (error) { return error.message; } })()',
        expected: "game is over",
      },
      {
        name: "keeps the player at the front of the queue when the dice fails or returns a bad value",
        expr: `(() => {
  const dice = { values: [2, 0, 3], roll() { return this.values.shift(); } };
  const game = createGame({ size: 10, players: ["A", "B"], dice });
  game.playTurn();
  let error = "none";
  try {
    game.playTurn();
  } catch (caught) {
    error = caught.message;
  }
  const next = game.playTurn();
  return [error, next.player, next.to, game.waiting.map((p) => p.name)];
})()`,
        expected: ["the dice returned 0", "B", 3, ["A", "B"]],
      },
      {
        name: "rotates turns in order and lets a ladder that ends on the last cell finish the player",
        expr: `(() => {
  const game = createGame({ size: 10, jumps: [[4, 10]], players: ["A", "B", "C"], dice: new SequenceDice([1, 2, 3, 3]) });
  const order = [1, 2, 3, 4].map(() => game.playTurn());
  return [order.map((turn) => turn.player), order[3].to, game.ranking, game.waiting.map((p) => p.name)];
})()`,
        expected: [["A", "B", "C", "A"], 10, ["A"], ["B", "C"]],
      },
      {
        name: "rejects duplicate player names, a tiny board and a jump that goes off the board",
        expr: `(() => {
  const attempt = (fn) => {
    try {
      fn();
      return "ok";
    } catch (error) {
      return error.message;
    }
  };
  const dice = new SequenceDice([1]);
  return [
    attempt(() => createGame({ size: 10, players: ["A", "A"], dice })),
    attempt(() => createGame({ size: 1, players: ["A"], dice })),
    attempt(() => createGame({ size: 10, jumps: [[5, 11]], players: ["A"], dice })),
    attempt(() => createGame({ size: 10, finish: "wrap", players: ["A"], dice })),
  ];
})()`,
        expected: [
          "player names must be unique",
          "board size must be an integer of at least 2",
          "invalid jump 5 to 11",
          "unknown finish rule wrap",
        ],
      },
    ],
    code: `class SequenceDice {
  constructor(values) {
    this.values = values.slice();
    this.index = 0;
  }
  roll() {
    if (this.index >= this.values.length) throw new Error("dice script exhausted");
    this.index += 1;
    return this.values[this.index - 1];
  }
}

class Board {
  constructor(size, jumps) {
    if (!Number.isInteger(size) || size < 2) throw new Error("board size must be an integer of at least 2");
    this.size = size;
    this.jumps = new Map();
    for (const [from, to] of jumps) {
      const valid = from >= 2 && from < size && to >= 1 && to <= size && from !== to && !this.jumps.has(from);
      if (!valid) throw new Error("invalid jump " + from + " to " + to);
      this.jumps.set(from, to);
    }
    for (const from of this.jumps.keys()) this.settle(from);
  }
  settle(cell) {
    const seen = new Set();
    let at = cell;
    while (this.jumps.has(at)) {
      if (seen.has(at)) throw new Error("jump cycle at " + at);
      seen.add(at);
      at = this.jumps.get(at);
    }
    return at;
  }
}

class ExactFinish {
  land(position, roll, size) {
    return position + roll > size ? position : position + roll;
  }
}

class OvershootFinishes {
  land(position, roll, size) {
    return Math.min(position + roll, size);
  }
}

const FINISH_RULES = { exact: () => new ExactFinish(), overshoot: () => new OvershootFinishes() };

class Game {
  constructor(board, names, dice, finishRule) {
    if (names.length < 1) throw new Error("at least one player is needed");
    if (new Set(names).size !== names.length) throw new Error("player names must be unique");
    this.board = board;
    this.dice = dice;
    this.finishRule = finishRule;
    this.players = names.map((name) => ({ name, position: 0 }));
    this.waiting = this.players.slice();
    this.ranking = [];
    this.status = "playing";
  }
  playTurn() {
    if (this.status === "finished") throw new Error("game is over");
    const player = this.waiting[0];
    const roll = this.dice.roll();
    if (!Number.isInteger(roll) || roll < 1) throw new Error("the dice returned " + roll);
    this.waiting.shift();
    const from = player.position;
    const landed = this.finishRule.land(from, roll, this.board.size);
    player.position = this.board.settle(landed);
    if (player.position === this.board.size) this.ranking.push(player.name);
    else this.waiting.push(player);
    if (this.waiting.length === 0) this.status = "finished";
    return { player: player.name, roll, from, landed, to: player.position };
  }
  playToEnd(maxTurns) {
    let turns = 0;
    while (this.status === "playing" && turns < maxTurns) {
      this.playTurn();
      turns += 1;
    }
    return this.ranking;
  }
}

function createGame(config) {
  const makeRule = FINISH_RULES[config.finish || "exact"];
  if (!makeRule) throw new Error("unknown finish rule " + config.finish);
  return new Game(new Board(config.size, config.jumps || []), config.players, config.dice, makeRule());
}
`,
  },
  {
    id: "zomato-deck-of-cards",
    company: "zomato",
    title: "Deck of cards",
    prompt:
      "Model a deck of playing cards. Each card has one of four suits and a colour, and the deck must support popping the top card, shuffling, and dealing cards to every player. Expect a small, clean object design where the shuffle can be tested.",
    level: "SDE-1 (fresher)",
    round: "lld",
    topic: "games",
    patterns: ["Factory", "Strategy", "Iterator"],
    evidence: "one",
    sources: [
      {
        label: "Interview Experience 184, Zomato SDE1 fresher (Roundz)",
        url: "https://roundz.substack.com/p/interview-experience-184-zomato-sde1-fresher",
        kind: "candidate-report",
        year: 2025,
      },
    ],
    chapters: [],
    answer: {
      ask: "<p>Questions to ask first:</p>\n<ul>\n<li>Which deck: the usual 52 cards, with jokers, or a shorter deck? <em>The report mentions only four suits and two colours. Assume 52 cards by default, with a factory that can build other variants.</em></li>\n<li>What does popping an empty deck do? <em>Assume it throws a clear error rather than returning a null.</em></li>\n<li>What does dealing mean: a fixed number each, or the whole deck? <em>Assume both: pass a count, or leave it out to deal evenly.</em></li>\n<li>Does the deal go one card at a time round robin? <em>Assume yes, as at a real table.</em></li>\n<li>How random must the shuffle be? <em>Assume unbiased, with the random source injected so tests are repeatable.</em></li>\n</ul>\n<p>Out of scope: the rules of any particular card game, scoring and card comparison.</p>",
      entities:
        "<ul>\n<li><b>Card</b> is an immutable value with a rank, a suit and a colour. The colour comes from the suit, so a card can never be a red spade.</li>\n<li><b>Suit</b> data pairs a name with a colour: hearts and diamonds are red, clubs and spades are black.</li>\n<li><b>Deck</b> has many Cards in a stack and one random source. It offers <code>pop()</code>, <code>shuffle()</code>, <code>size</code> and an iterator that reads the cards from the top without removing them.</li>\n<li><b>RandomSource</b> is an interface with <code>nextInt(bound)</code>. <code>SeededRandom</code> repeats for a given seed and <code>StubRandom</code> replays a fixed list.</li>\n<li><b>createDeck</b> is a factory that builds a deck for a named variant such as <code>standard</code> or <code>short</code>.</li>\n<li><b>Player</b> holds a name and a hand. <b>Dealer</b> pops cards from a deck and hands them to players.</li>\n</ul>",
      design:
        "<p>Keep each class to one job. A <b>Card</b> is frozen after construction, so a card that has been dealt cannot change under a player. The suit supplies the colour, which removes an impossible state instead of validating it. The <b>Deck</b> stores cards in an array with the top at the end, so <code>pop()</code> is O(1) and the deck never shifts elements.</p>\n<p><b>Shuffle</b> is the Fisher-Yates algorithm: walk from the last position down to the second, pick an index from zero to the current index inclusive, and swap. It is O(n) and, given an unbiased random source, every ordering is equally likely. It works on a copy and swaps it in only at the end, and it rejects an index outside the range, so a faulty random source cannot leave a half-shuffled or corrupted deck. Sorting with a random comparator is not fair and should be avoided. The random source is a small Strategy passed to the deck, so the same code runs with a seeded generator for repeatable demos, a stub that returns scripted indices so a test can assert the exact order, or a secure source in production. The seeded generator here uses a modulo, which has a slight bias, and I would say so rather than hide it.</p>\n<p><b>Construction.</b> <code>createDeck(variant, random)</code> loops suits by ranks and builds the cards, so a 32 card short deck is a new entry in a table, not a new class. Jokers need a small change to the list the factory builds and a decision about their colour, but still no new class. That is the factory earning its place.</p>\n<p><b>Dealing.</b> The Dealer is separate from the Deck: the deck knows about cards, the dealer knows about tables. It first computes how many cards each player gets, throws before touching the deck if the deck cannot cover them, and then deals round robin, one card to each player per round. Checking first matters because a half-finished deal would leave some players with cards and the deck changed after a failure.</p>\n<p><b>Iteration.</b> The deck is iterable and yields a copy of the stack from the top, so printing or inspecting never changes it.</p>\n<p>Trade-off: <code>pop()</code> throws on an empty deck instead of returning null. Callers must handle the error, but a forgotten check fails loudly instead of passing a null to a player.</p>",
      extend: [
        "How would you add jokers, and how would the colour rule work for them?",
        "How would you compare two cards for a game where ace is high in one game and low in another?",
        "How would you build a shoe of several decks with a cut card, and what changes in the factory?",
        "Several threads deal from one deck at a table. What must be atomic, and how would you protect it?",
        "How would you store a shuffle so that a game can be replayed later?",
      ],
      slips:
        "<p>This problem punishes these slips:</p>\n<ul>\n<li>Calling <code>Math.random</code> inside the deck, so a shuffle cannot be tested.</li>\n<li>Shuffling with a sort and a random comparator, which gives a biased order, or swapping with an index chosen from the whole array each time.</li>\n<li>Removing the top card with <code>shift</code> or <code>splice</code> on the front of the array when a stack is the natural fit.</li>\n<li>Storing the colour separately from the suit, so the two can disagree.</li>\n<li>Dealing cards one by one and failing halfway, which leaves a half-dealt deck.</li>\n<li>Hard-coding 52 everywhere so a short deck needs edits in several places.</li>\n</ul>",
    },
    checks: [
      {
        name: "builds 52 unique cards, half red and half black",
        expr: '(() => { const cards = [...createDeck("standard", new SeededRandom(1))]; return [cards.length, new Set(names(cards)).size, cards.filter((card) => card.color === "red").length]; })()',
        expected: [52, 52, 26],
      },
      {
        name: "pops the top card and shrinks the deck",
        expr: '(() => { const deck = createDeck("standard", new SeededRandom(1)); const card = deck.pop(); return [card.toString(), deck.size]; })()',
        expected: ["A of spades", 51],
      },
      {
        name: "throws when popping from an empty deck",
        expr: '(() => { const deck = createDeck("short", new SeededRandom(1)); for (let i = 0; i < 32; i += 1) deck.pop(); try { deck.pop(); return "no error"; } catch (error) { return error.message; } })()',
        expected: "deck is empty",
      },
      {
        name: "shuffles to the same order for the same seed and a different order for another",
        expr: '(() => { const order = (seed) => names([...createDeck("standard", new SeededRandom(seed)).shuffle()]).join(); return [order(7) === order(7), order(7) === order(8)]; })()',
        expected: [true, false],
      },
      {
        name: "keeps exactly the same cards after a shuffle",
        expr: '(() => { const sorted = (deck) => names([...deck]).sort(); const deck = createDeck("standard", new SeededRandom(42)); const before = sorted(deck); deck.shuffle(); return [sorted(deck).join() === before.join(), deck.size]; })()',
        expected: [true, 52],
      },
      {
        name: "follows the swap sequence of an injected random source",
        expr: '(() => { const cards = ["a", "b", "c"].map((rank) => new Card(rank, SUITS[0])); const deck = new Deck(cards, new StubRandom([0, 0])).shuffle(); return [deck.pop().rank, deck.pop().rank, deck.pop().rank]; })()',
        expected: ["a", "c", "b"],
      },
      {
        name: "deals one card at a time round robin",
        expr: '(() => { const players = ["P1", "P2", "P3"].map((name) => new Player(name)); new Dealer().deal(createDeck("standard", new SeededRandom(1)), players, 2); return players.map((player) => names(player.hand)); })()',
        expected: [
          ["A of spades", "J of spades"],
          ["K of spades", "10 of spades"],
          ["Q of spades", "9 of spades"],
        ],
      },
      {
        name: "deals the whole deck evenly and leaves the remainder",
        expr: '(() => { const deck = createDeck("standard", new SeededRandom(1)); const players = ["a", "b", "c", "d", "e"].map((name) => new Player(name)); new Dealer().deal(deck, players); return [players.map((player) => player.hand.length), deck.size]; })()',
        expected: [[10, 10, 10, 10, 10], 2],
      },
      {
        name: "refuses to deal more cards than the deck holds and leaves it untouched",
        expr: '(() => { const deck = createDeck("short", new SeededRandom(1)); const players = ["a", "b", "c", "d"].map((name) => new Player(name)); try { new Dealer().deal(deck, players, 9); return "no error"; } catch (error) { return [error.message, deck.size, players[0].hand.length]; } })()',
        expected: ["not enough cards", 32, 0],
      },
      {
        name: "builds a 32 card short deck without the low ranks",
        expr: '(() => { const cards = [...createDeck("short", new SeededRandom(1))]; return [cards.length, cards.some((card) => ["2", "3", "4", "5", "6"].includes(card.rank))]; })()',
        expected: [32, false],
      },
      {
        name: "produces every one of the 24 orders of a four card deck from the 24 possible random choices",
        expr: `(() => {
  const orders = new Set();
  for (let a = 0; a < 4; a += 1) {
    for (let b = 0; b < 3; b += 1) {
      for (let c = 0; c < 2; c += 1) {
        const cards = ["a", "b", "c", "d"].map((rank) => new Card(rank, SUITS[0]));
        orders.add(names([...new Deck(cards, new StubRandom([a, b, c])).shuffle()]).join());
      }
    }
  }
  return orders.size;
})()`,
        expected: 24,
      },
      {
        name: "leaves the deck untouched when the random source misbehaves or is missing",
        expr: `(() => {
  const make = (random) => new Deck(["a", "b", "c"].map((rank) => new Card(rank, SUITS[0])), random);
  const attempt = (deck) => {
    try {
      deck.shuffle();
      return "ok";
    } catch (error) {
      return error.message;
    }
  };
  const broken = make(new StubRandom([1, 5]));
  const missing = make(undefined);
  return [attempt(broken), names([...broken]), attempt(missing), attempt(make(new StubRandom([undefined, 0])))];
})()`,
        expected: [
          "the random source returned 5",
          ["c of hearts", "b of hearts", "a of hearts"],
          "this deck has no random source",
          "the random source returned undefined",
        ],
      },
      {
        name: "rejects a negative or fractional deal size and a non-integer seed",
        expr: `(() => {
  const attempt = (fn) => {
    try {
      fn();
      return "ok";
    } catch (error) {
      return error.message;
    }
  };
  const deal = (count) => new Dealer().deal(createDeck("short", new SeededRandom(1)), [new Player("a")], count);
  return [attempt(() => deal(-1)), attempt(() => deal(1.5)), attempt(() => deal(0)), attempt(() => new SeededRandom(NaN))];
})()`,
        expected: [
          "cardsEach must be a whole number",
          "cardsEach must be a whole number",
          "ok",
          "the seed must be an integer",
        ],
      },
    ],
    code: `const SUITS = [
  { name: "hearts", color: "red" },
  { name: "diamonds", color: "red" },
  { name: "clubs", color: "black" },
  { name: "spades", color: "black" },
];
const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const VARIANTS = { standard: RANKS, short: RANKS.slice(5) };

class Card {
  constructor(rank, suit) {
    this.rank = rank;
    this.suit = suit.name;
    this.color = suit.color;
    Object.freeze(this);
  }
  toString() {
    return this.rank + " of " + this.suit;
  }
}

class SeededRandom {
  constructor(seed) {
    if (!Number.isInteger(seed)) throw new Error("the seed must be an integer");
    this.state = seed % 2147483647;
    if (this.state <= 0) this.state += 2147483646;
  }
  nextInt(bound) {
    this.state = (this.state * 48271) % 2147483647;
    return this.state % bound;
  }
}

class StubRandom {
  constructor(values) {
    this.values = values.slice();
  }
  nextInt() {
    return this.values.shift();
  }
}

class Deck {
  constructor(cards, random) {
    this.stack = cards.slice();
    this.random = random;
  }
  get size() {
    return this.stack.length;
  }
  pop() {
    if (this.stack.length === 0) throw new Error("deck is empty");
    return this.stack.pop();
  }
  shuffle() {
    if (!this.random) throw new Error("this deck has no random source");
    const next = this.stack.slice();
    for (let i = next.length - 1; i > 0; i -= 1) {
      const j = this.random.nextInt(i + 1);
      if (!Number.isInteger(j) || j < 0 || j > i) throw new Error("the random source returned " + j);
      const held = next[i];
      next[i] = next[j];
      next[j] = held;
    }
    this.stack = next;
    return this;
  }
  [Symbol.iterator]() {
    return this.stack.slice().reverse()[Symbol.iterator]();
  }
}

function createDeck(variant, random) {
  const ranks = VARIANTS[variant];
  if (!ranks) throw new Error("unknown variant " + variant);
  const cards = [];
  for (const suit of SUITS) {
    for (const rank of ranks) cards.push(new Card(rank, suit));
  }
  return new Deck(cards, random);
}

class Player {
  constructor(name) {
    this.name = name;
    this.hand = [];
  }
  receive(card) {
    this.hand.push(card);
  }
}

class Dealer {
  deal(deck, players, cardsEach) {
    if (players.length === 0) throw new Error("no players");
    if (cardsEach !== undefined && (!Number.isInteger(cardsEach) || cardsEach < 0)) {
      throw new Error("cardsEach must be a whole number");
    }
    const each = cardsEach === undefined ? Math.floor(deck.size / players.length) : cardsEach;
    if (each * players.length > deck.size) throw new Error("not enough cards");
    for (let round = 0; round < each; round += 1) {
      for (const player of players) player.receive(deck.pop());
    }
    return players;
  }
}

function names(cards) {
  return cards.map((card) => card.toString());
}
`,
  },
  {
    id: "groww-vending-machine",
    company: "groww",
    title: "Vending machine with object-oriented design",
    prompt:
      "Design a vending machine using object-oriented design. The report says only that various parameters were given and does not list them, so this answer fixes its own scope: products in coded slots with a price and a quantity, cash in whole units, change from a limited float, and a separate state for each situation the machine can be in.",
    level: "Internship (year not stated)",
    round: "lld",
    topic: "games",
    patterns: ["State", "Strategy"],
    evidence: "one",
    sources: [
      {
        label: "Groww internship experience (GfG)",
        url: "https://www.geeksforgeeks.org/interview-experiences/groww-internship-interview-experience-for-software-developer/",
        kind: "candidate-report",
      },
    ],
    chapters: [],
    answer: {
      ask: "<p>The report gives no parameters, so asking is the whole job. Questions to ask first:</p>\n<ul>\n<li>What does the machine accept: coins only, notes, cards? <em>Assume cash in whole units (1, 2, 5 and 10), and keep payment behind one insert call so other methods can be added.</em></li>\n<li>Does the customer pay first or choose first? <em>Assume pay first, then select.</em></li>\n<li>Where does change come from? <em>Assume a limited float of coins in the machine, plus the coins the customer just inserted.</em></li>\n<li>What if change cannot be made, or the product jams? <em>Assume that when change cannot be made nothing is taken and the customer keeps their credit, can refund or insert more. When the product jams the inserted coins are returned at once.</em></li>\n<li>Who restocks? <em>Assume an operator can restock and take the machine out of service.</em></li>\n</ul>\n<p>Out of scope: card payment, prices that change, network reporting and concurrent customers.</p>",
      entities:
        "<ul>\n<li><b>VendingMachine</b> is the context. It owns the slots, the coin float, the coins inserted in the current session, the injected change strategy and dispenser, and a reference to the current state.</li>\n<li><b>State</b> objects (<b>IdleState</b>, <b>HasCreditState</b>, <b>OutOfServiceState</b>) each implement <code>insert</code>, <code>select</code> and <code>refund</code>. They decide what the action means and which state comes next.</li>\n<li><b>Slot</b> is a code with a product name, a price and a quantity.</li>\n<li><b>ChangeStrategy</b> is an interface with <code>make(amount, stock)</code>. <code>GreedyChange</code> and <code>BacktrackingChange</code> implement it.</li>\n<li><b>Dispenser</b> is the hardware collaborator with <code>release(code)</code>, which can fail. A scripted fake stands in for it in tests.</li>\n<li><b>Coin counts</b> are plain maps from a denomination to a count. Money is whole numbers, never fractions.</li>\n</ul>",
      design:
        "<p><b>State pattern.</b> The same call means different things depending on the situation: <code>select</code> before paying is an error, after paying it may sell, and out of service it is refused. Writing this as one method full of <code>if (state === ...)</code> branches grows with every new state. Instead the machine holds a current state object and forwards <code>insert</code>, <code>select</code> and <code>refund</code> to it. Each state class holds only its own rules and moves the machine with <code>setState</code>. Adding a state, such as a maintenance mode, adds a class rather than editing every method.</p>\n<p><b>Selecting a product</b> in <code>HasCreditState</code> runs checks in a fixed order, and nothing changes until all pass:</p>\n<ol>\n<li>The slot code exists, the slot is not sold out, and the credit covers the price.</li>\n<li>Pool the machine's float with the coins just inserted, because the customer's own coins can come back as change. Ask the change strategy for coins worth <code>credit - price</code>. No answer means \"cannot make change\".</li>\n<li>Ask the dispenser to release the product. If that fails, return the inserted coins and stay consistent.</li>\n<li>Only now commit: replace the float with the pool minus the change, empty the inserted coins, decrement the quantity and move to idle.</li>\n</ol>\n<p>Validating before mutating gives the important property that every failure path leaves stock, float and credit exactly as they were, or refunds the exact coins. A strategy's answer is trusted only if it adds up to the amount and fits inside the pool, so a faulty strategy reads as \"cannot make change\" instead of corrupting the float. <code>resume</code> only leaves the out-of-service state, so calling it mid-session cannot strand a customer's credit.</p>\n<p><b>Strategy for change.</b> Greedy takes the biggest coin first. It is simple, and optimal for common coin systems with unlimited coins, but with a limited float it can fail when an answer exists: to return 6 from one 5 and three 2s, greedy takes the 5 and is stuck. <code>BacktrackingChange</code> tries the largest use of each denomination first and steps back when the rest cannot be paid, so it finds the 2 + 2 + 2 answer. Its search depth is the number of denominations, which is small, though the worst case still grows with large amounts and big floats.</p>\n<p>Refund returns exactly the inserted coins and never touches the float. Concurrency is not modelled because a physical machine serves one session; a software kiosk would guard the machine with one lock.</p>",
      extend: [
        "How would you add card or UPI payment next to cash so every method goes through the same selection flow?",
        "How would you return the credit automatically if the customer walks away, and how would you test it without sleeping?",
        "How would you let the customer choose a product before paying, and which state would that add?",
        "How do you survive a power failure in the middle of a sale without losing or returning money twice?",
        "How would an operator refill slots and collect cash without breaking a customer's session in progress?",
      ],
      slips:
        "<p>This problem punishes these slips:</p>\n<ul>\n<li>One large class with nested conditions on a status string instead of State objects, which is what the question is testing.</li>\n<li>Mutating stock or the coin float before the dispenser has succeeded, so a jam loses the sale and the money.</li>\n<li>Making change only from the machine's float and forgetting the customer's own coins, or the reverse and spending coins that are not there.</li>\n<li>Using greedy change and not noticing it fails with a limited float.</li>\n<li>Storing money as floating-point numbers.</li>\n<li>Swallowing the customer's money when change is impossible, instead of keeping credit and offering a refund.</li>\n</ul>",
    },
    checks: [
      {
        name: "refuses a selection before any money is inserted",
        expr: '((options) => new VendingMachine({ slots: { A1: { name: "Chips", price: 15, quantity: 2 }, B1: { name: "Juice", price: 14, quantity: 1 } }, coins: { 10: 0, 5: 5, 2: 0, 1: 0 }, changeStrategy: new GreedyChange(), dispenser: new ScriptedDispenser([]), ...options }))({}).select("A1")',
        expected: {
          ok: false,
          reason: "insert money first",
        },
      },
      {
        name: "dispenses with no change on an exact payment",
        expr: '(() => { const machine = ((options) => new VendingMachine({ slots: { A1: { name: "Chips", price: 15, quantity: 2 }, B1: { name: "Juice", price: 14, quantity: 1 } }, coins: { 10: 0, 5: 5, 2: 0, 1: 0 }, changeStrategy: new GreedyChange(), dispenser: new ScriptedDispenser([]), ...options }))({}); machine.insert(10); machine.insert(5); return [machine.select("A1"), machine.state.name]; })()',
        expected: [
          {
            ok: true,
            product: "Chips",
            change: {},
          },
          "idle",
        ],
      },
      {
        name: "gives change from the coin float and updates it",
        expr: '(() => { const machine = ((options) => new VendingMachine({ slots: { A1: { name: "Chips", price: 15, quantity: 2 }, B1: { name: "Juice", price: 14, quantity: 1 } }, coins: { 10: 0, 5: 5, 2: 0, 1: 0 }, changeStrategy: new GreedyChange(), dispenser: new ScriptedDispenser([]), ...options }))({}); machine.insert(10); machine.insert(10); const result = machine.select("A1"); return [result, machine.float, machine.slots.get("A1").quantity]; })()',
        expected: [
          {
            ok: true,
            product: "Chips",
            change: {
              "5": 1,
            },
          },
          {
            "1": 0,
            "2": 0,
            "5": 4,
            "10": 2,
          },
          1,
        ],
      },
      {
        name: "keeps the credit when the payment is too small",
        expr: '(() => { const machine = ((options) => new VendingMachine({ slots: { A1: { name: "Chips", price: 15, quantity: 2 }, B1: { name: "Juice", price: 14, quantity: 1 } }, coins: { 10: 0, 5: 5, 2: 0, 1: 0 }, changeStrategy: new GreedyChange(), dispenser: new ScriptedDispenser([]), ...options }))({}); machine.insert(10); return [machine.select("A1"), machine.state.name]; })()',
        expected: [
          {
            ok: false,
            reason: "insufficient credit",
          },
          "credit",
        ],
      },
      {
        name: "refunds exactly the coins that were inserted",
        expr: '(() => { const machine = ((options) => new VendingMachine({ slots: { A1: { name: "Chips", price: 15, quantity: 2 }, B1: { name: "Juice", price: 14, quantity: 1 } }, coins: { 10: 0, 5: 5, 2: 0, 1: 0 }, changeStrategy: new GreedyChange(), dispenser: new ScriptedDispenser([]), ...options }))({}); machine.insert(10); machine.insert(5); machine.insert(5); return [machine.refund(), machine.state.name, machine.float[5]]; })()',
        expected: [
          {
            ok: true,
            returned: {
              "5": 2,
              "10": 1,
            },
          },
          "idle",
          5,
        ],
      },
      {
        name: "reports a sold out slot and accepts it again after a restock",
        expr: '(() => { const machine = ((options) => new VendingMachine({ slots: { A1: { name: "Chips", price: 15, quantity: 2 }, B1: { name: "Juice", price: 14, quantity: 1 } }, coins: { 10: 0, 5: 5, 2: 0, 1: 0 }, changeStrategy: new GreedyChange(), dispenser: new ScriptedDispenser([]), ...options }))({ coins: { 10: 0, 5: 5, 2: 0, 1: 3 } }); const buy = () => { machine.insert(10); machine.insert(5); return machine.select("B1"); }; const first = buy(); machine.insert(10); machine.insert(5); const second = machine.select("B1"); machine.restock("B1", 1); return [first.ok, second, machine.select("B1").ok]; })()',
        expected: [
          true,
          {
            ok: false,
            reason: "sold out",
          },
          true,
        ],
      },
      {
        name: "fails to make change with greedy but succeeds with backtracking",
        expr: '(() => { const coins = { 10: 0, 5: 1, 2: 3, 1: 0 }; const run = (strategy) => { const machine = ((options) => new VendingMachine({ slots: { A1: { name: "Chips", price: 15, quantity: 2 }, B1: { name: "Juice", price: 14, quantity: 1 } }, coins: { 10: 0, 5: 5, 2: 0, 1: 0 }, changeStrategy: new GreedyChange(), dispenser: new ScriptedDispenser([]), ...options }))({ coins, changeStrategy: strategy }); machine.insert(10); machine.insert(10); return machine.select("B1"); }; return [run(new GreedyChange()), run(new BacktrackingChange())]; })()',
        expected: [
          {
            ok: false,
            reason: "cannot make change",
          },
          {
            ok: true,
            product: "Juice",
            change: {
              "2": 3,
            },
          },
        ],
      },
      {
        name: "refunds and keeps stock when the dispenser fails",
        expr: '(() => { const machine = ((options) => new VendingMachine({ slots: { A1: { name: "Chips", price: 15, quantity: 2 }, B1: { name: "Juice", price: 14, quantity: 1 } }, coins: { 10: 0, 5: 5, 2: 0, 1: 0 }, changeStrategy: new GreedyChange(), dispenser: new ScriptedDispenser([]), ...options }))({ dispenser: new ScriptedDispenser([false]) }); machine.insert(10); machine.insert(5); const result = machine.select("A1"); return [result, machine.state.name, machine.slots.get("A1").quantity]; })()',
        expected: [
          {
            ok: false,
            reason: "dispense failed",
            refund: {
              "5": 1,
              "10": 1,
            },
          },
          "idle",
          2,
        ],
      },
      {
        name: "rejects an unknown coin value",
        expr: '((options) => new VendingMachine({ slots: { A1: { name: "Chips", price: 15, quantity: 2 }, B1: { name: "Juice", price: 14, quantity: 1 } }, coins: { 10: 0, 5: 5, 2: 0, 1: 0 }, changeStrategy: new GreedyChange(), dispenser: new ScriptedDispenser([]), ...options }))({}).insert(3)',
        expected: {
          ok: false,
          reason: "coin not accepted",
        },
      },
      {
        name: "refunds credit and blocks all use while out of service",
        expr: '(() => { const machine = ((options) => new VendingMachine({ slots: { A1: { name: "Chips", price: 15, quantity: 2 }, B1: { name: "Juice", price: 14, quantity: 1 } }, coins: { 10: 0, 5: 5, 2: 0, 1: 0 }, changeStrategy: new GreedyChange(), dispenser: new ScriptedDispenser([]), ...options }))({}); machine.insert(5); const refund = machine.takeOutOfService(); const blocked = machine.insert(5); machine.resume(); return [refund, blocked, machine.insert(5).ok]; })()',
        expected: [
          {
            ok: true,
            returned: {
              "5": 1,
            },
          },
          {
            ok: false,
            reason: "out of service",
          },
          true,
        ],
      },
      {
        name: "keeps the inserted credit when the operator resumes a machine that never went out of service",
        expr: `(() => {
  const build = (options) =>
    new VendingMachine({
      slots: { A1: { name: "Chips", price: 15, quantity: 2 }, B1: { name: "Juice", price: 14, quantity: 1 } },
      coins: { 10: 0, 5: 5, 2: 0, 1: 0 },
      changeStrategy: new GreedyChange(),
      dispenser: new ScriptedDispenser([]),
      ...options,
    });
  const machine = build({});
  machine.insert(5);
  machine.resume();
  machine.insert(10);
  return [machine.state.name, machine.select("A1"), machine.state.name];
})()`,
        expected: ["credit", { ok: true, product: "Chips", change: {} }, "idle"],
      },
      {
        name: "keeps the credit and the stock after an unknown slot code and lets the customer top up and buy",
        expr: `(() => {
  const build = (options) =>
    new VendingMachine({
      slots: { A1: { name: "Chips", price: 15, quantity: 2 }, B1: { name: "Juice", price: 14, quantity: 1 } },
      coins: { 10: 0, 5: 5, 2: 0, 1: 0 },
      changeStrategy: new GreedyChange(),
      dispenser: new ScriptedDispenser([]),
      ...options,
    });
  const machine = build({});
  machine.insert(10);
  const unknown = machine.select("Z9");
  const short = machine.select("A1");
  machine.insert(5);
  return [unknown, short.reason, machine.select("A1").ok, machine.slots.get("A1").quantity];
})()`,
        expected: [{ ok: false, reason: "unknown slot" }, "insufficient credit", true, 1],
      },
      {
        name: "returns to idle with a refund after a jam and sells on the next attempt",
        expr: `(() => {
  const build = (options) =>
    new VendingMachine({
      slots: { A1: { name: "Chips", price: 15, quantity: 2 }, B1: { name: "Juice", price: 14, quantity: 1 } },
      coins: { 10: 0, 5: 5, 2: 0, 1: 0 },
      changeStrategy: new GreedyChange(),
      dispenser: new ScriptedDispenser([]),
      ...options,
    });
  const machine = build({ dispenser: new ScriptedDispenser([false]) });
  machine.insert(10);
  machine.insert(5);
  const jam = machine.select("A1");
  machine.insert(10);
  machine.insert(5);
  const retry = machine.select("A1");
  return [jam.reason, jam.refund, retry.ok, machine.slots.get("A1").quantity, machine.float[5]];
})()`,
        expected: ["dispense failed", { 5: 1, 10: 1 }, true, 1, 6],
      },
      {
        name: "treats change from a faulty strategy that does not add up as impossible and changes nothing",
        expr: `(() => {
  const build = (options) =>
    new VendingMachine({
      slots: { A1: { name: "Chips", price: 15, quantity: 2 }, B1: { name: "Juice", price: 14, quantity: 1 } },
      coins: { 10: 0, 5: 5, 2: 0, 1: 0 },
      changeStrategy: new GreedyChange(),
      dispenser: new ScriptedDispenser([]),
      ...options,
    });
  const machine = build({ changeStrategy: { make: () => ({ 5: 9 }) } });
  machine.insert(10);
  machine.insert(10);
  const result = machine.select("A1");
  return [result, machine.state.name, machine.float[5], machine.slots.get("A1").quantity];
})()`,
        expected: [{ ok: false, reason: "cannot make change" }, "credit", 5, 2],
      },
      {
        name: "rejects a bad slot price, an unknown restock code and a non-positive restock",
        expr: `(() => {
  const build = (options) =>
    new VendingMachine({
      slots: { A1: { name: "Chips", price: 15, quantity: 2 }, B1: { name: "Juice", price: 14, quantity: 1 } },
      coins: { 10: 0, 5: 5, 2: 0, 1: 0 },
      changeStrategy: new GreedyChange(),
      dispenser: new ScriptedDispenser([]),
      ...options,
    });
  const attempt = (fn) => {
    try {
      fn();
      return "ok";
    } catch (error) {
      return error.message;
    }
  };
  const machine = build({});
  return [
    attempt(() => build({ slots: { A1: { name: "Free", price: 0, quantity: 1 } } })),
    attempt(() => machine.restock("Z9", 1)),
    attempt(() => machine.restock("A1", 0)),
    attempt(() => machine.restock("A1", 3)),
    machine.slots.get("A1").quantity,
  ];
})()`,
        expected: [
          "price of A1 must be a positive integer",
          "unknown slot Z9",
          "quantity must be a positive integer",
          "ok",
          5,
        ],
      },
    ],
    code: `const DENOMINATIONS = [10, 5, 2, 1];

function fail(reason) {
  return { ok: false, reason };
}

function total(counts) {
  return Object.keys(counts).reduce((sum, value) => sum + Number(value) * counts[value], 0);
}

function merge(a, b) {
  const out = { ...a };
  Object.keys(b).forEach((value) => {
    out[value] = (out[value] || 0) + b[value];
  });
  return out;
}

function subtract(a, b) {
  const out = { ...a };
  Object.keys(b).forEach((value) => {
    out[value] -= b[value];
  });
  return out;
}

function valuesDescending(stock) {
  return Object.keys(stock)
    .map(Number)
    .sort((x, y) => y - x);
}

class GreedyChange {
  make(amount, stock) {
    const out = {};
    let left = amount;
    for (const value of valuesDescending(stock)) {
      const use = Math.min(Math.floor(left / value), stock[value]);
      if (use > 0) out[value] = use;
      left -= use * value;
    }
    return left === 0 ? out : null;
  }
}

class BacktrackingChange {
  make(amount, stock) {
    const values = valuesDescending(stock);
    const out = {};
    const search = (index, left) => {
      if (left === 0) return true;
      if (index === values.length) return false;
      const value = values[index];
      for (let use = Math.min(Math.floor(left / value), stock[value]); use >= 0; use -= 1) {
        if (use > 0) out[value] = use;
        else delete out[value];
        if (search(index + 1, left - use * value)) return true;
      }
      return false;
    };
    return search(0, amount) ? out : null;
  }
}

class ScriptedDispenser {
  constructor(outcomes) {
    this.outcomes = outcomes.slice();
  }
  release() {
    return this.outcomes.length > 0 ? this.outcomes.shift() : true;
  }
}

class IdleState {
  constructor(machine) {
    this.machine = machine;
    this.name = "idle";
  }
  insert(value) {
    this.machine.inserted = { [value]: 1 };
    this.machine.setState("credit");
    return { ok: true, credit: value };
  }
  select() {
    return fail("insert money first");
  }
  refund() {
    return { ok: true, returned: {} };
  }
}

class HasCreditState {
  constructor(machine) {
    this.machine = machine;
    this.name = "credit";
  }
  insert(value) {
    this.machine.inserted = merge(this.machine.inserted, { [value]: 1 });
    return { ok: true, credit: total(this.machine.inserted) };
  }
  select(code) {
    const machine = this.machine;
    const slot = machine.slots.get(code);
    if (!slot) return fail("unknown slot");
    if (slot.quantity === 0) return fail("sold out");
    const credit = total(machine.inserted);
    if (credit < slot.price) return fail("insufficient credit");
    const pool = merge(machine.float, machine.inserted);
    const change = machine.changeStrategy.make(credit - slot.price, pool);
    const fits = change && total(change) === credit - slot.price && Object.keys(change).every((v) => change[v] <= pool[v]);
    if (!fits) return fail("cannot make change");
    if (!machine.dispenser.release(code)) return { ...fail("dispense failed"), refund: this.refund().returned };
    machine.float = subtract(pool, change);
    machine.inserted = {};
    slot.quantity -= 1;
    machine.setState("idle");
    return { ok: true, product: slot.name, change };
  }
  refund() {
    const returned = this.machine.inserted;
    this.machine.inserted = {};
    this.machine.setState("idle");
    return { ok: true, returned };
  }
}

class OutOfServiceState {
  constructor(machine) {
    this.machine = machine;
    this.name = "outOfService";
  }
  insert() {
    return fail("out of service");
  }
  select() {
    return fail("out of service");
  }
  refund() {
    return { ok: true, returned: {} };
  }
}

class VendingMachine {
  constructor({ slots, coins, changeStrategy, dispenser }) {
    for (const [code, slot] of Object.entries(slots)) {
      if (!Number.isInteger(slot.price) || slot.price < 1) throw new Error("price of " + code + " must be a positive integer");
      if (!Number.isInteger(slot.quantity) || slot.quantity < 0) throw new Error("quantity of " + code + " must be 0 or more");
    }
    this.slots = new Map(Object.entries(slots).map(([code, slot]) => [code, { ...slot }]));
    this.float = { ...coins };
    this.inserted = {};
    this.changeStrategy = changeStrategy;
    this.dispenser = dispenser;
    this.states = {
      idle: new IdleState(this),
      credit: new HasCreditState(this),
      outOfService: new OutOfServiceState(this),
    };
    this.state = this.states.idle;
  }
  setState(name) {
    this.state = this.states[name];
  }
  insert(value) {
    return DENOMINATIONS.includes(value) ? this.state.insert(value) : fail("coin not accepted");
  }
  select(code) {
    return this.state.select(code);
  }
  refund() {
    return this.state.refund();
  }
  restock(code, quantity) {
    const slot = this.slots.get(code);
    if (!slot) throw new Error("unknown slot " + code);
    if (!Number.isInteger(quantity) || quantity < 1) throw new Error("quantity must be a positive integer");
    slot.quantity += quantity;
  }
  takeOutOfService() {
    const result = this.refund();
    this.setState("outOfService");
    return result;
  }
  resume() {
    if (this.state.name === "outOfService") this.setState("idle");
  }
}
`,
  },
];
