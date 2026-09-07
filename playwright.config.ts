import { defineConfig } from "@playwright/test";

// Port 3100 rather than 3000: another project of ours listens there, and
// reusing whatever answers on the default port silently tests the wrong app.
const PORT = 3100;

// Runs against a production build, because the things this catches — hydration
// mismatches, a CSP that blocks a script, a route that fails to prerender —
// behave differently in dev.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: `http://127.0.0.1:${PORT}`, trace: "on-first-retry" },
  webServer: {
    command: `npm run start -- -p ${PORT}`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
