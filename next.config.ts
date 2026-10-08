import type { NextConfig } from "next";
import { CANONICAL_ORIGIN, LEGACY_HOSTS } from "./lib/site";
import { wasmOrigins } from "./lib/wasmAssets";
import { sentryOrigin } from "./lib/errorTracking";

export const PATH_LEVEL_IDS = ["beginner", "intermediate", "advanced"];

export const PINNED_PATH_TOPIC_IDS = ["js", "react", "dsa", "system-design"];

export const PINNED_OUTLINE_TOPIC_IDS = [
  "html",
  "css",
  "nextjs",
  "nestjs",
  "typescript",
  "node",
  "docker",
  "databases",
  "testing",
  "security",
  "cloud-devops",
  "graphql",
  "redis",
  "kubernetes",
  "python",
  "java",
  "cpp",
  "rust",
  "ruby",
  "go",
  "mongodb",
  "dbms",
  "networks",
  "os",
  "ai",
];

const runtimeOrigins = wasmOrigins().join(" ");

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
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },

  async redirects() {
    const outlineIds = PINNED_OUTLINE_TOPIC_IDS.join("|");
    const pathIds = PINNED_PATH_TOPIC_IDS.join("|");
    const levelIds = PATH_LEVEL_IDS.join("|");

    return [
      ...LEGACY_HOSTS.map((host) => ({
        source: "/:path*",
        has: [{ type: "host" as const, value: host }],
        destination: `${CANONICAL_ORIGIN}/:path*`,
        permanent: true,
      })),
      {
        source: "/soon",
        has: [{ type: "query" as const, key: "topic", value: `(?<topic>${outlineIds})` }],
        destination: "/:topic",
        permanent: true,
      },
      {
        source: "/soon",
        has: [{ type: "query" as const, key: "topic", value: `(?<topic>${pathIds})` }],
        destination: "/level/:topic",
        permanent: true,
      },
      {
        source: "/soon",
        destination: "/",
        permanent: true,
      },
      {
        source: "/path",
        has: [{ type: "query" as const, key: "topic", value: `(?<topic>${outlineIds})` }],
        destination: "/:topic",
        permanent: true,
      },
      {
        source: "/path",
        has: [
          { type: "query" as const, key: "topic", value: `(?<topic>${pathIds})` },
          { type: "query" as const, key: "level", value: `(?<level>${levelIds})` },
        ],
        destination: "/path/:topic/:level",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
