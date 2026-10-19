import type { CompanyQuestion } from "./types";

export const questions: CompanyQuestion[] = [
  {
    id: "meta-instagram-feed",
    company: "meta",
    title: "Design an Instagram-style ranked feed",
    prompt:
      "Design the home feed for a photo and short-video sharing app with 500 million daily users. Posts from accounts a user follows should show up within seconds, the feed should be ranked per viewer rather than purely newest-first, and a feed load should finish in under 300 ms.",
    level: "level not stated",
    kind: "hld",
    evidence: "guide",
    sources: [
      {
        label: "Hello Interview: Meta E5 system design guide",
        url: "https://www.hellointerview.com/guides/meta/e5",
        kind: "prep-guide",
      },
      {
        label: "DesignGurus: top system design questions for Meta",
        url: "https://www.designgurus.io/answers/detail/what-are-the-top-system-design-interview-questions-for-meta-interview",
        kind: "prep-guide",
      },
    ],
    chapters: [
      "sysdes-walkthrough-medium",
      "sysdes-case-studies",
      "sysdes-caching-fundamentals",
      "sysdes-message-queues-async",
    ],
    answer: {
      ask: `<p>I would ask four things before drawing anything. Is the home feed only accounts the viewer follows, or does it also mix in recommended posts from accounts they do not follow? How fresh must a new post be: seconds or minutes? What does the follower distribution look like, in particular how big is the largest account? And is the ranking model in scope, or do I treat the ranker as a service that takes candidates and returns scores?</p>
<p>Assumed scope: 500 million daily users, 15 feed opens each, photo and short-video posts, a follow graph, a ranked home feed with cursor paging, like and comment counts, impression logging. Out of scope: the ad auction, model training, search, direct messages, and the transcoding pipeline beyond "store media and serve it through a CDN".</p>`,
      numbers: `<p>These are planning figures for the exercise, not facts about any company.</p>
<ul>
  <li>Feed opens: 500 M × 15 ÷ 86,400 s is about 87,000 a second on average, and about 260,000 at a 3x peak.</li>
  <li>Posts: 10% of users post 1.5 times a day, so 75 M a day ÷ 86,400 is about 870 a second. That is a read-to-write ratio near 100:1.</li>
  <li>Fan-out on write at 200 followers each: 870 × 200 is about 174,000 feed appends a second. Far past 5,000 writes a second, so the feed store is partitioned and fed through a queue.</li>
  <li>Ranking: say 500 candidates per request, cut by a cheap score to 100 for the heavy model. At peak that is 260,000 × 100 = 26 M scores a second. If one ranker box does 10,000 scores a second (an assumption), that is about 2,600 boxes. This is the biggest cost line, so it gets a deadline and a fallback.</li>
  <li>Media: 260,000 feeds × 6 images × 150 KB is about 234 GB a second. A CDN carries that.</li>
  <li>Feed lists: 1 B accounts active in 30 days × 500 entries × 40 B = 20 TB. Keeping the top 100 entries in memory is 1 B × 100 × 40 B = 4 TB.</li>
</ul>
<p>What the numbers force: precompute feeds (reads are over 20,000 a second), keep media off the feed path, partition and queue the writes, and treat the ranker as the scarce resource.</p>`,
      design: `<p>Components and the happy path:</p>
<ol>
  <li><b>Post service.</b> Stores the post (post_id as a time-ordered ID, author_id, media keys, caption, visibility, created_at) partitioned by post_id. Media goes straight to object storage through a presigned URL; the post becomes visible only once renditions exist. After commit it publishes a post-created event to a durable log using an outbox row written in the same transaction, so a crash between commit and publish loses nothing.</li>
  <li><b>Graph service.</b> Follows are stored twice, as (follower_id, followee_id) and (followee_id, follower_id), because fan-out needs "who follows X" and the read path needs "whom does X follow".</li>
  <li><b>Fan-out workers.</b> Consume the log partitioned by author_id. For an author under the follower threshold (assume 100,000, a tunable between roughly 100k and 1M), append the post_id to the feed list of each follower active in the last 30 days. The append is a set-add keyed by post_id, so replays are harmless. Authors above the threshold are not fanned out at all.</li>
  <li><b>Feed store.</b> Key is user_id, value is a capped list of post IDs (about 500) in an in-memory sorted structure with a disk-backed tail. IDs only, never bodies, so an edit or delete touches one place.</li>
</ol>
<p>Read path, with a deadline on every step:</p>
<ol>
  <li>Read the stored list for the viewer, and fetch the cached recent-posts list for each large account they follow (a handful; cap it at the top 20 by affinity).</li>
  <li>Merge, then filter: posts the viewer has already seen (a per-user recent-impression set or Bloom filter), blocked or deleted authors, and visibility checks done at read time so privacy changes apply instantly.</li>
  <li>A cheap scorer (recency, affinity) trims about 500 candidates to about 100. The heavy ranker scores those using features from a feature store: viewer-author affinity, post age, early engagement. Then apply diversity rules, for example no more than two in a row from one author.</li>
  <li>Hydrate the top 20 through a post cache multi-get and a separate counter cache, return media as CDN URLs plus an opaque cursor.</li>
</ol>
<p>Hard problem one is the very large account: pushing one post to 50 million lists floods the queue and delays everyone behind it, so those authors are pulled at read time and merged. This is the hybrid from the feed walkthrough.</p>
<p>Hard problem two is stable paging under ranking. If page two is re-ranked from scratch, items move and the user sees repeats or gaps. The first request freezes a ranked candidate list for the session (cached a few minutes) and the cursor carries the snapshot time, the model version and the last position. New posts appear at the top on pull-to-refresh, not by reshuffling mid-scroll.</p>
<p>Impressions and actions are logged asynchronously to the same log, feeding the seen filter and training, never written synchronously on the read path. If the ranker misses its deadline (say 80 ms) the service returns the stored order, which is newest-first. New users with no follows and inactive users with no stored list get a feed built on demand from popular and recommended candidates.</p>`,
      tradeoffs: `<ul>
  <li><b>Fan-out on write vs fan-out on read.</b> Write-time push makes reads one list lookup but costs 174,000 appends a second and breaks on huge accounts. Read-time pull is cheap to write and expensive to read. Pick the hybrid because the follower distribution is skewed. Flip the threshold lower when queue lag shows up, higher when read-time merges get slow.</li>
  <li><b>Heavy ranking per request vs a cached ranked page.</b> Fresh ranking is more relevant but the scoring bill is the largest line item. Pick fresh ranking of a short candidate list with a deadline and a newest-first fallback. Flip to reusing a ranked page for a minute or two if the cost or tail latency is unacceptable and users tolerate it.</li>
  <li><b>Store IDs vs store post copies.</b> Copies make reads one fetch but multiply storage and make edits and deletes a chase. Pick IDs plus a hydration cache. Flip only for immutable content with a tiny fan-out.</li>
  <li><b>Strict freshness vs availability.</b> A feed that is a few seconds stale is fine, an unavailable one is not. Pick asynchronous fan-out with eventual consistency, and give the author a read-your-writes shortcut by merging their own latest post locally. Flip when a feature (a live event) needs sub-second delivery.</li>
</ul>`,
      followups: [
        "How would you change the design if a single account posted to 200 million followers and the threshold approach was too slow even for the pull side?",
        "A user unfollows an account. What happens to the posts already sitting in their stored feed list?",
        "How do you add a second candidate source, such as recommended posts from unfollowed accounts, without breaking cursor paging?",
        "The ranker's p99 doubles during an incident. What degrades, in what order, and what does the user see?",
        "How would you evaluate a new ranking model without hurting the live feed?",
      ],
      slips: `<ul>
  <li>Describing a CRUD posts table and a join on the follow table at read time, without ever doing the read-rate arithmetic that kills it.</li>
  <li>Choosing pure fan-out on write and never mentioning the account with tens of millions of followers until the interviewer does.</li>
  <li>Copying full post bodies into every follower's list, so edits and deletes become impossible to apply.</li>
  <li>Using OFFSET paging on a list that changes at the head, which produces duplicates and gaps.</li>
  <li>Treating "ranking" as a box labelled ML with no candidate stage, no feature source, no deadline and no fallback.</li>
  <li>Serving media from the API tier instead of object storage and a CDN.</li>
  <li>Fanning out to every follower, including people who have not opened the app in a year.</li>
</ul>`,
    },
  },
  {
    id: "uber-messenger-chat",
    company: "uber",
    title: "Design a Messenger-style chat app",
    prompt:
      "Design a chat service that supports one-to-one conversations and small groups for 100 million concurrent connections. Messages should arrive in under 500 ms when the recipient is online, be delivered later when they are offline, keep a scrollable history, and show sent, delivered and read states.",
    level: "SDE-2 / L4 (India)",
    kind: "hld",
    evidence: "one",
    sources: [
      {
        label: "Roundz: Uber SDE-2 (L4) interview experience",
        url: "https://roundz.substack.com/p/interview-experience-uber-sde-2-l4",
        kind: "candidate-report",
        year: 2025,
      },
    ],
    chapters: [
      "sysdes-walkthrough-medium",
      "sysdes-message-queues-async",
      "sysdes-consistency-models",
      "sysdes-storage-engines",
    ],
    answer: {
      ask: `<p>First questions: one-to-one only, or groups too, and how large can a group get? Are messages text only, or media too (media would go through object storage and a CDN, with only a reference in the message)? Do we need multiple devices per user, and message history sync on a new device? How strict is ordering and delivery: can a message be lost, can it be shown twice? Is end-to-end encryption required (it changes what the server can do)?</p>
<p>Assumed scope: text messages with attachment references, one-to-one plus groups up to a few hundred, multi-device, offline delivery, sent/delivered/read receipts, history. At-least-once delivery with client-side de-duplication, ordering within a conversation. Out of scope: voice and video calls, end-to-end key exchange, search over content, spam detection.</p>`,
      numbers: `<p>Planning figures for the exercise, not facts about any company.</p>
<ul>
  <li>Messages: 20 B a day ÷ 86,400 is about 231,000 a second on average, about 700,000 at a 3x peak.</li>
  <li>Connections: 100 M concurrent ÷ 250,000 per gateway box is 400 boxes (200 at 500,000). Memory check: 100 M × 20 KB is about 2 TB across the fleet.</li>
  <li>Storage: 20 B × 200 B per message row is 4 TB a day. Times 365 is about 1.5 PB a year, and with 3 replicas about 4.4 PB.</li>
  <li>Writes: 700,000 a second at peak ÷ 5,000 per partition is at least 140 partitions. Plan for about 300 so each runs near 2,300 a second with headroom.</li>
  <li>Receipts: unbatched, each message adds up to two more events (delivered, read), about 462,000 a second at average load (231,000 × 2). Acknowledging "up to sequence number N" collapses that.</li>
  <li>Presence: 100 M heartbeats every 30 s is about 3.3 M a second. That cannot go through a database; piggyback it on the socket's ping and keep the routing entry in memory.</li>
</ul>
<p>What the numbers force: a sharded, partitioned message store (one primary at 5,000 writes a second is nowhere close), a few hundred stateful gateways, and a routing registry kept in memory and treated as a cache.</p>`,
      design: `<p>Components:</p>
<ul>
  <li><b>Gateways.</b> Hold the WebSocket, terminate TLS, authenticate, translate frames to internal calls. They are the only stateful tier, and they stay thin so a restart costs little.</li>
  <li><b>Chat service.</b> Stateless. Validates membership, then appends the message to a durable log partitioned by conversation_id.</li>
  <li><b>Sequencer / persister.</b> One consumer owns each log partition, so it is the single writer for those conversations. It assigns the next per-conversation sequence number, writes the message, and then acks the sender. A lease epoch fences a stale owner after failover, and the new owner resumes from the last stored seq, so two owners never hand out the same number. Ordering is therefore total inside a conversation, which is the only place anyone can observe it. Never order by client timestamps.</li>
  <li><b>Message store.</b> A wide-column or LSM-based store (Cassandra-style), partition key (conversation_id, time bucket), clustering key seq. Bucketing keeps a very busy group from becoming one unbounded partition. Reads are "the last 50 before seq N", usually one range scan within a bucket.</li>
  <li><b>Inbox table.</b> Per user: conversations sorted by last activity, with last_read_seq and last_delivered_seq per device.</li>
  <li><b>Registry.</b> user_id and device to gateway node, in a sharded in-memory store with a TTL slightly over twice the heartbeat. It is a cache: if lost, gateways repopulate it on their next heartbeat.</li>
</ul>
<p>Send path: the client generates a message UUID and sends over the socket. The sequencer de-duplicates on (conversation_id, client_msg_id), so a retry after an ambiguous timeout returns the original sequence number instead of posting twice. It persists the message and acks the sender (the "sent" state). Then, for each recipient device, look up the registry, publish to that gateway's topic, and the gateway writes the frame. The device acks with the highest seq it has received, which moves the "delivered" state.</p>
<p>Offline path: no registry entry means no live socket. The message is already durable. Send a push notification through the platform push service as a wake-up only. On reconnect the device asks for <code>(conversation_id, seq &gt; last_seen_seq)</code> for each conversation with unread activity and pulls the gap. Multi-device uses exactly the same pull, since each device tracks its own cursor.</p>
<p>Groups: a small group fans out on write to member inboxes. A large group stores the message once and sends only a "new seq" nudge, with members pulling. Read receipts in large groups degrade to counts.</p>
<p>Hard problem one is the reconnect storm: when one gateway holding 250,000 sockets restarts, all clients retry at once. Require jittered exponential backoff on the client, rate-limit new connections at the gateway, and drain gateways gradually during deploys. Hard problem two is the ack ordering: ack the sender only after the message is durable, so a crash never loses an acked message; the cost is a little added latency on every send.</p>
<p>Consistency: per-conversation linearizable writes through the single sequencer, eventual propagation to recipients, and read-your-writes for the sender because the sent message is appended to its local view with the returned seq.</p>`,
      tradeoffs: `<ul>
  <li><b>Server-assigned sequence vs client or hybrid timestamps.</b> Timestamps need no coordination but clocks drift and can be set arbitrarily. Pick a per-conversation sequencer because ordering is only visible within a conversation. Flip to hybrid logical clocks if conversations must be writable in several regions at once.</li>
  <li><b>Push to inbox vs pull by cursor.</b> Push is quick for small groups, but costs N writes per message. Pull stores once. Pick push for small groups and pull for large, with the threshold set by members times message rate, and flip it as group sizes grow.</li>
  <li><b>Ack after durable write vs ack on receipt.</b> Acking early is faster but can lose an acked message in a crash. Pick ack after durable write, since a lost message is the worst chat bug. Flip for ephemeral features like typing indicators, which need no durability.</li>
  <li><b>Wide-column store vs a sharded relational database.</b> Relational gives transactions and easy ad-hoc queries; a wide-column store gives cheap sequential writes and linear scaling for append-heavy history. Pick the wide-column store at this write rate and flip back if volume is small or you need joins.</li>
</ul>`,
      followups: [
        "How do you guarantee a message sent from a phone with a flaky connection is neither lost nor duplicated?",
        "A gateway node dies. Walk through what happens to its 250,000 connections and to messages in flight to them.",
        "How would you add read receipts for a 5,000-member group without drowning the system?",
        "How do you sync history to a brand-new device that has never seen the conversations?",
        "How would you support the same conversation being written from two regions at once?",
      ],
      slips: `<ul>
  <li>Drawing "WebSocket server and a database" with no answer to how a message reaches the specific gateway holding the recipient's socket.</li>
  <li>Using client timestamps or database auto-increment IDs for ordering across partitions.</li>
  <li>Skipping idempotency, so a retried send posts the message twice.</li>
  <li>Not saying which component owns ordering, so two servers can hand out the same sequence number.</li>
  <li>Acking the sender before the message is durable.</li>
  <li>Treating presence as a table update per heartbeat, which is millions of writes a second.</li>
  <li>Forgetting the offline path: push notifications are a wake-up, not the delivery channel.</li>
  <li>Not planning for a reconnect storm after a gateway restart.</li>
  <li>Putting one conversation in one unbounded partition.</li>
</ul>`,
    },
  },
  {
    id: "apple-imessage-backend",
    company: "apple",
    title: "Design an iMessage-style messaging backend",
    prompt:
      "Design a messaging backend where each user has several devices, message contents are end-to-end encrypted so the servers cannot read them, and a message sent while a device is offline is delivered when it comes back. The service runs in more than one region.",
    level: "level not stated",
    kind: "hld",
    evidence: "guide",
    sources: [
      {
        label: "Jobmentis: Apple software engineer interview questions",
        url: "https://www.jobmentis.com/en-gb/interviews/apple/swe",
        kind: "prep-guide",
        year: 2026,
      },
      {
        label: "Codemia: Apple software engineer guide",
        url: "https://codemia.io/guides/apple-software-engineer",
        kind: "prep-guide",
        year: 2026,
      },
    ],
    chapters: ["sysdes-walkthrough-medium", "sysdes-security-basics", "sysdes-time-ordering-ids", "sysdes-replication"],
    answer: {
      ask: `<p>I would clarify: is end-to-end encryption a hard requirement, and is it the same for groups as for one-to-one? How many devices per user, and can a new device read old history? What should the server be allowed to know (it will always know who talks to whom and when)? What is the loss tolerance during a regional outage? And is the content text and small attachments, with large media going to object storage as encrypted blobs?</p>
<p>Assumed scope: one-to-one and small groups, text plus attachment references, end-to-end encrypted, about three devices per user, offline delivery, two or more regions. Out of scope: designing the cryptographic protocol itself (I will name the pieces and defer to a vetted protocol), voice and video, spam filtering of content the server cannot see.</p>`,
      numbers: `<p>Planning figures for the exercise, not facts about any company.</p>
<ul>
  <li>Users: 500 M registered, 200 M daily, about 8 B messages a day (40 per daily user). 8 B ÷ 86,400 is about 93,000 a second.</li>
  <li>Envelopes: with end-to-end encryption the sender encrypts a copy per recipient device. A one-to-one message to a user with 3 devices, from a sender with 3 devices, is 3 recipient copies plus 2 copies for the sender's other devices: 5 envelopes. 93,000 × 5 is about 460,000 a second on average, about 1.4 M at a 3x peak.</li>
  <li>Storage: at 1 KB per envelope, 8 B × 5 × 1 KB is 40 TB a day if everything were kept. The server only holds undelivered envelopes. If 2% are still waiting after a day, that is 0.8 TB a day, and with a 30-day expiry about 24 TB.</li>
  <li>Key directory: 500 M × 3 devices × 2 KB of public key material is about 3 TB. Small and cacheable.</li>
  <li>Connections: 100 M concurrently connected devices ÷ 250,000 per box is 400 gateways.</li>
  <li>Cross-region: US to Western Europe is 70 to 90 ms, so a message routed to the recipient's home region pays one such hop.</li>
</ul>
<p>What the numbers force: the unit of work is the device envelope, not the message; the inbox queue is partitioned by device; and the key directory is a cached read-mostly service.</p>`,
      design: `<p>The central idea is that the server is a blind courier. It stores and forwards ciphertext, and the clients hold the keys.</p>
<ul>
  <li><b>Key directory.</b> Maps user_id to a list of devices, each with a public identity key and a supply of one-time prekeys. Devices upload prekeys; the directory hands one out per new session. Device lists carry a version number so a sender knows when its cached list is stale. Clients should surface a key change to the user and let them verify identities out of band, because a directory that can quietly swap keys is the main attack on this design. A transparency log of key changes is the stronger answer.</li>
  <li><b>Send path.</b> The sender fetches the recipient's device list (cached by version), encrypts the message once per recipient device and per own other device using established pairwise sessions, and sends one request containing all envelopes plus a client message ID. For small groups use the same per-device fan-out. For larger groups, use a shared sender key per group, rotated whenever membership changes.</li>
  <li><b>Inbox store.</b> One queue per device, keyed (device_id, inbox_seq), value is the envelope. The server assigns inbox_seq, which only orders delivery to that device. Writes are acked to the sender after a durable multi-AZ quorum write.</li>
  <li><b>Delivery.</b> If the device has a live connection (registry lookup, as in any chat gateway design) push it; otherwise send a content-free wake-up through the platform push service. The device acks up to a sequence number and the server deletes everything at or below it. Expiry deletes whatever is never collected.</li>
  <li><b>Idempotency.</b> A unique (sender_device, client_msg_id, recipient_device) key makes retries safe.</li>
</ul>
<p>Message order is not the server's job when it cannot read content. Each message carries a hybrid logical clock from the sender and a per-conversation counter inside the encrypted payload. Receivers sort by (clock, sender device ID) and use the counters to spot gaps. Clamp a wildly wrong device clock by using max(local time, highest seen + 1), as covered in the time chapter.</p>
<p>Multi-region: every user has a home region where their device inboxes live. A sender in another region delivers to the recipient's home region, paying one cross-region hop. Inboxes replicate asynchronously to a second region for failover. A regional loss can drop the last few seconds of replicated envelopes, so the sender keeps each message until it sees a delivery confirmation, and receivers use the counters to request a resend when they find a gap. Say plainly that this is a recovery point of seconds, not zero.</p>
<p>Hard problems: first, a device is added or removed, so a message sent against a stale device list reaches the old set only. The server rejects sends whose device-list version is out of date and returns the new list, forcing the sender to re-encrypt. Second, the metadata still leaks. Keep logs short-lived, avoid storing contact graphs, and say honestly what remains visible.</p>`,
      tradeoffs: `<ul>
  <li><b>Per-device envelopes vs one shared ciphertext.</b> One ciphertext is cheap but needs a shared key that every device and every membership change must manage. Per-device encryption multiplies server work by about 5. Pick per-device for one-to-one and small groups because it is the simplest to reason about, and flip to a group sender key for large groups where the multiplier hurts.</li>
  <li><b>Sync cross-region replication vs async.</b> Synchronous means no loss but adds 70 to 90 ms or more to every send and ties availability to the farthest region. Pick async with client-side retention and gap detection. Flip to synchronous only for a small class of messages that cannot tolerate any loss.</li>
  <li><b>Server-assigned inbox order vs sender clocks.</b> Server order is simple but only reflects arrival, not intent. Sender hybrid clocks reflect intent but can be skewed. Use both: server sequence for delivery, sender clock plus counters for display order.</li>
  <li><b>Long retention vs delete on ack.</b> Keeping envelopes eases multi-device recovery but grows storage and legal exposure. Pick delete on ack with a short expiry, and flip only if a product feature needs server-held history, accepting the encryption design that comes with it.</li>
</ul>`,
      followups: [
        "A user adds a new device. How does it get access to future messages, and what can it see of past ones?",
        "How would you detect and handle a malicious or compromised key directory?",
        "How do you deliver a message to a user whose home region is down?",
        "How would you design group membership changes so a removed member cannot read later messages?",
        "What does the server still learn despite end-to-end encryption, and how would you reduce it?",
      ],
      slips: `<ul>
  <li>Putting plaintext on the server "for search and spam checks" in an end-to-end encrypted system.</li>
  <li>Encrypting once for the recipient and forgetting that each device has its own keys.</li>
  <li>Using the server clock or an auto-increment ID as the only ordering for display.</li>
  <li>Ignoring the key directory, which is the actual trust anchor and the easiest thing to attack.</li>
  <li>Claiming zero message loss across regions without paying for synchronous replication.</li>
  <li>Retaining delivered ciphertext forever.</li>
  <li>Forgetting that adding or removing a device changes who must receive a copy.</li>
  <li>Treating push notifications as the message channel rather than a wake-up.</li>
  <li>Inventing a custom cryptographic protocol instead of naming a vetted one.</li>
</ul>`,
    },
  },
  {
    id: "microsoft-collaborative-editor",
    company: "microsoft",
    title: "Design a real-time collaborative document editor",
    prompt:
      "Design a document editor where several people edit the same document at the same time. Each person's edits should appear for the others within a fraction of a second, no one's edits may be lost, and every client must end up with an identical document. Assume up to 100 collaborators on a document but usually 2 to 5.",
    level: "SDE-2 (L61)",
    kind: "hld",
    evidence: "one",
    sources: [
      {
        label: "Roundz: Microsoft L61 interview experience",
        url: "https://roundz.substack.com/p/interview-experience-68-microsoft-l61",
        kind: "candidate-report",
        year: 2025,
      },
    ],
    chapters: ["sysdes-consistency-models", "sysdes-time-ordering-ids", "sysdes-replication", "sysdes-storage-engines"],
    answer: {
      ask: `<p>Questions first: rich text, or plain text only? Is offline editing required, with merging on reconnect? How many simultaneous editors per document, and how large can a document get? Do we need version history and per-user undo? Is it fine for every client to be briefly behind the others, so long as they all converge to the same document?</p>
<p>Assumed scope: rich-text documents up to a few hundred pages, online-first with short offline tolerance, live cursors and presence, version history, sharing permissions. Out of scope: spreadsheets and drawings, comments threads, import and export, full-text search over documents. The key requirement is convergence: after the last edit is delivered, every client shows byte-identical content.</p>`,
      numbers: `<p>Planning figures for the exercise, not facts about any company.</p>
<ul>
  <li>Sessions: 3 M concurrent users with a document open, about 3 per document, so about 1 M open documents.</li>
  <li>Typing: 10% are typing at any moment, so 300,000 typists. Clients batch keystrokes and send twice a second, so 600,000 operation messages a second inbound.</li>
  <li>Outbound: each batch goes to the other collaborators, about 2 on average, so about 1.2 M messages a second pushed.</li>
  <li>Log writes: 600,000 appends a second is far past 5,000 for one primary. Partition the log by document_id: 600,000 ÷ 5,000 is at least 120 partitions, plan for about 200 so each runs near 3,000 a second.</li>
  <li>Connections: 3 M ÷ 250,000 is 12 gateway boxes at least; plan about 24 for headroom and zone spread.</li>
  <li>Memory: 1 M open documents × 100 KB of snapshot and recent operations is about 100 GB. At 50,000 documents per box that is 20 boxes minimum; plan about 30.</li>
  <li>Storage: if the peak append rate ran all day, 600,000 × 100 B is 60 MB a second, about 5.2 TB a day. Real averages are a fraction of that, and compaction shrinks it further.</li>
</ul>
<p>What the numbers force: the document is the unit of sharding, each document has exactly one sequencer at a time, and the operation log is partitioned and compacted.</p>`,
      design: `<p>The core decision is how concurrent edits become one document. There are two families. <b>Operational transformation (OT)</b> keeps a central server that orders operations and transforms each incoming operation against the ones it missed. <b>CRDTs</b> give every character or element a unique, ordered identity so that edits commute and merge without a central order. I would pick server-sequenced OT for an online-first product, and explain the flip below.</p>
<ol>
  <li><b>Gateway.</b> Holds the WebSocket and routes each connection to the document's owner server, found through a lookup keyed by document_id.</li>
  <li><b>Document owner (sequencer).</b> Holds the document's current text and revision number in memory. It is the only writer for that document. For each incoming batch (client_id, client_seq, base_revision, ops) it transforms the operations against everything committed after base_revision, assigns new revision numbers, appends to the log, acks the author, and broadcasts the transformed operations to the other clients.</li>
  <li><b>Client.</b> Applies its own edits instantly. It keeps at most one batch in flight, and buffers later edits locally; when the ack or a remote operation arrives it transforms the buffer against it. This is what makes typing feel local while staying consistent.</li>
  <li><b>Operation log.</b> Key (document_id, revision), value is the operation batch plus author and client_seq. The primary key forbids two operations at the same revision, which is the safety net even if two servers briefly both think they own the document.</li>
  <li><b>Snapshots.</b> Every few hundred operations or when idle, write a snapshot (document_id, revision) to object storage and truncate older log entries after a retention period. Version history is a list of snapshots.</li>
  <li><b>Metadata store.</b> Relational: document, owner, title, permissions, latest snapshot pointer.</li>
  <li><b>Presence service.</b> Cursors and selections live only in memory and pub/sub, throttled to a few updates a second. They are never persisted.</li>
</ol>
<p>Ownership: a lease in a small consensus-backed store (Raft-based) decides which server owns a document, with an epoch number as a fencing token. If an owner dies, the lease expires and another server loads the latest snapshot, replays the log tail, and takes over. Clients reconnect with their last known revision and resend unacknowledged batches; client_id plus client_seq makes the resend idempotent.</p>
<p>Consistency: each document is linearizable at the sequencer, since one process orders everything. Clients see eventual convergence, and their own edits show immediately. The log is replicated synchronously across availability zones before the author is acked, and asynchronously to another region for disaster recovery.</p>
<p>Permissions are checked when the connection opens and again on each batch, so revoking access takes effect immediately. Undo is per user: the inverse of the user's own operation, transformed against everything that happened since.</p>`,
      tradeoffs: `<ul>
  <li><b>OT vs CRDT.</b> OT is compact and has lower per-character overhead, but the transformation functions are famously easy to get wrong and it wants a central server. CRDTs merge anywhere, including peer to peer and offline, but carry metadata per element and need garbage collection. Pick OT with a sequencer for an online-first editor. Flip to CRDT when long offline editing or multi-region concurrent writes are core.</li>
  <li><b>Single sequencer per document vs multi-writer.</b> One sequencer makes ordering trivial but is a per-document bottleneck and a failover event. Pick it, because a document's write rate is tiny next to the machine. Flip only if one document needs thousands of simultaneous writers.</li>
  <li><b>Persist every operation vs periodic snapshots only.</b> Per-operation logging is safe for crashes but costs 600,000 appends a second. Pick the operation log with group commit per document and compaction, and flip toward snapshots only if you accept losing the last seconds on a crash.</li>
  <li><b>Strong consistency vs availability during a region failure.</b> A single owner means a document is briefly unavailable on failover. Pick that, because two owners cause divergence. Flip to CRDTs and accept eventual merge if the product must stay writable everywhere.</li>
</ul>`,
      followups: [
        "Two users type at the same position at the same moment. Walk through exactly what each client and the server do.",
        "The owner server crashes between acking an operation and broadcasting it. What do clients see and how do they recover?",
        "How would you support offline editing for an hour and then merge?",
        "How would you implement version history and restoring an old version without breaking live editors?",
        "How would you scale a single document with 5,000 viewers and 50 editors, such as a company-wide announcement?",
      ],
      slips: `<ul>
  <li>Proposing last-write-wins on the whole document, which silently drops other people's edits.</li>
  <li>Using wall-clock timestamps to order edits.</li>
  <li>Saying "use OT" or "use CRDT" with no account of how a client with an in-flight edit handles a remote one.</li>
  <li>Not choosing one owner per document, so two servers sequence the same document and diverge.</li>
  <li>Persisting cursor positions or sending full document state on every keystroke.</li>
  <li>Having no snapshot or compaction story, so the log grows without limit and opening a document replays everything.</li>
  <li>Forgetting to recheck permissions on an open connection.</li>
  <li>Treating undo as one shared stack for the whole document instead of per user.</li>
</ul>`,
    },
  },
  {
    id: "phonepe-qa-platform",
    company: "phonepe",
    title: "Design a Quora-style Q&A platform",
    prompt:
      "Design a question-and-answer site where users post questions, write answers, upvote, follow topics and people, and search for existing questions. Assume 50 million daily users, mostly reading, and pages that should load in under 300 ms.",
    level: "SDE-2",
    kind: "hld",
    evidence: "several",
    sources: [
      {
        label: "Roundz: PhonePe SDE-2 interview experience (Aug 2025)",
        url: "https://roundz.substack.com/p/interview-experience-174-phonepe-sde2",
        kind: "candidate-report",
        year: 2025,
      },
      {
        label: "Roundz: PhonePe SDE-2 interview experience (Jun 2025)",
        url: "https://roundz.substack.com/p/interview-experience-101-phonepe-sde2",
        kind: "candidate-report",
        year: 2025,
      },
    ],
    chapters: [
      "sysdes-search-systems",
      "sysdes-databases-in-design",
      "sysdes-security-basics",
      "sysdes-caching-fundamentals",
    ],
    answer: {
      ask: `<p>Questions first: what are the core objects (question, answer, comment, topic, user)? Is there a personalized home feed, or only topic pages and search? How should answers be ordered on a question page: votes, recency, author reputation? Do we need anonymous answers, edits and deletion, and moderation? How important is finding duplicate questions?</p>
<p>Assumed scope: post a question with topics, write answers, upvote and downvote, follow topics and users, a personalized feed, search by text, notifications out of scope except as an event. Out of scope: ads, payments, direct messages, the machine-learning internals of ranking. The system is read-heavy and tolerates slightly stale counts, but not lost writes.</p>`,
      numbers: `<p>Planning figures for the exercise, not facts about any company.</p>
<ul>
  <li>Reads: 50 M daily users × 20 page views is 1 B views a day. 1 B ÷ 86,400 is about 11,600 a second on average, and about 35,000 a second at a 3x peak. That is past 20,000 reads a second, so cache and replicas are needed.</li>
  <li>Content writes: 2% of daily users post a question or answer each day, so 1 M a day. 1 M ÷ 86,400 is about 12 a second.</li>
  <li>Votes: 10% of daily users cast 5 votes, so 25 M a day. 25 M ÷ 86,400 is about 290 a second, about 870 at peak. Well under 5,000 writes a second, though a viral answer concentrates them on one row.</li>
  <li>Content storage: 1 M × 2 KB is 2 GB a day, about 730 GB a year. Votes at 30 B each: 25 M × 30 B is 750 MB a day, about 274 GB a year.</li>
  <li>Read-to-write ratio on content: 11,600 ÷ 12 is roughly 1,000:1.</li>
</ul>
<p>What the numbers force: one relational primary comfortably handles the writes, so do not shard yet; add a cache and read replicas for the 35,000 peak reads; and put search in its own index because relational full-text search is not the right tool at this scale.</p>`,
      design: `<p>Keep the first design simple and name where it would split later.</p>
<ul>
  <li><b>Primary store: relational.</b> Tables for users, questions (question_id, author_id, title, body, status, created_at), answers (answer_id, question_id, author_id, body, created_at, score), votes, topics, question_topics, follows. Content has relations and needs transactions, and a single primary handles about 5,000 writes a second, so it covers this load for a long time. Index answers by (question_id, score desc) so the question page is one range read.</li>
  <li><b>Votes.</b> A unique key on (user_id, answer_id) makes voting idempotent: a repeat request upserts the same row instead of counting twice. The vote row is the truth. The answer's displayed count is a derived counter updated asynchronously in small batches, because a viral answer would otherwise make one row the bottleneck.</li>
  <li><b>Answer ordering.</b> Rank by a score that combines vote quality, recency and author credibility. For raw votes use a lower confidence bound rather than the plain count, so an answer with 3 of 3 upvotes does not beat one with 900 of 1,000.</li>
  <li><b>Cache.</b> Cache the rendered question page (question plus its top answers) keyed by question_id with a short TTL, about a minute, and delete or refresh on edit. Counts may lag. For a viral question, coalesce concurrent misses so only one request goes to the database.</li>
  <li><b>Search.</b> Questions (and top answer text) are indexed in a search engine such as Elasticsearch, fed asynchronously from the database through an outbox or change stream. Search is a secondary index and may lag by seconds. Query by text with title boosted, then re-rank with votes and recency.</li>
  <li><b>Feed.</b> Content volume is only about 12 new posts a second, so build the home feed at read time: take recent top answers from each topic and person the viewer follows (cached lists per topic), merge, remove already seen items, rank, paginate with a cursor. No fan-out on write needed yet.</li>
</ul>
<p>Write path: validate, sanitize rich text, write the row and an outbox row in one transaction, commit, and return. A worker consumes the event to update the search index, invalidate the cached page and bump topic lists.</p>
<p>Hard problem one is duplicate questions. At post time, run the title through the search index, show likely matches, and let the asker confirm. Offline, merge duplicates and redirect the old URL to a canonical question, moving answers and votes.</p>
<p>Hard problem two is trust and abuse. User content is an XSS risk, so sanitize on write and escape on output. Enforce authorization on every edit and delete (author, moderator). Rate-limit posting and voting per account and per IP, detect vote rings through unusual patterns, and put new or flagged content into a moderation queue. For anonymous answers, store the real author_id internally and hide it in the API, which keeps moderation possible.</p>
<p>Scaling later: add read replicas first, then shard by question_id once the primary hits roughly the limits above, keeping an answer on the same shard as its question. Keep user and follow data separate.</p>`,
      tradeoffs: `<ul>
  <li><b>Relational vs a NoSQL store for content.</b> Relational gives constraints, transactions and flexible queries; NoSQL gives easier horizontal scale. With 12 content writes a second, pick relational. Flip when storage or write volume passes what one primary and its replicas can hold, which is many terabytes away.</li>
  <li><b>Exact vote counts vs eventually consistent counters.</b> Exact counts on one row serialize hot answers. Pick a vote table as truth and an asynchronously updated count. Flip to exact counts if votes carry money or privileges.</li>
  <li><b>Feed built at read time vs fan-out on write.</b> Read-time merge is simple and fresh, and works because content volume is low. Fan-out on write wins when per-user feeds must load instantly and follow counts are bounded. Pick read-time now and flip if feed latency exceeds its budget.</li>
  <li><b>Search in the database vs a separate index.</b> Database search is one fewer system but weak at relevance and slow at volume. Pick a separate index fed asynchronously, accepting seconds of lag. Flip to database search for a small prototype.</li>
</ul>`,
      followups: [
        "How would you stop a coordinated group from voting an answer to the top?",
        "A question goes viral and gets 100,000 views a second. What happens to the cache and the database?",
        "How would you build the autocomplete box that suggests similar questions while someone is typing a title?",
        "How do you handle an edited or deleted answer that is already in feed caches and the search index?",
        "How would you shard the database, and which queries become expensive after you do?",
      ],
      slips: `<ul>
  <li>Reaching for sharding and a fan-out feed at 12 writes a second, instead of using the numbers to justify a single primary.</li>
  <li>Using SQL <code>LIKE</code> for search.</li>
  <li>Incrementing a counter column on every vote with no uniqueness rule, so double votes and hot rows both appear.</li>
  <li>Ranking by raw vote count only.</li>
  <li>Ignoring spam, XSS and permission checks on edit and delete.</li>
  <li>Not mentioning duplicate questions, which is the product's central quality problem.</li>
  <li>Caching pages with no invalidation or TTL story.</li>
  <li>Using OFFSET paging on a list that changes.</li>
  <li>Letting a viral question send every cache miss to the database at once.</li>
</ul>`,
    },
  },
];
