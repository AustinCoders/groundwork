import type { DesignPool } from "../../quiz-types";

export const pool: DesignPool = {
  questions: [
    {
      id: "pay-timeout-next-step",
      chapter: "sysdes-walkthrough-payments",
      level: "advanced",
      skill: "tradeoff",
      section: "timeouts-and-unknown-outcomes",
      kind: "single",
      prompt:
        "<p>Your payment service creates a charge at the PSP, sending an idempotency key derived from its own payment id and saved before the call. The call times out after 10 seconds with no response. The PSP behaves like Stripe's API v1: it keeps keys for at least 24 hours and replays the saved result when the same key arrives with the same parameters. What should the service do next?</p>",
      choices: [
        {
          id: "a",
          text: "Mark the payment failed and let the customer pay again under a new key.",
          why: "A timeout does not say the charge failed, only that no reply arrived. If the PSP did charge the card, the second attempt under a new key is a second operation and the customer pays twice.",
        },
        {
          id: "b",
          text: 'Mark the payment unknown, show "processing", and retry with the same key and parameters.',
          why: "A timeout is indeterminate. Retrying with the same key and parameters inside the retention window replays the saved result, is refused while the first call still runs, or starts the operation once, so it cannot double charge.",
        },
        {
          id: "c",
          text: "Retry at once under a new key, since the old key may now be unusable.",
          why: "A timeout does not poison a key. The PSP may have saved a result for it, may still be running the first call, or may never have started the operation, and a new key would start a separate charge in the first two cases.",
        },
        {
          id: "d",
          text: "Mark the payment captured, since most timed-out calls did succeed at the PSP.",
          why: "Whether most calls succeed is irrelevant to this one. Booking a capture you have not confirmed is the P3 case from the reconciliation table: money recorded that the PSP may never have moved.",
        },
      ],
      answer: "b",
    },
    {
      id: "pay-two-charges-cause",
      chapter: "sysdes-walkthrough-payments",
      level: "advanced",
      skill: "diagnose",
      section: "idempotency-keys-end-to-end",
      kind: "single",
      prompt:
        "<p>After a PSP incident, several customers see two identical charges on their card statements, minutes apart, for one order. The PSP's dashboard confirms two separate succeeded charges for each. The payment service's retry loop is <code>for attempt in 1..3: key = uuid4(); response = psp.charge(amount, key)</code>, and it retries on any timeout. What most likely produced the second charge?</p>",
      choices: [
        {
          id: "a",
          text: "The webhook receiver handled one event id twice.",
          why: "A repeated webhook can make your own system act twice, for example fulfilling or posting twice, but it does not ask the PSP to charge a card again. The PSP already shows two charges.",
        },
        {
          id: "b",
          text: "The ledger posting key was not unique, so a capture was posted twice.",
          why: "A duplicate posting would corrupt your books, not create a charge at the PSP. Card statements and the PSP dashboard reflect the PSP's records, not your ledger.",
        },
        {
          id: "c",
          text: "The authorization expired, so the PSP charged the card again at capture.",
          why: "An expired authorization is released and the payment ends canceled; the PSP does not re-charge the card to replace it.",
        },
        {
          id: "d",
          text: "Each retry drew a fresh key, so the PSP saw each attempt as a new charge.",
          why: "A key regenerated per attempt defeats idempotency: the PSP only recognises a repeat when the key matches. It must be stable across retries, derived from your own record or persisted.",
        },
      ],
      answer: "d",
    },
    {
      id: "pay-peak-in-flight-calls",
      chapter: "sysdes-walkthrough-payments",
      level: "advanced",
      skill: "estimate",
      section: "capacity-estimation",
      kind: "single",
      prompt:
        "<p>A checkout service handles 4,320,000 payments a day, spread evenly on average over 86,400 seconds. Its peak rate is 6 times the average, and each PSP charge call takes 1.5 seconds. The PSP allows 50 requests in progress at once for the account. Using Little's law, how many charge calls are in flight at the peak, and how does that compare with the limit?</p>",
      choices: [
        {
          id: "a",
          text: "300 in flight, 6 times the limit",
          why: "300 is the peak rate in payments per second. Little's law multiplies the rate by the time each call spends in the system, so 300 leaves out the 1.5 seconds.",
        },
        {
          id: "b",
          text: "75 in flight, 1.5 times the limit",
          why: "75 is the average rate of 50 a second times 1.5 seconds. The limit has to hold at the peak, where the rate is 6 times higher.",
        },
        {
          id: "c",
          text: "450 in flight, 9 times the limit",
          why: "The average is 4,320,000 / 86,400 = 50 a second, the peak is 300, and 300 × 1.5 s = 450 calls in flight. Against a limit of 50 that is 9 times over.",
        },
        {
          id: "d",
          text: "200 in flight, 4 times the limit",
          why: "200 comes from dividing the peak rate by the latency. Little's law multiplies them, so slower calls mean more in flight, not fewer.",
        },
      ],
      answer: "c",
    },
    {
      id: "pay-reconcile-gross-gap",
      chapter: "sysdes-walkthrough-payments",
      level: "advanced",
      skill: "estimate",
      section: "reconciliation-assume-something-is-wrong-and-look",
      kind: "single",
      prompt:
        "<p>A day's reconciliation compares captured amounts in cents, and there were no refunds. Our ledger has A 5,000, B 12,000, C 3,500 and E 8,100. The PSP's report of succeeded charges has A 5,000, B 12,000, D 2,200 and E 8,010. What is the gross gap, our ledger total minus the PSP total?</p>",
      choices: [
        {
          id: "a",
          text: "1,390 cents",
          why: "Our total is 28,600 and the PSP's is 27,210, so the gap is 1,390. It decomposes into +3,500 (C, booked but not at the PSP), −2,200 (D, at the PSP but not booked) and +90 (E, amount mismatch).",
        },
        {
          id: "b",
          text: "3,590 cents",
          why: "This adds C and E but leaves out D. The PSP's total includes the 2,200 we never recorded, and that lowers the gap.",
        },
        {
          id: "c",
          text: "5,790 cents",
          why: "This adds the size of every discrepancy (3,500 + 2,200 + 90) as if they all pointed the same way. A gross gap nets them, because D works against C and E.",
        },
        {
          id: "d",
          text: "1,300 cents",
          why: "This nets C against D (3,500 − 2,200) and drops the 90-cent mismatch on E. A gap that does not decompose into every named payment means something is still unexplained.",
        },
      ],
      answer: "a",
    },
    {
      id: "pay-fix-wrong-account-capture",
      chapter: "sysdes-walkthrough-payments",
      level: "advanced",
      skill: "concept",
      section: "the-ledger-double-entry-immutable",
      kind: "single",
      prompt:
        "<p>Last week a 9,000 cent seller_payable credit from a capture was posted to seller S2 instead of S1. The ledger is the append-only double-entry design from the chapter, with transactions that sum to zero, and neither S1's nor S2's payout has run since. How should the books be corrected?</p>",
      choices: [
        {
          id: "a",
          text: "Change the account id on the existing entry, since the transaction still sums to zero.",
          why: "A zero sum only proves the transaction balances, not that it names the right account. Editing a published entry rewrites history for anyone who already read it, and the ledger is meant to be immutable.",
        },
        {
          id: "b",
          text: "Post a new transaction that moves 9,000 from S2's payable to S1's payable.",
          why: "Correction by a new reversing or adjusting entry keeps the mistake and its fix visible, balances to zero, and leaves every earlier read of the ledger explainable.",
        },
        {
          id: "c",
          text: "Delete the wrong transaction and post a clean one to S1 instead.",
          why: "Deleting a published transaction erases the evidence that the error happened and breaks any report, reconciliation or audit that referred to it. The design forbids deleting or modifying published entries.",
        },
        {
          id: "d",
          text: "Adjust the cached balance rows for S1 and S2, because payouts read the balances.",
          why: "A cached balance is derived from entries, which are the truth. Patching only the cache leaves balances that disagree with the entries, and the next rebuild undoes the fix.",
        },
      ],
      answer: "b",
    },
    {
      id: "pay-hold-or-capture",
      chapter: "sysdes-walkthrough-payments",
      level: "advanced",
      skill: "tradeoff",
      section: "exactly-once-effect-outbox-saga-and-the-order-flow",
      kind: "single",
      prompt:
        "<p>An online shop ships each order from its warehouse within 3 days. About 1 order in 20 cannot be fulfilled once picking starts. Customers pay by card, and for this question assume a card authorization stays valid for 7 days. The shop wants to move money only for orders that actually ship, without refunds, and wants the amount guaranteed before it picks an order. Which flow fits?</p>",
      choices: [
        {
          id: "a",
          text: "Capture at checkout and refund the orders that cannot ship.",
          why: "Every order that cannot ship then moves money out and back, and a refund is a new transaction rather than an undo. That is the cost the shop wants to avoid.",
        },
        {
          id: "b",
          text: "Save the card at checkout and charge it once the order ships.",
          why: "No funds are guaranteed in the meantime, so the later charge can be declined after the goods have left. An authorization at checkout is what guarantees the amount.",
        },
        {
          id: "c",
          text: "Authorize at checkout, capture on shipment, cancel the hold on failures.",
          why: "The hold guarantees funds, shipping happens well inside the 7 days, and canceling a hold moves no money. Capture, the step that is hard to reverse, goes last.",
        },
        {
          id: "d",
          text: "Capture at checkout but delay the ledger posting until the order ships.",
          why: "The PSP has moved the money while your books say nothing happened, so the ledger and PSP disagree for days. Reconciliation would flag every such order, and failures still need a refund.",
        },
      ],
      answer: "c",
    },
    {
      id: "pay-checkout-request-phases",
      chapter: "sysdes-walkthrough-payments",
      level: "advanced",
      skill: "sequence",
      section: "idempotency-keys-end-to-end",
      kind: "order",
      prompt:
        "<p>Order the work for one checkout request in the Postgres-style design the chapter describes. Constraints: a concurrent duplicate of the client's key must meet a lock rather than race; no database transaction stays open across the PSP call, and a crash during that call must leave a payment row a reaper can find; and the outbox row commits atomically with the state change it announces.</p>",
      items: [
        { id: "lock", text: "Insert the idempotency row for the client's key and lock it" },
        {
          id: "create",
          text: "In one transaction, create the payment as AUTHORIZING and move the recovery point to the PSP call",
        },
        { id: "psp", text: "Call the PSP with a key derived from the payment, outside any database transaction" },
        {
          id: "finish",
          text: "In one transaction, mark the payment captured, write the outbox row, store the response and finish the key",
        },
        { id: "ledger", text: "The outbox relay posts the ledger transaction, keyed so a repeat does nothing" },
      ],
      why: "The key row comes first, so a concurrent duplicate meets the lock. The payment row is committed before the PSP call, so a crash during the call leaves something a reaper and a retry can find. The state change and outbox row share one transaction, which is why the ledger can only be posted after it commits.",
    },
    {
      id: "pay-webhook-handler-rules",
      chapter: "sysdes-walkthrough-payments",
      level: "advanced",
      skill: "concept",
      section: "the-payment-state-machine",
      kind: "multi",
      prompt:
        "<p>Your payment service receives webhooks from Stripe. Select every practice that Stripe's webhook documentation recommends for the handler.</p>",
      choices: [
        {
          id: "a",
          text: "Sort events by their <code>created</code> timestamp to decide which happened first.",
          why: "Stripe records <code>created</code> in whole seconds, so distinct events can share a timestamp, and it says not to use it to order events or detect repeats.",
        },
        {
          id: "b",
          text: "Verify the <code>Stripe-Signature</code> header against the raw request body before acting.",
          why: "Without verification anyone who finds the URL can post fake events. Verification needs the raw body, so a framework that rewrites it breaks the check.",
        },
        {
          id: "c",
          text: "Log the event ids you have handled and skip any id you have seen.",
          why: "Stripe can deliver the same event more than once, and event ids are what it tells you to track to spot repeats.",
        },
        {
          id: "d",
          text: "Finish all processing before replying, so Stripe knows the work succeeded.",
          why: "Slow work before replying risks a timeout, which Stripe counts as a failed delivery and retries. It tells you to return a 2xx first.",
        },
        {
          id: "e",
          text: "Reply 2xx quickly and process the event from an asynchronous queue.",
          why: "Stripe recommends a quick 2xx and a queue, so a spike in deliveries is absorbed at a rate your system can handle.",
        },
      ],
      answers: ["b", "c", "e"],
    },
  ],
};
