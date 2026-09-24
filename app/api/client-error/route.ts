import { overRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 4000;

const MAX_FIELD = 500;

function clip(value: unknown): string {
  return typeof value === "string" ? value.slice(0, MAX_FIELD) : "";
}

export async function POST(req: Request) {
  if (overRateLimit(req, "client-error", 20)) return new Response(null, { status: 429 });

  const declared = Number(req.headers.get("content-length") || 0);
  if (declared > MAX_BODY_BYTES) return new Response(null, { status: 413 });

  let body: Record<string, unknown>;
  try {
    const text = await req.text();
    if (text.length > MAX_BODY_BYTES) return new Response(null, { status: 413 });
    body = JSON.parse(text);
  } catch {
    return new Response(null, { status: 204 });
  }

  console.error(
    JSON.stringify({
      kind: "client-error",
      message: clip(body.message),
      stack: clip(body.stack),
      url: clip(body.url),
      userAgent: req.headers.get("user-agent")?.slice(0, 200) || "",
      at: new Date().toISOString(),
    })
  );

  return new Response(null, { status: 204 });
}
