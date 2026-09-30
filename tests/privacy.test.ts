import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CANONICAL_ORIGIN } from "@/lib/site";

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

const PRIVACY_PAGE = "app/privacy/page.tsx";

const SOURCE = /\.(ts|tsx|js|mjs|cjs)$/;

const UPSTREAMS = [
  {
    file: "app/layout.tsx",
    signal: "@vercel/analytics",
    hosts: ["va.vercel-scripts.com"],
    service: "Vercel Web Analytics",
  },
  { file: "app/layout.tsx", signal: "@vercel/speed-insights", hosts: [], service: "Vercel Speed Insights" },
  {
    file: "app/api/weather/route.ts",
    signal: "api.open-meteo.com",
    hosts: ["api.open-meteo.com"],
    service: "Open-Meteo",
  },
  { file: "app/api/tts/route.ts", signal: "msedge-tts", hosts: [], service: "Microsoft" },
  { file: "lib/wasmAssets.ts", signal: "cdn.jsdelivr.net", hosts: ["cdn.jsdelivr.net"], service: "jsDelivr" },
  { file: "app/api/joke/route.ts", signal: "v2.jokeapi.dev", hosts: ["v2.jokeapi.dev"], service: "JokeAPI" },
  { file: "instrumentation-client.ts", signal: "@sentry", hosts: [], service: "Sentry" },
];

const NOT_CALLED: Record<string, { only: string; why: string }> = {
  localhost: { only: "lib/site.ts", why: "the site's own address when it runs locally" },
  "127.0.0.1": { only: "playwright.config.ts", why: "the end-to-end test server" },
  "www.w3.org": { only: "lib/whiteboard/exporter.ts", why: "the SVG namespace, never fetched" },
  "fonts.googleapis.com": { only: "next.config.ts", why: "allowed by the CSP; next/font serves the fonts itself" },
  "fonts.gstatic.com": { only: "next.config.ts", why: "allowed by the CSP; next/font serves the fonts itself" },
};

function sources(): string[] {
  const root = readdirSync(process.cwd()).filter((file) => SOURCE.test(file) && !file.endsWith(".d.ts"));
  const nested = ["app", "components", "lib"].flatMap((dir) =>
    readdirSync(join(process.cwd(), dir), { recursive: true, encoding: "utf8" })
      .map((entry) => `${dir}/${entry}`)
      .filter((file) => SOURCE.test(file))
  );
  return [...root, ...nested];
}

function hostsInCode(): Map<string, Set<string>> {
  const found = new Map<string, Set<string>>();
  for (const file of sources()) {
    for (const match of read(file).matchAll(/\b(?:https?|wss):\/\/([a-z0-9.-]+)/gi)) {
      const host = match[1].toLowerCase();
      found.set(host, (found.get(host) ?? new Set()).add(file));
    }
  }
  return found;
}

describe("the privacy page", () => {
  it.each(UPSTREAMS)("names $service, which $file reaches through $signal", ({ file, signal, service }) => {
    expect(read(file), `${file} no longer mentions ${signal}`).toContain(signal);
    expect(read(PRIVACY_PAGE), `${PRIVACY_PAGE} does not name ${service}`).toContain(service);
  });

  it("has a row for every outside host the code names", () => {
    const hosts = hostsInCode();
    hosts.delete(new URL(CANONICAL_ORIGIN).host);
    expect(hosts.size).toBeGreaterThan(0);
    const named = new Set(UPSTREAMS.flatMap((u) => u.hosts));
    for (const [host, files] of hosts) {
      if (named.has(host)) continue;
      const allowed = NOT_CALLED[host];
      expect(allowed, `${host} appears in ${[...files].join(", ")} but has no row in this test`).toBeDefined();
      expect([...files], `${host} is meant to appear only in ${allowed.only} (${allowed.why})`).toEqual([allowed.only]);
    }
  });

  it("says who runs the site and how to reach them", () => {
    const page = read(PRIVACY_PAGE);
    expect(page).toContain("AustinCoders");
    expect(page).toContain('href="mailto:help@austincoders.com"');
  });
});
