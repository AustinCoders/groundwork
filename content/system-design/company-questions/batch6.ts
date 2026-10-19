import type { CompanyQuestion } from "./types";

export const questions: CompanyQuestion[] = [
  {
    id: "meta-coding-platform",
    company: "meta",
    title: "Design a LeetCode-style coding platform",
    prompt:
      "Design an online platform where users read a problem, submit code in several languages, and get a verdict from hidden test cases. Assume 1 million daily active users and a weekly contest with 100,000 participants over two hours.",
    level: "level not stated",
    kind: "hld",
    evidence: "one",
    sources: [
      {
        label: "Blind: Meta system design questions for E4/E5 (comment)",
        url: "https://www.teamblind.com/post/meta-system-design-interview-questions-for-e4e5-in-2024-elsjhbad",
        kind: "candidate-report",
        year: 2024,
      },
      {
        label: "Hello Interview: Meta E5 system design guide",
        url: "https://www.hellointerview.com/guides/meta/e5",
        kind: "prep-guide",
      },
    ],
    chapters: [
      "sysdes-message-queues-async",
      "sysdes-security-basics",
      "sysdes-fault-tolerance",
      "sysdes-rate-limiting",
    ],
    answer: {
      ask: `<p>Questions I would ask first: which languages and how many? Is the verdict synchronous or can the user wait a few seconds? Do contests need a live leaderboard and a fair, repeatable time limit? Are custom checkers needed (problems with many valid outputs)? Is plagiarism detection in scope? Who writes problems and test data?</p>
<p>Assumed scope: submit, judge against hidden tests, return a verdict (accepted, wrong answer, time limit, memory limit, runtime error, compile error), submission history, and a contest leaderboard. Out of scope: the problem editor, plagiarism detection, discussion forums, and the code editor in the browser.</p>`,
      numbers: `<p>These are planning figures for the exercise, not facts about any real service.</p>
<ul>
<li>Everyday load: 1 million daily active users × 3 submissions = 3 million a day. 3,000,000 ÷ 86,400 is about <b>35 a second</b>; a 5× peak is about 175 a second.</li>
<li>Contest load: 100,000 people × 6 submissions = 600,000 over 7,200 s, about 83 a second on average. Submissions cluster in the first minutes and the last ten, so plan a 10× peak: about <b>830 a second</b>.</li>
<li>Judge cost: assume 2 s of one core per submission (compile plus about 10 test runs). 830 × 2 = <b>1,660 busy cores</b>. With 2× headroom that is 3,320 cores, about 210 workers of 16 cores each.</li>
<li>Database writes: three per submission (queued row, outbox row, final verdict) = 3 × 830 = about <b>2,500 a second</b>, under the 5,000 write line even if outbox cleanup adds a fourth (3,320).</li>
<li>Database reads: a submission waits about 5 s and its client polls once a second, so 830 × 5 = 4,150 polls a second. A leaderboard seen by 100,000 viewers every 10 s is 10,000 reads a second, but it is served from a cached snapshot. Total about 14,000, under the 20,000 line.</li>
<li>Storage: 3 million source files × 5 KB = 15 GB a day in object storage; 3 million metadata rows × 300 B = 0.9 GB a day, about 330 GB a year.</li>
</ul>
<p>The conclusion: one relational primary is enough. The scarce resource is sandboxed CPU, so the design is about the judge fleet, its queue and its isolation, not the database.</p>`,
      design: `<p><b>Components.</b> API service, submissions table (relational), object storage for source code and test bundles, a judge queue, a worker fleet, a results consumer, a leaderboard store, and a rate limiter in front of the API.</p>
<p><b>Data model.</b> <code>submissions(id, user_id, problem_id, language, status, verdict, runtime_ms, memory_kb, code_ref, created_at, contest_id)</code>. The primary key is a generated id; index <code>(user_id, created_at desc)</code> for history and <code>(contest_id, created_at)</code> for contest queries. Source code lives in object storage, referenced by <code>code_ref</code>, so rows stay small.</p>
<p><b>Write path.</b></p>
<ol>
<li>The client posts the code with an idempotency key, so a double click returns the same submission. The limiter allows a few submissions a minute per user (a token bucket keyed by user id).</li>
<li>The API stores the source, inserts a row with status <code>QUEUED</code>, and writes a job to an outbox in the same transaction. A relay publishes it to the judge queue. The API returns 202 with the submission id.</li>
<li>The queue has separate lanes: contest, practice, and rejudge. Lanes keep a practice backlog from delaying a contest. Workers are pooled per language runtime, because compilers and images differ.</li>
<li>A worker takes a job with a lease, runs it in the sandbox, and writes the verdict with a conditional update (<code>where status != 'DONE'</code>). If the worker dies, the lease expires and the job is retried. Judging is repeatable apart from borderline time limits, and the conditional update keeps the first verdict, so a second run changes nothing.</li>
<li>A results consumer updates the leaderboard on accepted verdicts, de-duplicated by submission id and counting only a user's first accepted submission per problem, so a replayed event changes nothing.</li>
</ol>
<p><b>Read path.</b> The client polls the submission by id with backoff, or listens on a server-sent stream. The leaderboard is a sorted set keyed by (problems solved, penalty), rebuilt from the table if lost.</p>
<p><b>Hard problem 1: running untrusted code.</b> Assume every submission is hostile. Run it in a container hardened with a seccomp syscall filter, no network, a read-only root, a small writable tmpfs, an unprivileged user, and cgroup limits on CPU, memory, process count and output size. Containers share the host kernel, so for a stronger boundary use a user-space kernel sandbox or a microVM, and accept the startup cost and syscall overhead. Never run code in the API process, and never give the sandbox credentials. Wipe the sandbox after every run, so one submission cannot leave anything for the next.</p>
<p><b>Hard problem 2: fair verdicts under burst.</b> Wall-clock limits are noisy on shared machines. Pin each run to a core, enforce CPU-time limits as well as wall time, and re-run a borderline time-limit failure once before reporting it. The contest start time is known, so scale the fleet and pre-pull test bundles (about 10 problems × 10 MB each) before it begins, instead of reacting to queue depth. Stop a test run at the first failure for practice submissions, and run all tests in a contest only if scoring needs it.</p>`,
      tradeoffs: `<ul>
<li><b>Container vs microVM sandbox.</b> Containers start in milliseconds but share the kernel, so one kernel bug can escape. A microVM or user-space kernel isolates better and costs more per run. Pick the stronger boundary for a public platform running arbitrary code; flip to plain hardened containers only for a closed internal tool.</li>
<li><b>Polling vs push for verdicts.</b> Polling is stateless and survives restarts; push saves requests but needs long-lived connections. With about 4,000 polls a second, polling is fine; flip to a stream when waiting clients reach the hundreds of thousands.</li>
<li><b>Queue autoscale vs scheduled scale.</b> Reactive scaling lags a burst by minutes, which is exactly how long a contest start lasts. Pre-scale from the contest schedule, and keep reactive scaling for the unscheduled practice load.</li>
<li><b>Stop at first failure vs run every test.</b> Stopping saves CPU; running all gives partial-credit scoring and better feedback. Stop early for practice, run all where scoring demands it.</li>
</ul>`,
      followups: [
        "How do you stop a submission that forks processes, allocates memory in a loop, or prints gigabytes of output?",
        "A worker crashes halfway through a contest submission. What does the user see and what is the retry story?",
        "How would you rejudge 200,000 old submissions after a test case is fixed without hurting live contests?",
        "How do you keep the leaderboard consistent if the results consumer processes an accepted verdict twice?",
        "Where would you add support for a language with a slow compiler, and how do you avoid unfair time limits across languages?",
      ],
      slips: `<ul>
<li>Running submitted code on the API servers or in a shared process, and treating sandboxing as a detail.</li>
<li>Sending everything through one queue, so a practice backlog delays a contest.</li>
<li>Sizing the database carefully and never sizing the judge fleet, which is the real bottleneck.</li>
<li>Using wall-clock time only, then getting flaky time-limit verdicts from noisy neighbours.</li>
<li>Writing every state change straight to the database, or storing source code as large blobs in the primary table.</li>
<li>Skipping idempotency and rate limits, so a double click or a script floods the queue.</li>
<li>Leaking hidden test inputs or expected outputs in error messages.</li>
</ul>`,
    },
  },
  {
    id: "phonepe-search-engine",
    company: "phonepe",
    title: "Design a web-scale search engine (crawler and query service)",
    prompt:
      "Design a web search engine with a crawler that collects pages and a query service that returns ranked results in under 300 ms. Assume 10 billion pages indexed, 5,000 queries a second at peak, and every page refreshed about once a month.",
    level: "SDE-2",
    kind: "hld",
    evidence: "one",
    sources: [
      {
        label: "Roundz: PhonePe SDE-2 interview experience (2022 process)",
        url: "https://roundz.substack.com/p/interview-experience-130-phonepe-sde2",
        kind: "candidate-report",
        year: 2022,
      },
    ],
    chapters: [
      "sysdes-walkthrough-crawler",
      "sysdes-search-systems",
      "sysdes-sharding-partitioning",
      "sysdes-storage-engines",
    ],
    answer: {
      ask: `<p>Questions first: is this a general web search or a vertical one? Do results need freshness measured in minutes (news) or days? Are images, ads and personalization in scope? What is the language mix? What latency and availability do queries need, and how stale may the index be?</p>
<p>Assumed scope: general web text search. In scope: crawling, parsing, link graph, index build, serving, ranking in two stages, freshness. Out of scope: ads, personalization, image and video search, and the details of spam classifiers.</p>`,
      numbers: `<p>Planning figures for the exercise, not facts about any real search engine.</p>
<ul>
<li>Crawl rate: 10 billion pages ÷ 30 days = 333 million a day. 333,000,000 ÷ 86,400 is about <b>3,900 pages a second</b>.</li>
<li>Bandwidth: 3,900 × 100 KB = 390 MB/s, about <b>3.1 Gbps</b>. At 30 pages a second per node (the crawler chapter's figure), 3,900 ÷ 30 = <b>130 crawler nodes</b>.</li>
<li>Raw storage: 10 billion × 100 KB = <b>1 PB</b> of HTML, 250 TB at 4:1 compression.</li>
<li>Index size: assume 5 KB per page after text extraction and compression: 10 billion × 5 KB = <b>50 TB</b>. At 50 GB a shard that is <b>1,000 shards</b> of 10 million pages each.</li>
<li>Query load if every shard served every query: each shard replica handles an assumed 250 queries a second, so 5,000 ÷ 250 = 20 replicas per shard, and 1,000 × 20 = <b>20,000 shard replicas</b>. About 5,000 nodes at four shards each.</li>
<li>With tiering: the top 10% of pages by quality sit in 100 shards that see all 5,000 q/s (100 × 20 = 2,000 replicas). Assume 10% of queries fall through to the other 900 shards: 500 q/s ÷ 250 = 2 replicas each, 1,800 replicas. Total <b>3,800</b>, about 950 nodes. That is 5× fewer.</li>
<li>Latency budget (300 ms): 20 query parsing, 120 shard search, 20 merge, 60 re-rank, 50 snippets, 30 slack.</li>
</ul>
<p>The conclusion: the index must be sharded, replicated and tiered, and the fall-through rate decides the cost.</p>`,
      design: `<p><b>Pipeline.</b></p>
<ol>
<li><b>Crawl.</b> As in the crawler chapter: a frontier with priority queues in front and per-host politeness queues behind, robots and DNS caches, URL normalization, a URL-seen set, content fingerprints for duplicates, and sharding by host so one node owns one host's politeness. Refresh is a budget: pages that change often or matter more are revisited first.</li>
<li><b>Store.</b> Fetched pages go to a blob or wide-column store keyed by hash of the normalized URL, with fetch time and a content hash. A "page fetched" event goes to a log.</li>
<li><b>Parse.</b> Workers extract text, title, language, canonical URL and outgoing links; links go to the link graph store (edges, source to target) and to the frontier.</li>
<li><b>Offline jobs.</b> A batch job computes link-based quality scores over the graph, and a build job turns documents into immutable index segments.</li>
<li><b>Serve.</b> Segments are published to the serving shards. The index is derived data: it can always be rebuilt from the page store.</li>
</ol>
<p><b>Data model.</b> The index per shard holds, for each term, a postings list of (doc id, term frequency, positions), plus a forward store of doc id to title, URL and snippet source, and a static score. Doc ids are local to the shard. Documents are assigned to a tier by quality score and to a shard within the tier by hash of URL.</p>
<p><b>Document-partitioned vs term-partitioned index.</b> I partition by document: each shard indexes a slice of pages completely, so each does the full query locally and returns its top 100. A term-partitioned index would ship long postings lists across the network for multi-word queries. The cost of document partitioning is that every query fans out to every shard in its tier.</p>
<p><b>Query path.</b></p>
<ol>
<li>The query service normalizes and spell-corrects the query, then checks a result cache keyed by the normalized query with a short TTL (popular queries repeat a lot; measure the hit rate).</li>
<li>It fans out to one replica of each tier-1 shard, scoring with BM25 plus the static quality score. Late replicas are cut off at a deadline, and a slow request is hedged to a second replica.</li>
<li>It merges the shard top lists and re-ranks the best few hundred with a richer model (freshness, anchor text, language match). If tier 1 returns too few good results, it falls through to tier 2.</li>
<li>It builds snippets from the forward store.</li>
</ol>
<p><b>Hard problem 1: tail latency.</b> A query is as slow as its slowest shard out of 100. Use per-shard deadlines, hedged requests, and return a partial result rather than wait. <b>Hard problem 2: freshness.</b> Rebuilding 50 TB constantly is wasteful, so keep a small, frequently rebuilt fresh index for recently changed pages that is searched alongside the main one, with deletions recorded in a tombstone list. Merge fresh data into the main segments on a slower schedule.</p>`,
      tradeoffs: `<ul>
<li><b>Document vs term partitioning.</b> Document partitioning keeps each query's work local but fans out widely; term partitioning contacts few shards but moves large postings lists. Pick document partitioning for multi-word queries; flip only if queries are mostly single rare terms.</li>
<li><b>Tiered vs flat index.</b> Tiering cuts serving cost about 5× in the numbers above, at the price of a quality classifier and worse recall when good pages sit in the lower tier. Flip to flat if the cluster is small enough that cost does not matter.</li>
<li><b>Batch rebuild vs incremental update.</b> Batch is simple and gives clean immutable segments; incremental gives freshness. Use a small incremental fresh tier on top of batch, and widen it only when freshness is a product requirement (news).</li>
<li><b>More replicas vs hedging.</b> Extra replicas cost hardware; hedged requests cost extra load (a few percent) but cut the tail. Hedge first, add replicas when load, not tail, is the limit.</li>
</ul>`,
      followups: [
        "How do you prevent crawling the same site twice under different URLs, and how do you detect near-duplicate pages?",
        "A shard replica dies in the middle of a query. What does the user see, and how fast do you rebuild the replica?",
        "How do you add ranking signals from click behaviour without letting spam manipulate them?",
        "How would you support a query like an exact phrase in quotes?",
        "How do you deploy a new index version to 3,800 replicas without a latency spike?",
      ],
      slips: `<ul>
<li>Designing only the crawler or only the query service, when the question is both and the index build is the bridge.</li>
<li>Putting the pages in one database and searching with <code>LIKE</code>, or putting the whole index on one machine.</li>
<li>Ignoring politeness, robots rules and spider traps, or using a global queue with no per-host control.</li>
<li>Forgetting fan-out arithmetic: sharding the index without noticing that every query now touches every shard.</li>
<li>No ranking story beyond term matching, or no answer for pages that change.</li>
<li>Updating the index synchronously on every crawl instead of building immutable segments.</li>
<li>Skipping duplicate detection, so the results fill with copies of the same page.</li>
</ul>`,
    },
  },
  {
    id: "atlassian-tagging-system",
    company: "atlassian",
    title: "Design a product-agnostic tagging system for several products",
    prompt:
      "Design a tagging service that several products (issues, wiki pages, code repositories) can share. Users add and remove tags, find items by one or more tags, and get suggestions while typing, and results must respect each product's permissions. Assume 100,000 organizations and 1 billion tagged items.",
    level: "P40 / SDE-2",
    kind: "hld",
    evidence: "several",
    sources: [
      {
        label: "Blind: Atlassian interview questions",
        url: "https://www.teamblind.com/post/atlassian-interview-questions-7cu5isvj",
        kind: "candidate-report",
      },
      {
        label: "CodingKaro: Atlassian LeetCode interview experiences (index of titles)",
        url: "https://www.codingkaro.in/jobs-internships/leetcode-interview-experience/Atlassian",
        kind: "prep-guide",
        year: 2025,
      },
      {
        label: "Intervue: Atlassian interview experience in India",
        url: "https://www.intervue.io/blog/atlassian-interview-experience-india",
        kind: "prep-guide",
      },
    ],
    chapters: [
      "sysdes-databases-in-design",
      "sysdes-search-systems",
      "sysdes-apis-communication",
      "sysdes-caching-fundamentals",
    ],
    answer: {
      ask: `<p>Questions first: are tags free text typed by users, or managed in a list by admins? Are tags scoped to an organization, or shared across organizations? Does a tag have attributes (color, description)? Do users need AND, OR and NOT queries? Who owns permissions, the tag service or each product? Is rename or merge needed? How quickly must a new tag appear in search?</p>
<p>Assumed scope: tags scoped to one organization (tenant), free-text creation, multi-tag AND and OR search, autocomplete, rename and merge. The product owns its items and its permissions. Out of scope: tag hierarchies, machine-suggested tags, and cross-organization sharing.</p>`,
      numbers: `<p>Planning figures for the exercise, not facts about any real product.</p>
<ul>
<li>Edges: 1 billion items × 3 tags = <b>3 billion</b> item-tag rows. At 60 B each that is 180 GB; stored in two directions (item to tags, tag to items) it is <b>360 GB</b>. That fits a handful of shards with room to grow.</li>
<li>Tag edits: 20 million a day ÷ 86,400 = 231 a second; a 5× peak is about <b>1,160 a second</b>. Each edit writes two edge rows plus one outbox row, so about 3,500 row writes a second at peak: under 5,000, but not by much, so plan to shard by tenant.</li>
<li>Item views that show tags: 500 million a day ÷ 86,400 = 5,787 a second; at 5× that is about <b>29,000 lookups a second</b>, above the 20,000 line. A cache with a 90% hit rate leaves 2,900 a second on the database.</li>
<li>Tag searches: 50 million a day = 579 a second, about 2,900 at peak.</li>
<li>Tag catalogue: 100,000 organizations × 500 tags × 100 B = <b>5 GB</b>. One organization's tag list is about 50 KB (500 × 100 B), so suggestions can be served from a per-tenant cache or even by the browser.</li>
</ul>
<p>The conclusion: writes are modest, item-to-tags reads need a cache and a bulk API, and the catalogue is tiny. The hard part is permissions and multi-tag search, not volume.</p>`,
      design: `<p><b>Data model.</b></p>
<ul>
<li><code>tags(tenant_id, tag_id, name_norm, display_name, created_by, archived)</code>, unique on <code>(tenant_id, name_norm)</code>. <code>name_norm</code> is the trimmed, case-folded, Unicode-normalized name, so "Backend" and "backend " are one tag.</li>
<li><code>item_tags(tenant_id, item_key, tag_id, scope_id, added_by, added_at)</code>, primary key <code>(tenant_id, item_key, tag_id)</code>: the item to tags direction. <code>item_key</code> is an opaque string made of product, type and the product's own id, so the service never needs a product's schema. <code>scope_id</code> is the coarse container the product reports (project, space, repository).</li>
<li><code>tag_items(tenant_id, tag_id, added_at, item_key, scope_id)</code>, the tag to items direction, written in the same transaction.</li>
</ul>
<p>Edges refer to <code>tag_id</code>, not the name, so renaming a tag changes one row. Shard by <code>tenant_id</code>: every query is inside one tenant, and a tenant is a natural isolation unit. A directory table maps very large tenants to their own shard.</p>
<p><b>Write path.</b> <code>PUT /items/{item_key}/tags/{tag}</code> is idempotent by its natural key. The service resolves or creates the tag (upsert on <code>(tenant_id, name_norm)</code>), inserts both edge rows and an outbox row in one transaction, and enforces limits (for example 50 tags per item, and a per-user rate limit). The outbox feeds the search index and gives products a change event. Remove is a delete of the same rows.</p>
<p><b>Read paths.</b></p>
<ol>
<li><b>Tags for items:</b> a bulk call, <code>POST /tags/lookup</code> with up to 50 item keys, so a list page makes one call instead of fifty. Results come from a cache keyed by <code>(tenant_id, item_key)</code>; a write deletes the key after commit, with a short TTL as a backstop.</li>
<li><b>Items for one tag:</b> a range scan on <code>tag_items</code>, returned with a cursor on <code>(added_at, item_key)</code>, not an offset.</li>
<li><b>Multi-tag AND/OR and text:</b> served by a search index (one document per item with a <code>tags</code> keyword field, routed by tenant) fed from the outbox, as in the search chapter. Intersecting two postings lists in the relational store is fine for rare tags and bad for a tag on millions of items.</li>
<li><b>Suggestions:</b> take the tenant's tag list from cache, filter by prefix, and order by recent use; the list is small enough that no special index is needed.</li>
</ol>
<p><b>Hard problem: permissions.</b> The product owns who can see an item, and the tag service must not leak it. Two layers. First, each edge carries <code>scope_id</code>, and the product tells the service which scopes the caller can reach, so the query filters inside the index, avoiding pages that come back short after filtering. Second, items with item-level restrictions get a final batched permission check against the product on the candidate page. Suggestions are limited to tags used in scopes the caller can see, so a tag name does not leak from a private project.</p>
<p><b>Merge and rename.</b> Merge re-points edges from the old tag to the new one in batches in the background, keeping an alias row so reads resolve the old id during the move.</p>`,
      tradeoffs: `<ul>
<li><b>Central service vs each product storing tags itself.</b> A central service gives one vocabulary, cross-product search and one set of rules; each product keeping its own is simpler and faster to ship but the tags never line up. Pick central when cross-product search is the goal; flip to per-product when products have nothing in common.</li>
<li><b>Relational edges vs a search index for queries.</b> Relational edges give exact, transactional single-tag lookup; the search index gives multi-tag queries and text but is eventually consistent. Use relational as the source of truth and the index as a derived view, as in the search chapter.</li>
<li><b>Pre-filter by scope vs post-filter by permission check.</b> Post-filtering is exact but returns short pages and costs a call per page; pre-filtering by scope is fast but only as precise as the scope. Use both, and flip to post-filter alone for products with highly irregular item permissions.</li>
<li><b>Tenant shard key vs tag shard key.</b> Tenant keeps queries local and isolates noisy tenants; a tag-based key spreads a huge tenant evenly but turns each query into a fan-out. Pick tenant and split the few huge tenants out by directory.</li>
</ul>`,
      followups: [
        "How do you rename a tag used on 5 million items without touching 5 million rows?",
        "A user searches for two popular tags and the result has millions of items. How do you paginate and keep it fast?",
        "How does a product know a tag changed so it can update its own search index?",
        "How would you stop a tenant from creating a million near-duplicate tags?",
        "How do you handle a tag on an item that the product deletes, and does the tag service ever see the delete?",
      ],
      slips: `<ul>
<li>Storing tags as a comma-separated string on the item, which makes tag search a scan and rename a rewrite.</li>
<li>Making the service product-aware, with a table per product, instead of an opaque item key.</li>
<li>Forgetting permissions entirely, or checking them after pagination so users see empty pages.</li>
<li>Case and whitespace variants creating duplicate tags, because there is no normalized unique name.</li>
<li>One call per item to show tags in a list (the N+1 problem).</li>
<li>Dual-writing to the database and the search index instead of using an outbox.</li>
<li>Offset pagination on large tag results.</li>
</ul>`,
    },
  },
  {
    id: "atlassian-popular-feed",
    company: "atlassian",
    title: "Design an engagement-based popular content feed",
    prompt:
      "Design a feed that shows the most popular content in an organization, ranked by recent engagement such as views, reactions and comments. Assume 100 million engagement events a day, 5 million users, and a feed that should reflect activity within a few minutes.",
    level: "P40",
    kind: "hld",
    evidence: "guide",
    sources: [
      {
        label: "CodingKaro: Atlassian LeetCode interview experiences (index of titles)",
        url: "https://www.codingkaro.in/jobs-internships/leetcode-interview-experience/Atlassian",
        kind: "prep-guide",
        year: 2025,
      },
      {
        label: "Intervue: Atlassian interview experience in India",
        url: "https://www.intervue.io/blog/atlassian-interview-experience-india",
        kind: "prep-guide",
      },
    ],
    chapters: ["sysdes-batch-stream-processing", "sysdes-caching-fundamentals", "sysdes-search-systems"],
    answer: {
      ask: `<p>Questions first: what is the unit being ranked (page, post, project)? Is "popular" global, per organization or per team? What window: the last hour, 24 hours, 7 days? How fresh must it be, seconds or minutes? Do different actions count differently? Must the feed hide content the viewer cannot access? Is it personalized?</p>
<p>Assumed scope: a non-personalized "popular" list per scope (an organization or a space), with a recency-weighted score, refreshed within a few minutes, filtered by what the viewer may see. Out of scope: personalized ranking and machine-learned recommendations.</p>`,
      numbers: `<p>Planning figures for the exercise, not facts about any real product.</p>
<ul>
<li>Events: 100 million a day ÷ 86,400 = <b>1,157 a second</b>; a 5× peak is about <b>5,800 a second</b>. At 100 B an event, that is 10 GB a day of raw log. The peak is above the 5,000 write line, so events go through a log and a stream job, not row updates in a database.</li>
<li>Hourly buckets: one row per (item, hour) with a weighted count, 40 B. The worst case is one row per event: 100 million × 40 B = <b>4 GB a day</b>, 28 GB for a 7-day window. Real data is far smaller because many events hit the same item and hour.</li>
<li>Active items: assume 10 million items get engagement in a day. A score record per item (score, last update, counts by type) at 100 B is <b>1 GB</b>. That fits in memory.</li>
<li>Reads: 5 million users × 4 feed loads = 20 million a day ÷ 86,400 = 231 a second; a 5× peak is about <b>1,200 a second</b>. That is far below the 20,000 line, so the read side needs a cache for latency and protection, not for capacity.</li>
<li>Decay: with a 12-hour half-life, an event counts 100% now, 50% after 12 hours, and 25% after 24 hours.</li>
</ul>
<p>The conclusion: the write side is the stream job; the read side is a small precomputed list per scope. Computing the ranking per request would be both unnecessary and wasteful.</p>`,
      design: `<p><b>Pipeline.</b></p>
<ol>
<li><b>Capture.</b> Services emit an engagement event (<code>event_id, user_id, item_id, scope_id, type, ts</code>) to a log, partitioned by <code>item_id</code> so one task sees all of an item's events.</li>
<li><b>Stream job.</b> It drops duplicates by <code>(user_id, item_id, type)</code> within an hour (one person refreshing a page 100 times counts once), ignores the author's own actions, and applies weights (for example view 1, reaction 3, comment 5; tunable). It sums into one-hour event-time windows and emits the running total for the open hour about every minute.</li>
<li><b>Bucket store.</b> Each emission is an upsert to <code>buckets(item_id, hour) = weighted_count</code>. Because it overwrites with a cumulative total, a replay or a late update is harmless, the same idea as the ad-click example in the stream chapter. Events later than the allowed lateness go to a side output and are ignored for the live feed.</li>
<li><b>Ranker.</b> Every few minutes, for items whose bucket changed, compute <code>score = sum(bucket × 2^((bucket_hour − ref_hour) / 12))</code> over the last 168 hourly buckets (7 days), a cheap read of at most 168 rows. This is the 12-hour half-life decay written against a fixed reference hour, so scores written at different times compare directly and an item that did not change keeps a correct place without being re-scored; rebase <code>ref_hour</code> and rewrite the scores now and then, because they only grow. Write the score into a sorted set per scope.</li>
<li><b>Publish.</b> A refresher writes the top 200 for each scope into the cache as one list. Readers never compute anything.</li>
</ol>
<p><b>Read path.</b> <code>GET /popular?scope=...</code> reads the cached top 200, filters out items the viewer cannot see (a batched permission check, as in the search chapter), and returns the first 20 with a cursor. The list holds 200, not 20, because filtering can remove many. If fewer than 20 survive, fetch the next 200 for that scope straight from the sorted set.</p>
<p><b>Hard problem 1: hot items.</b> A viral item receives a large share of events. Because the log is partitioned by item id one task could be overloaded; use the two-stage pattern (each task pre-aggregates, then a merge step sums partial totals per item), as in the stream chapter. <b>Hard problem 2: gaming and bias.</b> Count unique users, cap what any one user adds, and discount bots and the author's own actions. Normalize by audience when comparing scopes of very different sizes, or each scope is ranked only within itself, which is what this design does.</p>
<p><b>Staleness and cache.</b> A few minutes of staleness is fine for "popular". Refresh the cache in the background on a timer instead of letting the first reader after expiry compute it, which avoids a stampede. If the search system needs the score as a ranking boost, update that field in the index in bulk every few minutes, not on every event.</p>
<p><b>Exact windows.</b> For a "top this week" view that must be explainable, sum the 168 buckets with no decay. Same data, different scoring function.</p>`,
      tradeoffs: `<ul>
<li><b>Decayed score vs exact sliding window.</b> A decayed score is cheap, smooth and needs no window boundaries; an exact window is easier to explain ("views in the last 24 hours") but needs the buckets and has cliffs when old events drop out. Use decay for the default feed; flip to exact windows when users or auditors need the literal count.</li>
<li><b>Stream aggregation vs counter increments in a database.</b> Per-event increments are simple but cause hot rows and break under replay. A stream job with idempotent upserts costs more machinery and handles replays and hot items. Pick the stream job past a few thousand events a second.</li>
<li><b>Precomputed top list vs on-demand query.</b> Precomputing makes reads trivial and stale by a few minutes; on-demand is fresher but runs a sort per request. Precompute; flip only if the feed must be live to the second.</li>
<li><b>Filter at read time vs per-user lists.</b> Read-time filtering keeps one list per scope; per-user lists make each page exact but multiply storage by users. Filter at read time with an oversized candidate list.</li>
</ul>`,
      followups: [
        "How would you make the feed personalized without computing a ranking per user per request?",
        "A new item has no engagement yet. How does it ever get a chance to appear?",
        "How do you detect and discount a bot that likes and views the same items all day?",
        "An event arrives six hours late. Does it change the feed, and how would you correct the numbers afterwards?",
        "How would you A/B test two different weightings of views versus comments?",
      ],
      slips: `<ul>
<li>Doing <code>count(*)</code> over an events table on every request, or ranking in the database at read time.</li>
<li>Incrementing one counter row per item from every request, creating hot rows and double counting on retry.</li>
<li>Ignoring time: ranking by all-time counts, so old content never leaves the feed.</li>
<li>Counting every raw view, so one refreshing user or a bot can push an item to the top.</li>
<li>Forgetting permissions, then showing a title the viewer should not see; or filtering after taking only 20 candidates and returning an empty page.</li>
<li>No plan for one item that gets a large share of all events.</li>
<li>Updating a search index on every event instead of in periodic bulk batches.</li>
</ul>`,
    },
  },
];
