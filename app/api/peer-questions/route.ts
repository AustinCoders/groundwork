import { peerQuestions } from "@/lib/peerQuestions";

export const runtime = "nodejs";

export function GET(req: Request) {
  const topic = new URL(req.url).searchParams.get("topic") ?? "";
  const questions = peerQuestions(topic);
  if (!questions) return Response.json({ error: "Unknown topic." }, { status: 400 });
  return Response.json({ topic, questions }, { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
}
