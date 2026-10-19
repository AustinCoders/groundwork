import type { CompanyQuestion } from "./types";

export const questions: CompanyQuestion[] = [
  {
    id: "zomato-live-order-tracking",
    company: "zomato",
    title: "Design live order tracking for a food delivery app",
    prompt:
      "Design the live tracking screen for a food delivery app: the customer sees the order status and the rider moving on a map. Assume 2 million orders a day, most of them in a two-hour dinner window, and riders on flaky mobile networks.",
    level: "level not stated",
    kind: "hld",
    evidence: "guide",
    sources: [
      {
        label: "What to expect in the Zomato system design interview (DesignGurus)",
        url: "https://www.designgurus.io/answers/detail/what-to-expect-in-the-zomato-system-design-interview",
        kind: "prep-guide",
        year: 2026,
      },
      {
        label: "Zomato interview process (TechPrep)",
        url: "https://www.techprep.app/companies/zomato",
        kind: "prep-guide",
        year: 2026,
      },
    ],
    chapters: [
      "sysdes-message-queues-async",
      "sysdes-sharding-partitioning",
      "sysdes-consistency-models",
      "sysdes-case-studies",
    ],
    answer: {
      ask: `<p>First questions: is tracking read-only for the customer, or does it also drive the rider app? How fresh must the dot be: every second, or every 5 seconds with smooth animation? Does one rider carry one order or several? What happens when a rider loses signal? Is the ETA part of this system, or does a routing service own it? Do we keep location history for disputes?</p>
<p>I would assume one order per rider, a 5-second ping, an ETA service we call but do not build, and short history kept for support. <b>In scope:</b> rider location ingest, order status, push to the customer, reconnect. <b>Out of scope:</b> rider assignment, route planning, the restaurant side and payments.</p>`,
      numbers: `<p>These are planning figures for the exercise, not facts about any company.</p>
<ul>
  <li><b>Orders:</b> 2 million a day. If 40% land in a two-hour window: 800,000 ÷ 7,200 s = about <b>111 orders a second</b>.</li>
  <li><b>Live orders:</b> assume an order lives 35 minutes (2,100 s) and the rider is moving for the last 25 (1,500 s). Riders on the road: 111 × 1,500 = <b>about 165,000</b>.</li>
  <li><b>Location writes:</b> a ping every 5 s from 165,000 riders is 165,000 ÷ 5 = <b>33,000 updates a second</b>, at 100 B each about 3.3 MB a second, or 3.3 MB × 7,200 s = 24 GB over the peak window.</li>
  <li><b>Viewers:</b> if half of those orders have the map open: 82,500 connections. At 20 KB each that is 1.65 GB, which fits in one gateway box; I run 3 for redundancy. Pushes: 82,500 ÷ 5 = 16,500 a second.</li>
  <li><b>ETA recompute:</b> every 30 s per rider is 165,000 ÷ 30 = 5,500 a second if done on a timer.</li>
</ul>
<p>33,000 location writes a second is more than six times the 5,000 committed writes a second planning figure, so pings must not go through the relational database. Only the last position matters, so an in-memory store with latest-wins semantics fits. Order status changes (111 orders a second times about 6 states is under 700 a second) belong in the database.</p>`,
      design: `<p><b>Components.</b> Rider app; an ingest gateway; a partitioned log; a tracking service; an in-memory store for the latest position; a push gateway (WebSocket or server-sent events) for customers; the order service with its relational database; and an ETA service.</p>
<p><b>Data model.</b></p>
<ul>
  <li>Order database: <code>orders(order_id, customer_id, rider_id, state, state_version)</code> with states placed, accepted, preparing, ready, picked up, delivered. This is the source of truth for status.</li>
  <li>Latest-position store: key <code>rider:{rider_id}</code>, value <code>(lat, lng, ts, seq)</code>, TTL 60 s. Sharded by rider id (hash), because every read and write names a rider.</li>
  <li>Location log: partitioned by <code>rider_id</code>, so one rider's pings stay in order. Retained a few days for support and replay.</li>
</ul>
<p><b>Write path: location.</b></p>
<ol>
  <li>The rider app batches pings and sends one every ~5 s, each with an increasing <code>seq</code> that survives an app restart (for example a boot counter plus a sequence number). Stationary riders ping less often.</li>
  <li>The ingest gateway authenticates, validates, and appends to the log. It never touches the order database.</li>
  <li>A tracking-service worker per partition applies the ping to the latest-position store only if <code>seq</code> is higher than the stored one, so late or duplicated pings are dropped.</li>
  <li>The worker looks up the rider's active order (a small local map fed by order events) and publishes to a pub/sub channel for that order.</li>
</ol>
<p><b>Read path: customer.</b> Opening the screen does two things in order: fetch a snapshot by REST (status, last position, its <code>seq</code>), then open a stream. The push gateway subscribes to the channel for each connected order and forwards messages. Status changes come from the order service through an outbox into the same channel, so the customer gets one stream carrying both. Pub/sub can drop a message without the connection closing, so each status message carries <code>state_version</code>; the client re-fetches the snapshot when it sees a gap or when no status has arrived for a minute.</p>
<p><b>ETA.</b> Do not re-route on every ping. Recompute on state change, on a 30 to 60 s timer, and when the rider drifts off the expected route. In between, the client counts down locally.</p>
<p><b>Hard problem 1: volume without a database.</b> Latest-wins plus a log gives cheap writes, replay, and no lock contention. Losing an in-memory shard loses at most seconds of data, because the next ping repopulates it.</p>
<p><b>Hard problem 2: flaky networks.</b> Mobile connections drop constantly. The client reconnects with its last <code>seq</code> and re-fetches the snapshot, so it never needs the missed stream. If a position is older than ~30 s, show "rider's location is updating" rather than a frozen dot that looks live. Interpolate between pings on the client for smooth movement.</p>
<p><b>Consistency.</b> Status needs read-your-writes: "delivered" must come from a committed row, never from a guess. Location may be seconds stale and is eventually consistent. The two share a stream but not a store.</p>
<p><b>Failure.</b> A gateway box dies: its clients reconnect to another and take a snapshot. A worker dies: its partition is reassigned and the next pings fix the state.</p>`,
      tradeoffs: `<ul>
  <li><b>Push stream vs polling.</b> Polling every 5 s from 82,500 viewers is 16,500 requests a second, stateless and simple. A stream costs connection state but sends only changes and feels live. Pick the stream for the map; keep polling as a fallback for bad networks and for the status-only screen. Flip to polling for a small audience or when the gateway fleet is the bottleneck.</li>
  <li><b>Latest-position store vs the database.</b> The store takes 33,000 writes a second easily but is not durable. Pick it because only the newest value matters. Flip to a database only for the slice that must be kept, such as sampled history for disputes.</li>
  <li><b>Fixed vs adaptive ping rate.</b> A fixed 5 s is predictable. An adaptive rate (faster near the customer or at a turn, slower when stationary) saves battery and writes. Start fixed; flip to adaptive when battery complaints or ingest cost show up.</li>
  <li><b>Fan-out by order channel vs by gateway.</b> Per-order channels are easy to reason about but create many subscriptions. Flip to partition-per-gateway routing when subscription count becomes the cost.</li>
</ul>`,
      followups: [
        "A rider's phone goes offline in a tunnel for two minutes and then sends 24 buffered pings at once. What does the customer see?",
        "How would you show several orders for a rider who carries two deliveries at once?",
        "How do you test this at 33,000 pings a second before the dinner rush?",
        "How would you keep a long-running customer stream alive through a deployment of the push gateway?",
        "How would you reduce battery drain on the rider app without making the map look stale?",
      ],
      slips: `<ul>
  <li>Writing every ping to the main order database. It is 33,000 writes a second against a primary that handles 5,000.</li>
  <li>Treating location and status as the same data. Status must be strongly consistent; location is a hint that can lag.</li>
  <li>No sequence number, so a late ping moves the dot backwards.</li>
  <li>Recomputing the ETA on every ping through a routing engine.</li>
  <li>Forgetting reconnect: a design that only works while the connection stays up.</li>
  <li>Showing a frozen position as if it were live when the rider has gone offline.</li>
  <li>Opening one connection per customer with no plan for a gateway restart, so every deployment drops thousands of live screens at once.</li>
</ul>`,
    },
  },
  {
    id: "cred-dropbox-file-storage",
    company: "cred",
    title: "Design a Dropbox-style file storage and sync service",
    prompt:
      "Design a service where users keep files in a folder that syncs across their laptop and phone. Assume 10 million users, files of a few MB, and edits from two devices that can happen offline. Large files should upload in pieces and resume after a drop.",
    level: "SDE-2",
    kind: "hld",
    evidence: "one",
    sources: [
      {
        label: "CRED SDE-2 Bangalore 2024 offer write-up (PapersAdda)",
        url: "https://papersadda.com/article/cred-sde2-bangalore-2024-payment-processor-offer/",
        kind: "candidate-report",
        year: 2024,
      },
    ],
    chapters: [
      "sysdes-storage-systems",
      "sysdes-consistency-models",
      "sysdes-databases-in-design",
      "sysdes-message-queues-async",
    ],
    answer: {
      ask: `<p>Questions first: is this one folder per user, or shared folders with permissions? Do we keep version history, and for how long? What is the largest file, and is the average closer to 100 KB or 100 MB? Must two devices see a change within seconds, or is a minute fine? Do we need end-to-end encryption, which rules out server-side dedup and previews? How should we handle two edits to the same file?</p>
<p>I would assume per-user folders, 30 days of version history, an average file of 2 MB with a long tail into gigabytes, a few seconds of sync delay, and encryption at rest handled by the platform. <b>In scope:</b> upload, download, sync, versions, conflicts, dedup. <b>Out of scope:</b> sharing, search, previews and billing.</p>`,
      numbers: `<p>These are planning figures for the exercise, not facts about any company.</p>
<ul>
  <li><b>Users:</b> 10 million, 20% active a day = 2 million. Each changes 5 files a day: 10 million file changes ÷ 86,400 s = about <b>120 a second</b>, 600 at a 5x peak.</li>
  <li><b>Bytes:</b> 10 million × 2 MB = 20 TB a day, which is 20,000,000 MB ÷ 86,400 = about 230 MB a second, or roughly 1.9 Gbit a second; the peak is about 9 Gbit a second. If dedup and sending only changed chunks save half, new storage is <b>10 TB a day</b>, which is 3.65 PB a year before replication.</li>
  <li><b>Chunks:</b> take 2 per change on average (most files fit in one 4 MB chunk, the long tail adds many), which is 20 million references a day; half are new, so 10 million chunk rows at about 100 B: 1 GB a day.</li>
  <li><b>Versions:</b> 10 million rows a day × 300 B = 3 GB a day, about 1.1 TB a year.</li>
  <li><b>Sync reads:</b> each active client asks for changes 50 times a day: 100 million ÷ 86,400 = 1,160, call it 1,200 a second; 6,000 at peak.</li>
  <li><b>Notification connections:</b> 2 million at 10 KB is 20 GB, or 4 to 8 gateway boxes.</li>
</ul>
<p>Two conclusions. Bytes must flow straight to object storage, never through the API servers. Metadata writes (600 a second at peak) and reads (6,000) fit one relational primary at first, but I shard by user from the start: it is the key every query uses, it is cheap to do early, and metadata grows by over a terabyte a year.</p>`,
      design: `<p><b>Components.</b> A desktop and mobile client with a local database; an API and metadata service; a metadata database; an object store for chunks; a notification service; a queue for async work (thumbnails, garbage collection, audit); and a background verifier.</p>
<p><b>Data model.</b></p>
<ul>
  <li><code>files(user_id, file_id, path, current_version, deleted)</code>, sharded by <code>user_id</code>.</li>
  <li><code>versions(file_id, version, base_version, chunk_list, size, device_id, mtime)</code>.</li>
  <li><code>chunks(user_id, hash, size, storage_key, ref_count)</code>, sharded by <code>user_id</code> like the rest, so a commit stays on one shard. Within a user the chunk key is the content hash, so uploads are idempotent by construction.</li>
  <li><code>journal(user_id, seq, file_id, version)</code>: a per-user append-only change log with an increasing <code>seq</code>. This is what devices sync from: "give me everything after cursor N".</li>
</ul>
<p><b>Upload path.</b></p>
<ol>
  <li>The client splits the file into chunks (4 MB here), hashes each, and asks the metadata service which hashes are missing.</li>
  <li>The service returns presigned upload URLs for the missing chunks only. The client uploads them in parallel; a failed chunk is retried alone, which gives resume for free.</li>
  <li>The client calls commit with the file id, the <code>base_version</code> it started from, and the chunk list.</li>
  <li>The service checks that every listed chunk exists in the object store and has a <code>chunks</code> row. Then, in one transaction: check <code>current_version = base_version</code>, raise the ref counts, insert the new version, bump the pointer, append to the journal, write an outbox row. If the base does not match, the commit is a conflict (below).</li>
</ol>
<p><b>Download and sync.</b> The outbox feeds the notification service, which pushes "cursor moved" to the user's other devices. They call the change feed with their last cursor, then fetch only chunks they lack through presigned download URLs. Chunks already on disk are reused, so a small edit costs one chunk.</p>
<p><b>Hard problem 1: conflicts.</b> Never overwrite silently and never trust timestamps (device clocks drift). With optimistic concurrency on <code>base_version</code>, the second writer's commit is rejected; the client saves its copy as a conflicted copy named with the device, and both versions remain. Users resolve them; auto-merge is only for formats we understand.</p>
<p><b>Hard problem 2: garbage collection.</b> Dedup means a chunk can be shared. Keep <code>ref_count</code> from committed versions, but delete only after a grace period and never a chunk uploaded in the last day, since its commit may be in flight. A weekly mark-and-sweep reconciles counts, because counters drift.</p>
<p><b>Fault tolerance.</b> Object storage replicates across zones; the metadata primary has a synchronous standby in a second zone. Ask the object store for a checksum on upload (check the current docs for what it supports); the verifier re-hashes a sample of chunks and flags mismatches, so corruption is caught before it is the only copy.</p>`,
      tradeoffs: `<ul>
  <li><b>Fixed-size vs content-defined chunking.</b> Fixed 4 MB chunks are simple, but inserting a byte near the start shifts every later chunk and kills dedup. Content-defined boundaries keep unchanged regions stable at the cost of more client CPU. Pick fixed for the first version; flip to content-defined when users edit large files in the middle.</li>
  <li><b>Global vs per-user dedup.</b> Global saves the most space, but answering "this hash exists" can reveal that someone else holds that file. Pick per-user dedup by default. Flip to global with a proof-of-possession step when storage cost dominates.</li>
  <li><b>Conflicted copy vs auto-merge.</b> A copy never loses data and needs no format knowledge. Merging is nicer for text but dangerous when wrong. Pick the copy; flip to merge for formats with a safe merge rule.</li>
  <li><b>Push vs poll for sync.</b> Push needs 4 to 8 gateway boxes for 2 million connections but gives seconds of delay. Polling every 30 s from 2 million clients is about 67,000 requests a second: stateless, but not cheaper, and slower. Pick push for desktop; on mobile in the background use the phone's own push service and poll when the app opens.</li>
</ul>`,
      followups: [
        "How does a client that was offline for a month catch up without downloading everything?",
        "A user deletes a folder with 100,000 files. How do you make that fast and also undoable?",
        "How would you add shared folders with permissions without breaking per-user sharding?",
        "How would you verify that a stored chunk has not silently rotted?",
        "How would you support end-to-end encryption, and what do you lose when you do?",
      ],
      slips: `<ul>
  <li>Sending file bytes through the API servers. They would carry roughly 1.9 Gbit a second on average and 9 at peak for no benefit.</li>
  <li>Whole-file uploads, so one dropped connection restarts a 2 GB transfer.</li>
  <li>Last-write-wins by timestamp, which loses edits when clocks differ.</li>
  <li>Deleting a chunk the moment its count hits zero, racing with an in-flight upload.</li>
  <li>Ignoring the change feed: asking every device to rescan the whole tree.</li>
  <li>Hand-waving dedup without saying what the key is.</li>
  <li>Putting the file tree in one table with no per-user cursor, so sync means a full comparison every time.</li>
  <li>Forgetting that deletes, renames and moves are also changes that must reach every device.</li>
</ul>`,
    },
  },
  {
    id: "groww-trade-order-pipeline",
    company: "groww",
    title: "Design an order pipeline that never loses or duplicates a trade",
    prompt:
      "Design the backend path of a stock-trading app from the moment a user taps buy to the confirmation. Assume 5 million orders a day with a heavy burst at market open, an external exchange link that can time out, and a rule that an order is never lost and never placed twice.",
    level: "level not stated",
    kind: "hld",
    evidence: "guide",
    sources: [
      {
        label: "Groww interview questions and process (Greenroom, 2026)",
        url: "https://usegreenroom.app/blog/groww-interview-questions",
        kind: "prep-guide",
        year: 2026,
      },
      {
        label: "Groww interview process round by round (DesignGurus)",
        url: "https://www.designgurus.io/answers/detail/what-is-the-groww-interview-process-like-round-by-round",
        kind: "prep-guide",
      },
    ],
    chapters: [
      "sysdes-walkthrough-payments",
      "sysdes-transactions-isolation",
      "sysdes-message-queues-async",
      "sysdes-time-ordering-ids",
    ],
    answer: {
      ask: `<p>Questions first: are we the broker (we own the customer, the funds check and the link to the exchange), or the exchange itself? What does the exchange give us: a reference we choose, a way to query an order by that reference, and an event stream of acknowledgements and fills? What order types matter: market and limit only, or modifications and cancels as well? Where does the money check happen? What is the tolerated delay between tap and exchange?</p>
<p>I would assume we are the broker, the exchange accepts a client reference and lets us query by it (check the real exchange's documentation, the design must degrade safely if it does not), and we support place, cancel and fills. <b>In scope:</b> order intake, funds check, send, confirmations, positions. <b>Out of scope:</b> market data, charts, margin models and regulatory reporting.</p>`,
      numbers: `<p>These are planning figures for the exercise, not facts about any company.</p>
<ul>
  <li><b>Orders:</b> 5 million a day. If 20% arrive in the first 15 minutes (900 s): 1,000,000 ÷ 900 = about <b>1,100 orders a second</b>. A market-moving event might triple it: 3,300 a second.</li>
  <li><b>Commits per order:</b> accepted, SENDING, SENT, acknowledged, filled: about 5. At the normal burst, 1,100 × 5 = 5,500 commits a second, already above the 5,000 budget of one primary. At the 3x event: 3,300 × 5 = <b>16,500 a second</b>, which needs at least 4 primaries; I plan 6 shards for headroom.</li>
  <li><b>Event log:</b> about 5 events × 200 B = 1 KB per order; 5 million × 1 KB = 5 GB a day, trivial to retain.</li>
  <li><b>Reads:</b> 2 million users opening the orders and positions screens 20 times in a 6-hour session (21,600 s): 40 million ÷ 21,600 = 1,850 a second, 9,300 at 5x. Below the 20,000 read planning figure, so reads are not what forces the design.</li>
</ul>
<p>Writes force the shard. Correctness forces the rest: an order must be durable before we tell the user anything, and sending it out must be a step we can safely re-examine after a crash. The exchange link also has its own rate ceiling, so the outbound side is a throttled queue.</p>`,
      design: `<p><b>Components.</b> API gateway; order service with a sharded relational database; funds service; a durable log; an exchange gateway holding the session to the exchange; an order-state consumer; positions and ledger; a reconciliation job.</p>
<p><b>Data model (per account shard).</b></p>
<ul>
  <li><code>orders(order_id, account_id, idem_key, instrument, side, qty, price, state, filled_qty, exch_ref)</code> with a unique index on <code>(account_id, idem_key)</code>.</li>
  <li><code>order_events(order_id, exec_id, type, qty, price, ts)</code>, unique on <code>(order_id, exec_id)</code>. Append-only.</li>
  <li><code>funds(account_id, available, blocked)</code>.</li>
</ul>
<p><b>Intake path.</b></p>
<ol>
  <li>The client generates an <code>idem_key</code> once per order intent and reuses it on every retry.</li>
  <li>One local transaction on the account's shard: insert the order (a duplicate key returns the existing order), block the funds with a conditional update (<code>available &gt;= amount</code>), write an outbox row. Commit.</li>
  <li>Only after commit do we say "order received". An order we have acknowledged therefore cannot vanish.</li>
</ol>
<p><b>Send path.</b> The outbox relay appends to a log partitioned by account id, so a cancel never overtakes the place it follows. The exchange gateway consumes, marks the order SENDING in the database, sends with the order id as the client reference, then records SENT. Throughput is limited to what the exchange allows; at market open the queue grows and orders wait, they are not dropped.</p>
<p><b>Confirmation path.</b> Exchange messages (ack, partial fill, fill, reject, cancel) are first appended raw to a log, then applied by the state consumer. Each application is idempotent on <code>(order_id, exec_id)</code>, and the state moves forward only: a conditional update allows the transition. A fill arriving before the ack is accepted. <code>filled_qty</code> is the sum of distinct fills, so a replayed message changes nothing. Fills update positions and release or convert the blocked funds, with ledger lines posted through an outbox.</p>
<p><b>Hard problem 1: the crash between "send" and "recorded".</b> If the gateway dies in SENDING, we do not know whether the exchange saw the order. Never resend blindly. On recovery, query the exchange by client reference: if it knows the order, adopt its state; if it does not, resend is safe, provided the exchange rejects a repeated client reference (otherwise wait out a safe window before resending). If the exchange cannot answer, the order goes to UNKNOWN and an operator resolves it. The same applies to a timeout.</p>
<p><b>Hard problem 2: duplicates from the user.</b> A double tap carries the same key and returns the same order. A retry after an app crash first lists recent orders by key. A soft warning for an identical order within a minute helps humans but is not the safety mechanism.</p>
<p><b>Reconciliation.</b> Throughout the day and after close, compare our orders and fills with the exchange's records. A mismatch opens a break for operators. Positions are derived from fills, so they can be recomputed.</p>`,
      tradeoffs: `<ul>
  <li><b>Outbox plus log vs a direct call to the exchange from the request.</b> The direct call is simpler and faster at low load, but a crash or timeout leaves no durable intent. Pick the outbox and log; flip to a synchronous call only for flows that need a very low and fixed latency, and keep the durable write first.</li>
  <li><b>Shard by account vs by instrument.</b> Account keeps funds, orders and positions in one shard, so intake is a single-shard transaction. Instrument spreads hot stocks but makes funds checks cross-shard. Pick account; flip to a separate matching layer only if we ran the exchange.</li>
  <li><b>Block funds at intake vs check at fill.</b> Blocking at intake prevents overspending but ties up cash for unfilled orders. Pick blocking; flip to a margin model for products where partial coverage is allowed.</li>
  <li><b>UNKNOWN state with an operator vs automatic resolution.</b> Automatic query-then-decide handles almost everything. Pick it, and keep the manual state for the rest, because a wrong automatic guess costs real money.</li>
</ul>`,
      followups: [
        "The exchange session drops for ten seconds at market open with 10,000 orders queued. What happens to them?",
        "A user cancels an order while it is still in your queue. How do you make sure it is never sent?",
        "A fill message arrives twice, and once out of order. Walk through what the consumer does.",
        "How would you rebuild positions after a bug that applied some fills twice?",
        "How do you test the crash between SENDING and SENT?",
      ],
      slips: `<ul>
  <li>Acknowledging the user before the order is durable.</li>
  <li>Resending on a timeout without asking the exchange what it already has. That is how duplicates happen.</li>
  <li>An idempotency key generated on the server per request, so a retry gets a new key.</li>
  <li>State updates that overwrite instead of moving forward, so a late message regresses an order.</li>
  <li>Treating the exchange as exactly-once. Assume at-least-once messages and dedupe on the execution id.</li>
  <li>No reconciliation, so quiet drift between our book and the exchange's goes unnoticed.</li>
  <li>Blocking funds in application memory instead of in the same transaction as the order, so two quick orders spend the same cash.</li>
</ul>`,
    },
  },
  {
    id: "paytm-upi-payment-flow",
    company: "paytm",
    title: "Design an end-to-end UPI-style payment flow",
    prompt:
      "Design the flow when a user pays another person from a mobile app using a payment address, with a central switch connecting the banks. Assume 10 million payments a day, a bank that sometimes answers slowly or not at all, and a rule that money is never debited twice or lost.",
    level: "SDE-2 and senior",
    kind: "hld",
    evidence: "guide",
    sources: [
      {
        label: "Paytm interview process (TechPrep, 2026)",
        url: "https://www.techprep.app/blog/paytm-interview-process",
        kind: "prep-guide",
        year: 2026,
      },
      {
        label: "Paytm interview questions and experience (PlacementPreparation, Oct 2025)",
        url: "https://www.placementpreparation.io/blog/paytm-interview-questions-and-experience/",
        kind: "prep-guide",
        year: 2025,
      },
    ],
    chapters: [
      "sysdes-walkthrough-payments",
      "sysdes-transactions-isolation",
      "sysdes-fault-tolerance",
      "sysdes-security-basics",
    ],
    answer: {
      ask: `<p>First, whose backend are we building: the payer's app, the central switch, or a bank? The answer changes everything. Do we hold the customer's balance (a wallet), or does the money sit only in bank accounts? What does the switch give us: a synchronous accept, a later callback, a status query by reference? How is the user authenticated, and who sees the secret PIN? What is the failure the business fears most: a double debit, a lost credit, or a wrong "failed" screen?</p>
<p>I would assume we are the payer's app backend, money stays in the banks, the switch accepts a request, returns a pending state and calls back, and we can query by our reference. This is a generic design; check the real scheme's rules before relying on any detail. <b>In scope:</b> payee lookup, payment creation, submit, async result, status, receipts, reconciliation. <b>Out of scope:</b> bank internals, disputes, onboarding and KYC.</p>`,
      numbers: `<p>These are planning figures for the exercise, not facts about any company.</p>
<ul>
  <li><b>Volume:</b> 10 million payments a day ÷ 86,400 s = about <b>116 a second</b>. A salary day or festival at 10x: about 1,200 a second.</li>
  <li><b>Commits:</b> about 4 per payment (created, submitted, result applied, receipt outbox): 1,200 × 4 = 4,800 commits a second at the peak. That is just under the 5,000 figure for one primary, with no headroom. I shard by payer from the start and plan 4 shards.</li>
  <li><b>In flight:</b> if the switch usually answers within 5 s: 1,200 × 5 = <b>6,000 payments in flight</b> at the peak.</li>
  <li><b>Status reads:</b> about 3 polls per payment: 3,600 a second. Easy, and push can replace most of them.</li>
  <li><b>Retries:</b> if the app, our backend and the gateway each retry 3 times, a struggling bank sees 3 × 3 × 3 = 27x: 1,200 × 27 = 32,400 requests a second. Retry at one layer only.</li>
  <li><b>Storage:</b> 10 million × 1 KB of payment row plus state log = 10 GB a day, 3.65 TB a year. Idempotency records: 10 million × 0.5 KB = 5 GB a day; kept 7 days, 35 GB.</li>
</ul>`,
      design: `<p><b>Components.</b> Mobile app with a secure input component; API gateway; payment service with sharded relational storage; a switch adapter (signing, mutual TLS, retries); a callback receiver; a status checker; a fraud and limits service; a notification service; and a reconciliation job.</p>
<p><b>Data model.</b></p>
<ul>
  <li><code>payments(payment_id, payer_id, payee_address, amount, state, switch_ref, idem_key, created_at)</code> with a unique index on <code>(payer_id, idem_key)</code>. The <code>switch_ref</code> is the end-to-end reference we generate and send to every party; it encodes the shard, so a callback finds its row without a lookup table.</li>
  <li><code>payment_events(payment_id, event_id, type, ts)</code>: append-only audit trail, unique on <code>(payment_id, event_id)</code>.</li>
  <li>States: CREATED, SUBMITTED, SUCCESS, FAILED, UNCERTAIN. Transitions only move forward.</li>
</ul>
<p><b>Flow.</b></p>
<ol>
  <li><b>Resolve the payee.</b> The app asks the switch to resolve the payment address and shows the verified name for confirmation.</li>
  <li><b>Authorise.</b> The user enters the PIN in a secure component that encrypts it on the device for the bank. Our servers never see it in the clear; the device and session are bound and tokens are short-lived.</li>
  <li><b>Create.</b> The app sends the payment with an <code>idem_key</code> made once per intent. One transaction checks limits and velocity, inserts the row in CREATED, and writes an outbox row. A repeated key returns the existing payment.</li>
  <li><b>Submit.</b> The adapter signs and sends the request with <code>switch_ref</code>, a timeout, and one retry layer. The row moves to SUBMITTED just before the send, so a crash after the send leaves a row the status checker will find.</li>
  <li><b>Result.</b> The switch returns pending or final. Final results arrive by callback: verify the signature, dedupe on the event id, and apply with a conditional update that only moves forward. The payment event and the receipt outbox row commit together.</li>
  <li><b>Tell the user.</b> A push and a status endpoint; the app shows "processing" until the row is final.</li>
</ol>
<p><b>Hard problem 1: the unknown outcome.</b> A timeout means we do not know whether the bank debited. Never show "failed" and never let the user pay again as a fresh payment. Mark UNCERTAIN, show "we are checking", and let the status checker query the switch by <code>switch_ref</code> with backoff (it also scans SUBMITTED rows that have been quiet too long) until a final answer arrives. A payment stuck for too long goes to an operator queue.</p>
<p><b>Hard problem 2: duplicates at every hop.</b> The chain is: client key, our unique index, the reference sent to the switch, and the callback event id. Each layer must be safe to see the same message twice. The payments walkthrough covers this chain in detail.</p>
<p><b>Hard problem 3: partial failure.</b> If the debit happened but the credit did not, the switch and banks run a reversal. We accept the reversal event, move the payment to FAILED with a reversed note, and tell the user the money is going back, without promising a timeline we do not control.</p>
<p><b>Reconciliation.</b> Daily, compare our payments with the switch's settlement reports and, where available, bank records, keyed by <code>switch_ref</code>. Differences become tickets, not silent fixes.</p>
<p><b>Security.</b> TLS everywhere, signed messages to the switch, per-user velocity limits, a fraud score before submit, and logs with no secrets or full account numbers.</p>`,
      tradeoffs: `<ul>
  <li><b>Wait for the final result vs return pending at once.</b> Holding the request open for the bank gives a simple client but ties up threads and hides slow banks. Pick returning pending quickly and delivering the result by push with a polling fallback. Flip to a short synchronous wait only for tiny flows where the p99 is well under a second.</li>
  <li><b>Fraud check inline vs after submit.</b> Inline blocks bad payments before money moves but adds latency and a dependency. After-the-fact is cheaper and misses the damage. Pick inline with a tight timeout; if the fraud service is down, fail closed for large amounts and open for small ones, with a limit.</li>
  <li><b>Shard by payer vs by payment id.</b> Payer keeps history, limits and velocity checks on one shard. Payment id spreads load evenly but makes those checks cross-shard. Pick payer, and encode the shard in the reference so callbacks route directly. Flip when one payer's volume becomes a hot key (a merchant).</li>
  <li><b>Retry in one layer vs several.</b> One layer, the one that owns the idempotency key; several layers give 27x amplification against an already struggling bank.</li>
</ul>`,
      followups: [
        "The switch callback never arrives for 3,000 payments. How does the system recover, and how fast?",
        "A user pays the same person the same amount twice in a minute on purpose. How do you tell this from a retry?",
        "How would you handle a callback that arrives before the submit call returns?",
        "What changes if we also hold a wallet balance in addition to bank accounts?",
        "How would you design the collect-request flow, where the payee asks and the payer approves?",
      ],
      slips: `<ul>
  <li>Showing "failed" after a timeout and letting the user retry as a new payment. This is how double debits happen.</li>
  <li>Retrying at the app, the backend and the gateway at once, which turns 1,200 a second into 32,400.</li>
  <li>No end-to-end reference, so there is nothing to query or reconcile on.</li>
  <li>Applying callbacks without dedupe or a forward-only check, so a late duplicate flips a final state.</li>
  <li>Designing a ledger of the money itself when the banks own the money. Keep our own record and reconcile.</li>
  <li>Storing the PIN, or logging it, or never saying where it is decrypted.</li>
</ul>`,
    },
  },
];
