import type { Chapter } from "../types";

export const sysdesWalkthroughNotifications: Chapter = {
  id: "sysdes-walkthrough-notifications",
  num: "I11",
  title: "Walkthrough: a notification system",
  short: "Walkthrough: notifications",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle:
    "A notification system looks like a loop over users and a call to an API, until you remember that the APIs are other people's, the users can say no, and a retry can wake someone up twice.",
  body: `<h3>What the question is really about</h3>
<p>
  "Design a notification system" (a chapter of Alex Xu's first volume) is a
  question about <b>fan-out through other people's services</b>. You will never
  deliver a push notification yourself: Apple and Google do, a carrier does for SMS,
  a mail provider does for email. Your system is the part in front of them. It decides
  <em>whether</em> to send (preferences, rate limits, duplicates), <em>what</em> to send
  (templates, locale, size limits), <em>when</em> (priority, quiet hours, expiry), and
  what to do when the provider says no or says nothing. Every one of those is a design
  decision with a number attached, and the walkthrough below attaches them.
</p>
<p>
  Scope for this chapter: push (iOS and Android), SMS and email, triggered by other
  services (an order shipped, a password reset) or by a campaign tool (a promotion to
  millions). Out of scope: building a mail server or a carrier connection. Requirements
  worth saying aloud:
</p>
<ul>
  <li><b>Soft real-time.</b> A one-time passcode should arrive in seconds; a marketing push can wait minutes.</li>
  <li><b>Never send what the user refused.</b> This is the one requirement with legal weight, so it is checked as late as possible.</li>
  <li><b>At-least-once with de-duplication.</b> Losing a shipping notice is bad, sending it three times is also bad; both are prevented by design, not by hope.</li>
  <li><b>Isolation.</b> A slow SMS provider must not delay push, and a 20-million-user campaign must not delay a passcode.</li>
</ul>

<h3>Capacity estimation</h3>
<p>
  The inputs are assumptions chosen to be round; copy the method. Provider figures are
  cited in the next section.
</p>
<ul>
  <li><b>Transactional baseline:</b> 10 million notifications a day ÷ 86,400 s = <b>116 a second</b>; at a 5× peak, <b>579 a second</b>.</li>
  <li><b>Campaign burst:</b> one marketing push to 20 million devices, sent over one hour: 20,000,000 ÷ 3,600 = <b>5,556 a second</b>. Throughput here is set by the campaign, not by the baseline.</li>
  <li><b>Provider ceiling check (push):</b> FCM's default quota is 600,000 messages a minute per project, which is 10,000 a second. The campaign plus the baseline peak is 5,556 + 579 = 6,135 a second, or <b>61% of quota</b>. Sending the same 20 million, one message per device token, as fast as the default quota allows would take 20,000,000 ÷ 10,000 = 2,000 s, about <b>33 minutes</b>. Google lets you request an increase of up to 25% when you meet its criteria, which would still leave a floor of about 27 minutes. The estimate also treats all 20 million devices as FCM sends, an upper bound: iOS devices can be sent to APNs directly.</li>
  <li><b>Concurrency to hold that rate:</b> by Little's law, in-flight requests = rate × latency. At an assumed 50 ms per provider call, 5,556 × 0.05 = <b>278 requests in flight</b>, which a modest worker pool with multiplexed connections handles.</li>
  <li><b>Email campaign:</b> 5 million emails over two hours: 5,000,000 ÷ 7,200 = <b>694 a second</b>.</li>
  <li><b>SMS is the bottleneck.</b> For 1 million message segments: at 1 segment a second (Twilio's example for a US long code) that is 1,000,000 s, <b>11.6 days</b>; at a short code's 100 a second, 10,000 s, <b>2.8 hours</b>. Twilio also queues for at most 10 hours, which at 1 a second is 36,000 segments, so one long code cannot even hold a 1-million-message backlog. The sender type is a requirements decision, not a tuning knob.</li>
  <li><b>Device tokens:</b> 20 million users × 2.5 devices = 50 million tokens × 200 B = <b>10 GB</b>. It fits in memory on one cache cluster.</li>
  <li><b>De-duplication keys:</b> 30 million notifications a day (10 million baseline plus the 20 million campaign) × an assumed 100 bytes a key = <b>3 GB</b> for a 24-hour window.</li>
  <li><b>Delivery log:</b> 30 million notifications × 4 status events (queued, sent, delivered, opened) × 100 B = <b>12 GB a day</b>; 90 days is <b>1.08 TB</b>, which assumes a campaign that size runs every day, so it is an upper bound. Small enough for one partitioned store, large enough that you will want a retention policy.</li>
</ul>

<h3>The architecture</h3>
<figure>
  <svg viewBox="0 0 640 320" class="dg" role="img" aria-label="Producers send events to a notification service that validates, de-duplicates, checks preferences, rate limits and renders, then writes jobs to three per-channel queues for push, SMS and email. Each queue feeds a worker pool that calls an external provider, and provider callbacks flow back into a delivery log.">
    <g class="rough">
      <path class="lng" d="M116,142 L150,142" />
      <path class="ln"  d="M300,126 L340,73" />
      <path class="ln"  d="M300,142 L340,153" />
      <path class="ln"  d="M300,158 L340,233" />
      <path class="lng" d="M420,73 L450,73" />
      <path class="lng" d="M420,153 L450,153" />
      <path class="lng" d="M420,233 L450,233" />
      <path class="ln"  d="M520,73 L550,73" />
      <path class="ln"  d="M520,153 L550,153" />
      <path class="ln"  d="M520,233 L550,233" />
      <path class="ln dash" d="M624,73 L634,73 L634,284 L452,284" />
      <path class="ln dash" d="M624,153 L634,153" />
      <path class="ln dash" d="M624,233 L634,233" />
      <rect class="box"  x="16"  y="106" width="100" height="72" rx="6" />
      <rect class="boxy" x="150" y="86"  width="150" height="112" rx="6" />
      <rect class="boxy" x="340" y="50"  width="80"  height="46" rx="6" />
      <rect class="boxy" x="340" y="130" width="80"  height="46" rx="6" />
      <rect class="boxy" x="340" y="210" width="80"  height="46" rx="6" />
      <rect class="boxg" x="450" y="50"  width="70"  height="46" rx="6" />
      <rect class="boxg" x="450" y="130" width="70"  height="46" rx="6" />
      <rect class="boxg" x="450" y="210" width="70"  height="46" rx="6" />
      <rect class="box"  x="550" y="50"  width="74"  height="46" rx="6" />
      <rect class="box"  x="550" y="130" width="74"  height="46" rx="6" />
      <rect class="box"  x="550" y="210" width="74"  height="46" rx="6" />
      <rect class="boxr" x="150" y="268" width="300" height="38" rx="6" />
    </g>
    <text class="sm" x="66"  y="136" text-anchor="middle">producers</text>
    <text class="sm" x="66"  y="152" text-anchor="middle">services,</text>
    <text class="sm" x="66"  y="168" text-anchor="middle">campaign tool</text>
    <text class="sm" x="225" y="108" text-anchor="middle">notification service</text>
    <text class="sm" x="225" y="130" text-anchor="middle">validate, dedupe</text>
    <text class="sm" x="225" y="146" text-anchor="middle">preferences, rate limit</text>
    <text class="sm" x="225" y="162" text-anchor="middle">pick channels, render</text>
    <text class="sm" x="225" y="182" text-anchor="middle">priority, expiry</text>
    <text class="sm" x="380" y="70"  text-anchor="middle">push queue</text>
    <text class="sm" x="380" y="86"  text-anchor="middle">3 lanes</text>
    <text class="sm" x="380" y="150" text-anchor="middle">SMS queue</text>
    <text class="sm" x="380" y="166" text-anchor="middle">3 lanes</text>
    <text class="sm" x="380" y="230" text-anchor="middle">email queue</text>
    <text class="sm" x="380" y="246" text-anchor="middle">3 lanes</text>
    <text class="sm" x="485" y="77"  text-anchor="middle">workers</text>
    <text class="sm" x="485" y="157" text-anchor="middle">workers</text>
    <text class="sm" x="485" y="237" text-anchor="middle">workers</text>
    <text class="sm" x="587" y="68"  text-anchor="middle">APNs, FCM</text>
    <text class="sm" x="587" y="84"  text-anchor="middle">push</text>
    <text class="sm" x="587" y="148" text-anchor="middle">SMS</text>
    <text class="sm" x="587" y="164" text-anchor="middle">provider</text>
    <text class="sm" x="587" y="228" text-anchor="middle">email</text>
    <text class="sm" x="587" y="244" text-anchor="middle">provider</text>
    <text class="sm" x="300" y="292" text-anchor="middle">delivery log and analytics</text>
    <text class="sm" x="16" y="206">lanes: high (passcodes),</text>
    <text class="sm" x="16" y="222">normal, bulk (campaigns)</text>
    <text class="sm rd" x="16" y="250">callbacks flow back (dashed)</text>
  </svg>
  <figcaption>One queue per channel isolates providers from each other; three lanes per queue isolate a passcode from a campaign. Workers are the only part that knows provider protocols.</figcaption>
</figure>
<p>
  <b>Why a queue per channel</b> (the <a href="/system-design/sysdes-message-queues-async">queues chapter</a> covers the
  mechanics): the channels have different throughput ceilings by orders of magnitude (the
  SMS arithmetic above), different failure modes and different retry policies, so a
  backlog in one must not block the others. <b>Why lanes:</b> a shared queue means a
  4-hour campaign backlog delays a password reset. Put passcodes and security alerts
  in a high lane with reserved worker capacity, transactional in normal, and
  campaigns in bulk. <b>Why the service does the checking, not the workers:</b>
  preferences, de-duplication and rate limits are decisions about <em>the user</em>, made
  once per notification; workers only know how to talk to a provider.
</p>

<h3>The four providers, and what each one forces on you</h3>
<table>
  <tr><th>Channel</th><th>Facts that shape the design</th><th>Design consequence</th></tr>
  <tr><td><b>APNs</b> (iOS)</td><td>HTTP/2 and TLS 1.2 or later. Payload at most 4 KB (4,096 bytes), 5 KB for VoIP. <code>apns-priority</code> 10 sends immediately, 5 takes the device's power into account, and priority-5 traffic may be grouped, throttled and sometimes not delivered. <code>apns-expiration</code> of 0 means attempt once and do not store. <code>apns-collapse-id</code> (at most 64 bytes) merges notifications. APNs is best effort, may reorder, stores only one notification per bundle ID for an offline device (usually the latest) and for 30 days or less. Status 410 Unregistered means the token is no longer valid</td><td>Keep payloads small and put the detail behind a fetch on tap. Set expiry per message type: zero for a passcode that is useless in a minute. Use collapse ids for "score updated" style messages. On 410, delete the token and stop. A 200 means APNs accepted the request, not that a phone received it</td></tr>
  <tr><td><b>FCM</b> (Android, web, and iOS via APNs)</td><td>Payload at most 4,096 bytes for both message types. A message with no TTL lives for up to four weeks; on Android and web the TTL can be 0 to 2,419,200 s (28 days). Collapse keys replace an undelivered message with the same key. Default send quota 600,000 messages a minute per project; per-device limits of 240 messages a minute and 5,000 an hour on Android. A 429 carries a <code>retry-after</code> header, with a 60 second default when it is absent. Traffic more than doubles for the first 30 seconds to 2 minutes of each hour, with smaller spikes at :15, :30 and :45</td><td>Use short TTLs for time-bound messages and collapse keys for state. Budget against the quota (above), respect <code>retry-after</code>, and stagger campaign sends away from :00, :15, :30 and :45</td></tr>
  <tr><td><b>SMS</b> (Twilio as the example)</td><td>One message segment per second for a US long code in Twilio's example, short codes at over 100 a second; queue of up to 10 hours. 160 GSM-7 characters or 70 UCS-2 characters in one segment, 153 or 67 per segment once split. One character outside GSM-7 switches the whole message to UCS-2. A STOP reply puts the number on a block list and later sends fail with error 21610</td><td>Choose the sender type from the volume. Count segments at render time and reject or trim: a 161-character GSM-7 message is two segments, and 100 characters with one emoji is two segments where the plain text was one. Honour STOP in your own preferences too, not only at the provider</td></tr>
  <tr><td><b>Email</b></td><td>Gmail's rules for senders of 5,000 or more messages a day to Gmail addresses: SPF, DKIM and DMARC; marketing and subscribed mail needs one-click unsubscribe (a <code>List-Unsubscribe</code> HTTPS URI and <code>List-Unsubscribe-Post: List-Unsubscribe=One-Click</code>, the mechanism of RFC 8058); user-reported spam rate below 0.10% as a target and never 0.30% or more. Under CAN-SPAM, opt-outs must be honoured within 10 business days and the mechanism must work for 30 days after sending; each violating email carries a penalty of up to $53,088</td><td>Separate transactional and marketing mail onto different sending domains or streams so a marketing complaint spike does not hurt a receipt. Process hard bounces and complaints into a suppression list and never retry them. Treat 10 business days as a legal outer limit and aim for seconds</td></tr>
</table>
<p class="sub">
  A caution on all four rows: provider limits change, and several are account-specific
  (quotas, sender throughput). Quote them as "the documented default as of this
  writing", and design the sender as a thin adapter so replacing a provider changes one
  module.
</p>

<h3>Templates: render late, check size, localize</h3>
<p>
  A producer should send an <b>event</b>, not a finished message:
  <code>{type: "order_shipped", user_id, order_id, carrier, eta}</code>. The service
  maps the type to a <b>template</b> per channel and locale, with a version. Three
  decisions:
</p>
<ul>
  <li><b>Render at the worker, store the template id, version and variables.</b> You keep an auditable record of what was sent without storing millions of rendered bodies, and a fix to a typo applies to jobs still in the queue. The cost is that the worker must have the template; cache it by version.</li>
  <li><b>Validate at render time, not at the provider.</b> A missing variable should fail the job to the dead-letter queue, not send "Hi {{name}}". Check the push payload against 4,096 bytes and the SMS against your segment budget; an oversized payload is a permanent failure, so it must never enter the retry loop.</li>
  <li><b>Locale falls back, never fails.</b> User locale, then language, then default. Email carries an HTML part and a plain-text part.</li>
</ul>

<h3>Preferences and opt-outs: checked at the last moment</h3>
<p>
  The preference store is a map from (user, category, channel) to allowed or not, plus
  quiet hours and a time zone. It has a few properties that matter more than its
  schema:
</p>
<ul>
  <li><b>Category matters more than channel.</b> A user can silence promotions on every channel and still want a shipping notice. Mark each notification type as <em>transactional</em>, <em>marketing</em> or <em>security</em>. As a design policy (chosen to satisfy the strictest regimes: US law lets marketing email run on opt-out, while SMS marketing and EU rules need prior consent), marketing requires an opt-in and honours every opt-out; transactional ignores marketing opt-outs (but not a channel-level STOP at the SMS provider, which is blocked regardless); security is not user-silenceable.</li>
  <li><b>Check twice, and the second check is the real one.</b> The service checks when it creates jobs, which is cheap and saves queue space. The worker checks again just before it calls the provider, because a campaign at 5,556 a second takes an hour to drain and someone will unsubscribe in minute ten. That second check is what makes "never send what the user refused" true.</li>
  <li><b>Read path is hot, write path is rare.</b> Cache preferences by user; invalidate on write; fail closed (do not send marketing) if the store is unreachable, fail open for security messages.</li>
  <li><b>Provider-level state wins.</b> Mirror STOP replies, email unsubscribes and complaints into the same store, so one source of truth feeds all channels.</li>
  <li><b>Quiet hours</b> mean a scheduled job, not a sleeping worker: if it is 2 a.m. for the user, enqueue with a delayed visibility time for 8 a.m., and apply an expiry so a stale message is dropped rather than delivered a day late.</li>
</ul>

<h3>Reliability: retries, duplicates and unknown outcomes</h3>
<p>
  The queue gives at-least-once delivery, so every layer of this system must tolerate a
  repeat. There are two sources of duplicates: the producer calling twice (it timed out
  waiting) and the worker retrying after an ambiguous failure.
</p>
<ul>
  <li><b>De-duplicate at the front door.</b> Every event carries an <b>event id</b> (or you derive a key from user, type and business id, such as the order id). The service does <code>SET dedupe:{id} NX EX 86400</code> in a key-value store: if the key exists, drop the event. The 24-hour window costs 3 GB at the estimate above. It cannot cover a producer that replays a week later, which is a correctness limit to state.</li>
  <li><b>Classify errors before retrying.</b> Retryable: timeouts, 5xx, and 429 (with the provider's delay). Permanent: bad requests, an oversized payload (APNs 413, FCM's 4,096-byte limit), 410 Unregistered or a hard bounce (remove the token or address), a STOP block. Permanent errors skip the backoff ladder and update state (delete the token, suppress the address).</li>
  <li><b>Back off with jitter, and cap the budget.</b> The backoff and jitter maths are in the <a href="/system-design/sysdes-rate-limiting">rate-limiting chapter</a>. The retry rules are per provider. For FCM, Google's guidance is to wait at least 10 seconds before a retry, use exponential backoff with jitter, respect <code>retry-after</code> on a 429, and set a maximum age after which a request is dropped instead of retried forever (it gives no number, and says a request still failing an hour later points to a misclassified error or an outage). For APNs, Apple says 5xx responses can be retried after 15 minutes, with back-off if you like, that a 429 TooManyRequests can be retried with a delay, and that BadDeviceToken, DeviceTokenNotForTopic, Forbidden, ExpiredToken, Unregistered and PayloadTooLarge must not be retried. A passcode should expire much sooner than any of this: set the expiry on the job and have the worker drop it when it is stale, instead of delivering a code that no longer works.</li>
  <li><b>An unknown outcome is possible.</b> A provider call that times out may have succeeded. Providers differ in whether they de-duplicate; push and email duplicates are annoying, an SMS duplicate costs money, and a duplicate OTP is harmless because the newest code works. Say the trade-off: you accept a rare duplicate rather than a lost message, and you reduce it by keeping the retry count low for non-idempotent channels and using the provider's idempotency or message-id feature where it exists.</li>
  <li><b>Dead-letter queue, alerting and replay</b>, exactly as in the queues chapter: bounded retries, a DLQ with the error, an alert on depth and a replay path.</li>
</ul>

<h3>Rate limiting, priority and expiry</h3>
<ul>
  <li><b>Per user.</b> Cap marketing at, say, three pushes a day and one email, so a bug or an overeager campaign cannot flood a person. A token bucket per (user, channel, category) held in the same key-value store does it (the algorithm and Redis implementation are in the rate-limiting chapter). The cap applies to marketing and bulk; never to security.</li>
  <li><b>Per provider.</b> A global limiter in front of each provider adapter keeps you under its quota. The FCM quota above is 10,000 a second; give the bulk lane a share and reserve the rest so a campaign cannot starve transactional sends.</li>
  <li><b>Per campaign.</b> Ramp up. Google's own guidance for FCM traffic is to ramp from zero to the target rate over at least 60 seconds, not to spike on the hour, and to step large increases in stages. Treat the first thousand sends of a campaign as a canary: if the failure rate jumps, pause.</li>
  <li><b>Priority is a scheduling policy.</b> Workers pull high first, with a floor of capacity for normal and bulk so nothing starves, or run separate pools. Pass priority through to the provider too: APNs priority 10 for something the user is waiting for, 5 otherwise.</li>
  <li><b>Expiry is part of the message.</b> Set a time to live on every job and pass it to the provider (the APNs expiration header, the FCM TTL). A notification that is late enough to be wrong should not be sent.</li>
</ul>

<h3>Delivery tracking and analytics</h3>
<figure>
  <svg viewBox="0 0 640 250" class="dg" role="img" aria-label="Notification states: accepted, queued, sent to provider, then delivered and opened. Branches: a duplicate is dropped at accept, a suppressed or expired job is dropped from the queue, a job that fails after retries goes to the dead-letter queue from queued, and a bounce or invalid address comes back from sent instead of delivered.">
    <g class="rough">
      <path class="lng" d="M106,70 L134,70" />
      <path class="lng" d="M254,70 L282,70" />
      <path class="lng" d="M402,70 L430,70" />
      <path class="lng" d="M560,70 L574,70" />
      <path class="lnr" d="M61,92 L61,150" />
      <path class="lnr" d="M174,92 L174,150" />
      <path class="lnr" d="M214,92 L274,150" />
      <path class="lnr" d="M362,92 L392,150" />
      <rect class="box"  x="16"  y="48" width="90"  height="44" rx="6" />
      <rect class="boxy" x="134" y="48" width="120" height="44" rx="6" />
      <rect class="boxy" x="282" y="48" width="120" height="44" rx="6" />
      <rect class="boxg" x="430" y="48" width="130" height="44" rx="6" />
      <rect class="boxg" x="574" y="48" width="56"  height="44" rx="6" />
      <rect class="boxr" x="16"  y="150" width="90"  height="44" rx="6" />
      <rect class="boxr" x="116" y="150" width="116" height="44" rx="6" />
      <rect class="boxr" x="238" y="150" width="116" height="44" rx="6" />
      <rect class="boxr" x="360" y="150" width="116" height="44" rx="6" />
    </g>
    <text class="sm" x="61"  y="68" text-anchor="middle">accepted</text>
    <text class="sm" x="61"  y="83" text-anchor="middle">id is new</text>
    <text class="sm" x="194" y="68" text-anchor="middle">queued</text>
    <text class="sm" x="194" y="83" text-anchor="middle">after checks</text>
    <text class="sm" x="342" y="68" text-anchor="middle">sent</text>
    <text class="sm" x="342" y="83" text-anchor="middle">provider accepts</text>
    <text class="sm" x="495" y="68" text-anchor="middle">delivered</text>
    <text class="sm" x="495" y="83" text-anchor="middle">receipt or callback</text>
    <text class="sm" x="602" y="74" text-anchor="middle">opened</text>
    <text class="sm" x="61"  y="170" text-anchor="middle">duplicate</text>
    <text class="sm" x="61"  y="185" text-anchor="middle">dropped</text>
    <text class="sm" x="174" y="170" text-anchor="middle">suppressed or</text>
    <text class="sm" x="174" y="185" text-anchor="middle">expired</text>
    <text class="sm" x="296" y="170" text-anchor="middle">failed after</text>
    <text class="sm" x="296" y="185" text-anchor="middle">retries (DLQ)</text>
    <text class="sm" x="418" y="170" text-anchor="middle">bounced or</text>
    <text class="sm" x="418" y="185" text-anchor="middle">invalid address</text>
    <text class="sm" x="16" y="216">States only move forward. Callbacks arrive late and out of order,</text>
    <text class="sm" x="16" y="232">so a later state wins and an earlier one never overwrites it.</text>
  </svg>
  <figcaption>A notification is a small state machine, and every arrow is a row in the delivery log. A retried failure stays in "queued" until the budget runs out; a bounce comes back from "sent" instead of "delivered". "Sent" means the provider accepted the request, which is weaker than "delivered".</figcaption>
</figure>
<p>
  The honest distinction is between <b>accepted</b> and <b>delivered</b>. A 200 from APNs
  or FCM, or a 202 from an email API, means the provider took responsibility, not that a
  person saw anything. Delivery receipts come back later by webhook for SMS and email
  (delivered, bounced, complained), and push gives you partial signals at best. Design
  consequences: callbacks are <b>idempotent</b> and <b>monotonic</b> (take the furthest
  state); store the provider's message id on the "sent" row so a callback can find its
  job; and record opens and clicks from your own tracking links, which are
  approximate and affected by mail clients that prefetch. Analytics is then
  a separate consumer of the delivery log, not a feature of the sending path: stream the
  log to a warehouse, and keep the send path free of reporting queries.
</p>

<h4>Dry run: one shipping notice, with a provider error, a duplicate and a bounce</h4>
<p>
  Event E-9001 (order shipped) for user u42, who allows push and email for transactional
  messages and has SMS off. Retry delay is the 10 second Google minimum plus jitter
  (the 13 s is illustrative).
</p>
<table>
  <tr><th>Time</th><th>What happens</th><th>Dedupe key E-9001</th><th>Push job</th><th>Email job</th><th>Delivery log</th></tr>
  <tr><td>0.000 s</td><td>Producer posts the event. Service does SET NX: succeeds. Preferences allow push and email, SMS off. Two jobs enqueued in the normal lane</td><td>set, 24 h</td><td>queued</td><td>queued</td><td>accepted, queued ×2</td></tr>
  <tr><td>0.100 s</td><td>Push worker re-checks preferences (still allowed), renders 312 bytes (under 4,096), calls FCM: HTTP 503</td><td>set</td><td>retryable error</td><td>queued</td><td>push attempt 1 failed</td></tr>
  <tr><td>0.150 s</td><td>Email worker calls the email API: accepted, message id M-77</td><td>set</td><td>waiting 13 s</td><td>sent</td><td>email sent (M-77)</td></tr>
  <tr><td>13.1 s</td><td>Push retry succeeds with 200</td><td>set</td><td>sent</td><td>sent</td><td>push sent</td></tr>
  <tr><td>15.0 s</td><td>The producer, which timed out at 10 s, posts E-9001 again. SET NX finds the key and the event is dropped</td><td>hit</td><td>sent</td><td>sent</td><td>duplicate dropped (counted)</td></tr>
  <tr><td>61 s</td><td>Email provider webhook for M-77: hard bounce, mailbox does not exist. Address added to the suppression list</td><td>set</td><td>sent</td><td>bounced</td><td>email bounced, address suppressed</td></tr>
  <tr><td>2 days later</td><td>Another notice for u42: email skipped (suppressed), push sent. The user is prompted in-app to fix the address</td><td>new key</td><td>sent</td><td>suppressed</td><td>email suppressed</td></tr>
</table>
<p class="sub">
  Count the outcomes: the user got exactly one push and no email, the duplicate event
  cost one key lookup, the transient FCM error cost a 13-second delay rather than a
  lost message, and the bounce permanently improved future sends. What the log cannot
  tell you is whether the phone showed the push, which is why "delivered" is reported
  for email and SMS and "sent" for push.
</p>

<h3>Failure modes and follow-ups to volunteer</h3>
<ul>
  <li><b>A provider is down.</b> Its queue grows, retries back off, others are unaffected. Fall back to a second provider where the channel allows (a second email or SMS vendor), and never fall back across channels for marketing: an unsent push is not permission to send an SMS.</li>
  <li><b>Thundering campaign.</b> The ramp, per-provider limiter and bulk lane above. Add a kill switch per campaign.</li>
  <li><b>Stale tokens.</b> FCM considers a registration stale after about a month without a connection and garbage collects Android registrations after 270 days. Refresh token timestamps from the client, drop stale tokens before sending, and delete on UNREGISTERED. Sending to dead tokens wastes quota and hurts delivery statistics.</li>
  <li><b>Time zones.</b> "9 a.m. local" for 20 million users is a rolling send across 24 hours, not a burst: it helps with every limit above.</li>
  <li><b>Observability.</b> Alert on queue depth and age per lane, provider error rates, DLQ depth, bounce and complaint rates (against the 0.10% and 0.30% marks) and the fraction of events dropped as duplicates.</li>
</ul>

<div class="say">
  <span class="ttl">Say it like this →</span> "Producers publish events, not
  messages. A notification service de-duplicates by event id, checks the user's
  preferences by category and channel, applies per-user and per-provider rate limits,
  picks channels and writes a job to a per-channel queue with high, normal and bulk
  lanes. Workers re-check consent right before sending, render the template, call
  APNs, FCM, the SMS provider or the email provider, classify errors, retry the
  transient ones with jittered backoff inside an expiry, and delete tokens and suppress
  addresses on permanent ones. Provider callbacks feed a monotonic delivery log. The
  numbers that drive it: a 20 million push campaign is 5,556 a second, 56% of FCM's
  default quota on its own and 61% with the transactional peak, and a million SMS
  segments at one segment a second would take about 12 days, so the SMS sender type
  is a requirement, not a detail."
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li><b>Signals:</b> "send an email or SMS when...", "push notifications", "alerts", "reminders", "marketing campaign to millions", "OTP", or any design that has to talk to an external messaging provider.</li>
  <li><b>The structure to reach for:</b> events in, preference and rate checks, queue per channel, adapters, callbacks to a delivery log.</li>
  <li><b>The numbers an interviewer wants:</b> peak rate from the campaign rather than the average, a provider ceiling compared with that rate, and the SMS throughput shock.</li>
  <li><b>The pitfalls to name unprompted:</b> checking consent only at enqueue time, one shared queue for passcodes and promotions, retrying permanent errors, treating "accepted" as "delivered", and ignoring expiry.</li>
  <li><b>The follow-up you will get:</b> "how do you avoid sending the same notification twice?" Event-id de-duplication with a TTL, idempotent state updates, and an honest statement that the provider call itself can still produce a rare duplicate.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Rebuild the capacity estimate: peak rate for the 20-million campaign, its share of FCM's quota, the minimum time at the quota, and the concurrency needed at 50 ms a call.</li>
    <li>Compute how long a million SMS segments take on a long code and on a short code, and say what that does to the design.</li>
    <li>Explain why consent is checked in the worker as well as in the service.</li>
    <li>Say which errors are retried and which are not, for APNs, FCM, SMS and email.</li>
    <li>Trace the dry run and say what prevented the second push, and what prevented a second email to a dead address.</li>
    <li>Explain the difference between sent and delivered, and why callbacks need a monotonic state machine.</li>
    <li>Describe the lanes and say how a campaign is prevented from delaying a passcode.</li>
  </ul>
</div>
<div class="bx is-ref">
  <span class="ttl">Sources and further reading</span>
  <ul>
    <li><a href="https://developer.apple.com/documentation/usernotifications/sending-notification-requests-to-apns" rel="noopener noreferrer">Apple: sending notification requests to APNs</a> — HTTP/2, headers, 4 KB payload, priority, expiration, collapse id, best-effort storage</li>
    <li><a href="https://developer.apple.com/documentation/usernotifications/handling-notification-responses-from-apns" rel="noopener noreferrer">Apple: handling notification responses from APNs</a> — status codes, 410 Unregistered, which errors to retry and after how long</li>
    <li><a href="https://firebase.google.com/docs/cloud-messaging/customize-messages/setting-message-lifespan" rel="noopener noreferrer">Firebase: setting the lifespan of a message</a> — TTL range, four-week default, collapsible messages</li>
    <li><a href="https://firebase.google.com/docs/cloud-messaging/customize-messages/set-message-type" rel="noopener noreferrer">Firebase: message types</a> — notification and data messages, the 4,096-byte payload limit</li>
    <li><a href="https://firebase.google.com/docs/cloud-messaging/throttling-and-quotas" rel="noopener noreferrer">Firebase: FCM throttling and quotas</a> — 600,000 messages a minute default, per-device limits</li>
    <li><a href="https://firebase.google.com/docs/cloud-messaging/scale-fcm" rel="noopener noreferrer">Firebase: scale FCM messaging</a> — retry-after, backoff with jitter, avoiding spikes on the hour, ramp-up</li>
    <li><a href="https://firebase.google.com/docs/cloud-messaging/manage-tokens" rel="noopener noreferrer">Firebase: manage FCM registration tokens</a> — staleness after a month, 270-day expiry, UNREGISTERED handling</li>
    <li><a href="https://support.google.com/a/answer/81126" rel="noopener noreferrer">Google: email sender guidelines</a> — bulk sender authentication, one-click unsubscribe headers (RFC 8058), spam-rate thresholds</li>
    <li><a href="https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business" rel="noopener noreferrer">FTC: CAN-SPAM Act compliance guide</a> — honouring opt-outs within 10 business days, penalties, transactional messages</li>
    <li><a href="https://www.twilio.com/docs/messaging/tutorials/advanced-opt-out" rel="noopener noreferrer">Twilio: advanced opt-out</a> — STOP keywords, the block list and error 21610</li>
    <li><a href="https://www.twilio.com/docs/api/errors/30001" rel="noopener noreferrer">Twilio: error 30001, queue overflow</a> — one segment a second on a US long code, over 100 on a short code, the 10-hour queue</li>
    <li><a href="https://www.twilio.com/docs/glossary/what-sms-character-limit" rel="noopener noreferrer">Twilio: SMS character limits and encoding</a> — GSM-7 and UCS-2 segment sizes</li>
  </ul>
  <p class="sub">Claims in this chapter were checked against these sources in October 2026. Provider limits are documented defaults at that time and several are account-specific. Figures marked "assumed" or "illustrative" (10 million notifications a day, a 20-million-device campaign, 50 ms per provider call, 100 bytes per dedupe key, the 13-second retry) are this chapter's own inputs. The Apple page was read through its documentation-data endpoint.</p>
</div>`,
};
