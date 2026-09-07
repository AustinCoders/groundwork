export const runtime = "nodejs";

const MAX_FIELD = 500;

function clip(value: unknown): string {
  return typeof value === "string" ? value.slice(0, MAX_FIELD) : "";
}

/**
 * Client-side errors land in the Vercel function logs, which is the cheapest
 * error visibility that does not need an account. Swap the console.error for a
 * Sentry capture when there is a DSN to send it to.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
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
