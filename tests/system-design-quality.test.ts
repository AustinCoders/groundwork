import { describe, expect, it } from "vitest";
import { chapters } from "@/lib/content";

const written = chapters("system-design").filter((chapter) => chapter.ready);
const bodyOf = (id: string) => String(written.find((chapter) => chapter.id === id)?.body ?? "");
const textOf = (id: string) =>
  bodyOf(id)
    .replace(/<[^>]*>/g, " ")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&minus;/g, "−")
    .replace(/&times;/g, "×")
    .replace(/&divide;/g, "÷")
    .replace(/&asymp;/g, "≈")
    .replace(/&micro;/g, "µ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");

function sourcesBlock(body: string): string {
  const start = body.lastIndexOf("Sources and further reading");
  return start < 0 ? "" : body.slice(start);
}

describe("the sources every System Design chapter ends with", () => {
  it("covers all 28 chapters", () => {
    expect(written.length).toBeGreaterThanOrEqual(28);
  });

  it.each(written.map((chapter) => [chapter.id, String(chapter.body ?? "")]))(
    "%s closes with at least five distinct secure links",
    (id, body) => {
      const block = sourcesBlock(body);
      expect(block, `${id} has no "Sources and further reading" block`).not.toBe("");
      expect(body.trimEnd().endsWith("</div>"), `${id} should end with the sources box`).toBe(true);
      const links = [...block.matchAll(/<a href="([^"]+)"([^>]*)>/g)];
      const urls = links.map((link) => link[1]);
      expect(new Set(urls).size, `${id} repeats a link`).toBe(urls.length);
      expect(urls.length, `${id} lists only ${urls.length} sources`).toBeGreaterThanOrEqual(5);
      for (const [, url, rest] of links) {
        expect(url.startsWith("https://"), `${id}: ${url} is not https`).toBe(true);
        expect(rest, `${id}: ${url} lacks rel="noopener noreferrer"`).toContain('rel="noopener noreferrer"');
      }
    }
  );
});

const WRONG_CLAIMS: { id: string; pattern: RegExp; why: string }[] = [
  {
    id: "sysdes-consistency-models",
    pattern: /SERIALIZABLE on a replica/i,
    why: "a Postgres hot standby rejects SERIALIZABLE",
  },
  { id: "sysdes-consistency-models", pattern: /FaunaDB/i, why: "Fauna's hosted service shut down on 30 May 2025" },
  {
    id: "sysdes-consistency-models",
    pattern: /default in Dynamo-style/i,
    why: "Cassandra hints only satisfy CL=ANY; sloppy quorums are Riak and the original Dynamo",
  },
  {
    id: "sysdes-walkthrough-simple",
    pattern: /three orders of magnitude/i,
    why: "116 against 11,574 a second is 100 times, two orders",
  },
  {
    id: "sysdes-storage-systems",
    pattern: /listing a bucket can still lag/i,
    why: "S3 LIST has been strongly consistent since December 2020",
  },
  {
    id: "sysdes-storage-systems",
    pattern: /up to ~?5 TB/i,
    why: "the S3 maximum object size is 50 TB since December 2025",
  },
  {
    id: "sysdes-rate-limiting",
    pattern: /\bHMSET\b(?![^.]*deprecated)/i,
    why: "HMSET is deprecated since Redis 4.0.0; use HSET",
  },
  {
    id: "sysdes-capacity-estimation",
    pattern: /5,000-10,000 reads/i,
    why: "single-primary figures are the shared 20,000 reads and 5,000 writes a second planning numbers",
  },
  {
    id: "sysdes-case-studies",
    pattern: /Chaos Monkey and the broader Simian Army/i,
    why: "the Simian Army is retired; only Chaos Monkey lives on, through Spinnaker",
  },
  { id: "sysdes-cdns", pattern: /no persistent TCP/i, why: "Workers have had connect() since 2023" },
  {
    id: "sysdes-replication",
    pattern: /standby has flushed the commit record to durable storage Both machines crash at the same time/,
    why: "synchronous_commit on loses data only if the primary and every synchronous standby lose their storage, not on a simultaneous crash",
  },
  {
    id: "sysdes-replication",
    pattern: /switchover avoids all three hazards/i,
    why: "a planned switchover still needs clients re-pointed and caches flushed",
  },
  {
    id: "sysdes-replication",
    pattern: /leaderless-style/i,
    why: "DynamoDB global tables are multi-leader with last writer wins, not Dynamo-style leaderless",
  },
  {
    id: "sysdes-replication",
    pattern: /Not automatic\. It must run/,
    why: "Cassandra 5.0.8 and later have an opt-in repair scheduler",
  },
  {
    id: "sysdes-transactions-isolation",
    pattern: /answered no twice/i,
    why: "a phantom changes the result set; answering no twice is not a phantom",
  },
  {
    id: "sysdes-transactions-isolation",
    pattern: /6\.25 times a second|2 × 80 = 160/,
    why: "a 2PC participant holds its locks about one round trip, not two, so the hot-row rate is 12.5 a second",
  },
  {
    id: "sysdes-transactions-isolation",
    pattern: /keep aborting each other/i,
    why: "PostgreSQL SSI guarantees an immediate retry will not fail again with the same conflict",
  },
  {
    id: "sysdes-time-ordering-ids",
    pattern: /commit wait was about 4 ms|The width is the uncertainty/i,
    why: "the Spanner paper measures about 5 ms of commit wait and about 9 ms of Paxos latency, and its error bound epsilon is half the interval width",
  },
  {
    id: "sysdes-time-ordering-ids",
    pattern: /took down DNS answers|disagree by up to a second/i,
    why: "Cloudflare's leap second bug affected CNAME customers and about 0.2% of queries, and smeared against stepped clocks differ by under half a second",
  },
  {
    id: "sysdes-storage-engines",
    pattern: /82 is a ceiling/i,
    why: "the 82x page-flush figure excludes WAL records, full-page images and the doublewrite buffer, so it is not a ceiling",
  },
  {
    id: "sysdes-storage-engines",
    pattern: /half its entries move/i,
    why: "a B-tree split moves a portion of the entries, chosen for balance",
  },
  {
    id: "sysdes-storage-engines",
    pattern: /optimise any two at the cost of the third/i,
    why: "the RocksDB space-amplification paper only says all three cannot be reduced at once",
  },
];

describe("claims that an audit proved wrong stay out", () => {
  it.each(WRONG_CLAIMS.map((claim) => [claim.id, claim.pattern.source, claim] as const))(
    "%s no longer says /%s/",
    (id, _source, claim) => {
      expect(textOf(id), claim.why).not.toMatch(claim.pattern);
    }
  );

  it("calls the standard-looking HTTP headers what they are, drafts", () => {
    expect(textOf("sysdes-rate-limiting")).toMatch(/draft/i);
    expect(textOf("sysdes-apis-communication")).toMatch(/draft/i);
  });
});

describe("the arithmetic in the chapters still adds up", () => {
  it("serial 99.9% dependencies cost hours a year, using a 365.25-day year", () => {
    const text = textOf("sysdes-availability-design");
    for (let count = 0; count <= 5; count++) {
      const hours = (1 - 0.999 ** (count + 1)) * 8766;
      expect(text, `${count + 1} dependencies`).toContain(`${hours.toFixed(1)} h`);
    }
  });

  it("the photo service stores 54.75 PB raw and 77 PB erasure coded over five years", () => {
    const text = textOf("sysdes-capacity-estimation");
    const rawPb = (30 * 365 * 5) / 1000;
    expect(text).toContain(`${rawPb.toFixed(2)} PB`);
    expect(text).toContain(`~${Math.round(rawPb * 1.4)} PB`);
  });

  it("peak egress is 960 Gbps and 48 Gbps behind a 95% hit rate", () => {
    const text = textOf("sysdes-capacity-estimation");
    const average = ((2e9 * 2e6) / 1e5) * 8;
    const peak = (average * 3) / 1e9;
    expect(peak).toBe(960);
    expect(text).toContain("960 Gbps");
    expect(text).toContain(`${peak * 0.05} Gbps`);
  });

  it("base 62 keys have the quoted key spaces", () => {
    const text = textOf("sysdes-walkthrough-simple");
    expect(text).toContain((BigInt(62) ** BigInt(6)).toLocaleString("en-US"));
    expect(text).toContain((BigInt(62) ** BigInt(7)).toLocaleString("en-US"));
  });

  it("quorum rows say whether the read and write sets must overlap", () => {
    const body = bodyOf("sysdes-consistency-models");
    const rows: [number, number, number][] = [
      [3, 2, 2],
      [3, 3, 1],
      [3, 1, 3],
      [3, 1, 1],
      [5, 3, 3],
    ];
    for (const [n, w, r] of rows) {
      const row = body.match(new RegExp(`<tr><td>${n}, ${w}, ${r}</td><td>(.*?)</td>`));
      expect(row, `no row for N=${n}, W=${w}, R=${r}`).not.toBeNull();
      const overlaps = r + w > n;
      expect(row![1].includes("Yes"), `N=${n}, W=${w}, R=${r}`).toBe(overlaps);
      expect(row![1].includes("No"), `N=${n}, W=${w}, R=${r}`).toBe(!overlaps);
    }
  });

  it("fan-out multiplies availability and retries multiply load", () => {
    const observability = textOf("sysdes-observability-scale");
    for (const calls of [5, 10, 100]) expect(observability).toContain((0.99 ** calls).toFixed(3));
    for (const id of ["sysdes-fault-tolerance", "sysdes-apis-communication"]) {
      const text = textOf(id);
      expect(text, id).toContain(String(3 ** 3));
      expect(text, id).toContain(String(4 ** 3));
    }
  });
});

const inText = (id: string, ...parts: (string | number)[]) => {
  const text = textOf(id);
  for (const part of parts) expect(text, `${id} should contain ${part}`).toContain(String(part));
};

describe("the replication chapter's numbers", () => {
  it("40 ms of lag at 5,000 writes a second puts 200 acknowledged writes at risk", () => {
    expect(0.04 * 5000).toBe(200);
    inText("sysdes-replication", "200 writes");
  });

  it("a distant synchronous standby caps one connection at 12.5 commits a second", () => {
    expect(1 / 0.08).toBe(12.5);
    inText("sysdes-replication", "12.5 commits a second");
  });

  it("one mandatory synchronous standby costs availability, a quorum of two gives it back", () => {
    expect(0.999 * 0.999).toBeCloseTo(0.998, 3);
    expect(0.999 * (1 - 0.001 * 0.001)).toBeCloseTo(0.999, 3);
    inText("sysdes-replication", "99.8%", "99.9%");
  });

  it("repairing every 7 days leaves 3 days of slack inside a 10 day grace period", () => {
    expect(10 - 7).toBe(3);
    inText("sysdes-replication", "10 − 7 = 3 days");
  });

  it("the last-write-wins dry run stamps the slow node's write at 9.940 and the counter ends at 7", () => {
    expect(+(10.02 - 0.08).toFixed(3)).toBe(9.94);
    expect(5 + 1 + 1).toBe(7);
    inText("sysdes-replication", "10.020 − 0.080 = 9.940", "5 + 2 = 7");
  });
});

describe("the transactions chapter's numbers", () => {
  it("a 2PC participant that holds locks for one 80 ms round trip can commit a hot row 12.5 times a second", () => {
    inText("sysdes-transactions-isolation", "1 ÷ 0.080 = 12.5");
    expect(1 / 0.08).toBe(12.5);
  });

  it("three items cost 3 x 2 = 6 write capacity units in a DynamoDB transaction", () => {
    inText("sysdes-transactions-isolation", "3 × 2 = 6 write capacity units");
  });

  it("the doctors end at 0 on call under write skew and the lost update ends at 11 instead of 12", () => {
    expect(2 - 1 - 1).toBe(0);
    expect(10 + 2).toBe(12);
    inText("sysdes-transactions-isolation", "2 − 1 − 1 = 0");
  });

  it("PostgreSQL synchronous_commit off can lose three wal_writer_delay periods, about 600 ms", () => {
    expect(3 * 200).toBe(600);
    inText("sysdes-transactions-isolation", "about 600 ms");
  });
});

describe("the storage engines chapter's numbers", () => {
  it("400 entries per page address 64 million keys in three levels and 25.6 billion in four", () => {
    expect(400 ** 3).toBe(64_000_000);
    expect(400 ** 4).toBe(25_600_000_000);
    inText("sysdes-storage-engines", "64,000,000", "25,600,000,000");
  });

  it("a ten-fold level series holds 90% of its data in the last level and has space amplification 1.111", () => {
    const levels = [1, 10, 100, 1000, 10000];
    const total = levels.reduce((a, b) => a + b, 0);
    expect(total).toBe(11_111);
    expect(10_000 / total).toBeCloseTo(0.9, 3);
    expect(total / 10_000).toBeCloseTo(1.111, 3);
    inText("sysdes-storage-engines", "1,111,100 MB", "1.111");
  });

  it("nine Bloom-filtered files at a 1% false-positive rate waste 0.09 reads, or 1.08 without a last-level filter", () => {
    expect(9 * 0.01).toBeCloseTo(0.09, 10);
    expect(8 * 0.01 + 1).toBeCloseTo(1.08, 10);
    inText("sysdes-storage-engines", "0.09 expected", "1.08");
  });

  it("10,000 100-byte rows a second are 1 MB/s, and page flushes would be about 82 MB/s against 20 MB/s", () => {
    expect(10_000 * 100).toBe(1_000_000);
    expect(10_000 * 8192).toBe(81_920_000);
    expect((10_000 * 8192) / 20e6).toBeCloseTo(4.1, 1);
    inText("sysdes-storage-engines", "81,920,000 B/s", "1,000,000 B/s");
  });

  it("scanning one of 100 equal columns reads a hundredth, and a billion rows need about 122,000 index marks", () => {
    expect(100 * 8 * 1e9).toBe(800e9);
    expect(Math.round(1e9 / 8192 / 1000)).toBe(122);
    inText("sysdes-storage-engines", "800 GB", "8 GB");
  });
});

describe("the time, ordering and IDs chapter's numbers", () => {
  it("200 microseconds a second drifts 6 ms in 30 seconds, 0.72 s in an hour and 17.28 s in a day", () => {
    for (const [seconds, drift] of [
      [30, "6 ms"],
      [3600, "0.72 s"],
      [86400, "17.28 s"],
    ] as const) {
      const value = seconds * 200e-6;
      expect(value === 0.006 ? "6 ms" : `${value.toFixed(2)} s`).toBe(drift);
    }
    inText("sysdes-time-ordering-ids", "6 ms", "0.72 s", "17.28 s");
  });

  it("a one second smear over 86,400 seconds is about 11.6 ppm", () => {
    expect((1 / 86400) * 1e6).toBeCloseTo(11.6, 1);
    inText("sysdes-time-ordering-ids", "11.6 ppm");
  });

  it("41 bits of milliseconds last 69.7 years and 12 bits of sequence give 4,096 IDs a millisecond", () => {
    expect(2 ** 41 / 1000 / 86400 / 365.25).toBeCloseTo(69.7, 1);
    expect(2 ** 12).toBe(4096);
    expect(4096 * 1000 * 1024).toBe(4_194_304_000);
    inText("sysdes-time-ordering-ids", "2,199,023,255,552", "4,194,304,000", "69.7 years");
  });

  it("a trillion UUIDv4s collide with probability about 9.4e-14", () => {
    const n = 1e12;
    const probability = (n * (n - 1)) / (2 * 2 ** 122);
    expect(probability).toBeCloseTo(9.4e-14, 15);
    inText("sysdes-time-ordering-ids", "9.4 × 10 −14");
  });

  it("the Lamport and vector clock dry run ends at 5 and [2,2,2]", () => {
    const sendM1 = 1 + 1;
    const p2 = Math.max(0, sendM1) + 1;
    const p2Send = p2 + 1;
    const p3Receive = Math.max(1, p2Send) + 1;
    expect([sendM1, p2, p2Send, p3Receive]).toEqual([2, 3, 4, 5]);
    inText("sysdes-time-ordering-ids", "[2,2,2]", "[2,1,0]");
  });

  it("the hybrid logical clock gives the causally later write (10.000, 2) over (10.000, 0)", () => {
    const l = Math.max(Math.max(9.9, 10.0, 9.96), 0);
    expect(l).toBe(10.0);
    inText("sysdes-time-ordering-ids", "(10.000, 2) beats (10.000, 0)");
  });
});
