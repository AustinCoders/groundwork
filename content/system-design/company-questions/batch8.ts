import type { CompanyQuestion } from "./types";

export const questions: CompanyQuestion[] = [
  {
    id: "zerodha-market-data-fanout",
    company: "zerodha",
    title: "Design live market data delivery to many clients",
    prompt:
      "Design a system that streams live price updates for about 5,000 traded instruments to 1 million connected users during market hours. Each user watches a list of up to 50 instruments, and a price change should reach the screen within a few hundred milliseconds.",
    level: "level not stated",
    kind: "hld",
    evidence: "guide",
    sources: [
      {
        label: "Zerodha interview process round by round (DesignGurus)",
        url: "https://www.designgurus.io/answers/detail/what-is-the-zerodha-interview-process-like-round-by-round",
        kind: "prep-guide",
      },
    ],
    chapters: [
      "sysdes-load-balancing-depth",
      "sysdes-message-queues-async",
      "sysdes-scaling-vertical-horizontal",
      "sysdes-observability-scale",
    ],
    answer: {
      ask: `<p>First questions: where do the raw prices come from, and do I receive them as one stream I can read? Do users need every tick, or the latest price a few times a second? Is there a paid tier with deeper data, such as the full order book? Is the audience on mobile networks that drop often? Must a user see the same price as another user at the same instant, or is "within a fraction of a second" enough?</p>
<p>Assumed scope: one normalised price stream comes in; users hold a WebSocket, subscribe to up to 50 instruments, and get the latest price, change and volume. <b>In scope:</b> ingest, fan-out, subscriptions, reconnects, monitoring. <b>Out of scope:</b> order placement, charts and history, the order book, and the exchange connection itself.</p>`,
      numbers: `<p>These are planning figures for the exercise, not facts about any real broker.</p>
<ul>
  <li><b>Inbound:</b> assume 2,000 of the 5,000 instruments are actively trading, at 5 ticks a second each: 2,000 × 5 = <b>10,000 ticks a second</b>. At the market open, plan a 5× burst: 50,000 a second. At 100 B a tick that is 1 MB a second steady and 5 MB a second at the burst. Tiny.</li>
  <li><b>Connections:</b> 1,000,000 users on boxes that hold 250,000 connections at best means at least 4 boxes. With 50 KB per connection that is 50 GB of memory in total.</li>
  <li><b>Naive fan-out:</b> 1,000,000 users × 50 instruments ÷ 5,000 = 10,000 watchers per instrument on average. Sending every tick to every watcher is 10,000 × 10,000 = <b>100 million messages a second</b>. Not buildable.</li>
  <li><b>Conflated fan-out:</b> one frame per connection every 250 ms is 4 a second. 1,000,000 × 4 = <b>4 million frames a second</b>, 25 times fewer. Assume 20 changed instruments × 16 B plus 80 B of framing, about 400 B a frame: 4,000,000 × 400 B = 1.6 GB a second, about 12.8 Gbps in total.</li>
  <li>Spread over 20 gateway boxes: 50,000 connections, 200,000 frames and about 0.64 Gbps each.</li>
</ul>
<p>The numbers say the input is small and the output is the problem. Fan-out must happen in the gateways, close to the sockets, and it must be conflated by time rather than by tick.</p>`,
      design: `<p><b>Components.</b> A feed handler that reads the upstream stream and normalises it; a replicated log; a gateway tier holding WebSockets; a small subscription and auth service; a load balancer in front; and metrics everywhere.</p>
<p><b>Ingest path.</b></p>
<ol>
  <li>The feed handler decodes each tick into a compact record: instrument id, last price, volume, exchange timestamp, the upstream sequence number for that instrument (so both feed handlers stamp the same value), and our own ingest timestamp.</li>
  <li>It appends to a replicated log (a Kafka-style topic, partitioned by instrument id so ticks for one instrument stay in order). Run two feed handlers, one active and one standby, and let the sequence number drop duplicates after a failover.</li>
  <li><b>Every gateway reads the whole stream</b>, each as its own consumer group. At 1 MB a second that costs a gateway almost nothing, and it removes any need to route ticks to the "right" gateway.</li>
</ol>
<p><b>Gateway state.</b> Each gateway keeps a table of the latest tick per instrument (5,000 × 100 B = 500 KB) and an inverted index from instrument to the local connections watching it. A connection has a subscription list (capped at 50), a small "pending" map holding at most one entry per instrument, and a send buffer with a hard limit.</p>
<p><b>Delivery loop.</b> A tick updates the latest table and marks the instrument dirty. Every 250 ms a flush pass walks the dirty instruments, copies the latest value into each watcher's pending map, then writes one binary frame per connection that has changes. Frames carry absolute prices, not deltas, so a dropped or skipped frame heals itself on the next one. On subscribe, the gateway answers at once with the latest values from its table, so the screen is never blank.</p>
<p><b>Slow clients.</b> Because pending maps hold only the newest value per instrument, a slow phone costs bounded memory. If its send buffer stays full for several seconds, close the socket and let the app reconnect. One bad connection must never stall the flush for the other 50,000.</p>
<p><b>Hard problem 1: the open and reconnect storm.</b> At the open, a large share of users connect in the same minute, and if a gateway dies, 50,000 clients reconnect together. Clients reconnect with exponential backoff and random jitter; 1,000,000 reconnecting over 60 s is about 17,000 a second, which the load balancer and token check can absorb. Pre-scale the gateway tier before the open instead of reacting to it, and ban deploys during market hours.</p>
<p><b>Hard problem 2: hot instruments.</b> A few instruments are on far more watchlists than the average. That is harmless here, since each gateway holds only its own share (about a twentieth) of those watchers and the work stays inside the box.</p>
<p><b>Observability.</b> The ingest timestamp rides with every tick. When the gateway writes it to a socket it records the difference, so you get a histogram of tick-to-socket latency per gateway. Alert on p99 above about 500 ms, on send-buffer disconnects, on the connection count per box, and on log consumer lag. Run a synthetic client in each region that subscribes and checks prices against the source.</p>`,
      tradeoffs: `<ul>
  <li><b>Conflated frames vs every tick.</b> Conflation cuts the outbound work 25-fold and gives a steady rhythm, at the cost of up to 250 ms of added delay and skipped intermediate ticks. Pick conflation for watchlists. Flip to per-tick delivery for a small set of users on a single-instrument depth screen, on a separate tier.</li>
  <li><b>Every gateway reads everything vs routing by instrument.</b> Reading everything is simple and fails gracefully. Routing saves bandwidth but needs a map of who watches what and a rebalance whenever a gateway moves. Flip to routing when the stream grows past what a gateway can parse (full depth data at hundreds of thousands of messages a second).</li>
  <li><b>WebSocket vs polling.</b> A socket gives push and low overhead but needs sticky state and careful draining. Polling every second from 1,000,000 clients is 1,000,000 requests a second, which is far worse. Offer a polling fallback only for networks that block sockets.</li>
  <li><b>Few big gateways vs many small ones.</b> Big boxes mean fewer connections to manage but a larger blast radius and a heavier reconnect wave. Choose about 20 boxes so one failure is 5% of users; flip to bigger boxes if the operations cost dominates.</li>
</ul>`,
      followups: [
        "A gateway falls behind the log by 30 seconds. What does it do with the backlog: replay it, or jump to the latest?",
        "How would you give a small group of premium users every tick for one instrument without hurting everyone else?",
        "How do you deploy a new gateway version without dropping 50,000 connections at once?",
        "Two users compare screens and see different prices for the same instrument. Is that a bug, and how would you bound it?",
        "How would you protect the system if one client opens 500 connections or subscribes to every instrument?",
      ],
      slips: `<ul>
  <li>Publishing each tick to each user through a general message queue. Count the messages first: it is 100 million a second.</li>
  <li>Putting the latest price in a shared cache and having every client poll it, which turns a push problem into a very large read problem.</li>
  <li>Sending deltas with no recovery path. One lost frame leaves a wrong price on screen until the next full refresh.</li>
  <li>Unbounded per-connection buffers, so one slow phone eats memory on the box.</li>
  <li>Ignoring reconnect behaviour: no jitter, so a single failure turns into a storm.</li>
  <li>Forgetting to measure tick-to-screen latency, so nobody knows the target is being missed.</li>
</ul>`,
    },
  },
  {
    id: "ola-nearby-cabs",
    company: "ola",
    title: "Show nearby cabs for riders inside a city",
    prompt:
      "Design the feature that shows nearby available cabs on a rider's map. Assume 100,000 drivers online in the busiest city, each reporting a location every 4 seconds, and 150,000 riders with the map open. Also decide whether a pickup point lies inside a defined zone, such as an airport area.",
    level: "SDE-2",
    kind: "hld",
    evidence: "one",
    sources: [
      {
        label: "GfG: Ola Cabs SDE-2 Set 4 (interview date not stated, page updated 2025)",
        url: "https://geeksforgeeks.org/ola-cabs-interview-experience-set-4-for-sde-2",
        kind: "candidate-report",
      },
    ],
    chapters: [
      "sysdes-sharding-partitioning",
      "sysdes-caching-fundamentals",
      "sysdes-consistency-models",
      "sysdes-case-studies",
    ],
    answer: {
      ask: `<p>Questions I would ask: is the map a browsing view only, or does it also feed booking and driver matching? How fresh must a cab marker be, and is smooth movement on the map required? How many cabs should be shown, and does the rider choose a vehicle type? Which zones matter: airports, no-pickup areas, city service limits, surge areas? How often do zones change?</p>
<p>Assumed scope: drivers report location and status; riders see up to 10 available cabs nearby; a zone check answers "is this point inside zone X". <b>In scope:</b> location ingest, the proximity query, caching, the polygon check. <b>Out of scope:</b> matching and dispatch, routing, pricing, and the trip itself.</p>`,
      numbers: `<p>Planning figures for the exercise, not facts about any company.</p>
<ul>
  <li><b>Writes:</b> 100,000 drivers ÷ 4 s = <b>25,000 location updates a second</b>. That is five times the 5,000 committed writes a second a relational primary can be planned for.</li>
  <li><b>State size:</b> 100,000 drivers × 100 B = 10 MB. The whole city's live positions fit in memory on one box. The problem is the update rate and availability, not size.</li>
  <li><b>Reads:</b> 150,000 riders ÷ 5 s refresh = <b>30,000 reads a second</b>, past the 20,000 simple reads a second one box does.</li>
  <li><b>Grid:</b> a city of about 1,000 km² cut into cells of about 1 km² is 1,000 cells, so about 100 drivers per cell on average; a dense downtown cell might hold 1,000. A query reads a cell plus its 8 neighbours: about 900 candidates on average, a few thousand in the worst case. Distance maths on that is cheap.</li>
  <li><b>Cache effect:</b> if each cell's driver list is rebuilt every 2 s, that is 1,000 ÷ 2 = 500 rebuilds a second however many riders ask.</li>
  <li><b>Trail logging:</b> storing every ping is 25,000 × 100 B = 2.5 MB a second, about 216 GB a day. Sampling one in five gives about 43 GB.</li>
</ul>
<p>The numbers force an in-memory, partitioned index, a cell-level cache for reads, and a separate, sampled path for history.</p>`,
      design: `<p><b>Components.</b> A gateway that accepts driver pings; a location service holding the live index in memory; a read API for riders; a cell-snapshot cache; a log for history; and a zone service.</p>
<p><b>Data model (in memory).</b></p>
<ul>
  <li><code>drivers: driver_id -> {lat, lng, cell, status, vehicle_type, seq, updated_at}</code>.</li>
  <li><code>cells: cell_id -> set of driver_id</code>, where <code>cell_id</code> is a geohash or similar grid code at roughly 1 km precision. Keep one set per vehicle type if filters are common.</li>
</ul>
<p>The index is partitioned by region: the city is divided into a few coarse regions, each owned by one shard with a hot replica. A shard owns every cell inside its region, so a rider's 9-cell query normally hits one shard (two near a region edge).</p>
<p><b>Write path.</b></p>
<ol>
  <li>A ping arrives with driver id, position, timestamp and a per-driver sequence number.</li>
  <li>The gateway routes it to the owning shard by its cell. The shard ignores the ping if the sequence is older than what it holds, which handles out-of-order delivery.</li>
  <li>It updates the record. If the cell changed, it removes the driver from the old cell set and adds it to the new one. If the new cell belongs to another shard, send the update there and let the old entry expire; a driver on a boundary can appear in both shards for up to 12 s, so the API de-duplicates by driver id.</li>
  <li>Entries expire after 12 s without a ping (three missed pings), so crashed phones disappear without anyone telling us.</li>
  <li>Every fifth ping is also appended to a log for trip history and analytics. That log is not on the serving path.</li>
</ol>
<p>The index is rebuilt from incoming pings within one interval, so it needs no durable database. A replica takes over if a shard dies, and the first pings after a restart refill the rest.</p>
<p><b>Read path.</b> The rider app sends its position. The API computes the rider's cell and its 8 neighbours, takes each cell's cached snapshot (a list of driver ids and positions, rebuilt every 2 s), filters to available drivers of the requested type, sorts by straight-line distance, and returns 10. The app interpolates markers between refreshes, so movement looks smooth without a faster poll. If fewer than 10 are found, widen to the next ring of cells up to a maximum radius.</p>
<p><b>Consistency.</b> The map is a hint. A marker can be several seconds old (up to about 6 s when the API reads it: 4 s between pings plus up to 2 s of snapshot age, then the rider's 5 s poll on top), and a driver shown as available may have just taken a trip. The authoritative state lives in the trip service, and dispatch makes a conditional update from available to offered, so two riders cannot get the same driver. This is the line between eventual and strong consistency: browsing tolerates staleness, assignment does not.</p>
<p><b>Dense and sparse areas.</b> A fixed grid wastes work in a crowded cell and finds nothing in a thin one. Cap candidates per cell by taking the freshest N, and use ring expansion for sparse areas.</p>
<p><b>Zone check.</b> Polygons (airport, service area, restricted pickup) are loaded into memory on every instance of the zone service, versioned, with a bounding box for each. At load time, record for each grid cell which polygons touch it and whether the cell is fully inside one. A lookup finds the point's cell: if no polygon touches it, answer outside; if the cell is fully inside one, answer inside; otherwise run a ray-casting point-in-polygon test on the few candidate polygons. With 10 candidates of 500 vertices that is 5,000 edge tests, microseconds of work. Define boundary points consistently and support polygons with holes.</p>`,
      tradeoffs: `<ul>
  <li><b>In-memory sharded index vs Redis geo sets.</b> A geo set is quick to adopt and good enough for the first version, but members cannot expire one by one, so you sweep stale drivers yourself and the cell filter options are limited. A custom in-memory index gives per-driver expiry and vehicle-type sets. Start with the managed structure; flip to custom when expiry and filtering get awkward.</li>
  <li><b>Fixed grid vs adaptive tree.</b> A fixed grid is trivial and cache-friendly. A quadtree adapts to density but is harder to cache and move between shards. Pick the grid with a cap per cell; flip to a tree if downtown cells routinely exceed a few thousand drivers.</li>
  <li><b>Polling vs push for the map.</b> Polling every 5 s is simple and caches by cell. Push gives smoother markers but needs one subscription per rider. Poll for browsing; switch to a push stream only after booking, for one tracked driver.</li>
  <li><b>Straight-line vs road ETA.</b> Straight-line distance is fast and good for ranking a list; road time is what the rider cares about but costs a routing call. Use straight-line for the 10 on screen and road time only for the top 3. Flip to road-first where rivers and one-way grids make the two differ widely.</li>
</ul>`,
      followups: [
        "A big concert ends and 20,000 riders open the app inside two cells. What breaks first, and how do you protect it?",
        "How would you handle a driver driving along a shard boundary, flipping between two regions?",
        "How would you scale the same design from one city to a whole country?",
        "How would you detect and ignore drivers who send fake locations?",
        "How would the zone check change if zones were updated every few minutes, for surge?",
      ],
      slips: `<ul>
  <li>Writing every ping to a relational table and indexing latitude and longitude. At 25,000 writes a second, the primary cannot keep up.</li>
  <li>Searching a single cell and missing a cab 50 m away across the cell edge. Always query the neighbours.</li>
  <li>Treating the map as the booking truth, so two riders are given the same driver.</li>
  <li>No expiry, so drivers who went offline stay visible as ghost cars.</li>
  <li>Running the point-in-polygon test against every polygon in the country on each request instead of narrowing by bounding box or cell first.</li>
  <li>Using straight-line distance as the promised pickup time.</li>
</ul>`,
    },
  },
  {
    id: "dream11-lineup-reminder",
    company: "dream11",
    title: "Notify users about their lineup 30 minutes before a match",
    prompt:
      "Design a service that sends each user who has entered a fantasy contest a reminder 30 minutes before the match starts, with their lineup status. On the busiest match about 5 million users have entered, several matches can overlap, and the start time can move.",
    level: "SDE-2",
    kind: "hld",
    evidence: "several",
    sources: [
      {
        label: "GfG: Dream11 SDE-2 interview experience (interviews Mar-Apr 2024)",
        url: "https://www.geeksforgeeks.org/interview-experiences/dream11-interview-experience-for-sde-2/",
        kind: "candidate-report",
        year: 2024,
      },
      {
        label: "DesignGurus: what to expect in Dream11 system design (course-vendor summary of candidate reports)",
        url: "https://www.designgurus.io/answers/detail/what-to-expect-in-the-dream11-system-design-interview",
        kind: "prep-guide",
      },
    ],
    chapters: [
      "sysdes-walkthrough-notifications",
      "sysdes-rate-limiting",
      "sysdes-batch-stream-processing",
      "sysdes-message-queues-async",
    ],
    answer: {
      ask: `<p>Questions I would ask: is the trigger a clock (30 minutes before the scheduled start) or an event (the official playing lineups being published)? What does "their lineup" mean: the user's own team, or the real teams' playing eleven? Which channels: push only, or also SMS and email? When do teams lock? How late may a reminder be before it is worthless? Can the start time move, for rain or a delayed toss?</p>
<p>Assumptions: the main trigger is a timer at start minus 30 minutes, and the message carries lineup status if the real lineups are out. A second, event-driven nudge goes to users with a player who is not playing. Push only. Teams lock at the start. <b>In scope:</b> scheduling, fan-out, dedupe, expiry. <b>Out of scope:</b> the contest engine, the content of the lineup feed, and the push provider.</p>`,
      numbers: `<p>Planning figures for the exercise, not facts about any company.</p>
<ul>
  <li><b>Audience:</b> 5,000,000 users, about 100 B per entry row: 500 MB per match. With 3 teams each, 15,000,000 teams × 500 B = 7.5 GB. Both are small enough to scan quickly.</li>
  <li><b>Delivery window:</b> a reminder is useful for the 30 minutes before lock, but we want most of them out in 5 minutes (300 s): 5,000,000 ÷ 300 = <b>about 16,700 sends a second</b>. Dumping all of it in 30 s would be 166,700 a second, more than I would ask a provider or our own workers to take in one go.</li>
  <li><b>Work units:</b> in chunks of 1,000 users there are 5,000 chunks, or about 17 chunks a second. If a worker needs about 2 s per chunk, each worker finishes 0.5 chunks a second, so about 34 workers; plan 50 for headroom.</li>
  <li><b>Timers:</b> one per match, not one per user. A thousand matches a season is a thousand timers; 5,000,000 timers is a storage and polling problem.</li>
  <li><b>Open spike:</b> if 20% of users open the app within 10 minutes, that is 1,000,000 ÷ 600 = about 1,700 opens a second, at 3 reads each about 5,000 reads a second. Compressed into one minute it is 1,000,000 ÷ 60 × 3 = 50,000 reads a second, past the 20,000 line.</li>
</ul>
<p>The numbers say: one timer per match, chunked fan-out, a spread-out send, and cached reads for the stampede that follows.</p>`,
      design: `<p><b>Components.</b> A match schedule table; a scheduler; a fan-out planner; two log topics (match events, and notification tasks); stateless workers; a dedupe store; and the shared notification pipeline that owns preferences, rate limits and the provider calls, as in the notification walkthrough.</p>
<p><b>Data model.</b></p>
<ul>
  <li><code>match_jobs(match_id, kind, fire_at, version, status)</code> with an index on <code>(status, fire_at)</code>. The version increments when the schedule changes.</li>
  <li><code>entries(match_id, user_id, team_count)</code>, partitioned by match and user, so a chunk is a key-range scan.</li>
  <li><code>sent(dedupe_key)</code> where the key is <code>match_id:user_id:kind</code>, with a TTL of a day.</li>
</ul>
<p><b>Scheduling.</b> A scheduler polls every second for rows where <code>fire_at</code> is due and the status is pending. It claims a row with a conditional update that sets a short lease, publishes a <code>reminder.due(match_id, version)</code> event, and only then marks the row done; if the scheduler dies in between, the lease expires and another instance re-claims the row, and a duplicate event is harmless because of the dedupe key. If the match is moved, update <code>fire_at</code> and bump the version; a stale event with an old version is discarded by the planner. Several scheduler instances can run, because the claim is atomic.</p>
<p><b>Fan-out.</b></p>
<ol>
  <li>The planner receives the event, checks the version and the current time, and loads the lineup if it exists.</li>
  <li>It splits the entry table into key-range chunks of about 1,000 users and publishes one task per chunk onto the tasks topic, partitioned so the chunks of a big match spread across all partitions.</li>
  <li>A worker takes a chunk, loads each user's preferences and teams, builds the message (including "2 of your players are not in the eleven" when known), checks the dedupe key, and hands the batch to the notification pipeline, throttled to the provider's rate.</li>
  <li>The dedupe key is recorded when the provider accepts the message. A crash after sending and before recording can send twice; that is a rare, accepted cost.</li>
</ol>
<p>Every task carries an <code>expires_at</code> equal to the match start. A worker that picks it up late drops it, since a reminder after lock helps nobody.</p>
<p><b>The lineup stream.</b> When the real lineup is published, an event on the match-events topic triggers a second planner pass. It joins the lineup with team data and notifies only the users whose team has an absent player, under a different dedupe kind. That is a smaller audience and a much more useful message.</p>
<p><b>Isolation, small and large.</b> A small contest goes through the same path with one chunk. Give each match its own quota of in-flight chunks so a 5-million-user match cannot starve a small one. Put the reminder at higher priority than marketing, but below one-time passcodes.</p>
<p><b>The stampede after the push.</b> The lineup is one document per match, cached and served from memory. User teams are cached for a short time. The send is spread over the 5-minute window to flatten the open spike. Per-user limits stop reminders from stacking.</p>`,
      tradeoffs: `<ul>
  <li><b>One timer per match vs per-user scheduled tasks.</b> One timer plus a fan-out at fire time reads fresh data and handles late entrants, but the fire moment is a burst. Per-user tasks spread out naturally but cost millions of rows and go stale when the match moves. Pick one timer; flip to pre-created tasks only if the scan cannot finish inside the window.</li>
  <li><b>Personalised vs one generic broadcast.</b> A generic message is trivially cheap but ignores whether the user is affected. Personalised costs a join per user. Send the reminder to everyone, with the lineup line added only when it is known, and the separate nudge only to affected users.</li>
  <li><b>At-least-once with dedupe vs at-most-once.</b> A missed reminder is worse than a rare duplicate, so retry and dedupe. Flip to at-most-once if the channel is expensive or a duplicate is harmful, such as SMS.</li>
  <li><b>Spread the send vs send as fast as possible.</b> Spreading flattens the follow-up traffic but delays the last user by minutes. Pick a 5-minute window; flip to a faster send for small matches where the stampede is no risk.</li>
</ul>`,
      followups: [
        "The match start moves back by two hours after the reminder has already gone out. What do you send, and to whom?",
        "A worker crashes halfway through a chunk. How do you make sure no one is missed or notified twice?",
        "How would you handle users with several devices, or a device token the provider reports as invalid?",
        "How would you test this on a quiet day without notifying real users?",
        "Two big matches start in the same half hour. How do you stop one from starving the other?",
      ],
      slips: `<ul>
  <li>Creating a timer or a scheduled job per user. The scheduler becomes the bottleneck and a reschedule means rewriting millions of rows.</li>
  <li>Looping over all 5 million users in a single process with no chunks, no checkpoint, and no way to resume.</li>
  <li>No expiry, so a delayed worker sends "starts in 30 minutes" after the match began.</li>
  <li>No dedupe key, so a retry sends the same push twice.</li>
  <li>Forgetting that a notification causes traffic: 5 million pushes in 30 seconds produce an app stampede.</li>
  <li>Letting marketing sends share the same queue and block time-critical reminders.</li>
</ul>`,
    },
  },
  {
    id: "myntra-review-feed",
    company: "myntra",
    title: "Design a review-based feed with caching, push and pull",
    prompt:
      "Design a feed where shoppers scroll through product reviews and style posts from people and brands they follow, mixed with popular reviews from categories they browse. Assume 20 million daily users who open the feed 10 times a day, and some brand accounts with 5 million followers.",
    level: "senior SDE",
    kind: "hld",
    evidence: "several",
    sources: [
      {
        label: "Myntra Interview Experience for Senior SDE (GeeksforGeeks, undated)",
        url: "https://www.geeksforgeeks.org/?p=369559",
        kind: "candidate-report",
      },
      {
        label: "What to expect in the Myntra system design interview (DesignGurus)",
        url: "https://www.designgurus.io/answers/detail/what-to-expect-in-the-myntra-system-design-interview",
        kind: "prep-guide",
      },
    ],
    chapters: [
      "sysdes-walkthrough-medium",
      "sysdes-caching-fundamentals",
      "sysdes-message-queues-async",
      "sysdes-case-studies",
    ],
    answer: {
      ask: `<p>First questions: what is an item in the feed: a review with photos, a style post, or both? Whose items appear: followed people and brands only, or also popular reviews for products and categories I look at? Is ranking by time, or by helpfulness and relevance? Do reviews pass moderation before they show? How fresh must the feed be, and how large can a follower list get?</p>
<p>Assumed scope: items come from followed accounts, blended with popular category reviews; newest first with a light popularity boost; reviews appear only after moderation. <b>In scope:</b> publish, fan-out, feed read, caching, pagination, deletes. <b>Out of scope:</b> the ranking model itself, the review authoring UI, abuse detection, and search.</p>`,
      numbers: `<p>Planning figures for the exercise, not facts about any company.</p>
<ul>
  <li><b>Reads:</b> 20,000,000 users × 10 opens = 200,000,000 a day ÷ 86,400 = about 2,300 a second. A sale event might hit 10× that: <b>23,000 feed reads a second</b>, past the 20,000 line, so caching is required.</li>
  <li><b>Item lookups:</b> a page shows 20 items but hydrates about 40 candidates, so 40 × 23,000 = 920,000 item reads a second (460,000 if only the 20 shown were read). These must come from a cache of review bodies, not the primary.</li>
  <li><b>Writes:</b> 500,000 new reviews a day is about 6 a second. Creating the review is trivial.</li>
  <li><b>Fan-out on write:</b> with an average of 200 followers, 500,000 × 200 = 100,000,000 feed inserts a day, about 1,160 a second; at a 10× peak, 11,600 a second, past the 5,000 write line for a relational primary. Feed lists therefore live in a partitioned store built for it, such as an in-memory or wide-column store.</li>
  <li><b>The big brand:</b> one post to 5,000,000 followers at 20,000 inserts a second takes 5,000,000 ÷ 20,000 = 250 s, and ties up the fan-out workers while it runs.</li>
  <li><b>Feed storage:</b> 200 entries × 16 B = 3.2 KB a user; for 30,000,000 active users that is about 96 GB of raw ids and scores, and more once the store adds its own per-entry overhead, so several nodes, not one.</li>
</ul>
<p>The numbers say: cache hard, push for ordinary authors, and pull for the few huge accounts.</p>`,
      design: `<p><b>Components.</b> A review service and database; a moderation step; an outbox and queue; fan-out workers; a follower graph store; a feed store holding per-user lists of item ids; an item cache; and a feed API that assembles pages.</p>
<p><b>Data model.</b></p>
<ul>
  <li><code>reviews(review_id, product_id, author_id, rating, text, media, status, created_at)</code> with a time-sortable id, so ordering by id is ordering by time.</li>
  <li><code>follows(author_id, follower_id)</code> indexed both ways: the followers of an author for fan-out, and the authors of a follower for pull.</li>
  <li>Feed list per user: a sorted set of review ids scored by time, capped at 200 entries. It holds ids only, never content.</li>
</ul>
<p><b>Write path.</b></p>
<ol>
  <li>The review is saved as pending. Moderation approves it, and the status change and an outbox row commit in one transaction.</li>
  <li>The outbox publishes <code>review.approved</code> to a queue.</li>
  <li>If the author has fewer than about 500,000 followers (a tunable inside the 100,000 to 1,000,000 range), workers page through followers 1,000 at a time and add the id to each <em>active</em> follower's feed list, with a batched write. Adding the same id twice is a no-op because the structure is a set, so retries are safe. Inactive users (not seen for 30 days) are skipped.</li>
  <li>If the author is above the threshold, nothing is pushed. The item is written to the author's own recent-posts list and cached.</li>
</ol>
<p><b>Read path.</b></p>
<ol>
  <li>Fetch the first page of ids from the user's feed list.</li>
  <li>Pull: for each big account the user follows (typically a few dozen), read its cached recent-posts list.</li>
  <li>Blend in popular reviews for the user's top categories from a shared, global list refreshed every few minutes.</li>
  <li>Merge, de-duplicate and sort by score. Fetch about twice the page size as candidates.</li>
  <li>Hydrate the ids with a multi-get against the item cache, dropping anything deleted, hidden, or from an account the user blocked. Return 20.</li>
</ol>
<p><b>Pagination.</b> Use a cursor made of the last item's (score, id), not an offset, so new items arriving do not shift pages and cause repeats.</p>
<p><b>Caching layers.</b> The popular-by-category list is the same for many users and has the best hit rate (cache about 5 minutes). Big-account lists are cached 10 to 30 s; they are the hottest keys, read by a large share of all opens, so also keep them in a small in-process cache on each API instance for a few seconds. The assembled first page can be cached per user for 30 s, with pull-to-refresh bypassing it. The item cache holds review bodies for about a minute; counters like helpful votes are kept separately so they can lag.</p>
<p><b>Cold and returning users.</b> A user with no feed list gets one built on first read by pulling from followed accounts, then it is maintained. A new follow back-fills the author's last ten reviews; an unfollow is applied lazily by filtering at read time.</p>
<p><b>Deletes and edits.</b> A deleted or rejected review is a tombstone: hydration drops it even if the id is still in a thousand feed lists, the tombstone is also written to the item cache so a cached body cannot outlive it, and a cleanup job removes ids later.</p>`,
      tradeoffs: `<ul>
  <li><b>Push vs pull vs hybrid.</b> Push makes reads cheap but wastes work for inactive followers and breaks on huge accounts. Pull is always fresh but multiplies read cost by accounts followed. Pick the hybrid with a threshold near 500,000 followers; lower it if fan-out workers regularly fall behind, raise it if pull reads get slow.</li>
  <li><b>Ids in the feed vs full content.</b> Ids keep feed lists small (3.2 KB a user) and make deletes and edits instant. Full copies avoid a hydration hop but multiply storage and leave stale copies. Pick ids; copy content only for a tiny fixed window if hydration latency is a problem.</li>
  <li><b>Per-user page cache vs computing each time.</b> Caching the first page cuts load on the merge step, but a user may miss something posted a second ago. Pick a 30 s cache with a refresh bypass. Flip to no page cache when freshness matters more than load.</li>
  <li><b>Time order vs ranked.</b> Time order is predictable and cheap. Ranking raises engagement but needs features and a model call per candidate. Start with time plus a popularity boost; flip to a ranker over the top 200 candidates when the product has the data and the latency budget.</li>
</ul>`,
      followups: [
        "A user follows 5,000 accounts. What breaks in the pull path, and how do you contain it?",
        "How would you remove a review from every feed within seconds after a legal takedown?",
        "A brand drops its follower count from 5 million to 400,000 overnight. What happens to its posts?",
        "How would you rank by helpfulness without recomputing a score on every read?",
        "What do you do when the feed store loses a node and a million lists vanish?",
      ],
      slips: `<ul>
  <li>Pure fan-out on write with no threshold, so one brand post queues five million writes and delays everyone else.</li>
  <li>Pure pull: a join across all followed accounts on every open, at 23,000 opens a second.</li>
  <li>Storing review content in each feed, so edits and deletes never reach the copies.</li>
  <li>Offset pagination, so a new post shifts the page and shows duplicates.</li>
  <li>Pushing to every follower including users who have not opened the app in months.</li>
  <li>Showing a review before moderation, or never filtering at read time, so removed content stays visible.</li>
  <li>Never saying how stale the feed may be.</li>
</ul>`,
    },
  },
];
