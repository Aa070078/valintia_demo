import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/auth",
  timeout: 45_000,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    browserName: "chromium",
    channel:
      process.env.PLAYWRIGHT_CHANNEL ||
      (process.platform === "win32" ? "msedge" : undefined),
    headless: true,
    trace: "off",
    screenshot: "off",
  },
})
