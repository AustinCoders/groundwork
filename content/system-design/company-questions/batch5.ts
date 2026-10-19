import type { CompanyQuestion } from "./types";

export const questions: CompanyQuestion[] = [
  {
    id: "google-url-shortener",
    company: "google",
    title: "Design a URL shortener",
    prompt:
      "Design a service that turns long URLs into short links and redirects visitors to the original. Assume 10 million new links a day, about 100 redirects for every link created, links that live for years, and a redirect that should feel instant for users around the world.",
    level: "SDE-2",
    kind: "hld",
    evidence: "one",
    sources: [
      {
        label: "GeeksforGeeks: Google software engineer (SDE-2) interview experience, 2025",
        url: "https://www.geeksforgeeks.org/interview-experiences/google-interview-experience-for-software-engineer-sde-2-2025/",
        kind: "candidate-report",
        year: 2025,
      },
    ],
    chapters: ["sysdes-walkthrough-simple", "sysdes-caching-fundamentals", "sysdes-time-ordering-ids"],
    answer: {
      ask: `<p>
  Before drawing anything I would ask: how many links are created a day, and what is the
  read-to-write ratio? Do links expire, and can the owner disable or edit one? Do we need
  click analytics, and how fresh must the counts be? Can users pick a custom alias? Must
  keys be unguessable? What is the redirect latency target, and is the audience global?
  How fast must a reported phishing link stop working?
</p>
<p>
  Assumed scope: create a link (optional alias and expiry), redirect, disable a link,
  approximate click counts. Out of scope: link previews, user dashboards, billing, and a
  full abuse-detection pipeline (I would only show the hook where it plugs in).
</p>`,
      numbers: `<p>
  These are planning figures for the exercise, not facts about any real service.
</p>
<ul>
  <li><b>Creates:</b> 10,000,000 / 86,400 = about 116 a second; at a 3x peak, about 350 a second.</li>
  <li><b>Redirects:</b> 100 x 10 million = 1 billion a day. 1,000,000,000 / 86,400 = about 11,600 a second; at 3x, about 35,000 a second.</li>
  <li><b>Rows:</b> 10 million x 365 x 5 years = 18.25 billion. At about 500 bytes a row including indexes, that is 9.1 TB, or about 27 TB with three replicas. Storage is not the hard part.</li>
  <li><b>Keyspace:</b> 62^6 is about 56.8 billion, so six base62 characters leave 18.25 / 56.8 = 32% used. Seven characters give 3.52 trillion and 0.52% used.</li>
  <li><b>Cache:</b> ten days of creates is 100 million entries x 200 bytes = 20 GB.</li>
  <li><b>Click events:</b> one per redirect, so 11,600 a second on average. That is more than twice the 5,000 committed writes a second one primary handles.</li>
</ul>
<p>
  What the numbers force: the 35,000 a second peak is well past the roughly 20,000 reads a
  second of one primary, so a cache is mandatory. At a 95% hit rate the store sees
  35,000 x 0.05 = 1,750 a second at peak. Creates at 350 a second fit on one primary
  easily, so the mapping table does not need sharding yet. The click events do not
  fit on it at all, so a click counter must never be a row update.
</p>`,
      design: `<ol>
  <li><b>Create service (stateless).</b> Validates the URL (http or https only, length cap, not pointing back at our own domain), takes an <code>Idempotency-Key</code> header so a client retry after a timeout does not mint two keys, calls an abuse-check hook, then asks the key allocator for a key.</li>
  <li><b>Key allocation.</b> A tiny counter service hands each create instance a block of 1,000 ids (one atomic <code>UPDATE ... RETURNING</code> on a single row, or a coordination service). At 350 creates a second that is one block grant every three seconds or so. The instance passes each id through a keyed bijection over the 56.8 billion space, then base62-encodes it to six characters. A counter gives zero collisions by construction, and the scramble stops people walking the keyspace. It is obfuscation, not secrecy: a truly private target needs authentication. A crashed instance wastes at most one block, which is nothing against 56.8 billion.</li>
  <li><b>Custom aliases.</b> A conditional insert on the primary key. A conflict returns 409 and the caller picks another. Keep alias keys in a different length class so they can never collide with generated ones.</li>
  <li><b>Mapping store.</b> One table, <code>links(short_key PK, long_url, owner_id, created_at, expires_at, state)</code>. Reads are always by key, so the key is the only index that matters. Start with one primary and two replicas in different AZs. If you outgrow it, partition by hash of the key: every redirect knows its partition from the URL alone. The destination is immutable; only <code>state</code> changes.</li>
  <li><b>Read path.</b> Load balancer to redirect service, which checks an in-process cache (1 to 5 second TTL), then a shared cache (TTL with jitter), then the store. Cache unknown keys for 30 to 60 seconds so random-key scans do not reach the database. Answer with a 302 and <code>Cache-Control: no-store</code> by default, because analytics and takedown both need to see every click.</li>
  <li><b>Click path.</b> The redirect handler appends an event (key, time, coarse country, referrer class) to an in-process buffer that flushes to a durable log. An aggregator consumes the log and writes per-key, per-minute counts to a counts store. Losing a few seconds of events in a crash is acceptable for a click counter.</li>
  <li><b>Takedown.</b> Set <code>state = disabled</code> on the primary, delete the shared-cache entry, and broadcast an invalidation to the in-process caches. The worst case is the in-process TTL, a few seconds. If an edge cache is used, purge by tag as well.</li>
  <li><b>Expiry.</b> The redirect path checks <code>expires_at</code> on every read, so a late sweeper can never serve an expired link. The sweeper itself deletes in small batches by index, never one huge delete. Do not recycle expired keys quickly, because old links are still pasted in documents.</li>
</ol>
<p>
  <b>Hard problem one: unique, unguessable keys without a coordination call per write.</b>
  Block allocation moves coordination from every create to every thousandth create. The
  alternative is seven random characters with a conditional insert and a retry: the chance
  a fresh random key is already taken reaches 0.52% by year five, so retries are rare but
  the write path needs a loop.
</p>
<p>
  <b>Hard problem two: read-your-write after create.</b> The creator often opens the link
  within a second. Populate the shared cache after the commit (write-through), and on a
  miss that finds nothing on a replica, fall back once to the primary under a rate cap, so
  replica lag rarely turns into a false 404 and a scan of random keys cannot become a read
  storm on the primary.
</p>`,
      tradeoffs: `<ul>
  <li><b>Counter blocks vs random keys.</b> Counter blocks give zero collisions and a single unconditional insert, at the cost of a small allocator to run. Random seven-character keys need no allocator but add a retry loop. Pick blocks. Flip to random keys if you must create links in several regions with no shared allocator, or give each region a disjoint id range.</li>
  <li><b>302 with no-store vs a cacheable 301.</b> The 302 costs one request per click and gives exact analytics and a takedown measured in seconds. A 301 saves load but can sit in browsers for a long time. Pick the 302. Flip to a 301 with a short private max-age only if analytics is not required and traffic cost dominates.</li>
  <li><b>Relational primary vs partitioned key-value store.</b> At 350 creates a second and 9 TB, one primary with replicas is simpler and has real transactions. Pick it. Flip to a partitioned store with native TTL when storage no longer fits one volume, writes pass about 5,000 a second, or you need active-active writes in several regions.</li>
  <li><b>Exact vs approximate counts.</b> A log plus aggregator gives counts within seconds and keeps writes off the redirect path. Pick it. Flip to exact, transactional counting only when clicks are billed, and then count in the log with de-duplication by event id.</li>
</ul>`,
      followups: [
        "One short link suddenly gets 50,000 requests a second. What breaks first, and what do you add?",
        "A link is reported as phishing. Walk through every cache and timer between the report and the first blocked click.",
        "Should shortening the same long URL twice return the same key? What does each answer cost?",
        "How would you support a customer's own domain for short links?",
        "How does the design change if redirects must be fast on every continent and survive the loss of a region?",
      ],
      slips: `<ul>
  <li>Incrementing a <code>clicks</code> column on every redirect. That turns a read-heavy system into one with 11,600 writes a second on a table built for 350.</li>
  <li>Truncating a hash of the URL to seven characters and never handling the collision.</li>
  <li>Using plain sequential ids, so anyone can enumerate every link, and the total count leaks too.</li>
  <li>Choosing a 301 by default without noticing it kills analytics and makes takedown slow.</li>
  <li>Adding a cache with no invalidation story, then being unable to say how a bad link is removed.</li>
  <li>Reaching for a sharded wide-column store and a stream processor in the first five minutes for a mapping that fits one primary.</li>
  <li>Skipping the expiry check on read and trusting the sweeper to be on time.</li>
</ul>`,
    },
  },
  {
    id: "google-job-alerts",
    company: "google",
    title: "Design the job-alert feature of a careers site",
    prompt:
      "A careers site lets people save a search (keywords, location, level, remote or not) and get an email when a matching job is posted. Design the alert feature for about 5 million saved alerts and tens of thousands of new or changed jobs a day, with no duplicate emails and a one-click unsubscribe.",
    level: "L5",
    kind: "hld",
    evidence: "one",
    sources: [
      {
        label: "Blind: a candidate's long journey to Google L5",
        url: "https://www.teamblind.com/post/my-long-journey-to-google-l5-2c2fzrva",
        kind: "candidate-report",
        year: 2023,
      },
    ],
    chapters: [
      "sysdes-walkthrough-notifications",
      "sysdes-search-systems",
      "sysdes-message-queues-async",
      "sysdes-batch-stream-processing",
    ],
    answer: {
      ask: `<p>
  Questions I would ask: is an alert a saved search (keywords, location, level, remote) or
  a subscription to a category? How fast must a match arrive: within minutes, or in a daily
  digest? Email only, or push too? Does an edit to an existing job count as new? How many
  alerts can one person hold? Do jobs close, and should a closed job still be sent? What
  consent do we need: double opt-in, one-click unsubscribe?
</p>
<p>
  Assumed scope: create, edit, pause and delete alerts; match new and materially changed
  jobs; send an immediate email or a daily digest; unsubscribe. Out of scope: search
  ranking on the site, applications, recruiter tools, and running a mail server.
</p>`,
      numbers: `<p>
  Planning figures for the exercise, not facts about any real careers site.
</p>
<ul>
  <li><b>Alerts:</b> 5 million active alerts held by about 3.3 million people (1.5 each).</li>
  <li><b>Jobs:</b> 50,000 posted or materially changed a day. 50,000 / 86,400 = about 0.6 a second. A recruiter bulk import of 5,000 jobs in 10 minutes is 8 a second.</li>
  <li><b>Matches:</b> assume the average job matches 200 alerts. 50,000 x 200 = 10 million match rows a day, about 116 a second, or 350 a second at 3x. The bulk import makes 5,000 x 200 = 1,000,000 matches in 600 seconds, about 1,670 a second.</li>
  <li><b>Alert index:</b> 5 million x 300 bytes = 1.5 GB. It fits in memory on one machine.</li>
  <li><b>Match table:</b> 10 million rows x 50 bytes = 500 MB a day; 30 days is 15 GB.</li>
  <li><b>Emails:</b> after digesting, say 1 million a day, about 12 a second. If all digests go out in a two-hour window, 1,000,000 / 7,200 = about 139 a second.</li>
  <li><b>The polling alternative:</b> run every alert once a day as a search query. 5,000,000 / 86,400 = 58 a second on average, but 5,000,000 / 3,600 = 1,389 a second if they all run in one morning hour, competing with interactive search, and nearly all return nothing.</li>
</ul>
<p>
  What the numbers force: nothing here needs sharding; the peak of 1,670 match writes a
  second is under the 5,000 a second one primary handles. The ratio that matters is
  5 million alerts to 50,000 jobs, 100 to 1. Do the matching per job, not per alert.
</p>`,
      design: `<ol>
  <li><b>Alert service.</b> CRUD on <code>alerts(alert_id, user_id, query_json, frequency, state, created_at, last_sent_at, unsubscribe_token)</code>, one relational primary with replicas. Normalize the query into structured filters (country, city, level, remote, team) plus keyword terms. New alerts start as <code>pending</code> until the email address is confirmed (double opt-in); only confirmed alerts match.</li>
  <li><b>Job events.</b> The jobs system publishes <code>job_created</code>, <code>job_changed</code> and <code>job_closed</code> to a durable log, partitioned by job id. The event carries the full job document, so the matcher never races the search index.</li>
  <li><b>Matcher (reverse search).</b> Hold the alerts in an inverted index in memory, keyed by facet and keyword, so a job looks up candidate alerts by its location, level and terms and then verifies the full predicate on each candidate. A percolator-style reverse index in a search engine does the same job; the 1.5 GB size means either is easy to host. Rebuild from the alert table at start and apply alert changes from a change feed.</li>
  <li><b>Match writes.</b> For each match insert <code>matches(alert_id, job_id, version_class, matched_at, state)</code> with a <b>unique key on (alert_id, job_id, version_class)</b>. A replayed event or a second matcher instance inserts nothing new. That unique key is the dedupe for replays.</li>
  <li><b>What counts as changed.</b> Only a material change (title, location, level, reopening) bumps the job's <code>version_class</code>, which allows one new match row and so one more notification per alert. A typo fix in the description changes nothing and re-matches nothing.</li>
  <li><b>Scheduler.</b> A periodic job selects <code>pending</code> matches per user. Immediate alerts send after a short batching delay (say 2 minutes) so one bulk import becomes one email. Daily digests run at the user's local morning, spread across time zones, which also smooths the 139 a second peak.</li>
  <li><b>Send step.</b> Group by user, not by alert: one email with a section per alert. Re-read job state just before sending and drop closed jobs. Cap each alert at, say, 25 jobs per email with a "see all" link. Hand the message to the notification pipeline (preferences, rate limit, provider adapter) with an idempotency key of <code>user_id + send_window</code>.</li>
  <li><b>Unsubscribe.</b> Every email carries a one-click link and the standard list-unsubscribe headers, using a signed token that carries the alert id; it works without logging in. Suppression is written first, so a pending send checks it again.</li>
  <li><b>Safety net.</b> A nightly reconciliation job searches the job index for postings newer than a watermark and checks they all have match rows for the alerts that should match. This catches matcher outages and event loss; it can use the slow polling approach because it runs once.</li>
</ol>
<p>
  <b>Hard problem one: broad alerts.</b> An alert such as "engineer, anywhere" matches almost everything and would send hundreds of jobs a day. Rate-limit per alert (the per-email cap above, plus a daily ceiling) and suggest narrowing in the email.
</p>
<p>
  <b>Hard problem two: duplicates under at-least-once delivery.</b> The log may deliver an event twice and a send may time out after the provider accepted it. The unique match key stops duplicate matches (one per alert, job and version class); the send idempotency key plus a <code>sent_at</code> mark stops duplicate emails in nearly all cases, and the rare remainder is accepted and counted.
</p>`,
      tradeoffs: `<ul>
  <li><b>Match per job (reverse search) vs run every alert on a schedule.</b> Reverse matching is event-driven, costs about 0.6 job lookups a second and delivers within minutes, but needs an alert index you maintain. Scheduled polling is simpler and reuses the search engine, but it runs 5 million queries that nearly all return nothing. Pick reverse matching. Flip to polling when alerts are few (tens of thousands) or the query language is too rich to invert.</li>
  <li><b>Immediate emails vs daily digest.</b> Immediate wins on freshness for competitive roles; a digest wins on inbox fatigue and send cost. Pick a 2-minute batching window for immediate and a digest as the default for broad alerts. Flip to digest-only if complaint rates climb toward the provider's thresholds.</li>
  <li><b>Store matches vs recompute at send time.</b> Stored match rows give dedupe, audit and "why did I get this" answers for 15 GB a month. Recomputing is cheaper in storage but cannot prevent a repeat after the job index changes. Pick stored rows with a 30-day expiry. Flip to recompute only if match volume grows so much that storage becomes a real cost.</li>
  <li><b>Single matcher vs partitioned matchers.</b> One in-memory matcher plus a warm standby is enough at 1.5 GB. Pick it. Flip to partitioning the alert index by facet when it passes the memory of one machine or the match rate passes a few thousand jobs a second.</li>
</ul>`,
      followups: [
        "A recruiter imports 5,000 jobs in ten minutes. What happens to the matcher, the match table and the mail provider?",
        "How do you make sure someone who clicked unsubscribe never gets another email, even with mail already queued?",
        "How would you add push notifications or a weekly summary without rewriting the matcher?",
        "A job is reposted with a new id after it expired. How do you avoid sending the same role twice?",
        "How do you know the alerts are working, and what would you alert on?",
      ],
      slips: `<ul>
  <li>Running every saved search against the job index on a timer and not noticing that 5 million queries return almost nothing.</li>
  <li>Having no dedupe key, so a replayed event or a retried send emails the same job twice.</li>
  <li>Treating every edit as a new job, so a typo fix re-notifies thousands of people.</li>
  <li>Sending one email per alert instead of one per person, which multiplies complaints.</li>
  <li>Ignoring unsubscribe until the end, or checking it only when the alert is created and not at send time.</li>
  <li>Sending a closed job because the state was read once at match time.</li>
  <li>Sharding the database for a workload that peaks near 1,700 writes a second.</li>
</ul>`,
    },
  },
  {
    id: "netflix-ml-job-scheduler",
    company: "netflix",
    title: "Design a scheduler for ML training and batch jobs on a shared cluster",
    prompt:
      "Design a scheduler that runs ML training jobs and batch data jobs on one shared cluster of a few thousand GPU and CPU machines. Teams have quotas, some jobs need many GPUs at once, urgent jobs must be able to jump the queue, and machines fail every day.",
    level: "level not stated (Data Platform loop)",
    kind: "hld",
    evidence: "one",
    sources: [
      {
        label: "PracHub: Netflix software engineer, Data Platform loop",
        url: "https://prachub.com/interview-experiences/netflix-software-engineer-interview-experience-data-platform-loop-rejected-after-the-final-system-design-round",
        kind: "candidate-report",
        year: 2026,
      },
    ],
    chapters: [
      "sysdes-distributed-consensus",
      "sysdes-fault-tolerance",
      "sysdes-observability-scale",
      "sysdes-message-queues-async",
    ],
    answer: {
      ask: `<p>
  Questions first: how big is the cluster and how many job submissions a day? What is the
  mix of long training runs and short batch jobs? Do jobs need several machines at the same
  time (gang scheduling)? Are there per-team quotas, and may idle quota be borrowed? Can a
  running job be preempted, and do jobs checkpoint? Are there job dependencies, or is that
  a separate workflow layer? What queue-wait target matters?
</p>
<p>
  Assumed scope: submit, queue, place, run, retry and cancel jobs; fair share with
  priorities; gang placement; preemption; failure recovery. Out of scope: the workflow
  or DAG engine, the training framework, and data storage.
</p>`,
      numbers: `<p>
  Planning figures for the exercise, not facts about any real cluster.
</p>
<ul>
  <li><b>Fleet:</b> 500 GPU machines x 8 GPUs = 4,000 GPUs, plus 2,000 CPU machines: 2,500 machines.</li>
  <li><b>Submissions:</b> 20,000 jobs a day / 86,400 = 0.23 a second; at a 5x peak, about 1.2 a second. At 20 tasks a job that is 400,000 tasks a day, about 4.6 a second.</li>
  <li><b>State changes:</b> about 5 persisted transitions per task (queued, placed, running, finished, plus a retry now and then) = 2 million a day, about 23 a second. Heartbeats are not persisted one by one.</li>
  <li><b>Heartbeats:</b> 2,500 machines every 5 seconds = 500 a second, held in the scheduler's memory.</li>
  <li><b>Capacity:</b> 4,000 GPUs x 24 hours = 96,000 GPU-hours a day. If demand is 60,000 GPU-hours, average utilization is 62.5%, so queues build at peaks and in fragmented moments, not all day.</li>
  <li><b>Placement work:</b> a naive pass of 5,000 pending tasks against 2,500 machines is 12.5 million checks, a second or less on one core, and filtering by resource class makes it smaller.</li>
</ul>
<p>
  What the numbers force: this is not a throughput problem. 23 durable writes a second sit
  far below the 5,000 a second one primary can commit, and one active scheduler can do the
  placement. The hard parts are correctness (never run a task twice by mistake), fairness,
  and recovering from failure.
</p>`,
      design: `<ol>
  <li><b>API and job store.</b> Submit takes a job spec (resources, priority class, team, image, retry policy, checkpoint flag) and a client-supplied job id, which makes a repeated submit harmless. Jobs and tasks live in a strongly consistent store: a small replicated cluster using a consensus protocol (three or five nodes), or a relational primary with a standby. Each task has a state machine: <code>PENDING, ASSIGNED, RUNNING, SUCCEEDED, FAILED, PREEMPTED, CANCELLED</code>, and every transition is a conditional update on the previous state.</li>
  <li><b>Active scheduler.</b> One leader is elected through a lease held in the consensus store, and each leadership term carries an <b>epoch number</b>. The leader keeps the cluster picture in memory (machine capacity, running tasks, last heartbeat) and rebuilds it from the store and agent reports after a failover. A warm standby makes failover a matter of seconds.</li>
  <li><b>Queueing and fairness.</b> One queue per team within a priority class. Each team has a guaranteed share and may borrow idle capacity from others; borrowed capacity can be reclaimed. Order pending work by priority class, then by how far a team is below its share, then by age so nothing starves. For jobs using several resource types, compare shares by the dominant resource.</li>
  <li><b>Placement.</b> Filter machines by resource class, label and locality, then pick by a score (best fit to limit fragmentation, spread across racks for fault tolerance). <b>Gang jobs</b> are all or nothing: reserve the full set of machines before starting any task. While a big gang waits, <b>backfill</b> smaller, shorter jobs into the gaps if they cannot delay the reservation.</li>
  <li><b>Preemption.</b> A high-priority task that cannot fit may evict lower-priority tasks. Choose victims that checkpoint, send a grace signal, wait a configured period, then kill. Preempted tasks go back to the queue and do not use up their retry budget.</li>
  <li><b>Node agents.</b> Each machine runs an agent that heartbeats every 5 seconds, starts containers, and reports status. Assignments carry the scheduler epoch and a task attempt number; an agent rejects an assignment from an older epoch.</li>
  <li><b>Failure detection.</b> A machine is suspect after three missed heartbeats (15 seconds) and its tasks are rescheduled only after the agent's lease has certainly expired. An agent that cannot renew its lease kills its own tasks first. That ordering stops a partitioned machine from running a zombie copy while the replacement runs too.</li>
  <li><b>Retries.</b> Classify failures: infrastructure (machine lost, preempted) retries freely with a cap; application errors (non-zero exit) count against the user's retry budget with backoff. Retries happen only in the scheduler, never also in the client and the agent, to avoid multiplied attempts.</li>
  <li><b>Observability.</b> Queue wait by team and priority, utilization per resource class, fragmentation (free GPUs that are not in a usable block), preemption count, scheduler loop time, and job outcome by failure class. Per-team cost reports come from the same data.</li>
</ol>
<p>
  <b>Hard problem one: a single writer that really is single.</b> Leader lease plus epoch
  fencing means a deposed scheduler that wakes up late can issue commands, but agents and the
  store reject them.
</p>
<p>
  <b>Hard problem two: gangs without deadlock or starvation.</b> Reservation with backfill
  and a bounded wait: if a gang has waited past a threshold, the scheduler stops placing
  small jobs on machines it needs.
</p>`,
      tradeoffs: `<ul>
  <li><b>Centralized scheduler vs distributed (sharded) schedulers.</b> One scheduler has a global view, which makes gang placement and fair share straightforward, and the numbers say it is fast enough. Pick it. Flip to sharded schedulers with optimistic placement when the cluster is tens of thousands of machines or the loop time no longer fits the latency target.</li>
  <li><b>Preemption vs waiting.</b> Preemption keeps urgent work fast and utilization high but wastes progress when jobs do not checkpoint. Waiting is predictable but leaves urgent jobs stuck. Pick preemption for checkpointing jobs only, with a grace period. Flip to waiting with reserved capacity if most jobs cannot checkpoint.</li>
  <li><b>Strict quotas vs borrowing.</b> Strict quotas are simple and predictable but leave GPUs idle. Borrowing lifts utilization but needs reclaim logic. Pick borrowing with reclaim. Flip to strict quotas for teams that need guaranteed capacity for a launch.</li>
  <li><b>Consensus store vs a plain relational primary.</b> A consensus cluster survives a node loss with no failover step; a primary with a standby is easier to operate. At 23 writes a second either works. Pick the one your team already runs well, and keep the state machine and epoch rules the same.</li>
</ul>`,
      followups: [
        "The scheduler leader is partitioned from the store for 40 seconds and then comes back. What stops it from doing damage?",
        "A 64-GPU job has waited two days while small jobs keep taking free machines. What do you change?",
        "How do you decide how many retries a failing training job gets, and who pays for the wasted GPU time?",
        "How would you add priorities for time-critical jobs without letting one team starve the rest?",
        "What would make you split this into several schedulers?",
      ],
      slips: `<ul>
  <li>Designing for huge throughput. The submission rate is about one a second, and the real difficulty is correctness and fairness.</li>
  <li>Persisting every heartbeat to the database.</li>
  <li>Having one scheduler with no answer for what happens when it is wrong about being the leader.</li>
  <li>Forgetting gang scheduling, or doing it as "place tasks as machines free up", which deadlocks two big jobs that each hold half of what they need.</li>
  <li>Rescheduling a task the moment heartbeats stop, so a slow network produces two copies of a training run.</li>
  <li>Treating every failure alike, so infrastructure faults burn the user's retry budget.</li>
  <li>Ignoring fragmentation: 100 free GPUs scattered across machines cannot run an 8-GPU-per-machine job.</li>
</ul>`,
    },
  },
  {
    id: "razorpay-job-scheduler",
    company: "razorpay",
    title: "Design a distributed job scheduler",
    prompt:
      "Design a service where other teams register jobs to run at a given time or on a recurring schedule, and it calls them back reliably. Assume about 100 million registered jobs, 10 million executions a day, and bursts at round times such as midnight.",
    level: "SDE-2 and above",
    kind: "hld",
    evidence: "guide",
    sources: [
      {
        label: "TechPrep: Razorpay interview process",
        url: "https://www.techprep.app/blog/razorpay-interview-process",
        kind: "prep-guide",
        year: 2026,
      },
      {
        label: "Space Complexity: Razorpay onsite interview",
        url: "https://spacecomplexity.ai/blog/razorpay-onsite-interview",
        kind: "prep-guide",
        year: 2026,
      },
    ],
    chapters: [
      "sysdes-distributed-consensus",
      "sysdes-message-queues-async",
      "sysdes-time-ordering-ids",
      "sysdes-fault-tolerance",
    ],
    answer: {
      ask: `<p>
  Questions: one-off jobs, recurring jobs, or both? How precise must the start time be
  (within a second, or within a minute)? What does a job do: call an HTTP endpoint, or
  run code? How long do jobs run? What if the system is down at the scheduled moment: run
  late, skip, or catch up every missed run? Must a job never run twice? Do owners need
  to cancel, pause and see history? Are there time zones in the schedules?
</p>
<p>
  Assumed scope: register, update and cancel jobs; fire them on time by calling a webhook
  or putting a message on a queue; retries; run history. Out of scope: executing arbitrary
  user code, dependencies between jobs, and a UI.
</p>`,
      numbers: `<p>
  Planning figures for the exercise, not facts about any real scheduler.
</p>
<ul>
  <li><b>Registry:</b> 100 million jobs x 300 bytes = 30 GB. A single volume holds it.</li>
  <li><b>Average load:</b> 10,000,000 / 86,400 = about 116 executions a second. At three row writes each (claim, outbox insert, complete), about 350 writes a second. Trivial.</li>
  <li><b>The burst is the number:</b> suppose 1 million jobs are due at midnight and each must start within 60 seconds. 1,000,000 / 60 = about 16,700 starts a second, and 50,000 row writes a second with claim, outbox and complete.</li>
  <li><b>Primary limit:</b> a single primary commits about 5,000 writes a second. 3,000,000 writes / 5,000 = 600 seconds, ten minutes late. For the 60-second target you need at least 50,000 / 5,000 = 10 partitions of writes. Use 16 for headroom: 16 x 5,000 = 80,000 writes a second, and 3,000,000 / 80,000 = about 38 seconds to drain.</li>
  <li><b>Workers:</b> at 16,700 starts a second and an assumed 200 ms per callback, in-flight calls = 16,700 x 0.2 = about 3,300. Spread over 20 worker processes, that is about 170 concurrent calls each.</li>
</ul>
<p>
  What the numbers force: the average says one machine, the burst says partition the
  schedule table and put a queue between "due" and "running". Round-time spikes are also
  worth smoothing by letting owners tolerate a small random delay.
</p>`,
      design: `<ol>
  <li><b>API and registry.</b> <code>POST /jobs</code> takes a target (webhook URL or queue topic), a payload, either <code>run_at</code> or a cron expression with a time zone id, a retry policy, and a client <code>Idempotency-Key</code>. Rows live in <code>jobs(job_id, shard, owner, schedule, next_run_at, state, lease_token, leased_until, attempt)</code>.</li>
  <li><b>Sharding.</b> <code>shard = hash(job_id) mod 16</code>, each shard its own relational primary with replicas. The index that matters is <code>(state, next_run_at)</code> on each shard, so "what is due" is a short range scan, not a table scan. Keep the shard count a multiple so you can split later by moving whole logical shards.</li>
  <li><b>Pollers.</b> Several pollers per shard run a short loop: select up to 500 rows with <code>state = 'scheduled' AND next_run_at &lt;= now()</code>, ordered by <code>next_run_at</code>, using a row-locking read that skips rows other pollers hold (<code>FOR UPDATE SKIP LOCKED</code> in Postgres). In the same transaction set <code>state = 'claimed'</code>, <code>leased_until = now + 60 s</code>, and a new <code>lease_token</code>, and write the due runs to an outbox. Because claims skip locked rows, no leader is needed for correctness, and more pollers add throughput.</li>
  <li><b>Dispatch queue.</b> A relay moves claimed runs to a partitioned queue (one partition set per shard). Workers pull from it, call the target with the header <code>Idempotency-Key: job_id:scheduled_time</code>, and heartbeat to extend the lease every 20 seconds while the call is in flight.</li>
  <li><b>Completion.</b> On success the worker runs <code>UPDATE ... WHERE job_id = ? AND lease_token = ?</code> to mark the run done. For a recurring job the same transaction computes the next <code>next_run_at</code> from the <em>scheduled</em> time, not from now, so jitter never accumulates as drift.</li>
  <li><b>Failure.</b> If a worker dies, the lease expires and a janitor poller finds rows with <code>state = 'claimed' AND leased_until &lt; now()</code> and re-queues them with an incremented attempt. A late completion from the old worker fails the token check. Retries use exponential backoff with jitter, a cap on attempts, and a dead-letter state the owner can inspect and replay.</li>
  <li><b>Time zones.</b> Store the schedule as expression plus zone id and compute the next instant in UTC with a maintained time zone library. A daylight-saving gap or repeat needs an explicit rule: skip, run once, or run at the first valid instant.</li>
  <li><b>Missed runs.</b> Per job policy: run once on recovery (the default), run every missed occurrence, or skip. Choose per job because billing wants "run once" and a report might want "skip".</li>
</ol>
<p>
  <b>Hard problem one: exactly once is not available.</b> The system gives <em>at-least-once start</em>
  and relies on the target to de-duplicate with the idempotency key. What it can promise is that
  state transitions are fenced by the lease token, and that a run is started twice only when a lease
  expires before completion is recorded: the first attempt was slow, or the worker died after the
  target had already succeeded.
  Say this plainly; it is what the interviewer is waiting for.
</p>
<p>
  <b>Hard problem two: the burst.</b> Partitioned claims, batch claiming and an outbox
  remove the single hot table. Because the burst is a thundering herd on the targets as well, add
  a per-target rate limit and a concurrency cap in the workers, and retry in only one layer so
  three attempts in each of three layers does not become 27 calls.
</p>`,
      tradeoffs: `<ul>
  <li><b>Database polling vs a delay queue or timer wheel in memory.</b> Polling an indexed table is durable, easy to inspect and survives restarts, but adds up to the poll interval in lateness. In-memory timers are precise but lose state on a crash unless rebuilt from storage. Pick polling every one to two seconds. Flip to a hybrid (poll the next minute into memory timers) when second-level precision is required.</li>
  <li><b>Leaderless claiming vs a single leader per shard.</b> Row-level claims need no election and scale by adding pollers, but contend on hot index ranges. A leader per shard avoids contention but needs election and a fencing story. Pick claims. Flip to a leader only when claim contention measurably limits throughput.</li>
  <li><b>At-least-once with idempotent targets vs trying for exactly once.</b> At-least-once is achievable and honest. Exactly once only holds inside one transactional boundary. Pick at-least-once, and make the idempotency key part of the contract. Flip to a transactional outbox into the target's own database for targets that cannot de-duplicate.</li>
  <li><b>Relational shards vs a distributed key-value store.</b> Relational shards give transactions for the claim-and-enqueue step and simple range scans. A key-value store scales further with less operations effort per shard but makes the due-time range scan and conditional updates harder. Pick relational at this size. Flip when the registry passes what 16 primaries can hold.</li>
</ul>`,
      followups: [
        "A worker calls the target, the target succeeds, and the worker crashes before recording completion. What happens next?",
        "Ten million jobs are due at exactly the same minute because of a bad import. How do you protect the targets?",
        "How do you handle a daily 02:30 job in a time zone that skips that hour?",
        "How would you let an owner cancel a job that is already claimed?",
        "How do you tell that the scheduler itself is running late, and what do you page on?",
      ],
      slips: `<ul>
  <li>Sizing from the average (116 a second) and never looking at the round-time burst.</li>
  <li>One cron-like process on one machine, with no answer for its failure, or two copies that both fire.</li>
  <li>Scanning the whole jobs table for due work instead of using an index on the next run time.</li>
  <li>Promising exactly-once execution without saying what the target must do.</li>
  <li>Computing the next run from the time the last run finished, so schedules drift.</li>
  <li>Using local time without a zone id, then being surprised by daylight-saving changes.</li>
  <li>Letting a stale worker mark a job complete because there is no lease token or fencing check.</li>
  <li>Retrying at the poller, the queue and the worker all at once.</li>
</ul>`,
    },
  },
  {
    id: "apple-github-clone",
    company: "apple",
    title: "Design a GitHub-like code hosting service (load balancing and observability)",
    prompt:
      "Design a code hosting service that supports git clone, fetch and push over HTTPS and SSH, plus a web interface and an API. Focus on how traffic is spread across servers and how you would know the service is healthy, for roughly 10 million users and 10 million repositories.",
    level: "Senior (ICT3 offer, SRE loop)",
    kind: "hld",
    evidence: "one",
    sources: [
      {
        label: "Blind: Apple SRE interview experience (offer)",
        url: "https://www.teamblind.com/post/apple-sre-interview-experience-offer-uwt0l2vp",
        kind: "candidate-report",
        year: 2024,
      },
    ],
    chapters: [
      "sysdes-load-balancing-depth",
      "sysdes-observability-scale",
      "sysdes-storage-systems",
      "sysdes-release-safety",
    ],
    answer: {
      ask: `<p>
  Questions: how many users, repositories and daily git operations, and how big is a typical
  repository? Which protocols: HTTPS, SSH, or both? What is the ratio of fetches to
  pushes? Is there a web UI and API (pull requests, issues) in scope, or only git hosting?
  What are the availability and latency targets? Are there regions, or one? How quickly
  must a push be visible to the next fetch?
</p>
<p>
  Assumed scope: git over HTTPS and SSH, repository storage, web and API traffic, load
  balancing, health, monitoring and safe releases. Out of scope: code search, CI, and the
  internals of pull request review.
</p>`,
      numbers: `<p>
  Planning figures for the exercise, not facts about any real service.
</p>
<ul>
  <li><b>Fetch and clone:</b> 20 million a day / 86,400 = about 231 a second; at a 5x peak, about 1,160 a second.</li>
  <li><b>Push:</b> 2 million a day / 86,400 = about 23 a second; at 5x, about 116 a second.</li>
  <li><b>Web and API:</b> 100 million a day / 86,400 = about 1,160 a second; at 5x, about 5,800 a second.</li>
  <li><b>Concurrent git streams:</b> by Little's law, 1,160 starts a second x an assumed 20 seconds each = about 23,000 open streams at peak.</li>
  <li><b>Bandwidth:</b> assume an average of 5 MB per fetch (most are small incremental fetches). 20 million x 5 MB = 100 TB a day. 100 TB / 86,400 = about 1.16 GB a second, or 9.3 Gbit a second on average; 5x peak is about 46 Gbit a second.</li>
  <li><b>Repository data:</b> 10 million repositories x 50 MB = 500 TB; three copies is 1.5 PB. On 4 TB machines filled to 70% (2.8 TB each), 1,500 / 2.8 = about 540 storage machines.</li>
</ul>
<p>
  What the numbers force: the request rate is small (about 7,000 a second at peak across
  everything), but bandwidth and storage are not. The load balancers are limited by bytes
  (46 Gbit a second needs at least five 10-Gbit machines, so run nine, three in each of
  three AZs, and losing one AZ still leaves six), and repository data must be spread over hundreds of storage
  machines. The metadata (users, permissions, issues) stays on a relational primary with
  replicas, because 5,800 reads a second is under what a cached primary handles.
</p>`,
      design: `<ol>
  <li><b>Edge.</b> DNS to a layer-4 balancer fleet for SSH and for git over HTTPS when you want to pass TLS through and keep per-connection cost low, and a layer-7 fleet for the web UI and API where routing by path, authentication and rate limits are needed. Both fleets span three AZs. Layer 7 adds latency and CPU per request but understands requests; layer 4 is nearly free but sees only connections.</li>
  <li><b>Routing to repositories.</b> A repository is not stateless: its bytes are on specific machines. A <b>placement table</b> in the metadata store maps <code>repo_id</code> to a replica set of three storage nodes and names a primary. It is a lookup, not a hash, so one repository can move without renumbering the rest. Gateways cache the table and refresh on a change event.</li>
  <li><b>Fetch and clone.</b> Route to any healthy replica, choosing by <b>least outstanding requests</b>, not round robin, because one clone of a huge repository weighs a thousand small fetches. A gateway process on the storage node runs the git protocol against the local repository. Cache generated packfiles and archive downloads for popular repositories, and put a CDN in front of archive and release downloads.</li>
  <li><b>Push.</b> Route to the repository's primary. It writes the objects, updates the refs, and must replicate to at least one other replica before it acknowledges (two of three). Ref updates are compare-and-swap on the old value, so two simultaneous pushes cannot both win. A push to a repository on a failed primary waits for a replica to be promoted, and promotion picks the survivor with the newest refs: an acknowledged push exists on two of the three copies, so at least one survivor has it. Fetches continue from the others.</li>
  <li><b>Connection handling.</b> Clones last minutes, so deploys must <b>drain</b>: stop sending new requests, let existing streams finish up to a deadline, then close. Use a shallow health check (process alive) for the balancer and a deep one (can read a canary repository, replication lag under threshold) for traffic-shifting decisions. A deep check that every node runs against a shared dependency can take everything out at once, so shed rather than eject when too many fail.</li>
  <li><b>Hot repositories.</b> A popular repository concentrates reads on three nodes. Add read-only replicas for that repository, raise the packfile cache hit rate, and rate-limit anonymous clones per IP.</li>
  <li><b>Observability.</b> Define SLIs per user journey: fetch success rate, push success rate, time to first byte, push latency p99, web p99. Alert on multi-window burn rate against the SLO, not on raw CPU. Metrics are labelled by service, route class and status, <b>never by repository or user</b>: 10 million repositories would be 10 million series. Per-repository detail lives in structured logs and sampled traces, with a request id that flows from the balancer through the gateway to the storage node.</li>
  <li><b>Signals per tier.</b> Balancer: connections, bytes, 5xx, backend ejections. Gateway: request rate, errors, duration, open streams. Storage node: disk utilization and queue depth, CPU in pack generation, free space, replication lag. Add a synthetic probe from each region that clones, pushes and fetches a canary repository once a minute.</li>
  <li><b>Release safety.</b> Roll balancer configuration and storage software in waves: one AZ, then one more, with a bake time and automatic stop on error-rate or latency regressions versus the old version. Treat config pushes as releases.</li>
</ol>
<p>
  <b>Hard problem one: stateful routing with uneven requests.</b> Placement lookup plus
  least-outstanding balancing across replicas.
</p>
<p>
  <b>Hard problem two: knowing about problems early without drowning in series.</b> Journey
  SLIs, burn-rate alerts, canary probes, and high-cardinality detail in logs and traces
  instead of metrics.
</p>`,
      tradeoffs: `<ul>
  <li><b>Layer 4 vs layer 7 for git traffic.</b> Layer 4 is cheap and passes through any protocol but cannot route by repository or read a token. Layer 7 can route and rate-limit per repository and user but costs more per request. Pick layer 4 for SSH and a layer-7 tier for web and API. Flip git-over-HTTPS to layer 7 when you need per-repository routing or per-user limits at the edge.</li>
  <li><b>Round robin vs least outstanding requests.</b> Round robin is simple and fine for uniform requests. Git requests vary by orders of magnitude, so a few heavy clones can pile up on one node. Pick least outstanding. Flip to consistent hashing by repository id when cache locality on the storage node matters more than even spread.</li>
  <li><b>Synchronous vs asynchronous replication on push.</b> Waiting for a second copy adds a round trip (0.5 ms in the same AZ, 1 to 2 ms across AZs) and avoids losing an acknowledged push if the primary dies. Asynchronous is faster but can lose recent pushes. Pick two-of-three synchronous. Flip to asynchronous only for mirrors or forks where the source can be recopied.</li>
  <li><b>Deep vs shallow health checks.</b> Deep checks catch more but can flap or cascade; shallow checks miss a node that is up but useless. Pick shallow for ejection and deep for alerts and gradual traffic shifting. Flip to deeper ejection checks when failures are mostly node-local.</li>
</ul>`,
      followups: [
        "One repository goes viral and 20,000 people clone it in a minute. What do you do in the first ten minutes and in the next month?",
        "How do you deploy a new version of the gateway without dropping clones that are halfway through?",
        "Your 5xx alert is quiet but users say pushes feel slow. What signals would show it?",
        "How would you move a repository between storage nodes with no downtime?",
        "How do you test that the system survives losing an AZ?",
      ],
      slips: `<ul>
  <li>Treating the service as stateless web servers behind one balancer and missing that a repository lives on specific machines.</li>
  <li>Round-robin balancing for requests whose cost varies by a factor of a thousand.</li>
  <li>Sizing the balancers by request rate (about 7,000 a second) when bandwidth is the constraint.</li>
  <li>Putting repository or user id into metric labels and exploding the series count.</li>
  <li>Alerting on CPU instead of on user-facing success and latency.</li>
  <li>Restarting gateways with no connection draining, killing every long clone.</li>
  <li>Acknowledging a push before a second copy exists.</li>
  <li>A health check that depends on a shared service, so one dependency outage ejects every node.</li>
</ul>`,
    },
  },
  {
    id: "microsoft-firmware-updates",
    company: "microsoft",
    title: "Design a firmware-update delivery system",
    prompt:
      "Design a system that delivers firmware updates to 50 million connected devices. Updates are tens of megabytes, devices have unreliable networks, a bad update must be stoppable and recoverable, and only genuine updates may be installed.",
    level: "SDE-2",
    kind: "hld",
    evidence: "guide",
    sources: [
      {
        label: "Aced: Microsoft system design interview guide",
        url: "https://www.aced.io/blog/microsoft-system-design-interview",
        kind: "prep-guide",
        year: 2026,
      },
    ],
    chapters: ["sysdes-cdns", "sysdes-release-safety", "sysdes-storage-systems", "sysdes-security-basics"],
    answer: {
      ask: `<p>
  Questions: how many devices, how large is an image, and how often do releases happen?
  Are devices always online or do they check in on a schedule? Do they have a spare
  partition so a failed update can roll back? Can we target subsets by model, region or
  version? How fast must a critical security fix reach everyone? Are some devices behind
  slow or metered links? Who may publish an update?
</p>
<p>
  Assumed scope: publish a signed update, decide which devices get it and when, deliver the
  bytes, install with rollback, report status, halt a bad rollout. Out of scope: building
  the firmware itself, hardware design, and a customer-facing dashboard.
</p>`,
      numbers: `<p>
  Planning figures for the exercise, not facts about any real fleet.
</p>
<ul>
  <li><b>Fleet and image:</b> 50 million devices; a 40 MB full image.</li>
  <li><b>Total bytes for one release:</b> 50,000,000 x 40 MB = 2,000,000,000 MB, which is 2 PB. If a delta update averages 5 MB, the total is 250 TB, one eighth of that.</li>
  <li><b>Time window:</b> roll out over 7 days. 2 PB / (7 x 86,400 s) = about 3.3 GB a second, or about 26 Gbit a second sustained for full images; the delta case is about 3.3 Gbit a second. A critical fix pushed in 24 hours is about 23 GB a second, 185 Gbit a second. Either way this is CDN work, not origin work.</li>
  <li><b>Check-ins:</b> each device asks "anything for me?" every 6 hours: 50,000,000 / 21,600 s = about 2,300 a second. With a 5x spike after a power outage, about 11,600 a second.</li>
  <li><b>Origin load with a CDN:</b> if 98% of image bytes come from the edge, the origin serves 2% of 2 PB = 40 TB across the week.</li>
  <li><b>Device state:</b> 50 million rows x 200 bytes = 10 GB.</li>
</ul>
<p>
  What the numbers force: the check-in service is small (about 2,300 reads a second is
  well under what one primary does; 11,600 at the spike is still within its reads, but if every
  check-in wrote <code>last_seen</code> it would pass the 5,000 writes a second one primary commits, so batch or sample those updates), while
  the bytes must come from a CDN or other edge. The image must be an immutable object, and
  the manifest that points at it must be tiny and cacheable.
</p>`,
      design: `<ol>
  <li><b>Build and signing.</b> The release pipeline produces the image, computes a SHA-256 digest, and creates a <b>manifest</b>: version, hardware models allowed, minimum current version, image URL, size, digest, optional delta URLs, and a rollout id. The manifest is signed with a release key held in an HSM or managed key service; the image is signed too. Devices ship with the <b>public verification key</b> (and a way to rotate it, with a key id) and verify before installing. Publishing requires two-person approval.</li>
  <li><b>Storage.</b> Images and deltas are immutable objects in an object store, named by content digest, served through a CDN. Never overwrite an object; a new release is a new name. This makes caching safe and rollbacks trivial.</li>
  <li><b>Update service.</b> A device checks in with its id, model, current version and a signed device token. The service reads the rollout rules and returns either "nothing" or a manifest with a short-lived download URL. Rules are small and cached; device state (<code>device_id, model, version, state, last_seen, rollout_id</code>) lives in a key-value or relational store keyed by device id.</li>
  <li><b>Rollout control.</b> A rollout has target filters (model, region, version range) and a <b>wave plan</b>: for example 0.1%, 1%, 5%, 25%, 100%. A device is in a wave by a stable hash of <code>device_id + rollout_id</code>, so the share is close to the target and the same devices stay in. Between waves there is a <b>bake time</b> and automatic gates: install success rate, boot-health reports, crash rate, and rollback rate compared with the control group still on the old version.</li>
  <li><b>Halt.</b> A kill switch flips the rollout state; the update service stops returning the manifest on the next check-in (at most one check-in interval, plus a cache TTL of a minute). Devices that already downloaded but not yet installed re-check before the install step.</li>
  <li><b>Download.</b> Devices use HTTP range requests and resume after a drop, verify the digest of the finished file, and only then start the install. Stagger starts by a random delay to avoid a herd, honour a metered-link or battery policy, and prefer delta updates when the device's current version has one.</li>
  <li><b>Install and rollback.</b> A/B partitions: write to the inactive slot, verify the signature, set the boot flag to try the new slot once, reboot, and mark it good only after a health check passes within a time limit; otherwise the bootloader falls back to the old slot. The device reports <code>downloaded</code>, <code>installed</code>, <code>healthy</code> or <code>rolled_back</code> with the version.</li>
  <li><b>Anti-downgrade.</b> The manifest carries a monotonic security version; a device refuses lower ones, so an attacker cannot force an old vulnerable image. Pair that with a way to recall a bad release: publish a higher version rather than reuse an old one.</li>
  <li><b>Observability.</b> Funnel counts per wave (offered, downloaded, installed, healthy, rolled back), time to install, error codes by model, and download throughput. Alert on rollback rate against the control group.</li>
</ol>
<p>
  <b>Hard problem one: a bad image must not reach the whole fleet.</b> Hash-based waves,
  bake time, health gates against a control group, and an A/B slot that restores the old
  firmware on its own.
</p>
<p>
  <b>Hard problem two: trust.</b> Signed manifest and image, digest check, key rotation, and a
  security version against downgrade. Transport security alone is not enough, because the
  signature must hold even if a cache or mirror is compromised.
</p>`,
      tradeoffs: `<ul>
  <li><b>Device pull vs server push.</b> Pull (devices poll) works through firewalls and with sleeping devices and keeps the server simple, at the cost of up to one interval of delay. Push is faster for an urgent fix but needs a persistent connection per device. Pick pull. Flip to a push hint (a small wake-up message that triggers a check-in) for critical security fixes.</li>
  <li><b>Full image vs delta updates.</b> Deltas cut bytes by about eight times in our example, but only work from known base versions and add build and test cost. Full images always work. Pick full images first with deltas for the most common source versions. Flip to deltas everywhere if the links are metered or bandwidth cost dominates.</li>
  <li><b>Fast rollout vs staged waves.</b> A staged rollout limits the blast radius and takes days; going to everyone at once is quick and risks bricking the fleet. Pick waves. Flip to a fast schedule only for an actively exploited vulnerability, and keep at least a small first wave.</li>
  <li><b>A/B partitions vs single slot with recovery mode.</b> A/B safely handles bad images and costs flash space (a second slot). A single slot saves space but a failed write can leave the device unable to boot without physical service. Pick A/B where flash allows. Flip to a minimal recovery image only on very constrained hardware.</li>
</ul>`,
      followups: [
        "Wave one shows a 3% rollback rate on one hardware model and 0.1% on the rest. What do you do, and in what order?",
        "How do you rotate the signing key if you suspect it leaked, when devices in the field only trust the old public key?",
        "A device has been offline for a year and is five versions behind. How does it get current?",
        "How would you cut the download load on a site with thousands of devices sharing one slow uplink?",
        "How do you prove to an auditor which version each device ran, and when?",
      ],
      slips: `<ul>
  <li>Serving 2 PB from the origin servers instead of an edge cache with immutable, content-addressed objects.</li>
  <li>Relying on HTTPS alone and never signing the image, so a compromised mirror can ship malware.</li>
  <li>Rolling out to everyone at once, or choosing waves at random on each check-in so the share drifts.</li>
  <li>Having no rollback path: a failed write leaves the device bricked.</li>
  <li>Letting the device mark the new slot good before a health check, so a boot loop becomes permanent.</li>
  <li>Allowing downgrades, which lets an attacker reinstall a known vulnerable version.</li>
  <li>Overwriting an object in place, so caches serve a mix of old and new bytes.</li>
  <li>Ignoring the herd after a power outage, when millions of devices check in at the same moment.</li>
</ul>`,
    },
  },
];
