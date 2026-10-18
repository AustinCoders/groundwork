import type { DesignPool } from "../../quiz-types";

export const pool: DesignPool = {
  questions: [
    {
      id: "cs-cold-first-byte",
      chapter: "sysdes-client-server-basics",
      level: "beginner",
      skill: "estimate",
      section: "tcp-and-tls-the-cost-of-a-cold-connection",
      kind: "single",
      prompt:
        "<p>A client is 60 ms round-trip from the server and opens a brand-new HTTPS connection using TLS 1.3. Assume no packet loss, no connection reuse, and ignore DNS, server processing time and transmission time. How long until the first byte of the HTTP response reaches the client?</p>",
      choices: [
        {
          id: "a",
          text: "60 ms",
          why: "That is a single round trip, which is what a request costs on a warm, reused connection. A cold connection pays for the handshakes first.",
        },
        {
          id: "b",
          text: "120 ms",
          why: "Two round trips cover the TCP handshake and the TLS 1.3 handshake, but at that point nothing has been requested yet. The HTTP request and response need one more round trip.",
        },
        {
          id: "c",
          text: "240 ms",
          why: "That would be four round trips, which is the count for TLS 1.2, where the TLS handshake takes two round trips. TLS 1.3 needs only one.",
        },
        {
          id: "d",
          text: "180 ms",
          why: "One round trip for TCP, one for TLS 1.3 and one for the HTTP request and response is three round trips, and 3 × 60 ms is 180 ms. The chapter calls out exactly these three arrows.",
        },
      ],
      answer: "d",
    },
    {
      id: "cs-warm-budget-left",
      chapter: "sysdes-client-server-basics",
      level: "beginner",
      skill: "estimate",
      section: "numbers-every-engineer-should-know",
      kind: "single",
      prompt:
        "<p>A page must load within a 200 ms p99 budget. The user is 80 ms round-trip away and the connection is already warm, so the request and response cost one round trip. The server then does one cache hit at 0.5 ms followed by one indexed database query at 5 ms, in sequence. How much of the budget is left?</p>",
      choices: [
        {
          id: "a",
          text: "About 120 ms",
          why: "This subtracts only the network round trip and forgets the server work. The cache hit and the database query still cost 5.5 ms.",
        },
        {
          id: "b",
          text: "About 114.5 ms",
          why: "200 minus 80 for the round trip minus 0.5 for the cache hit minus 5 for the query leaves 114.5 ms. Only one round trip is charged because the connection is already warm.",
        },
        {
          id: "c",
          text: "About 34.5 ms",
          why: "This charges two round trips, 160 ms, for a request that reuses an established connection. A warm connection pays only one.",
        },
        {
          id: "d",
          text: "About -45.5 ms",
          why: "This is the cold-connection answer, with three round trips at 80 ms each. The stem says the connection is warm, so the handshakes are not paid.",
        },
      ],
      answer: "b",
    },
    {
      id: "cs-ttl-failover-leaks",
      chapter: "sysdes-client-server-basics",
      level: "beginner",
      skill: "diagnose",
      section: "dns-four-lookups-you-hope-never-to-make",
      kind: "single",
      prompt:
        "<p>To fail over from a dead region, a team repoints a single A record at a standby region. They had lowered the TTL to 30 seconds beforehand. Long after 30 seconds, a noticeable share of clients still send requests to the dead address. What is the most likely explanation?</p>",
      choices: [
        {
          id: "a",
          text: "The TTL is a hint: some resolvers clamp it upwards, and operating systems and browsers keep their own caches on top.",
          why: "This is the chapter's point that a DNS TTL is not a contract. A long tail of clients keeps using the old answer, so DNS alone cannot give fast failover.",
        },
        {
          id: "b",
          text: "The authoritative nameserver applies record changes only a few times an hour, regardless of TTL.",
          why: "Authoritative servers serve a changed record as soon as it is updated. The delay comes from caches downstream of them, which are outside your control.",
        },
        {
          id: "c",
          text: "HTTP/3 connection migration keeps clients attached to the address they first connected to.",
          why: "Connection migration lets a client keep a connection when its own network changes, such as Wi-Fi to cellular. It does not pin a client to a server address that has died.",
        },
        {
          id: "d",
          text: "A single A record always returns the first address, and clients ignore the new one until restart.",
          why: "Clients do honour a changed answer once their cached copy expires. The problem is how long some caches hold the old one, not a refusal to re-resolve.",
        },
      ],
      answer: "a",
    },
    {
      id: "cs-path-routing-balancer",
      chapter: "sysdes-client-server-basics",
      level: "beginner",
      skill: "tradeoff",
      section: "load-balancer-reverse-proxy-api-gateway",
      kind: "single",
      prompt:
        "<p>One public hostname must send <code>/api/*</code> requests to an API pool and <code>/images/*</code> requests to a separate media pool, and must retry an idempotent request on another backend if the first returns an error. Which front door fits?</p>",
      choices: [
        {
          id: "a",
          text: "An L4 balancer, because it forwards the TCP stream and can read the path as it passes.",
          why: "An L4 balancer sees IP addresses, ports and connections, not HTTP. It has no view of the path, so it cannot route on it.",
        },
        {
          id: "b",
          text: "DNS round robin with several A records, one per pool.",
          why: "DNS hands out addresses per name, so it cannot see a request's path at all. It also balances resolvers rather than requests and cannot retry anything.",
        },
        {
          id: "c",
          text: "An L7 balancer that terminates TLS, so it can read the path and retry per request.",
          why: "Routing by path and retrying individual requests are L7 capabilities, and to read HTTP at all it must terminate TLS. The extra CPU and latency are worth it for this kind of HTTP traffic.",
        },
        {
          id: "d",
          text: "An L4 balancer with TLS termination turned on, which then sees the HTTP path.",
          why: "An L4 TLS listener can decrypt the connection, but it still passes bytes without parsing HTTP. Terminating TLS is necessary for L7 routing, not sufficient to make a balancer L7.",
        },
      ],
      answer: "c",
    },
    {
      id: "cs-session-revocation",
      chapter: "sysdes-client-server-basics",
      level: "beginner",
      skill: "tradeoff",
      section: "statelessness-is-the-property-everything-else-is-built-on",
      kind: "single",
      prompt:
        "<p>An app tier will autoscale, and instances are added and removed at any time. Support must be able to revoke a user's session immediately, and the session data (such as cart contents) changes during the session. Where should session state live?</p>",
      choices: [
        {
          id: "a",
          text: "In each app server's memory, with the load balancer using sticky sessions.",
          why: "Losing or scaling in a node logs out the users pinned to it, load skews toward the nodes holding the busy users, and revoking a session means finding the right node. The chapter calls this almost never right in a new design.",
        },
        {
          id: "b",
          text: "In a signed token in a cookie, with a long expiry and no server lookup.",
          why: "Tokens avoid a lookup, but revocation is genuinely hard and long expiry makes it worse. They also suit read-mostly claims, not data that changes mid-session.",
        },
        {
          id: "c",
          text: "In the browser, with the server trusting a plain user ID sent on each request.",
          why: "Anyone can send any user ID, so the server would be trusting unverified input. It also gives the server no way to revoke anything.",
        },
        {
          id: "d",
          text: "In a shared session store such as Redis that every instance reads, kept highly available.",
          why: "It supports server-side revocation and changing data, and any instance can serve any request. The cost is one extra network hop per request and a new dependency to keep highly available.",
        },
      ],
      answer: "d",
    },
    {
      id: "cs-lost-packet-stalls-all",
      chapter: "sysdes-client-server-basics",
      level: "beginner",
      skill: "concept",
      section: "http-1-1-vs-http-2-vs-http-3-at-the-level-that-changes-a-des",
      kind: "single",
      prompt:
        "<p>A mobile page downloads many small files multiplexed over one HTTP/2 connection. On a lossy network, each time a single packet is lost, every in-flight download pauses, not just the one that lost data. Which explanation and fix are correct?</p>",
      choices: [
        {
          id: "a",
          text: "HTTP/2 still allows one request at a time per connection, so add hostnames to open more connections.",
          why: "HTTP/2 multiplexes many streams on a connection, which is why it avoids this limit. Domain sharding is actively harmful on HTTP/2 because it defeats multiplexing and multiplies handshakes.",
        },
        {
          id: "b",
          text: "The origin's thread pool is saturated, so add more app servers behind the balancer.",
          why: "Server saturation would slow responses whether or not packets were lost. The symptom here is tied to packet loss on the connection, which more servers do not change.",
        },
        {
          id: "c",
          text: "All streams share one TCP byte stream, which holds back delivery until the lost packet is resent; HTTP/3 over QUIC keeps streams independent.",
          why: "This is the remaining weakness of HTTP/2. TCP delivers bytes in order, so one loss stalls every stream, and QUIC was built so a loss stalls only the stream that lost data.",
        },
        {
          id: "d",
          text: "Header compression state is shared across streams, so a lost header block stalls every stream; turn compression off.",
          why: "Compression state is a real shared structure, but the stall comes from in-order delivery of the underlying TCP stream. Turning compression off would add bytes without removing the cause.",
        },
      ],
      answer: "c",
    },
    {
      id: "cs-which-make-stateless",
      chapter: "sysdes-client-server-basics",
      level: "beginner",
      skill: "concept",
      section: "statelessness-is-the-property-everything-else-is-built-on",
      kind: "multi",
      prompt:
        "<p>You want any instance of an app tier to be able to serve any request, so instances can be killed or added without notice. Select every change that moves toward that property.</p>",
      choices: [
        {
          id: "a",
          text: "Keep login sessions in a shared store such as Redis instead of in process memory.",
          why: "The session then survives the loss of any instance, and every instance can read it. The state has moved somewhere purpose-built instead of disappearing.",
        },
        {
          id: "b",
          text: "Send uploaded files straight to object storage instead of an instance's local disk.",
          why: "A file on one instance's disk makes later requests depend on that instance. Object storage lets any instance serve or process the file.",
        },
        {
          id: "c",
          text: "Turn on sticky sessions so each user always returns to the same instance.",
          why: "Stickiness keeps the state in one instance's memory and adds a dependency on routing. Killing that instance still logs its users out.",
        },
        {
          id: "d",
          text: "Treat anything held in process memory as a cache that can be dropped and rebuilt.",
          why: "If memory holds only disposable copies, losing an instance costs speed rather than correctness, which is what the chapter means by in-process memory being a cache.",
        },
        {
          id: "e",
          text: "Keep each cart in process memory and snapshot it to local disk every night.",
          why: "A crash before the snapshot loses a day of carts, and the snapshot sits on one machine's disk. The state is still tied to the instance.",
        },
      ],
      answers: ["a", "b", "d"],
    },
    {
      id: "cs-enter-key-path",
      chapter: "sysdes-client-server-basics",
      level: "beginner",
      skill: "sequence",
      section: "the-one-question-that-separates-levels-what-happens-when-i-h",
      kind: "order",
      prompt:
        "<p>A user types a URL and presses enter, and the page is served by a cache-backed app tier behind a load balancer. Put the steps in the order they happen when the cache does not hold the data.</p>",
      items: [
        { id: "dns", text: "The browser asks its recursive resolver for the server's IP address" },
        { id: "tcp", text: "The client completes the TCP three-way handshake with the load balancer" },
        { id: "tls", text: "The client and load balancer complete the TLS handshake" },
        {
          id: "http",
          text: "The HTTP request goes over the encrypted connection and the balancer picks an app server",
        },
        { id: "cache", text: "The app server looks for the data in the cache" },
        { id: "db", text: "The cache misses, so the app server queries the primary database" },
      ],
      why: "The browser cannot open a socket without an IP address, so DNS comes first. TCP then has to be established before TLS can negotiate on top of it, and no HTTP can be sent until TLS completes. Once a request arrives, the balancer chooses an app server, which tries the cache first and only falls back to the database on a miss, because the database is the hardest component to scale.",
    },
  ],
};
