import type { DesignDrill } from "../../drill-types";

export const drill: DesignDrill = {
  chapter: "sysdes-walkthrough-notifications",
  level: "intermediate",
  title: "Design a notification system",
  prompt: `<p>Your company wants one service that sends notifications to its users by push (iOS and Android), SMS and email. Other internal services trigger most of them (an order shipped, a password reset), and a marketing team launches campaigns to millions of users at a time. Walk me through the design, and show me the numbers that drive it.</p>
<p>Scope: the sending side only, from an incoming event to the provider call and the delivery record. Out of scope: running a mail server or a carrier connection, the campaign authoring tool, and the app-side code that registers devices. Treat these as planning assumptions, not facts about any real service:</p>
<ul>
  <li>12 million transactional notifications a day on average, with a peak of 5 times the average rate. Producers time out and call again, so the same event can arrive more than once.</li>
  <li>One marketing push to 24 million device tokens, which marketing wants finished within one hour and plans to start at 09:00 sharp.</li>
  <li>For the push quota check, treat every device and all transactional traffic as push sends through FCM, whose default quota is 600,000 messages a minute for the project.</li>
  <li>A flash sale needs 200,000 SMS segments sent within 4 hours of launch. Today you have one US long code, which sends 1 segment a second; a short code sends about 100 a second; and the provider fails a message that has been queued for more than 10 hours.</li>
  <li>Passcodes are also sent by SMS, must still arrive within seconds during the sale, and are useless after 5 minutes.</li>
  <li>Marketing policy: at most 3 marketing pushes per user per day. Passcodes and security alerts are exempt from that cap.</li>
  <li>Users can opt out of marketing on any channel at any time. Passcodes and security alerts cannot be silenced.</li>
</ul>`,
  checklist: [
    {
      id: "check-push-rate-vs-quota",
      text: "Derives the peak push rate from the stated volumes, about 6,667 a second for the campaign plus about 694 a second for the transactional peak, and concludes that the roughly 7,360 a second is about 74% of the 10,000 a second quota: it fits, with thin headroom. Adds that the campaign alone at the full quota would take about 40 minutes.",
      section: "capacity-estimation",
    },
    {
      id: "check-sms-sizing",
      text: "Sizes the SMS sender from the volume and deadline: 200,000 segments take about 55.6 hours at 1 a second, far past the 10-hour queue limit, and finishing in 4 hours needs about 14 segments a second, so a short code or more senders are required.",
      section: "capacity-estimation",
    },
    {
      id: "check-passcode-protection",
      text: "Protects passcodes from bulk traffic with a high-priority lane and reserved capacity, and holds the bulk SMS sale to a rate at or below the sender's throughput with part of it reserved for passcodes, so the sale cannot starve them.",
      section: "rate-limiting-priority-and-expiry",
    },
    {
      id: "check-frequency-cap",
      text: "Enforces the marketing cap with a counter per user rather than per device token, over a stated window such as the user's local day or a rolling 24 hours, updated atomically in a shared store so concurrent campaigns cannot both pass.",
      section: "rate-limiting-priority-and-expiry",
    },
    {
      id: "check-campaign-ramp",
      text: "Ramps the campaign up from zero to its target rate over at least 60 seconds, per Google's FCM guidance, and avoids starting on the hour or quarter hour, when FCM's own traffic spikes.",
      section: "rate-limiting-priority-and-expiry",
    },
    {
      id: "check-consent-at-worker",
      text: "Re-checks preferences by category and channel in the worker just before the provider call, because a campaign that takes an hour to drain will see opt-outs while jobs wait. A check when jobs are created is still worth keeping because it saves queue space, but it is not enough on its own.",
      section: "preferences-and-opt-outs-checked-at-the-last-moment",
    },
    {
      id: "check-dedupe-event-id",
      text: "De-duplicates repeated events with an atomic check-and-set (a key-value store SET NX, or a unique-key insert), keyed by the event id (or a key derived from user, type and business id) with a time-to-live, so a repeated producer call creates no second job.",
      section: "reliability-retries-duplicates-and-unknown-outcomes",
    },
    {
      id: "check-error-actions",
      text: "Maps each failure to its own action: retry timeouts, 5xx and 429, remove a token the provider reports as unregistered, send an oversized payload to the dead-letter queue, suppress an address after a hard bounce or an SMS number after a STOP, and treat a bad request as a bug to fix rather than a retry, except a rejected-argument error that arrives with a known-valid payload, which marks a bad token.",
      section: "reliability-retries-duplicates-and-unknown-outcomes",
    },
    {
      id: "check-retry-budget",
      text: "Retries transient failures with exponential backoff and jitter, waiting for the provider's retry-after on a 429, and bounds them with a maximum age or dead-letter queue and an expiry on each job, so a passcode past its useful life is dropped rather than delivered late.",
      section: "reliability-retries-duplicates-and-unknown-outcomes",
    },
  ],
  mistakes: [
    {
      id: "mistake-delete-token-on-any-error",
      text: "Deleting a device token whenever a send is rejected. FCM says to remove a registration only when the payload is known to be valid and the error marks the registration invalid; a bad or oversized payload says nothing about the token, so valid devices are dropped and those users stop receiving pushes.",
      section: "reliability-retries-duplicates-and-unknown-outcomes",
    },
    {
      id: "mistake-retry-sms-like-push",
      text: "Retrying an SMS after a timeout as freely as a push. A timed-out provider call may have succeeded, so the retry can send the message twice, and each SMS duplicate costs money; keep the retry count low on such channels and use the provider's message id or idempotency feature where it exists.",
      section: "reliability-retries-duplicates-and-unknown-outcomes",
    },
    {
      id: "mistake-send-without-preference",
      text: "Sending marketing when the preference store cannot be reached, so the user's choice is unknown. Fail closed and hold the marketing message until the store answers; passcodes and security alerts follow the policy that they cannot be silenced.",
      section: "preferences-and-opt-outs-checked-at-the-last-moment",
    },
    {
      id: "mistake-cross-channel-marketing-fallback",
      text: "Falling back to another channel when a marketing push fails, for example sending an SMS instead, without checking that channel's consent and the frequency cap. Preferences are normally held per channel, so consent to push is not consent to SMS, and the fallback can reach a user who never agreed to it.",
      section: "failure-modes-and-follow-ups-to-volunteer",
    },
    {
      id: "mistake-accepted-as-delivered",
      text: "Marking a notification delivered when the provider accepts the request. Acceptance means the provider took responsibility, and for push there may be no delivery signal at all, so the dashboard overstates how many people saw anything.",
      section: "delivery-tracking-and-analytics",
    },
  ],
};
