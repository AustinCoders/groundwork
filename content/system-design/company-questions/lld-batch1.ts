import type { LldQuestion } from "./lld-types";

export const questions: LldQuestion[] = [
  {
    id: "uber-job-scheduler",
    company: "uber",
    title: "Concurrent job scheduler with a swappable ordering policy",
    prompt:
      "Build a job scheduler whose code is demonstrable, handles edge cases and stays correct under concurrency and multithreading. Two candidates reported a machine coding round along these lines and neither shared the exact statement, so this answer fixes a concrete scope of its own: delayed start, an ordering rule that can be swapped, cancellation and retries.",
    level: "SDE-2 (L4)",
    round: "machine-coding",
    topic: "scheduling",
    patterns: ["Strategy", "State", "Producer-consumer"],
    evidence: "several",
    sources: [
      {
        label: "Interview Experience 65, Uber SDE2 L4 (Roundz)",
        url: "https://roundz.substack.com/p/interview-experience-65-uber-sde2-l4",
        kind: "candidate-report",
        year: 2025,
      },
      {
        label: "Interview Experience: Uber SDE-2 (L4) (Roundz)",
        url: "https://roundz.substack.com/p/interview-experience-uber-sde-2-l4",
        kind: "candidate-report",
        year: 2025,
      },
    ],
    chapters: ["sysdes-message-queues-async"],
    answer: {
      ask: "<p>Neither report gives the exact statement, so spend the first minutes pinning it down.</p>\n<ul>\n<li>Is a job a function that runs once, or does it repeat? Assume one-shot with an optional start delay.</li>\n<li>When several jobs are ready, what decides the order: priority, arrival, something else? Assume the rule must be replaceable.</li>\n<li>How many workers run at once, and can callers submit while jobs are running? Assume a fixed number and yes.</li>\n<li>Is a failed job retried, and can a waiting job be cancelled? Assume both.</li>\n</ul>\n<p>In scope: submit with delay and priority, cancel, retries with exponential backoff, a fixed worker count, shutdown, and thread safety of the shared state. Out of scope: cron expressions, persistence across restarts, distributed workers and job dependencies.</p>",
      entities:
        "<ul>\n<li><b>Scheduler</b> is the facade. It owns the job map, the two heaps and the worker slots, and exposes <code>submit</code>, <code>cancel</code>, <code>tick</code>, <code>drain</code> and <code>shutdown</code>.</li>\n<li><b>Job</b> holds the task, priority, run time, retry settings and a status of PENDING, RUNNING, DONE, FAILED or CANCELLED. It owns the only legal move from PENDING to RUNNING, <code>claim()</code>.</li>\n<li><b>OrderingPolicy</b> is the strategy interface with one method, <code>before(a, b)</code>. <code>PriorityPolicy</code>, <code>FifoPolicy</code> and <code>OldestDuePolicy</code> implement it.</li>\n<li><b>Heap</b> is a small binary heap that takes a comparison function. The scheduler has a delayed heap ordered by run time and a ready heap ordered by the policy.</li>\n<li><b>Clock</b> is injected so tests control time. The scheduler uses it and never reads the system clock itself.</li>\n</ul>\n<p>The scheduler has many jobs, uses one policy and one clock, and each job is in at most one heap at a time.</p>",
      design:
        "<p>The scheduler keeps two heaps. The <b>delayed heap</b> holds submitted jobs ordered by <code>runAt</code>. The <b>ready heap</b> holds jobs that are due, ordered by the injected policy. Time decides when a job becomes eligible; the policy decides which eligible job goes next. Keeping those two questions in separate structures is what makes the policy swappable.</p>\n<p>The <b>Strategy</b> pattern earns its place at the ready heap. Each policy implements <code>before(a, b)</code> and ends with the submission sequence number as a tie-break, so equal priorities still produce a stable, repeatable order. Changing the rule is one constructor argument and no scheduler code. The <b>State</b> idea is the job status: each transition is explicit and only <code>claim()</code> can move a job from PENDING to RUNNING.</p>\n<p>Main flow:</p>\n<ol>\n<li><code>submit</code> validates the spec (task is a function, delay is not negative, id is unused), creates a PENDING job and pushes it on the delayed heap.</li>\n<li><code>tick</code> first promotes every job whose <code>runAt</code> is not after <code>clock.now()</code> into the ready heap, dropping any that were cancelled.</li>\n<li>It then fills worker slots 0 to N minus 1. For each slot it pops the best job and calls <code>claim()</code>. If the claim fails, the job was cancelled after it was queued, so the entry is discarded and the next one is popped.</li>\n<li>If the task throws and attempts are within the retry budget, the job returns to PENDING with <code>runAt</code> moved out by <code>backoff * 2 ** (attempts - 1)</code> and goes back on the delayed heap. Otherwise it ends FAILED with the error message.</li>\n</ol>\n<p>The model steps workers explicitly, one tick per call, so output is repeatable. The idea that carries over to real threads is that <b>PENDING to RUNNING is the single decision point</b>. Cancel and <code>claim()</code> both test the same status field and only act on PENDING, so a cancel that races a pop either wins (the worker sees CANCELLED and skips) or loses (cancel returns false because the job is already RUNNING). Nothing runs twice and nothing is cancelled after it started. In a real version that test-and-set is the part done under the lock.</p>\n<p>A real version needs one lock around both heaps and the job map, a condition variable so idle workers sleep until the next <code>runAt</code> or a new submit instead of spinning, the state change done under that lock or with compare-and-set, and tasks run outside the lock so a slow task never blocks submit. Shutdown flips a flag, wakes the workers and lets them exit when the heaps are empty.</p>\n<p>Trade-off: cancel uses lazy deletion. It is O(1) but leaves dead entries in the heaps until they are popped. An indexed heap removes them at once for O(log n) per cancel and more code. Submit and pop are O(log n).</p>",
      extend: [
        "How would you add recurring jobs that run every N seconds without letting a slow run overlap the next one?",
        "A worker thread dies halfway through a job. How does the scheduler notice, and what happens to that job?",
        "How would you stop low-priority jobs from starving when high-priority jobs keep arriving?",
        "How would the design change if jobs had to survive a process restart?",
        "How would you let one job wait until another job has finished successfully?",
      ],
      slips:
        '<ul>\n<li>Checking the status and then setting RUNNING as two separate steps with the lock released in between. Two workers, or a worker and a cancel, both win.</li>\n<li>Waiting with a sleep loop instead of a timed wait on the next due job, which burns CPU or adds latency.</li>\n<li>Running the task while holding the scheduler lock, so one slow job blocks every submit.</li>\n<li>Comparing on priority alone. Equal priorities then come out in an unstable order and the demo prints something different on each run. Add a sequence number.</li>\n<li>Hard-coding the ordering inside the scheduler, so the follow-up "now order by deadline" means editing core code.</li>\n<li>Reading the system clock inside the scheduler, which makes delays and retries impossible to test.</li>\n</ul>',
    },
    code: `class FakeClock {
  constructor(start = 0) {
    this.time = start;
  }
  now() {
    return this.time;
  }
  advance(ms) {
    this.time += ms;
  }
}

class Heap {
  constructor(before) {
    this.before = before;
    this.items = [];
  }
  get size() {
    return this.items.length;
  }
  peek() {
    return this.items[0];
  }
  push(item) {
    const a = this.items;
    a.push(item);
    let i = a.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (!this.before(a[i], a[parent])) break;
      [a[i], a[parent]] = [a[parent], a[i]];
      i = parent;
    }
  }
  pop() {
    const a = this.items;
    const top = a[0];
    const last = a.pop();
    if (a.length > 0) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const left = 2 * i + 1;
        const right = left + 1;
        let best = i;
        if (left < a.length && this.before(a[left], a[best])) best = left;
        if (right < a.length && this.before(a[right], a[best])) best = right;
        if (best === i) break;
        [a[i], a[best]] = [a[best], a[i]];
        i = best;
      }
    }
    return top;
  }
}

class PriorityPolicy {
  before(a, b) {
    if (a.priority !== b.priority) return a.priority < b.priority;
    return a.seq < b.seq;
  }
}

class FifoPolicy {
  before(a, b) {
    return a.seq < b.seq;
  }
}

class OldestDuePolicy {
  before(a, b) {
    if (a.runAt !== b.runAt) return a.runAt < b.runAt;
    return a.seq < b.seq;
  }
}

class Job {
  constructor(spec, seq, now) {
    this.id = spec.id;
    this.priority = spec.priority ?? 5;
    this.runAt = now + (spec.delay ?? 0);
    this.task = spec.task;
    this.retries = spec.retries ?? 0;
    this.backoff = spec.backoff ?? 10;
    this.seq = seq;
    this.attempts = 0;
    this.status = "PENDING";
    this.result = null;
  }
  claim() {
    if (this.status !== "PENDING") return false;
    this.status = "RUNNING";
    return true;
  }
}

class Scheduler {
  constructor({ clock, policy, workers }) {
    if (!Number.isInteger(workers) || workers < 1) throw new Error("workers must be a positive integer");
    this.clock = clock;
    this.workers = workers;
    this.jobs = new Map();
    this.delayed = new Heap((a, b) => a.runAt < b.runAt || (a.runAt === b.runAt && a.seq < b.seq));
    this.ready = new Heap((a, b) => policy.before(a, b));
    this.seq = 0;
    this.open = true;
  }
  submit(spec) {
    if (!this.open) throw new Error("scheduler is shut down");
    if (typeof spec.task !== "function") throw new Error("task must be a function");
    const delay = spec.delay ?? 0;
    if (!Number.isFinite(delay) || delay < 0) throw new Error("delay must be a non-negative number");
    const retries = spec.retries ?? 0;
    if (!Number.isInteger(retries) || retries < 0) throw new Error("retries must be a non-negative integer");
    if (this.jobs.has(spec.id)) throw new Error("duplicate job id " + spec.id);
    const job = new Job(spec, this.seq++, this.clock.now());
    this.jobs.set(job.id, job);
    this.delayed.push(job);
    return job.id;
  }
  cancel(id) {
    const job = this.jobs.get(id);
    if (!job || job.status !== "PENDING") return false;
    job.status = "CANCELLED";
    return true;
  }
  statusOf(id) {
    const job = this.jobs.get(id);
    return job ? job.status : null;
  }
  promote() {
    while (this.delayed.size > 0 && this.delayed.peek().runAt <= this.clock.now()) {
      const job = this.delayed.pop();
      if (job.status === "PENDING") this.ready.push(job);
    }
  }
  nextJob() {
    while (this.ready.size > 0) {
      const job = this.ready.pop();
      if (job.claim()) return job;
    }
    return null;
  }
  runOn(worker, job) {
    job.attempts += 1;
    try {
      job.result = job.task(job);
      job.status = "DONE";
    } catch (error) {
      if (job.attempts <= job.retries) {
        job.status = "PENDING";
        job.runAt = this.clock.now() + job.backoff * 2 ** (job.attempts - 1);
        this.delayed.push(job);
      } else {
        job.status = "FAILED";
        job.result = error instanceof Error ? error.message : String(error);
      }
    }
    return { worker, id: job.id, status: job.status };
  }
  tick() {
    this.promote();
    const ran = [];
    for (let worker = 0; worker < this.workers; worker++) {
      const job = this.nextJob();
      if (!job) break;
      ran.push(this.runOn(worker, job));
    }
    return ran;
  }
  drain(step = 1, limit = 1000) {
    const ran = [];
    for (let i = 0; i < limit && this.delayed.size + this.ready.size > 0; i++) {
      ran.push(...this.tick());
      this.clock.advance(step);
    }
    return ran;
  }
  shutdown() {
    this.open = false;
  }
}`,
    checks: [
      {
        name: "runs the most urgent ready job first under the priority policy",
        expr: `(() => {
  const log = [];
  const s = new Scheduler({ clock: new FakeClock(), policy: new PriorityPolicy(), workers: 1 });
  s.submit({ id: "report", priority: 3, task: () => log.push("report") });
  s.submit({ id: "alert", priority: 1, task: () => log.push("alert") });
  s.submit({ id: "email", priority: 2, task: () => log.push("email") });
  s.drain();
  return log;
})()`,
        expected: ["alert", "email", "report"],
      },
      {
        name: "runs jobs in submission order after swapping in the fifo policy",
        expr: `(() => {
  const log = [];
  const s = new Scheduler({ clock: new FakeClock(), policy: new FifoPolicy(), workers: 1 });
  s.submit({ id: "report", priority: 3, task: () => log.push("report") });
  s.submit({ id: "alert", priority: 1, task: () => log.push("alert") });
  s.submit({ id: "email", priority: 2, task: () => log.push("email") });
  s.drain();
  return log;
})()`,
        expected: ["report", "alert", "email"],
      },
      {
        name: "serves the job that became due first under the oldest-due policy",
        expr: `(() => {
  const log = [];
  const clock = new FakeClock();
  const s = new Scheduler({ clock, policy: new OldestDuePolicy(), workers: 1 });
  s.submit({ id: "late", priority: 1, delay: 20, task: () => log.push("late") });
  s.submit({ id: "early", priority: 9, delay: 10, task: () => log.push("early") });
  clock.advance(20);
  s.drain();
  return log;
})()`,
        expected: ["early", "late"],
      },
      {
        name: "holds a delayed job until its run time arrives",
        expr: `(() => {
  const clock = new FakeClock();
  const s = new Scheduler({ clock, policy: new FifoPolicy(), workers: 1 });
  s.submit({ id: "later", delay: 50, task: () => 1 });
  const early = s.tick().length;
  clock.advance(49);
  const almost = s.tick().length;
  clock.advance(1);
  return [early, almost, s.tick().map((r) => r.id)];
})()`,
        expected: [0, 0, ["later"]],
      },
      {
        name: "never runs more jobs in one tick than there are workers",
        expr: `(() => {
  const s = new Scheduler({ clock: new FakeClock(), policy: new FifoPolicy(), workers: 2 });
  for (let i = 0; i < 5; i++) s.submit({ id: "j" + i, task: () => i });
  return [s.tick().map((r) => r.worker), s.tick().length, s.tick().length, s.tick().length];
})()`,
        expected: [[0, 1], 2, 1, 0],
      },
      {
        name: "cancels a pending job but refuses to cancel one that already ran",
        expr: `(() => {
  const s = new Scheduler({ clock: new FakeClock(), policy: new FifoPolicy(), workers: 1 });
  s.submit({ id: "a", task: () => 1 });
  s.submit({ id: "b", task: () => 2 });
  const first = s.cancel("a");
  s.tick();
  return [first, s.cancel("b"), s.statusOf("a"), s.statusOf("b"), s.cancel("missing")];
})()`,
        expected: [true, false, "CANCELLED", "DONE", false],
      },
      {
        name: "rejects a duplicate id, a bad task and a submit after shutdown",
        expr: `(() => {
  const s = new Scheduler({ clock: new FakeClock(), policy: new FifoPolicy(), workers: 1 });
  s.submit({ id: "a", task: () => 1 });
  const attempt = (spec) => {
    try {
      s.submit(spec);
      return "accepted";
    } catch (error) {
      return error.message;
    }
  };
  const results = [attempt({ id: "a", task: () => 1 }), attempt({ id: "b", task: 5 })];
  s.shutdown();
  results.push(attempt({ id: "c", task: () => 1 }));
  return results;
})()`,
        expected: ["duplicate job id a", "task must be a function", "scheduler is shut down"],
      },
      {
        name: "retries a failing job with doubling backoff until it succeeds",
        expr: `(() => {
  const clock = new FakeClock();
  const s = new Scheduler({ clock, policy: new FifoPolicy(), workers: 1 });
  let calls = 0;
  s.submit({
    id: "flaky",
    retries: 3,
    backoff: 10,
    task: () => {
      calls += 1;
      if (calls < 3) throw new Error("boom");
      return "ok";
    },
  });
  const ran = s.drain(5);
  return [ran.map((r) => r.status), s.jobs.get("flaky").attempts, s.jobs.get("flaky").result, clock.now()];
})()`,
        expected: [["PENDING", "PENDING", "DONE"], 3, "ok", 35],
      },
      {
        name: "marks a job failed once its retries are spent",
        expr: `(() => {
  const s = new Scheduler({ clock: new FakeClock(), policy: new FifoPolicy(), workers: 1 });
  s.submit({
    id: "bad",
    retries: 1,
    backoff: 1,
    task: () => {
      throw new Error("always");
    },
  });
  s.drain();
  const job = s.jobs.get("bad");
  return [job.status, job.attempts, job.result];
})()`,
        expected: ["FAILED", 2, "always"],
      },
      {
        name: "rejects a negative or non-numeric delay and a bad retry count without storing the job",
        expr: `(() => {
  const s = new Scheduler({ clock: new FakeClock(), policy: new FifoPolicy(), workers: 1 });
  const attempt = (spec) => {
    try {
      s.submit({ id: "x", task: () => 1, ...spec });
      return "accepted";
    } catch (error) {
      return error.message;
    }
  };
  const results = [attempt({ delay: -1 }), attempt({ delay: NaN }), attempt({ retries: 1.5 })];
  return [results, s.jobs.size, attempt({})];
})()`,
        expected: [
          [
            "delay must be a non-negative number",
            "delay must be a non-negative number",
            "retries must be a non-negative integer",
          ],
          0,
          "accepted",
        ],
      },
      {
        name: "cancels a job that is waiting for its retry and never runs it again",
        expr: `(() => {
  const clock = new FakeClock();
  const s = new Scheduler({ clock, policy: new FifoPolicy(), workers: 1 });
  let calls = 0;
  s.submit({
    id: "r",
    retries: 3,
    backoff: 5,
    task: () => {
      calls += 1;
      throw new Error("no");
    },
  });
  s.tick();
  const cancelled = s.cancel("r");
  clock.advance(100);
  return [cancelled, s.tick().length, calls, s.statusOf("r")];
})()`,
        expected: [true, 0, 1, "CANCELLED"],
      },
      {
        name: "keeps a thrown non-error value as the failure result and lets queued jobs finish after shutdown",
        expr: `(() => {
  const s = new Scheduler({ clock: new FakeClock(), policy: new FifoPolicy(), workers: 1 });
  s.submit({
    id: "odd",
    task: () => {
      throw "plain text";
    },
  });
  s.submit({ id: "ok", task: () => 1 });
  s.shutdown();
  s.drain();
  return [s.jobs.get("odd").result, s.statusOf("odd"), s.statusOf("ok")];
})()`,
        expected: ["plain text", "FAILED", "DONE"],
      },
    ],
  },
  {
    id: "flipkart-job-scheduler",
    company: "flipkart",
    title: "Scheduling M jobs on N threads under four policies",
    prompt:
      "Schedule M jobs across N threads on one machine. Each job has a name, a duration, a priority where P0 is the highest, a deadline and a submitter type (root, admin or user). Implement shortest job first, first come first served, fixed priority and earliest deadline first, with the tie-break rules the report lists, print the order of jobs on each thread, and skip a job under the deadline policy when it cannot finish in time. Expect the requirements to change once the first version works.",
    level: "SDE-1 (experienced)",
    round: "machine-coding",
    topic: "scheduling",
    patterns: ["Strategy", "Open-closed principle"],
    evidence: "one",
    sources: [
      {
        label: "Flipkart Interview Experience, SDE-1 experienced (GeeksforGeeks)",
        url: "https://www.geeksforgeeks.org/interview-experiences/flipkart-interview-experience-sde-1-experienced/",
        kind: "candidate-report",
      },
    ],
    chapters: [],
    answer: {
      ask: "<p>Ask these before writing anything, because the answers change the algorithm.</p>\n<ul>\n<li>Are all M jobs known up front, or do they arrive over time? Assume all are ready at time 0, and input order is arrival order.</li>\n<li>Can a running job be pre-empted? Assume no: a job runs to completion on one thread.</li>\n<li>Is the deadline an absolute time on the same clock that starts at 0? Assume yes, and durations are whole time units.</li>\n<li>How are ties broken? The report lists rules: shortest job first prefers higher priority; fixed priority prefers the higher submitter rank (root, then admin, then user) and then the longer job; earliest deadline prefers higher priority and then the shorter job. Assume those, and input order after them.</li>\n<li>Do you run real threads or print the plan? Assume the plan is the output and a thin executor could run it.</li>\n</ul>\n<p>Out of scope: pre-emption, dependencies between jobs, jobs that arrive while others run.</p>",
      entities:
        "<ul>\n<li><b>Job</b> is validated input: name, duration, priority (P0 is 0), deadline and submitter type with its rank, plus its input index for first come first served and tie-breaking.</li>\n<li><b>SchedulingPolicy</b> is the strategy interface with two methods: <code>compare(a, b)</code> decides the order and <code>canRun(job, start)</code> decides whether the job may start at that time. <code>FcfsPolicy</code>, <code>ShortestJobFirstPolicy</code>, <code>FixedPriorityPolicy</code> and <code>EarliestDeadlinePolicy</code> implement it, and <code>LongestJobFirstPolicy</code> is the extension added without touching the scheduler.</li>\n<li><b>ThreadSlot</b> is one thread: the time it becomes free and the runs placed on it.</li>\n<li><b>JobScheduler</b> has N thread slots and one policy, and turns a list of jobs into a result with the thread timelines, the skipped names and the makespan.</li>\n</ul>",
      design:
        "<p>With every job ready at time 0, the order in which jobs are considered is fixed by the policy, so the whole plan is a greedy list schedule. <code>schedule</code> sorts the jobs once with <code>policy.compare</code>, then walks that order. For each job it finds the thread that frees up earliest, asks <code>policy.canRun(job, start)</code>, and either places the job at that start time or records it as skipped.</p>\n<p>The <b>Strategy</b> pattern is the whole point. The scheduler never mentions SJF, priority or deadlines. Ordering lives in <code>compare</code> and the skip rule lives in <code>canRun</code>, so the four required policies and a fifth one added in an interview are each one small class. Only <code>EarliestDeadlinePolicy</code> returns false from <code>canRun</code>; the other policies run every job even if its deadline is already missed. Each <code>compare</code> ends with the reported tie-breaks and then the input index, which keeps the printed order identical from run to run.</p>\n<p>Why skipping at pick time is correct: the earliest free thread gives the smallest possible start time. If the job cannot meet its deadline from there, it cannot meet it on any other thread, and later jobs only start later, so the skip is final and never needs revisiting.</p>\n<p>Steps for one job:</p>\n<ol>\n<li>Take the next job in policy order.</li>\n<li>Scan the thread slots for the smallest free time; ties go to the lowest thread id.</li>\n<li>Ask the policy whether the job may start then. If not, add its name to <code>skipped</code> and continue.</li>\n<li>Otherwise <code>occupy</code> the thread: record name, start and end, and move its free time to the end.</li>\n</ol>\n<p>Cost is O(M log M) for the sort plus O(M times N) for the linear scan over threads. With a min-heap of thread free times the scan becomes O(log N). The result is a plain object, so printing and an executor are separate concerns.</p>\n<p>Trade-off: this is an offline plan, which is simple and testable. If jobs arrive over time you need an event loop with a ready heap per policy and a clock that jumps to the next arrival or the next free thread, and <code>canRun</code> is then evaluated when the job is picked rather than when the plan is built.</p>",
      extend: [
        "Jobs now arrive over time instead of all being ready at time zero. What has to change in the algorithm, and where does the policy plug in?",
        "Add pre-emption so a P0 job can interrupt a running P2 job. What state must a thread keep about the interrupted job?",
        "A new policy must combine two rules, for example priority first and then earliest deadline. How do you build it without one class per combination?",
        "Instead of skipping a late job under the deadline policy, run it last and report it as late. What changes?",
        "With a million jobs and a thousand threads, how do you make finding the next free thread cheaper?",
      ],
      slips:
        "<ul>\n<li>Writing four <code>if</code> branches on a policy name inside the scheduler. The fifth policy then edits core code, which is the requirement change the round is designed to test.</li>\n<li>Sorting without a tie-break. Equal durations, priorities or deadlines then print in an order that can differ between runs.</li>\n<li>Applying the deadline skip to every policy, or to none. Only the deadline policy skips; check what the statement says for the others.</li>\n<li>Checking the deadline against the start time instead of the finish time. A job that starts before its deadline but ends after it is late.</li>\n<li>Always filling threads round robin instead of picking the earliest free one, which wastes capacity and gives wrong per-thread order.</li>\n<li>Forgetting validation: zero threads, a zero or negative duration, an unknown submitter type, and an empty job list, which should give empty threads and a makespan of 0.</li>\n</ul>",
    },
    code: `const SUBMITTER_RANK = { ROOT: 0, ADMIN: 1, USER: 2 };

class Job {
  constructor(index, spec) {
    if (!spec.name) throw new Error("a job needs a name");
    if (!Number.isInteger(spec.duration) || spec.duration < 1) throw new Error("duration must be a positive integer");
    const priority = spec.priority ?? 0;
    if (!Number.isInteger(priority) || priority < 0) throw new Error("priority must be 0 or more");
    const submitter = spec.submitter ?? "USER";
    if (!(submitter in SUBMITTER_RANK)) throw new Error("unknown submitter " + submitter);
    this.index = index;
    this.name = spec.name;
    this.duration = spec.duration;
    this.priority = priority;
    this.deadline = spec.deadline ?? Infinity;
    this.submitter = submitter;
    this.rank = SUBMITTER_RANK[submitter];
  }
}

class FcfsPolicy {
  compare(a, b) {
    return a.index - b.index;
  }
  canRun() {
    return true;
  }
}

class ShortestJobFirstPolicy {
  compare(a, b) {
    return a.duration - b.duration || a.priority - b.priority || a.index - b.index;
  }
  canRun() {
    return true;
  }
}

class FixedPriorityPolicy {
  compare(a, b) {
    return a.priority - b.priority || a.rank - b.rank || b.duration - a.duration || a.index - b.index;
  }
  canRun() {
    return true;
  }
}

class EarliestDeadlinePolicy {
  compare(a, b) {
    return a.deadline - b.deadline || a.priority - b.priority || a.duration - b.duration || a.index - b.index;
  }
  canRun(job, start) {
    return start + job.duration <= job.deadline;
  }
}

class LongestJobFirstPolicy {
  compare(a, b) {
    return b.duration - a.duration || a.index - b.index;
  }
  canRun() {
    return true;
  }
}

class ThreadSlot {
  constructor(id) {
    this.id = id;
    this.freeAt = 0;
    this.runs = [];
  }
  occupy(job, start) {
    this.runs.push({ name: job.name, start, end: start + job.duration });
    this.freeAt = start + job.duration;
  }
}

class JobScheduler {
  constructor(threadCount, policy) {
    if (!Number.isInteger(threadCount) || threadCount < 1) throw new Error("need at least one thread");
    this.threadCount = threadCount;
    this.policy = policy;
  }
  earliestFree(slots) {
    let best = slots[0];
    for (const slot of slots) if (slot.freeAt < best.freeAt) best = slot;
    return best;
  }
  schedule(specs) {
    const slots = Array.from({ length: this.threadCount }, (_, id) => new ThreadSlot(id));
    const jobs = specs.map((spec, index) => new Job(index, spec));
    const ordered = [...jobs].sort((a, b) => this.policy.compare(a, b));
    const skipped = [];
    for (const job of ordered) {
      const slot = this.earliestFree(slots);
      if (!this.policy.canRun(job, slot.freeAt)) {
        skipped.push(job.name);
        continue;
      }
      slot.occupy(job, slot.freeAt);
    }
    const makespan = Math.max(...slots.map((slot) => slot.freeAt));
    return { threads: slots, skipped, makespan };
  }
  report(result) {
    return result.threads.map((slot) => "T" + slot.id + ": " + slot.runs.map((run) => run.name).join(", "));
  }
}`,
    checks: [
      {
        name: "first come first served fills the earliest free thread in input order",
        expr: `(() => {
  const DEMO = [
    { name: "A", duration: 4, priority: 1, deadline: 10 },
    { name: "B", duration: 2, priority: 0, deadline: 3 },
    { name: "C", duration: 3, priority: 2, deadline: 8 },
    { name: "D", duration: 1, priority: 1, deadline: 2 },
    { name: "E", duration: 5, priority: 0, deadline: 20 },
  ];
  const s = new JobScheduler(2, new FcfsPolicy());
  return s.report(s.schedule(DEMO));
})()`,
        expected: ["T0: A, D, E", "T1: B, C"],
      },
      {
        name: "shortest job first runs the short jobs before the long ones",
        expr: `(() => {
  const DEMO = [
    { name: "A", duration: 4, priority: 1, deadline: 10 },
    { name: "B", duration: 2, priority: 0, deadline: 3 },
    { name: "C", duration: 3, priority: 2, deadline: 8 },
    { name: "D", duration: 1, priority: 1, deadline: 2 },
    { name: "E", duration: 5, priority: 0, deadline: 20 },
  ];
  const s = new JobScheduler(2, new ShortestJobFirstPolicy());
  return s.report(s.schedule(DEMO));
})()`,
        expected: ["T0: D, C, E", "T1: B, A"],
      },
      {
        name: "fixed priority runs P0 jobs first, then the longer job among equal priority and submitter",
        expr: `(() => {
  const DEMO = [
    { name: "A", duration: 4, priority: 1, deadline: 10 },
    { name: "B", duration: 2, priority: 0, deadline: 3 },
    { name: "C", duration: 3, priority: 2, deadline: 8 },
    { name: "D", duration: 1, priority: 1, deadline: 2 },
    { name: "E", duration: 5, priority: 0, deadline: 20 },
  ];
  const s = new JobScheduler(2, new FixedPriorityPolicy());
  return s.report(s.schedule(DEMO));
})()`,
        expected: ["T0: E, D, C", "T1: B, A"],
      },
      {
        name: "earliest deadline first runs the tightest deadline first when all fit",
        expr: `(() => {
  const DEMO = [
    { name: "A", duration: 4, priority: 1, deadline: 10 },
    { name: "B", duration: 2, priority: 0, deadline: 3 },
    { name: "C", duration: 3, priority: 2, deadline: 8 },
    { name: "D", duration: 1, priority: 1, deadline: 2 },
    { name: "E", duration: 5, priority: 0, deadline: 20 },
  ];
  const s = new JobScheduler(2, new EarliestDeadlinePolicy());
  const result = s.schedule(DEMO);
  return [s.report(result), result.skipped, result.makespan];
})()`,
        expected: [["T0: D, C, E", "T1: B, A"], [], 9],
      },
      {
        name: "earliest deadline first skips a job that can no longer meet its deadline",
        expr: `(() => {
  const s = new JobScheduler(1, new EarliestDeadlinePolicy());
  const result = s.schedule([
    { name: "X", duration: 5, deadline: 5 },
    { name: "Y", duration: 3, deadline: 6 },
    { name: "Z", duration: 2, deadline: 20 },
  ]);
  return [s.report(result), result.skipped, result.threads[0].runs[1]];
})()`,
        expected: [["T0: X, Z"], ["Y"], { name: "Z", start: 5, end: 7 }],
      },
      {
        name: "fcfs never skips a job even when its deadline is already missed",
        expr: `(() => {
  const s = new JobScheduler(1, new FcfsPolicy());
  const result = s.schedule([
    { name: "X", duration: 5, deadline: 5 },
    { name: "Y", duration: 3, deadline: 6 },
  ]);
  return [s.report(result), result.skipped];
})()`,
        expected: [["T0: X, Y"], []],
      },
      {
        name: "leaves extra threads empty when there are fewer jobs than threads",
        expr: `(() => {
  const s = new JobScheduler(3, new FcfsPolicy());
  const result = s.schedule([{ name: "only", duration: 4 }]);
  return [s.report(result), result.makespan];
})()`,
        expected: [["T0: only", "T1: ", "T2: "], 4],
      },
      {
        name: "plugs in a longest-job-first policy without touching the scheduler",
        expr: `(() => {
  const s = new JobScheduler(1, new LongestJobFirstPolicy());
  return s.report(
    s.schedule([
      { name: "short", duration: 1 },
      { name: "long", duration: 9 },
      { name: "mid", duration: 4 },
      { name: "mid2", duration: 4 },
    ])
  );
})()`,
        expected: ["T0: long, mid, mid2, short"],
      },
      {
        name: "breaks shortest job first ties by priority and then by arrival",
        expr: `(() => {
  const s = new JobScheduler(1, new ShortestJobFirstPolicy());
  return s.report(
    s.schedule([
      { name: "p2", duration: 2, priority: 2 },
      { name: "p0", duration: 2, priority: 0 },
      { name: "p0b", duration: 2, priority: 0 },
      { name: "one", duration: 1, priority: 9 },
    ])
  );
})()`,
        expected: ["T0: one, p0, p0b, p2"],
      },
      {
        name: "breaks fixed priority ties by submitter rank and then by the longer job",
        expr: `(() => {
  const s = new JobScheduler(1, new FixedPriorityPolicy());
  return s.report(
    s.schedule([
      { name: "user-long", duration: 9, priority: 1, submitter: "USER" },
      { name: "admin-short", duration: 1, priority: 1, submitter: "ADMIN" },
      { name: "root-short", duration: 1, priority: 1, submitter: "ROOT" },
      { name: "admin-long", duration: 5, priority: 1, submitter: "ADMIN" },
      { name: "p0-user", duration: 1, priority: 0, submitter: "USER" },
    ])
  );
})()`,
        expected: ["T0: p0-user, root-short, admin-long, admin-short, user-long"],
      },
      {
        name: "breaks earliest deadline ties by priority and then by the shorter job",
        expr: `(() => {
  const s = new JobScheduler(1, new EarliestDeadlinePolicy());
  return s.report(
    s.schedule([
      { name: "late", duration: 1, priority: 0, deadline: 50 },
      { name: "long", duration: 3, priority: 1, deadline: 10 },
      { name: "short", duration: 2, priority: 1, deadline: 10 },
      { name: "urgent", duration: 4, priority: 0, deadline: 10 },
    ])
  );
})()`,
        expected: ["T0: urgent, short, long, late"],
      },
      {
        name: "keeps a job that finishes exactly on its deadline and skips one that ends a unit later",
        expr: `(() => {
  const s = new JobScheduler(1, new EarliestDeadlinePolicy());
  const result = s.schedule([
    { name: "exact", duration: 4, deadline: 4 },
    { name: "over", duration: 2, deadline: 5 },
  ]);
  return [s.report(result), result.skipped];
})()`,
        expected: [["T0: exact"], ["over"]],
      },
      {
        name: "returns empty thread timelines and a zero makespan for an empty job list",
        expr: `(() => {
  const s = new JobScheduler(2, new EarliestDeadlinePolicy());
  const result = s.schedule([]);
  return [s.report(result), result.skipped, result.makespan];
})()`,
        expected: [["T0: ", "T1: "], [], 0],
      },
      {
        name: "rejects zero threads, a non-positive duration and an unknown submitter",
        expr: `(() => {
  const attempt = (fn) => {
    try {
      fn();
      return "ok";
    } catch (error) {
      return error.message;
    }
  };
  return [
    attempt(() => new JobScheduler(0, new FcfsPolicy())),
    attempt(() => new JobScheduler(1, new FcfsPolicy()).schedule([{ name: "a", duration: 0 }])),
    attempt(() => new JobScheduler(1, new FcfsPolicy()).schedule([{ name: "a", duration: 1, submitter: "GUEST" }])),
  ];
})()`,
        expected: ["need at least one thread", "duration must be a positive integer", "unknown submitter GUEST"],
      },
    ],
  },
  {
    id: "microsoft-thread-pool",
    company: "microsoft",
    title: "Thread pool with a queue, a thread cap and idle release",
    prompt:
      "Build a thread pool from scratch that runs submitted tasks in parallel, puts extra tasks in a queue without priorities when every thread is busy, never exceeds a maximum number of threads and releases threads that have no work instead of leaving them idle. The report mentions follow-up questions on synchronized and volatile, so this answer also explains what a real threaded version needs.",
    level: "Software Engineer (L60)",
    round: "lld",
    topic: "scheduling",
    patterns: ["Producer-consumer", "Worker pool", "State"],
    evidence: "one",
    sources: [
      {
        label: "Microsoft Software Engineer (L60) Interview Experience, Dec 2025 (GeeksforGeeks)",
        url: "https://www.geeksforgeeks.org/interview-experiences/microsoft-software-engineer-l60-interview-experience-december-2025-off-campus/",
        kind: "candidate-report",
        year: 2025,
      },
    ],
    chapters: [],
    answer: {
      ask: "<p>Questions to settle first:</p>\n<ul>\n<li>Do threads start up front or on demand? Assume on demand, up to the maximum, with no minimum kept alive.</li>\n<li>Is the queue bounded? The report does not say. Assume an optional limit, and that a full queue rejects the task.</li>\n<li>Do tasks have priorities? The report says no, so the queue is first in, first out.</li>\n<li>How long must a thread be idle before it is released? Assume a configurable number of time units.</li>\n<li>Do callers need results, and what does shutdown mean? Assume results are optional and shutdown is graceful.</li>\n</ul>\n<p>Because real threads are not deterministic, the code models time as explicit steps and the design section describes the locking a real pool needs. Out of scope: task priorities, futures, work stealing, and a minimum core thread count.</p>",
      entities:
        "<ul>\n<li><b>ThreadPool</b> owns the workers, the queue, the completed list and the shutdown flag. It exposes <code>submit</code>, <code>step</code>, <code>snapshot</code>, <code>shutdown</code>, <code>shutdownNow</code> and <code>isTerminated</code>.</li>\n<li><b>Worker</b> stands for one thread. It is either idle, counting how long it has been idle, or busy with a task and the ticks that remain.</li>\n<li><b>Task</b> has a name, the number of ticks it needs and an optional function whose return value is stored when the task completes.</li>\n<li>The <b>task queue</b> is the buffer between submitters (producers) and workers (consumers). Its optional limit is the pool's back-pressure.</li>\n</ul>\n<p>The pool has many workers and one queue; a worker holds at most one task at a time; a task is either in the queue or on exactly one worker.</p>",
      design:
        "<p>The shape is producer-consumer: callers produce tasks, workers consume them, and the queue decouples the two. <code>submit</code> makes one of four choices, in this order: hand the task to an idle worker (reuse is cheapest); else start a new worker if fewer than <code>maxThreads</code> exist; else put the task in the queue if it has room; else reject by throwing. This grows to the maximum before queueing. Java's <code>ThreadPoolExecutor</code> with a core size prefers to queue once the core threads exist, so say which policy you chose and why.</p>\n<p>Time advances through <code>step</code>, which does three things in a fixed order so runs are repeatable:</p>\n<ol>\n<li>Every busy worker burns one tick. A worker that reaches zero completes its task and the name is appended to <code>completed</code>. The optional result is stored, or the error message goes to <code>failed</code> if the task threw, so one bad task never stops the step.</li>\n<li>Every idle worker, in creation order, takes the next task from the front of the queue.</li>\n<li>Every worker that was already idle when the step began, and is still idle, has its idle counter increased, and any worker whose counter reached the timeout is removed. The step in which a worker finishes does not count, so the timeout measures whole steps without work.</li>\n</ol>\n<p>Worker is a small state machine: created busy, busy to idle when the task finishes, idle to busy when work arrives, idle to gone on timeout. A worker that just finished and picked up queued work in the same step never starts its idle clock.</p>\n<p>What the real version needs. Each worker is a thread looping on <code>queue.poll(idleTimeout)</code> from a blocking queue, which is a lock plus a not-empty condition. A null result means it idled out, so it exits. The worker count is shared state with a check-then-act race: two submits can both see a count one below the maximum and both spawn. Guard the check and the increment with one lock, or use compare-and-set on an atomic counter. <code>synchronized</code> gives atomicity and visibility together. <code>volatile</code> gives visibility only, which is enough for a shutdown flag that one thread writes and others read, but not for <code>count++</code>. A worker must catch exceptions from a task so one bad task does not kill the thread. A worker that idles out must re-check the queue under the lock so a task submitted at that moment is not stranded.</p>\n<p>Trade-off: the stepped model is fully deterministic and easy to assert on, but it hides contention. The array-backed queue here also makes dequeue linear in the worst case; a real queue is a linked list or ring buffer with O(1) enqueue and dequeue.</p>",
      extend: [
        "Add task priorities so urgent tasks overtake queued ones. What replaces the FIFO queue, and what happens to ordering among equal priorities?",
        "Keep a minimum number of core threads alive even when idle. Where does that rule live in the release logic?",
        "Callers want the result of a task. How do you return a future-style handle without blocking the worker?",
        "When the queue is full, what are the alternatives to throwing, such as running the task on the caller or dropping the oldest queued task?",
        "How do you shut the pool down without losing queued tasks and without waiting forever on a stuck task?",
      ],
      slips:
        "<ul>\n<li>Checking the worker count and starting a thread as two unguarded steps, so the pool silently exceeds its maximum under load.</li>\n<li>Using <code>volatile</code> for the counter and claiming that makes it safe. It makes the value visible but the read-modify-write is still not atomic.</li>\n<li>Letting an exception from one task kill its worker thread, so capacity drops without any signal.</li>\n<li>Releasing an idle worker without re-checking the queue, which strands a task submitted at the same moment.</li>\n<li>Releasing idle threads down to zero by accident when the requirement says a minimum should stay, or the reverse.</li>\n<li>Spinning on an empty queue instead of blocking on a condition, which wastes a core per worker.</li>\n<li>Giving no answer for shutdown: new submits must be refused, queued work should drain, and callers need a way to learn the pool has stopped.</li>\n</ul>",
    },
    code: `class Task {
  constructor(name, ticks, run) {
    if (!name) throw new Error("a task needs a name");
    if (!Number.isInteger(ticks) || ticks < 1) throw new Error("ticks must be a positive integer");
    this.name = name;
    this.ticks = ticks;
    this.run = run ?? null;
  }
}

class Worker {
  constructor(id) {
    this.id = id;
    this.task = null;
    this.remaining = 0;
    this.idleFor = 0;
  }
  get busy() {
    return this.task !== null;
  }
  assign(task) {
    this.task = task;
    this.remaining = task.ticks;
    this.idleFor = 0;
  }
  advance() {
    this.remaining -= 1;
    if (this.remaining > 0) return null;
    const finished = this.task;
    this.task = null;
    this.idleFor = 0;
    return finished;
  }
}

class ThreadPool {
  constructor({ maxThreads, idleTimeout = Infinity, queueLimit = Infinity }) {
    if (!Number.isInteger(maxThreads) || maxThreads < 1) throw new Error("maxThreads must be a positive integer");
    if (!(idleTimeout >= 1)) throw new Error("idleTimeout must be at least 1");
    if (!(queueLimit >= 0)) throw new Error("queueLimit cannot be negative");
    this.maxThreads = maxThreads;
    this.idleTimeout = idleTimeout;
    this.queueLimit = queueLimit;
    this.workers = [];
    this.queue = [];
    this.completed = [];
    this.results = {};
    this.failed = {};
    this.nextId = 0;
    this.open = true;
  }
  submit(name, ticks, run) {
    if (!this.open) throw new Error("pool is shut down");
    const task = new Task(name, ticks, run);
    const idle = this.workers.find((worker) => !worker.busy);
    if (idle) {
      idle.assign(task);
    } else if (this.workers.length < this.maxThreads) {
      const worker = new Worker(this.nextId++);
      worker.assign(task);
      this.workers.push(worker);
    } else if (this.queue.length < this.queueLimit) {
      this.queue.push(task);
    } else {
      throw new Error("rejected: queue is full");
    }
  }
  finish(task) {
    this.completed.push(task.name);
    if (!task.run) return;
    try {
      this.results[task.name] = task.run();
    } catch (error) {
      this.failed[task.name] = error instanceof Error ? error.message : String(error);
    }
  }
  step() {
    const wasIdle = new Set(this.workers.filter((worker) => !worker.busy));
    for (const worker of this.workers) {
      if (!worker.busy) continue;
      const finished = worker.advance();
      if (finished) this.finish(finished);
    }
    for (const worker of this.workers) {
      if (!worker.busy && this.queue.length > 0) worker.assign(this.queue.shift());
    }
    for (const worker of this.workers) if (!worker.busy && wasIdle.has(worker)) worker.idleFor += 1;
    this.workers = this.workers.filter((worker) => worker.busy || worker.idleFor < this.idleTimeout);
  }
  snapshot() {
    const busy = this.workers.filter((worker) => worker.busy).length;
    return { workers: this.workers.length, busy, idle: this.workers.length - busy, queued: this.queue.length };
  }
  shutdown() {
    this.open = false;
  }
  shutdownNow() {
    this.open = false;
    return this.queue.splice(0).map((task) => task.name);
  }
  isTerminated() {
    return !this.open && this.queue.length === 0 && this.workers.every((worker) => !worker.busy);
  }
}`,
    checks: [
      {
        name: "starts a new worker per task until the maximum and queues the rest",
        expr: `(() => {
  const pool = new ThreadPool({ maxThreads: 2 });
  pool.submit("A", 3);
  pool.submit("B", 3);
  pool.submit("C", 3);
  return pool.snapshot();
})()`,
        expected: { workers: 2, busy: 2, idle: 0, queued: 1 },
      },
      {
        name: "creates no worker until the first task arrives",
        expr: `(() => {
  const pool = new ThreadPool({ maxThreads: 4 });
  const before = pool.snapshot().workers;
  pool.submit("A", 1);
  return [before, pool.snapshot().workers];
})()`,
        expected: [0, 1],
      },
      {
        name: "runs queued tasks in first in first out order on a single worker",
        expr: `(() => {
  const pool = new ThreadPool({ maxThreads: 1 });
  for (const name of ["A", "B", "C", "D"]) pool.submit(name, 1);
  for (let i = 0; i < 4; i++) pool.step();
  return pool.completed;
})()`,
        expected: ["A", "B", "C", "D"],
      },
      {
        name: "never grows past the maximum however many tasks are submitted",
        expr: `(() => {
  const pool = new ThreadPool({ maxThreads: 3 });
  for (let i = 0; i < 10; i++) pool.submit("t" + i, 2);
  let peak = pool.snapshot().workers;
  while (pool.snapshot().busy > 0 || pool.snapshot().queued > 0) {
    pool.step();
    peak = Math.max(peak, pool.snapshot().workers);
  }
  return [peak, pool.completed.length];
})()`,
        expected: [3, 10],
      },
      {
        name: "hands a new task to an idle worker instead of creating another",
        expr: `(() => {
  const pool = new ThreadPool({ maxThreads: 4 });
  pool.submit("A", 1);
  pool.step();
  pool.submit("B", 1);
  return pool.snapshot();
})()`,
        expected: { workers: 1, busy: 1, idle: 0, queued: 0 },
      },
      {
        name: "releases a worker that stays idle for the whole timeout",
        expr: `(() => {
  const pool = new ThreadPool({ maxThreads: 2, idleTimeout: 2 });
  pool.submit("A", 1);
  const counts = [];
  for (let i = 0; i < 3; i++) {
    pool.step();
    counts.push(pool.snapshot().workers);
  }
  return counts;
})()`,
        expected: [1, 1, 0],
      },
      {
        name: "keeps a worker alive when new work arrives before its idle timeout runs out",
        expr: `(() => {
  const pool = new ThreadPool({ maxThreads: 2, idleTimeout: 2 });
  pool.submit("A", 1);
  pool.step();
  pool.step();
  pool.submit("B", 3);
  pool.step();
  pool.step();
  return [pool.snapshot(), pool.completed];
})()`,
        expected: [{ workers: 1, busy: 1, idle: 0, queued: 0 }, ["A"]],
      },
      {
        name: "records a failing task in failed and still runs the rest of the step",
        expr: `(() => {
  const pool = new ThreadPool({ maxThreads: 2 });
  pool.submit("bad", 1, () => {
    throw new Error("boom");
  });
  pool.submit("good", 1, () => "fine");
  pool.step();
  return [pool.failed, pool.results, pool.completed];
})()`,
        expected: [{ bad: "boom" }, { good: "fine" }, ["bad", "good"]],
      },
      {
        name: "rejects a bad idle timeout or a negative queue limit",
        expr: `(() => {
  const attempt = (options) => {
    try {
      new ThreadPool({ maxThreads: 1, ...options });
      return "ok";
    } catch (error) {
      return error.message;
    }
  };
  return [attempt({ idleTimeout: 0 }), attempt({ queueLimit: -1 }), attempt({ idleTimeout: 3, queueLimit: 0 })];
})()`,
        expected: ["idleTimeout must be at least 1", "queueLimit cannot be negative", "ok"],
      },
      {
        name: "rejects a task when every worker is busy and the queue is full",
        expr: `(() => {
  const pool = new ThreadPool({ maxThreads: 1, queueLimit: 1 });
  pool.submit("A", 5);
  pool.submit("B", 5);
  try {
    pool.submit("C", 5);
    return "accepted";
  } catch (error) {
    return error.message;
  }
})()`,
        expected: "rejected: queue is full",
      },
      {
        name: "shutdown refuses new tasks but finishes the queued ones",
        expr: `(() => {
  const pool = new ThreadPool({ maxThreads: 1 });
  pool.submit("A", 2);
  pool.submit("B", 1);
  pool.shutdown();
  let refused = "accepted";
  try {
    pool.submit("C", 1);
  } catch (error) {
    refused = error.message;
  }
  const early = pool.isTerminated();
  while (!pool.isTerminated()) pool.step();
  return [refused, early, pool.completed];
})()`,
        expected: ["pool is shut down", false, ["A", "B"]],
      },
      {
        name: "shutdownNow returns the tasks that never started",
        expr: `(() => {
  const pool = new ThreadPool({ maxThreads: 1 });
  pool.submit("A", 3);
  pool.submit("B", 1);
  pool.submit("C", 1);
  return [pool.shutdownNow(), pool.snapshot().queued];
})()`,
        expected: [["B", "C"], 0],
      },
      {
        name: "records the result of a task when it completes",
        expr: `(() => {
  const pool = new ThreadPool({ maxThreads: 2 });
  pool.submit("sum", 2, () => 1 + 2);
  pool.step();
  const before = Object.keys(pool.results).length;
  pool.step();
  return [before, pool.results];
})()`,
        expected: [0, { sum: 3 }],
      },
    ],
  },
  {
    id: "ola-pubsub-topics",
    company: "ola",
    title: "Topic-based publish-subscribe with consumer groups",
    prompt:
      "Build a system where many senders publish events to named topics and many receivers subscribe to topics, so that every event on a topic reaches every subscriber. As a bonus, support receiver groups where each group gets every event once and only one member of the group handles it, in the way Kafka consumer groups behave.",
    level: "SDE-2",
    round: "machine-coding",
    topic: "scheduling",
    patterns: ["Observer", "Strategy", "Publish-subscribe"],
    evidence: "one",
    sources: [
      {
        label: "OLA Interview Experience, Set 8 for SDE-2 (GeeksforGeeks)",
        url: "https://www.geeksforgeeks.org/ola-interview-experience-set-8-for-sde-2/",
        kind: "candidate-report",
      },
    ],
    chapters: ["sysdes-message-queues-async"],
    answer: {
      ask: "<p>The statement is short, so confirm these before coding.</p>\n<ul>\n<li>Does a new subscriber see past events, or only events published after it subscribed? Assume only later events.</li>\n<li>Is delivery push (the broker calls a handler) or pull (the consumer polls)? Assume push into a per-consumer inbox that a delivery step drains.</li>\n<li>What ordering is needed? Assume events reach each consumer in publish order.</li>\n<li>Inside a group, how is the member chosen? Assume a replaceable rule, with round robin by default and a key hash as the second option.</li>\n<li>What happens when a handler fails? Assume the failure is recorded and does not stop other consumers.</li>\n</ul>\n<p>In scope: topics, publishers, subscribers, groups, members joining and leaving. Out of scope: persistence, replay from an offset, acknowledgements with redelivery, and partitions.</p>",
      entities:
        "<ul>\n<li><b>Broker</b> is the facade. It owns the topics and the dead letter list, and offers <code>createTopic</code>, <code>subscribe</code>, <code>joinGroup</code>, <code>leaveGroup</code>, <code>publish</code> and <code>deliver</code>.</li>\n<li><b>Topic</b> has a sequence counter, a map of plain subscribers and a map of groups. Publishing stamps an event and fans it out.</li>\n<li><b>Publisher</b> is a thin sender with an id that calls the broker, so the sender is recorded on each event.</li>\n<li><b>Endpoint</b> is a receiver: an id, a handler function and an inbox queue. It is used both for plain subscribers and for group members.</li>\n<li><b>Group</b> has many endpoints, a backlog for events that arrive when it has no members, and a member assignment strategy.</li>\n<li><b>RoundRobin</b> and <b>KeyHash</b> implement the strategy with one method, <code>pick(members, event)</code>.</li>\n</ul>",
      design:
        "<p>Publishing has two fan-out rules on the same topic. A plain subscriber is an <b>Observer</b>: it gets every event, so the topic copies the event reference into each subscriber's inbox. A group is one logical subscriber: the topic offers the event to the group once, and the group's <b>assignment strategy</b> chooses one member whose inbox receives it. Round robin spreads load evenly; key hash sends events with the same key to the same member, which keeps per-key order. Both sit behind <code>pick</code>, so adding sticky or least-loaded assignment is a new class.</p>\n<p>Main flow:</p>\n<ol>\n<li><code>publish(topic, payload, key)</code> looks up the topic (unknown topics throw), increments its sequence number and builds the event.</li>\n<li>The event goes into the inbox of every plain subscriber and is offered to every group.</li>\n<li>A group with members calls the strategy and pushes the event into that member's inbox. A group with no members keeps the event in its backlog, and the next member to join receives it.</li>\n<li><code>deliver</code> walks every endpoint, drains its inbox in order and calls the handler. A handler that throws is recorded in the dead letter list with the endpoint id and sequence number, and delivery carries on. The event is not retried.</li>\n</ol>\n<p>Each consumer has its own inbox, so one slow or failing consumer cannot hold up the others, and each consumer sees events in publish order. When a member leaves, its undelivered inbox is re-offered to the group and merged into the receiving inbox by sequence number, so nothing is lost and order still holds. A plain <code>unsubscribe</code> discards that subscriber's undelivered events, and the first member to join a group fixes its strategy. Events already sitting in other inboxes stay where they are when someone joins, so a key can briefly be split across two members during a membership change. Consistent hashing reduces that.</p>\n<p>A real version needs one lock per topic so sequence numbers and fan-out happen atomically, a concurrent or copy-on-write subscriber list so subscribe and unsubscribe do not break a publish in progress, and a worker thread or executor per endpoint that blocks on its inbox. Handlers must run outside the topic lock.</p>\n<p>Trade-off: inboxes per consumer are simple and isolate failures, but memory grows with slow consumers and a crash loses undelivered events. The alternative is a shared append-only log per topic with an offset per subscriber or group. That gives replay, late subscribers reading from the start and cheap fan-out, at the cost of retention and offset management.</p>",
      extend: [
        "A new subscriber should be able to read the topic from the beginning. What storage and bookkeeping does that need, and what does it do to memory?",
        "A handler fails. How would you add acknowledgements, retries and a dead letter queue so that a group member's failure does not lose the event?",
        "How would you guarantee that events with the same key are handled in order by one member even when members join and leave?",
        "Publish and subscribe now happen on many threads at once. Which operations need a lock, and which data structures can be lock-free?",
        "A topic gets far more traffic than one consumer can handle. How would you split it into partitions and how would a group share them?",
      ],
      slips:
        "<ul>\n<li>Delivering by calling handlers inside <code>publish</code>. A slow or throwing subscriber then blocks the publisher and every subscriber after it.</li>\n<li>Sharing one inbox per topic and letting subscribers read from it with a counter, which makes removing events and group handling awkward.</li>\n<li>Giving a group event to every member, or to none when the picked member has left. Exactly one member must get each event.</li>\n<li>Forgetting that a group is separate from plain subscribers: two groups on one topic each receive every event once.</li>\n<li>Losing a leaving member's pending events instead of re-assigning them.</li>\n<li>Using wall-clock time or random numbers for ordering and assignment, which makes the demo non-repeatable. Use a sequence number and a stable hash.</li>\n</ul>",
    },
    code: `function hash(value) {
  let h = 0;
  for (const ch of String(value)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

class RoundRobin {
  constructor() {
    this.next = 0;
  }
  pick(members) {
    const member = members[this.next % members.length];
    this.next += 1;
    return member;
  }
}

class KeyHash {
  pick(members, event) {
    return members[hash(event.key ?? event.seq) % members.length];
  }
}

class Endpoint {
  constructor(id, handler) {
    this.id = id;
    this.handler = handler;
    this.inbox = [];
  }
}

class Group {
  constructor(id, strategy) {
    this.id = id;
    this.strategy = strategy;
    this.members = [];
    this.backlog = [];
  }
  accept(event) {
    if (this.members.length === 0) {
      this.backlog.push(event);
      return;
    }
    const inbox = this.strategy.pick(this.members, event).inbox;
    inbox.push(event);
    if (inbox.length > 1 && inbox[inbox.length - 2].seq > event.seq) inbox.sort((a, b) => a.seq - b.seq);
  }
  join(endpoint) {
    if (this.members.some((member) => member.id === endpoint.id)) throw new Error("already in group: " + endpoint.id);
    this.members.push(endpoint);
    const waiting = this.backlog.splice(0);
    for (const event of waiting) this.accept(event);
  }
  leave(id) {
    const index = this.members.findIndex((member) => member.id === id);
    if (index < 0) return false;
    const [gone] = this.members.splice(index, 1);
    for (const event of gone.inbox.splice(0)) this.accept(event);
    return true;
  }
}

class Topic {
  constructor(name) {
    this.name = name;
    this.subscribers = new Map();
    this.groups = new Map();
    this.seq = 0;
  }
  publish(payload, key, sender) {
    this.seq += 1;
    const event = { topic: this.name, seq: this.seq, key, payload, sender };
    for (const endpoint of this.subscribers.values()) endpoint.inbox.push(event);
    for (const group of this.groups.values()) group.accept(event);
    return event.seq;
  }
}

class Broker {
  constructor() {
    this.topics = new Map();
    this.deadLetters = [];
  }
  createTopic(name) {
    if (this.topics.has(name)) throw new Error("topic exists: " + name);
    this.topics.set(name, new Topic(name));
  }
  topic(name) {
    const topic = this.topics.get(name);
    if (!topic) throw new Error("unknown topic " + name);
    return topic;
  }
  subscribe(topicName, id, handler) {
    const topic = this.topic(topicName);
    if (topic.subscribers.has(id)) throw new Error("already subscribed: " + id);
    topic.subscribers.set(id, new Endpoint(id, handler));
  }
  unsubscribe(topicName, id) {
    return this.topic(topicName).subscribers.delete(id);
  }
  joinGroup(topicName, groupId, memberId, handler, strategy) {
    const topic = this.topic(topicName);
    if (!topic.groups.has(groupId)) topic.groups.set(groupId, new Group(groupId, strategy ?? new RoundRobin()));
    topic.groups.get(groupId).join(new Endpoint(memberId, handler));
  }
  leaveGroup(topicName, groupId, memberId) {
    const group = this.topic(topicName).groups.get(groupId);
    return group ? group.leave(memberId) : false;
  }
  publish(topicName, payload, key, sender) {
    return this.topic(topicName).publish(payload, key, sender);
  }
  deliver() {
    let handled = 0;
    for (const topic of this.topics.values()) {
      const endpoints = [...topic.subscribers.values()];
      for (const group of topic.groups.values()) endpoints.push(...group.members);
      for (const endpoint of endpoints) {
        for (const event of endpoint.inbox.splice(0)) {
          try {
            endpoint.handler(event);
            handled += 1;
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.deadLetters.push({ endpoint: endpoint.id, seq: event.seq, error: message });
          }
        }
      }
    }
    return handled;
  }
}

class Publisher {
  constructor(id, broker) {
    this.id = id;
    this.broker = broker;
  }
  send(topic, payload, key) {
    return this.broker.publish(topic, payload, key, this.id);
  }
}`,
    checks: [
      {
        name: "delivers every event on a topic to every subscriber",
        expr: `(() => {
  const b = new Broker();
  b.createTopic("rides");
  const a = [];
  const c = [];
  b.subscribe("rides", "a", (e) => a.push(e.payload));
  b.subscribe("rides", "c", (e) => c.push(e.payload));
  const p = new Publisher("p1", b);
  p.send("rides", "r1");
  p.send("rides", "r2");
  const handled = b.deliver();
  return [a, c, handled];
})()`,
        expected: [["r1", "r2"], ["r1", "r2"], 4],
      },
      {
        name: "keeps topics apart and gives a late subscriber only later events",
        expr: `(() => {
  const b = new Broker();
  b.createTopic("rides");
  b.createTopic("food");
  const rides = [];
  const food = [];
  b.publish("rides", "early");
  b.subscribe("rides", "r", (e) => rides.push(e.payload));
  b.subscribe("food", "f", (e) => food.push(e.payload));
  b.publish("rides", "late");
  b.deliver();
  return [rides, food];
})()`,
        expected: [["late"], []],
      },
      {
        name: "gives each event to exactly one member of a group in round robin order",
        expr: `(() => {
  const b = new Broker();
  b.createTopic("t");
  const m1 = [];
  const m2 = [];
  b.joinGroup("t", "g", "m1", (e) => m1.push(e.seq));
  b.joinGroup("t", "g", "m2", (e) => m2.push(e.seq));
  for (let i = 0; i < 4; i++) b.publish("t", i);
  b.deliver();
  return [m1, m2];
})()`,
        expected: [
          [1, 3],
          [2, 4],
        ],
      },
      {
        name: "delivers each event once to every group and to plain subscribers as well",
        expr: `(() => {
  const b = new Broker();
  b.createTopic("t");
  const seen = { g1: 0, g2: 0, solo: 0 };
  b.joinGroup("t", "g1", "a", () => (seen.g1 += 1));
  b.joinGroup("t", "g1", "b", () => (seen.g1 += 1));
  b.joinGroup("t", "g2", "c", () => (seen.g2 += 1));
  b.subscribe("t", "solo", () => (seen.solo += 1));
  for (let i = 0; i < 6; i++) b.publish("t", i);
  b.deliver();
  return seen;
})()`,
        expected: { g1: 6, g2: 6, solo: 6 },
      },
      {
        name: "sends events with the same key to the same member under the key hash strategy",
        expr: `(() => {
  const b = new Broker();
  b.createTopic("t");
  const got = { m1: [], m2: [], m3: [] };
  const strategy = new KeyHash();
  for (const id of ["m1", "m2", "m3"]) b.joinGroup("t", "g", id, (e) => got[id].push(e.key), strategy);
  for (const key of ["u1", "u2", "u1", "u3", "u1", "u2"]) b.publish("t", 0, key);
  b.deliver();
  const owners = (key) => Object.keys(got).filter((id) => got[id].includes(key)).length;
  return [owners("u1"), owners("u2"), owners("u3"), got.m1.length + got.m2.length + got.m3.length];
})()`,
        expected: [1, 1, 1, 6],
      },
      {
        name: "hands the pending events of a leaving member to the remaining members",
        expr: `(() => {
  const b = new Broker();
  b.createTopic("t");
  const m1 = [];
  const m2 = [];
  b.joinGroup("t", "g", "m1", (e) => m1.push(e.seq));
  b.joinGroup("t", "g", "m2", (e) => m2.push(e.seq));
  b.publish("t", "x");
  b.publish("t", "y");
  const left = b.leaveGroup("t", "g", "m2");
  b.deliver();
  return [left, m1, m2, b.leaveGroup("t", "g", "ghost")];
})()`,
        expected: [true, [1, 2], [], false],
      },
      {
        name: "keeps publish order in the inbox that takes over a leaving member's events",
        expr: `(() => {
  const b = new Broker();
  b.createTopic("t");
  const m1 = [];
  b.joinGroup("t", "g", "m1", (e) => m1.push(e.seq));
  b.joinGroup("t", "g", "m2", () => 0);
  for (let i = 0; i < 3; i++) b.publish("t", i);
  b.leaveGroup("t", "g", "m2");
  b.deliver();
  return m1;
})()`,
        expected: [1, 2, 3],
      },
      {
        name: "rejects a duplicate group member and stops delivering to an unsubscribed receiver",
        expr: `(() => {
  const b = new Broker();
  b.createTopic("t");
  const seen = [];
  b.joinGroup("t", "g", "m1", () => 0);
  let duplicate = "ok";
  try {
    b.joinGroup("t", "g", "m1", () => 0);
  } catch (error) {
    duplicate = error.message;
  }
  b.subscribe("t", "s", (e) => seen.push(e.payload));
  b.publish("t", "before");
  b.deliver();
  const removed = b.unsubscribe("t", "s");
  b.publish("t", "after");
  b.deliver();
  return [duplicate, seen, removed, b.unsubscribe("t", "s")];
})()`,
        expected: ["already in group: m1", ["before"], true, false],
      },
      {
        name: "holds events for a group whose members all left until a new one joins",
        expr: `(() => {
  const b = new Broker();
  b.createTopic("t");
  const got = [];
  b.joinGroup("t", "g", "m1", () => 0);
  b.leaveGroup("t", "g", "m1");
  b.publish("t", "a");
  b.publish("t", "b");
  b.joinGroup("t", "g", "m2", (e) => got.push(e.payload));
  b.deliver();
  return got;
})()`,
        expected: ["a", "b"],
      },
      {
        name: "records a failing handler as a dead letter and keeps delivering to the others",
        expr: `(() => {
  const b = new Broker();
  b.createTopic("t");
  const ok = [];
  b.subscribe("t", "bad", () => {
    throw new Error("nope");
  });
  b.subscribe("t", "good", (e) => ok.push(e.payload));
  b.publish("t", "m1");
  const handled = b.deliver();
  return [ok, handled, b.deadLetters];
})()`,
        expected: [["m1"], 1, [{ endpoint: "bad", seq: 1, error: "nope" }]],
      },
      {
        name: "refuses unknown topics, duplicate topics and duplicate subscribers",
        expr: `(() => {
  const b = new Broker();
  b.createTopic("t");
  b.subscribe("t", "a", () => 1);
  const attempt = (fn) => {
    try {
      fn();
      return "ok";
    } catch (error) {
      return error.message;
    }
  };
  return [
    attempt(() => b.publish("nope", 1)),
    attempt(() => b.createTopic("t")),
    attempt(() => b.subscribe("t", "a", () => 1)),
  ];
})()`,
        expected: ["unknown topic nope", "topic exists: t", "already subscribed: a"],
      },
    ],
  },
  {
    id: "microsoft-logger-service",
    company: "microsoft",
    title: "Logger that reports finished processes in start order in constant time",
    prompt:
      "Design a logger with start, end and log operations. Processes start and end in any order, and log must report the finished processes that started before every process that is still running, without scanning all processes, so each operation takes constant time. A follow-up asks how new logging behaviour can be added without changing the core code.",
    level: "Senior Software Engineer (L63)",
    round: "lld",
    topic: "infra",
    patterns: ["Decorator", "Observer", "Strategy"],
    evidence: "one",
    sources: [
      {
        label: "Interview Experience 157, Microsoft SDE L63 (Roundz)",
        url: "https://roundz.substack.com/p/interview-experience-157-microsoft-sde-l63",
        kind: "candidate-report",
        year: 2025,
      },
    ],
    chapters: ["sysdes-observability-scale"],
    answer: {
      ask: "<p>The wording of <code>log</code> is the hard part, so pin it down first.</p>\n<ul>\n<li>Does <code>log</code> return every finished process, or only those that started before the oldest still-running one? Assume the second: a finished process waits until everything that started before it has finished.</li>\n<li>Is each process reported once, and in what order? Assume once, in start order.</li>\n<li>Can an id be reused after it was reported? Assume yes, but a live id cannot be started twice.</li>\n<li>What counts as constant time? Assume each process is added once, marked once and released once, so the cost per process is constant and <code>log</code> costs the size of what it returns.</li>\n<li>Is time given or read from a clock? Assume an injected clock.</li>\n</ul>\n<p>In scope: the three operations, the output destinations, thread-safety notes. Out of scope: durable storage and log rotation.</p>",
      entities:
        "<ul>\n<li><b>Logger</b> is the facade. It stamps times with the clock, forwards <code>start</code> and <code>end</code> to the tracker, and on <code>log</code> writes each released record to every sink.</li>\n<li><b>ProcessTracker</b> holds a singly linked list in start order (head and tail) and a map from id to node. It owns the ordering rule.</li>\n<li><b>ProcessNode</b> holds the id, start time, end time (empty while running) and the next pointer.</li>\n<li><b>Sink</b> is the output interface with one method, <code>write(record)</code>. <code>MemorySink</code> stores records.</li>\n<li><b>FilterSink</b> and <b>FormatSink</b> implement the same interface and wrap another sink, so they can be stacked.</li>\n<li><b>Clock</b> is injected so tests control time.</li>\n</ul>\n<p>The logger has one tracker and many sinks. The tracker has many nodes, and each node is also indexed by the map.</p>",
      design:
        '<p>The core observation is that the answer to <code>log</code> is always a prefix of the start-ordered list: walk from the head while the node has ended and stop at the first node that is still running. Everything before that point started earlier than every running process. The tracker therefore keeps nodes in start order in a linked list and a map from id to node, so each operation is cheap:</p>\n<ul>\n<li><code>start</code> appends a node at the tail and adds it to the map: O(1).</li>\n<li><code>end</code> finds the node through the map and stamps its end time: O(1). It never touches the list order.</li>\n<li><code>release</code> pops nodes from the head while they have ended, deleting them from the map: each node is released once in its life, so the amortised cost is O(1) per process.</li>\n</ul>\n<p>A queue plus a map gives the same costs. The linked list just makes the invariant visible: the head is the oldest process not yet reported, and a finished process behind a running one waits. Say plainly that the returned list is proportional to its own size, so "constant time" means constant per process, not a fixed cost for the call.</p>\n<p>Extensibility is the part the round probes. The tracker only decides <em>what</em> to report. <em>Where</em> it goes belongs to sinks. <code>Logger.log</code> builds a record from each released node and calls <code>write</code> on every sink, which is the <b>Observer</b> pattern. <b>Decorator</b> adds behaviour without touching existing classes: <code>FilterSink</code> forwards only matching records and <code>FormatSink</code> turns a record into a line, and each wraps another sink behind the same interface so they stack. A new behaviour such as writing to a file, counting slow processes or batching is a new class passed to the constructor or <code>addSink</code>. The logger and tracker do not change. A sink that throws is recorded in <code>failures</code> and the other sinks and records are still written, because the processes have already been released and a thrown error must not lose them.</p>\n<p>Concurrency: start, end and release touch the tail, the map and the head, so guard them with one lock, and call sinks after the lock is released, so a slow sink never blocks <code>start</code>. A lock-free version is possible but rarely worth the risk.</p>\n<p>Trade-off: sinks run synchronously inside <code>log</code>, which is simple and ordered. A sink that does I/O should sit behind its own queue and thread, at the price of losing the guarantee that <code>log</code> has finished writing when it returns.</p>',
      extend: [
        "Several threads call start and end at the same time. Which operations need to be atomic, and can you avoid one global lock?",
        "A sink such as a file or a network call can fail or be slow. How do you stop it from blocking log or losing records?",
        "Add log levels or a per-process tag and let sinks subscribe only to some of them. Where does the filtering live?",
        "Some processes are cancelled and never end. How do you stop one stuck process from holding back every later one forever?",
        "Instead of returning a list, log must hand records to the caller one at a time. What changes in the tracker and the sinks?",
      ],
      slips:
        "<ul>\n<li>Scanning all processes on every <code>log</code> call, or sorting by start time each time. That is the O(n) answer the question rules out.</li>\n<li>Releasing every finished process instead of only those before the oldest running one. This is the misreading that gives the wrong output.</li>\n<li>Reporting a process twice, or leaving its map entry behind so the id can never be reused.</li>\n<li>Putting formatting, filtering and file output as <code>if</code> branches inside <code>log</code>. The follow-up then forces edits to the core class.</li>\n<li>Making the logger a singleton with static state, which hurts tests and the injected clock.</li>\n<li>Skipping error cases: ending an unknown id, ending twice, or starting a live id twice.</li>\n</ul>",
    },
    code: `class FakeClock {
  constructor(start = 0) {
    this.time = start;
  }
  now() {
    return this.time;
  }
  advance(ms) {
    this.time += ms;
  }
}

class ProcessNode {
  constructor(id, startedAt) {
    this.id = id;
    this.startedAt = startedAt;
    this.endedAt = null;
    this.next = null;
  }
}

class ProcessTracker {
  constructor() {
    this.byId = new Map();
    this.head = null;
    this.tail = null;
    this.running = 0;
  }
  start(id, at) {
    if (this.byId.has(id)) throw new Error("process already started: " + id);
    const node = new ProcessNode(id, at);
    this.byId.set(id, node);
    if (this.tail) this.tail.next = node;
    else this.head = node;
    this.tail = node;
    this.running += 1;
  }
  end(id, at) {
    const node = this.byId.get(id);
    if (!node) throw new Error("unknown process: " + id);
    if (node.endedAt !== null) throw new Error("process already ended: " + id);
    node.endedAt = at;
    this.running -= 1;
  }
  release() {
    const released = [];
    while (this.head && this.head.endedAt !== null) {
      released.push(this.head);
      this.byId.delete(this.head.id);
      this.head = this.head.next;
    }
    if (!this.head) this.tail = null;
    return released;
  }
}

class MemorySink {
  constructor() {
    this.records = [];
  }
  write(record) {
    this.records.push(record);
  }
}

class FilterSink {
  constructor(inner, accept) {
    this.inner = inner;
    this.accept = accept;
  }
  write(record) {
    if (this.accept(record)) this.inner.write(record);
  }
}

class FormatSink {
  constructor(inner, format) {
    this.inner = inner;
    this.format = format;
  }
  write(record) {
    this.inner.write(this.format(record));
  }
}

class Logger {
  constructor(clock, sinks = []) {
    this.clock = clock;
    this.sinks = sinks;
    this.failures = [];
    this.tracker = new ProcessTracker();
  }
  addSink(sink) {
    this.sinks.push(sink);
  }
  start(id) {
    this.tracker.start(id, this.clock.now());
  }
  end(id) {
    this.tracker.end(id, this.clock.now());
  }
  log() {
    const released = this.tracker.release();
    for (const node of released) {
      const record = { id: node.id, startedAt: node.startedAt, endedAt: node.endedAt };
      for (const sink of this.sinks) {
        try {
          sink.write(record);
        } catch (error) {
          this.failures.push({ id: node.id, error: error instanceof Error ? error.message : String(error) });
        }
      }
    }
    return released.map((node) => node.id);
  }
}`,
    checks: [
      {
        name: "reports nothing while the earliest started process is still running",
        expr: `(() => {
  const l = new Logger(new FakeClock());
  l.start("a");
  l.start("b");
  l.end("b");
  return l.log();
})()`,
        expected: [],
      },
      {
        name: "reports finished processes in start order once the earliest one ends",
        expr: `(() => {
  const l = new Logger(new FakeClock());
  l.start("a");
  l.start("b");
  l.end("b");
  const first = l.log();
  l.end("a");
  return [first, l.log()];
})()`,
        expected: [[], ["a", "b"]],
      },
      {
        name: "holds back a finished process that started after a running one",
        expr: `(() => {
  const l = new Logger(new FakeClock());
  for (const id of ["a", "b", "c"]) l.start(id);
  l.end("a");
  l.end("c");
  const first = l.log();
  const second = l.log();
  l.end("b");
  return [first, second, l.log()];
})()`,
        expected: [["a"], [], ["b", "c"]],
      },
      {
        name: "reports each process only once",
        expr: `(() => {
  const l = new Logger(new FakeClock());
  l.start("a");
  l.end("a");
  return [l.log(), l.log(), l.tracker.byId.size];
})()`,
        expected: [["a"], [], 0],
      },
      {
        name: "rejects a duplicate start, an unknown end and a second end",
        expr: `(() => {
  const l = new Logger(new FakeClock());
  l.start("a");
  l.end("a");
  const attempt = (fn) => {
    try {
      fn();
      return "ok";
    } catch (error) {
      return error.message;
    }
  };
  return [attempt(() => l.start("a")), attempt(() => l.end("zzz")), attempt(() => l.end("a"))];
})()`,
        expected: ["process already started: a", "unknown process: zzz", "process already ended: a"],
      },
      {
        name: "allows an id to be reused after its record has been logged",
        expr: `(() => {
  const l = new Logger(new FakeClock());
  l.start("a");
  l.end("a");
  l.log();
  l.start("a");
  return [l.tracker.running, l.log()];
})()`,
        expected: [1, []],
      },
      {
        name: "writes a record with start and end times to every sink",
        expr: `(() => {
  const clock = new FakeClock();
  const memory = new MemorySink();
  const l = new Logger(clock, [memory]);
  l.start("a");
  clock.advance(7);
  l.end("a");
  l.log();
  return memory.records;
})()`,
        expected: [{ id: "a", startedAt: 0, endedAt: 7 }],
      },
      {
        name: "keeps writing to the other sinks and records the failure when one sink throws",
        expr: `(() => {
  const good = new MemorySink();
  const broken = {
    write() {
      throw new Error("disk full");
    },
  };
  const l = new Logger(new FakeClock(), [broken, good]);
  l.start("a");
  l.start("b");
  l.end("a");
  l.end("b");
  const ids = l.log();
  return [ids, good.records.map((r) => r.id), l.failures, l.tracker.byId.size];
})()`,
        expected: [
          ["a", "b"],
          ["a", "b"],
          [
            { id: "a", error: "disk full" },
            { id: "b", error: "disk full" },
          ],
          0,
        ],
      },
      {
        name: "starts a new process while older ones are still running and releases it after them",
        expr: `(() => {
  const l = new Logger(new FakeClock());
  l.start("a");
  l.start("b");
  l.end("a");
  const first = l.log();
  l.start("c");
  l.end("c");
  const second = l.log();
  l.end("b");
  return [first, second, l.log(), l.tracker.running];
})()`,
        expected: [["a"], [], ["b", "c"], 0],
      },
      {
        name: "adds a filtering sink without changing the logger",
        expr: `(() => {
  const clock = new FakeClock();
  const everything = new MemorySink();
  const slow = new MemorySink();
  const l = new Logger(clock, [everything]);
  l.addSink(new FilterSink(slow, (r) => r.endedAt - r.startedAt >= 5));
  l.start("fast");
  l.start("slow");
  clock.advance(2);
  l.end("fast");
  clock.advance(8);
  l.end("slow");
  l.log();
  return [everything.records.length, slow.records.map((r) => r.id)];
})()`,
        expected: [2, ["slow"]],
      },
      {
        name: "stacks a formatting sink on top of another sink",
        expr: `(() => {
  const clock = new FakeClock();
  const lines = new MemorySink();
  const l = new Logger(clock, [new FormatSink(lines, (r) => r.id + " took " + (r.endedAt - r.startedAt))]);
  l.start("job");
  clock.advance(4);
  l.end("job");
  l.log();
  return lines.records;
})()`,
        expected: ["job took 4"],
      },
    ],
  },
];
