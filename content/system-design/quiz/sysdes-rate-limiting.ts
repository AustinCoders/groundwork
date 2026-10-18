import type { DesignPool } from "../../quiz-types";

export const pool: DesignPool = {
  questions: [
    {
      id: "rl-key-for-login",
      chapter: "sysdes-rate-limiting",
      level: "intermediate",
      skill: "tradeoff",
      section: "choosing-the-key",
      kind: "single",
      prompt:
        "<p>Your public login endpoint is being hit from a few addresses that try one or two passwords on each of millions of different accounts. No caller is authenticated yet, so there is no user or API key to count against. Which limiter key does the most good here?</p>",
      choices: [
        {
          id: "a",
          text: "Per API key, because that is the default whenever identity exists.",
          why: "No identity exists before login, so there is no API key to count. The chapter calls out the login endpoint as the place a per-identity limit cannot protect.",
        },
        {
          id: "b",
          text: "Per account name, with a hard lockout after five failures.",
          why: "Credential stuffing tries one or two passwords on each of millions of accounts, so a per-account counter barely moves. A hard lockout also lets an attacker lock real users out on purpose.",
        },
        {
          id: "c",
          text: "Per IP address, with each IPv6 address grouped by its prefix.",
          why: "IP is the key for unauthenticated traffic. Grouping IPv6 addresses by their /64 prefix stops an attacker from cycling through addresses that cost almost nothing. Per-IP has its own weakness, because carrier and corporate NAT put thousands of users behind one address, so in practice it is paired with other signals.",
        },
        {
          id: "d",
          text: "One global counter for the whole endpoint.",
          why: "A single global counter treats every caller the same, so a botnet that fills it blocks every legitimate user too. It limits load but gives up fairness, which is what the key is for.",
        },
      ],
      answer: "c",
    },
    {
      id: "rl-sliding-counter-one-second",
      chapter: "sysdes-rate-limiting",
      level: "intermediate",
      skill: "estimate",
      section: "sliding-window-counter-the-practical-default",
      kind: "single",
      prompt:
        "<p>A sliding window counter limits a client to 100 requests per minute. The client spends all 100 in window 1. Exactly one second into window 2 it fires requests as fast as it can. Using the chapter's estimate, <code>prevCount × (1 − elapsed) + count</code>, rejecting once the estimate reaches the limit, how many requests are admitted?</p>",
      choices: [
        {
          id: "a",
          text: "100, the same as a fixed window would allow",
          why: "That is the fixed-window answer, where the counter resets at the boundary. The sliding counter still weights the previous window, so it admits far fewer.",
        },
        {
          id: "b",
          text: "50",
          why: "50 is the number admitted halfway through window 2, when the previous window has a weight of 0.5. One second in, the weight is still about 0.98.",
        },
        {
          id: "c",
          text: "2",
          why: "At one second in, elapsed is 1/60, so the previous window still counts for 100 × 0.983 = 98.3. The first request raises the estimate to 99.3 and the second to 100.3, so a third is rejected.",
        },
        {
          id: "d",
          text: "0",
          why: "The estimate starts at 98.3, which is under the limit of 100, so the first request is admitted. Only once the estimate reaches 100 does it reject.",
        },
      ],
      answer: "c",
    },
    {
      id: "rl-bucket-burst-of-twelve",
      chapter: "sysdes-rate-limiting",
      level: "intermediate",
      skill: "estimate",
      section: "token-bucket-the-one-to-reach-for-when-bursts-are-legitimate",
      kind: "single",
      prompt:
        "<p>A full token bucket has capacity B = 10 and refills at r = 5 tokens per second. Each request costs one token. A client sends 12 requests in the same millisecond. How many are allowed, and what does the chapter's formula, <code>retryAfter = ceil(deficit / refillPerSec)</code>, give the 11th request in seconds?</p>",
      choices: [
        {
          id: "a",
          text: "5 allowed, Retry-After 1",
          why: "The refill rate sets the sustained rate, not the burst. A full bucket lets the client spend all 10 tokens at once, so 5 is too low.",
        },
        {
          id: "b",
          text: "10 allowed, Retry-After 1",
          why: "Ten tokens cover ten requests. The 11th has a deficit of 1 token, and ceil(1 / 5) rounds the 0.2 seconds up to a whole second, which is conservative by design.",
        },
        {
          id: "c",
          text: "12 allowed, Retry-After 0",
          why: "Twelve would exceed the capacity of 10. The bucket never holds more than B tokens, so two requests find it empty.",
        },
        {
          id: "d",
          text: "10 allowed, Retry-After 5",
          why: "The right count, but the wait is wrong: a deficit of one token divided by 5 tokens per second is 0.2 seconds, which rounds up to 1. Five is the refill rate, not the wait.",
        },
      ],
      answer: "b",
    },
    {
      id: "rl-in-flight-when-slow",
      chapter: "sysdes-rate-limiting",
      level: "intermediate",
      skill: "estimate",
      section: "limit-concurrency-not-just-rate",
      kind: "single",
      prompt:
        "<p>A service takes 200 requests per second and each call to its dependency normally takes 250 ms. The dependency degrades and each call now takes 5 seconds. Nobody exceeds their rate quota. Using Little's law, about how many requests are in flight now?</p>",
      choices: [
        {
          id: "a",
          text: "About 1,000",
          why: "In-flight requests equal arrival rate times latency: 200 per second × 5 seconds = 1,000. That is twenty times the 50 you had before, and the rate limiter reports nothing wrong.",
        },
        {
          id: "b",
          text: "About 50, because the rate has not changed",
          why: "50 is the normal figure: 200 × 0.25. Rate alone does not bound work in flight, so the number grows with latency even though the arrival rate stays put.",
        },
        {
          id: "c",
          text: "About 200, one per request per second",
          why: "That treats each request as lasting one second, which matches neither the old latency nor the new one. Multiply the rate by the actual latency instead.",
        },
        {
          id: "d",
          text: "About 5,000",
          why: "This multiplies by the latency of 5 and then by a further factor of 5 with no basis. Little's law is a single product of arrival rate and time in the system.",
        },
      ],
      answer: "a",
    },
    {
      id: "rl-banned-forever",
      chapter: "sysdes-rate-limiting",
      level: "intermediate",
      skill: "diagnose",
      section: "the-distributed-problem-one-limit-many-nodes",
      kind: "single",
      prompt:
        "<p>Support reports that a handful of users stay blocked long after their window should have reset. Your fixed-window code is <code>n = INCR(key)</code>, then <code>if (n === 1) EXPIRE(key, 60)</code>, as two separate calls. In Redis, what is the most likely cause?</p>",
      choices: [
        {
          id: "a",
          text: "The process died, or the connection dropped, between INCR and EXPIRE, so the key has no expiry and its counter never resets.",
          why: "The two calls are not atomic. A crash between them leaves a key that is incremented but never expires, so the user stays over the limit. Fix it by doing both in one atomic step, such as a Lua script or INCR with EXPIRE NX inside MULTI/EXEC.",
        },
        {
          id: "b",
          text: "The fixed window lets a 2x burst through at the boundary.",
          why: "That boundary burst admits too many requests. It does not keep anyone blocked past their reset, so it cannot explain these symptoms.",
        },
        {
          id: "c",
          text: "Lazy refill in the token bucket is under-counting tokens.",
          why: "This code is a fixed-window counter and has no token bucket or refill. Lazy refill is a different algorithm's mechanism.",
        },
        {
          id: "d",
          text: "The sliding window counter is carrying an old previous-window count forward.",
          why: "That bug belongs to the sliding window counter and needs a prevCount, which this code does not have. The symptom would be throttling after a quiet period, and here the key never expires at all.",
        },
      ],
      answer: "a",
    },
    {
      id: "rl-stop-the-retry-storm",
      chapter: "sysdes-rate-limiting",
      level: "intermediate",
      skill: "tradeoff",
      section: "what-you-return-and-how-a-good-client-behaves",
      kind: "multi",
      prompt:
        "<p>After a brief outage, thousands of clients receive 429 responses at the same moment and you want to stop them knocking the recovering service over again. Select every measure from the chapter that helps.</p>",
      choices: [
        {
          id: "a",
          text: "Return Retry-After computed from the limiter's own state, have clients prefer it over their own guess, and add a small random offset.",
          why: "The server knows the refill rate, so its hint turns guesswork into a schedule. A bare 429 tells every client to retry immediately, and a small offset stops thousands of clients sharing one reset instant from returning together.",
        },
        {
          id: "b",
          text: "Add jitter to client backoff, for example full jitter, picking uniformly below the ceiling.",
          why: "Plain exponential backoff keeps clients in step, because everyone throttled together retries together. Randomising the delay spreads the retries out.",
        },
        {
          id: "c",
          text: "Cap the attempt count and keep retries under a budget of roughly 10% of requests.",
          why: "Unbounded retries amplify an outage. A per-client retry budget keeps the extra load near 1.1x instead of nearly 3x, so it is part of the defence.",
        },
        {
          id: "d",
          text: "Back off exponentially without any randomness, so the schedule is predictable.",
          why: "Without jitter every client retries at exactly the same instants, which recreates the herd that just knocked the service over.",
        },
        {
          id: "e",
          text: "Retry straight away up to ten times, so each client gets its answer sooner.",
          why: "Immediate retries multiply the load on a service that is struggling. This is the retry storm the other measures are meant to prevent.",
        },
      ],
      answers: ["a", "b", "c"],
    },
    {
      id: "rl-layers-in-order",
      chapter: "sysdes-rate-limiting",
      level: "intermediate",
      skill: "sequence",
      section: "where-the-limiter-lives",
      kind: "order",
      prompt:
        "<p>A request travels from the client to the service. Put the limiter layers in the order the request meets them.</p>",
      items: [
        { id: "edge", text: "Edge or CDN: a coarse per-IP limit absorbs volumetric abuse" },
        { id: "gateway", text: "API gateway: a per-API-key quota, backed by a shared Redis" },
        {
          id: "service",
          text: "Service: a per-tenant cost or concurrency limit that knows what the request will cost",
        },
      ],
      why: "The edge is the cheapest place to drop traffic because it is furthest from the database, so it comes first and stays coarse. The gateway knows who the caller is and enforces quotas through shared state. Only the service knows how expensive a particular query is, so the cost and concurrency limit sits innermost.",
    },
  ],
};
