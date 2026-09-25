import { overRateLimit } from "@/lib/rateLimit";
import { extractCode, parseTranslateRequest, TRANSLATE_MODEL, translatePrompt } from "@/lib/translate";

export const runtime = "nodejs";

const json = (status: number, body: unknown) => Response.json(body, { status });

export async function POST(req: Request) {
  if (overRateLimit(req, "translate", 10)) return json(429, { error: "Too many translations — wait a minute." });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return json(503, { error: "Translation is not set up here: the site has no ANTHROPIC_API_KEY." });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "Could not read the request." });
  }
  const parsed = parseTranslateRequest(body);
  if (typeof parsed === "string") return json(400, { error: parsed });

  const { system, user } = translatePrompt(parsed);
  let reply: Response;
  try {
    reply = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.TRANSLATE_MODEL || TRANSLATE_MODEL,
        max_tokens: 8000,
        system,
        messages: [{ role: "user", content: user }],
      }),
      signal: AbortSignal.timeout(60_000),
    });
  } catch {
    return json(502, { error: "Could not reach the translation service." });
  }
  if (!reply.ok) return json(502, { error: `The translation service said ${reply.status}.` });

  const data = (await reply.json()) as { content?: { type: string; text?: string }[] };
  const text = (data.content ?? []).map((c) => (c.type === "text" ? (c.text ?? "") : "")).join("");
  const code = extractCode(text);
  if (!code) return json(502, { error: "The translation came back empty." });
  return json(200, { code });
}
