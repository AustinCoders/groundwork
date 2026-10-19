import type { CompanyQuestion } from "./types";

export const questions: CompanyQuestion[] = [
  {
    id: "amazon-food-ordering",
    company: "amazon",
    title: "Design a food ordering and delivery platform",
    prompt:
      "Design an online food ordering and delivery platform where customers search nearby restaurants, place an order with online payment, and track a courier on a map. Assume a dinner-time peak, restaurants that must confirm each order, and couriers who report their location every few seconds.",
    level: "SDE-2 / L5",
    kind: "hld",
    evidence: "several",
    sources: [
      {
        label: "Roundz: Amazon SDE-2 (L5) interview experience, March 2025",
        url: "https://roundz.substack.com/p/interview-experience-55-amazon-sde2-l5",
        kind: "candidate-report",
        year: 2025,
      },
      {
        label: "GeeksforGeeks: Amazon SDE-2 interview experience",
        url: "https://www.geeksforgeeks.org/?p=282393",
        kind: "candidate-report",
        year: 2025,
      },
      {
        label: "Roundz: Amazon SDE-2 (L5) interview experience, May 2025",
        url: "https://roundz.substack.com/p/interview-experience-amazon-sde-2-l5",
        kind: "candidate-report",
        year: 2025,
      },
    ],
    chapters: [
      "sysdes-walkthrough-medium",
      "sysdes-databases-in-design",
      "sysdes-message-queues-async",
      "sysdes-search-systems",
      "sysdes-sharding-partitioning",
    ],
    answer: {
      ask: `<p>Questions I would ask before drawing anything. Which actors are in scope: customers, restaurants, couriers, or all three? Does the platform employ the couriers or do restaurants deliver themselves? How many cities, and what is the peak order rate? Is payment taken online at order time? Must a restaurant confirm every order, and what should happen if it stays silent? How fresh must "open now" and "sold out" be in search results?</p>
<p>Scope I will assume: search and menu browsing, order placement with online payment, restaurant confirmation, courier assignment, live tracking and status notifications. Out of scope: ratings, loyalty programs, restaurant onboarding, restaurant payouts, fraud scoring.</p>`,
      numbers: `<p>These are planning figures for the exercise, not facts about any company.</p>
<ul>
  <li><b>Orders:</b> 2 million a day is 2,000,000 ÷ 86,400, about 23 a second; plan for a 10x meal-time peak of about 230 a second.</li>
  <li><b>Order writes:</b> about 10 rows an order, so 230 × 10 = 2,300 writes a second: under the 5,000 one primary handles, with only about 2x headroom.</li>
  <li><b>Browse reads:</b> 20 million sessions × 20 reads = 400 million a day, 400,000,000 ÷ 86,400 = about 4,600 a second, and a 5x peak is about 23,000. That is past 20,000, so menus and lists come from a cache and a search index.</li>
  <li><b>Courier pings:</b> 100,000 couriers online at peak, one location every 5 s: 100,000 ÷ 5 = 20,000 writes a second, 4x the 5,000 write line, so locations stay out of the relational store. Latest positions: 100,000 × 100 B = 10 MB.</li>
  <li><b>Tracking connections:</b> orders in flight = 230 × 2,400 s (40 minutes) = 552,000. At 10 to 50 KB each that is 5.5 to 28 GB; a gateway box holds 250k to 500k connections, so run about 6 for headroom.</li>
</ul>
<p>The numbers force: partition orders for headroom, cache and index browse, and give courier locations an in-memory path.</p>`,
      design: `<p>Services first, then the two paths, then the hard problems.</p>
<ol>
  <li><b>Catalog and search.</b> Restaurants and menus live in a relational store (restaurant id, location, opening hours, menu items with price and an <code>available</code> flag). Change events feed a search index (inverted index plus a geo filter) that answers "open restaurants that deliver to this point and match this text". Index refresh runs seconds behind, so the live "open" and "sold out" flags come from a cache overlay the restaurant service writes directly. The order service re-checks both at placement.</li>
  <li><b>Order service.</b> Owns the state machine. Tables: <code>orders(order_id, customer_id, restaurant_id, state, version, total_minor)</code>, <code>order_items</code> with name and price copied at order time so later menu edits cannot change an old order, and an append-only <code>order_events(order_id, seq, state, at)</code>. Shard key is <code>customer_id</code>, because "my orders" is the common read. The restaurant's own order list is a read model built from order events.</li>
  <li><b>Payment service</b> authorises (holds) at placement and captures on pickup or delivery.</li>
  <li><b>Restaurant gateway</b> pushes the order to the restaurant's device and falls back to polling.</li>
  <li><b>Dispatch and location service</b> keeps the latest courier positions in an in-memory geo store keyed by grid cell.</li>
  <li><b>Tracking gateway</b> holds the customer connections.</li>
</ol>
<p><b>Write path.</b> The client generates an idempotency key and sends the order. A unique constraint on <code>(customer_id, idempotency_key)</code> makes a retry return the same order. The service validates (restaurant open, items available, prices match, address in range) and, in one transaction, inserts the order in state <code>CREATED</code> plus an outbox row. A relay publishes <code>order.created</code> to a queue. The payment service places a hold using the same key and emits the result. On success the order moves to <code>AWAITING_RESTAURANT</code>. If the restaurant does not accept within a window (say 3 minutes) a delayed job cancels the order and releases the hold. Every transition is a conditional update, <code>WHERE state = expected AND version = n</code>, so duplicate or stale events are no-ops. Consumers are idempotent, as in the queues chapter.</p>
<p><b>Dispatch.</b> When the restaurant accepts with a preparation time, dispatch starts searching so a courier arrives about when the food is ready, not minutes before. Couriers ping every 5 s; each ping overwrites that courier's entry with a 30 s TTL, so an offline courier disappears by itself. A query reads the cell around the restaurant plus its neighbours, ranks candidates by estimated travel time, and offers the job to the best one with a 15 s timeout. To stop two orders offering the same courier, the courier record is changed with a compare-and-set, <code>available</code> to <code>offered</code>, so only one offer can win.</p>
<p><b>Tracking.</b> The customer app holds an event stream (server-sent events or a WebSocket) to the gateway, which subscribes to the order's courier channel and forwards a position every 10 s. If the stream drops, the app polls the order endpoint.</p>
<p><b>Hard problem 1: agreement across payment, restaurant and courier without a distributed transaction.</b> Use a saga with an outbox (see the transactions chapter): each step commits locally, each failure has a compensation (void the hold, notify the customer), and timeouts are first-class transitions driven by delayed jobs rather than hope.</p>
<p><b>Hard problem 2: dinner demand beyond courier supply.</b> Accepting orders nobody can deliver is worse than refusing them. Use admission control per zone and per restaurant: a cap on concurrent open orders, fed by current courier supply, shown to customers as a longer estimate, a higher fee or a "busy" label.</p>`,
      tradeoffs: `<ul>
  <li><b>Authorise then capture vs charge at placement.</b> Authorise-then-capture lets you release the money cleanly when a restaurant rejects or a courier is never found, at the cost of a second payment call and hold expiry handling. Charging up front is simpler but turns every cancellation into a refund. Pick authorise-then-capture; flip to charge-up-front when a payment method does not support holds.</li>
  <li><b>Relational orders vs a key-value store.</b> Order, items and outbox rows commit together, which is what a relational primary gives you for free. Pick relational, sharded by customer. Flip to a key-value store when one shard's writes stay past about 5,000 a second and you have already split by city.</li>
  <li><b>Central matching vs offers to a courier pool.</b> A dispatcher that offers to the single best courier optimises each trip but takes longer when couriers decline. Offering to the top three at once is faster and wastes offers. Pick one at a time with a short timeout; flip to multi-offer in thin supply, where waiting costs more than a wasted offer.</li>
  <li><b>Pushed tracking vs polling.</b> Pushing every 10 s costs held connections (552,000 at peak) but feels live. Polling is stateless and cheap to run but multiplies requests. Pick push with polling as fallback; flip to polling only for the pre-pickup stage, when nothing moves.</li>
</ul>`,
      followups: [
        "The restaurant's tablet goes offline right after accepting an order. What does the system do, and what does the customer see?",
        "A courier's phone loses signal mid-delivery. How do tracking, the estimate and the payout cope?",
        "Demand doubles in one neighbourhood at 8 p.m. while supply stays flat. What do you change and in what order?",
        "How would you add scheduled orders for tomorrow's lunch without breaking the peak-time design?",
        "A customer reports one item missing from a delivered order. How do you model and process the partial refund?",
      ],
      slips: `<ul>
  <li><b>One database for everything.</b> Putting 20,000 location writes a second and 23,000 browse reads a second next to the orders table. The arithmetic rules this out in a minute.</li>
  <li><b>Skipping the idempotency key.</b> A double tap or a retry after a timeout creates two orders and two charges.</li>
  <li><b>Treating a restaurant as always responsive.</b> No acceptance timeout means a paid order sits forever.</li>
  <li><b>Updating menu prices in place.</b> An old order then shows today's price.</li>
  <li><b>Leaving assignment races unanswered.</b> Two orders offered to one courier, with no compare-and-set.</li>
  <li><b>Drawing a distributed transaction</b> across payment, restaurant and dispatch instead of a saga with timeouts.</li>
  <li><b>Never mentioning overload,</b> so supply shortage shows up as late deliveries.</li>
  <li><b>Polling for courier positions</b> every second from every customer, with no estimate of connection or request counts.</li>
</ul>`,
    },
  },
  {
    id: "amazon-toll-fare-streaming",
    company: "amazon",
    title: "Design a toll fare system with Kafka streaming",
    prompt:
      "Design a toll fare system where roadside gantries read vehicle tags, a Kafka-based streaming pipeline pairs entry and exit reads into trips, prices each trip by distance, vehicle class and time of day, and charges the account. Reads can arrive late, duplicated or out of order, and nobody may be charged twice.",
    level: "SDE-2 / L5",
    kind: "hld",
    evidence: "one",
    sources: [
      {
        label: "Roundz: Amazon SDE-2 (L5) interview experience, round 3",
        url: "https://roundz.substack.com/p/interview-experience-amazon-sde2-l5",
        kind: "candidate-report",
        year: 2025,
      },
    ],
    chapters: ["sysdes-batch-stream-processing", "sysdes-message-queues-async", "sysdes-storage-engines"],
    answer: {
      ask: `<p>Questions first. Is the road a closed system (a read at entry and a read at exit, fare by distance) or are there flat charges at single points, or both? How is a vehicle identified: a radio tag, a camera plate read, or both? Do customers prepay a balance or get invoiced? How late can a read arrive, for example after a gantry loses its uplink? Who handles disputes, and what evidence must we keep? Roughly how many gantries and reads a day?</p>
<p>Scope I will assume: closed system with entry and exit gantries plus a few flat-rate points; the tag is primary and a camera read is a lower-confidence fallback sent to review; prepaid wallets and postpaid invoices share one ledger. Out of scope: gateway integration with banks, roadside hardware, enforcement against vehicles with no tag.</p>`,
      numbers: `<p>Planning figures for the exercise, not facts about any operator.</p>
<ul>
  <li><b>Reads:</b> 10 million tag reads a day, 10 × 12 = about 120 a second on average, and a 5x rush-hour peak is about 600 a second.</li>
  <li><b>Bytes:</b> at 200 B a read, peak is 600 × 200 B = 120 KB a second; a day is 2 GB, a year about 730 GB. Small.</li>
  <li><b>Trips:</b> two reads make one trip, so 5 million fares a day, 5 × 12 = about 60 a second, 300 a second at peak.</li>
  <li><b>Ledger writes:</b> 300 a second is far below the 5,000 one primary takes.</li>
  <li><b>Open trips (state):</b> entries per second × trip time = 300 × 1,800 s (30 minutes) = 540,000 trips in flight at peak. At 200 B each that is 108 MB of state, which fits in memory.</li>
  <li><b>Outage replay:</b> a 2-hour uplink loss leaves 10,000,000 × 2 ÷ 24 = about 833,000 reads; draining 5,000 a second takes about 167 s.</li>
</ul>
<p>The unusual conclusion: throughput does not justify Kafka. Ordering per vehicle, replay, buffering through outages and decoupling the ledger do. A topic of 12 partitions (about 50 reads a second each at peak) is plenty.</p>`,
      design: `<ol>
  <li><b>Edge.</b> Each gantry stores every read on local disk before sending (store and forward), stamping a read id made of <code>gantry_id</code>, an epoch and a local sequence number, and an event time from a clock synced by NTP. It uploads in batches and deletes only after an acknowledgement. This is where duplicates and lateness come from, so they are designed in.</li>
  <li><b>Ingest.</b> A thin API validates and produces to the topic <code>tag-reads</code>, keyed by <code>tag_id</code> (plate for camera reads, flagged low confidence). The key keeps all of a vehicle's reads in one partition, in order, in front of one consumer. Keying by gantry would instead put a busy gantry on one hot partition and scatter a vehicle's trip across consumers. Retention is 7 days, and a copy goes to object storage for reprocessing and audit.</li>
  <li><b>Trip builder (stateful stream job, for example Kafka Streams or Flink).</b> State per vehicle: the open entry (gantry, event time, read id). An exit read looks up the entry and emits a trip. An exit with no entry waits for a bounded time (say 6 hours) in case the entry arrives late; after that it becomes a "missing entry" trip billed by a documented rule and flagged. An entry with no exit for more than 24 hours becomes a "missing exit" case. The state store has a changelog topic, so a restart rebuilds it.</li>
  <li><b>Rating.</b> A pure function from (entry gantry, exit gantry, vehicle class, event times, tariff version) to a fare in minor units. Tariffs are versioned with effective times, and the trip row stores <code>tariff_version</code>, so a price change at midnight never reprices old trips and a replay gives the same answer.</li>
  <li><b>Ledger.</b> Fares go to topic <code>fares</code>, then a writer inserts into <code>ledger_entries(account_id, trip_id, type, revision, amount_minor, created_at)</code> with a unique key on <code>(trip_id, type, revision)</code>. The trip id is a deterministic hash of tag id and entry read id (the exit read id for a missing-entry trip). Unique plus <code>ON CONFLICT DO NOTHING</code> makes the write idempotent, which is how a crash and replay cannot double-charge. The balance is derived from entries, and corrections are new adjustment rows, never edits.</li>
  <li><b>Reconciliation.</b> A nightly batch recomputes fares from the archived raw reads and compares them with the ledger. Differences go to a review queue. This is the safety net behind the stream job.</li>
</ol>
<p><b>Duplicates.</b> Three layers, cheapest first: the gantry's own sequence numbers; the stream job's dedupe store keyed by read id with a 7-day TTL; and the unique trip id in the ledger. Any layer may fail and the next still holds. Exactly-once inside Kafka (transactional produce and consume) helps the topic-to-topic hops, but the final database write is an external side effect, so it relies on the unique key.</p>
<p><b>Late and out-of-order reads.</b> Use event time, not arrival time, for pairing and for choosing the tariff. Within one vehicle, a late entry is matched to a waiting exit. If a trip was already closed with the default rule and the real read arrives afterwards, emit a corrected fare and an adjustment entry, and tell the customer. There is no fixed window to close here, so the bounded waits above play the role of a watermark: they trade how long a fare is delayed against how often it is corrected.</p>`,
      tradeoffs: `<ul>
  <li><b>Stream processing vs a nightly batch.</b> Streaming lets a customer see a fare within seconds and lets the wallet block on a low balance. A nightly batch is simpler and cheaper to operate. Pick streaming, with the batch kept as the reconciler; flip to batch only if billing is monthly and nobody needs the balance in real time.</li>
  <li><b>Kafka transactions vs an idempotent sink.</b> Transactions give atomic read-process-write inside Kafka but stop at the database. A unique trip id works for every sink and every replay. Pick the idempotent sink; add transactions as well only if duplicates on the intermediate topic are expensive.</li>
  <li><b>Local state vs a database lookup per read.</b> Local state with a changelog is fast (no network hop per read) and sized at about 108 MB. A shared database lookup is simpler to inspect. Pick local state; flip to the database if state grows past what a node can hold or you need ad hoc queries on open trips.</li>
  <li><b>Wait longer vs bill sooner.</b> A long wait for a missing read gives fewer corrections but delays charges. A short one bills fast and corrects often. Pick a bounded wait of hours; flip shorter if disputes are rare and cash flow matters.</li>
</ul>`,
      followups: [
        "A gantry's clock drifts by 90 seconds. What breaks, and how do you detect and correct it?",
        "A vehicle's entry read is missing entirely. How is it billed, and how does a customer dispute it?",
        "The tariff changes at midnight and a trip straddles it. Which price applies and how do you prove it?",
        "A consumer rebalance happens mid-batch. Walk through why nobody is charged twice.",
        "Camera reads misread plates about 1% of the time. How do you keep wrong accounts from being charged?",
      ],
      slips: `<ul>
  <li><b>Justifying Kafka by volume.</b> 600 reads a second is tiny. Say the real reasons: ordering, replay, buffering and decoupling.</li>
  <li><b>Partitioning by gantry</b> so a vehicle's two reads land on different consumers.</li>
  <li><b>Using arrival time</b> for pairing and for the tariff.</li>
  <li><b>Claiming exactly-once end to end.</b> The database write is an external effect; say what makes it idempotent.</li>
  <li><b>Editing ledger rows</b> instead of appending adjustments.</li>
  <li><b>Forgetting missing reads.</b> Real roads lose reads, so unmatched entries and exits need an explicit rule.</li>
  <li><b>No reconciliation job,</b> so a stream bug is found by customers.</li>
  <li><b>Ignoring clock skew</b> between gantries, so event times from different gantries cannot be compared.</li>
  <li><b>Hiding the tariff version,</b> so a replay after a price change gives different fares.</li>
</ul>`,
    },
  },
  {
    id: "uber-ride-hailing-dispatch",
    company: "uber",
    title: "Design a ride-hailing dispatch system with surge pricing",
    prompt:
      "Design a ride-hailing dispatch system: a rider requests a trip, the system finds a nearby available driver and offers the trip, and the price rises with a surge multiplier where demand exceeds supply. Assume hundreds of thousands of drivers online at peak, each reporting a location every few seconds.",
    level: "level not stated",
    kind: "hld",
    evidence: "guide",
    sources: [
      {
        label: "TechInterview.org: Uber software engineer interview",
        url: "https://techinterview.org/uber-software-engineer-interview/",
        kind: "prep-guide",
        year: 2026,
      },
      {
        label: "Jobright: Uber technical interview questions guide",
        url: "https://jobright.ai/blog/uber-technical-interview-questions-complete-guide-2026/",
        kind: "prep-guide",
        year: 2026,
      },
      {
        label: "System Design Handbook: Uber system design interview",
        url: "https://www.systemdesignhandbook.com/guides/uber-system-design-interview/",
        kind: "prep-guide",
      },
    ],
    chapters: [
      "sysdes-sharding-partitioning",
      "sysdes-case-studies",
      "sysdes-message-queues-async",
      "sysdes-consistency-models",
    ],
    answer: {
      ask: `<p>Questions first. One city or many? Which products: solo rides only, or pooled rides and scheduled rides too? How often do drivers report a location, and how stale may a position be before we ignore it? Is surge a rider-visible multiplier quoted before the request? Is there a regulatory cap on it? What should the rider see while waiting: the nearest cars on a map, an estimate, or only a spinner?</p>
<p>Scope I will assume: solo rides, one request at a time per rider, per-area surge shown as a quote before confirmation, drivers pinging every 4 seconds. Out of scope: pooling, payments, driver payouts, map routing internals (I treat the estimate service as a black box that returns travel time).</p>`,
      numbers: `<p>Planning figures for the exercise, not facts about any company.</p>
<ul>
  <li><b>Requests:</b> 5 million trips a day, 5 × 12 = about 60 a second on average, 300 a second at a 5x peak.</li>
  <li><b>Driver pings:</b> 500,000 online drivers, one ping each 4 s: 500,000 ÷ 4 = 125,000 writes a second. That is 25x the 5,000 a second one relational primary takes, so locations live in memory, sharded. At 100 B a ping, 125,000 × 100 B = 12.5 MB a second.</li>
  <li><b>Latest positions:</b> 500,000 × 100 B = 50 MB, so write rate, not memory, is the constraint. Over 16 nodes that is 125,000 ÷ 16 = about 7,800 writes a second each.</li>
  <li><b>Matching lookups:</b> 300 requests × 7 cells (own plus 6 neighbours) = 2,100 reads a second. Trivial.</li>
  <li><b>Nearby-cars map:</b> 100,000 riders refreshing every 5 s is 20,000 reads a second, at the 20,000 line, so serve it from a per-cell snapshot cache with a 2 to 3 s TTL.</li>
  <li><b>Surge:</b> 50,000 cells a minute is about 830 updates a second. Small.</li>
  <li><b>Offers:</b> at a 50% accept rate, 2 offers per trip on average, so about 2 × 15 s = 30 s of waiting on average if every decline runs to the timeout.</li>
</ul>
<p>The location stream is the load, not matching: shard it in memory by cell, keep trips on a separate consistent store, and keep each city in one region (coast to coast is 60 to 70 ms).</p>`,
      design: `<ol>
  <li><b>Location service.</b> Drivers send <code>(driver_id, lat, lng, heading, ts)</code> over a persistent connection. The service maps the point to a cell id in a hierarchical grid (hexagons, S2 cells or geohash all work) and writes into an in-memory store sharded by cell, with each driver's entry carrying a TTL of about 15 s so a silent driver drops out. When a driver crosses a cell boundary, the old cell entry is removed. A copy of every ping goes to a log for analytics and replay; the in-memory store is rebuilt from fresh pings in a few seconds after a node loss, so no durable write is on the hot path.</li>
  <li><b>Shard layout.</b> Shard by a coarser parent cell, not the fine cell, so a rider's cell and its neighbours usually sit on one node. Without this a lookup fans out to up to 7 shards. Use consistent hashing with virtual nodes so adding a node moves a fraction of cells.</li>
  <li><b>Driver state.</b> A separate small store keyed by <code>driver_id</code>: <code>available</code>, <code>offered</code> (with an offer id and lease expiry), <code>on_trip</code>, <code>offline</code>. Changes are compare-and-set: <code>available</code> to <code>offered</code> only if the state is still <code>available</code>.</li>
  <li><b>Trip store.</b> Relational, sharded by <code>trip_id</code>: <code>trips(trip_id, rider_id, driver_id, state, quote_id, price_minor, version)</code>. The rider's app sends a request id and the trip id is derived from it, so a retry lands on the same shard and row and never creates a second trip.</li>
</ol>
<p><b>Request path.</b> The rider asks for a quote: the surge service reads the multiplier for the pickup cell and returns it with a <code>quote_id</code> valid for about 2 minutes, stored with the price. The rider confirms with that quote id. Dispatch for that cell reads the cell and its ring of neighbours, drops drivers whose last ping is older than about 10 s, takes the 5 to 10 nearest by straight-line distance, asks the estimate service for road travel time, and ranks by it. It then offers the trip to the best driver with a 15 s timeout via a compare-and-set to <code>offered</code>. Accept moves the driver to <code>on_trip</code> and the trip to <code>ASSIGNED</code>, each as a conditional update. A decline or timeout releases the lease and moves to the next candidate. After a few misses, widen the ring.</p>
<p><b>Surge.</b> Request events and available-driver counts are keyed by cell and aggregated in one-minute tumbling windows by a stream job. Raw ratio of demand to supply is noisy, so the multiplier uses a smoothed ratio (average with the previous window and the neighbouring cells), is rounded to steps of 0.1, is capped, and only moves by a limited amount per window so riders do not see wild swings. The result is written to a key-value store as <code>surge:{cell}</code> with a TTL of about 2 minutes, so a dead stream job makes the surge expire to 1.0 instead of freezing a high price.</p>
<p><b>Hard problem 1: double assignment.</b> Two requests can pick the same nearby driver at the same instant. The compare-and-set on the driver record means one wins and the other simply moves to its next candidate. Location data is allowed to be eventually consistent (a few seconds stale is fine); the assignment decision is not.</p>
<p><b>Hard problem 2: hot cells.</b> A stadium emptying makes one cell carry thousands of requests while neighbouring shards idle. Split hot cells to a finer resolution dynamically, and let the dispatch tier move cell ownership between nodes. Hashing cannot fix this because the load really is in one place.</p>`,
      tradeoffs: `<ul>
  <li><b>Nearest-first vs batched matching.</b> Greedy nearest-first answers instantly but can strand a far rider. Collecting requests for a couple of seconds and solving an assignment across all riders and drivers uses supply better but adds delay. Pick greedy to start; flip to batching in dense areas where many requests per cell arrive every second.</li>
  <li><b>One offer at a time vs several at once.</b> Sequential offers never waste a driver's attention but average about 30 s to a match at a 50% accept rate if declines run to the timeout. Offering to three at once is faster and burns offers. Pick sequential; flip to parallel offers when supply is thin and the first accept matters more than fairness.</li>
  <li><b>Fine vs coarse surge cells.</b> Fine cells track a block-level shortage but flicker and invite drivers to game boundaries. Coarse cells are stable but price unfairly across a large area. Pick medium cells with smoothing from neighbours; flip finer where data is dense and the price is stable.</li>
  <li><b>Memory-only locations vs a durable store.</b> In-memory loses state on a node failure but recovers within a few ping intervals, and it handles 125,000 writes a second cheaply. A durable store protects nothing you need. Pick memory with a log copy; flip only if a feature needs location history in the request path.</li>
</ul>`,
      followups: [
        "A stadium event ends and 20,000 riders request within five minutes. Walk through what happens to the location shards, dispatch and surge.",
        "Drivers go offline together to push surge up. How would you detect and dampen that?",
        "A dispatch node dies mid-offer. What state is left behind and how is it recovered?",
        "How would you extend the design to multiple regions, and what must stay region-local?",
        "Regulators cap surge at a fixed multiplier. Where does that rule live, and how do you audit what was charged?",
      ],
      slips: `<ul>
  <li><b>Writing driver pings to the main database.</b> 125,000 a second is 25x its write limit.</li>
  <li><b>Skipping the spatial index,</b> or naming one without the resolution trade-off or the hot-cell problem.</li>
  <li><b>Letting two requests take one driver,</b> with no compare-and-set or lease.</li>
  <li><b>Using stale positions.</b> No TTL means an offline driver is offered trips.</li>
  <li><b>Surge as a raw ratio.</b> Noisy, uncapped, no TTL, and re-quoted after the rider has already seen a price.</li>
  <li><b>Global dispatch across regions,</b> ignoring round-trip times.</li>
  <li><b>Demanding strong consistency everywhere</b> instead of only on assignment.</li>
  <li><b>Never saying how a stalled stream job fails,</b> so a stuck surge value persists.</li>
</ul>`,
    },
  },
  {
    id: "swiggy-promo-notifications",
    company: "swiggy",
    title: "Design a promotional offer notification system",
    prompt:
      "Design a system that lets marketing send a promotional offer to a segment of tens of millions of users by push, SMS or in-app message, at a chosen local time, with per-user frequency limits and an offer that expires. Opted-out users must never receive it, and a sudden rush of app opens must not take the ordering backend down.",
    level: "SDE-3 (L8)",
    kind: "hld",
    evidence: "one",
    sources: [
      {
        label: "Roundz: Swiggy SDE-3 (L8) interview experience, round 5",
        url: "https://roundz.substack.com/p/interview-experience-123-swiggy-sde3-l8",
        kind: "candidate-report",
        year: 2025,
      },
    ],
    chapters: ["sysdes-walkthrough-notifications", "sysdes-rate-limiting", "sysdes-message-queues-async"],
    answer: {
      ask: `<p>Questions first. How big is the largest audience and how is it defined: a fixed list, or a rule such as "ordered biryani in the last 30 days in this city"? Which channels, and is the choice per user or per campaign? Is the offer capped by budget, for example the first 50,000 redemptions? Must sends be at the user's local time? What is the consent model per channel, and who owns it? Is there a need for a holdout group to measure real lift?</p>
<p>Scope I will assume: campaign creation and scheduling, audience resolution, eligibility checks, frequency caps, push as the main channel with SMS and in-app as options, offer validity and redemption budget, delivery and conversion tracking. Out of scope: the campaign UI, creative design, and the provider connections already covered by the notification platform underneath.</p>`,
      numbers: `<p>Planning figures for the exercise, not facts about any company. I reuse the notifications chapter's campaign of 20 million devices.</p>
<ul>
  <li><b>Send rate:</b> 20 million over one hour is 20,000,000 ÷ 3,600 = about 5,556 a second. Over 5 minutes it would be about 66,700 a second, well past the push quota arithmetic in that chapter (check current docs).</li>
  <li><b>Work units:</b> chunks of 1,000 users give 20,000 chunks, about 5.6 a second at the one-hour pace. One queue message per chunk, not per user.</li>
  <li><b>Audience snapshot:</b> 20M × 50 B = 1 GB. <b>Send ledger</b> (one dedupe key per campaign and user, 100 B): 20M × 100 B = 2 GB. <b>Cap counters</b> (one per user per day, 50 B): 1 GB.</li>
  <li><b>The downstream spike:</b> assume 5% open the push, so 1 million opens. Over an hour that is about 280 opens a second, or 1,400 reads a second at 5 reads each. If the push goes in 5 minutes and opens bunch, it is 1,000,000 ÷ 300 = about 3,300 opens a second, about 16,700 reads a second, close to the 20,000 one database serves.</li>
  <li><b>Redemptions:</b> if 10% of openers order, that is 100,000 orders, about 28 a second over an hour. One atomic budget counter is enough.</li>
</ul>
<p>The bottlenecks are provider throughput and the app-open spike, so pace the send and protect the backend.</p>`,
      design: `<ol>
  <li><b>Campaign service.</b> A campaign has an audience definition, a message template (with locale variants), a channel plan, a schedule, an offer id, an expiry and a state: <code>DRAFT</code>, <code>APPROVED</code>, <code>SCHEDULED</code>, <code>RUNNING</code>, <code>PAUSED</code>, <code>DONE</code>, <code>CANCELLED</code>. Approval is a separate step so a typo cannot go to 20 million people.</li>
  <li><b>Offer service.</b> <code>offers(offer_id, rule, valid_from, valid_to, budget_total)</code> and <code>offer_grants(offer_id, user_id)</code> with a unique key. Checkout is the source of truth: it validates the grant, the validity window and the remaining budget with an atomic decrement of a counter. The notification only advertises the offer; it never confers it.</li>
  <li><b>Audience builder.</b> A batch query against the warehouse writes user ids into a snapshot table or file in object storage, partitioned into chunks of 1,000, and records the snapshot id on the campaign. Freezing the audience makes the campaign repeatable and auditable.</li>
  <li><b>Chunk workers.</b> Each queue message is one chunk. For each user the worker runs filters in a fixed order, cheapest first: campaign state (stop if paused), marketing consent for the channel, suppression and quiet hours, already-redeemed, holdout membership, frequency cap. Survivors get a send-ledger entry and a job in the bulk lane of the notification pipeline, with an expiry equal to the offer end.</li>
  <li><b>Notification pipeline.</b> The existing per-channel queues, workers and provider adapters from the notifications chapter. The promotional system is a producer, not a second pipeline.</li>
  <li><b>Tracking.</b> Delivery receipts, opens, and redemptions (matched through the offer id in the deep link) flow into an event log and a warehouse. Redemption counts per campaign come from checkout, not from clicks.</li>
</ol>
<p><b>Idempotency.</b> The send key is <code>campaign_id:user_id</code>, and it is also the notification job id, so the pipeline drops a job whose key it has already accepted. The worker enqueues first and then writes the ledger entry, so a crash between the two can only cause a repeat enqueue, which that de-duplication absorbs, and never a silently skipped user. A chunk redelivered after a crash skips users already in the ledger and re-enqueues the rest. The key's TTL outlives the campaign by a safe margin.</p>
<p><b>Frequency caps.</b> A counter per (user, day, channel) in a key-value store, incremented when a job is accepted. Caps apply to marketing only. If two campaigns compete for one user's slot, priority and a global daily cap decide; a campaign tagged "high priority" is evaluated first. The cap is an approximate guard: a few extra sends in a race are acceptable, while consent is exact.</p>
<p><b>Consent is checked twice,</b> as in the notifications chapter: at chunk time and again by the sending worker just before the provider call, because an hour-long campaign outlives many unsubscribes. When the preference store is unreachable, marketing fails closed.</p>
<p><b>Pacing.</b> The scheduler releases chunks at a configured rate (for example 5,556 users a second), ramps up over the first minute, and treats the first chunks as a canary: if the failure rate jumps, it pauses itself. For local-time sends, the audience is bucketed by time zone and each bucket is scheduled separately, which also spreads load.</p>
<p><b>Protecting the backend.</b> Because a promotional push is a deliberate load generator, product and platform agree on a rate before launch. Pace sends so the expected open rate stays inside the read headroom, serve the offer landing page from a cache, and put a per-campaign kill switch on the campaign state that every worker checks per chunk.</p>
<p><b>Expiry.</b> A message about an offer ending at 11 p.m. is worthless at 11:05. Every job carries <code>expires_at</code>; workers drop expired jobs and checkout rejects an expired grant, so both ends agree.</p>`,
      tradeoffs: `<ul>
  <li><b>Frozen audience vs live evaluation.</b> A snapshot is cheap, repeatable and auditable but can go stale by send time. Evaluating the segment per user at send time is fresh but expensive and unrepeatable. Pick a snapshot plus live checks on the few fields that matter (consent, already redeemed); flip to live evaluation for behaviour-triggered messages such as an abandoned cart.</li>
  <li><b>Fast blast vs paced send.</b> Blasting finishes sooner and lets the offer reach everyone while it is hot, but spikes both the provider and the backend. Pace over an hour or more; flip to a faster pace only for a short flash offer and only after load-testing the open spike.</li>
  <li><b>Strict vs approximate caps.</b> Exact caps need a transactional check per user and slow the pipeline. Approximate counters allow a rare extra send. Pick approximate for frequency caps; pick strict for consent and for the offer budget, where an error costs money or compliance.</li>
  <li><b>Push first vs SMS.</b> Push is cheap and fast but only reaches users with the app and permission. SMS reaches more people at a higher price and a much lower per-sender rate. Pick push, with SMS for a small high-value slice; flip toward SMS when the push opt-in rate is low.</li>
</ul>`,
      followups: [
        "A user is in three campaigns today. How do you decide which one wins, and where is that decision made?",
        "The preference service is down halfway through a campaign. What happens to the remaining chunks?",
        "The offer sells out after 30 minutes with half the audience still unsent. What does the system do?",
        "How would you design the holdout group so the lift measurement is trustworthy?",
        "Marketing wants ten campaigns at 9 a.m. tomorrow. How do you schedule them so the providers and the backend survive?",
      ],
      slips: `<ul>
  <li><b>Looping over users in the request.</b> A 20-million-row loop inside one API call; no chunks, no queue, no resume.</li>
  <li><b>Checking consent only at audience time,</b> not at send time.</li>
  <li><b>No send ledger,</b> so a crashed worker re-sends the first half of a chunk.</li>
  <li><b>Letting the notification carry the offer.</b> The checkout service must validate the grant, validity and budget.</li>
  <li><b>Ignoring the open spike,</b> protecting the sender but not the ordering backend.</li>
  <li><b>Forgetting expiry,</b> so late messages advertise dead offers.</li>
  <li><b>Sharing queues with transactional traffic,</b> so a campaign delays a password reset.</li>
  <li><b>Treating the send as one big job</b> with no pause, resume or canary.</li>
</ul>`,
    },
  },
  {
    id: "swiggy-order-splitting",
    company: "swiggy",
    title: "Split a mixed order into child orders under one parent order",
    prompt:
      "A customer checks out one cart containing a restaurant meal and groceries from a separate warehouse. Design how the system splits it into child orders under a single parent, with one payment, independent fulfilment of each child, and sensible handling when one child is rejected or cancelled.",
    level: "SDE-2 (backend)",
    kind: "hld",
    evidence: "guide",
    sources: [
      {
        label: "System Design Sim: Swiggy system design interview",
        url: "https://systemdesignsim.com/interview/swiggy-system-design-interview",
        kind: "prep-guide",
        year: 2026,
      },
      {
        label: "Space Complexity: Swiggy system design interview",
        url: "https://spacecomplexity.ai/blog/swiggy-system-design-interview",
        kind: "prep-guide",
        year: 2026,
      },
    ],
    chapters: [
      "sysdes-transactions-isolation",
      "sysdes-databases-in-design",
      "sysdes-time-ordering-ids",
      "sysdes-message-queues-async",
    ],
    answer: {
      ask: `<p>Questions first. What decides which child an item belongs to: the vendor, the warehouse, or a delivery constraint such as temperature? Does the customer pay once or per child? If one child is rejected after payment, should the others continue, or is the order all-or-nothing? How many children can one parent have? Are there coupons or delivery fees that span items from different children? Does each child get its own delivery partner and its own ETA?</p>
<p>Scope I will assume: a parent with 2 to 5 children, grouped by fulfilment source; one customer payment; independent child lifecycles; the customer sees one order with a timeline per child; the default is partial fulfilment with automatic refund of a failed child. Out of scope: courier assignment inside each child, restaurant and warehouse internals, tax invoice rules (finance and legal define those).</p>`,
      numbers: `<p>Planning figures for the exercise, not facts about any company.</p>
<ul>
  <li><b>Order volume:</b> 3 million orders a day is about 35 a second (3,000,000 ÷ 86,400 = 34.7). A 10x peak is about 350 a second.</li>
  <li><b>Mixed share:</b> 10% mixed is 300,000 parents and, at 2 children each, 600,000 child orders a day; 300,000 ÷ 86,400 = about 3.5 splits a second, about 35 at peak.</li>
  <li><b>Rows per order:</b> parent, children, items, payment and allocation rows, status events and outbox rows come to roughly 15 per order across all orders. Peak writes: 350 × 15 = 5,250 a second, right at the 5,000 line for one primary.</li>
  <li><b>One split:</b> a parent, 2 children and about 10 item lines is roughly 25 rows, a small transaction if they share a shard.</li>
  <li><b>Status reads:</b> a customer watching the order refreshes about every 10 s; 200,000 watching at peak gives 20,000 reads a second, so the order-detail read comes from a cache or read model, not the primary.</li>
</ul>
<p>The conclusions: the orders store is at the partition line, so shard it; and the shard key must put a parent and all its children on one shard, so the split can commit in a single local transaction with no distributed protocol.</p>`,
      design: `<ol>
  <li><b>Checkout builds a quote.</b> Each cart line is tagged with a <code>fulfilment_node</code> (a restaurant or a warehouse), a price snapshot and a tax amount, all in integer minor units (paise or cents, never floats). The quote has an id and an expiry.</li>
  <li><b>Split plan.</b> A deterministic function groups lines by <code>fulfilment_node</code> and applies constraints (maximum items or weight per child, items that cannot ship together). The plan is stored with a hash of its inputs, so the same quote always gives the same plan.</li>
  <li><b>Identifiers.</b> <code>parent_id</code> is a time-ordered 64-bit id (see the time and ids chapter), allocated when the quote is built, and also the shard key. <code>child_id</code> is <code>(parent_id, seq)</code> with <code>seq</code> from the plan, so a retry produces the same child ids and an upsert cannot create duplicates.</li>
  <li><b>Tables on one shard:</b> <code>parents(parent_id, customer_id, state, total_minor, idempotency_key, version)</code> with a unique key on <code>(customer_id, idempotency_key)</code>; <code>children(parent_id, seq, fulfilment_node, state, subtotal_minor, version)</code>; <code>child_items</code>; <code>payment_allocations(parent_id, seq, amount_minor, refunded_minor)</code>; <code>outbox</code>.</li>
</ol>
<p><b>Place-order path.</b> The client sends the quote id, which carries the <code>parent_id</code>, and an idempotency key, so a retry always reaches the same shard. In one local transaction on the parent's shard the service inserts the parent in <code>PENDING_PAYMENT</code>, the children in <code>CREATED</code>, items, allocations and one outbox row asking the payment service to authorise. A retry hits the unique key and returns the existing parent. Do not call restaurants or warehouses inside this transaction; the outbox is the reliable hand-off. The payment service places one authorisation for the parent total (the customer sees one charge). When it succeeds, one local transaction moves the parent to <code>PLACED</code> and writes one outbox row per child, and the relay publishes the <code>child.created</code> events. Each fulfilment service consumes its own child, idempotent by <code>child_id</code>, and acknowledges or rejects it within a deadline; silence becomes a rejection by a delayed job.</p>
<p><b>Child lifecycles.</b> Each child has its own state machine (for example <code>CREATED</code> to <code>ACCEPTED</code>, <code>PACKED</code>, <code>PICKED_UP</code>, <code>DELIVERED</code>, or <code>REJECTED</code> and <code>CANCELLED</code>) with conditional updates on <code>version</code>, so duplicate or reordered events are harmless.</p>
<p><b>Parent status is derived.</b> It is a pure function of the children: all delivered is <code>DELIVERED</code>; all cancelled is <code>CANCELLED</code>; delivered plus cancelled is <code>PARTIALLY_FULFILLED</code>; anything else active is <code>IN_PROGRESS</code>. Recompute it from the child rows on each child event instead of adding to counters, because a recompute is idempotent and a counter drifts on a duplicate. Write the result to the read model that serves the customer's order page.</p>
<p><b>Money.</b> One authorisation, many allocations. Coupons and delivery fees are spread across children in proportion to subtotals, using integer arithmetic where the remainder cents go to the largest child, so the children's totals always sum exactly to the parent total. That sum is an invariant worth checking in a test. Capture per child when it is delivered if the payment method supports partial capture; otherwise capture the whole amount and refund the difference. A refund for a child is limited to its allocation, and each refund call carries an idempotency key of <code>(child_id, refund_seq)</code>.</p>
<p><b>Rejection after payment.</b> Default policy: the rejected child is cancelled, its allocation is refunded, and the other children continue, with one clear message to the customer. If the order was marked all-or-nothing (for example a gift), a rejection triggers compensation for every other child that has not reached pick-up: cancel it, refund it, and tell the customer. This is a saga on a single shard, so the compensations are ordinary conditional updates plus outbox events.</p>
<p><b>Notifications.</b> One message per meaningful change, merged where possible: "your groceries are 10 minutes away" rather than one push for each internal state.</p>`,
      tradeoffs: `<ul>
  <li><b>One transaction on one shard vs a saga across vertical services.</b> Co-locating parent and children makes the split atomic and simple, but ties the verticals to a shared orders store. A saga lets each vertical own its data but turns creation into several steps with compensation. Pick co-location for the order record, with the verticals' fulfilment systems consuming events; flip to a saga if verticals already own separate databases and teams.</li>
  <li><b>One payment vs one per child.</b> One authorisation matches what the customer expects and costs one fee, but needs allocation bookkeeping for partial refunds. One payment per child isolates failures but may show several charges. Pick one payment with allocations; flip when children belong to different legal sellers who must each be paid separately.</li>
  <li><b>Derived vs stored parent status.</b> Stored status is fast to read but can drift. Derived status is always correct and costs a few row reads. Pick derived, cached in the read model; flip to stored only if you need to query parents by status at high volume.</li>
  <li><b>Partial fulfilment vs all-or-nothing.</b> Partial keeps the customer's meal even if the groceries fail but may leave them with half an order. All-or-nothing is predictable but wastes prepared food. Pick partial by default; flip to all-or-nothing when the customer chooses it.</li>
</ul>`,
      followups: [
        "The customer cancels only the grocery child while the meal is already being prepared. What does the system allow, and what is refunded?",
        "A coupon gives 15% off the whole cart with a maximum discount. How do you apportion it across children so the totals still add up?",
        "How would you show one overall ETA when the two children have independent delivery partners?",
        "A third kind of child, such as pharmacy items, needs a prescription check before acceptance. Where does that fit in the design?",
        "The order service retries a payment call after a timeout. How do you make sure the customer is not charged twice?",
      ],
      slips: `<ul>
  <li><b>Modelling the child as a status on an item.</b> Children need their own lifecycle, fulfilment source, money and delivery.</li>
  <li><b>Calling vendors inside the database transaction,</b> so a slow vendor holds locks or a failure leaves a half-created order.</li>
  <li><b>Random child ids,</b> so a retry creates duplicate children.</li>
  <li><b>Floating-point money,</b> with rounding that makes the children not sum to the parent.</li>
  <li><b>A parent status kept by counters,</b> which drifts on duplicate events.</li>
  <li><b>Ignoring partial failure.</b> No answer for "one child rejected after payment".</li>
  <li><b>Sharding by child id,</b> which forces a distributed transaction for every split.</li>
  <li><b>Letting a refund exceed what was paid</b> for that child, with no idempotency key on the refund call.</li>
</ul>`,
    },
  },
];
