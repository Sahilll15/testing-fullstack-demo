import { defineConfig, devices } from "@playwright/test";
import { ADMIN_KEY } from "./e2e/support/admin-key.js";

const PORT = 3100;

export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "api", testDir: "e2e/api" },
    { name: "ui", testDir: "e2e/ui", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run build && npm start",
    env: { PORT: String(PORT), ADMIN_KEY },
    url: `http://localhost:${PORT}/api/products`,
    reuseExistingServer: !process.env.CI,
  },
});
