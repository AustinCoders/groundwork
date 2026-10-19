import type { CompanyQuestion } from "./types";

export const questions: CompanyQuestion[] = [
  {
    id: "flipkart-ticket-booking",
    company: "flipkart",
    title: "Design a BookMyShow-style ticket booking system",
    prompt:
      "Design an online booking system for movie tickets with reserved seats. On an opening night, 200,000 people chase 300 seats within the first minute; no seat may be sold twice, and a user who picks seats should get a few minutes to pay before they are released.",
    level: "SDE-2",
    kind: "hld",
    evidence: "several",
    sources: [
      {
        label: "GeeksforGeeks: Flipkart SDE-2 interview experience (2 years)",
        url: "https://www.geeksforgeeks.org/interview-experiences/flipkart-interview-experience-for-sde-2-2-year-experienced/",
        kind: "candidate-report",
        year: 2021,
      },
      {
        label: "GeeksforGeeks: Flipkart SDE-2 off-campus interview experience",
        url: "https://www.geeksforgeeks.org/interview-experiences/flipkart-interview-experience-for-sde-2-off-campus/",
        kind: "candidate-report",
        year: 2024,
      },
    ],
    chapters: [
      "sysdes-transactions-isolation",
      "sysdes-message-queues-async",
      "sysdes-availability-design",
      "sysdes-walkthrough-payments",
    ],
    answer: {
      ask: `<p>Before drawing anything I would ask: are seats reserved (a specific seat) or general admission? Is our database the single source of truth for inventory, or do theatres run their own systems we must sync with? How long may a user hold seats while paying? What is the worst crowd: a normal evening, or one opening night where a huge crowd chases a few hundred seats? Is payment handled by an external provider? Do we need cancellations and refunds?</p>
<p>I would assume reserved seating, our own inventory as the source of truth, a 5-minute hold, an external payment provider, and the opening-night crowd as the design case. <b>In scope:</b> browse, seat map, hold, pay, confirm. <b>Out of scope:</b> theatre onboarding, recommendations, food orders and the seat-picker UI.</p>`,
      numbers: `<p>These are planning figures for the exercise, not facts about any company.</p>
<ul>
  <li><b>Inventory:</b> 1,000 cinemas × 5 screens × 5 shows a day = 25,000 shows; × 200 seats = 5 million seat rows a day; × 100 B = 500 MB a day. A 30-day booking window is 15 GB, which fits on one relational primary.</li>
  <li><b>Normal browsing:</b> 20 million seat-map views a day is about 20 × 12 = 240 a second; at a 10× peak, 2,400 a second. That is cache territory, nowhere near a database limit.</li>
  <li><b>Opening night:</b> 200,000 users in the first minute, each making about 3 hold attempts: 600,000 ÷ 60 = <b>10,000 hold attempts a second</b>, all aimed at the same 300 rows.</li>
  <li>At most 300 seats can be won, so at most 300 of 600,000 attempts succeed: 99.95% must fail, and they must fail cheaply.</li>
</ul>
<p>The numbers say volume is easy and contention is the problem. 10,000 conflicting writes a second is twice the 5,000 committed writes a second planning figure for one primary, and they all queue on 300 row locks. So I admit users to the hold step at a controlled rate (500 a second drains 200,000 in 400 seconds) and answer "sold out" from a cache once the count reaches zero.</p>`,
      design: `<p><b>Components.</b> A CDN and cache for show listings and seat maps; a booking service; one relational database (shows, seats, bookings); an external payment provider; a queue for tickets and notifications; and a small admission service in front of the hold step for hot shows.</p>
<p><b>Data model.</b></p>
<ul>
  <li><code>show_seats(show_id, seat_id, state, held_by, hold_expires_at, booking_id)</code>, primary key <code>(show_id, seat_id)</code>. State is available, held or booked. One row per seat per show is the unit of contention, so every correctness rule is a rule about one row.</li>
  <li><code>bookings(booking_id, user_id, show_id, status, amount, idempotency_key)</code> with a unique index on <code>(user_id, idempotency_key)</code>.</li>
</ul>
<p><b>Read path.</b> The seat map is served from a cache keyed by show with a TTL of 2 to 5 seconds, rebuilt from the database on a miss and optionally refreshed when a hold or booking commits. It is allowed to be a little stale. It is a hint; the hold statement is the authority, and the UI must handle "that seat was just taken" gracefully.</p>
<p><b>Write path: hold.</b></p>
<ol>
  <li>The user picks up to 6 seats (a per-user limit stops hoarding). The service sorts the seat ids so two overlapping requests update rows in the same order and cannot deadlock.</li>
  <li>One transaction runs a conditional update for each seat, in that sorted order: set state to held, <code>held_by</code> to the user and <code>hold_expires_at</code> to now plus 5 minutes, where the seat is available <em>or</em> held with an expiry in the past. Use the database clock, not the app server's.</li>
  <li>If any update changes no row, roll back. Holds are all or nothing. There is no read-then-write; for each seat the check and the claim are one statement, so two users cannot both pass the check.</li>
</ol>
<p>Expired holds are released lazily by that predicate, and a sweeper also flips them back so the seat map stays accurate.</p>
<p><b>Write path: pay and confirm.</b> Create a pending booking with an idempotency key, then call the payment provider with a key derived from the booking id so a retry cannot charge twice (the payments walkthrough covers the chain). When payment succeeds, one transaction marks the seats booked and the booking confirmed, and writes an outbox row that the ticket and notification workers consume. If the provider call times out, the outcome is unknown: keep the hold alive and reconcile, do not release the seats.</p>
<p><b>Hard problem 1: the hot show.</b> A virtual queue gives each arriving user a position and admits them in batches; only admitted users receive a short-lived token that the hold endpoint requires. When the sold count hits 300, a flag in the cache flips the show to sold out and the remaining users are told at once.</p>
<p><b>Hard problem 2: pay after the hold expired.</b> Extend the hold when the user reaches the payment step, with a cap. If a success still arrives after expiry, book the seats if they are free; if someone else took them, refund automatically and say so. Make this rare, but never make it impossible to handle.</p>
<p><b>Scaling later.</b> Shard by <code>show_id</code> so a hold is always a single-shard transaction. Reads scale with the cache and replicas; writes stay on each primary.</p>`,
      tradeoffs: `<ul>
  <li><b>Conditional update vs <code>SELECT ... FOR UPDATE</code>.</b> I pick the conditional update: one round trip, short lock time, no way to forget to check. Flip to explicit locks when the rule needs to read several rows first, such as "no single empty seat left in a row".</li>
  <li><b>Holds in the database vs a Redis key with a TTL.</b> The database keeps holds and bookings in one transaction and one source of truth. A key with a TTL is faster and expires on its own, but now two stores must agree. Flip to Redis holds when hold attempts, even after admission control, exceed what a primary absorbs (past about 5,000 writes a second), and still write the final booking to the database.</li>
  <li><b>Short hold vs long hold.</b> Five minutes returns unpaid seats to the pool quickly, but slow bank pages or wallet approvals will sometimes miss it. Flip to a longer hold only for the payment step, never for seat browsing.</li>
  <li><b>Waiting room vs plain rate limiting.</b> A queue is fair and keeps the database calm but adds machinery and a bad first impression. For ordinary shows, a per-user rate limit is enough; for known hot launches, use the queue.</li>
</ul>`,
      followups: [
        "How would you stop a bot from grabbing all 300 seats with thousands of accounts?",
        "A payment succeeds 20 seconds after the hold expired and another user has the seat. What does the user see, and what do you do with the money?",
        "How would you let users choose the best available seats together in one row without locking the whole show?",
        "The database primary fails during the opening-night rush. What happens to in-flight holds?",
        "How would you support the same seat inventory being sold through a partner site as well as your own app?",
      ],
      slips: `<ul>
  <li>Reading the seat, checking in application code, then writing. Two users pass the check together and both are told they won.</li>
  <li>Treating the seat map as truth. A cached map is a hint, and a design that books from it will double-sell.</li>
  <li>Holds with no expiry, or an expiry that depends on a worker running on time. Put the expiry in the row and in the predicate.</li>
  <li>Releasing the hold when the payment call times out, then charging the card anyway.</li>
  <li>Sharding the seat table by seat or user. A multi-seat hold must be inside one shard.</li>
  <li>Sizing for average load and ignoring the 10,000-a-second burst on one show, which is the whole point of the question.</li>
</ul>`,
    },
  },
  {
    id: "flipkart-transaction-ledger",
    company: "flipkart",
    title: "Design a ledger that stores transactions from many services",
    prompt:
      "Design a central ledger that orders, wallet, refund and payout services all write transactions to. No entry may be lost or counted twice, balances must be readable in real time, and an auditor must be able to rebuild any account's history.",
    level: "SDE-2",
    kind: "hld",
    evidence: "one",
    sources: [
      {
        label: "GeeksforGeeks: Flipkart SDE-2 interview experience, round 3",
        url: "https://www.geeksforgeeks.org/?p=1156850",
        kind: "candidate-report",
        year: 2025,
      },
    ],
    chapters: [
      "sysdes-transactions-isolation",
      "sysdes-walkthrough-payments",
      "sysdes-storage-engines",
      "sysdes-apis-communication",
    ],
    answer: {
      ask: `<p>I would ask: what is a "transaction" here, one movement between two accounts or a bundle of several lines? Must the ledger enforce that balances never go negative, or only record what happened? How fresh must a balance be: exact at write time or a few seconds late? Which currencies are involved? How long must history be kept, and are corrections allowed? Which services write, and can they all call an API?</p>
<p>I would assume double-entry bookkeeping, multiple currencies stored as integer minor units, exact balances for wallet-style accounts, seven-year retention, and corrections only by new reversing entries. <b>In scope:</b> posting, balances, history, reconciliation. <b>Out of scope:</b> the payment gateway itself, tax, and financial reporting.</p>`,
      numbers: `<p>Planning figures for the exercise, not facts about any company.</p>
<ul>
  <li><b>Volume:</b> 5 million business events a day is about 5 × 12 = 60 a second; at a 10× peak, 600 events a second. Each posts 2 entries, so 1,200 entries a second at peak.</li>
  <li><b>Commits:</b> if each event is one transaction (two entries, a balance update, an idempotency row), that is 600 commits a second, well under the 5,000 committed writes a second planning figure. One primary is enough.</li>
  <li><b>Storage:</b> 10 million entries a day × 150 B = 1.5 GB a day; × 365 = about 550 GB a year; seven years is about 3.8 TB. Big enough that I would partition entries by month and archive old partitions.</li>
  <li><b>Hot account:</b> a platform-fee account touched by every event takes 600 updates a second on one row. If each transaction holds that row lock for about 2 ms, that is 600 × 0.002 = 1.2 seconds of lock time per second, which is more than 100% busy, so the row becomes the bottleneck. Splitting it into 16 sub-balances gives 600 ÷ 16 = 37.5 updates a second each, about 7.5% busy.</li>
</ul>
<p>Throughput is not the problem; one hot row is. And correctness is the product, so I choose the simplest store that gives strong transactions, and spend the effort on invariants.</p>`,
      design: `<p><b>Data model.</b></p>
<ul>
  <li><code>accounts(account_id, owner, currency, kind)</code>.</li>
  <li><code>transactions(txn_id, source_service, source_event_id, effective_at, posted_at, reverses_txn_id)</code>, with a unique index on <code>(source_service, source_event_id)</code>. That index is the idempotency key.</li>
  <li><code>entries(account_id, entry_seq, txn_id, amount, currency)</code>, primary key <code>(account_id, entry_seq)</code>. Amounts are signed integers in the minor unit. The sequence is per account and comes from the balance row (below), so history is ordered without trusting any service's clock. For a bucketed hot account, order by transaction id instead.</li>
  <li><code>balances(account_id, bucket, balance, last_seq)</code>.</li>
</ul>
<p><b>Invariants.</b></p>
<ol>
  <li>Entries of one transaction sum to zero per currency. The posting function checks it, and a deferred constraint trigger checks it again at commit.</li>
  <li>Entries and transactions are append-only. The application role has no update or delete grant on them. A mistake is fixed by a new transaction that reverses the old one and points back at it.</li>
  <li>The balance row and the entries change in the same transaction, so they cannot disagree.</li>
</ol>
<p><b>Write path.</b> Services do not touch tables. They call one posting API with the source event id and a list of lines. In a single transaction the ledger: inserts the transaction (a duplicate key means "already posted", so return the original result); locks the affected balance rows in sorted account order to avoid deadlock; applies a conditional update such as <code>balance = balance - :amt WHERE balance &gt;= :amt</code> for accounts that must not go negative; and inserts the entries. A retry from any caller is therefore safe.</p>
<p>For flows that tolerate delay, a service can instead publish a posting command to a log. Consumers call the same posting function, partitioned by source id, with the same idempotency key. The producing service should use an outbox so a command is never lost between its own commit and the publish. Two doors, one function.</p>
<p><b>Hot accounts.</b> Spread a hot account over N bucket rows; a write picks a bucket (by hash of the transaction id), a read sums the buckets. Reading a bucketed balance is slightly more work and almost never matters.</p>
<p><b>Read path.</b> Current balance is a point read on <code>balances</code>. History is a cursor-paginated range scan on <code>(account_id, entry_seq)</code>. Statements and reports run on a replica, since a few seconds of lag is fine there; the balance check that guards a debit always runs on the primary. "Balance as of date D" comes from a periodic snapshot plus the entries after it.</p>
<p><b>Reconciliation.</b> A nightly job recomputes each account's sum from entries and compares it with the stored balance, then compares per-source totals with each upstream service and with the bank or gateway statements. Differences raise an alert and are fixed with an adjusting entry, never an edit.</p>
<p><b>Growth.</b> Beyond one primary, shard by owner (merchant or customer) so most postings stay inside one shard. A transfer across shards becomes two single-shard postings through an in-transit account, with the saga and outbox patterns making each step idempotent.</p>`,
      tradeoffs: `<ul>
  <li><b>Stored balance vs computed from entries.</b> Stored balances make reads and non-negative checks cheap, at the cost of a hot row and a second thing to reconcile. Computed balances are always right but slow for old accounts. I pick stored plus nightly verification; flip to computed with snapshots for accounts that are write-hot and rarely read.</li>
  <li><b>Synchronous API vs asynchronous log.</b> The API gives an immediate answer and enforces overdraft rules; the log absorbs bursts and decouples teams. Pick the API for anything a user is waiting on, the log for the rest, and flip more traffic to the log if posting latency becomes someone else's outage.</li>
  <li><b>One central ledger vs a ledger per service.</b> One ledger gives one audit trail and one definition of balance, but every team depends on it. Pick central; flip to per-domain ledgers if their rules truly differ, and settle between them with a clearing account.</li>
  <li><b>Single database vs sharded.</b> Single is far simpler to keep correct. Flip when sustained writes approach 5,000 commits a second or the working set no longer fits.</li>
</ul>`,
      followups: [
        "A service sends the same event twice with slightly different amounts. What does the ledger do?",
        "How would you show a customer's balance as it was at midnight last Tuesday?",
        "An upstream service was down for three hours and replays its events out of order. Does your design cope?",
        "How would you prove to an auditor that no one edited a past entry?",
        "How would you move one merchant's accounts to another shard with no downtime?",
      ],
      slips: `<ul>
  <li>A single-entry design: one row per transaction with a signed amount. It cannot prove that money was conserved.</li>
  <li>Updating or deleting a wrong entry. History must be append-only, with corrections as new entries.</li>
  <li>No idempotency key, so a retried call double-counts.</li>
  <li>Floating-point money, or an amount with no currency beside it.</li>
  <li>Ordering entries by each service's clock. Use a per-account sequence assigned inside the transaction.</li>
  <li>Updating a hot balance row on every event without noticing it serialises the whole system.</li>
  <li>Reaching for sharding and distributed transactions at 600 writes a second.</li>
      <li>Letting every service write straight into the ledger tables, so each team enforces the invariants differently and none can be audited.</li>
</ul>`,
    },
  },
  {
    id: "flipkart-daily-subscription",
    company: "flipkart",
    title: "Design a daily-essentials subscription service",
    prompt:
      "Design a subscription service where customers get milk, bread or similar items delivered each morning on a schedule they choose (daily, alternate days, weekdays). Support pause, skip and quantity changes, handle payment, and scale to 2 million active subscriptions.",
    level: "SDE-2",
    kind: "hld",
    evidence: "one",
    sources: [
      {
        label: "GeeksforGeeks: Flipkart SDE-2 (2.5 years) interview experience",
        url: "https://www.geeksforgeeks.org/interview-experiences/flipkart-interview-experience-for-sde2-2-5-yr-exp/",
        kind: "candidate-report",
        year: 2025,
      },
    ],
    chapters: [
      "sysdes-databases-in-design",
      "sysdes-message-queues-async",
      "sysdes-walkthrough-notifications",
      "sysdes-walkthrough-payments",
    ],
    answer: {
      ask: `<p>I would ask: how far ahead is the order cut-off (say, 10 pm for next morning)? Is payment prepaid from a wallet, or charged per delivery or per week? Can a customer change or skip after the cut-off? Is delivery per neighbourhood hub with its own stock? How many different schedule patterns exist? Which time zone rules apply? What happens when delivery fails?</p>
<p>I would assume one country and one time zone, a prepaid wallet topped up through an external payment provider, a 10 pm cut-off, hub-based fulfilment, and 2 million active subscriptions. <b>In scope:</b> subscription rules, daily order generation, wallet charging, pause, skip, notifications. <b>Out of scope:</b> catalogue search, route planning for riders and supplier procurement.</p>`,
      numbers: `<p>Planning figures for the exercise, not facts about any company.</p>
<ul>
  <li><b>Daily orders:</b> not every subscription is due every day. Assume 1.5 million deliveries on a typical day.</li>
  <li><b>Generation window:</b> if the nightly job runs for two hours after the cut-off, 1,500,000 ÷ 7,200 = about <b>208 orders a second</b>. Each order needs about 3 writes (order, wallet debit, outbox), about 625 writes a second. That is far under 5,000 committed writes a second.</li>
  <li><b>Storage:</b> 1.5 million orders × 200 B = 300 MB a day; 90 days hot is 27 GB. Subscriptions: 2 million × 300 B = 600 MB. All of it fits on one primary.</li>
  <li><b>Charging cadence:</b> a card charge per delivery would be 1.5 million provider calls a day. Weekly top-ups cut that to 2,000,000 ÷ 7 = about 286,000 a day, roughly 3 a second, and fees and failures drop with it.</li>
  <li><b>App reads:</b> if 500,000 customers open the app in the morning window, even at 2,000 reads a second a cache is optional.</li>
</ul>
<p>The numbers say a single relational primary plus a partitioned batch job is enough. The hard parts are the schedule semantics, the cut-off, and not double-charging.</p>`,
      design: `<p><b>Components.</b> A subscription service (rules and overrides), an order generator (a batch job per partition), a wallet and ledger service, an order and delivery service for hub fulfilment, and a notification service fed through a queue.</p>
<p><b>Data model.</b></p>
<ul>
  <li><code>subscriptions(sub_id, customer_id, sku, qty, schedule, start_date, end_date, status, paused_until, hub_id, version)</code>. The schedule is a rule (a weekday bitmask, or "every N days from start"), not a list of future dates. A calendar of every future delivery per subscription would be endless.</li>
  <li><code>overrides(sub_id, date, action, qty)</code> with primary key <code>(sub_id, date)</code>: a skip, an extra, or a one-day quantity change. Pause is simply <code>paused_until</code>.</li>
  <li><code>orders(order_id, sub_id, delivery_date, status, amount)</code> with a <b>unique index on <code>(sub_id, delivery_date)</code></b>.</li>
  <li>Wallet entries in a ledger, with a unique key of <code>(order_id, kind)</code> so a debit or refund happens once.</li>
</ul>
<p><b>Order generation (the core loop).</b> At the cut-off, a scheduler splits subscriptions into, say, 64 partitions by hash of <code>sub_id</code> and enqueues one job per partition. A job reads active subscriptions due tomorrow, applies overrides, and for each inserts the order with an insert-if-absent on the unique index. A crashed or duplicated job is therefore harmless: re-running it creates nothing new. Delivery dates are local calendar dates, not instants, so time zones and daylight saving cannot move a delivery.</p>
<p><b>Charging.</b> When an order is generated, debit the wallet in the same transaction (a reservation; at this size the wallet tables share the primary). If the balance is short, do not create the order; mark the subscription "payment needed" and notify. Money added through the payment provider uses idempotency keys and webhook de-duplication as in the payments walkthrough. If a delivery fails, post a reversing entry and refund to the wallet; do not edit the original debit.</p>
<p><b>Pause, skip, change.</b> These write to <code>subscriptions</code> or <code>overrides</code> with a version check, so two taps cannot interleave. Before the cut-off they simply change what the generator sees. Between the cut-off and the hub's pick-list lock, a skip cancels the generated order and refunds it. After the lock, changes apply from the next day, and the app says so.</p>
<p><b>Fulfilment.</b> At the pick-list lock, group tomorrow's orders by hub and SKU and send totals to the hub and supplier. Because orders are materialised, the totals are exact.</p>
<p><b>Notifications.</b> The order service writes an outbox row on every state change. Workers consume it for reminders (low balance the evening before), confirmations of skips, and delivery updates, with a de-duplication key per notification as in the notification walkthrough.</p>
<p><b>Failure handling.</b> Monitor generated count against expected count per partition before the cut-off plus one hour; page if any partition is missing. Re-running a missing partition is safe by construction.</p>`,
      tradeoffs: `<ul>
  <li><b>Nightly materialisation vs per-subscription timers.</b> A nightly batch is easy to reason about, easy to re-run and gives exact hub totals. Timers per subscription spread load evenly but multiply moving parts. Pick the batch; flip to a delay queue if schedules need minute-level times or rolling cut-offs per customer.</li>
  <li><b>Rules plus overrides vs pre-expanded calendar rows.</b> Rules stay small and editing is one row. Pre-expansion makes queries trivial but explodes storage and edits. Pick rules; flip to expanding 14 days ahead if holiday calendars and schedule exceptions get complicated.</li>
  <li><b>Debit at generation vs at delivery.</b> Debiting early prevents delivering unpaid goods but needs refunds for failures. Debiting at delivery is gentler on customers but exposes you to unpaid orders. Pick early; flip to delivery-time charging for trusted customers with a card on file.</li>
  <li><b>Prepaid wallet vs charge per cycle.</b> A wallet turns thousands of tiny charges into occasional top-ups. Flip to card-on-file billing where customers dislike prepaying and rules for recurring card charges in your market allow it; check the current regulations.</li>
</ul>`,
      followups: [
        "A customer pauses for a week and resumes on a Wednesday. Walk through exactly which orders exist.",
        "The generator job for one partition crashed halfway. How do you know what was created and what to do next?",
        "How would you add a second delivery slot (morning and evening) per customer?",
        "How would you handle a hub running out of milk after the pick list is locked?",
        "What changes if the service must operate across several time zones?",
      ],
      slips: `<ul>
  <li>Creating a cron timer or a row per subscription per future day. It is slow to generate and miserable to edit.</li>
  <li>No unique key on (subscription, date), so a rerun double-orders.</li>
  <li>Storing delivery times as UTC instants, which drift across a date boundary.</li>
  <li>Charging a card for every delivery and ignoring fees and failures.</li>
  <li>Ignoring the cut-off: letting edits race with generation and the pick list.</li>
  <li>Deleting the wallet debit on a failed delivery instead of posting a reversal.</li>
  <li>Designing for 2 million concurrent users instead of a predictable nightly batch.</li>
      <li>Having no answer for what the customer sees when the wallet is short the evening before a delivery.</li>
</ul>`,
    },
  },
  {
    id: "amazon-big-sale-shopping",
    company: "amazon",
    title: "Design a shopping system that survives a big sale event",
    prompt:
      "Design the shopping stack for an e-commerce site that must survive a big sale: traffic jumps 20 times, a few hundred popular items have limited stock, and checkout has to keep working even if recommendations or reviews fail.",
    level: "SDE-2",
    kind: "hld",
    evidence: "one",
    sources: [
      {
        label: "GeeksforGeeks: Amazon SDE-2 interview experience (hiring event, Jan 2020)",
        url: "https://www.geeksforgeeks.org/?p=381986",
        kind: "candidate-report",
        year: 2020,
      },
    ],
    chapters: [
      "sysdes-scaling-vertical-horizontal",
      "sysdes-caching-fundamentals",
      "sysdes-rate-limiting",
      "sysdes-availability-design",
      "sysdes-cdns",
    ],
    answer: {
      ask: `<p>I would ask: how much bigger is the peak than a normal day, and how sudden (a ramp, or a spike at a published start time)? Which products are scarce and how many units? Must stock be exact, or may we occasionally oversell and apologise? Which features are essential during the event: browse, cart, checkout, payment, order tracking? Do we run in one region? Is there an existing payment provider and warehouse system whose limits we inherit?</p>
<p>I would assume one region with several zones, a 20× average day and a 3× spike in the first minute, exact stock for limited items, and an external payment provider. <b>In scope:</b> browse, cart, inventory, checkout, protection of the core path. <b>Out of scope:</b> search ranking, recommendation models and warehouse routing.</p>`,
      numbers: `<p>Planning figures for the exercise, not facts about any company.</p>
<ul>
  <li><b>Page load:</b> a normal day of 50 million page views is about 50 × 12 = 600 a second. At 20× it is 12,000 a second; at a 3× spike, <b>36,000 a second</b>.</li>
  <li><b>Backend reads:</b> if a page triggers 5 backend reads (product, price, stock badge, reviews, recommendations), that is 36,000 × 5 = 180,000 a second. One database serves about 20,000 simple reads a second, so this cannot go uncached.</li>
  <li><b>Cache arithmetic:</b> at a 99% combined CDN and cache hit rate, 1,800 reads a second reach the database. At 90% it is 18,000, right at the limit. Reason in miss rate: the gap between 99% and 90% is ten times the load.</li>
  <li><b>Orders:</b> 1 million orders in the first hour is 1,000,000 ÷ 3,600 = about 278 orders a second. At about 2 commits per order that is roughly 556 commits a second, comfortably under 5,000.</li>
  <li><b>Hot item:</b> 500,000 buyers go for one product in a minute: 500,000 ÷ 60 = about 8,300 decrement attempts a second on one stock row. Split into 20 buckets and each sees about 420 a second.</li>
  <li><b>Retries:</b> 3 attempts across 3 layers is 27× the load, which is how an overload turns into an outage.</li>
</ul>
<p>The conclusions: absorb browsing at the edge and in caches, treat the hot SKU specially, and stop retries multiplying.</p>`,
      design: `<p><b>Layers, outside in.</b></p>
<ol>
  <li><b>Edge.</b> The CDN serves images, scripts and pre-rendered sale pages, which are pushed out before the start time, with an origin shield so a miss storm cannot reach the origin. Product pages split into a long-cached static part and a small JSON call for price and stock, cached for 1 to 5 seconds. The stock shown is coarse: in stock, low, sold out, never an exact count.</li>
  <li><b>Gateway.</b> Token-bucket limits per user and per IP, bot filtering, and a concurrency limit per service. Under overload it sheds low-priority traffic first and answers 503 with a retry hint.</li>
  <li><b>Services.</b> Catalogue (read-only, heavily cached), cart (keyed by user, TTL, fine to lose), inventory, orders and payments. Recommendations, reviews and personalisation are optional: each call has a short timeout (around 100 to 200 ms), a circuit breaker and a static fallback, and checkout never depends on them.</li>
  <li><b>Data.</b> One relational primary per domain with replicas for reads, a separate search cluster, and a queue between the order commit and everything slow.</li>
</ol>
<p><b>Checkout write path.</b> The client sends an idempotency key per checkout. The order service, in one transaction, reserves stock with a conditional update (<code>available &gt;= qty</code>), writes the order as pending and writes an outbox row. Then it calls the payment provider with a key derived from the order id. On success it confirms the order. On failure or expiry (say 10 minutes) it releases the reservation. Invoices, warehouse messages, emails and analytics read the outbox through a queue, so the warehouse consumes at its own pace and a slow downstream never blocks a customer.</p>
<p><b>Stock rule.</b> Reserve at order placement, not at add-to-cart. Carts are cheap and abandoned constantly; reserving there would lock stock that nobody pays for.</p>
<p><b>Hard problem 1: the hot SKU.</b> Split its stock into buckets (20 rows of 5,000 for a 100,000-unit item) and pick a bucket per request. Put an atomic counter in an in-memory store in front as an admission gate: only requests that decrement it successfully go on to the database (if the chosen bucket is empty, try another), a released or expired reservation adds the unit back to both the counter and the database, and the counter can be rebuilt from the database after a restart. When it reaches zero the product flips to sold out at the edge. Everything after that is a cheap cached answer, not a lock queue on a dead item.</p>
<p><b>Hard problem 2: keeping checkout alive.</b> Priorities decide what to drop: shed recommendations and suggestions first, search second, checkout last. Retries happen at one layer only (the client, with backoff and jitter), and servers enforce a retry budget; otherwise 3 attempts across 3 layers is 27 times the load on a service that is already struggling.</p>
<p><b>Before the event.</b> Autoscaling reacts in minutes and the spike arrives in seconds, so scale up ahead of time and warm caches. Load test at 1.5× the forecast, freeze deploys, give every non-essential feature a kill switch, and tell the payment provider the expected rate in advance, since its limits apply to you too.</p>`,
      tradeoffs: `<ul>
  <li><b>Reserve at cart vs at checkout.</b> Cart reservation is friendlier but ties up stock for people who never pay. Pick checkout; flip to cart-time holds with short timers for extremely scarce, high-value items.</li>
  <li><b>Pre-scaled capacity vs autoscaling.</b> Autoscaling is cheap on normal days but too slow for a spike that arrives in seconds. Pick pre-scaling for the known event; keep autoscaling for the unexpected remainder.</li>
  <li><b>Exact stock display vs coarse badge.</b> Exact counts cost a read of the hottest row on every page view. Pick coarse states with a few seconds of cache; flip to exact only on the final purchase step.</li>
  <li><b>Waiting room vs plain load shedding.</b> A queue is fairer and protects checkout, but adds a component and delays everyone. Plain shedding is simpler but random. Pick a waiting room only for the hottest launches, and rate-limit everywhere else.</li>
      <li><b>Synchronous order confirmation vs queue-then-confirm.</b> Confirming only after the order row commits is honest and simple; accepting the request into a queue and confirming later absorbs bigger bursts but leaves customers unsure. Pick the synchronous commit, since 278 orders a second is easy; flip to queue-then-confirm for a single item that draws tens of thousands of buyers a second.</li>
</ul>`,
      followups: [
        "The recommendation service starts taking 5 seconds per call. Trace what happens to the product page and to checkout.",
        "A cache cluster restarts mid-sale. How do you stop the database being flattened by the misses?",
        "How would you prevent overselling if the stock counter in memory and the database disagree?",
        "How would you stop a script from buying out the limited item in the first second?",
        "What do you monitor during the event, and what is your first action if checkout errors reach 2%?",
      ],
      slips: `<ul>
  <li>Saying "add autoscaling" and stopping. Spikes outrun it, and a database primary cannot be scaled up in seconds.</li>
  <li>Caching everything for a long time, including price and stock, or caching nothing and hitting the database with 180,000 reads a second.</li>
  <li>Locking stock at add-to-cart.</li>
  <li>Letting checkout call recommendations or reviews synchronously with no timeout or fallback.</li>
  <li>Retrying at every layer with no budget.</li>
  <li>Ignoring the single hot row; sharding the database does not help when every request wants the same SKU.</li>
  <li>Forgetting that the payment provider and warehouse systems have their own limits.</li>
      <li>Never saying how the design degrades. A sale design with no list of what to switch off first is only half finished.</li>
</ul>`,
    },
  },
  {
    id: "razorpay-subscription-billing",
    company: "razorpay",
    title: "Design a subscription billing platform on top of a payments system",
    prompt:
      "Design a subscription billing platform that sits on top of an existing payments system. It needs plans with monthly and yearly prices, free trials, mid-cycle upgrades and downgrades, retries for failed payments, and invoices, for 5 million subscriptions.",
    level: "SDE-2 and above",
    kind: "hld",
    evidence: "guide",
    sources: [
      {
        label: "Space Complexity: Razorpay onsite interview",
        url: "https://spacecomplexity.ai/blog/razorpay-onsite-interview",
        kind: "prep-guide",
        year: 2026,
      },
      {
        label: "HireStepX: Razorpay interview questions 2026",
        url: "https://hirestepx.com/blog/razorpay-interview-questions-2026",
        kind: "prep-guide",
        year: 2026,
      },
    ],
    chapters: [
      "sysdes-walkthrough-payments",
      "sysdes-transactions-isolation",
      "sysdes-message-queues-async",
      "sysdes-time-ordering-ids",
    ],
    answer: {
      ask: `<p>I would ask: is billing in advance (pay for the coming period) or in arrears (pay for usage)? Are prices per seat or flat? Do all customers bill on the same calendar day, or on the anniversary of signup? Which currencies and which taxes? Must access stop the moment a payment fails, or after a grace period? Is the payments layer an existing internal service with idempotency keys and webhooks?</p>
<p>I would assume advance billing at flat prices, anniversary billing, an existing payments service I can call with idempotency keys, a grace period on failure, and 5 million subscriptions (about 80% monthly, 20% yearly). <b>In scope:</b> plans, subscription state, scheduler, invoices, proration, retries (dunning), entitlement events. <b>Out of scope:</b> the payments layer, tax rules and revenue accounting beyond posting entries.</p>`,
      numbers: `<p>Planning figures for the exercise, not facts about any company.</p>
<ul>
  <li><b>Charges:</b> 4,000,000 monthly subs ÷ 30 = about 133,000 a day; 1,000,000 yearly ÷ 365 = about 2,700 a day. Total about 136,000 a day, which is 136,000 ÷ 86,400 = <b>1.6 a second</b> on average.</li>
  <li><b>The calendar trap:</b> if every monthly customer bills on the 1st and the job runs over 4 hours, 4,000,000 ÷ 14,400 = about <b>278 charges a second</b>. At about 2 seconds per provider call, that is roughly 556 calls in flight, and it lands on the provider's rate limits, not on your database. Anniversary billing flattens it by a factor of about 30.</li>
  <li><b>Failures:</b> at an assumed 5% first-attempt failure, 133,333 × 0.05 = about 6,700 a day. Four retries bound the extra attempts at roughly 27,000 a day, tiny.</li>
  <li><b>Invoices:</b> about 4.1 million a month at 1 KB of data each is about 4 GB a month, roughly 50 GB a year. Rendered PDFs at 50 KB are about 200 GB a month, which belongs in object storage, produced asynchronously.</li>
</ul>
<p>The numbers say one relational primary is plenty. The real limits are the payments provider, correctness, and the day everyone bills at once.</p>`,
      design: `<p><b>Components.</b> A plan catalogue (versioned prices), a subscription service (the state machine), a billing scheduler, an invoice service, the payments service (existing), a dunning service, an event stream for entitlements, and a ledger hook.</p>
<p><b>Data model.</b></p>
<ul>
  <li><code>subscriptions(sub_id, customer_id, plan_id, price_version, status, current_period_start, current_period_end, next_billing_at, anchor_day, trial_end, cancel_at_period_end, version)</code>. Index on <code>(status, next_billing_at)</code>.</li>
  <li><code>invoices(invoice_id, sub_id, period_start, period_end, status, total, currency)</code> with a <b>unique index on <code>(sub_id, period_start)</code></b>.</li>
  <li><code>invoice_lines(invoice_id, kind, amount)</code> where kind is plan, proration credit, proration charge, tax or discount.</li>
  <li><code>payment_attempts(invoice_id, attempt_no, idempotency_key, psp_ref, outcome)</code>.</li>
</ul>
<p>Subscription status runs trialing, active, past_due, then canceled or unpaid, with paused as a side state. Transitions are compare-and-set on <code>version</code>, with each move logged.</p>
<p><b>Billing cycle.</b></p>
<ol>
  <li>Workers claim due subscriptions in small batches with <code>SELECT ... FOR UPDATE SKIP LOCKED</code> on <code>next_billing_at</code>, so many workers share the work without colliding.</li>
  <li>In one transaction, create the invoice (the unique index means a rerun creates nothing), advance the period and <code>next_billing_at</code>, and write an outbox row.</li>
  <li>A collection worker calls the payments service with key <code>invoice_id:attempt_no</code>. The key stays the same across retries of the same attempt, so a timeout cannot produce two charges. A timeout is unknown, not failed; reconcile before trying anything new.</li>
  <li>The webhook or response marks the invoice paid, de-duplicated by event id, and emits "subscription renewed". A failure moves the subscription to past_due and starts dunning.</li>
</ol>
<p><b>Proration.</b> Prices are copied by version onto the subscription so a catalogue change never silently reprices existing customers. For an upgrade on day 10 of a 30-day cycle, from 10,000 to 20,000 minor units: credit for unused time is 10,000 × 20/30 = 6,667, charge for the new plan is 20,000 × 20/30 = 13,333 (both rounded), net 6,666 due now. Use integer minor units with a fixed rounding rule. Charge upgrades immediately; apply downgrades at the end of the period.</p>
<p><b>Trials.</b> A trial sets <code>next_billing_at</code> to the trial end. A reminder goes out a few days earlier. Ending the trial is simply the first invoice.</p>
<p><b>Dunning.</b> Classify declines. A hard decline (invalid or closed card) stops retries and asks for a new payment method; a soft one (insufficient funds, issuer unavailable) retries on a schedule such as days 1, 3, 5 and 7. Respect card network and provider guidance on retry limits (check the current rules). A new payment method triggers an immediate retry. After a grace period, entitlement ends and the subscription becomes unpaid or canceled.</p>
<p><b>Entitlements.</b> Product services consume subscription events and cache the answer; they never call billing on a user request.</p>
<p><b>Dates.</b> Store periods as UTC instants and keep the anchor day separately, so a subscription anchored on the 31st bills on the last day of short months and returns to the 31st afterwards.</p>
<p><b>Immutability.</b> A finalised invoice is never edited. Corrections are credit notes, and the ledger gets entries for receivable and cash.</p>`,
      tradeoffs: `<ul>
  <li><b>Anniversary vs calendar billing.</b> Anniversary spreads load evenly and avoids a thundering herd on the provider. Calendar billing makes finance reports and business invoices simpler. Pick anniversary for self-serve; flip to calendar for business customers who want one invoice a month, and then stagger by customer group.</li>
  <li><b>Polling the database vs a delay queue.</b> A polling scheduler on an indexed column is simple, restartable and visible. A delay queue is a second store that can drift from the subscription table. Pick polling; flip to partitioned schedulers when one table scan no longer fits comfortably in the window.</li>
  <li><b>Immediate vs deferred proration.</b> Immediate charges surprise customers but keep revenue accurate. Deferring to the next invoice is gentle but hides cost. Pick immediate for upgrades and deferred credits for downgrades; flip when customer support sees too many disputes.</li>
  <li><b>Cut access at once vs a grace period.</b> Cutting off is strict, but many failures are temporary. Pick a grace period; flip to a short one for high-cost services where unpaid use is expensive.</li>
</ul>`,
      followups: [
        "A customer upgrades twice in one day. How do you make the invoices and credits come out right?",
        "The payment call times out during renewal. What state is the invoice in and what does the retry job do?",
        "How would you migrate customers to a new price without surprising them?",
        "How would you give a customer a refund for the unused part of a yearly plan?",
        "Billing is down for two hours at the start of the month. How do you catch up without double-charging anyone?",
      ],
      slips: `<ul>
  <li>Retrying a timed-out charge with a new idempotency key, which can create a second charge. Only a definite decline earns a new attempt number.</li>
  <li>Billing everyone at the same time on the 1st with no jitter and no check of the payment provider's rate limits.</li>
  <li>No unique key on (subscription, period), so a restarted scheduler double-invoices.</li>
  <li>Editing invoices after finalisation instead of issuing credit notes.</li>
  <li>Using floating-point math for proration, or ignoring the end-of-month case.</li>
  <li>Calling the billing service on every user request to check access.</li>
  <li>Retrying declines forever, which annoys customers and can breach network rules.</li>
      <li>Treating entitlement as a column the app reads at request time, so a billing outage logs every paying customer out.</li>
</ul>`,
    },
  },
];
