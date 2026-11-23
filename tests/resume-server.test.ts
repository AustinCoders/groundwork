import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/resume/analyze/route";
import { SAMPLE_RESUME_LINES } from "@/lib/resume/sample";
import { checkAnalyzeRequest, trimRead } from "@/lib/resume/request";

const TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4In0.c2ln";
const read = { lines: [...SAMPLE_RESUME_LINES], links: ["https://github.com/riya"], pages: 1, wideGaps: 0 };

let ip = 0;

function request(body: unknown, headers: Record<string, string> = {}): Request {
  ip += 1;
  return new Request("http://localhost/api/resume/analyze", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${TOKEN}`,
      "x-forwarded-for": `10.0.0.${ip}`,
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function rpc(status: number, body: unknown) {
  return vi.fn(
    async () => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } })
  );
}

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("checkAnalyzeRequest", () => {
  it("accepts what the browser sends", () => {
    const checked = checkAnalyzeRequest({ read: trimRead(read), jd: "Node.js" });
    expect(checked.ok).toBe(true);
  });

  it("refuses empty, oversized and malformed text", () => {
    expect(checkAnalyzeRequest({ read: { ...read, lines: ["", " "] } }).ok).toBe(false);
    expect(checkAnalyzeRequest({ read: { ...read, lines: ["x".repeat(601)] } }).ok).toBe(false);
    expect(checkAnalyzeRequest({ read: { ...read, lines: Array(1501).fill("a") } }).ok).toBe(false);
    expect(checkAnalyzeRequest({ read: { ...read, lines: ["a", 4] } }).ok).toBe(false);
    expect(checkAnalyzeRequest({ read: { ...read, pages: 0 } }).ok).toBe(false);
    expect(checkAnalyzeRequest({ read, jd: "x".repeat(8001) }).ok).toBe(false);
    expect(checkAnalyzeRequest([]).ok).toBe(false);
  });

  it("drops links that are not plain web links", () => {
    const checked = checkAnalyzeRequest({ read: { ...read, links: ["javascript:alert(1)", "https://a.dev", 5] } });
    expect(checked.ok && checked.value.read.links).toEqual(["https://a.dev"]);
  });

  it("trims what the browser read to the limits", () => {
    const trimmed = trimRead({
      lines: ["y".repeat(900), ...Array(1600).fill("z")],
      links: [],
      pages: 3.6,
      wideGaps: -2,
    });
    expect(trimmed.lines).toHaveLength(1500);
    expect(trimmed.lines[0]).toHaveLength(600);
    expect(trimmed.pages).toBe(4);
    expect(trimmed.wideGaps).toBe(0);
  });
});

describe("POST /api/resume/analyze", () => {
  it("refuses a request with no sign-in token, without calling Supabase", async () => {
    const fetchSpy = rpc(200, { ok: true });
    vi.stubGlobal("fetch", fetchSpy);
    const res = await POST(request({ read }, { authorization: "" }));
    expect(res.status).toBe(401);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("refuses a bad body before spending the user's quota", async () => {
    const fetchSpy = rpc(200, { ok: true });
    vi.stubGlobal("fetch", fetchSpy);
    expect((await POST(request("{nope"))).status).toBe(400);
    expect((await POST(request({ read: { lines: [] } }))).status).toBe(400);
    expect((await POST(request({ read }, { "content-type": "text/plain" }))).status).toBe(415);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("refuses a body over the size limit", async () => {
    vi.stubGlobal("fetch", rpc(200, { ok: true }));
    const res = await POST(request({ read: { ...read, lines: Array(1400).fill("w".repeat(500)) } }));
    expect(res.status).toBe(413);
  });

  it("passes on a token Supabase rejects as signed out", async () => {
    vi.stubGlobal("fetch", rpc(401, { message: "JWT expired" }));
    expect((await POST(request({ read }))).status).toBe(401);
  });

  it("maps each refusal from the database to a status and message", async () => {
    for (const [reason, status] of [
      ["signed_out", 401],
      ["unconfirmed", 403],
      ["second_step", 403],
      ["limit", 429],
      ["busy", 429],
    ] as const) {
      vi.stubGlobal("fetch", rpc(200, { ok: false, reason }));
      const res = await POST(request({ read }));
      expect(res.status, reason).toBe(status);
      expect(((await res.json()) as { error: string }).error.length).toBeGreaterThan(10);
    }
  });

  it("builds the result for a signed-in user and sends the token to Supabase", async () => {
    const fetchSpy = rpc(200, { ok: true, left: 39 });
    vi.stubGlobal("fetch", fetchSpy);
    const res = await POST(request({ read, jd: "Senior engineer: Node.js, Kafka, Kubernetes" }));
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    const body = (await res.json()) as { analysis: { questions: unknown[]; missing: string[] } };
    expect(body.analysis.questions.length).toBeGreaterThan(20);
    expect(body.analysis.missing).toContain("kubernetes");
    const [url, init] = fetchSpy.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://example.supabase.co/rest/v1/rpc/claim_resume_run");
    expect((init.headers as Record<string, string>).Authorization).toBe(`Bearer ${TOKEN}`);
  });

  it("fails closed when Supabase cannot be reached", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Promise.reject(new Error("down")))
    );
    expect((await POST(request({ read }))).status).toBe(503);
  });
});
