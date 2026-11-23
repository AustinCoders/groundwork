import { accountConfig } from "@/lib/account/config";
import { overRateLimit } from "@/lib/rateLimit";
import { analyzeResume } from "@/lib/resume/analyze";
import { buildCatalogue } from "@/lib/resume/catalogue";
import { MAX_BODY_BYTES, RUN_MESSAGE, checkAnalyzeRequest, isRunReason } from "@/lib/resume/request";
import type { Catalogue } from "@/lib/resume/types";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export const maxDuration = 15;

const NO_STORE = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

const TOKEN = /^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/;

let catalogue: Catalogue | null = null;

function reply(status: number, body: Record<string, unknown>): Response {
  return Response.json(body, { status, headers: NO_STORE });
}

async function readCapped(req: Request, limit: number): Promise<string | null> {
  if (!req.body) return "";
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}

async function claimRun(token: string): Promise<{ ok: true } | { ok: false; status: number; reason: string }> {
  const config = accountConfig();
  if (!config) return { ok: false, status: 503, reason: "Accounts are not available right now." };
  let res: Response;
  try {
    res = await fetch(`${config.url}/rest/v1/rpc/claim_resume_run`, {
      method: "POST",
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: "{}",
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
  } catch {
    return { ok: false, status: 503, reason: "Could not reach the account service. Try again in a moment." };
  }
  if (res.status === 401 || res.status === 403) return { ok: false, status: 401, reason: RUN_MESSAGE.signed_out };
  if (!res.ok) return { ok: false, status: 503, reason: "Could not check your account. Try again in a moment." };
  const result: unknown = await res.json().catch(() => null);
  if (result && typeof result === "object" && (result as { ok?: unknown }).ok === true) return { ok: true };
  const why = result && typeof result === "object" ? (result as { reason?: unknown }).reason : null;
  if (isRunReason(why)) {
    const status = why === "limit" || why === "busy" ? 429 : why === "signed_out" ? 401 : 403;
    return { ok: false, status, reason: RUN_MESSAGE[why] };
  }
  return { ok: false, status: 503, reason: "Could not check your account. Try again in a moment." };
}

export async function POST(req: Request) {
  if (overRateLimit(req, "resume-analyze", 20)) return reply(429, { error: RUN_MESSAGE.busy });

  const token = TOKEN.exec(req.headers.get("authorization") ?? "")?.[1];
  if (!token || token.length > 8192) return reply(401, { error: RUN_MESSAGE.signed_out });

  if (!(req.headers.get("content-type") ?? "").startsWith("application/json")) {
    return reply(415, { error: "Send the resume as JSON." });
  }
  const declared = Number(req.headers.get("content-length") || 0);
  if (declared > MAX_BODY_BYTES) return reply(413, { error: "That resume is too long to check." });

  const text = await readCapped(req, MAX_BODY_BYTES).catch(() => null);
  if (text === null) return reply(413, { error: "That resume is too long to check." });
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return reply(400, { error: "The request is not valid JSON." });
  }
  const checked = checkAnalyzeRequest(body);
  if (!checked.ok) return reply(400, { error: checked.error });

  const claim = await claimRun(token);
  if (!claim.ok) return reply(claim.status, { error: claim.reason });

  catalogue ??= buildCatalogue();
  const { read, jd } = checked.value;
  const analysis = analyzeResume({
    lines: read.lines,
    pages: read.pages,
    wideGaps: read.wideGaps,
    links: read.links,
    jd,
    catalogue,
  });
  return reply(200, { analysis });
}

export function GET() {
  return reply(405, { error: "Use POST." });
}
