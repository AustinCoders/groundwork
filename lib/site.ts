export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  "http://localhost:3000"
).replace(/\/$/, "");

export const SITE_NAME = "Groundwork";

export const SITE_DESCRIPTION =
  "Handwritten notes on web development — JavaScript, HTML, CSS, React, Next.js, Nest.js and more. Pick a topic, pick your level, get a reading path with practice.";
