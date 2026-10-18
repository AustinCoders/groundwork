import type { DesignDrill } from "../../drill-types";

export const drill: DesignDrill = {
  chapter: "sysdes-walkthrough-payments",
  level: "advanced",
  title: "Design a marketplace checkout payment system",
  prompt: `<p>
  You are interviewing for a backend role at an online marketplace where customers pay by card for goods
  that individual sellers ship. The interviewer says: "Design the payment system behind our checkout. A
  customer pays once for an order, and I care most about what happens when things go wrong. Walk me through
  how the system decides to charge, remembers what happened, tells the order system, and keeps our books
  straight."
</p>
<p>
  In scope: the pay-in flow from checkout to a recorded payment. Out of scope: fraud scoring, seller
  onboarding and identity checks, payout scheduling, currency conversion, PSP fees, and the card network and
  bank side. Use these planning figures (assumptions, not facts about any real service):
</p>
<ul>
  <li>3 million payments a day, spread evenly on average. A flash sale lasts 10 minutes at 10 times the average rate.</li>
  <li>Customers double-click Pay, and browsers and apps retry requests that time out, so the same checkout can reach your API more than once.</li>
  <li>An external payment service provider (PSP) processes the card payment for you. Each charge call takes about 2 seconds at peak, and the PSP allows 100 requests in progress at once for your account.</li>
  <li>A request may carry a client-supplied identifier. For at least 24 hours the PSP answers a repeat with the same identifier and parameters with the first response it saved, an error included, and refuses a repeat while the first is still running. Payments can also be looked up by a reference you attach when you create them.</li>
  <li>A card payment can be completed in one step or in two, and a reservation of funds lapses after 7 days. The PSP publishes a daily report of the payments it processed.</li>
  <li>The PSP reports changes by calling an endpoint you provide, which is reachable from the public internet. Each notification has a unique id; the same one may arrive more than once, and in no guaranteed order.</li>
  <li>The order system is a separate service. Each order contains items from one seller and ships once, within 3 days of purchase. About 1 order in 20 cannot be fulfilled once picking starts.</li>
  <li>The marketplace keeps a 10% platform fee on each sale and owes the rest to the seller.</li>
</ul>`,
  checklist: [
    {
      id: "check-peak-load-vs-psp-limit",
      text: "Derives the load on the PSP from the stated figures: about 350 payments a second at the peak, so about 700 calls in flight by Little's law against a limit of 100, which caps throughput near 50 a second. Either gets the limit raised before the sale, or limits admission and says what the other customers see (a pending page, a bounded wait or being turned away), noting that queueing the whole peak would leave the last customer waiting close to an hour.",
      section: "capacity-estimation",
    },
    {
      id: "check-checkout-request-idempotent",
      text: "Makes the checkout request safe to repeat at your own API: a key per checkout attempt, or one payment per order id, backed by a uniqueness constraint, so a double-click or client retry returns the same payment instead of starting another.",
      section: "idempotency-keys-end-to-end",
    },
    {
      id: "check-unknown-state-and-recovery",
      text: 'Keeps a durable record of each attempt from before the PSP call, and treats a timeout, a 5xx or a crash mid-call as an explicit unknown state rather than a failure. The customer sees "processing", nothing irreversible happens meanwhile, and something resolves stuck records by asking the PSP, using a notification or using the settlement report.',
      section: "timeouts-and-unknown-outcomes",
    },
    {
      id: "check-notification-handler-idempotent",
      text: "Makes the notification handler idempotent and tolerant of reordering: handling the same event twice changes nothing more, and a late or reordered event never moves a payment backwards, for instance by fetching the current object or comparing with the stored state.",
      section: "the-payment-state-machine",
    },
    {
      id: "check-notification-authenticity",
      text: "Verifies that each notification really came from the PSP (for example a signature check on the raw request body) before acting on it, because the endpoint is open to the internet.",
      section: "the-payment-state-machine",
    },
    {
      id: "check-marketplace-ledger-accounts",
      text: "Posts balanced double-entry entries that split a sale between money held by the PSP, the seller's share and platform revenue, with the lines summing to zero (a 100.00 sale: 10,000 against 9,000 and 1,000 cents), whether posted at capture or later at delivery.",
      section: "the-ledger-double-entry-immutable",
    },
    {
      id: "check-durable-handoff-for-external-effects",
      text: "Hands effects that live outside the payment database, such as the order update and an email, to a durable mechanism committed atomically with the state change (an outbox row, change data capture or a workflow engine), delivered at least once to consumers that deduplicate by key.",
      section: "exactly-once-effect-outbox-saga-and-the-order-flow",
    },
    {
      id: "check-authorize-then-capture",
      text: "Orders the flow so the step that is hard to reverse comes last: reserves the funds at checkout and captures when the order ships, so an order that cannot be fulfilled cancels a reservation and moves no money instead of being refunded.",
      section: "exactly-once-effect-outbox-saga-and-the-order-flow",
    },
    {
      id: "check-scheduled-reconciliation",
      text: "Adds a scheduled comparison of the ledger with the PSP's report and sorts the differences into at least three kinds (for example booked but missing at the PSP, at the PSP but not booked, amount mismatch, a refund made outside the system, a timing difference), saying how each is resolved.",
      section: "reconciliation-assume-something-is-wrong-and-look",
    },
  ],
  mistakes: [
    {
      id: "mistake-fresh-key-per-retry",
      text: "Generating a new key for every retry of the PSP call without first confirming the earlier attempt's outcome, for example a fresh random UUID inside the retry loop. The PSP recognises a repeat by its key, so each attempt looks like a new operation, and an attempt that did succeed before the timeout can be charged again.",
      section: "idempotency-keys-end-to-end",
    },
    {
      id: "mistake-slow-work-before-reply",
      text: "Doing slow or unbounded work (updating the order, posting to the ledger) before replying 2xx to a notification, when the sender retries on a timeout. A reply that takes too long counts as a failed delivery, so the PSP sends the event again while the first run may still be going.",
      section: "the-payment-state-machine",
    },
    {
      id: "mistake-ack-before-saved",
      text: "Replying 2xx before the event is stored or queued. The sender treats a 2xx as delivered and stops retrying, so a crash right after the reply loses the event; storing or queueing it first, then replying, avoids that.",
      section: "the-payment-state-machine",
    },
    {
      id: "mistake-float-money",
      text: "Storing money as floating-point numbers. Binary floats cannot represent most decimal fractions exactly, so sums drift from the PSP's and totals stop matching; integers in the currency's minor unit avoid it.",
      section: "the-payment-state-machine",
    },
    {
      id: "mistake-edit-ledger-in-place",
      text: "Fixing a wrong posting by editing or deleting the entry, or by keeping only a mutable balance. Anyone who already read the old figure can no longer explain it, the cause cannot be reproduced, and a rebuild from entries undoes the patch. Post a new reversing or adjusting entry instead.",
      section: "the-ledger-double-entry-immutable",
    },
  ],
};
