import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

interface Job {
  endpoint: string;
  p256dh: string;
  auth: string;
  title: string;
  body: string;
  url: string;
  tag: string;
}

const env = (name: string): string => Deno.env.get(name) ?? "";

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Use POST", { status: 405 });
  const db = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });
  const { data: config, error: configError } = await db.rpc("push_config");
  const keys = (config ?? {}) as Partial<Record<"tick" | "public" | "private" | "subject", string>>;
  if (configError || !keys.tick || req.headers.get("x-push-secret") !== keys.tick) {
    return new Response("Forbidden", { status: 403 });
  }
  if (!keys.public || !keys.private) return new Response("Push keys missing", { status: 500 });
  webpush.setVapidDetails(keys.subject ?? "mailto:help@austincoders.com", keys.public, keys.private);

  const { data, error } = await db.rpc("push_jobs");
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  const jobs = (Array.isArray(data) ? data : []) as Job[];

  const gone: string[] = [];
  const failed: string[] = [];
  let sent = 0;
  await Promise.all(
    jobs.map(async (job) => {
      try {
        await webpush.sendNotification(
          { endpoint: job.endpoint, keys: { p256dh: job.p256dh, auth: job.auth } },
          JSON.stringify({ title: job.title, body: job.body, url: job.url, tag: job.tag }),
          { TTL: 1800, urgency: "high" }
        );
        sent++;
      } catch (err) {
        const code = (err as { statusCode?: number }).statusCode ?? 0;
        if (code === 404 || code === 410) gone.push(job.endpoint);
        else failed.push(job.endpoint);
      }
    })
  );
  if (gone.length) await db.rpc("push_dead", { endpoints: gone, gone: true });
  if (failed.length) await db.rpc("push_dead", { endpoints: failed, gone: false });

  return new Response(JSON.stringify({ jobs: jobs.length, sent, gone: gone.length, failed: failed.length }), {
    headers: { "content-type": "application/json" },
  });
});
