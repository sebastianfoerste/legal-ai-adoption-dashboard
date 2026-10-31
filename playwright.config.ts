import { defineConfig, devices } from "@playwright/test";

// Accessibility gate (e2e/a11y.spec.ts): the built app, started with `next start`, visited at
// a desktop and a phone width. `pnpm build` first, then `pnpm test:a11y`.
const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop-1280",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } },
    },
    {
      name: "mobile-375",
      use: { ...devices["Desktop Chrome"], viewport: { width: 375, height: 800 } },
    },
  ],
  webServer: {
    command: `pnpm start -p ${PORT}`,
    url: `${baseURL}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
