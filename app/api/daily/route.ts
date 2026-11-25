import { dailyFor } from "@/lib/profile/daily";
import { dailyPool } from "@/lib/profile/dailyPool";

export const runtime = "nodejs";

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const POOL = dailyPool();

export function GET(req: Request) {
  const day = new URL(req.url).searchParams.get("day") ?? "";
  if (!DAY.test(day)) return Response.json({ error: "Send the day as YYYY-MM-DD." }, { status: 400 });
  const [y, m, d] = day.split("-").map(Number);
  const asked = Date.UTC(y, m - 1, d);
  if (Number.isNaN(asked) || Math.abs(asked - Date.now()) > 3 * 86_400_000) {
    return Response.json({ error: "That day is too far away." }, { status: 400 });
  }
  const pick = dailyFor(day, POOL);
  if (!pick) return Response.json({ error: "No problems yet." }, { status: 404 });
  return Response.json({ day, ...pick }, { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
}
