import { defineConfig, devices } from "@playwright/test";

// Runs against the static export in out/ (npm run build first).
export default defineConfig({
  testDir: "e2e",
  forbidOnly: !!process.env.CI,
  use: { baseURL: "http://localhost:4173" },
  webServer: {
    command: "python3 -m http.server 4173 -d out",
    url: "http://localhost:4173",
    stderr: "ignore", // python logs every request to stderr
    reuseExistingServer: !process.env.CI,
  },
  projects: [{ name: "chromium", use: devices["Desktop Chrome"] }],
});
