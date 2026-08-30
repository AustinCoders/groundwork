import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { EDGE_VOICES } from "@/lib/edge-voices";

export const runtime = "nodejs";

// Only forward whitelisted voice names into the SSML template below —
// the client should only ever send one of EDGE_VOICES, but never trust that.
const ALLOWED_VOICES = new Set(EDGE_VOICES.map((v) => v.value));

const MAX_TEXT_LENGTH = 2000;

// Azure/Edge reports word timings in 100-nanosecond ticks.
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

// SSML attribute, so it's regex-validated rather than trusted — matches
// the existing "+N%"/"-N%" shape produced by the pitch stepper in the UI.
const PITCH_PATTERN = /^[+-]\d{1,2}%$|^0%$/;

export async function POST(req: Request) {
  let body: { text?: unknown; voice?: unknown; rate?: unknown; pitch?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  const voice = typeof body.voice === "string" ? body.voice : "";
  const rate = typeof body.rate === "number" && Number.isFinite(body.rate) ? body.rate : 1;
  const pitch = typeof body.pitch === "string" && PITCH_PATTERN.test(body.pitch) ? body.pitch : "0%";

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
        } catch {
          // malformed metadata chunk — word highlighting degrades gracefully, audio is unaffected
        }
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

    const audio = Buffer.concat(audioChunks).toString("base64");
    return Response.json({ audio, words }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    tts.close();
    console.error("TTS synthesis failed:", err);
    return Response.json({ error: "Speech synthesis failed" }, { status: 502 });
  }
}
