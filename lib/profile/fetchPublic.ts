import { cache } from "react";
import { accountConfig } from "@/lib/account/config";
import { isPlainObject } from "@/lib/storage";
import { USERNAME_PATTERN, sanitizePublicCard, type PublicCard } from "./publicCard";

export interface PublicProfile {
  username: string;
  card: PublicCard;
  at: string | null;
}

export const fetchPublicProfile = cache(async (raw: string): Promise<PublicProfile | null> => {
  const name = decodeURIComponent(raw).trim().toLowerCase();
  if (!USERNAME_PATTERN.test(name)) return null;
  const config = accountConfig();
  if (!config) return null;
  let res: Response;
  try {
    res = await fetch(`${config.url}/rest/v1/rpc/public_profile`, {
      method: "POST",
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
      next: { revalidate: 300, tags: [`public-profile:${name}`] },
      signal: AbortSignal.timeout(6000),
    });
  } catch {
    return null;
  }
  if (!res.ok) return null;
  const body: unknown = await res.json().catch(() => null);
  if (!isPlainObject(body) || body.username !== name) return null;
  const card = sanitizePublicCard(body.card);
  if (!card) return null;
  return { username: name, card, at: typeof body.at === "string" ? body.at : null };
});
