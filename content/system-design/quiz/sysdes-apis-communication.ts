import type { DesignPool } from "../../quiz-types";

export const pool: DesignPool = {
  questions: [
    {
      id: "ap-chatty-client-saving",
      chapter: "sysdes-apis-communication",
      level: "beginner",
      skill: "estimate",
      section: "an-api-is-not-a-format-question-it-is-a-coupling-question",
      kind: "single",
      prompt:
        "<p>A mobile screen needs data from 6 services, and each call needs the previous call's result. Option A has the phone make the 6 calls one after another, with a 90 ms round trip each. Option B has the phone make one call to an aggregating backend, which calls the 6 services one after another over datacenter hops of 2 ms each. Ignore processing time. How much lower is the total latency of option B?</p>",
      choices: [
        {
          id: "a",
          text: "450 ms lower, since B removes five slow round trips",
          why: "This subtracts five phone round trips but forgets that B adds its own datacenter hops. Six hops of 2 ms cost 12 ms, so the saving is smaller than 450.",
        },
        {
          id: "b",
          text: "540 ms lower, since B costs nothing",
          why: "540 ms is the total for option A, not the saving. B still pays one phone round trip of 90 ms plus 12 ms of datacenter hops.",
        },
        {
          id: "c",
          text: "438 ms lower",
          why: "A costs 6 × 90 = 540 ms. B costs 90 + 6 × 2 = 102 ms. The difference is 438 ms, because the number of crossings of the slow link is what dominates.",
        },
        {
          id: "d",
          text: "102 ms lower, which is what B costs in total",
          why: "102 ms is the total latency of option B, not the difference between the options. The saving is A's total minus B's total.",
        },
      ],
      answer: "c",
    },
    {
      id: "ap-short-poll-waste",
      chapter: "sysdes-apis-communication",
      level: "beginner",
      skill: "estimate",
      section: "real-time-transports-the-decision-table-you-will-need",
      kind: "single",
      prompt:
        "<p>An app has 1.5 million clients that each short-poll for updates every 10 seconds. Assume the polls are spread evenly and that only 4% of them have anything new to return. How many polls per second return nothing?</p>",
      choices: [
        {
          id: "a",
          text: "144,000 per second",
          why: "1,500,000 / 10 = 150,000 polls per second, and 96% of them come back empty, which gives 144,000. This is the overhead of TLS, headers, auth and lookups that push transports avoid.",
        },
        {
          id: "b",
          text: "150,000 per second",
          why: "That is the total poll rate, which counts the polls that did return something. Only 96% of them are empty.",
        },
        {
          id: "c",
          text: "6,000 per second",
          why: "This is the number of polls that do return data (4% of 150,000). The question asks for the empty ones, which are the other 96%.",
        },
        {
          id: "d",
          text: "14,400 per second",
          why: "This is off by a factor of ten, as if only 9.6% of polls were empty. With 4% useful, 96% of polls are wasted.",
        },
      ],
      answer: "a",
    },
    {
      id: "ap-retry-hangs",
      chapter: "sysdes-apis-communication",
      level: "beginner",
      skill: "diagnose",
      section: "idempotency-keys-and-retries-that-don-t-multiply",
      kind: "single",
      prompt:
        "<p>A payments endpoint handles an <code>Idempotency-Key</code> inside one database transaction: it inserts a row for the key (unique on account and key), calls the card processor, writes the payment, marks the row done and commits. A client times out and retries while the first request is still running. In Postgres the retry neither returns a quick 409 nor the stored result. It hangs until the first request finishes and then fails with a unique violation. What explains this?</p>",
      choices: [
        {
          id: "a",
          text: "The key row is uncommitted and invisible to other sessions, so the second insert waits for the first transaction to end.",
          why: "A second inserter of the same key blocks until the first transaction commits or rolls back, then gets a unique violation. Claiming the key in its own short transaction that commits at once makes the duplicate visible immediately.",
        },
        {
          id: "b",
          text: "The key lifetime is too short, so the record was reaped before the retry arrived.",
          why: "A reaped key would let the retry run the payment again, not hang it. A hang followed by a unique violation means the old row was still there.",
        },
        {
          id: "c",
          text: "The server did not store a hash of the request body, so it cannot match the retry to the original.",
          why: "A missing body hash means a changed payload goes undetected. It does not cause the retry to block on the database for the length of the first request.",
        },
        {
          id: "d",
          text: "The client retried without jitter, so its retries arrived in lockstep with other clients.",
          why: "Missing jitter synchronises many clients and can overload a server, but it cannot make one request wait behind another on a unique index. The blocking comes from the transaction scope.",
        },
      ],
      answer: "a",
    },
    {
      id: "ap-offset-repeats",
      chapter: "sysdes-apis-communication",
      level: "beginner",
      skill: "diagnose",
      section: "pagination-why-offset-breaks-and-cursors-don-t",
      kind: "single",
      prompt:
        "<p>An infinite-scroll feed reads from the primary database with <code>ORDER BY created_at DESC LIMIT 20 OFFSET n</code>, and every <code>created_at</code> value is unique. The client requests offsets 0, 20, 40 in order. Users report that page 2 starts with posts they just saw at the bottom of page 1, but only on busy evenings when many new posts are being created. What is the cause?</p>",
      choices: [
        {
          id: "a",
          text: "Deep offsets are slow, so requests time out and the client sends the previous page again.",
          why: "Offset cost does grow with depth, but the offsets here are small and the client sends different offsets each time. Slowness does not move rows from page 1 onto page 2.",
        },
        {
          id: "b",
          text: "New posts shift every later row down, so offset 20 now lands on items already shown.",
          why: "Offsets address positions, and positions move when rows are inserted at the top. Each new post pushes one old item onto the next page. A cursor that names a row (created_at and id) is stable under this.",
        },
        {
          id: "c",
          text: "Rows with equal timestamps swap places between requests because the sort has no tiebreaker.",
          why: "Missing tiebreakers do cause repeated and dropped rows, but the question says every timestamp is unique, and the problem appears only when new posts arrive.",
        },
        {
          id: "d",
          text: "Reads are served by a lagging replica that has not seen the latest posts.",
          why: "The stem says the reads come from the primary, so there is no replica lag.",
        },
      ],
      answer: "b",
    },
    {
      id: "ap-live-scoreboard-transport",
      chapter: "sysdes-apis-communication",
      level: "beginner",
      skill: "tradeoff",
      section: "real-time-transports-the-decision-table-you-will-need",
      kind: "single",
      prompt:
        "<p>A scoreboard page must show a score change within about a second for 300,000 browsers at once. Browsers only listen and never send messages on this channel, and a score changes every few seconds. You want the browser to reconnect by itself after a network drop, and you do not want to build your own framing or reconnect logic. Which transport fits best?</p>",
      choices: [
        {
          id: "a",
          text: "WebSockets, because they are the modern standard for real-time updates.",
          why: "WebSockets give full duplex, which nothing here needs, and they move you off plain HTTP so you own framing, reconnects and heartbeats. Choose them because you need two-way traffic, not because they sound modern.",
        },
        {
          id: "b",
          text: "Short polling every second.",
          why: "At 300,000 clients that is 300,000 requests per second, most of them empty, and updates still arrive up to a second late. It is wasted capacity compared with a push.",
        },
        {
          id: "c",
          text: "Server-sent events over HTTP.",
          why: "The updates flow one way, which is exactly the shape SSE is for. The browser reconnects automatically and sends Last-Event-ID, so the server only has to replay missed events by id.",
        },
        {
          id: "d",
          text: "Long polling with a 30 second timeout.",
          why: "Long polling does push semantics, but it ties up a request slot per client and re-requests constantly. It is the compatibility fallback, not the target when SSE is available.",
        },
      ],
      answer: "c",
    },
    {
      id: "ap-breaking-changes",
      chapter: "sysdes-apis-communication",
      level: "beginner",
      skill: "concept",
      section: "versioning-you-evolve-an-api-you-rarely-version-it",
      kind: "multi",
      prompt:
        "<p>A public JSON API is called by mobile apps released over the past two years, and you cannot force them to update. Assume the apps tolerate unknown fields they do not use. Select every change that would break those existing apps.</p>",
      choices: [
        {
          id: "a",
          text: "Add an optional field <code>middleName</code> to a user response.",
          why: "Adding an optional field is the safe, additive change. Clients that do not know about it ignore it.",
        },
        {
          id: "b",
          text: "Add a required request field <code>currency</code> to <code>POST /orders</code>.",
          why: "Old apps do not send the new field, so their requests start to fail validation. Adding a required field is a breaking change even when the tests pass.",
        },
        {
          id: "c",
          text: "Rename the response field <code>total</code> to <code>amount</code>.",
          why: "Old apps read <code>total</code> and now find nothing. A rename is a removal plus an addition, so it needs an expand and contract migration instead.",
        },
        {
          id: "d",
          text: "Add an optional request field <code>giftNote</code> that defaults to empty.",
          why: "Old apps never send it and the server fills in the default, so their requests behave as before. Optional inputs with defaults are additive.",
        },
        {
          id: "e",
          text: "Start returning <code>total</code> in cents where it used to return dollars.",
          why: "The field name and type are unchanged, but its meaning is different. Changing what an existing value means breaks every client that reads it.",
        },
      ],
      answers: ["b", "c", "e"],
    },
    {
      id: "ap-idempotency-steps",
      chapter: "sysdes-apis-communication",
      level: "beginner",
      skill: "sequence",
      section: "idempotency-keys-and-retries-that-don-t-multiply",
      kind: "order",
      prompt: "<p>Put the steps of a safe idempotent payment request in the order the server performs them.</p>",
      items: [
        { id: "claim", text: "Insert the key row as in progress and commit it straight away" },
        { id: "charge", text: "Call the card processor with a key derived from the client's key" },
        { id: "record", text: "In one transaction, save the payment and mark the key row done with the response" },
        { id: "replay", text: "Answer any later retry with the stored response" },
      ],
      why: "The claim comes first and is committed on its own, so a concurrent duplicate sees it at once. The external charge cannot sit inside your transaction, so the processor gets a derived key to deduplicate it. The local payment and the done marker are then written atomically. Only after that can a retry be answered from the stored result.",
    },
    {
      id: "ap-gateway-authorization",
      chapter: "sysdes-apis-communication",
      level: "beginner",
      skill: "concept",
      section: "api-gateways-what-belongs-there-and-what-emphatically-doesn-",
      kind: "single",
      prompt:
        "<p>An API gateway validates the login token on every request and forwards the user id in a header. A teammate proposes that the orders service no longer checks whether that user may view order 991, because the gateway has already authenticated them. What is the right response?</p>",
      choices: [
        {
          id: "a",
          text: "The orders service must still check access, since the gateway only proved who the caller is.",
          why: "Authentication says who is calling, not what they may see. Resource-level decisions need domain knowledge, and the gateway is not a security boundary on its own.",
        },
        {
          id: "b",
          text: "Agree, since every request passes the gateway and a second check duplicates work.",
          why: "This assumes the gateway's check covers access to individual orders, which it cannot know. If anything bypasses or misroutes through the gateway, the service would trust blindly.",
        },
        {
          id: "c",
          text: "Move the order ownership rules into the gateway so that access is decided in one place.",
          why: "That puts business logic in a deployment shared by every team, so each rule change needs a gateway release. The gateway holds concerns identical for every request, not per-resource rules.",
        },
        {
          id: "d",
          text: "Have the gateway sign the user id header so that services can trust it fully.",
          why: "Signing makes the identity harder to forge, but a verified identity still does not say whether this user may see order 991. The service has to make that decision.",
        },
      ],
      answer: "a",
    },
  ],
};
