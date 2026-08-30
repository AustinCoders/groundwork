/**
 * Canonical origin for absolute URLs (sitemap, OG images, canonical tags).
 * Set NEXT_PUBLIC_SITE_URL in the deploy environment; Vercel's own
 * VERCEL_PROJECT_PRODUCTION_URL is used as a fallback so previews and
 * production both resolve without extra config.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  "http://localhost:3000"
).replace(/\/$/, "");

export const SITE_NAME = "Groundwork";

export const SITE_DESCRIPTION =
  "Handwritten notes on web development — JavaScript, HTML, CSS, React, Next.js, Nest.js and more. Pick a topic, pick your level, get a reading path with practice.";
