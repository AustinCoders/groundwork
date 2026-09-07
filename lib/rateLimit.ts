interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_TRACKED = 5000;

/**
 * Per-instance limiter. Serverless spreads traffic over many instances, so this
 * is a floor rather than a guarantee — it stops one client hammering a single
 * instance, and it costs nothing. Vercel Firewall rate limiting is the
 * account-wide equivalent.
 */
export function overRateLimit(req: Request, name: string, max: number, windowMs = 60_000): boolean {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const key = `${name}:${ip}`;
  const now = Date.now();
  const seen = buckets.get(key);

  if (!seen || now > seen.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > MAX_TRACKED) {
      for (const [k, v] of buckets) if (now > v.resetAt) buckets.delete(k);
    }
    return false;
  }

  seen.count += 1;
  return seen.count > max;
}
