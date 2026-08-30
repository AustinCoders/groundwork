import type { NextConfig } from "next";

/**
 * What this CSP can and can't do.
 *
 * The practice runner executes the reader's own JavaScript with
 * `new Function(...)` (lib/runner.ts) and previews HTML/CSS in a `srcdoc`
 * iframe that pulls React from unpkg. A srcdoc frame inherits this policy,
 * so both 'unsafe-eval' and the unpkg origin are load-bearing — remove
 * either and the editor stops running code. The theme-init script in
 * app/layout.tsx runs before hydration to avoid a flash, so script-src also
 * needs 'unsafe-inline'.
 *
 * That means script-src cannot be locked down while the in-browser runner
 * exists; this is a deliberate tradeoff, not an oversight. Everything that
 * *can* still be constrained is: no plugins, no base-tag injection, no
 * framing, no cross-origin form posts.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "connect-src 'self'",
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
  // Superseded by frame-ancestors above, kept for older browsers.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
