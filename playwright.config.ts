import { defineConfig } from "@playwright/test";

const PORT = 3100;
const ORIGIN = `http://127.0.0.1:${PORT}`;
const TOUR_SEEN = JSON.stringify({ v: 1, seen: true, at: 0 });

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: ORIGIN,
    trace: "on-first-retry",
    storageState: {
      cookies: [],
      origins: [{ origin: ORIGIN, localStorage: [{ name: "groundwork:tour", value: TOUR_SEEN }] }],
    },
  },
  webServer: {
    command: `npm run start -- -p ${PORT}`,
    url: ORIGIN,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
