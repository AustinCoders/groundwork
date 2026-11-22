import type { SupabaseClient } from "@supabase/supabase-js";
import { AUTH_STORAGE_KEY, accountConfig } from "@/lib/account/config";

let pending: Promise<SupabaseClient | null> | null = null;

export function accountClient(): Promise<SupabaseClient | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  const config = accountConfig();
  if (!config) return Promise.resolve(null);
  if (!pending) {
    pending = import("@supabase/supabase-js")
      .then(({ createClient }) =>
        createClient(config.url, config.key, {
          auth: {
            flowType: "pkce",
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storageKey: AUTH_STORAGE_KEY,
          },
          global: { headers: { "x-client-info": "groundwork-web" } },
        })
      )
      .catch(() => {
        pending = null;
        return null;
      });
  }
  return pending;
}
