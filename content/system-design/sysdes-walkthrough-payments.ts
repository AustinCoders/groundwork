import type { Chapter } from "../types";

export const sysdesWalkthroughPayments: Chapter = {
  id: "sysdes-walkthrough-payments",
  num: "A14",
  title: "Walkthrough: a payment system",
  short: "Walkthrough: payments",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle:
    "Payments are the one design where the traffic is small and the hard part is never losing, inventing or doubling a cent, so the whole chapter is about proving what happened.",
  body: `<h3>What you are building, and what you are not</h3>
<p>
  "Design a payment system" (it is the subject of a chapter in Alex Xu's second volume)
  is a question about <b>correctness under failure</b>, not about scale. You are almost
  never moving money yourself. A <b>payment service provider</b> (PSP; Stripe and Adyen are
  examples) holds the relationship with the card networks and banks. Your system is
  the part that decides when to ask the PSP to charge, remembers what happened, tells
  the order system, and keeps books that agree with the PSP's and the bank's. The
  scope here is a customer paying a merchant online (the "pay-in" flow); paying
  sellers out is the same ledger run in the other direction.
</p>
<ul>
  <li><b>Never charge twice, never lose a charge.</b> Retries, timeouts and duplicate webhooks must not change the outcome.</li>
  <li><b>Every cent is explainable.</b> For any balance, a list of entries that adds up to it, written once and never edited.</li>
  <li><b>Availability is second.</b> It is better to say "pending" than to guess. A slow answer is acceptable; a wrong one is not.</li>
  <li><b>Smallest possible security scope.</b> Card numbers should never touch your servers.</li>
</ul>
<p>
  The happy path, using the vocabulary of Stripe's PaymentIntent (other PSPs differ in
  names and in detail): you create a payment for an amount and currency; the customer's card
  details go straight from their browser to the PSP, which returns a reference (a
  token); you confirm the payment; the card issuer <b>authorizes</b> it, which places a hold
  on the funds, possibly after the customer proves identity with 3-D Secure; you
  <b>capture</b> the funds, immediately or later; and the money <b>settles</b> to your bank
  days afterwards. Separating authorization from capture is real: Stripe documents that an
  authorization for an online card payment is typically valid for 7 days, shorter in
  some cases (for Visa merchant-initiated transactions the table says 5 days, with the
  exact window 4 days and 18 hours), and that an expired authorization is released.
</p>

<h3>Capacity estimation</h3>
<p>
  Assumptions are round numbers; the conclusion is the point.
</p>
<ul>
  <li><b>Traffic:</b> 1 million payments a day ÷ 86,400 = <b>11.6 a second</b>; a 10× flash-sale peak is <b>116 a second</b>.</li>
  <li><b>In-flight PSP calls:</b> by Little's law, 116 × an assumed 2 s per call = <b>232 concurrent calls</b> at peak.</li>
  <li><b>Ledger lines:</b> each successful payment writes 3 lines at capture, 2 for the PSP fee and 2 when the payout lands (the example is below; real payouts are batched, so this attributes a share of one payout to each payment), so 7 lines. 1,000,000 × 7 = 7 million lines a day × 100 B = <b>700 MB a day</b>, <b>255 GB a year</b>. Peak capture lines alone: 116 × 3 = <b>348 line inserts a second</b>, in 116 commits a second. Each payment also touches the idempotency row, the payment row, the state log, the outbox and the processed-events table, perhaps 15 to 20 write statements in all, grouped into a few local transactions per payment. At the peak that is a few thousand statements a second but only a few hundred commits a second, which fits within the course's 5,000-committed-writes-a-second planning figure for one relational primary.</li>
  <li><b>Webhooks:</b> 4 events a payment (assumed) × 1,000,000 = 4 million a day, <b>46 a second</b> on average, 463 at the peak.</li>
  <li><b>Idempotency records:</b> 1 million keys × an assumed 1 KB with the stored response = <b>1 GB a day</b>; kept for 7 days, 7 GB.</li>
  <li><b>State-change log:</b> 1,000,000 payments × 6 transitions × 150 B = <b>900 MB a day</b>.</li>
</ul>
<p>
  One limit sits outside your database: the PSP's. Stripe's documented live-mode defaults are 100 API
  requests a second overall, 25 a second for an individual endpoint (<code>POST /v1/payment_intents</code> is its own
  endpoint) and 50 requests in progress at once, and Stripe tells you to contact support before a flash sale and to
  give at least 6 weeks' notice for a large increase. A 116-a-second peak, 232 concurrent calls, and a
  webhook handler that fetches the object on every event (up to 463 reads a second at the peak) all exceed those defaults, so
  you request higher limits ahead of time and throttle with a client-side token bucket.
</p>
<p>
  Read the result: <b>one well-run relational database holds all of it.</b> Nothing here
  needs sharding. The difficulty is entirely in the failure modes, which is why the rest of the chapter has
  almost no throughput maths.
</p>

<h3>The architecture</h3>
<figure>
  <svg viewBox="0 0 640 320" class="dg" role="img" aria-label="A browser or app sends card details straight to the PSP, bypassing the merchant's servers. The order service calls the payment service, which calls the PSP with an idempotency key. The PSP sends webhooks to a receiver that verifies and de-duplicates, updating the payment service. The payment service writes state changes and outbox rows in one transaction, and the ledger service posts double-entry entries from them. A reconciliation job compares the ledger with PSP reports and bank statements.">
    <g class="rough">
      <path class="lnr dash" d="M66,40 L66,18 L475,18 L475,40" />
      <path class="lng" d="M116,65 L150,65" />
      <path class="lng" d="M250,65 L284,65" />
      <path class="lng" d="M394,65 L430,65" />
      <path class="ln"  d="M475,90 L475,150" />
      <path class="ln"  d="M430,175 L370,175 L370,90" />
      <path class="ln"  d="M300,90 L300,240" />
      <path class="ln"  d="M430,265 L394,265" />
      <path class="ln dash" d="M550,265 L540,265" />
      <rect class="box"  x="16"  y="40"  width="100" height="50" rx="6" />
      <rect class="box"  x="150" y="40"  width="100" height="50" rx="6" />
      <rect class="boxy" x="284" y="40"  width="110" height="50" rx="6" />
      <rect class="boxr" x="430" y="40"  width="90"  height="50" rx="6" />
      <rect class="boxy" x="430" y="150" width="110" height="50" rx="6" />
      <rect class="boxg" x="284" y="240" width="110" height="50" rx="6" />
      <rect class="boxy" x="430" y="240" width="110" height="50" rx="6" />
      <rect class="box"  x="550" y="240" width="76"  height="50" rx="6" />
    </g>
    <text class="sm" x="66"  y="62" text-anchor="middle">browser / app</text>
    <text class="sm" x="66"  y="78" text-anchor="middle">PSP card fields</text>
    <text class="sm" x="200" y="66" text-anchor="middle">order service</text>
    <text class="sm" x="339" y="58" text-anchor="middle">payment service</text>
    <text class="sm" x="339" y="74" text-anchor="middle">keys, state</text>
    <text class="sm" x="475" y="68" text-anchor="middle">PSP</text>
    <text class="sm" x="485" y="170" text-anchor="middle">webhook receiver</text>
    <text class="sm" x="485" y="186" text-anchor="middle">verify, dedupe</text>
    <text class="sm" x="339" y="260" text-anchor="middle">ledger service</text>
    <text class="sm" x="339" y="276" text-anchor="middle">double entry</text>
    <text class="sm" x="485" y="260" text-anchor="middle">reconciliation</text>
    <text class="sm" x="485" y="276" text-anchor="middle">ledger vs PSP</text>
    <text class="sm" x="588" y="268" text-anchor="middle">bank</text>
    <text class="sm rd" x="150" y="14">card data goes here, not through our servers</text>
    <text class="sm" x="16" y="204">payment service writes state and</text>
    <text class="sm" x="16" y="220">an outbox row in one transaction;</text>
    <text class="sm" x="16" y="236">the ledger reads the outbox</text>
  </svg>
  <figcaption>The payment service owns the state machine and the idempotency records; the ledger is a separate, append-only store fed through an outbox; reconciliation is a third party checking both. Card data takes the dashed path and never enters your network.</figcaption>
</figure>

<h3>Idempotency keys, end to end</h3>
<p>
  One customer click must produce one charge however many times any step repeats. That is
  not one idempotency key but a <b>chain</b>, one link per boundary where a retry can
  happen. The <a href="/system-design/sysdes-message-queues-async">queues chapter</a> argues that
  exactly-once delivery is impossible and exactly-once <em>effect</em> is built from
  at-least-once delivery plus idempotent processing; this is that argument applied to money.
</p>
<table>
  <tr><th>Boundary</th><th>Who retries</th><th>The key</th><th>What enforces it</th></tr>
  <tr><td>Browser to your API</td><td>Client, on a timeout or a double click</td><td>A key generated once per checkout attempt and kept in the page</td><td>Your idempotency table: unique on (account, key)</td></tr>
  <tr><td>Your service to the PSP</td><td>Your service, after a timeout or crash</td><td>A key stable across retries: derived from your own record (for example, payment id plus attempt number) or generated once and persisted, never regenerated per attempt</td><td>The PSP: Stripe (API v1) saves the status and body of the first request with a key and replays it, even a 500</td></tr>
  <tr><td>PSP to your webhook</td><td>PSP, with bounded retries (Stripe: up to three days in live mode)</td><td>The event id</td><td>A processed-events table: unique on event id (Stripe says two separate events can occur for one change, so also keep the handler idempotent on object id and event type)</td></tr>
  <tr><td>State change to ledger</td><td>The outbox relay, at least once</td><td>Payment id, the kind of posting and the provider's id for it (capture, fee, refund id, payout id), so two partial refunds do not collide</td><td>A unique constraint on the ledger transaction's key</td></tr>
</table>
<p>
  The PSP end has rules worth knowing. For API v1, Stripe compares the incoming parameters with the original request
  and errors if they differ. It can remove keys after at least 24 hours, so a key used
  later may start a new operation (API v2 differs, with a 30-day window). It does not save a result if the request failed
  validation or conflicted with one still executing, so those can be retried. And it recommends
  deriving the key from an object that identifies the operation, such as a shopping cart,
  or using a random V4 UUID.
</p>
<p>
  Your own idempotency table has to survive a crash <em>between</em> two side effects,
  which a single "seen this key" flag cannot do. Brandur Leach's well-known design for Postgres
  records, per key, the request fingerprint, a <code>locked_at</code> time and a
  <b>recovery point</b>. Work is split into atomic phases, each a local database
  transaction that also advances the recovery point, and each foreign call (the charge) is
  its own phase. A retry reads the recovery point and resumes there instead of redoing
  finished phases. A second request that arrives while the key is locked gets a 409. The
  call to the PSP carries a key derived from the local key, so a crash during the call is
  safe to retry.
</p>

<h4>Dry run: a retry after a crash in the middle of a charge</h4>
<table>
  <tr><th>Step</th><th>Event</th><th>Idempotency row (key K)</th><th>Payment P</th><th>PSP</th><th>Ledger</th></tr>
  <tr><td>1</td><td>Client posts checkout with key K. Service inserts the row and locks it</td><td>locked, recovery point: started</td><td>none</td><td>none</td><td>none</td></tr>
  <tr><td>2</td><td>Phase 1 commits: payment P created and moved to AUTHORIZING (so a reaper can find it), key K moves to "psp_call"</td><td>locked, psp_call</td><td>AUTHORIZING</td><td>none</td><td>none</td></tr>
  <tr><td>3</td><td>Service calls the PSP with key "pay_P_1": the PSP charges the card. The service crashes before reading the reply</td><td>locked (will expire), psp_call</td><td>AUTHORIZING</td><td>succeeded, response saved under pay_P_1</td><td>none</td></tr>
  <tr><td>4</td><td>The client times out and retries with K. The lock has expired, so the service resumes at psp_call</td><td>locked again, psp_call</td><td>AUTHORIZING</td><td>none new</td><td>none</td></tr>
  <tr><td>5</td><td>It calls the PSP again with "pay_P_1" (same parameters). The PSP replays the saved response: no second charge</td><td>psp_call</td><td>AUTHORIZING</td><td>replayed (Idempotent-Replayed: true)</td><td>none</td></tr>
  <tr><td>6</td><td>Phase 2, one transaction: P becomes CAPTURED (this walk-through uses single-step capture, so authorized is passed through), an outbox row is written, response stored, key marked finished</td><td>finished, response saved</td><td>CAPTURED</td><td>succeeded</td><td>pending via outbox</td></tr>
  <tr><td>7</td><td>The relay posts the ledger transaction keyed "P:capture". A duplicate publish would hit the unique key and do nothing</td><td>finished</td><td>CAPTURED</td><td>succeeded</td><td>posted once</td></tr>
  <tr><td>8</td><td>A third retry from the client with K returns the stored response</td><td>finished</td><td>CAPTURED</td><td>no call</td><td>unchanged</td></tr>
</table>
<p class="sub">
  The customer was charged once and every layer agrees. The crash at step 3 is the case a
  naive handler gets wrong: it would retry with a fresh key and charge twice.
</p>

<h3>The payment state machine</h3>
<figure>
  <svg viewBox="0 0 640 250" class="dg" role="img" aria-label="Payment states: created, authorizing, authorized, captured, settled along the top. Authorizing can go to failed, or to unknown after a timeout, and unknown resolves back through a check. Authorized can be canceled. Settled payments can be refunded.">
    <g class="rough">
      <path class="lng" d="M96,70 L116,70" />
      <path class="lng" d="M216,70 L236,70" />
      <path class="lng" d="M326,70 L346,70" />
      <path class="lng" d="M436,70 L456,70" />
      <path class="lnr" d="M130,90 L56,150" />
      <path class="lnr" d="M180,90 L180,150" />
      <path class="ln dash" d="M150,150 L150,90" />
      <path class="lnr" d="M281,90 L281,150" />
      <path class="lnr" d="M496,90 L496,150" />
      <rect class="box"  x="16"  y="50" width="80"  height="40" rx="6" />
      <rect class="boxy" x="116" y="50" width="100" height="40" rx="6" />
      <rect class="boxg" x="236" y="50" width="90"  height="40" rx="6" />
      <rect class="boxg" x="346" y="50" width="90"  height="40" rx="6" />
      <rect class="boxg" x="456" y="50" width="80"  height="40" rx="6" />
      <rect class="boxr" x="16"  y="150" width="80"  height="40" rx="6" />
      <rect class="boxy" x="116" y="150" width="100" height="40" rx="6" />
      <rect class="boxr" x="236" y="150" width="90"  height="40" rx="6" />
      <rect class="boxr" x="456" y="150" width="80"  height="40" rx="6" />
    </g>
    <text class="sm" x="56"  y="74" text-anchor="middle">created</text>
    <text class="sm" x="166" y="68" text-anchor="middle">authorizing</text>
    <text class="sm" x="166" y="82" text-anchor="middle">(3-D Secure?)</text>
    <text class="sm" x="281" y="74" text-anchor="middle">authorized</text>
    <text class="sm" x="391" y="74" text-anchor="middle">captured</text>
    <text class="sm" x="496" y="74" text-anchor="middle">settled</text>
    <text class="sm" x="56"  y="174" text-anchor="middle">failed</text>
    <text class="sm" x="166" y="174" text-anchor="middle">unknown</text>
    <text class="sm" x="281" y="174" text-anchor="middle">canceled</text>
    <text class="sm" x="496" y="174" text-anchor="middle">refunded</text>
    <text class="sm" x="16" y="216">unknown is a real state: a timeout means the PSP may have charged.</text>
    <text class="sm" x="16" y="234">A check (retry a timeout with the same key, or retrieve by our id) moves it forward.</text>
  </svg>
  <figcaption>States do not move backwards past a settled outcome. (A declined attempt leaves the payment retryable with another payment method, as Stripe's PaymentIntent returns to requires payment method.) The state that interviews skip is <em>unknown</em>: the PSP call timed out and the outcome is not yet known. Stripe's own PaymentIntent states are named differently (requires payment method, requires confirmation, requires action, processing, requires capture, succeeded, canceled) but cover the same ground.</figcaption>
</figure>
<ul>
  <li><b>Transitions are compare-and-set.</b> <code>UPDATE payments SET state = 'captured' WHERE id = ? AND state = 'authorized'</code>; zero rows updated means someone else moved it, so re-read. Every transition also inserts an immutable row into a log (who, from, to, reason, provider id).</li>
  <li><b>Events can arrive out of order.</b> Stripe does not guarantee that webhook events arrive in the order they were generated, and says to track event ids rather than timestamps to detect duplicates. So a webhook is a <em>hint to look</em>: on receipt, fetch the object from the PSP and move your state machine to match, ignoring any move backwards.</li>
  <li><b>Webhooks are the safety net, not the main path.</b> Stripe retries live-mode events with exponential backoff for up to three days; recommends verifying the <code>Stripe-Signature</code> header, returning 2xx before doing slow work, and processing through a queue. Treat a missing webhook as normal and reconcile (below).</li>
  <li><b>Amounts are integers in the minor unit.</b> 1099 for 10.99 USD, and 500 for 500 JPY because yen has no minor unit; a few currencies have special cases (Stripe notes Icelandic króna and Ugandan shilling must be sent as two-decimal values ending in 00). Never use floating point for money, and store the currency beside every amount.</li>
</ul>

<h3>Timeouts and unknown outcomes</h3>
<p>
  The PSP call is the one step where you cannot tell success from failure. The principle
  (a timeout or 5xx is indeterminate, keep the key stable, reconcile when you cannot resolve it) holds for any PSP
  that supports idempotency keys; the specifics below are Stripe's API v1 behaviour, so check each
  provider's retention window and replay rules:
</p>
<ul>
  <li><b>A timeout or a 5xx is indeterminate.</b> The operation might have produced side effects. Treat a 500 as unknown, not as failed.</li>
  <li><b>After a timeout, retry with the same key and the same parameters</b> while the key is retained (Stripe: at least 24 hours; limit retries of an unresolved operation to that window). If the first request never arrived, the retry runs it once; if it did run, the retry gets the saved result. Do not generate a new key until the first outcome is settled, because a new key can start a second charge.</li>
  <li><b>A 500 is different: the retry only repeats it.</b> Stripe saves the 500 response and replays it for the same key, so looping on the key returns the same error and tells you nothing new. Do not retry with a new key either. Reconcile instead: retrieve the object, inspect the request in the dashboard and wait for webhook events, because Stripe's own incident recovery may complete the operation later without changing the cached response.</li>
  <li><b>When the window ends, stop and reconcile.</b> Retrieve the object, check the PSP's dashboard and webhooks, and only then decide. Put your own identifier in the PSP object's metadata when you create it, so a charge that appears through a webhook can be matched to your records, including after the PSP's own incident recovery.</li>
  <li><b>While a payment is unknown, do nothing irreversible.</b> Do not fulfil the order, do not release the reserved stock, do not email "payment failed". Show "processing". A reaper job asks the PSP about every payment stuck in authorizing or unknown for more than a couple of minutes.</li>
  <li><b>Distinguish a declined card from an error.</b> A decline is a definitive answer (402 in Stripe's table: valid parameters, request failed): the attempt is over and the payment is left retryable with another payment method (Stripe's PaymentIntent returns to requires payment method), whereas <em>failed</em> in the figure is a payment you have given up on. An error is not an answer.</li>
</ul>

<h3>The ledger: double entry, immutable</h3>
<p>
  A <b>double-entry ledger</b> records every movement of money as a transaction with at least
  two lines, in different accounts, whose signed amounts sum to zero. Money is never created or
  destroyed, only moved, so an unbalanced posting shows up as a non-zero sum and a missing movement shows up as an
  account that should be empty and is not. Balanced but wrong postings (the wrong amount or account) pass the
  sum check; reconciliation catches those. Stripe describes its own ledger as an
  immutable, auditable log built on double-entry bookkeeping, where transactions already published cannot be deleted
  or modified, state is rebuilt by reprocessing events, and problems are fixed by reverting and
  reprocessing. The same ideas work at any size; the form used here, a correction posted as a new reversing or adjusting entry, is standard
  bookkeeping practice and this chapter's own design.
</p>
<p>
  Schema, minimal: <code>ledger_transactions(id, idempotency_key UNIQUE, created_at, description)</code>
  and <code>ledger_entries(transaction_id, account_id, amount_minor BIGINT, currency)</code>,
  with a rule, checked in code and by a deferred constraint trigger (Postgres has no declarative cross-row check), that entries sharing a
  transaction sum to zero per currency. A balance is the sum of an account's entries (cache it
  for speed, but the entries are the truth). Posting is idempotent because the transaction
  key is unique: the outbox relay may repeat itself harmlessly. If a rule such as "a seller's
  payable cannot go negative" must hold, lock the account row (<code>SELECT ... FOR UPDATE</code>), run the
  posting at SERIALIZABLE, or use a conditional update on a maintained balance row. A bare check inside the
  same transaction is not enough: two concurrent postings can each pass it and overdraw the account, the
  write-skew pattern from the <a href="/system-design/sysdes-transactions-isolation">transactions chapter</a>.
</p>

<h4>Dry run: one 100.00 USD payment through its life</h4>
<p>
  A marketplace takes a 10% platform fee. The PSP fee is illustrative: 2.9% plus 30 cents.
  Amounts in cents; positive is debit, negative is credit.
</p>
<table>
  <tr><th>Event</th><th>Account</th><th>Amount (cents)</th><th>Transaction sum</th></tr>
  <tr><td rowspan="3"><b>Capture</b> (key P:capture)</td><td>psp_clearing (asset: PSP owes us)</td><td>+10,000</td><td rowspan="3">10,000 − 9,000 − 1,000 = <b>0</b></td></tr>
  <tr><td>seller_payable (liability)</td><td>−9,000</td></tr>
  <tr><td>platform_revenue</td><td>−1,000</td></tr>
  <tr><td rowspan="2"><b>PSP fee</b> (key P:fee)</td><td>psp_fees (expense)</td><td>+320</td><td rowspan="2">320 − 320 = <b>0</b></td></tr>
  <tr><td>psp_clearing</td><td>−320</td></tr>
  <tr><td rowspan="2"><b>Payout lands</b> (key payout-7:P)</td><td>bank (asset)</td><td>+9,680</td><td rowspan="2">9,680 − 9,680 = <b>0</b></td></tr>
  <tr><td>psp_clearing</td><td>−9,680</td></tr>
</table>
<p class="sub">
  The fee is 2.9% of 10,000 = 290, plus 30, = 320. After all three transactions the
  clearing account is 10,000 − 320 − 9,680 = <b>0</b>, which is the check: a non-zero
  clearing balance means money the PSP has not yet paid, or paid without a record. (Stripe's ledger post uses clearing
  accounts the same way, flagging non-zero balances.) A full refund later posts +9,000 to
  seller_payable, +1,000 to platform_revenue and −10,000 to psp_clearing, again summing to
  zero; whether the PSP returns its fee depends on the provider's terms.
</p>

<h3>Exactly-once effect: outbox, saga and the order flow</h3>
<p>
  The payment state change and its follow-on effects (a ledger posting, an order update, an email) live
  in different systems, so they cannot share a transaction. The
  <b>outbox</b> from the queues chapter is the fix: the service writes the new payment state and
  an outbox row in <em>one</em> local transaction, and a relay publishes the row at least
  once. Every consumer is idempotent by key, as in the table above, which is how an
  at-least-once pipeline produces an exactly-once effect.
</p>
<p>
  An order is a multi-step process spanning services that each commit separately, which is a <b>saga</b>
  (see the transactions chapter): a sequence of local transactions with a compensation for each step.
</p>
<table>
  <tr><th>Step</th><th>Local transaction</th><th>Compensation if a later step fails</th></tr>
  <tr><td>1</td><td>Reserve inventory</td><td>Release the reservation</td></tr>
  <tr><td>2</td><td>Authorize the payment (a hold)</td><td>Cancel the authorization, which releases the hold</td></tr>
  <tr><td>3</td><td>Create the shipment</td><td>Cancel the shipment</td></tr>
  <tr><td>4</td><td>Capture the payment (on shipment)</td><td>Refund (money moved, so this is a new transaction, not an undo)</td></tr>
</table>
<p class="sub">
  Authorizing first and capturing at the end makes the common failure cheap: if the
  warehouse cannot ship, you cancel a hold, and the customer's money never moved. Capturing is the
  step that is hard to reverse, so it goes last, inside the authorization window (typically 7 days for online cards).
</p>

<h3>Reconciliation: assume something is wrong and look</h3>
<p>
  Reconciliation is a scheduled comparison of three records of the same money: your ledger,
  the PSP's reports of what it processed and settled, and the bank statement of what arrived.
  It exists because every other mechanism (retries, webhooks, state machines) can still
  leave a gap, and money gaps must be found by a process rather than by a customer.
  Stripe's description of its own data-quality work is the model: it
  checks that fund flows <em>clear</em> (non-zero clearing balances flag problems), that
  events arrive on time against a threshold, and that every identifier in one system has a
  matching event in the other; and it fixes problems by reversing and reprocessing, not by editing history.
</p>

<h4>Dry run: one day of seven payments</h4>
<table>
  <tr><th>Payment</th><th>Our ledger (captured)</th><th>PSP report</th><th>Diagnosis</th><th>Fix (always a new entry)</th></tr>
  <tr><td>P1</td><td>10,000</td><td>10,000</td><td>Match</td><td>None</td></tr>
  <tr><td>P2</td><td>2,500</td><td>2,500</td><td>Match</td><td>None</td></tr>
  <tr><td>P3</td><td>7,000</td><td>no record</td><td>We booked a capture the PSP never made: a bug or a manual edit</td><td>Reverse the entries, hold fulfilment, page someone</td></tr>
  <tr><td>P4</td><td>unknown (a timeout)</td><td>4,200 succeeded</td><td>Webhook missed, reaper late</td><td>Post the capture, fulfil, check no duplicate attempt was charged</td></tr>
  <tr><td>P5</td><td>3,000</td><td>3,000, refunded 3,000</td><td>Refund done in the PSP dashboard, not in our ledger</td><td>Post the refund entries</td></tr>
  <tr><td>P6</td><td>9,900</td><td>9,090</td><td>Amount mismatch of 810 (digits swapped upstream)</td><td>Adjust to the PSP's amount, file a bug</td></tr>
  <tr><td>P7</td><td>no record</td><td>1,500 succeeded</td><td>Orphan charge: we never recorded it</td><td>Match by metadata, record it, or refund</td></tr>
</table>
<p class="sub">
  Check the totals. Our captured ledger for P1, P2, P3, P5 and P6 is 10,000 + 2,500 +
  7,000 + 3,000 + 9,900 = 32,400 (P4 and P7 are absent); the PSP's succeeded charges
  for P1, P2, P4, P5, P6 and P7 are 10,000 + 2,500 + 4,200 + 3,000 + 9,090 + 1,500 =
  30,290, and its net of the 3,000 refund is 27,290. The gross gap, ours minus the
  PSP's, is 32,400 − 30,290 = 2,110, which decomposes exactly: +7,000 (P3) − 4,200
  (P4) + 810 (P6) − 1,500 (P7) = 2,110. The net gap is 2,110 + 3,000 (the P5 refund) = 5,110.
  If a gap does not decompose into named payments, the reconciliation itself is wrong.
</p>

<h3>PCI scope and tokenization, at interview depth</h3>
<p>
  PCI DSS is the standard for anyone who stores, processes or transmits cardholder data. Three
  facts carry the design:
</p>
<ul>
  <li><b>Never store sensitive authentication data after authorization.</b> The PCI Council's fact sheet is explicit that data on the full magnetic stripe or chip, and the printed 3 or 4 digit card validation code, must not be stored after authorization. The primary account number may be stored only if protected, and the sheet lists strong cryptography among its methods; the name, expiry and service code need protection when stored with the number. The sheet's first advice is not to store cardholder data unless necessary, and its list of data never to store after authorization also includes the PIN.</li>
  <li><b>Scope is what you touch.</b> Stripe's integration guide says a business handling raw card numbers on its own payment page might need to meet more than 300 security controls, and that its lower-risk integrations collect card details and send them straight to Stripe without passing through the merchant's servers, reducing the obligations. That is the design here: PSP-hosted fields or a hosted checkout page.</li>
  <li><b>Tokenization replaces the number with a reference.</b> The browser sends the card to the PSP; the PSP returns a token or payment-method id; your system stores that id plus non-sensitive details. Stripe says the card type, last four digits and expiry it returns are not subject to PCI compliance and can be stored. A stolen token table is not a stolen card table, because a token is typically usable only with your PSP credentials (check your provider's rules).</li>
</ul>
<p>
  Operational consequences: scrub card-like numbers from logs and error reports, never put them in a URL or an analytics event, serve every payment page over TLS 1.2 or above, verify webhook signatures and restrict
  webhook sources. Do not claim that using a PSP makes you "PCI compliant" in general; it shrinks your scope, and you still have obligations. You should say so out loud.
</p>

<div class="say">
  <span class="ttl">Say it like this →</span> "I'd never touch card numbers: the
  browser sends them to the PSP's hosted fields and I store a token, which keeps my
  PCI scope small. The traffic is tiny, about 12 payments a second, 116 at a flash-sale
  peak, so one relational database holds everything and the design is about
  correctness. I'd use a chain of idempotency keys: one per checkout attempt from
  the client, a derived key on the PSP call so a retry after a crash replays rather
  than recharges, event ids on webhooks and a unique key on every ledger posting.
  Payment state is a forward-only machine with an explicit unknown state for
  timeouts, moved by compare-and-set, and the PSP is the source of truth, so
  webhooks only trigger a fetch. Money lives in an append-only double-entry ledger
  in integer minor units, written through an outbox. The order is a saga that
  authorizes first and captures on shipment, so most failures just release a hold.
  A daily reconciliation against the PSP and the bank catches whatever slips through,
  and every correction is a new entry, never an edit."
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li><b>Signals:</b> "payments", "checkout", "wallet", "transfers", "billing", "refunds", "marketplace payouts", "ledger", "balance", or any design where a duplicate or a lost write costs money.</li>
  <li><b>The structure to reach for:</b> PSP integration with idempotency keys, a forward-only state machine, a double-entry ledger, an outbox, a saga and reconciliation.</li>
  <li><b>The numbers an interviewer wants:</b> a modest peak payment rate that proves scale is not the problem, then the failure arithmetic: retries, a gap that decomposes into named payments, and a clearing account that returns to zero.</li>
  <li><b>The pitfalls to name unprompted:</b> a fresh idempotency key on a retry, treating a timeout as a failure, storing money as floats, updating ledger rows in place, trusting webhook order, and capturing before the rest of the order is certain.</li>
  <li><b>The follow-up you will get:</b> "the PSP times out: what do you tell the customer?" "Processing", retry with the same key, check the PSP, reconcile, and never charge again until the first outcome is known.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Explain why a payment system's capacity estimate comes out small, and what the chapter says is hard instead.</li>
    <li>List the four idempotency boundaries and what enforces each, and say why the PSP key must be stable across retries and crashes.</li>
    <li>Trace the dry run through the crash at step 3 and say what would have happened with a fresh key.</li>
    <li>Draw the state machine, including unknown, and say how a timeout moves through it.</li>
    <li>Post a 100.00 USD capture, the fee and the payout as ledger entries and show that the clearing account returns to zero.</li>
    <li>Explain how a payment state change and its ledger posting stay consistent without a distributed transaction.</li>
    <li>Reconcile the seven-payment day and show that the gross gap of 2,110 decomposes exactly.</li>
    <li>Say what tokenization changes about PCI scope and what it does not.</li>
  </ul>
</div>
<div class="bx is-ref">
  <span class="ttl">Sources and further reading</span>
  <ul>
    <li><a href="https://docs.stripe.com/api/idempotent_requests" rel="noopener noreferrer">Stripe API: idempotent requests</a> — saved status and body, 24-hour key pruning, parameter comparison, what is and is not saved</li>
    <li><a href="https://docs.stripe.com/error-low-level" rel="noopener noreferrer">Stripe: advanced error handling</a> — network errors, indeterminate 5xx, retry with the same key, reconcile after the window, metadata</li>
    <li><a href="https://docs.stripe.com/payments/paymentintents/lifecycle" rel="noopener noreferrer">Stripe: how PaymentIntents work</a> — the statuses and what each means</li>
    <li><a href="https://docs.stripe.com/payments/place-a-hold-on-a-payment-method" rel="noopener noreferrer">Stripe: place a hold on a payment method</a> — authorization and capture, validity windows, cancel to release</li>
    <li><a href="https://docs.stripe.com/webhooks" rel="noopener noreferrer">Stripe: webhooks</a> — retries for up to three days, no ordering guarantee, duplicates, signatures, asynchronous processing</li>
    <li><a href="https://docs.stripe.com/rate-limits" rel="noopener noreferrer">Stripe: rate limits</a> — live-mode request and concurrency defaults, flash sales, 6 weeks' notice for large increases</li>
    <li><a href="https://docs.stripe.com/currencies" rel="noopener noreferrer">Stripe: currencies</a> — amounts in the minor unit, zero-decimal currencies, special cases</li>
    <li><a href="https://stripe.dev/blog/ledger-stripe-system-for-tracking-and-validating-money-movement" rel="noopener noreferrer">Stripe: Ledger, a system for tracking and validating money movement</a> — immutable double-entry log, clearing accounts, data-quality checks, correction by reprocessing</li>
    <li><a href="https://brandur.org/idempotency-keys" rel="noopener noreferrer">Brandur Leach: implementing Stripe-like idempotency keys in Postgres</a> — atomic phases, recovery points, locking, the derived key on the foreign call</li>
    <li><a href="https://docs.stripe.com/security/guide" rel="noopener noreferrer">Stripe: integration security guide</a> — PCI scope, low-risk integrations, what card data can be stored, webhook signatures</li>
    <li><a href="https://listings.pcisecuritystandards.org/pdfs/pci_fs_data_storage.pdf" rel="noopener noreferrer">PCI Security Standards Council: data storage do's and don'ts</a> — what may be stored, and the ban on storing sensitive authentication data after authorization (a 2008 fact sheet)</li>
  </ul>
  <p class="sub">Claims in this chapter were checked against these sources in October 2026. PSP behaviour is described in Stripe's vocabulary because it is the best documented; other providers differ in detail. Figures marked "assumed" or "illustrative" (1 million payments a day, 2 s per PSP call, 4 webhooks a payment, 100 B a ledger line, the 10× peak, 1 KB an idempotency record kept 7 days, 6 state transitions of 150 B, the 2.9% plus 30 cents fee, a 10% platform fee) are this chapter's own inputs. The PCI fact sheet is old and the standard has been revised since (v4.0.1 is the current listing); it is used only for the stable rule about sensitive authentication data.</p>
</div>`,
};
