import type { DesignPool } from "../../quiz-types";

export const pool: DesignPool = {
  questions: [
    {
      id: "nt-consent-second-check",
      chapter: "sysdes-walkthrough-notifications",
      level: "intermediate",
      skill: "diagnose",
      section: "preferences-and-opt-outs-checked-at-the-last-moment",
      kind: "single",
      prompt:
        "<p>A marketing push campaign to 20 million devices takes about an hour to drain from its queue. The notification service checks each user's preferences when it creates the jobs. Ten minutes into the send, a user opts out of marketing and still receives a push from this campaign. Which change best closes the gap between the queued job and the opt-out?</p>",
      choices: [
        {
          id: "a",
          text: "Read preferences from a strongly consistent store when the service creates the jobs.",
          why: "Fresher reads at enqueue time help, but they cannot see an opt-out that happens afterwards. A job created before the opt-out still waits in the queue, and that gap between enqueue and send is where the opt-out lands.",
        },
        {
          id: "b",
          text: "Check preferences again in the worker, just before the provider call.",
          why: "The worker's check is the last point before the message leaves your system, so it sees an opt-out made while the job was queued. The check at job creation is still worth keeping because it is cheap and saves queue space, but this one closes the queue-delay gap.",
        },
        {
          id: "c",
          text: "Drain the queue faster, so the whole campaign finishes within a few minutes.",
          why: "A shorter send window makes the problem rarer but does not close it, because any delay between enqueue and send leaves room for an opt-out. Provider quotas also bound how fast you can send; the FCM default is 10,000 messages a second.",
        },
        {
          id: "d",
          text: "Trust the provider's block list and drop your own preference check.",
          why: "A provider list covers only its own channel and keywords, such as an SMS STOP reply. Opt-outs set inside your product live in your preference store and cover push and email too, which is why provider state is mirrored into that store and the store is consulted.",
        },
      ],
      answer: "b",
    },
    {
      id: "nt-lanes-passcode-delay",
      chapter: "sysdes-walkthrough-notifications",
      level: "intermediate",
      skill: "tradeoff",
      section: "the-architecture",
      kind: "single",
      prompt:
        "<p>One shared push queue carries both a 4-hour marketing backlog and password-reset codes, and workers take jobs in arrival order. During campaigns, reset codes reach users hours late. Which change fixes the cause?</p>",
      choices: [
        {
          id: "a",
          text: "Add more workers to the shared queue so the backlog drains sooner.",
          why: "More workers shorten the wait only until you reach the provider's rate ceiling, and a code enqueued behind millions of campaign jobs still waits its turn. This reduces the delay without isolating the two kinds of traffic.",
        },
        {
          id: "b",
          text: "Cap marketing at a few pushes per user per day.",
          why: "A per-user cap protects a person from being flooded, but a campaign that sends each user one push still puts 20 million jobs ahead of the code. The cap does not change the order in which jobs are served.",
        },
        {
          id: "c",
          text: "Give passcodes a high lane with reserved workers.",
          why: "Separate lanes let a passcode skip the campaign backlog, and reserved capacity means bulk work cannot take its workers. A floor of capacity for the lower lanes stops them starving in turn.",
        },
        {
          id: "d",
          text: "Send the marketing pushes with APNs priority 5.",
          why: "The apns-priority header tells APNs how to schedule delivery to the device. It has no effect on the order of jobs inside your own queue, which is where this delay happens.",
        },
      ],
      answer: "c",
    },
    {
      id: "nt-fcm-quota-minutes",
      chapter: "sysdes-walkthrough-notifications",
      level: "intermediate",
      skill: "estimate",
      section: "capacity-estimation",
      kind: "single",
      prompt:
        "<p>A campaign must send one FCM message to each of 20 million device tokens. Assume the project's default quota of 600,000 messages a minute is the only limit, each message counts once against it, and the sender runs at exactly the quota with no other traffic. About how long does the send take at minimum?</p>",
      choices: [
        {
          id: "a",
          text: "About 33 minutes",
          why: "20,000,000 ÷ 600,000 is about 33 quota-minutes. The quota is the ceiling, so no sender can finish the same send faster without a higher quota.",
        },
        {
          id: "b",
          text: "About half a minute",
          why: "That reads the quota as 600,000 a second. It is a per-minute figure, which is 10,000 a second, so the send takes about 2,000 seconds.",
        },
        {
          id: "c",
          text: "About 2,000 minutes",
          why: "2,000 is the answer in seconds (20,000,000 ÷ 10,000 a second). Treating that number as minutes inflates it by a factor of 60.",
        },
        {
          id: "d",
          text: "About 1 hour, because FCM spreads a project's sends across the hour",
          why: "FCM's documented quota is counted per minute and refills in the following minute. It does not stretch a send across the hour, so you cannot rely on it to smooth a campaign for you.",
        },
      ],
      answer: "a",
    },
    {
      id: "nt-sms-queue-overflow",
      chapter: "sysdes-walkthrough-notifications",
      level: "intermediate",
      skill: "estimate",
      section: "capacity-estimation",
      kind: "single",
      prompt:
        "<p>All at once, you submit 1,000,000 single-segment SMS messages through one US long code that sends 1 segment per second, as in Twilio's documentation. Twilio queues a message for at most 10 hours and then fails it. Assume nothing else uses the sender and the default validity period applies. How many messages fail?</p>",
      choices: [
        {
          id: "a",
          text: "None, because the queue holds the whole backlog until it drains",
          why: "Draining would take about 11.6 days, far past the 10-hour queue limit. Messages still waiting when their time is up fail rather than wait for the sender to catch up.",
        },
        {
          id: "b",
          text: "36,000",
          why: "36,000 (10 hours × 3,600 seconds × 1 segment) is how many messages the code manages to send in that time, not how many fail. The failures are the remainder.",
        },
        {
          id: "c",
          text: "All 1,000,000",
          why: "The sender works through the queue from the first second, so the first 36,000 messages go out within the 10 hours. Only the ones still waiting at the limit fail.",
        },
        {
          id: "d",
          text: "964,000",
          why: "In 10 hours the sender releases 36,000 segments, and the other 1,000,000 − 36,000 = 964,000 are still queued when the limit hits. This is why the sender type is a requirement: a short code at over 100 segments a second changes the answer completely.",
        },
      ],
      answer: "d",
    },
    {
      id: "nt-hourly-ramp",
      chapter: "sysdes-walkthrough-notifications",
      level: "intermediate",
      skill: "diagnose",
      section: "rate-limiting-priority-and-expiry",
      kind: "single",
      prompt:
        "<p>A daily campaign to 20 million devices starts at exactly 09:00 and sends at a steady 5,556 messages a second from the first second. That is under the project's 10,000-a-second FCM quota, yet FCM returns 429 responses for the first minute or two of every run, and the retry loop re-sends straight away. Following Google's FCM scaling guidance, which change fits best?</p>",
      choices: [
        {
          id: "a",
          text: "Request a quota increase, since a 429 always means the quota is used up.",
          why: "A 429 is returned when a project is over quota, but FCM also returns it during overload. Here the send rate is below the quota, so a bigger quota does not address the primary cause.",
        },
        {
          id: "b",
          text: "Ramp up over 60 seconds or more, and start off the quarter hour.",
          why: "Google advises ramping from zero to the target rate over at least a minute and avoiding the first minutes after :00, :15, :30 and :45, when FCM's own traffic spikes. Retries should also wait for the retry-after value.",
        },
        {
          id: "c",
          text: "Retry each 429 immediately, using more workers to clear the backlog.",
          why: "Google's guidance is to wait for the duration in the retry-after header, or 60 seconds when it is missing. Immediate retries add load to a service that is already pushing back.",
        },
        {
          id: "d",
          text: "Shorten the TTL so the rejected messages expire sooner.",
          why: "TTL controls how long FCM keeps an undelivered message for a device. It does not change how fast you offer traffic, and the offered rate is what triggers the throttling.",
        },
      ],
      answer: "b",
    },
    {
      id: "nt-permanent-errors",
      chapter: "sysdes-walkthrough-notifications",
      level: "intermediate",
      skill: "concept",
      section: "reliability-retries-duplicates-and-unknown-outcomes",
      kind: "multi",
      prompt:
        "<p>A worker sees the failures below. Select every one that the chapter's rules classify as permanent, so the job skips the backoff ladder and the system updates its own state instead.</p>",
      choices: [
        {
          id: "a",
          text: "APNs answers 410 Unregistered for a device token.",
          why: "The token is no longer active for the app, and Apple says not to retry Unregistered. The right move is to delete the token and stop sending to it.",
        },
        {
          id: "b",
          text: "FCM answers HTTP 500 to a send.",
          why: "A 500 is a server-side fault that may clear, and Google's guidance is to retry it with exponential backoff. It belongs on the retry ladder, with a cap on age.",
        },
        {
          id: "c",
          text: "A push payload is rejected for exceeding 4,096 bytes.",
          why: "The same payload fails the same way every time, and Apple lists PayloadTooLarge among the errors not to retry. It should fail at render time and go to the dead-letter queue.",
        },
        {
          id: "d",
          text: "An SMS to a number that replied STOP fails with error 21610.",
          why: "The number is on the provider's block list until the user opts back in, so waiting does not help. Mirror the opt-out into your own preference store as well.",
        },
        {
          id: "e",
          text: "FCM answers 429 with a retry-after header of 30 seconds.",
          why: "A 429 means the sender should slow down, not that the message is bad. Google says to retry after the duration in the header, so this is retryable with the provider's delay.",
        },
      ],
      answers: ["a", "c", "d"],
    },
    {
      id: "nt-email-job-order",
      chapter: "sysdes-walkthrough-notifications",
      level: "intermediate",
      skill: "sequence",
      section: "delivery-tracking-and-analytics",
      kind: "order",
      prompt:
        "<p>Order the life of one email job for a shipping notice, with these rules: a repeated event must create no jobs, an opt-out is honoured as late as possible, and a webhook can only be matched once the provider has returned a message id.</p>",
      items: [
        { id: "dedupe", text: "The service records the event id with SET NX" },
        { id: "enqueue", text: "The service checks preferences and enqueues a job for each allowed channel" },
        { id: "recheck", text: "The worker checks preferences again, immediately before calling the provider" },
        { id: "send", text: "The worker calls the email provider and stores the returned message id on the sent row" },
        { id: "callback", text: "A provider webhook arrives and is matched to the job by that message id" },
      ],
      why: "De-duplication comes first because it is the front door: a repeated event must stop before it creates any jobs. The service then enqueues, and the worker's own consent check sits right before the provider call, since that is the last moment an opt-out can be honoured. The message id exists only after the provider has accepted the request, and only then can a later webhook be matched to its job.",
    },
    {
      id: "nt-accepted-not-delivered",
      chapter: "sysdes-walkthrough-notifications",
      level: "intermediate",
      skill: "diagnose",
      section: "delivery-tracking-and-analytics",
      kind: "single",
      prompt:
        '<p>Your log marks a push job "delivered" as soon as the worker receives a success response from APNs, and the dashboard reports 99.9% delivered. Users still say they miss notices. What is wrong with the log design?</p>',
      choices: [
        {
          id: "a",
          text: 'It should mark "delivered" only after the user opens the notification, since anything earlier is unconfirmed.',
          why: "Opens are a later stage that comes from your own tracking and is approximate, and plenty of delivered notifications are never opened. Treating open as the meaning of delivered would undercount real deliveries.",
        },
        {
          id: "b",
          text: "It should wait for a 410 from APNs, because silence means the device got it.",
          why: "A 410 reports that a token is no longer active. The absence of one says nothing about whether a notification was displayed, since APNs is a best-effort service.",
        },
        {
          id: "c",
          text: "A success means APNs accepted the request, so record the push as sent.",
          why: 'Accepted is weaker than delivered, because APNs may store, collapse or drop a notification for a device that is offline. "Delivered" needs a later signal, and for push there is at best a partial one.',
        },
      ],
      answer: "c",
    },
  ],
};
