import { describe, expect, it } from "vitest";
import { chapters } from "@/lib/content";

const written = chapters("system-design").filter((chapter) => chapter.ready);
const bodyOf = (id: string) => String(written.find((chapter) => chapter.id === id)?.body ?? "");
const textOf = (id: string) =>
  bodyOf(id)
    .replace(/<[^>]*>/g, " ")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");

function sourcesBlock(body: string): string {
  const start = body.lastIndexOf("Sources and further reading");
  return start < 0 ? "" : body.slice(start);
}

describe("the sources every System Design chapter ends with", () => {
  it("covers all 24 chapters", () => {
    expect(written.length).toBeGreaterThanOrEqual(24);
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
