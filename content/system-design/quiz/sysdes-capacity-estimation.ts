import type { DesignPool } from "../../quiz-types";

export const pool: DesignPool = {
  questions: [
    {
      id: "ce-peak-qps",
      chapter: "sysdes-capacity-estimation",
      level: "advanced",
      skill: "estimate",
      section: "the-rounding-conventions-that-make-it-tractable",
      kind: "single",
      prompt:
        "<p>A product has 50 million daily active users, and each makes 20 API requests a day on average. Use the chapter's convention of 100,000 seconds in a day, and assume peak traffic is 3 times the average. What request rate do you size the fleet for?</p>",
      choices: [
        {
          id: "a",
          text: "10,000 requests per second",
          why: "That is the average rate, 1 billion requests divided by 100,000 seconds. A fleet is sized for the peak, and the 3 times multiplier in the stem has not been applied yet.",
        },
        {
          id: "b",
          text: "30,000 requests per second",
          why: "50 million users times 20 requests is 1 billion requests a day, which is 10,000 per second on average. Multiplying by the peak factor of 3 gives 30,000, the rate the fleet has to survive.",
        },
        {
          id: "c",
          text: "34,722 requests per second",
          why: "This divides by the true 86,400 seconds in a day. The stem asks for the 100,000-second convention, and the chapter notes that the roughly 14% difference is small next to the peak multiplier.",
        },
        {
          id: "d",
          text: "300,000 requests per second",
          why: "This is a decimal slip. Dividing 1 billion by 10,000 instead of 100,000 gives 100,000 per second on average, and the peak factor then makes it 300,000, ten times too high.",
        },
      ],
      answer: "b",
    },
    {
      id: "ce-egress-gbps",
      chapter: "sysdes-capacity-estimation",
      level: "advanced",
      skill: "estimate",
      section: "numbers-worth-memorizing",
      kind: "single",
      prompt:
        "<p>At peak, a thumbnail service sends 40,000 responses per second, each 250 KB. Use powers of ten (1 KB is 1,000 bytes) and 8 bits per byte. How much peak egress bandwidth, in gigabits per second, does it produce?</p>",
      choices: [
        {
          id: "a",
          text: "1.25 Gbps, after dividing the byte rate by 8",
          why: "Dividing by 8 converts bits to bytes. Here the quantity starts in bytes, so the conversion has to multiply by 8, not divide.",
        },
        {
          id: "b",
          text: "10 Gbps, the byte rate read as bits",
          why: "40,000 times 250 KB is 10 GB per second, which is 10 gigabytes, not gigabits. Quoting it in a bit unit without multiplying by 8 is the classic bits-versus-bytes slip.",
        },
        {
          id: "c",
          text: "80 Gbps, the byte rate times 8",
          why: "40,000 times 250,000 bytes is 10 billion bytes per second, or 10 GB/s. Multiplying by 8 bits per byte gives 80 Gbps, which is what a set of network links has to carry.",
        },
        {
          id: "d",
          text: "640 Gbps, the byte rate times 8 twice",
          why: "The conversion to bits happens once. Applying the factor of 8 to a figure that is already in bits double counts it.",
        },
      ],
      answer: "c",
    },
    {
      id: "ce-storage-five-years",
      chapter: "sysdes-capacity-estimation",
      level: "advanced",
      skill: "estimate",
      section: "worked-example-1-a-photo-sharing-service",
      kind: "single",
      prompt:
        "<p>A service ingests 10 million uploads a day, averaging 2 MB each. Use powers of ten, keep every upload for 1,825 days, and store three full copies of each. How much storage must the cluster provide?</p>",
      choices: [
        {
          id: "a",
          text: "About 109.5 PB across all copies",
          why: "10 million uploads of 2 MB is 20 TB a day. Over 1,825 days that is 36.5 PB of raw data, and three full copies make it 109.5 PB.",
        },
        {
          id: "b",
          text: "About 36.5 PB across all copies",
          why: "This is the raw data for the retention period with no copies at all. Forgetting the replication factor is the miss the chapter calls the most common one, and it is off by a factor of three here.",
        },
        {
          id: "c",
          text: "About 51.1 PB across all copies",
          why: "This applies the 1.4 times overhead of erasure coding to the raw figure. The stem says three full copies, so the multiplier is 3, not 1.4.",
        },
        {
          id: "d",
          text: "About 10.95 PB across all copies",
          why: "This starts from 2 TB a day instead of 20 TB, a dropped zero when multiplying 10 million by 2 million bytes, and every later step inherits the error.",
        },
      ],
      answer: "a",
    },
    {
      id: "ce-gateway-boxes",
      chapter: "sysdes-capacity-estimation",
      level: "advanced",
      skill: "estimate",
      section: "worked-example-2-a-chat-service",
      kind: "single",
      prompt:
        "<p>A chat app has 200 million daily active users, and 15% of them are connected at the same moment at peak. Each gateway box holds 250,000 sockets. How many gateway boxes does the socket count alone require?</p>",
      choices: [
        {
          id: "a",
          text: "800 boxes",
          why: "That divides all 200 million daily users by 250,000. Only the share connected at the same moment holds a socket, so the 15% concurrency fraction cannot be skipped.",
        },
        {
          id: "b",
          text: "14 boxes",
          why: "This divides 30 million sockets by roughly 2.28 million per box, a tuned-server figure. The stem gives 250,000 per box, so the sizing has to use that number.",
        },
        {
          id: "c",
          text: "1,200 boxes",
          why: "This divides 30 million sockets by 25,000, which drops a zero from the per-box figure and makes the fleet ten times too large.",
        },
        {
          id: "d",
          text: "120 boxes",
          why: "15% of 200 million is 30 million concurrent sockets. At 250,000 per box that is exactly 120 boxes, before any headroom is added.",
        },
      ],
      answer: "d",
    },
    {
      id: "ce-fleet-from-average",
      chapter: "sysdes-capacity-estimation",
      level: "advanced",
      skill: "diagnose",
      section: "the-order-always-the-same-eight-steps",
      kind: "single",
      prompt:
        "<p>A candidate sizes an API fleet like this: 2 billion requests a day at 100,000 seconds a day is 20,000 requests per second, each server tops out at 1,000 requests per second, so 20 servers, doubled to 40 for headroom. The product's traffic peaks at 3 times the daily average. Each evening the 40 servers saturate and users see errors, while overnight everything looks healthy. Which estimation mistake explains it?</p>",
      choices: [
        {
          id: "a",
          text: "Forgetting the replication factor, which should have multiplied the server count.",
          why: "Replication overhead multiplies stored bytes. It does not change how many application servers a given request rate needs, so it cannot explain a saturated serving tier.",
        },
        {
          id: "b",
          text: "Sizing from the average rate instead of the peak rate.",
          why: "The peak is 3 times 20,000, or 60,000 requests per second, and 40 servers cover only 40,000. Systems fail at peak, so the fleet has to come from the peak figure and its stated multiplier.",
        },
        {
          id: "c",
          text: "Mixing up bits and bytes when converting request size to bandwidth.",
          why: "The sizing used request counts only. Bits versus bytes matters when converting a byte rate to a link speed, and no bandwidth figure appears anywhere in this calculation.",
        },
        {
          id: "d",
          text: "Taking 1,000 requests per second per server, which is too optimistic.",
          why: "The chapter gives 1,000 to 5,000 for a handler that calls a database and recommends the low end for sizing. The per-server figure is already conservative, so the shortfall comes from the load number.",
        },
      ],
      answer: "b",
    },
    {
      id: "ce-cascade-order",
      chapter: "sysdes-capacity-estimation",
      level: "advanced",
      skill: "sequence",
      section: "the-order-always-the-same-eight-steps",
      kind: "order",
      prompt:
        "<p>You are sizing the server fleet for a chat app from a stated number of daily active users. Each calculation below needs the result of the one before it. Put them in the order you would do them.</p>",
      items: [
        { id: "daily", text: "Messages per day: daily active users times messages sent per user" },
        { id: "avg", text: "Average messages per second: messages per day divided by 86,400" },
        { id: "peak", text: "Peak messages per second: the average times a stated peak multiplier" },
        { id: "servers", text: "Server count: peak messages per second divided by what one server handles" },
      ],
      why: "Each figure is an input to the next. The daily total cannot be turned into a per-second rate until it exists, a peak needs an average to multiply, and the fleet is sized against the peak rather than the average, so the division by one server's capacity comes last. Skipping or reordering a step is how a wrong machine count appears in the follow-up question.",
    },
    {
      id: "ce-small-number-simple-design",
      chapter: "sysdes-capacity-estimation",
      level: "advanced",
      skill: "tradeoff",
      section: "how-each-number-cashes-out-as-a-design-decision",
      kind: "single",
      prompt:
        "<p>Interview prompt: a notes app with 1 million daily active users. Each saves 10 notes a day, a stored row is about 500 bytes, notes are kept for 1,825 days, and peak traffic is 3 times the average. Reads at peak are about 3,000 per second. Use 100,000 seconds a day and powers of ten. Planning figures: one relational primary on a modern NVMe server handles about 5,000 committed writes and 20,000 simple reads per second, and one server holds tens of terabytes of NVMe but only 256 GB to 2 TB of RAM. Which first design is the simplest one that these numbers say is enough?</p>",
      choices: [
        {
          id: "a",
          text: "Sixteen shards from the first day, because roughly 9 TB is too much data for one machine.",
          why: "A server with tens of terabytes of NVMe holds 9 TB comfortably. Sharding brings cross-shard queries and extra operations, and a big number is not the same as a hard problem.",
        },
        {
          id: "b",
          text: "Writes through Kafka into an LSM-tree store partitioned by user, because the workload is write heavy.",
          why: "Peak writes are only about 300 per second, a small fraction of one primary's planning figure of 5,000. A heavy ratio of writes to reads does not matter when the absolute rate is this low.",
        },
        {
          id: "c",
          text: "One relational primary plus a replica, with the shard key chosen now so a split stays possible.",
          why: "Peak writes of about 300 per second and reads of 3,000 per second sit well inside one primary's planning figures, and about 9 TB fits on one server. Choosing the shard key early keeps the option to split open without paying for it on day one.",
        },
        {
          id: "d",
          text: "A single in-memory Redis instance as the system of record, because reads need RAM speed.",
          why: "About 9 TB of data exceeds the 256 GB to 2 TB of RAM on a commodity server, and 3,000 reads per second is far below what a primary with a warm cache serves.",
        },
      ],
      answer: "c",
    },
    {
      id: "ce-whatsapp-record-per-box",
      chapter: "sysdes-capacity-estimation",
      level: "advanced",
      skill: "concept",
      section: "worked-example-2-a-chat-service",
      kind: "single",
      prompt:
        "<p>While sizing a chat gateway, a candidate cites WhatsApp's 2012 post reporting about 2.28 million simultaneous connections on one server and plans for that many per box. The interviewer has not said anything about the hardware or the runtime. Which response matches the chapter's guidance?</p>",
      choices: [
        {
          id: "a",
          text: "Plan for 2.28 million per box, since WhatsApp showed a real chat server can hold that many.",
          why: "The post reports one server, a 24-CPU machine with about 96 GB of RAM running a heavily tuned FreeBSD and Erlang setup. It does not say how other hardware or runtimes behave, so a record is not a planning default.",
        },
        {
          id: "b",
          text: "Plan for 250,000 to 500,000 per box, treating 2.28 million as a tuned record.",
          why: "Without known hardware and runtime, the chapter recommends a planning range of 250,000 to 500,000 sockets per box. The record shows what is possible after tuning, which is not what an unknown box will do.",
        },
        {
          id: "c",
          text: "Plan for 65,535 per box, because a server has only that many TCP ports to hand out to clients.",
          why: "A listening server uses one port for all its clients. A connection is identified by both endpoints' addresses and ports, so the 65,535 figure limits ports for one client address talking to one server address and port, not the server's total.",
        },
        {
          id: "d",
          text: "Plan for 10,000 per box, the classic C10K figure that servers are built around.",
          why: "C10K described the challenge of reaching ten thousand connections around 1999. Event-driven servers on modern kernels go far beyond it, which is why the chapter's planning range is in the hundreds of thousands.",
        },
      ],
      answer: "b",
    },
  ],
};
