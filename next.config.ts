import type { NextConfig } from "next";
import { CANONICAL_ORIGIN, LEGACY_HOSTS } from "./lib/site";
import { wasmOrigins } from "./lib/wasmAssets";
import { sentryOrigin } from "./lib/errorTracking";

// Pyodide and sql.js are fetched from a CDN rather than shipped in the
// deployment, so their origin has to be allowed for both the module scripts and
// the .wasm and data files those scripts then fetch. Self-hosting them again
// (NEXT_PUBLIC_PYODIDE_BASE) narrows this back to 'self' on its own.
const runtimeOrigins = wasmOrigins().join(" ");

// Empty unless NEXT_PUBLIC_SENTRY_DSN is set, so a deployment without error
// tracking does not advertise a host it never talks to.
const reportingOrigin = sentryOrigin() || "";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com ${runtimeOrigins}`.trim(),
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  `connect-src 'self' ${runtimeOrigins} ${reportingOrigin}`.trim().replace(/\s+/g, " "),
  "frame-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },

  async redirects() {
    return LEGACY_HOSTS.map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: `${CANONICAL_ORIGIN}/:path*`,
      permanent: true,
    }));
  },
};

export default nextConfig;
