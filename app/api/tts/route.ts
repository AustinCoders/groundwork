import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { EDGE_VOICES } from "@/lib/edge-voices";

export const runtime = "nodejs";

const ALLOWED_VOICES = new Set(EDGE_VOICES.map((v) => v.value));

const MAX_TEXT_LENGTH = 2000;

const TICKS_PER_SECOND = 10_000_000;

function escapeSSML(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

interface WordEvent {
  offset: number;
  duration: number;
  text: string;
}

const PITCH_PATTERN = /^[+-]\d{1,2}%$|^0%$/;

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 40;
const hits = new Map<string, { count: number; resetAt: number }>();

/**
 * Per-instance limiter. Serverless spreads traffic over many instances, so this
 * is a floor rather than a guarantee — it stops one client hammering a single
 * instance. Vercel Firewall rate limiting is the account-wide equivalent.
 */
function overRateLimit(req: Request): boolean {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const now = Date.now();
  const seen = hits.get(ip);
  if (!seen || now > seen.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    if (hits.size > 5000) for (const [key, v] of hits) if (now > v.resetAt) hits.delete(key);
    return false;
  }
  seen.count += 1;
  return seen.count > RATE_LIMIT_MAX;
}

/** [offset ms, duration ms, text] — a third the size of the object form. */
type CompactWord = [number, number, string];

async function synthesise(
  text: string,
  voice: string,
  rate: number,
  pitch: string,
  cacheable: boolean
): Promise<Response> {
  if (!text) return Response.json({ error: "Missing text" }, { status: 400 });
  if (text.length > MAX_TEXT_LENGTH) return Response.json({ error: "Text too long" }, { status: 413 });
  if (!ALLOWED_VOICES.has(voice)) return Response.json({ error: "Unknown voice" }, { status: 400 });

  const clampedRate = Math.min(2, Math.max(0.5, rate));

  const tts = new MsEdgeTTS();
  try {
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3, { wordBoundaryEnabled: true });
    const { audioStream, metadataStream } = tts.toStream(escapeSSML(text), { rate: clampedRate, pitch });

    const audioChunks: Buffer[] = [];
    const words: WordEvent[] = [];

    await new Promise<void>((resolve, reject) => {
      let audioDone = false;
      let metaDone = !metadataStream;
      const maybeResolve = () => {
        if (audioDone && metaDone) resolve();
      };

      audioStream.on("data", (chunk: Buffer) => audioChunks.push(chunk));
      audioStream.once("error", reject);
      audioStream.once("close", () => {
        audioDone = true;
        maybeResolve();
      });

      metadataStream?.on("data", (chunk: Buffer) => {
        try {
          const parsed = JSON.parse(chunk.toString());
          for (const item of parsed.Metadata || []) {
            if (item.Type === "WordBoundary") {
              words.push({
                offset: item.Data.Offset / TICKS_PER_SECOND,
                duration: item.Data.Duration / TICKS_PER_SECOND,
                text: item.Data.text.Text,
              });
            }
          }
        } catch {}
      });
      metadataStream?.once("error", () => {
        metaDone = true;
        maybeResolve();
      });
      metadataStream?.once("close", () => {
        metaDone = true;
        maybeResolve();
      });
    });

    tts.close();

    const mp3 = Buffer.concat(audioChunks);
    // Same text, voice, rate and pitch always synthesise to the same audio, so
    // let the CDN answer every repeat of it. A chapter narrated by a thousand
    // readers is one synthesis, not a thousand.
    const cacheControl = cacheable
      ? "public, max-age=3600, s-maxage=31536000, stale-while-revalidate=86400"
      : "no-store";

    if (!cacheable) {
      // The POST shape older clients still expect.
      return Response.json({ audio: mp3.toString("base64"), words }, { headers: { "Cache-Control": cacheControl } });
    }

    // Binary body rather than base64 in JSON: a 700-character chunk is 280 KB
    // of mp3 and was leaving here as 373 KB of text. Timings ride along in a
    // header, compacted to tuples — 3 KB rather than 7.
    const compact: CompactWord[] = words.map((w) => [
      Math.round(w.offset * 1000),
      Math.round(w.duration * 1000),
      w.text,
    ]);
    return new Response(new Uint8Array(mp3), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": cacheControl,
        "X-Word-Timings": Buffer.from(JSON.stringify(compact)).toString("base64"),
      },
    });
  } catch (err) {
    tts.close();
    console.error("TTS synthesis failed:", err);
    return Response.json({ error: "Speech synthesis failed" }, { status: 502 });
  }
}

export async function GET(req: Request) {
  if (overRateLimit(req)) return Response.json({ error: "Too many requests" }, { status: 429 });

  const { searchParams } = new URL(req.url);
  const rawRate = Number(searchParams.get("rate"));
  const pitchParam = searchParams.get("pitch") || "";

  return synthesise(
    (searchParams.get("text") || "").trim(),
    searchParams.get("voice") || "",
    Number.isFinite(rawRate) && rawRate > 0 ? rawRate : 1,
    PITCH_PATTERN.test(pitchParam) ? pitchParam : "0%",
    true
  );
}

export async function POST(req: Request) {
  if (overRateLimit(req)) return Response.json({ error: "Too many requests" }, { status: 429 });

  let body: { text?: unknown; voice?: unknown; rate?: unknown; pitch?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  return synthesise(
    typeof body.text === "string" ? body.text.trim() : "",
    typeof body.voice === "string" ? body.voice : "",
    typeof body.rate === "number" && Number.isFinite(body.rate) ? body.rate : 1,
    typeof body.pitch === "string" && PITCH_PATTERN.test(body.pitch) ? body.pitch : "0%",
    false
  );
}
